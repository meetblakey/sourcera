import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createProductionReleaseSignalHandler,
  executeProductionRelease,
  readProductionReleaseConfig,
  validateProductionBootstrapRouteProof,
  validateProductionGithubApprovalEvidence,
  validateProductionVercelBaselineProvenance,
  writeProductionReleaseReceipt,
  type ProductionApplicationInspection,
  type ProductionReleaseDependencies,
  type ProductionReleaseReceipt,
} from "../../scripts/lib/production-release-controller";
import { createConvexProductionGenesisReceipt } from "../../scripts/lib/convex-production-bootstrap";
import { createConvexProductionForcedRollbackReceipt } from "../../scripts/lib/convex-production-deployment";
import {
  hashConvexChangeClassification,
  type ConvexChangeClassification,
  type ProductionProofBinding,
} from "../../scripts/lib/production-proof-contracts";
import {
  assertProductionMutationCredentialBoundary,
  createProductionReleaseLaneEnvironment,
  createProductionHealthProbeArguments,
  createGithubRunAttemptEndpoint,
  createSignalResponsiveCommandRunner,
  createVercelPromotionArguments,
  readProductionReleaseArguments,
  resolveSpecLintTsx,
} from "../../scripts/release-production";
import {
  readProductionBlockedArguments,
  writeProductionBlockedReceipt,
} from "../../scripts/production-release-blocked";
import { readProductionExpiredAnchorIdentity } from "../../scripts/production-release-github";
import {
  assertProductionNoAuthorityCredentialBoundary,
  writeProductionNoAuthorityReceipt,
} from "../../scripts/production-release-no-authority";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const knownGoodSha = "fedcba9876543210fedcba9876543210fedcba98";
const repositoryRoot = "/repo";
const applications = ["marketplace", "buyer", "seller"] as const;
const normalAuthorityWorkflowContent =
  "name: Approved normal production authority workflow\n";
const convexAnchorWorkflowContent =
  "name: Approved Convex anchor authority workflow\n";
const vercelBaselineWorkflowContent =
  "name: Approved Vercel baseline workflow\n";
const authorityWorkflowLineage = [
  {
    authorityKind: "normal" as const,
    path: ".github/workflows/production-release.yml",
    workflowSha256: sha256(normalAuthorityWorkflowContent),
  },
  {
    authorityKind: "convex_anchor" as const,
    path: ".github/workflows/production-bootstrap-recovery.yml",
    workflowSha256: sha256(convexAnchorWorkflowContent),
  },
  {
    authorityKind: "vercel_baseline" as const,
    path: ".github/workflows/vercel-production-baseline.yml",
    workflowSha256: sha256(vercelBaselineWorkflowContent),
  },
] as const;

function bootstrapRouteProof(options: {
  expired?: boolean;
  failedBootstrapAuthority?: boolean;
  includeBootstrap?: boolean;
  includeNormal?: boolean;
  latestNormalFailedRerun?: boolean;
  newerBootstrap?: boolean;
  omitAuthorityArtifact?: boolean;
  route: "expired_anchor" | "initial_genesis";
} = { route: "initial_genesis" }) {
  const normalRun = {
    conclusion: options.latestNormalFailedRerun ? "failure" : "success",
    created_at: "2026-07-13T10:00:00.000Z",
    event: "workflow_dispatch",
    head_branch: "main",
    head_sha: knownGoodSha,
    id: 7000,
    path: ".github/workflows/production-release.yml",
    run_attempt: options.latestNormalFailedRerun ? 2 : 1,
    status: "completed",
  };
  const bootstrapRun = {
    ...normalRun,
    conclusion: options.failedBootstrapAuthority ? "failure" : "success",
    created_at: options.newerBootstrap
      ? "2026-07-14T10:00:00.000Z"
      : "2026-07-12T10:00:00.000Z",
    id: 7001,
    path: ".github/workflows/production-bootstrap-recovery.yml",
    run_attempt: 1,
  };
  const runs = [
    ...(options.includeNormal ? [normalRun] : []),
    ...(options.includeBootstrap ? [bootstrapRun] : []),
  ];
  const attemptsFor = (run: typeof normalRun) =>
    run.id === 7000 && options.latestNormalFailedRerun
      ? [
          { ...run, conclusion: "success", run_attempt: 1 },
          { ...run, conclusion: "failure", run_attempt: 2 },
        ]
      : [run];
  const artifactFor = (run: typeof normalRun) => ({
    created_at: run.created_at,
    digest: `sha256:${run.id === 7000 ? "a" : "b".repeat(64)}`,
    expired: options.expired ?? true,
    id: run.id + 9000,
    name:
      run.id === 7001
        ? `production-anchor-authority-${knownGoodSha}-${run.id}-${run.run_attempt}`
        : `production-release-${run.head_sha}-${run.id}-${run.id === 7000 && options.latestNormalFailedRerun ? 1 : run.run_attempt}`,
    workflow_run: {
      head_branch: "main",
      head_sha: run.head_sha,
      id: run.id,
    },
  });
  // Keep fixture digests exact while making each authority distinguishable.
  const artifactPages = runs.map((run) => {
    const artifact = artifactFor(run);
    artifact.digest = `sha256:${run.id === 7000 ? "a".repeat(64) : "b".repeat(64)}`;
    return {
      pages: [
        {
          artifacts: options.omitAuthorityArtifact ? [] : [artifact],
          total_count: options.omitAuthorityArtifact ? 0 : 1,
        },
      ],
      runId: run.id,
      workflowPath: run.path,
    };
  });
  const workflowRunAttempts = runs.map((run) => ({
    attempts: attemptsFor(run),
    runId: run.id,
    workflowPath: run.path,
  }));
  const workflowRunAttemptJobPages = workflowRunAttempts.flatMap((entry) =>
    entry.attempts.map((attempt) => {
      const jobs =
        entry.runId === 7001
          ? [
              {
                conclusion: "success",
                head_sha: attempt.head_sha,
                name: "convex-anchor",
                run_attempt: attempt.run_attempt,
                run_id: attempt.id,
                status: "completed",
              },
            ]
          : [];
      return {
        pages: [{ jobs, total_count: jobs.length }],
        runAttempt: attempt.run_attempt,
        runId: entry.runId,
        workflowPath: entry.workflowPath,
      };
    }),
  );
  const retainedArtifacts = artifactPages.flatMap(
    (entry) => entry.pages[0]!.artifacts,
  );
  const repositoryArtifactPages = [
    { artifacts: retainedArtifacts, total_count: retainedArtifacts.length },
  ];
  const authorityArtifactHistories = retainedArtifacts.map((artifact) => {
    const nameMatch = artifact.name.match(/-(\d+)-(\d+)$/)!;
    const runId = Number(nameMatch[1]);
    const runAttempt = Number(nameMatch[2]);
    const run = runs.find((entry) => entry.id === runId)!;
    const attempt = attemptsFor(run).find(
      (entry) => entry.run_attempt === runAttempt,
    )!;
    const jobs = workflowRunAttemptJobPages.find(
      (entry) =>
        entry.runId === runId && entry.runAttempt === runAttempt,
    )!.pages;
    return {
      artifactId: artifact.id,
      jobPages: jobs,
      run: attempt,
      runAttempt,
      runId,
      workflowSource: {
        content: artifact.name.startsWith("production-release-")
          ? normalAuthorityWorkflowContent
          : convexAnchorWorkflowContent,
        path: attempt.path,
        ref: attempt.head_sha,
        sha256: sha256(
          artifact.name.startsWith("production-release-")
            ? normalAuthorityWorkflowContent
            : convexAnchorWorkflowContent,
        ),
      },
    };
  });
  const workflowRunPages = [
    {
      pages: [
        {
          total_count: options.includeNormal ? 1 : 0,
          workflow_runs: options.includeNormal ? [normalRun] : [],
        },
      ],
      workflowPath: normalRun.path,
    },
    {
      pages: [
        {
          total_count: options.includeBootstrap ? 1 : 0,
          workflow_runs: options.includeBootstrap ? [bootstrapRun] : [],
        },
      ],
      workflowPath: bootstrapRun.path,
    },
  ];
  const inventory = {
    artifactPages,
    authorityArtifactHistories,
    repositoryArtifactPages,
    workflowRunAttemptJobPages,
    workflowRunAttempts,
    workflowRunPages,
  };
  const selectedRun = runs
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
  const selectedArtifact = selectedRun ? artifactFor(selectedRun) : undefined;
  if (selectedArtifact) {
    selectedArtifact.digest = `sha256:${selectedRun.id === 7000 ? "a".repeat(64) : "b".repeat(64)}`;
  }
  return {
    authorityPromotionAllowed: false,
    decision: "DEC-PROD-002",
    event: "production_bootstrap_route_proof",
    historyDecision: "DEC-PROD-005",
    historyScope: "github_retained_artifacts",
    inventory,
    inventorySha256: sha256(JSON.stringify(inventory)),
    reasonSha256: "c".repeat(64),
    route: options.route,
    schemaVersion: 1,
    selectedAnchor:
      options.route === "expired_anchor" && selectedRun && selectedArtifact
        ? {
            artifactDigest: selectedArtifact.digest,
            artifactId: selectedArtifact.id,
            artifactName: selectedArtifact.name,
            expired: true as const,
            runAttempt: selectedRun.run_attempt,
            runId: selectedRun.id,
            sha: selectedRun.head_sha,
            workflowPath: selectedRun.path,
          }
        : null,
  };
}

type ProofGateDependencies = ProductionReleaseDependencies & {
  classifyConvexChanges(): ReturnType<typeof jsonEvidence>;
  verifyConvexDataProtection(
    binding: ProductionProofBinding,
    classification: ConvexChangeClassification,
  ): ReturnType<typeof jsonEvidence>;
  verifyDurableProofCollection(
    binding: ProductionProofBinding,
    customerProofRaw: string,
    operationalProofRaw: string,
  ): ReturnType<typeof jsonEvidence>;
  verifyR0CustomerJourney(
    binding: ProductionProofBinding,
  ): ReturnType<typeof jsonEvidence>;
  verifyR0Operational(
    binding: ProductionProofBinding,
  ): ReturnType<typeof jsonEvidence>;
};

const targets = {
  convexProduction: {
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
  },
  vercelProduction: {
    teamId: "team_6nIbCLwuaHPTHviqgckfTiyn",
    targets: [
      {
        allowedProductionEnvironmentKeys: [],
        application: "marketplace",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "sourcera.example",
        productionDomains: ["sourcera.example"],
        projectId: "prj_FIBSOffJX8GtY8JHTSXKixfVryBp",
        projectName: "sourcera",
        rootDirectory: null,
        sourceFilesOutsideRootDirectory: true,
      },
      {
        allowedProductionEnvironmentKeys: [],
        application: "buyer",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "buyer.sourcera.example",
        productionDomains: ["buyer.sourcera.example"],
        projectId: "prj_ZbZgRUXjPzgv6Oqepe13W6yV2AyN",
        projectName: "sourcera-buyer",
        rootDirectory: "apps/buyer",
        sourceFilesOutsideRootDirectory: true,
      },
      {
        allowedProductionEnvironmentKeys: [],
        application: "seller",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "seller.sourcera.example",
        productionDomains: ["seller.sourcera.example"],
        projectId: "prj_Vd0Roi2q0XPkphCrn8rtoNxI1DkS",
        projectName: "sourcera-seller",
        rootDirectory: "apps/seller",
        sourceFilesOutsideRootDirectory: true,
      },
    ],
  },
};

const isolatedCandidateConvex = {
  deploymentName: "isolated-otter-456",
  deploymentUrl: "https://isolated-otter-456.convex.cloud",
};

const releaseConfig = {
  schemaVersion: 1,
  repository: {
    branch: "main",
    name: "sourcera",
    owner: "meetblakey",
  },
  github: {
    actionsAppId: 15368,
    approver: { id: 15627406, login: "meetblakey" },
    authorityWorkflowLineage: [...authorityWorkflowLineage],
    baselineWorkflow: ".github/workflows/vercel-production-baseline.yml",
    bootstrapWorkflow: ".github/workflows/production-bootstrap-recovery.yml",
    environment: "sourcera-production-release",
    requiredChecks: [
      { name: "verify", workflow: ".github/workflows/app-ci.yml" },
      { name: "convex-preview", workflow: ".github/workflows/app-ci.yml" },
      {
        name: "delivery-integrity",
        workflow: ".github/workflows/delivery-integrity.yml",
      },
      {
        name: "linear-drift",
        workflow: ".github/workflows/delivery-integrity.yml",
      },
      {
        name: "no-legacy-drift",
        workflow: ".github/workflows/repo-hygiene.yml",
      },
      {
        name: "Spec-Lint (§M.4 CI gate cluster)",
        workflow: ".github/workflows/spec-lint.yml",
      },
    ],
    collaborators: [{ id: 15627406, login: "meetblakey" }],
    rulesets: [],
    workflow: ".github/workflows/production-release.yml",
  },
  proofCollection: {
    coordinator: {
      projectId: "prj_release_control",
      workflowName: "sourcera-production-proof",
    },
    decision: "DEC-PROD-002",
    isolatedCandidateConvex,
    mode: "durable",
  },
  tooling: { vercelCli: "56.2.0" },
};

function jsonEvidence(value: unknown, exitCode = 0) {
  return { exitCode, raw: `${JSON.stringify(value)}\n`, value };
}

function stageReceipt() {
  return {
    applications: applications.map((application) => {
      const target = targets.vercelProduction.targets.find(
        (candidate) => candidate.application === application,
      )!;
      return {
        application,
        createdAt: "2026-07-15T17:00:00.000Z",
        deploymentId: `dpl_${application}_candidate`,
        health: {
          checkedAt: "2026-07-15T17:00:01.000Z",
          commitSha: approvedSha,
          domain: application,
          environment: "production",
          service: "sourcera",
          status: "ok",
        },
        predecessorDeploymentId: `dpl_${application}_previous`,
        predecessorProviderGitSha: "f".repeat(40),
        predecessorUrl: `https://${application}-previous.vercel.app`,
        productionDomain: target.productionDomain,
        productionDomains: target.productionDomains,
        projectId: target.projectId,
        projectName: target.projectName,
        providerGitSha: approvedSha,
        rootDirectory: target.rootDirectory,
        state: "READY",
        substate: "STAGED",
        target: "production",
        url: `https://${application}-candidate.vercel.app`,
      };
    }),
    approvedSha,
    completedAt: "2026-07-15T17:00:02.000Z",
    convexTarget: targets.convexProduction,
    event: "vercel_production_stage_receipt",
    releaseRunId: "019f6540-4c8c-7f1e-a014-cbc8f189b912",
    schemaVersion: 1,
    startedAt: "2026-07-15T17:00:00.000Z",
    teamId: targets.vercelProduction.teamId,
  };
}

