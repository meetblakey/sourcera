import { createHash, randomUUID } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { link, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  readConvexProductionTarget,
  type ConvexProductionTarget,
} from "@sourcera/domain/convex";

import {
  readPassingConvexProductionCandidateRollbackReceipt,
  readPassingConvexProductionForcedRollbackReceipt,
  readPassingKnownGoodConvexReceipt,
} from "./convex-production-deployment";
import {
  readGithubProductionApprovalReceipt,
} from "./convex-production-bootstrap";
import {
  readConvexChangeClassification,
  readConvexDataProtectionProof,
  readDurableProductionProofCollection,
  readIsolatedProductionProofEnvironment,
  readR0CustomerJourneyProof,
  readR0OperationalProof,
  type ConvexChangeClassification,
  type ProductionProofBinding,
} from "./production-proof-contracts";
import {
  type VercelProductionApplication,
  type VercelProductionReleaseConfig,
  type VercelProductionStagedApplication,
  type VercelProductionTarget,
  readVercelProductionReleaseConfig,
  validateProductionDomains,
  validateProductionEnvironmentMetadata,
} from "./vercel-production-release";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const GITHUB_WORKFLOW_PATH =
  /^\.github\/workflows\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:yml|yaml)$/;
const SHA256 = /^[a-f0-9]{64}$/;
const APPLICATIONS = ["marketplace", "buyer", "seller"] as const;
const COMPLETE_PROOF_KEYS = [
  "configuration",
  "repository-initial",
  "stamp",
  "exact",
  "delivery",
  "github",
  "knownGoodConvex",
  "convexClassification",
  "vercelStage",
  "productionProofBinding",
  "isolatedProofEnvironment",
  "repository-after-stage",
  "convex",
  "r0CustomerJourney",
  "r0Operational",
  "durableProofCollection",
  "repository-before-marketplace",
  "repository-before-buyer",
  "repository-before-seller",
  "repository-final",
] as const;
const PROOF_KEYS = new Set<string>([
  ...COMPLETE_PROOF_KEYS,
  "convexDataProtection",
  "githubApprovalReceipt",
  "githubBootstrapRoute",
  "convexRollback",
]);
const COMPLETE_PROVIDER_PROOF_KEYS = APPLICATIONS.flatMap((application) =>
  ["pre-convex", "pre", "proof-ready", "promote", "post", "final"].map(
    (stage) => `${stage}-${application}`,
  ),
);
const PROVIDER_PROOF_STAGES = new Set([
  "emergency-reconcile",
  "emergency-rollback",
  "emergency-rollback-readback",
  "emergency-rollback-final",
  "final",
  "post",
  "pre",
  "pre-convex",
  "proof-ready",
  "promote",
  "reconcile",
  "rollback",
  "rollback-final",
  "rollback-readback",
]);
const REQUIRED_CHECKS = [
  ["verify", ".github/workflows/app-ci.yml"],
  ["convex-preview", ".github/workflows/app-ci.yml"],
  ["delivery-integrity", ".github/workflows/delivery-integrity.yml"],
  ["linear-drift", ".github/workflows/delivery-integrity.yml"],
  ["no-legacy-drift", ".github/workflows/repo-hygiene.yml"],
  ["Spec-Lint (§M.4 CI gate cluster)", ".github/workflows/spec-lint.yml"],
] as const;

export interface ProductionReleaseConfig {
  github: {
    actionsAppId: 15368;
    approver: { id: 15627406; login: "meetblakey" };
    authorityWorkflowLineage: Array<{
      authorityKind: "convex_anchor" | "normal" | "vercel_baseline";
      path: string;
      workflowSha256: string;
    }>;
    baselineWorkflow: ".github/workflows/vercel-production-baseline.yml";
    bootstrapWorkflow: ".github/workflows/production-bootstrap-recovery.yml";
    collaborators: Array<{ id: number; login: string }>;
    environment: "sourcera-production-release";
    requiredChecks: Array<{ name: string; workflow: string }>;
    rulesets: Array<{ id: number; name: string }>;
    workflow: ".github/workflows/production-release.yml";
  };
  repository: { branch: "main"; name: "sourcera"; owner: "meetblakey" };
  proofCollection:
    | {
        coordinator: null;
        decision: "DEC-PROD-002";
        isolatedCandidateConvex: null;
        mode: "blocked";
      }
    | {
        coordinator: { projectId: string; workflowName: string };
        decision: "DEC-PROD-002";
        isolatedCandidateConvex: ConvexProductionTarget;
        mode: "durable";
      };
  schemaVersion: 1;
  tooling: { vercelCli: "56.2.0" };
}

export interface ProductionReleaseEvidence {
  approvalReceiptRaw?: string;
  exitCode: number;
  raw: string;
  value?: unknown;
}

export type ProductionAnchorMode = "genesis" | "normal";
export type ProductionApprovalMode = ProductionAnchorMode | "baseline";

export interface ProductionGenesisBinding {
  approvalReceiptRaw: string;
  approvalReceiptSha256: string;
  approvedCandidateSha: string;
  bootstrapRoute: ProductionBootstrapRoute;
  bootstrapRouteProofSha256: string;
  githubRunAttempt: 1;
  githubRunId: number;
}

export interface ProductionApplicationInspection {
  application: VercelProductionApplication;
  candidate: {
    commitSha: string;
    deploymentId: string;
    healthy: boolean;
    state: "PROMOTED" | "STAGED";
  };
  current: {
    deploymentId: string;
    healthy: boolean;
  };
  raw: string;
}

type Awaitable<T> = T | Promise<T>;

export interface ProductionReleaseDependencies {
  classifyConvexChanges?(): Awaitable<ProductionReleaseEvidence>;
  deployConvex(): Awaitable<ProductionReleaseEvidence>;
  prepareIsolatedProofEnvironment?(): Awaitable<ProductionReleaseEvidence>;
  inspectApplication(
    application: VercelProductionApplication,
    staged: VercelProductionStagedApplication,
  ): Awaitable<ProductionApplicationInspection>;
  promoteApplication(
    application: VercelProductionApplication,
    deploymentId: string,
  ): Awaitable<ProductionReleaseEvidence>;
  rollbackApplication(
    application: VercelProductionApplication,
    predecessorDeploymentId: string,
  ): Awaitable<ProductionReleaseEvidence>;
  rollbackConvex(
    genesisBinding?: ProductionGenesisBinding,
  ): Awaitable<ProductionReleaseEvidence>;
  runDeliveryVerification(): Awaitable<ProductionReleaseEvidence>;
  runExactStatusScan(): Awaitable<ProductionReleaseEvidence>;
  runStampGate(): Awaitable<ProductionReleaseEvidence>;
  stageVercel(): Awaitable<ProductionReleaseEvidence>;
  verifyGitHubApproval(): Awaitable<ProductionReleaseEvidence>;
  verifyKnownGoodConvexReceipt(
    genesisBinding?: ProductionGenesisBinding,
  ): Awaitable<ProductionReleaseEvidence>;
  verifyConvexDataProtection?(
    binding: ProductionProofBinding,
    classification: ConvexChangeClassification,
  ): Awaitable<ProductionReleaseEvidence>;
  verifyDurableProofCollection?(
    binding: ProductionProofBinding,
    customerProofRaw: string,
    operationalProofRaw: string,
  ): Awaitable<ProductionReleaseEvidence>;
  verifyR0CustomerJourney?(
    binding: ProductionProofBinding,
  ): Awaitable<ProductionReleaseEvidence>;
  verifyR0Operational?(
    binding: ProductionProofBinding,
  ): Awaitable<ProductionReleaseEvidence>;
  verifyRepository(): Awaitable<ProductionReleaseEvidence>;
}

export type ProductionReleaseReceiptEvent =
  | "production_release_complete_receipt"
  | "production_release_failure_receipt"
  | "production_release_recovery_required_receipt"
  | "production_release_rollback_receipt";

export interface ProductionReleaseReceipt {
  anchorMode: ProductionAnchorMode;
  approvedSha: string;
  checkedAt: string;
  convexCandidateRemainsLive: boolean | "unknown";
  error?: string;
  event: ProductionReleaseReceiptEvent;
  failedStage?: string;
  knownGoodSha: string;
  productionApplications: VercelProductionApplication[];
  promotionAllowed: boolean;
  proofEvidence: Record<string, string>;
  proofSha256: Record<string, string>;
  providerProofEvidence: Record<string, string>;
  providerProofSha256: Record<string, string>;
  reconciliation?: Record<string, string>;
  result: "failed" | "passed" | "recovery_required" | "rolled_back";
  rollbackOrder?: VercelProductionApplication[];
  schemaVersion: 1;
  trafficMutated: boolean;
}

