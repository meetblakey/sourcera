/**
 * Sourcera Spec-Lint — `appendix_k_glossary_canonicality` CI gate detector.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5 catalog row
 * `appendix_k_glossary_canonicality` (Phase 2V audit remediation, 2026-05-03;
 * runtime wiring promoted to `runtime_active` at v7.2.0-REM Phase 2 closure
 * 2026-05-18). Cross-reference: Appendix K authoring note (Master Spec
 * line 49594-area); Phase 12.3 amendment ("Appendix K is the canonical
 * Glossary; Appendix B is the Keyboard Shortcut Reference").
 *
 * Defect closure: D-AK-001, D-AK-002, D-AK-003 (P0 ci_gate cluster);
 * D-2V-002 (P2 documentation_gap — matcher specification authored on-spec
 * 2026-05-03, runtime authored here 2026-05-18). AE ratification: AE-12.3-12
 * (Engineering counter-signature 2026-05-18 at v7.2.0-REM Phase 2 closure).
 *
 * ============================================================================
 * GATE SCOPE
 * ============================================================================
 *
 * The gate asserts the canonicality contract:
 *
 *   "Appendix K — not Appendix B — is the canonical Glossary in
 *    Sourcera_Master_Spec.md. Every spec-body authoring instruction,
 *    glossary-registration directive, and acceptance-criterion citation
 *    that adds, registers, or routes a Glossary term MUST resolve to
 *    'Appendix K Glossary'. Appendix B remains the Keyboard Shortcut
 *    Reference."
 *
 * Two input domains are scanned:
 *
 *   (1) Sourcera_Master_Spec.md, sections §1 through §51 (line range derived
 *       at runtime from `# N\. Title` top-level headings; the appendices
 *       A–M starting at the first `## Appendix ` heading are EXCLUDED from
 *       scope — Appendix B's own keyboard-shortcut body content is not
 *       a violation).
 *
 *   (2) _integration/RECONCILIATION.md, but ONLY entries dated 2026-04-26
 *       or later. The 2026-04-26 boundary is the Phase 12.3 amendment date
 *       per the Appendix K authority rule in AGENTS.md. Historical reconciliation
 *       entries authored before Phase 12.3 were correctly written against
 *       the pre-amendment convention (Appendix B was the named Glossary
 *       slot) and MUST NOT be retroactively flagged.
 *
 * ============================================================================
 * MATCHER REGEX SET (per §M.5 catalog row)
 * ============================================================================
 *
 * The on-spec matcher is a 3-pattern set:
 *
 *   (a) /Appendix\s+B\s+(Glossary|glossary entry|glossary)/
 *       — direct misdirection literal. Triggered the original D-AK-001 /
 *       D-AK-003 hits at §5.2.1 L9010 and §34/§48 L34243.
 *
 *   (b) /every\s+new\s+term\s+lands?\s+in\s+Appendix\s+B/i  (case-insensitive)
 *       — authoring-intent directive form. Triggered the original D-AK-002
 *       hit at §22 L15018.
 *
 *   (c) /(?:add(?:ed)?|register(?:ed)?)\s+to\s+Appendix\s+B/
 *       — registration-directive form. Defensive: catches "added to
 *       Appendix B", "added to Appendix B as", "register to Appendix B",
 *       "registered to Appendix B" wording variants.
 *
 * ============================================================================
 * ALLOW-LIST EXEMPTIONS (per §M.5 catalog row)
 * ============================================================================
 *
 *   (A) Cross-doc citation form `Appendix B of <doc>.md` per the spec-body
 *       convention at Master Spec L1197 — these are pointers to OTHER
 *       documents' Appendix B sections, not Sourcera Appendix B as
 *       Glossary. The exemption uses look-ahead: the match is exempt if
 *       the next non-whitespace token after "Appendix B" is the word "of"
 *       (followed by a document filename).
 *
 *   (B) Appendix B body context — already excluded by section-range scoping
 *       (the detector does not enter the appendix range), but for
 *       defensive completeness if the section-range exclusion fails the
 *       in-body keyboard-shortcut content explicitly identifies itself
 *       as such within a 200-character window upstream.
 *
 *   (C) Paired Phase-12.3 amendment notes that explicitly contrast
 *       "Appendix B (Keyboard Shortcut Reference)" with "Appendix K
 *       (canonical Glossary)" — the line containing the contrast pairing
 *       is exempt. Match heuristic: same line contains both the literal
 *       "Appendix B" and either "Keyboard Shortcut Reference" or
 *       "Phase 12.3" amendment hint. These contrast notes are the
 *       canonical way new contributors learn the routing rule and must
 *       not be self-flagged.
 *
 *   (D) The §M.5 catalog row for this very gate, which by necessity
 *       quotes "Appendix B Glossary" inside the matcher description as
 *       the negative example. The exemption is achieved by section-range
 *       exclusion (Appendix M is outside §1–§51 scope), but a redundant
 *       text-match exemption guards against future re-anchoring of the
 *       row.
 *
 *   (E) Quoted historical-snapshot prose that explicitly cites a
 *       pre-Phase-12.3 RECONCILIATION date in the same sentence — these
 *       are historical-state references and must not be flagged. The
 *       exemption is opt-in (the line must contain a date < 2026-04-26
 *       AND the literal "historical" or "pre-amendment").
 *
 * ============================================================================
 * RECONCILIATION.MD DATE-WINDOW LOGIC
 * ============================================================================
 *
 * RECONCILIATION.md sections are typically rooted at `### Phase N — ...`
 * headings. For each such heading the detector walks forward up to the
 * next sibling-level heading and extracts the most reliable date signal,
 * in priority order:
 *
 *   1. `(closed YYYY-MM-DD)` parenthetical in the heading itself
 *      (canonical form for the v7.0.0+ program).
 *   2. `**Date authored.**` / `**Phase close date.**` / `**Authored.**`
 *      bolded leading body line.
 *   3. Any `YYYY-MM-DD` ISO-8601 substring within the first 40 lines of
 *      the section body.
 *
 * The section is `in-scope` (subject to matcher flagging) iff the
 * extracted date ≥ 2026-04-26. Sections with no extractable date default
 * to `out-of-scope` (fail-safe: a missing date should not cause spurious
 * flags on pre-amendment historical content — but the absence of a date
 * on a v7.0.0+ entry is a separate documentation defect tracked
 * elsewhere).
 *
 * ============================================================================
 * FAILURE MODES
 * ============================================================================
 *
 * Per §M.4.3 the gate has six deterministic statuses; this detector emits
 * a subset:
 *
 *   - `pass`                   — zero non-exempt matches.
 *   - `fail`                   — ≥1 non-exempt match in either input
 *                                domain.
 *   - `parse_error`            — file read failure or section-range
 *                                computation failure; not override-eligible
 *                                per §M.4.3.
 *   - `comment_post_failed`    — emitted by `comment_poster.ts` downstream;
 *                                fail-closed per §M.4.3.1.
 *
 * On fail, one inline PR review comment is emitted per non-exempt match
 * with: source path, line number, matched substring, regex pattern key
 * (a/b/c), recommended replacement ("Appendix K Glossary"), and a link to
 * the §M.5 catalog row for context.
 *
 * ============================================================================
 * OVERRIDE PATH
 * ============================================================================
 *
 * Per the §M.4.4.5 sibling override grammar, this gate uses the
 * `@ci-gate-override: appendix_k_glossary_canonicality — <rationale ≥ 60 chars>`
 * annotation form. The only standing rationale class is "deliberate
 * Phase-12.3 contrast" (e.g., new amendment-note authoring that needs
 * to quote the misdirection literal to teach the routing rule). The
 * §M.4.4.5 grammar parser validates rationale length and merges the
 * override into the audit trail.
 *
 * Override is NOT permitted for the three legacy P0 hit patterns (Billing
 * Admin Glossary directive, §22 KB-rewrite authoring intent, R6 brand-voice
 * citation). Those are closed-on-spec at v7.2.0-REM Phase 2 closure and
 * any reintroduction is a regression — `override_target_customer_visible`
 * is the appropriate failure code if a hostile PR attempts to re-add them.
 *
 * ============================================================================
 * RUNTIME STATUS
 * ============================================================================
 *
 * Promoted to `runtime_active` at v7.2.0-REM Phase 2 closure (2026-05-18).
 * Implementation pack: release-orchestration (per AGENTS.md + §M.5.5
 * per-row runtime-status assignment table). Stack alignment: GitHub
 * Actions (existing `.github/workflows/spec-lint.yml`); Convex AuditEvent;
 * PostHog `spec_lint.appendix_m_gate_run` event (schema reused — gate-id
 * dimension `appendix_k_glossary_canonicality`); Datadog `spec-lint`
 * service; Slack `#spec-ops` nightly digest; PagerDuty
 * `spec-ops-oncall-rotation` reviewer schedule; Loops.so
 * `lo_spec_ops_digest` fallback.
 *
 * See also:
 *   - tools/spec-lint/cross_validation.ts — §M.4.4.2 cross-validator (sibling).
 *   - tools/spec-lint/override_parser.ts  — §M.4.4.1 grammar parser.
 *   - tools/spec-lint/anchor_aliases.json — §M.4.2.1 alias-redirect table.
 *   - .github/workflows/spec-lint.yml     — workflow wiring.
 *   - _audit/PHASE_V72REM_PHASE_3_VERIFY.md — Phase 2 closure verify log.
 *
 * Sign-offs (v7.2.0-REM Phase 2 closure 2026-05-18):
 *   - Engineering Lead — matcher specification, scope boundaries, allow-list
 *     correctness, regression-prevention posture.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- Public types --------------------------------------------------------

export type SourceDomain = "master_spec" | "reconciliation";

/**
 * Identifier for the three matcher patterns from the §M.5 catalog row.
 * `a` = `/Appendix\s+B\s+(Glossary|glossary entry|glossary)/`
 * `b` = `/every\s+new\s+term\s+lands?\s+in\s+Appendix\s+B/i`
 * `c` = `/(?:add(?:ed)?|register(?:ed)?)\s+to\s+Appendix\s+B/`
 */
