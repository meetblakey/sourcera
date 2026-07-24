import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionReleaseConfig from "../config/production-release.json";
import {
  readProductionReleaseConfig,
  validateProductionGithubApprovalEvidence,
} from "./lib/production-release-controller";
import {
  readProductionPreflightBundle,
  readProductionWorkflowIdentity,
} from "./lib/production-release-workflow";
import { createVercelProductionBaselineGithubHandoff } from "./lib/vercel-production-baseline-workflow";
import {
  collectGithubApprovalEvidence,
  createProductionReleaseLaneEnvironment,
} from "./release-production";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const FORBIDDEN_PROVIDER_CREDENTIALS = [
  "CONVEX_DEPLOY_KEY",
  "SOURCERA_CONVEX_CANARY_SECRET",
  "VERCEL_TOKEN",
] as const;

function requiredEnvironment(key: string) {
  const value = process.env[key];
  if (!value?.trim() || value !== value.trim()) {
    throw new Error(`${key} is required for Vercel production baseline proof`);
  }
  return value;
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
      !["--out-dir", "--preflight-dir"].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error(
        "Usage: vercel-production-baseline-github --preflight-dir <path> --out-dir <path>",
      );
    }
    values.set(option, value);
  }
  if (values.size !== 2) {
    throw new Error(
      "Usage: vercel-production-baseline-github --preflight-dir <path> --out-dir <path>",
    );
  }
  const outputDirectory = outsideRepository(values.get("--out-dir")!, "--out-dir");
  if (existsSync(outputDirectory)) {
    throw new Error("--out-dir must not already exist");
  }
  return {
    outputDirectory,
    preflightDirectory: outsideRepository(
      values.get("--preflight-dir")!,
      "--preflight-dir",
    ),
  };
}

export async function main(arguments_ = process.argv.slice(2)) {
  for (const key of FORBIDDEN_PROVIDER_CREDENTIALS) {
    if (process.env[key] !== undefined) {
      throw new Error(`Vercel baseline GitHub proof lane forbids ${key}`);
    }
  }
  const parsed = readArguments(arguments_);
  const identity = readProductionWorkflowIdentity({
    approvedSha: requiredEnvironment("SOURCERA_RELEASE_APPROVED_SHA"),
    repository: requiredEnvironment("GITHUB_REPOSITORY"),
    runAttempt: Number(requiredEnvironment("GITHUB_RUN_ATTEMPT")),
    runId: Number(requiredEnvironment("GITHUB_RUN_ID")),
  });
  const reason = requiredEnvironment("SOURCERA_BASELINE_REASON");
  if (requiredEnvironment("SOURCERA_BASELINE_FORWARD_ONLY_ACK") !== "true") {
    throw new Error("SOURCERA_BASELINE_FORWARD_ONLY_ACK must be exactly true");
  }
  const preflight = await readProductionPreflightBundle(
    parsed.preflightDirectory,
    identity,
  );
  const privateRoot = mkdtempSync(
    path.join(os.tmpdir(), "sourcera-vercel-baseline-github-proof-"),
  );
  try {
    const githubEnvironment = createProductionReleaseLaneEnvironment(
      process.env,
      "github",
      path.join(privateRoot, "home"),
    );
    const proof = collectGithubApprovalEvidence(
      identity.approvedSha,
      undefined,
      undefined,
      "baseline",
      githubEnvironment,
    );
    if (proof.exitCode !== 0 || !proof.approvalReceiptRaw) {
      throw new Error("Vercel production baseline GitHub proof failed");
    }
    const config = readProductionReleaseConfig(productionReleaseConfig);
    validateProductionGithubApprovalEvidence(
      proof.value,
      config,
      identity.approvedSha,
      undefined,
      "baseline",
    );
    const handoff = createVercelProductionBaselineGithubHandoff({
      forwardOnlyAcknowledged: true,
      githubProofRaw: proof.raw,
      identity,
      preflightArtifactDigest: requiredEnvironment(
        "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
      ),
      preflightReceiptRaw: preflight.receiptRaw,
      protectedReviewerProofRaw: proof.approvalReceiptRaw,
      reason,
    });
    await mkdir(parsed.outputDirectory, { mode: 0o700 });
    await writeFile(
      path.join(parsed.outputDirectory, "vercel-baseline-github-proof.json"),
      proof.raw,
      { flag: "wx", mode: 0o600 },
    );
    await writeFile(
      path.join(parsed.outputDirectory, "vercel-baseline-protected-reviewer-proof.json"),
      proof.approvalReceiptRaw,
      { flag: "wx", mode: 0o600 },
    );
    await writeFile(
      path.join(parsed.outputDirectory, "vercel-baseline-github-handoff.json"),
      `${JSON.stringify(handoff, null, 2)}\n`,
      { flag: "wx", mode: 0o600 },
    );
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
      `${
        error instanceof Error
          ? error.message
          : "Vercel production baseline GitHub proof failed"
      }\n`,
    );
    process.exitCode = 1;
  });
}
