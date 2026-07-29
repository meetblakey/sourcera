import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  OLD_REQUIREMENT_LABEL_ID,
  REQUIREMENTS_TEAM_ID,
  buildLinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelCapture,
} from "./lib/linear-requirement-label-replacement.js";

const RUNNER = resolve("tools/delivery/run-linear-requirement-label-replacement.ts");
const LOADER = resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs");

const SHA = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");

function invoke(args: string[], env: Partial<NodeJS.ProcessEnv> = {}, cwd = process.cwd()) {
  return spawnSync(process.execPath, ["--import", LOADER, RUNNER, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function git(root: string, args: readonly string[]): string {
  const result = spawnSync("git", ["--no-optional-locks", "-C", root, ...args], {
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function nativeFixture(): LinearRequirementLabelCapture {
  const issues = Array.from({ length: 186 }, (_, offset) => {
    const number = offset + 1;
    return {
      issueUuid: `10000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
      identifier: `REQ-${number}`,
      title: `Requirement ${number}`,
      archivedAt: null,
      descriptionSha256: SHA(`description-${number}`),
      teamId: REQUIREMENTS_TEAM_ID,
      stateId: "20000000-0000-4000-8000-000000000001",
      projectId: null,
      estimate: null,
      priority: 0,
      dueDate: null,
      cycleId: null,
      milestoneId: null,
      releaseIds: [],
      parentIssueUuid: null,
      assigneeId: null,
      labelIds: [OLD_REQUIREMENT_LABEL_ID],
      relationIds: [],
    };
  });
  return {
    schemaVersion: 1,
    workspace: {
      id: "30000000-0000-4000-8000-000000000001",
      name: "Sourcera",
      urlKey: "sourcera-production",
      archivedAt: null,
    },
    issues,
    labels: [{
      id: OLD_REQUIREMENT_LABEL_ID,
      name: "Requirement",
      color: "#5E6AD2",
      description: "Canonical binding product or engineering requirement.",
      archivedAt: null,
      retiredAt: null,
      inheritedFromId: null,
      isGroup: false,
      parentId: null,
      parentName: null,
      teamId: null,
      teamKey: null,
    }],
    relations: [],
    teams: [{ id: REQUIREMENTS_TEAM_ID, key: "REQ", name: "Requirements", archivedAt: null }],
    workflowStates: [], users: [], initiatives: [], projects: [], releasePipelines: [], releases: [],
    projectMilestones: [], cycles: [], documents: [], rawDocumentIds: [],
    coverage: {
      complete: true,
      totals: {
        issues: issues.length,
        labels: 1,
        labelAssignments: issues.length,
        relations: 0,
        teams: 1,
        workflowStates: 0,
        users: 0,
        initiatives: 0,
        projects: 0,
        releasePipelines: 0,
        releaseStages: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 0,
        rawDocuments: 0,
      },
    },
  } as unknown as LinearRequirementLabelCapture;
}

function requiredArgs(root: string): string[] {
  return [
    "--candidate", join(root, "candidate.json"),
    "--phase", "rename",
    "--expected-root", "a".repeat(64),
    "--native-identity", join(root, "native.json"),
    "--capture-receipt", join(root, "capture-receipt.json"),
    "--run-id", "123.1.rename",
    "--journal-out", join(root, "journal.jsonl"),
    "--receipt-out", join(root, "phase-receipt.json"),
    "--chunk-receipts-out", join(root, "phase-core-receipts.jsonl"),
    "--apply",
  ];
}

test("runner rejects unsafe material before credentials or outputs and redacts failure detail", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-runner-"));
  try {
    writeFileSync(join(root, "candidate.json"), "secret candidate bytes", { mode: 0o600 });
    writeFileSync(join(root, "native.json"), "secret native bytes", { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), "secret receipt bytes", { mode: 0o600 });
    const result = invoke(requiredArgs(root), { LINEAR_API_KEY: "secret-linear-key" });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "Linear Requirement label replacement failed\n");
    assert.doesNotMatch(result.stderr, /secret-linear-key|secret candidate|secret native|secret receipt/);
    assert.equal(existsSync(join(root, "journal.jsonl")), false);
    assert.equal(existsSync(join(root, "phase-receipt.json")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner rejects symlink inputs and existing output targets", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-runner-"));
  try {
    writeFileSync(join(root, "real-candidate.json"), "{}", { mode: 0o600 });
    symlinkSync(join(root, "real-candidate.json"), join(root, "candidate.json"));
    writeFileSync(join(root, "native.json"), "{}", { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), "{}", { mode: 0o600 });
    const symlinked = invoke(requiredArgs(root), { LINEAR_API_KEY: "unused" });
    assert.equal(symlinked.status, 1);
    assert.equal(existsSync(join(root, "journal.jsonl")), false);
    assert.equal(existsSync(join(root, "phase-receipt.json")), false);

    rmSync(join(root, "candidate.json"));
    writeFileSync(join(root, "candidate.json"), "{}", { mode: 0o600 });
    writeFileSync(join(root, "journal.jsonl"), "do not overwrite", { mode: 0o600 });
    const existing = invoke(requiredArgs(root), { LINEAR_API_KEY: "unused" });
    assert.equal(existing.status, 1);
    assert.equal(readFileSync(join(root, "journal.jsonl"), "utf8"), "do not overwrite");
    assert.equal(existsSync(join(root, "phase-receipt.json")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner source keeps the closed one-phase CLI and durable output controls", () => {
  const source = readFileSync(RUNNER, "utf8");
  for (const flag of [
    "--candidate", "--phase", "--expected-root", "--native-identity",
    "--capture-receipt", "--run-id", "--journal-out", "--receipt-out", "--chunk-receipts-out",
    "--previous-receipt", "--previous-journal", "--expected-previous-receipt-root", "--resume-journal",
    "--expected-resume-journal-sha256", "--resume-receipts", "--expected-resume-receipts-sha256",
    "--apply", "--compensate", "--second-native-identity",
    "--second-capture-receipt",
  ]) assert.match(source, new RegExp(flag));
  assert.match(source, /O_EXCL/);
  assert.match(source, /O_NOFOLLOW/);
  assert.match(source, /0o600/);
  assert.match(source, /fsyncSync/);
  assert.match(source, /receiptSink/);
  assert.match(source, /compensateLinearRequirementLabelReplacementPhase/);
  assert.match(source, /restoreLabel/);
  assert.match(source, /delete environment\.LINEAR_API_KEY/);
  assert.match(source, /refs\/heads\/main/);
  assert.match(source, /meetblakey\/sourcera/);
  assert.match(source, /merge-base/);
  assert.match(source, /IMMUTABLE_MIGRATION_PATHS/);
  assert.match(source, /byte-identical migration controls/);
  assert.doesNotMatch(source, /deleteLabel|issueLabelDelete/);
});

test("runner rejects illegal phase flag combinations", () => {
  const missingApply = invoke([
    "--candidate", "/tmp/candidate.json", "--phase", "rename",
    "--expected-root", "a".repeat(64), "--native-identity", "/tmp/native.json",
    "--capture-receipt", "/tmp/receipt.json", "--run-id", "1.1.rename",
    "--journal-out", "/tmp/journal.jsonl", "--receipt-out", "/tmp/phase.json",
    "--chunk-receipts-out", "/tmp/chunks.jsonl",
  ]);
  assert.equal(missingApply.status, 1);
  assert.equal(missingApply.stderr, "Linear Requirement label replacement failed\n");

  const verifyApply = invoke([
    "--candidate", "/tmp/candidate.json", "--phase", "verify",
    "--expected-root", "a".repeat(64), "--native-identity", "/tmp/native.json",
    "--capture-receipt", "/tmp/receipt.json", "--previous-receipt", "/tmp/previous.json",
    "--expected-previous-receipt-root", "b".repeat(64), "--run-id", "1.1.verify",
    "--journal-out", "/tmp/journal.jsonl", "--receipt-out", "/tmp/phase.json",
    "--chunk-receipts-out", "/tmp/chunks.jsonl", "--apply",
  ]);
  assert.equal(verifyApply.status, 1);

  const finalizeMissingSecond = invoke([
    "--candidate", "/tmp/candidate.json", "--phase", "finalize",
    "--expected-root", "a".repeat(64), "--native-identity", "/tmp/native.json",
    "--capture-receipt", "/tmp/receipt.json", "--previous-receipt", "/tmp/previous.json",
    "--expected-previous-receipt-root", "b".repeat(64), "--run-id", "1.1.finalize",
    "--journal-out", "/tmp/journal.jsonl", "--receipt-out", "/tmp/phase.json",
    "--chunk-receipts-out", "/tmp/chunks.jsonl",
  ]);
  assert.equal(finalizeMissingSecond.status, 1);
});

test("runner accepts a later main HEAD only when the candidate commit is an unchanged ancestor", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-descendant-"));
  try {
    git(root, ["init", "--quiet"]);
    git(root, ["config", "user.name", "Sourcera test"]);
    git(root, ["config", "user.email", "sourcera-test@example.invalid"]);
    writeFileSync(join(root, "README.md"), "candidate\n", { mode: 0o600 });
    git(root, ["add", "README.md"]);
    git(root, ["commit", "--quiet", "-m", "candidate"]);
    const candidateCommit = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "later.txt"), "unrelated later main change\n", { mode: 0o600 });
    git(root, ["add", "later.txt"]);
    git(root, ["commit", "--quiet", "-m", "later main"]);
    const currentHead = git(root, ["rev-parse", "HEAD"]);

    const native = nativeFixture();
    const nativeRaw = Buffer.from(`${JSON.stringify(native)}\n`);
    const captureReceipt = {
      schemaVersion: 2,
      captureMode: "live",
      capturedAt: "2026-07-29T08:00:00.000Z",
      fingerprintSha256: "d".repeat(64),
      acceptedFingerprintSha256: "d".repeat(64),
      artifactSha256s: {
        fingerprint: "d".repeat(64),
        nativeIdentity: SHA(nativeRaw),
        documents: "e".repeat(64),
        issueDescriptions: "f".repeat(64),
      },
      source: {
        repository: "meetblakey/sourcera",
        commit: currentHead,
        ref: "refs/heads/main",
        runId: "123",
        runAttempt: "1",
      },
    };
    const captureReceiptRaw = Buffer.from(`${JSON.stringify(captureReceipt)}\n`);
    const candidate = buildLinearRequirementLabelReplacementCandidate({
      native,
      sourceCommit: candidateCommit,
      nativeIdentitySha256: SHA(nativeRaw),
      captureReceiptSha256: "c".repeat(64),
      newLabelId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    writeFileSync(join(root, "candidate.json"), `${JSON.stringify(candidate)}\n`, { mode: 0o600 });
    writeFileSync(join(root, "native.json"), nativeRaw, { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), captureReceiptRaw, { mode: 0o600 });

    const { LINEAR_API_KEY: _credential, ...environment } = process.env;
    const args = requiredArgs(root);
    args[args.indexOf("--expected-root") + 1] = candidate.root;
    const result = invoke(args, {
      ...environment,
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: currentHead,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    }, root);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "Linear Requirement label replacement failed\n");
    assert.equal(existsSync(join(root, "journal.jsonl")), true,
      "the runner must pass repository and capture provenance before stopping on its absent credential");
    assert.equal(existsSync(join(root, "phase-core-receipts.jsonl")), true);
    assert.equal(existsSync(join(root, "phase-receipt.json")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
