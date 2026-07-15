import { strict as assert } from "node:assert";
import test from "node:test";
import {
  applyFeatureDependencies,
  dependencyRepairFindings,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import type { SourceRequirement } from "./lib/model.js";

const row = (id: string, dependencies: string[] = []): SourceRequirement => ({
  requirementId: id,
  outcome: id,
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "v7.1.0a",
  section: "§1",
  dependencies,
  disposition: "executable",
});

const repair = (
  requirementId: string,
  dependencies: string[],
  overrides: Partial<FeatureDependencyRepair> = {},
): FeatureDependencyRepair => ({
  requirementId,
  dependencies,
  rationale: "Source-proved prerequisite.",
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "v7.1.0a",
  sourceSection: "§1",
  ...overrides,
});

test("applies repairs additively and deterministically", () => {
  const rows = [row("F-ROOT", ["F-BASE"]), row("F-BASE"), row("F-CONTROL")];
  const normalized = applyFeatureDependencies(rows, [
    repair("F-ROOT", ["F-CONTROL", "F-BASE", "F-CONTROL"]),
  ]);

  assert.deepEqual(
    normalized.find((candidate) => candidate.requirementId === "F-ROOT")
      ?.dependencies,
    ["F-BASE", "F-CONTROL"],
  );
  assert.equal(normalized.length, rows.length);
  assert.deepEqual(
    normalized.map((candidate) => candidate.requirementId),
    rows.map((candidate) => candidate.requirementId),
  );
  assert.deepEqual(rows[0].dependencies, ["F-BASE"]);
});

test("rejects duplicate repair rows", () => {
  const rows = [row("F-ROOT"), row("F-CONTROL")];
  const findings = dependencyRepairFindings(rows, [
    repair("F-ROOT", ["F-CONTROL"]),
    repair("F-ROOT", ["F-CONTROL"]),
  ]);
  assert.equal(findings[0]?.code, "feature_dependency_duplicate");
});

test("rejects unknown repair endpoints", () => {
  const rows = [row("F-ROOT")];
  const findings = dependencyRepairFindings(rows, [
    repair("F-ROOT", ["F-UNKNOWN"]),
  ]);
  assert.equal(findings[0]?.code, "feature_dependency_unknown");
});

test("rejects self-dependencies", () => {
  const rows = [row("F-ROOT")];
  const findings = dependencyRepairFindings(rows, [
    repair("F-ROOT", ["F-ROOT"]),
  ]);
  assert.equal(findings[0]?.code, "feature_dependency_self");
});

test("rejects empty rationale and source pins", () => {
  const rows = [row("F-ROOT"), row("F-CONTROL")];
  const findings = dependencyRepairFindings(rows, [
    repair("F-ROOT", ["F-CONTROL"], {
      rationale: " ",
      sourceVersion: "",
    }),
  ]);
  assert.equal(findings[0]?.code, "feature_dependency_source_missing");
});

test("rejects a cycle introduced by a repair", () => {
  const rows = [row("F-ROOT"), row("F-CONTROL", ["F-ROOT"])];
  const findings = dependencyRepairFindings(rows, [
    repair("F-ROOT", ["F-CONTROL"]),
  ]);
  assert.equal(findings[0]?.code, "dependency_cycle");
});

test("apply fails closed when a repair is invalid", () => {
  assert.throws(
    () =>
      applyFeatureDependencies(
        [row("F-ROOT")],
        [repair("F-ROOT", ["F-UNKNOWN"])],
      ),
    /feature_dependency_unknown/,
  );
});
