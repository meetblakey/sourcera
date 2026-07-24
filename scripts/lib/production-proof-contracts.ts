import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

const FULL_GIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const SAFE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const APPLICATIONS = ["marketplace", "buyer", "seller"] as const;
const JOURNEY_STEPS = [
  "buyer_evaluation_created",
  "seller_invited",
  "seller_secure_entry_completed",
  "seller_nda_executed",
  "seller_response_submitted",
  "buyer_scoring_completed",
  "buyer_selection_recorded",
  "immutable_record_retained",
] as const;
const CUSTOMER_RECOVERY_SCENARIOS = [
  "seller_secure_entry_expired_link",
  "response_submission_retry",
  "selection_transaction_failure",
  "immutable_record_unauthorized_mutation",
] as const;
const OPERATIONAL_CONTROLS = [
  "tenant_isolation",
  "console_isolation",
  "authentication",
  "authorization",
  "access_enforcement",
  "audit_integrity",
  "reliability",
  "support",
  "rollback",
  "recovery",
] as const;
const RESIDENCY_REGIONS = new Set(["us", "eu", "apac", "custom"]);

type RecordValue = Record<string, unknown>;
type Application = (typeof APPLICATIONS)[number];

export interface ProductionProofDeploymentBinding {
  application: Application;
  deploymentId: string;
  domains: string[];
  projectId: string;
  stagedUrl: string;
}

export interface ProductionProofBinding {
  candidateSha: string;
  convex: {
    deploymentName: string;
    deploymentUrl: string;
  };
  deployments: ProductionProofDeploymentBinding[];
}

export interface R0CustomerJourneyProof extends RecordValue {
  candidateSha: string;
  collectedAt: string;
  environment: "staging";
  event: "r0_customer_journey_proof";
  release: "R0";
  schemaVersion: 1;
  synthetic: false;
}

export interface R0OperationalProof extends RecordValue {
  candidateSha: string;
  collectedAt: string;
  environment: "staging";
  event: "r0_operational_proof";
  release: "R0";
  schemaVersion: 1;
  synthetic: false;
}

export interface DurableProductionProofCollection extends RecordValue {
  candidateSha: string;
  collectedAt: string;
  decision: "DEC-PROD-002";
  event: "durable_production_proof_collection";
  result: "passed";
  schemaVersion: 1;
  synthetic: false;
}

export interface IsolatedProductionProofEnvironment extends RecordValue {
  candidateSha: string;
  decision: "DEC-PROD-002";
  event: "isolated_production_proof_environment";
  result: "proof_ready";
  schemaVersion: 1;
  synthetic: false;
}

export type ConvexChangeKind =
  | "data"
  | "generated"
  | "schema"
  | "schema_and_data";
export type GitChangeStatus = "A" | "C" | "D" | "M" | "R" | "T";

export interface ConvexChangedPath {
  kind: ConvexChangeKind;
  oldPath?: string;
  path: string;
  status: GitChangeStatus;
}

export interface ConvexChangeClassification {
  baseSha: string;
  candidateSha: string;
  changes: ConvexChangedPath[];
  classification: "data" | "none" | "schema" | "schema_and_data";
  diffSha256: string;
  requiresBackup: boolean;
  schemaVersion: 1;
}

export interface GitCommandResult {
  exitCode: number | null;
  stderr: Buffer | string;
  stdout: Buffer | string;
}

export interface ClassifyConvexProductionChangesOptions {
  baseSha: string;
  candidateSha: string;
  repositoryRoot: string;
  runGit?: (args: string[], repositoryRoot: string) => GitCommandResult;
}

export interface ConvexDataProtectionProof extends RecordValue {
  baseSha: string;
  candidateSha: string;
  collectedAt: string;
  environment: "production";
  event: "convex_backup_restore_proof";
  schemaVersion: 1;
  synthetic: false;
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, context: string): RecordValue {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
  return value;
}

function exactKeys(value: RecordValue, expected: readonly string[], context: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${context} has missing or unexpected fields`);
  }
}

function exact(value: unknown, expected: unknown, context: string) {
  if (value !== expected) throw new Error(`${context} must equal ${String(expected)}`);
}

function string(value: unknown, context: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context} must be a non-empty string`);
  }
  return value;
}

function identifier(value: unknown, context: string) {
  const result = string(value, context);
  if (!SAFE_IDENTIFIER.test(result)) throw new Error(`${context} is invalid`);
  return result;
}

function sha256(value: unknown, context: string) {
  const result = string(value, context);
  if (!SHA256.test(result)) throw new Error(`${context} must be a SHA-256`);
  return result.toLowerCase();
}

function gitSha(value: unknown, context: string) {
  const result = string(value, context);
  if (!FULL_GIT_SHA.test(result)) throw new Error(`${context} must be a full Git SHA`);
  return result.toLowerCase();
}

function timestamp(value: unknown, context: string) {
  const result = string(value, context);
  const milliseconds = Date.parse(result);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== result) {
    throw new Error(`${context} must be a canonical UTC timestamp`);
  }
  return milliseconds;
}

function integer(value: unknown, context: string, minimum = 0) {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    throw new Error(`${context} must be an integer >= ${minimum}`);
  }
  return value as number;
}

