# Phase 38 Device-Posture Verification — 2026-07-11

## Scope

D-38-015 and D-38-018. Source authority and plan classification, safe-area handling, Stage Manager resize settling, width-only foldable behavior, sub-320 reflow, constrained-data mode, analytics, and extension disposition.

## Conflict Resolution

- D-38-015: device and Ops-role controls are not plan entitlements. §5.11.4 now makes that boundary explicit; §34.1 remains the Solo authority.
- D-38-018: the filed request to suspend mobile fanout reductions conflicted with §38.6.2's cellular-bandwidth purpose. Constrained mode retains smaller fanout and cache behavior. Browser code may use only explicit user preference or `navigator.connection.saveData`; it must not infer OS power, carrier, hinge, or device identity.

## Evidence

- Master Spec: §3.11.1, §4.2.15, §5.11.4, §38.6.3, §38.6.4.1, §38.6.5, §38.6.6, Appendix G, Appendix J, and Appendix M.1.
- Extension ledger: `AE-V711-PH38-DEVICE-POSTURE-01`, pending human sign-off.
- Guard update: `responsive_design_appendix_m_surface_coverage` plus its pass fixture; its fail fixture rejects the missing responsive mapping.

## Commands and Results

```sh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/responsive_design_appendix_m_surface_coverage.ts --spec tools/spec-lint/fixtures/responsive_design_appendix_m_surface_coverage/pass.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/responsive_design_appendix_m_surface_coverage.ts --spec tools/spec-lint/fixtures/responsive_design_appendix_m_surface_coverage/fail.md
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/phase38_device_posture_stamp_gate_2026-07-11.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-11
```

- TypeScript: PASS.
- Full blocking spec-lint: PASS.
- Focused guard: live source and pass fixture PASS; fail fixture rejects as expected.
- Exact status: 0 open P0, 0 open P1, 0 blocked P1, 279 open P2, 98 open P3.
- Stamp gate: expected FAIL; 497 runtime rows, 326 `runtime_active`, 182 blockers — 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 13 pending human-ratification rows.
- Runtime inventory: regenerated with 182 blocker rows.

## Runtime Boundary

This is a documentation-contract closure only. Preference migration and self-edit write path, safe-area renderer, `saveData` adapter, cache/pagination/retry behavior, active-console event emission, DSAR/serializer enforcement, localization delivery, and browser/device E2E evidence remain external runtime work. The stamp gate remains correctly blocked.
