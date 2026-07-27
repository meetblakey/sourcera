import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  canonicalLinearFingerprint,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import type { LinearProgramScope } from "./lib/linear-program-scope.js";
import type { LinearProjectScope } from "./lib/linear-project-scope.js";
import type { Disposition } from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";

const CAPTURED_AT = "2026-07-23T01:02:03.000Z";

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-release-readback-"));
  const linear = join(dir, "linear.json");
  const out = join(dir, "release-plan.json");
  const stamp = join(dir, "stamp.json");
  const projectScope = JSON.parse(
    readFileSync("delivery/linear-project-scope.json", "utf8"),
  ) as LinearProjectScope;
  const programScope = JSON.parse(
    readFileSync("delivery/linear-program-scope.json", "utf8"),
  ) as LinearProgramScope;
  const projectNameById = new Map(
    projectScope.projects.map((project) => [project.id, project.name]),
  );
  const masterSpecSha256 = createHash("sha256")
    .update(readFileSync("Sourcera_Master_Spec.md"))
    .digest("hex");
  const firstProject = programScope.projectDescriptionFingerprints[0];
  const firstMilestone = firstProject.milestones[0];
  const dispositions = JSON.parse(
    readFileSync("delivery/dispositions.json", "utf8"),
  ) as { overrides: Array<{ requirementId: string; disposition: Disposition }> };
  const dispositionById = new Map(
    dispositions.overrides.map((entry) => [entry.requirementId, entry.disposition]),
  );
  const featureSources = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  )
    .map((entry) => ({
      ...entry,
      disposition: dispositionById.get(entry.requirementId) ?? entry.disposition,
    }))
    .filter((entry) => entry.disposition === "executable")
    .map((entry) => entry.requirementId);
  const runtimeDependencies = JSON.parse(
    readFileSync("delivery/runtime-gate-dependencies.json", "utf8"),
  ) as { dependencies: Array<{ requirementId: string }> };
  const runtimeSources = runtimeDependencies.dependencies.map(
    (entry) => entry.requirementId,
  );
  writeFileSync(
    stamp,
    JSON.stringify({
      findings: runtimeSources.map((requirementId) => ({
        id: requirementId.slice(3),
        file: "Sourcera_Master_Spec.md",
        line: 1,
        severity: "blocker",
      })),
    }),
  );
  const expectedSources = [...featureSources, ...runtimeSources];
  const issueFingerprint = (
    sourceId: string,
    index: number,
  ): LinearFingerprint["issues"][number] => ({
    linearId: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    identifier: `PLA-${index + 2000}`,
    title: sourceId,
    descriptionFingerprint: "0".repeat(64),
    updatedAt: CAPTURED_AT,
    estimate: 1,
    priority: 2,
    dueDate: null,
    stateId: "60000000-0000-4000-8000-000000000001",
    state: "Backlog",
    stateType: "backlog",
    archivedAt: null,
    labels: [],
    assignee: null,
    assigneeId: null,
    team: "PLA",
    teamId: "20000000-0000-4000-8000-000000000001",
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: firstProject.projectId,
    project: projectNameById.get(firstProject.projectId)!,
    milestoneId: firstMilestone.milestoneId,
    milestone: "Milestone 1",
    parentLinearId: null,
    parent: null,
    releases: ["R1"],
    relations: [],
  });
  const planningIssueFingerprints = expectedSources.map(issueFingerprint);
  const decisionContract = programScope.schemaVersion === 3
    ? programScope.projectDocumentDecisionContract
    : null;
  const decisionReferences = decisionContract?.references ?? [];
  const trackedDecisions = decisionContract?.trackedDecisions ?? [];
  const labelDefinitionById = new Map(
    (decisionContract?.labelDefinitions ?? []).map((label) => [label.id, label]),
  );
  const contractIssueByIdentifier = new Map<string, ReturnType<typeof issueFingerprint>>();
  let contractSequence = trackedDecisions.length;
  for (const [index, tracked] of trackedDecisions.entries()) {
    const decision = {
      ...issueFingerprint(tracked.decisionIdentifier, expectedSources.length + index),
      identifier: tracked.decisionIdentifier,
      title: tracked.decisionTitle,
      labels: tracked.labelIds.map((id) => labelDefinitionById.get(id)!.name),
      projectId: tracked.decisionProjectId,
      project: projectNameById.get(tracked.decisionProjectId)!,
      milestoneId: null,
      milestone: null,
      releases: [],
      state: tracked.resolution === "completed" ? "Completed" : "Backlog",
      stateType: tracked.resolution === "completed" ? "completed" : "backlog",
      relations: tracked.blockedIssues.map(
        (target) =>
          `blocks:${tracked.decisionIdentifier}:${target.identifier}`,
      ),
    };
    contractIssueByIdentifier.set(tracked.decisionIdentifier, decision);
    for (const target of tracked.blockedIssues) {
      if (contractIssueByIdentifier.has(target.identifier)) continue;
      contractIssueByIdentifier.set(target.identifier, {
        ...issueFingerprint(
          target.identifier,
          expectedSources.length + contractSequence++,
        ),
        identifier: target.identifier,
        title: target.identifier,
        projectId: target.projectId,
        project: projectNameById.get(target.projectId)!,
        milestoneId: null,
        milestone: null,
        releases: [],
        relations: [
          `blocks:${tracked.decisionIdentifier}:${target.identifier}`,
        ],
      });
    }
  }
  const contractIssueFingerprints = [...contractIssueByIdentifier.values()]
    .sort((left, right) => left.identifier.localeCompare(right.identifier));
  const fingerprint = canonicalLinearFingerprint({
    issues: [...planningIssueFingerprints, ...contractIssueFingerprints],
    releasePipelines: [{
      id: "30000000-0000-4000-8000-000000000001",
      name: "Sourcera Product Delivery",
      updatedAt: CAPTURED_AT,
      archivedAt: null,
      type: "continuous",
      isProduction: true,
      teams: [{ id: "20000000-0000-4000-8000-000000000001", key: "PLA" }],
      stages: [{
        id: "40000000-0000-4000-8000-000000000001",
        name: "Planned",
        type: "planned",
        position: 0,
        archivedAt: null,
        frozen: false,
      }],
    }],
    releases: [{
      id: "50000000-0000-4000-8000-000000000001",
      name: "Team Evaluation & Collaboration",
      descriptionFingerprint: "0".repeat(64),
      version: "R1",
      commitSha: null,
      startDate: null,
      targetDate: null,
      updatedAt: CAPTURED_AT,
      archivedAt: null,
      pipeline: "30000000-0000-4000-8000-000000000001",
      stage: "40000000-0000-4000-8000-000000000001",
      stageType: "planned",
    }],
    projects: programScope.projectDescriptionFingerprints.map((project) => ({
      id: project.projectId,
      name: projectNameById.get(project.projectId)!,
      descriptionFingerprint: project.descriptionFingerprint,
      updatedAt: CAPTURED_AT,
      archivedAt: null,
      statusId: "70000000-0000-4000-8000-000000000001",
      status: "Planned",
      statusType: "planned",
      priority: 2,
      lead: null,
      leadId: null,
      startDate: null,
      startDateResolution: null,
      targetDate: null,
      targetDateResolution: null,
    })),
    projectMilestones: programScope.projectDescriptionFingerprints.flatMap(
      (project) => project.milestones.map((milestone, index) => ({
        id: milestone.milestoneId,
        name: `Milestone ${index + 1}`,
        descriptionFingerprint: milestone.descriptionFingerprint,
        projectId: project.projectId,
        project: projectNameById.get(project.projectId)!,
        updatedAt: CAPTURED_AT,
        archivedAt: null,
        targetDate: null,
        status: "unstarted",
      })),
    ),
    cycles: [],
    program: {
      initiatives: programScope.outcomeInitiatives.map((initiative) => ({
        ...initiative,
        updatedAt: CAPTURED_AT,
        archivedAt: null,
        owner: null,
        ownerId: null,
        status: "Planned",
        priority: 2,
        health: null,
        healthUpdatedAt: null,
        targetDate: null,
        targetDateResolution: null,
        parentInitiativeId: null,
        parentInitiative: null,
      })),
      documents: [{
        id: programScope.planningDocument.id,
        title: programScope.planningDocument.title,
        updatedAt: CAPTURED_AT,
        archivedAt: null,
        initiativeId: programScope.planningDocument.initiativeId,
        projectId: programScope.planningDocument.projectId,
        teamId: programScope.planningDocument.teamId,
        issueId: programScope.planningDocument.issueId,
        contentFingerprint: programScope.planningDocument.contentFingerprint,
        sectionHeadings: programScope.planningDocument.requiredSections,
        sourceFingerprints: { masterSpecSha256: null, uxDesignSha256: null },
      }],
      ...(programScope.schemaVersion === 3
        ? {
            projectDocuments: [
              ...programScope.canonicalProjectDocuments,
              ...programScope.supplementaryDocuments,
            ].map((document) => ({
              id: document.id,
              title: document.title,
              updatedAt: CAPTURED_AT,
              archivedAt: null,
              initiativeId: null,
              projectId: document.projectId,
              projectName: projectNameById.get(document.projectId)!,
              teamId: null,
              issueId: null,
              contentFingerprint: document.contentFingerprint,
              sectionHeadings: document.requiredSections,
              masterSpecSha256,
              masterSpecSections: document.masterSpecSections,
              unresolvedDecisionReferences: decisionReferences
                .filter((reference) => reference.documentId === document.id)
                .map((reference) => ({
                  identifier: reference.decisionIdentifier,
                  url: trackedDecisions.find(
                    (decision) =>
                      decision.decisionIdentifier === reference.decisionIdentifier,
                  )!.decisionUrl,
                })),
              contentPolicyFindings: [],
            })),
            projectDocumentConflicts: [],
            decisionIssues: trackedDecisions.map((decision) => ({
              identifier: decision.decisionIdentifier,
              title: decision.decisionTitle,
              url: decision.decisionUrl,
              descriptionFingerprint: decision.descriptionFingerprint,
              sectionHeadings: decision.requiredSections,
              archivedAt: null,
              stateType: decision.resolution === "completed"
                ? "completed"
                : "backlog",
              labels: decision.labelIds.map((id) => labelDefinitionById.get(id)!),
              projectId: decision.decisionProjectId,
              relations: decision.blockedIssues.map(
                (target) =>
                  `blocks:${decision.decisionIdentifier}:${target.identifier}`,
              ),
            })),
          }
        : {}),
      projectInitiatives: programScope.projectInitiatives,
    },
  });
  const fingerprintJson = `${JSON.stringify(fingerprint, null, 2)}\n`;
  const snapshot = {
    generatedAt: CAPTURED_AT,
    linearCapture: {
      schemaVersion: 1,
      capturedAt: CAPTURED_AT,
      fingerprintSha256: createHash("sha256").update(fingerprintJson).digest("hex"),
      source: {
        repository: "meetblakey/sourcera",
        commit: "a".repeat(40),
        ref: "refs/heads/main",
        runId: "123",
        runAttempt: "1",
      },
    },
    issues: [
      ...expectedSources.map((sourceId, index) => ({
        id: `PLA-${index + 2000}`,
        sourceId,
        release: "R1" as const,
      })),
      ...contractIssueFingerprints.map((issue) => ({
        id: issue.identifier,
        sourceId: null,
        release: null,
      })),
    ],
    linearFingerprint: fingerprint,
  };
  writeFileSync(linear, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { dir, linear, out, snapshot, stamp, expectedSources };
}

