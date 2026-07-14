/**
 * Gate: `integration_export_terminal_event_pairing`
 *
 * Assertion: every documented IntegrationExportRun terminal state has one
 * Appendix C event and one Appendix G mirror in the spec tree.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "integration_export_terminal_event_pairing";

const SECTION_31_EVENT_TOKENS = [
  "| `integration.export.completed` | `IntegrationExportRun.running -> completed` |",
  "| `integration.export.failed` | `IntegrationExportRun.running -> failed` OR `running -> partial_failure` |",
  "| `integration.export.canceled` | `IntegrationExportRun.queued/running -> canceled` |",
  "PostHog mirrors are registered in Appendix G as `integration_export_initiated`, `integration_export_completed`, `integration_export_failed`, and `integration_export_canceled`.",
  "Every terminal run MUST emit exactly one Appendix C event and one Appendix G mirror; partial failures emit `integration.export.failed` with `partial=true`; canceled runs emit `integration.export.canceled` with Appendix J `integration_export_cancel_reason`.",
] as const;

const RUN_STATE_TOKENS = [
  "| `running` | `completed` | All target writes succeed | Target refs stored; counts reconciled | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |",
  "| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item summary stored without bodies | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true` |",
  "| `queued` / `running` | `failed` | Credential, provider, scope, or worker failure prevents usable export | `failure_code` required | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` |",
  "| `queued` / `running` | `canceled` | Workspace reopened, deleted, DSAR hold invalidates source rows, or user cancels before first provider write | No target refs persisted; accepted target record forces `partial_failure` instead | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled` |",
  "Every terminal run MUST emit exactly one Appendix C terminal event and exactly one Appendix G terminal mirror.",
] as const;

const APPENDIX_L_TOKENS = [
  "| `running` | `completed` | All target writes succeed | Target refs stored; exported requirement/action-item counts reconcile; provider response bodies are not persisted | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed`. |",
  "| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item failure summary is safe and body-free; at least one `target_record_refs_json` entry exists | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true`; poll response may carry Appendix I `integration_export_partial_failure`. |",
  "| `queued` / `running` | `failed` | Credential, provider, scope, residency, or worker failure prevents usable export | `failure_code` required; no usable export is available to the caller | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed`; retryability derives from `failure_code`. |",
  "| `queued` / `running` | `canceled` | User cancels, Workspace reopens/deletes, DSAR hold blocks source rows, or downgrade blocks new provider writes before first accepted target write | No new provider writes after cancel; accepted target records before cancel force `partial_failure` rather than `canceled`; `cancel_reason` required | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled`; terminal audit row remains visible per §40.2. |",
  "Every terminal run MUST emit exactly one Appendix C event and exactly one Appendix G mirror with the same `export_id` and terminal status.",
] as const;

const GLOBAL_TOKENS = [
  "| `integration.export.completed` | IntegrationExportRun `running -> completed` (§4.3.39) |",
  "| `integration.export.failed` | IntegrationExportRun `running -> failed` or `running -> partial_failure` (§4.3.39) |",
  "| `integration.export.canceled` | IntegrationExportRun `queued/running -> canceled` (§4.3.39) |",
  "| `integration_export_completed` | Mirror of Appendix C `integration.export.completed` | `source_webhook_event_type='integration.export.completed'`",
  "| `integration_export_failed` | Mirror of Appendix C `integration.export.failed` | `source_webhook_event_type='integration.export.failed'`",
  "| `integration_export_canceled` | Mirror of Appendix C `integration.export.canceled` | `source_webhook_event_type='integration.export.canceled'`",
] as const;

const EXACT_ONCE_TOKENS = [
  "| `integration.export.completed` | IntegrationExportRun `running -> completed` (§4.3.39) |",
  "| `integration.export.failed` | IntegrationExportRun `running -> failed` or `running -> partial_failure` (§4.3.39) |",
  "| `integration.export.canceled` | IntegrationExportRun `queued/running -> canceled` (§4.3.39) |",
  "| `integration_export_completed` | Mirror of Appendix C `integration.export.completed` |",
  "| `integration_export_failed` | Mirror of Appendix C `integration.export.failed` |",
  "| `integration_export_canceled` | Mirror of Appendix C `integration.export.canceled` |",
] as const;

const M5_ROW_TOKENS = [
  "webhook_catalog_consistency",
  "**`runtime_active`**",
  "tools/spec-lint/gates/integration_export_terminal_event_pairing.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "scope boundary: spec-tree §4.3.39 / §31.3.4 / Appendix C / Appendix G / Appendix L.18 terminal event pairing only",
  "product event emission, outbox writes, duplicate suppression, webhook delivery, PostHog production emission, worker runtime tests, and deploy validators remain product-pack evidence",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string): void {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function exactCount(text: string, token: string): number {
  return text.split(token).length - 1;
}

function requireExactOnce(findings: Finding[], doc: SpecDoc): void {
  for (const token of EXACT_ONCE_TOKENS) {
    const count = exactCount(doc.text, token);
    if (count !== 1) {
      push(findings, doc, 0, token, `Integration Export terminal event token must appear exactly once; found ${count}: ${token}`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 8.2",
  rowClass: "webhook_catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "31.3-integration-phase-export-mapping", "§31.3 Integration Export events", SECTION_31_EVENT_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "4.3.39-integrationexportrun", "§4.3.39 IntegrationExportRun terminal events", RUN_STATE_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "l-18-integration-export-run-state-machine", "Appendix L.18 IntegrationExportRun state machine", APPENDIX_L_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "Integration Export Appendix C/G terminal event pair", GLOBAL_TOKENS);
    requireExactOnce(findings, ctx.masterSpec);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
