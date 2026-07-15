import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import { validateGraph } from "./lib/graph.js";
import { r0DependencyClosure } from "./lib/release-policy.js";
import type { ManifestRow, ReleaseDefinition } from "./lib/model.js";
import { validateReleases } from "./lib/releases.js";
import { parseFeatureInventory } from "./lib/sources.js";

const releases = ["R0", "R1", "R2", "R3", "R4", "R5"].map(
  (id, sequence) => ({
    id,
    name: id,
    sequence,
    customerHypothesis: "customer",
    operationalHypothesis: "operations",
    pilot: "pilot",
    metrics: ["completion"],
    customerGate: "customer proof",
    operationalGate: "operations proof",
  }),
) as ReleaseDefinition[];

const row = (
  id: string,
  release: ManifestRow["release"],
  dependencies: string[],
): ManifestRow => ({
  requirementId: id,
  outcome: id,
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "7.1.0a",
  section: "§1",
  dependencies,
  disposition: "executable",
  release,
  issueId: null,
});

test("accepts same-or-earlier release dependencies", () => {
  assert.deepEqual(
    validateGraph([row("A", "R0", []), row("B", "R1", ["A"])], releases),
    [],
  );
});

test("rejects cycles and later-release dependencies", () => {
  const findings = validateGraph(
    [row("A", "R0", ["B"]), row("B", "R1", ["A"])],
    releases,
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set(["dependency_cycle", "cross_release_inversion"]),
  );
});

test("rejects unknown dependencies and invalid release definitions", () => {
  assert.equal(validateGraph([row("A", "R0", ["missing"])], releases)[0].code, "missing_dependency");
  const invalid = releases.map((release) => ({ ...release }));
  invalid[1].sequence = 4;
  invalid[2].customerGate = "";
  assert.deepEqual(
    new Set(validateReleases(invalid).map((finding) => finding.code)),
    new Set(["release_order_invalid", "release_validation_incomplete"]),
  );
});

test("normalized feature inventory preserves every row and has a coherent dependency graph", () => {
  const originalRows = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  );
  const repairs = (
    JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as {
      repairs: FeatureDependencyRepair[];
    }
  ).repairs;
  const normalizedRows = applyFeatureDependencies(originalRows, repairs);
  const inventory = normalizedRows.map((requirement) => ({
    ...requirement,
    release: null,
    issueId: null,
  }));

  assert.equal(normalizedRows.length, originalRows.length);
  assert.deepEqual(
    normalizedRows.map((requirement) => requirement.requirementId),
    originalRows.map((requirement) => requirement.requirementId),
  );
  for (const [index, original] of originalRows.entries()) {
    for (const dependencyId of original.dependencies) {
      assert.equal(
        normalizedRows[index].dependencies.includes(dependencyId),
        true,
        `${original.requirementId} lost ${dependencyId}`,
      );
    }
  }
  assert.deepEqual(validateGraph(inventory, releases), []);
});

test("repaired R0 closure contains every journey root and required control", () => {
  const originalRows = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  );
  const repairs = (
    JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as {
      repairs: FeatureDependencyRepair[];
    }
  ).repairs;
  const normalizedRows = applyFeatureDependencies(originalRows, repairs);
  const roots = [
    "F-083", "F-085", "F-086", "F-087", "F-088", "F-101", "F-214",
    "F-215", "F-105", "F-106", "F-387", "F-389", "F-559", "F-560",
    "F-687", "F-688", "F-689", "F-690", "F-691", "F-692", "F-693",
    "F-694", "F-220", "F-225", "F-226", "F-228", "F-229", "F-209",
  ];
  const closure = r0DependencyClosure(normalizedRows, roots);

  for (const id of roots) assert.equal(closure.has(id), true, id);
  for (const id of [
    "F-003", "F-006", "F-047", "F-079", "F-084", "F-138", "F-159",
    "F-160", "F-170", "F-221", "F-252", "F-260", "F-396",
    "F-397", "F-409", "F-502", "F-569", "F-572", "F-593", "F-600",
    "F-603", "F-605", "F-607", "F-612", "F-628", "F-630", "F-751",
    "F-752", "F-753", "F-755", "F-774", "F-775", "F-776", "F-779",
    "F-780", "F-789", "F-791",
  ]) assert.equal(closure.has(id), true, id);
});
