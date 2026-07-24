import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assertLinearPlanningSourceFingerprints,
  assertLinearProgramScope,
  linearPlanningSourceFingerprints,
  linearPlanningSectionHeadings,
  type LinearPlanningSourceFingerprints,
  type LinearProgramFingerprint,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";
import { assertLinearPlanningContractFingerprints } from "./lib/linear-live.js";

const MASTER = "a".repeat(64);
const UX = "b".repeat(64);
const TEAM = "477029a4-9e0a-44ca-9816-5a169b6baafa";

function scope(): LinearProgramScope {
  return {
    schemaVersion: 2,
    outcomeInitiatives: [],
    planningDocument: {
      id: "3fd8304b-547e-48e2-bc76-5a9ebecaa389",
      title: "Planning authority",
      contentFingerprint: "c".repeat(64),
      initiativeId: null,
      projectId: null,
      teamId: TEAM,
      issueId: null,
      requiredSections: ["Binding authority", "Program completion"],
    },
    projectDescriptionFingerprints: [],
    projectInitiatives: [],
  };
}

function fingerprint(
  sourceFingerprints: LinearPlanningSourceFingerprints = {
    masterSpecSha256: MASTER,
    uxDesignSha256: UX,
  },
): LinearProgramFingerprint {
  return {
    initiatives: [],
    documents: [
      {
        id: "3fd8304b-547e-48e2-bc76-5a9ebecaa389",
        title: "Planning authority",
        updatedAt: "2026-07-23T00:00:00.000Z",
        archivedAt: null,
        initiativeId: null,
        projectId: null,
        teamId: TEAM,
        issueId: null,
        contentFingerprint: "c".repeat(64),
        sectionHeadings: ["Binding authority", "Program completion"],
        sourceFingerprints,
      },
    ],
    projectInitiatives: [],
  };
}

test("parses one full fingerprint for each canonical planning source", () => {
  assert.deepEqual(
    linearPlanningSourceFingerprints(`
## Canonical source fingerprints
* \`Sourcera_Master_Spec.md\`: \`sha256:${MASTER}\`
* \`UX_Design_of_Sourcera.md\`: \`sha256:${UX}\`
`),
    { masterSpecSha256: MASTER, uxDesignSha256: UX },
  );
});

test("rejects missing or stale planning source fingerprints", () => {
  assert.throws(
    () =>
      assertLinearPlanningSourceFingerprints(scope(), fingerprint(), {
        masterSpecSha256: "c".repeat(64),
        uxDesignSha256: UX,
      }),
    /differ from canonical sources/,
  );
  assert.throws(
    () =>
      assertLinearPlanningSourceFingerprints(
        scope(),
        fingerprint({ masterSpecSha256: null, uxDesignSha256: UX }),
        { masterSpecSha256: MASTER, uxDesignSha256: UX },
      ),
    /differ from canonical sources/,
  );
});

test("rejects duplicate fingerprints for one canonical source", () => {
  assert.throws(
    () =>
      linearPlanningSourceFingerprints(
        `Sourcera_Master_Spec.md sha256:${MASTER} sha256:${UX}`,
      ),
    /repeats Sourcera_Master_Spec.md fingerprint/,
  );
});

test("captures exact level-two planning document sections", () => {
  assert.deepEqual(
    linearPlanningSectionHeadings(`
# Planning authority
## Binding authority
### Detail
## Program completion ##
`),
    ["Binding authority", "Program completion"],
  );
});

