## 20.4 Pulse Digest Email {#20.4-pulse-digest-email}

### 20.4.1 Schedule, Audience, and Delivery {#20.4.1-schedule-audience-and-delivery}

Pulse Digest is a lifecycle email delivered through §41.1 with template key `weekly_digest` in §41.2. The subject pattern, sender, Reply-To policy, opt-out class, HTML / plain-text requirement, suppression checks, unsubscribe footer, preview QA, bounce / complaint behavior, and provider retry behavior are governed by §41.2 through §41.5; §20 MUST NOT define a second email-template contract.

| Dimension | Contract |
| :---- | :---- |
| Delivery provider | Loops.so via §41.1; template, opt-out, compliance, and unsubscribe behavior via §41.2 through §41.5. |

### 20.4.2 Template Content Contract {#20.4.2-template-content-contract}

The `weekly_digest` template renders these sections in both HTML and plain text. The subject pattern lives only in §41.2.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

7. Pulse Digest email MUST use §41.2 `weekly_digest`; subject, sender, opt-out, unsubscribe, preview QA, bounce, complaint, retry, and suppression behavior MUST come from §41, not §20.

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

**Catalog authority.** Appendix C is the exhaustive notification-event catalog. Every Appendix C row whose channel includes Email MUST resolve to exactly one active EmailTemplate row (§4.9.1) with `appendix_c_event_name`, `email_kind`, `email_category`, `opt_out_class`, sender, Reply-To policy, locale, and template version. The table below is the seed registry for the original v6/v7 email family; the runtime catalog is the generated EmailTemplate registry over Appendix C and MUST include all later v7 event rows.

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Weekly Digest | `weekly_digest` | `[Workspace Name]` Weekly Pulse - Health Score: `{score}%` (`{color_band}`) | `noreply@sourcera.io` | `noreply` | `lifecycle` | `marketing_lifecycle_opt_in` | Pulse digest; §20.4 / Appendix C |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_digest_email_single_source` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/pulse_digest_email_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20.4 MUST cite §41.2 `weekly_digest` for subject/template/deliverability and MUST NOT contain a second literal subject or provider contract. | M02.3 |
