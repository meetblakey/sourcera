### 48.8.12 Abandonment Recovery {#48.8.12-abandonment-recovery}

**Three-stage recovery cadence.**

| Stage | Elapsed threshold | Recovery surface | Loops.so type | PostHog event |
|---|---|---|---|---|
| 24-hour re-engagement | 24h | Email | `hero_moment_abandonment_24h` | `hero_moment_abandonment_24h_email_sent {seller_org_id, session_id, elapsed_seconds_since_sso}` |
| 7-day pre-sweep nudge | 6d 12h | Email | `hero_moment_abandonment_pre_sweep` | `hero_moment_abandonment_pre_sweep_email_sent` |
| 14-day re-issue | 7 days post-abandonment | Email | `hero_moment_abandonment_re_issue` | `hero_moment_abandonment_re_issue_email_sent`; `hero_moment_abandonment_recovered {original_session_id, new_session_id}` |

1. The Convex cron `hero_moment_abandonment_sweeper` runs at 15-minute cadence and idempotently enqueues at most one email per (session_id, recovery_stage) pair. QA test `hero_moment_abandonment_recovery_idempotency` asserts.
7. the Convex `hero_moment_abandonment_sweeper` cron contract is specified in AC #1. Product-runtime proof that the cron is deployed remains implementation-pack evidence.

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
|---|---|---|---|---|---|---|---|
| Hero Moment Abandonment 24h | `hero_moment_abandonment_24h` | Your bid is still drafted and waiting - pick up where you left off | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `hero_moment_abandonment_24h`; Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3 |
| Hero Moment Abandonment Pre-Sweep | `hero_moment_abandonment_pre_sweep` | Your bid will be archived in 12 hours unless you respond | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `hero_moment_abandonment_pre_sweep`; Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3 |
| Hero Moment Abandonment Re-Issue | `hero_moment_abandonment_re_issue` | We saved your Sourcera bid draft | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `hero_moment_abandonment_re_issue`; Tier-2 retry + suppression per §48.8.12 AC #4 / §41.3 |
| Firecrawl Recovery Re-Bootstrap Completed | `firecrawl_recovery_re_bootstrap_completed` | Your Sourcera bid draft has new website evidence | `noreply@sourcera.io` | `seller_inbox` | `lifecycle` | `marketing_lifecycle_opt_in` | Appendix C `firecrawl_recovery_re_bootstrap_completed`; §48.8.3 FM #6(f) |

### Phase V13 Additions (2026-05-12) — PLG / Growth / Analytics / Hero Moment {#appendix-c-phase-v13}

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `hero_moment_abandonment_24h` | §48.8.12 24-hour re-engagement trigger | Seller's `org_owner` | Email (Loops.so) + In-app inbox card | Idempotent on `(session_id, recovery_stage='24h')` | `{seller_org_id, session_id, elapsed_seconds_since_sso, magic_link_reissued (bool)}` | Loops.so non-webhook dispatch policy |
| `hero_moment_abandonment_pre_sweep` | §48.8.12 6d-12h pre-sweep nudge | Seller's `org_owner` | Email + In-app | Idempotent on `(session_id, recovery_stage='pre_sweep')` | `{seller_org_id, session_id, sweep_at, magic_link_extended_72h (bool)}` | Loops.so non-webhook dispatch policy |
| `hero_moment_abandonment_re_issue` | §48.8.12 14-day post-abandonment single re-issue | Seller's `org_owner` | Email | Idempotent on `(original_session_id, recovery_stage='re_issue')` | `{seller_org_id, original_session_id, new_session_id, magic_link_validity_hours=72}` | Loops.so non-webhook dispatch policy |

# Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `hero_moment_abandonment_24h_email_sent` | §48.8.12 24-hour re-engagement email dispatch succeeds | `seller_org_id`, `session_id`, `elapsed_seconds_since_sso`, `recovery_stage='24h'`, `magic_link_reissued=boolean` |
| `hero_moment_abandonment_pre_sweep_email_sent` | §48.8.12 6d-12h pre-sweep nudge email dispatch succeeds | `seller_org_id`, `session_id`, `sweep_at`, `recovery_stage='pre_sweep'`, `magic_link_extended_72h=boolean` |
| `hero_moment_abandonment_re_issue_email_sent` | §48.8.12 14-day post-abandonment single re-issue email dispatch succeeds | `seller_org_id`, `original_session_id`, `new_session_id`, `recovery_stage='re_issue'`, `magic_link_validity_hours=72` |
| `hero_moment_abandonment_recovered` | Seller re-arrives from the §48.8.12 re-issued magic link | `seller_org_id`, `original_session_id`, `new_session_id`, `kb_draft_entries_prepopulated=boolean` |

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `hero_moment_abandonment_recovery_cadence_completeness` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/hero_moment_abandonment_recovery_cadence_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree Appendix C / Appendix G / §41.2 / §48.8.12 catalog completeness only; production Convex cron deployment and send-path execution remain product-pack evidence) | post-build | Convex sweeper contract specified with cadence, idempotency, and QA binding — closes D-HM-006 documentation gap | M02.3 |