function httpsUrl(value: unknown, context: string) {
  const result = string(value, context);
  let parsed: URL;
  try {
    parsed = new URL(result);
  } catch {
    throw new Error(`${context} must be an HTTPS URL`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(`${context} must be an HTTPS URL without credentials or fragments`);
  }
  return result;
}

function domain(value: unknown, context: string) {
  const result = string(value, context);
  if (result !== result.toLowerCase() || result.includes("/") || result.includes(":")) {
    throw new Error(`${context} must be a lowercase hostname`);
  }
  let parsed: URL;
  try {
    parsed = new URL(`https://${result}`);
  } catch {
    throw new Error(`${context} must be a hostname`);
  }
  if (parsed.hostname !== result || !result.includes(".")) {
    throw new Error(`${context} must be a hostname`);
  }
  return result;
}

function validateBinding(binding: ProductionProofBinding) {
  gitSha(binding.candidateSha, "production proof binding candidateSha");
  const convex = record(binding.convex, "production proof binding convex");
  exactKeys(convex, ["deploymentName", "deploymentUrl"], "production proof binding convex");
  identifier(convex.deploymentName, "production proof binding convex deploymentName");
  httpsUrl(convex.deploymentUrl, "production proof binding convex deploymentUrl");
  if (!Array.isArray(binding.deployments)) {
    throw new Error("production proof binding deployments must be an array");
  }
  if (binding.deployments.length !== APPLICATIONS.length) {
    throw new Error("production proof binding must include every application once");
  }
  const ids = new Set<string>();
  const urls = new Set<string>();
  const domains = new Set<string>();
  binding.deployments.forEach((entry, index) => {
    const deployment = record(entry, `production proof binding deployments[${index}]`);
    exactKeys(
      deployment,
      ["application", "deploymentId", "domains", "projectId", "stagedUrl"],
      `production proof binding deployments[${index}]`,
    );
    exact(deployment.application, APPLICATIONS[index], `binding deployment ${index} application`);
    const id = identifier(deployment.deploymentId, `binding ${APPLICATIONS[index]} deploymentId`);
    const projectId = identifier(deployment.projectId, `binding ${APPLICATIONS[index]} projectId`);
    if (!id.startsWith("dpl_") || !projectId.startsWith("prj_")) {
      throw new Error(`binding ${APPLICATIONS[index]} provider IDs are invalid`);
    }
    const stagedUrl = httpsUrl(deployment.stagedUrl, `binding ${APPLICATIONS[index]} stagedUrl`);
    if (!Array.isArray(deployment.domains) || deployment.domains.length === 0) {
      throw new Error(`binding ${APPLICATIONS[index]} domains must be non-empty`);
    }
    deployment.domains.forEach((value, domainIndex) => {
      const validated = domain(value, `binding ${APPLICATIONS[index]} domains[${domainIndex}]`);
      if (domains.has(validated)) throw new Error("production proof binding domains must be unique");
      domains.add(validated);
    });
    if (ids.has(id) || urls.has(stagedUrl)) {
      throw new Error("production proof binding deployments must be unique");
    }
    ids.add(id);
    urls.add(stagedUrl);
  });
}

function validateReceiptBinding(value: RecordValue, binding: ProductionProofBinding) {
  exact(gitSha(value.candidateSha, "proof candidateSha"), binding.candidateSha.toLowerCase(), "proof candidateSha");
  const convex = record(value.convex, "proof convex");
  exactKeys(convex, ["deploymentName", "deploymentUrl"], "proof convex");
  exact(convex.deploymentName, binding.convex.deploymentName, "proof convex deploymentName");
  exact(convex.deploymentUrl, binding.convex.deploymentUrl, "proof convex deploymentUrl");

  if (!Array.isArray(value.deployments) || value.deployments.length !== binding.deployments.length) {
    throw new Error("proof deployments do not match the staged release");
  }
  value.deployments.forEach((entry, index) => {
    const actual = record(entry, `proof deployments[${index}]`);
    const expected = binding.deployments[index];
    exactKeys(
      actual,
      ["application", "deploymentId", "domains", "projectId", "stagedUrl"],
      `proof deployments[${index}]`,
    );
    exact(actual.application, expected.application, `proof deployment ${index} application`);
    exact(actual.deploymentId, expected.deploymentId, `proof ${expected.application} deploymentId`);
    exact(actual.projectId, expected.projectId, `proof ${expected.application} projectId`);
    exact(actual.stagedUrl, expected.stagedUrl, `proof ${expected.application} stagedUrl`);
    if (!Array.isArray(actual.domains) || actual.domains.length !== expected.domains.length) {
      throw new Error(`proof ${expected.application} domains do not match`);
    }
    actual.domains.forEach((entryDomain, domainIndex) =>
      exact(
        entryDomain,
        expected.domains[domainIndex],
        `proof ${expected.application} domain ${domainIndex}`,
      ),
    );
  });
}

function validateCommonR0Proof(
  value: RecordValue,
  binding: ProductionProofBinding,
  event: "r0_customer_journey_proof" | "r0_operational_proof",
) {
  validateBinding(binding);
  exact(value.schemaVersion, 1, `${event} schemaVersion`);
  exact(value.event, event, `${event} event`);
  exact(value.release, "R0", `${event} release`);
  exact(value.environment, "staging", `${event} environment`);
  exact(value.synthetic, false, `${event} synthetic`);
  const collectedAt = timestamp(value.collectedAt, `${event} collectedAt`);
  validateReceiptBinding(value, binding);
  return collectedAt;
}

export function readR0CustomerJourneyProof(
  input: unknown,
  binding: ProductionProofBinding,
): R0CustomerJourneyProof {
  const value = record(input, "R0 customer journey proof");
  exactKeys(
    value,
    [
      "candidateSha",
      "collectedAt",
      "convex",
      "deployments",
      "environment",
      "event",
      "failureRecovery",
      "journey",
      "metrics",
      "pilot",
      "release",
      "schemaVersion",
      "selectionRecord",
      "synthetic",
    ],
    "R0 customer journey proof",
  );
  const collectedAt = validateCommonR0Proof(value, binding, "r0_customer_journey_proof");

  const pilot = record(value.pilot, "R0 customer pilot");
  exactKeys(
    pilot,
    ["buyerActorIdHash", "mode", "sellerActorIdHash", "workspaceIdHash"],
    "R0 customer pilot",
  );
  exact(pilot.mode, "invited_human_staging_pilot", "R0 customer pilot mode");
  sha256(pilot.buyerActorIdHash, "R0 customer pilot buyerActorIdHash");
  sha256(pilot.sellerActorIdHash, "R0 customer pilot sellerActorIdHash");
  sha256(pilot.workspaceIdHash, "R0 customer pilot workspaceIdHash");

  if (!Array.isArray(value.journey) || value.journey.length !== JOURNEY_STEPS.length) {
    throw new Error("R0 customer journey must include every ordered step");
  }
  const journeyTimes: number[] = [];
  const runtimeEventIds = new Set<string>();
  const journeyEvidence = new Set<string>();
  value.journey.forEach((entry, index) => {
    const step = record(entry, `R0 customer journey[${index}]`);
    exactKeys(
      step,
      ["evidenceSha256", "name", "observedAt", "result", "runtimeEventId"],
      `R0 customer journey[${index}]`,
    );
    exact(step.name, JOURNEY_STEPS[index], `R0 customer journey step ${index}`);
    exact(step.result, "passed", `R0 customer journey ${JOURNEY_STEPS[index]} result`);
    const observedAt = timestamp(step.observedAt, `R0 customer journey ${JOURNEY_STEPS[index]} observedAt`);
    if (index > 0 && observedAt <= journeyTimes[index - 1]) {
      throw new Error("R0 customer journey timestamps must be strictly ordered");
    }
    journeyTimes.push(observedAt);
    const eventId = identifier(step.runtimeEventId, `R0 customer journey ${JOURNEY_STEPS[index]} runtimeEventId`);
    const evidence = sha256(step.evidenceSha256, `R0 customer journey ${JOURNEY_STEPS[index]} evidenceSha256`);
    if (runtimeEventIds.has(eventId) || journeyEvidence.has(evidence)) {
      throw new Error("R0 customer journey evidence must be unique");
    }
    runtimeEventIds.add(eventId);
    journeyEvidence.add(evidence);
  });
  if (journeyTimes.at(-1)! > collectedAt) {
    throw new Error("R0 customer journey cannot be collected before it completes");
  }

  if (
    !Array.isArray(value.failureRecovery) ||
    value.failureRecovery.length !== CUSTOMER_RECOVERY_SCENARIOS.length
  ) {
    throw new Error("R0 customer proof must include every failure/recovery case");
  }
  const recoveryEvidence = new Set<string>();
  value.failureRecovery.forEach((entry, index) => {
    const recovery = record(entry, `R0 customer failureRecovery[${index}]`);
    exactKeys(
      recovery,
      ["evidenceSha256", "failureObservedAt", "recoveredAt", "result", "scenario"],
      `R0 customer failureRecovery[${index}]`,
    );
    exact(recovery.scenario, CUSTOMER_RECOVERY_SCENARIOS[index], `R0 recovery scenario ${index}`);
    exact(recovery.result, "passed", `R0 recovery ${CUSTOMER_RECOVERY_SCENARIOS[index]} result`);
    const failureAt = timestamp(recovery.failureObservedAt, `R0 recovery ${index} failureObservedAt`);
    const recoveredAt = timestamp(recovery.recoveredAt, `R0 recovery ${index} recoveredAt`);
    if (failureAt >= recoveredAt || recoveredAt > collectedAt) {
      throw new Error("R0 failure/recovery timestamps are invalid");
    }
    const evidence = sha256(recovery.evidenceSha256, `R0 recovery ${index} evidenceSha256`);
    if (recoveryEvidence.has(evidence)) throw new Error("R0 recovery evidence must be unique");
    recoveryEvidence.add(evidence);
  });

  const metrics = record(value.metrics, "R0 customer metrics");
  exactKeys(
    metrics,
    ["abandonment", "activation", "completion", "timeToValue", "trust"],
    "R0 customer metrics",
  );
  const activation = record(metrics.activation, "R0 activation metric");
  exactKeys(
    activation,
    ["observedAt", "queryEvidenceSha256", "result", "runtimeEventId"],
    "R0 activation metric",
  );
  exact(activation.result, "passed", "R0 activation result");
  exact(activation.observedAt, value.journey[1].observedAt, "R0 activation observedAt");
  exact(activation.runtimeEventId, value.journey[1].runtimeEventId, "R0 activation runtimeEventId");
  sha256(activation.queryEvidenceSha256, "R0 activation query evidence");

  const completion = record(metrics.completion, "R0 completion metric");
  exactKeys(
    completion,
    ["observedAt", "queryEvidenceSha256", "result", "runtimeEventId"],
    "R0 completion metric",
  );
  exact(completion.result, "passed", "R0 completion result");
  exact(completion.observedAt, value.journey[6].observedAt, "R0 completion observedAt");
  exact(completion.runtimeEventId, value.journey[6].runtimeEventId, "R0 completion runtimeEventId");
  sha256(completion.queryEvidenceSha256, "R0 completion query evidence");

  const timeToValue = record(metrics.timeToValue, "R0 timeToValue metric");
  exactKeys(
    timeToValue,
    ["completedAt", "durationMs", "queryEvidenceSha256", "result", "startedAt"],
    "R0 timeToValue metric",
  );
  exact(timeToValue.result, "passed", "R0 timeToValue result");
  exact(timeToValue.startedAt, value.journey[0].observedAt, "R0 timeToValue startedAt");
  exact(timeToValue.completedAt, value.journey[7].observedAt, "R0 timeToValue completedAt");
  const durationMs = integer(timeToValue.durationMs, "R0 timeToValue durationMs", 1);
  exact(durationMs, journeyTimes[7] - journeyTimes[0], "R0 timeToValue durationMs");
  sha256(timeToValue.queryEvidenceSha256, "R0 timeToValue query evidence");

  const abandonment = record(metrics.abandonment, "R0 abandonment metric");
  exactKeys(
    abandonment,
    ["abandoned", "observedAt", "queryEvidenceSha256", "result"],
    "R0 abandonment metric",
  );
  exact(abandonment.result, "passed", "R0 abandonment result");
  exact(abandonment.abandoned, false, "R0 abandonment abandoned");
  exact(abandonment.observedAt, value.journey[6].observedAt, "R0 abandonment observedAt");
  sha256(abandonment.queryEvidenceSha256, "R0 abandonment query evidence");

  const trust = record(metrics.trust, "R0 trust metric");
  exactKeys(
    trust,
    ["accepted", "observedAt", "queryEvidenceSha256", "responseIdHash", "result"],
    "R0 trust metric",
  );
  exact(trust.result, "passed", "R0 trust result");
  exact(trust.accepted, true, "R0 trust accepted");
  const trustAt = timestamp(trust.observedAt, "R0 trust observedAt");
  if (trustAt < journeyTimes[7] || trustAt > collectedAt) {
    throw new Error("R0 trust must be observed after retention and before collection");
  }
  sha256(trust.responseIdHash, "R0 trust responseIdHash");
  sha256(trust.queryEvidenceSha256, "R0 trust query evidence");

  const selection = record(value.selectionRecord, "R0 selection record proof");
  exactKeys(
    selection,
    [
      "auditChainVerified",
      "auditEvidenceSha256",
      "contentSha256",
      "immutableAt",
      "recordIdHash",
      "retainedAt",
      "retentionAuthority",
    ],
    "R0 selection record proof",
  );
  exact(selection.auditChainVerified, true, "R0 selection auditChainVerified");
  sha256(selection.auditEvidenceSha256, "R0 selection auditEvidenceSha256");
  sha256(selection.contentSha256, "R0 selection contentSha256");
  sha256(selection.recordIdHash, "R0 selection recordIdHash");
  exact(selection.immutableAt, value.journey[6].observedAt, "R0 selection immutableAt");
  exact(selection.retainedAt, value.journey[7].observedAt, "R0 selection retainedAt");
  exact(
    selection.retentionAuthority,
    "Sourcera_Master_Spec.md §40.2",
    "R0 selection retentionAuthority",
  );

  return input as R0CustomerJourneyProof;
}

function validateProofWindow(
  value: RecordValue,
  prefix: string,
  collectedAt: number,
) {
  const startedAt = timestamp(value.startedAt, `${prefix} startedAt`);
  const endedAt = timestamp(value.endedAt, `${prefix} endedAt`);
  if (startedAt >= endedAt || endedAt > collectedAt) {
    throw new Error(`${prefix} time window is invalid`);
  }
  return { endedAt, startedAt };
}

export function readR0OperationalProof(
  input: unknown,
  binding: ProductionProofBinding,
): R0OperationalProof {
  const value = record(input, "R0 operational proof");
  exactKeys(
    value,
    [
      "candidateSha",
      "checks",
      "collectedAt",
      "convex",
      "convexRuntimeLog",
      "deployments",
      "environment",
      "event",
      "release",
      "reliability",
      "rollbackRecovery",
      "runtimeLogs",
      "schemaVersion",
      "support",
      "synthetic",
    ],
    "R0 operational proof",
  );
  const collectedAt = validateCommonR0Proof(value, binding, "r0_operational_proof");

  if (!Array.isArray(value.checks) || value.checks.length !== OPERATIONAL_CONTROLS.length) {
    throw new Error("R0 operational proof must include every required control");
  }
  const controlEvidence = new Set<string>();
  value.checks.forEach((entry, index) => {
    const check = record(entry, `R0 operational checks[${index}]`);
    exactKeys(
      check,
      ["control", "evidenceSha256", "observedAt", "result"],
      `R0 operational checks[${index}]`,
    );
    exact(check.control, OPERATIONAL_CONTROLS[index], `R0 operational control ${index}`);
    exact(check.result, "passed", `R0 operational ${OPERATIONAL_CONTROLS[index]} result`);
    const observedAt = timestamp(check.observedAt, `R0 operational ${OPERATIONAL_CONTROLS[index]} observedAt`);
    if (observedAt > collectedAt) throw new Error("R0 operational control is future-dated");
    const evidence = sha256(check.evidenceSha256, `R0 operational ${OPERATIONAL_CONTROLS[index]} evidence`);
    if (controlEvidence.has(evidence)) throw new Error("R0 operational evidence must be unique");
    controlEvidence.add(evidence);
  });

  if (!Array.isArray(value.runtimeLogs) || value.runtimeLogs.length !== binding.deployments.length) {
    throw new Error("R0 runtime logs must include every staged application");
  }
  const logQueries = new Set<string>();
  value.runtimeLogs.forEach((entry, index) => {
    const log = record(entry, `R0 runtimeLogs[${index}]`);
    const deployment = binding.deployments[index];
    exactKeys(
      log,
      [
        "application",
        "deploymentId",
        "endedAt",
        "errorCount",
        "evidenceSha256",
        "fatalCount",
        "queryId",
        "stagedUrl",
        "startedAt",
      ],
      `R0 runtimeLogs[${index}]`,
    );
    exact(log.application, deployment.application, `R0 runtime log ${index} application`);
    exact(log.deploymentId, deployment.deploymentId, `R0 ${deployment.application} log deploymentId`);
    exact(log.stagedUrl, deployment.stagedUrl, `R0 ${deployment.application} log stagedUrl`);
    validateProofWindow(log, `R0 ${deployment.application} runtime log`, collectedAt);
    exact(integer(log.errorCount, `R0 ${deployment.application} errorCount`), 0, `R0 ${deployment.application} errorCount`);
    exact(integer(log.fatalCount, `R0 ${deployment.application} fatalCount`), 0, `R0 ${deployment.application} fatalCount`);
    sha256(log.evidenceSha256, `R0 ${deployment.application} log evidence`);
    const queryId = identifier(log.queryId, `R0 ${deployment.application} log queryId`);
    if (logQueries.has(queryId)) throw new Error("R0 runtime log query IDs must be unique");
    logQueries.add(queryId);
  });

  const convexLog = record(value.convexRuntimeLog, "R0 Convex runtime log");
  exactKeys(
    convexLog,
    [
      "deploymentName",
      "deploymentUrl",
      "endedAt",
      "errorCount",
      "evidenceSha256",
      "fatalCount",
      "queryId",
      "startedAt",
    ],
    "R0 Convex runtime log",
  );
  exact(convexLog.deploymentName, binding.convex.deploymentName, "R0 Convex log deploymentName");
  exact(convexLog.deploymentUrl, binding.convex.deploymentUrl, "R0 Convex log deploymentUrl");
  validateProofWindow(convexLog, "R0 Convex runtime log", collectedAt);
  exact(integer(convexLog.errorCount, "R0 Convex errorCount"), 0, "R0 Convex errorCount");
  exact(integer(convexLog.fatalCount, "R0 Convex fatalCount"), 0, "R0 Convex fatalCount");
  sha256(convexLog.evidenceSha256, "R0 Convex log evidence");
  const convexQueryId = identifier(convexLog.queryId, "R0 Convex log queryId");
  if (logQueries.has(convexQueryId)) throw new Error("R0 runtime log query IDs must be unique");

  const reliability = record(value.reliability, "R0 reliability metric");
  exactKeys(
    reliability,
    [
      "checksPassed",
      "checksRun",
      "queryEvidenceSha256",
      "result",
      "windowEndedAt",
      "windowStartedAt",
    ],
    "R0 reliability metric",
  );
  exact(reliability.result, "passed", "R0 reliability result");
  const checksRun = integer(reliability.checksRun, "R0 reliability checksRun", 4);
  exact(integer(reliability.checksPassed, "R0 reliability checksPassed", 4), checksRun, "R0 reliability checksPassed");
  validateProofWindow(
    { startedAt: reliability.windowStartedAt, endedAt: reliability.windowEndedAt },
    "R0 reliability",
    collectedAt,
  );
  sha256(reliability.queryEvidenceSha256, "R0 reliability query evidence");

  const support = record(value.support, "R0 support metric");
  exactKeys(
    support,
    [
      "allInterventionsRecorded",
      "interventionCount",
      "queryEvidenceSha256",
      "result",
      "unplannedDataRepairCount",
      "windowEndedAt",
      "windowStartedAt",
    ],
    "R0 support metric",
  );
  exact(support.result, "passed", "R0 support result");
  exact(support.allInterventionsRecorded, true, "R0 support allInterventionsRecorded");
  integer(support.interventionCount, "R0 support interventionCount");
  exact(
    integer(support.unplannedDataRepairCount, "R0 support unplannedDataRepairCount"),
    0,
    "R0 support unplannedDataRepairCount",
  );
  validateProofWindow(
    { startedAt: support.windowStartedAt, endedAt: support.windowEndedAt },
    "R0 support",
    collectedAt,
  );
  sha256(support.queryEvidenceSha256, "R0 support query evidence");

  const rollbackRecovery = record(value.rollbackRecovery, "R0 rollback/recovery proof");
  exactKeys(rollbackRecovery, ["applications", "convex"], "R0 rollback/recovery proof");
  if (
    !Array.isArray(rollbackRecovery.applications) ||
    rollbackRecovery.applications.length !== binding.deployments.length
  ) {
    throw new Error("R0 rollback/recovery must include every application");
  }
  rollbackRecovery.applications.forEach((entry, index) => {
    const proof = record(entry, `R0 rollback/recovery applications[${index}]`);
    const deployment = binding.deployments[index];
    exactKeys(
      proof,
      [
        "application",
        "candidateDeploymentId",
        "predecessorDeploymentId",
        "recoveryEvidenceSha256",
        "recoveryObservedAt",
        "restoredDeploymentId",
        "result",
        "rollbackEvidenceSha256",
        "rollbackObservedAt",
      ],
      `R0 rollback/recovery applications[${index}]`,
    );
    exact(proof.application, deployment.application, `R0 rollback application ${index}`);
    exact(proof.candidateDeploymentId, deployment.deploymentId, `R0 ${deployment.application} candidateDeploymentId`);
    const predecessor = identifier(
      proof.predecessorDeploymentId,
      `R0 ${deployment.application} predecessorDeploymentId`,
    );
    if (!predecessor.startsWith("dpl_") || predecessor === deployment.deploymentId) {
      throw new Error(`R0 ${deployment.application} predecessorDeploymentId is invalid`);
    }
    exact(proof.restoredDeploymentId, deployment.deploymentId, `R0 ${deployment.application} restoredDeploymentId`);
    exact(proof.result, "passed", `R0 ${deployment.application} rollback/recovery result`);
    const rollbackAt = timestamp(proof.rollbackObservedAt, `R0 ${deployment.application} rollbackObservedAt`);
    const recoveryAt = timestamp(proof.recoveryObservedAt, `R0 ${deployment.application} recoveryObservedAt`);
    if (rollbackAt >= recoveryAt || recoveryAt > collectedAt) {
      throw new Error(`R0 ${deployment.application} rollback/recovery timestamps are invalid`);
    }
    sha256(proof.rollbackEvidenceSha256, `R0 ${deployment.application} rollback evidence`);
    sha256(proof.recoveryEvidenceSha256, `R0 ${deployment.application} recovery evidence`);
  });

  const convexRecovery = record(rollbackRecovery.convex, "R0 Convex rollback/recovery proof");
  exactKeys(
    convexRecovery,
    [
      "candidateSha",
      "knownGoodSha",
      "recoveryEvidenceSha256",
      "recoveryObservedAt",
      "restoredSha",
      "result",
      "rollbackEvidenceSha256",
      "rollbackObservedAt",
    ],
    "R0 Convex rollback/recovery proof",
  );
  exact(convexRecovery.candidateSha, binding.candidateSha, "R0 Convex recovery candidateSha");
  const knownGoodSha = gitSha(convexRecovery.knownGoodSha, "R0 Convex recovery knownGoodSha");
  if (knownGoodSha === binding.candidateSha.toLowerCase()) {
    throw new Error("R0 Convex known-good SHA must differ from the candidate");
  }
  exact(convexRecovery.restoredSha, binding.candidateSha, "R0 Convex recovery restoredSha");
  exact(convexRecovery.result, "passed", "R0 Convex rollback/recovery result");
  const convexRollbackAt = timestamp(convexRecovery.rollbackObservedAt, "R0 Convex rollbackObservedAt");
  const convexRecoveryAt = timestamp(convexRecovery.recoveryObservedAt, "R0 Convex recoveryObservedAt");
  if (convexRollbackAt >= convexRecoveryAt || convexRecoveryAt > collectedAt) {
    throw new Error("R0 Convex rollback/recovery timestamps are invalid");
  }
  sha256(convexRecovery.rollbackEvidenceSha256, "R0 Convex rollback evidence");
  sha256(convexRecovery.recoveryEvidenceSha256, "R0 Convex recovery evidence");

  return input as R0OperationalProof;
}

export function readIsolatedProductionProofEnvironment(
  input: unknown,
  expected: {
    candidateSha: string;
    coordinator: { projectId: string; workflowName: string };
    isolatedConvex: { deploymentName: string; deploymentUrl: string };
    productionConvex: { deploymentName: string; deploymentUrl: string };
  },
): ProductionProofBinding {
  const value = record(input, "Isolated production proof environment");
  exactKeys(
    value,
    [
      "candidateSha",
      "collectedAt",
      "coordinator",
      "decision",
      "deployments",
      "event",
      "isolatedConvex",
      "productionConvex",
      "result",
      "schemaVersion",
      "synthetic",
    ],
    "Isolated production proof environment",
  );
  exact(value.schemaVersion, 1, "Isolated proof environment schemaVersion");
  exact(
    value.event,
    "isolated_production_proof_environment",
    "Isolated proof environment event",
  );
  exact(value.decision, "DEC-PROD-002", "Isolated proof environment decision");
  exact(value.result, "proof_ready", "Isolated proof environment result");
  exact(value.synthetic, false, "Isolated proof environment synthetic");
  const candidateSha = gitSha(
    value.candidateSha,
    "Isolated proof environment candidateSha",
  );
  exact(
    candidateSha,
    gitSha(expected.candidateSha, "Expected isolated proof candidateSha"),
    "Isolated proof environment candidateSha",
  );
  const collectedAt = timestamp(
    value.collectedAt,
    "Isolated proof environment collectedAt",
  );
  for (const [name, target, expectedTarget] of [
    ["isolatedConvex", record(value.isolatedConvex, "isolatedConvex"), expected.isolatedConvex],
    ["productionConvex", record(value.productionConvex, "productionConvex"), expected.productionConvex],
  ] as const) {
    exactKeys(target, ["deploymentName", "deploymentUrl"], name);
    exact(target.deploymentName, expectedTarget.deploymentName, `${name} deploymentName`);
    exact(target.deploymentUrl, expectedTarget.deploymentUrl, `${name} deploymentUrl`);
  }
  if (
    expected.isolatedConvex.deploymentName === expected.productionConvex.deploymentName ||
    expected.isolatedConvex.deploymentUrl === expected.productionConvex.deploymentUrl
  ) {
    throw new Error("Isolated proof Convex target must differ from production");
  }
  if (!Array.isArray(value.deployments) || value.deployments.length !== APPLICATIONS.length) {
    throw new Error("Isolated proof environment must include every application");
  }
  const deployments = value.deployments.map((entry, index) => {
    const deployment = record(entry, `Isolated proof deployment ${index}`);
    exactKeys(
      deployment,
      [
        "application",
        "backendConvexDeploymentName",
        "backendConvexUrl",
        "deploymentId",
        "domains",
        "environment",
        "environmentEvidence",
        "environmentEvidenceSha256",
        "projectId",
        "stagedUrl",
      ],
      `Isolated proof deployment ${index}`,
    );
    exact(deployment.application, APPLICATIONS[index], `Isolated proof deployment ${index} application`);
    exact(deployment.environment, "staging", `Isolated proof deployment ${index} environment`);
    exact(
      deployment.backendConvexDeploymentName,
      expected.isolatedConvex.deploymentName,
      `Isolated proof deployment ${index} backend deployment`,
    );
    exact(
      deployment.backendConvexUrl,
      expected.isolatedConvex.deploymentUrl,
      `Isolated proof deployment ${index} backend URL`,
    );
    sha256(
      deployment.environmentEvidenceSha256,
      `Isolated proof deployment ${index} environment evidence`,
    );
    const environmentEvidence = record(
      deployment.environmentEvidence,
      `Isolated proof deployment ${index} environmentEvidence`,
    );
    exactKeys(
      environmentEvidence,
      [
        "candidateSha",
        "convexDeploymentName",
        "convexUrl",
        "deploymentId",
        "environment",
        "projectId",
        "provider",
        "readAt",
      ],
      `Isolated proof deployment ${index} environmentEvidence`,
    );
    exact(environmentEvidence.provider, "vercel", `Isolated proof deployment ${index} provider`);
    exact(environmentEvidence.environment, "staging", `Isolated proof deployment ${index} evidence environment`);
    exact(environmentEvidence.candidateSha, candidateSha, `Isolated proof deployment ${index} evidence candidateSha`);
    exact(environmentEvidence.deploymentId, deployment.deploymentId, `Isolated proof deployment ${index} evidence deploymentId`);
    exact(environmentEvidence.projectId, deployment.projectId, `Isolated proof deployment ${index} evidence projectId`);
    exact(environmentEvidence.convexDeploymentName, expected.isolatedConvex.deploymentName, `Isolated proof deployment ${index} evidence Convex deployment`);
    exact(environmentEvidence.convexUrl, expected.isolatedConvex.deploymentUrl, `Isolated proof deployment ${index} evidence Convex URL`);
    timestamp(environmentEvidence.readAt, `Isolated proof deployment ${index} environment readAt`);
    exact(
      deployment.environmentEvidenceSha256,
      createHash("sha256").update(canonicalJson(environmentEvidence)).digest("hex"),
      `Isolated proof deployment ${index} environmentEvidenceSha256`,
    );
    return {
      application: APPLICATIONS[index],
      deploymentId: string(deployment.deploymentId, `Isolated proof deployment ${index} deploymentId`),
      domains: deployment.domains as string[],
      projectId: string(deployment.projectId, `Isolated proof deployment ${index} projectId`),
      stagedUrl: string(deployment.stagedUrl, `Isolated proof deployment ${index} stagedUrl`),
    };
  });
  const coordinator = record(value.coordinator, "Isolated proof coordinator");
  exactKeys(
    coordinator,
    ["expiresAt", "handoffSha256", "projectId", "provider", "runId", "state", "workflowName"],
    "Isolated proof coordinator",
  );
  exact(coordinator.provider, "vercel_workflow", "Isolated proof coordinator provider");
  exact(coordinator.state, "awaiting_proofs", "Isolated proof coordinator state");
  exact(coordinator.projectId, expected.coordinator.projectId, "Isolated proof coordinator projectId");
  exact(coordinator.workflowName, expected.coordinator.workflowName, "Isolated proof coordinator workflowName");
  identifier(coordinator.runId, "Isolated proof coordinator runId");
  sha256(coordinator.handoffSha256, "Isolated proof coordinator handoffSha256");
  if (timestamp(coordinator.expiresAt, "Isolated proof coordinator expiresAt") <= collectedAt) {
    throw new Error("Isolated proof coordinator handoff is expired");
  }
  const binding = {
    candidateSha,
    convex: { ...expected.isolatedConvex },
    deployments,
  } as ProductionProofBinding;
  validateBinding(binding);
  return binding;
}

export function readDurableProductionProofCollection(
  input: unknown,
  expected: {
    binding: ProductionProofBinding;
    coordinator: { projectId: string; workflowName: string };
    customerProofRaw: string;
    environmentProofRaw: string;
    operationalProofRaw: string;
    productionConvex: {
      deploymentName: string;
      deploymentUrl: string;
    };
  },
): DurableProductionProofCollection {
  validateBinding(expected.binding);
  readR0CustomerJourneyProof(
    JSON.parse(expected.customerProofRaw) as unknown,
    expected.binding,
  );
  readR0OperationalProof(
    JSON.parse(expected.operationalProofRaw) as unknown,
    expected.binding,
  );
  const value = record(input, "Durable production proof collection");
  exactKeys(
    value,
    [
      "candidateSha",
      "collectedAt",
      "coordinator",
      "customerProofSha256",
      "decision",
      "event",
      "environmentProofSha256",
      "isolatedConvex",
      "operationalProofSha256",
      "productionConvex",
      "result",
      "schemaVersion",
      "synthetic",
    ],
    "Durable production proof collection",
  );
  exact(value.schemaVersion, 1, "Durable production proof schemaVersion");
  exact(
    value.event,
    "durable_production_proof_collection",
    "Durable production proof event",
  );
  exact(value.decision, "DEC-PROD-002", "Durable production proof decision");
  exact(value.result, "passed", "Durable production proof result");
  exact(value.synthetic, false, "Durable production proof synthetic");
  exact(
    gitSha(value.candidateSha, "Durable production proof candidateSha"),
    expected.binding.candidateSha.toLowerCase(),
    "Durable production proof candidateSha",
  );
  const collectedAt = timestamp(
    value.collectedAt,
    "Durable production proof collectedAt",
  );
  const isolatedConvex = record(
    value.isolatedConvex,
    "Durable production proof isolatedConvex",
  );
  const productionConvex = record(
    value.productionConvex,
    "Durable production proof productionConvex",
  );
  for (const [name, target, expectedTarget] of [
    ["isolatedConvex", isolatedConvex, expected.binding.convex],
    ["productionConvex", productionConvex, expected.productionConvex],
  ] as const) {
    exactKeys(target, ["deploymentName", "deploymentUrl"], name);
    exact(target.deploymentName, expectedTarget.deploymentName, `${name} deploymentName`);
    exact(target.deploymentUrl, expectedTarget.deploymentUrl, `${name} deploymentUrl`);
    identifier(target.deploymentName, `${name} deploymentName`);
    httpsUrl(target.deploymentUrl, `${name} deploymentUrl`);
  }
  if (
    isolatedConvex.deploymentName === productionConvex.deploymentName ||
    isolatedConvex.deploymentUrl === productionConvex.deploymentUrl
  ) {
    throw new Error("Durable proof Convex candidate target must be isolated");
  }
  exact(
    value.customerProofSha256,
    createHash("sha256").update(expected.customerProofRaw).digest("hex"),
    "Durable production customer proof SHA-256",
  );
  exact(
    value.environmentProofSha256,
    createHash("sha256").update(expected.environmentProofRaw).digest("hex"),
    "Durable production environment proof SHA-256",
  );
  exact(
    value.operationalProofSha256,
    createHash("sha256").update(expected.operationalProofRaw).digest("hex"),
    "Durable production operational proof SHA-256",
  );
  const coordinator = record(
    value.coordinator,
    "Durable production proof coordinator",
  );
  exactKeys(
    coordinator,
    [
      "authentication",
      "completedAt",
      "expiryCompensation",
      "expiresAt",
      "handoffSha256",
      "projectId",
      "provider",
      "runId",
      "singleUseFinalizer",
      "startedAt",
      "state",
      "workflowName",
    ],
    "Durable production proof coordinator",
  );
  exact(coordinator.provider, "vercel_workflow", "Durable coordinator provider");
  exact(coordinator.projectId, expected.coordinator.projectId, "Durable coordinator projectId");
  exact(
    coordinator.workflowName,
    expected.coordinator.workflowName,
    "Durable coordinator workflowName",
  );
  identifier(coordinator.runId, "Durable coordinator runId");
  sha256(coordinator.handoffSha256, "Durable coordinator handoffSha256");
  exact(
    coordinator.authentication,
    "signed_single_use_handoff",
    "Durable coordinator authentication",
  );
  exact(coordinator.state, "proofs_collected", "Durable coordinator state");
  exact(
    coordinator.singleUseFinalizer,
    true,
    "Durable coordinator singleUseFinalizer",
  );
  exact(
    coordinator.expiryCompensation,
    "restore_known_good_and_block",
    "Durable coordinator expiryCompensation",
  );
  const startedAt = timestamp(coordinator.startedAt, "Durable coordinator startedAt");
  const completedAt = timestamp(
    coordinator.completedAt,
    "Durable coordinator completedAt",
  );
  const expiresAt = timestamp(coordinator.expiresAt, "Durable coordinator expiresAt");
  if (
    startedAt >= completedAt ||
    completedAt !== collectedAt ||
    completedAt >= expiresAt
  ) {
    throw new Error("Durable coordinator proof window is invalid");
  }
  return input as DurableProductionProofCollection;
}

function defaultRunGit(args: string[], repositoryRoot: string): GitCommandResult {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 16 * 1024 * 1024,
    shell: false,
  });
  return {
    exitCode: result.status,
    stderr: result.stderr ?? Buffer.alloc(0),
    stdout: result.stdout ?? Buffer.alloc(0),
  };
}

