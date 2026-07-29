import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DIGEST = /^[a-f0-9]{64}$/;
const GIT_COMMIT = /^[a-f0-9]{40}$/;
const ISSUE_IDENTIFIER = /^REQ-[1-9]\d*$/;
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TARGET_PLAN_KEY = "decision:DEC-PROD-001";
const SOURCE_DECISION_ID = "DEC-PROD-001";
const TARGET_TITLE = "Production staging and promotion remain fail-closed";
const TARGET_TEAM_PLAN_KEY = "team:requirements";
const TARGET_PROJECT_NAME = "QA, Release, Deployment & Launch";
const TARGET_ASSIGNEE_NAME = "Blake Rowley";
const TARGET_STATE_NAME = "Approved";
const TARGET_STATE_TYPE = "completed";
const TARGET_LABEL_PLAN_KEY = "label:decision";
const TARGET_RELATION_PLAN_KEY =
  "relation:related:decision:DEC-PROD-001:risk:RISK-010";
const TARGET_RISK_PLAN_KEY = "risk:RISK-010";

type JsonRecord = Record<string, unknown>;

export type ProductionDecisionSourceProvenance = {
  decisionId: string;
  decisionLedgerSha256: string;
  masterSpecSha256: string;
};

export type ProductionDecisionAuthorityPublicationEvidence = {
  allocationRaw: string;
  decisionLedgerRaw: string;
  finalCaptureReceiptRaw: string;
  finalDocumentsRaw: string;
  finalFingerprintRaw: string;
  finalIssueDescriptionsRaw: string;
  finalManifestRaw: string;
  finalNativeIdentityRaw: string;
  finalReadbackReceiptRaw: string;
  masterSpecRaw: string;
  publisherAllocationRaw: string;
  publisherCaptureReceiptRaw: string;
  publisherDocumentsRaw: string;
  publisherFingerprintRaw: string;
  publisherIssueDescriptionsRaw: string;
  publisherManifestRaw: string;
  publisherNativeIdentityRaw: string;
  publisherOperationsRaw: string;
  publisherReceiptRaw: string;
};

type PublisherReceipt = {
  schemaVersion: 1;
  event: "linear_authority_publisher_receipt";
  mode: "apply" | "dry-run";
  status: "applied" | "validated_dry_run";
  sourceCommit: string;
  workspaceId: string;
  manifestSha256: string;
  allocationSha256: string;
  allocationRowsRoot: string;
  operationsSha256: string;
  captureReceiptSha256: string;
  planRoot: string;
  semanticRoot: string;
  sourceSetRoot: string;
  compilerInputRoot: string;
  liveCaptureRoot: string;
  programRoot: string;
  masterSpecRoot: string;
  operationCount: number;
  applied: number;
  alreadyApplied: number;
  httpAttempts: number;
  journalSha256: string;
};

export type ProductionDecisionAuthorityHandoff = {
  schemaVersion: 2;
  event: "linear_production_decision_authority_handoff";
  result: "verified_final_readback";
  planKey: "decision:DEC-PROD-001";
  sourceDecisionId: "DEC-PROD-001";
  sourceCommit: string;
  workspace: { id: string; name: string; urlKey: string };
  roots: {
    publicationPlan: string;
    finalPlan: string;
    semantic: string;
    sourceSet: string;
    compilerInput: string;
    publicationCapture: string;
    finalCapture: string;
    publicationProgram: string;
    finalProgram: string;
    masterSpec: string;
  };
  receipts: {
    publisher: {
      sha256: string;
      manifestSha256: string;
      allocationSha256: string;
      allocationRowsRoot: string;
    };
    finalReadback: {
      sha256: string;
      captureReceiptSha256: string;
      manifestSha256: string;
      allocationSha256: string;
      allocationRowsRoot: string;
    };
  };
  decision: {
    issueUuid: string;
    identifier: string;
    title: string;
    body: string;
    bodySha256: string;
    team: { id: string; key: "REQ"; name: "Requirements" };
    project: { id: string; name: "QA, Release, Deployment & Launch" };
    assignee: { id: string; name: "Blake Rowley" };
    priority: 1;
    state: { id: string; name: "Approved"; type: "completed" };
    label: {
      id: string;
      name: "decision";
      groupId: string;
      groupName: "Type";
    };
    relations: Array<{
      planKey: string;
      relationUuid: string;
      type: "related";
      sourcePlanKey: string;
      targetPlanKey: string;
      sourceIssueUuid: string;
      sourceIdentifier: string;
      targetIssueUuid: string;
      targetIdentifier: string;
      canonicalKey: string;
    }>;
  };
};

export type ProductionDecisionAuthorityPin = {
  sourceProvenance: ProductionDecisionSourceProvenance;
};

export type ResolvedProductionDecisionAuthority = {
  handoff: null;
  status: "pending_guarded_handoff";
};

const FORBIDDEN_REPOSITORY_HANDOFF_PATH =
  "delivery/production-decision-authority.json";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error("authority evidence contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function parse(raw: string, context: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`${context} is invalid JSON`);
  }
}

function record(value: unknown, context: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  return value as JsonRecord;
}