export type MatcherKey = "a" | "b" | "c";

export interface DetectedMatch {
  domain: SourceDomain;
  filePath: string;
  lineNumber: number; // 1-indexed.
  columnNumber: number; // 1-indexed character offset within the line.
  matcherKey: MatcherKey;
  matchedSubstring: string;
  lineText: string;
  sectionAnchor: string | null; // best-effort identifying section header.
  exempted: boolean;
  exemptionReason: ExemptionReason | null;
}

export type ExemptionReason =
  | "cross_doc_citation_appendix_b_of"
  | "phase_12_3_contrast_pairing"
  | "m5_catalog_self_reference"
  | "historical_pre_amendment_quote"
  | "section_range_out_of_scope_master_spec"
  | "section_range_out_of_scope_reconciliation_pre_amendment";

export type GateOutcome = "pass" | "fail" | "parse_error";

export interface GateResult {
  outcome: GateOutcome;
  matches: DetectedMatch[]; // all matches, including exempted ones (for audit-trail completeness).
  nonExemptMatches: DetectedMatch[]; // only the merge-blocking subset.
  parseErrors: ParseError[];
  runMetadata: GateRunMetadata;
}

export interface ParseError {
  filePath: string;
  reason: string;
  recoverable: false; // §M.4.3 — parse_error is non-overridable.
}

