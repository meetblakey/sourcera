# Settlement Freeze Fixture

### 4.8.1 AIOperation {#4.8.1-aioperation}

**Settlement Freeze.** Once `settlement_state ∈ {accepted, rejected, auto_accepted, reversed}` and `contest_window_at < now`, the row is fully frozen: only `redacted_at` (DSAR) writes are accepted. The Settlement Freeze rule and the state-machine row at line 8166 are reconciled into a single coherent contract.

3. Once `contest_window_at < now`, all writes to the row except DSAR redaction MUST return HTTP 422 `ai_operation_immutable_after_settlement`.

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `ai_operation_immutable_after_settlement` | 422 | Any AIOperation mutation post-settlement (`PATCH /v1/orgs/{org_id}/ai-operations/{op_id}`) | `permanent` | Per §4.8.1 immutability invariant — only `accept_reject_status`, `accept_reject_reason_text`, contest-related fields are mutable post-settlement. Body names the field. | `error.billing.ai_operation_immutable_after_settlement` |

## Appendix K Glossary {#appendix-k-glossary}

**Settlement Freeze.** The state of an AIOperation in which all writes other than DSAR redaction are rejected with `ai_operation_immutable_after_settlement` (HTTP 422). Reached when `settlement_state ∈ {accepted, rejected, auto_accepted, reversed}` AND `contest_window_at < now`. Preserves financial-record integrity.

### M.5.4 Catalog index {#appendix-m5-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Assertion | Enforcement | Authority |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `settlement_freeze_carveouts_canonical` | V11 (D-11.3-002 remediation) | `spec_binding_pending_pack_m02_3` | §34.18.x settlement-freeze prose + Master Spec post-edit grep. | Every reference to settlement-freeze carve-outs MUST resolve to the canonical row in §34.18.x; inline restatements of carve-out semantics outside the canonical anchor fail. | PR comment naming the inline drift; merge blocked. Override path: `not_permitted_billing_singleton` (binding §34.18 billing-surface integrity). | §34.18 settlement-freeze canonical anchor; Master Spec line 8287 forward-reference. |
