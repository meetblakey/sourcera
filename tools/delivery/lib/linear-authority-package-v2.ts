import { createHash } from "node:crypto";

import {
  computeLinearAuthorityPlanRoot,
  LINEAR_AUTHORITY_COMPILER_INPUT_NAMES_V2,
  type LinearAuthorityAllocation,
  type LinearAuthorityCompilerInputName,
  type LinearAuthorityManifest,
  type LinearTargetAllocation,
} from "./linear-authority-manifest.js";
import {
  parseLinearAuthoritySemanticPlanV4,
  type ValidatedLinearAuthoritySemanticPlanV4,
} from "./linear-authority-semantic-plan-v4.js";
import {
  computeLinearAuthoritySourceLineageRoot,
  computeLinearAuthoritySourceSetRoot,
  parseLinearAuthoritySourceLineage,
  type LinearAuthoritySourceLineage,
} from "./linear-authority-source-lineage.js";

type Bytes = string | Uint8Array;
type GeneratedCompilerInputName =
  | "source-routing"
  | "risk-routing"
  | "uuid-mapping"
  | "allocation-lock"
  | "source-contract"
  | "dependency-contract"
  | "decision-adjudication"
  | "document-canary-receipt";

export type LinearAuthorityPackagePlanV2 = Omit<
  LinearAuthorityManifest,
  | "schemaVersion"
  | "planRoot"
  | "sourceSetRoot"
  | "liveCaptureRoot"
  | "compilerInputRoot"
  | "semanticRoot"
  | "sourceCoverageRoot"
  | "sourceLineageRoot"
  | "inputs"
  | "sources"
  | "blocks"
  | "coverage"
>;

export interface LinearAuthorityDocumentCanaryMeasurementV2 {
  canaryDocumentId: string;
  canaryContentSha256: string;
  canaryTopologySha256: string;
  measuredAt: string;
  readbackUtf8Bytes: number;
  readbackUtf16CodeUnits: number;
  maxUtf8Bytes: number;
  maxUtf16CodeUnits: number;
}

export interface LinearAuthorityPackageBuilderInputV2 {
  plan: LinearAuthorityPackagePlanV2;
  semanticPlanRaw: Bytes;
  sourceLineageRaw: Bytes;
  requirementBaselineRaw: Bytes;
  featureInventoryRaw: Bytes;
  dispositionRegisterRaw: Bytes;
  sourceChecksumsRaw: Bytes;
  projectScopeRaw: Bytes;
  programScopeRaw: Bytes;
  linearFingerprintRaw: Bytes;
  liveCaptureRaw: Bytes;
  rawDocumentsRaw: Bytes;
  issueDescriptionsRaw: Bytes;
  captureReceiptRaw: Bytes;
  githubExecutionRaw: Bytes;
  recoveryMappingRaw: Bytes;
  publicationRaw: Bytes;
  allocations: readonly LinearTargetAllocation[];
  documentCanary: LinearAuthorityDocumentCanaryMeasurementV2;
}

export interface LinearAuthorityPackageV2 {
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  manifestRaw: string;
  manifestSha256: string;
  compilerInputs: ReadonlyMap<string, Buffer>;
  liveCaptureRaw: string;
  liveCaptureSha256: string;
  allocation: LinearAuthorityAllocation;
  allocationRaw: string;
  allocationSha256: string;
  desiredAuthorityRoot: string;
}

interface EvidencePayload {
  keys: string[];
  rows: unknown[];
}

const DIGEST = /^[a-f0-9]{64}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");
const compare = (left: string, right: string): number => left.localeCompare(right);
const sorted = (values: readonly string[]): string[] => [...values].sort(compare);

function fail(message: string): never {
  throw new Error(`Linear authority package v2: ${message}`);
}

function bytes(value: Bytes): Buffer {
  return typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
}

