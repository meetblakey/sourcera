import { readFileSync } from "node:fs";

export const DEFAULT_LINEAR_RUNTIME_PATH_REGISTRY =
  "delivery/linear-runtime-path-registry.json";
export const EXPECTED_LINEAR_RUNTIME_PATH_REGISTRY_ROWS = 63;

export type LinearRuntimePathLane = "product_runtime" | "static_ci" | "hybrid";
export type LinearRuntimePathMappingStatus = "exact_planned";
export type LinearRuntimePathState = "fail_closed_pending_same_commit_proof";

export interface LinearRuntimePathRegistryEntry {
  issueId: string;
  gateId: string;
  lane: LinearRuntimePathLane;
  implementationPaths: string[];
  runtimeTestPaths: string[];
  productionProbePaths: string[];
  ciWorkflowPaths: string[];
  proofPath: string;
  sourceAnchors: string[];
  unresolved: string[];
  mappingStatus: LinearRuntimePathMappingStatus;
  currentRuntimeState: LinearRuntimePathState;
  mustFailClosed: true;
}

export interface LinearRuntimePathRegistry {
  schemaVersion: 1;
  kind: "linear_runtime_path_registry";
  sourceFinding: "runtime_behavior_spec_fixture_only";
  sourceDependencyRegistry: "delivery/runtime-gate-dependencies.json";
  sourceSpec: "Sourcera_Master_Spec.md";
  semantics: {
    mappingStatus: LinearRuntimePathMappingStatus;
    pathPresenceOrRuntimeReadinessIsNotClaimed: true;
    staticCiRowsDoNotReceiveProductHandlers: true;
    runtimeState: LinearRuntimePathState;
    promotionRequiresSameCommitExecutionAndProof: true;
  };
  summary: {
    rowCount: number;
    laneCounts: Record<LinearRuntimePathLane, number>;
    exactPlannedRows: number;
    unresolvedRows: 0;
    allRowsFailClosedPendingProof: true;
  };
  entries: LinearRuntimePathRegistryEntry[];
}

export class LinearRuntimePathRegistryValidationError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`Invalid Linear runtime-path registry:\n- ${problems.join("\n- ")}`);
    this.name = "LinearRuntimePathRegistryValidationError";
    this.problems = problems;
  }
}

const TOP_LEVEL_KEYS = [
  "schemaVersion",
  "kind",
  "sourceFinding",
  "sourceDependencyRegistry",
  "sourceSpec",
  "semantics",
  "summary",
  "entries",
] as const;
const SEMANTICS_KEYS = [
  "mappingStatus",
  "pathPresenceOrRuntimeReadinessIsNotClaimed",
  "staticCiRowsDoNotReceiveProductHandlers",
  "runtimeState",
  "promotionRequiresSameCommitExecutionAndProof",
] as const;
const SUMMARY_KEYS = [
  "rowCount",
  "laneCounts",
  "exactPlannedRows",
  "unresolvedRows",
  "allRowsFailClosedPendingProof",
] as const;
const ENTRY_KEYS = [
  "issueId",
  "gateId",
  "lane",
  "implementationPaths",
  "runtimeTestPaths",
  "productionProbePaths",
  "ciWorkflowPaths",
  "proofPath",
  "sourceAnchors",
  "unresolved",
  "mappingStatus",
  "currentRuntimeState",
  "mustFailClosed",
] as const;
const LANE_COUNT_KEYS: LinearRuntimePathLane[] = [
  "product_runtime",
  "static_ci",
  "hybrid",
];

const ISSUE_ID = /^(?:BUY|PLA|SEL)-\d+$/;
const GATE_ID = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/;
const REPOSITORY_PATH = /^(?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+$/;
const PRODUCT_IMPLEMENTATION = /^(?:app|apps|components|convex|lib|packages)\//;
const STATIC_IMPLEMENTATION = /^(?:tools|infra)\//;
const IMPLEMENTATION_EXTENSION = /\.(?:ts|tsx|js|jsx|mjs|cjs|tf)$/;
const RUNTIME_TEST = /^tests\/.+\.(?:spec|test)\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
const PRODUCTION_PROBE = /^synthetics\/.+\.(?:ts|tsx|js|mjs|cjs)$/;
const CI_WORKFLOW = /^\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml$/;
const PROOF_PATH = /^reports\/evidence\/[a-z][a-z0-9_]+-runtime-proof\.json$/;
const APPENDIX_M_ANCHOR = /^Sourcera_Master_Spec\.md:\d+ \(Appendix M gate row\)$/;

const APP_CI = ".github/workflows/app-ci.yml";
const SPEC_LINT_CI = ".github/workflows/spec-lint.yml";
const DEPLOY_VALIDATOR_CI = ".github/workflows/deploy-validator.yml";
const TEST_STRATEGY_CI = ".github/workflows/test-strategy.yml";
const PRODUCTION_RELEASE_CI = ".github/workflows/production-release.yml";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(
  value: unknown,
  at: string,
  problems: string[],
): UnknownRecord | null {
  if (isRecord(value)) return value;
  problems.push(`${at} must be an object`);
  return null;
}

function requireExactKeys(
  value: UnknownRecord,
  allowed: readonly string[],
  at: string,
  problems: string[],
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) problems.push(`${at} contains unsupported key ${key}`);
  }
  for (const key of allowed) {
    if (!(key in value)) problems.push(`${at} is missing ${key}`);
  }
}

