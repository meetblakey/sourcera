import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  classifyConvexProductionChanges,
  hashConvexChangeClassification,
  readConvexDataProtectionProof,
  readDurableProductionProofCollection,
  readIsolatedProductionProofEnvironment,
  readR0CustomerJourneyProof,
  readR0OperationalProof,
  type ConvexChangeClassification,
  type ProductionProofBinding,
} from "../../scripts/lib/production-proof-contracts";

const candidateSha = "0123456789abcdef0123456789abcdef01234567";
const baseSha = "fedcba9876543210fedcba9876543210fedcba98";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error("Cannot hash undefined test proof data");
  return json;
}

const binding: ProductionProofBinding = {
  candidateSha,
  convex: {
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
  },
  deployments: [
    {
      application: "marketplace",
      deploymentId: "dpl_marketplace_candidate",
      domains: ["sourcera.example"],
      projectId: "prj_marketplace",
      stagedUrl: "https://marketplace-candidate.vercel.app",
    },
    {
      application: "buyer",
      deploymentId: "dpl_buyer_candidate",
      domains: ["buyer.sourcera.example"],
      projectId: "prj_buyer",
      stagedUrl: "https://buyer-candidate.vercel.app",
    },
    {
      application: "seller",
      deploymentId: "dpl_seller_candidate",
      domains: ["seller.sourcera.example"],
      projectId: "prj_seller",
      stagedUrl: "https://seller-candidate.vercel.app",
    },
  ],
};

const times = {
  created: "2026-07-15T17:00:00.000Z",
  invited: "2026-07-15T17:01:00.000Z",
  entry: "2026-07-15T17:02:00.000Z",
  nda: "2026-07-15T17:03:00.000Z",
  response: "2026-07-15T17:04:00.000Z",
  scored: "2026-07-15T17:05:00.000Z",
  selected: "2026-07-15T17:06:00.000Z",
  retained: "2026-07-15T17:07:00.000Z",
  trust: "2026-07-15T17:08:00.000Z",
  collected: "2026-07-15T17:10:00.000Z",
};

function customerProof() {
  const names = [
    "buyer_evaluation_created",
    "seller_invited",
    "seller_secure_entry_completed",
    "seller_nda_executed",
    "seller_response_submitted",
    "buyer_scoring_completed",
    "buyer_selection_recorded",
    "immutable_record_retained",
  ] as const;
  const observed = [
    times.created,
    times.invited,
    times.entry,
    times.nda,
    times.response,
    times.scored,
    times.selected,
    times.retained,
  ];

  return {
    candidateSha,
    collectedAt: times.collected,
    convex: structuredClone(binding.convex),
    deployments: structuredClone(binding.deployments),
    environment: "staging",
    event: "r0_customer_journey_proof",
    failureRecovery: [
      "seller_secure_entry_expired_link",
      "response_submission_retry",
      "selection_transaction_failure",
      "immutable_record_unauthorized_mutation",
    ].map((scenario, index) => ({
      evidenceSha256: hash(`failure-${scenario}`),
      failureObservedAt: new Date(
        Date.parse(times.entry) + index * 5_000,
      ).toISOString(),
      recoveredAt: new Date(
        Date.parse(times.entry) + index * 5_000 + 1_000,
      ).toISOString(),
      result: "passed",
      scenario,
    })),
    journey: names.map((name, index) => ({
      evidenceSha256: hash(`journey-${name}`),
      name,
      observedAt: observed[index],
      result: "passed",
      runtimeEventId: `evt_${index + 1}`,
    })),
    metrics: {
      abandonment: {
        abandoned: false,
        observedAt: times.selected,
        queryEvidenceSha256: hash("abandonment"),
        result: "passed",
      },
      activation: {
        observedAt: times.invited,
        queryEvidenceSha256: hash("activation"),
        result: "passed",
        runtimeEventId: "evt_2",
      },
      completion: {
        observedAt: times.selected,
        queryEvidenceSha256: hash("completion"),
        result: "passed",
        runtimeEventId: "evt_7",
      },
      timeToValue: {
        completedAt: times.retained,
        durationMs: Date.parse(times.retained) - Date.parse(times.created),
        queryEvidenceSha256: hash("time-to-value"),
        result: "passed",
        startedAt: times.created,
      },
      trust: {
        accepted: true,
        observedAt: times.trust,
        queryEvidenceSha256: hash("trust"),
        responseIdHash: hash("trust-response"),
        result: "passed",
      },
    },
    pilot: {
      buyerActorIdHash: hash("buyer-actor"),
      mode: "invited_human_staging_pilot",
      sellerActorIdHash: hash("seller-actor"),
      workspaceIdHash: hash("workspace"),
    },
    release: "R0",
    schemaVersion: 1,
    selectionRecord: {
      auditChainVerified: true,
      auditEvidenceSha256: hash("audit-chain"),
      contentSha256: hash("selection-record-content"),
      immutableAt: times.selected,
      recordIdHash: hash("selection-record"),
      retainedAt: times.retained,
      retentionAuthority: "Sourcera_Master_Spec.md §40.2",
    },
    synthetic: false,
  };
}

