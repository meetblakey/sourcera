/**
 * Sourcera Spec-Lint — §M.4.4.2 customer-surface-reachability cross-validator.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4.4.2 (V11 firewall hardening;
 * v7.2.0-REM Phase 2 extension closing D-11.2-004 P0).
 *
 * The cross-validator runs after the §M.4.2 trigger detector and the §M.4.4.1
 * override-grammar parser have completed. It is the "fail-closed" gate for the
 * `@appendix-m-internal-only:` override path: any annotation that passes
 * grammar but fails cross-validation rejects the override and blocks merge.
 *
 * Two-part contract:
 *   (A) Detector-flag pre-merge cross-validation — the annotation's
 *       `{concept_name}` MUST match a concept the §M.4.2 trigger detector
 *       flagged in the same PR diff. Closes the residual D-11.2-004 attack
 *       where a hostile PR submits an override for a concept that does not
 *       appear in the diff at all. Failure → `override_target_not_flagged_by_detector`.
 *   (B) Customer-surface-reachability — four orthogonal predicates evaluated
 *       on the override target. ANY predicate evaluating `true` rejects the
 *       override. Failure → `override_target_customer_visible`.
 *
 * Predicates (per `_audit/REMEDIATION_BACKLOG.md §2 → P0 #5`):
 *   1. Console enum reachability     — §M.4.4.2.B
 *   2. RBAC reachability             — §M.4.4.2.C
 *   3. Plan-tier reachability        — §M.4.4.2.D
 *   4. Surface-class non-internal    — §M.4.4.2.E (default-deny posture)
 *
 * Coverage map: §M.4.4.2.H confirms the v7.2.0-REM predicate set strictly
 * subsumes the V11 predicate set (surface-section / plan-gating / public-API
 * / serializer reachability are each absorbed into one of the four v7.2.0-REM
 * predicates as a sub-check). No V11-detected leak class can pass the
 * v7.2.0-REM check.
 *
 * Runtime artifact for AE-V72REM-02. Wired into `.github/workflows/spec-lint.yml`
 * implementation pack release-orchestration. Owner: spec-ops oncall rotation
 * (PagerDuty schedule `spec-ops-oncall-rotation` per §M.4.6.2).
 *
 * Sign-offs:
 *   - Security Officer (predicate set; §M.4.4.2.B–§M.4.4.2.E correctness)
 *   - Engineering Lead (detector wiring; §M.4.4.2.A integration with trigger
 *     detector at `tools/spec-lint/appendix_m_coverage_on_diff.ts`)
 *
 * See also:
 *   - tools/spec-lint/appendix_m_coverage_on_diff.ts — trigger detector (upstream)
 *   - tools/spec-lint/override_parser.ts — §M.4.4.1 / §M.4.4.5 grammar parser
 *   - tools/spec-lint/internal_only_concept_class_allowlist.json — §M.4.4.2.E sub-check 1
 *   - tools/spec-lint/serializer_redaction_locks.json — §M.4.4.2.E sub-check 4
 *   - tools/spec-lint/anchor_aliases.json — §M.4.2.1 alias-redirect table
 *   - convex/audit/spec_lint_audit_event.ts — §M.4.5.1 AuditEvent serializer
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- Public types --------------------------------------------------------

/**
 * 12-class enumeration of concept classes the §M.4.2 trigger detector emits.
 * Aligned with Appendix J `appendix_m_concept_class` (registered Phase V11).
 */
export type ConceptClass =
  | "entity"
  | "entity_field"
  | "aioperation"
  | "capability_non_ai"
  | "enum_value"
  | "state_machine_state"
  | "plan_tier_feature"
  | "webhook_event"
  | "notification_event"
  | "posthog_event"
  | "api_endpoint"
  | "named_ci_gate";

/**
 * One row of the §M.4.2 trigger detector's output. Emitted by
 * `tools/spec-lint/appendix_m_coverage_on_diff.ts` as part of the
 * `triggered_concepts[]` array per §M.4.5.1 record schema.
 */
export interface DetectedConcept {
  conceptName: string;
  conceptClass: ConceptClass;
  specAnchor: string;
  specLineNumber: number;
}

/**
 * One row of the §M.4.4.1 override-annotation grammar parser's output.
 * Emitted by `tools/spec-lint/override_parser.ts`.
 */
