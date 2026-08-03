import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  EXPECTED_REQUIREMENT_ISSUE_COUNT,
  OLD_REQUIREMENT_LABEL_ID,
  REQUIREMENTS_TEAM_ID,
  RETIRED_REQUIREMENT_LABEL_NAME,
  assertLinearRequirementLabelSemanticBaselineContract,
  assertLinearRequirementLabelReplacementCandidate,
  assertLinearRequirementLabelReplacementFinalReceiptV3,
  buildLinearRequirementLabelReplacementCandidate,
  compareLinearRequirementLabelReplacementStableCaptures,
  compensateLinearRequirementLabelReplacementPhase,
  executeLinearRequirementLabelReplacementPhase,
  requirementLabelRollbackName,
  verifyLinearRequirementLabelHistoricalReceiptChain,
  verifyLinearRequirementLabelReplacementFinal,
  verifyLinearRequirementLabelReplacementSemanticBaseline,
  verifyLinearRequirementLabelReplacementUsage,
  type LinearRequirementLabelHistoricalProof,
  type LinearRequirementLabelCapture,
  type LinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementTransport,
} from "./lib/linear-requirement-label-replacement.js";

const NEW_LABEL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SHA = (value: string): string => createHash("sha256").update(value).digest("hex");
const CANONICAL = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(CANONICAL).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${CANONICAL(row[key])}`).join(",")}}`;
};

function currentStateMerkleRoot(rows: readonly {
  issueId: string;
  identifier: string;
  fullStateRoot: string;
  protectedStateRoot: string;
}[]): string {
  let level = rows.map((row) => SHA(CANONICAL(row)));
  while (level.length > 1) {
    const next: string[] = [];
    for (let index = 0; index < level.length; index += 2) {
      next.push(SHA(CANONICAL([level[index]!, level[index + 1] ?? level[index]!])));
    }
    level = next;
  }
  return level[0]!;
}

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

