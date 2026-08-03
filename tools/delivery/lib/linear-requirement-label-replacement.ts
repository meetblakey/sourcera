import { createHash } from "node:crypto";

import type { LinearNativeIdentityCapture } from "./linear-live.js";

export const OLD_REQUIREMENT_LABEL_ID = "5b058b32-9655-442e-bcdb-a5ca0479c311";
export const REQUIREMENTS_TEAM_ID = "ee9dd198-4816-4836-9226-42765878d793";
export const REQUIREMENT_LABEL_NAME = "Requirement";
export const REQUIREMENT_LABEL_COLOR = "#5E6AD2";
export const REQUIREMENT_LABEL_DESCRIPTION = "Canonical binding product or engineering requirement.";
export const RETIRED_REQUIREMENT_LABEL_NAME = "Requirement (retired workspace scope 5b058b32)";
export const EXPECTED_REQUIREMENT_ISSUE_COUNT = 186;
export const REQUIREMENT_LABEL_REPLACEMENT_WRITE_COUNT = 189;

export function requirementLabelRollbackName(newLabelId: string): string {
  return `Requirement (rollback ${exactUuid(newLabelId, "rollback label UUID")})`;
}

const DIGEST = /^[a-f0-9]{64}$/;
const GITHUB_DIGEST = /^sha256:[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const IDENTIFIER = /^REQ-([1-9]\d*)$/;
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;
const CANONICAL_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const REPLACEMENT_RECEIPT_CHUNK = 25;
const STABLE_CAPTURE_CATALOG_KEYS = [
  "schemaVersion", "workspace", "issues", "labels", "relations", "teams", "workflowStates",
  "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones",
  "cycles", "documents", "rawDocumentIds", "coverage",
] as const;

type JsonRecord = Record<string, unknown>;
type CaptureIssue = LinearNativeIdentityCapture["issues"][number];
type CaptureLabel = LinearNativeIdentityCapture["labels"][number];

export type LinearRequirementLabelCapture = LinearNativeIdentityCapture;
export type LinearRequirementLabelReplacementPhase = "rename" | "create" | "replace" | "retire";

export interface LinearRequirementLabelExpectedLabel {
  id: string;
  name: string;
  color: string;
  description: string;
  inheritedFromId: null;
  isGroup: false;
  parentId: null;
  parentName: null;
  teamId: string | null;
  teamKey: "REQ" | null;
}

export interface LinearRequirementLabelIssuePin {
  issueId: string;
  identifier: string;
  beforeLabelIds: string[];
  afterLabelIds: string[];
  beforeIssueRoot: string;
  afterIssueRoot: string;
  protectedIssueRoot: string;
}

interface BaseOperation {
  ordinal: number;
  operationKey: string;
  phase: LinearRequirementLabelReplacementPhase;
  expectedBeforeStateRoot: string;
  expectedAfterStateRoot: string;
}

export type LinearRequirementLabelReplacementOperation =
  | (BaseOperation & {
    kind: "rename_label";
    labelId: string;
    beforeName: string;
    afterName: string;
  })
  | (BaseOperation & {
    kind: "create_label";
    labelId: string;
  })
  | (BaseOperation & {
    kind: "replace_issue_label";
    issueId: string;
    identifier: string;
    beforeLabelIds: string[];
    afterLabelIds: string[];
    protectedIssueRoot: string;
  })
  | (BaseOperation & {
    kind: "retire_label";
    labelId: string;
  });

export interface LinearRequirementLabelReplacementCandidate {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-candidate";
  sourceCommit: string;
  workspaceId: string;
  requirementsTeamId: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  expectedCurrentRoot: string;
  protectedNativeStateRoot: string;
  oldLabel: LinearRequirementLabelExpectedLabel;
  newLabel: LinearRequirementLabelExpectedLabel;
  retiredName: string;
  issues: LinearRequirementLabelIssuePin[];
  operations: LinearRequirementLabelReplacementOperation[];
  operationsRoot: string;
  mutationAuthorized: false;
  root: string;
}

export interface LinearRequirementLabelReplacementTransport {
  readLabel(id: string): Promise<CaptureLabel | null>;
  readIssue(id: string): Promise<CaptureIssue | null>;
  listIssueIdsByLabel(id: string): Promise<string[]>;
  renameLabel(input: { id: string; name: string }): Promise<void>;
  createLabel(input: LinearRequirementLabelExpectedLabel): Promise<void>;
  replaceIssueLabels(input: { issueId: string; labelIds: string[] }): Promise<void>;
  setLabelRetired(input: { id: string; retired: boolean }): Promise<void>;
}

export interface LinearRequirementLabelReplacementAuthorization {
  candidateRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE";
}

export interface LinearRequirementLabelReplacementCompensationAuthorization {
  candidateRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  confirmation: "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE";
}

export interface LinearRequirementLabelReplacementJournalRecord {
  schemaVersion: 1;
  sequence: number;
  runId: string;
  candidateRoot: string;
  operationsRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  direction: "forward" | "compensation";
  operationKey: string;
  operationOrdinal: number;
  operationKind: LinearRequirementLabelReplacementOperation["kind"];
  status: "started" | "applied" | "compensated";
  beforeStateRoot: string;
  afterStateRoot: string;
  occurredAt: string;
  previousRecordSha256: string | null;
  recordSha256: string;
}

export interface LinearRequirementLabelReplacementPhaseReceipt {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-phase-receipt";
  candidateRoot: string;
  operationsRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  direction: "forward" | "compensation";
  chunk: number;
  completedOperations: number;
  phaseOperationCount: number;
  phaseComplete: boolean;
  journalRecordCount: number;
  journalSha256: string;
  terminalRecordSha256: string;
  protectedNativeStateRoot: string;
  previousReceiptRoot: string | null;
  root: string;
}

export interface LinearRequirementLabelReplacementExecutionResult {
  phase: LinearRequirementLabelReplacementPhase;
  candidateRoot: string;
  operationCount: number;
  applied: number;
  alreadyApplied: number;
  appendedJournalRaw: string;
  journalRaw: string;
  journalSha256: string;
  receipts: LinearRequirementLabelReplacementPhaseReceipt[];
}

export interface LinearRequirementLabelReplacementCompensationResult {
  phase: LinearRequirementLabelReplacementPhase;
  candidateRoot: string;
  operationCount: number;
  compensated: number;
  alreadyCompensated: number;
  appendedJournalRaw: string;
  journalRaw: string;
  journalSha256: string;
  receipts: LinearRequirementLabelReplacementPhaseReceipt[];
}

export interface LinearRequirementLabelReplacementFinalReceipt {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-final-receipt";
  candidateRoot: string;
  firstCaptureSha256: string;
  secondCaptureSha256: string;
  firstCaptureRoot: string;
  secondCaptureRoot: string;
  protectedNativeStateRoot: string;
  requirementUses: 186;
  oldLabelUses: 0;
  outsideRequirementUses: 0;
  stable: true;
  root: string;
}

export interface LinearRequirementLabelHistoricalArtifactContract {
  artifactId: string;
  artifactName: string;
  artifactDigest: string;
  runId: string;
  runAttempt: "1";
  commit: string;
  candidateSha256: string;
  receiptSha256: string;
  journalSha256: string;
  coreReceiptsSha256: string;
  runnerRoot: string;
}

export interface LinearRequirementLabelSemanticBaselineContract {
  schemaVersion: 3;
  kind: "linear-requirement-label-semantic-baseline-handoff";
  candidateRoot: string;
  candidateSourceCommit: string;
  diagnosticCommit: string;
  transitionCommit: string;
  baselineCommit: string;
  previousReceiptRoot: string;
  candidateControlTreeRoot: string;
  diagnosticControlTreeRoot: string;
  transitionControlTreeRoot: string;
  baselineControlTreeRoot: string;
  historicalEvidence: {
    verify: LinearRequirementLabelHistoricalArtifactContract;
    retire: LinearRequirementLabelHistoricalArtifactContract;
  };
  historicalProof: {
    protectedNativeStateRoot: string;
    verifyPreviousReceiptRoot: string;
    verifyJournalRecordCount: 376;
    verifyCoreReceiptCount: 10;
    verifyTerminalRecordSha256: string;
    verifyTerminalCoreReceiptRoot: string;
    retireJournalRecordCount: 378;
    retireCoreReceiptCount: 11;
    retireTerminalRecordSha256: string;
    retireTerminalCoreReceiptRoot: string;
  };
  root: string;
}

export interface LinearRequirementLabelFinalizeControlTransition {
  source: string;
  head: string;
  beforeRoot: string;
  afterRoot: string;
}

export interface LinearRequirementLabelHistoricalArtifactFiles {
  candidateRaw: string;
  receiptRaw: string;
  journalRaw: string;
  coreReceiptsRaw: string;
}

export interface LinearRequirementLabelHistoricalProof {
  schemaVersion: 1;
  kind: "linear-requirement-label-historical-proof";
  candidateRoot: string;
  verifyRunnerRoot: string;
  retireRunnerRoot: string;
  candidateProtectedNativeStateRoot: string;
  verifyJournalSha256: string;
  retireJournalSha256: string;
  verifyTerminalRecordSha256: string;
  retireTerminalRecordSha256: string;
  verifyTerminalCoreReceiptRoot: string;
  retireTerminalCoreReceiptRoot: string;
  root: string;
}

export interface LinearRequirementLabelCurrentIssueState {
  issueId: string;
  identifier: string;
  fullStateRoot: string;
  protectedStateRoot: string;
}

export interface LinearRequirementLabelReplacementFinalReceiptV3 {
  schemaVersion: 3;
  kind: "linear-requirement-label-replacement-final-receipt";
  candidateRoot: string;
  transitionRoot: string;
  semanticBaselineContract: LinearRequirementLabelSemanticBaselineContract;
  finalizeControlTransition: LinearRequirementLabelFinalizeControlTransition;
  historicalProof: LinearRequirementLabelHistoricalProof;
  firstCaptureSha256: string;
  secondCaptureSha256: string;
  firstCaptureRoot: string;
  secondCaptureRoot: string;
  currentGlobalRoot: string;
  firstCatalogRoots: Record<string, string>;
  secondCatalogRoots: Record<string, string>;
  currentCatalogRoots: Record<string, string>;
  firstProtectedNativeStateRoot: string;
  secondProtectedNativeStateRoot: string;
  currentProtectedNativeStateRoot: string;
  currentRequirementIssueStates: LinearRequirementLabelCurrentIssueState[];
  currentRequirementIssueStateRoot: string;
  requirementUses: 186;
  oldLabelUses: 0;
  outsideRequirementUses: 0;
  stable: true;
  root: string;
}

function fail(message: string): never {
  throw new Error(`Linear Requirement label replacement: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("sealed data contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function exactKeys(value: unknown, keys: readonly string[], label: string): asserts value is JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value) ||
    Object.keys(value).sort().join("\0") !== [...keys].sort().join("\0")) {
    fail(`${label} keys differ from the sealed contract`);
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeRaw(raw: string | undefined): string {
  if (!raw) return "";
  return raw.endsWith("\n") ? raw : `${raw}\n`;
}

function exactDigest(value: string, label: string): string {
  if (!DIGEST.test(value)) fail(`${label} is not a SHA-256 digest`);
  return value;
}

function exactUuid(value: string, label: string): string {
  if (!UUID_V4.test(value) || value !== value.toLowerCase()) fail(`${label} is not a lowercase UUIDv4`);
  return value;
}

function exactTimestamp(value: string, label: string): string {
  if (!CANONICAL_UTC.test(value) || Number.isNaN(Date.parse(value))) fail(`${label} is not a canonical UTC timestamp`);
  return value;
}

function uniqueStrings(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label} contains duplicates`);
}

function requirementNumber(identifier: string): number {
  const match = IDENTIFIER.exec(identifier);
  if (!match) fail(`issue identifier ${identifier} is not a REQ identifier`);
  return Number(match[1]);
}

function sortedLabelIds(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !UUID_V4.test(value))) {
    fail(`${label} is invalid`);
  }
  const sorted = [...values].map((value) => value.toLowerCase()).sort();
  uniqueStrings(sorted, label);
  return sorted;
}

function issueRoot(issue: CaptureIssue): string {
  return sha256(canonicalJson({ ...issue, labelIds: sortedLabelIds(issue.labelIds, `${issue.identifier} label IDs`) }));
}

function protectedIssueRoot(issue: CaptureIssue): string {
  const { labelIds: _labelIds, ...protectedIssue } = issue;
  return sha256(canonicalJson(protectedIssue));
}

function protectedNativeProjection(
  native: LinearRequirementLabelCapture,
  oldLabelId = OLD_REQUIREMENT_LABEL_ID,
  newLabelId?: string,
): unknown {
  const { issues, labels, coverage, ...rest } = native;
  const ignored = new Set([oldLabelId, ...(newLabelId ? [newLabelId] : [])]);
  return {
    ...rest,
    issues: issues
      .map((issue) => ({
        ...issue,
        labelIds: sortedLabelIds(issue.labelIds, `${issue.identifier} label IDs`).filter((id) => !ignored.has(id)),
      }))
      .sort((a, b) => a.issueUuid.localeCompare(b.issueUuid)),
    labels: labels
      .filter((label) => !ignored.has(label.id))
      .map((label) => structuredClone(label))
      .sort((a, b) => a.id.localeCompare(b.id)),
    coverage: { complete: coverage?.complete === true },
  };
}

function protectedNativeRoot(native: LinearRequirementLabelCapture, newLabelId?: string): string {
  return sha256(canonicalJson(protectedNativeProjection(native, OLD_REQUIREMENT_LABEL_ID, newLabelId)));
}

