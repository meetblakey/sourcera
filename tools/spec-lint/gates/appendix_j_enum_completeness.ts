/**
 * Gate: `appendix_j_enum_completeness`
 * Source phase: v7.2.0-REM Phase 6 (§M.5.18)
 *
 * Assertion: selected catalog-completeness enums remain registered in Appendix J
 * with their critical values.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken, sectionText } from "./catalog_gate_helpers.js";

const ENUMS: Record<string, string[]> = {
  policy_framework_kind: ["soc_2_type_ii", "iso_27001", "custom_other"],
  policy_framework_confidence_band: ["high", "low_confidence", "unknown_framework"],
  policy_framework_inference_outcome: ["accepted", "low_confidence_pending_user", "unknown_pending_user"],
  policy_custom_use_case_category: ["security", "compliance", "operations", "data_privacy"],
  policy_dedup_action: ["merge", "keep_a", "keep_b", "reject"],
  policy_amendment_state: ["pending_review", "approved", "rejected", "pending_refinement", "active"],
  policy_ingestion_job_status: ["parsing", "framework_detected", "extracting", "dedup_pending", "dedup_resolved", "mapping", "amendments_drafted", "completed", "failed"],
  console_bridge_event_kind: ["requirement_created", "response_submitted", "bid_workspace_voluntary_withdrawn"],
  console_bridge_event_direction: ["buyer_to_seller", "seller_to_buyer"],
  console_bridge_event_sync_status: ["pending", "synced", "retrying", "failed", "dlq", "superseded"],
  console_bridge_event_failure_reason: ["target_bid_workspace_missing", "persistent_firewall_violation_suspected", "other_permanent"],
  console_bridge_event_conflict_resolution: ["last_write_wins", "buyer_origin_wins", "operation_non_idempotent_dlq", "merge_op"],
  vendor_disqualification_severity: ["soft", "account_level", "global_ban"],
  vendor_disqualification_trigger: ["workspace_owner_manual", "ops_compliance_action", "duplicate_bid_submission"],
  vendor_disqualification_notification_style: ["neutral_no_rationale", "rationale_shared_with_vendor", "silent_no_vendor_notification"],
  vendor_disqualification_appeal_status: ["not_offered", "eligible", "submitted", "under_review", "upheld", "overturned", "expired"],
  vendor_disqualification_reversal_reason: ["buyer_workspace_owner_reversal_within_72h", "ops_manual_reversal", "system_error_rollback"],
  disqualification_notification_failure_reason: ["loops_5xx_exhausted", "template_variable_missing", "seller_org_deleted"],
  match_score_feedback_kind: ["score_too_high", "score_too_low", "other"],
  match_score_feedback_review_status: ["submitted", "triaged", "accepted_for_training", "escalated_to_model_rollback"],
  abuse_evidence_bundle_kind: ["coordinated_false_flag", "fraud_ring", "other"],
  abuse_evidence_bundle_ops_confidence: ["low", "medium", "high", "confirmed"],
  abuse_evidence_bundle_state: ["opened", "investigating", "consolidated_decision_pending", "closed_upheld", "closed_dismissed", "closed_inconclusive"],
  legal_process_kind: ["court_order_takedown", "subpoena_civil", "dmca_takedown", "regulator_order", "other"],
  legal_process_urgency: ["standard", "expedited", "emergency"],
  legal_process_review_state: ["received", "counsel_review", "compliance_verified", "challenged", "complied", "expired"],
  vendor_opt_out_authority_method: ["dns_txt", "seller_owner_attestation", "ops_imposed_attestation"],
  vendor_opt_out_authority_dns_probe_result: ["success", "nxdomain", "timeout", "record_mismatch"],
  vendor_opt_out_authority_verification_state: ["pending_proof", "verified", "expired", "revoked", "failed"],
  vendor_opt_out_authority_failure_reason: ["dns_lookup_failed", "dns_record_not_found", "ops_imposed_missing_dpo", "attestation_text_version_stale"],
  vendor_opt_out_revocation_reason_code: ["seller_change_of_position", "ops_override", "legal_dispute_resolved", "gdpr_withdrawal", "attestation_reinstated", "other"],
  seller_signal_k_anon_state: ["unevaluated", "satisfied", "suppressed_k_anon", "suppressed_recompute_deadline", "expired", "soft_deleted"],
  webhook_retry_class: ["standard", "financial_impact"],
};

const APPENDIX_J_WIDE_ENUMS: Record<string, string[]> = {
  throttle_kind: ["per_user", "per_target_domain"],
};

export const gate: SpecLintGate = {
  id: "appendix_j_enum_completeness",
  sourcePhase: "v7.2.0-REM Phase 6",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const phaseText = [
      sectionText(doc, "appendix-j-v72rem-phase-10"),
      sectionText(doc, "appendix-j-v72rem-phase-6"),
    ].join("\n");
    const findings: Finding[] = [];
    for (const [enumName, values] of Object.entries(ENUMS)) {
      const marker = `**\`${enumName}\`**`;
      if (!phaseText.includes(marker)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, enumName),
          matched_text: enumName,
          message: `Appendix J Phase 6 / Phase 10 block is missing enum ${enumName}.`,
        });
        continue;
      }
      for (const value of values) {
        if (!phaseText.includes(value)) {
          findings.push({
            file: doc.path,
            line: lineForToken(doc, enumName),
            matched_text: value,
            message: `Appendix J enum ${enumName} is missing required value ${value}.`,
          });
        }
      }
    }
    for (const [enumName, values] of Object.entries(APPENDIX_J_WIDE_ENUMS)) {
      const marker = `#### \`${enumName}\``;
      if (!doc.text.includes(marker)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, enumName),
          matched_text: enumName,
          message: `Appendix J is missing enum ${enumName}.`,
        });
        continue;
      }
      for (const value of values) {
        if (!doc.text.includes(value)) {
          findings.push({
            file: doc.path,
            line: lineForToken(doc, enumName),
            matched_text: value,
            message: `Appendix J enum ${enumName} is missing required value ${value}.`,
          });
        }
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
