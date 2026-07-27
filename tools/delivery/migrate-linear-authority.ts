#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { applyFeatureDependencies, type FeatureDependencyRepair } from "./lib/dependencies.js";
import { canonicalLinearRelationKey, fetchLinearCapture } from "./lib/linear-live.js";
import { parseFeatureInventory } from "./lib/sources.js";

const ENDPOINT = "https://api.linear.app/graphql";
const TEAM_KEY = "REQ";
const RECEIPT_PATH = "/tmp/linear-authority-migration-receipt.json";
const compare = (left: string, right: string): number => left.localeCompare(right, undefined, { numeric: true });
const unique = (values: string[]): string[] => [...new Set(values)].sort(compare);
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

interface InventoryRow {
  legacyId: string;
  title: string;
  summary: string;
  primaryAnchor: string;
  dependencies: string[];
}

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
  priority: number;
}

interface PlannedIssue {
  legacyId: string;
  title: string;
  description: string;
  project: string;
  state: string;
  label: "Requirement" | "Decision";
  priority: number;
  executionIds: string[];
  requirementDependencies: string[];
  requirementRelations: string[];
  proofRelations: string[];
  disposition?: DispositionRow["disposition"];
}

interface LiveIssue {
  uuid: string;
  identifier: string;
  title: string;
}

interface GraphqlResult<T> { data?: T; errors?: Array<{ message: string }>; }

async function graphql<T>(token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: token },
      body: JSON.stringify({ query, variables }),
    });
    const payload = await response.json() as GraphqlResult<T>;
    if (response.ok && !payload.errors?.length && payload.data) return payload.data;
    const message = payload.errors?.map((error) => error.message).join("; ") || `HTTP ${response.status}`;
    if (attempt === 5 || (response.status !== 429 && response.status < 500)) throw new Error(`Linear GraphQL: ${message}`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw new Error("Linear GraphQL retry bound exhausted");
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

const cleanTitle = (value: string): string => value
  .replace(/Appendix M/gi, "Surface and engine mapping")
  .replace(/§M\.5/gi, "Runtime gate catalog")
  .trim();
const cleanText = (value: string): string => value
  .replace(/Sourcera_Master_Spec\.md|Master Spec/gi, "canonical specification")
  .replace(/\s*\[verify[^\]]*\]/gi, "")
  .replace(/\s*\[AE:\s*pending\]/gi, "")
  .replace(/\b(?:F-(?:AE-|BC-)?\d+|RG:[a-z0-9_]+|AE-(?:V|\d)[A-Za-z0-9.-]*|D-(?:\d|[A-Z]{2,}-)[A-Za-z0-9.-]*)\b/gi, "the related canonical Linear entity")
  .replace(/\s+/g, " ")
  .trim();

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

