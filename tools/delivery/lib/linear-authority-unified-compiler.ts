import { randomUUID, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { descriptionFingerprint } from "./fingerprint.js";
import { resolveExactGitCommit } from "./git-commit-provenance.js";
import {
  canonicalAuthorityRelationPlanKey,
  normalizeAuthorityMarkdown,
  type AuthorityDocumentTarget,
  type AuthorityIssueDescriptionRepair,
  type AuthorityManagedTarget,
  type AuthorityNativeRelation,
  type AuthorityReferenceTarget,
  type LinearTargetAllocation,
} from "./linear-authority-manifest.js";
import {
  buildLinearAuthorityPackageV2,
  type LinearAuthorityDocumentCanaryMeasurementV2,
  type LinearAuthorityPackagePlanV2,
  type LinearAuthorityPackageV2,
} from "./linear-authority-package-v2.js";
import {
  buildLinearAuthorityRequirementAdoptionArtifacts,
} from "./linear-authority-requirement-adoption.js";
import {
  buildLinearAuthoritySemanticPlanV4FromCapture,
  canonicalLinearAuthoritySemanticPlanV4Json,
} from "./linear-authority-semantic-plan-v4.js";
import {
  compileLinearAuthoritySourceLineage,
  computeLinearAuthoritySourceSetRoot,
  LINEAR_AUTHORITY_SOURCE_SPECS,
  normalizeLinearAuthoritySourceMarkdown,
  type LinearAuthoritySourceLineageSource,
} from "./linear-authority-source-lineage.js";
import {
  buildLinearOperatingDecisionPublicationPlan,
  type LinearOperatingDecisionNativeSnapshot,
  type LinearOperatingDecisionPublicationPlan,
} from "./linear-operating-decision-plan.js";
import {
  buildLinearRiskPublicationPlan,
  type LinearRiskNativeCatalogSnapshot,
  type LinearRiskPublicationPlan,
} from "./linear-risk-plan.js";
import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
  type LinearNativeIdentityCapture,
  type LinearRawDocumentCapture,
} from "./linear-live.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./linear-program-scope.js";
import type { LinearProjectScope } from "./linear-project-scope.js";

type Bytes = string | Uint8Array;
type AllocationKind = LinearTargetAllocation["kind"];
type CapturedIssue = LinearNativeIdentityCapture["issues"][number];
type CapturedLabel = LinearNativeIdentityCapture["labels"][number] & {
  description?: string | null;
};

export interface LinearAuthorityUnifiedCompilerInput {
  repositoryRoot: string;
  preCutoverTag: string;
  linearFingerprintRaw: Bytes;
  liveCaptureRaw: Bytes;
  rawDocumentsRaw: Bytes;
  issueDescriptionsRaw: Bytes;
  captureReceiptRaw: Bytes;
  githubExecutionRaw: Bytes;
  projectScopeRaw: Bytes;
  programScopeRaw: Bytes;
  requirementBaselineRaw: Bytes;
  allocateUuidV4?: (planKey: string, kind: AllocationKind) => string;
}

export interface LinearAuthorityUnifiedCompilerResult {
  authority: LinearAuthorityPackageV2;
  desiredAuthorityRoot: string;
  operatingDecisionPlan: LinearOperatingDecisionPublicationPlan;
  riskPlan: LinearRiskPublicationPlan;
  audit: {
    requirements: 926;
    dispositionDecisions: 61;
    operatingDecisions: 85;
    adoptedProductDecisions: 2;
    decisions: 148;
    risks: 24;
    documents: 30;
    descriptionRepairs: number;
    references: number;
    nativeRelations: number;
    adoptedAllocations: number;
    allocatedAllocations: number;
  };
}

const DIGEST = /^[a-f0-9]{64}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRE_CUTOVER_TAG = "pre-linear-authority-2026-07-27";
const PRE_CUTOVER_COMMIT = "8c4e00e377ddc3cce404589aaf256f0f254ea6c1";
const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });
const sort = (values: readonly string[]): string[] => [...values].sort(compare);
const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");
const bytes = (value: Bytes): Buffer =>
  typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
