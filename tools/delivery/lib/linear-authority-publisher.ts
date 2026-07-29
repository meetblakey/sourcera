import { createHash } from "node:crypto";
import { canonicalLinearRelationKey } from "./linear-live.js";
import { isUuidV4 } from "./linear-authority-migration.js";
import {
  validateLinearAuthorityStructure,
  type AuthorityDocumentTarget,
  type AuthorityIssueDescriptionRepair,
  type AuthorityManagedTarget,
  type AuthorityNativeRelation,
  type LinearAuthorityAllocation,
  type LinearAuthorityManifest,
  type LinearAuthorityValidationInput,
  type LinearTargetAllocation,
} from "./linear-authority-manifest.js";
import {
  parseLinearAuthoritySemanticPlanV4,
  type ValidatedLinearAuthoritySemanticPlanV4,
} from "./linear-authority-semantic-plan-v4.js";

type JsonPrimitive = string | number | boolean | null;
export type LinearAuthorityJson = JsonPrimitive | LinearAuthorityJson[] | { [key: string]: LinearAuthorityJson };
type JsonRecord = Record<string, unknown>;

export type LinearAuthorityEntityKind = "issue" | "document";
export type LinearAuthorityRelationType = "blocks" | "related" | "duplicate";
export type LinearAuthorityAllocationKind = "issue" | "decision" | "risk" | "document" | "relation_target" | "relation";

export interface LinearAuthorityPublicationArtifacts {
  manifestRaw: string;
  semanticPlanRaw: string;
  liveCaptureRaw: string;
  captureReceiptRaw: string;
  allocationRaw: string;
  operationsRaw: string;
}

export interface LinearAuthorityPublicationPins {
  manifestSha256: string;
  semanticPlanSha256: string;
  liveCaptureSha256: string;
  captureReceiptSha256: string;
  allocationSha256: string;
  operationsSha256: string;
}

interface OperationBase {
  operationKey: string;
  planKey: string;
}

export interface LinearAuthorityCreateEntityOperationBody extends OperationBase {
  kind: "create_entity";
  entityKind: LinearAuthorityEntityKind;
  allocationUuid: string;
  desiredPayloadSha256: string;
  payload: { [key: string]: LinearAuthorityJson };
}

export interface LinearAuthorityUpdateEntityOperationBody extends OperationBase {
  kind: "update_entity";
  entityKind: LinearAuthorityEntityKind;
  targetUuid: string;
  expectedCurrentState: LinearAuthorityEntityPrecondition;
  desiredPayloadSha256: string;
  payload: { [key: string]: LinearAuthorityJson };
}

export interface LinearAuthorityCreateRelationOperationBody extends OperationBase {
  kind: "create_relation";
  allocationUuid: string;
  relationType: LinearAuthorityRelationType;
  sourcePlanKey: string;
  targetPlanKey: string;
  expectedCanonicalKey: string | null;
}

export type LinearAuthorityPublicationOperationBody =
  | LinearAuthorityCreateEntityOperationBody
  | LinearAuthorityUpdateEntityOperationBody
  | LinearAuthorityCreateRelationOperationBody;

export type LinearAuthorityPublicationOperation = LinearAuthorityPublicationOperationBody & {
  idempotencyKey: string;
};

export type LinearAuthorityEntityPrecondition =
  | {
    projection: "managed_issue" | "document";
    titleSha256: string;
    bodySha256: string;
    nativeSha256: string;
  }
  | {
    projection: "description_only";
    bodySha256: string;
  };

export interface LinearAuthorityRemoteEntityState {
  titleSha256: string;
  bodySha256: string;
  nativeSha256: string;
  authorityPayloadSha256: string;
}

export interface LinearAuthorityRemoteEntity {
  uuid: string;
  entityKind: LinearAuthorityEntityKind;
  identifier: string | null;
  state: LinearAuthorityRemoteEntityState;
  archivedAt: string | null;
}

export interface LinearAuthorityRemoteRelation {
  uuid: string;
  canonicalKey: string;
  archivedAt: string | null;
}

export type LinearAuthorityNativeSelectorKind =
  | "team"
  | "user"
  | "initiative"
  | "project"
  | "release_pipeline"
  | "cycle"
  | "milestone"
  | "release"
  | "state"
  | "label"
  | "label_parent";

export interface LinearAuthorityNativeSelector {
  kind: LinearAuthorityNativeSelectorKind;
  planKey: string;
  id: string;
  identity: { [key: string]: LinearAuthorityJson };
}

export interface LinearAuthorityLabelGroupSelectorContract {
  id: string;
  name: string;
  parentId: null;
  parentName: null;
  teamId: null;
  teamKey: null;
  color: string;
  description: string | null;
}

export interface LinearAuthorityRelationPage {
  rows: LinearAuthorityRemoteRelation[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export interface LinearAuthorityWriteTransport {
  readNativeSelectors(input: {
    selectors: LinearAuthorityNativeSelector[];
    credential: string;
  }): Promise<LinearAuthorityNativeSelector[]>;
  listRelationsPage(input: {
    after: string | null;
    first: number;
    includeArchived: true;
    credential: string;
  }): Promise<LinearAuthorityRelationPage>;
  readEntities(input: {
    requests: Array<{
      entityKind: LinearAuthorityEntityKind;
      id: string;
      planKey: string;
      payload: { [key: string]: LinearAuthorityJson };
    }>;
    credential: string;
  }): Promise<LinearAuthorityRemoteEntity[]>;
  issueBatchCreate(input: {
    issues: Array<{
      id: string;
      planKey: string;
      payload: { [key: string]: LinearAuthorityJson };
      idempotencyKey: string;
    }>;
    credential: string;
  }): Promise<LinearAuthorityRemoteEntity[]>;
  mutateEntitiesAliased(input: {
    mutations: Array<{
      action: "create_document" | "update_issue" | "update_document";
      entityKind: LinearAuthorityEntityKind;
      id: string;
      planKey: string;
      expectedCurrentState: LinearAuthorityEntityPrecondition | null;
      payload: { [key: string]: LinearAuthorityJson };
      idempotencyKey: string;
    }>;
    credential: string;
  }): Promise<LinearAuthorityRemoteEntity[]>;
  readRelations(input: {
    requests: Array<{
      id: string;
      sourceUuid: string;
      targetUuid: string;
    }>;
    credential: string;
  }): Promise<LinearAuthorityRemoteRelation[]>;
  createRelationsAliased(input: {
    relations: Array<{
      id: string;
      planKey: string;
      type: LinearAuthorityRelationType;
      sourceUuid: string;
      targetUuid: string;
      canonicalKey: string;
      idempotencyKey: string;
    }>;
    credential: string;
  }): Promise<LinearAuthorityRemoteRelation[]>;
}

export class LinearAuthorityRetryableTransportError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs = 0) {
    super("Retryable Linear authority transport failure");
    this.name = "LinearAuthorityRetryableTransportError";
    this.retryAfterMs = Number.isFinite(retryAfterMs) && retryAfterMs > 0
      ? Math.min(Math.ceil(retryAfterMs), 60_000)
      : 0;
  }
}

export interface LinearAuthorityPublisherLimits {
  maxCaptureAgeMs: number;
  maxApplyDurationMs: number;
  maxOperations: number;
  maxAttemptsPerRequest: number;
  maxHttpAttempts: number;
  maxRelationPages: number;
  maxRelationRows: number;
  relationPageSize: number;
  entityReadBatchSize: number;
  issueCreateBatchSize: number;
  aliasedMutationBatchSize: number;
  relationReadBatchSize: number;
}

export interface LinearAuthorityPublicationInput {
  artifacts: LinearAuthorityPublicationArtifacts;
  pins: LinearAuthorityPublicationPins;
  authorityValidationInput: LinearAuthorityValidationInput;
  mode?: "dry-run" | "apply";
  now?: Date;
  clock?: () => Date;
  limits?: Partial<LinearAuthorityPublisherLimits>;
  runId?: string;
  credentialProvider?: () => string | Promise<string>;
  transport?: LinearAuthorityWriteTransport;
  sleep?: (delayMs: number) => Promise<void>;
  resumeJournalRaw?: string;
  expectedResumeJournalSha256?: string;
  journalSink?: (line: string) => void | Promise<void>;
}

export interface LinearAuthorityPublicationOperationResult {
  operationKey: string;
  planKey: string;
  kind: LinearAuthorityPublicationOperation["kind"];
  status: "planned" | "applied" | "already_applied";
  entityUuid: string;
  canonicalRelationKey: string | null;
}

export interface LinearAuthorityPublicationResult {
  mode: "dry-run" | "apply";
  status: "validated_dry_run" | "applied";
  planRoot: string;
  semanticRoot: string;
  liveCaptureRoot: string;
  operationCount: number;
  applied: number;
  alreadyApplied: number;
  httpAttempts: number;
  results: LinearAuthorityPublicationOperationResult[];
  appendedJournalRaw: string;
}

export interface PreparedLinearAuthorityPublication {
  planRoot: string;
  semanticRoot: string;
  liveCaptureRoot: string;
  sourceCommit: string;
  capturedAt: string;
  operationsRoot: string;
  operations: LinearAuthorityPublicationOperation[];
  allocations: ReadonlyMap<string, ValidatedAllocation>;
  capturedRelations: ReadonlyMap<string, LinearAuthorityRemoteRelation>;
  capturedIssueIdentifiers: ReadonlyMap<string, string>;
  nativeSelectors: readonly LinearAuthorityNativeSelector[];
  limits: LinearAuthorityPublisherLimits;
  resumeRecords: RedactedJournalRecord[];
  validation: {
    structuralIntegrityValidated: true;
    semanticPlanInternalsValidated: true;
    captureEvidenceValidated: true;
    semanticCoverageValidated: true;
    mutationAuthorized: true;
  };
}

interface ValidatedAllocation {
  planKey: string;
  kind: LinearAuthorityAllocationKind;
  title: string | null;
  identifier: string | null;
  uuid: string;
  source: "adopted" | "allocated";
}

interface RedactedJournalRecordBody {
  schemaVersion: 1;
  sequence: number;
  runId: string;
  planRoot: string;
  operationsSha256: string;
  operationKey: string;
  idempotencyKey: string;
  operationKind: LinearAuthorityPublicationOperation["kind"];
  status: "started" | "applied" | "already_applied" | "failed";
  entityUuid: string;
  canonicalRelationKey: string | null;
  httpAttempts: number;
  occurredAt: string;
  previousRecordSha256: string | null;
}

export type RedactedJournalRecord = RedactedJournalRecordBody & { recordSha256: string };

const DIGEST = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const PLAN_KEY = /^[a-z][a-z0-9-]*:[A-Za-z0-9][A-Za-z0-9._-]*(?::[A-Za-z0-9][A-Za-z0-9._-]*)*$/;
const OPERATION_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const LINEAR_IDENTIFIER = /^[A-Z][A-Z0-9]{1,9}-[1-9]\d*$/;
const CANONICAL_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DEFAULT_LIMITS: LinearAuthorityPublisherLimits = {
  maxCaptureAgeMs: 15 * 60 * 1000,
  maxApplyDurationMs: 10 * 60 * 1000,
  maxOperations: 5_000,
  maxAttemptsPerRequest: 3,
  maxHttpAttempts: 1_000,
  maxRelationPages: 250,
  maxRelationRows: 50_000,
  relationPageSize: 250,
  entityReadBatchSize: 100,
  issueCreateBatchSize: 50,
  aliasedMutationBatchSize: 25,
  relationReadBatchSize: 100,
};
const MAX_ARTIFACT_BYTES = 256 * 1024 * 1024;
const MAX_FUTURE_SKEW_MS = 30_000;
const CANONICAL_REPOSITORY = "meetblakey/sourcera";
const CANONICAL_REF = "refs/heads/main";

const sha256 = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");

