import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  CANONICAL_PROJECT_DOCUMENT_SECTIONS,
  ENGINEERING_BRIEF_PROJECT_NAMES,
  linearProjectDocumentDecisionFindings,
  linearProjectDocumentCaptureSelection,
  linearProjectDocumentFingerprint,
  linearProjectDocumentFingerprintFindings,
  linearProjectDocumentScopeFindings,
  linearProjectDocumentTitleReserved,
  REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES,
  SOURCERA_DECISION_LABEL_ID,
  SOURCERA_DECISION_LABEL_GROUP_ID,
  SOURCERA_DECISION_LABEL_GROUP_NAME,
  SOURCERA_DECISION_LABEL_NAME,
  SOURCERA_LINEAR_WORKSPACE_SLUG,
  SUPPLEMENTARY_DOCUMENT_PROJECT_NAMES,
  SUPPLEMENTARY_DOCUMENT_REQUIRED_SECTIONS,
  type LinearProjectDocumentDecisionContract,
  type LinearDecisionIssueFingerprint,
  type LinearDecisionTargetFingerprint,
  type LinearProjectDocumentScopeRow,
  type LinearSupplementaryDocumentScopeRow,
} from "./lib/linear-project-documents.js";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import { linearPlanningSectionHeadings } from "./lib/linear-program-scope.js";

const MASTER = "a".repeat(64);
const DECISION_URL =
  "https://linear.app/sourcera-production/issue/PLA-42/choose-pilot-mode";
const DECISION_DESCRIPTION = "d".repeat(64);

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

const customerProjectNames = [
  "Buyer Workspaces & Evaluation Pipeline",
  "Product Analytics, Growth & Network Effects",
  ...Array.from({ length: 18 }, (_, index) => `Customer project ${index + 1}`),
];
const projectNames = [...customerProjectNames, ...ENGINEERING_BRIEF_PROJECT_NAMES];
const projectIds = projectNames.map((_, index) => uuid(index + 1));

function body(unresolved = "None."): string {
  return `# Canonical project brief

## Problem, users and measurable outcome
Outcome.

## Scope and explicit non-goals
Scope and exclusions.

## Journeys, failure states and recovery
Journey and recovery.

## Security, privacy, accessibility and localization
Applicable controls.

## Success thresholds
Numeric thresholds.

## Rollout, rollback, migration and support
Safe delivery and support.

## Master Spec binding
- Sourcera_Master_Spec.md: sha256:${MASTER}
- Sections: §10.1

## Unresolved decisions
${unresolved}
`;
}

function supplementaryBody(
  title: LinearSupplementaryDocumentScopeRow["title"],
): string {
  return `# R0 control artifact

${SUPPLEMENTARY_DOCUMENT_REQUIRED_SECTIONS[title]
  .map((heading) =>
    heading === "Master Spec binding"
      ? `## ${heading}\n- Sourcera_Master_Spec.md: sha256:${MASTER}\n- Sections: §10.1`
      : heading === "Unresolved decisions"
        ? `## ${heading}\nNone.`
        : `## ${heading}\nApproved content.`
  )
  .join("\n\n")}
