# Phase 11.3 — Appendix M.5 37-Gate CI Catalog Coverage

**Phase prompt:** `Audit_Prompts.md` → Prompt 11.3 (`Walk §M.5`).
**Scope:** Master Spec v7.1.0 §M.5 (lines 49434–49572, plus the trailing `**End of Spec**` line 49575). All 103 catalog rows, all six pseudo-heading prose blocks, all inline AE references, every "Appendix M.5" cross-reference from elsewhere in the spec body.
**Defect-ID convention:** `D-11.3-NNN` (sequential per Defect Ledger format).
**Severity-rule application:** P0 reserved for `Audit_Prompts.md` Severity rule (a) firewall, (b) PII leakage, (c) residency-lock, (d) billing/revenue leakage, (e) "CI gate referenced runtime-unwireable as written." P1 for unbuildable-as-written contracts (missing rows / missing AE links / unverifiable count claims). P2 for ambiguity that two staff engineers would resolve differently. P3 for cosmetic / anchor / Markdown hygiene.
**Pre-edit backup:** Non-destructive audit pass; no Master Spec edits performed; no `/_versions/` snapshot required.
**Self-challenge revisions:** Three — logged at §6 below.
**Counterfactual pass:** Logged at §7 below.

---

## 1. Sources Read End-to-End

