# Phase 1.6 Console Bridge Re-drive Arbitration — Verification

**Date:** 2026-07-11  
**Defect:** D-1.6-008 (P2, remains open)  
**Authored Extension:** AE-V711-PH1.6-REDRIVE-01 (pending Engineering ratification; re-targeted to v7.1.2)

## Scope

The Master Spec now states the commit ordering for an Ops `dlq`/`failed` re-drive racing a strictly newer source Event. It defines the losing pre-apply path, the already-synced audit-history path, and the `last_applied_source_version` invariant.

## Static verification

- `§4.7.1` state machine includes `dlq`/`failed → superseded` when newer-source arbitration wins.
- `§4.7.1` defines both possible commit orders and prohibits lower-version overwrite or duplicate seller-visible effects.
- `§25.5.10.4` requires `console_bridge_event_redrive_supersede_race` for both commit orders.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` records the required ratification and evidence boundary.

## Runtime-evidence boundary

`console_bridge_event_redrive_supersede_race` is not present in this workspace. No test execution, runtime status promotion, or release closure is claimed. D-1.6-008 stays `open` pending Engineering ratification and implementation evidence; the AE is re-targeted to v7.1.2.

## Release posture

The v7.1.1 stamp gate remains blocked by its existing 168 runtime-evidence rows: 118 M11.3, 29 M21.3, 12 M02.3, and 9 M24.3. This body landing changes none of those counts.
