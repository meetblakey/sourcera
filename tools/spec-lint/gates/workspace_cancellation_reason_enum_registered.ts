/**
 * Gate: `workspace_cancellation_reason_enum_registered`
 *
 * Assertion: §10.14 cancellation reasons resolve to Appendix J, `other`
 * requires the §39-bounded text field, and Appendix G binds reason to the enum.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REASONS = [
  "no_longer_needed",
  "vendor_selected_externally",
  "procurement_postponed",
  "internal_decision",
  "other",
];

function textForSection(ctx: GateContext, anchor: string): string {
  const section = findSectionByAnchor(ctx.masterSpec, anchor);
  return section ? ctx.masterSpec.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
}

export const gate: SpecLintGate = {
  id: "workspace_cancellation_reason_enum_registered",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const cancellation = textForSection(ctx, "10.14-bid-workspace-cancellation-protocol");
    if (!cancellation) {
      return [{ file: doc.path, line: 0, anchor: "10.14-bid-workspace-cancellation-protocol", message: "§10.14 cancellation section is missing." }];
    }

    for (const reason of REASONS) {
      if (!cancellation.includes(`\`${reason}\``)) {
        findings.push({
          file: doc.path,
          line: findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol")?.startLine ?? 0,
          anchor: "10.14-bid-workspace-cancellation-protocol",
          matched_text: reason,
          message: `§10.14.1 cancellation initiation is missing reason ${reason}.`,
        });
      }
    }
    for (const required of [
      "cancellation_reason ∈ Appendix J workspace_cancellation_reason",
      "When `cancellation_reason = other`, `cancellation_reason_text` is required and bounded by §39 row `Workspace Cancellation.cancellation_reason_text`.",
      "Otherwise `cancellation_reason_text` is omitted.",
    ]) {
      if (!cancellation.includes(required)) {
        findings.push({
          file: doc.path,
          line: findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol")?.startLine ?? 0,
          anchor: "10.14-bid-workspace-cancellation-protocol",
          matched_text: required,
          message: `§10.14.1 is missing cancellation reason enum binding: ${required}`,
        });
      }
    }

    const appendixJLine = doc.lines.findIndex((line) => line.includes("`workspace_cancellation_reason` enum"));
    const appendixJ = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
    const appendixJText = appendixJ ? doc.lines.slice(appendixJLine, Math.min(appendixJLine + 12, appendixJ.endLine + 1)).join("\n") : "";
    for (const reason of REASONS) {
      if (!appendixJText.includes(`\`${reason}\``)) {
        findings.push({
          file: doc.path,
          line: appendixJLine > 0 ? appendixJLine : appendixJ?.startLine ?? 0,
          anchor: appendixJ?.heading.anchor,
          matched_text: reason,
          message: `Appendix J workspace_cancellation_reason enum is missing ${reason}.`,
        });
      }
    }

    const appendixG = findSectionByAnchor(doc, "appendix-g-posthog-event-taxonomy");
    const appendixGText = appendixG ? doc.lines.slice(appendixG.startLine, appendixG.endLine + 1).join("\n") : "";
    if (!appendixGText.includes("| `workspace_canceled` | Workspace canceled | `workspace_id`, `reason ∈ Appendix J workspace_cancellation_reason`, `reason_text_present` |")) {
      findings.push({
        file: doc.path,
        line: appendixG?.startLine ?? 0,
        anchor: appendixG?.heading.anchor,
        message: "Appendix G workspace_canceled row must bind reason to Appendix J workspace_cancellation_reason and include reason_text_present.",
      });
    }

    const limits = findSectionByTitle(doc, /^39\./);
    const limitsText = limits ? doc.lines.slice(limits.startLine, limits.endLine + 1).join("\n") : doc.text;
    if (!limitsText.includes("| Workspace Cancellation | cancellation\\_reason\\_text | 500 chars | Required when `cancellation_reason = other` per Appendix J `workspace_cancellation_reason`; omitted for all other cancellation reasons. |")) {
      findings.push({
        file: doc.path,
        line: limits?.startLine ?? 0,
        anchor: limits?.heading.anchor,
        message: "§39 must contain the Workspace Cancellation.cancellation_reason_text bound row.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
