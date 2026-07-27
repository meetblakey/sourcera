#!/usr/bin/env node
// Phase 1 only: harden and reconcile canonical requirement identities.
// This bootstrap is not a Linear-only authority cutover and cannot authorize
// deletion of frozen repository migration inputs.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { applyFeatureDependencies, type FeatureDependencyRepair } from "./lib/dependencies.js";
import {
  adoptStableMappings,
  assertPhase1WriteModeAllowed,
  validateRecoveryCheckpoint,
  type ManagedLiveIssue,
  type ManagedPlanRow,
  type StableMapping,
} from "./lib/linear-authority-migration.js";
import { canonicalLinearRelationKey, type LinearCapture } from "./lib/linear-live.js";
import { parseFeatureInventory } from "./lib/sources.js";

const TEAM_ID = "ee9dd198-4816-4836-9226-42765878d793";
const STATE_IDS = {
  Approved: "f7372f4e-b2ef-4740-896a-5a213d7517be",
  Superseded: "c1b10439-5c3a-4ff9-b2cf-52bfdfb34a41",
  Retired: "9e749881-8f52-4df2-8326-c8bbce0377b7",
} as const;
const RECOVERY_MAP_SHA256 = "249864f1345fa80768d3c4cd4ad24d41c0be583449855a92dc7771237e53c6eb";
const RECOVERY_FINGERPRINT_SHA256 = "ce4ce37149c6cef508fa6d3d720d45edb0e895e18a5e4567b87f085bce0a0ac0";
const RECOVERY_MAP_COUNT = 186;
const RECOVERY_CURRENT_RELATIONS = 395;
const RECOVERY_DESIRED_RELATIONS = 473;
const RECOVERY_MISSING_RELATIONS = 78;
const RECOVERY_DESCRIPTION_UPDATES = 61;
const RECOVERY_FIELD_UPDATES = 1;
const compare = (left: string, right: string): number => left.localeCompare(right, undefined, { numeric: true });
const unique = (values: string[]): string[] => [...new Set(values)].sort(compare);
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");
const fingerprint = (value: unknown): string => sha256(JSON.stringify(value));

interface InventoryRow { legacyId: string; title: string; summary: string; primaryAnchor: string; dependencies: string[]; }
interface DispositionRow {
  requirementId: string;
  disposition: "proof_only" | "narrative_context" | "superseded" | "retired_source";
  replacementId?: string;
  rationale: string;
}
interface SnapshotIssue {
  id: string;
  linearId: string;
  sourceId: string | null;
  sourceFamilyId?: string | null;
  project: string;
  projectId: string;
  priority: number;
}
interface PlannedIssue {
  legacyId: string;
  targetPlanKey: string;
  title: string;
  description: string;
  project: string;
  projectId: string;
  state: keyof typeof STATE_IDS;
  label: "Requirement" | "Decision";
  priority: number;
  primaryExecutionIdentifier: string | null;
  executionIdentifiers: string[];
  requirementDependencies: string[];
  requirementRelations: string[];
  proofRelations: string[];
  disposition?: DispositionRow["disposition"];
}
interface MigrationPlan { requirements: PlannedIssue[]; decisions: PlannedIssue[]; sequence: string[]; }
interface RecoveryAudit {
  currentRelations: number;
  desiredRelations: number;
  missingRelations: number;
  extraRelations: number;
  descriptionUpdates: number;
  fieldUpdates: number;
}

function cells(line: string): string[] {
  return line.split(/(?<!\\)\|/).slice(1, -1).map((value) => value.trim().replace(/\\\|/g, "|"));
}

function inventoryRows(markdown: string): InventoryRow[] {
  return markdown.split(/\r?\n/).flatMap((line) => {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) return [];
    const [legacyId, rawTitle, , primaryAnchor, , , , summary, dependencyCell] = cells(line);
    return [{
      legacyId,
      title: rawTitle.replace(/^AE-[A-Z0-9.]+(?:-[A-Z0-9.]+)*:\s*/i, "").trim(),
      summary,
      primaryAnchor,
      dependencies: dependencyCell === "—" ? [] : [...dependencyCell.matchAll(/F-(?:AE-|BC-)?\d+/g)].map((match) => match[0]),
    }];
  });
}