- Master Spec §M.5 lines 49434–49572 (every row, every pseudo-heading paragraph, the trailing "End of Spec" terminator at 49575).
- Master Spec line 102–103 (release-notes claim of "37 CI gate definitions" + "10 source-phase sub-blocks").
- Master Spec line 125 (Appendix M structural summary: "§M.5 (37-gate catalog at §M.4 fidelity)").
- Master Spec line 140 (release-notes claim of "4 gates runtime-active + 33 known-issue note").
- Master Spec line 174 ("§M.5 runtime wiring (33 of 37 gates)").
- Master Spec line 181 ("Phase 14.18.1 runtime wiring (37 §M.5 gates). v7.1.1 stamp gate.").
- Master Spec §22 line 17935 / 17937 (`kb_bootstrap_per_org_concurrency_lock_active` cross-referenced as "Appendix M.5; v7.1.1 stamp gate" — verified absent from catalog).
- Master Spec §48.8.10 line 19399 / 19401 (`bid_disqualification_cascade_active` cross-referenced as "Appendix M.5; v7.1.1 stamp gate" — verified absent from catalog).
- Master Spec lines 8287 / 8688 / 8692 / 9525 / 10104 / 30097 / 30106 / 30113 / 30135 / 30929 / 37988 (eleven additional inline "Appendix M.5 `<gate_id>`" cross-references — verified absent from catalog).
- Master Spec §M.4 (lines 49395–49432) — for cross-reference of §M.4.4 override grammar against §M.5 line 49440 and line 49567.
- Master Spec §40.2 authoring note (line 32170) — claims `retention_singleton_§40.2_canonical` is "runtime-active in M02.3 implementation pack" (semantic collision with §M.5 prose).
- `_integration/RECONCILIATION.md` line 10145–10251 (Phase 14.18.1 reconciliation block including the explicit "37 gates ... 44 row entries" admission at line 10157).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` lines 280–281 (AE-14.18.1-01 / -02), 376–377 (AE-3V-001 / -002), 444–448 (AE-V8.4-01..05), 462–468 (AE-V9-001..007).
- `_audit/PHASE11.2_FINDINGS.md` in full — the Phase 11.2 §M.4 walk; Phase 11.3 inherits D-11.2-011 (override-grammar drift across §M.5 lines 49440 / 49567 / AE-14.18.1-02) and D-11.2-012 (`appendix_m_coverage_on_diff` absent from §M.5).
- `_audit/PHASE3_VERIFY.md` line 689 / 723 (Phase 3V+ row-count assertion: "7 gates (5 named in V3+ work + 2 net-new spec-binding gates)").
- `_audit/COVERAGE_MATRIX.md` lines 71–87 (Phase 11.2 §M.4 walk delta block), 1600–1631, 1770 (F-797, F-AE-069, and the F-798..F-836 per-gate cluster).
- `_audit/FEATURE_INVENTORY.md` line 818–820 (F-797, F-798, F-799 and forward).
- `Audit_Prompts.md` Prompt 11.3 body (the inline TASK / CHECKS / OUTPUT block embedded in the user prompt) + Global Conventions Preamble (lines 117–242) + Defect Ledger Format (lines 49–68) + Severity Definitions (lines 72–83).
- `CLAUDE.md` §16 Known Drift entries on "§M.4 CI gate is active; §M.5 runtime wiring is partial" and the v7.1.1 stamp-gate inheritance set.
- `Sourcera_Master_Spec.md` post-edit `wc -l` and the gate-name extraction over lines 49444–49563 (verified via `grep '^| \`' | wc -l` = 103 rows).

---

## 2. Check-by-Check Disposition

| Prompt Check | Disposition |
| :---- | :---- |
| 1. Total gate count = 37 (confirm). | ❌ Failed — actual v7.1.0 Phase-14.x block count is **44 rows** (1+4+4+4+6+5+4+7+8+1), not 37. Section header at line 49442 asserts "Catalog (66 gates — 37 v7.1.0 + 1 Phase 2V + 12 Phase 3V + 6 Phase 3V+ + 10 Phase V8.4)"; actual count is 73 = 44 + 1 + 12 + **7** + 10. Authoring-intent paragraph at line 49565 asserts "Total catalog row count post-V9: 95 gates"; actual count is **103**. The "37 is canonical despite 44 rows" doctrine is recorded in `_integration/RECONCILIATION.md` line 10157 but is invisible to a §M.5 reader. Filed **D-11.3-003** (P1). The Phase 3V+ "6 vs 7" sub-discrepancy is independently contradicted by `PHASE3_VERIFY.md` line 689 ("7 gates"), AE-3V-002 ledger row ("5 new CI gates"), and the §M.5 header ("6"). Filed **D-11.3-004** (P1). |
| 2. Each gate has: name, owning phase, scope, assertion, failure message, runbook reference. | ⚠ Partial — all 103 rows carry six structured columns (Gate ID, Source phase, Scope, Trigger, Failure mode, Authority anchor). Cell-level population check: zero rows have empty data cells. **However**: (a) the supplied "Authority anchor" is a spec-citation, not an operational runbook — no row carries a paging policy, on-call playbook URL, or remediation procedure for production failures, violating the convention checklist's explicit "runbook reference" requirement. Filed **D-11.3-007** (P2). (b) The "Trigger" column overloads two distinct concepts (when the gate runs vs what the gate asserts); see e.g. `appendix_m_no_orphan_engine_concept` (assertion) vs `appendix_m_tier_visibility_smoke` (execution context). Filed **D-11.3-008** (P2). (c) One row (`dsar_cascade_pattern_default_row_retired` at line 49536) contains an unescaped `\|` inside `"Pattern B \| Default"` — Markdown table renderers will split the row visually. Filed **D-11.3-011** (P3). (d) Only 9 of 103 rows explicitly state override-path policy in the Failure-mode cell; the rest rely on the §M.5 line 49567 default. Filed **D-11.3-012** (P3). (e) Gate identifier `retention_singleton_§40.2_canonical` (line 49561) contains the Unicode `§` character — CI identifiers should be ASCII snake_case to avoid shell/regex/log-pipeline brittleness. Filed **D-11.3-009** (P2). |
| 3. 4 gates are runtime-active at v7.1.0; 33 are spec-binding contracts pending runtime wiring (M02.3 / M11.3 / M21.3 / M24.3 implementation packs). | ❌ Failed — §M.5 carries **no per-row `runtime_status` column**. The "4 runtime-active" claim (Master Spec line 140; §M.5 line 49565; CLAUDE.md §16) cannot be reproduced from the catalog: §M.4's `appendix_m_coverage_on_diff` is one of the four but is itself absent from §M.5 (Phase 11.2 D-11.2-012; inherited); the "3 immediate runtime gates" are never identified by Gate ID anywhere in the spec. The §40.2 authoring note (line 32170) labels `retention_singleton_§40.2_canonical` and `entity_retention_coverage_on_diff` as "runtime-active in M02.3 implementation pack" — but "in M02.3 implementation pack" semantically means "wiring lands in M02.3" (i.e., NOT runtime-active yet), creating a third interpretation. The "33 pending" arithmetic does not match the post-V9 "91 spec-binding" arithmetic in line 49565. Filed **D-11.3-001** (P0) — the catalog cannot be audited for runtime-status compliance because runtime status is not declared per-row. Without per-gate runtime-status disclosure, the implementation packs M02.3 / M11.3 / M21.3 / M24.3 cannot deterministically partition the catalog into wired-already vs wiring-pending; this is a Severity Rule (e) defect by analogy ("leaves a CI gate referenced runtime-unwireable as written"). |
| 4. Every Authored Extension referenced from a gate is in the ledger. | ⚠ Partial — strict-presence holds: every AE ID cited from §M.5 (AE-3V-002 ×7 rows, AE-V8.4-01 / -02 / -03, AE-V9-001..007 in the tail prose) resolves to an `_integration/AUTHORED_EXTENSIONS_LEDGER.md` row. **But the AE ledger row enumerations are stale**: AE-3V-002 (line 377) asserts "5 new CI gates" while seven Phase 3V+ rows in §M.5 cite AE-3V-002 (the missing two are `user_organization_attribute_disambiguation` and `console_bridge_no_group_event_kinds`, confirmed in `PHASE3_VERIFY.md` line 689 as the "2 net-new spec-binding gates"). AE-3V-001 (line 376) asserts "catalog row count 38 → 50" using a baseline that does not match the actual catalog math (the 38 baseline presumes 37 v7.1.0 + 1 Phase 2V, perpetuating D-11.3-003). Filed **D-11.3-004** (P1). |
| 5. v7.1.1 stamp gate marked. | ⚠ Partial — the phrase "v7.1.1 stamp gate" appears 8+ times across the Master Spec body (lines 174 / 181 / 17935 / 19399 / 49571 et al.) and CLAUDE.md §16, and the §M.5 prose at line 49571 declares "v7.1.1 stamp gate audits each V9 gate's runtime status." But the v7.1.1 stamp gate is **not a structured row** in the §M.5 catalog — it has no Gate ID, no Scope, no Trigger, no Failure mode, no Authority anchor. Release-blocking gates that fire at version-stamp time must be canonical catalog rows to be auditable. Filed **D-11.3-005** (P1). |

---

## 3. Catalog Inventory Snapshot (gate counts by phase)

Computed from `grep '^| \`' | wc -l` over Master Spec lines 49444–49563. Verified against per-phase header positions inside the slice.

| Phase block | Gate count (actual) | Header-claim | Δ |
| :---- | :---- | :---- | :---- |
| Phase 14.1 — Principle 9 | 1 | (within "37 v7.1.0") | — |
| Phase 14.2 — Appendix M | 4 | (within "37 v7.1.0") | — |
| Phase 14.4 — Single-Operator Mode | 4 | (within "37 v7.1.0") | — |
| Phase 14.5 — Defense View | 4 | (within "37 v7.1.0") | — |
| Phase 14.6 — Pipeline Surface Compression | 6 | (within "37 v7.1.0") | — |
| Phase 14.7 — Per-Vertical Eval Starters | 5 | (within "37 v7.1.0") | — |
| Phase 14.8 — Seller Maya Surface Polish | 4 | (within "37 v7.1.0") | — |
| Phase 14.9 — Solo Plan Tier | 7 | (within "37 v7.1.0") | — |
| Phase 14.10 — Solo-Tier Surface Treatment | 8 | (within "37 v7.1.0") | — |
| Phase 14.17 — First-30-Seconds Test | 1 | (within "37 v7.1.0") | — |
| **v7.1.0 subtotal** | **44** | **37** | **+7** |
| Phase 2V — Appendix K Glossary Canonicality | 1 | 1 | 0 |
| Phase V8.4 — Appendix I Spec-Side Remediation | 10 | 10 | 0 |
| Phase 3V — Phase 3 Audit Remediation | 12 | 12 | 0 |
| Phase 3V+ — WorkOS April 2026 Integration | 7 | 6 | +1 |
| Phase V9 — Privacy / Retention / Residency | 29 | 29 | 0 |
| **Pre-V9 subtotal** | **73** | **66** | **+7** |
| **Post-V9 total** | **103** | **95** | **+8** |

The "37 is canonical despite 44 rows" disclosure exists only in `_integration/RECONCILIATION.md` line 10157 ("the named '37 gates' is canonical (some gates are renamed / consolidated relative to the originating phase forward-reference text but every forward-reference is honored)"). The §M.5 reader gets no canonical 37↔44 mapping. The reconciliation log is not customer-facing for engineers building against the spec.

---

## 4. Cross-Reference Audit — Spec Body "Appendix M.5 \`<gate>\`" References Resolving Into Empty Catalog Space

13 distinct CI gates are cross-referenced from Master Spec body as "Appendix M.5" entries but are **absent from the §M.5 catalog row set**. Verified by extracting the catalog gate-name set and grep-checking each citation.

| Gate name | Cited at Master Spec line | Severity implication |
| :---- | :---- | :---- |
| `settlement_freeze_carveouts_canonical` | 8287 | Billing canonical — Severity Rule (d) candidate |
| `cost_base_publish_gate_threshold_single_source` | 8688, 29308 | Pricing/AIOperation cost-base singleton — Severity Rule (d) |
| `cost_base_recalc_notice_window_trajectory_gate` | 8692, 29336 | Pricing recalc trajectory — Severity Rule (d) |
| `appendix_j_plan_tier_inline_string_retired` | 9525 | Plan-tier enum hygiene |
| `audit_log_surfacing_cross_reference_consistency` | 10104 | Audit-log integrity — Severity Rule (c) candidate |
| `kb_bootstrap_per_org_concurrency_lock_active` | 17935, 17937 (also tagged "v7.1.1 stamp gate") | KB bootstrap concurrency lock |
| `bid_disqualification_cascade_active` | 19399, 19401 (also tagged "v7.1.1 stamp gate") | Cross-Console Bridge cascade |
| `wallet_read_role_gate_scope` | 30097 | Wallet RBAC — Severity Rule (a) candidate |
| `committed_spend_single_pool_invariant` | 30106 | Committed-spend billing invariant — Severity Rule (d) |
| `committed_spend_single_auto_renew_invariant` | 30113 | Committed-spend renewal invariant — Severity Rule (d) |
| `committed_spend_console_scope_consistency` | 30135 | Cross-console committed-spend isolation — Severity Rule (a) |
| `solo_microcopy_template_parity` | 30929 | Solo i18n parity |
| `seller_activation_cohort_canonical_enum` | 37988 | Seller analytics enum |

Five of these gates are explicit billing-surface or firewall contracts. Their absence from the canonical catalog leaves implementation packs without a wiring contract — Severity Rule (d) and Rule (e) compound. Filed **D-11.3-002** (P0).

(An additional 130+ inline `CI gate \`<name>\`` references in the Master Spec body do not assert "Appendix M.5" placement and therefore may be legitimately defined in their citing sections; not in Phase 11.3 scope. Forward to Phase V11.)

