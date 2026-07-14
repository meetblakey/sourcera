/**
 * Gate: `seller_bid_workspace_pulse_health_entity_contract`
 *
 * Assertion: Seller Pulse resolves to the seller-console-scoped
 * SellerBidWorkspacePulseHealth entity with retention, enums, aggregate-only
 * raw inputs, and no buyer-readable projection.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_FIELDS = [
  "id",
  "org_id",
  "console",
  "bid_workspace_id",
  "source_workspace_id_hash",
  "recorded_at",
  "recorded_date_utc",
  "snapshot_kind",
  "weight_set",
  "pipeline_phase",
  "bid_workspace_status",
  "score_value",
  "color_band",
  "prior_color_band",
  "response_completion_pct",
  "on_time_submission_pct",
  "amendment_reverification_turnaround_pct",
  "kb_utilization_pct",
  "deadline_readiness_pct",
  "raw_inputs_json",
  "band_transition_event_id",
  "locked",
  "locked_at",
  "lock_reason",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
];

const ENTITY_SECTION_TOKENS = [
  "persisted seller-side health row behind §24.4 Seller Pulse",
  "without exposing buyer-internal Workspace details",
  "Seller Org's Bid Workspace",
  "Authored Extension -- requires human sign-off",
  "AE-V72REM-PH5P55-SELLER-PULSE-01",
  "**Scope isolation.** Reads require `(org_id, console='seller', bid_workspace_id)`",
  "Buyer-console reads, cross-seller reads, and raw buyer Workspace lookups return HTTP 404",
  "**Required indexes.** `(org_id, bid_workspace_id, recorded_at DESC)`",
  "(org_id, bid_workspace_id, snapshot_kind, recorded_date_utc)` unique for `snapshot_kind='daily_summary'`",
  "**Retention, DSAR, and residency.** Retention follows the §40.2 SellerBidWorkspacePulseHealth row.",
  "raw aggregate counts remain only when they contain no subject-identifying text",
  "`raw_inputs_json` is aggregate-only and must pass the §6.8.4.5 body-field sweep before export",
  "Residency follows the parent Bid Workspace (§4.4.1), which follows Seller Org residency",
  "`source_workspace_id_hash`",
  "| (none) | `tick` | Bid Workspace tick |",
  "| `tick` | `daily_summary` | Daily summarizer |",
  "| `tick` or `daily_summary` | `final_lock` | Bid Workspace terminal state |",
  "| `tick` | `tick` | Response, amendment, deadline, KB-citation, or phase projection event |",
  "Buyer-console reads MUST return HTTP 404 for every SellerBidWorkspacePulseHealth endpoint",
  "`raw_inputs_json` MUST contain counts only",
];

const ROW_TOKEN_REQUIREMENTS: Record<string, string[]> = {
  console: ["Always `seller`", "buyer-console reads return HTTP 404"],
  source_workspace_id_hash: ["One-way correlation hash", "raw buyer `workspace_id` is not returned to seller clients"],
  snapshot_kind: ["Appendix J `seller_pulse_snapshot_kind`", "`tick`, `daily_summary`, or `final_lock`"],
  weight_set: ["Appendix J `seller_pulse_weight_set`", "Phase-derived weight set selected by §24.4.2"],
  raw_inputs_json: [
    "redacted aggregate counts only",
    "MUST NOT store buyer-internal notes",
    "buyer scores",
    "response body text",
    "Q&A post bodies",
    "requirement text",
    "comments",
    "email addresses",
    "attachment contents",
  ],
  locked: ["snapshot_kind=final_lock", "terminal Bid Workspace state freezes the score"],
};

const SECTION_24_TOKENS = [
  "Seller Pulse persistence is canonical at §4.4.37 SellerBidWorkspacePulseHealth",
  "MUST NOT introduce a second seller Pulse snapshot row",
  "buyer-readable projection",
  "Seller Pulse reads are always seller-console-scoped and Bid-Workspace-scoped",
  "Seller Pulse still computes and persists on SellerBidWorkspacePulseHealth for every plan tier",
  "Engine writes, final-lock behavior, and retention are unchanged by surface compression",
  "MUST NOT create duplicate `daily_summary` rows",
  "Seller Solo / Free MUST hide the per-component breakdown, team-status widget, and trend chart while preserving the same engine-side SellerBidWorkspacePulseHealth writes",
];

const APPENDIX_J_REQUIREMENTS = [
  {
    title: /^`seller_pulse_snapshot_kind`/,
    label: "Appendix J seller_pulse_snapshot_kind",
    tokens: ["`tick`, `daily_summary`, `final_lock`", "compute cadence for SellerBidWorkspacePulseHealth"],
  },
  {
    title: /^`seller_pulse_weight_set`/,
    label: "Appendix J seller_pulse_weight_set",
    tokens: ["`pre_bidding`, `active_response`, `post_submission`, `final_lock`", "Values are derived from the bound buyer Workspace phase projection"],
  },
  {
    title: /^`seller_pulse_lock_reason`/,
    label: "Appendix J seller_pulse_lock_reason",
    tokens: ["`bid_won`, `bid_lost`, `submitted_and_not_awarded`, `withdrawn`, `disqualified`, `workspace_closed`", "MUST NOT expose buyer-internal selection rationale"],
  },
  {
    title: /^`seller_pulse_metric_id`/,
    label: "Appendix J seller_pulse_metric_id",
    tokens: ["`response_completion`, `on_time_submission`, `amendment_reverification_turnaround`, `kb_utilization`, `deadline_readiness`", "map to the persisted SellerBidWorkspacePulseHealth term fields"],
  },
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/seller_bid_workspace_pulse_health_entity_contract.ts",
  "§4.4.37 + §24.4 + §40.2 + Appendix J / K",
  "seller-console scope",
  "Bid Workspace residency",
  "aggregate-only raw inputs",
  "tick/daily/final-lock cadence",
  "§40.2 retention row",
  "not_permitted_seller_pulse_firewall_integrity",
];

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing; cannot verify SellerBidWorkspacePulseHealth contract.`,
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

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `${label} is missing Seller Pulse entity-contract token: ${token}`,
      });
    }
  }
  return findings;
}

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
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

function fieldFindings(doc: SpecDoc, rows: Map<string, { line: number; cells: string[] }>, anchor: string): Finding[] {
  const findings: Finding[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!rows.has(field)) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor,
        matched_text: field,
        message: `SellerBidWorkspacePulseHealth is missing required field: ${field}`,
      });
    }
  }
  for (const [field, tokens] of Object.entries(ROW_TOKEN_REQUIREMENTS)) {
    const row = rows.get(field);
    if (!row) continue;
    findings.push(...requireTokens(doc, row.cells.join(" | "), row.line, `SellerBidWorkspacePulseHealth.${field}`, tokens));
  }
  return findings;
}

function lineIncluding(doc: SpecDoc, token: string) {
  const idx = doc.lines.findIndex((line) => line?.includes(token));
  return idx >= 0 ? { text: doc.lines[idx] ?? "", line: idx } : null;
}

function retentionFindings(doc: SpecDoc): Finding[] {
  const hit = lineIncluding(doc, "| SellerBidWorkspacePulseHealth (§4.4.37) |");
  if (!hit) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "SellerBidWorkspacePulseHealth (§4.4.37)",
      message: "§40.2 retention row for SellerBidWorkspacePulseHealth is missing.",
    }];
  }
  return requireTokens(doc, hit.text, hit.line, "§40.2 SellerBidWorkspacePulseHealth row", [
    "Tick rows retained 30 days",
    "Daily summary rows retained 12 months",
    "Final-lock rows retained for Bid Workspace life + 7 years",
    "DSAR Pattern B on actor FKs",
    "`raw_inputs_json` is aggregate-only",
    "Residency follows the parent Bid Workspace",
  ]);
}

function appendixKFindings(doc: SpecDoc): Finding[] {
  const hit = lineIncluding(doc, "**SellerBidWorkspacePulseHealth.**");
  if (!hit) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "**SellerBidWorkspacePulseHealth.**",
      message: "Appendix K SellerBidWorkspacePulseHealth glossary entry is missing.",
    }];
  }
  return requireTokens(doc, hit.text, hit.line, "Appendix K SellerBidWorkspacePulseHealth glossary entry", [
    "Seller-console Bid-Workspace-scoped Pulse snapshot row",
    "bounded seller-side health score",
    "tick / daily / final-lock cadence",
    "raw aggregate inputs",
    "without exposing raw buyer Workspace identifiers or buyer-internal content",
    "See §4.4.37 and §24.4",
  ]);
}

function appendixJFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of APPENDIX_J_REQUIREMENTS) {
    const section = sectionText(doc, req.title, req.label, findings);
    findings.push(...requireTokens(doc, section.text, section.startLine, req.label, req.tokens));
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const hit = lineIncluding(doc, "| `seller_bid_workspace_pulse_health_entity_contract` |");
  if (!hit) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`seller_bid_workspace_pulse_health_entity_contract`",
      message: "Appendix M.5 seller_bid_workspace_pulse_health_entity_contract row is missing.",
    }];
  }
  return requireTokens(doc, hit.text, hit.line, "Appendix M.5 seller_bid_workspace_pulse_health_entity_contract row", M5_TOKENS);
}

export const gate: SpecLintGate = {
  id: "seller_bid_workspace_pulse_health_entity_contract",
  sourcePhase: "Phase 5.5 / Phase 24 P1",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_seller_pulse_firewall_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const entity = sectionText(doc, /^4\.4\.37 SellerBidWorkspacePulseHealth\b/, "§4.4.37 SellerBidWorkspacePulseHealth", findings);
    findings.push(...requireTokens(doc, entity.text, entity.startLine, "§4.4.37 SellerBidWorkspacePulseHealth", ENTITY_SECTION_TOKENS));
    findings.push(...fieldFindings(doc, fieldRows(doc, entity, "§4.4.37 SellerBidWorkspacePulseHealth", findings), entity.anchor));

    const sellerPulse = sectionText(doc, /^24\.4 Seller Pulse\b/, "§24.4 Seller Pulse", findings);
    findings.push(...requireTokens(doc, sellerPulse.text, sellerPulse.startLine, "§24.4 Seller Pulse", SECTION_24_TOKENS));

    findings.push(...retentionFindings(doc));
    findings.push(...appendixJFindings(doc));
    findings.push(...appendixKFindings(doc));
    findings.push(...m5Findings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
