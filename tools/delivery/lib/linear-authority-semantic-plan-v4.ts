import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./dependencies.js";
import { descriptionFingerprint } from "./fingerprint.js";
import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
} from "./linear-live.js";
import { isUuidV4 } from "./linear-authority-migration.js";
import { parseFeatureInventory } from "./sources.js";
import { validateLinearAuthorityRequirementPublicationSequence } from "./linear-authority-publication-sequence.js";

export const LINEAR_AUTHORITY_SEMANTIC_PLAN_V4_SCHEMA_VERSION = 4 as const;

export type LinearAuthorityDispositionV4 =
  | "proof_only"
  | "narrative_context"
  | "superseded"
  | "retired_source";

export interface LinearAuthoritySemanticRequirementV4 {
  canonicalLegacyId: string;
  legacyIds: string[];
  title: string;
  description: string;
  project: string;
  state: "Approved";
  labels: ["Requirement"];
  priority: number;
  execution: string[];
  primaryExecution: string;
  sourceAnchor: string;
  sourceDependencyLegacyIds: string[];
  normalizedDependencyLegacyIds: string[];
  requirementDependencyLegacyIds: string[];
  proofExecutionDependencies: string[];
  dispositionResolutions: Array<{
    viaDisposition: string;
    requirement: string | null;
    proofExecution: string | null;
  }>;
  publicationRank: number;
}

export interface LinearAuthoritySemanticDecisionV4 {
  legacyId: string;
  disposition: LinearAuthorityDispositionV4;
  title: string;
  description: string;
  project: string;
  state: "Approved" | "Retired" | "Superseded";
  labels: ["Decision"];
  priority: number;
  existingRelations: string[];
  requirementRelations: string[];
  sourceDependencyLegacyIds: string[];
  normalizedDependencyLegacyIds: string[];
}

export interface LinearAuthoritySemanticCoreCountsV4 {
  requirements: 926;
  dispositionDecisions: 61;
  dispositionClasses: Record<LinearAuthorityDispositionV4, number>;
  sourceSplitRows: 37;
  splitExecutionRelations: 102;
  rawSourceDependencyEdges: 1246;
  dependencyRepairAdditions: 114;
  normalizedDependencyEdges: 1360;
  executableNativeRequirementEdges: 1296;
  executableProofDependencyEdges: 2;
  publicationSequenceEntries: 926;
  dependencyOrderViolations: 0;
}

export interface LinearAuthoritySemanticCoreV4 {
  counts: LinearAuthoritySemanticCoreCountsV4;
  requirements: LinearAuthoritySemanticRequirementV4[];
  decisions: LinearAuthoritySemanticDecisionV4[];
  publicationSequence: string[];
}

export interface LinearAuthorityAdoptedRequirementV4 {
  canonicalLegacyId: string;
  issueUuid: string;
  issueIdentifier: string;
  descriptionUpdateRequired: boolean;
  priorityUpdateRequired: boolean;
  executionRelationsToAdd: string[];
  requirementDependencyLegacyIdsToAdd: string[];
  proofExecutionDependenciesToAdd: string[];
}

export interface LinearAuthoritySemanticPlanCountsV4 extends LinearAuthoritySemanticCoreCountsV4 {
  adoptedRequirementsVerified: number;
  adoptedDescriptionsToUpdate: number;
  adoptedPriorityUpdates: number;
  adoptedExecutionRelationsToAdd: number;
  adoptedRequirementDependencyRelationsToAdd: number;
  adoptedProofExecutionRelationsToAdd: number;
}

export interface LinearAuthoritySemanticPlanV4 {
  schemaVersion: 4;
  counts: LinearAuthoritySemanticPlanCountsV4;
  requirements: LinearAuthoritySemanticRequirementV4[];
  decisions: LinearAuthoritySemanticDecisionV4[];
  adoptedRequirementReconciliation: LinearAuthorityAdoptedRequirementV4[];
  publicationSequence: string[];
  captureEvidence: LinearAuthoritySemanticPlanCaptureEvidenceV4;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
}

export interface LinearAuthoritySemanticPlanCaptureEvidenceV4 {
  mode: "test_fixture" | "capture";
  captureEvidenceValidated: boolean;
  fingerprintSha256: string | null;
  descriptionCaptureSha256: string | null;
  recoveryMappingSha256: string | null;
  publicationSha256: string | null;
}

export interface ValidatedLinearAuthoritySemanticPlanV4 {
  semanticPlanInternalsValidated: true;
  captureEvidenceValidated: boolean;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
  semanticRoot: string;
  plan: LinearAuthoritySemanticPlanV4;
}

export interface LinearAuthorityRequirementRecoveryMappingV4 {
  legacyId: string;
  legacyIds: string[];
  issueIdentifier: string;
  issueUuid: string;
  title: string;
  projectId: string;
  stateId: string;
  labelNames: string[];
  relationKeys: string[];
  descriptionFingerprint: string;
}

export interface LinearAuthorityRequirementRecoveryV4 {
  schemaVersion: 1;
  captureSha256: string;
  publicationSha256: string;
  mappings: LinearAuthorityRequirementRecoveryMappingV4[];
}

export interface LinearAuthorityDescriptionCaptureV4 {
  schemaVersion: 1;
  issues: Array<{
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    labels: string[];
  }>;
}

interface InventoryRow {
  legacyId: string;
  title: string;
  summary: string;
  primaryAnchor: string;
}

interface DispositionRow {
  requirementId: string;
  disposition: LinearAuthorityDispositionV4;
  replacementId?: string;
  rationale: string;
}

interface SnapshotIssue {
  id: string;
  sourceId: string | null;
  sourceFamilyId?: string | null;
  project: string | null;
  projectId: string | null;
  priority: number | null;
}

interface SourcePolicy {
  splits: Array<{
    sourceId: string;
    primaryIssueId: string;
    executableIssueIds: string[];
  }>;
}

const SHA256 = /^[a-f0-9]{64}$/;
const LINEAR_IDENTIFIER = /\b[A-Z][A-Z0-9]{1,9}-[1-9]\d*\b/g;
const LINEAR_URL = /https?:\/\/(?:[^\s/]+\.)?linear\.app(?:\/|\b)/i;
const LEGACY_TEXT = /\b(?:F-(?:AE-|BC-)?\d+|RG:[a-z0-9_]+|AE-(?:V|\d)[A-Za-z0-9.-]*|D-(?:\d|[A-Z]{2,}-)[A-Za-z0-9.-]*|Sourcera_Master_Spec\.md|Master Spec)\b/i;

const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });
const unique = (values: readonly string[]): string[] =>
  [...new Set(values)].sort(compare);
const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");

function fail(message: string): never {
  throw new Error(`Linear authority semantic plan v4: ${message}`);
}

function cells(line: string): string[] {
  return line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((value) => value.trim().replace(/\\\|/g, "|"));
}

function inventoryRows(markdown: string): InventoryRow[] {
  return markdown.split(/\r?\n/).flatMap((line) => {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) return [];
    const [legacyId, title, , primaryAnchor, , , , summary] = cells(line);
    return [{ legacyId, title, summary, primaryAnchor }];
  });
}

const cleanTitle = (value: string): string => value
  .replace(/^AE-[A-Z0-9.]+(?:-[A-Z0-9.]+)*:\s*/i, "")
  .replace(/Appendix M/gi, "Surface and engine mapping")
  .replace(/§M\.5/gi, "Runtime gate catalog")
  .trim();

