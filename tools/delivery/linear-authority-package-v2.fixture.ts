import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { descriptionFingerprint } from "./lib/fingerprint.js";
import {
  canonicalAuthorityRelationPlanKey,
  type AuthorityDocumentTarget,
  type AuthorityManagedTarget,
  type AuthorityNativeRelation,
  type LinearAuthorityValidationInput,
  type LinearTargetAllocation,
} from "./lib/linear-authority-manifest.js";
import {
  buildLinearAuthorityPackageV2,
  type LinearAuthorityPackageBuilderInputV2,
  type LinearAuthorityPackagePlanV2,
  type LinearAuthorityPackageV2,
} from "./lib/linear-authority-package-v2.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  buildLinearAuthoritySemanticPlanV4FromCapture,
  canonicalLinearAuthoritySemanticPlanV4Json,
} from "./lib/linear-authority-semantic-plan-v4.js";
import {
  compileLinearAuthoritySourceLineage,
  computeLinearAuthoritySourceSetRoot,
  LINEAR_AUTHORITY_SOURCE_SPECS,
  normalizeLinearAuthoritySourceMarkdown,
  type LinearAuthoritySourceLineageSource,
} from "./lib/linear-authority-source-lineage.js";
import {
  buildLinearAuthorityRequirementPublicationSequence,
  canonicalLinearAuthorityRequirementPublicationSequenceJson,
} from "./lib/linear-authority-publication-sequence.js";
import {
  buildLinearAuthorityRequirementAdoptionArtifacts,
  buildLinearAuthorityRequirementBaseline,
  canonicalLinearAuthorityRequirementBaselineJson,
  parseLinearAuthorityRequirementBootstrapMap,
} from "./lib/linear-authority-requirement-adoption.js";
import type {
  LinearFingerprint,
  LinearNativeIdentityCapture,
} from "./lib/linear-live.js";
import { canonicalLinearRelationKey } from "./lib/linear-live.js";
import {
  linearProjectDocumentFingerprint,
  type LinearProjectDocumentFingerprint,
} from "./lib/linear-project-documents.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./lib/linear-program-scope.js";
import {
  compileLinearAuthorityUnifiedPackage,
  type LinearAuthorityUnifiedCompilerInput,
} from "./lib/linear-authority-unified-compiler.js";

const CAPTURED_AT = "2026-07-28T00:00:00.000Z";
const WORKSPACE_ID = "c0000000-0000-4000-8000-000000000001";
const REQUIREMENTS_TEAM_ID = "c0000000-0000-4000-8000-000000000002";
const REQUIREMENT_LABEL_ID = "c0000000-0000-4000-8000-000000000003";
const DECISION_LABEL_ID = "df2bcb0f-2fca-41cb-a45c-37770a01aac2";
const TYPE_GROUP_ID = "b11e20d5-df7e-4e8b-a710-294827ff9b40";
const HUMAN_ONLY_LABEL_ID = "b29617b2-d787-4feb-b351-386df3286e87";
const PLATFORM_LABEL_ID = "70aedffb-e40d-4688-b723-99a3d4002565";
const MARKETPLACE_LABEL_ID = "4dafcf74-e922-48aa-9dab-19f80516e2ee";
const AGENT_GROUP_ID = "121eeb45-5276-441e-82b0-f85567f816db";
const DOMAIN_GROUP_ID = "2da596c3-1be9-494b-bf81-5ce1dd4d753b";
const RISK_GROUP_ID = "93000000-0000-4000-8000-000000000002";
const RISK_LABEL_IDS = [
  "94000000-0000-4000-8000-000000000001",
  "94000000-0000-4000-8000-000000000002",
  "94000000-0000-4000-8000-000000000003",
  "94000000-0000-4000-8000-000000000004",
  "94000000-0000-4000-8000-000000000005",
] as const;
const BLAKE_ID = "e7e65e19-33ee-445e-9be4-7e9e734a5463";
const PLA_BACKLOG_ID = "93000000-0000-4000-8000-000000000001";
const APPROVED_STATE_ID = "c0000000-0000-4000-8000-000000000006";
const RETIRED_STATE_ID = "c0000000-0000-4000-8000-000000000007";
const SUPERSEDED_STATE_ID = "c0000000-0000-4000-8000-000000000008";
const EXECUTION_TEAM_IDS = new Map([
  ["PLA", "d0000000-0000-4000-8000-000000000001"],
  ["BUY", "d0000000-0000-4000-8000-000000000002"],
  ["SEL", "d0000000-0000-4000-8000-000000000003"],
  ["INT", "d0000000-0000-4000-8000-000000000004"],
]);
const EXECUTION_STATE_IDS = new Map([
  ["PLA", "d0000000-0000-4000-8000-000000000011"],
  ["BUY", "d0000000-0000-4000-8000-000000000012"],
  ["SEL", "d0000000-0000-4000-8000-000000000013"],
  ["INT", "d0000000-0000-4000-8000-000000000014"],
]);
const TEAM_PLAN_KEY = "team:requirements";
const REQUIREMENT_LABEL_PLAN_KEY = "label:requirement";
const DECISION_LABEL_PLAN_KEY = "label:decision";
const STATE_PLAN_KEYS = {
  Approved: "state:approved",
  Retired: "state:retired",
  Superseded: "state:superseded",
} as const;