function stableNativeProjection(native: LinearRequirementLabelCapture): unknown {
  if (!native || typeof native !== "object" ||
    Object.keys(native).sort().join("\0") !== [...STABLE_CAPTURE_CATALOG_KEYS].sort().join("\0")) {
    fail("stable capture catalogs differ from the exact allowlist");
  }
  const { issues, labels, coverage } = native;
  return {
    schemaVersion: native.schemaVersion,
    workspace: native.workspace,
    issues: issues
      .map((issue) => ({ ...issue, labelIds: sortedLabelIds(issue.labelIds, `${issue.identifier} label IDs`) }))
      .sort((left, right) => left.issueUuid.localeCompare(right.issueUuid)),
    labels: labels.map((label) => structuredClone(label)).sort((left, right) => left.id.localeCompare(right.id)),
    relations: native.relations,
    teams: native.teams,
    workflowStates: native.workflowStates,
    users: native.users,
    initiatives: native.initiatives,
    projects: native.projects,
    releasePipelines: native.releasePipelines,
    releases: native.releases,
    projectMilestones: native.projectMilestones,
    cycles: native.cycles,
    documents: native.documents,
    rawDocumentIds: native.rawDocumentIds,
    coverage: { complete: coverage.complete, totals: coverage.totals },
  };
}

export interface LinearRequirementLabelStableCaptureComparison {
  firstCaptureRoot: string;
  secondCaptureRoot: string;
  firstCatalogRoots: Record<string, string>;
  secondCatalogRoots: Record<string, string>;
  differingCatalogs: string[];
}

function stableCatalogRoots(native: LinearRequirementLabelCapture): Record<string, string> {
  const projection = stableNativeProjection(native) as JsonRecord;
  return Object.fromEntries(
    STABLE_CAPTURE_CATALOG_KEYS.map((key) => [key, sha256(canonicalJson(projection[key]))]),
  );
}

export function compareLinearRequirementLabelReplacementStableCaptures(
  first: LinearRequirementLabelCapture,
  second: LinearRequirementLabelCapture,
): LinearRequirementLabelStableCaptureComparison {
  const firstProjection = stableNativeProjection(first);
  const secondProjection = stableNativeProjection(second);
  const firstCatalogRoots = stableCatalogRoots(first);
  const secondCatalogRoots = stableCatalogRoots(second);
  const differingCatalogs = STABLE_CAPTURE_CATALOG_KEYS
    .filter((key) => firstCatalogRoots[key] !== secondCatalogRoots[key]);
  return {
    firstCaptureRoot: sha256(canonicalJson(firstProjection)),
    secondCaptureRoot: sha256(canonicalJson(secondProjection)),
    firstCatalogRoots,
    secondCatalogRoots,
    differingCatalogs,
  };
}

function collectUuidV4s(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (UUID_V4.test(value)) found.add(value.toLowerCase());
    return found;
  }
  if (Array.isArray(value)) {
    for (const row of value) collectUuidV4s(row, found);
  } else if (value && typeof value === "object") {
    for (const row of Object.values(value as JsonRecord)) collectUuidV4s(row, found);
  }
  return found;
}

function expectedOldLabel(name = REQUIREMENT_LABEL_NAME): LinearRequirementLabelExpectedLabel {
  return {
    id: OLD_REQUIREMENT_LABEL_ID,
    name,
    color: REQUIREMENT_LABEL_COLOR,
    description: REQUIREMENT_LABEL_DESCRIPTION,
    inheritedFromId: null,
    isGroup: false,
    parentId: null,
    parentName: null,
    teamId: null,
    teamKey: null,
  };
}

function expectedNewLabel(id: string): LinearRequirementLabelExpectedLabel {
  return {
    id,
    name: REQUIREMENT_LABEL_NAME,
    color: REQUIREMENT_LABEL_COLOR,
    description: REQUIREMENT_LABEL_DESCRIPTION,
    inheritedFromId: null,
    isGroup: false,
    parentId: null,
    parentName: null,
    teamId: REQUIREMENTS_TEAM_ID,
    teamKey: "REQ",
  };
}

function assertExplicitLabelRetirementEvidence(label: CaptureLabel, context: string): void {
  if (!Object.prototype.hasOwnProperty.call(label, "retiredAt") ||
    (label.retiredAt !== null && (typeof label.retiredAt !== "string" || label.retiredAt.length === 0))) {
    fail(`${context} is missing explicit retiredAt string-or-null evidence`);
  }
}

function assertCaptureLabelRetirementEvidence(native: LinearRequirementLabelCapture, context: string): void {
  for (const label of native.labels) assertExplicitLabelRetirementEvidence(label, `${context} label ${label.id}`);
}

function labelSemanticProjection(label: CaptureLabel | LinearRequirementLabelExpectedLabel | null): unknown {
  if (label === null) return null;
  return {
    id: label.id,
    name: label.name,
    color: label.color.toUpperCase(),
    description: label.description,
    inheritedFromId: label.inheritedFromId,
    isGroup: label.isGroup,
    parentId: label.parentId,
    parentName: label.parentName,
    teamId: label.teamId,
    teamKey: label.teamKey,
    retired: "retiredAt" in label ? label.retiredAt !== null : false,
  };
}

function expectedLabelSemanticRoot(label: LinearRequirementLabelExpectedLabel, retired: boolean): string {
  return sha256(canonicalJson({ ...labelSemanticProjection(label) as JsonRecord, retired }));
}

function labelSemanticRoot(label: CaptureLabel | LinearRequirementLabelExpectedLabel | null): string {
  return sha256(canonicalJson(labelSemanticProjection(label)));
}

function assertLabel(
  actual: CaptureLabel | null,
  expected: LinearRequirementLabelExpectedLabel,
  retired: boolean,
  label: string,
): CaptureLabel {
  if (actual === null) fail(`${label} is missing`);
  assertExplicitLabelRetirementEvidence(actual, label);
  if (actual.archivedAt !== null) fail(`${label} is archived`);
  const expectedProjection = { ...labelSemanticProjection(expected) as JsonRecord, retired };
  if (canonicalJson(labelSemanticProjection(actual)) !== canonicalJson(expectedProjection)) {
    fail(`${label} differs from its exact identity, meaning, scope, or retirement state`);
  }
  return actual;
}

function labelMatches(
  actual: CaptureLabel | null,
  expected: LinearRequirementLabelExpectedLabel,
  retired: boolean,
): boolean {
  if (actual === null) return false;
  assertExplicitLabelRetirementEvidence(actual, "label reconciliation readback");
  if (actual.archivedAt !== null) return false;
  const expectedProjection = { ...labelSemanticProjection(expected) as JsonRecord, retired };
  return canonicalJson(labelSemanticProjection(actual)) === canonicalJson(expectedProjection);
}

function replacementOperations(
  issues: readonly LinearRequirementLabelIssuePin[],
  oldLabel: LinearRequirementLabelExpectedLabel,
  newLabel: LinearRequirementLabelExpectedLabel,
): LinearRequirementLabelReplacementOperation[] {
  const renamed = { ...oldLabel, name: RETIRED_REQUIREMENT_LABEL_NAME };
  const operations: LinearRequirementLabelReplacementOperation[] = [{
    ordinal: 1,
    operationKey: "label:requirement:rename-retired-scope",
    phase: "rename",
    kind: "rename_label",
    labelId: oldLabel.id,
    beforeName: oldLabel.name,
    afterName: RETIRED_REQUIREMENT_LABEL_NAME,
    expectedBeforeStateRoot: labelSemanticRoot(oldLabel),
    expectedAfterStateRoot: labelSemanticRoot(renamed),
  }, {
    ordinal: 2,
    operationKey: "label:requirement:create-req-scoped",
    phase: "create",
    kind: "create_label",
    labelId: newLabel.id,
    expectedBeforeStateRoot: labelSemanticRoot(null),
    expectedAfterStateRoot: labelSemanticRoot(newLabel),
  }];
  for (const [index, issue] of issues.entries()) {
    operations.push({
      ordinal: index + 3,
      operationKey: `issue:${issue.identifier}:replace-requirement-label`,
      phase: "replace",
      kind: "replace_issue_label",
      issueId: issue.issueId,
      identifier: issue.identifier,
      beforeLabelIds: [...issue.beforeLabelIds],
      afterLabelIds: [...issue.afterLabelIds],
      protectedIssueRoot: issue.protectedIssueRoot,
      expectedBeforeStateRoot: issue.beforeIssueRoot,
      expectedAfterStateRoot: issue.afterIssueRoot,
    });
  }
  operations.push({
    ordinal: REQUIREMENT_LABEL_REPLACEMENT_WRITE_COUNT,
    operationKey: "label:requirement:retire-old-workspace-scope",
    phase: "retire",
    kind: "retire_label",
    labelId: oldLabel.id,
    expectedBeforeStateRoot: labelSemanticRoot(renamed),
    expectedAfterStateRoot: expectedLabelSemanticRoot(renamed, true),
  });
  return operations;
}

function candidateBody(candidate: LinearRequirementLabelReplacementCandidate): Omit<LinearRequirementLabelReplacementCandidate, "root"> {
  const { root: _root, ...body } = candidate;
  return body;
}

export function buildLinearRequirementLabelReplacementCandidate(input: {
  native: LinearRequirementLabelCapture;
  sourceCommit: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  newLabelId: string;
}): LinearRequirementLabelReplacementCandidate {
  const native = input.native;
  if (native?.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace?.archivedAt !== null) {
    fail("fresh native identity capture is incomplete or archived");
  }
  assertCaptureLabelRetirementEvidence(native, "candidate build capture");
  if (!COMMIT.test(input.sourceCommit)) fail("source commit is invalid");
  exactDigest(input.nativeIdentitySha256, "native identity digest");
  exactDigest(input.captureReceiptSha256, "capture receipt digest");
  const newLabelId = exactUuid(input.newLabelId, "new label UUID");
  if (collectUuidV4s(native).has(newLabelId)) fail("new label UUID collides with the captured native UUID set");

  const requirementsTeams = native.teams.filter((team) => team.key === "REQ" && team.name === "Requirements" && team.archivedAt === null);
  if (requirementsTeams.length !== 1 || requirementsTeams[0]!.id !== REQUIREMENTS_TEAM_ID) {
    fail("unique Requirements team identity is invalid");
  }
  const oldMatches = native.labels.filter((label) => label.id === OLD_REQUIREMENT_LABEL_ID);
  if (oldMatches.length !== 1) fail("old Requirement label UUID must resolve exactly once");
  const old = oldMatches[0]!;
  const exactOld = expectedOldLabel();
  if (old.archivedAt !== null || canonicalJson(labelSemanticProjection(old)) !== canonicalJson(labelSemanticProjection(exactOld))) {
    fail("old Requirement label does not have the exact workspace scope and semantics");
  }
  if (native.labels.filter((label) => label.name === REQUIREMENT_LABEL_NAME).length !== 1) {
    fail("Requirement label name must identify only the governed old label");
  }
  if (native.labels.some((label) => label.name === RETIRED_REQUIREMENT_LABEL_NAME)) {
    fail("deterministic retired name has a captured collision");
  }
  if (native.labels.some((label) => label.name === requirementLabelRollbackName(newLabelId))) {
    fail("deterministic rollback name has a captured collision");
  }

  const assigned = native.issues.filter((issue) => issue.labelIds.includes(OLD_REQUIREMENT_LABEL_ID));
  if (assigned.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT) {
    fail(`old Requirement label must be assigned to exactly ${EXPECTED_REQUIREMENT_ISSUE_COUNT} active pinned issues`);
  }
  const allIssueIds = native.issues.map((issue) => issue.issueUuid);
  uniqueStrings(allIssueIds, "captured issue UUIDs");
  const issues = assigned.map((issue) => {
    exactUuid(issue.issueUuid, `${issue.identifier} issue UUID`);
    const beforeLabelIds = sortedLabelIds(issue.labelIds, `${issue.identifier} label IDs`);
    if (issue.archivedAt !== null || issue.teamId !== REQUIREMENTS_TEAM_ID || !IDENTIFIER.test(issue.identifier)) {
      fail(`old Requirement label has an assignment outside the active REQ Requirements team`);
    }
    if (beforeLabelIds.filter((id) => id === OLD_REQUIREMENT_LABEL_ID).length !== 1 || beforeLabelIds.includes(newLabelId)) {
      fail(`${issue.identifier} does not have exactly one replaceable old Requirement label`);
    }
    const afterLabelIds = beforeLabelIds.map((id) => id === OLD_REQUIREMENT_LABEL_ID ? newLabelId : id).sort();
    const after = { ...issue, labelIds: afterLabelIds };
    return {
      issueId: issue.issueUuid,
      identifier: issue.identifier,
      beforeLabelIds,
      afterLabelIds,
      beforeIssueRoot: issueRoot(issue),
      afterIssueRoot: issueRoot(after),
      protectedIssueRoot: protectedIssueRoot(issue),
    };
  }).sort((a, b) => requirementNumber(a.identifier) - requirementNumber(b.identifier));
  uniqueStrings(issues.map((issue) => issue.identifier), "pinned Requirement identifiers");

  const newLabel = expectedNewLabel(newLabelId);
  const operations = replacementOperations(issues, exactOld, newLabel);
  if (operations.length !== REQUIREMENT_LABEL_REPLACEMENT_WRITE_COUNT) fail("write plan cardinality is not exactly 189");
  const projection = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-candidate" as const,
    sourceCommit: input.sourceCommit,
    workspaceId: native.workspace.id,
    requirementsTeamId: REQUIREMENTS_TEAM_ID,
    nativeIdentitySha256: input.nativeIdentitySha256,
    captureReceiptSha256: input.captureReceiptSha256,
    expectedCurrentRoot: sha256(canonicalJson(native)),
    protectedNativeStateRoot: protectedNativeRoot(native, newLabelId),
    oldLabel: exactOld,
    newLabel,
    retiredName: RETIRED_REQUIREMENT_LABEL_NAME,
    issues,
    operations,
    operationsRoot: sha256(canonicalJson(operations)),
    mutationAuthorized: false as const,
  };
  return { ...projection, root: sha256(canonicalJson(projection)) };
}