function fail(message: string): never {
  throw new Error(`Linear authority publisher: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("canonical payload contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

const sortedIds = (values: readonly string[]): string[] => [...values].map((value) => value.toLowerCase()).sort();

export function buildLinearAuthorityNativeSelectors(
  manifest: LinearAuthorityManifest & { schemaVersion: 2 },
  labelGroups: readonly LinearAuthorityLabelGroupSelectorContract[],
): LinearAuthorityNativeSelector[] {
  const catalog = manifest.nativeCatalog;
  const teams = new Map(catalog.teams.map((row) => [row.planKey, row]));
  const initiatives = new Map(catalog.initiatives.map((row) => [row.planKey, row]));
  const projects = new Map(catalog.projects.map((row) => [row.planKey, row]));
  const pipelines = new Map(catalog.releasePipelines.map((row) => [row.planKey, row]));
  const labelGroupsById = new Map<string, LinearAuthorityLabelGroupSelectorContract>();
  for (const group of labelGroups) {
    const id = group.id.toLowerCase();
    if (!isUuidV4(id) || labelGroupsById.has(id) || typeof group.name !== "string" || group.name.length === 0 ||
      group.parentId !== null || group.parentName !== null || group.teamId !== null || group.teamKey !== null ||
      typeof group.color !== "string" || group.color.length === 0 ||
      (group.description !== null && typeof group.description !== "string")) {
      fail("label group selector contract is invalid or duplicated");
    }
    labelGroupsById.set(id, { ...group, id });
  }
  const selectors: LinearAuthorityNativeSelector[] = [];
  const add = (
    kind: LinearAuthorityNativeSelectorKind,
    planKey: string,
    id: string,
    identity: { [key: string]: LinearAuthorityJson },
  ): void => {
    selectors.push({ kind, planKey, id: id.toLowerCase(), identity });
  };
  for (const row of catalog.teams) add("team", row.planKey, row.id, {
    key: row.key, name: row.name, archivedAt: null,
  });
  for (const row of catalog.users) add("user", row.planKey, row.id, {
    name: row.name, active: row.active, archivedAt: null,
  });
  for (const row of catalog.initiatives) add("initiative", row.planKey, row.id, {
    name: row.name,
    contentSha256: row.contentSha256,
    descriptionSha256: row.descriptionSha256,
    updatedAt: row.updatedAt,
    archivedAt: null,
    ownerId: row.ownerId,
    status: row.status,
    priority: row.priority,
    health: row.health,
    healthUpdatedAt: row.healthUpdatedAt,
    startedAt: row.startedAt,
    targetDate: row.targetDate,
    targetDateResolution: row.targetDateResolution,
    parentInitiativeId: row.parentInitiativeId,
  });
  for (const row of catalog.projects) add("project", row.planKey, row.id, {
    name: row.name,
    contentSha256: row.contentSha256,
    updatedAt: row.updatedAt,
    archivedAt: null,
    statusId: row.statusId,
    status: row.status,
    statusType: row.statusType,
    priority: row.priority,
    leadId: row.leadId,
    startDate: row.startDate,
    startDateResolution: row.startDateResolution,
    targetDate: row.targetDate,
    targetDateResolution: row.targetDateResolution,
    teamIds: sortedIds(row.teamPlanKeys.map((planKey) => teams.get(planKey)!.id)),
    initiativeIds: sortedIds(row.initiativePlanKeys.map((planKey) => initiatives.get(planKey)!.id)),
  });
  for (const row of catalog.releasePipelines) add("release_pipeline", row.planKey, row.id, {
    name: row.name,
    updatedAt: row.updatedAt,
    archivedAt: null,
    type: row.type,
    isProduction: row.isProduction,
    teamIds: sortedIds(row.teamPlanKeys.map((planKey) => teams.get(planKey)!.id)),
    stages: [...row.stages]
      .map((stage) => ({ ...stage, id: stage.id.toLowerCase(), archivedAt: null }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  });
  for (const row of catalog.cycles) {
    const team = teams.get(row.teamPlanKey)!;
    add("cycle", row.planKey, row.id, {
      number: row.number,
      name: row.name,
      descriptionSha256: row.descriptionSha256,
      updatedAt: row.updatedAt,
      archivedAt: null,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      completedAt: row.completedAt,
      teamId: team.id.toLowerCase(),
      teamKey: team.key,
      inheritedFromId: row.inheritedFromId,
    });
  }
  for (const row of catalog.milestones) add("milestone", row.planKey, row.id, {
    name: row.name,
    descriptionSha256: row.descriptionSha256,
    updatedAt: row.updatedAt,
    archivedAt: null,
    targetDate: row.targetDate,
    status: row.status,
    projectId: projects.get(row.projectPlanKey)!.id.toLowerCase(),
  });
  for (const row of catalog.releases) {
    const pipeline = pipelines.get(row.pipelinePlanKey)!;
    add("release", row.planKey, row.id, {
      name: row.name,
      descriptionSha256: row.descriptionSha256,
      version: row.version,
      commitSha: row.commitSha,
      startDate: row.startDate,
      startedAt: row.startedAt,
      targetDate: row.targetDate,
      completedAt: row.completedAt,
      updatedAt: row.updatedAt,
      archivedAt: null,
      pipelineId: pipeline.id.toLowerCase(),
      stageId: row.stageId.toLowerCase(),
      stageName: row.stageName,
      stageType: row.stageType,
    });
  }
  for (const row of catalog.states) {
    const team = teams.get(row.teamPlanKey)!;
    add("state", row.planKey, row.id, {
      name: row.name,
      type: row.type,
      archivedAt: null,
      teamId: team.id.toLowerCase(),
      teamKey: team.key,
    });
  }
  const parents = new Map<string, LinearAuthorityNativeSelector>();
  for (const row of catalog.labels) {
    const team = row.teamPlanKey === null ? null : teams.get(row.teamPlanKey)!;
    add("label", row.planKey, row.id, {
      name: row.name,
      color: row.color,
      description: row.description,
      archivedAt: null,
      inheritedFromId: null,
      isGroup: false,
      parentId: row.parentId,
      parentName: row.parentName,
      teamId: team?.id.toLowerCase() ?? null,
      teamKey: team?.key ?? null,
    });
    if (row.parentId !== null) {
      const group = labelGroupsById.get(row.parentId.toLowerCase());
      if (!group || group.name !== row.parentName) fail("label parent selector is absent from the committed group contract");
      const parent: LinearAuthorityNativeSelector = {
        kind: "label_parent",
        planKey: `label-parent:${row.parentId.toLowerCase()}`,
        id: row.parentId.toLowerCase(),
        identity: {
          name: group.name,
          color: group.color,
          description: group.description,
          archivedAt: null,
          inheritedFromId: null,
          isGroup: true,
          parentId: group.parentId,
          parentName: group.parentName,
          teamId: group.teamId,
          teamKey: group.teamKey,
        },
      };
      const prior = parents.get(parent.id);
      if (prior && canonicalJson(prior) !== canonicalJson(parent)) fail("label parent selector has competing pinned identities");
      parents.set(parent.id, parent);
    }
  }
  selectors.push(...parents.values());
  return selectors.sort((left, right) => `${left.kind}:${left.planKey}`.localeCompare(`${right.kind}:${right.planKey}`));
}

function committedLabelGroupSelectors(raw: Buffer | undefined): LinearAuthorityLabelGroupSelectorContract[] {
  if (!raw) fail("program scope compiler input is missing");
  const scope = record(parseJson(raw.toString("utf8"), "program scope compiler input"), "program scope compiler input");
  const contract = exactRecord(scope.authorityIssueLabelContract, [
    "schemaVersion", "initialized", "labels", "groups", "root",
  ], "authority issue label contract");
  if (contract.schemaVersion !== 1 || contract.initialized !== true || !Array.isArray(contract.groups) ||
    contract.groups.length !== 4) {
    fail("authority issue label contract is not initialized");
  }
  const groups = contract.groups.map((value, index): LinearAuthorityLabelGroupSelectorContract => {
    const group = exactRecord(value, [
      "id", "name", "parentId", "parentName", "teamId", "teamKey", "color", "description",
    ], `authority label group ${index}`);
    return {
      id: uuid(group.id, `authority label group ${index} UUID`),
      name: string(group.name, `authority label group ${index} name`),
      parentId: group.parentId === null ? null : fail(`authority label group ${index} parent must be null`),
      parentName: group.parentName === null ? null : fail(`authority label group ${index} parent name must be null`),
      teamId: group.teamId === null ? null : fail(`authority label group ${index} team must be null`),
      teamKey: group.teamKey === null ? null : fail(`authority label group ${index} team key must be null`),
      color: string(group.color, `authority label group ${index} color`),
      description: group.description === null ? null : string(group.description, `authority label group ${index} description`),
    };
  });
  if (new Set(groups.map((group) => group.id)).size !== groups.length ||
    new Set(groups.map((group) => group.name)).size !== groups.length) {
    fail("authority label group contract is duplicated");
  }
  return groups;
}

export function linearAuthorityNativeSelectorRoot(selectors: readonly LinearAuthorityNativeSelector[]): string {
  if (selectors.length < 1 || selectors.length > 250) fail("native selector proof exceeds its safe bound");
  const identities = new Set<string>();
  const planKeys = new Set<string>();
  for (const row of selectors) {
    if (!isUuidV4(row.id) || !PLAN_KEY.test(row.planKey) || planKeys.has(row.planKey)) fail("native selector proof contains an invalid or duplicate identity");
    planKeys.add(row.planKey);
    const identityKey = `${row.kind}:${row.id.toLowerCase()}`;
    if (identities.has(identityKey)) fail("native selector proof duplicates a native UUID");
    identities.add(identityKey);
    canonicalJson(row.identity);
  }
  return sha256(canonicalJson([...selectors]
    .map((row) => ({ ...row, id: row.id.toLowerCase() }))
    .sort((left, right) => `${left.kind}:${left.planKey}`.localeCompare(`${right.kind}:${right.planKey}`))));
}

export function assertLinearAuthorityNativeSelectors(
  expected: readonly LinearAuthorityNativeSelector[],
  actual: readonly LinearAuthorityNativeSelector[],
): void {
  if (actual.length !== expected.length || linearAuthorityNativeSelectorRoot(actual) !== linearAuthorityNativeSelectorRoot(expected)) {
    fail("live native selector identity drifted after capture");
  }
}

export function assertLinearAuthorityApplyWindow(input: {
  capturedAtMs: number;
  applyStartedAtMs: number;
  nowMs: number;
  maxCaptureAgeMs: number;
  maxApplyDurationMs: number;
}): void {
  const values = [input.capturedAtMs, input.applyStartedAtMs, input.nowMs, input.maxCaptureAgeMs, input.maxApplyDurationMs];
  if (values.some((value) => !Number.isFinite(value)) || input.maxCaptureAgeMs < 1 || input.maxApplyDurationMs < 1) {
    fail("live apply clock is invalid");
  }
  const captureAge = input.nowMs - input.capturedAtMs;
  const applyAge = input.nowMs - input.applyStartedAtMs;
  if (captureAge < -MAX_FUTURE_SKEW_MS || captureAge >= input.maxCaptureAgeMs) fail("live capture expired during apply");
  if (applyAge < -MAX_FUTURE_SKEW_MS || applyAge >= input.maxApplyDurationMs) fail("apply exceeded its live duration bound");
}

function parseJson(raw: string, label: string): unknown {
  if (Buffer.byteLength(raw, "utf8") > MAX_ARTIFACT_BYTES) fail(`${label} exceeds the byte limit`);
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function record(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  return value as JsonRecord;
}

function exactRecord(value: unknown, keys: readonly string[], label: string): JsonRecord {
  const row = record(value, label);
  const actual = Object.keys(row).sort().join("\0");
  if (actual !== [...keys].sort().join("\0")) fail(`${label} contract is invalid`);
  return row;
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be a non-empty string`);
  return value;
}

function digest(value: unknown, label: string): string {
  if (typeof value !== "string" || !DIGEST.test(value)) fail(`${label} must be a SHA-256 digest`);
  return value;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== "string" || !isUuidV4(value)) fail(`${label} must be a UUIDv4`);
  return value.toLowerCase();
}

