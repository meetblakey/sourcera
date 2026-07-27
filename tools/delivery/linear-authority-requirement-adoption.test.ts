import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import { descriptionFingerprint } from "./lib/fingerprint.js";
import { canonicalLinearRelationKey, type LinearFingerprint } from "./lib/linear-live.js";
import {
  assertLinearAuthorityRequirementAdoptionArtifacts,
  buildLinearAuthorityRequirementBaseline,
  buildLinearAuthorityRequirementAdoptionArtifacts,
  canonicalLinearAuthorityRequirementBaselineJson,
} from "./lib/linear-authority-requirement-adoption.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  buildLinearAuthoritySemanticPlanV4FromCapture,
} from "./lib/linear-authority-semantic-plan-v4.js";
import { buildValidatorValidLinearAuthorityPackageV2Fixture } from "./linear-authority-package-v2.fixture.js";

function canonicalFingerprintFixture(): {
  fingerprint: LinearFingerprint;
  descriptionsRaw: string;
  baselineRaw: string;
  workspaceId: string;
} {
  const fixture = buildValidatorValidLinearAuthorityPackageV2Fixture(process.cwd());
  const fingerprint = JSON.parse(
    fixture.authority.compilerInputs.get("linear-fingerprint")!.toString("utf8"),
  ) as LinearFingerprint;
  return {
    fingerprint,
    descriptionsRaw: fixture.authority.compilerInputs.get("issue-descriptions")!.toString("utf8"),
    baselineRaw: fixture.authority.compilerInputs.get("requirement-baseline")!.toString("utf8"),
    workspaceId: fixture.authority.manifest.workspace.id,
  };
}

let cached: ReturnType<typeof canonicalFingerprintFixture> | undefined;
const fixture = (): ReturnType<typeof canonicalFingerprintFixture> =>
  cached ??= canonicalFingerprintFixture();
const raw = (fingerprint: LinearFingerprint): string => `${JSON.stringify(fingerprint, null, 2)}\n`;
const bootstrapMapRaw = readFileSync(
  "delivery/linear-authority-requirement-bootstrap-map.json",
  "utf8",
);
const adoptionInput = (value: ReturnType<typeof canonicalFingerprintFixture>) => ({
  rootDir: process.cwd(),
  workspaceId: value.workspaceId,
  fingerprintJson: raw(value.fingerprint),
  descriptionsJson: value.descriptionsRaw,
  baselineJson: value.baselineRaw,
});

test("derives exact canonical publication and 186 anchored Requirement adoptions from capture", () => {
  const input = fixture();
  const result = buildLinearAuthorityRequirementAdoptionArtifacts(adoptionInput(input));
  assert.equal(result.recovery.mappings.length, 186);
  assert.equal(new Set(result.recovery.mappings.map((row) => row.legacyId)).size, 186);
  assert.equal(JSON.parse(result.publicationRaw).entries.length, 926);
  const semantic = buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir: process.cwd(),
    fingerprintJson: raw(input.fingerprint),
    descriptionsJson: input.descriptionsRaw,
    recoveryMappingJson: result.recoveryRaw,
    publicationJson: result.publicationRaw,
  });
  assert.equal(semantic.plan.counts.adoptedDescriptionsToUpdate, 61);
  assert.equal(semantic.plan.counts.adoptedPriorityUpdates, 1);
  assert.equal(semantic.plan.counts.adoptedExecutionRelationsToAdd, 14);
  assert.equal(semantic.plan.counts.adoptedRequirementDependencyRelationsToAdd, 64);
  assert.equal(semantic.plan.counts.adoptedProofExecutionRelationsToAdd, 0);
  assert.deepEqual(assertLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input),
    publicationRaw: result.publicationRaw,
    recoveryRaw: result.recoveryRaw,
  }), result);
});

