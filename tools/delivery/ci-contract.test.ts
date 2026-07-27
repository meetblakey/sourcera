import { strict as assert } from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

const officialActionPins = new Map([
  ["actions/checkout", "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0"],
  ["actions/setup-node", "820762786026740c76f36085b0efc47a31fe5020"],
  ["actions/upload-artifact", "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"],
  ["actions/download-artifact", "3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c"],
]);
const officialUploadArtifact =
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";

test("automatic Vercel production deployment is disabled for main in every application", () => {
  for (const path of [
    "vercel.json",
    "apps/buyer/vercel.json",
    "apps/seller/vercel.json",
  ]) {
    const config = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
    assert.deepEqual(config.git?.deploymentEnabled, { main: false });
  }
});

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
    "git cat-file -e \"${BASE_SHA}:delivery/linear-program-scope.json\"",
    "PR base Linear program scope unavailable",
    "/tmp/base-linear-snapshot.json",
    "/tmp/base-linear-program-scope.json",
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
  const mirrorDiffGuard = mirrorClassification.indexOf(
    'elif ! git diff --quiet "${BASE_SHA}" --',
  );
  const baseScopeRead = mirrorClassification.indexOf(
    'git show "${BASE_SHA}:delivery/linear-program-scope.json" > /tmp/base-linear-program-scope.json',
  );
  const exactMigrationGuard = mirrorClassification.indexOf(
    "jq -e '.schemaVersion == 2' /tmp/base-linear-program-scope.json >/dev/null &&",
  );
  const exactHeadGuard = mirrorClassification.indexOf(
    "jq -e '.schemaVersion == 3' delivery/linear-program-scope.json >/dev/null",
  );
  assert.ok(mirrorDiffGuard >= 0);
  assert.ok(baseScopeRead > mirrorDiffGuard);
  assert.ok(exactMigrationGuard > baseScopeRead);
  assert.ok(exactHeadGuard > exactMigrationGuard);
  assert.equal(
    [...mirrorClassification.matchAll(/schema_v3_activation=true/g)].length,
    1,
  );
  assert.equal(
    [...mirrorClassification.matchAll(/required=false/g)].length,
    2,
  );
  assert.doesNotMatch(
    mirrorClassification,
    /schemaVersion\s*(?:>=|<=|>|<|!=)/,
  );
  const mirrorVerification = deliveryIntegrity.slice(
    deliveryIntegrity.indexOf("      - name: Verify committed delivery mirror"),
    deliveryIntegrity.indexOf("      - run: npm --prefix tools/spec-lint run typecheck"),
  );
  assert.match(
    mirrorVerification,
    /if: steps\.linear_mirror\.outputs\.required == 'true'/,
  );
  assert.doesNotMatch(
    deliveryIntegrity.slice(
      deliveryIntegrity.indexOf("      - uses: actions/setup-node@"),
    ),
    /schema_v3_activation/,
  );
});

