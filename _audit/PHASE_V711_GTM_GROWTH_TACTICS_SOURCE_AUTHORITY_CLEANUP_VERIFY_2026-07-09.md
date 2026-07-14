# Phase v7.1.1 GTM Growth Tactics Source-Authority Cleanup Verification

**Date:** 2026-07-09

## Scope

Cleaned stale source references in `GTM/GTM_GROWTH_TACTICS.md`.

## Gap Surfaced

The Growth Tactics inventory still routed growth-experiment executors through old Master Spec §6 anchors and Summary C.* anchors for Template Library, notification preferences, Workspace Owner, Time-Saved Baseline, Selection Report public attribution, template lineage, Heat Map, and M16 referral controls. Its Authored Extension routing also pointed new mechanics at stale §13.3 instead of the current growth-mechanic authority in §48 plus the AE ledger.

## Resolution

- Expanded the source-authority header to current Master Spec sections §4.3.16, §4.4.16, §4.4.28, §5, §10.12, §19, §20, §27, §34, §41, §48, §49, and §51.6.
- Rebound notification / Loops.so references to §20.6 / §41.
- Rebound Selection Report, Workspace Owner, and Time-Saved Baseline references to §10.12 / §48.5, §5 / §10, and §51.6.
- Rebound Template Library / template lineage references to §19 / §4.4.28 / §48.2.10.
- Rebound Heat Map and M16 referral controls to §4.4.16 / §48.6 and §4.3.16 / §48.7.3 / §51.0.3.
- Rebound net-new growth mechanics to Master Spec §48 plus `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- No product behavior changed.

## Backups

- `legacy-import:_versions/GTM_GROWTH_TACTICS.pre-source-authority-cleanup-2026-07-09.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX.pre-gtm-growth-tactics-source-authority-cleanup-2026-07-09.md`
- `legacy-import:_versions/RECONCILIATION.pre-gtm-growth-tactics-source-authority-cleanup-2026-07-09.md`

## Verification

Commands:

```bash
rg -n "§6\\.(10|11|22|36|37)|C\\.(37|38|71|74)|Sourcera_Master_Spec\\.md §13\\.3|Appendix A state-machine|Appendix D|§C\\.74" GTM/GTM_GROWTH_TACTICS.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md
npm --prefix tools/spec-lint run typecheck
npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json
```

Results:

- Stale Growth Tactics source-reference scan: 0 matches.
- Full spec-lint: PASS, 0 blocking findings.
- Typecheck: PASS.
- Exact-status right-edge scan: 0 open P0, 0 open P1, 0 blocked P1, 595 open P2, 191 open P3.
- Stamp gate: FAIL on the same 147 runtime-evidence blockers after parsing 426 runtime rows with 277 `runtime_active` rows.

## Boundary

This was GTM source-reference hygiene only. It does not promote any §M.5 runtime row and does not claim product-code evidence, deploy validators, integration tests, dashboard consumers, billing runtime, marketplace runtime, or production execution.
