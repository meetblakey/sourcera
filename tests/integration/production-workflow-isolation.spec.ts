import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkout =
  "actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0";
const setupNode =
  "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020";
const uploadArtifact =
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";
const downloadArtifact =
  "actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c";

function job(workflow: string, name: string) {
  const start = workflow.indexOf(`  ${name}:`);
  assert.notEqual(start, -1, `${name} job is missing`);
  const rest = workflow.slice(start + 1);
  const match = /\n  [a-z][a-z0-9_-]*:\n/.exec(rest);
  return workflow.slice(start, match ? start + 1 + match.index : undefined);
}

function assertPinnedRuntime(workflow: string) {
  for (const action of [checkout, setupNode, uploadArtifact, downloadArtifact]) {
    assert.match(workflow, new RegExp(action));
  }
  assert.doesNotMatch(
    workflow,
    /uses:\s+actions\/(?:checkout|setup-node|upload-artifact|download-artifact)@v\d/,
  );
  assert.match(workflow, /node-version:\s+'24\.16\.0'/);
  assert.match(workflow, /test "\$\(node --version\)" = "v24\.16\.0"/);
  assert.match(workflow, /test "\$\(npm --version\)" = "11\.13\.0"/);
  const checkoutCount = workflow.match(/uses:\s+actions\/checkout@/g)?.length ?? 0;
  const immutableRefCount =
    workflow.match(/ref:\s+\$\{\{ github\.sha \}\}/g)?.length ?? 0;
  assert.ok(checkoutCount > 0);
  assert.equal(immutableRefCount, checkoutCount);
  assert.doesNotMatch(workflow, /ref:\s+main/);
  const preflight = job(workflow, "preflight");
  assert.match(
    preflight,
    /SOURCERA_RELEASE_DISPATCH_REF:\s+\$\{\{ github\.ref \}\}/,
  );
  assert.match(
    preflight,
    /test "\$SOURCERA_RELEASE_DISPATCH_REF" = "refs\/heads\/main"/,
  );
}

function assertCredentialIsolation(workflow: string) {
  const preflight = job(workflow, "preflight");
  assert.doesNotMatch(preflight, /environment:|secrets\.|CONVEX_DEPLOY_KEY|VERCEL_TOKEN/);
  assert.match(preflight, /npm run release:production:preflight/);

  const hasApproval = workflow.includes("  approval:");
  if (hasApproval) {
    const approval = job(workflow, "approval");
    assert.match(approval, /environment:\s+sourcera-production-release/);
    assert.match(approval, /SOURCERA_RELEASE_GITHUB_TOKEN:\s+\$\{\{ secrets\.SOURCERA_RELEASE_GITHUB_TOKEN \}\}/);
    assert.doesNotMatch(
      approval,
      /CONVEX_DEPLOY_KEY|SOURCERA_CONVEX_CANARY_SECRET|VERCEL_TOKEN/,
    );
    assert.match(approval, /npm run release:production:github/);
  }

  const blocked = job(workflow, "blocked");
  assert.match(blocked, /environment:\s+sourcera-production-release/);
  assert.match(blocked, /npm run release:production:(?:blocked|no-authority)/);
  assert.doesNotMatch(
    blocked,
    /secrets\.|CONVEX_DEPLOY_KEY|SOURCERA_CONVEX_CANARY_SECRET|VERCEL_TOKEN|SOURCERA_RELEASE_GITHUB_TOKEN|GH_TOKEN|\bGITHUB_TOKEN:/,
  );

  assert.doesNotMatch(preflight, /TOKEN|DEPLOY_KEY|CANARY_SECRET/);
  if (hasApproval) {
    const approval = job(workflow, "approval");
    assert.match(approval, /SOURCERA_RELEASE_GITHUB_TOKEN/);
    assert.doesNotMatch(approval, /VERCEL_TOKEN|CONVEX_DEPLOY_KEY|CANARY_SECRET/);
  }
  assert.doesNotMatch(workflow, /CONVEX_PRODUCTION_DEPLOY_KEY|VERCEL_TOKEN/);
}