test("rejects ambiguous identity, missing primary anchor, and native field drift", () => {
  const input = fixture();
  const ambiguous = structuredClone(input.fingerprint);
  const requirements = ambiguous.issues.filter((issue) => issue.team === "REQ");
  requirements[1]!.title = requirements[0]!.title;
  assert.throws(() => buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input), fingerprintJson: raw(ambiguous),
  }), /description capture drifts|duplicates a canonical Requirement|unique canonical Requirement/);

  const unanchored = structuredClone(input.fingerprint);
  const issue = unanchored.issues.find((row) => row.team === "REQ")!;
  issue.relations = [];
  assert.throws(() => buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input), fingerprintJson: raw(unanchored),
  }), /anchored Requirement baseline identity|primary execution relation/);

  const drifted = structuredClone(input.fingerprint);
  drifted.issues.find((row) => row.team === "REQ")!.project = "Wrong project";
  assert.throws(() => buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input), fingerprintJson: raw(drifted),
  }), /project, state, or UUID has drifted/);
});

test("rejects description drift and byte-valid substitute adoption artifacts", () => {
  const input = fixture();
  const descriptions = JSON.parse(input.descriptionsRaw) as { issues: Array<{ id: string; description: string }> };
  descriptions.issues.find((row) => row.id.startsWith("REQ-"))!.description = "drifted";
  assert.throws(() => buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input), descriptionsJson: JSON.stringify(descriptions),
  }), /description capture drifts/);

  const result = buildLinearAuthorityRequirementAdoptionArtifacts(adoptionInput(input));
  const substitute = JSON.parse(result.recoveryRaw) as { mappings: Array<{ title: string }> };
  substitute.mappings[0]!.title = "substitute";
  assert.throws(() => assertLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input),
    publicationRaw: result.publicationRaw,
    recoveryRaw: `${JSON.stringify(substitute)}\n`,
  }), /not the exact capture-derived bytes/);
  assert.throws(() => assertLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(input),
    publicationRaw: "opaque publication bytes\n",
    recoveryRaw: result.recoveryRaw,
  }), /not the exact capture-derived bytes/);
});

test("derives only exact fully anchored 186 or 926 baseline registries", () => {
  const value = fixture();
  const baseline = buildLinearAuthorityRequirementBaseline({
    rootDir: process.cwd(),
    workspaceId: value.workspaceId,
    fingerprintJson: raw(value.fingerprint),
    descriptionsJson: value.descriptionsRaw,
    bootstrapMapJson: bootstrapMapRaw,
  });
  assert.equal(baseline.entries.length, 186);
  assert.equal(canonicalLinearAuthorityRequirementBaselineJson(baseline), value.baselineRaw);

  const unanchored = structuredClone(value.fingerprint);
  unanchored.issues.find((row) => row.team === "REQ")!.relations = [];
  assert.throws(() => buildLinearAuthorityRequirementBaseline({
    rootDir: process.cwd(), workspaceId: value.workspaceId,
    fingerprintJson: raw(unanchored), descriptionsJson: value.descriptionsRaw,
    bootstrapMapJson: bootstrapMapRaw,
  }), /anchored Requirement|reconciliation differs|asymmetric or duplicated/);
});

test("baseline binds the audited 61-row bootstrap map and rejects substitution", () => {
  const value = fixture();
  const substituted = JSON.parse(bootstrapMapRaw) as {
    entries: Array<{ issueIdentifier: string; canonicalLegacyId: string }>;
  };
  substituted.entries[0]!.canonicalLegacyId = "F-001";
  assert.throws(() => buildLinearAuthorityRequirementBaseline({
    rootDir: process.cwd(),
    workspaceId: value.workspaceId,
    fingerprintJson: raw(value.fingerprint),
    descriptionsJson: value.descriptionsRaw,
    bootstrapMapJson: JSON.stringify(substituted),
  }), /bootstrap map.*(?:root|duplicate|identity)/i);

  const routed = structuredClone(value.fingerprint);
  const first = routed.issues.find((row) => row.identifier === "REQ-1")!;
  first.project = routed.issues.find((row) => row.identifier === "REQ-2")!.project;
  assert.throws(() => buildLinearAuthorityRequirementBaseline({
    rootDir: process.cwd(),
    workspaceId: value.workspaceId,
    fingerprintJson: raw(routed),
    descriptionsJson: value.descriptionsRaw,
    bootstrapMapJson: bootstrapMapRaw,
  }), /uniquely canonical anchored Requirement/);

  const missingUuid = structuredClone(value.fingerprint);
  missingUuid.issues.find((row) => row.identifier === "REQ-1")!.linearId = null;
  assert.throws(() => buildLinearAuthorityRequirementBaseline({
    rootDir: process.cwd(),
    workspaceId: value.workspaceId,
    fingerprintJson: raw(missingUuid),
    descriptionsJson: value.descriptionsRaw,
    bootstrapMapJson: bootstrapMapRaw,
  }), /canonical anchored Requirement|native UUID/);
});