function convexReceipt() {
  const assertion = (
    name: "reactive-observation-p95" | "reactive-observation-p99",
    observationLatencyMs: number,
  ) => ({
    assertion: name,
    commitSha: approvedSha,
    deployment: targets.convexProduction.deploymentName,
    environment: "production",
    observationLatencyMs,
    result: "passed" as const,
  });
  const canary = {
    assertions: [
      assertion("reactive-observation-p95", 100),
      assertion("reactive-observation-p99", 200),
    ],
    outcome: "passed" as const,
    runtimeIdentity: {
      buildCommitSha: approvedSha,
      deploymentName: targets.convexProduction.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true as const,
  };
  const rollbackCanary = {
    ...canary,
    assertions: canary.assertions.map((entry) => ({
      ...entry,
      commitSha: knownGoodSha,
    })),
    runtimeIdentity: {
      ...canary.runtimeIdentity,
      buildCommitSha: knownGoodSha,
    },
  };
  return {
    approvedSha,
    canary,
    checkedAt: "2026-07-15T17:01:00.000Z",
    event: "convex_production_deployment_receipt",
    knownGoodReceiptSha256: "a".repeat(64),
    knownGoodSha,
    result: "passed",
    rollbackAnchor: {
      canary: rollbackCanary,
      knownGoodSha,
      result: "passed",
    },
    schemaVersion: 1,
    target: targets.convexProduction,
  };
}

function knownGoodConvexReceipt() {
  const receipt = structuredClone(convexReceipt());
  receipt.approvedSha = knownGoodSha;
  receipt.knownGoodSha = "e".repeat(40);
  receipt.canary.runtimeIdentity.buildCommitSha = knownGoodSha;
  for (const assertion of receipt.canary.assertions) {
    assertion.commitSha = knownGoodSha;
  }
  receipt.rollbackAnchor.knownGoodSha = receipt.knownGoodSha;
  receipt.rollbackAnchor.canary.runtimeIdentity.buildCommitSha =
    receipt.knownGoodSha;
  for (const assertion of receipt.rollbackAnchor.canary.assertions) {
    assertion.commitSha = receipt.knownGoodSha;
  }
  return receipt;
}

function passingCandidateConvexReceipt() {
  const receipt = convexReceipt();
  receipt.knownGoodReceiptSha256 = sha256(
    jsonEvidence(knownGoodConvexReceipt()).raw,
  );
  return receipt;
}

function forcedRollbackReceipt(options: {
  approvalReceiptSha256?: string;
  knownGoodReceiptRaw?: string;
} = {}) {
  const knownGoodReceiptRaw =
    options.knownGoodReceiptRaw ?? jsonEvidence(knownGoodConvexReceipt()).raw;
  return createConvexProductionForcedRollbackReceipt({
    ...(options.approvalReceiptSha256
      ? {
          approvalReceiptSha256: options.approvalReceiptSha256,
          knownGoodReceiptKind: "genesis" as const,
        }
      : {}),
    candidateSha: approvedSha,
    canary: convexReceipt().rollbackAnchor.canary,
    checkedAt: "2026-07-15T17:11:00.000Z",
    interruptedBy: null,
    knownGoodReceiptSha256: sha256(knownGoodReceiptRaw),
    knownGoodSha,
    target: targets.convexProduction,
  });
}

function candidateFailedRolledBackReceipt() {
  const rollback = convexReceipt().rollbackAnchor;
  return {
    candidate: {
      approvedSha,
      failedStep: "canary",
      result: "failed",
    },
    checkedAt: "2026-07-15T17:01:30.000Z",
    event: "convex_production_rollback_receipt",
    promotionAllowed: false,
    result: "candidate_failed_rolled_back",
    rollback: {
      canary: rollback.canary,
      knownGoodReceiptSha256: sha256(
        jsonEvidence(knownGoodConvexReceipt()).raw,
      ),
      knownGoodSha,
      result: "passed",
    },
    rollbackAnchor: rollback,
    schemaVersion: 1,
    target: targets.convexProduction,
  };
}

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error("Cannot hash undefined test proof data");
  return json;
}

function evidenceHashes(evidence: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(evidence).map(([key, raw]) => [key, sha256(raw)]),
  );
}

function emptyConvexClassification(): ConvexChangeClassification {
  return {
    baseSha: knownGoodSha,
    candidateSha: approvedSha,
    changes: [],
    classification: "none",
    diffSha256: sha256(""),
    requiresBackup: false,
    schemaVersion: 1,
  };
}

function changedConvexClassification(): ConvexChangeClassification {
  return {
    baseSha: knownGoodSha,
    candidateSha: approvedSha,
    changes: [{ kind: "schema", path: "convex/schema.ts", status: "M" }],
    classification: "schema",
    diffSha256: sha256("convex-schema-diff"),
    requiresBackup: true,
    schemaVersion: 1,
  };
}

const proofTimes = {
  collected: "2026-07-15T17:10:00.000Z",
  created: "2026-07-15T17:00:00.000Z",
  entry: "2026-07-15T17:02:00.000Z",
  invited: "2026-07-15T17:01:00.000Z",
  nda: "2026-07-15T17:03:00.000Z",
  response: "2026-07-15T17:04:00.000Z",
  retained: "2026-07-15T17:07:00.000Z",
  scored: "2026-07-15T17:05:00.000Z",
  selected: "2026-07-15T17:06:00.000Z",
  trust: "2026-07-15T17:08:00.000Z",
};

function r0CustomerProof(binding: ProductionProofBinding) {
  const names = [
    "buyer_evaluation_created",
    "seller_invited",
    "seller_secure_entry_completed",
    "seller_nda_executed",
    "seller_response_submitted",
    "buyer_scoring_completed",
    "buyer_selection_recorded",
    "immutable_record_retained",
  ] as const;
  const observed = [
    proofTimes.created,
    proofTimes.invited,
    proofTimes.entry,
    proofTimes.nda,
    proofTimes.response,
    proofTimes.scored,
    proofTimes.selected,
    proofTimes.retained,
  ];
  return {
    candidateSha: approvedSha,
    collectedAt: proofTimes.collected,
    convex: structuredClone(binding.convex),
    deployments: structuredClone(binding.deployments),
    environment: "staging",
    event: "r0_customer_journey_proof",
    failureRecovery: [
      "seller_secure_entry_expired_link",
      "response_submission_retry",
      "selection_transaction_failure",
      "immutable_record_unauthorized_mutation",
    ].map((scenario, index) => ({
      evidenceSha256: sha256(`failure-${scenario}`),
      failureObservedAt: new Date(
        Date.parse(proofTimes.entry) + index * 5_000,
      ).toISOString(),
      recoveredAt: new Date(
        Date.parse(proofTimes.entry) + index * 5_000 + 1_000,
      ).toISOString(),
      result: "passed",
      scenario,
    })),
    journey: names.map((name, index) => ({
      evidenceSha256: sha256(`journey-${name}`),
      name,
      observedAt: observed[index],
      result: "passed",
      runtimeEventId: `evt_${index + 1}`,
    })),
    metrics: {
      abandonment: {
        abandoned: false,
        observedAt: proofTimes.selected,
        queryEvidenceSha256: sha256("abandonment"),
        result: "passed",
      },
      activation: {
        observedAt: proofTimes.invited,
        queryEvidenceSha256: sha256("activation"),
        result: "passed",
        runtimeEventId: "evt_2",
      },
      completion: {
        observedAt: proofTimes.selected,
        queryEvidenceSha256: sha256("completion"),
        result: "passed",
        runtimeEventId: "evt_7",
      },
      timeToValue: {
        completedAt: proofTimes.retained,
        durationMs:
          Date.parse(proofTimes.retained) - Date.parse(proofTimes.created),
        queryEvidenceSha256: sha256("time-to-value"),
        result: "passed",
        startedAt: proofTimes.created,
      },
      trust: {
        accepted: true,
        observedAt: proofTimes.trust,
        queryEvidenceSha256: sha256("trust"),
        responseIdHash: sha256("trust-response"),
        result: "passed",
      },
    },
    pilot: {
      buyerActorIdHash: sha256("buyer-actor"),
      mode: "invited_human_staging_pilot",
      sellerActorIdHash: sha256("seller-actor"),
      workspaceIdHash: sha256("workspace"),
    },
    release: "R0",
    schemaVersion: 1,
    selectionRecord: {
      auditChainVerified: true,
      auditEvidenceSha256: sha256("audit-chain"),
      contentSha256: sha256("selection-record-content"),
      immutableAt: proofTimes.selected,
      recordIdHash: sha256("selection-record"),
      retainedAt: proofTimes.retained,
      retentionAuthority: "Sourcera_Master_Spec.md §40.2",
    },
    synthetic: false,
  };
}

function r0OperationalProof(binding: ProductionProofBinding) {
  const checks = [
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
  return {
    candidateSha: approvedSha,
    checks: checks.map((control, index) => ({
      control,
      evidenceSha256: sha256(`control-${control}`),
      observedAt: new Date(
        Date.parse(proofTimes.retained) + index * 1_000,
      ).toISOString(),
      result: "passed",
    })),
    collectedAt: proofTimes.collected,
    convex: structuredClone(binding.convex),
    convexRuntimeLog: {
      deploymentName: binding.convex.deploymentName,
      deploymentUrl: binding.convex.deploymentUrl,
      endedAt: proofTimes.retained,
      errorCount: 0,
      evidenceSha256: sha256("convex-logs"),
      fatalCount: 0,
      queryId: "query_convex_logs",
      startedAt: proofTimes.created,
    },
    deployments: structuredClone(binding.deployments),
    environment: "staging",
    event: "r0_operational_proof",
    release: "R0",
    reliability: {
      checksPassed: 4,
      checksRun: 4,
      queryEvidenceSha256: sha256("reliability-query"),
      result: "passed",
      windowEndedAt: proofTimes.retained,
      windowStartedAt: proofTimes.created,
    },
    rollbackRecovery: {
      applications: binding.deployments.map((deployment, index) => ({
        application: deployment.application,
        candidateDeploymentId: deployment.deploymentId,
        predecessorDeploymentId: `dpl_${deployment.application}_previous`,
        recoveryEvidenceSha256: sha256(
          `recovery-${deployment.application}`,
        ),
        recoveryObservedAt: new Date(
          Date.parse(proofTimes.scored) + index * 2_000 + 1_000,
        ).toISOString(),
        restoredDeploymentId: deployment.deploymentId,
        result: "passed",
        rollbackEvidenceSha256: sha256(
          `rollback-${deployment.application}`,
        ),
        rollbackObservedAt: new Date(
          Date.parse(proofTimes.scored) + index * 2_000,
        ).toISOString(),
      })),
      convex: {
        candidateSha: approvedSha,
        knownGoodSha,
        recoveryEvidenceSha256: sha256("convex-recovery"),
        recoveryObservedAt: proofTimes.retained,
        restoredSha: approvedSha,
        result: "passed",
        rollbackEvidenceSha256: sha256("convex-rollback"),
        rollbackObservedAt: proofTimes.selected,
      },
    },
    runtimeLogs: binding.deployments.map((deployment) => ({
      application: deployment.application,
      deploymentId: deployment.deploymentId,
      endedAt: proofTimes.retained,
      errorCount: 0,
      evidenceSha256: sha256(`logs-${deployment.application}`),
      fatalCount: 0,
      queryId: `query_${deployment.application}_logs`,
      stagedUrl: deployment.stagedUrl,
      startedAt: proofTimes.created,
    })),
    schemaVersion: 1,
    support: {
      allInterventionsRecorded: true,
      interventionCount: 0,
      queryEvidenceSha256: sha256("support-query"),
      result: "passed",
      unplannedDataRepairCount: 0,
      windowEndedAt: proofTimes.retained,
      windowStartedAt: proofTimes.created,
    },
    synthetic: false,
  };
}

function durableProofCollection(
  binding: ProductionProofBinding,
  customerProofRaw: string,
  operationalProofRaw: string,
) {
  const environmentProofRaw = jsonEvidence(
    isolatedProofEnvironmentReceipt(),
  ).raw;
  return {
    candidateSha: approvedSha,
    collectedAt: "2026-07-15T17:11:00.000Z",
    coordinator: {
      authentication: "signed_single_use_handoff",
      completedAt: "2026-07-15T17:11:00.000Z",
      expiryCompensation: "restore_known_good_and_block",
      expiresAt: "2026-07-15T18:00:00.000Z",
      handoffSha256: sha256("handoff"),
      projectId: "prj_release_control",
      provider: "vercel_workflow",
      runId: "run_019f",
      singleUseFinalizer: true,
      startedAt: "2026-07-15T17:00:00.000Z",
      state: "proofs_collected",
      workflowName: "sourcera-production-proof",
    },
    customerProofSha256: sha256(customerProofRaw),
    decision: "DEC-PROD-002",
    event: "durable_production_proof_collection",
    environmentProofSha256: sha256(environmentProofRaw),
    isolatedConvex: structuredClone(binding.convex),
    operationalProofSha256: sha256(operationalProofRaw),
    productionConvex: structuredClone(targets.convexProduction),
    result: "passed",
    schemaVersion: 1,
    synthetic: false,
  };
}

function isolatedProofEnvironmentReceipt() {
  return {
    candidateSha: approvedSha,
    collectedAt: "2026-07-15T17:00:00.000Z",
    coordinator: {
      expiresAt: "2026-07-15T18:00:00.000Z",
      handoffSha256: sha256("environment-handoff"),
      projectId: "prj_release_control",
      provider: "vercel_workflow",
      runId: "run_019f",
      state: "awaiting_proofs",
      workflowName: "sourcera-production-proof",
    },
    decision: "DEC-PROD-002",
    deployments: applications.map((application) => {
      const target = targets.vercelProduction.targets.find(
        (candidate) => candidate.application === application,
      )!;
      const deploymentId = `dpl_${application}_proof`;
      const environmentEvidence = {
        candidateSha: approvedSha,
        convexDeploymentName: isolatedCandidateConvex.deploymentName,
        convexUrl: isolatedCandidateConvex.deploymentUrl,
        deploymentId,
        environment: "staging",
        projectId: target.projectId,
        provider: "vercel",
        readAt: "2026-07-15T17:00:00.000Z",
      };
      return {
        application,
        backendConvexDeploymentName:
          isolatedCandidateConvex.deploymentName,
        backendConvexUrl: isolatedCandidateConvex.deploymentUrl,
        deploymentId,
        domains: target.productionDomains,
        environment: "staging",
        environmentEvidence,
        environmentEvidenceSha256: sha256(canonicalJson(environmentEvidence)),
        projectId: target.projectId,
        stagedUrl: `https://${application}-proof.vercel.app`,
      };
    }),
    event: "isolated_production_proof_environment",
    isolatedConvex: isolatedCandidateConvex,
    productionConvex: targets.convexProduction,
    result: "proof_ready",
    schemaVersion: 1,
    synthetic: false,
  };
}

function convexDataProtectionProof(
  binding: ProductionProofBinding,
  classification: ConvexChangeClassification,
) {
  const artifactSha256 = sha256("backup-artifact");
  const manifestSha256 = sha256("collection-manifest");
  return {
    backup: {
      artifactSha256,
      backupId: "backup_019f",
      collectionManifestSha256: manifestSha256,
      completedAt: "2026-07-15T16:02:00.000Z",
      encrypted: true,
      residencyRegion: "us",
      result: "passed",
      sourceDeploymentName: binding.convex.deploymentName,
      startedAt: "2026-07-15T16:00:00.000Z",
    },
    baseSha: knownGoodSha,
    candidateSha: approvedSha,
    classificationSha256: hashConvexChangeClassification(classification),
    collectedAt: "2026-07-15T16:10:00.000Z",
    convex: structuredClone(binding.convex),
    environment: "production",
    event: "convex_backup_restore_proof",
    restore: {
      artifactSha256,
      backupId: "backup_019f",
      cleanupCompletedAt: "2026-07-15T16:09:00.000Z",
      collectionManifestSha256: manifestSha256,
      completedAt: "2026-07-15T16:08:00.000Z",
      hashesMatched: true,
      restoreId: "restore_019f",
      result: "passed",
      startedAt: "2026-07-15T16:04:00.000Z",
      targetDeploymentName: "isolated-restore-019f",
      targetEnvironment: "isolated_staging",
    },
    schemaVersion: 1,
    synthetic: false,
  };
}

function historicalPassedReleaseReceipt(): ProductionReleaseReceipt {
  const proofEvidence = Object.fromEntries(
    [
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
      "r0CustomerJourney",
      "r0Operational",
      "durableProofCollection",
      "repository-before-marketplace",
      "repository-before-buyer",
      "repository-before-seller",
      "repository-final",
    ].map((key) => [key, JSON.stringify({ key, approvedSha: knownGoodSha })]),
  );
  proofEvidence.convexClassification = JSON.stringify({
    baseSha: "e".repeat(40),
    candidateSha: knownGoodSha,
    changes: [],
    classification: "none",
    diffSha256: sha256(""),
    requiresBackup: false,
    schemaVersion: 1,
  });
  proofEvidence.convex = jsonEvidence(knownGoodConvexReceipt()).raw;
  const providerProofEvidence = Object.fromEntries(
    applications.flatMap((application) =>
      ["pre-convex", "pre", "proof-ready", "promote", "post", "final"].map(
        (stage) => [
          `${stage}-${application}`,
          JSON.stringify({ application, stage, approvedSha: knownGoodSha }),
        ],
      ),
    ),
  );
  return {
    anchorMode: "normal" as const,
    approvedSha: knownGoodSha,
    checkedAt: "2026-07-14T17:10:00.000Z",
    convexCandidateRemainsLive: true as const,
    event: "production_release_complete_receipt" as const,
    knownGoodSha: "e".repeat(40),
    productionApplications: [...applications],
    promotionAllowed: true,
    proofEvidence,
    proofSha256: evidenceHashes(proofEvidence),
    providerProofEvidence,
    providerProofSha256: evidenceHashes(providerProofEvidence),
    result: "passed" as const,
    schemaVersion: 1 as const,
    trafficMutated: true,
  };
}

function historicalRolledBackReleaseReceipt(): ProductionReleaseReceipt {
  const passed = historicalPassedReleaseReceipt();
  const providerProofEvidence = {
    ...passed.providerProofEvidence,
    ...Object.fromEntries(
      applications.flatMap((application) =>
        ["reconcile", "rollback", "rollback-readback", "rollback-final"].map(
          (stage) => [
            `${stage}-${application}`,
            JSON.stringify({ application, stage, approvedSha: knownGoodSha }),
          ],
        ),
      ),
    ),
  };
  return {
    ...passed,
    error: "seller promotion failed",
    event: "production_release_rollback_receipt" as const,
    failedStage: "promote_seller",
    promotionAllowed: false,
    providerProofEvidence,
    providerProofSha256: evidenceHashes(providerProofEvidence),
    reconciliation: Object.fromEntries(
      applications.map((application) => [
        application,
        "predecessor_healthy_final",
      ]),
    ),
    result: "rolled_back" as const,
    rollbackOrder: [...applications].reverse(),
  };
}

function historicalConvexOnlyReleaseReceipt(): ProductionReleaseReceipt {
  const passed = historicalPassedReleaseReceipt();
  const proofEvidence = Object.fromEntries(
    Object.entries(passed.proofEvidence).filter(
      ([key]) => !key.startsWith("repository-before-"),
    ),
  );
  const providerProofEvidence = Object.fromEntries(
    Object.entries(passed.providerProofEvidence).filter(
      ([key]) => key.startsWith("pre-convex-") || key.startsWith("pre-"),
    ),
  );
  return {
    ...passed,
    error: "repository changed before promotion",
    event: "production_release_failure_receipt" as const,
    failedStage: "repository_before_marketplace",
    promotionAllowed: false,
    proofEvidence,
    proofSha256: evidenceHashes(proofEvidence),
    providerProofEvidence,
    providerProofSha256: evidenceHashes(providerProofEvidence),
    result: "failed" as const,
    trafficMutated: false,
  };
}

function githubApproval() {
  const checks = releaseConfig.github.requiredChecks.map(
    ({ name, workflow }, index) => ({
      app: { id: releaseConfig.github.actionsAppId },
      conclusion: "success",
      details_url: `https://github.com/meetblakey/sourcera/actions/runs/${100 + index}/job/${1000 + index}`,
      head_sha: approvedSha,
      id: index + 1,
      name,
      status: "completed",
      workflow,
    }),
  );
  return {
    approvedSha,
    branchProtection: {
      allow_deletions: { enabled: false },
      allow_force_pushes: { enabled: false },
      allow_fork_syncing: { enabled: false },
      block_creations: { enabled: false },
      enforce_admins: { enabled: true },
      lock_branch: { enabled: false },
      required_conversation_resolution: { enabled: true },
      required_linear_history: { enabled: true },
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        dismissal_restrictions: { apps: [], teams: [], users: [] },
        require_code_owner_reviews: false,
        require_last_push_approval: false,
        required_approving_review_count: 0,
      },
      restrictions: null,
      required_status_checks: {
        checks: releaseConfig.github.requiredChecks.map(({ name }) => ({
          app_id: releaseConfig.github.actionsAppId,
          context: name,
        })),
        contexts: [],
        strict: true,
      },
    },
    checkRuns: { check_runs: checks, total_count: checks.length },
    collaborators: [
      {
        id: releaseConfig.github.approver.id,
        login: releaseConfig.github.approver.login,
        permissions: { admin: true, pull: true, push: true },
      },
    ],
    environment: {
      can_admins_bypass: false,
      deployment_branch_policy: {
        custom_branch_policies: false,
        protected_branches: true,
      },
      name: releaseConfig.github.environment,
      protection_rules: [
        {
          prevent_self_review: false,
          reviewers: [
            {
              reviewer: releaseConfig.github.approver,
              type: "User",
            },
          ],
          type: "required_reviewers",
        },
        { type: "branch_policy" },
      ],
    },
    knownGood: {
      artifact: {
        digest: `sha256:${"c".repeat(64)}`,
        expired: false,
        id: 7001,
        name: `production-release-${knownGoodSha}-7000-1`,
        workflow_run: {
          head_branch: "main",
          head_sha: knownGoodSha,
          id: 7000,
        },
      },
      artifactDigest: `sha256:${"c".repeat(64)}`,
      artifactName: `production-release-${knownGoodSha}-7000-1`,
      releaseReceipt:
        historicalPassedReleaseReceipt() as ProductionReleaseReceipt,
      run: {
        conclusion: "success",
        event: "workflow_dispatch",
        head_branch: "main",
        head_sha: knownGoodSha,
        id: 7000,
        path: releaseConfig.github.workflow,
        run_attempt: 1,
        status: "completed",
      },
      runAttempt: 1,
      runId: 7000,
      sha: knownGoodSha,
      workflowSource: {
        content: normalAuthorityWorkflowContent,
        path: releaseConfig.github.workflow,
        ref: knownGoodSha,
        sha256: sha256(normalAuthorityWorkflowContent),
      },
    },
    repository: "meetblakey/sourcera",
    ref: { object: { sha: approvedSha }, ref: "refs/heads/main" },
    reviewHistory: [
      {
        comment: "Approved production release",
        environments: [{ name: releaseConfig.github.environment }],
        state: "approved",
        user: releaseConfig.github.approver,
      },
    ],
    rulesets: [],
    run: {
      actor: releaseConfig.github.approver,
      event: "workflow_dispatch",
      head_branch: "main",
      head_sha: approvedSha,
      id: 4242,
      path: releaseConfig.github.workflow,
      run_attempt: 1,
      status: "in_progress",
    },
    workflowRuns: releaseConfig.github.requiredChecks.map(
      ({ name, workflow }, index) => ({
        conclusion: "success",
        event: "push",
        head_branch: "main",
        head_sha: approvedSha,
        id: 100 + index,
        job: name,
        path: workflow,
        run_attempt: 1,
      }),
    ),
  };
}

