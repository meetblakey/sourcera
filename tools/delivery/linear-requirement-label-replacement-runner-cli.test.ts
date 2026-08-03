import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import {
  OLD_REQUIREMENT_LABEL_ID,
  REQUIREMENTS_TEAM_ID,
  RETIRED_REQUIREMENT_LABEL_NAME,
  buildLinearRequirementLabelReplacementCandidate,
  executeLinearRequirementLabelReplacementPhase,
  type LinearRequirementLabelCapture,
  type LinearRequirementLabelSemanticBaselineContract,
  type LinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementPhase,
  type LinearRequirementLabelReplacementPhaseReceipt,
  type LinearRequirementLabelReplacementTransport,
} from "./lib/linear-requirement-label-replacement.js";

const RUNNER = resolve("tools/delivery/run-linear-requirement-label-replacement.ts");
const LOADER = resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs");
const CYCLE_ID = "d745c4db-3f58-4862-b7e3-9ddfa869b403";
const CYCLE_BEFORE = "2026-07-28T14:36:15.374Z";
const CYCLE_AFTER = "2026-07-29T14:35:38.730Z";

const SHA = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

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

const IMMUTABLE_TEST_PATHS = [
  ".github/workflows/linear-requirement-label-replacement.yml",
  "delivery/linear-requirement-label-finalize-transition.json",
  "delivery/linear-program-scope.json",
  "delivery/linear-project-scope.json",
  "tools/delivery",
  "tools/spec-lint/package.json",
  "tools/spec-lint/package-lock.json",
] as const;

function controlTreeRoot(root: string, commit: string): string {
  return SHA(Buffer.from(spawnSync(
    "git",
    ["-C", root, "ls-tree", "-r", "-z", commit, "--", ...IMMUTABLE_TEST_PATHS],
    { encoding: "buffer" },
  ).stdout));
}

