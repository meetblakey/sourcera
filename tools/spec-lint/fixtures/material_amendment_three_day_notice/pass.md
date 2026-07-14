### 4.3.4.1 RequirementAmendment

`material_scope_change` requires the three-calendar-day floor

| `effective_at` | Timestamp | `effective_at >= created_at + 3 calendar days` |

HTTP 422 `material_amendment_notice_below_minimum`
`requirement_amendment_required`
`requirement_amendment_phase_restricted`
`requirement_amendment_version_conflict`
`requirement_amendment_pending_conflict`
`requirement_amendment_patch_forbidden`
`requirement_amendment_kind`
`requirement_amendment_status`
POST | `/v1/workspaces/{workspace_id}/requirements/{requirement_id}/amendments`
#### 32.10.9.A.1 Requirement Amendment endpoint
Semantic Requirement PATCH during Phase 6–9 attempted to bypass
`amendment_id`, `amendment_kind`, `effective_at`, `amendment_diff_summary`
§4.3.4.1 | RequirementAmendment | 4
Requirement and RequirementAmendment
`material_amendment_three_day_notice` | spec_tree_lint | **`runtime_active`**
tools/spec-lint/gates/material_amendment_three_day_notice.ts

## 10.6 Phase 6: Vendor Bidding Opens {#10.6-phase-6-vendor-bidding-opens}

`amendment_kind` is Appendix J `requirement_amendment_kind`
`effective_at >= created_at + 3 calendar days`
No direct Phase 6–9 PATCH bypass is allowed
