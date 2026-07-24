import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  linkSync,
  mkdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import {
  type ConvexEnvironment,
  type ConvexProductionTarget,
  readConvexProductionTarget,
  readRequiredConvexProductionKeyIdentity,
} from "@sourcera/domain/convex";

import {
  readGithubProductionApprovalReceipt,
  readPassingConvexProductionGenesisReceipt,
  type ConvexProductionGenesisExpectation,
  type ConvexProductionGenesisReceipt,
} from "./convex-production-bootstrap";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const RECEIPT_HASH = /^[a-f0-9]{64}$/i;
const SAFE_PROCESS_ENVIRONMENT_KEYS = [
  "CI",
  "COREPACK_HOME",
  "FORCE_COLOR",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "NODE_ENV",
  "NODE_EXTRA_CA_CERTS",
  "NO_COLOR",
  "NPM_CONFIG_CACHE",
  "PATH",
  "SHELL",
  "SSL_CERT_DIR",
  "SSL_CERT_FILE",
  "TEMP",
  "TERM",
  "TMP",
  "TMPDIR",
  "TZ",
  "USER",
  "npm_config_cache",
] as const;

export interface ConvexProductionExecutionStep {
  arguments: string[];
  command: "npm" | "npx";
  credential: "canary" | "deploy" | "none";
  environmentOverrides?: Record<string, string>;
  name: "canary" | "deploy" | "install";
}

export interface ConvexProductionDeploymentPlan {
  approvedSha: string;
  knownGoodSha: string;
  steps: ConvexProductionExecutionStep[];
  target: ConvexProductionTarget;
}

export interface ConvexProductionRollbackOnlyPlan {
  candidateSha: string;
  knownGoodSha: string;
  steps: ConvexProductionExecutionStep[];
  target: ConvexProductionTarget;
}

export interface ConvexProductionCanaryReceipt {
  assertions: Array<{
    assertion: "reactive-observation-p95" | "reactive-observation-p99";
    commitSha: string;
    deployment: string;
    environment: string;
    observationLatencyMs: number;
    result: "passed";
  }>;
  outcome: "passed";
  runtimeIdentity: {
    buildCommitSha: string;
    deploymentName: string;
  };
  sampleCount: number;
  zeroCustomerData: true;
}

export interface ConvexProductionDeploymentReceipt {
  approvedSha: string;
  canary: ConvexProductionCanaryReceipt;
  event: "convex_production_deployment_receipt";
  knownGoodSha: string;
  result: "passed";
  schemaVersion: 1;
  target: ConvexProductionTarget;
}

export interface ConvexProductionExecutionCredentials {
  canarySecret: string;
  deployKey: string;
}

export interface ConvexProductionDeploymentExecutor {
  cleanupCheckout(): void;
  executeStep(
    release: ConvexProductionDeploymentPlan,
    step: ConvexProductionExecutionStep,
  ): unknown;
  prepareCheckout(commitSha: string): void;
  recordRollbackAnchor?(anchor: ConvexProductionRollbackAnchor): void;
}

export interface AsyncConvexProductionDeploymentExecutor {
  cleanupCheckout(): Promise<void> | void;
  executeStep(
    release: ConvexProductionDeploymentPlan,
    step: ConvexProductionExecutionStep,
  ): Promise<unknown>;
  prepareCheckout(commitSha: string): Promise<void> | void;
  recordRollbackAnchor?(anchor: ConvexProductionRollbackAnchor): void;
}

export interface ConvexProductionRollbackOnlyExecutor {
  cleanupCheckout(): Promise<void> | void;
  executeStep(
    release: ConvexProductionRollbackOnlyPlan,
    step: ConvexProductionExecutionStep,
  ): Promise<unknown>;
  prepareCheckout(commitSha: string): Promise<void> | void;
}

export type ConvexProductionRollbackSignal =
  | "SIGHUP"
  | "SIGINT"
  | "SIGTERM";

export class ConvexProductionRollbackSignalGuard {
  private recordedSignal: ConvexProductionRollbackSignal | undefined;
  private providerMutationStarted = false;

  get mutationStarted() {
    return this.providerMutationStarted;
  }

  get signal() {
    return this.recordedSignal;
  }

  beginProviderMutation() {
    if (this.recordedSignal) {
      throw new Error("Convex rollback was interrupted before provider mutation");
    }
    this.providerMutationStarted = true;
  }

  record(signal: ConvexProductionRollbackSignal) {
    this.recordedSignal ??= signal;
    return !this.providerMutationStarted;
  }
}

export interface ConvexProductionRollbackAnchor {
  canary: ConvexProductionCanaryReceipt;
  knownGoodSha: string;
  result: "passed";
}

export type ConvexProductionFailureResult =
  | "baseline_failed"
  | "failed"
  | "interrupted_after_mutation"
  | "interrupted_before_mutation"
  | "rollback_failed"
  | "rollback_required";

export interface ConvexProductionFailureReceiptInput {
  approvedSha: string;
  checkedAt: string;
  failureStage: string;
  knownGoodReceiptSha256: string | null;
  knownGoodSha: string;
  result: ConvexProductionFailureResult;
  rollbackAnchor?: ConvexProductionRollbackAnchor;
  target: ConvexProductionTarget;
}

