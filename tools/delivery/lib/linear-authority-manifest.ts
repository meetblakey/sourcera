import { createHash } from "node:crypto";
import {
  assertLinearPlanningContractFingerprints,
  assertLinearNativeIdentityMatchesFingerprint,
  assertLinearRawDocumentsMatchNativeIdentity,
  type LinearFingerprint,
  type LinearNativeIdentityCapture,
  type LinearRawDocumentCapture,
} from "./linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./linear-project-scope.js";
import {
  assertLinearPlanningSourceFingerprints,
  type LinearProgramScopeV3,
} from "./linear-program-scope.js";

export const LINEAR_AUTHORITY_COMPILER_INPUT_NAMES = [
  "extraction-seed",
  "semantic-plan",
  "source-routing",
  "risk-routing",
  "uuid-mapping",
  "allocation-lock",
  "linear-fingerprint",
  "native-identity",
  "raw-documents",
  "issue-descriptions",
  "capture-receipt",
  "github-artifact",
  "project-scope",
  "program-scope",
  "source-contract",
  "disposition-contract",
  "dependency-contract",
  "decision-adjudication",
  "document-canary-receipt",
] as const;

export type AuthorityTargetKind = "issue" | "decision" | "risk" | "document" | "relation_target" | "relation";
export type AuthorityDispositionKind = "proof_only" | "narrative_context" | "superseded" | "retired_source";
export type AuthorityRelationType = "blocks" | "related" | "duplicate";

export interface AuthoritySource {
  path: string;
  role: string;
  precedence: number;
  byteLength: number;
  rawSha256: string;
  normalizedSha256: string;
}

export interface AuthorityBlock {
  key: string;
  sourcePath: string;
  byteStart: number;
  byteEnd: number;
  heading: string;
  rawSha256: string;
  normalizedSha256: string;
  type: string;
  classification: "active" | AuthorityDispositionKind;
  targetPlanKey: string | null;
  disposition: { kind: AuthorityDispositionKind; decisionPlanKey: string } | null;
}

export interface AuthorityManagedTarget {
  kind: "requirement" | "decision" | "risk";
  origin: "source" | "live";
  planKey: string;
  title: string;
  expectedCurrentIssueUuid: string | null;
  expectedCurrentDescriptionSha256: string | null;
  expectedCurrentNativeSha256: string | null;
  expectedIdentifier: string | null;
  blockKeys: string[];
  description: string;
  descriptionSha256: string;
  payloadSha256: string;
  teamPlanKey: string;
  projectPlanKey: string;
  statePlanKey: string | null;
  labelPlanKeys: string[];
  priority: number | null;
  estimate: number | null;
  dueDate: string | null;
  cyclePlanKey: string | null;
  milestonePlanKey: string | null;
  releasePlanKeys: string[];
  parentPlanKey: string | null;
  assigneePlanKey: string | null;
}

export interface AuthorityDocumentTarget {
  origin: "source" | "live";
  planKey: string;
  role: "binding_spec" | "prd" | "engineering_brief" | "audit_program" | "research_context" | "narrative_context" | "migration_index";
  title: string;
  blockKeys: string[];
  content: string;
  contentSha256: string;
  canonicalReadbackSha256: string;
  attachmentKind: "project" | "initiative" | "team" | "issue" | "release" | "cycle";
  attachmentPlanKey: string;
  expectedCurrentDocumentId: string | null;
  expectedCurrentContentSha256: string | null;
  expectedCurrentTopologySha256: string | null;
}

export interface AuthorityReferenceTarget {
  planKey: string;
  title: string;
  expectedIdentifier: string | null;
}

export interface AuthorityNativeRelation {
  planKey: string;
  type: AuthorityRelationType;
  sourcePlanKey: string;
  targetPlanKey: string;
}

export interface AuthorityIssueDescriptionRepair {
  issueUuid: string;
  identifier: string;
  expectedCurrentDescriptionSha256: string;
  desiredDescription: string;
  desiredDescriptionSha256: string;
  requiresNoNativeRelations: true;
}

export interface LinearAuthorityManifest {
  schemaVersion: 1;
  sourceCommit: string;
  preCutoverTag: string;
  workspace: { id: string; name: string; urlKey: string };
  rawDocumentIds: string[];
  planRoot: string;
  sourceSetRoot: string;
  liveCaptureRoot: string;
  compilerInputRoot: string;
  inputs: Array<{
    name: typeof LINEAR_AUTHORITY_COMPILER_INPUT_NAMES[number];
    byteLength: number;
    sha256: string;
  }>;
  sources: AuthoritySource[];
  blocks: AuthorityBlock[];
  requirements: AuthorityManagedTarget[];
  decisions: AuthorityManagedTarget[];
  risks: AuthorityManagedTarget[];
  documents: AuthorityDocumentTarget[];
  references: AuthorityReferenceTarget[];
  nativeRelations: AuthorityNativeRelation[];
  issueDescriptionRepairs: AuthorityIssueDescriptionRepair[];
  nativeCatalog: {
    teams: Array<{ planKey: string; id: string; key: string; name: string }>;
    users: Array<{ planKey: string; id: string; name: string; active: boolean }>;
    initiatives: Array<{ planKey: string; id: string; name: string; contentSha256: string; descriptionSha256: string; updatedAt: string; ownerId: string | null; status: string; priority: number; health: string | null; healthUpdatedAt: string | null; startedAt: string | null; targetDate: string | null; targetDateResolution: string | null; parentInitiativeId: string | null }>;
    projects: Array<{ planKey: string; id: string; name: string; contentSha256: string; updatedAt: string; statusId: string; status: string; statusType: string; priority: number; leadId: string | null; startDate: string | null; startDateResolution: string | null; targetDate: string | null; targetDateResolution: string | null; teamPlanKeys: string[]; initiativePlanKeys: string[] }>;
    releasePipelines: Array<{ planKey: string; id: string; name: string; updatedAt: string; type: string; isProduction: boolean; teamPlanKeys: string[]; stages: Array<{ id: string; name: string; type: string; position: number; frozen: boolean }> }>;
    cycles: Array<{ planKey: string; id: string; number: number; name: string | null; descriptionSha256: string; updatedAt: string; startsAt: string; endsAt: string; completedAt: string | null; teamPlanKey: string; inheritedFromId: string | null }>;
    milestones: Array<{ planKey: string; id: string; name: string; descriptionSha256: string; updatedAt: string; targetDate: string | null; status: string; projectPlanKey: string }>;
    releases: Array<{ planKey: string; id: string; name: string; descriptionSha256: string; version: string | null; commitSha: string | null; startDate: string | null; startedAt: string | null; targetDate: string | null; completedAt: string | null; updatedAt: string; pipelinePlanKey: string; stageId: string; stageName: string; stageType: string }>;
    states: Array<{ planKey: string; id: string; name: string; type: string; teamPlanKey: string }>;
    labels: Array<{
      planKey: string;
      id: string;
      semanticRole: "requirement" | "decision" | "risk" | "other";
      name: string;
      teamPlanKey: string | null;
      parentId: string | null;
      parentName: string | null;
    }>;
  };
  coverage: {
    complete: boolean;
    inputNames: string[];
    sourcePaths: string[];
    blockKeys: string[];
    targetPlanKeys: string[];
    relationPlanKeys: string[];
    targetFamilies: {
      requirements: string[];
      decisions: string[];
      risks: string[];
      documents: string[];
      references: string[];
      relations: string[];
    };
  };
}

export interface LinearTargetAllocation {
  planKey: string;
  kind: AuthorityTargetKind;
  title: string | null;
  identifier: string | null;
  uuid: string;
  source: "adopted" | "allocated";
}

export interface LinearAuthorityAllocation {
  schemaVersion: 1;
  planRoot: string;
  sourceSetRoot: string;
  liveCaptureRoot: string;
  allocations: LinearTargetAllocation[];
}

export interface LinearAuthorityValidationInput {
  manifestRaw: string;
  expectedManifestSha256: string;
  sourceFiles: ReadonlyMap<string, Buffer>;
  compilerInputs: ReadonlyMap<string, Buffer>;
  liveCaptureRaw: string;
  expectedLiveCaptureSha256: string;
  allocationRaw: string;
  expectedAllocationSha256: string;
}

export interface LinearAuthorityStructuralValidationSummary {
  status: "structural_integrity_validated";
  sources: number;
  blocks: number;
  targets: number;
  relations: number;
  adopted: number;
  allocated: number;
  structuralIntegrityValidated: true;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
  sourceSetRoot: string;
}

type JsonRecord = Record<string, unknown>;

interface ExpectedTarget {
  planKey: string;
  kind: AuthorityTargetKind;
  title: string | null;
  expectedIdentifier: string | null;
  managed?: AuthorityManagedTarget;
  document?: AuthorityDocumentTarget;
  relation?: AuthorityNativeRelation;
}

const DIGEST = /^[a-f0-9]{64}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.?\/(?:|$))(?!.*\\)[^\0]+$/;
const PLAN_KEY = /^[a-z][a-z0-9-]*:[A-Za-z0-9][A-Za-z0-9._-]*(?::[A-Za-z0-9][A-Za-z0-9._-]*)*$/;
const DISPOSITIONS = new Set<AuthorityDispositionKind>(["proof_only", "narrative_context", "superseded", "retired_source"]);
const RELATION_TYPES = new Set<AuthorityRelationType>(["blocks", "related", "duplicate"]);
const CAPTURE_INPUT_NAMES = new Set<typeof LINEAR_AUTHORITY_COMPILER_INPUT_NAMES[number]>([
  "linear-fingerprint",
  "native-identity",
  "raw-documents",
  "issue-descriptions",
  "capture-receipt",
  "github-artifact",
]);
const CANONICAL_REPOSITORY = "meetblakey/sourcera";
const CANONICAL_REF = "refs/heads/main";
const CANONICAL_SOURCE_PATHS = [
  "Sourcera_Master_Spec.md",
  "UX_Design_of_Sourcera.md",
  "Sourcera_Buyer_Pricing_Strategy.md",
  "Sourcera_Seller_Pricing_Strategy.md",
  "Audit_Prompts.md",
  "Research_MPP.md",
  "Research_MPP_Implementation_Gaps.md",
] as const;
const CANONICAL_SOURCE_ROLES = new Map<string, { precedence: number; role: string }>([
  ["Sourcera_Master_Spec.md", { precedence: 1, role: "product_authority" }],
  ["UX_Design_of_Sourcera.md", { precedence: 2, role: "ux_fallback" }],
  ["Sourcera_Buyer_Pricing_Strategy.md", { precedence: 3, role: "narrative_context" }],
  ["Sourcera_Seller_Pricing_Strategy.md", { precedence: 4, role: "narrative_context" }],
  ["Audit_Prompts.md", { precedence: 5, role: "audit_program" }],
  ["Research_MPP.md", { precedence: 6, role: "research_context" }],
  ["Research_MPP_Implementation_Gaps.md", { precedence: 7, role: "research_context" }],
]);
const CANONICAL_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MANUAL_NATIVE_REFERENCE = /\bREQ-\d+\b/i;
const MANUAL_RELATION_METADATA = /^(?:#{1,6}\s+(?:dependencies?|blockers?|blocked\s+by|parent(?:\s+issue)?|related\s+issues?)\s*|(?:dependencies?|blockers?|blocked\s+by|parent(?:\s+issue)?|related\s+issues?)\s*:.*)$/im;

const sha256 = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
const sort = (values: readonly string[]): string[] => [...values].sort((left, right) => left.localeCompare(right));

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error("Authority canonical payload contains an undefined value");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

const byPlanKey = <T extends { planKey: string }>(rows: readonly T[]): T[] => [...rows].sort((left, right) => left.planKey.localeCompare(right.planKey));

export function computeLinearAuthorityPlanRoot(manifest: LinearAuthorityManifest): string {
  return sha256(canonicalJson({
    schemaVersion: manifest.schemaVersion,
    sourceCommit: manifest.sourceCommit,
    preCutoverTag: manifest.preCutoverTag,
    workspace: manifest.workspace,
    rawDocumentIds: sort(manifest.rawDocumentIds),
    sources: [...manifest.sources].sort((left, right) => left.path.localeCompare(right.path)),
    blocks: [...manifest.blocks].sort((left, right) => left.key.localeCompare(right.key)),
    requirements: byPlanKey(manifest.requirements),
    decisions: byPlanKey(manifest.decisions),
    risks: byPlanKey(manifest.risks),
    documents: byPlanKey(manifest.documents),
    references: byPlanKey(manifest.references),
    nativeRelations: byPlanKey(manifest.nativeRelations),
    issueDescriptionRepairs: [...manifest.issueDescriptionRepairs].sort((left, right) => left.identifier.localeCompare(right.identifier)),
    nativeCatalog: {
      teams: byPlanKey(manifest.nativeCatalog.teams),
      users: byPlanKey(manifest.nativeCatalog.users),
      initiatives: byPlanKey(manifest.nativeCatalog.initiatives),
      projects: byPlanKey(manifest.nativeCatalog.projects),
      releasePipelines: byPlanKey(manifest.nativeCatalog.releasePipelines),
      cycles: byPlanKey(manifest.nativeCatalog.cycles),
      milestones: byPlanKey(manifest.nativeCatalog.milestones),
      releases: byPlanKey(manifest.nativeCatalog.releases),
      states: byPlanKey(manifest.nativeCatalog.states),
      labels: byPlanKey(manifest.nativeCatalog.labels),
    },
  }));
}

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as JsonRecord;
}

function exactKeys(value: unknown, expected: readonly string[], label: string): JsonRecord {
  const row = record(value, label);
  if (sort(Object.keys(row)).join("\0") !== sort(expected).join("\0")) throw new Error(`${label} contract is invalid`);
  return row;
}

function parseJson<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
}

function assertDigest(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !DIGEST.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function assertUuidV4(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !UUID_V4.test(value)) throw new Error(`${label} must be a UUIDv4`);
}

function assertPlanKey(value: unknown, prefix: string | null, label: string): asserts value is string {
  if (typeof value !== "string" || !PLAN_KEY.test(value) || (prefix !== null && !value.startsWith(`${prefix}:`))) {
    throw new Error(`${label} must be a stable plan key${prefix === null ? "" : ` with ${prefix}: prefix`}`);
  }
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) throw new Error(`${label} must be a non-empty trimmed string`);
}

function assertNullableString(value: unknown, label: string): asserts value is string | null {
  if (value !== null) assertString(value, label);
}

