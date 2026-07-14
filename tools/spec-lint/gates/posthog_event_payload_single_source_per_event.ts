/**
 * Gate: `posthog_event_payload_single_source_per_event`
 *
 * Assertion: Appendix G is the only payload-schema source for seller Hero
 * Moment `hero_moment_completed` and `hero_moment_latency_breached`. Body
 * sections may consume the events, but must not restate stale payload shapes.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "posthog_event_payload_single_source_per_event";

const SECTION_48_TOKENS = [
  "`hero_moment_completed` - emit per Appendix G canonical row; payload schema MUST NOT be restated here.",
  "`hero_moment_latency_breached` - emit per Appendix G canonical row; trigger is pause-adjusted §44.1 Stage-3 threshold breach with `provider_health_state(firecrawl) = healthy`; payload schema MUST NOT be restated here.",
  "The `hero_moment_latency_breached` event (per §48.8.3 Failure Mode #3) does NOT fire under provider-outage pause.",
];

const SECTION_49_TOKENS = [
  "| `hero_moment_completed` | `hero_moment_completed_at` write | Appendix G canonical schema only; §49.1 MUST NOT restate payload properties",
  "| `hero_moment_latency_breached` | Pause-adjusted §44.1 `Seller onboarding Stage-3 population-latency threshold` breach | Appendix G canonical schema only; trigger excludes Firecrawl-outage pause windows via §48.8.3 Failure Mode #6(c); §49.1 MUST NOT restate payload properties.",
];

const APPENDIX_G_ROWS: Record<string, readonly string[]> = {
  hero_moment_completed: [
    "single canonical terminal predicate",
    "pause-adjusted latency satisfies §44.1",
    "`seller_org_id`, `bid_id`, `session_id`",
    "`stage_3_population_latency_ms`",
    "`stage_3_firecrawl_outage_pause_ms`",
    "`stage_3_kb_draft_entry_count`",
    "`stage_3_first_pass_response_requirement_count`",
    "`stage_3_first_pass_response_cited_count`",
    "`capability_degradation_triggered=boolean`",
    "emitters MUST emit only the canonical fields above",
  ],
  hero_moment_latency_breached: [
    "Pause-adjusted `stage_3_population_latency_ms` breaches §44.1",
    "`provider_health_state(firecrawl) = healthy`",
    "Firecrawl-outage pause window is excluded per §48.8.3 Failure Mode #6(c)",
    "`seller_org_id`, `bid_id`, `session_id`",
    "`stage_3_population_latency_ms`",
    "`stage_3_firecrawl_outage_pause_ms`",
    "`threshold_ms` sourced from §44.1",
    "prior bottleneck-phase variant",
    "is retired at v7.1.0",
  ],
};

const M5_ROW_TOKENS = [
  "Appendix G is the single payload-schema source",
  "§48.8.3 and §49.1 consume it without restating payload properties",
  "stale payload variants lacking `session_id` / `stage_3_firecrawl_outage_pause_ms` are rejected",
  "PostHog production emission, generated schemas, analytics delivery, deploy validators, and runtime event payload correctness remain product-pack evidence",
  "closes D-HM-003 + D-HM-004 documentation gap",
];

const STALE_INLINE_PATTERNS: Array<{ re: RegExp; message: string }> = [
  {
    re: /`hero_moment_completed`\s*\{seller_org_id,\s*bid_id,\s*stage_3_population_latency_ms/,
    message: "§48.8.3 must cite Appendix G instead of restating the stale hero_moment_completed payload.",
  },
  {
    re: /`hero_moment_latency_breached`\s*\{seller_org_id,\s*bid_id,\s*stage_3_population_latency_ms,\s*threshold_ms\}/,
    message: "§48.8.3 must cite Appendix G instead of restating the stale hero_moment_latency_breached payload.",
  },
];

function requireTableRow(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  scope: { text: string; startLine: number } | null,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  let row: { text: string; line: number } | null = null;
  if (scope) {
    const lines = scope.text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (predicate(lines[i] ?? "")) {
        row = { text: lines[i] ?? "", line: scope.startLine + i };
        break;
      }
    }
  }
  if (!row) {
    push(findings, doc, scope?.startLine ?? 0, label, `${label} row is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `${label} row is missing required token: ${token}`);
  }
}

function rejectStalePayloadRestatements(findings: Finding[], doc: SpecDoc) {
  for (let line = 1; line < doc.lines.length; line += 1) {
    const text = doc.lines[line] ?? "";
    for (const { re, message } of STALE_INLINE_PATTERNS) {
      if (re.test(text)) push(findings, doc, line, text, message);
    }

    if (text.includes("| `hero_moment_completed` |") && text.includes("{seller_org_id")) {
      push(findings, doc, line, text, "§49.1 must cite Appendix G instead of restating the stale hero_moment_completed payload.");
    }
    if (text.includes("| `hero_moment_latency_breached` |") && text.includes("{seller_org_id")) {
      push(findings, doc, line, text, "§49.1 must cite Appendix G instead of restating the stale hero_moment_latency_breached payload.");
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(
      findings,
      doc,
      sectionTextByAnchor(doc, "48.8.3-onboarding-surface-minutes-0-3"),
      "§48.8.3 Onboarding Surface",
      SECTION_48_TOKENS,
    );

    requireTokens(
      findings,
      doc,
      sectionTextByAnchor(doc, "49.1.3-stage-3-first-pass-draft"),
      "§49.1.3 Stage 3 First-Pass Draft",
      SECTION_49_TOKENS,
    );

    const appendixGSection = sectionTextByAnchor(doc, "appendix-g-section-48-additions");
    for (const [event, tokens] of Object.entries(APPENDIX_G_ROWS)) {
      requireTableRow(
        findings,
        doc,
        `Appendix G ${event}`,
        appendixGSection,
        (line) => line.trim().startsWith(`| \`${event}\` |`),
        tokens,
      );
    }

    rejectStalePayloadRestatements(findings, doc);

    const m5Row = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
    if (m5Row) {
      for (const token of M5_ROW_TOKENS) {
        if (!m5Row.text.includes(token)) push(findings, doc, m5Row.line, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