function commandBuffer(value: Buffer | string) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

function validateRepositoryRoot(value: string) {
  if (!path.isAbsolute(value) || value.includes("\0")) {
    throw new Error("repositoryRoot must be an absolute path");
  }
}

function validateDiffPath(value: string, context: string) {
  if (
    value.length === 0 ||
    value.startsWith("/") ||
    value.includes("\\") ||
    value.split("/").some((segment) => segment === "" || segment === "." || segment === "..") ||
    !value.startsWith("convex/")
  ) {
    throw new Error(`${context} is not a canonical Convex path`);
  }
  return value;
}

function pathKind(value: string): ConvexChangeKind {
  if (value === "convex/schema.ts" || value.startsWith("convex/schema/")) {
    return "schema";
  }
  if (value.startsWith("convex/_generated/")) return "generated";
  return "data";
}

function combinedKind(paths: string[]): ConvexChangeKind {
  const kinds = new Set(paths.map(pathKind));
  kinds.delete("generated");
  if (kinds.size === 0) return "generated";
  if (kinds.has("schema") && kinds.has("data")) return "schema_and_data";
  return kinds.has("schema") ? "schema" : "data";
}

function parseDiff(raw: Buffer): ConvexChangedPath[] {
  if (raw.length === 0) return [];
  if (raw.at(-1) !== 0) throw new Error("Convex git diff is not NUL terminated");
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    throw new Error("Convex git diff is not valid UTF-8");
  }
  const fields = decoded.split("\0");
  fields.pop();
  const changes: ConvexChangedPath[] = [];
  for (let index = 0; index < fields.length; ) {
    const rawStatus = fields[index++];
    const statusMatch = /^(A|D|M|T|R100|C100)$/.exec(rawStatus);
    if (!statusMatch) throw new Error(`Convex git diff status ${rawStatus} is ambiguous`);
    const status = rawStatus[0] as GitChangeStatus;
    if (status === "R" || status === "C") {
      const oldPath = validateDiffPath(fields[index++] ?? "", "Convex git diff old path");
      const newPath = validateDiffPath(fields[index++] ?? "", "Convex git diff path");
      changes.push({
        kind: combinedKind([oldPath, newPath]),
        oldPath,
        path: newPath,
        status,
      });
    } else {
      const changedPath = validateDiffPath(fields[index++] ?? "", "Convex git diff path");
      changes.push({ kind: pathKind(changedPath), path: changedPath, status });
    }
  }
  return changes;
}

