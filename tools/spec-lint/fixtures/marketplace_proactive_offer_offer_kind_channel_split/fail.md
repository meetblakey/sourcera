### 4.5.13 MarketplaceProactiveOffer {#4.5.13-marketplaceproactiveoffer}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `offer_kind` | Enum | direct_invite_from_cohort | persisted `offer_kind=direct_invite_from_cohort` |

### 27.9.8 Direct Invite from Cohort {#27.9.8-direct-invite-from-cohort}

Offer kind is the flow discriminator.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `marketplace_proactive_offer_offer_kind_channel_split` | enum_consistency | spec_binding_pending_pack_m02_3 | pr_lint | fail | M02.3 |