function vercelBaselineProvenance() {
  const baselineRunId = 5151;
  const baselineRunAttempt = 1;
  const workflowBinding = {
    approvalArtifactDigest: "1".repeat(64),
    githubApprovalSha256: "2".repeat(64),
    githubHandoffSha256: "3".repeat(64),
    githubProofSha256: "4".repeat(64),
    identity: {
      approvedSha,
      repository: "meetblakey/sourcera",
      runAttempt: 1,
      runId: baselineRunId,
    },
    preflightArtifactDigest: "5".repeat(64),
    preflightReceiptSha256: "6".repeat(64),
    reasonSha256: "7".repeat(64),
  };
  const stageContent = {
    applications: applications.map((application) => {
      const target = targets.vercelProduction.targets.find(
        (candidate) => candidate.application === application,
      )!;
      return {
        application,
        candidate: {
          deploymentId: `dpl_${application}_baseline`,
          health: {
            checkedAt: "2026-07-15T16:55:00.000Z",
            commitSha: approvedSha,
            domain: application,
            environment: "production",
            service: "sourcera",
            status: "ok",
          },
          healthy: true,
          providerGitSha: approvedSha,
          readyState: "READY",
          readySubstate: "STAGED",
          target: "production",
          url: `https://${application}-baseline.vercel.app`,
        },
        original: { state: "absent" },
        target,
      };
    }),
    approvedSha,
    convexTarget: targets.convexProduction,
    event: "vercel_production_baseline_stage_receipt",
    schemaVersion: 1,
    stagedAt: "2026-07-15T16:55:00.000Z",
    teamId: targets.vercelProduction.teamId,
  };
  const canonical = canonicalJson(stageContent);
  const stageReceipt = {
    canonical,
    content: stageContent,
    sha256: sha256(canonical),
    workflowBinding,
  };
  const stageReceiptRaw = `${JSON.stringify(stageReceipt)}\n`;
  const stageReceiptRawSha256 = sha256(stageReceiptRaw);
  const stageArtifactDigest = `sha256:${"8".repeat(64)}`;
  const activationReceiptRaw = `${JSON.stringify({
    activationBinding: {
      activationRunAttempt: baselineRunAttempt,
      sourceWorkflowBinding: workflowBinding,
      stageArtifactDigest: stageArtifactDigest.slice("sha256:".length),
      stageReceiptRawSha256,
    },
    approvedSha,
    checkedAt: "2026-07-15T16:59:00.000Z",
    complete: true,
    event: "vercel_production_baseline_complete_receipt",
    receiptSha256: stageReceipt.sha256,
    result: "passed",
    rollbackClaimed: false,
    stageReceipt,
    states: {
      buyer: "candidate_live_healthy",
      marketplace: "candidate_live_healthy",
      seller: "candidate_live_healthy",
    },
    trafficMutated: true,
  })}\n`;
  const artifactName =
    `vercel-production-baseline-activation-${approvedSha}-${baselineRunId}-${baselineRunAttempt}`;
  const artifactDigest = `sha256:${"b".repeat(64)}`;
  const stageArtifactName =
    `vercel-production-baseline-stage-${approvedSha}-${baselineRunId}`;
  return {
    activationReceiptRaw,
    activationReceiptSha256: sha256(activationReceiptRaw),
    artifact: {
      digest: artifactDigest,
      expired: false,
      id: 6161,
      name: artifactName,
      workflow_run: {
        head_branch: "main",
        head_sha: approvedSha,
        id: baselineRunId,
      },
    },
    artifactDigest,
    artifactName,
    run: {
      conclusion: "success",
      event: "workflow_dispatch",
      head_branch: "main",
      head_sha: approvedSha,
      id: baselineRunId,
      path: releaseConfig.github.baselineWorkflow,
      run_attempt: baselineRunAttempt,
      status: "completed",
    },
    runAttempt: baselineRunAttempt,
    runId: baselineRunId,
    sha: approvedSha,
    stageArtifact: {
      digest: stageArtifactDigest,
      expired: false,
      id: 6160,
      name: stageArtifactName,
      workflow_run: {
        head_branch: "main",
        head_sha: approvedSha,
        id: baselineRunId,
      },
    },
    stageArtifactDigest,
    stageArtifactName,
    stageReceiptRaw,
    stageReceiptRawSha256,
    workflowSource: {
      content: vercelBaselineWorkflowContent,
      path: releaseConfig.github.baselineWorkflow,
      ref: approvedSha,
      sha256: sha256(vercelBaselineWorkflowContent),
    },
  };
}

function genesisGithubApproval() {
  const proof = {
    ...githubApproval(),
    bootstrapRoute: bootstrapRouteProof({ route: "initial_genesis" }),
    knownGood: undefined,
    vercelBaseline: vercelBaselineProvenance(),
  };
  proof.run = {
    ...proof.run,
    path: releaseConfig.github.bootstrapWorkflow,
  };
  const evidence = jsonEvidence(proof);
  const approvalReceiptRaw = JSON.stringify({
    approval: {
      reviewer: releaseConfig.github.approver,
      state: "approved",
    },
    approvedSha,
    checkedAt: "2026-07-15T17:09:00.000Z",
    environment: releaseConfig.github.environment,
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: approvedSha, id: 4242 },
    schemaVersion: 1,
    sourceProofSha256: createHash("sha256").update(evidence.raw).digest("hex"),
  });
  return { ...evidence, approvalReceiptRaw };
}

test("Convex genesis accepts only the exact successful Vercel baseline artifact chain", () => {
  const provenance = vercelBaselineProvenance();
  assert.deepEqual(
    validateProductionVercelBaselineProvenance(provenance, {
      activationReceiptRaw: provenance.activationReceiptRaw,
      artifactDigest: provenance.artifactDigest,
      artifactName: provenance.artifactName,
      authorityWorkflowLineage,
      runAttempt: provenance.runAttempt,
      runId: provenance.runId,
      sha: provenance.sha,
      stageReceiptRaw: provenance.stageReceiptRaw,
      stageReceiptRawSha256: provenance.stageReceiptRawSha256,
      workflowPath: releaseConfig.github.baselineWorkflow,
    }),
    {
      activationReceiptSha256: provenance.activationReceiptSha256,
      artifactDigest: provenance.artifactDigest,
      artifactName: provenance.artifactName,
      stageArtifactDigest: provenance.stageArtifactDigest,
      stageArtifactName: provenance.stageArtifactName,
      runAttempt: 1,
      runId: provenance.runId,
      sha: provenance.sha,
      stageReceiptRawSha256: provenance.stageReceiptRawSha256,
      workflowSha256: provenance.workflowSource.sha256,
    },
  );

  const variants = [
    {
      ...structuredClone(provenance),
      run: { ...provenance.run, path: releaseConfig.github.workflow },
    },
    {
      ...structuredClone(provenance),
      run: { ...provenance.run, conclusion: "failure" },
    },
    {
      ...structuredClone(provenance),
      artifact: { ...provenance.artifact, expired: true },
    },
    {
      ...structuredClone(provenance),
      artifact: { ...provenance.artifact, digest: `sha256:${"c".repeat(64)}` },
    },
    {
      ...structuredClone(provenance),
      stageArtifact: { ...provenance.stageArtifact, expired: true },
    },
    {
      ...structuredClone(provenance),
      stageArtifact: {
        ...provenance.stageArtifact,
        digest: `sha256:${"c".repeat(64)}`,
      },
    },
    (() => {
      const variant = structuredClone(provenance);
      delete (variant as Partial<typeof variant>).stageArtifact;
      return variant;
    })(),
    {
      ...structuredClone(provenance),
      workflowSource: {
        ...provenance.workflowSource,
        content: "name: Unapproved Vercel baseline workflow\n",
        sha256: sha256("name: Unapproved Vercel baseline workflow\n"),
      },
    },
    {
      ...structuredClone(provenance),
      activationReceiptRaw: provenance.activationReceiptRaw.replace(
        '"vercel_production_baseline_complete_receipt"',
        '"vercel_production_baseline_recovery_required_receipt"',
      ),
    },
    {
      ...structuredClone(provenance),
      stageReceiptRaw: `${provenance.stageReceiptRaw} `,
    },
    (() => {
      const variant = structuredClone(provenance);
      const activation = JSON.parse(variant.activationReceiptRaw) as {
        activationBinding: { stageReceiptRawSha256: string };
      };
      activation.activationBinding.stageReceiptRawSha256 = "f".repeat(64);
      variant.activationReceiptRaw = `${JSON.stringify(activation)}\n`;
      variant.activationReceiptSha256 = sha256(variant.activationReceiptRaw);
      return variant;
    })(),
  ];
  for (const variant of variants) {
    assert.throws(
      () =>
        validateProductionVercelBaselineProvenance(variant, {
          activationReceiptRaw: variant.activationReceiptRaw,
          artifactDigest: provenance.artifactDigest,
          artifactName: provenance.artifactName,
          authorityWorkflowLineage,
          runAttempt: provenance.runAttempt,
          runId: provenance.runId,
          sha: provenance.sha,
          stageReceiptRaw: variant.stageReceiptRaw,
          stageReceiptRawSha256: provenance.stageReceiptRawSha256,
          workflowPath: releaseConfig.github.baselineWorkflow,
        }),
      /baseline|artifact|receipt|workflow|hash/i,
    );
  }
});