export function assertLinearRequirementLabelReplacementCandidate(
  candidate: LinearRequirementLabelReplacementCandidate,
): LinearRequirementLabelReplacementCandidate {
  exactKeys(candidate, [
    "schemaVersion", "kind", "sourceCommit", "workspaceId", "requirementsTeamId",
    "nativeIdentitySha256", "captureReceiptSha256", "expectedCurrentRoot", "protectedNativeStateRoot",
    "oldLabel", "newLabel", "retiredName", "issues", "operations", "operationsRoot", "mutationAuthorized", "root",
  ], "candidate");
  if (candidate?.schemaVersion !== 1 || candidate.kind !== "linear-requirement-label-replacement-candidate" ||
    candidate.mutationAuthorized !== false || !COMMIT.test(candidate.sourceCommit) ||
    candidate.requirementsTeamId !== REQUIREMENTS_TEAM_ID || candidate.retiredName !== RETIRED_REQUIREMENT_LABEL_NAME) {
    fail("candidate header or immutable authorization flag is invalid");
  }
  exactUuid(candidate.workspaceId, "workspace UUID");
  exactDigest(candidate.nativeIdentitySha256, "native identity digest");
  exactDigest(candidate.captureReceiptSha256, "capture receipt digest");
  exactDigest(candidate.expectedCurrentRoot, "expected-current root");
  exactDigest(candidate.protectedNativeStateRoot, "protected native-state root");
  exactDigest(candidate.operationsRoot, "operations root");
  exactDigest(candidate.root, "candidate root");
  const labelKeys = ["id", "name", "color", "description", "inheritedFromId", "isGroup", "parentId", "parentName", "teamId", "teamKey"];
  exactKeys(candidate.oldLabel, labelKeys, "candidate old label");
  exactKeys(candidate.newLabel, labelKeys, "candidate new label");
  if (canonicalJson(candidate.oldLabel) !== canonicalJson(expectedOldLabel())) fail("candidate old label semantics differ");
  exactUuid(candidate.newLabel?.id, "candidate new label UUID");
  if (canonicalJson(candidate.newLabel) !== canonicalJson(expectedNewLabel(candidate.newLabel.id)) || candidate.newLabel.id === OLD_REQUIREMENT_LABEL_ID) {
    fail("candidate new label identity or REQ scope differs");
  }
  if (!Array.isArray(candidate.issues) || candidate.issues.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT) {
    fail("candidate must pin exactly 186 Requirement issues");
  }
  let previousRequirementNumber = 0;
  for (const [index, issue] of candidate.issues.entries()) {
    exactKeys(issue, ["issueId", "identifier", "beforeLabelIds", "afterLabelIds", "beforeIssueRoot", "afterIssueRoot", "protectedIssueRoot"], `candidate issue ${index}`);
    exactUuid(issue.issueId, `candidate issue ${index} UUID`);
    const currentRequirementNumber = requirementNumber(issue.identifier);
    if (currentRequirementNumber <= previousRequirementNumber) fail("candidate issue order or REQ identity differs");
    previousRequirementNumber = currentRequirementNumber;
    const before = sortedLabelIds(issue.beforeLabelIds, `${issue.identifier} before labels`);
    const after = sortedLabelIds(issue.afterLabelIds, `${issue.identifier} after labels`);
    if (before.filter((id) => id === OLD_REQUIREMENT_LABEL_ID).length !== 1 || before.includes(candidate.newLabel.id) ||
      after.filter((id) => id === candidate.newLabel.id).length !== 1 || after.includes(OLD_REQUIREMENT_LABEL_ID) ||
      canonicalJson(before.filter((id) => id !== OLD_REQUIREMENT_LABEL_ID)) !== canonicalJson(after.filter((id) => id !== candidate.newLabel.id))) {
      fail(`${issue.identifier} label replacement is not exact`);
    }
    exactDigest(issue.beforeIssueRoot, `${issue.identifier} before root`);
    exactDigest(issue.afterIssueRoot, `${issue.identifier} after root`);
    exactDigest(issue.protectedIssueRoot, `${issue.identifier} protected root`);
  }
  uniqueStrings(candidate.issues.map((row) => row.issueId), "candidate issue UUIDs");
  uniqueStrings(candidate.issues.map((row) => row.identifier), "candidate issue identifiers");
  const expectedOperations = replacementOperations(candidate.issues, candidate.oldLabel, candidate.newLabel);
  for (const [index, operation] of candidate.operations.entries()) {
    const common = ["ordinal", "operationKey", "phase", "kind", "expectedBeforeStateRoot", "expectedAfterStateRoot"];
    const specific = operation.kind === "rename_label"
      ? ["labelId", "beforeName", "afterName"]
      : operation.kind === "create_label" || operation.kind === "retire_label"
        ? ["labelId"]
        : operation.kind === "replace_issue_label"
          ? ["issueId", "identifier", "beforeLabelIds", "afterLabelIds", "protectedIssueRoot"]
          : [];
    exactKeys(operation, [...common, ...specific], `candidate operation ${index}`);
  }
  if (candidate.operations.length !== REQUIREMENT_LABEL_REPLACEMENT_WRITE_COUNT ||
    canonicalJson(candidate.operations) !== canonicalJson(expectedOperations) ||
    candidate.operationsRoot !== sha256(canonicalJson(candidate.operations))) {
    fail("candidate operation order, cardinality, or operations root differs");
  }
  if (candidate.root !== sha256(canonicalJson(candidateBody(candidate)))) fail("candidate root seal differs");
  return candidate;
}

function historicalArtifactContract(
  value: unknown,
  phase: "verify" | "retire",
  expectedCommit: string,
): LinearRequirementLabelHistoricalArtifactContract {
  exactKeys(value, [
    "artifactId", "artifactName", "artifactDigest", "runId", "runAttempt", "commit",
    "candidateSha256", "receiptSha256", "journalSha256", "coreReceiptsSha256", "runnerRoot",
  ], `${phase} historical artifact`);
  const row = value as unknown as LinearRequirementLabelHistoricalArtifactContract;
  if (Object.values(row).some((field) => typeof field !== "string") ||
    !POSITIVE_INTEGER.test(row.artifactId) || !POSITIVE_INTEGER.test(row.runId) || row.runAttempt !== "1" ||
    row.commit !== expectedCommit || row.artifactName !== `linear-requirement-label-replacement-${row.runId}-1` ||
    !GITHUB_DIGEST.test(row.artifactDigest)) {
    fail(`${phase} historical artifact identity differs`);
  }
  exactDigest(row.candidateSha256, `${phase} historical candidate digest`);
  exactDigest(row.receiptSha256, `${phase} historical receipt digest`);
  exactDigest(row.journalSha256, `${phase} historical journal digest`);
  exactDigest(row.coreReceiptsSha256, `${phase} historical core-receipts digest`);
  exactDigest(row.runnerRoot, `${phase} historical runner root`);
  return row;
}

export function assertLinearRequirementLabelSemanticBaselineContract(
  value: LinearRequirementLabelSemanticBaselineContract,
  candidateInput: LinearRequirementLabelReplacementCandidate,
  expectedRoot: string,
  expectedPreviousReceiptRoot: string,
): LinearRequirementLabelSemanticBaselineContract {
  const candidate = assertLinearRequirementLabelReplacementCandidate(candidateInput);
  exactDigest(expectedRoot, "expected semantic-baseline transition root");
  exactDigest(expectedPreviousReceiptRoot, "expected semantic-baseline predecessor root");
  exactKeys(value, [
    "schemaVersion", "kind", "candidateRoot", "candidateSourceCommit", "diagnosticCommit",
    "transitionCommit", "baselineCommit", "previousReceiptRoot", "candidateControlTreeRoot",
    "diagnosticControlTreeRoot", "transitionControlTreeRoot", "baselineControlTreeRoot",
    "historicalEvidence", "historicalProof", "root",
  ], "semantic-baseline transition contract");
  if (value.schemaVersion !== 3 || value.kind !== "linear-requirement-label-semantic-baseline-handoff" ||
    value.candidateRoot !== candidate.root || value.candidateSourceCommit !== candidate.sourceCommit ||
    value.previousReceiptRoot !== expectedPreviousReceiptRoot || value.root !== expectedRoot ||
    !COMMIT.test(value.diagnosticCommit) || !COMMIT.test(value.transitionCommit) ||
    !COMMIT.test(value.baselineCommit) ||
    new Set([
      value.candidateSourceCommit,
      value.diagnosticCommit,
      value.transitionCommit,
      value.baselineCommit,
    ]).size !== 4) {
    fail("semantic-baseline transition identity differs from its exact candidate, lineage, or predecessor");
  }
  exactDigest(value.candidateControlTreeRoot, "candidate control-tree root");
  exactDigest(value.diagnosticControlTreeRoot, "diagnostic control-tree root");
  exactDigest(value.transitionControlTreeRoot, "transition control-tree root");
  exactDigest(value.baselineControlTreeRoot, "baseline control-tree root");
  exactKeys(value.historicalEvidence, ["verify", "retire"], "historical artifact evidence");
  const verify = historicalArtifactContract(value.historicalEvidence.verify, "verify", value.candidateSourceCommit);
  const retire = historicalArtifactContract(value.historicalEvidence.retire, "retire", value.candidateSourceCommit);
  if (verify.artifactId === retire.artifactId || verify.artifactName === retire.artifactName ||
    verify.runId === retire.runId || verify.runnerRoot === retire.runnerRoot ||
    retire.runnerRoot !== value.previousReceiptRoot || verify.candidateSha256 !== retire.candidateSha256) {
    fail("historical phase artifacts are not two distinct candidate-bound receipts");
  }
  exactKeys(value.historicalProof, [
    "protectedNativeStateRoot", "verifyPreviousReceiptRoot", "verifyJournalRecordCount",
    "verifyCoreReceiptCount", "verifyTerminalRecordSha256", "verifyTerminalCoreReceiptRoot",
    "retireJournalRecordCount", "retireCoreReceiptCount", "retireTerminalRecordSha256",
    "retireTerminalCoreReceiptRoot",
  ], "historical proof contract");
  const proof = value.historicalProof;
  if (proof.protectedNativeStateRoot !== candidate.protectedNativeStateRoot ||
    proof.verifyJournalRecordCount !== 376 || proof.verifyCoreReceiptCount !== 10 ||
    proof.retireJournalRecordCount !== 378 || proof.retireCoreReceiptCount !== 11) {
    fail("historical proof cardinality or protected root differs");
  }
  exactDigest(proof.verifyPreviousReceiptRoot, "verify predecessor root");
  exactDigest(proof.verifyTerminalRecordSha256, "verify terminal record root");
  exactDigest(proof.verifyTerminalCoreReceiptRoot, "verify terminal core-receipt root");
  exactDigest(proof.retireTerminalRecordSha256, "retire terminal record root");
  exactDigest(proof.retireTerminalCoreReceiptRoot, "retire terminal core-receipt root");
  const { root: _root, ...body } = value;
  if (value.root !== sha256(canonicalJson(body))) fail("semantic-baseline transition contract root seal differs");
  return value;
}

export function canonicalLinearRequirementLabelReplacementCandidateJson(
  candidate: LinearRequirementLabelReplacementCandidate,
): string {
  assertLinearRequirementLabelReplacementCandidate(candidate);
  return `${JSON.stringify(candidate, null, 2)}\n`;
}

function phaseOperations(
  candidate: LinearRequirementLabelReplacementCandidate,
  phase: LinearRequirementLabelReplacementPhase,
): LinearRequirementLabelReplacementOperation[] {
  return candidate.operations.filter((operation) => operation.phase === phase);
}

function operationByKey(candidate: LinearRequirementLabelReplacementCandidate): Map<string, LinearRequirementLabelReplacementOperation> {
  return new Map(candidate.operations.map((operation) => [operation.operationKey, operation]));
}

function compensationStateRoots(
  candidate: LinearRequirementLabelReplacementCandidate,
  operation: LinearRequirementLabelReplacementOperation,
): { beforeStateRoot: string; afterStateRoot: string } {
  if (operation.kind === "create_label") {
    return {
      beforeStateRoot: operation.expectedAfterStateRoot,
      afterStateRoot: expectedLabelSemanticRoot({
        ...candidate.newLabel,
        name: requirementLabelRollbackName(candidate.newLabel.id),
      }, true),
    };
  }
  return {
    beforeStateRoot: operation.expectedAfterStateRoot,
    afterStateRoot: operation.expectedBeforeStateRoot,
  };
}

function recordBody(
  record: LinearRequirementLabelReplacementJournalRecord,
): Omit<LinearRequirementLabelReplacementJournalRecord, "recordSha256"> {
  const { recordSha256: _recordSha256, ...body } = record;
  return body;
}

export function canonicalLinearRequirementLabelReplacementJournalRecordJson(
  record: LinearRequirementLabelReplacementJournalRecord,
): string {
  return `${JSON.stringify(record)}\n`;
}

interface ParsedJournal {
  records: LinearRequirementLabelReplacementJournalRecord[];
  raw: string;
  lines: string[];
}

function parseJournal(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  raw?: string;
  expectedSha256?: string;
}): ParsedJournal {
  const raw = normalizeRaw(input.raw);
  if (raw.length === 0) {
    if (input.expectedSha256 !== undefined) fail("resume journal digest was supplied without journal bytes");
    return { records: [], raw: "", lines: [] };
  }
  if (input.expectedSha256 === undefined || sha256(raw) !== exactDigest(input.expectedSha256, "resume journal digest")) {
    fail("resume journal digest mismatch");
  }
  const lines = raw.slice(0, -1).split("\n");
  const operations = operationByKey(input.candidate);
  const records: LinearRequirementLabelReplacementJournalRecord[] = [];
  let previous: string | null = null;
  for (const [index, line] of lines.entries()) {
    let record: LinearRequirementLabelReplacementJournalRecord;
    try {
      record = JSON.parse(line) as LinearRequirementLabelReplacementJournalRecord;
    } catch {
      fail(`resume journal line ${index + 1} is not JSON`);
    }
    exactKeys(record, [
      "schemaVersion", "sequence", "runId", "candidateRoot", "operationsRoot", "phase", "direction",
      "operationKey", "operationOrdinal", "operationKind", "status", "beforeStateRoot", "afterStateRoot",
      "occurredAt", "previousRecordSha256", "recordSha256",
    ], `resume journal line ${index + 1}`);
    const operation = operations.get(record.operationKey);
    if (record.schemaVersion !== 1 || record.sequence !== index + 1 || record.candidateRoot !== input.candidate.root ||
      record.operationsRoot !== input.candidate.operationsRoot || !operation || record.operationOrdinal !== operation.ordinal ||
      record.operationKind !== operation.kind || record.phase !== operation.phase ||
      (record.direction !== "forward" && record.direction !== "compensation") ||
      !["started", "applied", "compensated"].includes(record.status) ||
      (record.direction === "forward" && record.status === "compensated") ||
      (record.direction === "compensation" && record.status === "applied") ||
      !SAFE_RUN_ID.test(record.runId) || !CANONICAL_UTC.test(record.occurredAt) ||
      record.previousRecordSha256 !== previous || !DIGEST.test(record.recordSha256) ||
      record.recordSha256 !== sha256(canonicalJson(recordBody(record)))) {
      fail(`resume journal line ${index + 1} is invalid, detached, or has a broken hash chain`);
    }
    exactDigest(record.beforeStateRoot, `resume journal line ${index + 1} before root`);
    exactDigest(record.afterStateRoot, `resume journal line ${index + 1} after root`);
    if (record.direction === "forward" && (record.beforeStateRoot !== operation.expectedBeforeStateRoot || record.afterStateRoot !== operation.expectedAfterStateRoot)) {
      fail(`resume journal line ${index + 1} state roots differ from its operation`);
    }
    const compensationRoots = compensationStateRoots(input.candidate, operation);
    if (record.direction === "compensation" && (record.beforeStateRoot !== compensationRoots.beforeStateRoot || record.afterStateRoot !== compensationRoots.afterStateRoot)) {
      fail(`resume journal line ${index + 1} compensation roots differ from its operation`);
    }
    previous = record.recordSha256;
    records.push(record);
  }
  return { records, raw, lines };
}

