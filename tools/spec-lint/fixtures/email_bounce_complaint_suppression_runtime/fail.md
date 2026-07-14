## 41.4 Controls {#41.4-opt-out-rate-warmup-and-suppression-controls}

Checks run after provider dispatch. Hard bounce: Create SuppressionListEntry reason `hard_bounce`; no further email to hash until Ops clears. Complaint: Create SuppressionListEntry reason `spam_complaint`; no self-clear.

## 41.5 Acceptance {#41.5-acceptance-criteria}

Hard bounce and spam complaint events update SuppressionListEntry after the next send; `email_bounce_complaint_suppression_precedes_next_send` asserts.

| `email_send_bounced` | event |
| `email_send_complained` | event |
| `email_bounce_complaint_suppression_runtime` | privacy | spec_binding_pending_pack_m02_3 | pr_lint + runtime_test | Local guard `tools/spec-lint/gates/email_bounce_complaint_suppression_runtime.ts` and pass/fail fixtures protect the spec contract; deployed provider-webhook and pre-dispatch suppression evidence remains required. | M02.3 |
