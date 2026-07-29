import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionReleaseConfig from "../config/production-release.json";
import { resolveProductionDecisionAuthority } from "./lib/production-decision-authority";
import { readProductionReleaseConfig } from "./lib/production-release-config";
import {
  readProductionPreflightBundle,
  readProductionWorkflowIdentity,
} from "./lib/production-release-workflow";
import {
  publishPrivateJsonReceipt,
  type PrivateJsonReceiptPublisherDependencies,
} from "./lib/private-json-receipt";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const SHA256 = /^[a-f0-9]{64}$/;
const FORBIDDEN_CREDENTIALS = [
  "CONVEX_DEPLOY_KEY",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "SOURCERA_CONVEX_CANARY_SECRET",
  "SOURCERA_RELEASE_GITHUB_TOKEN",
  "VERCEL_TOKEN",
] as const;

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function requiredEnvironment(key: string) {
  const value = process.env[key];
  if (!value?.trim() || value !== value.trim()) {
    throw new Error(`${key} is required for the no-authority receipt`);
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
      !["--preflight-dir", "--receipt-out"].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error("No-authority receipt arguments are invalid");
    }
    values.set(option, value);
  }
  if (
    values.size !== 2 ||
    !values.has("--preflight-dir") ||
    !values.has("--receipt-out")
  ) {
    throw new Error("No-authority receipt inputs are incomplete");
  }
  const receiptOutputPath = outsideRepository(
    values.get("--receipt-out")!,
    "--receipt-out",
  );
  if (existsSync(receiptOutputPath)) {
    throw new Error("--receipt-out must not already exist");
  }
  return {
    preflightDirectory: outsideRepository(
      values.get("--preflight-dir")!,
      "--preflight-dir",
    ),
    receiptOutputPath,
  };
}

export function assertProductionNoAuthorityCredentialBoundary(
  environment: NodeJS.ProcessEnv,
) {
  const forbidden = FORBIDDEN_CREDENTIALS.find(
    (key) => environment[key] !== undefined,
  );
  if (forbidden) {
    throw new Error(`No-authority receipt lane forbids ${forbidden}`);
  }
}

export function writeProductionNoAuthorityReceipt(
  outputPath: string,
  receipt: unknown,
  dependencies: PrivateJsonReceiptPublisherDependencies = {},
) {
  return publishPrivateJsonReceipt(
    outputPath,
    receipt,
    repositoryRoot,
    dependencies,
  );
}

export async function main(arguments_ = process.argv.slice(2)) {
  assertProductionNoAuthorityCredentialBoundary(process.env);
  const parsed = readArguments(arguments_);
  const config = readProductionReleaseConfig(productionReleaseConfig);
  if (config.productionControl.mode !== "blocked") {
    throw new Error("No-authority receipt requires blocked production control");
  }
  const authority = resolveProductionDecisionAuthority(
    repositoryRoot,
    config.productionControl,
  );
  const identity = readProductionWorkflowIdentity({
    approvedSha: requiredEnvironment("SOURCERA_RELEASE_APPROVED_SHA"),
    repository: requiredEnvironment("GITHUB_REPOSITORY"),
    runAttempt: Number(requiredEnvironment("GITHUB_RUN_ATTEMPT")),
    runId: Number(requiredEnvironment("GITHUB_RUN_ID")),
  });
  const preflightArtifactDigest = requiredEnvironment(
    "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
  );
  if (!SHA256.test(preflightArtifactDigest)) {
    throw new Error("SOURCERA_PREFLIGHT_ARTIFACT_DIGEST is invalid");
  }
  const preflight = await readProductionPreflightBundle(
    parsed.preflightDirectory,
    identity,
  );
  const receipt = {
    authority: {
      historicalDownloadAttempted: false,
      nativeDecision: null,
      providerMutationAuthorized: false,
      status: authority.status,
    },
    approvedSha: identity.approvedSha,
    checkedAt: new Date().toISOString(),
    event: "production_release_no_authority_receipt",
    identity,
    preflight: {
      artifactDigest: preflightArtifactDigest,
      failedChecks: preflight.receipt.failedChecks,
      receiptSha256: sha256(preflight.receiptRaw),
      result: preflight.receipt.result,
    },
    promotionAllowed: false,
    providerCredentialCount: 0,
    result: "blocked",
    schemaVersion: 3,
    sourceProvenance: config.productionControl.sourceProvenance,
  } as const;
  await writeProductionNoAuthorityReceipt(parsed.receiptOutputPath, receipt);
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "No-authority receipt failed"}\n`,
    );
    process.exitCode = 1;
  });
}
