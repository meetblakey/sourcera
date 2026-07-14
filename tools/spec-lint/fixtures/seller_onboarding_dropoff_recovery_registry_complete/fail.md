## 24.3 Seller Inbox {#24.3-seller-inbox}

| `seller_inbox_item_kind` | Appendix C event | Appendix G mirror | Default recipient cohort | Default delivery |
| :---- | :---- | :---- | :---- | :---- |
| `seller_onboarding_recovery_nudge` | `seller_onboarding_bid_unsubmitted` | missing | Seller Org owner | In-app |

### 49.1.7.A Residual Contracts: Solo, Recovery, Instrumentation, and Provider Failure {#49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure}

| Drop-off surface | Trigger | Recovery action | Notification / inbox binding |
| :---- | :---- | :---- | :---- |
| Stage 5 bid unsubmitted | trigger | email | Appendix C `seller_onboarding_bid_unsubmitted` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `seller_inbox_item_kind` (§4.4.33, §24.3)

`seller_onboarding_recovery_nudge`

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_onboarding_dropoff_recovery_registry_complete` | catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint | fail | M02.3 |