export interface ParsedOverrideAnnotation {
  conceptClass: ConceptClass;
  conceptName: string;
  specAnchor: string;
  targetKey: string;
  rationale: string;
  qualifiers: string[]; // §M.4.4.1 ¶4 cross-class qualifiers
  prDescriptionLineNumber: number;
}

/**
 * One row of the §M.4.4.2.A detector-flag pre-merge cross-validation outcome.
 * Carries the annotation, the join result, and any near-match suggestions.
 */
export interface DetectorFlagOutcome {
  annotation: ParsedOverrideAnnotation;
  outcome: "pass" | "not_flagged_by_detector" | "near_match_only";
  matchedDetectedConcept: DetectedConcept | null;
  nearMatches: DetectedConcept[]; // Levenshtein distance < 5 against any detected concept
}

/**
 * One row of the §M.4.4.2.B–§M.4.4.2.E per-predicate evaluation outcome.
 */
export interface PredicateOutcome {
  predicateId: 1 | 2 | 3 | 4;
  predicateHumanName: string;
  result: boolean; // true = customer-surface reach detected (rejection)
  failingSubCheckId: string | null; // e.g., "B.sub1", "D.sub3"
  failingSubCheckHumanName: string | null;
  evidenceAnchor: string | null;
  evidenceLineNumber: number | null;
  evidenceExcerpt: string | null; // first 120 chars
}

/**
 * §M.4.4.2 per-annotation cross-validation outcome. Surfaced to the
 * §M.4.5.1 AuditEvent record and to the PR inline review comment template
 * at §M.4.4.2.G.
 */
export interface CrossValidationResult {
  annotation: ParsedOverrideAnnotation;
  detectorFlag: DetectorFlagOutcome;
  predicates: PredicateOutcome[]; // length 4; in order [1, 2, 3, 4]
  outcome:
    | "pass"
    | "rejected_detector_flag"
    | "rejected_predicate_1_console_enum"
    | "rejected_predicate_2_rbac"
    | "rejected_predicate_3_plan_tier"
    | "rejected_predicate_4_surface_class";
  rejectionCommentTemplate: "override_target_not_flagged_by_detector" | "override_target_customer_visible" | null;
}

/**
 * Inputs into the cross-validator. The trigger detector and override-grammar
 * parser run upstream and produce these inputs.
 */
export interface CrossValidatorInputs {
  prId: number;
  commitSha: string;
  postEditMasterSpecPath: string;
  preEditMasterSpecPath: string; // merge-base snapshot
  detectedConcepts: DetectedConcept[]; // §M.4.2 trigger detector output
  overrideAnnotations: ParsedOverrideAnnotation[]; // §M.4.4.1 parser output
}

// ---- Internal allowlists / locks (loaded from JSON at boot) ---------------

interface InternalOnlyConceptClassAllowlistEntry {
  conceptClass: ConceptClass;
  internalOnlyKinds: string[];
}

interface SerializerRedactionLock {
  conceptName: string;
  redactedFrom: ("buyer_console" | "seller_console" | "marketplace_public" | "webhook_payload" | "email_template")[];
}

interface AnchorAlias {
  deprecatedAnchor: string;
  canonicalAnchor: string;
  retiredInPhase: string;
  retiredAt: string;
}

function loadAllowlist(path: string): InternalOnlyConceptClassAllowlistEntry[] {
  return JSON.parse(readFileSync(resolve(path), "utf-8"));
}

function loadSerializerLocks(path: string): SerializerRedactionLock[] {
  return JSON.parse(readFileSync(resolve(path), "utf-8"));
}

function loadAnchorAliases(path: string): AnchorAlias[] {
  return JSON.parse(readFileSync(resolve(path), "utf-8"));
}

// ---- Section-range registry ----------------------------------------------

/**
 * Section-range index over the post-edit Master Spec parse tree. Maps each
 * heading anchor to its character-offset range, so predicate sub-checks can
 * scope their substring searches to specific sections.
 *
 * Real impl reads `remark-parse` output. Stub here returns ranges keyed by
 * the canonical section anchors used in §M.4.4.2.B–§M.4.4.2.E.
 */
export interface SectionRange {
  anchor: string;
  startCharOffset: number;
  endCharOffset: number;
  startLineNumber: number;
  endLineNumber: number;
}

