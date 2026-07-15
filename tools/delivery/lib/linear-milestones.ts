import type { Finding } from "./model.js";

interface ProjectRow {
  id: string;
  name: string;
  updatedAt: string | null;
}

interface MilestoneRow {
  id: string;
  name: string;
  projectId: string;
  project: string;
  targetDate: string | null;
  updatedAt: string | null;
}

interface FingerprintIssue {
  identifier: string;
  projectId?: string | null;
  project: string | null;
  milestoneId?: string | null;
  milestone: string | null;
}

export interface LinearMilestoneSnapshot {
  projects?: ProjectRow[];
  milestones?: MilestoneRow[];
  linearFingerprint?: {
    issues?: FingerprintIssue[];
    projects?: ProjectRow[];
    projectMilestones?: MilestoneRow[];
  };
}

const compareId = <T extends { id: string }>(left: T, right: T) =>
  left.id.localeCompare(right.id);

const projectProjection = (rows: ProjectRow[]) =>
  rows.map(({ id, name, updatedAt }) => ({ id, name, updatedAt })).sort(compareId);

const milestoneProjection = (rows: MilestoneRow[]) =>
  rows
    .map(({ id, name, updatedAt, targetDate, projectId, project }) => ({
      id,
      name,
      updatedAt,
      targetDate,
      projectId,
      project,
    }))
    .sort(compareId);