test("baseline provenance reads the exact selected attempt, not a later rerun", () => {
  assert.equal(
    createGithubRunAttemptEndpoint(5151, 1),
    "/actions/runs/5151/attempts/1",
  );
  assert.equal(
    createGithubRunAttemptEndpoint(5151, 2),
    "/actions/runs/5151/attempts/2",
  );
  assert.throws(() => createGithubRunAttemptEndpoint(5151, 0), /attempt/);
});

test("a later-attempt baseline recovery receipt cannot authorize bootstrap without exact approval proof", () => {
  const retry = structuredClone(vercelBaselineProvenance());
  retry.runAttempt = 2;
  retry.run.run_attempt = 2;
  retry.artifactName =
    `vercel-production-baseline-activation-${retry.sha}-${retry.runId}-2`;
  retry.artifact.name = retry.artifactName;
  const activation = JSON.parse(retry.activationReceiptRaw) as {
    activationBinding: { activationRunAttempt: number };
  };
  activation.activationBinding.activationRunAttempt = 2;
  retry.activationReceiptRaw = `${JSON.stringify(activation)}\n`;
  retry.activationReceiptSha256 = sha256(retry.activationReceiptRaw);

  assert.throws(
    () =>
      validateProductionVercelBaselineProvenance(retry, {
        activationReceiptRaw: retry.activationReceiptRaw,
        artifactDigest: retry.artifactDigest,
        artifactName: retry.artifactName,
        authorityWorkflowLineage,
        runAttempt: retry.runAttempt,
        runId: retry.runId,
        sha: retry.sha,
        stageReceiptRaw: retry.stageReceiptRaw,
        stageReceiptRawSha256: retry.stageReceiptRawSha256,
        workflowPath: releaseConfig.github.baselineWorkflow,
      }),
    /later-attempt.*approval/i,
  );
});

test("Vercel baseline artifact selection rejects missing or duplicate same-run stage artifacts", async () => {
  const releaseModule = await import("../../scripts/release-production");
  const select = (
    releaseModule as unknown as {
      selectExactVercelBaselineArtifacts(
        artifacts: Array<Record<string, unknown>>,
        input: {
          activationArtifactName: string;
          runId: number;
          sha: string;
        },
      ): unknown;
    }
  ).selectExactVercelBaselineArtifacts;
  const provenance = vercelBaselineProvenance();
  const input = {
    activationArtifactName: provenance.artifactName,
    runId: provenance.runId,
    sha: provenance.sha,
  };
  assert.throws(
    () => select([provenance.artifact], input),
    /stage artifact.*missing|missing.*stage artifact/i,
  );
  assert.throws(
    () =>
      select(
        [
          provenance.artifact,
          provenance.stageArtifact,
          { ...provenance.stageArtifact, id: 6162 },
        ],
        input,
      ),
    /stage artifact.*duplicated|duplicated.*stage artifact/i,
  );
});

test("initial genesis is machine-proved only when neither production workflow has prior authority", () => {
  const proof = bootstrapRouteProof({ route: "initial_genesis" });
  const binding = validateProductionBootstrapRouteProof(proof, {
    authorityWorkflowLineage,
    route: "initial_genesis",
    workflowPaths: [
      releaseConfig.github.workflow,
      releaseConfig.github.bootstrapWorkflow,
    ],
  });
  assert.equal(binding.route, "initial_genesis");
  assert.equal(binding.routeProofSha256, sha256(JSON.stringify(proof)));

  for (const prior of [
    bootstrapRouteProof({
      expired: true,
      includeBootstrap: true,
      route: "initial_genesis",
    }),
    bootstrapRouteProof({
      expired: true,
      failedBootstrapAuthority: true,
      includeBootstrap: true,
      route: "initial_genesis",
    }),
    bootstrapRouteProof({
      expired: true,
      includeNormal: true,
      route: "initial_genesis",
    }),
    bootstrapRouteProof({
      expired: true,
      includeNormal: true,
      latestNormalFailedRerun: true,
      route: "initial_genesis",
    }),
  ]) {
    assert.throws(
      () =>
        validateProductionBootstrapRouteProof(prior, {
          authorityWorkflowLineage,
          route: "initial_genesis",
          workflowPaths: [
            releaseConfig.github.workflow,
            releaseConfig.github.bootstrapWorkflow,
          ],
        }),
      /prior production authority/i,
    );
  }

  const successfulButNonAuthoritative = bootstrapRouteProof({
    includeNormal: true,
    omitAuthorityArtifact: true,
    route: "initial_genesis",
  });
  assert.equal(
    validateProductionBootstrapRouteProof(successfulButNonAuthoritative, {
      authorityWorkflowLineage,
      route: "initial_genesis",
      workflowPaths: [
        releaseConfig.github.workflow,
        releaseConfig.github.bootstrapWorkflow,
      ],
    }).route,
    "initial_genesis",
  );

  const arbitraryFailedArtifact = bootstrapRouteProof({
    expired: true,
    failedBootstrapAuthority: true,
    includeBootstrap: true,
    route: "initial_genesis",
  });
  arbitraryFailedArtifact.inventory.workflowRunAttemptJobPages[0]!.pages[0]!
    .jobs[0]!.conclusion = "failure";
  arbitraryFailedArtifact.inventorySha256 = sha256(
    JSON.stringify(arbitraryFailedArtifact.inventory),
  );
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(arbitraryFailedArtifact, {
        authorityWorkflowLineage,
        route: "initial_genesis",
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /anchor-producing job/,
  );

  const renamedWorkflowAuthority = bootstrapRouteProof({
    expired: true,
    includeNormal: true,
    route: "initial_genesis",
  });
  renamedWorkflowAuthority.inventory.artifactPages = [];
  renamedWorkflowAuthority.inventory.workflowRunAttemptJobPages = [];
  renamedWorkflowAuthority.inventory.workflowRunAttempts = [];
  for (const workflow of renamedWorkflowAuthority.inventory.workflowRunPages) {
    workflow.pages = [{ total_count: 0, workflow_runs: [] }];
  }
  renamedWorkflowAuthority.inventory.authorityArtifactHistories[0]!.run.path =
    ".github/workflows/retired-production-release.yml";
  renamedWorkflowAuthority.inventory.authorityArtifactHistories[0]!
    .workflowSource.path = ".github/workflows/retired-production-release.yml";
  renamedWorkflowAuthority.inventorySha256 = sha256(
    JSON.stringify(renamedWorkflowAuthority.inventory),
  );
  const approvedRenamedLineage = [
    ...authorityWorkflowLineage,
    {
      authorityKind: "normal" as const,
      path: ".github/workflows/retired-production-release.yml",
      workflowSha256: sha256(normalAuthorityWorkflowContent),
    },
  ];
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(renamedWorkflowAuthority, {
        authorityWorkflowLineage: approvedRenamedLineage,
        route: "initial_genesis",
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /prior production authority/,
  );
});

test("expired-anchor recovery binds the newest exact expired authority and rejects a usable replacement", () => {
  const proof = bootstrapRouteProof({
    expired: true,
    includeBootstrap: true,
    includeNormal: true,
    newerBootstrap: true,
    route: "expired_anchor",
  });
  const selectedAnchor = proof.selectedAnchor!;
  const binding = validateProductionBootstrapRouteProof(proof, {
    authorityWorkflowLineage,
    route: "expired_anchor",
    selectedAnchor,
    workflowPaths: [
      releaseConfig.github.workflow,
      releaseConfig.github.bootstrapWorkflow,
    ],
  });
  assert.deepEqual(binding.selectedAnchor, selectedAnchor);

  const usable = bootstrapRouteProof({
    expired: false,
    includeNormal: true,
    route: "expired_anchor",
  });
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(usable, {
        authorityWorkflowLineage,
        route: "expired_anchor",
        selectedAnchor: usable.selectedAnchor!,
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /nonexpired|usable/i,
  );

  const tampered = structuredClone(proof);
  tampered.inventory.workflowRunPages[0]!.pages[0]!.total_count = 9;
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(tampered, {
        authorityWorkflowLineage,
        route: "expired_anchor",
        selectedAnchor,
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /inventory|pagination/i,
  );

  const staleSelection = structuredClone(proof);
  const normalArtifact = staleSelection.inventory.artifactPages.find(
    (entry) => entry.runId === 7000,
  )!.pages[0]!.artifacts[0]!;
  staleSelection.selectedAnchor = {
    artifactDigest: normalArtifact.digest,
    artifactId: normalArtifact.id,
    artifactName: normalArtifact.name,
    expired: true,
    runAttempt: 1,
    runId: 7000,
    sha: knownGoodSha,
    workflowPath: releaseConfig.github.workflow,
  };
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(staleSelection, {
        authorityWorkflowLineage,
        route: "expired_anchor",
        selectedAnchor: staleSelection.selectedAnchor!,
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /most recent/i,
  );
});

test("expired-anchor recovery accepts a renamed workflow only with exact retained proof", () => {
  const proof = bootstrapRouteProof({
    expired: true,
    includeNormal: true,
    route: "expired_anchor",
  });
  const renamedPath = ".github/workflows/retired-production-release.yml";
  proof.inventory.artifactPages = [];
  proof.inventory.workflowRunAttemptJobPages = [];
  proof.inventory.workflowRunAttempts = [];
  for (const workflow of proof.inventory.workflowRunPages) {
    workflow.pages = [{ total_count: 0, workflow_runs: [] }];
  }
  proof.inventory.authorityArtifactHistories[0]!.run.path = renamedPath;
  proof.inventory.authorityArtifactHistories[0]!.workflowSource.path = renamedPath;
  proof.selectedAnchor!.workflowPath = renamedPath;
  proof.inventorySha256 = sha256(JSON.stringify(proof.inventory));
  const approvedRenamedLineage = [
    ...authorityWorkflowLineage,
    {
      authorityKind: "normal" as const,
      path: renamedPath,
      workflowSha256: sha256(normalAuthorityWorkflowContent),
    },
  ];

  const selectedAnchor = readProductionExpiredAnchorIdentity(
    JSON.stringify(proof.selectedAnchor),
  );
  assert.equal(selectedAnchor.workflowPath, renamedPath);
  assert.deepEqual(
    validateProductionBootstrapRouteProof(proof, {
      authorityWorkflowLineage: approvedRenamedLineage,
      route: "expired_anchor",
      selectedAnchor,
      workflowPaths: [
        releaseConfig.github.workflow,
        releaseConfig.github.bootstrapWorkflow,
      ],
    }).selectedAnchor,
    selectedAnchor,
  );

  const tampered = structuredClone(proof);
  tampered.inventory.authorityArtifactHistories[0]!.run.path =
    ".github/workflows/another-retired-release.yml";
  tampered.inventory.authorityArtifactHistories[0]!.workflowSource.path =
    ".github/workflows/another-retired-release.yml";
  tampered.inventorySha256 = sha256(JSON.stringify(tampered.inventory));
  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(tampered, {
        authorityWorkflowLineage: approvedRenamedLineage,
        route: "expired_anchor",
        selectedAnchor,
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /lineage is not approved/,
  );
  assert.throws(
    () =>
      readProductionExpiredAnchorIdentity(
        JSON.stringify({
          ...proof.selectedAnchor,
          workflowPath: ".github/workflows/../release.yml",
        }),
      ),
    /identity is invalid/,
  );
});

test("retained Convex-anchor artifacts from an unknown workflow lineage are rejected", () => {
  const proof = bootstrapRouteProof({
    expired: true,
    failedBootstrapAuthority: true,
    includeBootstrap: true,
    route: "expired_anchor",
  });
  const unknownPath = ".github/workflows/copied-convex-anchor.yml";
  proof.inventory.artifactPages = [];
  proof.inventory.workflowRunAttemptJobPages = [];
  proof.inventory.workflowRunAttempts = [];
  for (const workflow of proof.inventory.workflowRunPages) {
    workflow.pages = [{ total_count: 0, workflow_runs: [] }];
  }
  proof.inventory.authorityArtifactHistories[0]!.run.path = unknownPath;
  proof.inventory.authorityArtifactHistories[0]!.workflowSource.path =
    unknownPath;
  proof.selectedAnchor!.workflowPath = unknownPath;
  proof.inventorySha256 = sha256(JSON.stringify(proof.inventory));
  const selectedAnchor = readProductionExpiredAnchorIdentity(
    JSON.stringify(proof.selectedAnchor),
  );

  assert.throws(
    () =>
      validateProductionBootstrapRouteProof(proof, {
        authorityWorkflowLineage,
        route: "expired_anchor",
        selectedAnchor,
        workflowPaths: [
          releaseConfig.github.workflow,
          releaseConfig.github.bootstrapWorkflow,
        ],
      }),
    /lineage is not approved/,
  );
});

async function genesisKnownGoodConvexReceipt(approvalReceiptSha256: string) {
  let monotonic = 0;
  return await createConvexProductionGenesisReceipt(
    {
      approvedCandidateSha: approvedSha,
      canarySecret: "c".repeat(32),
      checkout: {
        candidateSha: approvedSha,
        clean: true,
        knownGoodIsAncestor: true,
        knownGoodSha,
      },
      github: {
        approvalReceiptSha256,
        environment: "sourcera-production-release",
        headSha: approvedSha,
        runAttempt: 1,
        runId: 4242,
      },
      knownGoodSha,
      target: targets.convexProduction,
    },
    {
      monotonicNow: () => monotonic++,
      now: () => Date.parse("2026-07-15T17:09:30.000Z"),
      query: async () => null,
      randomId: () => `nonce-${monotonic}`,
    },
  );
}

function inspection(
  application: (typeof applications)[number],
  current: "candidate" | "predecessor" | "unexpected",
): ProductionApplicationInspection {
  const target = targets.vercelProduction.targets.find(
    (candidate) => candidate.application === application,
  )!;
  const currentDeploymentId =
    current === "candidate"
      ? `dpl_${application}_candidate`
      : current === "predecessor"
        ? `dpl_${application}_previous`
        : `dpl_${application}_unknown`;
  const value = {
    application,
    candidate: {
      commitSha: approvedSha,
      deploymentId: `dpl_${application}_candidate`,
      healthy: true,
      state: current === "candidate" ? ("PROMOTED" as const) : ("STAGED" as const),
    },
    current: {
      deploymentId: currentDeploymentId,
      healthy: true,
    },
    provider: {
      candidateDeployment: {
        alias: [],
        aliasAssigned: false,
        autoAssignCustomDomains: false,
        id: `dpl_${application}_candidate`,
        meta: {
          githubCommitSha: approvedSha,
          sourceraReleaseApprovedSha: approvedSha,
        },
        name: targets.vercelProduction.targets.find(
          (target) => target.application === application,
        )!.projectName,
        ownerId: targets.vercelProduction.teamId,
        projectId: targets.vercelProduction.targets.find(
          (target) => target.application === application,
        )!.projectId,
        readyState: "READY",
        target: "production",
        url: `${application}-candidate.vercel.app`,
      },
      candidateHealth: {
        commitSha: approvedSha,
        domain: application,
        environment: "production",
        service: "sourcera",
        status: "ok",
      },
      current: {
        alias: [
          targets.vercelProduction.targets.find(
            (target) => target.application === application,
          )!.productionDomain,
        ],
        id: currentDeploymentId,
      },
      currentHealth: {
        commitSha: current === "candidate" ? approvedSha : "f".repeat(40),
        domain: application,
        environment: "production",
        service: "sourcera",
        status: "ok",
      },
      productionDomains: {
        domains: target.productionDomains.map((name) => ({
          customEnvironmentId: null,
          gitBranch: null,
          name,
          projectId: target.projectId,
          verified: true,
        })),
        pagination: {
          count: target.productionDomains.length,
          next: null,
          prev: null,
        },
      },
      productionEnvironmentMetadata: {
        envs: target.allowedProductionEnvironmentKeys.map((key) => ({
          key,
          target: ["production"],
        })),
        hiddenProductionEnvCount: 0,
        pagination: { next: null },
      },
      project: {
        accountId: targets.vercelProduction.teamId,
        id: targets.vercelProduction.targets.find(
          (target) => target.application === application,
        )!.projectId,
        name: targets.vercelProduction.targets.find(
          (target) => target.application === application,
        )!.projectName,
      },
    },
  };
  return { ...value, raw: JSON.stringify(value) };
}

function successfulDependencies() {
  const operations: string[] = [];
  const current = new Map(applications.map((name) => [name, "predecessor"]));
  const dependencies: ProofGateDependencies = {
    classifyConvexChanges() {
      operations.push("classify-convex");
      return jsonEvidence(emptyConvexClassification());
    },
    deployConvex() {
      operations.push("deploy-convex");
      return jsonEvidence(passingCandidateConvexReceipt());
    },
    inspectApplication(application) {
      operations.push(`inspect-${application}-${current.get(application)}`);
      return inspection(application, current.get(application)! as "candidate" | "predecessor");
    },
    promoteApplication(application) {
      operations.push(`promote-${application}`);
      current.set(application, "candidate");
      return jsonEvidence({ application, promoted: true });
    },
    prepareIsolatedProofEnvironment() {
      operations.push("prepare-isolated-proof-environment");
      return jsonEvidence(isolatedProofEnvironmentReceipt());
    },
    rollbackApplication(application) {
      operations.push(`rollback-${application}`);
      current.set(application, "predecessor");
      return jsonEvidence({ application, rolledBack: true });
    },
    rollbackConvex() {
      operations.push("rollback-convex");
      return jsonEvidence(forcedRollbackReceipt());
    },
    runDeliveryVerification() {
      operations.push("gate-delivery");
      return jsonEvidence({ outcome: "pass" });
    },
    runExactStatusScan() {
      operations.push("gate-exact");
      return jsonEvidence({ open_rows: 0 });
    },
    runStampGate() {
      operations.push("gate-stamp");
      return jsonEvidence({ outcome: "pass" });
    },
    stageVercel() {
      operations.push("stage-vercel");
      return jsonEvidence(stageReceipt());
    },
    verifyGitHubApproval() {
      operations.push("verify-github");
      return jsonEvidence(githubApproval());
    },
    verifyKnownGoodConvexReceipt() {
      operations.push("verify-known-good-convex");
      return jsonEvidence(knownGoodConvexReceipt());
    },
    verifyConvexDataProtection(binding, classification) {
      operations.push("verify-convex-data-protection");
      return jsonEvidence(convexDataProtectionProof(binding, classification));
    },
    verifyDurableProofCollection(
      binding,
      customerProofRaw,
      operationalProofRaw,
    ) {
      operations.push("verify-durable-proof-collection");
      return jsonEvidence(
        durableProofCollection(
          binding,
          customerProofRaw,
          operationalProofRaw,
        ),
      );
    },
    verifyR0CustomerJourney(binding) {
      operations.push("verify-r0-customer");
      return jsonEvidence(r0CustomerProof(binding));
    },
    verifyR0Operational(binding) {
      operations.push("verify-r0-operational");
      return jsonEvidence(r0OperationalProof(binding));
    },
    verifyRepository() {
      operations.push("verify-repository");
      return jsonEvidence({
        clean: true,
        fetchedMainSha: approvedSha,
        headSha: approvedSha,
        mainSha: approvedSha,
        ref: "refs/heads/main",
      });
    },
  };
  return { current, dependencies, operations };
}

test("release config pins one repository, approver, action identity, checks, and CLI", () => {
  const parsed = readProductionReleaseConfig(releaseConfig);
  assert.equal(parsed.repository.owner, "meetblakey");
  assert.equal(parsed.github.approver.id, 15627406);
  assert.equal(parsed.github.actionsAppId, 15368);
  assert.equal(
    parsed.github.baselineWorkflow,
    ".github/workflows/vercel-production-baseline.yml",
  );
  assert.deepEqual(
    parsed.github.requiredChecks.map(({ name }) => name),
    [
      "verify",
      "convex-preview",
      "delivery-integrity",
      "linear-drift",
      "no-legacy-drift",
      "Spec-Lint (§M.4 CI gate cluster)",
    ],
  );
  assert.equal(parsed.tooling.vercelCli, "56.2.0");

  assert.throws(
    () =>
      readProductionReleaseConfig({
        ...releaseConfig,
        repository: { ...releaseConfig.repository, branch: "release/r0" },
      }),
    /main/,
  );
  assert.throws(
    () =>
      readProductionReleaseConfig({
        ...releaseConfig,
        github: {
          ...releaseConfig.github,
          authorityWorkflowLineage:
            releaseConfig.github.authorityWorkflowLineage.map((entry, index) =>
              index === 0
                ? { ...entry, workflowSha256: "0".repeat(64) }
                : entry,
            ),
        },
      }),
    /authority workflow lineage is invalid/,
  );
});

test("a failed repository or gate proof prevents every provider mutation", async () => {
  for (const failure of ["repository", "stamp", "exact", "delivery", "github"] as const) {
    const { dependencies, operations } = successfulDependencies();
    if (failure === "repository") {
      dependencies.verifyRepository = () =>
        jsonEvidence({
          clean: false,
          fetchedMainSha: approvedSha,
          headSha: approvedSha,
          mainSha: approvedSha,
          ref: "refs/heads/main",
        });
    } else if (failure === "stamp") {
      dependencies.runStampGate = () => jsonEvidence({ outcome: "fail" }, 1);
    } else if (failure === "exact") {
      dependencies.runExactStatusScan = () => jsonEvidence({ open_rows: 1 }, 1);
    } else if (failure === "delivery") {
      dependencies.runDeliveryVerification = () => jsonEvidence({ outcome: "fail" }, 1);
    } else {
      dependencies.verifyGitHubApproval = () =>
        jsonEvidence({ ...githubApproval(), approvedSha: "f".repeat(40) });
    }

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      now: () => new Date("2026-07-15T17:10:00.000Z"),
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.event, "production_release_failure_receipt");
    assert.equal(receipt.trafficMutated, false);
    assert.equal(
      operations.some((operation) =>
        operation === "stage-vercel" || operation === "deploy-convex" || operation.startsWith("promote-"),
      ),
      false,
      failure,
    );
  }
});

test("DEC-PROD-002 blocks every provider while the durable coordinator is unpinned", async () => {
  const { dependencies, operations } = successfulDependencies();
  const blockedConfig = {
    ...releaseConfig,
    proofCollection: {
      coordinator: null,
      decision: "DEC-PROD-002",
      isolatedCandidateConvex: null,
      mode: "blocked",
    },
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: blockedConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "failed");
  assert.match(receipt.error ?? "", /DEC-PROD-002|durable/i);
  assert.deepEqual(operations, []);
});

test("isolated human and durable proof must pass before live Convex mutation", async () => {
  const { dependencies, operations } = successfulDependencies();
  dependencies.verifyR0CustomerJourney = (binding) => {
    assert.deepEqual(binding.convex, isolatedCandidateConvex);
    operations.push("verify-r0-customer");
    return jsonEvidence(r0CustomerProof(binding));
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "passed", receipt.error ?? "release failed");
  for (const proofOperation of [
    "verify-r0-customer",
    "verify-r0-operational",
    "verify-durable-proof-collection",
  ]) {
    assert.ok(
      operations.indexOf(proofOperation) < operations.indexOf("deploy-convex"),
      proofOperation,
    );
  }
});

test("the staged receipt must preserve the exact controlled production alias set", async () => {
  const { dependencies, operations } = successfulDependencies();
  const receipt = stageReceipt();
  receipt.applications[1]!.productionDomains = [
    ...receipt.applications[1]!.productionDomains,
    "unexpected.sourcera.example",
  ];
  dependencies.stageVercel = () => jsonEvidence(receipt);

  const result = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(result.event, "production_release_failure_receipt");
  assert.equal(operations.includes("deploy-convex"), false);
});

test("Convex classification is exact and precedes all provider staging", async () => {
  const { dependencies, operations } = successfulDependencies();
  dependencies.classifyConvexChanges = () =>
    jsonEvidence({
      ...emptyConvexClassification(),
      baseSha: "a".repeat(40),
    });

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "failed");
  assert.equal(operations.includes("stage-vercel"), false);
  assert.equal(operations.includes("deploy-convex"), false);
});

test("missing proof dependencies fail closed before provider mutation", async () => {
  const { dependencies, operations } = successfulDependencies();
  delete (dependencies as Partial<ProofGateDependencies>)
    .classifyConvexChanges;

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.match(receipt.error ?? "", /classification dependency is unavailable/);
  assert.equal(operations.includes("stage-vercel"), false);
  assert.equal(operations.includes("deploy-convex"), false);
});

test("Convex changes require exact data-protection proof before Convex mutation", async () => {
  for (const failure of ["missing", "synthetic"] as const) {
    const { dependencies, operations } = successfulDependencies();
    dependencies.classifyConvexChanges = () => {
      operations.push("classify-convex");
      return jsonEvidence(changedConvexClassification());
    };
    dependencies.verifyConvexDataProtection = (binding, classification) => {
      operations.push("verify-convex-data-protection");
      if (failure === "missing") throw new Error("proof missing");
      return jsonEvidence({
        ...convexDataProtectionProof(binding, classification),
        synthetic: true,
      });
    };

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.result, "failed", failure);
    assert.equal(
      operations.includes("verify-convex-data-protection"),
      true,
      failure,
    );
    assert.equal(operations.includes("deploy-convex"), false, failure);
  }
});

test("validated Convex data-protection bytes are retained with exact hash parity", async () => {
  const { dependencies, operations } = successfulDependencies();
  dependencies.classifyConvexChanges = () => {
    operations.push("classify-convex");
    return jsonEvidence(changedConvexClassification());
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "passed", receipt.error ?? "release failed");
  assert.equal(
    receipt.proofSha256.convexDataProtection,
    sha256(receipt.proofEvidence.convexDataProtection!),
  );
  assert.ok(
    operations.indexOf("verify-convex-data-protection") <
      operations.indexOf("deploy-convex"),
  );
});

test("staged URLs are bound to provider readback before Convex mutation", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "buyer") return result;
    const raw = JSON.parse(result.raw);
    raw.provider.candidateDeployment.url = "drifted-buyer.vercel.app";
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "failed");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(operations.includes("deploy-convex"), false);
});

