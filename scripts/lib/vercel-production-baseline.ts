import { createHash } from "node:crypto";

import {
  readVercelProductionReleaseConfig,
  type VercelProductionApplication,
  type VercelProductionReleaseConfig,
  type VercelProductionTarget,
} from "./vercel-production-release";

const APPLICATIONS = ["marketplace", "buyer", "seller"] as const;
const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9_-]+$/;
const SHA256 = /^[a-f0-9]{64}$/;

type Awaitable<T> = T | Promise<T>;

export interface VercelProductionBaselineProviderMetadata {
  allowedProductionEnvironmentKeys: string[];
  convexTarget: {
    deploymentName: string;
    deploymentUrl: string;
  };
  productionDomain: string | null;
  productionDomains: string[];
  projectId: string;
  projectName: string;
  rootDirectory: string | null;
  teamId: string;
}

export interface VercelProductionBaselineCurrentDeployment {
  deploymentId: string;
  healthy: boolean;
  providerGitSha: string | null;
  readyState: string;
}

export interface VercelProductionBaselineCandidate {
  deploymentId: string;
  health: {
    checkedAt: string;
    commitSha: string;
    domain: VercelProductionApplication;
    environment: "production";
    service: "sourcera";
    status: "error" | "ok";
  };
  healthy: boolean;
  providerGitSha: string;
  readyState: string;
  readySubstate: string;
  target: string;
  url: string;
}

export interface VercelProductionBaselineProjectInspection {
  application: VercelProductionApplication;
  current: VercelProductionBaselineCurrentDeployment | null;
  metadata: VercelProductionBaselineProviderMetadata;
}

export interface VercelProductionBaselineApplicationInspection
  extends VercelProductionBaselineProjectInspection {
  candidate: VercelProductionBaselineCandidate;
}

export interface VercelProductionBaselineDependencies {
  inspectApplication(
    application: VercelProductionApplication,
    target: VercelProductionTarget,
    deploymentId: string,
  ): Awaitable<VercelProductionBaselineApplicationInspection>;
  inspectProject(
    application: VercelProductionApplication,
    target: VercelProductionTarget,
  ): Awaitable<VercelProductionBaselineProjectInspection>;
  inspectRepository(): Awaitable<{ clean: boolean; sha: string }>;
  persistStageReceipt(
    receipt: VercelProductionBaselineStageReceipt,
  ): Awaitable<void>;
  promoteApplication(
    application: VercelProductionApplication,
    target: VercelProductionTarget,
    deploymentId: string,
  ): Awaitable<void>;
  stageApplication(
    application: VercelProductionApplication,
    target: VercelProductionTarget,
    approvedSha: string,
  ): Awaitable<{ deploymentId: string }>;
}

type VercelProductionBaselineOriginal =
  | { state: "absent" }
  | {
      deploymentId: string;
      healthy: false;
      providerGitSha: string | null;
      readyState: string;
      state: "failed";
    };

export interface VercelProductionBaselineStagedApplication {
  application: VercelProductionApplication;
  candidate: VercelProductionBaselineCandidate;
  original: VercelProductionBaselineOriginal;
  target: VercelProductionTarget;
}

export interface VercelProductionBaselineStageReceiptContent {
  applications: VercelProductionBaselineStagedApplication[];
  approvedSha: string;
  convexTarget: {
    deploymentName: string;
    deploymentUrl: string;
  };
  event: "vercel_production_baseline_stage_receipt";
  schemaVersion: 1;
  stagedAt: string;
  teamId: string;
}

export interface VercelProductionBaselineStageReceipt {
  canonical: string;
  content: VercelProductionBaselineStageReceiptContent;
  sha256: string;
}

export type VercelProductionBaselineApplicationState =
  | "candidate_live_healthy"
  | "staged_not_live"
  | "unexpected"
  | "unhealthy"
  | "readback_failed";

export type VercelProductionBaselineStates = Record<
  VercelProductionApplication,
  VercelProductionBaselineApplicationState
>;

export interface VercelProductionBaselineReconciliation {
  complete: boolean;
  receiptSha256: string;
  states: VercelProductionBaselineStates;
  trafficMutated: boolean | "unknown";
}

