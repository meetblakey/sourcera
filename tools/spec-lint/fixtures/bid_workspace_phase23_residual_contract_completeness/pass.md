## 23.6 Mobile, Accessibility, Surface States, and Observability {#23.6-mobile-accessibility-surface-states-and-observability}
| Editor lock and force-release |
`role="alert" aria-live="polite"`
| Bid Workspace home | No projected requirements yet |
`bid_response.lock.acquire`
`bid_response.bulk_submit.apply`
`bid_workspace.voluntary_withdraw.cascade`
`bid_response.lock.contention_count`
`bid_workspace.bulk_submit.partial_failure_count`
**Dependency degradation.**
The seller is the counterparty making an intentional terminal participation decision
§15.2.6 seller-visible PricingRequirement projection
{#23.5-bid-response-management-acceptance-criteria}
| Bid Response — Editor Lock / Force Release | parity | supported | supported |
| Bid Response — Bulk Submit | parity | supported | supported |
| Bid Workspace — Voluntary Withdrawal | parity | supported | supported |
`bid_workspace_phase23_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**
`bid_response_editor_lock_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`bid_response_bulk_submit_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`bid_workspace_voluntary_withdrawal_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`bid_workspace_surface_state_runtime_consistency` | render_runtime_consistency | **`spec_binding_pending_pack_m11_3`**
`seller_bid_workspace_mobile_accessibility_runtime` | mobile_accessibility_runtime | **`spec_binding_pending_pack_m21_3`**