const cleanText = (value: string): string => value
  .replace(/Sourcera_Master_Spec\.md|Master Spec/gi, "canonical specification")
  .replace(/\s*\[verify[^\]]*\]/gi, "")
  .replace(/\s*\[AE:\s*pending\]/gi, "")
  .replace(/\b(?:F-(?:AE-|BC-)?\d+|RG:[a-z0-9_]+|AE-(?:V|\d)[A-Za-z0-9.-]*|D-(?:\d|[A-Z]{2,}-)[A-Za-z0-9.-]*)\b/gi, "the related canonical Linear entity")
  .replace(/\[Requirement\]\([A-Z][A-Z0-9]{1,9}-[1-9]\d*\)/g, "Requirement issue references")
  .replace(/\s+/g, " ")
  .trim();

const titleOverrides = new Map<string, string>([
  ["F-AE-001", "DSAR Cascade Acceptance Criteria"],
  ["F-AE-003", "Cross-Org PII Handling Acceptance Gates"],
  ["F-AE-004", "Convex Reactivity Contract Rules and SLO"],
  ["F-AE-018", "External Provider Health Detector Routing Catalog"],
  ["F-AE-026", "Defense View Generation Capability Contract Extension"],
]);

const fallbackProjects = new Map<string, string>([
  ["F-199", "Seller Console & Onboarding"],
  ["F-608", "Operations & Support Console"],
  ["F-609", "Operations & Support Console"],
  ["F-610", "Operations & Support Console"],
  ["F-611", "Operations & Support Console"],
  ["F-794", "QA, Release, Deployment & Launch"],
  ["F-887", "Integrations, API, Webhooks & MCP"],
  ["F-888", "Agent & Intelligence Capabilities"],
  ["F-889", "Seller Knowledge, Profile & Capabilities"],
  ["F-890", "Seller Knowledge, Profile & Capabilities"],
  ["F-891", "Seller Knowledge, Profile & Capabilities"],
  ["F-892", "Agent & Intelligence Capabilities"],
  ["F-893", "Agent & Intelligence Capabilities"],
  ["F-894", "Seller Knowledge, Profile & Capabilities"],
  ["F-895", "Seller Knowledge, Profile & Capabilities"],
  ["F-896", "Agent & Intelligence Capabilities"],
  ["F-AE-069", "QA, Release, Deployment & Launch"],
  ["F-AE-071", "Product Analytics, Growth & Network Effects"],
  ["F-AE-072", "Marketplace Discovery, Matching & Trust"],
]);

function fallbackProject(legacyId: string): string | null {
  const exact = fallbackProjects.get(legacyId);
  if (exact) return exact;
  if (/^F-(?:79[5-9]|8(?:0[4-9]|1\d|2\d|3[0-6]))$/.test(legacyId)) {
    return "QA, Release, Deployment & Launch";
  }
  if (/^F-8(?:3[8-9]|4\d|5[0-8])$/.test(legacyId)) {
    return "Billing, Pricing & Entitlements";
  }
  return null;
}

function assertNoDescriptionReferences(identity: string, value: string): void {
  if (LEGACY_TEXT.test(value)) fail(`${identity} description leaks a retired source identity`);
  const hardcodedIdentifiers = [...value.matchAll(LINEAR_IDENTIFIER)]
    .map((match) => match[0])
    .filter((candidate) => !/^(?:AES|ISO|SEV|SOC)-\d+$/.test(candidate));
  if (hardcodedIdentifiers.length > 0 || LINEAR_URL.test(value)) {
    fail(`${identity} description hardcodes a Linear issue reference`);
  }
}

export function canonicalLinearAuthoritySemanticPlanV4Json(value: unknown): string {
  const canonical = (row: unknown): string => {
    if (row === null || typeof row !== "object") return JSON.stringify(row);
    if (Array.isArray(row)) return `[${row.map(canonical).join(",")}]`;
    const record = row as Record<string, unknown>;
    return `{${Object.keys(record).sort(compare).map((key) =>
      `${JSON.stringify(key)}:${canonical(record[key])}`
    ).join(",")}}`;
  };
  return canonical(value);
}

