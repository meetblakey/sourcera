### 4.8.14 SoloEnvelopeCounter (Org-Scoped, Per-Console, Engine-Internal) {#4.8.14-soloenvelopecounter-org-scoped-per-console-engine-internal}

**Authoring Intent.** SoloEnvelopeCounter exists.

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID (FK) | FK → Organization; required | Owning Org |
| `throttling_state` | Enum | `healthy`, `throttled`, `closed` | Incomplete |

**Indexes.** `(org_id)` only.

**Retention.** Org-life.

### 34.10.3 Solo Co-Resident Pool Rule

Solo uses one shared envelope.

## 44.6 Solo-Tier Surface Treatment {#44.6-solo-tier-surface-treatment}

Solo envelope throttling exists.

### Solo Envelope Counter Billing Mode (§4.8.14)

`solo_subscription`

### Solo Envelope Counter State (§4.8.14)

`healthy`, `throttled`, `closed`

**SoloEnvelopeCounter.** Engine-internal counter. State machine: `healthy → throttled → closed`.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `solo_envelope_counter_entity_present` | data_model_contract | spec_binding_pending_pack_m02_3 | pr_lint | Entity checked. | M02.3 |
