# Phase v7.1.1 Remaining Runtime Blocker Classification

**Date:** 2026-07-09

## Current Stamp-Gate Posture

`tools/release/stamp_gate.ts` remains fail-closed.

| Class | Count | Current disposition |
|---|---:|---|
| `runtime_active` | 273 | Proven by local detector / release artifact evidence. |
| `spec_binding_pending_pack_m11_3` | 102 | Product deploy validators, integration tests, Convex validators, or runtime tests still missing. |
| `spec_binding_pending_pack_m21_3` | 26 | Marketplace/runtime UI, analytics, or production-observability evidence still missing. |
| `spec_binding_pending_pack_m02_3` | 14 | Product-code/static-analysis or mixed runtime rows still missing; not honestly closable from docs alone. |
| `spec_binding_pending_pack_m24_3` | 5 | Billing runtime, Stripe, or finance-validator evidence still missing. |
| `spec_binding_release_gate_only` | 2 | Release-orchestration rows; not counted as pending-pack blockers. |

Current blocker count: **147**.

This supersedes the earlier 2026-07-09 420-row / 271-`runtime_active` snapshot. The later Phase 3.5 DSAR P2 closure added two spec-tree runtime-active rows while leaving the pending-pack blocker count unchanged.

## Remaining M02.3 Rows

These rows remain blocked because their own evidence columns require product code, runtime, render-path, API, deploy-validator, billing, dashboard, or active-consumer proof. A docs-only detector would be a false positive.

| Gate | Evidence still required | Why not promoted |
|---|---|---|
| `dsar_cascade_residency_partition_isolation` | DSAR cascade-walker static analysis | Needs product code path proof that cross-region reads/writes and non-home User mutation are impossible. |
| `workos_raw_attributes_not_consumed` | Sourcera codebase static analysis | Needs product ingestion/SCIM handler proof that `raw_attributes` is not read. |
| `no_hardcoded_directional_css` | CSS / TSX style scan plus allow-list | Needs product UI source scan, not just spec prose. |
| `firecrawl_outage_progress_line_substitution` | Next.js render-path test + Datadog synthetic | Needs rendered Hero Moment behavior under Firecrawl degraded/down states. |
| `kb_bootstrap_allowance_compensation_completeness` | Convex unit + post-build proof | Spec already defines predicate/event/email/Ops surface; runtime sweeper and endpoint evidence remain. |
| `m16_same_domain_enforcement_dual_point_canonical` | Convex unit + post-build proof | Needs create-time validator, signup-time safety net, and event emission proof. |
| `dsar_erased_seller_excluded_from_recovery_cadence` | Convex unit + suppression-list join | Needs recovery sweeper proof that pseudonymized sellers are skipped. |
| `network_effects_dashboard_outage_render_contract` | Next.js render-path test | Needs dashboard render proof for PostHog / Snowflake / Datadog / composite paths. |
| `solo_trial_one_per_org_lifetime` | PR lint + deploy validator | Needs accepted TrialState uniqueness, eligibility, billing suppression, and day-91 event atomicity proof. |
| `solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid` | PR lint + deploy validator | Needs emitted CTA threshold behavior and payload exclusion proof. |
| `email_bounce_complaint_suppression_runtime` | Runtime property test | Needs provider bounce/complaint to suppression-row and next-send-block proof. |
| `appendix_g_legacy_alias_retirement_enforced` | PR lint + runtime test | Needs active emitter/dashboard consumer proof that removed aliases are not emitted or consumed. |
| `protected_asset_archive_state_canonical` | Deploy validator + runtime test | Needs Class-1 bucket state-transition and retention-metadata proof. |
| `protected_asset_purge_guard` | API contract test + deploy validator | Needs customer hard-delete rejection and legal/DSAR workflow carve-out proof. |

## Decision

No remaining M02.3 blocker is promoted in this pass. The documentation is now explicit that these are still release blockers until runtime-pack evidence lands. This avoids the prior happy-path error of treating unresolved rows as historical.

## Verification

Commands:

```bash
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Results:

- Stamp gate: FAIL on 147 runtime-evidence blockers after parsing 422 runtime rows with 273 `runtime_active` rows.
- Full spec-lint: PASS, 0 blocking findings.