export interface GateRunMetadata {
  gateId: "appendix_k_glossary_canonicality";
  runStartedAtIso: string;
  runFinishedAtIso: string;
  masterSpecLineCount: number;
  masterSpecSectionRange: { startLine: number; endLine: number };
  reconciliationInScopeSectionCount: number;
  reconciliationOutOfScopeSectionCount: number;
}

// ---- Constants -----------------------------------------------------------

/**
 * Phase 12.3 amendment date — the canonical boundary between pre-amendment
 * historical content (Appendix B was the named Glossary slot) and the
 * v7.0.0+ corpus (Appendix K is the canonical Glossary).
 *
 * Per the Appendix K authority rule in AGENTS.md +
 * Master Spec Appendix K authoring note + _integration/RECONCILIATION.md
 * Phase 12.3 block.
 */
export const PHASE_12_3_AMENDMENT_ISO_DATE = "2026-04-26";

/**
 * 3-pattern matcher set per the §M.5 catalog row.
 *
 * Pattern (a) — direct misdirection literal. The capture group enumerates
 * three trailing forms: "Glossary", "glossary entry", "glossary". The
 * second variant exists because R6-style acceptance criteria sometimes
 * say "Appendix B Glossary entry `<key>`" rather than the bare form.
 *
 * Pattern (b) — case-insensitive authoring-intent directive form. Matches
 * the §22 v7.0.0 KB-rewrite original prose "every new term lands in
 * Appendix B; every new enum lands in Appendix J." Also matches
 * "every new term land in Appendix B" (the `s?` accommodates the typo
 * variant). Case-insensitive per the §M.5 catalog row.
 *
 * Pattern (c) — registration-directive form. Matches "added to Appendix B",
 * "added to Appendix B as ...", "register to Appendix B", "registered to
 * Appendix B". The non-capturing alternation collapses the four word
 * forms.
 *
 * All patterns are intentionally bounded to "Appendix B" — they do NOT
 * match "Appendix B (Keyboard Shortcut Reference)" because the next token
 * after the literal "B" in those legitimate cases is whitespace followed
 * by an open parenthesis, not the words "Glossary" / "lands in" / "added
 * to" / "registered to" that the three patterns each require.
 */
