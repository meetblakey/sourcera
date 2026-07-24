import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import productionReleaseConfig from "../../config/production-release.json";
import {
  createVercelProductionBaselineProvider,
  type VercelProductionBaselineProviderCommand,
  type VercelProductionBaselineProviderCommandResult,
} from "../../scripts/lib/vercel-production-baseline-provider";
import type { VercelProductionTarget } from "../../scripts/lib/vercel-production-release";
import {
  resumeVercelProductionBaseline,
  stageVercelProductionBaseline,
  type VercelProductionBaselineStageReceipt,
} from "../../scripts/lib/vercel-production-baseline";
import {
  createActivationFailureReceipt,
  main as activateMain,
  readActivationArguments,
  readExactStageReceipt,
  writeActivationReceipt,
} from "../../scripts/activate-vercel-production-baseline";
import {
  createProductionPreflightReceipt,
  type ProductionPreflightEvidence,
} from "../../scripts/lib/production-release-workflow";
import { createVercelProductionBaselineGithubHandoff } from "../../scripts/lib/vercel-production-baseline-workflow";
import {
  readStageArguments,
  validateVercelProductionBaselineWorkflowEvidence,
} from "../../scripts/stage-vercel-production-baseline";

const applications = ["marketplace", "buyer", "seller"] as const;
const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const advancedSha = "123456789abcdef0123456789abcdef012345678";
const previousSha = "fedcba9876543210fedcba9876543210fedcba98";
const checkedAt = "2026-07-15T17:00:00.000Z";
const teamId = "team_6nIbCLwuaHPTHviqgckfTiyn";
const token = "vercel_test_baseline_token";
const releaseRunId = "baseline-run-12345";
const workflowRunId = 4242;
const preflightArtifactDigest = "c".repeat(64);
const approvalArtifactDigest = "d".repeat(64);
const baselineReason = "Create the first healthy Vercel production baseline";

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function baselineGithubProof() {
  const github = productionReleaseConfig.github;
  const checks = github.requiredChecks.map(({ name, workflow }, index) => ({
    app: { id: github.actionsAppId },
    conclusion: "success",
    details_url: `https://github.com/meetblakey/sourcera/actions/runs/${100 + index}/job/${1000 + index}`,
    head_sha: approvedSha,
    id: index + 1,
    name,
    status: "completed",
    workflow,
  }));
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
      required_status_checks: {
        checks: github.requiredChecks.map(({ name }) => ({
          app_id: github.actionsAppId,
          context: name,
        })),
        contexts: [],
        strict: true,
      },
      restrictions: null,
    },
    checkRuns: { check_runs: checks, total_count: checks.length },
    collaborators: [
      {
        id: github.approver.id,
        login: github.approver.login,
        permissions: { admin: true, pull: true, push: true },
      },
    ],
    environment: {
      can_admins_bypass: false,
      deployment_branch_policy: {
        custom_branch_policies: false,
        protected_branches: true,
      },
      name: github.environment,
      protection_rules: [
        {
          prevent_self_review: false,
          reviewers: [{ reviewer: github.approver, type: "User" }],
          type: "required_reviewers",
        },
        { type: "branch_policy" },
      ],
    },
    ref: { object: { sha: approvedSha }, ref: "refs/heads/main" },
    repository: "meetblakey/sourcera",
    reviewHistory: [
      {
        environments: [{ name: github.environment }],
        state: "approved",
        user: github.approver,
      },
    ],
    rulesets: [],
    run: {
      actor: github.approver,
      event: "workflow_dispatch",
      head_branch: "main",
      head_sha: approvedSha,
      id: workflowRunId,
      path: github.baselineWorkflow,
      run_attempt: 1,
      status: "in_progress",
    },
    workflowRuns: github.requiredChecks.map(({ name, workflow }, index) => ({
      conclusion: "success",
      event: "push",
      head_branch: "main",
      head_sha: approvedSha,
      id: 100 + index,
      job: name,
      path: workflow,
      run_attempt: 1,
    })),
  };
}

function protectedReviewerProof(githubProofRaw: string) {
  const github = productionReleaseConfig.github;
  return JSON.stringify({
    approval: { reviewer: github.approver, state: "approved" },
    approvedSha,
    checkedAt,
    environment: github.environment,
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: approvedSha, id: workflowRunId },
    schemaVersion: 1,
    sourceProofSha256: sha256(githubProofRaw),
  });
}

async function workflowEvidenceFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-baseline-evidence-"));
  const preflightDirectory = path.join(root, "preflight");
  await mkdir(preflightDirectory, { recursive: true });
  const identity = {
    approvedSha,
    repository: "meetblakey/sourcera" as const,
    runAttempt: 1,
    runId: workflowRunId,
  };
  const evidence: ProductionPreflightEvidence = {
    appVerification: JSON.stringify({ exitCode: 0, outcome: "pass" }),
    delivery: JSON.stringify({ exitCode: 0, outcome: "pass" }),
    exact: JSON.stringify({ open_rows: 0 }),
    repository: JSON.stringify({
      branch: "main",
      clean: true,
      fetchedMainSha: approvedSha,
      headSha: approvedSha,
      mainSha: approvedSha,
      ref: "refs/heads/main",
    }),
    stamp: JSON.stringify({ outcome: "pass" }),
  };
  for (const [name, raw] of Object.entries(evidence)) {
    await writeFile(path.join(preflightDirectory, `${name}.json`), raw);
  }
  const preflightReceiptRaw = `${JSON.stringify(
    createProductionPreflightReceipt({ evidence, identity }),
  )}\n`;
  await writeFile(
    path.join(preflightDirectory, "production-preflight.json"),
    preflightReceiptRaw,
  );
  const githubProofRaw = `${JSON.stringify(baselineGithubProof())}\n`;
  const githubApprovalRaw = protectedReviewerProof(githubProofRaw);
  const handoff = createVercelProductionBaselineGithubHandoff({
    forwardOnlyAcknowledged: true,
    githubProofRaw,
    identity,
    preflightArtifactDigest,
    preflightReceiptRaw,
    protectedReviewerProofRaw: githubApprovalRaw,
    reason: baselineReason,
  });
  const githubProofPath = path.join(root, "github-proof.json");
  const githubApprovalPath = path.join(root, "github-approval.json");
  const githubHandoffPath = path.join(root, "github-handoff.json");
  await Promise.all([
    writeFile(githubProofPath, githubProofRaw),
    writeFile(githubApprovalPath, githubApprovalRaw),
    writeFile(githubHandoffPath, `${JSON.stringify(handoff, null, 2)}\n`),
  ]);
  return {
    arguments: {
      githubApprovalPath,
      githubHandoffPath,
      githubProofPath,
      preflightDirectory,
    },
    environment: {
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_RUN_ID: String(workflowRunId),
      SOURCERA_APPROVAL_ARTIFACT_DIGEST: approvalArtifactDigest,
      SOURCERA_BASELINE_FORWARD_ONLY_ACK: "true",
      SOURCERA_BASELINE_REASON: baselineReason,
      SOURCERA_PREFLIGHT_ARTIFACT_DIGEST: preflightArtifactDigest,
      SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
    },
    githubProofPath,
    githubProofRaw,
    root,
  };
}

