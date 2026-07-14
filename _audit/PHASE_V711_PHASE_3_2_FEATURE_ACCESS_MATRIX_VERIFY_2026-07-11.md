# v7.1.1 Phase 3.2 Feature-Access Matrix Verification

**Date:** 2026-07-11  
**Defects:** D-3.2-024 through D-3.2-029  
**Verdict:** PASS — two P2 and four P3 documentation rows closed; no runtime promotion.

## Conflict and resolution

§5.4 said `defense_view_generate` was Workspace Owner-only while the §5.11 canonical buyer role grid allowed only `org_owner`. §13.11 called the actor an operator without naming the controlling role row.

§5.11 is explicitly the canonical buyer-console role grid. Its Org Owner-only **Regenerate Defense View** row controls. §5.4 now limits its statement to Guest denial and cites that row; §13.11.11 binds the separate Open and Regenerate rows. No entitlement or runtime behavior changed.

The same pass binds Title-Case §5.11 headers to Appendix J enums, normalizes §25.3 to the actual **Vendor Curation & Disqualification (§25.3)** group, and adds the §27.2 Solo marketplace summary row. The filed comprehensive-matrix concern is stale because its V3 missing rows and overlays are present.

## Recurrence guard

`feature_access_matrix_canonical_binding` passes against the Master Spec and its positive fixture; its negative fixture fails on missing role mappings, stale Defense View authority, stale Disqualification group naming, or missing Solo Marketplace summary. It is a `runtime_active` static documentation guard only.

RBAC evaluation, entitlement checks, Marketplace rendering, and Defense View regeneration remain product-pack evidence. No pending §M.5 runtime row was relabelled.
