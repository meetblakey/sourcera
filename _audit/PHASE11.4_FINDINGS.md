# Phase 11.4 — Surface/Engine Cross-Reference Audit (Scratch Log)

**Phase prompt:** `Audit_Prompts.md` → Prompt 11.4 (Surface/Engine Cross-Reference Audit, lines 2488–2506).
**Scope:** Coverage trace joining `_audit/FEATURE_INVENTORY.md` (898 F-* feature rows; 72 of those F-AE-*) against Master Spec Appendix M.1 (327 mapping rows over lines 49004–49371) against Master Spec Appendix M.5 (103 CI-gate rows over lines 49444–49563) against `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (218 AE-* row identifiers, deduplicated).
**Defect-ID convention:** `D-11.4-NNN` (sequential per Defect Ledger format).
**Severity-rule application:** P0 reserved for `Audit_Prompts.md` Severity Rules (a)–(e); P1 for "feature unbuildable as written: missing M.1 row" per the Phase 11.4 prompt's own missing-link rule; P2 for ambiguity that two staff engineers would resolve differently; P3 for cosmetic / hygiene drift.
**Pre-edit backup:** Non-destructive audit pass; no Master Spec edits performed; no `legacy-import:_versions/` snapshot required.
**Self-challenge revisions:** Three — logged at §6 below.
**Counterfactual pass:** Logged at §7 below.
**Trace artifact:** `_audit/SURFACE_ENGINE_TRACE.md` (1,500+ lines; per-family trace tables for every F-* feature; AE Authored Extension trace; coverage gap inventory; cross-reference to prior phase findings).

---

## 1. Sources Read End-to-End

- Master Spec Appendix M preamble (lines 48994–48999); Appendix M.1 in full (lines 49000–49371; 327 data rows + 23 area-header rows); Appendix M.2 Process Gates (lines 49373–49389); Appendix M.3 Authored Extension Note (lines 49391–49393); Appendix M.4 CI Gate specification (lines 49395–49432); Appendix M.5 CI Gate Catalog (lines 49434–49572).
- Master Spec line 49575 (v7.1.0 stamp terminator) for catalog-completeness boundary.
- `_audit/FEATURE_INVENTORY.md` — 898 F-* rows extracted programmatically. Feature_class breakdown: 356 engine_concept / 185 platform_mechanic / 127 user_capability / 101 surface / 44 pricing_primitive / 42 growth_mechanic / 26 api_surface / 17 integration_surface. Origin doc breakdown: 839 master_spec / 28 ux_design / 11 seller_pricing / 10 kb_eng (retired) / 10 buyer_pricing. Version breakdown: 376 v6.0.0 / 354 v7.0.0 / 109 v7.1.0 / 28 v2.0.0 (UX) / 21 v3 (Pricing) / 10 retired-2026-04-26 (KB Eng).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — 218 AE-* row identifiers extracted programmatically. Family breakdown (top): 17 PH6R; 14 each in {12.4, 12.3, 13}; 13 in 12.1; 12 each in {D1V, 14.9}; 10 each in {V7, 3.5, 14.8}; etc.
- `_audit/PHASE11.1_FINDINGS.md` in full — Phase 11.1 §M.1 walk; D-11.1-001 through D-11.1-010 cluster-level filings; inherited as Phase 11.4 prerequisite.
- `_audit/PHASE11.2_FINDINGS.md` in full — Phase 11.2 §M.4 walk; D-11.2-001 through D-11.2-022; inherited as Phase 11.4 prerequisite for M.4 gate enforcement context.
- `_audit/PHASE11.3_FINDINGS.md` in full — Phase 11.3 §M.5 walk; D-11.3-001 through D-11.3-013; inherited as Phase 11.4 prerequisite for M.5 catalog context.
- `_audit/DEFECT_LEDGER.md` header (row format, severity definitions) + Phase 11.1 / 11.2 / 11.3 sections.
- `Audit_Prompts.md` Prompt 11.4 (lines 2488–2506) + Global Conventions Preamble (lines 117–242) + Defect Ledger Format (lines 49–68) + Severity Definitions (lines 72–83).
- `CLAUDE.md` §13 Operational Rules (especially rule 4 on Authored Extension flagging) and §16 Known Drift entries.

## 2. Check-by-Check Disposition

| Prompt Check | Disposition |
| :---- | :---- |
| 1. For every feature in FEATURE_INVENTORY.md, populate the trace: feature → primary § anchor → Appendix M.1 row → Appendix M.5 gate → AUTHORED_EXTENSIONS_LEDGER row (if applicable). | ✅ Completed. Trace populated at row-level fidelity in `_audit/SURFACE_ENGINE_TRACE.md` §3 per-family tables (66 family sections covering 898 F-* rows). M.1 join: 316 ✅ / 190 ⚠ / 392 ❌. M.5 join: 41 ✅ / 20 ⚠ / 837 ❌ (by-design + Phase 11.3 inherited). AE join (72 F-AE-* rows): 71 ✅ / 1 mis-classified (`F-AE-016` = BC row). |
| 2. Missing links filed as P1 defects (surface_engine_mapping or ci_gate or authored_extension). | ✅ Completed with the qualification that Phase 11.1 / 11.3 already filed cluster-level defects for the surface-class M.1 misses (D-11.1-001..D-11.1-008) and the M.5 catalog misses (D-11.3-002 et al.). Phase 11.4 nets out: **D-11.4-001 (P1 surface_engine_mapping)** for the 135 engine-concept-class M.1 misses (row-level supplement to Phase 11.1's cluster filings); **D-11.4-002 (P3 authored_extension)** for the F-AE-016 mis-classification; **D-11.4-003 (P2 surface_engine_mapping)** for the M.1 schema gap on companion-doc anchors; **D-11.4-004 (P2 ci_gate)** for the missing row-class taxonomy on §M.5. |
| Output 1: defect ledger entries. | ✅ Filed in `_audit/DEFECT_LEDGER.md` under the new section `## Phase 11.4 — Surface/Engine Cross-Reference Audit (2026-05-11)`. |
| Output 2: coverage-trace artifact at `_audit/SURFACE_ENGINE_TRACE.md`. | ✅ Written. 1,500+ lines covering Methodology / Coverage Headline / Per-Family Trace Tables (66 family sections) / F-AE Authored Extension Trace / Coverage Gap Inventory / Net-New Defects / Cross-Reference to Prior Phase Findings / Self-Challenge / Counterfactual / Reverse Pass / Trace Summary. |