export interface SpecParseTree {
  rawText: string;
  sections: Map<string, SectionRange>; // keyed by heading anchor
}

function buildSpecParseTree(specPath: string): SpecParseTree {
  const rawText = readFileSync(resolve(specPath), "utf-8");
  const lines = rawText.split(/\r?\n/);
  const lineStartOffsets = computeLineStartOffsets(rawText);
  const headings: Array<{ level: number; anchor: string; line: number }> = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,6})\s+.*?(?:\s+\{#([^}]+)\})\s*$/.exec(line);
    if (!match) continue;
    const anchor = match[2]?.trim();
    if (!anchor) continue;
    headings.push({ level: match[1]!.length, anchor, line: i + 1 });
  }

  const sections = new Map<string, SectionRange>();
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i]!;
    let nextBoundaryLine = lines.length + 1;
    for (let j = i + 1; j < headings.length; j++) {
      if (headings[j]!.level <= current.level) {
        nextBoundaryLine = headings[j]!.line;
        break;
      }
    }

    const startCharOffset = lineStartOffsets[current.line - 1] ?? 0;
    const endCharOffset =
      nextBoundaryLine <= lines.length
        ? lineStartOffsets[nextBoundaryLine - 1] ?? rawText.length
        : rawText.length;
    const range: SectionRange = {
      anchor: `#${current.anchor}`,
      startCharOffset,
      endCharOffset,
      startLineNumber: current.line,
      endLineNumber: nextBoundaryLine - 1,
    };
    sections.set(current.anchor, range);
    sections.set(`#${current.anchor}`, range);
  }

  return { rawText, sections };
}

function computeLineStartOffsets(text: string): number[] {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") offsets.push(i + 1);
  }
  return offsets;
}

// ---- Anchor-alias resolution (§M.4.2.1) ----------------------------------

function resolveAnchor(name: string, aliases: AnchorAlias[]): string {
  const hit = aliases.find((a) => a.deprecatedAnchor === name);
  return hit ? hit.canonicalAnchor : name;
}

// ---- §M.4.4.2.A Detector-flag pre-merge cross-validation -----------------

const NEAR_MATCH_LEVENSHTEIN_THRESHOLD = 5;

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

// §M.4.4.1 cross-class qualifier-eligible set + broader eligible set.
const QUALIFIER_ELIGIBLE_CLASSES = new Set<ConceptClass>([
  "entity_field",
  "enum_value",
  "webhook_event",
  "notification_event",
  "posthog_event",
  "api_endpoint",
  "named_ci_gate",
]);
const BROADER_ELIGIBLE_CLASSES = new Set<ConceptClass>([
  "entity",
  "aioperation",
  "capability_non_ai",
  "state_machine_state",
  "plan_tier_feature",
]);
const ALL_ELIGIBLE_CLASSES = new Set<ConceptClass>([
  ...QUALIFIER_ELIGIBLE_CLASSES,
  ...BROADER_ELIGIBLE_CLASSES,
]);

export function detectorFlagCrossValidate(
  annotation: ParsedOverrideAnnotation,
  detected: DetectedConcept[],
  aliases: AnchorAlias[]
): DetectorFlagOutcome {
  const annotationAnchor = resolveAnchor(annotation.specAnchor, aliases);

  const exactMatches = detected.filter(
    (d) =>
      d.conceptClass === annotation.conceptClass &&
      d.conceptName === annotation.conceptName &&
      resolveAnchor(d.specAnchor, aliases) === annotationAnchor &&
      ALL_ELIGIBLE_CLASSES.has(d.conceptClass)
  );

  if (exactMatches.length > 0) {
    return {
      annotation,
      outcome: "pass",
      matchedDetectedConcept: exactMatches[0]!,
      nearMatches: [],
    };
  }

  // Compute near-matches for the rejection comment.
  const nearMatches = detected
    .map((d) => ({ d, distance: levenshtein(`${d.conceptClass}::${d.conceptName}@${d.specAnchor}`, annotation.targetKey) }))
    .filter(({ distance }) => distance > 0 && distance < NEAR_MATCH_LEVENSHTEIN_THRESHOLD)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(({ d }) => d);

  return {
    annotation,
    outcome: nearMatches.length > 0 ? "near_match_only" : "not_flagged_by_detector",
    matchedDetectedConcept: null,
    nearMatches,
  };
}

