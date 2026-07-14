/**
 * Gate: `cold_pipeline_no_vendor_response_abort_path`
 *
 * Assertion: zero-confirmation / zero-response Workspaces have the §10.18
 * non-destructive abort path and do not mint a new Workspace status or reuse
 * the §10.14 cancellation lifecycle.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor: string;
  label: string;
  signals: string[];
}

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "10.18-cold-pipeline-no-vendor-response-abort",
    label: "§10.18 no-vendor-response abort",
    signals: [
      "not a soft-gate skip",
      "not the §10.14 cancellation / soft-delete lifecycle",
      "phase_5_vendor_outreach",
      "vendor_confirmed_intent_count = 0",
      "phase_6_vendor_bidding",
      "vendor_response_submitted_count = 0",
      "phase_9_final_clarifications",
      "scoreable_vendor_response_count = 0",
      "POST /v1/workspaces/{workspace_id}/abort",
      "Idempotency-Key",
      "\"reason\": \"no_vendor_response\"",
      "\"status\": \"closed\"",
      "\"closure_reason\": \"no_vendor_response\"",
      "\"pipeline_stage_id\": 14",
      "\"notification_event\": \"workspace_no_vendor_response_aborted\"",
      "workspace_abort_already_terminal",
      "workspace_abort_not_eligible_no_vendor_response",
      "Workspace.status = closed",
      "Workspace.closure_reason = no_vendor_response",
      "pipeline_stage_id = 14",
      "Enqueues Appendix C event `workspace_no_vendor_response_aborted` and Appendix G event `workspace_no_vendor_response_aborted`",
      "Skips Selection Report, Selection Record, Defense View, scoring snapshot, contract metadata, cancellation soft-delete, and recovery-window creation",
      "does not create a recovery window",
      "MUST NOT introduce a new `workspace_status` enum value",
      "MUST NOT create a Selection Report, Selection Record, Defense View, score snapshot, contract metadata, Cancellation Request, cancellation grace window, or `workspace_canceled` Appendix C event",
    ],
  },
  {
    anchor: "appendix-e-workspace-bid-workspace-status-state-machine",
    label: "Appendix E Workspace Status",
    signals: [
      "active → closed",
      "Workspace Owner invokes §10.18 no-vendor-response abort",
      "closure_reason=no_vendor_response",
      "no §10.14 cancellation or recovery window is created",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "workspace_no_vendor_response_aborted` | Workspace closed by §10.18 no-vendor-response abort",
  "| `workspace_abort_already_terminal` | 409 | §10 / §32.5 workspace workflow endpoints | No-vendor-response abort requested after the Workspace is already `closed` or `archived`",
  "| `workspace_abort_not_eligible_no_vendor_response` | 422 | §10 / §32.5 workspace workflow endpoints | `POST /v1/workspaces/{workspace_id}/abort` requested with `reason=no_vendor_response`",
  "### `workspace_closure_reason` (§4.3.1 / §10.13 / §10.18)",
  "`phase_13_completed`, `no_vendor_response`",
  "`no_vendor_response` is written only by §10.18 and MUST NOT create a Selection Report, Selection Record, Defense View, or §10.14 cancellation lifecycle",
  "POST   /v1/workspaces/{workspace\\_id}/abort",
  "| `cold_pipeline_no_vendor_response_abort_path` | 4.2 |",
];

const ZERO_GATE_SIGNALS = [
  "zero vendors have confirmed intent to bid",
  "zero vendors have submitted a Response",
  "zero scoreable responses remain",
  "§10.18 is the only non-destructive no-response exit",
];

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function findLine(doc: SpecDoc, signal: string): number {
  return doc.lines.findIndex((line) => line.includes(signal));
}

export const gate: SpecLintGate = {
  id: "cold_pipeline_no_vendor_response_abort_path",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const expectation of SECTION_EXPECTATIONS) {
      const section = sectionText(doc, expectation.anchor);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: expectation.label,
          message: `parse_error: ${expectation.label} section not found.`,
        });
        continue;
      }
      for (const signal of expectation.signals) {
        if (!section.text.includes(signal)) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: signal,
            message: `${expectation.label} is missing required no-vendor-response abort binding "${signal}".`,
          });
        }
      }
    }

    for (const signal of GLOBAL_SIGNALS) {
      const line = findLine(doc, signal);
      if (line < 0) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: signal,
          message: `Missing global no-vendor-response abort binding "${signal}".`,
        });
      }
    }

    for (const signal of ZERO_GATE_SIGNALS) {
      const line = findLine(doc, signal);
      if (line < 0) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: signal,
          message: `Missing zero-vendor advancement-blocking predicate "${signal}".`,
        });
      }
    }

    const workspaceStatus = sectionText(doc, "appendix-j-controlled-vocabulary-registry");
    if (!workspaceStatus) {
      findings.push({
        file: doc.path,
        line: 0,
        message: "parse_error: Appendix J controlled vocabulary registry not found.",
      });
    } else {
      const workspaceStatusStart = doc.lines.findIndex((line) => /^### Workspace Statuses/.test(line));
      const closureReasonStart = doc.lines.findIndex((line) => /^### `workspace_closure_reason`/.test(line));
      if (workspaceStatusStart < 0 || closureReasonStart < 0) {
        findings.push({
          file: doc.path,
          line: workspaceStatus.line,
          anchor: workspaceStatus.anchor,
          message: "Appendix J Workspace Statuses or workspace_closure_reason section not found.",
        });
      } else {
        const statusText = doc.lines.slice(workspaceStatusStart, closureReasonStart).join("\n");
        if (statusText.includes("aborted_no_vendor_response")) {
          findings.push({
            file: doc.path,
            line: workspaceStatusStart,
            anchor: anchorForLine(doc, workspaceStatusStart),
            matched_text: "aborted_no_vendor_response",
            message: "Appendix J Workspace Statuses MUST NOT mint `aborted_no_vendor_response`; §10.18 uses status=closed plus closure_reason=no_vendor_response.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