function planKey(value: unknown, label: string): string {
  if (typeof value !== "string" || !PLAN_KEY.test(value)) fail(`${label} must be a stable plan key`);
  return value;
}

function timestamp(value: unknown, label: string): string {
  if (typeof value !== "string" || !CANONICAL_UTC.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    fail(`${label} must be a canonical UTC timestamp`);
  }
  return value;
}

function jsonPayload(value: unknown, label: string): { [key: string]: LinearAuthorityJson } {
  const row = record(value, label);
  try {
    const encoded = canonicalJson(row);
    return JSON.parse(encoded) as { [key: string]: LinearAuthorityJson };
  } catch {
    fail(`${label} is not a JSON payload`);
  }
}

function normalizedLimits(overrides: Partial<LinearAuthorityPublisherLimits> | undefined): LinearAuthorityPublisherLimits {
  const limits = { ...DEFAULT_LIMITS, ...overrides };
  const bounds: Array<[keyof LinearAuthorityPublisherLimits, number, number]> = [
    ["maxCaptureAgeMs", 1, 30 * 60 * 1000],
    ["maxApplyDurationMs", 1, 15 * 60 * 1000],
    ["maxOperations", 1, 10_000],
    ["maxAttemptsPerRequest", 1, 5],
    ["maxHttpAttempts", 1, 1_000],
    ["maxRelationPages", 1, 1_000],
    ["maxRelationRows", 1, 250_000],
    ["relationPageSize", 1, 250],
    ["entityReadBatchSize", 1, 100],
    ["issueCreateBatchSize", 1, 50],
    ["aliasedMutationBatchSize", 1, 25],
    ["relationReadBatchSize", 1, 100],
  ];
  for (const [key, minimum, maximum] of bounds) {
    const value = limits[key];
    if (!Number.isInteger(value) || value < minimum || value > maximum) fail(`${key} is outside its safe bound`);
  }
  return limits;
}

export function computeLinearAuthorityOperationIdempotencyKey(
  planRootValue: string,
  operation: LinearAuthorityPublicationOperationBody,
): string {
  digest(planRootValue, "operation plan root");
  return sha256(canonicalJson({ planRoot: planRootValue, operation }));
}

export function sealLinearAuthorityOperation(
  planRootValue: string,
  operation: LinearAuthorityPublicationOperationBody,
): LinearAuthorityPublicationOperation {
  return { ...operation, idempotencyKey: computeLinearAuthorityOperationIdempotencyKey(planRootValue, operation) };
}

export function computeLinearAuthorityOperationsRoot(operations: readonly LinearAuthorityPublicationOperation[]): string {
  return sha256(canonicalJson(operations));
}

export interface LinearAuthorityPublicationOperationPlan {
  schemaVersion: 1;
  planRoot: string;
  semanticRoot: string;
  liveCaptureRoot: string;
  operationsRoot: string;
  operations: LinearAuthorityPublicationOperation[];
}

function managedTargetPayload(target: AuthorityManagedTarget): { [key: string]: LinearAuthorityJson } {
  return {
    title: target.title,
    description: target.description,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey,
    priority: target.priority,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: target.releasePlanKeys,
    labelPlanKeys: target.labelPlanKeys,
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  };
}

function documentTargetPayload(target: AuthorityDocumentTarget): { [key: string]: LinearAuthorityJson } {
  return {
    title: target.title,
    content: target.content,
    attachmentKind: target.attachmentKind,
    attachmentPlanKey: target.attachmentPlanKey,
  };
}

function repairTargetPayload(target: AuthorityIssueDescriptionRepair): { [key: string]: LinearAuthorityJson } {
  return { description: target.desiredDescription };
}

const operationPayloadSha = (payload: { [key: string]: LinearAuthorityJson }): string => sha256(canonicalJson(payload));

function currentManagedTargetState(target: AuthorityManagedTarget): LinearAuthorityEntityPrecondition {
  if (target.expectedCurrentDescriptionSha256 === null || target.expectedCurrentNativeSha256 === null) fail(`adopted target ${target.planKey} lacks current-state pins`);
  return {
    projection: "managed_issue",
    titleSha256: sha256(target.title),
    bodySha256: target.expectedCurrentDescriptionSha256,
    nativeSha256: target.expectedCurrentNativeSha256,
  };
}

function currentDocumentTargetState(target: AuthorityDocumentTarget): LinearAuthorityEntityPrecondition {
  if (target.expectedCurrentContentSha256 === null || target.expectedCurrentTopologySha256 === null) fail(`adopted document ${target.planKey} lacks current-state pins`);
  return {
    projection: "document",
    titleSha256: sha256(target.title),
    bodySha256: target.expectedCurrentContentSha256,
    nativeSha256: target.expectedCurrentTopologySha256,
  };
}

function currentRepairTargetState(target: AuthorityIssueDescriptionRepair): LinearAuthorityEntityPrecondition {
  return { projection: "description_only", bodySha256: target.expectedCurrentDescriptionSha256 };
}

function allocationMap(rows: readonly LinearTargetAllocation[]): Map<string, LinearTargetAllocation> {
  return new Map(rows.map((row) => [row.planKey, row]));
}

function createEntityBody(
  target: AuthorityManagedTarget | AuthorityDocumentTarget,
  allocation: LinearTargetAllocation,
): LinearAuthorityCreateEntityOperationBody {
  const entityKind = "kind" in target ? "issue" as const : "document" as const;
  const payload = "kind" in target ? managedTargetPayload(target) : documentTargetPayload(target);
  return {
    operationKey: `create:${target.planKey}`,
    planKey: target.planKey,
    kind: "create_entity",
    entityKind,
    allocationUuid: allocation.uuid,
    desiredPayloadSha256: operationPayloadSha(payload),
    payload,
  };
}

function updateEntityBody(
  target: AuthorityManagedTarget | AuthorityDocumentTarget,
  allocation: LinearTargetAllocation,
): LinearAuthorityUpdateEntityOperationBody {
  const managed = "kind" in target;
  const payload = managed ? managedTargetPayload(target) : documentTargetPayload(target);
  return {
    operationKey: `update:${target.planKey}`,
    planKey: target.planKey,
    kind: "update_entity",
    entityKind: managed ? "issue" : "document",
    targetUuid: allocation.uuid,
    expectedCurrentState: managed ? currentManagedTargetState(target) : currentDocumentTargetState(target),
    desiredPayloadSha256: operationPayloadSha(payload),
    payload,
  };
}

export function buildLinearAuthorityPublicationOperationPlan(input: {
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  allocation: LinearAuthorityAllocation;
  semantic: ValidatedLinearAuthoritySemanticPlanV4;
}): LinearAuthorityPublicationOperationPlan {
  if (input.manifest.schemaVersion !== 2 || input.semantic.plan.schemaVersion !== 4 || input.semantic.semanticPlanInternalsValidated !== true || input.semantic.captureEvidenceValidated !== true) {
    fail("operation projection requires validated manifest v2 and semantic plan v4");
  }
  const allocations = allocationMap(input.allocation.allocations);
  const bodies: LinearAuthorityPublicationOperationBody[] = [];
  const consumedAllocated = new Set<string>();
  const requirements = new Map(input.manifest.requirements.map((row) => [row.planKey, row]));
  const reconciliation = new Map(input.semantic.plan.adoptedRequirementReconciliation.map((row) => [row.canonicalLegacyId, row]));

  const addManaged = (target: AuthorityManagedTarget, forceAdoptedUpdate: boolean): void => {
    const allocation = allocations.get(target.planKey);
    if (!allocation) fail(`target ${target.planKey} lacks an allocation`);
    if (allocation.source === "allocated") {
      bodies.push(createEntityBody(target, allocation));
      consumedAllocated.add(target.planKey);
    } else if (forceAdoptedUpdate) {
      bodies.push(updateEntityBody(target, allocation));
    }
  };

  for (const legacyId of input.semantic.plan.publicationSequence) {
    const planKeyValue = `issue:${legacyId}`;
    const target = requirements.get(planKeyValue);
    if (!target) fail(`semantic publication sequence names unknown target ${planKeyValue}`);
    const allocation = allocations.get(planKeyValue);
    if (!allocation) fail(`target ${planKeyValue} lacks an allocation`);
    const adopted = reconciliation.get(legacyId);
    if (allocation.source === "adopted" && !adopted) fail(`adopted Requirement ${planKeyValue} lacks v4 reconciliation`);
    if (allocation.source === "allocated" && adopted) fail(`allocated Requirement ${planKeyValue} is marked adopted by v4 reconciliation`);
    addManaged(target, adopted?.descriptionUpdateRequired === true || adopted?.priorityUpdateRequired === true);
    requirements.delete(planKeyValue);
  }
  if (requirements.size !== 0) fail("semantic publication sequence does not exactly cover manifest Requirements");
  for (const target of [...input.manifest.decisions].sort((a, b) => a.planKey.localeCompare(b.planKey))) addManaged(target, false);
  for (const target of [...input.manifest.risks].sort((a, b) => a.planKey.localeCompare(b.planKey))) addManaged(target, false);

  for (const target of [...input.manifest.documents].sort((a, b) => a.planKey.localeCompare(b.planKey))) {
    const allocation = allocations.get(target.planKey);
    if (!allocation) fail(`document ${target.planKey} lacks an allocation`);
    if (allocation.source === "allocated") {
      bodies.push(createEntityBody(target, allocation));
      consumedAllocated.add(target.planKey);
    } else if (target.expectedCurrentContentSha256 !== target.contentSha256) {
      bodies.push(updateEntityBody(target, allocation));
    }
  }

  for (const target of [...input.manifest.issueDescriptionRepairs].sort((a, b) => a.identifier.localeCompare(b.identifier))) {
    if (target.expectedCurrentDescriptionSha256 === target.desiredDescriptionSha256) continue;
    const planKeyValue = `repair:${target.identifier}`;
    const payload = repairTargetPayload(target);
    bodies.push({
      operationKey: `update:${planKeyValue}`,
      planKey: planKeyValue,
      kind: "update_entity",
      entityKind: "issue",
      targetUuid: target.issueUuid,
      expectedCurrentState: currentRepairTargetState(target),
      desiredPayloadSha256: operationPayloadSha(payload),
      payload,
    });
  }

  for (const target of [...input.manifest.nativeRelations].sort((a, b) => a.planKey.localeCompare(b.planKey))) {
    const allocation = allocations.get(target.planKey);
    if (!allocation) fail(`relation ${target.planKey} lacks an allocation`);
    if (allocation.source === "adopted") continue;
    const source = allocations.get(target.sourcePlanKey);
    const related = allocations.get(target.targetPlanKey);
    if (!source || !related) fail(`relation ${target.planKey} has an unallocated endpoint`);
    const expectedCanonicalKey = source.identifier !== null && related.identifier !== null
      ? canonicalLinearRelationKey(target.type, source.identifier, related.identifier)
      : null;
    bodies.push({
      operationKey: `create:${target.planKey}`,
      planKey: target.planKey,
      kind: "create_relation",
      allocationUuid: allocation.uuid,
      relationType: target.type,
      sourcePlanKey: target.sourcePlanKey,
      targetPlanKey: target.targetPlanKey,
      expectedCanonicalKey,
    });
    consumedAllocated.add(target.planKey);
  }

  const manifestPlanKeys = new Set([
    ...input.manifest.requirements,
    ...input.manifest.decisions,
    ...input.manifest.risks,
    ...input.manifest.documents,
    ...input.manifest.references,
    ...input.manifest.nativeRelations,
  ].map((row) => row.planKey));
  for (const allocation of input.allocation.allocations) {
    if (!manifestPlanKeys.has(allocation.planKey)) fail(`allocation ${allocation.planKey} is not a manifest target`);
    if (allocation.source === "allocated" && !consumedAllocated.has(allocation.planKey)) fail(`allocated target ${allocation.planKey} has no exact create projection`);
  }

  const operations = bodies.map((body) => sealLinearAuthorityOperation(input.manifest.planRoot, body));
  return {
    schemaVersion: 1,
    planRoot: input.manifest.planRoot,
    semanticRoot: input.semantic.semanticRoot,
    liveCaptureRoot: input.manifest.liveCaptureRoot,
    operationsRoot: computeLinearAuthorityOperationsRoot(operations),
    operations,
  };
}

