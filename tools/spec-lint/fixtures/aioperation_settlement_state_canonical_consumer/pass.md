# Fixture

### 4.8.1 AIOperation {#4.8.1-aioperation}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `settlement_state` | Enum | See Appendix J `ai_operation_settlement_state`: `pending`, `accepted`, `rejected`, `auto_accepted`, `contested`, `reversed` | See state machine below |

### 4.8.5 ContestRecord {#4.8.5-contestrecord-org-scoped-billing-dispute-ledger}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `original_settlement_state` | Enum | `accepted`, `auto_accepted` | Snapshot at file time; restored if contest rejected |

| From | To | Trigger | Notes |
|---|---|---|---|
| `open` | `withdrawn` | Customer withdraws | AIOperation restores to `original_settlement_state`; soft credit reversed |

4. Rejection MUST atomically restore the AIOperation to `original_settlement_state` and reverse the soft credit.

### 32.8.13 POST /v1/orgs/{org_id}/contests/{contest_id}/withdraw — Withdraw ContestRecord {#32.8.13-post-contest-withdraw}

**Response (HTTP 200).** Full ContestRecord envelope with `status=withdrawn`; AIOperation `settlement_state` transitions from `contested` back to ContestRecord.`original_settlement_state` (`accepted` or `auto_accepted`); soft credit reversed atomically.

**Atomicity.** Withdraw, AIOperation `settlement_state` restoration (`contested → ContestRecord.original_settlement_state`), soft-credit reversal, audit row, and webhook emission occur in a single transaction.

### AI Operation Settlement State (§4.8.1)

`pending`, `accepted`, `rejected`, `auto_accepted`, `contested`, `reversed`
