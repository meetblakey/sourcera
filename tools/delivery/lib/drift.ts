import type { Finding, ManifestRow } from "./model.js";

interface IssueRef {
  id: string;
  sourceId: string | null;
  sourceFamilyId?: string | null;
  title: string;
  outcome: string | null;
  dependencies?: string[];
  release?: ManifestRow["release"];
}

export function driftFindings(
  manifest: ManifestRow[],
  issues: IssueRef[],
): Finding[] {
  const findings: Finding[] = [];
  const issueSources = new Set(
    issues.map((issue) => issue.sourceId).filter(Boolean),
  );
  const manifestById = new Map(
    manifest.map((row) => [row.requirementId, row]),
  );
  const dependenciesByFamily = new Map<string, Set<string>>();
  for (const issue of issues) {
    const sourceFamilyId = issue.sourceFamilyId ?? issue.sourceId;
    if (!sourceFamilyId) continue;
    const dependencies = dependenciesByFamily.get(sourceFamilyId) ?? new Set<string>();
    for (const dependency of issue.dependencies ?? []) {
      if (dependency !== sourceFamilyId) dependencies.add(dependency);
    }
    dependenciesByFamily.set(sourceFamilyId, dependencies);
  }
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
    if (
      row &&
      JSON.stringify([...row.dependencies].sort()) !==
        JSON.stringify([...(dependenciesByFamily.get(issue.sourceId) ?? [])].sort())
    ) {
      findings.push({
        code: "dependency_drift",
        issueId: issue.id,
        message: `${issue.id} dependency links differ from ${issue.sourceId}`,
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