function assertStringArray(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) throw new Error(`${label} must be a string array`);
}

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains a duplicate`);
}

function assertExactArray(actual: readonly string[], expected: readonly string[], label: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(sort(expected))) throw new Error(`${label} differs from canonical computed coverage`);
}

export function normalizeAuthorityMarkdown(value: string): string {
  const normalized = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "");
  return `${normalized}\n`;
}

function decodeUtf8(bytes: Buffer, label: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

export function canonicalAuthorityRelationPlanKey(
  type: AuthorityRelationType,
  sourcePlanKey: string,
  targetPlanKey: string,
): string {
  const endpoints = type === "related" ? sort([sourcePlanKey, targetPlanKey]) : [sourcePlanKey, targetPlanKey];
  return `relation:${type}:${endpoints[0]}:${endpoints[1]}`;
}

function canonicalLiveRelationKey(type: string, left: string, right: string): string {
  if (type === "blocks") return `blocks:${left}:${right}`;
  if (type === "blockedBy") return `blocks:${right}:${left}`;
  if (type === "related" || type === "relatedTo") return `related:${sort([left, right]).join(":")}`;
  if (type === "similar") return `similar:${sort([left, right]).join(":")}`;
  if (type === "duplicate" || type === "duplicateOf") return `duplicate:${left}:${right}`;
  throw new Error(`Unsupported native relation type ${type}`);
}

function computedSourceSetRoot(sources: readonly AuthoritySource[]): string {
  return sha256([...sources]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((source) => [source.precedence, source.path, source.role, source.byteLength, source.rawSha256, source.normalizedSha256].join("\0"))
    .join("\n"));
}

function computedCompilerInputRoot(inputs: LinearAuthorityManifest["inputs"]): string {
  return sha256([...inputs]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((input) => `${input.name}\0${input.byteLength}\0${input.sha256}`)
    .join("\n"));
}

function computedLiveCaptureRoot(inputs: LinearAuthorityManifest["inputs"]): string {
  return sha256(inputs
    .filter((input) => CAPTURE_INPUT_NAMES.has(input.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((input) => `${input.name}\0${input.byteLength}\0${input.sha256}`)
    .join("\n"));
}

function computedManagedPayload(target: AuthorityManagedTarget): string {
  return sha256(JSON.stringify({
    title: target.title,
    description: target.description,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey,
    priority: target.priority,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: target.releasePlanKeys,
    labelPlanKeys: target.labelPlanKeys,
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  }));
}

function assertManifestShape(value: unknown): asserts value is LinearAuthorityManifest {
  const manifest = exactKeys(value, [
    "schemaVersion", "sourceCommit", "preCutoverTag", "workspace", "rawDocumentIds", "planRoot", "sourceSetRoot", "liveCaptureRoot", "compilerInputRoot", "inputs",
    "sources", "blocks", "requirements", "decisions", "risks", "documents", "references", "nativeRelations", "issueDescriptionRepairs", "nativeCatalog",
    "coverage",
  ], "authority manifest");
  if (manifest.schemaVersion !== 1) throw new Error("Authority manifest schemaVersion must be 1");
  if (typeof manifest.sourceCommit !== "string" || !/^[a-f0-9]{40,64}$/.test(manifest.sourceCommit)) throw new Error("Authority manifest source commit is invalid");
  assertString(manifest.preCutoverTag, "Authority manifest pre-cutover tag");
  const workspace = exactKeys(manifest.workspace, ["id", "name", "urlKey"], "Authority manifest workspace");
  assertUuidV4(workspace.id, "Authority manifest workspace ID");
  assertString(workspace.name, "Authority manifest workspace name");
  assertString(workspace.urlKey, "Authority manifest workspace URL key");
  assertStringArray(manifest.rawDocumentIds, "Authority manifest raw document IDs");
  assertUnique(manifest.rawDocumentIds, "Authority manifest raw document IDs");
  for (const id of manifest.rawDocumentIds) assertUuidV4(id, "Authority manifest raw document UUID");
  for (const field of ["planRoot", "sourceSetRoot", "liveCaptureRoot", "compilerInputRoot"] as const) assertDigest(manifest[field], `Authority manifest ${field}`);
  for (const field of ["inputs", "sources", "blocks", "requirements", "decisions", "risks", "documents", "references", "nativeRelations", "issueDescriptionRepairs"] as const) {
    if (!Array.isArray(manifest[field])) throw new Error(`Authority manifest ${field} must be an array`);
  }
  exactKeys(manifest.nativeCatalog, ["teams", "users", "initiatives", "projects", "releasePipelines", "cycles", "milestones", "releases", "states", "labels"], "Authority manifest native catalog");
  exactKeys(manifest.coverage, ["complete", "inputNames", "sourcePaths", "blockKeys", "targetPlanKeys", "relationPlanKeys", "targetFamilies"], "Authority manifest coverage");
}

function validateCompilerInputs(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  liveCaptureRaw: string,
): void {
  const expectedNames = [...LINEAR_AUTHORITY_COMPILER_INPUT_NAMES];
  const rows = manifest.inputs;
  for (const row of rows) {
    exactKeys(row, ["name", "byteLength", "sha256"], "Compiler input row");
    assertString(row.name, "Compiler input name");
    if (!Number.isInteger(row.byteLength) || row.byteLength < 1) throw new Error(`Compiler input ${row.name} byte length is invalid`);
    assertDigest(row.sha256, `Compiler input ${row.name} digest`);
  }
  assertUnique(rows.map((row) => row.name), "Compiler input names");
  if (JSON.stringify(sort(rows.map((row) => row.name))) !== JSON.stringify(sort(expectedNames))) throw new Error("Compiler input coverage is incomplete");
  const nativeRow = rows.find((row) => row.name === "native-identity")!;
  if (nativeRow.byteLength !== Buffer.byteLength(liveCaptureRaw) || nativeRow.sha256 !== sha256(liveCaptureRaw)) throw new Error("Compiler input native-identity byte length or digest mismatch");
  const expectedFileNames = expectedNames.filter((name) => name !== "native-identity");
  if (JSON.stringify(sort([...compilerInputs.keys()])) !== JSON.stringify(sort(expectedFileNames))) throw new Error("Compiler input file coverage is incomplete");
  for (const row of rows) {
    if (row.name === "native-identity") continue;
    const bytes = compilerInputs.get(row.name);
    if (!bytes || bytes.length !== row.byteLength || sha256(bytes) !== row.sha256) throw new Error(`Compiler input ${row.name} byte length or digest mismatch`);
  }
  const root = computedCompilerInputRoot(rows);
  if (root !== manifest.compilerInputRoot) throw new Error("Compiler input root mismatch");
  if (computedLiveCaptureRoot(rows) !== manifest.liveCaptureRoot) throw new Error("Live capture root mismatch");
  validateCaptureProvenance(manifest, compilerInputs, liveCaptureRaw);
}

function validateCaptureProvenance(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  liveCaptureRaw: string,
): void {
  const fingerprint = compilerInputs.get("linear-fingerprint")!;
  const documents = compilerInputs.get("raw-documents")!;
  const issueDescriptions = compilerInputs.get("issue-descriptions")!;
  const receiptValue = parseJson<unknown>(compilerInputs.get("capture-receipt")!.toString("utf8"), "Capture receipt");
  const receipt = exactKeys(receiptValue, ["schemaVersion", "captureMode", "capturedAt", "fingerprintSha256", "acceptedFingerprintSha256", "artifactSha256s", "source"], "Capture receipt");
  if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" || typeof receipt.capturedAt !== "string" || !CANONICAL_UTC.test(receipt.capturedAt) || new Date(receipt.capturedAt).toISOString() !== receipt.capturedAt) throw new Error("Capture receipt version, live capture mode, or capturedAt is invalid");
  const artifactSha256s = exactKeys(receipt.artifactSha256s, ["fingerprint", "nativeIdentity", "documents", "issueDescriptions"], "Capture receipt artifact hashes");
  const fingerprintSha = sha256(fingerprint);
  const nativeIdentitySha = sha256(liveCaptureRaw);
  const documentsSha = sha256(documents);
  if (receipt.fingerprintSha256 !== fingerprintSha || receipt.acceptedFingerprintSha256 !== fingerprintSha || artifactSha256s.fingerprint !== fingerprintSha || artifactSha256s.nativeIdentity !== nativeIdentitySha || artifactSha256s.documents !== documentsSha || artifactSha256s.issueDescriptions !== sha256(issueDescriptions)) throw new Error("Capture receipt artifact hashes differ from supplied capture bytes");
  const source = exactKeys(receipt.source, ["repository", "commit", "ref", "runId", "runAttempt"], "Capture receipt source");
  if (source.repository !== CANONICAL_REPOSITORY || source.commit !== manifest.sourceCommit || source.ref !== CANONICAL_REF || typeof source.runId !== "string" || !/^[1-9]\d*$/.test(source.runId) || typeof source.runAttempt !== "string" || !/^[1-9]\d*$/.test(source.runAttempt)) throw new Error("Capture receipt source does not match the canonical repository, main commit, and run identity");

  const metadataValue = parseJson<unknown>(compilerInputs.get("github-artifact")!.toString("utf8"), "GitHub artifact metadata");
  const metadata = exactKeys(metadataValue, ["schemaVersion", "artifact"], "GitHub artifact metadata");
  if (metadata.schemaVersion !== 1) throw new Error("GitHub artifact metadata schemaVersion must be 1");
  const artifact = exactKeys(metadata.artifact, ["id", "name", "digest", "repository", "commit", "ref", "runId", "runAttempt"], "GitHub artifact");
  if (typeof artifact.id !== "string" || !/^[1-9]\d*$/.test(artifact.id) || typeof artifact.digest !== "string" || !/^sha256:[a-f0-9]{64}$/.test(artifact.digest)) throw new Error("GitHub artifact ID or digest is invalid");
  const expectedName = `linear-native-authority-capture-${manifest.sourceCommit}-${String(source.runId)}-${String(source.runAttempt)}`;
  if (artifact.name !== expectedName || artifact.repository !== source.repository || artifact.commit !== source.commit || artifact.ref !== source.ref || artifact.runId !== source.runId || artifact.runAttempt !== source.runAttempt) throw new Error("GitHub artifact metadata differs from the capture receipt provenance");
}

function validateSources(
  manifest: LinearAuthorityManifest,
  sourceFiles: ReadonlyMap<string, Buffer>,
): Map<string, Buffer> {
  if (manifest.sources.length === 0) throw new Error("Authority manifest has no sources");
  const sources = new Map<string, Buffer>();
  const precedences = new Set<number>();
  for (const source of manifest.sources) {
    exactKeys(source, ["path", "role", "precedence", "byteLength", "rawSha256", "normalizedSha256"], "Authority source");
    if (typeof source.path !== "string" || !SOURCE_PATH.test(source.path) || source.path.split("/").some((part) => part === "." || part === ".." || part === "")) throw new Error(`Authority source path ${String(source.path)} is unsafe`);
    assertString(source.role, `Authority source ${source.path} role`);
    if (!Number.isInteger(source.precedence) || source.precedence < 1 || precedences.has(source.precedence)) throw new Error(`Authority source ${source.path} precedence is invalid or duplicate`);
    precedences.add(source.precedence);
    if (!Number.isInteger(source.byteLength) || source.byteLength < 1) throw new Error(`Authority source ${source.path} byte length is invalid`);
    assertDigest(source.rawSha256, `Authority source ${source.path} raw digest`);
    assertDigest(source.normalizedSha256, `Authority source ${source.path} normalized digest`);
    if (sources.has(source.path)) throw new Error(`Authority source ${source.path} is duplicated`);
    const bytes = sourceFiles.get(source.path);
    if (!bytes) throw new Error(`Authority source ${source.path} is missing`);
    if (bytes.length !== source.byteLength) throw new Error(`Authority source ${source.path} byte length mismatch`);
    if (sha256(bytes) !== source.rawSha256) throw new Error(`Authority source ${source.path} raw digest mismatch`);
    const normalized = normalizeAuthorityMarkdown(decodeUtf8(bytes, `Authority source ${source.path}`));
    if (sha256(normalized) !== source.normalizedSha256) throw new Error(`Authority source ${source.path} normalized digest mismatch`);
    sources.set(source.path, bytes);
  }
  if (JSON.stringify(sort([...sourceFiles.keys()])) !== JSON.stringify(sort([...sources.keys()]))) throw new Error("Authority source file coverage is incomplete");
  if (JSON.stringify(sort([...sources.keys()])) !== JSON.stringify(sort(CANONICAL_SOURCE_PATHS))) throw new Error("Authority sources do not exactly cover the seven canonical Sourcera publications");
  for (const source of manifest.sources) {
    const expected = CANONICAL_SOURCE_ROLES.get(source.path)!;
    if (source.precedence !== expected.precedence || source.role !== expected.role) throw new Error(`Authority source ${source.path} has the wrong canonical role or precedence`);
  }
  if (computedSourceSetRoot(manifest.sources) !== manifest.sourceSetRoot) throw new Error("Authority source set root mismatch");
  return sources;
}

function validateBlocks(
  manifest: LinearAuthorityManifest,
  sources: ReadonlyMap<string, Buffer>,
): Map<string, AuthorityBlock> {
  if (manifest.blocks.length === 0) throw new Error("Authority manifest has no classified blocks");
  const blocks = new Map<string, AuthorityBlock>();
  for (const block of manifest.blocks) {
    exactKeys(block, ["key", "sourcePath", "byteStart", "byteEnd", "heading", "rawSha256", "normalizedSha256", "type", "classification", "targetPlanKey", "disposition"], "Authority block");
    assertPlanKey(block.key, "block", "Authority block key");
    if (blocks.has(block.key)) throw new Error(`Authority manifest has duplicate block ${block.key}`);
    if (!sources.has(block.sourcePath)) throw new Error(`Authority block ${block.key} references an unknown source`);
    if (!Number.isInteger(block.byteStart) || !Number.isInteger(block.byteEnd) || block.byteStart < 0 || block.byteEnd <= block.byteStart) throw new Error(`Authority block ${block.key} range is invalid`);
    assertString(block.heading, `Authority block ${block.key} heading`);
    assertString(block.type, `Authority block ${block.key} type`);
    assertDigest(block.rawSha256, `Authority block ${block.key} raw digest`);
    assertDigest(block.normalizedSha256, `Authority block ${block.key} normalized digest`);
    const hasTarget = block.targetPlanKey !== null;
    const hasDisposition = block.disposition !== null;
    if (hasTarget === hasDisposition) throw new Error(`Authority block ${block.key} must have exactly one canonical target or disposition`);
    if (block.classification === "active") {
      if (!hasTarget || hasDisposition) throw new Error(`Authority block ${block.key} active classification requires one target`);
      assertPlanKey(block.targetPlanKey, null, `Authority block ${block.key} target`);
    } else {
      if (!DISPOSITIONS.has(block.classification as AuthorityDispositionKind) || !hasDisposition) throw new Error(`Authority block ${block.key} classification is invalid`);
      const disposition = exactKeys(block.disposition, ["kind", "decisionPlanKey"], `Authority block ${block.key} disposition`);
      if (disposition.kind !== block.classification) throw new Error(`Authority block ${block.key} classification and disposition differ`);
      assertPlanKey(disposition.decisionPlanKey, "decision", `Authority block ${block.key} disposition decision`);
    }
    blocks.set(block.key, block);
  }
  for (const [path, bytes] of sources) {
    const sourceBlocks = manifest.blocks.filter((block) => block.sourcePath === path).sort((left, right) => left.byteStart - right.byteStart);
    let cursor = 0;
    for (const block of sourceBlocks) {
      if (block.byteStart !== cursor || block.byteEnd > bytes.length) throw new Error(`Authority source ${path} block ranges do not form an exact byte partition`);
      cursor = block.byteEnd;
    }
    if (cursor !== bytes.length) throw new Error(`Authority source ${path} block ranges leave a gap`);
    for (const block of sourceBlocks) {
      const slice = bytes.subarray(block.byteStart, block.byteEnd);
      if (sha256(slice) !== block.rawSha256) throw new Error(`Authority block ${block.key} raw digest mismatch`);
      const normalized = normalizeAuthorityMarkdown(decodeUtf8(slice, `Authority block ${block.key}`));
      if (sha256(normalized) !== block.normalizedSha256) throw new Error(`Authority block ${block.key} normalized digest mismatch`);
      const firstContentLine = normalized.split("\n").find((line) => line.trim().length > 0);
      if (firstContentLine !== block.heading) throw new Error(`Authority block ${block.key} heading does not match its exact source slice`);
    }
  }
  return blocks;
}

interface CatalogMaps {
  teams: Map<string, LinearAuthorityManifest["nativeCatalog"]["teams"][number]>;
  users: Map<string, LinearAuthorityManifest["nativeCatalog"]["users"][number]>;
  initiatives: Map<string, LinearAuthorityManifest["nativeCatalog"]["initiatives"][number]>;
  projects: Map<string, LinearAuthorityManifest["nativeCatalog"]["projects"][number]>;
  releasePipelines: Map<string, LinearAuthorityManifest["nativeCatalog"]["releasePipelines"][number]>;
  cycles: Map<string, LinearAuthorityManifest["nativeCatalog"]["cycles"][number]>;
  milestones: Map<string, LinearAuthorityManifest["nativeCatalog"]["milestones"][number]>;
  releases: Map<string, LinearAuthorityManifest["nativeCatalog"]["releases"][number]>;
  states: Map<string, LinearAuthorityManifest["nativeCatalog"]["states"][number]>;
  labels: Map<string, LinearAuthorityManifest["nativeCatalog"]["labels"][number]>;
}

interface AuthorityScopes {
  project: LinearProjectScope;
  program: LinearProgramScopeV3;
  governedDocumentIds: string[];
}

function validateAuthorityScopes(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  catalog: CatalogMaps,
): AuthorityScopes {
  const projectValue = parseJson<unknown>(compilerInputs.get("project-scope")!.toString("utf8"), "Canonical project scope");
  const projectRecord = exactKeys(projectValue, ["schemaVersion", "projects"], "Canonical project scope");
  if (projectRecord.schemaVersion !== 1 || !Array.isArray(projectRecord.projects)) throw new Error("Canonical project scope contract is invalid");
  for (const value of projectRecord.projects) {
    const project = exactKeys(value, ["id", "name"], "Canonical project scope row");
    assertUuidV4(project.id, "Canonical project scope UUID");
    assertString(project.name, `Canonical project scope ${project.id} name`);
  }
  const project = projectRecord as unknown as LinearProjectScope;
  assertLinearProjectScope(project, [...catalog.projects.values()].map((row) => ({ id: row.id, name: row.name })));

  const programValue = parseJson<unknown>(compilerInputs.get("program-scope")!.toString("utf8"), "Canonical program scope");
  const programRecord = exactKeys(programValue, [
    "schemaVersion", "outcomeInitiatives", "planningDocument", "projectDescriptionFingerprints", "projectInitiatives",
    "canonicalProjectDocuments", "supplementaryDocuments", "projectDocumentDecisionContract",
  ], "Canonical program scope");
  if (programRecord.schemaVersion !== 3 || !Array.isArray(programRecord.outcomeInitiatives) || !Array.isArray(programRecord.projectDescriptionFingerprints) || !Array.isArray(programRecord.projectInitiatives) || !Array.isArray(programRecord.canonicalProjectDocuments) || !Array.isArray(programRecord.supplementaryDocuments)) throw new Error("Canonical program scope v3 contract is invalid");
  const initiatives = programRecord.outcomeInitiatives.map((value) => {
    const row = exactKeys(value, ["id", "name"], "Canonical outcome initiative");
    assertUuidV4(row.id, "Canonical outcome initiative UUID");
    assertString(row.name, `Canonical outcome initiative ${row.id} name`);
    return row as { id: string; name: string };
  });
  if (initiatives.length !== 6) throw new Error("Canonical program scope must define exactly six active outcome initiatives");
  assertUnique(initiatives.map((row) => row.id), "Canonical outcome initiative IDs");
  const catalogInitiatives = [...catalog.initiatives.values()].map((row) => ({ id: row.id, name: row.name })).sort((left, right) => left.id.localeCompare(right.id));
  if (JSON.stringify(initiatives.slice().sort((left, right) => left.id.localeCompare(right.id))) !== JSON.stringify(catalogInitiatives)) throw new Error("Canonical program initiatives differ from the authority initiative catalog");

  const planning = exactKeys(programRecord.planningDocument, ["id", "title", "contentFingerprint", "initiativeId", "projectId", "teamId", "issueId", "requiredSections"], "Canonical planning document");
  assertUuidV4(planning.id, "Canonical planning document UUID");
  assertString(planning.title, "Canonical planning document title");
  assertDigest(planning.contentFingerprint, "Canonical planning document content fingerprint");
  assertStringArray(planning.requiredSections, "Canonical planning document required sections");
  if (planning.requiredSections.length === 0) throw new Error("Canonical planning document has no required sections");
  for (const field of ["initiativeId", "projectId", "teamId", "issueId"] as const) if (planning[field] !== null) assertUuidV4(planning[field], `Canonical planning document ${field}`);

  const canonicalIds: string[] = [];
  let prds = 0;
  let briefs = 0;
  for (const value of programRecord.canonicalProjectDocuments) {
    const row = exactKeys(value, ["id", "projectId", "projectName", "kind", "title", "contentFingerprint", "requiredSections", "masterSpecSections"], "Canonical project document");
    assertUuidV4(row.id, "Canonical project document UUID");
    assertUuidV4(row.projectId, `Canonical project document ${row.id} project UUID`);
    assertString(row.projectName, `Canonical project document ${row.id} project name`);
    assertString(row.title, `Canonical project document ${row.id} title`);
    assertDigest(row.contentFingerprint, `Canonical project document ${row.id} fingerprint`);
    assertStringArray(row.requiredSections, `Canonical project document ${row.id} required sections`);
    assertStringArray(row.masterSpecSections, `Canonical project document ${row.id} Master Spec sections`);
    if (row.kind === "prd") prds += 1;
    else if (row.kind === "engineering_readiness_brief") briefs += 1;
    else throw new Error(`Canonical project document ${row.id} kind is invalid`);
    canonicalIds.push(row.id as string);
  }
  if (canonicalIds.length !== 26 || prds !== 20 || briefs !== 6) throw new Error("Canonical program scope must define exactly 20 PRDs and 6 engineering readiness briefs");
  const supplementaryIds: string[] = [];
  for (const value of programRecord.supplementaryDocuments) {
    const row = exactKeys(value, ["id", "projectId", "title", "contentFingerprint", "requiredSections", "masterSpecSections"], "Canonical supplementary document");
    assertUuidV4(row.id, "Canonical supplementary document UUID");
    assertUuidV4(row.projectId, `Canonical supplementary document ${row.id} project UUID`);
    assertString(row.title, `Canonical supplementary document ${row.id} title`);
    assertDigest(row.contentFingerprint, `Canonical supplementary document ${row.id} fingerprint`);
    assertStringArray(row.requiredSections, `Canonical supplementary document ${row.id} required sections`);
    assertStringArray(row.masterSpecSections, `Canonical supplementary document ${row.id} Master Spec sections`);
    supplementaryIds.push(row.id as string);
  }
  if (supplementaryIds.length !== 3) throw new Error("Canonical program scope must define exactly three supplementary documents");
  const governedDocumentIds = [planning.id as string, ...canonicalIds, ...supplementaryIds];
  assertUnique(governedDocumentIds, "Canonical governed document IDs");
  if (JSON.stringify(sort(governedDocumentIds)) !== JSON.stringify(sort(manifest.rawDocumentIds))) throw new Error("Authority raw document allowlist differs from the canonical 30-document program scope");
  const decisionContract = record(programRecord.projectDocumentDecisionContract, "Canonical decision contract");
  assertUuidV4(decisionContract.decisionLabelId, "Canonical decision label UUID");
  if (!Array.isArray(decisionContract.labelDefinitions)) throw new Error("Canonical decision label definitions are missing");
  const decisionDefinitionValue = decisionContract.labelDefinitions.find((value) => record(value, "Canonical decision label definition").id === decisionContract.decisionLabelId);
  const decisionDefinition = exactKeys(decisionDefinitionValue, ["id", "name", "groupId", "groupName"], "Canonical decision label definition");
  const decisionLabel = [...catalog.labels.values()].filter((label) => label.semanticRole === "decision");
  if (decisionDefinition.name !== "decision" || decisionDefinition.groupName !== "Type" || decisionLabel.length !== 1 || decisionLabel[0].id !== decisionDefinition.id || decisionLabel[0].name !== decisionDefinition.name || decisionLabel[0].parentId !== decisionDefinition.groupId || decisionLabel[0].parentName !== decisionDefinition.groupName || decisionLabel[0].teamPlanKey !== null) throw new Error("Authority decision label differs from the canonical grouped Type decision identity");
  return { project, program: programRecord as unknown as LinearProgramScopeV3, governedDocumentIds };
}

function keyedCatalog<T extends { planKey: string; id: string }>(
  rows: T[],
  prefix: string,
  label: string,
  validate: (row: T) => void,
): Map<string, T> {
  const map = new Map<string, T>();
  const ids = new Set<string>();
  for (const row of rows) {
    assertPlanKey(row.planKey, prefix, `${label} plan key`);
    assertUuidV4(row.id, `${label} ${row.planKey} UUID`);
    if (map.has(row.planKey) || ids.has(row.id.toLowerCase())) throw new Error(`${label} catalog contains a duplicate identity`);
    validate(row);
    map.set(row.planKey, row);
    ids.add(row.id.toLowerCase());
  }
  return map;
}

function validateManifestCatalog(manifest: LinearAuthorityManifest): CatalogMaps {
  const catalog = manifest.nativeCatalog;
  for (const field of ["teams", "users", "initiatives", "projects", "releasePipelines", "cycles", "milestones", "releases", "states", "labels"] as const) {
    if (!Array.isArray(catalog[field])) throw new Error(`Native ${field} catalog must be an array`);
  }
  const teams = keyedCatalog(catalog.teams, "team", "Team", (row) => {
    exactKeys(row, ["planKey", "id", "key", "name"], "Team catalog row");
    assertString(row.key, `Team ${row.planKey} key`);
    assertString(row.name, `Team ${row.planKey} name`);
  });
  if (teams.size === 0) throw new Error("Native team catalog is empty");
  const users = keyedCatalog(catalog.users, "user", "User", (row) => {
    exactKeys(row, ["planKey", "id", "name", "active"], "User catalog row");
    assertString(row.name, `User ${row.planKey} name`);
    if (row.active !== true) throw new Error(`User ${row.planKey} must be active`);
  });
  const initiatives = keyedCatalog(catalog.initiatives, "initiative", "Initiative", (row) => {
    exactKeys(row, ["planKey", "id", "name", "contentSha256", "descriptionSha256", "updatedAt", "ownerId", "status", "priority", "health", "healthUpdatedAt", "startedAt", "targetDate", "targetDateResolution", "parentInitiativeId"], "Initiative catalog row");
    assertString(row.name, `Initiative ${row.planKey} name`);
    assertDigest(row.contentSha256, `Initiative ${row.planKey} content digest`);
    assertDigest(row.descriptionSha256, `Initiative ${row.planKey} description digest`);
    canonicalUtc(row.updatedAt, `Initiative ${row.planKey} updatedAt`);
    assertString(row.status, `Initiative ${row.planKey} status`);
    if (!Number.isInteger(row.priority) || row.priority < 0 || row.priority > 4) throw new Error(`Initiative ${row.planKey} priority is invalid`);
    if (row.ownerId !== null) assertUuidV4(row.ownerId, `Initiative ${row.planKey} owner UUID`);
    if (row.parentInitiativeId !== null) assertUuidV4(row.parentInitiativeId, `Initiative ${row.planKey} parent UUID`);
  });
  const projects = keyedCatalog(catalog.projects, "project", "Project", (row) => {
    exactKeys(row, ["planKey", "id", "name", "contentSha256", "updatedAt", "statusId", "status", "statusType", "priority", "leadId", "startDate", "startDateResolution", "targetDate", "targetDateResolution", "teamPlanKeys", "initiativePlanKeys"], "Project catalog row");
    assertString(row.name, `Project ${row.planKey} name`);
    assertDigest(row.contentSha256, `Project ${row.planKey} content digest`);
    canonicalUtc(row.updatedAt, `Project ${row.planKey} updatedAt`);
    assertUuidV4(row.statusId, `Project ${row.planKey} status UUID`);
    assertString(row.status, `Project ${row.planKey} status`);
    assertString(row.statusType, `Project ${row.planKey} status type`);
    if (!Number.isInteger(row.priority) || row.priority < 0 || row.priority > 4) throw new Error(`Project ${row.planKey} priority is invalid`);
    if (row.leadId !== null) assertUuidV4(row.leadId, `Project ${row.planKey} lead UUID`);
    assertStringArray(row.teamPlanKeys, `Project ${row.planKey} teams`);
    assertStringArray(row.initiativePlanKeys, `Project ${row.planKey} initiatives`);
    assertUnique(row.teamPlanKeys, `Project ${row.planKey} teams`);
    assertUnique(row.initiativePlanKeys, `Project ${row.planKey} initiatives`);
  });
  const releasePipelines = keyedCatalog(catalog.releasePipelines, "release-pipeline", "Release pipeline", (row) => {
    exactKeys(row, ["planKey", "id", "name", "updatedAt", "type", "isProduction", "teamPlanKeys", "stages"], "Release pipeline catalog row");
    assertString(row.name, `Release pipeline ${row.planKey} name`);
    canonicalUtc(row.updatedAt, `Release pipeline ${row.planKey} updatedAt`);
    assertString(row.type, `Release pipeline ${row.planKey} type`);
    assertStringArray(row.teamPlanKeys, `Release pipeline ${row.planKey} teams`);
    if (!Array.isArray(row.stages)) throw new Error(`Release pipeline ${row.planKey} stages must be an array`);
    for (const stage of row.stages) {
      exactKeys(stage, ["id", "name", "type", "position", "frozen"], `Release pipeline ${row.planKey} stage`);
      assertUuidV4(stage.id, `Release pipeline ${row.planKey} stage UUID`);
      assertString(stage.name, `Release pipeline ${row.planKey} stage name`);
      assertString(stage.type, `Release pipeline ${row.planKey} stage type`);
    }
  });
  const cycles = keyedCatalog(catalog.cycles, "cycle", "Cycle", (row) => {
    exactKeys(row, ["planKey", "id", "number", "name", "descriptionSha256", "updatedAt", "startsAt", "endsAt", "completedAt", "teamPlanKey", "inheritedFromId"], "Cycle catalog row");
    if (!Number.isInteger(row.number) || row.number < 1) throw new Error(`Cycle ${row.planKey} number is invalid`);
    assertNullableString(row.name, `Cycle ${row.planKey} name`);
    assertDigest(row.descriptionSha256, `Cycle ${row.planKey} description digest`);
    canonicalUtc(row.updatedAt, `Cycle ${row.planKey} updatedAt`);
    assertPlanKey(row.teamPlanKey, "team", `Cycle ${row.planKey} team`);
  });
  const milestones = keyedCatalog(catalog.milestones, "milestone", "Milestone", (row) => {
    exactKeys(row, ["planKey", "id", "name", "descriptionSha256", "updatedAt", "targetDate", "status", "projectPlanKey"], "Milestone catalog row");
    assertString(row.name, `Milestone ${row.planKey} name`);
    assertDigest(row.descriptionSha256, `Milestone ${row.planKey} description digest`);
    canonicalUtc(row.updatedAt, `Milestone ${row.planKey} updatedAt`);
    assertString(row.status, `Milestone ${row.planKey} status`);
    assertPlanKey(row.projectPlanKey, "project", `Milestone ${row.planKey} project`);
  });
  const releases = keyedCatalog(catalog.releases, "release", "Release", (row) => {
    exactKeys(row, ["planKey", "id", "name", "descriptionSha256", "version", "commitSha", "startDate", "startedAt", "targetDate", "completedAt", "updatedAt", "pipelinePlanKey", "stageId", "stageName", "stageType"], "Release catalog row");
    assertString(row.name, `Release ${row.planKey} name`);
    assertDigest(row.descriptionSha256, `Release ${row.planKey} description digest`);
    canonicalUtc(row.updatedAt, `Release ${row.planKey} updatedAt`);
    assertPlanKey(row.pipelinePlanKey, "release-pipeline", `Release ${row.planKey} pipeline`);
    assertUuidV4(row.stageId, `Release ${row.planKey} stage UUID`);
    assertString(row.stageName, `Release ${row.planKey} stage name`);
    assertString(row.stageType, `Release ${row.planKey} stage type`);
  });
  const states = keyedCatalog(catalog.states, "state", "Workflow state", (row) => {
    exactKeys(row, ["planKey", "id", "name", "type", "teamPlanKey"], "Workflow state catalog row");
    assertString(row.name, `Workflow state ${row.planKey} name`);
    assertString(row.type, `Workflow state ${row.planKey} type`);
    assertPlanKey(row.teamPlanKey, "team", `Workflow state ${row.planKey} team`);
  });
  const labels = keyedCatalog(catalog.labels, "label", "Label", (row) => {
    exactKeys(row, ["planKey", "id", "semanticRole", "name", "teamPlanKey", "parentId", "parentName"], "Label catalog row");
    if (!["requirement", "decision", "risk", "other"].includes(row.semanticRole)) throw new Error(`Label ${row.planKey} semantic role is invalid`);
    assertString(row.name, `Label ${row.planKey} name`);
    if (row.teamPlanKey !== null) assertPlanKey(row.teamPlanKey, "team", `Label ${row.planKey} team`);
    if ((row.parentId === null) !== (row.parentName === null)) throw new Error(`Label ${row.planKey} parent identity is incomplete`);
    if (row.parentId !== null) {
      assertUuidV4(row.parentId, `Label ${row.planKey} parent UUID`);
      assertString(row.parentName, `Label ${row.planKey} parent name`);
    }
  });
  for (const row of projects.values()) {
    for (const key of row.teamPlanKeys) if (!teams.has(key)) throw new Error(`Project ${row.planKey} has an unknown team selector`);
    for (const key of row.initiativePlanKeys) if (!initiatives.has(key)) throw new Error(`Project ${row.planKey} has an unknown initiative selector`);
  }
  for (const row of releasePipelines.values()) for (const key of row.teamPlanKeys) if (!teams.has(key)) throw new Error(`Release pipeline ${row.planKey} has an unknown team selector`);
  for (const row of states.values()) if (!teams.has(row.teamPlanKey)) throw new Error(`Workflow state ${row.planKey} has an unknown team selector`);
  for (const row of cycles.values()) if (!teams.has(row.teamPlanKey)) throw new Error(`Cycle ${row.planKey} has an unknown team selector`);
  for (const row of milestones.values()) if (!projects.has(row.projectPlanKey)) throw new Error(`Milestone ${row.planKey} has an unknown project selector`);
  for (const row of releases.values()) if (!releasePipelines.has(row.pipelinePlanKey) || !releasePipelines.get(row.pipelinePlanKey)!.stages.some((stage) => stage.id === row.stageId && stage.name === row.stageName && stage.type === row.stageType)) throw new Error(`Release ${row.planKey} has an unknown pipeline or stage selector`);
  for (const row of labels.values()) if (row.teamPlanKey !== null && !teams.has(row.teamPlanKey)) throw new Error(`Label ${row.planKey} has an unknown team selector`);
  const requirement = [...labels.values()].filter((row) => row.semanticRole === "requirement");
  const decision = [...labels.values()].filter((row) => row.semanticRole === "decision");
  if (requirement.length !== 1 || requirement[0].name !== "Requirement") throw new Error("Native catalog must pin exactly one Requirement label");
  if (decision.length !== 1 || decision[0].name !== "decision") throw new Error("Native catalog must pin exactly one grouped decision label");
  if (requirement[0].teamPlanKey === null || requirement[0].parentId !== null || requirement[0].parentName !== null) throw new Error("Requirement label must be team-scoped and non-grouped");
  if (decision[0].teamPlanKey !== null || decision[0].parentId === null || decision[0].parentName !== "Type") throw new Error("decision label must be the workspace-scoped non-group child of Type");
  for (const risk of [...labels.values()].filter((row) => row.semanticRole === "risk")) {
    if (risk.name !== "risk" || risk.parentName !== "Type" || risk.parentId === null) throw new Error("Risk label must be the non-group risk child of Type");
  }
  if (manifest.risks.length > 0 && [...labels.values()].filter((row) => row.semanticRole === "risk").length !== 1) throw new Error("Native catalog must pin exactly one risk label when risk targets exist");
  return { teams, users, initiatives, projects, releasePipelines, cycles, milestones, releases, states, labels };
}

function addTarget(targets: Map<string, ExpectedTarget>, target: ExpectedTarget): void {
  assertPlanKey(target.planKey, null, "Authority target plan key");
  if (targets.has(target.planKey)) throw new Error(`Authority target ${target.planKey} is duplicated`);
  if (target.title !== null) assertString(target.title, `Authority target ${target.planKey} title`);
  targets.set(target.planKey, target);
}

function assertManagedSourceBinding(
  target: AuthorityManagedTarget,
  blocksByKey: ReadonlyMap<string, AuthorityBlock>,
): void {
  if (target.origin !== "source") return;
  const expectedLines = [...target.blockKeys]
    .sort((left, right) => left.localeCompare(right))
    .map((key) => {
      const block = blocksByKey.get(key);
      if (!block) throw new Error(`Managed ${target.kind} ${target.planKey} source binding references an unknown block`);
      return `- ${block.sourcePath} | ${block.heading} | sha256:${block.rawSha256}`;
    });
  const headings = target.description.match(/^## Source binding\s*$/gm) ?? [];
  const section = /^## Source binding\s*\n+([\s\S]*?)(?=\n##\s|(?![\s\S]))/m.exec(target.description);
  if (headings.length !== 1 || !section || section[1].trim() !== expectedLines.join("\n")) {
    throw new Error(`Managed ${target.kind} ${target.planKey} source binding does not exactly match its canonical source blocks`);
  }
}

function validateManagedTargets(
  manifest: LinearAuthorityManifest,
  catalog: CatalogMaps,
  targets: Map<string, ExpectedTarget>,
): void {
  const blocksByKey = new Map(manifest.blocks.map((block) => [block.key, block]));
  const families: Array<[AuthorityManagedTarget[], AuthorityManagedTarget["kind"], string, AuthorityTargetKind]> = [
    [manifest.requirements, "requirement", "issue", "issue"],
    [manifest.decisions, "decision", "decision", "decision"],
    [manifest.risks, "risk", "risk", "risk"],
  ];
  for (const [rows, expectedKind, prefix, allocationKind] of families) {
    for (const target of rows) {
      exactKeys(target, ["kind", "origin", "planKey", "title", "expectedCurrentIssueUuid", "expectedCurrentDescriptionSha256", "expectedCurrentNativeSha256", "expectedIdentifier", "blockKeys", "description", "descriptionSha256", "payloadSha256", "teamPlanKey", "projectPlanKey", "statePlanKey", "labelPlanKeys", "priority", "estimate", "dueDate", "cyclePlanKey", "milestonePlanKey", "releasePlanKeys", "parentPlanKey", "assigneePlanKey"], `Managed ${expectedKind} target`);
      if (target.kind !== expectedKind) throw new Error(`${target.planKey} managed target kind differs from its family`);
      if (target.origin !== "source" && target.origin !== "live") throw new Error(`${target.planKey} managed target origin is invalid`);
      assertPlanKey(target.planKey, prefix, `Managed ${expectedKind} target`);
      assertString(target.title, `Managed ${expectedKind} ${target.planKey} title`);
      if (target.expectedCurrentIssueUuid !== null) assertUuidV4(target.expectedCurrentIssueUuid, `Managed ${expectedKind} ${target.planKey} current issue UUID`);
      if (target.expectedCurrentDescriptionSha256 !== null) assertDigest(target.expectedCurrentDescriptionSha256, `Managed ${expectedKind} ${target.planKey} current description digest`);
      if (target.expectedCurrentNativeSha256 !== null) assertDigest(target.expectedCurrentNativeSha256, `Managed ${expectedKind} ${target.planKey} current native digest`);
      if ((target.expectedCurrentIssueUuid === null) !== (target.expectedCurrentDescriptionSha256 === null) || (target.expectedCurrentIssueUuid === null) !== (target.expectedCurrentNativeSha256 === null)) throw new Error(`Managed ${expectedKind} ${target.planKey} current identity pin is incomplete`);
      assertNullableString(target.expectedIdentifier, `Managed ${expectedKind} ${target.planKey} identifier`);
      assertStringArray(target.blockKeys, `Managed ${expectedKind} ${target.planKey} blocks`);
      if (target.origin === "source" && target.blockKeys.length === 0) throw new Error(`Managed ${expectedKind} ${target.planKey} has no source blocks`);
      if (target.origin === "live" && (target.blockKeys.length !== 0 || target.expectedCurrentIssueUuid === null || target.expectedIdentifier === null || target.expectedCurrentDescriptionSha256 === null || target.expectedCurrentNativeSha256 === null)) throw new Error(`Live-origin ${expectedKind} ${target.planKey} must bind one captured issue and no source blocks`);
      assertUnique(target.blockKeys, `Managed ${expectedKind} ${target.planKey} blocks`);
      if (typeof target.description !== "string" || target.description.length === 0) throw new Error(`Managed ${expectedKind} ${target.planKey} description is empty`);
      if (MANUAL_NATIVE_REFERENCE.test(target.description) || MANUAL_RELATION_METADATA.test(target.description)) throw new Error(`Managed ${expectedKind} ${target.planKey} violates native reference prose hygiene`);
      assertManagedSourceBinding(target, blocksByKey);
      assertDigest(target.descriptionSha256, `Managed ${expectedKind} ${target.planKey} description digest`);
      if (sha256(target.description) !== target.descriptionSha256) throw new Error(`Managed ${expectedKind} ${target.planKey} description digest mismatch`);
      assertDigest(target.payloadSha256, `Managed ${expectedKind} ${target.planKey} payload digest`);
      assertPlanKey(target.teamPlanKey, "team", `Managed ${expectedKind} ${target.planKey} team`);
      assertPlanKey(target.projectPlanKey, "project", `Managed ${expectedKind} ${target.planKey} project`);
      assertPlanKey(target.statePlanKey, "state", `Managed ${expectedKind} ${target.planKey} state`);
      assertStringArray(target.labelPlanKeys, `Managed ${expectedKind} ${target.planKey} labels`);
      if (target.labelPlanKeys.length === 0) throw new Error(`Managed ${expectedKind} ${target.planKey} has no native label selector`);
      assertUnique(target.labelPlanKeys, `Managed ${expectedKind} ${target.planKey} labels`);
      if (typeof target.priority !== "number" || !Number.isInteger(target.priority) || target.priority < 0 || target.priority > 4) throw new Error(`Managed ${expectedKind} ${target.planKey} priority is invalid`);
      if (target.estimate !== null && (typeof target.estimate !== "number" || !Number.isFinite(target.estimate) || target.estimate < 0)) throw new Error(`Managed ${expectedKind} ${target.planKey} estimate is invalid`);
      if (target.dueDate !== null && (typeof target.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(target.dueDate) || Number.isNaN(Date.parse(`${target.dueDate}T00:00:00.000Z`)))) throw new Error(`Managed ${expectedKind} ${target.planKey} due date is invalid`);
      if (target.cyclePlanKey !== null) assertPlanKey(target.cyclePlanKey, "cycle", `Managed ${expectedKind} ${target.planKey} cycle`);
      if (target.milestonePlanKey !== null) assertPlanKey(target.milestonePlanKey, "milestone", `Managed ${expectedKind} ${target.planKey} milestone`);
      assertStringArray(target.releasePlanKeys, `Managed ${expectedKind} ${target.planKey} releases`);
      assertUnique(target.releasePlanKeys, `Managed ${expectedKind} ${target.planKey} releases`);
      for (const key of target.releasePlanKeys) assertPlanKey(key, "release", `Managed ${expectedKind} ${target.planKey} release`);
      if (target.parentPlanKey !== null) assertPlanKey(target.parentPlanKey, null, `Managed ${expectedKind} ${target.planKey} parent`);
      if (target.assigneePlanKey !== null) assertPlanKey(target.assigneePlanKey, "user", `Managed ${expectedKind} ${target.planKey} assignee`);
      if (!catalog.teams.has(target.teamPlanKey) || !catalog.projects.has(target.projectPlanKey) || !catalog.states.has(target.statePlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown native selector`);
      if (!catalog.projects.get(target.projectPlanKey)!.teamPlanKeys.includes(target.teamPlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} project is outside its team selector`);
      if (catalog.states.get(target.statePlanKey)!.teamPlanKey !== target.teamPlanKey) throw new Error(`Managed ${expectedKind} ${target.planKey} state is outside its team selector`);
      const selectedLabels = target.labelPlanKeys.map((key) => catalog.labels.get(key));
      if (selectedLabels.some((row) => !row)) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown label selector`);
      const semanticLabels = selectedLabels.filter((row) => row!.semanticRole !== "other");
      if (semanticLabels.length !== 1 || semanticLabels[0]!.semanticRole !== expectedKind) throw new Error(`Managed ${expectedKind} ${target.planKey} must select exactly one matching native type label`);
      if (selectedLabels.some((row) => row!.teamPlanKey !== null && row!.teamPlanKey !== target.teamPlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} label is outside its team selector`);
      if (target.assigneePlanKey !== null && !catalog.users.has(target.assigneePlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown assignee selector`);
      if (target.cyclePlanKey !== null && (!catalog.cycles.has(target.cyclePlanKey) || catalog.cycles.get(target.cyclePlanKey)!.teamPlanKey !== target.teamPlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown or cross-team cycle selector`);
      if (target.milestonePlanKey !== null && (!catalog.milestones.has(target.milestonePlanKey) || catalog.milestones.get(target.milestonePlanKey)!.projectPlanKey !== target.projectPlanKey)) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown or cross-project milestone selector`);
      if (target.releasePlanKeys.some((key) => !catalog.releases.has(key))) throw new Error(`Managed ${expectedKind} ${target.planKey} has an unknown release selector`);
      if (expectedKind === "risk" && (!/^## Trigger\s*$/m.test(target.description) || !/^## Response\s*$/m.test(target.description))) throw new Error(`Risk ${target.planKey} description must define Trigger and Response`);
      if (computedManagedPayload(target) !== target.payloadSha256) throw new Error(`Managed ${expectedKind} ${target.planKey} payload digest mismatch`);
      addTarget(targets, { planKey: target.planKey, kind: allocationKind, title: target.title, expectedIdentifier: target.expectedIdentifier, managed: target });
    }
  }
  for (const target of [...manifest.requirements, ...manifest.decisions, ...manifest.risks]) {
    if (target.parentPlanKey !== null) {
      const parent = targets.get(target.parentPlanKey);
      if (!parent || !parent.managed || parent.planKey === target.planKey) throw new Error(`Managed target ${target.planKey} has an invalid parent selector`);
    }
  }
  const managed = [...manifest.requirements, ...manifest.decisions, ...manifest.risks];
  const titleKeys = managed.map((target) => target.title.normalize("NFC").toLocaleLowerCase("en-US"));
  if (new Set(titleKeys).size !== titleKeys.length) throw new Error("Managed authority targets contain a duplicate title");
  const parentByPlanKey = new Map(managed.map((target) => [target.planKey, target.parentPlanKey]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (planKey: string): void => {
    if (visiting.has(planKey)) throw new Error("Managed authority parent graph contains a cycle");
    if (visited.has(planKey)) return;
    visiting.add(planKey);
    const parent = parentByPlanKey.get(planKey);
    if (parent !== null && parent !== undefined) visit(parent);
    visiting.delete(planKey);
    visited.add(planKey);
  };
  for (const target of managed) visit(target.planKey);
}

function validateDocuments(
  manifest: LinearAuthorityManifest,
  catalog: CatalogMaps,
  targets: Map<string, ExpectedTarget>,
): void {
  const roles = new Set(["binding_spec", "prd", "engineering_brief", "audit_program", "research_context", "narrative_context", "migration_index"]);
  for (const target of manifest.documents) {
    exactKeys(target, ["origin", "planKey", "role", "title", "blockKeys", "content", "contentSha256", "canonicalReadbackSha256", "attachmentKind", "attachmentPlanKey", "expectedCurrentDocumentId", "expectedCurrentContentSha256", "expectedCurrentTopologySha256"], "Document target");
    if (target.origin !== "source" && target.origin !== "live") throw new Error(`Document ${target.planKey} origin is invalid`);
    assertPlanKey(target.planKey, "document", "Document target plan key");
    if (!roles.has(target.role)) throw new Error(`Document ${target.planKey} role is invalid`);
    assertString(target.title, `Document ${target.planKey} title`);
    assertStringArray(target.blockKeys, `Document ${target.planKey} blocks`);
    if (target.origin === "live" && (target.expectedCurrentDocumentId === null || target.blockKeys.length !== 0)) throw new Error(`Live-origin document ${target.planKey} must bind one captured document and cannot claim canonical source blocks`);
    assertUnique(target.blockKeys, `Document ${target.planKey} blocks`);
    if (typeof target.content !== "string" || target.content.length === 0) throw new Error(`Document ${target.planKey} content is empty`);
    assertDigest(target.contentSha256, `Document ${target.planKey} content digest`);
    assertDigest(target.canonicalReadbackSha256, `Document ${target.planKey} canonical readback digest`);
    if (sha256(target.content) !== target.contentSha256) throw new Error(`Document ${target.planKey} content digest mismatch`);
    if (sha256(normalizeAuthorityMarkdown(target.content)) !== target.canonicalReadbackSha256) throw new Error(`Document ${target.planKey} canonical readback digest mismatch`);
    if (!["project", "initiative", "team", "issue", "release", "cycle"].includes(target.attachmentKind)) throw new Error(`Document ${target.planKey} attachment kind is invalid`);
    assertPlanKey(target.attachmentPlanKey, target.attachmentKind === "issue" ? null : target.attachmentKind, `Document ${target.planKey} attachment`);
    if (target.expectedCurrentDocumentId !== null) assertUuidV4(target.expectedCurrentDocumentId, `Document ${target.planKey} current UUID`);
    if (target.expectedCurrentContentSha256 !== null) assertDigest(target.expectedCurrentContentSha256, `Document ${target.planKey} current content digest`);
    if (target.expectedCurrentTopologySha256 !== null) assertDigest(target.expectedCurrentTopologySha256, `Document ${target.planKey} current topology digest`);
    if ((target.expectedCurrentDocumentId === null) !== (target.expectedCurrentContentSha256 === null) || (target.expectedCurrentDocumentId === null) !== (target.expectedCurrentTopologySha256 === null)) throw new Error(`Document ${target.planKey} current identity pin is incomplete`);
    if (target.attachmentKind === "project" && !catalog.projects.has(target.attachmentPlanKey)) throw new Error(`Document ${target.planKey} has an unknown project attachment`);
    if (target.attachmentKind === "initiative" && !catalog.initiatives.has(target.attachmentPlanKey)) throw new Error(`Document ${target.planKey} has an unknown initiative attachment`);
    if (target.attachmentKind === "team" && !catalog.teams.has(target.attachmentPlanKey)) throw new Error(`Document ${target.planKey} has an unknown team attachment`);
    if (target.attachmentKind === "release" && !catalog.releases.has(target.attachmentPlanKey)) throw new Error(`Document ${target.planKey} has an unknown release attachment`);
    if (target.attachmentKind === "cycle" && !catalog.cycles.has(target.attachmentPlanKey)) throw new Error(`Document ${target.planKey} has an unknown cycle attachment`);
    addTarget(targets, { planKey: target.planKey, kind: "document", title: target.title, expectedIdentifier: null, document: target });
  }
}

function markdownSectionHeadings(content: string): string[] {
  return content.split(/\r?\n/).flatMap((line) => {
    const match = /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line);
    return match ? [match[1].trim()] : [];
  });
}

function assertDocumentSections(target: AuthorityDocumentTarget, requiredSections: readonly string[]): void {
  const headings = markdownSectionHeadings(target.content);
  assertUnique(headings, `Document ${target.planKey} level-two headings`);
  for (const section of requiredSections) if (!headings.includes(section)) throw new Error(`Document ${target.planKey} lacks required section ${section}`);
}

function validateDocumentAuthority(
  manifest: LinearAuthorityManifest,
  catalog: CatalogMaps,
  scopes: AuthorityScopes,
): void {
  const sourceDocuments = manifest.documents.filter((document) => document.origin === "source");
  const liveDocuments = manifest.documents.filter((document) => document.origin === "live");
  if (sourceDocuments.length !== 0) throw new Error("Canonical source files must remain compiler inputs and cannot be copied into Linear documents");
  const bindingSpecs = manifest.documents.filter((document) => document.role === "binding_spec");
  if (bindingSpecs.length !== 1 || bindingSpecs[0].origin !== "live") throw new Error("Authority structure must define exactly one adopted binding Planning Authority document");

  const liveIds = liveDocuments.map((document) => document.expectedCurrentDocumentId).filter((id): id is string => id !== null);
  if (JSON.stringify(sort(liveIds)) !== JSON.stringify(sort(scopes.governedDocumentIds))) throw new Error("Live document targets do not exactly cover the canonical 30-document program scope");
  const liveById = new Map(liveDocuments.map((document) => [document.expectedCurrentDocumentId!, document]));
  const planning = scopes.program.planningDocument;
  const planningTarget = liveById.get(planning.id);
  if (!planningTarget || planningTarget.role !== "binding_spec" || planningTarget.title !== planning.title || planningTarget.contentSha256 !== planning.contentFingerprint || planningTarget.expectedCurrentContentSha256 !== planning.contentFingerprint) throw new Error("Canonical planning document target differs from program scope");
  assertDocumentSections(planningTarget, planning.requiredSections);

  const projectPlanKeyById = new Map([...catalog.projects.values()].map((project) => [project.id, project.planKey]));
  for (const expected of scopes.program.canonicalProjectDocuments) {
    const target = liveById.get(expected.id);
    const role = expected.kind === "prd" ? "prd" : "engineering_brief";
    if (!target || target.role !== role || target.title !== expected.title || target.attachmentKind !== "project" || target.attachmentPlanKey !== projectPlanKeyById.get(expected.projectId) || target.contentSha256 !== expected.contentFingerprint || target.expectedCurrentContentSha256 !== expected.contentFingerprint) throw new Error(`Canonical project document ${expected.title} differs from program scope or native project attachment`);
    assertDocumentSections(target, expected.requiredSections);
  }
  const supplementaryRoles = new Map<string, AuthorityDocumentTarget["role"]>([
    ["R0 Defensible Evaluation PRD", "prd"],
    ["R0 Pilot Target Set", "research_context"],
    ["R0 Production Readiness Runbook", "engineering_brief"],
  ]);
  for (const expected of scopes.program.supplementaryDocuments) {
    const target = liveById.get(expected.id);
    if (!target || target.role !== supplementaryRoles.get(expected.title) || target.title !== expected.title || target.attachmentKind !== "project" || target.attachmentPlanKey !== projectPlanKeyById.get(expected.projectId) || target.contentSha256 !== expected.contentFingerprint || target.expectedCurrentContentSha256 !== expected.contentFingerprint) throw new Error(`Supplementary project document ${expected.title} differs from program scope or native project attachment`);
    assertDocumentSections(target, expected.requiredSections);
  }
  for (const requirement of manifest.requirements) {
    const project = catalog.projects.get(requirement.projectPlanKey);
    const canonicalDocuments = project === undefined
      ? []
      : scopes.program.canonicalProjectDocuments.filter((document) => document.projectId === project.id);
    if (canonicalDocuments.length !== 1) throw new Error(`Requirement ${requirement.planKey} project must have exactly one canonical project document`);
    const expected = canonicalDocuments[0];
    const expectedRole = expected.kind === "prd" ? "prd" : "engineering_brief";
    const target = liveById.get(expected.id);
    if (!target || target.role !== expectedRole || target.attachmentKind !== "project" || target.attachmentPlanKey !== requirement.projectPlanKey) throw new Error(`Requirement ${requirement.planKey} does not resolve through its project's canonical ${expectedRole}`);
  }
  if (manifest.documents.length !== scopes.governedDocumentIds.length) throw new Error("Authority document target inventory contains an ungoverned document");
}

function validateReferencesAndRelations(
  manifest: LinearAuthorityManifest,
  targets: Map<string, ExpectedTarget>,
): void {
  for (const target of manifest.references) {
    exactKeys(target, ["planKey", "title", "expectedIdentifier"], "Relation reference target");
    assertPlanKey(target.planKey, "relation-target", "Relation reference target plan key");
    assertString(target.title, `Relation reference ${target.planKey} title`);
    assertString(target.expectedIdentifier, `Relation reference ${target.planKey} identifier`);
    addTarget(targets, { planKey: target.planKey, kind: "relation_target", title: target.title, expectedIdentifier: target.expectedIdentifier });
  }
  const relationKeys = new Set<string>();
  const blockingEdges = new Map<string, string[]>();
  for (const relation of manifest.nativeRelations) {
    exactKeys(relation, ["planKey", "type", "sourcePlanKey", "targetPlanKey"], "Native relation target");
    if (!RELATION_TYPES.has(relation.type)) throw new Error(`Native relation ${relation.planKey} type is invalid`);
    assertPlanKey(relation.sourcePlanKey, null, `Native relation ${relation.planKey} source`);
    assertPlanKey(relation.targetPlanKey, null, `Native relation ${relation.planKey} target`);
    const source = targets.get(relation.sourcePlanKey);
    const target = targets.get(relation.targetPlanKey);
    if (!source) throw new Error(`Native relation ${relation.planKey} has an unknown relation source`);
    if (!target) throw new Error(`Native relation ${relation.planKey} has an unknown relation target`);
    if ((!source.managed && source.kind !== "relation_target") || (!target.managed && target.kind !== "relation_target")) throw new Error(`Native relation ${relation.planKey} relation endpoints must be issue-like`);
    if (relation.sourcePlanKey === relation.targetPlanKey) throw new Error(`Native relation ${relation.planKey} is self-referential`);
    const canonical = canonicalAuthorityRelationPlanKey(relation.type, relation.sourcePlanKey, relation.targetPlanKey);
    if (relation.planKey !== canonical) throw new Error(`Native relation ${relation.planKey} is not its canonical relation plan key`);
    if (relationKeys.has(canonical) || targets.has(canonical)) throw new Error(`Authority manifest has duplicate relation ${canonical}`);
    relationKeys.add(canonical);
    addTarget(targets, { planKey: canonical, kind: "relation", title: null, expectedIdentifier: null, relation });
    if (relation.type === "blocks") blockingEdges.set(relation.sourcePlanKey, [...(blockingEdges.get(relation.sourcePlanKey) ?? []), relation.targetPlanKey]);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (planKey: string): void => {
    if (visiting.has(planKey)) throw new Error("Native blocking relation graph contains a cycle");
    if (visited.has(planKey)) return;
    visiting.add(planKey);
    for (const target of blockingEdges.get(planKey) ?? []) visit(target);
    visiting.delete(planKey);
    visited.add(planKey);
  };
  for (const planKey of blockingEdges.keys()) visit(planKey);
}

function validateBlockOwnership(
  manifest: LinearAuthorityManifest,
  blocks: ReadonlyMap<string, AuthorityBlock>,
  targets: ReadonlyMap<string, ExpectedTarget>,
): void {
  const claims = new Map<string, string>();
  const owners = [...manifest.requirements, ...manifest.decisions, ...manifest.risks, ...manifest.documents];
  for (const owner of owners) {
    for (const blockKey of owner.blockKeys) {
      const block = blocks.get(blockKey);
      if (!block) throw new Error(`Authority target ${owner.planKey} claims unknown block ${blockKey}`);
      if (claims.has(blockKey)) throw new Error(`Authority block ${blockKey} is classified more than once`);
      claims.set(blockKey, owner.planKey);
      if (block.targetPlanKey !== null && block.targetPlanKey !== owner.planKey) throw new Error(`Authority block ${blockKey} target differs from its owner`);
      if (block.disposition !== null && block.disposition.decisionPlanKey !== owner.planKey) throw new Error(`Authority block ${blockKey} disposition differs from its Decision owner`);
    }
  }
  if (claims.size !== blocks.size) throw new Error("Authority block classification coverage is incomplete");
  for (const block of blocks.values()) {
    if (block.targetPlanKey !== null && !targets.has(block.targetPlanKey)) throw new Error(`Authority block ${block.key} has an unknown canonical target`);
    if (block.disposition !== null) {
      const decision = targets.get(block.disposition.decisionPlanKey);
      if (!decision || decision.kind !== "decision") throw new Error(`Authority block ${block.key} has an invalid disposition Decision`);
    }
  }
}

function validateCoverage(
  manifest: LinearAuthorityManifest,
  targets: ReadonlyMap<string, ExpectedTarget>,
): void {
  const coverage = manifest.coverage;
  if (coverage.complete !== true) throw new Error("Authority coverage is not complete");
  for (const field of ["inputNames", "sourcePaths", "blockKeys", "targetPlanKeys", "relationPlanKeys"] as const) assertStringArray(coverage[field], `Authority coverage ${field}`);
  assertExactArray(coverage.inputNames, manifest.inputs.map((row) => row.name), "Authority coverage input names");
  assertExactArray(coverage.sourcePaths, manifest.sources.map((row) => row.path), "Authority coverage source paths");
  assertExactArray(coverage.blockKeys, manifest.blocks.map((row) => row.key), "Authority coverage block keys");
  assertExactArray(coverage.targetPlanKeys, [...targets.keys()], "Authority coverage target plan keys");
  assertExactArray(coverage.relationPlanKeys, manifest.nativeRelations.map((row) => row.planKey), "Authority coverage relation plan keys");
  const families = exactKeys(coverage.targetFamilies, ["requirements", "decisions", "risks", "documents", "references", "relations"], "Authority target-family coverage") as unknown as LinearAuthorityManifest["coverage"]["targetFamilies"];
  const expected: LinearAuthorityManifest["coverage"]["targetFamilies"] = {
    requirements: manifest.requirements.map((row) => row.planKey),
    decisions: manifest.decisions.map((row) => row.planKey),
    risks: manifest.risks.map((row) => row.planKey),
    documents: manifest.documents.map((row) => row.planKey),
    references: manifest.references.map((row) => row.planKey),
    relations: manifest.nativeRelations.map((row) => row.planKey),
  };
  for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
    assertStringArray(families[key], `Authority target-family coverage ${key}`);
    assertExactArray(families[key], expected[key], `Authority target-family coverage ${key}`);
  }
}

interface EvidencePayload {
  keys: string[];
  rows: unknown[];
}

function targetEvidencePayload(manifest: LinearAuthorityManifest): EvidencePayload {
  const rows = [
    ...manifest.requirements.map((target) => ({ family: "requirements", target })),
    ...manifest.decisions.map((target) => ({ family: "decisions", target })),
    ...manifest.risks.map((target) => ({ family: "risks", target })),
    ...manifest.documents.map((target) => ({ family: "documents", target })),
    ...manifest.references.map((target) => ({ family: "references", target })),
  ].sort((left, right) => left.target.planKey.localeCompare(right.target.planKey));
  return { keys: rows.map((row) => row.target.planKey), rows };
}

function evidencePayloads(manifest: LinearAuthorityManifest): ReadonlyMap<string, EvidencePayload> {
  const dispositions = manifest.blocks.filter((block) => block.disposition !== null).sort((left, right) => left.key.localeCompare(right.key));
  const extractionRows = [
    ...manifest.sources.map((source) => ({ family: "sources", key: source.path, value: source })),
    ...manifest.blocks.map((block) => ({ family: "blocks", key: block.key, value: block })),
  ].sort((left, right) => left.key.localeCompare(right.key));
  return new Map([
    ["extraction-seed", { keys: extractionRows.map((row) => row.key), rows: extractionRows }],
    ["semantic-plan", targetEvidencePayload(manifest)],
    ["source-routing", { keys: manifest.blocks.map((row) => row.key).sort(), rows: [...manifest.blocks].sort((left, right) => left.key.localeCompare(right.key)) }],
    ["risk-routing", { keys: manifest.risks.map((row) => row.planKey).sort(), rows: byPlanKey(manifest.risks) }],
    ["source-contract", { keys: sort(manifest.sources.map((row) => row.path)), rows: [...manifest.sources].sort((left, right) => left.path.localeCompare(right.path)) }],
    ["disposition-contract", { keys: dispositions.map((row) => row.key), rows: dispositions }],
    ["dependency-contract", { keys: manifest.nativeRelations.map((row) => row.planKey).sort(), rows: byPlanKey(manifest.nativeRelations) }],
    ["decision-adjudication", { keys: manifest.decisions.map((row) => row.planKey).sort(), rows: byPlanKey(manifest.decisions) }],
  ]);
}

function evidenceRoot(payload: EvidencePayload): string {
  return sha256(canonicalJson(payload.rows));
}

function validateCompilerEvidence(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  allocationRaw: string,
  allocationSha256: string,
): void {
  const payloads = evidencePayloads(manifest);
  for (const [name, payload] of payloads) {
    const value = parseJson<unknown>(compilerInputs.get(name)!.toString("utf8"), `${name} compiler evidence`);
    const receipt = exactKeys(value, ["schemaVersion", "kind", "evidenceKind", "workspaceId", "sourceCommit", "sourceSetRoot", "planRoot", "complete", "payloadKeys", "payloadRoot"], `${name} compiler evidence`);
    if (receipt.schemaVersion !== 1 || receipt.kind !== "compiler-evidence" || receipt.evidenceKind !== name || receipt.workspaceId !== manifest.workspace.id || receipt.sourceCommit !== manifest.sourceCommit || receipt.sourceSetRoot !== manifest.sourceSetRoot || receipt.planRoot !== manifest.planRoot || receipt.complete !== true) throw new Error(`${name} compiler evidence identity or root binding is invalid`);
    assertStringArray(receipt.payloadKeys, `${name} compiler evidence payload keys`);
    assertExactArray(receipt.payloadKeys, payload.keys, `${name} compiler evidence payload keys`);
    if (receipt.payloadRoot !== evidenceRoot(payload)) throw new Error(`${name} compiler evidence payload root differs from the authority plan`);
  }
  const targetPayload = targetEvidencePayload(manifest);
  const relationRows = byPlanKey(manifest.nativeRelations).map((relation) => ({ family: "relations", target: relation }));
  const allocationValue = parseJson<unknown>(allocationRaw, "Authority allocation evidence source");
  const allocationRecord = record(allocationValue, "Authority allocation evidence source");
  if (!Array.isArray(allocationRecord.allocations)) throw new Error("Authority allocation evidence source has no allocations");
  const allocationRowsRoot = sha256(canonicalJson([...allocationRecord.allocations].sort((left, right) => String((left as JsonRecord).planKey).localeCompare(String((right as JsonRecord).planKey)))));
  const lockValue = parseJson<unknown>(compilerInputs.get("allocation-lock")!.toString("utf8"), "allocation-lock compiler evidence");
  const lock = exactKeys(lockValue, ["schemaVersion", "kind", "workspaceId", "sourceCommit", "sourceSetRoot", "liveCaptureRoot", "planRoot", "allocationSha256", "allocationRowsRoot", "complete", "targetPlanKeys", "targetPayloadRoot"], "allocation-lock compiler evidence");
  if (lock.schemaVersion !== 1 || lock.kind !== "allocation-lock" || lock.workspaceId !== manifest.workspace.id || lock.sourceCommit !== manifest.sourceCommit || lock.sourceSetRoot !== manifest.sourceSetRoot || lock.liveCaptureRoot !== manifest.liveCaptureRoot || lock.planRoot !== manifest.planRoot || lock.allocationSha256 !== allocationSha256 || lock.allocationRowsRoot !== allocationRowsRoot || lock.complete !== true) throw new Error("allocation-lock compiler evidence identity, allocation, or root binding is invalid");
  assertStringArray(lock.targetPlanKeys, "allocation-lock target plan keys");
  assertExactArray(lock.targetPlanKeys, [...targetPayload.keys, ...manifest.nativeRelations.map((row) => row.planKey)], "allocation-lock target plan keys");
  if (lock.targetPayloadRoot !== sha256(canonicalJson([...targetPayload.rows, ...relationRows])) ) throw new Error("allocation-lock target payload root differs from the authority plan");

  const mappingValue = parseJson<unknown>(compilerInputs.get("uuid-mapping")!.toString("utf8"), "UUID mapping receipt");
  const mapping = exactKeys(mappingValue, ["schemaVersion", "kind", "workspaceId", "sourceCommit", "sourceSetRoot", "liveCaptureRoot", "planRoot", "allocationSha256", "allocationRowsRoot", "complete", "targetPlanKeys"], "UUID mapping receipt");
  if (mapping.schemaVersion !== 1 || mapping.kind !== "uuid-mapping" || mapping.workspaceId !== manifest.workspace.id || mapping.sourceCommit !== manifest.sourceCommit || mapping.sourceSetRoot !== manifest.sourceSetRoot || mapping.liveCaptureRoot !== manifest.liveCaptureRoot || mapping.planRoot !== manifest.planRoot || mapping.allocationSha256 !== allocationSha256 || mapping.allocationRowsRoot !== allocationRowsRoot || mapping.complete !== true) throw new Error("UUID mapping receipt differs from the exact authority allocation");
  assertStringArray(mapping.targetPlanKeys, "UUID mapping target plan keys");
  assertExactArray(mapping.targetPlanKeys, [...targetPayload.keys, ...manifest.nativeRelations.map((row) => row.planKey)], "UUID mapping target plan keys");
}

function canonicalUtc(value: unknown, label: string): string {
  if (typeof value !== "string" || !CANONICAL_UTC.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error(`${label} must be a canonical UTC timestamp`);
  return value;
}

function validateDocumentCanaryMeasurement(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  native: NativeIndexes,
  captureArtifacts: CaptureArtifacts,
): void {
  const canaryValue = parseJson<unknown>(compilerInputs.get("document-canary-receipt")!.toString("utf8"), "Document canary receipt");
  const canary = exactKeys(canaryValue, ["schemaVersion", "kind", "workspaceId", "sourceCommit", "liveCaptureRoot", "planRoot", "canaryDocumentId", "canaryContentSha256", "canaryTopologySha256", "measuredAt", "readbackUtf8Bytes", "readbackUtf16CodeUnits", "maxUtf8Bytes", "maxUtf16CodeUnits"], "Document canary receipt");
  if (canary.schemaVersion !== 1 || canary.kind !== "document-canary-measurement" || canary.workspaceId !== manifest.workspace.id || canary.sourceCommit !== manifest.sourceCommit || canary.liveCaptureRoot !== manifest.liveCaptureRoot || canary.planRoot !== manifest.planRoot) throw new Error("Document canary measurement differs from the authority structure");
  assertUuidV4(canary.canaryDocumentId, "Document canary receipt document UUID");
  canonicalUtc(canary.measuredAt, "Document canary measurement timestamp");
  if (!Number.isInteger(canary.maxUtf8Bytes) || (canary.maxUtf8Bytes as number) < 1 || !Number.isInteger(canary.maxUtf16CodeUnits) || (canary.maxUtf16CodeUnits as number) < 1) throw new Error("Document canary measured UTF-8 and UTF-16 limits are invalid");
  const canaryNative = native.documentsById.get(canary.canaryDocumentId);
  const canaryRaw = captureArtifacts.rawDocuments.documents.find((document) => document.id === canary.canaryDocumentId);
  if (!canaryNative || !canaryRaw || canaryRaw.content === null || canaryNative.archivedAt !== null || canary.canaryContentSha256 !== canaryNative.contentSha256 || canary.canaryTopologySha256 !== capturedDocumentTopologySha(canaryNative)) throw new Error("Document canary receipt does not bind an active captured document and exact readback");
  const canaryUtf8Bytes = Buffer.byteLength(canaryRaw.content, "utf8");
  const canaryUtf16CodeUnits = canaryRaw.content.length;
  if (canary.readbackUtf8Bytes !== canaryUtf8Bytes || canary.readbackUtf16CodeUnits !== canaryUtf16CodeUnits || canary.maxUtf8Bytes !== canaryUtf8Bytes || canary.maxUtf16CodeUnits !== canaryUtf16CodeUnits) throw new Error("Document canary receipt measured UTF-8 or UTF-16 readback differs from the captured canary body");
  for (const document of manifest.documents) {
    if (Buffer.byteLength(document.content, "utf8") > (canary.maxUtf8Bytes as number) || document.content.length > (canary.maxUtf16CodeUnits as number)) throw new Error(`Document ${document.planKey} exceeds the measured canary UTF-8 or UTF-16 limit`);
  }
}

interface NativeIndexes {
  capture: LinearNativeIdentityCapture;
  reservedUuids: Set<string>;
  issuesByUuid: Map<string, LinearNativeIdentityCapture["issues"][number]>;
  issuesByIdentifier: Map<string, LinearNativeIdentityCapture["issues"][number]>;
  labelsById: Map<string, LinearNativeIdentityCapture["labels"][number]>;
  relationsById: Map<string, LinearNativeIdentityCapture["relations"][number]>;
  relationsByKey: Map<string, LinearNativeIdentityCapture["relations"][number]>;
  teamsById: Map<string, LinearNativeIdentityCapture["teams"][number]>;
  statesById: Map<string, LinearNativeIdentityCapture["workflowStates"][number]>;
  usersById: Map<string, LinearNativeIdentityCapture["users"][number]>;
  initiativesById: Map<string, LinearNativeIdentityCapture["initiatives"][number]>;
  projectsById: Map<string, LinearNativeIdentityCapture["projects"][number]>;
  releasePipelinesById: Map<string, LinearNativeIdentityCapture["releasePipelines"][number]>;
  releasesById: Map<string, LinearNativeIdentityCapture["releases"][number]>;
  milestonesById: Map<string, LinearNativeIdentityCapture["projectMilestones"][number]>;
  cyclesById: Map<string, LinearNativeIdentityCapture["cycles"][number]>;
  documentsById: Map<string, LinearNativeIdentityCapture["documents"][number]>;
}

function validateConnectionCoverage(value: unknown, expectedRows: number, label: string): void {
  const row = exactKeys(value, ["terminal", "pages", "rows", "finalCursor", "attempts"], `${label} coverage`);
  if (row.terminal !== true || !Number.isInteger(row.pages) || (row.pages as number) < 1 || row.rows !== expectedRows || !Number.isInteger(row.attempts) || (row.attempts as number) < (row.pages as number) || (row.finalCursor !== null && typeof row.finalCursor !== "string")) {
    throw new Error(`Native capture ${label} coverage is incomplete`);
  }
}

function buildUniqueMap<T>(
  rows: T[],
  id: (row: T) => string,
  label: string,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) {
    const key = id(row);
    if (map.has(key)) throw new Error(`Native capture duplicates ${label} ${key}`);
    map.set(key, row);
  }
  return map;
}

function validateNativeCapture(value: unknown): NativeIndexes {
  const captureObject = exactKeys(value, ["schemaVersion", "workspace", "rawDocumentIds", "issues", "labels", "relations", "teams", "workflowStates", "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones", "cycles", "documents", "coverage"], "Native identity capture");
  if (captureObject.schemaVersion !== 1) throw new Error("Native identity capture schemaVersion must be 1");
  const workspace = exactKeys(captureObject.workspace, ["id", "name", "urlKey", "archivedAt"], "Native identity capture workspace");
  assertUuidV4(workspace.id, "Native identity capture workspace ID");
  assertString(workspace.name, "Native identity capture workspace name");
  assertString(workspace.urlKey, "Native identity capture workspace URL key");
  if (workspace.archivedAt !== null) throw new Error("Native identity capture workspace must be active");
  assertStringArray(captureObject.rawDocumentIds, "Native identity capture raw document IDs");
  assertUnique(captureObject.rawDocumentIds, "Native identity capture raw document IDs");
  for (const id of captureObject.rawDocumentIds) assertUuidV4(id, "Native identity capture raw document UUID");
  for (const field of ["issues", "labels", "relations", "teams", "workflowStates", "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones", "cycles", "documents"] as const) {
    if (!Array.isArray(captureObject[field])) throw new Error(`Native identity capture ${field} must be an array`);
  }
  const capture = captureObject as unknown as LinearNativeIdentityCapture;
  const reservedUuids = new Set<string>();
  const reserve = (uuid: unknown, label: string): string => {
    assertUuidV4(uuid, label);
    const normalized = uuid.toLowerCase();
    if (reservedUuids.has(normalized)) throw new Error(`Native capture UUID ${uuid} is duplicated across catalogs`);
    reservedUuids.add(normalized);
    return uuid;
  };
  reserve(capture.workspace.id, "Native workspace UUID");
  for (const row of capture.issues) {
    exactKeys(row, ["issueUuid", "identifier", "title", "archivedAt", "descriptionSha256", "teamId", "stateId", "projectId", "estimate", "priority", "dueDate", "cycleId", "milestoneId", "releaseIds", "parentIssueUuid", "assigneeId", "labelIds", "relationIds"], "Native issue");
    reserve(row.issueUuid, "Native issue UUID");
    assertString(row.identifier, `Native issue ${row.issueUuid} identifier`);
    assertString(row.title, `Native issue ${row.issueUuid} title`);
    assertDigest(row.descriptionSha256, `Native issue ${row.issueUuid} description digest`);
    assertUuidV4(row.teamId, `Native issue ${row.issueUuid} team UUID`);
    assertUuidV4(row.stateId, `Native issue ${row.issueUuid} state UUID`);
    if (row.projectId !== null) assertUuidV4(row.projectId, `Native issue ${row.issueUuid} project UUID`);
    if (row.estimate !== null && (typeof row.estimate !== "number" || !Number.isFinite(row.estimate) || row.estimate < 0)) throw new Error(`Native issue ${row.issueUuid} estimate is invalid`);
    if (!Number.isInteger(row.priority) || row.priority < 0 || row.priority > 4) throw new Error(`Native issue ${row.issueUuid} priority is invalid`);
    if (row.dueDate !== null && (typeof row.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.dueDate))) throw new Error(`Native issue ${row.issueUuid} due date is invalid`);
    if (row.cycleId !== null) assertUuidV4(row.cycleId, `Native issue ${row.issueUuid} cycle UUID`);
    if (row.milestoneId !== null) assertUuidV4(row.milestoneId, `Native issue ${row.issueUuid} milestone UUID`);
    assertStringArray(row.releaseIds, `Native issue ${row.issueUuid} release UUIDs`);
    assertUnique(row.releaseIds, `Native issue ${row.issueUuid} release UUIDs`);
    for (const id of row.releaseIds) assertUuidV4(id, `Native issue ${row.issueUuid} release UUID`);
    if (row.parentIssueUuid !== null) assertUuidV4(row.parentIssueUuid, `Native issue ${row.issueUuid} parent UUID`);
    if (row.assigneeId !== null) assertUuidV4(row.assigneeId, `Native issue ${row.issueUuid} assignee UUID`);
    assertStringArray(row.labelIds, `Native issue ${row.issueUuid} label UUIDs`);
    assertStringArray(row.relationIds, `Native issue ${row.issueUuid} relation UUIDs`);
    assertUnique(row.labelIds, `Native issue ${row.issueUuid} label UUIDs`);
    assertUnique(row.relationIds, `Native issue ${row.issueUuid} relation UUIDs`);
  }
  for (const row of capture.labels) {
    exactKeys(row, ["id", "name", "color", "archivedAt", "inheritedFromId", "isGroup", "parentId", "parentName", "teamId", "teamKey"], "Native label");
    reserve(row.id, "Native label UUID");
    assertString(row.name, `Native label ${row.id} name`);
  }
  for (const row of capture.relations) {
    exactKeys(row, ["relationId", "canonicalKey", "type", "archivedAt", "issueId", "issueIdentifier", "relatedIssueId", "relatedIssueIdentifier"], "Native relation");
    reserve(row.relationId, "Native relation UUID");
    assertString(row.canonicalKey, `Native relation ${row.relationId} canonical key`);
    assertString(row.type, `Native relation ${row.relationId} type`);
  }
  for (const row of capture.teams) {
    exactKeys(row, ["id", "key", "name", "archivedAt"], "Native team");
    reserve(row.id, "Native team UUID");
    assertString(row.key, `Native team ${row.id} key`);
    assertString(row.name, `Native team ${row.id} name`);
  }
  for (const row of capture.workflowStates) {
    exactKeys(row, ["id", "name", "type", "color", "position", "archivedAt", "teamId", "teamKey"], "Native workflow state");
    reserve(row.id, "Native workflow state UUID");
    assertString(row.name, `Native workflow state ${row.id} name`);
    assertString(row.type, `Native workflow state ${row.id} type`);
  }
  for (const row of capture.users) {
    exactKeys(row, ["id", "name", "displayName", "active", "app", "guest", "archivedAt"], "Native user");
    reserve(row.id, "Native user UUID");
    assertString(row.name, `Native user ${row.id} name`);
  }
  for (const row of capture.initiatives) {
    exactKeys(row, ["id", "name", "contentSha256", "descriptionSha256", "updatedAt", "archivedAt", "ownerId", "status", "priority", "health", "healthUpdatedAt", "startedAt", "targetDate", "targetDateResolution", "parentInitiativeId"], "Native initiative");
    reserve(row.id, "Native initiative UUID");
    assertString(row.name, `Native initiative ${row.id} name`);
    assertDigest(row.contentSha256, `Native initiative ${row.id} content digest`);
    assertDigest(row.descriptionSha256, `Native initiative ${row.id} description digest`);
    canonicalUtc(row.updatedAt, `Native initiative ${row.id} updatedAt`);
  }
  for (const row of capture.projects) {
    exactKeys(row, ["id", "name", "contentSha256", "updatedAt", "archivedAt", "statusId", "status", "statusType", "priority", "leadId", "startDate", "startDateResolution", "targetDate", "targetDateResolution", "teamIds", "initiativeIds"], "Native project");
    reserve(row.id, "Native project UUID");
    assertString(row.name, `Native project ${row.id} name`);
    assertDigest(row.contentSha256, `Native project ${row.id} content digest`);
    canonicalUtc(row.updatedAt, `Native project ${row.id} updatedAt`);
    assertStringArray(row.teamIds, `Native project ${row.id} team UUIDs`);
    assertStringArray(row.initiativeIds, `Native project ${row.id} initiative UUIDs`);
  }
  for (const row of capture.releasePipelines) {
    exactKeys(row, ["id", "name", "updatedAt", "archivedAt", "type", "isProduction", "teamIds", "stages"], "Native release pipeline");
    reserve(row.id, "Native release pipeline UUID");
    assertString(row.name, `Native release pipeline ${row.id} name`);
    canonicalUtc(row.updatedAt, `Native release pipeline ${row.id} updatedAt`);
    assertStringArray(row.teamIds, `Native release pipeline ${row.id} team UUIDs`);
    if (!Array.isArray(row.stages)) throw new Error(`Native release pipeline ${row.id} stages must be an array`);
    for (const stage of row.stages) {
      exactKeys(stage, ["id", "name", "type", "archivedAt", "position", "frozen"], `Native release pipeline ${row.id} stage`);
      reserve(stage.id, "Native release stage UUID");
      assertString(stage.name, `Native release stage ${stage.id} name`);
    }
  }
  for (const row of capture.releases) {
    exactKeys(row, ["id", "name", "descriptionSha256", "version", "commitSha", "startDate", "startedAt", "targetDate", "completedAt", "updatedAt", "archivedAt", "pipelineId", "stageId", "stageName", "stageType"], "Native release");
    reserve(row.id, "Native release UUID");
    assertString(row.name, `Native release ${row.id} name`);
    assertDigest(row.descriptionSha256, `Native release ${row.id} description digest`);
    canonicalUtc(row.updatedAt, `Native release ${row.id} updatedAt`);
  }
  for (const row of capture.projectMilestones) {
    exactKeys(row, ["id", "name", "descriptionSha256", "projectId", "updatedAt", "archivedAt", "targetDate", "status"], "Native project milestone");
    reserve(row.id, "Native project milestone UUID");
    assertString(row.name, `Native project milestone ${row.id} name`);
    assertDigest(row.descriptionSha256, `Native project milestone ${row.id} description digest`);
    canonicalUtc(row.updatedAt, `Native project milestone ${row.id} updatedAt`);
  }
  for (const row of capture.cycles) {
    exactKeys(row, ["id", "number", "name", "descriptionSha256", "updatedAt", "archivedAt", "startsAt", "endsAt", "completedAt", "teamId", "teamKey", "inheritedFromId"], "Native cycle");
    reserve(row.id, "Native cycle UUID");
    assertDigest(row.descriptionSha256, `Native cycle ${row.id} description digest`);
    canonicalUtc(row.updatedAt, `Native cycle ${row.id} updatedAt`);
  }
  for (const row of capture.documents) {
    exactKeys(row, ["id", "title", "contentSha256", "updatedAt", "archivedAt", "initiativeId", "projectId", "teamId", "issueId", "releaseId", "cycleId"], "Native document");
    reserve(row.id, "Native document UUID");
    if (typeof row.title !== "string") throw new Error(`Native document ${row.id} title must be a string`);
    assertDigest(row.contentSha256, `Native document ${row.id} content digest`);
  }
  const issuesByUuid = buildUniqueMap(capture.issues, (row) => row.issueUuid, "issue UUID");
  const issuesByIdentifier = buildUniqueMap(capture.issues, (row) => row.identifier, "issue identifier");
  const labelsById = buildUniqueMap(capture.labels, (row) => row.id, "label UUID");
  const relationsById = buildUniqueMap(capture.relations, (row) => row.relationId, "relation UUID");
  const relationsByKey = buildUniqueMap(capture.relations, (row) => row.canonicalKey, "relation canonical key");
  const teamsById = buildUniqueMap(capture.teams, (row) => row.id, "team UUID");
  const statesById = buildUniqueMap(capture.workflowStates, (row) => row.id, "workflow state UUID");
  const usersById = buildUniqueMap(capture.users, (row) => row.id, "user UUID");
  const initiativesById = buildUniqueMap(capture.initiatives, (row) => row.id, "initiative UUID");
  const projectsById = buildUniqueMap(capture.projects, (row) => row.id, "project UUID");
  const releasePipelinesById = buildUniqueMap(capture.releasePipelines, (row) => row.id, "release pipeline UUID");
  const releasesById = buildUniqueMap(capture.releases, (row) => row.id, "release UUID");
  const milestonesById = buildUniqueMap(capture.projectMilestones, (row) => row.id, "project milestone UUID");
  const cyclesById = buildUniqueMap(capture.cycles, (row) => row.id, "cycle UUID");
  const documentsById = buildUniqueMap(capture.documents, (row) => row.id, "document UUID");
  for (const issue of capture.issues) {
    if (!teamsById.has(issue.teamId) || !statesById.has(issue.stateId) || (issue.projectId !== null && !projectsById.has(issue.projectId)) || (issue.cycleId !== null && !cyclesById.has(issue.cycleId)) || (issue.milestoneId !== null && !milestonesById.has(issue.milestoneId)) || issue.releaseIds.some((id) => !releasesById.has(id)) || (issue.parentIssueUuid !== null && !issuesByUuid.has(issue.parentIssueUuid)) || (issue.assigneeId !== null && !usersById.has(issue.assigneeId))) throw new Error(`Native issue ${issue.identifier} has an unresolved native selector`);
    for (const id of issue.labelIds) if (!labelsById.has(id)) throw new Error(`Native issue ${issue.identifier} references unknown label ${id}`);
    for (const id of issue.relationIds) if (!relationsById.has(id)) throw new Error(`Native issue ${issue.identifier} references unknown relation ${id}`);
  }
  for (const relation of capture.relations) {
    const left = issuesByUuid.get(relation.issueId);
    const right = issuesByUuid.get(relation.relatedIssueId);
    if (!left || !right || left.identifier !== relation.issueIdentifier || right.identifier !== relation.relatedIssueIdentifier) throw new Error(`Native relation ${relation.relationId} endpoints are unresolved`);
    if (!left.relationIds.includes(relation.relationId) || !right.relationIds.includes(relation.relationId)) throw new Error(`Native relation ${relation.relationId} is not represented by both endpoint issue captures`);
    if (canonicalLiveRelationKey(relation.type, relation.issueIdentifier, relation.relatedIssueIdentifier) !== relation.canonicalKey) throw new Error(`Native relation ${relation.relationId} canonical key differs from its endpoints`);
  }
  for (const issue of capture.issues) {
    for (const relationId of issue.relationIds) {
      const relation = relationsById.get(relationId)!;
      if (relation.issueId !== issue.issueUuid && relation.relatedIssueId !== issue.issueUuid) throw new Error(`Native issue ${issue.identifier} contains relation ${relationId} for another endpoint`);
    }
  }
  for (const project of capture.projects) {
    if ((project.leadId !== null && !usersById.has(project.leadId)) || project.teamIds.some((id) => !teamsById.has(id)) || project.initiativeIds.some((id) => !initiativesById.has(id))) throw new Error(`Native project ${project.id} topology is unresolved`);
  }
  for (const initiative of capture.initiatives) if ((initiative.ownerId !== null && !usersById.has(initiative.ownerId)) || (initiative.parentInitiativeId !== null && !initiativesById.has(initiative.parentInitiativeId))) throw new Error(`Native initiative ${initiative.id} topology is unresolved`);
  for (const pipeline of capture.releasePipelines) if (pipeline.teamIds.some((id) => !teamsById.has(id))) throw new Error(`Native release pipeline ${pipeline.id} topology is unresolved`);
  for (const release of capture.releases) {
    const pipeline = releasePipelinesById.get(release.pipelineId);
    if (!pipeline || !pipeline.stages.some((stage) => stage.id === release.stageId && stage.name === release.stageName && stage.type === release.stageType)) throw new Error(`Native release ${release.id} topology is unresolved`);
  }
  for (const milestone of capture.projectMilestones) if (!projectsById.has(milestone.projectId)) throw new Error(`Native project milestone ${milestone.id} topology is unresolved`);
  for (const cycle of capture.cycles) if (!teamsById.has(cycle.teamId) || teamsById.get(cycle.teamId)!.key !== cycle.teamKey || (cycle.inheritedFromId !== null && !cyclesById.has(cycle.inheritedFromId))) throw new Error(`Native cycle ${cycle.id} topology is unresolved`);
  for (const document of capture.documents) {
    const parents = [document.teamId, document.projectId, document.initiativeId, document.issueId, document.releaseId, document.cycleId].filter((id) => id !== null);
    if (parents.length !== 1 || (document.teamId !== null && !teamsById.has(document.teamId)) || (document.projectId !== null && !projectsById.has(document.projectId)) || (document.initiativeId !== null && !initiativesById.has(document.initiativeId)) || (document.issueId !== null && !issuesByUuid.has(document.issueId)) || (document.releaseId !== null && !releasesById.has(document.releaseId)) || (document.cycleId !== null && !cyclesById.has(document.cycleId))) throw new Error(`Native document ${document.id} topology is unresolved`);
  }
  validateNativeCoverage(capture);
  return { capture, reservedUuids, issuesByUuid, issuesByIdentifier, labelsById, relationsById, relationsByKey, teamsById, statesById, usersById, initiativesById, projectsById, releasePipelinesById, releasesById, milestonesById, cyclesById, documentsById };
}