export function validateLinearAuthorityPublicationOperationProjection(input: {
  operationsRaw: string;
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  allocation: LinearAuthorityAllocation;
  semantic: ValidatedLinearAuthoritySemanticPlanV4;
}): LinearAuthorityPublicationOperationPlan {
  const value = exactRecord(parseJson(input.operationsRaw, "operations plan"), [
    "schemaVersion", "planRoot", "semanticRoot", "liveCaptureRoot", "operationsRoot", "operations",
  ], "operations plan");
  if (value.schemaVersion !== 1 || value.planRoot !== input.manifest.planRoot || value.semanticRoot !== input.semantic.semanticRoot ||
    value.liveCaptureRoot !== input.manifest.liveCaptureRoot || !Array.isArray(value.operations)) {
    fail("operations plan is detached from validated authority roots");
  }
  const operations = value.operations.map((row, index) => validateOperation(row, index, input.manifest.planRoot));
  const operationsRoot = digest(value.operationsRoot, "operations root");
  if (computeLinearAuthorityOperationsRoot(operations) !== operationsRoot) fail("operations root mismatch");
  const parsed: LinearAuthorityPublicationOperationPlan = {
    schemaVersion: 1,
    planRoot: input.manifest.planRoot,
    semanticRoot: input.semantic.semanticRoot,
    liveCaptureRoot: input.manifest.liveCaptureRoot,
    operationsRoot,
    operations,
  };
  const expected = buildLinearAuthorityPublicationOperationPlan(input);
  if (canonicalJson(parsed) !== canonicalJson(expected)) fail("operations plan is not the exact projection of validated manifest targets and native relations");
  return parsed;
}

function validatePins(artifacts: LinearAuthorityPublicationArtifacts, pins: LinearAuthorityPublicationPins): void {
  const rows: Array<[string, string, string]> = [
    [artifacts.manifestRaw, pins.manifestSha256, "manifest"],
    [artifacts.semanticPlanRaw, pins.semanticPlanSha256, "semantic plan"],
    [artifacts.liveCaptureRaw, pins.liveCaptureSha256, "live capture"],
    [artifacts.captureReceiptRaw, pins.captureReceiptSha256, "capture receipt"],
    [artifacts.allocationRaw, pins.allocationSha256, "allocation"],
    [artifacts.operationsRaw, pins.operationsSha256, "operations"],
  ];
  for (const [raw, expected, label] of rows) {
    digest(expected, `${label} pin`);
    if (sha256(raw) !== expected) fail(`${label} digest mismatch`);
  }
}

function validateEntityPrecondition(value: unknown, label: string): LinearAuthorityEntityPrecondition {
  const loose = record(value, label);
  if (loose.projection === "description_only") {
    const row = exactRecord(value, ["projection", "bodySha256"], label);
    digest(row.bodySha256, `${label} body digest`);
    return row as unknown as LinearAuthorityEntityPrecondition;
  }
  if (loose.projection === "managed_issue" || loose.projection === "document") {
    const row = exactRecord(value, ["projection", "titleSha256", "bodySha256", "nativeSha256"], label);
    digest(row.titleSha256, `${label} title digest`);
    digest(row.bodySha256, `${label} body digest`);
    digest(row.nativeSha256, `${label} native digest`);
    return row as unknown as LinearAuthorityEntityPrecondition;
  }
  fail(`${label} projection is invalid`);
}

function validateOperation(
  value: unknown,
  index: number,
  root: string,
): LinearAuthorityPublicationOperation {
  const loose = record(value, `operation ${index}`);
  const kind = loose.kind;
  const baseKeys = ["operationKey", "planKey", "kind", "idempotencyKey"];
  let row: JsonRecord;
  if (kind === "create_entity") {
    row = exactRecord(value, [...baseKeys, "entityKind", "allocationUuid", "desiredPayloadSha256", "payload"], `operation ${index}`);
  } else if (kind === "update_entity") {
    row = exactRecord(value, [...baseKeys, "entityKind", "targetUuid", "expectedCurrentState", "desiredPayloadSha256", "payload"], `operation ${index}`);
  } else if (kind === "create_relation") {
    row = exactRecord(value, [...baseKeys, "allocationUuid", "relationType", "sourcePlanKey", "targetPlanKey", "expectedCanonicalKey"], `operation ${index}`);
  } else {
    fail(`operation ${index} has a prohibited or unsupported kind`);
  }
  if (typeof row.operationKey !== "string" || !OPERATION_KEY.test(row.operationKey)) fail(`operation ${index} key is invalid`);
  planKey(row.planKey, `operation ${index} plan key`);
  digest(row.idempotencyKey, `operation ${index} idempotency key`);
  if (kind === "create_entity" || kind === "update_entity") {
    if (row.entityKind !== "issue" && row.entityKind !== "document") fail(`operation ${index} entity kind is invalid`);
    const payload = jsonPayload(row.payload, `operation ${index} payload`);
    const desired = digest(row.desiredPayloadSha256, `operation ${index} desired payload digest`);
    if (sha256(canonicalJson(payload)) !== desired) fail(`operation ${index} desired payload digest differs`);
    if (kind === "create_entity") uuid(row.allocationUuid, `operation ${index} allocation UUID`);
    else {
      uuid(row.targetUuid, `operation ${index} target UUID`);
      const precondition = validateEntityPrecondition(row.expectedCurrentState, `operation ${index} current-state precondition`);
      if (row.entityKind === "document" && precondition.projection !== "document") fail(`operation ${index} document precondition is invalid`);
      if (row.entityKind === "issue" && precondition.projection === "document") fail(`operation ${index} issue precondition is invalid`);
    }
  } else {
    uuid(row.allocationUuid, `operation ${index} relation allocation UUID`);
    if (row.relationType !== "blocks" && row.relationType !== "related" && row.relationType !== "duplicate") fail(`operation ${index} relation type is invalid`);
    planKey(row.sourcePlanKey, `operation ${index} source plan key`);
    planKey(row.targetPlanKey, `operation ${index} target plan key`);
    if (row.sourcePlanKey === row.targetPlanKey) fail(`operation ${index} relation is self-referential`);
    if (row.expectedCanonicalKey !== null && (typeof row.expectedCanonicalKey !== "string" || row.expectedCanonicalKey.length === 0)) {
      fail(`operation ${index} expected canonical key is invalid`);
    }
  }
  const operation = row as unknown as LinearAuthorityPublicationOperation;
  const { idempotencyKey, ...body } = operation;
  if (computeLinearAuthorityOperationIdempotencyKey(root, body) !== idempotencyKey) fail(`operation ${index} idempotency key differs`);
  return operation;
}

function captureUuids(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (isUuidV4(value)) found.add(value.toLowerCase());
    return found;
  }
  if (Array.isArray(value)) {
    for (const row of value) captureUuids(row, found);
    return found;
  }
  if (value && typeof value === "object") for (const row of Object.values(value as JsonRecord)) captureUuids(row, found);
  return found;
}

function operationEntityUuid(operation: LinearAuthorityPublicationOperation): string {
  return (operation.kind === "update_entity" ? operation.targetUuid : operation.allocationUuid).toLowerCase();
}

function validateJournal(
  raw: string | undefined,
  expectedSha: string | undefined,
  planRootValue: string,
  operationsSha: string,
  operations: ReadonlyMap<string, LinearAuthorityPublicationOperation>,
): RedactedJournalRecord[] {
  if (raw === undefined) {
    if (expectedSha !== undefined) fail("resume journal digest was supplied without journal bytes");
    return [];
  }
  if (expectedSha === undefined) fail("resume journal bytes require an exact digest pin");
  digest(expectedSha, "resume journal pin");
  if (sha256(raw) !== expectedSha) fail("resume journal digest mismatch");
  const lines = raw.length === 0 ? [] : raw.split("\n").filter((line) => line.length > 0);
  const records: RedactedJournalRecord[] = [];
  let previous: string | null = null;
  for (const [index, line] of lines.entries()) {
    const row = exactRecord(parseJson(line, `resume journal line ${index + 1}`), [
      "schemaVersion", "sequence", "runId", "planRoot", "operationsSha256", "operationKey", "idempotencyKey",
      "operationKind", "status", "entityUuid", "canonicalRelationKey", "httpAttempts", "occurredAt",
      "previousRecordSha256", "recordSha256",
    ], `resume journal line ${index + 1}`);
    if (row.schemaVersion !== 1 || row.sequence !== index + 1 || row.planRoot !== planRootValue || row.operationsSha256 !== operationsSha) {
      fail(`resume journal line ${index + 1} is bound to another run package`);
    }
    if (typeof row.runId !== "string" || !OPERATION_KEY.test(row.runId)) fail(`resume journal line ${index + 1} run ID is invalid`);
    const operation = typeof row.operationKey === "string" ? operations.get(row.operationKey) : undefined;
    if (!operation || row.idempotencyKey !== operation.idempotencyKey || row.operationKind !== operation.kind) {
      fail(`resume journal line ${index + 1} names an unknown operation`);
    }
    if (!(["started", "applied", "already_applied", "failed"] as const).includes(row.status as never)) fail(`resume journal line ${index + 1} status is invalid`);
    const entityUuid = uuid(row.entityUuid, `resume journal line ${index + 1} entity UUID`);
    if (entityUuid !== operationEntityUuid(operation)) fail(`resume journal line ${index + 1} entity UUID differs from its exact operation`);
    if (operation.kind === "create_relation") {
      if (typeof row.canonicalRelationKey !== "string" || row.canonicalRelationKey.length === 0) fail(`resume journal line ${index + 1} relation key is invalid`);
    } else if (row.canonicalRelationKey !== null) fail(`resume journal line ${index + 1} attaches a relation key to an entity operation`);
    if (!Number.isInteger(row.httpAttempts) || (row.httpAttempts as number) < 0) fail(`resume journal line ${index + 1} HTTP count is invalid`);
    timestamp(row.occurredAt, `resume journal line ${index + 1} timestamp`);
    if (row.previousRecordSha256 !== previous) fail(`resume journal line ${index + 1} hash chain is broken`);
    digest(row.recordSha256, `resume journal line ${index + 1} record digest`);
    const { recordSha256, ...body } = row;
    if (sha256(canonicalJson(body)) !== recordSha256) fail(`resume journal line ${index + 1} record digest differs`);
    previous = recordSha256 as string;
    records.push(row as unknown as RedactedJournalRecord);
  }
  return records;
}

