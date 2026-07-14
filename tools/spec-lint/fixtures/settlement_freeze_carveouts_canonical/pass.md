# Settlement Freeze Fixture

### 4.8.1 AIOperation {#4.8.1-aioperation}

**Settlement Freeze.** Once `settlement_state ∈ {accepted, rejected, auto_accepted, reversed}` and `contest_window_at < now`, the row is fully frozen: only `redacted_at` (DSAR) writes AND the **Ops emergency-reversal path** documented in the §4.8.1 state-machine row are accepted. All other writes return `ai_operation_immutable_after_settlement` (HTTP 422). The Settlement Freeze rule and the §4.8.1 state-machine row ("Any settled state → `reversed` (Ops emergency path)") are reconciled into a single coherent contract: post-`contest_window_at`, only two write classes are permitted — DSAR redaction (Pattern B per §6.8.4.1) and Ops emergency reversal under the §4.8.1.A Ops Emergency Reversal Protocol below. Deploy-time validator `settlement_freeze_carveouts_canonical` (Appendix M.5) asserts no other code path mutates a frozen AIOperation.

3. Once `contest_window_at < now`, all writes to the row except (a) DSAR redaction per §6.8.4.1 Pattern B, and (b) Ops emergency reversal under the §4.8.1.A Ops Emergency Reversal Protocol (with `ops_finance_admin` + Founder dual-signoff and OpsActionRecord audit), MUST return HTTP 422 `ai_operation_immutable_after_settlement`.

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `ai_operation_immutable_after_settlement` | 422 | Any AIOperation mutation after Settlement Freeze (`PATCH /v1/orgs/{org_id}/ai-operations/{op_id}`) | `permanent` | Per §4.8.1 Settlement Freeze — once `contest_window_at < now`, only DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A are permitted; all other writes return this code. Body names the attempted field and the permitted carve-out set. | `error.billing.ai_operation_immutable_after_settlement` |

## Appendix K Glossary {#appendix-k-glossary}

**Settlement Freeze.** The state of an AIOperation in which all writes other than DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A are rejected with `ai_operation_immutable_after_settlement` (HTTP 422). Reached when `settlement_state ∈ {accepted, rejected, auto_accepted, reversed}` AND `contest_window_at < now`. Preserves financial-record integrity.

### M.5.4 Catalog index {#appendix-m5-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Assertion | Enforcement | Authority |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `settlement_freeze_carveouts_canonical` | V11 (D-11.3-002 remediation) | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/settlement_freeze_carveouts_canonical.ts`; verified PASS on live Master Spec and pass/fail fixtures) | §4.8.1 Settlement Freeze paragraph, §4.8.1.A Ops Emergency Reversal Protocol, Appendix I `ai_operation_immutable_after_settlement`, Appendix K Settlement Freeze glossary entry, and Master Spec post-edit grep. | Every reference to settlement-freeze carve-outs MUST resolve to the §4.8.1 canonical contract: post-`contest_window_at`, the only permitted write classes are DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A; inline restatements that omit either carve-out, cite stale line numbers, or route authority through §34.18 fail. | PR comment naming the stale carve-out, broken authority pointer, or inline drift; merge blocked. Override path: `not_permitted_billing_singleton` (binding §4.8.1 financial-record-integrity invariant). Runbook: `runbooks.sourcera.com/ci-gates/settlement_freeze_carveouts_canonical`. | §4.8.1 Settlement Freeze canonical anchor; §4.8.1.A Ops Emergency Reversal Protocol; Appendix I `ai_operation_immutable_after_settlement`; Appendix K Settlement Freeze. |
