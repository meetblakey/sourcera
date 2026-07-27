import { createHash } from "node:crypto";

export const LINEAR_AUTHORITY_SEMANTIC_PLAN_SCHEMA_VERSION = 3 as const;

export type LinearAuthorityDisposition =
  | "proof_only"
  | "narrative_context"
  | "superseded"
  | "retired_source";

export interface LinearAuthoritySemanticPlanCounts {
  requirements: number;
  dispositionDecisions: number;
  dispositionClasses: Record<LinearAuthorityDisposition, number>;
  sourceSplitRows: number;
  splitExecutionRelations: number;
  rawSourceDependencyEdges: number;
  dependencyRepairAdditions: number;
  normalizedDependencyEdges: number;
  executableNativeRequirementEdges: number;
  executableProofDependencyEdges: number;
  publicationSequenceEntries: number;
  dependencyOrderViolations: number;
  existingRequirementsVerified: number;
  existingDescriptionsToUpdate: number;
  existingExecutionRelationsToAdd: number;
  existingRequirementDependencyRelationsToAdd: number;
  existingProofExecutionRelationsToAdd: number;
}

export interface LinearAuthoritySemanticRequirementProjection {
  canonicalLegacyId: string;
  legacyIds: string[];
  title: string;
  description: string;
  project: string;
  state: "Approved";
  semanticRole: "requirement";
  priority: number;
  execution: string[];
  primaryExecution: string;
  sourceAnchor: string;
  sourceDependencyLegacyIds: string[];
  normalizedDependencyLegacyIds: string[];
  requirementDependencyLegacyIds: string[];
  proofExecutionDependencies: string[];
  dispositionResolutions: LinearAuthorityDispositionResolution[];
  publicationRank: number;
}

export interface LinearAuthorityDispositionResolution {
  viaDisposition: string;
  requirement: string | null;
  proofExecution: string | null;
}

export interface LinearAuthoritySemanticDecisionProjection {
  legacyId: string;
  disposition: LinearAuthorityDisposition;
  title: string;
  description: string;
  project: string;
  state: "Approved" | "Retired" | "Superseded";
  semanticRole: "decision";
  priority: number;
  existingRelations: string[];
  requirementRelations: string[];
  sourceDependencyLegacyIds: string[];
  normalizedDependencyLegacyIds: string[];
}

export interface LinearAuthorityExistingRequirementReconciliationProjection {
  issueIdentifier: string;
  canonicalLegacyId: string;
  frozenDuringCapture: true;
  descriptionUpdateRequired: boolean;
  executionRelationsToAdd: string[];
  requirementDependencyLegacyIdsToAdd: string[];
  proofExecutionDependenciesToAdd: string[];
}

export interface LinearAuthoritySemanticProjection {
  schemaVersion: 3;
  derivedCounts: LinearAuthoritySemanticPlanCounts;
  requirements: LinearAuthoritySemanticRequirementProjection[];
  decisions: LinearAuthoritySemanticDecisionProjection[];
  existingRequirementReconciliation: LinearAuthorityExistingRequirementReconciliationProjection[];
  publicationSequence: string[];
}

export interface ValidatedLinearAuthoritySemanticPlan {
  semanticPlanInternalsValidated: true;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
  semanticRoot: string;
  derivedCounts: LinearAuthoritySemanticPlanCounts;
  projection: LinearAuthoritySemanticProjection;
}

type JsonRecord = Record<string, unknown>;

interface ParsedCounts {
  requirements: number;
  dispositionDecisions: number;
  rawSourceDependencyEdges: number;
  normalizedDependencyEdges: number;
  dependencyRepairAdditions: number;
  executableNativeRequirementEdges: number;
  executableProofDependencyEdges: number;
  splitExecutionRelations: number;
  existingRequirementsVerified: number;
  existingDescriptionsToUpdate: number;
  existingExecutionRelationsToAdd: number;
}

interface ParsedRequirement extends Omit<LinearAuthoritySemanticRequirementProjection, "semanticRole"> {
  labels: ["Requirement"];
}

interface ParsedDecision extends Omit<LinearAuthoritySemanticDecisionProjection, "semanticRole"> {
  labels: ["Decision"];
}

const TOP_LEVEL_KEYS = [
  "schemaVersion",
  "counts",
  "requirements",
  "decisions",
  "existingRequirementReconciliation",
  "publicationSequence",
] as const;

const COUNT_KEYS = [
  "requirements",
  "dispositionDecisions",
  "rawSourceDependencyEdges",
  "normalizedDependencyEdges",
  "dependencyRepairAdditions",
  "executableNativeRequirementEdges",
  "executableProofDependencyEdges",
  "splitExecutionRelations",
  "existingRequirementsVerified",
  "existingDescriptionsToUpdate",
  "existingExecutionRelationsToAdd",
] as const;

