/**
 * Gate: `pulse_threshold_event_catalog_consistency`
 *
 * Assertion: Pulse threshold events resolve across §20, §31.14, Appendix C,
 * Appendix G, Appendix J, and the WorkspacePulseHealth transition pointer.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor?: string;
  title?: RegExp;
  label: string;
  tokens: string[];
}

const EVENT = "pulse.health_score_threshold_breached";

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    title: /^4\.3\.22\.2 WorkspacePulseHealth\b/,
    label: "§4.3.22.2 WorkspacePulseHealth",
    tokens: [
      "| `band_transition_event_id` | UUID | Nullable; FK -> webhook / notification outbox event | Populated when §31.14 `pulse.health_score_threshold_breached` is emitted |",
      "(band_transition_event_id)` WHERE `band_transition_event_id IS NOT NULL`",
      "Color-band transitions into yellow or red MUST populate `band_transition_event_id`",
    ],
  },
  {
    anchor: "20.3-pulse-health-score",
    label: "§20.3 Pulse Health Score",
    tokens: [
      "- **Threshold events:** Color-band transitions into yellow or red emit `pulse.health_score_threshold_breached` per §31.14.",
      "WorkspacePulseHealth.`band_transition_event_id` stores the correlation pointer",
    ],
  },
  {
    anchor: "20.7-acceptance-criteria",
    label: "§20.7 Acceptance Criteria",
    tokens: [
      "6. A color-band transition into yellow or red MUST emit `pulse.health_score_threshold_breached` through §31.14 exactly once per debounce window and store the correlation pointer on WorkspacePulseHealth.",
    ],
  },
  {
    anchor: "31.14-pulse-domain-webhook-completeness-pack",
    label: "§31.14 Pulse-Domain Webhook Completeness Pack",
    tokens: [
      "| `pulse.health_score_threshold_breached` | `pulse_domain` | WorkspacePulseHealth color-band transition into `yellow` or `red`",
      "`workspace_pulse_health_id`",
      "`band_transition`",
      "Buyer Org webhook endpoints subscribed to Pulse-domain events",
      "Seller and public Marketplace subscribers are not eligible",
      "`band_transition` values are Appendix J `pulse_health_band_transition`.",
      "The event is also registered in Appendix C and Appendix G.",
      "Appendix C and Appendix G registrations MUST match the §31.14 event name and payload field set.",
    ],
  },
  {
    title: /^`pulse_health_band_transition`/,
    label: "Appendix J pulse_health_band_transition",
    tokens: [
      "`green_to_yellow`, `green_to_red`, `yellow_to_red`, `yellow_to_green`, `red_to_yellow`, `red_to_green`",
      "Records semantic color-band transitions for WorkspacePulseHealth and the `pulse.health_score_threshold_breached` webhook.",
      "Only transitions into yellow or red emit the threshold-breached event",
    ],
  },
  {
    anchor: "m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition",
    label: "§M.5.47 pulse_threshold_event_catalog_consistency row",
    tokens: [
      "| `pulse_threshold_event_catalog_consistency` | webhook_catalog_consistency | **`runtime_active`**",
      "tools/spec-lint/gates/pulse_threshold_event_catalog_consistency.ts",
      "Every reference to `pulse.health_score_threshold_breached` MUST resolve to §31.14, Appendix C, Appendix G, Appendix J `pulse_health_band_transition`, and the WorkspacePulseHealth transition pointer.",
    ],
  },
];

const LINE_EXPECTATIONS = [
  {
    label: "Appendix C Pulse-Domain event row",
    match: "`pulse.health_score_threshold_breached` | WorkspacePulseHealth color-band transition into yellow or red (§20.3.4 / §31.14)",
    tokens: [
      "Workspace Owner, Workspace Admins, Executive Sponsor",
      "subscribed Buyer Org webhook endpoints",
      "`standard` (F.1)",
      "`workspace_pulse_health_id`",
      "`band_transition`",
    ],
  },
  {
    label: "Appendix G Pulse threshold mirror row",
    match: "| `pulse_health_score_threshold_breached` | Mirror of Appendix C `pulse.health_score_threshold_breached` |",
    tokens: [
      "`source_webhook_event_type='pulse.health_score_threshold_breached'`",
      "`workspace_pulse_health_id`",
      "`band_transition`",
      "`debounce_window_minutes`",
    ],
  },
  {
    label: "Appendix J pulse_health_color_band note",
    match: "drives Appendix J `pulse_health_band_transition` threshold-transition detection for `pulse.health_score_threshold_breached`",
    tokens: ["WorkspacePulseHealth", "pulse_health_band_transition"],
  },
];

function sectionText(doc: SpecDoc, expectation: SectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = expectation.anchor
    ? findSectionByAnchor(doc, expectation.anchor)
    : expectation.title
      ? findSectionByTitle(doc, expectation.title)
      : null;
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `${label} is missing Pulse threshold-event catalog binding: ${token}`,
      });
    }
  }
  return findings;
}

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const expectation of SECTION_EXPECTATIONS) {
    const section = sectionText(doc, expectation);
    if (!section) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: expectation.anchor,
        message: `${expectation.label} section is missing; cannot verify Pulse threshold-event catalog consistency.`,
      });
      continue;
    }
    findings.push(...requireTokens(doc, section.text, section.line, expectation.label, expectation.tokens));
  }
  return findings;
}

function lineIncluding(doc: SpecDoc, match: string): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.includes(match)) return { text: line, line: i };
  }
  return null;
}

function lineFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const expectation of LINE_EXPECTATIONS) {
    const line = lineIncluding(doc, expectation.match);
    if (!line) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: expectation.match,
        message: `${expectation.label} is missing.`,
      });
      continue;
    }
    findings.push(...requireTokens(doc, line.text, line.line, expectation.label, expectation.tokens));
  }
  return findings;
}

function staleReferenceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const staleBroadSection = new RegExp(`${EVENT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*\\(§31\\)`);
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (!line.includes(EVENT)) continue;
    if (staleBroadSection.test(line) || line.includes("when §31 `pulse.health_score_threshold_breached`")) {
      findings.push({
        file: doc.path,
        line: i,
        anchor: anchorForLine(doc, i),
        matched_text: line.trim(),
        message: "`pulse.health_score_threshold_breached` references must cite §31.14, not broad §31.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "pulse_threshold_event_catalog_consistency",
  sourcePhase: "4.11",
  rowClass: "webhook_catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...sectionFindings(doc),
      ...lineFindings(doc),
      ...staleReferenceFindings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
