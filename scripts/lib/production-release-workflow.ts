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
  identity: ProductionWorkflowIdentity;
  proofSha256: Record<keyof typeof EVIDENCE_FILES, string>;
  result: "passed";
  schemaVersion: 1;
}

export interface ProductionGithubHandoff {
  authorizationContextSha256: string;
  bootstrapRoute: "expired_anchor" | "initial_genesis" | null;
  bootstrapRouteProofSha256: string | null;
  event: "production_release_github_handoff";
  githubProofSha256: string;
  identity: ProductionWorkflowIdentity;
  knownGoodSha: string;
  preflightArtifactDigest: string;
  preflightReceiptSha256: string;
  result: "passed";
  schemaVersion: 1;
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
    // Receipts bind exact bytes, including a conventional trailing newline.
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

function requirePassingEvidence(evidence: ProductionPreflightEvidence) {
  const app = requiredRecord(
    parseJson(evidence.appVerification, "application verification proof"),
    "application verification proof",
  );
  if (app.exitCode !== 0 || app.outcome !== "pass") {
    throw new Error("application verification proof did not pass");
  }
  const delivery = requiredRecord(
    parseJson(evidence.delivery, "delivery verification proof"),
    "delivery verification proof",
  );
  if (delivery.exitCode !== 0 || delivery.outcome !== "pass") {
    throw new Error("delivery verification proof did not pass");
  }
  const exact = requiredRecord(
    parseJson(evidence.exact, "exact status proof"),
    "exact status proof",
  );
  if (exact.open_rows !== 0) {
    throw new Error("exact status proof did not pass");
  }
  const stamp = requiredRecord(
    parseJson(evidence.stamp, "stamp gate proof"),
    "stamp gate proof",
  );
  if (stamp.outcome !== "pass") {
    throw new Error("stamp gate proof did not pass");
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
    throw new Error("repository proof did not pass");
  }
}

export function createProductionPreflightReceipt(options: {
  evidence: ProductionPreflightEvidence;
  identity: ProductionWorkflowIdentity;
}): ProductionPreflightReceipt {
  const identity = readProductionWorkflowIdentity(options.identity);
  requirePassingEvidence(options.evidence);
  const repository = requiredRecord(
    parseJson(options.evidence.repository, "repository proof"),
    "repository proof",
  );
  if (
    repository.headSha !== identity.approvedSha ||
    repository.mainSha !== identity.approvedSha
  ) {
    throw new Error("repository proof does not match the approved SHA");
  }
  return {
    event: "production_release_preflight_receipt",
    identity,
    proofSha256: Object.fromEntries(
      Object.keys(EVIDENCE_FILES).map((name) => [
        name,
        sha256(options.evidence[name as keyof typeof EVIDENCE_FILES]),
      ]),
    ) as ProductionPreflightReceipt["proofSha256"],
    result: "passed",
    schemaVersion: 1,
  };
}

function readProductionPreflightReceipt(
  value: unknown,
  expectedIdentity: ProductionWorkflowIdentity,
): ProductionPreflightReceipt {
  const receipt = requiredRecord(value, "production preflight receipt");
  requireExactKeys(
    receipt,
    ["event", "identity", "proofSha256", "result", "schemaVersion"],
    "production preflight receipt",
  );
  const identity = readProductionWorkflowIdentity(receipt.identity);
  if (!identitiesEqual(identity, readProductionWorkflowIdentity(expectedIdentity))) {
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
  if (
    receipt.schemaVersion !== 1 ||
    receipt.event !== "production_release_preflight_receipt" ||
    receipt.result !== "passed" ||
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
  requirePassingEvidence(evidence);
  return { evidence, receipt, receiptRaw };
}

export function createProductionGithubHandoff(options: {
  authorizationContext: string;
  bootstrapRouteProofRaw?: string;
  githubProofRaw: string;
  identity: ProductionWorkflowIdentity;
  knownGoodSha: string;
  preflightArtifactDigest: string;
  preflightReceiptRaw: string;
}): ProductionGithubHandoff {
  const identity = readProductionWorkflowIdentity(options.identity);
  if (
    !options.authorizationContext.trim() ||
    options.authorizationContext !== options.authorizationContext.trim() ||
    options.authorizationContext.length > 500
  ) {
    throw new Error("authorization context is invalid");
  }
  const bootstrapRoute =
    options.authorizationContext === "expired_anchor" ||
    options.authorizationContext === "initial_genesis"
      ? options.authorizationContext
      : null;
  if (
    (options.authorizationContext === "normal") !==
      (options.bootstrapRouteProofRaw === undefined) ||
    !["normal", "expired_anchor", "initial_genesis"].includes(
      options.authorizationContext,
    )
  ) {
    throw new Error("bootstrap route authorization is incomplete");
  }
  if (options.bootstrapRouteProofRaw !== undefined) {
    const routeProof = requiredRecord(
      parseJson(options.bootstrapRouteProofRaw, "bootstrap route proof"),
      "bootstrap route proof",
    );
    if (routeProof.route !== bootstrapRoute) {
      throw new Error("bootstrap route proof does not match authorization");
    }
  }
  if (
    !FULL_GIT_COMMIT_SHA.test(options.knownGoodSha) ||
    options.knownGoodSha === identity.approvedSha
  ) {
    throw new Error("known-good SHA must be a distinct full Git SHA");
  }
  parseJson(options.githubProofRaw, "GitHub proof");
  parseJson(options.preflightReceiptRaw, "production preflight receipt");
  if (!SHA256.test(options.preflightArtifactDigest)) {
    throw new Error("preflight artifact digest is invalid");
  }
  return {
    authorizationContextSha256: sha256(options.authorizationContext),
    bootstrapRoute,
    bootstrapRouteProofSha256:
      options.bootstrapRouteProofRaw === undefined
        ? null
        : sha256(options.bootstrapRouteProofRaw),
    event: "production_release_github_handoff",
    githubProofSha256: sha256(options.githubProofRaw),
    identity,
    knownGoodSha: options.knownGoodSha,
    preflightArtifactDigest: options.preflightArtifactDigest,
    preflightReceiptSha256: sha256(options.preflightReceiptRaw),
    result: "passed",
    schemaVersion: 1,
  };
}

export function readProductionGithubHandoff(
  value: unknown,
  expected: {
    authorizationContext: string;
    bootstrapRouteProofRaw?: string;
    githubProofRaw: string;
    identity: ProductionWorkflowIdentity;
    knownGoodSha: string;
    preflightArtifactDigest: string;
    preflightReceiptRaw: string;
  },
): ProductionGithubHandoff {
  if (
    !["normal", "expired_anchor", "initial_genesis"].includes(
      expected.authorizationContext,
    ) ||
    (expected.authorizationContext === "normal") !==
      (expected.bootstrapRouteProofRaw === undefined)
  ) {
    throw new Error("bootstrap route authorization is incomplete");
  }
  if (expected.bootstrapRouteProofRaw !== undefined) {
    const routeProof = requiredRecord(
      parseJson(expected.bootstrapRouteProofRaw, "bootstrap route proof"),
      "bootstrap route proof",
    );
    if (routeProof.route !== expected.authorizationContext) {
      throw new Error("bootstrap route proof does not match authorization");
    }
  }
  const handoff = requiredRecord(value, "production GitHub handoff");
  requireExactKeys(
    handoff,
    [
      "authorizationContextSha256",
      "bootstrapRoute",
      "bootstrapRouteProofSha256",
      "event",
      "githubProofSha256",
      "identity",
      "knownGoodSha",
      "preflightArtifactDigest",
      "preflightReceiptSha256",
      "result",
      "schemaVersion",
    ],
    "production GitHub handoff",
  );
  const identity = readProductionWorkflowIdentity(handoff.identity);
  if (!identitiesEqual(identity, readProductionWorkflowIdentity(expected.identity))) {
    throw new Error("GitHub handoff identity does not match this workflow run");
  }
  if (handoff.knownGoodSha !== expected.knownGoodSha) {
    throw new Error("GitHub handoff known-good SHA does not match");
  }
  if (
    handoff.authorizationContextSha256 !== sha256(expected.authorizationContext)
  ) {
    throw new Error("authorization context does not match the GitHub handoff");
  }
  const expectedBootstrapRoute =
    expected.authorizationContext === "expired_anchor" ||
    expected.authorizationContext === "initial_genesis"
      ? expected.authorizationContext
      : null;
  const expectedBootstrapRouteProofSha256 =
    expected.bootstrapRouteProofRaw === undefined
      ? null
      : sha256(expected.bootstrapRouteProofRaw);
  if (
    handoff.bootstrapRoute !== expectedBootstrapRoute ||
    handoff.bootstrapRouteProofSha256 !== expectedBootstrapRouteProofSha256 ||
    (expectedBootstrapRoute === null) !==
      (expected.bootstrapRouteProofRaw === undefined)
  ) {
    throw new Error("bootstrap route proof does not match the GitHub handoff");
  }
  if (handoff.preflightArtifactDigest !== expected.preflightArtifactDigest) {
    throw new Error("preflight artifact digest does not match the handoff");
  }
  if (
    handoff.schemaVersion !== 1 ||
    handoff.event !== "production_release_github_handoff" ||
    handoff.result !== "passed" ||
    typeof handoff.authorizationContextSha256 !== "string" ||
    !SHA256.test(handoff.authorizationContextSha256) ||
    (handoff.bootstrapRouteProofSha256 !== null &&
      (typeof handoff.bootstrapRouteProofSha256 !== "string" ||
        !SHA256.test(handoff.bootstrapRouteProofSha256))) ||
    typeof handoff.preflightArtifactDigest !== "string" ||
    !SHA256.test(handoff.preflightArtifactDigest)
  ) {
    throw new Error("production GitHub handoff is invalid");
  }
  if (handoff.githubProofSha256 !== sha256(expected.githubProofRaw)) {
    throw new Error("GitHub proof hash does not match the handoff");
  }
  if (
    handoff.preflightReceiptSha256 !== sha256(expected.preflightReceiptRaw)
  ) {
    throw new Error("preflight receipt hash does not match the GitHub handoff");
  }
  return handoff as unknown as ProductionGithubHandoff;
}

export const productionPreflightEvidenceFiles = EVIDENCE_FILES;
