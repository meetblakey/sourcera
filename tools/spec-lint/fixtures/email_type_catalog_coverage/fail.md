# Fixture

## Appendix C: Notification Event Catalog {#appendix-c-notification-event-catalog}

| Event | Trigger | Recipient | In-App | Email | Frequency |
|---|---|---|---|---|---|
| `billing.plan.downgraded` | Plan downgrade takes effect | Billing Admin | Yes | Yes | Immediate |
| `agent.prompt_injection_detected` | Prompt injection detector fires | Ops | No | No customer email by default | Immediate |

# 41. Email Deliverability & Compliance {#41.-email-deliverability-and-compliance}

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
|---|---|---|---|---|---|---|---|
| Plan Downgrade Warning | `plan_downgrade_warning` | Your plan will downgrade on `[Date]` | `noreply@sourcera.io` | `billing_support` | `operational_critical` | `transactional_critical` | Billing / downgrade notice |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Email Kind (§4.9 / §41)

`plan_downgrade_warning`

#### M.5.45 v7.2.0-REM Phase 41 Email Domain P1 addition {#m-5-45-v72rem-phase-41-email-domain-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `email_type_catalog_coverage` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Every Appendix C Email-channel notification event MUST resolve to §41.2. | M02.3 |
