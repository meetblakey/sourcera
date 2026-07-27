import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  computeLinearAuthorityPlanRoot,
  LINEAR_AUTHORITY_COMPILER_INPUT_NAMES,
  type LinearAuthorityAllocation,
  type LinearAuthorityManifest,
  validateLinearAuthorityStructure,
} from "./lib/linear-authority-manifest.js";
import type { LinearNativeIdentityCapture } from "./lib/linear-live.js";
import {
  CANONICAL_PROJECT_DOCUMENT_SECTIONS,
  type LinearProjectDocumentFingerprint,
} from "./lib/linear-project-documents.js";
import type { LinearProgramScopeV3 } from "./lib/linear-program-scope.js";

const V4_REQUIREMENT = "00000000-0000-4000-8000-000000000001";
const V4_RELATION_TARGET = "00000000-0000-4000-8000-000000000002";
const V4_DECISION = "00000000-0000-4000-8000-000000000003";
const V4_DOCUMENT = "00000000-0000-4000-8000-000000000004";
const V4_UNRELATED_LIVE = "00000000-0000-4000-8000-000000000005";
const V4_REPLACEMENT = "00000000-0000-4000-8000-000000000006";
const V4_RELATION = "00000000-0000-4000-8000-000000000007";
const V5 = "00000000-0000-5000-8000-000000000008";
const V4_REQUIREMENT_LABEL = "00000000-0000-4000-8000-000000000009";
const V4_DECISION_LABEL = "df2bcb0f-2fca-41cb-a45c-37770a01aac2";
const V4_TEAM = "00000000-0000-4000-8000-000000000011";
const V4_STATE = "00000000-0000-4000-8000-000000000012";
const V4_PROJECT = "2056bb11-b23c-4cc8-b1b2-7a3e0ea46819";
const V4_RISK = "00000000-0000-4000-8000-000000000014";
const V4_RISK_LABEL = "00000000-0000-4000-8000-000000000015";
const V4_TYPE_GROUP = "b11e20d5-df7e-4e8b-a710-294827ff9b40";
const V4_WORKSPACE = "00000000-0000-4000-8000-000000000017";
const V4_LIVE_DECISION = "00000000-0000-4000-8000-000000000018";
const V4_LIVE_DOCUMENT = "00000000-0000-4000-8000-000000000019";
const V4_RELATION_2 = "00000000-0000-4000-8000-000000000020";
const V4_GOVERNED_LIVE = "00000000-0000-4000-8000-000000000021";
const V4_CANARY_DOCUMENT = "3fd8304b-547e-48e2-bc76-5a9ebecaa389";
const V4_CYCLE = "00000000-0000-4000-8000-000000000023";
const V4_MILESTONE = "00000000-0000-4000-8000-000000000024";
const V4_RELEASE = "00000000-0000-4000-8000-000000000025";
const V4_RELEASE_PIPELINE = "00000000-0000-4000-8000-000000000026";
const V4_RELEASE_STAGE = "00000000-0000-4000-8000-000000000027";
const SOURCE_COMMIT = "49883c08c1e0f495bad2d0983ae464680eae3e52";
const SOURCE_REPOSITORY = "meetblakey/sourcera";
const SOURCE_REF = "refs/heads/main";
const SOURCE_RUN_ID = "123";
const SOURCE_RUN_ATTEMPT = "2";

const sha256 = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
const clone = <T>(value: T): T => structuredClone(value);

interface Fixture {
  source: Buffer;
  sourceFiles: Map<string, Buffer>;
  compilerInputs: Map<string, Buffer>;
  capture: LinearNativeIdentityCapture;
  manifest: LinearAuthorityManifest;
  allocation: LinearAuthorityAllocation;
}

function relationPlanKey(type: string, sourcePlanKey: string, targetPlanKey: string): string {
  const endpoints = type === "related"
    ? [sourcePlanKey, targetPlanKey].sort()
    : [sourcePlanKey, targetPlanKey];
  return `relation:${type}:${endpoints[0]}:${endpoints[1]}`;
}

function managedIssuePayloadSha(value: {
  title: string;
  description: string;
  teamPlanKey: string;
  projectPlanKey: string;
  statePlanKey: string;
  priority: number;
  estimate?: number | null;
  dueDate?: string | null;
  cyclePlanKey?: string | null;
  milestonePlanKey?: string | null;
  releasePlanKeys?: string[];
  labelPlanKeys: string[];
  parentPlanKey: string | null;
  assigneePlanKey: string | null;
}): string {
  return sha256(JSON.stringify({
    title: value.title,
    description: value.description,
    teamPlanKey: value.teamPlanKey,
    projectPlanKey: value.projectPlanKey,
    statePlanKey: value.statePlanKey,
    priority: value.priority,
    estimate: value.estimate ?? null,
    dueDate: value.dueDate ?? null,
    cyclePlanKey: value.cyclePlanKey ?? null,
    milestonePlanKey: value.milestonePlanKey ?? null,
    releasePlanKeys: value.releasePlanKeys ?? [],
    labelPlanKeys: value.labelPlanKeys,
    parentPlanKey: value.parentPlanKey,
    assigneePlanKey: value.assigneePlanKey,
  }));
}

function refreshManagedPayload(target: LinearAuthorityManifest["requirements"][number]): void {
  target.payloadSha256 = managedIssuePayloadSha({
    title: target.title,
    description: target.description,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey!,
    priority: target.priority!,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: target.releasePlanKeys,
    labelPlanKeys: target.labelPlanKeys,
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  });
}

function currentIssueNativeSha(value: {
  teamId: string;
  stateId: string;
  projectId: string | null;
  estimate?: number | null;
  priority: number;
  dueDate?: string | null;
  cycleId?: string | null;
  milestoneId?: string | null;
  releaseIds?: string[];
  parentIssueUuid: string | null;
  assigneeId: string | null;
  labelIds: string[];
  relationIds?: string[];
}): string {
  return sha256(JSON.stringify({
    teamId: value.teamId,
    stateId: value.stateId,
    projectId: value.projectId,
    estimate: value.estimate ?? null,
    priority: value.priority,
    dueDate: value.dueDate ?? null,
    cycleId: value.cycleId ?? null,
    milestoneId: value.milestoneId ?? null,
    releaseIds: [...(value.releaseIds ?? [])].sort(),
    parentIssueUuid: value.parentIssueUuid,
    assigneeId: value.assigneeId,
    labelIds: [...value.labelIds].sort(),
    relationIds: [...(value.relationIds ?? [])].sort(),
  }));
}

function currentDocumentTopologySha(value: {
  initiativeId: string | null;
  projectId: string | null;
  teamId: string | null;
  issueId: string | null;
  releaseId?: string | null;
  cycleId?: string | null;
}): string {
  return sha256(JSON.stringify({
    initiativeId: value.initiativeId,
    projectId: value.projectId,
    teamId: value.teamId,
    issueId: value.issueId,
    releaseId: value.releaseId ?? null,
    cycleId: value.cycleId ?? null,
  }));
}

function sourceSetRoot(manifest: LinearAuthorityManifest): string {
  return sha256(manifest.sources
    .slice()
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((source) => [
      source.precedence,
      source.path,
      source.role,
      source.byteLength,
      source.rawSha256,
      source.normalizedSha256,
    ].join("\0"))
    .join("\n"));
}

function compilerInputRoot(manifest: LinearAuthorityManifest): string {
  return sha256(manifest.inputs
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((input) => `${input.name}\0${input.byteLength}\0${input.sha256}`)
    .join("\n"));
}

