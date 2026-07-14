# 20. Inbox & Pulse {#20.-inbox-and-pulse}

Inbox has read and dismiss actions.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

| Method | Path | Auth Scope |
| :---- | :---- | :---- |
| GET | `/v1/workspaces/{workspace_id}/inbox` | `read:workspaces` |

**Response objects.**

| Object | Fields |
| :---- | :---- |
| Inbox item | `item_id` |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `buyer_inbox_pulse_api_contract_completeness` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint | Incomplete API docs. | M02.3 |
