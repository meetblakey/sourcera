import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve } from "node:path";
import {
  verifySourceChecksumContract,
  type SourceChecksumContract,
  type SourceChecksumContractRow,
  type SourceChecksumSlice,
} from "./source-checksums.js";
import { hasUnresolvedContractPlaceholder } from "./current-source-projection.js";
import { assertHistoricalNormalizationSourceMap } from "./linear-normalization-source-map.js";

export type SemanticSeverity = "blocker";

export interface SemanticFinding {
  code: string;
  evidence: string[];
  severity: SemanticSeverity;
}

export interface SemanticIssueAudit {
  baselineLoss: BaselineLossFingerprint | null;
  blockerCount: number;
  classification: string;
  flags: SemanticFinding[];
  intentionalBaselineReplacement: AppliedIntentionalBaselineReplacement | null;
  issueId: string;
  pass: boolean;
  title: string;
}

export interface BaselineLossFingerprint {
  baselineDescriptionSha256: string;
  candidateDescriptionSha256: string;
  lostPaths: string[];
  lostPathsSha256: string;
  lostTokens: string[];
  lostTokensSha256: string;
  substantivePathLoss: boolean;
  substantiveTokenLoss: boolean;
}

export interface IntentionalBaselineReplacementInput {
  authorityEvidence: string[];
  baselineDescriptionSha256: string;
  candidateDescriptionSha256: string;
  dispositions: IntentionalBaselineReplacementDispositionInput[];
  issueId: string;
  lostPaths: string[];
  lostPathsSha256: string;
  lostTokens: string[];
  lostTokensSha256: string;
  rationale: string;
  replacementMap: IntentionalBaselineReplacementMapInput[];
}

export type IntentionalBaselineReplacementDisposition =
  | "preserved_semantically"
  | "superseded_by_approved_source"
  | "nativeized"
  | "removed_legacy_literal"
  | "control_plane_only"
  | "planned_path_replaced";

export interface IntentionalBaselineReplacementDispositionInput {
  disposition: IntentionalBaselineReplacementDisposition;
  evidence: string[];
  kind: "path" | "token";
  replacement?: string;
  value: string;
}

export interface IntentionalBaselineReplacementMapInput {
  evidence: string[];
  from: string;
  to: string;
}

export interface IntentionalBaselineReplacementRegisterInput {
  baselineCaptureSha256?: string;
  issues: IntentionalBaselineReplacementInput[];
  kind: "linear_intentional_baseline_replacements";
  schemaVersion: 1;
  sourceDocument?: string;
  sourceSha256?: string;
}

export interface AppliedIntentionalBaselineReplacement {
  authorityEvidence: string[];
  dispositions: IntentionalBaselineReplacementDispositionInput[];
  rationale: string;
  registerSha256: string;
  replacementMap: IntentionalBaselineReplacementMapInput[];
  rowSha256: string;
}

export interface SemanticReplacementRegisterAudit {
  appliedIssueIds: string[];
  digestSha256: string | null;
  flags: SemanticFinding[];
  pass: boolean;
  supplied: boolean;
}

export interface SemanticAuditReport {
  generatedAt: string;
  issues: SemanticIssueAudit[];
  kind: "linear_normalization_semantic_audit";
  replacementRegister: SemanticReplacementRegisterAudit;
  schemaVersion: 1;
  summary: {
    auditedIssues: number;
    blockerIssues: number;
    countsByCode: Record<string, number>;
    inputIssues: number;
    passingIssues: number;
    replacementRegisterBlockers: number;
  };
  verdict: "go" | "no-go";
}

export interface ManifestRowInput {
  disposition?: string;
  issueId?: string | null;
  requirementId?: string;
  section?: string;
  sourceDoc?: string;
  sourceVersion?: string;
}

export interface SourceOverrideInput {
  outcome?: string;
  section: string;
  sourceDoc: string;
}

export interface BaselineIssueInput {
  description?: string | null;
  id?: string;
  identifier?: string;
  title?: string;
  url?: string;
}

export interface SemanticAuditOptions {
  baselineCaptureSha256?: string;
  baselineIssues?: BaselineIssueInput[];
  manifestRows?: ManifestRowInput[];
  replacementRegister?: unknown;
  replacementRegisterScope?: "full" | "matching-losses";
  replacementRegisterSha256?: string;
  root: string;
  sourceOverrides?: Record<string, SourceOverrideInput>;
}

interface SemanticAuditContext extends SemanticAuditOptions {
  baselineByIssue: Map<string, BaselineIssueInput>;
  baselineLossByIssue: Map<string, BaselineLossFingerprint>;
  baselineTitlesByIssue: Map<string, string>;
  intentionalReplacementByIssue: Map<string, IntentionalBaselineReplacementInput>;
  replacementRegisterSha256Resolved: string | null;
  sectionTextByKey: Map<string, string | null>;
  sourceBundleTextByKey: Map<string, string | null>;
  sourceChecksumRowsById: Map<string, SourceChecksumContractRow>;
  sourceTextByDocument: Map<string, string | null>;
  trustedDraftDescriptionSha256ByIssue: Map<string, string>;
}

interface NormalizedUpdate {
  classification: string;
  description: string;
  diagnostics: Record<string, unknown>;
  issueId: string;
  priorDescriptionSha256: string | null;
  source: {
    checksumSourceId: string | null;
    document: string | null;
    requirementId: string | null;
    section: string | null;
    sha256: string | null;
  };
  title: string;
}

interface MarkdownSection {
  body: string;
  heading: string;
  key: string | null;
  level: number;
}

interface ReplacementRegisterValidation {
  digestSha256: string | null;
  findings: SemanticFinding[];
  rowsByIssue: Map<string, IntentionalBaselineReplacementInput>;
  supplied: boolean;
}

const ISSUE_ID = /\b(?:PLA|BUY|SEL|INT)-\d+\b/gi;
const SOURCE_ID = /\bF-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*\b/gi;
const OTHER_SOURCE_ID = /\b(?:SG|SR)-[A-Z0-9-]+\b/gi;
const DEFECT_OR_DECISION_ID = /\b(?:D|DEC)-[A-Z0-9]+(?:[.-][A-Z0-9]+)+\b/gi;
const ASSUMPTION_ID = /\bASSUMP-[A-Z0-9]+(?:[.-][A-Z0-9]+)+\b/gi;
const LOCAL_ASSUMPTION_ID = /\bA-[A-Z]{2,}(?:-[A-Z0-9]+)*-\d+\b/g;
const LEGACY_ARTIFACT_PATH_ID = /(?:^|[/_.-])(?:r\d+[-_.])?f(?:[-_.]?ae)?[-_.]?\d{3,}[a-z0-9]*(?=[/_.-]|$)/i;
const LINEAR_URL = /https?:\/\/(?:www\.)?linear\.app\//i;
const IMPORT_CAP = 240;
const REQUIRED_SECTION_KEYS = [
  "outcome",
  "behavior",
  "states",
  "permissions",
  "paths",
  "review",
  "success",
  "failure",
  "recovery",
  "rollout",
  "rollback",
  "telemetry",
  "proof",
  "assumptions",
  "exclusions",
  "provenance",
] as const;

