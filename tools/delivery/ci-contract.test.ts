import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const officialActionPins = new Map([
  ["actions/checkout", "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0"],
  ["actions/setup-node", "820762786026740c76f36085b0efc47a31fe5020"],
  ["actions/upload-artifact", "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"],
  ["actions/download-artifact", "3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c"],
]);
const officialUploadArtifact =
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";

test("every first-party workflow action is pinned to the approved immutable commit", () => {
  for (const filename of readdirSync(".github/workflows").filter((entry) =>
    /\.ya?ml$/.test(entry),
  )) {
    const workflow = readFileSync(`.github/workflows/${filename}`, "utf8");
    for (const match of workflow.matchAll(/uses:\s+(actions\/[^@\s]+)@([^\s#]+)/g)) {
      const [, action, revision] = match;
      assert.ok(officialActionPins.has(action), `${filename}: ${action} is not allowlisted`);
      assert.match(revision, /^[0-9a-f]{40}$/, `${filename}: ${action} is not immutable`);
      assert.equal(
        revision,
        officialActionPins.get(action),
        `${filename}: ${action} is not pinned to the approved commit`,
      );
    }
  }
});

test("delivery workflow enforces every repository and Linear gate", () => {
  const workflow = readFileSync(
    ".github/workflows/delivery-integrity.yml",
    "utf8",
  );
  for (const required of [
    "tools/delivery/*.test.ts",
    "tools/delivery/tsconfig.json",
    "tools/release/stamp_gate.ts --json",
    "tools/release/exact_status_scan.ts --json",
    "tools/delivery/verify.ts",
    "tools/delivery/source-checksums.ts",
    "--contract delivery/ticket-source-checksums.json",
    "--feature-dependencies delivery/feature-dependencies.json",
    "--policy delivery/release-policy.json",
    "--release-plan delivery/release-plan.json",
    "--roadmap delivery/roadmap-contract.json",
    "--linear-project-scope delivery/linear-project-scope.json",
    "tools/delivery/linear-live.ts",
    "npm --prefix tools/spec-lint run typecheck",
    "npm --prefix tools/spec-lint run all",
    "tools/repo-hygiene/no_legacy_drift.ts",
    "tools/release/appendix_j_lineage.ts",
    "LINEAR_API_KEY",
    "schedule:",
    "github.event_name == 'schedule'",
    "github.event_name == 'push'",
    "github.event_name == 'pull_request'",
    "github.event.pull_request.head.repo.full_name == github.repository",
  ]) {
    assert.match(workflow, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(workflow, /pull_request_target/);
});

test("delivery workflow exposes a read-only manual Linear capture artifact", () => {
  const workflow = readFileSync(
    ".github/workflows/delivery-integrity.yml",
    "utf8",
  );
  for (const required of [
    "workflow_dispatch:",
    "linear-capture:",
    "github.event_name == 'workflow_dispatch'",
    "tools/delivery/linear-live.ts",
    "--out /tmp/linear-fingerprint.json",
    "--receipt-out /tmp/linear-capture-receipt.json",
    "Validate Linear snapshot candidate semantics",
    "tools/delivery/validate-linear-candidate.ts",
    "--candidate /tmp/linear-snapshot-candidate.json",
    "--releases delivery/releases.json",
    officialUploadArtifact,
    "linear-fingerprint.json",
    "linear-capture-receipt.json",
    "if-no-files-found: error",
  ]) {
    assert.match(
      workflow,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  const manualCapture = workflow.slice(
    workflow.indexOf("  linear-capture:"),
    workflow.indexOf("  linear-drift:"),
  );
  assert.ok(
    manualCapture.indexOf("tools/delivery/validate-linear-candidate.ts") <
      manualCapture.indexOf(officialUploadArtifact),
  );
  assert.doesNotMatch(workflow, /LINEAR_API_KEY[^\n]*run:/);
});

test("Linear drift uploads its complete capture even when drift fails", () => {
  const workflow = readFileSync(
    ".github/workflows/delivery-integrity.yml",
    "utf8",
  );
  const linearDrift = workflow.slice(workflow.indexOf("  linear-drift:"));
  for (const required of [
    "--snapshot delivery/linear-snapshot.json",
    "--out /tmp/linear-fingerprint.json",
    "--descriptions-out /tmp/linear-ticket-descriptions.json",
    "--receipt-out /tmp/linear-capture-receipt.json",
    "tools/delivery/ticket-integrity.ts",
    "--checksum-contract delivery/ticket-source-checksums.json",
    "--capture /tmp/linear-ticket-descriptions.json",
    "if: always()",
    officialUploadArtifact,
    "if-no-files-found: error",
  ]) {
    assert.match(
      linearDrift,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});

test("release-critical paths have the named repository owner", () => {
  const codeowners = readFileSync(".github/CODEOWNERS", "utf8");
  const entries = new Map(
    codeowners
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [pattern, ...owners] = line.split(/\s+/);
        return [pattern, owners] as const;
      }),
  );

  for (const pattern of [
    "*",
    "/.github/",
    "/delivery/",
    "/tools/delivery/",
    "/tools/release/",
    "/scripts/",
    "/convex/",
    "/apps/",
    "/packages/",
    "/Sourcera_Master_Spec.md",
    "/UX_Design_of_Sourcera.md",
  ]) {
    assert.deepEqual(entries.get(pattern), ["@meetblakey"]);
  }
});

test("production release is manual, serialized, protected, retained, and provider-blocked", () => {
  const workflow = readFileSync(
    ".github/workflows/production-release.yml",
    "utf8",
  );
  for (const required of [
    "workflow_dispatch:",
    "ref: ${{ github.sha }}",
    "environment: sourcera-production-release",
    "group: sourcera-production-release",
    "cancel-in-progress: false",
    "npm ci --ignore-scripts",
    "npm run release:production:preflight",
    "SOURCERA_RELEASE_DISPATCH_REF: ${{ github.ref }}",
    'test "$SOURCERA_RELEASE_DISPATCH_REF" = "refs/heads/main"',
    "npm run release:production:no-authority",
    "SOURCERA_REQUESTED_AUTHORITY_RUN_ID: ${{ inputs.known_good_receipt_run_id }}",
    "production-release-no-authority-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "if: always() && steps.receipt_check.outcome == 'success'",
    "SOURCERA_RELEASE_APPROVED_SHA: ${{ github.sha }}",
    "actions/upload-artifact@",
    "if-no-files-found: error",
    "overwrite: false",
    "retention-days: 90",
  ]) {
    assert.match(
      workflow,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.equal(workflow.match(/ref: \$\{\{ github\.sha \}\}/g)?.length, 2);
  assert.doesNotMatch(workflow, /ref: main/);
  assert.doesNotMatch(
    workflow,
    /\sapproval:|release:production:github|release:production:blocked|--anchor-mode normal|run-id:|SOURCERA_RELEASE_GITHUB_TOKEN/,
  );
  assert.doesNotMatch(
    workflow,
    /npm run release:production(?:\s|$)/,
  );
  assert.doesNotMatch(
    workflow,
    /CONVEX_DEPLOY_KEY|SOURCERA_CONVEX_CANARY_SECRET|VERCEL_TOKEN/,
  );
  const preflight = workflow.slice(
    workflow.indexOf("  preflight:"),
    workflow.indexOf("  blocked:"),
  );
  const blocked = workflow.slice(workflow.indexOf("  blocked:"));
  assert.doesNotMatch(preflight, /environment:|secrets\./);
  assert.doesNotMatch(
    blocked,
    /secrets\.|CONVEX_DEPLOY_KEY|SOURCERA_CONVEX_CANARY_SECRET|VERCEL_TOKEN|GH_TOKEN|GITHUB_TOKEN/,
  );
  assert.match(
    blocked,
    /id: receipt_check[\s\S]*test -s "\$RECEIPT_PATH"[\s\S]*production_release_no_authority_receipt/,
  );
  assert.match(blocked, /Fail closed until DEC-PROD-002 is resolved[\s\S]*exit 1/);
  assert.equal(workflow.match(/exit 1/g)?.length, 1);
  assert.ok(
    blocked.indexOf("npm run release:production:no-authority") <
      blocked.indexOf("actions/upload-artifact@"),
  );
  assert.ok(
    blocked.indexOf("actions/upload-artifact@") <
      blocked.indexOf("Fail closed until DEC-PROD-002 is resolved"),
  );
  assert.doesNotMatch(
    workflow,
    /anchor_mode:|\bgenesis\b|pull_request_target|schedule:/,
  );

  const bootstrap = readFileSync(
    ".github/workflows/production-bootstrap-recovery.yml",
    "utf8",
  );
  assert.match(bootstrap, /--anchor-mode genesis/);
  assert.doesNotMatch(bootstrap, /--anchor-mode normal/);
});

test("Convex anchor recovery cannot claim or bypass a Vercel genesis", () => {
  const workflow = readFileSync(
    ".github/workflows/production-bootstrap-recovery.yml",
    "utf8",
  );
  assert.match(workflow, /^name: Convex anchor bootstrap recovery$/m);
  assert.doesNotMatch(workflow, /first-production/i);

  assert.doesNotMatch(workflow, /vercel_baseline_confirmed/);
  for (const required of [
    "baseline_sha:",
    "baseline_run_id:",
    "baseline_activation_attempt:",
    "baseline_activation_artifact_name:",
    "baseline_activation_artifact_digest:",
    "baseline_stage_receipt_sha256:",
    "run-id: ${{ inputs.baseline_run_id }}",
    "name: ${{ inputs.baseline_activation_artifact_name }}",
    "--vercel-baseline-dir",
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

  const foundation = readFileSync("docs/runbooks/r0-foundation.md", "utf8");
  assert.match(foundation, /immutable baseline artifact and exact attempt-specific provenance/i);
  assert.match(foundation, /DEC-PROD-005/);
  assert.doesNotMatch(foundation, /bootstrap recovery.*first-production/i);
});

test("the first Vercel baseline is a separate protected forward-only workflow", () => {
  const workflow = readFileSync(
    ".github/workflows/vercel-production-baseline.yml",
    "utf8",
  );
  for (const required of [
    "name: Vercel production baseline",
    "workflow_dispatch:",
    "baseline_reason:",
    "forward_only_acknowledged:",
    "group: sourcera-production-release",
    "cancel-in-progress: false",
    "npm run release:production:preflight",
    "npm run release:vercel-baseline:github",
    "npm run vercel:baseline:stage",
    "npm run vercel:baseline:activate",
    "vercel-production-baseline-preflight-${{ github.sha }}-${{ github.run_id }}",
    "vercel-production-baseline-approval-${{ github.sha }}-${{ github.run_id }}",
    "vercel-production-baseline-stage-${{ github.sha }}-${{ github.run_id }}",
    "vercel-production-baseline-activation-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "if-no-files-found: error",
    "overwrite: false",
    "retention-days: 90",
  ]) {
    assert.match(
      workflow,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  const preflight = workflow.slice(
    workflow.indexOf("  preflight:"),
    workflow.indexOf("  approval:"),
  );
  const approval = workflow.slice(
    workflow.indexOf("  approval:"),
    workflow.indexOf("  stage:"),
  );
  const stage = workflow.slice(
    workflow.indexOf("  stage:"),
    workflow.indexOf("  activate:"),
  );
  const activate = workflow.slice(workflow.indexOf("  activate:"));
  assert.doesNotMatch(preflight, /environment:|secrets\./);
  assert.match(approval, /environment:\s+sourcera-production-release/);
  assert.match(approval, /SOURCERA_RELEASE_GITHUB_TOKEN:\s+\$\{\{ secrets\.SOURCERA_RELEASE_GITHUB_TOKEN \}\}/);
  assert.doesNotMatch(approval, /VERCEL_TOKEN|CONVEX_DEPLOY_KEY|CANARY_SECRET/);
  for (const providerJob of [stage, activate]) {
    assert.match(providerJob, /environment:\s+sourcera-production-release/);
    assert.match(providerJob, /VERCEL_TOKEN:\s+\$\{\{ secrets\.VERCEL_TOKEN \}\}/);
    assert.doesNotMatch(
      providerJob,
      /SOURCERA_RELEASE_GITHUB_TOKEN|CONVEX_DEPLOY_KEY|CANARY_SECRET/,
    );
  }
  assert.match(stage, /needs:[\s\S]*approval[\s\S]*preflight/);
  assert.match(activate, /needs:[\s\S]*stage/);
  assert.doesNotMatch(
    workflow,
    /\brollback\b|\bgenesis\b|pull_request_target|schedule:/i,
  );
});

test("every release-required workflow runs on all main changes", () => {
  const specLint = readFileSync(".github/workflows/spec-lint.yml", "utf8");
  assert.doesNotMatch(specLint, /^\s+paths:/m);

  const application = readFileSync(".github/workflows/app-ci.yml", "utf8");
  const convexPreview = application.slice(application.indexOf("  convex-preview:"));
  assert.match(convexPreview, /github\.event_name == 'pull_request' \|\| github\.event_name == 'push'/);
});
