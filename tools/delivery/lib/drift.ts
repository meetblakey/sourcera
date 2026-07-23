import type { Finding, ManifestRow } from "./model.js";

interface IssueRef {
  id: string;
  parentId?: string | null;
  sourceId: string | null;
  sourceFamilyId?: string | null;
  title: string;
  outcome: string | null;
  dependencies?: string[];
  release?: ManifestRow["release"];
}

interface NativeIssueGraph {
  issues: Array<{
    identifier: string;
    relations?: string[];
  }>;
}

function nativeReachability(graph: NativeIssueGraph): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>(
    graph.issues.map((issue) => [issue.identifier, new Set<string>()]),
  );
  for (const issue of graph.issues) {
    for (const relation of issue.relations ?? []) {
      const [type, prerequisite, dependent] = relation.split(":");
      if (type !== "blocks") continue;
      adjacency.get(prerequisite)?.add(dependent);
    }
  }
  const reachable = new Map<string, Set<string>>();
  for (const start of adjacency.keys()) {
    const seen = new Set<string>();
    const pending = [...(adjacency.get(start) ?? [])];
    while (pending.length) {
      const current = pending.pop()!;
      if (seen.has(current)) continue;
      seen.add(current);
      pending.push(...(adjacency.get(current) ?? []));
    }
    reachable.set(start, seen);
  }
  return reachable;
}

export function driftFindings(
  manifest: ManifestRow[],
  issues: IssueRef[],
  nativeGraph?: NativeIssueGraph,
): Finding[] {
  const findings: Finding[] = [];
  const issueSources = new Set(
    issues.map((issue) => issue.sourceId).filter(Boolean),
  );
  const manifestById = new Map(
    manifest.map((row) => [row.requirementId, row]),
  );
  const familyByIssue = new Map<string, string>();
  for (const issue of issues) {
    const sourceFamilyId = issue.sourceFamilyId ?? issue.sourceId;
    if (!sourceFamilyId) continue;
    familyByIssue.set(issue.id, sourceFamilyId);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const issue of issues) {
      if (familyByIssue.has(issue.id)) continue;
      const childFamilies = new Set(
        issues
          .filter((candidate) => candidate.parentId === issue.id)
          .map((candidate) => familyByIssue.get(candidate.id))
          .filter((family): family is string => Boolean(family)),
      );
      if (childFamilies.size === 1) {
        familyByIssue.set(issue.id, [...childFamilies][0]);
        changed = true;
      }
    }
  }
  const familyIssueIds = new Map<string, Set<string>>();
  for (const [issueId, sourceFamilyId] of familyByIssue) {
    const ids = familyIssueIds.get(sourceFamilyId) ?? new Set<string>();
    ids.add(issueId);
    familyIssueIds.set(sourceFamilyId, ids);
  }
  const reachability = nativeGraph ? nativeReachability(nativeGraph) : null;
  for (const row of manifest) {
    if (
      (row.disposition === "executable" ||
        row.requirementId.startsWith("RG:")) &&
      !issueSources.has(row.requirementId)
    ) {
      findings.push({
        code: "orphan_requirement",
        requirementId: row.requirementId,
        message: `${row.requirementId} has no issue`,
      });
    }
  }
  for (const issue of issues) {
    if (issue.sourceId && !manifestById.has(issue.sourceId)) {
      findings.push({
        code: "orphan_issue",
        issueId: issue.id,
        message: `${issue.id} points to unknown ${issue.sourceId}`,
      });
    }
    if (!issue.sourceId) continue;
    const row = manifestById.get(issue.sourceId);
    const missingDependencies = row?.dependencies.filter((dependency) => {
      if (!reachability) {
        return !(issue.dependencies ?? []).includes(dependency);
      }
      const prerequisiteIds = familyIssueIds.get(dependency) ?? new Set<string>();
      const dependentIds = familyIssueIds.get(issue.sourceId!) ?? new Set<string>();
      return ![...prerequisiteIds].some((prerequisiteId) =>
        [...dependentIds].some((dependentId) =>
          reachability.get(prerequisiteId)?.has(dependentId)
        )
      );
    }) ?? [];
    if (row && missingDependencies.length > 0) {
      findings.push({
        code: "dependency_drift",
        issueId: issue.id,
        message: `${issue.id} lacks native paths for ${missingDependencies.join(", ")} required by ${issue.sourceId}`,
      });
    }
    if (row && row.release !== (issue.release ?? null)) {
      findings.push({
        code: "release_drift",
        issueId: issue.id,
        message: `${issue.id} release differs from ${issue.sourceId}`,
      });
    }
  }

  const outcomes = new Map<string, { issueId: string; sourceFamilyId: string | null }>();
  for (const issue of issues) {
    const key = (issue.outcome ?? issue.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const sourceFamilyId = issue.sourceFamilyId ?? issue.sourceId;
    const prior = outcomes.get(key);
    if (prior && (!sourceFamilyId || prior.sourceFamilyId !== sourceFamilyId)) {
      findings.push({
        code: "duplicate_outcome",
        issueId: issue.id,
        message: `${issue.id} duplicates ${prior.issueId}`,
      });
    } else {
      outcomes.set(key, { issueId: issue.id, sourceFamilyId });
    }
  }
  return findings;
}