test("rejects missing planning body coverage and attachment drift", () => {
  const programScope = scope();
  programScope.outcomeInitiatives = Array.from({ length: 6 }, (_, index) => ({
    id: `00000000-0000-4000-8000-00000000000${index}`,
    name: `Outcome ${index}`,
  }));
  const projectIds = Array.from(
    { length: 6 },
    (_, index) => `22222222-2222-4222-8222-22222222222${index}`,
  );
  programScope.projectInitiatives = projectIds.map((projectId, index) => ({
    projectId,
    initiativeIds: [programScope.outcomeInitiatives[index].id],
  }));
  programScope.projectDescriptionFingerprints = projectIds.map(
    (projectId, index) => ({
      projectId,
      descriptionFingerprint: "d".repeat(64),
      milestones: index === 0
        ? [{
          milestoneId: "44444444-4444-4444-8444-444444444444",
          descriptionFingerprint: "e".repeat(64),
        }]
        : [],
    }),
  );
  const programFingerprint = fingerprint();
  programFingerprint.initiatives = programScope.outcomeInitiatives.map((initiative) => ({
    ...initiative,
    updatedAt: "2026-07-23T00:00:00.000Z",
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
  }));
  programFingerprint.projectInitiatives = programScope.projectInitiatives;

  assert.doesNotThrow(() =>
    assertLinearProgramScope(programScope, programFingerprint)
  );
  const legacyParent = structuredClone(programScope) as LinearProgramScope & {
    parentInitiative: { id: string; name: string };
  };
  legacyParent.parentInitiative = {
    id: "68b43674-ef5a-431e-8105-431ba60892bd",
    name: "Legacy wrapper",
  };
  assert.throws(
    () => assertLinearProgramScope(legacyParent, programFingerprint),
    /missing or invalid/,
  );
  const seventhInitiative = structuredClone(programFingerprint);
  seventhInitiative.initiatives.push({
    ...seventhInitiative.initiatives[0],
    id: "77777777-7777-4777-8777-777777777777",
    name: "Duplicate wrapper",
  });
  assert.throws(
    () => assertLinearProgramScope(programScope, seventhInitiative),
    /inventory differs/,
  );
  const emptyMembership = structuredClone(programScope);
  emptyMembership.projectInitiatives[0].initiativeIds = [];
  assert.throws(
    () => assertLinearProgramScope(emptyMembership, programFingerprint),
    /mappings are incomplete or invalid/,
  );
  const doubleMembership = structuredClone(programScope);
  doubleMembership.projectInitiatives[0].initiativeIds.push(
    programScope.outcomeInitiatives[1].id,
  );
  assert.throws(
    () => assertLinearProgramScope(doubleMembership, programFingerprint),
    /mappings are incomplete or invalid/,
  );
  const unusedInitiative = structuredClone(programScope);
  unusedInitiative.projectInitiatives[5].initiativeIds = [
    programScope.outcomeInitiatives[0].id,
  ];
  assert.throws(
    () => assertLinearProgramScope(unusedInitiative, programFingerprint),
    /owns no project/,
  );
  const missingSection = structuredClone(programFingerprint);
  missingSection.documents[0].sectionHeadings = ["Binding authority"];
  assert.throws(
    () => assertLinearProgramScope(programScope, missingSection),
    /lacks a required section/,
  );
  const attachmentDrift = structuredClone(programFingerprint);
  attachmentDrift.documents[0].teamId =
    "33333333-3333-4333-8333-333333333333";
  assert.throws(
    () => assertLinearProgramScope(programScope, attachmentDrift),
    /attached incorrectly/,
  );
  const missingBodyFingerprint = structuredClone(programFingerprint);
  missingBodyFingerprint.documents[0].contentFingerprint = "";
  assert.throws(
    () => assertLinearProgramScope(programScope, missingBodyFingerprint),
    /content fingerprint is invalid/,
  );
  const changedBody = structuredClone(programFingerprint);
  changedBody.documents[0].contentFingerprint = "f".repeat(64);
  assert.throws(
    () => assertLinearProgramScope(programScope, changedBody),
    /body differs from the approved fingerprint/,
  );

  const exactDescriptions = {
    program: programFingerprint,
    projects: projectIds.map((id) => ({
      id,
      descriptionFingerprint: "d".repeat(64),
    })),
    projectMilestones: [{
      id: "44444444-4444-4444-8444-444444444444",
      projectId: projectIds[0],
      descriptionFingerprint: "e".repeat(64),
    }],
    releases: [],
    cycles: [],
  } as any;
  assert.doesNotThrow(() =>
    assertLinearPlanningContractFingerprints(programScope, exactDescriptions)
  );
  exactDescriptions.projects[0].descriptionFingerprint = "f".repeat(64);
  assert.throws(
    () => assertLinearPlanningContractFingerprints(programScope, exactDescriptions),
    /project descriptions differ/,
  );
});

test("every capture and provenance path asserts the exact planning contract before writing", () => {
  const liveCli = readFileSync("tools/delivery/linear-live.ts", "utf8");
  const liveAssertion = liveCli.indexOf(
    "assertLinearPlanningContractFingerprints(programScope, actual)",
  );
  assert.ok(liveAssertion > 0);
  assert.ok(liveAssertion < liveCli.indexOf("if (outPath)"));

  const provenance = readFileSync(
    "tools/delivery/reconcile-linear-source-provenance.ts",
    "utf8",
  );
  const validatorStart = provenance.indexOf("function validatedProgram(");
  const validatorEnd = provenance.indexOf("function assertPreWriteReadback(");
  const validator = provenance.slice(validatorStart, validatorEnd);
  assert.match(
    validator,
    /assertLinearPlanningContractFingerprints\(programScope, capture\.fingerprint\)/,
  );
});
