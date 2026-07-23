import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  applyFeatureDependencies,
  dependencyRepairFindings,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import type { SourceRequirement } from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";

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

function canonicalGraph() {
  const root = process.cwd();
  const sourceRows = parseFeatureInventory(
    readFileSync(join(root, "_audit/FEATURE_INVENTORY.md"), "utf8"),
  );
  const repairs = (
    JSON.parse(
      readFileSync(join(root, "delivery/feature-dependencies.json"), "utf8"),
    ) as { repairs: FeatureDependencyRepair[] }
  ).repairs;
  return {
    sourceRows,
    repairedRows: applyFeatureDependencies(sourceRows, repairs),
  };
}

const semanticDependencies = [
  ["F-211", ["F-209", "F-210", "F-235", "F-236", "F-237", "F-238"]],
  ["F-212", ["F-209", "F-211"]],
  ["F-213", ["F-209", "F-212"]],
  ["F-214", ["F-209", "F-213", "F-791"]],
  ["F-215", ["F-209", "F-214", "F-397", "F-409", "F-774", "F-775"]],
  ["F-217", ["F-209", "F-215"]],
  ["F-218", ["F-209", "F-217"]],
  ["F-219", ["F-209", "F-218"]],
  ["F-220", ["F-088", "F-209", "F-219", "F-260"]],
  ["F-223", ["F-209", "F-220"]],
  ["F-225", ["F-209", "F-221", "F-223", "F-224"]],
  ["F-228", ["F-209", "F-225", "F-226", "F-776"]],
  [
    "F-725",
    [
      "F-008",
      "F-117",
      "F-119",
      "F-123",
      "F-124",
      "F-132",
      "F-160",
      "F-483",
      "F-499",
      "F-600",
      "F-697",
      "F-701",
      "F-726",
      "F-727",
      "F-728",
      "F-729",
      "F-730",
      "F-779",
      "F-780",
    ],
  ],
] as const;

for (const [requirementId, dependencies] of semanticDependencies) {
  test(`${requirementId} has every direct semantic predecessor`, () => {
    const { repairedRows } = canonicalGraph();
    const repaired = repairedRows.find(
      (candidate) => candidate.requirementId === requirementId,
    );
    assert.ok(repaired);
    assert.deepEqual(repaired.dependencies, dependencies);
  });
}

test("F-229 keeps F-228 as its terminal predecessor", () => {
  const { repairedRows } = canonicalGraph();
  const terminal = repairedRows.find(
    (candidate) => candidate.requirementId === "F-229",
  );
  assert.ok(terminal);
  assert.deepEqual(terminal.dependencies, ["F-170", "F-228", "F-593", "F-607"]);
});

test("dependency repairs preserve every source ID and source pin", () => {
  const { sourceRows, repairedRows } = canonicalGraph();
  const sourceIdentity = (candidate: SourceRequirement) => ({
    requirementId: candidate.requirementId,
    sourceDoc: candidate.sourceDoc,
    sourceVersion: candidate.sourceVersion,
    section: candidate.section,
  });
  assert.deepEqual(repairedRows.map(sourceIdentity), sourceRows.map(sourceIdentity));
});
