import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  type CommandInvocation,
  type CommandResult,
  readVercelProductionReleaseConfig,
  stageVercelProductionRelease,
} from "../../scripts/lib/vercel-production-release";
import {
  readReceiptOutputPath,
  writeVercelProductionStageReceipt,
} from "../../scripts/stage-vercel-production";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const releaseRunId = "019f6540-4c8c-7f1e-a014-cbc8f189b912";
const startedAt = new Date("2026-07-15T15:00:00.000Z");
const repositoryRoot = "/repo";
const teamId = "team_6nIbCLwuaHPTHviqgckfTiyn";

const config = {
  convexProduction: {
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
  },
  vercelProduction: {
    teamId,
    targets: [
      {
        application: "marketplace",
        cwd: ".",
        productionDomain: null,
        projectId: "prj_FIBSOffJX8GtY8JHTSXKixfVryBp",
        projectName: "sourcera",
        rootDirectory: null,
      },
      {
        application: "buyer",
        cwd: ".",
        productionDomain: "sourcera-buyer-meetblakeys-projects.vercel.app",
        projectId: "prj_ZbZgRUXjPzgv6Oqepe13W6yV2AyN",
        projectName: "sourcera-buyer",
        rootDirectory: "apps/buyer",
      },
      {
        application: "seller",
        cwd: ".",
        productionDomain: "sourcera-seller-meetblakeys-projects.vercel.app",
        projectId: "prj_Vd0Roi2q0XPkphCrn8rtoNxI1DkS",
        projectName: "sourcera-seller",
        rootDirectory: "apps/seller",
      },
    ],
  },
};

const deploymentIds = {
  buyer: "dpl_buyer_new",
  marketplace: "dpl_marketplace_new",
  seller: "dpl_seller_new",
};

function gitResult(stdout: string): CommandResult {
  return { status: 0, stderr: "", stdout: `${stdout}\n` };
}

function deploymentReadback(
  application: "buyer" | "marketplace" | "seller",
  overrides: Record<string, unknown> = {},
) {
  const target = config.vercelProduction.targets.find(
    (candidate) => candidate.application === application,
  );
  assert.ok(target);
  return {
    alias: [],
    aliasAssigned: false,
    createdAt: startedAt.getTime(),
    id: deploymentIds[application],
    meta: {
      githubCommitSha: approvedSha,
      sourceraReleaseApprovedSha: approvedSha,
      sourceraReleaseRunId: releaseRunId,
    },
    name: target.projectName,
    rootDirectory: target.rootDirectory,
    ownerId: teamId,
    projectId: target.projectId,
    readyState: "READY",
    readySubstate: "STAGED",
    source: "cli",
    target: "production",
    url: `${target.projectName}-${releaseRunId}.vercel.app`,
    ...overrides,
  };
}

function projectReadback(
  application: "buyer" | "marketplace" | "seller",
) {
  const target = config.vercelProduction.targets.find(
    (candidate) => candidate.application === application,
  );
  assert.ok(target);
  return {
    accountId: teamId,
    id: target.projectId,
    name: target.projectName,
    rootDirectory: target.rootDirectory,
    targets: {
      production: {
        alias: target.productionDomain ? [target.productionDomain] : [],
        createdAt: startedAt.getTime() - 60_000,
        id: `dpl_${application}_previous`,
        meta: { githubCommitSha: "f".repeat(40) },
        name: target.projectName,
        readyState: "READY",
        target: "production",
        teamId,
        url: `${target.projectName}-previous.vercel.app`,
      },
    },
  };
}

function healthReadback(application: "buyer" | "marketplace" | "seller") {
  return {
    checkedAt: startedAt.toISOString(),
    commitSha: approvedSha,
    domain: application,
    environment: "production",
    service: "sourcera",
    status: "ok",
  };
}