export function buildLinearAuthoritySemanticCoreV4(
  rootDir: string,
): LinearAuthoritySemanticCoreV4 {
  const read = (path: string): string => readFileSync(resolve(rootDir, path), "utf8");
  const inventoryMarkdown = read("_audit/FEATURE_INVENTORY.md");
  const sourceRows = parseFeatureInventory(inventoryMarkdown);
  const rows = inventoryRows(inventoryMarkdown);
  const rowById = new Map(rows.map((row) => [row.legacyId, row]));
  if (rows.length !== 987 || sourceRows.length !== 987 || rowById.size !== 987) {
    fail(`canonical inventory must contain exactly 987 unique rows`);
  }
  const snapshot = JSON.parse(read("delivery/linear-snapshot.json")) as {
    issues: SnapshotIssue[];
    projects: Array<{ id: string; name: string }>;
  };
  const dispositionRows = (JSON.parse(read("delivery/dispositions.json")) as {
    overrides: DispositionRow[];
  }).overrides;
  const dispositions = new Map(dispositionRows.map((row) => [row.requirementId, row]));
  const repairs = (JSON.parse(read("delivery/feature-dependencies.json")) as {
    repairs: FeatureDependencyRepair[];
  }).repairs;
  const normalizedRows = applyFeatureDependencies(sourceRows, repairs);
  const normalizedDependencies = new Map(
    normalizedRows.map((row) => [row.requirementId, row.dependencies]),
  );
  const sourceDependencies = new Map(
    sourceRows.map((row) => [row.requirementId, row.dependencies]),
  );
  const executableIds = new Set(
    rows.filter((row) => !dispositions.has(row.legacyId)).map((row) => row.legacyId),
  );
  const issueBySource = new Map<string, SnapshotIssue[]>();
  for (const issue of snapshot.issues) {
    if (!issue.sourceId) continue;
    issueBySource.set(issue.sourceId, [...(issueBySource.get(issue.sourceId) ?? []), issue]);
  }
  const executionFor = (legacyId: string): SnapshotIssue[] => snapshot.issues
    .filter((issue) => issue.sourceId === legacyId || issue.sourceFamilyId === legacyId)
    .sort((left, right) => compare(left.id, right.id));

  const requirements = rows
    .filter((row) => executableIds.has(row.legacyId))
    .map((row): LinearAuthoritySemanticRequirementV4 => {
      const execution = executionFor(row.legacyId);
      const primary = execution.filter((issue) => issue.sourceId === row.legacyId);
      if (primary.length !== 1) fail(`${row.legacyId} has ${primary.length} primary execution owners`);
      if (!primary[0]!.project || !primary[0]!.projectId) fail(`${row.legacyId} primary execution owner lacks a project`);
      const resolvedRequirements: string[] = [];
      const resolvedProof: string[] = [];
      const dispositionResolutions: LinearAuthoritySemanticRequirementV4["dispositionResolutions"] = [];
      for (const dependency of normalizedDependencies.get(row.legacyId) ?? []) {
        if (executableIds.has(dependency)) {
          resolvedRequirements.push(dependency);
          continue;
        }
        const disposition = dispositions.get(dependency);
        if (disposition?.disposition === "superseded" &&
          disposition.replacementId && executableIds.has(disposition.replacementId)) {
          resolvedRequirements.push(disposition.replacementId);
          dispositionResolutions.push({
            viaDisposition: dependency,
            requirement: disposition.replacementId,
            proofExecution: null,
          });
          continue;
        }
        if (disposition?.disposition === "proof_only" &&
          disposition.replacementId?.startsWith("RG:")) {
          const proofs = issueBySource.get(disposition.replacementId) ?? [];
          if (proofs.length !== 1) fail(`${dependency} has ${proofs.length} proof execution owners`);
          resolvedProof.push(proofs[0]!.id);
          dispositionResolutions.push({
            viaDisposition: dependency,
            requirement: null,
            proofExecution: proofs[0]!.id,
          });
          continue;
        }
        fail(`${row.legacyId} has unresolvable dependency ${dependency}`);
      }
      const title = titleOverrides.get(row.legacyId) ?? cleanTitle(row.title);
      const description = `## Binding outcome\n\n${cleanText(row.summary)}\n\n## Authority\n\nThis issue is the canonical requirement identity and lifecycle record. Detailed structured contracts and acceptance rules are linked from canonical Linear documents.\n\n## Verification\n\nImplementation evidence must satisfy the related execution work and current runtime gates. Requirement approval does not itself prove runtime readiness.`;
      assertNoDescriptionReferences(row.legacyId, description);
      return {
        canonicalLegacyId: row.legacyId,
        legacyIds: [row.legacyId],
        title,
        description,
        project: primary[0]!.project,
        state: "Approved",
        labels: ["Requirement"],
        priority: primary[0]!.priority ?? 3,
        execution: execution.map((issue) => issue.id),
        primaryExecution: primary[0]!.id,
        sourceAnchor: row.primaryAnchor,
        sourceDependencyLegacyIds: [...(sourceDependencies.get(row.legacyId) ?? [])],
        normalizedDependencyLegacyIds: [...(normalizedDependencies.get(row.legacyId) ?? [])],
        requirementDependencyLegacyIds: unique(resolvedRequirements),
        proofExecutionDependencies: unique(resolvedProof),
        dispositionResolutions: dispositionResolutions.sort((left, right) =>
          compare(left.viaDisposition, right.viaDisposition)),
        publicationRank: 0,
      };
    })
    .sort((left, right) => compare(left.canonicalLegacyId, right.canonicalLegacyId));
  const requirementById = new Map(requirements.map((row) => [row.canonicalLegacyId, row]));
  const projectNames = new Set(snapshot.projects.map((project) => project.name));
  const decisions = dispositionRows.map((disposition): LinearAuthoritySemanticDecisionV4 => {
    const row = rowById.get(disposition.requirementId);
    if (!row) fail(`missing disposition source ${disposition.requirementId}`);
    const config = {
      proof_only: { prefix: "Classify", suffix: "as runtime proof only", state: "Approved" as const },
      narrative_context: { prefix: "Retire", suffix: "as non-binding context", state: "Retired" as const },
      superseded: { prefix: "Supersede", suffix: "with its canonical successor", state: "Superseded" as const },
      retired_source: { prefix: "Retire", suffix: "as duplicated historical source", state: "Retired" as const },
    }[disposition.disposition];
    const normalized = normalizedDependencies.get(disposition.requirementId) ?? [];
    const requirementRelations = unique([
      ...normalized.filter((identity) => executableIds.has(identity)),
      ...(disposition.replacementId && executableIds.has(disposition.replacementId)
        ? [disposition.replacementId]
        : []),
    ]);
    const existingRelations = disposition.replacementId?.startsWith("RG:")
      ? (issueBySource.get(disposition.replacementId) ?? []).map((issue) => issue.id)
      : [];
    const project = fallbackProject(disposition.requirementId);
    if (!project || !projectNames.has(project)) fail(`missing disposition project ${disposition.requirementId}`);
    const title = `${config.prefix} ${cleanTitle(row.title)} ${config.suffix}`;
    const description = `## Decision\n\n${cleanText(disposition.rationale)}\n\n## Effect\n\nThis item does not create a standalone binding product requirement. The archived migration receipt preserves its former registry mapping. Current behavior, execution, and proof remain with the native related Linear entities.`;
    assertNoDescriptionReferences(disposition.requirementId, description);
    return {
      legacyId: disposition.requirementId,
      disposition: disposition.disposition,
      title,
      description,
      project,
      state: config.state,
      labels: ["Decision"],
      priority: 3,
      existingRelations: unique(existingRelations),
      requirementRelations,
      sourceDependencyLegacyIds: [...(sourceDependencies.get(disposition.requirementId) ?? [])],
      normalizedDependencyLegacyIds: [...normalized],
    };
  }).sort((left, right) => compare(left.legacyId, right.legacyId));

  const sequence: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (identity: string): void => {
    if (visiting.has(identity)) fail(`dependency cycle includes ${identity}`);
    if (visited.has(identity)) return;
    const row = requirementById.get(identity);
    if (!row) fail(`dependency endpoint ${identity} is absent`);
    visiting.add(identity);
    for (const dependency of row.requirementDependencyLegacyIds) visit(dependency);
    visiting.delete(identity);
    visited.add(identity);
    sequence.push(identity);
  };
  for (const row of requirements) visit(row.canonicalLegacyId);
  const ranks = new Map(sequence.map((identity, index) => [identity, index + 1]));
  for (const row of requirements) row.publicationRank = ranks.get(row.canonicalLegacyId)!;

  const sourcePolicy = JSON.parse(read("delivery/linear-source-policy.json")) as SourcePolicy;
  const splitBySource = new Map(sourcePolicy.splits.map((row) => [row.sourceId, row]));
  for (const row of requirements) {
    const split = splitBySource.get(row.canonicalLegacyId);
    if (!split) {
      if (row.execution.length !== 1) fail(`${row.canonicalLegacyId} has an unregistered split`);
      continue;
    }
    const expected = unique([split.primaryIssueId, ...split.executableIssueIds]);
    if (row.primaryExecution !== split.primaryIssueId ||
      JSON.stringify(row.execution) !== JSON.stringify(expected)) {
      fail(`${row.canonicalLegacyId} split differs from source policy`);
    }
  }
  if (splitBySource.size !== sourcePolicy.splits.length ||
    sourcePolicy.splits.some((split) => !requirementById.has(split.sourceId))) {
    fail(`source policy split identities are incomplete or duplicated`);
  }

  const dispositionClasses: Record<LinearAuthorityDispositionV4, number> = {
    proof_only: 0,
    narrative_context: 0,
    superseded: 0,
    retired_source: 0,
  };
  for (const decision of decisions) dispositionClasses[decision.disposition] += 1;
  const rawSourceDependencyEdges = sourceRows.reduce((count, row) => count + row.dependencies.length, 0);
  const normalizedDependencyEdges = normalizedRows.reduce((count, row) => count + row.dependencies.length, 0);
  const executableNativeRequirementEdges = requirements.reduce(
    (count, row) => count + row.requirementDependencyLegacyIds.length,
    0,
  );
  const executableProofDependencyEdges = requirements.reduce(
    (count, row) => count + row.proofExecutionDependencies.length,
    0,
  );
  const sourceSplitRows = requirements.filter((row) => row.execution.length > 1).length;
  const splitExecutionRelations = requirements.reduce(
    (count, row) => count + row.execution.length - 1,
    0,
  );
  const dependencyOrderViolations = requirements.reduce((count, row) =>
    count + row.requirementDependencyLegacyIds.filter((dependency) =>
      ranks.get(dependency)! >= row.publicationRank
    ).length, 0);
  const counts = {
    requirements: requirements.length,
    dispositionDecisions: decisions.length,
    dispositionClasses,
    sourceSplitRows,
    splitExecutionRelations,
    rawSourceDependencyEdges,
    dependencyRepairAdditions: normalizedDependencyEdges - rawSourceDependencyEdges,
    normalizedDependencyEdges,
    executableNativeRequirementEdges,
    executableProofDependencyEdges,
    publicationSequenceEntries: sequence.length,
    dependencyOrderViolations,
  };
  const expected = {
    requirements: 926,
    dispositionDecisions: 61,
    dispositionClasses: { proof_only: 21, narrative_context: 23, superseded: 7, retired_source: 10 },
    sourceSplitRows: 37,
    splitExecutionRelations: 102,
    rawSourceDependencyEdges: 1246,
    dependencyRepairAdditions: 114,
    normalizedDependencyEdges: 1360,
    executableNativeRequirementEdges: 1296,
    executableProofDependencyEdges: 2,
    publicationSequenceEntries: 926,
    dependencyOrderViolations: 0,
  } satisfies LinearAuthoritySemanticCoreCountsV4;
  if (canonicalLinearAuthoritySemanticPlanV4Json(counts) !==
    canonicalLinearAuthoritySemanticPlanV4Json(expected)) {
    fail(`repo-native semantic counts differ: ${JSON.stringify(counts)}`);
  }
  const titleKeys = [...requirements, ...decisions].map((row) => row.title.normalize("NFKC").toLocaleLowerCase("en-US"));
  if (new Set(titleKeys).size !== titleKeys.length) fail(`active semantic titles are not unique`);
  const executionEndpoints = requirements.flatMap((row) => row.execution);
  if (new Set(executionEndpoints).size !== executionEndpoints.length) {
    fail(`execution endpoints do not have one canonical requirement owner`);
  }
  return { counts: expected, requirements, decisions, publicationSequence: sequence };
}