const REQUIREMENT_KEYS = [
  "canonicalLegacyId",
  "legacyIds",
  "title",
  "description",
  "project",
  "state",
  "labels",
  "priority",
  "execution",
  "primaryExecution",
  "sourceAnchor",
  "sourceDependencyLegacyIds",
  "normalizedDependencyLegacyIds",
  "requirementDependencyLegacyIds",
  "proofExecutionDependencies",
  "dispositionResolutions",
  "publicationRank",
] as const;

const DECISION_KEYS = [
  "legacyId",
  "disposition",
  "title",
  "description",
  "project",
  "state",
  "labels",
  "priority",
  "existingRelations",
  "requirementRelations",
  "sourceDependencyLegacyIds",
  "normalizedDependencyLegacyIds",
] as const;

const RESOLUTION_KEYS = ["viaDisposition", "requirement", "proofExecution"] as const;

const RECONCILIATION_KEYS = [
  "issueIdentifier",
  "canonicalLegacyId",
  "frozenDuringCapture",
  "descriptionUpdateRequired",
  "executionRelationsToAdd",
  "requirementDependencyLegacyIdsToAdd",
  "proofExecutionDependenciesToAdd",
] as const;

const DISPOSITIONS = [
  "proof_only",
  "narrative_context",
  "superseded",
  "retired_source",
] as const;

const EXPECTED_DISPOSITION_COUNTS: Record<LinearAuthorityDisposition, number> = {
  proof_only: 21,
  narrative_context: 23,
  superseded: 7,
  retired_source: 10,
};

const LEGACY_TEXT = /\b(?:F-(?:AE-|BC-)?\d+|RG:[a-z0-9_]+|AE-(?:V|\d)[A-Za-z0-9.-]*|D-(?:\d|[A-Z]{2,}-)[A-Za-z0-9.-]*|Sourcera_Master_Spec\.md|Master Spec)\b/i;

function fail(message: string): never {
  throw new Error(`Linear authority semantic plan: ${message}`);
}

function record(value: unknown, path: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${path} must be an object type`);
  }
  return value as JsonRecord;
}

function exactKeys(value: JsonRecord, expected: readonly string[], path: string): void {
  const expectedSet = new Set(expected);
  const unknown = Object.keys(value).filter((key) => !expectedSet.has(key));
  const missing = expected.filter((key) => !Object.hasOwn(value, key));
  if (unknown.length > 0 || missing.length > 0) {
    fail(`${path} keys differ; unknown=[${unknown.join(", ")}], required missing=[${missing.join(", ")}]`);
  }
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(`${path} must be an array type`);
  return value;
}

function nonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string") fail(`${path} must be a string type`);
  if (value.length === 0 || value.trim() !== value) fail(`${path} must be a trimmed non-empty string`);
  return value;
}

function nullableString(value: unknown, path: string): string | null {
  if (value === null) return null;
  return nonEmptyString(value, path);
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(`${path} must be a boolean type`);
  return value;
}

function nonNegativeInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) fail(`${path} must be a non-negative integer type`);
  return value as number;
}

function boundedInteger(value: unknown, minimum: number, maximum: number, path: string): number {
  const parsed = nonNegativeInteger(value, path);
  if (parsed < minimum || parsed > maximum) fail(`${path} integer must be between ${minimum} and ${maximum}`);
  return parsed;
}

function strings(value: unknown, path: string): string[] {
  return array(value, path).map((entry, index) => nonEmptyString(entry, `${path}[${index}]`));
}

function assertUnique(values: readonly string[], path: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${path} contains duplicate value ${value}`);
    seen.add(value);
  }
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort(compare);
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && sorted(left).every((value, index) => value === sorted(right)[index]);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort(compare).map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseCounts(value: unknown): ParsedCounts {
  const row = record(value, "counts");
  exactKeys(row, COUNT_KEYS, "counts");
  return Object.fromEntries(COUNT_KEYS.map((key) => [key, nonNegativeInteger(row[key], `counts.${key}`)])) as unknown as ParsedCounts;
}

function parseResolution(value: unknown, path: string): LinearAuthorityDispositionResolution {
  const row = record(value, path);
  exactKeys(row, RESOLUTION_KEYS, path);
  return {
    viaDisposition: nonEmptyString(row.viaDisposition, `${path}.viaDisposition`),
    requirement: nullableString(row.requirement, `${path}.requirement`),
    proofExecution: nullableString(row.proofExecution, `${path}.proofExecution`),
  };
}