export const MATCHERS: ReadonlyArray<{ key: MatcherKey; pattern: RegExp; description: string }> = [
  {
    key: "a",
    pattern: /Appendix\s+B\s+(Glossary|glossary entry|glossary)/g,
    description: "Direct misdirection literal — 'Appendix B Glossary' / 'Appendix B Glossary entry' / 'Appendix B glossary'.",
  },
  {
    key: "b",
    pattern: /every\s+new\s+term\s+lands?\s+in\s+Appendix\s+B/gi,
    description: "Authoring-intent directive — 'every new term lands in Appendix B' (case-insensitive).",
  },
  {
    key: "c",
    pattern: /(?:add(?:ed)?|register(?:ed)?)\s+to\s+Appendix\s+B/g,
    description: "Registration directive — 'added to Appendix B' / 'registered to Appendix B'.",
  },
];

// ---- Master Spec section-range computation --------------------------------

/**
 * Computes the [startLine, endLine] range of §1–§51 in Sourcera_Master_Spec.md.
 *
 * - Start = the line number of the first `# N\. Title` top-level heading
 *   where N is a positive integer (§1 Product Overview).
 * - End = (the line number of the first `## Appendix ` heading) - 1.
 *
 * The line numbers are 1-indexed.
 *
 * If either anchor is missing the function throws a parse_error per
 * §M.4.3. Returns `null` ONLY when the file is well-formed but the
 * appendices precede the body sections (corrupt or under-construction
 * spec) — caller MUST treat that as parse_error.
 */
export function computeMasterSpecBodyRange(rawText: string): {
  startLine: number;
  endLine: number;
} {
  const lines = rawText.split("\n");
  let startLine: number | null = null;
  let endLine: number | null = null;

  // The top-level `# N\. Title` heading uses Markdown-escaped numbering
  // (e.g., `# 1\. Product Overview`). The leading character is a literal
  // `#` followed by a single space.
  const topSectionHeading = /^# \d+\\\. /;
  // Appendix headings begin with `## Appendix ` followed by a letter.
  const appendixHeading = /^## Appendix [A-Z][:\s—-]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (startLine === null && topSectionHeading.test(line)) {
      startLine = i + 1;
    }
    if (startLine !== null && appendixHeading.test(line)) {
      endLine = i; // The line BEFORE the appendix is the last in-scope line.
      break;
    }
  }

  if (startLine === null) {
    throw new Error("computeMasterSpecBodyRange: no top-level numbered section heading found (expected '# N\\. ...').");
  }
  if (endLine === null) {
    throw new Error("computeMasterSpecBodyRange: no '## Appendix ' heading found after the body sections.");
  }
  if (endLine < startLine) {
    throw new Error(
      `computeMasterSpecBodyRange: appendix heading (line ${endLine + 1}) precedes first body section (line ${startLine}); spec is malformed.`
    );
  }
  return { startLine, endLine };
}

// ---- RECONCILIATION.md section walker -------------------------------------

export interface ReconciliationSection {
  headingLine: number; // 1-indexed line number of the `### Phase ...` heading.
  endLine: number; // 1-indexed line number of the section's last line.
  headingText: string;
  extractedDateIso: string | null;
  inScope: boolean; // true iff extractedDateIso ≥ PHASE_12_3_AMENDMENT_ISO_DATE.
}

const ISO_DATE_REGEX = /(20\d{2}-\d{2}-\d{2})/;

/**
 * Walks RECONCILIATION.md and emits one ReconciliationSection per
 * `### Phase ...` heading. Each section spans from its heading line to
 * the line BEFORE the next `### ` (any subject) or `## ` (program-level)
 * heading — whichever comes first. The terminal section ends at EOF.
 *
 * Date extraction precedence per the file header:
 *   1. `(closed YYYY-MM-DD)` / `(YYYY-MM-DD)` parenthetical in the heading.
 *   2. The first ISO-8601 date in the first 40 body lines.
 *
 * Sections with no extractable date default to `inScope: false` per the
 * fail-safe posture.
 */