const config = {
  convexProduction: {
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
  },
  vercelProduction: {
    teamId,
    targets: [
      {
        allowedProductionEnvironmentKeys: [],
        application: "marketplace",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "sourcera-meetblakeys-projects.vercel.app",
        productionDomains: ["sourcera-meetblakeys-projects.vercel.app"],
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
        productionDomain: "sourcera-buyer-meetblakeys-projects.vercel.app",
        productionDomains: [
          "sourcera-buyer-meetblakeys-projects.vercel.app",
          "www.sourcera-buyer-meetblakeys-projects.vercel.app",
        ],
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
        productionDomain: "sourcera-seller-meetblakeys-projects.vercel.app",
        productionDomains: [
          "sourcera-seller-meetblakeys-projects.vercel.app",
        ],
        projectId: "prj_Vd0Roi2q0XPkphCrn8rtoNxI1DkS",
        projectName: "sourcera-seller",
        rootDirectory: "apps/seller",
        sourceFilesOutsideRootDirectory: true,
      },
    ],
  },
};

type Application = (typeof applications)[number];

function targetForApplication(application: Application) {
  const target = config.vercelProduction.targets.find(
    (candidate) => candidate.application === application,
  );
  assert.ok(target);
  return target;
}

function applicationForCommand(command: VercelProductionBaselineProviderCommand) {
  const joined = command.arguments.join(" ");
  return applications.find((application) => {
    const target = targetForApplication(application);
    return (
      joined.includes(target.projectId) ||
      joined.includes(`dpl_${application}_candidate`)
    );
  });
}

function ok(value = "") : VercelProductionBaselineProviderCommandResult {
  return { exitCode: 0, stderr: "", stdout: value };
}

function runLocal(command: string, arguments_: string[], cwd: string) {
  const result = spawnSync(command, arguments_, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

async function waitForFile(value: string, timeoutMs: number) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await access(value);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  throw new Error(`timed out waiting for ${value}`);
}

async function waitForProcessExit(pid: number, timeoutMs: number) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      process.kill(pid, 0);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ESRCH"
      ) {
        return;
      }
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`process ${pid} did not exit promptly`);
}

function projectReadback(application: Application, current: unknown = undefined) {
  const target = targetForApplication(application);
  return {
    accountId: teamId,
    autoExposeSystemEnvs: true,
    id: target.projectId,
    link: { productionBranch: "main" },
    name: target.projectName,
    rootDirectory: target.rootDirectory,
    sourceFilesOutsideRootDirectory: true,
    targets: current === undefined ? {} : { production: current },
  };
}

function domainsReadback(application: Application) {
  const target = targetForApplication(application);
  return {
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
  };
}

function candidateReadback(
  application: Application,
  promoted: Set<Application>,
  omitPromotedAlias?: Application,
  overrides: Record<string, unknown> = {},
) {
  const target = targetForApplication(application);
  const promotedAliases = omitPromotedAlias === application
    ? target.productionDomains.slice(0, 1)
    : target.productionDomains;
  return {
    alias: promoted.has(application) ? promotedAliases : [],
    aliasAssigned: promoted.has(application),
    autoAssignCustomDomains: false,
    buildEnv: {
      NEXT_PUBLIC_CONVEX_URL: config.convexProduction.deploymentUrl,
      SOURCERA_COMMIT_SHA: approvedSha,
      SOURCERA_DOMAIN: application,
      SOURCERA_ENV: "production",
      SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
    },
    createdAt: Date.parse(checkedAt),
    id: `dpl_${application}_candidate`,
    meta: {
      githubCommitSha: approvedSha,
      sourceraConvexDeploymentName: config.convexProduction.deploymentName,
      sourceraConvexDeploymentUrl: config.convexProduction.deploymentUrl,
      sourceraReleaseApprovedSha: approvedSha,
      sourceraReleaseRunId: releaseRunId,
    },
    name: target.projectName,
    ownerId: teamId,
    projectId: target.projectId,
    readyState: "READY",
    readySubstate: promoted.has(application) ? "PROMOTED" : "STAGED",
    rootDirectory: target.rootDirectory,
    source: "cli",
    target: "production",
    url: `${target.projectName}-${approvedSha.slice(0, 8)}.vercel.app`,
    ...overrides,
  };
}

function healthReadback(application: Application, healthCheckedAt = checkedAt) {
  return {
    checkedAt: healthCheckedAt,
    commitSha: approvedSha,
    domain: application,
    environment: "production",
    service: "sourcera",
    status: "ok",
  };
}

