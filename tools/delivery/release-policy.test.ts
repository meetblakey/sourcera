import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applyFeatureDependencies } from "./lib/dependencies.js";
import { releasePolicyFindings } from "./lib/release-policy.js";
import type {
  ReleaseDefinition,
  ReleasePolicy,
  SourceRequirement,
} from "./lib/model.js";
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

const policy: ReleasePolicy = {
  schemaVersion: 2,
  releaseAuthority: "linear_native",
  allowedReleaseIds: ["R0", "R1", "R2", "R3", "R4", "R5"],
  exactlyOneReleasePerMappedIssue: true,
  dependencyOrder: "prerequisite_not_later",
};

const row = (id: string, dependencies: string[] = []): SourceRequirement => ({
  requirementId: id,
  outcome: id,
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "v7.1.0a",
  section: "§1",
  dependencies,
  disposition: "executable",
});

test("release policy contains structural native-Linear rules only", () => {
  assert.deepEqual(releasePolicyFindings([row("F-001")], policy, releases), []);
});

test("release policy rejects embedded feature assignments and R0 roots", () => {
  const legacy = {
    ...policy,
    r0Roots: ["F-001"],
    baselineAssignments: [
      { requirementId: "F-001", release: "R0", rationale: "legacy" },
    ],
  } as unknown as ReleasePolicy;
  assert.ok(
    releasePolicyFindings([row("F-001")], legacy, releases).some(
      (finding) => finding.code === "release_policy_embedded_assignments",
    ),
  );
  assert.ok(
    releasePolicyFindings([row("F-001")], legacy, releases).some(
      (finding) => finding.code === "release_policy_shape",
    ),
  );
});

test("release policy pins its schema, native authority, cardinality, order, and catalog", () => {
  const invalid = {
    schemaVersion: 1,
    releaseAuthority: "repository",
    allowedReleaseIds: ["R0", "R2"],
    exactlyOneReleasePerMappedIssue: false,
    dependencyOrder: "unspecified",
  } as unknown as ReleasePolicy;
  assert.deepEqual(
    new Set(
      releasePolicyFindings([], invalid, releases).map((finding) => finding.code),
    ),
    new Set([
      "release_policy_schema_version",
      "release_policy_authority",
      "release_policy_cardinality",
      "release_policy_dependency_order",
      "release_policy_release_catalog",
    ]),
  );
});

test("release policy keeps source graph completeness structural", () => {
  const findings = releasePolicyFindings(
    [
      row("F-001", ["F-002"]),
      row("F-001", ["F-002"]),
      row("F-002", ["F-003"]),
      row("F-003", ["F-002"]),
    ],
    policy,
    releases,
  );
  const codes = new Set(findings.map((finding) => finding.code));
  assert.ok(codes.has("release_policy_duplicate"));
  assert.ok(codes.has("dependency_cycle"));
});

test("canonical policy has no per-feature or R0 assignment authority", () => {
  const canonical = JSON.parse(
    readFileSync("delivery/release-policy.json", "utf8"),
  ) as ReleasePolicy & Record<string, unknown>;
  assert.deepEqual(Object.keys(canonical).sort(), [
    "allowedReleaseIds",
    "dependencyOrder",
    "exactlyOneReleasePerMappedIssue",
    "releaseAuthority",
    "schemaVersion",
  ]);
  assert.equal(Object.hasOwn(canonical, "baselineAssignments"), false);
  assert.equal(Object.hasOwn(canonical, "r0Roots"), false);
});

test("canonical structural policy accepts the complete executable source graph", () => {
  const canonical = JSON.parse(
    readFileSync("delivery/release-policy.json", "utf8"),
  ) as ReleasePolicy;
  const repairs = JSON.parse(
    readFileSync("delivery/feature-dependencies.json", "utf8"),
  ) as Parameters<typeof applyFeatureDependencies>[1] extends infer T
    ? { repairs: T }
    : never;
  const dispositions = JSON.parse(
    readFileSync("delivery/dispositions.json", "utf8"),
  ) as { overrides: Array<{ requirementId: string; disposition: SourceRequirement["disposition"] }> };
  const dispositionById = new Map(
    dispositions.overrides.map((entry) => [entry.requirementId, entry.disposition]),
  );
  const rows = applyFeatureDependencies(
    parseFeatureInventory(readFileSync("_audit/FEATURE_INVENTORY.md", "utf8")).map(
      (entry) => ({
        ...entry,
        disposition: dispositionById.get(entry.requirementId) ?? entry.disposition,
      }),
    ),
    repairs.repairs,
  );
  const executableIds = new Set(
    rows
      .filter((entry) => entry.disposition === "executable")
      .map((entry) => entry.requirementId),
  );
  const executableGraph = rows
    .filter((entry) => entry.disposition === "executable")
    .map((entry) => ({
      ...entry,
      dependencies: entry.dependencies.filter((dependencyId) =>
        executableIds.has(dependencyId),
      ),
    }));
  assert.deepEqual(releasePolicyFindings(executableGraph, canonical, releases), []);
});
