### 19.6.2 API, Event, and Atomicity Binding {#19.6.2-api-event-and-atomicity-binding}

Every mutation below writes exactly one AuditEvent (§4.6.1) using Appendix J `audit_event_action_type`.

`template.created`, `template.metadata_updated`, `template.update_available_received`, `template.update_applied`, `template.deleted`, `template.suggestion_submitted`, `workspace.created_from_template`, `workspace_template`, `workspace_template_version`, `workspace`.

#### `audit_event_action_type` - §19 Template Library additions

`template.created`, `template.metadata_updated`, `template.update_available_received`, `template.update_applied`, `template.deleted`, `template.suggestion_submitted`, `workspace.created_from_template`

entity_type = workspace_template
entity_type = workspace_template_version
entity_type = workspace

#### `audit_event_entity_type` - §19 Template Library additions

`workspace_template`, `workspace_template_version`

WorkspaceTemplate (§4.3.29)
WorkspaceTemplateVersion (§4.3.30)

| `workspace_template_audit_registry_consistency` | audit_registry_consistency | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_audit_registry_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | x | M02.3 |
