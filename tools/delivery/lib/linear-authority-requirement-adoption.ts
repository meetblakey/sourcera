import { createHash } from "node:crypto";

import { descriptionFingerprint } from "./fingerprint.js";
import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
} from "./linear-live.js";
import { isUuidV4 } from "./linear-authority-migration.js";
import {
  buildLinearAuthorityRequirementPublicationSequence,
  canonicalLinearAuthorityRequirementPublicationSequenceJson,
} from "./linear-authority-publication-sequence.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  type LinearAuthorityDescriptionCaptureV4,
  type LinearAuthorityRequirementRecoveryV4,
} from "./linear-authority-semantic-plan-v4.js";

export interface LinearAuthorityRequirementAdoptionArtifacts {
  publicationRaw: string;
  recoveryRaw: string;
  recovery: LinearAuthorityRequirementRecoveryV4;
}

export const LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS = [
  "Sourcera_Master_Spec.md",
  "UX_Design_of_Sourcera.md",
  "Sourcera_Buyer_Pricing_Strategy.md",
  "Sourcera_Seller_Pricing_Strategy.md",
  "Audit_Prompts.md",
  "Research_MPP.md",
  "Research_MPP_Implementation_Gaps.md",
  "_audit/FEATURE_INVENTORY.md",
  "delivery/dispositions.json",
  "delivery/feature-dependencies.json",
  "delivery/linear-authority-requirement-bootstrap-map.json",
  "delivery/linear-program-scope.json",
  "delivery/linear-snapshot.json",
  "delivery/linear-source-policy.json",
] as const;

export interface LinearAuthorityRequirementBaselineEntry {
  canonicalLegacyId: string;
  issueUuid: string;
  issueIdentifier: string;
  title: string;
}

export interface LinearAuthorityRequirementBootstrapMapEntry {
  issueIdentifier: string;
  canonicalLegacyId: string;
}

export interface LinearAuthorityRequirementBootstrapMap {
  schemaVersion: 1;
  sourceArtifactSha256: string;
  reconciliationRoot: string;
  entries: LinearAuthorityRequirementBootstrapMapEntry[];
  root: string;
}

export type LinearAuthorityRequirementBaseline = {
  schemaVersion: 1;
  initialized: false;
  workspaceId: null;
  entries: [];
  root: string;
} | {
  schemaVersion: 1;
  initialized: true;
  workspaceId: string;
  entries: LinearAuthorityRequirementBaselineEntry[];
  root: string;
};

const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");
const BOOTSTRAP_SOURCE_ARTIFACT_SHA256 =
  "f3d387efe2426209f18a324339256ef65c33b589c7acb9eb69764b4f87f4744a";
const BOOTSTRAP_RECONCILIATION_ROOT =
  "86dacf40266d3a765e26692997b06a8dbfe6147ae1af981a80166967959b9f72";
const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function fail(message: string): never {
  throw new Error(`Linear authority Requirement adoption: ${message}`);
}

