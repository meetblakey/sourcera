# v7.1.1 Runtime Stamp-Gate Blocker Inventory

**Date:** 2026-07-09
**Source command:** `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json`
**Full row inventory:** `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`
**JSON source:** `_audit/_tmp/v711_stamp_gate_current.json` and `_audit/_tmp/v711_stamp_gate_latest.json`

## Verdict

Stamp gate outcome: **FAIL**.
Runtime rows parsed: **422**.
Runtime active rows: **273**.
Blockers: **147**.

Rows close only when runtime evidence lands and the Master Spec row is explicitly promoted to `runtime_active`.

## Runtime Status Counts

| Runtime status | Count |
|---|---:|
| `runtime_active` | 273 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m02_3` | 14 |
| `spec_binding_release_gate_only` | 2 |

## Blockers By Owning Pack

| Owning pack | Blockers | Missing evidence class |
|---|---:|---|
| `m02_3` | 14 | Per-gate detector / static-analysis proof under `tools/spec-lint/gates/<gate_id>.ts`, plus fixtures and harness wiring where applicable. |
| `m11_3` | 102 | Deploy/test strategy workflows plus Convex deploy validators or integration tests. |
| `m21_3` | 26 | Marketplace/runtime UI workflow, deploy validators, marketplace tests, or analytics tests. |
| `m24_3` | 5 | Billing runtime workflow, billing tests, or Convex deploy validators. |
| `release_gate_only` | 0 | Release-orchestration evidence. |

## Current M02.3 Blockers

| Gate | Line | Section | Missing evidence |
|---|---:|---|---|
| `dsar_cascade_residency_partition_isolation` | 66943 | M.5.4 Catalog index {#m-5-4-catalog-index} | tools/spec-lint/gates/dsar_cascade_residency_partition_isolation.ts. |
| `workos_raw_attributes_not_consumed` | 66960 | M.5.4 Catalog index {#m-5-4-catalog-index} | tools/spec-lint/gates/workos_raw_attributes_not_consumed.ts. |
| `no_hardcoded_directional_css` | 67025 | M.5.4 Catalog index {#m-5-4-catalog-index} | tools/spec-lint/gates/no_hardcoded_directional_css.ts. |
| `firecrawl_outage_progress_line_substitution` | 67189 | M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions} | tools/spec-lint/gates/firecrawl_outage_progress_line_substitution.ts. |
| `kb_bootstrap_allowance_compensation_completeness` | 67190 | M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions} | tools/spec-lint/gates/kb_bootstrap_allowance_compensation_completeness.ts. |
| `m16_same_domain_enforcement_dual_point_canonical` | 67197 | M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions} | tools/spec-lint/gates/m16_same_domain_enforcement_dual_point_canonical.ts. |
| `dsar_erased_seller_excluded_from_recovery_cadence` | 67206 | M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions} | tools/spec-lint/gates/dsar_erased_seller_excluded_from_recovery_cadence.ts. |
| `network_effects_dashboard_outage_render_contract` | 67210 | M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions} | tools/spec-lint/gates/network_effects_dashboard_outage_render_contract.ts. |
| `solo_trial_one_per_org_lifetime` | 67420 | M.5.21 v7.2.0-REM P1 Solo trial additions (D-14.1-002 / D-14.2-002 closure) {#m-5-21-v72rem-p1-solo-trial-additions} | tools/spec-lint/gates/solo_trial_one_per_org_lifetime.ts. |
| `solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid` | 67430 | M.5.22 v7.2.0-REM P1 Solo throttling upgrade-CTA additions (D-14.1-003 / D-14.2-003 closure) {#m-5-22-v72rem-p1-solo-throttling-upgrade-cta-additions} | tools/spec-lint/gates/solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid.ts. |
| `email_bounce_complaint_suppression_runtime` | 67695 | M.5.45 v7.2.0-REM Phase 41 Email Domain P1 addition (D-41-001 through D-41-008, D-41-012, D-41-014 closure) {#m-5-45-v72rem-phase-41-email-domain-p1-addition} | tools/spec-lint/gates/email_bounce_complaint_suppression_runtime.ts. |
| `appendix_g_legacy_alias_retirement_enforced` | 68037 | M.5.64 v7.2.0-REM Phase 9.1 Appendix G Residual P1 addition (D-9.1-007 / -008 / -016 / -019 closure; D-9.1-002 adjacent P2 closure) {#m-5-64-v72rem-phase-9-1-appendix-g-residual-p1-addition} | tools/spec-lint/gates/appendix_g_legacy_alias_retirement_enforced.ts. |
| `protected_asset_archive_state_canonical` | 68053 | M.5.65 v7.2.0-REM Phase 34.19 Residual Plan Upgrade / Downgrade P1 addition (D-34.19-006 / -007 / -009 / -010 / -018 closure; D-V7-004 / D-V7-009 overlap) {#m-5-65-v72rem-phase-34-19-residual-plan-upgrade-downgrade-p1-addition} | tools/spec-lint/gates/protected_asset_archive_state_canonical.ts. |
| `protected_asset_purge_guard` | 68054 | M.5.65 v7.2.0-REM Phase 34.19 Residual Plan Upgrade / Downgrade P1 addition (D-34.19-006 / -007 / -009 / -010 / -018 closure; D-V7-004 / D-V7-009 overlap) {#m-5-65-v72rem-phase-34-19-residual-plan-upgrade-downgrade-p1-addition} | tools/spec-lint/gates/protected_asset_purge_guard.ts. |

## Runtime-Only Boundary

The remaining blockers are not closed by prose-only edits unless the associated evidence artifact exists and the §M.5 row can honestly move to `runtime_active`. Product-code, deploy-validator, UI runtime, billing runtime, marketplace runtime, and integration-test rows remain pending until those artifacts exist.
