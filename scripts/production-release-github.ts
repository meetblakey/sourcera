import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectGithubApprovalEvidence,
  createProductionReleaseLaneEnvironment,
  type ProductionReleaseArguments,
} from "./release-production";
import type { ProductionBootstrapAnchorIdentity } from "./lib/production-release-controller";
import {
  createProductionGithubHandoff,
  readProductionPreflightBundle,
  readProductionWorkflowIdentity,
} from "./lib/production-release-workflow";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const FORBIDDEN_PROVIDER_CREDENTIALS = [
  "CONVEX_DEPLOY_KEY",
  "SOURCERA_CONVEX_CANARY_SECRET",
  "VERCEL_TOKEN",
] as const;
const GITHUB_WORKFLOW_PATH =
  /^\.github\/workflows\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:yml|yaml)$/;

function requiredEnvironment(key: string) {
  const value = process.env[key];
  if (!value?.trim() || value !== value.trim()) {
    throw new Error(`${key} is required for GitHub production proof`);
  }
  return value;
}

function optionalEnvironment(key: string) {
  const value = process.env[key];
  if (value === undefined || value === "") return undefined;
  if (!value.trim() || value !== value.trim()) {
    throw new Error(`${key} is invalid`);
  }
  return value;
}

export function readProductionExpiredAnchorIdentity(
  raw: string,
): ProductionBootstrapAnchorIdentity {
  let identity: Record<string, unknown>;
  try {
    const parsedIdentity = JSON.parse(raw) as unknown;
    if (
      typeof parsedIdentity !== "object" ||
      parsedIdentity === null ||
      Array.isArray(parsedIdentity)
    ) {
      throw new Error("not an object");
    }
    identity = parsedIdentity as Record<string, unknown>;
  } catch (cause) {
    throw new Error("Expired-anchor identity JSON is invalid", { cause });
  }
  const expectedKeys = [
    "artifactDigest",
    "artifactId",
    "artifactName",
    "expired",
    "runAttempt",
    "runId",
    "sha",
    "workflowPath",
  ].sort();
  if (
    Object.keys(identity).sort().some(
      (key, index) => key !== expectedKeys[index],
    ) ||
    Object.keys(identity).length !== expectedKeys.length
  ) {
    throw new Error("Expired-anchor identity fields are invalid");
  }
  const artifactId = Number(identity.artifactId);
  const runAttempt = Number(identity.runAttempt);
  const runId = Number(identity.runId);
  if (
    !Number.isSafeInteger(artifactId) ||
    artifactId < 1 ||
    !Number.isSafeInteger(runAttempt) ||
    runAttempt < 1 ||
    !Number.isSafeInteger(runId) ||
    runId < 1 ||
    !/^[a-f0-9]{40}$/i.test(String(identity.sha)) ||
    !/^sha256:[a-f0-9]{64}$/.test(String(identity.artifactDigest)) ||
    typeof identity.artifactName !== "string" ||
    identity.expired !== true ||
    !GITHUB_WORKFLOW_PATH.test(String(identity.workflowPath))
  ) {
    throw new Error("Expired-anchor identity is invalid");
  }
  return {
    artifactDigest: String(identity.artifactDigest),
    artifactId,
    artifactName: identity.artifactName,
    expired: true,
    runAttempt,
    runId,
    sha: String(identity.sha),
    workflowPath: String(identity.workflowPath),
  };
}

function outsideRepository(value: string, option: string) {
  let ancestor = path.resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  const output = path.join(realpathSync(ancestor), ...missing);
  const relative = path.relative(repositoryRoot, output);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error(`${option} must remain outside the repository`);
  }
  return output;
}

