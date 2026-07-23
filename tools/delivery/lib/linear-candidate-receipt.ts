import { createHash } from "node:crypto";

export interface LinearRunSource {
  repository: string;
  commit: string;
  ref: string;
  runId: string;
  runAttempt: string;
}

export interface LinearCandidateReceipt {
  schemaVersion: 4;
  createdAt: string;
  candidateSha256: string;
  baselineSnapshotSha256: string;
  fingerprintSha256: string;
  captureReceiptSha256: string;
  projectScopeSha256: string;
  programScopeSha256: string | null;
  sourcePolicySha256: string | null;
  sourceInventorySha256: string | null;
  sourceChecksumContractSha256: string | null;
  sourceDispositionsSha256: string | null;
  runtimeStampSha256: string | null;
  runtimeDependencyContractSha256: string | null;
  releaseDefinitionsSha256: string;
  source: LinearRunSource;
}

export interface LinearCandidateReceiptInputs {
  candidateJson: string;
  baselineSnapshotJson: string;
  fingerprintJson: string;
  captureReceiptJson: string;
  projectScopeJson: string;
  programScopeJson: string | null;
  sourcePolicyJson: string | null;
  inventoryJson: string | null;
  sourceChecksumContractJson: string | null;
  dispositionsJson: string | null;
  runtimeStampJson: string | null;
  runtimeDependencyContractJson: string | null;
  releaseDefinitionsJson: string;
  createdAt: string;
  source: LinearRunSource;
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256 = /^[a-f0-9]{64}$/;
export const LINEAR_RUN_SOURCE_KEYS = [
  "repository",
  "commit",
  "ref",
  "runId",
  "runAttempt",
] as const;

export function exactLinearRunSource(
  left: unknown,
  right: LinearRunSource,
): left is LinearRunSource {
  if (!left || typeof left !== "object" || Array.isArray(left)) return false;
  const keys = Object.keys(left).sort();
  if (
    JSON.stringify(keys) !==
      JSON.stringify([...LINEAR_RUN_SOURCE_KEYS].sort())
  ) {
    return false;
  }
  return LINEAR_RUN_SOURCE_KEYS.every(
    (key) =>
      typeof (left as Record<string, unknown>)[key] === "string" &&
      (left as Record<string, unknown>)[key] === right[key],
  );
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function buildLinearCandidateReceipt(
  inputs: LinearCandidateReceiptInputs,
): LinearCandidateReceipt {
  return {
    schemaVersion: 4,
    createdAt: inputs.createdAt,
    candidateSha256: sha256(inputs.candidateJson),
    baselineSnapshotSha256: sha256(inputs.baselineSnapshotJson),
    fingerprintSha256: sha256(inputs.fingerprintJson),
    captureReceiptSha256: sha256(inputs.captureReceiptJson),
    projectScopeSha256: sha256(inputs.projectScopeJson),
    programScopeSha256: inputs.programScopeJson === null
      ? null
      : sha256(inputs.programScopeJson),
    sourcePolicySha256: inputs.sourcePolicyJson === null
      ? null
      : sha256(inputs.sourcePolicyJson),
    sourceInventorySha256: inputs.inventoryJson === null
      ? null
      : sha256(inputs.inventoryJson),
    sourceChecksumContractSha256: inputs.sourceChecksumContractJson === null
      ? null
      : sha256(inputs.sourceChecksumContractJson),
    sourceDispositionsSha256: inputs.dispositionsJson === null
      ? null
      : sha256(inputs.dispositionsJson),
    runtimeStampSha256: inputs.runtimeStampJson === null
      ? null
      : sha256(inputs.runtimeStampJson),
    runtimeDependencyContractSha256:
      inputs.runtimeDependencyContractJson === null
        ? null
        : sha256(inputs.runtimeDependencyContractJson),
    releaseDefinitionsSha256: sha256(inputs.releaseDefinitionsJson),
    source: { ...inputs.source },
  };
}

export function assertLinearCandidateReceipt(
  value: unknown,
  inputs: LinearCandidateReceiptInputs,
): LinearCandidateReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Linear candidate receipt is invalid");
  }
  const receipt = value as Partial<LinearCandidateReceipt>;
  const expected = buildLinearCandidateReceipt(inputs);
  const expectedKeys = Object.keys(expected).sort();
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(expectedKeys)) {
    throw new Error("Linear candidate receipt shape is invalid");
  }
  if (
    !exactLinearRunSource(receipt.source, expected.source) ||
    receipt.schemaVersion !== 4 ||
    typeof receipt.createdAt !== "string" ||
    !ISO_UTC.test(receipt.createdAt) ||
    expectedKeys.some(
      (key) =>
        JSON.stringify((receipt as Record<string, unknown>)[key]) !==
        JSON.stringify((expected as unknown as Record<string, unknown>)[key]),
    )
  ) {
    throw new Error("Linear candidate receipt does not match its inputs");
  }
  for (const digest of [
    receipt.candidateSha256,
    receipt.baselineSnapshotSha256,
    receipt.fingerprintSha256,
    receipt.captureReceiptSha256,
    receipt.projectScopeSha256,
    receipt.programScopeSha256,
    receipt.sourcePolicySha256,
    receipt.sourceInventorySha256,
    receipt.sourceChecksumContractSha256,
    receipt.sourceDispositionsSha256,
    receipt.runtimeStampSha256,
    receipt.runtimeDependencyContractSha256,
    receipt.releaseDefinitionsSha256,
  ]) {
    if (digest !== null && (typeof digest !== "string" || !SHA256.test(digest))) {
      throw new Error("Linear candidate receipt contains an invalid digest");
    }
  }
  return receipt as LinearCandidateReceipt;
}
