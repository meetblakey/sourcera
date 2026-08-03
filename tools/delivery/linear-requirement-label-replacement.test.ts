import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  EXPECTED_REQUIREMENT_ISSUE_COUNT,
  OLD_REQUIREMENT_LABEL_ID,
  REQUIREMENTS_TEAM_ID,
  RETIRED_REQUIREMENT_LABEL_NAME,
  assertLinearRequirementLabelReplacementCandidate,
  assertLinearRequirementLabelFinalizeTransitionContract,
  buildLinearRequirementLabelReplacementCandidate,
  compareLinearRequirementLabelReplacementStableCaptures,
  compensateLinearRequirementLabelReplacementPhase,
  executeLinearRequirementLabelReplacementPhase,
  requirementLabelRollbackName,
  verifyLinearRequirementLabelAcceptedProtectedTransition,
  verifyLinearRequirementLabelReplacementFinal,
  verifyLinearRequirementLabelReplacementFinalWithTransition,
  verifyLinearRequirementLabelReplacementUsage,
  type LinearRequirementLabelFinalizeTransitionContract,
  type LinearRequirementLabelCapture,
  type LinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementTransport,
} from "./lib/linear-requirement-label-replacement.js";

const NEW_LABEL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CYCLE_ID = "d745c4db-3f58-4862-b7e3-9ddfa869b403";
const CYCLE_BEFORE = "2026-07-28T14:36:15.374Z";
const CYCLE_AFTER = "2026-07-29T14:35:38.730Z";
const SHA = (value: string): string => createHash("sha256").update(value).digest("hex");
const CANONICAL = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(CANONICAL).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${CANONICAL(row[key])}`).join(",")}}`;
};