// ---- §M.4.4.2.B–§M.4.4.2.E predicate evaluation --------------------------

/**
 * Section anchors that count as "customer-surface" for Predicate 1 sub-check 1.
 * Mirrors the §M.4.4.2.B sub-check 1 prose verbatim.
 */
const PREDICATE_1_CUSTOMER_SURFACE_ANCHORS = [
  "#3-",
  "#11-",
  "#12-",
  "#13-",
  "#13.11-",
  "#13.12-",
  "#14-",
  "#15-",
  "#16-",
  "#17-",
  "#19-",
  "#20-",
  "#22-",
  "#22.18.6-",
  "#22.20-",
  "#26-",
  "#27-",
  "#29-",
  "#38-",
  "#41-",
  "#44.6-",
  "#48-",
  "#51.3-",
  "#51.4-",
  "#51.5-",
  "#51.6-",
];

/**
 * Console-tagged entity table anchors for Predicate 1 sub-check 2.
 */
const PREDICATE_1_ENTITY_TABLE_ANCHORS = ["#4.3-", "#4.4-", "#4.5-", "#4.7-"];

/**
 * Non-internal auth-scope tokens for Predicate 1 sub-check 3.
 */
const NON_INTERNAL_AUTH_SCOPE_PREFIXES = ["buyer_", "seller_", "marketplace_", "public_pricing_", "webhook_subscriber_"];

/**
 * Predicate 2 RBAC sections.
 */
const PREDICATE_2_RBAC_SECTION_ANCHORS = [
  "#5.2-",
  "#5.3-",
  "#5.5-",
  "#5.6-",
  "#5.11-",
  "#5.2.1.1-",
  "#5.2.1.2-",
  "#5.2.1.3-",
  "#5.2.1.4-",
];

const NON_INTERNAL_ROLES = new Set([
  "org_owner",
  "org_admin",
  "billing_admin",
  "buyer_evaluator",
  "buyer_stakeholder",
  "buyer_guest",
  "buyer_solo_owner",
  "workspace_owner",
  "workspace_admin",
  "workspace_editor",
  "workspace_viewer",
  "use_case_lead",
  "seller_admin",
  "seller_responder",
  "seller_observer",
  "seller_solo_owner",
  "marketplace_publisher",
  "marketplace_visitor",
]);

/**
 * Predicate 3 plan-tier sections.
 */
const PREDICATE_3_PLAN_TIER_SECTION_ANCHORS = [
  "#34.1-",
  "#34.1.1-",
  "#34.1.2-",
  "#34.1.3-",
  "#34.8-",
  "#34.10-",
  "#34.13-",
  "#34.14-",
  "#34.15-",
  "#39-",
  "#44.1-",
  "#44.2-",
  "#44.4-",
  "#44.5-",
  "#44.6-",
];

const PUBLIC_PRICING_API_PATH_TOKENS = ["GET /v1/pricing", "/v1/pricing.capabilities"];

// ---- Predicate runners ----------------------------------------------------

function sectionContains(spec: SpecParseTree, anchorPrefix: string, needle: string): { hit: boolean; lineNumber: number; excerpt: string } {
  const seen = new Set<string>();
  for (const [anchor, range] of spec.sections) {
    if (seen.has(range.anchor)) continue;
    seen.add(range.anchor);
    if (!anchorMatchesPrefix(anchor, anchorPrefix)) continue;
    const slice = spec.rawText.slice(range.startCharOffset, range.endCharOffset);
    const idx = slice.indexOf(needle);
    if (idx >= 0) {
      const lineNumber = range.startLineNumber + slice.slice(0, idx).split("\n").length - 1;
      const excerpt = slice.slice(Math.max(0, idx - 20), idx + Math.min(100, needle.length + 100)).replace(/\n/g, " ");
      return { hit: true, lineNumber, excerpt };
    }
  }
  return { hit: false, lineNumber: -1, excerpt: "" };
}

