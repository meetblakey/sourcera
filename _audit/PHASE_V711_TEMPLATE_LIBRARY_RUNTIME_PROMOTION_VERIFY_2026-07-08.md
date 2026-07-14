# Phase v7.1.1 Template Library Runtime Promotion Verify

**Date:** 2026-07-08
**Scope:** §M.5.34 Template Library spec-tree runtime promotion.

## Gates Promoted

| Gate | Prior status | New status | Evidence |
|---|---|---|---|
| `workspace_template_entity_contract_completeness` | `spec_binding_pending_pack_m02_3` | `runtime_active` | Detector + pass/fail fixtures + full spec-lint pass |
| `workspace_template_entitlement_singleton` | `spec_binding_pending_pack_m02_3` | `runtime_active` | Detector + pass/fail fixtures + full spec-lint pass |
| `workspace_template_enum_registration_consistency` | `spec_binding_pending_pack_m02_3` | `runtime_active` | Detector + pass/fail fixtures + full spec-lint pass |
| `workspace_template_retention_dsar_binding` | `spec_binding_pending_pack_m02_3` | `runtime_active` | Detector + pass/fail fixtures + full spec-lint pass |

## Source Fixes

| Surface | Fix |
|---|---|
| §19.4.1 | Template Library source/category filtering now cites Appendix J `workspace_template_source` and `workspace_template_category` display labels. |
| §19.6.1 | Removed plan-tier entitlement restatement; §34.1.1 cell **Custom Templates (author / share)** remains the singleton. |
| §4.3.29 / §4.3.30 | Added direct §40.2 citations to WorkspaceTemplate / WorkspaceTemplateVersion retention prose. |
| §M.5.34 | Four Template Library guardrail rows promoted to `runtime_active` with detector and fixture paths. |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` from `tools/spec-lint` | Pass |
| Direct live detector run: `workspace_template_entity_contract_completeness` | Pass, 0 findings |
| Direct live detector run: `workspace_template_entitlement_singleton` | Pass, 0 findings |
| Direct live detector run: `workspace_template_enum_registration_consistency` | Pass, 0 findings |
| Direct live detector run: `workspace_template_retention_dsar_binding` | Pass, 0 findings |
| Pass fixtures | Pass, 0 findings for all four gates |
| Fail fixtures | Fail with expected findings: entity 36, entitlement 10, enum 13, retention 12 |
| `npm run all -- --no-emit` from `tools/spec-lint` | Pass, 0 blocking findings |
| `npx tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | Fails overall on remaining runtime-evidence blockers |

## Stamp-Gate Posture After Promotion

| Metric | Count |
|---|---:|
| Runtime rows parsed | 420 |
| `runtime_active` | 172 |
| `spec_binding_pending_pack_m02_3` | 113 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
| Blockers | 246 |

## Scope Boundary

This promotion proves spec-tree documentation contracts only. It does not claim product-code, deploy-validator, Convex runtime, webhook delivery, billing runtime, marketplace runtime, or integration-test proof for rows whose §M.5 status still names those evidence classes.
