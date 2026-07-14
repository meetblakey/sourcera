/**
 * Gate: `pulse_health_score_math_bounds`
 *
 * Assertion: Buyer Pulse Health Score math is bounded, null-safe,
 * monotonic for lateness, and backed by a fixture set.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_20_3_1_TOKENS = [
  "`phase_velocity_pct`",
  "`clamp_pct(200 - ((actual_days_in_current_phase / sourcera_method_recommended_days) * 100))`",
  "`safe_pct(numerator, denominator)` returns `null` when `denominator = 0`",
  "`clamp_pct(value)` returns `MAX(0, MIN(100, value))`",
  "remaining non-null weights are renormalized to sum to 1.0",
  "`composite_score = 0`, `color_band = red`, and `raw_inputs_json.empty_reason = no_available_terms`",
  "The old `Phase_velocity_ratio` term is retired",
  "deploy-time property test `pulse_health_velocity_monotonic_in_lateness`",
  "CI gate `pulse_health_score_math_bounds`",
  "Persist `composite_score = clamp_pct(weighted_sum)`",
  "final-score clamp is mandatory",
  "Reject any compute output that would persist `NaN`, `Infinity`, `-Infinity`",
];

const REQUIRED_FIXTURE_IDS = [
  "all_terms_null_red_zero",
  "null_term_renormalization",
  "velocity_monotonic_in_lateness",
  "component_and_final_clamp",
  "negative_or_invalid_output_blocked",
];

const REQUIRED_20_3_2_TOKENS = [
  "| Before Phase 6 | `pre_phase_6` | SLA 0.5; Velocity 0.5 |",
  "| Phase 6-9 | `phase_6_to_9` | SLA 0.4; Response 0.4; Velocity 0.2 |",
  "| Phase 10-11 | `phase_10_to_11` | SLA 0.3; Scoring 0.3; Response 0.2; Velocity 0.2 |",
  "| Phase 12+ | `phase_12_locked` | Latest Phase 10-11 score frozen |",
  "| Phase 10-11 | Phase 12 | Phase 12 entry lock succeeds | `phase_12_locked` |",
];

const REQUIRED_ENTITY_TOKENS = [
  "| `composite_score` | Decimal(5,2) | Required; 0.00 <= value <= 100.00 | Final bounded score after null-term renormalization |",
  "| `phase_velocity_pct` | Decimal(5,2) | Nullable; 0.00 <= value <= 100.00 | Normalized term defined in §20.3.1; higher is better |",
  "| `component_weights_json` | JSONB | Required; keys limited to the four component names above; values sum to 1.0000 after renormalization |",
  "`composite_score` MUST always be within [0, 100]",
  "`phase_velocity_pct` MUST be monotonic in lateness",
];

const REQUIRED_20_7_TOKENS = [
  "apply the §20.3.1.A final-score clamp",
  "exclude null terms from weight normalization",
  "preserve velocity monotonicity",
  "never persist NaN / Infinity",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/pulse_health_score_math_bounds.ts",
  "§20.3.1.A",
  "final-score clamp",
  "null-term exclusion with weight renormalization",
  "no NaN / Infinity output",
  "Property-test failure",
];

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing; cannot verify Pulse math bounds.`,
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
        message: `${label} is missing Pulse math-bound token: ${token}`,
      });
    }
  }
  return findings;
}

function fixtureTableFindings(doc: SpecDoc, fromLine: number, toLine: number): Finding[] {
  const findings: Finding[] = [];
  let fixtureIntroLine = 0;
  for (let i = fromLine; i <= toLine; i++) {
    if ((doc.lines[i] ?? "").includes("The property-test fixture set for `pulse_health_score_math_bounds` is:")) {
      fixtureIntroLine = i;
      break;
    }
  }
  if (!fixtureIntroLine) {
    return [{
      file: doc.path,
      line: fromLine,
      matched_text: "The property-test fixture set for `pulse_health_score_math_bounds` is:",
      message: "§20.3.1.A Pulse math fixture intro is missing.",
    }];
  }

  const table = parseTableAt(doc, fixtureIntroLine + 1, toLine);
  if (!table.header || table.rows.length === 0) {
    return [{
      file: doc.path,
      line: fromLine,
      matched_text: "Property-test fixture set",
      message: "§20.3.1.A Pulse math fixture table is missing.",
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
      message: "§20.3.1.A fixture table must include Fixture ID, Expected result, and Regression guarded columns.",
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
        message: `§20.3.1.A fixture table is missing required fixture ${id}.`,
      });
    }
  }

  for (const [id, row] of seen) {
    const checks =
      id === "all_terms_null_red_zero"
        ? ["`composite_score = 0`", "`color_band = red`", "no `NaN` / `Infinity`"]
        : id === "null_term_renormalization"
          ? ["`composite_score = 66.67`", "response `0.6667`", "velocity `0.3333`"]
          : id === "velocity_monotonic_in_lateness"
            ? ["`100`, `90`, `0`", "non-increasing"]
            : id === "component_and_final_clamp"
              ? ["`composite_score = clamp_pct(weighted_sum)`", "never exceeds `100`"]
              : id === "negative_or_invalid_output_blocked"
                ? ["No persisted `NaN`, `Infinity`, `-Infinity`, or score outside `0-100`"]
                : [];
    findings.push(...requireTokens(doc, row.rowText, row.line, `§20.3.1.A fixture ${id}`, checks));
  }

  return findings;
}

function m5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `pulse_health_score_math_bounds` |")) return { text: line, line: i };
  }
  return null;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = m5Row(doc);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`pulse_health_score_math_bounds`",
      message: "Appendix M.5 pulse_health_score_math_bounds row is missing.",
    }];
  }
  const findings = requireTokens(doc, row.text, row.line, "Appendix M.5 pulse_health_score_math_bounds row", M5_TOKENS);
  if (row.text.includes("§20.7.2")) {
    findings.push({
      file: doc.path,
      line: row.line,
      matched_text: "§20.7.2",
      message: "Appendix M.5 pulse_health_score_math_bounds row points at non-existent §20.7.2; cite §20.7 AC #5 or §20.3.1.A.",
    });
  }
  return findings;
}

function runFormulaSelfTest(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  const clampPct = (value: number) => Math.max(0, Math.min(100, value));
  const safePct = (numerator: number, denominator: number) => {
    if (denominator === 0) return null;
    return clampPct((numerator / denominator) * 100);
  };
  const phaseVelocity = (actualDays: number, recommendedDays: number) => {
    if (recommendedDays <= 0) return null;
    return clampPct(200 - (actualDays / recommendedDays) * 100);
  };
  const score = (terms: Array<{ value: number | null; weight: number }>) => {
    const usable = terms.filter((term) => term.value !== null);
    if (usable.length === 0) return 0;
    const totalWeight = usable.reduce((sum, term) => sum + term.weight, 0);
    if (totalWeight <= 0) return 0;
    const weighted = usable.reduce((sum, term) => sum + (term.value ?? 0) * (term.weight / totalWeight), 0);
    return Math.round(clampPct(weighted) * 100) / 100;
  };

  const velocitySequence = [phaseVelocity(10, 10), phaseVelocity(11, 10), phaseVelocity(20, 10)].map((value) =>
    value === null ? null : Math.round(value * 100) / 100,
  );
  if (velocitySequence.join(",") !== "100,90,0") {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: velocitySequence.join(","),
      message: "Pulse velocity self-test failed; expected 100,90,0 for actual days 10,11,20 against baseline 10.",
    });
  }

  const renormalized = score([
    { value: null, weight: 0.4 },
    { value: safePct(5, 10), weight: 0.4 },
    { value: phaseVelocity(10, 10), weight: 0.2 },
  ]);
  if (renormalized !== 66.67) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: String(renormalized),
      message: "Pulse null-term renormalization self-test failed; expected 66.67.",
    });
  }

  const bounded = score([
    { value: safePct(2, 1), weight: 0.7 },
    { value: 500, weight: 0.7 },
  ]);
  if (!Number.isFinite(bounded) || bounded < 0 || bounded > 100) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: String(bounded),
      message: "Pulse final-clamp self-test failed; bounded score must remain within 0-100.",
    });
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "pulse_health_score_math_bounds",
  sourcePhase: "Phase 4.11 P1",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_score_math_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const section20_3_1 = sectionText(doc, /^20\.3\.1 Health Score Calculation\b/, "§20.3.1 Health Score Calculation", findings);
    findings.push(...requireTokens(doc, section20_3_1.text, section20_3_1.line, "§20.3.1 Health Score Calculation", REQUIRED_20_3_1_TOKENS));
    findings.push(...fixtureTableFindings(doc, section20_3_1.line, section20_3_1.endLine));

    const section20_3_2 = sectionText(doc, /^20\.3\.2 Health Score Phases\b/, "§20.3.2 Health Score Phases", findings);
    findings.push(...requireTokens(doc, section20_3_2.text, section20_3_2.line, "§20.3.2 Health Score Phases", REQUIRED_20_3_2_TOKENS));

    const entity = sectionText(doc, /^4\.3\.22\.2 WorkspacePulseHealth\b/, "§4.3.22.2 WorkspacePulseHealth", findings);
    findings.push(...requireTokens(doc, entity.text, entity.line, "§4.3.22.2 WorkspacePulseHealth", REQUIRED_ENTITY_TOKENS));

    const ac = sectionText(doc, /^20\.7 Acceptance Criteria\b/, "§20.7 Acceptance Criteria", findings);
    findings.push(...requireTokens(doc, ac.text, ac.line, "§20.7 Acceptance Criteria", REQUIRED_20_7_TOKENS));

    findings.push(...m5Findings(doc));
    findings.push(...runFormulaSelfTest(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
