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
  sourceFamilyId?: string | null;
  kind?: string;
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
  releases?: string[];
  relations?: string[];
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
  const executableFamilies: Array<{ issueId: string; sourceFamilyId: string }> = [];
  const graphRows: ManifestRow[] = [];
  for (const issue of candidate.issues) {
    const executable =
      issue.sourceId !== null ||
      issue.kind === "executable" ||
      issue.kind === "proof_only";
    const sourceFamilyId = issue.sourceFamilyId ?? issue.sourceId;
    const live = liveByIssue.get(issue.id);
    if (executable) {
      if (!nonempty(sourceFamilyId)) {
        findings.push({
          code: "linear_candidate_executable_source_family_missing",
          issueId: issue.id,
          message: `Executable Linear candidate issue ${issue.id || "unknown"} lacks a source family`,
        });
      } else {
        executableFamilies.push({ issueId: issue.id, sourceFamilyId });
      }
      if (
        issue.sourceId !== null &&
        issue.sourceFamilyId != null &&
        issue.sourceId !== issue.sourceFamilyId
      ) {
        findings.push({
          code: "linear_candidate_source_family_conflict",
          issueId: issue.id,
          message: `${issue.id} source family differs from its primary source identity`,
        });
      }
      const liveReleases = live?.releases;
      if (
        !Array.isArray(liveReleases) ||
        liveReleases.length !== 1 ||
        !/^R[0-5]$/.test(liveReleases[0] ?? "") ||
        issue.release !== liveReleases[0]
      ) {
        findings.push({
          code: "linear_candidate_executable_release_invalid",
          issueId: issue.id,
          message: `Executable Linear candidate issue ${issue.id || "unknown"} must have exactly one matching canonical release`,
        });
      }
      if (
        !live ||
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
          message: `Executable Linear candidate issue ${issue.id || "unknown"} lacks exact project and milestone identity`,
        });
      }
    }
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

  }

  for (const family of executableFamilies) {
    if (!sourceOwners.has(family.sourceFamilyId)) {
      findings.push({
        code: "linear_candidate_source_family_owner_missing",
        issueId: family.issueId,
        message: `${family.issueId} source family ${family.sourceFamilyId} has no primary owner`,
      });
    }
  }

  const plannedIssueIds = new Set(candidate.issues.map((issue) => issue.id));
  for (const issue of candidate.issues) {
    const live = liveByIssue.get(issue.id);
    if (!live || !Array.isArray(live.relations)) {
      findings.push({
        code: "linear_candidate_live_relations_missing",
        issueId: issue.id,
        message: `${issue.id || "unknown"} lacks native relation readback`,
      });
      continue;
    }
    const dependencies = live.relations
      .flatMap((relation) => {
        const [type, prerequisite, dependent] = relation.split(":");
        return type === "blocks" &&
          dependent === issue.id &&
          plannedIssueIds.has(prerequisite)
          ? [prerequisite]
          : [];
      })
      .sort();
    graphRows.push({
      requirementId: issue.id,
      outcome: issue.id,
      sourceDoc: "Linear snapshot candidate",
      sourceVersion: "live",
      section: issue.id,
      dependencies: [...new Set(dependencies)],
      disposition: "executable",
      release: issue.release,
      issueId: issue.id,
    });
  }

  findings.push(...validateGraph(graphRows, releases));
  return findings;
}
