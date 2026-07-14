## 24.3 Seller Inbox {#24.3-seller-inbox}

| `seller_inbox_item_kind` | Appendix C event | Appendix G mirror | Default recipient cohort | Default delivery |
| :---- | :---- | :---- | :---- | :---- |
| `seller_onboarding_recovery_nudge` | `seller_onboarding_bid_unsubmitted` | `seller_onboarding_bid_unsubmitted_nudge_rendered` | Seller Org owner, Seller Bid Captain | In-app + lifecycle email |
| `seller_post_activation_dormant_nudge` | `seller_post_activation_dormant` | `seller_post_activation_dormant_nudge_rendered` | Seller Org owner, Seller Admin | In-app + lifecycle email |

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
|---|---|---|---|---|---|---|---|
| Seller Onboarding Stage 1 Stalled | `seller_onboarding_stage_1_stalled` | Your Sourcera invite is waiting | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `seller_onboarding_stage_1_stalled`; pre-SSO invite-recipient re-engagement |
| Seller Onboarding Bid Unsubmitted | `seller_onboarding_bid_unsubmitted` | Your bid draft is still waiting | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `seller_onboarding_bid_unsubmitted`; Stage 5 recovery |
| Seller Post-Activation Dormant | `seller_post_activation_dormant` | Your Sourcera workspace is ready when you are | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `seller_post_activation_dormant`; Stage 7 dormant recovery |

### 49.1.7.A Residual Contracts: Solo, Recovery, Instrumentation, and Provider Failure {#49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure}

| Drop-off surface | Trigger | Recovery action | Notification / inbox binding |
| :---- | :---- | :---- | :---- |
| Stage 1 stalled before SSO | `stage_1_arrival_at` exists and `stage_2_sso_initiated_at IS NULL` after the lifecycle threshold in Appendix C event `seller_onboarding_stage_1_stalled` | Single Loops.so re-engagement to the MarketplaceInviteLink recipient; no SellerInboxItem because Seller Org / User does not yet exist | Appendix C `seller_onboarding_stage_1_stalled`; Appendix G `seller_onboarding_stage_1_stalled_email_sent`; §41.2 subject-line row |
| Stage 5 bid unsubmitted | `first_requirement_response_at IS NOT NULL` and `first_bid_submitted_at IS NULL` after the lifecycle threshold in Appendix C event `seller_onboarding_bid_unsubmitted` | SellerInboxItem `seller_onboarding_recovery_nudge` plus lifecycle email; deep-link to the Bid Workspace summary | Appendix C `seller_onboarding_bid_unsubmitted`; Appendix G `seller_onboarding_bid_unsubmitted_nudge_rendered`; §41.2 subject-line row |
| Stage 7 post-activation dormant | `completion_state='activated'` and no seller activity before the §4.4.22 post-activation churn classifier would fire | SellerInboxItem `seller_post_activation_dormant_nudge` plus lifecycle email; deep-link to Win/Loss Debrief or Seller Workspace home depending on bid-resolution state | Appendix C `seller_post_activation_dormant`; Appendix G `seller_post_activation_dormant_nudge_rendered`; §41.2 subject-line row |

46. `seller_onboarding_dropoff_recovery_registry_complete`: Appendix C, Appendix G, §41.2, §24.3, and Appendix J MUST contain the Stage 1 stalled, Stage 5 bid-unsubmitted, and Stage 7 dormant recovery bindings in this subsection; CI fails on missing registry rows.

### Phase V13 Additions (2026-05-12) — PLG / Growth / Analytics / Hero Moment {#appendix-c-phase-v13}

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `seller_onboarding_stage_1_stalled` | §49.1.7.A pre-SSO Stage 1 stalled re-engagement | MarketplaceInviteLink recipient | Email | Idempotent on `(invite_id, recovery_stage='stage_1_stalled')` | `{invite_id, invite_source, elapsed_seconds_since_arrival}` | Loops.so non-webhook dispatch policy (§41); no SellerInboxItem before Seller Org exists |
| `seller_onboarding_bid_unsubmitted` | §49.1.7.A Stage 5 bid-unsubmitted recovery | Seller's `org_owner` + Seller Bid Captain | Email + In-app inbox card | Idempotent on `(session_id, recovery_stage='bid_unsubmitted')` | `{seller_org_id, session_id, bid_id, elapsed_seconds_since_first_requirement_response}` | Materializes SellerInboxItem `seller_onboarding_recovery_nudge`; Loops.so non-webhook dispatch policy (§41) |
| `seller_post_activation_dormant` | §49.1.7.A Stage 7 post-activation dormant recovery | Seller's `org_owner` + Seller Admin | Email + In-app inbox card | Idempotent on `(session_id, recovery_stage='post_activation_dormant')` | `{seller_org_id, session_id, last_activity_at, bid_resolution_state}` | Materializes SellerInboxItem `seller_post_activation_dormant_nudge`; Loops.so non-webhook dispatch policy (§41) |

### §49.1 Seller Onboarding Implementation-Level Event Additions {#appendix-g-section-49-1-additions}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `seller_onboarding_stage_1_stalled_email_sent` | Appendix C `seller_onboarding_stage_1_stalled` email enqueued | `invite_id`, `invite_source`, `elapsed_seconds_since_arrival`, `suppression_state` |
| `seller_onboarding_bid_unsubmitted_nudge_rendered` | Appendix C `seller_onboarding_bid_unsubmitted` materializes SellerInboxItem | `seller_org_id`, `session_id`, `bid_id`, `elapsed_seconds_since_first_requirement_response`, `seller_inbox_item_id` |
| `seller_post_activation_dormant_nudge_rendered` | Appendix C `seller_post_activation_dormant` materializes SellerInboxItem | `seller_org_id`, `session_id`, `last_activity_at`, `bid_resolution_state`, `seller_inbox_item_id` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `seller_inbox_item_kind` (§4.4.33, §24.3)

`new_requirement_assigned`, `seller_onboarding_recovery_nudge`, `seller_post_activation_dormant_nudge`

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_onboarding_dropoff_recovery_registry_complete` | catalog_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/seller_onboarding_dropoff_recovery_registry_complete.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
