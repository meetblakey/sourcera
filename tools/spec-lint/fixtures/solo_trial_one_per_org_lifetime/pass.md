# Fixture

### 34.9.5 90-Day Solo Trial (v2-Cohort Migration)

Existing v2-cohort Buyer Free and Seller Free Orgs are eligible only when no prior accepted migration trial exists for `(org_id, console, legal_entity, trial_kind)`.

Active Buyer trials suppress billing: per-evaluation charges MUST NOT fire. Active Seller trials suppress billing: per-bid charges MUST NOT fire. Day-91 auto-downgrade writes `billing.plan.downgraded`, `billing.solo_trial.ended`, and `org.solo_trial_ended` in the same transaction as the plan-tier change. Duplicate acceptance returns HTTP 409 `solo_trial_already_redeemed` and emits no plan change.

Appendix C events: `billing.solo_trial.started`, `billing.solo_trial.expiry_notice_sent`, `billing.solo_trial.ended`.

Appendix G events: `solo_trial_started`, `solo_trial_expiry_notice_sent`, `solo_trial_ended`; each carries `trial_state_id`.

Appendix J enums: `trial_state_kind`, `solo_trial_state`, `solo_trial_outcome`; audit actions `org.solo_trial_started`, `org.solo_trial_ended`.

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `solo_trial_already_redeemed` | 409 | Duplicate `(org_id, console, legal_entity, trial_kind)` acceptance. |

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `solo_trial_one_per_org_lifetime` | cross_feature_invariant | `spec_binding_pending_pack_m02_3` | pr_lint + deploy_validator | Local guard `tools/spec-lint/gates/solo_trial_one_per_org_lifetime.ts` and pass/fail fixtures verify the spec-tree contract; deployed eligibility, transaction, and billing-suppression validator evidence remains required. | M02.3 |
