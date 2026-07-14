### 6.8.5 Audit-Integrity Exemption & Retention Override {#6.8.5-audit-integrity-exemption}

| # | Row Class | Retention Driver | Retention Window | Redaction Treatment |
| :---- | :---- | :---- | :---- | :---- |
| 9 | OutcomeContract (§4.8.4) — versioned snapshots | Contract-versioning provenance | Active version + 7 years; superseded versions retained until the youngest dependent AIOperation expires retention, then +7 years | `authored_by` pseudonymized at supersession + 90 days; active-version author attribution pseudonymizes on DSAR; contract terms retained verbatim |

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| **OutcomeContract (§4.8.4)** — V9 remediation | Active version + 7 years; superseded versions retained until the youngest dependent AIOperation expires retention, then +7 years, per §6.8.5 row 9. Versioned snapshots immutable. |
| **PricingTableVersion (§4.8.9)** | **Life-of-platform** for consumer-protection rate-card history. |
