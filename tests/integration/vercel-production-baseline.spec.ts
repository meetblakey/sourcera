import assert from "node:assert/strict";
import test from "node:test";

import {
  createVercelProductionBaselineSignalHandler,
  executeVercelProductionBaseline,
  reconcileVercelProductionBaseline,
  resumeVercelProductionBaseline,
  stageVercelProductionBaseline,
  type VercelProductionBaselineApplicationInspection,
  type VercelProductionBaselineDependencies,
  type VercelProductionBaselineProjectInspection,
  type VercelProductionBaselineStageReceipt,
} from "../../scripts/lib/vercel-production-baseline";
import type {
  VercelProductionApplication,
  VercelProductionTarget,
} from "../../scripts/lib/vercel-production-release";

const applications = ["marketplace", "buyer", "seller"] as const;
const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const otherSha = "fedcba9876543210fedcba9876543210fedcba98";
const teamId = "team_6nIbCLwuaHPTHviqgckfTiyn";
const checkedAt = "2026-07-15T16:00:00.000Z";

const config = {
  convexProduction: {
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
  },
  vercelProduction: {
    teamId,
    targets: [
      {
        allowedProductionEnvironmentKeys: [],
        application: "marketplace",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "sourcera-meetblakeys-projects.vercel.app",
        productionDomains: ["sourcera-meetblakeys-projects.vercel.app"],
        projectId: "prj_FIBSOffJX8GtY8JHTSXKixfVryBp",
        projectName: "sourcera",
        rootDirectory: null,
        sourceFilesOutsideRootDirectory: true,
      },
      {
        allowedProductionEnvironmentKeys: [],
        application: "buyer",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "sourcera-buyer-meetblakeys-projects.vercel.app",
        productionDomains: [
          "sourcera-buyer-meetblakeys-projects.vercel.app",
        ],
        projectId: "prj_ZbZgRUXjPzgv6Oqepe13W6yV2AyN",
        projectName: "sourcera-buyer",
        rootDirectory: "apps/buyer",
        sourceFilesOutsideRootDirectory: true,
      },
      {
        allowedProductionEnvironmentKeys: [],
        application: "seller",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: "sourcera-seller-meetblakeys-projects.vercel.app",
        productionDomains: [
          "sourcera-seller-meetblakeys-projects.vercel.app",
        ],
        projectId: "prj_Vd0Roi2q0XPkphCrn8rtoNxI1DkS",
        projectName: "sourcera-seller",
        rootDirectory: "apps/seller",
        sourceFilesOutsideRootDirectory: true,
      },
    ],
  },
};

type CurrentDeployment =
  VercelProductionBaselineApplicationInspection["current"];

interface HarnessOptions {
  candidateHealth?: Partial<Record<VercelProductionApplication, boolean>>;
  existing?: Partial<Record<VercelProductionApplication, CurrentDeployment>>;
  inspectFailure?: VercelProductionApplication;
  metadataDrift?: VercelProductionApplication;
  persistFailure?: boolean;
  promoteFailure?: VercelProductionApplication;
  providerSucceedsBeforeFailure?: boolean;
  repositorySha?: string;
  repositoryDriftsAfterPromotions?: boolean;
}

function metadata(
  target: VercelProductionTarget,
  overrides: Record<string, unknown> = {},
) {
  return {
    allowedProductionEnvironmentKeys: [
      ...target.allowedProductionEnvironmentKeys,
    ],
    convexTarget: { ...config.convexProduction },
    productionDomain: target.productionDomain,
    productionDomains: [...target.productionDomains],
    projectId: target.projectId,
    projectName: target.projectName,
    rootDirectory: target.rootDirectory,
    teamId,
    ...overrides,
  };
}

function candidate(
  target: VercelProductionTarget,
  healthy = true,
  substate: "PROMOTED" | "STAGED" = "STAGED",
) {
  return {
    deploymentId: `dpl_${target.application}_candidate`,
    health: {
      checkedAt,
      commitSha: approvedSha,
      domain: target.application,
      environment: "production" as const,
      service: "sourcera" as const,
      status: healthy ? ("ok" as const) : ("error" as const),
    },
    healthy,
    providerGitSha: approvedSha,
    readyState: "READY" as const,
    readySubstate: substate,
    target: "production" as const,
    url: `https://${target.projectName}-${approvedSha.slice(0, 8)}.vercel.app`,
  };
}

