#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  buildLinearAuthorityLabelBootstrapCandidate,
  canonicalLinearAuthorityLabelBootstrapCandidateJson,
} from "./lib/linear-authority-label-bootstrap.js";
import type { LinearNativeIdentityCapture } from "./lib/linear-live.js";
import type { LinearProgramScopeV3 } from "./lib/linear-program-scope.js";

function fail(message: string): never {
  throw new Error(`Label bootstrap CLI: ${message}`);
}

function args(argv: string[]): Map<string, string> {
  const allowed = new Set(["--repository-root", "--native-identity", "--capture-receipt", "--program-scope", "--out"]);
  const result = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key || !allowed.has(key) || !value || value.startsWith("--") || result.has(key)) fail("arguments are invalid or duplicated");
    result.set(key, value);
  }
  for (const key of ["--native-identity", "--capture-receipt", "--program-scope", "--out"]) {
    if (!result.has(key)) fail(`${key} is required`);
  }
  return result;
}

function exactObject(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (JSON.stringify(Object.keys(row).sort()) !== JSON.stringify([...keys].sort())) fail(`${label} keys differ`);
  return row;
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

const values = args(process.argv.slice(2));
const root = resolve(values.get("--repository-root") ?? process.cwd());
const nativeRaw = readFileSync(resolve(values.get("--native-identity")!));
const receiptRaw = readFileSync(resolve(values.get("--capture-receipt")!));
const programPath = resolve(values.get("--program-scope")!);
const canonicalProgramPath = join(root, "delivery/linear-program-scope.json");
if (programPath !== canonicalProgramPath) fail("program scope must be the canonical repository path");
const programRaw = readFileSync(programPath);
const receipt = exactObject(JSON.parse(receiptRaw.toString("utf8")), [
  "schemaVersion", "captureMode", "capturedAt", "fingerprintSha256", "acceptedFingerprintSha256", "artifactSha256s", "source",
], "capture receipt");
const artifacts = exactObject(receipt.artifactSha256s, ["fingerprint", "nativeIdentity", "documents", "issueDescriptions"], "capture receipt artifacts");
const source = exactObject(receipt.source, ["repository", "commit", "ref", "runId", "runAttempt"], "capture receipt source");
const capturedAt = receipt.capturedAt;
const fingerprintSha256 = receipt.fingerprintSha256;
if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" || typeof capturedAt !== "string" ||
  Number.isNaN(Date.parse(capturedAt)) || new Date(capturedAt).toISOString() !== capturedAt ||
  typeof fingerprintSha256 !== "string" || !/^[a-f0-9]{64}$/.test(fingerprintSha256) ||
  receipt.acceptedFingerprintSha256 !== fingerprintSha256 || artifacts.fingerprint !== fingerprintSha256 ||
  artifacts.nativeIdentity !== sha256(nativeRaw) || typeof artifacts.documents !== "string" ||
  !/^[a-f0-9]{64}$/.test(artifacts.documents) || typeof artifacts.issueDescriptions !== "string" ||
  !/^[a-f0-9]{64}$/.test(artifacts.issueDescriptions) ||
  source.repository !== "meetblakey/sourcera" || source.ref !== "refs/heads/main" ||
  typeof source.commit !== "string" || !/^[a-f0-9]{40,64}$/.test(source.commit) ||
  typeof source.runId !== "string" || !/^[1-9]\d*$/.test(source.runId) ||
  typeof source.runAttempt !== "string" || !/^[1-9]\d*$/.test(source.runAttempt) ||
  (process.env.GITHUB_REPOSITORY !== undefined && source.repository !== process.env.GITHUB_REPOSITORY) ||
  (process.env.GITHUB_SHA !== undefined && source.commit !== process.env.GITHUB_SHA) ||
  (process.env.GITHUB_REF !== undefined && source.ref !== process.env.GITHUB_REF) ||
  (process.env.GITHUB_RUN_ID !== undefined && source.runId !== process.env.GITHUB_RUN_ID) ||
  (process.env.GITHUB_RUN_ATTEMPT !== undefined && source.runAttempt !== process.env.GITHUB_RUN_ATTEMPT)) {
  fail("capture receipt does not bind the supplied native identity to canonical main");
}
const head = spawnSync("git", ["--no-optional-locks", "rev-parse", "--verify", "HEAD^{commit}"], {
  cwd: root, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
});
const committedProgram = spawnSync("git", ["--no-optional-locks", "show", "HEAD:delivery/linear-program-scope.json"], {
  cwd: root, encoding: null, env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" }, maxBuffer: 16 * 1024 * 1024,
});
if (head.status !== 0 || head.signal || head.error || head.stdout.trim() !== source.commit ||
  committedProgram.status !== 0 || committedProgram.signal || committedProgram.error ||
  !Buffer.isBuffer(committedProgram.stdout) || !programRaw.equals(committedProgram.stdout)) {
  fail("repository HEAD or program scope differs from the capture source commit");
}
const candidate = buildLinearAuthorityLabelBootstrapCandidate({
  native: JSON.parse(nativeRaw.toString("utf8")) as LinearNativeIdentityCapture,
  programScope: JSON.parse(programRaw.toString("utf8")) as LinearProgramScopeV3,
  sourceCommit: source.commit,
  nativeIdentitySha256: sha256(nativeRaw),
  captureReceiptSha256: sha256(receiptRaw),
});
writeFileSync(resolve(values.get("--out")!), canonicalLinearAuthorityLabelBootstrapCandidateJson(candidate), { flag: "wx" });
process.stdout.write(`${JSON.stringify({
  ok: true,
  root: candidate.root,
  createLabels: candidate.createLabels.map((row) => row.name),
  readyForBaseline: candidate.createLabels.length === 0,
})}\n`);