const GENERIC_OUTCOME = /(?:^|\b)(?:(?:Deliver .+ as one complete production behavior|Make .+ pass its exact fail-closed assertion|Close .+ only after every bounded child outcome|Persist one authorized .+ result|Render .+ from authorized data|Process .+ once per valid identity|Return one authorized .+ result|Enforce .+ for every named path)(?:.|\n)*(?:same-commit proof|explicit authorization)|This is the required .+ result\.?$)/i;
const GENERIC_SUPPORTING_PATTERNS: Array<[string, RegExp]> = [
  ["behavior", /Deliver .+ as one atomic product contract\. Validate inputs before mutation, persist only a complete valid result, keep retries idempotent, and expose a bounded failure without partial state/i],
  ["behavior", /Validate inputs before mutation, persist only a complete valid result, keep retries idempotent, and expose a bounded failure without partial state/i],
  ["behavior", /Implement the required frontend, backend, data, permissions, error, accessibility, security, telemetry, and operations behavior for the named scope/i],
  ["states", /accepts one validated request, then reaches exactly one terminal result:\s*succeeded or failed/i],
  ["permissions", /grants no new authority\.[^\n]{0,240}Only actors and data scopes explicitly named/i],
  ["review", /Independent review of .+ must confirm the behavior, denial paths, isolation boundary/i],
  ["success", /delivered behavior satisfies this outcome|Server-side authorization, org\/console\/workspace isolation/i],
  ["recovery", /keep the failed unit closed, correct the exact rejected input or failed dependency/i],
  ["rollout", /Land the listed .+ files as one guarded unit/i],
  ["rollback", /Stop new .+ execution, restore the last verified compatible implementation/i],
  ["telemetry", /introduces no inferred product event, customer analytics event, webhook, or customer notification/i],
  ["assumptions", /is valid only for the fields, actors, states, provider boundary, and files named above/i],
  ["exclusions", /Outside .+: unrelated product behavior, broad refactors, undeclared schema changes/i],
  ["states", /introduces no new persisted lifecycle value[\s\S]{0,500}bounded denial defined in Complete behavior and rules/i],
  ["permissions", /adds no authority grant[\s\S]{0,500}Only the already-authorized caller on the owning resource may invoke/i],
  ["review", /Review `[^`]+`, `[^`]+`, and `[^`]+` on the same commit[\s\S]{0,500}rollback result/i],
  ["success", /Keyboard, touch, focus, screen-reader, reduced-motion, and responsive behavior pass the applicable/i],
  ["success", /completes through the intended user and service path/i],
  ["recovery", /Keep the failed identity closed, correct the rejected input, authority, transition, concurrency, or dependency condition/i],
  ["rollout", /Deploy `[^`]+` behind its existing execution control[\s\S]{0,500}before wider execution/i],
  ["rollback", /Disable new execution through `[^`]+`, restore the last verified compatible handler/i],
  ["proof", /^Retain `[^`]+` with immutable inputs, result, timestamp, environment, commit, and trace correlation\.?$/i],
  ["assumptions", /is bound to `[^`]+`, the schemas and named states carried in this issue/i],
  ["exclusions", /permits changes only in the listed implementation, test, and proof paths/i],
  ["states", /No separate lifecycle row is added for .+ An accepted request to `[^`]+` commits its named result atomically/i],
  ["permissions", /Execution through `[^`]+` is restricted to the already-authorized caller on the owning resource/i],
  ["review", /independent reviewer must inspect `[^`]+`, `[^`]+`, and `[^`]+` from one commit and verify the exact schemas/i],
  ["failure", /fails closed on invalid input, unauthorized actor, forbidden scope, invalid transition, concurrency conflict, unavailable dependency, or incomplete proof/i],
  ["recovery", /Quarantine the failed identity, correct the exact rejected input, authority, transition, concurrency, or dependency condition, then replay the same idempotency identity/i],
  ["rollout", /Ship `[^`]+` with its current execution control disabled, pass `[^`]+` in a production-equivalent environment, enable one authorized synthetic canary/i],
  ["rollback", /Close new entry to `[^`]+`, restore the last compatible handler, preserve committed customer and audit data, reconcile every in-flight identity/i],
  ["telemetry", /Registered telemetry signals for .+: .+ Emit only these existing schemas after the owning transaction commits/i],
  ["proof", /Store `[^`]+` as immutable same-commit evidence containing input checksums, result, timestamps, environment, commit, trace correlation, reviewer, canary result, rollback result/i],
  ["assumptions", /This contract assumes `[^`]+`, its listed schemas and states, the stated authority boundary, and the fixtures in `[^`]+` remain aligned/i],
  ["exclusions", /Work is limited to the behavior, implementation, tests, and proof named here/i],
  ["review", /Provider contract and sandbox tests|Replay, timeout, retry, DLQ, and outage tests|Security and observability checks/i],
  ["review", /Static\/configuration validation|CI, deployment, migration, rollback, and recovery tests|Environment receipt validation/i],
  ["success", /Configuration, secrets, migration, deployment, rollback, recovery, and fail-closed behavior are tested/i],
  ["success", /CI and target-environment receipts identify commit, environment, timestamp, assertion, and result/i],
  ["behavior", /The implementation must preserve this exact rule:[\s\S]{0,600}Validate every named field, value, threshold, actor, and result before side effects/i],
  ["states", /This exact rule governs (?:the lifecycle|the stored result):[\s\S]{0,800}(?:Only transitions that satisfy that rule may commit|records the rule's named result atomically)/i],
  ["permissions", /Authorization must preserve this exact rule:[\s\S]{0,800}Only the .+ may execute `[^`]+`/i],
  ["review", /The reviewer must prove .+ by inspecting `[^`]+`, `[^`]+`, and `[^`]+` on one commit/i],
  ["failure", /If `[^`]+` cannot satisfy .+ because input, .+ authority, scope, transition, concurrency, dependency health, or proof is invalid/i],
  ["recovery", /After a failed .+ attempt, keep that identity closed, correct the rejected input, actor authority, transition, concurrency, or dependency condition/i],
  ["rollout", /Deploy `[^`]+` with entry disabled until `[^`]+` proves .+ in a production-equivalent environment/i],
  ["rollback", /If rollout violates .+, close new entry to `[^`]+`, restore the last compatible handler/i],
  ["telemetry", /This exact behavior rule (?:adds no|controls) .+:[\s\S]{0,900}Record (?:only )?commit, environment/i],
  ["proof", /Retain `[^`]+` to prove this exact rule:[\s\S]{0,800}The receipt must bind the checksums/i],
  ["assumptions", /The exact rule .+ assumes `[^`]+`[\s\S]{0,800}triggers a fresh contract and fixture review/i],
  ["exclusions", /The rule .+ permits only the listed implementation, test, and proof changes/i],
];

const TITLE_SCOPE_STOP_WORDS = new Set([
  "a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with",
  "flow", "integration", "management", "mode", "system",
]);

const SOURCE_DEFERRAL_PATTERNS = [
  /\b(?:read|reopen|consult|follow|see)\b[^\n.]{0,120}\b(?:master spec|ux design|pinned source|cited source|source section)\b/i,
  /\b(?:as defined|as specified|as detailed|as documented)\s+in\s+(?:the\s+)?(?:master spec|ux design|pinned source|cited source)/i,
  /\b(?:pinned|cited) source\b[^\n.]{0,120}\b(?:owns|controls|defines|governs|overrides)\b/i,
  /\b(?:source|spec(?:ification)?)\s+(?:owns|governs|defines)\s+(?:the\s+)?(?:complete|full|all|every)\s+(?:implementation|behavior|rules?|values?|contract|requirements?)/i,
  /\b(?:numbers|entitlements|limits?|thresholds?|values?|enums?)\b[^\n.]{0,120}\b(?:resolve|are sourced|are owned|remain owned)\b[^\n.]{0,120}(?:§|Appendix|source|spec)/i,
  /\bmust\s+read\s+(?:§|Appendix|the\s+(?:source|spec))/i,
  /\belsewhere in (?:this|the) spec\b/i,
  /\bthe source is authoritative\b/i,
  /\bissue may summarize but never narrow\b/i,
  /\b(?:full|complete|canonical)\s+(?:state machine|transition table|schema|contract|behavior)\s+(?:lives|is|remains)\s+(?:elsewhere|in another|outside this issue)\b/i,
];

const PLANNING_HISTORY_PATTERNS = [
  /_integration\/(?:RECONCILIATION|Integration_Prompts)/i,
  /\blegacy-import\b/i,
  /\bauthored extensions?\b/i,
  /\bauthoring intent\b/i,
  /\bstop-condition disposition\b/i,
  /\bv\d+(?:\.\d+)+(?:-REM)?\s+(?:remediation|descope|program|phase)\b/i,
  /\bphase\s+\d+(?:\.\d+)*\s+(?:brief|program|deliverable|closure)\b/i,
  /\b(?:legacy|historical|superseded|retired)\s+(?:issue|project|initiative|workspace plan|ticket|source)\b/i,
  /\b(?:cancelled|canceled|duplicate)\s+(?:issue|project|initiative|ticket)\b/i,
  /\bPhase\s+\d+(?:\.\d+)?\s*[—-]\s*landed under integration program\b/i,
  /\(\s*Phase\s+\d+(?:\.\d+)?\s+V\d+\s*\)/i,
  /\b(?:AC|acceptance criterion|failure mode|lifecycle row)\s*#?\s*\d+\b/i,
  /\bR\d+\s+(?:closure|pack|pilot|proof|row|history)\b/i,
  /\b(?:created during source repair|retained wording|outcome parent|Linear publication)\b/i,
  /\bauthored[- ]extension ledger\b/i,
  /\b(?:issue|ticket|project|initiative)\s+remains?\s+(?:Backlog|Canceled|Cancelled|Duplicate|unready)\b/i,
];

const NATIVE_FIELD = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(?:Release(?:\s+(?:version|sequence|name))?|Linear release|Team|Project|Milestone|Parent|Owner|Assignee|Reviewer|Review authority|Estimate|Priority|Labels?|Status|Cycle|Due date|Source family|Readiness|Kind)(?:\*\*)?\s*:/i;
const NATIVE_RELATION = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(?:Blocked by|Blocks|Related(?: to)?|Cross-references?)(?:\*\*)?\s*:/i;
const NATIVE_RELATION_HEADING = /^\s*#{1,6}\s+(?:Dependencies?|Blocking|Blockers?|Relations?|Cross-references?)\s*$/i;
const MANUAL_RELATION_PROSE = /\b(?:this issue|the issue|this ticket|the ticket)\s+(?:blocks|is blocked by|depends on)|\bblocked by (?:issue|ticket)\b|\bdownstream blocking is expressed\b|\boutcome-parent contract\b|\beach child must preserve\b|\bnamed independent reviewer capacity must be assigned natively\b|\bthis is a blocker\b/i;

const REPOSITORY_PATH_SURFACE = "(?:\\.github|app|apps|components|convex|delivery|docs|infra|lib|packages|public|reports|scripts|synthetics|tests|tools)";
const PATH_PREFIX = new RegExp(`^${REPOSITORY_PATH_SURFACE}/`);
const PATH_TOKEN = new RegExp(`${REPOSITORY_PATH_SURFACE}/[A-Za-z0-9@._{}\\[\\]+/-]+`, "g");
const CODE_TOKEN = /\b[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)+\b/g;
const GENERIC_CODE_TOKENS = new Set([
  "created_at", "updated_at", "deleted_at", "entity_id", "event_id", "workspace_id",
  "organization_id", "org_id", "request_id", "user_id", "created_by", "updated_by",
  "pending", "active", "failed", "complete", "completed", "rejected", "accepted",
  "ready", "running", "passed", "result", "status", "type", "kind", "value",
  "free_allowance",
]);
const BASELINE_NON_CONTRACT_HEADING = /^(?:pinned source|source provenance|source|release(?: and roadmap)? contract|roadmap contract|delivery|dependencies?|dependency and execution order|blocking|blockers?|relations?|native fields?|routing|traceability|required runtime producer)$/i;
const DELEGATION_VERB = /\b(?:owned by|owns?|consumes?|depends on|is blocked by|blocked by|provided by|implemented by|implementation belongs to|governed by|source of truth|see|per|after .{0,80} passes|before .{0,80} passes|waits? for)\b/i;
const MALFORMED_REFERENCE_REMNANT = /(?:\bis authoritative\.|\bapplies only where is silent\.|\bis owned by\s*[.;]|\bowned by\s*[–—-]\s*[.;]?|\bconsumes\s*[.;]|\bdepends on\s*[.;]|\bcanonical in\s*[.;]|\bregisters one\s*[.;]|\bapplicable\s+[–-]\s+checks\b|\bDeliver\s+Deliver\b|\bDeliver\s+Define\b|\busing\s+an\s+(?:Controlled|[A-Z][a-z]+)\b|\bagainst\s+a\s+entity\b|\bfor\s+and\s+(?:one|the)\b|\bregistered\s+in\s+and\b|\bsubmitted\s+grade\s+in(?:\s*[.;]|\s*$)|\bin\.0a\b|\bexpan\s*[.;]?\s*$|:\.\s*$|(?:^|\s)(?:from|per|under|required by)\s*(?:and|or)?\s*[.;])/i;
const MALFORMED_STRIPPED_FRAGMENT_PATTERNS = [
  /\b(?:lives?|registered|sourced|defined|governed|introduced|required)\s+(?:in|by|from|at|under)\s*[.;](?:\s|$)/i,
  /\b(?:and|or)\s+'s\b/i,
  /\binherit\s+'s\b/i,
  /\bintroduced by must\b/i,
  /\bfor\s+until\b/i,
  /\bpreference inheritance are\b/i,
  /\bonly is\b/i,
  /\bcompletion means\s*\//i,
  /\bper the the\b/i,
  /\b(?:required|owned|consumed)\s+[–—-]\s*(?:[.;]|$)/i,
  /\bconsistent with\)\.?\s*$/i,
  /\bhigher-authority boundaries:\.0a\b/i,
  /(?:^|[^`])\b[a-z][a-z0-9_]*\\[a-z][a-z0-9_]*\b/i,
  /\/(?:sellers|software):slug\b/i,
  /(?:^|[^,]),,{1,}|\.,,{1,}/,
  /\bOutcome Resolver\s+Outcome Resolver\b/i,
  /\bSource binding\.\s*\*,/i,
];
const STALE_OR_RETIRED_TITLE = /\b(?:Known Limitations\s*&\s*Phase 2 Roadmap|Data Residency\s*&\s*Compliance Roadmap|Pipeline Phase Mapping Correction|Drift Override Paragraphs|Evaluation Lead Role|Evaluator Role|Scorer Role|Seller Team (?:Owner|Lead|Member) Role)\b/i;
const RUNTIME_PRODUCT_CLAIM = /\b(?:live|runtime|deployed)\s+(?:endpoint|handler|mutation|query|route|worker|job|queue|dispatch|webhook|API|throttle)|\bHTTP\s+(?:2|4|5)\d{2}\b|\b429\b|\b(?:endpoint|handler|mutation|worker|job|queue|webhook delivery)\b[^.\n]{0,120}\b(?:commits?|persists?|dispatches?|delivers?|returns?|rejects?)\b/i;
const SOURCE_ONLY_CONTRACT = /\b(?:source-only (?:issue|change|repair|contract)|complete source-authoring proposal|not current runtime authority|no runtime(?:, application| application| execution| implementation| schema-migration| provider)? path is in scope|runtime remains (?:disabled|unauthorized))\b/i;
const PRODUCT_IMPLEMENTATION_PATH = /^(?:app|apps|components|convex|lib|packages|scripts)\//;
const STATIC_CI_IMPLEMENTATION_PATH = /^(?:tools|infra)\//;
const PRODUCTION_PROBE_PATH = /^synthetics\/.+\.(?:[cm]?[jt]sx?)$/i;
const EXECUTABLE_IMPLEMENTATION_PATH = /\.(?:[cm]?[jt]sx?)$/i;
const STATIC_CI_IMPLEMENTATION_FILE = /\.(?:[cm]?[jt]sx?|tf)$/i;
const EXECUTABLE_TEST_PATH = /^tests\/(?:unit|integration|e2e|accessibility|chaos|property|security|mobile|workers|middleware|openapi|observability|billing|ui)\/.+\.(?:[cm]?[jt]sx?)$/i;
const REFERENCE_DATA_ORCHESTRATION_PATH = /^tools\/reference-data-orchestration\/.+\.(?:[cm]?[jt]s)$/i;
const REFERENCE_DATA_ORCHESTRATION_TEST_PATH = /^tests\/(?:integration|e2e)\/.+\.(?:[cm]?[jt]sx?)$/i;
const PRODUCTION_RECEIPT_PATH = /^reports\/evidence\/.+\.json$/i;
const PRODUCT_RUNTIME_ASSERTION = /\b(?:HTTP\s+\d{3}|Idempotency-Key|deployed\s+(?:endpoint|handler|route|probe)|(?:endpoint|route|mutation|query|worker|job|webhook|email|notification|audit event|PostHog event|UI)\b[^.\n]{0,180}\b(?:must|exists?|returns?|rejects?|writes?|commits?|persists?|delivers?|dispatches?|renders?|enforces?))\b/i;
const SOURCE_HISTORY_CONTROL_PLANE_PATTERNS = [
  /\b(?:per|registered in|copied from|carried from|retained from)\s+this prompt\b/i,
  /\b(?:V\d+(?:\.\d+)?\s+(?:closure|add|carry)|stale\s+v\d+(?:\.\d+)?\s+draft|retired\s+in\s+V\d+(?:\.\d+)?|v\d+(?:\.\d+)?\s*(?:to|→|->)\s*v\d+(?:\.\d+)?)\b/i,
  /\b(?:pre-remediation|pre-repair|source-history|historical baseline|historical carry-over|terminal phase history|pending-proof)\b/i,
  /\b(?:MS|UX)\s+Baseline\b/i,
  /\b(?:required missing artifacts|retained-wording|outcome-parent|Linear-publication|authored-extension ledger|Documentation Blocker Major Rewrite)\b/i,
  /\b(?:source|row|section|contract|wording)\b[^.\n]{0,100}\b(?:created|promoted|landed|introduced|extended|closed)\s+(?:in|during|by)\s+Phase\s+\d+(?:\.\d+)?\b/i,
];
const LINEAR_CONTROL_PLANE_EXECUTION = /\b(?:Linear\s+(?:readback|publication|relation|release|milestone|estimate|owner|reviewer|label)|native\s+(?:release|milestone|estimate|owner|reviewer|label)|tools\/delivery\/(?:graph|generate|verify|linear)[^\s`)]*)\b/i;

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

function finding(code: string, evidence: string | string[]): SemanticFinding {
  return {
    code,
    evidence: Array.isArray(evidence) ? evidence.slice(0, 24) : [evidence],
    severity: "blocker",
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function canonicalStrings(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

function stringSetSha256(values: string[]): string {
  return sha256(JSON.stringify(values));
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : {};
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizePlan(
  plan: unknown,
  manifestRows: ManifestRowInput[],
  sourceOverrides: Record<string, SourceOverrideInput>,
): NormalizedUpdate[] {
  const rawPlan = asRecord(plan);
  const rawUpdates = rawPlan.updates;
  if (!Array.isArray(rawUpdates)) throw new Error("normalization plan must contain an updates array");
  const manifestByIssue = new Map(
    manifestRows.filter((row) => row.issueId).map((row) => [row.issueId as string, row]),
  );
  const seen = new Set<string>();
  return rawUpdates.map((raw, index) => {
    const update = asRecord(raw);
    const after = asRecord(update.after);
    const before = asRecord(update.before);
    const issueId = stringOrNull(update.issueId) ?? stringOrNull(update.lookupId);
    if (!issueId) throw new Error(`normalization update ${index + 1} lacks issueId`);
    if (seen.has(issueId)) throw new Error(`normalization plan duplicates ${issueId}`);
    seen.add(issueId);
    const title = stringOrNull(after.title) ?? stringOrNull(update.title);
    const description = stringOrNull(after.description) ?? stringOrNull(update.description);
    if (!title || !description) throw new Error(`${issueId} lacks normalized title or description`);
    const manifest = manifestByIssue.get(issueId);
    const rawSource = asRecord(update.source);
    const override = sourceOverrides[issueId];
    const requirementId = stringOrNull(rawSource.requirementId) ?? stringOrNull(manifest?.requirementId);
    const checksumSourceId = stringOrNull(rawSource.checksumSourceId);
    const sourceSha256 = stringOrNull(rawSource.sha256);
    const section = override?.section ?? stringOrNull(rawSource.section) ?? stringOrNull(manifest?.section);
    const document = override?.sourceDoc ?? stringOrNull(rawSource.document) ?? stringOrNull(manifest?.sourceDoc);
    const inferredRuntime = requirementId?.startsWith("RG:") ||
      /^Appendix M\.5\b/i.test(section ?? "") ||
      manifest?.disposition === "proof_only";
    return {
      classification: stringOrNull(update.classification) ?? (inferredRuntime ? "runtime_gate" : "feature"),
      description,
      diagnostics: asRecord(update.diagnostics),
      issueId,
      priorDescriptionSha256: stringOrNull(before.descriptionSha256),
      source: { checksumSourceId, document, requirementId, section, sha256: sourceSha256 },
      title,
    };
  });
}

function semanticKey(heading: string): string | null {
  const value = heading
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (/^outcome$/.test(value)) return "outcome";
  if (/^(?:complete behavior and rules|target contract|required (?:source )?contract|complete master contract|implementation contract|complete behavior)$/.test(value)) return "behavior";
  if (/behavior.*rules|rules.*behavior/.test(value)) return "behavior";
  if (/states?.*transitions?|transitions?.*states?/.test(value)) return "states";
  if (/permissions?.*(?:isolation|privacy|boundary)|(?:isolation|privacy|boundary).*permissions?/.test(value)) return "permissions";
  if (/^(?:exact )?(?:files\s*\/\s*)?paths?(?:\s*\/\s*delivery)?$/.test(value)) return "paths";
  if (/review.*readiness|readiness.*review/.test(value)) return "review";
  if (/^success$/.test(value)) return "success";
  if (/^failure$/.test(value)) return "failure";
  if (/^recovery$/.test(value)) return "recovery";
  if (/^rollout$/.test(value)) return "rollout";
  if (/^rollback$/.test(value)) return "rollback";
  if (/telemetry.*notifications?|notifications?.*telemetry/.test(value)) return "telemetry";
  if (/^(?:(?:named|required|immutable)\s+)?proof$/.test(value)) return "proof";
  if (/assumptions?.*validation|validation.*assumptions?/.test(value)) return "assumptions";
  if (/^exclusions?$/.test(value)) return "exclusions";
  if (/source provenance|provenance and source|canonical source/.test(value)) return "provenance";
  return null;
}

function markdownSections(description: string): MarkdownSection[] {
  const lines = description.split(/\r?\n/);
  const headings = lines.flatMap((line, index) => {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    return match ? [{ heading: match[2], index, level: match[1].length }] : [];
  });
  return headings.map((current, headingIndex) => {
    const next = headings.slice(headingIndex + 1).find((candidate) => candidate.level <= current.level);
    return {
      body: lines.slice(current.index + 1, next?.index ?? lines.length).join("\n").trim(),
      heading: current.heading,
      key: semanticKey(current.heading),
      level: current.level,
    };
  });
}

function firstSection(sections: MarkdownSection[], key: string): string {
  return sections.find((section) => section.key === key)?.body.trim() ?? "";
}

function outsideProvenance(sections: MarkdownSection[], description: string): string {
  const retained = sections.filter((section) => section.key !== "provenance");
  return retained.length > 0
    ? retained.map((section) => `## ${section.heading}\n${section.body}`).join("\n")
    : description;
}

function unresolvedSectionLookup(value: string): string | null {
  const lookup = /\b(?:per|under|according to|from|follows?|inherits? from|governed by|defined in|specified in|required by|resolves? (?:to|from)|see|read|consult)\b[^\n.]{0,90}(?:§\s*(?:M\.)?\d+(?:\.\d+)*|Appendix\s+[A-M](?:\.\d+)*)/i;
  const inlineExact = /(?:\bHTTP\s+\d{3}\b|[≤≥<>]=?\s*\d|\b\d+(?:\.\d+)?\s*(?:ms|seconds?|minutes?|hours?|days?|%|bytes?|KB|MB|GB)\b|`[^`]+`\s*(?:=|→|->|∈|is one of|only|must|cannot|reject|deny))/i;
  return value.split(/\r?\n/).find((line) => lookup.test(line) && !inlineExact.test(line)) ?? null;
}

function normalizedClause(line: string): string {
  return line.replace(/^\s*(?:[-*+]\s+\[[ xX]\]\s+|[-*+]\s+)/, "").trim();
}

function extractedPaths(body: string): string[] {
  const paths = new Set<string>();
  for (const match of body.matchAll(/`([^`\n]+)`/g)) {
    const candidate = match[1].replace(/^Planned:\s*/i, "").trim();
    if (PATH_PREFIX.test(candidate)) paths.add(candidate);
  }
  for (const match of body.matchAll(PATH_TOKEN)) {
    paths.add(match[0].replace(/[),.;:]+$/, ""));
  }
  return [...paths];
}

function isExactImplementationPath(path: string): boolean {
  if (/\s|[*?{}\[\]<>|;&]/.test(path) || path.endsWith("/")) return false;
  const basename = path.split("/").at(-1) ?? "";
  if (/^(?:Dockerfile|Procfile|Makefile|LICENSE|README|CODEOWNERS)$/.test(basename)) return true;
  return /\.(?:ts|tsx|js|jsx|mjs|cjs|json|jsonl|md|yaml|yml|css|scss|sql|graphql|gql|toml|tf|xml|html|sh|bash|zsh|py|go|rs|java|kt|swift|csv|txt|lock|snap)$/i.test(basename);
}

function hasExplicitPathReplacement(description: string, from: string, to: string): boolean {
  const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedTo = to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:\\|\\s*\\\`${escapedFrom}\\\`\\s*\\|\\s*\\\`${escapedTo}\\\`\\s*\\||\\\`${escapedFrom}\\\`\\s*(?:→|->)\\s*\\\`${escapedTo}\\\`)`,
  ).test(description);
}

function safeSourceText(root: string, sourceDoc: string): string | null {
  const requested = resolve(root, sourceDoc);
  const difference = relative(root, requested);
  if (difference === ".." || difference.startsWith("../") || isAbsolute(difference)) return null;
  if (!existsSync(requested)) return null;
  let actual: string;
  try {
    actual = realpathSync(requested);
  } catch {
    return null;
  }
  const actualDifference = relative(root, actual);
  if (actualDifference === ".." || actualDifference.startsWith("../") || isAbsolute(actualDifference)) return null;
  return readFileSync(actual, "utf8");
}

function normalizedHeading(value: string): string {
  return value
    .replace(/\\\./g, ".")
    .replace(/\{#[^}]+\}\s*$/, "")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceSection(source: string, section: string): string | null {
  const lineNumber = /^line:(\d+)$/i.exec(section)?.[1];
  if (lineNumber) return source.split(/\r?\n/)[Number(lineNumber) - 1] ?? null;
  const symbolic = /^§\s*((?:M\.)?\d+(?:\.\d+)*)$/i.exec(section)?.[1];
  const appendix = /^Appendix\s+([A-M](?:\.\d+(?:\.\d+)*)?)/i.exec(section)?.[1];
  const target = symbolic ?? appendix;
  if (!target) return null;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = appendix
    ? new RegExp(`^(?:Appendix\\s+)?${escaped}(?:\\s|:|—|$)`, "i")
    : /^\d+$/.test(target)
      ? new RegExp(`^(?:Section\\s+)?${escaped}(?:\\.\\s|\\s|:|—|$)`, "i")
      : new RegExp(`^${escaped}(?:\\s|:|—|$)`, "i");
  const lines = source.split(/\r?\n/);
  const matches = lines.flatMap((line, index) => {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    return heading && pattern.test(normalizedHeading(heading[2]))
      ? [{ index, level: heading[1].length }]
      : [];
  });
  if (matches.length !== 1) return null;
  const start = matches[0];
  const end = lines.findIndex((line, index) =>
    index > start.index && (/^(#{1,6})\s+/.exec(line)?.[1].length ?? 7) <= start.level
  );
  return lines.slice(start.index + 1, end < 0 ? lines.length : end).join("\n");
}

function verifiedSourceChecksumRows(
  root: string,
  updates: NormalizedUpdate[],
): Map<string, SourceChecksumContractRow> {
  const requestedIds = new Set(
    updates
      .map((update) => update.source.checksumSourceId)
      .filter((value): value is string => Boolean(value)),
  );
  const verified = new Map<string, SourceChecksumContractRow>();
  if (requestedIds.size === 0) return verified;

  const contractPath = resolve(root, "delivery/ticket-source-checksums.json");
  if (!existsSync(contractPath)) return verified;
  let contract: SourceChecksumContract;
  try {
    const raw = JSON.parse(readFileSync(contractPath, "utf8")) as Partial<SourceChecksumContract>;
    if ((raw.schemaVersion !== 1 && raw.schemaVersion !== 2) || !Array.isArray(raw.sources)) {
      return verified;
    }
    contract = raw as SourceChecksumContract;
  } catch {
    return verified;
  }

  for (const sourceId of requestedIds) {
    const rows = (contract.sources as SourceChecksumContractRow[])
      .filter((row) => row && typeof row === "object" && row.sourceId === sourceId);
    if (rows.length !== 1) continue;
    const row = rows[0];
    try {
      const findings = verifySourceChecksumContract(
        { schemaVersion: contract.schemaVersion, sources: [row] } as SourceChecksumContract,
        root,
      );
      if (findings.length === 0) verified.set(sourceId, row);
    } catch {
      // An invalid or stale checksum row is never used as semantic authority.
    }
  }
  return verified;
}

function trustedDraftDescriptionHashes(root: string): Map<string, string> {
  const sourceMapPath = resolve(root, "delivery/linear-normalization-source-map.json");
  const trusted = new Map<string, string>();
  if (!existsSync(sourceMapPath)) return trusted;
  try {
    const sourceMap = asRecord(JSON.parse(readFileSync(sourceMapPath, "utf8")));
    assertHistoricalNormalizationSourceMap(sourceMap);
    const drafts = asRecord(sourceMap.trustedDrafts);
    for (const [issueId, rawDraft] of Object.entries(drafts)) {
      const descriptionSha256 = stringOrNull(asRecord(rawDraft).descriptionSha256);
      if (/^[a-f0-9]{64}$/.test(descriptionSha256 ?? "")) {
        trusted.set(issueId, descriptionSha256 as string);
      }
    }
  } catch {
    return new Map<string, string>();
  }
  return trusted;
}

function hasVerifiedCurrentContractAuthority(
  update: NormalizedUpdate,
  context: SemanticAuditContext,
): boolean {
  const priorSha256 = update.priorDescriptionSha256;
  if (!priorSha256 || !/^[a-f0-9]{64}$/.test(priorSha256)) return false;
  if (context.trustedDraftDescriptionSha256ByIssue.get(update.issueId) === priorSha256) {
    return true;
  }
  return update.diagnostics.genericTemplate === false &&
    update.diagnostics.canonicalSourceExtracted === false &&
    update.diagnostics.requiresReview === false;
}

function checksumSlices(row: SourceChecksumContractRow): SourceChecksumSlice[] {
  return "slices" in row
    ? row.slices
    : "sectionHeading" in row
      ? []
    : [{
        sourceDoc: row.sourceDoc,
        startHeading: row.startHeading,
        endHeading: row.endHeading,
      }];
}

function exactMarkdownSection(source: string, sectionHeading: string): string | null {
  const level = /^(#{1,6})\s/.exec(sectionHeading)?.[1].length;
  if (!level) return null;
  const lines = source.match(/.*(?:\r?\n|$)/g) ?? [];
  let offset = 0;
  let start: number | null = null;
  let end = source.length;
  for (const line of lines) {
    if (!line) continue;
    const plain = line.replace(/\r?\n$/, "");
    if (plain === sectionHeading) {
      if (start !== null) return null;
      start = offset;
    } else if (start !== null) {
      const nextLevel = /^(#{1,6})\s/.exec(plain)?.[1].length;
      if (plain === "---" || (nextLevel !== undefined && nextLevel <= level)) {
        end = offset;
        break;
      }
    }
    offset += line.length;
  }
  return start === null ? null : source.slice(start, end);
}

function exactHeadingSlice(
  source: string,
  startHeading: string,
  endHeading: string,
): string | null {
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const line of source.match(/.*(?:\r?\n|$)/g) ?? []) {
    if (!line) continue;
    const value = line.replace(/\r?\n$/, "");
    if (value === startHeading) starts.push(offset);
    if (value === endHeading) ends.push(offset);
    offset += line.length;
  }
  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) return null;
  return source.slice(starts[0], ends[0]);
}

function verifiedSourceBundle(
  update: NormalizedUpdate,
  context: SemanticAuditContext,
): string | null {
  const sourceId = update.source.checksumSourceId;
  const expectedSha256 = update.source.sha256;
  if (!sourceId || !expectedSha256) return null;
  const row = context.sourceChecksumRowsById.get(sourceId);
  if (!row || row.sha256 !== expectedSha256) return null;

  const cacheKey = `${sourceId}\u0000${expectedSha256}`;
  const cached = context.sourceBundleTextByKey.get(cacheKey);
  if (cached !== undefined) return cached;
  if ("sectionHeading" in row) {
    let source = context.sourceTextByDocument.get(row.sourceDoc);
    if (source === undefined) {
      source = safeSourceText(context.root, row.sourceDoc);
      context.sourceTextByDocument.set(row.sourceDoc, source);
    }
    const section = source
      ? exactMarkdownSection(source, row.sectionHeading)
      : null;
    context.sourceBundleTextByKey.set(cacheKey, section);
    return section;
  }
  const slices: string[] = [];
  for (const slice of checksumSlices(row)) {
    let source = context.sourceTextByDocument.get(slice.sourceDoc);
    if (source === undefined) {
      source = safeSourceText(context.root, slice.sourceDoc);
      context.sourceTextByDocument.set(slice.sourceDoc, source);
    }
    const exact = source
      ? exactHeadingSlice(source, slice.startHeading, slice.endHeading)
      : null;
    if (!exact) {
      context.sourceBundleTextByKey.set(cacheKey, null);
      return null;
    }
    slices.push(exact);
  }
  const bundle = slices.join("\n");
  context.sourceBundleTextByKey.set(cacheKey, bundle);
  return bundle;
}

function codeTokens(value: string): Set<string> {
  const tokens = new Set<string>();
  for (const match of value.toLowerCase().matchAll(CODE_TOKEN)) {
    const token = match[0];
    if (
      token.includes("/") ||
      PATH_PREFIX.test(token) ||
      GENERIC_CODE_TOKENS.has(token) ||
      /^\d/.test(token) ||
      token.length < 5
    ) continue;
    tokens.add(token);
  }
  return tokens;
}

function hasExplicitEventTokenContext(clause: string, tokenIndex: number, tokenLength: number): boolean {
  const before = clause.slice(Math.max(0, tokenIndex - 160), tokenIndex);
  const after = clause.slice(tokenIndex + tokenLength, tokenIndex + tokenLength + 100);
  if (/\b(?:(?:registered|canonical|customer|internal|product|posthog|audit)\s+)*(?:events?|signals?|webhooks?|notifications?|metrics?|telemetry)\s*(?:(?:named|called|is|are)\s*)?[:`'"(\[]*$/i.test(before)) return true;
  if (/^[\s:`'"()\[\]—-]*(?:(?:is|as)\s+)?(?:(?:an?|the|registered|canonical|customer|internal|product|posthog|audit)\s+)*(?:events?|signals?|webhooks?|notifications?|metrics?|telemetry)\b/i.test(after)) return true;

  const unambiguous = [...before.matchAll(/\b(?:emit(?:s|ted|ting)?|fire(?:s|d)?|dispatch(?:es|ed)?|notif(?:y|ies|ied|ying)|enqueue(?:s|d|ing)?|send(?:s|sent|ing)?)\b/gi)];
  const lastVerb = unambiguous[unambiguous.length - 1];
  if (!lastVerb) return false;
  const between = before.slice((lastVerb.index ?? 0) + lastVerb[0].length);
  return between.length <= 140 &&
    !/\b(?:no|never|without)\b/i.test(between) &&
    !/\b(?:with|payload|field|property|contains?|carries|including|includes?)\b/i.test(between);
}

function hasTypedNonEventIdentifierContext(clause: string, tokenIndex: number, tokenLength: number): boolean {
  const before = clause.slice(Math.max(0, tokenIndex - 100), tokenIndex);
  const after = clause.slice(tokenIndex + tokenLength, tokenIndex + tokenLength + 80);
  const kind = "(?:MCP\\s+)?tool|capability|field|configuration|configurability|definition|error(?:\\s+code)?|retry(?:\\s+(?:class|identifier|policy|schedule))?";
  return new RegExp(`\\b(?:${kind})\\b[^.!?]{0,80}$`, "i").test(before) ||
    new RegExp(`^[^.!?]{0,50}\\b(?:${kind})\\b`, "i").test(after);
}

function eventTokens(value: string, positiveOnly = false, typedIdentifierContext = false): Set<string> {
  const tokens = new Set<string>();
  const emissionVerb = /\b(?:emit(?:s|ted|ting)?|fire(?:s|d)?|dispatch(?:es|ed)?|deliver(?:s|ed|ing)?|receiv(?:e|es|ed|ing)|notif(?:y|ies|ied|ying)|publish(?:es|ed|ing)?|enqueue(?:s|d|ing)?|write(?:s|written)?|record(?:s|ed|ing)?|send(?:s|sent|ing)?)\b/i;
  const negatedEmission = /\b(?:no|never|must not|does not|do not)\b[^.]{0,50}\b(?:emit(?:s|ted|ting)?|fire(?:s|d)?|dispatch(?:es|ed)?|deliver(?:s|ed|ing)?|receiv(?:e|es|ed|ing)|notif(?:y|ies|ied|ying)|publish(?:es|ed|ing)?|enqueue(?:s|d|ing)?|write(?:s|written)?|record(?:s|ed|ing)?|send(?:s|sent|ing)?)\b/i;
  for (const line of value.split(/\r?\n/)) {
    for (const clause of line.split(/(?<=[.!?])\s+|;\s+/)) {
      if (!/\b(?:events?|webhooks?|signals?|metrics?|telemetry|notifications?|emails?|in-app|messages?|registered|registry|detector|emit|fire|dispatch|deliver|receive|notify|publish|enqueue|send|posthog|audit)\b/i.test(clause)) continue;
      if (positiveOnly && (!emissionVerb.test(clause) || negatedEmission.test(clause))) continue;
      const verbIndex = clause.search(emissionVerb);
      for (const token of codeTokens(clause)) {
        if (!token.includes("_") && !token.includes(".")) continue;
        if (/\.(?:cjs|css|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$/i.test(token)) continue;
        const tokenIndex = clause.toLowerCase().indexOf(token);
        const explicitEventContext = hasExplicitEventTokenContext(clause, tokenIndex, token.length);
        if ((typedIdentifierContext || hasTypedNonEventIdentifierContext(clause, tokenIndex, token.length)) && !explicitEventContext) continue;
        if (positiveOnly) {
          const between = verbIndex >= 0 && tokenIndex > verbIndex
            ? clause.slice(verbIndex, tokenIndex).toLowerCase()
            : "";
          if (
            /(?:^|[._])(?:id|state|status|kind|type|version|count|region|handle|reason|reference|destination|pending)$|_(?:id|at|cents|minor|band|expires_at|remaining|sla|atomic|atomic_delta|exact_authority|no_secret_exposure|sequence|dsar)$/i.test(token) ||
            verbIndex < 0 || tokenIndex <= verbIndex || tokenIndex - verbIndex > 140 ||
            /\b(?:with|payload|field|property|contains?|carries|including|includes?)\b/.test(between)
          ) continue;
        }
        tokens.add(token);
      }
    }
  }
  return tokens;
}

function baselineIssueId(issue: BaselineIssueInput): string | null {
  const direct = issue.identifier?.trim() || issue.id?.trim();
  if (direct && /^(?:PLA|BUY|SEL|INT)-\d+$/.test(direct)) return direct;
  return /\/(PLA|BUY|SEL|INT)-(\d+)(?:\/|$)/i.exec(issue.url ?? "")
    ?.slice(1, 3)
    .join("-")
    .toUpperCase() ?? null;
}

function cleanIssueTitle(value: string): string {
  return value.replace(/^(?:\s*\[[^\]]+\]\s*)+/, "").replace(/\s+/g, " ").trim();
}

function baselineContractBody(description: string): string {
  const lines = description.split(/\r?\n/);
  const headingStack: Array<{ excluded: boolean; level: number }> = [];
  const retained: string[] = [];
  let inFence = false;
  let sawHeading = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (!headingStack.some((heading) => heading.excluded)) retained.push(line);
      inFence = !inFence;
      continue;
    }
    const heading = !inFence ? /^(#{1,6})\s+(.+?)\s*$/.exec(line) : null;
    if (heading) {
      sawHeading = true;
      const level = heading[1].length;
      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1]!.level >= level
      ) {
        headingStack.pop();
      }
      headingStack.push({
        excluded: BASELINE_NON_CONTRACT_HEADING.test(normalizedHeading(heading[2])),
        level,
      });
      continue;
    }
    if (!headingStack.some((current) => current.excluded)) retained.push(line);
  }
  const body = sawHeading ? retained.join("\n") : description;
  return body
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      const clippedLegacyImport = trimmed.length >= 238 &&
        trimmed.length <= 248 &&
        /^[*-]\s+(?:\[[ xX]\]\s+)?/.test(trimmed) &&
        /[A-Za-z0-9_]$/.test(trimmed) &&
        !/[.!?;:]$/.test(trimmed);
      const templateMetadata = /linear\.app\/|\bcodex-ready\b|\b(?:Sourcera_Master_Spec|UX_Design_of_Sourcera)\.md\b|\bMaster Spec is authoritative\b|\bUX Design applies only where the Master Spec is silent\b|\bImplement the required frontend, backend, data, permissions, error, accessibility, security, telemetry, and operations behavior\b|\bEnforce data, permission, state, and business rules server-side before UI success\b|\bKeep this issue scoped to its named outcome\b|\bRuntime readiness requires deployed proof\b|\bThe delivered behavior satisfies this outcome\b|\bServer-side authorization, org\/console\/workspace isolation\b|\bAudit, telemetry, retention, DSAR, residency, and operational behavior match the cited contract\b|\bImplement only notifications named by the cited source\b|\bSeparate requirement-map rows\b|\bDocumentation edits or runtime-readiness claims\b|\bReviewed focused change linked to this issue\b|\bPassing CI for the listed tests\b|\bStaging or production receipt where the source\b/i.test(line);
      return !NATIVE_FIELD.test(line) && !NATIVE_RELATION.test(line) && !clippedLegacyImport && !templateMetadata;
    })
    .join("\n")
    .replace(ISSUE_ID, " ")
    .replace(SOURCE_ID, " ")
    .replace(OTHER_SOURCE_ID, " ")
    .replace(DEFECT_OR_DECISION_ID, " ")
    .replace(ASSUMPTION_ID, " ")
    .replace(LOCAL_ASSUMPTION_ID, " ");
}

function preservationTokens(value: string): Set<string> {
  const tokens = codeTokens(value);
  for (const token of [...tokens]) {
    if (
      /^(?:codex-ready|sourcera-production|runtime-readiness|requirement-map|no-notification|server-side)$/i.test(token) ||
      /^sha256:[0-9a-f]{8,}$/i.test(token) ||
      /^[0-9a-f]{32,}$/i.test(token) ||
      /^v\d+(?:\.\d+)+(?:[a-z]|-[a-z0-9.-]+)?$/i.test(token) ||
      LEGACY_ARTIFACT_PATH_ID.test(token) ||
      /\.(?:json|jsonl|md|ts|tsx|js|mjs|cjs|tf|yaml|yml|csv)$/i.test(token) ||
      /^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(token)
    ) tokens.delete(token);
  }
  for (const match of value.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1].trim().toLowerCase();
    if (
      token.length < 5 ||
      token.length > 160 ||
      token.includes("/") ||
      PATH_PREFIX.test(token) ||
      /^(?:https?:|sha256:|(?:pla|buy|sel|int)-\d+|f-[a-z0-9.-]+|[0-9a-f]{32,})$/i.test(token) ||
      /^v\d+(?:\.\d+)+(?:[a-z]|-[a-z0-9.-]+)?$/i.test(token) ||
      LEGACY_ARTIFACT_PATH_ID.test(token) ||
      GENERIC_CODE_TOKENS.has(token)
    ) continue;
    tokens.add(token);
  }
  for (const match of value.matchAll(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s`),;]+)/g)) {
    tokens.add(`${match[0].split(/\s+/)[0].toLowerCase()} ${match[1].toLowerCase()}`);
  }
  return tokens;
}

function baselineLossFingerprint(
  update: NormalizedUpdate,
  baseline: BaselineIssueInput | undefined,
): BaselineLossFingerprint | null {
  if (typeof baseline?.description !== "string" || !baseline.description) return null;
  const baselineBody = baselineContractBody(baseline.description);
  const candidateSections = markdownSections(update.description);
  const candidateBody = outsideProvenance(candidateSections, update.description);
  const beforeTokens = preservationTokens(baselineBody);
  const afterTokens = preservationTokens(candidateBody);
  const lostTokens = canonicalStrings([...beforeTokens].filter((token) => !afterTokens.has(token)));
  const beforePaths = canonicalStrings(
    extractedPaths(baselineBody)
      .filter((path) => isExactImplementationPath(path) && !LEGACY_ARTIFACT_PATH_ID.test(path)),
  );
  const afterPaths = new Set(extractedPaths(update.description).filter(isExactImplementationPath));
  const lostPaths = canonicalStrings(beforePaths.filter((path) => !afterPaths.has(path)));
  const lossRatio = beforeTokens.size > 0 ? lostTokens.length / beforeTokens.size : 0;
  return {
    baselineDescriptionSha256: sha256(baseline.description),
    candidateDescriptionSha256: sha256(update.description),
    lostPaths,
    lostPathsSha256: stringSetSha256(lostPaths),
    lostTokens,
    lostTokensSha256: stringSetSha256(lostTokens),
    substantivePathLoss: lostPaths.length > 0,
    substantiveTokenLoss: !isRuntimeGate(update, update.description) &&
      beforeTokens.size >= 8 && lostTokens.length >= 8 && lossRatio >= 0.3,
  };
}

function exactSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function exactSortedStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && item.length > 0)) {
    return null;
  }
  const strings = value as string[];
  const canonical = canonicalStrings(strings);
  return JSON.stringify(strings) === JSON.stringify(canonical) ? strings : null;
}

function exactAuthorityEvidence(value: unknown): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === "string" && item.trim().length > 0)
  ) return null;
  return value as string[];
}

const INTENTIONAL_REPLACEMENT_DISPOSITIONS = new Set<IntentionalBaselineReplacementDisposition>([
  "preserved_semantically",
  "superseded_by_approved_source",
  "nativeized",
  "removed_legacy_literal",
  "control_plane_only",
  "planned_path_replaced",
]);

const INTENTIONAL_REPLACEMENT_ROW_KEYS = new Set([
  "authorityEvidence",
  "baselineDescriptionSha256",
  "candidateDescriptionSha256",
  "dispositions",
  "issueId",
  "lostPaths",
  "lostPathsSha256",
  "lostTokens",
  "lostTokensSha256",
  "rationale",
  "replacementMap",
]);

function containsBlanketApproval(value: string): boolean {
  return value === "*" || value.includes("**") || /[?{}\[\]]/.test(value) || /<[^>]+>/.test(value);
}

function dispositionKey(kind: "path" | "token", value: string): string {
  return `${kind}:${value}`;
}

function canonicalDispositionKey(value: IntentionalBaselineReplacementDispositionInput): string {
  return dispositionKey(value.kind, value.value);
}

function exactDispositions(
  value: unknown,
  errors: string[],
): IntentionalBaselineReplacementDispositionInput[] | null {
  if (!Array.isArray(value)) {
    errors.push("dispositions must be an exact array with one row per lost token and path");
    return null;
  }
  const parsed: IntentionalBaselineReplacementDispositionInput[] = [];
  const seen = new Set<string>();
  for (const [index, rawDisposition] of value.entries()) {
    const item = asRecord(rawDisposition);
    const prefix = `disposition ${index + 1}`;
    const unknownKeys = Object.keys(item).filter((key) =>
      !new Set(["disposition", "evidence", "kind", "replacement", "value"]).has(key)
    );
    if (unknownKeys.length > 0) errors.push(`${prefix} has unsupported fields: ${unknownKeys.sort().join(", ")}`);
    const kind = item.kind;
    const itemValue = stringOrNull(item.value);
    const disposition = item.disposition;
    const evidence = exactAuthorityEvidence(item.evidence);
    const replacement = item.replacement === undefined ? undefined : stringOrNull(item.replacement);
    if (kind !== "token" && kind !== "path") errors.push(`${prefix} kind must be token or path`);
    if (!itemValue || containsBlanketApproval(itemValue)) errors.push(`${prefix} value is missing, wildcarded, or invalid`);
    if (!INTENTIONAL_REPLACEMENT_DISPOSITIONS.has(disposition as IntentionalBaselineReplacementDisposition)) {
      errors.push(`${prefix} disposition is invalid`);
    }
    if (!evidence || evidence.some(containsBlanketApproval)) {
      errors.push(`${prefix} evidence must be exact and nonempty`);
    }
    if (item.replacement !== undefined && (!replacement || containsBlanketApproval(replacement))) {
      errors.push(`${prefix} replacement must be an exact non-wildcard string`);
    }
    if (disposition === "removed_legacy_literal") {
      if (item.replacement !== undefined) errors.push(`${prefix} removed_legacy_literal must not name a replacement`);
    } else if (!replacement) {
      errors.push(`${prefix} ${String(disposition)} requires an exact replacement`);
    }
    if (disposition === "planned_path_replaced") {
      if (kind !== "path") errors.push(`${prefix} planned_path_replaced is valid only for a lost path`);
      if (!replacement || !isExactImplementationPath(replacement)) {
        errors.push(`${prefix} planned_path_replaced requires an exact implementation path replacement`);
      }
    }
    if (kind === "path" && itemValue && !isExactImplementationPath(itemValue)) {
      errors.push(`${prefix} path value must be an exact implementation path`);
    }
    if ((kind !== "token" && kind !== "path") || !itemValue || !evidence ||
      !INTENTIONAL_REPLACEMENT_DISPOSITIONS.has(disposition as IntentionalBaselineReplacementDisposition)) continue;
    const key = dispositionKey(kind, itemValue);
    if (seen.has(key)) errors.push(`${prefix} duplicates ${key}`);
    seen.add(key);
    parsed.push({
      disposition: disposition as IntentionalBaselineReplacementDisposition,
      evidence,
      kind,
      ...(replacement ? { replacement } : {}),
      value: itemValue,
    });
  }
  const canonical = [...parsed].sort((left, right) =>
    canonicalDispositionKey(left).localeCompare(canonicalDispositionKey(right))
  );
  if (JSON.stringify(parsed) !== JSON.stringify(canonical)) {
    errors.push("dispositions must be sorted by kind and value with exact field content");
  }
  return parsed;
}

function exactReplacementMap(
  value: unknown,
  errors: string[],
): IntentionalBaselineReplacementMapInput[] | null {
  if (!Array.isArray(value)) {
    errors.push("replacementMap must be an exact array");
    return null;
  }
  const parsed: IntentionalBaselineReplacementMapInput[] = [];
  const seen = new Set<string>();
  for (const [index, rawMapping] of value.entries()) {
    const mapping = asRecord(rawMapping);
    const prefix = `replacementMap ${index + 1}`;
    const unknownKeys = Object.keys(mapping).filter((key) => !new Set(["evidence", "from", "to"]).has(key));
    if (unknownKeys.length > 0) errors.push(`${prefix} has unsupported fields: ${unknownKeys.sort().join(", ")}`);
    const from = stringOrNull(mapping.from);
    const to = stringOrNull(mapping.to);
    const evidence = exactAuthorityEvidence(mapping.evidence);
    if (!from || containsBlanketApproval(from) || !isExactImplementationPath(from)) {
      errors.push(`${prefix} from must be one exact implementation path`);
    }
    if (!to || containsBlanketApproval(to) || !isExactImplementationPath(to)) {
      errors.push(`${prefix} to must be one exact implementation path`);
    }
    if (from && to && from === to) errors.push(`${prefix} cannot map a path to itself`);
    if (!evidence || evidence.some(containsBlanketApproval)) {
      errors.push(`${prefix} evidence must be exact and nonempty`);
    }
    if (!from || !to || !evidence) continue;
    if (seen.has(from)) errors.push(`${prefix} duplicates from path ${from}`);
    seen.add(from);
    parsed.push({ evidence, from, to });
  }
  const canonical = [...parsed].sort((left, right) =>
    left.from.localeCompare(right.from) || left.to.localeCompare(right.to)
  );
  if (JSON.stringify(parsed) !== JSON.stringify(canonical)) {
    errors.push("replacementMap must be sorted by from and to path with exact field content");
  }
  return parsed;
}

function intentionalReplacementRowSha256(row: IntentionalBaselineReplacementInput): string {
  return sha256(JSON.stringify({
    authorityEvidence: row.authorityEvidence,
    baselineDescriptionSha256: row.baselineDescriptionSha256,
    candidateDescriptionSha256: row.candidateDescriptionSha256,
    dispositions: row.dispositions,
    issueId: row.issueId,
    lostPaths: row.lostPaths,
    lostPathsSha256: row.lostPathsSha256,
    lostTokens: row.lostTokens,
    lostTokensSha256: row.lostTokensSha256,
    rationale: row.rationale,
    replacementMap: row.replacementMap,
  }));
}

function validateReplacementRegister(
  registerInput: unknown,
  options: SemanticAuditOptions,
  root: string,
  updateIds: Set<string>,
  fingerprints: Map<string, BaselineLossFingerprint>,
  baselineByIssue: Map<string, BaselineIssueInput>,
  updatesByIssue: Map<string, NormalizedUpdate>,
): ReplacementRegisterValidation {
  if (registerInput === undefined) {
    return { digestSha256: null, findings: [], rowsByIssue: new Map(), supplied: false };
  }

  const errors: string[] = [];
  const raw = asRecord(registerInput);
  const serializedRegister = JSON.stringify(registerInput);
  const computedDigest = sha256(typeof serializedRegister === "string" ? serializedRegister : "");
  let digestSha256 = computedDigest;
  if (options.replacementRegisterSha256 !== undefined) {
    if (!exactSha256(options.replacementRegisterSha256)) {
      errors.push("replacement register digest is not a lowercase SHA-256 value");
    } else {
      digestSha256 = options.replacementRegisterSha256;
    }
  }
  const scopedToMatchingLosses = options.replacementRegisterScope === "matching-losses";
  const matchingLossIds = new Set(
    [...fingerprints.entries()]
      .filter(([, fingerprint]) => fingerprint.lostTokens.length > 0 || fingerprint.lostPaths.length > 0)
      .map(([issueId]) => issueId),
  );
  const rawIssuesForScope = Array.isArray(raw.issues) ? raw.issues : [];
  const hasMatchingRegisterRow = rawIssuesForScope.some((rawIssue) => {
    const issueId = stringOrNull(asRecord(rawIssue).issueId);
    return issueId !== null && matchingLossIds.has(issueId) && updateIds.has(issueId);
  });
  if (scopedToMatchingLosses && !hasMatchingRegisterRow) {
    return { digestSha256, findings: [], rowsByIssue: new Map(), supplied: true };
  }
  if (typeof registerInput !== "object" || registerInput === null || Array.isArray(registerInput)) {
    errors.push("replacement register must be a JSON object");
  }
  if (raw.schemaVersion !== 1) errors.push("replacement register schemaVersion must be 1");
  if (raw.kind !== "linear_intentional_baseline_replacements") {
    errors.push("replacement register kind must be linear_intentional_baseline_replacements");
  }

  if (raw.baselineCaptureSha256 !== undefined) {
    if (!exactSha256(raw.baselineCaptureSha256)) {
      errors.push("baselineCaptureSha256 is not a lowercase SHA-256 value");
    } else if (!exactSha256(options.baselineCaptureSha256)) {
      errors.push("baselineCaptureSha256 cannot be verified because no baseline capture digest was supplied");
    } else if (raw.baselineCaptureSha256 !== options.baselineCaptureSha256) {
      errors.push("baselineCaptureSha256 does not match the audited baseline capture");
    }
  }

  const sourceDocument = stringOrNull(raw.sourceDocument);
  const sourceSha = raw.sourceSha256;
  let currentAuthorityText = "";
  if (raw.sourceDocument !== undefined || sourceSha !== undefined) {
    if (!sourceDocument || !exactSha256(sourceSha)) {
      errors.push("sourceDocument and lowercase sourceSha256 must be supplied together");
    } else {
      const source = safeSourceText(root, sourceDocument);
      if (source === null) {
        errors.push(`current-authority source cannot be read inside the audit root: ${sourceDocument}`);
      } else if (sha256(source) !== sourceSha) {
        errors.push(`sourceSha256 does not match current authority: ${sourceDocument}`);
      } else {
        currentAuthorityText = source;
      }
    }
  }

  const rawIssues = raw.issues;
  if (!Array.isArray(rawIssues)) errors.push("replacement register issues must be an array");
  const rowsByIssue = new Map<string, IntentionalBaselineReplacementInput>();
  const duplicateIds = new Set<string>();
  const seenRowIds = new Set<string>();
  for (const [index, rawIssue] of (Array.isArray(rawIssues) ? rawIssues : []).entries()) {
    const issue = asRecord(rawIssue);
    const issueId = typeof issue.issueId === "string" ? issue.issueId : "";
    if (scopedToMatchingLosses && (!updateIds.has(issueId) || !matchingLossIds.has(issueId))) continue;
    const prefix = issueId || `row ${index + 1}`;
    const rowErrors: string[] = [];
    const unknownRowKeys = Object.keys(issue).filter((key) => !INTENTIONAL_REPLACEMENT_ROW_KEYS.has(key));
    if (unknownRowKeys.length > 0) {
      rowErrors.push(`unsupported row fields: ${unknownRowKeys.sort().join(", ")}`);
    }
    if (!/^(?:PLA|BUY|SEL|INT)-\d+$/.test(issueId)) {
      rowErrors.push("issueId is missing or invalid");
    }
    if (issueId && !updateIds.has(issueId)) rowErrors.push("row is extra: issue is not in the audited plan");
    if (issueId && seenRowIds.has(issueId)) {
      rowErrors.push("issueId is duplicated");
      duplicateIds.add(issueId);
      rowsByIssue.delete(issueId);
    }
    if (issueId) seenRowIds.add(issueId);
    if (!exactSha256(issue.baselineDescriptionSha256)) {
      rowErrors.push("baselineDescriptionSha256 is missing or invalid");
    }
    if (!exactSha256(issue.candidateDescriptionSha256)) {
      rowErrors.push("candidateDescriptionSha256 is missing or invalid");
    }
    const lostTokens = exactSortedStringArray(issue.lostTokens);
    const lostPaths = exactSortedStringArray(issue.lostPaths);
    if (lostTokens === null) rowErrors.push("lostTokens must be an exact sorted unique string array");
    if (lostPaths === null) rowErrors.push("lostPaths must be an exact sorted unique string array");
    if (!exactSha256(issue.lostTokensSha256)) {
      rowErrors.push("lostTokensSha256 is missing or invalid");
    } else if (lostTokens && stringSetSha256(lostTokens) !== issue.lostTokensSha256) {
      rowErrors.push("lostTokensSha256 does not match lostTokens");
    }
    if (!exactSha256(issue.lostPathsSha256)) {
      rowErrors.push("lostPathsSha256 is missing or invalid");
    } else if (lostPaths && stringSetSha256(lostPaths) !== issue.lostPathsSha256) {
      rowErrors.push("lostPathsSha256 does not match lostPaths");
    }
    const rationale = stringOrNull(issue.rationale);
    if (!rationale) rowErrors.push("rationale is empty");
    const authorityEvidence = exactAuthorityEvidence(issue.authorityEvidence);
    if (!authorityEvidence) rowErrors.push("authorityEvidence must contain current-authority evidence");
    const dispositions = exactDispositions(issue.dispositions, rowErrors);
    const replacementMap = exactReplacementMap(issue.replacementMap, rowErrors);

    if (lostTokens && lostPaths && dispositions) {
      const expectedDispositionKeys = canonicalStrings([
        ...lostTokens.map((token) => dispositionKey("token", token)),
        ...lostPaths.map((path) => dispositionKey("path", path)),
      ]);
      const actualDispositionKeys = canonicalStrings(dispositions.map(canonicalDispositionKey));
      const missing = expectedDispositionKeys.filter((key) => !actualDispositionKeys.includes(key));
      const extra = actualDispositionKeys.filter((key) => !expectedDispositionKeys.includes(key));
      if (missing.length > 0) rowErrors.push(`dispositions are missing exact loss items: ${missing.join(", ")}`);
      if (extra.length > 0) rowErrors.push(`dispositions contain extra loss items: ${extra.join(", ")}`);
      for (const disposition of dispositions) {
        if (disposition.kind === "path" && disposition.disposition !== "planned_path_replaced") {
          rowErrors.push(`${canonicalDispositionKey(disposition)} must use planned_path_replaced`);
        }
        if (disposition.kind === "token" && disposition.disposition === "planned_path_replaced") {
          rowErrors.push(`${canonicalDispositionKey(disposition)} cannot use planned_path_replaced`);
        }
        if (disposition.disposition === "nativeized" && !/^Linear\.[A-Za-z][A-Za-z0-9.]*$/.test(disposition.replacement ?? "")) {
          rowErrors.push(`${canonicalDispositionKey(disposition)} nativeized replacement must name one exact Linear native field`);
        }
      }
    }

    const baselineDescription = baselineByIssue.get(issueId)?.description;
    const candidateDescription = updatesByIssue.get(issueId)?.description;
    const baselinePaths = new Set(typeof baselineDescription === "string" ? extractedPaths(baselineDescription) : []);
    const candidatePaths = new Set(typeof candidateDescription === "string" ? extractedPaths(candidateDescription) : []);
    if (dispositions) {
      const replacementAuthority = `${candidateDescription ?? ""}\n${currentAuthorityText}`;
      const normalizedReplacementAuthority = replacementAuthority
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      for (const disposition of dispositions) {
        if (
          disposition.disposition === "preserved_semantically" ||
          disposition.disposition === "superseded_by_approved_source"
        ) {
          const replacementParts = (disposition.replacement ?? "").split(/\s+\+\s+/);
          const unresolved = replacementParts.filter((part) => {
            const normalized = part
              .toLowerCase()
              .replace(/[^a-z0-9_]+/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            return !normalized || !normalizedReplacementAuthority.includes(normalized);
          });
          if (unresolved.length > 0) {
            rowErrors.push(`${canonicalDispositionKey(disposition)} replacement is absent from the candidate and current authority: ${unresolved.join(" + ")}`);
          }
        }
        if (disposition.disposition === "control_plane_only") {
          if (!disposition.replacement || !isExactImplementationPath(disposition.replacement) ||
            !candidatePaths.has(disposition.replacement)) {
            rowErrors.push(`${canonicalDispositionKey(disposition)} control_plane_only replacement must be one exact candidate control-plane path`);
          }
        }
      }
    }
    if (replacementMap) {
      for (const mapping of replacementMap) {
        if (!baselinePaths.has(mapping.from)) {
          rowErrors.push(`replacementMap from path is absent from the exact baseline: ${mapping.from}`);
        }
        if (!candidatePaths.has(mapping.to)) {
          rowErrors.push(`replacementMap to path is absent from the exact candidate: ${mapping.to}`);
        }
      }
    }
    if (dispositions && replacementMap) {
      const mapByFrom = new Map(replacementMap.map((mapping) => [mapping.from, mapping]));
      for (const disposition of dispositions.filter((item) => item.disposition === "planned_path_replaced")) {
        const mapping = mapByFrom.get(disposition.value);
        if (!mapping) {
          rowErrors.push(`${canonicalDispositionKey(disposition)} has no exact replacementMap entry`);
        } else if (mapping.to !== disposition.replacement) {
          rowErrors.push(`${canonicalDispositionKey(disposition)} replacement does not match replacementMap`);
        }
      }
      for (const mapping of replacementMap) {
        if (lostPaths?.includes(mapping.from)) {
          const disposition = dispositions.find((item) => item.kind === "path" && item.value === mapping.from);
          if (!disposition || disposition.disposition !== "planned_path_replaced") {
            rowErrors.push(`replacementMap lost path lacks planned_path_replaced disposition: ${mapping.from}`);
          }
        } else if (!candidateDescription || !hasExplicitPathReplacement(candidateDescription, mapping.from, mapping.to)) {
          rowErrors.push(`replacementMap entry is extra to the current loss and exact candidate replacement table: ${mapping.from}`);
        }
      }
    }

    const fingerprint = fingerprints.get(issueId);
    if (!fingerprint) {
      rowErrors.push("row is stale: no baseline description is available for the audited issue");
    } else {
      if (fingerprint.lostTokens.length === 0 && fingerprint.lostPaths.length === 0) {
        rowErrors.push("row is stale: the issue has no exact token or path loss");
      }
      if (issue.baselineDescriptionSha256 !== fingerprint.baselineDescriptionSha256) {
        rowErrors.push("baselineDescriptionSha256 does not match the audited issue");
      }
      if (issue.candidateDescriptionSha256 !== fingerprint.candidateDescriptionSha256) {
        rowErrors.push("candidateDescriptionSha256 does not match the audited issue");
      }
      if (lostTokens && JSON.stringify(lostTokens) !== JSON.stringify(fingerprint.lostTokens)) {
        rowErrors.push("lostTokens does not match the exact current loss set");
      }
      if (issue.lostTokensSha256 !== fingerprint.lostTokensSha256) {
        rowErrors.push("lostTokensSha256 does not match the exact current loss-set digest");
      }
      if (lostPaths && JSON.stringify(lostPaths) !== JSON.stringify(fingerprint.lostPaths)) {
        rowErrors.push("lostPaths does not match the exact current loss set");
      }
      if (issue.lostPathsSha256 !== fingerprint.lostPathsSha256) {
        rowErrors.push("lostPathsSha256 does not match the exact current loss-set digest");
      }
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors.map((error) => `${prefix}: ${error}`));
      continue;
    }
    if (duplicateIds.has(issueId)) continue;
    rowsByIssue.set(issueId, {
      authorityEvidence: authorityEvidence as string[],
      baselineDescriptionSha256: issue.baselineDescriptionSha256 as string,
      candidateDescriptionSha256: issue.candidateDescriptionSha256 as string,
      dispositions: dispositions as IntentionalBaselineReplacementDispositionInput[],
      issueId,
      lostPaths: lostPaths as string[],
      lostPathsSha256: issue.lostPathsSha256 as string,
      lostTokens: lostTokens as string[],
      lostTokensSha256: issue.lostTokensSha256 as string,
      rationale: rationale as string,
      replacementMap: replacementMap as IntentionalBaselineReplacementMapInput[],
    });
  }

  if (errors.length > 0) {
    return {
      digestSha256,
      findings: [finding("intentional_baseline_replacement_invalid", canonicalStrings(errors))],
      rowsByIssue: new Map(),
      supplied: true,
    };
  }
  return { digestSha256, findings: [], rowsByIssue, supplied: true };
}

function repeatedContractEvidence(byKey: Map<string, string>): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  for (const key of ["outcome", "behavior", "states", "permissions", "success", "failure", "recovery"]) {
    const body = byKey.get(key) ?? "";
    for (const paragraph of body.split(/\n\s*\n/)) {
      const normalized = paragraph
        .replace(/^```[\s\S]*?```$/g, "")
        .replace(/[`*_#>|-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      if (normalized.length < 120) continue;
      const prior = seen.get(normalized);
      if (prior && prior !== key) duplicates.push(`${prior} repeats in ${key}: ${normalized.slice(0, 120)}`);
      else seen.set(normalized, key);
    }
  }
  return duplicates;
}

function repeatedSourceFragments(byKey: Map<string, string>): string[] {
  const normalize = (value: string) => value
    .replace(/[`*_#>|-]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const candidates = (byKey.get("behavior") ?? "")
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map(normalize)
    .filter((fragment) => fragment.length >= 64 && fragment.length <= 420);
  const otherBodies = REQUIRED_SECTION_KEYS
    .filter((key) => key !== "behavior" && key !== "provenance")
    .map((key) => [key, normalize(byKey.get(key) ?? "")] as const);
  return [...new Set(candidates)].flatMap((fragment) => {
    const repeatedIn = otherBodies.filter(([, body]) => body.includes(fragment)).map(([key]) => key);
    return repeatedIn.length >= 3
      ? [`behavior fragment repeats in ${repeatedIn.join(", ")}: ${fragment.slice(0, 180)}`]
      : [];
  });
}

function meaningfulWords(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !TITLE_SCOPE_STOP_WORDS.has(word)),
  );
}

function manualTitleDelegations(
  issueId: string,
  scanBody: string,
  titlesByIssue: Map<string, string>,
): string[] {
  const lines = scanBody.split(/\r?\n/);
  const evidence: string[] = [];
  for (const [candidateId, candidateTitle] of titlesByIssue) {
    if (candidateId === issueId || candidateTitle.length < 18) continue;
    const escapedTitle = candidateTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const directDelegation = new RegExp(
      `(?:\\b(?:implemented|provided|owned|governed)\\s+(?:in|by)\\s+(?:the\\s+)?${escapedTitle}\\b|` +
      `\\b(?:depends?\\s+on|blocked\\s+by|waits?\\s+for|cannot\\s+start\\s+until|until)\\s+(?:the\\s+)?${escapedTitle}\\b(?:\\s+ships?)?|` +
      `\\b(?:implementation|runtime|production|operational|customer|source|proof)\\s+(?:belongs?\\s+to|is\\s+owned\\s+by)\\s+(?:the\\s+)?${escapedTitle}\\b|` +
      `${escapedTitle}[^.!?\\n|]{0,100}\\b(?:owns?|implements?|provides?|blocks?)\\b)`,
      "i",
    );
    for (const line of lines) {
      if (directDelegation.test(line)) evidence.push(line.trim());
    }
  }
  return [...new Set(evidence)];
}

function isRuntimeGate(update: NormalizedUpdate, description: string): boolean {
  return update.classification === "runtime_gate" ||
    update.source.requirementId?.startsWith("RG:") === true ||
    /^Appendix M\.5\b/i.test(update.source.section ?? "") ||
    /\bis a runtime_active fail-closed gate\b|\bexact fail-closed assertion\b/i.test(description);
}

type DeclaredRuntimePathLane = "product_runtime" | "hybrid" | "static_ci";

function declaredRuntimePathLane(behavior: string): DeclaredRuntimePathLane | null {
  const match = /\bExecute the complete `(product_runtime|hybrid|static_ci)` path set\b/i.exec(behavior);
  return (match?.[1]?.toLowerCase() as DeclaredRuntimePathLane | undefined) ?? null;
}

type ActorFamily = "buyer" | "ops" | "public" | "seller";

const ACTOR_FAMILY_PATTERNS: Record<ActorFamily, RegExp> = {
  buyer: /\bbuyer(?:s|[- ]console|[- ]workspace|\s+workspace|\s+organization|\s+org|\s+actor|\s+member)?\b/i,
  ops: /\b(?:ops(?:_[a-z0-9_]+|[- ]console|\s+role|\s+user|\s+admin|\s+operator|\s+action|\s+authority)?|operator|consultant|staff)\b/i,
  public: /\b(?:public|anonymous|unauthenticated)\b/i,
  seller: /\b(?:seller|vendor)(?:s|[- ]console|[- ]workspace|\s+workspace|\s+organization|\s+org|\s+actor|\s+member)?\b/i,
};

const ACTOR_SUBJECT_PATTERNS: Record<ActorFamily, RegExp> = {
  buyer: /\b(?:buyers?|buyer[- ]console|buyer\s+(?:actor|member|owner|admin|lead|reviewer|caller|user))\b/gi,
  ops: /\b(?:ops(?:[- ]console|\s+(?:actor|role|user|admin|operator|action|authority|staff))?|consultants?|staff\s+members?)\b/gi,
  public: /\b(?:public|anonymous|unauthenticated)\s+(?:actors?|callers?|users?|reporters?|readers?)\b/gi,
  seller: /\b(?:sellers?|vendors?|(?:seller|vendor)[- ]console|(?:seller|vendor)\s+(?:actor|member|owner|admin|lead|reviewer|caller|user))\b/gi,
};

const ACTOR_AUTHORITY_ACTION = /\b(?:(?:may|can|must)\s+(?:(?:only|now)\s+)?(?!not\b|be\b)(?:advance|approve|author|call|clone|configure|create|delete|edit|execute|initiate|invoke|manage|mutate|opt\s+out|publish|recalculate|report|respond|submit|supply|update|use(?!\s+Case\b)|validate|withdraw|write)|advances?|approves?|authors?|calls?|clones?|configures?|creates?|deletes?|edits?|executes?|initiates?|invokes?|manages?|mutates?|opts?\s+out|publishes?|recalculates?|reports?|responds?|submits?|supplies?|updates?|uses?(?!\s+Case\b)|validates?|withdraws?|writes?)\b/i;
const NEGATED_ACTOR_AUTHORITY = /\b(?:cannot|can't|never|no|not|may\s+not|must\s+not|can\s+not)\b/i;

function actorFamilies(value: string): Set<ActorFamily> {
  return new Set(
    (Object.entries(ACTOR_FAMILY_PATTERNS) as Array<[ActorFamily, RegExp]>)
      .filter(([, pattern]) => pattern.test(value))
      .map(([family]) => family),
  );
}

function actorSubjectFamilies(value: string): Set<ActorFamily> {
  const subjects = new Set<ActorFamily>();
  for (const clause of value.split(/[.;:\n]+/)) {
    for (const [family, pattern] of Object.entries(ACTOR_SUBJECT_PATTERNS) as Array<[ActorFamily, RegExp]>) {
      pattern.lastIndex = 0;
      for (const match of clause.matchAll(pattern)) {
        const preceding = clause.slice(Math.max(0, (match.index ?? 0) - 96), match.index ?? 0);
        if (/\b(?:neither|no)\s+(?:authenticated\s+)?$/i.test(preceding) || /\b(?:after|if|once|when)\s+(?:an?\s+)?$/i.test(preceding)) continue;
        if (/\b(?:deny|denied|denies|forbid|forbidden|reject|rejected|rejects)\b[^,;.!?]{0,80}$/i.test(preceding)) continue;
        const following = clause.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 72);
        const actionMatch = ACTOR_AUTHORITY_ACTION.exec(following);
        if (!actionMatch || (actionMatch.index ?? 0) > 24) continue;
        if (NEGATED_ACTOR_AUTHORITY.test(following.slice(0, (actionMatch.index ?? 0) + actionMatch[0].length))) continue;
        if (/\breturn(?:s|ed)?\s+(?:HTTP\s+)?4\d{2}\b/i.test(following.slice(actionMatch.index ?? 0))) continue;
        const gap = following.slice(0, actionMatch.index ?? 0);
        if (actorFamilies(gap).size > 0) continue;
        if (gap.trim() && !/^(?:\s|[-/]|\b(?:an?|and|authenticated|authorized|console|org|organization|owner|role|team|the|workspace)\b)*$/i.test(gap)) continue;
        subjects.add(family);
      }
    }
  }
  return subjects;
}

function promisedSurfaceFamilies(outcome: string, behavior: string): Set<ActorFamily> {
  const families = new Set<ActorFamily>();
  const add = (family: ActorFamily): void => { families.add(family); };
  const outcomeClauses = outcome.split(/(?<=[.!?])\s+|\r?\n/);
  const positiveBehaviorClauses = behavior.split(/(?<=[.!?])\s+|\r?\n/).filter((clause) =>
    !/\b(?:must not|cannot|may not|deny|denied|reject|rejected|forbidden|return(?:s)?\s+(?:HTTP\s+)?404|never)\b/i.test(clause)
  );
  const surfacePromise = /\b(?:available|display(?:s|ed)?|expos(?:e|es|ed)|publish(?:es|ed)?|render(?:s|ed)?|serv(?:e|es|ed)|show(?:s|ed)?|surfac(?:e|es|ed)|use(?:s|d)?|visible)\b/i;

  for (const clause of outcomeClauses) {
    if (/\bfounder dashboard\b|\bOps(?:[- ]Console|\s+dashboard)\b/i.test(clause)) add("ops");
    if (/\bBuyer(?:[- ]Console|\s+(?:Console|Workspace))?\b[^.!?]{0,80}\b(?:dashboard|form|journey|panel|portal|surface|workflow)\b/i.test(clause)) add("buyer");
    if (/\b(?:Seller|Vendor)(?:[- ]Console|\s+(?:Console|Workspace))?\b[^.!?]{0,80}\b(?:dashboard|form|journey|panel|portal|surface|workflow)\b/i.test(clause)) add("seller");
    if (/\bVendor Opt-Out\b/i.test(clause)) add("seller");
    if (/\bconsultant-assisted\b/i.test(clause)) add("ops");
    if (/\bpublic (?:Vendor )?Marketplace\b/i.test(clause) && (surfacePromise.test(clause) || actorSubjectFamilies(clause).size > 0)) add("public");
  }

  for (const clause of positiveBehaviorClauses) {
    if (/\bfounder dashboard\b/i.test(clause)) add("ops");
    if (/\bOps[- ]Console\b/i.test(clause) && surfacePromise.test(clause)) add("ops");
    if (/\bBuyer[- ]Console\b/i.test(clause) && surfacePromise.test(clause)) add("buyer");
    if (/\bSeller[- ]Console\b/i.test(clause) && surfacePromise.test(clause)) add("seller");
    if (/\bpublic (?:Vendor )?Marketplace\b/i.test(clause) && actorSubjectFamilies(clause).has("public")) add("public");
  }
  return families;
}

function authorityScopeProblems(outcome: string, behavior: string, permissions: string): string[] {
  if (!permissions.trim()) return [];
  const verificationOnlyOutcome = /\b(?:census|coverage checker|oracle|route manifest|test matrix|verification gate)\b/i.test(outcome);
  const positiveBehavior = behavior.split(/\r?\n/).filter((line) =>
    actorSubjectFamilies(line).size > 0 &&
    !/\b(?:must not|cannot|may not|deny|denied|reject|rejected)\b/i.test(line)
  ).join("\n");
  const expected = actorSubjectFamilies(`${outcome}\n${verificationOnlyOutcome ? "" : positiveBehavior}`);
  for (const family of promisedSurfaceFamilies(outcome, verificationOnlyOutcome ? "" : behavior)) expected.add(family);
  const restrictiveClauses = permissions.split(/(?<=[.!?])\s+|\r?\n/).filter((line) =>
    /\bonly\b[^.\n]{0,220}\b(?:may|can|execute|read|write|supply|invoke)\b/i.test(line)
  );
  const allowed = actorFamilies(restrictiveClauses.join("\n"));
  const permissionActors = actorFamilies(permissions);
  const problems: string[] = [];

  if (restrictiveClauses.length > 0 && allowed.size > 0) {
    const missing = [...expected].filter((family) => !allowed.has(family));
    if (missing.length > 0 && (expected.size > 1 || missing.includes("ops") || missing.includes("public"))) {
      problems.push(`outcome actors ${[...expected].sort().join(", ")} conflict with only-authority ${[...allowed].sort().join(", ")}`);
    }
    if (expected.size === 1 && expected.has("seller") && allowed.has("buyer") && !allowed.has("seller")) {
      problems.push("seller or vendor outcome is restricted to Buyer authority");
    }
    if (expected.size === 1 && expected.has("buyer") && allowed.has("seller") && !allowed.has("buyer")) {
      problems.push("Buyer outcome is restricted to Seller authority");
    }
  }

  if (expected.size === 1 && expected.has("ops")) {
    const conflictingExecution = restrictiveClauses.find((clause) => {
      const clauseActors = actorFamilies(clause);
      return !clauseActors.has("ops") &&
        (clauseActors.has("buyer") || clauseActors.has("seller")) &&
        /\b(?:create|delete|edit|execute|invoke|mutat(?:e|es|ion)|perform|publish|set|submit|update|write)\b/i.test(clause);
    });
    if (conflictingExecution) {
      problems.push(`Ops or founder outcome grants exclusive execution to ${[...actorFamilies(conflictingExecution)].sort().join(", ")} authority`);
    }
  }

  if (expected.has("ops") && !permissionActors.has("ops") && /\bonly\s+(?:an?\s+)?authorized organization-scoped caller\b/i.test(permissions)) {
    problems.push("Ops or consultant outcome has only generic organization-scoped authority");
  }
  return canonicalStrings(problems);
}

interface EnumerationPromise {
  count: number | null;
  evidence: string;
  kind: string | null;
}

function enumerationNumber(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);
  return NUMBER_WORDS[value.toLowerCase()] ?? null;
}

const ENUMERATION_NUMBER_PATTERN = "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)";
const ENUMERATION_KIND_PATTERN = "(?:sections?|steps?|stages?|surfaces?|events?|webhooks?|operations?|effects?|categories?|variants?|tools?|roles?|states?|fields?|routes?|endpoints?)";

function enumerationMatchIsCardinality(value: string, match: RegExpExecArray): boolean {
  const prefix = value.slice(Math.max(0, match.index - 100), match.index);
  const suffix = value.slice(match.index + match[0].length, match.index + match[0].length + 140);
  if (/\d\s*[–—-]\s*$/.test(prefix)) return true;
  if (/(?:[≥≤<>]=?\s*|\b(?:threshold(?:\s+of)?|minimum(?:\s+of)?|maximum(?:\s+of)?|at\s+least|at\s+most|more\s+than|fewer\s+than|no\s+more\s+than|only\s+after)\s*)$/i.test(prefix)) {
    return true;
  }
  if (/^\s+(?:per\b|within\b|during\b|over\b|in\s+(?:a\s+|the\s+)?(?:rolling\s+)?\d)/i.test(suffix)) {
    return true;
  }
  if (
    /[–—]\s*$/.test(prefix) &&
    /^\s*[A-Z][A-Za-z0-9-]*(?:\s+[A-Z][A-Za-z0-9-]*){0,5}\s+(?:may\s+(?:cite|reference)|as\s+(?:a\s+)?cited|is\s+(?:a\s+)?cited|remains\s+(?:a\s+)?cited)\b/.test(suffix)
  ) {
    return true;
  }
  return false;
}

function enumerationPromise(outcome: string): EnumerationPromise | null {
  const searchable = outcome
    .replace(/`[^`\n]*`/g, " ")
    .replace(/https?:\/\/[^\s)]+/gi, " ");
  const explicitPatterns = [
    new RegExp(`\\b(${ENUMERATION_NUMBER_PATTERN})[- ](${ENUMERATION_KIND_PATTERN})\\b`, "gi"),
    new RegExp(`\\b(?:complete|closed|exact|full)\\s+(${ENUMERATION_NUMBER_PATTERN})\\s+(${ENUMERATION_KIND_PATTERN})\\b`, "gi"),
  ];
  for (const pattern of explicitPatterns) {
    for (const match of searchable.matchAll(pattern)) {
      if (enumerationMatchIsCardinality(searchable, match)) continue;
      return {
        count: enumerationNumber(match[1]),
        evidence: match[0],
        kind: match[2].toLowerCase(),
      };
    }
  }
  const structural = /\b(?:operation-by-operation|per[- ]tool|per[- ]role|complete\s+(?:catalog|matrix|allowlist)|(?:catalog|matrix|allowlist)\s+of\s+(?:all|every))\b/i.exec(searchable);
  return structural ? { count: null, evidence: structural[0], kind: null } : null;
}

function enumerationCountForms(count: number): string {
  const words = Object.entries(NUMBER_WORDS)
    .filter(([, value]) => value === count)
    .map(([word]) => word);
  return [String(count), ...words].join("|");
}

function inlineEnumerationCount(value: string, promise: EnumerationPromise): number {
  if (promise.count === null || !promise.kind) return 0;
  const countForms = enumerationCountForms(promise.count);
  const promisePattern = new RegExp(
    `\\b(?:${countForms})[- ]${ENUMERATION_KIND_PATTERN}\\b`,
    "i",
  );
  let observed = 0;
  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
    if (!promisePattern.test(line)) continue;
    const arrows = line.match(/(?:→|->)/g)?.length ?? 0;
    if (arrows > 0) observed = Math.max(observed, arrows + 1);

    const list = new RegExp(
      `\\b(?:${countForms})[- ]${ENUMERATION_KIND_PATTERN}\\b[^.!?\\n]{0,120}?\\b(?:are|include|includes|comprise|comprises|consist\\s+of|consists\\s+of)\\s+([^.!?\\n]+)`,
      "i",
    ).exec(line)?.[1];
    if (!list) continue;
    const entries = list
      .split(/\s*,\s*|\s+and\s+/i)
      .map((entry) => entry.replace(/^[\s:;-]+|[\s:;-]+$/g, "").trim().toLowerCase())
      .filter(Boolean);
    observed = Math.max(observed, new Set(entries).size);
  }
  return observed;
}

function markdownTableDataRows(value: string): number {
  const lines = value.split(/\r?\n/);
  let count = 0;
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*\|.+\|\s*$/.test(lines[index])) continue;
    if (/^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index])) continue;
    if (index + 1 < lines.length && /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1])) continue;
    count += 1;
  }
  return count;
}

