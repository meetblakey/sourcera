import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("the sole production workflow is immutable, credential-free, and fail-closed", () => {
  const workflow = readFileSync(
    ".github/workflows/production-release.yml",
    "utf8",
  );
  for (const action of [checkout, setupNode, uploadArtifact, downloadArtifact]) {
    assert.match(workflow, new RegExp(action));
  }
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\n\s+inputs:/);
  assert.match(workflow, /group:\s+sourcera-production-release/);
  assert.match(workflow, /cancel-in-progress:\s+false/);
  assert.doesNotMatch(workflow, /DEC-PROD-\d{3}/);
  assert.doesNotMatch(
    workflow,
    /CONVEX_DEPLOY_KEY|SOURCERA_CONVEX_CANARY_SECRET|VERCEL_TOKEN|SOURCERA_RELEASE_GITHUB_TOKEN|\bGH_TOKEN\b|\bGITHUB_TOKEN:/,
  );

  const dispatchGuard = job(workflow, "dispatch_guard");
  const preflight = job(workflow, "preflight");
  const blocked = job(workflow, "blocked");
  assert.ok(workflow.indexOf("  dispatch_guard:") < workflow.indexOf("  preflight:"));
  assert.doesNotMatch(dispatchGuard, /environment:|secrets\.|actions\/checkout|actions\/setup-node/);
  assert.match(dispatchGuard, /production_release_dispatch_guard_receipt/);
  assert.match(dispatchGuard, /dispatch_ref_not_main/);
  assert.match(dispatchGuard, /flag:\s*["']wx["']/);
  assert.match(dispatchGuard, /if: github\.ref != 'refs\/heads\/main'/);
  assert.match(dispatchGuard, /actions\/upload-artifact@/);
  assert.match(dispatchGuard, /Fail closed after publishing non-main receipt[\s\S]*exit 1/);
  assert.match(preflight, /needs:\s+dispatch_guard/);
  assert.doesNotMatch(preflight, /Require a main-branch dispatch/);
  assert.doesNotMatch(preflight, /environment:|secrets\./);
  assert.match(preflight, /npm run release:production:preflight/);
  assert.match(blocked, /environment:\s+sourcera-production-release/);
  assert.match(blocked, /npm run release:production:no-authority/);
  assert.match(
    blocked,
    /Fail closed until production prerequisites are proved[\s\S]*exit 1/,
  );
  assert.match(
    blocked,
    /id: receipt_check[\s\S]*schemaVersion!==3[\s\S]*providerMutationAuthorized!==false[\s\S]*actions\/upload-artifact@/,
  );
  assert.equal(workflow.match(/exit 1/g)?.length, 2);
});

test("retired production dispatch surfaces are absent", () => {
  for (const path of [
    ".github/workflows/production-bootstrap-recovery.yml",
    ".github/workflows/vercel-production-baseline.yml",
    "scripts/activate-vercel-production-baseline.ts",
    "scripts/bootstrap-convex-production.ts",
    "scripts/production-release-blocked.ts",
    "scripts/production-release-github.ts",
    "scripts/release-production.ts",
    "scripts/stage-vercel-production-baseline.ts",
    "scripts/vercel-production-baseline-github.ts",
    "scripts/deploy-convex-production.ts",
    "scripts/rollback-convex-production.ts",
    "scripts/stage-vercel-production.ts",
  ]) {
    assert.equal(existsSync(path), false, path);
  }

  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  for (const name of [
    "convex:bootstrap:production",
    "release:production",
    "release:production:blocked",
    "release:production:github",
    "release:vercel-baseline:github",
    "vercel:baseline:activate",
    "vercel:baseline:stage",
    "convex:deploy:production",
    "convex:rollback:production",
    "vercel:stage:production",
  ]) {
    assert.equal(packageJson.scripts[name], undefined, name);
  }
});

test("production runbooks are stable pointers to native Linear and the Master Spec", () => {
  const runbooks = [
    "docs/runbooks/convex-production.md",
    "docs/runbooks/production-proof-contracts.md",
    "docs/runbooks/r0-foundation.md",
  ].map((path) => readFileSync(path, "utf8"));
  for (const runbook of runbooks) {
    assert.match(runbook, /native Linear Decision/);
    assert.match(runbook, /Master Spec/);
    assert.doesNotMatch(runbook, /DEC-PROD-\d{3}|PLA-\d+/);
  }
});

test("the active preflight library contains no bootstrap or GitHub authority handoff", () => {
  const library = readFileSync(
    "scripts/lib/production-release-workflow.ts",
    "utf8",
  );
  assert.doesNotMatch(
    library,
    /ProductionGithubHandoff|createProductionGithubHandoff|readProductionGithubHandoff|bootstrapRoute|initial_genesis|expired_anchor/,
  );
});