function receiptBody(
  receipt: LinearRequirementLabelReplacementPhaseReceipt,
): Omit<LinearRequirementLabelReplacementPhaseReceipt, "root"> {
  const { root: _root, ...body } = receipt;
  return body;
}

export function canonicalLinearRequirementLabelReplacementPhaseReceiptJson(
  receipt: LinearRequirementLabelReplacementPhaseReceipt,
): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

function validateReceipts(
  candidate: LinearRequirementLabelReplacementCandidate,
  journal: ParsedJournal,
  receipts: readonly LinearRequirementLabelReplacementPhaseReceipt[] | undefined,
): LinearRequirementLabelReplacementPhaseReceipt[] {
  const validated: LinearRequirementLabelReplacementPhaseReceipt[] = [];
  let previous: string | null = (receipts ?? [])[0]?.previousReceiptRoot ?? null;
  for (const [index, receipt] of (receipts ?? []).entries()) {
    exactKeys(receipt, [
      "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "direction", "chunk",
      "completedOperations", "phaseOperationCount", "phaseComplete", "journalRecordCount", "journalSha256",
      "terminalRecordSha256", "protectedNativeStateRoot", "previousReceiptRoot", "root",
    ], `phase receipt ${index + 1}`);
    const phaseCount = phaseOperations(candidate, receipt.phase).length;
    if (receipt.schemaVersion !== 1 || receipt.kind !== "linear-requirement-label-replacement-phase-receipt" ||
      receipt.candidateRoot !== candidate.root || receipt.operationsRoot !== candidate.operationsRoot ||
      !["rename", "create", "replace", "retire"].includes(receipt.phase) ||
      (receipt.direction !== "forward" && receipt.direction !== "compensation") ||
      !Number.isInteger(receipt.chunk) || receipt.chunk < 1 || !Number.isInteger(receipt.completedOperations) ||
      receipt.completedOperations < 1 || receipt.completedOperations > phaseCount ||
      receipt.phaseOperationCount !== phaseCount || receipt.phaseComplete !== (receipt.completedOperations === phaseCount) ||
      !Number.isInteger(receipt.journalRecordCount) || receipt.journalRecordCount < 1 || receipt.journalRecordCount > journal.lines.length ||
      receipt.protectedNativeStateRoot !== candidate.protectedNativeStateRoot || receipt.previousReceiptRoot !== previous ||
      !DIGEST.test(receipt.terminalRecordSha256) || receipt.terminalRecordSha256 !== journal.records[receipt.journalRecordCount - 1]!.recordSha256 ||
      receipt.journalSha256 !== sha256(`${journal.lines.slice(0, receipt.journalRecordCount).join("\n")}\n`) ||
      receipt.root !== sha256(canonicalJson(receiptBody(receipt)))) {
      fail(`phase receipt ${index + 1} is invalid or detached from the journal`);
    }
    previous = receipt.root;
    validated.push(receipt);
  }
  return validated;
}

interface HistoricalRunnerReceipt {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-runner-receipt";
  candidateRoot: string;
  operationsRoot: string;
  phase: "verify" | "retire";
  direction: "forward";
  runId: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  secondNativeIdentitySha256: null;
  secondCaptureReceiptSha256: null;
  journalSha256: string;
  coreReceipts: LinearRequirementLabelReplacementPhaseReceipt[];
  applied: number;
  alreadyApplied: number;
  compensated: number;
  alreadyCompensated: number;
  verification: JsonRecord | null;
  previousReceiptRoot: string;
  complete: true;
  root: string;
}

function historicalRunnerBody(receipt: HistoricalRunnerReceipt): Omit<HistoricalRunnerReceipt, "root"> {
  const { root: _root, ...body } = receipt;
  return body;
}

function parseJsonText(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function historicalRunnerReceipt(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  contract: LinearRequirementLabelSemanticBaselineContract;
  phase: "verify" | "retire";
  files: LinearRequirementLabelHistoricalArtifactFiles;
}): { receipt: HistoricalRunnerReceipt; journal: ParsedJournal; receipts: LinearRequirementLabelReplacementPhaseReceipt[] } {
  const evidence = input.contract.historicalEvidence[input.phase];
  if (sha256(input.files.candidateRaw) !== evidence.candidateSha256 ||
    sha256(input.files.receiptRaw) !== evidence.receiptSha256 ||
    sha256(input.files.journalRaw) !== evidence.journalSha256 ||
    sha256(input.files.coreReceiptsRaw) !== evidence.coreReceiptsSha256) {
    fail(`${input.phase} historical artifact file digest differs`);
  }
  const artifactCandidate = assertLinearRequirementLabelReplacementCandidate(
    parseJsonText(input.files.candidateRaw, `${input.phase} historical candidate`) as LinearRequirementLabelReplacementCandidate,
  );
  if (canonicalJson(artifactCandidate) !== canonicalJson(input.candidate)) {
    fail(`${input.phase} historical candidate differs from the exact plan artifact`);
  }
  const receipt = parseJsonText(input.files.receiptRaw, `${input.phase} historical runner receipt`) as HistoricalRunnerReceipt;
  exactKeys(receipt, [
    "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "runId", "nativeIdentitySha256",
    "captureReceiptSha256", "secondNativeIdentitySha256", "secondCaptureReceiptSha256", "direction",
    "journalSha256", "coreReceipts", "applied", "alreadyApplied", "compensated", "alreadyCompensated",
    "verification", "previousReceiptRoot", "complete", "root",
  ], `${input.phase} historical runner receipt`);
  const expectedRunId = input.phase === "verify"
    ? `${evidence.runId}.1.verify`
    : `${evidence.runId}.1.retire.forward`;
  if (receipt.schemaVersion !== 1 || receipt.kind !== "linear-requirement-label-replacement-runner-receipt" ||
    receipt.candidateRoot !== input.candidate.root || receipt.operationsRoot !== input.candidate.operationsRoot ||
    receipt.phase !== input.phase || receipt.direction !== "forward" || receipt.runId !== expectedRunId ||
    receipt.secondNativeIdentitySha256 !== null || receipt.secondCaptureReceiptSha256 !== null ||
    !DIGEST.test(receipt.nativeIdentitySha256) || !DIGEST.test(receipt.captureReceiptSha256) ||
    receipt.journalSha256 !== evidence.journalSha256 || !Array.isArray(receipt.coreReceipts) ||
    receipt.compensated !== 0 || receipt.alreadyCompensated !== 0 || receipt.complete !== true ||
    receipt.root !== evidence.runnerRoot || receipt.root !== sha256(canonicalJson(historicalRunnerBody(receipt)))) {
    fail(`${input.phase} historical runner receipt is invalid or detached`);
  }
  const journal = parseJournal({
    candidate: input.candidate,
    raw: input.files.journalRaw,
    expectedSha256: evidence.journalSha256,
  });
  const receipts = validateReceipts(input.candidate, journal, receipt.coreReceipts);
  const proof = input.contract.historicalProof;
  const expectedRecordCount = input.phase === "verify" ? proof.verifyJournalRecordCount : proof.retireJournalRecordCount;
  const expectedReceiptCount = input.phase === "verify" ? proof.verifyCoreReceiptCount : proof.retireCoreReceiptCount;
  const expectedTerminalRecord = input.phase === "verify" ? proof.verifyTerminalRecordSha256 : proof.retireTerminalRecordSha256;
  const expectedTerminalReceipt = input.phase === "verify" ? proof.verifyTerminalCoreReceiptRoot : proof.retireTerminalCoreReceiptRoot;
  if (journal.records.length !== expectedRecordCount || receipts.length !== expectedReceiptCount ||
    journal.records.at(-1)?.recordSha256 !== expectedTerminalRecord || receipts.at(-1)?.root !== expectedTerminalReceipt ||
    receipts.at(-1)?.journalRecordCount !== expectedRecordCount || receipts.at(-1)?.phaseComplete !== true) {
    fail(`${input.phase} historical journal or core-receipt terminal proof differs`);
  }
  const emitted = input.files.coreReceiptsRaw === "" ? [] : input.files.coreReceiptsRaw.trimEnd().split("\n").map((line) =>
    parseJsonText(line, `${input.phase} emitted core receipt`) as LinearRequirementLabelReplacementPhaseReceipt);
  if (input.phase === "verify") {
    if (emitted.length !== 0 || receipt.applied !== 0 || receipt.alreadyApplied !== 0 ||
      receipt.previousReceiptRoot !== proof.verifyPreviousReceiptRoot) {
      fail("verify historical receipt is not the exact read-only proof");
    }
    exactKeys(receipt.verification, [
      "requirementUses", "oldLabelUses", "outsideRequirementUses", "protectedNativeStateRoot",
    ], "verify historical usage proof");
    if (receipt.verification.requirementUses !== EXPECTED_REQUIREMENT_ISSUE_COUNT ||
      receipt.verification.oldLabelUses !== 0 || receipt.verification.outsideRequirementUses !== 0 ||
      receipt.verification.protectedNativeStateRoot !== input.candidate.protectedNativeStateRoot) {
      fail("verify historical usage or protected root differs");
    }
  } else {
    if (emitted.length !== 1 || canonicalJson(emitted[0]) !== canonicalJson(receipts.at(-1)) ||
      receipt.applied !== 1 || receipt.alreadyApplied !== 0 || receipt.verification !== null ||
      receipt.previousReceiptRoot !== input.contract.historicalEvidence.verify.runnerRoot) {
      fail("retire historical receipt is not the exact verify-linked mutation proof");
    }
  }
  return { receipt, journal, receipts };
}

export function verifyLinearRequirementLabelHistoricalReceiptChain(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  transition: LinearRequirementLabelSemanticBaselineContract;
  expectedTransitionRoot: string;
  expectedPreviousReceiptRoot: string;
  verifyFiles: LinearRequirementLabelHistoricalArtifactFiles;
  retireFiles: LinearRequirementLabelHistoricalArtifactFiles;
}): LinearRequirementLabelHistoricalProof {
  const candidate = assertLinearRequirementLabelReplacementCandidate(input.candidate);
  const transition = assertLinearRequirementLabelSemanticBaselineContract(
    input.transition, candidate, input.expectedTransitionRoot, input.expectedPreviousReceiptRoot,
  );
  const verify = historicalRunnerReceipt({ candidate, contract: transition, phase: "verify", files: input.verifyFiles });
  const retire = historicalRunnerReceipt({ candidate, contract: transition, phase: "retire", files: input.retireFiles });
  if (!input.retireFiles.journalRaw.startsWith(input.verifyFiles.journalRaw) ||
    canonicalJson(retire.receipts.slice(0, verify.receipts.length)) !== canonicalJson(verify.receipts) ||
    retire.receipt.previousReceiptRoot !== verify.receipt.root ||
    transition.previousReceiptRoot !== retire.receipt.root) {
    fail("verify-to-retire historical receipt chain is detached");
  }
  const body = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-historical-proof" as const,
    candidateRoot: candidate.root,
    verifyRunnerRoot: verify.receipt.root,
    retireRunnerRoot: retire.receipt.root,
    candidateProtectedNativeStateRoot: candidate.protectedNativeStateRoot,
    verifyJournalSha256: verify.receipt.journalSha256,
    retireJournalSha256: retire.receipt.journalSha256,
    verifyTerminalRecordSha256: verify.journal.records.at(-1)!.recordSha256,
    retireTerminalRecordSha256: retire.journal.records.at(-1)!.recordSha256,
    verifyTerminalCoreReceiptRoot: verify.receipts.at(-1)!.root,
    retireTerminalCoreReceiptRoot: retire.receipts.at(-1)!.root,
  };
  return { ...body, root: sha256(canonicalJson(body)) };
}

function activeForwardOperations(records: readonly LinearRequirementLabelReplacementJournalRecord[]): Set<string> {
  const active = new Set<string>();
  for (const record of records) {
    if (record.direction === "forward" && record.status === "applied") active.add(record.operationKey);
    if (record.direction === "compensation" && record.status === "compensated") active.delete(record.operationKey);
  }
  return active;
}

function compensatedForwardOperations(records: readonly LinearRequirementLabelReplacementJournalRecord[]): Set<string> {
  const active = new Set<string>();
  const compensated = new Set<string>();
  for (const record of records) {
    if (record.direction === "forward" && record.status === "applied") {
      active.add(record.operationKey);
      compensated.delete(record.operationKey);
    }
    if (record.direction === "compensation" && record.status === "compensated") {
      if (!active.has(record.operationKey)) fail("compensation journal closes an operation that was not active");
      active.delete(record.operationKey);
      compensated.add(record.operationKey);
    }
  }
  return compensated;
}

function hasForwardStartedWithoutApply(
  records: readonly LinearRequirementLabelReplacementJournalRecord[],
  operationKey: string,
): boolean {
  let started = false;
  for (const record of records) {
    if (record.operationKey !== operationKey || record.direction !== "forward") continue;
    if (record.status === "started") started = true;
    if (record.status === "applied") started = false;
  }
  return started;
}