export interface ExecuteProductionReleaseOptions {
  anchorMode?: ProductionAnchorMode;
  approvedSha: string;
  config: unknown;
  dependencies: ProductionReleaseDependencies;
  knownGoodSha: string;
  now?: () => Date;
  productionTargets: unknown;
  repositoryRoot: string;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredRecord(
  value: unknown,
  context: string,
): RecordValue {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
  return value;
}

function requireExactString(
  record: RecordValue,
  key: string,
  expected: string,
  context: string,
) {
  if (record[key] !== expected) {
    throw new Error(`${context} ${key} must be ${expected}`);
  }
  return expected;
}

export function readProductionReleaseConfig(
  value: unknown,
): ProductionReleaseConfig {
  const root = requiredRecord(value, "Production release config");
  if (root.schemaVersion !== 1) {
    throw new Error("Production release config schemaVersion must be 1");
  }
  const repository = requiredRecord(root.repository, "repository");
  requireExactString(repository, "owner", "meetblakey", "repository");
  requireExactString(repository, "name", "sourcera", "repository");
  requireExactString(repository, "branch", "main", "repository");

  const github = requiredRecord(root.github, "github");
  if (github.actionsAppId !== 15368) {
    throw new Error("github actionsAppId must be 15368");
  }
  requireExactString(
    github,
    "environment",
    "sourcera-production-release",
    "github",
  );
  requireExactString(
    github,
    "baselineWorkflow",
    ".github/workflows/vercel-production-baseline.yml",
    "github",
  );
  requireExactString(
    github,
    "bootstrapWorkflow",
    ".github/workflows/production-bootstrap-recovery.yml",
    "github",
  );
  requireExactString(
    github,
    "workflow",
    ".github/workflows/production-release.yml",
    "github",
  );
  if (!Array.isArray(github.authorityWorkflowLineage)) {
    throw new Error("github authorityWorkflowLineage must be an array");
  }
  const authorityWorkflowLineage = github.authorityWorkflowLineage.map(
    (entry, index) => {
      const lineage = requiredRecord(
        entry,
        `github authorityWorkflowLineage[${index}]`,
      );
      if (
        lineage.authorityKind !== "normal" &&
        lineage.authorityKind !== "convex_anchor" &&
        lineage.authorityKind !== "vercel_baseline"
      ) {
        throw new Error("github authority workflow kind is invalid");
      }
      if (
        typeof lineage.path !== "string" ||
        !GITHUB_WORKFLOW_PATH.test(lineage.path) ||
        typeof lineage.workflowSha256 !== "string" ||
        !SHA256.test(lineage.workflowSha256) ||
        /^0{64}$/.test(lineage.workflowSha256)
      ) {
        throw new Error("github authority workflow lineage is invalid");
      }
      return {
        authorityKind: lineage.authorityKind as
          | "convex_anchor"
          | "normal"
          | "vercel_baseline",
        path: lineage.path,
        workflowSha256: lineage.workflowSha256,
      };
    },
  );
  if (
    authorityWorkflowLineage.length < 3 ||
    new Set(
      authorityWorkflowLineage.map(
        (entry) =>
          `${entry.authorityKind}:${entry.path}:${entry.workflowSha256}`,
      ),
    ).size !== authorityWorkflowLineage.length ||
    !authorityWorkflowLineage.some(
      (entry) =>
        entry.authorityKind === "normal" &&
        entry.path === ".github/workflows/production-release.yml",
    ) ||
    !authorityWorkflowLineage.some(
      (entry) =>
        entry.authorityKind === "convex_anchor" &&
        entry.path ===
          ".github/workflows/production-bootstrap-recovery.yml",
    ) ||
    !authorityWorkflowLineage.some(
      (entry) =>
        entry.authorityKind === "vercel_baseline" &&
        entry.path === ".github/workflows/vercel-production-baseline.yml",
    )
  ) {
    throw new Error("github authority workflow lineage is incomplete");
  }
  const approver = requiredRecord(github.approver, "github approver");
  if (approver.id !== 15627406 || approver.login !== "meetblakey") {
    throw new Error("github approver must be meetblakey (15627406)");
  }
  if (!Array.isArray(github.requiredChecks)) {
    throw new Error("github requiredChecks must be an array");
  }
  const checks = github.requiredChecks.map((entry, index) => {
    const check = requiredRecord(entry, `github requiredChecks[${index}]`);
    if (typeof check.name !== "string" || typeof check.workflow !== "string") {
      throw new Error("github required check is incomplete");
    }
    return { name: check.name, workflow: check.workflow };
  });
  if (
    checks.length !== REQUIRED_CHECKS.length ||
    checks.some(
      (check, index) =>
        check.name !== REQUIRED_CHECKS[index][0] ||
        check.workflow !== REQUIRED_CHECKS[index][1],
    )
  ) {
    throw new Error("github requiredChecks do not match the release contract");
  }
  if (
    !Array.isArray(github.collaborators) ||
    github.collaborators.length !== 1 ||
    !isRecord(github.collaborators[0]) ||
    github.collaborators[0].id !== 15627406 ||
    github.collaborators[0].login !== "meetblakey"
  ) {
    throw new Error("github collaborators must pin the solo repository owner");
  }
  if (!Array.isArray(github.rulesets) || github.rulesets.length !== 0) {
    throw new Error("github rulesets must match the empty pinned set");
  }

  const proofCollection = requiredRecord(
    root.proofCollection,
    "proofCollection",
  );
  requireExactString(
    proofCollection,
    "decision",
    "DEC-PROD-002",
    "proofCollection",
  );
  let parsedProofCollection: ProductionReleaseConfig["proofCollection"];
  if (proofCollection.mode === "blocked") {
    if (
      proofCollection.coordinator !== null ||
      proofCollection.isolatedCandidateConvex !== null
    ) {
      throw new Error("blocked proofCollection cannot claim coordinator targets");
    }
    parsedProofCollection = {
      coordinator: null,
      decision: "DEC-PROD-002",
      isolatedCandidateConvex: null,
      mode: "blocked",
    };
  } else if (proofCollection.mode === "durable") {
    const coordinator = requiredRecord(
      proofCollection.coordinator,
      "proofCollection coordinator",
    );
    if (
      typeof coordinator.projectId !== "string" ||
      !coordinator.projectId.startsWith("prj_") ||
      typeof coordinator.workflowName !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(coordinator.workflowName)
    ) {
      throw new Error("proofCollection coordinator is incomplete");
    }
    const target = requiredRecord(
      proofCollection.isolatedCandidateConvex,
      "proofCollection isolated candidate Convex target",
    );
    parsedProofCollection = {
      coordinator: {
        projectId: coordinator.projectId,
        workflowName: coordinator.workflowName,
      },
      decision: "DEC-PROD-002",
      isolatedCandidateConvex: readConvexProductionTarget(
        typeof target.deploymentName === "string" ? target.deploymentName : "",
        typeof target.deploymentUrl === "string" ? target.deploymentUrl : "",
      ),
      mode: "durable",
    };
  } else {
    throw new Error("proofCollection mode must be blocked or durable");
  }

  const tooling = requiredRecord(root.tooling, "tooling");
  requireExactString(tooling, "vercelCli", "56.2.0", "tooling");
  return {
    github: {
      actionsAppId: 15368,
      approver: { id: 15627406, login: "meetblakey" },
      authorityWorkflowLineage,
      baselineWorkflow: ".github/workflows/vercel-production-baseline.yml",
      bootstrapWorkflow: ".github/workflows/production-bootstrap-recovery.yml",
      collaborators: [{ id: 15627406, login: "meetblakey" }],
      environment: "sourcera-production-release",
      requiredChecks: checks,
      rulesets: [],
      workflow: ".github/workflows/production-release.yml",
    },
    proofCollection: parsedProofCollection,
    repository: { branch: "main", name: "sourcera", owner: "meetblakey" },
    schemaVersion: 1,
    tooling: { vercelCli: "56.2.0" },
  };
}

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function recordEvidence(
  evidence: Record<string, string>,
  hashes: Record<string, string>,
  key: string,
  raw: string,
) {
  if (!raw.trim()) {
    throw new Error(`${key} evidence is empty`);
  }
  if (evidence[key] !== undefined || hashes[key] !== undefined) {
    throw new Error(`${key} evidence is duplicated`);
  }
  evidence[key] = raw;
  hashes[key] = sha256(raw);
}

function recordEvidenceError(
  evidence: Record<string, string>,
  hashes: Record<string, string>,
  key: string,
  error: unknown,
) {
  if (evidence[key] !== undefined || hashes[key] !== undefined) return;
  recordEvidence(
    evidence,
    hashes,
    key,
    JSON.stringify({ error: errorMessage(error), outcome: "failed" }),
  );
}

function parseEvidence(
  evidence: ProductionReleaseEvidence,
  context: string,
  requireSuccess = true,
) {
  if (requireSuccess && evidence.exitCode !== 0) {
    throw new Error(`${context} failed`);
  }
  try {
    return JSON.parse(evidence.raw) as unknown;
  } catch (cause) {
    throw new Error(`${context} did not emit JSON`, { cause });
  }
}

function requireRepositoryEvidence(value: unknown, approvedSha: string) {
  const proof = requiredRecord(value, "repository proof");
  if (
    proof.clean !== true ||
    proof.ref !== "refs/heads/main" ||
    proof.headSha !== approvedSha ||
    proof.fetchedMainSha !== approvedSha ||
    proof.mainSha !== approvedSha
  ) {
    throw new Error("repository is not a clean exact main SHA");
  }
}

function requireStampEvidence(value: unknown) {
  if (requiredRecord(value, "stamp gate proof").outcome !== "pass") {
    throw new Error("stamp gate outcome must be pass");
  }
}

function requireExactEvidence(value: unknown) {
  if (requiredRecord(value, "exact status proof").open_rows !== 0) {
    throw new Error("exact status scan must have zero open rows");
  }
}

function requireExactKeys(
  value: RecordValue,
  expected: readonly string[],
  context: string,
) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${context} has unexpected fields`);
  }
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
    throw new Error("Vercel baseline proof contains non-canonical data");
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) {
    throw new Error("Vercel baseline proof contains non-canonical data");
  }
  return encoded;
}

function parseRawJson(raw: unknown, context: string) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error(`${context} is empty`);
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new Error(`${context} is not JSON`, { cause });
  }
}

function isIsoTimestamp(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

export interface ProductionVercelBaselineExpectation {
  activationReceiptRaw?: string;
  artifactDigest?: string;
  artifactName?: string;
  authorityWorkflowLineage: ReadonlyArray<{
    authorityKind: "convex_anchor" | "normal" | "vercel_baseline";
    path: string;
    workflowSha256: string;
  }>;
  runAttempt?: number;
  runId?: number;
  sha?: string;
  stageReceiptRaw?: string;
  stageReceiptRawSha256?: string;
  workflowPath: string;
}

export interface ProductionVercelBaselineBinding {
  activationReceiptSha256: string;
  artifactDigest: string;
  artifactName: string;
  runAttempt: number;
  runId: number;
  sha: string;
  stageArtifactDigest: string;
  stageArtifactName: string;
  stageReceiptRawSha256: string;
  workflowSha256: string;
}

export type ProductionBootstrapRoute = "expired_anchor" | "initial_genesis";

export interface ProductionBootstrapAnchorIdentity {
  artifactDigest: string;
  artifactId: number;
  artifactName: string;
  expired: true;
  runAttempt: number;
  runId: number;
  sha: string;
  workflowPath: string;
}

export interface ProductionBootstrapRouteExpectation {
  authorityWorkflowLineage: ReadonlyArray<{
    authorityKind: "convex_anchor" | "normal" | "vercel_baseline";
    path: string;
    workflowSha256: string;
  }>;
  route: ProductionBootstrapRoute;
  selectedAnchor?: ProductionBootstrapAnchorIdentity;
  workflowPaths: readonly [string, string];
}

export interface ProductionBootstrapRouteBinding {
  inventorySha256: string;
  route: ProductionBootstrapRoute;
  routeProofSha256: string;
  selectedAnchor: ProductionBootstrapAnchorIdentity | null;
}

function exactIsoTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    (() => {
      try {
        return new Date(value).toISOString() === value;
      } catch {
        return false;
      }
    })()
  );
}

export function validateProductionBootstrapRouteProof(
  value: unknown,
  expected: ProductionBootstrapRouteExpectation,
): ProductionBootstrapRouteBinding {
  if (
    !Array.isArray(expected.authorityWorkflowLineage) ||
    expected.authorityWorkflowLineage.length < 3 ||
    expected.authorityWorkflowLineage.some(
      (entry) =>
        (entry.authorityKind !== "normal" &&
          entry.authorityKind !== "convex_anchor" &&
          entry.authorityKind !== "vercel_baseline") ||
        !GITHUB_WORKFLOW_PATH.test(entry.path) ||
        !SHA256.test(entry.workflowSha256),
    )
  ) {
    throw new Error("approved authority workflow lineage is invalid");
  }
  const proof = requiredRecord(value, "production bootstrap route proof");
  requireExactKeys(
    proof,
    [
      "authorityPromotionAllowed",
      "decision",
      "event",
      "historyDecision",
      "historyScope",
      "inventory",
      "inventorySha256",
      "reasonSha256",
      "route",
      "schemaVersion",
      "selectedAnchor",
    ],
    "production bootstrap route proof",
  );
  if (
    proof.schemaVersion !== 1 ||
    proof.event !== "production_bootstrap_route_proof" ||
    proof.decision !== "DEC-PROD-002" ||
    proof.historyDecision !== "DEC-PROD-005" ||
    proof.historyScope !== "github_retained_artifacts" ||
    proof.authorityPromotionAllowed !== false ||
    proof.route !== expected.route ||
    !["expired_anchor", "initial_genesis"].includes(String(proof.route)) ||
    typeof proof.inventorySha256 !== "string" ||
    !SHA256.test(proof.inventorySha256) ||
    typeof proof.reasonSha256 !== "string" ||
    !SHA256.test(proof.reasonSha256)
  ) {
    throw new Error("production bootstrap route identity is invalid");
  }
  const inventory = requiredRecord(
    proof.inventory,
    "production bootstrap route inventory",
  );
  requireExactKeys(
    inventory,
    [
      "artifactPages",
      "authorityArtifactHistories",
      "repositoryArtifactPages",
      "workflowRunAttemptJobPages",
      "workflowRunAttempts",
      "workflowRunPages",
    ],
    "production bootstrap route inventory",
  );
  if (proof.inventorySha256 !== sha256(JSON.stringify(inventory))) {
    throw new Error("production bootstrap route inventory hash is invalid");
  }
  if (
    !Array.isArray(inventory.workflowRunPages) ||
    inventory.workflowRunPages.length !== expected.workflowPaths.length ||
    !Array.isArray(inventory.workflowRunAttempts) ||
    !Array.isArray(inventory.workflowRunAttemptJobPages) ||
    !Array.isArray(inventory.repositoryArtifactPages) ||
    !Array.isArray(inventory.authorityArtifactHistories) ||
    !Array.isArray(inventory.artifactPages)
  ) {
    throw new Error("production bootstrap route pagination is incomplete");
  }

  const latestRuns: RecordValue[] = [];
  for (const workflowPath of expected.workflowPaths) {
    const matches = inventory.workflowRunPages.filter(
      (entry) => isRecord(entry) && entry.workflowPath === workflowPath,
    );
    if (matches.length !== 1) {
      throw new Error("production bootstrap workflow inventory is ambiguous");
    }
    const workflowInventory = matches[0];
    requireExactKeys(
      workflowInventory,
      ["pages", "workflowPath"],
      "production bootstrap workflow inventory",
    );
    if (
      !Array.isArray(workflowInventory.pages) ||
      workflowInventory.pages.length < 1
    ) {
      throw new Error("production bootstrap workflow pagination is incomplete");
    }
    let expectedTotal: number | undefined;
    const workflowRuns: RecordValue[] = [];
    for (const pageValue of workflowInventory.pages) {
      const page = requiredRecord(pageValue, "production workflow run page");
      requireExactKeys(
        page,
        ["total_count", "workflow_runs"],
        "production workflow run page",
      );
      if (
        !Number.isSafeInteger(page.total_count) ||
        Number(page.total_count) < 0 ||
        !Array.isArray(page.workflow_runs)
      ) {
        throw new Error("production bootstrap workflow pagination is invalid");
      }
      expectedTotal ??= Number(page.total_count);
      if (expectedTotal !== page.total_count) {
        throw new Error("production bootstrap workflow pagination total changed");
      }
      workflowRuns.push(
        ...page.workflow_runs.map((entry) =>
          requiredRecord(entry, "production workflow run"),
        ),
      );
    }
    if (workflowRuns.length !== expectedTotal) {
      throw new Error("production bootstrap workflow pagination is truncated");
    }
    for (const run of workflowRuns) {
      if (
        !Number.isSafeInteger(run.id) ||
        Number(run.id) < 1 ||
        run.path !== workflowPath ||
        run.event !== "workflow_dispatch" ||
        run.head_branch !== "main" ||
        typeof run.head_sha !== "string" ||
        !FULL_GIT_COMMIT_SHA.test(run.head_sha) ||
        !Number.isSafeInteger(run.run_attempt) ||
        Number(run.run_attempt) < 1 ||
        typeof run.status !== "string" ||
        (run.conclusion !== null && typeof run.conclusion !== "string") ||
        !exactIsoTimestamp(run.created_at)
      ) {
        throw new Error("production bootstrap workflow run is invalid");
      }
      if (latestRuns.some((candidate) => candidate.id === run.id)) {
        throw new Error("production bootstrap workflow run is duplicated");
      }
      latestRuns.push(run);
    }
  }

  if (
    inventory.workflowRunAttempts.length !== latestRuns.length ||
    inventory.artifactPages.length !== latestRuns.length
  ) {
    throw new Error("production bootstrap artifact pagination is incomplete");
  }
  const attempts: RecordValue[] = [];
  for (const latestRun of latestRuns) {
    const matches = inventory.workflowRunAttempts.filter(
      (entry) => isRecord(entry) && entry.runId === latestRun.id,
    );
    if (matches.length !== 1) {
      throw new Error("production workflow attempt inventory is ambiguous");
    }
    const attemptInventory = matches[0];
    requireExactKeys(
      attemptInventory,
      ["attempts", "runId", "workflowPath"],
      "production workflow attempt inventory",
    );
    if (
      attemptInventory.workflowPath !== latestRun.path ||
      !Array.isArray(attemptInventory.attempts) ||
      attemptInventory.attempts.length !== latestRun.run_attempt
    ) {
      throw new Error("production workflow attempt inventory is incomplete");
    }
    for (const [index, attemptValue] of attemptInventory.attempts.entries()) {
      const attempt = requiredRecord(
        attemptValue,
        "production workflow attempt",
      );
      if (
        attempt.id !== latestRun.id ||
        attempt.path !== latestRun.path ||
        attempt.event !== "workflow_dispatch" ||
        attempt.head_branch !== "main" ||
        attempt.head_sha !== latestRun.head_sha ||
        attempt.run_attempt !== index + 1 ||
        typeof attempt.status !== "string" ||
        (attempt.conclusion !== null &&
          typeof attempt.conclusion !== "string") ||
        !exactIsoTimestamp(attempt.created_at)
      ) {
        throw new Error("production workflow attempt proof is invalid");
      }
      attempts.push(attempt);
    }
  }

  if (inventory.workflowRunAttemptJobPages.length !== attempts.length) {
    throw new Error("production workflow job pagination is incomplete");
  }
  const successfulAnchorJobs = new Set<string>();
  for (const attempt of attempts) {
    const matches = inventory.workflowRunAttemptJobPages.filter(
      (entry) =>
        isRecord(entry) &&
        entry.runId === attempt.id &&
        entry.runAttempt === attempt.run_attempt,
    );
    if (matches.length !== 1) {
      throw new Error("production workflow job inventory is ambiguous");
    }
    const jobInventory = matches[0];
    requireExactKeys(
      jobInventory,
      ["pages", "runAttempt", "runId", "workflowPath"],
      "production workflow job inventory",
    );
    if (
      jobInventory.workflowPath !== attempt.path ||
      !Array.isArray(jobInventory.pages) ||
      jobInventory.pages.length < 1
    ) {
      throw new Error("production workflow job pagination is invalid");
    }
    let expectedTotal: number | undefined;
    const jobs: RecordValue[] = [];
    for (const pageValue of jobInventory.pages) {
      const page = requiredRecord(pageValue, "production workflow job page");
      requireExactKeys(
        page,
        ["jobs", "total_count"],
        "production workflow job page",
      );
      if (
        !Number.isSafeInteger(page.total_count) ||
        Number(page.total_count) < 0 ||
        !Array.isArray(page.jobs)
      ) {
        throw new Error("production workflow job pagination is invalid");
      }
      expectedTotal ??= Number(page.total_count);
      if (expectedTotal !== page.total_count) {
        throw new Error("production workflow job pagination total changed");
      }
      jobs.push(
        ...page.jobs.map((entry) =>
          requiredRecord(entry, "production workflow job"),
        ),
      );
    }
    if (jobs.length !== expectedTotal) {
      throw new Error("production workflow job pagination is truncated");
    }
    const anchorJobs = jobs.filter((job) => job.name === "convex-anchor");
    if (anchorJobs.length > 1) {
      throw new Error("Convex anchor-producing job is duplicated");
    }
    if (anchorJobs.length === 1) {
      const anchorJob = anchorJobs[0];
      if (
        anchorJob.run_id !== attempt.id ||
        anchorJob.run_attempt !== attempt.run_attempt ||
        anchorJob.head_sha !== attempt.head_sha ||
        anchorJob.status !== "completed" ||
        typeof anchorJob.conclusion !== "string"
      ) {
        throw new Error("Convex anchor-producing job identity is invalid");
      }
      if (anchorJob.conclusion === "success") {
        successfulAnchorJobs.add(
          `${String(attempt.id)}:${String(attempt.run_attempt)}`,
        );
      }
    }
  }

  const artifactsByRun = new Map<number, RecordValue[]>();
  for (const latestRun of latestRuns) {
    const matches = inventory.artifactPages.filter(
      (entry) => isRecord(entry) && entry.runId === latestRun.id,
    );
    if (matches.length !== 1) {
      throw new Error("production bootstrap artifact inventory is ambiguous");
    }
    const artifactInventory = matches[0];
    requireExactKeys(
      artifactInventory,
      ["pages", "runId", "workflowPath"],
      "production bootstrap artifact inventory",
    );
    if (
      artifactInventory.workflowPath !== latestRun.path ||
      !Array.isArray(artifactInventory.pages) ||
      artifactInventory.pages.length < 1
    ) {
      throw new Error("production bootstrap artifact pagination is invalid");
    }
    let expectedTotal: number | undefined;
    const artifacts: RecordValue[] = [];
    for (const pageValue of artifactInventory.pages) {
      const page = requiredRecord(pageValue, "production artifact page");
      requireExactKeys(
        page,
        ["artifacts", "total_count"],
        "production artifact page",
      );
      if (
        !Number.isSafeInteger(page.total_count) ||
        Number(page.total_count) < 0 ||
        !Array.isArray(page.artifacts)
      ) {
        throw new Error("production artifact pagination is invalid");
      }
      expectedTotal ??= Number(page.total_count);
      if (expectedTotal !== page.total_count) {
        throw new Error("production artifact pagination total changed");
      }
      artifacts.push(
        ...page.artifacts.map((entry) =>
          requiredRecord(entry, "production authority artifact"),
        ),
      );
    }
    if (artifacts.length !== expectedTotal) {
      throw new Error("production artifact pagination is truncated");
    }
    artifactsByRun.set(latestRun.id as number, artifacts);
  }

  const completedAttempts = attempts.filter((run) => run.status === "completed");
  const currentAnchors: Array<{
    artifact: RecordValue;
    identity: ProductionBootstrapAnchorIdentity;
    run: RecordValue;
  }> = [];
  for (const run of completedAttempts) {
    const artifacts = artifactsByRun.get(run.id as number) ?? [];
    const normalName = `production-release-${String(run.head_sha)}-${String(run.id)}-${String(run.run_attempt)}`;
    const bootstrapName = new RegExp(
      `^production-anchor-authority-[a-f0-9]{40,64}-${String(run.id)}-${String(run.run_attempt)}$`,
      "i",
    );
    const bootstrapArtifacts = artifacts.filter(
      (artifact) =>
        run.path === expected.workflowPaths[1] &&
        typeof artifact.name === "string" &&
        bootstrapName.test(artifact.name),
    );
    if (
      bootstrapArtifacts.length > 0 &&
      !successfulAnchorJobs.has(
        `${String(run.id)}:${String(run.run_attempt)}`,
      )
    ) {
      throw new Error(
        "bootstrap authority artifact lacks a successful anchor-producing job",
      );
    }
    const authorityArtifacts = artifacts.filter(
      (artifact) =>
        (run.conclusion === "success" && artifact.name === normalName) ||
        bootstrapArtifacts.includes(artifact),
    );
    if (authorityArtifacts.length > 1) {
      throw new Error("production authority artifact is duplicated");
    }
    if (authorityArtifacts.length === 0) continue;
    const artifact = authorityArtifacts[0];
    const artifactRun = requiredRecord(
      artifact.workflow_run,
      "production authority artifact workflow run",
    );
    if (
      !Number.isSafeInteger(artifact.id) ||
      Number(artifact.id) < 1 ||
      typeof artifact.name !== "string" ||
      typeof artifact.digest !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(artifact.digest) ||
      typeof artifact.expired !== "boolean" ||
      !exactIsoTimestamp(artifact.created_at) ||
      artifactRun.id !== run.id ||
      artifactRun.head_branch !== "main" ||
      artifactRun.head_sha !== run.head_sha
    ) {
      throw new Error("production authority artifact identity is invalid");
    }
    currentAnchors.push({
      artifact,
      identity: {
        artifactDigest: artifact.digest,
        artifactId: artifact.id as number,
        artifactName: artifact.name,
        expired: true,
        runAttempt: run.run_attempt as number,
        runId: run.id as number,
        sha: run.head_sha as string,
        workflowPath: run.path as string,
      },
      run,
    });
  }

  let repositoryArtifactTotal: number | undefined;
  const repositoryArtifacts: RecordValue[] = [];
  for (const pageValue of inventory.repositoryArtifactPages) {
    const page = requiredRecord(pageValue, "repository artifact page");
    requireExactKeys(
      page,
      ["artifacts", "total_count"],
      "repository artifact page",
    );
    if (
      !Number.isSafeInteger(page.total_count) ||
      Number(page.total_count) < 0 ||
      !Array.isArray(page.artifacts)
    ) {
      throw new Error("repository artifact pagination is invalid");
    }
    repositoryArtifactTotal ??= Number(page.total_count);
    if (repositoryArtifactTotal !== page.total_count) {
      throw new Error("repository artifact pagination total changed");
    }
    repositoryArtifacts.push(
      ...page.artifacts.map((artifact) =>
        requiredRecord(artifact, "repository artifact"),
      ),
    );
  }
  if (
    inventory.repositoryArtifactPages.length < 1 ||
    repositoryArtifacts.length !== repositoryArtifactTotal
  ) {
    throw new Error("repository artifact pagination is truncated");
  }
  const authorityArtifacts = repositoryArtifacts.filter(
    (artifact) =>
      typeof artifact.name === "string" &&
      (/^production-release-[a-f0-9]{40}-\d+-\d+$/i.test(artifact.name) ||
        /^production-anchor-authority-[a-f0-9]{40}-\d+-\d+$/i.test(
          artifact.name,
        )),
  );
  if (inventory.authorityArtifactHistories.length !== authorityArtifacts.length) {
    throw new Error("retained authority history inventory is incomplete");
  }
  const retainedAnchors: typeof currentAnchors = [];
  for (const artifact of authorityArtifacts) {
    const name = String(artifact.name);
    const normalMatch = name.match(
      /^production-release-([a-f0-9]{40})-(\d+)-(\d+)$/i,
    );
    const bootstrapMatch = name.match(
      /^production-anchor-authority-([a-f0-9]{40})-(\d+)-(\d+)$/i,
    );
    const nameMatch = normalMatch ?? bootstrapMatch;
    if (!nameMatch) throw new Error("retained authority name is invalid");
    const runId = Number(nameMatch[2]);
    const runAttempt = Number(nameMatch[3]);
    const histories = inventory.authorityArtifactHistories.filter(
      (entry) => isRecord(entry) && entry.artifactId === artifact.id,
    );
    if (histories.length !== 1) {
      throw new Error("retained authority history is ambiguous");
    }
    const history = histories[0];
    requireExactKeys(
      history,
      [
        "artifactId",
        "jobPages",
        "run",
        "runAttempt",
        "runId",
        "workflowSource",
      ],
      "retained authority history",
    );
    const run = requiredRecord(history.run, "retained authority workflow attempt");
    if (
      history.runId !== runId ||
      history.runAttempt !== runAttempt ||
      run.id !== runId ||
      run.run_attempt !== runAttempt ||
      run.event !== "workflow_dispatch" ||
      run.head_branch !== "main" ||
      typeof run.head_sha !== "string" ||
      !FULL_GIT_COMMIT_SHA.test(run.head_sha) ||
      typeof run.path !== "string" ||
      !GITHUB_WORKFLOW_PATH.test(run.path) ||
      typeof run.status !== "string" ||
      (run.conclusion !== null && typeof run.conclusion !== "string") ||
      !exactIsoTimestamp(run.created_at) ||
      !Array.isArray(history.jobPages)
    ) {
      throw new Error("retained authority workflow attempt is invalid");
    }
    const workflowSource = requiredRecord(
      history.workflowSource,
      "retained authority workflow source",
    );
    requireExactKeys(
      workflowSource,
      ["content", "path", "ref", "sha256"],
      "retained authority workflow source",
    );
    const authorityKind = normalMatch ? "normal" : "convex_anchor";
    if (
      typeof workflowSource.content !== "string" ||
      workflowSource.content.length === 0 ||
      workflowSource.path !== run.path ||
      workflowSource.ref !== run.head_sha ||
      typeof workflowSource.sha256 !== "string" ||
      workflowSource.sha256 !== sha256(workflowSource.content)
    ) {
      throw new Error("retained authority workflow source is invalid");
    }
    const approvedLineage = expected.authorityWorkflowLineage.filter(
      (entry) =>
        entry.authorityKind === authorityKind &&
        entry.path === run.path &&
        entry.workflowSha256 === workflowSource.sha256,
    );
    if (approvedLineage.length !== 1) {
      throw new Error("retained authority workflow lineage is not approved");
    }
    const artifactRun = requiredRecord(
      artifact.workflow_run,
      "retained authority artifact workflow run",
    );
    if (
      !Number.isSafeInteger(artifact.id) ||
      Number(artifact.id) < 1 ||
      typeof artifact.digest !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(artifact.digest) ||
      typeof artifact.expired !== "boolean" ||
      !exactIsoTimestamp(artifact.created_at) ||
      artifactRun.id !== runId ||
      artifactRun.head_branch !== "main" ||
      artifactRun.head_sha !== run.head_sha
    ) {
      throw new Error("retained authority artifact identity is invalid");
    }
    let jobTotal: number | undefined;
    const jobs: RecordValue[] = [];
    for (const pageValue of history.jobPages) {
      const page = requiredRecord(pageValue, "retained authority job page");
      requireExactKeys(
        page,
        ["jobs", "total_count"],
        "retained authority job page",
      );
      if (
        !Number.isSafeInteger(page.total_count) ||
        Number(page.total_count) < 0 ||
        !Array.isArray(page.jobs)
      ) {
        throw new Error("retained authority job pagination is invalid");
      }
      jobTotal ??= Number(page.total_count);
      if (jobTotal !== page.total_count) {
        throw new Error("retained authority job pagination total changed");
      }
      jobs.push(
        ...page.jobs.map((job) =>
          requiredRecord(job, "retained authority job"),
        ),
      );
    }
    if (history.jobPages.length < 1 || jobs.length !== jobTotal) {
      throw new Error("retained authority job pagination is truncated");
    }
    const anchorJobs = jobs.filter((job) => job.name === "convex-anchor");
    if (anchorJobs.length > 1) {
      throw new Error("retained Convex anchor job is duplicated");
    }
    const bootstrapJobPassed =
      anchorJobs.length === 1 &&
      anchorJobs[0].run_id === runId &&
      anchorJobs[0].run_attempt === runAttempt &&
      anchorJobs[0].head_sha === run.head_sha &&
      anchorJobs[0].status === "completed" &&
      anchorJobs[0].conclusion === "success";
    const authorityPassed = normalMatch
      ? run.status === "completed" &&
        run.conclusion === "success" &&
        nameMatch[1].toLowerCase() === String(run.head_sha).toLowerCase()
      : bootstrapJobPassed;
    if (!authorityPassed) continue;
    retainedAnchors.push({
      artifact,
      identity: {
        artifactDigest: artifact.digest,
        artifactId: artifact.id as number,
        artifactName: name,
        expired: true,
        runAttempt,
        runId,
        sha: run.head_sha as string,
        workflowPath: run.path,
      },
      run,
    });
  }
  for (const current of currentAnchors) {
    if (
      !retainedAnchors.some(
        (retained) =>
          retained.artifact.id === current.artifact.id &&
          canonicalJson(retained.identity) === canonicalJson(current.identity),
      )
    ) {
      throw new Error("current authority is absent from retained repository history");
    }
  }
  const anchors = retainedAnchors;

  if (expected.route === "initial_genesis") {
    if (proof.selectedAnchor !== null || expected.selectedAnchor !== undefined) {
      throw new Error("initial genesis cannot select historical authority");
    }
    if (anchors.length !== 0) {
      throw new Error("initial genesis has prior production authority");
    }
    return {
      inventorySha256: proof.inventorySha256,
      route: "initial_genesis",
      routeProofSha256: sha256(JSON.stringify(proof)),
      selectedAnchor: null,
    };
  }

  if (anchors.length === 0 || !expected.selectedAnchor) {
    throw new Error("expired-anchor recovery has no exact prior authority");
  }
  if (anchors.some(({ artifact }) => artifact.expired === false)) {
    throw new Error("expired-anchor recovery has a usable nonexpired replacement");
  }
  const latestAnchor = anchors
    .slice()
    .sort((left, right) => {
      const timestamp = String(right.artifact.created_at).localeCompare(
        String(left.artifact.created_at),
      );
      return timestamp || Number(right.artifact.id) - Number(left.artifact.id);
    })[0];
  if (latestAnchor.artifact.expired !== true) {
    throw new Error("most recent production authority is not exactly expired");
  }
  const selected = requiredRecord(
    proof.selectedAnchor,
    "selected expired production authority",
  );
  requireExactKeys(
    selected,
    [
      "artifactDigest",
      "artifactId",
      "artifactName",
      "expired",
      "runAttempt",
      "runId",
      "sha",
      "workflowPath",
    ],
    "selected expired production authority",
  );
  if (
    canonicalJson(selected) !== canonicalJson(latestAnchor.identity) ||
    canonicalJson(selected) !== canonicalJson(expected.selectedAnchor)
  ) {
    throw new Error("expired-anchor recovery did not select the most recent authority");
  }
  return {
    inventorySha256: proof.inventorySha256,
    route: "expired_anchor",
    routeProofSha256: sha256(JSON.stringify(proof)),
    selectedAnchor:
      selected as unknown as ProductionBootstrapAnchorIdentity,
  };
}

export function validateProductionVercelBaselineProvenance(
  value: unknown,
  expected: ProductionVercelBaselineExpectation,
): ProductionVercelBaselineBinding {
  const proof = requiredRecord(value, "Vercel production baseline provenance");
  requireExactKeys(
    proof,
    [
      "activationReceiptRaw",
      "activationReceiptSha256",
      "artifact",
      "artifactDigest",
      "artifactName",
      "run",
      "runAttempt",
      "runId",
      "sha",
      "stageArtifact",
      "stageArtifactDigest",
      "stageArtifactName",
      "stageReceiptRaw",
      "stageReceiptRawSha256",
      "workflowSource",
    ],
    "Vercel production baseline provenance",
  );
  if (
    typeof proof.sha !== "string" ||
    !FULL_GIT_COMMIT_SHA.test(proof.sha) ||
    !Number.isSafeInteger(proof.runId) ||
    Number(proof.runId) < 1 ||
    !Number.isSafeInteger(proof.runAttempt) ||
    Number(proof.runAttempt) < 1 ||
    typeof proof.artifactName !== "string" ||
    proof.artifactName !==
      `vercel-production-baseline-activation-${proof.sha}-${String(proof.runId)}-${String(proof.runAttempt)}` ||
    typeof proof.artifactDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(proof.artifactDigest) ||
    typeof proof.activationReceiptSha256 !== "string" ||
    !SHA256.test(proof.activationReceiptSha256) ||
    typeof proof.stageReceiptRawSha256 !== "string" ||
    !SHA256.test(proof.stageReceiptRawSha256) ||
    typeof proof.stageArtifactName !== "string" ||
    proof.stageArtifactName !==
      `vercel-production-baseline-stage-${proof.sha}-${String(proof.runId)}` ||
    typeof proof.stageArtifactDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(proof.stageArtifactDigest)
  ) {
    throw new Error("Vercel production baseline identity is invalid");
  }
  if (proof.runAttempt !== 1) {
    throw new Error(
      "Vercel baseline later-attempt recovery lacks exact protected approval proof",
    );
  }
  for (const [actual, pinned, context] of [
    [proof.sha, expected.sha, "SHA"],
    [proof.runId, expected.runId, "run ID"],
    [proof.runAttempt, expected.runAttempt, "run attempt"],
    [proof.artifactName, expected.artifactName, "artifact name"],
    [proof.artifactDigest, expected.artifactDigest, "artifact digest"],
    [
      proof.stageReceiptRawSha256,
      expected.stageReceiptRawSha256,
      "stage receipt hash",
    ],
  ] as const) {
    if (pinned !== undefined && actual !== pinned) {
      throw new Error(`Vercel production baseline ${context} does not match`);
    }
  }
  if (
    expected.activationReceiptRaw !== undefined &&
    proof.activationReceiptRaw !== expected.activationReceiptRaw
  ) {
    throw new Error("Vercel baseline activation receipt bytes do not match");
  }
  if (
    expected.stageReceiptRaw !== undefined &&
    proof.stageReceiptRaw !== expected.stageReceiptRaw
  ) {
    throw new Error("Vercel baseline stage receipt bytes do not match");
  }
  if (
    proof.activationReceiptSha256 !== sha256(String(proof.activationReceiptRaw)) ||
    proof.stageReceiptRawSha256 !== sha256(String(proof.stageReceiptRaw))
  ) {
    throw new Error("Vercel production baseline receipt hash is invalid");
  }

  const run = requiredRecord(proof.run, "Vercel baseline workflow run");
  if (
    run.id !== proof.runId ||
    run.path !== expected.workflowPath ||
    run.event !== "workflow_dispatch" ||
    run.head_branch !== "main" ||
    run.head_sha !== proof.sha ||
    run.run_attempt !== proof.runAttempt ||
    run.status !== "completed" ||
    run.conclusion !== "success"
  ) {
    throw new Error("Vercel production baseline workflow is not proven");
  }

  const workflowSource = requiredRecord(
    proof.workflowSource,
    "Vercel baseline workflow source",
  );
  requireExactKeys(
    workflowSource,
    ["content", "path", "ref", "sha256"],
    "Vercel baseline workflow source",
  );
  if (
    typeof workflowSource.content !== "string" ||
    workflowSource.content.length === 0 ||
    workflowSource.path !== expected.workflowPath ||
    workflowSource.ref !== proof.sha ||
    typeof workflowSource.sha256 !== "string" ||
    workflowSource.sha256 !== sha256(workflowSource.content) ||
    !Array.isArray(expected.authorityWorkflowLineage) ||
    expected.authorityWorkflowLineage.filter(
      (entry) =>
        entry.authorityKind === "vercel_baseline" &&
        entry.path === workflowSource.path &&
        entry.workflowSha256 === workflowSource.sha256,
    ).length !== 1
  ) {
    throw new Error("Vercel baseline workflow lineage is not approved");
  }

  const artifact = requiredRecord(
    proof.artifact,
    "Vercel baseline activation artifact",
  );
  const artifactRun = requiredRecord(
    artifact.workflow_run,
    "Vercel baseline artifact workflow run",
  );
  if (
    !Number.isSafeInteger(artifact.id) ||
    Number(artifact.id) < 1 ||
    artifact.name !== proof.artifactName ||
    artifact.expired !== false ||
    artifact.digest !== proof.artifactDigest ||
    artifactRun.id !== proof.runId ||
    artifactRun.head_branch !== "main" ||
    artifactRun.head_sha !== proof.sha
  ) {
    throw new Error("Vercel production baseline artifact is not exact");
  }

  const stageArtifact = requiredRecord(
    proof.stageArtifact,
    "Vercel baseline stage artifact",
  );
  const stageArtifactRun = requiredRecord(
    stageArtifact.workflow_run,
    "Vercel baseline stage artifact workflow run",
  );
  if (
    !Number.isSafeInteger(stageArtifact.id) ||
    Number(stageArtifact.id) < 1 ||
    stageArtifact.id === artifact.id ||
    stageArtifact.name !== proof.stageArtifactName ||
    stageArtifact.expired !== false ||
    stageArtifact.digest !== proof.stageArtifactDigest ||
    stageArtifactRun.id !== proof.runId ||
    stageArtifactRun.head_branch !== "main" ||
    stageArtifactRun.head_sha !== proof.sha
  ) {
    throw new Error("Vercel production baseline stage artifact is not exact");
  }

  const stageReceipt = requiredRecord(
    parseRawJson(proof.stageReceiptRaw, "Vercel baseline stage receipt"),
    "Vercel baseline stage receipt",
  );
  requireExactKeys(
    stageReceipt,
    ["canonical", "content", "sha256", "workflowBinding"],
    "Vercel baseline stage receipt",
  );
  const workflowBinding = requiredRecord(
    stageReceipt.workflowBinding,
    "Vercel baseline stage workflow binding",
  );
  requireExactKeys(
    workflowBinding,
    [
      "approvalArtifactDigest",
      "githubApprovalSha256",
      "githubHandoffSha256",
      "githubProofSha256",
      "identity",
      "preflightArtifactDigest",
      "preflightReceiptSha256",
      "reasonSha256",
    ],
    "Vercel baseline stage workflow binding",
  );
  const workflowIdentity = requiredRecord(
    workflowBinding.identity,
    "Vercel baseline stage workflow identity",
  );
  requireExactKeys(
    workflowIdentity,
    ["approvedSha", "repository", "runAttempt", "runId"],
    "Vercel baseline stage workflow identity",
  );
  if (
    [
      "approvalArtifactDigest",
      "githubApprovalSha256",
      "githubHandoffSha256",
      "githubProofSha256",
      "preflightArtifactDigest",
      "preflightReceiptSha256",
      "reasonSha256",
    ].some(
      (key) =>
        typeof workflowBinding[key] !== "string" ||
        !SHA256.test(String(workflowBinding[key])),
    ) ||
    workflowIdentity.approvedSha !== proof.sha ||
    workflowIdentity.repository !== "meetblakey/sourcera" ||
    workflowIdentity.runAttempt !== 1 ||
    workflowIdentity.runId !== proof.runId
  ) {
    throw new Error("Vercel baseline stage workflow binding is invalid");
  }
  const stageContent = requiredRecord(
    stageReceipt.content,
    "Vercel baseline stage receipt content",
  );
  const canonical = canonicalJson(stageContent);
  if (
    stageReceipt.canonical !== canonical ||
    stageReceipt.sha256 !== sha256(canonical) ||
    !SHA256.test(String(stageReceipt.sha256)) ||
    stageContent.event !== "vercel_production_baseline_stage_receipt" ||
    stageContent.schemaVersion !== 1 ||
    stageContent.approvedSha !== proof.sha ||
    !isIsoTimestamp(stageContent.stagedAt) ||
    !Array.isArray(stageContent.applications) ||
    stageContent.applications.length !== APPLICATIONS.length
  ) {
    throw new Error("Vercel production baseline stage receipt is invalid");
  }
  for (const [index, applicationName] of APPLICATIONS.entries()) {
    const application = requiredRecord(
      stageContent.applications[index],
      `${applicationName} Vercel baseline stage receipt`,
    );
    const candidate = requiredRecord(
      application.candidate,
      `${applicationName} Vercel baseline candidate`,
    );
    const health = requiredRecord(
      candidate.health,
      `${applicationName} Vercel baseline health`,
    );
    if (
      application.application !== applicationName ||
      candidate.providerGitSha !== proof.sha ||
      candidate.readyState !== "READY" ||
      candidate.readySubstate !== "STAGED" ||
      candidate.target !== "production" ||
      candidate.healthy !== true ||
      health.commitSha !== proof.sha ||
      health.domain !== applicationName ||
      health.environment !== "production" ||
      health.service !== "sourcera" ||
      health.status !== "ok"
    ) {
      throw new Error(`${applicationName} Vercel baseline stage proof is invalid`);
    }
  }

  const activation = requiredRecord(
    parseRawJson(
      proof.activationReceiptRaw,
      "Vercel baseline activation receipt",
    ),
    "Vercel baseline activation receipt",
  );
  requireExactKeys(
    activation,
    [
      "activationBinding",
      "approvedSha",
      "checkedAt",
      "complete",
      "event",
      "receiptSha256",
      "result",
      "rollbackClaimed",
      "stageReceipt",
      "states",
      "trafficMutated",
    ],
    "Vercel baseline activation receipt",
  );
  const states = requiredRecord(
    activation.states,
    "Vercel baseline activation states",
  );
  const activationBinding = requiredRecord(
    activation.activationBinding,
    "Vercel baseline activation binding",
  );
  requireExactKeys(
    activationBinding,
    [
      "activationRunAttempt",
      "sourceWorkflowBinding",
      "stageArtifactDigest",
      "stageReceiptRawSha256",
    ],
    "Vercel baseline activation binding",
  );
  requireExactKeys(states, [...APPLICATIONS], "Vercel baseline activation states");
  if (
    activationBinding.activationRunAttempt !== proof.runAttempt ||
    canonicalJson(activationBinding.sourceWorkflowBinding) !==
      canonicalJson(workflowBinding) ||
    typeof activationBinding.stageArtifactDigest !== "string" ||
    !SHA256.test(activationBinding.stageArtifactDigest) ||
    proof.stageArtifactDigest !==
      `sha256:${String(activationBinding.stageArtifactDigest)}` ||
    activationBinding.stageReceiptRawSha256 !== proof.stageReceiptRawSha256 ||
    activation.approvedSha !== proof.sha ||
    !isIsoTimestamp(activation.checkedAt) ||
    activation.complete !== true ||
    activation.event !== "vercel_production_baseline_complete_receipt" ||
    activation.receiptSha256 !== stageReceipt.sha256 ||
    activation.result !== "passed" ||
    activation.rollbackClaimed !== false ||
    activation.trafficMutated !== true ||
    canonicalJson(activation.stageReceipt) !== canonicalJson(stageReceipt) ||
    APPLICATIONS.some(
      (application) => states[application] !== "candidate_live_healthy",
    )
  ) {
    throw new Error("Vercel production baseline activation did not pass");
  }

  return {
    activationReceiptSha256: proof.activationReceiptSha256 as string,
    artifactDigest: proof.artifactDigest as string,
    artifactName: proof.artifactName as string,
    runAttempt: proof.runAttempt as number,
    runId: proof.runId as number,
    sha: proof.sha as string,
    stageArtifactDigest: proof.stageArtifactDigest as string,
    stageArtifactName: proof.stageArtifactName as string,
    stageReceiptRawSha256: proof.stageReceiptRawSha256 as string,
    workflowSha256: workflowSource.sha256 as string,
  };
}

export function validateProductionGithubApprovalEvidence(
  value: unknown,
  config: ProductionReleaseConfig,
  approvedSha: string,
  knownGoodSha: string | undefined,
  approvalMode: ProductionApprovalMode,
) {
  if (approvalMode === "baseline" && knownGoodSha !== undefined) {
    throw new Error("Baseline GitHub approval cannot use a known-good SHA");
  }
  const proof = requiredRecord(value, "GitHub approval proof");
  if (
    proof.approvedSha !== approvedSha ||
    proof.repository !== `${config.repository.owner}/${config.repository.name}`
  ) {
    throw new Error("GitHub approval does not match the exact release SHA");
  }
  const ref = requiredRecord(proof.ref, "GitHub main ref proof");
  const refObject = requiredRecord(ref.object, "GitHub main ref object");
  if (ref.ref !== "refs/heads/main" || refObject.sha !== approvedSha) {
    throw new Error("GitHub main ref does not match the exact release SHA");
  }
  const protection = requiredRecord(proof.branchProtection, "GitHub branch protection proof");
  const enforceAdmins = requiredRecord(
    protection.enforce_admins,
    "GitHub enforce-admin proof",
  );
  const statusChecks = requiredRecord(
    protection.required_status_checks,
    "GitHub required status checks",
  );
  const requiredReviews = requiredRecord(
    protection.required_pull_request_reviews,
    "GitHub required review policy",
  );
  const linearHistory = requiredRecord(
    protection.required_linear_history,
    "GitHub linear-history policy",
  );
  const conversationResolution = requiredRecord(
    protection.required_conversation_resolution,
    "GitHub conversation-resolution policy",
  );
  const allowForcePushes = requiredRecord(
    protection.allow_force_pushes,
    "GitHub force-push policy",
  );
  const allowDeletions = requiredRecord(
    protection.allow_deletions,
    "GitHub deletion policy",
  );
  const blockCreations = requiredRecord(
    protection.block_creations,
    "GitHub branch-creation policy",
  );
  const lockBranch = requiredRecord(
    protection.lock_branch,
    "GitHub lock-branch policy",
  );
  const allowForkSyncing = requiredRecord(
    protection.allow_fork_syncing,
    "GitHub fork-sync policy",
  );
  const requiredCheckNames = config.github.requiredChecks.map(({ name }) => name);
  const dismissalRestrictions = requiredReviews.dismissal_restrictions;
  const dismissalRestrictionsEmpty =
    dismissalRestrictions === undefined ||
    (isRecord(dismissalRestrictions) &&
      ["apps", "teams", "users"].every(
        (key) =>
          dismissalRestrictions[key] === undefined ||
          (Array.isArray(dismissalRestrictions[key]) &&
            dismissalRestrictions[key].length === 0),
      ));
  if (
    enforceAdmins.enabled !== true ||
    requiredReviews.dismiss_stale_reviews !== true ||
    requiredReviews.require_code_owner_reviews !== false ||
    requiredReviews.require_last_push_approval !== false ||
    requiredReviews.required_approving_review_count !== 0 ||
    !dismissalRestrictionsEmpty ||
    protection.restrictions !== null ||
    linearHistory.enabled !== true ||
    conversationResolution.enabled !== true ||
    allowForcePushes.enabled !== false ||
    allowDeletions.enabled !== false ||
    blockCreations.enabled !== false ||
    lockBranch.enabled !== false ||
    allowForkSyncing.enabled !== false ||
    statusChecks.strict !== true ||
    !Array.isArray(statusChecks.contexts) ||
    statusChecks.contexts.length !== 0 ||
    !Array.isArray(statusChecks.checks) ||
    statusChecks.checks.length !== requiredCheckNames.length
  ) {
    throw new Error("GitHub branch protection proof is incomplete");
  }
  for (const expected of config.github.requiredChecks) {
    const matches = statusChecks.checks.filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.context === expected.name &&
        candidate.app_id === config.github.actionsAppId,
    );
    if (matches.length !== 1) {
      throw new Error(`GitHub protection check ${expected.name} is not app-bound`);
    }
  }

  if (
    !Array.isArray(proof.rulesets) ||
    proof.rulesets.length !== config.github.rulesets.length
  ) {
    throw new Error("GitHub ruleset set does not match the release pin");
  }
  for (const expectedRuleset of config.github.rulesets) {
    const matches = proof.rulesets.filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.id === expectedRuleset.id &&
        candidate.name === expectedRuleset.name,
    );
    if (matches.length !== 1) {
      throw new Error("GitHub ruleset identity does not match the release pin");
    }
    const rawRuleset = matches[0];
    const ruleset = requiredRecord(rawRuleset, "GitHub ruleset");
    const conditions = requiredRecord(ruleset.conditions, "GitHub ruleset conditions");
    const refName = requiredRecord(conditions.ref_name, "GitHub ruleset ref condition");
    if (
      ruleset.enforcement !== "active" ||
      !Array.isArray(ruleset.bypass_actors) ||
      ruleset.bypass_actors.length !== 0 ||
      !Array.isArray(refName.include) ||
      !refName.include.includes("~DEFAULT_BRANCH") ||
      !Array.isArray(refName.exclude) ||
      refName.exclude.length !== 0 ||
      !Array.isArray(ruleset.rules) ||
      !ruleset.rules.some(
        (rule) => isRecord(rule) && rule.type === "required_status_checks",
      )
    ) {
      throw new Error("GitHub ruleset can bypass or omit main release checks");
    }
  }

  const checkRuns = requiredRecord(proof.checkRuns, "GitHub check-runs proof");
  if (
    typeof checkRuns.total_count !== "number" ||
    checkRuns.total_count < requiredCheckNames.length ||
    !Array.isArray(checkRuns.check_runs) ||
    checkRuns.check_runs.length !== checkRuns.total_count
  ) {
    throw new Error("GitHub exact check-run proof is incomplete");
  }
  for (const expected of config.github.requiredChecks) {
    const matches = checkRuns.check_runs.filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.name === expected.name,
    );
    const match = matches[0];
    if (
      matches.length !== 1 ||
      !isRecord(match.app) ||
      match.app.id !== config.github.actionsAppId ||
      match.status !== "completed" ||
      match.conclusion !== "success" ||
      match.head_sha !== approvedSha ||
      typeof match.details_url !== "string"
    ) {
      throw new Error(`GitHub check ${expected.name} is not release-approved`);
    }
  }

  if (
    !Array.isArray(proof.workflowRuns) ||
    proof.workflowRuns.length !== config.github.requiredChecks.length
  ) {
    throw new Error("GitHub workflow-run proof is incomplete");
  }
  for (const expected of config.github.requiredChecks) {
    const check = checkRuns.check_runs.find(
      (candidate) => isRecord(candidate) && candidate.name === expected.name,
    );
    if (!isRecord(check) || typeof check.details_url !== "string") {
      throw new Error(`GitHub check ${expected.name} has no workflow-run link`);
    }
    const runIdMatch = check.details_url.match(/\/actions\/runs\/(\d+)(?:\/|$)/);
    if (!runIdMatch) {
      throw new Error(`GitHub check ${expected.name} has an invalid workflow-run link`);
    }
    const matches = proof.workflowRuns.filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.job === expected.name &&
        candidate.path === expected.workflow &&
        candidate.id === Number(runIdMatch[1]),
    );
    const match = matches[0];
    if (
      matches.length !== 1 ||
      match.event !== "push" ||
      match.head_branch !== "main" ||
      match.head_sha !== approvedSha ||
      match.run_attempt !== 1 ||
      match.conclusion !== "success"
    ) {
      throw new Error(`GitHub workflow ${expected.workflow} is not main-SHA proven`);
    }
  }

  const environment = requiredRecord(
    proof.environment,
    "GitHub environment proof",
  );
  const branchPolicy = requiredRecord(
    environment.deployment_branch_policy,
    "GitHub environment branch policy",
  );
  const protectionRules = environment.protection_rules;
  const reviewerRule = Array.isArray(protectionRules)
    ? protectionRules.find(
        (rule) => isRecord(rule) && rule.type === "required_reviewers",
      )
    : undefined;
  const branchRule = Array.isArray(protectionRules)
    ? protectionRules.find(
        (rule) => isRecord(rule) && rule.type === "branch_policy",
      )
    : undefined;
  const reviewers = isRecord(reviewerRule) ? reviewerRule.reviewers : undefined;
  if (
    environment.name !== config.github.environment ||
    environment.can_admins_bypass !== false ||
    branchPolicy.protected_branches !== true ||
    branchPolicy.custom_branch_policies !== false ||
    !Array.isArray(protectionRules) ||
    protectionRules.length !== 2 ||
    !branchRule ||
    !Array.isArray(reviewers) ||
    reviewers.length !== 1 ||
    reviewerRule.prevent_self_review !== false ||
    !isRecord(reviewers[0]) ||
    reviewers[0].type !== "User" ||
    !isRecord(reviewers[0].reviewer) ||
    reviewers[0].reviewer.id !== config.github.approver.id ||
    reviewers[0].reviewer.login !== config.github.approver.login
  ) {
    throw new Error("GitHub environment approval proof is incomplete");
  }
  const run = requiredRecord(proof.run, "GitHub workflow run proof");
  const expectedWorkflow =
    approvalMode === "baseline"
      ? config.github.baselineWorkflow
      : approvalMode === "genesis"
        ? config.github.bootstrapWorkflow
        : config.github.workflow;
  if (
    run.event !== "workflow_dispatch" ||
    run.head_branch !== "main" ||
    run.head_sha !== approvedSha ||
    run.run_attempt !== 1 ||
    run.path !== expectedWorkflow ||
    run.status !== "in_progress" ||
    !isRecord(run.actor) ||
    run.actor.id !== config.github.approver.id ||
    run.actor.login !== config.github.approver.login ||
    typeof run.id !== "number"
  ) {
    throw new Error("GitHub workflow approval does not match this release");
  }
  if (!Array.isArray(proof.reviewHistory) || proof.reviewHistory.length !== 1) {
    throw new Error("GitHub current run approval is incomplete");
  }
  const approval = requiredRecord(
    proof.reviewHistory[0],
    "GitHub run approval proof",
  );
  if (
    approval.state !== "approved" ||
    !isRecord(approval.user) ||
    approval.user.id !== config.github.approver.id ||
    approval.user.login !== config.github.approver.login ||
    !Array.isArray(approval.environments) ||
    approval.environments.length !== 1 ||
    !isRecord(approval.environments[0]) ||
    approval.environments[0].name !== config.github.environment
  ) {
    throw new Error("GitHub current run approval is incomplete");
  }

  if (
    !Array.isArray(proof.collaborators) ||
    proof.collaborators.length !== config.github.collaborators.length
  ) {
    throw new Error("GitHub collaborator set does not match the release pin");
  }
  for (const expected of config.github.collaborators) {
    const matches = proof.collaborators.filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.id === expected.id &&
        candidate.login === expected.login,
    );
    if (
      matches.length !== 1 ||
      !isRecord(matches[0].permissions) ||
      matches[0].permissions.admin !== true
    ) {
      throw new Error("GitHub collaborator admin identity is not pinned");
    }
  }

  if (approvalMode === "baseline") {
    if (proof.knownGood !== undefined) {
      throw new Error(
        `${approvalMode} GitHub approval cannot claim historical provenance`,
      );
    }
    if (proof.vercelBaseline !== undefined) {
      throw new Error("Baseline approval cannot claim its own activation provenance");
    }
    if (proof.bootstrapRoute !== undefined) {
      throw new Error("Baseline approval cannot claim bootstrap route authority");
    }
    return {
      knownGoodConvexSha256: undefined,
      runAttempt: 1 as const,
      runId: run.id as number,
    };
  }

  if (approvalMode === "genesis") {
    if (proof.knownGood !== undefined) {
      throw new Error("Genesis GitHub approval cannot claim historical provenance");
    }
    validateProductionVercelBaselineProvenance(proof.vercelBaseline, {
      authorityWorkflowLineage: config.github.authorityWorkflowLineage,
      workflowPath: config.github.baselineWorkflow,
    });
    const bootstrapRoute = requiredRecord(
      proof.bootstrapRoute,
      "production bootstrap route proof",
    );
    const route = bootstrapRoute.route;
    if (route !== "initial_genesis" && route !== "expired_anchor") {
      throw new Error("production bootstrap route is not exact");
    }
    const selectedAnchor =
      route === "expired_anchor"
        ? (requiredRecord(
            bootstrapRoute.selectedAnchor,
            "selected expired production authority",
          ) as unknown as ProductionBootstrapAnchorIdentity)
        : undefined;
    const routeBinding = validateProductionBootstrapRouteProof(
      bootstrapRoute,
      {
        authorityWorkflowLineage: config.github.authorityWorkflowLineage,
        route,
        ...(selectedAnchor ? { selectedAnchor } : {}),
        workflowPaths: [config.github.workflow, config.github.bootstrapWorkflow],
      },
    );
    return {
      bootstrapRoute: routeBinding.route,
      bootstrapRouteProofSha256: routeBinding.routeProofSha256,
      knownGoodConvexSha256: undefined,
      runAttempt: 1 as const,
      runId: run.id as number,
    };
  }

  if (proof.vercelBaseline !== undefined) {
    throw new Error("Normal GitHub approval cannot claim baseline provenance");
  }
  if (proof.bootstrapRoute !== undefined) {
    throw new Error("Normal GitHub approval cannot claim bootstrap authority");
  }

  if (!knownGoodSha || !FULL_GIT_COMMIT_SHA.test(knownGoodSha)) {
    throw new Error("Normal GitHub approval requires a full known-good SHA");
  }

  const knownGood = requiredRecord(
    proof.knownGood,
    "GitHub known-good provenance proof",
  );
  const knownGoodRun = requiredRecord(
    knownGood.run,
    "GitHub known-good workflow run",
  );
  const knownGoodArtifact = requiredRecord(
    knownGood.artifact,
    "GitHub known-good receipt artifact",
  );
  const knownGoodArtifactRun = requiredRecord(
    knownGoodArtifact.workflow_run,
    "GitHub known-good artifact workflow run",
  );
  const knownGoodReleaseReceiptRecord = requiredRecord(
    knownGood.releaseReceipt,
    "GitHub known-good production release receipt",
  );
  const knownGoodReleaseReceipt = requireCompleteReceipt(
    knownGoodReleaseReceiptRecord as unknown as ProductionReleaseReceipt,
  );
  const knownGoodWorkflowSource = requiredRecord(
    knownGood.workflowSource,
    "GitHub known-good workflow source",
  );
  requireExactKeys(
    knownGoodWorkflowSource,
    ["content", "path", "ref", "sha256"],
    "GitHub known-good workflow source",
  );
  if (
    typeof knownGoodWorkflowSource.content !== "string" ||
    knownGoodWorkflowSource.content.length === 0 ||
    knownGoodWorkflowSource.path !== knownGoodRun.path ||
    knownGoodWorkflowSource.ref !== knownGoodRun.head_sha ||
    typeof knownGoodWorkflowSource.sha256 !== "string" ||
    knownGoodWorkflowSource.sha256 !== sha256(knownGoodWorkflowSource.content)
  ) {
    throw new Error("GitHub known-good workflow source is invalid");
  }
  if (
    config.github.authorityWorkflowLineage.filter(
      (entry) =>
        entry.authorityKind === "normal" &&
        entry.path === knownGoodWorkflowSource.path &&
        entry.workflowSha256 === knownGoodWorkflowSource.sha256,
    ).length !== 1
  ) {
    throw new Error("GitHub known-good workflow lineage is not approved");
  }
  const expectedArtifactName =
    `production-release-${knownGoodSha}-${String(knownGoodRun.id)}-${String(knownGoodRun.run_attempt)}`;
  const successfulAnchor =
    knownGoodRun.conclusion === "success" &&
    knownGoodReleaseReceipt.event === "production_release_complete_receipt" &&
    knownGoodReleaseReceipt.result === "passed" &&
    knownGoodReleaseReceipt.promotionAllowed === true;
  if (
    knownGood.sha !== knownGoodSha ||
    knownGood.runId !== knownGoodRun.id ||
    knownGood.runAttempt !== knownGoodRun.run_attempt ||
    !Number.isSafeInteger(knownGoodRun.id) ||
    Number(knownGoodRun.id) < 1 ||
    knownGoodRun.head_sha !== knownGoodSha ||
    knownGoodRun.head_branch !== "main" ||
    knownGoodRun.event !== "workflow_dispatch" ||
    !Number.isSafeInteger(knownGoodRun.run_attempt) ||
    Number(knownGoodRun.run_attempt) < 1 ||
    knownGoodRun.status !== "completed" ||
    !successfulAnchor ||
    typeof knownGood.artifactDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(knownGood.artifactDigest) ||
    typeof knownGood.artifactName !== "string" ||
    knownGood.artifactName !== expectedArtifactName ||
    !Number.isSafeInteger(knownGoodArtifact.id) ||
    Number(knownGoodArtifact.id) < 1 ||
    knownGoodArtifact.name !== knownGood.artifactName ||
    knownGoodArtifact.digest !== knownGood.artifactDigest ||
    knownGoodArtifact.expired !== false ||
    knownGoodArtifactRun.id !== knownGoodRun.id ||
    knownGoodArtifactRun.head_sha !== knownGoodSha ||
    knownGoodArtifactRun.head_branch !== "main" ||
    knownGoodReleaseReceipt.schemaVersion !== 1 ||
    knownGoodReleaseReceipt.approvedSha !== knownGoodSha ||
    knownGoodReleaseReceipt.convexCandidateRemainsLive !== true ||
    knownGoodReleaseReceipt.trafficMutated !== true
  ) {
    throw new Error("GitHub known-good receipt provenance is not release-proven");
  }
  return {
    knownGoodConvexSha256: knownGoodReleaseReceipt.proofSha256.convex,
    runAttempt: 1 as const,
    runId: run.id as number,
  };
}

function requireVercelStageReceipt(
  value: unknown,
  approvedSha: string,
  configuration: VercelProductionReleaseConfig,
) {
  const receipt = requiredRecord(value, "Vercel stage receipt");
  if (
    receipt.schemaVersion !== 1 ||
    receipt.event !== "vercel_production_stage_receipt" ||
    receipt.approvedSha !== approvedSha ||
    receipt.teamId !== configuration.teamId ||
    !isRecord(receipt.convexTarget) ||
    receipt.convexTarget.deploymentName !== configuration.convexTarget.deploymentName ||
    receipt.convexTarget.deploymentUrl !== configuration.convexTarget.deploymentUrl ||
    !Array.isArray(receipt.applications) ||
    receipt.applications.length !== APPLICATIONS.length
  ) {
    throw new Error("Vercel stage receipt is incomplete");
  }
  const seenIds = new Set<string>();
  const applications = receipt.applications.map((entry, index) => {
    const application = requiredRecord(entry, "Vercel staged application");
    const target = configuration.targets[index];
    const health = requiredRecord(application.health, "Vercel staged health");
    if (
      application.application !== target.application ||
      application.projectId !== target.projectId ||
      application.projectName !== target.projectName ||
      application.productionDomain !== target.productionDomain ||
      !Array.isArray(application.productionDomains) ||
      application.productionDomains.length !== target.productionDomains.length ||
      application.productionDomains.some(
        (domain, domainIndex) => domain !== target.productionDomains[domainIndex],
      ) ||
      application.rootDirectory !== target.rootDirectory ||
      application.providerGitSha !== approvedSha ||
      application.state !== "READY" ||
      application.substate !== "STAGED" ||
      application.target !== "production" ||
      typeof application.deploymentId !== "string" ||
      !/^dpl_[A-Za-z0-9_-]+$/.test(application.deploymentId) ||
      typeof application.predecessorDeploymentId !== "string" ||
      !/^dpl_[A-Za-z0-9_-]+$/.test(application.predecessorDeploymentId) ||
      typeof application.predecessorProviderGitSha !== "string" ||
      !FULL_GIT_COMMIT_SHA.test(application.predecessorProviderGitSha) ||
      application.deploymentId === application.predecessorDeploymentId ||
      health.commitSha !== approvedSha ||
      health.domain !== target.application ||
      health.environment !== "production" ||
      health.service !== "sourcera" ||
      health.status !== "ok"
    ) {
      throw new Error(`${target.application} Vercel stage receipt is invalid`);
    }
    if (seenIds.has(application.deploymentId)) {
      throw new Error("Vercel staged deployment IDs must be unique");
    }
    seenIds.add(application.deploymentId);
    return application as unknown as VercelProductionStagedApplication;
  });
  return { applications };
}

function normalizedHttpsUrl(value: unknown, context: string) {
  if (typeof value !== "string" || value.trim() !== value || !value) {
    throw new Error(`${context} must be an HTTPS URL`);
  }
  const candidate = value.startsWith("https://") ? value : `https://${value}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch (cause) {
    throw new Error(`${context} must be an HTTPS URL`, { cause });
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(`${context} must be an HTTPS origin`);
  }
  return parsed.toString().replace(/\/$/, "");
}