function run(linear: string, out: string, stamp: string, extra: string[] = []) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/build-release-plan.ts",
      "--root",
      process.cwd(),
      "--linear",
      linear,
      "--stamp",
      stamp,
      "--out",
      out,
      ...extra,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("builds the release readback only from a complete receipt-bound native capture", () => {
  const value = fixture();
  try {
    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(readFileSync(value.out, "utf8")) as {
      assignments: Array<{ requirementId: string; release: string; rationale: string }>;
    };
    assert.equal(output.assignments.length, value.expectedSources.length);
    assert.deepEqual(
      output.assignments.find((assignment) => assignment.requirementId === "F-001"),
      {
        requirementId: "F-001",
        release: "R1",
        rationale: "Generated readback of the issue's native Linear release.",
      },
    );
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses an incomplete snapshot before output", () => {
  const value = fixture();
  try {
    value.snapshot.linearFingerprint.projects = [];
    const fingerprint = canonicalLinearFingerprint(
      value.snapshot.linearFingerprint,
    );
    value.snapshot.linearCapture.fingerprintSha256 = createHash("sha256")
      .update(`${JSON.stringify(fingerprint, null, 2)}\n`)
      .digest("hex");
    writeFileSync(value.linear, `${JSON.stringify(value.snapshot, null, 2)}\n`);

    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /complete projects fingerprint inventory/);
    assert.equal(existsSync(value.out), false);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses planning body, project, or milestone contract drift before output", () => {
  const value = fixture();
  try {
    value.snapshot.linearFingerprint.projects[0].descriptionFingerprint = "f".repeat(64);
    const fingerprint = canonicalLinearFingerprint(value.snapshot.linearFingerprint);
    value.snapshot.linearCapture.fingerprintSha256 = createHash("sha256")
      .update(`${JSON.stringify(fingerprint, null, 2)}\n`)
      .digest("hex");
    writeFileSync(value.linear, `${JSON.stringify(value.snapshot, null, 2)}\n`);
    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /project descriptions differ/);
    assert.equal(existsSync(value.out), false);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses an output symlink or filesystem alias of an input", () => {
  const value = fixture();
  try {
    const linked = join(value.dir, "linked.json");
    symlinkSync(value.out, linked);
    const linkedResult = run(value.linear, linked, value.stamp);
    assert.equal(linkedResult.status, 1);
    assert.match(linkedResult.stderr, /Output path cannot be a symlink/);

    const aliasResult = run(value.linear, value.linear, value.stamp);
    assert.equal(aliasResult.status, 1);
    assert.match(aliasResult.stderr, /Output path equals input linear/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("replaces an existing readback atomically without temporary residue", () => {
  const value = fixture();
  try {
    writeFileSync(value.out, "old\n");
    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      readdirSync(value.dir).some((name) => name.includes(".tmp-")),
      false,
    );
    assert.equal(
      JSON.parse(readFileSync(value.out, "utf8")).assignments.length,
      value.expectedSources.length,
    );
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses a partial mapped source set even when the capture receipt is valid", () => {
  const value = fixture();
  try {
    const mappedIndex = value.snapshot.issues.findIndex(
      (issue) => issue.sourceId !== null,
    );
    value.snapshot.issues.splice(mappedIndex, 1);
    writeFileSync(value.linear, `${JSON.stringify(value.snapshot, null, 2)}\n`);
    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /has no source-mapped Linear release owner/);
    assert.equal(existsSync(value.out), false);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses caller-provided copies of canonical scope contracts", () => {
  const value = fixture();
  try {
    const copiedScope = join(value.dir, "program-scope.json");
    writeFileSync(
      copiedScope,
      readFileSync("delivery/linear-program-scope.json", "utf8"),
    );
    const result = run(value.linear, value.out, value.stamp, [
      "--linear-program-scope",
      copiedScope,
    ]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /program scope must use the canonical repository file/);
    assert.equal(existsSync(value.out), false);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("refuses noncanonical receipt keys or timestamps", () => {
  for (const mutate of [
    (snapshot: any) => {
      snapshot.linearCapture.extra = true;
    },
    (snapshot: any) => {
      snapshot.generatedAt = "2026-07-23T01:02:03Z";
      snapshot.linearCapture.capturedAt = snapshot.generatedAt;
    },
  ]) {
    const value = fixture();
    try {
      mutate(value.snapshot);
      writeFileSync(value.linear, `${JSON.stringify(value.snapshot, null, 2)}\n`);
      const result = run(value.linear, value.out, value.stamp);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /capture receipt is missing or invalid/);
      assert.equal(existsSync(value.out), false);
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }
});

test("refuses a self-hashed malformed live fingerprint", () => {
  const value = fixture();
  try {
    value.snapshot.linearFingerprint.issues[0].linearId = "linear-1";
    const fingerprint = canonicalLinearFingerprint(value.snapshot.linearFingerprint);
    value.snapshot.linearCapture.fingerprintSha256 = createHash("sha256")
      .update(`${JSON.stringify(fingerprint, null, 2)}\n`)
      .digest("hex");
    writeFileSync(value.linear, `${JSON.stringify(value.snapshot, null, 2)}\n`);
    const result = run(value.linear, value.out, value.stamp);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /stable Linear ID is invalid/);
    assert.equal(existsSync(value.out), false);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("uses the promotion disposition parser instead of a permissive map", () => {
  const source = readFileSync("tools/delivery/build-release-plan.ts", "utf8");
  assert.match(source, /parseLinearDispositions\(/);
  assert.match(source, /applyLinearDispositions\(/);
  assert.doesNotMatch(source, /dispositionById/);
});
