import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildLinearAuthorityBootstrapPackageV2Fixture } from "./linear-authority-package-v2.fixture.js";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import {
  compileLinearAuthorityUnifiedPackage,
  type LinearAuthorityUnifiedCompilerInput,
} from "./lib/linear-authority-unified-compiler.js";
import { canonicalLinearRelationKey, type LinearFingerprint, type LinearNativeIdentityCapture } from "./lib/linear-live.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./lib/linear-program-scope.js";

const sha256 = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
const json = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\n`, "utf8");
const clone = <T>(value: T): T => structuredClone(value);
const CAPTURED_AT = "2026-07-28T00:00:00.000Z";
const BLAKE_ID = "e7e65e19-33ee-445e-9be4-7e9e734a5463";
const PLA_BACKLOG_ID = "93000000-0000-4000-8000-000000000001";
const RISK_GROUP_ID = "93000000-0000-4000-8000-000000000002";

const riskLabels = [
  ["risk", "Type", "#E5484D", "Canonical delivery risk."],
  ["delivery-risk", "Risk", "#D97706", "Delivery, governance, readiness, or operational execution risk."],
  ["financial-risk", "Risk", "#A16207", "Billing, metering, pricing, or financial integrity risk."],
  ["security-risk", "Risk", "#B91C1C", "Security-sensitive implementation or proof work."],
  ["compliance-risk", "Risk", "#991B1B", "Compliance-sensitive implementation or proof work."],
] as const;

function recalculateCoverage(capture: LinearNativeIdentityCapture): void {
  const coverage = (rows: number) => ({ terminal: true as const, pages: 1, rows, finalCursor: null, attempts: 1 });
  capture.coverage.totals = {
    issues: capture.issues.length,
    labels: capture.labels.length,
    labelAssignments: capture.issues.reduce((sum, issue) => sum + issue.labelIds.length, 0),
    relations: capture.relations.length,
    teams: capture.teams.length,
    workflowStates: capture.workflowStates.length,
    users: capture.users.length,
    initiatives: capture.initiatives.length,
    projects: capture.projects.length,
    releasePipelines: capture.releasePipelines.length,
    releases: capture.releases.length,
    projectMilestones: capture.projectMilestones.length,
    cycles: capture.cycles.length,
    documents: capture.documents.length,
  };
  capture.coverage.topLevel = {
    issues: coverage(capture.issues.length), labels: coverage(capture.labels.length), teams: coverage(capture.teams.length),
    workflowStates: coverage(capture.workflowStates.length), users: coverage(capture.users.length), initiatives: coverage(capture.initiatives.length),
    projects: coverage(capture.projects.length), releasePipelines: coverage(capture.releasePipelines.length), releases: coverage(capture.releases.length),
    projectMilestones: coverage(capture.projectMilestones.length), cycles: coverage(capture.cycles.length), documents: coverage(capture.documents.length),
  };
  capture.coverage.perIssue = capture.issues.map((issue) => ({
    issueUuid: issue.issueUuid,
    identifier: issue.identifier,
    labels: coverage(issue.labelIds.length),
    relations: coverage(capture.relations.filter((row) => row.issueId === issue.issueUuid).length),
    inverseRelations: coverage(capture.relations.filter((row) => row.relatedIssueId === issue.issueUuid).length),
  }));
  capture.coverage.perProject = capture.projects.map((project) => ({
    projectId: project.id,
    teams: coverage(project.teamIds.length),
    initiatives: coverage(project.initiativeIds.length),
  }));
}

function unifiedInput(repositoryRoot = process.cwd()): LinearAuthorityUnifiedCompilerInput {
  const base = buildLinearAuthorityBootstrapPackageV2Fixture(repositoryRoot).builderInput;
  const capture = clone(JSON.parse(Buffer.from(base.liveCaptureRaw).toString("utf8")) as LinearNativeIdentityCapture);
  const fingerprint = clone(JSON.parse(Buffer.from(base.linearFingerprintRaw).toString("utf8")) as LinearFingerprint);
  const descriptions = clone(JSON.parse(Buffer.from(base.issueDescriptionsRaw).toString("utf8")) as {
    schemaVersion: 1;
    issues: Array<{ id: string; title: string; description: string | null; updatedAt: string; labels: string[] }>;
  });
  const rawDocuments = clone(JSON.parse(Buffer.from(base.rawDocumentsRaw).toString("utf8")) as {
    schemaVersion: 1;
    documents: Array<Record<string, unknown> & { id: string; content: string | null }>;
  });
  const programScope = clone(JSON.parse(Buffer.from(base.programScopeRaw).toString("utf8")) as LinearProgramScopeV3);
  const canonicalProgram = JSON.parse(readFileSync(join(repositoryRoot, "delivery/linear-program-scope.json"), "utf8")) as LinearProgramScopeV3;
  programScope.projectDocumentDecisionContract = clone(canonicalProgram.projectDocumentDecisionContract);

  const typeGroup = capture.labels.find((row) => row.name === "Type" && row.isGroup)!;
  const groupIds = new Map<string, string>([["Type", typeGroup.id], ["Risk", RISK_GROUP_ID]]);
  const programGroupNames = new Map(programScope.projectDocumentDecisionContract.labelDefinitions.map((row) => [row.groupName, row.groupId]));
  for (const [name, id] of programGroupNames) groupIds.set(name, id);
  for (const [name, id] of groupIds) {
    if (capture.labels.some((row) => row.id === id)) continue;
    capture.labels.push({ id, name, color: "#777777", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null });
  }
  for (const definition of programScope.projectDocumentDecisionContract.labelDefinitions) {
    const existing = capture.labels.find((row) => row.id === definition.id);
    if (existing) {
      Object.assign(existing, { name: definition.name, parentId: definition.groupId, parentName: definition.groupName, teamId: null, teamKey: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false });
    } else {
      capture.labels.push({ id: definition.id, name: definition.name, color: "#336699", description: null, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false, parentId: definition.groupId, parentName: definition.groupName, teamId: null, teamKey: null });
    }
  }
  riskLabels.forEach(([name, parentName, color, description], index) => {
    const desired = {
      id: `94000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`,
      name, color, description, archivedAt: null, retiredAt: null, inheritedFromId: null, isGroup: false,
      parentId: groupIds.get(parentName)!, parentName, teamId: null, teamKey: null,
    };
    const existing = capture.labels.find((row) => row.id === desired.id);
    if (existing) Object.assign(existing, desired);
    else capture.labels.push(desired);
  });
  programScope.authorityIssueLabelContract = buildLinearAuthorityIssueLabelContract(capture.labels);
  capture.users.push({ id: BLAKE_ID, name: "Blake Rowley", displayName: "Blake Rowley", active: true, app: false, guest: false, archivedAt: null });
  const plaTeam = capture.teams.find((row) => row.key === "PLA")!;
  capture.workflowStates.push({ id: PLA_BACKLOG_ID, name: "Backlog", type: "backlog", color: "#888888", position: 0, archivedAt: null, teamId: plaTeam.id, teamKey: plaTeam.key });
  const projectNameById = new Map(capture.projects.map((row) => [row.id, row.name]));
  const descriptionById = new Map(descriptions.issues.map((row) => [row.id, row]));
  let issueCounter = 1;
  const upsert = (input: {
    identifier: string; title: string; description: string; projectId: string; labelIds?: string[];
    parentIssueUuid?: string | null; assigneeId?: string | null;
  }) => {
    let issue = capture.issues.find((row) => row.identifier === input.identifier);
    if (!issue) {
      issue = {
        issueUuid: `95000000-0000-4000-8000-${(issueCounter++).toString(16).padStart(12, "0")}`,
        identifier: input.identifier, title: input.title, archivedAt: null, descriptionSha256: sha256(input.description),
        teamId: plaTeam.id, stateId: PLA_BACKLOG_ID, projectId: input.projectId, estimate: null, priority: 2,
        dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: input.parentIssueUuid ?? null,
        assigneeId: input.assigneeId ?? null, labelIds: input.labelIds ?? [], relationIds: [],
      };
      capture.issues.push(issue);
    } else {
      Object.assign(issue, {
        title: input.title, archivedAt: null, descriptionSha256: sha256(input.description), teamId: plaTeam.id,
        stateId: PLA_BACKLOG_ID, projectId: input.projectId, estimate: null, priority: 2, dueDate: null, cycleId: null,
        milestoneId: null, releaseIds: [], parentIssueUuid: input.parentIssueUuid ?? null, assigneeId: input.assigneeId ?? null,
        labelIds: input.labelIds ?? [],
      });
    }
    descriptionById.set(input.identifier, { id: input.identifier, title: input.title, description: input.description, updatedAt: CAPTURED_AT, labels: issue.labelIds.map((id) => capture.labels.find((row) => row.id === id)!.name).sort() });
    return issue;
  };
  const productProject = programScope.projectDocumentDecisionContract.trackedDecisions[0]!.decisionProjectId;
  const parent = upsert({ identifier: "PLA-210", title: "Product decision parent", description: "Product decision grouping.", projectId: productProject });
  const productIssues = programScope.projectDocumentDecisionContract.trackedDecisions.map((expected) => {
    const body = `# ${expected.decisionTitle}\n\n${expected.requiredSections.map((section) => `## ${section}\n\nComplete.`).join("\n\n")}\n`;
    expected.descriptionFingerprint = sha256(body);
    const issue = upsert({ identifier: expected.decisionIdentifier, title: expected.decisionTitle, description: body, projectId: expected.decisionProjectId, labelIds: expected.labelIds, parentIssueUuid: parent.issueUuid, assigneeId: BLAKE_ID });
    for (const blocked of expected.blockedIssues) upsert({ identifier: blocked.identifier, title: `Blocked ${blocked.identifier}`, description: "Blocked execution work.", projectId: blocked.projectId });
    return issue;
  });
  for (const [identifier, title] of [["PLA-338", "Domain Governance"], ["PLA-370", "Seller Team role authority mapping"]] as const) {
    upsert({ identifier, title, description: "Existing planning endpoint.", projectId: productProject });
  }
  const sellerProject = capture.projects.find((row) => row.name === "Seller Knowledge, Profile & Capabilities")!.id;
  const selTeam = capture.teams.find((row) => row.key === "SEL")!;
  const selState = capture.workflowStates.find((row) => row.teamId === selTeam.id)!;
  const selBody = '<requirement id="REQ-1">Example A</requirement>\n<requirement id="REQ-2">Example B</requirement>';
  let sel122 = capture.issues.find((row) => row.identifier === "SEL-122");
  if (!sel122) {
    sel122 = upsert({ identifier: "SEL-122", title: "Session Lifecycle Per-Capability Flows", description: selBody, projectId: sellerProject });
  }
  Object.assign(sel122, { title: "Session Lifecycle Per-Capability Flows", descriptionSha256: sha256(selBody), teamId: selTeam.id, stateId: selState.id, projectId: sellerProject, labelIds: [], relationIds: [], assigneeId: null, parentIssueUuid: null });
  descriptionById.set("SEL-122", { id: "SEL-122", title: sel122.title, description: selBody, updatedAt: CAPTURED_AT, labels: [] });
  capture.relations = capture.relations.filter((row) => row.issueIdentifier !== "SEL-122" && row.relatedIssueIdentifier !== "SEL-122");
  for (const issue of capture.issues) issue.relationIds = issue.relationIds.filter((id) => capture.relations.some((row) => row.relationId === id));
  productIssues.forEach((issue, index) => {
    const blocked = capture.issues.find((row) => row.identifier === programScope.projectDocumentDecisionContract.trackedDecisions[index]!.blockedIssues[0]!.identifier)!;
    const relationId = `96000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`;
    capture.relations.push({ relationId, canonicalKey: canonicalLinearRelationKey("blocks", issue.identifier, blocked.identifier), type: "blocks", archivedAt: null, issueId: issue.issueUuid, issueIdentifier: issue.identifier, relatedIssueId: blocked.issueUuid, relatedIssueIdentifier: blocked.identifier });
    issue.relationIds.push(relationId);
    blocked.relationIds.push(relationId);
  });
  descriptions.issues = [...descriptionById.values()].sort((left, right) => left.id.localeCompare(right.id));
  const priorFingerprint = new Map(fingerprint.issues.map((row) => [row.identifier, row]));
  const stateById = new Map(capture.workflowStates.map((row) => [row.id, row]));
  const teamById = new Map(capture.teams.map((row) => [row.id, row]));
  const labelById = new Map(capture.labels.map((row) => [row.id, row]));
  const issueByUuid = new Map(capture.issues.map((row) => [row.issueUuid, row]));
  fingerprint.issues = capture.issues.map((issue) => ({
    ...(priorFingerprint.get(issue.identifier)?.sourceProvenance ? { sourceProvenance: priorFingerprint.get(issue.identifier)!.sourceProvenance } : {}),
    linearId: issue.issueUuid, identifier: issue.identifier, title: issue.title,
    descriptionFingerprint: issue.descriptionSha256, updatedAt: CAPTURED_AT, estimate: issue.estimate, priority: issue.priority,
    dueDate: issue.dueDate, archivedAt: issue.archivedAt, stateId: issue.stateId, state: stateById.get(issue.stateId)!.name,
    stateType: stateById.get(issue.stateId)!.type, labels: issue.labelIds.map((id) => labelById.get(id)!.name).sort(),
    assignee: issue.assigneeId === null ? null : "Blake Rowley", assigneeId: issue.assigneeId,
    team: teamById.get(issue.teamId)!.key, teamId: issue.teamId, cycleId: issue.cycleId, cycleNumber: null, cycle: null,
    projectId: issue.projectId, project: issue.projectId === null ? null : projectNameById.get(issue.projectId)!,
    milestoneId: issue.milestoneId, milestone: null, parentLinearId: issue.parentIssueUuid,
    parent: issue.parentIssueUuid === null ? null : issueByUuid.get(issue.parentIssueUuid)!.identifier,
    releases: [], relations: issue.relationIds.map((id) => capture.relations.find((row) => row.relationId === id)!.canonicalKey).sort(),
  }));
  fingerprint.program!.decisionIssues = programScope.projectDocumentDecisionContract.trackedDecisions.map((expected) => ({
    identifier: expected.decisionIdentifier, title: expected.decisionTitle, url: expected.decisionUrl,
    descriptionFingerprint: expected.descriptionFingerprint, sectionHeadings: expected.requiredSections,
    archivedAt: null, stateType: "backlog", labels: expected.labelIds.map((id) => {
      const definition = programScope.projectDocumentDecisionContract.labelDefinitions.find((row) => row.id === id)!;
      return { id: definition.id, name: definition.name, groupId: definition.groupId, groupName: definition.groupName };
    }), projectId: expected.decisionProjectId,
    relations: expected.blockedIssues.map((row) => canonicalLinearRelationKey("blocks", expected.decisionIdentifier, row.identifier)),
  }));
  recalculateCoverage(capture);
  const linearFingerprintRaw = json(fingerprint);
  const liveCaptureRaw = json(capture);
  const issueDescriptionsRaw = json(descriptions);
  const rawDocumentsRaw = json(rawDocuments);
  const sourceCommit = (JSON.parse(Buffer.from(base.captureReceiptRaw).toString("utf8")) as { source: { commit: string } }).source.commit;
  const captureReceiptRaw = json({
    schemaVersion: 2, captureMode: "live", capturedAt: CAPTURED_AT,
    fingerprintSha256: sha256(linearFingerprintRaw), acceptedFingerprintSha256: sha256(linearFingerprintRaw),
    artifactSha256s: { fingerprint: sha256(linearFingerprintRaw), nativeIdentity: sha256(liveCaptureRaw), documents: sha256(rawDocumentsRaw), issueDescriptions: sha256(issueDescriptionsRaw) },
    source: { repository: "meetblakey/sourcera", commit: sourceCommit, ref: "refs/heads/main", runId: "1", runAttempt: "1" },
  });
  let allocationCounter = 1;
  return {
    repositoryRoot, preCutoverTag: "pre-linear-authority-2026-07-27", linearFingerprintRaw, liveCaptureRaw, rawDocumentsRaw,
    issueDescriptionsRaw, captureReceiptRaw, githubExecutionRaw: base.githubExecutionRaw,
    projectScopeRaw: base.projectScopeRaw, programScopeRaw: json(programScope), requirementBaselineRaw: base.requirementBaselineRaw,
    allocateUuidV4: () => `97000000-0000-4000-8000-${(allocationCounter++).toString(16).padStart(12, "0")}`,
  };
}

