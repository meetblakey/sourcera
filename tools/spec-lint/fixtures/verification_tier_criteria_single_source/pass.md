### 4.4.21 VerificationReviewRecord

Verification tiers are **earned, not purchased**.

**Tier definitions** (per Appendix J `seller_verification_tier`):

- `basic`
- `verified`
- `certified`

Thresholds are in §34.16.2.A. Re-review uses Verification certified re-review cadence.

## 26.2 Verification Tiers

Verification tiers are earned trust badges, not paid placements. §4.4.21 is the canonical source. §34.16.2 owns Marketplace Discovery pricing and the earned-free policy. §27.4.3 treats `verification_tier_ordinal` as one learned ranking feature; no section may promise a deterministic visibility boost.

| Tier | Criteria authority | Badge Display | Approval Workflow |
|---|---|---|---|
| Basic | §4.4.21 `basic` definition | | |
| Verified | §4.4.21 `verified` definition; thresholds in §34.16.2.A | | |
| Certified | §4.4.21 `certified` definition; thresholds in §34.16.2.A | | |

### 27.4 Marketplace Match Score

The model can consume verification_tier_ordinal.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `verification_tier_criteria_single_source` | enum_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/verification_tier_criteria_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
