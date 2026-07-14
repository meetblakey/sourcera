# Email Retention DSAR Pass Fixture

### 4.9.1 EmailTemplate {#4.9.1-emailtemplate}

**Retention, DSAR, and residency.** Retention follows §40.2 EmailTemplate. DSAR follows §6.8.

### 4.9.2 EmailSend {#4.9.2-emailsend}

**Retention, DSAR, and residency.** Retention follows §40.2 EmailSend. DSAR follows §6.8.

### 4.9.3 EmailEvent {#4.9.3-emailevent}

**Retention, DSAR, and residency.** Retention follows §40.2 EmailEvent. DSAR follows §6.8.

### 4.9.4 SuppressionListEntry {#4.9.4-suppressionlistentry}

**Retention, DSAR, and residency.** Retention follows §40.2 SuppressionListEntry. DSAR follows §6.8.

### 4.9.5 UnsubscribePreference {#4.9.5-unsubscribepreference}

**Retention, DSAR, and residency.** Retention follows §40.2 UnsubscribePreference. DSAR follows §6.8.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Entity | Rule |
| :---- | :---- |
| EmailTemplate (§4.9.1 / §41) | Retain. |
| EmailSend (§4.9.2 / §41) | Retain. |
| EmailEvent (§4.9.3 / §41) | Retain. |
| SuppressionListEntry (§4.9.4 / §48.4.8) | Retain. |
| UnsubscribePreference (§4.9.5 / §41) | Retain. |

### 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}

| Section | Entity | Class | Pattern | Notes |
| :---- | :---- | :---- | :---- | :---- |
| §4.9.1 | EmailTemplate | 1 | Pattern B | |
| §4.9.2 | EmailSend | 4 + 16 | Pattern B | |
| §4.9.3 | EmailEvent | 4 + 16 | Pattern B | |
| §4.9.4 | SuppressionListEntry | 16 | Pattern B | |
| §4.9.5 | UnsubscribePreference | 16 | Pattern B | |

### 6.8.4.8 Email-Domain DSAR and Suppression Preservation {#6.8.4.8-email-domain-dsar-and-suppression-preservation}

| Email-domain row | DSAR treatment | Retained evidence |
| :---- | :---- | :---- |
| EmailTemplate | Pseudonymize | Retain |
| EmailSend | Cancel pending EmailSend rows | email_send_canceled_dsar |
| EmailEvent | Purge telemetry | Compact |
| SuppressionListEntry | Retain hash | row 16 |
| UnsubscribePreference | Retain preference | email suppression and unsubscribe records |

### 6.8.5 Audit-Integrity Exemption {#6.8.5-audit-integrity-exemption}

| # | Row Class | Retention Driver | Retention Window | Redaction Treatment |
| :---- | :---- | :---- | :---- | :---- |
| 16 | Email suppression, unsubscribe, complaint, hard-bounce, and legal/abuse suppression rows (§4.9.4 / §4.9.5) | Compliance | Active | Hashed subject value, reason code, source, and timestamps retained only to continue honoring suppression. |

| `email_retention_dsar_binding` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/email_retention_dsar_binding.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
