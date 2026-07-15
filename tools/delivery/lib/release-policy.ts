import { validateGraph } from "./graph.js";
import type {
  Finding,
  ManifestRow,
  ReleaseAssignment,
  ReleaseDefinition,
  ReleaseId,
  ReleasePolicy,
  SourceRequirement,
} from "./model.js";

const compareIds = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function counts(values: string[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const value of values) result.set(value, (result.get(value) ?? 0) + 1);
  return result;
}

export function r0DependencyClosure(
  rows: SourceRequirement[],
  roots: string[],
): Set<string> {
  const byId = new Map(rows.map((row) => [row.requirementId, row]));
  const closure = new Set<string>();

  const visit = (requirementId: string): void => {
    if (closure.has(requirementId) || !byId.has(requirementId)) return;
    closure.add(requirementId);
    const dependencies = [...(byId.get(requirementId)?.dependencies ?? [])].sort(
      compareIds,
    );
    for (const dependencyId of dependencies) visit(dependencyId);
  };

  for (const root of [...roots].sort(compareIds)) visit(root);
  return closure;
}

export function releasePolicyFindings(
  rows: SourceRequirement[],
  policy: ReleasePolicy,
  releases: ReleaseDefinition[],
): Finding[] {
  const findings: Finding[] = [];
  const rowCounts = counts(rows.map((row) => row.requirementId));
  const assignmentCounts = counts(
    policy.baselineAssignments.map((assignment) => assignment.requirementId),
  );
  const rowIds = new Set(rowCounts.keys());
  const releaseIds = new Set(releases.map((release) => release.id));

  for (const requirementId of [...rowIds].sort(compareIds)) {
    if (!assignmentCounts.has(requirementId)) {
      findings.push({
        code: "release_policy_unclassified",
        requirementId,
        message: `${requirementId} has no baseline release assignment`,
      });
    }
  }

  for (const assignment of policy.baselineAssignments) {
    if (!rowIds.has(assignment.requirementId)) {
      findings.push({
        code: "release_policy_unclassified",
        requirementId: assignment.requirementId,
        message: `${assignment.requirementId} is not a canonical feature`,
      });
    }
    if (!releaseIds.has(assignment.release)) {
      findings.push({
        code: "release_policy_unclassified",
        requirementId: assignment.requirementId,
        message: `${assignment.requirementId} has unknown release ${assignment.release}`,
      });
    }
  }

  const duplicateIds = new Set<string>();
  for (const [requirementId, count] of rowCounts) {
    if (count > 1) duplicateIds.add(requirementId);
  }
  for (const [requirementId, count] of assignmentCounts) {
    if (count > 1) duplicateIds.add(requirementId);
  }
  for (const requirementId of [...duplicateIds].sort(compareIds)) {
    findings.push({
      code: "release_policy_duplicate",
      requirementId,
      message: `${requirementId} occurs more than once`,
    });
  }

  for (const root of [...new Set(policy.r0Roots)].sort(compareIds)) {
    if (!rowIds.has(root)) {
      findings.push({
        code: "release_policy_root_missing",
        requirementId: root,
        message: `R0 root ${root} is not a canonical feature`,
      });
    }
  }

  const graphRows: ManifestRow[] = rows.map((row) => ({
    ...row,
    release: null,
    issueId: null,
  }));
  findings.push(...validateGraph(graphRows, releases));

  const closure = r0DependencyClosure(rows, policy.r0Roots);
  for (const assignment of policy.baselineAssignments) {
    if (assignment.release === "R0" && !closure.has(assignment.requirementId)) {
      findings.push({
        code: "release_policy_unexpected_r0",
        requirementId: assignment.requirementId,
        message: `${assignment.requirementId} is R0 but outside the approved closure`,
      });
    }
  }

  return findings;
}

function fail(findings: Finding[]): never {
  throw new Error(
    `Release policy invalid:\n${findings
      .map((finding) => `${finding.code}: ${finding.message}`)
      .join("\n")}`,
  );
}