export function walkReconciliationSections(rawText: string): ReconciliationSection[] {
  const lines = rawText.split("\n");
  const sectionHeading = /^### /;
  const programHeading = /^## /;
  const sections: ReconciliationSection[] = [];

  const headingIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (sectionHeading.test(lines[i]!)) headingIndices.push(i);
  }

  for (let h = 0; h < headingIndices.length; h++) {
    const start = headingIndices[h]!;
    // Section end is one line before the NEXT `### ` heading OR the next
    // `## ` program-level heading OR EOF.
    let end = lines.length - 1;
    for (let j = start + 1; j < lines.length; j++) {
      if (sectionHeading.test(lines[j]!) || programHeading.test(lines[j]!)) {
        end = j - 1;
        break;
      }
    }

    const headingText = lines[start]!;
    let extractedDateIso: string | null = null;

    // Priority 1: date in the heading itself.
    const headingMatch = headingText.match(ISO_DATE_REGEX);
    if (headingMatch) {
      extractedDateIso = headingMatch[1]!;
    } else {
      // Priority 2: first ISO date in the first 40 body lines after heading.
      const scanCeiling = Math.min(end, start + 40);
      for (let j = start + 1; j <= scanCeiling; j++) {
        const m = lines[j]!.match(ISO_DATE_REGEX);
        if (m) {
          extractedDateIso = m[1]!;
          break;
        }
      }
    }

    sections.push({
      headingLine: start + 1,
      endLine: end + 1,
      headingText,
      extractedDateIso,
      inScope: extractedDateIso !== null && extractedDateIso >= PHASE_12_3_AMENDMENT_ISO_DATE,
    });
  }

  return sections;
}

// ---- Exemption evaluation ------------------------------------------------

/**
 * Returns the ExemptionReason if `line` containing `matchedSubstring` at
 * `matchStartCol` should be exempted per allow-list rules (A)–(E) in the
 * header comment, or `null` if the match is non-exempt.
 *
 * Allow-list (A) — cross-doc citation `Appendix B of <doc>.md`. Heuristic:
 * the next non-whitespace token AFTER the "Appendix B" substring is the
 * literal word "of". The detector only applies (A) to matcher (a) hits;
 * (b) and (c) by construction do not collide with the "of" form.
 *
 * Allow-list (C) — paired Phase-12.3 amendment notes. Heuristic: the
 * SAME line contains both the literal "Appendix B" (already matched) AND
 * the substring "Keyboard Shortcut Reference" within a 200-character
 * window, OR the substring "Phase 12.3" within the same window, OR the
 * substring "canonical Glossary per Phase 12.3 amendment". These are the
 * teaching-the-rule contrast notes.
 *
 * Allow-list (D) — §M.5 catalog row self-reference. Heuristic: the line
 * contains the literal "appendix_k_glossary_canonicality" backtick-quoted
 * gate identifier (the row narrates its own matcher), OR the line is
 * inside the §M.5.13 / §M.5.4 / §M.5.X catalog table within Appendix M.
 * Since the detector's section-range scoping already excludes Appendix M
 * from the Master Spec scan, this exemption is redundant for that domain
 * but is preserved for the RECONCILIATION.md scan where the catalog row
 * is sometimes quoted verbatim.
 *
 * Allow-list (E) — historical-snapshot quoted prose. Heuristic: the same
 * line contains an ISO date < PHASE_12_3_AMENDMENT_ISO_DATE AND one of
 * the markers "historical", "pre-amendment", "v6.0.0", or "pre-Phase 12.3".
 */