function hasCompensationStartedWithoutCompensated(
  records: readonly LinearRequirementLabelReplacementJournalRecord[],
  operationKey: string,
): boolean {
  let started = false;
  for (const record of records) {
    if (record.operationKey !== operationKey || record.direction !== "compensation") continue;
    if (record.status === "started") started = true;
    if (record.status === "compensated") started = false;
  }
  return started;
}

function priorPhase(phase: LinearRequirementLabelReplacementPhase): LinearRequirementLabelReplacementPhase | null {
  if (phase === "rename") return null;
  if (phase === "create") return "rename";
  if (phase === "replace") return "create";
  return "replace";
}

function validatePhaseEntry(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  phase: LinearRequirementLabelReplacementPhase;
  journal: ParsedJournal;
  receipts: readonly LinearRequirementLabelReplacementPhaseReceipt[];
}): Set<string> {
  const active = activeForwardOperations(input.journal.records);
  const phaseStart = phaseOperations(input.candidate, input.phase)[0]!.ordinal;
  for (const operation of input.candidate.operations) {
    if (operation.ordinal < phaseStart && !active.has(operation.operationKey)) {
      fail(`${input.phase} phase cannot start before every prior operation is receipt-proven and active`);
    }
    if (operation.ordinal > phaseOperations(input.candidate, input.phase).at(-1)!.ordinal && active.has(operation.operationKey)) {
      fail(`${input.phase} phase cannot run while a later phase is active`);
    }
  }
  const prior = priorPhase(input.phase);
  if (prior !== null && !input.receipts.some((receipt) => receipt.direction === "forward" && receipt.phase === prior && receipt.phaseComplete)) {
    fail(`${input.phase} phase requires the prior phase's complete receipt`);
  }
  return active;
}

function exactIssueState(
  actual: CaptureIssue | null,
  pin: LinearRequirementLabelIssuePin,
  desired: "before" | "after",
): CaptureIssue {
  if (actual === null || actual.issueUuid !== pin.issueId || actual.identifier !== pin.identifier || actual.archivedAt !== null ||
    actual.teamId !== REQUIREMENTS_TEAM_ID || protectedIssueRoot(actual) !== pin.protectedIssueRoot ||
    issueRoot(actual) !== (desired === "before" ? pin.beforeIssueRoot : pin.afterIssueRoot)) {
    fail(`${pin.identifier} ${desired} issue state or protected native metadata drifted`);
  }
  return actual;
}

async function assertExactReplacementLabelUses(
  candidate: LinearRequirementLabelReplacementCandidate,
  transport: LinearRequirementLabelReplacementTransport,
  context: string,
): Promise<void> {
  const oldUses = [...await transport.listIssueIdsByLabel(candidate.oldLabel.id)].sort();
  const newUses = [...await transport.listIssueIdsByLabel(candidate.newLabel.id)].sort();
  const expectedUses = candidate.issues.map((row) => row.issueId).sort();
  if (oldUses.length !== 0 || canonicalJson(newUses) !== canonicalJson(expectedUses)) {
    fail(`${context} requires zero old uses and exactly 186 receipt-pinned new uses with no outside use`);
  }
}

async function assertExactRestoredIssueAndLabelUses(
  candidate: LinearRequirementLabelReplacementCandidate,
  transport: LinearRequirementLabelReplacementTransport,
  context: string,
): Promise<void> {
  const oldUses = [...await transport.listIssueIdsByLabel(candidate.oldLabel.id)].sort();
  const newUses = [...await transport.listIssueIdsByLabel(candidate.newLabel.id)].sort();
  const expectedUses = candidate.issues.map((row) => row.issueId).sort();
  if (canonicalJson(oldUses) !== canonicalJson(expectedUses) || newUses.length !== 0) {
    fail(`${context} requires exactly 186 restored old uses and zero new uses`);
  }
  for (const pin of candidate.issues) exactIssueState(await transport.readIssue(pin.issueId), pin, "before");
}

async function assertCompensationTerminalState(
  candidate: LinearRequirementLabelReplacementCandidate,
  phase: LinearRequirementLabelReplacementPhase,
  transport: LinearRequirementLabelReplacementTransport,
): Promise<void> {
  if (phase === "retire") {
    assertLabel(await transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "retirement compensation terminal old label");
    assertLabel(await transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "retirement compensation terminal new label");
    await assertExactReplacementLabelUses(candidate, transport, "retirement compensation terminal usage");
    for (const pin of candidate.issues) exactIssueState(await transport.readIssue(pin.issueId), pin, "after");
    return;
  }

  if (phase === "replace") {
    assertLabel(await transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "replacement compensation terminal old label");
    assertLabel(await transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "replacement compensation terminal new label");
  } else if (phase === "create") {
    assertLabel(await transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "create compensation terminal old label");
    assertLabel(await transport.readLabel(candidate.newLabel.id), {
      ...candidate.newLabel,
      name: requirementLabelRollbackName(candidate.newLabel.id),
    }, true, "create compensation terminal rollback label");
  } else {
    assertLabel(await transport.readLabel(candidate.oldLabel.id), candidate.oldLabel, false, "rename compensation terminal old label");
    const allocated = await transport.readLabel(candidate.newLabel.id);
    if (allocated !== null) {
      assertLabel(allocated, {
        ...candidate.newLabel,
        name: requirementLabelRollbackName(candidate.newLabel.id),
      }, true, "rename compensation terminal rollback label");
    }
  }
  await assertExactRestoredIssueAndLabelUses(candidate, transport, `${phase} compensation terminal usage`);
}

async function reconcileForwardStartedState(
  candidate: LinearRequirementLabelReplacementCandidate,
  operation: LinearRequirementLabelReplacementOperation,
  transport: LinearRequirementLabelReplacementTransport,
): Promise<"before" | "after"> {
  if (operation.kind === "replace_issue_label") {
    const pin = issuePinForOperation(candidate, operation);
    const current = await transport.readIssue(operation.issueId);
    if (current !== null && issueRoot(current) === pin.afterIssueRoot) {
      exactIssueState(current, pin, "after");
      return "after";
    }
    exactIssueState(current, pin, "before");
    return "before";
  }
  if (operation.kind === "rename_label") {
    const current = await transport.readLabel(operation.labelId);
    const allocated = await transport.readLabel(candidate.newLabel.id);
    if (labelMatches(current, { ...candidate.oldLabel, name: candidate.retiredName }, false) && allocated === null) {
      return "after";
    }
    assertLabel(current, candidate.oldLabel, false, "old label during forward rename reconciliation");
    if (allocated !== null) fail("forward rename reconciliation found the preallocated label UUID allocated");
    return "before";
  }
  if (operation.kind === "create_label") {
    assertLabel(await transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "old label during forward create reconciliation");
    const current = await transport.readLabel(operation.labelId);
    if (labelMatches(current, candidate.newLabel, false)) return "after";
    if (current !== null) fail("forward create reconciliation found a conflicting preallocated label UUID");
    return "before";
  }
  assertLabel(await transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new label during forward retirement reconciliation");
  for (const pin of candidate.issues) exactIssueState(await transport.readIssue(pin.issueId), pin, "after");
  await assertExactReplacementLabelUses(candidate, transport, "forward retirement reconciliation usage");
  const current = await transport.readLabel(operation.labelId);
  if (labelMatches(current, { ...candidate.oldLabel, name: candidate.retiredName }, true)) return "after";
  assertLabel(current, { ...candidate.oldLabel, name: candidate.retiredName }, false, "old label during forward retirement reconciliation");
  return "before";
}

function nowIso(clock: (() => Date) | undefined): string {
  const now = (clock ?? (() => new Date()))();
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) fail("journal clock is invalid");
  return now.toISOString();
}

async function appendJournalRecord(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  operation: LinearRequirementLabelReplacementOperation;
  direction: "forward" | "compensation";
  status: "started" | "applied" | "compensated";
  runId: string;
  clock?: () => Date;
  records: LinearRequirementLabelReplacementJournalRecord[];
  appended: string[];
  sink?: (line: string) => void | Promise<void>;
}): Promise<LinearRequirementLabelReplacementJournalRecord> {
  const forward = input.direction === "forward";
  const compensationRoots = compensationStateRoots(input.candidate, input.operation);
  const body = {
    schemaVersion: 1 as const,
    sequence: input.records.length + 1,
    runId: input.runId,
    candidateRoot: input.candidate.root,
    operationsRoot: input.candidate.operationsRoot,
    phase: input.operation.phase,
    direction: input.direction,
    operationKey: input.operation.operationKey,
    operationOrdinal: input.operation.ordinal,
    operationKind: input.operation.kind,
    status: input.status,
    beforeStateRoot: forward ? input.operation.expectedBeforeStateRoot : compensationRoots.beforeStateRoot,
    afterStateRoot: forward ? input.operation.expectedAfterStateRoot : compensationRoots.afterStateRoot,
    occurredAt: nowIso(input.clock),
    previousRecordSha256: input.records.at(-1)?.recordSha256 ?? null,
  };
  const record = { ...body, recordSha256: sha256(canonicalJson(body)) };
  const line = canonicalLinearRequirementLabelReplacementJournalRecordJson(record);
  await input.sink?.(line);
  input.records.push(record);
  input.appended.push(line);
  return record;
}

async function emitReceipt(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  phase: LinearRequirementLabelReplacementPhase;
  direction: "forward" | "compensation";
  completedOperations: number;
  records: LinearRequirementLabelReplacementJournalRecord[];
  rawPrefix: string;
  priorReceipts: readonly LinearRequirementLabelReplacementPhaseReceipt[];
  emitted: LinearRequirementLabelReplacementPhaseReceipt[];
  sink?: (receipt: LinearRequirementLabelReplacementPhaseReceipt) => void | Promise<void>;
}): Promise<void> {
  const operations = phaseOperations(input.candidate, input.phase);
  const previousReceiptRoot = input.emitted.at(-1)?.root ?? input.priorReceipts.at(-1)?.root ?? null;
  const journalRaw = `${input.rawPrefix}${input.records.slice(input.rawPrefix === "" ? 0 : input.rawPrefix.trimEnd().split("\n").length).map(canonicalLinearRequirementLabelReplacementJournalRecordJson).join("")}`;
  const body = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-phase-receipt" as const,
    candidateRoot: input.candidate.root,
    operationsRoot: input.candidate.operationsRoot,
    phase: input.phase,
    direction: input.direction,
    chunk: input.priorReceipts.filter((receipt) => receipt.phase === input.phase && receipt.direction === input.direction).length +
      input.emitted.filter((receipt) => receipt.phase === input.phase && receipt.direction === input.direction).length + 1,
    completedOperations: input.completedOperations,
    phaseOperationCount: operations.length,
    phaseComplete: input.completedOperations === operations.length,
    journalRecordCount: input.records.length,
    journalSha256: sha256(journalRaw),
    terminalRecordSha256: input.records.at(-1)!.recordSha256,
    protectedNativeStateRoot: input.candidate.protectedNativeStateRoot,
    previousReceiptRoot,
  };
  const receipt = { ...body, root: sha256(canonicalJson(body)) };
  await input.sink?.(receipt);
  input.emitted.push(receipt);
}

function assertApplyAuthorization(
  candidate: LinearRequirementLabelReplacementCandidate,
  phase: LinearRequirementLabelReplacementPhase,
  expectedCandidateRoot: string,
  authorization: LinearRequirementLabelReplacementAuthorization,
): void {
  if (expectedCandidateRoot !== candidate.root || authorization?.candidateRoot !== candidate.root ||
    authorization.phase !== phase || authorization.confirmation !== "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE") {
    fail("phase apply authorization is not bound to the exact candidate root and phase");
  }
}

function issuePinForOperation(
  candidate: LinearRequirementLabelReplacementCandidate,
  operation: Extract<LinearRequirementLabelReplacementOperation, { kind: "replace_issue_label" }>,
): LinearRequirementLabelIssuePin {
  const pin = candidate.issues.find((row) => row.issueId === operation.issueId);
  if (!pin || pin.identifier !== operation.identifier) fail("issue operation is detached from its pin");
  return pin;
}