export function preflightLinearAuthorityPublication(
  input: Pick<LinearAuthorityPublicationInput, "artifacts" | "pins" | "authorityValidationInput" | "now" | "limits" | "resumeJournalRaw" | "expectedResumeJournalSha256">,
): PreparedLinearAuthorityPublication {
  validatePins(input.artifacts, input.pins);
  const limits = normalizedLimits(input.limits);
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) fail("current time is invalid");

  const validationInput = input.authorityValidationInput;
  if (validationInput.manifestRaw !== input.artifacts.manifestRaw || validationInput.liveCaptureRaw !== input.artifacts.liveCaptureRaw ||
    validationInput.allocationRaw !== input.artifacts.allocationRaw || validationInput.expectedManifestSha256 !== input.pins.manifestSha256 ||
    validationInput.expectedLiveCaptureSha256 !== input.pins.liveCaptureSha256 || validationInput.expectedAllocationSha256 !== input.pins.allocationSha256 ||
    validationInput.compilerInputs.get("semantic-plan")?.toString("utf8") !== input.artifacts.semanticPlanRaw ||
    validationInput.compilerInputs.get("capture-receipt")?.toString("utf8") !== input.artifacts.captureReceiptRaw) {
    fail("same-process authority validation input is detached from publication artifacts");
  }
  let structuralValidation: ReturnType<typeof validateLinearAuthorityStructure>;
  let semanticValidation: ValidatedLinearAuthoritySemanticPlanV4;
  try {
    structuralValidation = validateLinearAuthorityStructure(validationInput);
    semanticValidation = parseLinearAuthoritySemanticPlanV4(input.artifacts.semanticPlanRaw);
  } catch {
    fail("same-process manifest v2 or semantic plan v4 validation failed");
  }
  if (structuralValidation.structuralIntegrityValidated !== true || structuralValidation.semanticPlanInternalsValidated !== true ||
    structuralValidation.sourcePartitionValidated !== true || structuralValidation.sourceExtractionCoverageValidated !== true ||
    semanticValidation.semanticPlanInternalsValidated !== true || semanticValidation.captureEvidenceValidated !== true) {
    fail("same-process authority validators did not prove complete v2/v4 coverage");
  }

  const manifest = record(parseJson(input.artifacts.manifestRaw, "manifest"), "manifest") as unknown as LinearAuthorityManifest & { schemaVersion: 2 };
  if (manifest.schemaVersion !== 2) fail("manifest schema must be v2");
  const sourceCommit = string(manifest.sourceCommit, "manifest source commit");
  if (!COMMIT.test(sourceCommit)) fail("manifest source commit is invalid");
  const root = digest(manifest.planRoot, "manifest plan root");
  const sourceSetRoot = digest(manifest.sourceSetRoot, "manifest source set root");
  const liveCaptureRoot = digest(manifest.liveCaptureRoot, "manifest live capture root");

  const semantic = semanticValidation.plan;
  const evidence = record(semantic.captureEvidence, "semantic plan capture evidence");
  if (evidence.mode !== "capture" || evidence.captureEvidenceValidated !== true) fail("semantic plan lacks validated live capture evidence");
  const semanticRoot = semanticValidation.semanticRoot;

  const capture = record(parseJson(input.artifacts.liveCaptureRaw, "live capture"), "live capture");
  if (capture.schemaVersion !== 1 || !Array.isArray(capture.issues) || !Array.isArray(capture.documents) || !Array.isArray(capture.relations)) {
    fail("live capture contract is invalid");
  }
  const liveUuids = captureUuids(capture);
  const issueIdentifiers = new Map<string, string>();
  for (const [index, value] of capture.issues.entries()) {
    const row = record(value, `captured issue ${index}`);
    const issueUuid = uuid(row.issueUuid, `captured issue ${index} UUID`);
    const identifier = string(row.identifier, `captured issue ${index} identifier`);
    if (!LINEAR_IDENTIFIER.test(identifier) || issueIdentifiers.has(issueUuid)) fail(`captured issue ${index} identity is invalid or duplicated`);
    issueIdentifiers.set(issueUuid, identifier);
  }
  const capturedDocuments = new Set<string>();
  for (const [index, value] of capture.documents.entries()) {
    const row = record(value, `captured document ${index}`);
    const id = uuid(row.id, `captured document ${index} UUID`);
    if (capturedDocuments.has(id)) fail(`captured document ${index} UUID is duplicated`);
    capturedDocuments.add(id);
  }
  const capturedRelations = new Map<string, LinearAuthorityRemoteRelation>();
  const capturedRelationUuids = new Set<string>();
  for (const [index, value] of capture.relations.entries()) {
    const row = record(value, `captured relation ${index}`);
    const id = uuid(row.relationId, `captured relation ${index} UUID`);
    const key = string(row.canonicalKey, `captured relation ${index} canonical key`);
    if (capturedRelationUuids.has(id) || capturedRelations.has(key)) fail(`captured relation ${index} identity or canonical key is duplicated`);
    capturedRelationUuids.add(id);
    capturedRelations.set(key, { uuid: id, canonicalKey: key, archivedAt: row.archivedAt === null ? null : string(row.archivedAt, `captured relation ${index} archivedAt`) });
  }

  const receipt = exactRecord(parseJson(input.artifacts.captureReceiptRaw, "capture receipt"), [
    "schemaVersion", "captureMode", "capturedAt", "fingerprintSha256", "acceptedFingerprintSha256", "artifactSha256s", "source",
  ], "capture receipt");
  if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live") fail("capture receipt must be a live v2 receipt");
  const capturedAt = timestamp(receipt.capturedAt, "capture receipt capturedAt");
  const captureAge = now.getTime() - Date.parse(capturedAt);
  if (captureAge < -MAX_FUTURE_SKEW_MS || captureAge > limits.maxCaptureAgeMs) fail("live capture is not fresh enough to apply");
  const artifactHashes = exactRecord(receipt.artifactSha256s, ["fingerprint", "nativeIdentity", "documents", "issueDescriptions"], "capture receipt artifact digests");
  for (const [key, value] of Object.entries(artifactHashes)) digest(value, `capture receipt ${key} digest`);
  if (artifactHashes.nativeIdentity !== input.pins.liveCaptureSha256 || receipt.fingerprintSha256 !== artifactHashes.fingerprint || receipt.acceptedFingerprintSha256 !== artifactHashes.fingerprint) {
    fail("capture receipt is detached from the supplied live capture");
  }
  const receiptSource = exactRecord(receipt.source, ["repository", "commit", "ref", "runId", "runAttempt"], "capture receipt source");
  if (receiptSource.repository !== CANONICAL_REPOSITORY || receiptSource.commit !== sourceCommit || receiptSource.ref !== CANONICAL_REF ||
    typeof receiptSource.runId !== "string" || !/^[1-9]\d*$/.test(receiptSource.runId) ||
    typeof receiptSource.runAttempt !== "string" || !/^[1-9]\d*$/.test(receiptSource.runAttempt)) {
    fail("capture receipt source is not canonical main");
  }

  const allocation = exactRecord(parseJson(input.artifacts.allocationRaw, "allocation"), ["schemaVersion", "planRoot", "sourceSetRoot", "liveCaptureRoot", "allocations"], "allocation");
  if (allocation.schemaVersion !== 1 || allocation.planRoot !== root || allocation.sourceSetRoot !== sourceSetRoot || allocation.liveCaptureRoot !== liveCaptureRoot || !Array.isArray(allocation.allocations)) {
    fail("allocation is detached from the manifest");
  }
  const allocations = new Map<string, ValidatedAllocation>();
  const allocationUuids = new Set<string>();
  const allowedKinds = new Set<LinearAuthorityAllocationKind>(["issue", "decision", "risk", "document", "relation_target", "relation"]);
  for (const [index, value] of allocation.allocations.entries()) {
    const row = exactRecord(value, ["planKey", "kind", "title", "identifier", "uuid", "source"], `allocation ${index}`);
    const key = planKey(row.planKey, `allocation ${index} plan key`);
    if (!allowedKinds.has(row.kind as LinearAuthorityAllocationKind)) fail(`allocation ${index} kind is invalid`);
    if (row.title !== null && typeof row.title !== "string") fail(`allocation ${index} title is invalid`);
    if (row.identifier !== null && (typeof row.identifier !== "string" || !LINEAR_IDENTIFIER.test(row.identifier))) fail(`allocation ${index} identifier is invalid`);
    const id = uuid(row.uuid, `allocation ${index} UUID`);
    if (row.source !== "adopted" && row.source !== "allocated") fail(`allocation ${index} source is invalid`);
    if (allocations.has(key) || allocationUuids.has(id)) fail(`allocation ${index} duplicates a plan key or UUID`);
    if (row.source === "allocated" && (liveUuids.has(id) || row.identifier !== null)) fail(`allocated UUID ${id} collides with live state or fabricates an identifier`);
    if (row.source === "adopted" && !liveUuids.has(id)) fail(`adopted UUID ${id} is absent from live capture`);
    const issueLike = row.kind === "issue" || row.kind === "decision" || row.kind === "risk" || row.kind === "relation_target";
    if (row.source === "adopted" && issueLike && (issueIdentifiers.get(id) ?? null) !== row.identifier) fail(`adopted issue allocation ${key} differs from live identity`);
    if (row.source === "adopted" && row.kind === "document" && (!capturedDocuments.has(id) || row.identifier !== null)) fail(`adopted document allocation ${key} differs from live identity`);
    if (row.source === "adopted" && row.kind === "relation" && (!capturedRelationUuids.has(id) || row.identifier !== null)) fail(`adopted relation allocation ${key} differs from live identity`);
    const validated = { planKey: key, kind: row.kind, title: row.title, identifier: row.identifier, uuid: id, source: row.source } as ValidatedAllocation;
    allocations.set(key, validated);
    allocationUuids.add(id);
  }
  for (const repair of manifest.issueDescriptionRepairs) {
    const repairPlanKey = `repair:${repair.identifier}`;
    if (allocations.has(repairPlanKey)) fail(`repair target ${repairPlanKey} collides with an allocation plan key`);
    const repairUuid = repair.issueUuid.toLowerCase();
    const identifier = issueIdentifiers.get(repairUuid);
    if (!isUuidV4(repairUuid) || identifier !== repair.identifier || !liveUuids.has(repairUuid)) fail(`repair target ${repairPlanKey} is detached from live capture`);
    allocations.set(repairPlanKey, {
      planKey: repairPlanKey,
      kind: "relation_target",
      title: null,
      identifier,
      uuid: repairUuid,
      source: "adopted",
    });
  }

  const validatedOperationPlan = validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: input.artifacts.operationsRaw,
    manifest,
    allocation: allocation as unknown as LinearAuthorityAllocation,
    semantic: semanticValidation,
  });
  const operations = validatedOperationPlan.operations;
  const operationsRoot = validatedOperationPlan.operationsRoot;
  if (operations.length > limits.maxOperations) fail("operations plan exceeds the operation limit");
  const operationsByKey = new Map<string, LinearAuthorityPublicationOperation>();
  const operatedPlanKeys = new Set<string>();
  const allocatedCoverage = new Set<string>();
  for (const [index, operation] of operations.entries()) {
    if (operationsByKey.has(operation.operationKey) || operatedPlanKeys.has(operation.planKey)) fail(`operation ${index} duplicates an operation or plan key`);
    const target = allocations.get(operation.planKey);
    if (!target) fail(`operation ${index} has no allocation`);
    if (operation.kind === "create_entity") {
      if (target.source !== "allocated" || target.uuid !== operation.allocationUuid.toLowerCase()) fail(`operation ${index} does not use its allocated UUID`);
      const expectedKind = target.kind === "document" ? "document" : target.kind === "relation" ? null : "issue";
      if (expectedKind === null || operation.entityKind !== expectedKind) fail(`operation ${index} entity kind differs from its allocation`);
      allocatedCoverage.add(target.planKey);
    } else if (operation.kind === "update_entity") {
      if (target.source !== "adopted" || target.uuid !== operation.targetUuid.toLowerCase()) fail(`operation ${index} is not bound to an adopted UUID`);
      const expectedKind = target.kind === "document" ? "document" : target.kind === "relation" ? null : "issue";
      if (expectedKind === null || operation.entityKind !== expectedKind) fail(`operation ${index} entity kind differs from its allocation`);
    } else {
      if (target.kind !== "relation" || target.source !== "allocated" || target.uuid !== operation.allocationUuid.toLowerCase()) fail(`operation ${index} does not use its relation allocation`);
      const source = allocations.get(operation.sourcePlanKey);
      const relationTarget = allocations.get(operation.targetPlanKey);
      const isIssue = (row: ValidatedAllocation | undefined): row is ValidatedAllocation => row !== undefined && row.kind !== "document" && row.kind !== "relation";
      if (!isIssue(source) || !isIssue(relationTarget)) fail(`operation ${index} has an unresolved issue endpoint`);
      if (source.source === "allocated" && !allocatedCoverage.has(source.planKey)) fail(`operation ${index} precedes its source issue creation`);
      if (relationTarget.source === "allocated" && !allocatedCoverage.has(relationTarget.planKey)) fail(`operation ${index} precedes its target issue creation`);
      if (source.identifier !== null && relationTarget.identifier !== null) {
        const expected = canonicalLinearRelationKey(operation.relationType, source.identifier, relationTarget.identifier);
        if (operation.expectedCanonicalKey !== expected) fail(`operation ${index} canonical relation key differs`);
      } else if (operation.expectedCanonicalKey !== null) fail(`operation ${index} fabricates a future Linear identifier`);
      allocatedCoverage.add(target.planKey);
    }
    operationsByKey.set(operation.operationKey, operation);
    operatedPlanKeys.add(operation.planKey);
  }
  for (const target of allocations.values()) {
    if (target.source === "allocated" && !allocatedCoverage.has(target.planKey)) fail(`allocated target ${target.planKey} has no create operation`);
  }

  const nativeSelectors = buildLinearAuthorityNativeSelectors(
    manifest,
    committedLabelGroupSelectors(validationInput.compilerInputs.get("program-scope")),
  );
  linearAuthorityNativeSelectorRoot(nativeSelectors);
  const resumeRecords = validateJournal(input.resumeJournalRaw, input.expectedResumeJournalSha256, root, input.pins.operationsSha256, operationsByKey);
  return {
    planRoot: root,
    semanticRoot,
    liveCaptureRoot,
    sourceCommit,
    capturedAt,
    operationsRoot,
    operations,
    allocations,
    capturedRelations,
    capturedIssueIdentifiers: issueIdentifiers,
    nativeSelectors,
    limits,
    resumeRecords,
    validation: {
      structuralIntegrityValidated: true,
      semanticPlanInternalsValidated: true,
      captureEvidenceValidated: true,
      semanticCoverageValidated: true,
      mutationAuthorized: true,
    },
  };
}