export interface ConvexProductionForcedRollbackReceiptInput {
  approvalReceiptSha256?: string;
  candidateSha: string;
  canary: ConvexProductionCanaryReceipt;
  checkedAt: string;
  interruptedBy: ConvexProductionRollbackSignal | null;
  knownGoodReceiptKind?: "genesis";
  knownGoodReceiptSha256: string;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export interface ConvexProductionForcedRollbackArguments {
  approvalReceiptPath?: string;
  knownGoodReceiptPath: string;
  knownGoodReceiptSha256: string;
  receiptOutputPath: string;
}

export interface ConvexProductionForcedRollbackReceiptExpectation {
  approvalReceiptSha256?: string;
  candidateSha: string;
  knownGoodReceiptSha256: string;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export interface ConvexProductionCandidateRollbackReceiptExpectation {
  candidateSha: string;
  knownGoodReceiptSha256: string;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export class ConvexProductionRollbackError extends Error {
  constructor(
    cause: unknown,
    readonly rollbackAnchor: ConvexProductionRollbackAnchor,
  ) {
    super("known-good Convex rollback failed", { cause });
    this.name = "ConvexProductionRollbackError";
  }
}

export class ConvexProductionCandidateError extends Error {
  constructor(
    cause: unknown,
    readonly rollbackAnchor: ConvexProductionRollbackAnchor,
  ) {
    super("Convex production candidate execution failed", { cause });
    this.name = "ConvexProductionCandidateError";
  }
}

export class ConvexProductionBaselineError extends Error {
  constructor(cause: unknown) {
    super("live known-good Convex baseline failed", { cause });
    this.name = "ConvexProductionBaselineError";
  }
}

export type ConvexProductionDeploymentResult =
  | {
      canary: ConvexProductionCanaryReceipt;
      promotionAllowed: true;
      result: "passed";
      rollbackAnchor: ConvexProductionRollbackAnchor;
    }
  | {
      candidate: {
        approvedSha: string;
        failedStep: "canary" | "deploy";
        result: "failed";
      };
      promotionAllowed: false;
      result: "candidate_failed_rolled_back";
      rollbackAnchor: ConvexProductionRollbackAnchor;
      rollback: {
        canary: ConvexProductionCanaryReceipt;
        knownGoodSha: string;
        result: "passed";
      };
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactObjectKeys(
  value: Record<string, unknown>,
  expected: string[],
  context: string,
) {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (
    actual.length !== required.length ||
    actual.some((key, index) => key !== required[index])
  ) {
    throw new Error(`${context} fields are invalid`);
  }
}

function requireStrictConvexProductionCanaryShape(value: unknown) {
  if (!isRecord(value) || !isRecord(value.runtimeIdentity)) {
    throw new Error("Convex production canary fields are invalid");
  }
  requireExactObjectKeys(
    value,
    [
      "assertions",
      "outcome",
      "runtimeIdentity",
      "sampleCount",
      "zeroCustomerData",
    ],
    "Convex production canary",
  );
  requireExactObjectKeys(
    value.runtimeIdentity,
    ["buildCommitSha", "deploymentName"],
    "Convex production canary runtime identity",
  );
  if (!Array.isArray(value.assertions)) {
    throw new Error("Convex production canary assertions are invalid");
  }
  for (const assertion of value.assertions) {
    if (!isRecord(assertion)) {
      throw new Error("Convex production canary assertion is invalid");
    }
    requireExactObjectKeys(
      assertion,
      [
        "assertion",
        "commitSha",
        "deployment",
        "environment",
        "observationLatencyMs",
        "result",
      ],
      "Convex production canary assertion",
    );
  }
}

function createConvexProductionExecutionSteps(
  approvedSha: string,
  target: ConvexProductionTarget,
): ConvexProductionExecutionStep[] {
  return [
    {
      arguments: ["ci", "--ignore-scripts"],
      command: "npm",
      credential: "none",
      name: "install",
    },
    {
      arguments: [
        "convex",
        "deploy",
        "--codegen",
        "disable",
        "--typecheck",
        "enable",
        "--message",
        approvedSha,
      ],
      command: "npx",
      credential: "deploy",
      name: "deploy",
    },
    {
      arguments: ["run", "--silent", "convex:probe"],
      command: "npm",
      credential: "canary",
      environmentOverrides: {
        NEXT_PUBLIC_CONVEX_URL: target.deploymentUrl,
      },
      name: "canary",
    },
  ];
}

function createConvexProductionRollbackPlan(
  candidate: ConvexProductionDeploymentPlan,
): ConvexProductionDeploymentPlan {
  return {
    approvedSha: candidate.knownGoodSha,
    knownGoodSha: candidate.knownGoodSha,
    steps: createConvexProductionExecutionSteps(
      candidate.knownGoodSha,
      candidate.target,
    ),
    target: candidate.target,
  };
}

export function createConvexProductionRollbackOnlyPlan(
  sourceEnvironment: ConvexEnvironment,
  pinnedProductionTarget: ConvexProductionTarget,
  repositoryCommitSha: string,
): ConvexProductionRollbackOnlyPlan {
  const candidate = createConvexProductionDeploymentPlan(
    sourceEnvironment,
    pinnedProductionTarget,
    repositoryCommitSha,
  );
  const rollback = createConvexProductionRollbackPlan(candidate);
  return {
    candidateSha: candidate.approvedSha,
    knownGoodSha: rollback.approvedSha,
    steps: rollback.steps,
    target: rollback.target,
  };
}

function requiredStep(
  plan: Pick<ConvexProductionDeploymentPlan, "steps">,
  name: ConvexProductionExecutionStep["name"],
) {
  const step = plan.steps.find((candidate) => candidate.name === name);
  if (!step) {
    throw new Error(`Convex production plan is missing the ${name} step`);
  }
  return step;
}

function executeDeploymentAttempt(
  plan: ConvexProductionDeploymentPlan,
  executor: ConvexProductionDeploymentExecutor,
) {
  executor.executeStep(plan, requiredStep(plan, "install"));
  executor.executeStep(plan, requiredStep(plan, "deploy"));
  return readPassingConvexProductionCanaryReceipt(
    executor.executeStep(plan, requiredStep(plan, "canary")),
    plan,
  );
}

async function executeDeploymentAttemptAsync(
  plan: ConvexProductionDeploymentPlan,
  executor: AsyncConvexProductionDeploymentExecutor,
) {
  await executor.executeStep(plan, requiredStep(plan, "install"));
  await executor.executeStep(plan, requiredStep(plan, "deploy"));
  return readPassingConvexProductionCanaryReceipt(
    await executor.executeStep(plan, requiredStep(plan, "canary")),
    plan,
  );
}

export function createConvexProductionStepEnvironment(
  sourceEnvironment: NodeJS.ProcessEnv,
  step: ConvexProductionExecutionStep,
  credentials: ConvexProductionExecutionCredentials,
  approvedSha: string,
): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {
    ...createConvexProductionBaseEnvironment(sourceEnvironment),
    ...step.environmentOverrides,
    SOURCERA_COMMIT_SHA: approvedSha,
    SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
  };
  if (step.credential === "deploy") {
    environment.CONVEX_DEPLOY_KEY = credentials.deployKey;
  } else if (step.credential === "canary") {
    environment.SOURCERA_CONVEX_CANARY_SECRET = credentials.canarySecret;
  }
  return environment;
}

export function createConvexProductionBaseEnvironment(
  sourceEnvironment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  const environment: Record<string, string | undefined> = {};
  for (const key of SAFE_PROCESS_ENVIRONMENT_KEYS) {
    if (sourceEnvironment[key] !== undefined) {
      environment[key] = sourceEnvironment[key];
    }
  }
  for (const key of ["SOURCERA_ENV", "SOURCERA_KNOWN_GOOD_SHA"] as const) {
    if (sourceEnvironment[key] !== undefined) {
      environment[key] = sourceEnvironment[key];
    }
  }
  return environment as NodeJS.ProcessEnv;
}

export function executeConvexProductionDeployment(
  plan: ConvexProductionDeploymentPlan,
  executor: ConvexProductionDeploymentExecutor,
): ConvexProductionDeploymentResult {
  let checkoutPrepared = false;
  const prepareCheckout = (commitSha: string) => {
    executor.prepareCheckout(commitSha);
    checkoutPrepared = true;
  };
  const cleanupCheckout = () => {
    if (!checkoutPrepared) return;
    executor.cleanupCheckout();
    checkoutPrepared = false;
  };

  const rollbackPlan = createConvexProductionRollbackPlan(plan);
  prepareCheckout(rollbackPlan.approvedSha);
  let baselineCanary: ConvexProductionCanaryReceipt;
  try {
    executor.executeStep(
      rollbackPlan,
      requiredStep(rollbackPlan, "install"),
    );
    baselineCanary = readPassingConvexProductionCanaryReceipt(
      executor.executeStep(
        rollbackPlan,
        requiredStep(rollbackPlan, "canary"),
      ),
      rollbackPlan,
    );
  } catch (cause) {
    throw new ConvexProductionBaselineError(cause);
  } finally {
    cleanupCheckout();
  }

  const rollbackAnchor = {
    canary: baselineCanary,
    knownGoodSha: rollbackPlan.approvedSha,
    result: "passed" as const,
  };
  executor.recordRollbackAnchor?.(rollbackAnchor);
  prepareCheckout(plan.approvedSha);
  try {
    executor.executeStep(plan, requiredStep(plan, "install"));
    let failedStep: "canary" | "deploy" = "deploy";
    try {
      executor.executeStep(plan, requiredStep(plan, "deploy"));
      failedStep = "canary";
      return {
        canary: readPassingConvexProductionCanaryReceipt(
          executor.executeStep(plan, requiredStep(plan, "canary")),
          plan,
        ),
        promotionAllowed: true,
        result: "passed",
        rollbackAnchor,
      };
    } catch {
      cleanupCheckout();
      try {
        prepareCheckout(rollbackPlan.approvedSha);
        const rollbackCanary = executeDeploymentAttempt(
          rollbackPlan,
          executor,
        );
        return {
          candidate: {
            approvedSha: plan.approvedSha,
            failedStep,
            result: "failed",
          },
          promotionAllowed: false,
          result: "candidate_failed_rolled_back",
          rollbackAnchor,
          rollback: {
            canary: rollbackCanary,
            knownGoodSha: rollbackPlan.approvedSha,
            result: "passed",
          },
        };
      } catch (cause) {
        throw new ConvexProductionRollbackError(cause, rollbackAnchor);
      }
    }
  } catch (cause) {
    if (cause instanceof ConvexProductionRollbackError) throw cause;
    throw new ConvexProductionCandidateError(cause, rollbackAnchor);
  } finally {
    cleanupCheckout();
  }
}

/**
 * Async production execution keeps Node's signal loop responsive while a
 * provider command is active. Candidate ambiguity always flows through the
 * same known-good redeploy and canary proof as an ordinary candidate failure.
 */
export async function executeConvexProductionDeploymentAsync(
  plan: ConvexProductionDeploymentPlan,
  executor: AsyncConvexProductionDeploymentExecutor,
): Promise<ConvexProductionDeploymentResult> {
  let checkoutPrepared = false;
  const prepareCheckout = async (commitSha: string) => {
    await executor.prepareCheckout(commitSha);
    checkoutPrepared = true;
  };
  const cleanupCheckout = async () => {
    if (!checkoutPrepared) return;
    await executor.cleanupCheckout();
    checkoutPrepared = false;
  };

  const rollbackPlan = createConvexProductionRollbackPlan(plan);
  await prepareCheckout(rollbackPlan.approvedSha);
  let baselineCanary: ConvexProductionCanaryReceipt;
  try {
    await executor.executeStep(
      rollbackPlan,
      requiredStep(rollbackPlan, "install"),
    );
    baselineCanary = readPassingConvexProductionCanaryReceipt(
      await executor.executeStep(
        rollbackPlan,
        requiredStep(rollbackPlan, "canary"),
      ),
      rollbackPlan,
    );
  } catch (cause) {
    throw new ConvexProductionBaselineError(cause);
  } finally {
    await cleanupCheckout();
  }

  const rollbackAnchor = {
    canary: baselineCanary,
    knownGoodSha: rollbackPlan.approvedSha,
    result: "passed" as const,
  };
  executor.recordRollbackAnchor?.(rollbackAnchor);
  await prepareCheckout(plan.approvedSha);
  try {
    await executor.executeStep(plan, requiredStep(plan, "install"));
    let failedStep: "canary" | "deploy" = "deploy";
    try {
      await executor.executeStep(plan, requiredStep(plan, "deploy"));
      failedStep = "canary";
      return {
        canary: readPassingConvexProductionCanaryReceipt(
          await executor.executeStep(plan, requiredStep(plan, "canary")),
          plan,
        ),
        promotionAllowed: true,
        result: "passed",
        rollbackAnchor,
      };
    } catch {
      await cleanupCheckout();
      try {
        await prepareCheckout(rollbackPlan.approvedSha);
        const rollbackCanary = await executeDeploymentAttemptAsync(
          rollbackPlan,
          executor,
        );
        return {
          candidate: {
            approvedSha: plan.approvedSha,
            failedStep,
            result: "failed",
          },
          promotionAllowed: false,
          result: "candidate_failed_rolled_back",
          rollbackAnchor,
          rollback: {
            canary: rollbackCanary,
            knownGoodSha: rollbackPlan.approvedSha,
            result: "passed",
          },
        };
      } catch (cause) {
        throw new ConvexProductionRollbackError(cause, rollbackAnchor);
      }
    }
  } catch (cause) {
    if (cause instanceof ConvexProductionRollbackError) throw cause;
    throw new ConvexProductionCandidateError(cause, rollbackAnchor);
  } finally {
    await cleanupCheckout();
  }
}

export async function executeConvexProductionRollbackOnly(
  plan: ConvexProductionRollbackOnlyPlan,
  executor: ConvexProductionRollbackOnlyExecutor,
) {
  let checkoutPrepared = false;
  try {
    await executor.prepareCheckout(plan.knownGoodSha);
    checkoutPrepared = true;
    await executor.executeStep(plan, requiredStep(plan, "install"));
    await executor.executeStep(plan, requiredStep(plan, "deploy"));
    const canary = readPassingConvexProductionCanaryReceipt(
      await executor.executeStep(plan, requiredStep(plan, "canary")),
      {
        approvedSha: plan.knownGoodSha,
        knownGoodSha: plan.knownGoodSha,
        steps: plan.steps,
        target: plan.target,
      },
    );
    return {
      canary,
      checkout: {
        cleanBeforeInstall: true as const,
        commitSha: plan.knownGoodSha,
        detached: true as const,
      },
      result: "known_good_restored" as const,
    };
  } finally {
    if (checkoutPrepared) await executor.cleanupCheckout();
  }
}

export function readPassingConvexProductionCanaryReceipt(
  value: unknown,
  plan: ConvexProductionDeploymentPlan,
): ConvexProductionCanaryReceipt {
  if (!isRecord(value) || !isRecord(value.runtimeIdentity)) {
    throw new Error("Convex production canary receipt is incomplete");
  }
  const assertions = value.assertions;
  if (
    value.outcome !== "passed" ||
    value.zeroCustomerData !== true ||
    value.sampleCount !== 20 ||
    value.runtimeIdentity.buildCommitSha !== plan.approvedSha ||
    value.runtimeIdentity.deploymentName !== plan.target.deploymentName ||
    !Array.isArray(assertions) ||
    assertions.length !== 2 ||
    !assertions.every(
      (assertion) =>
        isRecord(assertion) &&
        assertion.commitSha === plan.approvedSha &&
        assertion.deployment === plan.target.deploymentName &&
        assertion.environment === "production" &&
        ((assertion.assertion === "reactive-observation-p95" &&
          typeof assertion.observationLatencyMs === "number" &&
          assertion.observationLatencyMs >= 0 &&
          assertion.observationLatencyMs <= 500) ||
          (assertion.assertion === "reactive-observation-p99" &&
            typeof assertion.observationLatencyMs === "number" &&
            assertion.observationLatencyMs >= 0 &&
            assertion.observationLatencyMs <= 1_000)) &&
        assertion.result === "passed",
    ) ||
    new Set(
      assertions.map((assertion) =>
        isRecord(assertion) ? assertion.assertion : undefined,
      ),
    ).size !== 2
  ) {
    throw new Error("Convex production canary receipt does not match the release");
  }
  return value as unknown as ConvexProductionCanaryReceipt;
}

function readReceiptTarget(value: Record<string, unknown>) {
  if (
    !isRecord(value.target) ||
    typeof value.target.deploymentName !== "string" ||
    typeof value.target.deploymentUrl !== "string"
  ) {
    throw new Error("Convex production receipt target is incomplete");
  }
  return readConvexProductionTarget(
    value.target.deploymentName,
    value.target.deploymentUrl,
  );
}

function requirePassingRollbackAnchor(
  value: Record<string, unknown>,
  expectedKnownGoodSha: string,
  target: ConvexProductionTarget,
) {
  if (
    !isRecord(value.rollbackAnchor) ||
    value.rollbackAnchor.result !== "passed" ||
    value.rollbackAnchor.knownGoodSha !== expectedKnownGoodSha
  ) {
    throw new Error("Convex production rollback anchor is incomplete");
  }
  readPassingConvexProductionCanaryReceipt(value.rollbackAnchor.canary, {
    approvedSha: expectedKnownGoodSha,
    knownGoodSha: expectedKnownGoodSha,
    steps: [],
    target,
  });
}

function requireCompleteConvexProductionReceipt(value: unknown) {
  try {
    if (
      !isRecord(value) ||
      value.schemaVersion !== 1 ||
      typeof value.checkedAt !== "string" ||
      new Date(value.checkedAt).toISOString() !== value.checkedAt
    ) {
      throw new Error("Convex production receipt header is incomplete");
    }
    const target = readReceiptTarget(value);
    if (value.event === "convex_production_deployment_receipt") {
      if (
        value.result !== "passed" ||
        typeof value.approvedSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.approvedSha) ||
        typeof value.knownGoodSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.knownGoodSha) ||
        value.approvedSha === value.knownGoodSha ||
        typeof value.knownGoodReceiptSha256 !== "string" ||
        !RECEIPT_HASH.test(value.knownGoodReceiptSha256)
      ) {
        throw new Error("Convex deployment receipt is incomplete");
      }
      readPassingConvexProductionCanaryReceipt(value.canary, {
        approvedSha: value.approvedSha,
        knownGoodSha: value.knownGoodSha,
        steps: [],
        target,
      });
      requirePassingRollbackAnchor(value, value.knownGoodSha, target);
      return;
    }
    if (value.event === "convex_production_rollback_receipt") {
      if (
        value.result !== "candidate_failed_rolled_back" ||
        value.promotionAllowed !== false ||
        !isRecord(value.candidate) ||
        typeof value.candidate.approvedSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.candidate.approvedSha) ||
        value.candidate.result !== "failed" ||
        !["canary", "deploy"].includes(
          typeof value.candidate.failedStep === "string"
            ? value.candidate.failedStep
            : "",
        ) ||
        !isRecord(value.rollback) ||
        value.rollback.result !== "passed" ||
        typeof value.rollback.knownGoodSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.rollback.knownGoodSha) ||
        value.rollback.knownGoodSha === value.candidate.approvedSha ||
        typeof value.rollback.knownGoodReceiptSha256 !== "string" ||
        !RECEIPT_HASH.test(value.rollback.knownGoodReceiptSha256)
      ) {
        throw new Error("Convex rollback receipt is incomplete");
      }
      readPassingConvexProductionCanaryReceipt(value.rollback.canary, {
        approvedSha: value.rollback.knownGoodSha,
        knownGoodSha: value.rollback.knownGoodSha,
        steps: [],
        target,
      });
      requirePassingRollbackAnchor(
        value,
        value.rollback.knownGoodSha,
        target,
      );
      return;
    }
    if (value.event === "convex_production_forced_rollback_receipt") {
      const forcedRollbackFields = [
        "candidateSha",
        "canary",
        "checkedAt",
        "checkout",
        "event",
        "interruptedBy",
        "knownGoodReceiptSha256",
        "knownGoodSha",
        "promotionAllowed",
        "result",
        "schemaVersion",
        "target",
      ];
      const hasGenesisBinding =
        value.knownGoodReceiptKind !== undefined ||
        value.approvalReceiptSha256 !== undefined;
      requireExactObjectKeys(
        value,
        hasGenesisBinding
          ? [
              ...forcedRollbackFields,
              "approvalReceiptSha256",
              "knownGoodReceiptKind",
            ]
          : forcedRollbackFields,
        "Convex forced rollback receipt",
      );
      const normalKnownGoodReceipt =
        value.knownGoodReceiptKind === undefined &&
        value.approvalReceiptSha256 === undefined;
      const genesisKnownGoodReceipt =
        value.knownGoodReceiptKind === "genesis" &&
        typeof value.approvalReceiptSha256 === "string" &&
        RECEIPT_HASH.test(value.approvalReceiptSha256);
      if (
        value.result !== "known_good_restored" ||
        value.promotionAllowed !== false ||
        typeof value.candidateSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.candidateSha) ||
        typeof value.knownGoodSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.knownGoodSha) ||
        value.knownGoodSha === value.candidateSha ||
        typeof value.knownGoodReceiptSha256 !== "string" ||
        !RECEIPT_HASH.test(value.knownGoodReceiptSha256) ||
        !(normalKnownGoodReceipt || genesisKnownGoodReceipt) ||
        !(
          value.interruptedBy === null ||
          ["SIGHUP", "SIGINT", "SIGTERM"].includes(
            typeof value.interruptedBy === "string"
              ? value.interruptedBy
              : "",
          )
        ) ||
        !isRecord(value.checkout) ||
        value.checkout.cleanBeforeInstall !== true ||
        value.checkout.commitSha !== value.knownGoodSha ||
        value.checkout.detached !== true
      ) {
        throw new Error("Convex forced rollback receipt is incomplete");
      }
      requireExactObjectKeys(
        value.checkout,
        ["cleanBeforeInstall", "commitSha", "detached"],
        "Convex forced rollback checkout",
      );
      requireExactObjectKeys(
        value.target as Record<string, unknown>,
        ["deploymentName", "deploymentUrl"],
        "Convex forced rollback target",
      );
      requireStrictConvexProductionCanaryShape(value.canary);
      readPassingConvexProductionCanaryReceipt(value.canary, {
        approvedSha: value.knownGoodSha,
        knownGoodSha: value.knownGoodSha,
        steps: [],
        target,
      });
      return;
    }
    if (value.event === "convex_production_failure_receipt") {
      if (
        ![
          "baseline_failed",
          "failed",
          "interrupted_after_mutation",
          "interrupted_before_mutation",
          "rollback_failed",
          "rollback_required",
        ].includes(
          typeof value.result === "string" ? value.result : "",
        ) ||
        value.promotionAllowed !== false ||
        typeof value.failureStage !== "string" ||
        !value.failureStage.trim() ||
        typeof value.approvedSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.approvedSha) ||
        typeof value.knownGoodSha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(value.knownGoodSha) ||
        value.knownGoodSha === value.approvedSha ||
        !(
          (typeof value.knownGoodReceiptSha256 === "string" &&
            RECEIPT_HASH.test(value.knownGoodReceiptSha256)) ||
          (value.knownGoodReceiptSha256 === null &&
            [
              "baseline_failed",
              "failed",
              "interrupted_before_mutation",
            ].includes(typeof value.result === "string" ? value.result : ""))
        )
      ) {
        throw new Error("Convex failure receipt is incomplete");
      }
      if (value.result === "baseline_failed") {
        if (value.rollbackAnchor !== undefined) {
          throw new Error("Failed baseline cannot claim a rollback anchor");
        }
        return;
      }
      if (value.result === "interrupted_before_mutation") {
        if (value.rollbackAnchor !== undefined) {
          requirePassingRollbackAnchor(value, value.knownGoodSha, target);
        }
        return;
      }
      if (value.result === "failed" && value.rollbackAnchor === undefined) {
        return;
      }
      requirePassingRollbackAnchor(value, value.knownGoodSha, target);
      return;
    }
    throw new Error("Convex production receipt event is invalid");
  } catch (cause) {
    throw new Error(
      "Receipt does not contain a complete Convex production receipt",
      { cause },
    );
  }
}

