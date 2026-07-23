import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPECTED_LINEAR_RUNTIME_PATH_REGISTRY_ROWS,
  LinearRuntimePathRegistry,
  LinearRuntimePathRegistryEntry,
  loadLinearRuntimePathRegistry,
  parseLinearRuntimePathRegistry,
  validateLinearRuntimePathRegistry,
} from "./linear-runtime-path-registry.js";

const registry = loadLinearRuntimePathRegistry();

function copyRegistry(): LinearRuntimePathRegistry {
  return structuredClone(registry);
}

function entryByIssue(
  value: LinearRuntimePathRegistry,
  issueId: string,
): LinearRuntimePathRegistryEntry {
  const entry = value.entries.find((candidate) => candidate.issueId === issueId);
  assert.ok(entry, `missing ${issueId}`);
  return entry;
}

test("loads the exact 63-row fail-closed registry", () => {
  assert.equal(registry.entries.length, EXPECTED_LINEAR_RUNTIME_PATH_REGISTRY_ROWS);
  assert.equal(new Set(registry.entries.map((entry) => entry.issueId)).size, 63);
  assert.equal(new Set(registry.entries.map((entry) => entry.gateId)).size, 63);
  assert.deepEqual(registry.summary.laneCounts, {
    product_runtime: 35,
    hybrid: 22,
    static_ci: 6,
  });
  assert.equal(registry.summary.exactPlannedRows, 63);
  assert.equal(registry.summary.unresolvedRows, 0);
  assert.ok(registry.entries.every((entry) => entry.mappingStatus === "exact_planned"));
  assert.ok(registry.entries.every((entry) => entry.unresolved.length === 0));
  assert.ok(registry.entries.every((entry) => entry.mustFailClosed));
  assert.ok(
    registry.entries.every(
      (entry) => entry.currentRuntimeState === "fail_closed_pending_same_commit_proof",
    ),
  );
});

test("carries every resolved execution-path target", () => {
  const sel210 = entryByIssue(registry, "SEL-210");
  assert.ok(
    sel210.implementationPaths.includes(
      "convex/deploy_validators/first_pass_rfp_draft_outcome_contract_isolation.ts",
    ),
  );
  assert.ok(
    sel210.runtimeTestPaths.includes(
      "tests/integration/first_pass_rfp_draft_outcome_contract_isolation.spec.ts",
    ),
  );

  const pla716 = entryByIssue(registry, "PLA-716");
  assert.ok(pla716.implementationPaths.includes("convex/evalstarter-entity.ts"));
  assert.ok(
    pla716.runtimeTestPaths.includes(
      "tests/integration/eval-starter-seed-use-case-index-validity.spec.ts",
    ),
  );

  assert.ok(
    entryByIssue(registry, "PLA-787").runtimeTestPaths.includes(
      "tests/chaos/dr-failover-no-cross-residency.spec.ts",
    ),
  );

  const pla791 = entryByIssue(registry, "PLA-791");
  assert.ok(
    pla791.implementationPaths.includes(
      "infra/terraform/modules/residency-replication/main.tf",
    ),
  );
  assert.ok(
    pla791.runtimeTestPaths.includes(
      "tests/integration/s3-replication-policy-residency-bound.spec.ts",
    ),
  );

  const pla803 = entryByIssue(registry, "PLA-803");
  assert.ok(pla803.implementationPaths.includes("convex/committedspendcontract-entity.ts"));
  assert.ok(
    pla803.implementationPaths.includes("convex/volume-discount-bands-committed-spend.ts"),
  );
  assert.ok(
    pla803.runtimeTestPaths.includes("tests/integration/committedspendcontract-entity.spec.ts"),
  );

  assert.ok(
    entryByIssue(registry, "PLA-819").productionProbePaths.includes(
      "synthetics/legal-entity-residency-change-revenue-leak.ts",
    ),
  );

  const pla820 = entryByIssue(registry, "PLA-820");
  assert.ok(pla820.implementationPaths.includes("convex/schema.ts"));
  assert.ok(pla820.implementationPaths.includes("convex/organizationCreation.ts"));
  assert.ok(
    pla820.runtimeTestPaths.includes("tests/integration/org_custom_residency_label_required.spec.ts"),
  );

  assert.ok(
    entryByIssue(registry, "PLA-872").productionProbePaths.includes(
      "synthetics/dsar-sla-window-breached.ts",
    ),
  );
  assert.ok(
    entryByIssue(registry, "SEL-247").runtimeTestPaths.includes(
      "tests/mobile/seller-qa-phase8-readonly.spec.ts",
    ),
  );
});

test("binds the Defense View bridge firewall to both runtime registries and deploy validation", () => {
  const entry = entryByIssue(registry, "BUY-367");
  for (const path of [
    "convex/consoleBridgeApplyHandlers.ts",
    "convex/webhookSubscriptions.ts",
    "convex/deploy_validators/console_bridge_no_defense_view_event_kinds.ts",
  ]) assert.ok(entry.implementationPaths.includes(path), `BUY-367 lacks ${path}`);
  assert.ok(
    entry.runtimeTestPaths.includes(
      "tests/integration/console-bridge-defense-view-event-firewall.spec.ts",
    ),
  );
  assert.ok(entry.ciWorkflowPaths.includes(".github/workflows/deploy-validator.yml"));
});