---

## 5. Phase 11.2 Inherited Defects (re-asserted; no re-file)

- **D-11.2-011** (P2 ci_gate — override-grammar drift) — §M.5 line 49440 says `@ci-gate-override:` follows "the same rationale-format constraint" as §M.4.4; §M.5 line 49567 says rationale "≥ 30 chars + Gate ID match"; AE-14.18.1-02 says "≥ 30 chars; gate ID in M.5 must match". Three independent specifications of the same override grammar. Phase 11.3 confirms drift remains; no remediation in this pass.
- **D-11.2-012** (P1 ci_gate — `appendix_m_coverage_on_diff` absent from §M.5) — re-asserted; folds into the broader §M.5 self-incompleteness pattern surfaced by D-11.3-002.
- **D-11.2-022** (P2 ci_gate — §M.4 runtime status declaration ambiguity) — re-asserted as semantic precondition for D-11.3-001 (per-gate runtime status), D-11.3-005 (v7.1.1 stamp gate), and D-11.3-010 (Phase 14.20 closeout audit outcome).

---

## 6. Self-Challenge Pass (Hostile-Reviewer Re-read)

Re-read each defect as a hostile reviewer. Three revisions:

1. **D-11.3-002 originally drafted as P1 cluster.** Hostile reviewer: "Twelve of the thirteen missing gates have committed-spend / cost-base / wallet-RBAC implications. Two explicitly cite billing invariants. If `committed_spend_single_pool_invariant` is missing from the canonical catalog, the M02.3 implementation pack will not wire it; under §34.10 / §34.13 the wallet billing path can double-count Committed Spend if the invariant is not enforced. That is Severity Rule (d) revenue leakage." Promoted to **P0**. (Severity Rule (d): "leaves a billing surface ... ambiguous in a way that allows revenue leakage or double-charge.")

