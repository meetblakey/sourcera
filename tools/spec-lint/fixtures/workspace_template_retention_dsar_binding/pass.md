# WorkspaceTemplate Retention DSAR Pass Fixture

### 4.3.29 WorkspaceTemplate (Org-Scoped, Buyer Console) {#4.3.29-workspacetemplate}

**Retention, DSAR, and residency.** Retention follows §40.2. `created_by` and `updated_by` pseudonymize under §6.8.4 Pattern B. Template name / description participate in §6.8.4.5 PII sweep. Residency follows Organization.`data_residency_region`; downgrade never deletes templates.

### 4.3.30 WorkspaceTemplateVersion (Org-Scoped, Buyer Console) {#4.3.30-workspacetemplateversion}

**Retention, DSAR, and residency.** Inherits parent WorkspaceTemplate retention. `content_snapshot_json` / `changelog_md` participate in §6.8.4.5 body-field sweep. Residency follows Organization.`data_residency_region`.

### 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}

| Entity | Name | Class | Pattern | Notes |
|---|---|---|---|---|
| §4.3.29 | WorkspaceTemplate | 4 | Pattern B on `created_by`, `updated_by`; body-field sweep on `name` / `description_markdown` | Buyer-console Org template metadata. |
| §4.3.30 | WorkspaceTemplateVersion | 4 | Pattern B on `created_by`, `updated_by`; body-field sweep on `content_snapshot_json` / `changelog_md` | Version snapshots. |

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Entity | Rule |
|---|---|
| **WorkspaceTemplate / WorkspaceTemplateVersion (§4.3.29 / §4.3.30)** | Soft-deleted template rows remain recoverable for 30 days. Workspace.`source_workspace_template_id` / `source_workspace_template_version_id` audit replay is preserved. Plan downgrade does not delete or hide rows. §34.1.1 cell **Custom Templates (author / share)** is canonical. template body fields are swept per §6.8.4.5. Residency follows Organization.`data_residency_region`. |

| `workspace_template_retention_dsar_binding` | retention_privacy_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_retention_dsar_binding.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