function buildPlan(): { requirements: PlannedIssue[]; decisions: PlannedIssue[]; sequence: string[] } {
  const inventoryMarkdown = readFileSync("_audit/FEATURE_INVENTORY.md", "utf8");
  const sourceRows = parseFeatureInventory(inventoryMarkdown);
  const rows = inventoryRows(inventoryMarkdown);
  const rowById = new Map(rows.map((row) => [row.legacyId, row]));
  const snapshot = JSON.parse(readFileSync("delivery/linear-snapshot.json", "utf8")) as { issues: SnapshotIssue[] };
  const dispositionRows = (JSON.parse(readFileSync("delivery/dispositions.json", "utf8")) as { overrides: DispositionRow[] }).overrides;
  const dispositions = new Map(dispositionRows.map((row) => [row.requirementId, row]));
  const repairs = (JSON.parse(readFileSync("delivery/feature-dependencies.json", "utf8")) as { repairs: FeatureDependencyRepair[] }).repairs;
  const repaired = applyFeatureDependencies(sourceRows, repairs);
  const dependencies = new Map(repaired.map((row) => [row.requirementId, row.dependencies]));
  const executableIds = new Set(rows.filter((row) => !dispositions.has(row.legacyId)).map((row) => row.legacyId));
  const issueBySource = new Map(snapshot.issues.filter((issue) => issue.sourceId).map((issue) => [issue.sourceId!, issue]));
  const executionFor = (id: string): SnapshotIssue[] => snapshot.issues.filter((issue) => issue.sourceId === id || issue.sourceFamilyId === id).sort((a, b) => compare(a.id, b.id));
  const resolvedDependencies = (id: string): { requirements: string[]; proofs: string[] } => {
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
    const resolved = resolvedDependencies(row.legacyId);
    return {
      legacyId: row.legacyId,
      title: titleOverrides.get(row.legacyId) ?? cleanTitle(row.title),
      description: `## Binding outcome\n\n${cleanText(row.summary)}\n\n## Authority\n\nThis issue is the canonical requirement identity and lifecycle record. Detailed structured contracts and acceptance rules are linked from canonical Linear documents.\n\n## Verification\n\nImplementation evidence must satisfy the related execution work and current runtime gates. Requirement approval does not itself prove runtime readiness.`,
      project: primary[0].project,
      state: "Approved",
      label: "Requirement",
      priority: primary[0].priority,
      executionIds: execution.map((issue) => issue.id),
      requirementDependencies: resolved.requirements,
      requirementRelations: [],
      proofRelations: resolved.proofs,
    };
  });
  const requirementById = new Map(requirements.map((row) => [row.legacyId, row]));

  const decisions = dispositionRows.map((disposition): PlannedIssue => {
    const row = rowById.get(disposition.requirementId);
    if (!row) throw new Error(`Missing disposition row ${disposition.requirementId}`);
    const config = {
      proof_only: { prefix: "Classify", suffix: "as runtime proof only", state: "Approved" },
      narrative_context: { prefix: "Retire", suffix: "as non-binding context", state: "Retired" },
      superseded: { prefix: "Supersede", suffix: "with its canonical successor", state: "Superseded" },
      retired_source: { prefix: "Retire", suffix: "as duplicated historical source", state: "Retired" },
    }[disposition.disposition];
    const normalized = dependencies.get(disposition.requirementId) ?? [];
    const requirementRelations = unique([
      ...normalized.filter((id) => executableIds.has(id)),
      ...(disposition.replacementId && executableIds.has(disposition.replacementId) ? [disposition.replacementId] : []),
    ]);
    const proofRelations = disposition.replacementId?.startsWith("RG:") && issueBySource.has(disposition.replacementId)
      ? [issueBySource.get(disposition.replacementId)!.id] : [];
    const project = fallbackProject(disposition.requirementId);
    if (!project) throw new Error(`Missing disposition project ${disposition.requirementId}`);
    return {
      legacyId: disposition.requirementId,
      title: `${config.prefix} ${cleanTitle(row.title)} ${config.suffix}`,
      description: `## Decision\n\n${cleanText(disposition.rationale)}\n\n## Effect\n\nThis item does not create a standalone binding product requirement. The archived migration receipt preserves its former registry mapping. Current behavior, execution, and proof remain with the native related Linear entities.`,
      project,
      state: config.state,
      label: "Decision",
      priority: 3,
      executionIds: [],
      requirementDependencies: [],
      requirementRelations,
      proofRelations,
      disposition: disposition.disposition,
    };
  });

  const titles = [...requirements, ...decisions].map((row) => row.title);
  if (new Set(titles).size !== titles.length) throw new Error("Active title collision");
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
  return { requirements, decisions, sequence };
}

