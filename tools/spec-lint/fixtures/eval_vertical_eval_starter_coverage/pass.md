# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `vertical_slug` | String | Required | Stable identifier; corresponds to `EvalVertical`; rows exposed to buyers require `state=active` AND `visibility=public`; deploy-time validator `eval_vertical_eval_starter_coverage` asserts coverage. |

### 13.12.2 Surface {#13.12.2-surface}

| `vertical_slug` | Display name | Tile sub-label |
| :---- | :---- | :---- |
| `crm` | CRM | Sales, marketing, and customer success platforms |
| `itsm` | ITSM | IT service management, ticketing, asset management |
| `edr` | EDR / Endpoint Security | Endpoint detection and response |
| `observability` | Observability | APM, logs, metrics, tracing |
| `payroll_hris` | Payroll / HRIS | Payroll and HRIS |
| `other` | Other | Tell us in your own words |

### `EvalVertical` (§4.5.9 EvalStarter, §13.12) {#appendix-j-eval-vertical}

`crm`, `itsm`, `edr`, `observability`, `payroll_hris`, `other`

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_vertical_eval_starter_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_vertical_eval_starter_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every EvalVertical value has a public active EvalStarter binding. | M02.3 |
