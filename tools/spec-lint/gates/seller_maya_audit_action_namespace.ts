/**
 * Gate: `seller_maya_audit_action_namespace`
 * Source phase: v7.2.0-REM Phase 1.5 P1 (D-1.5-006)
 *
 * Assertion: §22.20.7 Seller Maya chip / KB lifecycle audit actions must extend
 * Appendix J `audit_event_action_type` KB additions, not BillingAdminAuditAction.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_ACTIONS = [
  "capability_declaration_chip_added",
  "capability_declaration_chip_removed",
  "capability_declaration_chip_renamed",
  "capability_declaration_deprecated",
  "kb_entry.auto_merged",
  "kb_entry.auto_archived",
];

export const gate: SpecLintGate = {
  id: "seller_maya_audit_action_namespace",
  sourcePhase: "v7.2.0-REM Phase 1.5 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const sellerMayaSection = findSectionByAnchor(doc, "22.20.7-acceptance-criteria");

    if (!sellerMayaSection) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "22.20.7-acceptance-criteria",
        message: "§22.20.7 Acceptance Criteria section is missing; cannot verify Seller Maya audit-action namespace.",
      }];
    }

    const sellerMayaText = doc.lines
      .slice(sellerMayaSection.startLine, sellerMayaSection.endLine + 1)
      .join("\n");

    if (sellerMayaText.includes("BillingAdminAuditAction")) {
      findings.push({
        file: doc.path,
        line: sellerMayaSection.startLine,
        anchor: "22.20.7-acceptance-criteria",
        matched_text: "BillingAdminAuditAction",
        message: "§22.20.7 Seller Maya audit actions must not extend BillingAdminAuditAction; use Appendix J audit_event_action_type KB additions.",
      });
    }

    const requiredCitation = "Appendix J `audit_event_action_type` (KB additions sub-section)";
    if (!sellerMayaText.includes(requiredCitation)) {
      findings.push({
        file: doc.path,
        line: sellerMayaSection.startLine,
        anchor: "22.20.7-acceptance-criteria",
        message: `§22.20.7 Authored Extensions item #5 must cite ${requiredCitation}.`,
      });
    }

    for (const action of REQUIRED_ACTIONS.filter((action) => action !== "capability_declaration_deprecated")) {
      if (!sellerMayaText.includes(action)) {
        findings.push({
          file: doc.path,
          line: sellerMayaSection.startLine,
          anchor: "22.20.7-acceptance-criteria",
          matched_text: action,
          message: `§22.20.7 Authored Extensions item #5 must list ${action}.`,
        });
      }
    }

    const kbAdditions = findSectionByTitle(doc, /Audit Event Action Type.*KB additions/);
    if (!kbAdditions) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: "appendix-j",
        message: "Appendix J Audit Event Action Type — KB additions section is missing.",
      });
      return findings;
    }

    const kbText = doc.lines
      .slice(kbAdditions.startLine, kbAdditions.endLine + 1)
      .join("\n");
    for (const action of REQUIRED_ACTIONS) {
      if (!kbText.includes(action)) {
        findings.push({
          file: doc.path,
          line: kbAdditions.startLine,
          anchor: kbAdditions.heading.anchor,
          matched_text: action,
          message: `Appendix J KB additions must register ${action}.`,
        });
      }
    }

    if (!kbText.includes("D-1.5-004 remediation") || !kbText.includes("entity_type = capability_declaration") || !kbText.includes("entity_type = kb_entry")) {
      findings.push({
        file: doc.path,
        line: kbAdditions.startLine,
        anchor: kbAdditions.heading.anchor,
        message: "Appendix J KB additions must retain the D-1.5-004/D-1.5-006 entity_type binding note for CapabilityDeclaration and KBEntry actions.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