export function evaluateExemption(
  matcherKey: MatcherKey,
  line: string,
  matchStartCol: number
): ExemptionReason | null {
  // (A) Cross-doc citation — only relevant for matcher (a).
  if (matcherKey === "a") {
    const afterMatch = line.slice(matchStartCol);
    // "Appendix B of <doc>" — the matched substring's "Glossary" suffix
    // by definition rules out the (A) form because matcher (a) requires
    // "Glossary" / "glossary entry" / "glossary" to follow "Appendix B".
    // However, defensively: if a future spec edit writes "Appendix B
    // Glossary of <doc>.md" — the literal-misdirection form embedded in
    // a cross-doc cite — the canonicality contract still considers that
    // a defect (because Sourcera does not have an Appendix B Glossary at
    // all). So (A) intentionally does NOT exempt matcher (a) hits.
    void afterMatch;
  }

  // (B) — section-range exclusion handled upstream; nothing to do here.

  // (C) Phase-12.3 amendment-note contrast pairing.
  const lineLower = line.toLowerCase();
  const hasKeyboardShortcutReferenceMarker = lineLower.includes("keyboard shortcut reference");
  const hasPhase123Marker = lineLower.includes("phase 12.3");
  const hasCanonicalGlossaryContrastMarker =
    lineLower.includes("canonical glossary") || lineLower.includes("appendix k") || lineLower.includes("canonical Glossary".toLowerCase());
  const hasContrastPairing =
    hasKeyboardShortcutReferenceMarker ||
    (hasPhase123Marker && hasCanonicalGlossaryContrastMarker);
  if (hasContrastPairing) {
    return "phase_12_3_contrast_pairing";
  }

  // (D) §M.5 catalog self-reference.
  if (line.includes("appendix_k_glossary_canonicality")) {
    return "m5_catalog_self_reference";
  }

  // (E) Historical-snapshot quoted prose. Triggered only when the same
  // line contains a pre-amendment date AND a historical-marker token.
  const dateMatch = line.match(ISO_DATE_REGEX);
  if (dateMatch && dateMatch[1]! < PHASE_12_3_AMENDMENT_ISO_DATE) {
    const hasHistoricalMarker =
      lineLower.includes("historical") ||
      lineLower.includes("pre-amendment") ||
      lineLower.includes("v6.0.0") ||
      lineLower.includes("pre-phase 12.3");
    if (hasHistoricalMarker) {
      return "historical_pre_amendment_quote";
    }
  }

  return null;
}

// ---- Section-anchor lookup (best-effort) ---------------------------------

/**
 * Returns the best-effort section-anchor identifier for a 1-indexed line
 * in Sourcera_Master_Spec.md. Walks backward from the line to find the
 * nearest preceding heading (any of `^## N.N`, `^### N.N.N`, `^# N\.`).
 *
 * Pure heuristic — used only for the inline review-comment text. The
 * gate decision does not depend on this value.
 */
export function nearestSectionAnchor(lines: string[], lineNumber: number): string | null {
  // Walk backward from lineNumber-1 (0-indexed) to 0.
  for (let i = lineNumber - 1; i >= 0; i--) {
    const line = lines[i]!;
    const m =
      line.match(/^#{1,4}\s+(\d+(?:\.\d+){0,3})/) ||
      line.match(/^#{1,4}\s+(Appendix\s+[A-Z])/);
    if (m) return m[1]!;
  }
  return null;
}

// ---- Master Spec scan -----------------------------------------------------

export function scanMasterSpec(specPath: string, rawText?: string): DetectedMatch[] {
  const text = rawText ?? readFileSync(resolve(specPath), "utf-8");
  const lines = text.split("\n");
  const range = computeMasterSpecBodyRange(text);
  const matches: DetectedMatch[] = [];

  for (let lineIdx = range.startLine - 1; lineIdx < range.endLine; lineIdx++) {
    const lineText = lines[lineIdx]!;
    for (const { key, pattern } of MATCHERS) {
      // Reset stateful global regex per-line.
      pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(lineText)) !== null) {
        const exemptionReason = evaluateExemption(key, lineText, m.index);
        matches.push({
          domain: "master_spec",
          filePath: specPath,
          lineNumber: lineIdx + 1,
          columnNumber: m.index + 1,
          matcherKey: key,
          matchedSubstring: m[0],
          lineText,
          sectionAnchor: nearestSectionAnchor(lines, lineIdx + 1),
          exempted: exemptionReason !== null,
          exemptionReason,
        });
        // Guard against zero-width matches — bump lastIndex if pattern
        // happened to match an empty string.
        if (m.index === pattern.lastIndex) pattern.lastIndex++;
      }
    }
  }

  return matches;
}

// ---- RECONCILIATION scan -------------------------------------------------