function operationalProof() {
  const checks = [
    "tenant_isolation",
    "console_isolation",
    "authentication",
    "authorization",
    "access_enforcement",
    "audit_integrity",
    "reliability",
    "support",
    "rollback",
    "recovery",
  ] as const;
  return {
    candidateSha,
    checks: checks.map((control, index) => ({
      control,
      evidenceSha256: hash(`control-${control}`),
      observedAt: new Date(
        Date.parse(times.retained) + index * 1_000,
      ).toISOString(),
      result: "passed",
    })),
    collectedAt: times.collected,
    convex: structuredClone(binding.convex),
    convexRuntimeLog: {
      deploymentName: binding.convex.deploymentName,
      deploymentUrl: binding.convex.deploymentUrl,
      endedAt: times.retained,
      errorCount: 0,
      evidenceSha256: hash("convex-logs"),
      fatalCount: 0,
      queryId: "query_convex_logs",
      startedAt: times.created,
    },
    deployments: structuredClone(binding.deployments),
    environment: "staging",
    event: "r0_operational_proof",
    release: "R0",
    reliability: {
      checksPassed: 4,
      checksRun: 4,
      queryEvidenceSha256: hash("reliability-query"),
      result: "passed",
      windowEndedAt: times.retained,
      windowStartedAt: times.created,
    },
    rollbackRecovery: {
      applications: binding.deployments.map((deployment, index) => ({
        application: deployment.application,
        candidateDeploymentId: deployment.deploymentId,
        predecessorDeploymentId: `dpl_${deployment.application}_previous`,
        recoveryEvidenceSha256: hash(`recovery-${deployment.application}`),
        recoveryObservedAt: new Date(
          Date.parse(times.scored) + index * 2_000 + 1_000,
        ).toISOString(),
        restoredDeploymentId: deployment.deploymentId,
        result: "passed",
        rollbackEvidenceSha256: hash(`rollback-${deployment.application}`),
        rollbackObservedAt: new Date(
          Date.parse(times.scored) + index * 2_000,
        ).toISOString(),
      })),
      convex: {
        candidateSha,
        knownGoodSha: baseSha,
        recoveryEvidenceSha256: hash("convex-recovery"),
        recoveryObservedAt: times.retained,
        restoredSha: candidateSha,
        result: "passed",
        rollbackEvidenceSha256: hash("convex-rollback"),
        rollbackObservedAt: times.selected,
      },
    },
    runtimeLogs: binding.deployments.map((deployment) => ({
      application: deployment.application,
      deploymentId: deployment.deploymentId,
      endedAt: times.retained,
      errorCount: 0,
      evidenceSha256: hash(`logs-${deployment.application}`),
      fatalCount: 0,
      queryId: `query_${deployment.application}_logs`,
      stagedUrl: deployment.stagedUrl,
      startedAt: times.created,
    })),
    schemaVersion: 1,
    support: {
      allInterventionsRecorded: true,
      interventionCount: 0,
      queryEvidenceSha256: hash("support-query"),
      result: "passed",
      unplannedDataRepairCount: 0,
      windowEndedAt: times.retained,
      windowStartedAt: times.created,
    },
    synthetic: false,
  };
}

test("accepts an exact observed R0 customer journey proof", () => {
  const proof = customerProof();
  assert.deepEqual(readR0CustomerJourneyProof(proof, binding), proof);
});

