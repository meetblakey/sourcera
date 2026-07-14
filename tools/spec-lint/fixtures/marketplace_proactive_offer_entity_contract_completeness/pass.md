### 4.5.13 MarketplaceProactiveOffer {#4.5.13-marketplaceproactiveoffer}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | ok |
| `org_id` | UUID | Seller Org | ok |
| `console` | Enum | marketplace | ok |
| `offer_channel` | Enum | Appendix J | ok |
| `offer_kind` | Enum | Appendix J | ok |
| `offer_state` | Enum | Appendix J | ok |
| `source_seller_signal_id` | UUID | required | ok |
| `seller_signal_cohort_fingerprint_hash` | String | sha256 | ok |
| `source_category_ids` | Array[UUID] | required | ok |
| `source_region_scope` | Enum | required | ok |
| `subject_line` | String | required | ok |
| `body_markdown` | String | markdown | ok |
| `embedded_link_urls` | Array[String] | max 5 | ok |
| `target_workspace_count` | Integer | >= 0 | ok |
| `pending_target_count` | Integer | >= 0 | ok |
| `accepted_target_count` | Integer | >= 0 | ok |
| `declined_target_count` | Integer | >= 0 | ok |
| `expired_target_count` | Integer | >= 0 | ok |
| `expires_at` | Timestamp | required | ok |
| `dispatched_at` | Timestamp | nullable | ok |
| `withdrawn_at` | Timestamp | nullable | ok |
| `withdrawn_by_user_id` | UUID | nullable | ok |
| `withdrawal_reason` | Enum | nullable | ok |
| `privacy_gate_snapshot_json` | JSON | required | ok |
| `idempotency_key_hash` | String | nullable | ok |
| `last_state_transition_audit_event_id` | UUID | nullable | ok |
| `created_at` | Timestamp | immutable | ok |
| `updated_at` | Timestamp | auto | ok |
| `created_by` | UUID | Seller or system | ok |
| `updated_by` | UUID | Seller/Ops/system | ok |
| `deleted_at` | Timestamp | nullable | ok |

**DirectInviteTargetAccount child rows.** Present.
**Indexes.** Present.
**Scope Isolation.** Present.
**State Machine (`offer_state`).** Present.
**Retention, DSAR, and Residency.** Present.
**Failure Modes Addressed.** Present.
**Acceptance Criteria.** Present.

**MarketplaceProactiveOffer.** Marketplace-domain parent entity (§4.5.13) for seller-origin offers.
| MarketplaceProactiveOffer (§4.5.13) | retention row |
| Marketplace Proactive Offer (Direct Invite) | `MarketplaceProactiveOffer.offer_state` | §4.5.13 / §27.9.8 | Appendix J `marketplace_proactive_offer_state` | lifecycle |
**Entity.** `MarketplaceProactiveOffer` is authored in §4.5.13.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `marketplace_proactive_offer_entity_contract_completeness` | data_model_contract | **`runtime_active`** (detector `tools/spec-lint/gates/marketplace_proactive_offer_entity_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