const cleanTitle = (value: string): string => value.replace(/Appendix M/gi, "Surface and engine mapping").replace(/§M\.5/gi, "Runtime gate catalog").trim();
const cleanText = (value: string): string => value
  .replace(/Sourcera_Master_Spec\.md|Master Spec/gi, "canonical specification")
  .replace(/\s*\[verify[^\]]*\]/gi, "")
  .replace(/\s*\[AE:\s*pending\]/gi, "")
  .replace(/\b(?:F-(?:AE-|BC-)?\d+|RG:[a-z0-9_]+|AE-(?:V|\d)[A-Za-z0-9.-]*|D-(?:\d|[A-Z]{2,}-)[A-Za-z0-9.-]*)\b/gi, "the related canonical Linear entity")
  .replace(/\s+/g, " ").trim();
const titleOverrides = new Map<string, string>([
  ["F-AE-001", "DSAR Cascade Acceptance Criteria"],
  ["F-AE-003", "Cross-Org PII Handling Acceptance Gates"],
  ["F-AE-004", "Convex Reactivity Contract Rules and SLO"],
  ["F-AE-026", "Defense View Generation Capability Contract Extension"],
  ["F-AE-018", "External Provider Health Detector Routing Catalog"],
]);
const fallbackProjects = new Map<string, string>([
  ["F-199", "Seller Console & Onboarding"], ["F-608", "Operations & Support Console"],
  ["F-609", "Operations & Support Console"], ["F-610", "Operations & Support Console"],
  ["F-611", "Operations & Support Console"], ["F-794", "QA, Release, Deployment & Launch"],
  ["F-887", "Integrations, API, Webhooks & MCP"], ["F-888", "Agent & Intelligence Capabilities"],
  ["F-889", "Seller Knowledge, Profile & Capabilities"], ["F-890", "Seller Knowledge, Profile & Capabilities"],
  ["F-891", "Seller Knowledge, Profile & Capabilities"], ["F-892", "Agent & Intelligence Capabilities"],
  ["F-893", "Agent & Intelligence Capabilities"], ["F-894", "Seller Knowledge, Profile & Capabilities"],
  ["F-895", "Seller Knowledge, Profile & Capabilities"], ["F-896", "Agent & Intelligence Capabilities"],
  ["F-AE-069", "QA, Release, Deployment & Launch"],
  ["F-AE-071", "Product Analytics, Growth & Network Effects"],
  ["F-AE-072", "Marketplace Discovery, Matching & Trust"],
]);

function fallbackProject(legacyId: string): string | null {
  if (fallbackProjects.has(legacyId)) return fallbackProjects.get(legacyId)!;
  if (/^F-(?:79[5-9]|8(?:0[4-9]|1\d|2\d|3[0-6]))$/.test(legacyId)) return "QA, Release, Deployment & Launch";
  if (/^F-8(?:3[8-9]|4\d|5[0-8])$/.test(legacyId)) return "Billing, Pricing & Entitlements";
  return null;
}