## 3. Defect Inventory

| Defect | Severity | Class | Scope summary |
| :---- | :---- | :---- | :---- |
| D-11.4-001 | P1 | surface_engine_mapping | 135 engine-concept-class features have no Appendix M.1 row; row-level supplement to Phase 11.1's cluster-level filings. |
| D-11.4-002 | P3 | authored_extension | `F-AE-016` is a Breaking Change mis-classified as an Authored Extension; inventory-hygiene defect. |
| D-11.4-003 | P2 | surface_engine_mapping | Appendix M.1 schema admits only Master Spec section anchors as `Spec home` cells; ~50 companion-doc engine concepts cannot resolve. |
| D-11.4-004 | P2 | ci_gate | Appendix M.5 catalog lacks a row-class taxonomy distinguishing per-feature gates from cross-feature invariants from spec-tree gates. |

## 4. Trace Methodology — Anchor Join Discipline

Each F-* feature's `primary_section_anchor` was normalized to an anchor token via a regex extraction of the leading `§N(.M(.P(.Q)?)?)?` form (or `Appendix X(.N)?` for appendix-anchored features). The most-specific token was then walked up its parent ladder (`§N.M.P → §N.M → §N`) and compared against an inverted index of every Appendix M.1 `Spec home` cell's anchor tokens (491 unique anchor occurrences over 327 rows). The same parent-walk was applied against the Appendix M.5 `Authority anchor` cell index (125 unique anchor occurrences over 103 gate rows).

Match levels:
- **Direct ✅** — the feature's primary anchor token matches an M.1 / M.5 anchor cell token verbatim.
- **Family ⚠** — only a parent anchor matches; the feature's specific subsection is not directly cited but an ancestor section is.
- **Missing ❌** — neither the feature anchor nor any ancestor appears in any M.1 / M.5 anchor cell.

For F-AE-* rows the AE-* identifier was regex-extracted from `feature_name` (`AE-[A-Za-z0-9.+-]+`) and compared against the canonical 218-identifier set in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

## 5. Pre-Existing Coverage Gaps Surfaced by the Trace (Not Net-New)

Per Phase 11.4 prompt's missing-link rule but already filed at Phase 11.1 / 11.2 / 11.3 cluster granularity:

