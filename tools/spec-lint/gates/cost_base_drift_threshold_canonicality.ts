/**
 * Gate: `cost_base_drift_threshold_canonicality`
 *
 * Assertion: cost-base recalc drift severity is single-sourced to the
 * D-DEC-010 7/10/25 threshold bands. The retired `warning_5_10` / 5% warning
 * floor may appear only as explicit legacy-migration text.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.6 CostBaseRecalculationLog",
    anchor: "4.8.6-costbaserecalculationlog",
    tokens: [
      "`normal` (`|drift| ≤ 7%`)",
      "`warning_7_10` (`7 < |drift| ≤ 10`)",
      "`warning_5_10` is retired legacy input only",
      "`drift_severity ∈ {normal, warning_7_10}`",
      "D-DEC-010 remediation — Drift floor canonicality",
      "CI gate `cost_base_drift_threshold_canonicality` asserts",
    ],
  },
  {
    label: "§34.3.3 Cost-Base Recalculation",
    title: /^34\.3\.3 Cost-Base Recalculation\b/,
    tokens: [
      "`\\|drift\\| ≤ 7%`",
      "`7% < \\|drift\\| ≤ 10%`",
      "D-DEC-010 F-1 remediation",
      "`drift_severity ∈ {normal, warning_7_10}`",
    ],
  },
  {
    label: "§34.11.3 Cost-Base Recalculation",
    title: /^34\.11\.3 Cost-Base Recalculation\b/,
    tokens: [
      "Drift severity bands: `normal`, `warning_7_10`, `alert_10_25`, and `critical_gt_25` per §4.8.6",
    ],
  },
];

const APPENDIX_J_TOKENS = [
  "`normal`, `warning_7_10`, `alert_10_25`, `critical_gt_25`",
  "Legacy alias: `warning_5_10` is retired as of D-DEC-010",
  "MUST rewrite it to `warning_7_10`",
];

const APPENDIX_K_TOKENS = [
  "**Drift Severity.**",
  "`normal` (≤7%)",
  "`warning_7_10` (>7–10%)",
  "`alert_10_25` (>10–25%)",
  "`critical_gt_25` (>25%)",
  "`warning_5_10` is a retired legacy alias",
];

const M5_TOKENS = [
  "`cost_base_drift_threshold_canonicality`",
  "**`runtime_active`**",
  "tools/spec-lint/gates/cost_base_drift_threshold_canonicality.ts",
  "7/10/25 drift-severity bands",
  "`warning_5_10`, `≤5%`, or `5–10%` cost-base drift threshold wording fails unless marked as retired legacy migration input",
];

function getSection(
  doc: SpecDoc,
  req: (typeof SECTION_REQUIREMENTS)[number],
  findings: Finding[],
): { text: string; line: number } {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} is missing; cannot verify cost-base drift threshold canonicality.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing cost-base drift-threshold binding: ${token}`,
      });
    }
  }
  return findings;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    if (predicate(text)) return { text, line: i };
  }
  return null;
}

function staleThresholdFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const staleTokens = [
    "`warning_5_10`",
    "warning_5_10",
    "`|drift| ≤ 5%`",
    "`\\|drift\\| ≤ 5%`",
    "`5 < |drift| ≤ 10`",
    "`5% < \\|drift\\| ≤ 10%`",
    "`low` ≤ 5%",
    "low ≥ 5%",
    "drift within 5% threshold",
    "blended margin shifts > 5%",
    "provider-price-diff job (§50.12.8 source panel) raises a P2 alert on divergence > 5%",
  ];

  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    const lower = line.toLowerCase();
    const allowedLegacy =
      lower.includes("retired legacy") ||
      lower.includes("retired as of d-dec-010") ||
      lower.includes("fails unless marked as retired legacy migration input");
    if (allowedLegacy) continue;

    for (const token of staleTokens) {
      if (line.includes(token)) {
        findings.push({
          file: doc.path,
          line: i,
          matched_text: token,
          message: "Cost-base drift threshold still uses the retired 5% / warning_5_10 policy; use D-DEC-010 7/10/25 bands.",
        });
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "cost_base_drift_threshold_canonicality",
  sourcePhase: "v7.1.1 D-DEC-010",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const req of SECTION_REQUIREMENTS) {
      const section = getSection(doc, req, findings);
      findings.push(...requireTokens(doc, section.text, section.line, req.label, req.tokens));
    }

    const appendixJLine = findLine(doc, (line) => line.includes("`normal`, `warning_7_10`, `alert_10_25`, `critical_gt_25`"));
    if (!appendixJLine) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`normal`, `warning_7_10`, `alert_10_25`, `critical_gt_25`",
        message: "Appendix J cost_base_recalc_drift_severity enum does not carry the D-DEC-010 values.",
      });
    } else {
      const appendixJText = doc.lines.slice(appendixJLine.line, appendixJLine.line + 4).join("\n");
      findings.push(...requireTokens(doc, appendixJText, appendixJLine.line, "Appendix J cost_base_recalc_drift_severity", APPENDIX_J_TOKENS));
    }

    const appendixKLine = findLine(doc, (line) => line.startsWith("**Drift Severity.**"));
    if (!appendixKLine) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "**Drift Severity.**",
        message: "Appendix K Drift Severity glossary entry is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, appendixKLine.text, appendixKLine.line, "Appendix K Drift Severity", APPENDIX_K_TOKENS));
    }

    const m5Row = findLine(doc, (line) => line.trim().startsWith("| `cost_base_drift_threshold_canonicality` |"));
    if (!m5Row) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`cost_base_drift_threshold_canonicality`",
        message: "Appendix M.5 cost_base_drift_threshold_canonicality row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5Row.text, m5Row.line, "Appendix M.5 cost_base_drift_threshold_canonicality row", M5_TOKENS));
    }

    findings.push(...staleThresholdFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