function utf8(value: Bytes, label: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes(value));
  } catch {
    return fail(`${label} is not valid UTF-8`);
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("canonical payload contains an undefined value");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort(compare).map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(row[key])}`
  ).join(",")}}`;
}

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(`${canonicalJson(value)}\n`, "utf8");
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function byPlanKey<T extends { planKey: string }>(rows: readonly T[]): T[] {
  return [...rows].map(clone).sort((left, right) => compare(left.planKey, right.planKey));
}

function normalizedPlan(input: LinearAuthorityPackagePlanV2): LinearAuthorityPackagePlanV2 {
  return {
    ...clone(input),
    rawDocumentIds: sorted(input.rawDocumentIds),
    requirements: byPlanKey(input.requirements),
    decisions: byPlanKey(input.decisions),
    risks: byPlanKey(input.risks),
    documents: byPlanKey(input.documents),
    references: byPlanKey(input.references),
    nativeRelations: byPlanKey(input.nativeRelations),
    issueDescriptionRepairs: [...input.issueDescriptionRepairs]
      .map(clone)
      .sort((left, right) => compare(left.identifier, right.identifier)),
    nativeCatalog: {
      teams: byPlanKey(input.nativeCatalog.teams),
      users: byPlanKey(input.nativeCatalog.users),
      initiatives: byPlanKey(input.nativeCatalog.initiatives),
      projects: byPlanKey(input.nativeCatalog.projects),
      releasePipelines: byPlanKey(input.nativeCatalog.releasePipelines),
      cycles: byPlanKey(input.nativeCatalog.cycles),
      milestones: byPlanKey(input.nativeCatalog.milestones),
      releases: byPlanKey(input.nativeCatalog.releases),
      states: byPlanKey(input.nativeCatalog.states),
      labels: byPlanKey(input.nativeCatalog.labels),
    },
  };
}

export function computeLinearAuthorityDesiredAuthorityRoot(
  manifest: LinearAuthorityManifest & { schemaVersion: 2 },
): string {
  const managed = (target: LinearAuthorityManifest["requirements"][number]) => ({
    kind: target.kind,
    origin: target.origin,
    planKey: target.planKey,
    title: target.title,
    blockKeys: sorted(target.blockKeys),
    description: target.description,
    descriptionSha256: target.descriptionSha256,
    payloadSha256: target.payloadSha256,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey,
    labelPlanKeys: sorted(target.labelPlanKeys),
    priority: target.priority,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: sorted(target.releasePlanKeys),
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  });
  const document = (target: LinearAuthorityManifest["documents"][number]) => ({
    origin: target.origin,
    planKey: target.planKey,
    role: target.role,
    title: target.title,
    blockKeys: sorted(target.blockKeys),
    content: target.content,
    contentSha256: target.contentSha256,
    attachmentKind: target.attachmentKind,
    attachmentPlanKey: target.attachmentPlanKey,
  });
  return sha256(canonicalBytes({
    schemaVersion: 1,
    workspace: manifest.workspace,
    preCutoverCommit: manifest.preCutoverCommit,
    sourceSetRoot: manifest.sourceSetRoot,
    sourceCoverageRoot: manifest.sourceCoverageRoot,
    sources: manifest.sources,
    blocks: manifest.blocks,
    requirements: manifest.requirements.map(managed),
    decisions: manifest.decisions.map(managed),
    risks: manifest.risks.map(managed),
    documents: manifest.documents.map(document),
    references: manifest.references.map((target) => ({ planKey: target.planKey, title: target.title })),
    nativeRelations: manifest.nativeRelations,
    issueDescriptionRepairs: manifest.issueDescriptionRepairs.map((target) => ({
      identifier: target.identifier,
      desiredDescription: target.desiredDescription,
      desiredDescriptionSha256: target.desiredDescriptionSha256,
      requiresNoNativeRelations: target.requiresNoNativeRelations,
    })),
    nativeSelectors: {
      teams: manifest.nativeCatalog.teams,
      users: manifest.nativeCatalog.users,
      initiatives: manifest.nativeCatalog.initiatives.map((row) => ({
        planKey: row.planKey, id: row.id, name: row.name, ownerId: row.ownerId, status: row.status,
        priority: row.priority, parentInitiativeId: row.parentInitiativeId,
      })),
      projects: manifest.nativeCatalog.projects.map((row) => ({
        planKey: row.planKey, id: row.id, name: row.name, statusId: row.statusId, status: row.status,
        statusType: row.statusType, priority: row.priority, leadId: row.leadId,
        teamPlanKeys: row.teamPlanKeys, initiativePlanKeys: row.initiativePlanKeys,
      })),
      releasePipelines: manifest.nativeCatalog.releasePipelines.map((row) => ({
        planKey: row.planKey, id: row.id, name: row.name, type: row.type, isProduction: row.isProduction,
        teamPlanKeys: row.teamPlanKeys, stages: row.stages,
      })),
      cycles: manifest.nativeCatalog.cycles.map((row) => ({
        planKey: row.planKey, id: row.id, number: row.number, name: row.name,
        teamPlanKey: row.teamPlanKey, inheritedFromId: row.inheritedFromId,
      })),
      milestones: manifest.nativeCatalog.milestones.map((row) => ({
        planKey: row.planKey, id: row.id, name: row.name, status: row.status,
        projectPlanKey: row.projectPlanKey, targetDate: row.targetDate,
      })),
      releases: manifest.nativeCatalog.releases.map((row) => ({
        planKey: row.planKey, id: row.id, name: row.name, version: row.version, commitSha: row.commitSha,
        pipelinePlanKey: row.pipelinePlanKey, stageId: row.stageId, stageName: row.stageName, stageType: row.stageType,
      })),
      states: manifest.nativeCatalog.states,
      labels: manifest.nativeCatalog.labels,
    },
  }));
}