function healthyExisting(application: VercelProductionApplication) {
  return {
    deploymentId: `dpl_${application}_existing`,
    healthy: true,
    providerGitSha: otherSha,
    readyState: "READY" as const,
  };
}

function failedExisting(application: VercelProductionApplication) {
  return {
    deploymentId: `dpl_${application}_failed`,
    healthy: false,
    providerGitSha: otherSha,
    readyState: "ERROR" as const,
  };
}

function makeHarness(options: HarnessOptions = {}) {
  const candidates = new Map<
    VercelProductionApplication,
    ReturnType<typeof candidate>
  >();
  const current = new Map<VercelProductionApplication, CurrentDeployment>();
  for (const application of applications) {
    if (Object.hasOwn(options.existing ?? {}, application)) {
      current.set(application, options.existing?.[application] ?? null);
    } else {
      current.set(application, null);
    }
  }
  const promotions: VercelProductionApplication[] = [];
  const stages: VercelProductionApplication[] = [];
  const persisted: VercelProductionBaselineStageReceipt[] = [];
  let promoteFailure = options.promoteFailure;

  const projectInspection = (
    application: VercelProductionApplication,
    target: VercelProductionTarget,
  ): VercelProductionBaselineProjectInspection => ({
    application,
    current: current.get(application) ?? null,
    metadata: metadata(
      target,
      options.metadataDrift === application
        ? { projectId: "prj_drifted" }
        : {},
    ),
  });

  const inspectApplication = async (
    application: VercelProductionApplication,
    target: VercelProductionTarget,
    deploymentId: string,
  ): Promise<VercelProductionBaselineApplicationInspection> => {
    if (options.inspectFailure === application) {
      throw new Error(`${application} readback unavailable`);
    }
    const staged = candidates.get(application);
    assert.ok(staged);
    assert.equal(deploymentId, staged.deploymentId);
    return {
      application,
      candidate: { ...staged },
      current: current.get(application) ?? null,
      metadata: metadata(target),
    };
  };

  const dependencies: VercelProductionBaselineDependencies = {
    inspectApplication,
    inspectProject: async (application, target) =>
      projectInspection(application, target),
    inspectRepository: async () => ({
      clean: true,
      sha:
        options.repositoryDriftsAfterPromotions &&
        promotions.length === applications.length
          ? otherSha
          : (options.repositorySha ?? approvedSha),
    }),
    persistStageReceipt: async (receipt) => {
      if (options.persistFailure) throw new Error("durable receipt unavailable");
      persisted.push(receipt);
    },
    promoteApplication: async (application, _target, deploymentId) => {
      promotions.push(application);
      const staged = candidates.get(application);
      assert.ok(staged);
      assert.equal(deploymentId, staged.deploymentId);
      if (promoteFailure === application) {
        promoteFailure = undefined;
        if (options.providerSucceedsBeforeFailure) {
          staged.readySubstate = "PROMOTED";
          current.set(application, {
            deploymentId,
            healthy: true,
            providerGitSha: approvedSha,
            readyState: "READY",
          });
        }
        throw new Error(`${application} promotion timeout`);
      }
      staged.readySubstate = "PROMOTED";
      current.set(application, {
        deploymentId,
        healthy: true,
        providerGitSha: approvedSha,
        readyState: "READY",
      });
    },
    stageApplication: async (application, target, sha) => {
      assert.equal(sha, approvedSha);
      stages.push(application);
      const staged = candidate(
        target,
        options.candidateHealth?.[application] ?? true,
      );
      candidates.set(application, staged);
      return { deploymentId: staged.deploymentId };
    },
  };

  return {
    candidates,
    current,
    dependencies,
    persisted,
    promotions,
    stages,
  };
}

function executionOptions(
  dependencies: VercelProductionBaselineDependencies,
) {
  return {
    approvedSha,
    config,
    dependencies,
    now: () => new Date(checkedAt),
    repositoryRoot: "/repo",
  };
}

