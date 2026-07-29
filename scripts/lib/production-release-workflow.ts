import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FULL_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const EVIDENCE_FILES = {
  appVerification: "appVerification.json",
  delivery: "delivery.json",
  exact: "exact.json",
  repository: "repository.json",
  stamp: "stamp.json",
} as const;

export interface ProductionWorkflowIdentity {
  approvedSha: string;
  repository: "meetblakey/sourcera";
  runAttempt: number;
  runId: number;
}

export type ProductionPreflightEvidence = Record<
  keyof typeof EVIDENCE_FILES,
  string
>;

export interface ProductionPreflightReceipt {
  event: "production_release_preflight_receipt";
  failedChecks: Array<keyof typeof EVIDENCE_FILES>;
  identity: ProductionWorkflowIdentity;
  proofSha256: Record<keyof typeof EVIDENCE_FILES, string>;
  result: "failed" | "passed";
  schemaVersion: 2;
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
  if (!raw || raw !== raw.trimEnd()) {
    if (!raw.trim()) throw new Error(`${context} is empty`);
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new Error(`${context} is not JSON`, { cause });
  }
}

export function readProductionWorkflowIdentity(
  value: unknown,
): ProductionWorkflowIdentity {
  const identity = requiredRecord(value, "production workflow identity");
  requireExactKeys(
    identity,
    ["approvedSha", "repository", "runAttempt", "runId"],
    "production workflow identity",
  );
  if (
    typeof identity.approvedSha !== "string" ||
    !FULL_GIT_COMMIT_SHA.test(identity.approvedSha) ||
    identity.repository !== "meetblakey/sourcera" ||
    identity.runAttempt !== 1 ||
    !Number.isSafeInteger(identity.runId) ||
    Number(identity.runId) < 1
  ) {
    throw new Error("production workflow identity is invalid");
  }
  return identity as unknown as ProductionWorkflowIdentity;
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

function failedPreflightChecks(evidence: ProductionPreflightEvidence) {
  const failed: Array<keyof typeof EVIDENCE_FILES> = [];
  const app = requiredRecord(
    parseJson(evidence.appVerification, "application verification proof"),
    "application verification proof",
  );
  if (app.exitCode !== 0 || app.outcome !== "pass") {
    failed.push("appVerification");
  }
  const delivery = requiredRecord(
    parseJson(evidence.delivery, "delivery verification proof"),
    "delivery verification proof",
  );
  if (delivery.exitCode !== 0 || delivery.outcome !== "pass") {
    failed.push("delivery");
  }
  const exact = requiredRecord(
    parseJson(evidence.exact, "exact status proof"),
    "exact status proof",
  );
  if (exact.open_rows !== 0) {
    failed.push("exact");
  }
  const stamp = requiredRecord(
    parseJson(evidence.stamp, "stamp gate proof"),
    "stamp gate proof",
  );
  if (stamp.outcome !== "pass") {
    failed.push("stamp");
  }
  const repository = requiredRecord(
    parseJson(evidence.repository, "repository proof"),
    "repository proof",
  );
  if (
    repository.clean !== true ||
    repository.ref !== "refs/heads/main" ||
    typeof repository.headSha !== "string" ||
    repository.fetchedMainSha !== repository.headSha ||
    repository.mainSha !== repository.headSha
  ) {
    failed.push("repository");
  }
  return failed.sort();
}

export function createProductionPreflightReceipt(options: {
  evidence: ProductionPreflightEvidence;
  identity: ProductionWorkflowIdentity;
}): ProductionPreflightReceipt {
  const identity = readProductionWorkflowIdentity(options.identity);
  const failedChecks = failedPreflightChecks(options.evidence);
  const repository = requiredRecord(
    parseJson(options.evidence.repository, "repository proof"),
    "repository proof",
  );
  if (
    repository.headSha !== identity.approvedSha ||
    repository.mainSha !== identity.approvedSha
  ) {
    if (!failedChecks.includes("repository")) failedChecks.push("repository");
  }
  failedChecks.sort();
  return {
    event: "production_release_preflight_receipt",
    failedChecks,
    identity,
    proofSha256: Object.fromEntries(
      Object.keys(EVIDENCE_FILES).map((name) => [
        name,
        sha256(options.evidence[name as keyof typeof EVIDENCE_FILES]),
      ]),
    ) as ProductionPreflightReceipt["proofSha256"],
    result: failedChecks.length === 0 ? "passed" : "failed",
    schemaVersion: 2,
  };
}

function readProductionPreflightReceipt(
  value: unknown,
  expectedIdentity: ProductionWorkflowIdentity,
): ProductionPreflightReceipt {
  const receipt = requiredRecord(value, "production preflight receipt");
  requireExactKeys(
    receipt,
    [
      "event",
      "failedChecks",
      "identity",
      "proofSha256",
      "result",
      "schemaVersion",
    ],
    "production preflight receipt",
  );
  const identity = readProductionWorkflowIdentity(receipt.identity);
  if (
    !identitiesEqual(identity, readProductionWorkflowIdentity(expectedIdentity))
  ) {
    throw new Error("preflight identity does not match this workflow run");
  }
  const proofSha256 = requiredRecord(
    receipt.proofSha256,
    "preflight proof hashes",
  );
  requireExactKeys(
    proofSha256,
    Object.keys(EVIDENCE_FILES),
    "preflight proof hashes",
  );
  if (!Array.isArray(receipt.failedChecks)) {
    throw new Error("production preflight receipt is invalid");
  }
  const failedChecks = receipt.failedChecks;
  if (
    receipt.schemaVersion !== 2 ||
    receipt.event !== "production_release_preflight_receipt" ||
    !["failed", "passed"].includes(String(receipt.result)) ||
    failedChecks.some(
      (value) => !Object.hasOwn(EVIDENCE_FILES, String(value)),
    ) ||
    new Set(failedChecks).size !== failedChecks.length ||
    [...failedChecks]
      .sort()
      .some((value, index) => value !== failedChecks[index]) ||
    Object.values(proofSha256).some(
      (value) => typeof value !== "string" || !SHA256.test(value),
    )
  ) {
    throw new Error("production preflight receipt is invalid");
  }
  return receipt as unknown as ProductionPreflightReceipt;
}

export async function readProductionPreflightBundle(
  directory: string,
  expectedIdentity: ProductionWorkflowIdentity,
) {
  const receiptRaw = await readFile(
    path.join(directory, "production-preflight.json"),
    "utf8",
  );
  const receipt = readProductionPreflightReceipt(
    parseJson(receiptRaw, "production preflight receipt"),
    expectedIdentity,
  );
  const evidence = {} as ProductionPreflightEvidence;
  for (const [name, fileName] of Object.entries(EVIDENCE_FILES)) {
    const raw = await readFile(path.join(directory, fileName), "utf8");
    const key = name as keyof typeof EVIDENCE_FILES;
    if (sha256(raw) !== receipt.proofSha256[key]) {
      throw new Error(`${name} proof hash does not match the preflight receipt`);
    }
    evidence[key] = raw;
  }
  const failedChecks = failedPreflightChecks(evidence);
  if (
    failedChecks.length !== receipt.failedChecks.length ||
    failedChecks.some((value, index) => value !== receipt.failedChecks[index]) ||
    receipt.result !== (failedChecks.length === 0 ? "passed" : "failed")
  ) {
    throw new Error("preflight result does not match its proof bundle");
  }
  return { evidence, receipt, receiptRaw };
}

export const productionPreflightEvidenceFiles = EVIDENCE_FILES;