function createProductionProofBinding(
  approvedSha: string,
  convex: VercelProductionReleaseConfig["convexTarget"],
  stagedApplications: VercelProductionStagedApplication[],
): ProductionProofBinding {
  const stagedUrls = new Set<string>();
  const domains = new Set<string>();
  const deployments = stagedApplications.map((staged, index) => {
    if (staged.application !== APPLICATIONS[index]) {
      throw new Error("production proof binding applications are out of order");
    }
    const stagedUrl = normalizedHttpsUrl(
      staged.url,
      `${staged.application} staged URL`,
    );
    if (stagedUrl !== staged.url || stagedUrls.has(stagedUrl)) {
      throw new Error("production proof binding staged URLs are not exact");
    }
    stagedUrls.add(stagedUrl);
    for (const domain of staged.productionDomains) {
      if (domains.has(domain)) {
        throw new Error("production proof binding domains are not unique");
      }
      domains.add(domain);
    }
    return {
      application: staged.application,
      deploymentId: staged.deploymentId,
      domains: [...staged.productionDomains],
      projectId: staged.projectId,
      stagedUrl,
    };
  });
  return {
    candidateSha: approvedSha,
    convex: {
      deploymentName: convex.deploymentName,
      deploymentUrl: convex.deploymentUrl,
    },
    deployments,
  };
}