const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");
const json = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\n`, "utf8");
const clone = <T>(value: T): T => structuredClone(value);
const compare = (left: string, right: string): number => left.localeCompare(right);
const sort = (values: readonly string[]): string[] => [...values].sort(compare);
const projectPlanKey = (id: string): string => `project:${id}`;
const initiativePlanKey = (id: string): string => `initiative:${id}`;
const referencePlanKey = (identifier: string): string => `relation-target:${identifier}`;

function managedPayloadSha256(target: AuthorityManagedTarget): string {
  return sha256(JSON.stringify({
    title: target.title,
    description: target.description,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey,
    priority: target.priority,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: target.releasePlanKeys,
    labelPlanKeys: target.labelPlanKeys,
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  }));
}

function currentIssueNativeSha(issue: LinearNativeIdentityCapture["issues"][number]): string {
  return sha256(JSON.stringify({
    teamId: issue.teamId,
    stateId: issue.stateId,
    projectId: issue.projectId,
    estimate: issue.estimate,
    priority: issue.priority,
    dueDate: issue.dueDate,
    cycleId: issue.cycleId,
    milestoneId: issue.milestoneId,
    releaseIds: sort(issue.releaseIds),
    parentIssueUuid: issue.parentIssueUuid,
    assigneeId: issue.assigneeId,
    labelIds: sort(issue.labelIds),
  }));
}

function currentDocumentTopologySha(
  document: LinearNativeIdentityCapture["documents"][number],
): string {
  return sha256(JSON.stringify({
    initiativeId: document.initiativeId,
    projectId: document.projectId,
    teamId: document.teamId,
    issueId: document.issueId,
    releaseId: document.releaseId,
    cycleId: document.cycleId,
  }));
}

const connectionCoverage = (rows: number) => ({
  terminal: true as const,
  pages: 1,
  rows,
  finalCursor: null,
  attempts: 1,
});

const nestedCoverage = (rows: number) => ({
  terminal: true as const,
  pages: 1,
  rows,
  finalCursor: null,
  attempts: 1,
});

function recalculateCaptureCoverage(capture: LinearNativeIdentityCapture): void {
  capture.coverage.totals = {
    issues: capture.issues.length,
    labels: capture.labels.length,
    labelAssignments: capture.issues.reduce((sum, issue) => sum + issue.labelIds.length, 0),
    relations: capture.relations.length,
    teams: capture.teams.length,
    workflowStates: capture.workflowStates.length,
    users: capture.users.length,
    initiatives: capture.initiatives.length,
    projects: capture.projects.length,
    releasePipelines: capture.releasePipelines.length,
    releases: capture.releases.length,
    projectMilestones: capture.projectMilestones.length,
    cycles: capture.cycles.length,
    documents: capture.documents.length,
  };
  capture.coverage.topLevel = {
    issues: connectionCoverage(capture.issues.length),
    labels: connectionCoverage(capture.labels.length),
    teams: connectionCoverage(capture.teams.length),
    workflowStates: connectionCoverage(capture.workflowStates.length),
    users: connectionCoverage(capture.users.length),
    initiatives: connectionCoverage(capture.initiatives.length),
    projects: connectionCoverage(capture.projects.length),
    releasePipelines: connectionCoverage(capture.releasePipelines.length),
    releases: connectionCoverage(capture.releases.length),
    projectMilestones: connectionCoverage(capture.projectMilestones.length),
    cycles: connectionCoverage(capture.cycles.length),
    documents: connectionCoverage(capture.documents.length),
  };
  capture.coverage.perIssue = capture.issues.map((issue) => ({
    issueUuid: issue.issueUuid,
    identifier: issue.identifier,
    labels: nestedCoverage(issue.labelIds.length),
    relations: nestedCoverage(capture.relations.filter((row) => row.issueId === issue.issueUuid).length),
    inverseRelations: nestedCoverage(capture.relations.filter((row) => row.relatedIssueId === issue.issueUuid).length),
  }));
  capture.coverage.perProject = capture.projects.map((project) => ({
    projectId: project.id,
    teams: nestedCoverage(project.teamIds.length),
    initiatives: nestedCoverage(project.initiativeIds.length),
  }));
}

function sectionedDocument(
  title: string,
  sections: readonly string[],
  sectionBody: (section: string) => string = () => "Complete.",
): string {
  return `# ${title}\n\n${sections.map((section) =>
    `## ${section}\n\n${sectionBody(section)}`).join("\n\n")}\n`;
}

function markdownHeadings(content: string): string[] {
  return content.split(/\r?\n/).flatMap((line) =>
    /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line)?.[1].trim() ?? []);
}

function canonicalProgramFixture(
  repositoryRoot: string,
  sourceFiles: ReadonlyMap<string, Buffer>,
): { scope: LinearProgramScopeV3; contents: Map<string, string> } {
  const scope = clone(JSON.parse(
    readFileSync(join(repositoryRoot, "delivery/linear-program-scope.json"), "utf8"),
  ) as LinearProgramScopeV3);
  const masterSha = sha256(sourceFiles.get("Sourcera_Master_Spec.md")!);
  const uxSha = sha256(sourceFiles.get("UX_Design_of_Sourcera.md")!);
  const contents = new Map<string, string>();
  scope.planningDocument.teamId = REQUIREMENTS_TEAM_ID;
  const planningContent = sectionedDocument(
    scope.planningDocument.title,
    scope.planningDocument.requiredSections,
    (section) => section === "Canonical source fingerprints"
      ? `- Sourcera_Master_Spec.md: sha256:${masterSha}\n- UX_Design_of_Sourcera.md: sha256:${uxSha}`
      : section === scope.planningDocument.requiredSections[0]
        ? `Complete.\n\n${"x".repeat(20_000)}`
        : "Complete.",
  );
  scope.planningDocument.contentFingerprint = sha256(planningContent);
  contents.set(scope.planningDocument.id, planningContent);
  for (const row of [...scope.canonicalProjectDocuments, ...scope.supplementaryDocuments]) {
    const content = sectionedDocument(
      row.title,
      row.requiredSections,
      (section) => section === "Master Spec binding"
        ? `Sourcera_Master_Spec.md sha256:${masterSha}; ${row.masterSpecSections.join(", ")}`
        : "Complete.",
    );
    row.contentFingerprint = sha256(content);
    contents.set(row.id, content);
  }
  for (const project of scope.projectDescriptionFingerprints) project.milestones = [];
  scope.projectDocumentDecisionContract.decisionLabelId = DECISION_LABEL_ID;
  scope.projectDocumentDecisionContract.labelDefinitions[0] = {
    id: DECISION_LABEL_ID,
    name: "decision",
    groupId: TYPE_GROUP_ID,
    groupName: "Type",
  };
  scope.projectDocumentDecisionContract.trackedDecisions = [];
  scope.projectDocumentDecisionContract.references = [];
  return { scope, contents };
}

function documentRows(
  programScope: LinearProgramScopeV3,
  contents: ReadonlyMap<string, string>,
): LinearNativeIdentityCapture["documents"] {
  return [
    {
      expected: programScope.planningDocument,
      initiativeId: null,
      projectId: null,
      teamId: REQUIREMENTS_TEAM_ID,
    },
    ...[...programScope.canonicalProjectDocuments, ...programScope.supplementaryDocuments].map(
      (expected) => ({ expected, initiativeId: null, projectId: expected.projectId, teamId: null }),
    ),
  ].map(({ expected, initiativeId, projectId, teamId }) => ({
    id: expected.id,
    title: expected.title,
    contentSha256: sha256(contents.get(expected.id)!),
    updatedAt: CAPTURED_AT,
    archivedAt: null,
    initiativeId,
    projectId,
    teamId,
    issueId: null,
    releaseId: null,
    cycleId: null,
  }));
}

function programFingerprint(
  capture: LinearNativeIdentityCapture,
  programScope: LinearProgramScopeV3,
  rawContents: ReadonlyMap<string, string>,
  masterSpecSha256: string,
  uxDesignSha256: string,
) {
  const projectNameById = new Map(capture.projects.map((project) => [project.id, project.name]));
  const documentById = new Map(capture.documents.map((document) => [document.id, document]));
  const scopedProjectDocuments = [
    ...programScope.canonicalProjectDocuments,
    ...programScope.supplementaryDocuments,
  ];
  const projectDocuments: LinearProjectDocumentFingerprint[] = scopedProjectDocuments.map((expected) => {
    const document = documentById.get(expected.id)!;
    return linearProjectDocumentFingerprint({
      id: document.id,
      title: document.title,
      content: rawContents.get(document.id)!,
      updatedAt: document.updatedAt,
      archivedAt: document.archivedAt,
      initiative: document.initiativeId === null ? null : { id: document.initiativeId },
      project: document.projectId === null ? null : {
        id: document.projectId,
        name: projectNameById.get(document.projectId)!,
      },
      team: document.teamId === null ? null : { id: document.teamId },
      issue: document.issueId === null ? null : { id: document.issueId },
    }, descriptionFingerprint, (value) => markdownHeadings(value ?? ""));
  });
  return {
    initiatives: capture.initiatives.map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
      updatedAt: initiative.updatedAt,
      archivedAt: initiative.archivedAt,
      owner: null,
      ownerId: initiative.ownerId,
      status: initiative.status,
      priority: initiative.priority,
      health: initiative.health,
      healthUpdatedAt: initiative.healthUpdatedAt,
      targetDate: initiative.targetDate,
      targetDateResolution: initiative.targetDateResolution,
      parentInitiativeId: initiative.parentInitiativeId,
      parentInitiative: null,
    })),
    documents: [programScope.planningDocument].map((expected) => {
      const document = documentById.get(expected.id)!;
      return {
        id: document.id,
        title: document.title,
        updatedAt: document.updatedAt,
        archivedAt: document.archivedAt,
        initiativeId: document.initiativeId,
        projectId: document.projectId,
        teamId: document.teamId,
        issueId: document.issueId,
        contentFingerprint: document.contentSha256,
        sectionHeadings: markdownHeadings(rawContents.get(document.id)!),
        sourceFingerprints: { masterSpecSha256, uxDesignSha256 },
      };
    }),
    projectInitiatives: programScope.projectInitiatives,
    projectDocuments,
    projectDocumentConflicts: [],
    decisionIssues: [],
  };
}

function fingerprintFromCapture(
  capture: LinearNativeIdentityCapture,
  programScope: LinearProgramScopeV3,
  rawContents: ReadonlyMap<string, string>,
  descriptions: ReadonlyMap<string, string>,
  sourceFiles: ReadonlyMap<string, Buffer>,
): Buffer {
  const labelNameById = new Map(capture.labels.map((label) => [label.id, label.name]));
  const teamKeyById = new Map(capture.teams.map((team) => [team.id, team.key]));
  const stateById = new Map(capture.workflowStates.map((state) => [state.id, state]));
  const projectNameById = new Map(capture.projects.map((project) => [project.id, project.name]));
  const issueIdentifierById = new Map(capture.issues.map((issue) => [issue.issueUuid, issue.identifier]));
  const userNameById = new Map(capture.users.map((user) => [user.id, user.name]));
  const cycleById = new Map(capture.cycles.map((cycle) => [cycle.id, cycle]));
  const milestoneById = new Map(capture.projectMilestones.map((milestone) => [milestone.id, milestone]));
  const releaseById = new Map(capture.releases.map((release) => [release.id, release]));
  const masterSpecSha256 = sha256(sourceFiles.get("Sourcera_Master_Spec.md")!);
  const uxDesignSha256 = sha256(sourceFiles.get("UX_Design_of_Sourcera.md")!);
  const fingerprint: LinearFingerprint = {
    issues: capture.issues.map((issue) => {
      const state = stateById.get(issue.stateId)!;
      return {
        linearId: issue.issueUuid,
        identifier: issue.identifier,
        title: issue.title,
        descriptionFingerprint: descriptionFingerprint(descriptions.get(issue.identifier)!),
        updatedAt: CAPTURED_AT,
        estimate: issue.estimate,
        priority: issue.priority,
        dueDate: issue.dueDate,
        archivedAt: issue.archivedAt,
        stateId: issue.stateId,
        state: state.name,
        stateType: state.type,
        labels: issue.labelIds.map((id) => labelNameById.get(id)!).sort(),
        assignee: issue.assigneeId === null ? null : userNameById.get(issue.assigneeId)!,
        assigneeId: issue.assigneeId,
        team: teamKeyById.get(issue.teamId)!,
        teamId: issue.teamId,
        cycleId: issue.cycleId,
        cycleNumber: issue.cycleId === null ? null : cycleById.get(issue.cycleId)!.number,
        cycle: issue.cycleId === null ? null : cycleById.get(issue.cycleId)!.name,
        projectId: issue.projectId,
        project: issue.projectId === null ? null : projectNameById.get(issue.projectId)!,
        milestoneId: issue.milestoneId,
        milestone: issue.milestoneId === null ? null : milestoneById.get(issue.milestoneId)!.name,
        parentLinearId: issue.parentIssueUuid,
        parent: issue.parentIssueUuid === null ? null : issueIdentifierById.get(issue.parentIssueUuid)!,
        releases: issue.releaseIds.map((id) => releaseById.get(id)!.version ?? id).sort(),
        relations: issue.relationIds.map((id) =>
          capture.relations.find((relation) => relation.relationId === id)!.canonicalKey).sort(),
      };
    }),
    releasePipelines: [],
    releases: [],
    projects: programScope.projectDescriptionFingerprints.map((expected) => {
      const project = capture.projects.find((row) => row.id === expected.projectId)!;
      return {
        id: project.id,
        name: project.name,
        descriptionFingerprint: expected.descriptionFingerprint,
        updatedAt: project.updatedAt,
        archivedAt: project.archivedAt,
        statusId: project.statusId,
        status: project.status,
        statusType: project.statusType,
        priority: project.priority,
        lead: null,
        leadId: project.leadId,
        startDate: project.startDate,
        startDateResolution: project.startDateResolution,
        targetDate: project.targetDate,
        targetDateResolution: project.targetDateResolution,
      };
    }),
    projectMilestones: [],
    cycles: [],
    program: programFingerprint(
      capture,
      programScope,
      rawContents,
      masterSpecSha256,
      uxDesignSha256,
    ),
  };
  return json(fingerprint);
}

function makeManagedTarget(
  kind: "requirement" | "decision",
  planKey: string,
  title: string,
  description: string,
  projectKey: string,
  stateName: keyof typeof STATE_PLAN_KEYS,
  priority: number,
  blockKeys: string[],
  retired: boolean,
): AuthorityManagedTarget {
  const target: AuthorityManagedTarget = {
    kind,
    origin: retired ? "retired_source_disposition" : "source",
    planKey,
    title,
    expectedCurrentIssueUuid: null,
    expectedCurrentDescriptionSha256: null,
    expectedCurrentNativeSha256: null,
    expectedIdentifier: null,
    blockKeys,
    description,
    descriptionSha256: sha256(description),
    payloadSha256: "",
    teamPlanKey: TEAM_PLAN_KEY,
    projectPlanKey: projectKey,
    statePlanKey: STATE_PLAN_KEYS[stateName],
    labelPlanKeys: [kind === "requirement"
      ? REQUIREMENT_LABEL_PLAN_KEY
      : DECISION_LABEL_PLAN_KEY],
    priority,
    estimate: null,
    dueDate: null,
    cyclePlanKey: null,
    milestonePlanKey: null,
    releasePlanKeys: [],
    parentPlanKey: null,
    assigneePlanKey: null,
  };
  target.payloadSha256 = managedPayloadSha256(target);
  return target;
}

function nativeRelations(
  semantic: ReturnType<typeof buildLinearAuthoritySemanticPlanV4FromCapture>,
): AuthorityNativeRelation[] {
  const rows = new Map<string, AuthorityNativeRelation>();
  const add = (type: "blocks" | "related", sourcePlanKey: string, targetPlanKey: string) => {
    const planKey = canonicalAuthorityRelationPlanKey(type, sourcePlanKey, targetPlanKey);
    rows.set(planKey, { planKey, type, sourcePlanKey, targetPlanKey });
  };
  for (const requirement of semantic.plan.requirements) {
    const requirementKey = `issue:${requirement.canonicalLegacyId}`;
    for (const endpoint of requirement.execution) {
      add("related", requirementKey, referencePlanKey(endpoint));
    }
    for (const endpoint of requirement.proofExecutionDependencies) {
      add("related", requirementKey, referencePlanKey(endpoint));
    }
    for (const dependency of requirement.requirementDependencyLegacyIds) {
      add("blocks", `issue:${dependency}`, requirementKey);
    }
  }
  for (const decision of semantic.plan.decisions) {
    const decisionKey = `decision:${decision.legacyId}`;
    for (const endpoint of decision.existingRelations) {
      add("related", decisionKey, referencePlanKey(endpoint));
    }
    for (const requirement of decision.requirementRelations) {
      add("related", decisionKey, `issue:${requirement}`);
    }
  }
  return [...rows.values()].sort((left, right) => compare(left.planKey, right.planKey));
}

function documentTargets(
  programScope: LinearProgramScopeV3,
  contents: ReadonlyMap<string, string>,
  captured: readonly LinearNativeIdentityCapture["documents"][number][],
): AuthorityDocumentTarget[] {
  const capturedById = new Map(captured.map((document) => [document.id, document]));
  const specs: Array<{
    expected: LinearProgramScopeV3["planningDocument"] |
      LinearProgramScopeV3["canonicalProjectDocuments"][number] |
      LinearProgramScopeV3["supplementaryDocuments"][number];
    role: AuthorityDocumentTarget["role"];
    attachmentKind: AuthorityDocumentTarget["attachmentKind"];
    attachmentPlanKey: string;
  }> = [
    {
      expected: programScope.planningDocument,
      role: "binding_spec",
      attachmentKind: "team",
      attachmentPlanKey: TEAM_PLAN_KEY,
    },
    ...programScope.canonicalProjectDocuments.map((expected) => ({
      expected,
      role: expected.kind === "prd" ? "prd" as const : "engineering_brief" as const,
      attachmentKind: "project" as const,
      attachmentPlanKey: projectPlanKey(expected.projectId),
    })),
    ...programScope.supplementaryDocuments.map((expected) => ({
      expected,
      role: ({
        "R0 Defensible Evaluation PRD": "prd",
        "R0 Pilot Target Set": "research_context",
        "R0 Production Readiness Runbook": "engineering_brief",
      } as const)[expected.title],
      attachmentKind: "project" as const,
      attachmentPlanKey: projectPlanKey(expected.projectId),
    })),
  ];
  return specs.map(({ expected, role, attachmentKind, attachmentPlanKey }) => {
    const native = capturedById.get(expected.id)!;
    const content = contents.get(expected.id)!;
    return {
      origin: "live",
      planKey: `document:${expected.id}`,
      role,
      title: expected.title,
      blockKeys: [],
      content,
      contentSha256: sha256(content),
      canonicalReadbackSha256: sha256(content),
      attachmentKind,
      attachmentPlanKey,
      expectedCurrentDocumentId: native.id,
      expectedCurrentContentSha256: native.contentSha256,
      expectedCurrentTopologySha256: currentDocumentTopologySha(native),
    };
  });
}

function nextAllocatedUuid(reserved: Set<string>, counter: { value: number }): string {
  while (true) {
    const value = `f0000000-0000-4000-8000-${counter.value.toString(16).padStart(12, "0")}`;
    counter.value += 1;
    if (!reserved.has(value.toLowerCase())) {
      reserved.add(value.toLowerCase());
      return value;
    }
  }
}

export interface LinearAuthorityBootstrapPackageV2Fixture {
  authority: LinearAuthorityPackageV2;
  builderInput: LinearAuthorityPackageBuilderInputV2;
  validationInput: LinearAuthorityValidationInput;
  sourceFiles: ReadonlyMap<string, Buffer>;
}

export interface ValidatorValidLinearAuthorityPackageV2Fixture {
  authority: LinearAuthorityPackageV2;
  validationInput: LinearAuthorityValidationInput;
  sourceFiles: ReadonlyMap<string, Buffer>;
}

export function buildLinearAuthorityBootstrapPackageV2Fixture(
  repositoryRoot = process.cwd(),
): LinearAuthorityBootstrapPackageV2Fixture {
  const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
  const sourceFiles = new Map<string, Buffer>(LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => [
    spec.path,
    readFileSync(join(repositoryRoot, spec.path)),
  ]));
  const featureInventoryRaw = readFileSync(join(repositoryRoot, "_audit/FEATURE_INVENTORY.md"));
  const dispositionRegisterRaw = readFileSync(join(repositoryRoot, "delivery/dispositions.json"));
  const sourceChecksumsRaw = readFileSync(join(repositoryRoot, "delivery/ticket-source-checksums.json"));
  const projectScope = JSON.parse(
    readFileSync(join(repositoryRoot, "delivery/linear-project-scope.json"), "utf8"),
  ) as { schemaVersion: 1; projects: Array<{ id: string; name: string }> };
  const { scope: programScope, contents: documentContents } = canonicalProgramFixture(
    repositoryRoot,
    sourceFiles,
  );
  const core = buildLinearAuthoritySemanticCoreV4(repositoryRoot);
  const projectIdByName = new Map(projectScope.projects.map((project) => [project.name, project.id]));
  const referenceIdentifiers = sort([...new Set([
    ...core.requirements.flatMap((row) => row.execution),
    ...core.requirements.flatMap((row) => row.proofExecutionDependencies),
    ...core.decisions.flatMap((row) => row.existingRelations),
  ])]);
  const requirementBootstrapMapRaw = readFileSync(
    join(repositoryRoot, "delivery/linear-authority-requirement-bootstrap-map.json"),
  );
  const requirementBootstrapMap = parseLinearAuthorityRequirementBootstrapMap(
    requirementBootstrapMapRaw,
  );
  const requirementByLegacyId = new Map(
    core.requirements.map((row) => [row.canonicalLegacyId, row]),
  );
  const bootstrapLegacyIds = new Set(
    requirementBootstrapMap.entries.map((entry) => entry.canonicalLegacyId),
  );
  const requirementRows = [
    ...requirementBootstrapMap.entries.map((entry) =>
      requirementByLegacyId.get(entry.canonicalLegacyId)!),
    ...core.publicationSequence
      .filter((legacyId) => !bootstrapLegacyIds.has(legacyId))
      .slice(0, 125)
      .map((legacyId) => requirementByLegacyId.get(legacyId)!),
  ];
  const descriptions = new Map<string, string>();
  const requirementIssues: LinearNativeIdentityCapture["issues"] = requirementRows.map((row, index) => {
    const identifier = `REQ-${index + 1}`;
    const description = index < 61
      ? "Bootstrap description awaiting canonical reconciliation."
      : row.description;
    descriptions.set(identifier, description);
    return {
      issueUuid: `a0000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`,
      identifier,
      title: row.title,
      archivedAt: null,
      descriptionSha256: descriptionFingerprint(description),
      teamId: REQUIREMENTS_TEAM_ID,
      stateId: APPROVED_STATE_ID,
      projectId: projectIdByName.get(row.project)!,
      estimate: null,
      priority: index === 0 ? 3 : row.priority,
      dueDate: null,
      cycleId: null,
      milestoneId: null,
      releaseIds: [],
      parentIssueUuid: null,
      assigneeId: null,
      labelIds: [REQUIREMENT_LABEL_ID],
      relationIds: [],
    };
  });
  const referenceIssues: LinearNativeIdentityCapture["issues"] = referenceIdentifiers.map(
    (identifier, index) => {
      const prefix = identifier.split("-")[0]!;
      const description = "Execution evidence remains attached through native Linear relations.";
      descriptions.set(identifier, description);
      return {
        issueUuid: `b0000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`,
        identifier,
        title: `Execution ${identifier}`,
        archivedAt: null,
        descriptionSha256: descriptionFingerprint(description),
        teamId: EXECUTION_TEAM_IDS.get(prefix)!,
        stateId: EXECUTION_STATE_IDS.get(prefix)!,
        projectId: null,
        estimate: null,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: null,
        assigneeId: null,
        labelIds: [],
        relationIds: [],
      };
    },
  );
  const capturedDocuments = documentRows(programScope, documentContents);
  const initiatives: LinearNativeIdentityCapture["initiatives"] =
    programScope.outcomeInitiatives.map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
      contentSha256: sha256(`${initiative.name}:content`),
      descriptionSha256: sha256(`${initiative.name}:description`),
      updatedAt: CAPTURED_AT,
      archivedAt: null,
      ownerId: null,
      status: "Planned",
      priority: 2,
      health: null,
      healthUpdatedAt: null,
      startedAt: null,
      targetDate: null,
      targetDateResolution: null,
      parentInitiativeId: null,
    }));
  const projects: LinearNativeIdentityCapture["projects"] = projectScope.projects.map((project) => ({
    id: project.id,
    name: project.name,
    contentSha256: programScope.projectDescriptionFingerprints.find(
      (row) => row.projectId === project.id,
    )!.descriptionFingerprint,
    updatedAt: CAPTURED_AT,
    archivedAt: null,
    statusId: APPROVED_STATE_ID,
    status: "Approved",
    statusType: "completed",
    priority: 2,
    leadId: null,
    startDate: null,
    startDateResolution: null,
    targetDate: null,
    targetDateResolution: null,
    teamIds: [REQUIREMENTS_TEAM_ID],
    initiativeIds: programScope.projectInitiatives.find(
      (row) => row.projectId === project.id,
    )!.initiativeIds,
  }));
  const teams: LinearNativeIdentityCapture["teams"] = [
    { id: REQUIREMENTS_TEAM_ID, key: "REQ", name: "Requirements", archivedAt: null },
    ...[...EXECUTION_TEAM_IDS].map(([key, id]) => ({ id, key, name: `${key} execution`, archivedAt: null })),
  ];
  const workflowStates: LinearNativeIdentityCapture["workflowStates"] = [
    { id: APPROVED_STATE_ID, name: "Approved", type: "completed", color: "#00aa00", position: 1, archivedAt: null, teamId: REQUIREMENTS_TEAM_ID, teamKey: "REQ" },
    { id: RETIRED_STATE_ID, name: "Retired", type: "canceled", color: "#888888", position: 2, archivedAt: null, teamId: REQUIREMENTS_TEAM_ID, teamKey: "REQ" },
    { id: SUPERSEDED_STATE_ID, name: "Superseded", type: "canceled", color: "#777777", position: 3, archivedAt: null, teamId: REQUIREMENTS_TEAM_ID, teamKey: "REQ" },
    ...[...EXECUTION_TEAM_IDS].map(([key, teamId]) => ({
      id: EXECUTION_STATE_IDS.get(key)!,
      name: "Approved",
      type: "completed",
      color: "#00aa00",
      position: 1,
      archivedAt: null,
      teamId,
      teamKey: key,
    })),
  ];
  const issues = [...requirementIssues, ...referenceIssues];
  const referenceByIdentifier = new Map(referenceIssues.map((issue) => [issue.identifier, issue]));
  const capturedRelations: LinearNativeIdentityCapture["relations"] = [];
  const requirementIssueByLegacyId = new Map(requirementRows.map((row, index) => [
    row.canonicalLegacyId,
    requirementIssues[index]!,
  ]));
  const addRelation = (
    type: "blocks" | "related",
    issue: LinearNativeIdentityCapture["issues"][number],
    related: LinearNativeIdentityCapture["issues"][number],
  ): void => {
    const canonicalKey = canonicalLinearRelationKey(type, issue.identifier, related.identifier);
    if (capturedRelations.some((relation) => relation.canonicalKey === canonicalKey)) return;
    const relationId = `e0000000-0000-4000-8000-${(capturedRelations.length + 1).toString(16).padStart(12, "0")}`;
    issue.relationIds.push(relationId);
    related.relationIds.push(relationId);
    capturedRelations.push({
      relationId,
      canonicalKey,
      type,
      archivedAt: null,
      issueId: issue.issueUuid,
      issueIdentifier: issue.identifier,
      relatedIssueId: related.issueUuid,
      relatedIssueIdentifier: related.identifier,
    });
  };
  for (const [index, row] of requirementRows.entries()) {
    const requirement = requirementIssues[index]!;
    const executionEndpoints = index < 61 ? [row.primaryExecution] : row.execution;
    for (const endpoint of [
      ...executionEndpoints,
      ...(index < 61 ? [] : row.proofExecutionDependencies),
    ]) {
      addRelation("related", requirement, referenceByIdentifier.get(endpoint)!);
    }
    if (index >= 61) {
      for (const dependency of row.requirementDependencyLegacyIds) {
        const adoptedDependency = requirementIssueByLegacyId.get(dependency);
        if (adoptedDependency) addRelation("blocks", adoptedDependency, requirement);
      }
    }
  }
  const capture: LinearNativeIdentityCapture = {
    schemaVersion: 1,
    workspace: { id: WORKSPACE_ID, name: "Sourcera", urlKey: "sourcera-production", archivedAt: null },
    issues,
    labels: [
      { id: REQUIREMENT_LABEL_ID, name: "Requirement", color: "#00aa00", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: null, parentName: null, teamId: REQUIREMENTS_TEAM_ID, teamKey: "REQ" },
      { id: DECISION_LABEL_ID, name: "decision", color: "#0044aa", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: TYPE_GROUP_ID, parentName: "Type", teamId: null, teamKey: null },
      { id: HUMAN_ONLY_LABEL_ID, name: "human-only", color: "#336699", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: AGENT_GROUP_ID, parentName: "Agent", teamId: null, teamKey: null },
      { id: PLATFORM_LABEL_ID, name: "platform", color: "#336699", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: DOMAIN_GROUP_ID, parentName: "Domain", teamId: null, teamKey: null },
      { id: MARKETPLACE_LABEL_ID, name: "marketplace", color: "#336699", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: DOMAIN_GROUP_ID, parentName: "Domain", teamId: null, teamKey: null },
      { id: RISK_LABEL_IDS[0], name: "risk", color: "#E5484D", description: "Canonical delivery risk.", archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: TYPE_GROUP_ID, parentName: "Type", teamId: null, teamKey: null },
      { id: RISK_LABEL_IDS[1], name: "delivery-risk", color: "#D97706", description: "Delivery, governance, readiness, or operational execution risk.", archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: RISK_GROUP_ID, parentName: "Risk", teamId: null, teamKey: null },
      { id: RISK_LABEL_IDS[2], name: "financial-risk", color: "#A16207", description: "Billing, metering, pricing, or financial integrity risk.", archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: RISK_GROUP_ID, parentName: "Risk", teamId: null, teamKey: null },
      { id: RISK_LABEL_IDS[3], name: "security-risk", color: "#B91C1C", description: "Security-sensitive implementation or proof work.", archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: RISK_GROUP_ID, parentName: "Risk", teamId: null, teamKey: null },
      { id: RISK_LABEL_IDS[4], name: "compliance-risk", color: "#991B1B", description: "Compliance-sensitive implementation or proof work.", archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: RISK_GROUP_ID, parentName: "Risk", teamId: null, teamKey: null },
      { id: TYPE_GROUP_ID, name: "Type", color: "#888888", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null },
      { id: AGENT_GROUP_ID, name: "Agent", color: "#777777", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null },
      { id: DOMAIN_GROUP_ID, name: "Domain", color: "#777777", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null },
      { id: RISK_GROUP_ID, name: "Risk", color: "#777777", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null },
    ],
    relations: capturedRelations,
    teams,
    workflowStates,
    users: [],
    initiatives,
    projects,
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: capturedDocuments,
    rawDocumentIds: capturedDocuments.map((document) => document.id),
    coverage: {
      complete: true,
      totals: {
        issues: issues.length,
        labels: 14,
        labelAssignments: requirementIssues.length,
        relations: capturedRelations.length,
        teams: teams.length,
        workflowStates: workflowStates.length,
        users: 0,
        initiatives: initiatives.length,
        projects: projects.length,
        releasePipelines: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: capturedDocuments.length,
      },
      topLevel: {
        issues: connectionCoverage(issues.length),
        labels: connectionCoverage(14),
        teams: connectionCoverage(teams.length),
        workflowStates: connectionCoverage(workflowStates.length),
        users: connectionCoverage(0),
        initiatives: connectionCoverage(initiatives.length),
        projects: connectionCoverage(projects.length),
        releasePipelines: connectionCoverage(0),
        releases: connectionCoverage(0),
        projectMilestones: connectionCoverage(0),
        cycles: connectionCoverage(0),
        documents: connectionCoverage(capturedDocuments.length),
      },
      perIssue: issues.map((issue) => ({
        issueUuid: issue.issueUuid,
        identifier: issue.identifier,
        labels: nestedCoverage(issue.labelIds.length),
        relations: nestedCoverage(capturedRelations.filter((relation) => relation.issueId === issue.issueUuid).length),
        inverseRelations: nestedCoverage(capturedRelations.filter((relation) => relation.relatedIssueId === issue.issueUuid).length),
      })),
      perProject: projects.map((project) => ({
        projectId: project.id,
        teams: nestedCoverage(project.teamIds.length),
        initiatives: nestedCoverage(project.initiativeIds.length),
      })),
    },
  };
  programScope.authorityIssueLabelContract = buildLinearAuthorityIssueLabelContract(capture.labels);
  const linearFingerprintRaw = fingerprintFromCapture(
    capture,
    programScope,
    documentContents,
    descriptions,
    sourceFiles,
  );
  const issueDescriptionsRaw = json({
    schemaVersion: 1,
    issues: issues.map((issue) => ({
      id: issue.identifier,
      title: issue.title,
      description: descriptions.get(issue.identifier)!,
      updatedAt: CAPTURED_AT,
      labels: issue.labelIds.map((id) => capture.labels.find((label) => label.id === id)!.name).sort(compare),
    })).sort((left, right) => compare(left.id, right.id)),
  });
  const requirementBaselineRaw = Buffer.from(canonicalLinearAuthorityRequirementBaselineJson(
    buildLinearAuthorityRequirementBaseline({
      rootDir: repositoryRoot,
      workspaceId: WORKSPACE_ID,
      fingerprintJson: linearFingerprintRaw,
      descriptionsJson: issueDescriptionsRaw,
      bootstrapMapJson: requirementBootstrapMapRaw,
    }),
  ), "utf8");
  const adoption = buildLinearAuthorityRequirementAdoptionArtifacts({
    rootDir: repositoryRoot,
    workspaceId: WORKSPACE_ID,
    fingerprintJson: linearFingerprintRaw,
    descriptionsJson: issueDescriptionsRaw,
    baselineJson: requirementBaselineRaw,
  });
  const publicationRaw = Buffer.from(adoption.publicationRaw, "utf8");
  const recoveryMappingRaw = Buffer.from(adoption.recoveryRaw, "utf8");
  const semantic = buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir: repositoryRoot,
    fingerprintJson: linearFingerprintRaw,
    descriptionsJson: issueDescriptionsRaw,
    recoveryMappingJson: recoveryMappingRaw,
    publicationJson: publicationRaw,
  });
  const semanticPlanRaw = Buffer.from(
    `${canonicalLinearAuthoritySemanticPlanV4Json(semantic.plan)}\n`,
    "utf8",
  );
  const sourceRows: LinearAuthoritySourceLineageSource[] =
    LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => {
      const bytes = sourceFiles.get(spec.path)!;
      return {
        ...spec,
        byteLength: bytes.length,
        rawSha256: sha256(bytes),
        normalizedSha256: sha256(normalizeLinearAuthoritySourceMarkdown(bytes.toString("utf8"))),
      };
    });
  const lineage = compileLinearAuthoritySourceLineage({
    authority: {
      workspaceId: WORKSPACE_ID,
      sourceCommit,
      planRoot: sha256("pending-plan-root"),
      sourceSetRoot: computeLinearAuthoritySourceSetRoot(sourceRows),
      semanticPlanSha256: sha256(semanticPlanRaw),
      semanticRoot: semantic.semanticRoot,
      featureInventorySha256: sha256(featureInventoryRaw),
    },
    repositoryRoot,
    semanticPlanRaw,
    featureInventoryRaw,
    dispositionsRaw: dispositionRegisterRaw,
    sourceChecksumsRaw,
    sourceFiles,
  });
  const bindings = new Map(lineage.targetBindings.map((binding) => [binding.targetPlanKey, binding]));
  const requirementTargets = semantic.plan.requirements.map((row) => makeManagedTarget(
    "requirement",
    `issue:${row.canonicalLegacyId}`,
    row.title,
    row.description,
    projectPlanKey(projectIdByName.get(row.project)!),
    row.state,
    row.priority,
    bindings.get(`issue:${row.canonicalLegacyId}`)!.supportSliceKeys,
    false,
  ));
  const reconciliationByLegacyId = new Map(
    semantic.plan.adoptedRequirementReconciliation.map((row) => [row.canonicalLegacyId, row]),
  );
  const nativeRequirementById = new Map(requirementIssues.map((issue) => [issue.identifier, issue]));
  for (const target of requirementTargets) {
    const adopted = reconciliationByLegacyId.get(target.planKey.slice("issue:".length));
    if (!adopted) continue;
    const native = nativeRequirementById.get(adopted.issueIdentifier)!;
    target.expectedCurrentIssueUuid = native.issueUuid;
    target.expectedCurrentDescriptionSha256 = native.descriptionSha256;
    target.expectedCurrentNativeSha256 = currentIssueNativeSha(native);
    target.expectedIdentifier = native.identifier;
    target.payloadSha256 = managedPayloadSha256(target);
  }
  const decisionTargets = semantic.plan.decisions.map((row) => makeManagedTarget(
    "decision",
    `decision:${row.legacyId}`,
    row.title,
    row.description,
    projectPlanKey(projectIdByName.get(row.project)!),
    row.state,
    row.priority,
    bindings.get(`decision:${row.legacyId}`)!.supportSliceKeys,
    row.disposition === "retired_source",
  ));
  const documents = documentTargets(programScope, documentContents, capturedDocuments);
  const references = referenceIssues.map((issue) => ({
    planKey: referencePlanKey(issue.identifier),
    title: issue.title,
    expectedIdentifier: issue.identifier,
  }));
  const relations = nativeRelations(semantic);
  const nativeCatalog: LinearAuthorityPackagePlanV2["nativeCatalog"] = {
    teams: [{ planKey: TEAM_PLAN_KEY, id: REQUIREMENTS_TEAM_ID, key: "REQ", name: "Requirements" }],
    users: [],
    initiatives: initiatives.map((initiative) => ({
      planKey: initiativePlanKey(initiative.id),
      id: initiative.id,
      name: initiative.name,
      contentSha256: initiative.contentSha256,
      descriptionSha256: initiative.descriptionSha256,
      updatedAt: initiative.updatedAt,
      ownerId: initiative.ownerId,
      status: initiative.status,
      priority: initiative.priority,
      health: initiative.health,
      healthUpdatedAt: initiative.healthUpdatedAt,
      startedAt: initiative.startedAt,
      targetDate: initiative.targetDate,
      targetDateResolution: initiative.targetDateResolution,
      parentInitiativeId: initiative.parentInitiativeId,
    })),
    projects: projects.map((project) => ({
      planKey: projectPlanKey(project.id),
      id: project.id,
      name: project.name,
      contentSha256: project.contentSha256,
      updatedAt: project.updatedAt,
      statusId: project.statusId,
      status: project.status,
      statusType: project.statusType,
      priority: project.priority,
      leadId: project.leadId,
      startDate: project.startDate,
      startDateResolution: project.startDateResolution,
      targetDate: project.targetDate,
      targetDateResolution: project.targetDateResolution,
      teamPlanKeys: [TEAM_PLAN_KEY],
      initiativePlanKeys: project.initiativeIds.map(initiativePlanKey),
    })),
    releasePipelines: [],
    cycles: [],
    milestones: [],
    releases: [],
    states: [
      { planKey: STATE_PLAN_KEYS.Approved, id: APPROVED_STATE_ID, name: "Approved", type: "completed", teamPlanKey: TEAM_PLAN_KEY },
      { planKey: STATE_PLAN_KEYS.Retired, id: RETIRED_STATE_ID, name: "Retired", type: "canceled", teamPlanKey: TEAM_PLAN_KEY },
      { planKey: STATE_PLAN_KEYS.Superseded, id: SUPERSEDED_STATE_ID, name: "Superseded", type: "canceled", teamPlanKey: TEAM_PLAN_KEY },
    ],
    labels: [
      { planKey: REQUIREMENT_LABEL_PLAN_KEY, id: REQUIREMENT_LABEL_ID, semanticRole: "requirement", name: "Requirement", color: "#00aa00", description: null, teamPlanKey: TEAM_PLAN_KEY, parentId: null, parentName: null },
      { planKey: DECISION_LABEL_PLAN_KEY, id: DECISION_LABEL_ID, semanticRole: "decision", name: "decision", color: "#0044aa", description: null, teamPlanKey: null, parentId: TYPE_GROUP_ID, parentName: "Type" },
    ],
  };
  const plan: LinearAuthorityPackagePlanV2 = {
    sourceCommit,
    preCutoverTag: "pre-linear-authority-2026-07-27",
    preCutoverCommit: "8c4e00e377ddc3cce404589aaf256f0f254ea6c1",
    workspace: { id: WORKSPACE_ID, name: "Sourcera", urlKey: "sourcera-production" },
    rawDocumentIds: capturedDocuments.map((document) => document.id),
    requirements: requirementTargets,
    decisions: decisionTargets,
    risks: [],
    documents,
    references,
    nativeRelations: relations,
    issueDescriptionRepairs: [],
    nativeCatalog,
  };
  const reserved = new Set<string>([
    WORKSPACE_ID,
    REQUIREMENTS_TEAM_ID,
    REQUIREMENT_LABEL_ID,
    DECISION_LABEL_ID,
    TYPE_GROUP_ID,
    APPROVED_STATE_ID,
    RETIRED_STATE_ID,
    SUPERSEDED_STATE_ID,
    ...EXECUTION_TEAM_IDS.values(),
    ...EXECUTION_STATE_IDS.values(),
    ...issues.map((issue) => issue.issueUuid),
    ...capturedDocuments.map((document) => document.id),
    ...initiatives.map((initiative) => initiative.id),
    ...projects.map((project) => project.id),
  ].map((value) => value.toLowerCase()));
  const counter = { value: 1 };
  const allocations: LinearTargetAllocation[] = [
    ...requirementTargets.map((target) => ({
      planKey: target.planKey,
      kind: "issue" as const,
      title: target.title,
      identifier: target.expectedIdentifier,
      uuid: target.expectedCurrentIssueUuid ?? nextAllocatedUuid(reserved, counter),
      source: target.expectedCurrentIssueUuid === null ? "allocated" as const : "adopted" as const,
    })),
    ...decisionTargets.map((target) => ({
      planKey: target.planKey,
      kind: "decision" as const,
      title: target.title,
      identifier: null,
      uuid: nextAllocatedUuid(reserved, counter),
      source: "allocated" as const,
    })),
    ...documents.map((target) => ({
      planKey: target.planKey,
      kind: "document" as const,
      title: target.title,
      identifier: null,
      uuid: target.expectedCurrentDocumentId!,
      source: "adopted" as const,
    })),
    ...references.map((target, index) => ({
      planKey: target.planKey,
      kind: "relation_target" as const,
      title: target.title,
      identifier: target.expectedIdentifier,
      uuid: referenceIssues[index]!.issueUuid,
      source: "adopted" as const,
    })),
    ...relations.map((target) => ({
      planKey: target.planKey,
      kind: "relation" as const,
      title: null,
      identifier: null,
      uuid: nextAllocatedUuid(reserved, counter),
      source: "allocated" as const,
    })),
  ];
  const liveCaptureRaw = json(capture);
  const rawDocumentsRaw = json({
    schemaVersion: 1,
    documents: capturedDocuments.map((document) => ({
      ...document,
      content: documentContents.get(document.id)!,
    })),
  });
  const captureReceiptRaw = json({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: CAPTURED_AT,
    fingerprintSha256: sha256(linearFingerprintRaw),
    acceptedFingerprintSha256: sha256(linearFingerprintRaw),
    artifactSha256s: {
      fingerprint: sha256(linearFingerprintRaw),
      nativeIdentity: sha256(liveCaptureRaw),
      documents: sha256(rawDocumentsRaw),
      issueDescriptions: sha256(issueDescriptionsRaw),
    },
    source: {
      repository: "meetblakey/sourcera",
      commit: sourceCommit,
      ref: "refs/heads/main",
      runId: "1",
      runAttempt: "1",
    },
  });
  const githubExecutionRaw = json({
    schemaVersion: 1,
    kind: "github-execution",
    repository: "meetblakey/sourcera",
    commit: sourceCommit,
    ref: "refs/heads/main",
    runId: "1",
    runAttempt: "1",
  });
  const canaryDocument = capturedDocuments.find(
    (document) => document.id === programScope.planningDocument.id,
  )!;
  const canaryContent = documentContents.get(canaryDocument.id)!;
  const builderInput: LinearAuthorityPackageBuilderInputV2 = {
    plan,
    semanticPlanRaw,
    sourceLineageRaw: json(lineage),
    requirementBaselineRaw,
    featureInventoryRaw,
    dispositionRegisterRaw,
    sourceChecksumsRaw,
    projectScopeRaw: json(projectScope),
    programScopeRaw: json(programScope),
    linearFingerprintRaw,
    liveCaptureRaw,
    rawDocumentsRaw,
    issueDescriptionsRaw,
    captureReceiptRaw,
    githubExecutionRaw,
    recoveryMappingRaw,
    publicationRaw,
    allocations,
    documentCanary: {
      canaryDocumentId: canaryDocument.id,
      canaryContentSha256: canaryDocument.contentSha256,
      canaryTopologySha256: currentDocumentTopologySha(canaryDocument),
      measuredAt: CAPTURED_AT,
      readbackUtf8Bytes: Buffer.byteLength(canaryContent, "utf8"),
      readbackUtf16CodeUnits: canaryContent.length,
      maxUtf8Bytes: Buffer.byteLength(canaryContent, "utf8"),
      maxUtf16CodeUnits: canaryContent.length,
    },
  };
  const authority = buildLinearAuthorityPackageV2(builderInput);
  const validationInput: LinearAuthorityValidationInput = {
    manifestRaw: authority.manifestRaw,
    expectedManifestSha256: authority.manifestSha256,
    sourceFiles,
    compilerInputs: authority.compilerInputs,
    liveCaptureRaw: authority.liveCaptureRaw,
    expectedLiveCaptureSha256: authority.liveCaptureSha256,
    allocationRaw: authority.allocationRaw,
    expectedAllocationSha256: authority.allocationSha256,
    repositoryRoot,
  };
  return { authority, builderInput, validationInput, sourceFiles };
}

export function buildLinearAuthorityUnifiedCompilerInputFixture(
  repositoryRoot = process.cwd(),
): LinearAuthorityUnifiedCompilerInput {
  const base = buildLinearAuthorityBootstrapPackageV2Fixture(repositoryRoot).builderInput;
  const capture = clone(JSON.parse(Buffer.from(base.liveCaptureRaw).toString("utf8")) as LinearNativeIdentityCapture);
  const descriptions = clone(JSON.parse(Buffer.from(base.issueDescriptionsRaw).toString("utf8")) as {
    schemaVersion: 1;
    issues: Array<{ id: string; title: string; description: string | null; updatedAt: string; labels: string[] }>;
  });
  const rawDocuments = clone(JSON.parse(Buffer.from(base.rawDocumentsRaw).toString("utf8")) as {
    schemaVersion: 1;
    documents: Array<Record<string, unknown> & { id: string; content: string | null }>;
  });
  const programScope = clone(JSON.parse(Buffer.from(base.programScopeRaw).toString("utf8")) as LinearProgramScopeV3);
  const canonicalProgram = JSON.parse(
    readFileSync(join(repositoryRoot, "delivery/linear-program-scope.json"), "utf8"),
  ) as LinearProgramScopeV3;
  programScope.projectDocumentDecisionContract = clone(canonicalProgram.projectDocumentDecisionContract);
  programScope.authorityIssueLabelContract = buildLinearAuthorityIssueLabelContract(capture.labels);
  const decisionByIdentifier = new Map(
    programScope.projectDocumentDecisionContract.trackedDecisions.map((row) => [
      row.decisionIdentifier,
      row,
    ]),
  );
  const rawDocumentById = new Map(rawDocuments.documents.map((row) => [row.id, row]));
  for (const expected of [
    ...programScope.canonicalProjectDocuments,
    ...programScope.supplementaryDocuments,
  ]) {
    const references = programScope.projectDocumentDecisionContract.references
      .filter((row) => row.documentId === expected.id)
      .map((row) => decisionByIdentifier.get(row.decisionIdentifier)!.decisionUrl);
    const unresolvedBody = references.length
      ? references.map((url) => `- ${url}`).join("\n")
      : "No open decisions.";
    const rawDocument = rawDocumentById.get(expected.id)!;
    let current = rawDocument.content ?? "";
    const duplicatedTitle = `# ${expected.title}\n\n`;
    if (current.startsWith(duplicatedTitle)) current = current.slice(duplicatedTitle.length);
    const heading = "## Unresolved decisions\n\n";
    const headingStart = current.indexOf(heading);
    if (headingStart < 0) throw new Error(`Fixture document ${expected.id} lacks Unresolved decisions`);
    const bodyStart = headingStart + heading.length;
    const nextHeading = current.indexOf("\n## ", bodyStart);
    const bodyEnd = nextHeading < 0 ? current.length : nextHeading;
    const content = `${current.slice(0, bodyStart)}${unresolvedBody}${current.slice(bodyEnd)}`;
    const contentSha256 = sha256(content);
    rawDocument.content = content;
    rawDocument.contentSha256 = contentSha256;
    expected.contentFingerprint = contentSha256;
    capture.documents.find((row) => row.id === expected.id)!.contentSha256 = contentSha256;
  }

  if (!capture.users.some((row) => row.id === BLAKE_ID)) {
    capture.users.push({
      id: BLAKE_ID,
      name: "Blake Rowley",
      displayName: "Blake Rowley",
      active: true,
      app: false,
      guest: false,
      archivedAt: null,
    });
  }
  const plaTeam = capture.teams.find((row) => row.key === "PLA")!;
  if (!capture.workflowStates.some((row) => row.id === PLA_BACKLOG_ID)) {
    capture.workflowStates.push({
      id: PLA_BACKLOG_ID,
      name: "Backlog",
      type: "backlog",
      color: "#888888",
      position: 0,
      archivedAt: null,
      teamId: plaTeam.id,
      teamKey: plaTeam.key,
    });
  }

  const descriptionById = new Map(descriptions.issues.map((row) => [row.id, row]));
  let issueCounter = 1;
  const upsert = (input: {
    identifier: string;
    title: string;
    description: string;
    projectId: string;
    labelIds?: string[];
    parentIssueUuid?: string | null;
    assigneeId?: string | null;
  }) => {
    const project = capture.projects.find((row) => row.id === input.projectId);
    if (!project) throw new Error(`Fixture project ${input.projectId} is missing`);
    if (!project.teamIds.includes(plaTeam.id)) project.teamIds.push(plaTeam.id);
    project.teamIds.sort(compare);
    let issue = capture.issues.find((row) => row.identifier === input.identifier);
    if (!issue) {
      issue = {
        issueUuid: `95000000-0000-4000-8000-${(issueCounter++).toString(16).padStart(12, "0")}`,
        identifier: input.identifier,
        title: input.title,
        archivedAt: null,
        descriptionSha256: descriptionFingerprint(input.description),
        teamId: plaTeam.id,
        stateId: PLA_BACKLOG_ID,
        projectId: input.projectId,
        estimate: null,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: input.parentIssueUuid ?? null,
        assigneeId: input.assigneeId ?? null,
        labelIds: input.labelIds ?? [],
        relationIds: [],
      };
      capture.issues.push(issue);
    } else {
      Object.assign(issue, {
        title: input.title,
        archivedAt: null,
        descriptionSha256: descriptionFingerprint(input.description),
        teamId: plaTeam.id,
        stateId: PLA_BACKLOG_ID,
        projectId: input.projectId,
        estimate: null,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: input.parentIssueUuid ?? null,
        assigneeId: input.assigneeId ?? null,
        labelIds: input.labelIds ?? [],
      });
    }
    descriptionById.set(input.identifier, {
      id: input.identifier,
      title: input.title,
      description: input.description,
      updatedAt: CAPTURED_AT,
      labels: issue.labelIds.map((id) => capture.labels.find((row) => row.id === id)!.name).sort(compare),
    });
    return issue;
  };

  const productProject = programScope.projectDocumentDecisionContract.trackedDecisions[0]!.decisionProjectId;
  const parent = upsert({
    identifier: "PLA-210",
    title: "Product decision parent",
    description: "Product decision grouping.",
    projectId: productProject,
  });
  const productIssues = programScope.projectDocumentDecisionContract.trackedDecisions.map((expected) => {
    const body = `# ${expected.decisionTitle}\n\n${expected.requiredSections.map((section) =>
      `## ${section}\n\nComplete.`).join("\n\n")}\n`;
    expected.descriptionFingerprint = sha256(body);
    const issue = upsert({
      identifier: expected.decisionIdentifier,
      title: expected.decisionTitle,
      description: body,
      projectId: expected.decisionProjectId,
      labelIds: expected.labelIds,
      parentIssueUuid: parent.issueUuid,
      assigneeId: BLAKE_ID,
    });
    for (const blocked of expected.blockedIssues) {
      upsert({
        identifier: blocked.identifier,
        title: `Blocked ${blocked.identifier}`,
        description: "Blocked execution work.",
        projectId: blocked.projectId,
      });
    }
    return issue;
  });
  for (const [identifier, title] of [
    ["PLA-338", "Domain Governance"],
    ["PLA-370", "Seller Team role authority mapping"],
  ] as const) {
    upsert({ identifier, title, description: "Existing planning endpoint.", projectId: productProject });
  }

  const sellerProject = capture.projects.find(
    (row) => row.name === "Seller Knowledge, Profile & Capabilities",
  )!.id;
  const selTeam = capture.teams.find((row) => row.key === "SEL")!;
  const selState = capture.workflowStates.find((row) => row.teamId === selTeam.id)!;
  const sellerProjectRow = capture.projects.find((row) => row.id === sellerProject)!;
  if (!sellerProjectRow.teamIds.includes(selTeam.id)) sellerProjectRow.teamIds.push(selTeam.id);
  sellerProjectRow.teamIds.sort(compare);
  const selBody = '<requirement id="REQ-1">Example A</requirement>\n<requirement id="REQ-2">Example B</requirement>';
  let sel122 = capture.issues.find((row) => row.identifier === "SEL-122");
  if (!sel122) {
    sel122 = upsert({
      identifier: "SEL-122",
      title: "Session Lifecycle Per-Capability Flows",
      description: selBody,
      projectId: sellerProject,
    });
  }
  Object.assign(sel122, {
    title: "Session Lifecycle Per-Capability Flows",
    descriptionSha256: descriptionFingerprint(selBody),
    teamId: selTeam.id,
    stateId: selState.id,
    projectId: sellerProject,
    labelIds: [],
    relationIds: [],
    assigneeId: null,
    parentIssueUuid: null,
  });
  descriptionById.set("SEL-122", {
    id: "SEL-122",
    title: sel122.title,
    description: selBody,
    updatedAt: CAPTURED_AT,
    labels: [],
  });
  capture.relations = capture.relations.filter(
    (row) => row.issueIdentifier !== "SEL-122" && row.relatedIssueIdentifier !== "SEL-122",
  );
  for (const issue of capture.issues) {
    issue.relationIds = issue.relationIds.filter((id) =>
      capture.relations.some((row) => row.relationId === id));
  }
  productIssues.forEach((issue, index) => {
    const expected = programScope.projectDocumentDecisionContract.trackedDecisions[index]!;
    const blocked = capture.issues.find(
      (row) => row.identifier === expected.blockedIssues[0]!.identifier,
    )!;
    const relationId = `96000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`;
    capture.relations.push({
      relationId,
      canonicalKey: canonicalLinearRelationKey("blocks", issue.identifier, blocked.identifier),
      type: "blocks",
      archivedAt: null,
      issueId: issue.issueUuid,
      issueIdentifier: issue.identifier,
      relatedIssueId: blocked.issueUuid,
      relatedIssueIdentifier: blocked.identifier,
    });
    issue.relationIds.push(relationId);
    blocked.relationIds.push(relationId);
  });
  descriptions.issues = [...descriptionById.values()].sort((left, right) => compare(left.id, right.id));
  recalculateCaptureCoverage(capture);

  const sourceFiles = new Map<string, Buffer>(LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => [
    spec.path,
    readFileSync(join(repositoryRoot, spec.path)),
  ]));
  const documentContents = new Map(rawDocuments.documents.map((row) => [row.id, row.content ?? ""]));
  const descriptionContents = new Map(descriptions.issues.map((row) => [row.id, row.description ?? ""]));
  const fingerprint = JSON.parse(fingerprintFromCapture(
    capture,
    programScope,
    documentContents,
    descriptionContents,
    sourceFiles,
  ).toString("utf8")) as LinearFingerprint;
  fingerprint.program!.decisionIssues = programScope.projectDocumentDecisionContract.trackedDecisions.map((expected) => ({
    identifier: expected.decisionIdentifier,
    title: expected.decisionTitle,
    url: expected.decisionUrl,
    descriptionFingerprint: expected.descriptionFingerprint,
    sectionHeadings: expected.requiredSections,
    archivedAt: null,
    stateType: "backlog",
    labels: expected.labelIds.map((id) => {
      const definition = programScope.projectDocumentDecisionContract.labelDefinitions.find((row) => row.id === id)!;
      return { id: definition.id, name: definition.name, groupId: definition.groupId, groupName: definition.groupName };
    }),
    projectId: expected.decisionProjectId,
    relations: expected.blockedIssues.map((row) =>
      canonicalLinearRelationKey("blocks", expected.decisionIdentifier, row.identifier)),
  }));

  const linearFingerprintRaw = json(fingerprint);
  const liveCaptureRaw = json(capture);
  const issueDescriptionsRaw = json(descriptions);
  const rawDocumentsRaw = json(rawDocuments);
  const sourceCommit = (JSON.parse(Buffer.from(base.captureReceiptRaw).toString("utf8")) as {
    source: { commit: string };
  }).source.commit;
  const captureReceiptRaw = json({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: CAPTURED_AT,
    fingerprintSha256: sha256(linearFingerprintRaw),
    acceptedFingerprintSha256: sha256(linearFingerprintRaw),
    artifactSha256s: {
      fingerprint: sha256(linearFingerprintRaw),
      nativeIdentity: sha256(liveCaptureRaw),
      documents: sha256(rawDocumentsRaw),
      issueDescriptions: sha256(issueDescriptionsRaw),
    },
    source: {
      repository: "meetblakey/sourcera",
      commit: sourceCommit,
      ref: "refs/heads/main",
      runId: "1",
      runAttempt: "1",
    },
  });
  let allocationCounter = 1;
  return {
    repositoryRoot,
    preCutoverTag: "pre-linear-authority-2026-07-27",
    linearFingerprintRaw,
    liveCaptureRaw,
    rawDocumentsRaw,
    issueDescriptionsRaw,
    captureReceiptRaw,
    githubExecutionRaw: base.githubExecutionRaw,
    projectScopeRaw: base.projectScopeRaw,
    programScopeRaw: json(programScope),
    requirementBaselineRaw: base.requirementBaselineRaw,
    allocateUuidV4: () =>
      `97000000-0000-4000-8000-${(allocationCounter++).toString(16).padStart(12, "0")}`,
  };
}

export function buildValidatorValidLinearAuthorityPackageV2Fixture(
  repositoryRoot = process.cwd(),
): ValidatorValidLinearAuthorityPackageV2Fixture {
  const authority = compileLinearAuthorityUnifiedPackage(
    buildLinearAuthorityUnifiedCompilerInputFixture(repositoryRoot),
  ).authority;
  const sourceFiles = new Map<string, Buffer>(LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => [
    spec.path,
    readFileSync(join(repositoryRoot, spec.path)),
  ]));
  return {
    authority,
    sourceFiles,
    validationInput: {
      manifestRaw: authority.manifestRaw,
      expectedManifestSha256: authority.manifestSha256,
      sourceFiles,
      compilerInputs: authority.compilerInputs,
      liveCaptureRaw: authority.liveCaptureRaw,
      expectedLiveCaptureSha256: authority.liveCaptureSha256,
      allocationRaw: authority.allocationRaw,
      expectedAllocationSha256: authority.allocationSha256,
      repositoryRoot,
    },
  };
}
