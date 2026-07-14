/**
 * Gate: `cost_base_recalc_sample_window_canonicality`
 *
 * Assertion: cost-base recalculation inputs use the prior 30-day rolling window
 * and persist `sample_window_started_at` / `sample_window_ended_at` per §4.8.6.
 * Live prior-24h recalc-input wording is forbidden.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.6 CostBaseRecalculationLog",
    anchor: "4.8.6-costbaserecalculationlog",
    tokens: [
      "`sample_window_started_at`",
      "`sample_window_ended_at`",
      "prior 30-day rolling sample window",
      "MUST be the prior 30-day rolling window (NOT 24h)",
      "CI gate `cost_base_recalc_sample_window_canonicality` asserts",
    ],
  },
  {
    label: "§34.3.3 Cost-Base Recalculation",
    title: /^34\.3\.3 Cost-Base Recalculation\b/,
    tokens: [
      "Prior 30-day rolling window of invoice events from the provider assigned to each capability (Anthropic or Voyage AI for the current Policy Ingestion paths) + Convex compute allocation per `posthog_event_name` mapping",
      "30-day window supersedes prior 24h reading",
    ],
  },
  {
    label: "§34.17.1 MS §2.11 Baseline",
    title: /^34\.17\.1 MS §2\.11 Baseline\b/,
    tokens: ["prior 30-day rolling telemetry window per §4.8.6 AC #7"],
  },
  {
    label: "Appendix K CostBaseRecalculationLog",
    linePrefix: "**CostBaseRecalculationLog.**",
    tokens: ["prior 30-day rolling window of actual assigned-provider billing", "Anthropic and Voyage AI where assigned", "Convex compute attribution", "external-provider billing"],
  },
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/cost_base_recalc_sample_window_canonicality.ts",
  "prior 30-day rolling window",
  "`sample_window_started_at` / `sample_window_ended_at` constraints",
  "prior-24h recalc-input wording fails",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  if ("linePrefix" in req && req.linePrefix) {
    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i] ?? "";
      if (line.startsWith(req.linePrefix)) return { text: line, line: i };
    }
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: req.linePrefix,
      message: `${req.label} glossary line is missing; cannot verify cost-base sample-window canonicality.`,
    });
    return { text: "", line: 0 };
  }
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify cost-base sample-window canonicality.`,
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
        message: `${label} is missing cost-base sample-window binding: ${token}`,
      });
    }
  }
  return findings;
}

function findM5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `cost_base_recalc_sample_window_canonicality` |")) return { text: line, line: i };
  }
  return null;
}

function staleWindowFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    const lower = line.toLowerCase();
    const inCostBaseContext =
      lower.includes("cost-base") || lower.includes("cost base") || lower.includes("recalc") || lower.includes("sample window");
    if (!inCostBaseContext) continue;

    const mentionsPrior24h =
      lower.includes("prior-24h") ||
      lower.includes("prior 24h") ||
      lower.includes("24h recalc") ||
      lower.includes("24-hour recalc");
    if (!mentionsPrior24h) continue;

    const explicitRetirement =
      lower.includes("not 24h") || lower.includes("supersedes prior 24h") || lower.includes("prior 24h reading") || lower.includes("fails");
    if (!explicitRetirement) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: "prior 24h",
        message: "Cost-base recalc inputs still contain live prior-24h sample-window wording; use the prior 30-day rolling window and §4.8.6 sample-window fields.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "cost_base_recalc_sample_window_canonicality",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.1.0",
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
        matched_text: "`cost_base_recalc_sample_window_canonicality`",
        message: "Appendix M.5 cost_base_recalc_sample_window_canonicality row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 cost_base_recalc_sample_window_canonicality row", M5_TOKENS));
    }

    findings.push(...staleWindowFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