function anchorMatchesPrefix(anchor: string, anchorPrefix: string): boolean {
  const cleanAnchor = anchor.replace(/^#/, "");
  const cleanPrefix = anchorPrefix.replace(/^#/, "").replace(/-$/, "");
  return (
    cleanAnchor === cleanPrefix ||
    cleanAnchor.startsWith(`${cleanPrefix}-`) ||
    cleanAnchor.startsWith(`${cleanPrefix}.`)
  );
}

function sectionSliceForAnchor(
  spec: SpecParseTree,
  anchor: string
): { text: string; range: SectionRange } | null {
  const normalized = anchor.replace(/^#/, "");
  const range =
    spec.sections.get(anchor) ??
    spec.sections.get(normalized) ??
    spec.sections.get(`#${normalized}`);
  if (!range) return null;
  return {
    text: spec.rawText.slice(range.startCharOffset, range.endCharOffset),
    range,
  };
}

function predicate1ConsoleEnum(annotation: ParsedOverrideAnnotation, spec: SpecParseTree): PredicateOutcome {
  const name = annotation.conceptName;

  // Sub-check 1: inline appearance in customer-surface sections.
  for (const anchor of PREDICATE_1_CUSTOMER_SURFACE_ANCHORS) {
    const r = sectionContains(spec, anchor, name);
    if (r.hit) {
      return {
        predicateId: 1,
        predicateHumanName: "Console enum reachability",
        result: true,
        failingSubCheckId: "B.sub1",
        failingSubCheckHumanName: "Inline appearance in customer-surface sections (§3 / §11–§22 / §26 / §27 / §29 / §38 / §41 / §44.6 / §48 / §51.3–§51.6)",
        evidenceAnchor: anchor,
        evidenceLineNumber: r.lineNumber,
        evidenceExcerpt: r.excerpt.slice(0, 120),
      };
    }
  }

  // Sub-check 2: bound to a console-tagged entity table.
  for (const anchor of PREDICATE_1_ENTITY_TABLE_ANCHORS) {
    const r = sectionContains(spec, anchor, name);
    if (r.hit) {
      return {
        predicateId: 1,
        predicateHumanName: "Console enum reachability",
        result: true,
        failingSubCheckId: "B.sub2",
        failingSubCheckHumanName: "Bound to a console-tagged entity table (§4.3 Buyer / §4.4 Seller / §4.5 Marketplace / §4.7 Bridge)",
        evidenceAnchor: anchor,
        evidenceLineNumber: r.lineNumber,
        evidenceExcerpt: r.excerpt.slice(0, 120),
      };
    }
  }

  // Sub-check 3: cited as a serializer field reachable from non-internal endpoint.
  const section32 = sectionContains(spec, "#32-", name);
  if (section32.hit) {
    // Heuristic: a §32 cite is non-internal-scoped unless the immediate context names ops_ or internal_.
    const contextStart = Math.max(0, section32.lineNumber - 5);
    const contextWindow = spec.rawText.split("\n").slice(contextStart, section32.lineNumber + 5).join("\n");
    const opsScoped = /(?:auth_scope|scope)\s*[:=]\s*["'`]?(?:ops_|internal_)/i.test(contextWindow);
    if (!opsScoped && NON_INTERNAL_AUTH_SCOPE_PREFIXES.some((p) => contextWindow.includes(p))) {
      return {
        predicateId: 1,
        predicateHumanName: "Console enum reachability",
        result: true,
        failingSubCheckId: "B.sub3",
        failingSubCheckHumanName: "Cited as a serializer field reachable from non-internal endpoint (§32 with non-ops auth_scope)",
        evidenceAnchor: "#32-",
        evidenceLineNumber: section32.lineNumber,
        evidenceExcerpt: section32.excerpt.slice(0, 120),
      };
    }
  }

  // Sub-check 4: cited as a Loops.so email template variable.
  const section41 = sectionContains(spec, "#41-", `{{ ${name}`);
  if (section41.hit) {
    return {
      predicateId: 1,
      predicateHumanName: "Console enum reachability",
      result: true,
      failingSubCheckId: "B.sub4",
      failingSubCheckHumanName: "Cited as a Loops.so email template variable (§41)",
      evidenceAnchor: "#41-",
      evidenceLineNumber: section41.lineNumber,
      evidenceExcerpt: section41.excerpt.slice(0, 120),
    };
  }

  return {
    predicateId: 1,
    predicateHumanName: "Console enum reachability",
    result: false,
    failingSubCheckId: null,
    failingSubCheckHumanName: null,
    evidenceAnchor: null,
    evidenceLineNumber: null,
    evidenceExcerpt: null,
  };
}

function predicate2Rbac(annotation: ParsedOverrideAnnotation, spec: SpecParseTree): PredicateOutcome {
  const name = annotation.conceptName;

  // Sub-check 1: §5.11 Feature Access Matrix row.
  const r511 = sectionContains(spec, "#5.11-", name);
  if (r511.hit) {
    return {
      predicateId: 2,
      predicateHumanName: "RBAC reachability",
      result: true,
      failingSubCheckId: "C.sub1",
      failingSubCheckHumanName: "§5.11 Feature Access Matrix row / column / cell",
      evidenceAnchor: "#5.11-",
      evidenceLineNumber: r511.lineNumber,
      evidenceExcerpt: r511.excerpt.slice(0, 120),
    };
  }

  // Sub-check 2 + 4: non-internal role grant or §5.2.1.x permission grant.
  for (const anchor of PREDICATE_2_RBAC_SECTION_ANCHORS) {
    const r = sectionContains(spec, anchor, name);
    if (!r.hit) continue;
    // Check the surrounding context for any non-internal role token.
    const contextStart = Math.max(0, r.lineNumber - 10);
    const contextWindow = spec.rawText.split("\n").slice(contextStart, r.lineNumber + 10).join("\n").toLowerCase();
    if ([...NON_INTERNAL_ROLES].some((role) => contextWindow.includes(role))) {
      return {
        predicateId: 2,
        predicateHumanName: "RBAC reachability",
        result: true,
        failingSubCheckId: "C.sub2_or_sub4",
        failingSubCheckHumanName: "Capability granted to a non-internal role in §5.2 / §5.3 / §5.5 / §5.6 / §5.2.1.x",
        evidenceAnchor: anchor,
        evidenceLineNumber: r.lineNumber,
        evidenceExcerpt: r.excerpt.slice(0, 120),
      };
    }
  }

  // Sub-check 3: capability registry binding (non-ops console_applicability).
  const sectionCapReg = sectionContains(spec, "#4.8.2-", name);
  if (sectionCapReg.hit) {
    const contextStart = Math.max(0, sectionCapReg.lineNumber - 5);
    const contextWindow = spec.rawText.split("\n").slice(contextStart, sectionCapReg.lineNumber + 5).join("\n");
    if (/console_applicability\s*[:=]\s*["'`]?(?:buyer|seller|marketplace_public)/i.test(contextWindow)) {
      return {
        predicateId: 2,
        predicateHumanName: "RBAC reachability",
        result: true,
        failingSubCheckId: "C.sub3",
        failingSubCheckHumanName: "CapabilityRegistryEntry with non-ops console_applicability (§4.8.2 / §21.4 / §22.10)",
        evidenceAnchor: "#4.8.2-",
        evidenceLineNumber: sectionCapReg.lineNumber,
        evidenceExcerpt: sectionCapReg.excerpt.slice(0, 120),
      };
    }
  }

  return {
    predicateId: 2,
    predicateHumanName: "RBAC reachability",
    result: false,
    failingSubCheckId: null,
    failingSubCheckHumanName: null,
    evidenceAnchor: null,
    evidenceLineNumber: null,
    evidenceExcerpt: null,
  };
}

function predicate3PlanTier(annotation: ParsedOverrideAnnotation, spec: SpecParseTree): PredicateOutcome {
  const name = annotation.conceptName;
  for (const anchor of PREDICATE_3_PLAN_TIER_SECTION_ANCHORS) {
    const r = sectionContains(spec, anchor, name);
    if (r.hit) {
      return {
        predicateId: 3,
        predicateHumanName: "Plan-tier reachability",
        result: true,
        failingSubCheckId: anchorToPredicate3SubCheckId(anchor),
        failingSubCheckHumanName: `Plan-tier reach at ${anchor} (per §M.4.4.2.D sub-check set)`,
        evidenceAnchor: anchor,
        evidenceLineNumber: r.lineNumber,
        evidenceExcerpt: r.excerpt.slice(0, 120),
      };
    }
  }
  // Sub-check 6: Public Pricing API path tokens.
  for (const token of PUBLIC_PRICING_API_PATH_TOKENS) {
    const idx = spec.rawText.indexOf(token);
    if (idx >= 0 && spec.rawText.slice(idx, idx + 4000).includes(name)) {
      const lineNumber = spec.rawText.slice(0, idx).split("\n").length;
      return {
        predicateId: 3,
        predicateHumanName: "Plan-tier reachability",
        result: true,
        failingSubCheckId: "D.sub6",
        failingSubCheckHumanName: "Public Pricing API (`GET /v1/pricing` / `GET /v1/pricing.capabilities[]`) field per §32.8",
        evidenceAnchor: "#32.8-",
        evidenceLineNumber: lineNumber,
        evidenceExcerpt: spec.rawText.slice(idx, idx + 120).replace(/\n/g, " "),
      };
    }
  }
  return {
    predicateId: 3,
    predicateHumanName: "Plan-tier reachability",
    result: false,
    failingSubCheckId: null,
    failingSubCheckHumanName: null,
    evidenceAnchor: null,
    evidenceLineNumber: null,
    evidenceExcerpt: null,
  };
}

function anchorToPredicate3SubCheckId(anchor: string): string {
  if (anchor.startsWith("#34.1")) return "D.sub1";
  if (anchor.startsWith("#34.8")) return "D.sub2";
  if (anchor.startsWith("#34.10") || anchor.startsWith("#34.13") || anchor.startsWith("#34.14") || anchor.startsWith("#34.15")) return "D.sub3";
  if (anchor.startsWith("#39")) return "D.sub4";
  if (anchor.startsWith("#44")) return "D.sub5";
  return "D.sub_unknown";
}

function predicate4SurfaceClass(
  annotation: ParsedOverrideAnnotation,
  detectedMatch: DetectedConcept,
  spec: SpecParseTree,
  allowlist: InternalOnlyConceptClassAllowlistEntry[],
  serializerLocks: SerializerRedactionLock[]
): PredicateOutcome {
  const name = annotation.conceptName;

  // Sub-check 1: canonical internal-only concept-class allowlist match.
  const allowlistEntry = allowlist.find((e) => e.conceptClass === detectedMatch.conceptClass);
  if (allowlistEntry) {
    const kindRegex = new RegExp(allowlistEntry.internalOnlyKinds.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"));
    const matchedKind = kindRegex.test(annotation.rationale);
    if (matchedKind) {
      return makeNonInternalFalse(); // Predicate evaluates `false` (internal-only confirmed)
    }
  }

  // Sub-check 2: Ops-Console-exclusive surface. Check that the concept appears ONLY in §50 or in internal_ops-bound entities.
  const opsConsoleHit = sectionContains(spec, "#50-", name);
  if (opsConsoleHit.hit) {
    // Also require absence from §22 / §22.20 / §27 customer-surface sections.
    const customerSurfaceLeak = ["#22-", "#22.20-", "#27-", "#26-"].some((a) => sectionContains(spec, a, name).hit);
    if (!customerSurfaceLeak) {
      return makeNonInternalFalse();
    }
  }

  // Sub-check 3: spec-side internal-only attestation paragraph.
  const attestationRegex = new RegExp(
    `\\*\\*Internal-only construct\\.\\*\\*\\s+\\b${escapeRegex(name)}\\b.+never serialized to any customer console`,
    "s"
  );
  const introducingSection = sectionSliceForAnchor(spec, detectedMatch.specAnchor);
  if (introducingSection && attestationRegex.test(introducingSection.text)) {
    return makeNonInternalFalse();
  }

  // Sub-check 4: explicit serializer-redaction lock with all 5 surfaces covered.
  const lock = serializerLocks.find((l) => l.conceptName === name);
  if (lock) {
    const requiredCoverage = ["buyer_console", "seller_console", "marketplace_public", "webhook_payload", "email_template"];
    const fullyCovered = requiredCoverage.every((s) => lock.redactedFrom.includes(s as any));
    if (fullyCovered) {
      return makeNonInternalFalse();
    }
  }

  // Default-deny: no affirmative internal-only sub-check matched → reject.
  return {
    predicateId: 4,
    predicateHumanName: "Surface-class non-internal",
    result: true,
    failingSubCheckId: "E.default_deny",
    failingSubCheckHumanName:
      "No affirmative internal-only attestation found. The author must satisfy ONE of: (1) allowlist match, (2) Ops-Console-exclusive surface, (3) spec-side internal-only attestation paragraph, (4) explicit serializer-redaction lock with full 5-surface coverage.",
    evidenceAnchor: null,
    evidenceLineNumber: null,
    evidenceExcerpt: null,
  };
}

function makeNonInternalFalse(): PredicateOutcome {
  return {
    predicateId: 4,
    predicateHumanName: "Surface-class non-internal",
    result: false,
    failingSubCheckId: null,
    failingSubCheckHumanName: null,
    evidenceAnchor: null,
    evidenceLineNumber: null,
    evidenceExcerpt: null,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- Cross-validator orchestration ----------------------------------------

export interface CrossValidatorConfig {
  internalOnlyAllowlistPath: string; // default: tools/spec-lint/internal_only_concept_class_allowlist.json
  serializerLocksPath: string; // default: tools/spec-lint/serializer_redaction_locks.json
  anchorAliasesPath: string; // default: tools/spec-lint/anchor_aliases.json
}

export function runCrossValidator(
  inputs: CrossValidatorInputs,
  config: CrossValidatorConfig
): CrossValidationResult[] {
  const allowlist = loadAllowlist(config.internalOnlyAllowlistPath);
  const serializerLocks = loadSerializerLocks(config.serializerLocksPath);
  const aliases = loadAnchorAliases(config.anchorAliasesPath);
  const spec = buildSpecParseTree(inputs.postEditMasterSpecPath);

  const results: CrossValidationResult[] = [];

  for (const annotation of inputs.overrideAnnotations) {
    // Step A: detector-flag pre-merge cross-validation.
    const detectorFlag = detectorFlagCrossValidate(annotation, inputs.detectedConcepts, aliases);

    if (detectorFlag.outcome !== "pass") {
      results.push({
        annotation,
        detectorFlag,
        predicates: [], // not run; short-circuited
        outcome: "rejected_detector_flag",
        rejectionCommentTemplate: "override_target_not_flagged_by_detector",
      });
      continue;
    }

    // Step B–E: customer-surface-reachability predicates.
    const matched = detectorFlag.matchedDetectedConcept!;
    const p1 = predicate1ConsoleEnum(annotation, spec);
    const p2 = predicate2Rbac(annotation, spec);
    const p3 = predicate3PlanTier(annotation, spec);
    const p4 = predicate4SurfaceClass(annotation, matched, spec, allowlist, serializerLocks);

    const predicates = [p1, p2, p3, p4];
    const firstFailing = predicates.find((p) => p.result);

    if (firstFailing) {
      const outcomeKey = (
        {
          1: "rejected_predicate_1_console_enum",
          2: "rejected_predicate_2_rbac",
          3: "rejected_predicate_3_plan_tier",
          4: "rejected_predicate_4_surface_class",
        } as const
      )[firstFailing.predicateId];
      results.push({
        annotation,
        detectorFlag,
        predicates,
        outcome: outcomeKey,
        rejectionCommentTemplate: "override_target_customer_visible",
      });
    } else {
      results.push({
        annotation,
        detectorFlag,
        predicates,
        outcome: "pass",
        rejectionCommentTemplate: null,
      });
    }
  }

  return results;
}

// ---- Exit-code mapping (CI integration) ----------------------------------

/**
 * Maps a set of cross-validation results to a CI exit code. Fail-closed:
 * any rejection causes exit 1; full pass causes exit 0. The detector-flag
 * pre-merge failure and the customer-surface-reach failure both map to
 * exit 1 (block merge). The §M.4.5.1 AuditEvent emit is performed by the
 * caller (`convex/audit/spec_lint_audit_event.ts`) per §M.4.5 contract.
 */
export function resultsToExitCode(results: CrossValidationResult[]): 0 | 1 {
  return results.some((r) => r.outcome !== "pass") ? 1 : 0;
}

// ---- Self-test fixtures (unit-test consumers) ----------------------------

export const __TEST_HOOKS__ = {
  levenshtein,
  resolveAnchor,
  predicate1ConsoleEnum,
  predicate2Rbac,
  predicate3PlanTier,
  predicate4SurfaceClass,
  detectorFlagCrossValidate,
  buildSpecParseTree,
};