function successfulRunner(
  overrides: Partial<
    Record<"buyer" | "marketplace" | "seller", Record<string, unknown>>
  > = {},
) {
  const invocations: CommandInvocation[] = [];
  const run = (invocation: CommandInvocation): CommandResult => {
    invocations.push(invocation);
    if (invocation.command === "git") {
      const operation = invocation.arguments.join(" ");
      if (operation === "rev-parse HEAD") return gitResult(approvedSha);
      if (operation === "rev-parse --show-toplevel") {
        return gitResult(repositoryRoot);
      }
      if (operation === "rev-parse --absolute-git-dir") {
        return gitResult(`${repositoryRoot}/.git`);
      }
      if (operation === "rev-parse --path-format=absolute --git-common-dir") {
        return gitResult(`${repositoryRoot}/.git`);
      }
      if (operation === "status --porcelain=v1 --untracked-files=all") {
        return gitResult("");
      }
    }

    const subject = invocation.arguments[1] ?? "";
    const projectArgument = invocation.arguments[
      invocation.arguments.indexOf("--project") + 1
    ];
    const deploymentArgument = invocation.arguments[
      invocation.arguments.indexOf("--deployment") + 1
    ];
    const target = config.vercelProduction.targets.find((candidate) => {
      const application = candidate.application as keyof typeof deploymentIds;
      return (
        subject.includes(candidate.projectId) ||
        projectArgument === candidate.projectId ||
        subject.includes(deploymentIds[application]) ||
        deploymentArgument === deploymentIds[application]
      );
    });
    assert.ok(target, `unexpected cwd: ${invocation.cwd}`);
    const application = target.application as keyof typeof deploymentIds;

    if (invocation.arguments[0] === "api") {
      if (subject.startsWith("/v9/projects/")) {
        return gitResult(JSON.stringify(projectReadback(application)));
      }
      return gitResult(
        JSON.stringify(deploymentReadback(application, overrides[application])),
      );
    }
    if (invocation.arguments[0] === "deploy") {
      return gitResult(JSON.stringify({ id: deploymentIds[application] }));
    }
    if (invocation.arguments[0] === "curl") {
      return gitResult(JSON.stringify(healthReadback(application)));
    }
    throw new Error(`unexpected command: ${invocation.arguments.join(" ")}`);
  };
  return { invocations, run };
}

test("production config requires the exact Marketplace, Buyer, Seller order", () => {
  const parsed = readVercelProductionReleaseConfig(config, repositoryRoot);

  assert.deepEqual(
    parsed.targets.map((target) => target.application),
    ["marketplace", "buyer", "seller"],
  );
  assert.equal(parsed.teamId, teamId);
  assert.equal(parsed.convexTarget.deploymentName, "careful-otter-123");

  assert.throws(
    () =>
      readVercelProductionReleaseConfig(
        {
          ...config,
          vercelProduction: {
            ...config.vercelProduction,
            targets: [...config.vercelProduction.targets].reverse(),
          },
        },
        repositoryRoot,
      ),
    /Marketplace, Buyer, Seller order/,
  );
  assert.throws(
    () =>
      readVercelProductionReleaseConfig(
        {
          ...config,
          convexProduction: {
            deploymentName: null,
            deploymentUrl: null,
          },
        },
        repositoryRoot,
      ),
    /Convex production target/,
  );
  assert.throws(
    () =>
      readVercelProductionReleaseConfig(
        {
          ...config,
          vercelProduction: {
            ...config.vercelProduction,
            targets: config.vercelProduction.targets.map((target, index) =>
              index === 0
                ? { ...target, productionDomain: "https://not-a-hostname" }
                : target,
            ),
          },
        },
        repositoryRoot,
      ),
    /productionDomain/,
  );
});

test("an unpinned Convex target blocks before any Git or Vercel command", () => {
  let commandCount = 0;
  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config: {
          ...config,
          convexProduction: {
            deploymentName: null,
            deploymentUrl: null,
          },
        },
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: () => {
          commandCount += 1;
          return { status: 1, stderr: "", stdout: "" };
        },
      }),
    /Convex production target/,
  );
  assert.equal(commandCount, 0);
});

