# Fixture

### 4.3.11 Internal Comment Thread

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `subscribed_user_ids` | Array[UUID] | FKs -> User | Auto-subscribe list |

**Indexes:**

- `GIN (subscribed_user_ids)` — "my subscribed threads" fan-out queries without scanning all Workspace threads.

### 4.3.16 Buyer Referral

**Indexes:**

- `(referee_email, status)` — lowercased-email referee exclusivity lookup at signup and credit issuance.

**Referee Exclusivity Rule:** Multiple Buyer Referral rows may coexist in `pending` for the same lowercased `referee_email`, but only the first one wins.

### 4.3.17 Buyer-Funded Pro Trial Seat Grant

**Indexes:**

- `(buyer_org_id, vendor_org_id, created_at DESC)` — buyer/vendor 365-day rule after vendor Org binding and historical audit lookup.

**Failure Modes Addressed:**

- **Same buyer/vendor within 365 days.** `same_buyer_365d_block_triggered = true`.

### 4.3.19 Time-Saved Credit

**Indexes:**

- `(org_id, recognized_at DESC) WHERE reversed_by_credit_id IS NULL` — reversal-aware aggregate SUM queries.

**Aggregation Semantics (Reversal-Aware):** SUM across Time-Saved Credit rows where `reversed_by_credit_id IS NULL`.

**Acceptance Criteria:**
1. Reversal rows MUST set `reversal_of_credit_id`.

#### M.5.61 v7.2.0-REM Phase DEC Decision-Divergence P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `phase1_required_index_completeness` | data_model_contract | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/phase1_required_index_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | InternalCommentThread, BuyerReferral, ProTrialSeatGrant, and TimeSavedCredit MUST include the D-DEC-002 required indexes: subscribed-thread GIN, referee-email exclusivity, buyer/vendor 365-day lookup, and reversal-aware Time-Saved aggregate filter. | M02.3 |