function assertDigest(value: string, label: string): void {
  if (!DIGEST.test(value)) fail(`${label} is not a SHA-256 digest`);
}

function assertSemanticProjection(
  semantic: ValidatedLinearAuthoritySemanticPlanV4,
  lineage: LinearAuthoritySourceLineage,
  plan: LinearAuthorityPackagePlanV2,
): void {
  const bindings = new Map(lineage.targetBindings.map((row) => [row.targetPlanKey, row]));
  if (bindings.size !== lineage.targetBindings.length) fail("source lineage contains duplicate target bindings");
  const expectedRequirementKeys = semantic.plan.requirements.map((row) => `issue:${row.canonicalLegacyId}`);
  const expectedDecisionKeys = semantic.plan.decisions.map((row) => `decision:${row.legacyId}`);
  if (JSON.stringify(sorted(plan.requirements.map((row) => row.planKey))) !== JSON.stringify(sorted(expectedRequirementKeys))) {
    fail("Requirement plan identity coverage differs from semantic plan v4");
  }
  const decisionKeys = new Set(plan.decisions.map((row) => row.planKey));
  if (expectedDecisionKeys.some((key) => !decisionKeys.has(key))) {
    fail("Decision plan omits a semantic plan v4 Decision identity");
  }
  const requirements = new Map(plan.requirements.map((row) => [row.planKey, row]));
  const decisions = new Map(plan.decisions.map((row) => [row.planKey, row]));
  const adoptedRequirements = new Map(
    semantic.plan.adoptedRequirementReconciliation.map((row) => [row.canonicalLegacyId, row]),
  );
  for (const semanticRow of semantic.plan.requirements) {
    const planKey = `issue:${semanticRow.canonicalLegacyId}`;
    const target = requirements.get(planKey)!;
    const binding = bindings.get(planKey);
    if (!binding || binding.semanticRole !== "requirement" || binding.targetLegacyId !== semanticRow.canonicalLegacyId) {
      fail(`${planKey} lacks its exact source-lineage binding`);
    }
    if (
      target.kind !== "requirement" ||
      target.origin !== "source" ||
      target.title !== semanticRow.title ||
      target.description !== semanticRow.description ||
      target.priority !== semanticRow.priority ||
      JSON.stringify(sorted(target.blockKeys)) !== JSON.stringify(sorted(binding.supportSliceKeys))
    ) fail(`${planKey} differs from semantic plan v4 or source lineage`);
    const adopted = adoptedRequirements.get(semanticRow.canonicalLegacyId);
    if (adopted) {
      if (
        target.expectedCurrentIssueUuid !== adopted.issueUuid ||
        target.expectedIdentifier !== adopted.issueIdentifier ||
        target.expectedCurrentDescriptionSha256 === null ||
        target.expectedCurrentNativeSha256 === null
      ) fail(`${planKey} differs from its adopted reconciliation identity`);
    } else if (
      target.expectedCurrentIssueUuid !== null ||
      target.expectedIdentifier !== null ||
      target.expectedCurrentDescriptionSha256 !== null ||
      target.expectedCurrentNativeSha256 !== null
    ) fail(`${planKey} invents an adopted reconciliation identity`);
  }
  for (const semanticRow of semantic.plan.decisions) {
    const planKey = `decision:${semanticRow.legacyId}`;
    const target = decisions.get(planKey)!;
    const binding = bindings.get(planKey);
    const retired = semanticRow.disposition === "retired_source";
    if (
      !binding ||
      binding.semanticRole !== "decision" ||
      binding.targetLegacyId !== semanticRow.legacyId ||
      binding.disposition !== semanticRow.disposition
    ) fail(`${planKey} lacks its exact source-lineage binding`);
    if (
      target.kind !== "decision" ||
      target.origin !== (retired ? "retired_source_disposition" : "source") ||
      target.title !== semanticRow.title ||
      target.description !== semanticRow.description ||
      target.priority !== semanticRow.priority ||
      JSON.stringify(sorted(target.blockKeys)) !== JSON.stringify(sorted(binding.supportSliceKeys))
    ) fail(`${planKey} differs from semantic plan v4 or source lineage`);
  }
}