function exactKeys(value: JsonRecord, expected: readonly string[], context: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${context} has unexpected fields`);
  }
}

function string(value: unknown, context: string) {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new Error(`${context} is invalid`);
  }
  return value;
}

function uuid(value: unknown, context: string) {
  const parsed = string(value, context).toLowerCase();
  if (!UUID_V4.test(parsed)) throw new Error(`${context} is not a UUIDv4`);
  return parsed;
}

function digest(value: unknown, context: string) {
  const parsed = string(value, context);
  if (!DIGEST.test(parsed)) throw new Error(`${context} is invalid`);
  return parsed;
}

function integer(value: unknown, context: string) {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new Error(`${context} is invalid`);
  }
  return Number(value);
}

function array(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${context} is invalid`);
  return value;
}

function one<T>(rows: T[], context: string): T {
  if (rows.length !== 1) throw new Error(`${context} must resolve exactly once`);
  return rows[0]!;
}

function publisherReceipt(raw: string, context: string): PublisherReceipt {
  const receipt = record(parse(raw, context), context);
  exactKeys(receipt, [
    "schemaVersion", "event", "mode", "status", "sourceCommit", "workspaceId",
    "manifestSha256", "allocationSha256", "allocationRowsRoot", "operationsSha256",
    "captureReceiptSha256", "planRoot", "semanticRoot", "sourceSetRoot",
    "compilerInputRoot", "liveCaptureRoot", "programRoot", "masterSpecRoot",
    "operationCount", "applied", "alreadyApplied", "httpAttempts", "journalSha256",
  ], context);
  const mode = receipt.mode;
  const status = receipt.status;
  const operationCount = integer(receipt.operationCount, `${context} operation count`);
  const applied = integer(receipt.applied, `${context} applied count`);
  const alreadyApplied = integer(receipt.alreadyApplied, `${context} already-applied count`);
  const httpAttempts = integer(receipt.httpAttempts, `${context} HTTP attempt count`);
  if (
    receipt.schemaVersion !== 1 ||
    receipt.event !== "linear_authority_publisher_receipt" ||
    !((mode === "apply" && status === "applied") ||
      (mode === "dry-run" && status === "validated_dry_run")) ||
    typeof receipt.sourceCommit !== "string" ||
    !GIT_COMMIT.test(receipt.sourceCommit) ||
    applied + alreadyApplied !== (mode === "apply" ? operationCount : 0) ||
    (mode === "dry-run" && (operationCount !== 0 || httpAttempts !== 0))
  ) {
    throw new Error(`${context} contract is invalid`);
  }
  return {
    schemaVersion: 1,
    event: "linear_authority_publisher_receipt",
    mode,
    status,
    sourceCommit: receipt.sourceCommit,
    workspaceId: uuid(receipt.workspaceId, `${context} workspace ID`),
    manifestSha256: digest(receipt.manifestSha256, `${context} manifest digest`),
    allocationSha256: digest(receipt.allocationSha256, `${context} allocation digest`),
    allocationRowsRoot: digest(receipt.allocationRowsRoot, `${context} allocation rows root`),
    operationsSha256: digest(receipt.operationsSha256, `${context} operations digest`),
    captureReceiptSha256: digest(receipt.captureReceiptSha256, `${context} capture receipt digest`),
    planRoot: digest(receipt.planRoot, `${context} plan root`),
    semanticRoot: digest(receipt.semanticRoot, `${context} semantic root`),
    sourceSetRoot: digest(receipt.sourceSetRoot, `${context} source-set root`),
    compilerInputRoot: digest(receipt.compilerInputRoot, `${context} compiler-input root`),
    liveCaptureRoot: digest(receipt.liveCaptureRoot, `${context} live-capture root`),
    programRoot: digest(receipt.programRoot, `${context} program root`),
    masterSpecRoot: digest(receipt.masterSpecRoot, `${context} Master root`),
    operationCount,
    applied,
    alreadyApplied,
    httpAttempts,
    journalSha256: digest(receipt.journalSha256, `${context} journal digest`),
  };
}

function sourceDecision(raw: string) {
  const rows = raw.split("\n").filter(Boolean).map((line, index) => {
    const row = record(parse(line, `Decision ledger line ${index + 1}`), `Decision ledger line ${index + 1}`);
    return row;
  });
  const row = one(rows.filter((candidate) => candidate.id === SOURCE_DECISION_ID), SOURCE_DECISION_ID);
  if (row.status !== "active") throw new Error(`${SOURCE_DECISION_ID} is not active`);
  const decision = string(row.decision, `${SOURCE_DECISION_ID} decision`);
  const assumption = string(row.assumption, `${SOURCE_DECISION_ID} assumption`);
  const validationTrigger = string(row.validationTrigger, `${SOURCE_DECISION_ID} re-evaluation trigger`);
  return [
    "## Decision", "", decision, "", "## Assumption", "", assumption,
    "", "## Re-evaluate", "", validationTrigger,
  ].join("\n");
}

function allocationRowsRoot(rows: unknown[]) {
  return sha256(canonicalJson([...rows].sort((left, right) => {
    const leftKey = String(record(left, "allocation row").planKey ?? "");
    const rightKey = String(record(right, "allocation row").planKey ?? "");
    return leftKey.localeCompare(rightKey);
  })));
}

function assertManifestInput(
  manifest: JsonRecord,
  name: string,
  raw: string,
  context: string,
) {
  const input = one(
    array(manifest.inputs, `${context} inputs`)
      .map((value) => record(value, `${context} input`))
      .filter((row) => row.name === name),
    `${context} ${name} input`,
  );
  if (input.sha256 !== sha256(raw) || input.byteLength !== Buffer.byteLength(raw)) {
    throw new Error(`${context} ${name} input binding differs from supplied evidence`);
  }
}

