## 36.2 Organization Settings {#36.2-organization-settings}

| Setting Page | Fields | Access | Behavior |
| :---- | :---- | :---- | :---- |
| **Audit Logs** | Query all audit events (Enterprise: 7 years, Business: 1 year, Free: 30 days), export as CSV/JSON. | Org Owner, Org Admin | Real-time logs. |

#### M.5.44 v7.2.0-REM Phase 3.4 Audit Log Settings P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `settings_audit_log_retention_no_inline_restatement` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Weak audit-log settings check. | M02.3 |
