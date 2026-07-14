# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `vertical_slug` | String | Required | Stable identifier. |

### 13.12.2 Surface {#13.12.2-surface}

| `vertical_slug` | Display name | Tile sub-label |
| :---- | :---- | :---- |
| `crm` | CRM | Sales |
| `itsm` | ITSM | Service |

### `EvalVertical` (§4.5.9 EvalStarter, §13.12) {#appendix-j-eval-vertical}

`crm`, `itsm`, `edr`, `observability`, `payroll_hris`, `other`

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_vertical_eval_starter_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_vertical_eval_starter_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every EvalVertical value has a public active EvalStarter binding. | M02.3 |
