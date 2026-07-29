import { createHash } from "node:crypto";

import type { Finding } from "./model.js";
import {
  linearProjectDocumentFingerprintFindings,
  linearProjectDocumentScopeFindings,
  type LinearDecisionIssueFingerprint,
  type LinearProjectDocumentConflictFingerprint,
  type LinearProjectDocumentDecisionContract,
  type LinearProjectDocumentFingerprint,
  type LinearProjectDocumentScopeRow,
  type LinearSupplementaryDocumentScopeRow,
} from "./linear-project-documents.js";

interface LinearProgramScopeBase {
  outcomeInitiatives: Array<{ id: string; name: string }>;
  planningDocument: {
    id: string;
    title: string;
    contentFingerprint: string;
    initiativeId: null;
    projectId: string | null;
    teamId: string | null;
    issueId: string | null;
    requiredSections: string[];
  };
  projectDescriptionFingerprints: Array<{
    projectId: string;
    descriptionFingerprint: string;
    milestones: Array<{
      milestoneId: string;
      descriptionFingerprint: string;
    }>;
  }>;
  projectInitiatives: Array<{
    projectId: string;
    initiativeIds: string[];
  }>;
}

export interface LinearProgramScopeV2 extends LinearProgramScopeBase {
  schemaVersion: 2;
}

export interface LinearProgramScopeV3 extends LinearProgramScopeBase {
  schemaVersion: 3;
  canonicalProjectDocuments: LinearProjectDocumentScopeRow[];
  supplementaryDocuments: LinearSupplementaryDocumentScopeRow[];
  projectDocumentDecisionContract: LinearProjectDocumentDecisionContract;
  authorityIssueLabelContract: LinearAuthorityIssueLabelContract;
}

export interface LinearAuthorityIssueLabelContractEntry {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  teamId: string | null;
  teamKey: string | null;
  color: string;
  description: string | null;
}

export type LinearAuthorityIssueLabelContract = {
  schemaVersion: 1;
  initialized: false;
  labels: [];
  groups: [];
  root: null;
} | {
  schemaVersion: 1;
  initialized: true;
  labels: LinearAuthorityIssueLabelContractEntry[];
  groups: LinearAuthorityIssueLabelContractEntry[];
  root: string;
};

export interface LinearAuthorityIssueLabelCapture extends LinearAuthorityIssueLabelContractEntry {
  archivedAt: string | null;
  retiredAt: string | null;
  inheritedFromId: string | null;
  isGroup: boolean;
}

export type LinearProgramScope = LinearProgramScopeV2 | LinearProgramScopeV3;

export interface LinearProgramFingerprint {
  initiatives: Array<{
    id: string;
    name: string;
    updatedAt: string;
    archivedAt: string | null;
    owner: string | null;
    ownerId: string | null;
    status: string;
    priority: number;
    health: string | null;
    healthUpdatedAt: string | null;
    targetDate: string | null;
    targetDateResolution: string | null;
    parentInitiativeId: string | null;
    parentInitiative: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    updatedAt: string;
    archivedAt: string | null;
    initiativeId: string | null;
    projectId: string | null;
    teamId: string | null;
    issueId: string | null;
    contentFingerprint: string;
    sectionHeadings: string[];
    sourceFingerprints: LinearPlanningSourceFingerprints;
  }>;
  projectInitiatives: Array<{
    projectId: string;
    initiativeIds: string[];
  }>;
  projectDocuments?: LinearProjectDocumentFingerprint[];
  projectDocumentConflicts?: LinearProjectDocumentConflictFingerprint[];
  decisionIssues?: LinearDecisionIssueFingerprint[];
}

export interface LinearPlanningSourceFingerprints {
  masterSpecSha256: string | null;
  uxDesignSha256: string | null;
}