function parseRequirement(value: unknown, index: number): ParsedRequirement {
  const path = `requirements[${index}]`;
  const row = record(value, path);
  exactKeys(row, REQUIREMENT_KEYS, path);
  const state = nonEmptyString(row.state, `${path}.state`);
  if (state !== "Approved") fail(`${path}.state must be Approved`);
  const labels = strings(row.labels, `${path}.labels`);
  if (labels.length !== 1 || labels[0] !== "Requirement") {
    fail(`${path} semantic label must be exactly Requirement and must be resolved to native label identity later`);
  }
  const legacyIds = strings(row.legacyIds, `${path}.legacyIds`);
  const execution = strings(row.execution, `${path}.execution`);
  if (execution.length === 0) fail(`${path}.execution must be a non-empty array`);
  const parsed: ParsedRequirement = {
    canonicalLegacyId: nonEmptyString(row.canonicalLegacyId, `${path}.canonicalLegacyId`),
    legacyIds,
    title: nonEmptyString(row.title, `${path}.title`),
    description: nonEmptyString(row.description, `${path}.description`),
    project: nonEmptyString(row.project, `${path}.project`),
    state: "Approved",
    labels: ["Requirement"],
    priority: boundedInteger(row.priority, 0, 4, `${path}.priority`),
    execution,
    primaryExecution: nonEmptyString(row.primaryExecution, `${path}.primaryExecution`),
    sourceAnchor: nonEmptyString(row.sourceAnchor, `${path}.sourceAnchor`),
    sourceDependencyLegacyIds: strings(row.sourceDependencyLegacyIds, `${path}.sourceDependencyLegacyIds`),
    normalizedDependencyLegacyIds: strings(row.normalizedDependencyLegacyIds, `${path}.normalizedDependencyLegacyIds`),
    requirementDependencyLegacyIds: strings(row.requirementDependencyLegacyIds, `${path}.requirementDependencyLegacyIds`),
    proofExecutionDependencies: strings(row.proofExecutionDependencies, `${path}.proofExecutionDependencies`),
    dispositionResolutions: array(row.dispositionResolutions, `${path}.dispositionResolutions`)
      .map((entry, resolutionIndex) => parseResolution(entry, `${path}.dispositionResolutions[${resolutionIndex}]`)),
    publicationRank: boundedInteger(row.publicationRank, 1, 926, `${path}.publicationRank`),
  };
  for (const [name, values] of [
    ["legacyIds", parsed.legacyIds],
    ["execution", parsed.execution],
    ["sourceDependencyLegacyIds", parsed.sourceDependencyLegacyIds],
    ["normalizedDependencyLegacyIds", parsed.normalizedDependencyLegacyIds],
    ["requirementDependencyLegacyIds", parsed.requirementDependencyLegacyIds],
    ["proofExecutionDependencies", parsed.proofExecutionDependencies],
  ] as const) assertUnique(values, `${path}.${name}`);
  if (parsed.legacyIds.length !== 1 || parsed.legacyIds[0] !== parsed.canonicalLegacyId) {
    fail(`${path} legacy identity must be the singleton canonicalLegacyId`);
  }
  if (!parsed.execution.includes(parsed.primaryExecution)) fail(`${path}.primaryExecution must be an execution endpoint`);
  if (LEGACY_TEXT.test(parsed.title) || LEGACY_TEXT.test(parsed.description)) {
    fail(`${path} leaks a legacy identity into title or description`);
  }
  return parsed;
}

function isDisposition(value: string): value is LinearAuthorityDisposition {
  return (DISPOSITIONS as readonly string[]).includes(value);
}