test("accepts exact partial-created Requirements while preserving all baseline anchors", () => {
  const value = fixture();
  const fingerprint = structuredClone(value.fingerprint);
  const descriptions = JSON.parse(value.descriptionsRaw) as {
    schemaVersion: 1;
    issues: Array<{ id: string; title: string; description: string; updatedAt: string; labels: string[] }>;
  };
  const core = buildLinearAuthoritySemanticCoreV4(process.cwd());
  const adoptedLegacyIds = new Set((JSON.parse(value.baselineRaw) as {
    entries: Array<{ canonicalLegacyId: string }>;
  }).entries.map((entry) => entry.canonicalLegacyId));
  const coreByLegacyId = new Map(core.requirements.map((row) => [row.canonicalLegacyId, row]));
  const extraRequirements = core.publicationSequence
    .filter((legacyId) => !adoptedLegacyIds.has(legacyId))
    .slice(0, 14)
    .map((legacyId) => coreByLegacyId.get(legacyId)!);
  const projectIdByName = new Map(fingerprint.projects.map((row) => [row.name, row.id]));
  for (const [offset, row] of extraRequirements.entries()) {
    const identifier = `REQ-${500 + offset}`;
    const updatedAt = "2026-07-28T00:00:00.000Z";
    fingerprint.issues.push({
      linearId: `90000000-0000-4000-8000-${String(offset + 1).padStart(12, "0")}`,
      identifier,
      title: row.title,
      descriptionFingerprint: descriptionFingerprint(row.description),
      updatedAt,
      estimate: null,
      priority: row.priority,
      dueDate: null,
      archivedAt: null,
      stateId: fingerprint.issues.find((issue) => issue.team === "REQ")!.stateId,
      state: row.state,
      stateType: row.state === "Approved" ? "completed" : "canceled",
      labels: ["Requirement"],
      assignee: null,
      assigneeId: null,
      team: "REQ",
      teamId: fingerprint.issues.find((issue) => issue.team === "REQ")!.teamId,
      cycleId: null,
      cycleNumber: null,
      cycle: null,
      projectId: projectIdByName.get(row.project)!,
      project: row.project,
      milestoneId: null,
      milestone: null,
      parentLinearId: null,
      parent: null,
      releases: [],
      relations: [],
    });
    descriptions.issues.push({ id: identifier, title: row.title, description: row.description, updatedAt, labels: ["Requirement"] });
  }
  const result = buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(value),
    fingerprintJson: raw(fingerprint),
    descriptionsJson: JSON.stringify(descriptions),
  });
  assert.equal(result.recovery.mappings.length, 200);
  const partialIdentifiers = new Set(extraRequirements.map((_, offset) => `REQ-${500 + offset}`));
  assert.deepEqual(
    result.recovery.mappings
      .filter((row) => partialIdentifiers.has(row.issueIdentifier))
      .map((row) => row.issueIdentifier)
      .sort(),
    [...partialIdentifiers].sort(),
  );

  const drifted = structuredClone(fingerprint);
  const driftedIssue = drifted.issues.find((row) => row.identifier === "REQ-500")!;
  driftedIssue.priority = driftedIssue.priority === 4 ? 3 : 4;
  assert.throws(() => buildLinearAuthorityRequirementAdoptionArtifacts({
    ...adoptionInput(value), fingerprintJson: raw(drifted), descriptionsJson: JSON.stringify(descriptions),
  }), /partial-created Requirement differs/);
});
