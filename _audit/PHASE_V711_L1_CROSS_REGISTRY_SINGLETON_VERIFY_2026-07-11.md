# v7.1.1 L1 Cross-Registry Singleton Verification

**Date:** 2026-07-11  
**Defect:** D-13V-014 (P2 numerical singleton)  
**Verdict:** Closed for documentation; release remains blocked.

## Resolution

The existing L1 values now have one home each:

| Contract | Canonical home |
|---|---|
| Attribution duration | §40.2 row **GrowthLoopExecution — attribution-window expiry** |
| PostHog funnel query budget | §44.1 row **PostHog Insights funnel query performance** |
| SIM attribution-rate and invite-velocity thresholds | §48.4.10 **L1 SIM threshold registry** |

§48.2.2, §48.2.12, M5, Appendix G, and Appendix K now cite those homes. No duration, performance target, or SIM threshold changed. No Authored Extension is required.

`l1_cross_registry_numeric_singleton` is wired through the blocking M02.3 spec-lint batch. It checks the three canonical homes, rejects L1 inline restatements, and has passing and failing fixtures.

## Verification

| Check | Result |
|---|---|
| New gate before Master Spec repair | FAIL: 26 missing-registry or inline-restatement findings |
| Positive fixture | PASS |
| Negative fixture | FAIL: 17 expected findings |
| New gate on live Master Spec | PASS: 0 findings |
| TypeScript | PASS |
| Full blocking spec-lint | PASS: 0 findings |
| Exact-status right-edge scan | 0 open P0; 0 open P1; 0 blocked P1; 382 open P2; 135 open P3 |
| Stamp gate | FAIL: 465 rows; 295 `runtime_active`; 168 runtime-evidence blockers |

The 168 blockers are unchanged: 118 M11.3, 29 M21.3, 12 M02.3, and 9 M24.3. This static documentation gate is not product-runtime evidence.
