{#24-seller-console-qa-nda-inbox-pulse}
{#24.1-seller-qa}
{#24.2-nda-module-execution}
the canonical per-vendor / Workspace question cap and additional-slot workflow in §18.2.3
It is intentionally distinct from the buyer Workspace Inbox priority representation
**Plan authority — NDA.**
**Plan authority — Seller Inbox.**
**Plan authority — Seller Pulse.**
**Plan authority — Seller Analytics.**
`nda.executed` | NDA Record enters `executed`
`nda.expired` | Expiry worker commits `nda_status=expired`
`nda.revoked` | NDA Record enters `revoked`
`nda_executed` | Mirror of Appendix C `nda.executed`
`nda_expired` | Mirror of Appendix C `nda.expired`
`nda_revoked` | Mirror of Appendix C `nda.revoked`
Accept and Request Changes are commands, not a persisted `nda_acceptance_action` field
## 24.7 Shared Seller Console Contract {#24.7-shared-seller-console-contract}
### 24.7.1 Surface States {#24.7.1-surface-states}
| Seller Q&A | No seller-visible threads |
| Seller Analytics | No submitted response rows
### 24.7.2 Accessibility and Mobile {#24.7.2-accessibility-and-mobile}
### 24.7.3 Firewall, Retention, Residency, and DSAR {#24.7.3-firewall-retention-residency-and-dsar}
| Seller Inbox | NEVER CARRIED |
Seller Analytics is a derived read model and MUST NOT create an independent buyer-readable or cross-console durable aggregate
### 24.7.4 Downgrade and Dependency Failure {#24.7.4-downgrade-and-dependency-failure}
`seller_console_phase24_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**
`nda_lifecycle_notification_runtime_consistency` | notification_runtime_consistency | **`spec_binding_pending_pack_m11_3`**
`seller_console_phase24_firewall_state_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`seller_console_phase24_mobile_accessibility_runtime` | mobile_accessibility_runtime | **`spec_binding_pending_pack_m21_3`**
`seller_console_phase24_plan_authority_runtime_consistency` | entitlement_runtime_consistency | **`spec_binding_pending_pack_m24_3`**