export function createConvexProductionFailureReceipt(
  input: ConvexProductionFailureReceiptInput,
) {
  const receipt = {
    approvedSha: input.approvedSha,
    checkedAt: input.checkedAt,
    event: "convex_production_failure_receipt" as const,
    failureStage: input.failureStage,
    knownGoodReceiptSha256: input.knownGoodReceiptSha256,
    knownGoodSha: input.knownGoodSha,
    promotionAllowed: false as const,
    result: input.result,
    ...(input.rollbackAnchor
      ? { rollbackAnchor: input.rollbackAnchor }
      : {}),
    schemaVersion: 1 as const,
    target: input.target,
  };
  requireCompleteConvexProductionReceipt(receipt);
  return receipt;
}

export function createConvexProductionForcedRollbackReceipt(
  input: ConvexProductionForcedRollbackReceiptInput,
) {
  const normalKnownGoodReceipt =
    input.knownGoodReceiptKind === undefined &&
    input.approvalReceiptSha256 === undefined;
  const genesisKnownGoodReceipt =
    input.knownGoodReceiptKind === "genesis" &&
    typeof input.approvalReceiptSha256 === "string" &&
    RECEIPT_HASH.test(input.approvalReceiptSha256);
  if (!(normalKnownGoodReceipt || genesisKnownGoodReceipt)) {
    throw new Error("Convex forced rollback approval binding is invalid");
  }
  const receipt = {
    ...(genesisKnownGoodReceipt
      ? {
          approvalReceiptSha256: input.approvalReceiptSha256!,
          knownGoodReceiptKind: "genesis" as const,
        }
      : {}),
    candidateSha: input.candidateSha,
    canary: input.canary,
    checkedAt: input.checkedAt,
    checkout: {
      cleanBeforeInstall: true as const,
      commitSha: input.knownGoodSha,
      detached: true as const,
    },
    event: "convex_production_forced_rollback_receipt" as const,
    interruptedBy: input.interruptedBy,
    knownGoodReceiptSha256: input.knownGoodReceiptSha256,
    knownGoodSha: input.knownGoodSha,
    promotionAllowed: false as const,
    result: "known_good_restored" as const,
    schemaVersion: 1 as const,
    target: input.target,
  };
  requireCompleteConvexProductionReceipt(receipt);
  return receipt;
}

