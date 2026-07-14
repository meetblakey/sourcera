/**
 * Gate: `crm_sync_event_catalog_consistency`
 *
 * Assertion: §31.9.10, Appendix C, Appendix G, and Appendix J stay aligned for
 * the CRM Sync webhook event set and activity-state review-hold contract.
 */

import { computeSectionRanges, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "crm_sync_event_catalog_consistency";

const CRM_SYNC_EVENTS = [
  "seller.crm_sync.connection_activated",
  "seller.crm_sync.connection_paused",
  "seller.crm_sync.connection_auto_resumed",
  "seller.crm_sync.connection_revoked",
  "seller.crm_sync.connection_disconnected",
  "seller.crm_sync.oauth_token_refresh_failed",
  "seller.crm_sync.oauth_scope_insufficient_at_upgrade",
  "seller.crm_sync.activity_written",
  "seller.crm_sync.activity_failed",
  "seller.crm_sync.activity_dead_lettered",
  "seller.crm_sync.account_created",
  "seller.crm_sync.review_queue_item_created",
  "seller.crm_sync.field_mapping_updated",
  "seller.crm_sync.field_mapping_reverted_on_downgrade",
  "seller.crm_sync.field_mapping_schema_drift_detected",
  "seller.crm_sync.routing_rule_updated",
  "seller.crm_sync.review_queue_saturation",
  "seller.crm_sync.connection_health_critical",
  "seller.crm_sync.dsar_cascade_notification",
];

const CRM_SYNC_STATES = [
  "pending",
  "in_flight",
  "succeeded",
  "failed_retryable",
  "failed_permanent",
  "dead_lettered",
  "redacted_by_dsar",
];

function crmMirror(event: string): string {
  return event.replace(/\./g, "_");
}

function sectionByTitle(doc: SpecDoc, title: string): { text: string; startLine: number; endLine: number } | null {
  const section = computeSectionRanges(doc).find((range) => range.heading.title.includes(title));
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function tableRows(doc: SpecDoc, section: { startLine: number; endLine: number } | null) {
  if (!section) return [];
  return parseTableAt(doc, section.startLine, section.endLine).rows;
}

function firstBacktick(cell: string): string | null {
  return cell.match(/`([^`]+)`/)?.[1] ?? null;
}

function compareEventSet(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  section: { startLine: number; endLine: number } | null,
  events: string[],
) {
  if (!section) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }

  const counts = new Map<string, number>();
  const extras: string[] = [];
  for (const row of tableRows(doc, section)) {
    const event = firstBacktick(row.cells[0] ?? "");
    if (!event || !event.startsWith("seller.crm_sync.")) continue;
    counts.set(event, (counts.get(event) ?? 0) + 1);
    if (!events.includes(event)) extras.push(event);
  }

  for (const event of events) {
    const count = counts.get(event) ?? 0;
    if (count !== 1) push(findings, doc, section.startLine, event, `${label} must contain exactly one row for ${event}; found ${count}.`);
  }
  for (const event of extras) {
    push(findings, doc, section.startLine, event, `${label} contains non-canonical CRM Sync event ${event}.`);
  }
}

function appendixGMirrorFindings(
  findings: Finding[],
  doc: SpecDoc,
  section: { startLine: number; endLine: number } | null,
) {
  const label = "Appendix G CRM Sync mirror catalog";
  if (!section) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }

  const rows = tableRows(doc, section);
  const byMirror = new Map<string, { line: number; source: string | null; text: string }>();
  const extras: string[] = [];
  for (const row of rows) {
    const mirror = firstBacktick(row.cells[0] ?? "");
    if (!mirror || !mirror.startsWith("seller_crm_sync_")) continue;
    const text = row.cells.join(" | ");
    const source = text.match(/source_webhook_event_type='([^']+)'/)?.[1] ?? null;
    byMirror.set(mirror, { line: row.line, source, text });
    if (!CRM_SYNC_EVENTS.map(crmMirror).includes(mirror)) extras.push(mirror);
  }

  for (const event of CRM_SYNC_EVENTS) {
    const mirror = crmMirror(event);
    const row = byMirror.get(mirror);
    if (!row) {
      push(findings, doc, section.startLine, mirror, `${label} is missing mirror row ${mirror}.`);
      continue;
    }
    if (row.source !== event) {
      push(findings, doc, row.line, row.source ?? mirror, `${mirror} must carry source_webhook_event_type='${event}'.`);
    }
  }
  for (const mirror of extras) {
    push(findings, doc, section.startLine, mirror, `${label} contains non-canonical CRM Sync mirror ${mirror}.`);
  }

  for (const analyticsOnly of ["crm_sync_activity_emitted", "crm_sync_review_queue_item_resolved"]) {
    const line = doc.lines
      .slice(section.startLine, section.endLine + 1)
      .map((text, offset) => ({ text, line: section.startLine + offset }))
      .find((candidate) => candidate.text.includes(`\`${analyticsOnly}\``));
    if (!line) {
      push(findings, doc, section.startLine, analyticsOnly, `${label} is missing analytics-only event ${analyticsOnly}.`);
    } else if (!line.text.includes("analytics_only=true")) {
      push(findings, doc, line.line, analyticsOnly, `${analyticsOnly} must carry analytics_only=true.`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM CRM Sync Webhook Canonicality P1",
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const body = sectionTextByAnchor(doc, "31.9.10-webhook-catalog");
    const appendixC = sectionByTitle(doc, "CRM-Sync-Domain Events (Webhook + Seller User Notification");
    const appendixG = sectionByTitle(doc, "CRM-Sync-Domain Events (added §31.9)");

    requireTokens(findings, doc, body, "§31.9.10 CRM Sync webhook catalog", [
      "The canonical customer-facing namespace is `seller.crm_sync.*`",
      "Appendix G PostHog mirrors use the same name with `.` replaced by `_` and carry `source_webhook_event_type`",
    ]);
    compareEventSet(findings, doc, "§31.9.10 CRM Sync webhook catalog", body, CRM_SYNC_EVENTS);
    compareEventSet(findings, doc, "Appendix C CRM Sync notification catalog", appendixC, CRM_SYNC_EVENTS);
    appendixGMirrorFindings(findings, doc, appendixG);

    requireTokens(findings, doc, sectionByTitle(doc, "`crm_sync_activity_state`"), "Appendix J crm_sync_activity_state enum", [
      ...CRM_SYNC_STATES,
      "failed_retryable → dead_lettered",
      "succeeded | failed_permanent | dead_lettered → redacted_by_dsar",
    ]);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "31.9.6-crmsyncactivityevent"), "§31.9.6 review-hold state representation", [
      "Review-queue holds are represented by `activity_state='failed_retryable'` plus review-required `failure_category` and null `retry_after_at`",
    ]);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "31.9.14-acceptance-criteria"), "§31.9.14 CRM Sync catalog AC", [
      "Every CRM Sync webhook event registered in Appendix C MUST match the §31.9.10 emitted `event_type` exactly",
      "Appendix G CRM Sync PostHog mirror MUST either be the dot-to-underscore transform",
      "explicitly labeled `analytics_only`",
      "CI test `crm_sync_event_catalog_consistency` asserts",
    ]);
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
