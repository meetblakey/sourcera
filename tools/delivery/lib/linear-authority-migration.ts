import { createHash } from "node:crypto";

export interface ManagedPlanRow {
  legacyId: string;
  targetPlanKey: string;
  title: string;
  primaryExecutionIdentifier: string | null;
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

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4(value: string): boolean {
  return UUID_V4.test(value);
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
    if (!plan || !live || live.teamId !== teamId || live.title !== plan.title || mapping.issueIdentifier !== live.identifier) {
      throw new Error(`Stable mapping mismatch for ${mapping.legacyId}`);
    }
    if (claimedLive.has(live.id)) throw new Error(`Live issue ${live.id} is mapped more than once`);
    claimedLive.add(live.id);
    mappings.set(mapping.legacyId, { ...mapping, targetPlanKey: plan.targetPlanKey, issueIdentifier: live.identifier, source: "receipt" });
  }

  for (const live of liveIssues.filter((row) => row.teamId === teamId && !claimedLive.has(row.id))) {
    const candidates = plans.filter((plan) => plan.primaryExecutionIdentifier !== null && live.relationKeys.some((key) => {
      const [type, left, right, ...rest] = key.split(":");
      return type === "related" && rest.length === 0 && (left === plan.primaryExecutionIdentifier || right === plan.primaryExecutionIdentifier);
    }));
    if (candidates.length !== 1) throw new Error(`Live issue ${live.identifier} has ${candidates.length} stable mapping candidates`);
    const plan = candidates[0];
    if (live.title !== plan.title || mappings.has(plan.legacyId)) throw new Error(`Stable mapping collision for ${plan.legacyId}`);
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