function assertImmutableHandoffs(workflow: string) {
  for (const required of [
    "production-preflight-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "production-approval-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "--preflight-dir",
    "--github-proof",
    "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST: ${{ needs.preflight.outputs.artifact-digest }}",
    "if-no-files-found: error",
    "overwrite: false",
  ]) {
    assert.match(workflow, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
}

function assertPreflightPrecedesApproval(workflow: string) {
  const approval = job(workflow, "approval");
  assert.match(approval, /needs: preflight/);
  assert.ok(
    approval.indexOf("actions/download-artifact@") <
      approval.indexOf("SOURCERA_RELEASE_GITHUB_TOKEN:"),
  );
  assert.match(
    approval,
    /SOURCERA_PREFLIGHT_ARTIFACT_DIGEST: \$\{\{ needs\.preflight\.outputs\.artifact-digest \}\}/,
  );
}

test("ordinary production releases are normal-only and credential isolated", () => {
  const workflow = readFileSync(".github/workflows/production-release.yml", "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /anchor_mode:|\bgenesis\b/);
  assert.doesNotMatch(workflow, /\sapproval:|release:production:github|--anchor-mode normal/);
  assert.match(workflow, /group:\s+sourcera-production-release/);
  assert.match(workflow, /cancel-in-progress:\s+false/);
  assertPinnedRuntime(workflow);
  assertCredentialIsolation(workflow);
  const blocked = job(workflow, "blocked");
  assert.match(blocked, /needs: preflight/);
  assert.match(blocked, /npm run release:production:no-authority/);
  assert.match(blocked, /production-release-no-authority-/);
  assert.match(blocked, /SOURCERA_REQUESTED_AUTHORITY_RUN_ID: \$\{\{ inputs\.known_good_receipt_run_id \}\}/);
  assert.doesNotMatch(blocked, /github-proof|github-handoff|run-id:/);
  assert.match(
    blocked,
    /id: receipt_check[\s\S]*if: always\(\)[\s\S]*test -s "\$RECEIPT_PATH"[\s\S]*production_release_no_authority_receipt/,
  );
  assert.match(
    blocked,
    /if: always\(\) && steps\.receipt_check\.outcome == 'success'[\s\S]*actions\/upload-artifact@/,
  );
  assert.ok(
    blocked.indexOf("actions/upload-artifact@") <
      blocked.indexOf("Fail closed until DEC-PROD-002 is resolved"),
  );
  assert.equal(workflow.match(/exit 1/g)?.length, 1);
});

test("genesis is confined to a separate protected bootstrap-recovery workflow", () => {
  const workflow = readFileSync(
    ".github/workflows/production-bootstrap-recovery.yml",
    "utf8",
  );
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /bootstrap_route:/);
  assert.match(workflow, /options:\s*\n\s*- initial_genesis\s*\n\s*- expired_anchor/);
  assert.match(workflow, /bootstrap_reason:/);
  assert.doesNotMatch(workflow, /vercel_baseline_confirmed/);
  for (const required of [
    "baseline_sha:",
    "baseline_run_id:",
    "baseline_activation_attempt:",
    "baseline_activation_artifact_name:",
    "baseline_activation_artifact_digest:",
    "baseline_stage_receipt_sha256:",
    "expired_anchor_identity_json:",
    "run-id: ${{ inputs.baseline_run_id }}",
    "name: ${{ inputs.baseline_activation_artifact_name }}",
    "--vercel-baseline-dir",
    "SOURCERA_VERCEL_BASELINE_SHA: ${{ inputs.baseline_sha }}",
    "SOURCERA_VERCEL_BASELINE_RUN_ID: ${{ inputs.baseline_run_id }}",
    "SOURCERA_VERCEL_BASELINE_RUN_ATTEMPT: ${{ inputs.baseline_activation_attempt }}",
    "SOURCERA_VERCEL_BASELINE_ARTIFACT_NAME: ${{ inputs.baseline_activation_artifact_name }}",
    "SOURCERA_VERCEL_BASELINE_ARTIFACT_DIGEST: ${{ inputs.baseline_activation_artifact_digest }}",
    "SOURCERA_VERCEL_BASELINE_STAGE_RECEIPT_SHA256: ${{ inputs.baseline_stage_receipt_sha256 }}",
  ]) {
    assert.match(
      workflow,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.equal(
    workflow.match(/run-id: \$\{\{ inputs\.baseline_run_id \}\}/g)?.length,
    1,
  );
  assert.match(workflow, /SOURCERA_BOOTSTRAP_ROUTE: \$\{\{ inputs\.bootstrap_route \}\}/);
  assert.match(workflow, /SOURCERA_EXPIRED_ANCHOR_IDENTITY_JSON: \$\{\{ inputs\.expired_anchor_identity_json \}\}/);
  assert.match(workflow, /SOURCERA_BOOTSTRAP_REASON: \$\{\{ inputs\.bootstrap_reason \}\}/);
  assert.match(workflow, /--anchor-mode genesis/);
  assert.doesNotMatch(workflow, /--anchor-mode normal/);
  assert.match(workflow, /group:\s+sourcera-production-release/);
  assertPinnedRuntime(workflow);
  assertCredentialIsolation(workflow);
  assertImmutableHandoffs(workflow);
  assertPreflightPrecedesApproval(workflow);

  const anchor = job(workflow, "convex-anchor");
  assert.match(anchor, /needs:\s*\n\s*- approval/);
  assert.match(anchor, /SOURCERA_CONVEX_CANARY_SECRET:\s+\$\{\{ secrets\.SOURCERA_CONVEX_CANARY_SECRET \}\}/);
  assert.match(anchor, /npm run convex:bootstrap:production/);
  assert.doesNotMatch(anchor, /CONVEX_DEPLOY_KEY|VERCEL_TOKEN/);
  assert.match(anchor, /production-anchor-authority-/);
  assert.match(job(workflow, "blocked"), /needs:\s*\n\s*- convex-anchor/);
});

test("the Vercel baseline executes every protected job from the dispatch SHA", () => {
  const workflow = readFileSync(
    ".github/workflows/vercel-production-baseline.yml",
    "utf8",
  );
  assertPinnedRuntime(workflow);
  assert.match(workflow, /VERCEL_TOKEN:\s+\$\{\{ secrets\.VERCEL_TOKEN \}\}/);
  assert.doesNotMatch(workflow, /CONVEX_DEPLOY_KEY/);
});

test("Vercel baseline recovery re-runs only the failed activation job", () => {
  const workflow = readFileSync(
    ".github/workflows/vercel-production-baseline.yml",
    "utf8",
  );
  const runbook = readFileSync("docs/runbooks/convex-production.md", "utf8");
  for (const prerequisite of ["preflight", "approval", "stage"]) {
    assert.doesNotMatch(
      job(workflow, prerequisite),
      /name:\s+vercel-production-baseline-[^\n]*\$\{\{ github\.run_attempt \}\}/,
    );
  }
  assert.match(
    job(workflow, "activate"),
    /name:\s+vercel-production-baseline-activation-\$\{\{ github\.sha \}\}-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/,
  );
  assert.match(
    job(workflow, "activate"),
    /id: receipt_check[\s\S]*if: always\(\)[\s\S]*test -s "\$RECEIPT_PATH"[\s\S]*rollbackClaimed[\s\S]*if: always\(\) && steps\.receipt_check\.outcome == 'success'[\s\S]*actions\/upload-artifact@/,
  );
  assert.match(runbook, /Re-run failed jobs/);
  assert.match(runbook, /gh run rerun RUN_ID --failed/);
  assert.match(
    runbook,
    /Do not use .*Re-run all jobs.*`gh run rerun RUN_ID` without `--failed`/i,
  );
  assert.match(
    runbook,
    /attempt 2\+.*non-promotable.*bootstrap.*later-attempt.*approval/i,
  );
});

test("blocked mode keeps the separate Vercel baseline exception explicit", () => {
  const contract = readFileSync(
    "docs/runbooks/production-proof-contracts.md",
    "utf8",
  );
  assert.doesNotMatch(contract, /Blocked mode stops before every provider call/);
  assert.match(contract, /ordinary\/combined production release controller/i);
  assert.match(contract, /DEC-PROD-003.*Vercel baseline.*exception/i);
  assert.match(contract, /non-promotable/i);
});

test("runbook forbids combined Convex and Vercel credential guidance", () => {
  const runbook = readFileSync("docs/runbooks/convex-production.md", "utf8");
  assert.doesNotMatch(
    runbook,
    /intentionally remain under one signal-aware mutation controller|Do not split those provider phases|mutation job receives Vercel plus Convex/i,
  );
  assert.match(runbook, /DEC-PROD-004/);
  assert.match(runbook, /No job or parent process may hold both write credentials/);
});
