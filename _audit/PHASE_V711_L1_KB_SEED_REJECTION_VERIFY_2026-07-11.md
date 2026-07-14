# v7.1.1 L1 KB-Seed Rejection Verification

**Date:** 2026-07-11  
**Defect:** D-13V-018  
**Verdict:** Documentation contract closed; product-runtime proof remains external.

## Gap

L1 specified only the accepted `kb_bootstrap` outcome. A rejection caused by the existing §21.4.5 approval floor had no terminal L1 state, event, success-metric rule, or retry-safe write contract.

## Resolution

- §48.2.2 AC #9: terminal `decayed / quality_floor_failed`, one idempotent `growth_loop_l1_kb_seed_failed` event, null outcome value, and explicit non-success treatment.
- §48.2.12: L1 lifecycle consumes that event as a loop-specific decay condition.
- §51.1.5 and Appendix G: register the event and its correlation payload.
- §22.10.3 remains authoritative for re-bootstrap and discretionary allowance re-credit.
- AE-V13-010 records the newly authored behavior and re-targets ratification to v7.1.2.

## Boundary

`l1_kb_seed_rejection_contract` is a static documentation-consistency gate. It does not prove callback/outbox execution, PostHog delivery, audit-job execution, integration behavior, or deployment validation. Those remain required product-pack evidence.

## Verification

```zsh
npm --prefix tools/spec-lint run typecheck
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_kb_seed_rejection_contract.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_kb_seed_rejection_contract.ts --fixture tools/spec-lint/fixtures/l1_kb_seed_rejection_contract/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_kb_seed_rejection_contract.ts --fixture tools/spec-lint/fixtures/l1_kb_seed_rejection_contract/fail.md --no-emit
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

The live detector passed; the positive fixture passed; the negative fixture failed with 17 expected findings; typecheck and full blocking spec-lint passed. The stamp gate still failed on 168 product-runtime blockers.