function requireLiteral(
  value: unknown,
  expected: string | number | boolean,
  at: string,
  problems: string[],
): void {
  if (value !== expected) problems.push(`${at} must equal ${JSON.stringify(expected)}`);
}

function requireString(
  value: unknown,
  at: string,
  problems: string[],
): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  problems.push(`${at} must be a non-empty string`);
  return null;
}

function requireStringArray(
  value: unknown,
  at: string,
  problems: string[],
): string[] {
  if (!Array.isArray(value)) {
    problems.push(`${at} must be an array`);
    return [];
  }
  const strings: string[] = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || item.length === 0) {
      problems.push(`${at}[${index}] must be a non-empty string`);
      continue;
    }
    strings.push(item);
  }
  if (new Set(strings).size !== strings.length) problems.push(`${at} must not contain duplicates`);
  return strings;
}

function validateRepositoryPath(value: string, at: string, problems: string[]): void {
  if (
    value !== value.trim() ||
    value.includes("\\") ||
    value.includes("//") ||
    value.split("/").some((part) => part === "." || part === "..") ||
    !REPOSITORY_PATH.test(value)
  ) {
    problems.push(`${at} must be a normalized repository-relative path`);
  }
}

function validatePaths(
  paths: string[],
  role: "implementation" | "runtime_test" | "production_probe" | "ci_workflow",
  at: string,
  problems: string[],
): void {
  for (const [index, value] of paths.entries()) {
    const pathAt = `${at}[${index}]`;
    validateRepositoryPath(value, pathAt, problems);
    const valid = role === "implementation"
      ? (PRODUCT_IMPLEMENTATION.test(value) || STATIC_IMPLEMENTATION.test(value)) &&
        IMPLEMENTATION_EXTENSION.test(value)
      : role === "runtime_test"
      ? RUNTIME_TEST.test(value)
      : role === "production_probe"
      ? PRODUCTION_PROBE.test(value)
      : CI_WORKFLOW.test(value);
    if (!valid) problems.push(`${pathAt} is not a valid ${role} path`);
  }
}

function validateLane(
  lane: LinearRuntimePathLane,
  implementationPaths: string[],
  runtimeTestPaths: string[],
  productionProbePaths: string[],
  ciWorkflowPaths: string[],
  at: string,
  problems: string[],
): void {
  const productPaths = implementationPaths.filter((value) => PRODUCT_IMPLEMENTATION.test(value));
  const staticPaths = implementationPaths.filter((value) => STATIC_IMPLEMENTATION.test(value));
  const hasStaticWorkflow = ciWorkflowPaths.includes(SPEC_LINT_CI) ||
    ciWorkflowPaths.includes(DEPLOY_VALIDATOR_CI);

  if (implementationPaths.length === 0) problems.push(`${at}.implementationPaths must not be empty`);

  if (lane === "static_ci") {
    if (productPaths.length > 0) problems.push(`${at} static_ci rows cannot name product handlers`);
    if (staticPaths.length !== implementationPaths.length) {
      problems.push(`${at} static_ci implementation paths must use tools/ or infra/`);
    }
    if (productionProbePaths.length > 0) problems.push(`${at} static_ci rows cannot name production probes`);
    if (!hasStaticWorkflow && !ciWorkflowPaths.includes(APP_CI)) {
      problems.push(`${at} static_ci rows require an application, spec-lint, or deploy-validator workflow`);
    }
    if (ciWorkflowPaths.includes(TEST_STRATEGY_CI) || ciWorkflowPaths.includes(PRODUCTION_RELEASE_CI)) {
      problems.push(`${at} static_ci rows cannot use runtime or production-release workflows`);
    }
    return;
  }

  if (productPaths.length === 0) problems.push(`${at} ${lane} rows require a product implementation path`);
  if (runtimeTestPaths.length === 0) problems.push(`${at} ${lane} rows require an executable runtime test`);
  if (!ciWorkflowPaths.includes(APP_CI) || !ciWorkflowPaths.includes(TEST_STRATEGY_CI)) {
    problems.push(`${at} ${lane} rows require app-ci and test-strategy workflows`);
  }

  if (lane === "product_runtime" && staticPaths.length > 0) {
    problems.push(`${at} product_runtime rows cannot use static implementation paths`);
  }
  if (lane === "hybrid" && !hasStaticWorkflow) {
    problems.push(`${at} hybrid rows require spec-lint or deploy-validator CI`);
  }
  if (productionProbePaths.length > 0 && !ciWorkflowPaths.includes(PRODUCTION_RELEASE_CI)) {
    problems.push(`${at} production probes require the production-release workflow`);
  }
}

