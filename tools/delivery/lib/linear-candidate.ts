import { validateGraph } from "./graph.js";
import type {
  Finding,
  ManifestRow,
  ReleaseDefinition,
  ReleaseId,
} from "./model.js";

interface CandidateIssue {
  id: string;
  sourceId: string | null;
  dependencies: string[];
  release: ReleaseId | null;
  milestone: string | null;
}

interface CandidateFingerprintIssue {
  identifier: string;
  projectId: string | null;
  project: string | null;
  milestoneId: string | null;
  milestone: string | null;
}

export interface LinearSnapshotCandidate {
  issues: CandidateIssue[];
  linearFingerprint: {
    issues: CandidateFingerprintIssue[];
  };
}

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function linearCandidateFindings(
  candidate: LinearSnapshotCandidate,
  releases: ReleaseDefinition[],
): Finding[] {
  if (
    !candidate ||
    !Array.isArray(candidate.issues) ||
    !Array.isArray(candidate.linearFingerprint?.issues) ||
    !Array.isArray(releases) ||
    !releases.length
  ) {
    return [
      {
        code: "linear_candidate_invalid",
        message: "Linear snapshot candidate or release inventory is incomplete",
      },
    ];
  }

  const findings: Finding[] = [];
  const liveByIssue = new Map<string, CandidateFingerprintIssue>();
  for (const issue of candidate.linearFingerprint.issues) {
    if (!nonempty(issue.identifier) || liveByIssue.has(issue.identifier)) {
      findings.push({
        code: "linear_candidate_live_issue_duplicate",
        issueId: issue.identifier,
        message: `Linear candidate live issue ${issue.identifier || "unknown"} is duplicate or invalid`,
      });
      continue;
    }
    liveByIssue.set(issue.identifier, issue);
  }

  const sourceOwners = new Map<string, string>();
  const graphRows: ManifestRow[] = [];
  for (const issue of candidate.issues) {
    if (issue.sourceId === null) continue;
    if (
      !nonempty(issue.id) ||
      !nonempty(issue.sourceId) ||
      !Array.isArray(issue.dependencies)
    ) {
      findings.push({
        code: "linear_candidate_mapped_issue_invalid",
        issueId: issue.id,
        message: `Mapped Linear candidate issue ${issue.id || "unknown"} is incomplete`,
      });
      continue;
    }
    const priorOwner = sourceOwners.get(issue.sourceId);
    if (priorOwner) {
      findings.push({
        code: "linear_candidate_source_duplicate",
        issueId: issue.id,
        message: `${issue.sourceId} is mapped by ${priorOwner} and ${issue.id}`,
      });
      continue;
    }
    sourceOwners.set(issue.sourceId, issue.id);

    const live = liveByIssue.get(issue.id);
    if (!live) {
      findings.push({
        code: "linear_candidate_live_issue_missing",
        issueId: issue.id,
        message: `Mapped Linear candidate issue ${issue.id} lacks live readback`,
      });
    } else if (
      !nonempty(live.projectId) ||
      !nonempty(live.project) ||
      !nonempty(live.milestoneId) ||
      !nonempty(live.milestone) ||
      !nonempty(issue.milestone) ||
      issue.milestone !== live.milestone
    ) {
      findings.push({
        code: "linear_candidate_mapped_issue_scope_missing",
        issueId: issue.id,
        message: `Mapped Linear candidate issue ${issue.id} lacks exact project and milestone identity`,
      });
    }

    graphRows.push({
      requirementId: issue.sourceId,
      outcome: issue.id,
      sourceDoc: "Linear snapshot candidate",
      sourceVersion: "live",
      section: issue.id,
      dependencies: issue.dependencies,
      disposition: "executable",
      release: issue.release,
      issueId: issue.id,
    });
  }

  findings.push(...validateGraph(graphRows, releases));
  return findings;
}
