import { createHash } from "node:crypto";

export interface NativeCatalogEntry {
  id: string;
  name: string;
  teamId?: string;
  key?: string;
}

export interface NativeCatalog {
  teams: NativeCatalogEntry[];
  projects: NativeCatalogEntry[];
  states: NativeCatalogEntry[];
  labels: NativeCatalogEntry[];
}

export interface NativeCatalogContract {
  team: NativeCatalogEntry;
  projects: NativeCatalogEntry[];
  states: NativeCatalogEntry[];
  labels: NativeCatalogEntry[];
}

export interface ManagedPlanRow {
  legacyId: string;
  targetPlanKey: string;
  title: string;
  primaryExecutionUuid: string | null;
  desiredRelationKeys: string[];
}

export interface ManagedLiveIssue {
  id: string;
  identifier: string;
  title: string;
  teamId: string;
  relationKeys: string[];
  archivedAt?: string | null;
}

export interface StableMapping {
  legacyId: string;
  targetPlanKey: string;
  issueUuid: string | null;
  issueIdentifier: string | null;
  source: "receipt" | "primary_execution_relation" | "unallocated";
}

export type LinearTargetKind = "issue" | "relation" | "document" | "project";

export interface LinearTargetAllocation {
  planKey: string;
  kind: LinearTargetKind;
  uuid: string;
}

export interface LinearTargetAllocationManifest {
  schemaVersion: 1;
  planDigest: string;
  allocations: LinearTargetAllocation[];
}

export interface ManagedRelation {
  id: string;
  key: string;
  endpointIds: [string, string];
}

export interface RelationDiff {
  add: string[];
  remove: ManagedRelation[];
  preserve: ManagedRelation[];
  desired: string[];
}

export type MutationAction =
  | "issue_create"
  | "issue_update"
  | "issue_archive"
  | "relation_create"
  | "relation_delete"
  | "document_create"
  | "document_update";

export interface MutationOperation<TBefore = unknown, TAfter = unknown> {
  operationId: string;
  action: MutationAction;
  targetUuid: string;
  expectedFingerprint: string;
  before: TBefore;
  mutateOnce(): Promise<void>;
  readAfter(): Promise<TAfter | null>;
  fingerprintAfter(value: TAfter | null): string;
  allowNullAfter?: boolean;
  compensation: Record<string, unknown>;
}

export interface JournalRecord {
  sequence: number;
  operationId: string;
  action: MutationAction;
  targetUuid: string;
  phase: "before" | "verified" | "ambiguous" | "failed";
  expectedFingerprint: string;
  actualFingerprint: string | null;
  compensation: Record<string, unknown>;
  error: string | null;
}

export interface JournalSink {
  appendRedacted(record: JournalRecord): Promise<void>;
  appendBackup(record: JournalRecord & { before: unknown; after: unknown }): Promise<void>;
  checkpoint(operationId: string, fingerprint: string): Promise<void>;
}

export type RedactedJournalRecord = Omit<JournalRecord, "compensation" | "error"> & {
  errorFingerprint: string | null;
};

export function redactJournalRecord(record: JournalRecord): RedactedJournalRecord {
  const { compensation: _compensation, error, ...safe } = record;
  return {
    ...safe,
    errorFingerprint: error === null ? null : createHash("sha256").update(error).digest("hex"),
  };
}

export class AmbiguousMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AmbiguousMutationError";
  }
}

