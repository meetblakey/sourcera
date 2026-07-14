### 6.8.4 DSAR Cascade Across Linked Entities {#6.8.4-dsar-cascade-across-linked-entities}

**Acceptance criteria.**

2. Every mutation made by the cascade worker MUST write a `dsar.cascade.row_redacted` AuditEvent with `entity_type`, `entity_id`, `redaction_path`, `actor_type=system_dsar_cascade_worker`, and `actor_id=dsar_cascade_worker_v1`.

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

- Cascade walker emits `dsar.cascade.row_redacted` with `redaction_path = pattern_a_fk_column_rewrite`.
- Cascade walker emits `dsar.cascade.row_redacted` with `redaction_path = pattern_b_fk_preservation_with_user_row_pseudonymization`.

## 29.7 Notification Failure Audit {#29.7-notification-failure-audit}

The retained failure row emits `dsar.cascade.row_redacted` with redaction path `notification_failure_audit_pseudonymized`.

### Appendix J Phase V9 Enums {#appendix-j-phase-v9-enums}

**DSAR AuditEvent Actor Types (D-3.5-015).** `system_dsar_cascade_worker` maps to `console=platform_system`, `user_id=NULL`, and event payload `actor_id=dsar_cascade_worker_v1`.

**`audit_event_payload_redaction_path` enum (D-3.5-015).** `pattern_a_fk_column_rewrite`, `pattern_b_fk_preservation_with_user_row_pseudonymization`, `pattern_a_in_json_value`, `notification_failure_audit_pseudonymized`.