test("unified compiler emits the exact authority inventory deterministically", () => {
  const input = unifiedInput();
  const first = compileLinearAuthorityUnifiedPackage(input);
  const second = compileLinearAuthorityUnifiedPackage(unifiedInput());
  assert.deepEqual(first.audit, second.audit);
  assert.equal(first.audit.requirements, 926);
  assert.equal(first.audit.decisions, 148);
  assert.equal(first.audit.risks, 24);
  assert.equal(first.audit.documents, 30);
  assert.equal(first.audit.descriptionRepairs, 1);
  assert.equal(first.authority.manifestRaw, second.authority.manifestRaw);
  assert.equal(first.authority.allocationRaw, second.authority.allocationRaw);
});

test("unified compiler rejects program-label metadata drift", () => {
  const input = unifiedInput();
  const capture = JSON.parse(Buffer.from(input.liveCaptureRaw).toString("utf8")) as LinearNativeIdentityCapture;
  capture.labels.find((row) => row.name === "platform")!.teamId = capture.teams.find((row) => row.key === "PLA")!.id;
  input.liveCaptureRaw = json(capture);
  assert.throws(
    () => compileLinearAuthorityUnifiedPackage(input),
    /authority labels or parent groups differ|Authority label platform differs/i,
  );
});

test("unified compiler rejects a title-only partial Decision adoption", () => {
  const compiler = compileLinearAuthorityUnifiedPackage(unifiedInput());
  const target = compiler.authority.manifest.decisions.find((row) => row.origin === "registry")!;
  const input = collisionInput(target, "body");
  assert.throws(() => compileLinearAuthorityUnifiedPackage(input), /differs from the exact desired body or native payload/i);
});

