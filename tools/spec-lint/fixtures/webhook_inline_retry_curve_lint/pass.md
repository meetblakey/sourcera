## Appendix F: Webhook Retry & Recovery {#appendix-f-webhook-retry-recovery}

**Default coverage rule.** At v7.2.0-REM D-8.2-005 close, the live webhook taxonomy is intentionally binary: `standard` and `financial_impact`.

**No inline timing rule.** §F.1 and §F.2 are the only normative homes for webhook retry timing. Body sections, Appendix C rows, and Appendix G rows cite the retry class (`standard` or `financial_impact`) instead of restating delays. Non-webhook retry schedules, such as §25.2.2 `bridge_apply_standard`, Loops.so email dispatch retries, Stripe charge retries, DNS probes, or provider reconnect backoff, MUST be labeled as non-webhook schedules and MUST NOT be added to Appendix J `webhook_retry_class`.

### F.1 Standard Retry Curve

Historical five-delay variants such as `1m / 5m / 30m / 2h / 12h` are retired for webhook transport.

### F.2 Tightened Retry Curve for Financial-Impact Events (§31.8)

**Class membership rule.** Class membership is registered in Appendix J `webhook_retry_class` enum.

**Webhook retry-class registry (§31 / Appendix F — D-6.1-012).**

**`webhook_retry_class`** (§F.1 / §31): `standard`, `financial_impact`. The Console-Bridge apply schedule is the non-webhook `bridge_apply_standard` curve (§25.2.2) and is NOT a member of this enum.

The former `console_bridge_standard` label is retired and not a webhook retry class.

| `webhook_inline_retry_curve_lint` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/webhook_inline_retry_curve_lint.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §F.1 and §F.2 own webhook retry timing. | M02.3 |
