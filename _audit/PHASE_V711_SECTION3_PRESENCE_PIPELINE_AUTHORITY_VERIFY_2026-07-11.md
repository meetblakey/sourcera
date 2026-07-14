# v7.1.1 Section 3 Presence, Mobile Pipeline, and Authority Verification

**Date:** 2026-07-11  
**Scope:** D-3UX-011, D-3UX-014, D-3UX-015, D-3UX-017, D-3UX-026, D-3UX-030

## Verified documentation closure

- §3.9.2 now defines session-scoped hue allocation, one-user roster aggregation, `+N devices`, disconnect behavior, and the required multi-device test.
- §38.12 is the sole avatar-cardinality home. §3.12 cites it, preserving the separate cursor cap in §3.9.
- §3.14 and UX §5.2.19 use pairwise-distinct mobile short labels, full accessible labels, locale fallback, failure behavior, and a `mobile_xs` acceptance criterion.
- §3.6.1 is canonical and UX §2.9 is a bounded mirror. Active form-token rationale no longer points to a retired source.
- OrganizationPreference policy binds to `ops_admin` per §50.3.
- D-3UX-015 was stale: current Appendix M.1 already contains the explicit Pipeline Surface Compression row.

## Commands

```sh
npx tsx tools/spec-lint/gates/section3_presence_pipeline_authority_consistency.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit
npx tsx tools/spec-lint/gates/section3_presence_pipeline_authority_consistency.ts --fixture tools/spec-lint/fixtures/section3_presence_pipeline_authority_consistency/pass.md --no-emit
npx tsx tools/spec-lint/gates/section3_presence_pipeline_authority_consistency.ts --fixture tools/spec-lint/fixtures/section3_presence_pipeline_authority_consistency/fail.md --no-emit
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_2026-07-11_presence-pipeline.json
```

## Evidence boundary

The gate verifies documentation only. It does not prove production Presence transport, cursor rendering, roster pagination, native mobile behavior, localization compilation, PostHog delivery, or browser E2E. Those remain release-blocking product-pack evidence where §M.5 requires it.