function requireConvexReceipt(
  value: unknown,
  approvedSha: string,
  knownGoodSha: string,
  knownGoodReceiptRaw: string,
  target: ConvexProductionTarget,
) {
  const receipt = readPassingKnownGoodConvexReceipt(
    value,
    approvedSha,
    target,
  ) as unknown as RecordValue;
  if (
    receipt.knownGoodSha !== knownGoodSha ||
    receipt.knownGoodReceiptSha256 === undefined ||
    typeof receipt.knownGoodReceiptSha256 !== "string" ||
    !SHA256.test(receipt.knownGoodReceiptSha256) ||
    receipt.knownGoodReceiptSha256 !== sha256(knownGoodReceiptRaw)
  ) {
    throw new Error("Convex production receipt does not match the release");
  }
}

function requireCandidateRollbackReceipt(
  value: unknown,
  approvedSha: string,
  knownGoodSha: string,
  knownGoodReceiptRaw: string,
  target: ConvexProductionTarget,
) {
  return readPassingConvexProductionCandidateRollbackReceipt(value, {
    candidateSha: approvedSha,
    knownGoodReceiptSha256: sha256(knownGoodReceiptRaw),
    knownGoodSha,
    target,
  });
}

function requireForcedConvexRollbackReceipt(
  value: unknown,
  approvedSha: string,
  knownGoodSha: string,
  knownGoodReceiptRaw: string,
  target: ConvexProductionTarget,
  genesisBinding?: ProductionGenesisBinding,
) {
  return readPassingConvexProductionForcedRollbackReceipt(value, {
    ...(genesisBinding
      ? { approvalReceiptSha256: genesisBinding.approvalReceiptSha256 }
      : {}),
    candidateSha: approvedSha,
    knownGoodReceiptSha256: sha256(knownGoodReceiptRaw),
    knownGoodSha,
    target,
  });
}

