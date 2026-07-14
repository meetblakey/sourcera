### 48.8.12 Recovery {#48.8.12-abandonment-recovery}

The enqueue→send in-flight window is protected only at enqueue. Dispatch MUST be dropped and recovery state left unchanged. Audit records `skip_reason='dsar_pseudonymized'` and MUST NOT persist the pseudonymized `seller_email`.

| `dsar_erased_seller_excluded_from_recovery_cadence` | privacy | spec_binding_pending_pack_m02_3 | pr_lint + convex unit + suppression-list join | Local guard `tools/spec-lint/gates/dsar_erased_seller_excluded_from_recovery_cadence.ts` and pass/fail fixtures protect the spec contract; deployed enqueue, send-time, retry, and suppression-join evidence remains required. | M02.3 |