test("staging captures all predecessors, stages in order, and returns one receipt", () => {
  const runner = successfulRunner();
  const receipt = stageVercelProductionRelease({
    approvedSha,
    config,
    environment: {
      NODE_ENV: "test",
      VERCEL_GIT_COMMIT_SHA: "must-not-be-forwarded",
    },
    now: () => startedAt,
    releaseRunId,
    repositoryRoot,
    run: runner.run,
  });

  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.event, "vercel_production_stage_receipt");
  assert.equal(receipt.releaseRunId, releaseRunId);
  assert.equal(receipt.approvedSha, approvedSha);
  assert.equal(receipt.teamId, teamId);
  assert.deepEqual(receipt.convexTarget, config.convexProduction);
  assert.deepEqual(
    receipt.applications.map((application) => application.application),
    ["marketplace", "buyer", "seller"],
  );
  assert.deepEqual(
    receipt.applications.map((application) => application.substate),
    ["STAGED", "STAGED", "STAGED"],
  );
  assert.equal(
    receipt.applications[0].predecessorDeploymentId,
    "dpl_marketplace_previous",
  );
  assert.equal(receipt.applications[0].productionDomain, null);
  assert.equal(receipt.applications[1].rootDirectory, "apps/buyer");
  assert.deepEqual(receipt.applications[0].health, healthReadback("marketplace"));

  const vercelInvocations = runner.invocations.filter(
    (invocation) => invocation.command === "vercel",
  );
  assert.deepEqual(
    vercelInvocations.slice(0, 3).map((invocation) => invocation.arguments[1]),
    [
      `/v9/projects/${config.vercelProduction.targets[0].projectId}?teamId=${teamId}`,
      `/v9/projects/${config.vercelProduction.targets[1].projectId}?teamId=${teamId}`,
      `/v9/projects/${config.vercelProduction.targets[2].projectId}?teamId=${teamId}`,
    ],
  );
  assert.deepEqual(
    vercelInvocations
      .filter((invocation) => invocation.arguments[0] === "deploy")
      .map((invocation) =>
        invocation.arguments[invocation.arguments.indexOf("--project") + 1]
      ),
    config.vercelProduction.targets.map((target) => target.projectId),
  );
  for (const invocation of vercelInvocations.filter(
    (candidate) => candidate.arguments[0] === "deploy",
  )) {
    assert.deepEqual(invocation.arguments.slice(0, 4), [
      "deploy",
      "--prod",
      "--skip-domain",
      "--project",
    ]);
    assert.ok(
      invocation.arguments.includes(
        `SOURCERA_RELEASE_APPROVED_SHA=${approvedSha}`,
      ),
    );
    assert.ok(
      invocation.arguments.includes(`sourceraReleaseRunId=${releaseRunId}`),
    );
    assert.ok(
      invocation.arguments.includes(`sourceraReleaseApprovedSha=${approvedSha}`),
    );
    assert.equal(
      invocation.arguments.some((argument) =>
        argument.startsWith("VERCEL_GIT_COMMIT_SHA="),
      ),
      false,
    );
    assert.equal(invocation.environment?.VERCEL_GIT_COMMIT_SHA, undefined);
  }
  assert.equal(
    vercelInvocations.filter((invocation) => invocation.arguments[0] === "api")
      .length,
    6,
  );
  assert.equal(
    vercelInvocations.filter((invocation) => invocation.arguments[0] === "curl")
      .length,
    3,
  );
});

test("an unclean checkout is rejected before Vercel is called", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "git" &&
      invocation.arguments[0] === "status"
    ) {
      return gitResult("?? untracked.txt");
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
      }),
    /clean primary checkout/,
  );
  assert.equal(
    runner.invocations.some((invocation) => invocation.command === "vercel"),
    false,
  );
});

test("a linked worktree is rejected before Vercel is called", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "git" &&
      invocation.arguments.join(" ") === "rev-parse --absolute-git-dir"
    ) {
      return gitResult(`${repositoryRoot}/.git/worktrees/release`);
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: {
          NODE_ENV: "test",
          VERCEL_GIT_COMMIT_SHA: "must-not-be-forwarded",
        },
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
      }),
    /clean primary checkout/,
  );
  assert.equal(
    runner.invocations.some((invocation) => invocation.command === "vercel"),
    false,
  );
});

test("a missing predecessor rejects the run before the first deploy", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "vercel" &&
      invocation.arguments[0] === "api" &&
      invocation.arguments[1].startsWith(
        `/v9/projects/${config.vercelProduction.targets[1].projectId}`,
      )
    ) {
      runner.invocations.push(invocation);
      return gitResult(
        JSON.stringify({
          ...projectReadback("buyer"),
          targets: {},
        }),
      );
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
      }),
    /production predecessor/,
  );
  assert.equal(
    runner.invocations.some(
      (invocation) => invocation.arguments[0] === "deploy",
    ),
    false,
  );
  assert.equal(
    runner.invocations.filter(
      (invocation) =>
        invocation.command === "vercel" &&
        invocation.arguments[1]?.startsWith("/v9/projects/"),
    ).length,
    3,
  );
});

test("a predecessor must be the READY production target of its pinned project", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "vercel" &&
      invocation.arguments[0] === "api" &&
      invocation.arguments[1].startsWith(
        `/v9/projects/${config.vercelProduction.targets[0].projectId}`,
      )
    ) {
      return gitResult(
        JSON.stringify({
          ...projectReadback("marketplace"),
          targets: {
            production: {
              ...projectReadback("marketplace").targets.production,
              readyState: "ERROR",
            },
          },
        }),
      );
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
      }),
    /production predecessor.*READY/,
  );
  assert.equal(
    runner.invocations.some(
      (invocation) => invocation.arguments[0] === "deploy",
    ),
    false,
  );
});

test("live Vercel rootDirectory drift blocks all staging", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "vercel" &&
      invocation.arguments[0] === "api" &&
      invocation.arguments[1].startsWith(
        `/v9/projects/${config.vercelProduction.targets[1].projectId}`,
      )
    ) {
      runner.invocations.push(invocation);
      return gitResult(
        JSON.stringify({
          ...projectReadback("buyer"),
          rootDirectory: "apps/wrong-buyer",
        }),
      );
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
      }),
    /rootDirectory/,
  );
  assert.equal(
    runner.invocations.some(
      (invocation) => invocation.arguments[0] === "deploy",
    ),
    false,
  );
});