function assertReconciliationRows(
  core: LinearAuthoritySemanticCoreV4,
  rows: readonly LinearAuthorityAdoptedRequirementV4[],
): void {
  if (rows.length < 186 || rows.length > 926) {
    fail(`adopted reconciliation must contain between 186 and 926 rows`);
  }
  const requirements = new Map(core.requirements.map((row) => [row.canonicalLegacyId, row]));
  const identifiers = new Set<string>();
  const uuids = new Set<string>();
  const legacyIds = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const path = `adoptedRequirementReconciliation[${index}]`;
    exactKeys(object(row, path), [
      "canonicalLegacyId",
      "issueUuid",
      "issueIdentifier",
      "descriptionUpdateRequired",
      "priorityUpdateRequired",
      "executionRelationsToAdd",
      "requirementDependencyLegacyIdsToAdd",
      "proofExecutionDependenciesToAdd",
    ], path);
    nonEmptyString(row.canonicalLegacyId, `${path}.canonicalLegacyId`);
    nonEmptyString(row.issueUuid, `${path}.issueUuid`);
    nonEmptyString(row.issueIdentifier, `${path}.issueIdentifier`);
    if (!isUuidV4(row.issueUuid)) fail(`${row.issueIdentifier} has a non-v4 UUID`);
    if (identifiers.has(row.issueIdentifier)) fail(`duplicate adopted identifier ${row.issueIdentifier}`);
    if (uuids.has(row.issueUuid)) fail(`duplicate adopted UUID ${row.issueUuid}`);
    if (legacyIds.has(row.canonicalLegacyId)) fail(`duplicate adopted legacy identity ${row.canonicalLegacyId}`);
    identifiers.add(row.issueIdentifier);
    uuids.add(row.issueUuid);
    legacyIds.add(row.canonicalLegacyId);
    const requirement = requirements.get(row.canonicalLegacyId);
    if (!requirement) fail(`${row.issueIdentifier} maps to an unknown requirement`);
    booleanValue(row.descriptionUpdateRequired, `${path}.descriptionUpdateRequired`);
    booleanValue(row.priorityUpdateRequired, `${path}.priorityUpdateRequired`);
    for (const [name, values] of [
      ["executionRelationsToAdd", row.executionRelationsToAdd],
      ["requirementDependencyLegacyIdsToAdd", row.requirementDependencyLegacyIdsToAdd],
      ["proofExecutionDependenciesToAdd", row.proofExecutionDependenciesToAdd],
    ] as const) {
      stringArray(values, `${path}.${name}`);
    }
    if (!row.executionRelationsToAdd.every((endpoint) => requirement.execution.includes(endpoint))) {
      fail(`${row.issueIdentifier} has an unplanned execution relation delta`);
    }
    if (!row.requirementDependencyLegacyIdsToAdd.every((endpoint) =>
      requirement.requirementDependencyLegacyIds.includes(endpoint))) {
      fail(`${row.issueIdentifier} has an unplanned dependency relation delta`);
    }
    if (!row.proofExecutionDependenciesToAdd.every((endpoint) =>
      requirement.proofExecutionDependencies.includes(endpoint))) {
      fail(`${row.issueIdentifier} has an unplanned proof relation delta`);
    }
  }
}

function planCounts(
  core: LinearAuthoritySemanticCoreV4,
  rows: readonly LinearAuthorityAdoptedRequirementV4[],
): LinearAuthoritySemanticPlanCountsV4 {
  return {
    ...core.counts,
    adoptedRequirementsVerified: rows.length,
    adoptedDescriptionsToUpdate: rows.filter((row) => row.descriptionUpdateRequired).length,
    adoptedPriorityUpdates: rows.filter((row) => row.priorityUpdateRequired).length,
    adoptedExecutionRelationsToAdd: rows.reduce(
      (count, row) => count + row.executionRelationsToAdd.length,
      0,
    ),
    adoptedRequirementDependencyRelationsToAdd: rows.reduce(
      (count, row) => count + row.requirementDependencyLegacyIdsToAdd.length,
      0,
    ),
    adoptedProofExecutionRelationsToAdd: rows.reduce(
      (count, row) => count + row.proofExecutionDependenciesToAdd.length,
      0,
    ),
  };
}

function assembleLinearAuthoritySemanticPlanV4(
  rootDir: string,
  adoptedRequirementReconciliation: LinearAuthorityAdoptedRequirementV4[],
  captureEvidence: LinearAuthoritySemanticPlanCaptureEvidenceV4,
): ValidatedLinearAuthoritySemanticPlanV4 {
  const core = buildLinearAuthoritySemanticCoreV4(rootDir);
  assertReconciliationRows(core, adoptedRequirementReconciliation);
  const rows = [...adoptedRequirementReconciliation]
    .map((row) => ({
      ...row,
      executionRelationsToAdd: unique(row.executionRelationsToAdd),
      requirementDependencyLegacyIdsToAdd: unique(row.requirementDependencyLegacyIdsToAdd),
      proofExecutionDependenciesToAdd: unique(row.proofExecutionDependenciesToAdd),
    }))
    .sort((left, right) => compare(left.issueIdentifier, right.issueIdentifier));
  const plan: LinearAuthoritySemanticPlanV4 = {
    schemaVersion: LINEAR_AUTHORITY_SEMANTIC_PLAN_V4_SCHEMA_VERSION,
    counts: planCounts(core, rows),
    requirements: core.requirements,
    decisions: core.decisions,
    adoptedRequirementReconciliation: rows,
    publicationSequence: core.publicationSequence,
    captureEvidence,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
  };
  return validateLinearAuthoritySemanticPlanV4(plan);
}

export function buildLinearAuthoritySemanticPlanV4TestFixture(
  rootDir: string,
  adoptedRequirementReconciliation: LinearAuthorityAdoptedRequirementV4[],
): ValidatedLinearAuthoritySemanticPlanV4 {
  return assembleLinearAuthoritySemanticPlanV4(
    rootDir,
    adoptedRequirementReconciliation,
    {
      mode: "test_fixture",
      captureEvidenceValidated: false,
      fingerprintSha256: null,
      descriptionCaptureSha256: null,
      recoveryMappingSha256: null,
      publicationSha256: null,
    },
  );
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${path} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  path: string,
): void {
  const expected = new Set(keys);
  const unknown = Object.keys(value).filter((key) => !expected.has(key));
  const missing = keys.filter((key) => !Object.hasOwn(value, key));
  if (unknown.length || missing.length) {
    fail(`${path} keys differ; unknown=[${unknown.join(",")}], missing=[${missing.join(",")}]`);
  }
}

function nonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || !value || value.trim() !== value) {
    fail(`${path} must be a trimmed non-empty string`);
  }
  return value;
}

function nullableString(value: unknown, path: string): string | null {
  return value === null ? null : nonEmptyString(value, path);
}

