### 4.3.8 Evaluation Scenario (Console-Scoped, Buyer) {#4.3.8-evaluation-scenario-console-scoped-buyer}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `org_id` | UUID | FK | |
| `workspace_id` | UUID | FK | |
| `console` | Enum | `buyer` (fixed) | |
| `name` | String | 1–200 chars | |
| `description` | String | 0–2000 chars | |
| `parameters` | JSONB | Schema per §4.3.8.1 | |
| `results` | JSONB | Schema per §4.3.8.2 | |
| `version` | Integer | ≥ 1 | |
| `is_locked` | Boolean | Default `false` | |
| `locked_at` | Timestamp | Nullable | |
| `created_at` | Timestamp | Immutable | |
| `updated_at` | Timestamp | Auto-updated | |
| `created_by` | UUID (FK) | User ID | |
| `updated_by` | UUID (FK) | User ID | |
| `deleted_at` | Timestamp | Nullable | |

**Scope Isolation.**
**Required Indexes.**
**Retention.**
**DSAR Behavior.**
**Data Residency.**
**Acceptance Criteria:**

#### 4.3.8.1 Scenario Parameters JSON Schema (V4 canonical) {#4.3.8.1-scenario-parameters-json-schema}

#### 4.3.8.2 Scenario Results JSON Schema (V4 canonical)

### 4.3.9 Evaluation Scenario Parameters (Retired in V4) {#4.3.9-evaluation-scenario-parameters-retired-in-v4}

No create, read, update, delete, API, UI, CI, webhook, or migration path may treat §4.3.9 as a live entity or schema.

### 14.2.1 Scenario Object Schema

§14.2.1 forwards to those anchors and does not re-author the schema inline. §4.3.8 is canonical.

| `scenario_modeling_entity_contract_resolution` | data_model_contract | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/scenario_modeling_entity_contract_resolution.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
