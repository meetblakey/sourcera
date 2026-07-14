import type { Finding, GateContext, RowClass, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  appendixEnumValues,
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireExactValues,
  requireTokens,
  sectionText,
} from "./marketplace_entity_gate_helpers.js";

type CheckFn = (doc: SpecDoc) => Finding[];

const REQUIRED_ENVELOPE_PROPERTIES = [
  "event_id",
  "usage_event_id",
  "name",
  "event_family",
  "emitted_at",
  "org_id",
  "console",
  "workspace_id",
  "user_id",
  "phase",
  "entity_ref",
  "capability_id",
  "plan_tier",
  "data_residency_region",
  "session_id",
  "schema_version",
] as const;

function requireTableRow(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  const row = findLine(doc, predicate);
  if (!row) {
    push(findings, doc, 0, label, `${label} row is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `${label} row is missing required token: ${token}`);
    }
  }
}

function forbidExactText(findings: Finding[], doc: SpecDoc, text: string, message: string) {
  const row = findLine(doc, (line) => line.includes(text));
  if (row) push(findings, doc, row.line, text, message);
}

export function buildSellerOnboardingActivationGate(id: string, rowClass: RowClass, check: CheckFn): SpecLintGate {
  return {
    id,
    sourcePhase: "v7.2.0-REM Phase 5.7 Seller Onboarding Residual P1",
    rowClass,
    executionContext: "pr_lint",
    overridePath: "not_permitted_catalog_completeness",
    inputs: { masterSpec: true },
    version: "1.0.0",
    run(ctx: GateContext): Finding[] {
      return [...check(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, id)];
    },
  };
}

export function sellerOnboardingDropoffRecoveryRegistryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, "49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure", "§49.1.7.A", [
    "Stage 1 stalled before SSO",
    "`seller_onboarding_stage_1_stalled`",
    "no SellerInboxItem because Seller Org / User does not yet exist",
    "`seller_onboarding_stage_1_stalled_email_sent`",
    "Stage 5 bid unsubmitted",
    "`seller_onboarding_bid_unsubmitted`",
    "SellerInboxItem `seller_onboarding_recovery_nudge`",
    "`seller_onboarding_bid_unsubmitted_nudge_rendered`",
    "Stage 7 post-activation dormant",
    "`seller_post_activation_dormant`",
    "SellerInboxItem `seller_post_activation_dormant_nudge`",
    "`seller_post_activation_dormant_nudge_rendered`",
    "`seller_onboarding_dropoff_recovery_registry_complete`",
  ]);

  requireTableRow(findings, doc, "Appendix C seller_onboarding_stage_1_stalled", (line) => line.trim().startsWith("| `seller_onboarding_stage_1_stalled` |"), [
    "§49.1.7.A pre-SSO Stage 1 stalled re-engagement",
    "MarketplaceInviteLink recipient",
    "Email",
    "Idempotent on `(invite_id, recovery_stage='stage_1_stalled')`",
    "no SellerInboxItem before Seller Org exists",
  ]);
  requireTableRow(findings, doc, "Appendix C seller_onboarding_bid_unsubmitted", (line) => line.trim().startsWith("| `seller_onboarding_bid_unsubmitted` |"), [
    "§49.1.7.A Stage 5 bid-unsubmitted recovery",
    "Seller's `org_owner` + Seller Bid Captain",
    "Email + In-app inbox card",
    "Idempotent on `(session_id, recovery_stage='bid_unsubmitted')`",
    "Materializes SellerInboxItem `seller_onboarding_recovery_nudge`",
  ]);
  requireTableRow(findings, doc, "Appendix C seller_post_activation_dormant", (line) => line.trim().startsWith("| `seller_post_activation_dormant` |"), [
    "§49.1.7.A Stage 7 post-activation dormant recovery",
    "Seller's `org_owner` + Seller Admin",
    "Email + In-app inbox card",
    "Idempotent on `(session_id, recovery_stage='post_activation_dormant')`",
    "Materializes SellerInboxItem `seller_post_activation_dormant_nudge`",
  ]);

  requireTableRow(findings, doc, "Appendix G seller_onboarding_stage_1_stalled_email_sent", (line) => line.trim().startsWith("| `seller_onboarding_stage_1_stalled_email_sent` |"), [
    "Appendix C `seller_onboarding_stage_1_stalled` email enqueued",
    "`invite_id`",
    "`invite_source`",
    "`elapsed_seconds_since_arrival`",
    "`suppression_state`",
  ]);
  requireTableRow(findings, doc, "Appendix G seller_onboarding_bid_unsubmitted_nudge_rendered", (line) => line.trim().startsWith("| `seller_onboarding_bid_unsubmitted_nudge_rendered` |"), [
    "Appendix C `seller_onboarding_bid_unsubmitted` materializes SellerInboxItem",
    "`seller_org_id`",
    "`session_id`",
    "`bid_id`",
    "`seller_inbox_item_id`",
  ]);
  requireTableRow(findings, doc, "Appendix G seller_post_activation_dormant_nudge_rendered", (line) => line.trim().startsWith("| `seller_post_activation_dormant_nudge_rendered` |"), [
    "Appendix C `seller_post_activation_dormant` materializes SellerInboxItem",
    "`seller_org_id`",
    "`session_id`",
    "`last_activity_at`",
    "`seller_inbox_item_id`",
  ]);

  requireTableRow(findings, doc, "§41.2 Seller Onboarding Stage 1 Stalled", (line) => line.trim().startsWith("| Seller Onboarding Stage 1 Stalled |"), [
    "`seller_onboarding_stage_1_stalled`",
    "Your Sourcera invite is waiting",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "pre-SSO invite-recipient re-engagement",
  ]);
  requireTableRow(findings, doc, "§41.2 Seller Onboarding Bid Unsubmitted", (line) => line.trim().startsWith("| Seller Onboarding Bid Unsubmitted |"), [
    "`seller_onboarding_bid_unsubmitted`",
    "Your bid draft is still waiting",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "Stage 5 recovery",
  ]);
  requireTableRow(findings, doc, "§41.2 Seller Post-Activation Dormant", (line) => line.trim().startsWith("| Seller Post-Activation Dormant |"), [
    "`seller_post_activation_dormant`",
    "Your Sourcera workspace is ready when you are",
    "`seller_inbox`",
    "`lifecycle`",
    "`marketing_lifecycle_opt_in`",
    "Stage 7 dormant recovery",
  ]);

  requireTableRow(findings, doc, "§24.3 seller_onboarding_recovery_nudge", (line) => line.trim().startsWith("| `seller_onboarding_recovery_nudge` |"), [
    "`seller_onboarding_bid_unsubmitted`",
    "`seller_onboarding_bid_unsubmitted_nudge_rendered`",
    "Seller Org owner, Seller Bid Captain",
  ]);
  requireTableRow(findings, doc, "§24.3 seller_post_activation_dormant_nudge", (line) => line.trim().startsWith("| `seller_post_activation_dormant_nudge` |"), [
    "`seller_post_activation_dormant`",
    "`seller_post_activation_dormant_nudge_rendered`",
    "Seller Org owner, Seller Admin",
  ]);

  requireTokens(findings, doc, "appendix-j-controlled-vocabulary-registry", "Appendix J", [
    "#### `seller_inbox_item_kind` (§4.4.33, §24.3)",
    "`seller_onboarding_recovery_nudge`",
    "`seller_post_activation_dormant_nudge`",
  ]);

  return findings;
}

export function sellerOnboardingActivationEventsEnvelopeFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, "49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure", "§49.1.7.A", [
    "**Activation event envelope binding.**",
    "`seller_onboarding_stage_entered`",
    "`seller_onboarding_first_requirement_response`",
    "`seller_first_requirement_response`",
    "`seller_onboarding_first_bid_submitted`",
    "`seller_first_bid_submitted`",
    "`hero_moment_completed`",
    "`seller_onboarding_completed`",
    "Declare `event_family='marketplace'` per §51.1.1.",
    "Pass the §51.2.5 `UsageEventValidator` at Convex insert and PostHog outbox dispatch.",
    "`seller_onboarding_activation_events_use_51_envelope`",
    "Appendix I `usage_event_envelope_violation`",
  ]);

  for (const prop of REQUIRED_ENVELOPE_PROPERTIES) {
    requireTokens(findings, doc, "51.2.1-required-standard-property-set", "§51.2.1", [`| \`${prop}\` |`]);
    requireTokens(findings, doc, "49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure", "§49.1.7.A", [
      `\`${prop}\``,
    ]);
  }

  requireTokens(findings, doc, "51.2.5-property-validator-contract", "§51.2.5", [
    "The `UsageEventValidator` runs at two boundaries",
    "HTTP 422 `usage_event_envelope_violation`",
    "reject insert at Convex",
    "quarantine to `usage_event_envelope_dlq`",
  ]);
  requireTableRow(findings, doc, "Appendix I usage_event_envelope_violation", (line) => line.trim().startsWith("| `usage_event_envelope_violation` |"), [
    "§51.2.5 `UsageEventValidator`",
    "Appendix G preamble required property set",
    "`error.analytics.usage_event_envelope_violation`",
  ]);

  return findings;
}

