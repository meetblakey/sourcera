import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";

import { resolveProductionDecisionAuthority } from "../../scripts/lib/production-decision-authority.js";
import {
  readProductionReleaseConfig,
  type ProductionReleaseConfig,
} from "../../scripts/lib/production-release-config.js";

const DECISION = /\bDEC-PROD-\d{3}\b/g;
const TEXT_EXTENSIONS = new Set([
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const SCAN_ROOTS = [
  ".github/workflows",
  "config",
  "docs/runbooks",
  "scripts",
] as const;
const SCAN_FILES = [
  "package.json",
  "Sourcera_Master_Spec.md",
] as const;
const NATIVE_AUTHORITY_PRODUCER =
  "scripts/lib/production-decision-authority.ts";
const RETIRED_DISPATCH_PATHS = [
  ".github/workflows/production-bootstrap-recovery.yml",
  ".github/workflows/vercel-production-baseline.yml",
  "scripts/activate-vercel-production-baseline.ts",
  "scripts/bootstrap-convex-production.ts",
  "scripts/production-release-blocked.ts",
  "scripts/production-release-github.ts",
  "scripts/release-production.ts",
  "scripts/stage-vercel-production-baseline.ts",
  "scripts/vercel-production-baseline-github.ts",
] as const;
const RETIRED_MUTATION_ENTRYPOINTS = [
  "scripts/deploy-convex-production.ts",
  "scripts/rollback-convex-production.ts",
  "scripts/stage-vercel-production.ts",
] as const;
const RETIRED_PACKAGE_SCRIPTS = new Set([
  "convex:bootstrap:production",
  "release:production",
  "release:production:blocked",
  "release:production:github",
  "release:vercel-baseline:github",
  "vercel:baseline:activate",
  "vercel:baseline:stage",
]);
const RETIRED_MUTATION_PACKAGE_SCRIPTS = new Set([
  "convex:deploy:production",
  "convex:rollback:production",
  "vercel:stage:production",
]);
const DORMANT_PROVIDER_MUTATION_LIBRARY =
  /(?:convex-production-bootstrap|convex-production-deployment|vercel-production-release)/;

type DecisionRow = {
  id?: unknown;
  status?: unknown;
};

export type ProductionDecisionLineageReport = {
  activeDecision: string;
  nativeDecisionAuthority: {
    status: "pending_guarded_handoff";
  };
  scannedFiles: number;
  workflowLineage: Array<{
    authorityKind: "normal";
    path: string;
    sha256: string;
  }>;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(filePath: string, context: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`${context} is invalid JSON`);
  }
}

function activeProductionDecision(root: string) {
  const ledgerPath = path.join(root, "delivery/decisions.jsonl");
  if (!existsSync(ledgerPath)) {
    throw new Error("production decision ledger is missing");
  }
  const raw = readFileSync(ledgerPath, "utf8");
  const rows = raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line) as DecisionRow;
      } catch {
        throw new Error(`decision ledger line ${index + 1} is invalid JSON`);
      }
    })
    .filter(
      (row): row is DecisionRow & { id: string } =>
        typeof row.id === "string" && /^DEC-PROD-\d{3}$/.test(row.id),
    );
  const active = rows.filter((row) => row.status === "active");
  if (active.length !== 1) {
    throw new Error("production decision ledger must contain exactly one active decision");
  }
  for (const row of rows) {
    if (row !== active[0] && row.status !== "superseded") {
      throw new Error(`${row.id} must be active or superseded`);
    }
  }
  return { id: active[0]!.id, ledgerSha256: sha256(raw) };
}

function listTextFiles(root: string, relativePath: string): string[] {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return [];
  if (!statSync(absolutePath).isDirectory()) {
    return TEXT_EXTENSIONS.has(path.extname(relativePath)) ? [relativePath] : [];
  }
  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relativePath, entry.name);
    if (entry.isDirectory()) return listTextFiles(root, child);
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [child] : [];
  });
}

function assertOperationalDecisionReferences(root: string) {
  const files = [
    ...SCAN_ROOTS.flatMap((relativePath) => listTextFiles(root, relativePath)),
    ...SCAN_FILES.filter((relativePath) => existsSync(path.join(root, relativePath))),
  ];
  for (const relativePath of files) {
    const value = readFileSync(path.join(root, relativePath), "utf8");
    if (
      relativePath !== "config/production-release.json" &&
      relativePath !== NATIVE_AUTHORITY_PRODUCER &&
      DECISION.test(value)
    ) {
      DECISION.lastIndex = 0;
      throw new Error(
        `${relativePath} copies production Decision source provenance`,
      );
    }
    DECISION.lastIndex = 0;
  }
  return files.length;
}

