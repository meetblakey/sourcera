# Test

## Appendix K: Glossary

**Workspace Owner** (`workspace_owner`). Workspace-scoped Buyer Console role. See §5.3, §5.11, and Appendix J `workspace_role_kind`.

**Workspace Admin** (`workspace_admin`). Workspace-scoped Buyer Console role. See §5.3, §5.11, and Appendix J `workspace_role_kind`.

**Use Case Lead** (`use_case_lead`). Workspace-scoped Buyer Console role. See §5.3, §5.11, and Appendix J `workspace_role_kind`.

**Reviewer** (`reviewer`). Workspace-scoped Buyer Console role. See §5.3, §5.11, and Appendix J `workspace_role_kind`.

**Workspace Guest** (`guest`). Workspace-scoped Buyer Console role. See §5.3, §5.11, and Appendix J `workspace_role_kind`.

**Evaluation Lead (retired alias).** Retired pre-V3 name for `workspace_admin`. Historical references resolve through §5.3 and Appendix J `workspace_role_kind`.

**Evaluator (retired alias).** Retired pre-V3 name for `use_case_lead`. Historical references resolve through §5.3 and Appendix J `workspace_role_kind`.

**Scorer (retired alias).** Retired pre-V3 name for `reviewer`. Historical references resolve through §5.3 and Appendix J `workspace_role_kind`.

**Seller Org Owner** (`seller_org_owner`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Org Admin** (`seller_org_admin`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Billing Admin** (`seller_billing_admin`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Marketing Editor** (`seller_marketing_editor`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller KB Admin** (`seller_kb_admin`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller KB Editor** (`seller_kb_editor`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller KB Viewer** (`seller_kb_viewer`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Bid Captain** (`seller_bid_captain`). Bid-Workspace-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Bid Contributor** (`seller_bid_contributor`). Bid-Workspace-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Compliance Officer** (`seller_compliance_officer`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Integrations Admin** (`seller_integrations_admin`). Org-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Seller Guest** (`seller_guest`). Bid-Workspace-scoped Seller Console role. See §5.5, §5.11, and Appendix J `seller_workspace_role`.

**Bid Owner (retired alias).** Retired pre-V3 name for `seller_bid_captain`. Historical references resolve through §5.5 and Appendix J `seller_workspace_role`.

**Bid Contributor (retired alias).** Retired pre-V3 name for `seller_bid_contributor`. Historical references resolve through §5.5 and Appendix J `seller_workspace_role`.

**Bid Viewer (retired alias).** Retired pre-V3 name for `seller_kb_viewer`. Historical references resolve through §5.5 and Appendix J `seller_workspace_role`.

**Marketplace Publisher** (`marketplace_publisher`). Seller-Org-scoped Marketplace role. See §5.6, §5.11, and Appendix J `marketplace_role`.

**Marketplace Viewer** (`marketplace_viewer`). Authenticated buyer-Org Marketplace role. See §5.6, §5.11, and Appendix J `marketplace_role`.

**Marketplace Public Reader** (`marketplace_public_reader`). Synthetic unauthenticated Marketplace role. See §5.6, §5.11, and Appendix J `marketplace_role`.

#### M.5.43 v7.2.0-REM Phase 3.1 Role Glossary P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `role_glossary_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/role_glossary_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every canonical §5 role enum in Appendix J `workspace_role_kind`, `seller_workspace_role`, and `marketplace_role` MUST resolve to an Appendix K role glossary entry with scope, canonical enum value, and §5 / §5.11 cross-reference; retired pre-V3 aliases MUST resolve to a retired-alias entry or explicit §5 canonicality note. | M02.3 |
