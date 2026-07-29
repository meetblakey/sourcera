import { createHash } from "node:crypto";

import type { LinearNativeIdentityCapture } from "./linear-live.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./linear-program-scope.js";
import {
  EXPECTED_REQUIREMENT_ISSUE_COUNT,
  assertLinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementPhase,
} from "./linear-requirement-label-replacement.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;

const LABELS = [
  { name: "Requirement", id: null, parentName: null, teamKey: "REQ", color: "#5E6AD2", description: "Canonical binding product or engineering requirement." },
  { name: "decision", id: "df2bcb0f-2fca-41cb-a45c-37770a01aac2", parentName: "Type", teamKey: null, color: "#7C3AED", description: "A product or delivery choice that must be resolved before dependent work can proceed." },
  { name: "human-only", id: "b29617b2-d787-4feb-b351-386df3286e87", parentName: "Agent", teamKey: null, color: "#155E75", description: null },
  { name: "platform", id: "70aedffb-e40d-4688-b723-99a3d4002565", parentName: "Domain", teamKey: null, color: "#1E3A8A", description: null },
  { name: "marketplace", id: "4dafcf74-e922-48aa-9dab-19f80516e2ee", parentName: "Domain", teamKey: null, color: "#1E40AF", description: null },
  { name: "risk", id: null, parentName: "Type", teamKey: null, color: "#E5484D", description: "Canonical delivery risk." },
  { name: "delivery-risk", id: null, parentName: "Risk", teamKey: null, color: "#D97706", description: "Delivery, governance, readiness, or operational execution risk." },
  { name: "financial-risk", id: null, parentName: "Risk", teamKey: null, color: "#A16207", description: "Billing, metering, pricing, or financial integrity risk." },
  { name: "security-risk", id: "d90fa0c4-4743-47fd-b3a5-61a5d1627747", parentName: "Risk", teamKey: null, color: "#B91C1C", description: "Security-sensitive implementation or proof work." },
  { name: "compliance-risk", id: "dc0cd580-50d1-4b03-bcbb-3cf23d43e331", parentName: "Risk", teamKey: null, color: "#991B1B", description: "Compliance-sensitive implementation or proof work." },
] as const;

type NativeLabel = LinearNativeIdentityCapture["labels"][number];

export interface LinearAuthorityLabelBootstrapCandidate {
  schemaVersion: 1;
  kind: "linear-authority-label-bootstrap-candidate";
  sourceCommit: string;
  workspaceId: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  groups: Array<{
    id: string;
    name: "Type" | "Agent" | "Domain" | "Risk";
    color: string;
    description: string | null;
  }>;
  labels: Array<{
    id: string | null;
    name: string;
    parentId: string | null;
    parentName: string | null;
    teamId: string | null;
    teamKey: string | null;
    color: string;
    description: string | null;
    create: boolean;
  }>;
  createLabels: Array<{
    name: "risk" | "delivery-risk" | "financial-risk";
    parentId: string;
    parentName: "Type" | "Risk";
    color: string;
    description: string;
  }>;
  requirementLabelMigration: {
    candidateRoot: string;
    finalRunnerReceiptRoot: string;
    requirementLabelId: string;
    finalCandidateRoot: string;
    finalVerificationRoot: string;
  };
  mutationAuthorized: false;
  root: string;
}