export function stableOperationId(namespace: string, key: string): string {
  return `op_${createHash("sha256").update(`${namespace}\0${key}`).digest("hex")}`;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4(value: string): boolean {
  return UUID_V4.test(value);
}

export function validateUuidV4AllocationManifest(
  raw: string,
  expectedDigest: string,
  expectedPlanDigest: string,
  expectedTargets: Map<string, LinearTargetKind>,
): LinearTargetAllocationManifest {
  if (createHash("sha256").update(raw).digest("hex") !== expectedDigest) throw new Error("UUIDv4 allocation manifest digest mismatch");
  const parsed = JSON.parse(raw) as Partial<LinearTargetAllocationManifest> | null;
  if (!parsed || Array.isArray(parsed) || Object.keys(parsed).sort().join(",") !== "allocations,planDigest,schemaVersion" || parsed.schemaVersion !== 1 || parsed.planDigest !== expectedPlanDigest || !Array.isArray(parsed.allocations)) {
    throw new Error("UUIDv4 allocation manifest contract is invalid");
  }
  if (parsed.allocations.length !== expectedTargets.size) throw new Error("UUIDv4 allocation manifest coverage is incomplete");
  const seenPlanKeys = new Set<string>();
  const seenUuids = new Set<string>();
  for (const allocation of parsed.allocations) {
    if (!allocation || Array.isArray(allocation) || Object.keys(allocation).sort().join(",") !== "kind,planKey,uuid" || typeof allocation.planKey !== "string" || typeof allocation.kind !== "string" || typeof allocation.uuid !== "string") {
      throw new Error("UUIDv4 allocation manifest row is invalid");
    }
    if (seenPlanKeys.has(allocation.planKey)) throw new Error(`UUIDv4 allocation manifest duplicates plan key ${allocation.planKey}`);
    const expectedKind = expectedTargets.get(allocation.planKey);
    if (!expectedKind || allocation.kind !== expectedKind) throw new Error(`UUIDv4 allocation manifest contains unexpected target ${allocation.planKey}`);
    if (!isUuidV4(allocation.uuid)) throw new Error(`UUIDv4 allocation manifest contains a non-v4 UUID for ${allocation.planKey}`);
    const normalizedUuid = allocation.uuid.toLowerCase();
    if (seenUuids.has(normalizedUuid)) throw new Error(`UUIDv4 allocation manifest duplicates UUID ${allocation.uuid}`);
    seenPlanKeys.add(allocation.planKey);
    seenUuids.add(normalizedUuid);
  }
  for (const planKey of expectedTargets.keys()) {
    if (!seenPlanKeys.has(planKey)) throw new Error(`UUIDv4 allocation manifest is missing ${planKey}`);
  }
  return parsed as LinearTargetAllocationManifest;
}

function exactEntry(rows: NativeCatalogEntry[], expected: NativeCatalogEntry, kind: string): NativeCatalogEntry {
  const byId = rows.filter((row) => row.id === expected.id);
  if (byId.length !== 1) throw new Error(`${kind} ${expected.id} must resolve exactly once`);
  const row = byId[0];
  if (row.name !== expected.name || (expected.key !== undefined && row.key !== expected.key) || (expected.teamId !== undefined && row.teamId !== expected.teamId)) {
    throw new Error(`${kind} ${expected.id} differs from its pinned contract`);
  }
  const sameName = rows.filter((candidate) => candidate.name === expected.name);
  if (sameName.length !== 1) throw new Error(`${kind} name ${expected.name} is not unique`);
  return row;
}

export function resolveNativeCatalog(catalog: NativeCatalog, contract: NativeCatalogContract): NativeCatalogContract {
  const team = exactEntry(catalog.teams, contract.team, "team");
  if (!team.key) throw new Error("Requirements team key is empty");
  const projects = contract.projects.map((row) => exactEntry(catalog.projects, row, "project"));
  const states = contract.states.map((row) => exactEntry(catalog.states, { ...row, teamId: contract.team.id }, "state"));
  const labels = contract.labels.map((row) => exactEntry(catalog.labels, row, "label"));
  return { team, projects, states, labels };
}

export function adoptStableMappings(
  plans: ManagedPlanRow[],
  liveIssues: ManagedLiveIssue[],
  teamId: string,
  receipt: StableMapping[] = [],
): StableMapping[] {
  const archived = liveIssues.filter((row) => row.teamId === teamId && row.archivedAt);
  if (archived.length) throw new Error(`Unexpected archived requirement row ${archived[0].identifier}`);
  const planByLegacy = new Map(plans.map((row) => [row.legacyId, row]));
  const liveById = new Map(liveIssues.map((row) => [row.id, row]));
  const mappings = new Map<string, StableMapping>();
  const claimedLive = new Set<string>();

  for (const mapping of receipt) {
    const plan = planByLegacy.get(mapping.legacyId);
    const live = mapping.issueUuid ? liveById.get(mapping.issueUuid) : undefined;
    if (!plan || !live || live.teamId !== teamId || live.title !== plan.title) {
      throw new Error(`Stable mapping mismatch for ${mapping.legacyId}`);
    }
    if (claimedLive.has(live.id)) throw new Error(`Live issue ${live.id} is mapped more than once`);
    claimedLive.add(live.id);
    mappings.set(mapping.legacyId, { ...mapping, targetPlanKey: plan.targetPlanKey, issueIdentifier: live.identifier, source: "receipt" });
  }

  for (const live of liveIssues.filter((row) => row.teamId === teamId && !claimedLive.has(row.id))) {
    const candidates = plans.filter((plan) => {
      return plan.primaryExecutionUuid !== null && live.relationKeys.some((key) => {
        const [type, left, right, ...rest] = key.split(":");
        return type === "related" && rest.length === 0 && (left === plan.primaryExecutionUuid || right === plan.primaryExecutionUuid);
      });
    });
    if (candidates.length !== 1) {
      throw new Error(`Live issue ${live.identifier} has ${candidates.length} stable mapping candidates`);
    }
    const plan = candidates[0];
    if (live.title !== plan.title || mappings.has(plan.legacyId)) {
      throw new Error(`Stable mapping collision for ${plan.legacyId}`);
    }
    mappings.set(plan.legacyId, {
      legacyId: plan.legacyId,
      targetPlanKey: plan.targetPlanKey,
      issueUuid: live.id,
      issueIdentifier: live.identifier,
      source: "primary_execution_relation",
    });
    claimedLive.add(live.id);
  }

  for (const plan of plans) {
    if (!mappings.has(plan.legacyId)) {
      mappings.set(plan.legacyId, {
        legacyId: plan.legacyId,
        targetPlanKey: plan.targetPlanKey,
        issueUuid: null,
        issueIdentifier: null,
        source: "unallocated",
      });
    }
  }
  if (mappings.size !== plans.length || claimedLive.size !== liveIssues.filter((row) => row.teamId === teamId).length) {
    throw new Error("Stable mapping coverage is incomplete");
  }
  return [...mappings.values()].sort((left, right) => left.legacyId.localeCompare(right.legacyId, undefined, { numeric: true }));
}

export function validateRecoveryCheckpoint(raw: string, expectedDigest: string, plannedLegacyIds: Set<string>): StableMapping[] {
  const actualDigest = createHash("sha256").update(raw).digest("hex");
  if (actualDigest !== expectedDigest) throw new Error("Recovery checkpoint digest mismatch");
  const parsed = JSON.parse(raw) as { schemaVersion?: number; mappings?: Array<{ legacyId?: string; issueUuid?: string; issueIdentifier?: string }> };
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.mappings) || parsed.mappings.length === 0) throw new Error("Recovery checkpoint contract is invalid");
  const mappings = parsed.mappings.map((row): StableMapping => {
    if (!row.legacyId || !row.issueUuid || !row.issueIdentifier || !plannedLegacyIds.has(row.legacyId)) throw new Error("Recovery checkpoint contains an unexpected mapping");
    if (!isUuidV4(row.issueUuid)) throw new Error("Recovery checkpoint contains a non-v4 issue UUID");
    return { legacyId: row.legacyId, targetPlanKey: `issue:${row.legacyId}`, issueUuid: row.issueUuid, issueIdentifier: row.issueIdentifier, source: "receipt" };
  });
  for (const field of ["legacyId", "issueUuid", "issueIdentifier"] as const) {
    if (new Set(mappings.map((row) => row[field])).size !== mappings.length) throw new Error(`Recovery checkpoint duplicates ${field}`);
  }
  return mappings;
}