async function harness(options: {
  ambiguousPromotion?: {
    application: Application;
    outcome:
      | "signal_after_success"
      | "signal_during_mutation"
      | "timeout_after_success";
  };
  current?: Partial<Record<Application, unknown>>;
  candidateOverrides?: Partial<
    Record<Application, Record<string, unknown>>
  >;
  cancelWorktreeAdd?: boolean;
  concurrentRepositoryReads?: boolean;
  failPromotion?: Application;
  githubRef?: string;
  healthCheckedAt?: string;
  omitPromotedAlias?: Application;
  remoteMainPolicy?: "descendant-recovery";
  repositoryBranch?: string;
} = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-baseline-provider-"));
  const requestedRepositoryRoot = path.join(root, "repo");
  const receiptPath = path.join(root, "evidence", "stage.json");
  await import("node:fs/promises").then(({ mkdir }) =>
    mkdir(requestedRepositoryRoot, { recursive: true }),
  );
  const repositoryRoot = await import("node:fs/promises").then(({ realpath }) =>
    realpath(requestedRepositoryRoot),
  );
  const commands: VercelProductionBaselineProviderCommand[] = [];
  const promoted = new Set<Application>();
  let concurrentReadStarts = 0;
  let concurrentReadsSettled = 0;
  let failed = false;
  let fetchedRemoteMainSha: string | undefined;
  let remoteMainDescendsFromApproved = true;
  let remoteMainSha = approvedSha;
  const run = async (
    command: VercelProductionBaselineProviderCommand,
  ): Promise<VercelProductionBaselineProviderCommandResult> => {
    commands.push(command);
    if (command.command === "git") {
      const operation = command.arguments.join(" ");
      if (operation.startsWith("worktree add --detach ")) {
        const worktreeRoot = command.arguments[3]!;
        await import("node:fs/promises").then(({ mkdir }) =>
          mkdir(worktreeRoot, { recursive: true }),
        );
        if (options.cancelWorktreeAdd) {
          return new Promise((resolve) => {
            command.signal?.addEventListener(
              "abort",
              () => resolve({
                error: new Error("worktree add canceled"),
                exitCode: 1,
                stderr: "worktree add canceled",
                stdout: "",
              }),
              { once: true },
            );
            queueMicrotask(() => provider.requestStop());
            if (!command.signal) {
              resolve({
                error: new Error("worktree add has no cancellation signal"),
                exitCode: 1,
                stderr: "worktree add has no cancellation signal",
                stdout: "",
              });
            }
          });
        }
        return ok();
      }
      if (operation.startsWith("worktree remove --force ")) return ok();
      if (operation === "worktree prune") return ok();
      if (
        options.concurrentRepositoryReads &&
        command.cwd === repositoryRoot &&
        [
          "rev-parse HEAD",
          "branch --show-current",
          "status --porcelain=v1 --untracked-files=all",
          "rev-parse --show-toplevel",
          "ls-remote --exit-code origin refs/heads/main",
        ].includes(operation)
      ) {
        concurrentReadStarts += 1;
        const readIndex = concurrentReadStarts;
        return new Promise((resolve) => {
          command.signal?.addEventListener(
            "abort",
            () => {
              setTimeout(() => {
                concurrentReadsSettled += 1;
                resolve({
                  error: new Error(`repository read ${readIndex} canceled`),
                  exitCode: 1,
                  stderr: `repository read ${readIndex} canceled`,
                  stdout: "",
                });
              }, readIndex === 5 ? 0 : 100);
            },
            { once: true },
          );
          if (concurrentReadStarts === 5) {
            queueMicrotask(() => provider.requestStop());
          }
          if (!command.signal) {
            resolve({
              error: new Error("repository read has no cancellation signal"),
              exitCode: 1,
              stderr: "repository read has no cancellation signal",
              stdout: "",
            });
          }
        });
      }
      if (operation === "rev-parse HEAD") return ok(`${approvedSha}\n`);
      if (operation === "branch --show-current") {
        return ok(
          command.cwd === repositoryRoot
            ? `${options.repositoryBranch ?? ""}\n`
            : "\n",
        );
      }
      if (operation === "status --porcelain=v1 --untracked-files=all") return ok();
      if (operation === "rev-parse --show-toplevel") {
        return ok(`${command.cwd}\n`);
      }
      if (operation === "ls-remote --exit-code origin refs/heads/main") {
        return ok(`${remoteMainSha}\trefs/heads/main\n`);
      }
      if (operation === "fetch --no-tags --force origin refs/heads/main") {
        fetchedRemoteMainSha = remoteMainSha;
        return ok();
      }
      if (operation === "rev-parse FETCH_HEAD") {
        return fetchedRemoteMainSha
          ? ok(`${fetchedRemoteMainSha}\n`)
          : { exitCode: 1, stderr: "FETCH_HEAD is absent", stdout: "" };
      }
      if (
        operation ===
          `merge-base --is-ancestor ${approvedSha} ${remoteMainSha}`
      ) {
        return remoteMainDescendsFromApproved
          ? ok()
          : { exitCode: 1, stderr: "remote main diverged", stdout: "" };
      }
      throw new Error(`unexpected Git command: ${operation}`);
    }
    if (command.arguments[0] === "--version") return ok("Vercel CLI 56.2.0\n");
    const application = applicationForCommand(command);
    assert.ok(application, `unexpected Vercel command: ${command.arguments.join(" ")}`);
    const operation = command.arguments[0];
    const endpoint = command.arguments[1] ?? "";
    if (operation === "deploy") {
      return ok(JSON.stringify({ id: `dpl_${application}_candidate` }));
    }
    if (operation === "promote") {
      if (options.ambiguousPromotion?.application === application) {
        if (options.ambiguousPromotion.outcome === "signal_during_mutation") {
          const signal = (
            command as VercelProductionBaselineProviderCommand & {
              signal?: AbortSignal;
            }
          ).signal;
          return new Promise((resolve) => {
            signal?.addEventListener(
              "abort",
              () => resolve({
                error: new Error("provider command canceled"),
                exitCode: 1,
                stderr: "provider command canceled",
                stdout: "",
              }),
              { once: true },
            );
            queueMicrotask(() => provider.requestStop());
            if (!signal) {
              resolve({
                error: new Error("provider command has no cancellation signal"),
                exitCode: 1,
                stderr: "provider command has no cancellation signal",
                stdout: "",
              });
            }
          });
        }
        promoted.add(application);
        if (options.ambiguousPromotion.outcome === "signal_after_success") {
          provider.requestStop();
          return ok(JSON.stringify({ outcome: "requested" }));
        }
        return {
          error: new Error("provider command timed out"),
          exitCode: 1,
          stderr: "promotion timeout after provider acceptance",
          stdout: "",
        };
      }
      if (options.failPromotion === application && !failed) {
        failed = true;
        return { exitCode: 1, stderr: "promotion timeout", stdout: "" };
      }
      promoted.add(application);
      return ok(JSON.stringify({ outcome: "requested" }));
    }
    if (operation === "curl") {
      return ok(
        JSON.stringify(healthReadback(application, options.healthCheckedAt)),
      );
    }
    if (operation === "api" && endpoint.includes("/env?")) {
      return ok(JSON.stringify({ envs: [], hiddenProductionEnvCount: 0 }));
    }
    if (operation === "api" && endpoint.includes("/domains?")) {
      return ok(JSON.stringify(domainsReadback(application)));
    }
    if (operation === "api" && endpoint.startsWith("/v9/projects/")) {
      const current = promoted.has(application)
        ? {
            id: `dpl_${application}_candidate`,
            meta: { githubCommitSha: approvedSha },
            readyState: "READY",
          }
        : options.current?.[application];
      return ok(JSON.stringify(projectReadback(application, current)));
    }
    if (operation === "api" && endpoint.startsWith("/v13/deployments/")) {
      return ok(
        JSON.stringify(
          candidateReadback(
            application,
            promoted,
            options.omitPromotedAlias,
            options.candidateOverrides?.[application],
          ),
        ),
      );
    }
    throw new Error(`unexpected Vercel command: ${command.arguments.join(" ")}`);
  };
  const providerOptions = {
    approvedSha,
    config,
    environment: {
      CONVEX_DEPLOY_KEY: "must_not_escape",
      GH_TOKEN: "must_not_escape",
      GITHUB_REF: options.githubRef ?? "refs/heads/main",
      PATH: process.env.PATH,
      VERCEL_TOKEN: token,
    },
    now: () => new Date(checkedAt),
    receiptPath,
    releaseRunId,
    ...(options.remoteMainPolicy
      ? { remoteMainPolicy: options.remoteMainPolicy }
      : {}),
    repositoryRoot,
    run,
  };
  const provider = createVercelProductionBaselineProvider(providerOptions);
  return {
    commands,
    get concurrentReadsSettled() {
      return concurrentReadsSettled;
    },
    promoted,
    provider,
    receiptPath,
    repositoryRoot,
    root,
    setRemoteMain(sha: string, descendsFromApproved: boolean) {
      remoteMainSha = sha;
      remoteMainDescendsFromApproved = descendsFromApproved;
    },
  };
}

