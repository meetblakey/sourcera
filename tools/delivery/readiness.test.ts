import { strict as assert } from "node:assert";
import test from "node:test";
import { isCodexReady, readinessFindings } from "./lib/readiness.js";
import type { LinearIssueSnapshot } from "./lib/model.js";

const ready: LinearIssueSnapshot = {
  id: "PLA-1",
  sourceId: "F-001",
  title: "One outcome",
  kind: "executable",
  labels: ["codex-ready"],
  release: "R0",
  milestone: "R0.1",
  dependencies: [],
  owner: "Blake Rowley",
  reviewer: "Blake Rowley",
  estimate: 3,
  paths: ["package.json", "tests/integration/health.spec.ts"],
  tests: {
    success: "health returns 200",
    failure: "missing dependency fails CI",
    recovery: "rollback restores prior build",
  },
  rollout: "staging canary",
  rollback: "redeploy prior commit",
  telemetry: "deployment_health_check_result",
  proof: "staging deployment receipt",
  sourceVersion: "7.1.0a",
  sourceSection: "§1.5",
  outcome: "Create reproducible app foundation",
};

test("earns readiness only when all fields pass", () => {
  assert.equal(isCodexReady(ready), true);
});

test("rejects wildcard paths, missing recovery, and parents", () => {
  const invalid = {
    ...ready,
    kind: "parent" as const,
    paths: ["app/**"],
    tests: { ...ready.tests, recovery: null },
  };
  assert.deepEqual(
    new Set(readinessFindings(invalid).map((finding) => finding.code)),
    new Set([
      "parent_not_executable",
      "path_not_concrete",
      "recovery_test_missing",
    ]),
  );
  assert.equal(isCodexReady(invalid), false);
});

test("rejects truncated or placeholder work", () => {
  const invalid = { ...ready, outcome: "TODO: finish later" };
  assert.equal(readinessFindings(invalid)[0].code, "ambiguous_or_truncated");
});