function liveCaptureRoot(manifest: LinearAuthorityManifest): string {
  const captureNames = new Set([
    "linear-fingerprint",
    "native-identity",
    "raw-documents",
    "issue-descriptions",
    "capture-receipt",
    "github-artifact",
  ]);
  return sha256(manifest.inputs
    .filter((input) => captureNames.has(input.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((input) => `${input.name}\0${input.byteLength}\0${input.sha256}`)
    .join("\n"));
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function evidencePayloads(manifest: LinearAuthorityManifest): Map<string, { keys: string[]; rows: unknown[] }> {
  const targets = [
    ...manifest.requirements.map((target) => ({ family: "requirements", target })),
    ...manifest.decisions.map((target) => ({ family: "decisions", target })),
    ...manifest.risks.map((target) => ({ family: "risks", target })),
    ...manifest.documents.map((target) => ({ family: "documents", target })),
    ...manifest.references.map((target) => ({ family: "references", target })),
  ].sort((left, right) => left.target.planKey.localeCompare(right.target.planKey));
  const dispositions = manifest.blocks.filter((block) => block.disposition !== null).sort((left, right) => left.key.localeCompare(right.key));
  const extractionRows = [
    ...manifest.sources.map((value) => ({ family: "sources", key: value.path, value })),
    ...manifest.blocks.map((value) => ({ family: "blocks", key: value.key, value })),
  ].sort((left, right) => left.key.localeCompare(right.key));
  return new Map([
    ["extraction-seed", { keys: extractionRows.map((row) => row.key), rows: extractionRows }],
    ["semantic-plan", { keys: targets.map((row) => row.target.planKey), rows: targets }],
    ["source-routing", { keys: manifest.blocks.map((row) => row.key).sort(), rows: manifest.blocks.slice().sort((left, right) => left.key.localeCompare(right.key)) }],
    ["risk-routing", { keys: manifest.risks.map((row) => row.planKey).sort(), rows: manifest.risks.slice().sort((left, right) => left.planKey.localeCompare(right.planKey)) }],
    ["source-contract", { keys: manifest.sources.map((row) => row.path).sort((left, right) => left.localeCompare(right)), rows: manifest.sources.slice().sort((left, right) => left.path.localeCompare(right.path)) }],
    ["disposition-contract", { keys: dispositions.map((row) => row.key), rows: dispositions }],
    ["dependency-contract", { keys: manifest.nativeRelations.map((row) => row.planKey).sort(), rows: manifest.nativeRelations.slice().sort((left, right) => left.planKey.localeCompare(right.planKey)) }],
    ["decision-adjudication", { keys: manifest.decisions.map((row) => row.planKey).sort(), rows: manifest.decisions.slice().sort((left, right) => left.planKey.localeCompare(right.planKey)) }],
  ]);
}

function refreshCoreRoots(input: Pick<Fixture, "manifest" | "compilerInputs" | "capture">): void {
  const captureRaw = JSON.stringify(input.capture);
  for (const row of input.manifest.inputs) {
    const bytes = row.name === "native-identity" ? Buffer.from(captureRaw) : input.compilerInputs.get(row.name)!;
    row.byteLength = bytes.length;
    row.sha256 = sha256(bytes);
  }
  input.manifest.liveCaptureRoot = liveCaptureRoot(input.manifest);
  input.manifest.planRoot = computeLinearAuthorityPlanRoot(input.manifest);
}

function refreshAuthorityReceipts(input: Fixture): void {
  refreshCoreRoots(input);
  const captureRaw = JSON.stringify(input.capture);
  input.allocation.planRoot = input.manifest.planRoot;
  input.allocation.sourceSetRoot = input.manifest.sourceSetRoot;
  input.allocation.liveCaptureRoot = input.manifest.liveCaptureRoot;
  const allocationRaw = JSON.stringify(input.allocation);
  const allocationSha256 = sha256(allocationRaw);
  const allocationRowsRoot = sha256(canonicalJson(input.allocation.allocations.slice().sort((left, right) => left.planKey.localeCompare(right.planKey))));
  for (const [name, payload] of evidencePayloads(input.manifest)) {
    input.compilerInputs.set(name, Buffer.from(JSON.stringify({
      schemaVersion: 1,
      kind: "compiler-evidence",
      evidenceKind: name,
      workspaceId: input.manifest.workspace.id,
      sourceCommit: input.manifest.sourceCommit,
      sourceSetRoot: input.manifest.sourceSetRoot,
      planRoot: input.manifest.planRoot,
      complete: true,
      payloadKeys: payload.keys,
      payloadRoot: sha256(canonicalJson(payload.rows)),
    })));
  }
  const semantic = evidencePayloads(input.manifest).get("semantic-plan")!;
  const relationRows = input.manifest.nativeRelations.slice().sort((left, right) => left.planKey.localeCompare(right.planKey)).map((target) => ({ family: "relations", target }));
  input.compilerInputs.set("allocation-lock", Buffer.from(JSON.stringify({
    schemaVersion: 1,
    kind: "allocation-lock",
    workspaceId: input.manifest.workspace.id,
    sourceCommit: input.manifest.sourceCommit,
    sourceSetRoot: input.manifest.sourceSetRoot,
    liveCaptureRoot: input.manifest.liveCaptureRoot,
    planRoot: input.manifest.planRoot,
    allocationSha256,
    allocationRowsRoot,
    complete: true,
    targetPlanKeys: [...semantic.keys, ...input.manifest.nativeRelations.map((row) => row.planKey)].sort(),
    targetPayloadRoot: sha256(canonicalJson([...semantic.rows, ...relationRows])),
  })));
  input.compilerInputs.set("uuid-mapping", Buffer.from(JSON.stringify({
    schemaVersion: 1,
    kind: "uuid-mapping",
    workspaceId: input.manifest.workspace.id,
    sourceCommit: input.manifest.sourceCommit,
    sourceSetRoot: input.manifest.sourceSetRoot,
    liveCaptureRoot: input.manifest.liveCaptureRoot,
    planRoot: input.manifest.planRoot,
    allocationSha256,
    allocationRowsRoot,
    complete: true,
    targetPlanKeys: input.allocation.allocations.map((row) => row.planKey).sort(),
  })));
  const rawDocumentArtifact = JSON.parse(input.compilerInputs.get("raw-documents")!.toString("utf8")) as { documents: Array<{ id: string; content: string }> };
  const canaryDocument = rawDocumentArtifact.documents.find((document) => document.id === V4_CANARY_DOCUMENT) ?? rawDocumentArtifact.documents[0];
  const canaryContent = canaryDocument?.content ?? "";
  const canaryNative = input.capture.documents.find((document) => document.id === canaryDocument?.id);
  input.compilerInputs.set("document-canary-receipt", Buffer.from(JSON.stringify({
    schemaVersion: 1,
    kind: "document-canary-measurement",
    workspaceId: input.manifest.workspace.id,
    sourceCommit: input.manifest.sourceCommit,
    liveCaptureRoot: input.manifest.liveCaptureRoot,
    planRoot: input.manifest.planRoot,
    canaryDocumentId: canaryDocument?.id ?? V4_CANARY_DOCUMENT,
    canaryContentSha256: sha256(canaryContent),
    canaryTopologySha256: currentDocumentTopologySha(canaryNative ?? { initiativeId: null, projectId: null, teamId: V4_TEAM, issueId: null, releaseId: null, cycleId: null }),
    measuredAt: "2026-07-27T04:40:00.000Z",
    readbackUtf8Bytes: Buffer.byteLength(canaryContent, "utf8"),
    readbackUtf16CodeUnits: canaryContent.length,
    maxUtf8Bytes: Buffer.byteLength(canaryContent, "utf8"),
    maxUtf16CodeUnits: canaryContent.length,
  })));
  for (const row of input.manifest.inputs) {
    const bytes = row.name === "native-identity" ? Buffer.from(captureRaw) : input.compilerInputs.get(row.name)!;
    row.byteLength = bytes.length;
    row.sha256 = sha256(bytes);
  }
  input.manifest.compilerInputRoot = compilerInputRoot(input.manifest);
}

const connectionCoverage = (rows: number) => ({
  terminal: true as const,
  pages: 1,
  rows,
  finalCursor: null,
  attempts: 1,
});

const nestedCoverage = (rows: number) => ({
  terminal: true as const,
  pages: 1,
  rows,
  finalCursor: null,
  attempts: 1,
});

function sectionedDocument(title: string, sections: readonly string[], sectionBody: (section: string) => string = () => "Complete."): string {
  return `# ${title}\n\n${sections.map((section) => `## ${section}\n\n${sectionBody(section)}`).join("\n\n")}\n`;
}

function canonicalProgramFixture(sourceFiles: ReadonlyMap<string, Buffer>): { scope: LinearProgramScopeV3; contents: Map<string, string> } {
  const scope = clone(JSON.parse(readFileSync("delivery/linear-program-scope.json", "utf8")) as LinearProgramScopeV3);
  const masterSha = sha256(sourceFiles.get("Sourcera_Master_Spec.md")!);
  const uxSha = sha256(sourceFiles.get("UX_Design_of_Sourcera.md")!);
  const contents = new Map<string, string>();
  scope.planningDocument.id = V4_CANARY_DOCUMENT;
  const planningContent = sectionedDocument(scope.planningDocument.title, scope.planningDocument.requiredSections, (section) => section === "Canonical source fingerprints"
    ? `- Sourcera_Master_Spec.md: sha256:${masterSha}\n- UX_Design_of_Sourcera.md: sha256:${uxSha}`
    : section === scope.planningDocument.requiredSections[0] ? `Complete.\n\n${"x".repeat(20_000)}` : "Complete.");
  scope.planningDocument.contentFingerprint = sha256(planningContent);
  contents.set(scope.planningDocument.id, planningContent);
  for (const row of [...scope.canonicalProjectDocuments, ...scope.supplementaryDocuments]) {
    const content = sectionedDocument(row.title, row.requiredSections, (section) => section === "Master Spec binding"
      ? `Sourcera_Master_Spec.md sha256:${masterSha}; ${row.masterSpecSections.join(", ")}`
      : "Complete.");
    row.contentFingerprint = sha256(content);
    contents.set(row.id, content);
  }
  for (const project of scope.projectDescriptionFingerprints) project.milestones = [];
  scope.projectDocumentDecisionContract.decisionLabelId = V4_DECISION_LABEL;
  scope.projectDocumentDecisionContract.labelDefinitions[0] = {
    id: V4_DECISION_LABEL,
    name: "decision",
    groupId: V4_TYPE_GROUP,
    groupName: "Type",
  };
  scope.projectDocumentDecisionContract.trackedDecisions = [];
  scope.projectDocumentDecisionContract.references = [];
  return { scope, contents };
}

function fingerprintFromCapture(
  capture: LinearNativeIdentityCapture,
  programScope: LinearProgramScopeV3,
  rawContents: ReadonlyMap<string, string>,
  masterSpecSha256: string,
  uxDesignSha256: string,
): Buffer {
  const labelNameById = new Map(capture.labels.map((label) => [label.id, label.name]));
  const relationKeyById = new Map(capture.relations.map((relation) => [relation.relationId, relation.canonicalKey]));
  const projectNameById = new Map(capture.projects.map((project) => [project.id, project.name]));
  const documentById = new Map(capture.documents.map((document) => [document.id, document]));
  const scopedProjectDocuments = [...programScope.canonicalProjectDocuments, ...programScope.supplementaryDocuments];
  const canonicalById = new Map(scopedProjectDocuments.map((document) => [document.id, document]));
  const projectDocuments: LinearProjectDocumentFingerprint[] = scopedProjectDocuments.map((expected) => {
    const document = documentById.get(expected.id)!;
    return {
      id: document.id,
      title: document.title,
      updatedAt: document.updatedAt,
      archivedAt: document.archivedAt,
      initiativeId: document.initiativeId,
      projectId: document.projectId,
      projectName: document.projectId === null ? null : projectNameById.get(document.projectId)!,
      teamId: document.teamId,
      issueId: document.issueId,
      contentFingerprint: document.contentSha256,
      sectionHeadings: markdownHeadings(rawContents.get(document.id)!),
      masterSpecSha256,
      masterSpecSections: expected.masterSpecSections,
      unresolvedDecisionReferences: [],
      contentPolicyFindings: [],
    };
  });
  return Buffer.from(JSON.stringify({
    issues: capture.issues.map((issue) => ({
      linearId: issue.issueUuid,
      identifier: issue.identifier,
      title: issue.title,
      descriptionFingerprint: issue.descriptionSha256,
      updatedAt: "2026-07-27T04:00:00.000Z",
      estimate: issue.estimate,
      priority: issue.priority,
      dueDate: issue.dueDate,
      archivedAt: issue.archivedAt,
      stateId: issue.stateId,
      state: "Approved",
      stateType: "completed",
      labels: issue.labelIds.map((id) => labelNameById.get(id)!).sort(),
      assignee: null,
      assigneeId: issue.assigneeId,
      team: "PLA",
      teamId: issue.teamId,
      cycleId: issue.cycleId,
      cycleNumber: issue.cycleId === null ? null : 1,
      cycle: issue.cycleId === null ? null : "Cycle 1",
      projectId: issue.projectId,
      project: issue.projectId === null ? null : projectNameById.get(issue.projectId)!,
      milestoneId: issue.milestoneId,
      milestone: issue.milestoneId === null ? null : "Milestone 1",
      parentLinearId: issue.parentIssueUuid,
      parent: null,
      releases: issue.releaseIds,
      relations: issue.relationIds.map((id) => relationKeyById.get(id)!).sort(),
    })),
    releasePipelines: [],
    releases: [],
    projects: programScope.projectDescriptionFingerprints.map((expected) => ({
      id: expected.projectId,
      name: projectNameById.get(expected.projectId)!,
      descriptionFingerprint: expected.descriptionFingerprint,
      updatedAt: capture.projects.find((project) => project.id === expected.projectId)!.updatedAt,
      archivedAt: capture.projects.find((project) => project.id === expected.projectId)!.archivedAt,
      statusId: capture.projects.find((project) => project.id === expected.projectId)!.statusId,
      status: capture.projects.find((project) => project.id === expected.projectId)!.status,
      statusType: capture.projects.find((project) => project.id === expected.projectId)!.statusType,
      priority: capture.projects.find((project) => project.id === expected.projectId)!.priority,
      lead: null,
      leadId: capture.projects.find((project) => project.id === expected.projectId)!.leadId,
      startDate: capture.projects.find((project) => project.id === expected.projectId)!.startDate,
      startDateResolution: capture.projects.find((project) => project.id === expected.projectId)!.startDateResolution,
      targetDate: capture.projects.find((project) => project.id === expected.projectId)!.targetDate,
      targetDateResolution: capture.projects.find((project) => project.id === expected.projectId)!.targetDateResolution,
    })),
    projectMilestones: [],
    cycles: [],
    program: {
      initiatives: capture.initiatives.map((initiative) => ({
        id: initiative.id,
        name: initiative.name,
        updatedAt: initiative.updatedAt,
        archivedAt: initiative.archivedAt,
        owner: null,
        ownerId: initiative.ownerId,
        status: initiative.status,
        priority: initiative.priority,
        health: initiative.health,
        healthUpdatedAt: initiative.healthUpdatedAt,
        targetDate: initiative.targetDate,
        targetDateResolution: initiative.targetDateResolution,
        parentInitiativeId: initiative.parentInitiativeId,
        parentInitiative: null,
      })),
      documents: [programScope.planningDocument].map((expected) => {
        const document = documentById.get(expected.id)!;
        return {
          id: document.id,
          title: document.title,
          updatedAt: document.updatedAt,
          archivedAt: document.archivedAt,
          initiativeId: document.initiativeId,
          projectId: document.projectId,
          teamId: document.teamId,
          issueId: document.issueId,
          contentFingerprint: document.contentSha256,
          sectionHeadings: markdownHeadings(rawContents.get(document.id)!),
          sourceFingerprints: { masterSpecSha256, uxDesignSha256 },
        };
      }),
      projectInitiatives: programScope.projectInitiatives,
      projectDocuments,
      projectDocumentConflicts: [],
      decisionIssues: [],
    },
  }));
}

function markdownHeadings(content: string): string[] {
  return content.split(/\r?\n/).flatMap((line) => /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line)?.[1].trim() ?? []);
}

function descriptionBody(identifier: string): string {
  const bodies: Record<string, string> = {
    "REQ-1": "Binding requirement body",
    "PLA-1": "Execution body",
    "PLA-999": "Unrelated body",
    "PLA-1000": "New live body",
    "DEC-2": "Existing live decision body",
    "DEC-77": "Unmapped",
  };
  const body = bodies[identifier];
  return body ?? "Unrelated body";
}

function issueDescriptionsFromCapture(capture: LinearNativeIdentityCapture): Buffer {
  const labelNameById = new Map(capture.labels.map((label) => [label.id, label.name]));
  return Buffer.from(JSON.stringify({
    schemaVersion: 1,
    issues: capture.issues.map((issue) => ({
      id: issue.identifier,
      title: issue.title,
      description: descriptionBody(issue.identifier),
      updatedAt: "2026-07-27T04:00:00.000Z",
      labels: issue.labelIds.map((id) => labelNameById.get(id)!).sort(),
    })).sort((left, right) => left.id.localeCompare(right.id)),
  }));
}

function fixture(): Fixture {
  const rawSections = [
    Buffer.from("# Alpha\r\n\r\nFirst  \r\n"),
    Buffer.from("## Context\r\n\r\nOld context\r\n"),
    Buffer.from("## Product document\r\n\r\nContract\r\n"),
    Buffer.from("## Risk\r\n\r\nTrigger and response\r\n"),
  ];
  const normalizedSections = [
    "# Alpha\n\nFirst\n",
    "## Context\n\nOld context\n",
    "## Product document\n\nContract\n",
    "## Risk\n\nTrigger and response\n",
  ];
  const source = Buffer.concat(rawSections);
  const offsets = [0];
  for (const section of rawSections) offsets.push(offsets.at(-1)! + section.length);
  const sourceFiles = new Map<string, Buffer>([
    ["Sourcera_Master_Spec.md", source],
    ["UX_Design_of_Sourcera.md", Buffer.from("# UX authority\n\nUX source.\n")],
    ["Sourcera_Buyer_Pricing_Strategy.md", Buffer.from("# Buyer pricing\n\nBuyer source.\n")],
    ["Sourcera_Seller_Pricing_Strategy.md", Buffer.from("# Seller pricing\n\nSeller source.\n")],
    ["Audit_Prompts.md", Buffer.from("# Audit program\n\nAudit source.\n")],
    ["Research_MPP.md", Buffer.from("# Research MPP\n\nResearch source.\n")],
    ["Research_MPP_Implementation_Gaps.md", Buffer.from("# Research gaps\n\nGap source.\n")],
  ]);
  const normalizedSourceContent = new Map([...sourceFiles].map(([path, bytes]) => [
    path,
    path === "Sourcera_Master_Spec.md" ? normalizedSections.join("") : bytes.toString("utf8"),
  ]));
  const projectScope = clone(JSON.parse(readFileSync("delivery/linear-project-scope.json", "utf8")) as { schemaVersion: 1; projects: Array<{ id: string; name: string }> });
  const { scope: programScope, contents: rawDocumentContents } = canonicalProgramFixture(sourceFiles);
  programScope.planningDocument.teamId = V4_TEAM;
  const projectIndex = new Map(projectScope.projects.map((project, index) => [project.id, index]));
  const initiativeIndex = new Map(programScope.outcomeInitiatives.map((initiative, index) => [initiative.id, index]));
  const projectPlanKey = (projectId: string): string => projectId === V4_PROJECT ? "project:product-alpha" : `project:scope-${projectIndex.get(projectId)! + 1}`;
  const initiativePlanKey = (initiativeId: string): string => `initiative:outcome-${initiativeIndex.get(initiativeId)! + 1}`;
  const governedDocumentRows = [
    { id: programScope.planningDocument.id, title: programScope.planningDocument.title, projectId: null, teamId: V4_TEAM },
    ...programScope.canonicalProjectDocuments.map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, teamId: null })),
    ...programScope.supplementaryDocuments.map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, teamId: null })),
  ];
  const capturedDocuments: LinearNativeIdentityCapture["documents"] = governedDocumentRows.map((document) => ({
    id: document.id,
    title: document.title,
    contentSha256: sha256(rawDocumentContents.get(document.id)!),
    updatedAt: "2026-07-27T03:50:00.000Z",
    archivedAt: null,
    initiativeId: null,
    projectId: document.projectId,
    teamId: document.teamId,
    issueId: null,
    releaseId: null,
    cycleId: null,
  }));
  const capture: LinearNativeIdentityCapture = {
    schemaVersion: 1,
    workspace: { id: V4_WORKSPACE, name: "Sourcera", urlKey: "sourcera-production", archivedAt: null },
    rawDocumentIds: governedDocumentRows.map((document) => document.id),
    issues: [
      { issueUuid: V4_REQUIREMENT, identifier: "REQ-1", title: "Alpha requirement", archivedAt: null, descriptionSha256: sha256("Binding requirement body"), teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, estimate: null, priority: 2, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: null, assigneeId: null, labelIds: [V4_REQUIREMENT_LABEL], relationIds: [] },
      { issueUuid: V4_RELATION_TARGET, identifier: "PLA-1", title: "Execution Alpha", archivedAt: null, descriptionSha256: sha256("Execution body"), teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, estimate: null, priority: 2, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: null, assigneeId: null, labelIds: [], relationIds: [] },
      { issueUuid: V4_UNRELATED_LIVE, identifier: "PLA-999", title: "Unrelated", archivedAt: null, descriptionSha256: sha256("Unrelated body"), teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, estimate: null, priority: 2, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: null, assigneeId: null, labelIds: [], relationIds: [] },
    ],
    labels: [
      { id: V4_REQUIREMENT_LABEL, name: "Requirement", color: "#123456", archivedAt: null, inheritedFromId: null, isGroup: false, parentId: null, parentName: null, teamId: V4_TEAM, teamKey: "PLA" },
      { id: V4_DECISION_LABEL, name: "decision", color: "#654321", archivedAt: null, inheritedFromId: null, isGroup: false, parentId: V4_TYPE_GROUP, parentName: "Type", teamId: null, teamKey: null },
      { id: V4_TYPE_GROUP, name: "Type", color: "#888888", archivedAt: null, inheritedFromId: null, isGroup: true, parentId: null, parentName: null, teamId: null, teamKey: null },
      { id: V4_RISK_LABEL, name: "risk", color: "#ff0000", archivedAt: null, inheritedFromId: null, isGroup: false, parentId: V4_TYPE_GROUP, parentName: "Type", teamId: null, teamKey: null },
    ],
    relations: [],
    teams: [{ id: V4_TEAM, key: "PLA", name: "Platform", archivedAt: null }],
    workflowStates: [{ id: V4_STATE, name: "Approved", type: "completed", color: "#00ff00", position: 1, archivedAt: null, teamId: V4_TEAM, teamKey: "PLA" }],
    users: [],
    initiatives: programScope.outcomeInitiatives.map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
      contentSha256: sha256(`${initiative.name}:content`),
      descriptionSha256: sha256(`${initiative.name}:description`),
      updatedAt: "2026-07-27T04:00:00.000Z",
      archivedAt: null,
      ownerId: null,
      status: "Planned",
      priority: 2,
      health: null,
      healthUpdatedAt: null,
      startedAt: null,
      targetDate: null,
      targetDateResolution: null,
      parentInitiativeId: null,
    })),
    projects: projectScope.projects.map((project) => ({
      id: project.id,
      name: project.name,
      contentSha256: programScope.projectDescriptionFingerprints.find((row) => row.projectId === project.id)!.descriptionFingerprint,
      updatedAt: "2026-07-27T04:00:00.000Z",
      archivedAt: null,
      statusId: V4_STATE,
      status: "Approved",
      statusType: "completed",
      priority: 2,
      leadId: null,
      startDate: null,
      startDateResolution: null,
      targetDate: null,
      targetDateResolution: null,
      teamIds: [V4_TEAM],
      initiativeIds: programScope.projectInitiatives.find((row) => row.projectId === project.id)!.initiativeIds,
    })),
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: capturedDocuments,
    coverage: {
      complete: true,
      totals: { issues: 3, labels: 4, labelAssignments: 1, relations: 0, teams: 1, workflowStates: 1, users: 0, initiatives: 6, projects: 26, releasePipelines: 0, releases: 0, projectMilestones: 0, cycles: 0, documents: 30 },
      topLevel: {
        issues: connectionCoverage(3),
        labels: connectionCoverage(4),
        teams: connectionCoverage(1),
        workflowStates: connectionCoverage(1),
        users: connectionCoverage(0),
        initiatives: connectionCoverage(6),
        projects: connectionCoverage(26),
        releasePipelines: connectionCoverage(0),
        releases: connectionCoverage(0),
        projectMilestones: connectionCoverage(0),
        cycles: connectionCoverage(0),
        documents: connectionCoverage(30),
      },
      perIssue: [
        { issueUuid: V4_REQUIREMENT, identifier: "REQ-1", labels: nestedCoverage(1), relations: nestedCoverage(0), inverseRelations: nestedCoverage(0) },
        { issueUuid: V4_RELATION_TARGET, identifier: "PLA-1", labels: nestedCoverage(0), relations: nestedCoverage(0), inverseRelations: nestedCoverage(0) },
        { issueUuid: V4_UNRELATED_LIVE, identifier: "PLA-999", labels: nestedCoverage(0), relations: nestedCoverage(0), inverseRelations: nestedCoverage(0) },
      ],
      perProject: projectScope.projects.map((project) => ({ projectId: project.id, teams: nestedCoverage(1), initiatives: nestedCoverage(1) })),
    },
  };
  const captureRaw = JSON.stringify(capture);
  const compilerInputs = new Map<string, Buffer>(
    LINEAR_AUTHORITY_COMPILER_INPUT_NAMES
      .filter((name) => name !== "native-identity")
      .map((name) => [name, Buffer.from(JSON.stringify({ schemaVersion: 1, kind: "compiler-input", name }))]),
  );
  const rawDocuments = Buffer.from(JSON.stringify({
    schemaVersion: 1,
    documents: capture.documents.map((document) => ({ ...document, content: rawDocumentContents.get(document.id)! })),
  }));
  const fingerprint = fingerprintFromCapture(
    capture,
    programScope,
    rawDocumentContents,
    sha256(sourceFiles.get("Sourcera_Master_Spec.md")!),
    sha256(sourceFiles.get("UX_Design_of_Sourcera.md")!),
  );
  const issueDescriptions = issueDescriptionsFromCapture(capture);
  compilerInputs.set("linear-fingerprint", fingerprint);
  compilerInputs.set("raw-documents", rawDocuments);
  compilerInputs.set("issue-descriptions", issueDescriptions);
  compilerInputs.set("project-scope", Buffer.from(JSON.stringify(projectScope)));
  compilerInputs.set("program-scope", Buffer.from(JSON.stringify(programScope)));
  const captureReceipt = Buffer.from(JSON.stringify({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: "2026-07-27T05:00:00.000Z",
    fingerprintSha256: sha256(fingerprint),
    acceptedFingerprintSha256: sha256(fingerprint),
    artifactSha256s: {
      fingerprint: sha256(fingerprint),
      nativeIdentity: sha256(captureRaw),
      documents: sha256(rawDocuments),
      issueDescriptions: sha256(issueDescriptions),
    },
    source: {
      repository: SOURCE_REPOSITORY,
      commit: SOURCE_COMMIT,
      ref: SOURCE_REF,
      runId: SOURCE_RUN_ID,
      runAttempt: SOURCE_RUN_ATTEMPT,
    },
  }));
  compilerInputs.set("capture-receipt", captureReceipt);
  compilerInputs.set("github-artifact", Buffer.from(JSON.stringify({
    schemaVersion: 1,
    artifact: {
      id: "987",
      name: `linear-native-authority-capture-${SOURCE_COMMIT}-${SOURCE_RUN_ID}-${SOURCE_RUN_ATTEMPT}`,
      digest: `sha256:${sha256("github-artifact-archive")}`,
      repository: SOURCE_REPOSITORY,
      commit: SOURCE_COMMIT,
      ref: SOURCE_REF,
      runId: SOURCE_RUN_ID,
      runAttempt: SOURCE_RUN_ATTEMPT,
    },
  })));
  const relationKey = relationPlanKey("related", "issue:req-alpha", "relation-target:execution-alpha");
  const governedDocumentTargets: LinearAuthorityManifest["documents"] = [
    {
      expected: programScope.planningDocument,
      role: "binding_spec" as const,
      planKey: "document:product-alpha",
      attachmentKind: "team" as const,
      attachmentPlanKey: "team:platform",
    },
    ...programScope.canonicalProjectDocuments.map((expected, index) => ({
      expected,
      role: expected.kind === "prd" ? "prd" as const : "engineering_brief" as const,
      planKey: `document:canonical-project-${index + 1}`,
      attachmentKind: "project" as const,
      attachmentPlanKey: projectPlanKey(expected.projectId),
    })),
    ...programScope.supplementaryDocuments.map((expected, index) => ({
      expected,
      role: (["prd", "research_context", "engineering_brief"] as const)[index],
      planKey: `document:supplementary-${index + 1}`,
      attachmentKind: "project" as const,
      attachmentPlanKey: projectPlanKey(expected.projectId),
    })),
  ].map(({ expected, role, planKey, attachmentKind, attachmentPlanKey }) => {
    const native = capture.documents.find((document) => document.id === expected.id)!;
    const content = rawDocumentContents.get(expected.id)!;
    return {
      origin: "live" as const,
      planKey,
      role,
      title: expected.title,
      blockKeys: [],
      content,
      contentSha256: sha256(content),
      canonicalReadbackSha256: sha256(content),
      attachmentKind,
      attachmentPlanKey,
      expectedCurrentDocumentId: native.id,
      expectedCurrentContentSha256: native.contentSha256,
      expectedCurrentTopologySha256: currentDocumentTopologySha(native),
    };
  });
  const manifest: LinearAuthorityManifest = {
    schemaVersion: 1,
    sourceCommit: SOURCE_COMMIT,
    preCutoverTag: "pre-linear-authority-2026-07-27",
    workspace: { id: V4_WORKSPACE, name: "Sourcera", urlKey: "sourcera-production" },
    rawDocumentIds: governedDocumentRows.map((document) => document.id),
    planRoot: sha256("pending-plan"),
    sourceSetRoot: "",
    liveCaptureRoot: "",
    compilerInputRoot: "",
    inputs: LINEAR_AUTHORITY_COMPILER_INPUT_NAMES.map((name) => ({
      name,
      byteLength: name === "native-identity"
        ? Buffer.byteLength(captureRaw)
        : compilerInputs.get(name)!.length,
      sha256: name === "native-identity"
        ? sha256(captureRaw)
        : sha256(compilerInputs.get(name)!),
    })),
    sources: [...sourceFiles].map(([path, bytes], index) => ({
      path,
      role: ["product_authority", "ux_fallback", "narrative_context", "narrative_context", "audit_program", "research_context", "research_context"][index],
      precedence: index + 1,
      byteLength: bytes.length,
      rawSha256: sha256(bytes),
      normalizedSha256: sha256(normalizedSourceContent.get(path)!),
    })),
    blocks: [
      {
        key: "block:alpha",
        sourcePath: "Sourcera_Master_Spec.md",
        byteStart: offsets[0],
        byteEnd: offsets[1],
        heading: "# Alpha",
        rawSha256: sha256(rawSections[0]),
        normalizedSha256: sha256(normalizedSections[0]),
        type: "requirement",
        classification: "active",
        targetPlanKey: "issue:req-alpha",
        disposition: null,
      },
      {
        key: "block:context",
        sourcePath: "Sourcera_Master_Spec.md",
        byteStart: offsets[1],
        byteEnd: offsets[2],
        heading: "## Context",
        rawSha256: sha256(rawSections[1]),
        normalizedSha256: sha256(normalizedSections[1]),
        type: "context",
        classification: "narrative_context",
        targetPlanKey: null,
        disposition: { kind: "narrative_context", decisionPlanKey: "decision:old-context" },
      },
      {
        key: "block:product-document",
        sourcePath: "Sourcera_Master_Spec.md",
        byteStart: offsets[2],
        byteEnd: offsets[3],
        heading: "## Product document",
        rawSha256: sha256(rawSections[2]),
        normalizedSha256: sha256(normalizedSections[2]),
        type: "document",
        classification: "narrative_context",
        targetPlanKey: null,
        disposition: { kind: "narrative_context", decisionPlanKey: "decision:old-context" },
      },
      {
        key: "block:risk",
        sourcePath: "Sourcera_Master_Spec.md",
        byteStart: offsets[3],
        byteEnd: offsets[4],
        heading: "## Risk",
        rawSha256: sha256(rawSections[3]),
        normalizedSha256: sha256(normalizedSections[3]),
        type: "risk",
        classification: "active",
        targetPlanKey: "risk:risk-alpha",
        disposition: null,
      },
      ...[...sourceFiles].slice(1).map(([path, bytes], index) => ({
        key: `block:canonical-source-${index + 2}`,
        sourcePath: path,
        byteStart: 0,
        byteEnd: bytes.length,
        heading: bytes.toString("utf8").split("\n")[0],
        rawSha256: sha256(bytes),
        normalizedSha256: sha256(normalizedSourceContent.get(path)!),
        type: "context",
        classification: "narrative_context" as const,
        targetPlanKey: null,
        disposition: { kind: "narrative_context" as const, decisionPlanKey: "decision:old-context" },
      })),
    ],
    requirements: [{
      kind: "requirement",
      origin: "source",
      planKey: "issue:req-alpha",
      title: "Alpha requirement",
      expectedCurrentIssueUuid: V4_REQUIREMENT,
      expectedCurrentDescriptionSha256: sha256("Binding requirement body"),
      expectedCurrentNativeSha256: currentIssueNativeSha({ teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, priority: 2, parentIssueUuid: null, assigneeId: null, labelIds: [V4_REQUIREMENT_LABEL] }),
      expectedIdentifier: "REQ-1",
      blockKeys: ["block:alpha"],
      description: "Binding requirement body",
      descriptionSha256: sha256("Binding requirement body"),
      payloadSha256: managedIssuePayloadSha({ title: "Alpha requirement", description: "Binding requirement body", teamPlanKey: "team:platform", projectPlanKey: "project:product-alpha", statePlanKey: "state:approved", priority: 2, labelPlanKeys: ["label:requirement"], parentPlanKey: null, assigneePlanKey: null }),
      teamPlanKey: "team:platform",
      projectPlanKey: "project:product-alpha",
      statePlanKey: "state:approved",
      labelPlanKeys: ["label:requirement"],
      priority: 2,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: null,
    }],
    decisions: [{
      kind: "decision",
      origin: "source",
      planKey: "decision:old-context",
      title: "Retire old context",
      expectedCurrentIssueUuid: null,
      expectedCurrentDescriptionSha256: null,
      expectedCurrentNativeSha256: null,
      expectedIdentifier: null,
      blockKeys: ["block:context", "block:product-document", ...[...sourceFiles].slice(1).map((_, index) => `block:canonical-source-${index + 2}`)],
      description: "Decision body",
      descriptionSha256: sha256("Decision body"),
      payloadSha256: managedIssuePayloadSha({ title: "Retire old context", description: "Decision body", teamPlanKey: "team:platform", projectPlanKey: "project:product-alpha", statePlanKey: "state:approved", priority: 3, labelPlanKeys: ["label:decision"], parentPlanKey: null, assigneePlanKey: null }),
      teamPlanKey: "team:platform",
      projectPlanKey: "project:product-alpha",
      statePlanKey: "state:approved",
      labelPlanKeys: ["label:decision"],
      priority: 3,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: null,
    }],
    risks: [{
      kind: "risk",
      origin: "source",
      planKey: "risk:risk-alpha",
      title: "Risk: alpha drift",
      expectedCurrentIssueUuid: null,
      expectedCurrentDescriptionSha256: null,
      expectedCurrentNativeSha256: null,
      expectedIdentifier: null,
      blockKeys: ["block:risk"],
      description: "## Trigger\n\nAlpha drifts.\n\n## Response\n\nStop publication.",
      descriptionSha256: sha256("## Trigger\n\nAlpha drifts.\n\n## Response\n\nStop publication."),
      payloadSha256: managedIssuePayloadSha({ title: "Risk: alpha drift", description: "## Trigger\n\nAlpha drifts.\n\n## Response\n\nStop publication.", teamPlanKey: "team:platform", projectPlanKey: "project:product-alpha", statePlanKey: "state:approved", priority: 2, labelPlanKeys: ["label:risk"], parentPlanKey: null, assigneePlanKey: null }),
      teamPlanKey: "team:platform",
      projectPlanKey: "project:product-alpha",
      statePlanKey: "state:approved",
      labelPlanKeys: ["label:risk"],
      priority: 2,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: null,
    }],
    documents: governedDocumentTargets,
    references: [{
      planKey: "relation-target:execution-alpha",
      title: "Execution Alpha",
      expectedIdentifier: "PLA-1",
    }],
    nativeRelations: [{
      planKey: relationKey,
      type: "related",
      sourcePlanKey: "issue:req-alpha",
      targetPlanKey: "relation-target:execution-alpha",
    }],
    issueDescriptionRepairs: [],
    nativeCatalog: {
      teams: [{ planKey: "team:platform", id: V4_TEAM, key: "PLA", name: "Platform" }],
      users: [],
      initiatives: capture.initiatives.map((initiative) => ({
        planKey: initiativePlanKey(initiative.id),
        id: initiative.id,
        name: initiative.name,
        contentSha256: initiative.contentSha256,
        descriptionSha256: initiative.descriptionSha256,
        updatedAt: initiative.updatedAt,
        ownerId: initiative.ownerId,
        status: initiative.status,
        priority: initiative.priority,
        health: initiative.health,
        healthUpdatedAt: initiative.healthUpdatedAt,
        startedAt: initiative.startedAt,
        targetDate: initiative.targetDate,
        targetDateResolution: initiative.targetDateResolution,
        parentInitiativeId: initiative.parentInitiativeId,
      })),
      projects: capture.projects.map((project) => ({
        planKey: projectPlanKey(project.id),
        id: project.id,
        name: project.name,
        contentSha256: project.contentSha256,
        updatedAt: project.updatedAt,
        statusId: project.statusId,
        status: project.status,
        statusType: project.statusType,
        priority: project.priority,
        leadId: project.leadId,
        startDate: project.startDate,
        startDateResolution: project.startDateResolution,
        targetDate: project.targetDate,
        targetDateResolution: project.targetDateResolution,
        teamPlanKeys: ["team:platform"],
        initiativePlanKeys: project.initiativeIds.map(initiativePlanKey),
      })),
      releasePipelines: [],
      cycles: [],
      milestones: [],
      releases: [],
      states: [{ planKey: "state:approved", id: V4_STATE, name: "Approved", type: "completed", teamPlanKey: "team:platform" }],
      labels: [
        { planKey: "label:requirement", id: V4_REQUIREMENT_LABEL, semanticRole: "requirement", name: "Requirement", teamPlanKey: "team:platform", parentId: null, parentName: null },
        { planKey: "label:decision", id: V4_DECISION_LABEL, semanticRole: "decision", name: "decision", teamPlanKey: null, parentId: V4_TYPE_GROUP, parentName: "Type" },
        { planKey: "label:risk", id: V4_RISK_LABEL, semanticRole: "risk", name: "risk", teamPlanKey: null, parentId: V4_TYPE_GROUP, parentName: "Type" },
      ],
    },
    coverage: {
      complete: true,
      inputNames: [...LINEAR_AUTHORITY_COMPILER_INPUT_NAMES].sort(),
      sourcePaths: [...sourceFiles.keys()].sort((left, right) => left.localeCompare(right)),
      blockKeys: ["block:alpha", "block:context", "block:product-document", "block:risk", ...[...sourceFiles].slice(1).map((_, index) => `block:canonical-source-${index + 2}`)].sort(),
      targetPlanKeys: ["decision:old-context", ...governedDocumentTargets.map((document) => document.planKey), "issue:req-alpha", "relation-target:execution-alpha", "risk:risk-alpha", relationKey].sort(),
      relationPlanKeys: [relationKey],
      targetFamilies: {
        requirements: ["issue:req-alpha"],
        decisions: ["decision:old-context"],
        risks: ["risk:risk-alpha"],
        documents: governedDocumentTargets.map((document) => document.planKey).sort(),
        references: ["relation-target:execution-alpha"],
        relations: [relationKey],
      },
    },
  };
  const blockByKey = new Map(manifest.blocks.map((block) => [block.key, block]));
  for (const target of [...manifest.requirements, ...manifest.decisions, ...manifest.risks].filter((row) => row.origin === "source")) {
    const bindings = [...target.blockKeys].sort().map((key) => {
      const block = blockByKey.get(key)!;
      return `- ${block.sourcePath} | ${block.heading} | sha256:${block.rawSha256}`;
    }).join("\n");
    target.description = `${target.description}\n\n## Source binding\n\n${bindings}`;
    target.descriptionSha256 = sha256(target.description);
    refreshManagedPayload(target);
  }
  manifest.sourceSetRoot = sourceSetRoot(manifest);
  refreshCoreRoots({ manifest, compilerInputs, capture });
  const allocation: LinearAuthorityAllocation = {
    schemaVersion: 1,
    planRoot: manifest.planRoot,
    sourceSetRoot: manifest.sourceSetRoot,
    liveCaptureRoot: manifest.liveCaptureRoot,
    allocations: [
      { planKey: "issue:req-alpha", kind: "issue", title: "Alpha requirement", identifier: "REQ-1", uuid: V4_REQUIREMENT, source: "adopted" },
      { planKey: "decision:old-context", kind: "decision", title: "Retire old context", identifier: null, uuid: V4_DECISION, source: "allocated" },
      { planKey: "risk:risk-alpha", kind: "risk", title: "Risk: alpha drift", identifier: null, uuid: V4_RISK, source: "allocated" },
      ...governedDocumentTargets.map((document) => ({ planKey: document.planKey, kind: "document" as const, title: document.title, identifier: null, uuid: document.expectedCurrentDocumentId!, source: "adopted" as const })),
      { planKey: "relation-target:execution-alpha", kind: "relation_target", title: "Execution Alpha", identifier: "PLA-1", uuid: V4_RELATION_TARGET, source: "adopted" },
      { planKey: relationKey, kind: "relation", title: null, identifier: null, uuid: V4_RELATION, source: "allocated" },
    ],
  };
  const result = { source, sourceFiles, compilerInputs, capture, manifest, allocation };
  refreshAuthorityReceipts(result);
  return result;
}

