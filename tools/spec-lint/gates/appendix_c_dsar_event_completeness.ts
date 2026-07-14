/**
 * Gate: `appendix_c_dsar_event_completeness`
 *
 * Assertion: DSAR events referenced from the DSAR contract resolve to Appendix C
 * rows when notification/webhook-addressable, Appendix G rows when analytics-
 * addressable, and Appendix J action types when audit-event-addressable.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  dottedToUnderscore,
  duplicateTokens,
  firstCellBacktickTokens,
  lineForToken,
  missingTokens,
  requireSection,
} from "./catalog_gate_helpers.js";

const APPENDIX_C_PHASE_3V_ANCHOR = "appendix-c-phase-3v-events";
const APPENDIX_C_V9_ANCHOR = "appendix-c-phase-v9-events";
const APPENDIX_G_ANCHOR = "appendix-g-posthog-event-taxonomy";
const APPENDIX_J_ANCHOR = "appendix-j-controlled-vocabulary-registry";

const PHASE_3V_DSAR_EVENTS = [
  "dsar.acknowledged",
  "dsar.fulfilled",
  "dsar.extension_granted",
  "dsar.cascade.partial_failure",
  "dsar.rejected_manifestly_unfounded",
  "dsar.export.ready",
  "dsar.verification_failed",
  "dsar.cascade.long_tail_started",
  "dsar.cascade.row_redacted",
  "dsar.audit_integrity_exemption_invoked",
  "dsar.audit_integrity_exemption_violation",
];

const PHASE_V9_DSAR_EVENTS = [
  "dsar.cascade.aggregate_recompute_required",
  "dsar.cascade.aggregate_recompute_completed",
  "dsar.cascade.bridge_body_pii_swept",
  "dsar.cascade.resume",
  "dsar.cascade.backup_repseudonymization_required",
  "dsar.cascade.backup_repseudonymization_completed",
  "dsar.cascade.aggregate_recompute_failed",
  "dsar.cascade.body_pii_sweep_failed",
  "dsar_cascade_administratively_closed",
];

const POSTHOG_ONLY_DSAR_EVENTS = [
  "dsar_sla_window_breached",
  "dsar_export_downloaded",
];

const APPENDIX_J_DSAR_ACTION_TYPES = [
  "dsar.verification_failed",
  "dsar.rejected_manifestly_unfounded",
  "dsar.cascade.residency_violation_blocked",
  "dsar.cascade.cross_region_dpo_approval_required",
  "dsar.cascade.long_tail_started",
  "dsar.cascade.row_redacted",
  "dsar.cascade.partial_failure",
  "dsar.audit_integrity_exemption_invoked",
  "dsar.audit_integrity_exemption_violation",
  "dsar_cascade_administratively_closed",
  "dsar.export.downloaded",
];

function push(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  anchor: string,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line,
    anchor,
    matched_text: matched,
    message,
  });
}

function appendixGEventRows(doc: SpecDoc): Map<string, number> {
  const rows = new Map<string, number>();
  for (const item of firstCellBacktickTokens(doc, APPENDIX_G_ANCHOR)) {
    if (!rows.has(item.token)) rows.set(item.token, item.line);
  }
  return rows;
}

function requireAppendixGMirror(
  findings: Finding[],
  doc: SpecDoc,
  rows: Map<string, number>,
  event: string,
) {
  const mirror = dottedToUnderscore(event);
  const line = rows.get(mirror);
  if (!line) {
    push(
      findings,
      doc,
      lineForToken(doc, event),
      APPENDIX_G_ANCHOR,
      mirror,
      `Appendix G is missing DSAR mirror ${mirror} for Appendix C event ${event}.`,
    );
    return;
  }

  const row = doc.lines[line] ?? "";
  if (!row.includes(`source_webhook_event_type='${event}'`)) {
    push(
      findings,
      doc,
      line,
      APPENDIX_G_ANCHOR,
      event,
      `Appendix G DSAR mirror ${mirror} must bind back to source_webhook_event_type='${event}'.`,
    );
  }
}

function requireAppendixGPosthogOnly(
  findings: Finding[],
  doc: SpecDoc,
  rows: Map<string, number>,
  event: string,
) {
  const line = rows.get(event);
  if (!line) {
    push(
      findings,
      doc,
      lineForToken(doc, event),
      APPENDIX_G_ANCHOR,
      event,
      `Appendix G is missing DSAR analytics event ${event}.`,
    );
    return;
  }

  if (event === "dsar_export_downloaded") {
    const row = doc.lines[line] ?? "";
    if (!row.includes("source_audit_event_type='dsar.export.downloaded'")) {
      push(
        findings,
        doc,
        line,
        APPENDIX_G_ANCHOR,
        "dsar.export.downloaded",
        "Appendix G dsar_export_downloaded must bind back to source_audit_event_type='dsar.export.downloaded'.",
      );
    }
  }
}

function requireAppendixJActionTypes(findings: Finding[], doc: SpecDoc) {
  const section = findSectionByAnchor(doc, APPENDIX_J_ANCHOR);
  if (!section) {
    push(findings, doc, 0, APPENDIX_J_ANCHOR, APPENDIX_J_ANCHOR, "Appendix J controlled vocabulary registry is missing.");
    return;
  }

  let line = -1;
  for (let i = section.startLine; i <= section.endLine; i++) {
    if ((doc.lines[i] ?? "").includes("DSAR Lifecycle Event Action Types")) {
      line = i;
      break;
    }
  }
  if (line < 0) {
    push(
      findings,
      doc,
      section.startLine,
      APPENDIX_J_ANCHOR,
      "DSAR Lifecycle Event Action Types",
      "Appendix J must register DSAR Lifecycle Event Action Types.",
    );
    return;
  }

  const text = doc.lines[line] ?? "";
  for (const actionType of APPENDIX_J_DSAR_ACTION_TYPES) {
    if (!text.includes(`\`${actionType}\``)) {
      push(
        findings,
        doc,
        line,
        APPENDIX_J_ANCHOR,
        actionType,
        `Appendix J DSAR Lifecycle Event Action Types is missing ${actionType}.`,
      );
    }
  }
}

export const gate: SpecLintGate = {
  id: "appendix_c_dsar_event_completeness",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [
      ...requireSection(doc, APPENDIX_C_PHASE_3V_ANCHOR, "Appendix C Phase 3V events"),
      ...requireSection(doc, APPENDIX_C_V9_ANCHOR, "Appendix C Phase V9 events"),
      ...requireSection(doc, APPENDIX_G_ANCHOR, "Appendix G PostHog taxonomy"),
      ...requireSection(doc, APPENDIX_J_ANCHOR, "Appendix J controlled vocabulary registry"),
      ...missingTokens(doc, APPENDIX_C_PHASE_3V_ANCHOR, "Appendix C Phase 3V DSAR events", PHASE_3V_DSAR_EVENTS),
      ...duplicateTokens(doc, APPENDIX_C_PHASE_3V_ANCHOR, "Appendix C Phase 3V DSAR events"),
      ...missingTokens(doc, APPENDIX_C_V9_ANCHOR, "Appendix C Phase V9 DSAR events", PHASE_V9_DSAR_EVENTS),
      ...duplicateTokens(doc, APPENDIX_C_V9_ANCHOR, "Appendix C Phase V9 DSAR events"),
    ];

    const appendixGRows = appendixGEventRows(doc);
    for (const event of [...PHASE_3V_DSAR_EVENTS, ...PHASE_V9_DSAR_EVENTS]) {
      requireAppendixGMirror(findings, doc, appendixGRows, event);
    }
    for (const event of POSTHOG_ONLY_DSAR_EVENTS) {
      requireAppendixGPosthogOnly(findings, doc, appendixGRows, event);
    }
    requireAppendixJActionTypes(findings, doc);

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