const batchCount = (rows: number, size: number): number => rows === 0 ? 0 : Math.ceil(rows / size);

export function minimumLinearAuthorityHttpAttempts(prepared: PreparedLinearAuthorityPublication): number {
  const entityOperations = prepared.operations.filter((operation) => operation.kind !== "create_relation");
  const issueCreates = entityOperations.filter((operation) => operation.kind === "create_entity" && operation.entityKind === "issue");
  const aliasedEntities = entityOperations.filter((operation) => operation.kind !== "create_entity" || operation.entityKind !== "issue");
  const relationOperations = prepared.operations.filter((operation) => operation.kind === "create_relation");
  const operatedEntityKeys = new Set(entityOperations.map((operation) => operation.planKey));
  const separatelyReadEndpointKeys = new Set(
    relationOperations.flatMap((operation) => [operation.sourcePlanKey, operation.targetPlanKey])
      .filter((key) => !operatedEntityKeys.has(key)),
  );
  const resumedRelationKeys = new Set(
    prepared.resumeRecords.flatMap((record) =>
      record.operationKind === "create_relation" && record.canonicalRelationKey !== null
        ? [record.canonicalRelationKey]
        : []),
  );
  const catalogRows = new Set([
    ...prepared.capturedRelations.keys(),
    ...resumedRelationKeys,
  ]).size;
  const catalogPages = Math.max(1, batchCount(catalogRows, prepared.limits.relationPageSize));
  return 1 + // One exact live native-selector read is mandatory before any mutation.
    catalogPages +
    batchCount(entityOperations.length, prepared.limits.entityReadBatchSize) +
    (2 * batchCount(issueCreates.length, prepared.limits.issueCreateBatchSize)) +
    (3 * batchCount(aliasedEntities.length, prepared.limits.aliasedMutationBatchSize)) +
    batchCount(separatelyReadEndpointKeys.size, prepared.limits.entityReadBatchSize) +
    (2 * batchCount(relationOperations.length, prepared.limits.aliasedMutationBatchSize));
}

class HttpBudget {
  attempts = 0;
  constructor(readonly limit: number) {}
  take(): void {
    if (this.attempts >= this.limit) fail("HTTP attempt budget exhausted");
    this.attempts += 1;
  }
}

interface JournalWriter {
  append(operation: LinearAuthorityPublicationOperation, status: RedactedJournalRecordBody["status"], entityUuid: string, canonicalRelationKey: string | null, httpAttempts: number): Promise<void>;
  appendedRaw(): string;
}

function createJournalWriter(input: {
  prepared: PreparedLinearAuthorityPublication;
  operationsSha256: string;
  runId: string;
  now: () => Date;
  sink?: (line: string) => void | Promise<void>;
}): JournalWriter {
  const appended: string[] = [];
  let sequence = input.prepared.resumeRecords.length;
  let previous = input.prepared.resumeRecords.at(-1)?.recordSha256 ?? null;
  return {
    async append(operation, status, entityUuid, canonicalRelationKey, httpAttempts): Promise<void> {
      const body: RedactedJournalRecordBody = {
        schemaVersion: 1,
        sequence: ++sequence,
        runId: input.runId,
        planRoot: input.prepared.planRoot,
        operationsSha256: input.operationsSha256,
        operationKey: operation.operationKey,
        idempotencyKey: operation.idempotencyKey,
        operationKind: operation.kind,
        status,
        entityUuid,
        canonicalRelationKey,
        httpAttempts,
        occurredAt: input.now().toISOString(),
        previousRecordSha256: previous,
      };
      const record: RedactedJournalRecord = { ...body, recordSha256: sha256(canonicalJson(body)) };
      const line = JSON.stringify(record);
      if (/credential|authorization|api[_-]?key|description|content|payload|errorMessage/i.test(line)) fail("journal redaction contract was violated");
      if (input.sink) await input.sink(`${line}\n`);
      appended.push(line);
      previous = record.recordSha256;
    },
    appendedRaw: () => appended.length === 0 ? "" : `${appended.join("\n")}\n`,
  };
}

async function readWithRetry<T>(input: {
  budget: HttpBudget;
  maximumAttempts: number;
  sleep: (delayMs: number) => Promise<void>;
  call: () => Promise<T>;
  operationKey: string;
  beforeAttempt?: () => void;
}): Promise<T> {
  for (let attempt = 1; attempt <= input.maximumAttempts; attempt += 1) {
    input.beforeAttempt?.();
    input.budget.take();
    try {
      return await input.call();
    } catch (error) {
      if (!(error instanceof LinearAuthorityRetryableTransportError) || attempt === input.maximumAttempts) {
        fail(`transport failed for ${input.operationKey}`);
      }
      await input.sleep(Math.max(error.retryAfterMs, Math.min(2_000, attempt * 100)));
    }
  }
  fail(`transport failed for ${input.operationKey}`);
}

function validateRemoteEntity(
  row: LinearAuthorityRemoteEntity,
  expectedKind: LinearAuthorityEntityKind,
  expectedUuid: string,
  allocation: ValidatedAllocation,
): LinearAuthorityRemoteEntity {
  if (!row || row.uuid.toLowerCase() !== expectedUuid || !isUuidV4(row.uuid) || row.entityKind !== expectedKind || !row.state ||
    !DIGEST.test(row.state.titleSha256) || !DIGEST.test(row.state.bodySha256) || !DIGEST.test(row.state.nativeSha256) || !DIGEST.test(row.state.authorityPayloadSha256) ||
    (row.identifier !== null && !LINEAR_IDENTIFIER.test(row.identifier)) || row.archivedAt !== null) {
    fail(`remote entity identity differs for ${allocation.planKey}`);
  }
  if (allocation.source === "adopted" && allocation.identifier !== row.identifier) fail(`remote adopted identifier differs for ${allocation.planKey}`);
  if (expectedKind === "issue" && row.identifier === null) fail(`remote issue identifier is missing for ${allocation.planKey}`);
  if (expectedKind === "document" && row.identifier !== null) fail(`remote document has an issue identifier for ${allocation.planKey}`);
  return { ...row, uuid: row.uuid.toLowerCase() };
}

export function linearAuthorityEntityStateMatchesPrecondition(state: LinearAuthorityRemoteEntityState, expected: LinearAuthorityEntityPrecondition): boolean {
  if (expected.projection === "description_only") return state.bodySha256 === expected.bodySha256;
  return state.titleSha256 === expected.titleSha256 && state.bodySha256 === expected.bodySha256 && state.nativeSha256 === expected.nativeSha256;
}

function validateRemoteRelation(row: LinearAuthorityRemoteRelation, expectedUuid: string, expectedKey: string): LinearAuthorityRemoteRelation {
  if (!row || !isUuidV4(row.uuid) || row.uuid.toLowerCase() !== expectedUuid || row.canonicalKey !== expectedKey || row.archivedAt !== null) {
    fail("remote relation differs from its allocated UUID or canonical key");
  }
  return { ...row, uuid: row.uuid.toLowerCase() };
}

function relationEndpointIdentifiers(canonicalKey: string): [string, string] {
  const [type, left, right, ...extra] = canonicalKey.split(":");
  if (extra.length > 0 || !left || !right || !["blocks", "related", "similar", "duplicate"].includes(type) ||
    !LINEAR_IDENTIFIER.test(left) || !LINEAR_IDENTIFIER.test(right) || canonicalLinearRelationKey(type, left, right) !== canonicalKey) {
    fail("remote relation canonical key is invalid");
  }
  return [left, right];
}

export function classifyLinearAuthorityRelationCatalogRow(input: {
  remote: LinearAuthorityRemoteRelation;
  captured: LinearAuthorityRemoteRelation | null;
  resumedUuid: string | null;
  planned: { uuid: string; expectedCanonicalKey: string | null } | null;
  capturedIssueIdentifiers: ReadonlySet<string>;
}): "captured" | "resumed" | "planned" | "unrelated" {
  const endpoints = relationEndpointIdentifiers(input.remote.canonicalKey);
  if (input.captured) {
    if (input.captured.uuid !== input.remote.uuid || input.captured.archivedAt !== input.remote.archivedAt) fail("remote relation catalog drifted from fresh capture");
    return "captured";
  }
  if (input.resumedUuid !== null) {
    if (input.resumedUuid !== input.remote.uuid || input.remote.archivedAt !== null) fail("resume journal has a relation identity collision");
    return "resumed";
  }
  if (input.planned?.uuid === input.remote.uuid) {
    if (input.remote.archivedAt !== null || (input.planned.expectedCanonicalKey !== null && input.planned.expectedCanonicalKey !== input.remote.canonicalKey)) {
      fail("planned relation allocation collides with remote relation state");
    }
    return "planned";
  }
  if (endpoints.some((identifier) => input.capturedIssueIdentifiers.has(identifier))) fail("remote relation catalog contains an unexpected relation touching fresh capture scope");
  return "unrelated";
}

