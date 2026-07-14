# WorkspaceTemplate Entity Contract Pass Fixture

## 2.7 Template Design Framework {#2.7-template-design-framework}

Templates authored under this framework are stored and versioned through §19 Template Library using WorkspaceTemplate (§4.3.29) and WorkspaceTemplateVersion (§4.3.30).

Use Sourcera's Template Builder to auto-generate RFP from requirements.

Applying a new Sourcera-provided RFI / RFP / Use Case Bundle version MUST follow §19.2.2: existing Workspaces remain pinned to their original WorkspaceTemplateVersion, and only newly-created Workspaces or explicit Apply Update flows consume the new version.

### 4.3.1 Workspace (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Required | |
| `source_workspace_template_id` | UUID | Nullable | |
| `source_workspace_template_version_id` | UUID | Nullable | |

### 4.3.29 WorkspaceTemplate (Org-Scoped, Buyer Console) {#4.3.29-workspacetemplate}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | `buyer` fixed | |
| `source` | Enum | Required | |
| `template_library_entry_id` | UUID | Nullable | |
| `current_version_id` | UUID | Nullable | |
| `name` | String | Required | |
| `description_markdown` | String | Nullable | |
| `kind` | Enum | Required | |
| `category` | Enum | Required | |
| `icon_token` | String | Required | |
| `color_token` | String | Required | |
| `update_state` | Enum | Required | |
| `latest_available_version_label` | String | Nullable | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope isolation.** Buyer-console scoped.
**Required indexes.** `(org_id, source, deleted_at)`.
**Retention, DSAR, and residency.** Retention follows §40.2. DSAR follows §6.8.4. Residency follows Organization.`data_residency_region`.
**Acceptance criteria.**

### 4.3.30 WorkspaceTemplateVersion (Org-Scoped, Buyer Console) {#4.3.30-workspacetemplateversion}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | `buyer` fixed | |
| `template_id` | UUID | Required | |
| `version_label` | String | Required | |
| `version_bump_kind` | Enum | Required | |
| `status` | Enum | Required | |
| `source_version_id` | UUID | Nullable | |
| `superseded_by_version_id` | UUID | Nullable | |
| `content_snapshot_json` | JSONB | Required | |
| `changelog_md` | String | Nullable | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

**Scope isolation.** Inherits WorkspaceTemplate.
**Required indexes.** `(template_id, version_label)`.
**Retention, DSAR, and residency.** Retention follows §40.2. DSAR follows §6.8.4. Residency follows Organization.`data_residency_region`.
**State machine.**
**Acceptance criteria.**

## 19.1 Overview {#19.1-overview}

The persisted buyer-console data model is WorkspaceTemplate (§4.3.29) plus WorkspaceTemplateVersion (§4.3.30); TemplateLibraryEntry (§4.4.28) is the separate marketplace-domain template concept.

### 19.1.1 Console Scoping {#19.1.1-console-scoping}

Workspace Templates are buyer-console scoped. Seller-console users have no access to the §19 Template Library; seller-console reads return HTTP 404. Cross-org reuse is not direct sharing of WorkspaceTemplate rows.

## 19.5 Template-to-Workspace Flow {#19.5-template-to-workspace-flow}

Workspace.`source_workspace_template_id` and Workspace.`source_workspace_template_version_id` are stamped. The Workspace is a snapshot.

| `workspace_template_entity_contract_completeness` | data_model_contract | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_entity_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
