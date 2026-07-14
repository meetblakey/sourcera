# FGA Scope Fixture

### Global Organization Roles

`org_owner`, `org_admin`, `billing_admin`, `member`, `guest`

### Workspace Roles

`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`

## 5.13 WorkOS FGA Custom Roles & Groups Integration

### 5.13.1 FGA Custom Role ↔ Sourcera Role Mapping

| Sourcera role enum | FGA `scope_type` | FGA scope target | Authority anchor |
| :---- | :---- | :---- | :---- |
| `org_owner`, `org_admin`, `member`, `billing_admin` | `organization` | the Sourcera Org | §5.2 |
| `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest` | `workspace` | the Workspace | §5.3 |
| `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_compliance_officer`, `seller_integrations_admin` | `organization` | the Seller Org | §5.5 |
| `seller_bid_captain`, `seller_bid_contributor`, `seller_guest` | `bid_workspace` | the Bid Workspace | §5.5 |
| `marketplace_publisher` | `organization` | the Seller Org | §5.6 |
| `marketplace_viewer` | `organization` | the Buyer Org | §5.6 |
| `marketplace_public_reader` | none — anonymous | none | §5.6 |
| `ops_*` roles | `platform` | the Sourcera platform | §50 |

## Appendix J: Enums

**`marketplace_role` enum.** `marketplace_publisher`, `marketplace_viewer`, `marketplace_public_reader`.

**`seller_workspace_role` enum.** `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_guest`.

**`ops_console_role` enum.** `ops_finance_admin`, `ops_break_glass_quorum_member`.

**`fga_custom_role_scope_type` enum.** `organization`, `workspace`, `bid_workspace`, `marketplace`, `platform`.

#### M.5.4 Catalog index {#m-5-4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `fga_custom_role_scope_canonical_consumer` | 3V+ | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/fga_custom_role_scope_canonical_consumer.ts`; verified PASS on live Master Spec and pass/fail fixtures) | Master Spec RBAC role-scope registry. | Roles map to Appendix J FGA scopes. | PR comment. | §5.13.1. |