function assertLineageBindings(
  input: LinearAuthorityPackageBuilderInputV2,
  semantic: ValidatedLinearAuthoritySemanticPlanV4,
  lineage: LinearAuthoritySourceLineage,
): void {
  const semanticBytes = bytes(input.semanticPlanRaw);
  const featureInventoryBytes = bytes(input.featureInventoryRaw);
  const dispositionBytes = bytes(input.dispositionRegisterRaw);
  const sourceChecksumsBytes = bytes(input.sourceChecksumsRaw);
  const authority = lineage.authority;
  if (
    authority.workspaceId !== input.plan.workspace.id ||
    authority.sourceCommit !== input.plan.sourceCommit ||
    authority.semanticPlanSha256 !== sha256(semanticBytes) ||
    authority.semanticRoot !== semantic.semanticRoot ||
    authority.featureInventorySha256 !== sha256(featureInventoryBytes) ||
    lineage.dispositionsSha256 !== sha256(dispositionBytes) ||
    lineage.sourceChecksumsSha256 !== sha256(sourceChecksumsBytes)
  ) fail("source lineage authority bindings differ from supplied compiler inputs");
  const sourceSetRoot = computeLinearAuthoritySourceSetRoot(lineage.sources);
  if (authority.sourceSetRoot !== sourceSetRoot) fail("source lineage source-set root differs from its sources");
  const { sourceLineageRoot: _sourceLineageRoot, ...withoutRoot } = lineage;
  if (computeLinearAuthoritySourceLineageRoot(withoutRoot) !== lineage.sourceLineageRoot) {
    fail("source lineage root is invalid");
  }
  if (
    lineage.unresolved.length !== 0 ||
    lineage.sourcePartitionValidated !== true ||
    lineage.sourceExtractionCoverageValidated !== true ||
    lineage.semanticPlanInternalsValidated !== true ||
    lineage.captureEvidenceValidated !== true ||
    semantic.captureEvidenceValidated !== true ||
    lineage.semanticCoverageValidated !== false ||
    lineage.mutationAuthorized !== false
  ) fail("source lineage is incomplete or overclaims mutation authority");
}

