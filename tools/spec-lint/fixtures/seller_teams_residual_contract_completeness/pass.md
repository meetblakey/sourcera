| `seller_ai_response_generation_enabled` | Boolean | Default `false` |
| `public_capability_tag_ids` | Array\[UUID\] |
**Auto-Mapping Requirement Projection (§9.2).**
`title` is the seller-facing alias of Requirement.`statement`
`description` is the seller-facing alias of Requirement.`acceptance_criteria`
Bid Workspace life + 7 years
### 9.4.4 Organization Toggle State Machine
### 9.5 Accessibility, State, and Mobile Behavior
`role=status`
`aria-live=polite`
| Seller Triage Queue (§9.2) | parity | simplified | simplified |
| Vendor Response Drafting Composer (§9.3) | parity | simplified | simplified |
| AI Suggestion Approval (§9.4) | parity | supported | supported |
| Capability Declaration Picker (§9.3.2) | parity | simplified | simplified |
**Triage Queue.**
**Vendor Response.**
**Auto-Mapping.**
**Decline-to-Bid.**
**AI Response Generation.**
**[AI-SUGGESTED] Badge.**
**Default Inbox.**
**Manual Remap.**
`capability_declaration_reuse_count_consistency` | materialized_view_consistency | **`spec_binding_pending_pack_m11_3`**
`ai_response_generation_billing_consistency` | billing_runtime_consistency | **`spec_binding_pending_pack_m11_3`**
