## 31.3 Integration Phase Export Mapping {#31.3-integration-phase-export-mapping}

Phase-13 Integration Export is a Buyer-console-only workflow, but this fixture omits the canceled terminal event and most cross-section registrations.

### 4.3.39 IntegrationExportRun {#4.3.39-integrationexportrun}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `running` | `completed` | All target writes succeed | Target refs stored | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `integration_export_contract_completeness` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint + api_contract_test | Contract missing runtime-active evidence. | M02.3 |
