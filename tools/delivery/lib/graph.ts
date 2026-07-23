import type {
  Finding,
  ManifestRow,
  ReleaseDefinition,
} from "./model.js";

export function validateGraph(
  rows: ManifestRow[],
  releases: ReleaseDefinition[],
): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(rows.map((row) => [row.requirementId, row]));
  const sequence = new Map(
    releases.map((release) => [release.id, release.sequence]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, trail: string[]) => {
    if (visiting.has(id)) {
      findings.push({
        code: "dependency_cycle",
        requirementId: id,
        message: `Cycle: ${[...trail, id].join(" -> ")}`,
      });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const row = byId.get(id);
    for (const dependencyId of row?.dependencies ?? []) {
      const dependency = byId.get(dependencyId);
      if (!dependency) {
        findings.push({
          code: "missing_dependency",
          requirementId: id,
          message: `${id} depends on unknown ${dependencyId}`,
        });
        continue;
      }
      if (
        row?.release &&
        dependency.release &&
        (sequence.get(dependency.release) ?? 99) >
          (sequence.get(row.release) ?? -1)
      ) {
        findings.push({
          code: "cross_release_inversion",
          requirementId: id,
          message: `${id} ${row.release} depends on ${dependencyId} ${dependency.release}`,
        });
      }
      visit(dependencyId, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const row of rows) visit(row.requirementId, []);
  return findings;
}