test("customer proof rejects synthetic, extra, drifted, and incomplete claims", () => {
  const cases: unknown[] = [
    { ...customerProof(), synthetic: true },
    { ...customerProof(), unexpected: true },
    {
      ...customerProof(),
      deployments: customerProof().deployments.map((entry, index) =>
        index === 1 ? { ...entry, deploymentId: "dpl_wrong" } : entry,
      ),
    },
    {
      ...customerProof(),
      journey: customerProof().journey.slice(0, -1),
    },
    {
      ...customerProof(),
      metrics: {
        ...customerProof().metrics,
        timeToValue: {
          ...customerProof().metrics.timeToValue,
          durationMs: 1,
        },
      },
    },
    {
      ...customerProof(),
      pilot: { ...customerProof().pilot, rawEmail: "buyer@example.com" },
    },
  ];
  for (const value of cases) {
    assert.throws(() => readR0CustomerJourneyProof(value, binding));
  }
});

test("customer proof requires the exact ordered journey and recovery cases", () => {
  const proof = customerProof();
  const reversedJourney = structuredClone(proof);
  [reversedJourney.journey[1], reversedJourney.journey[2]] = [
    reversedJourney.journey[2],
    reversedJourney.journey[1],
  ];
  assert.throws(() => readR0CustomerJourneyProof(reversedJourney, binding));

  const missingRecovery = structuredClone(proof);
  missingRecovery.failureRecovery.pop();
  assert.throws(() => readR0CustomerJourneyProof(missingRecovery, binding));
});

test("accepts operational proof bound to the same candidate and deployments", () => {
  const proof = operationalProof();
  assert.deepEqual(readR0OperationalProof(proof, binding), proof);
});

test("operational proof rejects missing controls, log drift, synthetic claims, and repair", () => {
  const missingControl = operationalProof();
  missingControl.checks.pop();
  const logDrift = operationalProof();
  logDrift.runtimeLogs[0].deploymentId = "dpl_wrong";
  const dataRepair = operationalProof();
  dataRepair.support.unplannedDataRepairCount = 1;
  const extra = operationalProof() as ReturnType<typeof operationalProof> & {
    note?: string;
  };
  extra.note = "looks healthy";

  for (const value of [
    missingControl,
    logDrift,
    dataRepair,
    { ...operationalProof(), synthetic: true },
    extra,
  ]) {
    assert.throws(() => readR0OperationalProof(value, binding));
  }
});

test("classifies schema and Convex runtime changes from an exact ancestor diff", () => {
  const diff = Buffer.from(
    "M\0convex/schema.ts\0A\0convex/migrations/add-selection.ts\0",
  );
  const calls: string[][] = [];
  const classification = classifyConvexProductionChanges({
    baseSha,
    candidateSha,
    repositoryRoot: "/repo",
    runGit: (args) => {
      calls.push(args);
      if (args[0] === "merge-base") {
        return { exitCode: 0, stderr: Buffer.alloc(0), stdout: Buffer.alloc(0) };
      }
      return { exitCode: 0, stderr: Buffer.alloc(0), stdout: diff };
    },
  });

  assert.equal(classification.classification, "schema_and_data");
  assert.equal(classification.requiresBackup, true);
  assert.deepEqual(
    classification.changes.map(({ kind, path, status }) => ({
      kind,
      path,
      status,
    })),
    [
      { kind: "schema", path: "convex/schema.ts", status: "M" },
      {
        kind: "data",
        path: "convex/migrations/add-selection.ts",
        status: "A",
      },
    ],
  );
  assert.deepEqual(calls, [
    ["merge-base", "--is-ancestor", baseSha, candidateSha],
    [
      "diff",
      "--name-status",
      "-z",
      "--find-renames=100%",
      baseSha,
      candidateSha,
      "--",
      "convex",
    ],
  ]);
});

test("classification fails closed for non-ancestors, generated-only, and ambiguous statuses", () => {
  assert.throws(() =>
    classifyConvexProductionChanges({
      baseSha,
      candidateSha,
      repositoryRoot: "/repo",
      runGit: () => ({
        exitCode: 1,
        stderr: Buffer.from("not ancestor"),
        stdout: Buffer.alloc(0),
      }),
    }),
  );

  for (const diff of [
    "M\0convex/_generated/dataModel.d.ts\0",
    "U\0convex/schema.ts\0",
    "R50\0convex/old.ts\0convex/new.ts\0",
  ]) {
    assert.throws(() =>
      classifyConvexProductionChanges({
        baseSha,
        candidateSha,
        repositoryRoot: "/repo",
        runGit: (args) =>
          args[0] === "merge-base"
            ? {
                exitCode: 0,
                stderr: Buffer.alloc(0),
                stdout: Buffer.alloc(0),
              }
            : {
                exitCode: 0,
                stderr: Buffer.alloc(0),
                stdout: Buffer.from(diff),
              },
      }),
    );
  }
});

