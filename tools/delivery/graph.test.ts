import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import { validateGraph } from "./lib/graph.js";
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

test("F-916 declares its exact identity and PLG delivery predecessors", () => {
  const repairs = (
    JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as {
      repairs: FeatureDependencyRepair[];
    }
  ).repairs;
  const repair = repairs.find((row) => row.requirementId === "F-916");

  assert.deepEqual(repair?.dependencies, [
    "F-006",
    "F-008",
    "F-079",
    "F-080",
    "F-081",
    "F-099",
    "F-117",
    "F-125",
    "F-130",
    "F-511",
    "F-628",
    "F-755",
    "F-779",
    "F-780",
    "F-917",
  ]);
});

test("F-917 declares Organization, audit, security, and proof predecessors", () => {
  const repairs = (
    JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as {
      repairs: FeatureDependencyRepair[];
    }
  ).repairs;
  const repair = repairs.find((row) => row.requirementId === "F-917");

  assert.deepEqual(repair?.dependencies, [
    "F-079",
    "F-117",
    "F-502",
    "F-628",
  ]);
});