export function validateProductionApplicationInspection(
  inspection: ProductionApplicationInspection,
  expectedApplication: VercelProductionApplication,
  staged: VercelProductionStagedApplication,
  teamId: string,
  target: VercelProductionTarget,
) {
  let raw: RecordValue;
  try {
    raw = requiredRecord(JSON.parse(inspection.raw), "provider readback");
  } catch (cause) {
    throw new Error(`${expectedApplication} provider readback is not JSON`, {
      cause,
    });
  }
  const provider = isRecord(raw.provider) ? raw.provider : undefined;
  const candidateDeployment = provider && isRecord(provider.candidateDeployment)
    ? provider.candidateDeployment
    : undefined;
  const candidateMetadata = candidateDeployment && isRecord(candidateDeployment.meta)
    ? candidateDeployment.meta
    : undefined;
  const candidateDeploymentUrl = normalizedHttpsUrl(
    candidateDeployment?.url,
    `${expectedApplication} provider candidate URL`,
  );
  const candidateHealth = provider && isRecord(provider.candidateHealth)
    ? provider.candidateHealth
    : undefined;
  const current = provider && isRecord(provider.current)
    ? provider.current
    : undefined;
  const currentHealth = provider && isRecord(provider.currentHealth)
    ? provider.currentHealth
    : undefined;
  const project = provider && isRecord(provider.project)
    ? provider.project
    : undefined;
  validateProductionEnvironmentMetadata(
    provider?.productionEnvironmentMetadata,
    target,
  );
  validateProductionDomains(provider?.productionDomains, target);
  const expectedCurrentCommitSha =
    current?.id === inspection.candidate.deploymentId
      ? inspection.candidate.commitSha
      : current?.id === staged.predecessorDeploymentId
        ? staged.predecessorProviderGitSha
        : undefined;
  const rawCandidateHealthy =
    candidateHealth?.status === "ok" &&
    candidateHealth.service === "sourcera" &&
    candidateHealth.domain === expectedApplication &&
    candidateHealth.environment === "production" &&
    candidateHealth.commitSha === inspection.candidate.commitSha;
  const rawCurrentHealthy =
    currentHealth?.status === "ok" &&
    currentHealth.service === "sourcera" &&
    currentHealth.domain === expectedApplication &&
    currentHealth.environment === "production" &&
    expectedCurrentCommitSha !== undefined &&
    currentHealth.commitSha === expectedCurrentCommitSha;
  if (
    inspection.application !== expectedApplication ||
    raw.application !== expectedApplication ||
    !isRecord(raw.candidate) ||
    raw.candidate.commitSha !== inspection.candidate.commitSha ||
    raw.candidate.deploymentId !== inspection.candidate.deploymentId ||
    raw.candidate.healthy !== inspection.candidate.healthy ||
    raw.candidate.state !== inspection.candidate.state ||
    !isRecord(raw.current) ||
    raw.current.deploymentId !== inspection.current.deploymentId ||
    raw.current.healthy !== inspection.current.healthy ||
    candidateDeployment?.id !== inspection.candidate.deploymentId ||
    candidateDeploymentUrl !== staged.url ||
    candidateDeployment.readyState !== "READY" ||
    candidateDeployment.target !== "production" ||
    candidateMetadata?.githubCommitSha !== inspection.candidate.commitSha ||
    candidateMetadata?.sourceraReleaseApprovedSha !== inspection.candidate.commitSha ||
    candidateDeployment.projectId !== staged.projectId ||
    candidateDeployment.name !== staged.projectName ||
    candidateDeployment.ownerId !== teamId ||
    rawCandidateHealthy !== inspection.candidate.healthy ||
    current?.id !== inspection.current.deploymentId ||
    ![current?.alias, current?.automaticAliases, current?.userAliases]
      .flatMap((value) => (Array.isArray(value) ? value : []))
      .includes(staged.productionDomain) ||
    rawCurrentHealthy !== inspection.current.healthy ||
    project?.id !== staged.projectId ||
    project?.name !== staged.projectName ||
    project?.accountId !== teamId ||
    (inspection.candidate.state === "PROMOTED") !==
      (inspection.current.deploymentId === inspection.candidate.deploymentId) ||
    !/^dpl_[A-Za-z0-9_-]+$/.test(inspection.candidate.deploymentId) ||
    !/^dpl_[A-Za-z0-9_-]+$/.test(inspection.current.deploymentId) ||
    !["PROMOTED", "STAGED"].includes(inspection.candidate.state)
  ) {
    throw new Error(`${expectedApplication} provider readback is inconsistent`);
  }
  return inspection;
}

