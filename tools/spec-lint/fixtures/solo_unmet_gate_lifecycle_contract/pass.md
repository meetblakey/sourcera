### 2.8.3.1 Unmet-Gate Audit, Delivery, Retention, and DSAR Contract {#2.8.3.1-unmet-gate-audit-delivery-retention-dsar}

**Authored Extension — requires human sign-off.**

`metadata.unmet_gates[]` contains only registered Appendix J gate identifiers and MUST NOT contain a `user_id`, email, display name, free text, response content, seller identifier, or vendor identifier.

The actions are **audit-only actions**, not individually subscribable webhook or Appendix C events. The `workspace.phase_advanced` webhook once, with `soft_gate_skip=true`, MUST NOT include `unmet_gate_ids[]`. A mode change emits no webhook.

Neither action creates a separate Appendix G / PostHog event. The generic phase projection MUST NOT carry `soft_gate_skip`, `unmet_gate_ids[]`, or `evaluation_owner_mode`.

The Team banner is a read-time, deduplicated projection. It has no independent persisted row. It handles loading, stale, error, and retry states.

Both records use 7-year AuditEvent retention and §6.8.4.1 Pattern B in Organization.data_residency_region; cross-region and cross-console reads fail closed.

## Appendix M.5

| `solo_unmet_gate_lifecycle_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/solo_unmet_gate_lifecycle_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
