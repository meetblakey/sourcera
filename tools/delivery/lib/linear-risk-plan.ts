import { createHash } from "node:crypto";
import { canonicalAuthorityRelationPlanKey } from "./linear-authority-manifest.js";

export const LINEAR_RISK_PLAN_SCHEMA_VERSION = 1 as const;

export type LinearRiskCategory =
  | "delivery-risk"
  | "financial-risk"
  | "security-risk"
  | "compliance-risk";

export interface LinearRiskSourceRow {
  id: string;
  statement: string;
  owner: string;
  trigger: string;
  response: string;
}

export interface LinearRiskNativeCatalogSnapshot {
  liveCaptureRoot: string;
  semanticPlanRoot: string;
  semanticPlanValidated: true;
  catalogComplete: true;
  issuesComplete: true;
  capturedTeamIssueCount: number;
  team: { id: string; key: string; name: string; archivedAt: string | null };
  state: { id: string; name: string; type: string; teamId: string; archivedAt: string | null };
  assignee: { id: string; name: string; active: boolean; archivedAt: string | null };
  projects: Array<{ id: string; name: string; teamIds: string[]; archivedAt: string | null }>;
  labelGroups: Array<{ id: string; name: string; teamId: string | null; archivedAt: string | null }>;
  labels: Array<{ id: string; name: string; parentId: string; parentName: string; teamId: string | null; color: string; description: string; archivedAt: string | null }>;
  liveIssues: Array<{ issueUuid: string; title: string; description: string; archivedAt: string | null }>;
  relationEndpoints: Array<{ planKey: string; kind: "requirement" | "decision"; title: string; archivedAt: string | null }>;
}

export interface LinearRiskLabelSelector {
  planKey: string;
  name: string;
  parentId: string;
  parentName: "Type" | "Risk";
  id: string | null;
  create: boolean;
  semanticRole: "risk" | "risk_category";
  color: string;
  description: string;
}

export interface LinearRiskTarget {
  planKey: string;
  sourceRiskId: string;
  sourceDisposition: "active";
  duplicateOf: null;
  title: string;
  description: string;
  teamId: string;
  projectId: string;
  stateId: string;
  assigneeId: string;
  priority: 1 | 2 | 3 | 4;
  labelPlanKeys: string[];
}

export interface LinearRiskRelation {
  planKey: string;
  type: "related";
  sourcePlanKey: string;
  targetPlanKey: string;
}

export interface LinearRiskPublicationPlan {
  schemaVersion: 1;
  sourceSha256: string;
  liveCaptureRoot: string;
  semanticPlanRoot: string;
  labels: LinearRiskLabelSelector[];
  risks: LinearRiskTarget[];
  relations: LinearRiskRelation[];
  audit: {
    sourceRows: 24;
    active: 24;
    stale: 0;
    sourceDuplicates: 0;
    liveDuplicates: 0;
    relationEndpointsVerified: true;
    nativeRoutingValidated: true;
  };
  planRoot: string;
  mutationAuthorized: false;
}

interface RiskRoute {
  title: string;
  project: string;
  priority: 1 | 2 | 3 | 4;
  categories: LinearRiskCategory[];
  relatedRequirements: string[];
  relatedDecisions?: string[];
}

