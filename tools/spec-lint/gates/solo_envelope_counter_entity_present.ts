/**
 * Gate: `solo_envelope_counter_entity_present`
 *
 * Assertion: the SoloEnvelopeCounter entity is authored at data-model fidelity
 * whenever Solo envelope throttling is referenced by §34.10.3 or §44.6.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.14 SoloEnvelopeCounter",
    anchor: "4.8.14-soloenvelopecounter-org-scoped-per-console-engine-internal",
    tokens: [
      "Authored Extension",
      "AE-V72REM-PHCONS-PRICING-CORE-P1-01",
      "internal accounting record for Solo-tier absorbed AI usage",
      "| `id` | UUID | Primary key | Auto-generated |",
      "| `org_id` | UUID (FK) | FK → Organization; required |",
      "| `console` | Enum | `buyer`, `seller`; required |",
      "| `plan_tier` | Enum | `buyer_solo` or `seller_solo`; required |",
      "| `billing_mode` | Enum | See Appendix J `solo_envelope_counter_billing_mode`: `solo_subscription`, `solo_per_eval`, `solo_per_bid` |",
      "| `throttling_state` | Enum | See Appendix J `solo_envelope_counter_state`: `healthy`, `throttling_eligible`, `throttled`, `exhausted`, `absorption_cap_reached`, `closed` |",
      "| `absorption_cap_value_dollars` | Integer | > `envelope_value_dollars`;",
      "**Indexes.** `(org_id, console)` UNIQUE WHERE `closed_at IS NULL`",
      "**Scope Isolation.**",
      "**Customer reads:** Forbidden.",
      "**State Machine.**",
      "| `healthy` | `throttling_eligible` |",
      "| `throttling_eligible` | `throttled` |",
      "| `healthy` / `throttling_eligible` / `throttled` | `exhausted` |",
      "| `healthy` / `throttling_eligible` / `throttled` / `exhausted` | `absorption_cap_reached` |",
      "| Any active state | `closed` |",
      "**Failure Modes Addressed.**",
      "**Acceptance Criteria.**",
      "Exactly one non-closed SoloEnvelopeCounter row MAY exist per `(org_id, console)`",
      "SoloEnvelopeCounter MUST NOT be returned by any customer-facing wallet, billing-ledger, pricing, webhook, PostHog customer mirror, or export endpoint.",
      "**Retention.** Org-life + 7 years for financial audit.",
      "Data residency follows the owning Org per §40.4.",
    ],
  },
  {
    label: "§34.10.3 Solo-co-resident pool rule",
    title: /^34\.10\.3\b/,
    tokens: [
      "Two engine-side envelopes run independently",
      "engine writes per-console envelope counters separately",
      "Solo's envelope stays engine-side",
    ],
  },
  {
    label: "§44.6 Solo-Tier Surface Treatment",
    anchor: "44.6-solo-tier-surface-treatment",
    tokens: [
      "SoloEnvelopeCounter creation",
      "§4.8.14 `SoloEnvelopeCounter.absorption_cap_value_dollars`",
      "§4.8.14 transitions to `absorption_cap_reached`",
      "Once `SoloEnvelopeCounter.throttling_state='absorption_cap_reached'`",
    ],
  },
  {
    label: "Appendix J Solo Envelope Counter Billing Mode",
    title: /^Solo Envelope Counter Billing Mode\b/,
    tokens: ["`solo_subscription`, `solo_per_eval`, `solo_per_bid`"],
  },
  {
    label: "Appendix J Solo Envelope Counter State",
    title: /^Solo Envelope Counter State\b/,
    tokens: ["`healthy`, `throttling_eligible`, `throttled`, `exhausted`, `absorption_cap_reached`, `closed`"],
  },
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/solo_envelope_counter_entity_present.ts",
  "§4.8 MUST define `SoloEnvelopeCounter`",
  "Appendix J enums",
  "Appendix K term",
  "audit entity registration",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify SoloEnvelopeCounter entity contract.`,
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
        message: `${label} is missing SoloEnvelopeCounter binding: ${token}`,
      });
    }
  }
  return findings;
}

function findM5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `solo_envelope_counter_entity_present` |")) return { text: line, line: i };
  }
  return null;
}

function appendixKGlossaryFindings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.includes("**SoloEnvelopeCounter.**"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "**SoloEnvelopeCounter.**",
        message: "Appendix K SoloEnvelopeCounter glossary entry is missing.",
      },
    ];
  }
  return requireTokens(doc, doc.lines[line] ?? "", line, "Appendix K SoloEnvelopeCounter glossary entry", [
    "engine-internal per-Org-per-console counter",
    "without rendering wallet balance, rate card, per-operation costs, envelope value, or remaining headroom",
    "absorption_cap_reached",
    "See §4.8.14",
  ]);
}

function auditEntityRegistrationFindings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex(
    (value) => value?.includes("`organization`, `org_membership`") && value.includes("`solo_envelope_counter`"),
  );
  if (line >= 0) return [];
  return [
    {
      file: doc.path,
      line: 0,
      matched_text: "`solo_envelope_counter`",
      message: "Appendix J audit_event_entity_type registry is missing `solo_envelope_counter`.",
    },
  ];
}

export const gate: SpecLintGate = {
  id: "solo_envelope_counter_entity_present",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "data_model_contract",
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

    findings.push(...appendixKGlossaryFindings(doc));
    findings.push(...auditEntityRegistrationFindings(doc));

    const m5 = findM5Row(doc);
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`solo_envelope_counter_entity_present`",
        message: "Appendix M.5 solo_envelope_counter_entity_present row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 solo_envelope_counter_entity_present row", M5_TOKENS));
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