test("the one-time v2 to v3 mirror exception cannot bypass another generated change", () => {
  const workflow = readFileSync(
    ".github/workflows/delivery-integrity.yml",
    "utf8",
  );
  const classification = workflow.slice(
    workflow.indexOf("      - name: Classify committed Linear mirror"),
    workflow.indexOf("      - uses: actions/setup-node@"),
  );
  const runMarker = "        run: |\n";
  const runStart = classification.indexOf(runMarker);
  assert.ok(runStart >= 0);
  const script = classification
    .slice(runStart + runMarker.length)
    .split("\n")
    .map((line) => line.startsWith("          ") ? line.slice(10) : line)
    .join("\n");
  const root = mkdtempSync(join(tmpdir(), "linear-mirror-v3-contract-"));
  const mirrorPaths = [
    "delivery/linear-snapshot.json",
    "delivery/release-plan.json",
    "reports/delivery/delivery-manifest.json",
    "reports/delivery/dependency-graph.json",
    "reports/delivery/drift-report.json",
    "reports/delivery/journey-readiness.json",
    "reports/delivery/readiness-report.json",
    "reports/delivery/release-scorecard.json",
    "reports/delivery/traceability-map.json",
  ];
  const write = (path: string, content: string): void => {
    const absolute = join(root, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, content);
  };
  const git = (...arguments_: string[]): string =>
    execFileSync("git", arguments_, { cwd: root, encoding: "utf8" }).trim();
  const classify = (baseSha: string): Map<string, string> => {
    const output = join(root, "github-output.txt");
    writeFileSync(output, "");
    const result = spawnSync("bash", ["-c", script], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        BASE_SHA: baseSha,
        GITHUB_EVENT_NAME: "pull_request",
        GITHUB_OUTPUT: output,
      },
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    return new Map(
      readFileSync(output, "utf8")
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("=");
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    );
  };

  try {
    git("init", "-q");
    git("config", "user.email", "ci@example.invalid");
    git("config", "user.name", "CI Contract");
    write("delivery/linear-program-scope.json", '{"schemaVersion":2}\n');
    write(
      "delivery/linear-snapshot.json",
      '{"linearCapture":{},"linearFingerprint":{}}\n',
    );
    for (const path of mirrorPaths.slice(1)) write(path, "{}\n");
    git("add", ".");
    git("commit", "-qm", "schema v2 baseline");
    const v2Base = git("rev-parse", "HEAD");

    write("delivery/linear-program-scope.json", '{"schemaVersion":3}\n');
    assert.deepEqual(Object.fromEntries(classify(v2Base)), {
      required: "false",
      schema_v3_activation: "true",
    });

    write("delivery/linear-snapshot.json", '{"changed":true}\n');
    assert.deepEqual(Object.fromEntries(classify(v2Base)), {
      required: "true",
      schema_v3_activation: "false",
    });

    write(
      "delivery/linear-snapshot.json",
      '{"linearCapture":{},"linearFingerprint":{}}\n',
    );
    write("delivery/linear-program-scope.json", '{"schemaVersion":4}\n');
    assert.deepEqual(Object.fromEntries(classify(v2Base)), {
      required: "true",
      schema_v3_activation: "false",
    });

    write("delivery/linear-program-scope.json", '{"schemaVersion":3}\n');
    git("add", "delivery/linear-program-scope.json");
    git("commit", "-qm", "schema v3 active");
    const v3Base = git("rev-parse", "HEAD");
    assert.deepEqual(Object.fromEntries(classify(v3Base)), {
      required: "true",
      schema_v3_activation: "false",
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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
    "Upload safe Linear ticket diagnostics",
    "linear-ticket-diagnostics-",
    "Fail invalid live ticket contracts",
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
  const currentIntegrity = manualCapture.slice(
    manualCapture.indexOf("tools/delivery/current-linear-ticket-integrity.ts"),
    manualCapture.indexOf("tools/delivery/linear-fingerprint-overlay.ts"),
  );
  assert.match(
    currentIntegrity,
    /--linear-program-scope delivery\/linear-program-scope\.json/,
  );
  assert.match(
    manualCapture.slice(
      manualCapture.indexOf("tools/delivery/linear-fingerprint-overlay.ts"),
      manualCapture.indexOf("tools/delivery/validate-linear-candidate.ts"),
    ),
    /--linear-program-scope delivery\/linear-program-scope\.json/,
  );
  assert.ok(
    manualCapture.indexOf("name: Remove raw Linear descriptions") <
      manualCapture.indexOf("name: Upload safe Linear ticket diagnostics"),
  );
  assert.ok(
    manualCapture.indexOf("name: Upload safe Linear ticket diagnostics") <
      manualCapture.indexOf("name: Fail invalid live ticket contracts"),
  );
  assert.match(
    captureJob,
    /if: steps\.ticket-integrity\.outputs\.status != '0'/,
  );
  assert.ok(
    manualCapture.indexOf("tools/delivery/validate-linear-candidate.ts") <
      manualCapture.indexOf("tools/delivery/promote-linear-candidate.ts"),
  );
  assert.ok(
    manualCapture.indexOf("tools/delivery/promote-linear-candidate.ts") <
      manualCapture.indexOf("linear-snapshot-validation-handoff-"),
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
    "--linear-program-scope delivery/linear-program-scope.json",
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
    "--linear-program-scope delivery/linear-program-scope.json",
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
  assert.doesNotMatch(workflow, /npm run release:production(?:\s|$)/);
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
  assert.match(
    approval,
    /SOURCERA_RELEASE_GITHUB_TOKEN:\s+\$\{\{ secrets\.SOURCERA_RELEASE_GITHUB_TOKEN \}\}/,
  );
  assert.doesNotMatch(approval, /VERCEL_TOKEN|CONVEX_DEPLOY_KEY|CANARY_SECRET/);
  for (const providerJob of [stage, activate]) {
    assert.match(providerJob, /environment:\s+sourcera-production-release/);
    assert.match(
      providerJob,
      /VERCEL_TOKEN:\s+\$\{\{ secrets\.VERCEL_TOKEN \}\}/,
    );
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
  assert.match(
    convexPreview,
    /github\.event_name == 'pull_request' \|\| github\.event_name == 'push'/,
  );
});
