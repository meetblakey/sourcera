/**
 * Gate: `score_disagreement_and_cohort_enum_contract`
 *
 * Assertion: Stakeholder cohorts use the closed Appendix J taxonomy and score
 * disagreement uses the detailed Buyer-only §13.6 resolution contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "score_disagreement_and_cohort_enum_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "2.6-cross-departmental-alignment-patterns"),
    "§2.6 Cross-Departmental Alignment Patterns",
    [
      "Their controlled values are Appendix J `stakeholder_cohort`",
      "distinct from the WorkspaceMembership RBAC role.",
      "this subsection's email-domain heuristics",
      "Auto-assignment heuristics are advisory and never prevent invite acceptance",
      "§13.6.2 / §13.6.3 is authoritative.",
      "`Pending Vendor Clarification` is retired as a score-workflow state",
      "The only resolution choices are Accept Average, an auditable Lead override, or Request Re-Evaluation",
      "does not authorize a vendor follow-up task, a webhook, a Seller projection, or a competing score-workflow API.",
      "`score.disagreement_card_visible` or `score.disagreement_escalated`",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "l-23-score-disagreement-resolution-state-machine"),
    "Appendix L.23 score disagreement resolution state machine",
    [
      "**Entity.** Derived Buyer `Score` resolution workflow; these labels are compendium labels, not a persisted enum or field.",
      "§13.6.2 / §13.6.3 owns the threshold keys, UI, decision choices, and payloads",
      "| `independent_scoring` | `card_visible` | Divergence evaluation |",
      "Emit `score.disagreement_card_visible`",
      "| `card_visible` | `lead_resolution` | Automatic escalation or Use Case Lead opens Review Disagreement |",
      "Automatic escalation emits `score.disagreement_escalated`",
      "| `lead_resolution` | `resolved` | Use Case Lead accepts average |",
      "| `lead_resolution` | `lead_override_finalized` | Use Case Lead overrides to a specific grade |",
      "| `lead_resolution` | `reevaluation_requested` | Use Case Lead chooses Request Re-Evaluation |",
      "| `reevaluation_requested` | `independent_scoring` | Re-evaluation starts |",
      "`Pending Vendor Clarification` is not a Score state.",
      "The derived disagreement state machine creates no vendor workflow, webhook, or cross-console projection.",
      "Score retention, DSAR pseudonymization, and residency for this workflow remain §4.3.6 / §6.8 / §40.2 authority",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"),
    "Appendix J controlled vocabulary registry",
    [
      "### Audit Event Action Type — Score Disagreement Resolution (§13.6.2 / §13.6.3)",
      "`score.disagreement_card_visible`, `score.disagreement_escalated`",
      "The actions are AuditEvent-only.",
      "### Stakeholder Cohort (§2.6.1)",
      "`exec_sponsor`, `evaluation_lead`, `functional_lead`, `technical_evaluator`, `sme_evaluator`",
      "It is independent of `WorkspaceMembership.role` and does not grant RBAC permissions.",
    ],
  );
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 stakeholder cohort and score-resolution closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