function rewriteCaptureCommit(path: string, commit: string): void {
  const receipt = JSON.parse(readFileSync(path, "utf8")) as { source: { commit: string } };
  receipt.source.commit = commit;
  writeFileSync(path, `${JSON.stringify(receipt)}\n`, { mode: 0o600 });
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

function withCycle(native: LinearRequirementLabelCapture, updatedAt: string): LinearRequirementLabelCapture {
  const result = structuredClone(native);
  result.cycles = [{
    id: CYCLE_ID,
    number: 7,
    name: "SEL cycle",
    descriptionSha256: SHA("cycle-description"),
    updatedAt,
    archivedAt: null,
    startsAt: "2026-07-20T00:00:00.000Z",
    endsAt: "2026-08-03T00:00:00.000Z",
    completedAt: null,
    teamId: "40000000-0000-4000-8000-000000000001",
    teamKey: "SEL",
    inheritedFromId: null,
  }];
  result.coverage.totals.cycles = 1;
  return result;
}

function sealedTransition(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  diagnosticCommit: string;
  transitionCommit: string;
  previousReceiptRoot: string;
  candidateControlTreeRoot?: string;
  diagnosticControlTreeRoot?: string;
  transitionControlTreeRoot?: string;
  verifyFiles: { candidateRaw: string; receiptRaw: string; journalRaw: string; coreReceiptsRaw: string };
  retireFiles: { candidateRaw: string; receiptRaw: string; journalRaw: string; coreReceiptsRaw: string };
  verifyRunnerRoot: string;
  retireRunnerRoot: string;
  verifyPreviousReceiptRoot: string;
  verifyReceipts: LinearRequirementLabelReplacementPhaseReceipt[];
  retireReceipts: LinearRequirementLabelReplacementPhaseReceipt[];
}): LinearRequirementLabelSemanticBaselineContract {
  const artifact = (
    phase: "verify" | "retire",
    files: typeof input.verifyFiles,
    root: string,
  ) => ({
    artifactId: phase === "verify" ? "8726485898" : "8727423703",
    artifactName: `linear-requirement-label-replacement-${phase === "verify" ? "30456655778" : "30458550380"}-1`,
    artifactDigest: `sha256:${(phase === "verify" ? "1" : "2").repeat(64)}`,
    runId: phase === "verify" ? "30456655778" : "30458550380",
    runAttempt: "1" as const,
    commit: input.candidate.sourceCommit,
    candidateSha256: SHA(files.candidateRaw),
    receiptSha256: SHA(files.receiptRaw),
    journalSha256: SHA(files.journalRaw),
    coreReceiptsSha256: SHA(files.coreReceiptsRaw),
    runnerRoot: root,
  });
  const body = {
    schemaVersion: 2 as const,
    kind: "linear-requirement-label-semantic-baseline-handoff" as const,
    candidateRoot: input.candidate.root,
    candidateSourceCommit: input.candidate.sourceCommit,
    diagnosticCommit: input.diagnosticCommit,
    transitionCommit: input.transitionCommit,
    previousReceiptRoot: input.previousReceiptRoot,
    candidateControlTreeRoot: input.candidateControlTreeRoot ?? "1".repeat(64),
    diagnosticControlTreeRoot: input.diagnosticControlTreeRoot ?? "2".repeat(64),
    transitionControlTreeRoot: input.transitionControlTreeRoot ?? "3".repeat(64),
    historicalEvidence: {
      verify: artifact("verify", input.verifyFiles, input.verifyRunnerRoot),
      retire: artifact("retire", input.retireFiles, input.retireRunnerRoot),
    },
    historicalProof: {
      protectedNativeStateRoot: input.candidate.protectedNativeStateRoot,
      verifyPreviousReceiptRoot: input.verifyPreviousReceiptRoot,
      verifyJournalRecordCount: 376 as const,
      verifyCoreReceiptCount: 10 as const,
      verifyTerminalRecordSha256: input.verifyReceipts.at(-1)!.terminalRecordSha256,
      verifyTerminalCoreReceiptRoot: input.verifyReceipts.at(-1)!.root,
      retireJournalRecordCount: 378 as const,
      retireCoreReceiptCount: 11 as const,
      retireTerminalRecordSha256: input.retireReceipts.at(-1)!.terminalRecordSha256,
      retireTerminalCoreReceiptRoot: input.retireReceipts.at(-1)!.root,
    },
  };
  return { ...body, root: SHA(canonicalJson(body)) };
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

async function finalizedRunnerFixture(root: string, options: {
  withTransition?: boolean;
  sourceCommit?: string;
  captureCommit?: string;
  diagnosticCommit?: string;
  transitionCommit?: string;
  candidateControlTreeRoot?: string;
  diagnosticControlTreeRoot?: string;
  transitionControlTreeRoot?: string;
} = {}): Promise<{
  candidate: LinearRequirementLabelReplacementCandidate;
  first: LinearRequirementLabelCapture;
  second: LinearRequirementLabelCapture;
  args: string[];
  environment: Record<string, string>;
  transition?: LinearRequirementLabelSemanticBaselineContract;
  rewriteCapture(name: "first" | "second", native: LinearRequirementLabelCapture): void;
}> {
  const sourceCommit = options.sourceCommit ?? git(process.cwd(), ["rev-parse", "HEAD"]);
  const captureCommit = options.captureCommit ?? sourceCommit;
  const diagnosticCommit = options.diagnosticCommit ?? sourceCommit;
  const transitionCommit = options.transitionCommit ?? diagnosticCommit;
  const withTransition = options.withTransition === true;
  const before = withTransition ? withCycle(nativeFixture(), CYCLE_BEFORE) : nativeFixture();
  const beforeRaw = Buffer.from(`${JSON.stringify(before)}\n`);
  const candidate = buildLinearRequirementLabelReplacementCandidate({
    native: before,
    sourceCommit,
    nativeIdentitySha256: SHA(beforeRaw),
    captureReceiptSha256: "c".repeat(64),
    newLabelId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  });
  const labels = new Map(before.labels.map((label) => [label.id, structuredClone(label)]));
  const issues = new Map(before.issues.map((issue) => [issue.issueUuid, structuredClone(issue)]));
  const transport: LinearRequirementLabelReplacementTransport = {
    async readLabel(id) { return structuredClone(labels.get(id) ?? null); },
    async readIssue(id) { return structuredClone(issues.get(id) ?? null); },
    async listIssueIdsByLabel(id) {
      return [...issues.values()].filter((issue) => issue.labelIds.includes(id)).map((issue) => issue.issueUuid).sort();
    },
    async renameLabel(input) { labels.get(input.id)!.name = input.name; },
    async createLabel(input) {
      labels.set(input.id, {
        ...structuredClone(input),
        archivedAt: null,
        retiredAt: null,
      });
    },
    async replaceIssueLabels(input) { issues.get(input.issueId)!.labelIds = [...input.labelIds]; },
    async setLabelRetired(input) {
      labels.get(input.id)!.retiredAt = input.retired ? "2026-07-29T09:00:00.000Z" : null;
    },
  };
  let journalRaw = "";
  let receipts: LinearRequirementLabelReplacementPhaseReceipt[] = [];
  let verifyJournalRaw = "";
  let verifyReceipts: LinearRequirementLabelReplacementPhaseReceipt[] = [];
  for (const phase of ["rename", "create", "replace", "retire"] as const satisfies readonly LinearRequirementLabelReplacementPhase[]) {
    const result = await executeLinearRequirementLabelReplacementPhase({
      candidate,
      expectedCandidateRoot: candidate.root,
      phase,
      authorization: {
        candidateRoot: candidate.root,
        phase,
        confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
      },
      runId: `900.1.${phase}`,
      transport,
      resumeJournalRaw: journalRaw || undefined,
      expectedResumeJournalSha256: journalRaw ? SHA(journalRaw) : undefined,
      receipts,
      clock: () => new Date("2026-07-29T09:00:00.000Z"),
    });
    journalRaw = result.journalRaw;
    receipts = [...receipts, ...result.receipts];
    if (phase === "replace") {
      verifyJournalRaw = journalRaw;
      verifyReceipts = structuredClone(receipts);
    }
  }
  const first = structuredClone(before);
  first.issues = [...issues.values()].map((issue) => structuredClone(issue));
  first.labels = [...labels.values()].map((label) => structuredClone(label));
  first.coverage.totals.labels = first.labels.length;
  first.coverage.totals.labelAssignments = first.issues.reduce((total, issue) => total + issue.labelIds.length, 0);
  const second = structuredClone(first);
  if (withTransition) {
    first.cycles[0]!.updatedAt = CYCLE_AFTER;
    second.cycles[0]!.updatedAt = CYCLE_AFTER;
  }

  const captureReceipt = (nativeRaw: Buffer, capturedAt: string) => Buffer.from(`${JSON.stringify({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt,
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
      commit: captureCommit,
      ref: "refs/heads/main",
      runId: "991",
      runAttempt: "1",
    },
  })}\n`);
  const rewriteCapture = (name: "first" | "second", native: LinearRequirementLabelCapture): void => {
    const nativeRaw = Buffer.from(`${JSON.stringify(native)}\n`);
    const prefix = name === "first" ? "" : "second-";
    writeFileSync(join(root, `${prefix}native.json`), nativeRaw, { mode: 0o600 });
    writeFileSync(join(root, `${prefix}capture-receipt.json`), captureReceipt(
      nativeRaw,
      name === "first" ? "2026-07-29T09:10:00.000Z" : "2026-07-29T09:20:00.000Z",
    ), { mode: 0o600 });
  };
  rewriteCapture("first", first);
  rewriteCapture("second", second);
  const candidateRaw = `${JSON.stringify(candidate)}\n`;
  writeFileSync(join(root, "candidate.json"), candidateRaw, { mode: 0o600 });
  writeFileSync(join(root, "previous-journal.jsonl"), journalRaw, { mode: 0o600 });
  const verifyPreviousReceiptRoot = "2".repeat(64);
  const verifyBody = {
    schemaVersion: 1,
    kind: "linear-requirement-label-replacement-runner-receipt",
    candidateRoot: candidate.root,
    operationsRoot: candidate.operationsRoot,
    phase: "verify",
    direction: "forward",
    runId: "30456655778.1.verify",
    nativeIdentitySha256: SHA(JSON.stringify(first)),
    captureReceiptSha256: "1".repeat(64),
    secondNativeIdentitySha256: null,
    secondCaptureReceiptSha256: null,
    journalSha256: SHA(verifyJournalRaw),
    coreReceipts: verifyReceipts,
    applied: 0,
    alreadyApplied: 0,
    compensated: 0,
    alreadyCompensated: 0,
    verification: {
      requirementUses: 186,
      oldLabelUses: 0,
      outsideRequirementUses: 0,
      protectedNativeStateRoot: candidate.protectedNativeStateRoot,
    },
    previousReceiptRoot: verifyPreviousReceiptRoot,
    complete: true,
  };
  const verifyReceipt = { ...verifyBody, root: SHA(canonicalJson(verifyBody)) };
  const previousBody = {
    schemaVersion: 1,
    kind: "linear-requirement-label-replacement-runner-receipt",
    candidateRoot: candidate.root,
    operationsRoot: candidate.operationsRoot,
    phase: "retire",
    direction: "forward",
    runId: "30458550380.1.retire.forward",
    nativeIdentitySha256: SHA(JSON.stringify(first)),
    captureReceiptSha256: "1".repeat(64),
    secondNativeIdentitySha256: null,
    secondCaptureReceiptSha256: null,
    journalSha256: SHA(journalRaw),
    coreReceipts: receipts,
    applied: 1,
    alreadyApplied: 0,
    compensated: 0,
    alreadyCompensated: 0,
    verification: null,
    previousReceiptRoot: verifyReceipt.root,
    complete: true,
  };
  const previous = { ...previousBody, root: SHA(canonicalJson(previousBody)) };
  writeFileSync(join(root, "previous-receipt.json"), `${JSON.stringify(previous)}\n`, { mode: 0o600 });
  const verifyFiles = {
    candidateRaw,
    receiptRaw: `${JSON.stringify(verifyReceipt)}\n`,
    journalRaw: verifyJournalRaw,
    coreReceiptsRaw: "",
  };
  const retireFiles = {
    candidateRaw,
    receiptRaw: `${JSON.stringify(previous)}\n`,
    journalRaw,
    coreReceiptsRaw: `${JSON.stringify(receipts.at(-1))}\n`,
  };
  const args = [
    "--candidate", join(root, "candidate.json"),
    "--phase", "finalize",
    "--expected-root", candidate.root,
    "--native-identity", join(root, "native.json"),
    "--capture-receipt", join(root, "capture-receipt.json"),
    "--second-native-identity", join(root, "second-native.json"),
    "--second-capture-receipt", join(root, "second-capture-receipt.json"),
    "--previous-receipt", join(root, "previous-receipt.json"),
    "--previous-journal", join(root, "previous-journal.jsonl"),
    "--expected-previous-receipt-root", previous.root,
    "--run-id", "991.1.finalize",
    "--journal-out", join(root, "journal.jsonl"),
    "--receipt-out", join(root, "phase-receipt.json"),
    "--chunk-receipts-out", join(root, "phase-core-receipts.jsonl"),
    "--failure-summary-out", join(root, "failure-summary.json"),
  ];
  const transition = withTransition ? sealedTransition({
    candidate,
    diagnosticCommit,
    transitionCommit,
    previousReceiptRoot: previous.root,
    candidateControlTreeRoot: options.candidateControlTreeRoot,
    diagnosticControlTreeRoot: options.diagnosticControlTreeRoot,
    transitionControlTreeRoot: options.transitionControlTreeRoot,
    verifyFiles,
    retireFiles,
    verifyRunnerRoot: verifyReceipt.root,
    retireRunnerRoot: previous.root,
    verifyPreviousReceiptRoot,
    verifyReceipts,
    retireReceipts: receipts,
  }) : undefined;
  if (transition) {
    writeFileSync(join(root, "transition.json"), `${JSON.stringify(transition)}\n`, { mode: 0o600 });
    mkdirSync(join(root, "history-verify"), { recursive: true });
    mkdirSync(join(root, "history-retire"), { recursive: true });
    for (const [directory, files] of [["history-verify", verifyFiles], ["history-retire", retireFiles]] as const) {
      writeFileSync(join(root, directory, "candidate.json"), files.candidateRaw, { mode: 0o600 });
      writeFileSync(join(root, directory, "receipt.json"), files.receiptRaw, { mode: 0o600 });
      writeFileSync(join(root, directory, "journal.jsonl"), files.journalRaw, { mode: 0o600 });
      writeFileSync(join(root, directory, "core-receipts.jsonl"), files.coreReceiptsRaw, { mode: 0o600 });
    }
    args.push(
      "--finalize-transition", join(root, "transition.json"),
      "--expected-finalize-transition-root", transition.root,
      "--historical-verify-candidate", join(root, "history-verify/candidate.json"),
      "--historical-verify-receipt", join(root, "history-verify/receipt.json"),
      "--historical-verify-journal", join(root, "history-verify/journal.jsonl"),
      "--historical-verify-core-receipts", join(root, "history-verify/core-receipts.jsonl"),
      "--historical-retire-candidate", join(root, "history-retire/candidate.json"),
      "--historical-retire-receipt", join(root, "history-retire/receipt.json"),
      "--historical-retire-journal", join(root, "history-retire/journal.jsonl"),
      "--historical-retire-core-receipts", join(root, "history-retire/core-receipts.jsonl"),
    );
  }
  return {
    candidate,
    first,
    second,
    args,
    environment: {
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: captureCommit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "991",
      GITHUB_RUN_ATTEMPT: "1",
    },
    transition,
    rewriteCapture,
  };
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

test("runner persists only a redacted failure category when validation stops", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-runner-failure-"));
  try {
    writeFileSync(join(root, "candidate.json"), "secret candidate bytes", { mode: 0o600 });
    writeFileSync(join(root, "native.json"), "secret native bytes", { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), "secret receipt bytes", { mode: 0o600 });
    const failureOut = join(root, "failure-summary.json");
    const result = invoke([
      ...requiredArgs(root),
      "--failure-summary-out", failureOut,
    ], { LINEAR_API_KEY: "secret-linear-key" });

    assert.equal(result.status, 1);
    assert.equal(result.stderr, "Linear Requirement label replacement failed\n");
    assert.deepEqual(JSON.parse(readFileSync(failureOut, "utf8")), {
      schemaVersion: 1,
      kind: "linear-requirement-label-replacement-failure-summary",
      phase: "rename",
      code: "input_validation",
      candidateRoot: null,
      firstCaptureRoot: null,
      secondCaptureRoot: null,
      differingCatalogs: null,
      firstCatalogRoots: null,
      secondCatalogRoots: null,
      firstCapture: null,
      secondCapture: null,
    });
    assert.doesNotMatch(readFileSync(failureOut, "utf8"), /secret-linear-key|secret candidate|secret native|secret receipt/);
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
    "--second-capture-receipt", "--failure-summary-out",
    "--control-transition-source", "--control-transition-candidate-root", "--control-transition-head",
    "--control-transition-before-root", "--control-transition-after-root",
    "--finalize-transition", "--expected-finalize-transition-root",
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

test("finalize runner requires both historical phase artifacts and emits a current semantic baseline", () => {
  const source = readFileSync(RUNNER, "utf8");
  for (const flag of [
    "--historical-verify-candidate", "--historical-verify-receipt", "--historical-verify-journal",
    "--historical-verify-core-receipts", "--historical-retire-candidate",
    "--historical-retire-receipt", "--historical-retire-journal", "--historical-retire-core-receipts",
  ]) assert.match(source, new RegExp(flag));
  assert.match(source, /verifyLinearRequirementLabelHistoricalReceiptChain/);
  assert.match(source, /verifyLinearRequirementLabelReplacementSemanticBaseline/);
  assert.doesNotMatch(source, /verifyLinearRequirementLabelAcceptedProtectedTransition/);
});

test("runner admits one digest-pinned six-file diagnostic control transition only", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-control-transition-"));
  try {
    git(root, ["init", "--quiet"]);
    git(root, ["config", "user.name", "Sourcera test"]);
    git(root, ["config", "user.email", "sourcera-test@example.invalid"]);
    const allowed = [
      ".github/workflows/linear-requirement-label-replacement.yml",
      "tools/delivery/lib/linear-requirement-label-replacement.ts",
      "tools/delivery/linear-requirement-label-replacement-runner-cli.test.ts",
      "tools/delivery/linear-requirement-label-replacement-workflow.test.ts",
      "tools/delivery/linear-requirement-label-replacement.test.ts",
      "tools/delivery/run-linear-requirement-label-replacement.ts",
    ];
    for (const path of allowed) {
      const full = join(root, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, "before\n", { mode: 0o600 });
    }
    git(root, ["add", "."]);
    git(root, ["commit", "--quiet", "-m", "candidate controls"]);
    const sourceCommit = git(root, ["rev-parse", "HEAD"]);
    const beforeRoot = SHA(Buffer.from(spawnSync("git", ["-C", root, "ls-tree", "-r", "-z", sourceCommit, "--",
      ".github/workflows/linear-requirement-label-replacement.yml", "delivery/linear-program-scope.json",
      "delivery/linear-project-scope.json", "tools/delivery", "tools/spec-lint/package.json",
      "tools/spec-lint/package-lock.json"], { encoding: "buffer" }).stdout));
    for (const path of allowed) writeFileSync(join(root, path), "after\n", { mode: 0o600 });
    git(root, ["add", "."]);
    git(root, ["commit", "--quiet", "-m", "diagnostic controls"]);
    const currentHead = git(root, ["rev-parse", "HEAD"]);
    const afterRoot = SHA(Buffer.from(spawnSync("git", ["-C", root, "ls-tree", "-r", "-z", currentHead, "--",
      ".github/workflows/linear-requirement-label-replacement.yml", "delivery/linear-program-scope.json",
      "delivery/linear-project-scope.json", "tools/delivery", "tools/spec-lint/package.json",
      "tools/spec-lint/package-lock.json"], { encoding: "buffer" }).stdout));

    const native = nativeFixture();
    const nativeRaw = Buffer.from(`${JSON.stringify(native)}\n`);
    const receipt = Buffer.from(`${JSON.stringify({
      schemaVersion: 2,
      captureMode: "live",
      capturedAt: "2026-07-29T08:00:00.000Z",
      fingerprintSha256: "d".repeat(64),
      acceptedFingerprintSha256: "d".repeat(64),
      artifactSha256s: {
        fingerprint: "d".repeat(64), nativeIdentity: SHA(nativeRaw),
        documents: "e".repeat(64), issueDescriptions: "f".repeat(64),
      },
      source: {
        repository: "meetblakey/sourcera", commit: currentHead, ref: "refs/heads/main",
        runId: "123", runAttempt: "1",
      },
    })}\n`);
    const candidate = buildLinearRequirementLabelReplacementCandidate({
      native,
      sourceCommit,
      nativeIdentitySha256: SHA(nativeRaw),
      captureReceiptSha256: "c".repeat(64),
      newLabelId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    writeFileSync(join(root, "candidate.json"), `${JSON.stringify(candidate)}\n`, { mode: 0o600 });
    writeFileSync(join(root, "native.json"), nativeRaw, { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), receipt, { mode: 0o600 });
    const args = requiredArgs(root);
    args[args.indexOf("--expected-root") + 1] = candidate.root;
    const transition = [
      "--control-transition-source", sourceCommit,
      "--control-transition-candidate-root", candidate.root,
      "--control-transition-head", currentHead,
      "--control-transition-before-root", beforeRoot,
      "--control-transition-after-root", afterRoot,
    ];
    const environment = {
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: currentHead,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    };
    const unpinned = invoke(args, environment, root);
    assert.equal(unpinned.status, 1);
    assert.equal(existsSync(join(root, "journal.jsonl")), false);

    const pinned = invoke([...args, ...transition], environment, root);
    assert.equal(pinned.status, 1);
    assert.equal(existsSync(join(root, "journal.jsonl")), true,
      "exact transition must reach the absent-credential boundary");

    writeFileSync(join(root, allowed[0]!), "after second review\n", { mode: 0o600 });
    git(root, ["add", allowed[0]!]);
    git(root, ["commit", "--quiet", "-m", "later control drift"]);
    const secondHead = git(root, ["rev-parse", "HEAD"]);
    const secondRoot = SHA(Buffer.from(spawnSync("git", ["-C", root, "ls-tree", "-r", "-z", secondHead, "--",
      ".github/workflows/linear-requirement-label-replacement.yml", "delivery/linear-program-scope.json",
      "delivery/linear-project-scope.json", "tools/delivery", "tools/spec-lint/package.json",
      "tools/spec-lint/package-lock.json"], { encoding: "buffer" }).stdout));
    const secondReceipt = JSON.parse(receipt.toString("utf8")) as { source: { commit: string } };
    secondReceipt.source.commit = secondHead;
    writeFileSync(join(root, "capture-receipt.json"), `${JSON.stringify(secondReceipt)}\n`, { mode: 0o600 });
    const secondArgs = [...args];
    for (const [flag, value] of [
      ["--journal-out", join(root, "second-journal.jsonl")],
      ["--receipt-out", join(root, "second-phase-receipt.json")],
      ["--chunk-receipts-out", join(root, "second-core-receipts.jsonl")],
    ] as const) secondArgs[secondArgs.indexOf(flag) + 1] = value;
    const reused = invoke([...secondArgs,
      "--control-transition-source", sourceCommit,
      "--control-transition-candidate-root", candidate.root,
      "--control-transition-head", secondHead,
      "--control-transition-before-root", beforeRoot,
      "--control-transition-after-root", secondRoot,
    ], { ...environment, GITHUB_SHA: secondHead }, root);
    assert.equal(reused.status, 1);
    assert.equal(existsSync(join(root, "second-journal.jsonl")), false,
      "a second commit must not reuse the one-time transition even with recomputed digests");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner admits exactly the three-link semantic-baseline chain and rejects unrelated or later commits", async () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-semantic-transition-"));
  try {
    git(root, ["init", "--quiet"]);
    git(root, ["config", "user.name", "Sourcera test"]);
    git(root, ["config", "user.email", "sourcera-test@example.invalid"]);
    const diagnosticPaths = [
      ".github/workflows/linear-requirement-label-replacement.yml",
      "tools/delivery/lib/linear-requirement-label-replacement.ts",
      "tools/delivery/linear-requirement-label-replacement-runner-cli.test.ts",
      "tools/delivery/linear-requirement-label-replacement-workflow.test.ts",
      "tools/delivery/linear-requirement-label-replacement.test.ts",
      "tools/delivery/run-linear-requirement-label-replacement.ts",
    ];
    const contractPath = "delivery/linear-requirement-label-finalize-transition.json";
    for (const path of diagnosticPaths) {
      const full = join(root, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, "candidate\n", { mode: 0o600 });
    }
    git(root, ["add", ...diagnosticPaths]);
    git(root, ["commit", "--quiet", "-m", "candidate controls"]);
    const sourceCommit = git(root, ["rev-parse", "HEAD"]);
    const candidateControlTreeRoot = controlTreeRoot(root, sourceCommit);

    for (const path of diagnosticPaths) writeFileSync(join(root, path), "diagnostics\n", { mode: 0o600 });
    git(root, ["add", ...diagnosticPaths]);
    git(root, ["commit", "--quiet", "-m", "diagnostics controls"]);
    const diagnosticCommit = git(root, ["rev-parse", "HEAD"]);
    const diagnosticControlTreeRoot = controlTreeRoot(root, diagnosticCommit);

    mkdirSync(dirname(join(root, contractPath)), { recursive: true });
    for (const path of diagnosticPaths) writeFileSync(join(root, path), "finalize transition\n", { mode: 0o600 });
    writeFileSync(join(root, contractPath), "prior transition\n", { mode: 0o600 });
    git(root, ["add", ...diagnosticPaths, contractPath]);
    git(root, ["commit", "--quiet", "-m", "finalize transition controls"]);
    const transitionCommit = git(root, ["rev-parse", "HEAD"]);
    const transitionControlTreeRoot = controlTreeRoot(root, transitionCommit);

    const fixture = await finalizedRunnerFixture(root, {
      withTransition: true,
      sourceCommit,
      captureCommit: transitionCommit,
      diagnosticCommit,
      transitionCommit,
      candidateControlTreeRoot,
      diagnosticControlTreeRoot,
      transitionControlTreeRoot,
    });
    writeFileSync(join(root, contractPath), `${JSON.stringify(fixture.transition)}\n`, { mode: 0o600 });
    for (const path of diagnosticPaths) writeFileSync(join(root, path), "semantic baseline\n", { mode: 0o600 });
    git(root, ["add", ...diagnosticPaths, contractPath]);
    git(root, ["commit", "--quiet", "-m", "semantic baseline controls"]);
    const fixHead = git(root, ["rev-parse", "HEAD"]);
    const fixControlTreeRoot = controlTreeRoot(root, fixHead);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), fixHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), fixHead);
    const transitionFlag = fixture.args.indexOf("--finalize-transition");
    fixture.args[transitionFlag + 1] = join(root, contractPath);
    fixture.args.push(
      "--control-transition-source", transitionCommit,
      "--control-transition-candidate-root", fixture.candidate.root,
      "--control-transition-head", fixHead,
      "--control-transition-before-root", transitionControlTreeRoot,
      "--control-transition-after-root", fixControlTreeRoot,
    );
    const environment = { ...fixture.environment, GITHUB_SHA: fixHead };

    const drifted = structuredClone(fixture.first);
    drifted.teams[0]!.name = "malicious-secret-transition-value";
    fixture.rewriteCapture("first", drifted);
    fixture.rewriteCapture("second", drifted);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), fixHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), fixHead);
    const driftArgs = [...fixture.args];
    for (const [flag, value] of [
      ["--journal-out", join(root, "drift-journal.jsonl")],
      ["--receipt-out", join(root, "drift-receipt.json")],
      ["--chunk-receipts-out", join(root, "drift-core-receipts.jsonl")],
      ["--failure-summary-out", join(root, "drift-failure.json")],
    ] as const) driftArgs[driftArgs.indexOf(flag) + 1] = value;
    const rejectedDrift = invoke(driftArgs, environment, root);
    assert.equal(rejectedDrift.status, 1);
    const driftFailure = readFileSync(join(root, "drift-failure.json"), "utf8");
    assert.match(driftFailure, /present_boundary_validation/);
    assert.doesNotMatch(driftFailure, /malicious-secret-transition-value/);
    assert.equal(existsSync(join(root, "drift-receipt.json")), false);

    const current = structuredClone(fixture.first);
    current.issues[71]!.cycleId = CYCLE_ID;
    fixture.rewriteCapture("first", current);
    fixture.rewriteCapture("second", current);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), fixHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), fixHead);
    const exact = invoke(fixture.args, environment, root);
    assert.equal(exact.status, 0, exact.stderr);
    const exactReceipt = JSON.parse(readFileSync(join(root, "phase-receipt.json"), "utf8")) as {
      applied: number;
      verification: {
        schemaVersion: number;
        transitionRoot: string;
        finalizeControlTransition: { source: string; head: string; beforeRoot: string; afterRoot: string };
        historicalProof: { verifyRunnerRoot: string; retireRunnerRoot: string };
        currentRequirementIssueStates: Array<{ identifier: string; fullStateRoot: string }>;
        currentRequirementIssueStateRoot: string;
        currentGlobalRoot: string;
        requirementUses: number;
        oldLabelUses: number;
        outsideRequirementUses: number;
        stable: boolean;
      };
    };
    assert.equal(exactReceipt.applied, 0);
    assert.equal(exactReceipt.verification.schemaVersion, 3);
    assert.equal(exactReceipt.verification.transitionRoot, fixture.transition!.root);
    assert.deepEqual(exactReceipt.verification.finalizeControlTransition, {
      source: transitionCommit,
      head: fixHead,
      beforeRoot: transitionControlTreeRoot,
      afterRoot: fixControlTreeRoot,
    });
    assert.equal(exactReceipt.verification.historicalProof.verifyRunnerRoot, fixture.transition!.historicalEvidence.verify.runnerRoot);
    assert.equal(exactReceipt.verification.historicalProof.retireRunnerRoot, fixture.transition!.historicalEvidence.retire.runnerRoot);
    assert.equal(exactReceipt.verification.currentRequirementIssueStates.length, 186);
    assert.equal(exactReceipt.verification.currentRequirementIssueStates.find((row) => row.identifier === "REQ-72")?.fullStateRoot === fixture.candidate.issues[71]!.afterIssueRoot, false);
    assert.match(exactReceipt.verification.currentRequirementIssueStateRoot, /^[a-f0-9]{64}$/);
    assert.match(exactReceipt.verification.currentGlobalRoot, /^[a-f0-9]{64}$/);
    assert.equal(exactReceipt.verification.requirementUses, 186);
    assert.equal(exactReceipt.verification.oldLabelUses, 0);
    assert.equal(exactReceipt.verification.outsideRequirementUses, 0);
    assert.equal(exactReceipt.verification.stable, true);
    assert.equal(readFileSync(join(root, "journal.jsonl"), "utf8"), readFileSync(join(root, "previous-journal.jsonl"), "utf8"));

    git(root, ["switch", "--quiet", "-c", "unrelated-finalize", transitionCommit]);
    for (const path of diagnosticPaths) writeFileSync(join(root, path), "semantic baseline\n", { mode: 0o600 });
    mkdirSync(dirname(join(root, contractPath)), { recursive: true });
    writeFileSync(join(root, contractPath), `${JSON.stringify(fixture.transition)}\n`, { mode: 0o600 });
    writeFileSync(join(root, "README.md"), "unrelated\n", { mode: 0o600 });
    git(root, ["add", ...diagnosticPaths, contractPath, "README.md"]);
    git(root, ["commit", "--quiet", "-m", "finalize transition plus unrelated path"]);
    const unrelatedHead = git(root, ["rev-parse", "HEAD"]);
    const unrelatedControlTreeRoot = controlTreeRoot(root, unrelatedHead);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), unrelatedHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), unrelatedHead);
    const unrelatedArgs = [...fixture.args];
    for (const [flag, value] of [
      ["--journal-out", join(root, "unrelated-journal.jsonl")],
      ["--receipt-out", join(root, "unrelated-receipt.json")],
      ["--chunk-receipts-out", join(root, "unrelated-core-receipts.jsonl")],
      ["--failure-summary-out", join(root, "unrelated-failure.json")],
      ["--control-transition-head", unrelatedHead],
      ["--control-transition-after-root", unrelatedControlTreeRoot],
    ] as const) unrelatedArgs[unrelatedArgs.indexOf(flag) + 1] = value;
    const unrelated = invoke(unrelatedArgs, { ...environment, GITHUB_SHA: unrelatedHead }, root);
    assert.equal(unrelated.status, 1);
    assert.equal(existsSync(join(root, "unrelated-journal.jsonl")), false,
      "an unrelated direct-child path must fail before evidence outputs");

    git(root, ["switch", "--quiet", "--detach", fixHead]);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), fixHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), fixHead);
    writeFileSync(join(root, diagnosticPaths[0]!), "third commit\n", { mode: 0o600 });
    git(root, ["add", diagnosticPaths[0]!]);
    git(root, ["commit", "--quiet", "-m", "later control drift"]);
    const thirdHead = git(root, ["rev-parse", "HEAD"]);
    const thirdControlTreeRoot = controlTreeRoot(root, thirdHead);
    rewriteCaptureCommit(join(root, "capture-receipt.json"), thirdHead);
    rewriteCaptureCommit(join(root, "second-capture-receipt.json"), thirdHead);
    const replayArgs = [...fixture.args];
    for (const [flag, value] of [
      ["--journal-out", join(root, "replay-journal.jsonl")],
      ["--receipt-out", join(root, "replay-receipt.json")],
      ["--chunk-receipts-out", join(root, "replay-core-receipts.jsonl")],
      ["--failure-summary-out", join(root, "replay-failure.json")],
      ["--control-transition-head", thirdHead],
      ["--control-transition-after-root", thirdControlTreeRoot],
    ] as const) replayArgs[replayArgs.indexOf(flag) + 1] = value;
    const replay = invoke(replayArgs, { ...environment, GITHUB_SHA: thirdHead }, root);
    assert.equal(replay.status, 1);
    assert.equal(existsSync(join(root, "replay-journal.jsonl")), false,
      "a third commit must fail before evidence outputs even with recomputed head and tree root");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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
    args.push("--failure-summary-out", join(root, "failure-summary.json"));
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
    assert.deepEqual(JSON.parse(readFileSync(join(root, "failure-summary.json"), "utf8")), {
      schemaVersion: 1,
      kind: "linear-requirement-label-replacement-failure-summary",
      phase: "rename",
      code: "phase_execution",
      candidateRoot: candidate.root,
      firstCaptureRoot: null,
      secondCaptureRoot: null,
      differingCatalogs: null,
      firstCatalogRoots: null,
      secondCatalogRoots: null,
      firstCapture: {
        oldLabelCount: 1,
        newLabelCount: 0,
        oldLabelArchivedAtIsNull: true,
        oldLabelRetiredAtIsNull: true,
        labelTotal: 1,
        oldLabelUses: 186,
        newLabelUses: 0,
        outsideNewLabelUses: 0,
        activeRequirementLabelCount: 1,
        protectedRootMatches: true,
      },
      secondCapture: null,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner admits only journal-proven post-rename capture during crash resume", async () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-rename-resume-"));
  try {
    const sourceCommit = git(process.cwd(), ["rev-parse", "HEAD"]);
    const before = nativeFixture();
    const beforeRaw = Buffer.from(`${JSON.stringify(before)}\n`);
    const candidate = buildLinearRequirementLabelReplacementCandidate({
      native: before,
      sourceCommit,
      nativeIdentitySha256: SHA(beforeRaw),
      captureReceiptSha256: "c".repeat(64),
      newLabelId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    let oldLabel = structuredClone(before.labels[0]!);
    const transport: LinearRequirementLabelReplacementTransport = {
      async readLabel(id) {
        if (id === OLD_REQUIREMENT_LABEL_ID) return structuredClone(oldLabel);
        return null;
      },
      async readIssue() { return null; },
      async listIssueIdsByLabel() { return []; },
      async renameLabel(input) {
        oldLabel = { ...oldLabel, name: input.name };
        throw new Error("simulated post-rename crash");
      },
      async createLabel() { throw new Error("unexpected create"); },
      async replaceIssueLabels() { throw new Error("unexpected issue mutation"); },
      async setLabelRetired() { throw new Error("unexpected retirement"); },
    };
    const started: string[] = [];
    await assert.rejects(executeLinearRequirementLabelReplacementPhase({
      candidate,
      expectedCandidateRoot: candidate.root,
      phase: "rename",
      authorization: {
        candidateRoot: candidate.root,
        phase: "rename",
        confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
      },
      runId: "123.1.rename.forward",
      transport,
      journalSink: (line) => { started.push(line); },
      clock: () => new Date("2026-07-29T00:00:00.000Z"),
    }), /simulated post-rename crash/);
    assert.equal(started.length, 1);

    const after = nativeFixture();
    after.labels[0]!.name = RETIRED_REQUIREMENT_LABEL_NAME;
    const afterRaw = Buffer.from(`${JSON.stringify(after)}\n`);
    const captureReceipt = {
      schemaVersion: 2,
      captureMode: "live",
      capturedAt: "2026-07-29T08:00:00.000Z",
      fingerprintSha256: "d".repeat(64),
      acceptedFingerprintSha256: "d".repeat(64),
      artifactSha256s: {
        fingerprint: "d".repeat(64),
        nativeIdentity: SHA(afterRaw),
        documents: "e".repeat(64),
        issueDescriptions: "f".repeat(64),
      },
      source: {
        repository: "meetblakey/sourcera",
        commit: sourceCommit,
        ref: "refs/heads/main",
        runId: "123",
        runAttempt: "1",
      },
    };
    const resumeJournal = started.join("");
    writeFileSync(join(root, "candidate.json"), `${JSON.stringify(candidate)}\n`, { mode: 0o600 });
    writeFileSync(join(root, "native.json"), afterRaw, { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), `${JSON.stringify(captureReceipt)}\n`, { mode: 0o600 });
    writeFileSync(join(root, "resume-journal.jsonl"), resumeJournal, { mode: 0o600 });
    writeFileSync(join(root, "resume-receipts.jsonl"), "", { mode: 0o600 });

    const args = requiredArgs(root);
    args[args.indexOf("--expected-root") + 1] = candidate.root;
    const unproven = invoke(args, {
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: sourceCommit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    });
    assert.equal(unproven.status, 1);
    assert.equal(existsSync(join(root, "journal.jsonl")), false,
      "post-rename capture without a pinned resume journal must fail before outputs");
    args.push(
      "--resume-journal", join(root, "resume-journal.jsonl"),
      "--expected-resume-journal-sha256", SHA(resumeJournal),
      "--resume-receipts", join(root, "resume-receipts.jsonl"),
      "--expected-resume-receipts-sha256", SHA(""),
    );
    const drifted = structuredClone(after);
    drifted.issues[0]!.labelIds = [candidate.newLabel.id];
    const driftedRaw = Buffer.from(`${JSON.stringify(drifted)}\n`);
    captureReceipt.artifactSha256s.nativeIdentity = SHA(driftedRaw);
    writeFileSync(join(root, "native.json"), driftedRaw, { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), `${JSON.stringify(captureReceipt)}\n`, { mode: 0o600 });
    const driftedResult = invoke(args, {
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: sourceCommit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    });
    assert.equal(driftedResult.status, 1);
    assert.equal(existsSync(join(root, "journal.jsonl")), false,
      "journal proof must not excuse any issue-assignment drift during rename recovery");

    captureReceipt.artifactSha256s.nativeIdentity = SHA(afterRaw);
    writeFileSync(join(root, "native.json"), afterRaw, { mode: 0o600 });
    writeFileSync(join(root, "capture-receipt.json"), `${JSON.stringify(captureReceipt)}\n`, { mode: 0o600 });
    const { LINEAR_API_KEY: _credential, ...environment } = process.env;
    const result = invoke(args, {
      ...environment,
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: sourceCommit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    });
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "Linear Requirement label replacement failed\n");
    assert.equal(readFileSync(join(root, "journal.jsonl"), "utf8"), resumeJournal,
      "exact post-rename recovery must reach the credential boundary with its durable journal intact");
    assert.equal(readFileSync(join(root, "phase-core-receipts.jsonl"), "utf8"), "");
    assert.equal(existsSync(join(root, "phase-receipt.json")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner classifies a missing retired label before output without leaking capture content", async () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-finalize-replay-"));
  try {
    const fixture = await finalizedRunnerFixture(root);
    const missingOld = structuredClone(fixture.first);
    missingOld.labels = missingOld.labels.filter((label) => label.id !== OLD_REQUIREMENT_LABEL_ID);
    fixture.rewriteCapture("first", missingOld);
    const result = invoke(fixture.args, fixture.environment);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "Linear Requirement label replacement failed\n");
    const raw = readFileSync(join(root, "failure-summary.json"), "utf8");
    const summary = JSON.parse(raw) as Record<string, unknown>;
    assert.equal(summary.code, "stable_capture_validation");
    assert.deepEqual(summary.firstCapture, {
      oldLabelCount: 0,
      newLabelCount: 1,
      oldLabelArchivedAtIsNull: null,
      oldLabelRetiredAtIsNull: null,
      labelTotal: 1,
      oldLabelUses: 0,
      newLabelUses: 186,
      outsideNewLabelUses: 0,
      activeRequirementLabelCount: 1,
      protectedRootMatches: true,
    });
    assert.doesNotMatch(raw, /Requirement 1|description-1|Canonical binding product/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runner reports fixed catalog roots for two-capture instability", async () => {
  const root = mkdtempSync(join(tmpdir(), "linear-requirement-label-finalize-stable-"));
  try {
    const fixture = await finalizedRunnerFixture(root);
    const drifted = structuredClone(fixture.second);
    drifted.coverage.totals.labels += 1;
    fixture.rewriteCapture("second", drifted);
    const result = invoke(fixture.args, fixture.environment);
    assert.equal(result.status, 1);
    const raw = readFileSync(join(root, "failure-summary.json"), "utf8");
    const summary = JSON.parse(raw) as Record<string, unknown> & {
      differingCatalogs: string[];
      firstCatalogRoots: Record<string, string>;
      secondCatalogRoots: Record<string, string>;
    };
    assert.equal(summary.code, "stable_capture_validation");
    assert.deepEqual(summary.differingCatalogs, ["coverage"]);
    const fixedKeys = [
      "schemaVersion", "workspace", "issues", "labels", "relations", "teams", "workflowStates",
      "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones",
      "cycles", "documents", "rawDocumentIds", "coverage",
    ].sort();
    assert.deepEqual(Object.keys(summary.firstCatalogRoots).sort(), fixedKeys);
    assert.deepEqual(Object.keys(summary.secondCatalogRoots).sort(), fixedKeys);
    assert.doesNotMatch(raw, /Requirement 1|description-1|Canonical binding product/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