`;
}

function canonicalScope(): LinearProjectDocumentScopeRow[] {
  return projectNames.map((projectName, index) => {
    const kind = ENGINEERING_BRIEF_PROJECT_NAMES.includes(
      projectName as (typeof ENGINEERING_BRIEF_PROJECT_NAMES)[number],
    )
      ? "engineering_readiness_brief" as const
      : "prd" as const;
    return {
      id: uuid(index + 101),
      projectId: projectIds[index],
      projectName,
      kind,
      title: `${kind === "prd" ? "PRD" : "Engineering/Readiness Brief"} — ${projectName}`,
      contentFingerprint: descriptionFingerprint(body()),
      requiredSections: [...CANONICAL_PROJECT_DOCUMENT_SECTIONS],
      masterSpecSections: ["§10.1"],
    };
  });
}

function supplementaryScope(): LinearSupplementaryDocumentScopeRow[] {
  return REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES.map((title, index) => ({
    id: uuid(index + 201),
    projectId: projectIds[
      projectNames.indexOf(SUPPLEMENTARY_DOCUMENT_PROJECT_NAMES[title])
    ],
    title,
    contentFingerprint: descriptionFingerprint(supplementaryBody(title)),
    requiredSections: [...SUPPLEMENTARY_DOCUMENT_REQUIRED_SECTIONS[title]],
    masterSpecSections: ["§10.1"],
  }));
}

function decisionContract(
  documentId = canonicalScope()[0].id,
): LinearProjectDocumentDecisionContract {
  const humanOnlyLabelId = uuid(901);
  return {
    workspaceSlug: SOURCERA_LINEAR_WORKSPACE_SLUG,
    decisionLabelId: SOURCERA_DECISION_LABEL_ID,
    labelDefinitions: [
      {
        id: SOURCERA_DECISION_LABEL_ID,
        name: SOURCERA_DECISION_LABEL_NAME,
        groupId: SOURCERA_DECISION_LABEL_GROUP_ID,
        groupName: SOURCERA_DECISION_LABEL_GROUP_NAME,
      },
      {
        id: humanOnlyLabelId,
        name: "human-only",
        groupId: uuid(902),
        groupName: "Agent",
      },
    ],
    trackedDecisions: [{
      decisionIdentifier: "PLA-42",
      decisionTitle: "Choose pilot mode",
      decisionUrl: DECISION_URL,
      descriptionFingerprint: DECISION_DESCRIPTION,
      requiredSections: ["Decision required"],
      decisionProjectId: projectIds[0],
      labelIds: [SOURCERA_DECISION_LABEL_ID, humanOnlyLabelId],
      resolution: "open",
      blockedIssues: [{
        identifier: "PLA-43",
        projectId: projectIds[1],
      }],
    }],
    references: [{
      documentId,
      decisionIdentifier: "PLA-42",
    }],
  };
}

function fingerprint(
  row: LinearProjectDocumentScopeRow | LinearSupplementaryDocumentScopeRow,
  content = "kind" in row ? body() : supplementaryBody(row.title),
) {
  return linearProjectDocumentFingerprint(
    {
      id: row.id,
      title: row.title,
      content,
      updatedAt: "2026-07-27T00:00:00.000Z",
      archivedAt: null,
      initiative: null,
      project: {
        id: row.projectId,
        name: "projectName" in row
          ? row.projectName
          : canonicalScope().find(
            (canonical) => canonical.projectId === row.projectId,
          )!.projectName,
      },
      team: null,
      issue: null,
    },
    descriptionFingerprint,
    linearPlanningSectionHeadings,
  );
}

test("defines exactly twenty PRDs, six engineering briefs, and three R0 supplements", () => {
  assert.deepEqual(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      supplementaryScope(),
      projectIds,
      decisionContract(),
    ),
    [],
  );
  const wrongTitle = canonicalScope();
  wrongTitle[0].title = `PRD — ${wrongTitle[1].projectName}`;
  assert.equal(
    linearProjectDocumentScopeFindings(
      wrongTitle,
      supplementaryScope(),
      projectIds,
      decisionContract(),
    )[0]?.code,
    "linear_project_document_scope_invalid",
  );
  const wrongSupplementOwner = supplementaryScope();
  wrongSupplementOwner[0].projectId = projectIds[1];
  assert.match(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      wrongSupplementOwner,
      projectIds,
      decisionContract(),
    ).map((finding) => finding.code).join(" "),
    /linear_supplementary_document_scope_invalid/,
  );
});

test("requires exact canonical and approved supplementary document inventory", () => {
  const canonical = canonicalScope();
  const supplementary = supplementaryScope();
  const live = [...canonical, ...supplementary].map((row) => fingerprint(row));
  assert.deepEqual(
    linearProjectDocumentFingerprintFindings(canonical, supplementary, live),
    [],
  );

  const missing = live.slice(1);
  assert.match(
    linearProjectDocumentFingerprintFindings(canonical, supplementary, missing)
      .map((finding) => finding.code)
      .join(" "),
    /linear_project_document_topology_changed/,
  );

  const extra = structuredClone(live[0]);
  extra.id = uuid(999);
  extra.title = "Ordinary project note";
  const expectedIds = new Set(live.map((document) => document.id));
  const selection = linearProjectDocumentCaptureSelection(
    [
      ...live.map((document) => ({
        ...document,
        project: document.projectId && document.projectName
          ? { id: document.projectId, name: document.projectName }
          : null,
      })),
      {
        ...extra,
        project: extra.projectId && extra.projectName
          ? { id: extra.projectId, name: extra.projectName }
          : null,
        contentFingerprint: "changed unrelated note body",
      },
    ],
    expectedIds,
    new Set(projectIds),
    canonical,
    supplementary,
  );
  assert.deepEqual(selection.governed.map((document) => document.id).sort(), [
    ...expectedIds,
  ].sort());
  assert.deepEqual(selection.conflicts, []);
  assert.deepEqual(
    linearProjectDocumentFingerprintFindings(
      canonical,
      supplementary,
      live,
      [],
    ),
    [],
  );
  assert.match(
    linearProjectDocumentFingerprintFindings(
      canonical,
      supplementary,
      [...live, extra],
    ).map((finding) => finding.code).join(" "),
    /linear_project_document_inventory_changed/,
  );
  for (const title of [
    "PRD — Unapproved planning copy",
    "prd — duplicate",
    "  PrD   -   duplicate  ",
    "ENGINEERING/READINESS BRIEF – duplicate",
  ]) {
    assert.equal(
      linearProjectDocumentTitleReserved(title, canonical, supplementary),
      true,
    );
    const collisionSelection = linearProjectDocumentCaptureSelection(
      [{
        id: extra.id,
        title,
        archivedAt: null,
        project: {
          id: extra.projectId!,
          name: extra.projectName!,
        },
      }],
      expectedIds,
      new Set(projectIds),
      canonical,
      supplementary,
    );
    assert.equal(collisionSelection.conflicts.length, 1);
    assert.match(
      linearProjectDocumentFingerprintFindings(
        canonical,
        supplementary,
        live,
        collisionSelection.conflicts,
      ).map((finding) => finding.code).join(" "),
      /linear_project_document_unapproved/,
    );
  }
  assert.deepEqual(
    linearProjectDocumentFingerprintFindings(
      canonical,
      supplementary,
      live,
      [],
    ),
    [],
  );

  const renamedProject = structuredClone(live);
  renamedProject[0].projectName = "Wrong project";
  assert.match(
    linearProjectDocumentFingerprintFindings(
      canonical,
      supplementary,
      renamedProject,
    ).map((finding) => finding.code).join(" "),
    /linear_project_document_topology_changed/,
  );
});

test("rejects copied native metadata and accepts only native Decision links", () => {
  const row = canonicalScope()[0];
  const nativeDecision = `- ${DECISION_URL}`;
  const valid = fingerprint(row, body(nativeDecision));
  assert.deepEqual(valid.contentPolicyFindings, []);
  assert.deepEqual(valid.unresolvedDecisionReferences, [{
    identifier: "PLA-42",
    url: DECISION_URL,
  }]);

  const liveReadback = fingerprint(
    row,
    body(
      `- [${DECISION_URL}](<${DECISION_URL}>)`,
    ),
  );
  assert.deepEqual(liveReadback.contentPolicyFindings, []);
  assert.deepEqual(liveReadback.unresolvedDecisionReferences, [{
    identifier: "PLA-42",
    url: DECISION_URL,
  }]);

  const markdownLink = fingerprint(
    row,
    body(
      `- [PLA-42](${DECISION_URL})`,
    ),
  );
  assert.match(
    markdownLink.contentPolicyFindings.join(" "),
    /native_issue_reference_arbitrary_markdown_label/,
  );

  for (const hiddenReference of [
    `\`${DECISION_URL}\``,
    `\`\`\`text\n${DECISION_URL}\n\`\`\``,
    `<!-- ${DECISION_URL} -->`,
    `![Decision reference](${DECISION_URL})`,
  ]) {
    const hidden = fingerprint(row, body(hiddenReference));
    assert.deepEqual(hidden.unresolvedDecisionReferences, []);
    assert.match(
      hidden.contentPolicyFindings.join(" "),
      /unresolved_decisions_lack_native_references/,
    );
  }

  const invalid = fingerprint(
    row,
    `${body("- Decide mode in PLA-42")}
Project: Buyer
Initiative: Grow trust
Lead: Product
Start date: 2026-08-01
Target date: 2026-09-01
## Dependencies
Blocked by: PLA-42
Depends on: Platform Foundations
Prerequisite: Security review
`,
  );
  assert.match(invalid.contentPolicyFindings.join(" "), /manual_issue_reference/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_field_project/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_field_initiative/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_field_lead/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_field_start_date/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_field_target_date/);
  assert.match(invalid.contentPolicyFindings.join(" "), /native_relation_duplicated/);
  for (const dependencyLine of [
    "Depends on: Platform Foundations",
    "Prerequisites: Security review",
  ]) {
    assert.match(
      fingerprint(row, `${body()}\n${dependencyLine}\n`)
        .contentPolicyFindings.join(" "),
      /native_relation_duplicated/,
    );
  }

  const unfinished = fingerprint(
    row,
    body().replace("Outcome.", "TODO").replace("Scope and exclusions.", ""),
  );
  assert.match(unfinished.contentPolicyFindings.join(" "), /unresolved_placeholder/);
  assert.match(unfinished.contentPolicyFindings.join(" "), /empty_section/);

  assert.deepEqual(
    fingerprint(row, body("No open decisions.")).contentPolicyFindings,
    [],
  );
});

