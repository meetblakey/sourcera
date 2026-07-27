import { createHash } from "node:crypto";

export const LINEAR_OPERATING_DECISION_PLAN_SCHEMA_VERSION = 1 as const;

export type LinearOperatingDecisionStatus = "active" | "superseded";

export interface LinearOperatingDecisionSourceRow {
  id: string;
  status: LinearOperatingDecisionStatus;
  decision: string;
  assumption: string;
  validationTrigger: string;
}

export interface LinearOperatingDecisionNativeSnapshot {
  liveCaptureRoot: string;
  semanticPlanRoot: string;
  semanticPlanValidated: true;
  catalogComplete: true;
  issuesComplete: true;
  relationsComplete: true;
  capturedTeamIssueCount: number;
  issueTeamKeys: string[];
  team: {
    id: string;
    key: string;
    name: string;
    archivedAt: string | null;
  };
  states: Array<{
    id: string;
    name: string;
    type: string;
    teamId: string;
    archivedAt: string | null;
  }>;
  assignee: {
    id: string;
    name: string;
    active: boolean;
    archivedAt: string | null;
  };
  projects: Array<{
    id: string;
    name: string;
    teamIds: string[];
    archivedAt: string | null;
  }>;
  decisionLabel: {
    id: string;
    name: string;
    semanticRole: "decision";
    parentId: string;
    parentName: string;
    teamId: string | null;
    archivedAt: string | null;
  };
  relationEndpoints: Array<{
    sourceReference: string;
    planKey: string;
    kind: "requirement" | "source_decision" | "existing_issue";
    issueUuid: string | null;
    issueIdentifier: string | null;
    title: string;
    projectId: string;
    stateName: string | null;
    archivedAt: string | null;
  }>;
  liveIssues: Array<{
    issueUuid: string;
    title: string;
    description: string;
    teamId: string;
    projectId: string | null;
    stateId: string;
    assigneeId: string | null;
    priority: number;
    labelIds: string[];
    sourceDecisionId: string | null;
    archivedAt: string | null;
  }>;
}

export interface LinearOperatingDecisionTarget {
  planKey: string;
  sourceDecisionId: string;
  sourceStatus: LinearOperatingDecisionStatus;
  title: string;
  description: string;
  teamId: string;
  projectId: string;
  stateId: string;
  assigneeId: string;
  priority: 1 | 2 | 3 | 4;
  labelIds: [string];
}

export interface LinearOperatingDecisionRelation {
  planKey: string;
  type: "related" | "blocks";
  sourcePlanKey: string;
  targetPlanKey: string;
  evidenceDecisionPlanKey: string;
}

export interface LinearOperatingDecisionReviewedNonRelation {
  sourceDecisionPlanKey: string;
  sourceReference: string;
  rationale: string;
}

export interface LinearOperatingDecisionPublicationPlan {
  schemaVersion: 1;
  sourceSha256: string;
  liveCaptureRoot: string;
  semanticPlanRoot: string;
  decisions: LinearOperatingDecisionTarget[];
  relations: LinearOperatingDecisionRelation[];
  reviewedNonRelations: LinearOperatingDecisionReviewedNonRelation[];
  audit: {
    sourceRows: 85;
    active: 70;
    superseded: 15;
    decisionsWithLiteralReferences: 47;
    distinctLiteralReferences: 74;
    reviewedNonEndpointReferences: 4;
    decisionsWithNativeRelations: 46;
    distinctReferenceEndpoints: 70;
    relatedRelations: 89;
    blockRelations: 10;
    sourceDuplicates: 0;
    liveDuplicates: 0;
    relationEndpointsVerified: true;
    nativeRoutingValidated: true;
    descriptionsSanitized: true;
  };
  planRoot: string;
  mutationAuthorized: false;
}

interface DecisionRoute {
  status: LinearOperatingDecisionStatus;
  title: string;
  project: string;
  priority: 1 | 2 | 3 | 4;
}

const PLATFORM = "Platform & Delivery Foundations";
const RELEASE = "QA, Release, Deployment & Launch";
const IDENTITY = "Identity, Organizations & Permissions";
const BUYER_PIPELINE = "Buyer Workspaces & Evaluation Pipeline";
const VENDORS = "Vendors, Invitations & NDA";
const DESIGN = "Design System & Application Shell";
const SCORING = "Scoring, Scenarios & TCO";
const REPORTING = "Buyer Collaboration, Inbox & Reporting";
const AGENT = "Agent & Intelligence Capabilities";
const ANALYTICS = "Product Analytics, Growth & Network Effects";
const OPERATIONS = "Operations & Support Console";
const DATA = "Data, Audit & Cross-Console Foundations";
const SECURITY = "Security, Privacy, Compliance & Residency";
const ACCESSIBILITY = "Accessibility, Localization & Responsive UX";
const SELLER_KNOWLEDGE = "Seller Knowledge, Profile & Capabilities";
const BILLING = "Billing, Pricing & Entitlements";
const NOTIFICATIONS = "Notifications & Email";
const MARKETPLACE = "Marketplace Discovery, Matching & Trust";
const INTEGRATIONS = "Integrations, API, Webhooks & MCP";
const PORTABILITY = "Data Portability, Retention & Migration";
const REQUIREMENTS = "Requirements, Policies & Templates";

