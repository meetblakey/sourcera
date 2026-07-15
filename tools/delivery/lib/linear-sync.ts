import type { LinearFingerprint } from "./linear-live.js";
import type { Finding, ReleaseId } from "./model.js";

type LinearIssue = LinearFingerprint["issues"][number];
type ReleasePipeline = LinearFingerprint["releasePipelines"][number];
type LinearRelease = LinearFingerprint["releases"][number];
type ProtectedIssueField = Exclude<
  keyof LinearIssue,
  | "identifier"
  | "updatedAt"
  | "milestone"
  | "relations"
  | "labels"
  | "releases"
>;

export interface LinearSyncAllowances {
  expectedMilestoneByIssue?: ReadonlyMap<string, string | null>;
  readinessFailedIssueIds?: ReadonlySet<string>;
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
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

function compareIssue(
  findings: Finding[],
  before: LinearIssue,
  after: LinearIssue,
  expectedRelease: ReleaseId | undefined,
  hasExpectedMilestone: boolean,
  expectedMilestone: string | null | undefined,
  readinessFailed: boolean,
): void {
  const protectedFields: Record<
    ProtectedIssueField,
    { code: string; label: string }
  > = {
    title: { code: "linear_sync_title_changed", label: "title" },
    descriptionFingerprint: {
      code: "linear_sync_description_changed",
      label: "description",
    },
    estimate: {
      code: "linear_sync_estimate_changed",
      label: "estimate",
    },
    assignee: {
      code: "linear_sync_owner_changed",
      label: "owner",
    },
    team: { code: "linear_sync_team_changed", label: "team" },
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

  const requiredMilestone = hasExpectedMilestone
    ? expectedMilestone
    : before.milestone;
  if (!equal(after.milestone, requiredMilestone)) {
    add(
      findings,
      "linear_sync_milestone_changed",
      hasExpectedMilestone
        ? `${before.identifier} milestone is not exactly the planned milestone`
        : `${before.identifier} milestone changed without a plan`,
      before.identifier,
    );
  }

  if (!equal(sorted(before.relations), sorted(after.relations))) {
    add(
      findings,
      "linear_sync_relations_changed",
      `${before.identifier} relations changed during Linear release sync`,
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
    type: pipeline.type,
    isProduction: pipeline.isProduction,
    teams: sorted(pipeline.teams),
    stages: [...pipeline.stages].sort((left, right) =>
      left.id.localeCompare(right.id)
    ),
  };
}

function normalizedRelease(release: LinearRelease): unknown {
  return {
    id: release.id,
    name: release.name,
    version: release.version,
    pipeline: release.pipeline,
    stage: release.stage,
    stageType: release.stageType,
  };
}

function compareTopology<T>(
  findings: Finding[],
  beforeValues: readonly T[],
  afterValues: readonly T[],
  id: (value: T) => string,
  normalized: (value: T) => unknown,
  prefix: "linear_sync_release_pipeline" | "linear_sync_release",
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

  return findings.sort((left, right) =>
    left.code.localeCompare(right.code) ||
    (left.issueId ?? "").localeCompare(right.issueId ?? "") ||
    left.message.localeCompare(right.message)
  );
}