test("tracks open and completed Decisions with exact native identity and history", () => {
  const row = canonicalScope()[0];
  const contract = decisionContract(row.id);
  const document = fingerprint(
    row,
    body(`- ${DECISION_URL}`),
  );
  const decision: LinearDecisionIssueFingerprint = {
    identifier: "PLA-42",
    title: "Choose pilot mode",
    url: DECISION_URL,
    descriptionFingerprint: DECISION_DESCRIPTION,
    sectionHeadings: ["Decision required"],
    archivedAt: null,
    stateType: "backlog",
    labels: structuredClone(contract.labelDefinitions),
    projectId: row.projectId,
    relations: ["blocks:PLA-42:PLA-43"],
  };
  const target: LinearDecisionTargetFingerprint = {
    identifier: "PLA-43",
    archivedAt: null,
    stateType: "backlog",
    projectId: projectIds[1],
    relations: ["blocks:PLA-42:PLA-43"],
  };
  const verify = (
    decisionIssues: LinearDecisionIssueFingerprint[] = [decision],
    issues: LinearDecisionTargetFingerprint[] = [target],
    actualDocument = document,
    actualContract = contract,
  ) =>
    linearProjectDocumentDecisionFindings(
      [actualDocument],
      decisionIssues,
      issues,
      actualContract,
      [row.id],
    );
  assert.deepEqual(verify(), []);
  assert.equal(
    verify([{ ...decision, relations: [] }])[0]?.code,
    "linear_project_document_decision_reference_invalid",
  );
  for (const changed of [
    { ...decision, title: "Repurposed Decision" },
    { ...decision, descriptionFingerprint: "0".repeat(64) },
    {
      ...decision,
      descriptionFingerprint: descriptionFingerprint(""),
      sectionHeadings: [],
    },
  ]) {
    assert.match(
      verify([changed]).map((finding) => finding.code).join(" "),
      /linear_project_document_decision_reference_invalid/,
    );
  }
  for (const field of ["name", "groupName", "groupId"] as const) {
    const labels = structuredClone(decision.labels);
    const humanOnly = labels.find((label) => label.name === "human-only")!;
    humanOnly[field] = field === "groupId" ? uuid(999) : "drifted";
    assert.match(
      verify([{ ...decision, labels }]).map((finding) => finding.code).join(" "),
      /linear_project_document_decision_reference_invalid/,
    );
  }
  for (const field of ["name", "groupName", "groupId"] as const) {
    const labels = structuredClone(decision.labels);
    const decisionLabel = labels.find(
      (label) => label.id === SOURCERA_DECISION_LABEL_ID,
    )!;
    decisionLabel[field] = field === "groupId" ? uuid(998) : "drifted";
    assert.match(
      verify([{ ...decision, labels }]).map((finding) => finding.code).join(" "),
      /linear_project_document_decision_reference_invalid/,
    );
  }
  assert.match(
    verify([decision], [{ ...target, stateType: "completed" }])
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );
  assert.match(
    verify([decision], [{ ...target, relations: [] }])
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );
  assert.match(
    verify([decision], [])
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );
  const wrongWorkspace = fingerprint(
    row,
    body("- https://linear.app/other/issue/PLA-42/choose-pilot-mode"),
  );
  assert.match(
    verify([decision], [target], wrongWorkspace)
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );
  const wrongTargetContract = structuredClone(contract);
  wrongTargetContract.trackedDecisions[0].blockedIssues[0].identifier = "PLA-42";
  assert.match(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      supplementaryScope(),
      projectIds,
      wrongTargetContract,
    ).map((finding) => finding.code).join(" "),
    /linear_project_document_decision_scope_invalid/,
  );
  assert.match(
    verify([], [target])
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );

  const multiTargetContract = structuredClone(contract);
  multiTargetContract.trackedDecisions[0].blockedIssues.push({
    identifier: "PLA-44",
    projectId: projectIds[2],
  });
  const secondTarget: LinearDecisionTargetFingerprint = {
    identifier: "PLA-44",
    archivedAt: null,
    stateType: "backlog",
    projectId: projectIds[2],
    relations: ["blocks:PLA-42:PLA-44"],
  };
  const multiTargetDecision = {
    ...decision,
    relations: [...decision.relations, "blocks:PLA-42:PLA-44"],
  };
  assert.deepEqual(
    verify(
      [multiTargetDecision],
      [target, secondTarget],
      document,
      multiTargetContract,
    ),
    [],
  );
  assert.match(
    verify(
      [{
        ...multiTargetDecision,
        relations: [...multiTargetDecision.relations, "blocks:PLA-42:PLA-45"],
      }],
      [target, secondTarget],
      document,
      multiTargetContract,
    ).map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );

  const completedContract = structuredClone(contract);
  completedContract.trackedDecisions[0].resolution = "completed";
  completedContract.references = [];
  const completedDocument = fingerprint(row, body("None."));
  const completedDecision = { ...decision, stateType: "completed" };
  const archivedTarget = {
    ...target,
    archivedAt: "2026-07-27T00:00:00.000Z",
    stateType: "completed",
  };
  assert.deepEqual(
    verify(
      [completedDecision],
      [archivedTarget],
      completedDocument,
      completedContract,
    ),
    [],
  );
  assert.match(
    verify([decision], [target], completedDocument, completedContract)
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_reference_invalid/,
  );
  assert.match(
    verify([completedDecision], [target], document, completedContract)
      .map((finding) => finding.code).join(" "),
    /linear_project_document_decision_inventory_changed/,
  );
  assert.deepEqual(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      supplementaryScope(),
      projectIds,
      completedContract,
    ),
    [],
  );

  const emptyHistory = structuredClone(completedContract);
  emptyHistory.trackedDecisions = [];
  assert.deepEqual(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      supplementaryScope(),
      projectIds,
      emptyHistory,
    ),
    [],
  );

  const legacyReference = structuredClone(contract) as unknown as {
    references: Array<Record<string, unknown>>;
  };
  legacyReference.references[0].decisionUrl = DECISION_URL;
  assert.match(
    linearProjectDocumentScopeFindings(
      canonicalScope(),
      supplementaryScope(),
      projectIds,
      legacyReference as unknown as LinearProjectDocumentDecisionContract,
    ).map((finding) => finding.code).join(" "),
    /linear_project_document_decision_scope_invalid/,
  );
});

test("document body fingerprints remain stable and source-bound", () => {
  const row = canonicalScope()[0];
  const actual = fingerprint(row);
  assert.equal(
    actual.contentFingerprint,
    createHash("sha256").update(body()).digest("hex"),
  );
  assert.equal(actual.masterSpecSha256, MASTER);
  assert.deepEqual(actual.masterSpecSections, ["§10.1"]);
});