export async function executeLinearRequirementLabelReplacementPhase(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  expectedCandidateRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  authorization: LinearRequirementLabelReplacementAuthorization;
  runId: string;
  transport: LinearRequirementLabelReplacementTransport;
  resumeJournalRaw?: string;
  expectedResumeJournalSha256?: string;
  receipts?: LinearRequirementLabelReplacementPhaseReceipt[];
  clock?: () => Date;
  journalSink?: (line: string) => void | Promise<void>;
  receiptSink?: (receipt: LinearRequirementLabelReplacementPhaseReceipt) => void | Promise<void>;
}): Promise<LinearRequirementLabelReplacementExecutionResult> {
  const candidate = assertLinearRequirementLabelReplacementCandidate(input.candidate);
  if (!SAFE_RUN_ID.test(input.runId)) fail("run ID is unsafe");
  assertApplyAuthorization(candidate, input.phase, input.expectedCandidateRoot, input.authorization);
  const journal = parseJournal({ candidate, raw: input.resumeJournalRaw, expectedSha256: input.expectedResumeJournalSha256 });
  const priorReceipts = validateReceipts(candidate, journal, input.receipts);
  const active = validatePhaseEntry({ candidate, phase: input.phase, journal, receipts: priorReceipts });
  const operations = phaseOperations(candidate, input.phase);
  const records = [...journal.records];
  const appended: string[] = [];
  const emitted: LinearRequirementLabelReplacementPhaseReceipt[] = [];
  let applied = 0;
  let alreadyApplied = 0;

  const append = (operation: LinearRequirementLabelReplacementOperation, status: "started" | "applied") => appendJournalRecord({
    candidate, operation, direction: "forward", status, runId: input.runId, clock: input.clock,
    records, appended, sink: input.journalSink,
  });
  const receipt = async (completedOperations: number): Promise<void> => emitReceipt({
    candidate, phase: input.phase, direction: "forward", completedOperations, records,
    rawPrefix: journal.raw, priorReceipts, emitted, sink: input.receiptSink,
  });

  if (input.phase === "rename") {
    const operation = operations[0] as Extract<LinearRequirementLabelReplacementOperation, { kind: "rename_label" }>;
    const old = await input.transport.readLabel(candidate.oldLabel.id);
    const allocated = await input.transport.readLabel(candidate.newLabel.id);
    if (active.has(operation.operationKey)) {
      assertLabel(old, { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old Requirement label");
      if (allocated !== null) fail("rename replay found the preallocated new label before its create phase");
      alreadyApplied = 1;
    } else if (hasForwardStartedWithoutApply(records, operation.operationKey) &&
      labelMatches(old, { ...candidate.oldLabel, name: candidate.retiredName }, false) && allocated === null) {
      await append(operation, "applied");
      active.add(operation.operationKey);
      alreadyApplied = 1;
      await receipt(1);
    } else {
      assertLabel(old, candidate.oldLabel, false, "old Requirement label");
      if (allocated !== null) fail("preallocated new label UUID collided before rename");
      await append(operation, "started");
      await input.transport.renameLabel({ id: operation.labelId, name: operation.afterName });
      assertLabel(await input.transport.readLabel(operation.labelId), { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old Requirement label readback");
      await append(operation, "applied");
      active.add(operation.operationKey);
      applied = 1;
      await receipt(1);
    }
  } else if (input.phase === "create") {
    assertLabel(await input.transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old Requirement label");
    const operation = operations[0] as Extract<LinearRequirementLabelReplacementOperation, { kind: "create_label" }>;
    const current = await input.transport.readLabel(candidate.newLabel.id);
    if (active.has(operation.operationKey)) {
      assertLabel(current, candidate.newLabel, false, "new Requirement label");
      alreadyApplied = 1;
    } else if (hasForwardStartedWithoutApply(records, operation.operationKey) &&
      labelMatches(current, candidate.newLabel, false)) {
      await append(operation, "applied");
      active.add(operation.operationKey);
      alreadyApplied = 1;
      await receipt(1);
    } else {
      if (current !== null) fail("preallocated new label UUID collided before create");
      await append(operation, "started");
      await input.transport.createLabel(structuredClone(candidate.newLabel));
      assertLabel(await input.transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new Requirement label readback");
      await append(operation, "applied");
      active.add(operation.operationKey);
      applied = 1;
      await receipt(1);
    }
  } else if (input.phase === "replace") {
    assertLabel(await input.transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old Requirement label");
    assertLabel(await input.transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new Requirement label");
    for (const operation of operations as Array<Extract<LinearRequirementLabelReplacementOperation, { kind: "replace_issue_label" }>>) {
      const pin = issuePinForOperation(candidate, operation);
      const current = await input.transport.readIssue(operation.issueId);
      if (active.has(operation.operationKey)) {
        exactIssueState(current, pin, "after");
        alreadyApplied += 1;
        continue;
      }
      if (current !== null && issueRoot(current) === pin.afterIssueRoot) {
        if (hasForwardStartedWithoutApply(records, operation.operationKey)) {
          await append(operation, "applied");
          active.add(operation.operationKey);
          alreadyApplied += 1;
          const completed = operations.filter((row) => active.has(row.operationKey)).length;
          if (completed % REPLACEMENT_RECEIPT_CHUNK === 0 || completed === operations.length) await receipt(completed);
          continue;
        }
        fail(`${operation.identifier} is already changed without a matching resume journal`);
      }
      exactIssueState(current, pin, "before");
      await append(operation, "started");
      await input.transport.replaceIssueLabels({ issueId: operation.issueId, labelIds: [...operation.afterLabelIds] });
      exactIssueState(await input.transport.readIssue(operation.issueId), pin, "after");
      await append(operation, "applied");
      active.add(operation.operationKey);
      applied += 1;
      const completed = operations.filter((row) => active.has(row.operationKey)).length;
      if (completed % REPLACEMENT_RECEIPT_CHUNK === 0 || completed === operations.length) await receipt(completed);
    }
  } else {
    const operation = operations[0] as Extract<LinearRequirementLabelReplacementOperation, { kind: "retire_label" }>;
    const old = await input.transport.readLabel(candidate.oldLabel.id);
    assertLabel(await input.transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new Requirement label");
    for (const pin of candidate.issues) exactIssueState(await input.transport.readIssue(pin.issueId), pin, "after");
    await assertExactReplacementLabelUses(candidate, input.transport, "retire phase pre-readback usage");
    if (active.has(operation.operationKey)) {
      assertLabel(old, { ...candidate.oldLabel, name: candidate.retiredName }, true, "old Requirement label before retirement replay");
      alreadyApplied = 1;
    } else if (hasForwardStartedWithoutApply(records, operation.operationKey) &&
      labelMatches(old, { ...candidate.oldLabel, name: candidate.retiredName }, true)) {
      await append(operation, "applied");
      active.add(operation.operationKey);
      alreadyApplied = 1;
      await receipt(1);
    } else {
      assertLabel(old, { ...candidate.oldLabel, name: candidate.retiredName }, false, "old Requirement label before retirement");
      await append(operation, "started");
      await input.transport.setLabelRetired({ id: operation.labelId, retired: true });
      assertLabel(await input.transport.readLabel(operation.labelId), { ...candidate.oldLabel, name: candidate.retiredName }, true, "retired old Requirement label readback");
      await append(operation, "applied");
      active.add(operation.operationKey);
      applied = 1;
      await receipt(1);
    }
    assertLabel(await input.transport.readLabel(operation.labelId), { ...candidate.oldLabel, name: candidate.retiredName }, true, "retired old Requirement label terminal readback");
    await assertExactReplacementLabelUses(candidate, input.transport, "retire phase post-readback usage");
  }

  const phaseIsComplete = operations.every((operation) => active.has(operation.operationKey));
  const hasCompleteReceipt = [...priorReceipts, ...emitted].some((row) =>
    row.direction === "forward" && row.phase === input.phase && row.phaseComplete,
  );
  if (phaseIsComplete && !hasCompleteReceipt) await receipt(operations.length);

  const appendedJournalRaw = appended.join("");
  const journalRaw = `${journal.raw}${appendedJournalRaw}`;
  return {
    phase: input.phase,
    candidateRoot: candidate.root,
    operationCount: operations.length,
    applied,
    alreadyApplied,
    appendedJournalRaw,
    journalRaw,
    journalSha256: sha256(journalRaw),
    receipts: emitted,
  };
}

function assertCompensationAuthorization(
  candidate: LinearRequirementLabelReplacementCandidate,
  phase: LinearRequirementLabelReplacementPhase,
  expectedCandidateRoot: string,
  authorization: LinearRequirementLabelReplacementCompensationAuthorization,
): void {
  if (expectedCandidateRoot !== candidate.root || authorization?.candidateRoot !== candidate.root ||
    authorization.phase !== phase || authorization.confirmation !== "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE") {
    fail("compensation authorization is not bound to the exact candidate root and phase");
  }
}

export async function compensateLinearRequirementLabelReplacementPhase(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  expectedCandidateRoot: string;
  phase: LinearRequirementLabelReplacementPhase;
  authorization: LinearRequirementLabelReplacementCompensationAuthorization;
  runId: string;
  transport: LinearRequirementLabelReplacementTransport;
  resumeJournalRaw: string;
  expectedResumeJournalSha256: string;
  receipts?: LinearRequirementLabelReplacementPhaseReceipt[];
  clock?: () => Date;
  journalSink?: (line: string) => void | Promise<void>;
  receiptSink?: (receipt: LinearRequirementLabelReplacementPhaseReceipt) => void | Promise<void>;
}): Promise<LinearRequirementLabelReplacementCompensationResult> {
  const candidate = assertLinearRequirementLabelReplacementCandidate(input.candidate);
  if (!SAFE_RUN_ID.test(input.runId)) fail("run ID is unsafe");
  assertCompensationAuthorization(candidate, input.phase, input.expectedCandidateRoot, input.authorization);
  const journal = parseJournal({ candidate, raw: input.resumeJournalRaw, expectedSha256: input.expectedResumeJournalSha256 });
  const priorReceipts = validateReceipts(candidate, journal, input.receipts);
  const active = activeForwardOperations(journal.records);
  const operations = phaseOperations(candidate, input.phase);
  const records = [...journal.records];
  const appended: string[] = [];
  const emitted: LinearRequirementLabelReplacementPhaseReceipt[] = [];
  let compensated = 0;
  let alreadyCompensated = 0;
  const append = (operation: LinearRequirementLabelReplacementOperation, status: "started" | "compensated") => appendJournalRecord({
    candidate, operation, direction: "compensation", status, runId: input.runId, clock: input.clock,
    records, appended, sink: input.journalSink,
  });

  const outstandingForward = operations.filter((operation) =>
    hasForwardStartedWithoutApply(records, operation.operationKey));
  if (outstandingForward.length > 1) fail("compensation found multiple ambiguous serial forward operations");
  for (const operation of outstandingForward) {
    const liveState = await reconcileForwardStartedState(candidate, operation, input.transport);
    if (liveState === "after") {
      const activeBeforeReconciliation = operations.filter((row) => active.has(row.operationKey));
      if (canonicalJson(activeBeforeReconciliation.map((row) => row.operationKey)) !==
        canonicalJson(operations.slice(0, activeBeforeReconciliation.length).map((row) => row.operationKey)) ||
        operations[activeBeforeReconciliation.length]?.operationKey !== operation.operationKey) {
        fail("ambiguous landed forward operation is not the next serial phase operation");
      }
      await appendJournalRecord({
        candidate,
        operation,
        direction: "forward",
        status: "applied",
        runId: input.runId,
        clock: input.clock,
        records,
        appended,
        sink: input.journalSink,
      });
      active.add(operation.operationKey);
      const activePhase = operations.filter((row) => active.has(row.operationKey));
      if (canonicalJson(activePhase.map((row) => row.operationKey)) !==
        canonicalJson(operations.slice(0, activePhase.length).map((row) => row.operationKey))) {
        fail("reconciled forward operations are not a serial phase prefix");
      }
      await emitReceipt({
        candidate,
        phase: input.phase,
        direction: "forward",
        completedOperations: activePhase.length,
        records,
        rawPrefix: journal.raw,
        priorReceipts,
        emitted,
        sink: input.receiptSink,
      });
    }
  }

  const activePhase = operations.filter((operation) => active.has(operation.operationKey));
  if (canonicalJson(activePhase.map((operation) => operation.operationKey)) !==
    canonicalJson(operations.slice(0, activePhase.length).map((operation) => operation.operationKey))) {
    fail("active forward operations are not a serial phase prefix");
  }

  const selectedOrdinals = new Set(operations.map((row) => row.ordinal));
  if (candidate.operations.some((operation) => operation.ordinal > Math.max(...selectedOrdinals) &&
    (active.has(operation.operationKey) || hasForwardStartedWithoutApply(records, operation.operationKey)))) {
    fail("compensation must begin with the latest active or ambiguous forward phase");
  }
  if (!operations.some((operation) => active.has(operation.operationKey))) {
    const compensatedKeys = compensatedForwardOperations(records);
    if (!operations.some((operation) => compensatedKeys.has(operation.operationKey))) {
      fail("selected phase has no journal-proven operation to compensate");
    }
    if (operations.some((operation) => hasCompensationStartedWithoutCompensated(records, operation.operationKey))) {
      fail("all-compensated recovery found a dangling compensation start");
    }
    await assertCompensationTerminalState(candidate, input.phase, input.transport);
    alreadyCompensated = operations.length;
    const terminalJournalRaw = `${journal.raw}${appended.join("")}`;
    const terminalRecord = records.at(-1)!;
    const hasCompleteReceipt = priorReceipts.some((receipt) =>
      receipt.direction === "compensation" && receipt.phase === input.phase && receipt.phaseComplete &&
      receipt.journalRecordCount === records.length && receipt.journalSha256 === sha256(terminalJournalRaw) &&
      receipt.terminalRecordSha256 === terminalRecord.recordSha256);
    if (!hasCompleteReceipt) {
      await emitReceipt({
        candidate,
        phase: input.phase,
        direction: "compensation",
        completedOperations: operations.length,
        records,
        rawPrefix: journal.raw,
        priorReceipts,
        emitted,
        sink: input.receiptSink,
      });
    }
    const appendedJournalRaw = appended.join("");
    const journalRaw = `${journal.raw}${appendedJournalRaw}`;
    return {
      phase: input.phase,
      candidateRoot: candidate.root,
      operationCount: operations.length,
      compensated,
      alreadyCompensated,
      appendedJournalRaw,
      journalRaw,
      journalSha256: sha256(journalRaw),
      receipts: emitted,
    };
  }

  if (input.phase === "replace") {
    assertLabel(await input.transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "old label before replacement compensation");
    assertLabel(await input.transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new label before replacement compensation");
  } else if (input.phase === "create") {
    assertLabel(await input.transport.readLabel(candidate.oldLabel.id), { ...candidate.oldLabel, name: candidate.retiredName }, false, "old label before create compensation");
  }

  for (const operation of [...operations].reverse()) {
    if (!active.has(operation.operationKey)) {
      alreadyCompensated += 1;
      continue;
    }
    const started = hasCompensationStartedWithoutCompensated(records, operation.operationKey);
    const complete = async (): Promise<void> => {
      await append(operation, "compensated");
      active.delete(operation.operationKey);
      compensated += 1;
    };
    if (operation.kind === "replace_issue_label") {
      const pin = issuePinForOperation(candidate, operation);
      const current = await input.transport.readIssue(operation.issueId);
      if (started && current !== null && issueRoot(current) === pin.beforeIssueRoot) {
        exactIssueState(current, pin, "before");
        await complete();
        continue;
      }
      exactIssueState(current, pin, "after");
      if (!started) await append(operation, "started");
      await input.transport.replaceIssueLabels({ issueId: operation.issueId, labelIds: [...operation.beforeLabelIds] });
      exactIssueState(await input.transport.readIssue(operation.issueId), pin, "before");
    } else if (operation.kind === "rename_label") {
      const allocated = await input.transport.readLabel(candidate.newLabel.id);
      if (allocated !== null) {
        assertLabel(allocated, { ...candidate.newLabel, name: requirementLabelRollbackName(candidate.newLabel.id) }, true, "rollback-retired new label before rename compensation");
      }
      const current = await input.transport.readLabel(operation.labelId);
      if (started && labelMatches(current, candidate.oldLabel, false)) {
        await complete();
        continue;
      }
      assertLabel(current, { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old label before compensation");
      if (!started) await append(operation, "started");
      await input.transport.renameLabel({ id: operation.labelId, name: candidate.oldLabel.name });
      assertLabel(await input.transport.readLabel(operation.labelId), candidate.oldLabel, false, "restored old label readback");
    } else if (operation.kind === "create_label") {
      if ((await input.transport.listIssueIdsByLabel(operation.labelId)).length !== 0) fail("create compensation cannot retire a label that still has issue uses");
      const rollbackLabel = { ...candidate.newLabel, name: requirementLabelRollbackName(candidate.newLabel.id) };
      const current = await input.transport.readLabel(operation.labelId);
      if (started && labelMatches(current, rollbackLabel, true)) {
        await complete();
        continue;
      }
      if (started && labelMatches(current, rollbackLabel, false)) {
        await input.transport.setLabelRetired({ id: operation.labelId, retired: true });
        assertLabel(await input.transport.readLabel(operation.labelId), rollbackLabel, true, "rollback-retired new label compensation readback");
        if ((await input.transport.listIssueIdsByLabel(operation.labelId)).length !== 0) fail("rollback-retired new label gained issue uses during compensation");
        await complete();
        continue;
      }
      assertLabel(current, candidate.newLabel, false, "new label before safe retirement compensation");
      if (!started) await append(operation, "started");
      await input.transport.renameLabel({ id: operation.labelId, name: rollbackLabel.name });
      assertLabel(await input.transport.readLabel(operation.labelId), rollbackLabel, false, "rollback-named new label compensation readback");
      await input.transport.setLabelRetired({ id: operation.labelId, retired: true });
      assertLabel(await input.transport.readLabel(operation.labelId), rollbackLabel, true, "rollback-retired new label compensation readback");
      if ((await input.transport.listIssueIdsByLabel(operation.labelId)).length !== 0) fail("rollback-retired new label gained issue uses during compensation");
    } else {
      const current = await input.transport.readLabel(operation.labelId);
      assertLabel(await input.transport.readLabel(candidate.newLabel.id), candidate.newLabel, false, "new label before retirement compensation");
      await assertExactReplacementLabelUses(candidate, input.transport, "retirement compensation pre-readback usage");
      if (started && labelMatches(current, { ...candidate.oldLabel, name: candidate.retiredName }, false)) {
        await assertExactReplacementLabelUses(candidate, input.transport, "retirement compensation recovered usage");
        await complete();
        continue;
      }
      assertLabel(current, { ...candidate.oldLabel, name: candidate.retiredName }, true, "retired old label before compensation");
      if (!started) await append(operation, "started");
      await input.transport.setLabelRetired({ id: operation.labelId, retired: false });
      assertLabel(await input.transport.readLabel(operation.labelId), { ...candidate.oldLabel, name: candidate.retiredName }, false, "restored old label readback");
      await assertExactReplacementLabelUses(candidate, input.transport, "retirement compensation post-readback usage");
    }
    await complete();
  }
  await assertCompensationTerminalState(candidate, input.phase, input.transport);
  if (compensated > 0) {
    await emitReceipt({
      candidate, phase: input.phase, direction: "compensation", completedOperations: operations.length,
      records, rawPrefix: journal.raw, priorReceipts, emitted, sink: input.receiptSink,
    });
  }
  const appendedJournalRaw = appended.join("");
  const journalRaw = `${journal.raw}${appendedJournalRaw}`;
  return {
    phase: input.phase,
    candidateRoot: candidate.root,
    operationCount: operations.length,
    compensated,
    alreadyCompensated,
    appendedJournalRaw,
    journalRaw,
    journalSha256: sha256(journalRaw),
    receipts: emitted,
  };
}

function verifyReplacementUsageState(
  candidate: LinearRequirementLabelReplacementCandidate,
  native: LinearRequirementLabelCapture,
  oldRetired: boolean,
): { requirementUses: 186; oldLabelUses: 0; outsideRequirementUses: 0 } {
  if (native?.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace?.id !== candidate.workspaceId) {
    fail("verification capture is incomplete or from another workspace");
  }
  assertCaptureLabelRetirementEvidence(native, "verification capture");
  const old = native.labels.filter((label) => label.id === candidate.oldLabel.id);
  const replacement = native.labels.filter((label) => label.id === candidate.newLabel.id);
  if (old.length !== 1 || replacement.length !== 1) fail("old or new Requirement label identity is missing or duplicated");
  assertLabel(old[0]!, { ...candidate.oldLabel, name: candidate.retiredName }, oldRetired, "old Requirement label verification");
  assertLabel(replacement[0]!, candidate.newLabel, false, "new Requirement label verification");
  const activeRequirementNames = native.labels.filter((label) =>
    label.name === REQUIREMENT_LABEL_NAME && label.archivedAt === null && label.retiredAt === null);
  if (activeRequirementNames.length !== 1 || activeRequirementNames[0]!.id !== candidate.newLabel.id) {
    fail("active Requirement label name is not uniquely bound to the new REQ-scoped UUID");
  }
  const oldUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.oldLabel.id));
  const newUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.newLabel.id));
  const expected = new Set(candidate.issues.map((row) => row.issueId));
  const outside = newUses.filter((issue) => !expected.has(issue.issueUuid) || issue.teamId !== REQUIREMENTS_TEAM_ID || issue.archivedAt !== null);
  if (oldUses.length !== 0 || newUses.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT || outside.length !== 0 ||
    new Set(newUses.map((issue) => issue.issueUuid)).size !== EXPECTED_REQUIREMENT_ISSUE_COUNT) {
    fail("label usage does not prove zero old uses, exactly 186 REQ uses, and zero outside uses");
  }
  const byId = new Map(native.issues.map((issue) => [issue.issueUuid, issue]));
  for (const pin of candidate.issues) exactIssueState(byId.get(pin.issueId) ?? null, pin, "after");
  return {
    requirementUses: EXPECTED_REQUIREMENT_ISSUE_COUNT,
    oldLabelUses: 0,
    outsideRequirementUses: 0,
  };
}

export function verifyLinearRequirementLabelReplacementUsage(
  candidateInput: LinearRequirementLabelReplacementCandidate,
  native: LinearRequirementLabelCapture,
  options: { oldRetired?: boolean } = {},
): { requirementUses: 186; oldLabelUses: 0; outsideRequirementUses: 0; protectedNativeStateRoot: string } {
  const candidate = assertLinearRequirementLabelReplacementCandidate(candidateInput);
  const usage = verifyReplacementUsageState(candidate, native, options.oldRetired === true);
  if (protectedNativeRoot(native, candidate.newLabel.id) !== candidate.protectedNativeStateRoot) {
    fail("protected issue, body, relation, or native metadata drifted");
  }
  return {
    ...usage,
    protectedNativeStateRoot: candidate.protectedNativeStateRoot,
  };
}

export function verifyLinearRequirementLabelRenameRecoveryState(
  candidateInput: LinearRequirementLabelReplacementCandidate,
  native: LinearRequirementLabelCapture,
): { requirementUses: 186; newLabelUses: 0; protectedNativeStateRoot: string } {
  const candidate = assertLinearRequirementLabelReplacementCandidate(candidateInput);
  if (native?.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace?.id !== candidate.workspaceId) {
    fail("rename recovery capture is incomplete or from another workspace");
  }
  assertCaptureLabelRetirementEvidence(native, "rename recovery capture");
  if (protectedNativeRoot(native, candidate.newLabel.id) !== candidate.protectedNativeStateRoot) {
    fail("protected issue, body, relation, or native metadata drifted during rename recovery");
  }
  const old = native.labels.filter((label) => label.id === candidate.oldLabel.id);
  const replacement = native.labels.filter((label) => label.id === candidate.newLabel.id);
  if (old.length !== 1 || replacement.length !== 0) {
    fail("rename recovery requires exactly the renamed old label and an unallocated replacement UUID");
  }
  assertLabel(old[0]!, { ...candidate.oldLabel, name: candidate.retiredName }, false, "renamed old Requirement label recovery");
  if (native.labels.some((label) =>
    label.name === REQUIREMENT_LABEL_NAME && label.archivedAt === null && label.retiredAt === null)) {
    fail("rename recovery found an unexpected active Requirement label name");
  }
  const expected = new Set(candidate.issues.map((row) => row.issueId));
  const oldUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.oldLabel.id));
  const newUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.newLabel.id));
  if (oldUses.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT || newUses.length !== 0 ||
    new Set(oldUses.map((issue) => issue.issueUuid)).size !== EXPECTED_REQUIREMENT_ISSUE_COUNT ||
    oldUses.some((issue) => !expected.has(issue.issueUuid))) {
    fail("rename recovery requires exactly 186 pinned old-label uses and zero replacement-label uses");
  }
  const byId = new Map(native.issues.map((issue) => [issue.issueUuid, issue]));
  for (const pin of candidate.issues) exactIssueState(byId.get(pin.issueId) ?? null, pin, "before");
  return {
    requirementUses: EXPECTED_REQUIREMENT_ISSUE_COUNT,
    newLabelUses: 0,
    protectedNativeStateRoot: candidate.protectedNativeStateRoot,
  };
}

export function verifyLinearRequirementLabelReplacementFinal(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  first: LinearRequirementLabelCapture;
  second: LinearRequirementLabelCapture;
  firstCaptureSha256: string;
  secondCaptureSha256: string;
}): LinearRequirementLabelReplacementFinalReceipt {
  const candidate = assertLinearRequirementLabelReplacementCandidate(input.candidate);
  exactDigest(input.firstCaptureSha256, "first stable capture digest");
  exactDigest(input.secondCaptureSha256, "second stable capture digest");
  verifyLinearRequirementLabelReplacementUsage(candidate, input.first, { oldRetired: true });
  verifyLinearRequirementLabelReplacementUsage(candidate, input.second, { oldRetired: true });
  const { firstCaptureRoot, secondCaptureRoot } = compareLinearRequirementLabelReplacementStableCaptures(
    input.first,
    input.second,
  );
  if (firstCaptureRoot !== secondCaptureRoot) fail("two final full captures are not stable");
  const body = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-final-receipt" as const,
    candidateRoot: candidate.root,
    firstCaptureSha256: input.firstCaptureSha256,
    secondCaptureSha256: input.secondCaptureSha256,
    firstCaptureRoot,
    secondCaptureRoot,
    protectedNativeStateRoot: candidate.protectedNativeStateRoot,
    requirementUses: EXPECTED_REQUIREMENT_ISSUE_COUNT as 186,
    oldLabelUses: 0 as const,
    outsideRequirementUses: 0 as const,
    stable: true as const,
  };
  return { ...body, root: sha256(canonicalJson(body)) };
}

function assertHistoricalProof(
  value: LinearRequirementLabelHistoricalProof,
  candidate: LinearRequirementLabelReplacementCandidate,
): LinearRequirementLabelHistoricalProof {
  exactKeys(value, [
    "schemaVersion", "kind", "candidateRoot", "verifyRunnerRoot", "retireRunnerRoot",
    "candidateProtectedNativeStateRoot", "verifyJournalSha256", "retireJournalSha256",
    "verifyTerminalRecordSha256", "retireTerminalRecordSha256", "verifyTerminalCoreReceiptRoot",
    "retireTerminalCoreReceiptRoot", "root",
  ], "historical receipt proof");
  if (value.schemaVersion !== 1 || value.kind !== "linear-requirement-label-historical-proof" ||
    value.candidateRoot !== candidate.root || value.candidateProtectedNativeStateRoot !== candidate.protectedNativeStateRoot ||
    value.verifyRunnerRoot === value.retireRunnerRoot) {
    fail("historical receipt proof identity differs");
  }
  for (const [label, digest] of Object.entries(value)) {
    if (label.endsWith("Root") || label.endsWith("Sha256")) exactDigest(digest as string, `historical proof ${label}`);
  }
  const { root: _root, ...body } = value;
  if (value.root !== sha256(canonicalJson(body))) fail("historical receipt proof root seal differs");
  return value;
}

function assertHistoricalProofMatchesContract(
  proof: LinearRequirementLabelHistoricalProof,
  contract: LinearRequirementLabelSemanticBaselineContract,
): void {
  if (proof.verifyRunnerRoot !== contract.historicalEvidence.verify.runnerRoot ||
    proof.retireRunnerRoot !== contract.historicalEvidence.retire.runnerRoot ||
    proof.retireRunnerRoot !== contract.previousReceiptRoot ||
    proof.candidateProtectedNativeStateRoot !== contract.historicalProof.protectedNativeStateRoot ||
    proof.verifyJournalSha256 !== contract.historicalEvidence.verify.journalSha256 ||
    proof.retireJournalSha256 !== contract.historicalEvidence.retire.journalSha256 ||
    proof.verifyTerminalRecordSha256 !== contract.historicalProof.verifyTerminalRecordSha256 ||
    proof.retireTerminalRecordSha256 !== contract.historicalProof.retireTerminalRecordSha256 ||
    proof.verifyTerminalCoreReceiptRoot !== contract.historicalProof.verifyTerminalCoreReceiptRoot ||
    proof.retireTerminalCoreReceiptRoot !== contract.historicalProof.retireTerminalCoreReceiptRoot) {
    fail("historical proof fields differ from the embedded semantic-baseline contract");
  }
}

function currentRequirementIssueStates(
  candidate: LinearRequirementLabelReplacementCandidate,
  native: LinearRequirementLabelCapture,
): LinearRequirementLabelCurrentIssueState[] {
  if (native?.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace?.id !== candidate.workspaceId ||
    native.workspace.archivedAt !== null) {
    fail("present semantic boundary capture is incomplete or from another workspace");
  }
  assertCaptureLabelRetirementEvidence(native, "present semantic boundary capture");
  const requirementsTeams = native.teams.filter((team) =>
    team.id === REQUIREMENTS_TEAM_ID && team.key === "REQ" && team.name === "Requirements" && team.archivedAt === null);
  if (requirementsTeams.length !== 1) fail("present boundary Requirements team identity differs");
  const issueIds = native.issues.map((issue) => issue.issueUuid);
  const identifiers = native.issues.map((issue) => issue.identifier);
  uniqueStrings(issueIds, "present capture issue UUIDs");
  uniqueStrings(identifiers, "present capture issue identifiers");
  const old = native.labels.filter((label) => label.id === candidate.oldLabel.id);
  const replacement = native.labels.filter((label) => label.id === candidate.newLabel.id);
  if (old.length !== 1 || replacement.length !== 1) fail("present boundary old or new Requirement label identity differs");
  assertLabel(old[0]!, { ...candidate.oldLabel, name: candidate.retiredName }, true, "present boundary retired old label");
  assertLabel(replacement[0]!, candidate.newLabel, false, "present boundary new Requirement label");
  const activeRequirementNames = native.labels.filter((label) =>
    label.name === REQUIREMENT_LABEL_NAME && label.archivedAt === null && label.retiredAt === null);
  if (activeRequirementNames.length !== 1 || activeRequirementNames[0]!.id !== candidate.newLabel.id) {
    fail("present boundary does not have exactly one active REQ-scoped Requirement label");
  }
  const expectedIds = candidate.issues.map((pin) => pin.issueId).sort();
  const oldUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.oldLabel.id));
  const newUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.newLabel.id));
  const newUseIds = newUses.map((issue) => issue.issueUuid).sort();
  if (oldUses.length !== 0 || newUses.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT ||
    canonicalJson(newUseIds) !== canonicalJson(expectedIds) ||
    newUses.some((issue) => issue.teamId !== REQUIREMENTS_TEAM_ID || issue.archivedAt !== null)) {
    fail("present boundary requires 186 exact REQ uses, zero old uses, and zero outside uses");
  }
  const byId = new Map(native.issues.map((issue) => [issue.issueUuid, issue]));
  return candidate.issues.map((pin) => {
    const issue = byId.get(pin.issueId);
    if (!issue || issue.identifier !== pin.identifier || issue.teamId !== REQUIREMENTS_TEAM_ID || issue.archivedAt !== null) {
      fail("present boundary Requirement issue identity, team, or active state differs");
    }
    const labelIds = sortedLabelIds(issue.labelIds, `${pin.identifier} present labels`);
    if (labelIds.filter((id) => id === candidate.newLabel.id).length !== 1 || labelIds.includes(candidate.oldLabel.id)) {
      fail("present boundary Requirement issue label state differs");
    }
    return {
      issueId: pin.issueId,
      identifier: pin.identifier,
      fullStateRoot: issueRoot(issue),
      protectedStateRoot: protectedIssueRoot(issue),
    };
  }).sort((left, right) => left.issueId.localeCompare(right.issueId) || left.identifier.localeCompare(right.identifier));
}

