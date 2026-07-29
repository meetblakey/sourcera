import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import { canonicalLinearRelationKey } from "./lib/linear-live.js";
import {
  buildLinearAuthorityRequirementPublicationSequence,
  canonicalLinearAuthorityRequirementPublicationSequenceJson,
} from "./lib/linear-authority-publication-sequence.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  buildLinearAuthoritySemanticPlanV4TestFixture,
  buildLinearAuthoritySemanticPlanV4FromCapture,
  canonicalLinearAuthoritySemanticPlanV4Json,
  parseLinearAuthoritySemanticPlanV4,
  validateLinearAuthoritySemanticPlanV4,
  type LinearAuthorityAdoptedRequirementV4,
  type LinearAuthorityRequirementRecoveryV4,
  type LinearAuthoritySemanticCoreV4,
  type LinearAuthoritySemanticPlanV4,
} from "./lib/linear-authority-semantic-plan-v4.js";

const rootDir = process.cwd();
const core = buildLinearAuthoritySemanticCoreV4(rootDir);
const clone = <T>(value: T): T => structuredClone(value);
const digest = (value: string): string =>
  createHash("sha256").update(value).digest("hex");
const uuid = (index: number): string =>
  `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

function emptyReconciliation(
  semanticCore: LinearAuthoritySemanticCoreV4 = core,
): LinearAuthorityAdoptedRequirementV4[] {
  return semanticCore.requirements.slice(0, 186).map((row, index) => ({
    canonicalLegacyId: row.canonicalLegacyId,
    issueUuid: uuid(index + 1),
    issueIdentifier: `REQ-${index + 1}`,
    descriptionUpdateRequired: false,
    priorityUpdateRequired: false,
    executionRelationsToAdd: [],
    requirementDependencyLegacyIdsToAdd: [],
    proofExecutionDependenciesToAdd: [],
  }));
}

function captureFixture(semanticCore: LinearAuthoritySemanticCoreV4 = core): {
  fingerprint: Record<string, unknown>;
  descriptions: Record<string, unknown>;
  recovery: LinearAuthorityRequirementRecoveryV4;
  publication: string;
} {
  const adopted = semanticCore.requirements.slice(0, 186);
  const primaryRelations = adopted.map((row, index) =>
    canonicalLinearRelationKey("related", `REQ-${index + 1}`, row.primaryExecution));
  const requirementIssues = adopted.map((row, index) => ({
    linearId: uuid(index + 1),
    identifier: `REQ-${index + 1}`,
    title: row.title,
    descriptionFingerprint: descriptionFingerprint(row.description),
    updatedAt: "2026-07-28T00:00:00.000Z",
    estimate: null,
    priority: row.priority,
    dueDate: null,
    archivedAt: null,
    stateId: "state-approved",
    state: "Approved",
    stateType: "completed",
    labels: ["Requirement"],
    assignee: null,
    assigneeId: null,
    team: "REQ",
    teamId: "team-requirements",
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: `project-${row.project}`,
    project: row.project,
    milestoneId: null,
    milestone: null,
    parentLinearId: null,
    parent: null,
    releases: [],
    relations: [primaryRelations[index]!],
  }));
  const executionIssues = adopted.map((row, index) => ({
    linearId: uuid(index + 1_001),
    identifier: row.primaryExecution,
    title: `Execution ${row.primaryExecution}`,
    descriptionFingerprint: descriptionFingerprint("Execution evidence."),
    updatedAt: "2026-07-28T00:00:00.000Z",
    estimate: null,
    priority: 2,
    dueDate: null,
    archivedAt: null,
    stateId: "state-execution",
    state: "Approved",
    stateType: "completed",
    labels: [],
    assignee: null,
    assigneeId: null,
    team: row.primaryExecution.split("-")[0],
    teamId: `team-${row.primaryExecution.split("-")[0]}`,
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: null,
    project: null,
    milestoneId: null,
    milestone: null,
    parentLinearId: null,
    parent: null,
    releases: [],
    relations: [primaryRelations[index]!],
  }));
  const descriptions = {
    schemaVersion: 1,
    issues: [
      ...adopted.map((row, index) => ({
        id: `REQ-${index + 1}`,
        title: row.title,
        description: row.description,
        updatedAt: "2026-07-28T00:00:00.000Z",
        labels: ["Requirement"],
      })),
      ...adopted.map((row) => ({
        id: row.primaryExecution,
        title: `Execution ${row.primaryExecution}`,
        description: "Execution evidence.",
        updatedAt: "2026-07-28T00:00:00.000Z",
        labels: [],
      })),
    ],
  };
  const fingerprint = { issues: [...requirementIssues, ...executionIssues] };
  const fingerprintJson = JSON.stringify(fingerprint);
  const publication = canonicalLinearAuthorityRequirementPublicationSequenceJson(
    buildLinearAuthorityRequirementPublicationSequence(semanticCore.publicationSequence),
  );
  const recovery: LinearAuthorityRequirementRecoveryV4 = {
    schemaVersion: 1,
    captureSha256: digest(fingerprintJson),
    publicationSha256: digest(publication),
    mappings: adopted.map((row, index) => ({
      legacyId: row.canonicalLegacyId,
      legacyIds: [row.canonicalLegacyId],
      issueIdentifier: `REQ-${index + 1}`,
      issueUuid: uuid(index + 1),
      title: row.title,
      projectId: `project-${row.project}`,
      stateId: "state-approved",
      labelNames: ["Requirement"],
      relationKeys: [primaryRelations[index]!],
      descriptionFingerprint: descriptionFingerprint(row.description),
    })),
  };
  return { fingerprint, descriptions, recovery, publication };
}

function fromCaptureFixture(
  fixture: ReturnType<typeof captureFixture>,
) {
  const fingerprintJson = JSON.stringify(fixture.fingerprint);
  fixture.recovery.captureSha256 = digest(fingerprintJson);
  return buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir,
    fingerprintJson,
    descriptionsJson: JSON.stringify(fixture.descriptions),
    recoveryMappingJson: JSON.stringify(fixture.recovery),
    publicationJson: fixture.publication,
  });
}

test("builds the exact repo-native semantic core without temporary artifacts", () => {
  assert.deepEqual(core.counts, {
    requirements: 926,
    dispositionDecisions: 61,
    dispositionClasses: {
      proof_only: 21,
      narrative_context: 23,
      superseded: 7,
      retired_source: 10,
    },
    sourceSplitRows: 37,
    splitExecutionRelations: 102,
    rawSourceDependencyEdges: 1246,
    dependencyRepairAdditions: 114,
    normalizedDependencyEdges: 1360,
    executableNativeRequirementEdges: 1296,
    executableProofDependencyEdges: 2,
    publicationSequenceEntries: 926,
    dependencyOrderViolations: 0,
  });
  assert.equal(core.requirements.length, 926);
  assert.equal(core.decisions.length, 61);
  assert.equal(
    canonicalLinearAuthoritySemanticPlanV4Json(buildLinearAuthoritySemanticCoreV4(rootDir)),
    canonicalLinearAuthoritySemanticPlanV4Json(core),
  );
  assert.equal(
    core.requirements.some((row) =>
      /\bSRC-123\b|https?:\/\/[^\s]*linear\.app/i.test(row.description)),
    false,
  );
});

test("assembles and parses a 186-row read-only v4 plan", () => {
  const result = buildLinearAuthoritySemanticPlanV4TestFixture(rootDir, emptyReconciliation());
  assert.equal(result.semanticPlanInternalsValidated, true);
  assert.equal(result.captureEvidenceValidated, false);
  assert.equal(result.semanticCoverageValidated, false);
  assert.equal(result.mutationAuthorized, false);
  assert.equal(result.plan.semanticCoverageValidated, false);
  assert.equal(result.plan.mutationAuthorized, false);
  assert.equal(result.plan.counts.adoptedRequirementsVerified, 186);
  assert.equal(result.plan.counts.adoptedDescriptionsToUpdate, 0);
  assert.equal(result.plan.counts.adoptedPriorityUpdates, 0);
  const reparsed = parseLinearAuthoritySemanticPlanV4(JSON.stringify(result.plan));
  assert.equal(reparsed.semanticRoot, result.semanticRoot);
});

test("derives all adopted deltas from a full digest-pinned capture", () => {
  const fixture = captureFixture();
  const result = fromCaptureFixture(fixture);
  assert.equal(result.plan.counts.adoptedRequirementsVerified, 186);
  assert.equal(result.plan.counts.adoptedDescriptionsToUpdate, 0);
  assert.equal(result.plan.counts.adoptedPriorityUpdates, 0);
  const adopted = core.requirements.slice(0, 186);
  const adoptedIds = new Set(adopted.map((row) => row.canonicalLegacyId));
  assert.equal(
    result.plan.counts.adoptedExecutionRelationsToAdd,
    adopted.reduce((count, row) => count + row.execution.length - 1, 0),
  );
  assert.equal(
    result.plan.counts.adoptedRequirementDependencyRelationsToAdd,
    adopted.reduce(
      (count, row) => count + row.requirementDependencyLegacyIds.filter((id) => adoptedIds.has(id)).length,
      0,
    ),
  );
  assert.equal(result.plan.counts.adoptedProofExecutionRelationsToAdd, 0);
});

test("fails on stale, missing, duplicate, extra, or drifted adopted identities", () => {
  const stale = captureFixture();
  stale.recovery.captureSha256 = "b".repeat(64);
  assert.throws(() => buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir,
    fingerprintJson: JSON.stringify(stale.fingerprint),
    descriptionsJson: JSON.stringify(stale.descriptions),
    recoveryMappingJson: JSON.stringify(stale.recovery),
    publicationJson: stale.publication,
  }), /different capture/i);

  const swappedPublication = captureFixture();
  swappedPublication.publication = swappedPublication.publication.replace(/\n$/, " \n");
  assert.throws(() => fromCaptureFixture(swappedPublication), /different publication bytes/i);

  const duplicate = captureFixture();
  duplicate.recovery.mappings[1]!.issueIdentifier = "REQ-1";
  assert.throws(() => fromCaptureFixture(duplicate), /duplicate identity/i);

  const extra = captureFixture();
  const extraIssue = clone((extra.fingerprint.issues as Record<string, unknown>[])[0]!);
  extraIssue.linearId = uuid(999);
  extraIssue.identifier = "REQ-999";
  (extra.fingerprint.issues as Record<string, unknown>[]).push(extraIssue);
  const extraDescription = clone((extra.descriptions.issues as Record<string, unknown>[])[0]!);
  extraDescription.id = "REQ-999";
  (extra.descriptions.issues as Record<string, unknown>[]).push(extraDescription);
  assert.throws(() => fromCaptureFixture(extra), /exactly cover the live Requirement rows/i);

  const drifted = captureFixture();
  (drifted.fingerprint.issues as Record<string, unknown>[])[0]!.title = "Drifted title";
  assert.throws(() => fromCaptureFixture(drifted), /description capture drifts|recovery mapping drifts/i);
});

test("fails on hardcoded native references and unexpected live relations", () => {
  const hardcoded = captureFixture();
  const issue = (hardcoded.descriptions.issues as Record<string, unknown>[])[0]!;
  issue.description = `${issue.description as string}\n\nSee PLA-217.`;
  const fingerprintIssue = (hardcoded.fingerprint.issues as Record<string, unknown>[])[0]!;
  fingerprintIssue.descriptionFingerprint = descriptionFingerprint(issue.description as string);
  hardcoded.recovery.mappings[0]!.descriptionFingerprint = fingerprintIssue.descriptionFingerprint as string;
  assert.throws(() => fromCaptureFixture(hardcoded), /hardcodes a Linear issue reference/i);

  const relationDrift = captureFixture();
  const unexpected = "related:PLA-9999:REQ-1";
  const liveRelations = (relationDrift.fingerprint.issues as Record<string, unknown>[])[0]!.relations as string[];
  liveRelations.push(unexpected);
  relationDrift.recovery.mappings[0]!.relationKeys = [...liveRelations];
  assert.throws(() => fromCaptureFixture(relationDrift), /relation drift/i);
});

test("validator rejects authority claims, stale counts, and malformed reconciliation", () => {
  const baseline = buildLinearAuthoritySemanticPlanV4TestFixture(rootDir, emptyReconciliation()).plan;
  for (const [mutate, pattern] of [
    [(plan: LinearAuthoritySemanticPlanV4) => { plan.mutationAuthorized = true as false; }, /flags must remain false/i],
    [(plan: LinearAuthoritySemanticPlanV4) => { plan.semanticCoverageValidated = true as false; }, /flags must remain false/i],
    [(plan: LinearAuthoritySemanticPlanV4) => { plan.counts.normalizedDependencyEdges = 1 as 1360; }, /reported counts differ/i],
    [(plan: LinearAuthoritySemanticPlanV4) => {
      plan.adoptedRequirementReconciliation[1]!.issueIdentifier = "REQ-1";
    }, /duplicate adopted identifier/i],
    [(plan: LinearAuthoritySemanticPlanV4) => {
      plan.adoptedRequirementReconciliation[0]!.descriptionUpdateRequired = "yes" as unknown as boolean;
    }, /must be boolean/i],
  ] as Array<[(plan: LinearAuthoritySemanticPlanV4) => void, RegExp]>) {
    const candidate = clone(baseline);
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlanV4(candidate), pattern);
  }
});

test("strict parser rejects unknown nested keys and nested type drift", () => {
  const baseline = buildLinearAuthoritySemanticPlanV4TestFixture(
    rootDir,
    emptyReconciliation(),
  ).plan;
  const resolutionRequirementIndex = baseline.requirements.findIndex((row) =>
    row.dispositionResolutions.length > 0);
  assert.notEqual(resolutionRequirementIndex, -1);
  const mutations: Array<(plan: LinearAuthoritySemanticPlanV4) => void> = [
    (plan) => { (plan.counts as unknown as Record<string, unknown>).unexpected = 1; },
    (plan) => {
      (plan.counts.dispositionClasses as unknown as Record<string, unknown>).unexpected = 1;
    },
    (plan) => {
      (plan.requirements[0] as unknown as Record<string, unknown>).unexpected = true;
    },
    (plan) => {
      (plan.requirements[resolutionRequirementIndex]!.dispositionResolutions[0] as unknown as Record<string, unknown>).unexpected = true;
    },
    (plan) => { (plan.decisions[0] as unknown as Record<string, unknown>).unexpected = true; },
    (plan) => {
      (plan.adoptedRequirementReconciliation[0] as unknown as Record<string, unknown>).unexpected = true;
    },
    (plan) => { (plan.captureEvidence as unknown as Record<string, unknown>).unexpected = true; },
  ];
  for (const mutate of mutations) {
    const candidate = clone(baseline);
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlanV4(candidate), /keys differ/i);
  }

  const badPriority = clone(baseline);
  badPriority.requirements[0]!.priority = "high" as unknown as number;
  assert.throws(() => validateLinearAuthoritySemanticPlanV4(badPriority), /priority.*integer/i);
  const badDecisionRelations = clone(baseline);
  badDecisionRelations.decisions[0]!.existingRelations = "PLA-1" as unknown as string[];
  assert.throws(() => validateLinearAuthoritySemanticPlanV4(badDecisionRelations), /existingRelations.*array/i);
});

test("generic identifier hygiene and evidence roots fail closed", () => {
  const baseline = buildLinearAuthoritySemanticPlanV4TestFixture(
    rootDir,
    emptyReconciliation(),
  ).plan;
  const hardcoded = clone(baseline);
  hardcoded.requirements[0]!.description += " See ENG-77.";
  assert.throws(() => validateLinearAuthoritySemanticPlanV4(hardcoded), /hardcodes a Linear issue reference/i);

  const falseCapture = clone(baseline);
  falseCapture.captureEvidence.mode = "capture";
  falseCapture.captureEvidence.captureEvidenceValidated = true;
  assert.throws(() => validateLinearAuthoritySemanticPlanV4(falseCapture), /four validated SHA-256 roots/i);

  const captured = fromCaptureFixture(captureFixture());
  assert.equal(captured.captureEvidenceValidated, true);
  assert.equal(captured.plan.captureEvidence.mode, "capture");
  assert.match(captured.plan.captureEvidence.fingerprintSha256!, /^[a-f0-9]{64}$/);
  assert.match(captured.plan.captureEvidence.descriptionCaptureSha256!, /^[a-f0-9]{64}$/);
  assert.match(captured.plan.captureEvidence.recoveryMappingSha256!, /^[a-f0-9]{64}$/);
  assert.match(captured.plan.captureEvidence.publicationSha256!, /^[a-f0-9]{64}$/);
});
