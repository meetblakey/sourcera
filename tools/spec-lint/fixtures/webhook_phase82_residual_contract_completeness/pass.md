# Pass

### 4.6.6 WebhookDeliveryFailure (Org-Scoped, Residency-Pinned DLQ Record)
`target_url_snapshot_sha256` `payload_ciphertext_ref` `webhook_delivery_failure_state` §40.2 row **WebhookDeliveryFailure**
Endpoint-cap authority and pooling; one Org-pooled endpoint set across both consoles.
10 seconds is measured wall-clock from the producer's first outbound packet.
DLQ recipient resolution uses `webhook.dlq.notification_dispatch_latency_seconds`.
## 31.7 Acceptance Criteria
QA test `webhook_event_id_unique_immutable`.
### 10.13.8 Selection Report Webhook Contract
`selection_report.draft_published` `selection_report.finalized`
`GET /v1/orgs/{org_id}/webhook-failures`
`POST /v1/orgs/{org_id}/webhook-failures/{failure_id}/retry`
`DELETE /v1/orgs/{org_id}/webhook-failures/{failure_id}`
JCS-canonicalized JSON request-body byte length before HTTP-level compression.
Sub-state transitions `under_review`, `review_due`, and `review_overdue` intentionally do not emit individual customer webhooks.
### L.19 WebhookDeliveryFailure State Machine
### L.20 AIWallet State Machine
#### M.5.85 v7.1.1 Phase 8.2 Webhook Residual Contract and Runtime Evidence additions
`webhook_phase82_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**
`numerical_singleton_webhook_endpoint_count` | numerical_singleton_invariant | **`runtime_active`**
`webhook_payload_no_selection_report_narrative` | webhook_catalog_consistency | **`runtime_active`**
`webhook_dlq_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`webhook_endpoint_pool_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m24_3`**
`webhook_dlq_observability_runtime_consistency` | synthetic_monitor | **`spec_binding_pending_pack_m21_3`**
`ai_wallet_state_machine_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**
