import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  readProductionReleaseConfig,
  validateProductionGithubApprovalEvidence,
} from "../../scripts/lib/production-release-controller";
import {
  createVercelProductionBaselineGithubHandoff,
  readVercelProductionBaselineGithubHandoff,
} from "../../scripts/lib/vercel-production-baseline-workflow";
import { main as baselineGithubMain } from "../../scripts/vercel-production-baseline-github";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const identity = {
  approvedSha,
  repository: "meetblakey/sourcera" as const,
  runAttempt: 1,
  runId: 4242,
};
const workflowPath = ".github/workflows/vercel-production-baseline.yml";
const preflightArtifactDigest = "c".repeat(64);

const config = {
  schemaVersion: 1,
  repository: { branch: "main", name: "sourcera", owner: "meetblakey" },
  github: {
    actionsAppId: 15368,
    approver: { id: 15627406, login: "meetblakey" },
    authorityWorkflowLineage: [
      {
        authorityKind: "normal",
        path: ".github/workflows/production-release.yml",
        workflowSha256: "1".repeat(64),
      },
      {
        authorityKind: "convex_anchor",
        path: ".github/workflows/production-bootstrap-recovery.yml",
        workflowSha256: "2".repeat(64),
      },
      {
        authorityKind: "vercel_baseline",
        path: ".github/workflows/vercel-production-baseline.yml",
        workflowSha256: "3".repeat(64),
      },
    ],
    baselineWorkflow: workflowPath,
    bootstrapWorkflow: ".github/workflows/production-bootstrap-recovery.yml",
    collaborators: [{ id: 15627406, login: "meetblakey" }],
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
    rulesets: [],
    workflow: ".github/workflows/production-release.yml",
  },
  proofCollection: {
    coordinator: null,
    decision: "DEC-PROD-002",
    isolatedCandidateConvex: null,
    mode: "blocked",
  },
  tooling: { vercelCli: "56.2.0" },
};

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function baselineGithubProof() {
  const checks = config.github.requiredChecks.map(({ name, workflow }, index) => ({
    app: { id: config.github.actionsAppId },
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
        checks: config.github.requiredChecks.map(({ name }) => ({
          app_id: config.github.actionsAppId,
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
        id: config.github.approver.id,
        login: config.github.approver.login,
        permissions: { admin: true, pull: true, push: true },
      },
    ],
    environment: {
      can_admins_bypass: false,
      deployment_branch_policy: {
        custom_branch_policies: false,
        protected_branches: true,
      },
      name: config.github.environment,
      protection_rules: [
        {
          prevent_self_review: false,
          reviewers: [{ reviewer: config.github.approver, type: "User" }],
          type: "required_reviewers",
        },
        { type: "branch_policy" },
      ],
    },
    ref: { object: { sha: approvedSha }, ref: "refs/heads/main" },
    repository: "meetblakey/sourcera",
    reviewHistory: [
      {
        environments: [{ name: config.github.environment }],
        state: "approved",
        user: config.github.approver,
      },
    ],
    rulesets: [],
    run: {
      actor: config.github.approver,
      event: "workflow_dispatch",
      head_branch: "main",
      head_sha: approvedSha,
      id: identity.runId,
      path: workflowPath,
      run_attempt: 1,
      status: "in_progress",
    },
    workflowRuns: config.github.requiredChecks.map(
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

function protectedReviewerProof(githubProofRaw: string) {
  return JSON.stringify({
    approval: { reviewer: config.github.approver, state: "approved" },
    approvedSha,
    checkedAt: "2026-07-15T20:00:00.000Z",
    environment: config.github.environment,
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: approvedSha, id: identity.runId },
    schemaVersion: 1,
    sourceProofSha256: sha256(githubProofRaw),
  });
}

test("release config pins the separate Vercel first-baseline workflow", () => {
  assert.equal(
    readProductionReleaseConfig(config).github.baselineWorkflow,
    workflowPath,
  );
  assert.throws(
    () =>
      readProductionReleaseConfig({
        ...config,
        github: { ...config.github, baselineWorkflow: config.github.workflow },
      }),
    /baselineWorkflow/,
  );
});

test("baseline GitHub proof requires exact main SHA, protected checks, and approval", () => {
  const parsed = readProductionReleaseConfig(config);
  const proof = baselineGithubProof();
  assert.deepEqual(
    validateProductionGithubApprovalEvidence(
      proof,
      parsed,
      approvedSha,
      undefined,
      "baseline",
    ),
    { knownGoodConvexSha256: undefined, runAttempt: 1, runId: identity.runId },
  );
  assert.throws(
    () =>
      validateProductionGithubApprovalEvidence(
        proof,
        parsed,
        approvedSha,
        "f".repeat(40),
        "baseline",
      ),
    /cannot use a known-good SHA/,
  );

  for (const invalid of [
    { ...proof, knownGood: {} },
    { ...proof, run: { ...proof.run, path: config.github.workflow } },
    { ...proof, run: { ...proof.run, run_attempt: 2 } },
    { ...proof, ref: { object: { sha: "f".repeat(40) }, ref: "refs/heads/main" } },
    { ...proof, reviewHistory: [] },
  ]) {
    assert.throws(
      () =>
        validateProductionGithubApprovalEvidence(
          invalid,
          parsed,
          approvedSha,
          undefined,
          "baseline",
        ),
      /GitHub|baseline|approval|main ref/,
    );
  }
});

test("baseline handoff binds exact no-secret proof bytes and forward-only authority", () => {
  const githubProofRaw = `${JSON.stringify(baselineGithubProof())}\n`;
  const reviewerProofRaw = protectedReviewerProof(githubProofRaw);
  const preflightReceiptRaw = `${JSON.stringify({
    event: "production_release_preflight_receipt",
    identity,
    proofSha256: {
      appVerification: "1".repeat(64),
      delivery: "2".repeat(64),
      exact: "3".repeat(64),
      repository: "4".repeat(64),
      stamp: "5".repeat(64),
    },
    result: "passed",
    schemaVersion: 1,
  })}\n`;
  const reason = "Create the first healthy Vercel production baseline";
  const handoff = createVercelProductionBaselineGithubHandoff({
    forwardOnlyAcknowledged: true,
    githubProofRaw,
    identity,
    preflightArtifactDigest,
    preflightReceiptRaw,
    protectedReviewerProofRaw: reviewerProofRaw,
    reason,
  });

  assert.deepEqual(Object.keys(handoff).sort(), [
    "event",
    "forwardOnlyAcknowledged",
    "githubProofSha256",
    "identity",
    "preflightArtifactDigest",
    "preflightReceiptSha256",
    "protectedReviewerProofSha256",
    "reasonSha256",
    "result",
    "schemaVersion",
    "workflowPath",
  ]);
  assert.equal(handoff.event, "vercel_production_baseline_github_handoff");
  assert.equal(handoff.workflowPath, workflowPath);
  assert.equal(handoff.githubProofSha256, sha256(githubProofRaw));
  assert.equal(handoff.protectedReviewerProofSha256, sha256(reviewerProofRaw));
  assert.equal(handoff.preflightReceiptSha256, sha256(preflightReceiptRaw));
  assert.equal(handoff.reasonSha256, sha256(reason));
  assert.equal(handoff.forwardOnlyAcknowledged, true);
  assert.doesNotMatch(
    JSON.stringify(handoff),
    /knownGood|convex|predecessor|rollback/i,
  );

  assert.deepEqual(
    readVercelProductionBaselineGithubHandoff(handoff, {
      forwardOnlyAcknowledged: true,
      githubProofRaw,
      identity,
      preflightArtifactDigest,
      preflightReceiptRaw,
      protectedReviewerProofRaw: reviewerProofRaw,
      reason,
    }),
    handoff,
  );

  for (const expected of [
    { githubProofRaw: `${githubProofRaw} ` },
    { preflightReceiptRaw: `${preflightReceiptRaw} ` },
    { protectedReviewerProofRaw: `${reviewerProofRaw} ` },
    { reason: `${reason}.` },
  ]) {
    assert.throws(
      () =>
        readVercelProductionBaselineGithubHandoff(handoff, {
          forwardOnlyAcknowledged: true,
          githubProofRaw,
          identity,
          preflightArtifactDigest,
          preflightReceiptRaw,
          protectedReviewerProofRaw: reviewerProofRaw,
          reason,
          ...expected,
        }),
      /does not match|not bound|hash/,
    );
  }
  assert.throws(
    () =>
      readVercelProductionBaselineGithubHandoff(
        { ...handoff, knownGoodSha: "f".repeat(40) },
        {
          forwardOnlyAcknowledged: true,
          githubProofRaw,
          identity,
          preflightArtifactDigest,
          preflightReceiptRaw,
          protectedReviewerProofRaw: reviewerProofRaw,
          reason,
        },
      ),
    /unexpected fields/,
  );
  assert.throws(
    () =>
      createVercelProductionBaselineGithubHandoff({
        forwardOnlyAcknowledged: false,
        githubProofRaw,
        identity,
        preflightArtifactDigest,
        preflightReceiptRaw,
        protectedReviewerProofRaw: reviewerProofRaw,
        reason,
      }),
    /forward-only/,
  );

  const wrongRunPreflightRaw = preflightReceiptRaw.replace(
    `"runId":${identity.runId}`,
    '"runId":9999',
  );
  assert.throws(
    () =>
      createVercelProductionBaselineGithubHandoff({
        forwardOnlyAcknowledged: true,
        githubProofRaw,
        identity,
        preflightArtifactDigest,
        preflightReceiptRaw: wrongRunPreflightRaw,
        protectedReviewerProofRaw: reviewerProofRaw,
        reason,
      }),
    /preflight identity/,
  );

  const wrongWorkflowProofRaw = `${JSON.stringify({
    ...baselineGithubProof(),
    run: {
      ...baselineGithubProof().run,
      path: config.github.workflow,
    },
  })}\n`;
  assert.throws(
    () =>
      createVercelProductionBaselineGithubHandoff({
        forwardOnlyAcknowledged: true,
        githubProofRaw: wrongWorkflowProofRaw,
        identity,
        preflightArtifactDigest,
        preflightReceiptRaw,
        protectedReviewerProofRaw: protectedReviewerProof(wrongWorkflowProofRaw),
        reason,
      }),
    /workflow approval/,
  );
});

test("baseline GitHub lane rejects provider credentials before collection", async () => {
  const previous = process.env.VERCEL_TOKEN;
  process.env.VERCEL_TOKEN = "forbidden";
  try {
    await assert.rejects(baselineGithubMain([]), /forbids VERCEL_TOKEN/);
  } finally {
    if (previous === undefined) delete process.env.VERCEL_TOKEN;
    else process.env.VERCEL_TOKEN = previous;
  }
});
