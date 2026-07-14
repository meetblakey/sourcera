# Phase V711 Template Library API/Event Runtime Promotion Verify — 2026-07-08

## Scope

Promotes the §M.5.50 Template Library API/Event spec-tree gates:

- `workspace_template_api_contract_completeness`
- `workspace_template_event_catalog_consistency`
- `workspace_template_audit_registry_consistency`

## Scope Boundary

This pass promotes documentation and spec-tree detector evidence only. It does not claim product-code endpoint execution, webhook delivery, Convex runtime, duplicate-write replay, rollback, concurrent apply-update behavior, deploy-validator, or integration-test proof beyond the spec-lint contracts named here. The sibling `workspace_template_idempotency_atomicity` row remains `spec_binding_pending_pack_m11_3`.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added three detectors under `tools/spec-lint/gates/` and registered them in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/<gate_id>/` for all three gates. |
| §M.5 status | Three §M.5.50 rows promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §32.10.3.D now carries WorkspaceTemplate.`kind` in list filtering, create/save request schemas, response fields, validation errors, and the example; §31.15 / Appendix C / Appendix G now carry `workspace_template_kind` in Template Library payloads and mirrors. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.md` and `.csv` refreshed from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 241 blockers, down from 244. Remaining blockers: 108 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector runs | Pass, 0 findings for all three gates |
| Pass fixtures | Pass, 0 findings for all three gates |
| Fail fixtures | Fail with expected findings: API contract 57, event catalog 57, audit registry 24 |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 241 runtime-evidence blockers |

## Artifacts

- `_audit/_tmp/v711_stamp_gate_latest.json`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.csv`
- `legacy-import:_versions/Sourcera_Master_Spec_pre-template-library-api-event-runtime-promotion-2026-07-08.md`
