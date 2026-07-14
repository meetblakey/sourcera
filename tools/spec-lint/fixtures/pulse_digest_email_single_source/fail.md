## 20.4 Pulse Digest Email {#20.4-pulse-digest-email}

### 20.4.1 Schedule, Audience, and Delivery {#20.4.1-schedule-audience-and-delivery}

Pulse Digest sends weekly email from §20.

| Dimension | Contract |
| :---- | :---- |
| Subject Pattern | `[Workspace Name]` Weekly Pulse - Health Score: `{score}%` (`{color_band}`) |
| Sender | `noreply@sourcera.io` |
| Opt-Out Class | `marketing_lifecycle_opt_in` |

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

7. Pulse Digest email sends weekly.

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Weekly Digest | `weekly_digest` | Weekly update | `noreply@sourcera.io` | `noreply` | `lifecycle` | `marketing_lifecycle_opt_in` | Pulse digest |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_digest_email_single_source` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | §20.4 MUST cite §41.2 `weekly_digest` for subject/template/deliverability and MUST NOT contain a second literal subject or provider contract. | M02.3 |