test("customer and operational proof failures stop before live Convex mutation", async () => {
  for (const failure of ["customer-binding", "operational-synthetic"] as const) {
    const { dependencies, operations } = successfulDependencies();
    if (failure === "customer-binding") {
      dependencies.verifyR0CustomerJourney = (binding) => {
        operations.push("verify-r0-customer");
        const proof = r0CustomerProof(binding);
        proof.deployments[1]!.stagedUrl = "https://drifted.vercel.app";
        return jsonEvidence(proof);
      };
    } else {
      dependencies.verifyR0Operational = (binding) => {
        operations.push("verify-r0-operational");
        return jsonEvidence({
          ...r0OperationalProof(binding),
          synthetic: true,
        });
      };
    }

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.result, "failed", failure);
    assert.equal(receipt.convexCandidateRemainsLive, false, failure);
    assert.equal(receipt.trafficMutated, false, failure);
    assert.equal(operations.includes("deploy-convex"), false, failure);
    assert.equal(operations.includes("rollback-convex"), false, failure);
    assert.equal(receipt.proofSha256.convexRollback, undefined, failure);
    assert.equal(
      operations.some((operation) => operation.startsWith("promote-")),
      false,
      failure,
    );
  }
});

test("all staged providers are rechecked after proof collection before promotion", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  let buyerStagedInspections = 0;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "buyer" || result.candidate.state !== "STAGED") {
      return result;
    }
    buyerStagedInspections += 1;
    if (buyerStagedInspections !== 3) return result;
    const raw = JSON.parse(result.raw);
    raw.provider.productionDomains.domains = [];
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "rolled_back");
  assert.equal(buyerStagedInspections, 3);
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(
    operations.some((operation) => operation.startsWith("promote-")),
    false,
  );
});

test("successful release proves staged and predecessor state then promotes Marketplace, Buyer, Seller", async () => {
  const { dependencies, operations } = successfulDependencies();
  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    now: () => new Date("2026-07-15T17:10:00.000Z"),
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(
    receipt.event,
    "production_release_complete_receipt",
    receipt.error ?? "release did not complete",
  );
  assert.equal(receipt.result, "passed", receipt.error ?? "release failed");
  assert.deepEqual(
    operations,
    [
      "verify-repository",
      "gate-stamp",
      "gate-exact",
      "gate-delivery",
      "verify-github",
      "verify-known-good-convex",
      "classify-convex",
      "stage-vercel",
      "verify-repository",
      "inspect-marketplace-predecessor",
      "inspect-buyer-predecessor",
      "inspect-seller-predecessor",
      "prepare-isolated-proof-environment",
      "inspect-marketplace-predecessor",
      "inspect-buyer-predecessor",
      "inspect-seller-predecessor",
      "verify-r0-customer",
      "verify-r0-operational",
      "verify-durable-proof-collection",
      "deploy-convex",
      "inspect-marketplace-predecessor",
      "inspect-buyer-predecessor",
      "inspect-seller-predecessor",
      "verify-repository",
      "promote-marketplace",
      "inspect-marketplace-candidate",
      "verify-repository",
      "promote-buyer",
      "inspect-buyer-candidate",
      "verify-repository",
      "promote-seller",
      "inspect-seller-candidate",
      "inspect-marketplace-candidate",
      "inspect-buyer-candidate",
      "inspect-seller-candidate",
      "verify-repository",
    ],
  );
  assert.deepEqual(
    Object.keys(receipt.proofSha256).sort(),
    [
      "configuration",
      "convex",
      "convexClassification",
      "delivery",
      "durableProofCollection",
      "exact",
      "github",
      "isolatedProofEnvironment",
      "knownGoodConvex",
      "productionProofBinding",
      "r0CustomerJourney",
      "r0Operational",
      "repository-after-stage",
      "repository-before-buyer",
      "repository-before-marketplace",
      "repository-before-seller",
      "repository-final",
      "repository-initial",
      "stamp",
      "vercelStage",
    ],
  );
  assert.deepEqual(
    Object.keys(receipt.proofEvidence).sort(),
    Object.keys(receipt.proofSha256).sort(),
  );
  assert.deepEqual(
    Object.keys(receipt.providerProofEvidence).sort(),
    Object.keys(receipt.providerProofSha256).sort(),
  );
  for (const [key, hash] of Object.entries(receipt.proofSha256)) {
    assert.equal(hash, sha256(receipt.proofEvidence[key]!));
  }
  for (const [key, hash] of Object.entries(receipt.providerProofSha256)) {
    assert.equal(hash, sha256(receipt.providerProofEvidence[key]!));
  }
  for (const application of applications) {
    assert.match(
      receipt.providerProofSha256[`pre-convex-${application}`]!,
      /^[a-f0-9]{64}$/,
    );
    assert.match(
      receipt.providerProofSha256[`pre-${application}`]!,
      /^[a-f0-9]{64}$/,
    );
    assert.match(
      receipt.providerProofSha256[`proof-ready-${application}`]!,
      /^[a-f0-9]{64}$/,
    );
    assert.match(
      receipt.providerProofSha256[`final-${application}`]!,
      /^[a-f0-9]{64}$/,
    );
  }
});

