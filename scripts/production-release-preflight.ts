import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createProductionPreflightReceipt,
  productionPreflightEvidenceFiles,
  readProductionWorkflowIdentity,
  type ProductionPreflightEvidence,
} from "./lib/production-release-workflow";
import { collectProductionRepositoryEvidence } from "./lib/production-repository-evidence";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const FORBIDDEN_CREDENTIALS = [
  "CONVEX_DEPLOY_KEY",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "SOURCERA_CONVEX_CANARY_SECRET",
  "SOURCERA_RELEASE_GITHUB_TOKEN",
  "VERCEL_TOKEN",
] as const;
const SAFE_ENVIRONMENT_KEYS = [
  "CI",
  "FORCE_COLOR",
  "HOME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "NODE_EXTRA_CA_CERTS",
  "NO_COLOR",
  "PATH",
  "SHELL",
  "SSL_CERT_DIR",
  "SSL_CERT_FILE",
  "TEMP",
  "TERM",
  "TMP",
  "TMPDIR",
  "TZ",
] as const;
const MAX_FAILURE_TEXT = 16_384;

function bounded(value: unknown) {
  const text = typeof value === "string" ? value : String(value ?? "");
  return text.length <= MAX_FAILURE_TEXT
    ? text
    : `${text.slice(0, MAX_FAILURE_TEXT)}…`;
}

function requiredEnvironment(key: string) {
  const value = process.env[key];
  if (!value?.trim() || value !== value.trim()) {
    throw new Error(`${key} is required for production preflight`);
  }
  return value;
}

function outsideRepository(value: string) {
  let ancestor = path.resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  const output = path.join(realpathSync(ancestor), ...missing);
  const relative = path.relative(repositoryRoot, output);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("--out-dir must remain outside the repository");
  }
  return output;
}

function readArguments(arguments_: string[]) {
  if (
    arguments_.length !== 2 ||
    arguments_[0] !== "--out-dir" ||
    !arguments_[1]?.trim() ||
    arguments_[1]!.startsWith("--")
  ) {
    throw new Error("Usage: production-release-preflight --out-dir <path>");
  }
  const outputDirectory = outsideRepository(arguments_[1]);
  if (existsSync(outputDirectory)) {
    throw new Error("--out-dir must not already exist");
  }
  return outputDirectory;
}

function safeEnvironment() {
  for (const key of FORBIDDEN_CREDENTIALS) {
    if (process.env[key] !== undefined) {
      throw new Error(`production preflight forbids ${key}`);
    }
  }
  const environment: NodeJS.ProcessEnv = { NODE_ENV: "production" };
  for (const key of SAFE_ENVIRONMENT_KEYS) {
    if (process.env[key] !== undefined) environment[key] = process.env[key];
  }
  return environment;
}

function run(
  command: string,
  arguments_: string[],
  environment: NodeJS.ProcessEnv,
) {
  const result = spawnSync(command, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    error: result.error?.message,
    exitCode: result.status ?? 1,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
}

function commandProof(result: ReturnType<typeof run>) {
  return JSON.stringify({
    exitCode: result.exitCode,
    outcome: result.exitCode === 0 && !result.error ? "pass" : "fail",
    stderr: bounded(result.stderr),
    stdout: bounded(result.stdout),
  });
}

export function createProductionJsonProof(
  result: ReturnType<typeof run>,
  context: string,
) {
  if (result.exitCode === 0 && !result.error && result.stdout.trim()) {
    try {
      JSON.parse(result.stdout);
      return result.stdout;
    } catch {
      // Fall through to a bounded failure proof.
    }
  }
  return JSON.stringify({
    context,
    error: result.error ? bounded(result.error) : null,
    exitCode: result.exitCode,
    outcome: "fail",
    stderr: bounded(result.stderr),
  });
}

function repositoryProof(
  approvedSha: string,
  dispatchRef: string,
  environment: NodeJS.ProcessEnv,
) {
  return JSON.stringify(
    collectProductionRepositoryEvidence({
      approvedSha,
      dispatchRef,
      environment,
      includeUntracked: false,
      repositoryRoot,
    }),
  );
}

export async function main(arguments_ = process.argv.slice(2)) {
  const outputDirectory = readArguments(arguments_);
  const identity = readProductionWorkflowIdentity({
    approvedSha: requiredEnvironment("SOURCERA_RELEASE_APPROVED_SHA"),
    repository: requiredEnvironment("GITHUB_REPOSITORY"),
    runAttempt: Number(requiredEnvironment("GITHUB_RUN_ATTEMPT")),
    runId: Number(requiredEnvironment("GITHUB_RUN_ID")),
  });
  const environment = safeEnvironment();
  const repository = repositoryProof(
    identity.approvedSha,
    requiredEnvironment("GITHUB_REF"),
    environment,
  );
  const appVerification = commandProof(
    run("npm", ["run", "verify"], environment),
  );
  const tsx = path.join(
    repositoryRoot,
    "tools",
    "spec-lint",
    "node_modules",
    ".bin",
    "tsx",
  );
  const stampResult = run(
    tsx,
    ["tools/release/stamp_gate.ts", "--json"],
    environment,
  );
  const exactResult = run(
    tsx,
    ["tools/release/exact_status_scan.ts", "--json"],
    environment,
  );
  const temporaryEvidenceDirectory = path.join(
    path.dirname(outputDirectory),
    `.preflight-evidence-${identity.runId}-${identity.runAttempt}`,
  );
  if (existsSync(temporaryEvidenceDirectory)) {
    throw new Error("temporary preflight evidence path already exists");
  }
  await mkdir(temporaryEvidenceDirectory, { mode: 0o700 });
  const stampPath = path.join(temporaryEvidenceDirectory, "stamp.json");
  const exactPath = path.join(temporaryEvidenceDirectory, "exact.json");
  const stamp = createProductionJsonProof(stampResult, "stamp gate");
  const exact = createProductionJsonProof(exactResult, "exact status scan");
  await writeFile(stampPath, stamp, { flag: "wx", mode: 0o600 });
  await writeFile(exactPath, exact, { flag: "wx", mode: 0o600 });
  const delivery = commandProof(
    run(
      tsx,
      [
        "tools/delivery/verify.ts",
        "--stamp",
        stampPath,
        "--exact",
        exactPath,
        "--feature-dependencies",
        "delivery/feature-dependencies.json",
        "--policy",
        "delivery/release-policy.json",
        "--release-plan",
        "delivery/release-plan.json",
        "--roadmap",
        "delivery/roadmap-contract.json",
        "--linear-project-scope",
        "delivery/linear-project-scope.json",
      ],
      environment,
    ),
  );
  const evidence: ProductionPreflightEvidence = {
    appVerification,
    delivery,
    exact,
    repository,
    stamp,
  };
  const receipt = createProductionPreflightReceipt({ evidence, identity });
  await mkdir(outputDirectory, { mode: 0o700 });
  for (const [name, fileName] of Object.entries(
    productionPreflightEvidenceFiles,
  )) {
    await writeFile(
      path.join(outputDirectory, fileName),
      evidence[name as keyof ProductionPreflightEvidence],
      { flag: "wx", mode: 0o600 },
    );
  }
  await writeFile(
    path.join(outputDirectory, "production-preflight.json"),
    `${JSON.stringify(receipt, null, 2)}\n`,
    { flag: "wx", mode: 0o600 },
  );
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "production preflight failed"}\n`,
    );
    process.exitCode = 1;
  });
}