function issueId(index: number): string {
  return `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function fixture(): LinearRequirementLabelCapture {
  const issues = Array.from({ length: EXPECTED_REQUIREMENT_ISSUE_COUNT }, (_, offset) => {
    const number = offset + 1;
    return {
      issueUuid: issueId(number),
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

function candidate(native = fixture()): LinearRequirementLabelReplacementCandidate {
  return buildLinearRequirementLabelReplacementCandidate({
    native,
    sourceCommit: "a".repeat(40),
    nativeIdentitySha256: "b".repeat(64),
    captureReceiptSha256: "c".repeat(64),
    newLabelId: NEW_LABEL_ID,
  });
}

function withProtectedCycle(native: LinearRequirementLabelCapture, updatedAt = CYCLE_BEFORE): LinearRequirementLabelCapture {
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

function transitionContract(
  plan: LinearRequirementLabelReplacementCandidate,
  beforeCycles: LinearRequirementLabelCapture["cycles"],
  afterCycles: LinearRequirementLabelCapture["cycles"],
): LinearRequirementLabelFinalizeTransitionContract {
  const body = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-finalize-transition" as const,
    candidateRoot: plan.root,
    candidateSourceCommit: plan.sourceCommit,
    diagnosticCommit: "d".repeat(40),
    previousReceiptRoot: "9".repeat(64),
    candidateControlTreeRoot: "1".repeat(64),
    diagnosticControlTreeRoot: "2".repeat(64),
    normalizedFingerprintSha256: "3".repeat(64),
    evidence: {
      before: {
        artifactId: "8722916951",
        artifactName: `linear-drift-fingerprint-${plan.sourceCommit}-30448115612-1`,
        artifactDigest: `sha256:${"4".repeat(64)}`,
        runId: "30448115612",
        runAttempt: "1",
        commit: plan.sourceCommit,
        capturedAt: "2026-07-29T11:56:36.152Z",
        fingerprintSha256: "5".repeat(64),
        receiptSha256: "6".repeat(64),
      },
      after: {
        artifactId: "8731405740",
        artifactName: `linear-drift-fingerprint-${"d".repeat(40)}-30470152687-1`,
        artifactDigest: `sha256:${"7".repeat(64)}`,
        runId: "30470152687",
        runAttempt: "1",
        commit: "d".repeat(40),
        capturedAt: "2026-07-29T16:22:28.303Z",
        fingerprintSha256: "8".repeat(64),
        receiptSha256: "a".repeat(64),
      },
    },
    protectedTransition: {
      catalog: "cycles" as const,
      cycleId: CYCLE_ID,
      cycleNumber: 7,
      field: "updatedAt" as const,
      beforeValue: CYCLE_BEFORE,
      afterValue: CYCLE_AFTER,
      beforeCatalogRoot: SHA(CANONICAL(beforeCycles)),
      afterCatalogRoot: SHA(CANONICAL(afterCycles)),
      candidateProtectedNativeStateRoot: plan.protectedNativeStateRoot,
    },
  };
  return { ...body, root: SHA(CANONICAL(body)) };
}

function resealTransition(
  transition: LinearRequirementLabelFinalizeTransitionContract,
): LinearRequirementLabelFinalizeTransitionContract {
  const { root: _root, ...body } = structuredClone(transition);
  return { ...body, root: SHA(CANONICAL(body)) };
}

test("seals the exact 189-write replacement in deterministic order", () => {
  const plan = candidate();
  assert.equal(plan.mutationAuthorized, false);
  assert.equal(plan.oldLabel.id, OLD_REQUIREMENT_LABEL_ID);
  assert.equal(plan.oldLabel.teamId, null);
  assert.equal(plan.newLabel.id, NEW_LABEL_ID);
  assert.equal(plan.newLabel.teamId, REQUIREMENTS_TEAM_ID);
  assert.equal(plan.retiredName, RETIRED_REQUIREMENT_LABEL_NAME);
  assert.equal(plan.issues.length, EXPECTED_REQUIREMENT_ISSUE_COUNT);
  assert.equal(plan.operations.length, 189);
  assert.deepEqual(plan.operations.map((row) => row.phase).slice(0, 3), ["rename", "create", "replace"]);
  assert.equal(plan.operations.at(-1)?.phase, "retire");
  assert.equal(plan.operations.filter((row) => row.phase === "replace").length, 186);
  assert.match(plan.expectedCurrentRoot, /^[a-f0-9]{64}$/);
  assert.match(plan.protectedNativeStateRoot, /^[a-f0-9]{64}$/);
  assert.match(plan.operationsRoot, /^[a-f0-9]{64}$/);
  assert.match(plan.root, /^[a-f0-9]{64}$/);
  assert.doesNotThrow(() => assertLinearRequirementLabelReplacementCandidate(plan));
});

test("rejects scope, cardinality, collision, outside use, and sealed-plan drift", () => {
  const wrongScope = fixture();
  wrongScope.labels[0]!.teamId = REQUIREMENTS_TEAM_ID;
  wrongScope.labels[0]!.teamKey = "REQ";
  assert.throws(() => candidate(wrongScope), /old Requirement label.*scope|workspace scope/i);

  const short = fixture();
  short.issues.pop();
  assert.throws(() => candidate(short), /exactly 186/i);

  const outside = fixture();
  outside.issues[0]!.teamId = "40000000-0000-4000-8000-000000000001";
  assert.throws(() => candidate(outside), /outside.*REQ|Requirements team/i);

  assert.throws(
    () => buildLinearRequirementLabelReplacementCandidate({
      native: fixture(), sourceCommit: "a".repeat(40), nativeIdentitySha256: "b".repeat(64),
      captureReceiptSha256: "c".repeat(64), newLabelId: OLD_REQUIREMENT_LABEL_ID,
    }),
    /collision|new label UUID/i,
  );

  const nameCollision = fixture();
  nameCollision.labels.push({ ...nameCollision.labels[0]!, id: "50000000-0000-4000-8000-000000000001", name: RETIRED_REQUIREMENT_LABEL_NAME });
  assert.throws(() => candidate(nameCollision), /retired name.*collision/i);

  const tampered = structuredClone(candidate());
  tampered.operations[2]!.operationKey = "tampered";
  assert.throws(() => assertLinearRequirementLabelReplacementCandidate(tampered), /operation|seal|root/i);

  const extra = structuredClone(candidate()) as LinearRequirementLabelReplacementCandidate & { payload: string };
  extra.payload = "must-not-enter-safe-evidence";
  const { root: _root, ...body } = extra;
  extra.root = SHA(CANONICAL(body));
  assert.throws(() => assertLinearRequirementLabelReplacementCandidate(extra), /candidate keys/i);
});

test("requires explicit retiredAt evidence at capture and direct-read trust boundaries", async () => {
  const missingAtBuild = fixture();
  delete (missingAtBuild.labels[0]! as unknown as { retiredAt?: string | null }).retiredAt;
  assert.throws(() => candidate(missingAtBuild), /retiredAt.*evidence/i);

  const plan = candidate();
  const transport = new FakeTransport();
  delete (transport.labels.get(OLD_REQUIREMENT_LABEL_ID)! as unknown as { retiredAt?: string | null }).retiredAt;
  await assert.rejects(executeLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase: "rename",
    authorization: authorization(plan, "rename"),
    runId: "missing-retirement-readback",
    transport,
  }), /retiredAt.*evidence/i);

  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = null;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const captured = finalCapture(plan, transport);
  delete (captured.labels.find((label) => label.id === NEW_LABEL_ID)! as unknown as { retiredAt?: string | null }).retiredAt;
  assert.throws(() => verifyLinearRequirementLabelReplacementUsage(plan, captured), /retiredAt.*evidence/i);
});

class FakeTransport implements LinearRequirementLabelReplacementTransport {
  readonly calls: string[] = [];
  readonly labels = new Map(fixture().labels.map((row) => [row.id, structuredClone(row)]));
  readonly issues = new Map(fixture().issues.map((row) => [row.issueUuid, structuredClone(row)]));
  crashAfterCall: string | null = null;

  private crash(call: string): void {
    if (this.crashAfterCall === call) {
      this.crashAfterCall = null;
      throw new Error(`simulated crash after ${call}`);
    }
  }

  async readLabel(id: string) {
    this.calls.push(`read-label:${id}`);
    return structuredClone(this.labels.get(id) ?? null);
  }

  async readIssue(id: string) {
    this.calls.push(`read-issue:${id}`);
    return structuredClone(this.issues.get(id) ?? null);
  }

  async listIssueIdsByLabel(id: string) {
    this.calls.push(`list-label:${id}`);
    return [...this.issues.values()].filter((row) => row.labelIds.includes(id)).map((row) => row.issueUuid).sort();
  }

  async renameLabel(input: { id: string; name: string }) {
    const call = `rename:${input.id}:${input.name}`;
    this.calls.push(call);
    this.labels.get(input.id)!.name = input.name;
    this.crash(call);
  }

  async createLabel(input: LinearRequirementLabelReplacementCandidate["newLabel"]) {
    const call = `create:${input.id}`;
    this.calls.push(call);
    this.labels.set(input.id, { ...structuredClone(input), archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: null, parentName: null, teamKey: "REQ" });
    this.crash(call);
  }

  async replaceIssueLabels(input: { issueId: string; labelIds: string[] }) {
    const call = `replace:${input.issueId}`;
    this.calls.push(call);
    this.issues.get(input.issueId)!.labelIds = [...input.labelIds];
    this.crash(call);
  }

  async setLabelRetired(input: { id: string; retired: boolean }) {
    const call = `retire:${input.id}:${input.retired}`;
    this.calls.push(call);
    this.labels.get(input.id)!.retiredAt = input.retired ? "2026-07-29T00:00:00.000Z" : null;
    this.crash(call);
  }
}

const authorization = (plan: LinearRequirementLabelReplacementCandidate, phase: "rename" | "create" | "replace" | "retire") => ({
  candidateRoot: plan.root,
  phase,
  confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE" as const,
});

type Phase = "rename" | "create" | "replace" | "retire";
type PhaseReceipt = Awaited<ReturnType<typeof executeLinearRequirementLabelReplacementPhase>>["receipts"][number];
interface Progress { journalRaw: string; receipts: PhaseReceipt[] }

async function applyForward(
  plan: LinearRequirementLabelReplacementCandidate,
  transport: FakeTransport,
  progress: Progress,
  phase: Phase,
) {
  const result = await executeLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase,
    authorization: authorization(plan, phase),
    runId: `forward-${phase}-${progress.receipts.length}`,
    transport,
    resumeJournalRaw: progress.journalRaw || undefined,
    expectedResumeJournalSha256: progress.journalRaw ? SHA(progress.journalRaw) : undefined,
    receipts: progress.receipts,
    clock: () => new Date("2026-07-29T00:00:00.000Z"),
  });
  progress.journalRaw = result.journalRaw;
  progress.receipts.push(...result.receipts);
  return result;
}

async function compensate(
  plan: LinearRequirementLabelReplacementCandidate,
  transport: FakeTransport,
  progress: Progress,
  phase: Phase,
) {
  const result = await compensateLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase,
    authorization: {
      candidateRoot: plan.root,
      phase,
      confirmation: "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
    },
    runId: `compensate-${phase}-${progress.receipts.length}`,
    transport,
    resumeJournalRaw: progress.journalRaw,
    expectedResumeJournalSha256: SHA(progress.journalRaw),
    receipts: progress.receipts,
    clock: () => new Date("2026-07-29T01:00:00.000Z"),
  });
  progress.journalRaw = result.journalRaw;
  progress.receipts.push(...result.receipts);
  return result;
}

async function crashAndRecoverForward(
  plan: LinearRequirementLabelReplacementCandidate,
  transport: FakeTransport,
  progress: Progress,
  phase: Phase,
  crashAfterCall: string,
) {
  const journalLines: string[] = [];
  transport.crashAfterCall = crashAfterCall;
  await assert.rejects(executeLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase,
    authorization: authorization(plan, phase),
    runId: `forward-crash-${phase}`,
    transport,
    resumeJournalRaw: progress.journalRaw || undefined,
    expectedResumeJournalSha256: progress.journalRaw ? SHA(progress.journalRaw) : undefined,
    receipts: progress.receipts,
    journalSink: (line) => { journalLines.push(line); },
    clock: () => new Date("2026-07-29T02:00:00.000Z"),
  }), /simulated crash after/i);
  assert.equal(journalLines.length, 1, "crash must leave exactly one durable started record");
  progress.journalRaw += journalLines.join("");
  const mutationCount = transport.calls.filter((call) => call === crashAfterCall).length;
  const recovered = await applyForward(plan, transport, progress, phase);
  assert.equal(transport.calls.filter((call) => call === crashAfterCall).length, mutationCount, "recovery must not repeat the completed mutation");
  assert.equal(recovered.alreadyApplied, 1);
  return recovered;
}

async function crashAndRecoverCompensation(
  plan: LinearRequirementLabelReplacementCandidate,
  transport: FakeTransport,
  progress: Progress,
  phase: Phase,
  crashAfterCall: string,
) {
  const journalLines: string[] = [];
  transport.crashAfterCall = crashAfterCall;
  await assert.rejects(compensateLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase,
    authorization: {
      candidateRoot: plan.root,
      phase,
      confirmation: "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
    },
    runId: `compensation-crash-${phase}`,
    transport,
    resumeJournalRaw: progress.journalRaw,
    expectedResumeJournalSha256: SHA(progress.journalRaw),
    receipts: progress.receipts,
    journalSink: (line) => { journalLines.push(line); },
    clock: () => new Date("2026-07-29T03:00:00.000Z"),
  }), /simulated crash after/i);
  assert.equal(journalLines.length, 1, "compensation crash must leave exactly one durable started record");
  progress.journalRaw += journalLines.join("");
  const mutationCount = transport.calls.filter((call) => call === crashAfterCall).length;
  const recovered = await compensate(plan, transport, progress, phase);
  assert.equal(transport.calls.filter((call) => call === crashAfterCall).length, mutationCount, "compensation recovery must not repeat the completed mutation");
  return recovered;
}

test("executes exactly one phase with direct pre/post reads and a sealed journal receipt", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const rename = await executeLinearRequirementLabelReplacementPhase({
    candidate: plan, expectedCandidateRoot: plan.root, phase: "rename", authorization: authorization(plan, "rename"),
    runId: "run-1", transport, clock: () => new Date("2026-07-29T00:00:00.000Z"),
  });
  assert.equal(rename.applied, 1);
  assert.equal(rename.receipts.length, 1);
  assert.equal(rename.receipts[0]!.phaseComplete, true);
  assert.match(rename.journalSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(transport.calls, [
    `read-label:${OLD_REQUIREMENT_LABEL_ID}`,
    `read-label:${NEW_LABEL_ID}`,
    `rename:${OLD_REQUIREMENT_LABEL_ID}:${RETIRED_REQUIREMENT_LABEL_NAME}`,
    `read-label:${OLD_REQUIREMENT_LABEL_ID}`,
  ]);
  assert.equal(transport.labels.has(NEW_LABEL_ID), false, "rename invocation must stop before create");

  const recoveredTransport = new FakeTransport();
  recoveredTransport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  const startedOnly = `${rename.journalRaw.split("\n")[0]}\n`;
  const recovered = await executeLinearRequirementLabelReplacementPhase({
    candidate: plan, expectedCandidateRoot: plan.root, phase: "rename", authorization: authorization(plan, "rename"),
    runId: "run-1-recover", transport: recoveredTransport, resumeJournalRaw: startedOnly,
    expectedResumeJournalSha256: SHA(startedOnly), clock: () => new Date("2026-07-29T00:01:00.000Z"),
  });
  assert.equal(recovered.applied, 0);
  assert.equal(recovered.alreadyApplied, 1);
  assert.equal(recovered.receipts[0]?.phaseComplete, true);
  assert.equal(recoveredTransport.calls.some((row) => row.startsWith("rename:")), false);

  await assert.rejects(
    executeLinearRequirementLabelReplacementPhase({
      candidate: plan, expectedCandidateRoot: plan.root, phase: "create", authorization: authorization(plan, "create"),
      runId: "run-2", transport, resumeJournalRaw: rename.journalRaw,
      expectedResumeJournalSha256: "0".repeat(64), receipts: rename.receipts,
    }),
    /journal digest/i,
  );
});

test("runs 186 replacements serially, resumes only from matching journal, and retires without delete", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  await applyForward(plan, transport, progress, "rename");
  await applyForward(plan, transport, progress, "create");
  const receiptsBeforeReplace = [...progress.receipts];
  const replacement = await applyForward(plan, transport, progress, "replace");
  assert.equal(replacement.applied, 186);
  assert.equal(transport.calls.filter((row) => row.startsWith("replace:")).length, 186);
  assert.ok(replacement.receipts.length > 1, "replacement must emit bounded chunk receipts");
  const firstId = plan.issues[0]!.issueId;
  const firstMutation = transport.calls.indexOf(`replace:${firstId}`);
  assert.equal(transport.calls[firstMutation - 1], `read-issue:${firstId}`);
  assert.equal(transport.calls[firstMutation + 1], `read-issue:${firstId}`);

  const replay = await executeLinearRequirementLabelReplacementPhase({
    candidate: plan, expectedCandidateRoot: plan.root, phase: "replace", authorization: authorization(plan, "replace"),
    runId: "run-resume", transport, resumeJournalRaw: replacement.journalRaw,
    expectedResumeJournalSha256: replacement.journalSha256, receipts: receiptsBeforeReplace,
  });
  assert.equal(replay.applied, 0);
  assert.equal(replay.alreadyApplied, 186);
  assert.equal(replay.receipts.length, 1);
  assert.equal(replay.receipts[0]!.phaseComplete, true);
  assert.equal(transport.calls.filter((row) => row.startsWith("replace:")).length, 186);

  const retired = await applyForward(plan, transport, progress, "retire");
  assert.equal(retired.applied, 1);
  assert.ok(transport.calls.includes(`retire:${OLD_REQUIREMENT_LABEL_ID}:true`));
  assert.equal(transport.calls.some((row) => row.startsWith("delete:")), false);
});

test("recovers forward rename, create, and retire crashes after the write without repeating mutations", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };

  await crashAndRecoverForward(
    plan,
    transport,
    progress,
    "rename",
    `rename:${OLD_REQUIREMENT_LABEL_ID}:${RETIRED_REQUIREMENT_LABEL_NAME}`,
  );
  await crashAndRecoverForward(plan, transport, progress, "create", `create:${NEW_LABEL_ID}`);
  await applyForward(plan, transport, progress, "replace");
  await crashAndRecoverForward(plan, transport, progress, "retire", `retire:${OLD_REQUIREMENT_LABEL_ID}:true`);

  assert.equal(transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt, "2026-07-29T00:00:00.000Z");
  assert.ok(transport.calls.filter((call) => call === `list-label:${OLD_REQUIREMENT_LABEL_ID}`).length >= 3);
  assert.ok(transport.calls.filter((call) => call === `list-label:${NEW_LABEL_ID}`).length >= 3);
});

test("reconciles a landed 26th forward replacement before direct compensation", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  await applyForward(plan, transport, progress, "rename");
  await applyForward(plan, transport, progress, "create");

  const journalLines: string[] = [];
  const chunkReceipts: PhaseReceipt[] = [];
  const landed = plan.issues[25]!;
  transport.crashAfterCall = `replace:${landed.issueId}`;
  await assert.rejects(executeLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase: "replace",
    authorization: authorization(plan, "replace"),
    runId: "partial-forward-replace",
    transport,
    resumeJournalRaw: progress.journalRaw,
    expectedResumeJournalSha256: SHA(progress.journalRaw),
    receipts: progress.receipts,
    journalSink: (line) => { journalLines.push(line); },
    receiptSink: (receipt) => { chunkReceipts.push(receipt); },
    clock: () => new Date("2026-07-29T02:30:00.000Z"),
  }), /simulated crash after/i);
  assert.equal(chunkReceipts.length, 1);
  assert.equal(chunkReceipts[0]!.completedOperations, 25);
  assert.equal(journalLines.length, 51);
  progress.journalRaw += journalLines.join("");
  progress.receipts.push(...chunkReceipts);

  const reversed = await compensate(plan, transport, progress, "replace");
  assert.equal(reversed.compensated, 26);
  assert.deepEqual(reversed.receipts.map((receipt) => receipt.direction), ["forward", "compensation"]);
  assert.equal(reversed.receipts[0]!.completedOperations, 26);
  assert.equal(reversed.receipts[0]!.chunk, 2);
  assert.equal(reversed.receipts[1]!.chunk, 1);
  assert.equal(transport.calls.filter((call) => call === `replace:${landed.issueId}`).length, 2);
  assert.ok([...transport.issues.values()].every((row) =>
    row.labelIds.includes(OLD_REQUIREMENT_LABEL_ID) && !row.labelIds.includes(NEW_LABEL_ID)));
  const records = progress.journalRaw.trimEnd().split("\n").map((line) => JSON.parse(line) as Record<string, unknown>);
  assert.ok(records.some((record) => record.operationKey === `issue:${landed.identifier}:replace-requirement-label` &&
    record.direction === "forward" && record.status === "applied"));
  assert.ok(records.some((record) => record.operationKey === `issue:${landed.identifier}:replace-requirement-label` &&
    record.direction === "compensation" && record.status === "compensated"));
});

test("reverses retire, replace, create, and rename with crash-safe compensation and no delete", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  for (const phase of ["rename", "create", "replace", "retire"] as const) {
    await applyForward(plan, transport, progress, phase);
  }

  await crashAndRecoverCompensation(plan, transport, progress, "retire", `retire:${OLD_REQUIREMENT_LABEL_ID}:false`);
  await crashAndRecoverCompensation(plan, transport, progress, "replace", `replace:${plan.issues.at(-1)!.issueId}`);
  await crashAndRecoverCompensation(
    plan,
    transport,
    progress,
    "create",
    `rename:${NEW_LABEL_ID}:${requirementLabelRollbackName(NEW_LABEL_ID)}`,
  );
  const createOperation = plan.operations.find((operation) => operation.kind === "create_label")!;
  const createCompensationRecord = progress.journalRaw.trimEnd().split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>)
    .find((record) => record.operationKey === createOperation.operationKey &&
      record.direction === "compensation" && record.status === "compensated")!;
  assert.equal(createCompensationRecord.beforeStateRoot, createOperation.expectedAfterStateRoot);
  assert.notEqual(createCompensationRecord.afterStateRoot, createOperation.expectedBeforeStateRoot,
    "create compensation must seal the residual rollback-retired label, not false absence");
  await crashAndRecoverCompensation(plan, transport, progress, "rename", `rename:${OLD_REQUIREMENT_LABEL_ID}:Requirement`);

  const old = transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!;
  const replacement = transport.labels.get(NEW_LABEL_ID)!;
  assert.equal(old.name, "Requirement");
  assert.equal(old.retiredAt, null);
  assert.equal(replacement.name, requirementLabelRollbackName(NEW_LABEL_ID));
  assert.equal(replacement.retiredAt, "2026-07-29T00:00:00.000Z");
  assert.ok([...transport.issues.values()].every((row) =>
    row.labelIds.includes(OLD_REQUIREMENT_LABEL_ID) && !row.labelIds.includes(NEW_LABEL_ID)));
  assert.equal(transport.calls.some((call) => call.startsWith("delete:")), false);
});

test("reconciles create compensation after crashing once the rollback-named label is retired", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  for (const phase of ["rename", "create", "replace", "retire"] as const) {
    await applyForward(plan, transport, progress, phase);
  }
  await compensate(plan, transport, progress, "retire");
  await compensate(plan, transport, progress, "replace");

  await crashAndRecoverCompensation(plan, transport, progress, "create", `retire:${NEW_LABEL_ID}:true`);
  assert.equal(transport.calls.filter((call) => call === `rename:${NEW_LABEL_ID}:${requirementLabelRollbackName(NEW_LABEL_ID)}`).length, 1);
  assert.equal(transport.labels.get(NEW_LABEL_ID)!.name, requirementLabelRollbackName(NEW_LABEL_ID));
  assert.equal(transport.labels.get(NEW_LABEL_ID)!.retiredAt, "2026-07-29T00:00:00.000Z");
});

test("recovers after the final compensated journal record but before its receipt", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  await applyForward(plan, transport, progress, "rename");

  const journalLines: string[] = [];
  await assert.rejects(compensateLinearRequirementLabelReplacementPhase({
    candidate: plan,
    expectedCandidateRoot: plan.root,
    phase: "rename",
    authorization: {
      candidateRoot: plan.root,
      phase: "rename",
      confirmation: "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
    },
    runId: "crash-before-compensation-receipt",
    transport,
    resumeJournalRaw: progress.journalRaw,
    expectedResumeJournalSha256: SHA(progress.journalRaw),
    receipts: progress.receipts,
    journalSink: (line) => { journalLines.push(line); },
    receiptSink: () => { throw new Error("simulated crash before compensation receipt"); },
    clock: () => new Date("2026-07-29T04:00:00.000Z"),
  }), /simulated crash before compensation receipt/i);
  assert.equal(journalLines.length, 2);
  assert.equal((JSON.parse(journalLines.at(-1)!) as Record<string, unknown>).status, "compensated");
  progress.journalRaw += journalLines.join("");
  const compensationMutation = `rename:${OLD_REQUIREMENT_LABEL_ID}:Requirement`;
  assert.equal(transport.calls.filter((call) => call === compensationMutation).length, 1);

  const recovered = await compensate(plan, transport, progress, "rename");
  assert.equal(recovered.compensated, 0);
  assert.equal(recovered.alreadyCompensated, 1);
  assert.equal(recovered.appendedJournalRaw, "");
  assert.equal(recovered.receipts.length, 1);
  assert.equal(recovered.receipts[0]!.direction, "compensation");
  assert.equal(recovered.receipts[0]!.phaseComplete, true);
  assert.equal(transport.calls.filter((call) => call === compensationMutation).length, 1);

  const replay = await compensate(plan, transport, progress, "rename");
  assert.equal(replay.compensated, 0);
  assert.equal(replay.alreadyCompensated, 1);
  assert.equal(replay.receipts.length, 0, "existing complete compensation receipt must be reused");
  assert.equal(transport.calls.filter((call) => call === compensationMutation).length, 1);
});

function finalCapture(plan: LinearRequirementLabelReplacementCandidate, transport: FakeTransport): LinearRequirementLabelCapture {
  const native = fixture();
  native.issues = [...transport.issues.values()].map((row) => structuredClone(row));
  native.labels = [...transport.labels.values()].map((row) => structuredClone(row));
  native.coverage.totals.labels = native.labels.length;
  native.coverage.totals.labelAssignments = native.issues.reduce((total, row) => total + row.labelIds.length, 0);
  assert.equal(plan.issues.length, native.issues.length);
  return native;
}

test("proves zero old uses, exactly 186 REQ uses, protected-state equality, and two stable captures", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = "2026-07-29T00:00:00.000Z";
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const first = finalCapture(plan, transport);
  const second = structuredClone(first);
  (second.coverage as unknown as Record<string, unknown>).topLevel = { issues: { attempts: 2 } };
  assert.doesNotThrow(() => verifyLinearRequirementLabelReplacementUsage(plan, first, { oldRetired: true }));
  const receipt = verifyLinearRequirementLabelReplacementFinal({
    candidate: plan,
    first,
    second,
    firstCaptureSha256: SHA(JSON.stringify(first)),
    secondCaptureSha256: SHA(JSON.stringify(second)),
  });
  assert.equal(receipt.requirementUses, 186);
  assert.equal(receipt.oldLabelUses, 0);
  assert.equal(receipt.stable, true);
  assert.match(receipt.root, /^[a-f0-9]{64}$/);

  second.issues[0]!.descriptionSha256 = SHA("drift");
  assert.throws(() => verifyLinearRequirementLabelReplacementFinal({
    candidate: plan, first, second, firstCaptureSha256: SHA(JSON.stringify(first)), secondCaptureSha256: SHA(JSON.stringify(second)),
  }), /stable|protected|drift/i);
});

test("reports only the changed semantic catalog when final captures differ", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = "2026-07-29T00:00:00.000Z";
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const first = finalCapture(plan, transport);
  const second = structuredClone(first);
  (second.coverage as unknown as Record<string, unknown>).topLevel = { issues: { attempts: 2 } };

  assert.deepEqual(compareLinearRequirementLabelReplacementStableCaptures(first, second).differingCatalogs, []);

  second.issues[0]!.descriptionSha256 = SHA("drift");
  const comparison = compareLinearRequirementLabelReplacementStableCaptures(first, second);
  assert.deepEqual(comparison.differingCatalogs, ["issues"]);
  assert.notEqual(comparison.firstCaptureRoot, comparison.secondCaptureRoot);

  const malicious = structuredClone(first) as unknown as Record<string, unknown>;
  malicious["secret-key-value"] = "secret-body-value";
  assert.throws(
    () => compareLinearRequirementLabelReplacementStableCaptures(
      malicious as unknown as LinearRequirementLabelCapture,
      second,
    ),
    (error) => {
      assert.doesNotMatch(String(error), /secret-key-value|secret-body-value/);
      return /catalog/i.test(String(error));
    },
  );
});

test("accepts only the sealed one-cycle transition by rewinding to the original protected root", async () => {
  const before = withProtectedCycle(fixture());
  const plan = candidate(before);
  const transport = new FakeTransport();
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = "2026-07-29T00:00:00.000Z";
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const first = finalCapture(plan, transport);
  first.cycles = withProtectedCycle(fixture(), CYCLE_AFTER).cycles;
  first.coverage.totals.cycles = 1;
  const second = structuredClone(first);
  const transition = transitionContract(plan, before.cycles, first.cycles);

  assert.doesNotThrow(() => assertLinearRequirementLabelFinalizeTransitionContract(
    transition,
    plan,
    transition.root,
    transition.previousReceiptRoot,
  ));
  const receipt = verifyLinearRequirementLabelReplacementFinalWithTransition({
    candidate: plan,
    transition,
    expectedTransitionRoot: transition.root,
    expectedPreviousReceiptRoot: transition.previousReceiptRoot,
    first,
    second,
    firstCaptureSha256: SHA(JSON.stringify(first)),
    secondCaptureSha256: SHA(JSON.stringify(second)),
  });
  assert.equal(receipt.schemaVersion, 2);
  assert.equal(receipt.candidateProtectedNativeStateRoot, plan.protectedNativeStateRoot);
  assert.notEqual(receipt.finalProtectedNativeStateRoot, plan.protectedNativeStateRoot);
  assert.equal(receipt.acceptedProtectedStateTransition.root, transition.root);
  assert.equal(receipt.acceptedProtectedStateTransition.protectedTransition.cycleId, CYCLE_ID);
  assert.equal(receipt.requirementUses, 186);
  assert.equal(receipt.oldLabelUses, 0);
  assert.equal(receipt.outsideRequirementUses, 0);
  assert.equal(receipt.stable, true);
  assert.match(receipt.root, /^[a-f0-9]{64}$/);
});

test("rejects any generalized transition, extra protected drift, or changed REQ pin without leaking content", async () => {
  const before = withProtectedCycle(fixture());
  const plan = candidate(before);
  const transport = new FakeTransport();
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = "2026-07-29T00:00:00.000Z";
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const current = finalCapture(plan, transport);
  current.cycles = withProtectedCycle(fixture(), CYCLE_AFTER).cycles;
  current.coverage.totals.cycles = 1;
  const transition = transitionContract(plan, before.cycles, current.cycles);

  const wrongCycle = structuredClone(transition);
  wrongCycle.protectedTransition.cycleId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    wrongCycle, plan, transition.root, transition.previousReceiptRoot,
  ), /cycle|transition/i);
  const resealedCycle = resealTransition(wrongCycle);
  assert.throws(() => verifyLinearRequirementLabelAcceptedProtectedTransition(
    plan, current, resealedCycle, resealedCycle.root, transition.previousReceiptRoot,
  ), /cycle|transition/i);

  const wrongArtifact = structuredClone(transition);
  wrongArtifact.evidence.after.artifactDigest = "sha256:not-a-digest";
  const resealedArtifact = resealTransition(wrongArtifact);
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    resealedArtifact, plan, resealedArtifact.root, transition.previousReceiptRoot,
  ), /artifact|digest/i);

  const nonStringEvidence = structuredClone(transition) as unknown as Record<string, unknown>;
  ((nonStringEvidence.evidence as Record<string, unknown>).before as Record<string, unknown>).artifactId = 8722916951;
  const resealedNonStringEvidence = resealTransition(
    nonStringEvidence as unknown as LinearRequirementLabelFinalizeTransitionContract,
  );
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    resealedNonStringEvidence, plan, resealedNonStringEvidence.root, transition.previousReceiptRoot,
  ), /non-string|evidence/i);

  const wrongAttempt = structuredClone(transition);
  wrongAttempt.evidence.after.runAttempt = "2";
  wrongAttempt.evidence.after.artifactName =
    `linear-drift-fingerprint-${wrongAttempt.evidence.after.commit}-${wrongAttempt.evidence.after.runId}-2`;
  const resealedWrongAttempt = resealTransition(wrongAttempt);
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    resealedWrongAttempt, plan, resealedWrongAttempt.root, transition.previousReceiptRoot,
  ), /artifact|identity/i);

  const duplicateEvidence = structuredClone(transition);
  duplicateEvidence.evidence.after.artifactId = duplicateEvidence.evidence.before.artifactId;
  duplicateEvidence.evidence.after.runId = duplicateEvidence.evidence.before.runId;
  duplicateEvidence.evidence.after.artifactName =
    `linear-drift-fingerprint-${duplicateEvidence.evidence.after.commit}-${duplicateEvidence.evidence.after.runId}-1`;
  const resealedDuplicateEvidence = resealTransition(duplicateEvidence);
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    resealedDuplicateEvidence, plan, resealedDuplicateEvidence.root, transition.previousReceiptRoot,
  ), /distinct|evidence/i);

  const protectedDrift = structuredClone(current);
  protectedDrift.teams[0]!.name = "malicious-secret-team-name";
  assert.throws(() => verifyLinearRequirementLabelReplacementFinalWithTransition({
    candidate: plan,
    transition,
    expectedTransitionRoot: transition.root,
    expectedPreviousReceiptRoot: transition.previousReceiptRoot,
    first: protectedDrift,
    second: protectedDrift,
    firstCaptureSha256: SHA(JSON.stringify(protectedDrift)),
    secondCaptureSha256: SHA(JSON.stringify(protectedDrift)),
  }), (error) => {
    assert.doesNotMatch(String(error), /malicious-secret-team-name/);
    return /protected|transition|drift/i.test(String(error));
  });

  const issueDrift = structuredClone(current);
  issueDrift.issues[0]!.relationIds = ["cccccccc-cccc-4ccc-8ccc-cccccccccccc"];
  assert.throws(() => verifyLinearRequirementLabelReplacementFinalWithTransition({
    candidate: plan,
    transition,
    expectedTransitionRoot: transition.root,
    expectedPreviousReceiptRoot: transition.previousReceiptRoot,
    first: issueDrift,
    second: issueDrift,
    firstCaptureSha256: SHA(JSON.stringify(issueDrift)),
    secondCaptureSha256: SHA(JSON.stringify(issueDrift)),
  }), /REQ-1|protected|transition|drift/i);

  const unstable = structuredClone(current);
  unstable.cycles[0]!.name = "different";
  assert.throws(() => verifyLinearRequirementLabelReplacementFinalWithTransition({
    candidate: plan,
    transition,
    expectedTransitionRoot: transition.root,
    expectedPreviousReceiptRoot: transition.previousReceiptRoot,
    first: current,
    second: unstable,
    firstCaptureSha256: SHA(JSON.stringify(current)),
    secondCaptureSha256: SHA(JSON.stringify(unstable)),
  }), /stable|protected|transition|drift/i);

  const malicious = structuredClone(transition) as unknown as Record<string, unknown>;
  malicious["secret-contract-key"] = "secret-contract-value";
  const { root: _root, ...body } = malicious;
  malicious.root = SHA(CANONICAL(body));
  assert.throws(() => assertLinearRequirementLabelFinalizeTransitionContract(
    malicious as unknown as LinearRequirementLabelFinalizeTransitionContract,
    plan,
    malicious.root as string,
    transition.previousReceiptRoot,
  ), (error) => {
    assert.doesNotMatch(String(error), /secret-contract-key|secret-contract-value/);
    return /contract|fields|keys/i.test(String(error));
  });
});
