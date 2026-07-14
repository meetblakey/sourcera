# v7.1.1 L1 Invite-Throttle Singleton Verification

**Date:** 2026-07-11  
**Defect:** D-13V-012 (P2 numerical singleton)  
**Verdict:** Closed; Buyer Solo mirror awaits v7.1.2 ratification.

## Conflict and Resolution

§48.2.2 defined tiered L1 caps, while §48.5 M5 incorrectly described the 20-cap as universal. §34.1.1 now owns the complete schedule. L1, M5, and Appendix K cite that row; no consumer repeats its per-user cap.

Buyer Solo now mirrors Buyer Free for this anti-abuse limit. That previously unstated Solo value is recorded as AE-V13-009 and re-targeted to v7.1.2 for Product and Engineering ratification. No runtime throttle implementation or stamp eligibility is claimed.

## Verification

| Check | Result |
|---|---|
| `growth_mechanic_rate_limit_coverage` before repair | FAIL: 12 singleton and citation findings |
| `growth_mechanic_rate_limit_coverage` after repair | PASS |
| Inline L1/M5 20-user/30d scan outside §34.1.1 | PASS: no matches |
| Exact-status canonical scan | 0 open P0; 0 open P1; 0 blocked P1; 385 open P2; 135 open P3 |

The stamp gate remains blocked by the same 168 product-runtime evidence rows.
