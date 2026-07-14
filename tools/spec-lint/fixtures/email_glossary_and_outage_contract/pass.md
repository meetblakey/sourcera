## 41.1 Email Provider and Loops.so Integration Contract {#41.1-email-provider-and-loopsso-integration-contract}

**Outage execution.** `loops_degraded` preserves the EmailSend row. Deferred rows follow the §4.9.2 `deferred → queued` transition. Appendix F owns retry and DLQ handling. Immediate callers receive `email_provider_unavailable`; fallback preserves the same `idempotency_key`, suppression checks, residency route, and audit trail.

## Appendix K {#appendix-k-glossary}

**Email Deliverability.**
**Sender Domain.**
**From Alignment.**
**Transactional-Critical Email.**
**Lifecycle Email.**
**Bounce Rate.**
**Complaint Rate.**

## Appendix M.5

| `email_glossary_and_outage_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/email_glossary_and_outage_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