function validateEntry(
  value: unknown,
  index: number,
  issueIds: Set<string>,
  gateIds: Set<string>,
  problems: string[],
): LinearRuntimePathLane | null {
  const at = `entries[${index}]`;
  const entry = requireRecord(value, at, problems);
  if (!entry) return null;
  requireExactKeys(entry, ENTRY_KEYS, at, problems);

  const issueId = requireString(entry.issueId, `${at}.issueId`, problems);
  const gateId = requireString(entry.gateId, `${at}.gateId`, problems);
  const lane = requireString(entry.lane, `${at}.lane`, problems);
  const implementationPaths = requireStringArray(entry.implementationPaths, `${at}.implementationPaths`, problems);
  const runtimeTestPaths = requireStringArray(entry.runtimeTestPaths, `${at}.runtimeTestPaths`, problems);
  const productionProbePaths = requireStringArray(entry.productionProbePaths, `${at}.productionProbePaths`, problems);
  const ciWorkflowPaths = requireStringArray(entry.ciWorkflowPaths, `${at}.ciWorkflowPaths`, problems);
  const proofPath = requireString(entry.proofPath, `${at}.proofPath`, problems);
  const sourceAnchors = requireStringArray(entry.sourceAnchors, `${at}.sourceAnchors`, problems);
  const unresolved = requireStringArray(entry.unresolved, `${at}.unresolved`, problems);

  requireLiteral(entry.mappingStatus, "exact_planned", `${at}.mappingStatus`, problems);
  requireLiteral(
    entry.currentRuntimeState,
    "fail_closed_pending_same_commit_proof",
    `${at}.currentRuntimeState`,
    problems,
  );
  requireLiteral(entry.mustFailClosed, true, `${at}.mustFailClosed`, problems);

  if (issueId) {
    if (!ISSUE_ID.test(issueId)) problems.push(`${at}.issueId is invalid`);
    if (issueIds.has(issueId)) problems.push(`${at}.issueId duplicates ${issueId}`);
    issueIds.add(issueId);
  }
  if (gateId) {
    if (!GATE_ID.test(gateId)) problems.push(`${at}.gateId is invalid`);
    if (gateIds.has(gateId)) problems.push(`${at}.gateId duplicates ${gateId}`);
    gateIds.add(gateId);
  }

  const validLane = lane === "product_runtime" || lane === "static_ci" || lane === "hybrid"
    ? lane
    : null;
  if (!validLane) problems.push(`${at}.lane is invalid`);

  validatePaths(implementationPaths, "implementation", `${at}.implementationPaths`, problems);
  validatePaths(runtimeTestPaths, "runtime_test", `${at}.runtimeTestPaths`, problems);
  validatePaths(productionProbePaths, "production_probe", `${at}.productionProbePaths`, problems);
  validatePaths(ciWorkflowPaths, "ci_workflow", `${at}.ciWorkflowPaths`, problems);

  if (proofPath) {
    validateRepositoryPath(proofPath, `${at}.proofPath`, problems);
    if (!PROOF_PATH.test(proofPath)) problems.push(`${at}.proofPath is not a runtime proof receipt`);
    if (gateId && proofPath !== `reports/evidence/${gateId}-runtime-proof.json`) {
      problems.push(`${at}.proofPath must be named from its gateId`);
    }
  }
  if (sourceAnchors.length === 0) problems.push(`${at}.sourceAnchors must not be empty`);
  if (!sourceAnchors.some((anchor) => APPENDIX_M_ANCHOR.test(anchor))) {
    problems.push(`${at}.sourceAnchors must contain the exact Appendix M row`);
  }
  if (unresolved.length > 0) problems.push(`${at}.unresolved must be empty`);

  if (validLane) {
    validateLane(
      validLane,
      implementationPaths,
      runtimeTestPaths,
      productionProbePaths,
      ciWorkflowPaths,
      at,
      problems,
    );
  }
  return validLane;
}