test("genesis release binds current GitHub approval before observe-only Convex bootstrap and provider work", async () => {
  const { dependencies, operations } = successfulDependencies();
  const github = genesisGithubApproval();
  let genesisReceiptRaw: string | undefined;
  dependencies.verifyGitHubApproval = () => {
    operations.push("verify-github");
    return github;
  };
  dependencies.verifyKnownGoodConvexReceipt = async (binding) => {
    operations.push("bootstrap-known-good-convex");
    assert.equal(binding?.approvedCandidateSha, approvedSha);
    assert.equal(binding?.githubRunId, 4242);
    assert.equal(binding?.githubRunAttempt, 1);
    assert.equal(
      binding?.approvalReceiptSha256,
      createHash("sha256").update(github.approvalReceiptRaw).digest("hex"),
    );
    const evidence = jsonEvidence(
      await genesisKnownGoodConvexReceipt(binding!.approvalReceiptSha256),
    );
    genesisReceiptRaw = evidence.raw;
    return evidence;
  };
  dependencies.deployConvex = () => {
    operations.push("deploy-convex");
    assert.ok(genesisReceiptRaw);
    const candidate = convexReceipt();
    candidate.knownGoodReceiptSha256 = sha256(genesisReceiptRaw);
    return jsonEvidence(candidate);
  };

  const receipt = await executeProductionRelease({
    anchorMode: "genesis",
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "passed", receipt.error ?? "release failed");
  assert.equal(receipt.anchorMode, "genesis");
  assert.ok(receipt.proofSha256.githubApprovalReceipt);
  assert.ok(
    operations.indexOf("verify-github") <
      operations.indexOf("bootstrap-known-good-convex"),
  );
  assert.ok(
    operations.indexOf("bootstrap-known-good-convex") <
      operations.indexOf("stage-vercel"),
  );
  assert.ok(
    operations.indexOf("stage-vercel") < operations.indexOf("deploy-convex"),
  );
});

test("anchor modes fail closed on missing, historical, mismatched, or unexpected genesis proof", async () => {
  const cases = [
    "missing-approval",
    "missing-baseline",
    "failed-baseline",
    "historical-genesis",
    "mismatched-source",
    "approval-in-normal",
  ] as const;
  for (const scenario of cases) {
    const { dependencies, operations } = successfulDependencies();
    const github = genesisGithubApproval();
    if (scenario === "missing-approval") {
      dependencies.verifyGitHubApproval = () => jsonEvidence(github.value);
    } else if (scenario === "missing-baseline") {
      const proof = structuredClone(github.value) as Record<string, unknown>;
      delete proof.vercelBaseline;
      dependencies.verifyGitHubApproval = () => jsonEvidence(proof);
    } else if (scenario === "failed-baseline") {
      const proof = structuredClone(github.value) as {
        vercelBaseline: ReturnType<typeof vercelBaselineProvenance>;
      };
      const activation = JSON.parse(
        proof.vercelBaseline.activationReceiptRaw,
      ) as Record<string, unknown>;
      activation.event = "vercel_production_baseline_recovery_required_receipt";
      activation.result = "recovery_required";
      const raw = `${JSON.stringify(activation)}\n`;
      proof.vercelBaseline.activationReceiptRaw = raw;
      proof.vercelBaseline.activationReceiptSha256 = sha256(raw);
      dependencies.verifyGitHubApproval = () => jsonEvidence(proof);
    } else if (scenario === "historical-genesis") {
      dependencies.verifyGitHubApproval = () => ({
        ...github,
        raw: jsonEvidence(githubApproval()).raw,
        value: githubApproval(),
      });
    } else if (scenario === "mismatched-source") {
      const approval = JSON.parse(github.approvalReceiptRaw);
      approval.sourceProofSha256 = "f".repeat(64);
      dependencies.verifyGitHubApproval = () => ({
        ...github,
        approvalReceiptRaw: JSON.stringify(approval),
      });
    } else {
      const normal = jsonEvidence(githubApproval());
      dependencies.verifyGitHubApproval = () => ({
        ...normal,
        approvalReceiptRaw: github.approvalReceiptRaw,
      });
    }

    const receipt = await executeProductionRelease({
      anchorMode: scenario === "approval-in-normal" ? "normal" : "genesis",
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.result, "failed", scenario);
    assert.equal(operations.includes("stage-vercel"), false, scenario);
    assert.equal(operations.includes("deploy-convex"), false, scenario);
  }
});

test("the controller awaits asynchronous provider mutations and readbacks", async () => {
  const { dependencies } = successfulDependencies();
  const originalPromote = dependencies.promoteApplication;
  const originalInspect = dependencies.inspectApplication;
  dependencies.promoteApplication = async (application, deploymentId) => {
    await Promise.resolve();
    return originalPromote(application, deploymentId);
  };
  dependencies.inspectApplication = async (application, staged) => {
    await Promise.resolve();
    return originalInspect(application, staged);
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "passed");
});

test("a final repository drift check rolls back all promoted applications", async () => {
  const { dependencies, operations } = successfulDependencies();
  let repositoryChecks = 0;
  dependencies.verifyRepository = () => {
    operations.push("verify-repository");
    repositoryChecks += 1;
    return jsonEvidence({
      clean: repositoryChecks < 6,
      fetchedMainSha: approvedSha,
      headSha: approvedSha,
      mainSha: approvedSha,
      ref: "refs/heads/main",
    });
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(repositoryChecks, 6);
  assert.equal(receipt.event, "production_release_rollback_receipt");
  assert.deepEqual(receipt.rollbackOrder, ["seller", "buyer", "marketplace"]);
});

test("a promotion failure reconciles provider truth and rolls back candidate traffic in reverse order", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalPromote = dependencies.promoteApplication;
  dependencies.promoteApplication = (application, deploymentId) => {
    if (application === "seller") {
      operations.push("promote-seller-failed");
      throw new Error("provider timeout");
    }
    return originalPromote(application, deploymentId);
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    now: () => new Date("2026-07-15T17:10:00.000Z"),
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_rollback_receipt");
  assert.equal(receipt.result, "rolled_back");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.deepEqual(
    operations.filter((operation) => operation.startsWith("rollback-")),
    ["rollback-buyer", "rollback-marketplace", "rollback-convex"],
  );
  assert.ok(
    operations.indexOf("rollback-convex") >
      operations.lastIndexOf("inspect-seller-predecessor"),
  );
  assert.equal(
    operations.filter((operation) => operation === "inspect-buyer-predecessor").length,
    5,
  );
});

test("unexpected provider traffic or failed rollback returns recovery-required proof", async () => {
  for (const failure of ["unexpected", "rollback"] as const) {
    const { current, dependencies } = successfulDependencies();
    const originalPromote = dependencies.promoteApplication;
    dependencies.promoteApplication = (application, deploymentId) => {
      if (application === "seller") {
        if (failure === "unexpected") current.set("buyer", "unexpected");
        throw new Error("promotion failed");
      }
      return originalPromote(application, deploymentId);
    };
    const originalInspect = dependencies.inspectApplication;
    dependencies.inspectApplication = (application, receipt) => {
      const state = current.get(application);
      if (state === "unexpected") return inspection(application, "unexpected");
      return originalInspect(application, receipt);
    };
    if (failure === "rollback") {
      dependencies.rollbackApplication = (application) => {
        if (application === "buyer") throw new Error("rollback failed");
        current.set(application, "predecessor");
        return jsonEvidence({ application, rolledBack: true });
      };
    }

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      now: () => new Date("2026-07-15T17:10:00.000Z"),
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.event, "production_release_recovery_required_receipt");
    assert.equal(receipt.result, "recovery_required");
    assert.equal(receipt.promotionAllowed, false);
  }
});

test("an ambiguous Convex failure returns recovery-required when forced rollback is not proven", async () => {
  const { dependencies } = successfulDependencies();
  dependencies.deployConvex = () => {
    throw new Error("connection closed after deploy request");
  };
  dependencies.rollbackConvex = () => jsonEvidence({ result: "ambiguous" }, 143);

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_recovery_required_receipt");
  assert.equal(receipt.result, "recovery_required");
  assert.equal(receipt.convexCandidateRemainsLive, "unknown");
  assert.equal(receipt.trafficMutated, false);
  assert.equal(
    receipt.proofSha256.convexRollback,
    sha256(receipt.proofEvidence.convexRollback!),
  );
});

test("a candidate Convex receipt must bind the exact known-good receipt bytes", async () => {
  const { dependencies, operations } = successfulDependencies();
  dependencies.deployConvex = () => {
    operations.push("deploy-convex");
    const receipt = passingCandidateConvexReceipt();
    receipt.knownGoodReceiptSha256 = "b".repeat(64);
    return jsonEvidence(receipt);
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "rolled_back");
  assert.equal(receipt.failedStage, "convex");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(operations.includes("rollback-convex"), true);
  assert.equal(operations.some((entry) => entry.startsWith("promote-")), false);
});

test("a nonzero forced rollback child is accepted only with complete exact proof", async () => {
  const { dependencies, operations } = successfulDependencies();
  let repositoryChecks = 0;
  dependencies.verifyRepository = () => {
    operations.push("verify-repository");
    repositoryChecks += 1;
    return jsonEvidence({
      clean: repositoryChecks < 3,
      fetchedMainSha: approvedSha,
      headSha: approvedSha,
      mainSha: approvedSha,
      ref: "refs/heads/main",
    });
  };
  dependencies.rollbackConvex = () => {
    operations.push("rollback-convex");
    return jsonEvidence(forcedRollbackReceipt(), 143);
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.result, "rolled_back");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(operations.includes("rollback-convex"), true);
});

test("a candidate child rollback receipt proves known-good without a second rollback", async () => {
  const { dependencies, operations } = successfulDependencies();
  dependencies.deployConvex = () =>
    jsonEvidence(candidateFailedRolledBackReceipt(), 1);

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_failure_receipt");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(receipt.trafficMutated, false);
  assert.equal(operations.includes("rollback-convex"), false);
});

test("provider fields not bound to the raw readback block promotion", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "marketplace") return result;
    const raw = JSON.parse(result.raw);
    raw.provider.candidateDeployment.meta.githubCommitSha = "f".repeat(40);
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_failure_receipt");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(receipt.trafficMutated, false);
  assert.equal(operations.includes("deploy-convex"), false);
  assert.equal(
    operations.some((operation) => operation.startsWith("promote-")),
    false,
  );
});

test("production environment and domain drift block before Convex mutation", async () => {
  for (const drift of ["environment", "domains"] as const) {
    const { dependencies, operations } = successfulDependencies();
    const originalInspect = dependencies.inspectApplication;
    dependencies.inspectApplication = async (application, staged) => {
      const result = await originalInspect(application, staged);
      if (application !== "marketplace") return result;
      const raw = JSON.parse(result.raw);
      if (drift === "environment") {
        raw.provider.productionEnvironmentMetadata.envs = [
          { key: "UNAPPROVED_SECRET", target: ["production"] },
        ];
      } else {
        raw.provider.productionDomains.domains.push({
          customEnvironmentId: null,
          gitBranch: null,
          name: "unexpected.sourcera.example",
          projectId: targets.vercelProduction.targets[0]!.projectId,
          verified: true,
        });
      }
      return { ...result, raw: JSON.stringify(raw) };
    };

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.event, "production_release_failure_receipt", drift);
    assert.equal(operations.includes("deploy-convex"), false, drift);
  }
});

test("production metadata is revalidated again immediately before promotion", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  let buyerPredecessorInspections = 0;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "buyer" || result.candidate.state !== "STAGED") {
      return result;
    }
    buyerPredecessorInspections += 1;
    if (buyerPredecessorInspections !== 2) return result;
    const raw = JSON.parse(result.raw);
    raw.provider.productionEnvironmentMetadata.hiddenProductionEnvCount = 1;
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_failure_receipt");
  assert.equal(receipt.convexCandidateRemainsLive, false);
  assert.equal(
    operations.some((operation) => operation.startsWith("promote-")),
    false,
  );
});

test("final production metadata drift rolls every promoted application back", async () => {
  const { dependencies } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  let marketplaceCandidateInspections = 0;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "marketplace" || result.candidate.state !== "PROMOTED") {
      return result;
    }
    marketplaceCandidateInspections += 1;
    if (marketplaceCandidateInspections !== 2) return result;
    const raw = JSON.parse(result.raw);
    raw.provider.productionDomains.domains = [];
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_rollback_receipt");
  assert.equal(receipt.failedStage, "provider_final");
  assert.deepEqual(receipt.rollbackOrder, ["seller", "buyer", "marketplace"]);
});

test("predecessor health must match the predecessor provider SHA", async () => {
  const { dependencies, operations } = successfulDependencies();
  const originalInspect = dependencies.inspectApplication;
  dependencies.inspectApplication = async (application, staged) => {
    const result = await originalInspect(application, staged);
    if (application !== "marketplace") return result;
    const raw = JSON.parse(result.raw);
    raw.provider.currentHealth.commitSha = approvedSha;
    return { ...result, raw: JSON.stringify(raw) };
  };

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_failure_receipt");
  assert.equal(receipt.trafficMutated, false);
  assert.equal(operations.includes("deploy-convex"), false);
  assert.equal(
    operations.some((operation) => operation.startsWith("promote-")),
    false,
  );
});

test("GitHub policy and known-good provenance accept only complete passed release or bootstrap anchors", async () => {
  for (const variant of ["force-push", "known-good", "rolled-back", "convex-only", "bootstrap-anchor", "unrelated-check"] as const) {
    const { dependencies, operations } = successfulDependencies();
    const proof = githubApproval();
    if (variant === "force-push") {
      proof.branchProtection.allow_force_pushes.enabled = true;
    } else if (variant === "known-good") {
      proof.knownGood.run.conclusion = "failure";
    } else if (variant === "rolled-back") {
      proof.knownGood.run.conclusion = "failure";
      proof.knownGood.releaseReceipt = historicalRolledBackReleaseReceipt();
    } else if (variant === "convex-only") {
      proof.knownGood.run.conclusion = "failure";
      proof.knownGood.releaseReceipt = historicalConvexOnlyReleaseReceipt();
    } else if (variant === "bootstrap-anchor") {
      proof.knownGood.run.path = releaseConfig.github.bootstrapWorkflow;
    } else {
      proof.checkRuns.check_runs.push({
        app: { id: 999 },
        conclusion: "success",
        details_url: "https://github.com/meetblakey/sourcera/actions/runs/999/job/999",
        head_sha: approvedSha,
        id: 99,
        name: "optional-observability",
        status: "completed",
        workflow: ".github/workflows/optional.yml",
      });
      proof.checkRuns.total_count += 1;
    }
    dependencies.verifyGitHubApproval = () => jsonEvidence(proof);

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });
    assert.equal(
      receipt.event,
      [
        "force-push",
        "known-good",
        "rolled-back",
        "convex-only",
        "bootstrap-anchor",
      ].includes(variant)
        ? "production_release_failure_receipt"
        : "production_release_complete_receipt",
    );
    if (
      [
        "force-push",
        "known-good",
        "rolled-back",
        "convex-only",
        "bootstrap-anchor",
      ].includes(variant)
    ) {
      assert.equal(operations.includes("stage-vercel"), false);
    }
  }
});

test("normal known-good authority binds the exact rerun attempt and artifact digest", () => {
  const parsedReleaseConfig = readProductionReleaseConfig(releaseConfig);
  const proof = githubApproval();
  proof.knownGood.run.run_attempt = 2;
  proof.knownGood.runAttempt = 2;
  proof.knownGood.artifact.name =
    `production-release-${knownGoodSha}-7000-2`;
  proof.knownGood.artifactName =
    `production-release-${knownGoodSha}-7000-2`;

  assert.doesNotThrow(() =>
    validateProductionGithubApprovalEvidence(
      proof,
      parsedReleaseConfig,
      approvedSha,
      knownGoodSha,
      "normal",
    ),
  );

  for (const variant of ["attempt", "digest"] as const) {
    const tampered = structuredClone(proof);
    if (variant === "attempt") {
      tampered.knownGood.artifactName =
        `production-release-${knownGoodSha}-7000-1`;
    } else {
      tampered.knownGood.artifactDigest = `sha256:${"d".repeat(64)}`;
    }
    assert.throws(
      () =>
        validateProductionGithubApprovalEvidence(
          tampered,
          parsedReleaseConfig,
          approvedSha,
          knownGoodSha,
          "normal",
        ),
      /known-good receipt provenance is not release-proven/,
      variant,
    );
  }
});

