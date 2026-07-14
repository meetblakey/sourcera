### 4.2.15 UserUIPreference
| `breakpoint_observation_metadata_by_console_json` | JSON | | |
`client_observed_at` and a UUID `idempotency_key`. Class 4 Pattern A rule is canonical.
### 38.6.3 Breakpoint-Aware Entity Fields {#38.6.3-breakpoint-aware-entity-fields}
`created_by` | UUID (FK → User or system actor)
`updated_by` | UUID (FK → User or system actor)
There is deliberately no stored `console` field. ±5-minute server-receipt skew window. On membership, entitlement, or plan change that removes access to a console.
## 40.2 Data Retention & Deletion
| UserUIPreference (§4.2.15) | entire Class 4 Pattern A row hard-deletes |
### Responsive / Mobile Surface Errors {#appendix-i-responsive-mobile-surface-errors}
`ui_preference_breakpoint_observation_stale`
`ui_preference_breakpoint_observation_clock_skew`
## Appendix M.5
| `ui_preference_resilience_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/ui_preference_resilience_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
