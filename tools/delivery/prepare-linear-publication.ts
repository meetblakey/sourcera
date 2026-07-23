#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import {
  assertLinearCandidateReceipt,
  exactLinearRunSource,
  sha256,
  type LinearRunSource,
} from "./lib/linear-candidate-receipt.js";
import {
  linearCandidateFindings,
  type LinearSnapshotCandidate,
} from "./lib/linear-candidate.js";
import type { LinearFingerprint } from "./lib/linear-live.js";
import {
  assertLinearPlanningContractFingerprints,
} from "./lib/linear-live.js";
import {
  assertFreshLinearCapture,
  assertLinearArtifactDigest,
  assertLinearPromotionHead,
  canonicalLinearRunSource,
} from "./lib/linear-promotion.js";
import {
  assertLinearPlanningSourceFingerprints,
  assertLinearProgramScope,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import type { ReleaseDefinition } from "./lib/model.js";
import { assertCompleteLinearFingerprint } from "./linear-fingerprint-overlay.js";

interface CaptureReceipt {
  schemaVersion: 1;
  capturedAt: string;
  fingerprintSha256: string;
  source: LinearRunSource;
}

interface PublicationCandidate extends LinearSnapshotCandidate {
  generatedAt: string;
  linearCapture: CaptureReceipt;
  linearFingerprint: LinearFingerprint;
}

const REPORTS = [
  "delivery-manifest.json",
  "traceability-map.json",
  "dependency-graph.json",
  "readiness-report.json",
  "drift-report.json",
  "release-scorecard.json",
  "journey-readiness.json",
] as const;

const ALLOWED = new Set([
  "--snapshot",
  "--handoff",
  "--fingerprint",
  "--capture-receipt",
  "--candidate-receipt",
  "--linear-project-scope",
  "--linear-program-scope",
  "--source-policy",
  "--inventory",
  "--source-checksums",
  "--dispositions",
  "--stamp",
  "--exact",
  "--runtime-dependencies",
  "--releases",
  "--release-policy",
  "--feature-dependencies",
  "--roadmap",
  "--out",
]);

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name || !ALLOWED.has(name) || !value || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`${name} is required`);
  return resolve(value);
}

