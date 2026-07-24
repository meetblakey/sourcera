import type { Finding } from "./model.js";

export interface LinearProgramScope {
  schemaVersion: 2;
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
    scope?.schemaVersion !== 2 ||
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
  return findings;
}

export function assertLinearProgramScope(
  scope: LinearProgramScope,
  fingerprint: LinearProgramFingerprint,
): void {
  const findings = linearProgramScopeFindings(scope, fingerprint);
  if (findings.length) throw new Error(findings[0].message);
}
