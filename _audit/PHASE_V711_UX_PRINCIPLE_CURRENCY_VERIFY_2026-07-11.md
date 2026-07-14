# v7.1.1 Principle 9 Currency / Linear Constraint Verification

**Date:** 2026-07-11  
**Scope:** D-3UX-001, D-3UX-002, D-3UX-013  
**Verdict:** PASS for the documentation contract; the release remains blocked by unrelated product-runtime evidence.

## Resolution

- §3.13 now resolves the First-30-Seconds Test to `UX_Design_of_Sourcera.md` §1.4.
- §3.13 states that Appendix M (§M.1) and the First-30-Seconds Test are landed and binding.
- `Linear Constraint` is canonical in Master Spec §3, §38, Appendix K, and the UX companion; `Sourcera Constraint` is removed from the active contract.
- `ux_principle_currency_canonicality` is registered as a `runtime_active` static documentation gate with passing and failing fixtures.

## Evidence

| Check | Result |
|---|---|
| Initial targeted assertion | FAIL as expected: stale §X, pre-landing prose, and `Sourcera Constraint` were present |
| Live gate | PASS |
| Positive fixture | PASS |
| Negative fixture | FAIL as expected (14 findings) |
| TypeScript | PASS |
| Full blocking spec-lint | PASS, 0 findings |
| Exact-status ledger scan | 0 open P0; 0 open P1; 0 blocked P1; 375 open P2; 133 open P3 |
| Stamp gate | FAIL: 168 unchanged runtime-evidence blockers |

## Stamp-Gate Posture

The final stamp-gate JSON is `_audit/_tmp/v711_stamp_gate_2026-07-11_phase30-final.json`. It reports 469 runtime rows, 299 `runtime_active`, and 168 blockers: 118 M11.3, 29 M21.3, 12 M02.3, and 9 M24.3. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/v711_runtime_stamp_gate_blockers.csv` were regenerated from that JSON.

No pending product-runtime row was promoted. UI behavior and product-runtime enforcement remain pack-owned.

## Commands

```zsh
npm --prefix tools/spec-lint run typecheck
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ux_principle_currency_canonicality.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ux_principle_currency_canonicality.ts --fixture tools/spec-lint/fixtures/ux_principle_currency_canonicality/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ux_principle_currency_canonicality.ts --fixture tools/spec-lint/fixtures/ux_principle_currency_canonicality/fail.md --no-emit
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_2026-07-11_phase30-final.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/v711_runtime_stamp_gate_blockers.csv --date 2026-07-11
```