async function relationCatalog(input: {
  prepared: PreparedLinearAuthorityPublication;
  transport: LinearAuthorityWriteTransport;
  credential: string;
  budget: HttpBudget;
  sleep: (delayMs: number) => Promise<void>;
  operationsSha256: string;
  beforeAttempt: () => void;
}): Promise<{
  byKey: Map<string, LinearAuthorityRemoteRelation>;
  byUuid: Map<string, LinearAuthorityRemoteRelation>;
}> {
  const byKey = new Map<string, LinearAuthorityRemoteRelation>();
  const byUuid = new Map<string, LinearAuthorityRemoteRelation>();
  const seenCursors = new Set<string>();
  let after: string | null = null;
  let pages = 0;
  let rows = 0;
  do {
    if (++pages > input.prepared.limits.maxRelationPages) fail("relation pagination exceeded its page limit");
    const page = await readWithRetry({
      budget: input.budget,
      maximumAttempts: input.prepared.limits.maxAttemptsPerRequest,
      sleep: input.sleep,
      operationKey: "relation-catalog",
      beforeAttempt: input.beforeAttempt,
      call: () => input.transport.listRelationsPage({ after, first: input.prepared.limits.relationPageSize, includeArchived: true, credential: input.credential }),
    });
    if (!page || !Array.isArray(page.rows) || !page.pageInfo || typeof page.pageInfo.hasNextPage !== "boolean" ||
      (page.pageInfo.endCursor !== null && typeof page.pageInfo.endCursor !== "string") || page.rows.length > input.prepared.limits.relationPageSize) {
      fail("relation pagination response is invalid");
    }
    rows += page.rows.length;
    if (rows > input.prepared.limits.maxRelationRows) fail("relation pagination exceeded its row limit");
    for (const remote of page.rows) {
      const id = uuid(remote.uuid, "remote relation UUID");
      const key = string(remote.canonicalKey, "remote relation canonical key");
      if (remote.archivedAt !== null && typeof remote.archivedAt !== "string") fail("remote relation archivedAt is invalid");
      if (byUuid.has(id) || byKey.has(key)) fail("remote relation catalog duplicates a UUID or canonical key");
      const relation = { uuid: id, canonicalKey: key, archivedAt: remote.archivedAt };
      byUuid.set(id, relation);
      byKey.set(key, relation);
    }
    if (!page.pageInfo.hasNextPage) break;
    const cursor = page.pageInfo.endCursor;
    if (!cursor || seenCursors.has(cursor)) fail("relation pagination cursor is missing or repeated");
    seenCursors.add(cursor);
    after = cursor;
  } while (true);

  const allowedResume = new Map<string, string>();
  for (const record of input.prepared.resumeRecords) {
    if (record.operationKind === "create_relation" && record.canonicalRelationKey !== null) {
      const prior = allowedResume.get(record.canonicalRelationKey);
      if (prior !== undefined && prior !== record.entityUuid) fail("resume journal has a relation canonical-key collision");
      allowedResume.set(record.canonicalRelationKey, record.entityUuid);
    }
  }
  const plannedByUuid = new Map(
    input.prepared.operations.flatMap((operation) => operation.kind === "create_relation"
      ? [[operation.allocationUuid, { uuid: operation.allocationUuid, expectedCanonicalKey: operation.expectedCanonicalKey }] as const]
      : []),
  );
  const capturedIssueIdentifiers = new Set(input.prepared.capturedIssueIdentifiers.values());
  for (const [key, remote] of byKey) {
    const captured = input.prepared.capturedRelations.get(key);
    classifyLinearAuthorityRelationCatalogRow({
      remote,
      captured: captured ?? null,
      resumedUuid: allowedResume.get(key) ?? null,
      planned: plannedByUuid.get(remote.uuid) ?? null,
      capturedIssueIdentifiers,
    });
  }
  for (const [key, captured] of input.prepared.capturedRelations) {
    const remote = byKey.get(key);
    if (!remote || remote.uuid !== captured.uuid || remote.archivedAt !== captured.archivedAt) fail("freshly captured relation is missing from remote catalog");
  }
  return { byKey, byUuid };
}