export function readPassingConvexProductionForcedRollbackReceipt(
  value: unknown,
  expected: ConvexProductionForcedRollbackReceiptExpectation,
) {
  requireCompleteConvexProductionReceipt(value);
  if (!isRecord(value) || value.event !== "convex_production_forced_rollback_receipt") {
    throw new Error("Convex forced rollback receipt is not a passing receipt");
  }
  const expectsGenesis = expected.approvalReceiptSha256 !== undefined;
  if (
    value.candidateSha !== expected.candidateSha ||
    value.knownGoodSha !== expected.knownGoodSha ||
    value.knownGoodReceiptSha256 !== expected.knownGoodReceiptSha256 ||
    !isRecord(value.target) ||
    value.target.deploymentName !== expected.target.deploymentName ||
    value.target.deploymentUrl !== expected.target.deploymentUrl ||
    (expectsGenesis
      ? value.knownGoodReceiptKind !== "genesis" ||
        value.approvalReceiptSha256 !== expected.approvalReceiptSha256
      : value.knownGoodReceiptKind !== undefined ||
        value.approvalReceiptSha256 !== undefined)
  ) {
    throw new Error("Convex forced rollback receipt does not match the release");
  }
  return value;
}

export function readPassingConvexProductionCandidateRollbackReceipt(
  value: unknown,
  expected: ConvexProductionCandidateRollbackReceiptExpectation,
) {
  requireCompleteConvexProductionReceipt(value);
  if (
    !isRecord(value) ||
    value.event !== "convex_production_rollback_receipt" ||
    !isRecord(value.candidate) ||
    !isRecord(value.rollback) ||
    value.candidate.approvedSha !== expected.candidateSha ||
    value.rollback.knownGoodSha !== expected.knownGoodSha ||
    value.rollback.knownGoodReceiptSha256 !==
      expected.knownGoodReceiptSha256 ||
    !isRecord(value.target) ||
    value.target.deploymentName !== expected.target.deploymentName ||
    value.target.deploymentUrl !== expected.target.deploymentUrl
  ) {
    throw new Error("Convex candidate rollback receipt does not match the release");
  }
  requireExactObjectKeys(
    value,
    [
      "candidate",
      "checkedAt",
      "event",
      "promotionAllowed",
      "result",
      "rollback",
      "rollbackAnchor",
      "schemaVersion",
      "target",
    ],
    "Convex candidate rollback receipt",
  );
  requireExactObjectKeys(
    value.candidate,
    ["approvedSha", "failedStep", "result"],
    "Convex candidate rollback",
  );
  requireExactObjectKeys(
    value.rollback,
    ["canary", "knownGoodReceiptSha256", "knownGoodSha", "result"],
    "Convex candidate rollback proof",
  );
  requireExactObjectKeys(
    value.rollbackAnchor as Record<string, unknown>,
    ["canary", "knownGoodSha", "result"],
    "Convex candidate rollback anchor",
  );
  requireStrictConvexProductionCanaryShape(value.rollback.canary);
  requireStrictConvexProductionCanaryShape(
    (value.rollbackAnchor as Record<string, unknown>).canary,
  );
  return value;
}

