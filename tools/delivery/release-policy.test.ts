import { strict as assert } from "node:assert";
import test from "node:test";
import {
  buildReleaseAssignments,
  releasePolicyFindings,
} from "./lib/release-policy.js";
import type {
  Finding,
  ReleaseAssignment,
  ReleaseDefinition,
  ReleaseId,
  ReleasePolicy,
  SourceRequirement,
} from "./lib/model.js";

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

const row = (id: string, dependencies: string[] = []): SourceRequirement => ({
  requirementId: id,
  outcome: id,
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "7.1.0a",
  section: "§1",
  dependencies,
  disposition: "executable",
});

const rows = [
  row("F-ROOT", ["F-DEPENDENCY"]),
  row("F-DEPENDENCY"),
  row("F-OWNER-R2"),
];

const runtime = [row("RG:root-proof"), row("RG:proof")];

const policy: ReleasePolicy = {
  schemaVersion: 1,
  r0Roots: ["F-ROOT"],
  baselineAssignments: [
    { requirementId: "F-ROOT", release: "R1", rationale: "root" },
    {
      requirementId: "F-DEPENDENCY",
      release: "R1",
      rationale: "dependency",
    },
    { requirementId: "F-OWNER-R2", release: "R2", rationale: "later owner" },
  ],
};

const owners = [
  { requirementId: "RG:root-proof", dependencies: ["F-ROOT"] },
  {
    requirementId: "RG:proof",
    dependencies: ["F-ROOT", "F-OWNER-R2"],
  },
];

function idsIn(assignments: ReleaseAssignment[], release: ReleaseId): string[] {
  return assignments
    .filter((candidate) => candidate.release === release)
    .map((candidate) => candidate.requirementId);
}

function codes(findings: Finding[]): Set<string> {
  return new Set(findings.map((finding) => finding.code));
}

const invalidRows = [
  row("F-DUP", ["F-CYCLE"]),
  row("F-CYCLE", ["F-DUP"]),
];

const invalidPolicy: ReleasePolicy = {
  schemaVersion: 1,
  r0Roots: ["F-MISSING"],
  baselineAssignments: [
    { requirementId: "F-DUP", release: "R0", rationale: "first" },
    { requirementId: "F-DUP", release: "R1", rationale: "duplicate" },
    { requirementId: "F-CYCLE", release: "R1", rationale: "cycle" },
  ],
};

const findings = releasePolicyFindings(invalidRows, invalidPolicy, releases);

function assignment(requirementId: string): ReleaseAssignment {
  const found = buildReleaseAssignments(
    rows,
    runtime,
    policy,
    owners,
    releases,
  ).find((candidate) => candidate.requirementId === requirementId);
  assert.ok(found);
  return found;
}

test("R0 is exactly the approved roots and dependency closure", () => {
  const result = buildReleaseAssignments(rows, runtime, policy, owners, releases);
  assert.deepEqual(idsIn(result, "R0"), ["F-ROOT", "F-DEPENDENCY", "RG:root-proof"]);
});

test("unknown work fails instead of defaulting to R0", () => {
  assert.equal(releasePolicyFindings([...rows, row("F-NEW")], policy, releases)[0].code, "release_policy_unclassified");
});

test("duplicates, missing roots, cycles, and unexpected R0 fail", () => {
  assert.deepEqual(codes(findings), new Set([
    "release_policy_duplicate",
    "release_policy_root_missing",
    "dependency_cycle",
    "release_policy_unexpected_r0",
  ]));
});

test("runtime gates follow all explicit behavior owners", () => {
  assert.equal(assignment("RG:proof").release, "R2");
});

test("final release assignments reject dependency inversions", () => {
  const inversionRows = [
    row("F-R1", ["F-R5"]),
    row("F-R5"),
  ];
  const inversionPolicy: ReleasePolicy = {
    schemaVersion: 1,
    r0Roots: [],
    baselineAssignments: [
      { requirementId: "F-R1", release: "R1", rationale: "early" },
      { requirementId: "F-R5", release: "R5", rationale: "late" },
    ],
  };

  assert.throws(
    () =>
      buildReleaseAssignments(
        inversionRows,
        [],
        inversionPolicy,
        [],
        releases,
      ),
    /cross_release_inversion: F-R1 R1 depends on F-R5 R5/,
  );
});

test("missing dependencies fail", () => {
  const missingRows = [row("F-MISSING", ["F-UNKNOWN"])];
  const missingPolicy: ReleasePolicy = {
    schemaVersion: 1,
    r0Roots: [],
    baselineAssignments: [
      { requirementId: "F-MISSING", release: "R1", rationale: "feature" },
    ],
  };

  assert.deepEqual(
    codes(releasePolicyFindings(missingRows, missingPolicy, releases)),
    new Set(["missing_dependency"]),
  );
});