const ROUTES = {
  "DEC-REPO-001": { status: "active", title: "Initialize the application only after delivery controls pass", project: PLATFORM, priority: 2 },
  "DEC-WIP-001": { status: "active", title: "Limit active implementation to one lane", project: PLATFORM, priority: 2 },
  "DEC-OWNER-001": { status: "active", title: "Keep one accountable human approver until capacity changes", project: PLATFORM, priority: 2 },
  "DEC-HEADER-001": { status: "active", title: "Treat live scanners as release-count authority", project: PLATFORM, priority: 2 },
  "DEC-RELEASE-001": { status: "active", title: "Assign releases from source meaning and dependency closure", project: RELEASE, priority: 2 },
  "DEC-RUNTIME-001": { status: "active", title: "Route runtime gates to their owning behavior", project: RELEASE, priority: 2 },
  "DEC-ARCH-001": { status: "active", title: "Use three independently deployable applications", project: PLATFORM, priority: 2 },
  "DEC-DEP-001": { status: "active", title: "Sequence persistence before console isolation", project: PLATFORM, priority: 2 },
  "DEC-DEP-002": { status: "active", title: "Sequence shell, persistence, authentication, and isolation", project: IDENTITY, priority: 2 },
  "DEC-FORECAST-001": { status: "active", title: "Forecast from completed reviewed batches", project: PLATFORM, priority: 3 },
  "DEC-PRIORITY-001": { status: "active", title: "Reserve Urgent for active critical-path work", project: PLATFORM, priority: 2 },
  "DEC-REL-SOLO-001": { status: "active", title: "Keep Solo Mode outside the initial dependency closure", project: BUYER_PIPELINE, priority: 3 },
  "DEC-REL-INVITE-001": { status: "active", title: "Do not infer transactional email scheduling", project: VENDORS, priority: 3 },
  "DEC-REL-IDENTITY-001": { status: "active", title: "Do not infer identity dependencies without source proof", project: IDENTITY, priority: 3 },
  "DEC-REL-ACTOR-001": { status: "active", title: "Add actor-role edges only from acceptance paths", project: IDENTITY, priority: 3 },
  "DEC-REL-PIPELINE-001": { status: "active", title: "Keep the phase advancement control chain in the first release", project: BUYER_PIPELINE, priority: 2 },
  "DEC-REL-CONSOLE-001": { status: "active", title: "Avoid a broad buyer-shell dependency", project: DESIGN, priority: 3 },
  "DEC-REL-SCORING-001": { status: "active", title: "Defer rubric and score-history edges until proved", project: SCORING, priority: 3 },
  "DEC-REL-EXPORT-001": { status: "active", title: "Keep Selection Report ownership narrow", project: REPORTING, priority: 3 },
  "DEC-REL-SURFACE-001": { status: "active", title: "Defer compressed surface mappings until rendered proof", project: DESIGN, priority: 3 },
  "DEC-REL-ACCESS-CI-001": { status: "active", title: "Defer the access-policy validator until it is a proved prerequisite", project: RELEASE, priority: 3 },
  "DEC-REL-SELLER-MAYA-001": { status: "active", title: "Defer seller-assistant conformance until ownership is proved", project: AGENT, priority: 3 },
  "DEC-REL-HERO-METRICS-001": { status: "active", title: "Keep hero instrumentation cycle-safe", project: ANALYTICS, priority: 3 },
  "DEC-REL-SETUP-RECOVERY-001": { status: "active", title: "Keep setup recovery with its complete contract", project: IDENTITY, priority: 3 },
  "DEC-REL-OPS-IDENTITY-001": { status: "superseded", title: "Retire the former staff-identity dependency decision", project: OPERATIONS, priority: 4 },
  "DEC-LEGACY-OPS-001": { status: "active", title: "Retire legacy operations tickets without losing capability", project: OPERATIONS, priority: 2 },
  "DEC-REL-AGGREGATE-001": { status: "active", title: "Keep the buyer entity aggregate at its audited release", project: DATA, priority: 3 },
  "DEC-REL-PHASE3-001": { status: "active", title: "Require the mandatory third evaluation phase", project: BUYER_PIPELINE, priority: 2 },
  "DEC-REL-LOCKOUT-001": { status: "active", title: "Do not claim early lockout readiness", project: SECURITY, priority: 2 },
  "DEC-REL-AE006-001": { status: "active", title: "Keep combined accessibility behavior at its latest binding release", project: ACCESSIBILITY, priority: 3 },
  "DEC-REL-AE029-001": { status: "active", title: "Defer seller phase mapping until surface proof", project: SELLER_KNOWLEDGE, priority: 3 },
  "DEC-REL-F634-001": { status: "active", title: "Do not invent a release for production capability posture", project: RELEASE, priority: 2 },
  "DEC-REL-F785-001": { status: "active", title: "Keep aggregate state machines together until decomposed", project: SELLER_KNOWLEDGE, priority: 3 },
  "DEC-REL-F886-001": { status: "active", title: "Preserve product-wide voice and tone guidance", project: DESIGN, priority: 3 },
  "DEC-REL-F567-001": { status: "active", title: "Keep user settings together until decomposed", project: IDENTITY, priority: 3 },
  "DEC-REL-F738-001": { status: "active", title: "Keep fraud analysis with its complete contest dependency", project: OPERATIONS, priority: 3 },
  "DEC-LINEAR-MILESTONE-FINGERPRINT-001": { status: "active", title: "Fingerprint milestones by stable native identity and content", project: PLATFORM, priority: 2 },
  "DEC-PROD-001": { status: "active", title: "Production staging and promotion remain fail-closed", project: RELEASE, priority: 1 },
  "DEC-PROD-002": { status: "superseded", title: "Retire the former staged-promotion coordinator decision", project: RELEASE, priority: 4 },
  "DEC-PROD-003": { status: "superseded", title: "Retire the former first-production baseline decision", project: RELEASE, priority: 4 },
  "DEC-PROD-004": { status: "superseded", title: "Retire the former bootstrap-mutation decision", project: RELEASE, priority: 4 },
  "DEC-PROD-005": { status: "superseded", title: "Retire artifact inventory as authority", project: RELEASE, priority: 4 },
  "DEC-SOURCE-F910-001": { status: "active", title: "Define application security headers from a typed policy", project: SECURITY, priority: 2 },
  "DEC-SOURCE-F911-001": { status: "active", title: "Keep browser cross-origin access fail-closed", project: SECURITY, priority: 2 },
  "DEC-SOURCE-F912-001": { status: "active", title: "Keep custom branding scoped to the buyer organization", project: DESIGN, priority: 3 },
  "DEC-SOURCE-F913-001": { status: "active", title: "Bootstrap reference data deterministically", project: RELEASE, priority: 2 },
  "DEC-SOURCE-F914-001": { status: "active", title: "Consolidate the shared Card contract without moving earlier journeys", project: DESIGN, priority: 3 },
  "DEC-SOURCE-F915-001": { status: "active", title: "Treat vendor-response comparison as buyer-owned behavior", project: REPORTING, priority: 3 },
  "DEC-SOURCE-F916-001": { status: "superseded", title: "Retire the former trial-activation split", project: BILLING, priority: 4 },
  "DEC-VANITY-DOMAIN-001": { status: "active", title: "Preserve vanity-host provenance without inventing a successor", project: IDENTITY, priority: 3 },
  "DEC-LEGACY-ALERT-001": { status: "active", title: "Retire the generic Alert abstraction", project: NOTIFICATIONS, priority: 3 },
  "DEC-LEGACY-INSIGHT-001": { status: "active", title: "Retire mutable generic predictive insights", project: AGENT, priority: 3 },
  "DEC-SOURCE-F917-001": { status: "active", title: "Make Stripe Customer genesis externally atomic", project: BILLING, priority: 2 },
  "DEC-SOURCE-F533-001": { status: "superseded", title: "Do not charge without an explicitly chosen plan", project: BILLING, priority: 4 },
  "DEC-SOURCE-F628-001": { status: "active", title: "Keep incomplete marketplace entities unready", project: MARKETPLACE, priority: 3 },
  "DEC-REL-F628-WEBHOOK-001": { status: "active", title: "Do not promote webhook behavior from test authority", project: INTEGRATIONS, priority: 3 },
  "DEC-SOURCE-F916-002": { status: "superseded", title: "Retire the former signup-event ownership split", project: ANALYTICS, priority: 4 },
  "DEC-SOURCE-F917-002": { status: "active", title: "Keep complete Stripe Customer metadata", project: BILLING, priority: 2 },
  "DEC-SOURCE-F007-001": { status: "active", title: "Use one pinned server-owned Stripe adapter", project: BILLING, priority: 2 },
  "DEC-SOURCE-F007-002": { status: "active", title: "Apply page-specific least privilege to billing", project: BILLING, priority: 2 },
  "DEC-SOURCE-F007-003": { status: "active", title: "Keep billing orchestration records private", project: BILLING, priority: 2 },
  "DEC-SOURCE-F132-001": { status: "superseded", title: "Retire overlapping pricing-version ownership", project: BILLING, priority: 4 },
  "DEC-SOURCE-F593-001": { status: "superseded", title: "Fail closed on conflicting retention rules", project: PORTABILITY, priority: 4 },
  "DEC-REL-F630-001": { status: "active", title: "Remove the release-gate dependency deadlock", project: RELEASE, priority: 2 },
  "DEC-SOURCE-F529-001": { status: "superseded", title: "Keep billing seat snapshots informational", project: BILLING, priority: 4 },
  "DEC-SOURCE-F631-001": { status: "superseded", title: "Return service unavailable when entitlement authority fails", project: RELEASE, priority: 4 },
  "DEC-ARCH-CONVEX-SCHEMA-001": { status: "active", title: "Centralize deterministic Convex schema assembly", project: PLATFORM, priority: 2 },
  "DEC-OWN-F139-F160-001": { status: "active", title: "Separate role contribution from common authorization enforcement", project: IDENTITY, priority: 2 },
  "DEC-ARCH-INTERNAL-ROLLOUT-001": { status: "active", title: "Keep private rollout controls separate from customer flags", project: RELEASE, priority: 2 },
  "DEC-VALIDATION-F007-001": { status: "active", title: "Version and prove the billing journey target set", project: BILLING, priority: 2 },
  "DEC-LINEAR-LABEL-GROUP-001": { status: "active", title: "Use one primary Linear layer classification", project: PLATFORM, priority: 2 },
  "DEC-SOURCE-OPS-SUCCESSORS-001": { status: "active", title: "Assign operations outcomes to canonical successors", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-F085A-001": { status: "superseded", title: "Retire the temporary use-case undo contract", project: REQUIREMENTS, priority: 4 },
  "DEC-SOURCE-SG-F922-001": { status: "active", title: "Use one canonical operations actor field", project: DATA, priority: 2 },
  "DEC-SOURCE-SG-F922-002": { status: "active", title: "Bind each operations signer to one required session", project: DATA, priority: 2 },
  "DEC-SOURCE-SG-F923-001": { status: "active", title: "Record cross-console plan overrides as ordered tier pairs", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F923-002": { status: "active", title: "Retain provider attempts without duplicating the billing ledger", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F923-003": { status: "active", title: "Close the plan-override role and lifecycle catalogs", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F924-001": { status: "active", title: "Require stronger quorum for compliance exports", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F924-002": { status: "active", title: "Bound export generation retries and recovery", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F924-003": { status: "active", title: "Use deterministic encrypted workspace export archives", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-SG-F924-004": { status: "active", title: "Purge consumed and expired export archives promptly", project: OPERATIONS, priority: 2 },
  "DEC-SOURCE-F003": { status: "superseded", title: "Retire the temporary query-scope interpretation", project: PLATFORM, priority: 4 },
  "DEC-IMPL-REACTIVE-SCOPE-STATE-001": { status: "superseded", title: "Retire the temporary reactive-scope invalidation default", project: PLATFORM, priority: 4 },
  "DEC-SOURCE-F199-SUPERSESSION-001": { status: "active", title: "Unify seller team role authority", project: IDENTITY, priority: 2 },
} as const satisfies Record<string, DecisionRoute>;

export type LinearOperatingDecisionId = keyof typeof ROUTES;

export const OPERATING_DECISION_TITLES: Readonly<Record<LinearOperatingDecisionId, string>> =
  Object.freeze(Object.fromEntries(
    Object.entries(ROUTES).map(([id, route]) => [id, route.title]),
  )) as Readonly<Record<LinearOperatingDecisionId, string>>;

export const OPERATING_DECISION_PROJECT_NAMES = Object.freeze(
  [...new Set(Object.values(ROUTES).map((route) => route.project))].sort(),
);

interface ExplicitBlockEvidence {
  decisionId: LinearOperatingDecisionId;
  sourceReference: string;
  targetReference: string;
  evidence: RegExp;
}

const EXPLICIT_BLOCKS: readonly ExplicitBlockEvidence[] = [
  { decisionId: "DEC-DEP-001", sourceReference: "F-005", targetReference: "F-002", evidence: /F-005\b[^.]*\bprecedes F-002\b/ },
  { decisionId: "DEC-DEP-002", sourceReference: "F-001", targetReference: "F-006", evidence: /F-006\b[^.]*\bfollows the F-001 shell and F-005\b/ },
  { decisionId: "DEC-DEP-002", sourceReference: "F-005", targetReference: "F-006", evidence: /F-006\b[^.]*\bfollows the F-001 shell and F-005\b/ },
  { decisionId: "DEC-DEP-002", sourceReference: "F-006", targetReference: "F-002", evidence: /F-006\b[^.]*\bthen precedes F-002\b/ },
  { decisionId: "DEC-REL-PHASE3-001", sourceReference: "F-212", targetReference: "F-213", evidence: /F-213\b[^.]*\bbetween F-212 and F-214\b/ },
  { decisionId: "DEC-REL-PHASE3-001", sourceReference: "F-213", targetReference: "F-214", evidence: /F-213\b[^.]*\bbetween F-212 and F-214\b/ },
  { decisionId: "DEC-REL-F738-001", sourceReference: "F-128", targetReference: "F-738", evidence: /F-738\b[^.]*\bdepends on ContestRecord F-128\b/ },
  { decisionId: "DEC-SOURCE-F916-002", sourceReference: "F-527", targetReference: "F-636", evidence: /F-636 and F-637 retain[^.]*their F-527 dependency\b/ },
  { decisionId: "DEC-SOURCE-F916-002", sourceReference: "F-527", targetReference: "F-637", evidence: /F-636 and F-637 retain[^.]*their F-527 dependency\b/ },
  { decisionId: "DEC-OWN-F139-F160-001", sourceReference: "F-160", targetReference: "F-139", evidence: /F-139 depends on F-160\b/ },
] as const;

const REVIEWED_NON_RELATIONS = Object.freeze({
  "F-914": {
    decisionId: "DEC-SOURCE-F914-001" as LinearOperatingDecisionId,
    evidence: /\bretire F-914 if complete\b/,
    rationale: "This token names a proposed consolidation that has no canonical requirement or live issue. Native linkage is intentionally withheld until an authoritative owner exists.",
  },
  "F-918": {
    decisionId: "DEC-REL-F628-WEBHOOK-001" as LinearOperatingDecisionId,
    evidence: /\bDo not create F-483\.A or F-918\b/,
    rationale: "This token names an explicitly rejected webhook fabrication. Creating a native target or relation would contradict the decision.",
  },
  "PLA-162": {
    decisionId: "DEC-VANITY-DOMAIN-001" as LinearOperatingDecisionId,
    evidence: /Keep canceled PLA-162 unresolved/,
    rationale: "This archived canceled ticket is retained only as provenance. The active Domain Governance issue owns the current native planning relation.",
  },
  "PLA-371": {
    decisionId: "DEC-SOURCE-F199-SUPERSESSION-001" as LinearOperatingDecisionId,
    evidence: /archived PLA-371 retain no separate planning ownership/,
    rationale: "This archived duplicate has no current planning ownership. The active combined role-authority issue owns the native planning relation.",
  },
});

const EXPECTED_EXISTING_ISSUES: Readonly<Record<string, {
  title: string;
  stateName: string;
  archived: boolean;
}>> = Object.freeze({
  "PLA-162": {
    title: "Implement custom domain setup (CNAME, auto SSL, verification flow)",
    stateName: "Canceled",
    archived: true,
  },
  "PLA-338": {
    title: "Domain Governance",
    stateName: "Backlog",
    archived: false,
  },
  "PLA-370": {
    title: "Seller Team role authority mapping",
    stateName: "Backlog",
    archived: false,
  },
  "PLA-371": {
    title: "[F-199] Seller Team Lead Role",
    stateName: "Duplicate",
    archived: true,
  },
});

const SHA256 = /^[a-f0-9]{64}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FEATURE_REFERENCE = /\bF-(?:(?:AE|BC)-)?\d{3}(?:\.[A-Z0-9]+)?\b/g;
const RUNTIME_GATE_REFERENCE = /\bRG(?::|-)[a-z0-9][a-z0-9_.-]*\b/gi;
const IDENTIFIER_LIKE = /\b[A-Z][A-Z0-9]{1,9}-[1-9]\d*(?:\.[A-Z0-9]+)?\b/g;
const SOURCE_IDENTIFIER = /\b(?:DEC-[A-Z0-9-]+|PROD-\d+|WIP-\d+|AE-\d+|D\d+|F-(?:(?:AE|BC)-)?\d{3}(?:\.[A-Z0-9]+)?|RG(?::|-)[a-z0-9][a-z0-9_.-]*)\b/i;
const LINEAR_URL = /https?:\/\/(?:[^\s/]+\.)?linear\.app(?:\/|\b)/i;
const ANY_URL = /https?:\/\//i;
const COPIED_NATIVE_METADATA = /^(?:Project|State|Status|Priority|Owner|Assignee|Labels?|Team|Relations?|Blocked by):/im;

function fail(message: string): never {
  throw new Error(`Linear operating decision plan: ${message}`);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalize(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function compare(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true });
}

function assertUuid(value: string, label: string): void {
  if (!UUID_V4.test(value)) fail(`${label} is not a UUIDv4`);
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(`${label} keys differ`);
}

function canonicalFeatureReference(reference: string): string {
  const match = /^(F-(?:(?:AE|BC)-)?\d{3})(?:\.[A-Z0-9]+)?$/.exec(reference);
  if (!match) fail(`feature reference ${reference} is invalid`);
  return match[1]!;
}

function parseSource(raw: string): LinearOperatingDecisionSourceRow[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  if (lines.length !== 85 || lines.some((line) => line.length === 0)) {
    fail("delivery/decisions.jsonl must contain exactly 85 non-empty rows");
  }
  const rows = lines.map((line, index): LinearOperatingDecisionSourceRow => {
    let candidate: unknown;
    try {
      candidate = JSON.parse(line);
    } catch {
      fail(`decision source row ${index + 1} is not valid JSON`);
    }
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
      fail(`decision source row ${index + 1} is invalid`);
    }
    const row = candidate as Record<string, unknown>;
    assertExactKeys(
      row,
      ["id", "status", "decision", "assumption", "validationTrigger"],
      `decision source row ${index + 1}`,
    );
    for (const field of ["id", "status", "decision", "assumption", "validationTrigger"] as const) {
      if (typeof row[field] !== "string" || row[field].length === 0 || row[field].trim() !== row[field]) {
        fail(`decision source row ${index + 1} ${field} is invalid`);
      }
    }
    if (row.status !== "active" && row.status !== "superseded") {
      fail(`decision source row ${index + 1} status is invalid`);
    }
    for (const field of ["decision", "assumption", "validationTrigger"] as const) {
      if (ANY_URL.test(row[field] as string)) fail(`${row.id} ${field} contains a URL`);
    }
    return row as unknown as LinearOperatingDecisionSourceRow;
  });
  const expectedIds = Object.keys(ROUTES);
  const actualIds = rows.map((row) => row.id);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    fail("source identities are missing, duplicated, unknown, or out of canonical order");
  }
  const active = rows.filter((row) => row.status === "active").length;
  const superseded = rows.filter((row) => row.status === "superseded").length;
  if (active !== 70 || superseded !== 15) fail("source status counts have drifted");
  for (const row of rows) {
    const route = ROUTES[row.id as LinearOperatingDecisionId];
    if (!route || row.status !== route.status) fail(`${row.id} status has drifted`);
  }
  for (const field of ["decision", "assumption", "validationTrigger"] as const) {
    const values = rows.map((row) => normalize(row[field]));
    if (new Set(values).size !== values.length) fail(`source contains duplicate ${field} semantics`);
  }
  return rows;
}

function extractReferences(
  row: LinearOperatingDecisionSourceRow,
  issueTeamKeys: ReadonlySet<string>,
): string[] {
  const text = `${row.decision}\n${row.assumption}\n${row.validationTrigger}`;
  const references = new Set<string>();
  const sourceReferenceSpans: Array<[number, number]> = [];
  for (const match of text.matchAll(FEATURE_REFERENCE)) {
    references.add(canonicalFeatureReference(match[0]));
    sourceReferenceSpans.push([match.index!, match.index! + match[0].length]);
  }
  for (const match of text.matchAll(RUNTIME_GATE_REFERENCE)) {
    references.add(match[0]);
    sourceReferenceSpans.push([match.index!, match.index! + match[0].length]);
  }
  for (const match of text.matchAll(IDENTIFIER_LIKE)) {
    const start = match.index!;
    if (sourceReferenceSpans.some(([left, right]) => start >= left && start < right)) continue;
    const prefix = match[0].split("-", 1)[0]!;
    if (issueTeamKeys.has(prefix)) {
      references.add(match[0].replace(/\.[A-Z0-9]+$/, ""));
      continue;
    }
    if (["DEC", "PROD", "WIP", "AE"].includes(prefix)) continue;
    fail(`${row.id} contains unclassified source or issue reference ${match[0]}`);
  }
  return [...references].sort(compare);
}

function dependencyNeutralSentence(sentence: string, issueTeamKeys: ReadonlySet<string>): string | null {
  const probe: LinearOperatingDecisionSourceRow = {
    id: "DEC-PROBE",
    status: "active",
    decision: sentence,
    assumption: "probe",
    validationTrigger: "probe",
  };
  let references: string[];
  try {
    references = extractReferences(probe, issueTeamKeys);
  } catch {
    return null;
  }
  if (references.length < 2) return null;
  if (!/\b(?:precedes|follows|depends on|between|dependency|block|cannot close until)\b/i.test(sentence)) {
    return null;
  }
  if (/\b(?:add no|do not add|remove|reject|cannot depend|not a behavioral successor|not promoted)\b/i.test(sentence)) {
    return "Do not add the rejected dependency; preserve only the native relations approved for this decision.";
  }
  return "Use the dependency direction recorded in native Linear relations for this decision.";
}

function sanitizeField(value: string, issueTeamKeys: ReadonlySet<string>): string {
  const sentences = value.split(/(?<=[.!?])\s+/).map((sentence) =>
    dependencyNeutralSentence(sentence, issueTeamKeys) ?? sentence);
  let result = sentences.join(" ");
  result = result
    .replace(FEATURE_REFERENCE, "the referenced capability")
    .replace(RUNTIME_GATE_REFERENCE, "the referenced runtime gate")
    .replace(/\bDEC-[A-Z0-9-]+\b/g, "the referenced decision")
    .replace(/\bPROD-\d+\b/g, "the referenced decision")
    .replace(/\bWIP-\d+\b/g, "the configured work-in-progress limit")
    .replace(/\bAE-\d+\b/g, "the referenced source extension")
    .replace(/\bD\d+\b/g, "the referenced draft item");
  result = result.replace(IDENTIFIER_LIKE, (identifier) => {
    const prefix = identifier.split("-", 1)[0]!;
    return issueTeamKeys.has(prefix) ? "the referenced issue" : identifier;
  });
  return result
    .replace(/\bthe referenced capability(?:\s*\/\s*the referenced capability)+\b/g, "the referenced capabilities")
    .replace(/\bthe referenced issue(?:\s*\/\s*the referenced issue)+\b/g, "the referenced issues")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function decisionDescription(
  row: LinearOperatingDecisionSourceRow,
  issueTeamKeys: ReadonlySet<string>,
): string {
  const description = [
    "## Decision",
    "",
    sanitizeField(row.decision, issueTeamKeys),
    "",
    "## Assumption",
    "",
    sanitizeField(row.assumption, issueTeamKeys),
    "",
    "## Re-evaluate",
    "",
    sanitizeField(row.validationTrigger, issueTeamKeys),
  ].join("\n");
  if (SOURCE_IDENTIFIER.test(description)) fail(`${row.id} description contains a source identity`);
  if (LINEAR_URL.test(description) || ANY_URL.test(description)) fail(`${row.id} description contains a URL`);
  if (COPIED_NATIVE_METADATA.test(description)) fail(`${row.id} description copies native metadata`);
  const headings = [...description.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  if (JSON.stringify(headings) !== JSON.stringify(["Decision", "Assumption", "Re-evaluate"])) {
    fail(`${row.id} description sections differ`);
  }
  return description;
}

function relationPlanKey(type: "related" | "blocks", sourcePlanKey: string, targetPlanKey: string): string {
  const endpoints = type === "related"
    ? [sourcePlanKey, targetPlanKey].sort()
    : [sourcePlanKey, targetPlanKey];
  return `relation:${type}:${endpoints[0]}:${endpoints[1]}`;
}

function validateBlockGraph(relations: LinearOperatingDecisionRelation[]): void {
  const edges = new Map<string, string[]>();
  for (const relation of relations.filter((row) => row.type === "blocks")) {
    edges.set(relation.sourcePlanKey, [...(edges.get(relation.sourcePlanKey) ?? []), relation.targetPlanKey]);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string): void => {
    if (visiting.has(key)) fail("explicit native block relations contain a cycle");
    if (visited.has(key)) return;
    visiting.add(key);
    for (const target of edges.get(key) ?? []) visit(target);
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of edges.keys()) visit(key);
}

export function buildLinearOperatingDecisionPublicationPlan(
  decisionsJsonl: string,
  native: LinearOperatingDecisionNativeSnapshot,
): LinearOperatingDecisionPublicationPlan {
  const rows = parseSource(decisionsJsonl);
  if (!SHA256.test(native.liveCaptureRoot) || !SHA256.test(native.semanticPlanRoot)) {
    fail("capture or semantic plan root is invalid");
  }
  if (native.semanticPlanValidated !== true) fail("semantic plan is not validated");
  if (native.catalogComplete !== true || native.issuesComplete !== true || native.relationsComplete !== true) {
    fail("native capture is incomplete");
  }
  if (native.capturedTeamIssueCount !== native.liveIssues.length) fail("native issue capture count is incomplete");

  assertUuid(native.team.id, "Requirements team");
  if (native.team.key !== "REQ" || native.team.name !== "Requirements" || native.team.archivedAt !== null) {
    fail("operating Decisions require the active Requirements team");
  }
  const issueTeamKeys = new Set(native.issueTeamKeys);
  if (issueTeamKeys.size !== native.issueTeamKeys.length || !issueTeamKeys.has("REQ") ||
    native.issueTeamKeys.some((key) => !/^[A-Z][A-Z0-9]{1,9}$/.test(key))) {
    fail("captured issue team keys are incomplete or duplicated");
  }

  const states = new Map<string, LinearOperatingDecisionNativeSnapshot["states"][number]>();
  for (const state of native.states) {
    assertUuid(state.id, `workflow state ${state.name}`);
    if (states.has(state.name)) fail(`workflow state ${state.name} is duplicated`);
    states.set(state.name, state);
  }
  const approved = states.get("Approved");
  const superseded = states.get("Superseded");
  if (!approved || approved.type !== "completed" || approved.teamId !== native.team.id || approved.archivedAt !== null) {
    fail("active Decisions require the Requirements Approved state");
  }
  if (!superseded || superseded.type !== "canceled" || superseded.teamId !== native.team.id ||
    superseded.archivedAt !== null) {
    fail("superseded Decisions require the Requirements Superseded state");
  }

  assertUuid(native.assignee.id, "Decision assignee");
  if (native.assignee.name !== "Blake Rowley" || native.assignee.active !== true ||
    native.assignee.archivedAt !== null) {
    fail("Decision assignee differs from the accountable owner");
  }
  assertUuid(native.decisionLabel.id, "Decision label");
  assertUuid(native.decisionLabel.parentId, "Type label group");
  if (native.decisionLabel.name !== "decision" || native.decisionLabel.semanticRole !== "decision" ||
    native.decisionLabel.parentName !== "Type" || native.decisionLabel.teamId !== null ||
    native.decisionLabel.archivedAt !== null) {
    fail("Decision label differs from the active workspace Type/decision identity");
  }

  const projects = new Map<string, LinearOperatingDecisionNativeSnapshot["projects"][number]>();
  const projectIds = new Set<string>();
  for (const project of native.projects) {
    assertUuid(project.id, `project ${project.name}`);
    if (projects.has(project.name) || projectIds.has(project.id)) fail(`project ${project.name} is duplicated`);
    projects.set(project.name, project);
    projectIds.add(project.id);
  }
  for (const projectName of OPERATING_DECISION_PROJECT_NAMES) {
    const project = projects.get(projectName);
    if (!project || project.archivedAt !== null || !project.teamIds.includes(native.team.id)) {
      fail(`project ${projectName} is missing, archived, or outside Requirements`);
    }
  }

  const endpointByReference = new Map<string, LinearOperatingDecisionNativeSnapshot["relationEndpoints"][number]>();
  const endpointPlanKeys = new Set<string>();
  for (const endpoint of native.relationEndpoints) {
    if (endpointByReference.has(endpoint.sourceReference) || endpointPlanKeys.has(endpoint.planKey)) {
      fail(`relation endpoint ${endpoint.sourceReference} is ambiguous or duplicated`);
    }
    if (!endpoint.title || endpoint.title.trim() !== endpoint.title) {
      fail(`relation endpoint ${endpoint.sourceReference} title is invalid`);
    }
    assertUuid(endpoint.projectId, `relation endpoint ${endpoint.sourceReference} project`);
    if (!projectIds.has(endpoint.projectId)) fail(`relation endpoint ${endpoint.sourceReference} project is unknown`);
    if (endpoint.kind === "requirement" || endpoint.kind === "source_decision") {
      const expectedPrefix = endpoint.kind === "requirement" ? "issue" : "decision";
      if (endpoint.sourceReference !== canonicalFeatureReference(endpoint.sourceReference) ||
        endpoint.planKey !== `${expectedPrefix}:${endpoint.sourceReference}` || endpoint.archivedAt !== null) {
        fail(`${endpoint.kind} endpoint ${endpoint.sourceReference} is not its active canonical plan identity`);
      }
      if ((endpoint.issueUuid === null) !== (endpoint.issueIdentifier === null)) {
        fail(`${endpoint.kind} endpoint ${endpoint.sourceReference} live identity is incomplete`);
      }
      if (endpoint.issueUuid !== null) assertUuid(endpoint.issueUuid, `${endpoint.kind} endpoint ${endpoint.sourceReference}`);
    } else {
      if (!endpoint.issueIdentifier || endpoint.planKey !== `relation-target:${endpoint.issueIdentifier}` ||
        (!endpoint.sourceReference.startsWith("RG:") &&
          !endpoint.sourceReference.startsWith("RG-") &&
          endpoint.sourceReference !== endpoint.issueIdentifier)) {
        fail(`existing issue endpoint ${endpoint.sourceReference} is not its canonical relation-target identity`);
      }
      assertUuid(endpoint.issueUuid ?? "", `existing issue endpoint ${endpoint.sourceReference}`);
      const expected = EXPECTED_EXISTING_ISSUES[endpoint.sourceReference];
      if (expected && (endpoint.title !== expected.title || endpoint.stateName !== expected.stateName ||
        (endpoint.archivedAt !== null) !== expected.archived)) {
        fail(`existing issue endpoint ${endpoint.sourceReference} identity or lifecycle has drifted`);
      }
    }
    endpointByReference.set(endpoint.sourceReference, endpoint);
    endpointPlanKeys.add(endpoint.planKey);
  }

  const literalReferenceSets = new Map<string, string[]>();
  const referenceSets = new Map<string, string[]>();
  const reviewedNonRelations: LinearOperatingDecisionReviewedNonRelation[] = [];
  const seenReviewedNonRelations = new Set<string>();
  for (const row of rows) {
    const literalReferences = extractReferences(row, issueTeamKeys);
    literalReferenceSets.set(row.id, literalReferences);
    const references: string[] = [];
    for (const reference of literalReferences) {
      const reviewed = REVIEWED_NON_RELATIONS[reference as keyof typeof REVIEWED_NON_RELATIONS];
      if (reviewed) {
        const sourceText = `${row.decision}\n${row.assumption}\n${row.validationTrigger}`;
        if (row.id !== reviewed.decisionId || !reviewed.evidence.test(sourceText) ||
          seenReviewedNonRelations.has(reference)) {
          fail(`${reference} reviewed nonrelation evidence has drifted or is ambiguous`);
        }
        seenReviewedNonRelations.add(reference);
        reviewedNonRelations.push({
          sourceDecisionPlanKey: `decision:${row.id}`,
          sourceReference: reference,
          rationale: reviewed.rationale,
        });
        continue;
      }
      references.push(reference);
    }
    referenceSets.set(row.id, references);
    for (const reference of references) {
      if (!endpointByReference.has(reference)) fail(`${row.id} relation endpoint ${reference} is missing`);
    }
  }
  if (seenReviewedNonRelations.size !== Object.keys(REVIEWED_NON_RELATIONS).length) {
    fail("reviewed nonrelation coverage has drifted");
  }
  const decisionsWithLiteralReferences = [...literalReferenceSets.values()]
    .filter((references) => references.length > 0).length;
  const distinctLiteralReferences = new Set([...literalReferenceSets.values()].flat());
  const literalReferenceCount = [...literalReferenceSets.values()]
    .reduce((count, references) => count + references.length, 0);
  const decisionsWithNativeRelations = [...referenceSets.values()]
    .filter((references) => references.length > 0).length;
  const distinctReferences = new Set([...referenceSets.values()].flat());
  const relatedCount = [...referenceSets.values()].reduce((count, references) => count + references.length, 0);
  if (decisionsWithLiteralReferences !== 47 || distinctLiteralReferences.size !== 74 ||
    literalReferenceCount !== 93 || decisionsWithNativeRelations !== 46 ||
    distinctReferences.size !== 70 || relatedCount !== 89) {
    fail("explicit source reference coverage has drifted");
  }
  reviewedNonRelations.sort((left, right) => compare(left.sourceReference, right.sourceReference));

  const titles = Object.values(ROUTES).map((route) => normalize(route.title));
  if (new Set(titles).size !== titles.length) fail("Decision routing contains duplicate titles");
  const decisions = rows.map((row): LinearOperatingDecisionTarget => {
    const route = ROUTES[row.id as LinearOperatingDecisionId];
    const project = projects.get(route.project)!;
    const description = decisionDescription(row, issueTeamKeys);
    return {
      planKey: `decision:${row.id}`,
      sourceDecisionId: row.id,
      sourceStatus: row.status,
      title: route.title,
      description,
      teamId: native.team.id,
      projectId: project.id,
      stateId: (row.status === "active" ? approved : superseded)!.id,
      assigneeId: native.assignee.id,
      priority: route.priority,
      labelIds: [native.decisionLabel.id],
    };
  });
  const descriptions = decisions.map((decision) => normalize(decision.description));
  if (new Set(descriptions).size !== descriptions.length) fail("planned Decisions contain duplicate semantics");

  const liveIssueUuids = new Set<string>();
  const liveTitles = new Set<string>();
  const liveSourceIds = new Set<string>();
  for (const issue of native.liveIssues) {
    assertUuid(issue.issueUuid, `captured issue ${issue.title}`);
    if (liveIssueUuids.has(issue.issueUuid)) fail("live issue capture duplicates an issue UUID");
    liveIssueUuids.add(issue.issueUuid);
    if (issue.teamId !== native.team.id) fail("captured Decision issue is outside the Requirements team");
    const title = normalize(issue.title);
    if (liveTitles.has(title)) fail(`live issue capture contains duplicate title ${issue.title}`);
    liveTitles.add(title);
    if (issue.sourceDecisionId !== null) {
      if (!(issue.sourceDecisionId in ROUTES)) {
        fail(`live issue contains unknown operating Decision source identity ${issue.sourceDecisionId}`);
      }
      if (liveSourceIds.has(issue.sourceDecisionId)) {
        fail(`live issue capture duplicates operating Decision identity ${issue.sourceDecisionId}`);
      }
      liveSourceIds.add(issue.sourceDecisionId);
    }
  }
  const plannedTitleSet = new Set(decisions.map((decision) => normalize(decision.title)));
  const plannedDescriptionSet = new Set(decisions.map((decision) => normalize(decision.description)));
  for (const issue of native.liveIssues) {
    if (plannedTitleSet.has(normalize(issue.title)) ||
      (issue.description.length > 0 && plannedDescriptionSet.has(normalize(issue.description))) ||
      issue.sourceDecisionId !== null) {
      fail(`live issue ${issue.title} duplicates a planned operating Decision`);
    }
  }

  const relations: LinearOperatingDecisionRelation[] = [];
  const relationKeys = new Set<string>();
  for (const decision of decisions) {
    for (const reference of referenceSets.get(decision.sourceDecisionId)!) {
      const endpoint = endpointByReference.get(reference)!;
      const planKey = relationPlanKey("related", decision.planKey, endpoint.planKey);
      if (relationKeys.has(planKey)) fail(`duplicate relation semantics at ${planKey}`);
      relationKeys.add(planKey);
      relations.push({
        planKey,
        type: "related",
        sourcePlanKey: decision.planKey,
        targetPlanKey: endpoint.planKey,
        evidenceDecisionPlanKey: decision.planKey,
      });
    }
  }
  const rowById = new Map(rows.map((row) => [row.id, row]));
  for (const block of EXPLICIT_BLOCKS) {
    const row = rowById.get(block.decisionId)!;
    const sourceText = `${row.decision}\n${row.assumption}\n${row.validationTrigger}`;
    if (!block.evidence.test(sourceText)) {
      fail(`${block.decisionId} explicit block evidence has drifted`);
    }
    const references = new Set(referenceSets.get(block.decisionId)!);
    if (!references.has(block.sourceReference) || !references.has(block.targetReference)) {
      fail(`${block.decisionId} explicit block endpoint is no longer referenced`);
    }
    const sourcePlanKey = endpointByReference.get(block.sourceReference)!.planKey;
    const targetPlanKey = endpointByReference.get(block.targetReference)!.planKey;
    const planKey = relationPlanKey("blocks", sourcePlanKey, targetPlanKey);
    if (relationKeys.has(planKey)) fail(`duplicate relation semantics at ${planKey}`);
    relationKeys.add(planKey);
    relations.push({
      planKey,
      type: "blocks",
      sourcePlanKey,
      targetPlanKey,
      evidenceDecisionPlanKey: `decision:${block.decisionId}`,
    });
  }
  const relatedRelations = relations.filter((relation) => relation.type === "related").length;
  const blockRelations = relations.filter((relation) => relation.type === "blocks").length;
  if (relatedRelations !== 89 || blockRelations !== 10) fail("native relation counts have drifted");
  validateBlockGraph(relations);
  relations.sort((left, right) => compare(left.planKey, right.planKey));

  const payload = {
    schemaVersion: LINEAR_OPERATING_DECISION_PLAN_SCHEMA_VERSION,
    sourceSha256: sha256(decisionsJsonl),
    liveCaptureRoot: native.liveCaptureRoot,
    semanticPlanRoot: native.semanticPlanRoot,
    decisions,
    relations,
    reviewedNonRelations,
    audit: {
      sourceRows: 85 as const,
      active: 70 as const,
      superseded: 15 as const,
      decisionsWithLiteralReferences: 47 as const,
      distinctLiteralReferences: 74 as const,
      reviewedNonEndpointReferences: 4 as const,
      decisionsWithNativeRelations: 46 as const,
      distinctReferenceEndpoints: 70 as const,
      relatedRelations: 89 as const,
      blockRelations: 10 as const,
      sourceDuplicates: 0 as const,
      liveDuplicates: 0 as const,
      relationEndpointsVerified: true as const,
      nativeRoutingValidated: true as const,
      descriptionsSanitized: true as const,
    },
  };
  return {
    ...payload,
    planRoot: sha256(JSON.stringify(payload)),
    mutationAuthorized: false,
  };
}
