## 36.2 Organization Settings {#36.2-organization-settings}

| Setting Page | Fields | Access | Behavior |
| :---- | :---- | :---- | :---- |
| **Audit Logs** | Query all audit events per UI retention in §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)** (D-3.4-006 V3 - inline restatement retired); financial-record audit retention follows §40.2 without plan-tier restatement. Export as CSV/JSON. | Org Owner, Org Admin | Real-time logs. |

#### M.5.44 v7.2.0-REM Phase 3.4 Audit Log Settings P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `settings_audit_log_retention_no_inline_restatement` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/settings_audit_log_retention_no_inline_restatement.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §36.2 Audit Logs MUST cite §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)** and §40.2 for financial-record retention; it MUST NOT restate plan-tier retention values inline and MUST NOT use retired plan names such as `Business`. | M02.3 |