function noChangeClassification(): ConvexChangeClassification {
  return {
    baseSha,
    candidateSha,
    changes: [],
    classification: "none",
    diffSha256: hash(""),
    requiresBackup: false,
    schemaVersion: 1,
  };
}

function changedClassification(): ConvexChangeClassification {
  return {
    baseSha,
    candidateSha,
    changes: [
      { kind: "schema", path: "convex/schema.ts", status: "M" },
    ],
    classification: "schema",
    diffSha256: hash("schema-diff"),
    requiresBackup: true,
    schemaVersion: 1,
  };
}

function dataProtectionProof(classification = changedClassification()) {
  const artifactSha256 = hash("backup-artifact");
  const manifestSha256 = hash("collection-manifest");
  return {
    backup: {
      artifactSha256,
      backupId: "backup_019f",
      collectionManifestSha256: manifestSha256,
      completedAt: "2026-07-15T16:02:00.000Z",
      encrypted: true,
      residencyRegion: "us",
      result: "passed",
      sourceDeploymentName: binding.convex.deploymentName,
      startedAt: "2026-07-15T16:00:00.000Z",
    },
    baseSha,
    candidateSha,
    classificationSha256: hashConvexChangeClassification(classification),
    collectedAt: "2026-07-15T16:10:00.000Z",
    convex: structuredClone(binding.convex),
    environment: "production",
    event: "convex_backup_restore_proof",
    restore: {
      artifactSha256,
      backupId: "backup_019f",
      cleanupCompletedAt: "2026-07-15T16:09:00.000Z",
      collectionManifestSha256: manifestSha256,
      completedAt: "2026-07-15T16:08:00.000Z",
      hashesMatched: true,
      restoreId: "restore_019f",
      result: "passed",
      startedAt: "2026-07-15T16:04:00.000Z",
      targetDeploymentName: "isolated-restore-019f",
      targetEnvironment: "isolated_staging",
    },
    schemaVersion: 1,
    synthetic: false,
  };
}

test("requires a bound backup and tested isolated restore for Convex changes", () => {
  const classification = changedClassification();
  const proof = dataProtectionProof(classification);
  assert.deepEqual(
    readConvexDataProtectionProof(proof, { binding, classification }),
    proof,
  );
  assert.throws(() =>
    readConvexDataProtectionProof(undefined, { binding, classification }),
  );
});

test("rejects irrelevant, synthetic, mismatched, or production restore receipts", () => {
  assert.throws(() =>
    readConvexDataProtectionProof(dataProtectionProof(), {
      binding,
      classification: noChangeClassification(),
    }),
  );

  const classification = changedClassification();
  const wrongHash = dataProtectionProof(classification);
  wrongHash.classificationSha256 = hash("wrong");
  const synthetic = dataProtectionProof(classification);
  synthetic.synthetic = true;
  const productionRestore = dataProtectionProof(classification);
  productionRestore.restore.targetEnvironment = "production";
  const manifestMismatch = dataProtectionProof(classification);
  manifestMismatch.restore.collectionManifestSha256 = hash("wrong-manifest");
  const extra = dataProtectionProof(classification) as ReturnType<
    typeof dataProtectionProof
  > & { comment?: string };
  extra.comment = "manual note";

  for (const value of [
    wrongHash,
    synthetic,
    productionRestore,
    manifestMismatch,
    extra,
  ]) {
    assert.throws(() =>
      readConvexDataProtectionProof(value, { binding, classification }),
    );
  }
});

test("accepts no data-protection receipt only when the exact diff is empty", () => {
  assert.equal(
    readConvexDataProtectionProof(undefined, {
      binding,
      classification: noChangeClassification(),
    }),
    undefined,
  );
});

