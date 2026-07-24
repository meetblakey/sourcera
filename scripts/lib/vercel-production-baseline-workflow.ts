import { createHash } from "node:crypto";

import productionReleaseConfig from "../../config/production-release.json";
import { readGithubProductionApprovalReceipt } from "./convex-production-bootstrap";
import {
  readProductionReleaseConfig,
  validateProductionGithubApprovalEvidence,
} from "./production-release-controller";
import {
  readProductionWorkflowIdentity,
  type ProductionWorkflowIdentity,
} from "./production-release-workflow";

const SHA256 = /^[a-f0-9]{64}$/;
export const VERCEL_PRODUCTION_BASELINE_WORKFLOW =
  ".github/workflows/vercel-production-baseline.yml" as const;

export interface VercelProductionBaselineGithubHandoff {
  event: "vercel_production_baseline_github_handoff";
  forwardOnlyAcknowledged: true;
  githubProofSha256: string;
  identity: ProductionWorkflowIdentity;
  preflightArtifactDigest: string;
  preflightReceiptSha256: string;
  protectedReviewerProofSha256: string;
  reasonSha256: string;
  result: "passed";
  schemaVersion: 1;
  workflowPath: typeof VERCEL_PRODUCTION_BASELINE_WORKFLOW;
}

interface VercelProductionBaselineGithubHandoffInputs {
  forwardOnlyAcknowledged: boolean;
  githubProofRaw: string;
  identity: ProductionWorkflowIdentity;
  preflightArtifactDigest: string;
  preflightReceiptRaw: string;
  protectedReviewerProofRaw: string;
  reason: string;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredRecord(value: unknown, context: string): RecordValue {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
  return value;
}

function requireExactKeys(
  value: RecordValue,
  expected: readonly string[],
  context: string,
) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${context} has unexpected fields`);
  }
}

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function parseJson(raw: string, context: string): unknown {
  if (!raw.trim()) throw new Error(`${context} is empty`);
  try {
    return JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new Error(`${context} is not JSON`, { cause });
  }
}

function identitiesEqual(
  left: ProductionWorkflowIdentity,
  right: ProductionWorkflowIdentity,
) {
  return (
    left.approvedSha === right.approvedSha &&
    left.repository === right.repository &&
    left.runAttempt === right.runAttempt &&
    left.runId === right.runId
  );
}

function validatePreflightReceipt(
  value: unknown,
  expectedIdentity: ProductionWorkflowIdentity,
) {
  const receipt = requiredRecord(value, "production preflight receipt");
  requireExactKeys(
    receipt,
    ["event", "identity", "proofSha256", "result", "schemaVersion"],
    "production preflight receipt",
  );
  const identity = readProductionWorkflowIdentity(receipt.identity);
  if (!identitiesEqual(identity, expectedIdentity)) {
    throw new Error("preflight identity does not match the baseline workflow run");
  }
  const proofSha256 = requiredRecord(
    receipt.proofSha256,
    "production preflight proof hashes",
  );
  requireExactKeys(
    proofSha256,
    ["appVerification", "delivery", "exact", "repository", "stamp"],
    "production preflight proof hashes",
  );
  if (
    receipt.event !== "production_release_preflight_receipt" ||
    receipt.result !== "passed" ||
    receipt.schemaVersion !== 1 ||
    Object.values(proofSha256).some(
      (value) => typeof value !== "string" || !SHA256.test(value),
    )
  ) {
    throw new Error("production preflight receipt is invalid");
  }
}

function validateInputs(options: VercelProductionBaselineGithubHandoffInputs) {
  const identity = readProductionWorkflowIdentity(options.identity);
  if (options.forwardOnlyAcknowledged !== true) {
    throw new Error("Vercel production baseline requires forward-only acknowledgement");
  }
  if (
    !options.reason ||
    options.reason !== options.reason.trim() ||
    options.reason.length > 500
  ) {
    throw new Error("Vercel production baseline reason is invalid");
  }
  const githubProof = parseJson(
    options.githubProofRaw,
    "Vercel baseline GitHub proof",
  );
  validateProductionGithubApprovalEvidence(
    githubProof,
    readProductionReleaseConfig(productionReleaseConfig),
    identity.approvedSha,
    undefined,
    "baseline",
  );
  validatePreflightReceipt(
    parseJson(options.preflightReceiptRaw, "production preflight receipt"),
    identity,
  );
  const reviewerProof = readGithubProductionApprovalReceipt(
    parseJson(
      options.protectedReviewerProofRaw,
      "Vercel baseline protected reviewer proof",
    ),
    {
      approvedCandidateSha: identity.approvedSha,
      githubRepository: identity.repository,
      githubRunAttempt: 1,
      githubRunId: identity.runId,
    },
  );
  if (reviewerProof.sourceProofSha256 !== sha256(options.githubProofRaw)) {
    throw new Error("protected reviewer proof is not bound to the GitHub proof");
  }
  if (!SHA256.test(options.preflightArtifactDigest)) {
    throw new Error("preflight artifact digest is invalid");
  }
  return identity;
}

export function createVercelProductionBaselineGithubHandoff(
  options: VercelProductionBaselineGithubHandoffInputs,
): VercelProductionBaselineGithubHandoff {
  const identity = validateInputs(options);
  return {
    event: "vercel_production_baseline_github_handoff",
    forwardOnlyAcknowledged: true,
    githubProofSha256: sha256(options.githubProofRaw),
    identity,
    preflightArtifactDigest: options.preflightArtifactDigest,
    preflightReceiptSha256: sha256(options.preflightReceiptRaw),
    protectedReviewerProofSha256: sha256(options.protectedReviewerProofRaw),
    reasonSha256: sha256(options.reason),
    result: "passed",
    schemaVersion: 1,
    workflowPath: VERCEL_PRODUCTION_BASELINE_WORKFLOW,
  };
}

export function readVercelProductionBaselineGithubHandoff(
  value: unknown,
  expected: VercelProductionBaselineGithubHandoffInputs,
): VercelProductionBaselineGithubHandoff {
  const handoff = requiredRecord(value, "Vercel production baseline GitHub handoff");
  requireExactKeys(
    handoff,
    [
      "event",
      "forwardOnlyAcknowledged",
      "githubProofSha256",
      "identity",
      "preflightArtifactDigest",
      "preflightReceiptSha256",
      "protectedReviewerProofSha256",
      "reasonSha256",
      "result",
      "schemaVersion",
      "workflowPath",
    ],
    "Vercel production baseline GitHub handoff",
  );
  const expectedIdentity = validateInputs(expected);
  const identity = readProductionWorkflowIdentity(handoff.identity);
  if (!identitiesEqual(identity, expectedIdentity)) {
    throw new Error("Vercel baseline GitHub handoff identity does not match");
  }
  if (
    handoff.event !== "vercel_production_baseline_github_handoff" ||
    handoff.forwardOnlyAcknowledged !== true ||
    handoff.result !== "passed" ||
    handoff.schemaVersion !== 1 ||
    handoff.workflowPath !== VERCEL_PRODUCTION_BASELINE_WORKFLOW
  ) {
    throw new Error("Vercel production baseline GitHub handoff is invalid");
  }
  if (handoff.preflightArtifactDigest !== expected.preflightArtifactDigest) {
    throw new Error("preflight artifact digest does not match the handoff");
  }
  const hashes = {
    githubProofSha256: sha256(expected.githubProofRaw),
    preflightReceiptSha256: sha256(expected.preflightReceiptRaw),
    protectedReviewerProofSha256: sha256(expected.protectedReviewerProofRaw),
    reasonSha256: sha256(expected.reason),
  };
  for (const [key, expectedHash] of Object.entries(hashes)) {
    if (handoff[key] !== expectedHash) {
      throw new Error(`${key} does not match the handoff`);
    }
  }
  return handoff as unknown as VercelProductionBaselineGithubHandoff;
}