function enumeratedContractProblems(outcome: string, behavior: string): string[] {
  const promise = enumerationPromise(outcome);
  if (!promise) return [];
  const numbered = behavior.split(/\r?\n/).flatMap((line) => {
    const match = /^\s*(\d+)[.)]\s+\S/.exec(line);
    return match ? [Number(match[1])] : [];
  });
  const bullets = behavior.split(/\r?\n/).filter((line) => /^\s*[-*+]\s+\S/.test(line)).length;
  const tableRows = markdownTableDataRows(behavior);
  const inline = inlineEnumerationCount(`${outcome}\n${behavior}`, promise);
  const observed = Math.max(new Set(numbered).size, bullets, tableRows, inline);
  if (promise.count !== null && observed < promise.count) {
    return [`${promise.evidence} promises ${promise.count} entries but only ${observed} are enumerated`];
  }
  if (promise.count === null && tableRows < 2 && new Set(numbered).size < 2 && bullets < 4) {
    return [`${promise.evidence} promises a catalog or matrix without enumerated rows`];
  }
  return [];
}

function sectionStructureProblems(description: string, sections: MarkdownSection[], behavior: string): string[] {
  const problems: string[] = [];
  const semanticSections = sections.filter((section) => section.key !== null);
  const duplicateKeys = semanticSections
    .map((section) => section.key as string)
    .filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) problems.push(`duplicate semantic sections: ${canonicalStrings(duplicateKeys).join(", ")}`);

  const lines = description.split(/\r?\n/);
  const headings = lines.flatMap((line, index) => {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    return match ? [{ index, level: match[1].length, title: match[2] }] : [];
  });
  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    if (next && next.level <= current.level && lines.slice(current.index + 1, next.index).every((line) => !line.trim())) {
      problems.push(`empty heading: ${current.title}`);
    }
  }

  const orphanNumber = lines.find((line) => /^\s*\d+[.)]\s*$/.test(line));
  if (orphanNumber) problems.push(`orphan numbered item: ${orphanNumber.trim()}`);
  const emptyLabel = lines.find((line, index) =>
    /^\s*\*\*[^*\n]{2,100}:\*\*\s*$/.test(line) &&
    (lines.slice(index + 1).find((candidate) => candidate.trim())?.match(/^#{1,6}\s+/) ?? false)
  );
  if (emptyLabel) problems.push(`empty labeled subsection: ${emptyLabel.trim()}`);

  const numbered = behavior.split(/\r?\n/).flatMap((line) => {
    const match = /^\s*(\d+)[.)]\s+\S/.exec(line);
    return match ? [Number(match[1])] : [];
  });
  if (numbered.length >= 3 && new Set(numbered).size === numbered.length) {
    const expected = Array.from({ length: Math.max(...numbered) }, (_, index) => index + 1);
    if (JSON.stringify(numbered) !== JSON.stringify(expected)) {
      problems.push(`numbered sequence is incomplete or out of order: ${numbered.join(", ")}`);
    }
  }
  return canonicalStrings(problems);
}

