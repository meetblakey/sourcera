### 4.8.1 AIOperation {#4.8.1-aioperation}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `actor_id` | UUID (FK) | Required | User, managed agent, system, or ops actor. |

### 4.8.5 ContestRecord {#4.8.5-contestrecord}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `filed_by_user_id` | UUID (FK) | Nullable for system | Filing user. |

### 4.8.8 CommittedSpendContract {#4.8.8-committedspendcontract}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `signed_by_user_id` | UUID (FK) | Nullable | Customer signer. |

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

**Pattern B — FK Preservation with In-Place User-Row Pseudonymization.**

- **Use-case examples.** §4.8.1 AIOperation.`submitter_user_id`.

| §4 entity | Pseudonymization pattern | Notes |
| :---- | :---- | :---- |
| §4.8.1 AIOperation (`submitter_user_id`) | Pattern B | UUID FK; preserve target. |
| §4.8.5 ContestRecord (`accepter_user_id`) | Pattern B | UUID FK; preserve target. |
| §4.8.8 CommittedSpendContract (`signed_by_user_id`) | Pattern B | UUID FK; preserve target. |

### 6.8.5 Audit-Integrity Exemption & Retention Override {#6.8.5-audit-integrity-exemption}

| # | Row Class | Retention Driver | Retention Window | Redaction Treatment |
| :---- | :---- | :---- | :---- | :---- |
| 3 | BillingLedgerEntry, AIOperation (§4.8.1), ContestRecord, CommittedSpendContract | Financial controls | 7 years | Pseudonymization treatment per §6.8.4.1 Pattern B on the User-row target of: AIOperation `submitter_user_id`; ContestRecord `accepter_user_id`; CommittedSpendContract `signed_by_user_id`; BillingLedgerEntry `actor_id` / `attributed_user_id`. |