function parseDecision(value: unknown, index: number): ParsedDecision {
  const path = `decisions[${index}]`;
  const row = record(value, path);
  exactKeys(row, DECISION_KEYS, path);
  const dispositionText = nonEmptyString(row.disposition, `${path}.disposition`);
  if (!isDisposition(dispositionText)) fail(`${path}.disposition is unsupported`);
  const expectedState = dispositionText === "proof_only"
    ? "Approved"
    : dispositionText === "superseded"
      ? "Superseded"
      : "Retired";
  const state = nonEmptyString(row.state, `${path}.state`);
  if (state !== expectedState) fail(`${path}.state must be ${expectedState} for disposition ${dispositionText}`);
  const labels = strings(row.labels, `${path}.labels`);
  if (labels.length !== 1 || labels[0] !== "Decision") {
    fail(`${path} semantic label must be exactly Decision and must be resolved to native label identity later`);
  }
  const parsed: ParsedDecision = {
    legacyId: nonEmptyString(row.legacyId, `${path}.legacyId`),
    disposition: dispositionText,
    title: nonEmptyString(row.title, `${path}.title`),
    description: nonEmptyString(row.description, `${path}.description`),
    project: nonEmptyString(row.project, `${path}.project`),
    state: expectedState,
    labels: ["Decision"],
    priority: boundedInteger(row.priority, 0, 4, `${path}.priority`),
    existingRelations: strings(row.existingRelations, `${path}.existingRelations`),
    requirementRelations: strings(row.requirementRelations, `${path}.requirementRelations`),
    sourceDependencyLegacyIds: strings(row.sourceDependencyLegacyIds, `${path}.sourceDependencyLegacyIds`),
    normalizedDependencyLegacyIds: strings(row.normalizedDependencyLegacyIds, `${path}.normalizedDependencyLegacyIds`),
  };
  for (const [name, values] of [
    ["existingRelations", parsed.existingRelations],
    ["requirementRelations", parsed.requirementRelations],
    ["sourceDependencyLegacyIds", parsed.sourceDependencyLegacyIds],
    ["normalizedDependencyLegacyIds", parsed.normalizedDependencyLegacyIds],
  ] as const) assertUnique(values, `${path}.${name}`);
  if (parsed.disposition === "proof_only" && parsed.existingRelations.length !== 1) {
    fail(`${path} proof_only disposition must have exactly one proof endpoint`);
  }
  if (parsed.disposition !== "proof_only" && parsed.existingRelations.length !== 0) {
    fail(`${path} only proof_only dispositions may have proof endpoints`);
  }
  if (LEGACY_TEXT.test(parsed.title) || LEGACY_TEXT.test(parsed.description)) {
    fail(`${path} leaks a legacy identity into title or description`);
  }
  return parsed;
}

function parseReconciliation(
  value: unknown,
  index: number,
): LinearAuthorityExistingRequirementReconciliationProjection {
  const path = `existingRequirementReconciliation[${index}]`;
  const row = record(value, path);
  exactKeys(row, RECONCILIATION_KEYS, path);
  const frozenDuringCapture = boolean(row.frozenDuringCapture, `${path}.frozenDuringCapture`);
  if (!frozenDuringCapture) fail(`${path}.frozenDuringCapture must be true`);
  const parsed: LinearAuthorityExistingRequirementReconciliationProjection = {
    issueIdentifier: nonEmptyString(row.issueIdentifier, `${path}.issueIdentifier`),
    canonicalLegacyId: nonEmptyString(row.canonicalLegacyId, `${path}.canonicalLegacyId`),
    frozenDuringCapture: true,
    descriptionUpdateRequired: boolean(row.descriptionUpdateRequired, `${path}.descriptionUpdateRequired`),
    executionRelationsToAdd: strings(row.executionRelationsToAdd, `${path}.executionRelationsToAdd`),
    requirementDependencyLegacyIdsToAdd: strings(row.requirementDependencyLegacyIdsToAdd, `${path}.requirementDependencyLegacyIdsToAdd`),
    proofExecutionDependenciesToAdd: strings(row.proofExecutionDependenciesToAdd, `${path}.proofExecutionDependenciesToAdd`),
  };
  assertUnique(parsed.executionRelationsToAdd, `${path}.executionRelationsToAdd`);
  assertUnique(parsed.requirementDependencyLegacyIdsToAdd, `${path}.requirementDependencyLegacyIdsToAdd`);
  assertUnique(parsed.proofExecutionDependenciesToAdd, `${path}.proofExecutionDependenciesToAdd`);
  return parsed;
}

function assertReportedCount(reported: ParsedCounts, key: keyof ParsedCounts, derived: number): void {
  if (reported[key] !== derived) fail(`counts.${key}=${reported[key]} differs from derived ${derived}`);
}

function semanticTitleKey(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US");
}

function normalizedRequirementProjection(row: ParsedRequirement): LinearAuthoritySemanticRequirementProjection {
  return {
    canonicalLegacyId: row.canonicalLegacyId,
    legacyIds: sorted(row.legacyIds),
    title: row.title,
    description: row.description,
    project: row.project,
    state: "Approved",
    semanticRole: "requirement",
    priority: row.priority,
    execution: sorted(row.execution),
    primaryExecution: row.primaryExecution,
    sourceAnchor: row.sourceAnchor,
    sourceDependencyLegacyIds: sorted(row.sourceDependencyLegacyIds),
    normalizedDependencyLegacyIds: sorted(row.normalizedDependencyLegacyIds),
    requirementDependencyLegacyIds: sorted(row.requirementDependencyLegacyIds),
    proofExecutionDependencies: sorted(row.proofExecutionDependencies),
    dispositionResolutions: [...row.dispositionResolutions]
      .sort((left, right) => compare(
        `${left.viaDisposition}\0${left.requirement ?? ""}\0${left.proofExecution ?? ""}`,
        `${right.viaDisposition}\0${right.requirement ?? ""}\0${right.proofExecution ?? ""}`,
      )),
    publicationRank: row.publicationRank,
  };
}