const CATALOG_QUERY = `query AuthorityCatalogs { issueLabels(first: 250) { nodes { id name } pageInfo { hasNextPage } } workflowStates(first: 250) { nodes { id name team { id key } } pageInfo { hasNextPage } } }`;
const ISSUE_CREATE = `mutation AuthorityIssueCreate($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title } } }`;
const ISSUE_UPDATE = `mutation AuthorityIssueUpdate($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success issue { id identifier title } } }`;
const RELATION_CREATE = `mutation AuthorityRelationCreate($input: IssueRelationCreateInput!) { issueRelationCreate(input: $input) { success issueRelation { id type } } }`;
const ISSUE_READ = `query AuthorityIssueRead($id: String!) { issue(id: $id) { id identifier title description priority archivedAt state { id name } team { id key } project { id name } labels(first: 100) { nodes { id name } pageInfo { hasNextPage } } relations(first: 100) { nodes { type issue { id identifier } relatedIssue { id identifier } } pageInfo { hasNextPage } } inverseRelations(first: 100) { nodes { type issue { id identifier } relatedIssue { id identifier } } pageInfo { hasNextPage } } } }`;

interface CatalogData { issueLabels: { nodes: Array<{ id: string; name: string }>; pageInfo: { hasNextPage: boolean } }; workflowStates: { nodes: Array<{ id: string; name: string; team: { id: string; key: string } }>; pageInfo: { hasNextPage: boolean } }; }
interface MutationData { issueCreate?: { success: boolean; issue: { id: string; identifier: string; title: string } | null }; issueUpdate?: { success: boolean; issue: { id: string; identifier: string; title: string } | null }; issueRelationCreate?: { success: boolean; issueRelation: { id: string; type: string } | null }; }
interface ReadData { issue: { id: string; identifier: string; title: string; description: string | null; priority: number; archivedAt: string | null; state: { id: string; name: string }; team: { id: string; key: string }; project: { id: string; name: string } | null; labels: { nodes: Array<{ id: string; name: string }>; pageInfo: { hasNextPage: boolean } }; relations: { nodes: Array<{ type: string; issue: { id: string; identifier: string }; relatedIssue: { id: string; identifier: string } }>; pageInfo: { hasNextPage: boolean } }; inverseRelations: { nodes: Array<{ type: string; issue: { id: string; identifier: string }; relatedIssue: { id: string; identifier: string } }>; pageInfo: { hasNextPage: boolean } }; } | null; }

function relationKeys(issue: NonNullable<ReadData["issue"]>): Set<string> {
  if (issue.relations.pageInfo.hasNextPage || issue.inverseRelations.pageInfo.hasNextPage) throw new Error(`${issue.identifier} relations truncated`);
  return new Set([...issue.relations.nodes, ...issue.inverseRelations.nodes].map((relation) => canonicalLinearRelationKey(relation.type, relation.issue.identifier, relation.relatedIssue.identifier)));
}

async function pool<T>(rows: T[], concurrency: number, work: (row: T) => Promise<void>): Promise<void> {
  const pending = [...rows];
  const workers = Array.from({ length: Math.min(concurrency, pending.length) }, async () => {
    while (pending.length) await work(pending.shift()!);
  });
  await Promise.all(workers);
}

