/**
 * Gate: `retention_cohort_canonical_consumer`
 *
 * Assertion: §51.0.2 is the only authoring home for retention-cohort
 * definitions. Dashboards may consume D1/D7/D30 cohort outputs, but must cite
 * §51.0.2 instead of restating anchor or returning events inline.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_SECTIONS = [
  {
    anchor: "51.0.2-retention-cohorts",
    label: "§51.0.2 Retention Cohorts",
    tokens: [
      "User retention is measured at three cadences (D1, D7, D30)",
      "| Cohort Kind | Anchor Event | Returning Event | Targets (Paid Tier) | Targets (Solo / Free) |",
      "**Buyer Org D7**",
      "**Buyer Org D30**",
      "**Seller Org D7**",
      "**Seller Org D30**",
      "Cohort computation: PostHog Retention model with the anchor event as `start` and the returning event as `return`",
      "`retention_cohort_canonical_consumer`",
    ],
  },
  {
    anchor: "50.14.3-growth-pm-dashboard",
    label: "§50.14.3 Growth PM Dashboard",
    tokens: [
      "| Retention D1/D7/D30 | PostHog retention model generated from the §51.0.2 Retention Cohorts registry |",
      "does not define anchor or returning events inline",
    ],
  },
  {
    anchor: "51.3.2-data-model-usagedashboardsnapshot",
    label: "§51.3.2 UsageDashboardSnapshot",
    tokens: [
      "`retention_cohort_summary_json`",
      "generated only from §51.0.2 Retention Cohorts",
      "without redefining anchor or returning events",
    ],
  },
  {
    anchor: "51.3.3-panels-kpis",
    label: "§51.3.3 Panels & KPIs",
    tokens: [
      "The dashboard renders six top-level panels",
      "| 6 — Engagement & Retention |",
      "MUST NOT define anchor or returning events inline",
      "PostHog Retention model generated from §51.0.2",
    ],
  },
  {
    anchor: "51.3.7-acceptance-criteria-51-3",
    label: "§51.3.7 Acceptance Criteria",
    tokens: [
      "Panel 6 Engagement & Retention MUST generate D1 / D7 / D30 rows only from §51.0.2 Retention Cohorts",
      "no anchor-event, returning-event, or target-band definitions are authored outside §51.0.2",
    ],
  },
  {
    anchor: "51.5.6-acceptance-criteria-51-5",
    label: "§51.5.6 Acceptance Criteria",
    tokens: [
      "ALL six Panel types of §51.3",
      "Engagement & Retention (generated only from §51.0.2 Retention Cohorts)",
    ],
  },
];

const M5_ROW_TOKENS = [
  "`retention_cohort_canonical_consumer`",
  "runtime_active",
  "tools/spec-lint/gates/retention_cohort_canonical_consumer.ts",
  "§51.0.2 as the exhaustive retention-cohort registry",
  "§50.14.3, §51.3, and §51.5 consume it",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  tokens: string[],
) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, line, token, `${label} is missing retention-cohort canonical-consumer binding: ${token}`);
    }
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function isAllowedDefinitionLine(doc: SpecDoc, line: number, text: string): boolean {
  const anchor = anchorForLine(doc, line);
  if (anchor === "51.0.2-retention-cohorts") return true;
  if (text.includes("§51.0.2")) return true;
  return false;
}

export const gate: SpecLintGate = {
  id: "retention_cohort_canonical_consumer",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const item of REQUIRED_SECTIONS) {
      const section = sectionText(doc, item.anchor);
      if (!section) {
        push(findings, doc, 0, item.anchor, `${item.label} is missing.`);
        continue;
      }
      requireTokens(findings, doc, section.text, section.line, item.label, item.tokens);
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const text = doc.lines[line] ?? "";
      if (!text.trim()) continue;

      const namesCohortCadences = /\bD1\s*\/\s*D7\s*\/\s*D30\b/.test(text);
      if (namesCohortCadences && !isAllowedDefinitionLine(doc, line, text)) {
        push(
          findings,
          doc,
          line,
          text,
          "D1/D7/D30 retention references outside §51.0.2 must cite §51.0.2 instead of acting as standalone cohort definitions.",
        );
      }

      const definesAnchorReturning =
        /\|\s*[^|]*Anchor Event\s*\|\s*Returning Event\s*\|/.test(text) ||
        /\banchor event is\b/i.test(text) ||
        /\breturning-user event is\b/i.test(text);
      if (definesAnchorReturning && !isAllowedDefinitionLine(doc, line, text)) {
        push(
          findings,
          doc,
          line,
          text,
          "Retention anchor/returning-event definitions must live only in §51.0.2.",
        );
      }
    }

    const m5Row = findLine(doc, (line) => line.trim().startsWith("| `retention_cohort_canonical_consumer` |"));
    if (!m5Row) {
      push(findings, doc, 0, "`retention_cohort_canonical_consumer`", "§M.5 row retention_cohort_canonical_consumer is missing.");
    } else {
      requireTokens(findings, doc, m5Row.text, m5Row.line, "§M.5 retention_cohort_canonical_consumer row", M5_ROW_TOKENS);
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