function issueAudit(update: NormalizedUpdate, options: SemanticAuditContext): SemanticIssueAudit {
  const flags: SemanticFinding[] = [];
  const sections = markdownSections(update.description);
  const byKey = new Map<string, string>();
  for (const section of sections) {
    if (section.key && !byKey.has(section.key)) byKey.set(section.key, section.body);
  }
  const scanBody = outsideProvenance(sections, update.description);
  const outcome = byKey.get("outcome") ?? "";
  const behavior = byKey.get("behavior") ?? "";
  const telemetry = byKey.get("telemetry") ?? "";
  const runtimeGate = isRuntimeGate(update, update.description);

  const missingOrEmpty = REQUIRED_SECTION_KEYS.filter((key) => !(byKey.get(key) ?? "").trim());
  if (missingOrEmpty.length > 0) {
    flags.push(finding("empty_required_section", missingOrEmpty));
  }
  const structureProblems = sectionStructureProblems(update.description, sections, behavior);
  if (structureProblems.length > 0) {
    flags.push(finding("invalid_section_structure", structureProblems));
  }
  const enumerationProblems = enumeratedContractProblems(outcome, behavior);
  if (enumerationProblems.length > 0) {
    flags.push(finding("enumerated_contract_missing_catalog", enumerationProblems));
  }

  if (
    !outcome ||
    GENERIC_OUTCOME.test(outcome) ||
    outcome.trim().toLowerCase() === update.title.trim().toLowerCase() ||
    outcome.trim().length < 32
  ) {
    flags.push(finding("generic_outcome", outcome || "Outcome is missing"));
  }

  const titleScopeWords = meaningfulWords(update.title);
  const outcomeScopeWords = meaningfulWords(outcome);
  const titleScopeOverlap = [...titleScopeWords].filter((word) => outcomeScopeWords.has(word));
  if (
    !runtimeGate &&
    outcome.trim().length > 0 &&
    outcome.trim().length < 180 &&
    titleScopeWords.size >= 2 &&
    titleScopeOverlap.length === 0
  ) {
    flags.push(finding("outcome_scope_mismatch", [update.title, outcome]));
  }

  const normalizedBehavior = behavior
    .replace(/[`*_#>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!runtimeGate && normalizedBehavior.length > 0 && normalizedBehavior.length < 180) {
    flags.push(finding("underspecified_behavior_contract", behavior));
  }

  const genericSections = GENERIC_SUPPORTING_PATTERNS.flatMap(([key, pattern]) =>
    pattern.test(byKey.get(key) ?? "") ? [key] : []
  );
  if (genericSections.length > 0) {
    flags.push(finding("generic_supporting_contract", genericSections));
  }

  const failureContract = byKey.get("failure") ?? "";
  const executableFailure = /(?:\bHTTP\s+\d{3}\b|`[a-z][a-z0-9_.:-]{3,}`|\b(?:reject|deny|forbid|fail(?:s|ed)? closed|block(?:s|ed)?|return(?:s|ed)?|timeout|conflict|unauthoriz|invalid|stale|duplicate)\b|\bwrong[- ](?:organization|org|tenant|workspace|console|role|state|schema|signature|identity)\b|\bmissing\s+(?:authority|permission|signature|identity|schema|field|receipt|proof|dependency)\b|\b(?:zero|no)\s+(?:write|mutation|side effect|dispatch|delivery|partial state)\b)/i;
  if (failureContract.trim().length < 180 && !executableFailure.test(failureContract)) {
    flags.push(finding("failure_contract_not_executable", failureContract || "Failure contract is missing"));
  }

  const permissionContract = byKey.get("permissions") ?? "";
  const permissionActor = /\b(?:role|owner|admin|lead|reviewer|viewer|member|caller|actor|public|anonymous|buyer|seller|ops|service|system|permission|console|tenant|organization|org|workspace)\b/i;
  const permissionBoundary = /\b(?:only\s+[^.]{0,100}\s+may|may\s+[^.]{0,60}\s+only|may only|limited to|system-only|cannot|must not|no actor|never|deny|denied|forbid|forbidden|reject|non-reveal|existence-safe|no access|wrong-(?:org|console)|cross-(?:org|workspace|console)|scoped|isolation|privacy|retention|redact|exclude)\b|\b(?:HTTP\s+)?4\d{2}\b/i;
  const permissionAuthorization = /\b(?:only\s+[^.]{0,120}\s+may|restricted to\s+[^.]{0,120}|authorized\s+(?:caller|actor|role|service|system|owner|admin|lead|reviewer|buyer|seller)|(?:caller|actor|role|service|system|owner|admin|lead|reviewer|buyer|seller)s?\s+(?:may|can|cannot|must not)|(?:every|all)\s+(?:calls?|requests?|operations?)\s+(?:requires?|uses?)[^.]{0,220}\b(?:role|owner|admin|agent|opssession|capability|tenant|step-up)|(?:GET|PATCH|DELETE|read|write|mutation)[^.]{0,120}\brequires?\b[^.]{0,120}\b(?:role|membership|owner|admin|agent|opssession|capability|step-up)|(?:(?:buyer|seller)(?:-console)?|third-party\s+(?:org|organization|actor)|public|anonymous)[^.]{0,100}\b(?:must\s+(?:return|get|receive)|must not\s+(?:expose|read|write|access|discover))|unauthoriz|wrong-(?:organization|org|workspace|console)|cross-(?:organization|org|workspace|console)|deny\s+[^.]{0,80}(?:caller|actor|role|request)|no\s+(?:customer|buyer|seller|member|viewer|reviewer|actor)\s+(?:may|can))\b/i;
  if (
    permissionContract.trim() &&
    (!permissionActor.test(permissionContract) ||
      !permissionBoundary.test(permissionContract) ||
      !permissionAuthorization.test(permissionContract))
  ) {
    flags.push(finding("permissions_contract_not_executable", permissionContract));
  }
  const authorityProblems = authorityScopeProblems(outcome, behavior, permissionContract);
  if (authorityProblems.length > 0) {
    flags.push(finding("authority_scope_contradiction", authorityProblems));
  }

  if (
    /bounded denial defined in Complete behavior and rules/i.test(update.description) &&
    !executableFailure.test(behavior)
  ) {
    flags.push(finding("unresolved_bounded_denial", behavior || "Complete behavior and rules is empty"));
  }

  const recoveryContract = byKey.get("recovery") ?? "";
  if (
    recoveryContract.trim() &&
    !/\b(?:retr(?:y|ies)|replay(?:s|ed|ing)?|restor(?:e|es|ed|ing)|reconcil(?:e|es|ed|ing)|resum(?:e|es|ed|ing)|repair(?:s|ed|ing)?|correct(?:s|ed|ing)?|quarantin(?:e|es|ed|ing)|backfill(?:s|ed|ing)?|roll\s*back|rollback|rebuild(?:s|ing)?|redrive(?:s|n)?|compensat(?:e|es|ed|ing|ion)|invalidat(?:e|es|ed|ing)|rerun(?:s|ning)?|re-run|recover(?:s|ed|ing|y)|purg(?:e|es|ed|ing)|reissu(?:e|es|ed|ing)|revert(?:s|ed|ing)?|revers(?:e|es|ed|ing|al))\b/i.test(recoveryContract)
  ) {
    flags.push(finding("recovery_contract_not_executable", recoveryContract));
  }

  const reviewContract = byKey.get("review") ?? "";
  const normalizedReview = reviewContract.replace(/[`*_#>|-]/g, " ").replace(/\s+/g, " ").trim();
  if (normalizedReview.length > 0 && normalizedReview.length < 160) {
    flags.push(finding("review_contract_not_executable", reviewContract));
  }

  const malformedReference = scanBody.split(/\r?\n/).find((line) => MALFORMED_REFERENCE_REMNANT.test(line));
  if (malformedReference) {
    flags.push(finding("malformed_reference_remnant", malformedReference));
  }
  const proseOnlyScanBody = scanBody
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "code_token");
  const malformedStripped = proseOnlyScanBody.split(/\r?\n/).find((line) =>
    MALFORMED_STRIPPED_FRAGMENT_PATTERNS.some((pattern) => pattern.test(line))
  );
  if (malformedStripped) {
    flags.push(finding("malformed_stripped_fragment", malformedStripped));
  }

  const concreteNamedProof = extractedPaths(byKey.get("proof") ?? "").some((path) =>
    PRODUCTION_RECEIPT_PATH.test(path) && isExactImplementationPath(path)
  );
  const unresolvedPlaceholder = scanBody.split(/\r?\n/).find((line) => {
    const candidate = concreteNamedProof
      ? line.replace(/\bthe named (?:runtime )?proof\b/gi, "")
      : line;
    return hasUnresolvedContractPlaceholder(candidate);
  });
  if (unresolvedPlaceholder) {
    flags.push(finding("unresolved_contract_placeholder", unresolvedPlaceholder));
  }

  const providerControls = [
    byKey.get("recovery") ?? "",
    byKey.get("rollout") ?? "",
    byKey.get("rollback") ?? "",
  ].join("\n");
  const providerEvidence = [outcome, behavior, byKey.get("states") ?? "", byKey.get("success") ?? ""].join("\n");
  if (
    /\bprovider\s+(?:dispatch|credentials?|signature|receipt|sandbox|adapter|traffic|callback|readback)\b/i.test(providerControls) &&
    !/\b(?:provider|stripe|workos|loops(?:\.so)?|slack|anthropic|perplexity|firecrawl|resend|twilio|salesforce|hubspot|dynamics|pipedrive|external api|third-party)\b/i.test(providerEvidence)
  ) {
    flags.push(finding("provider_boundary_invented", providerControls.split(/\r?\n/).filter((line) => /\bprovider\b/i.test(line))));
  }

  const deferral = SOURCE_DEFERRAL_PATTERNS.find((pattern) => pattern.test(scanBody));
  const unresolvedLookup = unresolvedSectionLookup(scanBody);
  if (deferral || unresolvedLookup) {
    const evidence = unresolvedLookup ??
      scanBody.split(/\r?\n/).find((line) => deferral?.test(line)) ??
      deferral?.source ??
      "unresolved section lookup";
    flags.push(finding("source_delegation_outside_provenance", evidence));
  }

  const clipped = update.description.split(/\r?\n/).flatMap((line, index) => {
    const clause = normalizedClause(line);
    return [...clause].length === IMPORT_CAP && /[\p{L}\p{N}_-]$/u.test(clause)
      ? [`line ${index + 1}: ${clause.slice(-80)}`]
      : [];
  });
  const fenceCount = (update.description.match(/^```/gm) ?? []).length;
  const unbalancedInlineCode = update.description.split(/\r?\n/).flatMap((line, index) =>
    !/^```/.test(line) && ((line.match(/`/g) ?? []).length % 2 !== 0)
      ? [`line ${index + 1}: unbalanced inline code`]
      : []
  );
  if (clipped.length > 0 || fenceCount % 2 !== 0 || unbalancedInlineCode.length > 0) {
    flags.push(finding("likely_mid_sentence_clipping", [
      ...clipped,
      ...(fenceCount % 2 !== 0 ? ["unbalanced code fence"] : []),
      ...unbalancedInlineCode,
    ]));
  }

  const manualReferences = [
    ...(update.title.match(ISSUE_ID) ?? []),
    ...(scanBody.match(ISSUE_ID) ?? []),
    ...(scanBody.match(SOURCE_ID) ?? []),
    ...(scanBody.match(OTHER_SOURCE_ID) ?? []),
    ...(scanBody.match(DEFECT_OR_DECISION_ID) ?? []),
    ...(scanBody.match(ASSUMPTION_ID) ?? []),
    ...(scanBody.match(LOCAL_ASSUMPTION_ID) ?? []),
    ...(LINEAR_URL.test(scanBody) ? ["Linear URL"] : []),
    ...extractedPaths(scanBody).filter((path) => LEGACY_ARTIFACT_PATH_ID.test(path)),
  ];
  if (/^\s*\[[^\]]+\]\s*/.test(update.title) || manualReferences.length > 0) {
    flags.push(finding("manual_issue_or_source_id", manualReferences.length > 0 ? manualReferences : update.title));
  }

  if (STALE_OR_RETIRED_TITLE.test(update.title)) {
    flags.push(finding("stale_or_retired_title", update.title));
  }
  if (/§\s*[A-Z0-9]/i.test(update.title)) {
    flags.push(finding("manual_source_reference_in_title", update.title));
  }

  const historyPattern = PLANNING_HISTORY_PATTERNS.find((pattern) => pattern.test(`${update.title}\n${scanBody}`));
  if (historyPattern) {
    const evidence = `${update.title}\n${scanBody}`.split(/\r?\n/).find((line) => historyPattern.test(line)) ?? historyPattern.source;
    flags.push(finding("planning_or_version_history", evidence));
  }
  const historyScanBody = sections
    .filter((section) => section.key !== "paths" && section.key !== "provenance")
    .map((section) => section.body)
    .join("\n");
  const activeSourceRemediation = SOURCE_ONLY_CONTRACT.test(update.description) ||
    /\b(?:remove|repair|retire|replace)\b[^.\n]{0,120}\b(?:canonical source|source reference|retired (?:admin )?section|source contract)\b/i.test(`${update.title}\n${outcome}`);
  const sourceHistoryPattern = !activeSourceRemediation
    ? SOURCE_HISTORY_CONTROL_PLANE_PATTERNS.find((pattern) => pattern.test(historyScanBody))
    : undefined;
  const sourceHistoryEvidence = sourceHistoryPattern
    ? historyScanBody.split(/\r?\n/).find((line) => sourceHistoryPattern.test(line))
    : undefined;
  const controlPlaneEvidence = update.classification !== "delivery_parent"
    ? historyScanBody.split(/\r?\n/).find((line) => LINEAR_CONTROL_PLANE_EXECUTION.test(line))
    : undefined;
  if (sourceHistoryEvidence || controlPlaneEvidence) {
    flags.push(finding(
      "source_history_or_control_plane_prose",
      [sourceHistoryEvidence, controlPlaneEvidence].filter((value): value is string => Boolean(value)),
    ));
  }

  const nativeLines = update.description.split(/\r?\n/).filter((line) => NATIVE_FIELD.test(line));
  if (/\bcodex-ready\b|\bunestimated\b|\bnative (?:owners?|reviewers?|estimates?|blockers?|dependencies)\b/i.test(scanBody)) {
    nativeLines.push("copied readiness or native planning metadata");
  }
  if (nativeLines.length > 0) flags.push(finding("copied_native_linear_metadata", nativeLines));
  const relationLines = update.description.split(/\r?\n/).filter((line) =>
    NATIVE_RELATION.test(line) || NATIVE_RELATION_HEADING.test(line) || MANUAL_RELATION_PROSE.test(line)
  );
  if (relationLines.length > 0) flags.push(finding("manual_cross_issue_relation_prose", relationLines));

  const repeated = repeatedContractEvidence(byKey);
  if (repeated.length > 0) flags.push(finding("repeated_contract_text", repeated));
  const repeatedFragments = repeatedSourceFragments(byKey);
  if (repeatedFragments.length > 0) {
    flags.push(finding("repeated_source_fragment", repeatedFragments));
  }

  const titleDelegations = manualTitleDelegations(
    update.issueId,
    scanBody,
    options.baselineTitlesByIssue,
  );
  if (titleDelegations.length > 0) {
    flags.push(finding("manual_issue_title_reference", titleDelegations));
  }

  const baseline = options.baselineByIssue.get(update.issueId);
  const baselineContractTokens = baseline?.description
    ? preservationTokens(baselineContractBody(baseline.description))
    : new Set<string>();
  const baselineLoss = options.baselineLossByIssue.get(update.issueId) ?? null;
  const intentionalReplacement = options.intentionalReplacementByIssue.get(update.issueId) ?? null;
  if (baselineLoss) {
    if (baselineLoss.substantiveTokenLoss && !intentionalReplacement) {
      flags.push(finding("substantive_contract_token_loss", [
        `lost ${baselineLoss.lostTokens.length} of ${baselineContractTokens.size} exact contract tokens`,
        ...baselineLoss.lostTokens,
      ]));
    }
    if (baselineLoss.substantivePathLoss && !intentionalReplacement) {
      flags.push(finding("substantive_exact_path_loss", baselineLoss.lostPaths));
    }
  }

  const exactPaths = new Set(extractedPaths(byKey.get("paths") ?? ""));
  const proofContract = byKey.get("proof") ?? "";
  const proofPaths = extractedPaths(proofContract);
  if (proofContract.trim() && proofPaths.length === 0) {
    flags.push(finding("named_proof_has_no_path", proofContract));
  }
  const missingProofPaths = proofPaths.filter((path) => !exactPaths.has(path));
  if (missingProofPaths.length > 0) {
    flags.push(finding("named_proof_path_missing_from_exact_paths", missingProofPaths));
  }

  const sourceOnly = SOURCE_ONLY_CONTRACT.test(update.description);
  const productImplementationPaths = [...exactPaths].filter((path) => PRODUCT_IMPLEMENTATION_PATH.test(path));
  const crossSurfaceTestPaths = [...exactPaths].filter((path) => /^tests\/(?:unit|integration|e2e|accessibility|chaos)\//.test(path));
  const runtimeTestPaths = [...exactPaths].filter((path) => EXECUTABLE_TEST_PATH.test(path));
  const productionReceipt = proofPaths.some((path) => PRODUCTION_RECEIPT_PATH.test(path)) &&
    /\bcommit\b/i.test(proofContract) &&
    /\b(?:production|deployment|environment)\b/i.test(proofContract) &&
    /\b(?:receipt|observed result|canary result)\b/i.test(proofContract);
  const referenceDataOrchestrationPaths = productionReceipt &&
    [...exactPaths].some((path) => REFERENCE_DATA_ORCHESTRATION_TEST_PATH.test(path))
    ? [...exactPaths].filter((path) => REFERENCE_DATA_ORCHESTRATION_PATH.test(path))
    : [];
  const runtimeImplementationPaths = [...productImplementationPaths, ...referenceDataOrchestrationPaths];
  const crossSurfaceEvidence = `${update.title}\n${outcome}`.split(/\r?\n/).find((line) =>
    /\b(?:all|every|complete|across)\s+(?:\d+\s+)?(?:public\s+)?(?:surfaces?|routes?|endpoints?|webhooks?|forms?|dashboards?|channels?)\b/i.test(line) ||
    /\b(?:\d+|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen)[- ](?:surface|route|endpoint|webhook|form|dashboard|channel)s?\b/i.test(line) ||
    (actorFamilies(line).size >= 3 && /\b(?:forms?|surfaces?|consoles?|journey|workflow)\b/i.test(line))
  );
  const boundedRepresentativeProof = /\brepresentative synthetic (?:handler|route|probe)s?\b[\s\S]{0,240}\bnot every (?:product )?(?:route|surface|endpoint)\b/i.test(`${outcome}\n${behavior}`);
  if (
    update.classification === "feature" &&
    !sourceOnly &&
    !boundedRepresentativeProof &&
    crossSurfaceEvidence &&
    productImplementationPaths.length <= 1 &&
    crossSurfaceTestPaths.length <= 1
  ) {
    flags.push(finding("cross_surface_single_path_proof", [
      crossSurfaceEvidence,
      `product implementation paths: ${productImplementationPaths.length}; product test paths: ${crossSurfaceTestPaths.length}`,
    ]));
  }

  const runtimeClaimEvidence = [
    outcome,
    behavior,
    byKey.get("states") ?? "",
    byKey.get("success") ?? "",
    byKey.get("failure") ?? "",
  ].join("\n");
  if (
    update.classification === "feature" &&
    RUNTIME_PRODUCT_CLAIM.test(runtimeClaimEvidence) &&
    !sourceOnly &&
    runtimeImplementationPaths.length === 0
  ) {
    flags.push(finding(
      "runtime_outcome_has_spec_only_proof",
      [...exactPaths].length > 0 ? [...exactPaths] : "no product implementation path",
    ));
  }
  const markdownSpecFixtures = [...exactPaths].filter((path) => /^tools\/spec-lint\/fixtures\/.+\.md$/i.test(path));
  if (
    runtimeGate &&
    !sourceOnly &&
    (RUNTIME_PRODUCT_CLAIM.test(runtimeClaimEvidence) || PRODUCT_RUNTIME_ASSERTION.test(runtimeClaimEvidence)) &&
    markdownSpecFixtures.length > 0 &&
    runtimeImplementationPaths.length === 0 &&
    runtimeTestPaths.length === 0
  ) {
    flags.push(finding("runtime_behavior_spec_fixture_only", [
      ...markdownSpecFixtures,
      "runtime assertion has no product implementation or runtime-test path",
    ]));
  }

  const uiEvidence = [update.title, outcome, behavior, byKey.get("states") ?? "", byKey.get("success") ?? ""].join("\n");
  const uiSignals = [
    "render", "screen", "layout", "dashboard", "modal", "drawer", "breadcrumb", "button",
    "keyboard", "focus", "screen-reader", "responsive", "reduced-motion", "visual state", "aria", "contrast", "reflow",
  ].filter((term) => new RegExp(`\\b${term.replace("-", "[- ]")}\\b`, "i").test(uiEvidence));
  const strongUiTitle = /\b(?:page|screen|layout|dashboard|modal|drawer|form|view|UI)\b/i.test(update.title);
  const internalCatalog = /\b(?:performance targets?|pattern-to-feature mapping)\b/i.test(`${update.title}\n${outcome}`);
  const explicitUiDelivery = /\b(?:build|deliver|display|implement|open|render|show)\b[^.\n]{0,120}\b(?:page|screen|dashboard|modal|drawer|form|view|UI)\b/i.test(`${outcome}\n${behavior}`) ||
    /\b(?:page|screen|dashboard|modal|drawer|form|view|UI)\b[^.\n]{0,120}\b(?:display|open|render|show)s?\b/i.test(`${outcome}\n${behavior}`);
  const concreteUiScope = (!internalCatalog || explicitUiDelivery) &&
    (uiSignals.length >= 2 || (strongUiTitle && uiSignals.length >= 1));
  if (update.classification === "feature" && concreteUiScope) {
    const uiImplementation = [...exactPaths].some((path) => /\.(?:tsx|jsx|css|scss)$/.test(path));
    const uiTest = [...exactPaths].some((path) => /^(?:tests\/(?:ui|e2e|accessibility)|.*\/(?:e2e|accessibility)\/).+\.(?:ts|tsx|js)$/.test(path));
    if (!uiImplementation || !uiTest) {
      flags.push(finding("ui_scope_missing_exact_paths", [
        ...(!uiImplementation ? ["missing UI implementation path"] : []),
        ...(!uiTest ? ["missing UI, E2E, or accessibility test path"] : []),
      ]));
    }
  }

  const typedNonEventIdentifierContext = /\bMCP Tool\b|\bcapabilit(?:y|ies)\b|\b(?:field|configuration|configurability|definition)\b|\b(?:error|retry)(?: code| class| identifier| policy| schedule)?\b/i.test(update.title);
  const positiveEvents = eventTokens(
    [behavior, byKey.get("states") ?? "", byKey.get("success") ?? "", byKey.get("failure") ?? ""].join("\n"),
    true,
    typedNonEventIdentifierContext,
  );
  const telemetryEvents = eventTokens(telemetry, false, typedNonEventIdentifierContext);
  const registeredTelemetry = /\b(?:registered|canonical registry|registry path|Appendix [CGJ])\b/i.test(telemetry) && telemetryEvents.size > 0;
  const noEmissionClaim = /\b(?:emit(?:s|ted)?|add(?:s|ed)?|introduce(?:s|d)?|create(?:s|d)?|send(?:s|sent)?|deliver(?:s|ed)?)\s+no\s+(?!(?:new|inferred|additional|free-form)\b)[^.\n]{0,100}\b(?:product|customer analytics|customer-facing|Appendix G)?\s*(?:event|webhook|notification|message|telemetry)s?\b|\bno\s+(?:product|customer analytics|customer-facing)?\s*(?:event|webhook|notification|message)s?\s+(?:is|are|will be\s+)?(?:emits?|fires?|dispatches?|emitted|sent|delivered|created|added|introduced)\b/i.test(telemetry);
  const noCustomerDeliveryClaim = /\b(?:emit(?:s|ted)?|add(?:s|ed)?|introduce(?:s|d)?|create(?:s|d)?|send(?:s|sent)?|deliver(?:s|ed)?)\s+no\s+(?!(?:new|inferred|additional|free-form)\b)[^.\n]{0,100}\b(?:webhook|notification|email|in-app|message)s?\b|\bno\s+(?:customer-facing\s+)?(?:webhook|notification|email|in-app|message)s?\s+(?:is|are|will be\s+)?(?:emits?|fires?|dispatches?|emitted|sent|delivered|created|added|introduced)\b/i.test(telemetry);
  const explicitNone = noEmissionClaim;
  const internalMetricsOnly = /\binternal (?:service )?metrics?\b/i.test(telemetry) && /\bno (?:Appendix G|customer analytics|product) event\b/i.test(telemetry);
  // Runtime gates assert product-event behavior owned by the tested producer; the
  // gate itself emits the shared gate-run signal checked below, not those product events.
  const missingTelemetryEvents = runtimeGate
    ? []
    : [...positiveEvents].filter((token) => !telemetryEvents.has(token));
  const customerDeliveryClaim = /\b(?:deliver|dispatch|send|receive|notify|publish|enqueue)[^.\n]{0,120}\b(?:webhook|notification|email|in-app|message)|\b(?:webhook|notification|email|in-app|message)[^.\n]{0,120}\b(?:deliver|dispatch|send|receive|notify|publish|enqueue)/i.test(
    [outcome, behavior, byKey.get("states") ?? "", byKey.get("success") ?? ""].join("\n"),
  );
  if (explicitNone && missingTelemetryEvents.length > 0) {
    flags.push(finding("telemetry_behavior_contradiction", missingTelemetryEvents));
  } else if (missingTelemetryEvents.length > 0) {
    flags.push(finding("telemetry_behavior_event_missing", missingTelemetryEvents));
  }
  if (noCustomerDeliveryClaim && customerDeliveryClaim && !/\bsource-only issue\b|\bproposed\b[\s\S]{0,160}\bdisabled until\b/i.test(telemetry)) {
    flags.push(finding("telemetry_delivery_contradiction", "Behavior sends or receives customer delivery while telemetry claims none"));
  }
  const declaredProductEventLine = telemetry.split(/\r?\n/).find((line) =>
    (
      /\b(?:PostHog events?|registered (?:product )?signals?)\s*:/i.test(line) ||
      /\b(?:event|signal|webhook|notification)\b[^.\n]{0,80}\b(?:fires?|emits?|dispatches?|is written)\b/i.test(line) ||
      /\b(?:emit|dispatch|send|deliver)s?\b[^.\n]{0,80}\b(?:webhook|notification)\b/i.test(line) ||
      (/^\s*[-*+]\s+/.test(line) && /`[a-z][a-z0-9_.:-]+`/.test(line) && /\b(?:sampling|idempotency|properties)\b/i.test(line))
    ) &&
    !/\b(?:emit(?:s|ted)?|add(?:s|ed)?|introduce(?:s|d)?|create(?:s|d)?|send(?:s|sent)?|deliver(?:s|ed)?)\s+no\b[^.\n]{0,100}\b(?:event|webhook|notification|message|telemetry)s?\b|\bno\s+(?:product|customer analytics|customer-facing)?\s*(?:event|signal|webhook|notification|message)s?\b[^.\n]{0,80}\b(?:emits?|fires?|dispatches?|is written|sent|delivered)\b/i.test(line) &&
    !/\binternal (?:service )?(?:metric|signal|event)/i.test(line)
  );
  const proposedDisabledTelemetry = /\b(?:proposed|future)\b[\s\S]{0,240}\b(?:disabled|not enabled|not registered|until (?:source|canonical) approval)\b|\b(?:disabled|not enabled|not registered)\b[\s\S]{0,240}\b(?:proposed|future)\b/i.test(telemetry);
  if (explicitNone && declaredProductEventLine && !proposedDisabledTelemetry) {
    flags.push(finding("telemetry_no_event_contradiction", declaredProductEventLine));
  }
  if (
    telemetry.trim() &&
    !registeredTelemetry &&
    !internalMetricsOnly &&
    !(explicitNone && positiveEvents.size === 0)
  ) {
    flags.push(finding("telemetry_not_registered_or_explicit_none", [...telemetryEvents].length > 0 ? [...telemetryEvents] : telemetry));
  }

  if (!runtimeGate) {
    let exact = verifiedSourceBundle(update, options);
    if (!exact && update.source.document && update.source.section) {
      const sourceKey = update.source.document;
      let source = options.sourceTextByDocument.get(sourceKey);
      if (source === undefined) {
        source = safeSourceText(options.root, sourceKey);
        options.sourceTextByDocument.set(sourceKey, source);
      }
      const sectionKey = `${sourceKey}\u0000${update.source.section}`;
      const cachedExact = options.sectionTextByKey.get(sectionKey);
      exact = cachedExact ?? null;
      if (cachedExact === undefined) {
        exact = source ? sourceSection(source, update.source.section) : null;
        options.sectionTextByKey.set(sectionKey, exact);
      }
    }
    if (exact) {
      const contractTokens = codeTokens(behavior);
      const sourceTokens = codeTokens(exact);
      if (hasVerifiedCurrentContractAuthority(update, options)) {
        for (const token of contractTokens) sourceTokens.add(token);
      }
      const foreign = [...contractTokens].filter((token) =>
        !sourceTokens.has(token) && !baselineContractTokens.has(token)
      );
      const ratio = contractTokens.size > 0 ? foreign.length / contractTokens.size : 0;
      if (foreign.length >= 8 && ratio >= 0.7) {
        flags.push(finding("cross_section_foreign_tokens", foreign));
      }
    } else if (
      options.sourceOverrides?.[update.issueId] &&
      update.source.document &&
      update.source.section
    ) {
      flags.push(finding("source_section_unresolved", `${update.source.document} ${update.source.section}`));
    }
  }

  if (update.diagnostics.requiresReview === true) {
    flags.push(finding("planner_requires_review", "planner diagnostics require review"));
  }

  if (runtimeGate) {
    const failure = byKey.get("failure") ?? "";
    const recovery = byKey.get("recovery") ?? "";
    const rollout = byKey.get("rollout") ?? "";
    const rollback = byKey.get("rollback") ?? "";
    const proof = byKey.get("proof") ?? "";
    const isCatalog = /Appendix M.*(?:runtime )?gate catalog|§M\.5 CI Gate Catalog/i.test(`${update.title}\n${outcome}`);
    const isM5 = /^Appendix M\.5\b/i.test(update.source.section ?? "") ||
      /tools\/spec-lint\/gates\//.test(byKey.get("paths") ?? "");
    const runtimeProblems: string[] = [];
    const declaredLane = declaredRuntimePathLane(behavior);
    const productImplementationPathsForGate = [...exactPaths].filter((path) =>
      PRODUCT_IMPLEMENTATION_PATH.test(path) && EXECUTABLE_IMPLEMENTATION_PATH.test(path)
    );
    const staticImplementationPaths = [...exactPaths].filter((path) =>
      STATIC_CI_IMPLEMENTATION_PATH.test(path) && STATIC_CI_IMPLEMENTATION_FILE.test(path)
    );
    const implementationPaths = [
      ...productImplementationPathsForGate,
      ...staticImplementationPaths,
    ];
    const productionProbePaths = [...exactPaths].filter((path) => PRODUCTION_PROBE_PATH.test(path));
    const testPaths = [...exactPaths].filter((path) => /^tests\//.test(path) || /\/fixtures\//.test(path));
    const immutableProofPaths = proofPaths.filter((path) => PRODUCTION_RECEIPT_PATH.test(path));
    if (immutableProofPaths.length === 0) runtimeProblems.push("missing immutable proof path");
    if (!/\b(?:fail(?:s|ed)? closed|reject|deny|quarantine|block(?:s|ed)? (?:merge|release|promotion))\b/i.test(`${behavior}\n${failure}`)) {
      runtimeProblems.push("failure contract is not explicitly fail-closed");
    }
    if (failure.trim().length < 60) runtimeProblems.push("failure contract is underspecified");
    if (recovery.trim().length < 60) runtimeProblems.push("recovery contract is underspecified");
    if (!/\b(?:commit|deployment|environment)\b/i.test(proof)) runtimeProblems.push("proof lacks commit/deployment identity");
    if (rollout.trim() && rollout.trim() === rollback.trim()) runtimeProblems.push("rollout and rollback are identical");
    if (isCatalog) {
      if (!/tools\/release\/stamp_gate\.ts/.test(byKey.get("paths") ?? "") ||
          !/tools\/release\/exact_status_scan\.ts/.test(byKey.get("paths") ?? "")) {
        runtimeProblems.push("catalog lacks both live scanner paths");
      }
      if (!/\b(?:deterministic|same-commit|same commit)\b/i.test(update.description)) {
        runtimeProblems.push("catalog lacks deterministic same-commit reconciliation");
      }
    } else {
      if (declaredLane === "static_ci") {
        if (staticImplementationPaths.length === 0) {
          runtimeProblems.push("static_ci lane is missing a tools/ or infra/ implementation path");
        }
        if (testPaths.length === 0) runtimeProblems.push("missing test or fixture path");
      } else if (declaredLane === "product_runtime" || declaredLane === "hybrid") {
        if (productImplementationPathsForGate.length === 0) {
          runtimeProblems.push(`${declaredLane} lane is missing a product implementation path`);
        }
        if (declaredLane === "hybrid" && staticImplementationPaths.length === 0) {
          runtimeProblems.push("hybrid lane is missing a tools/ or infra/ implementation path");
        }
        if (runtimeTestPaths.length === 0) {
          runtimeProblems.push(`${declaredLane} lane is missing an executable runtime test`);
        }
      } else {
        if (implementationPaths.length === 0) runtimeProblems.push("missing implementation path");
        if (testPaths.length === 0) runtimeProblems.push("missing test or fixture path");
      }
      if (productionProbePaths.length > 0 && declaredLane === "static_ci") {
        runtimeProblems.push("static_ci lane cannot use a production probe as implementation or proof");
      }
      if (isM5) {
        if (![...exactPaths].some((path) => /\/fixtures\/.+\/(?:pass|positive)\./i.test(path))) {
          runtimeProblems.push("missing positive fixture");
        }
        if (![...exactPaths].some((path) => /\/fixtures\/.+\/(?:fail|negative)\./i.test(path))) {
          runtimeProblems.push("missing negative fixture");
        }
        if (!/spec_lint\.appendix_m_gate_run/.test(telemetry)) {
          runtimeProblems.push("missing shared registered Appendix M gate-run event");
        }
      }
    }
    if (runtimeProblems.length > 0) {
      flags.push(finding("runtime_gate_incomplete_exact_contract", runtimeProblems));
    }
  }

  const deduped = [...new Map(flags.map((flag) => [flag.code, flag])).values()]
    .sort((left, right) => left.code.localeCompare(right.code));
  return {
    baselineLoss,
    blockerCount: deduped.length,
    classification: update.classification,
    flags: deduped,
    intentionalBaselineReplacement: intentionalReplacement
      ? {
          authorityEvidence: intentionalReplacement.authorityEvidence,
          dispositions: intentionalReplacement.dispositions,
          rationale: intentionalReplacement.rationale,
          registerSha256: options.replacementRegisterSha256Resolved as string,
          replacementMap: intentionalReplacement.replacementMap,
          rowSha256: intentionalReplacementRowSha256(intentionalReplacement),
        }
      : null,
    issueId: update.issueId,
    pass: deduped.length === 0,
    title: update.title,
  };
}

export function auditLinearNormalizationPlan(
  plan: unknown,
  options: SemanticAuditOptions,
): SemanticAuditReport {
  const root = realpathSync(options.root);
  const updates = normalizePlan(
    plan,
    options.manifestRows ?? [],
    options.sourceOverrides ?? {},
  );
  const baselineByIssue = new Map<string, BaselineIssueInput>();
  const baselineTitlesByIssue = new Map<string, string>();
  for (const issue of options.baselineIssues ?? []) {
    const issueId = baselineIssueId(issue);
    if (!issueId) continue;
    baselineByIssue.set(issueId, issue);
    const title = cleanIssueTitle(issue.title ?? "");
    if (title) baselineTitlesByIssue.set(issueId, title);
  }
  const baselineLossByIssue = new Map<string, BaselineLossFingerprint>();
  for (const update of updates) {
    const fingerprint = baselineLossFingerprint(update, baselineByIssue.get(update.issueId));
    if (fingerprint) baselineLossByIssue.set(update.issueId, fingerprint);
  }
  const replacementValidation = validateReplacementRegister(
    options.replacementRegister,
    options,
    root,
    new Set(updates.map((update) => update.issueId)),
    baselineLossByIssue,
    baselineByIssue,
    new Map(updates.map((update) => [update.issueId, update])),
  );
  const normalizedOptions: SemanticAuditContext = {
    ...options,
    baselineByIssue,
    baselineLossByIssue,
    baselineTitlesByIssue,
    intentionalReplacementByIssue: replacementValidation.rowsByIssue,
    replacementRegisterSha256Resolved: replacementValidation.digestSha256,
    root,
    sectionTextByKey: new Map<string, string | null>(),
    sourceBundleTextByKey: new Map<string, string | null>(),
    sourceChecksumRowsById: verifiedSourceChecksumRows(root, updates),
    sourceTextByDocument: new Map<string, string | null>(),
    trustedDraftDescriptionSha256ByIssue: trustedDraftDescriptionHashes(root),
  };
  const issues = updates.map((update) => issueAudit(update, normalizedOptions));
  const countsByCode: Record<string, number> = {};
  for (const issue of issues) {
    for (const flag of issue.flags) {
      countsByCode[flag.code] = (countsByCode[flag.code] ?? 0) + 1;
    }
  }
  for (const flag of replacementValidation.findings) {
    countsByCode[flag.code] = (countsByCode[flag.code] ?? 0) + 1;
  }
  const blockerIssues = issues.filter((issue) => !issue.pass).length;
  const replacementRegister: SemanticReplacementRegisterAudit = {
    appliedIssueIds: [...replacementValidation.rowsByIssue.keys()].sort(),
    digestSha256: replacementValidation.digestSha256,
    flags: replacementValidation.findings,
    pass: replacementValidation.findings.length === 0,
    supplied: replacementValidation.supplied,
  };
  return {
    generatedAt: new Date().toISOString(),
    issues,
    kind: "linear_normalization_semantic_audit",
    replacementRegister,
    schemaVersion: 1,
    summary: {
      auditedIssues: issues.length,
      blockerIssues,
      countsByCode: Object.fromEntries(Object.entries(countsByCode).sort(([left], [right]) => left.localeCompare(right))),
      inputIssues: updates.length,
      passingIssues: issues.length - blockerIssues,
      replacementRegisterBlockers: replacementValidation.findings.length,
    },
    verdict: blockerIssues === 0 && replacementRegister.pass ? "go" : "no-go",
  };
}