function validate(input: Fixture) {
  const manifestRaw = JSON.stringify(input.manifest);
  const captureRaw = JSON.stringify(input.capture);
  const allocationRaw = JSON.stringify(input.allocation);
  return validateLinearAuthorityStructure({
    manifestRaw,
    expectedManifestSha256: sha256(manifestRaw),
    sourceFiles: new Map(input.sourceFiles).set("Sourcera_Master_Spec.md", input.source),
    compilerInputs: input.compilerInputs,
    liveCaptureRaw: captureRaw,
    expectedLiveCaptureSha256: sha256(captureRaw),
    allocationRaw,
    expectedAllocationSha256: sha256(allocationRaw),
  });
}

function bindAllocation(input: Fixture): void {
  input.allocation.planRoot = input.manifest.planRoot;
  input.allocation.sourceSetRoot = input.manifest.sourceSetRoot;
  input.allocation.liveCaptureRoot = input.manifest.liveCaptureRoot;
}

function rebind(input: Fixture): void {
  refreshAuthorityReceipts(input);
  bindAllocation(input);
}

function rebindCompilerInputs(input: Fixture): void {
  const captureRaw = JSON.stringify(input.capture);
  for (const row of input.manifest.inputs) {
    const bytes = row.name === "native-identity"
      ? Buffer.from(captureRaw)
      : input.compilerInputs.get(row.name)!;
    row.byteLength = bytes.length;
    row.sha256 = sha256(bytes);
  }
  input.manifest.compilerInputRoot = compilerInputRoot(input.manifest);
  input.manifest.liveCaptureRoot = liveCaptureRoot(input.manifest);
  bindAllocation(input);
}

