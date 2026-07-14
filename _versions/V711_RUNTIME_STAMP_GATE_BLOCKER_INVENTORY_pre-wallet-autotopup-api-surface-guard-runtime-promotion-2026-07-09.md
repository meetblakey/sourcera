# v7.1.1 Runtime Stamp-Gate Blocker Inventory

**Date:** 2026-07-09
**Source command:** `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_after_seller_onboarding_activation_bookkeeping.json`
**Full row inventory:** `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`
**JSON source:** `_audit/_tmp/v711_stamp_gate_latest.json`

## Verdict

Stamp gate outcome: **FAIL**.
Runtime rows parsed: **420**.
Blockers: **149**.

236 spec-tree rows have now been promoted during the 2026-07-07 through 2026-07-09 runtime-promotion passes after direct detector proof. Rows close only when runtime evidence lands and the Master Spec row is explicitly promoted to `runtime_active`.

## Runtime Status Counts

| Runtime status | Count |
|---|---:|
| `runtime_active` | 269 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m02_3` | 16 |
| `spec_binding_release_gate_only` | 2 |

## Blockers By Owning Pack

| Owning pack | Blockers | Missing evidence class |
|---|---:|---|
| `m11_3` | 102 | Deploy/test strategy workflows plus Convex deploy validators or integration tests. |
| `m24_3` | 5 | Billing runtime workflow, billing tests, or Convex deploy validators. |
| `m21_3` | 26 | Marketplace/runtime UI workflow, deploy validators, marketplace tests, or analytics tests. |
| `m02_3` | 16 | Per-gate detector under tools/spec-lint/gates/<gate_id>.ts. |
| `release_gate_only` | 0 | Release-orchestration evidence. |

## Latest Runtime Promotion

| Gate | Evidence | Result |
|---|---|---|
| `seller_onboarding_dropoff_recovery_registry_complete` | tools/spec-lint/gates/seller_onboarding_dropoff_recovery_registry_complete.ts; pass/fail fixtures; direct gate PASS; TypeScript PASS; full spec-lint PASS; stamp target absent | Promoted to `runtime_active`; scope is Appendix C / Appendix G / §41.2 / §24.3 / Appendix J catalog proof only. |
| `seller_onboarding_activation_events_use_51_envelope` | tools/spec-lint/gates/seller_onboarding_activation_events_use_51_envelope.ts; pass/fail fixtures; direct gate PASS; TypeScript PASS; full spec-lint PASS; stamp target absent | Promoted to `runtime_active`; scope is §49.1.7.A / §51.2.1 / §51.2.5 / Appendix I envelope-binding proof only. |
| `seller_onboarding_conversion_moment_kind_canonical` | tools/spec-lint/gates/seller_onboarding_conversion_moment_kind_canonical.ts; pass/fail fixtures; direct gate PASS; TypeScript PASS; full spec-lint PASS; stamp target absent | Promoted to `runtime_active`; scope is enum, entity-field, Stage-7 debrief, and Appendix L canonicality proof only. |

## Explicitly Not Promoted

| Gate | Reason |
|---|---|
| `seller_solo_onboarding_consumption_invisibility` | Requires product selectors / UI proof that Seller Solo hides wallet, value-dollar, rate-card, wallet-exhaustion, and envelope-pressure surfaces while preserving engine-side writes. |
| `seller_solo_per_bid_charge_stage_binding` | Requires product billing transition proof for Stage-5 charge capture, failed-capture hold state, and no Stage-6 advancement. |
| `seller_onboarding_provider_outage_visible` | Requires Convex, PostHog, and Loops.so outage simulations with §42 / §51 routing evidence. |
| `seller_onboarding_stage3_abandonment_allowance_not_debited` | Requires runtime allowance-debit predicate tests for cancelled Stage-3 batches and partial-draft preservation. |

## Live Documentation Defects Closed During Promotion

Appendix J `seller_onboarding_conversion_moment_kind` omitted `mid_bid_ai_budget_wall` while §4.4.22 used it, and Appendix L still pointed Stage 7 at legacy `seller_onboarding_conversion_moment_kind_enum`. This pass makes `seller_onboarding_conversion_moment_kind` the write-time canonical enum, marks `_enum` as a legacy analytics alias only, and updates Appendix L to the canonical enum.

## Current M02.3 Blockers

| Gate | Line | Missing evidence |
|---|---:|---|
| `dsar_cascade_residency_partition_isolation` | 66901 | tools/spec-lint/gates/dsar_cascade_residency_partition_isolation.ts. |
| `workos_raw_attributes_not_consumed` | 66916 | tools/spec-lint/gates/workos_raw_attributes_not_consumed.ts. |
| `no_hardcoded_directional_css` | 66981 | tools/spec-lint/gates/no_hardcoded_directional_css.ts. |
| `firecrawl_outage_progress_line_substitution` | 67145 | tools/spec-lint/gates/firecrawl_outage_progress_line_substitution.ts. |
| `kb_bootstrap_allowance_compensation_completeness` | 67146 | tools/spec-lint/gates/kb_bootstrap_allowance_compensation_completeness.ts. |
| `m16_same_domain_enforcement_dual_point_canonical` | 67153 | tools/spec-lint/gates/m16_same_domain_enforcement_dual_point_canonical.ts. |
| `dsar_erased_seller_excluded_from_recovery_cadence` | 67162 | tools/spec-lint/gates/dsar_erased_seller_excluded_from_recovery_cadence.ts. |
| `network_effects_dashboard_outage_render_contract` | 67166 | tools/spec-lint/gates/network_effects_dashboard_outage_render_contract.ts. |
| `solo_trial_one_per_org_lifetime` | 67376 | tools/spec-lint/gates/solo_trial_one_per_org_lifetime.ts. |
| `solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid` | 67386 | tools/spec-lint/gates/solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid.ts. |
| `email_bounce_complaint_suppression_runtime` | 67651 | tools/spec-lint/gates/email_bounce_complaint_suppression_runtime.ts. |
| `feature_parity_matrix_completeness` | 67889 | tools/spec-lint/gates/feature_parity_matrix_completeness.ts. |
| `wallet_autotopup_override_api_surface_guard` | 67938 | tools/spec-lint/gates/wallet_autotopup_override_api_surface_guard.ts. |
| `appendix_g_legacy_alias_retirement_enforced` | 67993 | tools/spec-lint/gates/appendix_g_legacy_alias_retirement_enforced.ts. |
| `protected_asset_archive_state_canonical` | 68009 | tools/spec-lint/gates/protected_asset_archive_state_canonical.ts. |
| `protected_asset_purge_guard` | 68010 | tools/spec-lint/gates/protected_asset_purge_guard.ts. |