function nativeIssueSha(issue: JsonRecord) {
  return sha256(JSON.stringify({
    teamId: issue.teamId,
    stateId: issue.stateId,
    projectId: issue.projectId,
    estimate: issue.estimate,
    priority: issue.priority,
    dueDate: issue.dueDate,
    cycleId: issue.cycleId,
    milestoneId: issue.milestoneId,
    releaseIds: [...array(issue.releaseIds, "native issue releases")].sort(),
    parentIssueUuid: issue.parentIssueUuid,
    assigneeId: issue.assigneeId,
    labelIds: [...array(issue.labelIds, "native issue labels")].sort(),
  }));
}

function assertCaptureReceipt(input: {
  raw: string;
  fingerprintRaw: string;
  nativeRaw: string;
  documentsRaw: string;
  descriptionsRaw: string;
  sourceCommit: string;
}) {
  const receipt = record(parse(input.raw, "final capture receipt"), "final capture receipt");
  exactKeys(receipt, [
    "schemaVersion", "captureMode", "capturedAt", "fingerprintSha256",
    "acceptedFingerprintSha256", "artifactSha256s", "source",
  ], "final capture receipt");
  const artifacts = record(receipt.artifactSha256s, "final capture artifact hashes");
  exactKeys(artifacts, ["fingerprint", "nativeIdentity", "documents", "issueDescriptions"], "final capture artifact hashes");
  const source = record(receipt.source, "final capture source");
  exactKeys(source, ["repository", "commit", "ref", "runId", "runAttempt"], "final capture source");
  const capturedAt = string(receipt.capturedAt, "final capture timestamp");
  if (
    receipt.schemaVersion !== 2 ||
    receipt.captureMode !== "live" ||
    Number.isNaN(Date.parse(capturedAt)) ||
    new Date(capturedAt).toISOString() !== capturedAt ||
    receipt.fingerprintSha256 !== sha256(input.fingerprintRaw) ||
    receipt.acceptedFingerprintSha256 !== sha256(input.fingerprintRaw) ||
    artifacts.fingerprint !== sha256(input.fingerprintRaw) ||
    artifacts.nativeIdentity !== sha256(input.nativeRaw) ||
    artifacts.documents !== sha256(input.documentsRaw) ||
    artifacts.issueDescriptions !== sha256(input.descriptionsRaw) ||
    source.repository !== "meetblakey/sourcera" ||
    source.commit !== input.sourceCommit ||
    source.ref !== "refs/heads/main" ||
    typeof source.runId !== "string" || !/^[1-9]\d*$/.test(source.runId) ||
    typeof source.runAttempt !== "string" || !/^[1-9]\d*$/.test(source.runAttempt)
  ) {
    throw new Error("final capture receipt does not bind the exact final readback");
  }
  return capturedAt;
}