test("partial staging emits no receipt when authenticated readback is wrong", () => {
  const invalidReadbacks: Array<[string, Record<string, unknown>]> = [
    ["nonce", { meta: { githubCommitSha: approvedSha } }],
    [
      "provider SHA",
      {
        meta: {
          githubCommitSha: "a".repeat(40),
          sourceraReleaseApprovedSha: approvedSha,
          sourceraReleaseRunId: releaseRunId,
        },
      },
    ],
    ["project", { projectId: "prj_wrong" }],
    ["team", { ownerId: "team_wrong" }],
    ["target", { target: "preview" }],
    ["READY", { readyState: "BUILDING" }],
    ["STAGED", { readySubstate: "PROMOTED" }],
    ["STAGED", { autoAssignCustomDomains: true }],
    ["this release run", { createdAt: startedAt.getTime() - 1 }],
    ["CLI source", { source: "git" }],
    [
      "provider SHA",
      {
        gitSource: { sha: approvedSha },
        meta: {
          sourceraReleaseApprovedSha: approvedSha,
          sourceraReleaseRunId: releaseRunId,
        },
      },
    ],
    [
      "project",
      {
        project: {
          id: "prj_wrong",
          name: config.vercelProduction.targets[0].projectName,
        },
      },
    ],
    [
      "team",
      { team: { id: "team_wrong" } },
    ],
    [
      "build marker",
      { buildEnv: { SOURCERA_COMMIT_SHA: "a".repeat(40) } },
    ],
  ];

  for (const [message, override] of invalidReadbacks) {
    const runner = successfulRunner({ marketplace: override });
    assert.throws(
      () =>
        stageVercelProductionRelease({
          approvedSha,
          config,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
        }),
      new RegExp(message),
    );
    assert.equal(
      runner.invocations.filter(
        (invocation) => invocation.arguments[0] === "deploy",
      ).length,
      1,
    );
  }
});

test("health proof must match commit, application, and production", () => {
  const invalidHealth = [
    { ...healthReadback("marketplace"), commitSha: "a".repeat(40) },
    { ...healthReadback("marketplace"), domain: "buyer" },
    { ...healthReadback("marketplace"), environment: "staging" },
    { ...healthReadback("marketplace"), status: "error" },
    {
      ...healthReadback("marketplace"),
      checkedAt: new Date(startedAt.getTime() - 1).toISOString(),
    },
  ];

  for (const health of invalidHealth) {
    const runner = successfulRunner();
    const originalRun = runner.run;
    runner.run = (invocation) => {
      if (
        invocation.command === "vercel" &&
        invocation.arguments[0] === "curl"
      ) {
        return gitResult(JSON.stringify(health));
      }
      return originalRun(invocation);
    };
    assert.throws(
      () =>
        stageVercelProductionRelease({
          approvedSha,
          config,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
        }),
      /health proof/,
    );
  }
});

test("the CLI receipt writer is atomic, complete-only, and non-overwriting", async () => {
  const runner = successfulRunner();
  const receipt = stageVercelProductionRelease({
    approvedSha,
    config,
    now: () => startedAt,
    releaseRunId,
    repositoryRoot,
    run: runner.run,
  });
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-vercel-stage-"),
  );
  const receiptPath = path.join(temporaryDirectory, "receipt.json");
  try {
    assert.equal(
      readReceiptOutputPath(["--receipt-out", receiptPath], process.cwd()),
      path.join(await realpath(temporaryDirectory), "receipt.json"),
    );
    assert.throws(
      () =>
        readReceiptOutputPath(
          ["--receipt-out", `${process.cwd()}/reports/stage-receipt.json`],
          process.cwd(),
        ),
      /outside the repository/,
    );
    await assert.rejects(
      writeVercelProductionStageReceipt(
        path.join(process.cwd(), "package.json"),
        receipt,
      ),
      /outside the repository/,
    );
    await writeVercelProductionStageReceipt(receiptPath, receipt);
    assert.deepEqual(JSON.parse(await readFile(receiptPath, "utf8")), receipt);

    await assert.rejects(
      writeVercelProductionStageReceipt(receiptPath, receipt),
      /already exists/,
    );
    await assert.rejects(
      writeVercelProductionStageReceipt(
        path.join(temporaryDirectory, "partial.json"),
        { ...receipt, applications: receipt.applications.slice(0, 2) },
      ),
      /complete staged application set/,
    );
    await assert.rejects(readFile(path.join(temporaryDirectory, "partial.json")));

    const stalePath = path.join(temporaryDirectory, "stale.json");
    await writeFile(stalePath, "stale\n", "utf8");
    await assert.rejects(
      writeVercelProductionStageReceipt(stalePath, receipt),
      /already exists/,
    );
    assert.equal(await readFile(stalePath, "utf8"), "stale\n");
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});
