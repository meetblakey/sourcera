/**
 * Gate: `workspace_recovery_event_catalog_completeness`
 *
 * Assertion: workspace cancellation/recovery events are registered in §29.1,
 * Appendix C, Appendix G, and the recovery seller projection uses
 * `workspace_reopened_ops`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_TEXTS = [
  "workspace_canceled` notification (registered in §29.1, Appendix C, and Appendix G)",
  "All vendors that received `workspace_canceled` receive `workspace_recovered`",
  "no silent undo path is permitted",
  "workspace_canceled` and `workspace_recovered` MUST appear in §29.1, Appendix C, and Appendix G",
  "Seller-side projections MUST use only `workspace_canceled` and `workspace_reopened_ops` Console Bridge Event kinds",
  "`workspace_reopened_ops` with `reopened_at`, `reopen_reason_public=\"buyer_recovered_during_grace\"`, and `acting_role_snapshot` only",
];

const CATALOG_ROWS = [
  "| `workspace_canceled` | Workspace cancellation initiated (§10.14.2) | All workspace members + invited vendors with submitted responses | Yes | Yes | Immediate |",
  "| `workspace_recovered` | Workspace cancellation undone / recovered (§10.14.3 / §10.14.5) | All workspace members + vendors previously notified via `workspace_canceled` | Yes | Yes | Immediate |",
  "| `workspace_canceled` | Workspace canceled | `workspace_id`, `reason ∈ Appendix J workspace_cancellation_reason`, `reason_text_present` |",
  "| `workspace_recovered` | Workspace cancellation undone / recovered (§10.14.3 / §10.14.5) | `workspace_id`, `recovered_at`, `recovered_by_user_id`, `prior_workspace_status`, `vendor_notification_count` |",
  "| `workspace_reopened_ops` | `workspace_id`, `reopened_at`, `reopen_reason_public` (≤500 chars), `acting_role_snapshot` | Full Ops rationale, internal-comment context, buyer User ID, Ops note, cross-vendor recovery count |",
];

export const gate: SpecLintGate = {
  id: "workspace_recovery_event_catalog_completeness",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol");
    const text = section ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
    if (!section) {
      return [{ file: doc.path, line: 0, anchor: "10.14-bid-workspace-cancellation-protocol", message: "§10.14 cancellation section is missing." }];
    }

    const findings: Finding[] = [];
    for (const required of REQUIRED_TEXTS) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: required,
          message: `§10.14 is missing event-catalog binding: ${required}`,
        });
      }
    }
    if (/silent undo|no undo notification/i.test(text) && !text.includes("no silent undo path is permitted")) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        message: "§10.14.3 must not contain a silent undo or no-notification path.",
      });
    }

    for (const required of CATALOG_ROWS) {
      if (!doc.text.includes(required)) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: required,
          message: `Missing workspace cancellation/recovery catalog row: ${required}`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