function readArguments(arguments_: string[]) {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (
      ![
        "--anchor-mode",
        "--known-good-dir",
        "--out-dir",
        "--preflight-dir",
        "--vercel-baseline-dir",
      ].includes(
        option ?? "",
      ) ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error(
        "Usage: production-release-github --anchor-mode <normal|genesis> --preflight-dir <path> [--known-good-dir <path> | --vercel-baseline-dir <path>] --out-dir <path>",
      );
    }
    values.set(option, value);
  }
  const anchorMode = values.get("--anchor-mode");
  if (anchorMode !== "normal" && anchorMode !== "genesis") {
    throw new Error("--anchor-mode must be exactly normal or genesis");
  }
  if (
    !values.has("--preflight-dir") ||
    !values.has("--out-dir") ||
    (anchorMode === "normal") !== values.has("--known-good-dir") ||
    (anchorMode === "genesis") !== values.has("--vercel-baseline-dir")
  ) {
    throw new Error(
      "normal requires one known-good directory; genesis requires one Vercel baseline directory",
    );
  }
  const outputDirectory = outsideRepository(values.get("--out-dir")!, "--out-dir");
  if (existsSync(outputDirectory)) {
    throw new Error("--out-dir must not already exist");
  }
  return {
    anchorMode: anchorMode as ProductionReleaseArguments["anchorMode"],
    knownGoodDirectory: values.has("--known-good-dir")
      ? outsideRepository(values.get("--known-good-dir")!, "--known-good-dir")
      : undefined,
    outputDirectory,
    preflightDirectory: outsideRepository(
      values.get("--preflight-dir")!,
      "--preflight-dir",
    ),
    vercelBaselineDirectory: values.has("--vercel-baseline-dir")
      ? outsideRepository(
          values.get("--vercel-baseline-dir")!,
          "--vercel-baseline-dir",
        )
      : undefined,
  };
}