function validateNativeCoverage(capture: LinearNativeIdentityCapture): void {
  const coverage = exactKeys(capture.coverage, ["complete", "totals", "topLevel", "perIssue", "perProject"], "Native capture coverage");
  if (coverage.complete !== true) throw new Error("Native capture coverage is incomplete");
  const totals = exactKeys(coverage.totals, ["issues", "labels", "labelAssignments", "relations", "teams", "workflowStates", "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones", "cycles", "documents"], "Native capture totals");
  const expectedTotals: Record<string, number> = {
    issues: capture.issues.length,
    labels: capture.labels.length,
    labelAssignments: capture.issues.reduce((total, row) => total + row.labelIds.length, 0),
    relations: capture.relations.length,
    teams: capture.teams.length,
    workflowStates: capture.workflowStates.length,
    users: capture.users.length,
    initiatives: capture.initiatives.length,
    projects: capture.projects.length,
    releasePipelines: capture.releasePipelines.length,
    releases: capture.releases.length,
    projectMilestones: capture.projectMilestones.length,
    cycles: capture.cycles.length,
    documents: capture.documents.length,
  };
  for (const [key, expected] of Object.entries(expectedTotals)) if (totals[key] !== expected) throw new Error(`Native capture coverage ${key} total mismatch`);
  const topLevel = exactKeys(coverage.topLevel, ["issues", "labels", "teams", "workflowStates", "users", "initiatives", "projects", "releasePipelines", "releases", "projectMilestones", "cycles", "documents"], "Native capture top-level coverage");
  for (const [key, expected] of Object.entries(expectedTotals)) {
    if (key === "labelAssignments" || key === "relations") continue;
    validateConnectionCoverage(topLevel[key], expected, key);
  }
  if (!Array.isArray(coverage.perIssue) || coverage.perIssue.length !== capture.issues.length) throw new Error("Native capture per-issue coverage is incomplete");
  const perIssue = new Map<string, JsonRecord>();
  for (const value of coverage.perIssue) {
    const row = exactKeys(value, ["issueUuid", "identifier", "labels", "relations", "inverseRelations"], "Native per-issue coverage");
    if (typeof row.issueUuid !== "string" || perIssue.has(row.issueUuid)) throw new Error("Native capture per-issue coverage duplicates an issue");
    perIssue.set(row.issueUuid, row);
  }
  for (const issue of capture.issues) {
    const row = perIssue.get(issue.issueUuid);
    if (!row || row.identifier !== issue.identifier) throw new Error(`Native capture per-issue coverage is missing ${issue.identifier}`);
    validateConnectionCoverage(row.labels, issue.labelIds.length, `${issue.identifier} labels`);
    const relations = record(row.relations, `${issue.identifier} relation coverage`);
    const inverse = record(row.inverseRelations, `${issue.identifier} inverse relation coverage`);
    const relationRows = Number(relations.rows) + Number(inverse.rows);
    if (relationRows !== issue.relationIds.length) throw new Error(`Native capture ${issue.identifier} relation coverage differs from captured IDs`);
    validateConnectionCoverage(row.relations, Number(relations.rows), `${issue.identifier} relations`);
    validateConnectionCoverage(row.inverseRelations, Number(inverse.rows), `${issue.identifier} inverse relations`);
  }
  if (!Array.isArray(coverage.perProject) || coverage.perProject.length !== capture.projects.length) throw new Error("Native capture per-project coverage is incomplete");
  const perProject = new Map<string, JsonRecord>();
  for (const value of coverage.perProject) {
    const row = exactKeys(value, ["projectId", "teams", "initiatives"], "Native per-project coverage");
    if (typeof row.projectId !== "string" || perProject.has(row.projectId)) throw new Error("Native capture per-project coverage duplicates a project");
    perProject.set(row.projectId, row);
  }
  for (const project of capture.projects) {
    const row = perProject.get(project.id);
    if (!row) throw new Error(`Native capture per-project coverage is missing ${project.id}`);
    validateConnectionCoverage(row.teams, project.teamIds.length, `${project.id} teams`);
    validateConnectionCoverage(row.initiatives, project.initiativeIds.length, `${project.id} initiatives`);
  }
}