export function buildReleaseAssignments(
  features: SourceRequirement[],
  runtimeGates: SourceRequirement[],
  policy: ReleasePolicy,
  runtimeOwners: Array<{ requirementId: string; dependencies: string[] }>,
  releases: ReleaseDefinition[],
): ReleaseAssignment[] {
  const findings = releasePolicyFindings(features, policy, releases);
  if (findings.length) fail(findings);

  const baselineById = new Map(
    policy.baselineAssignments.map((assignment) => [
      assignment.requirementId,
      assignment,
    ]),
  );
  const closure = r0DependencyClosure(features, policy.r0Roots);
  const assignments: ReleaseAssignment[] = [];
  const finalById = new Map<string, ReleaseAssignment>();

  const addFeature = (requirementId: string): void => {
    const baseline = baselineById.get(requirementId);
    if (!baseline) return;
    const assignment = {
      ...baseline,
      release: closure.has(requirementId) ? ("R0" as const) : baseline.release,
    };
    assignments.push(assignment);
    finalById.set(requirementId, assignment);
  };

  for (const requirementId of closure) addFeature(requirementId);
  for (const requirementId of features
    .map((feature) => feature.requirementId)
    .filter((requirementId) => !closure.has(requirementId))
    .sort(compareIds)) {
    addFeature(requirementId);
  }

  const runtimeCounts = counts(
    runtimeGates.map((runtimeGate) => runtimeGate.requirementId),
  );
  const runtimeIds = new Set(runtimeCounts.keys());
  const runtimeFindings: Finding[] = [];
  for (const [requirementId, count] of runtimeCounts) {
    if (count > 1) {
      runtimeFindings.push({
        code: "release_policy_duplicate",
        requirementId,
        message: `${requirementId} occurs more than once`,
      });
    }
  }

  const ownerDependencies = new Map<string, Set<string>>();
  for (const owner of runtimeOwners) {
    if (!runtimeIds.has(owner.requirementId)) {
      runtimeFindings.push({
        code: "release_policy_unclassified",
        requirementId: owner.requirementId,
        message: `${owner.requirementId} is not a live runtime gate`,
      });
      continue;
    }
    const dependencies = ownerDependencies.get(owner.requirementId) ?? new Set();
    for (const dependencyId of owner.dependencies) dependencies.add(dependencyId);
    ownerDependencies.set(owner.requirementId, dependencies);
  }

  const releaseSequence = new Map<ReleaseId, number>(
    releases.map((release) => [release.id, release.sequence]),
  );
  const runtimeAssignments: ReleaseAssignment[] = [];
  for (const requirementId of [...runtimeIds].sort(compareIds)) {
    const dependencies = [...(ownerDependencies.get(requirementId) ?? [])].sort(
      compareIds,
    );
    if (!dependencies.length) {
      runtimeFindings.push({
        code: "release_policy_unclassified",
        requirementId,
        message: `${requirementId} has no explicit behavior owner`,
      });
      continue;
    }
    const dependencyAssignments = dependencies.map((dependencyId) => {
      const assignment = finalById.get(dependencyId);
      if (!assignment) {
        runtimeFindings.push({
          code: "release_policy_unclassified",
          requirementId,
          message: `${requirementId} references unassigned owner ${dependencyId}`,
        });
      }
      return assignment;
    });
    if (dependencyAssignments.some((assignment) => !assignment)) continue;

    const latest = dependencyAssignments.reduce((candidate, assignment) =>
      (releaseSequence.get(assignment!.release) ?? -1) >
      (releaseSequence.get(candidate!.release) ?? -1)
        ? assignment
        : candidate,
    );
    runtimeAssignments.push({
      requirementId,
      release: latest!.release,
      rationale: `${latest!.release}: runtime proof follows ${dependencies.join(", ")}.`,
    });
  }

  if (runtimeFindings.length) fail(runtimeFindings);
  return [...assignments, ...runtimeAssignments];
}
