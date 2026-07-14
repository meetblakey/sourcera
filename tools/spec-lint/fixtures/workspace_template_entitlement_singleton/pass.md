# WorkspaceTemplate Entitlement Singleton Pass Fixture

### 19.6.1 Template Storage

Template Library is a universal buyer-console capability. Custom template authoring / sharing entitlements are canonical in §34.1.1 cell **Custom Templates (author / share)** and enforced by the §5.11 Template Library row group. §19 does not restate per-tier values. On downgrade to a plan where the §34.1.1 cell removes author / share availability, existing WorkspaceTemplate rows remain active and readable.

| **Template Library (§19; buyer-console WorkspaceTemplate, plan-gated per §34.1.1 cell Custom Templates)** | | |

| **Custom Templates (author / share)** | Read-only | Read-only | Unlimited author/share of WorkspaceTemplate rows (§4.3.29) | Unlimited author/share | Unlimited author/share | Unlimited author/share | AE; source for §19.6.1 and §5.11 Template Library row group |

| `workspace_template_entitlement_singleton` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_entitlement_singleton.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