export function scanReconciliation(reconciliationPath: string, rawText?: string): DetectedMatch[] {
  const text = rawText ?? readFileSync(resolve(reconciliationPath), "utf-8");
  const lines = text.split("\n");
  const sections = walkReconciliationSections(text);
  const matches: DetectedMatch[] = [];

  // Build an interval map so we can ask "is line L in scope?".
  // Lines outside any `### Phase ...` section (e.g., the top-of-file
  // program preamble) default to out-of-scope per the fail-safe posture.
  const inScopeRanges: Array<{ start: number; end: number; headingText: string }> = sections
    .filter((s) => s.inScope)
    .map((s) => ({ start: s.headingLine, end: s.endLine, headingText: s.headingText }));

  function findInScopeSection(lineNumber: number): string | null {
    for (const r of inScopeRanges) {
      if (lineNumber >= r.start && lineNumber <= r.end) return r.headingText;
    }
    return null;
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineText = lines[lineIdx]!;
    const lineNumber = lineIdx + 1;
    const sectionHeading = findInScopeSection(lineNumber);
    if (sectionHeading === null) continue; // out-of-scope: pre-amendment or undated section.

    for (const { key, pattern } of MATCHERS) {
      pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(lineText)) !== null) {
        const exemptionReason = evaluateExemption(key, lineText, m.index);
        matches.push({
          domain: "reconciliation",
          filePath: reconciliationPath,
          lineNumber,
          columnNumber: m.index + 1,
          matcherKey: key,
          matchedSubstring: m[0],
          lineText,
          sectionAnchor: sectionHeading.replace(/^###\s+/, "").trim().slice(0, 80),
          exempted: exemptionReason !== null,
          exemptionReason,
        });
        if (m.index === pattern.lastIndex) pattern.lastIndex++;
      }
    }
  }

  return matches;
}

// ---- Top-level gate entrypoint -------------------------------------------

export interface GateInputs {
  masterSpecPath: string;
  reconciliationPath: string;
  /** Optional override for unit tests — pass pre-loaded text to bypass FS. */
  masterSpecRawText?: string;
  reconciliationRawText?: string;
}

export function runGate(inputs: GateInputs): GateResult {
  const runStartedAtIso = new Date().toISOString();
  const parseErrors: ParseError[] = [];
  let masterSpecMatches: DetectedMatch[] = [];
  let reconciliationMatches: DetectedMatch[] = [];
  let masterSpecLineCount = 0;
  let masterSpecSectionRange = { startLine: 0, endLine: 0 };
  let reconciliationInScopeSectionCount = 0;
  let reconciliationOutOfScopeSectionCount = 0;

  // ---- Master Spec scan ---
  try {
    const text =
      inputs.masterSpecRawText ?? readFileSync(resolve(inputs.masterSpecPath), "utf-8");
    masterSpecLineCount = text.split("\n").length;
    masterSpecSectionRange = computeMasterSpecBodyRange(text);
    masterSpecMatches = scanMasterSpec(inputs.masterSpecPath, text);
  } catch (e) {
    parseErrors.push({
      filePath: inputs.masterSpecPath,
      reason: e instanceof Error ? e.message : String(e),
      recoverable: false,
    });
  }

  // ---- RECONCILIATION scan ---
  try {
    const text =
      inputs.reconciliationRawText ?? readFileSync(resolve(inputs.reconciliationPath), "utf-8");
    const sections = walkReconciliationSections(text);
    reconciliationInScopeSectionCount = sections.filter((s) => s.inScope).length;
    reconciliationOutOfScopeSectionCount = sections.length - reconciliationInScopeSectionCount;
    reconciliationMatches = scanReconciliation(inputs.reconciliationPath, text);
  } catch (e) {
    parseErrors.push({
      filePath: inputs.reconciliationPath,
      reason: e instanceof Error ? e.message : String(e),
      recoverable: false,
    });
  }

  const matches = [...masterSpecMatches, ...reconciliationMatches];
  const nonExemptMatches = matches.filter((m) => !m.exempted);

  const outcome: GateOutcome =
    parseErrors.length > 0 ? "parse_error" : nonExemptMatches.length > 0 ? "fail" : "pass";

  const runFinishedAtIso = new Date().toISOString();

  return {
    outcome,
    matches,
    nonExemptMatches,
    parseErrors,
    runMetadata: {
      gateId: "appendix_k_glossary_canonicality",
      runStartedAtIso,
      runFinishedAtIso,
      masterSpecLineCount,
      masterSpecSectionRange,
      reconciliationInScopeSectionCount,
      reconciliationOutOfScopeSectionCount,
    },
  };
}

// ---- Inline review-comment rendering -------------------------------------

/**
 * Renders one inline review-comment per non-exempt match. Per §M.4.3 the
 * comment includes: source path + line number + matched substring + regex
 * pattern key + recommended replacement + §M.5 catalog link.
 *
 * The §M.4.3.1 fail-secure posture is enforced by the upstream
 * `comment_poster.ts`: if GitHub API posting fails, the gate falls closed
 * with `comment_post_failed` status.
 */