test("exact repository and pinned live metadata are required before staging", async () => {
  const wrongRepository = makeHarness({ repositorySha: otherSha });
  await assert.rejects(
    executeVercelProductionBaseline(
      executionOptions(wrongRepository.dependencies),
    ),
    /repository SHA/,
  );
  assert.deepEqual(wrongRepository.stages, []);

  const driftedMetadata = makeHarness({ metadataDrift: "buyer" });
  await assert.rejects(
    executeVercelProductionBaseline(
      executionOptions(driftedMetadata.dependencies),
    ),
    /buyer project metadata/,
  );
  assert.deepEqual(driftedMetadata.stages, []);

  const reversedConfig = structuredClone(config);
  reversedConfig.vercelProduction.targets.reverse();
  await assert.rejects(
    executeVercelProductionBaseline({
      ...executionOptions(makeHarness().dependencies),
      config: reversedConfig,
    }),
    /Marketplace, Buyer, Seller order/,
  );

  const missingMarketplaceDomain = structuredClone(config) as unknown as {
    vercelProduction: { targets: Array<Record<string, unknown>> };
  };
  missingMarketplaceDomain.vercelProduction.targets[0]!.productionDomain = null;
  missingMarketplaceDomain.vercelProduction.targets[0]!.productionDomains = [];
  const missingDomain = makeHarness();
  await assert.rejects(
    stageVercelProductionBaseline({
      ...executionOptions(missingDomain.dependencies),
      config: missingMarketplaceDomain,
    }),
    /every application requires a pinned production domain/,
  );
  assert.deepEqual(missingDomain.stages, []);
});

test("any healthy existing production predecessor blocks all staging", async () => {
  const harness = makeHarness({
    existing: { buyer: healthyExisting("buyer") },
  });
  await assert.rejects(
    executeVercelProductionBaseline(executionOptions(harness.dependencies)),
    /healthy production predecessor/,
  );
  assert.deepEqual(harness.stages, []);
  assert.deepEqual(harness.promotions, []);
});

test("all three healthy candidates and a durable receipt exist before promotion", async () => {
  const unhealthy = makeHarness({ candidateHealth: { seller: false } });
  await assert.rejects(
    executeVercelProductionBaseline(executionOptions(unhealthy.dependencies)),
    /seller candidate health/,
  );
  assert.deepEqual(unhealthy.stages, applications);
  assert.deepEqual(unhealthy.persisted, []);
  assert.deepEqual(unhealthy.promotions, []);

  const harness = makeHarness({
    existing: { seller: failedExisting("seller") },
  });
  const result = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.deepEqual(harness.stages, applications);
  assert.deepEqual(harness.promotions, applications);
  assert.equal(harness.persisted.length, 1);
  assert.equal(result.result, "passed");
  assert.equal(result.rollbackClaimed, false);
  assert.deepEqual(result.states, {
    buyer: "candidate_live_healthy",
    marketplace: "candidate_live_healthy",
    seller: "candidate_live_healthy",
  });

  const receipt = harness.persisted[0]!;
  assert.equal(receipt.content.applications.length, 3);
  assert.deepEqual(
    receipt.content.applications.map(({ application }) => application),
    applications,
  );
  assert.match(receipt.sha256, /^[a-f0-9]{64}$/);
  assert.equal(Object.isFrozen(receipt), true);
  assert.equal(Object.isFrozen(receipt.content), true);
  assert.equal(Object.isFrozen(receipt.content.applications), true);
  assert.equal(Object.isFrozen(receipt.content.applications[0]), true);
});

test("the protected stage phase persists a complete receipt with zero promotions", async () => {
  const harness = makeHarness();
  const receipt = await stageVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.deepEqual(harness.stages, applications);
  assert.deepEqual(harness.promotions, []);
  assert.deepEqual(harness.persisted, [receipt]);
  assert.deepEqual(
    receipt.content.applications.map(({ application }) => application),
    applications,
  );

  const activated = await resumeVercelProductionBaseline({
    config,
    dependencies: harness.dependencies,
    expectedStageReceiptSha256: receipt.sha256,
    now: () => new Date(checkedAt),
    receipt,
    repositoryRoot: "/repo",
  });
  assert.equal(activated.result, "passed");
  assert.deepEqual(harness.promotions, applications);
});