test("normal known-good authority accepts only approved historical workflow bytes", () => {
  const parsedReleaseConfig = readProductionReleaseConfig(releaseConfig);
  const renamedPath = ".github/workflows/retired-production-release.yml";
  const proof = githubApproval();
  proof.knownGood.run.path = renamedPath;
  proof.knownGood.workflowSource.path = renamedPath;
  const approvedRenamedConfig = readProductionReleaseConfig({
    ...releaseConfig,
    github: {
      ...releaseConfig.github,
      authorityWorkflowLineage: [
        ...releaseConfig.github.authorityWorkflowLineage,
        {
          authorityKind: "normal" as const,
          path: renamedPath,
          workflowSha256: sha256(normalAuthorityWorkflowContent),
        },
      ],
    },
  });

  assert.doesNotThrow(() =>
    validateProductionGithubApprovalEvidence(
      proof,
      approvedRenamedConfig,
      approvedSha,
      knownGoodSha,
      "normal",
    ),
  );
  assert.throws(
    () =>
      validateProductionGithubApprovalEvidence(
        proof,
        parsedReleaseConfig,
        approvedSha,
        knownGoodSha,
        "normal",
      ),
    /workflow lineage is not approved/,
  );

  const tampered = structuredClone(proof);
  tampered.knownGood.workflowSource.content = "name: copied workflow\n";
  tampered.knownGood.workflowSource.sha256 = sha256(
    tampered.knownGood.workflowSource.content,
  );
  assert.throws(
    () =>
      validateProductionGithubApprovalEvidence(
        tampered,
        approvedRenamedConfig,
        approvedSha,
        knownGoodSha,
        "normal",
      ),
    /workflow lineage is not approved/,
  );
});

test("a rolled-back release anchor still requires a passing Convex deployment receipt", async () => {
  const { dependencies, operations } = successfulDependencies();
  const proof = githubApproval();
  proof.knownGood.run.conclusion = "failure";
  proof.knownGood.releaseReceipt = historicalRolledBackReleaseReceipt();
  dependencies.verifyGitHubApproval = () => jsonEvidence(proof);
  dependencies.verifyKnownGoodConvexReceipt = () =>
    jsonEvidence({
      ...knownGoodConvexReceipt(),
      event: "convex_production_rollback_receipt",
    });

  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  assert.equal(receipt.event, "production_release_failure_receipt");
  assert.equal(operations.includes("stage-vercel"), false);
});

test("normal anchors reject truncated, tampered, or differently paired release evidence", async () => {
  for (const variant of ["truncated", "tampered", "convex-pair"] as const) {
    const { dependencies, operations } = successfulDependencies();
    const proof = githubApproval();
    if (variant === "truncated") {
      delete (proof.knownGood.releaseReceipt as Partial<
        ReturnType<typeof historicalPassedReleaseReceipt>
      >).proofEvidence;
    } else if (variant === "tampered") {
      proof.knownGood.releaseReceipt.proofEvidence.github = JSON.stringify({
        tampered: true,
      });
    } else {
      const differentConvexBytes = `${JSON.stringify({
        ...knownGoodConvexReceipt(),
        checkedAt: "2026-07-14T00:00:00.000Z",
      })}\n`;
      proof.knownGood.releaseReceipt.proofEvidence.convex = differentConvexBytes;
      proof.knownGood.releaseReceipt.proofSha256.convex = sha256(
        differentConvexBytes,
      );
    }
    dependencies.verifyGitHubApproval = () => jsonEvidence(proof);

    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot,
    });

    assert.equal(receipt.event, "production_release_failure_receipt", variant);
    assert.equal(operations.includes("stage-vercel"), false, variant);
  }
});

test("release receipts are external, atomic, private, and never overwritten", async () => {
  const { dependencies } = successfulDependencies();
  const receipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    now: () => new Date("2026-07-15T17:10:00.000Z"),
    productionTargets: targets,
    repositoryRoot: process.cwd(),
  });
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-production-release-test-"),
  );
  const receiptPath = path.join(temporaryDirectory, "receipt.json");
  try {
    await writeProductionReleaseReceipt(receiptPath, receipt, process.cwd());
    assert.deepEqual(JSON.parse(await readFile(receiptPath, "utf8")), receipt);
    assert.equal((await lstat(receiptPath)).mode & 0o777, 0o600);
    await assert.rejects(
      writeProductionReleaseReceipt(receiptPath, receipt, process.cwd()),
      /already exists/,
    );
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "contradictory.json"),
        {
          ...receipt,
          event: "production_release_failure_receipt",
        },
        process.cwd(),
      ),
      /incomplete/,
    );
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "tampered-evidence.json"),
        {
          ...receipt,
          proofEvidence: {
            ...receipt.proofEvidence,
            github: JSON.stringify({ tampered: true }),
          },
        },
        process.cwd(),
      ),
      /incomplete/,
    );
    const missingProviderEvidence = { ...receipt.providerProofEvidence };
    delete missingProviderEvidence["final-seller"];
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "missing-provider-evidence.json"),
        { ...receipt, providerProofEvidence: missingProviderEvidence },
        process.cwd(),
      ),
      /incomplete/,
    );
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "empty-evidence.json"),
        {
          ...receipt,
          proofEvidence: {},
          proofSha256: {},
          providerProofEvidence: {},
          providerProofSha256: {},
        },
        process.cwd(),
      ),
      /incomplete/,
    );
    const incompleteRollback = historicalRolledBackReleaseReceipt();
    delete incompleteRollback.reconciliation!.seller;
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "incomplete-reconciliation.json"),
        incompleteRollback,
        process.cwd(),
      ),
      /incomplete/,
    );
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(process.cwd(), "production-receipt.json"),
        receipt,
        process.cwd(),
      ),
      /outside the repository/,
    );
  } finally {
    await chmod(temporaryDirectory, 0o700).catch(() => undefined);
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("durable rollback receipts require exact Convex recovery bytes", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-production-convex-recovery-"),
  );
  try {
    const { dependencies } = successfulDependencies();
    let repositoryChecks = 0;
    dependencies.verifyRepository = () => {
      repositoryChecks += 1;
      return jsonEvidence({
        clean: repositoryChecks < 3,
        fetchedMainSha: approvedSha,
        headSha: approvedSha,
        mainSha: approvedSha,
        ref: "refs/heads/main",
      });
    };
    const receipt = await executeProductionRelease({
      approvedSha,
      config: releaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets: targets,
      repositoryRoot: process.cwd(),
    });
    assert.equal(receipt.result, "rolled_back");
    await writeProductionReleaseReceipt(
      path.join(temporaryDirectory, "valid.json"),
      receipt,
      process.cwd(),
    );

    const tampered = structuredClone(receipt);
    const rollback = JSON.parse(tampered.proofEvidence.convexRollback!);
    rollback.candidateSha = "d".repeat(40);
    tampered.proofEvidence.convexRollback = JSON.stringify(rollback);
    tampered.proofSha256.convexRollback = sha256(
      tampered.proofEvidence.convexRollback,
    );
    await assert.rejects(
      writeProductionReleaseReceipt(
        path.join(temporaryDirectory, "tampered.json"),
        tampered,
        process.cwd(),
      ),
      /incomplete/,
    );
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("receipt persistence failure after promotion reconciles before truthful stderr proof", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const persist = releaseModule.persistProductionReleaseOutcome;
  assert.equal(typeof persist, "function");
  if (typeof persist !== "function") return;
  const passedReceipt = {
    anchorMode: "normal" as const,
    approvedSha,
    checkedAt: "2026-07-15T17:10:00.000Z",
    convexCandidateRemainsLive: true as const,
    event: "production_release_complete_receipt" as const,
    knownGoodSha,
    productionApplications: [...applications],
    promotionAllowed: true,
    proofSha256: {},
    providerProofSha256: {},
    result: "passed" as const,
    schemaVersion: 1 as const,
    trafficMutated: true,
  };
  const rollbackReceipt = {
    ...passedReceipt,
    error: "receipt persistence failed after provider mutation",
    event: "production_release_rollback_receipt" as const,
    failedStage: "receipt_persistence",
    promotionAllowed: false,
    result: "rolled_back" as const,
  };
  let reconciliations = 0;
  const stderr: string[] = [];

  const result = await (persist as (options: {
    emit: (proof: string) => void;
    receipt: typeof passedReceipt;
    reconcile: () => Promise<typeof rollbackReceipt>;
    write: (receipt: typeof passedReceipt | typeof rollbackReceipt) => Promise<void>;
  }) => Promise<typeof rollbackReceipt>)({
    emit: (proof) => stderr.push(proof),
    receipt: passedReceipt,
    reconcile: async () => {
      reconciliations += 1;
      return rollbackReceipt;
    },
    write: async () => {
      throw new Error("disk unavailable");
    },
  });

  assert.equal(reconciliations, 1);
  assert.equal(result.trafficMutated, true);
  assert.equal(result.result, "rolled_back");
  assert.equal(JSON.parse(stderr[0]!).trafficMutated, true);
});

test("emergency reconciliation retains strict rollback proof and rechecks every application", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const reconcile = releaseModule.reconcileProductionTrafficEvidence;
  assert.equal(typeof reconcile, "function");
  if (typeof reconcile !== "function") return;
  const { dependencies, operations } = successfulDependencies();
  const passedReceipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });

  const receipt = await (reconcile as (options: {
    baseReceipt: typeof passedReceipt;
    convexTarget: typeof targets.convexProduction;
    dependencies: ProductionReleaseDependencies;
    failedStage: string;
    now: () => Date;
    productionTargets: typeof targets.vercelProduction.targets;
    reason: string;
    stagedReceipt: ReturnType<typeof stageReceipt>;
    teamId: string;
  }) => Promise<ProductionReleaseReceipt>)({
    baseReceipt: passedReceipt,
    convexTarget: targets.convexProduction,
    dependencies,
    failedStage: "receipt_persistence",
    now: () => new Date("2026-07-15T17:20:00.000Z"),
    productionTargets: targets.vercelProduction.targets,
    reason: "receipt persistence failed after provider mutation",
    stagedReceipt: stageReceipt(),
    teamId: targets.vercelProduction.teamId,
  });

  assert.equal(receipt.result, "rolled_back");
  assert.deepEqual(Object.keys(receipt.reconciliation!).sort(), [
    "buyer",
    "convex",
    "marketplace",
    "seller",
  ]);
  for (const application of applications) {
    for (const stage of [
      "emergency-reconcile",
      "emergency-rollback",
      "emergency-rollback-readback",
      "emergency-rollback-final",
    ]) {
      const key = `${stage}-${application}`;
      assert.equal(
        receipt.providerProofSha256[key],
        sha256(receipt.providerProofEvidence[key]!),
      );
    }
    assert.ok(
      operations.filter(
        (operation) => operation === `inspect-${application}-predecessor`,
      ).length >= 2,
    );
  }
});

test("emergency rollback failure still retains immediate and final provider readbacks", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const reconcile = releaseModule.reconcileProductionTrafficEvidence;
  assert.equal(typeof reconcile, "function");
  if (typeof reconcile !== "function") return;
  const { dependencies } = successfulDependencies();
  const passedReceipt = await executeProductionRelease({
    approvedSha,
    config: releaseConfig,
    dependencies,
    knownGoodSha,
    productionTargets: targets,
    repositoryRoot,
  });
  const originalRollback = dependencies.rollbackApplication;
  dependencies.rollbackApplication = (application, predecessorDeploymentId) => {
    if (application === "buyer") throw new Error("rollback provider timeout");
    return originalRollback(application, predecessorDeploymentId);
  };

  const receipt = await (reconcile as (options: {
    baseReceipt: ProductionReleaseReceipt;
    convexTarget: typeof targets.convexProduction;
    dependencies: ProductionReleaseDependencies;
    failedStage: string;
    productionTargets: typeof targets.vercelProduction.targets;
    reason: string;
    stagedReceipt: ReturnType<typeof stageReceipt>;
    teamId: string;
  }) => Promise<ProductionReleaseReceipt>)({
    baseReceipt: passedReceipt,
    convexTarget: targets.convexProduction,
    dependencies,
    failedStage: "receipt_persistence",
    productionTargets: targets.vercelProduction.targets,
    reason: "receipt persistence failed after provider mutation",
    stagedReceipt: stageReceipt(),
    teamId: targets.vercelProduction.teamId,
  });

  assert.equal(receipt.result, "recovery_required");
  for (const key of [
    "emergency-rollback-buyer",
    "emergency-rollback-readback-buyer",
    "emergency-rollback-final-buyer",
  ]) {
    assert.equal(typeof receipt.providerProofEvidence[key], "string", key);
    assert.equal(
      receipt.providerProofSha256[key],
      sha256(receipt.providerProofEvidence[key]!),
    );
  }
});

test("receipt and recovery persistence failure emits structurally complete recovery proof", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const persist = releaseModule.persistProductionReleaseOutcome;
  assert.equal(typeof persist, "function");
  if (typeof persist !== "function") return;
  const passedReceipt = {
    anchorMode: "normal" as const,
    approvedSha,
    checkedAt: "2026-07-15T17:10:00.000Z",
    convexCandidateRemainsLive: true as const,
    event: "production_release_complete_receipt" as const,
    knownGoodSha,
    productionApplications: [...applications],
    promotionAllowed: true,
    proofSha256: {},
    providerProofSha256: {},
    result: "passed" as const,
    schemaVersion: 1 as const,
    trafficMutated: true,
  };
  const stderr: string[] = [];

  const result = await (persist as (options: {
    emit: (proof: string) => void;
    receipt: typeof passedReceipt;
    reconcile: () => Promise<never>;
    write: () => Promise<void>;
  }) => Promise<Record<string, unknown>>)({
    emit: (proof) => stderr.push(proof),
    receipt: passedReceipt,
    reconcile: async () => {
      throw new Error("provider unavailable");
    },
    write: async () => {
      throw new Error("disk unavailable");
    },
  });

  assert.equal(result.result, "recovery_required");
  assert.deepEqual(result.reconciliation, {
    controller: "recovery_failed",
    convex: "rollback_not_proven",
  });
  assert.equal(result.convexCandidateRemainsLive, "unknown");
  assert.equal(
    (result.proofSha256 as Record<string, string>).convexRollback,
    sha256((result.proofEvidence as Record<string, string>).convexRollback!),
  );
  assert.deepEqual(result.rollbackOrder, []);
  assert.deepEqual(JSON.parse(stderr[0]!).reconciliation, {
    controller: "recovery_failed",
    convex: "rollback_not_proven",
  });
});

test("the signal handler attempts reconciliation once before terminating", async () => {
  const events: string[] = [];
  const handler = createProductionReleaseSignalHandler(
    "SIGTERM",
    async () => {
      events.push("recover");
    },
    (code) => {
      events.push(`exit-${code}`);
    },
  );

  await Promise.all([handler(), handler()]);
  assert.deepEqual(events, ["recover", "exit-143"]);
});

test("provider commands can be stopped promptly before signal reconciliation", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const createRunner = releaseModule.createSignalResponsiveCommandRunner;
  assert.equal(typeof createRunner, "function");
  if (typeof createRunner !== "function") return;
  const runner = (createRunner as (options: {
    terminationGraceMs: number;
  }) => {
    run(
      command: string,
      arguments_: string[],
      environment: Record<string, string | undefined>,
    ): Promise<{ status: number }>;
    stop(): Promise<void>;
  })({ terminationGraceMs: 250 });
  const startedAt = Date.now();
  const pending = runner.run(
    process.execPath,
    ["--eval", "setTimeout(() => {}, 10000)"],
    { PATH: process.env.PATH },
  );
  await new Promise((resolve) => setTimeout(resolve, 50));

  await runner.stop();
  const result = await pending;

  assert.notEqual(result.status, 0);
  assert.ok(Date.now() - startedAt < 2_000);
  const afterStop = await runner.run(
    process.execPath,
    ["--eval", "process.exit(0)"],
    { PATH: process.env.PATH },
  );
  assert.notEqual(afterStop.status, 0);
});

