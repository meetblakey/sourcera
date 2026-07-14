# Phase v7.1.1 Agent Core Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** §21 / §M.5.48 Agent Core M02.3 spec-tree rows.

## Promoted

| Gate | Detector | Runtime status |
|---|---|---|
| `agent_threshold_config_contract_completeness` | `tools/spec-lint/gates/agent_threshold_config_contract_completeness.ts` | `runtime_active` |
| `agent_prompt_injection_catalog_consistency` | `tools/spec-lint/gates/agent_prompt_injection_catalog_consistency.ts` | `runtime_active` |
| `custom_agent_instructions_contract_completeness` | `tools/spec-lint/gates/custom_agent_instructions_contract_completeness.ts` | `runtime_active` |
| `agent_output_surface_registry_consistency` | `tools/spec-lint/gates/agent_output_surface_registry_consistency.ts` | `runtime_active` |

## Not Promoted

| Gate | Reason |
|---|---|
| `agent_feedback_no_model_training` | Still M11.3. Immutable-false persistence, write rejection, provider export prevention, deploy validation, and integration tests require product-code/runtime evidence. |

## Conflict Surfaced

Two §M.5.48 row classes did not match the harness `ci_gate_row_class` enum:

| Gate | Old row class | Corrected row class |
|---|---|---|
| `agent_prompt_injection_catalog_consistency` | `security_catalog_consistency` | `catalog_consistency` |
| `agent_output_surface_registry_consistency` | `surface_engine_mapping_consistency` | `spec_tree_lint` |

## Verification

| Check | Result |
|---|---|
| Direct live gates | PASS for all four promoted gates |
| Pass fixtures | PASS for all four promoted gates |
| Fail fixtures | FAIL as expected: 29 / 15 / 30 / 24 findings |
| TypeScript | PASS: `npm --prefix tools/spec-lint run typecheck` |
| Full blocking spec-lint | PASS: `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` |
| Stamp gate | Expected FAIL on unrelated blockers only: 170 blockers, 248 `runtime_active`, 37 M02.3, 102 M11.3, 26 M21.3, 5 M24.3, 2 release-only |

## Stamp-Gate Boundary

This pass proves spec-tree Agent Core completeness only. It does not claim product settings UI, config persistence, permission middleware, threshold tuning jobs, prompt-injection classifier behavior, provider-call suppression, audit writes, incident routing, Team settings UI, compiler apply jobs, downgrade runtime ignores, API handlers, frontend rendering, responsive behavior, fallback execution, feedback writes, deploy validators, integration tests, or runtime security-block behavior.

## Artifacts

- JSON: `_audit/_tmp/v711_stamp_gate_final_agent_core_spec_tree.json`
- Latest JSON copy: `_audit/_tmp/v711_stamp_gate_latest.json`
- Inventory: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md`
- CSV: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`
- AE ledger addendum: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- Reconciliation entry: `_integration/RECONCILIATION.md -> v7.1.1 Agent Core Spec-Tree Runtime Promotion + Inventory Sync (2026-07-09)`
