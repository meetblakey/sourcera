## Appendix F: Webhook Retry & Recovery {#appendix-f-webhook-retry-recovery}

**Default coverage rule.** A third webhook retry class may be added inline later.

### F.1 Standard Retry Curve

Retry timing omitted.

**Webhook retry-class registry (§31 / Appendix F — D-6.1-012).**

**`webhook_retry_class`** (§F.1 / §31): `standard`, `financial_impact`, `security_critical`. Third class added.

Customer webhook retry curve: 1m, 5m, 30m, 2h, 12h.

The webhook_standard label is active for some webhook retry class routing.

| `webhook_inline_retry_curve_lint` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | §F.1 and §F.2 own webhook retry timing. | M02.3 |
