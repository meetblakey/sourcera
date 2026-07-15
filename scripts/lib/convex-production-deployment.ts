import { randomUUID } from "node:crypto";
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

function requiredStep(
  plan: ConvexProductionDeploymentPlan,
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
): ConvexProductionDeploymentReceipt {
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
