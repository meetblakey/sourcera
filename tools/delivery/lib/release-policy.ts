import { validateGraph } from "./graph.js";
import type {
  Finding,
  ManifestRow,
  ReleaseDefinition,
  ReleasePolicy,
  SourceRequirement,
} from "./model.js";

const compareIds = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

export function releasePolicyFindings(
  rows: SourceRequirement[],
  policy: ReleasePolicy,
  releases: ReleaseDefinition[],
): Finding[] {
  const findings: Finding[] = [];
  const value = policy as unknown as Record<string, unknown>;
  const expectedKeys = [
    "schemaVersion",
    "releaseAuthority",
    "allowedReleaseIds",
    "exactlyOneReleasePerMappedIssue",
    "dependencyOrder",
  ];
  if (
    Object.keys(value).length !== expectedKeys.length ||
    expectedKeys.some((key) => !Object.hasOwn(value, key))
  ) {
    findings.push({
      code: "release_policy_shape",
      message: "Release policy must contain only the canonical structural fields",
    });
  }

  if (value.schemaVersion !== 2) {
    findings.push({
      code: "release_policy_schema_version",
      message: `Release policy schemaVersion must be 2; received ${String(value.schemaVersion)}`,
    });
  }
  if (value.releaseAuthority !== "linear_native") {
    findings.push({
      code: "release_policy_authority",
      message: "Release policy must declare Linear native releases as its sole authority",
    });
  }
  if (value.exactlyOneReleasePerMappedIssue !== true) {
    findings.push({
      code: "release_policy_cardinality",
      message: "Release policy must require exactly one native release per mapped issue",
    });
  }
  if (value.dependencyOrder !== "prerequisite_not_later") {
    findings.push({
      code: "release_policy_dependency_order",
      message: "Release policy must require each prerequisite to be in the same or an earlier release",
    });
  }
  if (Object.hasOwn(value, "baselineAssignments") || Object.hasOwn(value, "r0Roots")) {
    findings.push({
      code: "release_policy_embedded_assignments",
      message: "Release policy cannot embed feature assignments or R0 source roots",
    });
  }

  const expectedReleaseIds = [...releases]
    .sort((left, right) => left.sequence - right.sequence)
    .map((release) => release.id);
  const allowedReleaseIds = Array.isArray(value.allowedReleaseIds)
    ? value.allowedReleaseIds.filter(
        (releaseId): releaseId is string => typeof releaseId === "string",
      )
    : [];
  if (
    allowedReleaseIds.length !== expectedReleaseIds.length ||
    allowedReleaseIds.some(
      (releaseId, index) => releaseId !== expectedReleaseIds[index],
    )
  ) {
    findings.push({
      code: "release_policy_release_catalog",
      message: `Release policy must mirror the ordered native release catalog: ${expectedReleaseIds.join(", ")}`,
    });
  }

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.requirementId, (counts.get(row.requirementId) ?? 0) + 1);
  }
  for (const [requirementId, count] of [...counts].sort(([left], [right]) =>
    compareIds(left, right),
  )) {
    if (count > 1) {
      findings.push({
        code: "release_policy_duplicate",
        requirementId,
        message: `${requirementId} occurs more than once in source truth`,
      });
    }
  }

  const graphRows: ManifestRow[] = rows.map((row) => ({
    ...row,
    release: null,
    issueId: null,
  }));
  findings.push(...validateGraph(graphRows, releases));
  return findings;
}