- 62 surface-class M.1 misses (already filed D-11.1-001 through D-11.1-007 by cluster).
- 13 spec-body Appendix M.5 cross-references resolving to empty catalog space (already filed D-11.3-002 P0).
- §M.5 per-row runtime_status column absence (already filed D-11.3-001 P0).
- §M.4 / §M.5 schema and anchor hygiene (D-11.2-001..022, D-11.3-006..013).

Phase 11.4 explicitly does NOT duplicate these. The trace tables at `_audit/SURFACE_ENGINE_TRACE.md` §3 mark every affected row by the inherited defect; the cross-reference matrix at §7 of the trace artifact enumerates each inheritance.

## 6. Self-Challenge Pass

Hostile staff engineer re-read of the four net-new defects.

**D-11.4-001 — challenged for double-counting Phase 11.1.** Rejected. D-11.1-001..D-11.1-008 enumerate surface-class M.1 misses (62 features). D-11.4-001 enumerates engine-concept-class misses (135 features). The two sets are disjoint on feature_class — confirmed by the join arithmetic at `_audit/SURFACE_ENGINE_TRACE.md` §5.2. Phase 11.1's prompt explicitly scoped to `feature_class = surface`; Phase 11.4 is the first row-level enumeration of the engine-concept-class misses. Severity holds at P1.

**D-11.4-003 — challenged for inventing a schema requirement.** Partly conceded. The M.1 schema admits free-text `Spec home` cells; there is no formal prohibition on companion-doc citation. However, the existing M.1 row set contains exactly ONE companion-doc anchor (`UX Design §Patterns.Navigation` at line 49301), demonstrating that the convention as practiced is `Master Spec` anchors only. D-11.4-003 is therefore a P2 (not P1) — the schema admits the extension but no convention authorizes it. Severity dropped to P2 (originally drafted as P1 during initial filing).

**D-11.4-004 — challenged as documentation request, not defect.** Partly conceded. The 452 "M.5 ❌" features are not all broken; the catalog is forward-reference-shaped. But the inability to distinguish per-feature-gate from cross-feature-invariant-gate from spec-tree-gate from the catalog alone materially affects which gates must be retro-authored during M02.3 / M11.3 / M21.3 / M24.3 implementation packs. The taxonomy is a buildability requirement, not just hygiene. Severity held at P2 (originally drafted as P1).

## 7. Counterfactual Pass

Three realistic failure modes the trace must accommodate.

**Failure mode 1: A new engine concept is authored in §22.20 (Seller Maya) but neither D-11.4-001 nor M.4 `appendix_m_coverage_on_diff` catches it.** D-11.4-001 enumerates the current backlog; the M.4 gate (Phase 11.2 finding) prevents future drift. Both must hold. If M.4 is not yet runtime-active (CLAUDE.md §16: "§M.4 CI gate is active; §M.5 runtime wiring is partial"; Phase 11.2 D-11.2-022: "runtime-status contradiction"), then drift is currently caught only by code-review discipline. ✅ Trace records the dependency on D-11.2-022 resolution.

**Failure mode 2: A feature is correctly internal-only (Appendix L state machine, §47 versioning concept) but D-11.4-001 flags it as missing surface_engine_mapping.** `_audit/SURFACE_ENGINE_TRACE.md` §5.2 triage addresses this — ~30 of the 135 engine-concept misses are Appendix-internal or §47-versioning rows that, when authored an M.1 row, should be flagged `Internal-only, never surfaced`. The defect is the missing row, not the missing surface metaphor. ✅ Trace draws the distinction.

**Failure mode 3: A companion-doc feature (UX_Design or KB Eng) is genuinely the source of truth for a surface contract, and Master Spec §3 only ground-truths it.** This is exactly the §22.20.x Seller Maya pattern — the UX_Design `§5.2.19 PipelineSurface` component is the authoritative surface authoring; Master Spec §3.14 is the engine binding. The M.1 row at line 49011 cites both anchors via the `UX_Design_of_Sourcera.md §5.2.19` pointer inside its Notes cell. The current pattern (Notes-cell cross-reference) is the de-facto convention; D-11.4-003 formalizes the convention rather than inventing a new one. ✅ Trace acknowledges existing practice.

## 8. Reverse Pass

For every Appendix M.5 gate (103 catalog rows), confirm an inventory feature row exists.