function canonicalizeReceiptPath(value: string) {
  let existingAncestor = path.resolve(value);
  const missingSegments: string[] = [];
  while (!existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    if (parent === existingAncestor) break;
    missingSegments.unshift(path.basename(existingAncestor));
    existingAncestor = parent;
  }
  return path.join(realpathSync(existingAncestor), ...missingSegments);
}

function requireReceiptOutsideRepository(value: string, repositoryRoot: string) {
  const relative = path.relative(realpathSync(repositoryRoot), value);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("Convex receipt output must remain outside the repository");
  }
}

export function readConvexProductionForcedRollbackArguments(
  arguments_: string[],
  repositoryRoot: string,
): ConvexProductionForcedRollbackArguments {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (
      ![
        "--approval-receipt",
        "--known-good-receipt",
        "--known-good-receipt-sha256",
        "--receipt-out",
      ].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error(
        "Usage: rollback-convex-production --known-good-receipt <path> --known-good-receipt-sha256 <sha256> [--approval-receipt <path>] --receipt-out <path>",
      );
    }
    values.set(option, value);
  }
  if (
    values.size < 3 ||
    values.size > 4 ||
    !values.has("--known-good-receipt") ||
    !values.has("--known-good-receipt-sha256") ||
    !values.has("--receipt-out")
  ) {
    throw new Error(
      "Usage: rollback-convex-production --known-good-receipt <path> --known-good-receipt-sha256 <sha256> [--approval-receipt <path>] --receipt-out <path>",
    );
  }
  const knownGoodReceiptSha256 = values.get(
    "--known-good-receipt-sha256",
  )!;
  if (!RECEIPT_HASH.test(knownGoodReceiptSha256)) {
    throw new Error("--known-good-receipt-sha256 must be an exact SHA-256");
  }
  const knownGoodReceiptPath = realpathSync(
    values.get("--known-good-receipt")!,
  );
  const approvalReceiptPath = values.has("--approval-receipt")
    ? realpathSync(values.get("--approval-receipt")!)
    : undefined;
  const receiptOutputPath = canonicalizeReceiptPath(
    values.get("--receipt-out")!,
  );
  requireReceiptOutsideRepository(knownGoodReceiptPath, repositoryRoot);
  if (approvalReceiptPath) {
    requireReceiptOutsideRepository(approvalReceiptPath, repositoryRoot);
  }
  requireReceiptOutsideRepository(receiptOutputPath, repositoryRoot);
  if (
    knownGoodReceiptPath === receiptOutputPath ||
    approvalReceiptPath === knownGoodReceiptPath ||
    approvalReceiptPath === receiptOutputPath
  ) {
    throw new Error("Convex forced rollback receipt paths must be distinct");
  }
  if (existsSync(receiptOutputPath)) {
    throw new Error("--receipt-out must not already exist");
  }
  return {
    ...(approvalReceiptPath ? { approvalReceiptPath } : {}),
    knownGoodReceiptPath,
    knownGoodReceiptSha256: knownGoodReceiptSha256.toLowerCase(),
    receiptOutputPath,
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

export function writeConvexProductionReceipt(
  receiptPath: string,
  receipt: unknown,
  repositoryRoot: string,
) {
  requireCompleteConvexProductionReceipt(receipt);
  const outputPath = canonicalizeReceiptPath(receiptPath);
  requireReceiptOutsideRepository(outputPath, repositoryRoot);
  const directory = path.dirname(outputPath);
  mkdirSync(directory, { recursive: true });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  writeFileSync(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    linkSync(temporaryPath, outputPath);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new Error(`Convex receipt output already exists: ${outputPath}`);
    }
    throw error;
  } finally {
    rmSync(temporaryPath, { force: true });
  }
  return outputPath;
}

