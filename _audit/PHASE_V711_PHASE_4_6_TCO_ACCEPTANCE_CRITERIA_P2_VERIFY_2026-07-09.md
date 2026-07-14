# Phase 4.6 TCO Acceptance-Criteria P2 Closure Verify — 2026-07-09

**Scope.** Closed D-4.6-015, D-4.6-016, D-4.6-018, D-4.6-019, D-4.6-020, D-4.6-022, D-4.6-028, and D-4.6-030.

**Backups.**
- `_versions/Sourcera_Master_Spec.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/DEFECT_LEDGER.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/REMEDIATION_BACKLOG.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/V711_BACKLOG_INDEX.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/RECONCILIATION.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/AUTHORED_EXTENSIONS_LEDGER.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/AGENTS.pre-phase-46-tco-ac-p2-2026-07-09.md`
- `_versions/CLAUDE.pre-phase-46-tco-ac-p2-2026-07-09.md`

## Closure Summary

**Master Spec.** §15 now binds missing required pricing responses to "Pricing pending" exclusion from rank, percentile, and blended-score denominators; defines competition ranking for tied totals; replaces the undefined cumulative-seat average with a deterministic seat-year denominator; rejects tier overflow and unsupported currencies with Appendix I codes; renders N=0 / N=1 / N>=2 TCO Breakdown states; binds `pricing_confidential` export redaction; and converts §15.7 to numbered acceptance criteria. §32.5.2 now makes pending breakdown rows explicit with nullable rank / percentile / totals.

**Audit records.** `_audit/DEFECT_LEDGER.md` marks all eight scoped rows `remediated 2026-07-09`; `_audit/REMEDIATION_BACKLOG.md` drops `BL-P2-PH46-AC` to 0; `_audit/V711_BACKLOG_INDEX.md`, `_integration/RECONCILIATION.md`, and `_integration/AUTHORED_EXTENSIONS_LEDGER.md` record the closure and AE-V711-PH46-TCO-AC-P2-01.

**Boundary.** No pricing number, plan tier, AI metering rule, Buyer/Seller console firewall, or §M.5 runtime status changed. Adjacent Phase 4.6 rows D-4.6-017, D-4.6-021, D-4.6-023, D-4.6-024, D-4.6-025, D-4.6-026, D-4.6-027, and D-4.6-029 remain open.

## Counts

Exact-status right-edge scan:

```json
{
  "counts": {
    "P0": 0,
    "P1": 0,
    "P2": 575,
    "P3": 191
  },
  "blockedP1": 0,
  "target": [
    "D-4.6-015 | remediated 2026-07-09",
    "D-4.6-016 | remediated 2026-07-09",
    "D-4.6-018 | remediated 2026-07-09",
    "D-4.6-019 | remediated 2026-07-09",
    "D-4.6-020 | remediated 2026-07-09",
    "D-4.6-022 | remediated 2026-07-09",
    "D-4.6-028 | remediated 2026-07-09",
    "D-4.6-030 | remediated 2026-07-09"
  ]
}
```

P2 `acceptance_criteria` open count moved from 89 to 81.

## Verification Commands

```bash
npm --prefix tools/spec-lint run typecheck
```

Result: PASS.

```bash
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md
```

Result: PASS. `blocking gates worst exit code: 0`.

```bash
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_after_phase_4_6_tco_acceptance_criteria.json
cp _audit/_tmp/v711_stamp_gate_after_phase_4_6_tco_acceptance_criteria.json _audit/_tmp/v711_stamp_gate_latest.json
```

Stamp summary:

```json
{
  "runtime_rows": 426,
  "runtime_active": 278,
  "spec_binding_pending_pack_m02_3": 13,
  "spec_binding_pending_pack_m11_3": 102,
  "spec_binding_pending_pack_m21_3": 26,
  "spec_binding_pending_pack_m24_3": 5,
  "spec_binding_release_gate_only": 2,
  "blocker_count": 146
}
```

The stamp gate remains open on unrelated runtime-evidence blockers.