export interface ExpectedLinearPlanningSourceFingerprints {
  masterSpecSha256: string;
  uxDesignSha256: string;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
export const LINEAR_AUTHORITY_ISSUE_LABEL_NAMES = [
  "Requirement",
  "decision",
  "human-only",
  "platform",
  "marketplace",
  "risk",
  "delivery-risk",
  "financial-risk",
  "security-risk",
  "compliance-risk",
] as const;
export const LINEAR_AUTHORITY_ISSUE_LABEL_GROUP_NAMES = [
  "Type",
  "Agent",
  "Domain",
  "Risk",
] as const;

const LABEL_PARENT_NAMES = new Map<string, string | null>([
  ["Requirement", null],
  ["decision", "Type"],
  ["human-only", "Agent"],
  ["platform", "Domain"],
  ["marketplace", "Domain"],
  ["risk", "Type"],
  ["delivery-risk", "Risk"],
  ["financial-risk", "Risk"],
  ["security-risk", "Risk"],
  ["compliance-risk", "Risk"],
]);

const compareText = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error("Authority label contract contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort(compareText).map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(row[key])}`
  ).join(",")}}`;
}

export function linearAuthorityIssueLabelContractRoot(
  labels: readonly LinearAuthorityIssueLabelContractEntry[],
  groups: readonly LinearAuthorityIssueLabelContractEntry[],
): string {
  return createHash("sha256").update(canonicalJson({ labels, groups })).digest("hex");
}

function exactAuthorityLabelKeys(value: unknown): value is LinearAuthorityIssueLabelContractEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as Record<string, unknown>).sort(compareText);
  return JSON.stringify(keys) === JSON.stringify([
    "color",
    "description",
    "id",
    "name",
    "parentId",
    "parentName",
    "teamId",
    "teamKey",
  ].sort(compareText));
}

function validAuthorityIssueLabelContract(
  value: unknown,
): value is LinearAuthorityIssueLabelContract {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (JSON.stringify(Object.keys(row).sort(compareText)) !==
    JSON.stringify(["schemaVersion", "initialized", "labels", "groups", "root"].sort(compareText)) ||
    row.schemaVersion !== 1 || !Array.isArray(row.labels) || !Array.isArray(row.groups)) return false;
  if (row.initialized === false) return row.labels.length === 0 && row.groups.length === 0 && row.root === null;
  if (row.initialized !== true || typeof row.root !== "string" || !SHA256.test(row.root) ||
    row.labels.length !== LINEAR_AUTHORITY_ISSUE_LABEL_NAMES.length ||
    row.groups.length !== LINEAR_AUTHORITY_ISSUE_LABEL_GROUP_NAMES.length) return false;
  const labels = row.labels as unknown[];
  const groups = row.groups as unknown[];
  if ([...labels, ...groups].some((label) => !exactAuthorityLabelKeys(label))) return false;
  const typed = labels as LinearAuthorityIssueLabelContractEntry[];
  const typedGroups = groups as LinearAuthorityIssueLabelContractEntry[];
  if (JSON.stringify(typed.map((label) => label.name)) !== JSON.stringify(LINEAR_AUTHORITY_ISSUE_LABEL_NAMES) ||
    JSON.stringify(typedGroups.map((group) => group.name)) !== JSON.stringify(LINEAR_AUTHORITY_ISSUE_LABEL_GROUP_NAMES) ||
    typed.some((label) => !UUID.test(label.id) || !text(label.name) || !text(label.color) ||
      (label.description !== null && typeof label.description !== "string") ||
      (label.parentId !== null && !UUID.test(label.parentId)) ||
      (label.parentName !== null && !text(label.parentName)) ||
      (label.teamId !== null && !UUID.test(label.teamId)) ||
      (label.teamKey !== null && !text(label.teamKey)) ||
      label.parentName !== LABEL_PARENT_NAMES.get(label.name) ||
      (label.parentName === null) !== (label.parentId === null) ||
      (label.name === "Requirement"
        ? label.teamId === null || label.teamKey !== "REQ"
        : label.teamId !== null || label.teamKey !== null)) ||
    typedGroups.some((group) => !UUID.test(group.id) || !text(group.name) || !text(group.color) ||
      (group.description !== null && typeof group.description !== "string") || group.parentId !== null ||
      group.parentName !== null || group.teamId !== null || group.teamKey !== null) ||
    new Set([...typed, ...typedGroups].map((label) => label.id.toLowerCase())).size !==
      typed.length + typedGroups.length ||
    row.root !== linearAuthorityIssueLabelContractRoot(typed, typedGroups)) return false;
  return true;
}

export function buildLinearAuthorityIssueLabelContract(
  labels: readonly LinearAuthorityIssueLabelCapture[],
): LinearAuthorityIssueLabelContract & { initialized: true } {
  const groups = LINEAR_AUTHORITY_ISSUE_LABEL_GROUP_NAMES.map((name) => {
    const matches = labels.filter((label) => label.name === name && label.isGroup);
    if (matches.length !== 1) throw new Error(`Authority label group ${name} must resolve exactly once`);
    const group = matches[0]!;
    if (!UUID.test(group.id) || group.archivedAt !== null || group.retiredAt !== null || group.inheritedFromId !== null ||
      !group.isGroup || group.parentId !== null || group.parentName !== null ||
      group.teamId !== null || group.teamKey !== null ||
      !text(group.color) || (group.description !== null && typeof group.description !== "string")) {
      throw new Error(`Authority label group ${name} differs from its required native scope`);
    }
    return {
      id: group.id,
      name: group.name,
      parentId: group.parentId,
      parentName: group.parentName,
      teamId: group.teamId,
      teamKey: group.teamKey,
      color: group.color,
      description: group.description,
    };
  });
  const groupByName = new Map(groups.map((group) => [group.name, group]));
  const selected = LINEAR_AUTHORITY_ISSUE_LABEL_NAMES.map((name) => {
    const matches = labels.filter((label) => label.name === name);
    if (matches.length !== 1) throw new Error(`Authority label ${name} must resolve exactly once`);
    const label = matches[0]!;
    const expectedParentName = LABEL_PARENT_NAMES.get(name)!;
    if (!UUID.test(label.id) || label.archivedAt !== null || label.retiredAt !== null || label.inheritedFromId !== null ||
      label.isGroup || label.parentName !== expectedParentName ||
      (expectedParentName === null) !== (label.parentId === null) ||
      (name === "Requirement"
        ? !UUID.test(label.teamId ?? "") || label.teamKey !== "REQ"
        : label.teamId !== null || label.teamKey !== null) ||
      !text(label.color) || (label.description !== null && typeof label.description !== "string")) {
      throw new Error(`Authority label ${name} differs from its required native scope`);
    }
    if (expectedParentName !== null) {
      const parent = groupByName.get(expectedParentName);
      if (!parent || parent.id !== label.parentId) {
        throw new Error(`Authority label ${name} parent group differs from its exact native identity`);
      }
    }
    return {
      id: label.id,
      name: label.name,
      parentId: label.parentId,
      parentName: label.parentName,
      teamId: label.teamId,
      teamKey: label.teamKey,
      color: label.color,
      description: label.description,
    };
  });
  return {
    schemaVersion: 1,
    initialized: true,
    labels: selected,
    groups,
    root: linearAuthorityIssueLabelContractRoot(selected, groups),
  };
}

export function initializeLinearProgramScopeAuthorityIssueLabelContract(
  programScopeRaw: string,
  labels: readonly LinearAuthorityIssueLabelCapture[],
): {
  scope: LinearProgramScopeV3;
  contract: LinearAuthorityIssueLabelContract & { initialized: true };
  raw: string;
  changed: boolean;
} {
  let scope: LinearProgramScopeV3;
  try {
    scope = JSON.parse(programScopeRaw) as LinearProgramScopeV3;
  } catch {
    throw new Error("Linear program scope is not valid JSON");
  }
  if (scope.schemaVersion !== 3 || !validAuthorityIssueLabelContract(scope.authorityIssueLabelContract)) {
    throw new Error("Linear program scope authority label contract is missing or invalid");
  }
  const contract = buildLinearAuthorityIssueLabelContract(labels);
  if (scope.authorityIssueLabelContract.initialized === true) {
    const committed = scope.authorityIssueLabelContract;
    if (committed.root !== contract.root || JSON.stringify(committed.labels) !== JSON.stringify(contract.labels) ||
      JSON.stringify(committed.groups) !== JSON.stringify(contract.groups)) {
      throw new Error("Initialized authority label contract differs from the fresh native capture");
    }
    return { scope, contract, raw: programScopeRaw, changed: false };
  }
  const initialized: LinearProgramScopeV3 = { ...scope, authorityIssueLabelContract: contract };
  return {
    scope: initialized,
    contract,
    raw: `${JSON.stringify(initialized, null, 2)}\n`,
    changed: true,
  };
}

function sourceFingerprint(
  content: string | null | undefined,
  sourceDocument: string,
): string | null {
  const matches = (content ?? "")
    .split(/\r?\n/)
    .filter((line) => line.includes(sourceDocument))
    .flatMap((line) =>
      [...line.matchAll(/(?:sha256:)?([a-f0-9]{64})/gi)].map((match) =>
        match[1].toLowerCase()
      )
    );
  if (matches.length > 1) {
    throw new Error(
      `Linear planning document repeats ${sourceDocument} fingerprint`,
    );
  }
  return matches[0] ?? null;
}

export function linearPlanningSourceFingerprints(
  content: string | null | undefined,
): LinearPlanningSourceFingerprints {
  return {
    masterSpecSha256: sourceFingerprint(content, "Sourcera_Master_Spec.md"),
    uxDesignSha256: sourceFingerprint(content, "UX_Design_of_Sourcera.md"),
  };
}

export function linearPlanningSectionHeadings(
  content: string | null | undefined,
): string[] {
  return (content ?? "")
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line);
      return match ? [match[1].trim()] : [];
    });
}

export function assertLinearPlanningSourceFingerprints(
  scope: LinearProgramScope,
  fingerprint: LinearProgramFingerprint,
  expected: ExpectedLinearPlanningSourceFingerprints,
): void {
  if (
    !SHA256.test(expected.masterSpecSha256) ||
    !SHA256.test(expected.uxDesignSha256)
  ) {
    throw new Error("Canonical planning source fingerprints are invalid");
  }
  const document = fingerprint.documents.find(
    (row) => row.id === scope.planningDocument.id,
  );
  if (
    !document ||
    document.sourceFingerprints?.masterSpecSha256 !==
      expected.masterSpecSha256 ||
    document.sourceFingerprints?.uxDesignSha256 !== expected.uxDesignSha256
  ) {
    throw new Error(
      "Linear planning document source fingerprints differ from canonical sources",
    );
  }
  if (
    scope.schemaVersion === 3 &&
    (() => {
      const expectedIds = new Set([
        ...scope.canonicalProjectDocuments,
        ...scope.supplementaryDocuments,
      ].map((row) => row.id));
      const expectedDocuments = (fingerprint.projectDocuments ?? []).filter(
        (row) => expectedIds.has(row.id),
      );
      return expectedDocuments.length !== expectedIds.size ||
        expectedDocuments.some(
          (row) => row.masterSpecSha256 !== expected.masterSpecSha256,
        );
    })()
  ) {
    throw new Error(
      "Linear project documents differ from the canonical Master Spec fingerprint",
    );
  }
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function add(findings: Finding[], code: string, message: string): void {
  findings.push({ code, message });
}

function duplicate(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

export function linearProgramScopeFindings(
  scope: LinearProgramScope,
  fingerprint: LinearProgramFingerprint,
): Finding[] {
  const findings: Finding[] = [];
  if (
    (scope?.schemaVersion !== 2 && scope?.schemaVersion !== 3) ||
    (scope?.schemaVersion === 3 &&
      (!Array.isArray(scope.canonicalProjectDocuments) ||
        !Array.isArray(scope.supplementaryDocuments) ||
        !scope.projectDocumentDecisionContract ||
        !validAuthorityIssueLabelContract(scope.authorityIssueLabelContract))) ||
    Object.hasOwn(scope ?? {}, "parentInitiative") ||
    !Array.isArray(scope.outcomeInitiatives) ||
    scope.outcomeInitiatives.length !== 6 ||
    scope.outcomeInitiatives.some(
      (initiative) => !UUID.test(initiative?.id ?? "") || !text(initiative?.name),
    ) ||
    !scope.planningDocument ||
    !UUID.test(scope.planningDocument.id ?? "") ||
    !text(scope.planningDocument.title) ||
    !SHA256.test(scope.planningDocument.contentFingerprint ?? "") ||
    scope.planningDocument.initiativeId !== null ||
    scope.planningDocument.projectId !== null ||
    !UUID.test(scope.planningDocument.teamId ?? "") ||
    scope.planningDocument.issueId !== null ||
    !Array.isArray(scope.planningDocument.requiredSections) ||
    !scope.planningDocument.requiredSections.length ||
    scope.planningDocument.requiredSections.some((section) => !text(section)) ||
    duplicate(scope.planningDocument.requiredSections) ||
    !Array.isArray(scope.projectDescriptionFingerprints) ||
    !Array.isArray(scope.projectInitiatives) ||
    !scope.projectInitiatives.length
  ) {
    add(
      findings,
      "linear_program_scope_invalid",
      "Independent Linear program scope is missing or invalid",
    );
    return findings;
  }

  const initiativeScope = scope.outcomeInitiatives;
  const initiativeIds = initiativeScope.map((initiative) => initiative.id);
  if (duplicate(initiativeIds)) {
    add(
      findings,
      "linear_program_scope_initiative_duplicate",
      "Linear program scope contains duplicate initiative IDs",
    );
  }
  const projectIds = scope.projectInitiatives.map((project) => project.projectId);
  if (scope.schemaVersion === 3) {
    findings.push(
      ...linearProjectDocumentScopeFindings(
        scope.canonicalProjectDocuments,
        scope.supplementaryDocuments,
        projectIds,
        scope.projectDocumentDecisionContract,
      ),
    );
  }
  if (
    duplicate(projectIds) ||
    scope.projectInitiatives.some(
      (project) =>
        !UUID.test(project?.projectId ?? "") ||
        !Array.isArray(project.initiativeIds) ||
        project.initiativeIds.length !== 1 ||
        duplicate(project.initiativeIds) ||
        !scope.outcomeInitiatives.some(
          (initiative) => initiative.id === project.initiativeIds[0],
        ),
    )
  ) {
    add(
      findings,
      "linear_program_scope_project_mapping_invalid",
      "Linear program scope project initiative mappings are incomplete or invalid",
    );
  }
  for (const initiative of scope.outcomeInitiatives) {
    if (
      !scope.projectInitiatives.some((project) =>
        project.initiativeIds.includes(initiative.id)
      )
    ) {
      add(
        findings,
        "linear_program_scope_initiative_unowned",
        `Linear initiative ${initiative.id} owns no project`,
      );
    }
  }
  const descriptionProjectIds = scope.projectDescriptionFingerprints.map(
    (project) => project.projectId,
  );
  const expectedMilestoneIds = scope.projectDescriptionFingerprints.flatMap(
    (project) => project.milestones?.map((milestone) => milestone.milestoneId) ?? [],
  );
  if (
    scope.projectDescriptionFingerprints.length !== scope.projectInitiatives.length ||
    duplicate(descriptionProjectIds) ||
    duplicate(expectedMilestoneIds) ||
    scope.projectDescriptionFingerprints.some(
      (project) =>
        !UUID.test(project?.projectId ?? "") ||
        !projectIds.includes(project.projectId) ||
        !SHA256.test(project.descriptionFingerprint ?? "") ||
        !Array.isArray(project.milestones) ||
        project.milestones.some(
          (milestone) =>
            !UUID.test(milestone?.milestoneId ?? "") ||
            !SHA256.test(milestone.descriptionFingerprint ?? ""),
        ),
    ) ||
    projectIds.some((projectId) => !descriptionProjectIds.includes(projectId))
  ) {
    add(
      findings,
      "linear_program_description_contract_invalid",
      "Linear program scope lacks exact project or milestone description fingerprints",
    );
  }

  if (
    !fingerprint ||
    !Array.isArray(fingerprint.initiatives) ||
    !Array.isArray(fingerprint.documents) ||
    !Array.isArray(fingerprint.projectInitiatives)
  ) {
    add(
      findings,
      "linear_program_fingerprint_missing",
      "Linear fingerprint lacks complete program topology",
    );
    return findings;
  }

  const liveInitiativeById = new Map(
    fingerprint.initiatives.map((initiative) => [initiative.id, initiative]),
  );
  if (
    duplicate(fingerprint.initiatives.map((initiative) => initiative.id)) ||
    fingerprint.initiatives.length !== initiativeScope.length
  ) {
    add(
      findings,
      "linear_program_initiative_inventory_changed",
      "Linear initiative inventory differs from canonical program scope",
    );
  }
  for (const expected of initiativeScope) {
    const live = liveInitiativeById.get(expected.id);
    if (
      !live ||
      live.name !== expected.name ||
      live.archivedAt !== null ||
      live.parentInitiativeId !== null
    ) {
      add(
        findings,
        "linear_program_initiative_topology_changed",
        `Linear initiative ${expected.id} differs from canonical program scope`,
      );
    }
  }

  const documents = fingerprint.documents.filter(
    (document) => document.id === scope.planningDocument.id,
  );
  if (
    fingerprint.documents.length !== 1 ||
    documents.length !== 1 ||
    documents[0].title !== scope.planningDocument.title ||
    documents[0].archivedAt !== null ||
    documents[0].initiativeId !== scope.planningDocument.initiativeId ||
    documents[0].projectId !== scope.planningDocument.projectId ||
    documents[0].teamId !== scope.planningDocument.teamId ||
    documents[0].issueId !== scope.planningDocument.issueId
  ) {
    add(
      findings,
      "linear_program_document_topology_changed",
      "Canonical Linear planning document is missing or attached incorrectly",
    );
  }
  const document = documents[0];
  if (
    document &&
    (!SHA256.test(document.contentFingerprint) ||
      !Array.isArray(document.sectionHeadings) ||
      document.sectionHeadings.some((section) => !text(section)) ||
      duplicate(document.sectionHeadings))
  ) {
    add(
      findings,
      "linear_program_document_content_invalid",
      "Canonical Linear planning document content fingerprint is invalid",
    );
  }
  if (
    document &&
    document.contentFingerprint !== scope.planningDocument.contentFingerprint
  ) {
    add(
      findings,
      "linear_program_document_content_changed",
      "Canonical Linear planning document body differs from the approved fingerprint",
    );
  }
  if (
    document &&
    scope.planningDocument.requiredSections.some(
      (section) => !document.sectionHeadings.includes(section),
    )
  ) {
    add(
      findings,
      "linear_program_document_section_missing",
      "Canonical Linear planning document lacks a required section",
    );
  }

  const liveProjects = new Map(
    fingerprint.projectInitiatives.map((project) => [
      project.projectId,
      [...project.initiativeIds].sort(),
    ]),
  );
  if (
    duplicate(
      fingerprint.projectInitiatives.map((project) => project.projectId),
    ) ||
    fingerprint.projectInitiatives.length !== scope.projectInitiatives.length
  ) {
    add(
      findings,
      "linear_program_project_inventory_changed",
      "Linear program project inventory differs from canonical scope",
    );
  }
  for (const expected of scope.projectInitiatives) {
    if (
      JSON.stringify(liveProjects.get(expected.projectId)) !==
        JSON.stringify([...expected.initiativeIds].sort())
    ) {
      add(
        findings,
        "linear_program_project_initiatives_changed",
        `Linear project ${expected.projectId} initiative memberships differ from canonical scope`,
      );
    }
  }
  if (scope.schemaVersion === 3) {
    if (!Array.isArray(fingerprint.projectDocuments)) {
      add(
        findings,
        "linear_project_document_fingerprint_missing",
        "Linear fingerprint lacks project documents",
      );
    } else {
      findings.push(
        ...linearProjectDocumentFingerprintFindings(
          scope.canonicalProjectDocuments,
          scope.supplementaryDocuments,
          fingerprint.projectDocuments,
          fingerprint.projectDocumentConflicts ?? [],
        ),
      );
    }
    if (!Array.isArray(fingerprint.projectDocumentConflicts)) {
      add(
        findings,
        "linear_project_document_conflict_fingerprint_missing",
        "Linear fingerprint lacks project-document collision inventory",
      );
    }
    if (!Array.isArray(fingerprint.decisionIssues)) {
      add(
        findings,
        "linear_project_document_decision_fingerprint_missing",
        "Linear fingerprint lacks project-document Decision issues",
      );
    }
  } else if (
    fingerprint.projectDocuments !== undefined ||
    fingerprint.projectDocumentConflicts !== undefined
  ) {
    add(
      findings,
      "linear_project_document_fingerprint_unexpected",
      "Schema v2 Linear fingerprint unexpectedly contains project documents",
    );
  } else if (fingerprint.decisionIssues !== undefined) {
    add(
      findings,
      "linear_project_document_decision_fingerprint_unexpected",
      "Schema v2 Linear fingerprint unexpectedly contains project-document Decisions",
    );
  }
  return findings;
}

export function assertLinearProgramScope(
  scope: LinearProgramScope,
  fingerprint: LinearProgramFingerprint,
): void {
  const findings = linearProgramScopeFindings(scope, fingerprint);
  if (findings.length) throw new Error(findings[0].message);
}
