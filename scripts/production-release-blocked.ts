import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionReleaseConfig from "../config/production-release.json";
import {
  readProductionReleaseConfig,
  validateProductionBootstrapRouteProof,
  type ProductionBootstrapAnchorIdentity,
  type ProductionBootstrapRoute,
} from "./lib/production-release-controller";
import {
  readProductionGithubHandoff,
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
    throw new Error(`${key} is required for the blocked release receipt`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredRecord(value: unknown, context: string) {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
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

export function readProductionBlockedArguments(arguments_: string[]) {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (
      ![
        "--anchor-mode",
        "--convex-anchor-receipt",
        "--github-handoff",
        "--github-proof",
        "--preflight-dir",
        "--receipt-out",
      ].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error("Blocked release receipt arguments are invalid");
    }
    values.set(option, value);
  }
  const anchorMode = values.get("--anchor-mode");
  if (
    (anchorMode !== "normal" && anchorMode !== "genesis") ||
    !values.has("--github-handoff") ||
    !values.has("--github-proof") ||
    !values.has("--preflight-dir") ||
    !values.has("--receipt-out") ||
    (anchorMode === "genesis") !== values.has("--convex-anchor-receipt")
  ) {
    throw new Error("Blocked release receipt inputs are incomplete");
  }
  const receiptOutputPath = outsideRepository(
    values.get("--receipt-out")!,
    "--receipt-out",
  );
  if (existsSync(receiptOutputPath)) {
    throw new Error("--receipt-out must not already exist");
  }
  return {
    anchorMode,
    convexAnchorReceiptPath: values.has("--convex-anchor-receipt")
      ? outsideRepository(
          values.get("--convex-anchor-receipt")!,
          "--convex-anchor-receipt",
        )
      : undefined,
    githubHandoffPath: outsideRepository(
      values.get("--github-handoff")!,
      "--github-handoff",
    ),
    githubProofPath: outsideRepository(
      values.get("--github-proof")!,
      "--github-proof",
    ),
    preflightDirectory: outsideRepository(
      values.get("--preflight-dir")!,
      "--preflight-dir",
    ),
    receiptOutputPath,
  } as const;
}

export function writeProductionBlockedReceipt(
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
  const forbidden = FORBIDDEN_CREDENTIALS.find(
    (key) => process.env[key] !== undefined,
  );
  if (forbidden) throw new Error(`Blocked release lane forbids ${forbidden}`);
  const parsed = readProductionBlockedArguments(arguments_);
  const config = readProductionReleaseConfig(productionReleaseConfig);
  if (config.proofCollection.mode !== "blocked") {
    throw new Error("Blocked receipt cannot replace the durable coordinator");
  }
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
  const githubProofRaw = readFileSync(parsed.githubProofPath, "utf8");
  const githubProof = requiredRecord(
    JSON.parse(githubProofRaw) as unknown,
    "GitHub production proof",
  );
  let bootstrapRoute: ProductionBootstrapRoute | null = null;
  let bootstrapRouteProofRaw: string | undefined;
  if (parsed.anchorMode === "genesis") {
    const routeProof = requiredRecord(
      githubProof.bootstrapRoute,
      "production bootstrap route proof",
    );
    if (
      routeProof.route !== "initial_genesis" &&
      routeProof.route !== "expired_anchor"
    ) {
      throw new Error("production bootstrap route is invalid");
    }
    bootstrapRoute = routeProof.route;
    const selectedAnchor =
      bootstrapRoute === "expired_anchor"
        ? (requiredRecord(
            routeProof.selectedAnchor,
            "selected expired production authority",
          ) as unknown as ProductionBootstrapAnchorIdentity)
        : undefined;
    validateProductionBootstrapRouteProof(routeProof, {
      authorityWorkflowLineage: config.github.authorityWorkflowLineage,
      route: bootstrapRoute,
      ...(selectedAnchor ? { selectedAnchor } : {}),
      workflowPaths: [config.github.workflow, config.github.bootstrapWorkflow],
    });
    bootstrapRouteProofRaw = JSON.stringify(routeProof);
  } else if (githubProof.bootstrapRoute !== undefined) {
    throw new Error("Normal blocked release cannot contain bootstrap authority");
  }
  const githubHandoffRaw = readFileSync(parsed.githubHandoffPath, "utf8");
  readProductionGithubHandoff(JSON.parse(githubHandoffRaw) as unknown, {
    authorizationContext: bootstrapRoute ?? "normal",
    ...(bootstrapRouteProofRaw ? { bootstrapRouteProofRaw } : {}),
    githubProofRaw,
    identity,
    knownGoodSha,
    preflightArtifactDigest: requiredEnvironment(
      "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
    ),
    preflightReceiptRaw: preflight.receiptRaw,
  });

  let convexAnchorReceiptSha256: string | null = null;
  if (parsed.convexAnchorReceiptPath) {
    const anchorRaw = readFileSync(parsed.convexAnchorReceiptPath, "utf8");
    const anchor = requiredRecord(
      JSON.parse(anchorRaw) as unknown,
      "Convex anchor receipt",
    );
    const approvalRaw = readFileSync(
      path.join(
        path.dirname(parsed.githubProofPath),
        "github-production-approval.json",
      ),
      "utf8",
    );
    const github = requiredRecord(anchor.github, "Convex anchor GitHub binding");
    if (
      anchor.schemaVersion !== 1 ||
      anchor.event !== "convex_production_genesis_receipt" ||
      anchor.result !== "passed" ||
      anchor.anchorAllowed !== true ||
      anchor.promotionAllowed !== false ||
      anchor.providerMutationCount !== 0 ||
      anchor.approvedCandidateSha !== identity.approvedSha ||
      anchor.knownGoodSha !== knownGoodSha ||
      github.runId !== identity.runId ||
      github.runAttempt !== identity.runAttempt ||
      github.approvalReceiptSha256 !== sha256(approvalRaw)
    ) {
      throw new Error("Convex anchor receipt is not bound to this approval");
    }
    convexAnchorReceiptSha256 = sha256(anchorRaw);
  }

  const approvalArtifactDigest = requiredEnvironment(
    "SOURCERA_APPROVAL_ARTIFACT_DIGEST",
  );
  if (!SHA256.test(approvalArtifactDigest)) {
    throw new Error("Approval artifact digest is invalid");
  }
  const receipt = {
    anchorMode: parsed.anchorMode,
    approvalArtifactDigest,
    approvedSha: identity.approvedSha,
    bootstrapRoute,
    bootstrapRouteProofSha256: bootstrapRouteProofRaw
      ? sha256(bootstrapRouteProofRaw)
      : null,
    convexAnchorReceiptSha256,
    decision: "DEC-PROD-002",
    event: "production_release_blocked_receipt",
    githubHandoffSha256: sha256(githubHandoffRaw),
    githubProofSha256: sha256(githubProofRaw),
    identity,
    knownGoodSha,
    preflightReceiptSha256: sha256(preflight.receiptRaw),
    promotionAllowed: false,
    providerCredentialCount: 0,
    reason:
      "isolated candidate and durable proof coordinator are not pinned",
    result: "blocked",
    schemaVersion: 1,
  } as const;
  await writeProductionBlockedReceipt(parsed.receiptOutputPath, receipt);
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Blocked receipt failed"}\n`,
    );
    process.exitCode = 1;
  });
}
