# v7.1.1 M16 Credit-Expiry Singleton Verification

**Date:** 2026-07-11  
**Defect:** D-13V-007 (P2 numerical singleton)  
**Verdict:** Documentation contract closed; no runtime promotion.

## Resolution

§40.2 now owns the Buyer Referral issued-credit expiry: 365 days after `credit_issued_at`. §4.3.16, §48.7.3 step 9 and acceptance criterion 6, and Appendix L.2 consume the authority by citation. The duration no longer has competing full-form or shorthand copies.

## Regression Coverage

`retention_singleton_section_40_2_canonical` is v1.2.0. It now catches a BuyerReferral `credit_expires_at` duration outside §40.2, including the `365d` shorthand. It leaves unrelated legacy shorthand outside this targeted contract unchanged.

| Check | Result |
|---|---|
| Master Spec before repair | FAIL: un-cited full-form and shorthand M16 copies found |
| Master Spec after repair | PASS |
| Existing pass fixture | PASS |
| New un-cited BuyerReferral expiry fixture | FAIL, as expected |

## Scope

No credit value, retention duration, billing behavior, state transition, Authored Extension, or §M.5 runtime status changed. The change only makes the pre-existing duration single-sourced and enforceable.