export function readPassingKnownGoodConvexReceipt(
  value: unknown,
  expectedCommitSha: string,
  expectedTarget: ConvexProductionTarget,
  genesisBinding?: Omit<
    ConvexProductionGenesisExpectation,
    "knownGoodSha" | "target"
  >,
): ConvexProductionDeploymentReceipt | ConvexProductionGenesisReceipt {
  if (
    isRecord(value) &&
    value.event === "convex_production_genesis_receipt"
  ) {
    if (!genesisBinding) {
      throw new Error("Genesis Convex receipt requires current-run binding");
    }
    return readPassingConvexProductionGenesisReceipt(value, {
      ...genesisBinding,
      knownGoodSha: expectedCommitSha,
      target: expectedTarget,
    });
  }
  requireCompleteConvexProductionReceipt(value);
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    value.event !== "convex_production_deployment_receipt" ||
    value.result !== "passed" ||
    value.approvedSha !== expectedCommitSha ||
    !FULL_GIT_COMMIT_SHA.test(expectedCommitSha) ||
    !isRecord(value.target) ||
    value.target.deploymentName !== expectedTarget.deploymentName ||
    value.target.deploymentUrl !== expectedTarget.deploymentUrl
  ) {
    throw new Error("Known-good Convex receipt does not match the rollback target");
  }
  readPassingConvexProductionCanaryReceipt(value.canary, {
    approvedSha: expectedCommitSha,
    knownGoodSha:
      typeof value.knownGoodSha === "string" ? value.knownGoodSha : "",
    steps: [],
    target: expectedTarget,
  });
  return value as unknown as ConvexProductionDeploymentReceipt;
}