export function diffManagedRelations(
  desiredKeys: string[],
  current: ManagedRelation[],
  managedEndpointIds: Set<string>,
): RelationDiff {
  const desired = [...new Set(desiredKeys)].sort();
  const desiredSet = new Set(desired);
  const currentByKey = new Map<string, ManagedRelation>();
  for (const relation of current) {
    if (currentByKey.has(relation.key)) throw new Error(`Duplicate live relation ${relation.key}`);
    currentByKey.set(relation.key, relation);
  }
  const add = desired.filter((key) => !currentByKey.has(key));
  const remove = current.filter((relation) => !desiredSet.has(relation.key) && relation.endpointIds.every((id) => managedEndpointIds.has(id)));
  const preserve = current.filter((relation) => !desiredSet.has(relation.key) && !remove.some((candidate) => candidate.id === relation.id));
  if (preserve.length) throw new Error(`Refusing to alter unowned relation ${preserve[0].key}`);
  return { add, remove, preserve, desired };
}

export async function executeGuardedMutation<TBefore, TAfter>(
  operation: MutationOperation<TBefore, TAfter>,
  journal: JournalSink,
  sequence: number,
): Promise<TAfter> {
  const beforeRecord: JournalRecord = {
    sequence,
    operationId: operation.operationId,
    action: operation.action,
    targetUuid: operation.targetUuid,
    phase: "before",
    expectedFingerprint: operation.expectedFingerprint,
    actualFingerprint: null,
    compensation: operation.compensation,
    error: null,
  };
  await journal.appendBackup({ ...beforeRecord, before: operation.before, after: null });
  await journal.appendRedacted(beforeRecord);

  let mutationError: unknown = null;
  try {
    await operation.mutateOnce();
  } catch (error) {
    mutationError = error;
  }
  let after: TAfter | null = null;
  let readError: unknown = null;
  try {
    after = await operation.readAfter();
  } catch (error) {
    readError = error;
  }
  const actualFingerprint = readError ? null : operation.fingerprintAfter(after);
  if (!readError && actualFingerprint === operation.expectedFingerprint && (after !== null || operation.allowNullAfter === true)) {
    const verified: JournalRecord = { ...beforeRecord, phase: "verified", actualFingerprint, error: mutationError ? String(mutationError) : null };
    await journal.appendBackup({ ...verified, before: operation.before, after });
    await journal.appendRedacted(verified);
    await journal.checkpoint(operation.operationId, actualFingerprint);
    return after as TAfter;
  }
  const message = readError ? String(readError) : mutationError ? String(mutationError) : "post-write fingerprint mismatch";
  const ambiguous: JournalRecord = { ...beforeRecord, phase: "ambiguous", actualFingerprint, error: message };
  await journal.appendBackup({ ...ambiguous, before: operation.before, after });
  await journal.appendRedacted(ambiguous);
  throw new AmbiguousMutationError(`${operation.operationId} stopped after one mutation attempt: ${message}`);
}

