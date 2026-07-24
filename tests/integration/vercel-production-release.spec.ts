import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import {
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  type CommandInvocation,
  type CommandResult,
  readVercelProductionReleaseConfig,
  stageVercelProductionRelease,
  validateProductionDomains,
  validateProductionEnvironmentMetadata,
} from "../../scripts/lib/vercel-production-release";
import {
  cleanupVercelStagingWorktree,
  createVercelStagingSignalHandler,
  readReceiptOutputPath,
  writeVercelProductionStageReceipt,
} from "../../scripts/stage-vercel-production";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const releaseRunId = "019f6540-4c8c-7f1e-a014-cbc8f189b912";
const startedAt = new Date("2026-07-15T15:00:00.000Z");
const repositoryRoot = "/repo";
const temporaryRoot = path.join(
  realpathSync(os.tmpdir()),
  "sourcera-vercel-stage",
);
const worktreeRoot = path.join(temporaryRoot, "checkout");
const privateHome = path.join(temporaryRoot, "home");
const teamId = "team_6nIbCLwuaHPTHviqgckfTiyn";
const vercelToken = "vercel_test_explicit_release_credential";
const releaseEnvironment = {
  LANG: "en_US.UTF-8",
  PATH: "/safe/bin",
  VERCEL_TOKEN: vercelToken,
};

