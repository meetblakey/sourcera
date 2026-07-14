/**
 * Gate: `seller_pulse_health_score_math_bounds`
 *
 * Assertion: Seller Pulse Health Score math is bounded, null-safe,
 * final-lock immutable, and backed by a fixture set.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_24_4_2_TOKENS = [
  "`safe_pct(numerator, denominator)` returns `null` when `denominator = 0`",
  "`clamp_pct(value)` returns `MAX(0, MIN(100, value))`",
  "remaining non-null weights are renormalized to 1.0",
  "`score_value = 0`, `color_band = red`, and `raw_inputs_json.empty_reason = no_available_terms`",
  "| `response_completion_pct` | `safe_pct(submitted_response_item_count, materialized_response_item_count)` | Phase 6+ while Bid Workspace is active/submitted. |",
  "| `on_time_submission_pct` | `safe_pct(on_time_submitted_response_item_count, submitted_response_item_count)` | Phase 6+ when at least one response has been submitted. |",
  "| `amendment_reverification_turnaround_pct` | `safe_pct(amendment_reverification_cleared_within_target_count, amendment_reverification_required_count)` | Only after buyer amendments require seller re-verification per §25.5. |",
  "| `kb_utilization_pct` | `safe_pct(submitted_response_items_with_verified_kb_citation_count, submitted_response_item_count)` | Phase 6+ when at least one response has been submitted. |",
  "| `deadline_readiness_pct` | `safe_pct(non_overdue_seller_deadline_count, seller_deadline_count)` | Any active Bid Workspace phase with seller-owned deadlines. |",
  "| Before buyer Phase 6 projection | `pre_bidding` | Deadline readiness 0.5; KB utilization 0.5 |",
  "| Buyer Phase 6-10 projection | `active_response` | Response completion 0.4; on-time submission 0.25; amendment turnaround 0.2; KB utilization 0.15 |",
  "| Buyer Phase 11-13 projection or Bid Workspace submitted | `post_submission` | Response completion 0.3; on-time submission 0.2; amendment turnaround 0.2; KB utilization 0.3 |",
  "| Terminal Bid Workspace state | `final_lock` | Latest non-terminal score frozen |",
  "CI gate `seller_pulse_health_score_math_bounds`",
  "Persist `score_value = clamp_pct(weighted_sum)`",
  "Reject any compute output that would persist `NaN`, `Infinity`, `-Infinity`",
  "Final-lock snapshots are immutable",
];

const REQUIRED_FIXTURE_IDS = [
  "seller_all_terms_null_red_zero",
  "seller_null_term_renormalization",
  "seller_component_and_final_clamp",
  "seller_final_lock_immutable",
  "seller_invalid_output_blocked",
];

const REQUIRED_ENTITY_TOKENS = [
  "| `score_value` | Decimal | 0-100; required | Final bounded Seller Pulse Health Score after null-term renormalization and final clamp. |",
  "| `locked` | Boolean | Default `false` | True once `snapshot_kind=final_lock` or terminal Bid Workspace state freezes the score. |",
  "| `lock_reason` | Enum | Appendix J `seller_pulse_lock_reason`; nullable | Terminal reason for the lock. |",
  "`score_value` MUST remain in the inclusive 0-100 range, apply the §24.4.2.A final-score clamp",
  "Final-lock rows MUST be immutable except for retention / DSAR redaction metadata.",
];

const REQUIRED_24_4_5_TOKENS = [
  "final-score clamp exactly as specified in §24.4.2 / §24.4.2.A",
  "MUST never persist NaN / Infinity",
  "reject mutable recompute after `locked=true`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/seller_pulse_health_score_math_bounds.ts",
  "§24.4.2.A",
  "final-score clamp",
  "null-term exclusion with weight renormalization",
  "no NaN / Infinity output",
  "immutable final-lock behavior",
  "Property-test failure",
];

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing; cannot verify Seller Pulse math bounds.`,
    });
    return { text: "", line: 0, endLine: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    endLine: section.endLine,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing Seller Pulse math-bound token: ${token}`,
      });
    }
  }
  return findings;
}

function fixtureTableFindings(doc: SpecDoc, fromLine: number, toLine: number): Finding[] {
  const findings: Finding[] = [];
  let fixtureIntroLine = 0;
  for (let i = fromLine; i <= toLine; i++) {
    if ((doc.lines[i] ?? "").includes("The property-test fixture set for `seller_pulse_health_score_math_bounds` is:")) {
      fixtureIntroLine = i;
      break;
    }
  }
  if (!fixtureIntroLine) {
    return [{
      file: doc.path,
      line: fromLine,
      matched_text: "The property-test fixture set for `seller_pulse_health_score_math_bounds` is:",
      message: "§24.4.2.A Seller Pulse math fixture intro is missing.",
    }];
  }

  const table = parseTableAt(doc, fixtureIntroLine + 1, toLine);
  if (!table.header || table.rows.length === 0) {
    return [{
      file: doc.path,
      line: fromLine,
      matched_text: "Property-test fixture set",
      message: "§24.4.2.A Seller Pulse math fixture table is missing.",
    }];
  }

  const fixtureIdIdx = table.header.cells.findIndex((cell) => cell === "Fixture ID");
  const expectedIdx = table.header.cells.findIndex((cell) => cell === "Expected result");
  const regressionIdx = table.header.cells.findIndex((cell) => cell === "Regression guarded");
  if ([fixtureIdIdx, expectedIdx, regressionIdx].some((idx) => idx < 0)) {
    findings.push({
      file: doc.path,
      line: table.header.line,
      matched_text: table.header.cells.join(" | "),
      message: "§24.4.2.A fixture table must include Fixture ID, Expected result, and Regression guarded columns.",
    });
  }

  const seen = new Map<string, { line: number; rowText: string }>();
  for (const row of table.rows) {
    const id = (row.cells[fixtureIdIdx] ?? "").replace(/`/g, "").trim();
    if (id) seen.set(id, { line: row.line, rowText: row.cells.join(" | ") });
  }

  for (const id of REQUIRED_FIXTURE_IDS) {
    const row = seen.get(id);
    if (!row) {
      findings.push({
        file: doc.path,
        line: fromLine,
        matched_text: id,
        message: `§24.4.2.A fixture table is missing required fixture ${id}.`,
      });
    }
  }

  for (const [id, row] of seen) {
    const checks =
      id === "seller_all_terms_null_red_zero"
        ? ["`score_value = 0`", "`color_band = red`", "no `NaN` / `Infinity`"]
        : id === "seller_null_term_renormalization"
          ? ["`score_value = 79.17`", "on-time `0.4167`", "amendment `0.3333`", "KB `0.2500`"]
          : id === "seller_component_and_final_clamp"
            ? ["`score_value = clamp_pct(weighted_sum)`", "never exceeds `100`"]
            : id === "seller_final_lock_immutable"
              ? ["Existing `score_value`, `color_band`, `locked_at`, and `lock_reason` are preserved", "no mutable recompute row is written"]
              : id === "seller_invalid_output_blocked"
                ? ["No persisted `NaN`, `Infinity`, `-Infinity`, or score outside `0-100`"]
                : [];
    findings.push(...requireTokens(doc, row.rowText, row.line, `§24.4.2.A fixture ${id}`, checks));
  }

  return findings;
}

function m5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `seller_pulse_health_score_math_bounds` |")) return { text: line, line: i };
  }
  return null;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = m5Row(doc);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`seller_pulse_health_score_math_bounds`",
      message: "Appendix M.5 seller_pulse_health_score_math_bounds row is missing.",
    }];
  }
  return requireTokens(doc, row.text, row.line, "Appendix M.5 seller_pulse_health_score_math_bounds row", M5_TOKENS);
}

function runFormulaSelfTest(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  const clampPct = (value: number) => Math.max(0, Math.min(100, value));
  const safePct = (numerator: number, denominator: number) => {
    if (denominator === 0) return null;
    return clampPct((numerator / denominator) * 100);
  };
  const score = (terms: Array<{ value: number | null; weight: number }>) => {
    const usable = terms.filter((term) => term.value !== null);
    if (usable.length === 0) return 0;
    const totalWeight = usable.reduce((sum, term) => sum + term.weight, 0);
    if (totalWeight <= 0) return 0;
    const weighted = usable.reduce((sum, term) => sum + clampPct(term.value ?? 0) * (term.weight / totalWeight), 0);
    return Math.round(clampPct(weighted) * 100) / 100;
  };

  const renormalized = score([
    { value: null, weight: 0.4 },
    { value: safePct(8, 10), weight: 0.25 },
    { value: safePct(5, 5), weight: 0.2 },
    { value: safePct(1, 2), weight: 0.15 },
  ]);
  if (renormalized !== 79.17) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: String(renormalized),
      message: "Seller Pulse null-term renormalization self-test failed; expected 79.17.",
    });
  }

  const bounded = score([
    { value: safePct(2, 1), weight: 0.3 },
    { value: 500, weight: 0.7 },
  ]);
  if (!Number.isFinite(bounded) || bounded < 0 || bounded > 100) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: String(bounded),
      message: "Seller Pulse final-clamp self-test failed; bounded score must remain within 0-100.",
    });
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "seller_pulse_health_score_math_bounds",
  sourcePhase: "Phase 5.5 / Phase 24 P1",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_score_math_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const entity = sectionText(doc, /^4\.4\.37 SellerBidWorkspacePulseHealth\b/, "§4.4.37 SellerBidWorkspacePulseHealth", findings);
    findings.push(...requireTokens(doc, entity.text, entity.line, "§4.4.37 SellerBidWorkspacePulseHealth", REQUIRED_ENTITY_TOKENS));

    const section24_4_2 = sectionText(doc, /^24\.4\.2 Seller Pulse Health Score Calculation\b/, "§24.4.2 Seller Pulse Health Score Calculation", findings);
    findings.push(...requireTokens(doc, section24_4_2.text, section24_4_2.line, "§24.4.2 Seller Pulse Health Score Calculation", REQUIRED_24_4_2_TOKENS));
    findings.push(...fixtureTableFindings(doc, section24_4_2.line, section24_4_2.endLine));

    const ac = sectionText(doc, /^24\.4\.5 Acceptance Criteria\b/, "§24.4.5 Acceptance Criteria", findings);
    findings.push(...requireTokens(doc, ac.text, ac.line, "§24.4.5 Acceptance Criteria", REQUIRED_24_4_5_TOKENS));

    findings.push(...m5Findings(doc));
    findings.push(...runFormulaSelfTest(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
