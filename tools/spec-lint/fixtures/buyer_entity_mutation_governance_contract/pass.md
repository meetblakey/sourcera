### 4.3.1 Workspace (Console-Scoped, Buyer)
`updated_by` | UUID (FK). Workspace updates MUST advance `updated_at` and `updated_by`.
### 4.3.2 Workspace Membership (Console-Scoped, Buyer)
`created_by` | UUID (FK). `updated_by` | UUID (FK). `updated_at` | Timestamp | Auto-updated.
### 4.3.3 Use Case (Console-Scoped, Buyer)
**Indexes.** Workspace soft-delete cascades `deleted_at` to the Use Case.
### 4.3.5 Response (Console-Scoped, Buyer)
`updated_by` | UUID (FK). **Indexes.** **Retention, DSAR, and residency.**
### 4.3.10 Evaluation Pulse Event (Console-Scoped, Buyer)
**Attribution Convention Exception.** no `updated_by` exists because correction requires a new event. **Indexes.** **Retention, DSAR, and residency.**
### 4.3.13 Internal Comment Mention (Workspace-Scoped, Buyer-Only)
`updated_by` | UUID (FK). `updated_at` | Timestamp | Auto-updated.
### 4.3.19 Time-Saved Credit (Org-Scoped, Cross-Console, Computed)
`created_by` | UUID (FK). `updated_by` | UUID (FK).
## 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}
Pattern B on `created_by`, `updated_by` | Body content scanned. Pattern B on `scorer_id`, `created_by`, `updated_by`. Pattern B on `created_by` | Hard-delete pulse rows.
## Appendix M.5
| `buyer_entity_mutation_governance_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/buyer_entity_mutation_governance_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
