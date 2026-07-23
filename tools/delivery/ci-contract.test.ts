import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const officialUploadArtifact =
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";

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
    "--linear-program-scope delivery/linear-program-scope.json",
    "tools/delivery/linear-live.ts",
    "npm --prefix tools/spec-lint run typecheck",
    "npm --prefix tools/spec-lint run all",
    "tools/repo-hygiene/no_legacy_drift.ts",
    "tools/release/appendix_j_lineage.ts",
    "LINEAR_API_KEY",
    "schedule:",
    "github.event_name == 'schedule'",
    "github.event_name == 'push'",
    "Classify committed Linear mirror",
    "BASE_SHA: ${{ github.event.pull_request.base.sha }}",
    "git cat-file -e \"${BASE_SHA}^{commit}\"",
    "git cat-file -e \"${BASE_SHA}:delivery/linear-snapshot.json\"",
    "PR base Linear mirror unavailable",
    "/tmp/base-linear-snapshot.json",
    "Verify committed delivery mirror",
    "steps.linear_mirror.outputs.required == 'true'",
  ]) {
    assert.match(workflow, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(
    [...workflow.matchAll(/name: Classify committed Linear mirror/g)].length,
    1,
  );
  const linearLiveCalls = workflow
    .split("\n")
    .filter((line) => line.includes("tools/delivery/linear-live.ts"));
  assert.equal(linearLiveCalls.length, 3);
  for (const call of linearLiveCalls) {
    assert.match(
      call,
      /--linear-program-scope delivery\/linear-program-scope\.json/,
    );
  }
  assert.doesNotMatch(workflow, /pull_request_target/);
  assert.doesNotMatch(workflow, /codex\/linear-production-control-plane/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  assert.match(workflow, /push:\s*\n\s+branches: \[main\]/);

  const deliveryIntegrity = workflow.slice(
    workflow.indexOf("  delivery-integrity:"),
    workflow.indexOf("  linear-capture:"),
  );
  const mirrorClassification = deliveryIntegrity.slice(
    deliveryIntegrity.indexOf("      - name: Classify committed Linear mirror"),
    deliveryIntegrity.indexOf("      - uses: actions/setup-node@"),
  );
  for (const path of [
    "delivery/linear-snapshot.json",
    "delivery/release-plan.json",
    "reports/delivery/delivery-manifest.json",
    "reports/delivery/dependency-graph.json",
    "reports/delivery/drift-report.json",
    "reports/delivery/journey-readiness.json",
    "reports/delivery/readiness-report.json",
    "reports/delivery/release-scorecard.json",
    "reports/delivery/traceability-map.json",
  ]) {
    assert.match(mirrorClassification, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const requiredBootstrapField of [
    ".linearCapture == null",
    ".linearFingerprint.issues | arrays | length > 0",
    ".linearFingerprint.releasePipelines | arrays | length > 0",
    ".linearFingerprint.releases | arrays | length > 0",
    ".linearFingerprint.projects == null",
    ".linearFingerprint.projectMilestones == null",
    ".linearFingerprint.program == null",
  ]) {
    assert.match(mirrorClassification, new RegExp(requiredBootstrapField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(
    mirrorClassification,
    /git diff --quiet "\$\{BASE_SHA\}" --/,
  );
  const mirrorVerification = deliveryIntegrity.slice(
    deliveryIntegrity.indexOf("      - name: Verify committed delivery mirror"),
    deliveryIntegrity.indexOf("      - run: npm --prefix tools/spec-lint run typecheck"),
  );
  assert.match(
    mirrorVerification,
    /if: steps\.linear_mirror\.outputs\.required == 'true'/,
  );
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
    "github.ref == 'refs/heads/main'",
    "tools/delivery/linear-live.ts",
    "--out /tmp/linear-fingerprint.json",
    "--descriptions-out /tmp/linear-ticket-descriptions.json",
    "--receipt-out /tmp/linear-capture-receipt.json",
    "tools/delivery/current-linear-ticket-integrity.ts",
    "--out /tmp/linear-ticket-integrity.json",
    "Validate Linear snapshot candidate semantics",
    "tools/delivery/validate-linear-candidate.ts",
    "--candidate /tmp/linear-snapshot-candidate.json",
    "--releases delivery/releases.json",
    "--candidate-receipt-out /tmp/linear-candidate-receipt.json",
    "--dispositions delivery/dispositions.json",
    "Capture exact runtime gate inventory",
    "--stamp /tmp/linear-runtime-stamp.json",
    "--runtime-dependencies delivery/runtime-gate-dependencies.json",
    "tools/delivery/promote-linear-candidate.ts",
    "--candidate-receipt /tmp/linear-candidate-receipt.json",
    "Linear snapshot validation-only handoff",
    "Validate guarded promotion in ephemeral checkout",
    "Stage exact attested snapshot handoff",
    "linear-snapshot-handoff.json",
    officialUploadArtifact,
    "linear-fingerprint.json",
    "linear-capture-receipt.json",
    "linear-candidate-receipt.json",
    "linear-runtime-stamp.json",
    "linear-exact-status.json",
    "linear-ticket-integrity.json",
    "linear-publication:",
    "needs: linear-capture",
    "tools/delivery/prepare-linear-publication.ts",
    "LINEAR_HANDOFF_ARTIFACT_DIGEST",
    "linear-reviewable-publication-",
    "actions/download-artifact@",
    "artifact-digest",
    "concurrency:",
    "timeout-minutes:",
    "if-no-files-found: error",
    "overwrite: false",
    "retention-days: 90",
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
  const captureJob = workflow.slice(
    workflow.indexOf("  linear-capture:"),
    workflow.indexOf("  linear-publication:"),
  );
  const publicationJob = workflow.slice(
    workflow.indexOf("  linear-publication:"),
    workflow.indexOf("  linear-drift:"),
  );
  for (const job of [captureJob, publicationJob]) {
    assert.match(job, /github\.event_name == 'workflow_dispatch'/);
    assert.match(job, /github\.ref == 'refs\/heads\/main'/);
    assert.match(job, /fetch-depth: 0/);
  }
  for (const requiredGate of [
    "npm --prefix tools/spec-lint run typecheck",
    "npm --prefix tools/spec-lint run all",
    "tools/repo-hygiene/no_legacy_drift.ts",
    "tools/release/appendix_j_lineage.ts",
  ]) {
    assert.match(
      captureJob,
      new RegExp(requiredGate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.ok(
    manualCapture.indexOf("tools/delivery/current-linear-ticket-integrity.ts") <
      manualCapture.indexOf("tools/delivery/linear-fingerprint-overlay.ts"),
  );
  assert.ok(
    manualCapture.indexOf("tools/delivery/validate-linear-candidate.ts") <
      manualCapture.indexOf("tools/delivery/promote-linear-candidate.ts"),
  );
  assert.ok(
    manualCapture.indexOf("tools/delivery/promote-linear-candidate.ts") <
      manualCapture.indexOf(officialUploadArtifact),
  );
  assert.match(workflow, /^permissions:\s+contents: read$/m);
  assert.doesNotMatch(manualCapture, /git (?:add|commit|push)|contents: write/);
  assert.doesNotMatch(
    manualCapture,
    /^\s+GITHUB_(?:REPOSITORY|SHA|REF|RUN_ID|RUN_ATTEMPT):/m,
  );
  assert.doesNotMatch(workflow, /LINEAR_API_KEY[^\n]*run:/);
});

test("Linear drift validates current tickets before enforcing its committed mirror", () => {
  const workflow = readFileSync(
    ".github/workflows/delivery-integrity.yml",
    "utf8",
  );
  const linearDrift = workflow.slice(workflow.indexOf("  linear-drift:"));
  for (const required of [
    "--snapshot delivery/linear-snapshot.json",
    "--fixture /tmp/linear-fingerprint.json",
    "--out /tmp/linear-fingerprint.json",
    "--descriptions-out /tmp/linear-ticket-descriptions.json",
    "--receipt-out /tmp/linear-capture-receipt.json",
    "tools/delivery/current-linear-ticket-integrity.ts",
    "--fingerprint /tmp/linear-fingerprint.json",
    "--source-policy delivery/linear-source-policy.json",
    "--inventory _audit/FEATURE_INVENTORY.md",
    "--stamp /tmp/linear-runtime-stamp.json",
    "--runtime-dependencies delivery/runtime-gate-dependencies.json",
    "--source-checksums delivery/ticket-source-checksums.json",
    "--capture /tmp/linear-ticket-descriptions.json",
    "if: always()",
    officialUploadArtifact,
    "if-no-files-found: error",
    "fetch-depth: 0",
  ]) {
    assert.match(
      linearDrift,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  const liveCaptureStart = linearDrift.indexOf(
    "      - name: Validate current live Linear",
  );
  const ticketStepStart = linearDrift.indexOf(
    "      - name: Validate current live ticket contracts",
  );
  const mirrorStart = linearDrift.indexOf(
    "      - name: Enforce committed Linear mirror",
  );
  const ticketStart = linearDrift.indexOf(
    "tools/spec-lint/node_modules/.bin/tsx tools/delivery/current-linear-ticket-integrity.ts",
  );
  assert.ok(liveCaptureStart >= 0);
  assert.ok(ticketStepStart > liveCaptureStart);
  assert.ok(ticketStart > ticketStepStart);
  assert.ok(mirrorStart > ticketStart);

  const liveCapture = linearDrift.slice(liveCaptureStart, ticketStepStart);
  assert.match(liveCapture, /--out \/tmp\/linear-fingerprint\.json/);
  assert.match(
    liveCapture,
    /--descriptions-out \/tmp\/linear-ticket-descriptions\.json/,
  );
  assert.doesNotMatch(liveCapture, /--snapshot/);

  const currentTicketIntegrity = linearDrift.slice(ticketStepStart, mirrorStart);
  for (const required of [
    "--snapshot delivery/linear-snapshot.json",
    "--fingerprint /tmp/linear-fingerprint.json",
    "--capture /tmp/linear-ticket-descriptions.json",
    "--source-policy delivery/linear-source-policy.json",
    "--inventory _audit/FEATURE_INVENTORY.md",
    "--source-checksums delivery/ticket-source-checksums.json",
    "--stamp /tmp/linear-runtime-stamp.json",
    "--runtime-dependencies delivery/runtime-gate-dependencies.json",
    "--out /tmp/linear-ticket-integrity.json",
  ]) {
    assert.match(
      currentTicketIntegrity,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.doesNotMatch(currentTicketIntegrity, /linear_mirror/);

  const mirrorEnforcement = linearDrift.slice(
    mirrorStart,
    linearDrift.indexOf("      - if: always()", mirrorStart),
  );
  assert.doesNotMatch(mirrorEnforcement, /if:/);
  assert.match(
    mirrorEnforcement,
    /--fixture \/tmp\/linear-fingerprint\.json --snapshot delivery\/linear-snapshot\.json/,
  );
  assert.doesNotMatch(linearDrift, /continue-on-error:\s*true/);
  assert.doesNotMatch(linearDrift, /pull_request|BASE_SHA|linear_mirror/);
  assert.match(
    linearDrift,
    /linear-drift-fingerprint-\$\{\{ github\.sha \}\}-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/,
  );
});

test("current ticket attestation counts only the planned issue set", () => {
  const source = readFileSync(
    "tools/delivery/current-linear-ticket-integrity.ts",
    "utf8",
  );
  assert.match(source, /checkedIssueCount: issues\.length/);
  assert.doesNotMatch(source, /checkedIssueCount:\s*capture\.issues\.length/);
});
