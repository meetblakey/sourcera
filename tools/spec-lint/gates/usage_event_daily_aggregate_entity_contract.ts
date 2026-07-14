/**
 * Gate: `usage_event_daily_aggregate_entity_contract`
 *
 * Assertion: UsageEventDailyAggregate is authored at entity-table fidelity as
 * the dashboard / wallet / Time-Saved daily read model.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_TOKENS = [
  "Daily aggregate read model derived from §4.3.18 Usage Event rows",
  "Raw Usage Event remains the system of record",
  "| `id` | UUID | Primary key | Auto-generated |",
  "| `org_id` | UUID (FK) | Organization ID | Owning Org |",
  "| `console` | Enum | `buyer` \\| `seller` | Source console being aggregated |",
  "| `usage_date_utc` | Date | Required; UTC day bucket |",
  "| `capability_id` | UUID (FK) | Capability Declaration ID, nullable |",
  "| `event_category` | Enum | See Appendix J `usage_event_category` | Rollup dimension |",
  "| `event_count` | BigInt | ≥ 0 |",
  "| `total_ai_value_cents` | BigInt | ≥ 0 |",
  "| `failed_posthog_delivery_count` | Integer | ≥ 0 |",
  "| `source_event_high_watermark_at` | Timestamp | Required |",
  "| `last_recomputed_at` | Timestamp | Required |",
  "UNIQUE `(org_id, console, capability_id, event_category, usage_date_utc)`",
  "**Scope Isolation:** Org-scoped and console-filtered",
  "**Retention:** Retained for Org-life as a non-PII aggregate.",
  "DSAR recomputation job MUST rederive affected buckets",
  "**Authoring Intent:** This read model closes the D-DEC-002 performance gap",
  "**Acceptance Criteria:**",
  "MUST enqueue an idempotent aggregate recompute",
  "MUST be deterministic from raw Usage Event rows",
  "MUST not use PostHog as source of truth",
  "MUST contain no PII-bearing fields",
];

const CROSS_REFERENCE_TOKENS = [
  "Usage Dashboard, AI Wallet, and Time-Saved reporting",
  "§44.5 performance envelope",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/usage_event_daily_aggregate_entity_contract.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "field table, unique bucket key, scope isolation, retention/DSAR, indexes, authoring intent, and acceptance criteria",
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

function sectionText(doc: SpecDoc): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, "4.3.18.a-usage-event-daily-aggregate");
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(doc: SpecDoc, line: number, text: string, label: string, tokens: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, line, token, `${label} is missing UsageEventDailyAggregate contract token: ${token}`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.trim().startsWith("| `usage_event_daily_aggregate_entity_contract` |"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "`usage_event_daily_aggregate_entity_contract`",
        message: "Appendix M.5 row usage_event_daily_aggregate_entity_contract is missing.",
      },
    ];
  }
  return requireTokens(doc, line, doc.lines[line] ?? "", "§M.5 usage_event_daily_aggregate_entity_contract row", M5_TOKENS);
}

export const gate: SpecLintGate = {
  id: "usage_event_daily_aggregate_entity_contract",
  sourcePhase: "v7.2.0-REM Phase DEC",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = sectionText(doc);
    const findings: Finding[] = [];
    if (!section) {
      push(findings, doc, 0, "§4.3.18.A", "§4.3.18.A Usage Event Daily Aggregate section is missing.");
    } else {
      findings.push(...requireTokens(doc, section.line, section.text, "§4.3.18.A", SECTION_TOKENS));
      findings.push(...requireTokens(doc, section.line, section.text, "§4.3.18.A cross-reference", CROSS_REFERENCE_TOKENS));
    }
    findings.push(...m5Findings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
