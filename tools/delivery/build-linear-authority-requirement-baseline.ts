#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildLinearAuthorityRequirementBaseline,
  canonicalLinearAuthorityRequirementBaselineJson,
  LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS,
} from "./lib/linear-authority-requirement-adoption.js";
import { verifyExactGitCommitProvenance } from "./lib/git-commit-provenance.js";
import {
  assertLinearNativeIdentityMatchesFingerprint,
  type LinearFingerprint,
  type LinearNativeIdentityCapture,
} from "./lib/linear-live.js";
import {
  initializeLinearProgramScopeAuthorityIssueLabelContract,
} from "./lib/linear-program-scope.js";

function fail(message: string): never {
  throw new Error(`Requirement baseline CLI: ${message}`);
}

function argumentsMap(argv: string[]): Map<string, string> {
  const allowed = new Set(["--repository-root", "--fingerprint", "--issue-descriptions", "--native-identity", "--capture-receipt", "--bootstrap-map", "--program-scope", "--program-scope-out", "--out"]);
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key || !allowed.has(key) || !value || value.startsWith("--") || values.has(key)) fail("arguments are invalid or duplicated");
    values.set(key, value);
  }
  for (const key of ["--fingerprint", "--issue-descriptions", "--native-identity", "--capture-receipt", "--bootstrap-map", "--program-scope", "--program-scope-out", "--out"]) {
    if (!values.has(key)) fail(`${key} is required`);
  }
  return values;
}

const values = argumentsMap(process.argv.slice(2));
const repositoryRoot = resolve(values.get("--repository-root") ?? process.cwd());
const canonicalRepositoryInput = (flag: string, path: string): Buffer => {
  const supplied = resolve(values.get(flag)!);
  const canonical = resolve(repositoryRoot, path);
  if (supplied !== canonical) fail(`${flag} must be the canonical repository path ${path}`);
  return readFileSync(canonical);
};
const fingerprintRaw = readFileSync(resolve(values.get("--fingerprint")!));
const descriptionsRaw = readFileSync(resolve(values.get("--issue-descriptions")!));
const nativeRaw = readFileSync(resolve(values.get("--native-identity")!));
const receiptRaw = readFileSync(resolve(values.get("--capture-receipt")!));
const bootstrapMapRaw = canonicalRepositoryInput(
  "--bootstrap-map",
  "delivery/linear-authority-requirement-bootstrap-map.json",
);
const programScopeRaw = canonicalRepositoryInput(
  "--program-scope",
  "delivery/linear-program-scope.json",
);
const fingerprint = JSON.parse(fingerprintRaw.toString("utf8")) as LinearFingerprint;
const native = JSON.parse(nativeRaw.toString("utf8")) as LinearNativeIdentityCapture;
assertLinearNativeIdentityMatchesFingerprint(fingerprint, native);
const exactObject = (value: unknown, keys: readonly string[], label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (JSON.stringify(Object.keys(row).sort()) !== JSON.stringify([...keys].sort())) fail(`${label} keys differ`);
  return row;
};
const digest = (value: Buffer): string => createHash("sha256").update(value).digest("hex");
const receipt = exactObject(JSON.parse(receiptRaw.toString("utf8")), [
  "schemaVersion", "captureMode", "capturedAt", "fingerprintSha256", "acceptedFingerprintSha256", "artifactSha256s", "source",
], "capture receipt");
const artifactSha256s = exactObject(receipt.artifactSha256s, ["fingerprint", "nativeIdentity", "documents", "issueDescriptions"], "capture receipt artifact hashes");
const source = exactObject(receipt.source, ["repository", "commit", "ref", "runId", "runAttempt"], "capture receipt source");
const fingerprintSha256 = digest(fingerprintRaw);
if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" || typeof receipt.capturedAt !== "string" ||
  Number.isNaN(Date.parse(receipt.capturedAt)) || new Date(receipt.capturedAt).toISOString() !== receipt.capturedAt ||
  receipt.fingerprintSha256 !== fingerprintSha256 || receipt.acceptedFingerprintSha256 !== fingerprintSha256 ||
  artifactSha256s.fingerprint !== fingerprintSha256 || artifactSha256s.nativeIdentity !== digest(nativeRaw) ||
  artifactSha256s.issueDescriptions !== digest(descriptionsRaw) || typeof artifactSha256s.documents !== "string" ||
  !/^[a-f0-9]{64}$/.test(artifactSha256s.documents)) {
  fail("capture receipt is not a live v2 receipt for the supplied capture bytes");
}
if (source.repository !== "meetblakey/sourcera" || source.ref !== "refs/heads/main" ||
  typeof source.commit !== "string" || !/^[a-f0-9]{40,64}$/.test(source.commit) ||
  typeof source.runId !== "string" || !/^[1-9]\d*$/.test(source.runId) ||
  typeof source.runAttempt !== "string" || !/^[1-9]\d*$/.test(source.runAttempt) ||
  (process.env.GITHUB_REPOSITORY !== undefined && source.repository !== process.env.GITHUB_REPOSITORY) ||
  (process.env.GITHUB_SHA !== undefined && source.commit !== process.env.GITHUB_SHA) ||
  (process.env.GITHUB_REF !== undefined && source.ref !== process.env.GITHUB_REF) ||
  (process.env.GITHUB_RUN_ID !== undefined && source.runId !== process.env.GITHUB_RUN_ID) ||
  (process.env.GITHUB_RUN_ATTEMPT !== undefined && source.runAttempt !== process.env.GITHUB_RUN_ATTEMPT)) {
  fail("capture receipt does not have canonical GitHub main provenance");
}
verifyExactGitCommitProvenance({
  repositoryRoot,
  sourceCommit: source.commit,
  paths: LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS,
});
const baseline = buildLinearAuthorityRequirementBaseline({
  rootDir: repositoryRoot,
  workspaceId: native.workspace.id,
  fingerprintJson: fingerprintRaw,
  descriptionsJson: descriptionsRaw,
  bootstrapMapJson: bootstrapMapRaw,
});
const initializedProgramScope = initializeLinearProgramScopeAuthorityIssueLabelContract(
  programScopeRaw.toString("utf8"),
  native.labels,
);
writeFileSync(resolve(values.get("--out")!), canonicalLinearAuthorityRequirementBaselineJson(baseline), { flag: "wx" });
writeFileSync(
  resolve(values.get("--program-scope-out")!),
  initializedProgramScope.raw,
  { flag: "wx" },
);
process.stdout.write(`${JSON.stringify({
  ok: true,
  initialized: true,
  workspaceId: baseline.workspaceId,
  requirements: baseline.entries.length,
  root: baseline.root,
  labelContractRoot: initializedProgramScope.contract.root,
  labelContractChanged: initializedProgramScope.changed,
})}\n`);