export function createProductionDecisionAuthorityHandoff(
  evidence: ProductionDecisionAuthorityPublicationEvidence,
): ProductionDecisionAuthorityHandoff {
  const publisher = publisherReceipt(evidence.publisherReceiptRaw, "publisher receipt");
  const finalReceipt = publisherReceipt(evidence.finalReadbackReceiptRaw, "final-readback publisher receipt");
  if (publisher.mode !== "apply" || finalReceipt.mode !== "dry-run") {
    throw new Error("publisher receipt phases are invalid");
  }
  const publisherManifest = record(
    parse(evidence.publisherManifestRaw, "publisher authority manifest"),
    "publisher authority manifest",
  );
  const publisherAllocation = record(
    parse(evidence.publisherAllocationRaw, "publisher authority allocation"),
    "publisher authority allocation",
  );
  const publisherOperations = record(
    parse(evidence.publisherOperationsRaw, "publisher authority operations"),
    "publisher authority operations",
  );
  const manifest = record(parse(evidence.finalManifestRaw, "final authority manifest"), "final authority manifest");
  const allocation = record(parse(evidence.allocationRaw, "final authority allocation"), "final authority allocation");
  if (
    publisherManifest.schemaVersion !== 2 ||
    publisherAllocation.schemaVersion !== 1 ||
    manifest.schemaVersion !== 2 ||
    allocation.schemaVersion !== 1
  ) {
    throw new Error("publisher or final authority manifest/allocation schema is invalid");
  }
  const sourceCommit = string(manifest.sourceCommit, "final authority source commit");
  if (!GIT_COMMIT.test(sourceCommit)) throw new Error("final authority source commit is invalid");
  const workspace = record(manifest.workspace, "final authority workspace");
  const workspaceId = uuid(workspace.id, "final authority workspace ID");
  const workspaceName = string(workspace.name, "final authority workspace name");
  const workspaceUrlKey = string(workspace.urlKey, "final authority workspace URL key");
  const planRoot = digest(manifest.planRoot, "final authority plan root");
  const semanticRoot = digest(manifest.semanticRoot, "final authority semantic root");
  const sourceSetRoot = digest(manifest.sourceSetRoot, "final authority source-set root");
  const compilerInputRoot = digest(manifest.compilerInputRoot, "final authority compiler-input root");
  const liveCaptureRoot = digest(manifest.liveCaptureRoot, "final authority capture root");
  const allocations = array(allocation.allocations, "final authority allocations");
  const finalAllocationRowsRoot = allocationRowsRoot(allocations);
  if (
    allocation.planRoot !== planRoot ||
    allocation.sourceSetRoot !== sourceSetRoot ||
    allocation.liveCaptureRoot !== liveCaptureRoot ||
    finalReceipt.sourceCommit !== sourceCommit ||
    finalReceipt.workspaceId !== workspaceId ||
    finalReceipt.manifestSha256 !== sha256(evidence.finalManifestRaw) ||
    finalReceipt.allocationSha256 !== sha256(evidence.allocationRaw) ||
    finalReceipt.allocationRowsRoot !== finalAllocationRowsRoot ||
    finalReceipt.captureReceiptSha256 !== sha256(evidence.finalCaptureReceiptRaw) ||
    finalReceipt.planRoot !== planRoot ||
    finalReceipt.semanticRoot !== semanticRoot ||
    finalReceipt.sourceSetRoot !== sourceSetRoot ||
    finalReceipt.compilerInputRoot !== compilerInputRoot ||
    finalReceipt.liveCaptureRoot !== liveCaptureRoot
  ) {
    throw new Error("final-readback receipt roots differ from the unified authority package");
  }
  const publisherSourceCommit = string(
    publisherManifest.sourceCommit,
    "publisher authority source commit",
  );
  const publisherWorkspace = record(
    publisherManifest.workspace,
    "publisher authority workspace",
  );
  const publisherWorkspaceId = uuid(
    publisherWorkspace.id,
    "publisher authority workspace ID",
  );
  const publisherPlanRoot = digest(
    publisherManifest.planRoot,
    "publisher authority plan root",
  );
  const publisherSemanticRoot = digest(
    publisherManifest.semanticRoot,
    "publisher authority semantic root",
  );
  const publisherSourceSetRoot = digest(
    publisherManifest.sourceSetRoot,
    "publisher authority source-set root",
  );
  const publisherCompilerInputRoot = digest(
    publisherManifest.compilerInputRoot,
    "publisher authority compiler-input root",
  );
  const publisherLiveCaptureRoot = digest(
    publisherManifest.liveCaptureRoot,
    "publisher authority capture root",
  );
  const publisherAllocations = array(
    publisherAllocation.allocations,
    "publisher authority allocations",
  );
  const publisherAllocationRowsRoot = allocationRowsRoot(publisherAllocations);
  const publisherOperationRows = array(
    publisherOperations.operations,
    "publisher authority operations",
  );
  if (
    !GIT_COMMIT.test(publisherSourceCommit) ||
    publisherSourceCommit !== sourceCommit ||
    publisherWorkspaceId !== workspaceId ||
    publisherWorkspace.name !== workspaceName ||
    publisherWorkspace.urlKey !== workspaceUrlKey ||
    publisherAllocation.planRoot !== publisherPlanRoot ||
    publisherAllocation.sourceSetRoot !== publisherSourceSetRoot ||
    publisherAllocation.liveCaptureRoot !== publisherLiveCaptureRoot ||
    publisher.sourceCommit !== publisherSourceCommit ||
    publisher.workspaceId !== publisherWorkspaceId ||
    publisher.manifestSha256 !== sha256(evidence.publisherManifestRaw) ||
    publisher.allocationSha256 !== sha256(evidence.publisherAllocationRaw) ||
    publisher.allocationRowsRoot !== publisherAllocationRowsRoot ||
    publisher.operationsSha256 !== sha256(evidence.publisherOperationsRaw) ||
    publisher.captureReceiptSha256 !== sha256(evidence.publisherCaptureReceiptRaw) ||
    publisher.planRoot !== publisherPlanRoot ||
    publisher.semanticRoot !== publisherSemanticRoot ||
    publisher.sourceSetRoot !== publisherSourceSetRoot ||
    publisher.compilerInputRoot !== publisherCompilerInputRoot ||
    publisher.liveCaptureRoot !== publisherLiveCaptureRoot ||
    publisher.operationCount !== publisherOperationRows.length
  ) {
    throw new Error("publisher receipt roots differ from the applied authority package");
  }
  assertManifestInput(
    publisherManifest,
    "linear-fingerprint",
    evidence.publisherFingerprintRaw,
    "publisher authority",
  );
  assertManifestInput(
    publisherManifest,
    "capture-receipt",
    evidence.publisherCaptureReceiptRaw,
    "publisher authority",
  );
  for (const [name, raw] of [
    ["native-identity", evidence.publisherNativeIdentityRaw],
    ["raw-documents", evidence.publisherDocumentsRaw],
    ["issue-descriptions", evidence.publisherIssueDescriptionsRaw],
  ] as const) {
    assertManifestInput(publisherManifest, name, raw, "publisher authority");
  }
  assertCaptureReceipt({
    raw: evidence.publisherCaptureReceiptRaw,
    fingerprintRaw: evidence.publisherFingerprintRaw,
    nativeRaw: evidence.publisherNativeIdentityRaw,
    documentsRaw: evidence.publisherDocumentsRaw,
    descriptionsRaw: evidence.publisherIssueDescriptionsRaw,
    sourceCommit: publisherSourceCommit,
  });
  if (
    publisher.semanticRoot !== semanticRoot ||
    publisher.sourceSetRoot !== sourceSetRoot
  ) {
    throw new Error("publisher receipt differs from final authority lineage");
  }

  const sources = array(manifest.sources, "final authority sources").map((row) => record(row, "final authority source"));
  const publisherSources = array(
    publisherManifest.sources,
    "publisher authority sources",
  ).map((row) => record(row, "publisher authority source"));
  const masterSource = one(sources.filter((row) => row.path === "Sourcera_Master_Spec.md"), "Master source");
  const decisionSource = one(sources.filter((row) => row.path === "delivery/decisions.jsonl"), "Decision ledger source");
  const publisherMasterSource = one(
    publisherSources.filter((row) => row.path === "Sourcera_Master_Spec.md"),
    "publisher Master source",
  );
  const publisherDecisionSource = one(
    publisherSources.filter((row) => row.path === "delivery/decisions.jsonl"),
    "publisher Decision ledger source",
  );
  const masterSpecRoot = sha256(evidence.masterSpecRaw);
  if (
    masterSource.rawSha256 !== masterSpecRoot ||
    decisionSource.rawSha256 !== sha256(evidence.decisionLedgerRaw) ||
    publisherMasterSource.rawSha256 !== masterSpecRoot ||
    publisherDecisionSource.rawSha256 !== sha256(evidence.decisionLedgerRaw) ||
    publisher.masterSpecRoot !== masterSpecRoot ||
    finalReceipt.masterSpecRoot !== masterSpecRoot
  ) {
    throw new Error("Master or Decision source root differs from publisher evidence");
  }

  assertCaptureReceipt({
    raw: evidence.finalCaptureReceiptRaw,
    fingerprintRaw: evidence.finalFingerprintRaw,
    nativeRaw: evidence.finalNativeIdentityRaw,
    documentsRaw: evidence.finalDocumentsRaw,
    descriptionsRaw: evidence.finalIssueDescriptionsRaw,
    sourceCommit,
  });
  const inputs = new Map(array(manifest.inputs, "final authority inputs").map((value) => {
    const row = record(value, "final authority input");
    return [string(row.name, "final authority input name"), row] as const;
  }));
  for (const [name, raw] of [
    ["linear-fingerprint", evidence.finalFingerprintRaw],
    ["native-identity", evidence.finalNativeIdentityRaw],
    ["raw-documents", evidence.finalDocumentsRaw],
    ["issue-descriptions", evidence.finalIssueDescriptionsRaw],
    ["capture-receipt", evidence.finalCaptureReceiptRaw],
  ] as const) {
    const input = inputs.get(name);
    if (!input || input.sha256 !== sha256(raw) || input.byteLength !== Buffer.byteLength(raw)) {
      throw new Error(`final authority ${name} input binding differs from final readback`);
    }
  }
  const fingerprint = record(parse(evidence.finalFingerprintRaw, "final fingerprint"), "final fingerprint");
  const publisherFingerprint = record(
    parse(evidence.publisherFingerprintRaw, "publisher fingerprint"),
    "publisher fingerprint",
  );
  const finalProgramRoot = sha256(canonicalJson(record(fingerprint.program, "final program fingerprint")));
  const publisherProgramRoot = sha256(canonicalJson(record(
    publisherFingerprint.program,
    "publisher program fingerprint",
  )));
  if (
    publisher.programRoot !== publisherProgramRoot ||
    finalReceipt.programRoot !== finalProgramRoot
  ) {
    throw new Error("publisher or final program root differs from its receipt");
  }

  const target = one(
    array(manifest.decisions, "final Decision targets")
      .map((row) => record(row, "final Decision target"))
      .filter((row) => row.planKey === TARGET_PLAN_KEY),
    TARGET_PLAN_KEY,
  );
  const expectedBody = sourceDecision(evidence.decisionLedgerRaw);
  if (
    target.kind !== "decision" ||
    target.planKey !== TARGET_PLAN_KEY ||
    target.title !== TARGET_TITLE ||
    target.description !== expectedBody ||
    target.descriptionSha256 !== sha256(expectedBody) ||
    target.expectedCurrentDescriptionSha256 !== sha256(expectedBody) ||
    target.teamPlanKey !== TARGET_TEAM_PLAN_KEY ||
    typeof target.projectPlanKey !== "string" ||
    typeof target.statePlanKey !== "string" ||
    target.priority !== 1 ||
    target.assigneePlanKey === null ||
    !Array.isArray(target.labelPlanKeys) ||
    target.labelPlanKeys.length !== 1 ||
    target.labelPlanKeys[0] !== TARGET_LABEL_PLAN_KEY
  ) {
    throw new Error("production Decision title, body, or native target contract has drifted");
  }
  const publisherTarget = one(
    array(publisherManifest.decisions, "publisher Decision targets")
      .map((row) => record(row, "publisher Decision target"))
      .filter((row) => row.planKey === TARGET_PLAN_KEY),
    `publisher ${TARGET_PLAN_KEY}`,
  );
  if (
    publisherTarget.kind !== "decision" ||
    publisherTarget.title !== TARGET_TITLE ||
    publisherTarget.description !== expectedBody ||
    publisherTarget.descriptionSha256 !== sha256(expectedBody) ||
    publisherTarget.teamPlanKey !== TARGET_TEAM_PLAN_KEY ||
    publisherTarget.projectPlanKey !== target.projectPlanKey ||
    publisherTarget.statePlanKey !== target.statePlanKey ||
    publisherTarget.priority !== 1 ||
    publisherTarget.assigneePlanKey !== target.assigneePlanKey ||
    canonicalJson(publisherTarget.labelPlanKeys) !==
      canonicalJson([TARGET_LABEL_PLAN_KEY])
  ) {
    throw new Error("publisher production Decision target contract has drifted");
  }

  const allocationByKey = new Map(allocations.map((value) => {
    const row = record(value, "final allocation row");
    return [string(row.planKey, "final allocation plan key"), row] as const;
  }));
  if (allocationByKey.size !== allocations.length) throw new Error("final allocation duplicates a plan key");
  const publisherAllocationByKey = new Map(publisherAllocations.map((value) => {
    const row = record(value, "publisher allocation row");
    return [string(row.planKey, "publisher allocation plan key"), row] as const;
  }));
  if (publisherAllocationByKey.size !== publisherAllocations.length) {
    throw new Error("publisher allocation duplicates a plan key");
  }
  const decisionAllocation = record(allocationByKey.get(TARGET_PLAN_KEY), "production Decision allocation");
  const issueUuid = uuid(decisionAllocation.uuid, "production Decision allocation UUID");
  const identifier = string(decisionAllocation.identifier, "production Decision allocation identifier");
  if (
    decisionAllocation.kind !== "decision" ||
    decisionAllocation.source !== "adopted" ||
    decisionAllocation.title !== TARGET_TITLE ||
    !ISSUE_IDENTIFIER.test(identifier) ||
    target.expectedCurrentIssueUuid !== issueUuid ||
    target.expectedIdentifier !== identifier
  ) {
    throw new Error("production Decision issue UUID or allocation identity has drifted");
  }
  const publisherDecisionAllocation = record(
    publisherAllocationByKey.get(TARGET_PLAN_KEY),
    "publisher production Decision allocation",
  );
  if (
    publisherDecisionAllocation.kind !== "decision" ||
    publisherDecisionAllocation.title !== TARGET_TITLE ||
    uuid(
      publisherDecisionAllocation.uuid,
      "publisher production Decision allocation UUID",
    ) !== issueUuid ||
    !["adopted", "allocated"].includes(String(publisherDecisionAllocation.source)) ||
    (publisherDecisionAllocation.source === "adopted" &&
      publisherDecisionAllocation.identifier !== identifier) ||
    (publisherDecisionAllocation.source === "allocated" &&
      publisherDecisionAllocation.identifier !== null)
  ) {
    throw new Error("publisher production Decision allocation identity has drifted");
  }

  const native = record(parse(evidence.finalNativeIdentityRaw, "final native readback"), "final native readback");
  const nativeWorkspace = record(native.workspace, "final native workspace");
  if (nativeWorkspace.id !== workspaceId || nativeWorkspace.name !== workspaceName || nativeWorkspace.urlKey !== workspaceUrlKey || nativeWorkspace.archivedAt !== null) {
    throw new Error("final native workspace differs from unified authority workspace");
  }
  const issues = array(native.issues, "final native issues").map((row) => record(row, "final native issue"));
  const issue = one(issues.filter((row) => row.issueUuid === issueUuid), "production Decision final issue");
  if (issue.identifier !== identifier || issue.archivedAt !== null) {
    throw new Error("production Decision final issue UUID or identifier has drifted");
  }
  if (issue.title !== TARGET_TITLE || issue.descriptionSha256 !== sha256(expectedBody)) {
    throw new Error("production Decision final title or body has drifted");
  }
  if (target.expectedCurrentNativeSha256 !== nativeIssueSha(issue)) {
    throw new Error("production Decision final native state digest has drifted");
  }

  const catalog = record(manifest.nativeCatalog, "final native catalog");
  const team = one(array(catalog.teams, "team catalog").map((row) => record(row, "team catalog row")).filter((row) => row.planKey === TARGET_TEAM_PLAN_KEY), "Requirements team");
  const teamId = uuid(team.id, "Requirements team ID");
  if (team.key !== "REQ" || team.name !== "Requirements" || issue.teamId !== teamId) {
    throw new Error("production Decision Requirements team has drifted");
  }
  const project = one(array(catalog.projects, "project catalog").map((row) => record(row, "project catalog row")).filter((row) => row.planKey === target.projectPlanKey), "production Decision project");
  const projectId = uuid(project.id, "production Decision project ID");
  if (project.name !== TARGET_PROJECT_NAME || issue.projectId !== projectId) {
    throw new Error("production Decision project has drifted");
  }
  const state = one(array(catalog.states, "state catalog").map((row) => record(row, "state catalog row")).filter((row) => row.planKey === target.statePlanKey), "production Decision state");
  const stateId = uuid(state.id, "production Decision state ID");
  if (state.name !== TARGET_STATE_NAME || state.type !== TARGET_STATE_TYPE || state.teamPlanKey !== TARGET_TEAM_PLAN_KEY || issue.stateId !== stateId) {
    throw new Error("production Decision Approved/completed state has drifted");
  }
  const assignee = one(array(catalog.users, "user catalog").map((row) => record(row, "user catalog row")).filter((row) => row.planKey === target.assigneePlanKey), "production Decision assignee");
  const assigneeId = uuid(assignee.id, "production Decision assignee ID");
  if (assignee.name !== TARGET_ASSIGNEE_NAME || assignee.active !== true || issue.assigneeId !== assigneeId) {
    throw new Error("production Decision assignee has drifted");
  }
  if (issue.priority !== 1) throw new Error("production Decision priority has drifted");

  const label = one(array(catalog.labels, "label catalog").map((row) => record(row, "label catalog row")).filter((row) => row.planKey === TARGET_LABEL_PLAN_KEY), "production Decision label");
  const labelId = uuid(label.id, "production Decision label ID");
  const groupId = uuid(label.parentId, "production Decision label group ID");
  if (label.semanticRole !== "decision" || label.name !== "decision" || label.parentName !== "Type" || label.teamPlanKey !== null || canonicalJson(issue.labelIds) !== canonicalJson([labelId])) {
    throw new Error("production Decision Type/decision label has drifted");
  }
  const nativeLabel = one(array(native.labels, "native labels").map((row) => record(row, "native label")).filter((row) => row.id === labelId), "production Decision native label");
  if (nativeLabel.name !== "decision" || nativeLabel.parentId !== groupId || nativeLabel.parentName !== "Type" || nativeLabel.teamId !== null || nativeLabel.archivedAt !== null || nativeLabel.retiredAt !== null) {
    throw new Error("production Decision native label identity has drifted");
  }

  const expectedRelations = array(manifest.nativeRelations, "final native relations")
    .map((row) => record(row, "final native relation target"))
    .filter((row) => row.sourcePlanKey === TARGET_PLAN_KEY || row.targetPlanKey === TARGET_PLAN_KEY);
  const relationTarget = one(expectedRelations, "production Decision expected relation");
  if (
    relationTarget.planKey !== TARGET_RELATION_PLAN_KEY ||
    relationTarget.type !== "related" ||
    relationTarget.sourcePlanKey !== TARGET_RISK_PLAN_KEY ||
    relationTarget.targetPlanKey !== TARGET_PLAN_KEY
  ) {
    throw new Error("production Decision expected relation contract has drifted");
  }
  const publisherExpectedRelations = array(
    publisherManifest.nativeRelations,
    "publisher native relations",
  )
    .map((row) => record(row, "publisher native relation target"))
    .filter((row) =>
      row.sourcePlanKey === TARGET_PLAN_KEY || row.targetPlanKey === TARGET_PLAN_KEY);
  const publisherRelationTarget = one(
    publisherExpectedRelations,
    "publisher production Decision expected relation",
  );
  if (
    publisherRelationTarget.planKey !== TARGET_RELATION_PLAN_KEY ||
    publisherRelationTarget.type !== "related" ||
    publisherRelationTarget.sourcePlanKey !== TARGET_RISK_PLAN_KEY ||
    publisherRelationTarget.targetPlanKey !== TARGET_PLAN_KEY
  ) {
    throw new Error("publisher production Decision expected relation has drifted");
  }
  const relationAllocation = record(allocationByKey.get(TARGET_RELATION_PLAN_KEY), "production Decision relation allocation");
  const relationUuid = uuid(relationAllocation.uuid, "production Decision relation UUID");
  if (relationAllocation.kind !== "relation" || relationAllocation.source !== "adopted" || relationAllocation.identifier !== null || relationAllocation.title !== null) {
    throw new Error("production Decision relation allocation has drifted");
  }
  const publisherRelationAllocation = record(
    publisherAllocationByKey.get(TARGET_RELATION_PLAN_KEY),
    "publisher production Decision relation allocation",
  );
  if (
    publisherRelationAllocation.kind !== "relation" ||
    publisherRelationAllocation.identifier !== null ||
    publisherRelationAllocation.title !== null ||
    !["adopted", "allocated"].includes(String(publisherRelationAllocation.source)) ||
    uuid(
      publisherRelationAllocation.uuid,
      "publisher production Decision relation UUID",
    ) !== relationUuid
  ) {
    throw new Error("publisher production Decision relation allocation has drifted");
  }
  const riskAllocation = record(allocationByKey.get(TARGET_RISK_PLAN_KEY), "production risk allocation");
  const riskUuid = uuid(riskAllocation.uuid, "production risk issue UUID");
  const riskIdentifier = string(riskAllocation.identifier, "production risk identifier");
  if (riskAllocation.kind !== "risk" || riskAllocation.source !== "adopted" || !ISSUE_IDENTIFIER.test(riskIdentifier)) {
    throw new Error("production risk relation endpoint has drifted");
  }
  const publisherRiskAllocation = record(
    publisherAllocationByKey.get(TARGET_RISK_PLAN_KEY),
    "publisher production risk allocation",
  );
  if (
    publisherRiskAllocation.kind !== "risk" ||
    publisherRiskAllocation.source !== "adopted" ||
    publisherRiskAllocation.identifier !== riskIdentifier ||
    uuid(publisherRiskAllocation.uuid, "publisher production risk UUID") !== riskUuid
  ) {
    throw new Error("publisher production risk relation endpoint has drifted");
  }
  const canonicalKey = `related:${[riskIdentifier, identifier].sort().join(":")}`;
  const nativeRelation = one(array(native.relations, "native relation readback").map((row) => record(row, "native relation row")).filter((row) => row.relationId === relationUuid), "production Decision native relation");
  if (
    nativeRelation.archivedAt !== null || nativeRelation.type !== "related" ||
    nativeRelation.canonicalKey !== canonicalKey ||
    nativeRelation.issueId !== riskUuid || nativeRelation.issueIdentifier !== riskIdentifier ||
    nativeRelation.relatedIssueId !== issueUuid || nativeRelation.relatedIssueIdentifier !== identifier ||
    canonicalJson(issue.relationIds) !== canonicalJson([relationUuid])
  ) {
    throw new Error("production Decision final relation readback has drifted");
  }

  const descriptions = record(parse(evidence.finalIssueDescriptionsRaw, "final issue descriptions"), "final issue descriptions");
  const description = one(array(descriptions.issues, "final issue descriptions").map((row) => record(row, "final issue description")).filter((row) => row.id === identifier), "production Decision final body");
  if (description.title !== TARGET_TITLE || description.description !== expectedBody || canonicalJson(description.labels) !== canonicalJson(["decision"])) {
    throw new Error("production Decision final body readback has drifted");
  }

  return {
    schemaVersion: 2,
    event: "linear_production_decision_authority_handoff",
    result: "verified_final_readback",
    planKey: TARGET_PLAN_KEY,
    sourceDecisionId: SOURCE_DECISION_ID,
    sourceCommit,
    workspace: { id: workspaceId, name: workspaceName, urlKey: workspaceUrlKey },
    roots: {
      publicationPlan: publisher.planRoot,
      finalPlan: planRoot,
      semantic: semanticRoot,
      sourceSet: sourceSetRoot,
      compilerInput: compilerInputRoot,
      publicationCapture: publisher.liveCaptureRoot,
      finalCapture: liveCaptureRoot,
      publicationProgram: publisherProgramRoot,
      finalProgram: finalProgramRoot,
      masterSpec: masterSpecRoot,
    },
    receipts: {
      publisher: {
        sha256: sha256(evidence.publisherReceiptRaw),
        manifestSha256: publisher.manifestSha256,
        allocationSha256: publisher.allocationSha256,
        allocationRowsRoot: publisher.allocationRowsRoot,
      },
      finalReadback: {
        sha256: sha256(evidence.finalReadbackReceiptRaw),
        captureReceiptSha256: sha256(evidence.finalCaptureReceiptRaw),
        manifestSha256: finalReceipt.manifestSha256,
        allocationSha256: finalReceipt.allocationSha256,
        allocationRowsRoot: finalReceipt.allocationRowsRoot,
      },
    },
    decision: {
      issueUuid,
      identifier,
      title: TARGET_TITLE,
      body: expectedBody,
      bodySha256: sha256(expectedBody),
      team: { id: teamId, key: "REQ", name: "Requirements" },
      project: { id: projectId, name: TARGET_PROJECT_NAME },
      assignee: { id: assigneeId, name: TARGET_ASSIGNEE_NAME },
      priority: 1,
      state: { id: stateId, name: TARGET_STATE_NAME, type: TARGET_STATE_TYPE },
      label: { id: labelId, name: "decision", groupId, groupName: "Type" },
      relations: [{
        planKey: TARGET_RELATION_PLAN_KEY,
        relationUuid,
        type: "related",
        sourcePlanKey: TARGET_RISK_PLAN_KEY,
        targetPlanKey: TARGET_PLAN_KEY,
        sourceIssueUuid: riskUuid,
        sourceIdentifier: riskIdentifier,
        targetIssueUuid: issueUuid,
        targetIdentifier: identifier,
        canonicalKey,
      }],
    },
  };
}