interface CaptureArtifacts {
  fingerprint: LinearFingerprint;
  fingerprintIssuesByIdentifier: ReadonlyMap<string, LinearFingerprint["issues"][number]>;
  rawDocuments: LinearRawDocumentCapture;
  issueDescriptionsByIdentifier: ReadonlyMap<string, JsonRecord>;
}

function validateCaptureArtifacts(
  manifest: LinearAuthorityManifest,
  compilerInputs: ReadonlyMap<string, Buffer>,
  native: NativeIndexes,
): CaptureArtifacts {
  const fingerprintValue = parseJson<unknown>(compilerInputs.get("linear-fingerprint")!.toString("utf8"), "Linear fingerprint");
  const fingerprintRecord = record(fingerprintValue, "Linear fingerprint");
  const fingerprintKeys = ["issues", "releasePipelines", "releases", "projects", "projectMilestones", "cycles", ...(Object.hasOwn(fingerprintRecord, "program") ? ["program"] : [])];
  exactKeys(fingerprintRecord, fingerprintKeys, "Linear fingerprint");
  for (const field of ["issues", "releasePipelines", "releases", "projects", "projectMilestones", "cycles"] as const) {
    if (!Array.isArray(fingerprintRecord[field])) throw new Error(`Linear fingerprint ${field} must be an array`);
  }
  const fingerprint = fingerprintRecord as unknown as LinearFingerprint;
  const fingerprintIdentifiers = new Set<string>();
  const fingerprintUuids = new Set<string>();
  for (const issue of fingerprint.issues) {
    if (!issue || typeof issue !== "object" || typeof issue.identifier !== "string" || fingerprintIdentifiers.has(issue.identifier)) throw new Error("Linear fingerprint contains a duplicate or invalid issue identifier");
    if (typeof issue.linearId !== "string" || fingerprintUuids.has(issue.linearId.toLowerCase())) throw new Error("Linear fingerprint contains a duplicate or invalid issue UUID");
    fingerprintIdentifiers.add(issue.identifier);
    fingerprintUuids.add(issue.linearId.toLowerCase());
  }
  assertLinearNativeIdentityMatchesFingerprint(fingerprint, native.capture);

  const rawValue = parseJson<unknown>(compilerInputs.get("raw-documents")!.toString("utf8"), "Linear raw documents");
  const rawRecord = exactKeys(rawValue, ["schemaVersion", "documents"], "Linear raw documents");
  if (rawRecord.schemaVersion !== 1 || !Array.isArray(rawRecord.documents)) throw new Error("Linear raw document artifact contract is invalid");
  const raw = rawRecord as unknown as LinearRawDocumentCapture;
  const documentIds = new Set<string>();
  for (const document of raw.documents) {
    if (!document || typeof document.id !== "string" || documentIds.has(document.id)) throw new Error("Linear raw document artifact contains a duplicate or invalid document ID");
    documentIds.add(document.id);
  }
  const rawIds = raw.documents.map((document) => document.id);
  if (JSON.stringify(sort(rawIds)) !== JSON.stringify(sort(native.capture.rawDocumentIds)) || JSON.stringify(sort(rawIds)) !== JSON.stringify(sort(manifest.rawDocumentIds))) throw new Error("Linear raw document IDs differ from the native and program-scope allowlists");
  assertLinearRawDocumentsMatchNativeIdentity(native.capture, raw);

  const descriptionsValue = parseJson<unknown>(compilerInputs.get("issue-descriptions")!.toString("utf8"), "Linear issue descriptions");
  const descriptionsRecord = exactKeys(descriptionsValue, ["schemaVersion", "issues"], "Linear issue descriptions");
  if (descriptionsRecord.schemaVersion !== 1 || !Array.isArray(descriptionsRecord.issues)) throw new Error("Linear issue-description artifact contract is invalid");
  const descriptionsById = new Map<string, JsonRecord>();
  const labelNameById = new Map(native.capture.labels.map((label) => [label.id, label.name]));
  for (const value of descriptionsRecord.issues) {
    const issue = exactKeys(value, ["id", "title", "description", "updatedAt", "labels"], "Linear issue-description row");
    assertString(issue.id, "Linear issue-description identifier");
    assertString(issue.title, `Linear issue-description ${issue.id} title`);
    if (issue.description !== null && typeof issue.description !== "string") throw new Error(`Linear issue-description ${issue.id} body is invalid`);
    canonicalUtc(issue.updatedAt, `Linear issue-description ${issue.id} updatedAt`);
    assertStringArray(issue.labels, `Linear issue-description ${issue.id} labels`);
    assertUnique(issue.labels, `Linear issue-description ${issue.id} labels`);
    if (descriptionsById.has(issue.id)) throw new Error(`Linear issue-description artifact duplicates ${issue.id}`);
    descriptionsById.set(issue.id, issue);
  }
  if (descriptionsById.size !== native.capture.issues.length) throw new Error("Linear issue-description artifact does not exactly cover native issues");
  for (const nativeIssue of native.capture.issues) {
    const description = descriptionsById.get(nativeIssue.identifier);
    const fingerprintIssue = fingerprintIdentifiers.has(nativeIssue.identifier) ? fingerprint.issues.find((issue) => issue.identifier === nativeIssue.identifier) : undefined;
    const expectedLabels = nativeIssue.labelIds.map((id) => labelNameById.get(id)).filter((name): name is string => name !== undefined).sort();
    if (!description || !fingerprintIssue || description.title !== nativeIssue.title || description.title !== fingerprintIssue.title || sha256((description.description as string | null) ?? "") !== nativeIssue.descriptionSha256 || nativeIssue.descriptionSha256 !== fingerprintIssue.descriptionFingerprint || description.updatedAt !== fingerprintIssue.updatedAt || JSON.stringify(sort(description.labels as string[])) !== JSON.stringify(expectedLabels) || JSON.stringify(expectedLabels) !== JSON.stringify(sort(fingerprintIssue.labels))) throw new Error(`Linear issue-description ${nativeIssue.identifier} differs from fingerprint and native identity`);
  }
  return {
    fingerprint,
    fingerprintIssuesByIdentifier: new Map(fingerprint.issues.map((issue) => [issue.identifier, issue])),
    rawDocuments: raw,
    issueDescriptionsByIdentifier: descriptionsById,
  };
}