async function main(): Promise<void> {
  const plan = buildPlan();
  if (process.argv.includes("--plan-only")) {
    process.stdout.write(`${JSON.stringify({ requirements: plan.requirements.length, decisions: plan.decisions.length, sequence: plan.sequence.length })}\n`);
    return;
  }
  const token = process.env.LINEAR_API_KEY?.trim();
  if (!token) throw new Error("LINEAR_API_KEY is required");
  const capture = await fetchLinearCapture(fetch, token);
  const reqIssues = capture.fingerprint.issues.filter((issue) => issue.team === TEAM_KEY && issue.archivedAt === null);
  const byTitle = new Map<string, LiveIssue>();
  for (const issue of reqIssues) {
    if (byTitle.has(issue.title)) throw new Error(`Duplicate Requirements title ${issue.title}`);
    byTitle.set(issue.title, { uuid: issue.linearId!, identifier: issue.identifier, title: issue.title });
  }
  const executionByIdentifier = new Map(capture.fingerprint.issues.map((issue) => [issue.identifier, issue]));
  const projects = new Map(capture.fingerprint.projects.filter((project) => project.archivedAt === null).map((project) => [project.name, project.id]));
  const catalogs = await graphql<CatalogData>(token, CATALOG_QUERY);
  if (catalogs.issueLabels.pageInfo.hasNextPage || catalogs.workflowStates.pageInfo.hasNextPage) throw new Error("Linear catalog truncated");
  const labels = new Map(catalogs.issueLabels.nodes.map((row) => [row.name, row.id]));
  for (const name of ["Requirement", "Decision"] as const) {
    if (labels.has(name)) continue;
    const labeled = capture.fingerprint.issues.find((issue) => issue.labels.includes(name) && issue.linearId);
    if (!labeled?.linearId) throw new Error(`Label missing ${name}`);
    const readback = await graphql<ReadData>(token, ISSUE_READ, { id: labeled.linearId });
    const label = readback.issue?.labels.nodes.find((candidate) => candidate.name === name);
    if (!label) throw new Error(`Label missing ${name}`);
    labels.set(name, label.id);
  }
  const states = new Map(catalogs.workflowStates.nodes.filter((row) => row.team.key === TEAM_KEY).map((row) => [row.name, row.id]));
  const requirementTeam = reqIssues[0]?.teamId;
  if (!requirementTeam) throw new Error("Requirements team missing");
  for (const name of ["Requirement", "Decision"]) if (!labels.has(name)) throw new Error(`Label missing ${name}`);
  for (const name of ["Approved", "Superseded", "Retired"]) if (!states.has(name)) throw new Error(`State missing ${name}`);

  const liveByLegacy = new Map<string, LiveIssue>();
  const planByLegacy = new Map(plan.requirements.map((row) => [row.legacyId, row]));
  const receipt: Array<Record<string, unknown>> = [];

  const upsert = async (row: PlannedIssue): Promise<LiveIssue> => {
    const projectId = projects.get(row.project);
    const stateId = states.get(row.state);
    const labelId = labels.get(row.label);
    if (!projectId || !stateId || !labelId) throw new Error(`Native field unavailable ${row.title}`);
    const input = { title: row.title, description: row.description, teamId: requirementTeam, projectId, stateId, labelIds: [labelId], priority: row.priority };
    const existing = byTitle.get(row.title);
    let live: LiveIssue;
    if (existing) {
      const data = await graphql<MutationData>(token, ISSUE_UPDATE, { id: existing.uuid, input });
      const issue = data.issueUpdate?.issue;
      if (!data.issueUpdate?.success || !issue) throw new Error(`Update failed ${row.title}`);
      live = { uuid: issue.id, identifier: issue.identifier, title: issue.title };
    } else {
      const data = await graphql<MutationData>(token, ISSUE_CREATE, { input });
      const issue = data.issueCreate?.issue;
      if (!data.issueCreate?.success || !issue) throw new Error(`Create failed ${row.title}`);
      live = { uuid: issue.id, identifier: issue.identifier, title: issue.title };
      byTitle.set(row.title, live);
    }
    return live;
  };

  const applyRelationsAndRead = async (row: PlannedIssue, live: LiveIssue): Promise<void> => {
    const desired: Array<{ key: string; input: { issueId: string; relatedIssueId: string; type: string } }> = [];
    for (const identifier of unique([...row.executionIds, ...row.proofRelations])) {
      const related = executionByIdentifier.get(identifier);
      if (!related?.linearId) throw new Error(`Missing execution ${identifier}`);
      desired.push({ key: canonicalLinearRelationKey("related", live.identifier, identifier), input: { issueId: live.uuid, relatedIssueId: related.linearId, type: "related" } });
    }
    for (const dependency of row.requirementDependencies) {
      const prerequisite = liveByLegacy.get(dependency);
      if (!prerequisite) throw new Error(`Missing prerequisite ${row.legacyId} -> ${dependency}`);
      desired.push({ key: canonicalLinearRelationKey("blocks", prerequisite.identifier, live.identifier), input: { issueId: prerequisite.uuid, relatedIssueId: live.uuid, type: "blocks" } });
    }
    for (const relation of row.requirementRelations) {
      const related = liveByLegacy.get(relation);
      if (!related) throw new Error(`Missing requirement relation ${row.legacyId} -> ${relation}`);
      desired.push({ key: canonicalLinearRelationKey("related", live.identifier, related.identifier), input: { issueId: live.uuid, relatedIssueId: related.uuid, type: "related" } });
    }
    const before = await graphql<ReadData>(token, ISSUE_READ, { id: live.uuid });
    if (!before.issue) throw new Error(`Read failed ${live.identifier}`);
    const existingRelations = relationKeys(before.issue);
    await pool(desired.filter((relation) => !existingRelations.has(relation.key)), 12, async (relation) => {
      const data = await graphql<MutationData>(token, RELATION_CREATE, { input: relation.input });
      if (!data.issueRelationCreate?.success || !data.issueRelationCreate.issueRelation) throw new Error(`Relation create failed ${live.identifier}`);
    });
    const after = await graphql<ReadData>(token, ISSUE_READ, { id: live.uuid });
    const issue = after.issue;
    if (!issue || issue.archivedAt !== null || issue.title !== row.title || issue.description !== row.description || issue.priority !== row.priority || issue.team.key !== TEAM_KEY || issue.project?.name !== row.project || issue.state.name !== row.state || issue.labels.pageInfo.hasNextPage || JSON.stringify(issue.labels.nodes.map((label) => label.name).sort()) !== JSON.stringify([row.label])) throw new Error(`Field readback mismatch ${live.identifier}`);
    const afterRelations = relationKeys(issue);
    for (const relation of desired) if (!afterRelations.has(relation.key)) throw new Error(`Relation readback mismatch ${live.identifier}: ${relation.key}`);
    receipt.push({ legacyId: row.legacyId, issueUuid: live.uuid, issueIdentifier: live.identifier, title: live.title, state: row.state, label: row.label, descriptionSha256: sha256(row.description), relationCount: desired.length, disposition: row.disposition ?? "executable" });
  };

  for (const legacyId of plan.sequence) {
    const row = planByLegacy.get(legacyId)!;
    const live = await upsert(row);
    liveByLegacy.set(legacyId, live);
    await applyRelationsAndRead(row, live);
    if (receipt.length % 25 === 0) process.stdout.write(`published ${receipt.length}/${plan.requirements.length + plan.decisions.length}\n`);
  }
  for (const row of plan.decisions) {
    const live = await upsert(row);
    await applyRelationsAndRead(row, live);
  }

  const unexpected = [...byTitle.keys()].filter((title) => ![...plan.requirements, ...plan.decisions].some((row) => row.title === title));
  if (unexpected.length) throw new Error(`Unexpected Requirements issues: ${unexpected.join(", ")}`);
  const finalCapture = await fetchLinearCapture(fetch, token);
  const activeRequirements = finalCapture.fingerprint.issues.filter((issue) => issue.team === TEAM_KEY && issue.archivedAt === null);
  if (activeRequirements.length !== 987) throw new Error(`Expected 987 authority issues, found ${activeRequirements.length}`);
  const output = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    requirements: plan.requirements.length,
    decisions: plan.decisions.length,
    activeAuthorityIssues: activeRequirements.length,
    mappings: receipt.sort((a, b) => String(a.legacyId).localeCompare(String(b.legacyId), undefined, { numeric: true })),
    readbackSha256: sha256(JSON.stringify(activeRequirements.map((issue) => ({ id: issue.linearId, identifier: issue.identifier, title: issue.title, state: issue.state, project: issue.project, labels: issue.labels, relations: issue.relations })).sort((a, b) => a.identifier.localeCompare(b.identifier)))),
  };
  writeFileSync(RECEIPT_PATH, `${JSON.stringify(output)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ status: "complete", requirements: 926, decisions: 61, authorityIssues: 987, receipt: RECEIPT_PATH, readbackSha256: output.readbackSha256 })}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