export function renderReviewComment(match: DetectedMatch): string {
  const matcher = MATCHERS.find((m) => m.key === match.matcherKey)!;
  return [
    `**Spec-Lint — \`appendix_k_glossary_canonicality\` violation (matcher ${match.matcherKey})**`,
    "",
    `Detected: \`${match.matchedSubstring}\` at ${match.filePath}:${match.lineNumber}:${match.columnNumber}` +
      (match.sectionAnchor ? ` (§${match.sectionAnchor})` : ""),
    "",
    `Matcher: ${matcher.description}`,
    "",
    `Per AGENTS.md and the Master Spec: **Appendix K** is the canonical Glossary; **Appendix B** is the Keyboard Shortcut Reference.`,
    "",
    `Recommended replacement: rewrite the cited token to reference \`Appendix K Glossary\` and (for new additions) cite the Phase 12.3 amendment inline.`,
    "",
    `Override path (only for deliberate Phase-12.3 contrast prose): add \`@ci-gate-override: appendix_k_glossary_canonicality — <rationale ≥ 60 chars>\` to the PR description per Master Spec §M.4.4.5.`,
    "",
    `Authority: Master Spec §M.5 catalog row \`appendix_k_glossary_canonicality\`; defects D-AK-001 / D-AK-002 / D-AK-003 / D-2V-002.`,
  ].join("\n");
}

// ---- CLI entrypoint exit-code mapping ------------------------------------

/**
 * Maps a `GateResult` to a process exit code. Fail-closed:
 *   - 0  = pass
 *   - 1  = fail (≥1 non-exempt match)
 *   - 2  = parse_error (non-overridable per §M.4.3)
 *
 * The §M.4.5 AuditEvent emit is the caller's responsibility (typically
 * `audit_emit.ts` aggregating across the spec-lint workflow steps).
 */
export function resultToExitCode(result: GateResult): 0 | 1 | 2 {
  if (result.outcome === "parse_error") return 2;
  if (result.outcome === "fail") return 1;
  return 0;
}

// ---- Self-test fixtures (unit-test consumers) ----------------------------

export const __TEST_HOOKS__ = {
  PHASE_12_3_AMENDMENT_ISO_DATE,
  MATCHERS,
  computeMasterSpecBodyRange,
  walkReconciliationSections,
  evaluateExemption,
  nearestSectionAnchor,
  scanMasterSpec,
  scanReconciliation,
  runGate,
  renderReviewComment,
  resultToExitCode,
};

// ---- Default CLI shim ---------------------------------------------------

/**
 * When invoked directly (`npx tsx tools/spec-lint/appendix_k_canonicality.ts`)
 * the file reads paths from positional CLI arguments and emits a single
 * JSON document to stdout describing the gate result. Exit code maps per
 * `resultToExitCode`.
 *
 * Argument schema (all required):
 *   --master-spec      <path>
 *   --reconciliation   <path>
 *
 * The CLI shim is loaded by the workflow step `Run appendix_k_glossary_canonicality detector`.
 */
function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith("--")) {
        out[key] = val;
        i++;
      } else {
        out[key] = "true";
      }
    }
  }
  return out;
}

// Detect direct invocation (Node + tsx compatibility).
const isDirectInvocation =
  typeof process !== "undefined" &&
  process.argv?.[1] !== undefined &&
  /appendix_k_canonicality\.ts$/.test(process.argv[1]!);

if (isDirectInvocation) {
  const args = parseArgs(process.argv.slice(2));
  const masterSpecPath = args["master-spec"];
  const reconciliationPath = args["reconciliation"];
  if (!masterSpecPath || !reconciliationPath) {
    // Print parse_error to stdout and exit 2 — non-overridable.
    process.stdout.write(
      JSON.stringify({
        outcome: "parse_error",
        matches: [],
        nonExemptMatches: [],
        parseErrors: [
          {
            filePath: "(cli args)",
            reason:
              "Missing required CLI arguments: --master-spec <path> --reconciliation <path>",
            recoverable: false,
          },
        ],
        runMetadata: {
          gateId: "appendix_k_glossary_canonicality",
          runStartedAtIso: new Date().toISOString(),
          runFinishedAtIso: new Date().toISOString(),
          masterSpecLineCount: 0,
          masterSpecSectionRange: { startLine: 0, endLine: 0 },
          reconciliationInScopeSectionCount: 0,
          reconciliationOutOfScopeSectionCount: 0,
        },
      }) + "\n"
    );
    process.exit(2);
  }
  const result = runGate({ masterSpecPath, reconciliationPath });
  process.stdout.write(JSON.stringify(result) + "\n");
  process.exit(resultToExitCode(result));
}