function requirePrePromotionInspection(
  inspection: ProductionApplicationInspection,
  staged: VercelProductionStagedApplication,
  approvedSha: string,
) {
  if (
    inspection.candidate.deploymentId !== staged.deploymentId ||
    inspection.candidate.commitSha !== approvedSha ||
    inspection.candidate.healthy !== true ||
    inspection.candidate.state !== "STAGED" ||
    inspection.current.deploymentId !== staged.predecessorDeploymentId ||
    inspection.current.healthy !== true
  ) {
    throw new Error(`${staged.application} staged or predecessor readback failed`);
  }
}

function requirePromotedInspection(
  inspection: ProductionApplicationInspection,
  staged: VercelProductionStagedApplication,
  approvedSha: string,
) {
  if (
    inspection.candidate.deploymentId !== staged.deploymentId ||
    inspection.candidate.commitSha !== approvedSha ||
    inspection.candidate.healthy !== true ||
    inspection.candidate.state !== "PROMOTED" ||
    inspection.current.deploymentId !== staged.deploymentId ||
    inspection.current.healthy !== true
  ) {
    throw new Error(`${staged.application} promotion readback failed`);
  }
}

function requireProductionTarget(
  configuration: VercelProductionReleaseConfig,
  application: VercelProductionApplication,
) {
  const target = configuration.targets.find(
    (candidate) => candidate.application === application,
  );
  if (!target) throw new Error(`${application} production target is missing`);
  return target;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown release failure";
}

function receiptBase(
  options: ExecuteProductionReleaseOptions,
  now: () => Date,
  proofEvidence: Record<string, string>,
  proofSha256: Record<string, string>,
  providerProofEvidence: Record<string, string>,
  providerProofSha256: Record<string, string>,
) {
  const checkedAt = now().toISOString();
  return {
    anchorMode: options.anchorMode ?? "normal",
    approvedSha: options.approvedSha,
    checkedAt,
    knownGoodSha: options.knownGoodSha,
    productionApplications: [...APPLICATIONS],
    proofEvidence,
    proofSha256,
    providerProofEvidence,
    providerProofSha256,
    schemaVersion: 1 as const,
  };
}

