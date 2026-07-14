### 4.5.13 MarketplaceProactiveOffer {#4.5.13-marketplaceproactiveoffer}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `offer_channel` | Enum | Appendix J `marketplace_proactive_offer_channel`: `direct_invite_from_cohort` | Flow discriminator. Legacy request payloads are accepted only as an API-boundary alias and rewritten to `offer_channel` before persistence |
| `offer_kind` | Enum | Appendix J `direct_invite_offer_kind` | Buyer-visible rationale; not the channel discriminator |

### 27.9.8 Direct Invite from Cohort {#27.9.8-direct-invite-from-cohort}

The persisted `offer_channel='direct_invite_from_cohort'` identifies this flow; persisted `offer_kind` uses Appendix J `direct_invite_offer_kind`.

#### `marketplace_proactive_offer_channel`

`direct_invite_from_cohort`.

**Semantics:** Flow discriminator for `MarketplaceProactiveOffer.offer_channel` (§4.5.13). Request payloads that use the legacy shorthand `offer_kind=direct_invite_from_cohort` are API-boundary aliases only and MUST be rewritten before persistence.

#### `direct_invite_offer_kind`

`cohort_interest_signal`, `capability_match_hint`, `vertical_alignment`, `use_case_ready`.

**Semantics:** The cohort-justification class surfaced on the invite UX.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `marketplace_proactive_offer_offer_kind_channel_split` | enum_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/marketplace_proactive_offer_offer_kind_channel_split.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