function validateCatalogAgainstCapture(
  manifest: LinearAuthorityManifest,
  catalog: CatalogMaps,
  native: NativeIndexes,
  captureArtifacts: CaptureArtifacts,
): void {
  const capture = native.capture;
  if (capture.workspace.id !== manifest.workspace.id || capture.workspace.name !== manifest.workspace.name || capture.workspace.urlKey !== manifest.workspace.urlKey || capture.workspace.archivedAt !== null) throw new Error("Native capture workspace differs from the pinned authority workspace");
  for (const expected of catalog.teams.values()) {
    const actual = native.teamsById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.key !== expected.key || actual.name !== expected.name) throw new Error(`Team ${expected.planKey} differs from its pinned UUID, name, or key`);
    if (capture.teams.filter((row) => row.archivedAt === null && (row.key === expected.key || row.name === expected.name)).length !== 1) throw new Error(`Team ${expected.planKey} identity is not unique`);
  }
  for (const expected of catalog.users.values()) {
    const actual = native.usersById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.active !== true || actual.name !== expected.name) throw new Error(`User ${expected.planKey} differs from its pinned active identity`);
  }
  for (const expected of catalog.initiatives.values()) {
    const actual = native.initiativesById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.contentSha256 !== expected.contentSha256 || actual.descriptionSha256 !== expected.descriptionSha256 || actual.updatedAt !== expected.updatedAt || actual.ownerId !== expected.ownerId || actual.status !== expected.status || actual.priority !== expected.priority || actual.health !== expected.health || actual.healthUpdatedAt !== expected.healthUpdatedAt || actual.startedAt !== expected.startedAt || actual.targetDate !== expected.targetDate || actual.targetDateResolution !== expected.targetDateResolution || actual.parentInitiativeId !== expected.parentInitiativeId) throw new Error(`Initiative ${expected.planKey} differs from its pinned active metadata or parent identity`);
    if (capture.initiatives.filter((row) => row.archivedAt === null && row.name === expected.name).length !== 1) throw new Error(`Initiative ${expected.planKey} name is not unique`);
  }
  const activeInitiativeIds = capture.initiatives.filter((row) => row.archivedAt === null).map((row) => row.id);
  if (JSON.stringify(sort(activeInitiativeIds)) !== JSON.stringify(sort([...catalog.initiatives.values()].map((row) => row.id)))) throw new Error("Authority initiative catalog does not exactly cover every active native initiative");
  for (const expected of catalog.projects.values()) {
    const actual = native.projectsById.get(expected.id);
    const teamIds = expected.teamPlanKeys.map((key) => catalog.teams.get(key)!.id);
    const initiativeIds = expected.initiativePlanKeys.map((key) => catalog.initiatives.get(key)!.id);
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.contentSha256 !== expected.contentSha256 || actual.updatedAt !== expected.updatedAt || actual.statusId !== expected.statusId || actual.status !== expected.status || actual.statusType !== expected.statusType || actual.priority !== expected.priority || actual.leadId !== expected.leadId || actual.startDate !== expected.startDate || actual.startDateResolution !== expected.startDateResolution || actual.targetDate !== expected.targetDate || actual.targetDateResolution !== expected.targetDateResolution || JSON.stringify(sort(actual.teamIds)) !== JSON.stringify(sort(teamIds)) || JSON.stringify(sort(actual.initiativeIds)) !== JSON.stringify(sort(initiativeIds))) throw new Error(`Project ${expected.planKey} differs from its pinned metadata or native topology`);
    if (capture.projects.filter((row) => row.archivedAt === null && row.name === expected.name).length !== 1) throw new Error(`Project ${expected.planKey} name is not unique`);
  }
  for (const expected of catalog.releasePipelines.values()) {
    const actual = native.releasePipelinesById.get(expected.id);
    const teamIds = expected.teamPlanKeys.map((key) => catalog.teams.get(key)!.id);
    const stages = expected.stages.map((stage) => ({ ...stage, archivedAt: null }));
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.updatedAt !== expected.updatedAt || actual.type !== expected.type || actual.isProduction !== expected.isProduction || JSON.stringify(sort(actual.teamIds)) !== JSON.stringify(sort(teamIds)) || JSON.stringify(actual.stages) !== JSON.stringify(stages)) throw new Error(`Release pipeline ${expected.planKey} differs from its pinned active metadata or stages`);
  }
  for (const expected of catalog.cycles.values()) {
    const team = catalog.teams.get(expected.teamPlanKey)!;
    const actual = native.cyclesById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.number !== expected.number || actual.name !== expected.name || actual.descriptionSha256 !== expected.descriptionSha256 || actual.updatedAt !== expected.updatedAt || actual.startsAt !== expected.startsAt || actual.endsAt !== expected.endsAt || actual.completedAt !== expected.completedAt || actual.teamId !== team.id || actual.teamKey !== team.key || actual.inheritedFromId !== expected.inheritedFromId) throw new Error(`Cycle ${expected.planKey} differs from its pinned active metadata or team identity`);
  }
  for (const expected of catalog.milestones.values()) {
    const project = catalog.projects.get(expected.projectPlanKey)!;
    const actual = native.milestonesById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.descriptionSha256 !== expected.descriptionSha256 || actual.updatedAt !== expected.updatedAt || actual.targetDate !== expected.targetDate || actual.status !== expected.status || actual.projectId !== project.id) throw new Error(`Milestone ${expected.planKey} differs from its pinned active metadata or project identity`);
  }
  for (const expected of catalog.releases.values()) {
    const pipeline = catalog.releasePipelines.get(expected.pipelinePlanKey)!;
    const actual = native.releasesById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.descriptionSha256 !== expected.descriptionSha256 || actual.version !== expected.version || actual.commitSha !== expected.commitSha || actual.startDate !== expected.startDate || actual.startedAt !== expected.startedAt || actual.targetDate !== expected.targetDate || actual.completedAt !== expected.completedAt || actual.updatedAt !== expected.updatedAt || actual.pipelineId !== pipeline.id || actual.stageId !== expected.stageId || actual.stageName !== expected.stageName || actual.stageType !== expected.stageType) throw new Error(`Release ${expected.planKey} differs from its pinned active metadata or pipeline identity`);
  }
  for (const expected of catalog.states.values()) {
    const team = catalog.teams.get(expected.teamPlanKey)!;
    const actual = native.statesById.get(expected.id);
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.type !== expected.type || actual.teamId !== team.id || actual.teamKey !== team.key) throw new Error(`Workflow state ${expected.planKey} differs from its pinned name, type, or team`);
    if (capture.workflowStates.filter((row) => row.archivedAt === null && row.teamId === team.id && row.name === expected.name).length !== 1) throw new Error(`Workflow state ${expected.planKey} identity is not unique`);
  }
  for (const expected of catalog.labels.values()) {
    const actual = native.labelsById.get(expected.id);
    const team = expected.teamPlanKey === null ? null : catalog.teams.get(expected.teamPlanKey)!;
    if (!actual || actual.archivedAt !== null || actual.name !== expected.name || actual.isGroup !== false || actual.inheritedFromId !== null || actual.parentId !== expected.parentId || actual.parentName !== expected.parentName || actual.teamId !== (team?.id ?? null) || actual.teamKey !== (team?.key ?? null)) throw new Error(`${expected.name} label differs from its pinned scope or must be active, non-group, and non-inherited`);
    if (capture.labels.filter((row) => row.name === expected.name).length !== 1) throw new Error(`Native capture has a competing ${expected.name} label`);
    if (expected.parentId !== null) {
      const parent = native.labelsById.get(expected.parentId);
      if (!parent || parent.archivedAt !== null || parent.name !== expected.parentName || parent.isGroup !== true || parent.inheritedFromId !== null || parent.teamId !== (team?.id ?? null)) throw new Error(`${expected.name} label parent group differs from its pinned identity`);
    }
  }
  const expectedDecision = [...catalog.labels.values()].find((label) => label.semanticRole === "decision")!;
  const liveDecisionCandidates = capture.labels.filter((label) => label.archivedAt === null && label.name.toLocaleLowerCase("en-US") === "decision");
  if (liveDecisionCandidates.length !== 1 || liveDecisionCandidates[0].id !== expectedDecision.id) throw new Error("Native capture has a duplicate or substitute semantic decision label");
  if (manifest.risks.length > 0 && [...catalog.labels.values()].filter((row) => row.semanticRole === "risk").length !== 1) throw new Error("Risk targets require exactly one pinned risk label");
}

