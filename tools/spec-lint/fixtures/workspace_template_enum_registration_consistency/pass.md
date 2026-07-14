# WorkspaceTemplate Enum Registration Pass Fixture

## 2.7 Template Design Framework {#2.7-template-design-framework}

WorkspaceTemplate.`kind` uses Appendix J `workspace_template_kind`.

### 4.3.29 WorkspaceTemplate (Org-Scoped, Buyer Console) {#4.3.29-workspacetemplate}

Uses Appendix J `workspace_template_source`, Appendix J `workspace_template_kind`, Appendix J `workspace_template_category`, and Appendix J `workspace_template_update_state`.

### 4.3.30 WorkspaceTemplateVersion (Org-Scoped, Buyer Console) {#4.3.30-workspacetemplateversion}

Uses Appendix J `workspace_template_version_bump_kind` and Appendix J `workspace_template_version_status`.

## 19.2 Sourcera-Provided Templates {#19.2-sourcera-provided-templates}

Sourcera templates use Appendix J `workspace_template_kind`, Appendix J `workspace_template_category`, and version_bump_kind.

## 19.4 Template Library UI {#19.4-template-library-ui}

Cards render Appendix J `workspace_template_kind` display label. Source badges derive from Appendix J `workspace_template_source`. Filters use Appendix J `workspace_template_source` and `workspace_template_category` display labels.

#### `workspace_template_source` (§4.3.29, §19)

`sourcera_provided`, `org_custom`

#### `workspace_template_category` (§4.3.29, §19)

`security`, `compliance`, `operations`, `cloud_infrastructure`, `data_privacy`, `finance_billing`, `customer_support`, `integration_api`, `custom`

#### `workspace_template_kind` (§2.7, §4.3.29, §19)

`use_case_bundle`, `rfi`, `rfp`

#### `workspace_template_update_state` (§4.3.29, §19)

`current`, `update_available`, `update_applied`, `update_dismissed`

#### `workspace_template_version_bump_kind` (§4.3.30, §19)

`patch`, `minor`, `major`

#### `workspace_template_version_status` (§4.3.30, §19)

`active`, `superseded`, `deprecated`

| `workspace_template_enum_registration_consistency` | enum_catalog_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_enum_registration_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