function assertSemanticCaptureEvidence(
  input: LinearAuthorityPackageBuilderInputV2,
  semantic: ValidatedLinearAuthoritySemanticPlanV4,
): void {
  const evidence = semantic.plan.captureEvidence;
  if (
    evidence.mode !== "capture" ||
    evidence.captureEvidenceValidated !== true ||
    evidence.fingerprintSha256 !== sha256(bytes(input.linearFingerprintRaw)) ||
    evidence.descriptionCaptureSha256 !== sha256(bytes(input.issueDescriptionsRaw)) ||
    evidence.recoveryMappingSha256 !== sha256(bytes(input.recoveryMappingRaw)) ||
    evidence.publicationSha256 !== sha256(bytes(input.publicationRaw))
  ) fail("semantic capture evidence differs from supplied bytes");
}

function targetPayload(manifest: LinearAuthorityManifest): EvidencePayload {
  const rows = [
    ...manifest.requirements.map((target) => ({ family: "requirements", target })),
    ...manifest.decisions.map((target) => ({ family: "decisions", target })),
    ...manifest.risks.map((target) => ({ family: "risks", target })),
    ...manifest.documents.map((target) => ({ family: "documents", target })),
    ...manifest.references.map((target) => ({ family: "references", target })),
  ].sort((left, right) => compare(left.target.planKey, right.target.planKey));
  return { keys: rows.map((row) => row.target.planKey), rows };
}

function evidencePayloads(manifest: LinearAuthorityManifest): ReadonlyMap<string, EvidencePayload> {
  return new Map([
    ["source-routing", {
      keys: sorted(manifest.blocks.map((row) => row.key)),
      rows: [...manifest.blocks].sort((left, right) => compare(left.key, right.key)),
    }],
    ["risk-routing", {
      keys: sorted(manifest.risks.map((row) => row.planKey)),
      rows: byPlanKey(manifest.risks),
    }],
    ["source-contract", {
      keys: sorted(manifest.sources.map((row) => row.path)),
      rows: [...manifest.sources].sort((left, right) => compare(left.path, right.path)),
    }],
    ["dependency-contract", {
      keys: sorted(manifest.nativeRelations.map((row) => row.planKey)),
      rows: byPlanKey(manifest.nativeRelations),
    }],
    ["decision-adjudication", {
      keys: sorted(manifest.decisions.map((row) => row.planKey)),
      rows: byPlanKey(manifest.decisions),
    }],
  ]);
}

function compilerEvidence(
  name: string,
  manifest: LinearAuthorityManifest,
  payload: EvidencePayload,
): Buffer {
  return canonicalBytes({
    schemaVersion: 1,
    kind: "compiler-evidence",
    evidenceKind: name,
    workspaceId: manifest.workspace.id,
    sourceCommit: manifest.sourceCommit,
    sourceSetRoot: manifest.sourceSetRoot,
    planRoot: manifest.planRoot,
    complete: true,
    payloadKeys: sorted(payload.keys),
    payloadRoot: sha256(canonicalJson(payload.rows)),
  });
}

function allTargetRows(manifest: LinearAuthorityManifest): Array<{
  planKey: string;
  kind: LinearTargetAllocation["kind"];
  title: string | null;
}> {
  return [
    ...manifest.requirements.map((row) => ({ planKey: row.planKey, kind: "issue" as const, title: row.title })),
    ...manifest.decisions.map((row) => ({ planKey: row.planKey, kind: "decision" as const, title: row.title })),
    ...manifest.risks.map((row) => ({ planKey: row.planKey, kind: "risk" as const, title: row.title })),
    ...manifest.documents.map((row) => ({ planKey: row.planKey, kind: "document" as const, title: row.title })),
    ...manifest.references.map((row) => ({ planKey: row.planKey, kind: "relation_target" as const, title: row.title })),
    ...manifest.nativeRelations.map((row) => ({ planKey: row.planKey, kind: "relation" as const, title: null })),
  ].sort((left, right) => compare(left.planKey, right.planKey));
}

