# Fixture

## 5.3 Console-Level Roles (Buyer Console) {#5.3-console-level-roles-(buyer-console)}

| Role (canonical enum) | Scope |
|---|---|
| `workspace_owner` | Workspace |
| `workspace_admin` | Workspace |
| `use_case_lead` | Workspace |
| `reviewer` | Workspace |
| `guest` | Workspace |

## 5.5 Console-Level Roles (Seller Console) {#5.5-console-level-roles-(seller-console)}

| Role (canonical enum) | Scope |
|---|---|
| `seller_org_owner` | Org |
| `seller_org_admin` | Org |
| `seller_billing_admin` | Org |
| `seller_marketing_editor` | Org |
| `seller_kb_admin` | Org |
| `seller_kb_editor` | Org |
| `seller_kb_viewer` | Org |
| `seller_bid_captain` | Bid Workspace |
| `seller_bid_contributor` | Bid Workspace |
| `seller_compliance_officer` | Org |
| `seller_integrations_admin` | Org |
| `seller_guest` | Bid Workspace |

## 5.6 Marketplace Roles {#5.6-marketplace-roles}

| Role (canonical enum) | Scope |
|---|---|
| `marketplace_publisher` | Seller Org |
| `marketplace_viewer` | Buyer Org |
| `marketplace_public_reader` (synthetic) | Public |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Workspace Roles

`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`

**`marketplace_role` enum.** `marketplace_publisher`, `marketplace_viewer`, `marketplace_public_reader`.

**`seller_workspace_role` enum.** `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_guest`.