export async function executeProductionRelease(
  options: ExecuteProductionReleaseOptions,
): Promise<ProductionReleaseReceipt> {
  const now = options.now ?? (() => new Date());
  const proofEvidence: Record<string, string> = {};
  const proofSha256: Record<string, string> = {};
  const providerProofEvidence: Record<string, string> = {};
  const providerProofSha256: Record<string, string> = {};
  let failedStage = "configuration";
  let trafficMutationAttempted = false;
  let stagedApplications: VercelProductionStagedApplication[] | undefined;
  let convexCandidateState: boolean | "unknown" = false;
  let releaseTargets: VercelProductionReleaseConfig | undefined;
  let genesisBinding: ProductionGenesisBinding | undefined;
  let convexRollbackError: string | undefined;
  const anchorMode = options.anchorMode ?? "normal";

  const restoreKnownGoodConvex = async () => {
    if (convexCandidateState === false) return true;
    try {
      if (!releaseTargets || !proofEvidence.knownGoodConvex) {
        throw new Error("Convex rollback binding is unavailable");
      }
      const rollback = await options.dependencies.rollbackConvex(
        genesisBinding,
      );
      recordEvidence(
        proofEvidence,
        proofSha256,
        "convexRollback",
        rollback.raw,
      );
      requireForcedConvexRollbackReceipt(
        parseEvidence(rollback, "forced Convex rollback", false),
        options.approvedSha,
        options.knownGoodSha,
        proofEvidence.knownGoodConvex,
        releaseTargets.convexTarget,
        genesisBinding,
      );
      convexCandidateState = false;
      return true;
    } catch (rollbackError) {
      convexRollbackError = errorMessage(rollbackError);
      recordEvidenceError(
        proofEvidence,
        proofSha256,
        "convexRollback",
        rollbackError,
      );
      return false;
    }
  };

  try {
    if (
      !["genesis", "normal"].includes(anchorMode) ||
      !FULL_GIT_COMMIT_SHA.test(options.approvedSha) ||
      !FULL_GIT_COMMIT_SHA.test(options.knownGoodSha) ||
      options.approvedSha === options.knownGoodSha
    ) {
      throw new Error("release requires distinct full candidate and known-good SHAs");
    }
    recordEvidence(
      proofEvidence,
      proofSha256,
      "configuration",
      JSON.stringify({
        anchorMode,
        approvedSha: options.approvedSha,
        knownGoodSha: options.knownGoodSha,
        productionRelease: options.config,
        productionTargets: options.productionTargets,
      }),
    );
    const config = readProductionReleaseConfig(options.config);
    const targets = readVercelProductionReleaseConfig(
      options.productionTargets,
      options.repositoryRoot,
    );
    releaseTargets = targets;
    if (config.proofCollection.mode !== "durable") {
      throw new Error(
        "DEC-PROD-002 blocks production until the isolated candidate and durable proof coordinator are pinned",
      );
    }
    if (
      config.proofCollection.isolatedCandidateConvex.deploymentName ===
        targets.convexTarget.deploymentName ||
      config.proofCollection.isolatedCandidateConvex.deploymentUrl ===
        targets.convexTarget.deploymentUrl
    ) {
      throw new Error(
        "DEC-PROD-002 requires an isolated Convex candidate target distinct from production",
      );
    }
    if (targets.targets.some(({ productionDomain }) => productionDomain === null)) {
      throw new Error("all three production domains must be repo-pinned");
    }

    failedStage = "repository";
    const repository = await options.dependencies.verifyRepository();
    recordEvidence(
      proofEvidence,
      proofSha256,
      "repository-initial",
      repository.raw,
    );
    requireRepositoryEvidence(
      parseEvidence(repository, "repository verification"),
      options.approvedSha,
    );

    failedStage = "stamp";
    const stamp = await options.dependencies.runStampGate();
    recordEvidence(proofEvidence, proofSha256, "stamp", stamp.raw);
    requireStampEvidence(parseEvidence(stamp, "stamp gate"));

    failedStage = "exact";
    const exact = await options.dependencies.runExactStatusScan();
    recordEvidence(proofEvidence, proofSha256, "exact", exact.raw);
    requireExactEvidence(parseEvidence(exact, "exact status scan"));

    failedStage = "delivery";
    const delivery = await options.dependencies.runDeliveryVerification();
    recordEvidence(proofEvidence, proofSha256, "delivery", delivery.raw);
    parseEvidence(delivery, "delivery verification");

    failedStage = "github";
    const github = await options.dependencies.verifyGitHubApproval();
    recordEvidence(proofEvidence, proofSha256, "github", github.raw);
    const githubProof = parseEvidence(github, "GitHub approval");
    const currentApproval = validateProductionGithubApprovalEvidence(
      githubProof,
      config,
      options.approvedSha,
      options.knownGoodSha,
      anchorMode,
    );

    if (anchorMode === "genesis") {
      if (!github.approvalReceiptRaw) {
        throw new Error("Genesis release requires a current-run approval receipt");
      }
      const approvalReceipt = readGithubProductionApprovalReceipt(
        JSON.parse(github.approvalReceiptRaw) as unknown,
        {
          approvedCandidateSha: options.approvedSha,
          githubRepository: "meetblakey/sourcera",
          githubRunAttempt: currentApproval.runAttempt,
          githubRunId: currentApproval.runId,
        },
      );
      if (approvalReceipt.sourceProofSha256 !== sha256(github.raw)) {
        throw new Error("Genesis approval receipt is not bound to GitHub proof");
      }
      const bootstrapRouteRaw = JSON.stringify(
        requiredRecord(
          requiredRecord(githubProof, "GitHub approval proof").bootstrapRoute,
          "production bootstrap route proof",
        ),
      );
      if (
        currentApproval.bootstrapRouteProofSha256 !==
        sha256(bootstrapRouteRaw)
      ) {
        throw new Error("Genesis route proof is not bound to GitHub approval");
      }
      genesisBinding = {
        approvalReceiptRaw: github.approvalReceiptRaw,
        approvalReceiptSha256: sha256(github.approvalReceiptRaw),
        approvedCandidateSha: options.approvedSha,
        bootstrapRoute: currentApproval.bootstrapRoute,
        bootstrapRouteProofSha256:
          currentApproval.bootstrapRouteProofSha256,
        githubRunAttempt: currentApproval.runAttempt,
        githubRunId: currentApproval.runId,
      };
      recordEvidence(
        proofEvidence,
        proofSha256,
        "githubBootstrapRoute",
        bootstrapRouteRaw,
      );
      recordEvidence(
        proofEvidence,
        proofSha256,
        "githubApprovalReceipt",
        github.approvalReceiptRaw,
      );
    } else if (github.approvalReceiptRaw !== undefined) {
      throw new Error("Normal release cannot include a genesis approval receipt");
    }

    failedStage = "known_good_convex";
    const knownGoodConvex =
      await options.dependencies.verifyKnownGoodConvexReceipt(genesisBinding);
    recordEvidence(
      proofEvidence,
      proofSha256,
      "knownGoodConvex",
      knownGoodConvex.raw,
    );
    readPassingKnownGoodConvexReceipt(
      parseEvidence(knownGoodConvex, "known-good Convex receipt"),
      options.knownGoodSha,
      targets.convexTarget,
      genesisBinding
        ? {
            approvedCandidateSha: genesisBinding.approvedCandidateSha,
            approvalReceiptSha256: genesisBinding.approvalReceiptSha256,
            githubRunAttempt: genesisBinding.githubRunAttempt,
            githubRunId: genesisBinding.githubRunId,
          }
        : undefined,
    );
    if (
      anchorMode === "normal" &&
      currentApproval.knownGoodConvexSha256 !== sha256(knownGoodConvex.raw)
    ) {
      throw new Error(
        "Known-good release receipt is not paired to the exact Convex receipt",
      );
    }

    failedStage = "convex_classification";
    if (!options.dependencies.classifyConvexChanges) {
      throw new Error("Convex classification dependency is unavailable");
    }
    const convexClassificationEvidence =
      await options.dependencies.classifyConvexChanges();
    recordEvidence(
      proofEvidence,
      proofSha256,
      "convexClassification",
      convexClassificationEvidence.raw,
    );
    const convexClassification = readConvexChangeClassification(
      parseEvidence(
        convexClassificationEvidence,
        "Convex production change classification",
      ),
      {
        baseSha: options.knownGoodSha,
        candidateSha: options.approvedSha,
      },
    );

    failedStage = "vercel_stage";
    const vercelStage = await options.dependencies.stageVercel();
    recordEvidence(proofEvidence, proofSha256, "vercelStage", vercelStage.raw);
    stagedApplications = requireVercelStageReceipt(
      parseEvidence(vercelStage, "Vercel production stage"),
      options.approvedSha,
      targets,
    ).applications;

    failedStage = "repository_after_stage";
    const repositoryAfterStage = await options.dependencies.verifyRepository();
    recordEvidence(
      proofEvidence,
      proofSha256,
      "repository-after-stage",
      repositoryAfterStage.raw,
    );
    requireRepositoryEvidence(
      parseEvidence(repositoryAfterStage, "post-stage repository verification"),
      options.approvedSha,
    );

    const productionDataProtectionBinding = createProductionProofBinding(
      options.approvedSha,
      targets.convexTarget,
      stagedApplications,
    );

    failedStage = "provider_pre_convex";
    for (const staged of stagedApplications) {
      const inspection = await options.dependencies.inspectApplication(
        staged.application,
        staged,
      );
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `pre-convex-${staged.application}`,
        inspection.raw,
      );
      const inspected = validateProductionApplicationInspection(
        inspection,
        staged.application,
        staged,
        targets.teamId,
        requireProductionTarget(targets, staged.application),
      );
      requirePrePromotionInspection(inspected, staged, options.approvedSha);
    }

    failedStage = "convex_data_protection";
    if (convexClassification.requiresBackup) {
      if (!options.dependencies.verifyConvexDataProtection) {
        throw new Error("Convex data-protection dependency is unavailable");
      }
      const dataProtection =
        await options.dependencies.verifyConvexDataProtection(
          productionDataProtectionBinding,
          convexClassification,
        );
      recordEvidence(
        proofEvidence,
        proofSha256,
        "convexDataProtection",
        dataProtection.raw,
      );
      readConvexDataProtectionProof(
        parseEvidence(dataProtection, "Convex data-protection proof"),
        {
          binding: productionDataProtectionBinding,
          classification: convexClassification,
        },
      );
    } else {
      readConvexDataProtectionProof(undefined, {
        binding: productionDataProtectionBinding,
        classification: convexClassification,
      });
    }

    failedStage = "isolated_proof_environment";
    if (!options.dependencies.prepareIsolatedProofEnvironment) {
      throw new Error(
        "DEC-PROD-002 isolated proof environment dependency is unavailable",
      );
    }
    const isolatedProofEnvironment =
      await options.dependencies.prepareIsolatedProofEnvironment();
    recordEvidence(
      proofEvidence,
      proofSha256,
      "isolatedProofEnvironment",
      isolatedProofEnvironment.raw,
    );
    const productionProofBinding = readIsolatedProductionProofEnvironment(
      parseEvidence(
        isolatedProofEnvironment,
        "isolated production proof environment",
      ),
      {
        candidateSha: options.approvedSha,
        coordinator: config.proofCollection.coordinator,
        isolatedConvex: config.proofCollection.isolatedCandidateConvex,
        productionConvex: targets.convexTarget,
      },
    );
    recordEvidence(
      proofEvidence,
      proofSha256,
      "productionProofBinding",
      JSON.stringify(productionProofBinding),
    );

    failedStage = "provider_pre_promotion";
    for (const staged of stagedApplications) {
      const inspection = await options.dependencies.inspectApplication(
        staged.application,
        staged,
      );
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `pre-${staged.application}`,
        inspection.raw,
      );
      const inspected = validateProductionApplicationInspection(
        inspection,
        staged.application,
        staged,
        targets.teamId,
        requireProductionTarget(targets, staged.application),
      );
      requirePrePromotionInspection(inspected, staged, options.approvedSha);
    }

    failedStage = "r0_customer_journey";
    if (!options.dependencies.verifyR0CustomerJourney) {
      throw new Error("R0 customer proof dependency is unavailable");
    }
    const customerJourney =
      await options.dependencies.verifyR0CustomerJourney(
        productionProofBinding,
      );
    recordEvidence(
      proofEvidence,
      proofSha256,
      "r0CustomerJourney",
      customerJourney.raw,
    );
    readR0CustomerJourneyProof(
      parseEvidence(customerJourney, "R0 customer journey proof"),
      productionProofBinding,
    );

    failedStage = "r0_operational";
    if (!options.dependencies.verifyR0Operational) {
      throw new Error("R0 operational proof dependency is unavailable");
    }
    const operational =
      await options.dependencies.verifyR0Operational(productionProofBinding);
    recordEvidence(
      proofEvidence,
      proofSha256,
      "r0Operational",
      operational.raw,
    );
    readR0OperationalProof(
      parseEvidence(operational, "R0 operational proof"),
      productionProofBinding,
    );

    failedStage = "durable_proof_collection";
    if (!options.dependencies.verifyDurableProofCollection) {
      throw new Error(
        "DEC-PROD-002 durable proof collection dependency is unavailable",
      );
    }
    const durableProofCollection =
      await options.dependencies.verifyDurableProofCollection(
        productionProofBinding,
        customerJourney.raw,
        operational.raw,
      );
    recordEvidence(
      proofEvidence,
      proofSha256,
      "durableProofCollection",
      durableProofCollection.raw,
    );
    readDurableProductionProofCollection(
      parseEvidence(
        durableProofCollection,
        "durable production proof collection",
      ),
      {
        binding: productionProofBinding,
        coordinator: config.proofCollection.coordinator,
        customerProofRaw: customerJourney.raw,
        environmentProofRaw: isolatedProofEnvironment.raw,
        operationalProofRaw: operational.raw,
        productionConvex: targets.convexTarget,
      },
    );

    failedStage = "convex";
    convexCandidateState = "unknown";
    const convex = await options.dependencies.deployConvex();
    recordEvidence(proofEvidence, proofSha256, "convex", convex.raw);
    const convexReceipt = parseEvidence(
      convex,
      "Convex production deployment",
      false,
    );
    try {
      requireCandidateRollbackReceipt(
        convexReceipt,
        options.approvedSha,
        options.knownGoodSha,
        proofEvidence.knownGoodConvex,
        targets.convexTarget,
      );
      convexCandidateState = false;
      throw new Error(
        "Convex candidate failed and its exact known-good rollback was proven",
      );
    } catch (candidateRollbackError) {
      if (convexCandidateState === false) throw candidateRollbackError;
    }
    if (convex.exitCode !== 0) {
      throw new Error("Convex production deployment failed");
    }
    requireConvexReceipt(
      convexReceipt,
      options.approvedSha,
      options.knownGoodSha,
      proofEvidence.knownGoodConvex,
      targets.convexTarget,
    );
    convexCandidateState = true;

    failedStage = "provider_proof_ready";
    for (const staged of stagedApplications) {
      const inspection = await options.dependencies.inspectApplication(
        staged.application,
        staged,
      );
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `proof-ready-${staged.application}`,
        inspection.raw,
      );
      const inspected = validateProductionApplicationInspection(
        inspection,
        staged.application,
        staged,
        targets.teamId,
        requireProductionTarget(targets, staged.application),
      );
      requirePrePromotionInspection(inspected, staged, options.approvedSha);
    }

    for (const staged of stagedApplications) {
      failedStage = `repository_before_${staged.application}`;
      const repositoryBeforePromotion =
        await options.dependencies.verifyRepository();
      recordEvidence(
        proofEvidence,
        proofSha256,
        `repository-before-${staged.application}`,
        repositoryBeforePromotion.raw,
      );
      requireRepositoryEvidence(
        parseEvidence(
          repositoryBeforePromotion,
          `${staged.application} pre-promotion repository verification`,
        ),
        options.approvedSha,
      );
      failedStage = `promote_${staged.application}`;
      trafficMutationAttempted = true;
      const promotion = await options.dependencies.promoteApplication(
        staged.application,
        staged.deploymentId,
      );
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `promote-${staged.application}`,
        promotion.raw,
      );
      parseEvidence(promotion, `${staged.application} promotion`);
      const postPromotionInspection =
        await options.dependencies.inspectApplication(staged.application, staged);
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `post-${staged.application}`,
        postPromotionInspection.raw,
      );
      const inspected = validateProductionApplicationInspection(
        postPromotionInspection,
        staged.application,
        staged,
        targets.teamId,
        requireProductionTarget(targets, staged.application),
      );
      requirePromotedInspection(inspected, staged, options.approvedSha);
    }

    failedStage = "provider_final";
    for (const staged of stagedApplications) {
      const finalInspection = await options.dependencies.inspectApplication(
        staged.application,
        staged,
      );
      recordEvidence(
        providerProofEvidence,
        providerProofSha256,
        `final-${staged.application}`,
        finalInspection.raw,
      );
      const inspected = validateProductionApplicationInspection(
        finalInspection,
        staged.application,
        staged,
        targets.teamId,
        requireProductionTarget(targets, staged.application),
      );
      requirePromotedInspection(inspected, staged, options.approvedSha);
    }

    failedStage = "repository_final";
    const finalRepository = await options.dependencies.verifyRepository();
    recordEvidence(
      proofEvidence,
      proofSha256,
      "repository-final",
      finalRepository.raw,
    );
    requireRepositoryEvidence(
      parseEvidence(finalRepository, "final repository verification"),
      options.approvedSha,
    );

    return {
      ...receiptBase(
        options,
        now,
        proofEvidence,
        proofSha256,
        providerProofEvidence,
        providerProofSha256,
      ),
      convexCandidateRemainsLive: convexCandidateState,
      event: "production_release_complete_receipt",
      promotionAllowed: true,
      result: "passed",
      trafficMutated: true,
    };
  } catch (error) {
    if (!trafficMutationAttempted || !stagedApplications) {
      if (convexCandidateState !== false) {
        const convexRestored = await restoreKnownGoodConvex();
        return {
          ...receiptBase(
            options,
            now,
            proofEvidence,
            proofSha256,
            providerProofEvidence,
            providerProofSha256,
          ),
          convexCandidateRemainsLive: convexCandidateState,
          error: errorMessage(error),
          event: convexRestored
            ? "production_release_rollback_receipt"
            : "production_release_recovery_required_receipt",
          failedStage,
          promotionAllowed: false,
          reconciliation: {
            convex: convexRestored
              ? "known_good_proven"
              : `rollback_not_proven:${convexRollbackError ?? "unknown failure"}`,
          },
          result: convexRestored ? "rolled_back" : "recovery_required",
          rollbackOrder: [],
          trafficMutated: false,
        };
      }
      return {
        ...receiptBase(
          options,
          now,
          proofEvidence,
          proofSha256,
          providerProofEvidence,
          providerProofSha256,
        ),
        convexCandidateRemainsLive: convexCandidateState,
        error: errorMessage(error),
        event: "production_release_failure_receipt",
        failedStage,
        promotionAllowed: false,
        result: "failed",
        trafficMutated: false,
      };
    }

    const reconciliation: Record<string, string> = {};
    const current = new Map<
      VercelProductionApplication,
      "candidate" | "predecessor" | "unexpected"
    >();
    let recoveryRequired = false;
    for (const staged of stagedApplications) {
      const evidenceKey = `reconcile-${staged.application}`;
      try {
        const reconciliationInspection =
          await options.dependencies.inspectApplication(staged.application, staged);
        recordEvidence(
          providerProofEvidence,
          providerProofSha256,
          evidenceKey,
          reconciliationInspection.raw,
        );
        const inspected = validateProductionApplicationInspection(
          reconciliationInspection,
          staged.application,
          staged,
          releaseTargets!.teamId,
          requireProductionTarget(releaseTargets!, staged.application),
        );
        const state =
          inspected.current.deploymentId === staged.deploymentId
            ? "candidate"
            : inspected.current.deploymentId === staged.predecessorDeploymentId
              ? "predecessor"
              : "unexpected";
        if (inspected.current.healthy !== true) {
          recoveryRequired = true;
          reconciliation[staged.application] = `${state}_unhealthy`;
        } else {
          reconciliation[staged.application] = state;
        }
        if (state === "unexpected") recoveryRequired = true;
        current.set(staged.application, state);
      } catch (reconciliationError) {
        recordEvidenceError(
          providerProofEvidence,
          providerProofSha256,
          evidenceKey,
          reconciliationError,
        );
        recoveryRequired = true;
        reconciliation[staged.application] = `readback_failed:${errorMessage(reconciliationError)}`;
        current.set(staged.application, "unexpected");
      }
    }

    const rollbackOrder: VercelProductionApplication[] = [];
    for (const staged of [...stagedApplications].reverse()) {
      if (current.get(staged.application) !== "candidate") continue;
      rollbackOrder.push(staged.application);
      const rollbackKey = `rollback-${staged.application}`;
      try {
        const rollback = await options.dependencies.rollbackApplication(
          staged.application,
          staged.predecessorDeploymentId,
        );
        recordEvidence(
          providerProofEvidence,
          providerProofSha256,
          rollbackKey,
          rollback.raw,
        );
        parseEvidence(rollback, `${staged.application} rollback`);
      } catch (rollbackError) {
        recordEvidenceError(
          providerProofEvidence,
          providerProofSha256,
          rollbackKey,
          rollbackError,
        );
        reconciliation[staged.application] = `rollback_command_failed:${errorMessage(rollbackError)}`;
      }
      const readbackKey = `rollback-readback-${staged.application}`;
      try {
        const rollbackInspection =
          await options.dependencies.inspectApplication(staged.application, staged);
        recordEvidence(
          providerProofEvidence,
          providerProofSha256,
          readbackKey,
          rollbackInspection.raw,
        );
        const inspected = validateProductionApplicationInspection(
          rollbackInspection,
          staged.application,
          staged,
          releaseTargets!.teamId,
          requireProductionTarget(releaseTargets!, staged.application),
        );
        if (
          inspected.current.deploymentId === staged.predecessorDeploymentId &&
          inspected.current.healthy === true
        ) {
          current.set(staged.application, "predecessor");
          reconciliation[staged.application] = "predecessor_healthy";
        } else {
          recoveryRequired = true;
          reconciliation[staged.application] = "rollback_not_proven";
        }
      } catch (rollbackReadbackError) {
        recordEvidenceError(
          providerProofEvidence,
          providerProofSha256,
          readbackKey,
          rollbackReadbackError,
        );
        recoveryRequired = true;
        reconciliation[staged.application] = `rollback_readback_failed:${errorMessage(rollbackReadbackError)}`;
      }
    }

    for (const staged of stagedApplications) {
      const finalReadbackKey = `rollback-final-${staged.application}`;
      try {
        const finalRollbackInspection =
          await options.dependencies.inspectApplication(staged.application, staged);
        recordEvidence(
          providerProofEvidence,
          providerProofSha256,
          finalReadbackKey,
          finalRollbackInspection.raw,
        );
        const inspected = validateProductionApplicationInspection(
          finalRollbackInspection,
          staged.application,
          staged,
          releaseTargets!.teamId,
          requireProductionTarget(releaseTargets!, staged.application),
        );
        if (
          inspected.current.deploymentId === staged.predecessorDeploymentId &&
          inspected.current.healthy === true
        ) {
          current.set(staged.application, "predecessor");
          reconciliation[staged.application] = "predecessor_healthy_final";
        } else {
          recoveryRequired = true;
          reconciliation[staged.application] = "final_predecessor_not_proven";
        }
      } catch (finalReadbackError) {
        recordEvidenceError(
          providerProofEvidence,
          providerProofSha256,
          finalReadbackKey,
          finalReadbackError,
        );
        recoveryRequired = true;
        reconciliation[staged.application] = `final_readback_failed:${errorMessage(finalReadbackError)}`;
      }
    }

    if (
      [...current.values()].some((state) => state !== "predecessor")
    ) {
      recoveryRequired = true;
    }
    const convexRestored = await restoreKnownGoodConvex();
    reconciliation.convex = convexRestored
      ? "known_good_proven"
      : `rollback_not_proven:${convexRollbackError ?? "unknown failure"}`;
    if (!convexRestored) recoveryRequired = true;
    return {
      ...receiptBase(
        options,
        now,
        proofEvidence,
        proofSha256,
        providerProofEvidence,
        providerProofSha256,
      ),
      convexCandidateRemainsLive: convexCandidateState,
      error: errorMessage(error),
      event: recoveryRequired
        ? "production_release_recovery_required_receipt"
        : "production_release_rollback_receipt",
      failedStage,
      promotionAllowed: false,
      reconciliation,
      result: recoveryRequired ? "recovery_required" : "rolled_back",
      rollbackOrder,
      trafficMutated: true,
    };
  }
}