function integer(value: unknown, path: string, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    fail(`${path} must be an integer between ${minimum} and ${maximum}`);
  }
  return value as number;
}

function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(`${path} must be boolean`);
  return value;
}

function stringArray(value: unknown, path: string, minimum = 0): string[] {
  if (!Array.isArray(value) || value.length < minimum) fail(`${path} must be an array`);
  const rows = value.map((entry, index) => nonEmptyString(entry, `${path}[${index}]`));
  if (new Set(rows).size !== rows.length) fail(`${path} contains duplicate values`);
  return rows;
}

function parseJson<T>(bytes: string | Uint8Array, path: string): T {
  try {
    return JSON.parse(typeof bytes === "string" ? bytes : Buffer.from(bytes).toString("utf8")) as T;
  } catch (error) {
    fail(`${path} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function validateLinearAuthoritySemanticPlanV4(
  input: unknown,
): ValidatedLinearAuthoritySemanticPlanV4 {
  const root = object(input, "plan");
  exactKeys(root, [
    "schemaVersion",
    "counts",
    "requirements",
    "decisions",
    "adoptedRequirementReconciliation",
    "publicationSequence",
    "captureEvidence",
    "semanticCoverageValidated",
    "mutationAuthorized",
  ], "plan");
  if (root.schemaVersion !== 4) fail(`schemaVersion must be 4`);
  if (root.semanticCoverageValidated !== false || root.mutationAuthorized !== false) {
    fail(`coverage and mutation flags must remain false`);
  }
  const captureEvidence = object(root.captureEvidence, "captureEvidence");
  exactKeys(captureEvidence, [
    "mode",
    "captureEvidenceValidated",
    "fingerprintSha256",
    "descriptionCaptureSha256",
    "recoveryMappingSha256",
    "publicationSha256",
  ], "captureEvidence");
  const captureMode = captureEvidence.mode;
  const captureEvidenceValidated = captureEvidence.captureEvidenceValidated;
  const evidenceDigests = [
    captureEvidence.fingerprintSha256,
    captureEvidence.descriptionCaptureSha256,
    captureEvidence.recoveryMappingSha256,
    captureEvidence.publicationSha256,
  ];
  if (captureMode === "capture") {
    if (captureEvidenceValidated !== true ||
      evidenceDigests.some((value) => typeof value !== "string" || !SHA256.test(value))) {
      fail(`capture evidence mode requires four validated SHA-256 roots`);
    }
  } else if (captureMode === "test_fixture") {
    if (captureEvidenceValidated !== false || evidenceDigests.some((value) => value !== null)) {
      fail(`test fixture mode cannot claim capture evidence`);
    }
  } else {
    fail(`captureEvidence.mode is invalid`);
  }
  if (!Array.isArray(root.requirements) || !Array.isArray(root.decisions) ||
    !Array.isArray(root.adoptedRequirementReconciliation) ||
    !Array.isArray(root.publicationSequence)) {
    fail(`plan collections must be arrays`);
  }
  const countsObject = object(root.counts, "counts");
  const countKeys = [
    "requirements",
    "dispositionDecisions",
    "dispositionClasses",
    "sourceSplitRows",
    "splitExecutionRelations",
    "rawSourceDependencyEdges",
    "dependencyRepairAdditions",
    "normalizedDependencyEdges",
    "executableNativeRequirementEdges",
    "executableProofDependencyEdges",
    "publicationSequenceEntries",
    "dependencyOrderViolations",
    "adoptedRequirementsVerified",
    "adoptedDescriptionsToUpdate",
    "adoptedPriorityUpdates",
    "adoptedExecutionRelationsToAdd",
    "adoptedRequirementDependencyRelationsToAdd",
    "adoptedProofExecutionRelationsToAdd",
  ] as const;
  exactKeys(countsObject, countKeys, "counts");
  for (const key of countKeys.filter((key) => key !== "dispositionClasses")) {
    integer(countsObject[key], `counts.${key}`);
  }
  const reportedDispositionClasses = object(
    countsObject.dispositionClasses,
    "counts.dispositionClasses",
  );
  exactKeys(reportedDispositionClasses, [
    "proof_only",
    "narrative_context",
    "superseded",
    "retired_source",
  ], "counts.dispositionClasses");
  for (const key of ["proof_only", "narrative_context", "superseded", "retired_source"]) {
    integer(reportedDispositionClasses[key], `counts.dispositionClasses.${key}`);
  }
  const requirements = root.requirements as LinearAuthoritySemanticRequirementV4[];
  const decisions = root.decisions as LinearAuthoritySemanticDecisionV4[];
  const reconciliations = root.adoptedRequirementReconciliation as LinearAuthorityAdoptedRequirementV4[];
  const sequence = stringArray(root.publicationSequence, "publicationSequence", 926);
  if (requirements.length !== 926 || decisions.length !== 61 || sequence.length !== 926) {
    fail(`plan must contain 926 requirements, 61 decisions, and 926 sequence entries`);
  }
  const requirementById = new Map<string, LinearAuthoritySemanticRequirementV4>();
  const decisionById = new Map<string, LinearAuthoritySemanticDecisionV4>();
  const allIds = new Set<string>();
  const titles = new Set<string>();
  const executionOwners = new Set<string>();
  for (const [index, rawRow] of requirements.entries()) {
    const parsedRow = object(rawRow, `requirements[${index}]`);
    exactKeys(parsedRow, [
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
    ], `requirements[${index}]`);
    const row = rawRow;
    nonEmptyString(row.canonicalLegacyId, `requirements[${index}].canonicalLegacyId`);
    nonEmptyString(row.title, `requirements[${index}].title`);
    nonEmptyString(row.description, `requirements[${index}].description`);
    nonEmptyString(row.project, `requirements[${index}].project`);
    nonEmptyString(row.primaryExecution, `requirements[${index}].primaryExecution`);
    nonEmptyString(row.sourceAnchor, `requirements[${index}].sourceAnchor`);
    integer(row.priority, `requirements[${index}].priority`, 0, 4);
    integer(row.publicationRank, `requirements[${index}].publicationRank`, 1, 926);
    const legacyIds = stringArray(row.legacyIds, `requirements[${index}].legacyIds`, 1);
    const execution = stringArray(row.execution, `requirements[${index}].execution`, 1);
    stringArray(row.sourceDependencyLegacyIds, `requirements[${index}].sourceDependencyLegacyIds`);
    stringArray(row.normalizedDependencyLegacyIds, `requirements[${index}].normalizedDependencyLegacyIds`);
    stringArray(row.requirementDependencyLegacyIds, `requirements[${index}].requirementDependencyLegacyIds`);
    stringArray(row.proofExecutionDependencies, `requirements[${index}].proofExecutionDependencies`);
    if (!Array.isArray(row.dispositionResolutions)) {
      fail(`requirements[${index}].dispositionResolutions must be an array`);
    }
    for (const [resolutionIndex, resolution] of row.dispositionResolutions.entries()) {
      const parsedResolution = object(
        resolution,
        `requirements[${index}].dispositionResolutions[${resolutionIndex}]`,
      );
      exactKeys(parsedResolution, ["viaDisposition", "requirement", "proofExecution"],
        `requirements[${index}].dispositionResolutions[${resolutionIndex}]`);
      nonEmptyString(resolution.viaDisposition,
        `requirements[${index}].dispositionResolutions[${resolutionIndex}].viaDisposition`);
      nullableString(resolution.requirement,
        `requirements[${index}].dispositionResolutions[${resolutionIndex}].requirement`);
      nullableString(resolution.proofExecution,
        `requirements[${index}].dispositionResolutions[${resolutionIndex}].proofExecution`);
    }
    if (requirementById.has(row.canonicalLegacyId)) fail(`requirement identities are duplicated`);
    if (legacyIds.length !== 1 || legacyIds[0] !== row.canonicalLegacyId ||
      allIds.has(row.canonicalLegacyId)) {
      fail(`${row.canonicalLegacyId} must own exactly its canonical legacy identity`);
    }
    if (row.state !== "Approved" || JSON.stringify(row.labels) !== JSON.stringify(["Requirement"])) {
      fail(`${row.canonicalLegacyId} has invalid native semantics`);
    }
    assertNoDescriptionReferences(row.canonicalLegacyId, row.description);
    const titleKey = row.title.normalize("NFKC").toLocaleLowerCase("en-US");
    if (titles.has(titleKey)) fail(`duplicate active title ${row.title}`);
    titles.add(titleKey);
    if (!execution.includes(row.primaryExecution)) fail(`${row.canonicalLegacyId} execution projection is invalid`);
    for (const endpoint of execution) {
      if (executionOwners.has(endpoint)) fail(`duplicate execution endpoint ${endpoint}`);
      executionOwners.add(endpoint);
    }
    requirementById.set(row.canonicalLegacyId, row);
    allIds.add(row.canonicalLegacyId);
  }
  const dispositionClasses: Record<LinearAuthorityDispositionV4, number> = {
    proof_only: 0,
    narrative_context: 0,
    superseded: 0,
    retired_source: 0,
  };
  for (const [index, rawRow] of decisions.entries()) {
    const parsedRow = object(rawRow, `decisions[${index}]`);
    exactKeys(parsedRow, [
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
    ], `decisions[${index}]`);
    const row = rawRow;
    nonEmptyString(row.legacyId, `decisions[${index}].legacyId`);
    nonEmptyString(row.title, `decisions[${index}].title`);
    nonEmptyString(row.description, `decisions[${index}].description`);
    nonEmptyString(row.project, `decisions[${index}].project`);
    integer(row.priority, `decisions[${index}].priority`, 0, 4);
    stringArray(row.existingRelations, `decisions[${index}].existingRelations`);
    stringArray(row.requirementRelations, `decisions[${index}].requirementRelations`);
    stringArray(row.sourceDependencyLegacyIds, `decisions[${index}].sourceDependencyLegacyIds`);
    stringArray(row.normalizedDependencyLegacyIds, `decisions[${index}].normalizedDependencyLegacyIds`);
    if (allIds.has(row.legacyId) ||
      !Object.hasOwn(dispositionClasses, row.disposition)) fail(`decision identities or dispositions are invalid`);
    const expectedState = row.disposition === "proof_only"
      ? "Approved"
      : row.disposition === "superseded"
      ? "Superseded"
      : "Retired";
    if (row.state !== expectedState) fail(`${row.legacyId} has an invalid disposition state`);
    if (JSON.stringify(row.labels) !== JSON.stringify(["Decision"])) {
      fail(`${row.legacyId} has invalid Decision label semantics`);
    }
    assertNoDescriptionReferences(row.legacyId, row.description);
    const titleKey = row.title.normalize("NFKC").toLocaleLowerCase("en-US");
    if (titles.has(titleKey)) fail(`duplicate active title ${row.title}`);
    titles.add(titleKey);
    allIds.add(row.legacyId);
    decisionById.set(row.legacyId, row);
    dispositionClasses[row.disposition] += 1;
  }
  let rawEdges = 0;
  let normalizedEdges = 0;
  let repairEdges = 0;
  let nativeEdges = 0;
  let proofEdges = 0;
  let collapsedEdges = 0;
  for (const row of [...requirements, ...decisions]) {
    const source = row.sourceDependencyLegacyIds;
    const normalized = row.normalizedDependencyLegacyIds;
    if (!Array.isArray(source) || !Array.isArray(normalized) ||
      new Set(source).size !== source.length || new Set(normalized).size !== normalized.length) {
      fail(`${"canonicalLegacyId" in row ? row.canonicalLegacyId : row.legacyId} dependency lists are invalid`);
    }
    if (source.some((identity) => !normalized.includes(identity))) {
      fail(`normalized dependencies removed a source edge`);
    }
    const identity = "canonicalLegacyId" in row ? row.canonicalLegacyId : row.legacyId;
    if (normalized.some((dependency) => !allIds.has(dependency) || dependency === identity)) {
      fail(`normalized dependency endpoint is unknown or self-referential`);
    }
    rawEdges += source.length;
    normalizedEdges += normalized.length;
    repairEdges += normalized.filter((identity) => !source.includes(identity)).length;
  }
  for (const row of decisions) {
    const directRequirements = unique(
      row.normalizedDependencyLegacyIds.filter((identity) => requirementById.has(identity)),
    );
    if (row.requirementRelations.some((identity) => !requirementById.has(identity)) ||
      directRequirements.some((identity) => !row.requirementRelations.includes(identity))) {
      fail(`${row.legacyId} has an invalid native requirement relation projection`);
    }
    if (row.disposition !== "superseded" &&
      JSON.stringify(unique(row.requirementRelations)) !== JSON.stringify(directRequirements)) {
      fail(`${row.legacyId} has an unrelated requirement relation`);
    }
  }
  for (const row of requirements) {
    const resolvedRequirements: string[] = [];
    const resolvedProof: string[] = [];
    const resolutions = new Map(row.dispositionResolutions.map((resolution) => [resolution.viaDisposition, resolution]));
    if (resolutions.size !== row.dispositionResolutions.length) fail(`${row.canonicalLegacyId} has duplicate dispositions`);
    const dispositionDependencies = row.normalizedDependencyLegacyIds.filter((dependency) =>
      decisionById.has(dependency));
    if (resolutions.size !== dispositionDependencies.length ||
      [...resolutions.keys()].some((identity) => !dispositionDependencies.includes(identity))) {
      fail(`${row.canonicalLegacyId} has missing or extraneous disposition resolutions`);
    }
    for (const dependency of row.normalizedDependencyLegacyIds) {
      if (requirementById.has(dependency)) {
        resolvedRequirements.push(dependency);
        continue;
      }
      const decision = decisionById.get(dependency);
      const resolution = resolutions.get(dependency);
      if (!decision || !resolution) fail(`${row.canonicalLegacyId} lacks a disposition resolution`);
      if (Number(resolution.requirement !== null) + Number(resolution.proofExecution !== null) !== 1) {
        fail(`${row.canonicalLegacyId} disposition resolution must select one endpoint`);
      }
      if (resolution.requirement) {
        if (decision.disposition !== "superseded" || !requirementById.has(resolution.requirement) ||
          !decision.requirementRelations.includes(resolution.requirement)) {
          fail(`${row.canonicalLegacyId} has an invalid superseded resolution`);
        }
        resolvedRequirements.push(resolution.requirement);
      } else if (resolution.proofExecution) {
        if (decision.disposition !== "proof_only" ||
          !decision.existingRelations.includes(resolution.proofExecution)) {
          fail(`${row.canonicalLegacyId} has an invalid proof resolution`);
        }
        resolvedProof.push(resolution.proofExecution);
      } else {
        fail(`${row.canonicalLegacyId} disposition resolution has no endpoint`);
      }
    }
    if (JSON.stringify(unique(resolvedRequirements)) !==
      JSON.stringify(unique(row.requirementDependencyLegacyIds)) ||
      JSON.stringify(unique(resolvedProof)) !==
      JSON.stringify(unique(row.proofExecutionDependencies))) {
      fail(`${row.canonicalLegacyId} resolved dependency projection differs`);
    }
    nativeEdges += row.requirementDependencyLegacyIds.length;
    proofEdges += row.proofExecutionDependencies.length;
    collapsedEdges += resolvedRequirements.length + resolvedProof.length -
      unique(resolvedRequirements).length - unique(resolvedProof).length;
  }
  if (collapsedEdges !== 1) fail(`exactly one superseded edge must collapse`);
  if (new Set(sequence).size !== 926 || sequence.some((identity) => !requirementById.has(identity))) {
    fail(`publication sequence coverage differs`);
  }
  const ranks = new Map(sequence.map((identity, index) => [identity, index + 1]));
  let orderViolations = 0;
  for (const row of requirements) {
    if (row.publicationRank !== ranks.get(row.canonicalLegacyId)) fail(`${row.canonicalLegacyId} rank differs`);
    orderViolations += row.requirementDependencyLegacyIds.filter((dependency) =>
      ranks.get(dependency)! >= row.publicationRank
    ).length;
  }
  assertReconciliationRows({
    counts: root.counts as LinearAuthoritySemanticCoreCountsV4,
    requirements,
    decisions,
    publicationSequence: sequence,
  }, reconciliations);
  const derivedSplitRows = requirements.filter((row) => row.execution.length > 1).length;
  const derivedSplitRelations = requirements.reduce<number>(
    (count, row) => count + row.execution.length - 1,
    0,
  );
  const coreCounts: LinearAuthoritySemanticCoreCountsV4 = {
    requirements: 926,
    dispositionDecisions: 61,
    dispositionClasses,
    sourceSplitRows: derivedSplitRows as 37,
    splitExecutionRelations: derivedSplitRelations as 102,
    rawSourceDependencyEdges: rawEdges as 1246,
    dependencyRepairAdditions: repairEdges as 114,
    normalizedDependencyEdges: normalizedEdges as 1360,
    executableNativeRequirementEdges: nativeEdges as 1296,
    executableProofDependencyEdges: proofEdges as 2,
    publicationSequenceEntries: sequence.length as 926,
    dependencyOrderViolations: orderViolations as 0,
  };
  const expectedCore = {
    requirements: 926,
    dispositionDecisions: 61,
    dispositionClasses: { proof_only: 21, narrative_context: 23, superseded: 7, retired_source: 10 },
    sourceSplitRows: 37,
    splitExecutionRelations: 102,
    rawSourceDependencyEdges: 1246,
    dependencyRepairAdditions: 114,
    normalizedDependencyEdges: 1360,
    executableNativeRequirementEdges: 1296,
    executableProofDependencyEdges: 2,
    publicationSequenceEntries: 926,
    dependencyOrderViolations: 0,
  } satisfies LinearAuthoritySemanticCoreCountsV4;
  if (canonicalLinearAuthoritySemanticPlanV4Json(coreCounts) !==
    canonicalLinearAuthoritySemanticPlanV4Json(expectedCore)) {
    fail(`semantic core counts differ`);
  }
  const derivedCounts = planCounts({
    counts: expectedCore,
    requirements,
    decisions,
    publicationSequence: sequence,
  }, reconciliations);
  if (canonicalLinearAuthoritySemanticPlanV4Json(root.counts) !==
    canonicalLinearAuthoritySemanticPlanV4Json(derivedCounts)) {
    fail(`reported counts differ from derived counts`);
  }
  const plan = input as LinearAuthoritySemanticPlanV4;
  return {
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: captureEvidenceValidated as boolean,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
    semanticRoot: sha256(canonicalLinearAuthoritySemanticPlanV4Json(plan)),
    plan,
  };
}

export function parseLinearAuthoritySemanticPlanV4(
  bytes: string | Uint8Array,
): ValidatedLinearAuthoritySemanticPlanV4 {
  return validateLinearAuthoritySemanticPlanV4(
    parseJson<unknown>(bytes, "semantic plan v4"),
  );
}

export interface LinearAuthoritySemanticPlanV4CaptureInput {
  rootDir: string;
  fingerprintJson: string | Uint8Array;
  descriptionsJson: string | Uint8Array;
  recoveryMappingJson: string | Uint8Array;
  publicationJson: string | Uint8Array;
}

export function buildLinearAuthoritySemanticPlanV4FromCapture(
  input: LinearAuthoritySemanticPlanV4CaptureInput,
): ValidatedLinearAuthoritySemanticPlanV4 {
  const core = buildLinearAuthoritySemanticCoreV4(input.rootDir);
  validateLinearAuthorityRequirementPublicationSequence(
    input.publicationJson,
    core.publicationSequence,
  );
  const fingerprint = parseJson<LinearFingerprint>(input.fingerprintJson, "Linear fingerprint");
  const descriptions = parseJson<LinearAuthorityDescriptionCaptureV4>(
    input.descriptionsJson,
    "Linear description capture",
  );
  const recovery = parseJson<LinearAuthorityRequirementRecoveryV4>(
    input.recoveryMappingJson,
    "requirement recovery mapping",
  );
  exactKeys(object(recovery, "requirement recovery mapping"), [
    "schemaVersion",
    "captureSha256",
    "publicationSha256",
    "mappings",
  ], "requirement recovery mapping");
  if (recovery.schemaVersion !== 1 || !SHA256.test(recovery.captureSha256) ||
    !SHA256.test(recovery.publicationSha256) || !Array.isArray(recovery.mappings)) {
    fail(`requirement recovery mapping contract is invalid`);
  }
  if (recovery.captureSha256 !== sha256(input.fingerprintJson)) {
    fail(`requirement recovery mapping is pinned to a different capture`);
  }
  if (recovery.publicationSha256 !== sha256(input.publicationJson)) {
    fail(`requirement recovery mapping is pinned to different publication bytes`);
  }
  if (!fingerprint || !Array.isArray(fingerprint.issues)) fail(`Linear fingerprint lacks issues`);
  if (descriptions.schemaVersion !== 1 || !Array.isArray(descriptions.issues)) {
    fail(`Linear description capture contract is invalid`);
  }
  exactKeys(object(descriptions, "Linear description capture"), [
    "schemaVersion",
    "issues",
  ], "Linear description capture");
  const fingerprintByIdentifier = new Map<string, LinearFingerprint["issues"][number]>();
  const fingerprintUuids = new Set<string>();
  for (const issue of fingerprint.issues) {
    if (fingerprintByIdentifier.has(issue.identifier)) fail(`fingerprint duplicates ${issue.identifier}`);
    if (!issue.linearId || !isUuidV4(issue.linearId) || fingerprintUuids.has(issue.linearId)) {
      fail(`fingerprint issue UUID is absent, invalid, or duplicated`);
    }
    fingerprintByIdentifier.set(issue.identifier, issue);
    fingerprintUuids.add(issue.linearId);
  }
  const descriptionsByIdentifier = new Map<string, LinearAuthorityDescriptionCaptureV4["issues"][number]>();
  for (const issue of descriptions.issues) {
    exactKeys(object(issue, `description ${issue.id}`), [
      "id",
      "title",
      "description",
      "updatedAt",
      "labels",
    ], `description ${issue.id}`);
    if (descriptionsByIdentifier.has(issue.id)) fail(`description capture duplicates ${issue.id}`);
    descriptionsByIdentifier.set(issue.id, issue);
    const fingerprintIssue = fingerprintByIdentifier.get(issue.id);
    if (!fingerprintIssue || fingerprintIssue.title !== issue.title ||
      fingerprintIssue.updatedAt !== issue.updatedAt ||
      JSON.stringify(fingerprintIssue.labels) !== JSON.stringify(issue.labels) ||
      fingerprintIssue.descriptionFingerprint !== descriptionFingerprint(issue.description)) {
      fail(`description capture drifts from fingerprint at ${issue.id}`);
    }
  }
  if (descriptionsByIdentifier.size !== fingerprintByIdentifier.size) {
    fail(`description capture does not cover the full fingerprint`);
  }
  const requirementTeamIssues = fingerprint.issues.filter((issue) =>
    issue.team === "REQ" && issue.archivedAt === null &&
    JSON.stringify(issue.labels) === JSON.stringify(["Requirement"]));
  if (requirementTeamIssues.length < 186 || requirementTeamIssues.length > 926) {
    fail(`live Requirements team must contain between 186 and 926 active Requirement rows`);
  }
  for (const issue of requirementTeamIssues) {
    const description = descriptionsByIdentifier.get(issue.identifier)?.description ?? "";
    assertNoDescriptionReferences(issue.identifier, description);
  }
  if (recovery.mappings.length !== requirementTeamIssues.length) {
    fail(`recovery mapping must exactly cover the live Requirement rows`);
  }
  const mappingLegacyIds = new Set<string>();
  const mappingIdentifiers = new Set<string>();
  const mappingUuids = new Set<string>();
  const requirementById = new Map(core.requirements.map((row) => [row.canonicalLegacyId, row]));
  const mappingByLegacyId = new Map<string, LinearAuthorityRequirementRecoveryMappingV4>();
  const liveRequirementIdentifiers = new Set(requirementTeamIssues.map((issue) => issue.identifier));
  let anchoredRequirements = 0;
  for (const mapping of recovery.mappings) {
    exactKeys(object(mapping, `recovery mapping ${mapping.issueIdentifier}`), [
      "legacyId",
      "legacyIds",
      "issueIdentifier",
      "issueUuid",
      "title",
      "projectId",
      "stateId",
      "labelNames",
      "relationKeys",
      "descriptionFingerprint",
    ], `recovery mapping ${mapping.issueIdentifier}`);
    if (!mapping || !mapping.legacyId || !isUuidV4(mapping.issueUuid) ||
      !Array.isArray(mapping.legacyIds) || mapping.legacyIds.length !== 1 ||
      mapping.legacyIds[0] !== mapping.legacyId || !requirementById.has(mapping.legacyId)) {
      fail(`recovery mapping row is invalid`);
    }
    if (mappingLegacyIds.has(mapping.legacyId) || mappingIdentifiers.has(mapping.issueIdentifier) ||
      mappingUuids.has(mapping.issueUuid)) fail(`recovery mapping contains a duplicate identity`);
    mappingLegacyIds.add(mapping.legacyId);
    mappingIdentifiers.add(mapping.issueIdentifier);
    mappingUuids.add(mapping.issueUuid);
    mappingByLegacyId.set(mapping.legacyId, mapping);
    const live = fingerprintByIdentifier.get(mapping.issueIdentifier);
    if (!live || live.linearId !== mapping.issueUuid || live.title !== mapping.title ||
      live.projectId !== mapping.projectId || live.stateId !== mapping.stateId ||
      live.descriptionFingerprint !== mapping.descriptionFingerprint ||
      JSON.stringify(live.labels) !== JSON.stringify(mapping.labelNames) ||
      JSON.stringify([...live.relations].sort(compare)) !==
        JSON.stringify([...mapping.relationKeys].sort(compare))) {
      fail(`recovery mapping drifts from capture at ${mapping.issueIdentifier}`);
    }
    const planned = requirementById.get(mapping.legacyId)!;
    if (live.title !== planned.title || live.project !== planned.project ||
      live.state !== planned.state || JSON.stringify(live.labels) !== JSON.stringify(planned.labels)) {
      fail(`live adopted fields drift from semantic plan at ${mapping.issueIdentifier}`);
    }
    const primaryKey = canonicalLinearRelationKey("related", live.identifier, planned.primaryExecution);
    const primary = fingerprintByIdentifier.get(planned.primaryExecution);
    const anchored = live.relations.filter((key) => key === primaryKey).length === 1 &&
      primary?.relations.filter((key) => key === primaryKey).length === 1;
    if (anchored) anchoredRequirements += 1;
    else if (live.descriptionFingerprint !== descriptionFingerprint(planned.description) ||
      live.priority !== planned.priority || live.estimate !== null || live.dueDate !== null ||
      live.cycleId !== null || live.milestoneId !== null || live.parentLinearId !== null ||
      live.assigneeId !== null || live.releases.length !== 0) {
      fail(`partial-created Requirement ${mapping.issueIdentifier} differs from the exact desired target`);
    }
  }
  if (mappingIdentifiers.size !== liveRequirementIdentifiers.size ||
    [...mappingIdentifiers].some((identifier) => !liveRequirementIdentifiers.has(identifier))) {
    fail(`recovery mapping has missing or extra live Requirement rows`);
  }
  if (anchoredRequirements < 186) fail(`fewer than 186 adopted Requirements retain the exact primary anchor`);
  const desiredRelations = new Set<string>();
  for (const mapping of recovery.mappings) {
    const planned = requirementById.get(mapping.legacyId)!;
    for (const endpoint of [...planned.execution, ...planned.proofExecutionDependencies]) {
      desiredRelations.add(canonicalLinearRelationKey("related", mapping.issueIdentifier, endpoint));
    }
    for (const dependency of planned.requirementDependencyLegacyIds) {
      const adoptedDependency = mappingByLegacyId.get(dependency);
      if (adoptedDependency) {
        desiredRelations.add(canonicalLinearRelationKey(
          "blocks",
          adoptedDependency.issueIdentifier,
          mapping.issueIdentifier,
        ));
      }
    }
  }
  const currentRelations = new Set(requirementTeamIssues.flatMap((issue) => issue.relations));
  const governedNonRequirementIdentifiers = new Set(fingerprint.issues
    .filter((issue) => issue.archivedAt === null && issue.labels.some((label) =>
      label === "decision" || label === "risk"))
    .map((issue) => issue.identifier));
  const unexpectedRelations = [...currentRelations].filter((key) => {
    if (desiredRelations.has(key)) return false;
    const endpoints = key.split(":").slice(1);
    return !endpoints.some((endpoint) => governedNonRequirementIdentifiers.has(endpoint));
  });
  if (unexpectedRelations.length) {
    fail(`live adopted relation drift includes ${unexpectedRelations[0]}`);
  }
  const reconciliations = recovery.mappings.map((mapping): LinearAuthorityAdoptedRequirementV4 => {
    const planned = requirementById.get(mapping.legacyId)!;
    const live = fingerprintByIdentifier.get(mapping.issueIdentifier)!;
    const executionRelationsToAdd = planned.execution.filter((endpoint) =>
      !currentRelations.has(canonicalLinearRelationKey("related", mapping.issueIdentifier, endpoint)));
    const requirementDependencyLegacyIdsToAdd = planned.requirementDependencyLegacyIds.filter((dependency) => {
      const adoptedDependency = mappingByLegacyId.get(dependency);
      return adoptedDependency && !currentRelations.has(canonicalLinearRelationKey(
        "blocks",
        adoptedDependency.issueIdentifier,
        mapping.issueIdentifier,
      ));
    });
    const proofExecutionDependenciesToAdd = planned.proofExecutionDependencies.filter((endpoint) =>
      !currentRelations.has(canonicalLinearRelationKey("related", mapping.issueIdentifier, endpoint)));
    return {
      canonicalLegacyId: mapping.legacyId,
      issueUuid: mapping.issueUuid,
      issueIdentifier: mapping.issueIdentifier,
      descriptionUpdateRequired: live.descriptionFingerprint !== descriptionFingerprint(planned.description),
      priorityUpdateRequired: live.priority !== planned.priority,
      executionRelationsToAdd,
      requirementDependencyLegacyIdsToAdd,
      proofExecutionDependenciesToAdd,
    };
  });
  return assembleLinearAuthoritySemanticPlanV4(input.rootDir, reconciliations, {
    mode: "capture",
    captureEvidenceValidated: true,
    fingerprintSha256: sha256(input.fingerprintJson),
    descriptionCaptureSha256: sha256(input.descriptionsJson),
    recoveryMappingSha256: sha256(input.recoveryMappingJson),
    publicationSha256: sha256(input.publicationJson),
  });
}
