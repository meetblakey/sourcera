import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  linearCandidateFindings,
  type LinearSnapshotCandidate,
} from "./lib/linear-candidate.js";
import type { ReleaseDefinition } from "./lib/model.js";

const releases: ReleaseDefinition[] = [
  {
    id: "R0",
    name: "First Defensible Evaluation",
    sequence: 0,
    customerHypothesis: "customer",
    operationalHypothesis: "operations",
    pilot: "pilot",
    metrics: ["completion"],
    customerGate: "customer gate",
    operationalGate: "operational gate",
  },
  {
    id: "R1",
    name: "Team Evaluation & Collaboration",
    sequence: 1,
    customerHypothesis: "customer",
    operationalHypothesis: "operations",
    pilot: "pilot",
    metrics: ["completion"],
    customerGate: "customer gate",
    operationalGate: "operational gate",
  },
];

function candidate(): LinearSnapshotCandidate {
  return {
    issues: [
      {
        id: "PLA-1",
        sourceId: "F-001",
        dependencies: [],
        release: "R0",
        milestone: "Production evidence closed",
      },
      {
        id: "PLA-2",
        sourceId: "F-002",
        dependencies: ["F-001"],
        release: "R1",
        milestone: "Production evidence closed",
      },
    ],
    linearFingerprint: {
      issues: [
        {
          identifier: "PLA-1",
          projectId: "22222222-2222-4222-8222-222222222222",
          project: "Sourcera Production",
          milestoneId: "33333333-3333-4333-8333-333333333333",
          milestone: "Production evidence closed",
        },
        {
          identifier: "PLA-2",
          projectId: "22222222-2222-4222-8222-222222222222",
          project: "Sourcera Production",
          milestoneId: "33333333-3333-4333-8333-333333333333",
          milestone: "Production evidence closed",
        },
      ],
    },
  };
}

test("accepts a mapped candidate with an acyclic release-ordered graph", () => {
  assert.deepEqual(linearCandidateFindings(candidate(), releases), []);
});

test("rejects a mapped candidate dependency cycle", () => {
  const value = candidate();
  value.issues[0].dependencies = ["F-002"];
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) => finding.code === "dependency_cycle",
    ),
  );
});

test("rejects a mapped candidate cross-release inversion", () => {
  const value = candidate();
  value.issues[0].dependencies = ["F-002"];
  value.issues[1].dependencies = [];
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) => finding.code === "cross_release_inversion",
    ),
  );
});

for (const field of ["project", "milestone"] as const) {
  test(`rejects a mapped candidate issue with null ${field} identity`, () => {
    const value = candidate();
    if (field === "project") {
      value.linearFingerprint.issues[0].projectId = null;
      value.linearFingerprint.issues[0].project = null;
    } else {
      value.linearFingerprint.issues[0].milestoneId = null;
      value.linearFingerprint.issues[0].milestone = null;
      value.issues[0].milestone = null;
    }
    assert.ok(
      linearCandidateFindings(value, releases).some(
        (finding) =>
          finding.code === "linear_candidate_mapped_issue_scope_missing" &&
          finding.issueId === "PLA-1",
      ),
    );
  });
}

test("candidate validator CLI fails closed on semantic findings", () => {
  const directory = mkdtempSync(join(tmpdir(), "linear-candidate-validation-"));
  const candidatePath = join(directory, "candidate.json");
  const releasesPath = join(directory, "releases.json");
  try {
    const value = candidate();
    value.issues[0].dependencies = ["F-002"];
    writeFileSync(candidatePath, JSON.stringify(value));
    writeFileSync(releasesPath, JSON.stringify({ releases }));
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/validate-linear-candidate.ts",
        "--candidate",
        candidatePath,
        "--releases",
        releasesPath,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /dependency_cycle|cross_release_inversion/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