function sortedMerkleRoot(rows: readonly LinearRequirementLabelCurrentIssueState[]): string {
  let level = rows.map((row) => sha256(canonicalJson(row)));
  if (level.length === 0) fail("current Requirement state Merkle tree is empty");
  while (level.length > 1) {
    const next: string[] = [];
    for (let index = 0; index < level.length; index += 2) {
      next.push(sha256(canonicalJson([level[index]!, level[index + 1] ?? level[index]!])));
    }
    level = next;
  }
  return level[0]!;
}

function assertFinalizeControlTransition(
  value: LinearRequirementLabelFinalizeControlTransition,
  contract: LinearRequirementLabelSemanticBaselineContract,
  label: string,
): LinearRequirementLabelFinalizeControlTransition {
  exactKeys(value, ["source", "head", "beforeRoot", "afterRoot"], label);
  if (Object.values(value).some((field) => typeof field !== "string") ||
    !COMMIT.test(value.source) || !COMMIT.test(value.head) ||
    value.source !== contract.baselineCommit || value.beforeRoot !== contract.baselineControlTreeRoot ||
    new Set([
      contract.candidateSourceCommit,
      contract.diagnosticCommit,
      contract.transitionCommit,
      value.source,
      value.head,
    ]).size !== 5 ||
    value.afterRoot === value.beforeRoot) {
    fail(`${label} identity or lineage differs`);
  }
  exactDigest(value.beforeRoot, `${label} before root`);
  exactDigest(value.afterRoot, `${label} after root`);
  return value;
}

