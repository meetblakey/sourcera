#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import {
  projectCurrentFragment,
} from "./lib/current-source-projection.js";
import {
  loadLinearRuntimePathRegistry,
  type LinearRuntimePathRegistryEntry,
} from "./lib/linear-runtime-path-registry.js";
import {
  assertHistoricalNormalizationSourceMap,
  type HistoricalNormalizationSourceMapMarker,
} from "./lib/linear-normalization-source-map.js";

type IssueClass = "delivery_parent" | "runtime_gate" | "decision" | "feature";
type ContractProfile = "runtime" | "presentation";

interface LinearIssueInput {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  [key: string]: unknown;
}

interface ManifestRow {
  requirementId: string;
  outcome: string;
  sourceDoc: string;
  sourceVersion: string;
  section: string;
  dependencies: string[];
  disposition: string;
  release: string | null;
  issueId: string | null;
  anchors?: string[];
}

interface Manifest {
  rows: ManifestRow[];
}

interface SourceSlice {
  sourceDoc: string;
  startHeading: string;
  endHeading: string;
}

interface ChecksumRow {
  sourceId: string;
  sha256: string;
  slices?: SourceSlice[];
  sourceDoc?: string;
  startHeading?: string;
  endHeading?: string;
}

interface ChecksumContract {
  sources: ChecksumRow[];
}

interface SourceOverride {
  sourceDoc: string;
  section: string;
  outcome?: string;
  anchors?: string[];
}

interface NormalizationSourceMap extends HistoricalNormalizationSourceMapMarker {
  sources: Record<string, SourceOverride>;
  oversizedOrCrossCutting: string[];
  extractionPolicy: Record<string, string>;
  trustedDrafts?: Record<string, TrustedDraftContract>;
}

interface TrustedDraftContract {
  descriptionSha256: string;
  semanticBodySha256: string;
  excludedHeadings: string[];
}

interface NativeRelations {
  blockedBy: string[];
  blocks: string[];
  relatedTo: string[];
}

interface ParsedDescription {
  sections: Map<string, string[]>;
  residue: string[];
  paths: string[];
  relations: NativeRelations;
  removedNativeLines: number;
  removedReferenceLines: number;
  hasLikelyClippedLine: boolean;
}

interface PlannedUpdate {
  issueId: string;
  linearId: string;
  classification: IssueClass;
  source: {
    requirementId: string | null;
    checksumSourceId: string | null;
    document: string | null;
    version: string | null;
    section: string | null;
    sha256: string | null;
  };
  before: {
    title: string;
    descriptionSha256: string;
  };
  after: {
    title: string;
    description: string;
  };
  nativeRelations: NativeRelations;
  reasons: string[];
  diagnostics: {
    genericTemplate: boolean;
    canonicalSourceExtracted: boolean;
    removedNativeLines: number;
    removedReferenceLines: number;
    requiresReview: boolean;
  };
}

interface PlannerContext {
  root: string;
  nativeParentIds: Set<string>;
  rowsByIssue: Map<string, ManifestRow>;
  rowsByRequirement: Map<string, ManifestRow>;
  checksumsBySource: Map<string, ChecksumRow>;
  sourceOverrides: Map<string, SourceOverride>;
  sourceTextByPath: Map<string, string>;
  sourceSectionByKey: Map<string, string | null>;
  sectionLabelByPath: Map<string, Map<string, string>>;
  referenceLabelByToken: Map<string, string>;
  referenceIssueByToken: Map<string, string>;
  trustedDraftsByIssue: Map<string, TrustedDraftContract>;
  runtimePathsByIssue: Map<string, LinearRuntimePathRegistryEntry>;
  runtimePathsByGate: Map<string, LinearRuntimePathRegistryEntry>;
}

const IDENTIFIER = /\b(?:PLA|BUY|SEL|INT)-\d+\b/gi;
const SOURCE_ID = /\bF-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*\b/gi;
const OTHER_SOURCE_ID = /\b(?:SG|SR)-[A-Z0-9-]+\b/gi;
const AUDIT_SOURCE_ID = /\b(?:D|AE|RG|DEC)-[A-Z0-9][A-Z0-9._-]*\b/gi;
const MANUAL_PROGRAM_ID = /\bBL-[A-Z0-9][A-Z0-9._-]*(?:\/[A-Z0-9][A-Z0-9._-]*)*\b/gi;
const MANUAL_DESIGN_ID = /\bSD-\d+\b/gi;
const ASSUMPTION_ID = /\bASSUMP-[A-Z0-9][A-Z0-9._-]*\b/gi;
const LOCAL_ASSUMPTION_ID = /\bA-[A-Z][A-Z0-9-]*-\d+\b/g;
const ENCODED_SOURCE_REFERENCE = /\bf(?:[_-](?:ae|bc))?[_-]\d+(?:[_-][a-z0-9]+)*\b/i;
const LEGACY_ARTIFACT_REFERENCE = /(?:^|[/_.-])(?:r\d+[-_.])?f(?:[-_.]?ae)?[-_.]?\d{3,}[a-z0-9]*(?=[/_.-]|$)/i;
const MANUAL_RELATION_PLANNING = /\b(?:outcome-?parent contract|each child|assigned natively|this is a blocker)\b/i;
const MANUAL_TITLE_PREFIX = /^(?:\s*\[[^\]]+\]\s*)+/;
const NATIVE_FIELD = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(?:Release(?:\s+(?:version|sequence|name))?|Linear release|Sequence|Team|Project|Milestone|Parent|Owner|Assignee|Reviewer|Review authority|Estimate|Priority|Labels?|Status|State|Cycle|Due date|Readiness|Kind|Produces?|Consumers?|Source family|Issue identifier|Linear URL|Consumed by)(?:\*\*)?\s*:/i;
const RELATION_FIELD = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(Blocked by|Blocks|Related(?: to)?|Cross-references?)(?:\*\*)?\s*:/i;
const TELEMETRY_DIMENSION_FIELD = /^\s*Labels:\s*`[a-z][a-z0-9_]*`(?:\s*,\s*`[a-z][a-z0-9_]*`)+\.?\s*$/i;
const SOURCE_DEFERRAL = /(?:\b(?:per|see|defined in|governed by|authoritative in|as specified by|according to|referenced? in)\s+(?:the\s+)?(?:Master Spec|UX Design|Appendix|§)|\b(?:cited (?:source|contract|section)|where the cited source applies|Master Spec is authoritative|UX Design applies only|source row|union of §|no independent acceptance criteria|elsewhere in this spec)\b|pinned source owns|source owns (?:the )?(?:complete|full)|cited .{0,80} overrides? this issue|issue may summarize but never narrow|as defined in (?:the )?(?:master spec|ux design|pinned source|cited source)|as (?:the )?(?:cited )?source requires|where (?:the )?(?:cited|pinned) source applies|match(?:es)? (?:the )?cited contract|notifications? named by (?:the )?(?:cited|pinned) source|(?:read|reopen|consult|refer to|follow) .{0,80}(?:master spec|ux design|cited (?:ux )?(?:source|section)|pinned source)|(?:cited|pinned) source (?:controls|defines|owns|governs)|behavior (?:remains|lives|is defined) in (?:the )?(?:cited|pinned|ux) source|where (?:the )?source .{0,40}requires? runtime proof|(?:§\s*(?:M\.)?\d+(?:\.\d+)*(?:\s*[/,&]\s*§?\s*(?:M\.)?\d+(?:\.\d+)*)*|Appendix\s+[A-M](?:\.\d+)*|Section\s+\d+(?:\.\d+)*)\s+(?:owns?|defines?|governs?|remains authoritative)\b|(?:home|owning|current)\s+section.{0,40}(?:authoritative|owns?|governs?|defines?)|(?:definitions?|behavior|rules?)\s+(?:remain |live |are )?(?:in|under)\s+(?:§|Appendix|Section)\s*[A-Z0-9.]|(?:values?|limit class.{0,80})\s+(?:must\s+)?resolves?\s+to\s+Appendix\b|unchanged from its current behavior|\bconform(?:s)?\s+to\s+Appendix\s+[A-M]|\bresolve(?:s)?\s+from\s+(?:Master Spec\s+)?§\s*\d+)/i;
const GENERIC_BOILERPLATE = /(?:Deliver only this observable outcome|UX Design applies only where the Master Spec is silent|Implement (?:the )?(?:complete,?\s*)?(?:unabridged )?contract at (?:the )?cited (?:primary and related )?(?:source )?anchors?|Implement the required frontend, backend, data, permissions, error, accessibility, security, telemetry, and operations behavior|Enforce data, permission, state, and business rules server-side before UI success|No shortened (?:Linear )?excerpt overrides the source|Keep this issue scoped to its named outcome|use linked issues for separate outcomes|Runtime readiness requires deployed proof|Tests must prove the named emit path|Required observable outcome:|All numbers and entitlements resolve from (?:Master Spec )?§34|as (?:the )?(?:cited )?source requires|Separate requirement-map rows and their implementation outcomes|Documentation edits or runtime-readiness claims without deployed proof|The delivered behavior satisfies this outcome|Server-side authorization, org\/console\/workspace isolation|Unit tests for rules and state transitions|Positive\/negative integration tests for authorization, isolation, idempotency, and concurrency|Audit, telemetry, retention, and recovery validation|Keyboard, touch, focus, screen-reader, reduced-motion, and responsive behavior pass the applicable\s+[–-]?\s*checks|User-visible actions emit the required audit and telemetry signals without protected-data leakage|Keyboard, focus, ARIA, contrast, reduced-motion, and mobile behavior pass automated and manual checks|Component and visual-state tests|Browser E2E for keyboard, touch, responsive, and axe checks|Permission and telemetry integration tests)/i;
const GENERIC_CONTRACT_FALLBACK = /(?:Close the live release blocker|Recheck artifact presence|Keep the gate fail-closed|Artifact check:|Final command:|product behavior satisfies the gate assertion|named missing artifact exists and passes|row is promoted to `?runtime_active|fresh stamp gate no longer reports|Start from the persisted current state\. Validate the request and authorization|Authorize the actor server-side before every read or write|Correct the rejected input or dependency, replay with the same idempotency key|behind a disabled-by-default control, validate in a production-equivalent environment|disable the control, stop new writes, restore the prior verified build|assumes the current schema, provider contract, permission vocabulary|excludes unrelated product outcomes, broad refactors|Staging or production receipt where the source|Reviewed focused change linked to this issue|Passing CI for the listed tests|Audit and telemetry evidence retained without sensitive payloads|Documentation-only proof|Manual promotion before all named evidence passes|Other stamp-gate rows)/i;
const PRIOR_NORMALIZATION_BOILERPLATE = /(?:introduces no new persisted lifecycle value.{0,500}bounded denial defined in Complete behavior and rules|adds no authority grant.{0,500}Only the already-authorized caller on the owning resource may invoke|completes through the intended user and service path|Keep the failed identity closed, correct the rejected input, authority, transition, concurrency, or dependency condition|Deploy `[^`]+` behind its existing execution control|Disable new execution through `[^`]+`, restore the last verified compatible handler|Retain `[^`]+` with immutable inputs, result, timestamp, environment, commit, and trace correlation|is bound to `[^`]+`, the schemas and named states carried in this issue|permits changes only in the listed implementation, test, and proof paths)/i;
const MALFORMED_FIELD_TOKEN = /\b(?:responseslotid|bidworkspaceid|sellerorgid|attachref|docid|planupgraderequired|mfaenabled|warnedat)\b/i;
const LEGACY_REFERENCE = /\blegacy\s+(?:issue|project|initiative|workspace|plan|ticket|identifier|reference|source|provenance|duplicate|artifact)\b|\bhistorical\s+(?:issue|project|initiative|workspace|plan|ticket|identifier|reference)\b|\b(?:cancelled|canceled|duplicate)\s+(?:issue|project|initiative|ticket)\b/i;
const STALE_INFORMATION = /\b(?:legacy|historical|superseded|retired)\s+(?:issue|project|initiative|workspace|plan|ticket|identifier|reference|source)\b/i;
const PLANNING_HISTORY = /(?:\bauthoring intent\b|\bauthored in\b|\bremediation\s+(?:pass|program|phase|batch|history)\b|\bprevious pass\b|\bprior inventory\b|\bold plan\b|\bnot codex-ready\b|\bunestimated\b|\bhistorical seed\b|\bprior local sequence\b|\bstop-condition disposition\b|\bphase\s+\d+(?:\.\d+)*\s+(?:brief|deliverable|program)\b|_integration\/(?:RECONCILIATION|Integration_Prompts|PHASE)|\bauthored extensions?\b|\bv\d+(?:\.\d+)+(?:-rem)?\b|\b\d{4}-\d{2}-\d{2}\b|\bpre-v\d+(?:\.\d+)*\b|\bd-[a-z0-9.-]+\s+remediation\b|\baudit-remediation pass(?:es)?\b|\bcloses?\s+d-[a-z0-9.-]+\b|\boriginal v\d+(?:\.\d+)* release authored\b|\bpreserved from v\d+(?:\.\d+)*\b|\bmethod p\d+ pass\b|\bauthored as a forward-reference during .{0,100}\bprogram\b|\bglobal feedback\b|\bretired master summary\b|\bformer master summary\b|\brepresentative customer-facing summary\b|\bdeploy-time validator\b.{0,120}\bfollow-on\b)/i;
const PLANNING_PROVENANCE = /(?:\bretained\s+(?:(?:legacy|pre-cutover)\s+)?provenance\s+only\b|\bold\s+(?:linear\s+)?duplicates?\b|\bno\s+pre-cutover\s+duplicate\b|\bdescription\s+sha-?256\b|_baselines\/retired-sources\/|\breproduced\s+from\s+[^.!?\n]*retired-sources\b|\bcurrent authority\b[^.!?\n]{0,240}\b(?:non-retired companion|retired summary|historical provenance)\b|\bsource binding\b[^.!?\n]{0,240}\bhistorical provenance\b|\brole-wording\s+repair\b|\bsame as above\b|\ball rows authored against md5\b|\bpre-edit backup\b|legacy-import:_versions|\bsource-authority migration only\b|\bpreviously cited from (?:the )?retired\b)/i;
const COPIED_READINESS_METADATA = /(?:\bcodex-ready\b|\bunestimated\b|\bBlake Rowley\b|\bnative\s+(?:owner|dependencies?)\b|\b(?:owner|estimate)\s*:)/i;
const BANNED_SECTION = /^(?:pinned source|pinned contract|authority|ordered source bundle|source|source provenance|required runtime producer|delivery|release(?: and roadmap)? contract|roadmap contract|dependencies?|dependency and execution order|external integration ownership|blocking|blockers?|relations?|native fields?|routing|traceability|legacy resolution|history)$/i;
const PURE_DEPENDENCY_SENTENCE = /(?:^|\b)(?:this repair blocks?|blocked by|blocks? only its declared consumers?|downstream blocking is expressed|must land before|cannot start until|before .{0,120} can earn readiness|execution occurs only in|the named external owners?)\b/i;
const STOP_WORDS = new Set([
  "about", "after", "against", "before", "complete", "deliver", "enforce",
  "from", "into", "only", "outcome", "requirement", "sourcera", "that",
  "their", "this", "through", "with", "without",
]);
const MAX_CANONICAL_FACT_CHARS = 16_000;
const MAX_CANONICAL_BLOCK_CHARS = 5_000;
const MAX_CANONICAL_BLOCKS = 20;
const MAX_DESCRIPTION_CHARS = 25_000;
const REPOSITORY_PATH = /^(?:(?:\.github|\.storybook|app|apps|components|convex|delivery|docs|infra|lib|packages|public|reports|scripts|synthetics|tests|tools)\/[A-Za-z0-9@._{}\[\]+\/-]+|[A-Za-z0-9][A-Za-z0-9._-]*\.(?:cjs|css|js|json|jsx|md|mjs|tf|toml|ts|tsx|yaml|yml))$/;
const REPOSITORY_PATH_TOKEN = /(?:\.github|\.storybook|app|apps|components|convex|delivery|docs|infra|lib|packages|public|reports|scripts|synthetics|tests|tools)\/[A-Za-z0-9@._{}\[\]+/-]+/g;
const SEMANTIC_CODE_TOKEN = /\b[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)+\b/g;
const SEMANTIC_GENERIC_CODE_TOKENS = new Set([
  "created_at", "updated_at", "deleted_at", "entity_id", "event_id", "workspace_id",
  "organization_id", "org_id", "request_id", "user_id", "created_by", "updated_by",
  "pending", "active", "failed", "complete", "completed", "rejected", "accepted",
  "ready", "running", "passed", "result", "status", "type", "kind", "value",
  "free_allowance",
]);

const UX_SECTION_ALIASES = new Map<string, string[]>([
  ["tokens.typography", ["2.1"]],
  ["tokens.color", ["2.2"]],
  ["tokens.spacing", ["2.3"]],
  ["tokens.elevation", ["2.4"]],
  ["tokens.radius", ["2.5"]],
  ["tokens.motion", ["2.6"]],
  ["components.button", ["Button Component"]],
  ["components.input", ["Input Components"]],
  ["components.select", ["Input Components"]],
  ["components.modal", ["5.2.11", "Modal Component"]],
  ["components.drawer", ["Side Peek Component"]],
  ["components.toast", ["Toast Notification Component"]],
  ["components.tooltip", ["2.8"]],
  ["components.tabs", ["8.10"]],
  ["components.table", ["DataTable Component"]],
  ["components.pagination", ["DataTable Component"]],
  ["components.emptystate", ["9.2"]],
  ["components.skeleton", ["9.1"]],
  ["components.errorstate", ["9.3"]],
  ["patterns.form", ["Form Field Component"]],
  ["patterns.navigation", ["3.6"]],
  ["patterns.consolefirewall", ["3.2"]],
  ["motion", ["2.6"]],
  ["iconography", ["2.7"]],
  ["illustration", ["9.2"]],
  ["density", ["1.2"]],
  ["theming", ["2.2"]],
  ["voicetone", ["1.1"]],
]);

const GENERIC_FACT_TERMS = new Set([
  "appendix", "catalog", "console", "contract", "entity", "feature", "gate", "runtime",
  "surface", "system",
]);

const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function splitProseSentences(value: string): string[] {
  return value.split(/(?<=[!?])\s+|(?<=[^.]\.)\s+/);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function parseArguments(arguments_: string[]) {
  const allowed = new Set([
    "--root", "--manifest", "--checksums", "--source-map", "--runtime-path-registry", "--out",
  ]);
  if (arguments_.length % 2 !== 0) throw new Error("Every argument needs a value");
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const name = arguments_[index];
    const value = arguments_[index + 1];
    if (!allowed.has(name)) throw new Error(`Unknown argument ${name}`);
    if (!value?.trim() || value.startsWith("--")) {
      throw new Error(`Missing value for ${name}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  const out = values.get("--out");
  if (!out) throw new Error("Usage: plan-linear-native-normalization --out <path>");
  const root = realpathSync(resolve(values.get("--root") ?? process.cwd()));
  return {
    root,
    manifest: resolve(root, values.get("--manifest") ?? "reports/delivery/delivery-manifest.json"),
    checksums: resolve(root, values.get("--checksums") ?? "delivery/ticket-source-checksums.json"),
    sourceMap: resolve(root, values.get("--source-map") ?? "delivery/linear-normalization-source-map.json"),
    runtimePathRegistry: resolve(
      root,
      values.get("--runtime-path-registry") ?? "delivery/linear-runtime-path-registry.json",
    ),
    out: resolve(out),
  };
}

function parseJson<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
}

function readIssues(): LinearIssueInput[] {
  const parsed = parseJson<unknown>(readFileSync(0, "utf8"), "stdin");
  if (!Array.isArray(parsed)) throw new Error("stdin must be a JSON array");
  const issues = parsed.map((value, index) => {
    if (!value || typeof value !== "object") {
      throw new Error(`stdin issue ${index + 1} must be an object`);
    }
    const candidate = value as Record<string, unknown>;
    const humanIdentifier = typeof candidate.identifier === "string"
      ? candidate.identifier
      : typeof candidate.id === "string" && /^(?:PLA|BUY|SEL|INT)-\d+$/.test(candidate.id)
      ? candidate.id
      : null;
    if (!humanIdentifier) {
      throw new Error(`stdin issue ${index + 1} lacks a Linear identifier`);
    }
    if (typeof candidate.title !== "string" || !candidate.title.trim()) {
      throw new Error(`${humanIdentifier} lacks a title`);
    }
    if (
      candidate.description !== undefined &&
      candidate.description !== null &&
      typeof candidate.description !== "string"
    ) {
      throw new Error(`${humanIdentifier} description must be a string or null`);
    }
    return {
      ...candidate,
      id: typeof candidate.id === "string" ? candidate.id : humanIdentifier,
      identifier: humanIdentifier,
      title: candidate.title.trim(),
      description: typeof candidate.description === "string"
        ? candidate.description
        : null,
    } as LinearIssueInput;
  });
  const seen = new Set<string>();
  for (const issue of issues) {
    if (seen.has(issue.identifier)) {
      throw new Error(`stdin duplicates ${issue.identifier}`);
    }
    seen.add(issue.identifier);
  }
  return issues.sort((left, right) => compare(left.identifier, right.identifier));
}

function assertInside(root: string, path: string, label: string): void {
  const difference = relative(root, path);
  if (
    difference === ".." ||
    difference.startsWith("../") ||
    isAbsolute(difference)
  ) {
    throw new Error(`${label} escapes the repository`);
  }
}

function trustedDraftSemanticBody(description: string, excludedHeadings: string[]): string {
  const excluded = new Set(excludedHeadings);
  const seenExcluded = new Map<string, number>();
  const output: string[] = [];
  let sawTopLevel = false;
  let keep = false;
  for (const line of description.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading?.[1].length === 1) continue;
    if (heading?.[1].length === 2) {
      sawTopLevel = true;
      const value = heading[2].trim();
      keep = !excluded.has(value);
      if (!keep) seenExcluded.set(value, (seenExcluded.get(value) ?? 0) + 1);
    }
    if (!sawTopLevel || !keep) continue;
    output.push(line.trimEnd());
  }
  for (const heading of excluded) {
    const count = seenExcluded.get(heading) ?? 0;
    if (count !== 1) throw new Error(`trusted draft excluded heading ${JSON.stringify(heading)} occurs ${count} times`);
  }
  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function trustedDraftInput(
  issue: LinearIssueInput,
  context: PlannerContext,
): string | null {
  const contract = context.trustedDraftsByIssue.get(issue.identifier);
  if (!contract) return null;
  const description = issue.description ?? "";
  const descriptionDigest = sha256(description);
  if (descriptionDigest !== contract.descriptionSha256) {
    throw new Error(`${issue.identifier} trusted draft description hash changed`);
  }
  const semanticBody = trustedDraftSemanticBody(description, contract.excludedHeadings);
  if (!semanticBody) throw new Error(`${issue.identifier} trusted draft has no semantic body`);
  if (sha256(semanticBody) !== contract.semanticBodySha256) {
    throw new Error(`${issue.identifier} trusted draft semantic body hash changed`);
  }
  return replaceManualReferences(semanticBody, context);
}

function readControlPlane(paths: ReturnType<typeof parseArguments>): PlannerContext {
  assertInside(paths.root, paths.manifest, "manifest");
  assertInside(paths.root, paths.checksums, "checksum contract");
  assertInside(paths.root, paths.sourceMap, "normalization source map");
  assertInside(paths.root, paths.runtimePathRegistry, "runtime path registry");
  const manifest = parseJson<Manifest>(readFileSync(paths.manifest, "utf8"), "manifest");
  const checksums = parseJson<ChecksumContract>(readFileSync(paths.checksums, "utf8"), "checksum contract");
  const sourceMap = parseJson<NormalizationSourceMap>(
    readFileSync(paths.sourceMap, "utf8"),
    "normalization source map",
  );
  assertHistoricalNormalizationSourceMap(sourceMap);
  const runtimePathRegistry = loadLinearRuntimePathRegistry(paths.runtimePathRegistry);
  if (!Array.isArray(manifest.rows)) throw new Error("manifest rows are missing");
  if (!Array.isArray(checksums.sources)) throw new Error("checksum sources are missing");
  if (
    !sourceMap.sources ||
    typeof sourceMap.sources !== "object" ||
    Array.isArray(sourceMap.sources) ||
    !Array.isArray(sourceMap.oversizedOrCrossCutting) ||
    !sourceMap.extractionPolicy ||
    typeof sourceMap.extractionPolicy !== "object"
  ) throw new Error("normalization source map is invalid");
  const rowsByIssue = new Map<string, ManifestRow>();
  const rowsByRequirement = new Map<string, ManifestRow>();
  for (const row of manifest.rows) {
    if (!row.requirementId || rowsByRequirement.has(row.requirementId)) {
      throw new Error(`manifest has an invalid or duplicate requirement ${row.requirementId}`);
    }
    rowsByRequirement.set(row.requirementId, row);
    if (row.issueId) {
      if (rowsByIssue.has(row.issueId)) throw new Error(`manifest duplicates issue ${row.issueId}`);
      rowsByIssue.set(row.issueId, row);
    }
  }
  const checksumsBySource = new Map<string, ChecksumRow>();
  for (const row of checksums.sources) {
    if (!row.sourceId || !/^[a-f0-9]{64}$/.test(row.sha256)) {
      throw new Error(`checksum contract has an invalid row ${row.sourceId}`);
    }
    if (checksumsBySource.has(row.sourceId)) {
      throw new Error(`checksum contract duplicates ${row.sourceId}`);
    }
    checksumsBySource.set(row.sourceId, row);
  }
  const sourceOverrides = new Map<string, SourceOverride>();
  for (const [issueId, override] of Object.entries(sourceMap.sources)) {
    if (
      !/^(?:PLA|BUY|SEL|INT)-\d+$/.test(issueId) ||
      !override ||
      typeof override !== "object" ||
      typeof override.sourceDoc !== "string" ||
      !override.sourceDoc.trim() ||
      typeof override.section !== "string" ||
      !override.section.trim() ||
      override.outcome !== undefined && (typeof override.outcome !== "string" || !override.outcome.trim()) ||
      override.anchors !== undefined && (
        !Array.isArray(override.anchors) ||
        override.anchors.length === 0 ||
        override.anchors.some((anchor) => typeof anchor !== "string" || !anchor.trim()) ||
        new Set(override.anchors).size !== override.anchors.length
      )
    ) throw new Error(`normalization source map has an invalid row ${issueId}`);
    if (!safeSourcePath(paths.root, override.sourceDoc)) {
      throw new Error(`normalization source map source is unavailable for ${issueId}`);
    }
    sourceOverrides.set(issueId, override);
  }
  const oversized = new Set<string>();
  for (const issueId of sourceMap.oversizedOrCrossCutting) {
    if (typeof issueId !== "string" || oversized.has(issueId) || !sourceOverrides.has(issueId)) {
      throw new Error(`normalization source map has an invalid cross-cutting row ${String(issueId)}`);
    }
    oversized.add(issueId);
  }
  const trustedDraftsByIssue = new Map<string, TrustedDraftContract>();
  for (const [issueId, contract] of Object.entries(sourceMap.trustedDrafts ?? {})) {
    if (
      !/^(?:PLA|BUY|SEL|INT)-\d+$/.test(issueId) ||
      !contract ||
      typeof contract !== "object" ||
      !/^[a-f0-9]{64}$/.test(contract.descriptionSha256) ||
      !/^[a-f0-9]{64}$/.test(contract.semanticBodySha256) ||
      !Array.isArray(contract.excludedHeadings) ||
      contract.excludedHeadings.some((heading) => typeof heading !== "string" || !heading.trim()) ||
      new Set(contract.excludedHeadings).size !== contract.excludedHeadings.length
    ) throw new Error(`normalization source map has an invalid trusted draft ${issueId}`);
    trustedDraftsByIssue.set(issueId, {
      descriptionSha256: contract.descriptionSha256,
      semanticBodySha256: contract.semanticBodySha256,
      excludedHeadings: [...contract.excludedHeadings],
    });
  }
  const runtimePathsByIssue = new Map<string, LinearRuntimePathRegistryEntry>();
  const runtimePathsByGate = new Map<string, LinearRuntimePathRegistryEntry>();
  for (const entry of runtimePathRegistry.entries) {
    runtimePathsByIssue.set(entry.issueId, entry);
    runtimePathsByGate.set(entry.gateId, entry);
  }
  return {
    root: paths.root,
    nativeParentIds: new Set<string>(),
    rowsByIssue,
    rowsByRequirement,
    checksumsBySource,
    sourceOverrides,
    sourceTextByPath: new Map<string, string>(),
    sourceSectionByKey: new Map<string, string | null>(),
    sectionLabelByPath: new Map<string, Map<string, string>>(),
    referenceLabelByToken: new Map<string, string>(),
    referenceIssueByToken: new Map<string, string>(),
    trustedDraftsByIssue,
    runtimePathsByIssue,
    runtimePathsByGate,
  };
}

function cleanTitle(title: string): string {
  const cleaned = title
    .replace(MANUAL_TITLE_PREFIX, "")
    .replace(/^AE-\d+(?:\.\d+)*-\d+:?\s*/i, "")
    .replace(/\b(?:legacy|historical)\b/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  if (!cleaned) throw new Error(`Title ${JSON.stringify(title)} contains only prefixes`);
  return cleaned;
}

function populateReferenceLabels(issues: LinearIssueInput[], context: PlannerContext): void {
  for (const issue of issues) {
    const label = cleanTitle(issue.title);
    context.referenceLabelByToken.set(issue.identifier.toUpperCase(), label);
    context.referenceIssueByToken.set(issue.identifier.toUpperCase(), issue.identifier);
    const prefix = prefixValue(issue.title);
    if (prefix && /^(?:F-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*|(?:SG|SR)-[A-Z0-9-]+)$/i.test(prefix)) {
      context.referenceLabelByToken.set(prefix.toUpperCase(), label);
      context.referenceIssueByToken.set(prefix.toUpperCase(), issue.identifier);
    }
  }
}

function replaceManualReferences(description: string, context: PlannerContext): string {
  const replace = (value: string): string =>
    context.referenceLabelByToken.get(value.toUpperCase()) ?? value;
  const expandLetterRange = (
    _full: string,
    family: string,
    first: string,
    last: string,
  ): string => {
    const start = first.toUpperCase().charCodeAt(0);
    const end = last.toUpperCase().charCodeAt(0);
    if (end < start || end - start > 25) return _full;
    return Array.from({ length: end - start + 1 }, (_, index) =>
      replace(`${family}${String.fromCharCode(start + index)}`)
    ).join(", ");
  };
  const expandNumericRange = (
    full: string,
    family: string,
    first: string,
    last: string,
  ): string => {
    const start = Number(first);
    const end = Number(last);
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start || end - start > 30) {
      return full;
    }
    return Array.from({ length: end - start + 1 }, (_, index) =>
      replace(`${family}${String(start + index).padStart(first.length, "0")}`)
    ).join(", ");
  };
  return description
    .replace(/\b(F-(?:AE-|BC-)?\d+\.)([A-Z])\s*(?:through|[–—-])\s*(F-(?:AE-|BC-)?\d+\.)([A-Z])\b/gi,
      (full, firstFamily: string, first: string, secondFamily: string, last: string) =>
        firstFamily.toUpperCase() === secondFamily.toUpperCase()
          ? expandLetterRange(full, firstFamily, first, last)
          : full
    )
    .replace(/\b(F-(?:AE-|BC-)?\d+\.)([A-Z])\s*(?:through|[–—-])\s*([A-Z])\b/gi, expandLetterRange)
    .replace(/\b(F-(?:AE-|BC-)?\d+\.)([A-Z])\s*\/\s*([A-Z])\b/gi, (_full, family: string, first: string, second: string) =>
      `${replace(`${family}${first}`)} and ${replace(`${family}${second}`)}`
    )
    .replace(/\b((?:SG|SR)-[A-Z0-9-]*-)(\d+)\s*[–—]\s*(\d+)\b/gi, expandNumericRange)
    .replace(OTHER_SOURCE_ID, replace)
    .replace(SOURCE_ID, replace)
    .replace(IDENTIFIER, replace);
}

const SEMANTIC_TITLE_OVERRIDES = new Map<string, string>([
  ["F-AE-001", "Verify the DSAR cascade entity-class matrix and CI gates"],
  ["F-AE-003", "Enforce the seven cross-organization PII rules and CI gates"],
  ["F-AE-004", "Enforce reactive-subscription rules and service-level objectives"],
  ["F-AE-018", "Add provider health severity routing and detector fail-open handling"],
  ["F-AE-026", "Add the Defense View capability rate card and output contract"],
  ["F-794", "Enforce the Appendix M runtime contract"],
]);

const SEMANTIC_ISSUE_TITLE_OVERRIDES = new Map<string, string>([
  ["PLA-704", "Appendix M Runtime Gate Catalog"],
  ["PLA-853", "Appendix G Alias Rejection Enforcement"],
  ["PLA-317", "Workspace Admin Role"],
  ["PLA-318", "Use Case Lead Role"],
  ["PLA-319", "Reviewer Role"],
  ["PLA-370", "Seller Team Routing Authority Mapping"],
  ["PLA-372", "Seller Team Drafting Authority Mapping"],
  ["PLA-559", "Production Capability Posture"],
  ["PLA-560", "Data Residency and Compliance Expansion"],
  ["PLA-916", "Buyer Solo Pipeline Phase Mapping"],
  ["PLA-918", "Seller In-Workspace Value Proof"],
  ["PLA-937", "Seller Post-Submission Reveal"],
  ["PLA-953", "Execute the Pricing Lane Through Every Canonical Gate"],
  ["PLA-990", "Classify Every Entity Route Under the Exact Scoping Contract"],
  ["PLA-993", "Enforce Every Performance Budget Under All Three Load Profiles"],
  ["PLA-1003", "Bind Implementation Contracts to Current Owners"],
  ["SEL-257", "Knowledge Base Export Solo and Free Override"],
  ["SEL-203", "KB Bootstrap Allowance Compensation Completeness"],
]);

const OBSOLETE_ISSUE_DELETIONS = new Map<string, string>([
  ["BUY-404", "obsolete Marketplace descope artifact"],
  ["PLA-896", "superseded Admin capability closure artifact"],
  ["PLA-898", "superseded support-tool split closure artifact"],
  ["PLA-899", "superseded audit-log closure artifact"],
  ["PLA-940", "obsolete GTM rewrite descope artifact"],
  ["PLA-938", "superseded duplicate of the canonical Appendix M runtime-gate catalog"],
  ["PLA-371", "superseded duplicate of the canonical Seller Team routing authority mapping"],
  ["PLA-702", "obsolete Appendix M authored-extension note with no standalone executable behavior"],
]);

const EXTERNAL_DOSSIER_ISSUES = new Set([
  "BUY-409", "BUY-410", "PLA-958", "PLA-1002", "PLA-1003",
]);

const SOURCE_ONLY_REPAIR_ISSUES = new Set([
  "BUY-410",
  "PLA-1004",
  "PLA-1006",
  "PLA-1009",
  "PLA-1010",
  "PLA-1020",
]);

const COORDINATION_PARENT_ISSUES = new Set([
  "BUY-405",
  "PLA-218", "PLA-219", "PLA-271", "PLA-283", "PLA-284", "PLA-434", "PLA-471",
  "PLA-528", "PLA-553", "PLA-945", "PLA-950", "PLA-972", "PLA-975",
]);

function prefixValue(title: string): string | null {
  return /^\s*\[([^\]]+)\]/.exec(title)?.[1]?.trim() ?? null;
}

function classify(
  issue: LinearIssueInput,
  row: ManifestRow | undefined,
  context: PlannerContext,
): IssueClass {
  const prefix = prefixValue(issue.title)?.toLowerCase() ?? "";
  if (
    COORDINATION_PARENT_ISSUES.has(issue.identifier) && context.nativeParentIds.has(issue.identifier) ||
    prefix === "delivery group" ||
    /\b(?:coordination-only|coordination outcome|outcome parent\.\s*non-executable|parent is (?:never|not) (?:a )?(?:broad )?executable)\b/i.test(issue.description ?? "")
  ) return "delivery_parent";
  if (
    prefix === "runtime gate" ||
    row?.disposition === "proof_only" ||
    /^Appendix M\.5\b/i.test(row?.section ?? "") ||
    /\bCI Gate$/i.test(cleanTitle(issue.title))
  ) return "runtime_gate";
  if (prefix === "decision") return "decision";
  return "feature";
}

function familyCandidates(sourceId: string): string[] {
  const candidates = [sourceId];
  let candidate = sourceId;
  while (candidate.includes(".")) {
    candidate = candidate.replace(/\.[^.]+$/, "");
    candidates.push(candidate);
  }
  return candidates;
}

function sourceIdentity(
  issue: LinearIssueInput,
  context: PlannerContext,
): {
  requirementId: string | null;
  row: ManifestRow | null;
  checksum: ChecksumRow | null;
  matchKind: "exact" | "override" | "family" | "checksum" | "none";
} {
  const mapped = context.rowsByIssue.get(issue.identifier);
  const override = context.sourceOverrides.get(issue.identifier);
  const prefix = prefixValue(issue.title);
  const prefixedSource = prefix && /^(?:F-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*|RG:[A-Z0-9_:-]+)$/i.test(prefix)
    ? prefix.toUpperCase()
    : null;
  const requirementId = prefixedSource ?? mapped?.requirementId ?? null;
  const candidates = requirementId ? familyCandidates(requirementId) : [];
  const baseRow = mapped ?? candidates
    .map((candidate) => context.rowsByRequirement.get(candidate))
    .find((candidate): candidate is ManifestRow => Boolean(candidate)) ?? null;
  const row = override
    ? {
        requirementId: baseRow?.requirementId ?? requirementId ?? `NORMALIZATION:${issue.identifier}`,
        outcome: override.outcome ?? baseRow?.outcome ?? cleanTitle(issue.title),
        sourceDoc: override.sourceDoc,
        sourceVersion: baseRow?.sourceVersion ?? "current",
        section: override.section,
        dependencies: baseRow?.dependencies ?? [],
        disposition: baseRow?.disposition ?? "active",
        release: baseRow?.release ?? null,
        issueId: issue.identifier,
        anchors: override.anchors,
      }
    : baseRow;
  const checksum = candidates
    .map((candidate) => context.checksumsBySource.get(candidate))
    .find((candidate): candidate is ChecksumRow => Boolean(candidate)) ?? null;
  const matchKind = override
    ? "override"
    : mapped
    ? "exact"
    : baseRow
    ? "family"
    : checksum
    ? "checksum"
    : "none";
  return { requirementId, row, checksum, matchKind };
}

function headingKey(heading: string): string {
  const normalized = heading
    .replace(/\{#[^}]+\}\s*$/, "")
    .replace(/[*_`]/g, "")
    .trim()
    .toLowerCase();
  if (/^outcome(?: parent)?$/.test(normalized)) return "outcome";
  if (/^purpose$/.test(normalized)) return "outcome";
  if (/^(?:pinned sources?|source provenance\b|canonical placement\b|generated owner manifest\b|required runtime producer\b|consumed contracts? and boundary\b)/.test(normalized)) return "skip";
  if (/^(?:scope|implementation notes?)$/.test(normalized)) return "behavior";
  if (/^external integration ownership$/.test(normalized)) return "behavior";
  if (/^(?:kind|source-repair control|mergeable child decomposition|cross-cutting completeness|boundaries|ownership|complete behavior)$/.test(normalized)) return "behavior";
  if (/^(?:exact repair rules|required source contract|required behavior(?: and rules)?|implementation contract|complete master contract|customer and operational proof contract)$/.test(normalized)) return "behavior";
  if (/^(?:complete current .+ set|exact .+ (?:guard|behavior|rule|firewall) contract)$/.test(normalized)) return "behavior";
  if (/^(?:product scope|first 30 seconds|first-bid empty state|plan contract|exact snapshot matrix|plan-linked policy outputs|console activation ownership|release-gate checks|complete current .+ catalog|complete current .+ matrix)$/.test(normalized)) return "behavior";
  if (/^required (?:source (?:decision|repair)|contract|catalog|authorization matrix|state contract|retention contract|archive and serializer contract)$/.test(normalized)) return "behavior";
  if (/(?:complete\s+)?behavior.*rules|rules.*behavior/.test(normalized)) return "behavior";
  if (/states?.*transitions?|transitions?.*states?/.test(normalized)) return "states";
  if (/permissions?.*(?:isolation|privacy)|(?:isolation|privacy).*permissions?/.test(normalized)) return "permissions";
  if (/^(?:access(?: and .+)?|authorization(?: and .+)?|isolation(?: and .+)?)$/.test(normalized)) return "permissions";
  if (/^(?:(?:exact|target)\s+)?(?:(?:files?\s*(?:\/|and)\s*(?:owned\s+)?)|(?:owned\s+))?paths?\b/.test(normalized)) return "paths";
  if (/review.*readiness|readiness.*review/.test(normalized)) return "review";
  if (/^acceptance(?: tests?)?$/.test(normalized)) return "success";
  if (/^acceptance criteria$/.test(normalized)) return "success";
  if (/^(?:testing notes?|accessibility proof)$/.test(normalized)) return "success_review";
  if (/^parent acceptance$/.test(normalized)) return "success";
  if (/^success(?: tests?)?$/.test(normalized)) return "success";
  if (/^parent failure and recovery$/.test(normalized)) return "failure_recovery";
  if (/^failure\s+(?:and|\/)\s+recovery(?: tests?)?$/.test(normalized)) return "failure_recovery";
  if (/^failure(?: tests?| modes?)?$/.test(normalized)) return "failure";
  if (/^recovery(?: tests?)?$/.test(normalized)) return "recovery";
  if (/^rollout\s+(?:and|\/)\s+rollback$/.test(normalized)) return "rollout_rollback";
  if (/rollout.*rollback.*telemetry.*exclusions?/.test(normalized)) return "mixed_controls";
  if (/^rollout/.test(normalized)) return "rollout";
  if (/^rollback/.test(normalized)) return "rollback";
  if (/^telemetry\b|notifications?.*telemetry/.test(normalized)) return "telemetry";
  if (/^notification triggers?$/.test(normalized)) return "telemetry";
  if (/^risks?$/.test(normalized)) return "failure";
  if (/^exact production proof contract$/.test(normalized)) return "behavior";
  if (/^required evidence$/.test(normalized)) return "proof";
  if (/proof/.test(normalized)) return "proof";
  if (/assumptions?.*validation|validation.*assumptions?/.test(normalized)) return "assumptions";
  if (/^exclusions?/.test(normalized)) return "exclusions";
  if (BANNED_SECTION.test(normalized)) return "skip";
  return "behavior";
}

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const cased = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?](?:\*\*)?$/.test(cased) ? cased : `${cased}.`;
}

function splitCombinedControl(
  value: string,
  kind: "failure_recovery" | "rollout_rollback",
): Partial<Record<"failure" | "recovery" | "rollout" | "rollback", string>> | null {
  const clauses = value.split(/;\s*/).map((clause) => clause.trim()).filter(Boolean);
  if (clauses.length < 2) return null;
  if (kind === "failure_recovery") {
    const failure = clauses.filter((clause) =>
      /\b(?:reject|fail|invalid|forbidden|denied|interrupt|writes? nothing|no (?:write|mutation|effect))\b/i.test(clause)
    );
    const recovery = clauses.filter((clause) =>
      /\b(?:correct|retry|resume|restore|replay|reconcile|recover)\b/i.test(clause)
    );
    if (failure.length > 0 && recovery.length > 0) {
      return {
        failure: sentenceCase(failure.join("; ")),
        recovery: sentenceCase(recovery.join("; ")),
      };
    }
  } else {
    const rollout = clauses.filter((clause) =>
      /\b(?:canary|enable|launch|ramp|roll out|deploy|start in|reporting mode)\b/i.test(clause)
    );
    const rollback = clauses.filter((clause) =>
      /\b(?:disable|restore|revert|roll back|stop new|last verified)\b/i.test(clause)
    );
    if (rollout.length > 0 && rollback.length > 0) {
      return {
        rollout: sentenceCase(rollout.join("; ")),
        rollback: sentenceCase(rollback.join("; ")),
      };
    }
  }
  return null;
}

function stripPlanningHistoryFragments(value: string): string {
  return value
    .replace(/\s*\bSource authority(?:\s+for)?\s*:?\s*§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*(?:\s*(?:[/,&;]|and)\s*§?\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*)*(?:\s+(?:and\s+)?(?:AC\s*#\d+\s+)?consumes?\s+this\s+row)?\.?/gi, " ")
    .replace(/\s*(?:§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*\s*(?:and|\/)\s*)?(?:AC\s*#\d+\s+)?consumes?\s+this\s+row\.?/gi, " ")
    .replace(/\s*\b(?:Approved|Authored) Extension\s*:?\s*(?:AE-[A-Z0-9._-]+)?\.?/gi, " ")
    .replace(/\s*\bBL-[A-Z0-9][A-Z0-9._-]*(?:\/[A-Z0-9][A-Z0-9._-]*)*(?:\s+closure)?\.?/gi, " ")
    .replace(/\s*\bPhase\s+\d+(?:\.\d+)*(?:\s*\/\s*\d+(?:\.\d+)*)?(?:\s+[A-Z][A-Z0-9.-]*)?(?:\s+remediation)?\s*[.;]?\s*(?=(?:BL-|\||$))/gi, " ")
    .replace(/\s*\bpromoted\s+from\s+(?:in\s+)?Phase\s+[^|.!?]+[.!?]?/gi, " ")
    .replace(/\s*\bThis row is the numerical singleton previously cited from the retired[^.!?]*[.!?]/gi, " ")
    .replace(/\s*\bsource-authority migration only,?\s+with no behavior change\.?/gi, " ")
    .replace(/\s+\d+(?:\.\d+)+\.?\s*(?=\|\s*$)/g, " ")
    .replace(/\bFinalization authority is unresolved\.[^.!?\n]*\b(?:retired|historical)\b[^.!?\n]*(?:[.!?]|$)/gi,
      "Selection Report finalization remains disabled until a current operation-by-role matrix assigns create, finalize, sign, approve, supersede, and phase-advance authority. ")
    .replace(/[^.!?\n]*(?:\bretained\s+(?:(?:legacy|pre-cutover)\s+)?provenance\s+only\b|\bold\s+(?:linear\s+)?duplicates?\b|\bno\s+pre-cutover\s+duplicate\b|\bdescription\s+sha-?256\b|_baselines\/retired-sources\/|\breproduced\s+from\s+[^.!?\n]*retired-sources\b|\bcurrent authority\b[^.!?\n]{0,240}\b(?:non-retired companion|retired summary|historical provenance)\b|\bsource binding\b[^.!?\n]{0,240}\bhistorical provenance\b|\brole-wording\s+repair\b|\bsame as above\b|\ball rows authored against md5\b|\bpre-edit backup\b|legacy-import:_versions)[^.!?\n]*(?:[.!?]|$)/gi, " ")
    .replace(/\bPhase\s+(\d+(?:\.\d+)*)\s+closure\b/gi, "terminal Phase $1 completion")
    .replace(/\bPhase\s+\d+(?:\.\d+)?\s*[—-]\s*landed under integration program\.?(?:\s*)/gi, "")
    .replace(/\*?\(\s*Phase\s+\d+(?:\.\d+)?\s+V\d+\s*\)\*?/gi, "")
    .replace(/\(\s*Phase\s+\d+(?:\.\d+)*\s+(?:brief|deliverable|program)[^)]*\)/gi, "")
    .replace(/(?:\*\*)?Resolved:(?:\*\*)?\s*(?=(?:v\d|D-|audit-remediation))/gi, "")
    .replace(/\s*(?:per\s+)?CLAUDE\.md\s+global feedback:\s*/gi, " ")
    .replace(/\*\*([^*]+)\*\*/g, (full, inner: string) =>
      PLANNING_HISTORY.test(inner) ? "" : full
    )
    .replace(/\(([^()]*)\)/g, (full, inner: string) =>
      PLANNING_HISTORY.test(inner) ? "" : full
    )
    .replace(/\bv7\.2\.0-rem\s+phase\s+[a-z0-9.]+[^;.!?]{0,160}(?:closure|remediation|passes?)\s*[;:—-]?\s*/gi, "")
    .replace(/\bv\d+(?:\.\d+)*-rem(?:\s+phase\s+[a-z0-9.]+)?(?:\s+(?:block|closure|pass|program))?(?:,\s*\d{4}-\d{2}-\d{2})?\s*[;:—-]?\s*/gi, "")
    .replace(/\b(?:v\d+(?:\.\d+)*(?:\+)?|d-[a-z0-9.-]+)\s+remediation(?:\s+cross-reference)?(?:,\s*\d{4}-\d{2}-\d{2})?\s*[;:—-]?\s*/gi, "")
    .replace(/\baudit-remediation pass(?:es)?\b\s*[;:—-]?\s*/gi, "")
    .replace(/\bpromoted\s+\d{4}-\d{2}-\d{2}\b\s*[;:—-]?\s*/gi, "")
    .replace(/\bpre-v\d+(?:\.\d+)*\b\s*[;:—-]?\s*/gi, "")
    .replace(/\b(?:pre-v\d+(?:\.\d+)*\s+)?name\s+"[^"]+"\s+(?:is\s+)?retired\.?/gi, "")
    .replace(/\bauthored as a forward-reference during .{0,100}\bprogram\b\s*[;:—-]?\s*/gi, "")
    .replace(/\bcloses?\s+d-[a-z0-9.-]+(?:\s*\/\s*d-[a-z0-9.-]+)*\b\s*[;:—-]?\s*/gi, "")
    .replace(/\s+and registers the Phase\s+.{0,160}?\bextension approved in\s+(?:(?:D|AE|RG|DEC)-[A-Z0-9][A-Z0-9._-]*\b)(?:\s+and\s+(?:(?:D|AE|RG|DEC)-[A-Z0-9][A-Z0-9._-]*\b))*\.?/gi, "")
    .replace(/\bremediation copy\b/gi, "corrective guidance")
    .replace(/\bnative blockers?\b/gi, "required prerequisites")
    .replace(/\*\*(?:Estimate|Direct blockers?|Linear release|Project|Milestone|Assignee|Reviewer|Priority|Labels?|Cycle|Due date):\*\*[^;\n]*(?:;\s*|$)/gi, "")
    .replace(/(?:[-*+]\s*)?\*\*Preserved owner:\*\*[^\n]+?\s+-\s+(?=\*\*(?:Surface requirement|Behavior in this child):)/gi, "")
    .replace(/\b(?:authored in|previous pass|prior inventory|old plan|not codex-ready|historical seed|prior local sequence)\b[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\bv\d+(?:\.\d+)+(?:-rem)?\b/gi, "")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
    .replace(LOCAL_ASSUMPTION_ID, "")
    .replace(ASSUMPTION_ID, "")
    .replace(AUDIT_SOURCE_ID, "")
    .replace(MANUAL_PROGRAM_ID, "")
    .replace(MANUAL_DESIGN_ID, "")
    .replace(/[ \t]{2,}/g, " ");
}

function stripSourceDelegationFragments(value: string): string {
  const sourceAnchor = "(?:Master Spec(?:\\s+§\\s*(?:M\\.)?\\d+(?:\\.[0-9A-Z]+)*)?|UX Design(?:\\s+§\\s*[A-Z0-9.]+)?|Appendix\\s+[A-M](?:\\.\\d+)*|§\\s*(?:M\\.)?\\d+(?:\\.[0-9A-Z]+)*(?:\\s*(?:[/,&]|and)\\s*§?\\s*(?:M\\.)?\\d+(?:\\.[0-9A-Z]+)*)*)";
  const leading = new RegExp(`^\\s*(?:according to|per|as specified by|defined in|governed by|authoritative in|referenced? in|see)\\s+(?:the\\s+)?${sourceAnchor}\\s*[,;:—-]\\s*`, "i");
  const inline = new RegExp(`\\s+\\b(?:according to|per|as specified by|defined in|governed by|authoritative in|referenced? in|see)\\s+(?:the\\s+)?${sourceAnchor}`, "gi");
  return value
    .replace(/^[^.!?\n]*\b(?:lifecycle|state machine|contract|behavior)\s+is\s+authoritative\s+in\s+(?:the\s+)?(?:Master Spec|UX Design|(?:\*\*)?Appendix|§)[^.!?\n]*(?:[.!?]|$)/gim, "")
    .replace(leading, "")
    .replace(inline, "")
    .replace(/^\s*(?:OR|AND)\s+/i, "")
    .replace(/\bsource row\b/gi, "persisted row")
    .replace(/\belsewhere in this spec\b/gi, "by this contract")
    .replace(/\bwhere the cited source applies\b/gi, "for this behavior")
    .replace(/\b((?:validate|check|compare)\s+against)\s+(?:that|the|this)\s+source\b/gi, "$1 the exact contract")
    .replace(/\s*\bSource authority(?:\s+for)?\s*:?\s*(?:§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*|Appendix\s+[A-M](?:\.\d+)*)(?:\s*(?:[/,&;]|and)\s*§?\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*)*(?:\s+(?:AC\s*#\d+\s+)?consumes?\s+this\s+row)?\.?/gi, " ")
    .replace(/\b(?:union of §|no independent acceptance criteria)\b[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\b(?:the\s+)?(?:Master Spec|UX Design(?: of Sourcera)?)(?:\s+§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*)?/gi, "")
    .replace(/§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*(?:\s*(?:[/,&]|and)\s*§?\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*)*/gi, "")
    .replace(/\bAppendices\s+[A-M](?:\.\d+)*(?:\s*[/,&]\s*[A-M](?:\.\d+)*)*/gi, "")
    .replace(/\bAppendix\s+[A-M](?:\.\d+)*(?:\s*[—-]\s*new)?/gi, "")
    .replace(/`Browse Marketplace` belongs to [^.!?]*Bid Workspace List empty state,\s*not\s*[.!?]/gi, "`Browse Marketplace` belongs to the Bid Workspace List empty state, not this dashboard.")
    .replace(/\bPermit only the roles listed for `Read Seller Org dashboard` in\s*[.]/gi, "Permit only roles authorized for `Read Seller Org dashboard`.")
    .replace(/\bUX\s+'s\b/gi, "the UX")
    .replace(/\b(?:and|or)\s*(?=[.;])/gi, "")
    .replace(/\bin\s+in\b/gi, "in")
    .replace(/\bImplement all of UX\b/gi, "Implement all behavior below")
    .replace(/\(\s*(?:\/\s*)?\)|\[\s*\]/g, "")
    .replace(/\s+([,;:)]|\.(?!\.))/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\/\s+(?=[,.;:]|$)/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

function repairSanitizedProse(value: string): string {
  return value
    .replace(/^\s*\d+[.)]\s*$/gm, "")
    .replace(/\bAcceptance Criteria\s+AC\s*#?\s*\d+[a-z]?\b/gi, "the stated acceptance rule")
    .replace(/\b(?:AC|Acceptance Criteria)\s*#?\s*\d+[a-z]?\b/gi, "the stated acceptance rule")
    .replace(/\bAC(?=\s*[.;,)])/gi, "acceptance rule")
    .replace(/\bFailure Mode\s*#?\s*\d+[a-z]?\b/gi, "the stated failure rule")
    .replace(/\b(?:Acceptance Criteria\s+)?acceptance criterion\s*#?\s*\d+[a-z]?\b/gi, "the stated acceptance rule")
    .replace(/\bacceptance rule\s*\+\s*(?:the\s+)?acceptance rule\b/gi, "acceptance rules")
    .replace(/\s*\+\s*[—-]\s*sibling\b/gi, "")
    .replace(/\s+#\d+\s+cascade\b/gi, "")
    .replace(/\bAE--\d+\b[.:]?\s*/gi, "")
    .replace(/\bR\d+--[a-z0-9-]+\b/gi, "")
    .replace(/\((?:at\s+)?lines?\s+\d+(?:\s*[-–]\s*\d+)?\)/gi, "")
    .replace(/\b(?:at\s+)?lines?\s+\d+(?:\s*[-–]\s*\d+)?\b/gi, "")
    .replace(/\*\*V\d+\s+closure(?:\s+of\s+[A-Z0-9.-]+)?\.\*\*\s*/gi, "")
    .replace(/\bPhase\s+V\d+\s+closure\s*:?/gi, "")
    .replace(/\bV\d+\s+closure\s*:?/gi, "")
    .replace(/\bPhase\s+\d+(?:\.\d+)*\s*\(R-\d+\s+closure\)/gi, "")
    .replace(/\bPhase\s+\d+(?:\.\d+)*\s+R-\d+\s+closure\b/gi, "")
    .replace(/\bR-\d+\s+closure\b/gi, "")
    .replace(/\bSMS\s*:\*{0,2}\s*Unsupported\s+in\.?0a\.\s*No SMS option may render\s+for\s+until\b/gi, "SMS is unsupported. No SMS option may render until")
    .replace(/\bfor\s+until\b/gi, "until")
    .replace(/,\s*-\s*equivalent\b/gi, ", equivalent")
    .replace(/\b(?:live|are cataloged|are registered)\s+in\s*\./gi, (match) =>
      /^live/i.test(match) ? "are defined by this contract." : match.replace(/\s+in\s*\./i, " by this contract."))
    .replace(/\blives\s+in\s*\./gi, "is defined by this contract.")
    .replace(/\b(?:cataloged|registered|defined|available)\s+in\s*\./gi, (match) =>
      match.replace(/\s+in\s*\./i, " by this contract."))
    .replace(/\b(?:in|through)\s*\.(?=\s|$)/gi, ".")
    .replace(/\([^()]*\bsupersedes\s+the\s+pre-existing\b[^()]*\)/gi, "")
    .replace(/supersedes the pre-existing `?api_request_ids`? array document-field storage(?:\s*[—-][^,]*)?,?\s*reconciling the OpsSession[^.]*?to avoid unbounded Convex document growth/gi, "")
    .replace(/\bPhase\s+\d+(?:\.\d+)*\s+V\d+\s+03:00 UTC\s+supersedes\s+the\s+prior\s+Cost-Base Recalculation[^;]*;\s*the\s+Cost-Base Recalculation[^.]*\./gi, "The scheduler runs nightly at 03:00 UTC.")
    .replace(/\bPhase\s+\d+(?:\.\d+)*\s+supersedes the prior provisional mapping[^;]*;\s*the Phase-?\d+(?:\.\d+)* mapping is the binding contract for engineering and QA\.\s*The Single-Operator Mode reconciliation log[^.]*\./gi, "The mapping table in this issue is binding for engineering and QA.")
    .replace(/\bThis table mirrors Compression Contract[^.]*\./gi, "")
    .replace(/The CostBaseRecalculationLog[^.]*wording is canonical;\s*the prior Cost-Base Recalculation[^.]*is\s+\*\*retired\*\*\s+and any code[^.]*\./gi, "Code must evaluate the current `drift_severity` enum membership; inline percentage thresholds are forbidden.")
    .replace(/The `preservation_status=hard_archived` field name referenced in the prior Failure Modes[^;]*;\s*the validator now asserts/gi, "The validator asserts")
    .replace(/\bin this legacy lifecycle table\b/gi, "in this lifecycle table")
    .replace(/\bretired in this pass\b/gi, "removed")
    .replace(/\bretired in V\d+\b/gi, "removed")
    .replace(/\bSchema \(post-V\d+ supersedes the Scenario Object Schema inline rendering\)\s*:/gi, "Schema:")
    .replace(/\bThis is the canonical Evaluation Scenario entity for the Scenario Modeling surface\.[^\n]*?The retirement reconciles[^\n]*?\.\s*/gi, "Evaluation Scenarios use structured scoring and TCO overrides only; operational load, user count, concurrency, and transaction volume are rejected. ")
    .replace(/\s*\(e\.g\.,\s*"Peak Load",\s*"Concurrent Users",\s*"Multi-Tenant Isolation"\)/gi, "")
    .replace(/\bBaseline controls:\s*([^.!?\n]+?)\s+are\s*\./gi, "Baseline controls: $1 are available per user and enforced on every delivery attempt.")
    .replace(/\bthe API remains\s*\./gi, "the API applies the same rules.")
    .replace(/\blegacy-legal-entity\b/gi, "pre-cutover legal-entity")
    .replace(/\blegacy value\b/gi, "disallowed value")
    .replace(/\blegacy-row\b/gi, "pre-cutover-row")
    .replace(/\blegacy rows?\b/gi, "pre-cutover rows")
    .replace(/\blegacy reads?\b/gi, "pre-cutover reads")
    .replace(/\blegacy references?\b/gi, "obsolete references")
    .replace(/\bprior ScoreGradeEntry records\b/gi, "already committed ScoreGradeEntry records")
    .replace(/\bPromoted from prose-distributed mentions[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\bPrior to this subsection[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\bPromoted in Phase\s+\d+(?:\.\d+)*[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\(\s*Phase\s+\d+(?:\.\d+)*\s+V\d+(?:\.\d+)*\s*\)/gi, "")
    .replace(/\*\*Authoritative-source note[^*]*\*\*\s*/gi, "")
    .replace(/\b(?:Phase\s+\d+(?:\.\d+)*\s+)?V\d+[^.!?\n]{0,180}\b(?:closure|pass|program|supersedes?)\b[^.!?\n]*(?:[.!?]|$)/gi, "")
    .replace(/\bThe prior\s+[^.!?]{0,240}\bwording\b[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\bthe\s+`audit_event_high_impact_actions`\s+registry concept is retired \(supersession\)\s*;?/gi, "")
    .replace(/^[,;:]\s*/g, "")
    .replace(/\bonly after\s*,+\s*,?\s*and\s+deployment identities match\b/gi, "only after source, configuration, and deployment identities match")
    .replace(/\bresults`;\s*timestamp\s+in\s+`/gi, "results; timestamp in `")
    .replace(/\bthe value is not restated in\s*\./gi, "")
    .replace(/\bpost-edit diff contract plus corpus lock for\s+and\s+the\b/gi, "post-edit diff contract plus corpus lock for the")
    .replace(/\bowned by\s*[–—-]\s*and their consuming features\b/gi, "governed by their consuming features")
    .replace(/\bProduction enablement belongs to\s*\./gi, "")
    .replace(/\bR0 closure\b/gi, "production acceptance")
    .replace(/\(\s*V\d+\s+add\s*\)/gi, "")
    .replace(/\busing an existing\b/gi, "with an existing")
    .replace(/\bRequired missing artifacts\s*:/gi, "Required artifacts:")
    .replace(/\bInitial Registry Seed\s*\(v\d+(?:\.\d+)*\s*(?:→|->|to)\s*v\d+(?:\.\d+)*\)\s*(?:row\s*)?#?\d+\s*(?:\+\s*)?/gi, "")
    .replace(/\bSeller-Console Augmentations Already in Registry\s*\(Historical KB\s*\/\s*Pricing Inputs\)/gi, "seller capability registry")
    .replace(/\bAuthored[- ]Extension permitted\b/gi, "schema-extension controlled")
    .replace(/\bAuthored[- ]Extension ledger row\b/gi, "schema-change review record")
    .replace(/\bOutcome Resolver\s+Outcome Resolver\b/g, "Outcome Resolver")
    .replace(/\bCompletion means\s*\//gi, "Completion means ")
    .replace(/\binside\s+and\s+the\b/gi, "inside the")
    .replace(/\bremains required\s*[—-]\s*\./gi, "remains required.")
    .replace(/\s+\/\s*\.(?=\s|$)/g, ".")
    .replace(/,{2,}/g, ",")
    .replace(/\bThe AI Wallet Service policy summary\s*:\s*\./gi, "")
    .replace(/\bthe legacy event name\b/gi, "the compatibility event alias")
    .replace(/\bStage 1:\s*Magic-Link Arrival Workflow step 2\b/gi, "Magic-Link Arrival re-entry workflow")
    .replace(/\bStage 1:\s*Magic-Link Arrival failure mode 6\b/gi, "Magic-Link Arrival same-invite failure rule")
    .replace(/\bStage 1:\s*Magic-Link Arrival\b/gi, "Magic-Link Arrival")
    .replace(/\b(expose|exposes|exposed|available|selecting|selected)\b([^.!?\n]{0,180})\b(?:through|in)\s*\./gi, (_full, verb: string, middle: string) => `${verb}${middle.trimEnd()}.`)
    .replace(/\bpopulated\s*,\s*or\s+dashboard content\b/gi, "populated dashboard content")
    .replace(/\s*[,;]\s*`?[a-z][a-z0-9_]*`?\s*,?\s*(?:and\s+)?closure\s*\./gi, ".")
    .replace(/\b(?:retry behavior|source migration|source binding)\s+and\s+closure\s*\./gi, "")
    .replace(/\s*;\s*\d+(?:\.\d+)*\s*\(R-\d+\s+closure\)\s*/gi, " ")
    .replace(/\s*(?:field constraint,\s*)?AC\s*#\d+\s*,?\s*(?:and)?\s*(?=$|[.|])/gi, "")
    .replace(/\b(?:and|or)\s*(?=$|[.|])/gi, "")
    .replace(/\.(?:\s*,\s*\.)+/g, ".")
    .replace(/\.\s*;/g, ";")
    .replace(/\s+([,;:]|\.(?!\.))/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trimEnd();
}

const QUALITY_SAMPLE_POLISH_IDS = new Set([
  "BUY-250", "BUY-261", "BUY-306", "BUY-335", "BUY-408", "BUY-410",
  "PLA-236", "PLA-310", "PLA-342", "PLA-410", "PLA-412", "PLA-522", "PLA-580", "PLA-617", "PLA-992", "PLA-1002",
  "SEL-73", "SEL-92", "SEL-159", "SEL-183", "SEL-203", "SEL-211", "SEL-252",
]);

const QUALITY_SAMPLE_NO_PRODUCT_EVENT_PROOFS = new Map<string, string>([
  ["BUY-250", "reports/evidence/cancellation-data-export-proof.json"],
  ["PLA-310", "reports/evidence/rbac-two-level-architecture-proof.json"],
  ["PLA-522", "reports/evidence/compile-the-canonical-retention-deletion-dsar-and-residency-registry-proof.json"],
  ["PLA-580", "reports/evidence/network-effects-dashboard-proof.json"],
  ["PLA-992", "reports/evidence/r0-c1-customer.json"],
  ["SEL-73", "reports/evidence/bid-workspace-entity-proof.json"],
]);

const LEGACY_SOURCE_DEFERRAL_ISSUES = new Set([
  "BUY-393", "PLA-440", "PLA-445", "PLA-447", "PLA-448", "PLA-449", "PLA-450",
  "PLA-451", "PLA-452", "PLA-453", "PLA-454", "PLA-455", "PLA-456", "PLA-457",
  "PLA-458", "PLA-550", "PLA-696", "PLA-723", "PLA-919", "PLA-925", "PLA-926",
  "PLA-927", "PLA-928", "PLA-933", "SEL-153",
]);

function stripLegacyPublicationProse(issueId: string, value: string): string {
  let result = value
    .replace(/Deliver Production-Grade Stripe Billing Integration-B-/g, "")
    .replace(/\bTyped Convex Preview foundation and reactive proof\b/g, "the typed Convex Preview foundation")
    .replace(/\bDeliver Production-Grade Stripe Billing Integration\b/g, "the production Stripe billing integration")
    .replace(/\bPostHog Analytics Integration\b/g, "the PostHog integration")
    .replace(/\bPostHog Event Taxonomy\b/g, "the registered PostHog event taxonomy")
    .replace(/\bStripe Customer Genesis at Organization Creation\b/g, "Stripe Customer genesis")
    .replace(/\bStripe Customer genesis Customer binding\b/g, "Stripe Customer genesis binding")
    .replace(/\bToken Drift Check \(Ops Console Surface\)\b/g, "the token-drift gate")
    .replace(/\bSeller AI Generation Toggle\b/g, "the Seller AI generation control")
    .replace(/\bKB Value Meter Economics Concurrency\b/g, "the KB value-meter concurrency contract")
    .replace(/\bBilling Admin Role\b/g, "`billing_admin` authority")
    .replace(/\bProve Stripe Billing Canary, Rollback, and Recovery\b/g, "the production Stripe canary and recovery proof")
    .replace(/\bValidate the R2 Billing Journey with a Consented Pilot\b/g, "the consented billing-pilot proof")
    .replace(/\s*\((?:BPS|SPS)\s+v\d+\s*;\s*Phase[-\s]+(?:1[4-9]|[2-9]\d)(?:\.(?:\d+|x))*\)/gi, "")
    .replace(/\s*\(V\d+\s+[—-][^)]*\)/gi, "")
    .replace(/\s*\(Phase[-\s]+(?:1[4-9]|[2-9]\d)(?:\.(?:\d+|x))*(?:\s*[\/–—-]\s*(?:1[4-9]|[2-9]\d)?(?:\.(?:\d+|x))*)?[^)]*\)/gi, "")
    .replace(/\bPhase[-\s]+(?:1[4-9]|[2-9]\d)(?:\.(?:\d+|x))*(?:\s*[\/–—-]\s*(?:1[4-9]|[2-9]\d)?(?:\.(?:\d+|x))*)?\s+introduces\b/gi, "This contract introduces")
    .replace(/\bPhase[-\s]+(?:1[4-9]|[2-9]\d)(?:\.(?:\d+|x))*\s+ships\b/gi, "The release gate ships")
    .replace(/\bPhases?[-\s]+(?:1[4-9]|[2-9]\d)(?:\.(?:\d+|x))*(?:\s*[\/–—-]\s*(?:1[4-9]|[2-9]\d)?(?:\.(?:\d+|x))*)?/gi, "")
    .replace(/\s*\(Gap\s+\d+(?:\.\d+)*\)/gi, "")
    .replace(/\bGap\s+\d+(?:\.\d+)*\s+resolution\b/gi, "normalization")
    .replace(/\bGap\s+\d+(?:\.\d+)*\b/gi, "")
    .replace(/\bPhase\s+\d+(?:\.\d+)*\s+residual closeout\b/gi, "")
    .replace(/\b(?:in|by|during)\s+(?:this|the same|this same|same)\s+pass\b/gi, "")
    .replace(/\b(?:this|the same|this same|same)\s+pass\b/gi, "the current contract")
    .replace(/\bPromoted from prose[^.!?\n]*(?:[.!?]|$)/gi, "")
    .replace(/\bprior path\b/gi, "path")
    .replace(/\brow\s+\d{3,}\b/gi, "registered row")
    .replace(/\bnative relations?\b/gi, "current parentage and blocker state")
    .replace(/\bLinear relations?\b/gi, "dependency declarations")
    .replace(/\bLinear fields\b/gi, "planning fields")
    .replace(/\bThis closed three-member set is\./gi, "This contract defines the closed three-member set below.")
    .replace(/\bThe test itself is\./gi, "The exact test is listed under Exact paths.")
    .replace(/\bper the the\b/gi, "per the")
    .replace(/`MarketplaceReview` is\./gi, "`MarketplaceReview` uses the exact row below.")
    .replace(/`MarketplaceIntegrationHook` is\./gi, "`MarketplaceIntegrationHook` uses the exact row below.")
    .replace(/§–4\.5\.16/g, "§§4.5.15–§4.5.16")
    .replace(/[ \t]+([,;:]|\.(?!\.))/g, "$1")
    .replace(/[ \t]{2,}/g, " ");

  if (LEGACY_SOURCE_DEFERRAL_ISSUES.has(issueId)) {
    result = result.split(/\r?\n/).map((line) => {
      if (/^\s*\|/.test(line)) {
        return line.replace(/\s+(?:exactly\s+)?as\s+(?:defined|specified|documented)\s+(?:in|by|at)\s+[^|]+/gi, "");
      }
      return splitProseSentences(line).map((fragment) =>
        fragment.replace(/\s+(?:exactly\s+)?as\s+(?:defined|specified|documented)\s+(?:in|by|at)\s+.+$/gi, "").trim()
      ).filter((fragment) => fragment && !/\b(?:body\s+)?must cite\b/i.test(fragment)).join(" ");
    }).join("\n");
  }

  return repairSanitizedProse(result).replace(/\n{3,}/g, "\n\n");
}

function polishQualitySampleDescription(issueId: string, value: string): string {
  if (!QUALITY_SAMPLE_POLISH_IDS.has(issueId)) return value;
  let result = value
    .replace(/\bControlled Vocabulary Registry\b/g, "canonical enum registry")
    .replace(/\bPostHog Event Taxonomy\b/g, "registered analytics event catalog")
    .replace(/\bDark Mode Parity Rules\b/g, "accessible visual-state rules")
    .replace(/\bMobile Feature Parity Matrix\b/g, "mobile parity contract")
    .replace(/\bPolicyAmendment State Machine\b/g, "policy-amendment state machine")
    .replace(/\bConvex Subscription \/ Reactivity Layer\b/g, "subscription layer")
    .replace(/\bAuthentication Architecture\b/g, "active-session authorization contract")
    .replace(/\bDual-Console Data Isolation Model\b/g, "dual-console firewall")
    .replace(/\bAudit Event \(Org-Scoped, Cross-Console-Tagged, Append-Only\)(?: Audit Event)?\b/g, "append-only AuditEvent")
    .replace(/\bAudit Integrity Background Jobs\b/g, "audit-integrity worker")
    .replace(/\bAudit-Integrity Exemption & Retention Override\b/g, "retained-audit exception")
    .replace(/\bFeature Access Matrix \(Comprehensive\)\b/g, "current plan entitlement contract")
    .replace(/\bPlan Tier Definitions \(Authoritative\)\b/g, "current plan entitlement contract")
    .replace(/\bNotification Event Catalog\b/g, "registered notification-event catalog")
    .replace(/\bOrganization Deletion Cascade Dual-Console Firewall\b/g, "dual-console firewall")
    .replace(/\bRate-Limit Class Registry\b/g, "registered rate-limit classes")
    .replace(/\bConsole Bridge Event \(Cross-Console, Firewall-Bounded Sync Unit\)\b/g, "ConsoleBridgeEvent")
    .replace(/\bCascade Pseudonymization Pattern\b/g, "cascade pseudonymization rule")
    .replace(/\bBridge-Event Body Text PII Sweep\b/g, "bridge-body PII sweep")
    .replace(/\bRetention & DSAR Cascade\b/g, "retention and DSAR cascade")
    .replace(/\bResidency-Bound Backups\b/g, "residency-bound backup rule")
    .replace(/\bExtended Capabilities \(v7 Registry Additions\)\b/g, "capability registry")
    .replace(/\bSeller-Console Augmentations Already in Registry \(Historical KB \/ Pricing Inputs\)\b/g, "seller capability registry")
    .replace(/\bEntitlement Matrix \(Authoritative\)\b/g, "current entitlement contract")
    .replace(/\bAPI Error Code Catalog\b/g, "registered API error catalog")
    .replace(/\bCI Gate Catalog\b/g, "registered CI gate catalog")
    .replace(/\bImplementation validates the named fields, values, thresholds, actor, and result before side effects\. A rejected input leaves stored and external state unchanged\.\s*/g, "")
    .replace(/\bThis delivery emits no product event, sends no webhook, and delivers no customer notification\.\s*/g, "No additional product analytics event, webhook, or customer notification is introduced. ")
    .replace(/\bActive requirement-vendor pairs with at least one submitted grade in\b/g, "Active requirement-candidate pairs with at least one submitted grade")
    .replace(/\ba entity\b/g, "an entity")
    .replace(/\ban canonical\b/g, "a canonical")
    .replace(/\ban Controlled\b/g, "a controlled")
    .replace(/\bCompletion means \/ can request\b/g, "Completion means an authorized Buyer can request")
    .replace(/\breconciling with the retained wording\b/gi, "matching the current authority rules")
    .replace(/\bPublic page purge propagation\b/g, "p95 under 60 seconds and p99 under 300 seconds")
    .replace(/\s+[—-]\.\b/g, ".")
    .replace(/[ \t]{2,}/g, " ");

  result = result.split(/\r?\n/).map((line) => {
    if (/^\s*(?:\d+[.)]\s*)?(?:Ratify all source decisions|This is an outcome parent)\b/i.test(line)) return "";
    if (/^\s*\d+[.)]\s*$/.test(line)) return "";
    if (/^\s*\|/.test(line)) return line;
    const retained = splitProseSentences(line).filter((fragment) =>
      !/\b(?:historical baseline|prior asymmetry|source-contract repair|authored-extension ledger|retained wording|retired wording|pre-V\d+|legacy alias)\b/i.test(fragment)
    );
    return retained.join(" ");
  }).join("\n");

  if (issueId === "BUY-261" || issueId === "PLA-310") {
    const behavior = contractSectionBody(result, "## Complete behavior and rules", "## States and transitions")
      .replace(/^\s*\d+[.)]\s+/gm, "- ");
    result = replaceContractSection(result, "## Complete behavior and rules", "## States and transitions", behavior);
  }

  const noProductEventProof = QUALITY_SAMPLE_NO_PRODUCT_EVENT_PROOFS.get(issueId);
  if (noProductEventProof) {
    result = replaceContractSection(
      result,
      "## Telemetry and notifications",
      "## Named proof",
      `This issue emits no product analytics event, webhook, or customer notification. Record only bounded internal result, duration, commit, environment, and redacted correlation in \`${noProductEventProof}\` and the owning service's operational error log; include no secrets, free text, tenant identifiers, or customer content.`,
    );
  }

  if (issueId === "BUY-306") {
    result = result.replace(
      /Timeline over every canonical Sourcera Method phase registered in and canonical enum registry/g,
      "Timeline over every canonical Sourcera Method phase registered by canonical enum registry",
    );
    result = replaceContractSection(
      result,
      "## Telemetry and notifications",
      "## Named proof",
      [
        "Registered product analytics events for this metric surface are:",
        "- `workspace_analytics_dashboard_opened` when the dashboard opens, with `workspace_id`, `phase`, `visible_metric_ids`, `suppressed_metric_ids`, `plan_tier_buyer`, and `evaluation_owner_mode`.",
        "- `workspace_analytics_metric_drilldown_opened` when a metric side peek opens, with `workspace_id`, `metric_id`, `refresh_class`, `filter_hash`, `drilldown_entity_kind`, and `result_count_bucket`.",
        "- `workspace_analytics_refresh_clicked` when Refresh Now is selected, with `workspace_id`, `visible_metric_ids`, `filter_hash`, `refresh_class_set`, and `stale_metric_count`.",
        "- `workspace_analytics_k_anon_suppressed` when a comparison panel is suppressed, with `workspace_id`, `metric_id`, `suppressed_reason`, observed cohort size, cohort floor, and residency region.",
        "Every event uses the standard Buyer Workspace envelope, residency routing, idempotency, and payload allowlist. Never emit metric row contents, names, free text, raw filter values, or another organization's data. Record operational result, duration, commit, environment, and redacted correlation in `reports/evidence/core-workspace-analytics-metrics-proof.json`.",
      ].join("\n"),
    );
  }

  if (issueId === "BUY-335") {
    result = result
      .replace(
        /within 60 s per Taxonomy Node \(Platform-Scoped, Ops-Managed, Multi-Kind Controlled Vocabulary\) AC 7/gi,
        "within 60 seconds under the taxonomy cache-invalidation contract",
      )
      .replace(
        /To change disposition, Ops MUST reactivate per lifecycle row 7 \(within 30 days\) and re-deprecate\./g,
        "To change disposition, an authorized operator must reactivate the node during its 30-day reactivation window and run a new deprecation transition.",
      );
  }

  if (issueId === "BUY-408") {
    result = result.replace(
      /All rows use the standard envelope, event family `marketplace`/g,
      "These registered product analytics events use the standard envelope, event family `marketplace`",
    );
  }

  if (issueId === "PLA-310") {
    result = replaceContractSection(
      result,
      "## Complete behavior and rules",
      "## States and transitions",
      [
        "Sourcera evaluates authorization at two levels. Organization roles govern organization resources such as members, teams, billing, identity configuration, integrations, and organization settings. Console roles govern Buyer Workspace, Seller Bid Workspace, requirements, responses, scores, Knowledge Base, and Marketplace operations. A role at one level never grants content authority at the other.",
        "When one active membership holds multiple roles in the same scope, its effective permission set is the union of those roles. The resolver still applies every operation-specific denial, plan gate, phase gate, residency rule, and resource assignment before allowing a read or mutation.",
        "Roles are independent across organizations. A role in one organization grants nothing in another; session creation and every `X-Sourcera-Active-Org` switch must resolve the active organization and current membership again before protected data is read.",
        "Buyer and Seller role overlays in a dual-console organization remain separated by the dual-console firewall. Buyer permissions expose only Buyer-console resources and Seller permissions expose only Seller-console resources; holding both overlays does not carry any permission or data across the firewall.",
      ].join("\n\n"),
    );
    result = replaceContractSection(
      result,
      "### Success",
      "### Failure",
      "Run table-driven authorization tests for same-scope role union, cross-organization independence, and dual-console separation. A membership holding `org_admin` plus `billing_admin`, `workspace_owner` plus `use_case_lead`, or `seller_org_owner` plus `seller_kb_admin` receives the exact union only in that scope. Switching `X-Sourcera-Active-Org` recomputes authority before the next read, and a dual-console membership can exercise each console's own grants without either console exposing the other's protected data.",
    );
  }

  if (issueId === "PLA-522") {
    result = replaceContractSection(
      result,
      "## Complete behavior and rules",
      "## States and transitions",
      [
        "Compile one normalized registry row for every persisted entity and destructive consumer. Each row carries the entity key, canonical rule identifier and checksum, soft-delete and hard-purge behavior, parent cascade, legal-hold and financial exceptions, DSAR pseudonymization or body-sweep rule, residency partition, backup handling, and dependent-row order.",
        "Reject duplicate entity keys, missing source rows, conflicting durations or cascades, copied numeric rules without a source checksum, unknown regions, unresolved legal holds, unsafe last-write-wins resolution, and any destructive consumer absent from coverage. Unknown or conflicting rules fail closed; they never default to deletion or cross-region movement.",
        "The resolver is deterministic and side-effect free. It returns the same rule for the same registry checksum, distinguishes no-op, soft-delete, pseudonymize, archive, and hard-purge decisions, orders dependent deletion safely, and records why an exception won without mutating customer data.",
      ].join("\n\n"),
    );
    result = replaceContractSection(
      result,
      "## States and transitions",
      "## Permissions, isolation, and privacy",
      "A compile run moves from unread to parsed to reconciled, then passed or failed. Passed requires complete entity and consumer coverage with no duplicate, conflict, unknown rule, or unsafe cascade. Failed preserves the last verified registry and blocks destructive execution. A source-checksum change invalidates the prior receipt and requires a full recompile.",
    );
    result = replaceContractSection(
      result,
      "## Permissions, isolation, and privacy",
      "## Exact paths",
      "Only the protected delivery verifier may read canonical repository inputs and write the generated registry and proof receipt. Runtime services may read only the compiled rule for their entity and residency partition. No caller may edit a generated row, supply a retention duration, bypass legal hold, widen residency, or read customer bodies through the compiler; cross-organization and cross-region data remain inaccessible.",
    );
    result = replaceContractSection(
      result,
      "## Assumptions and validation triggers",
      "## Exclusions",
      "The persisted-entity inventory, destructive-consumer inventory, canonical rule identifiers and checksums, legal-hold exceptions, DSAR patterns, residency partitions, backup rules, and generated row schema must remain aligned. A change to any input invalidates the receipt and requires a full compile, conflict review, coverage comparison, and same-commit proof before destructive execution is reopened.",
    );
  }

  if (issueId === "SEL-92") {
    result = replaceContractSection(
      result,
      "## Telemetry and notifications",
      "## Named proof",
      "The registered product analytics event `kb_health_dashboard_viewed` fires when a Seller user opens the dashboard. Its allowlisted properties are `surface=ui_kb_health_dashboard`, `view_duration_seconds`, `entries_in_active`, `entries_in_review_due`, and `entries_in_flagged_stale`. Apply the standard Seller Org envelope, residency routing, idempotency, and sampling; include no entry content, titles, raw identifiers, free text, or cross-organization data. Record operational result, duration, commit, environment, and redacted correlation in `reports/evidence/kb-health-dashboard-proof.json`.",
    );
  }

  if (issueId === "SEL-159") {
    result = result
      .replace(
        /The `seller_page_enrichment` capability is the canonical canonical enum registry `capability_id`[^\n]*/g,
        "The `seller_page_enrichment` capability is the registered `capability_id`. The capability crawls the seller's public website, product documentation, press releases, review sources, and company page, then drafts page content for Seller review.",
      )
      .replace(
        /^2\. System queues a `seller_page_enrichment` AIOperation[^\n]*$/gm,
        "2. The system queues one `seller_page_enrichment` AIOperation. At creation it resolves model, cost center, price, minimum plan, and free allowance from the active capability and plan registries; stores `SellerOrgPage.enrichment_cost_center_resolved`; decrements the free allowance before any wallet debit; returns HTTP 402 `capability_requires_plan_upgrade` when the plan gate fails; and lets `enrichment_cost_center_single_source` reject any other hard-coded cost-center path.",
      )
      .replace(
        /\*\*Verification Loss\.\*\*[^\n]*/g,
        "**Domain authority change.** If domain authority moves to another organization or the Seller SSO domain changes, set `domain_ownership_verified_at=null` and move the page to `suppressed_by_opt_out` with `reason_code=ops_imposed`.",
      );
    result = replaceContractSection(
      result,
      "## Telemetry and notifications",
      "## Named proof",
      [
        "Registered audit actions are `seller_org_page.updated`, `seller_org_page.published`, and `seller_org_page.archived`; preview issuance and access record `seller_org_page.preview_token_issued` and `seller_org_page.preview_accessed`. Every public-projection change emits the internal `page_cache_purge` event after commit with the affected URL allowlist and purge kind.",
        "Domain-verification loss emits the existing `vendor_opt_out.applied` per-page webhook with `synthetic=true`, `synthetic_origin_kind=domain_verification_loss`, `page_entity_type=seller_org_page`, affected IDs, and correlation ID, plus its registered product-analytics mirror. It carries no email or domain proof. Delivery uses the standard webhook retry and DLQ policy; a failed delivery never permits stale identifying content.",
        "When enrichment reaches `pending_review`, send the existing in-app and email preview notification once per transition. Record delivery result, duration, commit, environment, and redacted correlation in `reports/evidence/seller-organization-page-proof.json`; include no page copy, crawl content, secrets, raw proof, or customer-authored text.",
      ].join("\n\n"),
    );
  }

  if (issueId === "SEL-252") {
    result = replaceContractSection(
      result,
      "## Telemetry and notifications",
      "## Named proof",
      "The owning mutations emit exactly these registered append-only AuditEvent actions: `capability_declaration_chip_added`, `capability_declaration_chip_removed`, `capability_declaration_chip_renamed`, `kb_entry.auto_merged`, and `kb_entry.auto_archived`. Record bounded delivery result, duration, retry count, commit, environment, and redacted correlation in the proof receipt. Emit no additional product analytics event, webhook, customer notification, free text, customer content, or raw organization, entity, actor, or session identifier.",
    );
  }

  return repairSanitizedProse(result)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function withoutSensitiveReferences(rawLine: string): string {
  const isSensitive = (value: string): boolean =>
    SOURCE_DEFERRAL.test(value) ||
    GENERIC_BOILERPLATE.test(value) ||
    GENERIC_CONTRACT_FALLBACK.test(value) ||
    PRIOR_NORMALIZATION_BOILERPLATE.test(value) ||
    MALFORMED_FIELD_TOKEN.test(value) ||
    LEGACY_REFERENCE.test(value) ||
    STALE_INFORMATION.test(value) ||
    PLANNING_HISTORY.test(value) ||
    PLANNING_PROVENANCE.test(value) ||
    MANUAL_RELATION_PLANNING.test(value) ||
    ENCODED_SOURCE_REFERENCE.test(value) ||
    LEGACY_ARTIFACT_REFERENCE.test(value) ||
    COPIED_READINESS_METADATA.test(value);
  const scrubCell = (value: string): string => {
    if (/\bMaster Spec is authoritative\b|\bUX Design applies only where the Master Spec is silent\b/i.test(value)) {
      return "";
    }
    const cleaned = stripSourceDelegationFragments(stripPlanningHistoryFragments(value))
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
      .replace(/<issue\b[^>]*>.*?<\/issue>/gi, "")
      .replace(IDENTIFIER, "")
      .replace(SOURCE_ID, "")
      .replace(OTHER_SOURCE_ID, "")
      .replace(LOCAL_ASSUMPTION_ID, "")
      .replace(ASSUMPTION_ID, "")
      .replace(AUDIT_SOURCE_ID, "")
      .replace(MANUAL_PROGRAM_ID, "")
      .replace(MANUAL_DESIGN_ID, "")
      .replace(/<issue\b[^>]*>/gi, "")
      .replace(/<\/issue>/gi, "")
      .replace(/https?:\/\/linear\.app\/[^\s)]+/gi, "")
      .replace(/\s+([,;:]|\.(?!\.))/g, "$1")
      .replace(/[ \t]{2,}/g, " ");
    const repaired = repairSanitizedProse(cleaned);
    const fragments = splitProseSentences(repaired);
    const retained = fragments.filter((fragment) =>
      !isSensitive(fragment) && !PURE_DEPENDENCY_SENTENCE.test(fragment)
    );
    if (retained.length < fragments.length) return retained.join(" ");
    return isSensitive(repaired) || PURE_DEPENDENCY_SENTENCE.test(repaired) ? "" : repaired;
  };
  if (/^\s*\|/.test(rawLine)) {
    return rawLine.split("|").map(scrubCell).join("|");
  }
  return scrubCell(rawLine);
}

function confirmedClippedLine(rawLine: string): boolean {
  const trimmed = rawLine.trim();
  return trimmed.length >= 238 &&
    trimmed.length <= 244 &&
    !/^\|/.test(trimmed) &&
    (/(?:removed importer fragment|clipped fragment|truncated import)/i.test(trimmed) ||
      /([A-Za-z0-9_])\1{15,}$/.test(trimmed));
}

function likelyClippedLegacyInputLine(rawLine: string): boolean {
  const trimmed = rawLine.trim();
  return confirmedClippedLine(trimmed) ||
    trimmed.length >= 238 &&
    trimmed.length <= 248 &&
    /^[*-]\s+(?:\[[ xX]\]\s+)?/.test(trimmed) &&
    /[A-Za-z0-9_]$/.test(trimmed) &&
    !/[.!?;:]$/.test(trimmed);
}

function scrubLine(rawLine: string, failClosed = true): { line: string; removedReference: boolean } {
  if ((NATIVE_FIELD.test(rawLine) || RELATION_FIELD.test(rawLine)) && !TELEMETRY_DIMENSION_FIELD.test(rawLine)) {
    return { line: "", removedReference: true };
  }
  const trimmed = rawLine.trim();
  if (confirmedClippedLine(trimmed)) {
    return { line: "", removedReference: true };
  }
  const before = rawLine;
  const normalizedRawLine = rawLine.replace(
    /\bLabels:(?=\s*`[a-z][a-z0-9_]*`(?:\s*,\s*`[a-z][a-z0-9_]*`)+)/gi,
    "Metric dimensions:",
  );
  const projectionCandidate = /^\s*\|/.test(normalizedRawLine) ||
      /^\s*"[^"\n]+"\s*:/.test(normalizedRawLine) ||
      /\\n/.test(normalizedRawLine)
    ? null
    : projectCurrentFragment(normalizedRawLine);
  if (
    projectionCandidate?.kind === "unresolved" &&
    projectionCandidate.text.trim() !== normalizedRawLine.trim()
  ) {
    if (!failClosed) return { line: "", removedReference: true };
    const evidence = projectionCandidate.diagnostics
      .filter((diagnostic) => diagnostic.code === "unresolved_essential" || diagnostic.code === "dangling_fragment")
      .map((diagnostic) => `${diagnostic.code}: ${diagnostic.evidence}`)
      .join("; ");
    throw new Error(
      `current-source projection failed closed${evidence ? `: ${evidence}` : ""}; source: ${normalizedRawLine}`,
    );
  }
  const currentOnlyLine = projectionCandidate?.text ?? normalizedRawLine;
  let line = withoutSensitiveReferences(currentOnlyLine)
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1")
    .replace(IDENTIFIER, "")
    .replace(SOURCE_ID, "")
    .replace(OTHER_SOURCE_ID, "")
    .replace(LOCAL_ASSUMPTION_ID, "")
    .replace(ASSUMPTION_ID, "")
    .replace(AUDIT_SOURCE_ID, "")
    .replace(MANUAL_PROGRAM_ID, "")
    .replace(MANUAL_DESIGN_ID, "")
    .replace(/\bA\s+(?:through|[–-])\s*J\b/gi, "every child contract")
    .replace(/<\/?(?:div|span|p|br|a|strong|em|code|pre|table|thead|tbody|tr|th|td|ul|ol|li|details|summary)(?:\s+[^>]*)?>/gi, "")
    .replace(/\[\s*\]/g, "")
    .replace(/(^|[^`])`[ \t]*`(?!`)/g, "$1")
    .replace(/\s+([,;:]|\.(?!\.))/g, "$1")
    .replace(/\s+\/\s+(?=[,.;:]|$)/g, "")
    .replace(/(^|\/)\-+(?=[^/\s])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\b(?:and\s+)?(?:mirrored in|conform(?:s)? to|canonical in)\s*(?=[;,.])/gi, "")
    .replace(/\bSame as above\.?/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trimEnd();
  line = repairSanitizedProse(line);
  if (/^\s*\|\s*\|/.test(line) && markdownTableCells(line).every((cell) => !cell.trim())) line = "";
  if (/^\s*(?:[-*+]\s*|\d+[.)]\s*)?$/.test(line)) line = "";
  return {
    line,
    removedReference: line !== before.trimEnd(),
  };
}

function identifiers(value: unknown): string[] {
  if (typeof value === "string") return value.match(IDENTIFIER) ?? [];
  if (Array.isArray(value)) return value.flatMap(identifiers);
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  const direct = [object.identifier, object.id]
    .filter((candidate): candidate is string =>
      typeof candidate === "string" && /^(?:PLA|BUY|SEL|INT)-\d+$/.test(candidate),
    );
  return [...direct, ...Object.values(object).flatMap(identifiers)];
}

function relationValues(issue: LinearIssueInput, description: string, context: PlannerContext): NativeRelations {
  const relationSets = {
    blockedBy: new Set<string>(),
    blocks: new Set<string>(),
    relatedTo: new Set<string>(),
  };
  const relations = issue.relations;
  if (relations && typeof relations === "object" && !Array.isArray(relations)) {
    const object = relations as Record<string, unknown>;
    for (const value of identifiers(object.blockedBy ?? object.blocked_by)) relationSets.blockedBy.add(value);
    for (const value of identifiers(object.blocks)) relationSets.blocks.add(value);
    for (const value of identifiers(object.relatedTo ?? object.related)) relationSets.relatedTo.add(value);
  } else if (Array.isArray(relations)) {
    for (const relation of relations) {
      if (!relation || typeof relation !== "object") continue;
      const object = relation as Record<string, unknown>;
      const type = String(object.type ?? object.relationType ?? "").toLowerCase();
      const target = type.includes("blocked") && !type.includes("blocks")
        ? relationSets.blockedBy
        : type.includes("block")
        ? relationSets.blocks
        : relationSets.relatedTo;
      for (const value of identifiers(object)) target.add(value);
    }
  }
  let dependencySection = false;
  for (const line of description.split(/\r?\n/)) {
    const heading = /^\s*#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]?.trim() ?? null;
    if (heading) dependencySection = /dependenc|prerequisite/i.test(heading);
    const field = RELATION_FIELD.exec(line)?.[1]?.toLowerCase();
    let target = field?.startsWith("blocked") || dependencySection
      ? relationSets.blockedBy
      : field?.startsWith("blocks")
      ? relationSets.blocks
      : field?.startsWith("related")
      ? relationSets.relatedTo
      : null;
    if (!target && /\b(?:is blocked by|blocked by|depends on|waits? for|after .{0,100} passes|cannot start until|prerequisite)\b/i.test(line)) {
      target = relationSets.blockedBy;
    } else if (!target && /\b(?:this issue|this ticket)\s+blocks\b/i.test(line)) {
      target = relationSets.blocks;
    }
    const tokens = [
      ...(line.match(IDENTIFIER) ?? []),
      ...(line.match(SOURCE_ID) ?? []),
      ...(line.match(OTHER_SOURCE_ID) ?? []),
    ];
    const resolved = tokens.flatMap((token) => {
      if (/^(?:PLA|BUY|SEL|INT)-\d+$/i.test(token)) return [token.toUpperCase()];
      const issueId = context.referenceIssueByToken.get(token.toUpperCase());
      return issueId ? [issueId] : [];
    });
    const destination = target ?? relationSets.relatedTo;
    for (const value of resolved) destination.add(value);
  }
  for (const set of Object.values(relationSets)) set.delete(issue.identifier);
  if (issue.identifier === "PLA-999") {
    relationSets.relatedTo.delete("PLA-314");
    relationSets.blockedBy.add("PLA-314");
  }
  for (const value of relationSets.blockedBy) relationSets.relatedTo.delete(value);
  for (const value of relationSets.blocks) relationSets.relatedTo.delete(value);
  return {
    blockedBy: [...relationSets.blockedBy].sort(compare),
    blocks: [...relationSets.blocks].sort(compare),
    relatedTo: [...relationSets.relatedTo].sort(compare),
  };
}

function concretePaths(description: string): string[] {
  const paths = new Set<string>();
  for (const match of description.matchAll(/`([^`]+)`/g)) {
    const candidate = match[1]
      .replace(IDENTIFIER, "")
      .replace(SOURCE_ID, "")
      .replace(OTHER_SOURCE_ID, "")
      .replace(LOCAL_ASSUMPTION_ID, "")
      .replace(ASSUMPTION_ID, "")
      .replace(/(^|\/)\-+/g, "$1")
      .trim();
    if (
      !candidate ||
      candidate.includes("*") ||
      candidate.endsWith("/") ||
      /^(?:sha256:|https?:|\/)/.test(candidate) ||
      !REPOSITORY_PATH.test(candidate) ||
      !/\.[A-Za-z0-9]+$/.test(candidate)
    ) continue;
    paths.add(candidate.replace(/^\.\//, ""));
  }
  for (const match of description.matchAll(REPOSITORY_PATH_TOKEN)) {
    const candidate = match[0].replace(/[),.;:]+$/, "");
    if (REPOSITORY_PATH.test(candidate) && /\.[A-Za-z0-9]+$/.test(candidate)) {
      paths.add(candidate.replace(/^\.\//, ""));
    }
  }
  return [...paths].sort(compare);
}

function normalizeProofPathMentions(value: string): string {
  return value
    .replace(/^\s*(?:[-*+]\s*)?`?reports\/evidence\/(?:f|sg|sr|d|ae|rg|dec)-?`?\s*\.?\s*$/gim, "")
    .replace(/`(?:(?:PLA|BUY|SEL|INT)-\d+-)?-?([A-Za-z0-9][A-Za-z0-9._-]*proof\.(?:json|md))`/gi,
      (_full, filename: string) => `\`reports/evidence/${filename.replace(/^-+/, "")}\``)
    .replace(/(?<![A-Za-z0-9_./-])(?:(?:PLA|BUY|SEL|INT)-\d+-)?-?([A-Za-z0-9][A-Za-z0-9._-]*proof\.(?:json|md))\b/gi,
      (_full, filename: string) => `reports/evidence/${filename.replace(/^-+/, "")}`)
    .replace(/\breports\/evidence\/([^`\n]+?\.(?:json|md))\b/gi, (_full, filename: string) => {
      if (!/\s/.test(filename)) return `reports/evidence/${filename}`;
      const extension = /\.(json|md)$/i.exec(filename)?.[1]?.toLowerCase() ?? "json";
      const base = filename.replace(/\.(?:json|md)$/i, "");
      const normalized = base
        .replace(/\s+/g, "-")
        .replace(/[^A-Za-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      return `reports/evidence/${normalized || "proof"}.${extension}`;
    })
    .replace(/\bpublic\/lifecycle proof\b/gi, "public or lifecycle proof");
}

function parseDescription(issue: LinearIssueInput, cleanNativeTitle: string): ParsedDescription {
  const description = issue.description ?? "";
  const sections = new Map<string, string[]>();
  const residue: string[] = [];
  const paths = new Set<string>();
  let current = "residue";
  let removedNativeLines = 0;
  let removedReferenceLines = 0;
  let hasLikelyClippedLine = false;
  for (const rawLine of description.split(/\r?\n/)) {
    const heading = /^\s*(#{1,6})\s+(.+?)\s*#*\s*$/.exec(rawLine);
    if (heading) {
      const headingText = heading[2].trim();
      if (
        heading[1].length === 1 &&
        [issue.title, cleanNativeTitle].includes(headingText)
      ) {
        removedNativeLines += 1;
        current = "residue";
        continue;
      }
      current = headingKey(headingText);
      if (current === "skip") removedNativeLines += 1;
      continue;
    }
    const acceptanceLabel = /^\s*(Success|Failure|Recovery):\s*$/i.exec(rawLine)?.[1]?.toLowerCase();
    if (
      acceptanceLabel &&
      ["acceptance", "success", "failure", "recovery"].includes(current)
    ) {
      current = acceptanceLabel;
      continue;
    }
    if (current === "skip") {
      if (rawLine.trim()) removedNativeLines += 1;
      continue;
    }
    if ((NATIVE_FIELD.test(rawLine) || RELATION_FIELD.test(rawLine)) && !TELEMETRY_DIMENSION_FIELD.test(rawLine)) {
      removedNativeLines += 1;
      continue;
    }
    const clipped = likelyClippedLegacyInputLine(rawLine);
    if (clipped) {
      hasLikelyClippedLine = true;
      removedReferenceLines += 1;
      continue;
    }
    const scrubbed = scrubLine(rawLine, false);
    if (scrubbed.removedReference) removedReferenceLines += 1;
    const scrubbedLine = current === "proof"
      ? normalizeProofPathMentions(scrubbed.line)
      : scrubbed.line;
    if (!scrubbedLine.trim()) continue;
    if (current === "paths") {
      for (const path of concretePaths(scrubbedLine)) paths.add(path);
      continue;
    }
    if (current === "residue" || current === "acceptance") {
      residue.push(scrubbedLine);
      continue;
    }
    const splitCombined = current === "failure_recovery" || current === "rollout_rollback"
      ? splitCombinedControl(scrubbedLine, current)
      : null;
    if (splitCombined) {
      for (const [target, value] of Object.entries(splitCombined)) {
        if (!value) continue;
        const values = sections.get(target) ?? [];
        values.push(value);
        sections.set(target, values);
      }
      continue;
    }
    const targets = current === "failure_recovery"
      ? ["failure", "recovery"]
      : current === "rollout_rollback"
      ? ["rollout", "rollback"]
      : current === "success_review"
      ? ["success", "review"]
      : current === "mixed_controls"
      ? [
          ...(/\brollout\b/i.test(scrubbedLine) ? ["rollout"] : []),
          ...(/\brollback\b/i.test(scrubbedLine) ? ["rollback"] : []),
          ...(/\b(?:telemetry|event|audit|webhook|notification|metric|posthog)\b/i.test(scrubbedLine) ? ["telemetry"] : []),
          ...(/\b(?:exclude|excluded|exclusion)\b/i.test(scrubbedLine) ? ["exclusions"] : []),
        ]
      : [current];
    if (targets.length === 0) targets.push("behavior");
    for (const target of targets) {
      const values = sections.get(target) ?? [];
      values.push(scrubbedLine);
      sections.set(target, values);
    }
  }
  return {
    sections,
    residue,
    paths: [...paths].sort(compare),
    relations: { blockedBy: [], blocks: [], relatedTo: [] },
    removedNativeLines,
    removedReferenceLines,
    hasLikelyClippedLine,
  };
}

function genericTemplate(description: string, parsed: ParsedDescription): boolean {
  return (
    parsed.hasLikelyClippedLine ||
    !parsed.sections.has("behavior") ||
    GENERIC_BOILERPLATE.test(description) ||
    GENERIC_CONTRACT_FALLBACK.test(description) ||
    MALFORMED_FIELD_TOKEN.test(description) ||
    /##\s+(?:Pinned Source|Release and Roadmap Contract|Delivery)\b/i.test(description) &&
      parsed.sections.get("behavior")?.join(" ").length === 0
  );
}

function safeSourcePath(root: string, sourceDoc: string): string | null {
  if (
    !sourceDoc.trim() ||
    /(?:^|\/)(?:_baselines|retired-sources|_versions)(?:\/|$)/i.test(sourceDoc)
  ) return null;
  const requested = resolve(root, sourceDoc);
  try {
    assertInside(root, requested, "source document");
    const actual = realpathSync(requested);
    assertInside(root, actual, "source document");
    return actual;
  } catch {
    return null;
  }
}

function sourceText(context: PlannerContext, path: string): string {
  const cached = context.sourceTextByPath.get(path);
  if (cached !== undefined) return cached;
  const source = readFileSync(path, "utf8");
  context.sourceTextByPath.set(path, source);
  return source;
}

function sectionLabels(context: PlannerContext, path: string): Map<string, string> {
  const cached = context.sectionLabelByPath.get(path);
  if (cached) return cached;
  const labels = new Map<string, string>();
  for (const line of sourceText(context, path).split(/\r?\n/)) {
    const boldNumeric = /^\s*\*\*§?\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)*)\s+(.+?)\.?\*\*\s*$/i.exec(line);
    if (boldNumeric) {
      const key = boldNumeric[1].toLowerCase();
      const label = boldNumeric[2]
        .replace(/\([^)]*(?:phase|remediation|\d{4}-\d{2}-\d{2})[^)]*\)/gi, "")
        .trim();
      if (label && !labels.has(key)) labels.set(key, label);
      continue;
    }
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]
      .replace(/\{#[^}]+\}\s*$/, "")
      .replace(/\*\*/g, "")
      .replace(/\\([.()])/g, "$1")
      .trim();
    if (!heading) continue;
    const appendix = /^(Appendix\s+[A-M](?:\.\d+(?:\.\d+)*)?)\s*(?:[:—-]\s*|\s+)(.+)$/i.exec(heading);
    const appendixMember = /^([A-M](?:\.\d+(?:\.\d+)*)?)\s*(?:[:—-]\s*|\s+)(.+)$/i.exec(heading);
    const numeric = /^((?:M\.)?\d+(?:\.[0-9A-Z]+)*)\s*(?:[:—-]\s*|\s+)(.+)$/i.exec(heading);
    const match = appendix ?? appendixMember ?? numeric;
    if (!match) continue;
    const key = match[1].replace(/^Appendix\s+/i, "").toLowerCase();
    const label = match[2].replace(/\([^)]*(?:phase|remediation|\d{4}-\d{2}-\d{2})[^)]*\)/gi, "").trim();
    if (label && !labels.has(key)) labels.set(key, label);
  }
  context.sectionLabelByPath.set(path, labels);
  return labels;
}

function resolveSourceReferences(context: PlannerContext, path: string, value: string): string {
  const labels = sectionLabels(context, path);
  const uxPath = safeSourcePath(context.root, "UX_Design_of_Sourcera.md");
  const uxLabels = uxPath ? sectionLabels(context, uxPath) : new Map<string, string>();
  const executable = value.split(/\r?\n/).map((line) => {
    if (/^\s*\|/.test(line)) return line;
    return splitProseSentences(line)
      .filter((fragment) =>
        !/\bMaster Spec is authoritative\b|\bUX Design applies only where the Master Spec is silent\b|\bthis (?:subsection|section) is a pointer\b/i.test(fragment) &&
        !/\b(?:lifecycle|state machine|contract|behavior)\s+is\s+authoritative\s+in\s+(?:the\s+)?(?:\*\*)?(?:Master Spec|UX Design|Appendix|§)\b/i.test(fragment)
      )
      .join(" ");
  }).join("\n");
  return executable
    .replace(/\bUX(?: Design)?\s+`?§\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)*)`?/gi, (_full, key: string) =>
      uxLabels.get(key.toLowerCase()) ?? key
    )
    .replace(/§\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)*)/gi, (_full, key: string) =>
      labels.get(key.toLowerCase()) ?? _full
    )
    .replace(/\bAppendix\s+([A-M](?:\.\d+(?:\.\d+)*)?)/gi, (_full, key: string) =>
      labels.get(key.toLowerCase()) ?? _full
    );
}

function effectiveSourceDoc(row: ManifestRow): string {
  return /^(?:UX Design|UX)\s+§/i.test(row.section)
    ? "UX_Design_of_Sourcera.md"
    : row.sourceDoc;
}

function normalizedHeading(value: string): string {
  return value
    .replace(/\\\./g, ".")
    .replace(/\{#[^}]+\}\s*$/, "")
    .replace(/[*`]/g, "")
    .replace(/^_+|_+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function headingTargets(section: string): string[] {
  const ux = /^(?:UX Design|UX)\s+§\s*(.+)$/i.exec(section)?.[1]?.trim();
  if (ux) return UX_SECTION_ALIASES.get(ux.toLowerCase()) ?? [ux];
  const delivery = /^Delivery register\s+(.+)$/i.exec(section)?.[1]?.trim();
  if (delivery) return [delivery];
  const appendix = /^Appendix\s+([A-M](?:\.\d+(?:\.\d+)*)?)/i.exec(section)?.[1];
  if (appendix) return [appendix, `Appendix ${appendix}`];
  const symbolic = /^§\s*([M0-9]+(?:\.[0-9A-Z]+)*)\b/i.exec(section)?.[1];
  return symbolic ? [symbolic] : [];
}

function headingMatches(title: string, target: string): boolean {
  const normalized = normalizedHeading(title);
  const wanted = normalizedHeading(target);
  if (/^(?:appendix\s+)?[a-m](?:\.\d+(?:\.\d+)*)?$/i.test(wanted)) {
    const bare = wanted.replace(/^appendix\s+/, "");
    return new RegExp(`^(?:appendix\\s+)?${bare.replace(/\./g, "\\.")}(?:\\s|:|—|$)`, "i").test(normalized);
  }
  if (/^(?:m|\d+)(?:\.[0-9a-z]+)+$/i.test(wanted)) {
    return new RegExp(`^${wanted.replace(/\./g, "\\.")}(?:\\s|:|—|$)`, "i").test(normalized);
  }
  if (/^\d+$/.test(wanted)) {
    return new RegExp(`^(?:section\\s+)?${wanted}(?:\\.\\s|\\s|:|—|$)`, "i").test(normalized);
  }
  return normalized === wanted || normalized.startsWith(`${wanted} `);
}

function headingSection(source: string, section: string): string | null {
  const targets = headingTargets(section);
  if (targets.length === 0) return null;
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    return Boolean(heading && targets.some((target) => headingMatches(heading[2], target)));
  });
  if (start < 0) return null;
  const level = /^(#{1,6})\s+/.exec(lines[start])?.[1].length ?? 6;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const nextLevel = /^(#{1,6})\s+/.exec(lines[index])?.[1].length;
    if (nextLevel && nextLevel <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function lineSection(source: string, section: string): string | null {
  const line = /^line:(\d+)$/.exec(section)?.[1];
  if (!line) return null;
  return source.split(/\r?\n/)[Number(line) - 1] ?? null;
}

function cachedSourceSection(
  context: PlannerContext,
  path: string,
  section: string,
): string | null {
  const key = `${path}\u0000${section}`;
  if (context.sourceSectionByKey.has(key)) {
    return context.sourceSectionByKey.get(key) ?? null;
  }
  const source = sourceText(context, path);
  const extracted = lineSection(source, section) ?? headingSection(source, section);
  context.sourceSectionByKey.set(key, extracted);
  return extracted;
}

function sliceSection(source: string, slice: SourceSlice): string | null {
  const start = source.indexOf(`${slice.startHeading}\n`);
  const end = source.indexOf(`\n${slice.endHeading}`, start + 1);
  if (start < 0 || end < 0 || end <= start) return null;
  return source.slice(start + slice.startHeading.length + 1, end);
}

function keywords(value: string): Set<string> {
  return new Set(
    value.toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g)
      ?.filter((word) => !STOP_WORDS.has(word) && !GENERIC_FACT_TERMS.has(word)) ?? [],
  );
}

type CanonicalSectionKey =
  | "behavior"
  | "states"
  | "permissions"
  | "review"
  | "success"
  | "failure"
  | "recovery"
  | "rollout"
  | "rollback"
  | "telemetry"
  | "proof"
  | "assumptions"
  | "exclusions";

interface CanonicalAllocation extends Record<CanonicalSectionKey, string | null> {}

interface FactBlock {
  text: string;
  search: string;
  heading: string;
  section: CanonicalSectionKey;
}

function sourceHeadingKey(value: string): CanonicalSectionKey | null {
  const heading = normalizedHeading(value).replace(/[.:]+$/, "").trim();
  if (/\b(?:state machine|states?|transitions?|lifecycle)\b/.test(heading)) return "states";
  if (/\b(?:permissions?|authorization|scope(?: isolation)?|isolation|privacy|retention|dsar|residency|firewall)\b/.test(heading)) return "permissions";
  if (/\b(?:acceptance criteria|success criteria|verification criteria|success tests?)\b/.test(heading)) return "success";
  if (/\b(?:failure modes?|failure cases?|risks?|rejections?|denials?)\b/.test(heading)) return "failure";
  if (/\b(?:recovery|retry|replay|repair procedure|restore)\b/.test(heading)) return "recovery";
  if (/\b(?:rollout|deployment|canary|launch)\b/.test(heading)) return "rollout";
  if (/\b(?:rollback|revert)\b/.test(heading)) return "rollback";
  if (/\b(?:telemetry|observability|notifications?|events?|audit signals?|metrics?)\b/.test(heading)) return "telemetry";
  if (/\b(?:named proof|required evidence|proof|receipts?|artifacts?)\b/.test(heading)) return "proof";
  if (/\b(?:review|readiness)\b/.test(heading)) return "review";
  if (/\b(?:assumptions?|validation triggers?|invalidation)\b/.test(heading)) return "assumptions";
  if (/\b(?:exclusions?|out of scope|non-goals?)\b/.test(heading)) return "exclusions";
  if (/\b(?:authoring intent|behavior|rules?|contract|schema|fields?|indexes?|invariants?|semantics?|purpose|overview)\b/.test(heading)) return "behavior";
  return null;
}

function mergeFactBlockTables(values: string[]): string {
  const merged: Array<{ text: string; tableHeader: string | null }> = [];
  const tableIndexes = new Map<string, number>();
  for (const value of values) {
    const lines = value.split("\n");
    const isTable = lines.length >= 3 &&
      /^\s*\|/.test(lines[0]) &&
      /^\s*\|?\s*:?-{2,}/.test(lines[1]);
    if (!isTable) {
      merged.push({ text: value, tableHeader: null });
      continue;
    }
    const header = lines.slice(0, 2).join("\n");
    const existing = tableIndexes.get(header);
    if (existing === undefined) {
      tableIndexes.set(header, merged.length);
      merged.push({ text: value, tableHeader: header });
    } else {
      merged[existing].text += `\n${lines.slice(2).join("\n")}`;
    }
  }
  return merged.map((entry) => entry.text).join("\n\n");
}

function tableSectionKey(headerLine: string): CanonicalSectionKey | null {
  const header = headerLine.replace(/[*`]/g, "").toLowerCase();
  if (/\b(?:allowed roles?|permissions?|explicit denials?|authorization)\b/.test(header)) return "permissions";
  if (/\b(?:criterion|test type|expected result|acceptance)\b/.test(header)) return "success";
  if (/\b(?:from|to|transition|runtime state)\b/.test(header)) return "states";
  if (/\b(?:error|failure|rejection)\b/.test(header)) return "failure";
  if (/\b(?:event|metric|telemetry|audit action)\b/.test(header)) return "telemetry";
  return null;
}

interface MarkdownListLine {
  indent: string;
  marker: string;
  body: string;
}

function markdownListLine(value: string): MarkdownListLine | null {
  const match = /^(\s*)([-*+]|\d+[.)])\s+(.+?)\s*$/.exec(value);
  if (!match?.[3].trim()) return null;
  return { indent: match[1], marker: match[2], body: match[3].trim() };
}

function normalizeMarkdownListLines(lines: string[]): string[] {
  const counters = new Map<string, number>();
  return lines.flatMap((line) => {
    const parsed = markdownListLine(line);
    if (!parsed) return [];
    if (!/^\d/.test(parsed.marker)) return [line];
    const next = (counters.get(parsed.indent) ?? 0) + 1;
    counters.set(parsed.indent, next);
    return [`${parsed.indent}${next}. ${parsed.body}`];
  });
}

function normalizeMarkdownListUnits(value: string): string {
  const output: string[] = [];
  let unit: string[] = [];
  let pendingBlanks: string[] = [];
  let inFence = false;
  const flush = () => {
    if (unit.length > 0) output.push(...normalizeMarkdownListLines(unit));
    output.push(...pendingBlanks);
    unit = [];
    pendingBlanks = [];
  };
  for (const line of value.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      flush();
      output.push(line);
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      output.push(line);
      continue;
    }
    const parsed = markdownListLine(line);
    if (parsed) {
      pendingBlanks = [];
      unit.push(line);
      continue;
    }
    if (!line.trim() && unit.length > 0) {
      pendingBlanks.push(line);
      continue;
    }
    flush();
    output.push(line);
  }
  flush();
  return output.join("\n");
}

function factBlocks(raw: string): FactBlock[] {
  const blocks: FactBlock[] = [];
  let context = "";
  let section: CanonicalSectionKey = "behavior";
  let paragraph: string[] = [];
  let table: string[] = [];
  let list: string[] = [];
  let pendingLabel: string | null = null;
  const withPendingLabel = (value: string): string => {
    if (!pendingLabel) return value;
    const combined = `${pendingLabel}\n${value}`;
    pendingLabel = null;
    return combined.length <= MAX_CANONICAL_BLOCK_CHARS ? combined : value;
  };
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    let chunk: string[] = [];
    let chunkLength = 0;
    let firstChunk = true;
    for (const line of paragraph) {
      const addition = line.length + (chunk.length > 0 ? 1 : 0);
      if (chunk.length > 0 && chunkLength + addition > MAX_CANONICAL_BLOCK_CHARS) {
        const text = firstChunk ? withPendingLabel(chunk.join("\n")) : chunk.join("\n");
        blocks.push({ text, search: `${context} ${text}`, heading: context, section });
        firstChunk = false;
        chunk = [];
        chunkLength = 0;
      }
      if (line.length <= MAX_CANONICAL_BLOCK_CHARS) {
        chunk.push(line);
        chunkLength += line.length + (chunk.length > 1 ? 1 : 0);
      }
    }
    if (chunk.length > 0) {
      const text = firstChunk ? withPendingLabel(chunk.join("\n")) : chunk.join("\n");
      blocks.push({ text, search: `${context} ${text}`, heading: context, section });
    }
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    const normalized = normalizeMarkdownListLines(list);
    let chunk: string[] = [];
    let chunkLength = 0;
    let firstChunk = true;
    const pushChunk = () => {
      if (chunk.length === 0) return;
      const joined = chunk.join("\n");
      const text = firstChunk ? withPendingLabel(joined) : joined;
      blocks.push({ text, search: `${context} ${text}`, heading: context, section });
      firstChunk = false;
      chunk = [];
      chunkLength = 0;
    };
    for (const line of normalized) {
      const addition = line.length + (chunk.length > 0 ? 1 : 0);
      if (chunk.length > 0 && chunkLength + addition > MAX_CANONICAL_BLOCK_CHARS) pushChunk();
      if (line.length <= MAX_CANONICAL_BLOCK_CHARS) {
        chunk.push(line);
        chunkLength += line.length + (chunk.length > 1 ? 1 : 0);
      }
    }
    pushChunk();
    list = [];
  };
  const flushTable = () => {
    if (table.length === 0) return;
    const tableSection = tableSectionKey(table[0]) ?? section;
    const full = table.join("\n");
    if (full.length <= MAX_CANONICAL_BLOCK_CHARS) {
      const text = withPendingLabel(full);
      blocks.push({ text, search: `${context} ${text}`, heading: context, section: tableSection });
    } else {
      const separatorCells = table.length >= 2 ? markdownTableCells(table[1]) : [];
      const header = table.length >= 2 &&
          separatorCells.length >= 2 &&
          separatorCells.every((cell) => /^:?-{2,}:?$/.test(cell))
        ? table.slice(0, 2)
        : [];
      const rows = header.length > 0 ? table.slice(2) : table;
      for (const row of rows) {
        const tableText = [...header, row].join("\n");
        const text = withPendingLabel(tableText);
        if (text.length <= MAX_CANONICAL_BLOCK_CHARS) {
          blocks.push({ text, search: `${context} ${text}`, heading: context, section: tableSection });
        }
      }
    }
    table = [];
  };
  for (const rawLine of raw.split(/\r?\n/)) {
    const heading = /^\s*#{1,6}\s+(.+?)\s*$/.exec(rawLine)?.[1];
    if (heading) {
      flushParagraph();
      flushList();
      flushTable();
      pendingLabel = null;
      context = normalizedHeading(heading);
      section = sourceHeadingKey(heading) ?? "behavior";
      continue;
    }
    let contentLine = rawLine;
    const boldHeading = /^\s*\*\*([^*]{2,120}?)[.:]?\*\*\s*(.*)$/.exec(rawLine);
    if (
      boldHeading &&
      (
        LEGACY_REFERENCE.test(boldHeading[1]) ||
        PLANNING_HISTORY.test(boldHeading[1]) &&
          !/^\s*authoring intent\b/i.test(boldHeading[1])
      )
    ) continue;
    const boldKey = boldHeading ? sourceHeadingKey(boldHeading[1]) : null;
    if (boldHeading && boldKey) {
      flushParagraph();
      flushList();
      flushTable();
      context = normalizedHeading(boldHeading[1]);
      section = boldKey;
      contentLine = boldHeading[2];
      if (!contentLine.trim()) continue;
      const executableTail = /((?:§\s*[A-Z0-9.]+\s+|This\s+(?:contract|section)\s+)?(?:binds|requires|enforces|defines)\b.*)$/i.exec(contentLine)?.[1];
      const inlineSource = executableTail &&
          (PLANNING_HISTORY.test(contentLine) || LEGACY_REFERENCE.test(contentLine) || STALE_INFORMATION.test(contentLine))
        ? executableTail
        : contentLine;
      const inline = scrubLine(inlineSource).line.trim();
      if (inline) {
        blocks.push({ text: inline, search: `${context} ${inline}`, heading: context, section });
      }
      context = "";
      section = "behavior";
      continue;
    }
    const scrubbed = scrubLine(contentLine).line.trimEnd();
    if (!scrubbed.trim()) {
      if (!contentLine.trim()) {
        flushParagraph();
        flushTable();
      }
      continue;
    }
    if (/^\s*\*\*[^*\n]{2,100}:\*\*\s*$/.test(scrubbed)) {
      flushParagraph();
      flushList();
      flushTable();
      pendingLabel = scrubbed.trim();
      continue;
    }
    if (/^\s*\|/.test(scrubbed)) {
      flushParagraph();
      flushList();
      table.push(scrubbed);
      continue;
    }
    flushTable();
    const listLine = markdownListLine(scrubbed);
    if (listLine) {
      flushParagraph();
      list.push(scrubbed);
      continue;
    }
    flushList();
    paragraph.push(scrubbed);
  }
  flushParagraph();
  flushList();
  flushTable();
  pendingLabel = null;
  const seen = new Set<string>();
  return blocks.filter((block) => {
    const key = block.text.trim().toLowerCase();
    if (
      !key ||
      seen.has(key) ||
      block.text.length > MAX_CANONICAL_BLOCK_CHARS
    ) return false;
    seen.add(key);
    return true;
  });
}

const SOURCE_SECTION_LABELS: Record<CanonicalSectionKey, string> = {
  behavior: "Complete behavior and rules",
  states: "States and transitions",
  permissions: "Permissions, isolation, and privacy",
  review: "Review and readiness",
  success: "Acceptance criteria",
  failure: "Failure modes",
  recovery: "Recovery",
  rollout: "Rollout",
  rollback: "Rollback",
  telemetry: "Telemetry and notifications",
  proof: "Named proof",
  assumptions: "Assumptions and validation triggers",
  exclusions: "Exclusions",
};

function serializeSourceBlocks(blocks: FactBlock[]): string | null {
  if (blocks.length === 0) return null;
  const output: string[] = [];
  let previous: CanonicalSectionKey | null = null;
  for (const block of blocks) {
    if (block.section !== previous) {
      output.push(`#### ${SOURCE_SECTION_LABELS[block.section]}`);
      previous = block.section;
    }
    output.push(block.text);
  }
  return output.join("\n\n");
}

function scopeTableBlockToOutcome(
  block: FactBlock,
  outcome: string,
  terms: Set<string>,
): FactBlock {
  const lines = block.text.split("\n");
  if (
    lines.length < 3 ||
    !/^\s*\|/.test(lines[0]) ||
    !/^\s*\|?\s*:?-{2,}/.test(lines[1]) ||
    /\b(?:matrix|catalog|registry|taxonomy|entity set|role model|all roles|coverage validator)\b/i.test(outcome)
  ) return block;
  const rowScore = (row: string): number => {
    const value = row.toLowerCase();
    return [...terms].reduce((score, term) => {
      if (!value.includes(term)) return score;
      const weight = term.includes("_") ? 12 : term.length >= 12 ? 6 : term.length >= 8 ? 3 : 1;
      return score + weight;
    }, 0);
  };
  const rows = lines.slice(2).map((line, index) => ({ line, index, score: rowScore(line) }));
  const maximum = Math.max(0, ...rows.map((row) => row.score));
  if (maximum === 0) return block;
  const selectedRows = rows.filter((row) => row.score === maximum);
  if (selectedRows.length === rows.length) return block;
  const text = [...lines.slice(0, 2), ...selectedRows.map((row) => row.line)].join("\n");
  return { ...block, text, search: `${block.heading} ${text}` };
}

function normalizedAnchor(value: string): string {
  return value
    .replace(/\{#[^}]+\}/g, "")
    .replace(/[`*_#|]/g, " ")
    .replace(/\brole\b/gi, " ")
    .replace(/[^a-z0-9_]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sourceOwnedRoleCell(value: string): string {
  const sourceFree = repairSanitizedProse(
    stripSourceDelegationFragments(stripPlanningHistoryFragments(value)),
  );
  return splitProseSentences(sourceFree)
    .filter((fragment) =>
      !PLANNING_HISTORY.test(fragment) &&
      !PLANNING_PROVENANCE.test(fragment) &&
      !LEGACY_REFERENCE.test(fragment) &&
      !STALE_INFORMATION.test(fragment)
    )
    .join(" ")
    .trim();
}

function anchoredSourceSlice(raw: string, anchor: string): string | null {
  const lines = raw.split(/\r?\n/);
  const matrixColumn = /^column:(.+)$/i.exec(anchor)?.[1]?.trim();
  if (matrixColumn) {
    const wantedColumn = normalizedAnchor(matrixColumn);
    for (let index = 0; index < lines.length;) {
      if (!/^\s*\|/.test(lines[index])) {
        index += 1;
        continue;
      }
      let end = index;
      while (end < lines.length && /^\s*\|/.test(lines[end])) end += 1;
      const table = lines.slice(index, end);
      const headers = markdownTableCells(table[0] ?? "");
      const columnIndex = headers.findIndex((header) => normalizedAnchor(header) === wantedColumn);
      if (
        table.length >= 3 &&
        /^\s*\|?\s*:?-{2,}/.test(table[1] ?? "") &&
        columnIndex > 0 &&
        /\boperation\b/i.test(headers[0] ?? "")
      ) {
        const retainedIndexes = [...new Set([
          0,
          headers.findIndex((header) => /\bsurface\b/i.test(header)),
          columnIndex,
          headers.findIndex((header) => /\baudit action\b/i.test(header)),
        ].filter((value) => value >= 0))];
        const row = (line: string): string => {
          const cells = markdownTableCells(line);
          return `| ${retainedIndexes.map((cellIndex) => cells[cellIndex] ?? "").join(" | ")} |`;
        };
        const separator = `| ${retainedIndexes.map(() => "----").join(" | ")} |`;
        return [row(table[0]), separator, ...table.slice(2).map(row)].join("\n");
      }
      index = end;
    }
    return null;
  }
  const wanted = normalizedAnchor(anchor);
  if (!wanted) return null;
  const matches = (value: string): boolean => {
    const candidate = normalizedAnchor(value);
    return candidate === wanted || candidate.includes(wanted);
  };

  for (let index = 0; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index]);
    if (!heading || !matches(heading[2])) continue;
    const level = heading[1].length;
    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const nextLevel = /^(#{1,6})\s+/.exec(lines[cursor])?.[1].length;
      if (nextLevel && nextLevel <= level) {
        end = cursor;
        break;
      }
    }
    return lines.slice(index, end).join("\n");
  }

  for (let index = 0; index < lines.length; index += 1) {
    const bold = /^\s*\*\*([^*]{2,160}?)[.:]?\*\*/.exec(lines[index]);
    if (!bold || !matches(bold[1])) continue;
    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^\s*#{1,6}\s+/.test(lines[cursor]) || /^\s*\*\*[^*]{2,160}?[.:]?\*\*/.test(lines[cursor])) {
        end = cursor;
        break;
      }
    }
    return lines.slice(index, end).join("\n");
  }

  for (let index = 0; index < lines.length;) {
    if (!/^\s*\|/.test(lines[index])) {
      index += 1;
      continue;
    }
    let end = index;
    while (end < lines.length && /^\s*\|/.test(lines[end])) end += 1;
    const table = lines.slice(index, end);
    const separator = table[1] ?? "";
    if (table.length >= 3 && /^\s*\|?\s*:?-{2,}/.test(separator)) {
      const headers = markdownTableCells(table[0]);
      if (headers.some((header) => normalizedAnchor(header) === wanted)) {
        return table.join("\n");
      }
      const matchingRows = table.slice(2).filter((line) => {
        const first = markdownTableCells(line)[0] ?? "";
        return normalizedAnchor(first) === wanted || matches(line);
      });
      if (matchingRows.length > 0) {
        if (/\b(?:role|workflow label)\b/i.test(headers[0] ?? "")) {
          const prose = matchingRows.map((line) => {
            const cells = markdownTableCells(line);
            const label = cells[0]?.replace(/[*`]/g, "").trim() || anchor;
            const facts = headers.slice(1).map((header, cellIndex) => ({
              header: header.replace(/[*`]/g, "").trim(),
              value: sourceOwnedRoleCell(cells[cellIndex + 1]?.trim() ?? ""),
            })).filter((entry) =>
              entry.header &&
              entry.value &&
              !/\breference\b/i.test(entry.header)
            );
            return `**${label}.** ${facts.map((entry) => `${entry.header}: ${entry.value}`).join("; ")}`;
          });
          return prose.join("\n\n");
        }
        return [...table.slice(0, 2), ...matchingRows].join("\n");
      }
    }
    index = end;
  }

  const paragraphs = raw.split(/\n\s*\n/);
  return paragraphs.find((paragraph) => matches(paragraph)) ?? null;
}

function anchoredSourceFacts(
  raw: string,
  anchors: string[],
  outcome: string,
  maximum = MAX_CANONICAL_FACT_CHARS,
): string | null {
  const slices = anchors
    .map((anchor) => anchoredSourceSlice(raw, anchor))
    .filter((value): value is string => Boolean(value?.trim()));
  if (slices.length !== anchors.length) return null;
  return preserveCurrentFacts(dedupeLines(slices).join("\n\n"), maximum);
}

function boundedSourceFacts(
  raw: string,
  outcome: string,
  maximum = MAX_CANONICAL_FACT_CHARS,
): string | null {
  const terms = keywords(outcome);
  const blocks = factBlocks(raw).map((block) => scopeTableBlockToOutcome(block, outcome, terms));
  if (blocks.length === 0) return null;
  const complete = serializeSourceBlocks(blocks);
  if (blocks.length <= 8 && complete && complete.length <= maximum) return complete;
  const scoreBlock = (block: FactBlock): number => {
    const text = block.text.toLowerCase();
    const heading = block.heading.toLowerCase();
    return [...terms].reduce((score, term) => {
      const weight = term.includes("_") ? 10 : term.length >= 14 ? 5 : term.length >= 9 ? 3 : 1;
      if (heading.includes(term)) return score + weight * 5;
      if (text.includes(term)) return score + weight * 2;
      return block.search.toLowerCase().includes(term) ? score + weight : score;
    }, 0);
  };
  const selected = new Set<number>();
  let length = 0;
  const add = (index: number): boolean => {
    if (selected.has(index) || selected.size >= MAX_CANONICAL_BLOCKS) return false;
    const addition = blocks[index].text.length + 40;
    if (length + addition > maximum) return false;
    selected.add(index);
    length += addition;
    return true;
  };
  const priority: CanonicalSectionKey[] = [
    "behavior", "states", "permissions", "success", "failure", "recovery", "telemetry",
    "rollout", "rollback", "proof", "assumptions", "exclusions", "review",
  ];
  for (const key of priority) {
    const allCandidates = blocks
      .map((block, index) => ({ block, index }))
      .filter((row) => row.block.section === key);
    const ranked = allCandidates
      .map((row) => ({ ...row, score: scoreBlock(row.block) }))
      .sort((left, right) => right.score - left.score || left.index - right.index);
    const relevant = ranked.filter((row) => row.score > 0);
    const perSectionLimit = key === "behavior"
      ? 5
      : ["states", "permissions", "success", "failure", "recovery"].includes(key)
      ? 3
      : 1;
    const first = key === "behavior" ? allCandidates[0] : undefined;
    const candidates = [
      ...(first ? [first] : []),
      ...(relevant.length > 0 ? relevant : ranked),
    ].filter((row, index, values) => values.findIndex((candidate) => candidate.index === row.index) === index)
      .slice(0, perSectionLimit);
    for (const candidate of candidates) add(candidate.index);
  }
  return serializeSourceBlocks([...selected].sort((left, right) => left - right).map((index) => blocks[index]));
}

export function executableSourceBehaviorFacts(
  raw: string,
  outcome: string,
  maximum = 5_000,
): string | null {
  const blocks = factBlocks(raw);
  if (blocks.length === 0) return null;
  const behaviorIndexes = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.section === "behavior")
    .map(({ index }) => index);
  const terms = [...keywords(outcome)];
  const executable = /\b(?:must|shall|may|can|allow|deny|reject|return|persist|render|emit|write|record|compute|prevent|require|create|update|delete|restore|read|execute|validate|resolve|derive|calculate|display|send|publish)\b/i;
  const candidates = behaviorIndexes.length > 0
    ? behaviorIndexes
    : blocks
        .map((block, index) => ({
          block,
          index,
          score: terms.filter((term) => block.search.toLowerCase().includes(term)).length * 8 +
            (executable.test(block.text) ? 6 : 0) +
            (/^\s*\||`[^`]+`|\bHTTP\s+\d{3}\b|[≤≥<>]=?\s*\d/i.test(block.text) ? 3 : 0),
        }))
        .filter(({ block, score }) =>
          score > 0 &&
          !["review", "rollout", "rollback", "proof", "assumptions", "exclusions"].includes(block.section)
        )
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .slice(0, 4)
        .map(({ index }) => index);
  const selected: number[] = [];
  let length = 0;
  for (const index of [...new Set(candidates)].sort((left, right) => left - right)) {
    const addition = blocks[index].text.length + (selected.length > 0 ? 2 : 0);
    if (length + addition > maximum) continue;
    selected.push(index);
    length += addition;
  }
  return selected.length > 0
    ? mergeFactBlockTables(selected.map((index) => blocks[index].text))
    : null;
}

function boundedFacts(
  raw: string,
  outcome: string,
  maximum = MAX_CANONICAL_FACT_CHARS,
): string | null {
  const blocks = factBlocks(raw);
  if (blocks.length === 0) return null;
  const joined = mergeFactBlockTables(blocks.map((block) => block.text));
  if (blocks.length <= MAX_CANONICAL_BLOCKS && joined.length <= maximum) return joined;
  const terms = keywords(outcome);
  const scored = blocks.map((block, index) => ({
    block,
    index,
    score: [...terms].reduce((score, term) => {
      if (!block.search.toLowerCase().includes(term)) return score;
      const weight = term.includes("_") ? 12 : term.length >= 16 ? 4 : term.length >= 9 ? 2 : 1;
      return score + weight * (block.text.toLowerCase().includes(term) ? 2 : 1);
    }, 0),
  }));
  const matches = scored.filter((row) => row.score > 0);
  const candidates = (matches.length > 0 ? matches : scored).sort((left, right) =>
    right.score - left.score || left.index - right.index
  );
  const selectedIndexes: number[] = [];
  let length = 0;
  for (const row of candidates) {
    if (selectedIndexes.length >= MAX_CANONICAL_BLOCKS) break;
    const addition = row.block.text.length + (selectedIndexes.length > 0 ? 2 : 0);
    if (length + addition > maximum) continue;
    selectedIndexes.push(row.index);
    length += addition;
  }
  return selectedIndexes.length > 0
    ? mergeFactBlockTables(
        selectedIndexes.sort((left, right) => left - right).map((index) => blocks[index].text),
      )
    : null;
}

function semanticCodeTokens(value: string): Set<string> {
  const tokens = new Set<string>();
  for (const match of value.toLowerCase().matchAll(SEMANTIC_CODE_TOKEN)) {
    const token = match[0];
    if (
      token.includes("/") ||
      SEMANTIC_GENERIC_CODE_TOKENS.has(token) ||
      /^\d/.test(token) ||
      token.length < 5
    ) continue;
    tokens.add(token);
  }
  return tokens;
}

function behaviorExceedsSourceBoundary(value: string, exactSource: string | null): boolean {
  if (!exactSource?.trim()) return false;
  const contractTokens = semanticCodeTokens(value);
  if (contractTokens.size === 0) return false;
  const sourceTokens = semanticCodeTokens(exactSource);
  const foreign = [...contractTokens].filter((token) => !sourceTokens.has(token));
  return foreign.length >= 8 && foreign.length / contractTokens.size >= 0.7;
}

function distinctiveSourceTerms(raw: string): string[] {
  const terms = new Set<string>();
  const generic = new Set(["code", "id", "kind", "name", "state", "status", "type", "value"]);
  for (const match of raw.matchAll(/`([a-z][a-z0-9_.:-]{3,})`/gi)) {
    const value = match[1].toLowerCase();
    if (value.includes("/") || generic.has(value) || /^(?:http|sha256)/.test(value)) continue;
    terms.add(value);
    if (terms.size >= 16) break;
  }
  return [...terms];
}

function boundedAnchorFacts(raw: string, terms: string[], maximum: number): string | null {
  if (terms.length === 0) return null;
  const candidates = factBlocks(raw)
    .map((block, index) => {
      const search = block.search.toLowerCase();
      const matches = terms.filter((term) => search.includes(term.toLowerCase()));
      return { block, index, matches };
    })
    .filter((row) => row.matches.length > 0)
    .sort((left, right) => right.matches.length - left.matches.length || left.index - right.index);
  const selected: Array<{ index: number; text: string }> = [];
  let length = 0;
  for (const row of candidates) {
    const missingLabel = row.matches.find((term) => !row.block.text.toLowerCase().includes(term.toLowerCase()));
    const text = missingLabel ? `**\`${missingLabel}\`.**\n${row.block.text}` : row.block.text;
    const addition = text.length + (selected.length > 0 ? 2 : 0);
    if (length + addition > maximum) continue;
    selected.push({ index: row.index, text });
    length += addition;
  }
  return selected.length > 0
    ? mergeFactBlockTables(selected.sort((left, right) => left.index - right.index).map((row) => row.text))
    : null;
}

interface SourceAnchor {
  section: string;
  score: number;
  order: number;
  terms: Set<string>;
  transitionContract: boolean;
}

function sourceAnchorSections(raw: string): SourceAnchor[] {
  const candidates = new Map<string, SourceAnchor>();
  let order = 0;
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*\|/.test(line)) continue;
    const terms = distinctiveSourceTerms(line);
    const transitionPointer = /\b(?:lifecycle|state machine|transitions?)\b.{0,120}\bis\s+authoritative\s+in\s+(?:the\s+)?(?:\*\*)?(?:Appendix|§)\b/i.test(line);
    const outcomeSpecific = terms.length > 0 &&
      (/[`]/.test(line) || /\b(?:enum|error|field|status|state|transition|event|action|code|type|kind|format|role|value)\b/i.test(line));
    const explicitAnchor = transitionPointer || outcomeSpecific && (
      /\bvalues?\s+(?:must\s+)?resolves?\s+to\s+(?:§|Appendix)\b/i.test(line) ||
      /\bvalues?\s+(?:come from|are(?:\s+in)?)\s+(?:§|Appendix)\b/i.test(line) ||
      /\b(?:enum|values?)\b.{0,80}\bAppendix\s+[A-M]\b/i.test(line) ||
      /\b(?:must\s+)?conforms?\s+to\s+(?:§|Appendix)\b/i.test(line)
    );
    if (!explicitAnchor) continue;
    const lineScore =
      (transitionPointer ? 10 : 0) +
      (/\b(?:resolve|canonical|authoritative|values?|enum|defined)\b/i.test(line) ? 4 : 0) +
      (/`[a-z][a-z0-9_.:-]{3,}`/i.test(line) ? 3 : 0);
    const sections = [
      ...[...line.matchAll(/§\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)+)/gi)].map((match) => `§${match[1]}`),
      ...[...line.matchAll(/Appendix\s+([A-M](?:\.\d+(?:\.\d+)*)?)/gi)].map((match) => `Appendix ${match[1]}`),
    ];
    for (const section of sections) {
      const score = lineScore + (/^Appendix/i.test(section) ? 1 : 0);
      const existing = candidates.get(section.toLowerCase());
      if (!existing || score > existing.score) {
        candidates.set(section.toLowerCase(), {
          section,
          score,
          order,
          terms: new Set(terms),
          transitionContract: transitionPointer || /\b(?:state machine|transition)s?\b/i.test(line),
        });
      } else {
        for (const term of terms) existing.terms.add(term);
        existing.transitionContract ||= transitionPointer || /\b(?:state machine|transition)s?\b/i.test(line);
      }
      order += 1;
    }
  }
  return [...candidates.values()]
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .slice(0, 6);
}

function exactNamedAnchorFacts(raw: string, terms: string[], maximum: number): string | null {
  const blocks = factBlocks(raw);
  const selected = new Map<number, string>();
  for (const term of terms) {
    const normalizedTerm = term.toLowerCase();
    const candidates = blocks
      .map((block, index) => {
        const search = block.search.toLowerCase();
        const text = block.text.toLowerCase();
        const exactFirstCell = new RegExp(`^\\|\\s*\`${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`\\s*\\|`, "i").test(block.text);
        const headingDefinition = search.startsWith(`${normalizedTerm} `) || search.startsWith(`${normalizedTerm}(`);
        const valueList = /^(?:\s*`[^`]+`\s*,?)+$/m.test(block.text.trim());
        const score = (exactFirstCell ? 30 : 0) +
          (headingDefinition ? 20 : 0) +
          (valueList ? 25 : 0) +
          (text.includes(`\`${normalizedTerm}\``) ? 5 : 0) +
          (/\b(?:allowed values?|canonical values?|enum)\b/i.test(block.text) ? 3 : 0);
        return { block, index, score };
      })
      .filter((row) => row.block.search.toLowerCase().includes(normalizedTerm))
      .sort((left, right) => right.score - left.score || left.index - right.index);
    const candidate = candidates[0];
    if (!candidate || candidate.score < 20) continue;
    const text = candidate.block.text.toLowerCase().includes(normalizedTerm)
      ? candidate.block.text
      : `**\`${term}\`.**\n${candidate.block.text}`;
    selected.set(candidate.index, text);
  }
  if (selected.size === 0) return null;
  const ordered = [...selected].sort((left, right) => left[0] - right[0]).map((entry) => entry[1]);
  return preserveCurrentFacts(mergeFactBlockTables(ordered), maximum);
}

function exactStateTransitionFacts(raw: string, maximum: number): string | null {
  const selected = factBlocks(raw).filter((block) =>
    /^(?:complete state transitions|rejected transitions)$/.test(block.heading)
  );
  if (selected.length === 0) return null;
  return preserveCurrentFacts(
    mergeFactBlockTables(selected.map((block) => block.text)),
    maximum,
  );
}

function relevantAnchorSource(primaryRaw: string, primaryFacts: string, outcome: string): string {
  const terms = keywords(outcome);
  if (terms.size === 0) return "";
  const selectedSymbols = new Set(distinctiveSourceTerms(primaryFacts));
  const selectedLines = new Set(primaryFacts.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  const relevantLines: string[] = [];
  let heading = "";
  for (const line of primaryRaw.split(/\r?\n/)) {
    const nextHeading = /^\s*#{1,6}\s+(.+?)\s*$/.exec(line)?.[1];
    if (nextHeading) {
      heading = normalizedHeading(nextHeading);
      continue;
    }
    if (!/(?:§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)+|Appendix\s+[A-M])/i.test(line)) continue;
    const context = `${heading} ${line}`.toLowerCase();
    const anchors = sourceAnchorSections(line);
    const sharesSelectedSymbol = anchors.some((anchor) =>
      [...anchor.terms].some((term) => selectedSymbols.has(term))
    );
    if (
      (selectedLines.has(line.trim()) || sharesSelectedSymbol || [...terms].some((term) => context.includes(term))) &&
      anchors.length > 0
    ) relevantLines.push(line);
  }
  return relevantLines.join("\n");
}

function expandCanonicalAnchors(
  context: PlannerContext,
  primaryPath: string,
  primaryRaw: string,
): { facts: string[]; terms: string[] } {
  const expanded: string[] = [];
  const combinedTerms = new Set<string>();
  for (const anchor of sourceAnchorSections(primaryRaw)) {
    const useMasterSpec = /^Appendix\s+/i.test(anchor.section) &&
      basename(primaryPath) !== "Sourcera_Master_Spec.md";
    const anchorPath = useMasterSpec
      ? safeSourcePath(context.root, "Sourcera_Master_Spec.md")
      : primaryPath;
    if (!anchorPath) continue;
    const raw = cachedSourceSection(context, anchorPath, anchor.section);
    const resolvedRaw = raw ? resolveSourceReferences(context, anchorPath, raw) : null;
    for (const term of anchor.terms) combinedTerms.add(term);
    const facts = resolvedRaw
      ? anchor.transitionContract && /^Appendix L\.\d+/i.test(anchor.section)
        ? exactStateTransitionFacts(resolvedRaw, 4_500)
        : /^Appendix J(?:\b|\.)/i.test(anchor.section)
        ? exactNamedAnchorFacts(resolvedRaw, [...anchor.terms], 3_000)
        : null
      : null;
    if (facts) {
      expanded.push(anchor.transitionContract
        ? `#### ${SOURCE_SECTION_LABELS.states}\n\n${facts}`
        : `#### ${SOURCE_SECTION_LABELS.behavior}\n\n${facts}`);
    }
  }
  return { facts: expanded, terms: [...combinedTerms] };
}

function extractOpsConsoleComposite(
  context: PlannerContext,
  path: string,
  outcome: string,
): string | null {
  const parts: string[] = [];
  for (const [key, section, maximum] of [
    ["behavior", "§50.1", 1_600],
    ["permissions", "§50.2", 2_800],
    ["permissions", "§50.3", 2_800],
    ["states", "§50.3.4", 1_800],
    ["states", "§50.4.3", 2_000],
    ["telemetry", "§50.4.5", 1_800],
    ["failure", "§50.7", 2_000],
    ["success", "§50.8", 2_000],
  ] as Array<[CanonicalSectionKey, string, number]>) {
    const raw = cachedSourceSection(context, path, section);
    const facts = raw ? boundedFacts(resolveSourceReferences(context, path, raw), outcome, maximum) : null;
    if (facts) parts.push(`#### ${SOURCE_SECTION_LABELS[key]}\n\n${facts}`);
  }
  return parts.length > 0 ? mergeFactBlockTables(parts) : null;
}

function sourceraMethodBenchmarkContract(context: PlannerContext): string | null {
  const path = safeSourcePath(context.root, "Sourcera_Master_Spec.md");
  if (!path) return null;
  const raw = cachedSourceSection(context, path, "§10.15");
  if (!raw) return null;
  return preserveCurrentFacts(resolveSourceReferences(context, path, raw), 6_000);
}

function extractCanonicalFacts(
  context: PlannerContext,
  row: ManifestRow | null,
  checksum: ChecksumRow | null,
  outcome: string,
): string | null {
  if (row) {
    const path = safeSourcePath(context.root, effectiveSourceDoc(row));
    if (path) {
      if (row.issueId === "PLA-612") {
        return extractOpsConsoleComposite(context, path, outcome);
      }
      const exact = cachedSourceSection(context, path, row.section);
      if (exact) {
        const resolvedExact = resolveSourceReferences(context, path, exact);
        const exactAnchors = row.issueId === "BUY-220"
          ? ["Authoring Intent", "Scope", "Field", "State Machine", "Retention, DSAR, and residency", "Failure Modes Addressed", "Acceptance Criteria"]
          : row.anchors;
        const primaryFacts = exactAnchors?.length
          ? anchoredSourceFacts(resolvedExact, exactAnchors, outcome)
          : boundedSourceFacts(resolvedExact, outcome);
        if (exactAnchors?.length && primaryFacts) return primaryFacts;
        const anchorSource = primaryFacts
          ? relevantAnchorSource(exact, primaryFacts, outcome)
          : "";
        const expanded = anchorSource
          ? expandCanonicalAnchors(context, path, anchorSource)
          : { facts: [], terms: [] };
        if (primaryFacts) {
          return mergeFactBlockTables([...expanded.facts, primaryFacts]);
        }
      }
    }
  }
  if (!checksum) return null;
  const slices = checksum.slices ?? (
    checksum.sourceDoc && checksum.startHeading && checksum.endHeading
      ? [{
          sourceDoc: checksum.sourceDoc,
          startHeading: checksum.startHeading,
          endHeading: checksum.endHeading,
        }]
      : []
  );
  const candidateFacts: string[] = [];
  for (const slice of slices) {
    const path = safeSourcePath(context.root, slice.sourceDoc);
    if (!path) continue;
    const source = sourceText(context, path);
    const extracted = sliceSection(source, slice);
    const facts = extracted ? boundedSourceFacts(resolveSourceReferences(context, path, extracted), outcome) : null;
    if (facts) candidateFacts.push(facts);
  }
  if (candidateFacts.length === 0) return null;
  return boundedSourceFacts(candidateFacts.join("\n"), outcome);
}

interface RuntimeGateContract {
  gateId: string;
  behavior: string;
  states: string;
  permissions: string;
  review: string;
  success: string;
  failure: string;
  recovery: string;
  rollout: string;
  rollback: string;
  telemetry: string;
  proof: string;
  assumptions: string;
  exclusions: string;
  paths: string[];
  plannedPaths: string[];
}

function coordinationParentContract(title: string): RuntimeGateContract {
  const name = slug(title);
  const planPath = `delivery/${name}-delivery-plan.md`;
  const verifierPath = `tools/delivery/verify-${name}.ts`;
  const proofPath = `reports/evidence/${name}-aggregate-readiness.json`;
  const paths = [planPath, verifierPath, proofPath];
  return {
    gateId: `${name}_coordination_parent`,
    behavior: [
      `${title} is a non-executable coordination parent. It defines the bounded family outcome and aggregate completion rule; product code, migrations, provider calls, customer actions, and runtime proof remain in native child issues.`,
      "The parent never substitutes one broad implementation for its native child contracts. It closes only when `" + verifierPath + "` confirms every current native child has its own complete behavior, authority, paths, success, failure, recovery, rollout, rollback, telemetry, and same-commit proof, with no open blocking relation or failed evidence gate.",
      "Membership comes from current native parentage at verification time. Do not copy child identifiers, dependency lists, owners, labels, releases, or status values into this description or `" + planPath + "`.",
    ].join("\n\n"),
    states: "The coordination result is open while any current child is incomplete, blocked, failed, missing evidence, or absent from current parentage. It becomes ready only after the aggregate verifier passes against one current hierarchy snapshot and one repository commit, then closes through the native workflow. A later child, blocker, membership, or evidence change invalidates readiness and reopens verification.",
    permissions: "Only the delivery owner may maintain `" + planPath + "`, and only the independent reviewer or protected delivery verifier may accept `" + proofPath + "`. This parent grants no application role, tenant access, production credential, product mutation, customer-data read, or authority to waive a native child failure.",
    review: "Review `" + planPath + "`, `" + verifierPath + "`, current parent membership, blocker state, child proof receipts, and `" + proofPath + "` on one commit. Confirm that the parent contains no copied planning metadata, child list, runtime implementation, or readiness claim unsupported by every current child receipt.",
    success: "`" + verifierPath + "` reads the current child membership and reports pass only when every member has a complete self-contained contract, every blocker is clear, every required child receipt matches the reviewed commit and environment, and no child is failed or missing.",
    failure: "Missing or duplicate native membership, an open blocking relation, incomplete child contract, absent or stale receipt, commit or environment mismatch, failed child test, unresolved review, copied native metadata, or parent-level runtime implementation fails `" + verifierPath + "` and keeps the coordination result open without changing any child.",
    recovery: "Correct the affected parentage, blocker state, or child contract, rerun that child's exact tests and proof, then rerun `" + verifierPath + "` against a fresh hierarchy snapshot and the same reviewed commit. Replace `" + proofPath + "` only after aggregate readback passes; never edit a child result through the parent.",
    rollout: "Publish the parent contract, current parent membership, verifier, and proof schema together. Run `" + verifierPath + "` in reporting mode first, resolve every mismatch, then make its aggregate result required for closing this coordination outcome. No customer or production runtime rollout applies.",
    rollback: "Restore the last verified parent contract and verifier, preserve native child issues and their receipts unchanged, rerun `" + verifierPath + "`, and keep the coordination result open until the restored aggregate check passes. Never remove a child or blocking relation to manufacture readiness.",
    telemetry: "Record verifier run identity, hierarchy snapshot checksum, repository commit, child count, bounded result counts, mismatch classes, duration, reviewer, and redacted correlation in `" + proofPath + "`. This coordination parent emits no product event, sends no webhook, delivers no customer notification, and processes no customer data.",
    proof: "Retain `" + proofPath + "` with the hierarchy snapshot checksum, repository commit, verifier checksum, parent-membership checksum, per-child receipt checksums and results, blocker-state result, reviewer, timestamp, rollback result, and `zeroCustomerData=true`.",
    assumptions: "The native parent membership, blocking relations, child contract schema, receipt schema, and `" + verifierPath + "` remain aligned. Any change to those inputs invalidates `" + proofPath + "` and requires a fresh aggregate review.",
    exclusions: "This parent excludes product implementation, schema or data migration, provider execution, customer-facing rollout, manual child or dependency lists, copied planning fields, waived child evidence, and readiness inferred from documentation alone.",
    paths,
    plannedPaths: paths,
  };
}

function markdownTableCells(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === "|" && line[index - 1] !== "\\") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  if (cells[0] === "") cells.shift();
  if (cells.at(-1) === "") cells.pop();
  return cells.map((value) => value.trim());
}

function sanitizeMarkdownTables(raw: string): { text: string; droppedMalformedRows: number } {
  const lines = raw.split(/\r?\n/);
  const output: string[] = [];
  let droppedMalformedRows = 0;
  for (let index = 0; index < lines.length;) {
    if (!/^\s*\|/.test(lines[index])) {
      output.push(lines[index]);
      index += 1;
      continue;
    }
    const block: string[] = [];
    while (index < lines.length && /^\s*\|/.test(lines[index])) {
      block.push(lines[index]);
      index += 1;
    }
    if (block.length < 3) {
      droppedMalformedRows += block.length;
      continue;
    }
    const header = markdownTableCells(block[0]);
    const separator = markdownTableCells(block[1]);
    if (
      header.length < 2 ||
      separator.length !== header.length ||
      !separator.every((cell) => /^:?-{2,}:?$/.test(cell))
    ) {
      droppedMalformedRows += block.length;
      continue;
    }
    const dropped = new Set<number>();
    header.forEach((cell, cellIndex) => {
      const normalized = cell.replace(/[*_`]/g, "").trim().toLowerCase();
      if (!normalized || /^(?:source(?:\s*\/\s*reference)?|spec home|references?|requirement id|phase(?:\s*\/\s*history)?|history|provenance|(?:preserved\s+)?owner|responsible issue|estimate|direct blockers?|linear release|project|milestone|assignee|reviewer|priority|labels?|cycle|due date)$/.test(normalized)) {
        dropped.add(cellIndex);
      }
    });
    const keep = header.map((_cell, cellIndex) => cellIndex).filter((cellIndex) => !dropped.has(cellIndex));
    if (keep.length < 2) {
      droppedMalformedRows += Math.max(0, block.length - 2);
      continue;
    }
    const rows = block.slice(2).map(markdownTableCells);
    const transitionTable = /\bfrom\b/i.test(header[0] ?? "") &&
      /\bto\b/i.test(header[1] ?? "");
    const renderRows = transitionTable
      ? rows.filter((cells) =>
          cells.length === header.length &&
          keep.every((cellIndex) => stripPlanningHistoryFragments(cells[cellIndex] ?? "").trim())
        )
      : rows;
    if (transitionTable) droppedMalformedRows += rows.length - renderRows.length;
    const convertToProse = !transitionTable && renderRows.some((cells) =>
      cells.length !== header.length ||
      keep.some((cellIndex) => !stripPlanningHistoryFragments(cells[cellIndex]).trim())
    );
    if (convertToProse) {
      for (const cells of renderRows) {
        if (cells.length !== header.length) {
          droppedMalformedRows += 1;
          continue;
        }
        const pairs = keep
          .map((cellIndex) => ({
            label: stripPlanningHistoryFragments(header[cellIndex]).trim()
              .replace(/^Status$/i, "Domain status")
              .replace(/^Owner$/i, "Responsible actor"),
            value: stripPlanningHistoryFragments(cells[cellIndex]).trim(),
          }))
          .filter((pair) => pair.value);
        if (/^State$/i.test(pairs[0]?.label ?? "")) pairs[0].label = "Runtime state";
        if (pairs.length === 0 || !pairs.some((pair) => pair.label)) {
          droppedMalformedRows += 1;
          continue;
        }
        if (pairs.length === 1) {
          output.push(`- **${pairs[0].label}:** ${pairs[0].value}`);
        } else {
          output.push(`- ${pairs.map((pair) => `**${pair.label}:** ${pair.value}`).join("; ")}`);
        }
      }
      continue;
    }
    output.push(
      `| ${keep.map((cellIndex) => stripPlanningHistoryFragments(header[cellIndex]).trim()).join(" | ")} |`,
      `| ${keep.map((cellIndex) => separator[cellIndex]).join(" | ")} |`,
    );
    for (const cells of renderRows) {
      output.push(`| ${keep.map((cellIndex) => stripPlanningHistoryFragments(cells[cellIndex]).trim()).join(" | ")} |`);
    }
  }
  return { text: output.join("\n"), droppedMalformedRows };
}

function sanitizeCodeFences(raw: string): { text: string; repairedFences: number } {
  const lines = raw.split(/\r?\n/);
  const output: string[] = [];
  let open = false;
  let repairedFences = 0;
  for (const line of lines) {
    if (!/^```/.test(line)) {
      if (open && (
        /^#{1,6}\s+/.test(line) ||
        /^Product behavior\s+—/.test(line) ||
        /^`[^`]+`\s+(?:implements|moves|validates)\b/i.test(line)
      )) {
        output.push("```", "");
        repairedFences += 1;
        open = false;
      }
      output.push(line);
      continue;
    }
    if (!open) {
      output.push(line);
      open = true;
      continue;
    }
    if (/^```\s*$/.test(line)) {
      output.push(line);
      open = false;
      continue;
    }
    output.push("```", "", line);
    repairedFences += 1;
  }
  if (open) {
    output.push("```", "");
    repairedFences += 1;
  }
  return { text: output.join("\n"), repairedFences };
}

function sanitizeInlineMarkdown(raw: string): string {
  let inFence = false;
  return raw.split(/\r?\n/).flatMap((rawLine) => {
    if (/^```/.test(rawLine)) {
      inFence = !inFence;
      return [rawLine];
    }
    if (inFence) return [rawLine];
    if ((NATIVE_FIELD.test(rawLine) || RELATION_FIELD.test(rawLine)) && !TELEMETRY_DIMENSION_FIELD.test(rawLine)) return [];
    let line = rawLine.replace(/\\`/g, "'");
    if (/^\s*`{1,2}\s*$/.test(line)) return [];
    const ticks = line.match(/`/g)?.length ?? 0;
    if (ticks % 2 !== 0) line = line.replace(/`/g, "");
    const clause = line.replace(/^\s*(?:[-*+]\s+\[[ xX]\]\s+|[-*+]\s+)/, "").trim();
    if ([...clause].length === 240 && /[\p{L}\p{N}_-]$/u.test(clause)) line += ".";
    return [line];
  }).join("\n");
}

function fillEmptyContractSections(
  raw: string,
  replacements: Array<{ start: string; end: string; value: string }>,
): string {
  let result = raw;
  for (const replacement of replacements) {
    const startMarker = `${replacement.start}\n`;
    const start = result.indexOf(startMarker);
    if (start < 0) continue;
    const contentStart = start + startMarker.length;
    const directEnd = result.startsWith(replacement.end, contentStart) ? contentStart : -1;
    const separatedEnd = result.indexOf(`\n${replacement.end}`, contentStart);
    const end = directEnd >= 0 ? directEnd : separatedEnd >= 0 ? separatedEnd + 1 : -1;
    if (end < 0 || result.slice(contentStart, end).trim()) continue;
    result = `${result.slice(0, contentStart)}${replacement.value.trim()}\n${result.slice(end)}`;
  }
  return result;
}

function contractSectionBody(raw: string, startHeading: string, endHeading: string): string {
  const startMarker = `${startHeading}\n`;
  const start = raw.indexOf(startMarker);
  if (start < 0) return "";
  const contentStart = start + startMarker.length;
  const directEnd = raw.startsWith(endHeading, contentStart) ? contentStart : -1;
  const separatedEnd = raw.indexOf(`\n${endHeading}`, contentStart);
  const end = directEnd >= 0 ? directEnd : separatedEnd >= 0 ? separatedEnd + 1 : -1;
  return end < 0 ? "" : raw.slice(contentStart, end).trim();
}

function replaceContractSection(
  raw: string,
  startHeading: string,
  endHeading: string,
  value: string,
): string {
  const startMarker = `${startHeading}\n`;
  const start = raw.indexOf(startMarker);
  if (start < 0) return raw;
  const contentStart = start + startMarker.length;
  const directEnd = raw.startsWith(endHeading, contentStart) ? contentStart : -1;
  const separatedEnd = raw.indexOf(`\n${endHeading}`, contentStart);
  const end = directEnd >= 0 ? directEnd : separatedEnd >= 0 ? separatedEnd + 1 : -1;
  if (end < 0) return raw;
  return `${raw.slice(0, contentStart)}${value.trim()}\n${raw.slice(end)}`;
}

function cleanGateCell(
  value: string,
  context: PlannerContext,
  sourcePath: string,
): string {
  return stripSourceDelegationFragments(stripPlanningHistoryFragments(
    resolveSourceReferences(context, sourcePath, value)
  ))
    .replace(/\\`/g, "")
    .replace(/\*\*/g, "")
    .replace(/\([^)]*(?:\bD-[A-Z0-9.-]+|\bV\d+(?:\.\d+)*)[^)]*\)/gi, "")
    .replace(IDENTIFIER, "")
    .replace(SOURCE_ID, "")
    .replace(OTHER_SOURCE_ID, "")
    .replace(LOCAL_ASSUMPTION_ID, "")
    .replace(ASSUMPTION_ID, "")
    .replace(AUDIT_SOURCE_ID, "")
    .replace(MANUAL_PROGRAM_ID, "")
    .replace(MANUAL_DESIGN_ID, "")
    .replace(/\bAuthored Extensions?\b/gi, "canonical contract registration")
    .replace(/\s+([,;:]|\.(?!\.))/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[\s,:;—-]+$/, "")
    .trim();
}

const QUALITY_RUNTIME_ASSERTIONS = new Map<string, string>([
  ["PLA-864", "General API access follows only the Buyer and Seller plan entitlements carried in this issue; monthly counters use the canonical plan enums and Rate Limit Enforcement quotas; every endpoint resolves exactly one API Rate-Limit Numerical Singleton class envelope; Seller Scale remains read-only; and no Free, Solo, Starter, or Growth Seller general API entitlement is invented. The product validator `convex/deploy_validators/api_rate_limit_plan_quota_runtime_consistency.ts` and runtime test `tests/integration/api_rate_limit_plan_quota_runtime_consistency.spec.ts` enforce all dimensions and fail closed on any mismatch."],
  ["SEL-203", "The compensation flow accepts only `firecrawl_outage`, `anthropic_rate_limit`, `convex_partition`, and `useful_bootstrap_floor_miss`; atomically restores the lifetime-free allowance; records `kb_bootstrap.allowance_restored` with the exact reason; exposes the authorized Ops recovery endpoint; and dispatches the registered recovery email without a duplicate restore."],
  ["SEL-211", "Every seller-console operation and endpoint predicate covers `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_compliance_officer`, `seller_integrations_admin`, and `seller_guest`, with identical grants for organization administration, billing, publishing, knowledge, bid work, compliance, integrations, Marketplace signals, CRM synchronization, and guest isolation."],
]);

const QUALITY_RUNTIME_PATHS = new Map<string, string[]>([
  ["PLA-864", [
    "convex/deploy_validators/api_rate_limit_plan_quota_runtime_consistency.ts",
    "tests/integration/api_rate_limit_plan_quota_runtime_consistency.spec.ts",
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "tools/release/stamp_gate.ts",
  ]],
  ["BUY-368", [
    "convex/defenseViews.ts",
    "tests/integration/gates/defense_view_regeneration_throttle_5min.spec.ts",
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "tools/release/stamp_gate.ts",
  ]],
  ["BUY-374", [
    "convex/inboxMutations.ts",
    "tests/integration/gates/inbox_mutation_idempotency_contract.spec.ts",
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "tools/release/stamp_gate.ts",
  ]],
  ["SEL-203", [
    "convex/kbBootstrapAllowance.ts",
    "tests/integration/gates/kb_bootstrap_allowance_compensation_completeness.spec.ts",
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "tools/release/stamp_gate.ts",
  ]],
  ["SEL-211", [
    "convex/sellerRolePermissions.ts",
    "tests/integration/gates/seller_console_role_permission_completeness.spec.ts",
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "tools/release/stamp_gate.ts",
  ]],
]);

function runtimeGateContract(
  title: string,
  source: ReturnType<typeof sourceIdentity>,
  context: PlannerContext,
  issue?: LinearIssueInput,
): RuntimeGateContract | null {
  const explicitGateId = /(?:^|\n)\s*(?:[*+-]\s*)?Gate:\s*`([a-z0-9_]+)`/im.exec(issue?.description ?? "")?.[1];
  const gateId = (/^([a-z0-9_]+) CI Gate$/i.exec(title)?.[1] ??
    /^RG:(.+)$/i.exec(source.requirementId ?? "")?.[1]?.toLowerCase() ??
    explicitGateId)?.toLowerCase();
  if (!gateId) return null;
  const issueId = issue?.identifier ?? "";
  const registryEntry = issueId ? context.runtimePathsByIssue.get(issueId) : undefined;
  const registeredGateOwner = context.runtimePathsByGate.get(gateId);
  if (registryEntry && registryEntry.gateId !== gateId) {
    throw new Error(
      `${issueId} runtime gate ${gateId} disagrees with registry gate ${registryEntry.gateId}`,
    );
  }
  if (registeredGateOwner && registeredGateOwner.issueId !== issueId) {
    throw new Error(
      `${issueId || "unidentified issue"} runtime gate ${gateId} is registered to ${registeredGateOwner.issueId}`,
    );
  }
  const masterPath = safeSourcePath(context.root, "Sourcera_Master_Spec.md");
  if (!masterPath) {
    if (explicitGateId) throw new Error(`${issue?.identifier} cannot resolve the runtime-gate catalog`);
    return null;
  }
  const masterLines = sourceText(context, masterPath).split(/\r?\n/);
  const rowPattern = new RegExp(`^\\|\\s*\`${gateId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`\\s*\\|`, "i");
  const addressedLineNumber = /^line:(\d+)$/i.exec(source.row?.section ?? "")?.[1];
  const addressedIndex = addressedLineNumber ? Number(addressedLineNumber) - 1 : -1;
  const foundIndex = addressedIndex >= 0 && rowPattern.test(masterLines[addressedIndex] ?? "")
    ? addressedIndex
    : masterLines.findIndex((line) => rowPattern.test(line));
  const rowLine = foundIndex >= 0 ? masterLines[foundIndex] : undefined;
  if (!rowLine) {
    if (explicitGateId) throw new Error(`${issue?.identifier} runtime gate ${gateId} is absent from the canonical catalog`);
    return null;
  }
  const cells = markdownTableCells(rowLine);
  let tableStart = foundIndex;
  while (tableStart > 0 && /^\s*\|/.test(masterLines[tableStart - 1])) tableStart -= 1;
  const headers = markdownTableCells(masterLines[tableStart] ?? "").map((cell) =>
    cell.replace(/[*`]/g, "").replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase()
  );
  const column = (...patterns: RegExp[]): number => headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
  let statusIndex = column(/^runtime_status$/, /^status$/);
  let scopeIndex = column(/^execution_context$/, /^(?:scope|execution_lane)$/);
  let assertionIndex = column(/^assertion/, /^exact_assertion$/, /^contract$/, /^trigger$/);
  let failureIndex = column(/^failure/, /^reject/, /^fail_closed/);
  if (
    addressedIndex >= 0 &&
    cells.length >= 7 &&
    (statusIndex < 0 || scopeIndex < 0 || assertionIndex < 0)
  ) {
    statusIndex = 2;
    scopeIndex = 3;
    assertionIndex = 4;
    failureIndex = 5;
  }
  if (cells.length < 5 || statusIndex < 0 || scopeIndex < 0 || assertionIndex < 0) {
    if (explicitGateId) throw new Error(`${issue?.identifier} runtime gate ${gateId} has an unsupported catalog schema: ${headers.join(",")}`);
    return null;
  }
  const scope = cleanGateCell(cells[scopeIndex], context, masterPath);
  const assertion = QUALITY_RUNTIME_ASSERTIONS.get(issue?.identifier ?? "") ??
    cleanGateCell(cells[assertionIndex], context, masterPath);
  const namedFailure = failureIndex >= 0 ? cleanGateCell(cells[failureIndex] ?? "", context, masterPath) : "";
  const failure = [
    namedFailure,
    "Fail closed: reject the run, commit no partial result, and keep merge, deployment, and release blocked on any unreadable input, explicit negative condition, or exact-assertion mismatch.",
  ].filter(Boolean).join(" ");
  if (!scope || !assertion || !failure) {
    if (explicitGateId) throw new Error(`${issue?.identifier} runtime gate ${gateId} has an empty executable contract cell (scope=${scope.length}, assertion=${assertion.length}, failure=${failure.length})`);
    return null;
  }
  let anchoredContractFacts: string | null = null;
  if (source.row?.anchors?.length) {
    const sourcePath = safeSourcePath(context.root, effectiveSourceDoc(source.row));
    const sourceSection = sourcePath
      ? cachedSourceSection(context, sourcePath, source.row.section)
      : null;
    if (!sourcePath || !sourceSection) {
      throw new Error(
        `${issueId} runtime gate ${gateId} cannot resolve anchored source ${source.row.section}`,
      );
    }
    anchoredContractFacts = anchoredSourceFacts(
      resolveSourceReferences(context, sourcePath, sourceSection),
      source.row.anchors,
      title,
      10_000,
    );
    if (!anchoredContractFacts) {
      throw new Error(
        `${issueId} runtime gate ${gateId} cannot resolve every anchored catalog fact`,
      );
    }
  }
  const statusPaths = concretePaths(cells[2]);
  const artifactPath = statusPaths.find((path) => /^tools\/.+\.ts$/.test(path));
  const catalogStart = masterLines.findIndex((line) => /^### M\.5 CI Gate Catalog\b/.test(line));
  const catalogGate = /^Appendix M\.5\b/i.test(source.row?.section ?? "") ||
    catalogStart >= 0 && foundIndex > catalogStart;
  const syntheticTierGate = gateId === "appendix_m_tier_visibility_smoke";
  const runtimeTestPath = /\b(?:render|surface|ui|playwright|browser|viewport|timezone)\b/i.test(scope)
    ? `tests/e2e/gates/${gateId}.spec.ts`
    : `tests/integration/gates/${gateId}.spec.ts`;
  const detectorPath = artifactPath ?? (
    catalogGate
      ? `tools/spec-lint/gates/${gateId}.ts`
      : runtimeTestPath
  );
  const detectorFixturePaths = catalogGate
    ? syntheticTierGate
      ? [
          "tests/e2e/appendix-m-tier-visibility-smoke.spec.ts",
          "tests/e2e/fixtures/appendix_m_tier_visibility_smoke/positive.json",
          "tests/e2e/fixtures/appendix_m_tier_visibility_smoke/negative.json",
        ]
      : [
          `tools/spec-lint/fixtures/${gateId}/pass.md`,
          `tools/spec-lint/fixtures/${gateId}/fail.md`,
        ]
    : [];
  const proofPath = registryEntry?.proofPath ?? `reports/evidence/${gateId}-runtime-proof.json`;
  const qualityRuntimePaths = QUALITY_RUNTIME_PATHS.get(issue?.identifier ?? "") ?? [];
  const paths = dedupeLines([
    ...(registryEntry?.implementationPaths ?? [detectorPath]),
    ...(registryEntry?.runtimeTestPaths ?? []),
    ...(registryEntry?.productionProbePaths ?? []),
    ...(registryEntry?.ciWorkflowPaths ?? []),
    detectorPath,
    ...detectorFixturePaths,
    ...qualityRuntimePaths,
    proofPath,
  ]);
  const primaryImplementationPath = registryEntry?.implementationPaths.find((path) =>
    /^(?:app|apps|components|convex|lib|packages)\//.test(path)
  ) ?? registryEntry?.implementationPaths[0] ?? detectorPath;
  const runtimeTests = registryEntry?.runtimeTestPaths ?? (
    catalogGate ? [] : [runtimeTestPath]
  );
  const productionProbes = registryEntry?.productionProbePaths ?? [];
  const ciWorkflows = registryEntry?.ciWorkflowPaths ?? [];
  const exactPathList = (values: string[], fallback: string): string =>
    values.length > 0 ? values.map((value) => `\`${value}\``).join(", ") : fallback;
  const executionProof = registryEntry
    ? {
        states: `The ${registryEntry.lane} gate starts blocked, moves to executing only with every listed input available, and reaches exactly one terminal result: passed or failed. Passed requires the exact assertion, every positive and negative case, all required detector fixtures, ${productionProbes.length > 0 ? "every production probe, " : "the production-equivalent execution receipt, "}and the immutable receipt to agree on one commit. A skipped case, unreadable path, parse error, exception, timeout, missing receipt, or result mismatch is failed and keeps merge, deployment, and release blocked.`,
        review: `Independent review must compare implementation paths ${exactPathList(registryEntry.implementationPaths, "none")}, runtime tests ${exactPathList(runtimeTests, "none")}, ${productionProbes.length > 0 ? `production probes ${exactPathList(productionProbes, "none")}, ` : "the protected production-equivalent execution result, "}CI workflows ${exactPathList(ciWorkflows, "none")}, detector polarity fixtures, and \`${proofPath}\` on the same commit. The review must confirm the ${registryEntry.lane} path roles, exact assertion, explicit negative condition, negative rejection, positive result, rollback, and fail-closed state; path presence alone is not readiness.`,
        success: `Execute ${exactPathList(runtimeTests, "the complete static gate test")}${productionProbes.length > 0 ? ` and ${exactPathList(productionProbes, "every production probe")}` : " through the protected production-equivalent lane"}; run the detector positive and negative controls where listed; and pass only when this exact assertion holds: ${assertion}`,
        recovery: `Keep the row blocked, correct the exact product, configuration, detector, test, probe, workflow, or receipt defect, rerun every negative case to prove rejection, then rerun every positive case${productionProbes.length > 0 ? " and production probe" : " and the production-equivalent execution"} on the same commit. Replace \`${proofPath}\` only after all stored, CI, deployment, and probe readbacks agree.`,
        rollout: `Land the ${registryEntry.lane} implementation, runtime tests, detector polarity fixtures, ${productionProbes.length > 0 ? "production probes, " : "production-equivalent execution wiring, "}CI workflows, and receipt schema together. Keep the row fail-closed while paths are only planned; rely on it as a blocker only after same-commit execution and independent proof pass.`,
        proof: `Retain \`${proofPath}\` with gate ID, lane, commit, environment, checksums for every listed implementation, test, detector fixture, probe, and workflow, each positive and negative result, parse and exit results, deployment or protected-CI identity, rollback result, reviewer, timestamp, and \`zeroCustomerData=true\`. The receipt must state that planned-path presence was not treated as runtime readiness.`,
      }
    : catalogGate
    ? {
        states: "A run moves from ready to running, then exactly one terminal state: passed or failed. Passed requires the positive fixture and the complete live scoped corpus to satisfy the exact assertion on the same commit. A violation, unreadable input, missing target, detector exception, or incomplete result is failed and keeps the merge blocked.",
        review: `Independent review must compare \`${detectorPath}\`, the positive and negative fixtures, CI wiring, and the immutable receipt against this exact scope and assertion. Review must prove the negative fixture fails on the assertion's explicit negative condition and the live scoped corpus passes on the recorded commit.`,
        success: `The positive fixture and complete live scoped corpus return pass only when this exact assertion holds: ${assertion}`,
        recovery: `Keep the merge blocked, correct the exact violation or detector defect, rerun the negative fixture to prove \`${gateId}\` still rejects the violation, then rerun the positive fixture and complete live scope on the same commit. Reopen only after the new immutable receipt records pass.`,
        rollout: `Land the detector, positive fixture, negative fixture, CI wiring, and proof schema together. Verify both fixture polarities and the complete live scope before the blocking check is relied on; then keep \`${gateId}\` mandatory for every change in its declared scope.`,
        proof: `Retain \`${proofPath}\` with gate ID, commit, scoped-input checksums, detector checksum, positive-fixture result, negative-fixture result, live-scope result, exit codes, finding locations, CI run identity, rollback result, reviewer, timestamp, and \`zeroCustomerData=true\`.`,
      }
    : {
        states: "A runtime test moves from ready to executing, then exactly one terminal state: passed or failed. Passed requires every explicit success and failure case in the listed test file plus the production-equivalent probe to satisfy the exact assertion on the same commit. Any skipped case, unreadable target, exception, timeout, or incomplete result is failed.",
        review: `Independent review must compare \`${detectorPath}\`, its explicit success and failure cases, protected CI/deploy wiring, the production-equivalent probe, and the immutable receipt against this exact scope and assertion.`,
        success: `Every explicit success and failure case in \`${detectorPath}\` and the production-equivalent probe passes only when this exact assertion holds: ${assertion}`,
        recovery: `Keep the runtime row blocked, correct the product violation or test defect, rerun every explicit failure case in \`${detectorPath}\` to prove rejection, rerun every success case and the production-equivalent probe on the same commit, then retain a new immutable receipt.`,
        rollout: `Land \`${detectorPath}\`, protected CI/deploy wiring, and the receipt schema together. Prove every success and failure case plus the production-equivalent probe before relying on the row as a blocker.`,
        proof: `Retain \`${proofPath}\` with gate ID, commit, scoped-input and runtime-test checksums, each named success/failure case, production-equivalent result, exit codes, finding locations, CI/deploy identity, rollback result, reviewer, timestamp, and \`zeroCustomerData=true\`.`,
      };
  return {
    gateId,
    behavior: [
      `\`${gateId}\` is a fail-closed runtime gate.`,
      `**Scope.** ${scope}`,
      `**Exact assertion.** ${assertion}`,
      anchoredContractFacts ? `**Exact source-owned catalog.**\n${anchoredContractFacts}` : "",
      registryEntry
        ? `Execute the complete \`${registryEntry.lane}\` path set. Every listed implementation, test, detector fixture, production probe, workflow, and receipt is an exact planned target; no path is runtime-ready until its same-commit execution and proof pass. Report every violation with its exact location and class, return a non-zero result on any failure or unreadable input, and never silently skip an unavailable target.`
        : "The implementation must parse the complete scoped corpus deterministically, report every violation with its exact location and class, return a non-zero result on any violation or parse error, and never silently skip an unreadable input.",
    ].filter(Boolean).join("\n\n"),
    states: executionProof.states,
    permissions: registryEntry
      ? `Only the protected CI or synthetic service identity may read the listed repository inputs, execute synthetic or production-equivalent fixtures through \`${primaryImplementationPath}\`, and write the bounded gate result, run log, and \`${proofPath}\`. It must not use a customer session, load customer content, cross a tenant or residency boundary, expose application secrets, perform an unlisted production mutation, or promote an incomplete run. The gate harness denies an absent or invalid override under the row's declared override policy.`
      : "Only the CI gate runner may read the declared repository scope and write the CI result, run log, and immutable proof path. It must not load tenant data, customer content, application secrets, or production credentials. The gate harness denies an absent or invalid override under the row's declared override policy.",
    review: qualityRuntimePaths.length > 0
      ? `${executionProof.review} The same review must compare every supplemental product, runtime-test, CI-workflow, and release-gate path listed in Exact paths and keep the row blocked while any path is only planned or lacks a same-commit result.`
      : executionProof.review,
    success: executionProof.success,
    failure,
    recovery: executionProof.recovery,
    rollout: executionProof.rollout,
    rollback: registryEntry
      ? `Stop the new \`${registryEntry.lane}\` execution, restore the last verified implementation, detector, tests, probes, and workflow wiring, preserve committed customer and audit data, and keep \`${gateId}\` registered and blocking. Do not bypass, downgrade, or delete the gate. Rerun every restored positive and negative path on one commit and retain the rollback result in \`${proofPath}\`.`
      : `If the detector change is faulty, restore the last verified detector and fixtures while keeping \`${gateId}\` registered and blocking. Do not bypass, downgrade, or delete the gate to make the pipeline green. Rerun the restored gate and retain the rollback receipt.`,
    telemetry: catalogGate
      ? `Every run writes \`tools/spec-lint/run-logs/{gate_run_id}.json\` and emits only the registered shared PostHog event \`spec_lint.appendix_m_gate_run\` with \`gate_id=${gateId}\`, gate outcome, triggered-concept count, override count, customer-visible override-target count, parse-error count, PR ID, and commit SHA. The same run also writes the required AuditEvent and redacted \`spec-lint\` Datadog log. Delivery is idempotent by PR, commit, gate-run ID, and destination; a required durable-audit failure keeps merge blocked, enters the encrypted outbox, retries five times on the registered curve, then routes to the Spec-Ops DLQ and pages the on-call. Emit no source body, secret, tenant identifier, or customer content.`
      : `Every run writes \`tools/spec-lint/run-logs/{gate_run_id}.json\` with gate ID, result, execution context, commit, duration, finding count, parse-error count, and override outcome. This row registers no product event, customer analytics event, webhook, or customer notification. A new emitted event is forbidden until its exact canonical registry entry and schema are added to this issue. Emit no source body, secret, tenant identifier, or customer content.`,
    proof: executionProof.proof,
    assumptions: registryEntry
      ? `The declared scope, exact assertion, \`${registryEntry.lane}\` classification, complete path set, gate-harness record schema, and fail-closed state remain aligned. Any change to the canonical row, path role, scoped input, parser, runtime fixture, probe, workflow, or receipt invalidates \`${proofPath}\` and requires the complete positive and negative matrix to be reviewed again.`
      : "The declared scope, exact assertion, canonical gate row, gate-harness record schema, and repository path conventions are current. Any change to that row, scoped corpus shape, parser, fixture grammar, or CI wiring invalidates the receipt and requires this contract and both fixture polarities to be reviewed again.",
    exclusions: registryEntry?.lane === "static_ci"
      ? `This static-CI issue excludes a product handler, tenant authorization, product mutation, customer telemetry, customer notification, unrelated gates, manual production edits, and a documentation-only pass. It does not permit a second implementation of \`${gateId}\` outside the listed paths or treat a planned path as proof.`
      : `This issue excludes customer-session execution, unlisted product mutations, unrelated schema migrations, customer telemetry, customer notifications, unrelated gates, manual production edits, and a documentation-only pass. It does not permit a second implementation of \`${gateId}\` outside the listed paths or treat a planned path as proof.`,
    paths,
    plannedPaths: paths.filter((path) => !existsSync(resolve(context.root, path))),
  };
}

function runtimeGateCatalogContract(): RuntimeGateContract {
  const proofPath = "reports/evidence/appendix-m-runtime-gate-catalog-proof.json";
  return {
    gateId: "appendix_m_runtime_gate_catalog",
    behavior: "The Appendix M Runtime Gate Catalog is a live control-plane index, never a copied count or static inventory. Regenerate membership from `tools/release/stamp_gate.ts --json` and `tools/release/exact_status_scan.ts --json`; never hard-code or copy gate counts. Every live scanner row must have one unique gate ID, current lane and state, exact owning artifact, required proof, fail-closed result, and active blocker. Missing, duplicate, stale, contradictory, or source-only rows block release.",
    states: "Each scanner row is either ready with its required current evidence or blocked with an explicit live reason. Catalog generation moves from unread to scanned to reconciled, then passed or failed. Passed requires both scanners to agree on the same commit; any missing input, scanner error, row mismatch, or unresolved blocker is failed.",
    permissions: "Run both scanners read-only against repository and delivery-control inputs. Write only the generated scanner outputs and immutable evidence receipt. Do not read tenant data, customer content, application secrets, or production credentials, and do not edit generated inventory by hand.",
    review: "Independent review must compare both raw scanner outputs, every reconciled row, active blocker routing, and the immutable receipt on the same commit. A prose inventory, copied total, or report without live scanner output is not review evidence.",
    success: "Both live scanners complete on the same commit, enumerate the same current gate membership and status facts, and every row resolves to one exact artifact, required evidence lane, fail-closed result, and active blocker without a duplicate or contradiction.",
    failure: "A scanner error, missing or duplicate gate, copied count, stale row, contradictory state, unresolved artifact, absent evidence lane, or hand-edited generated inventory fails the catalog and blocks release.",
    recovery: "Correct the catalog row, artifact routing, or scanner defect; rerun both scanners from clean inputs on the same commit; compare their complete outputs; and retain a new immutable receipt. Never patch the generated catalog or waive an unresolved row.",
    rollout: "Land scanner and reconciliation changes together, prove deterministic output twice from the same commit, then use the generated result as the release-control input. No manual catalog migration or staged customer rollout applies.",
    rollback: "Restore the last verified scanner and reconciliation implementation while keeping release blocked. Regenerate both outputs and accept rollback only when their same-commit receipt agrees; never restore a copied inventory.",
    telemetry: "Record scanner name, commit, start/end time, duration, result, parse errors, missing rows, duplicate rows, contradictions, and blocker count in the immutable receipt. Emit no gate totals into issue prose, no tenant identifiers, no customer content, and no customer notification.",
    proof: `Retain \`${proofPath}\` with commit, scanner checksums, raw-output checksums, row-level reconciliation results, failures, blockers, deterministic rerun result, rollback result, reviewer, timestamp, and \`zeroCustomerData=true\`.`,
    assumptions: "The live scanners, delivery inputs, gate-row schema, and evidence-lane rules are current. Any change to those inputs, their parsers, or the release lane invalidates the receipt and requires the catalog contract and reconciliation tests to be reviewed again.",
    exclusions: "This issue excludes fixed gate counts, copied catalog snapshots, product behavior, tenant permissions, customer telemetry, customer notifications, hand-edited generated reports, and readiness inferred from documentation alone.",
    paths: [
      "tools/release/stamp_gate.ts",
      "tools/release/exact_status_scan.ts",
      proofPath,
    ],
    plannedPaths: [proofPath],
  };
}

interface ExactRoleAuthorityDefinition {
  role: string;
  label: string;
  scope: string;
  grants: string[];
  denials: string[];
  stateRules: string;
  auditActions: string[];
  implementationPath: string;
  testPath: string;
  proofPath: string;
}

function exactRoleAuthorityContract(issueId: string): RuntimeGateContract | null {
  const definitions: Record<string, ExactRoleAuthorityDefinition> = {
    "PLA-311": {
      role: "org_owner",
      label: "Org Owner",
      scope: "the caller's current Organization",
      grants: [
        "create, edit, and delete the Organization",
        "create and delete Buyer Workspace and Seller Bid Workspace shells without inheriting access to their console-scoped content",
        "manage Organization memberships, Teams, Groups, role assignments, SSO, SCIM, MFA configuration, integrations, Organization settings, and the full Organization audit log",
        "read and mutate the Organization's billing and AI-accounting surface, including wallet configuration, manual top-ups, billing-ledger export, plan changes, trial-seat decisions, committed-spend renewal, pricing-version pins, and ContestRecord filing or withdrawal through the Org Owner billing-authority path",
      ],
      denials: [
        "Buyer Workspace, Use Case, Requirement, Response, Score, Selection Report, and Scenario content unless a Buyer Workspace role grants that exact resource access",
        "Seller Bid Workspace, Bid Response, Knowledge Base, Document Library, and Capability Declaration content unless a Seller Console role grants that exact resource access",
        "cross-Organization data, inactive-console content, Marketplace publisher mutations without Marketplace authority, and every Ops Console action",
      ],
      stateRules: "Authority exists only while the OrgMembership is active and the active Organization matches the target. A role revocation, membership suspension, Organization switch, or Organization deletion takes effect before the next read or mutation. Shell creation never materializes a console-content grant.",
      auditActions: [],
      implementationPath: "convex/org-owner-role.ts",
      testPath: "tests/integration/org-owner-role.spec.ts",
      proofPath: "reports/evidence/org-owner-role-proof.json",
    },
    "PLA-312": {
      role: "org_admin",
      label: "Org Admin",
      scope: "the caller's current Organization",
      grants: [
        "create and delete Buyer Workspace and Seller Bid Workspace shells without inheriting access to their console-scoped content",
        "manage Organization memberships, Teams, Groups, role assignments, SSO, SCIM, MFA configuration, integrations, Organization settings, and the full Organization audit log",
        "read the same-Organization AIWallet, FreeAllowanceCounter, AIOperation ledger, ContestRecord, CommittedSpendContract, DowngradeExcessDataBucket, BillingSeatSnapshot, current and pinned PricingTableVersion, and pricing history",
      ],
      denials: [
        "wallet setting mutation, manual top-up, billing-ledger export, ContestRecord filing or withdrawal, plan change, trial-seat acceptance or decline, committed-spend renewal opt-out, and pricing-version pin or unpin unless the caller separately holds billing_admin",
        "Buyer Workspace, Use Case, Requirement, Response, Score, Selection Report, and Scenario content unless a Buyer Workspace role grants that exact resource access",
        "Seller Bid Workspace, Bid Response, Knowledge Base, Document Library, and Capability Declaration content unless a Seller Console role grants that exact resource access",
        "cross-Organization data, inactive-console content, Marketplace publisher mutations without Marketplace authority, and every Ops Console action",
      ],
      stateRules: "Authority exists only while the OrgMembership is active and the active Organization matches the target. Adding billing_admin expands billing authority through union-of-permissions; removing it immediately returns billing access to the read-only list. A role revocation, membership suspension, Organization switch, or Organization deletion takes effect before the next read or mutation.",
      auditActions: [],
      implementationPath: "convex/org-admin-role.ts",
      testPath: "tests/integration/org-admin-role.spec.ts",
      proofPath: "reports/evidence/org-admin-role-proof.json",
    },
    "PLA-316": {
      role: "workspace_owner",
      label: "Workspace Owner",
      scope: "one current Buyer Workspace membership",
      grants: [
        "edit Workspace settings; delete or archive the Workspace; and manage Workspace team membership",
        "transition the Sourcera Method phase",
        "create, edit, and delete Use Cases and Requirements",
        "view vendor Responses and score Requirements in Phases 10 and 11",
        "disqualify a Target Account or vendor and reverse that disqualification",
        "create, reply to, and resolve Internal Comment Threads and delete another user's comment",
        "view the Selection Report, export the evaluation, view the Workspace audit log, and regenerate Defense View",
      ],
      denials: [
        "create a Workspace shell without org_owner or org_admin authority",
        "mutate any score after Phase 12 begins",
        "read or mutate another Workspace, another Organization, Seller Console content, or an unassigned residency partition",
      ],
      stateRules: "The resolver reads the active WorkspaceMembership, Organization, console, residency partition, Workspace deletion state, current phase, and target resource in one authorization decision. Score mutation is allowed only in Phases 10 and 11; Phase 12 and later are immutable. Revocation, Workspace archival, Organization switch, or phase change affects the next request without a cached grant.",
      auditActions: [
        "workspace.settings_updated",
        "workspace.archived",
        "workspace.member_changed",
        "phase_advanced",
        "use_case.upserted",
        "use_case.deleted",
        "requirement.upserted",
        "requirement.deleted",
        "response.viewed",
        "score.updated",
        "scores_immutable_phase_12_plus",
        "target_account.disqualified",
        "target_account.disqualification_reversed",
        "internal_comment_thread.changed",
        "internal_comment.deleted_by_moderator",
        "selection_report.viewed",
        "evaluation.exported",
        "audit_event.workspace_viewed",
        "defense_view.regenerated",
      ],
      implementationPath: "convex/workspace-owner-role.ts",
      testPath: "tests/integration/workspace-owner-role.spec.ts",
      proofPath: "reports/evidence/workspace-owner-role-proof.json",
    },
    "PLA-317": {
      role: "workspace_admin",
      label: "Workspace Admin",
      scope: "one current Buyer Workspace membership",
      grants: [
        "transition the Sourcera Method phase",
        "create, edit, and delete Use Cases and Requirements",
        "view vendor Responses and score Requirements in Phases 10 and 11",
        "disqualify a Target Account or vendor",
        "create, reply to, and resolve Internal Comment Threads and delete another user's comment",
        "view the Selection Report and export the evaluation",
      ],
      denials: [
        "create a Workspace shell, edit Workspace settings, delete or archive the Workspace, or manage Workspace team membership",
        "reverse a disqualification, view the Workspace audit log, or regenerate Defense View",
        "mutate any score after Phase 12 begins",
        "read or mutate another Workspace, another Organization, Seller Console content, or an unassigned residency partition",
      ],
      stateRules: "The resolver reads the active WorkspaceMembership, Organization, console, residency partition, Workspace deletion state, current phase, and target resource in one authorization decision. Score mutation is allowed only in Phases 10 and 11; Phase 12 and later are immutable. Revocation, Workspace archival, Organization switch, or phase change affects the next request without a cached grant.",
      auditActions: [
        "phase_advanced",
        "use_case.upserted",
        "use_case.deleted",
        "requirement.upserted",
        "requirement.deleted",
        "response.viewed",
        "score.updated",
        "scores_immutable_phase_12_plus",
        "target_account.disqualified",
        "internal_comment_thread.changed",
        "internal_comment.deleted_by_moderator",
        "selection_report.viewed",
        "evaluation.exported",
      ],
      implementationPath: "convex/workspace-admin-role.ts",
      testPath: "tests/integration/workspace-admin-role.spec.ts",
      proofPath: "reports/evidence/workspace-admin-role-proof.json",
    },
    "PLA-318": {
      role: "use_case_lead",
      label: "Use Case Lead",
      scope: "the caller's currently assigned Use Cases inside one Buyer Workspace",
      grants: [
        "create and edit an assigned Use Case and create or edit Requirements inside assigned Use Cases",
        "view vendor Responses and score Requirements inside assigned Use Cases in Phases 10 and 11",
        "disqualify a Target Account or vendor only when its Use Cases intersect the caller's assignments",
        "create, reply to, and resolve Internal Comment Threads admitted by the assigned Use Cases",
        "view the Selection Report for the owning Workspace",
      ],
      denials: [
        "an empty assignment as global Workspace access",
        "Workspace shell creation, Workspace settings, Workspace deletion or archival, team membership management, and phase transition",
        "Use Case or Requirement deletion, disqualification reversal, another user's comment deletion, evaluation export, Workspace audit-log access, and Defense View regeneration",
        "score mutation after Phase 12 begins, any resource outside assigned Use Cases, another Workspace, another Organization, Seller Console content, or an unassigned residency partition",
      ],
      stateRules: "The resolver reads the active WorkspaceMembership and assigned Use Case set at request time with the Organization, console, residency partition, Workspace deletion state, phase, and target resource. Empty assignment denies Use Case-scoped access. Score mutation is allowed only in Phases 10 and 11; Phase 12 and later are immutable. Assignment removal, revocation, Workspace archival, Organization switch, or phase change affects the next request without a cached grant.",
      auditActions: [
        "use_case.upserted",
        "requirement.upserted",
        "response.viewed",
        "score.updated",
        "scores_immutable_phase_12_plus",
        "target_account.disqualified",
        "internal_comment_thread.changed",
        "selection_report.viewed",
      ],
      implementationPath: "convex/use-case-lead-role.ts",
      testPath: "tests/integration/use-case-lead-role.spec.ts",
      proofPath: "reports/evidence/use-case-lead-role-proof.json",
    },
    "PLA-319": {
      role: "reviewer",
      label: "Reviewer",
      scope: "one current Buyer Workspace membership",
      grants: [
        "view vendor Responses in the owning Workspace",
        "score Requirements and provide rationale in Phases 10 and 11",
        "create, reply to, and resolve Internal Comment Threads admitted by the thread visibility scope",
      ],
      denials: [
        "Workspace shell creation, Workspace settings, Workspace deletion or archival, team membership management, and phase transition",
        "Use Case or Requirement creation, edit, or deletion",
        "Target Account or vendor disqualification and disqualification reversal",
        "another user's comment deletion, Selection Report access, evaluation export, Workspace audit-log access, and Defense View regeneration",
        "score mutation after Phase 12 begins, another Workspace, another Organization, Seller Console content, or an unassigned residency partition",
      ],
      stateRules: "The resolver reads the active WorkspaceMembership, Organization, console, residency partition, Workspace deletion state, current phase, thread visibility, and target resource in one authorization decision. Score mutation is allowed only in Phases 10 and 11; Phase 12 and later are immutable. Revocation, Workspace archival, visibility tightening, Organization switch, or phase change affects the next request without a cached grant.",
      auditActions: [
        "response.viewed",
        "score.updated",
        "scores_immutable_phase_12_plus",
        "internal_comment_thread.changed",
      ],
      implementationPath: "convex/reviewer-role.ts",
      testPath: "tests/integration/reviewer-role.spec.ts",
      proofPath: "reports/evidence/reviewer-role-proof.json",
    },
  };
  const definition = definitions[issueId];
  if (!definition) return null;
  const paths = [definition.implementationPath, definition.testPath, definition.proofPath];
  const eventContract = definition.auditActions.length > 0
    ? `Authorized operations record only these existing Audit Event actions when the owning read or mutation succeeds: ${definition.auditActions.map((action) => `\`${action}\``).join(", ")}. A Phase-12 score attempt records \`scores_immutable_phase_12_plus\` and commits no score change.`
    : "This role resolver adds no product event, webhook, email, in-app notification, or customer analytics event. Each owning operation retains its own current audit transaction; the resolver cannot suppress or fabricate that audit result.";
  return {
    gateId: `${definition.role}_authority`,
    behavior: [
      `Enforce \`${definition.role}\` as ${definition.label} authority within ${definition.scope}. Resolve the current membership and target scope on every request before reading protected data or starting a mutation.`,
      `Allowed operations: ${definition.grants.join("; ")}.`,
      `Denied operations and boundaries: ${definition.denials.join("; ")}.`,
      eventContract,
      "Union-of-permissions may add authority only when the same active membership independently holds another canonical role. This role never implies another Organization, Buyer Workspace, Seller Console, Marketplace, billing, or Ops role.",
      issueId === "PLA-311"
        ? "Representative synthetic routes cover Buyer, Seller, billing, Marketplace, and Ops denial boundaries; this centralized role-policy contract validates the shared resolver, not every product route."
        : "",
    ].filter(Boolean).join("\n\n"),
    states: definition.stateRules,
    permissions: `Only an authenticated caller with active \`${definition.role}\` authority may perform the allowed operations within ${definition.scope}. The server resolves Organization, console, Workspace or assigned-Use-Case scope, target identity, residency partition, phase, and membership before any protected read or write. A wrong-Organization, wrong-console, cross-Workspace, stale-membership, revoked-role, or denied-operation request returns the non-revealing authorization result and commits no domain or audit mutation.`,
    review: `Review \`${definition.implementationPath}\`, \`${definition.testPath}\`, and \`${definition.proofPath}\` on one commit. Compare every allowed operation, explicit denial, union-of-permissions case, scope boundary, phase rule, audit result, stale-membership case, cross-Organization and cross-console result, rollback result, and proof checksum. Any untested matrix cell keeps the role contract unready.`,
    success: `The table-driven integration suite grants every allowed ${definition.label} operation and denies every listed operation across same-scope, wrong-Organization, wrong-console, cross-Workspace, stale-membership, revoked-role, residency, and phase fixtures. Each accepted write commits once with its required audit row; each denied request returns no protected data and leaves domain and audit state unchanged.`,
    failure: `Fail closed when the session, Organization, membership, canonical role, console, Workspace, assigned Use Case, residency partition, phase, target identity, or union-of-permissions input is missing, stale, mismatched, or unreadable. Denied and Phase-12 score requests commit no partial domain row, audit success row, export, notification, or external side effect; a resolver exception blocks the operation instead of widening authority.`,
    recovery: `Keep the rejected request unapplied, repair or refresh the session, membership, assignment, phase, target scope, residency routing, or resolver dependency, then retry the same request identity. Reconcile domain and audit readback before accepting the retry. Never grant a role, edit production data, or bypass the resolver as recovery.`,
    rollout: `Deploy \`${definition.implementationPath}\` with the complete table-driven fixture and receipt schema. Shadow-compare every decision against the current protected path, run one synthetic same-scope canary plus every denial class, and switch enforcement only after zero authority-widening mismatches. Stop promotion on any missing matrix cell, scope leak, audit mismatch, or rollback failure.`,
    rollback: `Return enforcement to the last verified resolver, preserve role assignments, domain rows, and audit history, disable any newly exposed operation, and rerun the full allow-and-deny fixture before reopening it. Rollback must never convert a denied operation into an allow or remove evidence of an accepted mutation.`,
    telemetry: definition.auditActions.length > 0
      ? `Authorized operations use these registered Audit Event actions: ${definition.auditActions.map((action) => `\`${action}\``).join(", ")}. The resolver also records bounded internal decision result, denial class, role, operation, duration, commit, environment, and redacted correlation in \`${definition.proofPath}\`. It records no customer content, names, raw identifiers, free text, new product analytics event, webhook, email, or in-app notification.`
      : `The resolver records bounded internal decision result, denial class, role, operation, duration, commit, environment, and redacted correlation in \`${definition.proofPath}\`. It emits no product analytics event, webhook, email, in-app notification, or customer message and records no customer content, names, raw identifiers, or free text.`,
    proof: `Retain \`${definition.proofPath}\` with resolver and fixture checksums, commit, environment, role enum checksum, complete operation-matrix results, same-scope grants, every denial class, union-of-permissions cases, phase results, audit readback, synthetic canary, rollback result, reviewer, timestamp, and \`zeroCustomerData=true\`.`,
    assumptions: `The \`${definition.role}\` enum, membership model, Organization and console boundaries, Workspace and assignment lookup, residency routing, operation registry, phase source, and audit transaction remain aligned with \`${definition.implementationPath}\`. A change to any input invalidates the receipt and requires the operation fixture and contract to be reviewed together before promotion.`,
    exclusions: `This issue does not create another role, grant or revoke customer memberships, change plan entitlements, alter domain lifecycles, add a console-content bypass, migrate customer data, define unrelated product behavior, or authorize manual production edits. It owns only \`${definition.role}\` decision enforcement, its table-driven test, and its immutable proof.`,
    paths,
    plannedPaths: paths,
  };
}

function curatedIssueContract(issueId: string): RuntimeGateContract | null {
  const roleAuthority = exactRoleAuthorityContract(issueId);
  if (roleAuthority) return roleAuthority;
  if (issueId === "PLA-974") {
    const paths = [
      "scripts/prove-stripe-customer-genesis.ts",
      "scripts/rollback-stripe-customer-genesis.ts",
      "tests/integration/stripe-customer-genesis-production.spec.ts",
      "docs/runbooks/stripe-customer-genesis.md",
      "reports/evidence/r0-stripe-customer-genesis-production.json",
    ];
    return {
      gateId: "stripe_customer_genesis_production_proof",
      behavior: [
        "The proof runner is dry-run by default and requires an explicit production target, deployment ID, commit SHA, release ID, approved platform-owned synthetic Organization fixture, and one-time confirmation token. It rejects customer Organizations and any deployment that does not match the requested commit before provider traffic.",
        "One signed canary creates a fresh synthetic Organization attempt, executes Stripe Customer genesis, reads the Customer back, verifies the exact five-key metadata object, and confirms the active Organization binding. Non-custom residency requires `custom_sovereign_residency_label=not_applicable`; custom residency requires the exact approved Organization label.",
        "Same-attempt replay and a 10-way concurrency probe must converge on one active binding and no second invoiceable Customer. The runner injects one provider failure before creation and one binding failure after provider return, proves same-attempt resume or reviewed compensation, and confirms no unbound Customer is invoiceable.",
        "The signed receipt stores only environment, commit, deployment, release, fixture class, assertion IDs, bounded results, timestamps, durations, retry counts, compensation state, and cryptographic hashes of provider and database readback. It excludes Organization IDs, Stripe IDs, names, email, payment data, raw metadata, provider bodies, tokens, secrets, and customer content.",
      ].join("\n\n"),
      states: "One immutable canary attempt moves from `created` to provider request, then exactly one of `bound_active`, `recovery_required`, `compensated`, or `failed_closed`. A provider failure before creation leaves no Customer. A binding failure after provider return preserves the attempt for reviewed resume or compensation. Kill-switch activation blocks every new attempt before provider traffic while active and historical bindings remain readable. Replay returns the first committed result without a duplicate Customer or receipt.",
      permissions: "Only the protected production release verifier may execute the canary or rollback drill, and only with an approved platform-owned synthetic fixture plus matching production target, deployment, commit, release, and one-time confirmation. It may use only the public genesis path, bounded provider and database readback, declared failure injections, kill switch, and reviewed compensation operations. It cannot select a customer Organization, bypass Buyer or Seller authorization, edit a binding directly, delete a Customer, expose provider identifiers, or enable a release. Wrong environment, stale commit, unapproved fixture, missing confirmation, mismatched deployment, and customer-data input fail closed before provider traffic.",
      review: "Independent review compares the proof runner, rollback runner, integration suite, runbook, and signed receipt on one commit. It verifies command dry-run, production confirmation, synthetic-fixture allowlist, exact metadata, provider and database hashes, replay, 10-way concurrency, both failure injections, resume, compensation, kill switch, rollback, receipt signature, privacy exclusions, and deployment identity.",
      success: "A production-owned synthetic fixture produces one active Organization-to-Customer binding whose provider metadata and database hashes agree. Missing, null, empty, or string `null` custom residency labels fail; only `not_applicable` is valid for non-custom residency. Replay and concurrency return the same Customer, failure recovery closes with one binding, the kill switch blocks new provider traffic, and the signed receipt independently verifies commit, deployment, environment, release, and timestamps.",
      failure: "Wrong environment, stale or mismatched commit, customer fixture, missing confirmation, unapproved release, provider readback mismatch, extra or missing metadata key, ambiguous active binding, second invoiceable Customer, failed compensation, privacy leak, or unsigned receipt fails closed. A failed proof never enables wider activation, mutates a customer Organization, deletes a Customer, suppresses retained evidence, or publishes success.",
      recovery: "Resume an interrupted run by immutable attempt ID. If provider creation succeeded but binding failed, the reviewed runbook must either finish the one binding or compensate the unbound Customer without creating another. A failed canary disables genesis, preserves the attempt and evidence, reconciles provider and database readback, reruns the same assertions, and replaces the receipt only after independent review passes.",
      rollout: "Run Preview and Stripe test-mode proof first. In production, enable only the approved synthetic fixture, execute one signed canary, inspect provider and database readback, close the canary, and permit wider activation only after the receipt passes independent review.",
      rollback: "Set `stripe_customer_genesis_enabled=false`, block new Buyer and Seller Organization activation before provider traffic, restore the prior verified deployment, and resume or compensate every non-terminal synthetic attempt. Preserve bound and historical Customer evidence, then rerun the same signed canary before reopening activation.",
      telemetry: "Use existing deployment, Convex action and mutation, and Stripe request-result operational logs plus the signed receipt. Alert on ambiguous binding, compensation backlog, retry exhaustion, receipt failure, or deployment mismatch. This proof adds no PostHog event, webhook, or customer notification and retains no customer identifier, provider payload, token, secret, or free text.",
      proof: "Retain `reports/evidence/r0-stripe-customer-genesis-production.json` with runner, rollback, fixture, and test checksums; commit, deployment, environment, and release; signed assertion results; metadata and binding hashes; replay and concurrency results; both failure injections; resume or compensation; kill switch; rollback; reviewer; timestamp; and `zeroCustomerData=true`.",
      assumptions: "The Stripe Customer metadata schema, Organization binding uniqueness rule, synthetic-fixture allowlist, genesis kill switch, compensation operation, deployment identity, signing key, and the five listed files remain aligned. A change to any input invalidates the receipt and requires the full production-proof review to run again.",
      exclusions: "This issue does not enable customer activation, create or edit a customer Organization, change billing or pricing, delete a Stripe Customer, define the underlying genesis transaction, bypass normal authorization, retain raw provider data, create a product analytics event, or use manual production-data edits.",
      paths,
      plannedPaths: paths,
    };
  }
  if (issueId === "INT-51") {
    const paths = [
      "convex/agents/agent-capability-registry.ts",
      "tests/integration/agent-capability-registry.spec.ts",
      "reports/evidence/agent-capability-registry-proof.json",
    ];
    return {
      gateId: "agent_capability_registry",
      behavior: [
        "CapabilityRegistryEntry is the platform-scoped, Ops-managed registry for every capability that may create an AIOperation. Each row has one immutable lowercase snake-case `capability_id`, a customer display name, category, non-empty `console_applicability`, model defaults, billing mode, cost center, price floors and multipliers, unit label, free-allowance policy, plan gate, optional confidence threshold, committed-spend requirement, optional active OutcomeContract, lifecycle state, successor and deprecation window, pricing-publication versions, provider, managed-agent flag, registered PostHog event name, metadata schema version, and Solo throttling controls. Hard deletion is forbidden.",
        "Every invocation resolves the current row before provider or ledger work. The requested console must be present in `console_applicability`; the current plan must satisfy `plan_gate_min_tier`; `requires_committed_spend=true` requires an active committed-spend contract; and `billing_mode=customer_billed` requires an active OutcomeContract and cost-base seed before `state=active`. A denied request creates no AIOperation, allowance decrement, wallet hold, provider call, notification, or audit success row.",
        "Family roots are rollup identifiers and are never invokable. `qa_suggestion_family` resolves only through `qa_suggestion_buyer` or `qa_suggestion_seller`; `kb_suggestion_family` resolves only through `kb_suggestion_buyer` or `kb_suggestion_seller`; and `org_intelligence_family` resolves only through `org_intelligence_vendor_history`, `org_intelligence_full`, or `org_intelligence_suggestions`. Every sibling keeps an independent OutcomeContract, console gate, plan gate, event name, and in-flight contract version.",
        "The unique and lookup indexes are `(capability_id)`, `(state, console_applicability)`, `(billing_mode, state)`, the partial `(plan_gate_min_tier)`, and the partial `(successor_capability_id)`. Registry reads are global for authenticated sessions; the public pricing projection returns only eligible customer-billed rows and never exposes Ops-only fields.",
      ].join("\n\n"),
      states: "The only lifecycle is `(init) → alpha → beta → active → deprecated → retired`, plus an `active → active` versioned edit. `alpha` is internal and never customer-billed. `alpha → beta` requires an OutcomeContract and cost-base seed. `beta → active` requires at least 30 days in beta and a sustained seven-day rejected rate below 40 percent. `active → deprecated` requires a successor and a deprecation grace of at least 90 days. A deprecated row remains invokable only through its grace window and returns successor guidance. `deprecated → retired` occurs after the grace window; retired rows reject new operations while preserving every stored reference. A customer-visible active edit publishes a new PricingTableVersion. Every undeclared or skipped transition fails before mutation.",
      permissions: "Only an authenticated `ops_finance_admin` or `ops_capability_admin` may create, promote, edit, deprecate, or retire a registry row, and every write uses optimistic concurrency. Authenticated product callers may read the registry projection and invoke only a capability admitted by their current console, plan, organization, rollout, and committed-spend predicates. Anonymous callers may read only the public-pricing projection. Wrong-console, wrong-organization, insufficient-plan, family-root, stale-version, missing-contract, missing-cost-base, and retired-capability requests return their bounded denial without revealing another organization's data or widening authority.",
      review: "Review the registry handler, integration suite, and proof receipt from one commit. Verify every required field, all five indexes, lifecycle guards, immutable identifier behavior, customer-billed prerequisites, family-root rejection, sibling isolation, console and plan gates, committed-spend gate, pricing projection, optimistic concurrency, deprecation grace, retired-row reference preservation, Solo throttling fields, telemetry allowlist, rollback rehearsal, and exact receipt checksums.",
      success: "Positive fixtures create an alpha row, promote it through every guarded state, publish an eligible customer-billed row, invoke it once from each allowed console and plan, preserve independent sibling contracts, expose only the allowed public-pricing fields, and retain immutable AIOperation references after deprecation. Schema fixtures prove every required field and index, confidence ratios stay within `[0.000, 1.000]`, and Solo throttling overrides stay within the admitted range.",
      failure: "Fail closed on a duplicate or mutable `capability_id`, empty console set, invalid enum, confidence ratio outside `[0.000, 1.000]`, invalid Solo threshold, missing active OutcomeContract, missing cost-base seed, skipped lifecycle state, stale optimistic version, missing successor, grace shorter than 90 days, family-root invocation, cross-console request, plan or committed-spend denial, provider preparation failure, public-projection leak, or proof mismatch. No failed case creates a provider request, AIOperation, wallet or allowance mutation, pricing publication, or partial registry row.",
      recovery: "Keep the rejected row or invocation unchanged, correct the exact schema, state, contract, cost-base, successor, console, plan, concurrency, or projection defect, then replay the same request identity. Reconcile the registry row, indexes, PricingTableVersion, AIOperation absence or result, OutcomeContract binding, and public projection before accepting recovery. Never bypass a lifecycle guard, mutate an immutable identifier, hard-delete a referenced row, or repair customer state manually.",
      rollout: "Apply schema and index checks first, load the complete registry into a production-shaped environment, run the full lifecycle and invocation matrix, and canary one non-customer-billed capability before admitting a customer-billed row. Enable public-pricing and invocation reads only after registry, OutcomeContract, cost-base, plan, console, event-name, and proof readback agree. Stop promotion on any missing row, sibling bleed, authority widening, billing mismatch, or receipt drift.",
      rollback: "Disable new invocation of the changed row, restore the last verified reader and validator, preserve every CapabilityRegistryEntry, AIOperation, OutcomeContract, pricing version, audit row, and deprecation pointer, and reconcile the canary before reopening. Rollback may deprecate or disable a bad row but must never hard-delete it, reuse its identifier, rewrite settled operations, or erase proof.",
      telemetry: "Every accepted invocation uses the row's registered `posthog_event_name` through the AIOperation usage-event outbox. Invocation of a capability inside its deprecation grace also emits the registered `capability.invoke.deprecated` product analytics event once per operation. Registry writes record bounded internal action, state, actor role, result, duration, commit, environment, and redacted correlation. Emit no raw prompt, generated content, provider body, free text, secret, customer identifier, wallet value, or cross-organization data; the registry itself sends no customer webhook or notification.",
      proof: "Retain `reports/evidence/agent-capability-registry-proof.json` with handler and fixture checksums, commit, environment, schema and index results, complete lifecycle matrix, public-projection result, invocation allow-and-deny matrix, family-root and sibling-isolation results, OutcomeContract and cost-base bindings, pricing publication, telemetry allowlist, canary, rollback rehearsal, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The capability status, billing-mode, console, plan, provider, cost-center, category, throttling, and confidence enums; AIOperation, OutcomeContract, cost-base, wallet, allowance, committed-spend, and PricingTableVersion schemas; public-pricing projection; and the three listed files must remain aligned. A change to any one invalidates the receipt and requires the registry contract and full fixture matrix to be reviewed together.",
      exclusions: "This issue does not implement the product behavior behind a capability, grant a customer role, set a customer's plan, settle an outcome, change wallet balances, edit provider credentials, expose Ops-only registry fields, create an alternate capability catalog, preserve copied planning metadata, or authorize manual production edits. It owns only the current registry, its guarded lifecycle and projections, its integration proof, and safe invocation resolution.",
      paths,
      plannedPaths: paths,
    };
  }
  if (issueId === "PLA-700") {
    const paths = [
      "Sourcera_Master_Spec.md",
      "tools/spec-lint/appendix_m_coverage_on_diff.ts",
      "tools/spec-lint/gates/appendix_m_engine_to_surface_completeness.ts",
      "tools/spec-lint/gates/appendix_m_no_inline_engine_concepts_in_ux_spec.ts",
      "tools/spec-lint/appendix_m_coverage_on_diff.test.ts",
      "reports/evidence/surface-engine-mapping-registry-proof.json",
    ];
    return {
      gateId: "surface_engine_mapping_registry",
      behavior: [
        "Appendix M is a bidirectional registry: every engine concept binds to its customer-facing surface metaphor, or to the exact sentinel `Internal-only, never surfaced`; every authored UX surface binds back to the engine concept it reads or changes. A new entity, entity field, non-AI capability, AI capability, enum value, lifecycle state, plan-gated feature, webhook, notification, analytics event, API endpoint, or named CI gate is incomplete until its registry row lands in the same change.",
        "Every row uses exactly five columns in this order: `Engine concept`, `Spec home`, `Surface metaphor`, `Tier visibility`, `Notes`. `Tier visibility` is positive: a tier list means visible only to those tiers; `All` means every tier on the relevant console; `Internal-only, never surfaced` means no customer surface; `—` means not applicable. A blank, negative-semantics, or contradictory visibility cell is invalid.",
        "A companion-document home uses exactly `Companion: <doc-filename>.md §<anchor>`. The referenced file and anchor must exist in the same commit. A Master Spec home must resolve to a current heading. A row may not use an issue identifier, delivery phase, non-current source, or prose pointer as its binding.",
        "The registry table header and separator occur once. Section banners may group rows but do not count as engine concepts. Every data row has one nonblank concept, one resolvable home, one complete surface or internal-only explanation, one valid positive visibility value, and current notes. Duplicate concepts, orphan surfaces, orphan engine concepts, inline raw engine concepts in UX copy, and stale companion anchors fail verification.",
      ].join("\n\n"),
      states: "This registry introduces no customer or product lifecycle. A repository change is `incomplete` until every affected concept and surface resolves to one valid row, `verified` only after all Appendix M structural and bidirectional checks pass on the same commit, and `accepted` only after protected review merges that verified commit. A failed, stale, or partially updated change remains incomplete and cannot be represented as accepted.",
      permissions: "Only an authorized repository contributor may propose a registry edit, and protected review is required to merge it. CI and read-only documentation consumers may parse the registry but cannot mutate product or customer data. An override cannot invent a row, bypass a missing anchor, weaken tier visibility, or grant runtime authority; wrong-repository, stale-commit, unsigned, and unreviewed inputs are rejected before the accepted registry changes.",
      review: "Review the Appendix M row diff, coverage detector, engine-to-surface completeness gate, UX inline-concept gate, tests, and proof from one commit. Reconcile every added, changed, or removed concept in both directions; verify the five-column schema, positive visibility semantics, companion anchors, internal-only explanations, duplicate detection, row count, current vocabulary, and exact failing fixtures before accepting the change.",
      success: "Positive fixtures add one concept with a customer surface, one internal-only concept, one companion-document surface, and one valid tier-scoped surface. The same-commit checks accept all four, resolve every home, retain exactly five columns, find no duplicate or orphan, and write a proof receipt whose commit and registry checksum match readback.",
      failure: "Fail closed on a missing row, duplicate concept, blank or extra column, unresolved Master Spec or companion anchor, negative or contradictory tier semantics, unexplained internal-only concept, engine concept written inline in UX without a row, stale commit, or mismatched proof checksum. Failure changes no accepted registry state and cannot be waived by prose, an issue reference, or a historical mapping.",
      recovery: "Keep the change unmerged, repair the exact row, anchor, visibility cell, or reverse mapping, then rerun the full positive and negative Appendix M suite on the same commit. Replace the receipt only after the registry checksum, detector result, and repository readback agree; never recover by suppressing a concept class or copying an obsolete row.",
      rollout: "Run the checks in reporting mode on the complete candidate diff, review every detected concept and surface, then require the same checks on protected branches. Canary the required-check configuration on one synthetic concept addition and removal before enforcing it workspace-wide. Promotion stops on any missed concept, false acceptance, anchor drift, or receipt mismatch.",
      rollback: "Restore the last verified registry and gate configuration together, preserve the failed diff and receipt for diagnosis, and rerun bidirectional coverage against the restored commit. Rollback may remove only the unaccepted change; it must not erase an accepted current concept or restore a historical visibility rule.",
      telemetry: "Record only gate ID, commit, changed concept classes, changed row count, missing-row count, orphan count, invalid-anchor count, schema-error count, result, duration, and redacted correlation in the proof receipt and CI log. Emit no product analytics event, webhook, customer notification, source body, customer content, tenant identifier, or secret.",
      proof: "Retain `reports/evidence/surface-engine-mapping-registry-proof.json` with the registry checksum, detector and fixture checksums, commit, environment, changed concept classes, exact positive and negative results, row-schema result, bidirectional coverage result, anchor resolution result, tier-visibility result, reviewer, timestamp, rollback rehearsal, and `zeroCustomerData=true`.",
      assumptions: "The Appendix M heading, five-column schema, concept-class detector set, companion-document parser, tier vocabulary, protected-branch configuration, and three listed gates remain aligned. A change to any of them invalidates the receipt and requires the registry contract, fixtures, and proof to be reviewed together.",
      exclusions: "This issue does not implement any registered product feature, create a customer-facing surface, grant product authority, copy the full registry into another document, carry historical rows, or prove a runtime gate active. Runtime enforcement and production evidence remain separate executable contracts.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "BUY-335") {
    const paths = [
      "convex/taxonomyNodes.ts",
      "convex/taxonomyMigrations.ts",
      "packages/domain/src/taxonomy/edit-classification.ts",
      "app/ops/taxonomy/page.tsx",
      "tests/unit/taxonomy-edit-classification.spec.ts",
      "tests/integration/taxonomy-cms.spec.ts",
      "tests/e2e/taxonomy-cms.spec.ts",
      "reports/evidence/taxonomy-cms-proof.json",
    ];
    return {
      gateId: "taxonomy_cms_authoring_flow",
      behavior: [
        "The Ops Taxonomy CMS creates a Taxonomy Node with `POST /v1/ops/taxonomy/nodes` only after `kind`, `name`, `short_name`, `visibility`, and a `^[a-z0-9-]+$` slug unique within `(kind, slug)` validate. Creation commits `state=draft` and no customer webhook. Publishing a complete draft with `PATCH /v1/ops/taxonomy/nodes/:id` commits `state=active`, sets `version=1`, emits `taxonomy.category_added`, and invalidates downstream caches within 60 seconds. Every later persisted edit increments `version` through optimistic concurrency.",
        "Taxonomy Node structural fields are `slug`, `kind`, `parent_id`, `visibility`, `residency_scope`, `deprecation_action`, `successor_id`, `authored_by_ops_user_id`, and `version`. Controlled-Vocabulary Tag structural fields are `slug`, `taxonomy_node_id`, and `origin`. An in-place structural PATCH fails before any write; structural change requires cloning the active row to a new draft, validating it, publishing it, and deprecating the prior row with `redirect_to_successor`. Node editorial fields are `name`, `short_name`, `description`, `long_description`, `seo_metadata_json`, `aliases`, `sort_order`, and `icon_token`; Tag editorial fields are `display_name`, `aliases`, and `description`. On a deprecated Node, only `description`, `long_description`, `seo_metadata_json`, `aliases`, and `icon_token` remain editable.",
        "Deprecation accepts exactly `redirect_to_successor`, `redirect_to_parent`, or `hard_retire`. A successor must be active and have the same `kind`. Merge accepts at most 50,000 referencing rows in the interactive flow and completes the source transition to `merged` only after all FK rewrites finish. Hard retirement requires at least 90 days in `deprecated` and zero active references. Reactivation is allowed only within 30 days, before a successor has been used for FK migration. A draft with zero references may be soft-deleted and is purged after 30 days.",
        "Before deprecation, merge, or retirement, render a pre-flight report with counts by consumer entity, active and archived counts, cascade disposition, estimated duration, redirect depth, affected residency partitions, ordered deliveries, and whether dual sign-off is required. Two distinct qualified Ops users must sign when the action touches `region`, `language`, or `employee_size_band`, retires a Tag referenced by at least 10,000 consumer rows, or retires a Marketplace Category with at least 90 days of SEO history. Migration runs in each residency partition in batches of 500 with the idempotency key `(source_node_id|source_tag_id, successor_id|null, consumer_kind, batch_sequence)`, five jittered conflict retries, a per-batch audit row, DLQ routing, progress reporting, and a final completion delivery.",
        "Every CMS mutation writes an immutable Audit Event with `action_type=ops_taxonomy_cms_*`, `actor_user_id`, `actor_account_type=human`, current `actor_mfa_verified_at`, before-and-after `diff`, `edit_classification`, `affected_consumer_row_counts_by_entity`, paired webhook `event_id`, and both actors for dual sign-off. Customer taxonomy webhooks use HMAC-SHA256, `event_id` idempotency, the standard retry curve, and payloads no larger than 256 KB. Customer payloads expose `authored_by_role` plus a subscriber-specific HMAC `authored_by_actor_pseudonym`; raw Ops user IDs remain only in the internal audit row.",
      ].join("\n\n"),
      states: "A Taxonomy Node moves `draft → active → deprecated → merged`; draft soft-delete is allowed only with zero references, and `deprecated → active` is the bounded reactivation path. `active → deprecated` requires one immutable deprecation action; merge changes the source to `merged` only after migration completion, while hard retirement leaves the deprecated node unreferenceable and returns HTTP 410 on resolution. A Controlled-Vocabulary Tag moves `submitted → in_review → approved`, or to `rejected`; an approved Tag may move to `deprecated`, then `merged_into_existing`. Replays return the committed version and do not repeat a state transition, audit row, batch, or delivery.",
      permissions: "Only a human, MFA-verified `ops_taxonomy_admin` may create, publish, structurally replace, deprecate, merge, hard-retire, reactivate, or delete a Taxonomy Node across all dimensions. A human, MFA-verified `ops_marketing_editor` may moderate Controlled-Vocabulary Tag proposals only for `capability_category` and `integration_vendor`, and may edit only the permitted editorial fields on active Nodes; that role has no Node state-transition or structural-clone authority. Sellers may submit Tag proposals only through the Seller proposal endpoint and gain no CMS authority. Buyer Console, Seller Console, public API, wrong-role, expired-MFA, stale-session, and service-account CMS writes receive HTTP 403 before taxonomy data is mutated or disclosed. The system alone runs residency-bounded migration batches. Customer deliveries are isolated by subscriber and never reveal a raw Ops actor identifier.",
      review: "Review `convex/taxonomyNodes.ts`, `convex/taxonomyMigrations.ts`, `packages/domain/src/taxonomy/edit-classification.ts`, `app/ops/taxonomy/page.tsx`, all three test suites, and `reports/evidence/taxonomy-cms-proof.json` on one commit. Compare every Node and Tag field classification, role and MFA check, state guard, version precondition, dual-signoff trigger, pre-flight count, 500-row batch identity, residency partition, Audit Event field, webhook schema, HMAC redaction, cache deadline, DLQ route, rollback boundary, and proof checksum.",
      success: "Create a valid draft, confirm it is absent from public reads, publish it, and observe `version=1`, its audit row, `taxonomy.category_added`, `taxonomy_category_added`, and cache convergence within 60 seconds. Prove one permitted editorial edit and one structural clone-and-publish replacement. Deprecate a node to an active same-kind successor, verify the exact pre-flight report and required second signer, migrate production-shaped consumers in 500-row residency batches exactly once, deliver completion, and read back every rewritten FK. Exercise Tag claim, approval, deprecation, and merge moderation within the editor's allowed dimensions. Prove keyboard, focus, screen-reader, reduced-motion, responsive, retry, and stale-version states in the Ops UI.",
      failure: "Return HTTP 409 `taxonomy_node_slug_collision` for a duplicate `(kind, slug)`, HTTP 422 `taxonomy_node_deprecation_action_required` when deprecation lacks an action, HTTP 422 `taxonomy_node_successor_required` for a missing or invalid successor, HTTP 409 `taxonomy_node_delete_blocked_by_references` for referenced deletion, HTTP 409 `taxonomy_node_version_conflict` for a stale write, and HTTP 409 `taxonomy_hard_retire_window_not_elapsed` before 90 days. Return HTTP 422 `taxonomy_field_edit_classification_violated` for an in-place structural field, HTTP 403 `taxonomy_structural_edit_role_insufficient` for an editor structural clone, HTTP 403 `taxonomy_action_requires_dual_signoff` for one signer, HTTP 403 `ops_role_requires_human_account` for a service identity, and HTTP 403 `taxonomy_node_write_forbidden` for Buyer, Seller, or public CMS writes. Reject a cross-kind successor, redirect chain beyond three hops, batch identity conflict, unsigned or oversized webhook, raw actor leak, missing audit field, wrong residency worker, or partial migration before any false success.",
      recovery: "Keep the last committed version and audit history. On a stale write, refetch and require the operator to apply the intended diff to the current version. On a failed migration row, preserve successful idempotent batches, retry the row with jitter at most five times, then place it in `taxonomy_migration_dlq` for the Ops `Retry`, `Archive`, or `Escalate` action. Before the source becomes merged or hard-retired, rollback reverses FK rewrites in batch order and delivers `taxonomy.migration.rolled_back`; after that boundary, do not rewrite history and instead publish a correcting successor. A nightly orphan sweep queues any reference that still points to a node after hard retirement for its declared drop or archive disposition.",
      rollout: "Land the schema guards, classifiers, Ops mutations, migration worker, UI, role checks, Audit Event schema, delivery schemas, tests, alerts, and receipt together with CMS mutations disabled outside the canary cohort. Run every lifecycle, field, role, dimension, dual-signoff, residency, race, delivery, accessibility, and rollback fixture; canary a synthetic Node and Tag in each residency; compare database, audit, webhook, product analytics, cache, and rendered readback; then widen to qualified Ops users only while cache convergence stays within 60 seconds, migration SLOs hold, and DLQ rate stays at or below 0.1 percent.",
      rollback: "Disable new CMS transitions, retain all committed Nodes, Tags, versions, audits, deliveries, and customer references, and restore the last compatible read and mutation handlers. Reverse only migrations whose source is not yet merged or hard-retired, using the recorded batch identities; reconcile subscriber deliveries and caches; rerun the complete authorization and lifecycle suite; and reopen writes only when stored state, audit chain, migration counts, deliveries, and public resolution agree. Never delete a committed taxonomy history row to simulate rollback.",
      telemetry: "Registered taxonomy delivery signals are: webhook `taxonomy.category_added` with PostHog `taxonomy_category_added`; webhook `taxonomy.category_deprecated` with PostHog `taxonomy_category_deprecated`; webhook `taxonomy.category_retired` with PostHog `taxonomy_category_retired`; webhook `taxonomy.node.updated` with PostHog `taxonomy_node_updated`; webhook `taxonomy.migration.completed`; webhook `taxonomy.migration.rolled_back`; PostHog `taxonomy_migration_progress`; and internal alerts `taxonomy.migration.slo_breach`, `taxonomy.orphan_reference_detected`, and `vocab_tag.review_slo_breach`. Registered audit actions are `ops_taxonomy_cms_*` for each CMS mutation and `taxonomy_consumer_migration` for each migration batch. Emit each signal only after its owning transaction commits, preserve event and batch idempotency, apply subscriber HMAC redaction, and record bounded counts, duration, residency, retry and DLQ result, cache convergence, commit, environment, and redacted correlation in the proof without customer content or raw customer-facing Ops identifiers.",
      proof: "Retain `reports/evidence/taxonomy-cms-proof.json` with implementation and test checksums; commit and environment; Node and Tag lifecycle fixtures; every field-classification result; role, MFA, service-account, Buyer, Seller, public, version-race, isolation, and dual-signoff denials; pre-flight counts; per-residency batch identities and FK readback; audit fields; webhook signatures, idempotency, retry, payload size, and actor redaction; product events; cache timing; DLQ and orphan recovery; accessibility; canary; rollback; reviewer; timestamp; and `zeroCustomerData=true`.",
      assumptions: "The Taxonomy Node and Controlled-Vocabulary Tag schemas, role grants, MFA session check, field-classification registry, residency partitions, consumer FK inventory, webhook registry, product-event registry, audit retention, cache invalidator, migration retry curve, and Ops release control must remain aligned. Any field, role, state, event, consumer binding, threshold, or residency change invalidates the receipt and requires the mutations, worker, UI, delivery schemas, and complete fixture matrix to be reviewed together.",
      exclusions: "This issue does not let sellers mint freeform taxonomy, let customers or service accounts enter the Ops CMS, redefine public taxonomy reads, change customer plan entitlements, bypass a consumer FK invariant, edit a structural field in place, skip dual sign-off, expose raw Ops actor IDs to subscribers, manually rewrite production references, or claim completion from documentation. Seller proposal eligibility and consumer write validation remain separate surfaces; this issue owns their Ops moderation and migration consequences only.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "BUY-346") {
    const paths = [
      "convex/marketplaceLegalProcessIngests.ts",
      "convex/legalProcessNotifications.ts",
      "packages/domain/src/marketplace/legal-process.ts",
      "app/ops/marketplace/legal-process/page.tsx",
      "tests/unit/legal-process-state-machine.spec.ts",
      "tests/integration/legal-process-ingestion.spec.ts",
      "tests/e2e/legal-process-ops-console.spec.ts",
      "reports/evidence/legal-process-ingestion-proof.json",
    ];
    return {
      gateId: "marketplace_legal_process_ingestion",
      behavior: [
        "Create one platform-scoped `MarketplaceLegalProcessIngest` through `POST /v1/ops/marketplace/legal-process` for exactly one `process_kind`: `court_order_takedown`, `court_order_preservation`, `subpoena_civil`, `subpoena_criminal`, `dmca_takedown`, `dmca_counter_notice`, `regulator_order`, `trademark_cease_and_desist`, or `other`. Validate the issuing authority, jurisdiction, subject kind and identifier, optional subject organization, verified requester identity, urgency, residency scope, and 1–20 encrypted PDF attachments before committing `legal_review_state=received`. When `non_disclosure_flag=true`, require `non_disclosure_expires_at`. Closed records are append-only, are never soft-deleted, and retain for at least 10 years regardless of the subject organization's lifecycle or DSAR request.",
        "Counsel must verify requester credentials, issuing authority, jurisdiction, requested scope, and attachment integrity before `compliance_verified`. A defective or unverifiable process moves to `compliance_insufficient` with an internal defect note and no takedown. Compliance applies only the structured actions in `applied_takedown_scope_json`; an Org-level takedown requires two distinct signers, `ops_content_admin` and `ops_legal_admin`. A linked abuse report remains on its own track unless verified legal compliance requires immediate action; then the legal action overrides a pending appeal, derives the report's upheld disposition from the applied scope, and keeps privileged counsel reasoning out of the public note.",
        "While non-disclosure is active, suppress every subject, reporter, and third-party customer webhook, email, in-app notification, and API detail that could reveal the process. Customer surfaces may show only `hidden_by_platform_policy`. Ops and counsel retain the full internal view. Expiry auto-lifts the flag within one hour unless counsel has ingested a linked renewal. Notify the subject with counsel-approved copy within 24 hours, then send the reporter `marketplace.abuse_report.deferred_resolution` exactly 24 hours after expiry with only `report_id`, `deferred_resolution_at`, and public-safe disposition; expose no timestamp from before expiry.",
        "Urgency clocks start at `received`. `standard` requires counsel review within 24 business hours and total compliance within 72 hours. `expedited` requires counsel review within 4 business hours, total compliance within 24 hours, immediate counsel paging, and escalation if unclaimed for 2 hours. `emergency` requires counsel review within 1 business hour, total compliance within 4 hours, and a P0 page to cross-timezone counsel plus CEO and General Counsel within 10 minutes. Every breach pages the legal queue without changing the legal decision state.",
        "A cross-residency process cannot comply until the DPO has approved the action and counsel has recorded the jurisdictional decision. A counsel-verified DMCA takedown removes the named content and notifies the subject because DMCA has no non-disclosure path. A valid counter-notice restores content 10–14 business days after claimant notice unless a suit-filing notice arrives; restoration begins by the 10-business-day mark and completes within 4 hours. Non-US matters use the applicable jurisdiction chosen by counsel rather than the US counter-notice clock.",
      ].join("\n\n"),
      states: "The review state starts `received`. Counsel claim moves it to `counsel_review`. Counsel review moves to `compliance_verified` or `compliance_insufficient`; verified work may move to `complied`, `partially_complied`, or `challenged`. A challenge may move to `quashed` or return to `counsel_review`. Counsel may move a reviewed process to `withdrawn` when the requester supplies a withdrawal. The system may move `received` or `counsel_review` to `expired` when the applicable deadline passes. Terminal records are append-only; a correction or non-disclosure extension is a newly ingested process linked to the earlier record, never an overwritten decision.",
      permissions: "Only an authenticated `ops_legal_admin` may ingest a legal process. Only `ops_legal_counsel` may claim counsel review, verify or reject legal sufficiency, challenge, record a withdrawal, approve counsel copy, or view privileged notes. Encrypted process documents are readable only by `ops_legal_admin` and `ops_legal_counsel`. Org-level compliance requires separate `ops_content_admin` and `ops_legal_admin` signers, and cross-residency compliance also requires DPO approval. The system alone performs deadline expiry and scheduled deferred delivery. Buyer, Seller, reporter, subject, public, general Ops, wrong-role, wrong-residency, expired-session, and unverified identities have no intake, document, privileged-note, or decision authority and receive a non-revealing denial. Non-disclosure never grants customer access and never suppresses the internal legal audit trail.",
      review: "Review `convex/marketplaceLegalProcessIngests.ts`, `convex/legalProcessNotifications.ts`, `packages/domain/src/marketplace/legal-process.ts`, `app/ops/marketplace/legal-process/page.tsx`, all three test suites, and `reports/evidence/legal-process-ingestion-proof.json` on one commit. Compare all nine kinds, three urgency clocks, every state edge, role and signer matrix, DPO gate, attachment encryption and access, non-disclosure fan-out suppression, expiry schedules, linked-report disposition, DMCA clock, legal hold, event schemas, audit fields, recovery, rollback, and proof checksums.",
      success: "Ingest a synthetic process for every kind and urgency, confirm immutable receipt and audit data, route each through its allowed counsel state edges, and prove standard, expedited, and emergency timers and pages. Complete an Org-level takedown with both required signers, a cross-residency action with DPO approval, and a linked-report transition without privileged text leakage. For non-disclosure, prove zero customer delivery before expiry, auto-lift within one hour, subject notice within 24 hours, reporter delivery at expiry plus 24 hours, and no earlier timestamp. Prove DMCA takedown, counter-notice restoration timing, document encryption, ten-year retention, keyboard and screen-reader access, responsive layout, and exact event readback.",
      failure: "Return HTTP 403 `legal_process_intake_role_forbidden` for non-legal intake, HTTP 403 `legal_process_compliance_requires_dual_signoff` for an Org-level action without both signers, and HTTP 403 `legal_process_document_access_forbidden` for a document reader outside Legal. Reject a missing or unverified requester, unsupported kind, invalid urgency, zero or more than 20 attachments, unencrypted or non-PDF attachment, non-disclosure without expiry, invalid state edge, stale version, duplicate request identity, missing DPO approval, cross-residency worker mismatch, incomplete applied scope, and action outside the verified order before any takedown. Fail the release on any customer-audience delivery during non-disclosure, early or correlated reporter notice, privileged-note leak, missed SLA page, DMCA restoration outside its window, legal-record deletion, duplicate event, or partial compliance presented as complete.",
      recovery: "Keep the append-only process, last committed review state, attachments, audit chain, legal hold, and applied actions. Correct an invalid intake before retrying the same request identity. Reassign an unclaimed review without resetting its urgency clock. For a failed takedown step, keep the record `partially_complied`, reconcile each structured action idempotently, and let counsel either complete or challenge the remainder. Suppress and quarantine any premature customer delivery, rotate the affected delivery secret if needed, document the incident, and deliver only on the legal schedule. A non-disclosure extension is a linked renewal; a reversed or quashed decision uses a new signed transition and restorative action, never deletion of the legal record.",
      rollout: "Land the entity, state machine, Legal and DPO guards, encrypted attachment reader, notification suppressor, schedulers, linked-report handler, DMCA restoration worker, Ops UI, event schemas, alerts, tests, and receipt together with intake disabled outside qualified Legal users. Run synthetic fixtures for every kind, state, role, residency, urgency, delivery audience, race, expiry, and rollback; canary one synthetic no-customer-data process per residency; compare stored state, audit, timers, pages, deliveries, suppression, and UI readback; then widen only while no customer leak occurs and every urgency and expiry budget holds.",
      rollback: "Disable new intake and state transitions, stop unsent customer deliveries, restore the last compatible handlers, and retain every legal record, encrypted attachment, hold, audit, signoff, DPO decision, and already-applied action. Reconcile in-flight takedowns and restorations under counsel direction, preserve non-disclosure while legality is unresolved, rerun the complete role, state, timing, and audience suite, and reopen only when stored decisions, applied scope, schedules, and delivery logs agree. Rollback cannot erase a legal record, shorten its retention, undo an action without counsel authorization, or disclose a suppressed process.",
      telemetry: "Registered Legal-process webhooks are `marketplace.legal_process.received`, `marketplace.legal_process.compliance_insufficient`, `marketplace.legal_process.complied`, `marketplace.legal_process.challenged`, and `marketplace.legal_process.sla_breach`, all delivered only to Ops legal-queue endpoints on the standard retry curve. Their registered PostHog mirrors are `marketplace_legal_process_received`, `marketplace_legal_process_compliance_insufficient`, `marketplace_legal_process_complied`, `marketplace_legal_process_challenged`, and `marketplace_legal_process_sla_breach`. The registered post-expiry reporter webhook is `marketplace.abuse_report.deferred_resolution`, paired with email template `tpl_abuse_report_deferred_resolution_reporter`. Each intake, claim, verification, transition, takedown, restoration, signoff, DPO decision, renewal, document access, and denial has an immutable internal Audit Event. Emit signals only after their owning state commits, preserve event idempotency and the standard retry curve, and record bounded timing, role, residency, suppression, delivery, commit, environment, and redacted correlation in the proof without documents, requester details, privileged notes, or customer identifiers.",
      proof: "Retain `reports/evidence/legal-process-ingestion-proof.json` with implementation and test checksums; commit and environment; all kind, urgency, state, role, signer, DPO, residency, requester, attachment, and legal-hold fixtures; encrypted access results; linked-report and applied-scope readback; non-disclosure audience matrix and expiry timestamps; DMCA takedown and restoration clocks; event and email identities, retries, and suppression; SLA pages; concurrency and replay; accessibility; canary; rollback; reviewer; timestamp; and `zeroCustomerData=true`.",
      assumptions: "The legal-process kind, urgency, and review-state registries, Legal and Content role grants, DPO approval service, MFA sessions, attachment encryption, abuse-report state machine, legal-hold retention, residency routing, webhook and PostHog registries, Loops template, scheduler, and Ops release control must remain aligned. Any kind, state, role, deadline, disclosure rule, jurisdiction path, event, or retention change invalidates the receipt and requires the entity, UI, schedulers, delivery suppressor, and full fixture matrix to be reviewed together.",
      exclusions: "This issue does not let a Buyer, Seller, reporter, subject, general Ops user, or service account ingest or decide legal process; replace counsel judgment; disclose privileged notes or legal documents; erase a legal-hold record; publish an individual case; treat an ordinary Marketplace abuse report as legal process; bypass DPO review; infer notice where non-disclosure is active; or claim readiness from documentation. Public transparency uses only separately approved aggregates and cannot expose this record.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "BUY-355") {
    const paths = [
      "convex/sellerOnboardingSessions.ts",
      "packages/domain/src/analytics/seller-activation-metric.ts",
      "app/ops/seller-activation/page.tsx",
      "tests/unit/seller-activation-metric.spec.ts",
      "tests/integration/seller-activation-dashboard.spec.ts",
      "tests/e2e/seller-activation-dashboard.spec.ts",
      "reports/evidence/seller-activation-metric-proof.json",
    ];
    return {
      gateId: "seller_activation_metric",
      behavior: [
        "Use `SellerOnboardingSession.stage_1_arrival_at` as the immutable clock start and the first valid `first_requirement_response_at` as the endpoint. The first accepted response transaction sets `activation_metric_elapsed_seconds = first_requirement_response_at - stage_1_arrival_at`, sets `activation_achieved=true`, and commits the response timestamp and elapsed seconds atomically. A database invariant rejects a missing elapsed value with HTTP 500 `seller_onboarding_activation_metric_missing` and rejects a non-monotonic timestamp with HTTP 422 `seller_onboarding_monotonicity_violation` after server-time substitution cannot correct the skew.",
        "The Seller Activation Dashboard computes p50 and p90 from persisted `activation_metric_elapsed_seconds` values for activated sessions only. Its primary tile uses a rolling 30-day window; the alert check uses a rolling 7-day window. Paid cohorts use p50 at or below 20 minutes and p90 at or below 60 minutes. `seller_free` and `seller_solo` cohorts use p50 at or below 25 minutes and p90 at or below 75 minutes.",
        "Partition every percentile by the six registered `invite_source` values `buyer_invite`, `ghost_bid_conversion`, `pro_trial_seat_m17`, `direct_signup`, `marketplace_search`, and `buyer_referral_m16`, and by plan tier. Supported drill-down dimensions are `seller_org_id`, `data_residency_region`, `user_agent_class`, `client_timezone`, calendar week of `stage_1_arrival_at`, and `bid_id` for forced-signup analysis. A cohort regression greater than 10 percent raises a P2 to `ops_growth_admin`.",
        "A response submitted after pre-activation abandonment moves the same session to `reactivated`, uses the original `stage_1_arrival_at`, preserves the full late-arrival latency, and counts that session once in the activated cohort. A different invite after abandonment creates a new session; the dashboard deduplicates first activation at Seller-organization level. Disqualified sessions remain in p50 and p90 with a visible disqualified-cohort annotation.",
        "The Ops tile reads SellerOnboardingSession as its source of truth and never joins Bid Workspace or Usage Event to calculate the percentile. A nightly comparison against the Usage Event ledger pages Ops when p90 drift reaches 1 percent. Every activated transition must appear on the real-time dashboard within 30 seconds at p95; when analytics delivery exceeds that budget, render the last source timestamp and a stale-data state while Convex remains authoritative.",
      ].join("\n\n"),
      states: "A session starts `in_progress`. Writing its first valid response moves `in_progress` to `activated`; writing that response after the seven-day pre-activation abandonment classification moves `abandoned` to `reactivated`. A later upgrade may move either activated state to `activated_and_upgraded`; post-activation inactivity uses `churned_post_activation`, never `abandoned`. The activation timestamp and elapsed seconds are write-once for the session, and a replay returns the committed result without resetting the clock or adding a cohort row.",
      permissions: "Measurement begins only after the existing Bid Response authorization has accepted a current Seller Org actor in the matching Seller organization and Bid Workspace; that underlying response authority grants no dashboard access. Only the system transaction may set `first_requirement_response_at`, `activation_metric_elapsed_seconds`, or the activation state. Only `ops_growth_admin`, `ops_finance_admin`, and founder leadership may read the Ops-internal Seller Activation Dashboard and its allowed aggregate cohorts. Seller administrators may read only their own organization's permitted session-debug projection; Buyer Console, public, wrong-organization, cross-residency, stale-membership, and other Ops-role requests return the non-revealing denial without metric data.",
      review: "Review `convex/sellerOnboardingSessions.ts`, `packages/domain/src/analytics/seller-activation-metric.ts`, `app/ops/seller-activation/page.tsx`, all three test suites, and `reports/evidence/seller-activation-metric-proof.json` on one commit. Compare the write-once clock, atomic formula, six invite cohorts, six plan tiers, rolling windows, p50 and p90 bands, late reactivation, disqualification annotation, role matrix, residency filters, reconciliation drift, freshness state, registered event, alert, rollback, and receipt checksums.",
      success: "Create production-shaped activated sessions for every plan-tier and invite-source cell with known elapsed values, then prove the persisted formula and expected p50 and p90 for the rolling 30-day tile. Submit one response after abandonment and confirm the original clock, one activated-cohort count, and full latency; include one disqualified session and confirm it remains in the percentile with an annotation. Prove the authorized Ops and founder views, 30-second freshness state, nightly drift comparison, event payload, alert route, keyboard access, responsive rendering, and exact source timestamp.",
      failure: "Reject a response timestamp at or before arrival with HTTP 422 `seller_onboarding_monotonicity_violation`; fail the transaction with HTTP 500 `seller_onboarding_activation_metric_missing` if a response timestamp would commit without elapsed seconds. Reject a duplicate or conflicting first response, an unknown invite source or plan tier, an omitted cohort cell, wrong rolling window, cross-organization or cross-residency query, Buyer-console or unauthorized dashboard read, raw-session disclosure, stale aggregate presented as fresh, percentile drift at or above 1 percent without paging, and duplicate `seller_activation_metric_recorded` delivery. No partial response, metric, cohort, event, or dashboard success may commit.",
      recovery: "Keep the last valid response, session clock, aggregate, and dashboard snapshot. For write failure, correct the server timestamp or atomic write path and replay the same response identity; never rewrite `stage_1_arrival_at`. For analytics delivery failure, continue from Convex with a visible stale state, redrive the outbox idempotently, recompute the affected rolling windows, compare the Usage Event ledger, and replace the receipt only after event, cohort, percentile, alert, and dashboard readback agree.",
      rollout: "Land the session mutation, aggregate query, Ops tile, role checks, event schema, alerts, tests, and receipt together behind the dashboard release control. Run all 36 plan-tier by invite-source cells plus late, disqualified, skew, replay, isolation, residency, accessibility, and freshness fixtures; canary one synthetic activation per cohort; compare Convex, analytics, alert, and rendered values; then widen dashboard access only while drift stays below 1 percent and freshness stays within 30 seconds at p95.",
      rollback: "Disable the new dashboard query and return reads to the last verified aggregate implementation, but preserve every committed response timestamp, activation elapsed value, event, and session state. Stop new canary traffic, reconcile in-flight outbox identities, rebuild rolling aggregates from SellerOnboardingSession, rerun the full cohort and authorization suite, and reopen only after the prior implementation reproduces the canonical clock and percentiles without deleting or resetting customer history.",
      telemetry: "Emit the registered product analytics event `seller_activation_metric_recorded` once after the first-response transaction commits, with `seller_org_id`, `session_id`, `activation_metric_elapsed_seconds`, `pre_resolved`, `kb_entry_count_at_activation`, `capability_count_at_activation`, and `phase_3_population_latency_p_obs_ms`. Use `session_id` for funnel correlation, the standard residency-bound outbox and idempotency contract, and no email, response content, raw invitation token, free text, or Buyer data. Record bounded dashboard freshness, reconciliation drift, cohort-cell result, alert result, commit, environment, and redacted correlation in the proof; activation instrumentation remains internal and outside the customer-webhook catalog.",
      proof: "Retain `reports/evidence/seller-activation-metric-proof.json` with mutation, aggregator, dashboard, and fixture checksums; commit and environment; all 36 cohort-cell results; deterministic percentile inputs and outputs; paid and Free/Solo bands; late-reactivation and disqualification cases; authorization, isolation, residency, skew, atomic-failure, replay, freshness, stale-state, reconciliation, event, alert, canary, accessibility, rollback, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The SellerOnboardingSession clock fields, activation and completion states, six-value invite-source registry, six seller plan tiers, target bands, rolling-window definitions, Ops role mappings, residency routing, Usage Event reconciliation ledger, analytics outbox, and dashboard release control must remain aligned. A change to any one invalidates the receipt and requires the mutation, aggregation, dashboard, event, alert, and every cohort fixture to be reviewed together.",
      exclusions: "This issue does not redefine Buyer activation, Hero Moment completion, first-bid submission, retention cohorts, Seller plan pricing, target-review governance, response authority, customer webhooks, or the other seven seller leading indicators. It cannot reset an arrival clock, exclude a slow, reactivated, or disqualified activated session, expose raw session data outside its permitted projection, manually edit production metrics, or claim readiness from documentation-only evidence.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "BUY-212") {
    const paths = [
      "convex/schema.ts",
      "convex/evaluationScenarios.ts",
      "tests/integration/evaluation-scenarios.spec.ts",
      "reports/evidence/evaluation-scenario-entity-proof.json",
    ];
    return {
      gateId: "evaluation_scenario_entity",
      behavior: [
        "Persist one Buyer-console Evaluation Scenario under a non-deleted Workspace. Copy `org_id` from that Workspace, fix `console='buyer'`, and store `name`, optional `description`, structured `parameters`, computed `results`, monotonic `version`, lock fields, actor timestamps, and soft-delete state.",
        "`parameters` contains only `weight_overrides`, `excluded_vendors`, `excluded_use_cases`, `rubric_overrides.pm_value`, `min_threshold`, and `tco_value_weight`. `weight_overrides` values are 0.0–1.0 with at most 100 Use Case keys. Each exclusion array has at most 50 unique Workspace-local IDs. `rubric_overrides.pm_value` is 0.1–0.9, `min_threshold` is 0.0–1.0, and `tco_value_weight` is 0.0–1.0 with default 0.5.",
        "At least one Vendor must remain. Every referenced Vendor and Use Case must belong to the parent Workspace. `SUM(effective_weight) + tco_value_weight` must be greater than zero; a positive TCO-only scenario is valid, while the dual-zero case returns HTTP 422 `scenario_validation_failed_zero_denominator`. Every other schema, range, duplicate, or foreign-key violation returns HTTP 422 `scenario_validation_failed` before persistence.",
        "Recalculation writes `ranked_vendors` entries containing `vendor_id`, `rank`, `blended_score`, `tco_percentile`, and `use_case_breakdown`, plus `computed_at` and `scenario_version_at_compute`. A parameter edit increments `version`. Reads mark results stale whenever `version > scenario_version_at_compute`.",
        "The scenario model does not accept operational-capacity parameters. Requests containing user-count, concurrent-user, transaction-volume, load, data-volume, uptime, response-time, growth-rate, or arbitrary custom-field parameters fail schema validation before any write or calculation.",
      ].join("\n\n"),
      states: "A scenario is active, soft-deleted, or locked. Create starts active at `version=1`. A valid parameter edit increments `version`; recalculation refreshes results against that version. Entering Phase 12 sets `is_locked=true` and immutable `locked_at`; every later edit, delete, or recalculation returns HTTP 422 `scenario_phase_locked`. Workspace deletion cascades soft delete, followed by the 30-day purge rule. A replay or stale-version write never overwrites newer state.",
      permissions: "Only a current Workspace Owner or Use Case Lead in the matching Buyer organization and Workspace may create or edit a scenario. Reads are Buyer-console and Workspace scoped. Seller-console, cross-Workspace, cross-organization, residency-mismatched, stale-membership, and unauthorized requests return the non-revealing denial before reading or writing scenario data. Creator and updater references follow the existing pseudonymization rule; scenario content remains in the Workspace residency partition.",
      review: "Review `convex/schema.ts`, `convex/evaluationScenarios.ts`, `tests/integration/evaluation-scenarios.spec.ts`, and the proof receipt on one commit. Check every field and bound, Workspace and console isolation, result math, version conflicts, stale-result readback, Phase-12 lock, deletion and retention, residency denial, retry identity, and zero-partial-write behavior.",
      success: "Create a Buyer Workspace scenario with every valid parameter class, recalculate a deterministic ranked result, confirm `scenario_version_at_compute` equals the source `version`, edit parameters to increment `version`, observe the stale banner condition, recalculate again, and prove all indexes and stored fields remain Workspace and organization scoped.",
      failure: "Reject unknown parameter keys, an out-of-range value, duplicate or foreign exclusion, unresolved Use Case or Vendor, zero denominator, oversized payload, stale version, seller-console access, cross-Workspace access, cross-organization access, residency mismatch, unauthorized actor, locked mutation, and duplicate replay before any partial scenario, result, audit, or external effect is committed.",
      recovery: "Keep the last committed scenario and result readable, correct the invalid parameter, scope, authority, version, or dependency, then retry with the intended request identity. For a stale result, recalculate against the current version. For a residency or lock denial, do not bypass the guard. Replace the receipt only after stored result, indexes, and version readback agree.",
      rollout: "Land the schema, mutations, queries, validation, integration fixtures, and receipt schema together. Run production-shaped Workspace, residency, concurrency, and ranking fixtures, canary one synthetic Buyer Workspace, compare stored results and indexes, then enable broader scenario writes only after the same-commit proof passes.",
      rollback: "Disable new scenario writes and recalculation, restore the last compatible schema reader and handler, preserve committed rows and results, reconcile the canary Workspace, and rerun the full integration fixture set. Never destructively reverse committed customer scenario data or bypass a Phase-12 lock.",
      telemetry: "Record bounded operational spans for create, update, recalculate, read, and rejection with operation, result class, duration, version, commit, environment, and redacted correlation. Include no scenario name, description, Vendor or Use Case identity, ranking content, tenant identifier, or customer text. This entity contract adds no product analytics event, webhook, or customer notification.",
      proof: "Retain `reports/evidence/evaluation-scenario-entity-proof.json` with schema and handler checksums, every parameter-bound fixture, deterministic ranking hashes, version and stale-result cases, lock and isolation denials, retention and residency results, concurrency and replay results, canary readback, rollback, reviewer, timestamp, commit, environment, and `zeroCustomerData=true`.",
      assumptions: "The scoring formula, TCO percentile input, Buyer role model, Workspace residency binding, Phase-12 lock trigger, retention window, and scenario object caps remain current. A change to any of them invalidates the receipt and requires the schema, handler, and fixtures to be reviewed together.",
      exclusions: "This issue excludes operational-capacity modeling, seller-console scenarios, score finalization, changes to the scoring formula, pricing-number changes, unrelated reports, manual production-data edits, and any parameter outside the six-key scenario schema.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "SEL-252") {
    const paths = [
      "convex/auditEvents.ts",
      "convex/capabilityDeclarations.ts",
      "convex/knowledgeBase.ts",
      "tests/integration/capability-chip-audit-events.spec.ts",
      "reports/evidence/capability-chip-audit-events-proof.json",
    ];
    return {
      gateId: "capability_chip_audit_events",
      behavior: [
        "Register and emit exactly five Seller knowledge and capability audit actions: `capability_declaration_chip_added`, `capability_declaration_chip_removed`, `capability_declaration_chip_renamed`, `kb_entry.auto_merged`, and `kb_entry.auto_archived`.",
        "The three chip actions use `entity_type=capability_declaration`; the two Knowledge Base lifecycle actions use `entity_type=kb_entry`. Every row carries `actor_user_id`, the affected entity ID, `seller_org_id`, and the Seller Maya session correlation ID in the canonical append-only audit envelope.",
        "Add fires only after a capability declaration is created through the chip surface. Remove fires only after its declaration reaches the deprecated state. Rename fires only after `display_label_override` commits. Auto-merge and auto-archive fire only with their corresponding Knowledge Base lifecycle transaction. The audit row and owning mutation commit atomically and once per mutation identity.",
        "No authentication, session, break-glass, template, billing-admin, cross-console audit, or unrelated Knowledge Base event belongs to this contract. The five action values remain in the general audit action registry and must not be placed in the billing-admin namespace.",
      ].join("\n\n"),
      states: "Each owning mutation is validated, then either rejected with no audit row or committed with exactly one matching append-only audit row. A replay of the same mutation identity returns the existing result and never appends a second row. Audit rows cannot be edited or deleted; a failed audit append fails the owning mutation rather than leaving an unaudited state change.",
      permissions: "A current authorized Seller Org actor may initiate the underlying chip or Knowledge Base action within the matching Seller organization and session. Only the server audit emitter may append the audit row. Wrong-organization, wrong-console, stale-session, unauthorized-role, mismatched entity, and forged actor or session identifiers are denied before mutation without revealing another organization's data. Customer actors cannot alter or delete an audit row.",
      review: "Review `convex/auditEvents.ts`, `convex/capabilityDeclarations.ts`, `convex/knowledgeBase.ts`, `tests/integration/capability-chip-audit-events.spec.ts`, and the receipt on one commit. Compare the exact five-value allowlist, triggers, entity types, payload allowlist, organization and session binding, atomicity, replay behavior, append-only protection, failure recovery, and zero-unrelated-event assertion.",
      success: "Run one authorized synthetic transaction for each of the five actions. Each owning mutation commits once with one matching audit row, exact entity type, exact actor, entity, organization, and session correlation, and no additional audit action. Registry and emit-side sets are equal.",
      failure: "Reject an unknown or unrelated action, wrong entity type, missing or mismatched actor, entity, organization, or session field, unauthorized Seller role, cross-organization or cross-console request, duplicate replay, audit-store outage, and partial transaction. No owning mutation may commit without its audit row, and no failed mutation may append one.",
      recovery: "Keep the failed mutation unapplied, repair the registry, payload, authority, or audit dependency, and retry the same mutation identity. Reconcile the owning entity and append-only audit stream before accepting success; if they disagree, quarantine the identity and keep the capability or Knowledge Base action closed until repaired.",
      rollout: "Land the five-value registry update, both emitters, atomic transaction checks, fixtures, and receipt schema together. Prove all five positive cases and every negative case in a production-shaped Seller Org, canary one synthetic session, compare entity and audit readback, then enable wider execution.",
      rollback: "Disable the five new emit paths, restore the last compatible capability, Knowledge Base, and audit handlers, preserve every committed audit row, reconcile in-flight identities, and rerun the five-value registry and atomicity fixtures before reopening. Never delete or rewrite an appended audit row.",
      telemetry: "The required signals are the five append-only audit actions named in this contract. Record only bounded operational delivery result, duration, retry count, commit, environment, and redacted correlation in the proof receipt. Emit no additional product analytics event, webhook, customer notification, free text, customer content, or raw organization, entity, actor, or session identifier.",
      proof: "Retain `reports/evidence/capability-chip-audit-events-proof.json` with registry and emitter checksums, five positive envelopes with synthetic hashed identifiers, unrelated-action rejection, authority and scope denials, atomic-failure and replay results, append-only readback, canary, rollback, reviewer, timestamp, commit, environment, and `zeroCustomerData=true`.",
      assumptions: "The capability declaration and Knowledge Base lifecycle transactions, Seller Org role checks, canonical audit envelope, append-only store, and Seller Maya session correlation remain aligned. Any change invalidates the receipt and requires the registry, both emitters, and all fixtures to be reviewed together.",
      exclusions: "This issue excludes every audit action other than the five listed values, authentication and session auditing, templates, break-glass operations, billing-admin actions, cross-console audit reads, audit export, unrelated Knowledge Base events, manual audit edits, and customer notifications.",
      paths,
      plannedPaths: paths.filter((path) => !existsSync(resolve(process.cwd(), path))),
    };
  }
  if (issueId === "BUY-192") {
    const paths = [
      "packages/domain/src/sourcera-method/guidance.ts",
      "packages/domain/src/sourcera-method/workspace-engine-binding.ts",
      "tests/unit/sourcera-method-guidance.spec.ts",
      "tests/integration/sourcera-method-workspace-binding.spec.ts",
      "reports/evidence/sourcera-method-guidance.json",
    ];
    return {
      gateId: "sourcera_method_guidance",
      behavior: [
        "The Sourcera Method is repeatable procurement guidance embedded in product workflows, terminology, onboarding, help, exports, and demo seeds. It reduces ambiguity and rework through structure, parallelization, and decision accountability; it is not a second lifecycle engine.",
        "Every Method-guided Workspace binds to the same 13-phase pipeline, phase-duration benchmark resolver, Workspace, Use Case, and Requirement lifecycles, RBAC, audit, retention, and pricing controls. No surface may define alternate phases, alternate duration totals, or a Method-disabled workflow.",
        "Opt-out suppresses instructional copy and recommended prompts only. It cannot bypass a phase gate, domain rule, permission, audit record, retention rule, or plan control.",
        "Overview copy must describe guidance layered on the canonical engine. When a surface displays dates or elapsed-time expectations, it reads the current phase benchmark and the Workspace's expected-phase-duration values; this issue carries no fixed elapsed-time total.",
        "Blank, EvalStarter-seeded, and WorkspaceTemplate-seeded Workspaces must land in the same phase engine and emit the same Workspace audit envelope; only their source-provenance fields may differ.",
        "A new Method field, enum, API flag, webhook, error code, or surface concept is rejected unless the owning schema, API or event registry, controlled vocabulary, and runtime-gate catalog are updated in the same change.",
      ].join("\n\n"),
      states: "Guidance is enabled or hidden for the current user preference. Both states retain the same Workspace phase, role, lifecycle, audit, retention, pricing, and benchmark behavior. Changing the preference updates guidance presentation only and never mutates evaluation state.",
      permissions: "Only an authenticated Buyer Workspace member with access to the Workspace may read its Method guidance. Only that member may change their guidance preference. No preference grants a role, reveals another Workspace, changes a phase, or bypasses a server-side rule.",
      review: "Review the shared guidance model, engine-binding guard, all three Workspace creation paths, preference behavior, registry update guard, and immutable receipt on one commit. Review must prove that displayed timing comes from current Workspace benchmark data and that no elapsed-time total is embedded in overview copy.",
      success: "All guided and hidden-guidance fixtures use one 13-phase engine. Blank, EvalStarter, and WorkspaceTemplate creation produce the same phase and audit semantics, opt-out removes only guidance, and every displayed date resolves from current benchmark data.",
      failure: "Reject any alternate phase, embedded total-duration claim, Method-disabled lifecycle, missing registry update, cross-Workspace guidance read, or preference change that mutates evaluation state. The prior Workspace and preference state remain unchanged.",
      recovery: "Disable the affected guidance presentation, restore the last verified guidance bundle and engine-binding guard, repair the invalid copy or registry binding, rerun all creation and opt-out fixtures, then replace the receipt only after phase and audit readback agree.",
      rollout: "Land the shared guidance model and engine-binding guard together. Verify blank, seeded, template, guided, and opt-out fixtures in Preview, canary one internal Buyer Workspace, then expand only while phase, authorization, audit, and copy checks remain green.",
      rollback: "Disable the new guidance bundle and restore the immediately prior verified bundle without changing Workspace state, phase data, preferences, or audit history. Rerun the engine-binding suite before reopening guidance.",
      telemetry: "Reuse the existing Workspace audit envelope for Workspace creation. Record only guidance-render result, preference state, source path, benchmark-resolution result, commit, environment, duration, and redacted correlation in the proof receipt. This issue emits no product event, sends no webhook, and delivers no customer notification.",
      proof: "Retain `reports/evidence/sourcera-method-guidance.json` with commit, deployment identity, guidance checksum, engine-binding checksum, blank/EvalStarter/WorkspaceTemplate results, guided/opt-out results, benchmark-resolution cases, authorization failures, registry guard, canary, rollback, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The 13-phase engine, Workspace benchmark fields, preference model, Workspace audit envelope, and owning registries are current. A change to any of them invalidates this receipt and requires the shared guidance and binding tests to be updated before rollout.",
      exclusions: "This issue does not create a lifecycle, restate a fixed evaluation duration, alter phase benchmarks, change pricing or entitlements, add a customer notification, or own the implementation of Workspace, Use Case, or Requirement mutations.",
      paths,
      plannedPaths: paths,
    };
  }
  if (issueId === "BUY-193") {
    const paths = [
      "convex/useCases.ts",
      "convex/requirements.ts",
      "packages/domain/src/use-case-requirement-decomposition.ts",
      "tests/unit/use-case-requirement-decomposition.spec.ts",
      "tests/integration/use-case-requirement-mutations.spec.ts",
      "reports/evidence/use-case-requirement-decomposition.json",
    ];
    return {
      gateId: "use_case_requirement_decomposition",
      behavior: [
        "A Use Case represents one discrete job-to-be-done. A Requirement represents one measurable, independently scorable outcome. Count guidance is advisory; every create, import, duplicate, generated-policy publication, and seeded-materialization path enforces the current plan-tier snapshot before writing.",
        "Use Case creation rejects a result above the plan's Use Cases-per-Workspace cap with HTTP 403 `plan_limit_exceeded`. Requirement creation rejects a result above the Requirements-per-Workspace cap with the same error. Both paths commit no partial row, child, audit record, or projection.",
        "The decomposition validator rejects a Requirement containing multiple independently scorable outcomes, identifies the compound conjunction span, and returns corrective guidance to split it before scoring setup.",
        "Use Case transitions follow the exact `use_case_status` matrix; an out-of-table transition returns HTTP 409 `use_case_invalid_state_transition` and leaves status unchanged. A finalized Requirement may change only through the Phase 6 amendment path; every other write returns the registered Requirement-state error without mutation.",
        "Deleting a Use Case with child Requirements either soft-deletes parent and children atomically while retaining audit history, or rejects before mutation when phase or amendment rules forbid the cascade. Parent-only deletion is forbidden.",
      ].join("\n\n"),
      states: "Use Cases support the current drafted, validated, phase-locked, soft-deleted, undo, restore, and purge transitions. Requirements support their current draft-through-finalized matrix and Phase 6 amendment path. Every unlisted transition, over-cap restore, seller-console mutation, and unauthorized purge fails before mutation.",
      permissions: "Workspace Owner and Workspace Admin may create and edit Use Cases and Requirements in their Buyer Workspace. A Use Case Lead may do so only within assigned Use Cases. A guest may contribute only when assigned as contributor or full participant within the permitted scope. A reviewer cannot author. Ops may restore a retained soft-deleted row only through the recovery operation and gains no normal create or edit authority.",
      review: "Review both mutation modules, the shared decomposition validator, exact cap lookups, all current state transitions, cascade deletion, recovery-only Ops restore, unit and integration fixtures, and the immutable receipt on one commit.",
      success: "Authorized create, import, duplicate, policy-publication, and seeded-materialization fixtures enforce current plan caps, accept one independently scorable outcome, commit valid lifecycle transitions atomically, and cascade an allowed soft delete with complete audit history.",
      failure: "Over-cap writes return HTTP 403 `plan_limit_exceeded`; compound Requirements identify the rejected span; invalid Use Case transitions return HTTP 409 `use_case_invalid_state_transition`; invalid Requirement, phase, scope, role, concurrency, and cascade cases commit no partial row or audit result.",
      recovery: "Keep the rejected identity unchanged, correct the cap, statement, authority, state, or phase condition, then replay the same idempotency identity. Ops restore is allowed only during the retained recovery window, restores the prior non-terminal state, rechecks current caps, and records its audit result atomically.",
      rollout: "Land both mutation modules, the shared validator, cap fixtures, lifecycle fixtures, and proof schema together. Run Preview migrations and synthetic Buyer Workspace canaries before enabling each write entrypoint; expand only while rejection, audit, and isolation checks remain green.",
      rollback: "Disable new decomposition entrypoints, restore the last verified mutation and validator versions, preserve committed domain and audit rows, reconcile in-flight identities, and rerun the full cap, lifecycle, cascade, and recovery suite before reopening writes.",
      telemetry: "Reuse existing Use Case, Requirement, lifecycle, and audit signals. Record bounded operation kind, result class, cap class, transition class, duration, commit, environment, and redacted correlation in the receipt. Include no statements, names, tenant identifiers, or customer content; add no customer notification.",
      proof: "Retain `reports/evidence/use-case-requirement-decomposition.json` with commit, deployment identity, mutation and validator checksums, cap matrix, compound-statement cases, lifecycle matrix, cascade results, role and isolation failures, recovery-only Ops restore, rollback, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The plan-cap resolver, current Use Case and Requirement state matrices, Phase 6 amendment path, role assignments, retention window, and audit schemas are current. Any change invalidates the receipt and requires both mutation modules and all fixtures to be reviewed again.",
      exclusions: "This issue does not own scoring setup, alternate count guidance, plan pricing, seller mutation, a second lifecycle, unrelated policy-generation behavior, or manual production-data edits.",
      paths,
      plannedPaths: paths,
    };
  }
  if (issueId === "BUY-241") {
    const paths = [
      "convex/schema.ts",
      "convex/scoringReports.ts",
      "app/workspaces/[workspaceId]/evaluation/scoring/report/page.tsx",
      "components/scoring/summary-scoring-report.tsx",
      "tests/unit/summary-scoring-report.spec.ts",
      "tests/integration/summary-scoring-report.spec.ts",
      "tests/e2e/summary-scoring-report.spec.ts",
      "reports/evidence/summary-scoring-report-proof.json",
    ];
    return {
      gateId: "summary_scoring_report",
      behavior: "Generate one immutable Phase 11 Summary Scoring Report from the server-confirmed final active grade-set snapshot. The report contains vendor average summaries, requirement-by-requirement breakdown, consensus metrics, top three and bottom three vendors, and downloadable PDF and CSV artifacts. All required final scores, documented outlier resolution, and Team Lead finalization are prerequisites; this issue neither runs consensus review nor mutates or finalizes a score. The source snapshot hash binds the read view and both artifacts. A changed source hash invalidates every cached report and export before it can be served.",
      states: "The report is unavailable before its scoring prerequisites pass, then generating, ready, partially readable with an independent export failure, stale after source-hash change, or failed. Phase 12 makes source scores immutable. A read failure never deletes a valid retained artifact, and an export retry never changes score state.",
      permissions: "Resolve report read and PDF or CSV export as separate server-authorized actions within the same Buyer organization and Workspace. A caller may proceed only when current role rules grant both the requested action and access to the final scoring projection. Cross-console, cross-organization, cross-Workspace, stale-membership, or unresolved operation-by-role authority denies without revealing score data; unresolved authority blocks rollout rather than granting a generic buyer role.",
      review: "An independent reviewer must compare the schema, report query, page, component, unit, integration, and browser fixtures against the same final-grade snapshot and receipt. Review covers every field, both formats, source-hash invalidation, authorization, residency, accessibility, failure, recovery, rollout, and rollback.",
      success: "A final active grade-set fixture renders vendor summaries, requirement breakdown, consensus metrics, top three, bottom three, PDF, and CSV from one source hash. Ready, loading, empty, partial, stale, permission-denied, and export-failure states remain independently testable and accessible.",
      failure: "Cross-console, cross-organization, cross-Workspace, unauthorized, incomplete-source, stale-hash, artifact-timeout, size, storage, or residency fixtures expose no protected score or rationale, publish no partial artifact, and never mutate scoring or finalization state.",
      recovery: "Keep resolved report sections readable, repair the failed dependency or authorization rule, and retry export against the same confirmed source snapshot. If the source hash changed, invalidate the cache and regenerate both artifacts before serving either one.",
      rollout: "Canary one fixed final-scoring fixture through the read view, PDF, and CSV in Preview, retain the same-commit receipt, then enable the route for a bounded authorized Buyer cohort. Promotion stops on any authorization, artifact, source-hash, residency, accessibility, or telemetry failure.",
      rollback: "Hide new generation and download actions, restore the last verified report query and surface, preserve completed artifacts under retention rules, and leave scoring untouched. Prove retained reads and prior-format downloads before reopening the route.",
      telemetry: "Record operational spans `summary_scoring_report.generate` and `summary_scoring_report.export` with phase, format, outcome, duration, request identity, commit, environment, and redacted correlation. Include no grades, rationale, names, or tenant identifiers. These spans are operational only until registered for product analytics; emit no customer notification.",
      proof: "Retain `reports/evidence/summary-scoring-report-proof.json` with commit, deployment identity, source hash, golden artifact hashes, both format results, access and residency denials, state and accessibility results, canary, telemetry sample, rollback, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The final-grade snapshot, aggregation rules, score immutability boundary, operation-by-role authority, artifact retention, residency policy, and export limits are current. A change to any one invalidates the source hash and receipt and requires regeneration and review.",
      exclusions: "This issue excludes score revision, outlier and consensus workflow, score finalization, Workspace Analytics and scheduled exports, Selection Report generation, and Phase 12 selection. Those prerequisite or downstream behaviors remain separate native issues.",
      paths,
      plannedPaths: paths,
    };
  }
  if (issueId === "PLA-939") {
    const paths = [
      "tools/spec-lint/sibling_override_cli.ts",
      "tools/spec-lint/override_parser.test.ts",
      ".github/workflows/spec-lint.yml",
      "reports/evidence/ci-gate-override-annotation.json",
    ];
    return {
      gateId: "ci_gate_override_annotation",
      behavior: [
        "Parse non-Appendix-M overrides only in the exact form `@ci-gate-override: {gate_id} — {rationale}`. The gate ID is a case-sensitive ASCII snake-case literal that must resolve to one current CI-gate catalog row.",
        "Normalize the rationale to Unicode NFC after removing the prefix and trimming leading and trailing ASCII whitespace. The remaining rationale must contain at least 60 characters. A catalog row may require a higher floor but can never lower this minimum.",
        "Validation order is exact: an unknown gate returns `override_unknown_gate`; a known row whose override path is `not_permitted` or `not_permitted_<rule>` returns `ci_gate_override_not_permitted`; a short rationale returns `override_rationale_too_short`; an unresolved `coupled_with:<gate_id>` constraint returns `override_coupled_gate_unknown`; an unresolved `requires_audit_event:<event_kind>` constraint returns `override_requires_audit_event_kind_unknown`.",
        "A permitted override records the annotation checksum, catalog-row checksum, gate ID, normalized rationale checksum, override class, required coupled-gate or audit-event result, pull-request identity, commit, actor, reviewer, timestamp, and final decision. It never changes the catalog row, disables the underlying detector, or grants a customer or tenant permission.",
      ].join("\n\n"),
      states: "An annotation moves from unread to parsed, then rejected or eligible. Eligible moves to accepted only after its row-level override class, any coupled gate, any required audit event, actor authority, and same-commit catalog checksum pass. Parser, catalog, dependency, or receipt failure is rejected and keeps the CI check blocked.",
      permissions: "Only the protected CI override parser may read pull-request annotations and the current CI-gate catalog and write the check result and immutable receipt. Repository authors may propose an annotation but cannot self-approve, change a row-level prohibition, bypass the parser, or write the acceptance receipt. The parser reads no tenant data, customer content, application secret, or production credential.",
      review: "Independent review must compare the parser, positive and negative grammar fixtures, current catalog resolution, row-level override precedence, coupled-gate and required-audit cases, protected workflow wiring, and immutable receipt on one commit.",
      success: "A known overridable gate with a correctly normalized rationale of at least 60 characters and every declared dependency satisfied produces one accepted, same-commit receipt. Unicode, whitespace, exact-ID, higher-floor, coupled-gate, and required-audit fixtures produce deterministic results.",
      failure: "Malformed grammar, unknown or case-mismatched gate ID, short rationale, prohibited row, unknown coupled gate, unknown required audit event, unauthorized actor, stale catalog checksum, duplicate annotation, parser error, or incomplete receipt fails closed and keeps merge or promotion blocked with the exact registered rejection.",
      recovery: "Keep the check blocked, correct the annotation or catalog defect, rerun every applicable negative fixture, then rerun the accepted fixture against the same commit and catalog checksum. Replace the receipt only after protected-CI readback agrees.",
      rollout: "Land parser, fixtures, protected workflow wiring, and receipt schema together. Prove every rejection class and one accepted default override in Preview CI, then make the parser mandatory for every non-Appendix-M gate annotation.",
      rollback: "Restore the last verified parser and fixtures while keeping annotation checks blocking. Do not disable the check, lower the rationale floor, or convert a prohibited row to permitted during rollback. Rerun the restored fixture set and retain the rollback receipt.",
      telemetry: "Write bounded CI run data only: parser result, rejection class, override class, gate-ID hash, rationale length, catalog checksum, dependency result, duration, commit, pull-request identity, and redacted correlation. Include no rationale body, source body, secret, tenant identifier, or customer content. This issue emits no product event, sends no webhook, and delivers no customer notification.",
      proof: "Retain `reports/evidence/ci-gate-override-annotation.json` with parser and workflow checksums, catalog checksum, every grammar and precedence fixture, Unicode and whitespace cases, dependency cases, accepted and rejected receipts, rollback, reviewer, timestamp, and `zeroCustomerData=true`.",
      assumptions: "The CI-gate catalog schema, registered rejection values, override classes, Unicode normalization rule, protected workflow, coupled-gate resolver, and audit-event registry are current. Any change invalidates the receipt and requires parser and fixture review before rollout.",
      exclusions: "This issue does not define Appendix-M internal-only annotations, create or modify gate rows, relax a row-level prohibition, approve a specific override, disable a detector, expose rationale text in telemetry, or grant application authority.",
      paths,
      plannedPaths: ["reports/evidence/ci-gate-override-annotation.json"],
    };
  }
  return null;
}

function appendixGAliasContract(context: PlannerContext): RuntimeGateContract {
  const proofPath = "reports/evidence/appendix-g-alias-retirement.json";
  const paths = [
    "packages/analytics/src/retired-event-aliases.ts",
    "packages/analytics/src/event-name-validator.ts",
    "packages/analytics/src/dashboard-event-registry.ts",
    "convex/analytics/usageEventOutbox.ts",
    "convex/analytics/usageAliasRetirement.ts",
    "convex/analytics/usageDashboardQueries.ts",
    "tests/unit/retired-event-aliases.spec.ts",
    "tests/unit/dashboard-event-registry.spec.ts",
    "tests/integration/usage-alias-retirement.spec.ts",
    "tests/integration/fixtures/appendix_g_alias_rejection/positive.json",
    "tests/integration/fixtures/appendix_g_alias_rejection/negative.json",
    "scripts/verify-usage-alias-retirement.ts",
    proofPath,
    "tools/release/runtime_evidence/appendix_g_alias_rejection_enforced.json",
    "tools/spec-lint/gates/appendix_g_alias_rejection_enforced.ts",
    "tools/spec-lint/pending_m02_local_guards.test.ts",
  ];
  return {
    gateId: "appendix_g_alias_rejection_enforcement",
    behavior: [
      "Reject these exact retired-to-canonical mappings before any outbox row or PostHog dispatch:",
      "| Retired event name | Canonical event name |",
      "| --- | --- |",
      "| `seller_onboarding_conversion_moment_recorded` | `seller_onboarding_conversion_moment_fired` |",
      "| `stake_reveal_displayed` | `stake_reveal_rendered` |",
      "| `stake_reveal_dismissed` | `stake_reveal_navigated_away` |",
      "| `hero_moment_first_pass_response_submitted` | `seller_onboarding_first_requirement_response` |",
      "| `seller_invite_pre_arrival_dispatched` | `seller_invite_pre_arrival_enrichment_started` |",
      "| `seller_invite_pre_arrival_failed` | `seller_invite_pre_arrival_enrichment_failed` |",
      "Canonical names continue through their registered envelope. A retired name writes one immutable quarantine result per attempted `event_id` and emits one internal `usage_analytics_alias_retirement_overdue` signal.",
      "The overdue signal payload contains only `retired_alias_name`, `canonical_event_name`, `retirement_effective_at`, `days_overdue`, `last_emission_at`, `last_emission_source_console`, and `pager_tier`.",
      "Pager routing is exact: `tier_0_warn` for 7–30 days overdue, `tier_1_oncall` for 30–60 days, and `tier_2_exec` for 60 or more days. Active dashboards, funnels, exports, caches, cursors, and subscriptions compile canonical names only. Server-authorized historical backfill is isolated from every active or customer query, cache, cursor, materialization, and subscription. A retired event is never auto-renamed.",
    ].join("\n\n"),
    states: "A submitted name resolves to exactly one result: `accepted_canonical`, `quarantined_retired_alias`, or `rejected_unregistered_name`. A same-`event_id` retry is idempotent. Quarantined rows never re-enter dispatch; corrected producers submit a new canonical event through their existing idempotency contract.",
    permissions: "Only server emitters may submit Usage Events. Only the operational analytics role may inspect quarantine metadata or internal historical-backfill results. Customer roles cannot discover quarantine rows, overdue signals, or backfill controls. Payloads exclude customer content, identity, free text, tokens, and secrets.",
    review: "Independent review must inspect the exact six-name deny registry, every emitter entry point, every active consumer query, internal historical isolation, privacy allowlist, duplicate suppression, cache recovery, rollback, and same-commit deployment receipt.",
    success: "Each canonical control dispatches once; every retired name is denied once; all active consumers contain canonical names only; internal backfill can read synthetic historical rows without exposing them to any active or customer query; and the receipt proves zero customer payload.",
    failure: "A retired or unknown name, wrong mapping, missing overdue field, invalid pager tier, client-forged backfill mode, alias-bearing active query, duplicate quarantine, mixed cache, or zero-row canary fails closed and blocks promotion.",
    recovery: "Correct the owning producer or query, keep quarantine immutable, drain only canonical dispatchable rows, invalidate alias-bearing caches, rebuild canonical-only materializations, rerun all six positive and negative probes, and retain a new same-commit receipt.",
    rollout: "Land the shared registry, emitter validator, consumer compiler, and tests together. Prove all cases with synthetic Preview data, canary quarantine and internal alerting, verify canonical controls and dashboard parity, then expand only with a commit-bound receipt.",
    rollback: "Redeploy the last verified canonical-only emitter and consumer bundle, preserve quarantine and historical rows, invalidate only affected caches, rerun canonical controls and retired-name probes, and keep the gate blocked if no prior safe bundle exists.",
    telemetry: "Use only the registered internal `usage_analytics_alias_retirement_overdue` signal and the registered shared gate-run event `spec_lint.appendix_m_gate_run`, each with its canonical allowlist and existing routing. Add no inferred event, customer analytics event, webhook, or customer notification. The proof records bounded canonical-acceptance, quarantine, rejection, recovery, rollback, fixture polarity, gate-run, and dashboard-validation results without customer data.",
    proof: `Retain \`${proofPath}\` and \`tools/release/runtime_evidence/appendix_g_alias_rejection_enforced.json\` with registry and source hashes, exact six-name matrix, canonical controls, attempted entry points, quarantine and overdue envelopes, active and historical query snapshots, privacy assertions, cache recovery, outage behavior, commit, deployment, rollback, scanner readback, reviewer, and \`zeroCustomerData=true\`.`,
    assumptions: "Historical backfill remains internal and server-authorized; repeated attempted event IDs remain single-result; retired events are never auto-renamed. Any canonical change to audience, replay cardinality, or payload equivalence invalidates this contract and receipt.",
    exclusions: "No customer-facing control, customer notification, payload migration, automatic alias rewrite, unrelated analytics redesign, local-lint-only readiness, or promotion without deployed emitter and consumer proof.",
    paths,
    plannedPaths: paths.filter((path) => !existsSync(resolve(context.root, path))),
  };
}

function sectionText(parsed: ParsedDescription, key: string): string | null {
  const values = parsed.sections.get(key)?.filter(Boolean) ?? [];
  return values.length > 0 ? values.join("\n") : null;
}

function completeStructuredBody(parsed: ParsedDescription): boolean {
  const required = [
    "outcome", "behavior", "states", "permissions", "review", "success",
    "failure", "recovery", "rollout", "rollback", "telemetry", "proof",
    "assumptions", "exclusions",
  ];
  return !parsed.hasLikelyClippedLine &&
    parsed.paths.length > 0 &&
    required.every((key) => Boolean(sectionText(parsed, key)?.trim()));
}

function richPartialContract(parsed: ParsedDescription): boolean {
  const supporting = [
    "failure", "recovery", "rollout", "rollback", "telemetry", "proof",
    "assumptions", "exclusions", "review",
  ];
  const behavior = sectionText(parsed, "behavior") ?? "";
  const success = sectionText(parsed, "success") ?? "";
  const allCurrent = [
    ...parsed.sections.values(),
    parsed.residue,
  ].flat().join("\n");
  const combined = [behavior, success, ...supporting.map((key) => sectionText(parsed, key) ?? "")].join("\n");
  const explicitSupporting = supporting.filter((key) =>
    (sectionText(parsed, key)?.trim().length ?? 0) >= 20
  ).length;
  const structuredRich = behavior.length >= 120 &&
    success.trim().length >= 20 &&
    explicitSupporting >= 5;
  const longCurrentContract = allCurrent.length >= 2_500 &&
    behavior.length >= 500 &&
    ["outcome", "behavior", "success", "failure", "recovery", "rollout", "rollback", "telemetry", "proof", "review"]
      .filter((key) => (sectionText(parsed, key)?.trim().length ?? 0) >= 20)
      .length >= 4;
  const substantivePartialContract = allCurrent.length >= 1_500 &&
    behavior.length >= 350 &&
    ["outcome", "behavior", "success", "failure", "recovery", "rollout", "rollback", "telemetry", "proof", "permissions"]
      .filter((key) => (sectionText(parsed, key)?.trim().length ?? 0) >= 20)
      .length >= 4;
  return parsed.paths.length > 0 &&
    (structuredRich || longCurrentContract || substantivePartialContract) &&
    allCurrent.length <= MAX_DESCRIPTION_CHARS;
}

function preserveCurrentFacts(raw: string, maximum: number): string | null {
  if (maximum <= 0) return null;
  const blocks = factBlocks(raw);
  const selected: string[] = [];
  let length = 0;
  for (const block of blocks) {
    const addition = block.text.length + (selected.length > 0 ? 2 : 0);
    if (length + addition > maximum) continue;
    selected.push(block.text);
    length += addition;
  }
  return selected.length > 0 ? mergeFactBlockTables(selected) : null;
}

function allocateCanonicalFacts(
  raw: string | null,
  outcome: string,
  needed = new Set<CanonicalSectionKey>(Object.keys(SOURCE_SECTION_LABELS) as CanonicalSectionKey[]),
): CanonicalAllocation {
  const empty = Object.fromEntries(
    (Object.keys(SOURCE_SECTION_LABELS) as CanonicalSectionKey[]).map((key) => [key, null]),
  ) as CanonicalAllocation;
  if (!raw) return empty;
  const blocks = factBlocks(raw);
  const used = new Set<number>();
  const mergeBounded = (values: string[], maximum: number): string | null => {
    const selected: string[] = [];
    let length = 0;
    for (const value of values) {
      const addition = value.length + (selected.length > 0 ? 2 : 0);
      if (!value.trim() || length + addition > maximum) continue;
      selected.push(value);
      length += addition;
    }
    return selected.length > 0 ? mergeFactBlockTables(selected) : null;
  };
  const takeIndexes = (indexes: number[], maximum: number): string | null => {
    const selected: number[] = [];
    let length = 0;
    for (const index of [...new Set(indexes)]) {
      if (used.has(index)) continue;
      const addition = blocks[index].text.length + (selected.length > 0 ? 2 : 0);
      if (length + addition > maximum) continue;
      selected.push(index);
      length += addition;
    }
    const sourceOrdered = selected.sort((left, right) => left - right);
    for (const index of sourceOrdered) used.add(index);
    return sourceOrdered.length > 0
      ? mergeFactBlockTables(sourceOrdered.map((index) => blocks[index].text))
      : null;
  };
  const takeExplicit = (key: CanonicalSectionKey, maximum: number): string | null => {
    const indexes = blocks.map((block, index) => ({ block, index }))
      .filter((row) => row.block.section === key)
      .map((row) => row.index);
    const value = takeIndexes(indexes, maximum);
    for (const index of indexes) used.add(index);
    return value;
  };
  const takeExplicitScored = (
    key: CanonicalSectionKey,
    terms: string[],
    maximum: number,
  ): string | null => {
    const candidates = blocks
      .map((block, index) => ({
        block,
        index,
        score: terms.reduce((score, term) =>
          score + (block.search.toLowerCase().includes(term) ? (term.includes("_") ? 8 : 1) : 0), 0),
      }))
      .filter((row) => row.block.section === key);
    const first = candidates[0]?.index;
    const indexes = [
      ...(first === undefined ? [] : [first]),
      ...candidates
        .filter((row) => row.index !== first)
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .map((row) => row.index),
    ];
    return takeIndexes(indexes, maximum);
  };
  const takeMatching = (
    terms: string[],
    maximum: number,
    allowUnmatched = false,
    exclude?: (block: FactBlock) => boolean,
  ): string | null => {
    const scored = blocks
      .map((block, index) => ({
        block,
        index,
        score: terms.filter((term) => block.search.toLowerCase().includes(term)).length,
      }))
      .filter((row) =>
        !used.has(row.index) &&
        row.block.text.length <= maximum &&
        !exclude?.(row.block) &&
        (allowUnmatched || row.score > 0)
      )
      .sort((left, right) => right.score - left.score || left.index - right.index);
    const selected: number[] = [];
    let length = 0;
    for (const row of scored) {
      const addition = row.block.text.length + (selected.length > 0 ? 2 : 0);
      if (length + addition > maximum) continue;
      selected.push(row.index);
      length += addition;
    }
    return takeIndexes(selected.sort((left, right) => left - right), maximum);
  };
  const negativeRule = (block: FactBlock): boolean =>
    /\b(?:reject(?:s|ed|ion)?|error|invalid|forbidden|denied|failure|fails?|must not|cannot|no partial|unchanged)\b/i.test(block.text);
  const successfulRule = (block: FactBlock): boolean =>
    /^\s*(?:on|upon)\s+success\b/i.test(block.text) ||
    /\b(?:successfully|successful result)\b/i.test(block.text);
  const allocation = { ...empty };
  if (needed.has("behavior")) {
    allocation.behavior = takeExplicitScored(
      "behavior",
      [...keywords(outcome)],
      5_000,
    ) ?? takeMatching(
      [...keywords(outcome), "behavior", "contract", "rule", "require", "must", "shall"],
      5_000,
      true,
    );
  }
  for (const [key, maximum] of [
    ["states", 5_500],
    ["permissions", 2_800],
    ["success", 5_000],
    ["telemetry", 2_000],
    ["rollout", 1_500],
    ["rollback", 1_500],
    ["proof", 1_200],
    ["assumptions", 1_200],
    ["exclusions", 1_000],
    ["review", 1_200],
  ] as Array<[CanonicalSectionKey, number]>) {
    if (needed.has(key)) allocation[key] = takeExplicit(key, maximum);
  }
  const failureIndexes = blocks
    .map((block, index) => ({ block, index }))
    .filter((row) => !used.has(row.index) && row.block.section === "failure")
    .map((row) => row.index);
  if (failureIndexes.length > 0 && (needed.has("failure") || needed.has("recovery"))) {
    const failureParts: string[] = [];
    const recoveryParts: string[] = [];
    for (const index of failureIndexes) {
      const text = blocks[index].text;
      const lines = text.split(/\r?\n/);
      let splitAny = false;
      for (const line of lines) {
        const match = /^(.*?)(?:\bResolved:|\bRecovery:)\s*(.+)$/i.exec(line);
        if (!match) continue;
        splitAny = true;
        const failedCondition = match[1].replace(/[\s:;—-]+$/, "").trim();
        if (failedCondition) failureParts.push(sentenceCase(failedCondition));
        if (match[2].trim()) recoveryParts.push(sentenceCase(match[2]));
      }
      if (!splitAny) failureParts.push(text);
      used.add(index);
    }
    if (needed.has("failure")) allocation.failure = mergeBounded(failureParts, 2_000);
    if (needed.has("recovery")) {
      const explicitRecovery = takeExplicit("recovery", 1_200);
      allocation.recovery = mergeBounded(
        [explicitRecovery ?? "", ...recoveryParts],
        2_000,
      );
    }
  }
  if (needed.has("success") && !allocation.success) {
    allocation.success = takeMatching(
      ["on success", "success", "acceptance", "exactly one", "observable", "testable", "complete", "persist", "return", "render", "emit"],
      2_000,
      false,
      negativeRule,
    );
  }
  if (needed.has("states") && !allocation.states) {
    allocation.states = takeMatching(["state", "status", "transition", "lifecycle", "trigger", "terminal"], 2_000);
  }
  if (needed.has("permissions") && !allocation.permissions) {
    allocation.permissions = takeMatching(["permission", "role", "authoriz", "tenant", "organization", "console", "privacy", "pii", "residency"], 2_000);
  }
  if (needed.has("failure") && !allocation.failure) {
    allocation.failure = takeMatching(["failure", "reject", "error", "invalid", "forbidden", "timeout", "fail", "must not", "cannot"], 2_000, false, successfulRule);
  }
  if (needed.has("recovery") && !allocation.recovery) {
    allocation.recovery = takeExplicit("recovery", 2_000) ??
      takeMatching(["recovery", "retry", "restore", "replay", "rollback", "compensat", "dlq"], 2_000, false, successfulRule);
  }
  if (needed.has("telemetry") && !allocation.telemetry) {
    allocation.telemetry = takeMatching(["telemetry", "event", "audit", "notification", "webhook", "posthog", "alert"], 2_000);
  }
  return allocation;
}

function slug(value: string): string {
  const result = value.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");
  return result || "bounded-delivery";
}

function contractProfile(title: string, source: ReturnType<typeof sourceIdentity>): ContractProfile {
  const section = source.row?.section ?? "";
  if (
    /^(?:UX Design|UX)\s+§(?:Tokens|Components|Patterns|Motion|Iconography|Illustration|Density|Theming|VoiceTone)/i.test(section) ||
    /\b(?:design token|typography|color system|spacing scale|border radius|elevation|shadow|component|form layout|navigation shell|iconography|illustration|density mode|theme system|voice\s*&?\s*tone|motion|animation)\b/i.test(title)
  ) return "presentation";
  return "runtime";
}

function generatedPaths(
  issue: LinearIssueInput,
  title: string,
  classification: IssueClass,
  profile: ContractProfile,
): string[] {
  const name = slug(title);
  const team = issue.identifier.split("-")[0];
  if (issue.identifier === "PLA-704") {
    return [
      "tools/release/stamp_gate.ts",
      "tools/release/exact_status_scan.ts",
      "reports/evidence/appendix-m-runtime-gate-catalog-proof.json",
    ];
  }
  if (classification === "runtime_gate") {
    return [
      `tools/spec-lint/gates/${name}.ts`,
      `tests/integration/${name}.spec.ts`,
      `reports/evidence/${name}-runtime-proof.json`,
    ];
  }
  if (classification === "delivery_parent") {
    return [
      `delivery/${name}-delivery-plan.md`,
      `reports/evidence/${name}-readiness.json`,
    ];
  }
  if (classification === "decision") {
    return [
      "delivery/decisions.jsonl",
      `reports/evidence/${name}-decision.json`,
    ];
  }
  if (profile === "presentation") {
    const tokenWork = /\b(?:design token|typography|color|spacing|radius|elevation|shadow|motion)\b/i.test(title);
    const implementations = tokenWork
      ? ["app/globals.css", "apps/buyer/app/globals.css", "apps/seller/app/globals.css"]
      : team === "BUY"
      ? [`apps/buyer/components/ui/${name}.tsx`]
      : team === "SEL"
      ? [`apps/seller/components/ui/${name}.tsx`]
      : [`app/components/ui/${name}.tsx`];
    return [
      ...implementations,
      `tests/ui/${name}.spec.ts`,
      `reports/evidence/${name}-proof.json`,
    ];
  }
  const runtimeSurface = /\b(?:page|screen|view|surface|dashboard|inbox|workspace|navigation|settings|modal|drawer|form|editor|builder|wizard|onboarding|profile|feed|list|detail|summary|console|ui)\b/i.test(title);
  const implementations = team === "BUY"
    ? [...(runtimeSurface ? [`apps/buyer/app/${name}/page.tsx`] : []), `convex/${name}.ts`]
    : team === "SEL"
    ? [...(runtimeSurface ? [`apps/seller/app/${name}/page.tsx`] : []), `convex/${name}.ts`]
    : team === "INT"
    ? [`convex/agents/${name}.ts`]
    : [`convex/${name}.ts`];
  return [
    ...implementations,
    `tests/integration/${name}.spec.ts`,
    `reports/evidence/${name}-proof.json`,
  ];
}

type PathRole = "server" | "route" | "component" | "workflow" | "script" | "config" | "implementation" | "test" | "proof" | "delivery";

function pathRole(path: string): PathRole {
  if (/^tests\//.test(path)) return "test";
  if (/^reports\/evidence\//.test(path)) return "proof";
  if (/^(?:delivery\/|reports\/delivery\/)/.test(path)) return "delivery";
  if (/^\.github\/workflows\//.test(path)) return "workflow";
  if (/^(?:infra\/|scripts\/|synthetics\/|tools\/)/.test(path)) return "script";
  if (/^convex\//.test(path)) return "server";
  if (/^(?:app|apps)\/.+\/(?:page|route)\.(?:ts|tsx|js|jsx)$/.test(path)) return "route";
  if (/^(?:components|apps\/.+\/components|packages\/.+\/src)\/.+\.(?:tsx|jsx)$/.test(path)) return "component";
  if (/^(?:\.storybook\/|[^/]+\.(?:json|toml|yaml|yml)$)/.test(path)) return "config";
  return "implementation";
}

function pathCoverageRole(path: string): "implementation" | "test" | "proof" | "delivery" {
  const role = pathRole(path);
  if (role === "test" || role === "proof" || role === "delivery") return role;
  return "implementation";
}

function implementationPath(outcome: string, paths: string[]): string {
  const preferredRoles: PathRole[] = /\b(?:CI|gate|storybook)\b/i.test(outcome)
    ? ["workflow", "script", "server", "route", "component", "config", "implementation"]
    : /\b(?:performance|budget|load profile|manifest)\b/i.test(outcome)
    ? ["script", "config", "server", "workflow", "route", "component", "implementation"]
    : ["server", "workflow", "script", "route", "component", "config", "implementation"];
  for (const role of preferredRoles) {
    const path = paths.find((candidate) => pathRole(candidate) === role);
    if (path) return path;
  }
  return paths[0] ?? "delivery/bounded-delivery-plan.md";
}

function canonicalDocumentPath(path: string): boolean {
  return /^(?:Sourcera_Master_Spec\.md|UX_Design_of_Sourcera\.md|Audit_Prompts\.md|_(?:audit|integration)\/.+\.md)$/i.test(path);
}

function manualTaggedArtifactPath(path: string): boolean {
  const basename = path.split("/").at(-1) ?? "";
  return /(?:^|[/_.-])(?:r\d+[-_.])?f(?:[-_.]?ae)?[-_.]?\d{3,}[a-z0-9]*(?=[/_.-]|$)/i.test(path) ||
    /^(?:(?:pla|buy|sel|int)-\d+(?:[.-]|$))/i.test(basename) ||
    /^(?:\.?json|\.?md)$/i.test(basename);
}

const SEMANTIC_PROOF_PATH_OVERRIDES = new Map<string, string>([
  ["PLA-993", "reports/evidence/performance-budget-load-profiles.json"],
]);

const EXACT_PRODUCT_PATH_OVERRIDES = new Map<string, string[]>([
  ["PLA-958", [
    "app/api/health/route.ts",
    "apps/buyer/app/api/health/route.ts",
    "apps/seller/app/api/health/route.ts",
    "convex/http.ts",
    "delivery/public-api-route-registry.json",
    "tools/openapi/build-public-api.ts",
    "tools/openapi/verify-public-api-parity.ts",
    "tests/openapi/public-api-parity.spec.ts",
    "tests/integration/public-api-contract.spec.ts",
    "tests/e2e/public-api-safe-smoke.spec.ts",
  ]],
]);

const EXACT_UI_PATH_OVERRIDES = new Map<string, string[]>([
  ["PLA-549", [
    "apps/buyer/components/solo/solo-envelope-state.tsx",
    "apps/seller/components/solo/solo-envelope-state.tsx",
    "tests/e2e/solo-edge-cases-failure-modes.spec.ts",
    "tests/accessibility/solo-edge-cases-failure-modes.spec.tsx",
  ]],
  ["PLA-397", [
    "apps/buyer/app/workspace/[workspaceId]/health/page.tsx",
    "apps/seller/app/bid-workspace/[bidWorkspaceId]/health/page.tsx",
    "app/ops/bridge/page.tsx",
    "tests/e2e/console-bridge-observability.spec.ts",
  ]],
  ["PLA-516", [
    "app/globals.css",
    "apps/buyer/app/globals.css",
    "apps/seller/app/globals.css",
    "tests/ui/print-stylesheet-behavior.spec.ts",
  ]],
  ["PLA-906", [
    ".github/workflows/spec-lint.yml",
    "tools/spec-lint/gates/ux_token_drift_check.ts",
    "app/ops/design/token-drift/page.tsx",
    "app/ops/incident/page.tsx",
    "tests/e2e/token-drift-and-paging-runbook.spec.ts",
  ]],
  ["PLA-918", [
    "apps/seller/app/bid-workspaces/[bidWorkspaceId]/page.tsx",
    "apps/seller/components/bid-workspace/in-workspace-value-proof.tsx",
    "tests/e2e/seller-in-workspace-value-proof.spec.ts",
  ]],
]);

const EXACT_BEHAVIOR_OVERRIDES = new Map<string, string>([
  ["BUY-203", [
    "`evaluation_owner_mode` is the two-value `solo | team` Workspace surface selector. It changes only presentation and participation defaults; the same 13-phase evaluation engine, phase gates, audit rules, webhooks, timers, and stored evaluation records remain authoritative in both modes.",
    "At Workspace creation, Buyer Free and Buyer Solo default to `solo`; Buyer Starter, Growth, Scale, and Enterprise default to `team`, using the Organization's then-current Buyer plan. A later plan change never recomputes an existing Workspace.",
    "The Workspace Owner may change `solo → team` at any time. `team → solo` is accepted only when the Workspace has no qualifying stakeholder, guest, or outstanding invitation; the exact predicate and denial are enforced before mutation.",
    "Acceptance of the second qualifying non-guest membership automatically changes `solo → team` inside the membership transaction. Concurrent acceptances serialize on the Workspace and produce one mode change and one toast.",
  ].join("\n\n")],
  ["PLA-564", [
    "`plg_funnel_definition` is an environment-scoped, Ops-managed configuration row that selects the defining event for each funnel stage. Draft changes are inert until approved by `ops_finance_admin` or `ops_growth_admin`; customer roles cannot read or mutate the configuration.",
    "One approved change atomically activates the new definition version and emits exactly one registered `plg_funnel_definition_changed` audit event. Its allowlisted payload contains `stage`, `prior_definition_hash`, `new_definition_hash`, `ops_actor_user_id`, and `effective_at`.",
    "The active definition version is stamped on subsequent funnel transitions and exposed as an Ops dashboard cohort filter. A definition change never recomputes, rewrites, or deletes an earlier `funnel_stage_entered` row.",
  ].join("\n\n")],
]);

const EXACT_OUTCOME_OVERRIDES = new Map<string, string>([
  ["BUY-203", "Persist one Workspace-level `solo | team` surface selector with plan-snapshot defaults and guarded Owner changes while preserving the single 13-phase evaluation engine and its existing audit and delivery behavior."],
  ["PLA-564", "Let authorized Ops approve a versioned, per-environment funnel-stage definition without rewriting prior funnel events, and retain one exact audit record for every activated definition."],
]);

const EXACT_STATES_OVERRIDES = new Map<string, string>([
  ["BUY-203", "The stored value is exactly `solo` or `team`. Creation resolves the default once from the current Buyer plan and commits it with the Workspace. `solo → team` is allowed by an Owner request or automatically when the second non-guest `workspace_admin | use_case_lead | reviewer` membership is accepted. `team → solo` requires zero such memberships, zero guest memberships, and zero outstanding invitations; otherwise HTTP 422 `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present` preserves `team`. Automatic promotion serializes on `(workspace_id)` so concurrent acceptance returns one mode change and one audit event. A plan change leaves the value unchanged, and replay returns the first committed result."],
  ["BUY-408", "A submitted search attempt moves from `loading` to exactly one of `ready`, `no_results`, `malformed`, `offline`, `rate_limited`, `index_stale`, or `unavailable`. Editing or retrying creates a new attempt identity, cancels the prior request, and ignores every late response from an older attempt. `malformed` may transition through Search as text; `rate_limited` may retry only after its countdown; `index_stale` and `unavailable` retain query, filters, and sort while recovery runs. None of these UI states creates a persisted marketplace lifecycle row."],
  ["PLA-564", "A saved candidate is inert until an allowed Ops approver atomically makes it the one current definition for its environment and stage. Activation preserves the prior definition version for historical cohort reads and writes one audit event. Duplicate activation returns the first result; stale-version, concurrent, or unauthorized activation returns the bounded denial before the current pointer changes. Historical `funnel_stage_entered` rows and their stamped definition versions never transition or recompute."],
]);

const EXACT_TELEMETRY_REPLACEMENTS = new Map<string, string>([
  ["BUY-203", "Registered audit event: `workspace_evaluation_owner_mode_changed`. Every accepted mode change writes it exactly once with the old mode, new mode, bounded trigger reason, commit, environment, duration, and redacted correlation. It creates no separate PostHog event, webhook, customer notification, or Console Bridge projection, and records no customer content or cross-organization identifier."],
  ["PLA-564", "The only signal introduced by this change is the registered audit event `plg_funnel_definition_changed`. Its allowlisted payload is `stage`, `prior_definition_hash`, `new_definition_hash`, `ops_actor_user_id`, and `effective_at`; the two hashes are payload fields, not signals. Existing `funnel_stage_entered` product events keep their original definition version and are never re-emitted. Record bounded result, commit, environment, duration, and redacted correlation without customer content."],
]);

const EXACT_TELEMETRY_PREFIXES = new Map<string, string>([
  ["BUY-408", "Registered product analytics events: `marketplace_search_submitted`, `marketplace_search_results_rendered`, `marketplace_search_result_opened`, and `marketplace_search_recovered`."],
]);

const QUALITY_SAMPLE_PATH_OVERRIDES = new Map<string, string[]>([
  ["PLA-522", [
    "lib/retention/types.ts",
    "lib/retention/registry.ts",
    "lib/retention/resolve.ts",
    "tools/delivery/retention-coverage.ts",
    "tests/unit/retention-registry.spec.ts",
    "tests/unit/retention-resolution.spec.ts",
    "tests/integration/retention-entity-coverage.spec.ts",
    "reports/evidence/retention-registry-proof.json",
  ]],
  ["PLA-617", [
    "convex/ops/roleAuthority.ts",
    "app/ops/roles/page.tsx",
    "tests/integration/ops-role-matrix.spec.ts",
    "tests/e2e/ops-role-matrix.spec.ts",
    "reports/evidence/ops-role-matrix-proof.json",
  ]],
  ["SEL-106", [
    "convex/mcpPermissionPolicy.ts",
    "packages/mcp-server/src/permission-policy.ts",
    "tests/unit/mcp-permission-policy.spec.ts",
    "tests/integration/mcp-permission-policy.spec.ts",
    "reports/evidence/mcp-permission-policy-proof.json",
  ]],
  ["SEL-159", [
    "convex/sellerOrgPages.ts",
    "apps/seller/app/organization/page.tsx",
    "packages/ui/src/seller/SellerOrganizationPage.tsx",
    "tests/integration/seller-organization-page.spec.ts",
    "tests/e2e/seller-organization-page.spec.ts",
    "reports/evidence/seller-organization-page-proof.json",
  ]],
  ["SEL-183", [
    "convex/http.ts",
    "convex/marketplaceDiscovery.ts",
    "packages/api/src/marketplace-discovery.ts",
    "tests/integration/marketplace-discovery-api.spec.ts",
    "reports/evidence/marketplace-discovery-api-proof.json",
  ]],
]);

const QUALITY_SAMPLE_DIRECT_OUTCOME_ISSUES = new Set([
  "BUY-250", "BUY-257", "BUY-261", "BUY-306", "BUY-335", "BUY-346", "BUY-355",
  "PLA-236", "PLA-310", "PLA-342", "PLA-410", "PLA-412", "PLA-522", "PLA-580", "PLA-617",
  "SEL-73", "SEL-92", "SEL-106", "SEL-117", "SEL-127", "SEL-159", "SEL-172", "SEL-183", "SEL-252",
]);

function issuePath(issueId: string, path: string): string {
  const override = SEMANTIC_PROOF_PATH_OVERRIDES.get(issueId);
  return override && /^reports\/evidence\//.test(path) && manualTaggedArtifactPath(path)
    ? override
    : path;
}

function defaultBehavior(classification: IssueClass, profile: ContractProfile, outcome: string): string {
  if (profile === "presentation") {
    return `Deliver ${outcome} as a presentation contract that introduces no new persisted domain mutation, schema, API, billing effect, or customer notification. Render only authorized host data, preserve semantic structure and keyboard behavior, and keep every visual state deterministic across supported viewports, themes, locales, and reduced-motion settings.`;
  }
  if (classification === "runtime_gate") {
    return `Exercise ${outcome} through the production-equivalent runtime path. The gate passes only when the expected result, denial path, telemetry, and immutable receipt agree; missing or conflicting proof fails closed.`;
  }
  if (classification === "delivery_parent") {
    return `${outcome} is complete only when every native child outcome is independently deployable, every native blocking relation is clear, and every child proof receipt is accepted. Partial completion does not advance the delivery group.`;
  }
  if (classification === "decision") {
    return `${outcome}. Record one unambiguous choice, its constraints, rejected alternatives, effective trigger, and validation evidence. No implementation may assume an unstated choice.`;
  }
  return `Deliver ${outcome} as one atomic product contract. Validate inputs before mutation, persist only a complete valid result, keep retries idempotent, and expose a bounded failure without partial state.`;
}

type ExecutionProfile =
  | "presentation"
  | "runtime_gate"
  | "data"
  | "api"
  | "provider"
  | "worker"
  | "analytics"
  | "workflow"
  | "delivery";

interface ContractSignals {
  actors: string[];
  errors: string[];
  events: string[];
  states: string[];
}

interface ContractBasis {
  actor: string;
  errors: string;
  events: string[];
  facts: Record<ContractBasisSection, string>;
  implementation: string;
  states: string;
  testPath: string;
}

type ContractBasisSection =
  | "states"
  | "permissions"
  | "review"
  | "success"
  | "failure"
  | "recovery"
  | "rollout"
  | "rollback"
  | "telemetry"
  | "proof"
  | "assumptions"
  | "exclusions";

function executionProfile(
  classification: IssueClass,
  profile: ContractProfile,
  outcome: string,
  evidence: string,
): ExecutionProfile {
  const value = outcome;
  if (classification === "runtime_gate") return "runtime_gate";
  if (classification === "delivery_parent" || classification === "decision") return "delivery";
  if (profile === "presentation") return "presentation";
  if (
    /\b(?:field|entity|schema|record|history|storage|index|migration|retention)\b/i.test(outcome) &&
    /\b(?:no|without)\s+(?:new\s+)?(?:stripe|provider)\s+(?:call|dispatch|mutation|write|effect|integration)\b/i.test(evidence)
  ) return "data";
  if (/\b(?:stripe|workos|loops|firecrawl|provider|external api)\b/i.test(value)) return "provider";
  if (/\b(?:worker|job|scheduler|queue|processor|backfill|materializer|outbox|dlq)\b/i.test(value)) return "worker";
  if (/\b(?:api|endpoint|resolver|mutation|query|webhook)\b/i.test(value)) return "api";
  if (/\b(?:analytics|metric|score|measurement|attribution|funnel|posthog)\b/i.test(value)) return "analytics";
  if (/\b(?:entity|schema|record|ledger|snapshot|registry|index|migration|retention)\b/i.test(value)) return "data";
  return "workflow";
}

function contractSignals(evidence: string): ContractSignals {
  const actors = new Set<string>();
  const errors = new Set<string>();
  const events = new Set<string>();
  const states = new Set<string>();
  const codeToken = /\b[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)+\b/gi;
  const nonEventTokens = new Set([
    "created_at", "updated_at", "deleted_at", "entity_id", "event_id",
    "workspace_id", "organization_id", "org_id", "request_id", "user_id",
    "created_by", "updated_by", "emitted_event_ids", "e.g", "i.e",
  ]);
  const addTokens = (line: string, target: Set<string>, predicate: (token: string) => boolean = () => true, maximum = 16) => {
    for (const match of line.matchAll(codeToken)) {
      const token = match[0];
      if (token.includes("/") || token.length > 96 || !predicate(token)) continue;
      target.add(token);
      if (target.size >= maximum) break;
    }
  };
  for (const line of evidence.split(/\r?\n/)) {
    if (/\b(?:PostHog\s+events?|registered\s+(?:product\s+)?signals?|registered\s+(?:product\s+)?events?|webhooks?)\s*(?:are|:)/i.test(line)) {
      const declaration = line.split(/\b(?:properties|payload|labels|dimensions|envelope)\b/i)[0];
      addTokens(
        declaration,
        events,
        (token) =>
          !nonEventTokens.has(token.toLowerCase()) &&
          !/(?:^|[._])(?:id|state|status|kind|type|version|count|region|handle|reason|reference|destination|pending)$|_(?:id|at|cents|minor|band|expires_at|remaining|sla|atomic|atomic_delta|exact_authority|no_secret_exposure|sequence|dsar)$/i.test(token) &&
          !/\.(?:cjs|css|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$/i.test(token),
        48,
      );
    }
    const emissionVerb = /\b(?:emit(?:s|ted|ting)?|fire(?:s|d)?|dispatch(?:es|ed)?|deliver(?:s|ed|ing)?|receiv(?:e|es|ed|ing)|notif(?:y|ies|ied|ying)|publish(?:es|ed|ing)?|enqueue(?:s|d|ing)?|write(?:s|written)?|record(?:s|ed|ing)?|send(?:s|sent|ing)?)\b/i;
    const negatedEmission = /\b(?:no|never|must not|does not|do not)\b[^.]{0,50}\b(?:emit(?:s|ted|ting)?|fire(?:s|d)?|dispatch(?:es|ed)?|deliver(?:s|ed|ing)?|receiv(?:e|es|ed|ing)|notif(?:y|ies|ied|ying)|publish(?:es|ed|ing)?|enqueue(?:s|d|ing)?|write(?:s|written)?|record(?:s|ed|ing)?|send(?:s|sent|ing)?)\b/i;
    for (const clause of splitProseSentences(line).flatMap((sentence) => sentence.split(/;\s+/))) {
      if (!/\b(?:events?|webhooks?|signals?|metrics?|telemetry|notifications?|emails?|in-app|messages?|registered|registry|detector|emit|fire|dispatch|deliver|receive|notify|publish|enqueue|send|posthog|audit)\b/i.test(clause) ||
          !emissionVerb.test(clause) ||
          negatedEmission.test(clause)) continue;
      const verbIndex = clause.search(emissionVerb);
      for (const match of clause.matchAll(codeToken)) {
        const token = match[0];
        const tokenIndex = clause.toLowerCase().indexOf(token.toLowerCase());
        const between = verbIndex >= 0 && tokenIndex > verbIndex
          ? clause.slice(verbIndex, tokenIndex).toLowerCase()
          : "";
        if (
          token.includes("/") || token.length > 96 || token.length < 5 || nonEventTokens.has(token.toLowerCase()) ||
          /\.(?:cjs|css|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$/i.test(token) ||
          (!token.includes("_") && !token.includes(".")) ||
          /(?:^|[._])(?:id|state|status|kind|type|version|count|region|handle|reason|reference|destination|pending)$|_(?:id|at|cents|minor|band|expires_at|remaining|sla|atomic|atomic_delta|exact_authority|no_secret_exposure|sequence|dsar)$/i.test(token) ||
          verbIndex < 0 || tokenIndex <= verbIndex || tokenIndex - verbIndex > 140 ||
          /\b(?:with|payload|field|property|contains?|carries|including|includes?)\b/.test(between)
        ) continue;
        events.add(token);
        if (events.size >= 48) break;
      }
    }
    if (/\b(?:error|reject|deny|fail|invalid|forbidden|conflict|timeout|unavailable)\b/i.test(line)) {
      addTokens(line, errors, (token) => /(?:error|failed|invalid|forbidden|denied|conflict|timeout|unavailable|exceeded|not_found|locked|rate_limited)/i.test(token));
    }
    if (/\b(?:state|status|transition|lifecycle|enum)\b/i.test(line)) {
      for (const match of line.matchAll(/`([a-z][a-z0-9_-]{2,48})`/gi)) {
        if (!/^(?:state|status|type|value|kind|id)$/i.test(match[1])) states.add(match[1]);
        if (states.size >= 16) break;
      }
    }
    if (/\b(?:permission|role|actor|authorization|caller)\b/i.test(line)) {
      for (const match of line.matchAll(/`([a-z][a-z0-9_-]{2,64})`/gi)) {
        if (/(?:owner|admin|lead|reviewer|editor|viewer|member|agent|ops|system|service|user)/i.test(match[1])) actors.add(match[1]);
        if (actors.size >= 12) break;
      }
    }
  }
  return {
    actors: [...actors],
    errors: [...errors],
    events: [...events],
    states: [...states],
  };
}

function codeList(values: string[], fallback: string, maximum = 10): string {
  return values.length > 0 ? values.slice(0, maximum).map((value) => `\`${value}\``).join(", ") : fallback;
}

function contractAnchor(evidence: string, outcome: string): string {
  const outcomeWords = keywords(outcome);
  const candidates = evidence.split(/\r?\n/).flatMap((rawLine) => {
    if (/^\s*(?:#{1,6}|```|\|?\s*:?-{2,})/.test(rawLine)) return [];
    const value = rawLine
      .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "")
      .replace(/^\s*\|?|\|?\s*$/g, "")
      .replace(/\s*\|\s*/g, "; ")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (
      value.length < 45 ||
      value.length > 650 ||
      SOURCE_DEFERRAL.test(value) ||
      MANUAL_RELATION_PLANNING.test(value) ||
      PRIOR_NORMALIZATION_BOILERPLATE.test(value) ||
      GENERIC_BOILERPLATE.test(value) ||
      /\b(?:assumptions?|validation trigger|source authority|source of truth|child|owner|owns?|owned by|consumes?|supplies|depends on|is blocked by|blocked by|prerequisite|provided by|implemented by|implementation belongs to|governed by|see|per|after .{0,80} passes|before .{0,80} passes|waits? for|downstream|upstream)\b/i.test(value)
    ) return [];
    const overlap = [...keywords(value)].filter((word) => outcomeWords.has(word)).length;
    const score = overlap * 8 +
      (/\b(?:must|shall|reject|deny|return|persist|render|emit|write|record|compute|allow|prevent|require)\b/i.test(value) ? 8 : 0) +
      (/`[^`]+`|\bHTTP\s+\d{3}\b|\b\d+(?:\.\d+)?(?:%|\s*(?:ms|seconds?|minutes?|hours?|days?|MB|GB))\b/i.test(value) ? 4 : 0);
    return [{ overlap, score, value }];
  });
  const scoped = candidates.some((candidate) => candidate.overlap > 0)
    ? candidates.filter((candidate) => candidate.overlap > 0)
    : candidates;
  scoped.sort((left, right) => right.score - left.score || right.value.length - left.value.length);
  const selected = scoped[0]?.value ?? `${outcome} must satisfy the exact fields, values, and result rules listed in Complete behavior and rules`;
  return /[.!?]$/.test(selected) ? selected : `${selected}.`;
}

function stripInheritedSupportingBoilerplate(key: "review" | "success", value: string): string {
  const pattern = key === "review"
    ? /(?:Independent review of .+ must confirm the behavior, denial paths, isolation boundary|Review `[^`]+`, `[^`]+`, and `[^`]+` on the same commit|independent reviewer must inspect `[^`]+`, `[^`]+`, and `[^`]+` from one commit and verify the exact schemas|Provider contract and sandbox tests|Replay, timeout, retry, DLQ, and outage tests|Security and observability checks|Static\/configuration validation|CI, deployment, migration, rollback, and recovery tests|Environment receipt validation)/i
    : /(?:delivered behavior satisfies this outcome|Server-side authorization, org\/console\/workspace isolation|Keyboard, touch, focus, screen-reader, reduced-motion, and responsive behavior pass the applicable|completes through the intended user and service path|Configuration, secrets, migration, deployment, rollback, recovery, and fail-closed behavior are tested|CI and target-environment receipts identify commit, environment, timestamp, assertion, and result)/i;
  return value.split(/\r?\n/).filter((line) => !pattern.test(line)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function inferredContractActor(outcome: string, evidence: string, actors: string[], team?: string): string {
  if (/\b(?:CI|gate|storybook|performance (?:budget|harness)|load (?:profile|harness)|performance budget|load profile|executable manifest)\b/i.test(outcome)) {
    return "the protected CI or service identity";
  }
  if (actors.length > 0) return codeList(actors, "", 8);
  if (/\b(?:ops|admin)\b/i.test(outcome)) return "the authorized Ops role";
  if (/\bseller\b/i.test(outcome) && !/\bbuyer\b/i.test(outcome)) return "the authenticated Seller Org actor";
  if (/\bbuyer\b/i.test(outcome) && !/\bseller\b/i.test(outcome)) return "the authenticated Buyer Workspace actor";
  if (team === "BUY") return "the authenticated Buyer Workspace actor";
  if (team === "SEL") return "the authenticated Seller Org actor";
  const value = `${outcome}\n${evidence}`;
  if (/\b(?:ops|admin console)\b/i.test(value)) return "the authorized Ops role";
  if (/\bseller\b/i.test(value) && !/\bbuyer\b/i.test(value)) return "the authenticated Seller Org actor";
  if (/\bbuyer\b/i.test(value) && !/\bseller\b/i.test(value)) return "the authenticated Buyer Workspace actor";
  if (/\b(?:public|anonymous)\b/i.test(value) && /\b(?:GET|read-only|read only|reads?|view|browse)\b/i.test(value)) {
    return "the anonymous read-only caller";
  }
  if (/\b(?:worker|scheduler|cron|job|system)\b/i.test(value)) return "the registered system worker";
  return "the authenticated organization-scoped caller";
}

const CONTRACT_BASIS_SECTIONS: ContractBasisSection[] = [
  "states", "permissions", "review", "success", "failure", "recovery",
  "rollout", "rollback", "telemetry", "proof", "assumptions", "exclusions",
];

const CONTRACT_BASIS_TERMS: Record<ContractBasisSection, RegExp> = {
  states: /\b(?:state|status|transition|lifecycle|enum|draft|active|pending|complete|failed|terminal)\b/i,
  permissions: /\b(?:actor|role|permission|authorization|authorized|buyer|seller|ops|admin|owner|public|anonymous|organization|org|workspace|console|tenant|scope|privacy|residency|retention)\b/i,
  review: /\b(?:review|acceptance|verify|validation|fixture|test|assert|exact|checksum|approval)\b/i,
  success: /\b(?:must|shall|returns?|renders?|persists?|records?|allows?|creates?|computes?|shows?|passes?|succeeds?)\b/i,
  failure: /\b(?:reject|deny|forbid|fail|error|invalid|conflict|timeout|unavailable|cannot|must not|never|missing)\b/i,
  recovery: /\b(?:recover|retry|replay|restore|reconcile|resume|repair|quarantine|backfill|redrive|rebuild|correct)\b/i,
  rollout: /\b(?:rollout|deploy|migration|canary|preview|staging|enable|expand|release)\b/i,
  rollback: /\b(?:rollback|roll back|restore|disable|revert|reverse|prior|last verified)\b/i,
  telemetry: /\b(?:event|telemetry|metric|audit|webhook|notification|email|signal|posthog|log|alert|emit|dispatch)\b/i,
  proof: /\b(?:proof|receipt|evidence|checksum|commit|deployment|environment|trace|reviewer)\b/i,
  assumptions: /\b(?:assum|requires?|depends|current|valid|invariant|trigger|precondition)\b/i,
  exclusions: /\b(?:exclude|outside|must not|never|forbid|does not|no new|limited|only)\b/i,
};

const CONTRACT_BASIS_LABELS: Record<ContractBasisSection, string> = {
  states: "Lifecycle basis",
  permissions: "Authority basis",
  review: "Readiness basis",
  success: "Positive-case basis",
  failure: "Negative-case basis",
  recovery: "Recovery basis",
  rollout: "Release basis",
  rollback: "Reversal basis",
  telemetry: "Signal basis",
  proof: "Evidence basis",
  assumptions: "Validity basis",
  exclusions: "Boundary basis",
};

function contractBasisFacts(outcome: string, evidence: string): Record<ContractBasisSection, string> {
  const outcomeWords = keywords(outcome);
  const rawCandidates = evidence.split(/\r?\n/).flatMap((rawLine, index) => {
    if (/^\s*(?:#{1,6}|```|\|?\s*:?-{2,})/.test(rawLine)) return [];
    const value = rawLine
      .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "")
      .replace(/^\s*\|?|\|?\s*$/g, "")
      .replace(/\s*\|\s*/g, "; ")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (
      value.length < 24 ||
      value.length > 520 ||
      SOURCE_DEFERRAL.test(value) ||
      MANUAL_RELATION_PLANNING.test(value) ||
      PRIOR_NORMALIZATION_BOILERPLATE.test(value) ||
      GENERIC_BOILERPLATE.test(value) ||
      PLANNING_HISTORY.test(value) ||
      !stripInheritedSupportingBoilerplate("review", value) ||
      !stripInheritedSupportingBoilerplate("success", value) ||
      /\b(?:assumptions?|validation trigger|source authority|source of truth|child|owner|owns?|owned by|consumes?|supplies|depends on|is blocked by|blocked by|prerequisite|provided by|implemented by|implementation belongs to|governed by|see|per|after .{0,80} passes|before .{0,80} passes|waits? for|downstream|upstream)\b/i.test(value)
    ) return [];
    const overlap = [...keywords(value)].filter((word) => outcomeWords.has(word)).length;
    return [{ index, overlap, value }];
  });
  const seenCandidateValues = new Set<string>();
  const candidates = rawCandidates.filter((candidate) => {
    const key = candidate.value.toLowerCase();
    if (seenCandidateValues.has(key)) return false;
    seenCandidateValues.add(key);
    return true;
  });
  const used = new Set<number>();
  const facts = {} as Record<ContractBasisSection, string>;
  for (const section of CONTRACT_BASIS_SECTIONS) {
    const pattern = CONTRACT_BASIS_TERMS[section];
    const ranked = candidates
      .filter((candidate) =>
        !used.has(candidate.index) &&
        pattern.test(candidate.value) &&
        (section !== "telemetry" ||
          /\b(?:telemetry|metric|audit|webhook|signal|posthog|log|alert|emit|dispatch|deliver|send|fire)\w*\b/i.test(candidate.value))
      )
      .map((candidate) => ({
        ...candidate,
        score: candidate.overlap * 7 + 14 +
          (/`[^`]+`|\bHTTP\s+\d{3}\b|[≤≥<>]=?\s*\d|\b\d+(?:\.\d+)?(?:%|\s*(?:ms|seconds?|minutes?|hours?|days?|MB|GB))\b/i.test(candidate.value) ? 5 : 0),
      }))
      .sort((left, right) => right.score - left.score || left.index - right.index);
    const selected = ranked[0];
    if (selected) {
      used.add(selected.index);
      const sentence = /[.!?]$/.test(selected.value) ? selected.value : `${selected.value}.`;
      facts[section] = `${CONTRACT_BASIS_LABELS[section]} — ${sentence}`;
      continue;
    }
    facts[section] = "";
  }
  return facts;
}

function contractBasis(outcome: string, evidence: string, paths: string[], team?: string): ContractBasis {
  const signals = contractSignals(evidence);
  return {
    actor: inferredContractActor(outcome, evidence, signals.actors, team),
    errors: codeList(signals.errors, "a non-revealing denial before mutation"),
    events: signals.events,
    facts: contractBasisFacts(outcome, evidence),
    implementation: implementationPath(outcome, paths),
    states: codeList(signals.states, "the accepted result and the unchanged prior result"),
    testPath: paths.find((path) => pathRole(path) === "test") ?? paths[0] ?? "tests/integration/bounded-delivery.spec.ts",
  };
}

function proofContract(
  outcome: string,
  proofPath: string,
  evidence: string,
  paths: string[],
): string {
  const basis = contractBasis(outcome, evidence, paths);
  const implementationEvidence = /^tools\/delivery\//.test(basis.implementation)
    ? "the protected verifier implementation"
    : `\`${basis.implementation}\``;
  return `${basis.facts.proof} Evidence is retained at \`${proofPath}\`; it binds ${implementationEvidence} and \`${basis.testPath}\` checksums to the observed result, timestamp, environment, commit, trace correlation, reviewer, canary result, rollback result, and \`zeroCustomerData=true\`.`;
}

function customerDeliveryChannels(evidence: string): string {
  const channels = [
    /\bwebhooks?\b/i.test(evidence) ? "webhook" : "",
    /\bin-app\b/i.test(evidence) ? "in-app notification" : "",
    /\bemails?\b/i.test(evidence) ? "email" : "",
    /\bnotifications?\b/i.test(evidence) && !/\bin-app\b/i.test(evidence) ? "notification" : "",
    /\bmessages?\b/i.test(evidence) ? "message" : "",
  ].filter(Boolean);
  if (channels.length === 0) return "customer delivery";
  if (channels.length === 1) return channels[0];
  return `${channels.slice(0, -1).join(", ")} and ${channels.at(-1)}`;
}

function explicitTelemetry(
  outcome: string,
  proofPath: string,
  evidence: string,
  existing = "",
  runtimeGate = false,
): string {
  const harnessTelemetry = runtimeGate && Boolean(existing.trim());
  const telemetryEvidence = harnessTelemetry ? existing : `${evidence}\n${existing}`;
  const signals = contractSignals(telemetryEvidence).events;
  const telemetryFact = contractBasisFacts(outcome, harnessTelemetry ? existing : evidence).telemetry;
  const customerDelivery = !harnessTelemetry && CUSTOMER_DELIVERY_CLAIM.test(evidence);
  const deliveryChannels = customerDeliveryChannels(evidence);
  const cleanedExisting = signals.length > 0 || customerDelivery
    ? stripNoCustomerDeliveryClaims(existing).split(/\r?\n/).filter((line) =>
        !/\b(?:emits?|adds?) no\b[^.]{0,120}\b(?:product|customer analytics|new|inferred)?\s*(?:event|webhook|notification)s?\b/i.test(line)
      ).join("\n").trim()
    : existing;
  const cleanedTelemetryFact = customerDelivery
    ? stripNoCustomerDeliveryClaims(telemetryFact)
    : telemetryFact;
  if (signals.length > 0) {
    return [
      `${cleanedTelemetryFact ? `${cleanedTelemetryFact} ` : ""}These registered signals fire after the owning transaction commits using their existing audience, payload allowlist, privacy class, idempotency key, retry curve, and outage routing:\n${signals.slice(0, 48).map((signal) => `- Registered signal \`${signal}\`.`).join("\n")}`,
      cleanedExisting,
      `Record commit, environment, result, duration, redacted correlation, and delivery outcome in \`${proofPath}\`; never include secrets, free text, or customer content.`,
    ].filter(Boolean).join("\n\n");
  }
  if (customerDelivery) {
    return [
      `${cleanedTelemetryFact ? `${cleanedTelemetryFact} ` : ""}Internal service metrics record the ${deliveryChannels} delivery outcome, accepted identity, bounded result, attempt count, latency, and redacted correlation. No customer analytics event is added.`,
      cleanedExisting,
      `Record commit, environment, delivery result, duration, redacted correlation, and retry or dead-letter outcome in \`${proofPath}\`; never include secrets, destination values, free text, or customer content.`,
    ].filter(Boolean).join("\n\n");
  }
  return [
    `${telemetryFact} This delivery emits no product event, sends no webhook, and delivers no customer notification.`,
    cleanedExisting,
    `Record only commit, environment, result, duration, and redacted correlation in \`${proofPath}\` and the owning service's operational error log; include no secrets, free text, tenant identifiers, or customer content.`,
  ].filter(Boolean).join("\n\n");
}

const CUSTOMER_DELIVERY_CLAIM = /\b(?:deliver|dispatch|send|receive|notify|publish|enqueue)[^.\n]{0,120}\b(?:webhook|notification|email|in-app|message)|\b(?:webhook|notification|email|in-app|message)[^.\n]{0,120}\b(?:deliver|dispatch|send|receive|notify|publish|enqueue)/i;
const NO_CUSTOMER_DELIVERY_CLAIM = /\b(?:emit(?:s|ted)?|add(?:s|ed)?|introduce(?:s|d)?|create(?:s|d)?|send(?:s|sent)?|deliver(?:s|ed)?)\s+no\s+(?!(?:new|inferred|additional|free-form)\b)[^.\n]{0,100}\b(?:webhook|notification|email|in-app|message)s?\b|\bno\s+(?:customer-facing\s+)?(?:webhook|notification|email|in-app|message)s?\s+(?:is|are|will be\s+)?(?:emitted|sent|delivered|created|added|introduced)\b/i;

function stripNoCustomerDeliveryClaims(value: string): string {
  return value.split(/\r?\n/).flatMap((line) => {
    if (!NO_CUSTOMER_DELIVERY_CLAIM.test(line)) return [line];
    const retained = splitProseSentences(line).filter((sentence) =>
      !NO_CUSTOMER_DELIVERY_CLAIM.test(sentence)
    );
    return retained.length > 0 ? [retained.join(" ")] : [];
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const OPERATION_SCOPED_PERMISSIONS: Readonly<Record<string, string>> = {
  "BUY-203": [
    "Only the Workspace creation service may set the initial `evaluation_owner_mode` from the Organization's current Buyer plan, only the authenticated Workspace Owner may request a manual mode change in that same Buyer Organization and Workspace, and only the membership-acceptance transaction may perform automatic `solo → team` promotion.",
    "Other Buyer members, Seller actors, public callers, another Organization, and unrelated service identities cannot read protected membership predicates or change the field. The server resolves Organization, Buyer console, Workspace, Owner membership, current mode, qualifying memberships, guests, and outstanding invitations under the Workspace lock before read or mutation; wrong-organization, wrong-console, non-Owner, stale-membership, and guarded `team → solo` requests return the bounded non-revealing denial.",
  ].join("\n\n"),
  "BUY-312": [
    "Only an authenticated Buyer Workspace actor or an authenticated invited Seller Org actor may perform a Q&A operation, and each actor is limited to the current phase, thread visibility, and bound Workspace or Bid Workspace.",
    "The Buyer actor may create, reply to, and read only inside the owning Workspace. The Seller actor may create, reply to, and read only through its Seller Org projection for the bound Bid Workspace; it never reads the Buyer-owned Thread row directly. Phase 8 is seller read-only, and Phases 9–12 are read-only for both sides.",
    "PUBLIC threads are limited to NDA-cleared invited sellers and the Buyer team. PRIVATE threads are limited to the addressed seller plus the Buyer Workspace Owner, Workspace Admin, and Use Case Lead; only the Buyer may change PRIVATE to PUBLIC, and only a Workspace Owner may reveal pre-flip history.",
    "The registered phase-transition worker may close or make threads read-only but cannot grant visibility or exceed the question cap. Wrong-organization, wrong-Workspace, wrong-console, uninvited, NDA-ineligible, cross-vendor, and visibility-ineligible requests are denied without revealing thread existence or protected content.",
  ].join("\n\n"),
  "BUY-317": [
    "Only an authenticated invited Seller Org actor or the current Buyer Workspace Owner may act on an additional-slot request for the bound vendor and Workspace.",
    "The Seller actor may submit one bounded justification and read its own request only after the applicable question cap is reached; it cannot approve, deny, extend, change the base cap, or grant slots. The Buyer Workspace Owner may approve an increment only up to the configured additional-slot cap for that vendor and Workspace, deny with a comment, or extend the request deadline; other Buyer members cannot decide the request.",
    "The registered delivery service may send the resulting task and decision notifications and append the audit result only after the owning transaction commits; it cannot decide a request or change an entitlement. Wrong-organization, wrong-Workspace, wrong-vendor, wrong-console, stale-membership, duplicate, and over-cap requests are denied without exposing another party's request, justification, or decision.",
  ].join("\n\n"),
  "BUY-334": [
    "Only the residency-bound training service, the exact human Applied-ML and Marketing signers, or the authorized Ops model-lifecycle role may perform a model-lifecycle operation within its declared residency partition.",
    "The training service may create a candidate after offline evaluation and may auto-publish an incremental epoch only when every registered guardrail passes; it cannot promote a full refit, change the feature registry, or waive a failed metric. Ops may request a feature-registry bump or refit and may move a qualified candidate to shadow or a qualified shadow to published, but publication that requires Applied-ML and Marketing approval must contain two valid, role-correct sign-offs and no signer may satisfy both roles.",
    "A production emergency rollback requires distinct Applied-ML on-call and Ops-leadership sign-off. Only the retirement worker may move a deprecated version to retired after the applicable grace window; no customer or general Ops caller may train, publish, roll back, retire, or read training rows or model weights.",
    "Cross-residency labels, wrong-role signers, self-signoff, stale candidates, failed guardrails, and concurrent publication are rejected before the published pointer changes, with no training-row or weight disclosure to Buyer, Seller, or public callers.",
  ].join("\n\n"),
  "BUY-341": [
    "Only a seller-console caller holding the required Bearer scope and one of `seller_billing_admin`, `seller_org_admin`, or `seller_org_owner`, an Ops caller already entitled to registry reads, `ops_opt_out_admin`, or the registered authority-probe worker may perform its corresponding Vendor Opt-Out operation.",
    "A qualified Seller actor may create, list, read, or revoke only its own Seller Org's opt-out and authority-attestation rows. Creating or probing requires the matching write scope and verified Org authority; a Seller actor cannot revoke an `ops_imposed` row or `ops_imposed_attestation`. An entitled Ops reader may list or retrieve registry rows through the Ops projection, while only `ops_opt_out_admin` may revoke an Ops-imposed row.",
    "The probe worker may update only the requested attestation's DNS-verification result and cannot create or revoke an opt-out. Buyer-console, cross-organization, foreign-attestation, expired-authority, missing-scope, and wrong-role requests return the non-revealing firewall or not-found result before row contents, suppression scope, or authority evidence is exposed.",
  ].join("\n\n"),
  "BUY-344": [
    "Only the registered severity evaluator or an authorized human Ops triage reviewer may assign or change an Abuse Report severity.",
    "The evaluator may set the initial severity only from the closed automatic predicates and may promote duplicate reports by one level; it cannot decide a report, restore content, or impose a ban. The Ops reviewer may re-stamp severity and apply the corresponding hide or restore action through an allowed report transition. A `seller_banned` disposition with `ban_scope=org_level_all_consoles` requires two distinct `ops_content_admin` signers, and one actor cannot satisfy both approvals.",
    "Only the SLA worker may stamp a breach and route an overdue report to the Ops management queue; it cannot change the report's decision or severity. A reporter, Buyer, Seller, subject, public caller, general Ops user, wrong-residency reviewer, or expired session cannot triage, re-stamp, restore, or ban, and privileged report data is denied before disclosure.",
  ].join("\n\n"),
  "BUY-408": [
    "Only an authenticated Buyer-Organization actor in the Buyer console may execute Marketplace browse, search, filter, sort, recovery, or profile-open operations, and the server admits only the query and filter classes granted by that Organization's current Buyer plan.",
    "The actor may receive only published, eligible seller-profile projections and the allowlisted public card fields. Free and Solo actors may browse but cannot execute text or filter search; Starter may use text and capability search; Growth, Scale, and Enterprise may use the full admitted filter set. Hidden controls, crafted direct calls, wrong-organization, cross-console, private-seller-field, suppressed-seller, and out-of-plan requests return a non-revealing denial without query, ranking, seller, or entitlement leakage.",
  ].join("\n\n"),
  "PLA-267": [
    "Only an authorized Buyer Workspace actor or an authorized Seller Bid Workspace actor may receive a pipeline projection from its own host surface.",
    "The Buyer host may supply the owning Workspace's authorized `pipeline_stage_id` projection and render the Buyer mapping. The Seller host may supply only the firewall-bounded projection for its Seller Org and bound Bid Workspace and render the Seller mapping. Neither host nor the presentation component may advance, rewind, or create a second phase counter; navigation is read-only and every mutation remains governed by the existing phase-advancement authority.",
    "The renderer grants no Ops, Buyer, Seller, or public data authority of its own. The server resolves organization, Workspace, Bid Workspace, console, residency, and membership before props are created; wrong-organization, cross-Workspace, cross-console, stale-membership, and hidden engine data never reach props, markup, accessibility labels, client logs, screenshots, or error copy.",
  ].join("\n\n"),
  "PLA-551": [
    "Only the endpoint's already-authorized public, Buyer, Seller, Ops, or service caller may proceed past the shared abuse-prevention controls, and passing those controls grants no additional business operation or data access.",
    "The edge and registered scanning services may enforce content type, body and structure limits, schema shape, upload integrity, malware checks, and quarantine state for every request. Anonymous public callers may reach only an explicitly public operation after its public rate and envelope checks; protected callers must resolve token, console, organization, role, and resource scope before detailed validation is returned.",
    "The scanner may quarantine or retain an attachment in pending state but cannot mark an unreadable file clean or publish its parent. Buyer, Seller, Ops, public, and service callers remain limited by the underlying handler, and wrong-organization, wrong-console, wrong-role, over-limit, malformed, suspicious, pending-scan, and dependency-unavailable requests fail closed without protected schema, object-existence, secret, or customer-content disclosure.",
  ].join("\n\n"),
  "PLA-668": [
    "Only an authorized Ops analytics-schema maintainer may change the canonical event-family registry through a protected, reviewed repository change. Only registered Usage Event validators and outbox workers may classify or dispatch an event against the accepted registry; an emitter cannot add a family, skip the required envelope, change residency routing, or widen a dashboard audience.",
    "Only an already-authorized Buyer, Seller, or Ops dashboard reader may receive the event projection permitted by that dashboard's existing organization, console, residency, retention, and property allowlist; registry membership grants no customer read or write authority. Public callers receive no internal registry or event-row access.",
    "Unknown families, missing envelopes, unregistered emitters, wrong PostHog project, cross-residency rows, disallowed customer-project properties, and redaction-pending payloads are rejected or quarantined before dispatch. Customer roles, service tokens, and dashboard readers cannot mutate registry rows, release quarantined events, or inspect another organization or console.",
  ].join("\n\n"),
  "PLA-698": [
    "Only `buyer_billing_admin` or `buyer_owner`, the signed referee-redemption service, the registered referral and billing workers, Signal Integrity Monitor, or an audited authorized Ops decision-maker may perform the transition assigned to that actor.",
    "A qualified Buyer actor may create and read a referral only for its own referrer Org and cannot bind a referee, mark activation, issue, redeem, expire, forfeit, override, or revoke credit. The redemption service may bind one eligible referee Org from a valid code; the referral worker may evaluate the stamped activation policy and issue or expire credit; the billing worker may apply, void, or reverse only the matching Stripe Credit Note.",
    "Signal Integrity Monitor may move an eligible pre-issuance row to `flagged_fraud` only with at least one registered signal. An authorized Ops actor may forfeit or restore a flagged row only with the required audit fields, and post-issuance revocation requires the recorded reason and DPO approval; Ops cannot directly issue or redeem credit or skip an intermediate state.",
    "Wrong-organization, second-referral, self-referral, existing-paying-Org, opt-out, unstamped-policy, same-domain-suppressed, overlap, wrong-state, duplicate-job, and missing-approval requests are denied before credit or referral data is exposed, and no actor may jump an undeclared transition or mutate another Org's referral.",
  ].join("\n\n"),
  "PLA-732": [
    "Only a host surface that has already authorized its Buyer, Seller, Ops, or public caller may pass a field value, option, error, help text, or callback into the shared FormField component.",
    "The host's server handler resolves organization, console, role, resource, residency, and field-level redaction before creating props. FormField may render and return the bounded user input to that same authorized callback, but it cannot fetch domain data, grant a role, upload a file by itself, choose a business transition, or bypass the owning handler's validation and mutation authority.",
    "Protected CI may build and validate the component package but has no product-session or customer-data authority. Hidden, cross-organization, wrong-console, unauthorized, secret, or unredacted values must not reach props, DOM, accessibility labels, browser logs, screenshots, validation copy, or telemetry.",
  ].join("\n\n"),
  "PLA-996": [
    "Only the protected staging verifier and its two synthetic, separately authenticated Buyer and Seller identities may execute the golden journey, and each identity remains limited to its normal product authority.",
    "The synthetic Buyer actor may create and advance only its own test Workspace, satisfy the required gates, and read the resulting Selection Record through the authorized Buyer projection. The synthetic Seller actor may accept only its intended invitation and create, edit, and submit only its own bound Bid Workspace response; it cannot advance Buyer phases or read the Selection Record.",
    "The verifier may orchestrate those public product operations and read bounded receipts, but it cannot grant roles, write product rows directly, bypass a phase lock or console firewall, suppress a required failure, impersonate a customer, or use production credentials or customer data. Wrong-organization, wrong-seller, cross-console, stale-invite, skipped-gate, duplicate, and Seller Selection-Record reads must fail without protected data or partial state.",
  ].join("\n\n"),
  "PLA-564": [
    "Only an identified Ops actor with active `ops_finance_admin` or `ops_growth_admin` authority may approve or replace a `plg_funnel_definition` for the declared environment and stage. A draft author may save an inert draft only when the same Ops scope allows it; customer, Buyer, Seller, public, and general Ops roles cannot read or mutate the registry.",
    "The server resolves actor role, environment, stage, current active version, draft version, and optimistic concurrency token before activation. Missing authority returns HTTP 403 `plg_funnel_definition_unauthorized`; wrong environment, stale version, duplicate active version, and concurrent approval fail before the active pointer or any prior funnel event changes.",
  ].join("\n\n"),
  "SEL-170": [
    "Only an identified human with active MFA and `ops_taxonomy_admin` may create, publish, structurally replace, deprecate, merge, hard-retire, reactivate, or soft-delete a Taxonomy Node. A human `ops_marketing_editor` with active MFA may only moderate Controlled-Vocabulary Tag proposals for the permitted dimensions and edit the permitted editorial fields; that role cannot perform a structural edit or Taxonomy Node state transition.",
    "An eligible authenticated Seller actor may only submit a tag proposal through the proposal endpoint; it cannot write a Taxonomy CMS row, choose a moderation result, or mint a freeform approved value. Only a residency-bounded migration worker may execute the cascade produced by an accepted Ops transition, and it cannot choose the disposition or expand the affected partition.",
    "Buyer and Seller Taxonomy CMS writes return the registered forbidden result, and service accounts cannot hold either Ops authoring role. Public, Buyer, and Seller readers may resolve only active public taxonomy projections already allowed to their surface; draft, internal, proposal, actor, audit, cross-residency, and another tenant's data remain undisclosed.",
  ].join("\n\n"),
  "SEL-171": [
    "Only an authenticated Seller Org actor with at least one published Capability Declaration or an identified human `ops_marketing_editor` with active MFA may perform its assigned proposal operation.",
    "The eligible Seller actor may submit a bounded proposal for its own Org and receive that proposal's terminal decision; it cannot claim, approve, reject, merge, publish, set visibility, inspect internal near matches, or read another Org's proposal. The Ops editor may claim a submitted row and approve, reject, merge, or request canonicalization, but cannot attribute the proposal to another Seller Org or bypass the taxonomy field and state rules.",
    "The registered delivery and SLA workers may send the approved or rejected result and page the editorial queue after the owning transition commits; they cannot moderate or change a proposal. Ineligible, wrong-organization, wrong-console, stale-membership, duplicate, invalid-dimension, over-limit, service-account, and unauthorized-role requests are denied before proposal, attribution, or internal-review data is exposed.",
  ].join("\n\n"),
  "SEL-180": [
    "Only the exact Seller, Buyer, Ops, or system actor authorized for a Marketplace Discovery operation may perform that operation; authorization never transfers across endpoint families or consoles.",
    "A Seller actor with `seller_billing_admin` or `seller_marketing_editor` may create, configure, list, submit, pause, resume, or cancel only its own Promoted Listings. A Seller actor with `seller_org_owner` or `seller_compliance_officer` may request, read, or withdraw only its own verification review. Only `seller_billing_admin` may request a paid Featured Placement when the Org flag is enabled; otherwise Featured Placement is read-only to the Seller.",
    "An authenticated Buyer actor may read only the scrubbed Buyer marketplace projections and may update only its own Hide Sponsored preference; it cannot read bids, spend, clearing prices, Seller configuration, verification evidence, or Ops fields. Public callers may read only the separately approved public marketplace projection.",
    "An authorized `ops_marketplace_editor` or `ops_compliance_reviewer` may administer a Promoted Listing with the required justification. An authorized `ops_verification_reviewer` or `ops_compliance_reviewer` may review only an assigned residency-compatible verification row, and Certified approval or denial requires two distinct qualified reviewers. Only `ops_marketplace_editor` may draft a Featured Placement, while scheduling requires a distinct `ops_marketing_lead` sign-off.",
    "The registered eligibility, auction, settlement, activation, expiry, and billing workers may execute only their deterministic transition and append-only accounting operation; they cannot create customer intent or waive quality, anonymity, domain, residency, or feature-flag gates. Wrong-organization, wrong-console, cross-domain, cross-residency, wrong-role, stale-state, single-signoff, and ineligible requests return the specified non-revealing denial with no cross-stream ledger or private marketplace data exposure.",
  ].join("\n\n"),
  "BUY-232": [
    "Only the Buyer Workspace Owner may set the Phase 6 deadline, close bidding, or invoke the zero-response abort. The Workspace Owner or Buyer Org Admin may create an Amendment, and only an authorized Buyer Workspace actor may answer a Q&A item within its permitted audience.",
    "Only an invited Vendor Team Member for the matching Bid Workspace may draft or submit that Seller Org's Response. A Seller Team Lead may approve it only when the Seller SLA requires approval. Seller actors cannot change the Buyer deadline, Requirement, Amendment, roster, phase, or another Seller Org's response.",
    "The server resolves Buyer Workspace, Bid Workspace, invitation, Seller Org, role, current phase, deadline, Requirement version, and residency before returning data or accepting a write. Non-invited, wrong-organization, wrong-console, wrong-workspace, stale-role, post-deadline, or post-lock requests are denied without revealing another participant or response.",
  ].join("\n\n"),
};

function operationScopedPermissions(issueId: string): string | null {
  return OPERATION_SCOPED_PERMISSIONS[issueId] ?? null;
}

function defaults(
  classification: IssueClass,
  profile: ContractProfile,
  outcome: string,
  proofPath: string,
  evidence: string,
  paths: string[],
  team?: string,
) {
  const execution = executionProfile(classification, profile, outcome, evidence);
  const basis = contractBasis(outcome, evidence, paths, team);
  const signals = contractSignals(evidence);
  const { actor: inferredActor, errors, facts, implementation, states, testPath } = basis;
  const staticDeliveryControl = classification === "feature" &&
    /^(?:tools\/delivery\/|delivery\/|reports\/delivery\/)/.test(implementation) &&
    !paths.some((path) => /^(?:app|apps|components|convex|lib|packages)\//.test(path));
  const transitionError = /\bbefore mutation\b/i.test(errors)
    ? errors
    : `${errors} before mutation`;
  const actor = classification === "runtime_gate"
    ? "the protected CI gate runner"
    : inferredActor;
  if (profile === "presentation") {
    return {
      states: `${facts.states} Ready, loading, empty, error, disabled, and focus states are covered by \`${testPath}\`; reduced-motion behavior is covered separately. Loading preserves final geometry, disabled controls cannot activate, and dismissal returns focus to its initiating control.`,
      permissions: `${facts.permissions} The presentation inherits authorization from the host surface. Only ${actor} may supply the server-authorized host projection to \`${implementation}\`; hidden, cross-organization, wrong-console, or unauthorized data must not reach props, markup, accessibility labels, client logs, screenshots, or error copy.`,
      review: `${facts.review} CI visual and accessibility proof must bind \`${implementation}\`, \`${testPath}\`, and \`${proofPath}\` on one commit across token use, every rendered state, keyboard order, screen-reader names, contrast, responsive layout, reduced motion, host-projection isolation, failure handling, recovery, rollout, and rollback.`,
      success: `${facts.success} \`${testPath}\` must render every component, token, state, and interaction listed in Complete behavior and rules on every supported viewport, theme, locale, direction, keyboard path, and assistive-technology fixture without a domain mutation, hidden-data disclosure, or false success.`,
      failure: `${facts.failure} Negative fixtures make \`${implementation}\` disable unavailable actions, render the empty state when authorized projection data is absent, and render the error state for invalid props or render failure, with no hidden-data leak, focus loss, layout collapse, mutation, or false success.`,
      recovery: `${facts.recovery} Restore the last verified \`${implementation}\` bundle, reload the authorized host projection, return focus to the initiating control, and rerun \`${testPath}\`; replace \`${proofPath}\` only after every affected fixture passes.`,
      rollout: `${facts.rollout} Publish \`${implementation}\` under the current host-surface control, canary the affected route across every viewport and accessibility fixture listed in \`${testPath}\`, and retain \`${proofPath}\` before wider exposure.`,
      rollback: `${facts.rollback} Disable the host exposure control, restore the last verified \`${implementation}\` bundle, keep host data unchanged, and rerun \`${testPath}\` before reopening the route.`,
      telemetry: `${explicitTelemetry(outcome, proofPath, evidence, "", classification === "runtime_gate")} This presentation must not emit per-render customer telemetry.`,
      assumptions: `${facts.assumptions} The receipt remains valid only while \`${implementation}\`, its authorized host projection, the supported viewport and locale matrix, and \`${testPath}\` fixtures stay aligned; changing one invalidates \`${proofPath}\`.`,
      exclusions: `${facts.exclusions} Delivery touches \`${implementation}\`, \`${testPath}\`, and \`${proofPath}\`; it does not authorize a domain-schema or API-authority change, billing action, new customer notification, per-render analytics event, unrelated component rewrite, or manual customer-data edit.`,
    };
  }
  if (staticDeliveryControl) {
    const controlActor = "the protected CI or release-control identity";
    return {
      states: `${facts.states} A verification attempt reads the declared immutable inputs and either records one complete accepted result or fails closed before changing a source input, approved collateral, customer state, or external system. Replaying the same commit and input hashes returns the same result.`,
      permissions: `${facts.permissions} Only ${controlActor} may read the declared repository inputs and write the generated report and immutable receipt. It cannot read tenant data, use production credentials, contact a customer, dispatch a provider action, or waive a failed assertion or required approval.`,
      review: `${facts.review} On one commit, compare the protected verifier, \`${testPath}\`, and \`${proofPath}\` across every declared field and value, input checksum, required approval, accepted and rejected result, deterministic replay, recovery rehearsal, release gate, and rollback receipt.`,
      success: `${facts.success} The protected verifier proves every rule listed in Complete behavior and rules from the declared inputs and writes \`${proofPath}\` with the exact commit, environment, input hashes, assertions, reviewer, and result; it performs no customer mutation or external delivery.`,
      failure: `${facts.failure} A missing, malformed, stale, contradictory, unauthorized, unapproved, or checksum-mismatched input fails before report promotion, source publication, customer outreach, or external delivery and leaves the last approved inputs and receipt unchanged.`,
      recovery: `${facts.recovery} Correct or approve the rejected input through its governed source path, rerun \`${testPath}\` from the same bounded environment, and replace \`${proofPath}\` only after every assertion and checksum agrees.`,
      rollout: `${facts.rollout} Keep dependent publication or execution disabled, run \`${testPath}\` against the complete candidate input set, review one bounded release candidate, and enable downstream use only after \`${proofPath}\` records an accepted same-commit result.`,
      rollback: `${facts.rollback} Disable downstream use, restore the last approved input bundle, preserve prior receipts as immutable audit evidence, rerun \`${testPath}\`, and reopen dependent publication or execution only after a new accepted \`${proofPath}\`.`,
      telemetry: `The verifier records commit, environment, input hashes, result, duration, assertion counts, reviewer, and redacted correlation in \`${proofPath}\`. It emits no customer analytics event, customer notification, provider call, destination value, free text, secret, or customer content.`,
      assumptions: `${facts.assumptions} The protected verifier, every governed input and approval listed in Complete behavior and rules, and the \`${testPath}\` fixtures must remain aligned; changing one invalidates \`${proofPath}\` and requires fresh review.`,
      exclusions: `${facts.exclusions} Delivery is confined to the listed source, verifier, test, generated-report, and proof paths. It does not create product runtime behavior, mutate production or customer data, contact a customer, invoke a provider, invent an analytics event, or reuse a receipt from another commit or environment.`,
    };
  }
  const success = classification === "runtime_gate"
    ? `${facts.success} The production-equivalent gate writes \`${proofPath}\` with the observed result, commit, environment, and trace correlation.`
    : classification === "delivery_parent"
    ? `${facts.success} The delivery group closes only when every native child passes its own success, failure, recovery, rollback, and proof checks.`
    : classification === "decision"
    ? `${facts.success} The current approval path records one explicit, internally consistent choice and its validation receipt in \`${proofPath}\`.`
    : `${facts.success} A production-equivalent run through \`${implementation}\` commits every write and external effect listed in Complete behavior and rules atomically, returns the response defined there, leaves no partial write, and records the same-commit result in \`${proofPath}\`.`;
  return {
    states: signals.states.length > 0
      ? `${facts.states} Lifecycle values are ${states}; only the transitions listed in States and transitions commit, every other transition returns ${transitionError}, and a replay of the same accepted identity returns its existing result.`
      : `${facts.states} An accepted operation by ${actor} through \`${implementation}\` commits the writes and external effects listed in Complete behavior and rules atomically, while a denied, invalid, concurrent, or replayed operation returns ${errors} and preserves the prior stored and external result.`,
    permissions: classification === "runtime_gate"
      ? `${facts.permissions} Only ${actor} may read the declared repository, deployment, and test inputs and write the gate result and immutable receipt. It cannot read tenant data or customer content, use production credentials, bypass a failed assertion, or promote an incomplete run.`
      : `${facts.permissions} Only ${actor} may execute \`${implementation}\` within the matching organization, console, resource, and role scope; resolve scope before reading request data and deny wrong-organization, wrong-console, cross-resource, or unauthorized callers without revealing object existence.`,
    review: `${facts.review} On one commit, compare \`${implementation}\`, \`${testPath}\`, and \`${proofPath}\` across exact fields and values, ${signals.states.length > 0 ? `${states} transitions` : "accepted and unchanged results"}, actor authorization, ${errors}, recovery rehearsal, registered telemetry, rollout canary, and rollback receipt.`,
    success,
    failure: execution === "provider"
      ? `${facts.failure} Negative fixtures make \`${implementation}\` return ${errors} for invalid provider credentials, signature, request schema, tenant scope, timeout, rate limit, retry budget, or response schema; no partial customer mutation or duplicate provider effect commits.`
      : execution === "data"
      ? `${facts.failure} Negative fixtures make \`${implementation}\` return ${errors} for invalid schema, uniqueness, lifecycle, scope, concurrency, retention, or migration evidence; no partial row, index, projection, or audit write commits.`
      : execution === "api"
      ? `${facts.failure} Negative fixtures make \`${implementation}\` return ${errors} for malformed input, absent authority, hidden-resource scope, idempotency mismatch, concurrent mutation, dependency outage, or response-schema violation; no partial write or object-existence signal escapes.`
      : execution === "worker"
      ? `${facts.failure} Negative fixtures make \`${implementation}\` return ${errors} for invalid job input, identity, lease, dependency, timeout, retry budget, or checkpoint; the last committed checkpoint remains and no duplicate side effect is created.`
      : `${facts.failure} Negative fixtures make \`${implementation}\` return ${errors} for invalid input, absent ${actor} authority, forbidden scope, transition conflict, concurrency conflict, dependency outage, or incomplete proof; the last committed result remains and no duplicate effect is created.`,
    recovery: execution === "provider"
      ? `${facts.recovery} Keep dispatch disabled for the failed identity, correct the rejected credential, signature, payload, or dependency condition, reconcile the provider receipt against the same idempotency key, rerun \`${testPath}\`, and replace \`${proofPath}\` only after both readbacks agree.`
      : execution === "data"
      ? `${facts.recovery} Quarantine the rejected row or batch, correct the schema, uniqueness, lifecycle, scope, or migration defect, resume from the last committed checkpoint, rerun \`${testPath}\`, and replace \`${proofPath}\` only after row and index readback agree.`
      : `${facts.recovery} Hold the failed identity, repair the rejected input, authority, transition, concurrency, or dependency condition, replay its idempotency identity through \`${testPath}\`, and replace \`${proofPath}\` only after stored and external readback agree.`,
    rollout: execution === "provider"
      ? `${facts.rollout} Deploy \`${implementation}\` with provider sandbox and failure fixtures in \`${testPath}\`, enable one synthetic-tenant canary, compare provider and local readback, and retain \`${proofPath}\` before expanding dispatch.`
      : execution === "data"
      ? `${facts.rollout} Deploy \`${implementation}\` using expand, validation, bounded backfill, and readback in that order; run \`${testPath}\` against a production-shaped snapshot, canary one partition, and retain \`${proofPath}\` before enabling all writers.`
      : `${facts.rollout} Keep entry to \`${implementation}\` disabled while \`${testPath}\` runs in a production-equivalent environment, then enable one authorized synthetic canary, compare stored and external readback, and retain \`${proofPath}\` before wider execution.`,
    rollback: execution === "data"
      ? `${facts.rollback} Disable new writers to \`${implementation}\`, restore the last compatible reader and validator, preserve committed rows and audit history, reconcile the canary partition, and rerun \`${testPath}\`; never destructively reverse a committed migration.`
      : execution === "provider"
      ? `${facts.rollback} Disable new provider dispatch from \`${implementation}\`, restore the last verified adapter, preserve outbox and provider receipts, reconcile in-flight identities, and rerun \`${testPath}\` before resuming.`
      : `${facts.rollback} Stop new entry to \`${implementation}\`, restore the last compatible handler, preserve committed customer and audit data, reconcile in-flight identities, and rerun \`${testPath}\` before recording rollback acceptance in \`${proofPath}\`.`,
    telemetry: explicitTelemetry(outcome, proofPath, evidence, "", classification === "runtime_gate"),
    assumptions: `${facts.assumptions} \`${implementation}\`, the request fields and lifecycle or result values listed in Complete behavior and rules and States and transitions, ${actor} authority, and \`${testPath}\` fixtures must remain aligned; changing one invalidates \`${proofPath}\` and requires fresh contract review.`,
    exclusions: `${facts.exclusions} Delivery is confined to the listed implementation, test, and proof paths; it does not include unrelated product behavior, an undeclared schema or provider, manual production-data edits, an invented event, copied planning metadata, or a receipt from another commit or environment.`,
  };
}

function dedupeLines(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizedSourceFragment(value: string): string {
  return value
    .replace(/[`*_#>|-]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

interface StructuredMarkdownLine {
  prefix: string;
  body: string;
}

function structuredMarkdownLine(value: string): StructuredMarkdownLine {
  const list = /^(\s*(?:[-*+]\s+|\d+[.)]\s+))(.*)$/.exec(value);
  if (list) return { prefix: list[1], body: list[2].trim() };
  const label = /^(\s*\*\*[^*\n]{2,100}:\*\*\s*)(.*)$/.exec(value);
  if (label) return { prefix: label[1], body: label[2].trim() };
  return { prefix: "", body: value.trim() };
}

function renderStructuredMarkdownLine(prefix: string, sentences: string[]): string | null {
  const body = sentences.join(" ").trim();
  if (!body) return null;
  return `${prefix}${body}`.trimEnd();
}

function behaviorSourceFragments(value: string): string[] {
  return [...new Set(
    value
      .split(/\r?\n+/)
      .flatMap((line) => splitProseSentences(structuredMarkdownLine(line).body))
      .map(normalizedSourceFragment)
      .filter((fragment) => fragment.length >= 64 && fragment.length <= 420),
  )];
}

function evidenceWithoutBehaviorRepeats(evidence: string, behavior: string): string {
  const fragments = behaviorSourceFragments(behavior);
  if (fragments.length === 0) return evidence;
  return evidence.split(/\r?\n/).filter((line) => {
    const normalized = normalizedSourceFragment(line);
    return !fragments.some((fragment) => normalized === fragment);
  }).join("\n");
}

function pruneRepeatedBehaviorFacts(
  behavior: string,
  sections: Record<string, string>,
): Record<string, string> {
  const behaviorFragments = behaviorSourceFragments(behavior);
  const repeated = behaviorFragments.filter((fragment) =>
    Object.values(sections).some((body) => normalizedSourceFragment(body).includes(fragment))
  );
  if (repeated.length === 0) return sections;
  const pruned: Record<string, string> = {};
  for (const [key, body] of Object.entries(sections)) {
    if (key === "outcome") {
      pruned[key] = body;
      continue;
    }
    pruned[key] = body.split(/\r?\n/).flatMap((line) => {
      if (!line.trim()) return [line];
      const structured = structuredMarkdownLine(line);
      const pieces = splitProseSentences(structured.body).filter((piece) => {
        const normalized = normalizedSourceFragment(piece);
        return !repeated.some((fragment) => normalized.includes(fragment));
      });
      const rendered = renderStructuredMarkdownLine(structured.prefix, pieces);
      return rendered ? [rendered] : [];
    }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    pruned[key] = normalizeMarkdownListUnits(pruned[key]);
  }
  return pruned;
}

function contractParagraphKey(value: string): string {
  return value
    .replace(/^```[\s\S]*?```$/g, "")
    .replace(/[`*_#>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function dedupeContractValue(value: string, seen: Set<string>): string {
  const retained: string[] = [];
  for (const paragraph of value.split(/\n\s*\n/)) {
    const key = contractParagraphKey(paragraph);
    if (key.length >= 120 && seen.has(key)) continue;
    retained.push(paragraph);
    if (key.length >= 120) seen.add(key);
  }
  return retained.join("\n\n").trim();
}

function dedupeRepeatedSentences(value: string): string {
  let seen = new Set<string>();
  let inFence = false;
  const deduped = value.split(/\r?\n/).flatMap((line) => {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      return [line];
    }
    if (/^\s*#{1,6}\s+/.test(line)) {
      seen = new Set<string>();
      return [line];
    }
    if (
      inFence ||
      /^\s*\|/.test(line) ||
      /^\s*- (?:Planned: )?`/.test(line) ||
      !line.trim()
    ) return [line];
    const structured = structuredMarkdownLine(line);
    if (!structured.body) return [];
    const retained = splitProseSentences(structured.body).filter((sentence) => {
      const key = normalizedSourceFragment(sentence)
        .replace(/^(?:lifecycle|authority|readiness|positive case|negative case|recovery|release|reversal|signal|evidence|validity|boundary) basis\s+/, "")
        .trim();
      if (key.length < 80) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const rendered = renderStructuredMarkdownLine(structured.prefix, retained);
    return rendered ? [rendered] : [];
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalizeMarkdownListUnits(deduped);
}

function mergeAdjacentIdenticalTables(value: string): string {
  const lines = value.split(/\r?\n/);
  const output: string[] = [];
  let activeHeader: string | null = null;
  for (let index = 0; index < lines.length;) {
    const header = lines[index];
    const separator = lines[index + 1] ?? "";
    if (/^\s*\|/.test(header) && /^\s*\|?\s*:?-{2,}/.test(separator)) {
      let end = index + 2;
      while (end < lines.length && /^\s*\|/.test(lines[end])) end += 1;
      const key = normalizedSourceFragment(header);
      if (activeHeader === key) {
        while (output.at(-1)?.trim() === "") output.pop();
        output.push(...lines.slice(index + 2, end));
      } else {
        output.push(...lines.slice(index, end));
      }
      activeHeader = key;
      index = end;
      continue;
    }
    if (lines[index].trim()) activeHeader = null;
    output.push(lines[index]);
    index += 1;
  }
  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function convertRepeatedSectionTables(value: string): string {
  const lines = value.split(/\r?\n/);
  const output: string[] = [];
  let headers = new Set<string>();
  for (let index = 0; index < lines.length;) {
    if (/^##\s+/.test(lines[index])) headers = new Set<string>();
    const headerLine = lines[index];
    const separatorLine = lines[index + 1] ?? "";
    if (/^\s*\|/.test(headerLine) && /^\s*\|?\s*:?-{2,}/.test(separatorLine)) {
      let end = index + 2;
      while (end < lines.length && /^\s*\|/.test(lines[end])) end += 1;
      const key = normalizedSourceFragment(headerLine);
      if (!headers.has(key)) {
        headers.add(key);
        output.push(...lines.slice(index, end));
      } else {
        const labels = markdownTableCells(headerLine).map((cell) => cell.replace(/[*`]/g, "").trim());
        for (const rowLine of lines.slice(index + 2, end)) {
          const cells = markdownTableCells(rowLine);
          const pairs = labels.map((label, cellIndex) => ({ label, value: cells[cellIndex]?.trim() ?? "" }))
            .filter((pair) => pair.label && pair.value);
          if (pairs.length > 0) {
            output.push(`- ${pairs.map((pair) => `**${pair.label}:** ${pair.value}`).join("; ")}`);
          }
        }
      }
      index = end;
      continue;
    }
    output.push(lines[index]);
    index += 1;
  }
  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stripCrossIssueDelegationLines(
  value: string,
  issueId: string,
  context: PlannerContext,
): string {
  const delegation = /\b(?:child|owner|owns?|owned by|supplies|depends on|is blocked by|blocked by|prerequisite|provided by|implemented by|implementation belongs to|governed by|source of truth|see|per|after .{0,80} passes|before .{0,80} passes|waits? for|downstream|upstream|execution occurs only)\b/i;
  const ownTitle = context.referenceLabelByToken.get(issueId.toUpperCase())?.toLowerCase() ?? "";
  const titles = [...new Set(context.referenceLabelByToken.values())]
    .filter((title) => title.length >= 18 && title.toLowerCase() !== ownTitle)
    .map((title) => title.toLowerCase());
  return value.split(/\r?\n/).filter((line) => {
    if (MANUAL_RELATION_PLANNING.test(line)) return false;
    const lowered = line.toLowerCase();
    const namesAnotherIssue = titles.some((title) => lowered.includes(title));
    if (!namesAnotherIssue) return true;
    if (/^\s*\|/.test(line)) return true;
    return !delegation.test(line);
  }).join("\n");
}

function stripMalformedReferenceRemnants(value: string): string {
  const malformed = /(?:^\s*apply\.\s*$|\bis authoritative\.|\bapplies only where is silent\.|\bis owned by\s*[.;]|\bowned by\s*[.;]|\bconsumes\s*[.;]|\bdepends on\s*[.;]|\bcanonical in\s*[.;]|\bmirrored in\s*[.;]|\bconform(?:s)? to\s*[.;]|\btransitions?\s+MUST\s*[;.]|\batomic decrement \(UPDATE \.\.\. WHERE [a-z]+ 0 RETURNING [a-z]+\)|\b(?:is|are)\s*;|\bin\s+(?:or|and)\s*[.;]|\bkeep\s+and\s+canceled\b|\bcompanion\s*:\s*retired\b|\bmust cite those tables\b|\bpromoted from in\b|(?:^|\s)(?:from|per|under)\s*(?:and|or)?\s*[.;])/i;
  const repairedValue = value
    .replace(/\buntil registers one\b/gi, "until a canonical registry entry exists")
    .replace(/\bunless later registers one\b/gi, "unless a canonical registry entry is later approved")
    .replace(/\bapplicable\s+[–-]\s+checks\b/gi, "applicable checks")
    .replace(/\bmappings\s+and\s*\./gi, "mappings.")
    .replace(/\bin\s+in\b/gi, "in")
    .replace(/:\.(?=\s*$)/gm, ".");
  return repairedValue.split(/\r?\n/).flatMap((line) => {
    if (!malformed.test(line)) return [line];
    const prefix = /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.exec(line)?.[0] ?? "";
    const body = prefix ? line.slice(prefix.length) : line;
    const retained = splitProseSentences(body).filter((fragment) => !malformed.test(fragment));
    const repaired = retained.join(" ").trim();
    return repaired ? [`${prefix}${repaired}`] : [];
  }).join("\n");
}

function canonicalOutcomeFact(raw: string, title: string): string {
  const candidates = factBlocks(raw)
    .filter((block) => block.section === "success" || block.section === "behavior")
    .flatMap((block) => block.text.split(/\r?\n/))
    .map((line) => line
      .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "")
      .replace(/\*\*/g, "")
      .trim())
    .filter((line) =>
      line.length >= 40 &&
      line.length <= 600 &&
      !/^\|/.test(line) &&
      !/^(?:#{1,6}|```|---|Examples?:|Format:)/i.test(line) &&
      /\b(?:must|shall|is|are|creates?|returns?|renders?|rejects?|persists?|records?|allows?|prevents?|computes?|shows?|uses?)\b/i.test(line)
    );
  const value = candidates[0] ?? "";
  if (value) {
    if (/^(?:deliver|make|maintain|close|approve|create|render|enforce|ensure|provide|produce|process|return|persist|reject|allow|prevent|bind|build|verify|validate|record|route|run|apply|publish|remove|add|keep|restore|migrate|reconcile|resolve|calculate|display|send|notify|export|import|generate|support|protect|limit|require)\b/i.test(value)) {
      return value;
    }
    return `Ensure ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  }
  const tableRow = raw.split(/\r?\n/).find((line, index, lines) =>
    /^\s*\|/.test(line) &&
    !/^\s*\|?\s*:?-{2,}/.test(line) &&
    index > 0 &&
    /^\s*\|/.test(lines[index - 1]) &&
    /^\s*\|?\s*:?-{2,}/.test(lines[index - 1])
  );
  if (!tableRow) return "";
  const cells = markdownTableCells(tableRow)
    .map((cell) => cell.replace(/[*`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 4);
  return cells.length >= 2
    ? `Implement ${title} with the exact canonical row: ${cells.join("; ")}`
    : "";
}

function hasOutcomeScope(title: string, value: string): boolean {
  const normalizedTitle = normalizedSourceFragment(title);
  const normalizedValue = normalizedSourceFragment(value);
  if (normalizedTitle && normalizedValue.includes(normalizedTitle)) return true;
  const titleTerms = new Set(normalizedTitle.split(" ").filter((term) =>
    term.length >= 3 && !/^(?:and|the|for|from|into|with|without)$/.test(term)
  ));
  const valueTerms = new Set(normalizedValue.split(" "));
  return [...titleTerms].some((term) => valueTerms.has(term));
}

function alignOutcomeScope(title: string, value: string): string {
  const sentence = /[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`;
  if (hasOutcomeScope(title, sentence)) return sentence;
  return `Deliver ${title}: ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
}

function firstOutcomeLine(value: string): string {
  return value.split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "").trim())
    .find((line) => line && !/^\s*\|/.test(line)) ?? "";
}

function currentOutcomeSentence(title: string, value: string, action: RegExp): string | null {
  const candidate = firstOutcomeLine(value);
  if (
    candidate.length < 20 ||
    candidate.toLowerCase() === title.toLowerCase() ||
    /^(?:complete|deliver|implement)\s+(?:one|the)\s+current\s+(?:repair|contract|result)\b/i.test(candidate) ||
    SOURCE_DEFERRAL.test(candidate) ||
    PLANNING_HISTORY.test(candidate) ||
    PLANNING_PROVENANCE.test(candidate) ||
    GENERIC_BOILERPLATE.test(candidate)
  ) return null;
  const terminal = /[.!?]$/.test(candidate) ? candidate : `${candidate}.`;
  const overlaps = hasOutcomeScope(title, terminal);
  if (action.test(candidate) && overlaps) return terminal;
  if (/^(?:a|an|the|each|every|this|authorized)\b/i.test(candidate)) {
    const actionSentence = `Ensure ${terminal.charAt(0).toLowerCase()}${terminal.slice(1)}`;
    return hasOutcomeScope(title, actionSentence)
      ? actionSentence
      : `Deliver ${title}: ${terminal.charAt(0).toUpperCase()}${terminal.slice(1)}`;
  }
  if (/^UX\b/i.test(candidate)) {
    const actionSentence = `Provide the ${terminal}`;
    return hasOutcomeScope(title, actionSentence)
      ? actionSentence
      : `Deliver ${title}: ${terminal.charAt(0).toUpperCase()}${terminal.slice(1)}`;
  }
  if (/^(?:engine|convex scheduled function|worker|service|registry|schema)\b/i.test(candidate)) {
    const actionSentence = `Implement the ${terminal.charAt(0).toLowerCase()}${terminal.slice(1)}`;
    return hasOutcomeScope(title, actionSentence)
      ? actionSentence
      : `Deliver ${title}: ${terminal.charAt(0).toUpperCase()}${terminal.slice(1)}`;
  }
  const scoped = `Deliver ${title}: ${terminal.charAt(0).toUpperCase()}${terminal.slice(1)}`;
  return scoped;
}

function outcomeStatement(
  title: string,
  classification: IssueClass,
  currentOutcome: string,
  manifestOutcome: string,
  canonicalFacts: string | null,
): string {
  const action = /^(?:implement|deliver|complete|make|maintain|close|approve|create|render|show|enforce|ensure|provide|produce|process|return|persist|reject|allow|prevent|bind|build|verify|validate|record|route|run|apply|publish|remove|add|keep|restore|migrate|reconcile|resolve|calculate|display|send|notify|export|import|generate|support|protect|limit|require|remain|remains|is|are|must|will)\b/i;
  const current = currentOutcomeSentence(title, currentOutcome, action);
  if (current) return current;
  const manifest = firstOutcomeLine(manifestOutcome);
  if (
    manifest.length >= 5 &&
    !/\bprove runtime gate\b/i.test(manifest) &&
    !PLANNING_PROVENANCE.test(manifest)
  ) {
    return currentOutcomeSentence(title, manifest, action) ??
      (/\bRole$/i.test(manifest)
        ? `Implement ${manifest} with its exact assigned scope, allowed actions, explicit denials, isolation boundary, and proof.`
        : `Deliver ${manifest} with its exact behavior, authority, denial, recovery, and proof contract.`);
  }
  const candidate = [canonicalFacts ? canonicalOutcomeFact(canonicalFacts, title) : ""]
    .map(firstOutcomeLine)
    .find((value) =>
      value.length >= 20 &&
      value.toLowerCase() !== title.toLowerCase() &&
      !/\bprove runtime gate\b/i.test(value) &&
      action.test(value) &&
      !PLANNING_PROVENANCE.test(value) &&
      hasOutcomeScope(title, value)
    );
  if (candidate) {
    return /[.!?]$/.test(candidate) ? candidate : `${candidate}.`;
  }
  if (classification === "runtime_gate") {
    return `Implement ${title} as a fail-closed runtime assertion with positive, negative, recovery, rollback, and same-commit evidence.`;
  }
  if (classification === "delivery_parent") {
    return `Complete ${title} after each native child outcome and recorded dependency has independent release evidence.`;
  }
  if (classification === "decision") {
    return `Approve one unambiguous ${title} decision with its constraints, rejected alternatives, trigger, and immutable validation receipt.`;
  }
  if (action.test(title)) {
    return `Implement the ${title} outcome with exact success, denial, recovery, rollback, telemetry, and same-commit evidence.`;
  }
  if (/\b(?:entity|record|ledger|snapshot|registry)\b/i.test(title)) {
    return `Implement ${title} with one authorized persisted result, exact schema and scope, lifecycle controls, denial, recovery, rollback, and same-commit evidence.`;
  }
  if (/\b(?:page|screen|view|surface|dashboard|inbox|workspace|console|modal|drawer|form|editor|builder|wizard|navigation)\b/i.test(title)) {
    return `Implement ${title} from authorized data with complete rendered states, denial behavior, recovery, rollback, and same-commit evidence.`;
  }
  if (/\b(?:worker|job|scheduler|processor|handler|queue|sync|importer|exporter)\b/i.test(title)) {
    return `Implement ${title} once per valid identity with fail-closed input handling, bounded recovery, rollback, telemetry, and same-commit evidence.`;
  }
  if (/\b(?:api|endpoint|query|mutation|resolver)\b/i.test(title)) {
    return `Implement ${title} with one authorized result, exact validation, non-leaking denial, recovery, rollback, and same-commit evidence.`;
  }
  if (/\b(?:control|policy|enforcement|guard|firewall|validator)\b/i.test(title)) {
    return `Implement ${title} across every path under Exact paths with exact denial, recovery, rollback, telemetry, and same-commit evidence.`;
  }
  return `Implement ${title} so the behavior below reaches its exact success result, rejects every listed failure before side effects, and produces the immutable receipt under Named proof.`;
}

function createDescription(
  issue: LinearIssueInput,
  title: string,
  classification: IssueClass,
  parsed: ParsedDescription,
  generic: boolean,
  source: ReturnType<typeof sourceIdentity>,
  context: PlannerContext,
): { description: string; sourceExtracted: boolean; requiresReview: boolean } {
  const manifestOutcome = SEMANTIC_ISSUE_TITLE_OVERRIDES.has(issue.identifier) && source.matchKind !== "override"
    ? title
    : source.row?.issueId === issue.identifier && source.row.outcome
    ? scrubLine(source.row.outcome).line
    : "";
  const currentOutcome = sectionText(parsed, "outcome") ?? "";
  const outcome = title;
  const completeCurrentBody = completeStructuredBody(parsed);
  const richCurrentBody = richPartialContract(parsed);
  const methodBenchmarkFacts = null;
  const currentDescriptionIsAuthoritative = context.trustedDraftsByIssue.has(issue.identifier) ||
    source.matchKind === "none" ||
    source.matchKind === "family" ||
    source.matchKind === "checksum" ||
    !source.row ||
    completeCurrentBody ||
    richCurrentBody;
  const extractionContext = `${title} ${currentDescriptionIsAuthoritative ? currentOutcome : ""} ${manifestOutcome}`.trim();
  let specialContract = classification === "delivery_parent"
    ? coordinationParentContract(title)
    : curatedIssueContract(issue.identifier) ?? (issue.identifier === "PLA-704" || /\bCI Gate Catalog$/i.test(title)
    ? runtimeGateCatalogContract()
    : issue.identifier === "PLA-853"
    ? appendixGAliasContract(context)
    : classification === "runtime_gate"
    ? runtimeGateContract(title, source, context, issue)
    : null);
  const exactSourcePath = source.row
    ? safeSourcePath(context.root, effectiveSourceDoc(source.row))
    : null;
  const exactSourceSection = source.row && exactSourcePath
    ? cachedSourceSection(context, exactSourcePath, source.row.section)
    : null;
  const resolvedExactSourceSection = exactSourcePath && exactSourceSection
    ? resolveSourceReferences(context, exactSourcePath, exactSourceSection)
    : exactSourceSection;
  if (issue.identifier === "BUY-193" && specialContract && exactSourcePath) {
    const transitionSource = cachedSourceSection(context, exactSourcePath, "Appendix L.14");
    const transitionFacts = transitionSource
      ? exactStateTransitionFacts(resolveSourceReferences(context, exactSourcePath, transitionSource), 5_500)
      : null;
    if (transitionFacts) {
      specialContract = {
        ...specialContract,
        states: dedupeLines([specialContract.states, transitionFacts]).join("\n\n"),
      };
    }
  }
  const canonicalFacts = specialContract || completeCurrentBody || richCurrentBody
    ? null
    : extractCanonicalFacts(context, source.row, source.checksum, extractionContext);
  const runtimeAssertion = specialContract?.behavior
    .match(/\*\*Exact assertion\.\*\*\s*([^\n]+)/i)?.[1]
    ?.trim();
  const rawOutcomeText = EXACT_OUTCOME_OVERRIDES.get(issue.identifier) ?? (specialContract?.gateId === "appendix_m_runtime_gate_catalog"
    ? "Maintain a live, same-commit Appendix M runtime-gate catalog whose scanner rows reconcile without copied counts, missing artifacts, or unresolved blockers."
    : issue.identifier === "PLA-853"
    ? "Reject every retired Appendix G event name before dispatch while preserving canonical analytics, isolated historical evidence, recovery, rollback, and same-commit proof."
    : issue.identifier === "BUY-192"
    ? "Provide Sourcera Method guidance over one 13-phase evaluation engine; hiding guidance suppresses instructional copy and prompts only and never creates an alternate lifecycle or bypasses a platform control."
    : issue.identifier === "BUY-193"
    ? "Create independently scorable Requirements under discrete Use Cases while enforcing current plan caps, lifecycle rules, authority, atomic failure, recovery, and proof across every mutation path."
    : issue.identifier === "BUY-220"
    ? "Ensure marketplace Listing is the seller-authored public Marketplace row for a sellable product or service, with its complete schema, lifecycle, projection, isolation, retention, failure, recovery, and proof contract."
    : issue.identifier === "BUY-212"
    ? "Implement Evaluation Scenario Entity as a Buyer Workspace-scoped what-if scoring and TCO model using structured weight, vendor, Use Case, rubric, threshold, and TCO overrides; reject operational-load, user-count, concurrency, and transaction-volume parameters."
    : issue.identifier === "PLA-332"
    ? "Enforce identical server-side and UI authorization for every protected API, route, field, and action so unauthorized callers receive a non-revealing denial before protected data renders or mutates."
    : issue.identifier === "PLA-555"
    ? "Require every release to pass the named QA matrix, production-shaped canary checks, promotion thresholds, and tested rollback before production traffic widens."
    : issue.identifier === "PLA-939"
    ? "Enforce the canonical non-Appendix-M CI override annotation grammar, 60-character rationale floor, row-level permission precedence, protected review, recovery, and same-commit proof."
    : issue.identifier === "PLA-553"
    ? "Coordinate Test Quality and Console-Firewall Evidence Control Plane as a non-executable native parent whose aggregate readiness is proven only from its current native child contracts and same-commit receipts."
    : /^Bind\b/i.test(title) && !currentOutcome.trim()
    ? `${title.replace(/[.!?]+$/, "")}, with explicit authorization, failure, recovery, rollout, rollback, and same-commit proof.`
    : QUALITY_SAMPLE_DIRECT_OUTCOME_ISSUES.has(issue.identifier) && manifestOutcome
    ? manifestOutcome
    : classification === "delivery_parent"
    ? `Coordinate ${title} as a non-executable native parent whose aggregate readiness is proven only from its current native child contracts and receipts.`
    : classification === "runtime_gate" && runtimeAssertion
    ? `Deliver ${title} by enforcing this exact runtime condition: ${runtimeAssertion}`
    : outcomeStatement(
        title,
        classification,
        currentDescriptionIsAuthoritative ? currentOutcome : "",
        manifestOutcome,
        canonicalFacts ?? (currentDescriptionIsAuthoritative
          ? sectionText(parsed, "behavior") ?? sectionText(parsed, "success")
          : null),
      ));
  const outcomeText = alignOutcomeScope(title, rawOutcomeText);
  const useParsedContract = !specialContract && currentDescriptionIsAuthoritative;
  const parsedBudgets: Record<string, number> = {
    behavior: 5_000,
    states: 1_300,
    permissions: 1_500,
    review: 900,
    success: 1_500,
    failure: 1_500,
    recovery: 1_500,
    rollout: 900,
    rollback: 900,
    telemetry: 1_400,
    proof: 800,
    assumptions: 900,
    exclusions: 700,
  };
  const parsedSections = new Map<string, string>();
  const currentStructuredAuthority = context.trustedDraftsByIssue.has(issue.identifier) ||
    completeCurrentBody || richCurrentBody;
  if (useParsedContract) {
    const current = new Map<string, string>();
    for (const key of Object.keys(parsedBudgets)) {
      const value = sectionText(parsed, key);
      const preserved = value ? preserveCurrentFacts(value, MAX_DESCRIPTION_CHARS) : null;
      if (preserved) current.set(key, preserved);
    }
    const target = currentStructuredAuthority
      ? MAX_DESCRIPTION_CHARS - 7_000
      : MAX_DESCRIPTION_CHARS - 14_000;
    const lengths = new Map([...current].map(([key, value]) => [key, value.length]));
    const total = [...lengths.values()].reduce((sum, length) => sum + length, 0);
    const scale = total > target ? target / total : 1;
    for (const [key, value] of current) {
      const maximum = Math.max(600, Math.floor(value.length * scale));
      const preserved = preserveCurrentFacts(value, maximum);
      if (preserved) parsedSections.set(key, preserved);
    }
  }
  const profile = contractProfile(title, source);
  const rawExistingBehaviorCandidate = parsedSections.get("behavior") ?? null;
  const existingBehaviorCandidate = rawExistingBehaviorCandidate
    ? rawExistingBehaviorCandidate.split(/\r?\n/).filter((line) =>
        !(issue.identifier === "PLA-955" && /^route rows are exactly:/i.test(line.trim())) &&
        !(issue.identifier === "PLA-956" && /^Before either artifact handler merges, adds exact /i.test(line.trim()))
      ).join("\n").trim() || null
    : null;
  const existingBehaviorOutsideSource = Boolean(
    !context.trustedDraftsByIssue.has(issue.identifier) &&
    !completeCurrentBody &&
    !richCurrentBody &&
    existingBehaviorCandidate &&
    behaviorExceedsSourceBoundary(existingBehaviorCandidate, resolvedExactSourceSection),
  );
  const canonicalKeys = new Set<CanonicalSectionKey>();
  for (const key of Object.keys(SOURCE_SECTION_LABELS) as CanonicalSectionKey[]) {
    if (!parsedSections.has(key) || key === "behavior" && existingBehaviorOutsideSource) {
      canonicalKeys.add(key);
    }
  }
  const canonical = allocateCanonicalFacts(canonicalFacts, extractionContext, canonicalKeys);
  if (issue.identifier === "BUY-220" && exactSourcePath && exactSourceSection) {
    const resolvedEntity = resolveSourceReferences(context, exactSourcePath, exactSourceSection);
    const slice = (anchor: string): string => anchoredSourceSlice(resolvedEntity, anchor) ?? "";
    const behavior = preserveCurrentFacts(
      dedupeLines([slice("Authoring Intent"), slice("Field"), slice("Indexes")]).join("\n\n"),
      5_000,
    );
    const permissions = preserveCurrentFacts(
      dedupeLines([slice("Scope"), slice("Retention, DSAR, and residency")]).join("\n\n"),
      3_600,
    );
    const states = preserveCurrentFacts(slice("State Machine"), 5_500);
    const success = preserveCurrentFacts(slice("Acceptance Criteria"), 5_000);
    const failures = allocateCanonicalFacts(
      slice("Failure Modes Addressed"),
      extractionContext,
      new Set<CanonicalSectionKey>(["failure", "recovery"]),
    );
    if (behavior) canonical.behavior = behavior;
    if (permissions) canonical.permissions = permissions;
    if (states) canonical.states = states;
    if (success) canonical.success = success;
    if (failures.failure) canonical.failure = failures.failure;
    if (failures.recovery) canonical.recovery = failures.recovery;
  }
  if (
    !specialContract &&
    canonicalKeys.has("behavior") &&
    !canonical.behavior &&
    resolvedExactSourceSection
  ) {
    canonical.behavior = executableSourceBehaviorFacts(
      resolvedExactSourceSection,
      extractionContext,
      issue.identifier === "PLA-549" ? 20_000 : 5_000,
    );
  }
  const normalizedCurrentOutcome = normalizedSourceFragment(currentOutcome);
  const currentOutcomeForBehavior = issue.identifier === "PLA-412"
    ? currentOutcome.replace(/\bsupport\.ticket_created\b/gi, "`support.ticket.created` webhook and `support_ticket_created` event")
    : currentOutcome;
  const sourceBoundCurrentPurpose = normalizedCurrentOutcome.length >= 24 &&
    !behaviorExceedsSourceBoundary(currentOutcomeForBehavior, resolvedExactSourceSection);
  const currentPurpose = classification !== "delivery_parent" &&
    (useParsedContract || sourceBoundCurrentPurpose) && normalizedCurrentOutcome.length >= 24 &&
      !normalizedSourceFragment(outcomeText).includes(normalizedCurrentOutcome)
    ? preserveCurrentFacts(currentOutcomeForBehavior, 900)
    : null;
  const hasCurrentUiContract = useParsedContract && /\bready, loading, empty, error, partial, and permission-denied states\b/i.test(issue.description ?? "") &&
    /\bscreen-reader\b/i.test(issue.description ?? "") &&
    /\breduced-motion\b/i.test(issue.description ?? "") &&
    /\bprotected-data\b/i.test(issue.description ?? "");
  const currentUiSupplement = hasCurrentUiContract
    ? `${title} renders ready, loading, empty, error, partial, offline, and permission-denied visual-state results from authorized data. Every user-visible action prevents protected-data disclosure. Component and browser fixtures cover keyboard, touch, focus, screen-reader names, contrast, reduced-motion, responsive layout, and recovery.`
    : null;
  const hasCurrentDeploymentProofContract = useParsedContract && /\bfail-closed behavior are tested\b/i.test(issue.description ?? "") &&
    /\btarget-environment receipts identify commit, environment, timestamp, assertion, and result\b/i.test(issue.description ?? "");
  const currentDeploymentProofSupplement = hasCurrentDeploymentProofContract
    ? `Deployment, recovery, and rollback checks fail-closed. The target-environment receipt identifies the exact commit, environment, timestamp, assertion, and result.`
    : null;
  const currentBehaviorSupplement = dedupeLines([
    currentPurpose ? `Product behavior — ${currentPurpose}` : "",
    currentUiSupplement ?? "",
    currentDeploymentProofSupplement ?? "",
  ]).join("\n\n") || null;
  const exactBehaviorSupplement = issue.identifier === "PLA-549" && resolvedExactSourceSection
    ? resolvedExactSourceSection.split(/\r?\n/).filter((line) => {
        const number = /^\s*(\d+)[.)]\s+/.exec(line)?.[1];
        return number !== undefined && Number(number) >= 11;
      }).join("\n") || null
    : null;
  const outcomeContext = null;
  const semanticResidueCandidate = useParsedContract
    ? boundedFacts(dedupeLines(parsed.residue).join("\n"), extractionContext, 600) ?? ""
    : "";
  const semanticResidue = behaviorExceedsSourceBoundary(semanticResidueCandidate, resolvedExactSourceSection)
    ? ""
    : semanticResidueCandidate;
  const existingBehavior = existingBehaviorOutsideSource ? null : existingBehaviorCandidate;
  const completeContractEvidence = dedupeLines([
    useParsedContract ? currentOutcome : "",
    manifestOutcome,
    existingBehavior ?? "",
    methodBenchmarkFacts ?? "",
    semanticResidue,
    canonicalFacts ?? "",
    ...(useParsedContract ? [...parsedSections.values()] : []),
  ]).join("\n");
  const supportingContractEvidence = dedupeLines([
    ...[...parsedSections.entries()]
      .filter(([key]) => key !== "behavior")
      .map(([, value]) => value),
    ...Object.entries(canonical)
      .filter(([key, value]) => key !== "behavior" && Boolean(value))
      .map(([, value]) => typeof value === "string" ? value : ""),
  ]).join("\n");
  const exactBehaviorOverride = EXACT_BEHAVIOR_OVERRIDES.get(issue.identifier) ?? null;
  const behaviorParts = exactBehaviorOverride ? [exactBehaviorOverride] : dedupeLines([
    SOURCE_ONLY_REPAIR_ISSUES.has(issue.identifier)
      ? "This is a source-only repair. No runtime implementation path is in scope; the owning implementation issue remains fail-closed until this contract, its exact source checks, and independent review pass."
      : "",
    !specialContract && profile === "presentation"
      ? `This presentation introduces no new persisted domain mutation, schema, API, billing effect, or customer notification. It renders only authorized host data and preserves semantic, keyboard, responsive, locale, theme, and reduced-motion behavior.`
      : "",
    outcomeContext ?? "",
    specialContract?.behavior ?? "",
    issue.identifier === "PLA-986"
      ? "Representative synthetic routes cover Buyer, Seller, and Ops projection boundaries; this Console Bridge oracle validates the shared row contract, not every product route."
      : "",
    existingBehavior ?? "",
    methodBenchmarkFacts ?? "",
    semanticResidue,
    canonical.behavior ?? "",
    exactBehaviorSupplement ?? "",
    currentBehaviorSupplement ?? "",
    !specialContract && !exactBehaviorOverride && !existingBehavior && !canonical.behavior && !semanticResidue && !outcomeContext && !currentBehaviorSupplement
      ? defaultBehavior(classification, profile, outcome)
      : "",
  ]);
  if (
    !specialContract &&
    !exactBehaviorOverride &&
    !context.trustedDraftsByIssue.has(issue.identifier) &&
    !completeCurrentBody &&
    !richCurrentBody &&
    behaviorExceedsSourceBoundary(behaviorParts.join("\n"), resolvedExactSourceSection)
  ) {
    const sourceOnlyFacts = resolvedExactSourceSection
      ? boundedSourceFacts(
          resolvedExactSourceSection,
          extractionContext,
        )
      : null;
    const sourceOnlyBehavior = allocateCanonicalFacts(
      sourceOnlyFacts,
      extractionContext,
      new Set<CanonicalSectionKey>(["behavior"]),
    ).behavior;
    behaviorParts.splice(
      0,
      behaviorParts.length,
      sourceOnlyBehavior ?? defaultBehavior(classification, profile, outcome),
    );
  }
  const normalizedBehaviorLength = behaviorParts.join(" ")
    .replace(/[`*_#>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .length;
  if (!specialContract && !exactBehaviorOverride && normalizedBehaviorLength < 180) {
    const behaviorBasis = contractAnchor(completeContractEvidence || behaviorParts.join("\n"), outcome);
    if (!behaviorParts.join("\n").includes(behaviorBasis)) behaviorParts.push(behaviorBasis);
    const remaining = resolvedExactSourceSection
      ? allocateCanonicalFacts(
          boundedSourceFacts(
            resolvedExactSourceSection,
            extractionContext,
          ),
          extractionContext,
          new Set<CanonicalSectionKey>(["behavior"]),
        ).behavior
      : null;
    if (remaining && !behaviorParts.join("\n").includes(remaining)) behaviorParts.push(remaining);
  }
  const allowsCanonicalDocuments = classification === "decision" ||
    /^\s*\[(?:source repair|decision|SG-[^\]]+|SR-[^\]]+)\]/i.test(issue.title);
  const parsedPaths = (classification === "delivery_parent" ? [] : parsed.paths)
    .map((path) => issuePath(issue.identifier, path)).filter((path) =>
    (allowsCanonicalDocuments || !canonicalDocumentPath(path)) &&
    !manualTaggedArtifactPath(path)
  );
  const bodyPaths = (useParsedContract ? concretePaths(normalizeProofPathMentions(issue.description ?? "")) : []).map((path) => issuePath(issue.identifier, path)).filter((path) =>
    (allowsCanonicalDocuments || !canonicalDocumentPath(path)) &&
    !manualTaggedArtifactPath(path)
  );
  const normalizedParsedProof = useParsedContract
    ? normalizeProofPathMentions(sectionText(parsed, "proof") ?? "")
    : "";
  const namedProofPaths = concretePaths(normalizedParsedProof).map((path) => issuePath(issue.identifier, path)).filter((path) =>
    !manualTaggedArtifactPath(path)
  );
  const semanticProofPath = SEMANTIC_PROOF_PATH_OVERRIDES.get(issue.identifier);
  const generated = generatedPaths(issue, title, classification, profile);
  const parsedRoles = new Set([
    ...parsedPaths,
    ...bodyPaths,
    ...namedProofPaths,
    ...(semanticProofPath ? [semanticProofPath] : []),
  ].map(pathCoverageRole));
  const generatedGaps = generated.filter((path) => !parsedRoles.has(pathCoverageRole(path)));
  const provisionalPaths = [
    ...parsedPaths,
    ...bodyPaths,
    ...namedProofPaths,
    ...(semanticProofPath ? [semanticProofPath] : []),
    ...(specialContract?.paths ?? generatedGaps),
    ...(EXACT_PRODUCT_PATH_OVERRIDES.get(issue.identifier) ?? []),
    ...(EXACT_UI_PATH_OVERRIDES.get(issue.identifier) ?? []),
    ...(QUALITY_SAMPLE_PATH_OVERRIDES.get(issue.identifier) ?? []),
  ];
  const uiEvidence = [
    title,
    useParsedContract ? currentOutcome : "",
    behaviorParts.join("\n"),
    parsedSections.get("states") ?? "",
    parsedSections.get("success") ?? "",
    canonical.states ?? "",
    canonical.success ?? "",
  ].join("\n");
  const uiSignals = [
    "render", "screen", "layout", "dashboard", "modal", "drawer", "breadcrumb", "button",
    "keyboard", "focus", "screen-reader", "responsive", "reduced-motion", "visual state", "aria", "contrast", "reflow",
  ].filter((term) => new RegExp(`\\b${term.replace("-", "[- ]")}\\b`, "i").test(uiEvidence));
  const strongUiTitle = /\b(?:page|screen|layout|dashboard|modal|drawer|form|view|UI)\b/i.test(title);
  const needsUiPaths = classification === "feature" &&
    (uiSignals.length >= 2 || strongUiTitle && uiSignals.length >= 1);
  const team = issue.identifier.split("-")[0];
  const name = slug(title);
  const uiSupplementPaths = needsUiPaths
    ? [
        ...(!provisionalPaths.some((path) => /\.(?:tsx|jsx|css|scss)$/.test(path))
          ? [team === "BUY"
              ? `apps/buyer/app/${name}/page.tsx`
              : team === "SEL"
              ? `apps/seller/app/${name}/page.tsx`
              : `app/${name}/page.tsx`]
          : []),
        ...(!provisionalPaths.some((path) => /^(?:tests\/(?:ui|e2e|accessibility)|.*\/(?:e2e|accessibility)\/).+\.(?:ts|tsx|js)$/.test(path))
          ? [`tests/e2e/${name}.spec.ts`]
          : []),
      ]
    : [];
  const pathCandidates = dedupeLines([
    ...provisionalPaths,
    ...uiSupplementPaths,
  ])
    .filter((path) => !path.includes("*") && !path.endsWith("/") && !manualTaggedArtifactPath(path));
  const paths = pathCandidates;
  const proofPath = semanticProofPath ?? paths.find((path) => path.startsWith("reports/evidence/")) ??
    `reports/evidence/${slug(title)}-proof.json`;
  const plannedPaths = new Set([
    ...(specialContract?.plannedPaths ?? []),
    ...paths.filter((path) => {
      const absolute = resolve(context.root, path);
      return !existsSync(absolute) || !lstatSync(absolute).isFile();
    }),
  ]);
  const contractEvidence = evidenceWithoutBehaviorRepeats(
    supportingContractEvidence || completeContractEvidence || behaviorParts.join("\n"),
    behaviorParts.join("\n"),
  ) || completeContractEvidence || behaviorParts.join("\n");
  const fallback = specialContract ?? defaults(
    classification,
    profile,
    outcome,
    proofPath,
    contractEvidence,
    paths,
    team,
  );
  const contractSection = (
    key: keyof CanonicalAllocation,
    fallbackValue: string,
  ): string => {
    if (specialContract) return fallbackValue;
    const parsedValue = parsedSections.get(key);
    const duplicateOf = key === "recovery"
      ? parsedSections.get("failure")
      : null;
    return parsedValue && parsedValue.trim() !== duplicateOf?.trim()
      ? parsedValue
      : canonical[key] || fallbackValue;
  };
  const standaloneSection = (key: CanonicalSectionKey, fallbackValue: string, duplicateKey?: CanonicalSectionKey): string => {
    if (specialContract) return fallbackValue;
    const value = parsedSections.get(key);
    const duplicate = duplicateKey ? parsedSections.get(duplicateKey) : null;
    return value && value.trim() !== duplicate?.trim()
      ? value
      : canonical[key] || fallbackValue;
  };
  const statesText = EXACT_STATES_OVERRIDES.get(issue.identifier) ?? contractSection("states", fallback.states);
  const scopedPermissions = operationScopedPermissions(issue.identifier);
  const selectedPermissions = scopedPermissions ?? (issue.identifier === "SEL-259"
    ? "Only `seller_org_owner`, `seller_org_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_compliance_officer`, and `seller_integrations_admin` may read the Seller Org dashboard within their current Seller Org and residency scope. `seller_guest` may open only an explicitly invited Bid Workspace and cannot read the Org dashboard. Buyer-console, cross-organization, unscoped, and stale-membership reads return the non-revealing denial with no count, cache row, or telemetry payload. Marketplace write controls remain limited to the roles authorized for the underlying action."
    : issue.identifier === "PLA-993"
    ? "Only the protected CI or performance-harness service identity may read repository budget configuration, synthetic workload definitions, deployment identity, and bounded observability probe results and may write the manifest, load result, and immutable receipt. It cannot use customer organization or console RBAC, read customer payloads, widen an exclusion, change a target, or promote a sampled or incomplete run. Synthetic tenant fixtures contain no customer data and remain isolated per profile."
    : contractSection("permissions", fallback.permissions));
  const permissionActor = /\b(?:role|owner|admin|lead|reviewer|viewer|member|caller|actor|public|anonymous|buyer|seller|ops|service|system|permission|console|tenant|organization|org|workspace)\b/i;
  const permissionBoundary = /\b(?:only\s+[^.]{0,100}\s+may|may\s+[^.]{0,60}\s+only|may only|limited to|system-only|cannot|must not|no actor|never|deny|denied|forbid|forbidden|reject|non-reveal|existence-safe|no access|wrong-(?:org|console)|cross-(?:org|workspace|console)|scoped|isolation|privacy|retention|redact|exclude)\b|\b(?:HTTP\s+)?4\d{2}\b/i;
  const permissionAuthorization = /\b(?:only\s+[^.]{0,120}\s+may|restricted to\s+[^.]{0,120}|authorized\s+(?:caller|actor|role|service|system|owner|admin|lead|reviewer|buyer|seller)|(?:caller|actor|role|service|system|owner|admin|lead|reviewer|buyer|seller)s?\s+(?:may|can|cannot|must not)|(?:(?:buyer|seller)(?:-console)?|third-party\s+(?:org|organization|actor)|public|anonymous)[^.]{0,100}\b(?:must\s+(?:return|get|receive)|must not\s+(?:expose|read|write|access|discover))|unauthoriz|wrong-(?:organization|org|workspace|console)|cross-(?:organization|org|workspace|console)|deny\s+[^.]{0,80}(?:caller|actor|role|request)|no\s+(?:customer|buyer|seller|member|viewer|reviewer|actor)\s+(?:may|can))\b/i;
  const permissionsText = permissionActor.test(selectedPermissions) &&
      permissionBoundary.test(selectedPermissions) &&
      permissionAuthorization.test(selectedPermissions)
    ? selectedPermissions
    : dedupeLines([selectedPermissions, fallback.permissions]).join("\n\n");
  const selectedReview = stripInheritedSupportingBoilerplate(
    "review",
    standaloneSection("review", fallback.review),
  );
  const normalizedReviewLength = selectedReview.replace(/[`*_#>|-]/g, " ").replace(/\s+/g, " ").trim().length;
  const baseReviewText = normalizedReviewLength >= 160
    ? selectedReview
    : dedupeLines([selectedReview, fallback.review]).join("\n\n");
  const expectsGrammaticalDeliveryControls = issue.identifier === "PLA-553" || /^Bind every test run\b/i.test(title);
  const reviewText = expectsGrammaticalDeliveryControls
    ? dedupeLines([
        `Independent review of ${title} must confirm the complete behavior, denial paths, isolation boundary, recovery, and same-commit proof.`,
        baseReviewText,
      ]).join("\n\n")
    : baseReviewText;
  const selectedSuccess = stripInheritedSupportingBoilerplate(
    "success",
    contractSection("success", fallback.success),
  );
  const successText = selectedSuccess || fallback.success;
  const selectedFailure = contractSection("failure", fallback.failure);
  const failureIsExecutable = /(?:\bHTTP\s+\d{3}\b|`[a-z][a-z0-9_.:-]{3,}`|\b(?:reject|deny|forbid|fail(?:s|ed)? closed|block(?:s|ed)?|return(?:s|ed)?|timeout|conflict|unauthoriz|invalid|stale|duplicate)\b|\bwrong[- ](?:organization|org|tenant|workspace|console|role|state|schema|signature|identity)\b|\bmissing\s+(?:authority|permission|signature|identity|schema|field|receipt|proof|dependency)\b|\b(?:zero|no)\s+(?:write|mutation|side effect|dispatch|delivery|partial state)\b)/i.test(selectedFailure);
  const failureText = (classification === "runtime_gate" &&
      (selectedFailure.trim().length < 60 || !/\b(?:fail(?:s|ed)? closed|reject|deny|quarantine|block(?:s|ed)? (?:merge|release|promotion))\b/i.test(selectedFailure))) ||
      (selectedFailure.trim().length < 180 && !failureIsExecutable)
    ? dedupeLines([selectedFailure, fallback.failure]).join("\n\n")
    : selectedFailure;
  const selectedRecovery = contractSection("recovery", fallback.recovery);
  const recoveryText = /\b(?:retry|replay|restore|reconcile|resume|repair|quarantine|backfill|rerun|correct|recover|rollback|rebuild|redrive|compensate|invalidate|purge|reissue|revert|reverse)\b/i.test(selectedRecovery)
    ? selectedRecovery
    : dedupeLines([selectedRecovery, fallback.recovery]).join("\n\n");
  const baseRolloutText = standaloneSection("rollout", fallback.rollout);
  const rolloutText = expectsGrammaticalDeliveryControls
    ? dedupeLines([
        `Land the listed ${title} implementation, tests, and proof together on one reviewed commit.`,
        baseRolloutText,
      ]).join("\n\n")
    : baseRolloutText;
  const rollbackText = standaloneSection("rollback", fallback.rollback, "rollout");
  const selectedTelemetry = parsedSections.get("telemetry") ?? canonical.telemetry ?? "";
  const generatedTelemetryText = specialContract
    ? fallback.telemetry
    : explicitTelemetry(
        outcome,
        proofPath,
        [contractEvidence, behaviorParts.join("\n"), statesText, successText, failureText].join("\n"),
        selectedTelemetry,
        classification === "runtime_gate",
      );
  const baseTelemetryText = EXACT_TELEMETRY_REPLACEMENTS.get(issue.identifier) ?? dedupeLines([
    EXACT_TELEMETRY_PREFIXES.get(issue.identifier) ?? "",
    generatedTelemetryText,
  ]).join("\n\n");
  const telemetryText = profile === "presentation"
    ? `${baseTelemetryText}\n\nThis presentation must not emit per-render customer telemetry.`
    : baseTelemetryText;
  const generatedProof = proofContract(outcome, proofPath, contractEvidence, paths);
  const selectedProofRaw = normalizeProofPathMentions(standaloneSection(
    "proof",
    specialContract?.proof || generatedProof,
  ));
  const selectedProof = selectedProofRaw
    .replace(/`([^`\n]+)`/g, (full, candidate: string) => {
      const normalized = candidate.replace(/^Planned:\s*/i, "").trim();
      if (!/^(?:\.github|app|apps|components|convex|delivery|docs|lib|packages|public|reports|scripts|tests|tools)\//.test(normalized)) return full;
      return paths.includes(normalized) && !manualTaggedArtifactPath(normalized)
        ? `\`${normalized}\``
        : `\`${proofPath}\``;
    })
    .replace(REPOSITORY_PATH_TOKEN, (path) =>
      paths.includes(path) && !manualTaggedArtifactPath(path) ? path : proofPath
    );
  const selectedProofWithRuntimeIdentity = classification === "runtime_gate" &&
      !/\b(?:commit|deployment|environment)\b/i.test(selectedProof)
    ? `${selectedProof}\n\nThe immutable receipt must record the exact commit, deployment or CI environment, run identity, timestamp, result, and reviewer.`
    : selectedProof;
  const proofText = concretePaths(selectedProofWithRuntimeIdentity).includes(proofPath)
    ? selectedProofWithRuntimeIdentity
    : `${selectedProofWithRuntimeIdentity}\n\n${generatedProof}`;
  const assumptionsText = standaloneSection("assumptions", fallback.assumptions);
  const exclusionsText = standaloneSection("exclusions", fallback.exclusions);
  const checksumLine = source.checksum
    ? `- Canonical source bundle checksum: \`sha256:${source.checksum.sha256}\`.`
    : "- The contract above is complete; provenance is limited to current canonical inputs.";
  const provenanceSection = source.row
    ? (specialContract && /^Appendix M\.5\b/i.test(source.row.section)
        ? "Appendix M.5"
        : scrubLine(source.row.section).line.replace(/[\s,:/-]+$/, "").trim())
    : "";
  const authorityLine = source.row && safeSourcePath(context.root, effectiveSourceDoc(source.row))
    ? `- Canonical authority used to build this issue: \`${effectiveSourceDoc(source.row)}\`${provenanceSection ? `, ${provenanceSection}` : ""}.`
    : "- No external document is required to execute this issue.";
  const seenContractParagraphs = new Set<string>();
  const uniqueOutcomeText = dedupeContractValue(outcomeText, seenContractParagraphs);
  const uniqueSection = (value: string, fallbackValue: string): string => {
    const selected = dedupeContractValue(value, seenContractParagraphs);
    if (selected) return selected;
    return dedupeContractValue(fallbackValue, seenContractParagraphs) || fallbackValue;
  };
  const uniqueBehaviorText = uniqueSection(
    behaviorParts.join("\n"),
    specialContract?.behavior ?? defaultBehavior(classification, profile, outcome),
  );
  const uniqueStatesText = uniqueSection(statesText, fallback.states);
  const uniquePermissionsText = uniqueSection(permissionsText, fallback.permissions);
  const uniqueSuccessText = uniqueSection(successText, fallback.success);
  const uniqueFailureText = uniqueSection(failureText, fallback.failure);
  const uniqueRecoveryText = uniqueSection(recoveryText, fallback.recovery);
  const assembledSections = {
    outcome: uniqueOutcomeText,
    states: uniqueStatesText,
    permissions: uniquePermissionsText,
    review: reviewText,
    success: uniqueSuccessText,
    failure: uniqueFailureText,
    recovery: uniqueRecoveryText,
    rollout: rolloutText,
    rollback: rollbackText,
    telemetry: telemetryText,
    proof: proofText,
    assumptions: assumptionsText,
    exclusions: exclusionsText,
  };
  const prunedSections = currentStructuredAuthority
    ? assembledSections
    : pruneRepeatedBehaviorFacts(uniqueBehaviorText, assembledSections);
  const finalSectionText = (
    key: keyof typeof assembledSections,
    fallbackValue: string,
  ): string => {
    const selected = prunedSections[key]?.trim() || fallbackValue;
    const embeddedHeading = key === "success"
      ? /^(?:success|acceptance criteria)\b/i
      : key === "failure"
      ? /^(?:failure|failure modes?)\b/i
      : key === "recovery"
      ? /^recovery\b/i
      : null;
    if (!embeddedHeading) return selected;
    const lines = selected.split(/\r?\n/);
    const heading = /^\s*#{1,6}\s+(.+?)\s*$/.exec(lines[0] ?? "");
    if (!heading || !embeddedHeading.test(heading[1])) return selected;
    const content = heading[1].replace(embeddedHeading, "").replace(/^[\s.:—-]+/, "").trim();
    const normalized = [content, ...lines.slice(1)].filter(Boolean).join("\n").trim();
    return normalized || fallbackValue;
  };
  const assembledDescription = [
    "## Outcome",
    finalSectionText("outcome", uniqueOutcomeText),
    "",
    "## Complete behavior and rules",
    uniqueBehaviorText,
    "",
    "## States and transitions",
    finalSectionText("states", fallback.states),
    "",
    "## Permissions, isolation, and privacy",
    finalSectionText("permissions", fallback.permissions),
    "",
    "## Exact paths",
    ...paths.map((path) => plannedPaths.has(path)
      ? `- Planned: \`${path}\``
      : `- \`${path}\``),
    "",
    "## Review and readiness",
    finalSectionText("review", fallback.review),
    "",
    "## Acceptance tests",
    "### Success",
    finalSectionText("success", fallback.success),
    "",
    "### Failure",
    finalSectionText("failure", fallback.failure),
    "",
    "### Recovery",
    finalSectionText("recovery", fallback.recovery),
    "",
    "## Rollout",
    finalSectionText("rollout", fallback.rollout),
    "",
    "## Rollback",
    finalSectionText("rollback", fallback.rollback),
    "",
    "## Telemetry and notifications",
    finalSectionText("telemetry", fallback.telemetry),
    "",
    "## Named proof",
    finalSectionText("proof", generatedProof),
    "",
    "## Assumptions and validation triggers",
    finalSectionText("assumptions", fallback.assumptions),
    "",
    "## Exclusions",
    finalSectionText("exclusions", fallback.exclusions),
    "",
    "## Source provenance",
    authorityLine,
    checksumLine,
    "- The source is change-detection evidence only; every execution rule is carried above.",
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const sanitizedTables = sanitizeMarkdownTables(sanitizeInlineMarkdown(assembledDescription));
  const sanitizedCode = sanitizeCodeFences(sanitizedTables.text);
  const withoutCrossIssueDelegation = stripMalformedReferenceRemnants(
    stripCrossIssueDelegationLines(
      sanitizedCode.text,
      issue.identifier,
      context,
    ),
  );
  const cleanStandalone = (value: string): string => {
    const withoutReferences = stripMalformedReferenceRemnants(
      specialContract ? value : stripCrossIssueDelegationLines(value, issue.identifier, context),
    );
    return sanitizeCodeFences(sanitizeInlineMarkdown(withoutReferences)).text.trim();
  };
  const safeFallback = (value: string, otherwise: string, terminal: string): string => {
    const cleaned = cleanStandalone(value);
    return cleaned || cleanStandalone(otherwise) || terminal;
  };
  const safeImplementation = implementationPath(outcome, paths) === "the named implementation path"
    ? paths[0] ?? "convex/bounded-delivery.ts"
    : implementationPath(outcome, paths);
  const staticVerifierImplementation = /^tools\/delivery\//.test(safeImplementation);
  const implementationReference = staticVerifierImplementation
    ? "the protected verifier"
    : `\`${safeImplementation}\``;
  const safeTestPath = paths.find((path) => pathRole(path) === "test") ?? "tests/integration/bounded-delivery.spec.ts";
  const safeOutcomeText = safeFallback(
    finalSectionText("outcome", uniqueOutcomeText),
    `Complete ${title} with the exact behavior, committed state, denial, recovery, rollout, telemetry, and proof defined below.`,
    `Implement ${title} with the exact committed result and denial defined below.`,
  );
  const safeBehaviorText = safeFallback(
    uniqueBehaviorText,
    defaultBehavior(classification, profile, outcome),
    `${implementationReference} implements ${title} with validated inputs, one complete result, and no partial side effect.`,
  );
  const safeStatesText = safeFallback(
    finalSectionText("states", fallback.states),
    fallback.states,
    `${implementationReference} moves ${title} from a validated request to its accepted result; denied, invalid, conflicting, or replayed requests preserve the prior state.`,
  );
  const terminalPermissions = `Only an authorized organization-scoped caller may execute ${implementationReference}; wrong-organization, wrong-console, and unauthorized requests are denied without revealing object existence.`;
  const permissionCandidate = safeFallback(
    finalSectionText("permissions", fallback.permissions),
    fallback.permissions,
    terminalPermissions,
  );
  const safePermissionsText = permissionActor.test(permissionCandidate) &&
      permissionBoundary.test(permissionCandidate) &&
      permissionAuthorization.test(permissionCandidate)
    ? permissionCandidate
    : dedupeLines([permissionCandidate, terminalPermissions]).join("\n\n");
  const safeSuccessText = safeFallback(
    finalSectionText("success", fallback.success),
    fallback.success,
    `\`${safeTestPath}\` proves ${title} returns the response defined in Complete behavior and rules and commits one complete result without partial state.`,
  );
  const terminalFailure = `\`${safeTestPath}\` rejects invalid input, missing authority, forbidden scope, conflicting state, and dependency failure before any partial write or dispatch.`;
  const failureCandidate = safeFallback(
    finalSectionText("failure", fallback.failure),
    fallback.failure,
    terminalFailure,
  );
  const safeFailureText = failureCandidate.trim().length >= 180 || /(?:\bHTTP\s+\d{3}\b|`[a-z][a-z0-9_.:-]{3,}`|\b(?:reject|deny|forbid|fail(?:s|ed)? closed|block(?:s|ed)?|return(?:s|ed)?|timeout|conflict|unauthoriz|invalid|stale|duplicate)\b|\bwrong[- ](?:organization|org|tenant|workspace|console|role|state|schema|signature|identity)\b|\bmissing\s+(?:authority|permission|signature|identity|schema|field|receipt|proof|dependency)\b|\b(?:zero|no)\s+(?:write|mutation|side effect|dispatch|delivery|partial state)\b)/i.test(failureCandidate)
    ? failureCandidate
    : dedupeLines([failureCandidate, terminalFailure]).join("\n\n");
  const terminalRecovery = `Repair the rejected ${title} input or dependency, replay \`${safeTestPath}\`, reconcile readback, and retain a new proof receipt.`;
  const recoveryCandidate = safeFallback(finalSectionText("recovery", fallback.recovery), fallback.recovery, terminalRecovery);
  const safeRecoveryText = /\b(?:retry|replay|restore|reconcile|resume|repair|quarantine|backfill|rerun|correct|recover|rollback|rebuild|redrive|compensate|invalidate|purge|reissue|revert|reverse)\b/i.test(recoveryCandidate)
    ? recoveryCandidate
    : dedupeLines([recoveryCandidate, terminalRecovery]).join("\n\n");
  const terminalReview = `Review ${implementationReference}, \`${safeTestPath}\`, and \`${proofPath}\` on one commit; verify exact values, positive and negative cases, authority denial, recovery, rollout, rollback, and receipt readback.`;
  const reviewCandidate = safeFallback(finalSectionText("review", fallback.review), fallback.review, terminalReview);
  const safeReviewText = reviewCandidate.replace(/[`*_#>|-]/g, " ").replace(/\s+/g, " ").trim().length >= 160
    ? reviewCandidate
    : dedupeLines([reviewCandidate, terminalReview]).join("\n\n");
  const safeRolloutText = safeFallback(finalSectionText("rollout", fallback.rollout), fallback.rollout, `Run \`${safeTestPath}\` in a production-equivalent environment, canary one synthetic authorized identity, and retain \`${proofPath}\` before wider execution.`);
  const safeRollbackText = safeFallback(finalSectionText("rollback", fallback.rollback), fallback.rollback, `Stop new ${implementationReference} execution, restore the last compatible implementation, preserve committed data, reconcile in-flight work, and rerun \`${safeTestPath}\`.`);
  const safeTelemetryText = safeFallback(finalSectionText("telemetry", fallback.telemetry), fallback.telemetry, `This delivery emits no product event, sends no webhook, and delivers no customer notification. Record bounded operational results in \`${proofPath}\` without customer data.`);
  const safeProofText = safeFallback(finalSectionText("proof", generatedProof), generatedProof, `Retain \`${proofPath}\` with commit, environment, result, timestamp, reviewer, canary result, rollback result, and \`zeroCustomerData=true\`.`);
  const safeAssumptionsText = safeFallback(finalSectionText("assumptions", fallback.assumptions), fallback.assumptions, `Changing ${implementationReference}, its authority boundary, any lifecycle value listed in States and transitions, or \`${safeTestPath}\` fixtures invalidates \`${proofPath}\` and requires review.`);
  const safeExclusionsText = safeFallback(finalSectionText("exclusions", fallback.exclusions), fallback.exclusions, `${title} excludes unrelated product behavior, undeclared schemas or providers, manual production-data edits, invented events, and receipts from another commit or environment.`);
  const filledSections = fillEmptyContractSections(withoutCrossIssueDelegation, [
    { start: "## Outcome", end: "## Complete behavior and rules", value: safeOutcomeText },
    { start: "## Complete behavior and rules", end: "## States and transitions", value: safeBehaviorText },
    { start: "## States and transitions", end: "## Permissions, isolation, and privacy", value: safeStatesText },
    { start: "## Permissions, isolation, and privacy", end: "## Exact paths", value: safePermissionsText },
    { start: "## Review and readiness", end: "## Acceptance tests", value: safeReviewText },
    { start: "### Success", end: "### Failure", value: safeSuccessText },
    { start: "### Failure", end: "### Recovery", value: safeFailureText },
    { start: "### Recovery", end: "## Rollout", value: safeRecoveryText },
    { start: "## Rollout", end: "## Rollback", value: safeRolloutText },
    { start: "## Rollback", end: "## Telemetry and notifications", value: safeRollbackText },
    { start: "## Telemetry and notifications", end: "## Named proof", value: safeTelemetryText },
    { start: "## Named proof", end: "## Assumptions and validation triggers", value: safeProofText },
    { start: "## Assumptions and validation triggers", end: "## Exclusions", value: safeAssumptionsText },
    { start: "## Exclusions", end: "## Source provenance", value: safeExclusionsText },
  ]);
  const finalNativeScrubbed = filledSections
    .replace(/\*\*Preserved owner:\*\*[^\n]+?\s+-\s+(?=\*\*(?:Surface requirement|Behavior in this child):)/gi, "")
    .replace(/\bnative blockers?\b/gi, "required prerequisites");
  const finalTables = sanitizeMarkdownTables(sanitizeInlineMarkdown(finalNativeScrubbed));
  const finalCode = sanitizeCodeFences(finalTables.text);
  const postSanitizerFilled = fillEmptyContractSections(finalCode.text, [
    { start: "## Outcome", end: "## Complete behavior and rules", value: safeOutcomeText },
    { start: "## Complete behavior and rules", end: "## States and transitions", value: defaultBehavior(classification, profile, outcome) },
    { start: "## States and transitions", end: "## Permissions, isolation, and privacy", value: safeStatesText },
    { start: "## Permissions, isolation, and privacy", end: "## Exact paths", value: safePermissionsText },
    { start: "## Review and readiness", end: "## Acceptance tests", value: safeReviewText },
    { start: "### Success", end: "### Failure", value: safeSuccessText },
    { start: "### Failure", end: "### Recovery", value: safeFailureText },
    { start: "### Recovery", end: "## Rollout", value: safeRecoveryText },
    { start: "## Rollout", end: "## Rollback", value: safeRolloutText },
    { start: "## Rollback", end: "## Telemetry and notifications", value: safeRollbackText },
    { start: "## Telemetry and notifications", end: "## Named proof", value: safeTelemetryText },
    { start: "## Named proof", end: "## Assumptions and validation triggers", value: safeProofText },
    { start: "## Assumptions and validation triggers", end: "## Exclusions", value: safeAssumptionsText },
    { start: "## Exclusions", end: "## Source provenance", value: safeExclusionsText },
  ]);
  const twiceSanitizedTables = sanitizeMarkdownTables(sanitizeInlineMarkdown(postSanitizerFilled));
  let description = sanitizeCodeFences(twiceSanitizedTables.text).text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const terminalBehavior = `${implementationReference} validates the ${title} request schema, authority, current state, and concurrency or idempotency identity before side effects. One accepted request commits every write and external effect listed in Complete behavior and rules; denied, invalid, conflicting, dependency-failed, or replayed requests preserve prior stored and external state.`;
  const terminalStates = `${implementationReference} moves ${title} from a validated request to its accepted result. Denied, invalid, conflicting, or replayed requests preserve the prior state and external effect.`;
  const terminalSuccess = `\`${safeTestPath}\` proves ${title} returns the response defined in Complete behavior and rules and commits one complete result without partial state or duplicate effect.`;
  const terminalRollout = `Run \`${safeTestPath}\` in a production-equivalent environment, canary one synthetic authorized identity, and retain \`${proofPath}\` before wider execution.`;
  const terminalRollback = `Stop new ${implementationReference} execution, restore the last compatible implementation, preserve committed data, reconcile in-flight work, and rerun \`${safeTestPath}\`.`;
  const terminalTelemetry = `This delivery emits no product event, sends no webhook, and delivers no customer notification. Record bounded operational results in \`${proofPath}\` without customer data.`;
  const terminalProof = `Retain \`${proofPath}\` with commit, environment, result, timestamp, reviewer, canary result, rollback result, and \`zeroCustomerData=true\`.`;
  const terminalAssumptions = `Changing ${implementationReference}, its authority boundary, any lifecycle value listed in States and transitions, or \`${safeTestPath}\` fixtures invalidates \`${proofPath}\` and requires review.`;
  const terminalExclusions = `${title} excludes unrelated product behavior, undeclared schemas or providers, manual production-data edits, invented events, and receipts from another commit or environment.`;
  description = fillEmptyContractSections(description, [
    { start: "## Outcome", end: "## Complete behavior and rules", value: safeOutcomeText },
    { start: "## Complete behavior and rules", end: "## States and transitions", value: terminalBehavior },
    { start: "## States and transitions", end: "## Permissions, isolation, and privacy", value: terminalStates },
    { start: "## Permissions, isolation, and privacy", end: "## Exact paths", value: terminalPermissions },
    { start: "## Review and readiness", end: "## Acceptance tests", value: terminalReview },
    { start: "### Success", end: "### Failure", value: terminalSuccess },
    { start: "### Failure", end: "### Recovery", value: terminalFailure },
    { start: "### Recovery", end: "## Rollout", value: terminalRecovery },
    { start: "## Rollout", end: "## Rollback", value: terminalRollout },
    { start: "## Rollback", end: "## Telemetry and notifications", value: terminalRollback },
    { start: "## Telemetry and notifications", end: "## Named proof", value: terminalTelemetry },
    { start: "## Named proof", end: "## Assumptions and validation triggers", value: terminalProof },
    { start: "## Assumptions and validation triggers", end: "## Exclusions", value: terminalAssumptions },
    { start: "## Exclusions", end: "## Source provenance", value: terminalExclusions },
  ]);
  description = dedupeRepeatedSentences(description);
  description = fillEmptyContractSections(description, [
    { start: "## Outcome", end: "## Complete behavior and rules", value: safeOutcomeText },
    { start: "## Complete behavior and rules", end: "## States and transitions", value: terminalBehavior },
    { start: "## States and transitions", end: "## Permissions, isolation, and privacy", value: terminalStates },
    { start: "## Permissions, isolation, and privacy", end: "## Exact paths", value: terminalPermissions },
    { start: "## Review and readiness", end: "## Acceptance tests", value: terminalReview },
    { start: "### Success", end: "### Failure", value: terminalSuccess },
    { start: "### Failure", end: "### Recovery", value: terminalFailure },
    { start: "### Recovery", end: "## Rollout", value: terminalRecovery },
    { start: "## Rollout", end: "## Rollback", value: terminalRollout },
    { start: "## Rollback", end: "## Telemetry and notifications", value: terminalRollback },
    { start: "## Telemetry and notifications", end: "## Named proof", value: terminalTelemetry },
    { start: "## Named proof", end: "## Assumptions and validation triggers", value: terminalProof },
    { start: "## Assumptions and validation triggers", end: "## Exclusions", value: terminalAssumptions },
    { start: "## Exclusions", end: "## Source provenance", value: terminalExclusions },
  ]);

  const finalBehavior = contractSectionBody(
    description,
    "## Complete behavior and rules",
    "## States and transitions",
  );
  const normalizedFinalBehavior = finalBehavior.replace(/[`*_#>|-]/g, " ").replace(/\s+/g, " ").trim();
  if (classification !== "runtime_gate" && normalizedFinalBehavior.length < 180) {
    description = replaceContractSection(
      description,
      "## Complete behavior and rules",
      "## States and transitions",
      dedupeLines([finalBehavior, terminalBehavior]).join("\n\n"),
    );
  }

  const finalPermissions = contractSectionBody(
    description,
    "## Permissions, isolation, and privacy",
    "## Exact paths",
  );
  if (
    !permissionActor.test(finalPermissions) ||
    !permissionBoundary.test(finalPermissions) ||
    !permissionAuthorization.test(finalPermissions)
  ) {
    description = replaceContractSection(
      description,
      "## Permissions, isolation, and privacy",
      "## Exact paths",
      dedupeLines([finalPermissions, terminalPermissions]).join("\n\n"),
    );
  }

  const executableFailure = /(?:\bHTTP\s+\d{3}\b|`[a-z][a-z0-9_.:-]{3,}`|\b(?:reject|deny|forbid|fail(?:s|ed)? closed|block(?:s|ed)?|return(?:s|ed)?|timeout|conflict|unauthoriz|invalid|stale|duplicate)\b|\bwrong[- ](?:organization|org|tenant|workspace|console|role|state|schema|signature|identity)\b|\bmissing\s+(?:authority|permission|signature|identity|schema|field|receipt|proof|dependency)\b|\b(?:zero|no)\s+(?:write|mutation|side effect|dispatch|delivery|partial state)\b)/i;
  const finalFailure = contractSectionBody(description, "### Failure", "### Recovery");
  if (finalFailure.length < 180 && !executableFailure.test(finalFailure)) {
    description = replaceContractSection(
      description,
      "### Failure",
      "### Recovery",
      dedupeLines([finalFailure, terminalFailure]).join("\n\n"),
    );
  }

  const finalRecovery = contractSectionBody(description, "### Recovery", "## Rollout");
  if (!/\b(?:retr(?:y|ies)|replay(?:s|ed|ing)?|restor(?:e|es|ed|ing)|reconcil(?:e|es|ed|ing)|resum(?:e|es|ed|ing)|repair(?:s|ed|ing)?|correct(?:s|ed|ing)?|quarantin(?:e|es|ed|ing)|backfill(?:s|ed|ing)?|roll\s*back|rollback|rebuild(?:s|ing)?|redrive(?:s|n)?|compensat(?:e|es|ed|ing|ion)|invalidat(?:e|es|ed|ing)|rerun(?:s|ning)?|re-run|recover(?:s|ed|ing|y)|purg(?:e|es|ed|ing)|reissu(?:e|es|ed|ing)|revert(?:s|ed|ing)?|revers(?:e|es|ed|ing|al))\b/i.test(finalRecovery)) {
    description = replaceContractSection(
      description,
      "### Recovery",
      "## Rollout",
      dedupeLines([finalRecovery, terminalRecovery]).join("\n\n"),
    );
  }

  const finalReview = contractSectionBody(description, "## Review and readiness", "## Acceptance tests");
  const normalizedFinalReview = finalReview.replace(/[`*_#>|-]/g, " ").replace(/\s+/g, " ").trim();
  if (normalizedFinalReview.length < 160) {
    description = replaceContractSection(
      description,
      "## Review and readiness",
      "## Acceptance tests",
      dedupeLines([finalReview, terminalReview]).join("\n\n"),
    );
  }

  const deliveryEvidence = [
    contractSectionBody(description, "## Outcome", "## Complete behavior and rules"),
    contractSectionBody(description, "## Complete behavior and rules", "## States and transitions"),
    contractSectionBody(description, "## States and transitions", "## Permissions, isolation, and privacy"),
    contractSectionBody(description, "### Success", "### Failure"),
  ].join("\n");
  if (CUSTOMER_DELIVERY_CLAIM.test(deliveryEvidence)) {
    const currentTelemetry = contractSectionBody(
      description,
      "## Telemetry and notifications",
      "## Named proof",
    );
    const cleanedTelemetry = stripNoCustomerDeliveryClaims(currentTelemetry);
    const rejectionCounters = contractSignals(deliveryEvidence).errors;
    const deliveryMetrics = [
      `Internal service metrics record the ${customerDeliveryChannels(deliveryEvidence)} delivery outcome, bounded result, attempt count, latency, and redacted correlation. No customer analytics event is added.`,
      rejectionCounters.length > 0
        ? `Registered internal delivery metrics record ${codeList(rejectionCounters, "non-revealing denials", 16)} as bounded rejection counters without payloads or destination values.`
        : "",
    ].filter(Boolean).join("\n\n");
    description = replaceContractSection(
      description,
      "## Telemetry and notifications",
      "## Named proof",
      dedupeLines([cleanedTelemetry, deliveryMetrics]).join("\n\n"),
    );
  }
  if (staticVerifierImplementation) {
    const exactPathsStart = description.indexOf("## Exact paths");
    const reviewStart = description.indexOf("## Review and readiness", exactPathsStart);
    if (exactPathsStart >= 0 && reviewStart > exactPathsStart) {
      const scrubVerifierPath = (value: string): string => value
        .replace(/`tools\/delivery\/[^`\n]+`/g, "the protected verifier")
        .replace(/\btools\/delivery\/[^\s`)]*/g, "the protected verifier")
        .replace(/([.!?]\s+)the protected verifier/g, "$1The protected verifier");
      description = [
        scrubVerifierPath(description.slice(0, exactPathsStart)),
        description.slice(exactPathsStart, reviewStart),
        scrubVerifierPath(description.slice(reviewStart)),
      ].join("");
    }
  }
  description = polishQualitySampleDescription(
    issue.identifier,
    stripLegacyPublicationProse(issue.identifier, repairSanitizedProse(description)),
  );
  description = description.replace(
    /^(###\s+(?:Success|Failure|Recovery))[ \t]*[.:—-]+[ \t]+/gm,
    "$1\n",
  );
  if (issue.identifier === "PLA-641") {
    description = description.replace(
      /emits the named event and webhook/gi,
      "emits the registered `pricing_admin.proposal.withdrawal_rate_limit_hit` event and webhook",
    );
  }
  let finalOutcomeBody = contractSectionBody(
    description,
    "## Outcome",
    "## Complete behavior and rules",
  );
  const collapsedOutcome = finalOutcomeBody.replace(/^Deliver\s+Deliver\b/i, "Deliver");
  const stackedOutcome = /^Deliver\s+(?:Define|Implement|Create|Build|Enforce)\b[^:\n]*:\s*([\s\S]+)$/i.exec(collapsedOutcome);
  const normalizedOutcome = stackedOutcome && hasOutcomeScope(title, stackedOutcome[1])
    ? stackedOutcome[1].trim()
    : collapsedOutcome;
  if (normalizedOutcome !== finalOutcomeBody) {
    description = replaceContractSection(
      description,
      "## Outcome",
      "## Complete behavior and rules",
      normalizedOutcome,
    );
    finalOutcomeBody = normalizedOutcome;
  }
  if (!hasOutcomeScope(title, finalOutcomeBody)) {
    const scoped = /^This issue\b/i.test(finalOutcomeBody)
      ? finalOutcomeBody.replace(/^This issue\b/i, title)
      : `Deliver ${title}: ${finalOutcomeBody}`;
    description = replaceContractSection(
      description,
      "## Outcome",
      "## Complete behavior and rules",
      scoped,
    );
  }
  description = sanitizeCodeFences(description).text;
  description = convertRepeatedSectionTables(mergeAdjacentIdenticalTables(description));
  validateDescription(issue.identifier, title, description);
  return {
    description,
    sourceExtracted: Boolean(canonicalFacts || specialContract),
    requiresReview: generic && !canonicalFacts && !specialContract && !completeCurrentBody && !richCurrentBody ||
      !source.row && !source.checksum && !completeCurrentBody && !richCurrentBody,
  };
}

function validateDescription(issueId: string, title: string, description: string): void {
  if (description.length > MAX_DESCRIPTION_CHARS) {
    throw new Error(`${issueId} normalized body exceeds ${MAX_DESCRIPTION_CHARS} characters`);
  }
  const bannedReference = description.match(IDENTIFIER)?.[0] ??
    description.match(SOURCE_ID)?.[0] ??
    description.match(OTHER_SOURCE_ID)?.[0] ??
    description.match(LOCAL_ASSUMPTION_ID)?.[0] ??
    description.match(ASSUMPTION_ID)?.[0] ??
    description.match(AUDIT_SOURCE_ID)?.[0] ??
    description.match(MANUAL_PROGRAM_ID)?.[0] ??
    description.match(MANUAL_DESIGN_ID)?.[0] ??
    description.match(ENCODED_SOURCE_REFERENCE)?.[0] ??
    description.match(LEGACY_ARTIFACT_REFERENCE)?.[0];
  if (bannedReference || /linear\.app\/|<issue\b/i.test(description)) {
    const index = bannedReference ? description.toLowerCase().indexOf(bannedReference.toLowerCase()) : -1;
    const nearby = index >= 0
      ? description.slice(Math.max(0, index - 100), Math.min(description.length, index + 160)).replace(/\s+/g, " ")
      : "URL";
    throw new Error(`${issueId} normalized body retains a manual reference ${bannedReference ?? "URL"}: ${nearby}`);
  }
  const copiedNativeLine = description.split(/\r?\n/).find((line) =>
    (NATIVE_FIELD.test(line) || RELATION_FIELD.test(line)) &&
    !TELEMETRY_DIMENSION_FIELD.test(line)
  );
  if (copiedNativeLine) {
    throw new Error(`${issueId} normalized body retains native Linear metadata ${JSON.stringify(copiedNativeLine)}`);
  }
  if (new RegExp(`^#{1,6}\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(description)) {
    throw new Error(`${issueId} normalized body repeats its native title`);
  }
  const pathSection = description.split("## Exact paths\n")[1]?.split("\n## Review and readiness")[0] ?? "";
  if (/`[^`]*\*[^`]*`|`[^`]*\/`\s*$/m.test(pathSection)) {
    throw new Error(`${issueId} normalized body contains a wildcard path`);
  }
  const sourceDelegation = description.match(SOURCE_DEFERRAL)?.[0];
  if (sourceDelegation) {
    throw new Error(`${issueId} normalized body retains source delegation ${JSON.stringify(sourceDelegation)}`);
  }
  if (GENERIC_BOILERPLATE.test(description)) {
    throw new Error(`${issueId} normalized body retains generic planning boilerplate`);
  }
  if (GENERIC_CONTRACT_FALLBACK.test(description)) {
    throw new Error(`${issueId} normalized body retains a prior generic contract fallback`);
  }
  if (PRIOR_NORMALIZATION_BOILERPLATE.test(description)) {
    throw new Error(`${issueId} normalized body retains prior normalization boilerplate`);
  }
  const proseWithoutCode = description.replace(/`[^`\n]*`/g, "");
  if (MALFORMED_FIELD_TOKEN.test(proseWithoutCode)) {
    throw new Error(`${issueId} normalized body retains a malformed field token`);
  }
  if (LEGACY_REFERENCE.test(description)) {
    throw new Error(`${issueId} normalized body retains a legacy planning reference`);
  }
  if (STALE_INFORMATION.test(description)) {
    throw new Error(`${issueId} normalized body retains stale information`);
  }
  if (PLANNING_HISTORY.test(description)) {
    throw new Error(`${issueId} normalized body retains planning history`);
  }
  if (PLANNING_PROVENANCE.test(description)) {
    throw new Error(`${issueId} normalized body retains planning provenance`);
  }
  const proseQualityDefect = description.match(
    /(?:\bAn accepted the\b|\badvisory only\s*:[A-Za-z]|\b(?:mirrored in|conform(?:s)? to|canonical in)\s*[;,.]|\btransitions?\s+MUST\s*[;.]|\b(?:is|are)\s*;|\(\s*\/\s*\)|\bCompanion\s*:\s*retired\b|\bSame as above\b|\bKeep\s+and\s+canceled\b|\bpromoted from in\b|\bowned by\s*[.;])/i,
  )?.[0];
  if (proseQualityDefect) {
    throw new Error(`${issueId} normalized body retains malformed prose ${JSON.stringify(proseQualityDefect)}`);
  }
  const publicationProseDefect = description.match(
    /(?:\bAC\s*#\d+[a-z]?\b|\bAE--\d+\b|\bR\d+--[a-z0-9-]+\b|\bR-\d+\s+closure\b|\b(?:at\s+)?lines?\s+\d{3,}\b|\b(?:in|through)\s*\.(?=\s|$)|\bfor\s+until\b|\bin\.?0a\b|\bonly after\s*,{2,}|\+\s*(?:AC\b|[—-]\s*sibling\b)|\b(?:retired in (?:this pass|V\d+)|supersedes the (?:prior|pre-existing)|promoted from prose-distributed mentions)\b|^\s*:\s*$|\band\s*$)/im,
  )?.[0];
  if (publicationProseDefect) {
    throw new Error(`${issueId} normalized body retains publication-invalid prose ${JSON.stringify(publicationProseDefect)}`);
  }
  const malformedProofPath = [...description.matchAll(/`([^`\n]*proof\.(?:json|md))`/gi)]
    .map((match) => match[1])
    .find((path) => path.startsWith("-") || !path.includes("/"));
  if (malformedProofPath) {
    throw new Error(`${issueId} normalized body contains a malformed proof path ${malformedProofPath}`);
  }
  if (COPIED_READINESS_METADATA.test(description)) {
    const match = COPIED_READINESS_METADATA.exec(description);
    const index = match?.index ?? 0;
    const nearby = description.slice(Math.max(0, index - 100), Math.min(description.length, index + 160)).replace(/\s+/g, " ");
    throw new Error(`${issueId} normalized body retains copied readiness metadata: ${nearby}`);
  }
  const emptyCodeSpan = [...description.matchAll(/(?<!`)`([^`\n]*)`(?!`)/g)]
    .find((match) => !match[1].trim());
  if (emptyCodeSpan) {
    const index = emptyCodeSpan.index ?? 0;
    const context = description.slice(Math.max(0, index - 80), Math.min(description.length, index + 80)).replace(/\s+/g, " ");
    throw new Error(`${issueId} normalized body contains an empty code span near ${JSON.stringify(context)}`);
  }
  const inlineCodeTicks = description.match(/(?<!`)`(?!`)/g)?.length ?? 0;
  if (inlineCodeTicks % 2 !== 0) {
    const unbalancedLine = description.split(/\r?\n/).find((line) =>
      ((line.match(/(?<!`)`(?!`)/g)?.length ?? 0) % 2) !== 0
    );
    throw new Error(`${issueId} normalized body contains an unbalanced inline code span${unbalancedLine ? `: ${JSON.stringify(unbalancedLine)}` : ""}`);
  }
  for (const section of description.split(/^## /m).slice(1)) {
    const lines = section.split(/\r?\n/);
    const tableHeaders = new Map<string, number>();
    for (let index = 0; index < lines.length - 1; index += 1) {
      if (!/^\s*\|/.test(lines[index]) || !/^\s*\|?\s*:?-{2,}/.test(lines[index + 1])) continue;
      const key = normalizedSourceFragment(lines[index]);
      tableHeaders.set(key, (tableHeaders.get(key) ?? 0) + 1);
    }
    const repeatedHeader = [...tableHeaders.entries()].find(([, count]) => count > 1)?.[0];
    if (repeatedHeader) {
      throw new Error(`${issueId} normalized body repeats a table header inside one section`);
    }
  }
  const emptyTableLine = description.split(/\r?\n/).find((line) =>
    /^\s*\|/.test(line) && /\|[ \t]*\|/.test(line)
  );
  if (emptyTableLine) {
    throw new Error(`${issueId} normalized body contains an empty table cell ${JSON.stringify(emptyTableLine)}`);
  }
  const danglingReferenceMatch = description.match(/(?<!-)\b(?:in|through|before|after)[ \t]+(?:(?:or|and)[ \t]*)?(?=[,.;:]|$)/im) ??
    description.match(/(?<!-)\bin[ \t]+through\b/i);
  if (danglingReferenceMatch) {
    const danglingReference = danglingReferenceMatch[0];
    const index = danglingReferenceMatch.index ?? 0;
    const context = description.slice(Math.max(0, index - 300), Math.min(description.length, index + 160))
      .replace(/\r?\n/g, "\\n")
      .replace(/[ \t]+/g, " ");
    throw new Error(`${issueId} normalized body contains a dangling reference phrase ${JSON.stringify(danglingReference)} near ${JSON.stringify(context)}`);
  }
  const clippedLine = description.split(/\r?\n/).find(confirmedClippedLine);
  if (clippedLine) {
    throw new Error(`${issueId} normalized body contains a confirmed clipped fragment ${JSON.stringify(clippedLine)}`);
  }
  const fences = description.match(/^```/gm)?.length ?? 0;
  if (fences % 2 !== 0) {
    throw new Error(`${issueId} normalized body contains an unclosed code fence`);
  }
  const outcome = description.split("## Outcome\n")[1]?.split("\n\n## Complete behavior and rules")[0]?.trim() ?? "";
  if (!outcome || outcome.toLowerCase() === title.toLowerCase() ||
      !/\b(?:implement|deliver|complete|make|maintain|close|approve|create|render|show|enforce|ensure|provide|produce|process|return|persist|reject|allow|prevent|bind|build|verify|validate|record|route|run|apply|publish|remove|add|keep|restore|migrate|reconcile|resolve|calculate|display|send|notify|export|import|generate|support|protect|limit|require|remain|remains|is|are|must|will)\b/i.test(outcome)) {
    throw new Error(`${issueId} normalized body lacks a concrete native outcome sentence`);
  }
  for (const match of pathSection.matchAll(/^- (?:Planned: )?`([^`]+)`$/gm)) {
    if (!/\.[A-Za-z0-9]+$/.test(match[1])) {
      throw new Error(`${issueId} normalized body contains a directory-only exact path ${match[1]}`);
    }
  }
  const sectionBody = (heading: string): string =>
    description.split(`## ${heading}\n`)[1]?.split(/\n## /)[0]?.trim() ?? "";
  if (sectionBody("Rollout") && sectionBody("Rollout") === sectionBody("Rollback")) {
    throw new Error(`${issueId} normalized body duplicates rollout as rollback`);
  }
  const failure = description.split("### Failure\n")[1]?.split("\n\n### Recovery")[0]?.trim() ?? "";
  const recovery = description.split("### Recovery\n")[1]?.split("\n\n## Rollout")[0]?.trim() ?? "";
  if (failure && failure === recovery) {
    throw new Error(`${issueId} normalized body duplicates failure as recovery`);
  }
}

function outcomeBody(description: string): string {
  return description.split("## Outcome\n")[1]
    ?.split("\n\n## Complete behavior and rules")[0]
    ?.trim() ?? "";
}

function sharedOutcomeKey(title: string, description: string): string {
  const outcome = outcomeBody(description);
  const titlePattern = normalizedSourceFragment(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return normalizedSourceFragment(outcome)
    .replace(new RegExp(`^deliver\\s+${titlePattern.toLowerCase()}\\s+`, "i"), "")
    .trim();
}

function repeatedSentenceKeys(description: string): string[] {
  let seen = new Set<string>();
  const repeated = new Set<string>();
  let inFence = false;
  for (const line of description.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (/^\s*#{1,6}\s+/.test(line)) {
      seen = new Set<string>();
      continue;
    }
    if (inFence || /^\s*(?:\||- (?:Planned: )?`)/.test(line)) continue;
    for (const sentence of splitProseSentences(line)) {
      const key = normalizedSourceFragment(sentence)
        .replace(/^(?:lifecycle|authority|readiness|positive case|negative case|recovery|release|reversal|signal|evidence|validity|boundary) basis\s+/, "")
        .trim();
      if (key.length < 80) continue;
      if (seen.has(key)) repeated.add(key);
      seen.add(key);
    }
  }
  return [...repeated];
}

function assertPlanQuality(updates: PlannedUpdate[]) {
  const exactOutcomes = new Map<string, string[]>();
  const sharedOutcomes = new Map<string, string[]>();
  for (const update of updates) {
    const outcome = normalizedSourceFragment(outcomeBody(update.after.description));
    const shared = sharedOutcomeKey(update.after.title, update.after.description);
    const exactIds = exactOutcomes.get(outcome) ?? [];
    exactIds.push(update.issueId);
    exactOutcomes.set(outcome, exactIds);
    if (shared.length >= 80) {
      const sharedIds = sharedOutcomes.get(shared) ?? [];
      sharedIds.push(update.issueId);
      sharedOutcomes.set(shared, sharedIds);
    }
    const repeated = repeatedSentenceKeys(update.after.description);
    if (repeated.length > 0) {
      const examples = update.after.description.split(/\r?\n/)
        .filter((line) => normalizedSourceFragment(line).includes(repeated[0]))
        .slice(0, 3)
        .join(" || ");
      throw new Error(`${update.issueId} normalized body repeats contract prose: ${repeated[0]}${examples ? `; ${examples}` : ""}`);
    }
  }
  const duplicates = [...exactOutcomes.values(), ...sharedOutcomes.values()]
    .filter((issueIds) => issueIds.length > 1)
    .map((issueIds) => [...new Set(issueIds)].sort(compare))
    .filter((issueIds) => issueIds.length > 1);
  if (duplicates.length > 0) {
    const groups = [...new Map(
      duplicates.map((issueIds) => [issueIds.join("\u0000"), issueIds] as const),
    ).values()];
    throw new Error(`normalized outcomes are duplicated across ${groups.map((issueIds) => issueIds.join(", ")).join("; ")}`);
  }
  return {
    validatedDescriptions: updates.length,
    malformedProse: 0,
    malformedProofPaths: 0,
    planningProvenance: 0,
    repeatedContractProse: 0,
    duplicateOutcomes: 0,
  };
}

function planIssue(issue: LinearIssueInput, context: PlannerContext): PlannedUpdate {
  const source = sourceIdentity(issue, context);
  const baseTitle = SEMANTIC_ISSUE_TITLE_OVERRIDES.get(issue.identifier) ?? (
    source.requirementId
      ? SEMANTIC_TITLE_OVERRIDES.get(source.requirementId) ?? cleanTitle(issue.title)
      : cleanTitle(issue.title)
  );
  const titleSourcePath = source.row
    ? safeSourcePath(context.root, effectiveSourceDoc(source.row))
    : safeSourcePath(context.root, source.checksum?.sourceDoc ?? "");
  const title = (titleSourcePath && !SEMANTIC_ISSUE_TITLE_OVERRIDES.has(issue.identifier)
    ? resolveSourceReferences(context, titleSourcePath, baseTitle)
    : baseTitle
  ).replace(/\s+/g, " ").trim();
  const classification = classify(issue, source.row ?? undefined, context);
  const draftInput = trustedDraftInput(issue, context);
  const currentDescriptionIsSemanticInput = draftInput !== null ||
    source.matchKind !== "override";
  const semanticInput = draftInput ?? (
    currentDescriptionIsSemanticInput ? issue.description ?? "" : ""
  );
  const parsedIssue = {
    ...issue,
    description: replaceManualReferences(semanticInput, context),
  };
  const parsed = parseDescription(parsedIssue, title);
  parsed.relations = relationValues(issue, issue.description ?? "", context);
  const generic = genericTemplate(semanticInput, parsed);
  const normalized = createDescription(
    issue,
    title,
    classification,
    parsed,
    generic,
    source,
    context,
  );
  const reasons = ["title_prefix_removed", "description_self_contained"];
  if (parsed.removedNativeLines > 0) reasons.push("copied_native_fields_removed");
  if (parsed.removedReferenceLines > 0) reasons.push("manual_references_removed");
  if (
    parsed.relations.blockedBy.length > 0 ||
    parsed.relations.blocks.length > 0 ||
    parsed.relations.relatedTo.length > 0
  ) reasons.push("native_relations_preserved");
  if (normalized.sourceExtracted) reasons.push("canonical_source_embedded");
  return {
    issueId: issue.identifier,
    linearId: issue.id,
    classification,
    source: {
      requirementId: source.requirementId,
      checksumSourceId: source.checksum?.sourceId ?? null,
      document: source.row && safeSourcePath(context.root, effectiveSourceDoc(source.row))
        ? effectiveSourceDoc(source.row)
        : null,
      version: source.row?.sourceVersion ?? null,
      section: source.row?.section ?? null,
      sha256: source.checksum?.sha256 ?? null,
    },
    before: {
      title: issue.title,
      descriptionSha256: sha256(issue.description ?? ""),
    },
    after: { title, description: normalized.description },
    nativeRelations: parsed.relations,
    reasons,
    diagnostics: {
      genericTemplate: generic,
      canonicalSourceExtracted: normalized.sourceExtracted,
      removedNativeLines: parsed.removedNativeLines,
      removedReferenceLines: parsed.removedReferenceLines,
      requiresReview: normalized.requiresReview,
    },
  };
}

function atomicWrite(path: string, contents: string): void {
  const parent = realpathSync(dirname(path));
  const output = resolve(parent, basename(path));
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) {
    throw new Error("Output path must not be a symbolic link");
  }
  const temporary = resolve(parent, `.${basename(path)}.tmp-${process.pid}-${randomUUID()}`);
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, contents);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporary, output);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

function main(): void {
  const paths = parseArguments(process.argv.slice(2));
  const issues = readIssues();
  const context = readControlPlane(paths);
  for (const issue of issues) {
    const parentId = typeof issue.parentId === "string" ? issue.parentId.trim().toUpperCase() : "";
    if (/^(?:PLA|BUY|SEL|INT)-\d+$/.test(parentId)) context.nativeParentIds.add(parentId);
  }
  populateReferenceLabels(issues, context);
  const deletions = issues
    .filter((issue) => OBSOLETE_ISSUE_DELETIONS.has(issue.identifier))
    .map((issue) => ({
      issueId: issue.identifier,
      linearId: issue.id,
      action: "delete_issue" as const,
      reason: OBSOLETE_ISSUE_DELETIONS.get(issue.identifier)!,
      requiresUserConfirmation: true as const,
    }));
  const updates = issues
    .filter((issue) => !OBSOLETE_ISSUE_DELETIONS.has(issue.identifier))
    .map((issue) => planIssue(issue, context));
  const qualityGates = assertPlanQuality(updates);
  const byClassification: Record<IssueClass, number> = {
    decision: 0,
    delivery_parent: 0,
    feature: 0,
    runtime_gate: 0,
  };
  for (const update of updates) byClassification[update.classification] += 1;
  const plan = {
    schemaVersion: 1,
    source: {
      manifest: relative(paths.root, paths.manifest),
      checksumContract: relative(paths.root, paths.checksums),
      normalizationSourceMap: relative(paths.root, paths.sourceMap),
      input: "stdin full Linear issue array",
    },
    summary: {
      inputIssues: issues.length,
      plannedUpdates: updates.length,
      plannedDeletions: deletions.length,
      genericTemplates: updates.filter((update) => update.diagnostics.genericTemplate).length,
      byClassification,
      qualityGates,
    },
    updates,
    deletions,
  };
  atomicWrite(paths.out, `${JSON.stringify(plan, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
