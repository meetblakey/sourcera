# Phase V711 Seller Activation Cohort Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** `seller_activation_cohort_canonical_enum`
**Result:** Promoted to `runtime_active`

## Detector Evidence

| Check | Command | Result |
|---|---|---|
| Live detector | `npx tsx tools/spec-lint/gates/seller_activation_cohort_canonical_enum.ts --spec Sourcera_Master_Spec.md` | PASS, 0 findings |
| Pass fixture | `npx tsx tools/spec-lint/gates/seller_activation_cohort_canonical_enum.ts --spec tools/spec-lint/fixtures/seller_activation_cohort_canonical_enum/pass.md` | PASS, 0 findings |
| Fail fixture | `npx tsx tools/spec-lint/gates/seller_activation_cohort_canonical_enum.ts --spec tools/spec-lint/fixtures/seller_activation_cohort_canonical_enum/fail.md` | FAIL, 9 expected findings |
| Full spec-lint | `npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `npx tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json > /tmp/sourcera_stamp_gate_final_current.json` | FAIL on remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows | 420 | 420 |
| `runtime_active` rows | 104 | 105 |
| `spec_binding_pending_pack_m02_3` rows | 181 | 180 |
| Total blockers | 314 | 313 |

Remaining blocker split after this pass:

| Pack/status | Count |
|---|---:|
| `spec_binding_pending_pack_m02_3` | 180 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |

## Conflict Closed

The §M.5 row described a phantom Appendix J `seller_activation_cohort` enum, while the live activation-metric contract uses Appendix J `seller_onboarding_invite_source`. §49.1.10 also carried stale partial invite-source lists. The row is now rebound to the six-value Appendix J `seller_onboarding_invite_source` contract, and §49.1.10 uses the same all-six cohort set as §48.8.10.

## Scope Boundary

This pass is limited to Master Spec and spec-lint evidence. Product analytics pipelines, PostHog dashboard runtime queries, and deploy validators remain owned by their separate runtime rows unless directly evidenced.

## Files

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/gates/seller_activation_cohort_canonical_enum.ts`
- `tools/spec-lint/fixtures/seller_activation_cohort_canonical_enum/pass.md`
- `tools/spec-lint/fixtures/seller_activation_cohort_canonical_enum/fail.md`
- `tools/spec-lint/run-all.ts`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