function capturedIssueNativeSha(issue: LinearNativeIdentityCapture["issues"][number]): string {
  return sha256(JSON.stringify({
    teamId: issue.teamId,
    stateId: issue.stateId,
    projectId: issue.projectId,
    estimate: issue.estimate,
    priority: issue.priority,
    dueDate: issue.dueDate,
    cycleId: issue.cycleId,
    milestoneId: issue.milestoneId,
    releaseIds: sort(issue.releaseIds),
    parentIssueUuid: issue.parentIssueUuid,
    assigneeId: issue.assigneeId,
    labelIds: sort(issue.labelIds),
    relationIds: sort(issue.relationIds),
  }));
}

function capturedDocumentTopologySha(document: LinearNativeIdentityCapture["documents"][number]): string {
  return sha256(JSON.stringify({
    initiativeId: document.initiativeId,
    projectId: document.projectId,
    teamId: document.teamId,
    issueId: document.issueId,
    releaseId: document.releaseId,
    cycleId: document.cycleId,
  }));
}

function expectedLiveRelationKey(
  relation: AuthorityNativeRelation,
  allocations: ReadonlyMap<string, LinearTargetAllocation>,
): string | null {
  const left = allocations.get(relation.sourcePlanKey)?.identifier;
  const right = allocations.get(relation.targetPlanKey)?.identifier;
  if (!left || !right) return null;
  return canonicalLiveRelationKey(relation.type, left, right);
}

