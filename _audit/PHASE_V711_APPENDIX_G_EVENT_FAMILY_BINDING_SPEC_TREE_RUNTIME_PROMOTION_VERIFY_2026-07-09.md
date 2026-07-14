# v7.1.1 Appendix G Event-Family Binding Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** `appendix_g_event_family_binding_exhaustive`
**Outcome:** Promoted to `runtime_active` for spec-tree proof only.

## Gap Closed

Appendix J `event_family` and the Appendix G Event-Family Binding Matrix used the current 11-family registry, but §51.1.1 and §51.1.5 still carried stale aliases: `workspace_core`, `vendor_core`, `marketplace_core`, `kb_core`, `bid_core`, `billing_core`, `onboarding_core`, `plg_growth_loops`, `anti_abuse_core`, and `ops_domain`.

## Edits

| File | Change |
|---|---|
| `Sourcera_Master_Spec.md` | Normalized §51 family references to the Appendix J / Appendix G closed set and promoted the §M.5.64 row with a spec-tree-only boundary. |
| `tools/spec-lint/gates/appendix_g_event_family_binding_exhaustive.ts` | Added detector. |
| `tools/spec-lint/fixtures/appendix_g_event_family_binding_exhaustive/pass.md` | Added positive fixture. |
| `tools/spec-lint/fixtures/appendix_g_event_family_binding_exhaustive/fail.md` | Added negative fixture. |
| `tools/spec-lint/gates/kb_citation_in_closed_bid_attributed_registered.ts` / fixture | Updated the existing KB citation proof from stale `kb_core` to current `seller_kb`. |
| `tools/spec-lint/run-all.ts` | Wired detector into runtime-active batch. |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Added AE-V72REM-PH9P91-APPENDIX-G-RESIDUAL-P1-01 runtime-promotion addendum. |
| `_integration/RECONCILIATION.md` | Added promotion + boundary entry. |
| `_audit/V711_BACKLOG_INDEX.md` | Added current execution-surface entry. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md` / `.csv` | Refreshed from latest stamp-gate JSON. |

## Verification

| Command | Result |
|---|---|
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/appendix_g_event_family_binding_exhaustive.ts -- --spec tools/spec-lint/fixtures/appendix_g_event_family_binding_exhaustive/pass.md --no-emit` | PASS, 0 findings. |
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/appendix_g_event_family_binding_exhaustive.ts -- --spec tools/spec-lint/fixtures/appendix_g_event_family_binding_exhaustive/fail.md --no-emit` | FAIL as expected, 43 findings. |
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/appendix_g_event_family_binding_exhaustive.ts -- --no-emit` | PASS, 0 findings. |
| `npm --prefix tools/spec-lint run typecheck` | PASS. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | PASS, 0 blocking findings. |
| `npm --prefix tools/spec-lint exec tsx tools/release/stamp_gate.ts -- --json > _audit/_tmp/v711_stamp_gate_after_appendix_g_event_family_binding.json` | FAIL overall on unrelated blockers; promoted gate absent from findings. |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Total blockers | 163 | 162 |
| `runtime_active` rows | 255 | 256 |
| `spec_binding_pending_pack_m02_3` rows | 30 | 29 |
| `spec_binding_pending_pack_m11_3` rows | 102 | 102 |
| `spec_binding_pending_pack_m21_3` rows | 26 | 26 |
| `spec_binding_pending_pack_m24_3` rows | 5 | 5 |

## Boundary

This pass proves only Appendix J `event_family` registry parity, §51.1.1 family-table parity, §51.1.5 current-family usage, Appendix G binding-matrix coverage, stale family-alias rejection, duplicate-family rejection, and unknown-family rejection. It does not prove product PostHog emission, active dashboard consumer behavior, runtime legacy-alias retirement, retention job execution, deploy validators, integration tests, or production runtime correctness.