export function validateLinearRuntimePathRegistry(
  value: unknown,
): LinearRuntimePathRegistry {
  const problems: string[] = [];
  const registry = requireRecord(value, "registry", problems);
  if (!registry) throw new LinearRuntimePathRegistryValidationError(problems);
  requireExactKeys(registry, TOP_LEVEL_KEYS, "registry", problems);

  requireLiteral(registry.schemaVersion, 1, "registry.schemaVersion", problems);
  requireLiteral(registry.kind, "linear_runtime_path_registry", "registry.kind", problems);
  requireLiteral(
    registry.sourceFinding,
    "runtime_behavior_spec_fixture_only",
    "registry.sourceFinding",
    problems,
  );
  requireLiteral(
    registry.sourceDependencyRegistry,
    "delivery/runtime-gate-dependencies.json",
    "registry.sourceDependencyRegistry",
    problems,
  );
  requireLiteral(registry.sourceSpec, "Sourcera_Master_Spec.md", "registry.sourceSpec", problems);

  const semantics = requireRecord(registry.semantics, "registry.semantics", problems);
  if (semantics) {
    requireExactKeys(semantics, SEMANTICS_KEYS, "registry.semantics", problems);
    requireLiteral(semantics.mappingStatus, "exact_planned", "registry.semantics.mappingStatus", problems);
    requireLiteral(
      semantics.pathPresenceOrRuntimeReadinessIsNotClaimed,
      true,
      "registry.semantics.pathPresenceOrRuntimeReadinessIsNotClaimed",
      problems,
    );
    requireLiteral(
      semantics.staticCiRowsDoNotReceiveProductHandlers,
      true,
      "registry.semantics.staticCiRowsDoNotReceiveProductHandlers",
      problems,
    );
    requireLiteral(
      semantics.runtimeState,
      "fail_closed_pending_same_commit_proof",
      "registry.semantics.runtimeState",
      problems,
    );
    requireLiteral(
      semantics.promotionRequiresSameCommitExecutionAndProof,
      true,
      "registry.semantics.promotionRequiresSameCommitExecutionAndProof",
      problems,
    );
  }

  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  if (!Array.isArray(registry.entries)) problems.push("registry.entries must be an array");
  if (entries.length !== EXPECTED_LINEAR_RUNTIME_PATH_REGISTRY_ROWS) {
    problems.push(`registry.entries must contain ${EXPECTED_LINEAR_RUNTIME_PATH_REGISTRY_ROWS} rows`);
  }
  const issueIds = new Set<string>();
  const gateIds = new Set<string>();
  const laneCounts: Record<LinearRuntimePathLane, number> = {
    product_runtime: 0,
    static_ci: 0,
    hybrid: 0,
  };
  for (const [index, entry] of entries.entries()) {
    const lane = validateEntry(entry, index, issueIds, gateIds, problems);
    if (lane) laneCounts[lane] += 1;
  }

  const summary = requireRecord(registry.summary, "registry.summary", problems);
  if (summary) {
    requireExactKeys(summary, SUMMARY_KEYS, "registry.summary", problems);
    requireLiteral(summary.rowCount, entries.length, "registry.summary.rowCount", problems);
    requireLiteral(summary.exactPlannedRows, entries.length, "registry.summary.exactPlannedRows", problems);
    requireLiteral(summary.unresolvedRows, 0, "registry.summary.unresolvedRows", problems);
    requireLiteral(
      summary.allRowsFailClosedPendingProof,
      true,
      "registry.summary.allRowsFailClosedPendingProof",
      problems,
    );
    const summaryLaneCounts = requireRecord(summary.laneCounts, "registry.summary.laneCounts", problems);
    if (summaryLaneCounts) {
      requireExactKeys(summaryLaneCounts, LANE_COUNT_KEYS, "registry.summary.laneCounts", problems);
      for (const lane of LANE_COUNT_KEYS) {
        requireLiteral(
          summaryLaneCounts[lane],
          laneCounts[lane],
          `registry.summary.laneCounts.${lane}`,
          problems,
        );
      }
    }
  }

  if (problems.length > 0) throw new LinearRuntimePathRegistryValidationError(problems);
  return value as LinearRuntimePathRegistry;
}

export function parseLinearRuntimePathRegistry(raw: string): LinearRuntimePathRegistry {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new LinearRuntimePathRegistryValidationError([`registry JSON is invalid: ${message}`]);
  }
  return validateLinearRuntimePathRegistry(value);
}

export function loadLinearRuntimePathRegistry(
  path = DEFAULT_LINEAR_RUNTIME_PATH_REGISTRY,
): LinearRuntimePathRegistry {
  return parseLinearRuntimePathRegistry(readFileSync(path, "utf8"));
}
