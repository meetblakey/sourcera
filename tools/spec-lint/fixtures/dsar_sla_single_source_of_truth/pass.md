## 6.8 Data Privacy & GDPR Compliance {#6.8-data-privacy-and-gdpr-compliance}

### 6.8.4 DSAR Cascade Across Linked Entities {#6.8.4-dsar-cascade-across-linked-entities}

**Performance budget.** Cascade execution MUST complete within the §6.8.6 fulfillment window per GDPR Art. 12 §3.

### 6.8.6 DSAR Operational SLA (Authoritative) {#6.8.6-dsar-operational-sla}

| Phase of DSAR Fulfillment | SLA / Window | Source of Authority |
| :---- | :---- | :---- |
| Subject-request receipt (`received_at`) → fulfillment (export OR confirmation of erasure path) | **\< 30 calendar days** unless a valid extension is granted | GDPR Art. 12(3); §33.4 |

**Acceptance criteria.**

1. Every §6.8 / §33.4 mention of the 30-day window MUST cite this table by §6.8.6 reference; new inline duplications fail CI gate `dsar_sla_single_source_of_truth`.

### 6.8.6.1 Subject Verification Protocol {#6.8.6.1-subject-verification-protocol}

Subject submits >= 5 DSARRequests of the same `request_kind` against the same Org within 30 calendar days.

## 33.4 Data Subject Access Request (DSAR) {#33.4-data-subject-access-request-(dsar)}

**GDPR / DSAR fulfillment SLA:** §6.8.6 is authoritative. §33.4 does not restate the response window.

## 33.9 Acceptance Criteria {#33.9-acceptance-criteria}

- DSAR responses generated within the §6.8.6 fulfillment window.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| GDPR DSAR processing SLA | **Processing-time SLA only:** statutory DSAR fulfillment follows the §6.8.6 receipt-based window from `received_at` / `statutory_deadline_at`; `verified_at` starts the operational worker clock only and cannot extend the statutory deadline. |
| Usage Event — DSAR | `user_id` redacted within the §6.8.6 fulfillment window. |
