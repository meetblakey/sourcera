# Fixture

### 4.8.1 AIOperation {#4.8.1-aioperation}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `settlement_state` | Enum | See Appendix J `ai_operation_settlement_state`: `pending`, `accepted`, `rejected`, `auto_accepted`, `contested`, `committed` | See state machine below |

### 4.8.5 ContestRecord {#4.8.5-contestrecord-org-scoped-billing-dispute-ledger}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `original_settlement_state` | Enum | `accepted` | Snapshot at file time |

### 32.8.13 POST /v1/orgs/{org_id}/contests/{contest_id}/withdraw — Withdraw ContestRecord {#32.8.13-post-contest-withdraw}

**Response (HTTP 200).** AIOperation `settlement_state` transitions from `contested` to `committed`; soft credit reversed.

**Atomicity.** AIOperation `status` transitions during withdraw.

### AI Operation Settlement State (§4.8.1)

`pending`, `accepted`, `rejected`, `auto_accepted`, `contested`, `committed`