const RISK_ROUTES: Record<string, RiskRoute> = {
  "RISK-001": { title: "Risk: false work readiness", project: "Platform & Delivery Foundations", priority: 1, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-002": { title: "Risk: provider foundation sequencing", project: "Identity, Organizations & Permissions", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-003": { title: "Risk: Linear release membership drift", project: "QA, Release, Deployment & Launch", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-004": { title: "Risk: single-human approval capacity", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-005": { title: "Risk: missing Linear drift secret", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk", "security-risk"], relatedRequirements: [] },
  "RISK-006": { title: "Risk: R0 scope inflation", project: "QA, Release, Deployment & Launch", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-007": { title: "Risk: truncated Linear issue capture", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-008": { title: "Risk: external provider access delay", project: "QA, Release, Deployment & Launch", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-009": { title: "Risk: unresolved ownership defaults", project: "Platform & Delivery Foundations", priority: 1, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-010": { title: "Risk: unproved production rollback path", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk"], relatedRequirements: [], relatedDecisions: ["DEC-PROD-001"] },
  "RISK-011": { title: "Risk: live Convex candidate during human proof", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-012": { title: "Risk: partial first Vercel activation", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-013": { title: "Risk: mutable GitHub workflow attempt", project: "QA, Release, Deployment & Launch", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-014": { title: "Risk: unproved bootstrap authority", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk", "security-risk"], relatedRequirements: [] },
  "RISK-015": { title: "Risk: Vercel cancellation evidence loss", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-016": { title: "Risk: combined provider write authority", project: "Security, Privacy, Compliance & Residency", priority: 1, categories: ["security-risk"], relatedRequirements: [] },
  "RISK-017": { title: "Risk: expiring production authority history", project: "QA, Release, Deployment & Launch", priority: 1, categories: ["delivery-risk", "security-risk"], relatedRequirements: [] },
  "RISK-018": { title: "Risk: planning default treated as authority", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-019": { title: "Risk: premature legacy archive", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-020": { title: "Risk: duplicate Stripe meter effect", project: "Billing, Pricing & Entitlements", priority: 1, categories: ["financial-risk"], relatedRequirements: ["F-007"] },
  "RISK-021": { title: "Risk: conflicting sensitive source clauses", project: "Platform & Delivery Foundations", priority: 1, categories: ["financial-risk", "security-risk", "compliance-risk"], relatedRequirements: ["F-007", "F-132", "F-529", "F-593"] },
  "RISK-022": { title: "Risk: native Linear metadata drift", project: "Platform & Delivery Foundations", priority: 2, categories: ["delivery-risk"], relatedRequirements: [] },
  "RISK-023": { title: "Risk: unproved first billing pilot", project: "Product Analytics, Growth & Network Effects", priority: 2, categories: ["delivery-risk", "compliance-risk"], relatedRequirements: ["F-007"] },
  "RISK-024": { title: "Risk: central Convex schema collisions", project: "Platform & Delivery Foundations", priority: 1, categories: ["delivery-risk"], relatedRequirements: ["F-005"] },
};

const REQUIREMENT_TITLES: Record<string, string> = {
  "F-005": "Convex Backend & Real-Time Database",
  "F-007": "Stripe Billing Integration Completion",
  "F-132": "PricingTableVersion Entity",
  "F-529": "Billing Seat Count (Informational)",
  "F-593": "Data Retention & Deletion Registry",
};

const DECISION_TITLES: Record<string, string> = {
  "DEC-PROD-001": "Production staging and promotion remain fail-closed",
};

const LABEL_DEFINITIONS = [
  { name: "risk", parentName: "Type", semanticRole: "risk", color: "#E5484D", description: "Canonical delivery risk." },
  { name: "delivery-risk", parentName: "Risk", semanticRole: "risk_category", color: "#D97706", description: "Delivery, governance, readiness, or operational execution risk." },
  { name: "financial-risk", parentName: "Risk", semanticRole: "risk_category", color: "#A16207", description: "Billing, metering, pricing, or financial integrity risk." },
  { name: "security-risk", parentName: "Risk", semanticRole: "risk_category", color: "#B91C1C", description: "Security-sensitive implementation or proof work." },
  { name: "compliance-risk", parentName: "Risk", semanticRole: "risk_category", color: "#991B1B", description: "Compliance-sensitive implementation or proof work." },
] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DIGEST = /^[a-f0-9]{64}$/;
const LINEAR_REFERENCE = /(?:https?:\/\/linear\.app\/|\b[A-Z][A-Z0-9]{1,9}-\d+\b)/i;

function fail(message: string): never {
  throw new Error(`Linear risk plan: ${message}`);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalize(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function assertUuid(value: string, name: string): void {
  if (!UUID.test(value)) fail(`${name} is not a UUIDv4`);
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[], name: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(`${name} keys differ`);
}

function parseRisks(raw: string): LinearRiskSourceRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("delivery/risks.json is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) fail("risk source must be an object");
  assertExactKeys(parsed as Record<string, unknown>, ["risks"], "risk source");
  const rows = (parsed as { risks?: unknown }).risks;
  if (!Array.isArray(rows) || rows.length !== 24) fail("risk source must contain exactly 24 rows");
  return rows.map((candidate, index) => {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) fail(`risk row ${index + 1} is invalid`);
    const row = candidate as Record<string, unknown>;
    assertExactKeys(row, ["id", "statement", "owner", "trigger", "response"], `risk row ${index + 1}`);
    for (const field of ["id", "statement", "owner", "trigger", "response"] as const) {
      if (typeof row[field] !== "string" || row[field].length === 0 || row[field].trim() !== row[field]) fail(`risk row ${index + 1} ${field} is invalid`);
    }
    return row as unknown as LinearRiskSourceRow;
  });
}

function riskDescription(row: LinearRiskSourceRow): string {
  const trigger = row.id === "RISK-010"
    ? row.trigger.replace("DEC-PROD-001 prerequisite", "production-promotion prerequisite")
    : row.trigger;
  const description = `${row.statement}\n\n## Trigger\n\n${trigger}\n\n## Response\n\n${row.response}`;
  if (LINEAR_REFERENCE.test(description)) fail(`${row.id} embeds a Linear issue reference or URL`);
  return description;
}

export function buildLinearRiskPublicationPlan(
  risksRaw: string,
  native: LinearRiskNativeCatalogSnapshot,
): LinearRiskPublicationPlan {
  const rows = parseRisks(risksRaw);
  if (!DIGEST.test(native.liveCaptureRoot)) fail("live capture root is invalid");
  if (!DIGEST.test(native.semanticPlanRoot) || native.semanticPlanValidated !== true) fail("semantic plan is not validated");
  if (native.catalogComplete !== true || native.issuesComplete !== true) fail("native capture is not complete");
  if (native.capturedTeamIssueCount !== native.liveIssues.length) fail("native issue capture count is incomplete");

  const expectedIds = Array.from({ length: 24 }, (_, index) => `RISK-${String(index + 1).padStart(3, "0")}`);
  const actualIds = rows.map((row) => row.id);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) fail("risk identities are missing, duplicated, or out of order");
  if (rows.some((row) => row.owner !== "Blake Rowley")) fail("risk owner differs from the accountable owner");
  for (const field of ["statement", "trigger", "response"] as const) {
    const values = rows.map((row) => normalize(row[field]));
    if (new Set(values).size !== values.length) fail(`risk source contains duplicate ${field} values`);
  }
  if (Object.keys(RISK_ROUTES).sort().join("\n") !== [...expectedIds].sort().join("\n")) fail("risk routing does not exactly cover the source");

  assertUuid(native.team.id, "Requirements team");
  if (native.team.name !== "Requirements" || native.team.key !== "REQ" || native.team.archivedAt !== null) fail("risk targets require the active Requirements team");
  assertUuid(native.state.id, "Approved state");
  if (native.state.name !== "Approved" || native.state.type !== "completed" || native.state.teamId !== native.team.id || native.state.archivedAt !== null) fail("risk targets require the Requirements Approved state");
  assertUuid(native.assignee.id, "risk assignee");
  if (native.assignee.name !== "Blake Rowley" || native.assignee.active !== true || native.assignee.archivedAt !== null) fail("risk assignee differs from the source owner");

  const projects = new Map<string, LinearRiskNativeCatalogSnapshot["projects"][number]>();
  for (const project of native.projects) {
    assertUuid(project.id, `project ${project.name}`);
    if (projects.has(project.name)) fail(`project ${project.name} is duplicated`);
    projects.set(project.name, project);
  }
  for (const route of Object.values(RISK_ROUTES)) {
    const project = projects.get(route.project);
    if (!project || project.archivedAt !== null || !project.teamIds.includes(native.team.id)) fail(`project ${route.project} is missing, archived, or outside Requirements`);
  }

  const groups = new Map(native.labelGroups.map((group) => [group.name, group]));
  for (const groupName of ["Type", "Risk"] as const) {
    const group = groups.get(groupName);
    if (!group) fail(`${groupName} label group is missing`);
    assertUuid(group.id, `${groupName} label group`);
    if (group.teamId !== null || group.archivedAt !== null) fail(`${groupName} label group must be active and workspace-scoped`);
  }

  const labels: LinearRiskLabelSelector[] = LABEL_DEFINITIONS.map((definition) => {
    const matching = native.labels.filter((label) => label.name === definition.name);
    if (matching.length > 1) fail(`${definition.name} label is duplicated`);
    const group = groups.get(definition.parentName)!;
    const existing = matching[0];
    if (existing) {
      assertUuid(existing.id, `${definition.name} label`);
      if (existing.archivedAt !== null || existing.teamId !== null || existing.parentId !== group.id || existing.parentName !== definition.parentName || existing.color.toLocaleLowerCase("en-US") !== definition.color.toLocaleLowerCase("en-US") || existing.description !== definition.description) fail(`${definition.name} label has drifted from its grouped workspace identity`);
    }
    return {
      planKey: `label:${definition.name}`,
      name: definition.name,
      parentId: group.id,
      parentName: definition.parentName,
      id: existing?.id ?? null,
      create: existing === undefined,
      semanticRole: definition.semanticRole,
      color: definition.color,
      description: definition.description,
    };
  });
  const additions = labels.filter((label) => label.create).map((label) => label.name).sort();
  const allowedAdditions = new Set(["delivery-risk", "financial-risk", "risk"]);
  if (additions.some((name) => !allowedAdditions.has(name)) || labels.some((label) => (label.name === "security-risk" || label.name === "compliance-risk") && label.create)) fail("risk label additions are not the minimal approved set");

  const routeTitles = Object.values(RISK_ROUTES).map((route) => normalize(route.title));
  if (new Set(routeTitles).size !== routeTitles.length) fail("risk routing contains duplicate titles");
  for (const issue of native.liveIssues) {
    assertUuid(issue.issueUuid, `captured issue ${issue.title}`);
    const title = normalize(issue.title);
    const description = normalize(issue.description);
    if (routeTitles.includes(title) || rows.some((row) => description === normalize(riskDescription(row)) || description.includes(normalize(row.statement)))) fail(`live issue ${issue.title} duplicates a planned risk`);
  }

  const endpoints = new Map<string, LinearRiskNativeCatalogSnapshot["relationEndpoints"][number]>();
  for (const endpoint of native.relationEndpoints) {
    if (endpoints.has(endpoint.planKey)) fail(`relation endpoint ${endpoint.planKey} is duplicated`);
    endpoints.set(endpoint.planKey, endpoint);
  }
  for (const [legacyId, expectedTitle] of Object.entries(REQUIREMENT_TITLES)) {
    const planKey = `issue:${legacyId}`;
    const endpoint = endpoints.get(planKey);
    if (!endpoint || endpoint.kind !== "requirement" || endpoint.title !== expectedTitle || endpoint.archivedAt !== null) fail(`relation endpoint ${planKey} is unverified or has drifted`);
  }
  for (const [sourceDecisionId, expectedTitle] of Object.entries(DECISION_TITLES)) {
    const planKey = `decision:${sourceDecisionId}`;
    const endpoint = endpoints.get(planKey);
    if (!endpoint || endpoint.kind !== "decision" || endpoint.title !== expectedTitle || endpoint.archivedAt !== null) fail(`relation endpoint ${planKey} is unverified or has drifted`);
  }

  const risks: LinearRiskTarget[] = rows.map((row) => {
    const route = RISK_ROUTES[row.id];
    const project = projects.get(route.project)!;
    return {
      planKey: `risk:${row.id}`,
      sourceRiskId: row.id,
      sourceDisposition: "active",
      duplicateOf: null,
      title: route.title,
      description: riskDescription(row),
      teamId: native.team.id,
      projectId: project.id,
      stateId: native.state.id,
      assigneeId: native.assignee.id,
      priority: route.priority,
      labelPlanKeys: ["label:risk", ...route.categories.map((category) => `label:${category}`)],
    };
  });

  const relations: LinearRiskRelation[] = [];
  for (const row of rows) {
    for (const legacyId of RISK_ROUTES[row.id].relatedRequirements) {
      const targetPlanKey = `issue:${legacyId}`;
      if (!endpoints.has(targetPlanKey)) fail(`relation endpoint ${targetPlanKey} is orphaned`);
      relations.push({
        planKey: canonicalAuthorityRelationPlanKey("related", `risk:${row.id}`, targetPlanKey),
        type: "related",
        sourcePlanKey: `risk:${row.id}`,
        targetPlanKey,
      });
    }
    for (const sourceDecisionId of RISK_ROUTES[row.id].relatedDecisions ?? []) {
      const targetPlanKey = `decision:${sourceDecisionId}`;
      if (!endpoints.has(targetPlanKey)) fail(`relation endpoint ${targetPlanKey} is orphaned`);
      relations.push({
        planKey: canonicalAuthorityRelationPlanKey("related", `risk:${row.id}`, targetPlanKey),
        type: "related",
        sourcePlanKey: `risk:${row.id}`,
        targetPlanKey,
      });
    }
  }
  const relationKeys = relations.map((relation) => relation.planKey);
  if (new Set(relationKeys).size !== relationKeys.length) fail("risk relations are duplicated");

  const body = {
    schemaVersion: LINEAR_RISK_PLAN_SCHEMA_VERSION,
    sourceSha256: sha256(risksRaw),
    liveCaptureRoot: native.liveCaptureRoot,
    semanticPlanRoot: native.semanticPlanRoot,
    labels,
    risks,
    relations,
    audit: {
      sourceRows: 24 as const,
      active: 24 as const,
      stale: 0 as const,
      sourceDuplicates: 0 as const,
      liveDuplicates: 0 as const,
      relationEndpointsVerified: true as const,
      nativeRoutingValidated: true as const,
    },
  };
  return {
    ...body,
    planRoot: sha256(JSON.stringify(body)),
    mutationAuthorized: false,
  };
}
