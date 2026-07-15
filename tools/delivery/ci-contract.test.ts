import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

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
    "actions/upload-artifact@v4",
    "linear-fingerprint.json",
    "linear-capture-receipt.json",
    "if-no-files-found: error",
  ]) {
    assert.match(
      workflow,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
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
    "--capture /tmp/linear-ticket-descriptions.json",
    "if: always()",
    "actions/upload-artifact@v4",
    "if-no-files-found: error",
  ]) {
    assert.match(
      linearDrift,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});
