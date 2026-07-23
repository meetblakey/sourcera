import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
} from "./linear-live.js";
import type { Finding, ReleaseId } from "./model.js";

type LinearIssue = LinearFingerprint["issues"][number];
type ReleasePipeline = LinearFingerprint["releasePipelines"][number];
type LinearRelease = LinearFingerprint["releases"][number];
type LinearProject = LinearFingerprint["projects"][number];
type LinearProjectMilestone = LinearFingerprint["projectMilestones"][number];
type ProtectedIssueField = Exclude<
  keyof LinearIssue,
  | "identifier"
  | "updatedAt"
  | "milestoneId"
  | "milestone"
  | "relations"
  | "labels"
  | "releases"
>;

export interface LinearMilestoneIdentity {
  id: string;
  name: string;
}

export interface LinearSyncAllowances {
  expectedMilestoneByIssue?: ReadonlyMap<
    string,
    LinearMilestoneIdentity | null
  >;
  expectedRelationsByIssue?: ReadonlyMap<string, readonly string[]>;
  readinessFailedIssueIds?: ReadonlySet<string>;
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function stableIdentityAvailable(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

function archiveCapabilityAvailable(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || !ISO_UTC.test(value)) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function indexById<T>(
  values: readonly T[],
  id: (value: T) => string,
): { rows: Map<string, T>; duplicates: string[] } {
  const rows = new Map<string, T>();
  const duplicates = new Set<string>();
  for (const value of values) {
    const key = id(value);
    if (rows.has(key)) duplicates.add(key);
    else rows.set(key, value);
  }
  return { rows, duplicates: sorted([...duplicates]) };
}

function add(
  findings: Finding[],
  code: string,
  message: string,
  issueId?: string,
): void {
  findings.push({ code, message, ...(issueId ? { issueId } : {}) });
}

function expectedRelationSet(
  findings: Finding[],
  issueId: string,
  beforeRelations: readonly string[],
  expectedRelations: readonly string[] | undefined,
): string[] {
  const normalized: string[] = [];
  const issueMismatches = new Set<string>();
  let noncanonical = !Array.isArray(expectedRelations);
  for (const relation of expectedRelations ?? []) {
    const parts = relation.split(":");
    if (parts.length !== 3) {
      noncanonical = true;
      continue;
    }
    try {
      const canonical = canonicalLinearRelationKey(
        parts[0],
        parts[1],
        parts[2],
      );
      if (canonical !== relation) noncanonical = true;
      if (
        canonical === relation &&
        parts[1] !== issueId &&
        parts[2] !== issueId
      ) {
        issueMismatches.add(relation);
      }
      normalized.push(canonical);
    } catch {
      noncanonical = true;
    }
  }
  if (noncanonical) {
    add(
      findings,
      "linear_sync_expected_relations_noncanonical",
      `${issueId} expected relations are not a complete canonical set`,
      issueId,
    );
  }
  if (new Set(normalized).size !== normalized.length) {
    add(
      findings,
      "linear_sync_expected_relations_duplicate",
      `${issueId} expected relations contain duplicates`,
      issueId,
    );
  }
  for (const relation of sorted([...issueMismatches])) {
    add(
      findings,
      "linear_sync_expected_relation_issue_mismatch",
      `${issueId} expected relation ${relation} does not contain the mapped issue`,
      issueId,
    );
  }
  const relations = sorted([...new Set(normalized)]);
  const beforeSet = new Set(beforeRelations);
  if (
    [...new Set([...beforeRelations, ...relations])].some(
      (relation) =>
        beforeSet.has(relation) !== relations.includes(relation) &&
        !relation.startsWith("blocks:"),
    )
  ) {
    add(
      findings,
      "linear_sync_expected_relation_type_invalid",
      `${issueId} expected relations change a relation other than blocks`,
      issueId,
    );
  }
  return relations;
}

function validateExpectedRelationEndpoints(
  findings: Finding[],
  beforeIssues: ReadonlyMap<string, LinearIssue>,
  expectedRelationsByIssue:
    | ReadonlyMap<string, readonly string[]>
    | undefined,
): void {
  if (!expectedRelationsByIssue) return;
  const incomplete = new Set<string>();
  for (const [issueId, expectedRelations] of expectedRelationsByIssue) {
    const beforeIssue = beforeIssues.get(issueId);
    if (!beforeIssue || !Array.isArray(expectedRelations)) continue;
    const beforeRelations = new Set(beforeIssue.relations);
    const expectedSet = new Set(expectedRelations);
    for (const relation of new Set([
      ...beforeRelations,
      ...expectedRelations,
    ])) {
      const parts = relation.split(":");
      if (
        parts.length !== 3 ||
        parts[0] !== "blocks" ||
        beforeRelations.has(relation) === expectedSet.has(relation) ||
        (parts[1] !== issueId && parts[2] !== issueId)
      ) {
        continue;
      }
      try {
        if (
          canonicalLinearRelationKey(parts[0], parts[1], parts[2]) !== relation
        ) {
          continue;
        }
      } catch {
        continue;
      }
      const shouldExist = expectedSet.has(relation);
      if (
        [parts[1], parts[2]].some((endpoint) => {
          const endpointRelations = expectedRelationsByIssue.get(endpoint);
          return (
            !endpointRelations || endpointRelations.includes(relation) !== shouldExist
          );
        })
      ) {
        incomplete.add(relation);
      }
    }
  }
  for (const relation of sorted([...incomplete])) {
    const [, issueId] = relation.split(":");
    add(
      findings,
      "linear_sync_expected_relation_endpoint_incomplete",
      `${relation} is not declared in complete expected relation sets for both endpoints`,
      issueId,
    );
  }
}

function compareIssue(
  findings: Finding[],
  before: LinearIssue,
  after: LinearIssue,
  expectedRelease: ReleaseId | undefined,
  hasExpectedMilestone: boolean,
  expectedMilestone: LinearMilestoneIdentity | null | undefined,
  hasExpectedRelations: boolean,
  expectedRelations: readonly string[] | undefined,
  readinessFailed: boolean,
): void {
  const protectedFields: Record<
    ProtectedIssueField,
    { code: string; label: string }
  > = {
    linearId: {
      code: "linear_sync_issue_identity_changed",
      label: "stable Linear identity",
    },
    title: { code: "linear_sync_title_changed", label: "title" },
    descriptionFingerprint: {
      code: "linear_sync_description_changed",
      label: "description",
    },
    sourceProvenance: {
      code: "linear_sync_source_provenance_changed",
      label: "source provenance",
    },
    estimate: {
      code: "linear_sync_estimate_changed",
      label: "estimate",
    },
    priority: {
      code: "linear_sync_priority_changed",
      label: "priority",
    },
    archivedAt: {
      code: "linear_sync_archived_changed",
      label: "archive identity",
    },
    assignee: {
      code: "linear_sync_owner_changed",
      label: "owner",
    },
    assigneeId: {
      code: "linear_sync_owner_identity_changed",
      label: "owner identity",
    },
    team: { code: "linear_sync_team_changed", label: "team" },
    teamId: {
      code: "linear_sync_team_identity_changed",
      label: "team identity",
    },
    projectId: {
      code: "linear_sync_project_changed",
      label: "project identity",
    },
    project: {
      code: "linear_sync_project_changed",
      label: "project",
    },
    parent: {
      code: "linear_sync_parent_changed",
      label: "parent",
    },
    state: { code: "linear_sync_state_changed", label: "state" },
    stateType: {
      code: "linear_sync_state_type_changed",
      label: "state type",
    },
  };
  for (const [field, { code, label }] of Object.entries(protectedFields) as
    Array<[ProtectedIssueField, { code: string; label: string }]>) {
    if (!equal(before[field], after[field])) {
      add(
        findings,
        code,
        `${before.identifier} ${label} changed during Linear release sync`,
        before.identifier,
      );
    }
  }

  const requiredMilestoneId = hasExpectedMilestone
    ? expectedMilestone?.id ?? null
    : before.milestoneId;
  const requiredMilestoneName = hasExpectedMilestone
    ? expectedMilestone?.name ?? null
    : before.milestone;
  if (
    !equal(after.milestoneId, requiredMilestoneId) ||
    !equal(after.milestone, requiredMilestoneName)
  ) {
    add(
      findings,
      "linear_sync_milestone_changed",
      hasExpectedMilestone
        ? `${before.identifier} milestone is not exactly the planned milestone`
        : `${before.identifier} milestone changed without a plan`,
      before.identifier,
    );
  }

  const requiredRelations = hasExpectedRelations
    ? expectedRelationSet(
        findings,
        before.identifier,
        before.relations,
        expectedRelations,
      )
    : sorted(before.relations);
  if (new Set(before.relations).size !== before.relations.length) {
    add(
      findings,
      "linear_sync_relations_duplicate_before",
      `${before.identifier} before-state relations contain duplicates`,
      before.identifier,
    );
  }
  if (new Set(after.relations).size !== after.relations.length) {
    add(
      findings,
      "linear_sync_relations_duplicate_after",
      `${before.identifier} after-state relations contain duplicates`,
      before.identifier,
    );
  }
  if (!equal(sorted(after.relations), requiredRelations)) {
    add(
      findings,
      "linear_sync_relations_changed",
      hasExpectedRelations
        ? `${before.identifier} relations are not exactly the planned complete set`
        : `${before.identifier} relations changed during Linear release sync`,
      before.identifier,
    );
  }

  const beforeLabels = sorted(before.labels);
  const afterLabels = sorted(after.labels);
  const withoutReadiness = beforeLabels.filter((label) => label !== "codex-ready");
  if (
    !equal(afterLabels, beforeLabels) &&
    !(readinessFailed && equal(afterLabels, withoutReadiness))
  ) {
    add(
      findings,
      "linear_sync_labels_changed",
      `${before.identifier} labels changed outside the codex-ready removal allowance`,
      before.identifier,
    );
  }

  const requiredReleases = expectedRelease
    ? [expectedRelease]
    : sorted(before.releases);
  if (!equal(sorted(after.releases), requiredReleases)) {
    add(
      findings,
      "linear_sync_issue_release_changed",
      expectedRelease
        ? `${before.identifier} release is not exactly ${expectedRelease}`
        : `${before.identifier} unmapped release placement changed`,
      before.identifier,
    );
  }
}

function normalizedPipeline(pipeline: ReleasePipeline): unknown {
  return {
    id: pipeline.id,
    name: pipeline.name,
    archivedAt: pipeline.archivedAt,
    type: pipeline.type,
    isProduction: pipeline.isProduction,
    teams: [...pipeline.teams]
      .map(({ id, key }) => ({ id, key }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    stages: [...pipeline.stages]
      .map(({ id, name, type, archivedAt, position, frozen }) => ({
        id,
        name,
        type,
        archivedAt,
        position,
        frozen,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function normalizedRelease(release: LinearRelease): unknown {
  return {
    id: release.id,
    name: release.name,
    version: release.version,
    archivedAt: release.archivedAt,
    pipeline: release.pipeline,
    stage: release.stage,
    stageType: release.stageType,
  };
}

function normalizedProject(project: LinearProject): unknown {
  return { id: project.id, name: project.name, archivedAt: project.archivedAt };
}

function normalizedProjectMilestone(
  milestone: LinearProjectMilestone,
): unknown {
  return {
    id: milestone.id,
    name: milestone.name,
    projectId: milestone.projectId,
    project: milestone.project,
    archivedAt: milestone.archivedAt,
  };
}

function addCapabilityFindings(
  findings: Finding[],
  before: LinearFingerprint,
  after: LinearFingerprint,
): void {
  const captures = [before, after];
  const unavailableIssueIds = new Set<string>();
  const unavailableIssueArchiveIds = new Set<string>();
  const unavailablePipelineArchiveIds = new Set<string>();
  const unavailableStageArchiveIds = new Set<string>();
  const unavailableReleaseArchiveIds = new Set<string>();
  const unavailableProjectArchiveIds = new Set<string>();
  const unavailableMilestoneArchiveIds = new Set<string>();
  for (const capture of captures) {
    for (const issue of capture.issues) {
      if (!stableIdentityAvailable(issue.linearId)) {
        unavailableIssueIds.add(issue.identifier);
      }
      if (!archiveCapabilityAvailable(issue.archivedAt)) {
        unavailableIssueArchiveIds.add(issue.identifier);
      }
    }
    for (const pipeline of capture.releasePipelines) {
      if (!archiveCapabilityAvailable(pipeline.archivedAt)) {
        unavailablePipelineArchiveIds.add(pipeline.id);
      }
      for (const stage of pipeline.stages) {
        if (!archiveCapabilityAvailable(stage.archivedAt)) {
          unavailableStageArchiveIds.add(stage.id);
        }
      }
    }
    for (const release of capture.releases) {
      if (!archiveCapabilityAvailable(release.archivedAt)) {
        unavailableReleaseArchiveIds.add(release.id);
      }
    }
    for (const project of capture.projects) {
      if (!archiveCapabilityAvailable(project.archivedAt)) {
        unavailableProjectArchiveIds.add(project.id);
      }
    }
    for (const milestone of capture.projectMilestones) {
      if (!archiveCapabilityAvailable(milestone.archivedAt)) {
        unavailableMilestoneArchiveIds.add(milestone.id);
      }
    }
  }
  for (const identifier of sorted([...unavailableIssueIds])) {
    add(
      findings,
      "linear_sync_issue_identity_unavailable",
      `${identifier} stable Linear identity is unavailable`,
      identifier,
    );
  }
  for (const identifier of sorted([...unavailableIssueArchiveIds])) {
    add(
      findings,
      "linear_sync_issue_archive_capability_unavailable",
      `${identifier} archive state is unavailable`,
      identifier,
    );
  }
  const topologyCapabilities: Array<[Set<string>, string, string]> = [
    [
      unavailablePipelineArchiveIds,
      "linear_sync_release_pipeline_archive_capability_unavailable",
      "Release pipeline",
    ],
    [
      unavailableStageArchiveIds,
      "linear_sync_release_stage_archive_capability_unavailable",
      "Release stage",
    ],
    [
      unavailableReleaseArchiveIds,
      "linear_sync_release_archive_capability_unavailable",
      "Release",
    ],
    [
      unavailableProjectArchiveIds,
      "linear_sync_project_archive_capability_unavailable",
      "Project",
    ],
    [
      unavailableMilestoneArchiveIds,
      "linear_sync_project_milestone_archive_capability_unavailable",
      "Project milestone",
    ],
  ];
  for (const [ids, code, label] of topologyCapabilities) {
    for (const id of sorted([...ids])) {
      add(findings, code, `${label} ${id} archive state is unavailable`);
    }
  }
}

function validateExpectedMilestones(
  findings: Finding[],
  afterIssues: ReadonlyMap<string, LinearIssue>,
  after: LinearFingerprint,
  expectedMilestoneByIssue:
    | ReadonlyMap<string, LinearMilestoneIdentity | null>
    | undefined,
): void {
  if (!expectedMilestoneByIssue) return;
  const milestoneById = indexById(after.projectMilestones, (row) => row.id).rows;
  const projectById = indexById(after.projects, (row) => row.id).rows;
  for (const [issueId, expectedMilestone] of expectedMilestoneByIssue) {
    if (expectedMilestone === null) continue;
    const issue = afterIssues.get(issueId);
    if (!issue) continue;
    const milestone = milestoneById.get(expectedMilestone.id);
    if (!milestone) {
      add(
        findings,
        "linear_sync_expected_milestone_missing",
        `${issueId} planned milestone ${expectedMilestone.id} is absent from after-state inventory`,
        issueId,
      );
      continue;
    }
    if (milestone.name !== expectedMilestone.name) {
      add(
        findings,
        "linear_sync_expected_milestone_name_mismatch",
        `${issueId} planned milestone ${expectedMilestone.id} name differs from after-state inventory`,
        issueId,
      );
    }
    if (milestone.archivedAt !== null) {
      add(
        findings,
        "linear_sync_expected_milestone_archived",
        `${issueId} planned milestone ${expectedMilestone.id} is not active`,
        issueId,
      );
    }
    if (
      milestone.projectId !== issue.projectId ||
      milestone.project !== issue.project
    ) {
      add(
        findings,
        "linear_sync_expected_milestone_project_mismatch",
        `${issueId} planned milestone ${expectedMilestone.id} belongs to another project`,
        issueId,
      );
      continue;
    }
    const project = projectById.get(milestone.projectId);
    if (!project || project.name !== milestone.project) {
      add(
        findings,
        "linear_sync_expected_milestone_project_missing",
        `${issueId} planned milestone project is absent from after-state inventory`,
        issueId,
      );
    } else if (project.archivedAt !== null) {
      add(
        findings,
        "linear_sync_expected_milestone_project_archived",
        `${issueId} planned milestone project is not active`,
        issueId,
      );
    }
  }
}

function compareTopology<T>(
  findings: Finding[],
  beforeValues: readonly T[],
  afterValues: readonly T[],
  id: (value: T) => string,
  normalized: (value: T) => unknown,
  prefix:
    | "linear_sync_release_pipeline"
    | "linear_sync_release"
    | "linear_sync_project"
    | "linear_sync_project_milestone",
  label: string,
): void {
  const before = indexById(beforeValues, id);
  const after = indexById(afterValues, id);

  for (const duplicate of before.duplicates) {
    add(
      findings,
      `${prefix}_duplicate_before`,
      `Before-state contains duplicate ${label} ${duplicate}`,
    );
  }
  for (const duplicate of after.duplicates) {
    add(
      findings,
      `${prefix}_duplicate_after`,
      `After-state contains duplicate ${label} ${duplicate}`,
    );
  }
  for (const key of sorted([...before.rows.keys()])) {
    const afterValue = after.rows.get(key);
    if (!afterValue) {
      add(findings, `${prefix}_missing`, `${label} ${key} disappeared`);
      continue;
    }
    if (!equal(normalized(before.rows.get(key)!), normalized(afterValue))) {
      add(findings, `${prefix}_changed`, `${label} ${key} topology changed`);
    }
  }
  for (const key of sorted([...after.rows.keys()])) {
    if (!before.rows.has(key)) {
      add(findings, `${prefix}_unexpected`, `Unexpected ${label} ${key} appeared`);
    }
  }
}

export function linearSyncPreservationFindings(
  before: LinearFingerprint,
  after: LinearFingerprint,
  expectedReleaseByIssue: ReadonlyMap<string, ReleaseId>,
  allowances: LinearSyncAllowances = {},
): Finding[] {
  const findings: Finding[] = [];
  addCapabilityFindings(findings, before, after);
  const beforeIssues = indexById(before.issues, (issue) => issue.identifier);
  const afterIssues = indexById(after.issues, (issue) => issue.identifier);

  for (const duplicate of beforeIssues.duplicates) {
    add(
      findings,
      "linear_sync_issue_duplicate_before",
      `Before-state contains duplicate issue ${duplicate}`,
      duplicate,
    );
  }
  for (const duplicate of afterIssues.duplicates) {
    add(
      findings,
      "linear_sync_issue_duplicate_after",
      `After-state contains duplicate issue ${duplicate}`,
      duplicate,
    );
  }
  validateExpectedRelationEndpoints(
    findings,
    beforeIssues.rows,
    allowances.expectedRelationsByIssue,
  );
  validateExpectedMilestones(
    findings,
    afterIssues.rows,
    after,
    allowances.expectedMilestoneByIssue,
  );
  for (const identifier of sorted([...beforeIssues.rows.keys()])) {
    const afterIssue = afterIssues.rows.get(identifier);
    if (!afterIssue) {
      add(
        findings,
        "linear_sync_issue_missing",
        `${identifier} disappeared during Linear release sync`,
        identifier,
      );
      continue;
    }
    compareIssue(
      findings,
      beforeIssues.rows.get(identifier)!,
      afterIssue,
      expectedReleaseByIssue.get(identifier),
      allowances.expectedMilestoneByIssue?.has(identifier) ?? false,
      allowances.expectedMilestoneByIssue?.get(identifier),
      allowances.expectedRelationsByIssue?.has(identifier) ?? false,
      allowances.expectedRelationsByIssue?.get(identifier),
      allowances.readinessFailedIssueIds?.has(identifier) ?? false,
    );
  }
  for (const identifier of sorted([...afterIssues.rows.keys()])) {
    if (!beforeIssues.rows.has(identifier)) {
      add(
        findings,
        "linear_sync_issue_unexpected",
        `${identifier} appeared during Linear release sync`,
        identifier,
      );
    }
  }
  const expectedIssueIds = new Set([
    ...expectedReleaseByIssue.keys(),
    ...(allowances.expectedMilestoneByIssue?.keys() ?? []),
    ...(allowances.expectedRelationsByIssue?.keys() ?? []),
    ...(allowances.readinessFailedIssueIds?.values() ?? []),
  ]);
  for (const identifier of sorted([...expectedIssueIds])) {
    if (
      !beforeIssues.rows.has(identifier) ||
      !afterIssues.rows.has(identifier)
    ) {
      add(
        findings,
        "linear_sync_expected_issue_missing",
        `Expected sync change references issue ${identifier} without a complete before/after capture`,
        identifier,
      );
    }
  }

  compareTopology(
    findings,
    before.releasePipelines,
    after.releasePipelines,
    (pipeline) => pipeline.id,
    normalizedPipeline,
    "linear_sync_release_pipeline",
    "release pipeline",
  );
  compareTopology(
    findings,
    before.releases,
    after.releases,
    (release) => release.id,
    normalizedRelease,
    "linear_sync_release",
    "release",
  );
  compareTopology(
    findings,
    before.projects,
    after.projects,
    (project) => project.id,
    normalizedProject,
    "linear_sync_project",
    "project",
  );
  compareTopology(
    findings,
    before.projectMilestones,
    after.projectMilestones,
    (milestone) => milestone.id,
    normalizedProjectMilestone,
    "linear_sync_project_milestone",
    "project milestone",
  );

  return findings.sort((left, right) =>
    left.code.localeCompare(right.code) ||
    (left.issueId ?? "").localeCompare(right.issueId ?? "") ||
    left.message.localeCompare(right.message)
  );
}
