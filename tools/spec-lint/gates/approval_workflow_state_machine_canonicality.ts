/**
 * Gate: `approval_workflow_state_machine_canonicality`
 *
 * Assertion: Approval Workflow is a Phase 12 sub-state, never a backward
 * pipeline transition or score-unlock path.
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
    anchor: "4.3.25-approval-workflow",
    label: "§4.3.25 Approval Workflow entity",
    signals: [
      "| `status` | Enum | Appendix J `approval_workflow_status` | `pending`, `approved`, `request_changes`, `rejected` |",
      "**State Machine:** Appendix L.12 is authoritative. Approval rejection does not create a backward pipeline transition; the Workspace remains in `phase_12_selection`.",
      "Phase 12 -> Phase 13 advancement MUST require `ApprovalWorkflow.status = approved` when Org approval policy applies.",
      "`request_changes` and `rejected` MUST NOT change `Workspace.pipeline_phase`; both keep the Workspace in `phase_12_selection`.",
      "the workflow MUST NOT unlock scores; the only score-changing path is cancellation and a new evaluation per §10.10 / §10.14.",
    ],
  },
  {
    anchor: "10.12-phase-12-selection-and-recommendation",
    label: "§10.12 Approval Workflow behavior",
    signals: [
      "Approver decision is recorded on Approval Workflow (§4.3.25) using Appendix J `approval_workflow_status`",
      "`request_changes` or `rejected` keeps the Workspace in `phase_12_selection`; it does not create a backward pipeline transition and does not unlock scores",
      "Workspace Owner may resubmit a revised Selection Report while still in Phase 12 if the change does not require score mutation",
      "`approved` permits Phase 12 -> Phase 13 advancement",
      "Approval Workflow (§4.3.25) is `approved`",
    ],
  },
  {
    anchor: "l-12-approval-workflow-state-machine",
    label: "Appendix L.12 Approval Workflow state machine",
    signals: [
      "Enum: Appendix J `approval_workflow_status`. Scope: Buyer Workspace Phase 12 only.",
      "it never mutates `Workspace.pipeline_phase` backward.",
      "| `(none)` | `pending` | Selection Report routed for approval |",
      "| `pending` | `approved` | Approver accepts |",
      "| `pending` | `request_changes` | Approver requests changes |",
      "| `pending` | `rejected` | Approver rejects |",
      "| `request_changes` | `pending` | Workspace Owner resubmits |",
      "| `rejected` | `pending` | Workspace Owner resubmits without score mutation |",
      "| `approved` | `(terminal)` | Phase 12 -> Phase 13 advancement succeeds |",
      "Any transition that attempts to unlock or mutate Score rows returns `scores_immutable_phase_12_plus`.",
      "`request_changes` and `rejected` MUST NOT mutate `Workspace.pipeline_phase`, `pipeline_stage_id`, score rows, or score locks.",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "#### `approval_workflow_status` (§4.3.25, Appendix L.12)",
  "`pending`, `approved`, `request_changes`, `rejected`",
  "`request_changes` and `rejected` keep the Workspace in `phase_12_selection`; neither value unlocks scores or creates a backward pipeline transition.",
  "| Attempt score mutation after Phase 12 (forbidden; see §10.12 / §4.3.25 / Appendix L.12) | §32 Scoring endpoints | ✗ | ✗ | ✗ | ✗ | ✗ | `scores_immutable_phase_12_plus` |",
  "| `approval_workflow_state_machine_canonicality` | 4.2 |",
];

const FORBIDDEN_PATTERNS = [
  /Lock \/ unlock score after Phase 12/,
  /Unlock requires Workspace Owner approval/,
  /Workspace Owner can unlock a single score/,
  /Phase 13\s*[-–>]+\s*Phase 12/,
  /returns? (?:the )?Workspace to Phase 12/i,
  /score\.lock_override/,
];

function sectionText(doc: SpecDoc, expectation: SectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, expectation.anchor);
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
  id: "approval_workflow_state_machine_canonicality",
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
      const section = sectionText(doc, expectation);
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
            message: `${expectation.label} is missing required Approval Workflow state binding "${signal}".`,
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
          message: `Missing global Approval Workflow state-machine binding "${signal}".`,
        });
      }
    }

    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i];
      if (line.includes("| `approval_workflow_state_machine_canonicality` |")) continue;
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: anchorForLine(doc, i),
            matched_text: line.trim(),
            message: "Approval Workflow MUST NOT reintroduce backward Phase 13 -> 12 transitions or post-Phase-12 score-unlock paths.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
