# Fixture

## 48.1 Buyer activation {#48.1-buyer-activation}

Buyer evaluation start/completion labels are derived exactly as Appendix G specifies: activated `workspace_created` is start; `procurement_completed` is completion; archive, cancellation, and no-vendor-response abort are exits. No duplicate alias event is emitted.

## Appendix G {#appendix-g}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `workspace_created` | Workspace created | `workspace_id` |
| `buyer_evaluation_completed` | Duplicate completion emitter | `workspace_id` |
| `workspace_archived` | Workspace archived | `workspace_id` |
| `workspace_canceled` | Workspace canceled | `workspace_id` |
| `workspace_no_vendor_response_aborted` | No-vendor-response abort | `workspace_id` |
| `procurement_completed` | Procurement completed | `workspace_id` |

**Buyer-evaluation funnel derivation.** Analytics aliases are derived views: `buyer_evaluation_started := workspace_created`; `buyer_evaluation_completed := procurement_completed`. `workspace_archived`, `workspace_canceled`, and `workspace_no_vendor_response_aborted` are terminal exits, not completions. The join key is `workspace_id`; timestamps are the source events' `emitted_at`; retries dedupe by source `event_id`.

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `buyer_evaluation_funnel_derivation_consistency` | analytics_contract_test | `spec_binding_pending_pack_m02_3` | warehouse_model_test + pr_lint | Local guard `tools/spec-lint/gates/buyer_evaluation_funnel_derivation_consistency.ts` and fixtures are present; warehouse-model evidence remains required. | M02.3 |