- **40 of 103 gate rows** are themselves feature inventory rows (F-797 through F-836 catalog, per Phase 0.2 inventory convention).
- **63 of 103 gate rows** are V9 / 3V+ / V8.4 / V9 / Phase 2V / Phase 3V / Phase 14.x audit-remediation gates that bind to spec-tree contracts rather than to customer-facing features. These appear in `_audit/COVERAGE_MATRIX.md` under the `ci_gate_coverage` column for the features they enforce, not as standalone F-* rows.
- **0 orphan gates.** Every cataloged §M.5 row maps either to a feature inventory row or to a spec-tree invariant.

However, the reverse pass surfaces one inherited gap: the 13 spec-body `Appendix M.5 \`<gate>\`` references that resolve into empty catalog space (Phase 11.3 D-11.3-002) are referenced FROM feature-bearing sections (§22.4.4 `kb_bootstrap_per_org_concurrency_lock_active` → F-352 KB Bootstrap; §48.8.10 `bid_disqualification_cascade_active` → F-572 / F-573 disqualification; §34.18.x cost-base gates → F-512 / F-513). These features carry M.5 ❌ in the trace tables that hide the underlying defect. When reading §3 of the trace artifact, cross-reference Phase 11.3 §4 for the 13 promised-but-uncatalogued gates.

## 9. Severity Roll-Up

0 P0 / 1 P1 / 2 P2 / 1 P3 = 4 net-new defects. The P1 (D-11.4-001) is the row-level enumeration of an existing cluster-level finding; v7.1.1 stamp-gate inheritance grows by 1 (the ~55 missing master-spec engine-concept M.1 rows must author before v7.1.1 stamp per the M.2 process-gate doctrine).

## 10. Halt-Rule Evaluation

This is the standalone Prompt 11.4 walk, not a V-prompt; halt does not apply automatically. No net-new P0 defects. The two inherited P0s (D-11.3-001, D-11.3-002) already block Phase V11 sign-off; Phase 11.4 confirms their downstream impact on the trace but does not promote.

## 11. Coverage Matrix Cell Prescription

Per the per-family trace tables in `_audit/SURFACE_ENGINE_TRACE.md` §3, the `surface_engine_mapping` column for every F-* feature receives a mechanical update keyed on its M.1 status — details in the `_audit/COVERAGE_MATRIX.md` Phase 11.4 update block (queued to v7.1.1 mechanical pass).

Cell-changes itemized:
- F-AE-016 — `authored_extension_status` ⚠ → n/a (D-11.4-002 inventory-hygiene).
- F-806 — `ci_gate_coverage` ⚠ holds (already tightened); D-11.4-004 row-class taxonomy is queued as a separate authoring item that does not move the cell further.
- F-AE-069 — `authored_extension_status` ⚠ holds; D-11.4-004 row-class taxonomy is queued into the same AE ratification batch.
- Family-level tightening for 392 features with `M.1 ❌`: cell prescription captured in the Coverage Matrix Phase 11.4 block, applied in v7.1.1.

## 12. Cross-References

- `_audit/SURFACE_ENGINE_TRACE.md` — trace artifact (primary deliverable).
- `_audit/DEFECT_LEDGER.md` — defect rows D-11.4-001 through D-11.4-004 under section `## Phase 11.4 — Surface/Engine Cross-Reference Audit (2026-05-11)`.
- `_audit/COVERAGE_MATRIX.md` — Phase 11.4 delta block under `### Phase 11.4 Update (2026-05-11) — Surface/Engine Cross-Reference Audit`.
- `_audit/PHASE11.1_FINDINGS.md` — D-11.1-001..010 inherited (surface-class cluster filings).
- `_audit/PHASE11.2_FINDINGS.md` — D-11.2-012 / D-11.2-022 inherited (M.4 gate state).
- `_audit/PHASE11.3_FINDINGS.md` — D-11.3-001 / -002 / -005 inherited (M.5 catalog state).
- `Sourcera_Master_Spec.md` Appendix M.1 / M.2 / M.4 / M.5 (lines 48994–49572).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — 218 AE row identifiers; clean trace against 72 F-AE-* rows.
- Forward references: Phase V11 (re-litigation gate); v7.1.1 stamp gate (D-11.4-001 added); M02.3 / M11.3 / M21.3 / M24.3 implementation packs (D-11.4-004 row-class taxonomy required).