test("unified compiler rejects same-title Decision label and team drift instead of allocating duplicates", () => {
  const compiler = compileLinearAuthorityUnifiedPackage(unifiedInput());
  const target = compiler.authority.manifest.decisions.find((row) => row.origin === "registry")!;
  for (const drift of ["label", "team"] as const) {
    assert.throws(
      () => compileLinearAuthorityUnifiedPackage(collisionInput(target, drift)),
      /differs from the exact desired body or native payload/i,
    );
  }
});

function collisionInput(
  target: ReturnType<typeof compileLinearAuthorityUnifiedPackage>["authority"]["manifest"]["decisions"][number],
  drift: "body" | "label" | "team",
): LinearAuthorityUnifiedCompilerInput {
  const input = unifiedInput();
  const capture = JSON.parse(Buffer.from(input.liveCaptureRaw).toString("utf8")) as LinearNativeIdentityCapture;
  const fingerprint = JSON.parse(Buffer.from(input.linearFingerprintRaw).toString("utf8")) as LinearFingerprint;
  const descriptions = JSON.parse(Buffer.from(input.issueDescriptionsRaw).toString("utf8")) as {
    schemaVersion: 1;
    issues: Array<{ id: string; title: string; description: string | null; updatedAt: string; labels: string[] }>;
  };
  const excluded = new Set(["PLA-1058", "PLA-1059", "PLA-338", "PLA-370", "SEL-122"]);
  const issue = capture.issues.find((row) => capture.teams.find((team) => team.id === row.teamId)?.key !== "REQ" && !excluded.has(row.identifier))!;
  const requirementTeam = capture.teams.find((row) => row.key === "REQ")!;
  const decisionLabel = capture.labels.find((row) => row.name === "decision")!;
  const description = drift === "body" ? "unrelated" : target.description;
  Object.assign(issue, {
    title: target.title,
    descriptionSha256: sha256(description),
    teamId: drift === "team" ? issue.teamId : requirementTeam.id,
    stateId: target.statePlanKey!.slice("state:".length),
    projectId: target.projectPlanKey!.slice("project:".length),
    estimate: target.estimate,
    priority: target.priority!,
    dueDate: target.dueDate,
    cycleId: null,
    milestoneId: null,
    releaseIds: [],
    parentIssueUuid: null,
    assigneeId: target.assigneePlanKey?.slice("user:".length) ?? null,
    labelIds: drift === "label" ? [] : [decisionLabel.id],
  });
  const state = capture.workflowStates.find((row) => row.id === issue.stateId)!;
  const team = capture.teams.find((row) => row.id === issue.teamId)!;
  const project = capture.projects.find((row) => row.id === issue.projectId)!;
  const fingerprintIssue = fingerprint.issues.find((row) => row.identifier === issue.identifier)!;
  Object.assign(fingerprintIssue, {
    title: issue.title,
    descriptionFingerprint: issue.descriptionSha256,
    estimate: issue.estimate,
    priority: issue.priority,
    dueDate: issue.dueDate,
    stateId: issue.stateId,
    state: state.name,
    stateType: state.type,
    labels: issue.labelIds.map((id) => capture.labels.find((row) => row.id === id)!.name).sort(),
    assignee: issue.assigneeId === null ? null : "Blake Rowley",
    assigneeId: issue.assigneeId,
    team: team.key,
    teamId: team.id,
    projectId: project.id,
    project: project.name,
    parentLinearId: null,
    parent: null,
    releases: [],
  });
  const capturedDescription = descriptions.issues.find((row) => row.id === issue.identifier)!;
  Object.assign(capturedDescription, { title: issue.title, description, labels: fingerprintIssue.labels });
  recalculateCoverage(capture);
  input.liveCaptureRaw = json(capture);
  input.linearFingerprintRaw = json(fingerprint);
  input.issueDescriptionsRaw = json(descriptions);
  const receipt = JSON.parse(Buffer.from(input.captureReceiptRaw).toString("utf8")) as {
    fingerprintSha256: string;
    acceptedFingerprintSha256: string;
    artifactSha256s: { fingerprint: string; nativeIdentity: string; documents: string; issueDescriptions: string };
  };
  receipt.fingerprintSha256 = sha256(input.linearFingerprintRaw);
  receipt.acceptedFingerprintSha256 = receipt.fingerprintSha256;
  receipt.artifactSha256s.fingerprint = receipt.fingerprintSha256;
  receipt.artifactSha256s.nativeIdentity = sha256(input.liveCaptureRaw);
  receipt.artifactSha256s.issueDescriptions = sha256(input.issueDescriptionsRaw);
  input.captureReceiptRaw = json(receipt);
  return input;
}