function aggregateClassification(changes: ConvexChangedPath[]) {
  const kinds = new Set<ConvexChangeKind>();
  for (const change of changes) {
    if (change.kind === "schema_and_data") {
      kinds.add("schema");
      kinds.add("data");
    } else if (change.kind !== "generated") {
      kinds.add(change.kind);
    }
  }
  if (changes.length > 0 && kinds.size === 0) {
    throw new Error("Generated Convex changes have no source change and are ambiguous");
  }
  if (kinds.has("schema") && kinds.has("data")) return "schema_and_data" as const;
  if (kinds.has("schema")) return "schema" as const;
  if (kinds.has("data")) return "data" as const;
  return "none" as const;
}

export function classifyConvexProductionChanges(
  options: ClassifyConvexProductionChangesOptions,
): ConvexChangeClassification {
  const base = gitSha(options.baseSha, "Convex diff baseSha");
  const candidate = gitSha(options.candidateSha, "Convex diff candidateSha");
  if (base === candidate) throw new Error("Convex diff base and candidate SHAs must differ");
  validateRepositoryRoot(options.repositoryRoot);
  const runGit = options.runGit ?? defaultRunGit;
  const ancestry = runGit(
    ["merge-base", "--is-ancestor", base, candidate],
    options.repositoryRoot,
  );
  if (ancestry.exitCode !== 0) {
    throw new Error("Convex diff base SHA is not an ancestor of the candidate");
  }
  const diff = runGit(
    [
      "diff",
      "--name-status",
      "-z",
      "--find-renames=100%",
      base,
      candidate,
      "--",
      "convex",
    ],
    options.repositoryRoot,
  );
  if (diff.exitCode !== 0) {
    const stderr = commandBuffer(diff.stderr).toString("utf8").trim();
    throw new Error(`Convex git diff failed${stderr ? `: ${stderr}` : ""}`);
  }
  const raw = commandBuffer(diff.stdout);
  const changes = parseDiff(raw);
  const classification = aggregateClassification(changes);
  return {
    baseSha: base,
    candidateSha: candidate,
    changes,
    classification,
    diffSha256: createHash("sha256").update(raw).digest("hex"),
    requiresBackup: classification !== "none",
    schemaVersion: 1,
  };
}

