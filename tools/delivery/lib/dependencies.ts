import { validateGraph } from "./graph.js";
import type { Finding, ManifestRow, SourceRequirement } from "./model.js";

export interface FeatureDependencyRepair {
  requirementId: string;
  dependencies: string[];
  rationale: string;
  sourceDoc: string;
  sourceVersion: string;
  sourceSection: string;
}

const compareIds = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function normalizedRows<T extends SourceRequirement>(
  rows: T[],
  repairs: FeatureDependencyRepair[],
): T[] {
  const repairedDependencies = new Map<string, Set<string>>();
  for (const repair of repairs) {
    const dependencies = repairedDependencies.get(repair.requirementId) ??
      new Set<string>();
    for (const dependencyId of repair.dependencies) dependencies.add(dependencyId);
    repairedDependencies.set(repair.requirementId, dependencies);
  }

  return rows.map((row) => ({
    ...row,
    dependencies: [
      ...new Set([
        ...row.dependencies,
        ...(repairedDependencies.get(row.requirementId) ?? []),
      ]),
    ].sort(compareIds),
  }));
}

export function dependencyRepairFindings(
  rows: SourceRequirement[],
  repairs: FeatureDependencyRepair[],
): Finding[] {
  const findings: Finding[] = [];
  const rowIds = new Set(rows.map((row) => row.requirementId));
  const repairCounts = new Map<string, number>();

  for (const repair of repairs) {
    repairCounts.set(
      repair.requirementId,
      (repairCounts.get(repair.requirementId) ?? 0) + 1,
    );
  }
  for (const [requirementId, count] of [...repairCounts].sort(([left], [right]) =>
    compareIds(left, right),
  )) {
    if (count > 1) {
      findings.push({
        code: "feature_dependency_duplicate",
        requirementId,
        message: `${requirementId} has duplicate dependency repair rows`,
      });
    }
  }

  for (const repair of repairs) {
    if (!rowIds.has(repair.requirementId)) {
      findings.push({
        code: "feature_dependency_unknown",
        requirementId: repair.requirementId,
        message: `${repair.requirementId} is not a canonical feature`,
      });
    }
    for (const dependencyId of [...new Set(repair.dependencies)].sort(compareIds)) {
      if (!rowIds.has(dependencyId)) {
        findings.push({
          code: "feature_dependency_unknown",
          requirementId: repair.requirementId,
          message: `${repair.requirementId} depends on unknown ${dependencyId}`,
        });
      }
    }
  }

  for (const repair of repairs) {
    if (repair.dependencies.includes(repair.requirementId)) {
      findings.push({
        code: "feature_dependency_self",
        requirementId: repair.requirementId,
        message: `${repair.requirementId} cannot depend on itself`,
      });
    }
  }

  for (const repair of repairs) {
    if (
      !repair.rationale.trim() ||
      !repair.sourceDoc.trim() ||
      !repair.sourceVersion.trim() ||
      !repair.sourceSection.trim()
    ) {
      findings.push({
        code: "feature_dependency_source_missing",
        requirementId: repair.requirementId,
        message: `${repair.requirementId} lacks rationale or an exact source pin`,
      });
    }
  }

  if (findings.length) return findings;

  const manifest: ManifestRow[] = normalizedRows(rows, repairs).map((row) => ({
    ...row,
    release: null,
    issueId: null,
  }));
  return validateGraph(manifest, []).filter(
    (finding) => finding.code === "dependency_cycle",
  );
}

export function applyFeatureDependencies<T extends SourceRequirement>(
  rows: T[],
  repairs: FeatureDependencyRepair[],
): T[] {
  const findings = dependencyRepairFindings(rows, repairs);
  if (findings.length) {
    throw new Error(
      `Feature dependency repairs invalid:\n${findings
        .map((finding) => `${finding.code}: ${finding.message}`)
        .join("\n")}`,
    );
  }
  return normalizedRows(rows, repairs);
}
