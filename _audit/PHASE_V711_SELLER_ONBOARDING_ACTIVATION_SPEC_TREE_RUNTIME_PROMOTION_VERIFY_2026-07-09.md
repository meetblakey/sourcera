# Phase V711 Seller Onboarding Activation Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-09

## Scope

Promoted three §49.1.7.A / §M.5.62 Seller Onboarding M02.3 gates from `spec_binding_pending_pack_m02_3` to `runtime_active`:

- `seller_onboarding_dropoff_recovery_registry_complete`
- `seller_onboarding_activation_events_use_51_envelope`
- `seller_onboarding_conversion_moment_kind_canonical`

## Conflict Found

Appendix J `seller_onboarding_conversion_moment_kind` omitted `mid_bid_ai_budget_wall` while §4.4.22 referenced it. Appendix L also pointed Stage 7 to legacy `seller_onboarding_conversion_moment_kind_enum`.

## Resolution

- Added three spec-lint gates and pass/fail fixtures.
- Wired the gates into `tools/spec-lint/run-all.ts`.
- Promoted only the three spec-tree-provable §M.5.62 rows.
- Made `seller_onboarding_conversion_moment_kind` the canonical write-time enum.
- Preserved `seller_onboarding_conversion_moment_kind_enum` as a legacy analytics alias only.
- Updated Appendix L to cite the canonical enum.

## Not Promoted

The following §M.5.62 rows remain pending because they need product/runtime proof:

- `seller_solo_onboarding_consumption_invisibility`
- `seller_solo_per_bid_charge_stage_binding`
- `seller_onboarding_provider_outage_visible`
- `seller_onboarding_stage3_abandonment_allowance_not_debited`

## Verification

Commands:

- `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_onboarding_dropoff_recovery_registry_complete.ts Sourcera_Master_Spec.md`
- `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_onboarding_activation_events_use_51_envelope.ts Sourcera_Master_Spec.md`
- `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_onboarding_conversion_moment_kind_canonical.ts Sourcera_Master_Spec.md`
- `tools/spec-lint/node_modules/.bin/tsx --tsconfig tools/spec-lint/tsconfig.json --noEmit`
- `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json`

Results:

- Direct live gates PASS.
- Pass fixtures PASS.
- Fail fixtures FAIL as expected with 27 / 44 / 11 findings.
- TypeScript PASS.
- Full spec-lint PASS with 0 blocking findings.
- Stamp gate remains FAIL on 149 unrelated blockers.
- Runtime-active rows: 269.
- Remaining M02.3 blockers: 16.
- The three promoted gate IDs are absent from latest stamp-gate findings.