function rebindCapture(input: Fixture): void {
  const captureRaw = JSON.stringify(input.capture);
  const nativeInput = input.manifest.inputs.find((row) => row.name === "native-identity")!;
  nativeInput.byteLength = Buffer.byteLength(captureRaw);
  nativeInput.sha256 = sha256(captureRaw);
  const programScope = JSON.parse(input.compilerInputs.get("program-scope")!.toString("utf8")) as LinearProgramScopeV3;
  const rawDocumentArtifact = JSON.parse(input.compilerInputs.get("raw-documents")!.toString("utf8")) as { documents: Array<{ id: string; content: string }> };
  const rawContents = new Map(rawDocumentArtifact.documents.map((document) => [document.id, document.content]));
  const fingerprint = fingerprintFromCapture(
    input.capture,
    programScope,
    rawContents,
    input.manifest.sources.find((source) => source.path === "Sourcera_Master_Spec.md")!.rawSha256,
    input.manifest.sources.find((source) => source.path === "UX_Design_of_Sourcera.md")!.rawSha256,
  );
  input.compilerInputs.set("linear-fingerprint", fingerprint);
  const issueDescriptions = issueDescriptionsFromCapture(input.capture);
  input.compilerInputs.set("issue-descriptions", issueDescriptions);
  const rawDocuments = input.compilerInputs.get("raw-documents")!;
  input.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: "2026-07-27T05:00:00.000Z",
    fingerprintSha256: sha256(fingerprint),
    acceptedFingerprintSha256: sha256(fingerprint),
    artifactSha256s: {
      fingerprint: sha256(fingerprint),
      nativeIdentity: sha256(captureRaw),
      documents: sha256(rawDocuments),
      issueDescriptions: sha256(issueDescriptions),
    },
    source: {
      repository: SOURCE_REPOSITORY,
      commit: SOURCE_COMMIT,
      ref: SOURCE_REF,
      runId: SOURCE_RUN_ID,
      runAttempt: SOURCE_RUN_ATTEMPT,
    },
  })));
  refreshAuthorityReceipts(input);
  bindAllocation(input);
}

