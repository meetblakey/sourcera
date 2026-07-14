## 5.4 Guest Role & Permission Profiles {#5.4-guest-role-and-permission-profiles-(gap-s-2)}

the non-Guest `defense_view_generate` role gate is `org_owner` only per the canonical §5.11 **Regenerate Defense View** row.

## 5.11 Feature Access Matrix {#5.11-feature-access-matrix-(comprehensive)}

**Header binding.** Org Owner → `org_owner`; Workspace Owner → `workspace_owner`; display labels do not define a competing RBAC vocabulary.

### 13.11.11 Plan Gating, Feature Access, and Object Size {#13.11.11-plan-gating-feature-access-and-object-size}

§5.11 **Open Defense View** row and §5.11 **Regenerate Defense View** row apply; §5.11 is the canonical role grid.

## 25.3 Disqualification {#25.3-disqualification-(gap-25.2)}

**Vendor Curation & Disqualification (§25.3)** applies. Buyer-plan availability is authoritative in §34.1.1.

## 27.2 Availability {#27.2-availability}

| Solo | Browse only (per §34.1.1) | Profile + Capability Declarations visible; Verified eligibility (per §34.1.2 Published Seller Profile and Verification Tier Cap) |

## Appendix M.5

| `feature_access_matrix_canonical_binding` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/feature_access_matrix_canonical_binding.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
