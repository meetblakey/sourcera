# v7.1.1 V6 Amendment-Broadcast Firewall Status Synchronization — 2026-07-11

## Finding

D-V6-004 remained canonically open although its filed full-array exposure is absent from the current source.

## Current Proof

- Master Spec §4.7.1 Field-Level Redaction Rules carries only `affected_requirement_ids_visible_to_seller = intersect(amendment.affected_requirement_ids, this_bid_response.requirement_ids)` for `amendment_broadcast`.
- The same row marks the full buyer-side `affected_requirement_ids[]` array NEVER CARRIED.
- §4.7.1 defense-in-depth projection requires every seller-visible array to be buyer-side-only or per-recipient projected; `console_bridge_seller_projection_no_cardinality_leak` is current and full spec-lint passes.
- `_audit/REMEDIATION_BACKLOG.md §6.6` already classifies D-V6-004 as remediated in the Phase 6 firewall composite.

## Resolution

D-V6-004 is remediated as a stale-open canonical-status correction. No source behavior, runtime claim, new enum, endpoint, or Authored Extension is added. The documented serializer, projection, and deploy/runtime proof remain current stamp-gate work.

## Verification

```bash
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```