export async function main(arguments_ = process.argv.slice(2)) {
  for (const key of FORBIDDEN_PROVIDER_CREDENTIALS) {
    if (process.env[key] !== undefined) {
      throw new Error(`GitHub proof lane forbids ${key}`);
    }
  }
  const parsed = readArguments(arguments_);
  const identity = readProductionWorkflowIdentity({
    approvedSha: requiredEnvironment("SOURCERA_RELEASE_APPROVED_SHA"),
    repository: requiredEnvironment("GITHUB_REPOSITORY"),
    runAttempt: Number(requiredEnvironment("GITHUB_RUN_ATTEMPT")),
    runId: Number(requiredEnvironment("GITHUB_RUN_ID")),
  });
  const knownGoodSha = requiredEnvironment("SOURCERA_KNOWN_GOOD_SHA");
  const preflight = await readProductionPreflightBundle(
    parsed.preflightDirectory,
    identity,
  );
  let knownGoodReleaseReceipt: unknown | undefined;
  if (parsed.anchorMode === "normal") {
    const knownGoodRunId = requiredEnvironment("SOURCERA_KNOWN_GOOD_RUN_ID");
    const knownGoodRunAttempt = requiredEnvironment(
      "SOURCERA_KNOWN_GOOD_RUN_ATTEMPT",
    );
    const knownGoodArtifactName = requiredEnvironment(
      "SOURCERA_KNOWN_GOOD_ARTIFACT_NAME",
    );
    const knownGoodArtifactDigest = requiredEnvironment(
      "SOURCERA_KNOWN_GOOD_ARTIFACT_DIGEST",
    );
    if (
      !Number.isSafeInteger(Number(knownGoodRunId)) ||
      Number(knownGoodRunId) < 1 ||
      !Number.isSafeInteger(Number(knownGoodRunAttempt)) ||
      Number(knownGoodRunAttempt) < 1 ||
      knownGoodArtifactName !==
        `production-release-${knownGoodSha}-${knownGoodRunId}-${knownGoodRunAttempt}` ||
      !/^sha256:[a-f0-9]{64}$/.test(knownGoodArtifactDigest)
    ) {
      throw new Error("known-good production artifact identity is invalid");
    }
    const receiptPath = path.join(
      parsed.knownGoodDirectory!,
      `production-release-${knownGoodRunId}-${knownGoodRunAttempt}.json`,
    );
    if (!existsSync(receiptPath)) {
      throw new Error("known-good production release receipt is missing");
    }
    knownGoodReleaseReceipt = JSON.parse(readFileSync(receiptPath, "utf8"));
  }
  let vercelBaselineInput:
    | Parameters<typeof collectGithubApprovalEvidence>[5]
    | undefined;
  if (parsed.anchorMode === "genesis") {
    const activationReceiptPath = path.join(
      parsed.vercelBaselineDirectory!,
      "vercel-production-baseline-activation.json",
    );
    const stageReceiptPath = path.join(
      parsed.vercelBaselineDirectory!,
      "vercel-baseline-stage",
      "vercel-production-baseline-stage.json",
    );
    if (!existsSync(activationReceiptPath) || !existsSync(stageReceiptPath)) {
      throw new Error("Vercel baseline activation artifact is incomplete");
    }
    vercelBaselineInput = {
      activationReceiptRaw: readFileSync(activationReceiptPath, "utf8"),
      artifactDigest: requiredEnvironment(
        "SOURCERA_VERCEL_BASELINE_ARTIFACT_DIGEST",
      ),
      artifactName: requiredEnvironment(
        "SOURCERA_VERCEL_BASELINE_ARTIFACT_NAME",
      ),
      runAttempt: Number(
        requiredEnvironment("SOURCERA_VERCEL_BASELINE_RUN_ATTEMPT"),
      ),
      runId: Number(requiredEnvironment("SOURCERA_VERCEL_BASELINE_RUN_ID")),
      sha: requiredEnvironment("SOURCERA_VERCEL_BASELINE_SHA"),
      stageReceiptRaw: readFileSync(stageReceiptPath, "utf8"),
      stageReceiptRawSha256: requiredEnvironment(
        "SOURCERA_VERCEL_BASELINE_STAGE_RECEIPT_SHA256",
      ),
    };
  }
  let bootstrapRouteInput:
    | Parameters<typeof collectGithubApprovalEvidence>[6]
    | undefined;
  if (parsed.anchorMode === "genesis") {
    const route = requiredEnvironment("SOURCERA_BOOTSTRAP_ROUTE");
    if (route !== "initial_genesis" && route !== "expired_anchor") {
      throw new Error(
        "SOURCERA_BOOTSTRAP_ROUTE must be initial_genesis or expired_anchor",
      );
    }
    const expiredIdentityRaw = optionalEnvironment(
      "SOURCERA_EXPIRED_ANCHOR_IDENTITY_JSON",
    );
    if (route === "initial_genesis" && expiredIdentityRaw !== undefined) {
      throw new Error("Initial genesis forbids expired-anchor identity inputs");
    }
    let selectedAnchor;
    if (route === "expired_anchor") {
      if (!expiredIdentityRaw) {
        throw new Error("Expired-anchor recovery requires one exact anchor identity");
      }
      selectedAnchor = readProductionExpiredAnchorIdentity(expiredIdentityRaw);
    }
    bootstrapRouteInput = {
      reason: requiredEnvironment("SOURCERA_BOOTSTRAP_REASON"),
      route,
      ...(selectedAnchor ? { selectedAnchor } : {}),
    };
  }
  const privateRoot = mkdtempSync(
    path.join(os.tmpdir(), "sourcera-production-github-proof-"),
  );
  try {
    const githubEnvironment = createProductionReleaseLaneEnvironment(
      process.env,
      "github",
      path.join(privateRoot, "home"),
    );
    const proof = collectGithubApprovalEvidence(
      identity.approvedSha,
      knownGoodSha,
      knownGoodReleaseReceipt,
      parsed.anchorMode,
      githubEnvironment,
      vercelBaselineInput,
      bootstrapRouteInput,
    );
    if (proof.exitCode !== 0) throw new Error("GitHub production proof failed");
    const bootstrapRouteProofRaw =
      parsed.anchorMode === "genesis"
        ? JSON.stringify(
            (proof.value as Record<string, unknown>).bootstrapRoute,
          )
        : undefined;
    const handoff = createProductionGithubHandoff({
      authorizationContext:
        parsed.anchorMode === "normal"
          ? "normal"
          : bootstrapRouteInput!.route,
      ...(bootstrapRouteProofRaw ? { bootstrapRouteProofRaw } : {}),
      githubProofRaw: proof.raw,
      identity,
      knownGoodSha,
      preflightArtifactDigest: requiredEnvironment(
        "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
      ),
      preflightReceiptRaw: preflight.receiptRaw,
    });
    await mkdir(parsed.outputDirectory, { mode: 0o700 });
    await writeFile(
      path.join(parsed.outputDirectory, "github-production-proof.json"),
      proof.raw,
      { flag: "wx", mode: 0o600 },
    );
    await writeFile(
      path.join(parsed.outputDirectory, "github-handoff.json"),
      `${JSON.stringify(handoff, null, 2)}\n`,
      { flag: "wx", mode: 0o600 },
    );
    if (proof.approvalReceiptRaw) {
      await writeFile(
        path.join(parsed.outputDirectory, "github-production-approval.json"),
        proof.approvalReceiptRaw,
        { flag: "wx", mode: 0o600 },
      );
    }
    process.stdout.write(`${JSON.stringify(handoff)}\n`);
  } finally {
    rmSync(privateRoot, { force: true, recursive: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "GitHub production proof failed"}\n`,
    );
    process.exitCode = 1;
  });
}