function setCapturedIssueDescription(input: Fixture, identifier: string, description: string): void {
  const issue = input.capture.issues.find((row) => row.identifier === identifier)!;
  issue.descriptionSha256 = sha256(description);
  rebindCapture(input);
  const artifact = JSON.parse(input.compilerInputs.get("issue-descriptions")!.toString("utf8")) as { schemaVersion: 1; issues: Array<{ id: string; description: string | null }> };
  artifact.issues.find((row) => row.id === identifier)!.description = description;
  const bytes = Buffer.from(JSON.stringify(artifact));
  input.compilerInputs.set("issue-descriptions", bytes);
  const receipt = JSON.parse(input.compilerInputs.get("capture-receipt")!.toString("utf8")) as { artifactSha256s: { issueDescriptions: string } };
  receipt.artifactSha256s.issueDescriptions = sha256(bytes);
  input.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(receipt)));
  refreshAuthorityReceipts(input);
  bindAllocation(input);
}

test("a digest-pinned structure validates without claiming semantic coverage or authorizing mutation", () => {
  const summary = validate(fixture());
  assert.deepEqual(summary, {
    status: "structural_integrity_validated",
    sources: 7,
    blocks: 10,
    targets: 35,
    relations: 1,
    adopted: 32,
    allocated: 3,
    structuralIntegrityValidated: true,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
    sourceSetRoot: fixture().manifest.sourceSetRoot,
  });
});

test("manifest, capture, and allocation bytes must match their external digest pins", () => {
  const input = fixture();
  const manifestRaw = JSON.stringify(input.manifest);
  const captureRaw = JSON.stringify(input.capture);
  const allocationRaw = JSON.stringify(input.allocation);
  const base = {
    manifestRaw,
    sourceFiles: new Map([["spec.md", input.source]]),
    compilerInputs: input.compilerInputs,
    liveCaptureRaw: captureRaw,
    allocationRaw,
  };
  assert.throws(() => validateLinearAuthorityStructure({
    ...base,
    expectedManifestSha256: sha256(`${manifestRaw}\n`),
    expectedLiveCaptureSha256: sha256(captureRaw),
    expectedAllocationSha256: sha256(allocationRaw),
  }), /manifest digest/i);
  assert.throws(() => validateLinearAuthorityStructure({
    ...base,
    expectedManifestSha256: sha256(manifestRaw),
    expectedLiveCaptureSha256: sha256(`${captureRaw}\n`),
    expectedAllocationSha256: sha256(allocationRaw),
  }), /capture digest/i);
  assert.throws(() => validateLinearAuthorityStructure({
    ...base,
    expectedManifestSha256: sha256(manifestRaw),
    expectedLiveCaptureSha256: sha256(captureRaw),
    expectedAllocationSha256: sha256(`${allocationRaw}\n`),
  }), /allocation digest/i);
});

test("source bytes and normalized content must match the pinned source entry", () => {
  const rawDrift = fixture();
  rawDrift.source = Buffer.concat([rawDrift.source, Buffer.from("drift")]);
  assert.throws(() => validate(rawDrift), /source .*byte length|source .*raw digest/i);

  const normalizedDrift = fixture();
  normalizedDrift.manifest.sources[0].normalizedSha256 = sha256("wrong normalized content");
  normalizedDrift.manifest.sourceSetRoot = sourceSetRoot(normalizedDrift.manifest);
  rebind(normalizedDrift);
  assert.throws(() => validate(normalizedDrift), /source .*normalized digest/i);
});

test("block byte ranges must exactly partition each source", () => {
  const overlap = fixture();
  overlap.manifest.blocks[1].byteStart -= 1;
  rebind(overlap);
  assert.throws(() => validate(overlap), /partition|overlap|range/i);

  const gap = fixture();
  gap.manifest.blocks[1].byteStart += 1;
  rebind(gap);
  assert.throws(() => validate(gap), /partition|gap|range/i);
});

test("every block slice must match its heading and raw and normalized hashes", () => {
  const wrongHash = fixture();
  wrongHash.manifest.blocks[0].rawSha256 = sha256("wrong");
  rebind(wrongHash);
  assert.throws(() => validate(wrongHash), /block .*raw digest/i);

  const wrongNormalizedHash = fixture();
  wrongNormalizedHash.manifest.blocks[0].normalizedSha256 = sha256("wrong");
  rebind(wrongNormalizedHash);
  assert.throws(() => validate(wrongNormalizedHash), /block .*normalized digest/i);

  const wrongHeading = fixture();
  wrongHeading.manifest.blocks[0].heading = "# Not the source heading";
  rebind(wrongHeading);
  assert.throws(() => validate(wrongHeading), /heading/i);
});

test("blocks are unique, classified, and have exactly one target or disposition", () => {
  const duplicate = fixture();
  duplicate.manifest.blocks[1].key = duplicate.manifest.blocks[0].key;
  rebind(duplicate);
  assert.throws(() => validate(duplicate), /duplicate block/i);

  const both = fixture();
  both.manifest.blocks[1].targetPlanKey = "issue:req-alpha";
  rebind(both);
  assert.throws(() => validate(both), /exactly one.*target.*disposition/i);

  const neither = fixture();
  neither.manifest.blocks[0].targetPlanKey = null;
  rebind(neither);
  assert.throws(() => validate(neither), /exactly one.*target.*disposition/i);

  const mismatch = fixture();
  mismatch.manifest.blocks[1].classification = "proof_only";
  rebind(mismatch);
  assert.throws(() => validate(mismatch), /classification.*disposition/i);
});

test("native relations resolve stable plan keys and reject hardcoded or duplicate edges", () => {
  const unknown = fixture();
  unknown.manifest.nativeRelations[0].targetPlanKey = "relation-target:missing";
  rebind(unknown);
  assert.throws(() => validate(unknown), /unknown relation target/i);

  const hardcoded = fixture();
  hardcoded.manifest.nativeRelations[0].targetPlanKey = "PLA-1";
  rebind(hardcoded);
  assert.throws(() => validate(hardcoded), /stable plan key|unknown relation target/i);

  const wrongKey = fixture();
  wrongKey.manifest.nativeRelations[0].planKey = "relation:manual";
  rebind(wrongKey);
  assert.throws(() => validate(wrongKey), /canonical relation plan key/i);

  const duplicate = fixture();
  duplicate.manifest.nativeRelations.push({
    ...duplicate.manifest.nativeRelations[0],
    sourcePlanKey: duplicate.manifest.nativeRelations[0].targetPlanKey,
    targetPlanKey: duplicate.manifest.nativeRelations[0].sourcePlanKey,
  });
  duplicate.manifest.coverage.relationPlanKeys.push(duplicate.manifest.nativeRelations[0].planKey);
  rebind(duplicate);
  assert.throws(() => validate(duplicate), /duplicate relation/i);
});