function liveCandidate(
  target: ExpectedTarget,
  allocations: ReadonlyMap<string, LinearTargetAllocation>,
  native: NativeIndexes,
): LinearNativeIdentityCapture["issues"][number] | LinearNativeIdentityCapture["documents"][number] | LinearNativeIdentityCapture["relations"][number] | null {
  if (target.managed) {
    if (target.managed.expectedCurrentIssueUuid) return native.issuesByUuid.get(target.managed.expectedCurrentIssueUuid) ?? null;
    if (target.expectedIdentifier) return native.issuesByIdentifier.get(target.expectedIdentifier) ?? null;
    const candidates = native.capture.issues.filter((row) => row.archivedAt === null && row.title === target.title);
    if (candidates.length > 1) throw new Error(`Live issue title ${target.title} is ambiguous`);
    return candidates[0] ?? null;
  }
  if (target.kind === "relation_target") {
    if (target.expectedIdentifier) return native.issuesByIdentifier.get(target.expectedIdentifier) ?? null;
    const candidates = native.capture.issues.filter((row) => row.archivedAt === null && row.title === target.title);
    if (candidates.length > 1) throw new Error(`Live relation-target title ${target.title} is ambiguous`);
    return candidates[0] ?? null;
  }
  if (target.document) {
    if (target.document.expectedCurrentDocumentId) return native.documentsById.get(target.document.expectedCurrentDocumentId) ?? null;
    const candidates = native.capture.documents.filter((row) => row.archivedAt === null && row.title === target.title);
    if (candidates.length > 1) throw new Error(`Live document title ${target.title} is ambiguous`);
    return candidates[0] ?? null;
  }
  if (target.relation) {
    const key = expectedLiveRelationKey(target.relation, allocations);
    return key ? native.relationsByKey.get(key) ?? null : null;
  }
  return null;
}