function validateAndSortAllocations(
  allocations: readonly LinearTargetAllocation[],
  manifest: LinearAuthorityManifest,
): LinearTargetAllocation[] {
  const targets = allTargetRows(manifest);
  const targetByKey = new Map(targets.map((row) => [row.planKey, row]));
  const seenKeys = new Set<string>();
  const seenUuids = new Set<string>();
  const rows = [...allocations].map(clone).sort((left, right) => compare(left.planKey, right.planKey));
  for (const row of rows) {
    const expected = targetByKey.get(row.planKey);
    if (!expected || row.kind !== expected.kind || row.title !== expected.title) {
      fail(`allocation ${row.planKey} does not match an exact authority target`);
    }
    if (seenKeys.has(row.planKey)) fail(`allocation ${row.planKey} is duplicated`);
    if (!UUID_V4.test(row.uuid) || seenUuids.has(row.uuid.toLowerCase())) {
      fail(`allocation ${row.planKey} has an invalid or duplicate UUIDv4`);
    }
    if (row.source !== "adopted" && row.source !== "allocated") fail(`allocation ${row.planKey} source is invalid`);
    if (row.source === "allocated" && row.identifier !== null) fail(`allocated target ${row.planKey} declares a Linear identifier`);
    seenKeys.add(row.planKey);
    seenUuids.add(row.uuid.toLowerCase());
  }
  if (JSON.stringify(rows.map((row) => row.planKey)) !== JSON.stringify(targets.map((row) => row.planKey))) {
    fail("allocation coverage differs from the exact authority target set");
  }
  return rows;
}

function compilerInputRoot(rows: LinearAuthorityManifest["inputs"]): string {
  return sha256([...rows]
    .sort((left, right) => compare(left.name, right.name))
    .map((row) => `${row.name}\0${row.byteLength}\0${row.sha256}`)
    .join("\n"));
}

function liveCaptureRoot(rows: LinearAuthorityManifest["inputs"]): string {
  const names = new Set([
    "linear-fingerprint",
    "native-identity",
    "raw-documents",
    "issue-descriptions",
    "capture-receipt",
    "github-execution",
  ]);
  return sha256(rows
    .filter((row) => names.has(row.name))
    .sort((left, right) => compare(left.name, right.name))
    .map((row) => `${row.name}\0${row.byteLength}\0${row.sha256}`)
    .join("\n"));
}

function coverage(manifest: LinearAuthorityManifest): LinearAuthorityManifest["coverage"] {
  const relationPlanKeys = sorted(manifest.nativeRelations.map((row) => row.planKey));
  return {
    complete: true,
    inputNames: sorted(manifest.inputs.map((row) => row.name)),
    sourcePaths: sorted(manifest.sources.map((row) => row.path)),
    blockKeys: sorted(manifest.blocks.map((row) => row.key)),
    targetPlanKeys: sorted(allTargetRows(manifest).map((row) => row.planKey)),
    relationPlanKeys,
    targetFamilies: {
      requirements: sorted(manifest.requirements.map((row) => row.planKey)),
      decisions: sorted(manifest.decisions.map((row) => row.planKey)),
      risks: sorted(manifest.risks.map((row) => row.planKey)),
      documents: sorted(manifest.documents.map((row) => row.planKey)),
      references: sorted(manifest.references.map((row) => row.planKey)),
      relations: relationPlanKeys,
    },
  };
}