function parseJson<T>(value: string | Uint8Array, label: string): T {
  try {
    return JSON.parse(typeof value === "string" ? value : Buffer.from(value).toString("utf8")) as T;
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("canonical payload contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort(compare).map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(row[key])}`
  ).join(",")}}`;
}

function exactKeys(value: unknown, expected: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (JSON.stringify(Object.keys(row).sort(compare)) !== JSON.stringify([...expected].sort(compare))) {
    fail(`${label} keys differ`);
  }
  return row;
}

function requirementIssues(
  fingerprint: LinearFingerprint,
): LinearFingerprint["issues"] {
  return fingerprint.issues.filter((issue) =>
    issue.archivedAt === null && issue.team === "REQ" &&
    JSON.stringify([...issue.labels].sort(compare)) === JSON.stringify(["Requirement"])
  );
}

function exactDesiredNative(
  issue: LinearFingerprint["issues"][number],
  planned: ReturnType<typeof buildLinearAuthoritySemanticCoreV4>["requirements"][number],
  description: LinearAuthorityDescriptionCaptureV4["issues"][number],
): boolean {
  return exactImmutableNative(issue, planned) &&
    issue.descriptionFingerprint === descriptionFingerprint(planned.description) &&
    descriptionFingerprint(description.description) === descriptionFingerprint(planned.description) &&
    issue.priority === planned.priority;
}

function exactImmutableNative(
  issue: LinearFingerprint["issues"][number],
  planned: ReturnType<typeof buildLinearAuthoritySemanticCoreV4>["requirements"][number],
): boolean {
  return issue.title === planned.title && issue.project === planned.project &&
    issue.projectId !== null && issue.state === planned.state && issue.stateId !== null &&
    isUuidV4(issue.projectId) && isUuidV4(issue.stateId) &&
    issue.estimate === null && issue.dueDate === null &&
    issue.cycleId === null && issue.milestoneId === null && issue.parentLinearId === null &&
    issue.assigneeId === null && issue.releases.length === 0 &&
    JSON.stringify([...issue.labels].sort(compare)) === JSON.stringify(["Requirement"]);
}

function hasPrimaryAnchor(
  issue: LinearFingerprint["issues"][number],
  planned: ReturnType<typeof buildLinearAuthoritySemanticCoreV4>["requirements"][number],
  fingerprintByIdentifier: ReadonlyMap<string, LinearFingerprint["issues"][number]>,
): boolean {
  const primary = fingerprintByIdentifier.get(planned.primaryExecution);
  const key = canonicalLinearRelationKey("related", issue.identifier, planned.primaryExecution);
  return primary !== undefined && issue.relations.filter((row) => row === key).length === 1 &&
    primary.relations.filter((row) => row === key).length === 1;
}

function baselineRoot(entries: readonly LinearAuthorityRequirementBaselineEntry[]): string {
  return sha256(canonicalJson(entries));
}

function bootstrapMapRoot(entries: readonly LinearAuthorityRequirementBootstrapMapEntry[]): string {
  return sha256(canonicalJson(entries));
}

export function parseLinearAuthorityRequirementBootstrapMap(
  raw: string | Uint8Array,
): LinearAuthorityRequirementBootstrapMap {
  const parsed = parseJson<LinearAuthorityRequirementBootstrapMap>(raw, "Requirement bootstrap map");
  const row = exactKeys(parsed, [
    "schemaVersion",
    "sourceArtifactSha256",
    "reconciliationRoot",
    "entries",
    "root",
  ], "Requirement bootstrap map");
  if (row.schemaVersion !== 1 || row.sourceArtifactSha256 !== BOOTSTRAP_SOURCE_ARTIFACT_SHA256 ||
    row.reconciliationRoot !== BOOTSTRAP_RECONCILIATION_ROOT || !Array.isArray(row.entries) ||
    row.entries.length !== 61 || typeof row.root !== "string") {
    fail("Requirement bootstrap map does not bind the approved audited artifact");
  }
  const entries = row.entries as LinearAuthorityRequirementBootstrapMapEntry[];
  const identifiers = new Set<string>();
  const legacyIds = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const value = exactKeys(entry, ["issueIdentifier", "canonicalLegacyId"], `Requirement bootstrap map entry ${index + 1}`);
    const expectedIdentifier = `REQ-${index + 1}`;
    if (value.issueIdentifier !== expectedIdentifier || typeof value.canonicalLegacyId !== "string" ||
      !/^F-(?:AE-|BC-)?\d+$/.test(value.canonicalLegacyId) || identifiers.has(value.issueIdentifier) ||
      legacyIds.has(value.canonicalLegacyId)) {
      fail("Requirement bootstrap map contains an invalid, reordered, or duplicate identity");
    }
    identifiers.add(value.issueIdentifier);
    legacyIds.add(value.canonicalLegacyId);
  }
  if (row.root !== bootstrapMapRoot(entries)) {
    fail("Requirement bootstrap map root differs from its exact entries");
  }
  return parsed;
}

interface RequirementCaptureBinding {
  issue: LinearFingerprint["issues"][number];
  planned: ReturnType<typeof buildLinearAuthoritySemanticCoreV4>["requirements"][number];
  description: LinearAuthorityDescriptionCaptureV4["issues"][number];
}

function relationPresent(
  key: string,
  fingerprintByIdentifier: ReadonlyMap<string, LinearFingerprint["issues"][number]>,
): boolean {
  const [, left, right, ...extra] = key.split(":");
  if (!left || !right || extra.length) fail(`native relation key ${key} is invalid`);
  const leftIssue = fingerprintByIdentifier.get(left);
  const rightIssue = fingerprintByIdentifier.get(right);
  if (!leftIssue || !rightIssue) return false;
  const leftCount = leftIssue.relations.filter((row) => row === key).length;
  const rightCount = rightIssue.relations.filter((row) => row === key).length;
  if ((leftCount === 0) !== (rightCount === 0) || leftCount > 1 || rightCount > 1) {
    fail(`native relation ${key} is asymmetric or duplicated`);
  }
  return leftCount === 1;
}

function assertExactAuditedBootstrap(
  bindings: readonly RequirementCaptureBinding[],
  bootstrapMap: LinearAuthorityRequirementBootstrapMap,
  fingerprintByIdentifier: ReadonlyMap<string, LinearFingerprint["issues"][number]>,
): void {
  if (bindings.length !== 186) fail("audited Requirement bootstrap requires exactly 186 live rows");
  const bindingByLegacyId = new Map(bindings.map((binding) => [binding.planned.canonicalLegacyId, binding]));
  const desiredRelations = new Set<string>();
  for (const { issue, planned } of bindings) {
    for (const endpoint of [...planned.execution, ...planned.proofExecutionDependencies]) {
      desiredRelations.add(canonicalLinearRelationKey("related", issue.identifier, endpoint));
    }
    for (const dependency of planned.requirementDependencyLegacyIds) {
      const adopted = bindingByLegacyId.get(dependency);
      if (adopted) {
        desiredRelations.add(canonicalLinearRelationKey("blocks", adopted.issue.identifier, issue.identifier));
      }
    }
  }
  const currentRelations = new Set(bindings.flatMap(({ issue }) => issue.relations));
  const unexpected = [...currentRelations].filter((key) => !desiredRelations.has(key));
  if (unexpected.length) fail(`audited Requirement bootstrap has unexpected relation ${unexpected[0]}`);
  for (const key of currentRelations) {
    if (!relationPresent(key, fingerprintByIdentifier)) fail(`native relation ${key} is not complete`);
  }

  const bootstrapByIdentifier = new Map(bootstrapMap.entries.map((entry) => [entry.issueIdentifier, entry]));
  const reconciliation = bindings
    .filter(({ issue }) => bootstrapByIdentifier.has(issue.identifier))
    .map(({ issue, planned }): Record<string, unknown> => ({
      issueIdentifier: issue.identifier,
      canonicalLegacyId: planned.canonicalLegacyId,
      frozenDuringCapture: true,
      descriptionUpdateRequired: issue.descriptionFingerprint !== descriptionFingerprint(planned.description),
      executionRelationsToAdd: planned.execution.filter((endpoint) =>
        !relationPresent(canonicalLinearRelationKey("related", issue.identifier, endpoint), fingerprintByIdentifier)),
      requirementDependencyLegacyIdsToAdd: planned.requirementDependencyLegacyIds.filter((dependency) => {
        const adopted = bindingByLegacyId.get(dependency);
        return !adopted || !relationPresent(
          canonicalLinearRelationKey("blocks", adopted.issue.identifier, issue.identifier),
          fingerprintByIdentifier,
        );
      }),
      proofExecutionDependenciesToAdd: planned.proofExecutionDependencies.filter((endpoint) =>
        !relationPresent(canonicalLinearRelationKey("related", issue.identifier, endpoint), fingerprintByIdentifier)),
    }))
    .sort((left, right) => compare(String(left.issueIdentifier), String(right.issueIdentifier)));
  if (reconciliation.length !== 61 || sha256(canonicalJson(reconciliation)) !== bootstrapMap.reconciliationRoot) {
    fail("REQ-1..REQ-61 reconciliation differs from the approved audited artifact");
  }
  const priorityDeltas = bindings.filter(({ issue, planned }) => issue.priority !== planned.priority);
  if (priorityDeltas.length !== 1 || priorityDeltas[0]!.issue.identifier !== "REQ-1" ||
    priorityDeltas[0]!.issue.priority !== 3 || priorityDeltas[0]!.planned.priority !== 2) {
    fail("Requirement bootstrap priority delta differs from the audited REQ-1 repair");
  }
}

function parseBaseline(
  raw: string | Uint8Array,
  workspaceId: string,
): LinearAuthorityRequirementBaseline & { initialized: true } {
  const parsed = parseJson<LinearAuthorityRequirementBaseline>(raw, "Requirement baseline registry");
  const row = exactKeys(parsed, ["schemaVersion", "initialized", "workspaceId", "entries", "root"], "Requirement baseline registry");
  if (row.schemaVersion !== 1 || row.initialized !== true || row.workspaceId !== workspaceId ||
    !Array.isArray(row.entries) || typeof row.root !== "string") {
    fail("Requirement baseline registry is uninitialized or belongs to another workspace");
  }
  const entries = row.entries as LinearAuthorityRequirementBaselineEntry[];
  if ((entries.length !== 186 && entries.length !== 926) || row.root !== baselineRoot(entries)) {
    fail("Requirement baseline registry count or root is invalid");
  }
  const legacyIds = new Set<string>();
  const identifiers = new Set<string>();
  const uuids = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const value = exactKeys(entry, ["canonicalLegacyId", "issueUuid", "issueIdentifier", "title"], `Requirement baseline entry ${index + 1}`);
    if (typeof value.canonicalLegacyId !== "string" || typeof value.issueIdentifier !== "string" ||
      typeof value.title !== "string" || typeof value.issueUuid !== "string" || !isUuidV4(value.issueUuid) ||
      legacyIds.has(value.canonicalLegacyId) || identifiers.has(value.issueIdentifier) || uuids.has(value.issueUuid.toLowerCase())) {
      fail("Requirement baseline registry contains an invalid or duplicate identity");
    }
    legacyIds.add(value.canonicalLegacyId);
    identifiers.add(value.issueIdentifier);
    uuids.add(value.issueUuid.toLowerCase());
  }
  return parsed as LinearAuthorityRequirementBaseline & { initialized: true };
}

export function buildLinearAuthorityRequirementBaseline(input: {
  rootDir: string;
  workspaceId: string;
  fingerprintJson: string | Uint8Array;
  descriptionsJson: string | Uint8Array;
  bootstrapMapJson: string | Uint8Array;
}): LinearAuthorityRequirementBaseline & { initialized: true } {
  if (!isUuidV4(input.workspaceId)) fail("Requirement baseline workspace ID is invalid");
  const core = buildLinearAuthoritySemanticCoreV4(input.rootDir);
  const bootstrapMap = parseLinearAuthorityRequirementBootstrapMap(input.bootstrapMapJson);
  const fingerprint = parseJson<LinearFingerprint>(input.fingerprintJson, "Linear fingerprint");
  const descriptions = parseJson<LinearAuthorityDescriptionCaptureV4>(input.descriptionsJson, "Linear description capture");
  if (!fingerprint || !Array.isArray(fingerprint.issues) || descriptions.schemaVersion !== 1 || !Array.isArray(descriptions.issues)) {
    fail("Requirement baseline capture is invalid");
  }
  const rows = requirementIssues(fingerprint);
  if (rows.length !== 186 && rows.length !== 926) {
    fail("Requirement baseline derivation requires exactly 186 or 926 live Requirements");
  }
  const fingerprintByIdentifier = new Map(fingerprint.issues.map((issue) => [issue.identifier, issue]));
  const descriptionsByIdentifier = new Map<string, LinearAuthorityDescriptionCaptureV4["issues"][number]>();
  for (const raw of descriptions.issues) {
    const row = exactKeys(raw, ["id", "title", "description", "updatedAt", "labels"], `description ${raw?.id ?? "unknown"}`);
    if (typeof row.id !== "string" || typeof row.title !== "string" ||
      (row.description !== null && typeof row.description !== "string") || typeof row.updatedAt !== "string" ||
      !Array.isArray(row.labels) || row.labels.some((label) => typeof label !== "string") || descriptionsByIdentifier.has(row.id)) {
      fail("Requirement baseline description capture contains an invalid or duplicate row");
    }
    descriptionsByIdentifier.set(row.id, raw);
  }
  if (descriptionsByIdentifier.size !== fingerprintByIdentifier.size) {
    fail("Requirement baseline description capture does not exactly cover the fingerprint");
  }
  for (const [identifier, issue] of fingerprintByIdentifier) {
    const description = descriptionsByIdentifier.get(identifier);
    if (!description || description.title !== issue.title || description.updatedAt !== issue.updatedAt ||
      descriptionFingerprint(description.description) !== issue.descriptionFingerprint ||
      JSON.stringify([...description.labels].sort(compare)) !== JSON.stringify([...issue.labels].sort(compare))) {
      fail(`Requirement baseline description capture drifts from fingerprint at ${identifier}`);
    }
  }
  const coreByTitle = new Map<string, typeof core.requirements>();
  for (const planned of core.requirements) {
    coreByTitle.set(planned.title, [...(coreByTitle.get(planned.title) ?? []), planned]);
  }
  if ([...coreByTitle.values()].some((matches) => matches.length !== 1)) {
    fail("canonical Requirement titles are not unique");
  }
  const coreByLegacyId = new Map(core.requirements.map((planned) => [planned.canonicalLegacyId, planned]));
  const bootstrapByIdentifier = new Map(bootstrapMap.entries.map((entry) => [entry.issueIdentifier, entry]));
  const bindings = rows.map((issue): RequirementCaptureBinding => {
    const bootstrap = bootstrapByIdentifier.get(issue.identifier);
    const planned = bootstrap
      ? coreByLegacyId.get(bootstrap.canonicalLegacyId)
      : (coreByTitle.get(issue.title) ?? [])[0];
    const description = descriptionsByIdentifier.get(issue.identifier);
    if (!planned || !description || !issue.linearId || !isUuidV4(issue.linearId) ||
      issue.title !== planned.title || !exactImmutableNative(issue, planned)) {
      fail(`${issue.identifier} is not a uniquely canonical anchored Requirement`);
    }
    const strict = rows.length === 926 || !bootstrap;
    if (strict && (!exactDesiredNative(issue, planned, description) ||
      !hasPrimaryAnchor(issue, planned, fingerprintByIdentifier))) {
      fail(`${issue.identifier} is not an exact desired anchored Requirement`);
    }
    return { issue, planned, description };
  });
  const bindingByLegacyId = new Map(bindings.map((binding) => [
    binding.planned.canonicalLegacyId,
    binding,
  ]));
  for (const { issue, planned } of bindings) {
    const bootstrapMutable = rows.length === 186 && bootstrapByIdentifier.has(issue.identifier);
    if (bootstrapMutable) continue;
    for (const endpoint of [...planned.execution, ...planned.proofExecutionDependencies]) {
      if (!relationPresent(
        canonicalLinearRelationKey("related", issue.identifier, endpoint),
        fingerprintByIdentifier,
      )) {
        fail(`${issue.identifier} lacks an exact desired execution relation`);
      }
    }
    for (const dependency of planned.requirementDependencyLegacyIds) {
      const adopted = bindingByLegacyId.get(dependency);
      if (adopted && !relationPresent(
        canonicalLinearRelationKey("blocks", adopted.issue.identifier, issue.identifier),
        fingerprintByIdentifier,
      )) {
        fail(`${issue.identifier} lacks an exact desired Requirement dependency relation`);
      }
    }
  }
  if (rows.length === 186) {
    const seenBootstrap = new Set(bindings.filter(({ issue }) => bootstrapByIdentifier.has(issue.identifier))
      .map(({ issue }) => issue.identifier));
    if (seenBootstrap.size !== 61) fail("audited bootstrap identities are missing from live Requirements");
    assertExactAuditedBootstrap(bindings, bootstrapMap, fingerprintByIdentifier);
  }
  const entries = bindings.map(({ issue, planned }): LinearAuthorityRequirementBaselineEntry => {
    if (!issue.linearId || !isUuidV4(issue.linearId)) {
      fail(`${issue.identifier} has no exact native UUID for baseline pinning`);
    }
    return {
      canonicalLegacyId: planned.canonicalLegacyId,
      issueUuid: issue.linearId,
      issueIdentifier: issue.identifier,
      title: issue.title,
    };
  }).sort((left, right) => compare(left.issueIdentifier, right.issueIdentifier));
  if (new Set(entries.map((entry) => entry.canonicalLegacyId)).size !== entries.length) {
    fail("Requirement baseline derivation duplicates canonical identities");
  }
  return {
    schemaVersion: 1,
    initialized: true,
    workspaceId: input.workspaceId,
    entries,
    root: baselineRoot(entries),
  };
}

export function canonicalLinearAuthorityRequirementBaselineJson(
  baseline: LinearAuthorityRequirementBaseline,
): string {
  return `${canonicalJson(baseline)}\n`;
}

export function buildLinearAuthorityRequirementAdoptionArtifacts(input: {
  rootDir: string;
  workspaceId: string;
  fingerprintJson: string | Uint8Array;
  descriptionsJson: string | Uint8Array;
  baselineJson: string | Uint8Array;
}): LinearAuthorityRequirementAdoptionArtifacts {
  const core = buildLinearAuthoritySemanticCoreV4(input.rootDir);
  const publicationRaw = canonicalLinearAuthorityRequirementPublicationSequenceJson(
    buildLinearAuthorityRequirementPublicationSequence(core.publicationSequence),
  );
  const fingerprint = parseJson<LinearFingerprint>(input.fingerprintJson, "Linear fingerprint");
  const descriptions = parseJson<LinearAuthorityDescriptionCaptureV4>(
    input.descriptionsJson,
    "Linear description capture",
  );
  if (!fingerprint || !Array.isArray(fingerprint.issues)) fail("Linear fingerprint lacks issues");
  const descriptionRoot = exactKeys(descriptions, ["schemaVersion", "issues"], "description capture");
  if (descriptionRoot.schemaVersion !== 1 || !Array.isArray(descriptionRoot.issues)) {
    fail("description capture contract is invalid");
  }

  const fingerprintByIdentifier = new Map<string, LinearFingerprint["issues"][number]>();
  const fingerprintByUuid = new Map<string, LinearFingerprint["issues"][number]>();
  for (const issue of fingerprint.issues) {
    if (!issue || typeof issue.identifier !== "string" || !isUuidV4(issue.linearId ?? "") ||
      fingerprintByIdentifier.has(issue.identifier) || fingerprintByUuid.has(issue.linearId!.toLowerCase())) {
      fail("Linear fingerprint contains an invalid or duplicate issue identity");
    }
    fingerprintByIdentifier.set(issue.identifier, issue);
    fingerprintByUuid.set(issue.linearId!.toLowerCase(), issue);
  }
  const descriptionsByIdentifier = new Map<string, LinearAuthorityDescriptionCaptureV4["issues"][number]>();
  for (const raw of descriptions.issues) {
    const row = exactKeys(raw, ["id", "title", "description", "updatedAt", "labels"], `description ${raw?.id ?? "unknown"}`);
    if (typeof row.id !== "string" || typeof row.title !== "string" ||
      (row.description !== null && typeof row.description !== "string") ||
      typeof row.updatedAt !== "string" || !Array.isArray(row.labels) ||
      row.labels.some((label) => typeof label !== "string") || descriptionsByIdentifier.has(row.id)) {
      fail("description capture contains an invalid or duplicate issue row");
    }
    descriptionsByIdentifier.set(row.id, raw);
  }
  if (descriptionsByIdentifier.size !== fingerprintByIdentifier.size) {
    fail("description capture does not exactly cover the fingerprint");
  }
  for (const [identifier, issue] of fingerprintByIdentifier) {
    const description = descriptionsByIdentifier.get(identifier);
    if (!description || description.title !== issue.title || description.updatedAt !== issue.updatedAt ||
      descriptionFingerprint(description.description) !== issue.descriptionFingerprint ||
      JSON.stringify([...description.labels].sort(compare)) !== JSON.stringify([...issue.labels].sort(compare))) {
      fail(`description capture drifts from fingerprint at ${identifier}`);
    }
  }

  const requirements = requirementIssues(fingerprint);
  if (requirements.length < 186 || requirements.length > 926) {
    fail("live Requirements team must contain between 186 and 926 active Requirement issues");
  }
  const coreByTitle = new Map<string, typeof core.requirements>();
  for (const row of core.requirements) {
    coreByTitle.set(row.title, [...(coreByTitle.get(row.title) ?? []), row]);
  }
  if ([...coreByTitle.values()].some((rows) => rows.length !== 1)) {
    fail("canonical Requirement titles are not unique");
  }

  const baseline = parseBaseline(input.baselineJson, input.workspaceId);
  const baselineByLegacyId = new Map(baseline.entries.map((entry) => [entry.canonicalLegacyId, entry]));
  const baselineByIdentifier = new Map(baseline.entries.map((entry) => [entry.issueIdentifier, entry]));
  const coreByLegacyId = new Map(core.requirements.map((row) => [row.canonicalLegacyId, row]));
  const seenLegacyIds = new Set<string>();
  const anchoredLegacyIds = new Set<string>();
  const mappings = requirements.map((issue) => {
    const baselineEntryByIdentifier = baselineByIdentifier.get(issue.identifier);
    const planned = baselineEntryByIdentifier
      ? coreByLegacyId.get(baselineEntryByIdentifier.canonicalLegacyId)
      : (() => {
        const candidates = coreByTitle.get(issue.title) ?? [];
        if (candidates.length !== 1) fail(`${issue.identifier} does not match one unique canonical Requirement title`);
        return candidates[0]!;
      })();
    if (!planned) fail(`${issue.identifier} baseline maps to an unknown canonical Requirement`);
    if (seenLegacyIds.has(planned.canonicalLegacyId)) fail(`${issue.identifier} duplicates a canonical Requirement identity`);
    if (issue.project !== planned.project || issue.projectId === null || issue.state !== planned.state ||
      !isUuidV4(issue.stateId) || !isUuidV4(issue.projectId) || issue.linearId === null) {
      fail(`${issue.identifier} native project, state, or UUID has drifted`);
    }
    const description = descriptionsByIdentifier.get(issue.identifier)!;
    const baselineEntry = baselineByLegacyId.get(planned.canonicalLegacyId);
    const anchored = hasPrimaryAnchor(issue, planned, fingerprintByIdentifier);
    if (baselineEntry) {
      if (baselineEntry.issueUuid !== issue.linearId || baselineEntry.issueIdentifier !== issue.identifier ||
        baselineEntry.title !== issue.title || !exactImmutableNative(issue, planned) || !anchored) {
        fail(`${issue.identifier} differs from its anchored Requirement baseline identity`);
      }
      const bootstrapMutable = baseline.entries.length === 186 && /^REQ-(?:[1-9]|[1-5]\d|6[01])$/.test(issue.identifier);
      if (!bootstrapMutable && !exactDesiredNative(issue, planned, description)) {
        fail(`${issue.identifier} differs from its exact anchored Requirement baseline target`);
      }
    } else if (!exactDesiredNative(issue, planned, description)) {
      fail(`${issue.identifier} partial-created Requirement differs from the exact desired target`);
    }
    if (anchored) anchoredLegacyIds.add(planned.canonicalLegacyId);
    seenLegacyIds.add(planned.canonicalLegacyId);
    return {
      legacyId: planned.canonicalLegacyId,
      legacyIds: [planned.canonicalLegacyId],
      issueIdentifier: issue.identifier,
      issueUuid: issue.linearId,
      title: issue.title,
      projectId: issue.projectId,
      stateId: issue.stateId,
      labelNames: ["Requirement"],
      relationKeys: [...issue.relations].sort(compare),
      descriptionFingerprint: descriptionFingerprint(description.description),
    };
  }).sort((left, right) => compare(left.issueIdentifier, right.issueIdentifier));
  if (
    seenLegacyIds.size !== requirements.length ||
    new Set(mappings.map((row) => row.issueUuid.toLowerCase())).size !==
      requirements.length
  ) {
    fail("Requirement adoption identities are missing or duplicated");
  }
  if (baseline.entries.some((entry) => !seenLegacyIds.has(entry.canonicalLegacyId)) ||
    baseline.entries.some((entry) => !anchoredLegacyIds.has(entry.canonicalLegacyId))) {
    fail("Requirement baseline contains a missing or unanchored live identity");
  }
  const recovery: LinearAuthorityRequirementRecoveryV4 = {
    schemaVersion: 1,
    captureSha256: sha256(input.fingerprintJson),
    publicationSha256: sha256(publicationRaw),
    mappings,
  };
  const recoveryRaw = `${canonicalJson(recovery)}\n`;
  return { publicationRaw, recoveryRaw, recovery };
}

export function assertLinearAuthorityRequirementAdoptionArtifacts(input: {
  rootDir: string;
  workspaceId: string;
  fingerprintJson: string | Uint8Array;
  descriptionsJson: string | Uint8Array;
  baselineJson: string | Uint8Array;
  publicationRaw: string;
  recoveryRaw: string;
}): LinearAuthorityRequirementAdoptionArtifacts {
  const expected = buildLinearAuthorityRequirementAdoptionArtifacts(input);
  if (input.publicationRaw !== expected.publicationRaw || input.recoveryRaw !== expected.recoveryRaw) {
    fail("supplied adoption artifacts are not the exact capture-derived bytes");
  }
  return expected;
}