export interface ConvexProductionKnownGoodReceiptExpectation {
  approvedCandidateSha: string;
  githubRepository: "meetblakey/sourcera";
  githubRunAttempt: number;
  githubRunId: number;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export interface ConvexProductionForcedRollbackInputExpectation {
  candidateSha: string;
  githubRepository?: string;
  githubRunAttempt?: number;
  githubRunId?: number;
  knownGoodReceiptSha256: string;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

function parseReceiptBytes(value: Uint8Array, context: string) {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(value);
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new Error(`${context} is not valid UTF-8 JSON`, { cause });
  }
}

export function readConvexProductionKnownGoodReceiptBytes(
  knownGoodReceiptBytes: Uint8Array,
  approvalReceiptBytes: Uint8Array | undefined,
  expected: ConvexProductionKnownGoodReceiptExpectation,
) {
  const value = parseReceiptBytes(
    knownGoodReceiptBytes,
    "Known-good Convex receipt",
  );
  const knownGoodReceiptSha256 = createHash("sha256")
    .update(knownGoodReceiptBytes)
    .digest("hex");
  const genesis =
    isRecord(value) && value.event === "convex_production_genesis_receipt";
  if (!genesis) {
    if (approvalReceiptBytes !== undefined) {
      throw new Error("Normal Convex receipt forbids current approval input");
    }
    return {
      knownGoodReceiptSha256,
      receipt: readPassingKnownGoodConvexReceipt(
        value,
        expected.knownGoodSha,
        expected.target,
      ),
    };
  }
  if (approvalReceiptBytes === undefined) {
    throw new Error("Genesis Convex receipt requires current approval input");
  }
  if (expected.githubRunAttempt !== 1) {
    throw new Error("Genesis Convex receipt requires GitHub run attempt 1");
  }
  const approvalReceiptSha256 = createHash("sha256")
    .update(approvalReceiptBytes)
    .digest("hex");
  readGithubProductionApprovalReceipt(
    parseReceiptBytes(approvalReceiptBytes, "GitHub production approval receipt"),
    {
      approvedCandidateSha: expected.approvedCandidateSha,
      githubRepository: expected.githubRepository,
      githubRunAttempt: 1,
      githubRunId: expected.githubRunId,
    },
  );
  return {
    approvalReceiptSha256,
    knownGoodReceiptSha256,
    receipt: readPassingKnownGoodConvexReceipt(
      value,
      expected.knownGoodSha,
      expected.target,
      {
        approvedCandidateSha: expected.approvedCandidateSha,
        approvalReceiptSha256,
        githubRunAttempt: expected.githubRunAttempt,
        githubRunId: expected.githubRunId,
      },
    ),
  };
}

export function readConvexProductionForcedRollbackInputBytes(
  knownGoodReceiptBytes: Uint8Array,
  approvalReceiptBytes: Uint8Array | undefined,
  expected: ConvexProductionForcedRollbackInputExpectation,
) {
  if (
    !FULL_GIT_COMMIT_SHA.test(expected.candidateSha) ||
    !FULL_GIT_COMMIT_SHA.test(expected.knownGoodSha) ||
    expected.candidateSha === expected.knownGoodSha ||
    !RECEIPT_HASH.test(expected.knownGoodReceiptSha256)
  ) {
    throw new Error("Convex forced rollback release binding is invalid");
  }
  const knownGoodReceiptSha256 = createHash("sha256")
    .update(knownGoodReceiptBytes)
    .digest("hex");
  if (
    knownGoodReceiptSha256 !==
    expected.knownGoodReceiptSha256.toLowerCase()
  ) {
    throw new Error("Exact known-good receipt bytes do not match SHA-256");
  }
  const value = parseReceiptBytes(
    knownGoodReceiptBytes,
    "Known-good Convex rollback receipt",
  );
  const genesis =
    isRecord(value) && value.event === "convex_production_genesis_receipt";
  if (!genesis) {
    if (approvalReceiptBytes !== undefined) {
      throw new Error("Normal Convex receipt forbids current approval input");
    }
    return {
      kind: "normal" as const,
      knownGoodReceiptSha256,
      receipt: readPassingKnownGoodConvexReceipt(
        value,
        expected.knownGoodSha,
        expected.target,
      ),
    };
  }
  if (
    expected.githubRepository !== "meetblakey/sourcera" ||
    expected.githubRunAttempt !== 1 ||
    !Number.isSafeInteger(expected.githubRunId) ||
    Number(expected.githubRunId) < 1
  ) {
    throw new Error("Genesis forced rollback GitHub binding is invalid");
  }
  const validated = readConvexProductionKnownGoodReceiptBytes(
    knownGoodReceiptBytes,
    approvalReceiptBytes,
    {
      approvedCandidateSha: expected.candidateSha,
      githubRepository: "meetblakey/sourcera",
      githubRunAttempt: 1,
      githubRunId: expected.githubRunId!,
      knownGoodSha: expected.knownGoodSha,
      target: expected.target,
    },
  );
  if (
    validated.knownGoodReceiptSha256 !== knownGoodReceiptSha256 ||
    validated.approvalReceiptSha256 === undefined
  ) {
    throw new Error("Genesis forced rollback approval binding is incomplete");
  }
  return {
    approvalReceiptSha256: validated.approvalReceiptSha256,
    kind: "genesis" as const,
    knownGoodReceiptSha256,
    receipt: validated.receipt,
  };
}

export function createConvexProductionDeploymentPlan(
  sourceEnvironment: ConvexEnvironment,
  pinnedProductionTarget: ConvexProductionTarget,
  repositoryCommitSha: string,
): ConvexProductionDeploymentPlan {
  if (sourceEnvironment.VERCEL === "1") {
    throw new Error("Central Convex production deploy cannot run inside Vercel");
  }
  if (sourceEnvironment.SOURCERA_ENV !== "production") {
    throw new Error("SOURCERA_ENV must be production for central deploy");
  }
  if (sourceEnvironment.SOURCERA_COMMIT_SHA !== repositoryCommitSha) {
    throw new Error("SOURCERA_COMMIT_SHA must match the checked-out Git commit");
  }
  const knownGoodSha = sourceEnvironment.SOURCERA_KNOWN_GOOD_SHA;
  if (!knownGoodSha || !FULL_GIT_COMMIT_SHA.test(knownGoodSha)) {
    throw new Error("SOURCERA_KNOWN_GOOD_SHA must be a Git commit SHA");
  }
  if (knownGoodSha === repositoryCommitSha) {
    throw new Error("SOURCERA_KNOWN_GOOD_SHA must predate the candidate release");
  }

  const target = readConvexProductionTarget(
    pinnedProductionTarget.deploymentName,
    pinnedProductionTarget.deploymentUrl,
  );
  readRequiredConvexProductionKeyIdentity(sourceEnvironment, target);
  const canarySecret = sourceEnvironment.SOURCERA_CONVEX_CANARY_SECRET;
  if (!canarySecret || canarySecret.length < 32) {
    throw new Error("SOURCERA_CONVEX_CANARY_SECRET must be at least 32 characters");
  }

  return {
    approvedSha: repositoryCommitSha,
    knownGoodSha,
    steps: createConvexProductionExecutionSteps(repositoryCommitSha, target),
    target,
  };
}