2. **D-11.3-001 originally drafted as P1.** Hostile reviewer: "If the catalog cannot identify which 3 of 103 rows are runtime-active, then the production-readiness verdict for runtime CI coverage is undecidable. Severity Rule (e) reads 'leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written.' The catalog IS the per-gate runtime contract; without per-row runtime-status disclosure, every gate is in an indeterminate state from the wiring pack's perspective. The 3-undisclosed-gates ambiguity is the catalog-level equivalent of an unwireable gate." Promoted to **P0**.

3. **D-11.3-005 originally drafted as P2 ("v7.1.1 stamp gate is mentioned in prose").** Hostile reviewer: "The v7.1.1 stamp gate is referenced by name from at least eight places in the spec body (including §22.4.4 line 17935 `kb_bootstrap_per_org_concurrency_lock_active` and §48.8.10 line 19399 `bid_disqualification_cascade_active`, both of which write 'Appendix M.5; v7.1.1 stamp gate'). If those gates are absent (per D-11.3-002) AND the stamp gate itself is undefined as a catalog row, then v7.1.1 will stamp without a binding criterion. A release-blocking gate must be a catalog row." Held at **P1** (release-process hygiene; not a v7.1.0 ship blocker because v7.1.0 already stamped without it).

---

## 7. Counterfactual Pass