function assertRetiredDispatchesAbsent(root: string) {
  for (const relativePath of RETIRED_DISPATCH_PATHS) {
    if (existsSync(path.join(root, relativePath))) {
      throw new Error(`retired production dispatch exists: ${relativePath}`);
    }
  }
  for (const relativePath of RETIRED_MUTATION_ENTRYPOINTS) {
    if (existsSync(path.join(root, relativePath))) {
      throw new Error(
        `retired production mutation entrypoint exists: ${relativePath}`,
      );
    }
  }
  const packageJson = readJson(path.join(root, "package.json"), "package.json") as {
    scripts?: Record<string, unknown>;
  };
  for (const script of Object.keys(packageJson.scripts ?? {})) {
    if (RETIRED_PACKAGE_SCRIPTS.has(script)) {
      throw new Error(`retired production package script exists: ${script}`);
    }
    if (RETIRED_MUTATION_PACKAGE_SCRIPTS.has(script)) {
      throw new Error(
        `retired production mutation package script exists: ${script}`,
      );
    }
  }
}

function assertProviderMutationLibrariesUnreachable(root: string) {
  const scriptsRoot = path.join(root, "scripts");
  if (existsSync(scriptsRoot)) {
    for (const entry of readdirSync(scriptsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !TEXT_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }
      const relativePath = path.posix.join("scripts", entry.name);
      if (
        DORMANT_PROVIDER_MUTATION_LIBRARY.test(
          readFileSync(path.join(root, relativePath), "utf8"),
        )
      ) {
        throw new Error(
          `provider mutation library is reachable from ${relativePath}`,
        );
      }
    }
  }
  for (const relativePath of [".github/workflows", "package.json"]) {
    for (const file of listTextFiles(root, relativePath)) {
      if (
        DORMANT_PROVIDER_MUTATION_LIBRARY.test(
          readFileSync(path.join(root, file), "utf8"),
        )
      ) {
        throw new Error(`provider mutation library is reachable from ${file}`);
      }
    }
  }
}

function productionControl(
  root: string,
  activeDecision: ReturnType<typeof activeProductionDecision>,
) {
  const configPath = path.join(root, "config/production-release.json");
  let config: ProductionReleaseConfig;
  try {
    config = readProductionReleaseConfig(
      readJson(configPath, "production release config"),
    );
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "production release config is invalid",
    );
  }
  const provenance = config.productionControl.sourceProvenance;
  if (
    provenance.decisionId !== activeDecision.id ||
    provenance.decisionLedgerSha256 !== activeDecision.ledgerSha256
  ) {
    throw new Error("production release config source provenance has drifted");
  }
  const resolved = resolveProductionDecisionAuthority(
    root,
    config.productionControl,
  );
  const nativeDecisionAuthority: ProductionDecisionLineageReport["nativeDecisionAuthority"] = {
    status: "pending_guarded_handoff",
  };
  return { config, nativeDecisionAuthority };
}

function workflowLineage(root: string, config: ProductionReleaseConfig) {
  const github = config.github;
  if (
    !Array.isArray(github.authorityWorkflowLineage) ||
    github.authorityWorkflowLineage.length !== 1
  ) {
    throw new Error("production release config workflow authority is invalid");
  }
  const [entry] = github.authorityWorkflowLineage;
  if (
    entry?.authorityKind !== "normal" ||
    typeof entry.path !== "string" ||
    entry.path !== github.workflow ||
    typeof entry.workflowSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(entry.workflowSha256)
  ) {
    throw new Error("production release config workflow lineage is invalid");
  }
  const normalized = path.posix.normalize(entry.path);
  if (
    normalized !== entry.path ||
    !normalized.startsWith(".github/workflows/") ||
    normalized.includes("..")
  ) {
    throw new Error("production release workflow path is invalid");
  }
  const workflowPath = path.join(root, normalized);
  if (!existsSync(workflowPath)) {
    throw new Error("production release workflow is missing");
  }
  const actual = sha256(readFileSync(workflowPath, "utf8"));
  if (actual !== entry.workflowSha256) {
    throw new Error(`workflow digest mismatch for ${entry.path}`);
  }
  return [
    {
      authorityKind: "normal" as const,
      path: entry.path,
      sha256: entry.workflowSha256,
    },
  ];
}

export function verifyProductionDecisionLineage(
  root: string,
): ProductionDecisionLineageReport {
  const repositoryRoot = path.resolve(root);
  const activeDecision = activeProductionDecision(repositoryRoot);
  assertRetiredDispatchesAbsent(repositoryRoot);
  assertProviderMutationLibrariesUnreachable(repositoryRoot);
  const control = productionControl(repositoryRoot, activeDecision);
  const lineage = workflowLineage(repositoryRoot, control.config);
  const scannedFiles = assertOperationalDecisionReferences(repositoryRoot);
  return {
    activeDecision: activeDecision.id,
    nativeDecisionAuthority: control.nativeDecisionAuthority,
    scannedFiles,
    workflowLineage: lineage,
  };
}

if (process.argv[1]?.endsWith("production-decision-lineage.ts")) {
  try {
    const report = verifyProductionDecisionLineage(process.cwd());
    process.stdout.write(`${JSON.stringify({ passed: true, ...report }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "production decision lineage failed"}\n`,
    );
    process.exitCode = 1;
  }
}
