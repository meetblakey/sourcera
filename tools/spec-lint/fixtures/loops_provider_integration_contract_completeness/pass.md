# Loops Provider Contract Pass Fixture

## 41.1 Email Provider and Loops.so Integration Contract {#41.1-email-provider-and-loopsso-integration-contract}

Sourcera sends transactional, lifecycle, operational-critical, and marketing email through Loops.so unless §42.6 marks `loops_degraded`. Appendix I applies.

| Sub-contract | Requirement | Canonical support |
| :---- | :---- | :---- |
| API auth and key rotation | Loops.so API keys live in the secret broker | Appendix I |
| Template sync | EmailTemplate rows (§4.9.1) are source-controlled, synced to Loops.so | §41.2 |
| Inbound provider webhook ingestion | Loops.so delivery events (`delivered`, `bounced`, `complained`, `opened`, `clicked`, `unsubscribed`, `suppressed`, `failed`) POST to Sourcera's provider-ingest endpoint with HMAC-SHA256 verification | Appendix G `email_loops_webhook_ingested` / `email_loops_webhook_failed` |
| Suppression sync | SuppressionListEntry and UnsubscribePreference changes propagate to Loops.so before the next send attempt | §41.4 |
| Audience segmentation | Loops.so audiences are segmented by `org_id`, `console`, `data_residency_region`, and email category. | §1.3 |
| Data residency | EmailSend.`data_residency_region` is selected from the owning Org / Workspace. | §47.4 |
| Outage behavior | During `loops_degraded`, new EmailSend rows enter `deferred` until the provider recovers | Appendix I |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

### v7.2.0-REM Phase 41 Additions {#appendix-g-v72rem-phase-41-email-domain}

email_loops_webhook_ingested email_loops_webhook_failed email_send_queued email_send_bounced email_send_complained email_send_suppressed

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

email_provider_unavailable email_provider_webhook_signature_invalid email_provider_event_duplicate email_residency_transport_unavailable

| `loops_provider_integration_contract_completeness` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/loops_provider_integration_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