test("durable proof collection binds an isolated Convex target and exact human proof bytes", () => {
  const customerRaw = `${JSON.stringify(customerProof())}\n`;
  const operationalRaw = `${JSON.stringify(operationalProof())}\n`;
  const productionConvex = {
    deploymentName: "live-otter-123",
    deploymentUrl: "https://live-otter-123.convex.cloud",
  };
  const environmentProofRaw = `${JSON.stringify({ proof: "isolated-environment" })}\n`;
  const proof = {
    candidateSha,
    collectedAt: "2026-07-15T17:11:00.000Z",
    coordinator: {
      authentication: "signed_single_use_handoff",
      completedAt: "2026-07-15T17:11:00.000Z",
      expiryCompensation: "restore_known_good_and_block",
      expiresAt: "2026-07-15T18:00:00.000Z",
      handoffSha256: hash("handoff"),
      projectId: "prj_release_control",
      provider: "vercel_workflow",
      runId: "run_019f",
      singleUseFinalizer: true,
      startedAt: "2026-07-15T17:00:00.000Z",
      state: "proofs_collected",
      workflowName: "sourcera-production-proof",
    },
    customerProofSha256: hash(customerRaw),
    decision: "DEC-PROD-002",
    event: "durable_production_proof_collection",
    environmentProofSha256: hash(environmentProofRaw),
    isolatedConvex: structuredClone(binding.convex),
    operationalProofSha256: hash(operationalRaw),
    productionConvex,
    result: "passed",
    schemaVersion: 1,
    synthetic: false,
  };
  const expected = {
    binding,
    coordinator: {
      projectId: "prj_release_control",
      workflowName: "sourcera-production-proof",
    },
    customerProofRaw: customerRaw,
    environmentProofRaw,
    operationalProofRaw: operationalRaw,
    productionConvex,
  };

  assert.equal(readDurableProductionProofCollection(proof, expected), proof);
  for (const invalid of [
    { ...proof, customerProofSha256: hash("wrong") },
    { ...proof, synthetic: true },
    { ...proof, productionConvex: structuredClone(binding.convex) },
    {
      ...proof,
      coordinator: { ...proof.coordinator, singleUseFinalizer: false },
    },
  ]) {
    assert.throws(() =>
      readDurableProductionProofCollection(invalid, expected),
    );
  }
});

test("isolated proof environment binds every proof deployment backend to isolated Convex", () => {
  const productionConvex = {
    deploymentName: "live-otter-123",
    deploymentUrl: "https://live-otter-123.convex.cloud",
  };
  const proof = {
    candidateSha,
    collectedAt: "2026-07-15T17:00:00.000Z",
    coordinator: {
      expiresAt: "2026-07-15T18:00:00.000Z",
      handoffSha256: hash("environment-handoff"),
      projectId: "prj_release_control",
      provider: "vercel_workflow",
      runId: "run_019f",
      state: "awaiting_proofs",
      workflowName: "sourcera-production-proof",
    },
    decision: "DEC-PROD-002",
    deployments: binding.deployments.map((deployment) => {
      const environmentEvidence = {
        candidateSha,
        convexDeploymentName: binding.convex.deploymentName,
        convexUrl: binding.convex.deploymentUrl,
        deploymentId: deployment.deploymentId,
        environment: "staging",
        projectId: deployment.projectId,
        provider: "vercel",
        readAt: "2026-07-15T17:00:00.000Z",
      };
      return {
        ...structuredClone(deployment),
        backendConvexDeploymentName: binding.convex.deploymentName,
        backendConvexUrl: binding.convex.deploymentUrl,
        environment: "staging",
        environmentEvidence,
        environmentEvidenceSha256: hash(canonicalJson(environmentEvidence)),
      };
    }),
    event: "isolated_production_proof_environment",
    isolatedConvex: structuredClone(binding.convex),
    productionConvex,
    result: "proof_ready",
    schemaVersion: 1,
    synthetic: false,
  };
  const expected = {
    candidateSha,
    coordinator: {
      projectId: "prj_release_control",
      workflowName: "sourcera-production-proof",
    },
    isolatedConvex: binding.convex,
    productionConvex,
  };

  assert.deepEqual(
    readIsolatedProductionProofEnvironment(proof, expected),
    binding,
  );
  const drifted = structuredClone(proof);
  drifted.deployments[1]!.backendConvexUrl = productionConvex.deploymentUrl;
  assert.throws(() =>
    readIsolatedProductionProofEnvironment(drifted, expected),
  );
});