test("the provider accepts a detached checkout only when HEAD equals remote main", async () => {
  const testHarness = await harness({ repositoryBranch: "" });
  try {
    assert.deepEqual(
      await testHarness.provider.dependencies.inspectRepository(),
      { clean: true, sha: approvedSha },
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("attempt-one repository proof still rejects an advanced remote main", async () => {
  const testHarness = await harness();
  try {
    testHarness.setRemoteMain(advancedSha, true);
    assert.deepEqual(
      await testHarness.provider.dependencies.inspectRepository(),
      { clean: false, sha: approvedSha },
    );
    assert.equal(
      testHarness.commands.some(
        (command) => command.arguments[0] === "fetch",
      ),
      false,
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("the provider rejects a non-main workflow dispatch ref before commands", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-baseline-ref-"));
  const requestedRepositoryRoot = path.join(root, "repo");
  await mkdir(requestedRepositoryRoot, { recursive: true });
  const repositoryRoot = await import("node:fs/promises").then(({ realpath }) =>
    realpath(requestedRepositoryRoot),
  );
  let provider: ReturnType<typeof createVercelProductionBaselineProvider> | undefined;
  try {
    assert.throws(
      () => {
        provider = createVercelProductionBaselineProvider({
          approvedSha,
          config,
          environment: {
            GITHUB_REF: "refs/heads/not-main",
            PATH: process.env.PATH,
            VERCEL_TOKEN: token,
          },
          releaseRunId,
          repositoryRoot,
          run: () => ok(),
        });
      },
      /GITHUB_REF.*refs\/heads\/main/,
    );
  } finally {
    await provider?.cleanup();
    await rm(root, { force: true, recursive: true });
  }
});

test("the real adapter stages all three production targets with exact markers and isolated credentials", async () => {
  const testHarness = await harness();
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    assert.equal(receipt.content.applications.length, 3);
    assert.deepEqual(
      testHarness.commands
        .filter((command) => command.arguments[0] === "deploy")
        .map((command) => applicationForCommand(command)),
      applications,
    );
    assert.equal(
      testHarness.commands.some((command) => command.arguments[0] === "promote"),
      false,
    );
    for (const command of testHarness.commands.filter(
      (candidate) => candidate.command !== "git",
    )) {
      assert.equal(command.cwd, path.join(testHarness.provider.temporaryRoot, "checkout"));
      assert.notEqual(command.cwd, testHarness.repositoryRoot);
    }
    for (const command of testHarness.commands) {
      if (command.command === "git") {
        assert.equal(command.environment.VERCEL_TOKEN, undefined);
      } else {
        assert.equal(command.environment.VERCEL_TOKEN, token);
        assert.equal(command.environment.CONVEX_DEPLOY_KEY, undefined);
        assert.equal(command.environment.GH_TOKEN, undefined);
      }
    }
    for (const command of testHarness.commands.filter(
      (candidate) => candidate.arguments[0] === "deploy",
    )) {
      const application = applicationForCommand(command)!;
      assert.deepEqual(command.arguments.slice(0, 4), [
        "deploy",
        "--prod",
        "--skip-domain",
        "--project",
      ]);
      for (const marker of [
        `SOURCERA_COMMIT_SHA=${approvedSha}`,
        `SOURCERA_DOMAIN=${application}`,
        "SOURCERA_ENV=production",
        `SOURCERA_RELEASE_APPROVED_SHA=${approvedSha}`,
        `NEXT_PUBLIC_CONVEX_URL=${config.convexProduction.deploymentUrl}`,
      ]) {
        assert.ok(command.arguments.includes(marker), marker);
      }
      const mutationIndex = testHarness.commands.indexOf(command);
      const remoteMainRead = (candidate: VercelProductionBaselineProviderCommand) =>
        candidate.command === "git" &&
        candidate.arguments.join(" ") ===
          "ls-remote --exit-code origin refs/heads/main";
      assert.ok(testHarness.commands.slice(0, mutationIndex).some(remoteMainRead));
      assert.ok(testHarness.commands.slice(mutationIndex + 1).some(remoteMainRead));
    }
    const persisted = JSON.parse(await readFile(testHarness.receiptPath, "utf8"));
    assert.equal(persisted.sha256, receipt.sha256);
    assert.equal((await stat(testHarness.receiptPath)).mode & 0o777, 0o600);
  } finally {
    const temporaryRoot = testHarness.provider.temporaryRoot;
    await testHarness.provider.cleanup();
    await assert.rejects(access(temporaryRoot), /ENOENT/);
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("authenticated current-state readback accepts only absent or terminally failed production", async () => {
  const failed = await harness({
    current: {
      buyer: {
        id: "dpl_buyer_failed",
        meta: { githubCommitSha: previousSha },
        readyState: "ERROR",
      },
    },
  });
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: failed.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: failed.repositoryRoot,
    });
    assert.equal(receipt.content.applications[1]!.original.state, "failed");
  } finally {
    await failed.provider.cleanup();
    await rm(failed.root, { force: true, recursive: true });
  }

  const unknown = await harness({
    current: {
      buyer: {
        id: "dpl_buyer_building",
        meta: { githubCommitSha: previousSha },
        readyState: "BUILDING",
      },
    },
  });
  try {
    await assert.rejects(
      stageVercelProductionBaseline({
        approvedSha,
        config,
        dependencies: unknown.provider.dependencies,
        repositoryRoot: unknown.repositoryRoot,
      }),
      /not absent or terminally failed/,
    );
    assert.equal(
      unknown.commands.some((command) => command.arguments[0] === "deploy"),
      false,
    );
  } finally {
    await unknown.provider.cleanup();
    await rm(unknown.root, { force: true, recursive: true });
  }
});

test("deployment health must be generated inside the authenticated request window", async () => {
  const testHarness = await harness({
    healthCheckedAt: "2026-07-15T16:59:59.999Z",
  });
  try {
    await assert.rejects(
      stageVercelProductionBaseline({
        approvedSha,
        config,
        dependencies: testHarness.provider.dependencies,
        now: () => new Date(checkedAt),
        repositoryRoot: testHarness.repositoryRoot,
      }),
      /health proof does not match/,
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("activation resumes the exact healthy prefix and writes no rollback claim", async () => {
  const testHarness = await harness();
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    testHarness.promoted.add("marketplace");
    const activated = await resumeVercelProductionBaseline({
      config,
      dependencies: testHarness.provider.dependencies,
      expectedStageReceiptSha256: receipt.sha256,
      now: () => new Date(checkedAt),
      receipt,
      repositoryRoot: testHarness.repositoryRoot,
    });
    assert.equal(activated.result, "passed");
    assert.equal(activated.rollbackClaimed, false);
    assert.deepEqual(
      testHarness.commands
        .filter((command) => command.arguments[0] === "promote")
        .map((command) => applicationForCommand(command)),
      ["buyer", "seller"],
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("attempt-two recovery resumes the same partial receipt after remote main advances", async () => {
  const testHarness = await harness({
    remoteMainPolicy: "descendant-recovery",
  });
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    testHarness.promoted.add("marketplace");
    testHarness.setRemoteMain(advancedSha, true);

    const activated = await resumeVercelProductionBaseline({
      config,
      dependencies: testHarness.provider.dependencies,
      expectedStageReceiptSha256: receipt.sha256,
      now: () => new Date(checkedAt),
      receipt,
      repositoryRoot: testHarness.repositoryRoot,
    });

    assert.equal(activated.result, "passed");
    assert.deepEqual(
      testHarness.commands
        .filter((command) => command.arguments[0] === "promote")
        .map((command) => applicationForCommand(command)),
      ["buyer", "seller"],
    );
    assert.ok(
      testHarness.commands.some(
        (command) =>
          command.command === "git" &&
          command.arguments.join(" ") ===
            "fetch --no-tags --force origin refs/heads/main",
      ),
    );
    assert.ok(
      testHarness.commands.some(
        (command) =>
          command.command === "git" &&
          command.arguments.join(" ") ===
            `merge-base --is-ancestor ${approvedSha} ${advancedSha}`,
      ),
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("attempt-two recovery rejects a divergent remote main before promotion", async () => {
  const testHarness = await harness({
    remoteMainPolicy: "descendant-recovery",
  });
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    testHarness.promoted.add("marketplace");
    testHarness.setRemoteMain(advancedSha, false);

    await assert.rejects(
      resumeVercelProductionBaseline({
        config,
        dependencies: testHarness.provider.dependencies,
        expectedStageReceiptSha256: receipt.sha256,
        now: () => new Date(checkedAt),
        receipt,
        repositoryRoot: testHarness.repositoryRoot,
      }),
      /remote main|descend|repository SHA/,
    );
    assert.equal(
      testHarness.commands.some(
        (command) => command.arguments[0] === "promote",
      ),
      false,
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("a promoted candidate must own every pinned production alias", async () => {
  const testHarness = await harness({ omitPromotedAlias: "buyer" });
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    testHarness.promoted.add("buyer");
    const staged = receipt.content.applications[1]!;
    await assert.rejects(
      async () =>
        testHarness.provider.dependencies.inspectApplication(
          "buyer",
          staged.target,
          staged.candidate.deploymentId,
        ),
      /every pinned production domain/,
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("baseline staged readback requires exact no-traffic alias evidence", async () => {
  const invalidReadbacks: Array<[string, Record<string, unknown>]> = [
    ["missing alias assignment state", { aliasAssigned: undefined }],
    ["assigned alias state", { aliasAssigned: true }],
    ["unrelated assigned alias", { alias: ["preview.example.com"] }],
    ["non-array alias", { alias: "preview.example.com" }],
    ["non-array automatic aliases", { automaticAliases: "preview.example.com" }],
    ["malformed user aliases", { userAliases: [42] }],
  ];

  for (const [name, override] of invalidReadbacks) {
    const testHarness = await harness({
      candidateOverrides: { marketplace: override },
    });
    try {
      await assert.rejects(
        stageVercelProductionBaseline({
          approvedSha,
          config,
          dependencies: testHarness.provider.dependencies,
          now: () => new Date(checkedAt),
          repositoryRoot: testHarness.repositoryRoot,
        }),
        /candidate deployment readback is invalid|alias|production traffic/i,
        name,
      );
    } finally {
      await testHarness.provider.cleanup();
      await rm(testHarness.root, { force: true, recursive: true });
    }
  }
});

test("a stop during an active mutation returns unknown recovery immediately", async () => {
  const testHarness = await harness({
    ambiguousPromotion: {
      application: "marketplace",
      outcome: "signal_during_mutation",
    },
  });
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    const started = Date.now();
    const activated = await resumeVercelProductionBaseline({
      config,
      dependencies: testHarness.provider.dependencies,
      expectedStageReceiptSha256: receipt.sha256,
      now: () => new Date(checkedAt),
      receipt,
      repositoryRoot: testHarness.repositoryRoot,
    });
    assert.equal(activated.result, "recovery_required");
    assert.equal(activated.trafficMutated, "unknown");
    assert.equal(activated.rollbackClaimed, false);
    assert.ok(Date.now() - started < 1_000);
    assert.deepEqual(activated.states, {
      buyer: "readback_failed",
      marketplace: "readback_failed",
      seller: "readback_failed",
    });
    const activationReceiptPath = path.join(
      testHarness.root,
      "activation-recovery.json",
    );
    await writeActivationReceipt(
      activationReceiptPath,
      activated as unknown as Record<string, unknown>,
      testHarness.repositoryRoot,
    );
    const persisted = JSON.parse(
      await readFile(activationReceiptPath, "utf8"),
    );
    assert.equal(persisted.result, "recovery_required");
    assert.equal(persisted.trafficMutated, "unknown");
    assert.equal(persisted.rollbackClaimed, false);
    assert.equal((await stat(activationReceiptPath)).mode & 0o777, 0o600);
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("canceled worktree creation is still removed and pruned", async () => {
  const testHarness = await harness({ cancelWorktreeAdd: true });
  let cleaned = false;
  try {
    await assert.rejects(
      stageVercelProductionBaseline({
        approvedSha,
        config,
        dependencies: testHarness.provider.dependencies,
        now: () => new Date(checkedAt),
        repositoryRoot: testHarness.repositoryRoot,
      }),
      /worktree add canceled|create detached baseline worktree failed/,
    );
    await testHarness.provider.cleanup();
    cleaned = true;
    assert.equal(
      testHarness.commands.some(
        (command) =>
          command.command === "git" &&
          command.arguments[0] === "worktree" &&
          command.arguments[1] === "remove",
      ),
      true,
    );
    assert.equal(
      testHarness.commands.some(
        (command) =>
          command.command === "git" &&
          command.arguments.join(" ") === "worktree prune",
      ),
      true,
    );
  } finally {
    if (!cleaned) await testHarness.provider.cleanup().catch(() => undefined);
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("cleanup waits for every concurrent provider command", async () => {
  const testHarness = await harness({ concurrentRepositoryReads: true });
  let cleaned = false;
  try {
    await assert.rejects(
      async () => testHarness.provider.dependencies.inspectRepository(),
      /repository read \d canceled|failed/,
    );
    await testHarness.provider.cleanup();
    cleaned = true;
    assert.equal(testHarness.concurrentReadsSettled, 5);
  } finally {
    if (!cleaned) await testHarness.provider.cleanup().catch(() => undefined);
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("post-publication cleanup failure preserves the exact stage receipt for recovery", async () => {
  const testHarness = await harness();
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: testHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: testHarness.repositoryRoot,
    });
    const baselineModule = await import(
      "../../scripts/stage-vercel-production-baseline"
    );
    const cleanup = (
      baselineModule as unknown as {
        cleanupVercelProductionBaselineStage(
          cleanupProvider: () => Promise<void>,
          options: {
            primaryError?: unknown;
            receiptPublished: boolean;
            warn?: (message: string) => void;
          },
        ): Promise<void>;
      }
    ).cleanupVercelProductionBaselineStage;
    const warnings: string[] = [];

    await cleanup(
      async () => {
        throw new Error("private worktree prune failed");
      },
      {
        receiptPublished: true,
        warn: (message) => warnings.push(message),
      },
    );

    assert.equal(
      JSON.parse(await readFile(testHarness.receiptPath, "utf8")).sha256,
      receipt.sha256,
    );
    assert.match(warnings.join("\n"), /receipt.*retained.*recovery/i);
    await assert.rejects(
      cleanup(
        async () => {
          throw new Error("pre-receipt cleanup failed");
        },
        { receiptPublished: false },
      ),
      /pre-receipt cleanup failed/,
    );
  } finally {
    await testHarness.provider.cleanup();
    await rm(testHarness.root, { force: true, recursive: true });
  }
});

test("the default runner promptly kills an active mutation process tree", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-baseline-kill-"));
  const repositoryRoot = path.join(root, "repo");
  const remoteRoot = path.join(root, "origin.git");
  const pidPath = path.join(root, "mutation.pid");
  const descendantPidPath = path.join(root, "mutation-descendant.pid");
  const executable = path.join(root, "fake-vercel.mjs");
  let provider: ReturnType<typeof createVercelProductionBaselineProvider> | undefined;
  const pids: number[] = [];
  try {
    await mkdir(repositoryRoot, { recursive: true });
    runLocal("git", ["init", "--bare", "--initial-branch=main", remoteRoot], root);
    runLocal("git", ["init", "--initial-branch=main"], repositoryRoot);
    await writeFile(path.join(repositoryRoot, "README.md"), "baseline\n");
    runLocal("git", ["add", "README.md"], repositoryRoot);
    runLocal(
      "git",
      [
        "-c",
        "user.name=Sourcera Test",
        "-c",
        "user.email=test@sourcera.local",
        "commit",
        "-m",
        "baseline",
      ],
      repositoryRoot,
    );
    runLocal("git", ["remote", "add", "origin", remoteRoot], repositoryRoot);
    runLocal("git", ["push", "-u", "origin", "main"], repositoryRoot);
    const dynamicApprovedSha = runLocal(
      "git",
      ["rev-parse", "HEAD"],
      repositoryRoot,
    );
    runLocal("git", ["checkout", "--detach", dynamicApprovedSha], repositoryRoot);
    await writeFile(
      executable,
      `#!/usr/bin/env node\n` +
        `import { spawn } from "node:child_process";\n` +
        `import { writeFileSync } from "node:fs";\n` +
        `if (process.argv[2] === "--version") { console.log("Vercel CLI 56.2.0"); process.exit(0); }\n` +
        `if (process.argv[2] === "promote") {\n` +
        `  spawn(process.execPath, ["-e", ${JSON.stringify(
          `const { writeFileSync } = require("node:fs"); process.on("SIGTERM", () => {}); writeFileSync(${JSON.stringify(descendantPidPath)}, String(process.pid)); setInterval(() => {}, 1000);`,
        )}], { stdio: "ignore" });\n` +
        `  writeFileSync(${JSON.stringify(pidPath)}, String(process.pid));\n` +
        `  setInterval(() => {}, 1000);\n` +
        `} else { process.exit(2); }\n`,
      { mode: 0o700 },
    );
    await chmod(executable, 0o700);
    provider = createVercelProductionBaselineProvider({
      approvedSha: dynamicApprovedSha,
      config,
      environment: {
        GITHUB_REF: "refs/heads/main",
        PATH: process.env.PATH,
        VERCEL_TOKEN: token,
      },
      releaseRunId,
      repositoryRoot,
      vercelExecutable: executable,
    });
    const target = targetForApplication("marketplace") as VercelProductionTarget;
    const mutation = provider.dependencies.promoteApplication(
      "marketplace",
      target,
      "dpl_marketplace_candidate",
    );
    await waitForFile(pidPath, 2_000);
    await waitForFile(descendantPidPath, 2_000);
    const childPid = Number(await readFile(pidPath, "utf8"));
    const descendantPid = Number(await readFile(descendantPidPath, "utf8"));
    pids.push(childPid, descendantPid);
    const stoppedAt = Date.now();
    provider.requestStop();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await assert.rejects(
        Promise.race([
          mutation,
          new Promise((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error("active mutation did not stop promptly")),
              3_000,
            );
          }),
        ]),
        (error: unknown) =>
          error instanceof AggregateError &&
          error.errors.some((entry) => /promotion failed/.test(String(entry))) &&
          error.errors.some((entry) => /stop requested/.test(String(entry))),
      );
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    assert.ok(Date.now() - stoppedAt < 3_000);
    await waitForProcessExit(childPid, 1_000);
    await waitForProcessExit(descendantPid, 1_000);
  } finally {
    await provider?.cleanup();
    for (const pid of pids) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        // Already terminated.
      }
    }
    await rm(root, { force: true, recursive: true });
  }
});

for (const outcome of [
  "timeout_after_success",
  "signal_after_success",
] as const) {
  test(`activation reconciles ${outcome.replaceAll("_", " ")} as recovery required`, async () => {
    const testHarness = await harness({
      ambiguousPromotion: { application: "marketplace", outcome },
    });
    try {
      const receipt = await stageVercelProductionBaseline({
        approvedSha,
        config,
        dependencies: testHarness.provider.dependencies,
        now: () => new Date(checkedAt),
        repositoryRoot: testHarness.repositoryRoot,
      });
      const activated = await resumeVercelProductionBaseline({
        config,
        dependencies: testHarness.provider.dependencies,
        expectedStageReceiptSha256: receipt.sha256,
        now: () => new Date(checkedAt),
        receipt,
        repositoryRoot: testHarness.repositoryRoot,
      });
      assert.equal(activated.result, "recovery_required");
      if (outcome === "signal_after_success") {
        assert.equal(activated.trafficMutated, "unknown");
        assert.deepEqual(activated.states, {
          buyer: "readback_failed",
          marketplace: "readback_failed",
          seller: "readback_failed",
        });
      } else {
        assert.equal(activated.trafficMutated, true);
        assert.equal(activated.states.marketplace, "candidate_live_healthy");
      }
      assert.equal(activated.rollbackClaimed, false);
      assert.deepEqual(
        testHarness.commands
          .filter((command) => command.arguments[0] === "promote")
          .map((command) => applicationForCommand(command)),
        ["marketplace"],
      );
      assert.equal(
        testHarness.commands.some((command) =>
          command.arguments.some((argument) => /rollback/i.test(argument)),
        ),
        false,
      );
      const promotionIndex = testHarness.commands.findIndex(
        (command) => command.arguments[0] === "promote",
      );
      if (outcome === "timeout_after_success") {
        assert.ok(
          testHarness.commands.slice(promotionIndex + 1).some(
            (command) =>
              command.command === "git" &&
              command.arguments.join(" ") ===
                "ls-remote --exit-code origin refs/heads/main",
          ),
          "remote main must be reread after an ambiguous provider timeout",
        );
      } else {
        assert.equal(
          testHarness.commands.slice(promotionIndex + 1).some(
            (command) => command.arguments[0] === "api",
          ),
          false,
          "signal handling must leave live reconciliation to an exact retry",
        );
      }
    } finally {
      await testHarness.provider.cleanup();
      await rm(testHarness.root, { force: true, recursive: true });
    }
  });
}

test("workflow evidence binds exact attempt-one bytes while activation retries retain the source identity", async () => {
  const fixture = await workflowEvidenceFixture();
  try {
    const staged = await validateVercelProductionBaselineWorkflowEvidence(
      fixture.arguments,
      fixture.environment,
      { allowActivationRetry: false },
    );
    assert.equal(staged.currentAttempt, 1);
    assert.equal(staged.binding.identity.runAttempt, 1);

    const retryEnvironment = {
      ...fixture.environment,
      GITHUB_RUN_ATTEMPT: "3",
    };
    const retried = await validateVercelProductionBaselineWorkflowEvidence(
      fixture.arguments,
      retryEnvironment,
      { allowActivationRetry: true },
    );
    assert.equal(retried.currentAttempt, 3);
    assert.deepEqual(retried.binding, staged.binding);
    await assert.rejects(
      validateVercelProductionBaselineWorkflowEvidence(
        fixture.arguments,
        retryEnvironment,
        { allowActivationRetry: false },
      ),
      /restricted to workflow attempt 1/,
    );

    await writeFile(fixture.githubProofPath, `${fixture.githubProofRaw} `);
    await assert.rejects(
      validateVercelProductionBaselineWorkflowEvidence(
        fixture.arguments,
        retryEnvironment,
        { allowActivationRetry: true },
      ),
      /not bound|does not match/,
    );
  } finally {
    await rm(fixture.root, { force: true, recursive: true });
  }
});

test("malformed or provenance-free stage artifacts produce unknown recovery receipts before Vercel access", async () => {
  const fixture = await workflowEvidenceFixture();
  const stageHarness = await harness();
  let unboundReceipt: VercelProductionBaselineStageReceipt;
  try {
    unboundReceipt = await stageVercelProductionBaseline({
      approvedSha,
      config,
      dependencies: stageHarness.provider.dependencies,
      now: () => new Date(checkedAt),
      repositoryRoot: stageHarness.repositoryRoot,
    });
  } finally {
    await stageHarness.provider.cleanup();
    await rm(stageHarness.root, { force: true, recursive: true });
  }
  const inputs = [
    ["malformed", "{\n"],
    ["missing-provenance", `${JSON.stringify(unboundReceipt, null, 2)}\n`],
  ] as const;
  const environment = {
    ...fixture.environment,
    GITHUB_RUN_ATTEMPT: "2",
    SOURCERA_STAGE_ARTIFACT_DIGEST: "e".repeat(64),
  };
  const previousEnvironment = new Map(
    Object.keys(environment).map((key) => [key, process.env[key]]),
  );
  const previousExitCode = process.exitCode;
  try {
    Object.assign(process.env, environment);
    for (const [name, raw] of inputs) {
      const stageReceiptPath = path.join(fixture.root, `${name}-stage.json`);
      const receiptPath = path.join(fixture.root, `${name}-activation.json`);
      await writeFile(stageReceiptPath, raw, { mode: 0o600 });
      await activateMain([
        "--preflight-dir",
        fixture.arguments.preflightDirectory,
        "--github-proof",
        fixture.arguments.githubProofPath,
        "--github-approval",
        fixture.arguments.githubApprovalPath,
        "--github-handoff",
        fixture.arguments.githubHandoffPath,
        "--stage-receipt",
        stageReceiptPath,
        "--receipt-out",
        receiptPath,
      ]);
      const activation = JSON.parse(await readFile(receiptPath, "utf8"));
      assert.equal(activation.result, "recovery_required");
      assert.equal(activation.trafficMutated, "unknown");
      assert.equal(activation.rollbackClaimed, false);
    }
  } finally {
    for (const [key, value] of previousEnvironment) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    process.exitCode = previousExitCode;
    await rm(fixture.root, { force: true, recursive: true });
  }

  const safeFailure = createActivationFailureReceipt({
    error: new Error("pre-stage validation failed"),
    trafficMutated: false,
  });
  assert.equal(safeFailure.result, "failed");
  assert.equal(safeFailure.trafficMutated, false);
});

test("receipt arguments are external, distinct, exact-hash bound, private, and non-overwriting", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-baseline-cli-"));
  const repositoryRoot = path.join(root, "repo");
  const evidence = path.join(root, "evidence");
  await import("node:fs/promises").then(({ mkdir }) =>
    Promise.all([
      mkdir(repositoryRoot, { recursive: true }),
      mkdir(evidence, { recursive: true }),
    ]),
  );
  try {
    const stagePath = path.join(evidence, "stage.json");
    const activationPath = path.join(evidence, "activation.json");
    assert.equal(
      readStageArguments(["--receipt-out", stagePath], repositoryRoot)
        .receiptPath,
      await import("node:fs/promises").then(({ realpath }) =>
        realpath(evidence).then((directory) => path.join(directory, "stage.json")),
      ),
    );
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(stagePath, "{}\n", { mode: 0o600 }),
    );
    const activation = readActivationArguments(
      [
        "--stage-receipt",
        stagePath,
        "--stage-receipt-sha256",
        "a".repeat(64),
        "--receipt-out",
        activationPath,
      ],
      repositoryRoot,
    );
    assert.equal(
      activation.receiptPath,
      await import("node:fs/promises").then(({ realpath }) =>
        realpath(evidence).then((directory) =>
          path.join(directory, "activation.json"),
        ),
      ),
    );
    assert.throws(
      () =>
        readActivationArguments(
          [
            "--stage-receipt",
            stagePath,
            "--stage-receipt-sha256",
            "a".repeat(64),
            "--receipt-out",
            stagePath,
          ],
          repositoryRoot,
        ),
      /distinct/,
    );
    assert.throws(
      () => readStageArguments(["--receipt-out", path.join(repositoryRoot, "x")], repositoryRoot),
      /outside the repository/,
    );

    const stageHarness = await harness();
    let receipt: VercelProductionBaselineStageReceipt;
    try {
      receipt = await stageVercelProductionBaseline({
        approvedSha,
        config,
        dependencies: stageHarness.provider.dependencies,
        now: () => new Date(checkedAt),
        repositoryRoot: stageHarness.repositoryRoot,
      });
    } finally {
      await stageHarness.provider.cleanup();
      await rm(stageHarness.root, { force: true, recursive: true });
    }
    const raw = `${JSON.stringify(receipt, null, 2)}\n`;
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(stagePath, raw, { mode: 0o600 }),
    );
    const crypto = await import("node:crypto");
    const rawSha = crypto.createHash("sha256").update(raw).digest("hex");
    const exact = await readExactStageReceipt(stagePath, rawSha);
    assert.equal(exact.receipt.sha256, receipt.sha256);
    await assert.rejects(readExactStageReceipt(stagePath, "0".repeat(64)), /exact bytes/);

    await writeActivationReceipt(activationPath, {
      event: "vercel_production_baseline_failure_receipt",
      result: "failed",
      rollbackClaimed: false,
    });
    assert.equal((await stat(activationPath)).mode & 0o777, 0o600);
    await assert.rejects(
      writeActivationReceipt(activationPath, {
        event: "vercel_production_baseline_failure_receipt",
        result: "failed",
        rollbackClaimed: false,
      }),
      /already exists/,
    );
    await access(activationPath, constants.R_OK);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