function regularFile(path: string, label: string): void {
  const node = lstatSync(path);
  if (!node.isFile() || node.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

function runTool(root: string, label: string, arguments_: string[]): void {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      join(root, "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
      ...arguments_,
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      `${label} failed:\n${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
}

function copyAttestation(source: string, target: string): void {
  copyFileSync(source, target);
}

export function exactPublicationFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error("Publication package cannot contain symlinks");
      }
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile()) {
        files.push(relative(root, absolute));
      } else {
        throw new Error("Publication package contains a non-file entry");
      }
    }
  };
  visit(root);
  return files.sort();
}

export function main(): void {
  const values = argumentsByName();
  const paths = {
    snapshot: required(values, "--snapshot"),
    handoff: required(values, "--handoff"),
    fingerprint: required(values, "--fingerprint"),
    captureReceipt: required(values, "--capture-receipt"),
    candidateReceipt: required(values, "--candidate-receipt"),
    projectScope: required(values, "--linear-project-scope"),
    programScope: required(values, "--linear-program-scope"),
    sourcePolicy: required(values, "--source-policy"),
    inventory: required(values, "--inventory"),
    sourceChecksums: required(values, "--source-checksums"),
    dispositions: required(values, "--dispositions"),
    stamp: required(values, "--stamp"),
    exact: required(values, "--exact"),
    runtimeDependencies: required(values, "--runtime-dependencies"),
    releases: required(values, "--releases"),
    releasePolicy: required(values, "--release-policy"),
    featureDependencies: required(values, "--feature-dependencies"),
    roadmap: required(values, "--roadmap"),
    out: required(values, "--out"),
  };
  for (const [label, path] of Object.entries(paths)) {
    if (label !== "out") regularFile(path, label);
  }

  const repositoryRoot = realpathSync(
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim(),
  );
  const canonicalSnapshot = realpathSync(paths.snapshot);
  if (
    relative(repositoryRoot, canonicalSnapshot) !==
      join("delivery", "linear-snapshot.json")
  ) {
    throw new Error("Publication baseline must be delivery/linear-snapshot.json");
  }
  const canonicalOut = join(realpathSync(dirname(paths.out)), basename(paths.out));
  const relativeOut = relative(repositoryRoot, canonicalOut);
  if (relativeOut === "" || !relativeOut.startsWith("..")) {
    throw new Error("Publication output must remain outside the repository");
  }

  const source = canonicalLinearRunSource();
  assertLinearPromotionHead(
    source,
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
  );
  const artifactDigest = assertLinearArtifactDigest(
    process.env.LINEAR_HANDOFF_ARTIFACT_DIGEST ?? "",
  );

  const snapshotJson = readFileSync(paths.snapshot, "utf8");
  const candidateJson = readFileSync(paths.handoff, "utf8");
  const fingerprintJson = readFileSync(paths.fingerprint, "utf8");
  const captureReceiptJson = readFileSync(paths.captureReceipt, "utf8");
  const candidateReceiptJson = readFileSync(paths.candidateReceipt, "utf8");
  const projectScopeJson = readFileSync(paths.projectScope, "utf8");
  const programScopeJson = readFileSync(paths.programScope, "utf8");
  const sourcePolicyJson = readFileSync(paths.sourcePolicy, "utf8");
  const inventoryJson = readFileSync(paths.inventory, "utf8");
  const sourceChecksumContractJson = readFileSync(paths.sourceChecksums, "utf8");
  const dispositionsJson = readFileSync(paths.dispositions, "utf8");
  const runtimeStampJson = readFileSync(paths.stamp, "utf8");
  const exactStatusJson = readFileSync(paths.exact, "utf8");
  const runtimeDependencyContractJson = readFileSync(
    paths.runtimeDependencies,
    "utf8",
  );
  const releaseDefinitionsJson = readFileSync(paths.releases, "utf8");

  const captureReceipt = JSON.parse(captureReceiptJson) as CaptureReceipt;
  if (
    captureReceipt.schemaVersion !== 1 ||
    captureReceipt.fingerprintSha256 !== sha256(fingerprintJson) ||
    !exactLinearRunSource(captureReceipt.source, source)
  ) {
    throw new Error("Linear capture receipt is invalid for publication");
  }
  assertFreshLinearCapture(captureReceipt.capturedAt);
  assertLinearCandidateReceipt(JSON.parse(candidateReceiptJson), {
    candidateJson,
    baselineSnapshotJson: snapshotJson,
    fingerprintJson,
    captureReceiptJson,
    projectScopeJson,
    programScopeJson,
    sourcePolicyJson,
    inventoryJson,
    sourceChecksumContractJson,
    dispositionsJson,
    runtimeStampJson,
    runtimeDependencyContractJson,
    releaseDefinitionsJson,
    createdAt: captureReceipt.capturedAt,
    source,
  });

  const candidate = JSON.parse(candidateJson) as PublicationCandidate;
  const fingerprint = JSON.parse(fingerprintJson) as LinearFingerprint;
  if (
    candidate.generatedAt !== captureReceipt.capturedAt ||
    JSON.stringify(candidate.linearCapture) !== JSON.stringify(captureReceipt) ||
    JSON.stringify(candidate.linearFingerprint) !== JSON.stringify(fingerprint)
  ) {
    throw new Error("Linear handoff is not bound to its current capture");
  }
  assertCompleteLinearFingerprint(fingerprint);
  const projectScope = JSON.parse(projectScopeJson) as LinearProjectScope;
  const programScope = JSON.parse(programScopeJson) as LinearProgramScope;
  assertLinearProjectScope(projectScope, fingerprint.projects);
  if (!fingerprint.program) throw new Error("Linear handoff lacks program topology");
  assertLinearProgramScope(programScope, fingerprint.program);
  assertLinearPlanningContractFingerprints(programScope, fingerprint);
  assertLinearPlanningSourceFingerprints(programScope, fingerprint.program, {
    masterSpecSha256: createHash("sha256")
      .update(readFileSync(join(repositoryRoot, "Sourcera_Master_Spec.md")))
      .digest("hex"),
    uxDesignSha256: createHash("sha256")
      .update(readFileSync(join(repositoryRoot, "UX_Design_of_Sourcera.md")))
      .digest("hex"),
  });
  const releaseDocument = JSON.parse(releaseDefinitionsJson) as {
    releases?: ReleaseDefinition[];
  };
  const findings = linearCandidateFindings(
    candidate,
    releaseDocument.releases ?? [],
  );
  if (findings.length) {
    throw new Error(
      findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n"),
    );
  }

  mkdirSync(canonicalOut, { mode: 0o700 });
  const deliveryOut = join(canonicalOut, "delivery");
  const reportsOut = join(canonicalOut, "reports", "delivery");
  const attestationOut = join(canonicalOut, "attestation");
  mkdirSync(deliveryOut, { mode: 0o700 });
  mkdirSync(join(canonicalOut, "reports"), { mode: 0o700 });
  mkdirSync(reportsOut, { mode: 0o700 });
  mkdirSync(attestationOut, { mode: 0o700 });
  const publishedSnapshot = join(deliveryOut, "linear-snapshot.json");
  const publishedReleasePlan = join(deliveryOut, "release-plan.json");
  copyFileSync(paths.handoff, publishedSnapshot);

  const loader = join(
    repositoryRoot,
    "tools/spec-lint/node_modules/tsx/dist/loader.mjs",
  );
  if (!readFileSync(loader, "utf8").length) {
    throw new Error("Delivery TypeScript loader is unavailable");
  }
  runTool(repositoryRoot, "Release-plan regeneration", [
    join(repositoryRoot, "tools/delivery/build-release-plan.ts"),
    "--root",
    repositoryRoot,
    "--linear",
    publishedSnapshot,
    "--linear-project-scope",
    paths.projectScope,
    "--linear-program-scope",
    paths.programScope,
    "--inventory",
    paths.inventory,
    "--dispositions",
    paths.dispositions,
    "--feature-dependencies",
    paths.featureDependencies,
    "--stamp",
    paths.stamp,
    "--runtime-dependencies",
    paths.runtimeDependencies,
    "--releases",
    paths.releases,
    "--policy",
    paths.releasePolicy,
    "--out",
    publishedReleasePlan,
  ]);
  runTool(repositoryRoot, "Delivery-report regeneration", [
    join(repositoryRoot, "tools/delivery/generate.ts"),
    "--root",
    repositoryRoot,
    "--linear",
    publishedSnapshot,
    "--linear-project-scope",
    paths.projectScope,
    "--inventory",
    paths.inventory,
    "--dispositions",
    paths.dispositions,
    "--feature-dependencies",
    paths.featureDependencies,
    "--stamp",
    paths.stamp,
    "--exact",
    paths.exact,
    "--runtime-dependencies",
    paths.runtimeDependencies,
    "--releases",
    paths.releases,
    "--policy",
    paths.releasePolicy,
    "--release-plan",
    publishedReleasePlan,
    "--roadmap",
    paths.roadmap,
    "--out",
    reportsOut,
  ]);
  for (const report of REPORTS) regularFile(join(reportsOut, report), report);
  runTool(repositoryRoot, "Publication bundle verification", [
    join(repositoryRoot, "tools/delivery/verify.ts"),
    "--root",
    repositoryRoot,
    "--linear",
    publishedSnapshot,
    "--linear-project-scope",
    paths.projectScope,
    "--linear-program-scope",
    paths.programScope,
    "--inventory",
    paths.inventory,
    "--dispositions",
    paths.dispositions,
    "--feature-dependencies",
    paths.featureDependencies,
    "--stamp",
    paths.stamp,
    "--exact",
    paths.exact,
    "--runtime-dependencies",
    paths.runtimeDependencies,
    "--releases",
    paths.releases,
    "--policy",
    paths.releasePolicy,
    "--release-plan",
    publishedReleasePlan,
    "--roadmap",
    paths.roadmap,
    "--reports",
    reportsOut,
  ]);

  copyAttestation(paths.captureReceipt, join(attestationOut, "linear-capture-receipt.json"));
  copyAttestation(paths.candidateReceipt, join(attestationOut, "linear-candidate-receipt.json"));
  copyAttestation(paths.fingerprint, join(attestationOut, "linear-fingerprint.json"));
  copyAttestation(paths.stamp, join(attestationOut, "linear-runtime-stamp.json"));
  copyAttestation(paths.exact, join(attestationOut, "linear-exact-status.json"));
  const publicationReceipt = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    capturedAt: captureReceipt.capturedAt,
    source,
    githubArtifactSha256: artifactDigest,
    handoffSha256: sha256(candidateJson),
    candidateReceiptSha256: sha256(candidateReceiptJson),
    captureReceiptSha256: sha256(captureReceiptJson),
    fingerprintSha256: sha256(fingerprintJson),
    runtimeStampSha256: sha256(runtimeStampJson),
    exactStatusSha256: sha256(exactStatusJson),
    releaseDefinitionsSha256: sha256(releaseDefinitionsJson),
    releasePlanSha256: sha256(readFileSync(publishedReleasePlan, "utf8")),
    reports: Object.fromEntries(
      REPORTS.map((report) => [
        report,
        sha256(readFileSync(join(reportsOut, report), "utf8")),
      ]),
    ),
  };
  writeFileSync(
    join(attestationOut, "linear-publication-receipt.json"),
    `${JSON.stringify(publicationReceipt, null, 2)}\n`,
    { flag: "wx", mode: 0o600 },
  );
  const expectedFiles = [
    "attestation/linear-candidate-receipt.json",
    "attestation/linear-capture-receipt.json",
    "attestation/linear-exact-status.json",
    "attestation/linear-fingerprint.json",
    "attestation/linear-publication-receipt.json",
    "attestation/linear-runtime-stamp.json",
    "delivery/linear-snapshot.json",
    "delivery/release-plan.json",
    ...REPORTS.map((report) => `reports/delivery/${report}`),
  ].sort();
  if (
    JSON.stringify(exactPublicationFiles(canonicalOut)) !==
      JSON.stringify(expectedFiles)
  ) {
    throw new Error("Publication package file inventory is not exact");
  }
  process.stdout.write(
    `${JSON.stringify({ status: "prepared", out: canonicalOut, reports: REPORTS.length })}\n`,
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