export interface CompensationStep {
  operationId: string;
  action: string;
  originalAction?: MutationAction;
  targetUuid: string;
  onlyIfFingerprint: string;
  restoredFingerprint: string;
  restore: Record<string, unknown>;
}

export function buildCompensationPlan(records: Array<JournalRecord & { before?: unknown; after?: unknown }>): CompensationStep[] {
  const verified = records.filter((record) => record.phase === "verified");
  return verified.reverse().map((record) => ({
    operationId: record.operationId,
    action: record.action === "issue_create" ? "archive_created_issue" : record.action === "relation_create" ? "delete_created_relation" : record.action === "relation_delete" ? "restore_deleted_relation" : record.action === "document_create" ? "unsupported_created_document" : "restore_previous_state",
    originalAction: record.action,
    targetUuid: record.targetUuid,
    onlyIfFingerprint: record.actualFingerprint!,
    restoredFingerprint: createHash("sha256").update(JSON.stringify(record.before ?? null)).digest("hex"),
    restore: { before: record.before ?? null, compensation: record.compensation },
  }));
}

export async function runSerial<T>(values: T[], operation: (value: T, index: number) => Promise<void>): Promise<void> {
  for (let index = 0; index < values.length; index += 1) await operation(values[index], index);
}

export interface RelationPage<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export async function collectPaginatedRelations<T>(
  fetchPage: (direction: "forward" | "inverse", cursor: string | null) => Promise<RelationPage<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  for (const direction of ["forward", "inverse"] as const) {
    let cursor: string | null = null;
    do {
      const page = await fetchPage(direction, cursor);
      rows.push(...page.nodes);
      if (!page.pageInfo.hasNextPage) break;
      if (!page.pageInfo.endCursor || page.pageInfo.endCursor === cursor) throw new Error(`${direction} relation pagination did not advance`);
      cursor = page.pageInfo.endCursor;
    } while (true);
  }
  return rows;
}

