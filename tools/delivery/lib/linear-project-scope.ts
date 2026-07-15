import type { Finding } from "./model.js";

export interface LinearProjectScope {
  schemaVersion: number;
  projects: Array<{ id: string; name: string }>;
}

interface ProjectIdentity {
  id: string;
  name?: string;
}

export function linearProjectScopeFindings(
  scope: LinearProjectScope,
  projects: readonly ProjectIdentity[],
): Finding[] {
  const findings: Finding[] = [];
  if (
    scope?.schemaVersion !== 1 ||
    !Array.isArray(scope.projects) ||
    !scope.projects.length ||
    scope.projects.some(
      (project) =>
        typeof project.id !== "string" ||
        !project.id.trim() ||
        typeof project.name !== "string" ||
        !project.name.trim(),
    )
  ) {
    findings.push({
      code: "linear_project_scope_invalid",
      message: "Independent Linear project scope is missing or invalid",
    });
    return findings;
  }

  const scopeIds = scope.projects.map((project) => project.id);
  if (new Set(scopeIds).size !== scopeIds.length) {
    findings.push({
      code: "linear_project_scope_definition_duplicate",
      message: "Independent Linear project scope contains duplicate IDs",
    });
  }

  const projectIds = projects.map((project) => project.id);
  const projectCounts = new Map<string, number>();
  for (const projectId of projectIds) {
    projectCounts.set(projectId, (projectCounts.get(projectId) ?? 0) + 1);
  }
  for (const projectId of [...projectCounts.keys()].sort()) {
    if ((projectCounts.get(projectId) ?? 0) > 1) {
      findings.push({
        code: "linear_project_scope_duplicate",
        message: `Linear snapshot project scope has duplicate ${projectId}`,
      });
    }
  }

  const scopeIdSet = new Set(scopeIds);
  const projectIdSet = new Set(projectIds);
  const projectById = new Map(
    projects.map((project) => [project.id, project]),
  );
  for (const projectId of [...scopeIdSet].sort()) {
    if (!projectIdSet.has(projectId)) {
      findings.push({
        code: "linear_project_scope_missing",
        message: `Linear snapshot project scope ${projectId} is missing`,
      });
    }
  }
  for (const projectId of [...projectIdSet].sort()) {
    if (!scopeIdSet.has(projectId)) {
      findings.push({
        code: "linear_project_scope_unexpected",
        message: `Linear snapshot project scope ${projectId} is unexpected`,
      });
    }
  }
  for (const scopedProject of scope.projects) {
    const project = projectById.get(scopedProject.id);
    if (
      project &&
      project.name !== scopedProject.name
    ) {
      findings.push({
        code: "linear_project_scope_name_changed",
        message: `Linear snapshot project scope ${scopedProject.id} name differs from canonical scope`,
      });
    }
  }
  return findings;
}

export function assertLinearProjectScope(
  scope: LinearProjectScope,
  projects: readonly ProjectIdentity[],
): string[] {
  const findings = linearProjectScopeFindings(scope, projects);
  if (findings.length) throw new Error(findings[0].message);
  return scope.projects.map((project) => project.id).sort();
}
