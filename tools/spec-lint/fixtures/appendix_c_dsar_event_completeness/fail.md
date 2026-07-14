# Appendix C DSAR Event Completeness Fail Fixture

### Phase 3V Audit-Remediation Events (2026-05-04) {#appendix-c-phase-3v-events}

| Event | Trigger |
| :---- | :---- |
| `dsar.acknowledged` | DSARRequest received |
| `dsar.fulfilled` | Fulfilled |
| `dsar.extension_granted` | Extension granted |
| `dsar.cascade.partial_failure` | Partial failure |
| `dsar.rejected_manifestly_unfounded` | Rejected |
| `dsar.export.ready` | Export ready |
| `dsar.verification_failed` | Verification failed |
| `dsar.cascade.long_tail_started` | Long tail |
| `dsar.cascade.row_redacted` | Row redacted |
| `dsar.audit_integrity_exemption_invoked` | Exemption invoked |
| `dsar.audit_integrity_exemption_violation` | Exemption violation |

### Phase V9 Audit-Remediation Events (2026-05-09) {#appendix-c-phase-v9-events}

| Event | Trigger |
| :---- | :---- |
| `dsar.cascade.aggregate_recompute_required` | Required |
| `dsar.cascade.aggregate_recompute_completed` | Completed |
| `dsar.cascade.bridge_body_pii_swept` | Swept |
| `dsar.cascade.backup_repseudonymization_required` | Required |
| `dsar.cascade.backup_repseudonymization_completed` | Completed |
| `dsar.cascade.aggregate_recompute_failed` | Failed |
| `dsar.cascade.body_pii_sweep_failed` | Failed |
| `dsar_cascade_administratively_closed` | Closed |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `dsar_acknowledged` | Mirror | `source_webhook_event_type='dsar.acknowledged'` |
| `dsar_fulfilled` | Mirror | `source_webhook_event_type='dsar.fulfilled'` |
| `dsar_extension_granted` | Mirror | `source_webhook_event_type='dsar.extension_granted'` |
| `dsar_cascade_partial_failure` | Mirror | `source_webhook_event_type='dsar.cascade.partial_failure'` |
| `dsar_rejected_manifestly_unfounded` | Mirror | `source_webhook_event_type='dsar.rejected_manifestly_unfounded'` |
| `dsar_export_ready` | Mirror | `source_webhook_event_type='dsar.export.ready'` |
| `dsar_verification_failed` | Mirror | `source_webhook_event_type='dsar.verification_failed'` |
| `dsar_cascade_long_tail_started` | Mirror | `source_webhook_event_type='dsar.cascade.long_tail_started'` |
| `dsar_cascade_row_redacted` | Mirror | `source_webhook_event_type='dsar.cascade.row_redacted'` |
| `dsar_audit_integrity_exemption_invoked` | Mirror | `source_webhook_event_type='dsar.audit_integrity_exemption_invoked'` |
| `dsar_audit_integrity_exemption_violation` | Mirror | `source_webhook_event_type='dsar.audit_integrity_exemption_violation'` |
| `dsar_sla_window_breached` | Worker breach | `request_id` |
| `dsar_export_downloaded` | Audit mirror | `request_id` |
| `dsar_cascade_aggregate_recompute_required` | Mirror | `source_webhook_event_type='dsar.cascade.aggregate_recompute_required'` |
| `dsar_cascade_aggregate_recompute_completed` | Mirror | `source_webhook_event_type='dsar.cascade.aggregate_recompute_completed'` |
| `dsar_cascade_bridge_body_pii_swept` | Mirror | `source_webhook_event_type='dsar.cascade.bridge_body_pii_swept'` |
| `dsar_cascade_backup_repseudonymization_required` | Mirror | `source_webhook_event_type='dsar.cascade.backup_repseudonymization_required'` |
| `dsar_cascade_backup_repseudonymization_completed` | Mirror | `source_webhook_event_type='dsar.cascade.backup_repseudonymization_completed'` |
| `dsar_cascade_aggregate_recompute_failed` | Mirror | `source_webhook_event_type='dsar.cascade.aggregate_recompute_failed'` |
| `dsar_cascade_body_pii_sweep_failed` | Mirror | `source_webhook_event_type='dsar.cascade.body_pii_sweep_failed'` |
| `dsar_cascade_administratively_closed` | Mirror | `source_webhook_event_type='dsar_cascade_administratively_closed'` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Phase V9 Spec-Side Remediation Enum Registrations (2026-05-09) {#appendix-j-phase-v9-enums}

**DSAR Lifecycle Event Action Types.** `dsar.verification_failed`, `dsar.rejected_manifestly_unfounded`, `dsar.cascade.residency_violation_blocked`, `dsar.cascade.cross_region_dpo_approval_required`, `dsar.cascade.long_tail_started`, `dsar.cascade.row_redacted`, `dsar.cascade.partial_failure`, `dsar.audit_integrity_exemption_invoked`, `dsar.audit_integrity_exemption_violation`, `dsar.export.downloaded`.