export interface VercelProductionBaselineExecutionReceipt
  extends VercelProductionBaselineReconciliation {
  approvedSha: string;
  checkedAt: string;
  error?: string;
  event:
    | "vercel_production_baseline_complete_receipt"
    | "vercel_production_baseline_failure_receipt"
    | "vercel_production_baseline_recovery_required_receipt";
  result: "failed" | "passed" | "recovery_required";
  rollbackClaimed: false;
  stageReceipt: VercelProductionBaselineStageReceipt;
}

export interface ExecuteVercelProductionBaselineOptions {
  approvedSha: string;
  config: unknown;
  dependencies: VercelProductionBaselineDependencies;
  now?: () => Date;
  repositoryRoot: string;
}

export type StageVercelProductionBaselineOptions =
  ExecuteVercelProductionBaselineOptions;

export interface ReconcileVercelProductionBaselineOptions {
  dependencies: Pick<
    VercelProductionBaselineDependencies,
    "inspectApplication"
  >;
  receipt: VercelProductionBaselineStageReceipt;
  repositoryRoot: string;
}

export interface ResumeVercelProductionBaselineOptions {
  config: unknown;
  dependencies: VercelProductionBaselineDependencies;
  expectedStageReceiptSha256: string;
  now?: () => Date;
  receipt: VercelProductionBaselineStageReceipt;
  repositoryRoot: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  if (
    typeof value !== "string" &&
    typeof value !== "boolean" &&
    (typeof value !== "number" || !Number.isFinite(value))
  ) {
    throw new Error("baseline receipt contains non-canonical data");
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) {
    throw new Error("baseline receipt contains non-canonical data");
  }
  return encoded;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function validIsoTimestamp(value: string): boolean {
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function exactStrings(actual: readonly string[], expected: readonly string[]) {
  return (
    actual.length === expected.length &&
    actual.every((entry, index) => entry === expected[index])
  );
}

function sameTarget(
  actual: VercelProductionTarget,
  expected: VercelProductionTarget,
) {
  return canonicalJson(actual) === canonicalJson(expected);
}

function requireBaselineDomains(configuration: VercelProductionReleaseConfig) {
  if (
    configuration.targets.some(
      (target) =>
        target.productionDomain === null ||
        target.productionDomains.length === 0 ||
        !target.productionDomains.includes(target.productionDomain),
    )
  ) {
    throw new Error(
      "every application requires a pinned production domain for first baseline activation",
    );
  }
}

function requireRepository(
  inspection: { clean: boolean; sha: string },
  approvedSha: string,
) {
  if (inspection.clean !== true || inspection.sha !== approvedSha) {
    throw new Error("repository SHA and clean state do not match the approved baseline");
  }
}

function requireMetadata(
  inspection: VercelProductionBaselineProviderMetadata,
  target: VercelProductionTarget,
  configuration: VercelProductionReleaseConfig,
) {
  const matches =
    inspection.teamId === configuration.teamId &&
    inspection.projectId === target.projectId &&
    inspection.projectName === target.projectName &&
    inspection.rootDirectory === target.rootDirectory &&
    inspection.productionDomain === target.productionDomain &&
    exactStrings(inspection.productionDomains, target.productionDomains) &&
    exactStrings(
      inspection.allowedProductionEnvironmentKeys,
      target.allowedProductionEnvironmentKeys,
    ) &&
    inspection.convexTarget.deploymentName ===
      configuration.convexTarget.deploymentName &&
    inspection.convexTarget.deploymentUrl ===
      configuration.convexTarget.deploymentUrl;
  if (!matches) {
    throw new Error(`${target.application} project metadata does not match repo pins`);
  }
}

function requireApplication(
  actual: VercelProductionApplication,
  expected: VercelProductionApplication,
) {
  if (actual !== expected) {
    throw new Error(`${expected} application readback is unexpected`);
  }
}

function requireDeploymentId(value: string, context: string) {
  if (!DEPLOYMENT_ID.test(value)) {
    throw new Error(`${context} deployment ID is invalid`);
  }
}

function requireCurrentDeployment(
  value: VercelProductionBaselineCurrentDeployment,
  context: string,
) {
  requireDeploymentId(value.deploymentId, context);
  if (
    typeof value.healthy !== "boolean" ||
    typeof value.readyState !== "string" ||
    !value.readyState ||
    (value.providerGitSha !== null &&
      !FULL_GIT_COMMIT_SHA.test(value.providerGitSha))
  ) {
    throw new Error(`${context} deployment readback is invalid`);
  }
}

function originalFromCurrent(
  current: VercelProductionBaselineCurrentDeployment | null,
  application: VercelProductionApplication,
): VercelProductionBaselineOriginal {
  if (current === null) return { state: "absent" };
  requireCurrentDeployment(current, `${application} original`);
  if (current.readyState === "READY" && current.healthy === true) {
    throw new Error(`${application} already has a healthy production predecessor`);
  }
  if (current.healthy !== false) {
    throw new Error(`${application} original deployment state is inconsistent`);
  }
  return {
    deploymentId: current.deploymentId,
    healthy: false,
    providerGitSha: current.providerGitSha,
    readyState: current.readyState,
    state: "failed",
  };
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function candidateHealthIsExact(
  candidate: VercelProductionBaselineCandidate,
  application: VercelProductionApplication,
  approvedSha: string,
) {
  const health = candidate.health;
  return (
    candidate.healthy === true &&
    candidate.readyState === "READY" &&
    candidate.target === "production" &&
    health.status === "ok" &&
    health.service === "sourcera" &&
    health.commitSha === approvedSha &&
    health.domain === application &&
    health.environment === "production" &&
    validIsoTimestamp(health.checkedAt)
  );
}

function candidateIdentityIsExact(
  candidate: VercelProductionBaselineCandidate,
  application: VercelProductionApplication,
  approvedSha: string,
  deploymentId: string,
) {
  return (
    candidate.deploymentId === deploymentId &&
    candidate.providerGitSha === approvedSha &&
    FULL_GIT_COMMIT_SHA.test(candidate.providerGitSha) &&
    validUrl(candidate.url)
  );
}

function currentMatchesOriginal(
  current: VercelProductionBaselineCurrentDeployment | null,
  original: VercelProductionBaselineOriginal,
) {
  if (original.state === "absent") return current === null;
  return (
    current !== null &&
    current.deploymentId === original.deploymentId &&
    current.providerGitSha === original.providerGitSha &&
    current.readyState === original.readyState &&
    current.healthy === false
  );
}

function classifyInspection(
  inspection: VercelProductionBaselineApplicationInspection,
  staged: VercelProductionBaselineStagedApplication,
  configuration: VercelProductionReleaseConfig,
): VercelProductionBaselineApplicationState {
  try {
    requireApplication(inspection.application, staged.application);
    requireMetadata(inspection.metadata, staged.target, configuration);
  } catch {
    return "unexpected";
  }
  const candidate = inspection.candidate;
  if (
    !candidateIdentityIsExact(
      candidate,
      staged.application,
      staged.candidate.providerGitSha,
      staged.candidate.deploymentId,
    ) ||
    candidate.url !== staged.candidate.url
  ) {
    return "unexpected";
  }
  if (!candidateHealthIsExact(
    candidate,
    staged.application,
    staged.candidate.providerGitSha,
  )) {
    return "unhealthy";
  }
  const current = inspection.current;
  if (current?.deploymentId === staged.candidate.deploymentId) {
    if (
      current.healthy === true &&
      current.readyState === "READY" &&
      current.providerGitSha === staged.candidate.providerGitSha &&
      candidate.readySubstate === "PROMOTED"
    ) {
      return "candidate_live_healthy";
    }
    return "unhealthy";
  }
  if (candidate.readySubstate !== "STAGED") return "unexpected";
  return currentMatchesOriginal(current, staged.original)
    ? "staged_not_live"
    : "unexpected";
}

function frozenCopy<T>(value: T): T {
  return structuredClone(value);
}

function createStageReceipt(
  configuration: VercelProductionReleaseConfig,
  approvedSha: string,
  applications: VercelProductionBaselineStagedApplication[],
  stagedAt: string,
) {
  const content: VercelProductionBaselineStageReceiptContent = {
    applications: frozenCopy(applications),
    approvedSha,
    convexTarget: frozenCopy(configuration.convexTarget),
    event: "vercel_production_baseline_stage_receipt",
    schemaVersion: 1,
    stagedAt,
    teamId: configuration.teamId,
  };
  const canonical = canonicalJson(content);
  return deepFreeze({
    canonical,
    content,
    sha256: sha256(canonical),
  });
}

function configurationFromReceipt(
  receipt: VercelProductionBaselineStageReceipt,
  repositoryRoot: string,
) {
  if (
    !isRecord(receipt) ||
    typeof receipt.canonical !== "string" ||
    typeof receipt.sha256 !== "string" ||
    !SHA256.test(receipt.sha256) ||
    !isRecord(receipt.content)
  ) {
    throw new Error("baseline stage receipt is invalid");
  }
  const canonical = canonicalJson(receipt.content);
  if (canonical !== receipt.canonical || sha256(canonical) !== receipt.sha256) {
    throw new Error("baseline stage receipt hash is invalid");
  }
  const content = receipt.content;
  if (
    content.schemaVersion !== 1 ||
    content.event !== "vercel_production_baseline_stage_receipt" ||
    !FULL_GIT_COMMIT_SHA.test(content.approvedSha) ||
    !validIsoTimestamp(content.stagedAt) ||
    !Array.isArray(content.applications) ||
    content.applications.length !== APPLICATIONS.length ||
    content.applications.some(
      (entry, index) => entry.application !== APPLICATIONS[index],
    )
  ) {
    throw new Error("baseline stage receipt is incomplete");
  }
  const configuration = readVercelProductionReleaseConfig(
    {
      convexProduction: content.convexTarget,
      vercelProduction: {
        targets: content.applications.map(({ target }) => target),
        teamId: content.teamId,
      },
    },
    repositoryRoot,
  );
  requireBaselineDomains(configuration);
  for (const [index, staged] of content.applications.entries()) {
    const target = configuration.targets[index]!;
    if (!sameTarget(staged.target, target)) {
      throw new Error("baseline stage receipt target pins are invalid");
    }
    requireDeploymentId(staged.candidate.deploymentId, staged.application);
    if (
      !candidateIdentityIsExact(
        staged.candidate,
        staged.application,
        content.approvedSha,
        staged.candidate.deploymentId,
      ) ||
      !candidateHealthIsExact(
        staged.candidate,
        staged.application,
        content.approvedSha,
      ) ||
      staged.candidate.readySubstate !== "STAGED"
    ) {
      throw new Error("baseline stage receipt candidate is invalid");
    }
    if (staged.original.state === "failed") {
      requireCurrentDeployment(staged.original, `${staged.application} original`);
      if (staged.original.healthy !== false) {
        throw new Error("baseline stage receipt original is invalid");
      }
    } else if (staged.original.state !== "absent") {
      throw new Error("baseline stage receipt original is invalid");
    }
  }
  return configuration;
}

function requireConfigurationMatchesReceipt(
  config: unknown,
  receipt: VercelProductionBaselineStageReceipt,
  repositoryRoot: string,
) {
  const expected = configurationFromReceipt(receipt, repositoryRoot);
  const actual = readVercelProductionReleaseConfig(config, repositoryRoot);
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error("baseline resume config does not match the stage receipt");
  }
  return actual;
}

function statesFromEntries(
  entries: Array<
    readonly [
      VercelProductionApplication,
      VercelProductionBaselineApplicationState,
    ]
  >,
) {
  return Object.fromEntries(entries) as VercelProductionBaselineStates;
}

function trafficState(states: VercelProductionBaselineStates) {
  const values = APPLICATIONS.map((application) => states[application]);
  if (values.some((state) => state === "candidate_live_healthy")) return true;
  if (values.every((state) => state === "staged_not_live")) return false;
  return "unknown" as const;
}

export async function reconcileVercelProductionBaseline(
  options: ReconcileVercelProductionBaselineOptions,
): Promise<VercelProductionBaselineReconciliation> {
  const configuration = configurationFromReceipt(
    options.receipt,
    options.repositoryRoot,
  );
  const states = statesFromEntries(
    await Promise.all(
      options.receipt.content.applications.map(async (staged, index) => {
        const target = configuration.targets[index]!;
        try {
          const inspection = await options.dependencies.inspectApplication(
            staged.application,
            target,
            staged.candidate.deploymentId,
          );
          return [
            staged.application,
            classifyInspection(inspection, staged, configuration),
          ] as const;
        } catch {
          return [staged.application, "readback_failed"] as const;
        }
      }),
    ),
  );
  return {
    complete: APPLICATIONS.every(
      (application) => states[application] === "candidate_live_healthy",
    ),
    receiptSha256: options.receipt.sha256,
    states,
    trafficMutated: trafficState(states),
  };
}

function outcome(
  approvedSha: string,
  receipt: VercelProductionBaselineStageReceipt,
  reconciliation: VercelProductionBaselineReconciliation,
  now: () => Date,
  error?: unknown,
): VercelProductionBaselineExecutionReceipt {
  const checked = now();
  if (Number.isNaN(checked.getTime())) {
    throw new Error("baseline receipt time is invalid");
  }
  const unsafe = APPLICATIONS.some((application) =>
    ["readback_failed", "unexpected", "unhealthy"].includes(
      reconciliation.states[application],
    ),
  );
  const result = reconciliation.complete && error === undefined
    ? "passed"
    : reconciliation.trafficMutated === false && !unsafe
      ? "failed"
      : "recovery_required";
  return {
    ...reconciliation,
    approvedSha,
    checkedAt: checked.toISOString(),
    ...(error === undefined
      ? {}
      : { error: error instanceof Error ? error.message : String(error) }),
    event:
      result === "passed"
        ? "vercel_production_baseline_complete_receipt"
        : result === "failed"
          ? "vercel_production_baseline_failure_receipt"
          : "vercel_production_baseline_recovery_required_receipt",
    result,
    rollbackClaimed: false,
    stageReceipt: receipt,
  };
}

async function promoteFromReceipt(
  receipt: VercelProductionBaselineStageReceipt,
  configuration: VercelProductionReleaseConfig,
  dependencies: VercelProductionBaselineDependencies,
  repositoryRoot: string,
  now: () => Date,
  initialStates?: VercelProductionBaselineStates,
) {
  try {
    for (const [index, staged] of receipt.content.applications.entries()) {
      if (initialStates?.[staged.application] === "candidate_live_healthy") {
        continue;
      }
      requireRepository(
        await dependencies.inspectRepository(),
        receipt.content.approvedSha,
      );
      const target = configuration.targets[index]!;
      await dependencies.promoteApplication(
        staged.application,
        target,
        staged.candidate.deploymentId,
      );
      const inspection = await dependencies.inspectApplication(
        staged.application,
        target,
        staged.candidate.deploymentId,
      );
      if (
        classifyInspection(inspection, staged, configuration) !==
        "candidate_live_healthy"
      ) {
        throw new Error(
          `${staged.application} promotion was not proven by authenticated reread`,
        );
      }
    }
    requireRepository(
      await dependencies.inspectRepository(),
      receipt.content.approvedSha,
    );
    const reconciliation = await reconcileVercelProductionBaseline({
      dependencies,
      receipt,
      repositoryRoot,
    });
    return outcome(
      receipt.content.approvedSha,
      receipt,
      reconciliation,
      now,
    );
  } catch (error) {
    const reconciliation = await reconcileVercelProductionBaseline({
      dependencies,
      receipt,
      repositoryRoot,
    });
    return outcome(
      receipt.content.approvedSha,
      receipt,
      reconciliation,
      now,
      error,
    );
  }
}

export async function stageVercelProductionBaseline(
  options: StageVercelProductionBaselineOptions,
): Promise<VercelProductionBaselineStageReceipt> {
  const approvedSha = options.approvedSha.trim();
  if (!FULL_GIT_COMMIT_SHA.test(approvedSha)) {
    throw new Error("approved baseline SHA must be a full Git commit SHA");
  }
  const now = options.now ?? (() => new Date());
  const stagedAt = now();
  if (Number.isNaN(stagedAt.getTime())) {
    throw new Error("baseline stage time is invalid");
  }
  const configuration = readVercelProductionReleaseConfig(
    options.config,
    options.repositoryRoot,
  );
  requireBaselineDomains(configuration);
  requireRepository(
    await options.dependencies.inspectRepository(),
    approvedSha,
  );

  const originals = new Map<
    VercelProductionApplication,
    VercelProductionBaselineOriginal
  >();
  for (const target of configuration.targets) {
    const inspection = await options.dependencies.inspectProject(
      target.application,
      target,
    );
    requireApplication(inspection.application, target.application);
    requireMetadata(inspection.metadata, target, configuration);
    originals.set(
      target.application,
      originalFromCurrent(inspection.current, target.application),
    );
  }

  const deploymentIds = new Map<VercelProductionApplication, string>();
  for (const target of configuration.targets) {
    const staged = await options.dependencies.stageApplication(
      target.application,
      target,
      approvedSha,
    );
    requireDeploymentId(staged.deploymentId, target.application);
    deploymentIds.set(target.application, staged.deploymentId);
  }

  const applications: VercelProductionBaselineStagedApplication[] = [];
  for (const target of configuration.targets) {
    const deploymentId = deploymentIds.get(target.application);
    const original = originals.get(target.application);
    if (!deploymentId || !original) {
      throw new Error("baseline staging did not produce a complete application set");
    }
    const inspection = await options.dependencies.inspectApplication(
      target.application,
      target,
      deploymentId,
    );
    requireApplication(inspection.application, target.application);
    requireMetadata(inspection.metadata, target, configuration);
    if (
      !candidateIdentityIsExact(
        inspection.candidate,
        target.application,
        approvedSha,
        deploymentId,
      )
    ) {
      throw new Error(`${target.application} candidate identity is invalid`);
    }
    if (
      !candidateHealthIsExact(
        inspection.candidate,
        target.application,
        approvedSha,
      )
    ) {
      throw new Error(`${target.application} candidate health is invalid`);
    }
    if (inspection.candidate.readySubstate !== "STAGED") {
      throw new Error(`${target.application} candidate is not STAGED`);
    }
    const entry: VercelProductionBaselineStagedApplication = {
      application: target.application,
      candidate: frozenCopy(inspection.candidate),
      original: frozenCopy(original),
      target: frozenCopy(target),
    };
    if (classifyInspection(inspection, entry, configuration) !== "staged_not_live") {
      throw new Error(
        `${target.application} baseline state changed during staging`,
      );
    }
    applications.push(entry);
  }

  const receipt = createStageReceipt(
    configuration,
    approvedSha,
    applications,
    stagedAt.toISOString(),
  );
  await options.dependencies.persistStageReceipt(receipt);
  return receipt;
}

export async function executeVercelProductionBaseline(
  options: ExecuteVercelProductionBaselineOptions,
): Promise<VercelProductionBaselineExecutionReceipt> {
  const receipt = await stageVercelProductionBaseline(options);
  return resumeVercelProductionBaseline({
    config: options.config,
    dependencies: options.dependencies,
    expectedStageReceiptSha256: receipt.sha256,
    now: options.now,
    receipt,
    repositoryRoot: options.repositoryRoot,
  });
}

export async function resumeVercelProductionBaseline(
  options: ResumeVercelProductionBaselineOptions,
): Promise<VercelProductionBaselineExecutionReceipt> {
  if (
    !SHA256.test(options.expectedStageReceiptSha256) ||
    options.receipt.sha256 !== options.expectedStageReceiptSha256
  ) {
    throw new Error("resume requires the same persisted stage receipt");
  }
  const configuration = requireConfigurationMatchesReceipt(
    options.config,
    options.receipt,
    options.repositoryRoot,
  );
  requireRepository(
    await options.dependencies.inspectRepository(),
    options.receipt.content.approvedSha,
  );
  const reconciliation = await reconcileVercelProductionBaseline({
    dependencies: options.dependencies,
    receipt: options.receipt,
    repositoryRoot: options.repositoryRoot,
  });
  for (const application of APPLICATIONS) {
    const state = reconciliation.states[application];
    if (
      state !== "candidate_live_healthy" &&
      state !== "staged_not_live"
    ) {
      throw new Error(`unsafe baseline resume state: ${application}=${state}`);
    }
  }
  let stagedSeen = false;
  for (const application of APPLICATIONS) {
    const state = reconciliation.states[application];
    if (state === "staged_not_live") {
      stagedSeen = true;
    } else if (stagedSeen) {
      throw new Error("non-prefix baseline activation state is unsafe");
    }
  }
  return promoteFromReceipt(
    options.receipt,
    configuration,
    options.dependencies,
    options.repositoryRoot,
    options.now ?? (() => new Date()),
    reconciliation.states,
  );
}

type BaselineSignal = "SIGHUP" | "SIGINT" | "SIGTERM";

export type VercelProductionBaselineSignalHandler = (() => void) & {
  settled(): Promise<void>;
};

export function createVercelProductionBaselineSignalHandler(
  signal: BaselineSignal,
  reconcile: () => Promise<void>,
  terminate: (exitCode: number) => void = (exitCode) => process.exit(exitCode),
): VercelProductionBaselineSignalHandler {
  const exitCodes: Record<BaselineSignal, number> = {
    SIGHUP: 129,
    SIGINT: 130,
    SIGTERM: 143,
  };
  let handling: Promise<void> | undefined;
  const handler = (() => {
    handling ??= (async () => {
      try {
        await reconcile();
      } finally {
        terminate(exitCodes[signal]);
      }
    })();
  }) as VercelProductionBaselineSignalHandler;
  handler.settled = () => handling ?? Promise.resolve();
  return handler;
}
