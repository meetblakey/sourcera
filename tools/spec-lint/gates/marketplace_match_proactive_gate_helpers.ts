import type { Finding, GateContext, RowClass, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, rowByField, sectionText } from "./marketplace_entity_gate_helpers.js";

type CheckFn = (doc: SpecDoc) => Finding[];

export function buildMarketplaceMatchProactiveGate(id: string, rowClass: RowClass, check: CheckFn): SpecLintGate {
  return {
    id,
    sourcePhase: "v7.2.0-REM Phase 6.2 Marketplace Match Score / Proactive Offer",
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

function requireFields(findings: Finding[], doc: SpecDoc, anchor: string, label: string, fields: string[]) {
  const section = sectionText(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return;
  }
  for (const field of fields) {
    if (!rowByField(doc, anchor, field)) {
      push(findings, doc, section.startLine, field, `${label} is missing field \`${field}\`.`);
    }
  }
}

function requireFieldTokens(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  field: string,
  label: string,
  tokens: string[],
) {
  const row = rowByField(doc, anchor, field);
  if (!row) {
    const section = sectionText(doc, anchor);
    push(findings, doc, section?.startLine ?? 0, field, `${label} is missing field \`${field}\`.`);
    return;
  }
  const text = row.cells.join(" | ");
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, row.line, token, `${label} field \`${field}\` is missing required token: ${token}`);
    }
  }
}

function forbidSectionPatterns(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
  patterns: Array<{ pattern: RegExp; reason: string }>,
) {
  const section = sectionText(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return;
  }
  for (let line = section.startLine; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    for (const { pattern, reason } of patterns) {
      if (pattern.test(text)) push(findings, doc, line, text.trim(), reason);
    }
  }
}

function requireDocumentTokens(findings: Finding[], doc: SpecDoc, label: string, tokens: string[]) {
  for (const token of tokens) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
    }
  }
}

export function marketplaceMatchScoreEntityFieldTableFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireFields(findings, doc, "4.5.10-marketplace-match-feature-registry", "§4.5.10 MarketplaceMatchFeatureRegistry", [
    "id",
    "org_id",
    "console",
    "feature_id",
    "registry_version",
    "display_name",
    "feature_type",
    "source_entity",
    "freshness_requirement",
    "weight_mode",
    "null_handling",
    "state",
    "introduced_model_version_id",
    "deprecated_model_version_id",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "deleted_at",
  ]);
  requireTokens(findings, doc, "4.5.10-marketplace-match-feature-registry", "§4.5.10 MarketplaceMatchFeatureRegistry", [
    "**Indexes.**",
    "**Scope isolation, retention, DSAR, and residency.**",
    "**Failure Modes Addressed.**",
    "**Acceptance Criteria.**",
  ]);
  requireFields(findings, doc, "4.5.11-marketplace-match-score-model-version", "§4.5.11 MarketplaceMatchScoreModelVersion", [
    "id",
    "org_id",
    "console",
    "version_label",
    "state",
    "residency_scope",
    "feature_registry_version",
    "feature_registry_snapshot_json",
    "training_window_start",
    "training_window_end",
    "trained_at",
    "auc_roc",
    "p_at_10",
    "parity_metric_json",
    "is_published",
    "published_at",
    "deprecated_at",
    "retired_at",
    "rollback_of_version_id",
    "approved_by",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "deleted_at",
  ]);
  requireTokens(findings, doc, "4.5.11-marketplace-match-score-model-version", "§4.5.11 MarketplaceMatchScoreModelVersion", [
    "**Indexes.**",
    "**Scope isolation, retention, DSAR, and residency.**",
    "**State machine.**",
    "**Failure Modes Addressed.**",
    "**Acceptance Criteria.**",
  ]);
  requireFields(findings, doc, "4.5.12-marketplace-match-score-snapshot", "§4.5.12 MarketplaceMatchScoreSnapshot", [
    "id",
    "org_id",
    "console",
    "trigger_class",
    "marketplace_listing_id",
    "eoi_record_id",
    "workspace_id",
    "buyer_org_id",
    "seller_org_id",
    "seller_software_id",
    "model_version_id",
    "model_version_label",
    "feature_registry_version",
    "feature_vector_hash",
    "feature_vector_json",
    "score_numeric",
    "qualitative_label",
    "render_mode_at_serialization",
    "hard_gate_triggered",
    "computed_at",
    "data_residency_region",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "deleted_at",
  ]);
  requireTokens(findings, doc, "4.5.12-marketplace-match-score-snapshot", "§4.5.12 MarketplaceMatchScoreSnapshot", [
    "**Indexes.**",
    "**Scope isolation, retention, DSAR, and residency.**",
    "**Failure Modes Addressed.**",
    "**Acceptance Criteria.**",
  ]);
  return findings;
}

export function marketplaceMatchScoreForwardReferenceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, "27.4-marketplace-match-score", "§27.4 Marketplace Match Score", [
    "current build authority is this §27.4 plus the §4.5.10 / §4.5.11 / §4.5.12 entity homes",
    "Retired Summary / KB-spec sources are provenance only and MUST NOT be cited as current authority.",
    "§22.5 KB Health Model + §22.8.4.1 `kb_retrieve_freshness` enum contract",
    "`MarketplaceMatchScoreSnapshot` row (§4.5.12)",
    "MarketplaceMatchFeatureRegistry`, canonical entity §4.5.10",
    "`MarketplaceMatchScoreModelVersion` entity (§4.5.11)",
    "MarketplaceMatchScoreSnapshot` row (§4.5.12)",
  ]);
  forbidSectionPatterns(findings, doc, "27.4-marketplace-match-score", "§27.4 Marketplace Match Score", [
    {
      pattern: /follow-on integration phase|authored under §4\.5\.x/i,
      reason: "§27.4 must not retain forward-reference placeholder language for Match Score entities.",
    },
    {
      pattern: /KB_Engineering_Spec\.md|KB Spec §13\.2|Summary C\.61\s*→/i,
      reason: "§27.4 must not cite retired Summary / KB spec sources as current authority.",
    },
  ]);
  return findings;
}

export function marketplaceProactiveOfferEntityContractFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireFields(findings, doc, "4.5.13-marketplaceproactiveoffer", "§4.5.13 MarketplaceProactiveOffer", [
    "id",
    "org_id",
    "console",
    "offer_channel",
    "offer_kind",
    "offer_state",
    "source_seller_signal_id",
    "seller_signal_cohort_fingerprint_hash",
    "source_category_ids",
    "source_region_scope",
    "subject_line",
    "body_markdown",
    "embedded_link_urls",
    "target_workspace_count",
    "pending_target_count",
    "accepted_target_count",
    "declined_target_count",
    "expired_target_count",
    "expires_at",
    "dispatched_at",
    "withdrawn_at",
    "withdrawn_by_user_id",
    "withdrawal_reason",
    "privacy_gate_snapshot_json",
    "idempotency_key_hash",
    "last_state_transition_audit_event_id",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "deleted_at",
  ]);
  requireTokens(findings, doc, "4.5.13-marketplaceproactiveoffer", "§4.5.13 MarketplaceProactiveOffer", [
    "**DirectInviteTargetAccount child rows.**",
    "**Indexes.**",
    "**Scope Isolation.**",
    "**State Machine (`offer_state`).**",
    "**Retention, DSAR, and Residency.**",
    "**Failure Modes Addressed.**",
    "**Acceptance Criteria.**",
  ]);
  requireDocumentTokens(findings, doc, "MarketplaceProactiveOffer companion registrations", [
    "**MarketplaceProactiveOffer.** Marketplace-domain parent entity (§4.5.13)",
    "| MarketplaceProactiveOffer (§4.5.13) |",
    "| Marketplace Proactive Offer (Direct Invite) | `MarketplaceProactiveOffer.offer_state` | §4.5.13 / §27.9.8 | Appendix J `marketplace_proactive_offer_state` |",
    "**Entity.** `MarketplaceProactiveOffer` is authored in §4.5.13.",
  ]);
  return findings;
}

export function marketplaceProactiveOfferKindChannelSplitFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireFieldTokens(findings, doc, "4.5.13-marketplaceproactiveoffer", "offer_channel", "§4.5.13 MarketplaceProactiveOffer", [
    "Appendix J `marketplace_proactive_offer_channel`: `direct_invite_from_cohort`",
    "API-boundary alias and rewritten to `offer_channel` before persistence",
  ]);
  requireFieldTokens(findings, doc, "4.5.13-marketplaceproactiveoffer", "offer_kind", "§4.5.13 MarketplaceProactiveOffer", [
    "Appendix J `direct_invite_offer_kind`",
    "not the channel discriminator",
  ]);
  requireTokens(findings, doc, "27.9.8-direct-invite-from-cohort", "§27.9.8 Direct Invite from Cohort", [
    "persisted `offer_channel='direct_invite_from_cohort'` identifies this flow",
    "persisted `offer_kind` uses Appendix J `direct_invite_offer_kind`",
  ]);
  requireDocumentTokens(findings, doc, "Direct Invite enum registrations", [
    "#### `marketplace_proactive_offer_channel`",
    "`direct_invite_from_cohort`.",
    "**Semantics:** Flow discriminator for `MarketplaceProactiveOffer.offer_channel` (§4.5.13).",
    "Request payloads that use the legacy shorthand `offer_kind=direct_invite_from_cohort` are API-boundary aliases only and MUST be rewritten before persistence.",
    "#### `direct_invite_offer_kind`",
    "`cohort_interest_signal`, `capability_match_hint`, `vertical_alignment`, `use_case_ready`.",
    "**Semantics:** The cohort-justification class surfaced on the invite UX",
  ]);
  forbidSectionPatterns(findings, doc, "4.5.13-marketplaceproactiveoffer", "§4.5.13 MarketplaceProactiveOffer", [
    {
      pattern: /persisted\s+`?offer_kind[=_]direct_invite_from_cohort`?/i,
      reason: "§4.5.13 must not persist `offer_kind=direct_invite_from_cohort`; it is only an API-boundary alias.",
    },
  ]);
  return findings;
}