test("Convex command shutdown waits for its reconciliation owner", async () => {
  const releaseModule: Record<string, unknown> = await import(
    "../../scripts/release-production"
  );
  const createRunner = releaseModule.createSignalResponsiveCommandRunner;
  assert.equal(typeof createRunner, "function");
  if (typeof createRunner !== "function") return;
  const runner = (createRunner as (options: {
    terminationGraceMs: number;
  }) => {
    run(
      command: string,
      arguments_: string[],
      environment: Record<string, string | undefined>,
      cwd?: string,
      options?: { stopMode: "wait-for-reconciliation" },
    ): Promise<{ status: number }>;
    stop(): Promise<void>;
  })({ terminationGraceMs: 10 });
  const startedAt = Date.now();
  const pending = runner.run(
    process.execPath,
    [
      "--eval",
      "process.on('SIGTERM',()=>setTimeout(()=>process.exit(7),200));setInterval(()=>{},1000)",
    ],
    { PATH: process.env.PATH },
    undefined,
    { stopMode: "wait-for-reconciliation" },
  );
  await new Promise((resolve) => setTimeout(resolve, 50));

  await runner.stop();
  const result = await pending;

  assert.equal(result.status, 7);
  assert.ok(Date.now() - startedAt >= 200);
});

test("the checked-in release config and package pin match the controller contract", async () => {
  const checkedInConfig = JSON.parse(
    await readFile("config/production-release.json", "utf8"),
  );
  const parsedConfig = readProductionReleaseConfig(checkedInConfig);
  assert.equal(parsedConfig.proofCollection.mode, "blocked");
  assert.deepEqual(parsedConfig.proofCollection, {
    coordinator: null,
    decision: "DEC-PROD-002",
    isolatedCandidateConvex: null,
    mode: "blocked",
  });
  for (const [authorityKind, workflowPath] of [
    ["normal", parsedConfig.github.workflow],
    ["convex_anchor", parsedConfig.github.bootstrapWorkflow],
    ["vercel_baseline", parsedConfig.github.baselineWorkflow],
  ] as const) {
    const workflowSha256 = sha256(await readFile(workflowPath, "utf8"));
    assert.equal(
      parsedConfig.github.authorityWorkflowLineage.filter(
        (entry) =>
          entry.authorityKind === authorityKind &&
          entry.path === workflowPath &&
          entry.workflowSha256 === workflowSha256,
      ).length,
      1,
      `${workflowPath} current lineage hash is missing or duplicated`,
    );
  }

  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(packageJson.devDependencies.vercel, "56.2.0");
  assert.deepEqual(packageJson.overrides, {
    "@tootallnate/once@2.0.0": "2.0.1",
    "ajv@8.6.3": "8.20.0",
    "js-yaml@4.1.1": "4.3.0",
    "minimatch@10.1.1": "10.2.5",
    "path-to-regexp@>=6.0.0 <6.3.0": "6.3.0",
    "path-to-regexp@>=8.0.0 <8.4.0": "8.4.2",
    postcss: "8.5.10",
    "smol-toml@1.5.2": "1.6.1",
    "tar@7.5.7": "7.5.20",
    "tsx@4.21.0": { esbuild: "0.27.0" },
    "undici@>=5.28.4 <6.27.0": "6.27.0",
  });
  assert.equal(
    packageJson.scripts["release:production"],
    "tsx scripts/release-production.ts",
  );
  assert.equal(
    packageJson.scripts["release:production:github"],
    "tsx scripts/production-release-github.ts",
  );
  assert.equal(
    packageJson.scripts["release:production:blocked"],
    "tsx scripts/production-release-blocked.ts",
  );
  assert.equal(
    packageJson.scripts["release:production:no-authority"],
    "tsx scripts/production-release-no-authority.ts",
  );
  assert.equal(
    packageJson.scripts["release:production:preflight"],
    "tsx scripts/production-release-preflight.ts",
  );
  const workflow = await readFile(
    ".github/workflows/production-release.yml",
    "utf8",
  );
  assert.match(workflow, /retention-days: 90/);
  assert.doesNotMatch(workflow, /anchor_mode:|\bgenesis\b/);
  assert.doesNotMatch(workflow, /--anchor-mode normal/);
  assert.match(workflow, /release:production:no-authority/);
  const bootstrapWorkflow = await readFile(
    ".github/workflows/production-bootstrap-recovery.yml",
    "utf8",
  );
  assert.match(bootstrapWorkflow, /--anchor-mode genesis/);
  assert.doesNotMatch(bootstrapWorkflow, /--anchor-mode normal/);
});

test("blocked receipt paths reject an outside symlink parent that enters the repository", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-blocked-path-test-"),
  );
  try {
    const linkedIntoRepository = path.join(
      temporaryDirectory,
      "linked-into-repository",
    );
    await symlink(process.cwd(), linkedIntoRepository, "dir");
    assert.throws(
      () =>
        readProductionBlockedArguments([
          "--anchor-mode",
          "normal",
          "--github-handoff",
          path.join(temporaryDirectory, "github-handoff.json"),
          "--github-proof",
          path.join(temporaryDirectory, "github-proof.json"),
          "--preflight-dir",
          path.join(temporaryDirectory, "preflight"),
          "--receipt-out",
          path.join(linkedIntoRepository, "blocked-receipt.json"),
        ]),
      /outside the repository/,
    );
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("blocked receipt publishers are atomic, interruption-safe, and non-overwriting", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-atomic-blocked-receipts-"),
  );
  try {
    for (const [name, writeReceipt] of [
      ["blocked", writeProductionBlockedReceipt],
      ["no-authority", writeProductionNoAuthorityReceipt],
    ] as const) {
      const interruptedPath = path.join(
        temporaryDirectory,
        `${name}-interrupted.json`,
      );
      await assert.rejects(
        writeReceipt(
          interruptedPath,
          { event: `${name}_receipt`, result: "blocked" },
          {
            beforePublish() {
              throw new Error("simulated interruption");
            },
          },
        ),
        /simulated interruption/,
      );
      await assert.rejects(readFile(interruptedPath), /ENOENT/);
      assert.equal(
        (await readdir(temporaryDirectory)).some((entry) =>
          entry.includes(`${name}-interrupted.json`),
        ),
        false,
      );

      const existingPath = path.join(
        temporaryDirectory,
        `${name}-existing.json`,
      );
      await writeFile(existingPath, "existing immutable receipt\n", "utf8");
      await assert.rejects(
        writeReceipt(existingPath, { event: `${name}_replacement` }),
        /already exists/,
      );
      assert.equal(
        await readFile(existingPath, "utf8"),
        "existing immutable receipt\n",
      );
    }
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("the production CLI requires external distinct paths and isolates every credential lane", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-release-cli-test-"),
  );
  try {
    const parsed = readProductionReleaseArguments(
      [
        "--anchor-mode",
        "normal",
        "--known-good-convex-receipt",
        path.join(temporaryDirectory, "known-good.json"),
        "--receipt-out",
        path.join(temporaryDirectory, "release.json"),
      ],
      process.cwd(),
    );
    assert.equal(parsed.anchorMode, "normal");
    assert.notEqual(parsed.knownGoodConvexReceiptPath, parsed.receiptOutputPath);
    await writeFile(parsed.receiptOutputPath, "existing proof\n", "utf8");
    assert.throws(
      () =>
        readProductionReleaseArguments(
          [
            "--anchor-mode",
            "normal",
            "--known-good-convex-receipt",
            path.join(temporaryDirectory, "known-good.json"),
            "--receipt-out",
            parsed.receiptOutputPath,
          ],
          process.cwd(),
        ),
      /must not already exist/,
    );
    assert.equal(
      readProductionReleaseArguments(
        [
          "--anchor-mode",
          "normal",
          "--known-good-convex-receipt",
          path.join(temporaryDirectory, "known-good.json"),
          "--receipt-out",
          parsed.receiptOutputPath,
        ],
        process.cwd(),
        { allowExistingReceipt: true },
      ).receiptOutputPath,
      parsed.receiptOutputPath,
    );
    await rm(parsed.receiptOutputPath);
    assert.throws(
      () =>
        readProductionReleaseArguments(
          [
            "--anchor-mode",
            "normal",
            "--known-good-convex-receipt",
            path.join(process.cwd(), "known-good.json"),
            "--receipt-out",
            path.join(temporaryDirectory, "release.json"),
          ],
          process.cwd(),
        ),
      /outside the repository/,
    );
    for (const invalid of [
      [
        "--known-good-convex-receipt",
        path.join(temporaryDirectory, "known-good.json"),
        "--receipt-out",
        path.join(temporaryDirectory, "release.json"),
      ],
      [
        "--anchor-mode",
        "automatic",
        "--known-good-convex-receipt",
        path.join(temporaryDirectory, "known-good.json"),
        "--receipt-out",
        path.join(temporaryDirectory, "release.json"),
      ],
    ]) {
      assert.throws(
        () => readProductionReleaseArguments(invalid, process.cwd()),
        /anchor-mode|Usage/,
      );
    }

    const source = {
      CONVEX_DEPLOY_KEY: "convex-key",
      GITHUB_TOKEN: "artifact-token",
      PATH: "/safe/bin",
      SOURCERA_CONVEX_CANARY_SECRET: "c".repeat(32),
      SOURCERA_RELEASE_GITHUB_TOKEN: "approval-token",
      VERCEL_TOKEN: "vercel-token",
    };
    const github = createProductionReleaseLaneEnvironment(
      source,
      "github",
      "/private/github",
    );
    assert.equal(github.GH_TOKEN, "approval-token");
    assert.equal(github.VERCEL_TOKEN, undefined);
    assert.equal(github.CONVEX_DEPLOY_KEY, undefined);
    assert.equal(github.HOME, "/private/github");
    assert.equal(github.XDG_CONFIG_HOME, "/private/github/.config");
    assert.equal(github.npm_config_userconfig, "/private/github/.npmrc");
    const vercel = createProductionReleaseLaneEnvironment(
      source,
      "vercel",
      "/private/vercel",
    );
    assert.equal(vercel.VERCEL_TOKEN, "vercel-token");
    assert.equal(vercel.GH_TOKEN, undefined);
    assert.equal(vercel.HOME, "/private/vercel");
    const convex = createProductionReleaseLaneEnvironment(
      source,
      "convex",
      "/private/convex",
    );
    assert.equal(convex.CONVEX_DEPLOY_KEY, "convex-key");
    assert.equal(convex.SOURCERA_CONVEX_CANARY_SECRET, "c".repeat(32));
    assert.equal(convex.VERCEL_TOKEN, undefined);
    const gates = createProductionReleaseLaneEnvironment(
      source,
      "gates",
      "/private/gates",
    );
    assert.equal(gates.GITHUB_TOKEN, undefined);
    assert.equal(gates.CONVEX_DEPLOY_KEY, undefined);
    assert.equal(gates.HOME, "/private/gates");
    assert.notEqual(gates.HOME, github.HOME);
    assert.throws(
      () =>
        createProductionReleaseLaneEnvironment(
          { PATH: "/safe/bin" },
          "github",
          "/private/github",
        ),
      /SOURCERA_RELEASE_GITHUB_TOKEN/,
    );
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("the protected controller rejects every GitHub credential", () => {
  const convexOnly = {
    CONVEX_DEPLOY_KEY: "convex-key",
    SOURCERA_CONVEX_CANARY_SECRET: "c".repeat(32),
  };
  assert.doesNotThrow(() =>
    assertProductionMutationCredentialBoundary(convexOnly),
  );
  assert.doesNotThrow(() =>
    assertProductionMutationCredentialBoundary({ VERCEL_TOKEN: "vercel-token" }),
  );
  assert.throws(
    () =>
      assertProductionMutationCredentialBoundary({
        ...convexOnly,
        VERCEL_TOKEN: "vercel-token",
      }),
    /forbids Vercel and Convex write credentials/,
  );
  for (const forbidden of [
    "GH_TOKEN",
    "GITHUB_TOKEN",
    "SOURCERA_RELEASE_GITHUB_TOKEN",
  ]) {
    assert.throws(
      () =>
        assertProductionMutationCredentialBoundary({
          ...convexOnly,
          [forbidden]: "forbidden",
        }),
      new RegExp(forbidden),
    );
  }
});

test("the no-authority lane rejects every provider and GitHub credential", () => {
  assert.doesNotThrow(() =>
    assertProductionNoAuthorityCredentialBoundary({
      NODE_ENV: "test",
      PATH: "/safe/bin",
    }),
  );
  for (const forbidden of [
    "CONVEX_DEPLOY_KEY",
    "GH_TOKEN",
    "GITHUB_TOKEN",
    "SOURCERA_CONVEX_CANARY_SECRET",
    "SOURCERA_RELEASE_GITHUB_TOKEN",
    "VERCEL_TOKEN",
  ]) {
    assert.throws(
      () =>
        assertProductionNoAuthorityCredentialBoundary({
          [forbidden]: "forbidden",
          NODE_ENV: "test",
        }),
      new RegExp(forbidden),
    );
  }
});

test("provider subprocesses receive only their credential lane", async () => {
  const source = {
    CONVEX_DEPLOY_KEY: "convex-key",
    PATH: process.env.PATH,
    SOURCERA_CONVEX_CANARY_SECRET: "c".repeat(32),
    SOURCERA_RELEASE_GITHUB_TOKEN: "github-token",
    VERCEL_TOKEN: "vercel-token",
  };
  const runner = createSignalResponsiveCommandRunner();
  try {
    for (const [lane, expected] of [
      ["github", ["GH_TOKEN"]],
      ["vercel", ["VERCEL_TOKEN"]],
      ["convex", ["CONVEX_DEPLOY_KEY", "SOURCERA_CONVEX_CANARY_SECRET"]],
      ["gates", []],
    ] as const) {
      const environment = createProductionReleaseLaneEnvironment(
        source,
        lane,
        `/private/${lane}`,
      );
      const result = await runner.run(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          "process.stdout.write(JSON.stringify(Object.keys(process.env).filter((key)=>/(?:TOKEN|KEY|SECRET)$/.test(key)).sort()))",
        ],
        environment,
      );
      assert.equal(result.status, 0, lane);
      assert.deepEqual(JSON.parse(result.stdout), expected, lane);
    }
  } finally {
    await runner.stop();
  }
});

test("production command wiring uses repeated authenticated control metadata and bounded probes", async () => {
  assert.equal(
    resolveSpecLintTsx("/repo"),
    "/repo/tools/spec-lint/node_modules/.bin/tsx",
  );
  const arguments_ = createProductionHealthProbeArguments(
    "buyer.sourcera.example",
  );
  assert.equal(arguments_.at(-1), "https://buyer.sourcera.example/api/health");
  assert.match(arguments_[2], /AbortSignal\.timeout\(10000\)/);
  assert.match(arguments_[2], /cache:'no-store'/);
  const source = await readFile("scripts/release-production.ts", "utf8");
  assert.match(source, /\/env\?decrypt=false&teamId=/);
  assert.match(source, /\/domains\?production=true&limit=100&teamId=/);
  assert.match(source, /validateProductionEnvironmentMetadata\(/);
  assert.match(source, /validateProductionDomains\(/);
  assert.match(source, /scripts\/rollback-convex-production\.ts/);
  assert.match(source, /--known-good-receipt-sha256/);
  assert.match(source, /convex-production-forced-rollback\.json/);
  assert.match(source, /convexRollbackPromise \?\?=/);
});

test("Vercel promotion receives exactly one deployment identifier", () => {
  assert.deepEqual(
    createVercelPromotionArguments(
      "dpl_candidate",
      "team_6nIbCLwuaHPTHviqgckfTiyn",
    ),
    [
      "promote",
      "dpl_candidate",
      "--yes",
      "--scope",
      "team_6nIbCLwuaHPTHviqgckfTiyn",
      "--timeout",
      "180s",
    ],
  );
});