test("native relation endpoints are issue-like and blocking relations are acyclic", () => {
  const documentEndpoint = fixture();
  const priorKey = documentEndpoint.manifest.nativeRelations[0].planKey;
  const documentKey = relationPlanKey("related", "issue:req-alpha", "document:product-alpha");
  documentEndpoint.manifest.nativeRelations[0] = {
    planKey: documentKey,
    type: "related",
    sourcePlanKey: "issue:req-alpha",
    targetPlanKey: "document:product-alpha",
  };
  documentEndpoint.manifest.coverage.relationPlanKeys = [documentKey];
  documentEndpoint.manifest.coverage.targetFamilies.relations = [documentKey];
  documentEndpoint.manifest.coverage.targetPlanKeys = documentEndpoint.manifest.coverage.targetPlanKeys.map((key) => key === priorKey ? documentKey : key).sort();
  Object.assign(documentEndpoint.allocation.allocations.find((row) => row.planKey === priorKey)!, { planKey: documentKey });
  rebind(documentEndpoint);
  assert.throws(() => validate(documentEndpoint), /relation endpoint.*issue-like/i);

  const cycle = fixture();
  const first = relationPlanKey("blocks", "issue:req-alpha", "relation-target:execution-alpha");
  const second = relationPlanKey("blocks", "relation-target:execution-alpha", "issue:req-alpha");
  cycle.manifest.nativeRelations = [
    { planKey: first, type: "blocks", sourcePlanKey: "issue:req-alpha", targetPlanKey: "relation-target:execution-alpha" },
    { planKey: second, type: "blocks", sourcePlanKey: "relation-target:execution-alpha", targetPlanKey: "issue:req-alpha" },
  ];
  cycle.manifest.coverage.relationPlanKeys = [first, second].sort();
  cycle.manifest.coverage.targetFamilies.relations = [first, second].sort();
  cycle.manifest.coverage.targetPlanKeys = cycle.manifest.coverage.targetPlanKeys.filter((key) => key !== priorKey).concat(first, second).sort();
  const relationAllocation = cycle.allocation.allocations.find((row) => row.planKey === priorKey)!;
  Object.assign(relationAllocation, { planKey: first });
  cycle.allocation.allocations.push({ planKey: second, kind: "relation", title: null, identifier: null, uuid: V4_RELATION_2, source: "allocated" });
  rebind(cycle);
  assert.throws(() => validate(cycle), /blocking relation graph.*cycle/i);
});

test("derived structural coverage must be complete", () => {
  const incompleteCoverage = fixture();
  incompleteCoverage.manifest.coverage.blockKeys.pop();
  rebind(incompleteCoverage);
  assert.throws(() => validate(incompleteCoverage), /coverage.*block/i);

});

test("allocation is exact and every missing target receives a unique UUIDv4", () => {
  const missing = fixture();
  missing.allocation.allocations.pop();
  refreshAuthorityReceipts(missing);
  assert.throws(() => validate(missing), /missing allocation|coverage/i);

  const extra = fixture();
  extra.allocation.allocations.push({
    planKey: "document:extra",
    kind: "document",
    title: "Extra",
    identifier: null,
    uuid: V4_REPLACEMENT,
    source: "allocated",
  });
  refreshAuthorityReceipts(extra);
  assert.throws(() => validate(extra), /unexpected allocation|UUID mapping target plan keys/i);

  const nonV4 = fixture();
  nonV4.allocation.allocations.find((row) => row.planKey === "document:product-alpha")!.uuid = V5;
  refreshAuthorityReceipts(nonV4);
  assert.throws(() => validate(nonV4), /UUIDv4|non-v4/i);
});

test("adopted allocations preserve exact live UUID, kind, title, and identifier", () => {
  for (const [field, value] of [
    ["uuid", V4_REPLACEMENT],
    ["kind", "decision"],
    ["title", "Drifted title"],
    ["identifier", "REQ-2"],
  ] as const) {
    const input = fixture();
    const adopted = input.allocation.allocations.find((row) => row.planKey === "issue:req-alpha")!;
    Object.assign(adopted, { [field]: value });
    refreshAuthorityReceipts(input);
    assert.throws(() => validate(input), /adopted.*(?:UUID|kind|title|identifier)|identity mismatch/i, field);
  }
});

test("allocated managed targets cannot retain any expected live identity", () => {
  const input = fixture();
  input.manifest.decisions[0].expectedIdentifier = "DEC-999";
  rebind(input);
  assert.throws(() => validate(input), /allocated managed target.*identity.*null/i);
});

test("allocated UUIDs cannot collide with any live UUID or another allocation", () => {
  const liveCollision = fixture();
  liveCollision.allocation.allocations.find((row) => row.planKey === "decision:old-context")!.uuid = V4_UNRELATED_LIVE;
  refreshAuthorityReceipts(liveCollision);
  assert.throws(() => validate(liveCollision), /collides with.*live UUID/i);

  const duplicate = fixture();
  duplicate.allocation.allocations.find((row) => row.planKey === "risk:risk-alpha")!.uuid = V4_DECISION;
  refreshAuthorityReceipts(duplicate);
  assert.throws(() => validate(duplicate), /duplicate.*UUID/i);
});

test("relation targets must preserve an exact existing native issue", () => {
  const input = fixture();
  input.capture.issues = input.capture.issues.filter((row) => row.identifier !== "PLA-1");
  input.capture.coverage.totals.issues = 2;
  input.capture.coverage.topLevel.issues.rows = 2;
  input.capture.coverage.perIssue = input.capture.coverage.perIssue.filter((row) => row.identifier !== "PLA-1");
  const target = input.allocation.allocations.find((row) => row.planKey === "relation-target:execution-alpha")!;
  Object.assign(target, { source: "allocated", identifier: null, uuid: V4_REPLACEMENT });
  rebindCapture(input);
  assert.throws(() => validate(input), /relation target.*existing native issue.*adopted/i);

  target.source = "adopted";
  input.allocation.allocations = input.allocation.allocations.filter((row) => row.planKey !== "relation-target:execution-alpha");
  refreshAuthorityReceipts(input);
  assert.throws(() => validate(input), /missing allocation|coverage/i);
});

test("allocation binding rejects stale manifest, source-set, and capture identities", () => {
  const staleManifest = fixture();
  staleManifest.manifest.preCutoverTag = "changed-tag";
  assert.throws(() => validate(staleManifest), /plan root|allocation.*plan/i);

  const staleSourceSet = fixture();
  staleSourceSet.allocation.sourceSetRoot = sha256("stale-source-set");
  assert.throws(() => validate(staleSourceSet), /allocation.*source set|allocation-lock.*binding/i);

  const staleCapture = fixture();
  staleCapture.capture.issues.push({ issueUuid: V4_REPLACEMENT, identifier: "PLA-1000", title: "New live row", archivedAt: null, descriptionSha256: sha256("New live body"), teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, estimate: null, priority: 2, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: null, assigneeId: null, labelIds: [], relationIds: [] });
  assert.throws(() => validate(staleCapture), /manifest.*capture|allocation.*capture|native-identity.*(?:byte length|digest)/i);
});

test("every compiler input is present once and matches its pinned digest", () => {
  const drifted = fixture();
  drifted.compilerInputs.set("semantic-plan", Buffer.from("changed semantic plan"));
  assert.throws(() => validate(drifted), /compiler input semantic-plan.*digest/i);

  for (const name of ["source-routing", "risk-routing", "allocation-lock"] as const) {
    const required = fixture();
    required.manifest.inputs = required.manifest.inputs.filter((row) => row.name !== name);
    required.compilerInputs.delete(name);
    required.manifest.compilerInputRoot = compilerInputRoot(required.manifest);
    rebind(required);
    assert.throws(() => validate(required), /compiler input coverage/i, name);
  }

  const wrongLength = fixture();
  wrongLength.manifest.inputs.find((row) => row.name === "semantic-plan")!.byteLength += 1;
  wrongLength.manifest.compilerInputRoot = compilerInputRoot(wrongLength.manifest);
  assert.throws(() => validate(wrongLength), /semantic-plan.*byte length/i);

  const missing = fixture();
  missing.manifest.inputs = missing.manifest.inputs.filter((row) => row.name !== "document-canary-receipt");
  missing.manifest.compilerInputRoot = compilerInputRoot(missing.manifest);
  rebind(missing);
  assert.throws(() => validate(missing), /compiler input coverage|missing compiler input/i);
});

test("v2 capture receipt binds exact capture bytes to canonical main provenance", () => {
  const badTimestamp = fixture();
  const timestampReceipt = JSON.parse(badTimestamp.compilerInputs.get("capture-receipt")!.toString("utf8"));
  timestampReceipt.capturedAt = "2026-07-27";
  badTimestamp.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(timestampReceipt)));
  rebindCompilerInputs(badTimestamp);
  assert.throws(() => validate(badTimestamp), /capture receipt.*capturedAt/i);

  const wrongCommit = fixture();
  const commitReceipt = JSON.parse(wrongCommit.compilerInputs.get("capture-receipt")!.toString("utf8"));
  commitReceipt.source.commit = "0000000000000000000000000000000000000000";
  wrongCommit.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(commitReceipt)));
  rebindCompilerInputs(wrongCommit);
  assert.throws(() => validate(wrongCommit), /capture receipt source/i);

  const detachedBytes = fixture();
  const bytesReceipt = JSON.parse(detachedBytes.compilerInputs.get("capture-receipt")!.toString("utf8"));
  bytesReceipt.artifactSha256s.nativeIdentity = sha256("another capture");
  detachedBytes.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(bytesReceipt)));
  rebindCompilerInputs(detachedBytes);
  assert.throws(() => validate(detachedBytes), /capture receipt artifact hashes/i);
});

test("GitHub artifact metadata is exact and attached to the receipt run", () => {
  const wrongName = fixture();
  const nameMetadata = JSON.parse(wrongName.compilerInputs.get("github-artifact")!.toString("utf8"));
  nameMetadata.artifact.name = "linear-native-authority-capture-wrong";
  wrongName.compilerInputs.set("github-artifact", Buffer.from(JSON.stringify(nameMetadata)));
  rebindCompilerInputs(wrongName);
  assert.throws(() => validate(wrongName), /GitHub artifact metadata.*provenance/i);

  const wrongRun = fixture();
  const runMetadata = JSON.parse(wrongRun.compilerInputs.get("github-artifact")!.toString("utf8"));
  runMetadata.artifact.runId = "124";
  wrongRun.compilerInputs.set("github-artifact", Buffer.from(JSON.stringify(runMetadata)));
  rebindCompilerInputs(wrongRun);
  assert.throws(() => validate(wrongRun), /GitHub artifact metadata.*provenance/i);

  const invalidDigest = fixture();
  const digestMetadata = JSON.parse(invalidDigest.compilerInputs.get("github-artifact")!.toString("utf8"));
  digestMetadata.artifact.digest = sha256("missing-algorithm-prefix");
  invalidDigest.compilerInputs.set("github-artifact", Buffer.from(JSON.stringify(digestMetadata)));
  rebindCompilerInputs(invalidDigest);
  assert.throws(() => validate(invalidDigest), /GitHub artifact.*digest/i);
});

test("live capture root binds every capture input, not only native identity", () => {
  const input = fixture();
  input.manifest.liveCaptureRoot = sha256("only-native-identity");
  assert.throws(() => validate(input), /live capture root/i);
});

test("authority structure is pinned to one exact active Linear workspace", () => {
  const drift = fixture();
  drift.capture.workspace.urlKey = "wrong-workspace";
  rebindCapture(drift);
  assert.throws(() => validate(drift), /workspace.*pinned/i);

  const collision = fixture();
  collision.allocation.allocations.find((row) => row.planKey === "decision:old-context")!.uuid = V4_WORKSPACE;
  refreshAuthorityReceipts(collision);
  assert.throws(() => validate(collision), /collides with.*live UUID/i);
});