export function linearMilestoneFindings(
  snapshot: LinearMilestoneSnapshot,
): Finding[] {
  const findings: Finding[] = [];
  const projects = Array.isArray(snapshot.projects) ? snapshot.projects : null;
  const milestones = Array.isArray(snapshot.milestones)
    ? snapshot.milestones
    : null;
  const fingerprint = snapshot.linearFingerprint;
  const fingerprintIssues = Array.isArray(fingerprint?.issues)
    ? fingerprint.issues
    : null;
  const fingerprintProjects = Array.isArray(fingerprint?.projects)
    ? fingerprint.projects
    : null;
  const fingerprintMilestones = Array.isArray(fingerprint?.projectMilestones)
    ? fingerprint.projectMilestones
    : null;

  if (!projects?.length) {
    findings.push({
      code: "linear_project_inventory_missing",
      message: "Linear snapshot lacks the tracked project inventory",
    });
  }
  if (!milestones?.length) {
    findings.push({
      code: "linear_milestone_inventory_missing",
      message: "Linear snapshot lacks the project milestone inventory",
    });
  }
  if (!fingerprintIssues) {
    findings.push({
      code: "linear_fingerprint_issues_missing",
      message: "Linear fingerprint lacks issue project and milestone readback",
    });
  }
  if (!fingerprintProjects?.length) {
    findings.push({
      code: "linear_fingerprint_projects_missing",
      message: "Linear fingerprint lacks the tracked project inventory",
    });
  }
  if (!fingerprintMilestones?.length) {
    findings.push({
      code: "linear_fingerprint_milestones_missing",
      message: "Linear fingerprint lacks the project milestone inventory",
    });
  }
  if (!projects || !milestones) return findings;

  if (
    projects.some(
      (project) =>
        !project.id?.trim() ||
        !project.name?.trim() ||
        !project.updatedAt ||
        Number.isNaN(Date.parse(project.updatedAt)),
    )
  ) {
    findings.push({
      code: "linear_project_inventory_incomplete",
      message: "Linear project inventory has missing identity or update metadata",
    });
  }
  if (
    milestones.some(
      (milestone) =>
        !milestone.id?.trim() ||
        !milestone.name?.trim() ||
        !milestone.projectId?.trim() ||
        !milestone.project?.trim() ||
        !milestone.updatedAt ||
        Number.isNaN(Date.parse(milestone.updatedAt)),
    )
  ) {
    findings.push({
      code: "linear_milestone_inventory_incomplete",
      message: "Linear milestone inventory has missing identity, project, or update metadata",
    });
  }

  const projectsById = new Map(projects.map((project) => [project.id, project]));
  if (
    projectsById.size !== projects.length ||
    new Set(projects.map((project) => project.name)).size !== projects.length
  ) {
    findings.push({
      code: "linear_project_inventory_duplicate",
      message: "Linear project inventory contains duplicate identities",
    });
  }
  if (
    new Set(milestones.map((milestone) => milestone.id)).size !==
      milestones.length ||
    new Set(
        milestones.map((milestone) =>
          `${milestone.projectId}:${milestone.name}`
        ),
      ).size !== milestones.length
  ) {
    findings.push({
      code: "linear_milestone_inventory_duplicate",
      message: "Linear milestone inventory contains duplicate identities",
    });
  }
  const milestonesById = new Map(
    milestones.map((milestone) => [milestone.id, milestone]),
  );
  if (
    milestones.some(
      (milestone) =>
        projectsById.get(milestone.projectId)?.name !== milestone.project,
    )
  ) {
    findings.push({
      code: "linear_milestone_project_invalid",
      message: "Linear milestone inventory references an unknown or mismatched project",
    });
  }

  if (
    fingerprintProjects &&
    JSON.stringify(projectProjection(projects)) !==
      JSON.stringify(projectProjection(fingerprintProjects))
  ) {
    findings.push({
      code: "linear_project_inventory_drift",
      message: "Linear project inventory differs from its live fingerprint",
    });
  }
  if (
    fingerprintMilestones &&
    JSON.stringify(milestoneProjection(milestones)) !==
      JSON.stringify(milestoneProjection(fingerprintMilestones))
  ) {
    findings.push({
      code: "linear_milestone_inventory_drift",
      message: "Linear milestone inventory differs from its live fingerprint",
    });
  }

  if (
    fingerprintIssues?.some(
      (issue) =>
        Boolean(issue.projectId) !== Boolean(issue.project) ||
        Boolean(issue.milestoneId) !== Boolean(issue.milestone) ||
        (Boolean(issue.milestoneId) && !issue.projectId),
    )
  ) {
    findings.push({
      code: "linear_issue_project_milestone_metadata_incomplete",
      message: "Linear issue fingerprint has partial project or milestone identity",
    });
  }
  if (
    fingerprintIssues?.some((issue) => {
      if (
        issue.projectId &&
        projectsById.has(issue.projectId) &&
        projectsById.get(issue.projectId)?.name !== issue.project
      ) {
        return true;
      }
      if (!issue.milestoneId || !issue.projectId || !projectsById.has(issue.projectId)) {
        return false;
      }
      const milestone = milestonesById.get(issue.milestoneId);
      return (
        !milestone ||
        milestone.name !== issue.milestone ||
        milestone.projectId !== issue.projectId ||
        milestone.project !== issue.project
      );
    })
  ) {
    findings.push({
      code: "linear_issue_project_milestone_metadata_inconsistent",
      message: "Linear issue fingerprint references mismatched project or milestone identity",
    });
  }

  for (const project of [...projects].sort(compareId)) {
    const productionMilestones = milestones.filter(
      (milestone) =>
        milestone.projectId === project.id &&
        milestone.name === "Production evidence closed",
    );
    if (productionMilestones.length === 0) {
      findings.push({
        code: "production_evidence_milestone_missing",
        message: `${project.name} lacks Production evidence closed`,
      });
      continue;
    }
    if (productionMilestones.length > 1) {
      findings.push({
        code: "production_evidence_milestone_duplicate",
        message: `${project.name} has duplicate Production evidence closed milestones`,
      });
      continue;
    }
    const milestone = productionMilestones[0];
    const occupied = fingerprintIssues?.some(
      (issue) =>
        issue.projectId === project.id &&
        issue.project === project.name &&
        issue.milestoneId === milestone.id &&
        issue.milestone === milestone.name,
    );
    if (!occupied) {
      findings.push({
        code: "production_evidence_milestone_empty",
        message: `${project.name} has an empty Production evidence closed milestone`,
      });
    }
  }
  return findings;
}