function canonicalizePotentialPath(value: string) {
  let ancestor = path.resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(realpathSync(ancestor), ...missing);
}

function requireExternalPath(value: string, repositoryRoot: string) {
  const root = realpathSync(repositoryRoot);
  const candidate = canonicalizePotentialPath(value);
  const relative = path.relative(root, candidate);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("production receipt must remain outside the repository");
  }
  return candidate;
}

function exactKeys(record: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  return (
    actual.length === wanted.length &&
    actual.every((key, index) => key === wanted[index])
  );
}

function hasKeys(record: Record<string, unknown>, required: readonly string[]) {
  return required.every((key) => record[key] !== undefined);
}

function evidenceHashesMatch(
  evidence: unknown,
  hashes: unknown,
  requireNonEmpty: boolean,
) {
  if (!isRecord(evidence) || !isRecord(hashes)) return false;
  const evidenceKeys = Object.keys(evidence).sort();
  const hashKeys = Object.keys(hashes).sort();
  if (
    (requireNonEmpty && evidenceKeys.length === 0) ||
    evidenceKeys.length !== hashKeys.length ||
    evidenceKeys.some((key, index) => key !== hashKeys[index])
  ) {
    return false;
  }
  return evidenceKeys.every((key) => {
    const raw = evidence[key];
    const hash = hashes[key];
    return (
      typeof raw === "string" &&
      raw.trim().length > 0 &&
      typeof hash === "string" &&
      SHA256.test(hash) &&
      sha256(raw) === hash
    );
  });
}

function providerProofKeyIsAllowed(key: string) {
  const application = APPLICATIONS.find((candidate) =>
    key.endsWith(`-${candidate}`),
  );
  if (!application) return false;
  return PROVIDER_PROOF_STAGES.has(
    key.slice(0, -(application.length + 1)),
  );
}

function hasAllProviderStages(
  record: Record<string, unknown>,
  stage: string,
) {
  return APPLICATIONS.every(
    (application) => record[`${stage}-${application}`] !== undefined,
  );
}

function readReceiptConvexClassification(
  receipt: ProductionReleaseReceipt,
  proofEvidence: Record<string, unknown>,
) {
  const raw = proofEvidence.convexClassification;
  if (typeof raw !== "string") return undefined;
  try {
    return readConvexChangeClassification(JSON.parse(raw) as unknown, {
      baseSha: receipt.knownGoodSha,
      candidateSha: receipt.approvedSha,
    });
  } catch {
    return undefined;
  }
}

function receiptHasPassingConvexRollback(
  receipt: ProductionReleaseReceipt,
  proofEvidence: Record<string, unknown>,
) {
  const configurationRaw = proofEvidence.configuration;
  const knownGoodRaw = proofEvidence.knownGoodConvex;
  const rollbackRaw = proofEvidence.convexRollback;
  if (
    typeof configurationRaw !== "string" ||
    typeof knownGoodRaw !== "string" ||
    typeof rollbackRaw !== "string"
  ) {
    return false;
  }
  try {
    const configuration = requiredRecord(
      JSON.parse(configurationRaw) as unknown,
      "production release receipt configuration",
    );
    const targets = requiredRecord(
      configuration.productionTargets,
      "production release receipt targets",
    );
    const convexTarget = requiredRecord(
      targets.convexProduction,
      "production release receipt Convex target",
    );
    if (
      typeof convexTarget.deploymentName !== "string" ||
      typeof convexTarget.deploymentUrl !== "string"
    ) {
      return false;
    }
    readPassingConvexProductionForcedRollbackReceipt(
      JSON.parse(rollbackRaw) as unknown,
      {
        ...(receipt.anchorMode === "genesis"
          ? {
              approvalReceiptSha256:
                receipt.proofSha256.githubApprovalReceipt,
            }
          : {}),
        candidateSha: receipt.approvedSha,
        knownGoodReceiptSha256: sha256(knownGoodRaw),
        knownGoodSha: receipt.knownGoodSha,
        target: {
          deploymentName: convexTarget.deploymentName,
          deploymentUrl: convexTarget.deploymentUrl,
        },
      },
    );
    return true;
  } catch {
    return false;
  }
}

function receiptHasPassingCandidateRollback(
  receipt: ProductionReleaseReceipt,
  proofEvidence: Record<string, unknown>,
) {
  const configurationRaw = proofEvidence.configuration;
  const knownGoodRaw = proofEvidence.knownGoodConvex;
  const candidateRaw = proofEvidence.convex;
  if (
    typeof configurationRaw !== "string" ||
    typeof knownGoodRaw !== "string" ||
    typeof candidateRaw !== "string"
  ) {
    return false;
  }
  try {
    const configuration = requiredRecord(
      JSON.parse(configurationRaw) as unknown,
      "production release receipt configuration",
    );
    const targets = requiredRecord(
      configuration.productionTargets,
      "production release receipt targets",
    );
    const convexTarget = requiredRecord(
      targets.convexProduction,
      "production release receipt Convex target",
    );
    if (
      typeof convexTarget.deploymentName !== "string" ||
      typeof convexTarget.deploymentUrl !== "string"
    ) {
      return false;
    }
    readPassingConvexProductionCandidateRollbackReceipt(
      JSON.parse(candidateRaw) as unknown,
      {
        candidateSha: receipt.approvedSha,
        knownGoodReceiptSha256: sha256(knownGoodRaw),
        knownGoodSha: receipt.knownGoodSha,
        target: {
          deploymentName: convexTarget.deploymentName,
          deploymentUrl: convexTarget.deploymentUrl,
        },
      },
    );
    return true;
  } catch {
    return false;
  }
}

function requireCompleteReceipt(receipt: ProductionReleaseReceipt) {
  const checkedAtIsIso = (() => {
    try {
      return new Date(receipt.checkedAt).toISOString() === receipt.checkedAt;
    } catch {
      return false;
    }
  })();
  const proofEvidence = isRecord(receipt.proofEvidence)
    ? receipt.proofEvidence
    : {};
  const providerProofEvidence = isRecord(receipt.providerProofEvidence)
    ? receipt.providerProofEvidence
    : {};
  const proofHashesValid = evidenceHashesMatch(
    receipt.proofEvidence,
    receipt.proofSha256,
    true,
  );
  const providerHashesValid = evidenceHashesMatch(
    receipt.providerProofEvidence,
    receipt.providerProofSha256,
    false,
  );
  const proofKeysAllowed = Object.keys(proofEvidence).every((key) =>
    PROOF_KEYS.has(key),
  );
  const providerProofKeysAllowed = Object.keys(providerProofEvidence).every(
    providerProofKeyIsAllowed,
  );
  const applicationsValid =
    Array.isArray(receipt.productionApplications) &&
    receipt.productionApplications.length === APPLICATIONS.length &&
    receipt.productionApplications.every(
      (application, index) => application === APPLICATIONS[index],
    );
  const hasFailure =
    typeof receipt.error === "string" &&
    receipt.error.trim().length > 0 &&
    typeof receipt.failedStage === "string" &&
    receipt.failedStage.trim().length > 0;
  const hasReconciliation =
    isRecord(receipt.reconciliation) &&
    Object.keys(receipt.reconciliation).length > 0 &&
    Object.values(receipt.reconciliation).every(
      (state) => typeof state === "string" && state.trim().length > 0,
    );
  const applicationReconciliation =
    isRecord(receipt.reconciliation) &&
    exactKeys(receipt.reconciliation, [...APPLICATIONS, "convex"]);
  const convexReconciliation =
    isRecord(receipt.reconciliation) &&
    exactKeys(receipt.reconciliation, ["convex"]);
  const controllerReconciliation =
    isRecord(receipt.reconciliation) &&
    (exactKeys(receipt.reconciliation, ["controller"]) ||
      exactKeys(receipt.reconciliation, ["controller", "convex"]));
  const rollbackOrderValid =
    Array.isArray(receipt.rollbackOrder) &&
    new Set(receipt.rollbackOrder).size === receipt.rollbackOrder.length &&
    receipt.rollbackOrder.every((application) =>
      APPLICATIONS.includes(application),
    );
  const classification = readReceiptConvexClassification(
    receipt,
    proofEvidence,
  );
  const conditionalDataProtectionKey = classification?.requiresBackup
    ? ["convexDataProtection"]
    : [];
  const conditionalDataProtectionProofValid =
    classification !== undefined &&
    (proofEvidence.convexDataProtection !== undefined) ===
      classification.requiresBackup;
  const completeProofKeys = [
    ...COMPLETE_PROOF_KEYS,
    ...conditionalDataProtectionKey,
    ...(receipt.anchorMode === "genesis" ? ["githubApprovalReceipt"] : []),
  ];
  const completeProof =
    conditionalDataProtectionProofValid &&
    exactKeys(proofEvidence, completeProofKeys);
  const completeProviderProof = exactKeys(
    providerProofEvidence,
    COMPLETE_PROVIDER_PROOF_KEYS,
  );
  const convexMutationProof =
    conditionalDataProtectionProofValid &&
    hasKeys(proofEvidence, [
      "configuration",
      "repository-initial",
      "stamp",
      "exact",
      "delivery",
      "github",
      "knownGoodConvex",
      "convexClassification",
      "vercelStage",
      "isolatedProofEnvironment",
      "productionProofBinding",
      "repository-after-stage",
      "convex",
      "durableProofCollection",
      ...conditionalDataProtectionKey,
    ]);
  const convexRollbackPrerequisites =
    conditionalDataProtectionProofValid &&
    hasKeys(proofEvidence, [
      "configuration",
      "repository-initial",
      "stamp",
      "exact",
      "delivery",
      "github",
      "knownGoodConvex",
      "convexClassification",
      "vercelStage",
      "isolatedProofEnvironment",
      "productionProofBinding",
      "repository-after-stage",
      "durableProofCollection",
      ...conditionalDataProtectionKey,
    ]) &&
    hasAllProviderStages(providerProofEvidence, "pre-convex");
  const convexRollbackAttempted =
    proofEvidence.convexRollback !== undefined;
  const convexRollbackProven = receiptHasPassingConvexRollback(
    receipt,
    proofEvidence,
  );
  const candidateRollbackProven = receiptHasPassingCandidateRollback(
    receipt,
    proofEvidence,
  );
  const prePromotionProviderProof =
    hasAllProviderStages(providerProofEvidence, "pre-convex") &&
    hasAllProviderStages(providerProofEvidence, "pre");
  const promotionGateProof =
    convexMutationProof &&
    hasKeys(proofEvidence, ["r0CustomerJourney", "r0Operational"]) &&
    prePromotionProviderProof &&
    hasAllProviderStages(providerProofEvidence, "proof-ready");
  const standardFinalRollbackProof = hasAllProviderStages(
    providerProofEvidence,
    "rollback-final",
  );
  const emergencyFinalRollbackProof = hasAllProviderStages(
    providerProofEvidence,
    "emergency-rollback-final",
  );
  const rollbackActionsProven =
    rollbackOrderValid &&
    receipt.rollbackOrder!.every(
      (application) =>
        (providerProofEvidence[`rollback-${application}`] !== undefined &&
          providerProofEvidence[`rollback-readback-${application}`] !==
            undefined) ||
        (providerProofEvidence[`emergency-rollback-${application}`] !==
          undefined &&
          providerProofEvidence[
            `emergency-rollback-readback-${application}`
          ] !== undefined),
    );
  const applicationRollbackProof =
    applicationReconciliation &&
    (standardFinalRollbackProof || emergencyFinalRollbackProof) &&
    rollbackActionsProven;
  const stateValid =
    (receipt.event === "production_release_complete_receipt" &&
      receipt.result === "passed" &&
      receipt.promotionAllowed === true &&
      receipt.trafficMutated === true &&
      receipt.convexCandidateRemainsLive === true &&
      receipt.error === undefined &&
      receipt.failedStage === undefined &&
      receipt.reconciliation === undefined &&
      receipt.rollbackOrder === undefined &&
      completeProof &&
      completeProviderProof) ||
    (receipt.event === "production_release_failure_receipt" &&
      receipt.result === "failed" &&
      receipt.promotionAllowed === false &&
      receipt.trafficMutated === false &&
      hasFailure &&
      receipt.reconciliation === undefined &&
      receipt.rollbackOrder === undefined &&
      receipt.convexCandidateRemainsLive === false &&
      !convexRollbackAttempted &&
      (proofEvidence.convex === undefined || candidateRollbackProven)) ||
    (receipt.event === "production_release_rollback_receipt" &&
      receipt.result === "rolled_back" &&
      receipt.promotionAllowed === false &&
      receipt.convexCandidateRemainsLive === false &&
      hasFailure &&
      hasReconciliation &&
      convexRollbackProven &&
      rollbackOrderValid &&
      (receipt.trafficMutated
        ? promotionGateProof && applicationRollbackProof
        : convexRollbackPrerequisites &&
          convexReconciliation &&
          receipt.rollbackOrder!.length === 0)) ||
    (receipt.event === "production_release_recovery_required_receipt" &&
      receipt.result === "recovery_required" &&
      receipt.promotionAllowed === false &&
      hasFailure &&
      hasReconciliation &&
      rollbackOrderValid &&
      convexRollbackAttempted &&
      (convexRollbackProven
        ? receipt.convexCandidateRemainsLive === false
        : receipt.convexCandidateRemainsLive === true ||
          receipt.convexCandidateRemainsLive === "unknown") &&
      (receipt.trafficMutated
        ? promotionGateProof &&
          (applicationRollbackProof || controllerReconciliation)
        : convexRollbackPrerequisites &&
          receipt.rollbackOrder!.length === 0 &&
          (convexReconciliation || controllerReconciliation)));
  if (
    receipt.schemaVersion !== 1 ||
    !["genesis", "normal"].includes(receipt.anchorMode) ||
    !FULL_GIT_COMMIT_SHA.test(receipt.approvedSha) ||
    !FULL_GIT_COMMIT_SHA.test(receipt.knownGoodSha) ||
    receipt.approvedSha === receipt.knownGoodSha ||
    !checkedAtIsIso ||
    !applicationsValid ||
    !proofHashesValid ||
    !providerHashesValid ||
    !proofKeysAllowed ||
    !providerProofKeysAllowed ||
    !stateValid ||
    (receipt.anchorMode === "normal" &&
      (receipt.proofSha256.githubApprovalReceipt !== undefined ||
        receipt.proofSha256.githubBootstrapRoute !== undefined)) ||
    (receipt.anchorMode === "genesis" &&
      receipt.result === "passed" &&
      (!SHA256.test(receipt.proofSha256.githubApprovalReceipt ?? "") ||
        !SHA256.test(receipt.proofSha256.githubBootstrapRoute ?? "")))
  ) {
    throw new Error("production release receipt is incomplete");
  }
  return receipt;
}

export async function writeProductionReleaseReceipt(
  outputPath: string,
  receipt: ProductionReleaseReceipt,
  repositoryRoot: string,
) {
  requireCompleteReceipt(receipt);
  const destination = requireExternalPath(outputPath, repositoryRoot);
  const directory = path.dirname(destination);
  await mkdir(directory, { mode: 0o700, recursive: true });
  const temporary = path.join(
    directory,
    `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    await link(temporary, destination);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(`production receipt already exists: ${destination}`);
    }
    throw error;
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
  return destination;
}

type ProductionReleaseSignal = "SIGHUP" | "SIGINT" | "SIGTERM";

export function createProductionReleaseSignalHandler(
  signal: ProductionReleaseSignal,
  recover: () => Promise<void>,
  terminate: (exitCode: number) => void = (exitCode) => process.exit(exitCode),
) {
  const exitCodes: Record<ProductionReleaseSignal, number> = {
    SIGHUP: 129,
    SIGINT: 130,
    SIGTERM: 143,
  };
  let handling: Promise<void> | undefined;
  return () => {
    handling ??= (async () => {
      try {
        await recover();
      } finally {
        terminate(exitCodes[signal]);
      }
    })();
    return handling;
  };
}