test("receipt persistence failure leaves all candidates staged and traffic untouched", async () => {
  const harness = makeHarness({ persistFailure: true });
  await assert.rejects(
    executeVercelProductionBaseline(executionOptions(harness.dependencies)),
    /durable receipt unavailable/,
  );
  assert.deepEqual(harness.stages, applications);
  assert.deepEqual(harness.promotions, []);
  assert.deepEqual(
    [...harness.current.values()],
    [null, null, null],
  );
});

test("partial promotion is never called rollback and requires recovery", async () => {
  const harness = makeHarness({ promoteFailure: "buyer" });
  const result = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.equal(result.event, "vercel_production_baseline_recovery_required_receipt");
  assert.equal(result.result, "recovery_required");
  assert.equal(result.trafficMutated, true);
  assert.equal(result.rollbackClaimed, false);
  assert.deepEqual(harness.promotions, ["marketplace", "buyer"]);
  assert.deepEqual(result.states, {
    buyer: "staged_not_live",
    marketplace: "candidate_live_healthy",
    seller: "staged_not_live",
  });
});

test("a provider-success timeout is reconciled from live state", async () => {
  const harness = makeHarness({
    promoteFailure: "marketplace",
    providerSucceedsBeforeFailure: true,
  });
  const result = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.equal(result.result, "recovery_required");
  assert.deepEqual(harness.promotions, ["marketplace"]);
  assert.deepEqual(result.states, {
    buyer: "staged_not_live",
    marketplace: "candidate_live_healthy",
    seller: "staged_not_live",
  });
});

test("final repository drift after traffic requires recovery and never passes", async () => {
  const harness = makeHarness({ repositoryDriftsAfterPromotions: true });
  const result = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.equal(result.result, "recovery_required");
  assert.equal(result.event, "vercel_production_baseline_recovery_required_receipt");
  assert.equal(result.trafficMutated, true);
  assert.match(result.error ?? "", /repository SHA/);
  assert.deepEqual(result.states, {
    buyer: "candidate_live_healthy",
    marketplace: "candidate_live_healthy",
    seller: "candidate_live_healthy",
  });
});

test("reconciliation uses only the five exact application states", async () => {
  const harness = makeHarness();
  const completed = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  const receipt = completed.stageReceipt;
  assert.ok(receipt);

  harness.current.set("buyer", {
    deploymentId: "dpl_unexpected",
    healthy: true,
    providerGitSha: otherSha,
    readyState: "READY",
  });
  harness.candidates.get("seller")!.healthy = false;
  harness.candidates.get("seller")!.health.status = "error";

  const inspected = await reconcileVercelProductionBaseline({
    dependencies: harness.dependencies,
    receipt,
    repositoryRoot: "/repo",
  });
  assert.deepEqual(inspected.states, {
    buyer: "unexpected",
    marketplace: "candidate_live_healthy",
    seller: "unhealthy",
  });

  const readbackDependencies = {
    ...harness.dependencies,
    inspectApplication: async (
      application: VercelProductionApplication,
      target: VercelProductionTarget,
      deploymentId: string,
    ) => {
      if (application === "buyer") throw new Error("readback failed");
      return harness.dependencies.inspectApplication(
        application,
        target,
        deploymentId,
      );
    },
  };
  const withFailure = await reconcileVercelProductionBaseline({
    dependencies: readbackDependencies,
    receipt,
    repositoryRoot: "/repo",
  });
  assert.equal(withFailure.states.buyer, "readback_failed");
});

test("signal handling reconciles once before terminating", async () => {
  const harness = makeHarness({ promoteFailure: "buyer" });
  const partial = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.ok(partial.stageReceipt);
  const events: string[] = [];
  let states: unknown;
  const handler = createVercelProductionBaselineSignalHandler(
    "SIGTERM",
    async () => {
      const reconciliation = await reconcileVercelProductionBaseline({
        dependencies: harness.dependencies,
        receipt: partial.stageReceipt!,
        repositoryRoot: "/repo",
      });
      states = reconciliation.states;
      events.push("reconciled");
    },
    (code) => events.push(`exit:${code}`),
  );
  handler();
  handler();
  await handler.settled();
  assert.deepEqual(events, ["reconciled", "exit:143"]);
  assert.deepEqual(states, partial.states);
});