test("binds product-shaped static assertions to executable integration targets", () => {
  const expected = new Map([
    [
      "PLA-706",
      "tests/integration/appendix-m-engine-to-surface-completeness.spec.ts",
    ],
    [
      "PLA-724",
      "tests/integration/first-30-seconds-new-ux-surface.spec.ts",
    ],
    [
      "PLA-765",
      "tests/integration/console-isolation-error-path-static-analysis.spec.ts",
    ],
    [
      "PLA-842",
      "tests/integration/authenticated-bundle-budget.spec.ts",
    ],
  ]);

  for (const [issueId, path] of expected) {
    const entry = entryByIssue(registry, issueId);
    assert.equal(entry.lane, "static_ci");
    assert.deepEqual(entry.runtimeTestPaths, [path]);
    assert.ok(entry.implementationPaths.every((candidate) => /^(?:tools|infra)\//.test(candidate)));
    assert.equal(entry.productionProbePaths.length, 0);
  }
});

test("enforces lane-specific path roles without requiring planned files to exist", () => {
  const staticRows = registry.entries.filter((entry) => entry.lane === "static_ci");
  assert.ok(
    staticRows.every((entry) =>
      entry.implementationPaths.every((path) => /^(?:tools|infra)\//.test(path))
    ),
  );
  assert.ok(staticRows.every((entry) => entry.productionProbePaths.length === 0));

  for (const entry of registry.entries.filter((candidate) => candidate.lane !== "static_ci")) {
    assert.ok(
      entry.implementationPaths.some((path) =>
        /^(?:app|apps|components|convex|lib|packages)\//.test(path)
      ),
      `${entry.issueId} lacks a product path`,
    );
    assert.ok(entry.runtimeTestPaths.length > 0, `${entry.issueId} lacks a runtime test`);
  }

  for (const entry of registry.entries) {
    assert.ok(entry.runtimeTestPaths.every((path) => path.startsWith("tests/")));
    assert.ok(entry.productionProbePaths.every((path) => path.startsWith("synthetics/")));
    assert.ok(entry.ciWorkflowPaths.every((path) => path.startsWith(".github/workflows/")));
    assert.equal(entry.proofPath, `reports/evidence/${entry.gateId}-runtime-proof.json`);
  }
});

test("rejects duplicate identifiers and a product handler on a static row", () => {
  const duplicate = copyRegistry();
  duplicate.entries[1].issueId = duplicate.entries[0].issueId;
  assert.throws(
    () => validateLinearRuntimePathRegistry(duplicate),
    /issueId duplicates/,
  );

  const staticProduct = copyRegistry();
  entryByIssue(staticProduct, "PLA-706").implementationPaths.push("convex/invented-handler.ts");
  assert.throws(
    () => validateLinearRuntimePathRegistry(staticProduct),
    /static_ci rows cannot name product handlers/,
  );
});

test("rejects wrong path roles, incomplete runtime lanes, and unresolved rows", () => {
  const wrongTestRole = copyRegistry();
  entryByIssue(wrongTestRole, "BUY-365").runtimeTestPaths = ["synthetics/not-a-test.ts"];
  assert.throws(
    () => validateLinearRuntimePathRegistry(wrongTestRole),
    /not a valid runtime_test path/,
  );

  const wrongProbeRole = copyRegistry();
  entryByIssue(wrongProbeRole, "PLA-819").productionProbePaths = [
    "infra/terraform/not-a-probe.tf",
  ];
  assert.throws(
    () => validateLinearRuntimePathRegistry(wrongProbeRole),
    /not a valid production_probe path/,
  );

  const noProductPath = copyRegistry();
  entryByIssue(noProductPath, "BUY-365").implementationPaths = ["tools/only-static.ts"];
  assert.throws(
    () => validateLinearRuntimePathRegistry(noProductPath),
    /product_runtime rows require a product implementation path/,
  );

  const noRuntimeTest = copyRegistry();
  entryByIssue(noRuntimeTest, "SEL-247").runtimeTestPaths = [];
  assert.throws(
    () => validateLinearRuntimePathRegistry(noRuntimeTest),
    /product_runtime rows require an executable runtime test/,
  );

  const unresolved = copyRegistry();
  entryByIssue(unresolved, "PLA-803").unresolved.push("owner missing");
  assert.throws(
    () => validateLinearRuntimePathRegistry(unresolved),
    /unresolved must be empty/,
  );
});

test("rejects proof and CI drift and malformed JSON", () => {
  const proofDrift = copyRegistry();
  entryByIssue(proofDrift, "PLA-872").proofPath =
    "reports/evidence/wrong-runtime-proof.json";
  assert.throws(
    () => validateLinearRuntimePathRegistry(proofDrift),
    /proofPath must be named from its gateId/,
  );

  const hybridWithoutStaticCi = copyRegistry();
  const pla716 = entryByIssue(hybridWithoutStaticCi, "PLA-716");
  pla716.ciWorkflowPaths = pla716.ciWorkflowPaths.filter(
    (path) => !path.endsWith("spec-lint.yml") && !path.endsWith("deploy-validator.yml"),
  );
  assert.throws(
    () => validateLinearRuntimePathRegistry(hybridWithoutStaticCi),
    /hybrid rows require spec-lint or deploy-validator CI/,
  );

  assert.throws(() => parseLinearRuntimePathRegistry("{"), /registry JSON is invalid/);
});