function normalizedDecisionProjection(row: ParsedDecision): LinearAuthoritySemanticDecisionProjection {
  return {
    legacyId: row.legacyId,
    disposition: row.disposition,
    title: row.title,
    description: row.description,
    project: row.project,
    state: row.state,
    semanticRole: "decision",
    priority: row.priority,
    existingRelations: sorted(row.existingRelations),
    requirementRelations: sorted(row.requirementRelations),
    sourceDependencyLegacyIds: sorted(row.sourceDependencyLegacyIds),
    normalizedDependencyLegacyIds: sorted(row.normalizedDependencyLegacyIds),
  };
}

export function validateLinearAuthoritySemanticPlan(input: unknown): ValidatedLinearAuthoritySemanticPlan {
  const root = record(input, "root");
  exactKeys(root, TOP_LEVEL_KEYS, "root");
  const schemaVersion = nonNegativeInteger(root.schemaVersion, "schemaVersion");
  if (schemaVersion !== LINEAR_AUTHORITY_SEMANTIC_PLAN_SCHEMA_VERSION) {
    fail(`schemaVersion must be ${LINEAR_AUTHORITY_SEMANTIC_PLAN_SCHEMA_VERSION}`);
  }
  const reportedCounts = parseCounts(root.counts);
  const requirements = array(root.requirements, "requirements").map(parseRequirement);
  const decisions = array(root.decisions, "decisions").map(parseDecision);
  const reconciliations = array(root.existingRequirementReconciliation, "existingRequirementReconciliation")
    .map(parseReconciliation);
  const publicationSequence = strings(root.publicationSequence, "publicationSequence");

  if (requirements.length !== 926) fail(`requirements must contain exactly 926 rows`);
  if (decisions.length !== 61) fail(`decisions must contain exactly 61 disposition rows`);

  const requirementById = new Map<string, ParsedRequirement>();
  const decisionById = new Map<string, ParsedDecision>();
  const allLegacyIds = new Set<string>();
  const titles = new Map<string, string>();
  const executionOwners = new Map<string, string>();
  const proofOwners = new Map<string, string>();

  for (const row of requirements) {
    if (requirementById.has(row.canonicalLegacyId) || allLegacyIds.has(row.canonicalLegacyId)) {
      fail(`duplicate requirement identity ${row.canonicalLegacyId}`);
    }
    requirementById.set(row.canonicalLegacyId, row);
    for (const legacyId of row.legacyIds) {
      if (allLegacyIds.has(legacyId)) fail(`legacy identity duplicate ${legacyId}`);
      allLegacyIds.add(legacyId);
    }
    const titleKey = semanticTitleKey(row.title);
    if (titles.has(titleKey)) fail(`title duplicate ${row.title}`);
    titles.set(titleKey, row.canonicalLegacyId);
    for (const endpoint of row.execution) {
      const owner = executionOwners.get(endpoint);
      if (owner) fail(`execution endpoint ${endpoint} has duplicate owners ${owner} and ${row.canonicalLegacyId}`);
      executionOwners.set(endpoint, row.canonicalLegacyId);
    }
  }

  const dispositionClasses: Record<LinearAuthorityDisposition, number> = {
    proof_only: 0,
    narrative_context: 0,
    superseded: 0,
    retired_source: 0,
  };
  for (const row of decisions) {
    if (decisionById.has(row.legacyId) || allLegacyIds.has(row.legacyId)) {
      fail(`legacy identity duplicate ${row.legacyId}`);
    }
    decisionById.set(row.legacyId, row);
    allLegacyIds.add(row.legacyId);
    dispositionClasses[row.disposition] += 1;
    const titleKey = semanticTitleKey(row.title);
    if (titles.has(titleKey)) fail(`title duplicate ${row.title}`);
    titles.set(titleKey, row.legacyId);
    for (const endpoint of row.existingRelations) {
      const owner = proofOwners.get(endpoint);
      if (owner) fail(`proof endpoint ${endpoint} has duplicate disposition owners ${owner} and ${row.legacyId}`);
      if (executionOwners.has(endpoint)) fail(`proof endpoint ${endpoint} is already an execution endpoint`);
      proofOwners.set(endpoint, row.legacyId);
    }
  }
  for (const disposition of DISPOSITIONS) {
    if (dispositionClasses[disposition] !== EXPECTED_DISPOSITION_COUNTS[disposition]) {
      fail(`disposition count for ${disposition} must be ${EXPECTED_DISPOSITION_COUNTS[disposition]}`);
    }
  }

  let rawSourceDependencyEdges = 0;
  let normalizedDependencyEdges = 0;
  let dependencyRepairAdditions = 0;
  let executableNativeRequirementEdges = 0;
  let executableProofDependencyEdges = 0;
  let collapsedDispositionDependencyEdges = 0;

  const assertDependencyLists = (
    identity: string,
    sourceDependencies: readonly string[],
    normalizedDependencies: readonly string[],
  ): void => {
    const normalizedSet = new Set(normalizedDependencies);
    for (const dependency of sourceDependencies) {
      if (!normalizedSet.has(dependency)) fail(`${identity} source dependency ${dependency} was removed from normalized dependencies`);
    }
    for (const dependency of normalizedDependencies) {
      if (!allLegacyIds.has(dependency)) fail(`${identity} dependency endpoint ${dependency} is unknown`);
      if (dependency === identity) fail(`${identity} cannot depend on itself`);
    }
    rawSourceDependencyEdges += sourceDependencies.length;
    normalizedDependencyEdges += normalizedDependencies.length;
    dependencyRepairAdditions += normalizedDependencies.filter((dependency) => !sourceDependencies.includes(dependency)).length;
  };

  for (const row of decisions) {
    assertDependencyLists(row.legacyId, row.sourceDependencyLegacyIds, row.normalizedDependencyLegacyIds);
    for (const endpoint of row.requirementRelations) {
      if (!requirementById.has(endpoint)) fail(`decision ${row.legacyId} requirement relation endpoint ${endpoint} is unknown`);
    }
    const directRequirementDependencies = row.normalizedDependencyLegacyIds.filter((dependency) => requirementById.has(dependency));
    for (const dependency of directRequirementDependencies) {
      if (!row.requirementRelations.includes(dependency)) {
        fail(`decision ${row.legacyId} omits normalized requirement relation ${dependency}`);
      }
    }
    if (row.disposition !== "superseded" && !sameSet(row.requirementRelations, directRequirementDependencies)) {
      fail(`decision ${row.legacyId} has requirement relations unrelated to its normalized dependencies`);
    }
  }

  for (const row of requirements) {
    assertDependencyLists(row.canonicalLegacyId, row.sourceDependencyLegacyIds, row.normalizedDependencyLegacyIds);
    const resolutionByDisposition = new Map<string, LinearAuthorityDispositionResolution>();
    for (const resolution of row.dispositionResolutions) {
      if (resolutionByDisposition.has(resolution.viaDisposition)) {
        fail(`requirement ${row.canonicalLegacyId} has duplicate resolution for ${resolution.viaDisposition}`);
      }
      resolutionByDisposition.set(resolution.viaDisposition, resolution);
      const decision = decisionById.get(resolution.viaDisposition);
      if (!decision) fail(`requirement ${row.canonicalLegacyId} resolution viaDisposition is unknown`);
      if (!row.normalizedDependencyLegacyIds.includes(resolution.viaDisposition)) {
        fail(`requirement ${row.canonicalLegacyId} resolution is not a normalized dependency`);
      }
      const targetCount = Number(resolution.requirement !== null) + Number(resolution.proofExecution !== null);
      if (targetCount !== 1) fail(`requirement ${row.canonicalLegacyId} resolution must select exactly one endpoint`);
      if (resolution.requirement !== null) {
        if (decision.disposition !== "superseded") fail(`requirement resolution through ${decision.disposition} must use proof endpoint`);
        if (!requirementById.has(resolution.requirement)) fail(`requirement resolution endpoint ${resolution.requirement} is unknown`);
        if (!decision.requirementRelations.includes(resolution.requirement)) {
          fail(`superseded resolution ${resolution.viaDisposition} omits its requirement relation endpoint`);
        }
      }
      if (resolution.proofExecution !== null) {
        if (decision.disposition !== "proof_only") fail(`proof resolution must use a proof_only disposition`);
        if (!decision.existingRelations.includes(resolution.proofExecution) || !proofOwners.has(resolution.proofExecution)) {
          fail(`proof resolution endpoint ${resolution.proofExecution} is unknown`);
        }
      }
    }

    const resolvedRequirements: string[] = [];
    const resolvedProof: string[] = [];
    for (const dependency of row.normalizedDependencyLegacyIds) {
      if (requirementById.has(dependency)) {
        resolvedRequirements.push(dependency);
        continue;
      }
      const resolution = resolutionByDisposition.get(dependency);
      if (!resolution) fail(`requirement ${row.canonicalLegacyId} dependency ${dependency} lacks a disposition resolution`);
      if (resolution.requirement !== null) resolvedRequirements.push(resolution.requirement);
      if (resolution.proofExecution !== null) resolvedProof.push(resolution.proofExecution);
    }
    if (resolutionByDisposition.size !== row.normalizedDependencyLegacyIds.filter((dependency) => decisionById.has(dependency)).length) {
      fail(`requirement ${row.canonicalLegacyId} has an extraneous disposition resolution`);
    }
    const uniqueResolvedRequirements = [...new Set(resolvedRequirements)];
    const uniqueResolvedProof = [...new Set(resolvedProof)];
    if (!sameSet(row.requirementDependencyLegacyIds, uniqueResolvedRequirements)) {
      fail(`requirement ${row.canonicalLegacyId} resolved dependency projection differs from requirementDependencyLegacyIds`);
    }
    if (!sameSet(row.proofExecutionDependencies, uniqueResolvedProof)) {
      fail(`requirement ${row.canonicalLegacyId} resolved proof dependency projection differs from proofExecutionDependencies`);
    }
    executableNativeRequirementEdges += row.requirementDependencyLegacyIds.length;
    executableProofDependencyEdges += row.proofExecutionDependencies.length;
    collapsedDispositionDependencyEdges += resolvedRequirements.length + resolvedProof.length
      - uniqueResolvedRequirements.length - uniqueResolvedProof.length;
  }

  if (rawSourceDependencyEdges !== 1246) fail(`rawSourceDependencyEdges must derive to 1246, got ${rawSourceDependencyEdges}`);
  if (dependencyRepairAdditions !== 114) fail(`dependency repair additions must derive to 114, got ${dependencyRepairAdditions}`);
  if (normalizedDependencyEdges !== 1360) fail(`normalizedDependencyEdges must derive to 1360, got ${normalizedDependencyEdges}`);
  if (executableNativeRequirementEdges !== 1296) fail(`executable native requirement edges must derive to 1296, got ${executableNativeRequirementEdges}`);
  if (executableProofDependencyEdges !== 2) fail(`executable proof dependency edges must derive to 2, got ${executableProofDependencyEdges}`);
  if (collapsedDispositionDependencyEdges !== 1) fail(`exactly one superseded dependency must collapse onto an existing requirement edge`);

  const sourceSplitRows = requirements.filter((row) => row.execution.length > 1).length;
  const splitExecutionRelations = requirements.reduce((total, row) => total + row.execution.length - 1, 0);
  if (sourceSplitRows !== 37) fail(`source split row count must be 37, got ${sourceSplitRows}`);
  if (splitExecutionRelations !== 102) fail(`split execution relation count must be 102, got ${splitExecutionRelations}`);

  assertUnique(publicationSequence, "publicationSequence");
  if (publicationSequence.length !== 926 || !sameSet(publicationSequence, [...requirementById.keys()])) {
    fail(`publication sequence coverage must contain all 926 requirements exactly once`);
  }
  const publicationRank = new Map(publicationSequence.map((identity, index) => [identity, index + 1]));
  let dependencyOrderViolations = 0;
  for (const row of requirements) {
    const rank = publicationRank.get(row.canonicalLegacyId)!;
    if (row.publicationRank !== rank) fail(`publication rank differs for ${row.canonicalLegacyId}`);
    for (const dependency of row.requirementDependencyLegacyIds) {
      if (publicationRank.get(dependency)! >= rank) dependencyOrderViolations += 1;
    }
  }
  if (dependencyOrderViolations !== 0) fail(`dependency topological order has ${dependencyOrderViolations} violation(s)`);

  const reconciliationIdentifiers = new Set<string>();
  const reconciledRequirements = new Set<string>();
  for (const row of reconciliations) {
    if (reconciliationIdentifiers.has(row.issueIdentifier)) {
      fail(`reconciliation identifier duplicate ${row.issueIdentifier}`);
    }
    reconciliationIdentifiers.add(row.issueIdentifier);
    if (reconciledRequirements.has(row.canonicalLegacyId)) {
      fail(`reconciliation requirement duplicate ${row.canonicalLegacyId}`);
    }
    reconciledRequirements.add(row.canonicalLegacyId);
    const requirement = requirementById.get(row.canonicalLegacyId);
    if (!requirement) fail(`reconciliation requirement ${row.canonicalLegacyId} is unknown`);
    if (!row.executionRelationsToAdd.every((endpoint) => requirement.execution.includes(endpoint))) {
      fail(`execution reconciliation delta for ${row.issueIdentifier} is not planned`);
    }
    if (!row.requirementDependencyLegacyIdsToAdd.every((endpoint) => requirement.requirementDependencyLegacyIds.includes(endpoint))) {
      fail(`dependency reconciliation delta for ${row.issueIdentifier} is not planned`);
    }
    if (!row.proofExecutionDependenciesToAdd.every((endpoint) => requirement.proofExecutionDependencies.includes(endpoint))) {
      fail(`proof reconciliation delta for ${row.issueIdentifier} is not planned`);
    }
  }

  const existingRequirementsVerified = reconciliations.length;
  const existingDescriptionsToUpdate = reconciliations.filter((row) => row.descriptionUpdateRequired).length;
  const existingExecutionRelationsToAdd = reconciliations.reduce(
    (total, row) => total + row.executionRelationsToAdd.length,
    0,
  );
  const existingRequirementDependencyRelationsToAdd = reconciliations.reduce(
    (total, row) => total + row.requirementDependencyLegacyIdsToAdd.length,
    0,
  );
  const existingProofExecutionRelationsToAdd = reconciliations.reduce(
    (total, row) => total + row.proofExecutionDependenciesToAdd.length,
    0,
  );
  if (existingRequirementsVerified !== 61) {
    fail(`schema v3 requires exactly 61 reconciliation rows; a fresh 186-row capture requires schema v4`);
  }
  const expectedReconciliationIdentifiers = Array.from({ length: 61 }, (_, index) => `REQ-${index + 1}`);
  if (!sameSet([...reconciliationIdentifiers], expectedReconciliationIdentifiers)) {
    fail(`reconciliation identifier set must be exactly REQ-1 through REQ-61`);
  }
  if (existingDescriptionsToUpdate !== 61) fail(`schema v3 requires exactly 61 description updates`);
  if (existingExecutionRelationsToAdd !== 14) fail(`schema v3 requires exactly 14 execution relation additions`);
  if (existingRequirementDependencyRelationsToAdd !== 64) {
    fail(`schema v3 requires exactly 64 requirement dependency relation additions`);
  }
  if (existingProofExecutionRelationsToAdd !== 0) fail(`schema v3 proof relation additions must be zero`);
  assertReportedCount(reportedCounts, "requirements", requirements.length);
  assertReportedCount(reportedCounts, "dispositionDecisions", decisions.length);
  assertReportedCount(reportedCounts, "rawSourceDependencyEdges", rawSourceDependencyEdges);
  assertReportedCount(reportedCounts, "dependencyRepairAdditions", dependencyRepairAdditions);
  assertReportedCount(reportedCounts, "normalizedDependencyEdges", normalizedDependencyEdges);
  assertReportedCount(reportedCounts, "executableNativeRequirementEdges", executableNativeRequirementEdges);
  assertReportedCount(reportedCounts, "executableProofDependencyEdges", executableProofDependencyEdges);
  assertReportedCount(reportedCounts, "splitExecutionRelations", splitExecutionRelations);
  assertReportedCount(reportedCounts, "existingRequirementsVerified", existingRequirementsVerified);
  assertReportedCount(reportedCounts, "existingDescriptionsToUpdate", existingDescriptionsToUpdate);
  assertReportedCount(reportedCounts, "existingExecutionRelationsToAdd", existingExecutionRelationsToAdd);

  const derivedCounts: LinearAuthoritySemanticPlanCounts = {
    requirements: requirements.length,
    dispositionDecisions: decisions.length,
    dispositionClasses,
    sourceSplitRows,
    splitExecutionRelations,
    rawSourceDependencyEdges,
    dependencyRepairAdditions,
    normalizedDependencyEdges,
    executableNativeRequirementEdges,
    executableProofDependencyEdges,
    publicationSequenceEntries: publicationSequence.length,
    dependencyOrderViolations,
    existingRequirementsVerified,
    existingDescriptionsToUpdate,
    existingExecutionRelationsToAdd,
    existingRequirementDependencyRelationsToAdd,
    existingProofExecutionRelationsToAdd,
  };

  const projection: LinearAuthoritySemanticProjection = {
    schemaVersion: 3,
    derivedCounts,
    requirements: requirements
      .map(normalizedRequirementProjection)
      .sort((left, right) => compare(left.canonicalLegacyId, right.canonicalLegacyId)),
    decisions: decisions
      .map(normalizedDecisionProjection)
      .sort((left, right) => compare(left.legacyId, right.legacyId)),
    existingRequirementReconciliation: reconciliations
      .map((row) => ({
        ...row,
        executionRelationsToAdd: sorted(row.executionRelationsToAdd),
        requirementDependencyLegacyIdsToAdd: sorted(row.requirementDependencyLegacyIdsToAdd),
        proofExecutionDependenciesToAdd: sorted(row.proofExecutionDependenciesToAdd),
      }))
      .sort((left, right) => compare(left.issueIdentifier, right.issueIdentifier)),
    publicationSequence: [...publicationSequence],
  };

  return {
    semanticPlanInternalsValidated: true,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
    semanticRoot: sha256(canonicalJson(projection)),
    derivedCounts,
    projection,
  };
}

export function parseLinearAuthoritySemanticPlan(
  bytes: string | Uint8Array,
): ValidatedLinearAuthoritySemanticPlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(typeof bytes === "string" ? bytes : Buffer.from(bytes).toString("utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`input is not valid JSON: ${detail}`);
  }
  return validateLinearAuthoritySemanticPlan(parsed);
}
