# Fixture

## Appendix C: Notification Event Catalog {#appendix-c-notification-event-catalog}

| Event | Trigger | Recipient | In-App | Email | Frequency |
|---|---|---|---|---|---|
| `billing.plan.downgraded` | Plan downgrade takes effect | Billing Admin | Yes | Yes | Immediate |
| `product_update` | Product update published | opted-in users | Yes | Yes | Monthly |
| `internal.audit.only` | Internal audit event | Ops | No | No | Immediate |

# 41. Email Deliverability & Compliance {#41.-email-deliverability-and-compliance}

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

### 41.2.4 Appendix C Email-Channel Generated Registry {#41.2.4-appendix-c-email-channel-generated-registry}

**Email-channel affirmative row definition.** An Appendix C row is email-channel affirmative when its `Email` column is not `No` / `n/a` / `No customer email by default`, or when its `Channels` cell includes `Email` without a negating phrase. Every affirmative row creates exactly one generated EmailTemplate registry entry.

Generated entries use EmailTemplate.`appendix_c_event_name` equal to the Appendix C event, EmailTemplate.`status='active'` after preview QA and Loops.so sync, and email_kind = Appendix C `Event` value normalized to snake_case by replacing `.` with `_`.

| Event source pattern | Email category | Opt-out class | Sender | Reply-To policy |
|---|---|---|---|---|
| Billing, security, privacy, DSAR, Ops-session, residency, DR, SLA, incident, or provider-failure notices | `operational_critical` | `transactional_critical` | `noreply@sourcera.io`, `privacy@sourcera.io`, or `billing@sourcera.io` by source domain | `privacy_support`, `billing_support`, or `noreply` by source domain |
| Marketing or product-announcement rows | `marketing` | `marketing_lifecycle_opt_in` | `marketing@sourcera.io` | `marketing_replies` |
| Lifecycle, digest, reminder, recovery, onboarding, referral, conversion, growth-loop, marketplace-editorial, CRM, KB, or optional-email rows | `lifecycle` | `marketing_lifecycle_opt_in` | `noreply@sourcera.io` | `workspace_inbox`, `seller_inbox`, or `noreply` by source domain |
| All remaining affirmative Email-channel rows | `transactional` | `transactional_no_opt_out` | `noreply@sourcera.io` | `workspace_inbox`, `seller_inbox`, or `noreply` by source domain |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Email Kind (§4.9 / §41)

`billing_plan_downgraded`, `product_update`

The generated extension is closed over Appendix C affirmative Email-channel rows: `email_kind` also includes the dot-to-underscore normalized `Event` value for every Appendix C row that §41.2.4 classifies as email-channel affirmative.
The detector `email_type_catalog_coverage` expands this generated set at lint time and fails on any affirmative Email-channel event that cannot resolve through §41.2.4.

#### M.5.45 v7.2.0-REM Phase 41 Email Domain P1 addition {#m-5-45-v72rem-phase-41-email-domain-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `email_type_catalog_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/email_type_catalog_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every Appendix C Email-channel notification event MUST resolve to §41.2.4. | M02.3 |