test("every active governed live issue is represented by one adopted managed target", () => {
  const input = fixture();
  input.capture.issues.push({ issueUuid: V4_GOVERNED_LIVE, identifier: "DEC-77", title: "Unmapped live Decision", archivedAt: null, descriptionSha256: sha256("Unmapped"), teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, estimate: null, priority: 2, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [], parentIssueUuid: null, assigneeId: null, labelIds: [V4_DECISION_LABEL], relationIds: [] });
  input.capture.coverage.totals.issues += 1;
  input.capture.coverage.totals.labelAssignments += 1;
  input.capture.coverage.topLevel.issues.rows += 1;
  input.capture.coverage.perIssue.push({ issueUuid: V4_GOVERNED_LIVE, identifier: "DEC-77", labels: nestedCoverage(1), relations: nestedCoverage(0), inverseRelations: nestedCoverage(0) });
  rebindCapture(input);
  assert.throws(() => validate(input), /governed live issue.*not represented/i);
});

test("managed descriptions cannot copy native identifiers or relation metadata into prose", () => {
  const input = fixture();
  const description = "Binding body\n\n## Dependencies\n\nREQ-1";
  input.manifest.requirements[0].description = description;
  input.manifest.requirements[0].descriptionSha256 = sha256(description);
  input.manifest.requirements[0].payloadSha256 = managedIssuePayloadSha({ title: "Alpha requirement", description, teamPlanKey: "team:platform", projectPlanKey: "project:product-alpha", statePlanKey: "state:approved", priority: 2, labelPlanKeys: ["label:requirement"], parentPlanKey: null, assigneePlanKey: null });
  rebind(input);
  assert.throws(() => validate(input), /native reference prose hygiene/i);
});

test("capture artifacts must semantically match native identity, not merely update their hashes", () => {
  const fingerprintDrift = fixture();
  fingerprintDrift.compilerInputs.set("linear-fingerprint", Buffer.from(JSON.stringify({ issues: [], releasePipelines: [], releases: [], projects: [], projectMilestones: [], cycles: [] })));
  const receipt = JSON.parse(fingerprintDrift.compilerInputs.get("capture-receipt")!.toString("utf8"));
  receipt.fingerprintSha256 = sha256(fingerprintDrift.compilerInputs.get("linear-fingerprint")!);
  receipt.acceptedFingerprintSha256 = receipt.fingerprintSha256;
  receipt.artifactSha256s.fingerprint = receipt.fingerprintSha256;
  fingerprintDrift.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(receipt)));
  refreshAuthorityReceipts(fingerprintDrift);
  bindAllocation(fingerprintDrift);
  assert.throws(() => validate(fingerprintDrift), /fingerprint.*native|native.*fingerprint/i);

  const rawDocumentDrift = fixture();
  rawDocumentDrift.compilerInputs.set("raw-documents", Buffer.from(JSON.stringify({ schemaVersion: 1, documents: [{ id: V4_LIVE_DOCUMENT, content: "detached" }] })));
  const documentReceipt = JSON.parse(rawDocumentDrift.compilerInputs.get("capture-receipt")!.toString("utf8"));
  documentReceipt.artifactSha256s.documents = sha256(rawDocumentDrift.compilerInputs.get("raw-documents")!);
  rawDocumentDrift.compilerInputs.set("capture-receipt", Buffer.from(JSON.stringify(documentReceipt)));
  refreshAuthorityReceipts(rawDocumentDrift);
  bindAllocation(rawDocumentDrift);
  assert.throws(() => validate(rawDocumentDrift), /raw document.*native|native document/i);
});

test("compiler evidence and canary measurement cannot be replaced by rehashed opaque bytes", () => {
  for (const name of ["semantic-plan", "source-routing", "document-canary-receipt"] as const) {
    const input = fixture();
    input.compilerInputs.set(name, Buffer.from(JSON.stringify({ schemaVersion: 1, forged: name })));
    rebindCompilerInputs(input);
    assert.throws(() => validate(input), new RegExp(name.replaceAll("-", ".*"), "i"), name);
  }
});

test("document canary limits reject an oversized desired document payload", () => {
  const input = fixture();
  const target = input.manifest.documents[1];
  const content = `${target.content}\n${"x".repeat(200_000)}`;
  target.content = content;
  target.contentSha256 = sha256(content);
  target.canonicalReadbackSha256 = sha256(`${content}\n`);
  target.expectedCurrentContentSha256 = sha256(content);
  input.capture.documents.find((document) => document.id === target.expectedCurrentDocumentId)!.contentSha256 = sha256(content);
  const raw = JSON.parse(input.compilerInputs.get("raw-documents")!.toString("utf8")) as { schemaVersion: 1; documents: Array<{ id: string; content: string; contentSha256: string }> };
  const rawDocument = raw.documents.find((document) => document.id === target.expectedCurrentDocumentId)!;
  rawDocument.content = content;
  rawDocument.contentSha256 = sha256(content);
  input.compilerInputs.set("raw-documents", Buffer.from(JSON.stringify(raw)));
  const program = JSON.parse(input.compilerInputs.get("program-scope")!.toString("utf8")) as LinearProgramScopeV3;
  program.canonicalProjectDocuments.find((document) => document.id === target.expectedCurrentDocumentId)!.contentFingerprint = sha256(content);
  input.compilerInputs.set("program-scope", Buffer.from(JSON.stringify(program)));
  rebindCapture(input);
  assert.throws(() => validate(input), /document.*canary.*(?:UTF-8|UTF-16).*limit/i);
});

test("Requirement is team-scoped while decision reuses the canonical grouped Type label", () => {
  const competing = fixture();
  competing.capture.labels.push({ ...competing.capture.labels[0], id: V4_REPLACEMENT });
  competing.capture.coverage.totals.labels = 5;
  competing.capture.coverage.topLevel.labels.rows = 5;
  rebindCapture(competing);
  assert.throws(() => validate(competing), /competing.*Requirement|Requirement.*unique|label identity.*multiple UUIDs/i);

  const grouped = fixture();
  grouped.capture.labels[0].isGroup = true;
  rebindCapture(grouped);
  assert.throws(() => validate(grouped), /Requirement.*non-group|grouped/i);

  const wrongScope = fixture();
  wrongScope.capture.labels[1].teamId = V4_TEAM;
  wrongScope.capture.labels[1].teamKey = "PLA";
  rebindCapture(wrongScope);
  assert.throws(() => validate(wrongScope), /decision.*scope|team|pinned/i);

  const substitute = fixture();
  substitute.capture.labels.push({ id: V4_REPLACEMENT, name: "Decision", color: "#654321", archivedAt: null, inheritedFromId: null, isGroup: false, parentId: null, parentName: null, teamId: V4_TEAM, teamKey: "PLA" });
  substitute.capture.coverage.totals.labels += 1;
  substitute.capture.coverage.topLevel.labels.rows += 1;
  rebindCapture(substitute);
  assert.throws(() => validate(substitute), /duplicate or substitute semantic decision label/i);
});

test("team, workflow state, and project identities match exact active native catalog rows", () => {
  const teamDrift = fixture();
  teamDrift.capture.teams[0].key = "BUY";
  rebindCapture(teamDrift);
  assert.throws(() => validate(teamDrift), /team.*pinned|team.*key|label.*invalid references/i);

  const stateDrift = fixture();
  stateDrift.capture.workflowStates[0].name = "Done";
  rebindCapture(stateDrift);
  assert.throws(() => validate(stateDrift), /state.*pinned|state.*name|identity.*fingerprint/i);

  const projectDrift = fixture();
  projectDrift.capture.projects[0].name = "Renamed";
  rebindCapture(projectDrift);
  assert.throws(() => validate(projectDrift), /project.*pinned|project.*name|identity.*fingerprint|project document.*attached/i);
});

test("cycle, milestone, and release selectors must resolve exact active fingerprint identities", () => {
  const cycle = fixture();
  cycle.manifest.nativeCatalog.cycles.push({ planKey: "cycle:one", id: V4_CYCLE, number: 1, name: "Cycle 1", descriptionSha256: sha256("cycle"), updatedAt: "2026-07-27T04:00:00.000Z", startsAt: "2026-07-27T00:00:00.000Z", endsAt: "2026-08-03T00:00:00.000Z", completedAt: null, teamPlanKey: "team:platform", inheritedFromId: null });
  cycle.manifest.requirements[0].cyclePlanKey = "cycle:one";
  refreshManagedPayload(cycle.manifest.requirements[0]);
  rebind(cycle);
  assert.throws(() => validate(cycle), /cycle.*pinned active/i);

  const milestone = fixture();
  milestone.manifest.nativeCatalog.milestones.push({ planKey: "milestone:one", id: V4_MILESTONE, name: "Milestone 1", descriptionSha256: sha256("milestone"), updatedAt: "2026-07-27T04:00:00.000Z", targetDate: null, status: "unstarted", projectPlanKey: "project:product-alpha" });
  milestone.manifest.requirements[0].milestonePlanKey = "milestone:one";
  refreshManagedPayload(milestone.manifest.requirements[0]);
  rebind(milestone);
  assert.throws(() => validate(milestone), /milestone.*pinned active/i);

  const release = fixture();
  release.manifest.nativeCatalog.releasePipelines.push({ planKey: "release-pipeline:one", id: V4_RELEASE_PIPELINE, name: "Pipeline 1", updatedAt: "2026-07-27T04:00:00.000Z", type: "release", isProduction: true, teamPlanKeys: ["team:platform"], stages: [{ id: V4_RELEASE_STAGE, name: "Planned", type: "planned", position: 1, frozen: false }] });
  release.manifest.nativeCatalog.releases.push({ planKey: "release:one", id: V4_RELEASE, name: "Release 1", descriptionSha256: sha256("release"), version: "1.0.0", commitSha: null, startDate: null, startedAt: null, targetDate: null, completedAt: null, updatedAt: "2026-07-27T04:00:00.000Z", pipelinePlanKey: "release-pipeline:one", stageId: V4_RELEASE_STAGE, stageName: "Planned", stageType: "planned" });
  release.manifest.requirements[0].releasePlanKeys = ["release:one"];
  refreshManagedPayload(release.manifest.requirements[0]);
  rebind(release);
  assert.throws(() => validate(release), /release.*pinned active/i);
});

test("native capture totals and pagination coverage must exactly match captured catalogs", () => {
  const input = fixture();
  input.capture.coverage.totals.issues = 2;
  rebindCapture(input);
  assert.throws(() => validate(input), /native capture.*coverage|coverage.*issues/i);
});

test("adopted relation UUID maps to the exact canonical type and captured endpoints", () => {
  const input = fixture();
  input.capture.relations = [{
    relationId: V4_RELATION,
    canonicalKey: "related:PLA-1:REQ-1",
    type: "related",
    archivedAt: null,
    issueId: V4_REQUIREMENT,
    issueIdentifier: "REQ-1",
    relatedIssueId: V4_RELATION_TARGET,
    relatedIssueIdentifier: "PLA-1",
  }];
  input.capture.issues[0].relationIds = [V4_RELATION];
  input.capture.issues[1].relationIds = [V4_RELATION];
  input.capture.coverage.totals.relations = 1;
  input.capture.coverage.perIssue[0].relations.rows = 1;
  input.capture.coverage.perIssue[1].inverseRelations.rows = 1;
  input.manifest.requirements[0].expectedCurrentNativeSha256 = currentIssueNativeSha({ teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, priority: 2, parentIssueUuid: null, assigneeId: null, labelIds: [V4_REQUIREMENT_LABEL], relationIds: [V4_RELATION] });
  input.allocation.allocations.find((row) => row.kind === "relation")!.source = "adopted";
  rebindCapture(input);
  assert.equal(validate(input).adopted, 33);

  input.capture.relations[0].canonicalKey = "related:PLA-999:REQ-1";
  rebindCapture(input);
  assert.throws(() => validate(input), /adopted relation.*canonical|relation.*endpoints/i);
});