export function verifyLinearRequirementLabelReplacementSemanticBaseline(input: {
  candidate: LinearRequirementLabelReplacementCandidate;
  semanticBaselineContract: LinearRequirementLabelSemanticBaselineContract;
  finalizeControlTransition: LinearRequirementLabelFinalizeControlTransition;
  expectedTransitionRoot: string;
  expectedPreviousReceiptRoot: string;
  historicalProof: LinearRequirementLabelHistoricalProof;
  first: LinearRequirementLabelCapture;
  second: LinearRequirementLabelCapture;
  firstCaptureSha256: string;
  secondCaptureSha256: string;
}): LinearRequirementLabelReplacementFinalReceiptV3 {
  const candidate = assertLinearRequirementLabelReplacementCandidate(input.candidate);
  const semanticBaselineContract = assertLinearRequirementLabelSemanticBaselineContract(
    input.semanticBaselineContract,
    candidate,
    input.expectedTransitionRoot,
    input.expectedPreviousReceiptRoot,
  );
  const finalizeControlTransition = assertFinalizeControlTransition(
    input.finalizeControlTransition,
    semanticBaselineContract,
    "current finalize control transition",
  );
  const historicalProof = assertHistoricalProof(input.historicalProof, candidate);
  assertHistoricalProofMatchesContract(historicalProof, semanticBaselineContract);
  exactDigest(input.firstCaptureSha256, "first current capture digest");
  exactDigest(input.secondCaptureSha256, "second current capture digest");
  const firstStates = currentRequirementIssueStates(candidate, input.first);
  const secondStates = currentRequirementIssueStates(candidate, input.second);
  const firstProtectedNativeStateRoot = protectedNativeRoot(input.first, candidate.newLabel.id);
  const secondProtectedNativeStateRoot = protectedNativeRoot(input.second, candidate.newLabel.id);
  if (firstProtectedNativeStateRoot !== secondProtectedNativeStateRoot) {
    fail("two current protected-native roots are not stable");
  }
  const comparison = compareLinearRequirementLabelReplacementStableCaptures(input.first, input.second);
  if (comparison.firstCaptureRoot !== comparison.secondCaptureRoot || comparison.differingCatalogs.length !== 0 ||
    canonicalJson(firstStates) !== canonicalJson(secondStates)) {
    fail("two current full captures are not stable");
  }
  const currentRequirementIssueStateRoot = sortedMerkleRoot(firstStates);
  const body = {
    schemaVersion: 3 as const,
    kind: "linear-requirement-label-replacement-final-receipt" as const,
    candidateRoot: candidate.root,
    transitionRoot: semanticBaselineContract.root,
    semanticBaselineContract: structuredClone(semanticBaselineContract),
    finalizeControlTransition: structuredClone(finalizeControlTransition),
    historicalProof: structuredClone(historicalProof),
    firstCaptureSha256: input.firstCaptureSha256,
    secondCaptureSha256: input.secondCaptureSha256,
    firstCaptureRoot: comparison.firstCaptureRoot,
    secondCaptureRoot: comparison.secondCaptureRoot,
    currentGlobalRoot: comparison.firstCaptureRoot,
    firstCatalogRoots: comparison.firstCatalogRoots,
    secondCatalogRoots: comparison.secondCatalogRoots,
    currentCatalogRoots: comparison.firstCatalogRoots,
    firstProtectedNativeStateRoot,
    secondProtectedNativeStateRoot,
    currentProtectedNativeStateRoot: firstProtectedNativeStateRoot,
    currentRequirementIssueStates: firstStates,
    currentRequirementIssueStateRoot,
    requirementUses: EXPECTED_REQUIREMENT_ISSUE_COUNT as 186,
    oldLabelUses: 0 as const,
    outsideRequirementUses: 0 as const,
    stable: true as const,
  };
  return { ...body, root: sha256(canonicalJson(body)) };
}

export function assertLinearRequirementLabelReplacementFinalReceiptV3(
  value: LinearRequirementLabelReplacementFinalReceiptV3,
  candidateInput: LinearRequirementLabelReplacementCandidate,
  expectedTransitionRoot: string,
  expectedPreviousReceiptRoot: string,
  expectedFinalizeControlTransition: LinearRequirementLabelFinalizeControlTransition,
): LinearRequirementLabelReplacementFinalReceiptV3 {
  const candidate = assertLinearRequirementLabelReplacementCandidate(candidateInput);
  exactKeys(value, [
    "schemaVersion", "kind", "candidateRoot", "transitionRoot", "semanticBaselineContract",
    "finalizeControlTransition", "historicalProof", "firstCaptureSha256", "secondCaptureSha256", "firstCaptureRoot",
    "secondCaptureRoot", "currentGlobalRoot", "firstCatalogRoots", "secondCatalogRoots",
    "currentCatalogRoots", "firstProtectedNativeStateRoot", "secondProtectedNativeStateRoot",
    "currentProtectedNativeStateRoot",
    "currentRequirementIssueStates", "currentRequirementIssueStateRoot", "requirementUses", "oldLabelUses",
    "outsideRequirementUses", "stable", "root",
  ], "semantic-baseline final receipt");
  const contract = assertLinearRequirementLabelSemanticBaselineContract(
    value.semanticBaselineContract,
    candidate,
    expectedTransitionRoot,
    expectedPreviousReceiptRoot,
  );
  const finalizeControlTransition = assertFinalizeControlTransition(
    value.finalizeControlTransition,
    contract,
    "receipt finalize control transition",
  );
  const expectedControlTransition = assertFinalizeControlTransition(
    expectedFinalizeControlTransition,
    contract,
    "expected finalize control transition",
  );
  if (canonicalJson(finalizeControlTransition) !== canonicalJson(expectedControlTransition)) {
    fail("receipt finalize control transition differs from the verified repository transition");
  }
  const historicalProof = assertHistoricalProof(value.historicalProof, candidate);
  assertHistoricalProofMatchesContract(historicalProof, contract);
  if (value.schemaVersion !== 3 || value.kind !== "linear-requirement-label-replacement-final-receipt" ||
    value.candidateRoot !== candidate.root || value.transitionRoot !== contract.root ||
    value.requirementUses !== 186 ||
    value.oldLabelUses !== 0 || value.outsideRequirementUses !== 0 || value.stable !== true ||
    value.firstCaptureRoot !== value.secondCaptureRoot || value.currentGlobalRoot !== value.firstCaptureRoot ||
    value.firstProtectedNativeStateRoot !== value.secondProtectedNativeStateRoot ||
    value.currentProtectedNativeStateRoot !== value.firstProtectedNativeStateRoot) {
    fail("semantic-baseline final receipt identity, history, usage, or stability differs");
  }
  exactDigest(value.firstCaptureSha256, "semantic-baseline first capture digest");
  exactDigest(value.secondCaptureSha256, "semantic-baseline second capture digest");
  exactDigest(value.firstCaptureRoot, "semantic-baseline first capture root");
  exactDigest(value.secondCaptureRoot, "semantic-baseline second capture root");
  exactDigest(value.currentGlobalRoot, "semantic-baseline current global root");
  exactDigest(value.firstProtectedNativeStateRoot, "semantic-baseline first protected root");
  exactDigest(value.secondProtectedNativeStateRoot, "semantic-baseline second protected root");
  exactDigest(value.currentProtectedNativeStateRoot, "semantic-baseline current protected root");
  exactDigest(value.currentRequirementIssueStateRoot, "semantic-baseline Requirement Merkle root");
  for (const [label, roots] of [
    ["first", value.firstCatalogRoots],
    ["second", value.secondCatalogRoots],
    ["current", value.currentCatalogRoots],
  ] as const) {
    exactKeys(roots, STABLE_CAPTURE_CATALOG_KEYS, `semantic-baseline ${label} catalog roots`);
    for (const [catalog, digest] of Object.entries(roots)) {
      exactDigest(digest, `semantic-baseline ${label} ${catalog} catalog root`);
    }
  }
  if (canonicalJson(value.firstCatalogRoots) !== canonicalJson(value.secondCatalogRoots) ||
    canonicalJson(value.currentCatalogRoots) !== canonicalJson(value.firstCatalogRoots)) {
    fail("semantic-baseline first, second, and current catalog roots differ");
  }
  if (!Array.isArray(value.currentRequirementIssueStates) ||
    value.currentRequirementIssueStates.length !== EXPECTED_REQUIREMENT_ISSUE_COUNT) {
    fail("semantic-baseline final receipt lacks 186 current Requirement state leaves");
  }
  for (const [index, row] of value.currentRequirementIssueStates.entries()) {
    exactKeys(row, ["issueId", "identifier", "fullStateRoot", "protectedStateRoot"], `current Requirement state ${index}`);
    exactUuid(row.issueId, `current Requirement state ${index} UUID`);
    requirementNumber(row.identifier);
    exactDigest(row.fullStateRoot, `${row.identifier} current full-state root`);
    exactDigest(row.protectedStateRoot, `${row.identifier} current protected-state root`);
  }
  const sorted = [...value.currentRequirementIssueStates]
    .sort((left, right) => left.issueId.localeCompare(right.issueId) || left.identifier.localeCompare(right.identifier));
  uniqueStrings(sorted.map((row) => row.issueId), "semantic-baseline Requirement UUIDs");
  uniqueStrings(sorted.map((row) => row.identifier), "semantic-baseline Requirement identifiers");
  const expectedIdentities = candidate.issues
    .map((row) => ({ issueId: row.issueId, identifier: row.identifier }))
    .sort((left, right) => left.issueId.localeCompare(right.issueId) || left.identifier.localeCompare(right.identifier));
  const currentIdentities = sorted.map((row) => ({ issueId: row.issueId, identifier: row.identifier }));
  if (canonicalJson(sorted) !== canonicalJson(value.currentRequirementIssueStates) ||
    canonicalJson(currentIdentities) !== canonicalJson(expectedIdentities) ||
    sortedMerkleRoot(sorted) !== value.currentRequirementIssueStateRoot) {
    fail("semantic-baseline current Requirement identity, state order, or Merkle root differs");
  }
  const { root: _root, ...body } = value;
  if (value.root !== sha256(canonicalJson(body))) fail("semantic-baseline final receipt root seal differs");
  return value;
}

export function canonicalLinearRequirementLabelReplacementFinalReceiptJson(
  receipt: LinearRequirementLabelReplacementFinalReceipt | LinearRequirementLabelReplacementFinalReceiptV3,
): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}