test("semantic baseline seals current REQ states without requiring stale candidate issue roots", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.name = RETIRED_REQUIREMENT_LABEL_NAME;
  transport.labels.get(OLD_REQUIREMENT_LABEL_ID)!.retiredAt = "2026-07-29T00:00:00.000Z";
  await transport.createLabel(plan.newLabel);
  for (const row of plan.issues) await transport.replaceIssueLabels({ issueId: row.issueId, labelIds: row.afterLabelIds });
  const current = finalCapture(plan, transport);
  current.issues[71]!.cycleId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  current.cycles.push({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    number: 8,
    name: "current cycle",
    descriptionSha256: SHA("current-cycle"),
    updatedAt: "2026-08-03T00:00:00.000Z",
    archivedAt: null,
    startsAt: "2026-08-03T00:00:00.000Z",
    endsAt: "2026-08-17T00:00:00.000Z",
    completedAt: null,
    teamId: "40000000-0000-4000-8000-000000000001",
    teamKey: "SEL",
    inheritedFromId: null,
  });
  current.coverage.totals.cycles = 1;
  const second = structuredClone(current);
  const proofBody = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-historical-proof" as const,
    candidateRoot: plan.root,
    verifyRunnerRoot: "1".repeat(64),
    retireRunnerRoot: "2".repeat(64),
    candidateProtectedNativeStateRoot: plan.protectedNativeStateRoot,
    verifyJournalSha256: "3".repeat(64),
    retireJournalSha256: "4".repeat(64),
    verifyTerminalRecordSha256: "5".repeat(64),
    retireTerminalRecordSha256: "6".repeat(64),
    verifyTerminalCoreReceiptRoot: "7".repeat(64),
    retireTerminalCoreReceiptRoot: "8".repeat(64),
  };
  const historicalProof: LinearRequirementLabelHistoricalProof = {
    ...proofBody,
    root: SHA(CANONICAL(proofBody)),
  };
  const artifact = (phase: "verify" | "retire") => ({
    artifactId: phase === "verify" ? "8726485898" : "8727423703",
    artifactName: `linear-requirement-label-replacement-${phase === "verify" ? "30456655778" : "30458550380"}-1`,
    artifactDigest: `sha256:${(phase === "verify" ? "a" : "b").repeat(64)}`,
    runId: phase === "verify" ? "30456655778" : "30458550380",
    runAttempt: "1" as const,
    commit: plan.sourceCommit,
    candidateSha256: "c".repeat(64),
    receiptSha256: "d".repeat(64),
    journalSha256: phase === "verify" ? historicalProof.verifyJournalSha256 : historicalProof.retireJournalSha256,
    coreReceiptsSha256: "e".repeat(64),
    runnerRoot: phase === "verify" ? historicalProof.verifyRunnerRoot : historicalProof.retireRunnerRoot,
  });
  const contractBody = {
    schemaVersion: 3 as const,
    kind: "linear-requirement-label-semantic-baseline-handoff" as const,
    candidateRoot: plan.root,
    candidateSourceCommit: plan.sourceCommit,
    diagnosticCommit: "d".repeat(40),
    transitionCommit: "e".repeat(40),
    baselineCommit: "1".repeat(40),
    previousReceiptRoot: historicalProof.retireRunnerRoot,
    candidateControlTreeRoot: "a".repeat(64),
    diagnosticControlTreeRoot: "b".repeat(64),
    transitionControlTreeRoot: "c".repeat(64),
    baselineControlTreeRoot: "4".repeat(64),
    historicalEvidence: { verify: artifact("verify"), retire: artifact("retire") },
    historicalProof: {
      protectedNativeStateRoot: plan.protectedNativeStateRoot,
      verifyPreviousReceiptRoot: "f".repeat(64),
      verifyJournalRecordCount: 376 as const,
      verifyCoreReceiptCount: 10 as const,
      verifyTerminalRecordSha256: historicalProof.verifyTerminalRecordSha256,
      verifyTerminalCoreReceiptRoot: historicalProof.verifyTerminalCoreReceiptRoot,
      retireJournalRecordCount: 378 as const,
      retireCoreReceiptCount: 11 as const,
      retireTerminalRecordSha256: historicalProof.retireTerminalRecordSha256,
      retireTerminalCoreReceiptRoot: historicalProof.retireTerminalCoreReceiptRoot,
    },
  };
  const semanticBaselineContract = { ...contractBody, root: SHA(CANONICAL(contractBody)) };
  const finalizeControlTransition = {
    source: semanticBaselineContract.baselineCommit,
    head: "2".repeat(40),
    beforeRoot: semanticBaselineContract.baselineControlTreeRoot,
    afterRoot: "5".repeat(64),
  };
  const receipt = verifyLinearRequirementLabelReplacementSemanticBaseline({
    candidate: plan,
    semanticBaselineContract,
    finalizeControlTransition,
    expectedTransitionRoot: semanticBaselineContract.root,
    expectedPreviousReceiptRoot: semanticBaselineContract.previousReceiptRoot,
    historicalProof,
    first: current,
    second,
    firstCaptureSha256: SHA(JSON.stringify(current)),
    secondCaptureSha256: SHA(JSON.stringify(second)),
  });
  assert.equal(receipt.schemaVersion, 3);
  assert.equal(receipt.transitionRoot, receipt.semanticBaselineContract.root);
  assert.deepEqual(receipt.finalizeControlTransition, finalizeControlTransition);
  assert.equal(receipt.requirementUses, 186);
  assert.equal(receipt.oldLabelUses, 0);
  assert.equal(receipt.outsideRequirementUses, 0);
  assert.equal(receipt.currentRequirementIssueStates.length, 186);
  assert.equal(receipt.currentRequirementIssueStates[71]!.identifier, "REQ-72");
  assert.notEqual(receipt.currentRequirementIssueStates[71]!.fullStateRoot, plan.issues[71]!.afterIssueRoot);
  assert.equal(receipt.currentGlobalRoot, receipt.firstCaptureRoot);
  const stableRoots = compareLinearRequirementLabelReplacementStableCaptures(current, second);
  assert.deepEqual(receipt.firstCatalogRoots, stableRoots.firstCatalogRoots);
  assert.deepEqual(receipt.secondCatalogRoots, stableRoots.secondCatalogRoots);
  assert.deepEqual(receipt.currentCatalogRoots, receipt.firstCatalogRoots);
  assert.match(receipt.currentRequirementIssueStateRoot, /^[a-f0-9]{64}$/);
  assert.equal(receipt.firstProtectedNativeStateRoot, receipt.secondProtectedNativeStateRoot);
  assert.equal(receipt.currentProtectedNativeStateRoot, receipt.firstProtectedNativeStateRoot);
  assert.match(receipt.currentProtectedNativeStateRoot, /^[a-f0-9]{64}$/);
  assert.doesNotThrow(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
    receipt,
    plan,
    semanticBaselineContract.root,
    semanticBaselineContract.previousReceiptRoot,
    finalizeControlTransition,
  ));

  const controlTamperers = [
    (proof: typeof finalizeControlTransition) => { proof.source = "2".repeat(40); },
    (proof: typeof finalizeControlTransition) => { proof.head = "3".repeat(40); },
    (proof: typeof finalizeControlTransition) => { proof.beforeRoot = "5".repeat(64); },
    (proof: typeof finalizeControlTransition) => { proof.afterRoot = "6".repeat(64); },
  ];
  for (const tamper of controlTamperers) {
    const changed = structuredClone(receipt);
    tamper(changed.finalizeControlTransition);
    const { root: _receiptRoot, ...receiptWithoutRoot } = changed;
    changed.root = SHA(CANONICAL(receiptWithoutRoot));
    assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
      changed,
      plan,
      semanticBaselineContract.root,
      semanticBaselineContract.previousReceiptRoot,
      finalizeControlTransition,
    ), /control transition|source|head|before|after|root/i);
  }

  const tamperers = [
    (contract: typeof semanticBaselineContract) => { contract.historicalEvidence.verify.artifactId = "8726485899"; },
    (contract: typeof semanticBaselineContract) => { contract.historicalEvidence.verify.artifactDigest = `sha256:${"9".repeat(64)}`; },
    (contract: typeof semanticBaselineContract) => { contract.historicalEvidence.retire.journalSha256 = "8".repeat(64); },
    (contract: typeof semanticBaselineContract) => { contract.diagnosticCommit = "f".repeat(40); },
    (contract: typeof semanticBaselineContract) => { contract.baselineCommit = "3".repeat(40); },
    (contract: typeof semanticBaselineContract) => { contract.baselineControlTreeRoot = "6".repeat(64); },
  ];
  for (const tamper of tamperers) {
    const changed = structuredClone(receipt);
    tamper(changed.semanticBaselineContract);
    const { root: _contractRoot, ...contractWithoutRoot } = changed.semanticBaselineContract;
    changed.semanticBaselineContract.root = SHA(CANONICAL(contractWithoutRoot));
    changed.transitionRoot = changed.semanticBaselineContract.root;
    const { root: _receiptRoot, ...receiptWithoutRoot } = changed;
    changed.root = SHA(CANONICAL(receiptWithoutRoot));
    assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
      changed,
      plan,
      semanticBaselineContract.root,
      semanticBaselineContract.previousReceiptRoot,
      finalizeControlTransition,
    ), /contract|transition|artifact|digest|lineage|root/i);
  }

  const missingBaseline = structuredClone(semanticBaselineContract) as unknown as Record<string, unknown>;
  delete missingBaseline.baselineCommit;
  const { root: _missingRoot, ...missingBody } = missingBaseline;
  missingBaseline.root = SHA(CANONICAL(missingBody));
  assert.throws(
    () => assertLinearRequirementLabelSemanticBaselineContract(
      missingBaseline as unknown as typeof semanticBaselineContract,
      plan,
      String(missingBaseline.root),
      semanticBaselineContract.previousReceiptRoot,
    ),
    /keys differ/,
  );
  const legacyContract = structuredClone(semanticBaselineContract) as unknown as Record<string, unknown>;
  legacyContract.schemaVersion = 2;
  const { root: _legacyRoot, ...legacyBody } = legacyContract;
  legacyContract.root = SHA(CANONICAL(legacyBody));
  assert.throws(
    () => assertLinearRequirementLabelSemanticBaselineContract(
      legacyContract as unknown as typeof semanticBaselineContract,
      plan,
      String(legacyContract.root),
      semanticBaselineContract.previousReceiptRoot,
    ),
    /identity differs/,
  );

  const substitutedIssue = structuredClone(receipt);
  substitutedIssue.currentRequirementIssueStates[0]!.issueId = "ffffffff-ffff-4fff-8fff-ffffffffffff";
  substitutedIssue.currentRequirementIssueStates.sort((left, right) =>
    left.issueId.localeCompare(right.issueId) || left.identifier.localeCompare(right.identifier));
  substitutedIssue.currentRequirementIssueStateRoot = currentStateMerkleRoot(
    substitutedIssue.currentRequirementIssueStates,
  );
  const { root: _substitutedIssueRoot, ...substitutedIssueBody } = substitutedIssue;
  substitutedIssue.root = SHA(CANONICAL(substitutedIssueBody));
  assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
    substitutedIssue,
    plan,
    semanticBaselineContract.root,
    semanticBaselineContract.previousReceiptRoot,
    finalizeControlTransition,
  ), /identity|candidate|Requirement/i);

  const proofTamperers: Array<(proof: LinearRequirementLabelHistoricalProof) => void> = [
    (proof) => { proof.verifyRunnerRoot = "9".repeat(64); },
    (proof) => { proof.retireRunnerRoot = "9".repeat(64); },
    (proof) => { proof.candidateProtectedNativeStateRoot = "9".repeat(64); },
    (proof) => { proof.verifyJournalSha256 = "9".repeat(64); },
    (proof) => { proof.retireJournalSha256 = "9".repeat(64); },
    (proof) => { proof.verifyTerminalRecordSha256 = "9".repeat(64); },
    (proof) => { proof.retireTerminalRecordSha256 = "9".repeat(64); },
    (proof) => { proof.verifyTerminalCoreReceiptRoot = "9".repeat(64); },
    (proof) => { proof.retireTerminalCoreReceiptRoot = "9".repeat(64); },
  ];
  for (const tamper of proofTamperers) {
    const changed = structuredClone(receipt);
    tamper(changed.historicalProof);
    const { root: _proofRoot, ...proofWithoutRoot } = changed.historicalProof;
    changed.historicalProof.root = SHA(CANONICAL(proofWithoutRoot));
    const { root: _receiptRoot, ...receiptWithoutRoot } = changed;
    changed.root = SHA(CANONICAL(receiptWithoutRoot));
    assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
      changed,
      plan,
      semanticBaselineContract.root,
      semanticBaselineContract.previousReceiptRoot,
      finalizeControlTransition,
    ), /historical proof|historical receipt|contract|history|root/i);
  }

  for (const field of ["firstCatalogRoots", "secondCatalogRoots"] as const) {
    const changed = structuredClone(receipt);
    changed[field].issues = "9".repeat(64);
    const { root: _receiptRoot, ...receiptWithoutRoot } = changed;
    changed.root = SHA(CANONICAL(receiptWithoutRoot));
    assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
      changed,
      plan,
      semanticBaselineContract.root,
      semanticBaselineContract.previousReceiptRoot,
      finalizeControlTransition,
    ), /catalog roots differ|catalog root/i);
  }

  const changedProtectedRoot = structuredClone(receipt);
  changedProtectedRoot.secondProtectedNativeStateRoot = "9".repeat(64);
  const { root: _changedProtectedRoot, ...changedProtectedBody } = changedProtectedRoot;
  changedProtectedRoot.root = SHA(CANONICAL(changedProtectedBody));
  assert.throws(() => assertLinearRequirementLabelReplacementFinalReceiptV3(
    changedProtectedRoot,
    plan,
    semanticBaselineContract.root,
    semanticBaselineContract.previousReceiptRoot,
    finalizeControlTransition,
  ), /protected|stability|identity/i);

  const protectedDrift = structuredClone(second);
  protectedDrift.cycles[0]!.name = "later current cycle";
  assert.throws(() => verifyLinearRequirementLabelReplacementSemanticBaseline({
    candidate: plan,
    semanticBaselineContract,
    finalizeControlTransition,
    expectedTransitionRoot: semanticBaselineContract.root,
    expectedPreviousReceiptRoot: semanticBaselineContract.previousReceiptRoot,
    historicalProof,
    first: current,
    second: protectedDrift,
    firstCaptureSha256: SHA(JSON.stringify(current)),
    secondCaptureSha256: SHA(JSON.stringify(protectedDrift)),
  }), /protected-native roots are not stable/i);

  const wrongTeam = structuredClone(current);
  wrongTeam.issues[71]!.teamId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  assert.throws(() => verifyLinearRequirementLabelReplacementSemanticBaseline({
    candidate: plan,
    semanticBaselineContract,
    finalizeControlTransition,
    expectedTransitionRoot: semanticBaselineContract.root,
    expectedPreviousReceiptRoot: semanticBaselineContract.previousReceiptRoot,
    historicalProof,
    first: wrongTeam,
    second: wrongTeam,
    firstCaptureSha256: SHA(JSON.stringify(wrongTeam)),
    secondCaptureSha256: SHA(JSON.stringify(wrongTeam)),
  }), /REQ|team|boundary/i);
});

