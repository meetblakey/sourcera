## 12.9 Acceptance Criteria {#12.9-acceptance-criteria}

1. Given an authorized Buyer caller and an `upload_ref`, when create is requested, then a clean Attachment is required.
2. Given safe text, when framework inference runs, then it completes within the p95 budget (≤ 30 seconds).
3. Given partial extraction, when the response is returned, then `resume_token_hash` is persisted and unsafe forks return HTTP 409 `policy_extraction_partial_resume_required`.
4. Given a dedup failure, when recovery is requested, then `policy_ingestion_dedup_failed` after the §44.1 retry budget preserves controls.
5. Given a reviewer is unavailable, when reassigned, then the chain is Use Case Lead → Workspace Admin → Workspace Owner → Org Owner.
6. Given `Workspace.evaluation_owner_mode='solo'`, when amendments render, then individual review is used.
7. Given approved amendments, when published, then `source='policy_ingestion'` is retained.
8. Given settlement, when recorded, then there is at most one customer-chargeable `policy_parsing` parent AIOperation.
9. Given a blocked caller, when authorization is evaluated, then Seller-console, Marketplace, public, cross-Org, or cross-Workspace access is hidden.
10. Given a privacy operation, when it runs, then Retention, DSAR, residency, logs, backups, and provider-processing behavior MUST match §40.2, §6.8, §42.4.2, and §42.6.1.B.
11. Given an endpoint changes, when reviewed, then §32.10.3.C endpoints MUST provide auth scope, RBAC, rate-limit class, request/response schema, error codes, idempotency, pagination where applicable, and examples.
12. Given provider input, when prepared, then no credential, seller data, or cross-console data is emitted.
13. Given a worker outage, when recovery runs, then Webhook redelivery remains Appendix F.1 / §31.
14. Given `provider_kind='voyage_ai'`, when degraded, then dedup remains recoverable.
15. Given Convex, Stripe, or Loops.so degradation, when it occurs, then duplicate settlement is prohibited.

## Appendix M.5

| `policy_ingestion_acceptance_criteria_observability` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/policy_ingestion_acceptance_criteria_observability.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