const json = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\n`, "utf8");

function fail(message: string): never {
  throw new Error(`Linear authority unified compiler: ${message}`);
}

function parseJson<T>(value: Bytes, label: string): T {
  try {
    return JSON.parse(bytes(value).toString("utf8")) as T;
  } catch {
    return fail(`${label} is not valid JSON`);
  }
}

function one<T>(rows: readonly T[], label: string): T {
  if (rows.length !== 1) fail(`${label} must resolve exactly once`);
  return rows[0]!;
}

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

function capturedIssueNativeSha(issue: CapturedIssue): string {
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

function capturedDocumentTopologySha(
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

function registryOrigin(): AuthorityManagedTarget["origin"] {
  return "registry" as AuthorityManagedTarget["origin"];
}

function makeManagedTarget(input: Omit<AuthorityManagedTarget,
  "descriptionSha256" | "payloadSha256">): AuthorityManagedTarget {
  const target: AuthorityManagedTarget = {
    ...input,
    descriptionSha256: sha256(input.description),
    payloadSha256: "",
  };
  target.payloadSha256 = managedPayloadSha256(target);
  return target;
}

function pinCurrent(target: AuthorityManagedTarget, issue: CapturedIssue): void {
  target.expectedCurrentIssueUuid = issue.issueUuid;
  target.expectedCurrentDescriptionSha256 = issue.descriptionSha256;
  target.expectedCurrentNativeSha256 = capturedIssueNativeSha(issue);
  target.expectedIdentifier = issue.identifier;
  target.payloadSha256 = managedPayloadSha256(target);
}

function active<T extends { archivedAt: string | null }>(rows: readonly T[]): T[] {
  return rows.filter((row) => row.archivedAt === null);
}

function extractOperatingReferences(raw: string): string[] {
  const references = new Set<string>();
  const lines = raw.trimEnd().split("\n").filter(Boolean);
  for (const line of lines) {
    const row = parseJson<{ decision: string; assumption: string; validationTrigger: string }>(line, "operating Decision row");
    const text = `${row.decision}\n${row.assumption}\n${row.validationTrigger}`;
    for (const match of text.matchAll(/\bF-(?:(?:AE|BC)-)?\d{3}(?:\.[A-Z0-9]+)?\b/g)) {
      references.add(match[0].replace(/^(F-(?:(?:AE|BC)-)?\d{3})(?:\.[A-Z0-9]+)?$/, "$1"));
    }
    for (const match of text.matchAll(/\b(?:PLA|SEL|BUY|INT|REQ)-[1-9]\d*\b/g)) {
      references.add(match[0]);
    }
    for (const match of text.matchAll(/\bRG(?::|-)[a-z0-9_.-]+\b/gi)) {
      references.add(match[0]);
    }
  }
  return sort([...references]);
}

function issueDescriptions(value: Bytes): Map<string, string> {
  const parsed = parseJson<{ schemaVersion: number; issues: Array<{
    id: string;
    title: string;
    description: string | null;
  }> }>(value, "issue descriptions");
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.issues)) fail("issue description capture is invalid");
  const result = new Map<string, string>();
  for (const row of parsed.issues) {
    if (!row || typeof row.id !== "string" || typeof row.title !== "string" ||
      (row.description !== null && typeof row.description !== "string") || result.has(row.id)) {
      fail("issue description capture contains an invalid or duplicate row");
    }
    result.set(row.id, row.description ?? "");
  }
  return result;
}

function selectedRiskLabels(
  capture: LinearNativeIdentityCapture,
  contract: LinearAuthorityIssueLabelContract & { initialized: true },
): Map<string, CapturedLabel> {
  const definitions = new Map([
    ["risk", { parent: "Type", color: "#E5484D", description: "Canonical delivery risk." }],
    ["delivery-risk", { parent: "Risk", color: "#D97706", description: "Delivery, governance, readiness, or operational execution risk." }],
    ["financial-risk", { parent: "Risk", color: "#A16207", description: "Billing, metering, pricing, or financial integrity risk." }],
    ["security-risk", { parent: "Risk", color: "#B91C1C", description: "Security-sensitive implementation or proof work." }],
    ["compliance-risk", { parent: "Risk", color: "#991B1B", description: "Compliance-sensitive implementation or proof work." }],
  ] as const);
  const labels = new Map<string, CapturedLabel>();
  for (const [name, expected] of definitions) {
    const pinned = one(contract.labels.filter((row) => row.name === name), `${name} risk label contract`);
    const label = one((capture.labels as CapturedLabel[]).filter((row) =>
      row.id === pinned.id && row.archivedAt === null && row.isGroup === false && row.name === name), `${name} risk label`);
    if (label.teamId !== null || label.parentName !== expected.parent ||
      label.color.toLocaleUpperCase("en-US") !== expected.color.toLocaleUpperCase("en-US") ||
      label.description !== expected.description) {
      fail(`${name} risk label has drifted or is not fully bootstrapped`);
    }
    const parent = one((capture.labels as CapturedLabel[]).filter((row) => row.id === label.parentId), `${name} parent label group`);
    if (parent.archivedAt !== null || parent.isGroup !== true || parent.name !== expected.parent || parent.teamId !== null) {
      fail(`${name} risk label parent group has drifted`);
    }
    labels.set(name, label);
  }
  return labels;
}

function validateProgramLabelDefinitions(
  capture: LinearNativeIdentityCapture,
  programScope: LinearProgramScopeV3,
  contract: LinearAuthorityIssueLabelContract & { initialized: true },
): Map<string, CapturedLabel> {
  const result = new Map<string, CapturedLabel>();
  const definitions = programScope.projectDocumentDecisionContract.labelDefinitions;
  if (definitions.length !== 4 || new Set(definitions.map((row) => row.id)).size !== definitions.length) {
    fail("program label definitions must contain four unique governed labels");
  }
  for (const definition of definitions) {
    const pinnedLabel = one(contract.labels.filter((row) => row.name === definition.name), `program label contract ${definition.name}`);
    const pinnedGroup = one(contract.groups.filter((row) => row.name === definition.groupName), `program label group contract ${definition.groupName}`);
    if (pinnedLabel.id !== definition.id || pinnedLabel.parentId !== definition.groupId ||
      pinnedGroup.id !== definition.groupId) {
      fail(`program label ${definition.name} differs from the initialized authority label contract`);
    }
    const label = one((capture.labels as CapturedLabel[]).filter((row) => row.id === definition.id), `program label ${definition.id}`);
    const parent = one((capture.labels as CapturedLabel[]).filter((row) => row.id === definition.groupId), `program label group ${definition.groupId}`);
    if (label.archivedAt !== null || label.inheritedFromId !== null || label.isGroup !== false ||
      label.name !== definition.name || label.parentId !== definition.groupId ||
      label.parentName !== definition.groupName || label.teamId !== null || label.teamKey !== null ||
      typeof label.color !== "string" || (label.description !== null && typeof label.description !== "string")) {
      fail(`program label ${definition.name} differs from its exact identity, group, or global scope`);
    }
    if (parent.archivedAt !== null || parent.inheritedFromId !== null || parent.isGroup !== true ||
      parent.name !== definition.groupName || parent.teamId !== null || parent.teamKey !== null ||
      parent.parentId !== null || parent.parentName !== null) {
      fail(`program label ${definition.name} parent group differs from its exact identity or global scope`);
    }
    if ((capture.labels as CapturedLabel[]).filter((row) => row.name === definition.name).length !== 1) {
      fail(`program label ${definition.name} has a duplicate or substitute identity`);
    }
    result.set(definition.id, label);
  }
  return result;
}

function operatingSnapshot(input: {
  capture: LinearNativeIdentityCapture;
  semantic: ReturnType<typeof buildLinearAuthoritySemanticPlanV4FromCapture>;
  decisionsRaw: string;
  liveCaptureRoot: string;
  requirementTeam: LinearNativeIdentityCapture["teams"][number];
  decisionLabel: CapturedLabel;
  assignee: LinearNativeIdentityCapture["users"][number];
}): LinearOperatingDecisionNativeSnapshot {
  const { capture, semantic } = input;
  const projectsByName = new Map(active(capture.projects).map((row) => [row.name, row]));
  const requirements = new Map(semantic.plan.requirements.map((row) => [row.canonicalLegacyId, row]));
  const sourceDecisions = new Map(semantic.plan.decisions.map((row) => [row.legacyId, row]));
  const issuesByIdentifier = new Map(capture.issues.map((row) => [row.identifier, row]));
  const statesById = new Map(capture.workflowStates.map((row) => [row.id, row]));
  const references = extractOperatingReferences(input.decisionsRaw)
    .filter((reference) => !new Set(["F-914", "F-918", "PLA-162", "PLA-371"]).has(reference))
    .map((reference, index): LinearOperatingDecisionNativeSnapshot["relationEndpoints"][number] => {
      const requirement = requirements.get(reference);
      if (requirement) {
        const project = projectsByName.get(requirement.project);
        if (!project) fail(`${reference} operating endpoint project is missing`);
        const adopted = semantic.plan.adoptedRequirementReconciliation.find((row) => row.canonicalLegacyId === reference);
        return {
          sourceReference: reference,
          planKey: `issue:${reference}`,
          kind: "requirement",
          issueUuid: adopted?.issueUuid ?? null,
          issueIdentifier: adopted?.issueIdentifier ?? null,
          title: requirement.title,
          projectId: project.id,
          stateName: requirement.state,
          archivedAt: null,
        };
      }
      const decision = sourceDecisions.get(reference);
      if (decision) {
        const project = projectsByName.get(decision.project);
        if (!project) fail(`${reference} operating endpoint project is missing`);
        return {
          sourceReference: reference,
          planKey: `decision:${reference}`,
          kind: "source_decision",
          issueUuid: null,
          issueIdentifier: null,
          title: decision.title,
          projectId: project.id,
          stateName: decision.state,
          archivedAt: null,
        };
      }
      const issue = issuesByIdentifier.get(reference);
      if (!issue) fail(`${reference} operating endpoint is absent from the complete capture`);
      const state = statesById.get(issue.stateId);
      if (!state || issue.projectId === null) fail(`${reference} operating endpoint has incomplete native routing`);
      return {
        sourceReference: reference,
        planKey: `relation-target:${issue.identifier}`,
        kind: "existing_issue",
        issueUuid: issue.issueUuid,
        issueIdentifier: issue.identifier,
        title: issue.title,
        projectId: issue.projectId,
        stateName: state.name,
        archivedAt: issue.archivedAt,
      };
    });
  if (references.length !== 70) fail("operating Decision relation endpoint coverage differs from 70");
  return {
    liveCaptureRoot: input.liveCaptureRoot,
    semanticPlanRoot: semantic.semanticRoot,
    semanticPlanValidated: true,
    catalogComplete: true,
    issuesComplete: true,
    relationsComplete: true,
    capturedTeamIssueCount: 0,
    issueTeamKeys: sort(active(capture.teams).map((row) => row.key)),
    team: input.requirementTeam,
    states: active(capture.workflowStates)
      .filter((row) => row.teamId === input.requirementTeam.id && (row.name === "Approved" || row.name === "Superseded"))
      .map((row) => ({ id: row.id, name: row.name, type: row.type, teamId: row.teamId, archivedAt: row.archivedAt })),
    assignee: input.assignee,
    projects: active(capture.projects).map((row) => ({ id: row.id, name: row.name, teamIds: row.teamIds, archivedAt: row.archivedAt })),
    decisionLabel: {
      id: input.decisionLabel.id,
      name: input.decisionLabel.name,
      semanticRole: "decision",
      parentId: input.decisionLabel.parentId!,
      parentName: input.decisionLabel.parentName!,
      teamId: input.decisionLabel.teamId,
      archivedAt: input.decisionLabel.archivedAt,
    },
    relationEndpoints: references,
    liveIssues: [],
  };
}

function riskSnapshot(input: {
  capture: LinearNativeIdentityCapture;
  semantic: ReturnType<typeof buildLinearAuthoritySemanticPlanV4FromCapture>;
  operating: LinearOperatingDecisionPublicationPlan;
  liveCaptureRoot: string;
  requirementTeam: LinearNativeIdentityCapture["teams"][number];
  assignee: LinearNativeIdentityCapture["users"][number];
  riskLabels: ReadonlyMap<string, CapturedLabel>;
}): LinearRiskNativeCatalogSnapshot {
  const approved = one(active(input.capture.workflowStates).filter((row) =>
    row.teamId === input.requirementTeam.id && row.name === "Approved" && row.type === "completed"), "Requirements Approved state");
  const groups = ["Type", "Risk"].map((name) => {
    const row = one((input.capture.labels as CapturedLabel[]).filter((label) =>
      label.archivedAt === null && label.isGroup === true && label.name === name), `${name} label group`);
    return { id: row.id, name: row.name, teamId: row.teamId, archivedAt: row.archivedAt };
  });
  const requirementById = new Map(input.semantic.plan.requirements.map((row) => [row.canonicalLegacyId, row]));
  const decisionById = new Map(input.operating.decisions.map((row) => [row.sourceDecisionId, row]));
  const endpoints: LinearRiskNativeCatalogSnapshot["relationEndpoints"] =
    ["F-005", "F-007", "F-132", "F-529", "F-593"].map((id) => {
    const row = requirementById.get(id);
    if (!row) fail(`${id} risk endpoint is absent from semantic plan`);
    return { planKey: `issue:${id}`, kind: "requirement" as const, title: row.title, archivedAt: null };
    });
  const production = decisionById.get("DEC-PROD-001");
  if (!production) fail("DEC-PROD-001 risk endpoint is absent from operating plan");
  endpoints.push({ planKey: production.planKey, kind: "decision", title: production.title, archivedAt: null });
  return {
    liveCaptureRoot: input.liveCaptureRoot,
    semanticPlanRoot: input.semantic.semanticRoot,
    semanticPlanValidated: true,
    catalogComplete: true,
    issuesComplete: true,
    capturedTeamIssueCount: 0,
    team: input.requirementTeam,
    state: { id: approved.id, name: approved.name, type: approved.type, teamId: approved.teamId, archivedAt: approved.archivedAt },
    assignee: input.assignee,
    projects: active(input.capture.projects).map((row) => ({ id: row.id, name: row.name, teamIds: row.teamIds, archivedAt: row.archivedAt })),
    labelGroups: groups,
    labels: [...input.riskLabels.values()].map((row) => ({
      id: row.id,
      name: row.name,
      parentId: row.parentId!,
      parentName: row.parentName!,
      teamId: row.teamId,
      color: row.color,
      description: row.description!,
      archivedAt: row.archivedAt,
    })),
    liveIssues: [],
    relationEndpoints: endpoints,
  };
}

function captureReceiptIdentity(raw: Bytes): { sourceCommit: string; capturedAt: string } {
  const receipt = parseJson<{ schemaVersion?: unknown; captureMode?: unknown; capturedAt?: unknown; source?: { commit?: unknown } }>(raw, "capture receipt");
  const commit = receipt.source?.commit;
  if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" || typeof receipt.capturedAt !== "string" ||
    Number.isNaN(Date.parse(receipt.capturedAt)) || new Date(receipt.capturedAt).toISOString() !== receipt.capturedAt ||
    typeof commit !== "string" || !/^[a-f0-9]{40,64}$/.test(commit)) {
    fail("capture receipt live identity, timestamp, or source commit is invalid");
  }
  return { sourceCommit: commit, capturedAt: receipt.capturedAt };
}

function makeDescriptionRepair(
  capture: LinearNativeIdentityCapture,
  descriptions: ReadonlyMap<string, string>,
): AuthorityIssueDescriptionRepair[] {
  const issue = one(capture.issues.filter((row) => row.identifier === "SEL-122"), "SEL-122 repair issue");
  const current = descriptions.get(issue.identifier);
  if (current === undefined || descriptionFingerprint(current) !== issue.descriptionSha256) fail("SEL-122 description capture differs from native identity");
  const first = /(<requirement\b[^>]*\bid\s*=\s*["']?)REQ-1(["']?)/g;
  const second = /(<requirement\b[^>]*\bid\s*=\s*["']?)REQ-2(["']?)/g;
  const firstMatches = [...current.matchAll(first)].length;
  const secondMatches = [...current.matchAll(second)].length;
  const completedFirst = [...current.matchAll(/<requirement\b[^>]*\bid\s*=\s*["']?example-requirement-a["']?/g)].length;
  const completedSecond = [...current.matchAll(/<requirement\b[^>]*\bid\s*=\s*["']?example-requirement-b["']?/g)].length;
  if (firstMatches === 0 && secondMatches === 0 && !/\bREQ-(?:1|2)\b/.test(current)) {
    if (completedFirst === 0 || completedSecond === 0 || issue.relationIds.length !== 0) {
      fail("SEL-122 is neither the exact pending nor completed neutral placeholder repair state");
    }
    return [{
      issueUuid: issue.issueUuid,
      identifier: issue.identifier,
      expectedCurrentDescriptionSha256: issue.descriptionSha256,
      desiredDescription: current,
      desiredDescriptionSha256: sha256(current),
      requiresNoNativeRelations: true,
    }];
  }
  if (firstMatches === 0 || secondMatches === 0 || issue.relationIds.length !== 0) {
    fail("SEL-122 neutral placeholder repair is incomplete or has native relations");
  }
  const desired = current
    .replace(first, "$1example-requirement-a$2")
    .replace(second, "$1example-requirement-b$2");
  if (/\bREQ-(?:1|2)\b/.test(desired) || desired === current) fail("SEL-122 neutral placeholder repair did not remove both example IDs");
  return [{
    issueUuid: issue.issueUuid,
    identifier: issue.identifier,
    expectedCurrentDescriptionSha256: issue.descriptionSha256,
    desiredDescription: desired,
    desiredDescriptionSha256: sha256(desired),
    requiresNoNativeRelations: true,
  }];
}

function allCapturedUuids(capture: LinearNativeIdentityCapture): Set<string> {
  const values = [
    capture.workspace.id,
    ...capture.issues.map((row) => row.issueUuid),
    ...capture.labels.map((row) => row.id),
    ...capture.relations.map((row) => row.relationId),
    ...capture.teams.map((row) => row.id),
    ...capture.workflowStates.map((row) => row.id),
    ...capture.users.map((row) => row.id),
    ...capture.initiatives.map((row) => row.id),
    ...capture.projects.map((row) => row.id),
    ...capture.releasePipelines.flatMap((row) => [row.id, ...row.stages.map((stage) => stage.id)]),
    ...capture.releases.map((row) => row.id),
    ...capture.projectMilestones.map((row) => row.id),
    ...capture.cycles.map((row) => row.id),
    ...capture.documents.map((row) => row.id),
  ];
  return new Set(values.map((value) => value.toLowerCase()));
}

export function compileLinearAuthorityUnifiedPackage(
  input: LinearAuthorityUnifiedCompilerInput,
): LinearAuthorityUnifiedCompilerResult {
  if (input.preCutoverTag !== PRE_CUTOVER_TAG ||
    resolveExactGitCommit(input.repositoryRoot, `${input.preCutoverTag}^{commit}`) !== PRE_CUTOVER_COMMIT) {
    fail("pre-cutover tag does not resolve to the approved checkpoint commit");
  }
  const capture = parseJson<LinearNativeIdentityCapture>(input.liveCaptureRaw, "native identity capture");
  const fingerprint = parseJson<LinearFingerprint>(input.linearFingerprintRaw, "Linear fingerprint");
  const rawDocuments = parseJson<LinearRawDocumentCapture>(input.rawDocumentsRaw, "raw document capture");
  const projectScope = parseJson<LinearProjectScope>(input.projectScopeRaw, "project scope");
  const programScope = parseJson<LinearProgramScopeV3>(input.programScopeRaw, "program scope");
  if (capture.schemaVersion !== 1 || capture.coverage?.complete !== true || !Array.isArray(capture.issues)) fail("native capture is incomplete");
  if (!Array.isArray(fingerprint.issues) || rawDocuments.schemaVersion !== 1 || !Array.isArray(rawDocuments.documents)) fail("capture artifacts are incomplete");
  if (projectScope.schemaVersion !== 1 || projectScope.projects.length !== 26 || programScope.schemaVersion !== 3) fail("canonical planning scopes are invalid");
  if (programScope.authorityIssueLabelContract?.initialized !== true) {
    fail("authority issue label contract is not initialized");
  }
  const authorityIssueLabelContract = programScope.authorityIssueLabelContract;
  const capturedAuthorityIssueLabelContract = buildLinearAuthorityIssueLabelContract(capture.labels);
  if (authorityIssueLabelContract.root !== capturedAuthorityIssueLabelContract.root ||
    JSON.stringify(authorityIssueLabelContract.labels) !== JSON.stringify(capturedAuthorityIssueLabelContract.labels) ||
    JSON.stringify(authorityIssueLabelContract.groups) !== JSON.stringify(capturedAuthorityIssueLabelContract.groups)) {
    fail("native authority labels or parent groups differ from the committed exact contract");
  }
  if (programScope.projectDocumentDecisionContract.trackedDecisions.length !== 2) fail("program scope must contain exactly two adopted product Decisions");

  const captureReceipt = captureReceiptIdentity(input.captureReceiptRaw);
  const sourceCommit = captureReceipt.sourceCommit;
  const descriptions = issueDescriptions(input.issueDescriptionsRaw);
  if (descriptions.size !== capture.issues.length) fail("issue description capture does not exactly cover native issues");
  const adoption = buildLinearAuthorityRequirementAdoptionArtifacts({
    rootDir: input.repositoryRoot,
    workspaceId: capture.workspace.id,
    fingerprintJson: bytes(input.linearFingerprintRaw),
    descriptionsJson: bytes(input.issueDescriptionsRaw),
    baselineJson: bytes(input.requirementBaselineRaw),
  });
  const semantic = buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir: input.repositoryRoot,
    fingerprintJson: bytes(input.linearFingerprintRaw),
    descriptionsJson: bytes(input.issueDescriptionsRaw),
    recoveryMappingJson: adoption.recoveryRaw,
    publicationJson: adoption.publicationRaw,
  });
  const semanticPlanRaw = Buffer.from(`${canonicalLinearAuthoritySemanticPlanV4Json(semantic.plan)}\n`, "utf8");
  const featureInventoryRaw = readFileSync(join(input.repositoryRoot, "_audit/FEATURE_INVENTORY.md"));
  const dispositionRegisterRaw = readFileSync(join(input.repositoryRoot, "delivery/dispositions.json"));
  const sourceChecksumsRaw = readFileSync(join(input.repositoryRoot, "delivery/ticket-source-checksums.json"));
  const decisionsRaw = readFileSync(join(input.repositoryRoot, "delivery/decisions.jsonl"), "utf8");
  const risksRaw = readFileSync(join(input.repositoryRoot, "delivery/risks.json"), "utf8");
  const sourceFiles = new Map<string, Buffer>(LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => [
    spec.path,
    readFileSync(join(input.repositoryRoot, spec.path)),
  ]));
  const sourceRows: LinearAuthoritySourceLineageSource[] = LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => {
    const raw = sourceFiles.get(spec.path)!;
    return {
      ...spec,
      byteLength: raw.length,
      rawSha256: sha256(raw),
      normalizedSha256: sha256(normalizeLinearAuthoritySourceMarkdown(raw.toString("utf8"))),
    };
  });
  const lineage = compileLinearAuthoritySourceLineage({
    authority: {
      workspaceId: capture.workspace.id,
      sourceCommit,
      planRoot: sha256("pending-plan-root"),
      sourceSetRoot: computeLinearAuthoritySourceSetRoot(sourceRows),
      semanticPlanSha256: sha256(semanticPlanRaw),
      semanticRoot: semantic.semanticRoot,
      featureInventorySha256: sha256(featureInventoryRaw),
    },
    repositoryRoot: input.repositoryRoot,
    semanticPlanRaw,
    featureInventoryRaw,
    dispositionsRaw: dispositionRegisterRaw,
    sourceChecksumsRaw,
    sourceFiles,
  });
  const lineageRaw = json(lineage);
  const requirementTeam = one(active(capture.teams).filter((row) => row.key === "REQ" && row.name === "Requirements"), "Requirements team");
  const assignee = one(active(capture.users).filter((row) => row.active === true && row.name === "Blake Rowley"), "Blake Rowley owner");
  const programLabels = validateProgramLabelDefinitions(capture, programScope, authorityIssueLabelContract);
  const decisionDefinition = one(programScope.projectDocumentDecisionContract.labelDefinitions.filter((row) =>
    row.id === programScope.projectDocumentDecisionContract.decisionLabelId && row.name === "decision" && row.groupName === "Type"), "program Decision label definition");
  const decisionLabel = programLabels.get(decisionDefinition.id)!;
  const requirementLabelDefinition = one(authorityIssueLabelContract.labels.filter((row) =>
    row.name === "Requirement"), "Requirement label contract");
  const requirementLabel = one((capture.labels as CapturedLabel[]).filter((row) =>
    row.id === requirementLabelDefinition.id && row.archivedAt === null && row.isGroup === false &&
    row.name === "Requirement" && row.teamId === requirementTeam.id), "Requirement label");
  if (requirementLabel.inheritedFromId !== null || requirementLabel.teamKey !== requirementTeam.key ||
    requirementLabel.parentId !== null || requirementLabel.parentName !== null ||
    (capture.labels as CapturedLabel[]).filter((row) => row.name === "Requirement").length !== 1) {
    fail("Requirement label differs from its exact team scope or has a duplicate identity");
  }
  const liveCaptureRoot = sha256(bytes(input.liveCaptureRaw));
  const operatingDecisionPlan = buildLinearOperatingDecisionPublicationPlan(decisionsRaw, operatingSnapshot({
    capture,
    semantic,
    decisionsRaw,
    liveCaptureRoot,
    requirementTeam,
    decisionLabel,
    assignee,
  }));
  const riskLabels = selectedRiskLabels(capture, authorityIssueLabelContract);
  const riskPlan = buildLinearRiskPublicationPlan(risksRaw, riskSnapshot({
    capture,
    semantic,
    operating: operatingDecisionPlan,
    liveCaptureRoot,
    requirementTeam,
    assignee,
    riskLabels,
  }));
  if (riskPlan.labels.some((row) => row.create || row.id === null)) fail("all five risk labels must exist exactly before authority compilation");

  const projectByName = new Map(active(capture.projects).map((row) => [row.name, row]));
  const projectById = new Map(capture.projects.map((row) => [row.id, row]));
  const teamById = new Map(capture.teams.map((row) => [row.id, row]));
  const stateById = new Map(capture.workflowStates.map((row) => [row.id, row]));
  const userById = new Map(capture.users.map((row) => [row.id, row]));
  const issueByUuid = new Map(capture.issues.map((row) => [row.issueUuid, row]));
  const issueByIdentifier = new Map(capture.issues.map((row) => [row.identifier, row]));
  const labelById = new Map((capture.labels as CapturedLabel[]).map((row) => [row.id, row]));
  const rawDocumentById = new Map(rawDocuments.documents.map((row) => [row.id, row]));
  const bindingByKey = new Map(lineage.targetBindings.map((row) => [row.targetPlanKey, row]));
  const teamPlanKey = (id: string): string => {
    const team = teamById.get(id);
    if (!team) fail(`team ${id} is absent from capture`);
    return team.id === requirementTeam.id ? "team:requirements" : `team:${team.key.toLocaleLowerCase("en-US")}`;
  };
  const projectPlanKey = (id: string): string => `project:${id}`;
  const statePlanKey = (id: string): string => `state:${id}`;
  const userPlanKey = (id: string): string => `user:${id}`;
  const milestonePlanKey = (id: string): string => `milestone:${id}`;
  const releasePlanKey = (id: string): string => `release:${id}`;
  const cyclePlanKey = (id: string): string => `cycle:${id}`;
  const semanticLabelIds = new Map<string, AuthorityManagedTarget["kind"]>([
    [requirementLabel.id, "requirement"],
    [decisionLabel.id, "decision"],
    [riskLabels.get("risk")!.id, "risk"],
  ]);
  const stableLabelNames = new Set(["Requirement", "decision", "risk", "delivery-risk", "financial-risk", "security-risk", "compliance-risk"]);
  const labelPlanKey = (id: string): string => {
    const label = labelById.get(id);
    if (!label) fail(`label ${id} is absent from capture`);
    return stableLabelNames.has(label.name)
      ? `label:${label.name.toLocaleLowerCase("en-US")}`
      : `label:${label.id}`;
  };
  const matchesExactDesiredIssue = (target: AuthorityManagedTarget, issue: CapturedIssue): boolean => {
    const description = descriptions.get(issue.identifier);
    const parentPlanKey = issue.parentIssueUuid === null
      ? null
      : `relation-target:${issueByUuid.get(issue.parentIssueUuid)?.identifier ?? "missing"}`;
    return description !== undefined && issue.title === target.title &&
      sha256(description) === target.descriptionSha256 && issue.descriptionSha256 === target.descriptionSha256 &&
      teamPlanKey(issue.teamId) === target.teamPlanKey &&
      (issue.projectId === null ? null : projectPlanKey(issue.projectId)) === target.projectPlanKey &&
      statePlanKey(issue.stateId) === target.statePlanKey && issue.priority === target.priority &&
      issue.estimate === target.estimate && issue.dueDate === target.dueDate &&
      (issue.cycleId === null ? null : cyclePlanKey(issue.cycleId)) === target.cyclePlanKey &&
      (issue.milestoneId === null ? null : milestonePlanKey(issue.milestoneId)) === target.milestonePlanKey &&
      JSON.stringify(sort(issue.releaseIds.map(releasePlanKey))) === JSON.stringify(sort(target.releasePlanKeys)) &&
      JSON.stringify(sort(issue.labelIds.map(labelPlanKey))) === JSON.stringify(sort(target.labelPlanKeys)) &&
      parentPlanKey === target.parentPlanKey &&
      (issue.assigneeId === null ? null : userPlanKey(issue.assigneeId)) === target.assigneePlanKey;
  };

  const requirementTargets = semantic.plan.requirements.map((row) => {
    const project = projectByName.get(row.project);
    const state = active(capture.workflowStates).filter((candidate) =>
      candidate.teamId === requirementTeam.id && candidate.name === row.state);
    const binding = bindingByKey.get(`issue:${row.canonicalLegacyId}`);
    if (!project || state.length !== 1 || !binding) fail(`${row.canonicalLegacyId} lacks exact native routing or lineage`);
    return makeManagedTarget({
      kind: "requirement",
      origin: "source",
      planKey: `issue:${row.canonicalLegacyId}`,
      title: row.title,
      expectedCurrentIssueUuid: null,
      expectedCurrentDescriptionSha256: null,
      expectedCurrentNativeSha256: null,
      expectedIdentifier: null,
      blockKeys: sort(binding.supportSliceKeys),
      description: row.description,
      teamPlanKey: teamPlanKey(requirementTeam.id),
      projectPlanKey: projectPlanKey(project.id),
      statePlanKey: statePlanKey(state[0]!.id),
      labelPlanKeys: [labelPlanKey(requirementLabel.id)],
      priority: row.priority,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: null,
    });
  });
  const reconciliationByLegacyId = new Map(semantic.plan.adoptedRequirementReconciliation.map((row) => [row.canonicalLegacyId, row]));
  for (const target of requirementTargets) {
    const adopted = reconciliationByLegacyId.get(target.planKey.slice("issue:".length));
    if (!adopted) continue;
    const issue = issueByUuid.get(adopted.issueUuid);
    if (!issue || issue.identifier !== adopted.issueIdentifier) fail(`${target.planKey} adoption is absent from native capture`);
    pinCurrent(target, issue);
  }

  const dispositionTargets = semantic.plan.decisions.map((row) => {
    const project = projectByName.get(row.project);
    const state = active(capture.workflowStates).filter((candidate) =>
      candidate.teamId === requirementTeam.id && candidate.name === row.state);
    const binding = bindingByKey.get(`decision:${row.legacyId}`);
    if (!project || state.length !== 1 || !binding) fail(`${row.legacyId} lacks exact native routing or lineage`);
    return makeManagedTarget({
      kind: "decision",
      origin: row.disposition === "retired_source" ? "retired_source_disposition" : "source",
      planKey: `decision:${row.legacyId}`,
      title: row.title,
      expectedCurrentIssueUuid: null,
      expectedCurrentDescriptionSha256: null,
      expectedCurrentNativeSha256: null,
      expectedIdentifier: null,
      blockKeys: sort(binding.supportSliceKeys),
      description: row.description,
      teamPlanKey: teamPlanKey(requirementTeam.id),
      projectPlanKey: projectPlanKey(project.id),
      statePlanKey: statePlanKey(state[0]!.id),
      labelPlanKeys: [labelPlanKey(decisionLabel.id)],
      priority: row.priority,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: userPlanKey(assignee.id),
    });
  });

  const operatingTargets = operatingDecisionPlan.decisions.map((row) => makeManagedTarget({
    kind: "decision",
    origin: registryOrigin(),
    planKey: row.planKey,
    title: row.title,
    expectedCurrentIssueUuid: null,
    expectedCurrentDescriptionSha256: null,
    expectedCurrentNativeSha256: null,
    expectedIdentifier: null,
    blockKeys: [],
    description: row.description,
    teamPlanKey: teamPlanKey(row.teamId),
    projectPlanKey: projectPlanKey(row.projectId),
    statePlanKey: statePlanKey(row.stateId),
    labelPlanKeys: row.labelIds.map(labelPlanKey),
    priority: row.priority,
    estimate: null,
    dueDate: null,
    cyclePlanKey: null,
    milestonePlanKey: null,
    releasePlanKeys: [],
    parentPlanKey: null,
    assigneePlanKey: userPlanKey(row.assigneeId),
  }));

  const riskTargets = riskPlan.risks.map((row) => makeManagedTarget({
    kind: "risk",
    origin: registryOrigin(),
    planKey: row.planKey,
    title: row.title,
    expectedCurrentIssueUuid: null,
    expectedCurrentDescriptionSha256: null,
    expectedCurrentNativeSha256: null,
    expectedIdentifier: null,
    blockKeys: [],
    description: row.description,
    teamPlanKey: teamPlanKey(row.teamId),
    projectPlanKey: projectPlanKey(row.projectId),
    statePlanKey: statePlanKey(row.stateId),
    labelPlanKeys: row.labelPlanKeys,
    priority: row.priority,
    estimate: null,
    dueDate: null,
    cyclePlanKey: null,
    milestonePlanKey: null,
    releasePlanKeys: [],
    parentPlanKey: null,
    assigneePlanKey: userPlanKey(row.assigneeId),
  }));

  const productDecisionTargets = programScope.projectDocumentDecisionContract.trackedDecisions.map((expected) => {
    const issue = issueByIdentifier.get(expected.decisionIdentifier);
    const description = descriptions.get(expected.decisionIdentifier);
    if (expected.labelIds.some((id) => !programLabels.has(id))) {
      fail(`${expected.decisionIdentifier} references a label outside the governed program label definitions`);
    }
    if (!issue || description === undefined || issue.archivedAt !== null || issue.title !== expected.decisionTitle ||
      issue.projectId !== expected.decisionProjectId || descriptionFingerprint(description) !== expected.descriptionFingerprint ||
      descriptionFingerprint(description) !== issue.descriptionSha256 ||
      JSON.stringify(sort(issue.labelIds)) !== JSON.stringify(sort(expected.labelIds))) {
      fail(`${expected.decisionIdentifier} differs from its exact tracked Decision contract`);
    }
    if (issue.projectId === null) fail(`${expected.decisionIdentifier} has no native project`);
    const target = makeManagedTarget({
      kind: "decision",
      origin: "live",
      planKey: `decision:${expected.decisionIdentifier}`,
      title: issue.title,
      expectedCurrentIssueUuid: issue.issueUuid,
      expectedCurrentDescriptionSha256: issue.descriptionSha256,
      expectedCurrentNativeSha256: capturedIssueNativeSha(issue),
      expectedIdentifier: issue.identifier,
      blockKeys: [],
      description,
      teamPlanKey: teamPlanKey(issue.teamId),
      projectPlanKey: projectPlanKey(issue.projectId),
      statePlanKey: statePlanKey(issue.stateId),
      labelPlanKeys: issue.labelIds.map(labelPlanKey).sort(compare),
      priority: issue.priority,
      estimate: issue.estimate,
      dueDate: issue.dueDate,
      cyclePlanKey: issue.cycleId === null ? null : cyclePlanKey(issue.cycleId),
      milestonePlanKey: issue.milestoneId === null ? null : milestonePlanKey(issue.milestoneId),
      releasePlanKeys: issue.releaseIds.map(releasePlanKey).sort(compare),
      parentPlanKey: issue.parentIssueUuid === null ? null : `relation-target:${issueByUuid.get(issue.parentIssueUuid)?.identifier ?? "missing"}`,
      assigneePlanKey: issue.assigneeId === null ? null : userPlanKey(issue.assigneeId),
    });
    if (target.parentPlanKey?.endsWith(":missing")) fail(`${expected.decisionIdentifier} parent is absent from capture`);
    return target;
  });

  const allManaged = [...requirementTargets, ...dispositionTargets, ...operatingTargets, ...riskTargets, ...productDecisionTargets];
  const productUuids = new Set(productDecisionTargets.map((row) => row.expectedCurrentIssueUuid));
  const candidatesByTitle = new Map<string, CapturedIssue[]>();
  for (const issue of active(capture.issues)) {
    if (productUuids.has(issue.issueUuid)) continue;
    candidatesByTitle.set(issue.title, [...(candidatesByTitle.get(issue.title) ?? []), issue]);
  }
  for (const target of [...dispositionTargets, ...operatingTargets, ...riskTargets]) {
    const candidates = candidatesByTitle.get(target.title) ?? [];
    if (candidates.length > 1) fail(`${target.planKey} has ambiguous live adoption candidates`);
    if (candidates.length === 1) {
      if (!matchesExactDesiredIssue(target, candidates[0]!)) {
        fail(`${target.planKey} live adoption candidate differs from the exact desired body or native payload`);
      }
      pinCurrent(target, candidates[0]!);
    }
  }

  const targetByPlanKey = new Map(allManaged.map((row) => [row.planKey, row]));
  if (targetByPlanKey.size !== allManaged.length) fail("managed plan keys are duplicated");
  if (requirementTargets.length !== 926 || dispositionTargets.length !== 61 || operatingTargets.length !== 85 ||
    productDecisionTargets.length !== 2 || riskTargets.length !== 24) {
    fail("managed family counts differ from the exact authority contract");
  }
  const managedTitles = allManaged.map((row) => row.title.normalize("NFC").toLocaleLowerCase("en-US"));
  if (new Set(managedTitles).size !== managedTitles.length) fail("managed titles are not globally unique");

  const relationMap = new Map<string, AuthorityNativeRelation>();
  const addRelation = (type: AuthorityNativeRelation["type"], sourcePlanKey: string, targetPlanKey: string): void => {
    const planKey = canonicalAuthorityRelationPlanKey(type, sourcePlanKey, targetPlanKey);
    const row = { planKey, type, sourcePlanKey, targetPlanKey };
    const prior = relationMap.get(planKey);
    if (prior && JSON.stringify(prior) !== JSON.stringify(row)) fail(`${planKey} has conflicting native relation semantics`);
    relationMap.set(planKey, row);
  };
  for (const row of semantic.plan.requirements) {
    const key = `issue:${row.canonicalLegacyId}`;
    for (const endpoint of [...row.execution, ...row.proofExecutionDependencies]) addRelation("related", key, `relation-target:${endpoint}`);
    for (const dependency of row.requirementDependencyLegacyIds) addRelation("blocks", `issue:${dependency}`, key);
  }
  for (const row of semantic.plan.decisions) {
    const key = `decision:${row.legacyId}`;
    for (const endpoint of row.existingRelations) addRelation("related", key, `relation-target:${endpoint}`);
    for (const requirement of row.requirementRelations) addRelation("related", key, `issue:${requirement}`);
  }
  for (const row of operatingDecisionPlan.relations) {
    const canonical = canonicalAuthorityRelationPlanKey(row.type, row.sourcePlanKey, row.targetPlanKey);
    if (canonical !== row.planKey) fail(`${row.planKey} is not the canonical operating relation key`);
    addRelation(row.type, row.sourcePlanKey, row.targetPlanKey);
  }
  for (const row of riskPlan.relations) {
    const canonical = canonicalAuthorityRelationPlanKey(row.type, row.sourcePlanKey, row.targetPlanKey);
    if (canonical !== row.planKey) fail(`${row.planKey} is not the canonical risk relation key`);
    addRelation(row.type, row.sourcePlanKey, row.targetPlanKey);
  }
  const productPlanKeyByUuid = new Map(productDecisionTargets.map((row) => [row.expectedCurrentIssueUuid!, row.planKey]));
  for (const target of productDecisionTargets) {
    const issue = issueByUuid.get(target.expectedCurrentIssueUuid!)!;
    for (const relationId of issue.relationIds) {
      const relation = capture.relations.find((row) => row.relationId === relationId);
      if (!relation || relation.archivedAt !== null) fail(`${target.planKey} has an unresolved native relation`);
      const leftKey = productPlanKeyByUuid.get(relation.issueId) ?? `relation-target:${relation.issueIdentifier}`;
      const rightKey = productPlanKeyByUuid.get(relation.relatedIssueId) ?? `relation-target:${relation.relatedIssueIdentifier}`;
      const type = relation.type === "related" || relation.type === "relatedTo" ? "related"
        : relation.type === "blocks" || relation.type === "blockedBy" ? "blocks"
        : relation.type === "duplicate" || relation.type === "duplicateOf" ? "duplicate"
        : fail(`${relation.relationId} has unsupported product Decision relation type`);
      if (relation.type === "blockedBy") addRelation(type, rightKey, leftKey);
      else addRelation(type, leftKey, rightKey);
    }
  }
  const nativeRelations = [...relationMap.values()].sort((left, right) => compare(left.planKey, right.planKey));

  const referenceKeys = new Set<string>();
  for (const relation of nativeRelations) {
    for (const endpoint of [relation.sourcePlanKey, relation.targetPlanKey]) {
      if (!targetByPlanKey.has(endpoint)) referenceKeys.add(endpoint);
    }
  }
  for (const target of productDecisionTargets) if (target.parentPlanKey !== null) referenceKeys.add(target.parentPlanKey);
  const references: AuthorityReferenceTarget[] = sort([...referenceKeys]).map((planKey) => {
    if (!planKey.startsWith("relation-target:")) fail(`${planKey} is neither managed nor a canonical relation target`);
    const identifier = planKey.slice("relation-target:".length);
    const issue = issueByIdentifier.get(identifier);
    if (!issue) fail(`${planKey} is absent from the exact native capture`);
    return { planKey, title: issue.title, expectedIdentifier: issue.identifier };
  });
  const referenceByKey = new Map(references.map((row) => [row.planKey, row]));

  const documentSpecs = [
    { expected: programScope.planningDocument, role: "binding_spec" as const },
    ...programScope.canonicalProjectDocuments.map((expected) => ({
      expected,
      role: expected.kind === "prd" ? "prd" as const : "engineering_brief" as const,
    })),
    ...programScope.supplementaryDocuments.map((expected) => ({
      expected,
      role: ({
        "R0 Defensible Evaluation PRD": "prd",
        "R0 Pilot Target Set": "research_context",
        "R0 Production Readiness Runbook": "engineering_brief",
      } as const)[expected.title],
    })),
  ];
  if (documentSpecs.length !== 30) fail("program scope does not define exactly 30 adopted documents");
  const documents: AuthorityDocumentTarget[] = documentSpecs.map(({ expected, role }) => {
    const native = one(capture.documents.filter((row) => row.id === expected.id), `document ${expected.id}`);
    const raw = rawDocumentById.get(expected.id);
    if (!raw || raw.content === null || native.archivedAt !== null || native.title !== expected.title ||
      descriptionFingerprint(raw.content) !== native.contentSha256 || native.contentSha256 !== expected.contentFingerprint) {
      fail(`document ${expected.id} differs from its scope or raw capture`);
    }
    const attachments: Array<[AuthorityDocumentTarget["attachmentKind"], string]> = [
      ["initiative", native.initiativeId ?? ""],
      ["project", native.projectId ?? ""],
      ["team", native.teamId ?? ""],
      ["issue", native.issueId ?? ""],
      ["release", native.releaseId ?? ""],
      ["cycle", native.cycleId ?? ""],
    ].filter((row) => row[1].length > 0) as Array<[AuthorityDocumentTarget["attachmentKind"], string]>;
    if (attachments.length !== 1) fail(`document ${expected.id} does not have exactly one native attachment`);
    const [attachmentKind, attachmentId] = attachments[0]!;
    const attachmentPlanKey = attachmentKind === "initiative" ? `initiative:${attachmentId}`
      : attachmentKind === "project" ? projectPlanKey(attachmentId)
      : attachmentKind === "team" ? teamPlanKey(attachmentId)
      : attachmentKind === "issue" ? (productPlanKeyByUuid.get(attachmentId) ?? `relation-target:${issueByUuid.get(attachmentId)?.identifier ?? "missing"}`)
      : attachmentKind === "release" ? releasePlanKey(attachmentId)
      : cyclePlanKey(attachmentId);
    if (attachmentPlanKey.endsWith(":missing")) fail(`document ${expected.id} issue attachment is absent from capture`);
    return {
      origin: "live",
      planKey: `document:${expected.id}`,
      role,
      title: expected.title,
      blockKeys: [],
      content: raw.content,
      contentSha256: native.contentSha256,
      canonicalReadbackSha256: sha256(normalizeAuthorityMarkdown(raw.content)),
      attachmentKind,
      attachmentPlanKey,
      expectedCurrentDocumentId: native.id,
      expectedCurrentContentSha256: native.contentSha256,
      expectedCurrentTopologySha256: capturedDocumentTopologySha(native),
    };
  });

  const selectedLabelIds = new Set(allManaged.flatMap((row) => row.labelPlanKeys.map((key) => {
    const found = [...labelById.values()].find((label) => labelPlanKey(label.id) === key);
    if (!found) fail(`label plan key ${key} has no captured identity`);
    return found.id;
  })));
  const selectedTeams = new Set<string>([
    ...allManaged.map((row) => row.teamPlanKey),
    ...projectScope.projects.flatMap((expected) => {
      const project = projectById.get(expected.id);
      if (!project) fail(`scoped project ${expected.id} is absent from capture`);
      return project.teamIds.map(teamPlanKey);
    }),
  ]);
  const selectedUserIds = new Set<string>([
    ...allManaged.flatMap((row) => row.assigneePlanKey ? [row.assigneePlanKey.slice("user:".length)] : []),
    ...projectScope.projects.flatMap((expected) => {
      const lead = projectById.get(expected.id)?.leadId;
      return lead ? [lead] : [];
    }),
    ...programScope.outcomeInitiatives.flatMap((expected) => {
      const owner = capture.initiatives.find((row) => row.id === expected.id)?.ownerId;
      return owner ? [owner] : [];
    }),
  ]);
  const selectedReleaseIds = new Set(productDecisionTargets.flatMap((row) =>
    row.releasePlanKeys.map((key) => key.slice("release:".length))));
  const selectedPipelineIds = new Set([...selectedReleaseIds].map((id) => {
    const release = capture.releases.find((row) => row.id === id);
    if (!release) fail(`release ${id} is absent from capture`);
    return release.pipelineId;
  }));
  const selectedMilestoneIds = new Set(productDecisionTargets.flatMap((row) =>
    row.milestonePlanKey ? [row.milestonePlanKey.slice("milestone:".length)] : []));
  const selectedCycleIds = new Set(productDecisionTargets.flatMap((row) =>
    row.cyclePlanKey ? [row.cyclePlanKey.slice("cycle:".length)] : []));
  const nativeCatalog: LinearAuthorityPackagePlanV2["nativeCatalog"] = {
    teams: active(capture.teams).filter((row) => selectedTeams.has(teamPlanKey(row.id))).map((row) => ({
      planKey: teamPlanKey(row.id), id: row.id, key: row.key, name: row.name,
    })),
    users: active(capture.users).filter((row) => selectedUserIds.has(row.id)).map((row) => ({
      planKey: userPlanKey(row.id), id: row.id, name: row.name, active: row.active,
    })),
    initiatives: programScope.outcomeInitiatives.map((expected) => {
      const row = one(active(capture.initiatives).filter((candidate) => candidate.id === expected.id && candidate.name === expected.name), `initiative ${expected.id}`);
      return { planKey: `initiative:${row.id}`, id: row.id, name: row.name, contentSha256: row.contentSha256, descriptionSha256: row.descriptionSha256, updatedAt: row.updatedAt, ownerId: row.ownerId, status: row.status, priority: row.priority, health: row.health, healthUpdatedAt: row.healthUpdatedAt, startedAt: row.startedAt, targetDate: row.targetDate, targetDateResolution: row.targetDateResolution, parentInitiativeId: row.parentInitiativeId };
    }),
    projects: projectScope.projects.map((expected) => {
      const row = one(active(capture.projects).filter((candidate) => candidate.id === expected.id && candidate.name === expected.name), `project ${expected.id}`);
      return { planKey: projectPlanKey(row.id), id: row.id, name: row.name, contentSha256: row.contentSha256, updatedAt: row.updatedAt, statusId: row.statusId, status: row.status, statusType: row.statusType, priority: row.priority, leadId: row.leadId, startDate: row.startDate, startDateResolution: row.startDateResolution, targetDate: row.targetDate, targetDateResolution: row.targetDateResolution, teamPlanKeys: row.teamIds.map(teamPlanKey).sort(compare), initiativePlanKeys: row.initiativeIds.map((id) => `initiative:${id}`).sort(compare) };
    }),
    releasePipelines: active(capture.releasePipelines).filter((row) => selectedPipelineIds.has(row.id)).map((row) => ({ planKey: `release-pipeline:${row.id}`, id: row.id, name: row.name, updatedAt: row.updatedAt, type: row.type, isProduction: row.isProduction, teamPlanKeys: row.teamIds.map(teamPlanKey).sort(compare), stages: active(row.stages).map((stage) => ({ id: stage.id, name: stage.name, type: stage.type, position: stage.position, frozen: stage.frozen })) })),
    cycles: active(capture.cycles).filter((row) => selectedCycleIds.has(row.id)).map((row) => ({ planKey: cyclePlanKey(row.id), id: row.id, number: row.number, name: row.name, descriptionSha256: row.descriptionSha256, updatedAt: row.updatedAt, startsAt: row.startsAt, endsAt: row.endsAt, completedAt: row.completedAt, teamPlanKey: teamPlanKey(row.teamId), inheritedFromId: row.inheritedFromId })),
    milestones: active(capture.projectMilestones).filter((row) => selectedMilestoneIds.has(row.id)).map((row) => ({ planKey: milestonePlanKey(row.id), id: row.id, name: row.name, descriptionSha256: row.descriptionSha256, updatedAt: row.updatedAt, targetDate: row.targetDate, status: row.status, projectPlanKey: projectPlanKey(row.projectId) })),
    releases: active(capture.releases).filter((row) => selectedReleaseIds.has(row.id)).map((row) => ({ planKey: releasePlanKey(row.id), id: row.id, name: row.name, descriptionSha256: row.descriptionSha256, version: row.version, commitSha: row.commitSha, startDate: row.startDate, startedAt: row.startedAt, targetDate: row.targetDate, completedAt: row.completedAt, updatedAt: row.updatedAt, pipelinePlanKey: `release-pipeline:${row.pipelineId}`, stageId: row.stageId, stageName: row.stageName, stageType: row.stageType })),
    states: active(capture.workflowStates).filter((row) => allManaged.some((target) => target.statePlanKey === statePlanKey(row.id))).map((row) => ({ planKey: statePlanKey(row.id), id: row.id, name: row.name, type: row.type, teamPlanKey: teamPlanKey(row.teamId) })),
    labels: [...selectedLabelIds].map((id) => {
      const row = labelById.get(id)!;
      return {
        planKey: labelPlanKey(row.id),
        id: row.id,
        semanticRole: semanticLabelIds.get(row.id) ?? "other" as const,
        name: row.name,
        color: row.color,
        description: row.description ?? null,
        teamPlanKey: row.teamId === null ? null : teamPlanKey(row.teamId),
        parentId: row.parentId,
        parentName: row.parentName,
      };
    }),
  };

  const repairs = makeDescriptionRepair(capture, descriptions);
  const largestUtf8 = Math.max(...documents.map((row) => Buffer.byteLength(row.content, "utf8")));
  const largestUtf16 = Math.max(...documents.map((row) => row.content.length));
  const canaryTarget = documents
    .filter((row) => Buffer.byteLength(row.content, "utf8") === largestUtf8 && row.content.length === largestUtf16)
    .sort((left, right) => compare(left.planKey, right.planKey))[0];
  if (!canaryTarget || largestUtf8 < 1 || largestUtf16 < 1 || canaryTarget.expectedCurrentDocumentId === null) {
    fail("no governed document is an exact UTF-8 and UTF-16 readback canary for the full document set");
  }
  const canaryNative = one(capture.documents.filter((row) => row.id === canaryTarget.expectedCurrentDocumentId), "document canary native identity");
  const documentCanary: LinearAuthorityDocumentCanaryMeasurementV2 = {
    canaryDocumentId: canaryNative.id,
    canaryContentSha256: canaryNative.contentSha256,
    canaryTopologySha256: capturedDocumentTopologySha(canaryNative),
    measuredAt: captureReceipt.capturedAt,
    readbackUtf8Bytes: largestUtf8,
    readbackUtf16CodeUnits: largestUtf16,
    maxUtf8Bytes: largestUtf8,
    maxUtf16CodeUnits: largestUtf16,
  };
  const plan: LinearAuthorityPackagePlanV2 = {
    sourceCommit,
    preCutoverTag: input.preCutoverTag,
    preCutoverCommit: PRE_CUTOVER_COMMIT,
    workspace: { id: capture.workspace.id, name: capture.workspace.name, urlKey: capture.workspace.urlKey },
    rawDocumentIds: sort(documents.map((row) => row.expectedCurrentDocumentId!)),
    requirements: requirementTargets,
    decisions: [...dispositionTargets, ...operatingTargets, ...productDecisionTargets],
    risks: riskTargets,
    documents,
    references,
    nativeRelations,
    issueDescriptionRepairs: repairs,
    nativeCatalog,
  };

  const reserved = allCapturedUuids(capture);
  const allocated = new Set<string>();
  const allocate = (planKey: string, kind: AllocationKind): string => {
    const value = (input.allocateUuidV4 ?? (() => randomUUID()))(planKey, kind);
    const normalized = value.toLowerCase();
    if (!UUID_V4.test(value) || reserved.has(normalized) || allocated.has(normalized)) fail(`${planKey} allocation is not a fresh UUIDv4`);
    allocated.add(normalized);
    return value;
  };
  const allocations: LinearTargetAllocation[] = [];
  for (const target of requirementTargets) allocations.push({ planKey: target.planKey, kind: "issue", title: target.title, identifier: target.expectedIdentifier, uuid: target.expectedCurrentIssueUuid ?? allocate(target.planKey, "issue"), source: target.expectedCurrentIssueUuid ? "adopted" : "allocated" });
  for (const target of [...dispositionTargets, ...operatingTargets, ...productDecisionTargets]) allocations.push({ planKey: target.planKey, kind: "decision", title: target.title, identifier: target.expectedIdentifier, uuid: target.expectedCurrentIssueUuid ?? allocate(target.planKey, "decision"), source: target.expectedCurrentIssueUuid ? "adopted" : "allocated" });
  for (const target of riskTargets) allocations.push({ planKey: target.planKey, kind: "risk", title: target.title, identifier: target.expectedIdentifier, uuid: target.expectedCurrentIssueUuid ?? allocate(target.planKey, "risk"), source: target.expectedCurrentIssueUuid ? "adopted" : "allocated" });
  for (const target of documents) allocations.push({ planKey: target.planKey, kind: "document", title: target.title, identifier: null, uuid: target.expectedCurrentDocumentId!, source: "adopted" });
  for (const target of references) {
    const issue = issueByIdentifier.get(target.expectedIdentifier!)!;
    allocations.push({ planKey: target.planKey, kind: "relation_target", title: target.title, identifier: issue.identifier, uuid: issue.issueUuid, source: "adopted" });
  }
  const allocationByKey = new Map(allocations.map((row) => [row.planKey, row]));
  const liveRelationByKey = new Map(active(capture.relations).map((row) => [row.canonicalKey, row]));
  for (const target of nativeRelations) {
    const left = allocationByKey.get(target.sourcePlanKey)?.identifier;
    const right = allocationByKey.get(target.targetPlanKey)?.identifier;
    const liveKey = left && right ? canonicalLinearRelationKey(target.type, left, right) : null;
    const existing = liveKey ? liveRelationByKey.get(liveKey) : undefined;
    allocations.push({ planKey: target.planKey, kind: "relation", title: null, identifier: null, uuid: existing?.relationId ?? allocate(target.planKey, "relation"), source: existing ? "adopted" : "allocated" });
  }

  const authority = buildLinearAuthorityPackageV2({
    plan,
    semanticPlanRaw,
    sourceLineageRaw: lineageRaw,
    requirementBaselineRaw: bytes(input.requirementBaselineRaw),
    featureInventoryRaw,
    dispositionRegisterRaw,
    sourceChecksumsRaw,
    projectScopeRaw: bytes(input.projectScopeRaw),
    programScopeRaw: bytes(input.programScopeRaw),
    linearFingerprintRaw: bytes(input.linearFingerprintRaw),
    liveCaptureRaw: bytes(input.liveCaptureRaw),
    rawDocumentsRaw: bytes(input.rawDocumentsRaw),
    issueDescriptionsRaw: bytes(input.issueDescriptionsRaw),
    captureReceiptRaw: bytes(input.captureReceiptRaw),
    githubExecutionRaw: bytes(input.githubExecutionRaw),
    recoveryMappingRaw: Buffer.from(adoption.recoveryRaw, "utf8"),
    publicationRaw: Buffer.from(adoption.publicationRaw, "utf8"),
    allocations,
    documentCanary,
  });
  const adoptedAllocations = authority.allocation.allocations.filter((row) => row.source === "adopted").length;
  const allocatedAllocations = authority.allocation.allocations.length - adoptedAllocations;
  if (!DIGEST.test(authority.manifestSha256) || authority.manifest.decisions.length !== 148) fail("assembled authority package failed exact count or digest checks");
  return {
    authority,
    desiredAuthorityRoot: authority.desiredAuthorityRoot,
    operatingDecisionPlan,
    riskPlan,
    audit: {
      requirements: 926,
      dispositionDecisions: 61,
      operatingDecisions: 85,
      adoptedProductDecisions: 2,
      decisions: 148,
      risks: 24,
      documents: 30,
      descriptionRepairs: repairs.length,
      references: references.length,
      nativeRelations: nativeRelations.length,
      adoptedAllocations,
      allocatedAllocations,
    },
  };
}
