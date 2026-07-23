import type {
  Finding,
  LinearIssueSnapshot,
} from "./model.js";

export interface IssueFamily {
  sourceIssue: LinearIssueSnapshot;
  executableIssues: LinearIssueSnapshot[];
}

export function issueFamilyForSource(
  issues: LinearIssueSnapshot[],
  sourceId: string,
): IssueFamily | null {
  const sourceIssue = issues.find((issue) => issue.sourceId === sourceId);
  if (!sourceIssue) return null;
  const explicitFamily = issues.filter(
    (issue) =>
      issue.kind === "executable" &&
      (issue.sourceFamilyId ?? issue.sourceId) === sourceId,
  );
  return {
    sourceIssue,
    executableIssues: sourceIssue.kind === "parent"
      ? issues.filter(
          (issue) =>
            issue.kind === "executable" &&
            issue.parentId === sourceIssue.id,
        )
      : explicitFamily.length
      ? explicitFamily
      : [sourceIssue],
  };
}

export function issueFamilyFindings(
  issues: LinearIssueSnapshot[],
): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(issues.map((issue) => [issue.id, issue]));
  const sourceOwners = new Map(
    issues.flatMap((issue) =>
      issue.sourceId ? [[issue.sourceId, issue] as const] : []
    ),
  );

  for (const issue of issues) {
    if (issue.kind === "parent") {
      if (issue.labels.includes("codex-ready")) {
        findings.push({
          code: "parent_marked_ready",
          issueId: issue.id,
          message: `${issue.id} is a parent and cannot be codex-ready`,
        });
      }
      if (issue.sourceId) {
        const validChildren = issues.filter(
          (candidate) =>
            candidate.kind === "executable" &&
            candidate.parentId === issue.id &&
            candidate.sourceId === null &&
            candidate.release === issue.release,
        );
        if (!validChildren.length) {
          findings.push({
            code: "parent_without_executable_child",
            issueId: issue.id,
            message: `${issue.id} has no valid executable child`,
          });
        }
      }
      continue;
    }

    if (issue.kind !== "executable") continue;
    const sourceFamilyId = issue.sourceFamilyId ?? issue.sourceId;
    if (
      issue.sourceFamilyId &&
      issue.sourceId &&
      issue.sourceFamilyId !== issue.sourceId
    ) {
      findings.push({
        code: "source_family_conflict",
        issueId: issue.id,
        message: `${issue.id} source family differs from its source identity`,
      });
    }
    const parent = issue.parentId ? byId.get(issue.parentId) : undefined;
    if (issue.parentId && !parent) {
      findings.push({
        code: "orphan_child",
        issueId: issue.id,
        message: `${issue.id} points to missing parent ${issue.parentId}`,
      });
      continue;
    }
    if (parent && parent.kind !== "parent") {
      findings.push({
        code: "child_parent_invalid",
        issueId: issue.id,
        message: `${issue.id} points to non-parent ${parent.id}`,
      });
      continue;
    }

    if (parent?.sourceId) {
      if (issue.sourceId) {
        findings.push({
          code: "child_source_conflict",
          issueId: issue.id,
          message: `${issue.id} and parent ${parent.id} both carry source identities`,
        });
      }
      if (issue.release !== parent.release) {
        findings.push({
          code: "child_release_drift",
          issueId: issue.id,
          message: `${issue.id} release differs from parent ${parent.id}`,
        });
      }
      continue;
    }

    if (!sourceFamilyId) {
      findings.push({
        code: "source_less_top_level_executable",
        issueId: issue.id,
        message: `${issue.id} has neither a source nor a source-backed parent`,
      });
    } else if (!sourceOwners.has(sourceFamilyId)) {
      findings.push({
        code: "source_family_owner_missing",
        issueId: issue.id,
        message: `${issue.id} source family ${sourceFamilyId} has no primary owner`,
      });
    }
  }

  return findings;
}