export function assertExactTwoPassReadback<T>(expected: T, first: T, second: T): void {
  const serializedExpected = JSON.stringify(expected);
  if (JSON.stringify(first) !== serializedExpected) throw new Error("first readback differs from the exact migration plan");
  if (JSON.stringify(second) !== serializedExpected) throw new Error("second readback differs from the exact migration plan");
}

export function projectGlobalRelationKeys(managedIdentifiers: Set<string>, relationKeys: string[]): Map<string, string[]> {
  const projected = new Map([...managedIdentifiers].map((identifier) => [identifier, new Set<string>()]));
  for (const key of new Set(relationKeys)) {
    const [type, left, right, ...rest] = key.split(":");
    if (rest.length || !left || !right || !["blocks", "related", "similar", "duplicate"].includes(type)) throw new Error(`Invalid canonical relation key ${key}`);
    if (managedIdentifiers.has(left)) projected.get(left)!.add(key);
    if (managedIdentifiers.has(right)) projected.get(right)!.add(key);
  }
  return new Map([...projected].map(([identifier, keys]) => [identifier, [...keys].sort()]));
}

export interface WriteContext {
  repository: string;
  ref: string;
  actualSha: string;
  expectedSha: string;
  actualPlanSha: string;
  expectedPlanSha: string;
  environment: string;
  confirmation: string;
}

export function assertWriteContext(context: WriteContext): void {
  if (context.repository !== "meetblakey/sourcera" || context.ref !== "refs/heads/main") throw new Error("Writes require verified protected main");
  if (!context.actualSha || context.actualSha !== context.expectedSha) throw new Error("Checked-out SHA differs from expected SHA");
  if (!context.actualPlanSha || context.actualPlanSha !== context.expectedPlanSha) throw new Error("Plan SHA differs from expected plan SHA");
  if (context.environment !== "linear-authority-migration") throw new Error("Migration environment is not approved");
  if (context.confirmation !== "MIGRATE_LINEAR_AUTHORITY") throw new Error("Explicit migration confirmation is missing");
}

export function assertWorkflowWriteFree(workflow: string): void {
  const unsafePatterns = [
    /(^|\n)\s*linear-authority-migration\s*:/,
    /migrate-linear-authority\.ts/,
    /linear_authority_migration/,
  ];
  if (unsafePatterns.some((pattern) => pattern.test(workflow))) throw new Error("Delivery workflow contains a Linear write trigger");
}

export function assertPhase1WriteModeAllowed(mode: string): void {
  if (["preflight", "apply", "compensate"].includes(mode)) {
    throw new Error("Phase-1 execution is disabled until an external digest-pinned UUIDv4 allocation manifest and bounded header-budgeted chunk/resume are implemented and reviewed");
  }
}

export interface CompensationExecutor {
  readFingerprint(step: CompensationStep): Promise<string>;
  mutateOnce(step: CompensationStep): Promise<void>;
}

export async function executeCompensationPlan(steps: CompensationStep[], executor: CompensationExecutor): Promise<void> {
  await runSerial(steps, async (step) => {
    const before = await executor.readFingerprint(step);
    if (before !== step.onlyIfFingerprint) throw new Error(`Compensation fingerprint changed for ${step.operationId}`);
    await executor.mutateOnce(step);
    const after = await executor.readFingerprint(step);
    if (after !== step.restoredFingerprint) throw new Error(`Compensation readback mismatch for ${step.operationId}`);
  });
}
