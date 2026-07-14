# Fixture

### 4.3.11 Internal Comment Thread

**Indexes:**

- `(workspace_id, status)` — listing.

### 4.3.16 Buyer Referral

**Indexes:**

- `(referrer_org_id, status)` — dashboard.

### 4.3.17 Buyer-Funded Pro Trial Seat Grant

**Indexes:**

- `(vendor_org_id, created_at DESC)` — vendor history.

### 4.3.19 Time-Saved Credit

**Indexes:**

- `(org_id, recognized_at DESC)` — dashboard.

#### M.5.61 v7.2.0-REM Phase DEC Decision-Divergence P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `phase1_required_index_completeness` | data_model_contract | spec_binding_pending_pack_m02_3 | pr_lint | Required indexes exist somewhere. | M02.3 |