function buildPlan(): MigrationPlan {
  const inventoryMarkdown = readFileSync("_audit/FEATURE_INVENTORY.md", "utf8");
  const sourceRows = parseFeatureInventory(inventoryMarkdown);
  const rows = inventoryRows(inventoryMarkdown);
  const rowById = new Map(rows.map((row) => [row.legacyId, row]));
  const snapshot = JSON.parse(readFileSync("delivery/linear-snapshot.json", "utf8")) as { issues: SnapshotIssue[] };
  const dispositionRows = (JSON.parse(readFileSync("delivery/dispositions.json", "utf8")) as { overrides: DispositionRow[] }).overrides;
  const dispositions = new Map(dispositionRows.map((row) => [row.requirementId, row]));
  const repairs = (JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as { repairs: FeatureDependencyRepair[] }).repairs;
  const dependencies = new Map(applyFeatureDependencies(sourceRows, repairs).map((row) => [row.requirementId, row.dependencies]));
  const executableIds = new Set(rows.filter((row) => !dispositions.has(row.legacyId)).map((row) => row.legacyId));
  const issueBySource = new Map(snapshot.issues.filter((issue) => issue.sourceId).map((issue) => [issue.sourceId!, issue]));
  const executionFor = (id: string): SnapshotIssue[] => snapshot.issues.filter((issue) => issue.sourceId === id || issue.sourceFamilyId === id).sort((a, b) => compare(a.id, b.id));
  const resolveDependencies = (id: string): { requirements: string[]; proofs: string[] } => {
    const requirements: string[] = [];
    const proofs: string[] = [];
    for (const dependency of dependencies.get(id) ?? []) {
      if (executableIds.has(dependency)) requirements.push(dependency);
      else {
        const disposition = dispositions.get(dependency);
        if (disposition?.disposition === "superseded" && disposition.replacementId && executableIds.has(disposition.replacementId)) requirements.push(disposition.replacementId);
        else if (disposition?.disposition === "proof_only" && disposition.replacementId?.startsWith("RG:")) {
          const proof = issueBySource.get(disposition.replacementId);
          if (!proof) throw new Error(`Missing proof owner ${disposition.replacementId}`);
          proofs.push(proof.id);
        } else throw new Error(`Unresolvable dependency ${id} -> ${dependency}`);
      }
    }
    return { requirements: unique(requirements), proofs: unique(proofs) };
  };
  const requirements = rows.filter((row) => executableIds.has(row.legacyId)).map((row): PlannedIssue => {
    const execution = executionFor(row.legacyId);
    const primary = execution.filter((issue) => issue.sourceId === row.legacyId);
    if (primary.length !== 1) throw new Error(`${row.legacyId} has ${primary.length} primary execution owners`);
    const resolved = resolveDependencies(row.legacyId);
    return {
      legacyId: row.legacyId,
      targetPlanKey: `issue:${row.legacyId}`,
      title: titleOverrides.get(row.legacyId) ?? cleanTitle(row.title),
      description: `## Binding outcome\n\n${cleanText(row.summary)}\n\n## Authority\n\nThis issue is the canonical requirement identity and lifecycle record. Detailed structured contracts and acceptance rules are linked from canonical Linear documents.\n\n## Verification\n\nImplementation evidence must satisfy the related execution work and current runtime gates. Requirement approval does not itself prove runtime readiness.`,
      project: primary[0].project,
      projectId: primary[0].projectId,
      state: "Approved",
      label: "Requirement",
      priority: primary[0].priority,
      primaryExecutionIdentifier: primary[0].id,
      executionIdentifiers: execution.map((issue) => issue.id),
      requirementDependencies: resolved.requirements,
      requirementRelations: [],
      proofRelations: resolved.proofs,
    };
  });
  const requirementById = new Map(requirements.map((row) => [row.legacyId, row]));
  const projectScope = JSON.parse(readFileSync("delivery/linear-project-scope.json", "utf8")) as { projects: Array<{ id: string; name: string }> };
  const projectIdByName = new Map(projectScope.projects.map((row) => [row.name, row.id]));
  const decisions = dispositionRows.map((disposition): PlannedIssue => {
    const row = rowById.get(disposition.requirementId);
    if (!row) throw new Error(`Missing disposition row ${disposition.requirementId}`);
    const config = {
      proof_only: { prefix: "Classify", suffix: "as runtime proof only", state: "Approved" as const },
      narrative_context: { prefix: "Retire", suffix: "as non-binding context", state: "Retired" as const },
      superseded: { prefix: "Supersede", suffix: "with its canonical successor", state: "Superseded" as const },
      retired_source: { prefix: "Retire", suffix: "as duplicated historical source", state: "Retired" as const },
    }[disposition.disposition];
    const normalized = dependencies.get(disposition.requirementId) ?? [];
    const requirementRelations = unique([...normalized.filter((id) => executableIds.has(id)), ...(disposition.replacementId && executableIds.has(disposition.replacementId) ? [disposition.replacementId] : [])]);
    const proofRelations = disposition.replacementId?.startsWith("RG:") && issueBySource.has(disposition.replacementId) ? [issueBySource.get(disposition.replacementId)!.id] : [];
    const project = fallbackProject(disposition.requirementId);
    const projectId = project ? projectIdByName.get(project) : null;
    if (!project || !projectId) throw new Error(`Missing disposition project ${disposition.requirementId}`);
    return {
      legacyId: disposition.requirementId,
      targetPlanKey: `issue:${disposition.requirementId}`,
      title: `${config.prefix} ${cleanTitle(row.title)} ${config.suffix}`,
      description: `## Decision\n\n${cleanText(disposition.rationale)}\n\n## Effect\n\nThis item does not create a standalone binding product requirement. The archived migration receipt preserves its former registry mapping. Current behavior, execution, and proof remain with the native related Linear entities.`,
      project, projectId, state: config.state, label: "Decision", priority: 3,
      primaryExecutionIdentifier: null, executionIdentifiers: [], requirementDependencies: [], requirementRelations, proofRelations,
      disposition: disposition.disposition,
    };
  });
  const all = [...requirements, ...decisions];
  if (new Set(all.map((row) => row.title)).size !== all.length) throw new Error("Active title collision");
  const sequence: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`Dependency cycle ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of requirementById.get(id)!.requirementDependencies) visit(dependency);
    visiting.delete(id); visited.add(id); sequence.push(id);
  };
  for (const row of requirements.sort((a, b) => compare(a.legacyId, b.legacyId))) visit(row.legacyId);
  if (requirements.length !== 926 || decisions.length !== 61 || sequence.length !== 926) throw new Error("Migration plan count mismatch");
  const splitRows = requirements.filter((row) => row.executionIdentifiers.length > 1);
  const splitRelations = splitRows.reduce((total, row) => total + row.executionIdentifiers.length - 1, 0);
  const normalizedDependencyEdges = [...dependencies.values()].reduce((total, row) => total + row.length, 0);
  if (splitRows.length !== 37 || splitRelations !== 102 || normalizedDependencyEdges !== 1_360) throw new Error("Migration plan relation coverage mismatch");
  return { requirements, decisions, sequence };
}

function managedPlans(plan: MigrationPlan): ManagedPlanRow[] {
  return [...plan.requirements, ...plan.decisions].map((row) => ({ legacyId: row.legacyId, targetPlanKey: row.targetPlanKey, title: row.title, primaryExecutionUuid: row.primaryExecutionIdentifier, desiredRelationKeys: [] }));
}

function managedLive(capture: LinearCapture): ManagedLiveIssue[] {
  return capture.fingerprint.issues.filter((issue) => issue.teamId === TEAM_ID).map((issue) => ({ id: issue.linearId!, identifier: issue.identifier, title: issue.title, teamId: issue.teamId, relationKeys: issue.relations, archivedAt: issue.archivedAt }));
}

function planDigest(plan: MigrationPlan): string {
  return fingerprint({ requirements: plan.requirements, decisions: plan.decisions, sequence: plan.sequence });
}

function recoveryAudit(plan: MigrationPlan, capture: LinearCapture, mappings: StableMapping[]): RecoveryAudit {
  if (mappings.filter((row) => row.issueIdentifier !== null).length !== RECOVERY_MAP_COUNT) throw new Error("Recovery mapping count differs from the verified checkpoint");
  const planByLegacy = new Map([...plan.requirements, ...plan.decisions].map((row) => [row.legacyId, row]));
  const mappingByLegacy = new Map(mappings.map((row) => [row.legacyId, row]));
  const currentMappings = mappings.filter((row): row is StableMapping & { issueIdentifier: string } => row.issueIdentifier !== null);
  const desiredRelations = new Set<string>();
  for (const mapping of currentMappings) {
    const row = planByLegacy.get(mapping.legacyId)!;
    for (const identifier of unique([...row.executionIdentifiers, ...row.proofRelations])) desiredRelations.add(canonicalLinearRelationKey("related", mapping.issueIdentifier, identifier));
    for (const dependency of row.requirementDependencies) {
      const related = mappingByLegacy.get(dependency)?.issueIdentifier;
      if (related) desiredRelations.add(canonicalLinearRelationKey("blocks", related, mapping.issueIdentifier));
    }
    for (const relation of row.requirementRelations) {
      const related = mappingByLegacy.get(relation)?.issueIdentifier;
      if (related) desiredRelations.add(canonicalLinearRelationKey("related", mapping.issueIdentifier, related));
    }
  }
  const currentIdentifiers = new Set(currentMappings.map((row) => row.issueIdentifier));
  const currentIssues = capture.fingerprint.issues.filter((row) => currentIdentifiers.has(row.identifier));
  const currentRelations = new Set(currentIssues.flatMap((row) => row.relations));
  const missingRelations = [...desiredRelations].filter((key) => !currentRelations.has(key));
  const extraRelations = [...currentRelations].filter((key) => !desiredRelations.has(key));
  let descriptionUpdates = 0;
  let fieldUpdates = 0;
  for (const mapping of currentMappings) {
    const row = planByLegacy.get(mapping.legacyId)!;
    const live = currentIssues.find((issue) => issue.identifier === mapping.issueIdentifier);
    if (!live) throw new Error(`Recovery issue ${mapping.issueIdentifier} is missing`);
    if (live.descriptionFingerprint !== sha256(row.description)) descriptionUpdates += 1;
    const expected = { title: row.title, priority: row.priority, stateId: STATE_IDS[row.state], projectId: row.projectId, labels: [row.label] };
    const actual = { title: live.title, priority: live.priority, stateId: live.stateId, projectId: live.projectId, labels: [...live.labels].sort() };
    if (fingerprint(expected) !== fingerprint(actual)) fieldUpdates += 1;
  }
  const audit = { currentRelations: currentRelations.size, desiredRelations: desiredRelations.size, missingRelations: missingRelations.length, extraRelations: extraRelations.length, descriptionUpdates, fieldUpdates };
  const expected = { currentRelations: RECOVERY_CURRENT_RELATIONS, desiredRelations: RECOVERY_DESIRED_RELATIONS, missingRelations: RECOVERY_MISSING_RELATIONS, extraRelations: 0, descriptionUpdates: RECOVERY_DESCRIPTION_UPDATES, fieldUpdates: RECOVERY_FIELD_UPDATES };
  if (fingerprint(audit) !== fingerprint(expected)) throw new Error(`Recovery delta differs from the independently audited checkpoint: ${JSON.stringify(audit)}`);
  return audit;
}

async function main(): Promise<void> {
  const plan = buildPlan();
  const mode = process.argv.includes("--mode") ? process.argv[process.argv.indexOf("--mode") + 1] : "plan";
  if (mode === "plan") {
    process.stdout.write(`${JSON.stringify({ scope: "phase_1_requirement_bootstrap", cutoverReady: false, preflightEnabled: false, applyEnabled: false, auditedPlanManifestRequired: true, auditedPlanValidated: false, allocationManifestRequired: true, allocationContract: "external digest-pinned UUIDv4 targets keyed by the exact audited plan", requirements: plan.requirements.length, decisions: plan.decisions.length, sequence: plan.sequence.length, planDigest: planDigest(plan), recoveryMapSha256: RECOVERY_MAP_SHA256, recoveryFingerprintSha256: RECOVERY_FINGERPRINT_SHA256, nextPhase: "supply and validate the audited semantic plan manifest, preallocate UUIDv4 targets, add live-header capacity reservation plus bounded checkpoint/resume, then generate the lossless normative-block and document manifest" })}\n`);
    return;
  }
  if (mode === "recovery-check") {
    const recoveryIndex = process.argv.indexOf("--recovery-map");
    const fingerprintIndex = process.argv.indexOf("--fingerprint");
    const recoveryPath = recoveryIndex >= 0 ? process.argv[recoveryIndex + 1] : "";
    const fingerprintPath = fingerprintIndex >= 0 ? process.argv[fingerprintIndex + 1] : "";
    if (!recoveryPath || !fingerprintPath) throw new Error("recovery-check requires --recovery-map and --fingerprint");
    const recoveryRaw = readFileSync(recoveryPath, "utf8");
    const fingerprintRaw = readFileSync(fingerprintPath, "utf8");
    if (sha256(fingerprintRaw) !== RECOVERY_FINGERPRINT_SHA256) throw new Error("Recovery fingerprint digest mismatch");
    const recoveryMappings = validateRecoveryCheckpoint(recoveryRaw, RECOVERY_MAP_SHA256, new Set([...plan.requirements, ...plan.decisions].map((row) => row.legacyId)));
    const capture = { fingerprint: JSON.parse(fingerprintRaw) as LinearCapture["fingerprint"], issueDescriptions: [] };
    const mappings = adoptStableMappings(managedPlans(plan), managedLive(capture), TEAM_ID, recoveryMappings);
    process.stdout.write(`${JSON.stringify({ status: "recovery_checkpoint_verified", mappings: recoveryMappings.length, ...recoveryAudit(plan, capture, mappings) })}\n`);
    return;
  }
  assertPhase1WriteModeAllowed(mode);
  throw new Error("Mode must be plan or recovery-check; execution and compensation modes are intentionally unavailable");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