test("resume accepts only the same receipt and safe exact provider states", async () => {
  const harness = makeHarness({ promoteFailure: "buyer" });
  const partial = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.ok(partial.stageReceipt);

  const resumed = await resumeVercelProductionBaseline({
    config,
    dependencies: harness.dependencies,
    expectedStageReceiptSha256: partial.stageReceipt.sha256,
    now: () => new Date(checkedAt),
    receipt: partial.stageReceipt,
    repositoryRoot: "/repo",
  });
  assert.equal(resumed.result, "passed");
  assert.deepEqual(harness.promotions, [
    "marketplace",
    "buyer",
    "buyer",
    "seller",
  ]);
  assert.deepEqual(resumed.states, {
    buyer: "candidate_live_healthy",
    marketplace: "candidate_live_healthy",
    seller: "candidate_live_healthy",
  });

  await assert.rejects(
    resumeVercelProductionBaseline({
      config,
      dependencies: harness.dependencies,
      expectedStageReceiptSha256: "0".repeat(64),
      receipt: partial.stageReceipt,
      repositoryRoot: "/repo",
    }),
    /same persisted stage receipt/,
  );
});

test("resume rejects unexpected live state and unhealthy staged candidates before promotion", async () => {
  const unexpected = makeHarness({ promoteFailure: "marketplace" });
  const partial = await executeVercelProductionBaseline(
    executionOptions(unexpected.dependencies),
  );
  assert.ok(partial.stageReceipt);
  unexpected.current.set("buyer", {
    deploymentId: "dpl_other_release",
    healthy: true,
    providerGitSha: otherSha,
    readyState: "READY",
  });
  const promotionCount = unexpected.promotions.length;
  await assert.rejects(
    resumeVercelProductionBaseline({
      config,
      dependencies: unexpected.dependencies,
      expectedStageReceiptSha256: partial.stageReceipt.sha256,
      receipt: partial.stageReceipt,
      repositoryRoot: "/repo",
    }),
    /unsafe baseline resume state: buyer=unexpected/,
  );
  assert.equal(unexpected.promotions.length, promotionCount);

  const unhealthy = makeHarness({ promoteFailure: "marketplace" });
  const unhealthyPartial = await executeVercelProductionBaseline(
    executionOptions(unhealthy.dependencies),
  );
  assert.ok(unhealthyPartial.stageReceipt);
  unhealthy.candidates.get("seller")!.healthy = false;
  unhealthy.candidates.get("seller")!.health.status = "error";
  await assert.rejects(
    resumeVercelProductionBaseline({
      config,
      dependencies: unhealthy.dependencies,
      expectedStageReceiptSha256: unhealthyPartial.stageReceipt.sha256,
      receipt: unhealthyPartial.stageReceipt,
      repositoryRoot: "/repo",
    }),
    /unsafe baseline resume state: seller=unhealthy/,
  );
});

test("resume rejects a healthy but non-prefix activation state", async () => {
  const harness = makeHarness({ promoteFailure: "marketplace" });
  const partial = await executeVercelProductionBaseline(
    executionOptions(harness.dependencies),
  );
  assert.ok(partial.stageReceipt);
  const seller = harness.candidates.get("seller");
  assert.ok(seller);
  seller.readySubstate = "PROMOTED";
  harness.current.set("seller", {
    deploymentId: seller.deploymentId,
    healthy: true,
    providerGitSha: approvedSha,
    readyState: "READY",
  });
  const promotionCount = harness.promotions.length;

  await assert.rejects(
    resumeVercelProductionBaseline({
      config,
      dependencies: harness.dependencies,
      expectedStageReceiptSha256: partial.stageReceipt.sha256,
      receipt: partial.stageReceipt,
      repositoryRoot: "/repo",
    }),
    /non-prefix baseline activation state/,
  );
  assert.equal(harness.promotions.length, promotionCount);
});
