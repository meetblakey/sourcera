# Email Entity Contract Pass Fixture

### 4.9.1 EmailTemplate {#4.9.1-emailtemplate}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | |
| `org_id` | UUID | Nullable | |
| `console` | Enum | Required | |
| `template_key` | String | Required | |
| `email_kind` | Enum | Required | |
| `email_category` | Enum | Required | |
| `opt_out_class` | Enum | Required | |
| `loops_template_id` | String | Required | |
| `sender_address` | String | Required | |
| `reply_to_policy` | Enum | Required | |
| `status` | Enum | Required | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Required | |
| `updated_by` | UUID | Required | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.** Org-scoped.
**Required indexes.** `(template_key)`.
**Retention, DSAR, and residency.** Retention follows §40.2 EmailTemplate. DSAR follows §6.8.
**State Machine.**

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| (init) | `draft` | Create | Valid | |

### 4.9.2 EmailSend {#4.9.2-emailsend}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | Required | |
| `email_template_id` | UUID | Required | |
| `email_kind` | Enum | Required | |
| `email_category` | Enum | Required | |
| `opt_out_class` | Enum | Required | |
| `recipient_user_id` | UUID | Nullable | |
| `recipient_email_hash` | String | Required | |
| `status` | Enum | Required | |
| `failure_reason` | Enum | Nullable | |
| `provider_message_id` | String | Nullable | |
| `idempotency_key` | String | Required | |
| `data_residency_region` | Enum | Required | |
| `queued_at` | Timestamp | Required | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.** Org-scoped.
**Required indexes.** `(org_id, queued_at)`.
**Retention, DSAR, and residency.** Retention follows §40.2 EmailSend. DSAR follows §6.8.
**State Machine.**

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| (init) | `queued` | Queue | Valid | |

### 4.9.3 EmailEvent {#4.9.3-emailevent}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | Required | |
| `email_send_id` | UUID | Required | |
| `provider_event_id` | String | Required | |
| `provider_event_type` | String | Required | |
| `email_event_kind` | Enum | Required | |
| `event_received_at` | Timestamp | Required | |
| `raw_event_hash` | String | Required | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.** Child scoped.
**Required indexes.** `(provider_event_id)`.
**Retention, DSAR, and residency.** Retention follows §40.2 EmailEvent. DSAR follows §6.8.

### 4.9.4 SuppressionListEntry {#4.9.4-suppressionlistentry}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | |
| `org_id` | UUID | Nullable | |
| `console` | Enum | Nullable | |
| `subject_kind` | Enum | Required | |
| `subject_value_hash` | String | Required | |
| `reason_code` | Enum | Required | |
| `source` | Enum | Required | |
| `effective_at` | Timestamp | Required | |
| `expires_at` | Timestamp | Nullable | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.** Org or platform scoped.
**Required indexes.** `(subject_kind, subject_value_hash)`.
**Retention, DSAR, and residency.** Retention follows §40.2 SuppressionListEntry. DSAR follows §6.8.

### 4.9.5 UnsubscribePreference {#4.9.5-unsubscribepreference}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | Required | |
| `user_id` | UUID | Nullable | |
| `recipient_email_hash` | String | Required | |
| `email_category` | Enum | Required | |
| `opt_out_class` | Enum | Required | |
| `preference_state` | Enum | Required | |
| `source` | Enum | Required | |
| `effective_at` | Timestamp | Required | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.** Org-scoped.
**Required indexes.** `(org_id, recipient_email_hash)`.
**Retention, DSAR, and residency.** Retention follows §40.2 UnsubscribePreference. DSAR follows §6.8.
**State Machine.**

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| (init) | `opted_in` | Consent | Valid | |

| `email_domain_entity_contract_completeness` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/email_domain_entity_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
