## 4.2.1 Organization (Org-Scoped) {#4.2.1-organization-org-scoped}

authorization and plan gating always resolve the canonical per-console plan fields, never a snapshot.
`max_workspaces` for `console_modes_active = both` equals the Buyer **Active Evaluations (concurrent)** ceiling plus the Seller **Bid Workspace Access — concurrent** ceiling
`max_members` is NULL for every current plan
`max_req_per_workspace` is the Buyer ceiling when the Buyer console is active and NULL otherwise
`max_kb_entries` is the Seller ceiling when the Seller console is active and NULL otherwise

#### 4.2.1.2 Plan-Tier Split Migration Contract (Authored Extension — requires human sign-off) {#4.2.1.2-plan-tier-split-migration-contract}

Authored Extension — requires human sign-off
| `free` | `buyer_free` | `seller_free` |
| `business` | `business_growth` | `seller_growth` |
| `enterprise` | `buyer_enterprise` | `seller_enterprise` |
No product read path may mutate Organization plan fields. `action=org.plan_tier_split_migrated` performs no Stripe action, and no entitlement change. The worker runs only in the Organization residency partition.

### 32.8.15 Plan Change {#32.8.15-post-plan-change}

`plan_tier_split_migration_incomplete`: no plan, Stripe, entitlement, or snapshot mutation occurs.

### 4.2.3 User (Global) {#4.2.3-user-global}

`role_context` | JSON \| NULL. It is never an RBAC or entitlement source of truth.

#### 4.2.3.2 Role Cache (Authored Extension — requires human sign-off) {#4.2.3.2-role-context-cache-contract}

Authored Extension — requires human sign-off. §4.2.2 OrgMembership is the sole role authority, capped at 16 entries. Any OrgMembership create, role change, SCIM-derived role change, or revocation locks the User row in the same transaction. It is never copied into audit, webhook, Console Bridge, analytics, logs, or customer responses. DSAR / account deletion clears the entire field. There is no customer API field, mobile control, empty state, loading state, or retry affordance for this cache.

### Billing Admin Audit Action Types {#billing-admin-audit-action-types}

`org.plan_tier_split_migrated`

## Appendix M.5

| `organization_plan_state_integrity_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/organization_plan_state_integrity_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
