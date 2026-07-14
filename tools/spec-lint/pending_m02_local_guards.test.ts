import assert from "node:assert/strict";
import test from "node:test";
import { runGate } from "./lib/gate.js";
import { loadDoc } from "./lib/spec_loader.js";
import type { GateContext, SpecLintGate } from "./lib/types.js";
import { gate as outcomeSubjectGate } from "./gates/outcome_contract_signal_subject_enum_bound.js";
import { gate as opsCapsGate } from "./gates/ops_session_numerical_caps_single_source.js";
import { gate as aliasRetirementGate } from "./gates/appendix_g_legacy_alias_retirement_enforced.js";
import { gate as buyerFunnelGate } from "./gates/buyer_evaluation_funnel_derivation_consistency.js";
import { gate as soloTrialGate } from "./gates/solo_trial_one_per_org_lifetime.js";
import { gate as soloUpgradeCtaGate } from "./gates/solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid.js";
import { gate as firecrawlOutageGate } from "./gates/firecrawl_outage_progress_line_substitution.js";
import { gate as kbBootstrapCompensationGate } from "./gates/kb_bootstrap_allowance_compensation_completeness.js";
import { gate as m16SameDomainGate } from "./gates/m16_same_domain_enforcement_dual_point_canonical.js";
import { gate as dsarRecoveryGate } from "./gates/dsar_erased_seller_excluded_from_recovery_cadence.js";
import { gate as networkOutageGate } from "./gates/network_effects_dashboard_outage_render_contract.js";
import { gate as emailSuppressionGate } from "./gates/email_bounce_complaint_suppression_runtime.js";
import { gate as auditExemptionGate } from "./gates/audit_integrity_exemption_redaction_path_correctness.js";

function result(gate: SpecLintGate, fixture: string) {
  const masterSpec = loadDoc(`tools/spec-lint/fixtures/${fixture}`);
  const ctx: GateContext = {
    masterSpec,
    overrides: new Map(),
    extraDocs: new Map(),
  };
  return runGate(gate, ctx);
}

test("OutcomeContract subject enum guard passes the canonical fixture", () => {
  const output = result(outcomeSubjectGate, "outcome_contract_signal_subject_enum_bound/pass.md");
  assert.equal(output.outcome, "pass");
  assert.equal(output.findings.length, 0);
});

test("OutcomeContract subject enum guard rejects an unregistered field value", () => {
  const output = result(outcomeSubjectGate, "outcome_contract_signal_subject_enum_bound/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("unknown_subject")));
});

test("OpsSession numerical singleton guard passes the canonical fixture", () => {
  const output = result(opsCapsGate, "ops_session_numerical_caps_single_source/pass.md");
  assert.equal(output.outcome, "pass");
  assert.equal(output.findings.length, 0);
});

test("OpsSession numerical singleton guard rejects an inline hard-cap restatement", () => {
  const output = result(opsCapsGate, "ops_session_numerical_caps_single_source/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("§39.5")));
});

test("Appendix G legacy-alias guard passes the canonical fixture", () => {
  const output = result(aliasRetirementGate, "appendix_g_legacy_alias_retirement_enforced/pass.md");
  assert.equal(output.outcome, "pass");
});

test("Appendix G legacy-alias guard rejects an active dashboard consumer", () => {
  const output = result(aliasRetirementGate, "appendix_g_legacy_alias_retirement_enforced/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("active dashboard")));
});

test("Buyer-evaluation funnel guard passes the canonical fixture", () => {
  const output = result(buyerFunnelGate, "buyer_evaluation_funnel_derivation_consistency/pass.md");
  assert.equal(output.outcome, "pass");
});

test("Buyer-evaluation funnel guard rejects a completion alias emitter", () => {
  const output = result(buyerFunnelGate, "buyer_evaluation_funnel_derivation_consistency/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("duplicate emitter")));
});

test("Solo-trial lifetime guard passes the canonical fixture", () => {
  const output = result(soloTrialGate, "solo_trial_one_per_org_lifetime/pass.md");
  assert.equal(output.outcome, "pass");
  assert.equal(output.findings.length, 0);
});

test("Solo-trial lifetime guard rejects a weakened uniqueness key", () => {
  const output = result(soloTrialGate, "solo_trial_one_per_org_lifetime/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("legal_entity")));
});

test("Solo upgrade-CTA guard passes the canonical fixture", () => {
  const output = result(soloUpgradeCtaGate, "solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid/pass.md");
  assert.equal(output.outcome, "pass");
  assert.equal(output.findings.length, 0);
});

test("Solo upgrade-CTA guard rejects stale conversion attribution", () => {
  const output = result(soloUpgradeCtaGate, "solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("solo_envelope_pressure")));
});

test("Firecrawl outage guard passes the canonical fixture", () => {
  assert.equal(result(firecrawlOutageGate, "firecrawl_outage_progress_line_substitution/pass.md").outcome, "pass");
});

test("Firecrawl outage guard rejects the literal scanning fallback", () => {
  const output = result(firecrawlOutageGate, "firecrawl_outage_progress_line_substitution/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("substitute progress line")));
});

test("KB Bootstrap compensation guard passes the canonical fixture", () => {
  assert.equal(result(kbBootstrapCompensationGate, "kb_bootstrap_allowance_compensation_completeness/pass.md").outcome, "pass");
});

test("KB Bootstrap compensation guard rejects a missing email registration", () => {
  const output = result(kbBootstrapCompensationGate, "kb_bootstrap_allowance_compensation_completeness/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("§41.2")));
});

test("M16 same-domain guard passes the canonical fixture", () => {
  assert.equal(result(m16SameDomainGate, "m16_same_domain_enforcement_dual_point_canonical/pass.md").outcome, "pass");
});

test("M16 same-domain guard rejects the stale dotted event name", () => {
  const output = result(m16SameDomainGate, "m16_same_domain_enforcement_dual_point_canonical/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("canonical event")));
});

test("DSAR recovery guard passes the canonical fixture", () => {
  assert.equal(result(dsarRecoveryGate, "dsar_erased_seller_excluded_from_recovery_cadence/pass.md").outcome, "pass");
});

test("DSAR recovery guard rejects enqueue-only protection", () => {
  const output = result(dsarRecoveryGate, "dsar_erased_seller_excluded_from_recovery_cadence/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("send-time")));
});

test("Network-effects outage guard passes the canonical fixture", () => {
  assert.equal(result(networkOutageGate, "network_effects_dashboard_outage_render_contract/pass.md").outcome, "pass");
});

test("Network-effects outage guard rejects a missing composite path", () => {
  const output = result(networkOutageGate, "network_effects_dashboard_outage_render_contract/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("All three simultaneous")));
});

test("Email suppression guard passes the canonical fixture", () => {
  assert.equal(result(emailSuppressionGate, "email_bounce_complaint_suppression_runtime/pass.md").outcome, "pass");
});

test("Email suppression guard rejects dispatch before suppression", () => {
  const output = result(emailSuppressionGate, "email_bounce_complaint_suppression_runtime/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("before provider dispatch")));
});

test("Audit exemption guard passes the canonical fixture", () => {
  assert.equal(result(auditExemptionGate, "audit_integrity_exemption_redaction_path_correctness/pass.md").outcome, "pass");
});

test("Audit exemption guard rejects an incomplete retained-row catalog", () => {
  const output = result(auditExemptionGate, "audit_integrity_exemption_redaction_path_correctness/fail.md");
  assert.equal(output.outcome, "fail");
  assert.ok(output.findings.some((finding) => finding.message.includes("retained row class 17")));
});
