/**
 * Gate: `cost_base_recalc_cron_canonicality`
 *
 * Assertion: the cost-base recalculation cadence is single-sourced as scheduler
 * cron `cost_base_recalc_nightly` at 03:00 UTC across §4.8.6, §34.3.3,
 * §34.11.3, and §34.17.1. A live 02:30 UTC schedule is forbidden.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.6 CostBaseRecalculationLog",
    anchor: "4.8.6-costbaserecalculationlog",
    tokens: ["`cost_base_recalc_nightly`", "nightly at 03:00 UTC", "missed run alerts Ops within 1 hour"],
  },
  {
    label: "§34.3.3 Cost-Base Recalculation",
    title: /^34\.3\.3 Cost-Base Recalculation\b/,
    tokens: ["Scheduler cron `cost_base_recalc_nightly`; nightly at 03:00 UTC", "§4.8.6 AC #1"],
  },
  {
    label: "§34.11.3 Cost-Base Recalculation",
    title: /^34\.11\.3 Cost-Base Recalculation\b/,
    tokens: ["`cost_base_recalc_nightly`", "nightly at 03:00 UTC", "§4.8.6 AC #1"],
  },
  {
    label: "§34.17.1 MS §2.11 Baseline",
    title: /^34\.17\.1 MS §2\.11 Baseline\b/,
    tokens: ["Scheduler cron `cost_base_recalc_nightly` at 03:00 UTC", "prior 30-day rolling telemetry window per §4.8.6 AC #7"],
  },
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/cost_base_recalc_cron_canonicality.ts",
  "`cost_base_recalc_nightly` cadence",
  "03:00 UTC",
  "MUST NOT restate a conflicting 02:30 UTC cost-base schedule",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify cost-base recalc cron canonicality.`,
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
        message: `${label} is missing cost-base recalc cron binding: ${token}`,
      });
    }
  }
  return findings;
}

function findM5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `cost_base_recalc_cron_canonicality` |")) return { text: line, line: i };
  }
  return null;
}

function staleScheduleFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (!line.includes("02:30 UTC")) continue;
    const lower = line.toLowerCase();
    const inCostBaseContext = lower.includes("cost-base") || lower.includes("cost base") || lower.includes("recalc");
    if (!inCostBaseContext) continue;
    const explicitHistorical =
      lower.includes("supersedes") ||
      lower.includes("prior") ||
      (lower.includes("must not restate") && lower.includes("conflicting"));
    if (!explicitHistorical) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: "02:30 UTC",
        message: "Cost-base recalc cadence still contains a live 02:30 UTC schedule; use scheduler cron `cost_base_recalc_nightly` at 03:00 UTC.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "cost_base_recalc_cron_canonicality",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const req of SECTION_REQUIREMENTS) {
      const section = sectionText(doc, req, findings);
      findings.push(...requireTokens(doc, section.text, section.line, req.label, req.tokens));
    }

    const m5 = findM5Row(doc);
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`cost_base_recalc_cron_canonicality`",
        message: "Appendix M.5 cost_base_recalc_cron_canonicality row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 cost_base_recalc_cron_canonicality row", M5_TOKENS));
    }

    findings.push(...staleScheduleFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
