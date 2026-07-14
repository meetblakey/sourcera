/**
 * Gate: `email_type_catalog_coverage`
 *
 * Assertion: every Appendix C affirmative Email-channel notification event is
 * covered by the generated §41.2 EmailTemplate / email_kind binding contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, splitUnescapedPipes } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, sectionText } from "./email_domain_gate_helpers.js";

interface TableBlock {
  header: string[];
  rows: Array<{ cells: string[]; line: number }>;
}

const GATE_ID = "email_type_catalog_coverage";

const REQUIRED_41_2_TOKENS = [
  "### 41.2.4 Appendix C Email-Channel Generated Registry {#41.2.4-appendix-c-email-channel-generated-registry}",
  "**Email-channel affirmative row definition.**",
  "EmailTemplate.`appendix_c_event_name`",
  "EmailTemplate.`status='active'`",
  "email_kind = Appendix C `Event` value normalized to snake_case by replacing `.` with `_`",
  "| Event source pattern | Email category | Opt-out class | Sender | Reply-To policy |",
  "| Billing, security, privacy, DSAR, Ops-session, residency, DR, SLA, incident, or provider-failure notices | `operational_critical` | `transactional_critical` | `noreply@sourcera.io`, `privacy@sourcera.io`, or `billing@sourcera.io` by source domain | `privacy_support`, `billing_support`, or `noreply` by source domain |",
  "| Marketing or product-announcement rows | `marketing` | `marketing_lifecycle_opt_in` | `marketing@sourcera.io` | `marketing_replies` |",
  "| Lifecycle, digest, reminder, recovery, onboarding, referral, conversion, growth-loop, marketplace-editorial, CRM, KB, or optional-email rows | `lifecycle` | `marketing_lifecycle_opt_in` | `noreply@sourcera.io` | `workspace_inbox`, `seller_inbox`, or `noreply` by source domain |",
  "| All remaining affirmative Email-channel rows | `transactional` | `transactional_no_opt_out` | `noreply@sourcera.io` | `workspace_inbox`, `seller_inbox`, or `noreply` by source domain |",
];

const REQUIRED_APPENDIX_J_TOKENS = [
  "The generated extension is closed over Appendix C affirmative Email-channel rows: `email_kind` also includes the dot-to-underscore normalized `Event` value for every Appendix C row that §41.2.4 classifies as email-channel affirmative.",
  "The detector `email_type_catalog_coverage` expands this generated set at lint time and fails on any affirmative Email-channel event that cannot resolve through §41.2.4.",
];

function splitCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return splitUnescapedPipes(trimmed).map((cell) => cell.trim());
}

function tableBlocksInSection(doc: SpecDoc, anchor: string): TableBlock[] {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return [];
  const blocks: TableBlock[] = [];
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    const next = doc.lines[line + 1] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    if (!/^\s*\|\s*:?-{2,}/.test(next)) continue;
    const header = splitCells(raw).map((cell) => cell.replace(/`/g, "").trim());
    const rows: TableBlock["rows"] = [];
    let rowLine = line + 2;
    for (; rowLine <= section.endLine; rowLine++) {
      const rowRaw = doc.lines[rowLine] ?? "";
      if (!/^\s*\|.*\|\s*$/.test(rowRaw)) break;
      if (/^\s*\|\s*:?-{2,}/.test(rowRaw)) continue;
      rows.push({ cells: splitCells(rowRaw), line: rowLine });
    }
    blocks.push({ header, rows });
    line = rowLine;
  }
  return blocks;
}

function firstBacktickToken(cell: string): string {
  return /`([^`]+)`/.exec(cell)?.[1] ?? cell.replace(/`/g, "").trim();
}

function isNegativeEmailCell(cell: string): boolean {
  const normalized = cell.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "no" ||
    normalized === "n/a" ||
    normalized.startsWith("no ") ||
    normalized.includes("no customer email") ||
    normalized.includes("not customer-visible")
  );
}

function isEmailAffirmative(cell: string, fromEmailColumn: boolean): boolean {
  if (isNegativeEmailCell(cell)) return false;
  if (fromEmailColumn) return true;
  return /\bemail\b/i.test(cell);
}

function appendixCEmailEvents(doc: SpecDoc): Array<{ event: string; line: number; channel: string }> {
  const events: Array<{ event: string; line: number; channel: string }> = [];
  const seen = new Set<string>();
  for (const block of tableBlocksInSection(doc, "appendix-c-notification-event-catalog")) {
    const eventIdx = block.header.findIndex((h) => /^Event\b/i.test(h));
    const emailIdx = block.header.findIndex((h) => /^Email$/i.test(h));
    const channelsIdx = block.header.findIndex((h) => /^Channels?$/i.test(h));
    if (eventIdx < 0 || (emailIdx < 0 && channelsIdx < 0)) continue;
    const channelIdx = emailIdx >= 0 ? emailIdx : channelsIdx;
    for (const row of block.rows) {
      const event = firstBacktickToken(row.cells[eventIdx] ?? "");
      const channel = row.cells[channelIdx] ?? "";
      if (!event) continue;
      if (!isEmailAffirmative(channel, emailIdx >= 0)) continue;
      if (seen.has(event)) continue;
      seen.add(event);
      events.push({ event, line: row.line, channel });
    }
  }
  return events;
}

function requireTokensInSection(
  doc: SpecDoc,
  anchor: string,
  label: string,
  tokens: string[],
): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return findings;
  }
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      push(findings, doc, section.startLine, token, `${label} is missing required email catalog binding token: ${token}`);
    }
  }
  return findings;
}

function appendixCFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "appendix-c-notification-event-catalog");
  if (!section) {
    push(findings, doc, 0, "appendix-c-notification-event-catalog", "Appendix C is missing; cannot verify email type catalog coverage.");
    return findings;
  }
  const events = appendixCEmailEvents(doc);
  if (events.length === 0) {
    push(findings, doc, section.startLine, "Email", "Appendix C has no affirmative Email-channel rows; this is unexpected and would make §41.2 coverage vacuous.");
    return findings;
  }
  for (const item of events) {
    if (item.channel.length > 240) {
      findings.push({
        file: doc.path,
        line: item.line,
        anchor: anchorForLine(doc, item.line),
        matched_text: item.channel,
        message: `Appendix C email-channel cell for ${item.event} is too broad to classify safely; split Email policy into a bounded cell before relying on §41.2.4 generated binding.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    findings.push(...appendixCFindings(doc));
    findings.push(...requireTokensInSection(doc, "41.2-complete-email-type-catalog", "§41.2", REQUIRED_41_2_TOKENS));
    findings.push(...requireTokensInSection(doc, "appendix-j-controlled-vocabulary-registry", "Appendix J", REQUIRED_APPENDIX_J_TOKENS));
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
