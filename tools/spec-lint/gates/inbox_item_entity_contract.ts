/**
 * Gate: `inbox_item_entity_contract`
 *
 * Assertion: §20.2 Inbox surface references resolve to InboxItem,
 * Inbox Item Group, Unread Marker, Appendix J enums, and §40.2 retention.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_INBOX_ITEM_FIELDS = [
  "id",
  "org_id",
  "console",
  "workspace_id",
  "inbox_item_group_id",
  "recipient_user_id",
  "notification_item_type",
  "priority",
  "title",
  "description",
  "action_url",
  "action_label",
  "direct_mention",
  "source_event_id",
  "anchor_entity_type",
  "anchor_entity_id",
  "delivery_state",
  "read_at",
  "dismissed_at",
  "expires_at",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
];

const REQUIRED_GROUP_FIELDS = [
  "id",
  "org_id",
  "console",
  "group_type",
  "anchor_entity_type",
  "anchor_entity_id",
  "title",
  "item_count",
  "unread_count",
  "latest_item_at",
  "expires_at",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
];

const REQUIRED_UNREAD_FIELDS = [
  "id",
  "user_id",
  "org_id",
  "console",
  "thread_type",
  "thread_id",
  "workspace_id",
  "last_read_at",
  "last_read_post_id",
  "unread_count",
  "has_unread_mention",
  "muted_until",
  "suppressed_reason",
  "created_at",
  "updated_at",
  "deleted_at",
];

const GROUP_TYPE_VALUES = [
  "thread_collapse",
  "digest_rollup",
  "cross_console_bundle",
  "notification_digest",
  "marketplace_signal_cluster",
];

const ANCHOR_ENTITY_VALUES = [
  "qa_thread",
  "internal_comment_thread",
  "workspace",
  "bid_workspace",
  "requirement",
  "response",
  "selection_report_draft",
  "console_bridge_event_batch",
  "digest_window",
  "marketplace_signal_cluster",
];

const UNREAD_THREAD_VALUES = [
  "internal_comment_thread",
  "qa_thread",
  "inbox_item_group",
];

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    });
    return { text: "", startLine: 0, endLine: 0, anchor: label };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function requireTokens(
  doc: SpecDoc,
  target: { text: string; line: number; anchor?: string },
  label: string,
  tokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!target.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: target.line,
        anchor: target.anchor,
        matched_text: token,
        message: `${label} is missing required Inbox entity-contract token: ${token}`,
      });
    }
  }
  return findings;
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function fieldRows(
  doc: SpecDoc,
  section: { startLine: number; endLine: number; anchor: string },
  label: string,
  findings: Finding[],
): Map<string, { line: number; cells: string[] }> {
  const table = parseTableAt(doc, section.startLine + 1, section.endLine);
  if (!table.header || table.rows.length === 0) {
    findings.push({
      file: doc.path,
      line: section.startLine,
      anchor: section.anchor,
      message: `${label} field table is missing or empty.`,
    });
    return new Map();
  }
  const rows = new Map<string, { line: number; cells: string[] }>();
  for (const row of table.rows) {
    const field = stripMd(row.cells[0] ?? "");
    if (field) rows.set(field, { line: row.line, cells: row.cells });
  }
  return rows;
}

function requireFields(
  doc: SpecDoc,
  rows: Map<string, { line: number; cells: string[] }>,
  label: string,
  anchor: string,
  fields: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const field of fields) {
    if (!rows.has(field)) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor,
        matched_text: field,
        message: `${label} is missing required field: ${field}`,
      });
    }
  }
  return findings;
}

function requireRowTokens(
  doc: SpecDoc,
  row: { line: number; cells: string[] } | undefined,
  label: string,
  tokens: readonly string[],
): Finding[] {
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: label,
      message: `${label} row is missing.`,
    }];
  }
  const text = row.cells.join(" | ");
  return requireTokens(doc, { text, line: row.line, anchor: anchorForLine(doc, row.line) }, label, tokens);
}

function forbiddenTextFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const forbidden = [
    { re: /Notification Item JSON/, label: "stale Notification Item JSON schema reference" },
    { re: /raw Notification Item/, label: "stale raw Notification Item reference" },
    { re: /§29\.1 Inbox Feed Schema/, label: "stale §29.1 Inbox Feed Schema reference" },
    { re: /Inbox Item \(§2 \/ Phase 2 integration\)/, label: "stale Phase 2 Inbox Item relationship" },
    { re: /Phase 2 supersedes/, label: "stale Phase 2 supersedes deferral" },
    { re: /workspace_digest|seller_thread_digest|bid_activity_digest|system_bundle|ai_recommendation_bundle/, label: "unregistered Inbox Item Group enum literal" },
  ];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.includes("| `inbox_item_entity_contract` |")) continue;
    for (const { re, label } of forbidden) {
      if (re.test(line)) {
        findings.push({
          file: doc.path,
          line: i,
          anchor: anchorForLine(doc, i),
          matched_text: line.trim(),
          message: `Inbox item entity contract contains ${label}.`,
        });
      }
    }
  }
  return findings;
}

function enumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const specs: Array<{ title: RegExp; label: string; values: readonly string[]; tokens?: readonly string[] }> = [
    { title: /`inbox_item_group_type_enum`/, label: "Appendix J inbox_item_group_type_enum", values: GROUP_TYPE_VALUES },
    { title: /`anchor_entity_type_enum`/, label: "Appendix J anchor_entity_type_enum", values: ANCHOR_ENTITY_VALUES },
    { title: /`unread_marker_thread_type`/, label: "Appendix J unread_marker_thread_type", values: UNREAD_THREAD_VALUES, tokens: ["InboxItem.`direct_mention`"] },
    { title: /`notification_item_type`/, label: "Appendix J notification_item_type", values: ["phase_transition", "sla_alert", "qa_mention", "amendment_notification", "disagreement_escalation", "workspace_invite", "team_assignment", "scoring_activity", "response_activity", "general_update"] },
    { title: /`inbox_item_priority`/, label: "Appendix J inbox_item_priority", values: ["high", "medium", "low"] },
    { title: /`notification_delivery_state`/, label: "Appendix J notification_delivery_state", values: ["visible", "read", "dismissed", "expired", "archived"] },
    { title: /`notification_expiry_class`/, label: "Appendix J notification_expiry_class", values: ["sla_alert_24h_post_deadline", "phase_transition_7d", "scoring_activity_3d", "qa_mention_until_thread_closed", "persistent_until_dismissed"] },
    { title: /`unread_marker_suppressed_reason`/, label: "Appendix J unread_marker_suppressed_reason", values: ["muted", "left_workspace", "archived_thread", "visibility_tightened", "ops_impersonation_suppressed"] },
  ];
  for (const spec of specs) {
    const section = sectionText(doc, spec.title, spec.label, findings);
    findings.push(...requireTokens(
      doc,
      { text: section.text, line: section.startLine, anchor: section.anchor },
      spec.label,
      [...spec.values, ...(spec.tokens ?? [])],
    ));
  }
  return findings;
}

function entityFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const unread = sectionText(doc, /^4\.3\.15 Unread Marker/, "§4.3.15", findings);
  const group = sectionText(doc, /^4\.3\.22 Inbox Item Group/, "§4.3.22", findings);
  const item = sectionText(doc, /^4\.3\.22\.1 InboxItem/, "§4.3.22.1", findings);

  const unreadRows = fieldRows(doc, unread, "§4.3.15 Unread Marker", findings);
  const groupRows = fieldRows(doc, group, "§4.3.22 Inbox Item Group", findings);
  const itemRows = fieldRows(doc, item, "§4.3.22.1 InboxItem", findings);

  findings.push(...requireFields(doc, unreadRows, "§4.3.15 Unread Marker", unread.anchor, REQUIRED_UNREAD_FIELDS));
  findings.push(...requireFields(doc, groupRows, "§4.3.22 Inbox Item Group", group.anchor, REQUIRED_GROUP_FIELDS));
  findings.push(...requireFields(doc, itemRows, "§4.3.22.1 InboxItem", item.anchor, REQUIRED_INBOX_ITEM_FIELDS));

  findings.push(...requireRowTokens(doc, unreadRows.get("thread_type"), "Unread Marker.thread_type", ["Appendix J `unread_marker_thread_type`", "inbox_item_group"]));
  findings.push(...requireRowTokens(doc, groupRows.get("group_type"), "Inbox Item Group.group_type", GROUP_TYPE_VALUES));
  findings.push(...requireRowTokens(doc, groupRows.get("anchor_entity_type"), "Inbox Item Group.anchor_entity_type", ANCHOR_ENTITY_VALUES));
  findings.push(...requireRowTokens(doc, itemRows.get("direct_mention"), "InboxItem.direct_mention", ["Unread Marker.`has_unread_mention`", "thread_type = inbox_item_group"]));
  findings.push(...requireTokens(doc, { text: item.text, line: item.startLine, anchor: item.anchor }, "§4.3.22.1 InboxItem relationships", [
    "thread_type='inbox_item_group'",
    "thread_id=inbox_item_group_id",
  ]));

  return findings;
}

function surfaceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section20 = sectionText(doc, /^20\.2 Inbox Structure$/, "§20.2", findings);
  findings.push(...requireTokens(doc, { text: section20.text, line: section20.startLine, anchor: section20.anchor }, "§20.2 Inbox Structure", [
    "InboxItem (§4.3.22.1)",
    "Inbox Item Group (§4.3.22)",
    "Unread Marker (§4.3.15)",
    "§20 MUST NOT introduce another notification-item JSON shape",
    "Appendix J `notification_item_type`",
    "Appendix J `inbox_item_priority`",
    "Appendix J `notification_delivery_state`",
    "InboxItem.`direct_mention`",
    "§40.2",
  ]));

  const api = sectionText(doc, /^32\.10\.3\.B Buyer Inbox and Pulse Endpoints$/, "§32.10.3.B", findings);
  findings.push(...requireTokens(doc, { text: api.text, line: api.startLine, anchor: api.anchor }, "§32.10.3.B Buyer Inbox and Pulse Endpoints", [
    "Inbox query parameters",
    "Appendix J `notification_item_type`",
    "Appendix J `notification_delivery_state`",
    "Appendix J `inbox_item_priority`",
    "Inbox item | `item_id`, `workspace_id`, `org_id`, `notification_item_type`, `priority`, `title`, `description`, `action_url`, `action_label`, `delivery_state`, `read_at`, `dismissed_at`, `expires_at`, `created_at`, `updated_at`",
    "updates Unread Marker",
    "Inbox list filters MUST reject values not registered in Appendix J",
  ]));

  return findings;
}

function retentionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const retention = sectionText(doc, /^40\.2 Data Retention & Deletion$/, "§40.2", findings);
  findings.push(...requireTokens(doc, { text: retention.text, line: retention.startLine, anchor: retention.anchor }, "§40.2 retention", [
    "| Unread Marker |",
    "| InboxItem (§4.3.22.1) |",
    "**Inbox Item Group (§4.3.22)**",
  ]));
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `inbox_item_entity_contract` |"]);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`inbox_item_entity_contract`",
      message: "Appendix M.5 inbox_item_entity_contract row is missing.",
    }];
  }
  return requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 inbox_item_entity_contract row", [
    "**`runtime_active`**",
    "tools/spec-lint/gates/inbox_item_entity_contract.ts",
    "§20.2",
    "§4.3.22.1",
    "§4.3.22",
    "§4.3.15",
    "§40.2",
    "Appendix J",
    "raw Notification Item JSON schema",
  ]);
}

export const gate: SpecLintGate = {
  id: "inbox_item_entity_contract",
  sourcePhase: "Phase 4.11 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...entityFindings(ctx.masterSpec),
      ...surfaceFindings(ctx.masterSpec),
      ...enumFindings(ctx.masterSpec),
      ...retentionFindings(ctx.masterSpec),
      ...forbiddenTextFindings(ctx.masterSpec),
      ...m5Findings(ctx.masterSpec),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
