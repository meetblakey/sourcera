# v7.1.1 M16 Surface-Mapping Verification

**Date:** 2026-07-11  
**Defect:** D-13V-005 (P2 surface-engine mapping)  
**Verdict:** Closed.

## Resolution

Appendix M.1 now includes the M16 Referral Link Landing Page. The row maps the pre-existing §48.7.3 referral-attributed signup page, referrer-anonymity rendering, public entry visibility, governing §4.3.16 / §48.7.3 sources, and §37.1 conformance posture.

## Verification

| Check | Result |
|---|---|
| Required M16 mapping tokens absent before edit | FAIL, as expected |
| Required M16 mapping tokens after edit | PASS |
| `appendix_m_conformance_posture_completeness` | PASS |

No workflow, entitlement, data exposure, runtime status, or Authored Extension changed.