export async function executeLinearAuthorityPublication(
  input: LinearAuthorityPublicationInput,
): Promise<LinearAuthorityPublicationResult> {
  const prepared = preflightLinearAuthorityPublication(input);
  const mode = input.mode ?? "dry-run";
  if (mode !== "dry-run" && mode !== "apply") fail("mode must be dry-run or apply");
  if (mode === "dry-run") {
    return {
      mode,
      status: "validated_dry_run",
      planRoot: prepared.planRoot,
      semanticRoot: prepared.semanticRoot,
      liveCaptureRoot: prepared.liveCaptureRoot,
      operationCount: prepared.operations.length,
      applied: 0,
      alreadyApplied: 0,
      httpAttempts: 0,
      results: prepared.operations.map((operation) => ({
        operationKey: operation.operationKey,
        planKey: operation.planKey,
        kind: operation.kind,
        status: "planned",
        entityUuid: operation.kind === "update_entity" ? operation.targetUuid : operation.allocationUuid,
        canonicalRelationKey: operation.kind === "create_relation" ? operation.expectedCanonicalKey : null,
      })),
      appendedJournalRaw: "",
    };
  }

  if (typeof input.runId !== "string" || !OPERATION_KEY.test(input.runId)) fail("apply requires a safe run ID");
  if (!input.credentialProvider || !input.transport) fail("apply requires a credential provider and batched write transport");
  const minimumHttpAttempts = minimumLinearAuthorityHttpAttempts(prepared);
  if (prepared.limits.maxHttpAttempts < minimumHttpAttempts) {
    fail(`HTTP attempt budget is below the ${minimumHttpAttempts}-request planned minimum`);
  }
  const clock = input.clock ?? (() => new Date());
  const liveNow = (): Date => {
    const value = clock();
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) fail("live apply clock is invalid");
    return value;
  };
  const applyStartedAtMs = liveNow().getTime();
  const assertApplyWindow = (): void => assertLinearAuthorityApplyWindow({
    capturedAtMs: Date.parse(prepared.capturedAt),
    applyStartedAtMs,
    nowMs: liveNow().getTime(),
    maxCaptureAgeMs: prepared.limits.maxCaptureAgeMs,
    maxApplyDurationMs: prepared.limits.maxApplyDurationMs,
  });
  assertApplyWindow();
  let credential: string;
  try {
    credential = await input.credentialProvider();
  } catch {
    fail("credential provider failed");
  }
  if (typeof credential !== "string" || credential.length < 8) fail("credential provider returned an invalid credential");
  assertApplyWindow();

  const transport = input.transport;
  const budget = new HttpBudget(prepared.limits.maxHttpAttempts);
  const rawSleep = input.sleep ?? ((delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs)));
  const sleep = async (delayMs: number): Promise<void> => {
    assertApplyWindow();
    await rawSleep(delayMs);
    assertApplyWindow();
  };
  const journal = createJournalWriter({
    prepared,
    operationsSha256: input.pins.operationsSha256,
    runId: input.runId,
    now: liveNow,
    sink: input.journalSink,
  });
  const relationCatalogRows = await relationCatalog({
    prepared,
    transport,
    credential,
    budget,
    sleep,
    operationsSha256: input.pins.operationsSha256,
    beforeAttempt: assertApplyWindow,
  });
  const relations = relationCatalogRows.byKey;
  const entityCache = new Map<string, LinearAuthorityRemoteEntity>();
  const results: LinearAuthorityPublicationOperationResult[] = [];

  const chunks = <T>(rows: readonly T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
    return result;
  };

  const addResult = async (
    operation: LinearAuthorityPublicationOperation,
    status: "applied" | "already_applied",
    entityUuid: string,
    canonicalRelationKey: string | null,
  ): Promise<void> => {
    await journal.append(operation, status, entityUuid, canonicalRelationKey, budget.attempts);
    results.push({ operationKey: operation.operationKey, planKey: operation.planKey, kind: operation.kind, status, entityUuid, canonicalRelationKey });
  };

  type EntityOperation = Extract<LinearAuthorityPublicationOperation, { kind: "create_entity" | "update_entity" }>;
  interface EntityReadSpec {
    operation: EntityOperation | null;
    allocation: ValidatedAllocation;
    entityKind: LinearAuthorityEntityKind;
    payload: { [key: string]: LinearAuthorityJson };
    label: string;
  }

  const readEntitySpecs = async (specs: readonly EntityReadSpec[]): Promise<Map<string, LinearAuthorityRemoteEntity>> => {
    const found = new Map<string, LinearAuthorityRemoteEntity>();
    for (const batch of chunks(specs, prepared.limits.entityReadBatchSize)) {
      const expected = new Map(batch.map((spec) => [spec.allocation.uuid, spec]));
      const rows = await readWithRetry({
        budget,
        maximumAttempts: prepared.limits.maxAttemptsPerRequest,
        sleep,
        operationKey: batch[0]?.label ?? "entity-read",
        beforeAttempt: assertApplyWindow,
        call: () => transport.readEntities({
          requests: batch.map((spec) => ({
            entityKind: spec.entityKind,
            id: spec.allocation.uuid,
            planKey: spec.allocation.planKey,
            payload: spec.payload,
          })),
          credential,
        }),
      });
      if (!Array.isArray(rows)) fail("batched entity read response is invalid");
      for (const row of rows) {
        const id = typeof row?.uuid === "string" ? row.uuid.toLowerCase() : "";
        const spec = expected.get(id);
        if (!spec || found.has(id)) fail("batched entity read returned an unexpected or duplicate UUID");
        found.set(id, validateRemoteEntity(row, spec.entityKind, id, spec.allocation));
      }
    }
    return found;
  };

  const entityOperations = prepared.operations.filter((operation): operation is EntityOperation => operation.kind !== "create_relation");
  const initialEntitySpecs: EntityReadSpec[] = entityOperations.map((operation) => {
    const allocation = prepared.allocations.get(operation.planKey)!;
    return { operation, allocation, entityKind: operation.entityKind, payload: operation.payload, label: operation.operationKey };
  });
  const initialEntities = await readEntitySpecs(initialEntitySpecs);
  const pendingEntityOperations: Array<{ operation: EntityOperation; allocation: ValidatedAllocation }> = [];
  for (const spec of initialEntitySpecs) {
    const operation = spec.operation!;
    const current = initialEntities.get(spec.allocation.uuid) ?? null;
    if (operation.kind === "create_entity") {
      if (current === null) {
        pendingEntityOperations.push({ operation, allocation: spec.allocation });
        continue;
      }
      if (current.state.authorityPayloadSha256 !== operation.desiredPayloadSha256) fail(`allocated UUID collision for ${operation.operationKey}`);
      entityCache.set(operation.planKey, current);
      await addResult(operation, "already_applied", spec.allocation.uuid, null);
      continue;
    }
    if (current === null) fail(`adopted entity is missing for ${operation.operationKey}`);
    if (current.state.authorityPayloadSha256 === operation.desiredPayloadSha256) {
      entityCache.set(operation.planKey, current);
      await addResult(operation, "already_applied", spec.allocation.uuid, null);
      continue;
    }
    if (!linearAuthorityEntityStateMatchesPrecondition(current.state, operation.expectedCurrentState)) fail(`captured title, body, or native state drifted for ${operation.operationKey}`);
    pendingEntityOperations.push({ operation, allocation: spec.allocation });
  }

  const liveNativeSelectors = await readWithRetry({
    budget,
    maximumAttempts: prepared.limits.maxAttemptsPerRequest,
    sleep,
    operationKey: "native-selector-read",
    beforeAttempt: assertApplyWindow,
    call: () => transport.readNativeSelectors({
      selectors: prepared.nativeSelectors.map((row) => structuredClone(row)),
      credential,
    }),
  });
  if (!Array.isArray(liveNativeSelectors)) fail("live native selector response is invalid");
  assertLinearAuthorityNativeSelectors(prepared.nativeSelectors, liveNativeSelectors);

  const failPendingEntityBatch = async (rows: readonly { operation: EntityOperation; allocation: ValidatedAllocation }[]): Promise<never> => {
    for (const row of rows) {
      try {
        await journal.append(row.operation, "failed", row.allocation.uuid, null, budget.attempts);
      } catch {
        // A failed append is never replaced or overwritten.
      }
    }
    fail(`batched entity operation failed for ${rows[0]?.operation.operationKey ?? "unknown"}`);
  };

  const runEntityWriteBatch = async (batchRows: Array<{ operation: EntityOperation; allocation: ValidatedAllocation }>, issueBatch: boolean): Promise<void> => {
    let rows = batchRows;
    if (!issueBatch) {
      const immediate = await readEntitySpecs(rows.map(({ operation, allocation }) => ({
        operation,
        allocation,
        entityKind: operation.entityKind,
        payload: operation.payload,
        label: `immediate:${operation.operationKey}`,
      })));
      const pending: typeof rows = [];
      for (const row of rows) {
        const remote = immediate.get(row.allocation.uuid) ?? null;
        if (remote?.state.authorityPayloadSha256 === row.operation.desiredPayloadSha256) {
          entityCache.set(row.operation.planKey, remote);
          await addResult(row.operation, "already_applied", row.allocation.uuid, null);
          continue;
        }
        if (row.operation.kind === "create_entity") {
          if (remote !== null) fail(`allocated UUID collision immediately before ${row.operation.operationKey}`);
        } else if (remote === null || !linearAuthorityEntityStateMatchesPrecondition(remote.state, row.operation.expectedCurrentState)) {
          fail(`captured title, body, or native state drifted immediately before ${row.operation.operationKey}`);
        }
        pending.push(row);
      }
      rows = pending;
      if (rows.length === 0) return;
    }
    for (const row of rows) await journal.append(row.operation, "started", row.allocation.uuid, null, budget.attempts);
    let pending = new Map(rows.map((row) => [row.allocation.uuid, row]));
    for (let attempt = 1; attempt <= prepared.limits.maxAttemptsPerRequest; attempt += 1) {
      const active = [...pending.values()];
      let retryableFailure = false;
      let retryAfterMs = 0;
      let nonRetryableFailure = false;
      assertApplyWindow();
      budget.take();
      try {
        const response = issueBatch
          ? await transport.issueBatchCreate({
            issues: active.map(({ operation, allocation }) => {
              if (operation.kind !== "create_entity" || operation.entityKind !== "issue") fail("issueBatchCreate received a non-issue operation");
              return { id: allocation.uuid, planKey: operation.planKey, payload: operation.payload, idempotencyKey: operation.idempotencyKey };
            }),
            credential,
          })
          : await transport.mutateEntitiesAliased({
            mutations: active.map(({ operation, allocation }) => ({
              action: operation.kind === "create_entity"
                ? "create_document" as const
                : operation.entityKind === "issue"
                  ? "update_issue" as const
                  : "update_document" as const,
              entityKind: operation.entityKind,
              id: allocation.uuid,
              planKey: operation.planKey,
              expectedCurrentState: operation.kind === "update_entity" ? operation.expectedCurrentState : null,
              payload: operation.payload,
              idempotencyKey: operation.idempotencyKey,
            })),
            credential,
          });
        if (!Array.isArray(response) || response.length !== active.length) fail("batched entity mutation response does not exactly cover requested UUIDs");
        const returned = new Set<string>();
        for (const remote of response) {
          const id = typeof remote?.uuid === "string" ? remote.uuid.toLowerCase() : "";
          const work = pending.get(id);
          if (!work || returned.has(id)) fail("batched entity mutation returned an unexpected or duplicate UUID");
          const validated = validateRemoteEntity(remote, work.operation.entityKind, id, work.allocation);
          if (validated.state.authorityPayloadSha256 !== work.operation.desiredPayloadSha256) fail("batched entity mutation response differs from desired state");
          returned.add(id);
        }
      } catch (error) {
        retryableFailure = error instanceof LinearAuthorityRetryableTransportError;
        retryAfterMs = error instanceof LinearAuthorityRetryableTransportError ? error.retryAfterMs : 0;
        nonRetryableFailure = !retryableFailure;
      }

      const readback = await readEntitySpecs([...pending.values()].map(({ operation, allocation }) => ({
        operation,
        allocation,
        entityKind: operation.entityKind,
        payload: operation.payload,
        label: operation.operationKey,
      })));
      for (const [id, work] of [...pending]) {
        const remote = readback.get(id) ?? null;
        if (remote?.state.authorityPayloadSha256 === work.operation.desiredPayloadSha256) {
          entityCache.set(work.operation.planKey, remote);
          await addResult(work.operation, "applied", id, null);
          pending.delete(id);
          continue;
        }
        if (work.operation.kind === "update_entity") {
          if (remote === null || !linearAuthorityEntityStateMatchesPrecondition(remote.state, work.operation.expectedCurrentState)) await failPendingEntityBatch([...pending.values()]);
        } else if (remote !== null) {
          await failPendingEntityBatch([...pending.values()]);
        }
      }
      if (nonRetryableFailure) {
        if (pending.size > 0) await failPendingEntityBatch([...pending.values()]);
        fail(`batched entity transport contract failed for ${active[0]?.operation.operationKey ?? "unknown"}`);
      }
      if (pending.size === 0) return;
      if ((!retryableFailure && attempt > 0) || attempt === prepared.limits.maxAttemptsPerRequest) await failPendingEntityBatch([...pending.values()]);
      await sleep(Math.max(retryAfterMs, Math.min(2_000, attempt * 100)));
    }
    await failPendingEntityBatch([...pending.values()]);
  };

  const issueCreates = pendingEntityOperations.filter(({ operation }) => operation.kind === "create_entity" && operation.entityKind === "issue");
  const aliasedEntities = pendingEntityOperations.filter(({ operation }) => operation.kind !== "create_entity" || operation.entityKind !== "issue");
  for (const batch of chunks(issueCreates, prepared.limits.issueCreateBatchSize)) await runEntityWriteBatch(batch, true);
  for (const batch of chunks(aliasedEntities, prepared.limits.aliasedMutationBatchSize)) await runEntityWriteBatch(batch, false);

  type RelationOperation = Extract<LinearAuthorityPublicationOperation, { kind: "create_relation" }>;
  interface RelationWork {
    operation: RelationOperation;
    allocation: ValidatedAllocation;
    source: LinearAuthorityRemoteEntity;
    target: LinearAuthorityRemoteEntity;
    canonicalKey: string;
  }

  const relationOperations = prepared.operations.filter((operation): operation is RelationOperation => operation.kind === "create_relation");
  const endpointPlanKeys = [...new Set(relationOperations.flatMap((operation) => [operation.sourcePlanKey, operation.targetPlanKey]))];
  const missingEndpointSpecs: EntityReadSpec[] = endpointPlanKeys.flatMap((planKeyValue) => {
    if (entityCache.has(planKeyValue)) return [];
    const allocation = prepared.allocations.get(planKeyValue);
    if (!allocation) fail(`relation endpoint ${planKeyValue} has no allocation`);
    return [{ operation: null, allocation, entityKind: "issue", payload: {}, label: `endpoint:${planKeyValue}` }];
  });
  const endpointRows = await readEntitySpecs(missingEndpointSpecs);
  for (const spec of missingEndpointSpecs) {
    const remote = endpointRows.get(spec.allocation.uuid);
    if (!remote) fail(`relation endpoint ${spec.allocation.planKey} is missing`);
    entityCache.set(spec.allocation.planKey, remote);
  }

  const relationWork: RelationWork[] = [];
  for (const operation of relationOperations) {
    const allocation = prepared.allocations.get(operation.planKey)!;
    const source = entityCache.get(operation.sourcePlanKey)!;
    const target = entityCache.get(operation.targetPlanKey)!;
    const canonicalKey = canonicalLinearRelationKey(operation.relationType, source.identifier!, target.identifier!);
    if (operation.expectedCanonicalKey !== null && operation.expectedCanonicalKey !== canonicalKey) fail(`runtime relation key differs for ${operation.operationKey}`);
    const uuidCollision = relationCatalogRows.byUuid.get(allocation.uuid);
    if (uuidCollision && uuidCollision.canonicalKey !== canonicalKey) fail(`allocated relation UUID collision for ${operation.operationKey}`);
    const existing = relations.get(canonicalKey);
    if (existing) {
      if (existing.uuid !== allocation.uuid || existing.archivedAt !== null) fail(`canonical relation key collision for ${operation.operationKey}`);
      await addResult(operation, "already_applied", allocation.uuid, canonicalKey);
      continue;
    }
    relationWork.push({ operation, allocation, source, target, canonicalKey });
  }

  const readRelationWork = async (work: readonly RelationWork[]): Promise<Map<string, LinearAuthorityRemoteRelation>> => {
    const found = new Map<string, LinearAuthorityRemoteRelation>();
    for (const batch of chunks(work, prepared.limits.relationReadBatchSize)) {
      const expected = new Map(batch.map((row) => [row.allocation.uuid, row]));
      const response = await readWithRetry({
        budget,
        maximumAttempts: prepared.limits.maxAttemptsPerRequest,
        sleep,
        operationKey: batch[0]?.operation.operationKey ?? "relation-read",
        beforeAttempt: assertApplyWindow,
        call: () => transport.readRelations({
          requests: batch.map((row) => ({
            id: row.allocation.uuid,
            sourceUuid: row.source.uuid,
            targetUuid: row.target.uuid,
          })),
          credential,
        }),
      });
      if (!Array.isArray(response)) fail("batched relation read response is invalid");
      for (const remote of response) {
        const id = typeof remote?.uuid === "string" ? remote.uuid.toLowerCase() : "";
        const row = expected.get(id);
        if (!row || found.has(id)) fail("batched relation read returned an unexpected or duplicate UUID");
        found.set(id, validateRemoteRelation(remote, id, row.canonicalKey));
      }
    }
    return found;
  };

  const failPendingRelationBatch = async (rows: readonly RelationWork[]): Promise<never> => {
    for (const row of rows) {
      try {
        await journal.append(row.operation, "failed", row.allocation.uuid, row.canonicalKey, budget.attempts);
      } catch {
        // A failed append is never replaced or overwritten.
      }
    }
    fail(`batched relation operation failed for ${rows[0]?.operation.operationKey ?? "unknown"}`);
  };

  const runRelationWriteBatch = async (rows: RelationWork[]): Promise<void> => {
    for (const row of rows) await journal.append(row.operation, "started", row.allocation.uuid, row.canonicalKey, budget.attempts);
    let pending = new Map(rows.map((row) => [row.allocation.uuid, row]));
    for (let attempt = 1; attempt <= prepared.limits.maxAttemptsPerRequest; attempt += 1) {
      const active = [...pending.values()];
      let retryableFailure = false;
      let retryAfterMs = 0;
      let nonRetryableFailure = false;
      assertApplyWindow();
      budget.take();
      try {
        const response = await transport.createRelationsAliased({
          relations: active.map((row) => ({
            id: row.allocation.uuid,
            planKey: row.operation.planKey,
            type: row.operation.relationType,
            sourceUuid: row.source.uuid,
            targetUuid: row.target.uuid,
            canonicalKey: row.canonicalKey,
            idempotencyKey: row.operation.idempotencyKey,
          })),
          credential,
        });
        if (!Array.isArray(response) || response.length !== active.length) fail("aliased relation mutation response does not exactly cover requested UUIDs");
        const returned = new Set<string>();
        for (const remote of response) {
          const id = typeof remote?.uuid === "string" ? remote.uuid.toLowerCase() : "";
          const row = pending.get(id);
          if (!row || returned.has(id)) fail("aliased relation mutation returned an unexpected or duplicate UUID");
          validateRemoteRelation(remote, id, row.canonicalKey);
          returned.add(id);
        }
      } catch (error) {
        retryableFailure = error instanceof LinearAuthorityRetryableTransportError;
        retryAfterMs = error instanceof LinearAuthorityRetryableTransportError ? error.retryAfterMs : 0;
        nonRetryableFailure = !retryableFailure;
      }
      const readback = await readRelationWork([...pending.values()]);
      for (const [id, row] of [...pending]) {
        const remote = readback.get(id);
        if (!remote) continue;
        relations.set(row.canonicalKey, remote);
        await addResult(row.operation, "applied", id, row.canonicalKey);
        pending.delete(id);
      }
      if (nonRetryableFailure) {
        if (pending.size > 0) await failPendingRelationBatch([...pending.values()]);
        fail(`aliased relation transport contract failed for ${active[0]?.operation.operationKey ?? "unknown"}`);
      }
      if (pending.size === 0) return;
      if ((!retryableFailure && attempt > 0) || attempt === prepared.limits.maxAttemptsPerRequest) await failPendingRelationBatch([...pending.values()]);
      await sleep(Math.max(retryAfterMs, Math.min(2_000, attempt * 100)));
    }
    await failPendingRelationBatch([...pending.values()]);
  };

  for (const batch of chunks(relationWork, prepared.limits.aliasedMutationBatchSize)) await runRelationWriteBatch(batch);

  assertApplyWindow();
  const applied = results.filter((row) => row.status === "applied").length;
  return {
    mode,
    status: "applied",
    planRoot: prepared.planRoot,
    semanticRoot: prepared.semanticRoot,
    liveCaptureRoot: prepared.liveCaptureRoot,
    operationCount: prepared.operations.length,
    applied,
    alreadyApplied: results.length - applied,
    httpAttempts: budget.attempts,
    results,
    appendedJournalRaw: journal.appendedRaw(),
  };
}