function validateClassification(value: ConvexChangeClassification) {
  const classification = record(value, "Convex change classification");
  exactKeys(
    classification,
    [
      "baseSha",
      "candidateSha",
      "changes",
      "classification",
      "diffSha256",
      "requiresBackup",
      "schemaVersion",
    ],
    "Convex change classification",
  );
  exact(classification.schemaVersion, 1, "Convex change classification schemaVersion");
  const base = gitSha(classification.baseSha, "Convex change classification baseSha");
  const candidate = gitSha(
    classification.candidateSha,
    "Convex change classification candidateSha",
  );
  if (base === candidate) throw new Error("Convex change classification SHAs must differ");
  sha256(classification.diffSha256, "Convex change classification diffSha256");
  if (!Array.isArray(classification.changes)) {
    throw new Error("Convex change classification changes must be an array");
  }
  const validatedChanges = classification.changes.map((entry, index) => {
    const change = record(entry, `Convex change classification changes[${index}]`);
    const status = change.status;
    if (!["A", "C", "D", "M", "R", "T"].includes(String(status))) {
      throw new Error(`Convex change classification changes[${index}] status is invalid`);
    }
    const hasOldPath = status === "R" || status === "C";
    exactKeys(
      change,
      hasOldPath ? ["kind", "oldPath", "path", "status"] : ["kind", "path", "status"],
      `Convex change classification changes[${index}]`,
    );
    const changedPath = validateDiffPath(
      string(change.path, `Convex change classification changes[${index}] path`),
      `Convex change classification changes[${index}] path`,
    );
    const oldPath = hasOldPath
      ? validateDiffPath(
          string(change.oldPath, `Convex change classification changes[${index}] oldPath`),
          `Convex change classification changes[${index}] oldPath`,
        )
      : undefined;
    const expectedKind = combinedKind(oldPath ? [oldPath, changedPath] : [changedPath]);
    exact(change.kind, expectedKind, `Convex change classification changes[${index}] kind`);
    return {
      kind: expectedKind,
      ...(oldPath ? { oldPath } : {}),
      path: changedPath,
      status: status as GitChangeStatus,
    };
  });
  const aggregate = aggregateClassification(validatedChanges);
  exact(classification.classification, aggregate, "Convex change classification classification");
  exact(
    classification.requiresBackup,
    aggregate !== "none",
    "Convex change classification requiresBackup",
  );
  if (aggregate === "none") {
    exact(
      classification.diffSha256,
      createHash("sha256").update(Buffer.alloc(0)).digest("hex"),
      "empty Convex change classification diffSha256",
    );
  }
}