export function readProductionDecisionAuthorityHandoff(
  raw: string,
  evidence: ProductionDecisionAuthorityPublicationEvidence,
): ProductionDecisionAuthorityHandoff {
  const parsed = record(parse(raw, "production Decision authority handoff"), "production Decision authority handoff");
  const expected = createProductionDecisionAuthorityHandoff(evidence);
  if (canonicalJson(parsed) !== canonicalJson(expected)) {
    throw new Error("production Decision authority handoff differs from publisher final readback");
  }
  return expected;
}

export function resolveProductionDecisionAuthority(
  repositoryRoot: string,
  pin: ProductionDecisionAuthorityPin,
): ResolvedProductionDecisionAuthority {
  const root = path.resolve(repositoryRoot);
  const decisionsPath = path.join(root, "delivery/decisions.jsonl");
  const masterPath = path.join(root, "Sourcera_Master_Spec.md");
  if (
    pin.sourceProvenance.decisionId !== SOURCE_DECISION_ID ||
    !existsSync(decisionsPath) ||
    sha256(readFileSync(decisionsPath, "utf8")) !== pin.sourceProvenance.decisionLedgerSha256
  ) {
    throw new Error("Decision ledger checksum differs from source provenance");
  }
  if (
    !existsSync(masterPath) ||
    sha256(readFileSync(masterPath, "utf8")) !== pin.sourceProvenance.masterSpecSha256
  ) {
    throw new Error("Master Spec checksum differs from source provenance");
  }
  const handoffPath = path.join(root, FORBIDDEN_REPOSITORY_HANDOFF_PATH);
  if (existsSync(handoffPath)) {
    throw new Error("repo-authored production Decision authority handoff is forbidden");
  }
  return {
    handoff: null,
    status: "pending_guarded_handoff",
  };
}