test("historical handoff recomputes verify and retire journals, receipts, and predecessor link", async () => {
  const plan = candidate();
  const transport = new FakeTransport();
  const progress: Progress = { journalRaw: "", receipts: [] };
  for (const phase of ["rename", "create", "replace"] as const) await applyForward(plan, transport, progress, phase);
  const verifyJournalRaw = progress.journalRaw;
  const verifyReceipts = structuredClone(progress.receipts);
  const verifyBody = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-runner-receipt" as const,
    candidateRoot: plan.root,
    operationsRoot: plan.operationsRoot,
    phase: "verify" as const,
    direction: "forward" as const,
    runId: "30456655778.1.verify",
    nativeIdentitySha256: "a".repeat(64),
    captureReceiptSha256: "b".repeat(64),
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
      protectedNativeStateRoot: plan.protectedNativeStateRoot,
    },
    previousReceiptRoot: "c".repeat(64),
    complete: true as const,
  };
  const verifyReceipt = { ...verifyBody, root: SHA(CANONICAL(verifyBody)) };
  await applyForward(plan, transport, progress, "retire");
  const retireBody = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-runner-receipt" as const,
    candidateRoot: plan.root,
    operationsRoot: plan.operationsRoot,
    phase: "retire" as const,
    direction: "forward" as const,
    runId: "30458550380.1.retire.forward",
    nativeIdentitySha256: "d".repeat(64),
    captureReceiptSha256: "e".repeat(64),
    secondNativeIdentitySha256: null,
    secondCaptureReceiptSha256: null,
    journalSha256: SHA(progress.journalRaw),
    coreReceipts: structuredClone(progress.receipts),
    applied: 1,
    alreadyApplied: 0,
    compensated: 0,
    alreadyCompensated: 0,
    verification: null,
    previousReceiptRoot: verifyReceipt.root,
    complete: true as const,
  };
  const retireReceipt = { ...retireBody, root: SHA(CANONICAL(retireBody)) };
  const candidateRaw = `${JSON.stringify(plan, null, 2)}\n`;
  const verifyFiles = {
    candidateRaw,
    receiptRaw: `${JSON.stringify(verifyReceipt, null, 2)}\n`,
    journalRaw: verifyJournalRaw,
    coreReceiptsRaw: "",
  };
  const retireFiles = {
    candidateRaw,
    receiptRaw: `${JSON.stringify(retireReceipt, null, 2)}\n`,
    journalRaw: progress.journalRaw,
    coreReceiptsRaw: `${JSON.stringify(progress.receipts.at(-1))}\n`,
  };
  const artifact = (phase: "verify" | "retire", files: typeof verifyFiles) => ({
    artifactId: phase === "verify" ? "8726485898" : "8727423703",
    artifactName: `linear-requirement-label-replacement-${phase === "verify" ? "30456655778" : "30458550380"}-1`,
    artifactDigest: `sha256:${(phase === "verify" ? "1" : "2").repeat(64)}`,
    runId: phase === "verify" ? "30456655778" : "30458550380",
    runAttempt: "1" as const,
    commit: plan.sourceCommit,
    candidateSha256: SHA(files.candidateRaw),
    receiptSha256: SHA(files.receiptRaw),
    journalSha256: SHA(files.journalRaw),
    coreReceiptsSha256: SHA(files.coreReceiptsRaw),
    runnerRoot: phase === "verify" ? verifyReceipt.root : retireReceipt.root,
  });
  const contractBody = {
    schemaVersion: 3 as const,
    kind: "linear-requirement-label-semantic-baseline-handoff" as const,
    candidateRoot: plan.root,
    candidateSourceCommit: plan.sourceCommit,
    diagnosticCommit: "d".repeat(40),
    transitionCommit: "e".repeat(40),
    baselineCommit: "1".repeat(40),
    previousReceiptRoot: retireReceipt.root,
    candidateControlTreeRoot: "1".repeat(64),
    diagnosticControlTreeRoot: "2".repeat(64),
    transitionControlTreeRoot: "3".repeat(64),
    baselineControlTreeRoot: "4".repeat(64),
    historicalEvidence: {
      verify: artifact("verify", verifyFiles),
      retire: artifact("retire", retireFiles),
    },
    historicalProof: {
      protectedNativeStateRoot: plan.protectedNativeStateRoot,
      verifyPreviousReceiptRoot: verifyReceipt.previousReceiptRoot,
      verifyJournalRecordCount: 376 as const,
      verifyCoreReceiptCount: 10 as const,
      verifyTerminalRecordSha256: verifyReceipts.at(-1)!.terminalRecordSha256,
      verifyTerminalCoreReceiptRoot: verifyReceipts.at(-1)!.root,
      retireJournalRecordCount: 378 as const,
      retireCoreReceiptCount: 11 as const,
      retireTerminalRecordSha256: progress.receipts.at(-1)!.terminalRecordSha256,
      retireTerminalCoreReceiptRoot: progress.receipts.at(-1)!.root,
    },
  };
  const contract = { ...contractBody, root: SHA(CANONICAL(contractBody)) };
  const proof = verifyLinearRequirementLabelHistoricalReceiptChain({
    candidate: plan,
    transition: contract,
    expectedTransitionRoot: contract.root,
    expectedPreviousReceiptRoot: retireReceipt.root,
    verifyFiles,
    retireFiles,
  });
  assert.equal(proof.verifyRunnerRoot, verifyReceipt.root);
  assert.equal(proof.retireRunnerRoot, retireReceipt.root);
  assert.equal(proof.verifyTerminalRecordSha256, verifyReceipts.at(-1)!.terminalRecordSha256);
  assert.equal(proof.retireTerminalRecordSha256, progress.receipts.at(-1)!.terminalRecordSha256);

  assert.throws(() => verifyLinearRequirementLabelHistoricalReceiptChain({
    candidate: plan,
    transition: contract,
    expectedTransitionRoot: contract.root,
    expectedPreviousReceiptRoot: retireReceipt.root,
    verifyFiles: { ...verifyFiles, journalRaw: `${verifyFiles.journalRaw} ` },
    retireFiles,
  }), /digest|journal|artifact/i);
});
