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
          releases: ["R0"],
          relations: ["blocks:PLA-1:PLA-2"],
        },
        {
          identifier: "PLA-2",
          projectId: "22222222-2222-4222-8222-222222222222",
          project: "Sourcera Production",
          milestoneId: "33333333-3333-4333-8333-333333333333",
          milestone: "Production evidence closed",
          releases: ["R1"],
          relations: ["blocks:PLA-1:PLA-2"],
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
  value.linearFingerprint.issues[0].relations!.push("blocks:PLA-2:PLA-1");
  value.linearFingerprint.issues[1].relations!.push("blocks:PLA-2:PLA-1");
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) => finding.code === "dependency_cycle",
    ),
  );
});

test("rejects a mapped candidate cross-release inversion", () => {
  const value = candidate();
  value.linearFingerprint.issues[0].relations = ["blocks:PLA-2:PLA-1"];
  value.linearFingerprint.issues[1].relations = ["blocks:PLA-2:PLA-1"];
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) => finding.code === "cross_release_inversion",
    ),
  );
});

test("requires exactly one matching canonical live release", () => {
  for (const liveReleases of [[], ["R0", "R1"], ["partner-beta"]]) {
    const value = candidate();
    value.linearFingerprint.issues[0].releases = liveReleases;
    assert.ok(
      linearCandidateFindings(value, releases).some(
        (finding) =>
          finding.code === "linear_candidate_executable_release_invalid" &&
          finding.issueId === "PLA-1",
      ),
    );
  }
  const value = candidate();
  value.issues[0].release = null;
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) =>
        finding.code === "linear_candidate_executable_release_invalid",
    ),
  );
});

test("requires source-split executable children to retain native project and milestone", () => {
  const value = candidate();
  value.issues.push({
    id: "PLA-3",
    sourceId: null,
    sourceFamilyId: "F-001",
    kind: "executable",
    dependencies: [],
    release: "R1",
    milestone: "Production evidence closed",
  });
  value.linearFingerprint.issues.push({
    identifier: "PLA-3",
    projectId: "22222222-2222-4222-8222-222222222222",
    project: "Sourcera Production",
    milestoneId: "33333333-3333-4333-8333-333333333333",
    milestone: "Production evidence closed",
    releases: ["R1"],
    relations: [],
  });
  assert.deepEqual(linearCandidateFindings(value, releases), []);

  value.linearFingerprint.issues[2].milestoneId = null;
  value.linearFingerprint.issues[2].milestone = null;
  value.issues[2].milestone = null;
  assert.ok(
    linearCandidateFindings(value, releases).some(
      (finding) =>
        finding.code === "linear_candidate_mapped_issue_scope_missing" &&
        finding.issueId === "PLA-3",
    ),
  );
});

test("validates split-source dependencies at native issue level", () => {
  const value = candidate();
  value.issues.push({
    id: "PLA-3",
    sourceId: null,
    sourceFamilyId: "F-001",
    kind: "executable",
    dependencies: ["F-002"],
    release: "R1",
    milestone: "Production evidence closed",
  });
  value.linearFingerprint.issues.push({
    identifier: "PLA-3",
    projectId: "22222222-2222-4222-8222-222222222222",
    project: "Sourcera Production",
    milestoneId: "33333333-3333-4333-8333-333333333333",
    milestone: "Production evidence closed",
    releases: ["R1"],
    relations: ["blocks:PLA-2:PLA-3"],
  });
  value.linearFingerprint.issues[0].relations = ["blocks:PLA-1:PLA-2"];
  value.linearFingerprint.issues[1].relations = [
    "blocks:PLA-1:PLA-2",
    "blocks:PLA-2:PLA-3",
  ];
  assert.deepEqual(linearCandidateFindings(value, releases), []);
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
    value.linearFingerprint.issues[0].relations = ["blocks:PLA-2:PLA-1"];
    value.linearFingerprint.issues[1].relations = ["blocks:PLA-2:PLA-1"];
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
