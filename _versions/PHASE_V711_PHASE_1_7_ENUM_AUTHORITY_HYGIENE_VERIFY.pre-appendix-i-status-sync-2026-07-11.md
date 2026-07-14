# Phase 1.7 Authority, Billing, and State-Machine Hygiene — Verification

**Date:** 2026-07-11  
**Closed defects:** D-1.7-006, D-1.7-007, D-1.7-008, D-1.7-010, D-1.7-011, D-1.7-012, D-1.7-013, D-1.7-018

## Scope

- `ContestRecord.console` now cites its dedicated Appendix J registry; `system` remains an auto-file marker, not an AIOperation console.
- AIOperation and CapabilityRegistryEntry now share the Appendix J `ai_operation_external_provider` registry.
- AIOperation auto-accept snapshots now carry the same active-OutcomeContract range and exact-copy rule.
- AIWallet AC #11 now covers the existing $50–$500K self-serve monthly ceiling and the existing §4.8.3.B $2M Enterprise Ops override ceiling.
- AIOperation now preserves `effective_charge_cents` during `contested`; its separate wallet soft credit is explicit in the field, transition, and acceptance contracts.
- Appendix L L.21 indexes all twelve §4.8 lifecycle enums to their canonical inline state machines.
- The Managed Agent parent-operation note now makes the child direction explicit.
- §34.20.4 AC #56 now defers only the per-Org SellerOutcomeSignalConfig override. §4.8.13 remains the authoritative platform-scoped entity.

## Verification

- Appendix J contains the two new current-value registries.
- All three canonical defect rows are `remediated 2026-07-11`.
- No API, plan, billing value, provider set, firewall projection, runtime status, or Authored Extension changed.

## Current posture

Exact-status scan: 0 open P0, 0 open P1, 0 blocked P1, 416 open P2, 146 open P3. The stamp gate remains blocked on the same 168 product-runtime evidence rows.
