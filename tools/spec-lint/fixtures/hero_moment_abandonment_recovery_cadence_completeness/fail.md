### 48.8.12 Abandonment Recovery {#48.8.12-abandonment-recovery}

**Three-stage recovery cadence.**

| Stage | Elapsed threshold | Recovery surface | Loops.so type | PostHog event |
|---|---|---|---|---|
| 24-hour re-engagement | 24h | Email | `hero_moment_abandonment_24h` | missing |

1. Recovery cron sends email someday.

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
|---|---|---|---|---|---|---|---|
| Hero Moment Abandonment 24h | `hero_moment_abandonment_24h` | Your bid is waiting | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C |

### Phase V13 Additions (2026-05-12) — PLG / Growth / Analytics / Hero Moment {#appendix-c-phase-v13}

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `hero_moment_abandonment_24h` | trigger | Seller | Email | once | `{seller_org_id}` | none |

# Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `hero_moment_abandonment_24h_email_sent` | sent | `seller_org_id` |

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `hero_moment_abandonment_recovery_cadence_completeness` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Convex cron wired. | M02.3 |
