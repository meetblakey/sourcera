/**
 * Gate: `cost_base_publish_gate_threshold_single_source`
 *
 * Assertion: cost-base recalc publish gating is single-sourced from §4.8.6
 * enum membership and §34.3.3 policy. The active rule is NOT a single 25%
 * threshold: `alert_10_25`, `critical_gt_25`, or `margin_floor_breach=true`
 * blocks auto-publish and requires Ops Finance approval.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const COST_BASE_SECTION = "4.8.6-costbaserecalculationlog";

const COST_BASE_TOKENS = [
  "`drift_severity ∈ {alert_10_25, critical_gt_25}` MUST require explicit `ops_finance_admin` approval before publication",
  "This AC is the canonical publish-gating rule",
  "`drift_severity ∈ {alert_10_25, critical_gt_25}` blocks auto-publish; ≥10% drift requires Finance approval",
  "Deploy-time validator `cost_base_publish_gate_threshold_single_source` (Appendix M.5) asserts no inline 25% threshold remains in §34 / §4.8.x bodies",
];

const POLICY_TOKENS = [
  "A cost-base recalc that produces `drift_severity ∈ {normal, warning_5_10}` AND `margin_floor_breach=false` **auto-publishes**",
  "A recalc that produces `drift_severity ∈ {alert_10_25, critical_gt_25}` OR `margin_floor_breach=true` **does NOT auto-publish**",
  "a 12% drift on `policy_parsing` enters `pending_finance_approval` and blocks auto-publish until Ops Finance approves",
  "evaluated against the §4.8.6 enum",
  "never against an inline 25% threshold",
];

const GLOSSARY_TOKENS = [
  "Drives auto-apply vs explicit Ops Finance approval routing per §4.8.6 AC #2 and §34.3.3",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/cost_base_publish_gate_threshold_single_source.ts",
  "§4.8.6 AC #2",
  "§34.3.3 Cost-Base Recalculation publish-gating policy",
  "Appendix K Drift Severity",
  "`drift_severity ∈ {alert_10_25, critical_gt_25}` OR `margin_floor_breach=true` blocks auto-publish",
  "inline 25%-only trigger text fails",
];

const FORBIDDEN_EXACT = [
  "Summary C.77",
  "§34.18 cost-base publish-gate threshold cells",
  "§34.18 cost-base authoring",
  "§34.18 cost-base publish-gate authoritative cells",
];

function sectionByAnchor(
  doc: SpecDoc,
  anchor: string,
  label: string,
  findings: Finding[],
): { text: string; line: number } {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor,
      message: `${label} section is missing; cannot verify cost-base publish gating.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function sectionByTitle(
  doc: SpecDoc,
  title: RegExp,
  label: string,
  findings: Finding[],
): { text: string; line: number } {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing; cannot verify cost-base publish gating.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  tokens: string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing cost-base publish-gate binding: ${token}`,
      });
    }
  }
  return findings;
}

function findLineMatching(
  doc: SpecDoc,
  predicate: (text: string) => boolean,
): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    if (predicate(text)) return { text, line: i };
  }
  return null;
}

function staleThresholdFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    for (const token of FORBIDDEN_EXACT) {
      if (line.includes(token)) {
        findings.push({
          file: doc.path,
          line: i,
          matched_text: token,
          message: "Cost-base publish-gate authority still routes through stale Summary / §34.18 threshold language; cite §4.8.6 AC #2 and §34.3.3 instead.",
        });
      }
    }

    const mentionsOld25 =
      line.includes("≥ 25% auto-publish block") ||
      line.includes("≥ 25% OR margin-floor breach") ||
      line.includes("25%-auto-publish");
    if (mentionsOld25) {
      const lineLower = line.toLowerCase();
      const retiredContext =
        (lineLower.includes("retired") || lineLower.includes("supersedes")) &&
        (line.includes("enum membership") || line.includes("§4.8.6"));
      if (!retiredContext) {
        findings.push({
          file: doc.path,
          line: i,
          matched_text: "25% auto-publish threshold",
          message: "Cost-base publish-gate logic uses a stale 25% threshold without retiring it in favor of §4.8.6 enum membership.",
        });
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "cost_base_publish_gate_threshold_single_source",
  sourcePhase: "V11 (D-11.3-002 remediation)",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const costBase = sectionByAnchor(doc, COST_BASE_SECTION, "§4.8.6 CostBaseRecalculationLog", findings);
    findings.push(...requireTokens(doc, costBase.text, costBase.line, "§4.8.6 AC #2", COST_BASE_TOKENS));

    const policy = sectionByTitle(doc, /^34\.3\.3 Cost-Base Recalculation\b/, "§34.3.3 Cost-Base Recalculation", findings);
    findings.push(...requireTokens(doc, policy.text, policy.line, "§34.3.3 Authoritative publish-gating rule", POLICY_TOKENS));

    const glossaryLine = findLineMatching(doc, (line) => line.includes("**Drift Severity.**"));
    if (!glossaryLine) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "**Drift Severity.**",
        message: "Appendix K Drift Severity glossary entry is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, glossaryLine.text, glossaryLine.line, "Appendix K Drift Severity", GLOSSARY_TOKENS));
    }

    const m5Row = findLineMatching(
      doc,
      (line) => line.trim().startsWith("| `cost_base_publish_gate_threshold_single_source` |"),
    );
    if (!m5Row) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`cost_base_publish_gate_threshold_single_source`",
        message: "Appendix M.5 cost_base_publish_gate_threshold_single_source row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5Row.text, m5Row.line, "Appendix M.5 cost_base_publish_gate_threshold_single_source row", M5_TOKENS));
    }

    findings.push(...staleThresholdFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