For each runtime-active gate claimed at v7.1.0, enumerate failure modes and verify the catalog addresses each. Per the prompt: "File P0 ci_gate for any active CI gate that lacks a deterministic failure mode."

| Claimed runtime-active gate | Failure mode in catalog | Deterministic? | Disposition |
| :---- | :---- | :---- | :---- |
| `appendix_m_coverage_on_diff` (§M.4) | "PR check fails with status `appendix_m_coverage_on_diff: missing_row`" + "PR check fails with status `appendix_m_coverage_on_diff: invalid_override_rationale`" | ✅ deterministic | But absent from §M.5 — D-11.2-012 / D-11.3-002. Also override-bypass D-11.2-004 (P0) outstanding. |
| (immediate runtime gate #1) | undefined — no catalog row identifies | ❌ | folded into **D-11.3-001** (P0) |
| (immediate runtime gate #2) | undefined — no catalog row identifies | ❌ | folded into **D-11.3-001** (P0) |
| (immediate runtime gate #3) | undefined — no catalog row identifies | ❌ | folded into **D-11.3-001** (P0) |

For three of four claimed runtime-active gates, the failure-mode determinism cannot be verified because the gate identities are undisclosed. The P0 already filed covers this.

Three realistic failure modes per the broader catalog — confirmed unhandled:
- **Failure mode A — author adds a new CI gate inline in a §-section without updating §M.5.** The catalog has no self-coverage gate that asserts "every spec-body `Appendix M.5 \`<gate>\`` reference resolves to a §M.5 row." Resulting state is exactly D-11.3-002 (13 cross-references resolving into empty catalog space). Filed **D-11.3-006** (P1).
- **Failure mode B — header row-count assertion drifts from catalog body after audit-remediation phase adds gates.** Exactly what happened with Phase 3V+ (6 vs 7) and the post-V9 95 vs 103. No CI gate asserts header-count vs body-count parity. Folded into D-11.3-006.
- **Failure mode C — AE ledger row enumerations drift from §M.5 gate set citing the AE.** Exactly what happened with AE-3V-002 (5 enumerated vs 7 citing). No CI gate asserts AE-row gate-set ⊆ §M.5 rows citing AE-ID. Folded into D-11.3-006.

---

## 8. Severity Roll-Up

| Severity | Count | IDs |
| :---- | :---- | :---- |
| P0 | 2 | D-11.3-001, D-11.3-002 |
| P1 | 4 | D-11.3-003, D-11.3-004, D-11.3-005, D-11.3-006 |
| P2 | 4 | D-11.3-007, D-11.3-008, D-11.3-009, D-11.3-010 |
| P3 | 3 | D-11.3-011, D-11.3-012, D-11.3-013 |

---

## 9. Halt-Rule Evaluation

Per the audit program: any unresolved P0 or P1 at a `V` prompt halts the audit. Phase 11.3 is the standalone Prompt 11.3 walk, not a V-prompt; halt does not apply automatically. However, the two P0 defects (D-11.3-001 runtime-status disclosure + D-11.3-002 13 cross-reference orphans, with billing-surface and firewall implications) **MUST** resolve before Phase V11 sign-off. The v7.1.1 stamp gate inheritance set grows by D-11.3-001 / D-11.3-002 / D-11.3-005.

---

## 10. Forward References

- **Phase V11.** Inherits both P0s plus D-11.3-005 (v7.1.1 stamp gate registration). V11 must re-litigate after the §M.5 amendments land.
- **v7.1.1 stamp gate.** Inherits D-11.3-001, D-11.3-002, D-11.3-003, D-11.3-004, D-11.3-005, D-11.3-006.
- **v7.1.1 mechanical hygiene pass.** Absorbs D-11.3-007 through D-11.3-013.
- **M02.3 / M11.3 / M21.3 / M24.3 implementation packs.** Cannot proceed with deterministic per-gate wiring until D-11.3-001 (per-row runtime-status declaration) is remediated.
- **Authored-Extension ledger.** AE-14.18.1-01 ratification must be re-opened post-amendment to absorb the 13 missing catalog rows (or split into AE-11.3-01 for the catalog-completeness amendment).
- **`_integration/RECONCILIATION.md`.** The "37 is canonical despite 44 rows" doctrine at line 10157 must be promoted into the §M.5 body (or the catalog header must be amended to the actual count) per D-11.3-003.

---

## 11. Coverage Matrix Cell Prescription (applied in this pass)

- F-797 (M.5 37-Gate CI Catalog, §M.5): `ci_gate_coverage` ⚠ → ❌ (D-11.3-001 / D-11.3-002 / D-11.3-006); `acceptance_criteria` ⚠ → ❌ (D-11.3-005 v7.1.1 stamp gate has no AC); `enums` ⚠ → ❌ (D-11.3-001 — no `runtime_status` enum registered); `documentation_gap` (implicit column via Coverage Matrix `evidence` notation) updated to record D-11.3-007 / D-11.3-013; `consistency_drift` documented (D-11.3-003, D-11.3-004).
- F-AE-069 (AE-14.18.1-01 §M.5 CI Gate Catalog AE): `authored_extension_status` ⚠ → ❌ (D-11.3-002 + D-11.3-004 — AE row must be re-opened to amend catalog completeness and enumerated gate set).
- F-795 (appendix_m_coverage_on_diff, §M.4): `ci_gate_coverage` ⚠ (held — Phase 11.2 D-11.2-012 cell already at ⚠; D-11.3-002 confirms the cross-reference orphan but does not re-tighten beyond D-11.2-012).
- Per-gate F-798..F-836 rows: no per-cell tightening — defects in Phase 11.3 scope are catalog-level structural, not per-gate convention failures. (Per-gate convention audits forward to Phase 5.x / Phase 9 sweeps.)

Aggregate counters not updated; matrix tightening rides the v7.1.1 hygiene pass per `COVERAGE_MATRIX.md` convention.

---

## 12. Pre-edit Backup

Non-destructive audit pass. No Master Spec edits performed. No `/_versions/` snapshot required.

---

## 13. Cross-References

- `_audit/DEFECT_LEDGER.md` § "Phase 11.3 — Appendix M.5 37-Gate CI Catalog Coverage (2026-05-11)" — 13 new defect rows.
- `_audit/COVERAGE_MATRIX.md` — Phase 11.3 delta block (this pass).
- `_audit/PHASE11.2_FINDINGS.md` — Phase 11.2 §M.4 walk; D-11.2-011 / D-11.2-012 / D-11.2-022 cross-linked.
- `_audit/PHASE3_VERIFY.md` line 689 / 723 — Phase 3V+ row-count assertion contradicting §M.5 header.
- `_integration/RECONCILIATION.md` line 10145–10251 — Phase 14.18.1 reconciliation; line 10157 "37 / 44" canonical-count admission.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` lines 280–281 / 376–377 / 444–448 / 462–468 — AE rows referenced from §M.5.
- `Sourcera_Master_Spec.md` §M.5 lines 49434–49572; §M.4 lines 49395–49432; §22.4.4 line 17935; §48.8.10 line 19399; §40.2 line 32170; release notes lines 102–140 / 174 / 181.
- `CLAUDE.md` §16 — v7.1.1 stamp-gate inheritance entry; "§M.4 active / §M.5 partial" claim that needs amendment post-D-11.3-001.
- Forward references: Phase V11 (re-litigation gate); v7.1.1 stamp gate (inheritance: D-11.3-001 / -002 / -003 / -004 / -005 / -006); v7.1.1 mechanical hygiene pass (D-11.3-007 / -008 / -009 / -010 / -011 / -012 / -013); M02.3 / M11.3 / M21.3 / M24.3 implementation packs (blocked by D-11.3-001 until runtime-status disclosure added).