function fail(message: string): never {
  throw new Error(`Linear authority label bootstrap: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("candidate contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function one<T>(rows: readonly T[], label: string): T {
  if (rows.length !== 1) fail(`${label} must resolve exactly once`);
  return rows[0]!;
}

function exactObject(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (Object.keys(row).sort().join("\0") !== [...keys].sort().join("\0")) fail(`${label} fields differ`);
  return row;
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function positiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function withoutRoot(row: Record<string, unknown>): Record<string, unknown> {
  const { root: _root, ...body } = row;
  return body;
}

function validateMigrationProof(input: {
  migrationCandidate: unknown;
  migrationFinalizeReceipt: unknown;
  expectedMigrationCandidateRoot: string;
  expectedMigrationFinalizeReceiptRoot: string;
}): {
  candidate: LinearRequirementLabelReplacementCandidate;
  finalRunnerReceiptRoot: string;
  finalCandidateRoot: string;
  finalVerificationRoot: string;
} {
  if (!SHA256.test(input.expectedMigrationCandidateRoot) || !SHA256.test(input.expectedMigrationFinalizeReceiptRoot)) {
    fail("finalized Requirement migration proof roots are invalid");
  }
  let candidate: LinearRequirementLabelReplacementCandidate;
  try {
    candidate = assertLinearRequirementLabelReplacementCandidate(
      input.migrationCandidate as LinearRequirementLabelReplacementCandidate,
    );
  } catch {
    fail("finalized Requirement migration candidate is invalid");
  }
  if (candidate.root !== input.expectedMigrationCandidateRoot || candidate.mutationAuthorized !== false) {
    fail("finalized Requirement migration candidate root differs");
  }
  const runner = exactObject(input.migrationFinalizeReceipt, [
    "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "direction", "runId",
    "nativeIdentitySha256", "captureReceiptSha256", "secondNativeIdentitySha256",
    "secondCaptureReceiptSha256", "journalSha256", "coreReceipts", "applied", "alreadyApplied",
    "compensated", "alreadyCompensated", "verification", "previousReceiptRoot", "complete", "root",
  ], "finalized Requirement migration runner receipt");
  const runnerRoot = runner.root;
  if (runner.schemaVersion !== 1 || runner.kind !== "linear-requirement-label-replacement-runner-receipt" ||
    runner.phase !== "finalize" || runner.direction !== "forward" || runner.complete !== true ||
    runner.candidateRoot !== candidate.root || runner.operationsRoot !== candidate.operationsRoot ||
    typeof runner.runId !== "string" || !SAFE_RUN_ID.test(runner.runId) ||
    typeof runner.nativeIdentitySha256 !== "string" || !SHA256.test(runner.nativeIdentitySha256) ||
    typeof runner.captureReceiptSha256 !== "string" || !SHA256.test(runner.captureReceiptSha256) ||
    typeof runner.secondNativeIdentitySha256 !== "string" || !SHA256.test(runner.secondNativeIdentitySha256) ||
    typeof runner.secondCaptureReceiptSha256 !== "string" || !SHA256.test(runner.secondCaptureReceiptSha256) ||
    typeof runner.journalSha256 !== "string" || !SHA256.test(runner.journalSha256) ||
    !nonNegativeInteger(runner.applied) || runner.applied !== 0 ||
    !nonNegativeInteger(runner.alreadyApplied) || runner.alreadyApplied !== 0 ||
    !nonNegativeInteger(runner.compensated) || runner.compensated !== 0 ||
    !nonNegativeInteger(runner.alreadyCompensated) || runner.alreadyCompensated !== 0 ||
    typeof runner.previousReceiptRoot !== "string" || !SHA256.test(runner.previousReceiptRoot) ||
    typeof runnerRoot !== "string" || runnerRoot !== input.expectedMigrationFinalizeReceiptRoot ||
    runnerRoot !== sha256(canonicalJson(withoutRoot(runner)))) {
    fail("finalized Requirement migration runner receipt is invalid or detached");
  }

  if (!Array.isArray(runner.coreReceipts) || runner.coreReceipts.length < 4) {
    fail("finalized Requirement migration core receipt chain is incomplete");
  }
  const phaseOrder: LinearRequirementLabelReplacementPhase[] = ["rename", "create", "replace", "retire"];
  const completed = new Set<LinearRequirementLabelReplacementPhase>();
  const chunks = new Map<LinearRequirementLabelReplacementPhase, number>();
  let previousRoot: string | null = null;
  let previousPhaseIndex = 0;
  let previousJournalRecordCount = 0;
  for (const [index, value] of runner.coreReceipts.entries()) {
    const receipt = exactObject(value, [
      "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "direction", "chunk",
      "completedOperations", "phaseOperationCount", "phaseComplete", "journalRecordCount", "journalSha256",
      "terminalRecordSha256", "protectedNativeStateRoot", "previousReceiptRoot", "root",
    ], `finalized Requirement migration core receipt ${index + 1}`);
    const phase = receipt.phase as LinearRequirementLabelReplacementPhase;
    const phaseIndex = phaseOrder.indexOf(phase);
    const expectedPhaseCount = candidate.operations.filter((operation) => operation.phase === phase).length;
    const expectedChunk = (chunks.get(phase) ?? 0) + 1;
    if (receipt.schemaVersion !== 1 || receipt.kind !== "linear-requirement-label-replacement-phase-receipt" ||
      phaseIndex < previousPhaseIndex || phaseIndex > previousPhaseIndex + 1 || receipt.direction !== "forward" ||
      receipt.candidateRoot !== candidate.root || receipt.operationsRoot !== candidate.operationsRoot ||
      receipt.protectedNativeStateRoot !== candidate.protectedNativeStateRoot ||
      receipt.chunk !== expectedChunk || !positiveInteger(receipt.completedOperations) ||
      receipt.phaseOperationCount !== expectedPhaseCount || (receipt.completedOperations as number) > expectedPhaseCount ||
      typeof receipt.phaseComplete !== "boolean" || receipt.phaseComplete !== (receipt.completedOperations === receipt.phaseOperationCount) ||
      !positiveInteger(receipt.journalRecordCount) || (receipt.journalRecordCount as number) <= previousJournalRecordCount ||
      typeof receipt.journalSha256 !== "string" || !SHA256.test(receipt.journalSha256) ||
      typeof receipt.terminalRecordSha256 !== "string" || !SHA256.test(receipt.terminalRecordSha256) ||
      receipt.previousReceiptRoot !== previousRoot || typeof receipt.root !== "string" || !SHA256.test(receipt.root) ||
      receipt.root !== sha256(canonicalJson(withoutRoot(receipt)))) {
      fail("finalized Requirement migration core receipt chain is invalid");
    }
    if (receipt.phaseComplete === true) completed.add(receipt.phase as LinearRequirementLabelReplacementPhase);
    chunks.set(phase, expectedChunk);
    previousPhaseIndex = phaseIndex;
    previousJournalRecordCount = receipt.journalRecordCount as number;
    previousRoot = receipt.root;
  }
  if (phaseOrder.some((phase) => !completed.has(phase)) ||
    runner.coreReceipts.at(-1)?.phase !== "retire" || runner.coreReceipts.at(-1)?.phaseComplete !== true ||
    runner.coreReceipts.at(-1)?.journalSha256 !== runner.journalSha256) {
    fail("finalized Requirement migration core receipt chain lacks a completed forward retirement");
  }

  const verification = exactObject(runner.verification, [
    "schemaVersion", "kind", "candidateRoot", "firstCaptureSha256", "secondCaptureSha256",
    "firstCaptureRoot", "secondCaptureRoot", "protectedNativeStateRoot", "requirementUses",
    "oldLabelUses", "outsideRequirementUses", "stable", "root",
  ], "finalized Requirement migration stable usage proof");
  if (verification.schemaVersion !== 1 || verification.kind !== "linear-requirement-label-replacement-final-receipt" ||
    verification.candidateRoot !== candidate.root || verification.firstCaptureSha256 !== runner.nativeIdentitySha256 ||
    verification.secondCaptureSha256 !== runner.secondNativeIdentitySha256 ||
    typeof verification.firstCaptureRoot !== "string" || !SHA256.test(verification.firstCaptureRoot) ||
    verification.secondCaptureRoot !== verification.firstCaptureRoot ||
    verification.protectedNativeStateRoot !== candidate.protectedNativeStateRoot ||
    verification.requirementUses !== EXPECTED_REQUIREMENT_ISSUE_COUNT || verification.oldLabelUses !== 0 ||
    verification.outsideRequirementUses !== 0 || verification.stable !== true ||
    typeof verification.root !== "string" || !SHA256.test(verification.root) ||
    verification.root !== sha256(canonicalJson(withoutRoot(verification)))) {
    fail("finalized Requirement migration stable usage proof is invalid or detached");
  }
  return {
    candidate,
    finalRunnerReceiptRoot: runnerRoot,
    finalCandidateRoot: runner.candidateRoot as string,
    finalVerificationRoot: verification.root,
  };
}

function migrationLabelProjection(label: NativeLabel | LinearRequirementLabelReplacementCandidate["oldLabel"]): unknown {
  return {
    id: label.id,
    name: label.name,
    color: label.color.toLocaleUpperCase("en-US"),
    description: label.description,
    inheritedFromId: label.inheritedFromId,
    isGroup: label.isGroup,
    parentId: label.parentId,
    parentName: label.parentName,
    teamId: label.teamId,
    teamKey: label.teamKey,
  };
}

function validateCurrentMigrationState(
  native: LinearNativeIdentityCapture,
  candidate: LinearRequirementLabelReplacementCandidate,
): void {
  const old = one(native.labels.filter((label) => label.id === candidate.oldLabel.id), "retired workspace Requirement label");
  const replacement = one(native.labels.filter((label) => label.id === candidate.newLabel.id), "migrated REQ Requirement label");
  if (old.archivedAt !== null || typeof old.retiredAt !== "string" || old.retiredAt.length === 0 ||
    canonicalJson(migrationLabelProjection(old)) !== canonicalJson(migrationLabelProjection({
      ...candidate.oldLabel,
      name: candidate.retiredName,
    })) ||
    replacement.archivedAt !== null || replacement.retiredAt !== null ||
    canonicalJson(migrationLabelProjection(replacement)) !== canonicalJson(migrationLabelProjection(candidate.newLabel))) {
    fail("fresh native capture differs from the finalized Requirement label identity, scope, or retirement state");
  }
  const retiredNames = native.labels.filter((label) => label.name === candidate.retiredName);
  if (retiredNames.length !== 1 || retiredNames[0]!.id !== candidate.oldLabel.id) {
    fail("retired workspace Requirement label name is no longer unique");
  }

  const expectedIssueIds = candidate.issues.map((pin) => pin.issueId).sort();
  const oldUseIds = native.issues.filter((issue) => issue.labelIds.includes(candidate.oldLabel.id))
    .map((issue) => issue.issueUuid).sort();
  const newUseIds = native.issues.filter((issue) => issue.labelIds.includes(candidate.newLabel.id))
    .map((issue) => issue.issueUuid).sort();
  if (oldUseIds.length !== 0 || expectedIssueIds.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT ||
    canonicalJson(newUseIds) !== canonicalJson(expectedIssueIds)) {
    fail("fresh native capture lacks zero old uses and the exact 186 pinned new Requirement assignments");
  }

  const issues = new Map<string, LinearNativeIdentityCapture["issues"][number]>();
  for (const issue of native.issues) {
    if (issues.has(issue.issueUuid)) fail("fresh native capture duplicates a pinned issue UUID");
    issues.set(issue.issueUuid, issue);
  }
  for (const pin of candidate.issues) {
    const issue = issues.get(pin.issueId);
    if (!issue || issue.identifier !== pin.identifier) fail(`${pin.identifier} migration issue identity is missing`);
    const labelIds = [...issue.labelIds].sort();
    if (new Set(labelIds).size !== labelIds.length ||
      sha256(canonicalJson({ ...issue, labelIds })) !== pin.afterIssueRoot) {
      fail(`${pin.identifier} migration issue or assignment drifted after finalization`);
    }
  }
}

function activeGroup(label: NativeLabel, name: string): boolean {
  return label.name === name && label.isGroup === true && label.archivedAt === null && label.retiredAt === null &&
    label.inheritedFromId === null && label.parentId === null && label.parentName === null &&
    label.teamId === null && label.teamKey === null;
}

export function buildLinearAuthorityLabelBootstrapCandidate(input: {
  native: LinearNativeIdentityCapture;
  programScope: LinearProgramScopeV3;
  sourceCommit: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  migrationCandidate: unknown;
  migrationFinalizeReceipt: unknown;
  expectedMigrationCandidateRoot: string;
  expectedMigrationFinalizeReceiptRoot: string;
}): LinearAuthorityLabelBootstrapCandidate {
  const { native, programScope } = input;
  const migration = validateMigrationProof(input);
  if (native.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace.archivedAt !== null) {
    fail("native identity capture is incomplete or archived");
  }
  if (programScope.schemaVersion !== 3 || !programScope.authorityIssueLabelContract ||
    !/^[a-f0-9]{40,64}$/.test(input.sourceCommit) || !SHA256.test(input.nativeIdentitySha256) ||
    !SHA256.test(input.captureReceiptSha256)) {
    fail("source binding is invalid");
  }
  if (programScope.authorityIssueLabelContract.initialized === true) {
    let captured;
    try {
      captured = buildLinearAuthorityIssueLabelContract(native.labels);
    } catch (error) {
      fail(error instanceof Error ? error.message : "initialized label contract capture is invalid");
    }
    const committed = programScope.authorityIssueLabelContract;
    if (committed.root !== captured.root || JSON.stringify(committed.labels) !== JSON.stringify(captured.labels) ||
      JSON.stringify(committed.groups) !== JSON.stringify(captured.groups)) {
      fail("initialized authority label contract differs from fresh native capture");
    }
  }
  const definitions = programScope.projectDocumentDecisionContract.labelDefinitions;
  const expectedProgramIds = new Map(LABELS.filter((row) => row.id !== null &&
    ["decision", "human-only", "platform", "marketplace"].includes(row.name)).map((row) => [row.name, row.id]));
  for (const [name, id] of expectedProgramIds) {
    const definition = one(definitions.filter((row) => row.name === name), `${name} program label definition`);
    if (definition.id !== id) fail(`${name} program label ID has drifted`);
  }
  const groupIds = new Map<string, string>();
  for (const name of ["Type", "Agent", "Domain"] as const) {
    const matching = definitions.filter((row) => row.groupName === name);
    if (matching.length === 0 || new Set(matching.map((row) => row.groupId)).size !== 1) {
      fail(`${name} program label group identity is invalid`);
    }
    groupIds.set(name, matching[0]!.groupId);
  }
  const riskGroup = one(native.labels.filter((row) => activeGroup(row, "Risk")), "Risk label group");
  groupIds.set("Risk", riskGroup.id);
  const groups = (["Type", "Agent", "Domain", "Risk"] as const).map((name) => {
    const id = groupIds.get(name)!;
    const group = one(native.labels.filter((row) => row.id === id && activeGroup(row, name)), `${name} label group`);
    if (!UUID.test(group.id) || typeof group.color !== "string" || group.color.length === 0 ||
      (group.description !== null && typeof group.description !== "string")) {
      fail(`${name} label group metadata is invalid`);
    }
    return { id: group.id, name, color: group.color, description: group.description };
  });
  if (new Set(groups.map((row) => row.id)).size !== groups.length) fail("authority label groups overlap");
  const requirementsTeam = one(native.teams.filter((row) => row.key === "REQ" && row.name === "Requirements" && row.archivedAt === null), "Requirements team");
  if (native.workspace.id !== migration.candidate.workspaceId || requirementsTeam.id !== migration.candidate.requirementsTeamId) {
    fail("fresh native capture is detached from the finalized Requirement migration workspace or team");
  }
  validateCurrentMigrationState(native, migration.candidate);
  const labels = LABELS.map((expected) => {
    const expectedId = expected.name === "Requirement" ? migration.candidate.newLabel.id : expected.id;
    const matches = native.labels.filter((row) => row.name === expected.name && row.isGroup === false);
    if (matches.length > 1) fail(`${expected.name} label is duplicated`);
    const label = matches[0];
    if (!label) {
      if (expectedId !== null) fail(`${expected.name} governed label is missing`);
      return {
        id: null,
        name: expected.name,
        parentId: groupIds.get(expected.parentName!)!,
        parentName: expected.parentName,
        teamId: null,
        teamKey: null,
        color: expected.color,
        description: expected.description,
        create: true,
      };
    }
    const parentId = expected.parentName === null ? null : groupIds.get(expected.parentName)!;
    const teamId = expected.teamKey === "REQ" ? requirementsTeam.id : null;
    if (!UUID.test(label.id) || (expectedId !== null && label.id !== expectedId) ||
      (expected.name === "Requirement" && (!Object.prototype.hasOwnProperty.call(label, "retiredAt") || label.retiredAt !== null)) ||
      label.archivedAt !== null || label.retiredAt !== null || label.inheritedFromId !== null || label.parentId !== parentId ||
      label.parentName !== expected.parentName || label.teamId !== teamId || label.teamKey !== expected.teamKey ||
      label.color.toLocaleUpperCase("en-US") !== expected.color.toLocaleUpperCase("en-US") ||
      label.description !== expected.description) {
      fail(`${expected.name} label has drifted from its exact native meaning or scope`);
    }
    return {
      id: label.id,
      name: label.name,
      parentId: label.parentId,
      parentName: label.parentName,
      teamId: label.teamId,
      teamKey: label.teamKey,
      color: label.color,
      description: label.description,
      create: false,
    };
  });
  const createLabels = labels.filter((row) => row.create).map((row) => {
    if (!(["risk", "delivery-risk", "financial-risk"] as string[]).includes(row.name) ||
      row.parentId === null || row.parentName === null || row.description === null) {
      return fail("label additions exceed the approved bootstrap set");
    }
    return {
      name: row.name as "risk" | "delivery-risk" | "financial-risk",
      parentId: row.parentId,
      parentName: row.parentName as "Type" | "Risk",
      color: row.color,
      description: row.description,
    };
  });
  const projection = {
    schemaVersion: 1 as const,
    kind: "linear-authority-label-bootstrap-candidate" as const,
    sourceCommit: input.sourceCommit,
    workspaceId: native.workspace.id,
    nativeIdentitySha256: input.nativeIdentitySha256,
    captureReceiptSha256: input.captureReceiptSha256,
    groups,
    labels,
    createLabels,
    requirementLabelMigration: {
      candidateRoot: migration.candidate.root,
      finalRunnerReceiptRoot: migration.finalRunnerReceiptRoot,
      requirementLabelId: migration.candidate.newLabel.id,
      finalCandidateRoot: migration.finalCandidateRoot,
      finalVerificationRoot: migration.finalVerificationRoot,
    },
    mutationAuthorized: false as const,
  };
  return { ...projection, root: sha256(canonicalJson(projection)) };
}

export function canonicalLinearAuthorityLabelBootstrapCandidateJson(
  candidate: LinearAuthorityLabelBootstrapCandidate,
): string {
  return `${JSON.stringify(candidate, null, 2)}\n`;
}
