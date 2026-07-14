/**
 * Gate: `scoring_resilience_contract_completeness`
 *
 * Assertion: Final Lead overrides, EX proposals, N-reviewer resolution,
 * mobile limits, and collaboration degradation retain their canonical
 * Buyer-only source contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "scoring_resilience_contract_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const entireSpec = { text: doc.lines.join("\n"), startLine: 0 };
  requireTokens(
    findings,
    doc,
    entireSpec,
    "§4.3.6 Score",
    [
      "lead_override_finalized_at",
      "lead_override_finalized_by",
      "lead_override_finalized_entry_id",
      "score_lead_override_final",
      "Compare-and-set version",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "4.3.6.3-scoreexclusionproposal"),
    "§4.3.6.3 ScoreExclusionProposal",
    [
      "score_exclusion_proposal_status",
      "One active pending proposal per Score.",
      "score.exclusion_proposed",
      "score.exclusion_approved",
      "score.exclusion_rejected",
      "approver_unavailable",
      "Seller, Marketplace, public, cross-Org, and cross-Workspace reads return HTTP 404.",
      "Pattern B pseudonymizes",
      "approval_window",
    ],
  );
  requireTokens(
    findings,
    doc,
    entireSpec,
    "§13.4 Exclusion",
    [
      "ScoreExclusionProposal",
      "score_exclusion_self_approval_forbidden",
      "score_exclusion_rejection_reason_required",
      "score_exclusion_pending_conflict",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "13.6-collaborative-scoring-and-disagreement-resolution"),
    "§13.6 Collaborative Scoring",
    [
      "max(active_grade_values) - min(active_grade_values)",
      "first three distinct grade groups",
      "### 13.6.4 Mobile and Tablet Behavior",
      "phone does not support collaborative scoring",
      "### 13.6.5 Collaboration Degradation and Recovery",
      "scoring_realtime_unavailable",
      "no blind background replay",
    ],
  );
  requireTokens(
    findings,
    doc,
    entireSpec,
    "§32.10.9.A.2 Score Exclusion Proposal endpoints",
    [
      "write:scores",
      "Idempotency-Key",
      "expected_score_version",
      "expected_proposal_version",
      "No route emits a customer webhook or creates a Console Bridge event.",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "appendix-i-api-error-code-catalog"),
    "Appendix I scoring errors",
    [
      "score_lead_override_final",
      "score_exclusion_self_approval_forbidden",
      "score_exclusion_rejection_reason_required",
      "score_exclusion_pending_conflict",
      "score_exclusion_approver_unavailable",
      "scoring_realtime_unavailable",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"),
    "Appendix J scoring resilience registries",
    [
      "score_exclusion_proposal_status",
      "score_exclusion_rejection_code",
      "scoring_realtime_state",
      "scoring_resolution_kind",
      "score_exclusion_proposal",
      "score.lead_override_finalized",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "l-23a-score-exclusion-proposal-state-machine"),
    "Appendix L.23A Score Exclusion Proposal state machine",
    [
      "| `pending` | `approved` |",
      "| `pending` | `rejected` |",
      "| `pending` | `cancelled` |",
      "Seller, Marketplace, public, Console Bridge, and webhook projections are forbidden.",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "m-5-105-v711-scoring-resilience-closure"),
    "§M.5.105 scoring resilience gate registration",
    [GATE_ID, "runtime_active", "M02.3"],
  );
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 4.4 scoring resilience closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_score_math_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
