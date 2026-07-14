/**
 * Gate: `hero_moment_abandonment_recovery_cadence_completeness`
 *
 * Assertion: §48.8.12 seller Hero Moment abandonment recovery has complete
 * spec-tree registration across Appendix C, Appendix G, §41.2, and §M.5. This
 * gate proves catalog/documentation completeness only; product cron deployment
 * remains product-pack evidence.
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

const GATE_ID = "hero_moment_abandonment_recovery_cadence_completeness";

const SECTION_48_TOKENS = [
  "**Three-stage recovery cadence.**",
  "`hero_moment_abandonment_24h`",
  "`hero_moment_abandonment_pre_sweep`",
  "`hero_moment_abandonment_re_issue`",
  "`hero_moment_abandonment_24h_email_sent {seller_org_id, session_id, elapsed_seconds_since_sso}`",
  "`hero_moment_abandonment_pre_sweep_email_sent`",
  "`hero_moment_abandonment_re_issue_email_sent`",
  "`hero_moment_abandonment_recovered {original_session_id, new_session_id}`",
  "The Convex cron `hero_moment_abandonment_sweeper` runs at 15-minute cadence",
  "idempotently enqueues at most one email per (session_id, recovery_stage) pair",
  "QA test `hero_moment_abandonment_recovery_idempotency` asserts",
  "the Convex `hero_moment_abandonment_sweeper` cron contract is specified in AC #1",
  "Product-runtime proof that the cron is deployed remains implementation-pack evidence",
];

const APPENDIX_C_ROWS: Record<string, readonly string[]> = {
  hero_moment_abandonment_24h: ["Email (Loops.so) + In-app inbox card", "Idempotent on `(session_id, recovery_stage='24h')`", "Loops.so non-webhook dispatch policy"],
  hero_moment_abandonment_pre_sweep: ["Email + In-app", "Idempotent on `(session_id, recovery_stage='pre_sweep')`", "magic_link_extended_72h"],
  hero_moment_abandonment_re_issue: ["Email", "Idempotent on `(original_session_id, recovery_stage='re_issue')`", "magic_link_validity_hours=72"],
};

const APPENDIX_G_ROWS: Record<string, readonly string[]> = {
  hero_moment_abandonment_24h_email_sent: ["elapsed_seconds_since_sso", "recovery_stage='24h'", "magic_link_reissued=boolean"],
  hero_moment_abandonment_pre_sweep_email_sent: ["sweep_at", "recovery_stage='pre_sweep'", "magic_link_extended_72h=boolean"],
  hero_moment_abandonment_re_issue_email_sent: ["original_session_id", "new_session_id", "magic_link_validity_hours=72"],
  hero_moment_abandonment_recovered: ["original_session_id", "new_session_id", "kb_draft_entries_prepopulated=boolean"],
};

const EMAIL_CATALOG_ROWS: Record<string, readonly string[]> = {
  "Hero Moment Abandonment 24h": [
    "`hero_moment_abandonment_24h`",
    "Your bid is still drafted and waiting - pick up where you left off",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3",
  ],
  "Hero Moment Abandonment Pre-Sweep": [
    "`hero_moment_abandonment_pre_sweep`",
    "Your bid will be archived in 12 hours unless you respond",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3",
  ],
  "Hero Moment Abandonment Re-Issue": [
    "`hero_moment_abandonment_re_issue`",
    "We saved your Sourcera bid draft",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3",
  ],
  "Firecrawl Recovery Re-Bootstrap Completed": [
    "`firecrawl_recovery_re_bootstrap_completed`",
    "Your Sourcera bid draft has new website evidence",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "§48.8.3 FM #6(f)",
  ],
};

const M5_ROW_TOKENS = [
  "spec-tree Appendix C / Appendix G / §41.2 / §48.8.12 catalog completeness only",
  "production Convex cron deployment and send-path execution remain product-pack evidence",
  "Convex sweeper contract specified with cadence, idempotency, and QA binding",
  "closes D-HM-006 documentation gap",
];

function requireTableRow(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  const row = findLine(doc, predicate);
  if (!row) {
    push(findings, doc, 0, label, `${label} row is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `${label} row is missing required token: ${token}`);
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
      sectionTextByAnchor(doc, "48.8.12-abandonment-recovery"),
      "§48.8.12 Abandonment Recovery",
      SECTION_48_TOKENS,
    );

    for (const [event, tokens] of Object.entries(APPENDIX_C_ROWS)) {
      requireTableRow(
        findings,
        doc,
        `Appendix C ${event}`,
        (line) => line.trim().startsWith(`| \`${event}\` |`),
        tokens,
      );
    }

    for (const [event, tokens] of Object.entries(APPENDIX_G_ROWS)) {
      requireTableRow(
        findings,
        doc,
        `Appendix G ${event}`,
        (line) => line.trim().startsWith(`| \`${event}\` |`),
        tokens,
      );
    }

    for (const [label, tokens] of Object.entries(EMAIL_CATALOG_ROWS)) {
      requireTableRow(
        findings,
        doc,
        `§41.2 ${label}`,
        (line) => line.trim().startsWith(`| ${label} |`),
        tokens,
      );
    }

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