test("a live-origin Decision can be adopted without inventing a source block", () => {
  const input = fixture();
  const currentDescription = "Existing live decision body";
  const desiredDescription = "Reviewed live decision body";
  input.capture.issues.push({
    issueUuid: V4_LIVE_DECISION,
    identifier: "DEC-2",
    title: "Keep the live decision",
    archivedAt: null,
    descriptionSha256: sha256(currentDescription),
    teamId: V4_TEAM,
    stateId: V4_STATE,
    projectId: V4_PROJECT,
    estimate: null,
    priority: 2,
    dueDate: null,
    cycleId: null,
    milestoneId: null,
    releaseIds: [],
    parentIssueUuid: null,
    assigneeId: null,
    labelIds: [V4_DECISION_LABEL],
    relationIds: [],
  });
  input.capture.coverage.totals.issues += 1;
  input.capture.coverage.totals.labelAssignments += 1;
  input.capture.coverage.topLevel.issues.rows += 1;
  input.capture.coverage.perIssue.push({ issueUuid: V4_LIVE_DECISION, identifier: "DEC-2", labels: nestedCoverage(1), relations: nestedCoverage(0), inverseRelations: nestedCoverage(0) });
  input.manifest.decisions.push({
    kind: "decision",
    origin: "live",
    planKey: "decision:live-only",
    title: "Keep the live decision",
    expectedCurrentIssueUuid: V4_LIVE_DECISION,
    expectedCurrentDescriptionSha256: sha256(currentDescription),
    expectedCurrentNativeSha256: currentIssueNativeSha({ teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, priority: 2, parentIssueUuid: null, assigneeId: null, labelIds: [V4_DECISION_LABEL] }),
    expectedIdentifier: "DEC-2",
    blockKeys: [],
    description: desiredDescription,
    descriptionSha256: sha256(desiredDescription),
    payloadSha256: managedIssuePayloadSha({ title: "Keep the live decision", description: desiredDescription, teamPlanKey: "team:platform", projectPlanKey: "project:product-alpha", statePlanKey: "state:approved", priority: 2, labelPlanKeys: ["label:decision"], parentPlanKey: null, assigneePlanKey: null }),
    teamPlanKey: "team:platform",
    projectPlanKey: "project:product-alpha",
    statePlanKey: "state:approved",
    labelPlanKeys: ["label:decision"],
    priority: 2,
    estimate: null,
    dueDate: null,
    cyclePlanKey: null,
    milestonePlanKey: null,
    releasePlanKeys: [],
    parentPlanKey: null,
    assigneePlanKey: null,
  });
  input.manifest.coverage.targetPlanKeys.push("decision:live-only");
  input.manifest.coverage.targetPlanKeys.sort();
  input.manifest.coverage.targetFamilies.decisions.push("decision:live-only");
  input.manifest.coverage.targetFamilies.decisions.sort();
  input.allocation.allocations.push({ planKey: "decision:live-only", kind: "decision", title: "Keep the live decision", identifier: "DEC-2", uuid: V4_LIVE_DECISION, source: "adopted" });
  rebindCapture(input);
  assert.equal(validate(input).adopted, 33);
});

test("the adopted document inventory cannot add an ungoverned live document", () => {
  const input = fixture();
  input.manifest.documents.push({ ...input.manifest.documents[0], planKey: "document:extra-copy", role: "research_context" });
  input.manifest.coverage.targetPlanKeys.push("document:extra-copy");
  input.manifest.coverage.targetPlanKeys.sort();
  input.manifest.coverage.targetFamilies.documents.push("document:extra-copy");
  input.manifest.coverage.targetFamilies.documents.sort();
  rebind(input);
  assert.throws(() => validate(input), /30-document|ungoverned document/i);
});

test("desired issue payloads and every target-family coverage list are independently bound", () => {
  const wrongPayload = fixture();
  wrongPayload.manifest.requirements[0].payloadSha256 = sha256("different desired payload");
  rebind(wrongPayload);
  assert.throws(() => validate(wrongPayload), /payload digest/i);

  const missingRisk = fixture();
  missingRisk.manifest.coverage.targetFamilies.risks = [];
  rebind(missingRisk);
  assert.throws(() => validate(missingRisk), /target-family coverage risks/i);
});

test("all native catalog UUIDs are reserved from new allocations", () => {
  const input = fixture();
  input.allocation.allocations.find((row) => row.planKey === "decision:old-context")!.uuid = V4_REQUIREMENT_LABEL;
  refreshAuthorityReceipts(input);
  assert.throws(() => validate(input), /collides with.*live UUID/i);
});

test("source-origin targets carry an exact canonical source binding", () => {
  const input = fixture();
  const decision = input.manifest.decisions[0];
  decision.description = decision.description.replace(/sha256:[a-f0-9]{64}/, `sha256:${sha256("drift")}`);
  decision.descriptionSha256 = sha256(decision.description);
  refreshManagedPayload(decision);
  rebind(input);
  assert.throws(() => validate(input), /source binding.*canonical source blocks/i);
});

test("live governed documents cannot claim canonical source blocks", () => {
  const input = fixture();
  input.manifest.documents[0].blockKeys = ["block:context"];
  rebind(input);
  assert.throws(() => validate(input), /live-origin document.*cannot claim canonical source blocks/i);
});

test("all active issue descriptions require explicit repairs for captured identifiers and Linear URLs", () => {
  for (const prefix of ["PLA", "BUY", "SEL", "INT"] as const) {
    const input = fixture();
    const renamed = input.capture.issues.find((issue) => issue.identifier === "PLA-999")!;
    renamed.identifier = `${prefix}-122`;
    input.capture.coverage.perIssue.find((row) => row.issueUuid === renamed.issueUuid)!.identifier = renamed.identifier;
    setCapturedIssueDescription(input, "PLA-1", `Payload example copied from ${renamed.identifier}`);
    assert.throws(() => validate(input), /PLA-1 has unresolved native reference prose drift/i, prefix);
  }

  const linked = fixture();
  setCapturedIssueDescription(linked, "PLA-999", "See https://linear.app/sourcera-production/issue/REQ-1/example");
  assert.throws(() => validate(linked), /PLA-999 has unresolved native reference prose drift/i);
});

test("an exact current-to-desired repair resolves active non-governed description drift only", () => {
  const input = fixture();
  const current = "Payload examples: REQ-1 and REQ-2";
  const desired = "Payload examples use neutral placeholder A and placeholder B.";
  setCapturedIssueDescription(input, "PLA-999", current);
  input.manifest.issueDescriptionRepairs.push({
    issueUuid: V4_UNRELATED_LIVE,
    identifier: "PLA-999",
    expectedCurrentDescriptionSha256: sha256(current),
    desiredDescription: desired,
    desiredDescriptionSha256: sha256(desired),
    requiresNoNativeRelations: true,
  });
  rebind(input);
  assert.equal(validate(input).structuralIntegrityValidated, true);

  const archived = fixture();
  archived.capture.issues.find((issue) => issue.identifier === "PLA-999")!.archivedAt = "2026-07-27T04:00:00.000Z";
  setCapturedIssueDescription(archived, "PLA-999", current);
  assert.equal(validate(archived).structuralIntegrityValidated, true);
});

test("every active relation touching a governed issue is an exact adopted desired relation", () => {
  const input = fixture();
  const relationId = V4_RELATION_2;
  input.capture.relations.push({
    relationId,
    canonicalKey: "blocks:REQ-1:PLA-999",
    type: "blocks",
    archivedAt: null,
    issueId: V4_REQUIREMENT,
    issueIdentifier: "REQ-1",
    relatedIssueId: V4_UNRELATED_LIVE,
    relatedIssueIdentifier: "PLA-999",
  });
  input.capture.issues[0].relationIds.push(relationId);
  input.capture.issues[2].relationIds.push(relationId);
  input.capture.coverage.totals.relations += 1;
  input.capture.coverage.perIssue[0].relations.rows += 1;
  input.capture.coverage.perIssue[2].inverseRelations.rows += 1;
  input.manifest.requirements[0].expectedCurrentNativeSha256 = currentIssueNativeSha({ teamId: V4_TEAM, stateId: V4_STATE, projectId: V4_PROJECT, priority: 2, parentIssueUuid: null, assigneeId: null, labelIds: [V4_REQUIREMENT_LABEL], relationIds: [relationId] });
  rebindCapture(input);
  assert.throws(() => validate(input), /governed live relation.*exact adopted desired relation/i);
});

test("Requirement project binding follows the sole canonical document kind", () => {
  const input = fixture();
  const brief = input.manifest.documents.find((document) => document.role === "engineering_brief")!;
  const project = input.manifest.nativeCatalog.projects.find((row) => row.planKey === brief.attachmentPlanKey)!;
  input.manifest.requirements[0].projectPlanKey = project.planKey;
  input.capture.issues[0].projectId = project.id;
  input.manifest.requirements[0].expectedCurrentNativeSha256 = currentIssueNativeSha({ teamId: V4_TEAM, stateId: V4_STATE, projectId: project.id, priority: 2, parentIssueUuid: null, assigneeId: null, labelIds: [V4_REQUIREMENT_LABEL] });
  refreshManagedPayload(input.manifest.requirements[0]);
  rebindCapture(input);
  assert.equal(validate(input).structuralIntegrityValidated, true);
});

test("native catalog pins full initiative and project metadata and canonical decision taxonomy", () => {
  const initiative = fixture();
  initiative.manifest.nativeCatalog.initiatives[0].contentSha256 = sha256("different initiative content");
  rebind(initiative);
  assert.throws(() => validate(initiative), /initiative.*pinned active metadata/i);

  const project = fixture();
  project.manifest.nativeCatalog.projects[0].priority = 4;
  rebind(project);
  assert.throws(() => validate(project), /project.*pinned metadata/i);

  const decision = fixture();
  Object.assign(decision.manifest.nativeCatalog.labels.find((label) => label.semanticRole === "decision")!, {
    name: "Decision",
    teamPlanKey: "team:platform",
    parentId: null,
    parentName: null,
  });
  rebind(decision);
  assert.throws(() => validate(decision), /grouped decision label|canonical grouped Type decision/i);
});

test("offline CLI validates files and emits only a concise JSON summary", () => {
  const input = fixture();
  const root = mkdtempSync(join(tmpdir(), "linear-authority-manifest-"));
  try {
    const sourceRoot = join(root, "sources");
    mkdirSync(sourceRoot);
    const manifestRaw = JSON.stringify(input.manifest);
    const captureRaw = JSON.stringify(input.capture);
    const allocationRaw = JSON.stringify(input.allocation);
    for (const [path, bytes] of input.sourceFiles) writeFileSync(join(sourceRoot, path), bytes);
    writeFileSync(join(root, "manifest.json"), manifestRaw);
    writeFileSync(join(root, "capture.json"), captureRaw);
    writeFileSync(join(root, "allocation.json"), allocationRaw);
    const inputArgs: string[] = [];
    for (const [name, bytes] of input.compilerInputs) {
      const path = join(root, `${name}.json`);
      writeFileSync(path, bytes);
      inputArgs.push("--input", `${name}=${path}`);
    }
    const run = spawnSync(process.execPath, [
      "--import", "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/validate-linear-authority-package.ts",
      "--manifest", join(root, "manifest.json"),
      "--manifest-sha256", sha256(manifestRaw),
      "--source-root", sourceRoot,
      "--capture", join(root, "capture.json"),
      "--capture-sha256", sha256(captureRaw),
      "--allocation", join(root, "allocation.json"),
      "--allocation-sha256", sha256(allocationRaw),
      ...inputArgs,
    ], {
      encoding: "utf8",
      env: { NODE_ENV: "test", PATH: process.env.PATH ?? "" },
    });
    assert.equal(run.status, 0, run.stderr);
    const summary = JSON.parse(run.stdout) as Record<string, unknown>;
    assert.deepEqual(Object.keys(summary).sort(), [
      "adopted", "allocated", "blocks", "mutationAuthorized", "relations", "semanticCoverageValidated", "sourceSetRoot", "sources", "status", "structuralIntegrityValidated", "targets",
    ]);
    assert.equal(summary.status, "structural_integrity_validated");
    assert.equal(summary.structuralIntegrityValidated, true);
    assert.equal(summary.semanticCoverageValidated, false);
    assert.equal(summary.mutationAuthorized, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