export function buildLinearAuthorityPackageV2(
  input: LinearAuthorityPackageBuilderInputV2,
): LinearAuthorityPackageV2 {
  const semantic = parseLinearAuthoritySemanticPlanV4(input.semanticPlanRaw);
  const parsedLineage = parseLinearAuthoritySourceLineage(input.sourceLineageRaw);
  const plan = normalizedPlan(input.plan);
  assertSemanticCaptureEvidence(input, semantic);
  assertLineageBindings(input, semantic, parsedLineage);
  assertSemanticProjection(semantic, parsedLineage, plan);

  const manifest: LinearAuthorityManifest & { schemaVersion: 2 } = {
    schemaVersion: 2,
    ...plan,
    planRoot: sha256("pending-plan-root"),
    sourceSetRoot: parsedLineage.authority.sourceSetRoot,
    liveCaptureRoot: sha256("pending-live-capture-root"),
    compilerInputRoot: sha256("pending-compiler-input-root"),
    semanticRoot: semantic.semanticRoot,
    sourceCoverageRoot: parsedLineage.sourceCoverageRoot,
    sourceLineageRoot: parsedLineage.sourceLineageRoot,
    inputs: [],
    sources: [...parsedLineage.sources].map(clone).sort((left, right) => compare(left.path, right.path)),
    blocks: [...parsedLineage.sourceSlices].map(clone).sort((left, right) => compare(left.key, right.key)),
    coverage: {
      complete: true,
      inputNames: [], sourcePaths: [], blockKeys: [], targetPlanKeys: [], relationPlanKeys: [],
      targetFamilies: { requirements: [], decisions: [], risks: [], documents: [], references: [], relations: [] },
    },
  };
  manifest.planRoot = computeLinearAuthorityPlanRoot(manifest);

  const lineage = clone(parsedLineage);
  lineage.authority.planRoot = manifest.planRoot;
  const { sourceLineageRoot: _lineageRoot, ...lineageWithoutRoot } = lineage;
  if (computeLinearAuthoritySourceLineageRoot(lineageWithoutRoot) !== lineage.sourceLineageRoot) {
    fail("binding the plan root changed the cycle-free source-lineage root");
  }

  const compilerInputs = new Map<string, Buffer>([
    ["source-lineage", canonicalBytes(lineage)],
    ["semantic-plan", bytes(input.semanticPlanRaw)],
    ["requirement-baseline", bytes(input.requirementBaselineRaw)],
    ["requirement-recovery-mapping", bytes(input.recoveryMappingRaw)],
    ["requirement-publication", bytes(input.publicationRaw)],
    ["feature-inventory", bytes(input.featureInventoryRaw)],
    ["disposition-register", bytes(input.dispositionRegisterRaw)],
    ["source-checksums", bytes(input.sourceChecksumsRaw)],
    ["linear-fingerprint", bytes(input.linearFingerprintRaw)],
    ["raw-documents", bytes(input.rawDocumentsRaw)],
    ["issue-descriptions", bytes(input.issueDescriptionsRaw)],
    ["capture-receipt", bytes(input.captureReceiptRaw)],
    ["github-execution", bytes(input.githubExecutionRaw)],
    ["project-scope", bytes(input.projectScopeRaw)],
    ["program-scope", bytes(input.programScopeRaw)],
  ]);
  const liveCaptureBytes = bytes(input.liveCaptureRaw);
  const initialInputRows = [
    ...compilerInputs.entries(),
    ["native-identity", liveCaptureBytes] as const,
  ].map(([name, value]) => ({
    name: name as LinearAuthorityCompilerInputName,
    byteLength: value.length,
    sha256: sha256(value),
  }));
  manifest.liveCaptureRoot = liveCaptureRoot(initialInputRows);

  const allocationRows = validateAndSortAllocations(input.allocations, manifest);
  const allocation: LinearAuthorityAllocation = {
    schemaVersion: 1,
    planRoot: manifest.planRoot,
    sourceSetRoot: manifest.sourceSetRoot,
    liveCaptureRoot: manifest.liveCaptureRoot,
    allocations: allocationRows,
  };
  const allocationBytes = canonicalBytes(allocation);
  const allocationSha256 = sha256(allocationBytes);
  const allocationRowsRoot = sha256(canonicalJson(allocationRows));

  for (const [name, payload] of evidencePayloads(manifest)) {
    compilerInputs.set(name, compilerEvidence(name, manifest, payload));
  }
  const target = targetPayload(manifest);
  const relationRows = manifest.nativeRelations.map((row) => ({ family: "relations", target: row }));
  const targetPlanKeys = sorted([...target.keys, ...manifest.nativeRelations.map((row) => row.planKey)]);
  compilerInputs.set("allocation-lock", canonicalBytes({
    schemaVersion: 1,
    kind: "allocation-lock",
    workspaceId: manifest.workspace.id,
    sourceCommit: manifest.sourceCommit,
    sourceSetRoot: manifest.sourceSetRoot,
    liveCaptureRoot: manifest.liveCaptureRoot,
    planRoot: manifest.planRoot,
    allocationSha256,
    allocationRowsRoot,
    complete: true,
    targetPlanKeys,
    targetPayloadRoot: sha256(canonicalJson([...target.rows, ...relationRows])),
  }));
  compilerInputs.set("uuid-mapping", canonicalBytes({
    schemaVersion: 1,
    kind: "uuid-mapping",
    workspaceId: manifest.workspace.id,
    sourceCommit: manifest.sourceCommit,
    sourceSetRoot: manifest.sourceSetRoot,
    liveCaptureRoot: manifest.liveCaptureRoot,
    planRoot: manifest.planRoot,
    allocationSha256,
    allocationRowsRoot,
    complete: true,
    targetPlanKeys,
  }));
  const canary = input.documentCanary;
  for (const [value, label] of [
    [canary.canaryContentSha256, "canary content"],
    [canary.canaryTopologySha256, "canary topology"],
  ] as const) assertDigest(value, label);
  if (!UUID_V4.test(canary.canaryDocumentId)) fail("document canary ID is not a UUIDv4");
  for (const [value, label] of [
    [canary.readbackUtf8Bytes, "canary UTF-8 bytes"],
    [canary.readbackUtf16CodeUnits, "canary UTF-16 code units"],
    [canary.maxUtf8Bytes, "canary maximum UTF-8 bytes"],
    [canary.maxUtf16CodeUnits, "canary maximum UTF-16 code units"],
  ] as const) if (!Number.isInteger(value) || value < 1) fail(`${label} is invalid`);
  compilerInputs.set("document-canary-receipt", canonicalBytes({
    schemaVersion: 1,
    kind: "document-canary-measurement",
    workspaceId: manifest.workspace.id,
    sourceCommit: manifest.sourceCommit,
    liveCaptureRoot: manifest.liveCaptureRoot,
    planRoot: manifest.planRoot,
    ...canary,
  }));

  const expectedCompilerNames = new Set<string>(LINEAR_AUTHORITY_COMPILER_INPUT_NAMES_V2);
  const actualCompilerNames = new Set([...compilerInputs.keys(), "native-identity"]);
  if (
    actualCompilerNames.size !== expectedCompilerNames.size ||
    [...actualCompilerNames].some((name) => !expectedCompilerNames.has(name))
  ) fail("compiler input coverage differs from schema v2");
  manifest.inputs = LINEAR_AUTHORITY_COMPILER_INPUT_NAMES_V2.map((name) => {
    const value = name === "native-identity" ? liveCaptureBytes : compilerInputs.get(name);
    if (!value) fail(`compiler input ${name} is missing`);
    return { name, byteLength: value.length, sha256: sha256(value) };
  });
  manifest.compilerInputRoot = compilerInputRoot(manifest.inputs);
  manifest.coverage = coverage(manifest);
  if (computeLinearAuthorityPlanRoot(manifest) !== manifest.planRoot) {
    fail("final manifest plan root changed during package assembly");
  }
  const manifestBytes = canonicalBytes(manifest);
  return {
    manifest,
    manifestRaw: manifestBytes.toString("utf8"),
    manifestSha256: sha256(manifestBytes),
    compilerInputs,
    liveCaptureRaw: utf8(liveCaptureBytes, "native identity capture"),
    liveCaptureSha256: sha256(liveCaptureBytes),
    allocation,
    allocationRaw: allocationBytes.toString("utf8"),
    allocationSha256,
    desiredAuthorityRoot: computeLinearAuthorityDesiredAuthorityRoot(manifest),
  };
}

export const LINEAR_AUTHORITY_GENERATED_COMPILER_INPUT_NAMES_V2: readonly GeneratedCompilerInputName[] = [
  "source-routing",
  "risk-routing",
  "uuid-mapping",
  "allocation-lock",
  "source-contract",
  "dependency-contract",
  "decision-adjudication",
  "document-canary-receipt",
];