function validateAdoptedTarget(
  target: ExpectedTarget,
  allocation: LinearTargetAllocation,
  allocations: ReadonlyMap<string, LinearTargetAllocation>,
  native: NativeIndexes,
): void {
  const candidate = liveCandidate(target, allocations, native);
  if (!candidate) throw new Error(`Adopted allocation ${target.planKey} has no exact live identity`);
  if (target.managed || target.kind === "relation_target") {
    const issue = candidate as LinearNativeIdentityCapture["issues"][number];
    if (issue.issueUuid !== allocation.uuid || issue.archivedAt !== null || issue.title !== target.title || issue.identifier !== allocation.identifier || issue.identifier !== target.expectedIdentifier) throw new Error(`Adopted allocation ${target.planKey} UUID, title, or identifier identity mismatch`);
    if (target.managed) {
      const managed = target.managed;
      if (managed.expectedCurrentIssueUuid !== issue.issueUuid || managed.expectedCurrentDescriptionSha256 !== issue.descriptionSha256 || managed.expectedCurrentNativeSha256 !== capturedIssueNativeSha(issue)) throw new Error(`Adopted allocation ${target.planKey} differs from its pinned current issue body or native fields`);
    }
    return;
  }
  if (target.document) {
    const document = candidate as LinearNativeIdentityCapture["documents"][number];
    if (document.id !== allocation.uuid || document.archivedAt !== null || document.title !== target.title || allocation.identifier !== null || target.document.expectedCurrentDocumentId !== document.id || target.document.expectedCurrentContentSha256 !== document.contentSha256 || target.document.expectedCurrentTopologySha256 !== capturedDocumentTopologySha(document)) throw new Error(`Adopted allocation ${target.planKey} differs from its pinned document identity, content, or topology`);
    return;
  }
  if (target.relation) {
    const relation = candidate as LinearNativeIdentityCapture["relations"][number];
    const expectedKey = expectedLiveRelationKey(target.relation, allocations);
    if (!expectedKey || relation.relationId !== allocation.uuid || relation.archivedAt !== null || relation.type !== target.relation.type || relation.canonicalKey !== expectedKey || allocation.identifier !== null) throw new Error(`Adopted relation ${target.planKey} canonical key or endpoints differ from capture`);
  }
}

function validateAllocation(
  rawValue: unknown,
  liveCaptureRoot: string,
  manifest: LinearAuthorityManifest,
  targets: ReadonlyMap<string, ExpectedTarget>,
  native: NativeIndexes,
): { adopted: number; allocated: number; rows: ReadonlyMap<string, LinearTargetAllocation> } {
  const allocationObject = exactKeys(rawValue, ["schemaVersion", "planRoot", "sourceSetRoot", "liveCaptureRoot", "allocations"], "Authority allocation");
  if (allocationObject.schemaVersion !== 1 || !Array.isArray(allocationObject.allocations)) throw new Error("Authority allocation contract is invalid");
  const allocation = allocationObject as unknown as LinearAuthorityAllocation;
  if (allocation.planRoot !== manifest.planRoot) throw new Error("Authority allocation plan binding is stale");
  if (allocation.sourceSetRoot !== manifest.sourceSetRoot) throw new Error("Authority allocation source set binding is stale");
  if (allocation.liveCaptureRoot !== liveCaptureRoot) throw new Error("Authority allocation capture binding is stale");
  const rows = new Map<string, LinearTargetAllocation>();
  const seenUuids = new Set<string>();
  for (const row of allocation.allocations) {
    exactKeys(row, ["planKey", "kind", "title", "identifier", "uuid", "source"], "Authority allocation row");
    assertPlanKey(row.planKey, null, "Authority allocation plan key");
    assertUuidV4(row.uuid, `Authority allocation ${row.planKey} UUIDv4`);
    assertNullableString(row.title, `Authority allocation ${row.planKey} title`);
    assertNullableString(row.identifier, `Authority allocation ${row.planKey} identifier`);
    if (row.source !== "adopted" && row.source !== "allocated") throw new Error(`Authority allocation ${row.planKey} source is invalid`);
    const target = targets.get(row.planKey);
    if (!target) throw new Error(`Authority allocation contains unexpected allocation target ${row.planKey}`);
    if (row.kind !== target.kind || row.title !== target.title) throw new Error(`${row.source === "adopted" ? "Adopted" : "Allocated"} allocation ${row.planKey} kind or title identity mismatch`);
    if (rows.has(row.planKey)) throw new Error(`Authority allocation duplicates plan key ${row.planKey}`);
    const normalizedUuid = row.uuid.toLowerCase();
    if (seenUuids.has(normalizedUuid)) throw new Error(`Authority allocation duplicates UUID ${row.uuid}`);
    seenUuids.add(normalizedUuid);
    rows.set(row.planKey, row);
  }
  for (const planKey of targets.keys()) if (!rows.has(planKey)) throw new Error(`Authority allocation is missing allocation for ${planKey}`);
  let adopted = 0;
  let allocated = 0;
  for (const [planKey, target] of targets) {
    const row = rows.get(planKey)!;
    const candidate = liveCandidate(target, rows, native);
    if (row.source === "adopted") {
      adopted += 1;
      validateAdoptedTarget(target, row, rows, native);
    } else {
      allocated += 1;
      if (target.kind === "relation_target") throw new Error(`Relation target ${planKey} must preserve an existing native issue as adopted`);
      if (row.identifier !== null) throw new Error(`Allocated target ${planKey} cannot predeclare a Linear identifier`);
      if (target.managed && (target.expectedIdentifier !== null || target.managed.expectedCurrentIssueUuid !== null || target.managed.expectedCurrentDescriptionSha256 !== null || target.managed.expectedCurrentNativeSha256 !== null)) throw new Error(`Allocated managed target ${planKey} expected live identity fields must all be null`);
      if (native.reservedUuids.has(row.uuid.toLowerCase())) throw new Error(`Allocated target ${planKey} collides with a live UUID`);
      if (candidate) throw new Error(`Allocated target ${planKey} already has a live identity and must preserve it as adopted`);
      if (target.managed?.origin === "live" || target.document?.origin === "live" || target.managed?.expectedCurrentIssueUuid || target.document?.expectedCurrentDocumentId) throw new Error(`Live-origin target ${planKey} cannot be allocated as new`);
    }
  }
  return { adopted, allocated, rows };
}

function validateGovernedLiveIssueCoverage(
  manifest: LinearAuthorityManifest,
  native: NativeIndexes,
  allocations: ReadonlyMap<string, LinearTargetAllocation>,
): void {
  const governedLabels = new Map<string, AuthorityManagedTarget["kind"]>();
  for (const label of manifest.nativeCatalog.labels) {
    if (label.semanticRole !== "other") governedLabels.set(label.id, label.semanticRole);
  }
  const managedByUuid = new Map<string, AuthorityManagedTarget[]>();
  for (const target of [...manifest.requirements, ...manifest.decisions, ...manifest.risks]) {
    if (target.expectedCurrentIssueUuid !== null) managedByUuid.set(target.expectedCurrentIssueUuid, [...(managedByUuid.get(target.expectedCurrentIssueUuid) ?? []), target]);
  }
  for (const issue of native.capture.issues) {
    if (issue.archivedAt !== null) continue;
    const roles = [...new Set(issue.labelIds.map((id) => governedLabels.get(id)).filter((role): role is AuthorityManagedTarget["kind"] => role !== undefined))];
    if (roles.length === 0) continue;
    if (roles.length !== 1) throw new Error(`Governed live issue ${issue.identifier} has conflicting Requirement, Decision, or Risk labels`);
    const targets = managedByUuid.get(issue.issueUuid) ?? [];
    if (targets.length !== 1) throw new Error(`Governed live issue ${issue.identifier} is not represented exactly once by an adopted managed target`);
    const target = targets[0];
    const allocation = allocations.get(target.planKey);
    if (target.kind !== roles[0] || !allocation || allocation.source !== "adopted" || allocation.uuid !== issue.issueUuid || allocation.identifier !== issue.identifier) throw new Error(`Governed live issue ${issue.identifier} is not represented by the matching adopted ${roles[0]} target`);
  }
}

function validateGovernedLiveRelationCoverage(
  manifest: LinearAuthorityManifest,
  native: NativeIndexes,
  allocations: ReadonlyMap<string, LinearTargetAllocation>,
): void {
  const governedLabelIds = new Set(manifest.nativeCatalog.labels.filter((label) => label.semanticRole !== "other").map((label) => label.id));
  const governedIssueIds = new Set(native.capture.issues
    .filter((issue) => issue.archivedAt === null && issue.labelIds.some((id) => governedLabelIds.has(id)))
    .map((issue) => issue.issueUuid));
  const expected = new Map<string, LinearTargetAllocation>();
  for (const relation of manifest.nativeRelations) {
    const allocation = allocations.get(relation.planKey);
    if (!allocation || allocation.source !== "adopted") continue;
    const key = expectedLiveRelationKey(relation, allocations);
    if (!key) throw new Error(`Adopted governed relation ${relation.planKey} has unresolved native endpoints`);
    expected.set(key, allocation);
  }
  const seen = new Set<string>();
  for (const relation of native.capture.relations) {
    if (relation.archivedAt !== null || (!governedIssueIds.has(relation.issueId) && !governedIssueIds.has(relation.relatedIssueId))) continue;
    const allocation = expected.get(relation.canonicalKey);
    if (!allocation || allocation.uuid !== relation.relationId) throw new Error(`Governed live relation ${relation.canonicalKey} is not an exact adopted desired relation`);
    seen.add(relation.canonicalKey);
  }
  for (const [key] of expected) {
    const relation = native.relationsByKey.get(key);
    if (relation && (governedIssueIds.has(relation.issueId) || governedIssueIds.has(relation.relatedIssueId)) && !seen.has(key)) throw new Error(`Adopted governed relation ${key} is absent from active relation coverage`);
  }
}

function proseHygieneViolation(
  description: string,
  exactIdentifiers: readonly string[],
  teamKeys: readonly string[],
): boolean {
  const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const captured = exactIdentifiers.length === 0 ? null : new RegExp(`(?:^|[^A-Za-z0-9])(?:${exactIdentifiers.map(escape).join("|")})(?![A-Za-z0-9])`, "i");
  const teamIdentifier = teamKeys.length === 0 ? null : new RegExp(`\\b(?:${teamKeys.map(escape).join("|")})-\\d+\\b`, "i");
  return MANUAL_NATIVE_REFERENCE.test(description) ||
    MANUAL_RELATION_METADATA.test(description) ||
    /https?:\/\/linear\.app\/[^\s)>]+\/issue\/[^\s)>]+/i.test(description) ||
    captured?.test(description) === true ||
    teamIdentifier?.test(description) === true;
}

function validateIssueDescriptionHygieneAndRepairs(
  manifest: LinearAuthorityManifest,
  native: NativeIndexes,
  captureArtifacts: CaptureArtifacts,
): void {
  const identifiers = native.capture.issues.map((issue) => issue.identifier);
  const teamKeys = native.capture.teams.map((team) => team.key).filter((key) => key.length > 0);
  const managedByUuid = new Map(
    [...manifest.requirements, ...manifest.decisions, ...manifest.risks]
      .filter((target) => target.expectedCurrentIssueUuid !== null)
      .map((target) => [target.expectedCurrentIssueUuid!, target]),
  );
  for (const target of [...manifest.requirements, ...manifest.decisions, ...manifest.risks]) {
    if (proseHygieneViolation(target.description, identifiers, teamKeys)) throw new Error(`Managed ${target.kind} ${target.planKey} violates native reference prose hygiene`);
  }

  const repairs = new Map<string, AuthorityIssueDescriptionRepair>();
  for (const repair of manifest.issueDescriptionRepairs) {
    exactKeys(repair, ["issueUuid", "identifier", "expectedCurrentDescriptionSha256", "desiredDescription", "desiredDescriptionSha256", "requiresNoNativeRelations"], "Issue-description repair");
    assertUuidV4(repair.issueUuid, `Issue-description repair ${repair.identifier} UUID`);
    assertString(repair.identifier, "Issue-description repair identifier");
    assertDigest(repair.expectedCurrentDescriptionSha256, `Issue-description repair ${repair.identifier} current digest`);
    assertString(repair.desiredDescription, `Issue-description repair ${repair.identifier} desired description`);
    assertDigest(repair.desiredDescriptionSha256, `Issue-description repair ${repair.identifier} desired digest`);
    if (repair.requiresNoNativeRelations !== true || sha256(repair.desiredDescription) !== repair.desiredDescriptionSha256) throw new Error(`Issue-description repair ${repair.identifier} desired payload is invalid`);
    if (proseHygieneViolation(repair.desiredDescription, identifiers, teamKeys)) throw new Error(`Issue-description repair ${repair.identifier} desired body violates native reference prose hygiene`);
    if (repairs.has(repair.issueUuid)) throw new Error(`Issue-description repair duplicates ${repair.issueUuid}`);
    repairs.set(repair.issueUuid, repair);
  }

  const canceledStateIds = new Set(native.capture.workflowStates.filter((state) => state.type === "canceled").map((state) => state.id));
  const accountedRepairs = new Set<string>();
  for (const issue of native.capture.issues) {
    const active = issue.archivedAt === null && !canceledStateIds.has(issue.stateId);
    const repair = repairs.get(issue.issueUuid);
    if (!active) {
      if (repair) throw new Error(`Archived or canceled issue ${issue.identifier} cannot have an active description repair`);
      continue;
    }
    const captured = captureArtifacts.issueDescriptionsByIdentifier.get(issue.identifier);
    if (!captured) throw new Error(`Active issue ${issue.identifier} has no captured description`);
    const currentDescription = (captured.description as string | null) ?? "";
    const violates = proseHygieneViolation(currentDescription, identifiers, teamKeys);
    const managed = managedByUuid.get(issue.issueUuid);
    if (managed) {
      if (repair) throw new Error(`Managed issue ${issue.identifier} cannot also have a standalone description repair`);
      continue;
    }
    if (!violates) {
      if (repair) throw new Error(`Issue-description repair ${issue.identifier} is not justified by captured prose drift`);
      continue;
    }
    if (!repair || repair.identifier !== issue.identifier || repair.expectedCurrentDescriptionSha256 !== issue.descriptionSha256) throw new Error(`Active issue ${issue.identifier} has unresolved native reference prose drift`);
    if (issue.relationIds.length !== 0) throw new Error(`Issue-description repair ${issue.identifier} requires no native relations but captured relations remain`);
    accountedRepairs.add(issue.issueUuid);
  }
  if (accountedRepairs.size !== repairs.size) throw new Error("Issue-description repair coverage contains an unresolved or inactive identity");
}

export function validateLinearAuthorityStructure(
  input: LinearAuthorityValidationInput,
): LinearAuthorityStructuralValidationSummary {
  for (const [value, label] of [
    [input.expectedManifestSha256, "Expected authority manifest digest"],
    [input.expectedLiveCaptureSha256, "Expected native capture digest"],
    [input.expectedAllocationSha256, "Expected authority allocation digest"],
  ] as const) assertDigest(value, label);
  const manifestSha = sha256(input.manifestRaw);
  if (manifestSha !== input.expectedManifestSha256) throw new Error("Authority manifest digest mismatch");
  const captureSha = sha256(input.liveCaptureRaw);
  if (captureSha !== input.expectedLiveCaptureSha256) throw new Error("Native capture digest mismatch");
  const allocationSha = sha256(input.allocationRaw);
  if (allocationSha !== input.expectedAllocationSha256) throw new Error("Authority allocation digest mismatch");
  const manifestValue = parseJson<unknown>(input.manifestRaw, "Authority manifest");
  assertManifestShape(manifestValue);
  const manifest = manifestValue;
  if (computeLinearAuthorityPlanRoot(manifest) !== manifest.planRoot) throw new Error("Authority manifest plan root mismatch");
  validateCompilerInputs(manifest, input.compilerInputs, input.liveCaptureRaw);
  const sources = validateSources(manifest, input.sourceFiles);
  const blocks = validateBlocks(manifest, sources);
  const catalog = validateManifestCatalog(manifest);
  const scopes = validateAuthorityScopes(manifest, input.compilerInputs, catalog);
  const targets = new Map<string, ExpectedTarget>();
  validateManagedTargets(manifest, catalog, targets);
  validateDocuments(manifest, catalog, targets);
  validateDocumentAuthority(manifest, catalog, scopes);
  validateReferencesAndRelations(manifest, targets);
  for (const document of manifest.documents) {
    if (document.attachmentKind === "issue") {
      const target = targets.get(document.attachmentPlanKey);
      if (!target || (!target.managed && target.kind !== "relation_target")) throw new Error(`Document ${document.planKey} has an unknown issue attachment`);
    }
  }
  validateBlockOwnership(manifest, blocks, targets);
  validateCoverage(manifest, targets);
  validateCompilerEvidence(manifest, input.compilerInputs, input.allocationRaw, allocationSha);
  const captureValue = parseJson<unknown>(input.liveCaptureRaw, "Native identity capture");
  const native = validateNativeCapture(captureValue);
  const captureArtifacts = validateCaptureArtifacts(manifest, input.compilerInputs, native);
  assertLinearPlanningContractFingerprints(scopes.program, captureArtifacts.fingerprint);
  const masterSource = manifest.sources.find((source) => source.path === "Sourcera_Master_Spec.md")!;
  const uxSource = manifest.sources.find((source) => source.path === "UX_Design_of_Sourcera.md")!;
  assertLinearPlanningSourceFingerprints(scopes.program, captureArtifacts.fingerprint.program!, {
    masterSpecSha256: masterSource.rawSha256,
    uxDesignSha256: uxSource.rawSha256,
  });
  validateCatalogAgainstCapture(manifest, catalog, native, captureArtifacts);
  validateIssueDescriptionHygieneAndRepairs(manifest, native, captureArtifacts);
  validateDocumentCanaryMeasurement(manifest, input.compilerInputs, native, captureArtifacts);
  const allocationValue = parseJson<unknown>(input.allocationRaw, "Authority allocation");
  const allocation = validateAllocation(allocationValue, manifest.liveCaptureRoot, manifest, targets, native);
  validateGovernedLiveIssueCoverage(manifest, native, allocation.rows);
  validateGovernedLiveRelationCoverage(manifest, native, allocation.rows);
  return {
    status: "structural_integrity_validated",
    sources: manifest.sources.length,
    blocks: manifest.blocks.length,
    targets: targets.size,
    relations: manifest.nativeRelations.length,
    adopted: allocation.adopted,
    allocated: allocation.allocated,
    structuralIntegrityValidated: true,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
    sourceSetRoot: manifest.sourceSetRoot,
  };
}