test("the pinned Vercel CLI retains every beta surface used by release safety", () => {
  const executable = path.join(process.cwd(), "node_modules", ".bin", "vercel");
  const run = (arguments_: string[], allowedStatuses = [0]) => {
    const result = spawnSync(executable, arguments_, {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.ok(
      allowedStatuses.includes(result.status ?? -1),
      result.stderr,
    );
    return `${result.stdout}${result.stderr}`;
  };
  assert.match(run(["--version"]), /56\.2\.0/);
  const apiHelp = run(["api", "--help"], [0, 2]);
  assert.match(apiHelp, /authenticated HTTP requests/);
  assert.match(apiHelp, /--raw/);
  assert.match(apiHelp, /--paginate/);
  const curlHelp = run(["curl", "--help"], [0, 2]);
  assert.match(curlHelp, /--deployment/);
  assert.match(curlHelp, /protection bypass/);
  for (const command of ["promote", "rollback"]) {
    const help = run([command, "--help"], [0, 2]);
    assert.match(help, /--timeout/);
    assert.match(help, /--yes/);
  }
});

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
        productionDomain: null,
        productionDomains: [],
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
          "www.sourcera-buyer-meetblakeys-projects.vercel.app",
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
    autoAssignCustomDomains: false,
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
    autoExposeSystemEnvs: target.autoExposeSystemEnvs,
    id: target.projectId,
    link: { productionBranch: target.productionBranch },
    name: target.projectName,
    rootDirectory: target.rootDirectory,
    sourceFilesOutsideRootDirectory: target.sourceFilesOutsideRootDirectory,
    targets: {
      production: {
        alias: target.productionDomains,
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

function productionDomainsReadback(
  application: "buyer" | "marketplace" | "seller",
) {
  const target = config.vercelProduction.targets.find(
    (candidate) => candidate.application === application,
  );
  assert.ok(target);
  return {
    domains: target.productionDomains.map((name) => ({
      apexName: name,
      customEnvironmentId: null,
      gitBranch: null,
      name,
      projectId: target.projectId,
      verified: true,
    })),
    pagination: { count: target.productionDomains.length, next: null, prev: null },
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
      if (operation.startsWith("worktree add --detach ")) return gitResult("");
      if (operation.startsWith("worktree remove --force ")) return gitResult("");
      if (operation === "worktree prune") return gitResult("");
      if (operation === "rev-parse HEAD") return gitResult(approvedSha);
      if (operation === "rev-parse --show-toplevel") {
        return gitResult(invocation.cwd);
      }
      if (operation === "rev-parse --absolute-git-dir") {
        return gitResult(`${repositoryRoot}/.git`);
      }
      if (operation === "rev-parse --path-format=absolute --git-common-dir") {
        return gitResult(`${repositoryRoot}/.git`);
      }
      if (operation === "symbolic-ref -q HEAD") {
        return { status: 1, stderr: "", stdout: "" };
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
      if (subject.includes("/env?")) {
        return gitResult(
          JSON.stringify({
            envs: [],
            hiddenProductionEnvCount: 0,
          }),
        );
      }
      if (subject.includes("/domains?")) {
        return gitResult(JSON.stringify(productionDomainsReadback(application)));
      }
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

  for (const [field, value] of [
    ["autoExposeSystemEnvs", false],
    ["cwd", "apps/buyer"],
    ["productionBranch", "release"],
    ["sourceFilesOutsideRootDirectory", false],
  ] as const) {
    assert.throws(
      () =>
        readVercelProductionReleaseConfig(
          {
            ...config,
            vercelProduction: {
              ...config.vercelProduction,
              targets: config.vercelProduction.targets.map((target, index) =>
                index === 1 ? { ...target, [field]: value } : target,
              ),
            },
          },
          repositoryRoot,
        ),
      new RegExp(field),
    );
  }
});

test("production environment metadata is exact and never accepts hidden keys", () => {
  const target = readVercelProductionReleaseConfig(
    config,
    repositoryRoot,
  ).targets[1]!;
  assert.doesNotThrow(() =>
    validateProductionEnvironmentMetadata(
      {
        envs: [
          {
            key: "CONVEX_PREVIEW_NAME",
            target: ["preview"],
            type: "encrypted",
            value: "redacted",
          },
        ],
        hiddenProductionEnvCount: 0,
      },
      target,
    ),
  );
  assert.throws(
    () =>
      validateProductionEnvironmentMetadata(
        {
          envs: [
            {
              key: "CONVEX_DEPLOY_KEY",
              target: ["production"],
              type: "encrypted",
              value: "redacted",
            },
          ],
          hiddenProductionEnvCount: 0,
        },
        target,
      ),
    /do not match the repo allowlist/,
  );
  assert.throws(
    () =>
      validateProductionEnvironmentMetadata(
        { envs: [], hiddenProductionEnvCount: 1 },
        target,
      ),
    /hidden production environment variables/,
  );
});

test("production domain metadata must equal the complete controlled alias set", () => {
  const target = readVercelProductionReleaseConfig(
    config,
    repositoryRoot,
  ).targets[1]!;
  assert.doesNotThrow(() =>
    validateProductionDomains(productionDomainsReadback("buyer"), target),
  );
  assert.throws(
    () =>
      validateProductionDomains(
        {
          domains: [
            ...productionDomainsReadback("buyer").domains,
            {
              apexName: "unexpected.example.com",
              customEnvironmentId: null,
              gitBranch: null,
              name: "unexpected.example.com",
              projectId: target.projectId,
              verified: true,
            },
          ],
          pagination: { count: 3, next: null, prev: null },
        },
        target,
      ),
    /do not match the repo pin/,
  );
  assert.throws(
    () =>
      validateProductionDomains(
        {
          ...productionDomainsReadback("buyer"),
          pagination: {
            count: productionDomainsReadback("buyer").domains.length,
            next: 123,
            prev: null,
          },
        },
        target,
      ),
    /pagination is incomplete/,
  );
});

test("production domain inventory requires complete reconciled pagination", () => {
  const target = readVercelProductionReleaseConfig(
    config,
    repositoryRoot,
  ).targets[1]!;
  const valid = productionDomainsReadback("buyer");
  const invalidInventories = [
    { domains: valid.domains },
    { ...valid, pagination: { count: valid.domains.length, next: null } },
    {
      ...valid,
      pagination: {
        count: valid.domains.length - 1,
        next: null,
        prev: null,
      },
    },
  ];
  for (const inventory of invalidInventories) {
    assert.throws(
      () => validateProductionDomains(inventory, target),
      /pagination|incomplete|count/,
    );
  }
});

test("canonical production targets retain the live Vercel identity contract", async () => {
  const canonical = JSON.parse(
    await readFile(
      path.join(process.cwd(), "config/production-targets.json"),
      "utf8",
    ),
  ) as Record<string, unknown>;
  const parsed = readVercelProductionReleaseConfig(
    { ...canonical, convexProduction: config.convexProduction },
    process.cwd(),
  );

  assert.deepEqual(
    parsed.targets.map((target) => ({
      allowedProductionEnvironmentKeys:
        target.allowedProductionEnvironmentKeys,
      application: target.application,
      autoExposeSystemEnvs: target.autoExposeSystemEnvs,
      cwd: target.cwd,
      productionBranch: target.productionBranch,
      productionDomain: target.productionDomain,
      productionDomains: target.productionDomains,
      projectId: target.projectId,
      projectName: target.projectName,
      rootDirectory: target.rootDirectory,
      sourceFilesOutsideRootDirectory: target.sourceFilesOutsideRootDirectory,
    })),
    [
      {
        allowedProductionEnvironmentKeys: [],
        application: "marketplace",
        autoExposeSystemEnvs: true,
        cwd: ".",
        productionBranch: "main",
        productionDomain: null,
        productionDomains: [],
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: () => {
          commandCount += 1;
          return { status: 1, stderr: "", stdout: "" };
        },
        worktreeRoot,
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
      ...releaseEnvironment,
      AWS_SESSION_TOKEN: "must-not-be-forwarded",
      DATABASE_PASSWORD: "must-not-be-forwarded",
      CONVEX_DEPLOY_KEY: "prod:key:must-not-be-forwarded",
      GITHUB_AUTH: "must-not-be-forwarded",
      HOME: "/caller/home",
      SESSION_COOKIE: "must-not-be-forwarded",
      SOURCERA_CONVEX_CANARY_SECRET: "must-not-be-forwarded",
      THIRD_PARTY_CREDENTIAL: "must-not-be-forwarded",
      UNRELATED_API_KEY: "must-not-be-forwarded",
      VERCEL_GIT_COMMIT_SHA: "must-not-be-forwarded",
      XDG_CONFIG_HOME: "/caller/xdg",
    },
    now: () => startedAt,
    releaseRunId,
    repositoryRoot,
    run: runner.run,
    worktreeRoot,
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
  assert.equal(
    receipt.applications[0].predecessorProviderGitSha,
    "f".repeat(40),
  );
  assert.equal(receipt.applications[0].productionDomain, null);
  assert.equal(receipt.applications[1].rootDirectory, "apps/buyer");
  assert.deepEqual(receipt.applications[0].health, healthReadback("marketplace"));

  const vercelInvocations = runner.invocations.filter(
    (invocation) => invocation.command === "vercel",
  );
  assert.equal(
    vercelInvocations.every((invocation) => invocation.cwd === worktreeRoot),
    true,
  );
  assert.deepEqual(
    vercelInvocations
      .filter(
        (invocation) =>
          invocation.arguments[0] === "api" &&
          config.vercelProduction.targets.some(
            (target) =>
              invocation.arguments[1] ===
              `/v9/projects/${target.projectId}?teamId=${teamId}`,
          ),
      )
      .map((invocation) => invocation.arguments[1]),
    [0, 1].flatMap(() =>
      config.vercelProduction.targets.map(
        (target) => `/v9/projects/${target.projectId}?teamId=${teamId}`,
      )
    ),
  );
  assert.deepEqual(
    vercelInvocations
      .filter((invocation) => invocation.arguments[0] === "deploy")
      .map((invocation) =>
        invocation.arguments[invocation.arguments.indexOf("--project") + 1]
      ),
    config.vercelProduction.targets.map((target) => target.projectId),
  );
  for (const invocation of vercelInvocations) {
    assert.equal(invocation.environment?.VERCEL_TOKEN, vercelToken);
    assert.equal(invocation.environment?.HOME, privateHome);
    assert.equal(
      invocation.environment?.XDG_CONFIG_HOME,
      path.join(privateHome, ".config"),
    );
    assert.equal(invocation.environment?.VERCEL_GIT_COMMIT_SHA, undefined);
    assert.equal(invocation.environment?.CONVEX_DEPLOY_KEY, undefined);
    assert.equal(
      invocation.environment?.SOURCERA_CONVEX_CANARY_SECRET,
      undefined,
    );
    for (const key of [
      "AWS_SESSION_TOKEN",
      "DATABASE_PASSWORD",
      "GITHUB_AUTH",
      "SESSION_COOKIE",
      "THIRD_PARTY_CREDENTIAL",
      "UNRELATED_API_KEY",
    ]) {
      assert.equal(invocation.environment?.[key], undefined);
    }
    if (invocation.arguments[0] !== "deploy") continue;
    const projectId = invocation.arguments[
      invocation.arguments.indexOf("--project") + 1
    ];
    const application = config.vercelProduction.targets.find(
      (target) => target.projectId === projectId,
    )?.application;
    assert.ok(application);
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
    assert.equal(
      invocation.arguments.filter(
        (argument) => argument === `SOURCERA_DOMAIN=${application}`,
      ).length,
      2,
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
  }
  assert.equal(
    vercelInvocations.filter((invocation) => invocation.arguments[0] === "api")
      .length,
    21,
  );
  assert.equal(
    vercelInvocations.filter((invocation) => invocation.arguments[0] === "curl")
      .length,
    3,
  );
  assert.deepEqual(
    runner.invocations
      .filter(
        (invocation) =>
          invocation.command === "git" &&
          invocation.arguments[0] === "worktree",
      )
      .map((invocation) => invocation.arguments),
    [
      ["worktree", "add", "--detach", worktreeRoot, approvedSha],
      ["worktree", "remove", "--force", worktreeRoot],
      ["worktree", "prune"],
    ],
  );
  for (const invocation of runner.invocations.filter(
    (candidate) => candidate.command === "git",
  )) {
    assert.equal(invocation.environment?.VERCEL_TOKEN, undefined);
    assert.equal(invocation.environment?.HOME, privateHome);
    assert.equal(invocation.environment?.PATH, releaseEnvironment.PATH);
  }
});

test("an explicit Vercel token is required before Git or Vercel is called", () => {
  let commandCount = 0;

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: { PATH: releaseEnvironment.PATH },
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: () => {
          commandCount += 1;
          return gitResult("");
        },
        worktreeRoot,
      }),
    /VERCEL_TOKEN/,
  );
  assert.equal(commandCount, 0);
});

test("staging canonicalizes a symlinked temporary worktree before use", async () => {
  const realParent = await mkdtemp(
    path.join(realpathSync(os.tmpdir()), "sourcera-vercel-real-"),
  );
  const aliasParent = await mkdtemp(
    path.join(realpathSync(os.tmpdir()), "sourcera-vercel-alias-"),
  );
  const alias = path.join(aliasParent, "linked-temp");
  await symlink(realParent, alias, "dir");
  const requestedWorktree = path.join(alias, "checkout");
  const canonicalWorktree = path.join(await realpath(realParent), "checkout");
  const runner = successfulRunner();

  try {
    stageVercelProductionRelease({
      approvedSha,
      config,
      environment: releaseEnvironment,
      now: () => startedAt,
      releaseRunId,
      repositoryRoot,
      run: runner.run,
      worktreeRoot: requestedWorktree,
    });
    assert.equal(
      runner.invocations
        .filter((invocation) => invocation.command === "vercel")
        .every((invocation) => invocation.cwd === canonicalWorktree),
      true,
    );
    assert.deepEqual(
      runner.invocations.find(
        (invocation) =>
          invocation.command === "git" &&
          invocation.arguments[0] === "worktree" &&
          invocation.arguments[1] === "add",
      )?.arguments,
      ["worktree", "add", "--detach", canonicalWorktree, approvedSha],
    );
  } finally {
    await rm(aliasParent, { force: true, recursive: true });
    await rm(realParent, { force: true, recursive: true });
  }
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
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
          ...releaseEnvironment,
          NODE_ENV: "test",
          VERCEL_GIT_COMMIT_SHA: "must-not-be-forwarded",
        },
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
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
      invocation.arguments[1] ===
        `/v9/projects/${config.vercelProduction.targets[1].projectId}?teamId=${teamId}`
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
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
        config.vercelProduction.targets.some(
          (target) =>
            invocation.arguments[1] ===
            `/v9/projects/${target.projectId}?teamId=${teamId}`,
        ),
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
      invocation.arguments[1] ===
        `/v9/projects/${config.vercelProduction.targets[0].projectId}?teamId=${teamId}`
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
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

test("a production predecessor must own every pinned production domain", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "vercel" &&
      invocation.arguments[0] === "api" &&
      invocation.arguments[1] ===
        `/v9/projects/${config.vercelProduction.targets[1].projectId}?teamId=${teamId}`
    ) {
      const project = projectReadback("buyer");
      return gitResult(
        JSON.stringify({
          ...project,
          targets: {
            production: {
              ...project.targets.production,
              alias: [config.vercelProduction.targets[1].productionDomain],
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /every pinned production domain/,
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
      invocation.arguments[1] ===
        `/v9/projects/${config.vercelProduction.targets[1].projectId}?teamId=${teamId}`
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
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
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

test("live Vercel project policy drift blocks all staging", () => {
  const drifts: Array<[string, Record<string, unknown>]> = [
    ["autoExposeSystemEnvs", { autoExposeSystemEnvs: false }],
    [
      "sourceFilesOutsideRootDirectory",
      { sourceFilesOutsideRootDirectory: false },
    ],
    ["productionBranch", { link: { productionBranch: "release" } }],
  ];

  for (const [message, drift] of drifts) {
    const runner = successfulRunner();
    const originalRun = runner.run;
    runner.run = (invocation) => {
      if (
        invocation.command === "vercel" &&
        invocation.arguments[0] === "api" &&
        invocation.arguments[1] ===
          `/v9/projects/${config.vercelProduction.targets[1].projectId}?teamId=${teamId}`
      ) {
        runner.invocations.push(invocation);
        return gitResult(
          JSON.stringify({ ...projectReadback("buyer"), ...drift }),
        );
      }
      return originalRun(invocation);
    };

    assert.throws(
      () =>
        stageVercelProductionRelease({
          approvedSha,
          config,
          environment: releaseEnvironment,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
          worktreeRoot,
        }),
      new RegExp(message),
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
          invocation.command === "git" &&
          invocation.arguments.join(" ") ===
            `worktree remove --force ${worktreeRoot}`,
      ).length,
      1,
    );
  }
});

test("a dirty detached staging worktree blocks before Vercel and is removed", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  runner.run = (invocation) => {
    if (
      invocation.command === "git" &&
      invocation.cwd === worktreeRoot &&
      invocation.arguments[0] === "status"
    ) {
      runner.invocations.push(invocation);
      return gitResult("?? injected-after-checkout.txt");
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /detached staging worktree.*clean/i,
  );
  assert.equal(
    runner.invocations.some((invocation) => invocation.command === "vercel"),
    false,
  );
  assert.equal(
    runner.invocations.filter(
      (invocation) =>
        invocation.command === "git" &&
        invocation.arguments.join(" ") ===
          `worktree remove --force ${worktreeRoot}`,
    ).length,
    1,
  );
});

test("a staging failure removes the detached worktree before returning", () => {
  const runner = successfulRunner({
    marketplace: { readyState: "BUILDING" },
  });

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /READY/,
  );
  assert.deepEqual(
    runner.invocations
      .filter(
        (invocation) =>
          invocation.command === "git" &&
          invocation.arguments[0] === "worktree",
      )
      .map((invocation) => invocation.arguments),
    [
      ["worktree", "add", "--detach", worktreeRoot, approvedSha],
      ["worktree", "remove", "--force", worktreeRoot],
      ["worktree", "prune"],
    ],
  );
});

test("primary checkout drift after staging prevents the receipt", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  let worktreeRemoved = false;
  runner.run = (invocation) => {
    if (
      invocation.command === "git" &&
      invocation.arguments.join(" ") ===
        `worktree remove --force ${worktreeRoot}`
    ) {
      worktreeRemoved = true;
      return originalRun(invocation);
    }
    if (
      worktreeRemoved &&
      invocation.command === "git" &&
      invocation.cwd === repositoryRoot &&
      invocation.arguments.join(" ") === "rev-parse HEAD"
    ) {
      runner.invocations.push(invocation);
      return gitResult("a".repeat(40));
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /Approved SHA must exactly match Git HEAD/,
  );
  assert.equal(worktreeRemoved, true);
  assert.equal(
    runner.invocations.filter(
      (invocation) => invocation.arguments[0] === "deploy",
    ).length,
    3,
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
          environment: releaseEnvironment,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
          worktreeRoot,
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

test("a staged candidate cannot own a secondary pinned production domain", () => {
  const secondaryDomain = config.vercelProduction.targets[1]
    .productionDomains[1]!;
  const runner = successfulRunner({ buyer: { alias: [secondaryDomain] } });

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /buyer deployment is not STAGED/,
  );
});

test("ordinary staged readback requires exact no-traffic evidence", () => {
  const invalidReadbacks: Array<[string, Record<string, unknown>]> = [
    ["missing auto assignment policy", { autoAssignCustomDomains: undefined }],
    ["non-boolean auto assignment policy", { autoAssignCustomDomains: "false" }],
    ["missing alias assignment state", { aliasAssigned: undefined }],
    ["assigned alias state", { aliasAssigned: true }],
    ["unrelated assigned alias", { alias: ["preview.example.com"] }],
    ["non-array alias", { alias: "preview.example.com" }],
    ["non-array automatic aliases", { automaticAliases: "preview.example.com" }],
    ["malformed user aliases", { userAliases: [42] }],
  ];

  for (const [name, override] of invalidReadbacks) {
    const runner = successfulRunner({ buyer: override });
    assert.throws(
      () =>
        stageVercelProductionRelease({
          approvedSha,
          config,
          environment: releaseEnvironment,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
          worktreeRoot,
        }),
      /not STAGED|alias/i,
      name,
    );
  }
});

test("domain drift after deploy blocks the ordinary stage receipt", () => {
  const runner = successfulRunner();
  const originalRun = runner.run;
  let buyerDomainReads = 0;
  runner.run = (invocation) => {
    if (
      invocation.command === "vercel" &&
      invocation.arguments[0] === "api" &&
      invocation.arguments[1] ===
        `/v9/projects/${config.vercelProduction.targets[1].projectId}/domains?production=true&limit=100&teamId=${teamId}`
    ) {
      buyerDomainReads += 1;
      if (buyerDomainReads > 1) {
        runner.invocations.push(invocation);
        return gitResult(
          JSON.stringify({
            domains: [],
            pagination: { count: 0, next: null, prev: null },
          }),
        );
      }
    }
    return originalRun(invocation);
  };

  assert.throws(
    () =>
      stageVercelProductionRelease({
        approvedSha,
        config,
        environment: releaseEnvironment,
        now: () => startedAt,
        releaseRunId,
        repositoryRoot,
        run: runner.run,
        worktreeRoot,
      }),
    /production domains do not match the repo pin/,
  );
  assert.equal(buyerDomainReads, 2);
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
          environment: releaseEnvironment,
          now: () => startedAt,
          releaseRunId,
          repositoryRoot,
          run: runner.run,
          worktreeRoot,
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
    environment: releaseEnvironment,
    now: () => startedAt,
    releaseRunId,
    repositoryRoot,
    run: runner.run,
    worktreeRoot,
  });
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-vercel-stage-"),
  );
  const receiptPath = path.join(temporaryDirectory, "receipt.json");
  try {
    assert.throws(
      () => readReceiptOutputPath([], process.cwd()),
      /--receipt-out/,
    );
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

test("CLI signal cleanup removes the worktree and temporary directory once", () => {
  const invocations: CommandInvocation[] = [];
  const removedDirectories: string[] = [];
  const cleanup = () =>
    cleanupVercelStagingWorktree({
      environment: {
        HOME: "/caller/home",
        UNRELATED_API_KEY: "must-not-reach-git",
        VERCEL_TOKEN: vercelToken,
      },
      removeDirectory: (directory) => {
        removedDirectories.push(directory);
      },
      repositoryRoot,
      run: (invocation) => {
        invocations.push(invocation);
        return gitResult("");
      },
      temporaryRoot,
      worktreeRoot,
    });
  const events: string[] = [];
  const handler = createVercelStagingSignalHandler(
    "SIGTERM",
    () => {
      events.push("cleanup");
      cleanup();
    },
    (exitCode) => {
      events.push(`exit:${exitCode}`);
    },
  );

  handler();
  handler();

  assert.deepEqual(events, ["cleanup", "exit:143"]);
  assert.deepEqual(
    invocations.map((invocation) => invocation.arguments),
    [
      ["worktree", "remove", "--force", worktreeRoot],
      ["worktree", "prune"],
    ],
  );
  assert.equal(
    invocations.every(
      (invocation) =>
        invocation.environment?.HOME === privateHome &&
        invocation.environment.VERCEL_TOKEN === undefined &&
        invocation.environment.UNRELATED_API_KEY === undefined,
    ),
    true,
  );
  assert.deepEqual(removedDirectories, [temporaryRoot]);
});