export function sellerOnboardingConversionMomentKindCanonicalFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const expected = ["mid_bid_ai_budget_wall", "second_concurrent_bid", "first_eoi_attempt", "kb_ceiling_approach", "none"] as const;
  const canonical = appendixEnumValues(doc, "#### `seller_onboarding_conversion_moment_kind` (§4.4.22)");
  if (!canonical) {
    push(findings, doc, 0, "seller_onboarding_conversion_moment_kind", "Appendix J canonical seller_onboarding_conversion_moment_kind enum is missing.");
  } else {
    requireExactValues(findings, doc, "Appendix J seller_onboarding_conversion_moment_kind", canonical.line, canonical.values, expected);
  }

  requireTokens(findings, doc, "4.4.22-selleronboardingsession", "§4.4.22 SellerOnboardingSession", [
    "Appendix J `seller_onboarding_conversion_moment_kind`",
    "`mid_bid_ai_budget_wall`",
    "`second_concurrent_bid`",
    "`first_eoi_attempt`",
    "`kb_ceiling_approach`",
    "`none`",
  ]);
  requireTokens(findings, doc, "49.1.7-stage-7-post-submission-debrief", "§49.1.7", [
    "The loss-debrief insight gate itself is NOT a conversion-moment enum value and MUST NOT write `stage_7_conversion_moment_kind`.",
    "moment_kind ∈ Appendix J seller_onboarding_conversion_moment_kind",
    "the loss-debrief insight gate emits only `seller_loss_debrief_insight_gate_triggered`",
  ]);
  requireTokens(findings, doc, "49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure", "§49.1.7.A", [
    "Stage 7 no longer treats `loss_debrief_insight_gate` as a Conversion Moment",
    "`seller_onboarding_conversion_moment_kind_canonical`",
    "Stage 7 MUST NOT emit `moment_kind='loss_debrief_insight_gate'`",
    "every Conversion Moment event uses one of Appendix J `seller_onboarding_conversion_moment_kind`",
  ]);
  requireTokens(findings, doc, "appendix-j-controlled-vocabulary-registry", "Appendix J", [
    "Legacy analytics alias for the canonical Appendix J `seller_onboarding_conversion_moment_kind`.",
    "Product writes to SellerOnboardingSession and §49.1.7 Conversion Moment telemetry MUST use the canonical values",
  ]);
  forbidExactText(
    findings,
    doc,
    "conversion_moment_kind` populated per `seller_onboarding_conversion_moment_kind_enum",
    "Appendix L stage mapping must cite canonical `seller_onboarding_conversion_moment_kind`, not the legacy `_enum` alias.",
  );

  return findings;
}