export function readConvexChangeClassification(
  input: unknown,
  expected: { baseSha: string; candidateSha: string },
): ConvexChangeClassification {
  const classification = input as ConvexChangeClassification;
  validateClassification(classification);
  exact(
    gitSha(classification.baseSha, "Convex change classification baseSha"),
    gitSha(expected.baseSha, "Expected Convex change classification baseSha"),
    "Convex change classification baseSha",
  );
  exact(
    gitSha(
      classification.candidateSha,
      "Convex change classification candidateSha",
    ),
    gitSha(
      expected.candidateSha,
      "Expected Convex change classification candidateSha",
    ),
    "Convex change classification candidateSha",
  );
  return classification;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error("Cannot hash undefined proof data");
  return json;
}

export function hashConvexChangeClassification(
  classification: ConvexChangeClassification,
) {
  validateClassification(classification);
  return createHash("sha256").update(canonicalJson(classification)).digest("hex");
}

export function readConvexDataProtectionProof(
  input: unknown,
  options: {
    binding: ProductionProofBinding;
    classification: ConvexChangeClassification;
  },
): ConvexDataProtectionProof | undefined {
  validateBinding(options.binding);
  validateClassification(options.classification);
  if (!options.classification.requiresBackup) {
    if (input !== undefined) {
      throw new Error("Convex backup/restore proof is not allowed for an empty diff");
    }
    return undefined;
  }
  if (input === undefined) {
    throw new Error("Convex changes require backup and tested restore proof");
  }
  const value = record(input, "Convex data-protection proof");
  exactKeys(
    value,
    [
      "backup",
      "baseSha",
      "candidateSha",
      "classificationSha256",
      "collectedAt",
      "convex",
      "environment",
      "event",
      "restore",
      "schemaVersion",
      "synthetic",
    ],
    "Convex data-protection proof",
  );
  exact(value.schemaVersion, 1, "Convex data-protection schemaVersion");
  exact(value.event, "convex_backup_restore_proof", "Convex data-protection event");
  exact(value.environment, "production", "Convex data-protection environment");
  exact(value.synthetic, false, "Convex data-protection synthetic");
  exact(value.baseSha, options.classification.baseSha, "Convex data-protection baseSha");
  exact(value.candidateSha, options.classification.candidateSha, "Convex data-protection candidateSha");
  exact(value.candidateSha, options.binding.candidateSha, "Convex data-protection binding candidateSha");
  exact(
    value.classificationSha256,
    hashConvexChangeClassification(options.classification),
    "Convex data-protection classificationSha256",
  );
  const collectedAt = timestamp(value.collectedAt, "Convex data-protection collectedAt");
  const convex = record(value.convex, "Convex data-protection convex");
  exactKeys(convex, ["deploymentName", "deploymentUrl"], "Convex data-protection convex");
  exact(
    convex.deploymentName,
    options.binding.convex.deploymentName,
    "Convex data-protection deploymentName",
  );
  exact(
    convex.deploymentUrl,
    options.binding.convex.deploymentUrl,
    "Convex data-protection deploymentUrl",
  );

  const backup = record(value.backup, "Convex backup proof");
  exactKeys(
    backup,
    [
      "artifactSha256",
      "backupId",
      "collectionManifestSha256",
      "completedAt",
      "encrypted",
      "residencyRegion",
      "result",
      "sourceDeploymentName",
      "startedAt",
    ],
    "Convex backup proof",
  );
  exact(backup.result, "passed", "Convex backup result");
  exact(backup.encrypted, true, "Convex backup encrypted");
  exact(
    backup.sourceDeploymentName,
    options.binding.convex.deploymentName,
    "Convex backup sourceDeploymentName",
  );
  const backupId = identifier(backup.backupId, "Convex backup backupId");
  const artifactHash = sha256(backup.artifactSha256, "Convex backup artifactSha256");
  const manifestHash = sha256(
    backup.collectionManifestSha256,
    "Convex backup collectionManifestSha256",
  );
  if (!RESIDENCY_REGIONS.has(String(backup.residencyRegion))) {
    throw new Error("Convex backup residencyRegion is invalid");
  }
  const backupStartedAt = timestamp(backup.startedAt, "Convex backup startedAt");
  const backupCompletedAt = timestamp(backup.completedAt, "Convex backup completedAt");
  if (backupStartedAt >= backupCompletedAt || backupCompletedAt > collectedAt) {
    throw new Error("Convex backup timestamps are invalid");
  }

  const restore = record(value.restore, "Convex restore proof");
  exactKeys(
    restore,
    [
      "artifactSha256",
      "backupId",
      "cleanupCompletedAt",
      "collectionManifestSha256",
      "completedAt",
      "hashesMatched",
      "restoreId",
      "result",
      "startedAt",
      "targetDeploymentName",
      "targetEnvironment",
    ],
    "Convex restore proof",
  );
  exact(restore.result, "passed", "Convex restore result");
  exact(restore.hashesMatched, true, "Convex restore hashesMatched");
  exact(restore.targetEnvironment, "isolated_staging", "Convex restore targetEnvironment");
  exact(restore.backupId, backupId, "Convex restore backupId");
  exact(restore.artifactSha256, artifactHash, "Convex restore artifactSha256");
  exact(
    restore.collectionManifestSha256,
    manifestHash,
    "Convex restore collectionManifestSha256",
  );
  identifier(restore.restoreId, "Convex restore restoreId");
  const targetDeploymentName = identifier(
    restore.targetDeploymentName,
    "Convex restore targetDeploymentName",
  );
  if (targetDeploymentName === options.binding.convex.deploymentName) {
    throw new Error("Convex restore target must be isolated from production");
  }
  const restoreStartedAt = timestamp(restore.startedAt, "Convex restore startedAt");
  const restoreCompletedAt = timestamp(restore.completedAt, "Convex restore completedAt");
  const cleanupCompletedAt = timestamp(
    restore.cleanupCompletedAt,
    "Convex restore cleanupCompletedAt",
  );
  if (
    restoreStartedAt <= backupCompletedAt ||
    restoreStartedAt >= restoreCompletedAt ||
    restoreCompletedAt >= cleanupCompletedAt ||
    cleanupCompletedAt > collectedAt
  ) {
    throw new Error("Convex restore timestamps are invalid");
  }

  return input as ConvexDataProtectionProof;
}
