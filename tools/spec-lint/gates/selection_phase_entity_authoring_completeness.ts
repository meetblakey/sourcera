/**
 * Gate: `selection_phase_entity_authoring_completeness`
 *
 * Assertion: Phase 12 / Phase 13 closure artifacts named by §10.12-§10.14
 * resolve to first-class §4.3 entities with full authoring-convention blocks.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface EntityExpectation {
  anchor: string;
  label: string;
  requiredFields: string[];
  signals: string[];
}

interface SectionExpectation {
  anchor: string;
  label: string;
  signals: string[];
}

const COMMON_FIELDS = [
  "id",
  "org_id",
  "console",
  "workspace_id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
];

const ENTITY_EXPECTATIONS: EntityExpectation[] = [
  {
    anchor: "4.3.23-selection-report",
    label: "§4.3.23 Selection Report",
    requiredFields: [
      ...COMMON_FIELDS,
      "selection_report_draft_id",
      "selection_record_id",
      "status",
      "approval_workflow_id",
      "selection_record_sha256",
    ],
    signals: [
      "Immutable finalized recommendation artifact produced from the Selection Report Draft (§4.3.21) during Phase 12 (§10.12).",
      "| `selection_report_draft_id` | UUID | FK -> Selection Report Draft | Draft version crystallized into this immutable report |",
      "| `selection_record_id` | UUID | FK -> Selection Record, nullable until §10.13.5 | Populated when the immutable Selection Record is assembled at Phase 13 closure |",
      "| `selection_record_sha256` | String | 64 hex chars, nullable until §10.13.5 | SHA-256 of the immutable Selection Record bundle; Defense View cache key |",
      "**Scope Isolation:** Workspace-scoped and buyer-console-only. Seller-console reads return HTTP 404 per §7.2.",
      "**Indexes:**",
      "**Retention:** Inherits Workspace closure retention per §40.2",
      "**Acceptance Criteria:**",
      "A `SelectionReport` row MUST be created only from a `SelectionReportDraft.state = finalized` transition.",
      "The row MUST NOT expose report body fields to seller-console APIs, Console Bridge payloads, or webhooks unless a specific public artifact (M2 PublicSelectionReport) is generated under §48.5.2 redaction rules.",
    ],
  },
  {
    anchor: "4.3.24-selection-record",
    label: "§4.3.24 Selection Record",
    requiredFields: [
      ...COMMON_FIELDS,
      "selection_report_id",
      "selection_record_sha256",
      "immutable_at",
      "requirements_snapshot_json",
      "responses_snapshot_json",
      "scores_snapshot_json",
    ],
    signals: [
      "Immutable Phase 13 closure bundle assembled from the finalized Selection Report plus the evidence corpus named in §10.13.5.",
      "| `selection_report_id` | UUID | FK -> Selection Report | Approved report included in the bundle |",
      "| `selection_record_sha256` | String | 64 hex chars; unique | SHA-256 over canonicalized bundle fields |",
      "| `immutable_at` | Timestamp | Required | Set at creation; no content mutation after this time |",
      "**Scope Isolation:** Workspace-scoped, org-scoped, buyer-console-only. Seller-console reads return HTTP 404.",
      "**Indexes:**",
      "**Retention:** Retained with closed Workspace records per §40.2 and audit-integrity exemptions in §6.8.5.",
      "**Acceptance Criteria:**",
      "A `SelectionRecord` row MUST be created during §10.13.5 before Workspace `status` becomes `closed`.",
      "Defense View (§13.11) MUST read this bundle by `selection_record_id` / `selection_record_sha256`, not live Requirements, Responses, or Scores.",
      "Any export that includes this bundle MUST apply §6.8.4 DSAR redaction and §7.2 firewall rules before serialization.",
    ],
  },
  {
    anchor: "4.3.25-approval-workflow",
    label: "§4.3.25 Approval Workflow",
    requiredFields: [
      ...COMMON_FIELDS,
      "selection_report_id",
      "status",
      "required_approver_role",
      "approver_user_id",
      "decision_reason",
    ],
    signals: [
      "Phase 12 approval sub-state for Selection Reports when Org policy requires CFO / Legal / CRO sign-off.",
      "| `status` | Enum | Appendix J `approval_workflow_status` | `pending`, `approved`, `request_changes`, `rejected` |",
      "**Scope Isolation:** Workspace-scoped and buyer-console-only.",
      "**Indexes:**",
      "**State Machine:** Appendix L.12 is authoritative.",
      "**Retention:** Retained with Selection Report / Selection Record audit class per §40.2.",
      "**Acceptance Criteria:**",
      "Phase 12 -> Phase 13 advancement MUST require `ApprovalWorkflow.status = approved` when Org approval policy applies.",
    ],
  },
  {
    anchor: "4.3.26-cancellation-request",
    label: "§4.3.26 Cancellation Request",
    requiredFields: [
      ...COMMON_FIELDS,
      "status",
      "prior_workspace_status",
      "cancellation_reason",
      "cancelled_at",
      "grace_expires_at",
      "hard_delete_eligible_at",
    ],
    signals: [
      "First-class record for the §10.14 Workspace cancellation lifecycle.",
      "| `status` | Enum | Appendix J `cancellation_request_status` | `initiated`, `undo_grace`, `processing`, `recovered`, `hard_deleted` |",
      "| `prior_workspace_status` | Enum | Appendix J `workspace_status`; required | Snapshot of Workspace.`status` before cancellation; used for undo / recovery without introducing `cancelled` or `deletion_in_progress` as Workspace statuses |",
      "| `grace_expires_at` | Timestamp | Required; `cancelled_at + 14 days` | Undo deadline per §10.14.3 |",
      "| `hard_delete_eligible_at` | Timestamp | Required; `cancelled_at + 44 days` | Recovery cutoff per §10.14 |",
      "**Scope Isolation:** Workspace-scoped buyer-only record.",
      "**Indexes:**",
      "**Retention:** Retained with Workspace lifecycle audit per §40.2 and §6.8.5.",
      "**Acceptance Criteria:**",
      "A Cancellation Request row MUST be created atomically with the §10.14.1 cancellation commit and its AuditEvent.",
      "`grace_expires_at` and `hard_delete_eligible_at` MUST be derived from `cancelled_at`; no separate timing singleton is permitted.",
    ],
  },
  {
    anchor: "4.3.27-post-evaluation-feedback",
    label: "§4.3.27 Post-Evaluation Feedback",
    requiredFields: [
      ...COMMON_FIELDS,
      "selection_record_id",
      "respondent_user_id",
      "sentiment",
      "process_feedback_text",
      "submitted_at",
    ],
    signals: [
      "Optional stakeholder feedback captured after Phase 13 closure per §10.13.3.",
      "| `sentiment` | Enum | Appendix J `post_evaluation_feedback_sentiment` | `positive`, `neutral`, `negative`, `mixed` |",
      "**Scope Isolation:** Workspace-scoped and buyer-console-only.",
      "**Indexes:**",
      "**Retention:** Workspace-life plus the Workspace retention window in §40.2.",
      "**Acceptance Criteria:**",
      "Feedback MUST NOT mutate Selection Report, Selection Record, scores, rankings, or vendor notifications.",
      "Feedback rows must be exportable to the requesting respondent through DSAR access export.",
    ],
  },
];

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "10.12-phase-12-selection-and-recommendation",
    label: "§10.12 Phase 12 selection references",
    signals: [
      "Selection status is updated using Appendix J `vendor_selection_status` values (`primary`, `secondary`, `alternate`, `not_selected`) on the finalized Selection Report (§4.3.23)",
      "System generates immutable Selection Report (§4.3.23) from the current Selection Report Draft (§4.3.21):",
      "Approver decision is recorded on Approval Workflow (§4.3.25) using Appendix J `approval_workflow_status`",
      "Selection Report (§4.3.23) signed and, when approval is required, Approval Workflow (§4.3.25) is `approved`",
    ],
  },
  {
    anchor: "10.13-phase-13-contract-and-closure",
    label: "§10.13 Phase 13 closure references",
    signals: [
      "Feedback is logged as Post-Evaluation Feedback (§4.3.27), separately from evaluation data and without mutating the Selection Report or Selection Record",
      "System creates immutable Selection Record (§4.3.24):",
      "Selection Report (§4.3.23)",
      "Selection Record is retained per §40.2 and DSAR behavior follows §6.8.4 / §6.8.5",
      "Selection Record created and immutable",
    ],
  },
  {
    anchor: "10.14-bid-workspace-cancellation-protocol",
    label: "§10.14 cancellation references",
    signals: [
      "Cancellation is tracked on the first-class Cancellation Request entity (§4.3.26); it MUST NOT introduce `cancelled`, `canceled`, or `deletion_in_progress` as `Workspace.status` values.",
      "Cancellation Request row created with `status=undo_grace` and `prior_workspace_status = Workspace.status`; Workspace.`status` remains on its prior Appendix J value",
      "Cancellation Request status changes to `recovered`; Workspace.`status` remains or restores to `prior_workspace_status`",
      "Day 14: Cancellation Request status changes to `processing`; Workspace.`status` remains on its prior Appendix J value while destructive writes stay blocked by the active Cancellation Request predicate",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "**Selection Report.** The immutable, finalized Phase 12 recommendation artifact created from a Selection Report Draft.",
  "**Selection Record.** The immutable Phase 13 closure bundle containing the finalized Selection Report plus snapshots of Requirements, Responses, Scores, comments/discussion manifests, and contract document references.",
  "**Approval Workflow.** The Phase 12 sub-state used when Org policy requires CFO / Legal / CRO / Procurement approval of a Selection Report.",
  "**Cancellation Request.** The first-class buyer-side record for a Workspace cancellation lifecycle, carrying cancellation reason, grace-window deadlines, recovery state, and audit-event links.",
  "**Post-Evaluation Feedback.** Optional buyer-side stakeholder feedback captured after Phase 13 closure.",
  "| `selection_phase_entity_authoring_completeness` | 4.2 |",
];

const FORBIDDEN_PATTERNS = [
  /Selection Report\s*\(§4\.3\.21\)/,
  /Selection Record\s*\(§4\.3\.21\)/,
  /Selection Record\s*\(§4\.3\.23\)/,
  /Approval Workflow\s*\(§4\.3\.2[13467]\)/,
  /Cancellation Request\s*\(§4\.3\.2[13457]\)/,
  /Post-Evaluation Feedback\s*\(§4\.3\.2[13456]\)/,
  /§4\.3\.x/i,
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

function fieldSignal(field: string): string {
  return `| \`${field}\` |`;
}

function findLine(doc: SpecDoc, signal: string): number {
  return doc.lines.findIndex((line) => line.includes(signal));
}

export const gate: SpecLintGate = {
  id: "selection_phase_entity_authoring_completeness",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const expectation of ENTITY_EXPECTATIONS) {
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

      if (!section.text.includes("| Field | Type | Constraints | Notes |")) {
        findings.push({
          file: doc.path,
          line: section.line,
          anchor: section.anchor,
          matched_text: "| Field | Type | Constraints | Notes |",
          message: `${expectation.label} is missing the canonical field-table header.`,
        });
      }

      for (const field of expectation.requiredFields) {
        const signal = fieldSignal(field);
        if (!section.text.includes(signal)) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: signal,
            message: `${expectation.label} is missing required entity field \`${field}\`.`,
          });
        }
      }

      for (const signal of expectation.signals) {
        if (!section.text.includes(signal)) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: signal,
            message: `${expectation.label} is missing required selection-phase authoring signal "${signal}".`,
          });
        }
      }
    }

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
            message: `${expectation.label} is missing required artifact reference "${signal}".`,
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
          message: `Missing global Selection Phase entity authoring binding "${signal}".`,
        });
      }
    }

    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i];
      if (line.includes("| `selection_phase_entity_authoring_completeness` |")) continue;
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: anchorForLine(doc, i),
            matched_text: line.trim(),
            message: "Phase 12 / 13 artifact references must cite finalized §4.3.23-§4.3.27 entities, not stale draft or placeholder anchors.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
