# Sourcera Audit — Remediation Backlog

**Last updated:** 2026-05-13 — consolidated Phase 15 pass (Phase V14 Remediation Closure same-day). Supersedes the 2026-05-06 Phase 6 seed; the Phase 6 catalog-completeness P1 sweep, Phase 11.5 M.1 Backfill Pack, Phase V11 mechanical hygiene, Phase V12 §42 / §43 / §46 / §50 closure, Cross-Cutting Programs, and v7.1.1 Ledger-Hygiene block are preserved in place. Pre-rewrite backup at `_versions/REMEDIATION_BACKLOG.pre-V14-consolidation-2026-05-13.md`.

**Scope.** This file is the curated, prioritized work list that owners execute against. Each entry references the source `defect_id`(s); ledger rows in `DEFECT_LEDGER.md` carry the canonical status field. When a backlog work item is closed (defect → `remediated`), update both this file and the ledger.

**v7.1.1 stamp-scope index.** For aggregate v7.1.1 release-scope discovery, read `_audit/V711_BACKLOG_INDEX.md` first. This file remains the executable backlog detail source, but it is not the sole v7.1.1 stamp-scope inventory.

**Reading order.**
0. `_audit/V711_BACKLOG_INDEX.md` for v7.1.1 stamp-scope routing and known count conflicts.
1. §1 Provenance & open-count reconciliation (must read before scoping any cycle).
2. §2 P0 — Blockers (gates v7.1.1 stamp and v7.2.0 stamp).
3. §3 P1 — Required for v7.2.0 stamp (clustered by phase + class; ~590 truly-open defects in ~250 clusters after V14 reconciliation).
4. §4 P2 — Required for v7.x continuous improvement.
5. §5 P3 — Cosmetic / hygiene (single sweep epic).
6. §6 Cross-cutting v7.1.x programs (preserved from prior seeds).
7. §7 Closed-in-place transitions (Phase 6 / V11 / V12 / V14).
8. §8 Ledger-hygiene work (D-CONS-001 through D-CONS-007).

---

## §1 Provenance & Open-Count Reconciliation

**Source ledger.** `_audit/DEFECT_LEDGER.md` (6,076 lines; V14 Remediation Closure dated 2026-05-13). Canonical 12-column row schema reproduced from `Audit_Prompts.md → Defect Ledger Format`.

**Headline statistics from the ledger (canonical-cell counts, line 41 onward):** 60 P0 · 918 P1 · 703 P2 · 226 P3 = 1,907 total canonical defects across 88 distinct `phase_owner` values.

**Reconciliation gap.** Per D-CONS-001 (filed 2026-05-13), ≥390 canonical rows currently flagged `open` carry supplementary `→ remediated` or `→ superseded` transitions in V2 / V3 / V3V+ / V4 / V5 / V6 / V7 / V8.4 / V9 / V11 / V12 / V13 / V14 status-transition tables. **The canonical-row `open` counts overstate the true open-defect inventory by roughly that margin.**

**True open-defect counts used in this backlog (after applying latest-status rule):**

| Severity | Canonical `open` | Supplementary-closed | True open | Source |
|---|---:|---:|---:|---|
| P0 | 49 | 37 | **12** | §2 enumerates each individually |
| P1 | 907 | ~99 (extracted 2026-05-13) | **808** | §3 clusters across 72 phases |
| P2 | 692 | ~87 | **605** | §4 clusters across 68 phases |
| P3 | 215 | ~26 | **189** | §5 class roll-up |
| **Total** | **1,863** | **~249** | **1,614** | — |

**The reconciliation walk is itself an open P1 work item (D-CONS-001 in §8).** Until it runs, this backlog uses the latest-status interpretation (a row with any `→ remediated` transition in a supplementary block is treated as closed). The supporting extracts are saved alongside this file as `_audit/_scratch_p1_clusters.md` and `_audit/_scratch_p2_p3_clusters.md`; both are advisory artifacts pending the D-CONS-001 propagation pass.

**Master Spec state.** v7.1.0 stamped 2026-04-28. v7.1.1 stamp gate is open and inherits: 5 READY + 2 BLOCKED-on-V11-cluster AE rows from `_integration/AUTHORED_EXTENSIONS_LEDGER.md` v7.1.0 ratification queue, plus 17 Phase-PH6R AE rows, 8 Phase-V11 AE rows, V12 AE rows, and 1 net-new V14 AE row (AE-V14-001). Per `CLAUDE.md §16` and `_audit/AE_RATIFICATION_RECOMMENDATIONS.md`, every `pending` AE row must transition to `approved` / `acknowledged` / `superseded` before v7.1.1 stamps. Per `_audit/DEFECT_LEDGER.md` Phase V14 sign-off, Phase 15 (Final Synthesis & Production-Readiness Verdict) is unblocked.

**v7.2.0 stamp dependency.** v7.2.0 is the next major release. The P0 + P1 sections of this backlog define the work; the v7.2.0 stamp gate inherits every P0 closure plus the P1 cluster roll-up below.

**Linear issue ID convention.** Per `Linear_Execution_Blueprint.md §5`. P0 backlog rows take `PROD-CRIT-{nn}`. P1 cluster rows take `DOC-{nnn}` (documentation_gap / glossary / consistency_drift / heading_syntax) or `PROD-{nnn}` (engineering classes). P0 IDs run 001–012; P1 IDs run sequentially per `_scratch_p1_clusters.md`. P2 / P3 hygiene rolls into the v7.1.x mechanical-hygiene epic.

---

## §2 P0 — Blockers

12 truly-open P0 defects. Each blocks the v7.1.1 stamp (or v7.2.0 stamp where flagged); every row gates a downstream phase or implementation pack.

| # | Title | Defect | Class | Loc | Evidence | Recommendation | Owner | Pack | Effort | Linear | AE Ledger | Gating Impact |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | HeatMapCell vendor-opt-out sentinel admission opens enum-bound erosion gateway across firewalled UIs | D-2.2-042 | firewall_leakage | §4.4.16 L5333 | `scope_kind=not_applicable` sentinel introduced inline; §4.4.8 `vendor_opt_out_scope_kind` enum does not include `not_applicable`; HeatMapCell aggregate carries `vendor_opt_out_honored_at` field with structurally inapplicable scope. | Remove `vendor_opt_out_honored_at` from HeatMapCell (aggregate cells render no vendor identity); document structural inapplicability in §4.4.16 prose; preserve §4.4.8 enum closed-set; add CI gate `enum_bound_no_inline_sentinel_admission`. | Engineering + Security | M02.3 | M | PROD-CRIT-001 | New AE row for §4.4.16 narrative correction + enum-bound CI gate | v7.1.1 stamp; downstream §27 Marketplace Discovery + §4.7 Bridge entities inherit the closed-set invariant. |
| 2 | Billing Admin role glossary directive points at Keyboard Shortcut appendix instead of Glossary appendix | D-AK-001 | ci_gate | §5.2.1 L9010 | "Appendix B Glossary" inline; Appendix B is Keyboard Shortcut Reference per CLAUDE.md §12 + Phase 12.3 amendment; Appendix K is the canonical Glossary. | Replace string at L9010; author `appendix_k_glossary_canonicality` matcher per PHASE2.2_GLOSSARY_FINDINGS.md Counterfactual #2. | Engineering | release-orchestration | S | PROD-CRIT-002 | AE-12.3-12 `appendix_k_glossary_canonicality` (acknowledged) — ratify before v7.1.1 stamp | v7.1.1 stamp; D-AK-002 + D-AK-003 block on the same CI gate. |
| 3 | §22 v7.0.0 KB-rewrite authoring intent directs all KB glossary additions to wrong appendix | D-AK-002 | ci_gate | §22 L15018 | "every new term lands in Appendix B; every new enum lands in Appendix J" inline authoring intent. | Replace "Appendix B" → "Appendix K" at L15018; audit §22 / §22.18 / §22.20 for any other Appendix-B-as-Glossary directive; land alongside D-AK-001 CI-gate authoring. | Engineering | release-orchestration | S | PROD-CRIT-003 | AE-12.3-12 (same as D-AK-001) | v7.1.1 stamp; KB-domain glossary terms are filed at wrong anchor until closed. |
| 4 | R6 Tone & Brand Voice AC cites `brand_voice_guide_v1` in wrong appendix; cited entry is missing from both | D-AK-003 | ci_gate | §34 / §48 L34243 | "Appendix B Glossary" inline R6 AC; cited entry `brand_voice_guide_v1` does not exist in either Appendix B or Appendix K. | Replace "Appendix B Glossary" → "Appendix K Glossary"; author the missing `brand_voice_guide_v1` Glossary entry under D-AK-004 (Authored Extension — requires human sign-off) so the R6 validator can bind. | Engineering | release-orchestration | S | PROD-CRIT-004 | AE-12.3-12 + new AE row for `brand_voice_guide_v1` Glossary entry | v7.1.1 stamp; the R6 validator cannot bind until the cited entry exists. |
| 5 | §M.4 override-path bypass vulnerability — annotation alone admits "Internal-only, never surfaced" row without detector cross-validation | D-11.2-004 | ci_gate | §M.4.4 L49422–49428 | Override grammar accepts any well-formed annotation; auto-generates Appendix M.1 row without confirming the detector flagged the concept; allows hostile PR to claim "internal-only" for a customer-surface concept. | Two-part fix. (1) Pre-merge cross-validation: gate verifies annotation target matches a concept the detector flagged in the same PR; otherwise fail-closed with `override_target_not_flagged_by_detector`. (2) Customer-surface-reachability cross-validator per §M.4.4.2 (4 predicates: console enum, RBAC reachable, plan-tier reachable, surface-class non-internal). | Security + Engineering | release-orchestration | L | PROD-CRIT-005 | AE-V11-06 (§M.4 V11 hardening block — body landed; ratification BLOCKED at v7.1.0 close, MUST RATIFY before v7.1.1 stamp) | v7.1.1 stamp; closes a firewall-bypass attack surface that would have shipped silently. |
| 6 | §M.5 catalog carries no per-row `runtime_status` column — "4 runtime-active gates at v7.1.0" claim unverifiable from catalog | D-11.3-001 | ci_gate | §M.5 L49434–49572 | No `runtime_status` column; prose claim unrebound to row identities; 3 of 4 immediate-runtime gates never identified by Gate ID anywhere. | Add `runtime_status` column (enum `runtime_active` / `spec_binding_pending_pack_<id>` / `spec_binding_release_gate_only`); register enum in Appendix J; identify the 3 immediate runtime gates by Gate ID; backfill every catalog row. | Engineering | release-orchestration | L | PROD-CRIT-006 | AE-V11-03 (§M.5 schema tightening — 5 new columns; pending; v7.1.1 stamp blocker) + AE-V11-07 (§M.5 V11 hardening block; pending) | v7.1.1 stamp; v7.2.0 stamp; AE-14.18.1-01 (catalog-completeness assertion) is blocked on this. |
| 7 | §M.5 catalog missing 13 explicitly cross-referenced gates (including 2 committed-spend billing-invariant gates) | D-11.3-002 | ci_gate | §M.5 catalog body + 17 spec-body cross-refs (L8287 / 8688 / 8692 / 9525 / 10104 / 17935 / 17937 / 19399 / 19401 / 29308 / 29336 / 30097 / 30106 / 30113 / 30135 / 30929 / 37988) | 13 distinct CI gates cited from Master Spec body as "Appendix M.5" entries but absent from catalog row set; 2 of 13 are revenue-leakage-class billing invariants. | Add the 13 missing rows to §M.5 (v7.1.0a hot-patch or v7.1.1 stamp-blocking remediation); co-amend AE-14.18.1-01 to expand the completeness assertion; add meta-gate `appendix_m5_cross_reference_resolution_completeness`. | Engineering | release-orchestration | L | PROD-CRIT-007 | AE-14.18.1-01 (reopen on row count from 122 → 135) + AE-V11-07 | v7.1.1 stamp; v7.2.0 stamp; committed-spend billing invariants unenforced until closed. |
| 8 | Buyer-side QA Suggestion capability missing from registry despite seller-side sibling present | D-EM-001 | entitlement | §34.8.5 L29276 + §21.4.1 row 9 L15678 | `qa_suggestion_seller` row present in §34.8.5; sibling `qa_suggestion_buyer` documented in canonical-form lock note but not registered as a `CapabilityRegistryEntry`. | Split §21.4.1 row 9 `qa_suggestion` into `qa_suggestion_buyer` + `qa_suggestion_seller` family-rooted siblings; register both at full §4.8.2 field set; bind §34.8.5 matrix entry to registry. | Engineering + Ops | M11.3 | M | PROD-CRIT-008 | New AE row for capability-registry sibling split | v7.1.1 stamp; entitlement-matrix-binding-completeness CI gate cannot pass; buyer-side Q&A flow billing path silently broken. |
| 9 | Seven buyer-side capability_ids cited in entitlement matrix but absent from registry seeds | D-EM-002 | entitlement | §34.8.5 L29178–29199 + §21.4 seeds + §34.3.4 L28897 + §34.15.1 L29465 | `requirement_extraction`, `kb_suggestion_buyer`, `vendor_summary`, `deep_comparison`, `response_drafting`, `stakeholder_summary`, + one more — none registered as `CapabilityRegistryEntry` rows. | Author 7 new `CapabilityRegistryEntry` rows in §21.4.1 (Initial Seed) or §21.4.2 (Extended) at full §4.8.2 fidelity per row. | Engineering + Ops + Pricing | M11.3 | L | PROD-CRIT-009 | New AE row "Buyer-side capability registry seed expansion" | v7.1.1 stamp; entitlement-matrix-binding-completeness CI gate fails; buyer Core Evaluation rate-card unenforced. |
| 10 | `first_pass_rfp_draft` is the most-invoked Seller-Free customer-billed capability and is not registered | D-EM-003 | entitlement | §34.8.5 L29217 + §34.14.1 row 1 L29731 + §34.15.1 row 1 L29824 + §44.6.3 L32150 | `first_pass_rfp_draft` referenced ubiquitously (matrix + rate-card seed + OutcomeContract seed + Solo envelope exemption); no `CapabilityRegistryEntry`. | Author the row in §21.4.1.A or §21.4.2 with `solo_envelope_no_block=true` flag + `surface_throttling_class=active_workflow`; bind §34.14.1 + §34.15.1 + §34.8.5 to the new registry row. | Engineering + Ops | M11.3 | M | PROD-CRIT-010 | New AE row "first_pass_rfp_draft registration + Solo envelope binding" | v7.1.1 stamp; Seller Hero Moment billing path unbound; D-EM-002 sibling cluster. |
| 11 | Three §44.6.4.1 `low_priority_background` capability_ids unregistered in registry | D-EM-004 | entitlement | §44.6.4.1 L32179 + §21.4 + §34.8.5 + §4.8.2 L8251 | `proactive_cmd_k_marketplace_surfacing`, `weekly_kb_refresh_suggestions`, `vendor_page_enrichment_polling` enumerated as Solo-throttling set but unregistered. | Author 3 new `CapabilityRegistryEntry` rows in §21.4.2 (or a new §21.4.6 "Solo Throttling Membership" sub-section); `console_applicability` per row; bind to AE-14.10-07 ratification. | Ops + Engineering | M11.3 | M | PROD-CRIT-011 | AE-14.10-07 Solo `low_priority_background` capability set (pending; READY) | v7.1.1 stamp; Solo throttling rule cannot enforce until registry seeds exist. |
| 12 | Two Appendix-J enums purport to register the same `legal_entity` concept with divergent value sets — Stripe Customer reconciliation gap | D-RES-004 | numerical_singleton | Appendix J L45257 vs L46824; §4.8.1 L8186 / 8248; Glossary "Residency-Locked Invoicing" L47788 | One enum includes `sourcera_uk_ltd`, no `custom`; sibling enum excludes `sourcera_uk_ltd`, includes `custom`. Revenue-leakage path: residency change without canonical legal-entity binding can mis-route Stripe Charges. | Reconcile to canonical set `sourcera_us_llc, sourcera_eu_gmbh, sourcera_apac_pte, sourcera_custom` (post-D-AJ-004 set); retire `sourcera_uk_ltd` inline citations; align §4.8.1 mapping; bind Stripe Customer creation to the single enum; add `legal_entity_residency_change_revenue_leak_test`. | Engineering + Finance | M02.3 | L | PROD-CRIT-012 | New AE row "Legal-entity enum reconciliation + Stripe binding"; absorbing pass is Phase 14.13a billing rollup per D-V14-007 cross-flag | v7.1.1 stamp; v7.2.0 stamp; cross-flagged in Phase V11 narrow sign-off (D-V14-007); blocks `custom`-residency Org AC #14 fail-closed. |

**P0 closure gate.** Every PROD-CRIT-NN must transition `open → remediated` (canonical ledger row) before v7.1.1 stamps. Six of the twelve (PROD-CRIT-005, -006, -007, -011 via AE-V11-06 / AE-V11-03 / AE-V11-07 / AE-14.10-07; PROD-CRIT-002, -003, -004 via AE-12.3-12) carry AE-ratification dependencies that compound v7.1.1 stamp blockers.

**P0 Counterfactual Pass.** Three failure modes the cluster must cover:
1. **Annotation-only override admitting a customer-surface concept as internal-only** (PROD-CRIT-005). Closed by §M.4.4.2 four-predicate cross-validation.
2. **Stripe Charge mis-routed to wrong legal entity on residency change** (PROD-CRIT-012). Closed by single-source enum + `legal_entity_residency_change_revenue_leak_test`.
3. **CI gate claimed "runtime-active" but never identified by Gate ID** (PROD-CRIT-006). Closed by per-row `runtime_status` column + enum.

---

## §3 P1 — Required for v7.2.0 Stamp

808 truly-open P1 defects across 372 clusters in 72 phase blocks. Full cluster inventory at `_audit/_scratch_p1_clusters.md`. Top 50 clusters listed here with full backlog metadata; the remaining 322 clusters are addressed via the Cross-Phase Programs in §3.2.

Linear ID convention: `DOC-{nnn}` for documentation classes (documentation_gap, glossary, glossary_canonicality, consistency_drift, heading_syntax, network_effect_gap, growth_mechanic_gap); `PROD-{nnn}` for engineering classes. Sequential numbers follow `_scratch_p1_clusters.md`.

### §3.1 Top-50 Clusters by Impact (Cycle-Plannable)

Sorted by defect-count descending; ties broken by section-anchor lexicographic order. Each row is a candidate Linear issue.

| Rank | Cluster | Phase | Class | Count | Sample IDs | Sections | One-line summary | Recommendation shape | Owner | Pack | Effort | Linear | AE Ledger |
|---:|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| 1 | BL-P1-PHSS-ACC | Phase SS — UI Surface State Coverage | acceptance_criteria | 41 | D-SS-001…005 (+36 more) | §3 / UX §5.2.19 / §13 / §14 / §17 / §20 / §22 / §27 / §50 / §51 | Closed 2026-06-21: §3.7.6.7 now binds all 41 Phase SS surfaces to `page_surface_kind` plus explicit state clauses; UX §5.2.19 covers PipelineSurface states. | No remaining action for this cluster; verification at `_audit/PHASE_SS_SURFACE_STATE_P1_VERIFY.md`. | Engineering | M24.3 | XL | PROD-281 | AE-V72REM-PHSS-001 |
| 2 | BL-P1-PH22-ENUM | Phase 2.2 | enum | 24 | D-2.2-001…005 (+19 more) | §4.4 series + §22 + §27 | Closed 2026-06-21: all 24 P1 enum rows now resolve to exact Appendix J code-name headings. | No remaining action for this cluster; verification at `_audit/PHASE_V72REM_PHASE_2_2_ENUM_P1_VERIFY.md`. | Engineering | M02.3 | L | PROD-010 | Composite AE row for 24-value Appendix J expansion |
| 3 | BL-P1-PH32-PLAN | Phase 3.2 | plan_gating | 3 | D-3.2-001, D-3.2-002, D-3.2-003 | §5.11 + §34.1 + §39 | Scope-synced 2026-06-21: not a 20-row open surface. D-3.2-004 / -005 / -006 / -012 / -014 and D-3.2-007 through -023 are already remediated by the V3 / Phase 11 / 2026-06-21 overlay passes. True residual is the D-3.2-001 / -002 / -003 Min-Tier / Solo structural-body rewrite plus the §5.11 inline tier-list audit. | Author a single canonical §5.11 plan-tier overlay/resolver or finish the structural Min-Tier / Solo body rewrite; retire inline plan-tier strings in favor of Appendix J enum values and §34.1 / §39 citations. | Engineering | release-orchestration | M | PROD-028 | AE-3.2-001 / AE-3.2-002 / AE-3.2-003 approved; residual runtime/body cleanup only |
| 4 | BL-P1-PH31-RBAC | Phase 3.1 | rbac / consistency_drift | 0 | D-3.1-003, D-3.1-004, D-3.1-005, D-3.1-007, D-3.1-014 | §5 + §50.3 | Closed 2026-06-21: §5.2.2 Member Permission List, §5.2 Org Owner/Admin console-firewall guardrail, Org Admin read-only billing resolution, §5.3.1 Buyer Console operation matrix, §5.5.1 Seller Console operation matrix, and §M.5.28 RBAC gates. | No remaining action for this RBAC body/config cluster; runtime wiring owed for §M.5.28 gates in M11.3. D-3.1-008 / D-3.1-016 / D-3.1-020 remain in the Appendix K glossary backlog, not this RBAC body cluster. | Engineering | M11.3 | L | PROD-027 | AE-V72REM-PH31-RBAC-RESIDUAL-01 |
| 5 | BL-P1-PH8P81-API | Phase 8 — Prompt 8.1 — §32 API Coverage | api | 13 | D-V8.1-001…005 (+8 more) | §32 + Appendix I | 13 §32 API endpoints missing method / auth scope / rate-limit / cursor / schema / errors / idempotency / examples. | Author per §32 convention for each endpoint; register error codes in Appendix I; idempotency rule. | Engineering | M02.3 | L | PROD-261 | Composite AE row "§32 API completeness pack" |
| 6 | BL-P1-PH8-WH | Phase 8 | webhook | 8 | D-V8.1-021, D-8.2-012, D-8.2-013, D-8.2-014, D-8.2-015 (+3 more) | §31 + Appendix C + Appendix G + Appendix F | Residual webhook event-catalog coverage after the Webhook Foundation, Delivery Attempt, Event ID Format, Retry Singleton, and CRM Sync Webhook Canonicality passes: billing-domain §32.8 emissions, referral / trial / KB / wallet / committed-spend / contest lifecycle webhooks, and subscription-registration guard. | Author per-event §31 payloads + Appendix C/G/F rows; root envelope/version/class/attempt/id-format, rotation, 4xx retry semantics, canonical retry curves, retired retry-class cleanup, and CRM Sync event/state canonicality are closed by AE-V72REM-WEBHOOK-FOUNDATION-01, AE-V72REM-WEBHOOK-DELIVERY-ATTEMPT-01, AE-V72REM-WEBHOOK-EVENT-ID-FORMAT-01, AE-V72REM-WEBHOOK-RETRY-SINGLETON-01, and AE-V72REM-CRM-SYNC-WEBHOOK-CANONICALITY-01. | Engineering | M02.3 | L | PROD-267 | AE-V72REM-WEBHOOK-FOUNDATION-01 + AE-V72REM-WEBHOOK-DELIVERY-ATTEMPT-01 + AE-V72REM-WEBHOOK-EVENT-ID-FORMAT-01 + AE-V72REM-WEBHOOK-RETRY-SINGLETON-01 + AE-V72REM-CRM-SYNC-WEBHOOK-CANONICALITY-01 plus future per-event catalog AE rows |
| 7 | BL-P1-PH11-DM | Phase 1.1 | data_model | 11 | D-1.1-001…005 (+6 more) | §4.2 series | 11 entities missing field tables / retention / scope-isolation / indexes per §4 conventions. | Author field tables; add retention citation to §40.2; declare scope isolation; declare indexes. | Engineering | M02.3 | L | PROD-004 | AE rows per authored entity |
| 8 | BL-P1-PH8P83-NOTIF | Phase 8 — Prompt 8.3 — Appendix C | notification | 9 | D-V8.3-003, D-V8.3-004, D-V8.3-005, D-V8.3-007, D-V8.3-008 (+4 more) | Appendix C + §29 | Residual Appendix C notification-event-catalog gaps after the CRM Sync Webhook Canonicality pass: Solo / M9-M17 / SIM / billing-threshold / Marketplace-Discovery / support / marketplace-signal / marketplace-listing event rows plus related Appendix G mirrors. | Append Appendix C rows with channel × role × plan-gating matrix; link to retry-curve binding. CRM Sync Appendix C coverage is closed by AE-V72REM-CRM-SYNC-WEBHOOK-CANONICALITY-01. | Engineering | M02.3 | M | PROD-269 | Composite AE row "Appendix C completeness expansion"; CRM Sync subset closed by AE-V72REM-CRM-SYNC-WEBHOOK-CANONICALITY-01 |
| 9 | BL-P1-PH33-DOC | Phase 3.3 | documentation_gap / surface_engine_mapping / webhook | 2 | D-3.3-003, D-3.3-012 | §6 / Appendix M.1 / Appendix C / Appendix G | Scope-synced 2026-06-21: not a 9-row open surface. §6.1, §6.2, §6.3, §6.4, §6.5, and §6.6 body gaps are closed or status-synced; true P1 residuals are exact Appendix M.1 auth-surface rows and org-level MFA webhook catalog coverage. | Author one Appendix M.1 row per §6 auth surface and add explicit Appendix C/G org-level MFA enforcement/regeneration events if product wants subscribed webhook coverage beyond existing `security.mfa_factor_changed` user notifications and `auth.mfa_*` AuditEvents. | Engineering | M02.3 | S | DOC-006 | AE-V72REM-PH33-AUTH-SINGLETON-01 covers singleton/status-sync subset; future AE for Appendix M / MFA webhook residual |
| 10 | BL-P1-PH35-DSAR | Phase 3.5 | dsar | 8 | D-3.5-001…005 (+3 more) | §6.8.4 series | 8 §6.8.4 DSAR cascade rows missing per-class subject-rights coverage and erasure handling. | Author §6.8.4 cascade row per data class; cover Workspace / Bid Workspace / KB / Vendor Disqualification cascades. | Engineering + Legal | M11.3 | M | PROD-043 | AE-12.3-04 §6.8.4 DSAR Cascade (RELEASE-GATING for v7.0.0; reopen for v7.1.1 completeness expansion) |
| 11 | BL-P1-PH12-DM | Phase 1.2 | data_model | 7 | D-1.2-001…005 (+2 more) | §4.3 series | 7 entities missing field tables; defense-view + EvalStarter family. | Same §4 convention authoring; cite retention / scope / indexes. | Engineering | M02.3 | M | PROD-007 | AE rows for §13.11 Defense View + §13.12 EvalStarter entities |
| 12 | BL-P1-PH5P53-DM | Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval | data_model | 7 | D-5.3-001…005 (+2 more) | §22.10 / §22.13 / §22.18 / §22.20 | 7 KB entities missing fields — Managed Agent / Retrieval / Skills / Maya. | Author per §4 convention; bind to §22 KB rewrite (post-v7.0.0). | Engineering | M11.3 | M | PROD-186 | AE rows per §22 entity |
| 13 | BL-P1-PH22-FW | Phase 2.2 | firewall_leakage | 6 | D-2.2-001…005 (+1 more) | §4.4 + §27 + §50 | 6 firewall leakage defects where seller-side or buyer-side payload leaks across console boundary. | Author per-recipient redaction matrix; HMAC pseudonym pattern (mirror AE-PH6R-001); CI gate `<feature>_no_cross_console_leak`. | Engineering + Security | M02.3 | M | PROD-011 | AE-PH6R-001 pattern extension |
| 14 | BL-P1-PH4P412-DRIFT | Phase 4 — Prompt 4.12 — §21 Sourcera Agent | consistency_drift | 6 | D-4.12-001…005 (+1 more) | §21.4 series | 6 §21 Sourcera-Agent terminology drift items across §21 / §22 / §34. | Normalize naming to §21.4 CapabilityRegistryEntry canonical names; cite single authoritative home. | Engineering | — | M | DOC-016 | — |
| 15 | BL-P1-PH4P44-NUM | Phase 4 — Prompt 4.4 — §13 Scoring & Grading | numerical_singleton | 6 | D-4.4-001…005 (+1 more) | §13.x + §34 | 6 inline literals in §13 scoring/grading — move to §34 / §39 / §44 canonical homes. | Replace literals with citation; add CI gate per-section if a singleton class is at risk. | Engineering | release-orchestration | M | PROD-095 | — |
| 16 | BL-P1-PH4P46-DM | Phase 4 — Prompt 4.6 — §15 TCO Modeling | data_model | 6 | D-4.6-001…005 (+1 more) | §4.4 TCO entities + §15 | 6 TCO modeling entities missing field tables. | Author per §4 convention; bind to §15 narrative; retention citation. | Engineering | M02.3 | M | PROD-108 | AE rows per TCO entity |
| 17 | BL-P1-PH9P91-INSTR | Phase 9 — Prompt 9.1 — Appendix G PostHog | instrumentation_gap | 6 | D-9.1-001…005 (+1 more) | Appendix G | 6 Appendix G PostHog event taxonomy gaps — Datadog metric + AuditEvent triad incomplete. | Author Appendix G PostHog event + Datadog metric + AuditEvent triad per surface. | Engineering | M21.3 | M | PROD-272 | — |
| 18 | BL-P1-PH142-DRIFT | Phase 14.2 — Master Spec ↔ Seller Pricing v3 | consistency_drift | 5 | D-14.2-001…005 | §34 + SPS v3 narrative | 5 cross-doc drift items between Master Spec §34 and Seller Pricing Strategy v3. | Reconcile per source-of-truth hierarchy (§34 wins on numbers); update SPS v3 narrative to cite §34. | Pricing | — | M | DOC-047 | — |
| 19 | BL-P1-PH22-NUM | Phase 2.2 | numerical_singleton | 5 | D-2.2-006…010 | §4.4 + §22 + §27 | 5 inline literals in entity narratives; should cite §34/§39/§44 canonical homes. | Replace inline; cite source table. | Engineering | release-orchestration | M | PROD-012 | — |
| 20 | BL-P1-PH24-DM | Phase 24 — §24 Seller Console Q&A/NDA/Inbox | data_model | 5 | D-24-001…005 | §4.4.x + §24 | 5 seller-console Q&A/NDA/Inbox entities missing field tables. | §4 convention authoring; bind to §24 narrative. | Engineering | M11.3 | M | PROD-199 | AE rows per entity |
| 21 | BL-P1-PH3419-DM | Phase 34.19 — Plan Upgrade/Downgrade | data_model | 5 | D-34.19-001…005 | §34.19 + §4.8 wallet/billing | 5 upgrade/downgrade carry-over entities missing field tables. | §4 authoring + downgrade path state-machine cross-link. | Engineering + Pricing | M02.3 | M | PROD-165 | — |
| 22 | BL-P1-PH37-A11Y | Phase 37 — Accessibility & i18n | accessibility | 5 | D-37-001…005 | §37.x | 5 accessibility AC gaps — color contrast, screen reader, focus management. | Author WCAG 2.1 AA AC rows; bind to `accessibility_audit_v7_1_aa_full` CI gate (V12 closure). | Design + Engineering | — | M | PROD-284 | — |
| 23 | BL-P1-PH4P411-DM | Phase 4 — Prompt 4.11 — §20 Inbox & Pulse | data_model | 5 | D-4.11-001…005 | §4.4 + §20 | 5 Inbox/Pulse entities missing field tables. | §4 authoring. | Engineering | M02.3 | M | PROD-150 | AE rows per entity |
| 24 | BL-P1-PH42-API | Phase 4.2 | api | 5 | D-4.2-001…005 | §32 + §4.4 entity endpoints | 5 §32 API endpoints missing method/auth/scopes/cursor/schema/error semantics. | §32 convention authoring. | Engineering | M02.3 | M | PROD-049 | — |
| 25 | BL-P1-PH5P55-DM | Phase 5 — Prompt 5.5 — §24 Q&A/NDA/Inbox/Pulse | data_model | 5 | D-5.5-001…005 | §4.4 + §24 | 5 seller-console workflow entities missing field tables. | §4 authoring; bind to §24 walks. | Engineering | M11.3 | M | PROD-231 | AE rows per entity |
| 26 | BL-P1-PH22-DM | Phase 2.2 | data_model | 4 | D-2.2-011…014 | §4.4 series | 4 §4.4 entities missing field tables (DSAR + Vendor Opt-Out + HeatMap). | §4 authoring; bind to D-2.2-042 P0 closure. | Engineering | M02.3 | M | PROD-014 | — |
| 27 | BL-P1-PH50-RBAC | Phase 50 — §50 Ops Console | rbac | 5 | D-50-004, D-50-005, D-50-008, D-50-009, D-50-016 | §50.3.2 | 5 §50.3.2 Ops role × action × column matrix rows missing. | Author missing matrix rows; bind to canonical 6-role matrix per §50.3.1 (V12 closure). | Engineering | M02.3 | M | PROD-258 | — |
| 28 | BL-P1-PH50-ACC | Phase 50 — §50 Ops Console | acceptance_criteria | 4 | D-50-001…004 | §50.x | 4 Ops-Console feature AC blocks missing testable ACs. | Author per §13.10 style. | Engineering | M02.3 | M | PROD-256 | — |
| 29 | BL-P1-PHV12-CIG | Phase V12 — Operations / QA / Observability / DR | ci_gate | 4 | D-V12-001…004 | §M.5 V12 cluster + §42 / §46 | 4 V12-cluster CI gates lacking runtime wiring assignment. | Promote each from `spec_binding_pending_pack_<id>` to `runtime_active` under M21.3 / release-orchestration; bind to V12 AE rows. | Engineering | M21.3 | M | PROD-275 | V12 AE rows in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase V12 program section |
| 30 | BL-P1-PH8P84-ERR | Phase 8 — Prompt 8.4 — Appendix I | error_code | 4 | D-V8.4-001…004 | Appendix I | 4 error codes missing HTTP status / retry semantics / user-facing copy. | Append Appendix I rows; bind to per-endpoint error tables. | Engineering | M02.3 | M | PROD-270 | — |
| 31 | BL-P1-PH5P51-DM | Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage | data_model | 4 | D-5.1-001…004 | §4.5 + §9 | 4 Seller Triage entities missing field tables. | §4 authoring. | Engineering | M11.3 | M | PROD-179 | — |
| 32 | BL-P1-PH5P57-DM | Phase 5 — Prompt 5.7 — §49 Seller Onboarding | data_model | 4 | D-5.7-001…004 | §4.5 + §49 | 4 Seller Onboarding seven-stage flow entities missing field tables. | §4 authoring; bind to AE-V11-01 Hero Moment cluster where applicable. | Engineering | M11.3 | M | PROD-241 | AE-V11-01 |
| 33 | BL-P1-PH4P49-DM | Phase 4 — Prompt 4.9 — §18 Q&A Threads | data_model | 4 | D-4.9-001…004 | §4.4 + §18 | 4 Q&A Threads entities missing field tables. | §4 authoring. | Engineering | M02.3 | M | PROD-128 | — |
| 34 | BL-P1-PHHM-GROW | Phase HM — Hero Moment Walk | growth_mechanic_gap | 4 | D-HM-001…004 | §22.20 + §48 + §49 | 4 Hero Moment growth-mechanic gaps — conversion gates and amplifiers under-specified. | Author §48 growth-loop rows with conversion gate + amplifier + measurement; bind to AE-V11-01. | Analytics + Product | M11.3 | M | PROD-308 | AE-V11-01 |
| 35 | BL-P1-PH50-DM | Phase 50 — §50 Ops Console | data_model | 4 | D-50-010…013 | §4.6 + §50 | 4 Ops Console entities missing fields — OpsKillSwitchBundle + OpsSession + PlanTierOverrideProposal + sibling. | §4 authoring; bind to §50.3.1 / §50.6 / §50.20 V12 closure. | Engineering | M02.3 | M | PROD-257 | V12 AE rows |
| 36 | BL-P1-PHV711-CIG | Phase V711 — v7.1.1 Readiness Audit | ci_gate | 4 | D-V711-006…009 | §M.5 catalog + release pipeline | 4 v7.1.1 stamp-gate readiness gates lacking runtime wiring. | Promote to release-stamp-gate; bind to `tools/release/stamp_gate.ts`. | Engineering | release-orchestration | M | PROD-310 | AE-14.18.1-01 reopen |
| 37 | BL-P1-PH2-AC | Phase 2 — §2 Sourcera Method | acceptance_criteria | 4 | D-2-001…004 | §2.x | 4 §2 Sourcera Method ACs missing testable form. | Author numbered ACs per §13.10 style; bind to §2.8 Single-Operator Mode. | Engineering | M11.3 | M | PROD-022 | AE-14.14-21 (§2.8.7 AC #5 deadline-countdown TZ rule; READY) |
| 38 | BL-P1-PH9P92-DSAR | Phase 9 — Prompt 9.2 — DSAR Cross-Cascade | dsar | 4 | D-9.2-001…004 | §6.8.4 + §6.8.5 | 4 DSAR cross-cascade integrity walks revealed missing class-coverage. | Per-class cascade authoring; bind to AE-V11-02 override-prohibition. | Engineering + Legal | M11.3 | M | PROD-273 | AE-V11-02 + AE-12.3-04 |
| 39 | BL-P1-PHKB18-DRIFT | Phase KB18 — KB Eng ↔ §22 Cross-Check | consistency_drift | 4 | D-KB18-001…004 | §22 + retired KB spec | 4 §22 ↔ retired KB Engineering Spec drift items detected by exhaustive cross-check. | Reconcile to §22 canonical (retired KB spec is historical); update narrative anchors. | Engineering | — | M | DOC-049 | — |
| 40 | BL-P1-PHAE-AE | Phase AE — Authored Extensions Audit | authored_extension | 4 | D-AE-001…004 | AE Ledger | 4 AE-ledger hygiene defects — missing `depends_on:` / status / source-artifact rows. | Append `depends_on:` annotations + status flags; mirror D-V14-003 fix shape. | Audit | release-orchestration | S | PROD-312 | All AE rows touched per ledger walk |
| 41 | BL-P1-PHV13-CIG | Phase V13 — V13 Adversarial | ci_gate | 4 | D-13V-001…004 | §M.5 V13 cluster | 4 V13-cluster CI gates lacking runtime wiring. | Promote per gate to runtime_active in M02.3 / M21.3. | Engineering | M02.3 | M | PROD-307 | V13 AE rows |
| 42 | BL-P1-PHPT-DOC | Phase PT — §34.1 Plan-Tier Walk | documentation_gap | 4 | D-PT-001…004 | §34.1 series | 4 §34.1 plan-tier narrative gaps. | Author missing prose; cite §34.1 tables; no inline literals. | Pricing | — | M | DOC-038 | — |
| 43 | BL-P1-PH50-OBS | Phase 50 — §50 Ops Console | observability | 3 | D-50-018…020 | §50 + §42 | 3 Ops Console surfaces missing observability rows. | Author §42 observability row per surface; PagerDuty routing. | Engineering | M21.3 | S | PROD-259 | — |
| 44 | BL-P1-PHV12-DOC | Phase V12 — Adversarial | documentation_gap | 3 | D-V12-005…007 | §42 + §50 + §M.5 | 3 V12-cluster documentation gaps. | Author missing prose; cite V12 closure block. | Audit | — | S | DOC-046 | — |
| 45 | BL-P1-PH4-DM | Phase 4 | data_model | 3 | D-4-001…003 | §4.4 | 3 §4.4 entities missing field tables (§13 grading + sibling). | §4 authoring. | Engineering | M02.3 | S | PROD-040 | — |
| 46 | BL-P1-PHCONS-DOC | Phase CONS — Ledger Hygiene | documentation_gap | 3 | D-CONS-001, D-CONS-006, D-CONS-007 | DEFECT_LEDGER.md | 3 ledger-hygiene gaps — propagation + dedup + links sweep. | Run the canonical/supplementary propagation script; per-cluster dedup walk; links completeness sweep. | Audit + Engineering | — | M | DOC-044 | — |
| 47 | BL-P1-PHV711-DOC | Phase V711 — v7.1.1 Readiness | documentation_gap | 3 | D-V711-001…003 | V711_READINESS.md + DEFECT_LEDGER | 3 v7.1.1 readiness backlog hygiene items. | Update `V711_READINESS.md` aggregate; cross-flag D-RES-004. | Audit | — | S | DOC-051 | — |
| 48 | BL-P1-PH4P410-DM | Phase 4 — Prompt 4.10 — §19 Template Library | data_model | 3 | D-4.10-001…003 | §4.4 + §19 | 3 Template Library entities missing field tables. | §4 authoring. | Engineering | M02.3 | S | PROD-139 | — |
| 49 | BL-P1-PH8-OBS | Phase 8 | observability | 3 | D-8-001…003 | §42 + Appendix G | 3 §42 observability rows missing for §32 API endpoints. | Author per-endpoint observability row; PagerDuty + AuditEvent. | Engineering | M21.3 | S | PROD-247 | — |
| 50 | BL-P1-PH51-INSTR | Phase 51 — §51 PLG Instrumentation | instrumentation_gap | 3 | D-51-001…003 | §51 + Appendix G | 3 §51 product-usage analytics events missing PostHog/Datadog/AuditEvent triad. | Author triad per surface. | Engineering | M21.3 | S | PROD-306 | — |

**Coverage of the top-50:** ~~269 of 808 P1 defects (33.3%)~~ → **see §3.1 Amendments below (v7.2.0-REM Phase 11 Scope-Hygiene, 2026-06-14).** The "269 / 33.3%" figure was an aspirational coverage target and does **not** reconcile to the enumerated cluster sizes: the Count column above sums to **337**. The remaining P1 defects live in the smaller clusters addressed via the cross-phase programs in §3.2.

#### §3.1 Amendments — v7.2.0-REM Phase 11 Scope-Hygiene (2026-06-14)

Executes findings F-2 / F-4 / F-5 of `_audit/PHASE11_REM_VERIFY.md`. Pre-edit backup: `_versions/REMEDIATION_BACKLOG.md.pre-v72REM-Phase11-remedy-2026-06-14.md` (76,998 bytes; md5 `79a55df5704c2786e5532e84c98d7f1d`). The table rows above are preserved verbatim (non-destructive, per D-AE-016 discipline); the corrections below are authoritative and supersede the affected cells.

**F-4 — Authoritative count reconciliation.** The top-50 Count column sums to **337**, not 269. After the F-5 corrections below (−6 phantom, −3 count fixes) the **backed top-50 P1 inventory is 328 across 48 backed clusters**. The "269 / 33.3%" headline is retired. (808 total truly-open P1 at the 2026-05-13 snapshot still splits as top-50 + §3.2 cross-phase; the §3.2 residual figure inherits the same Count-basis caveat and is re-derived in the Phase 12 verification, not here.)

**F-5 — Defect-ID provenance corrections (8 non-resolving clusters).** The §3.1 sample-ID cells below did not resolve against the live `DEFECT_LEDGER.md`; corrected:

| Rank | Cluster | §3.1 cell (wrong) | Correct (live ledger) | Note |
|---:|---|---|---|---|
| 8 | BL-P1-PH8P83-NOTIF | `D-8.3-001…005` | **`D-V8.3-002, -003, -004, -005, -007 …`** (family); 2026-06-21 status: D-V8.3-002 remediated by AE-V72REM-CRM-SYNC-WEBHOOK-CANONICALITY-01; residual notification row starts at D-V8.3-003. | Dropped "V"; cluster is real. CRM Sync subset closed; non-CRM Appendix C work remains open. |
| 29 | BL-P1-PHV12-CIG | `D-V12-001…004` | **`D-12V-001…004`** | Renumber convention (`D-12V`, mirrors `D-13V`). V12-closed — see F-2. |
| 44 | BL-P1-PHV12-DOC | `D-V12-005…007` | **`D-12V-005…007`** | Renumber; V12-closed family — see F-2. |
| 41 | BL-P1-PHV13-CIG | `D-V13-001…004` | **`D-13V-001…004`** (6 P1; classes acceptance_criteria / documentation_gap / instrumentation_gap) | Renumber; `ci_gate` class label is loose — actual classes vary; cluster open. |
| 39 | BL-P1-PHKB18-DRIFT | `consistency_drift`, 4, `D-KB18-001…004` | **enum + numerical_singleton, 3, `D-KB18-001, -003, -004`** | Class + count corrected (D-KB18-002 is not P1). |
| 42 | BL-P1-PHPT-DOC | `documentation_gap`, 4, `D-PT-001…004` | **numerical_singleton, 2, `D-PT-001, -002`** | Class + count corrected. |
| 45 | BL-P1-PH4-DM | `data_model`, 3, `D-4-001…003` | **UNBACKED — no canonical rows** | `D-4-*` exists in neither ledger nor `_scratch_p1_clusters.md`; row is spurious. Re-derive or drop at execution. |
| 49 | BL-P1-PH8-OBS | `observability`, 3, `D-8-001…003` | **UNBACKED — no canonical rows** | `D-8-*` exists in neither ledger nor scratch inventory; row is spurious. Re-derive or drop at execution. |

**F-2 — De-scope of Phase V12-closed clusters (removed from the Phase 11 execution surface).** Every §50 and D-12V P1 defect was closed by **Phase V12 (2026-05-11, ratified v7.2.0-REM Phase 9)**; canonical-row status was propagated `open → remediated 2026-06-14` in `DEFECT_LEDGER.md → v7.2.0-REM Phase 11 Scope-Hygiene Remediation` (38 rows: 31 §50 + 7 D-12V). The following clusters are therefore **closed, not Phase 11 execution work**:

| Rank | Cluster | §3.1 Count | Disposition |
|---:|---|---:|---|
| 27 | BL-P1-PH50-RBAC | 5 | Closed via Phase V12; canonical rows propagated 2026-06-14. |
| 28 | BL-P1-PH50-ACC | 4 | Closed via Phase V12; canonical rows propagated 2026-06-14. |
| 35 | BL-P1-PH50-DM | 4 | Closed via Phase V12; canonical rows propagated 2026-06-14. |
| 43 | BL-P1-PH50-OBS | 3 | Closed via Phase V12; canonical rows propagated 2026-06-14. |
| 29 | BL-P1-PHV12-CIG (`D-12V`) | 4 | Closed via Phase V12; canonical rows propagated 2026-06-14. |
| 44 | BL-P1-PHV12-DOC (`D-12V`) | 3 | Closed via Phase V12; canonical rows propagated 2026-06-14. |

**F-3 cross-reference (not a §3.1 edit).** BL-P1-PH32-PLAN (rank 3) is no longer a 20-row open execution surface. D-3.2-004 / D-3.2-005 were closed by the 2026-06-21 §5.11.2 / §5.11.3 RBAC/Marketplace overlay pass; D-3.2-006 / D-3.2-012 / D-3.2-014 were closed by the 2026-06-21 Ops M9-M13 + Seller Template pass; D-3.2-007 through D-3.2-023 remain remediated from the Phase 11 F-3 scope-hygiene propagation. The true residual is the D-3.2-001 / D-3.2-002 / D-3.2-003 Min-Tier / Solo structural body rewrite plus the §5.11 27-location inline tier-list audit (Phase 14.9.2), **not** the full 20.

**Net effect on the Phase 11 execution surface.** 48 backed clusters; 6 clusters fully de-scoped (F-2, V12-closed); BL-P1-PH32-PLAN reduced to the three partially-remediated Min-Tier / Solo structural rows plus the inline tier-list audit (F-3); 2 clusters unbacked (F-5, rows 45/49). The genuine remaining Phase 11 authoring surface is the open P1 in the ~40 remaining backed clusters (re-derive exact IDs per the F-5 corrections before execution).

### §3.2 Cross-Phase Programs (≥3 phases share same class)

These are recommended reconciliation passes modeled on the Phase 6 catalog-completeness sweep. Each program closes a large class of defects in one focused authoring cadence rather than 10–30 per-phase sessions.

| Program | Class | Phase count | Defect count | Approach | Owner | Pack | Effort | Linear |
|---|---|---:|---:|---|---|---|---|---|
| Cross-phase data_model program | data_model | 34 | 104 | One reconciliation pass per implementation pack: author all missing §4 field tables with retention + scope + indexes; AE row per entity authored. | Engineering | M02.3 / M11.3 | XL | PROD-400 |
| Cross-phase acceptance_criteria program | acceptance_criteria | 23 | 79 | One pass per feature area; author numbered ACs per §13.10 / §14.9 / §17.8 / §20.7 style. | Engineering | — | XL | PROD-401 |
| Cross-phase enum program | enum | 26 | 69 | Bulk Appendix J registration pass; mirror Phase 6 catalog-completeness sweep mechanics. | Engineering | M02.3 | L | PROD-402 |
| Cross-phase plan_gating program | plan_gating | 22 | 64 | §5.11 + §34.1 + §39 row triplets per feature; no inline literals; cite tables. | Engineering | release-orchestration | XL | PROD-403 |
| Cross-phase numerical_singleton program | numerical_singleton | 32 | 63 | One-pass inline-literal scrub; replace each with citation to §34 / §39 / §44 / §6.8 / §40.2 / §42.1 canonical home. | Engineering | release-orchestration | L | PROD-404 |
| Cross-phase consistency_drift program | consistency_drift | 25 | 51 | Per-class normalization passes (terminology / anchor / numeric / appendix-reference). | Engineering | — | L | DOC-100 |
| Cross-phase api program | api | 21 | 46 | One-pass §32 convention authoring; method / path / auth / rate-limit / cursor / schema / errors / idempotency / examples. | Engineering | M02.3 | L | PROD-405 |
| Cross-phase webhook program | webhook | 21 | 43 | One-pass §31 convention authoring; HMAC / event_id / backoff / DLQ / payload cap / Appendix C+G registration. | Engineering | M02.3 | L | PROD-406 |
| Cross-phase documentation_gap program | documentation_gap | 20 | 42 | One-pass narrative completion; cite Master Spec authoritative source-of-truth. | Engineering | — | L | DOC-101 |
| Cross-phase state_machine program | state_machine | 17 | 26 | Replace prose state descriptions with From / To / Trigger / Conditions / Notes tables; cover concurrency + re-drive. | Engineering | M02.3 | M | PROD-407 |
| Cross-phase retention program | retention | 16 | 22 | Per-class §40.2 row authoring; TTL + anonymization + DSAR cascade. | Engineering | M11.3 | M | PROD-408 |
| Cross-phase firewall_leakage program | firewall_leakage | 12 | 21 | Apply per-recipient redaction matrix + HMAC pseudonym pattern (mirror AE-PH6R-001 / AE-PH6R-013); CI gate per surface. | Engineering + Security | M02.3 | L | PROD-409 |
| Cross-phase dsar program | dsar | 12 | 21 | Per-class §6.8.4 cascade row; AE-V11-02 override-prohibition; class-coverage CI gate. | Engineering + Legal | M11.3 | M | PROD-410 |
| Cross-phase notification program | notification | 11 | 21 | Appendix C row authoring with channel × role × plan-gating matrix; default retry binding. | Engineering | M02.3 | M | PROD-411 |
| Cross-phase rbac program | rbac | 6 | 20 | §5.11 Feature Access Matrix row authoring per role × action × column. | Engineering | M11.3 | M | PROD-412 |
| Cross-phase surface_engine_mapping program | surface_engine_mapping | 15 | 17 | Appendix M.1 row authoring per surface; companion-doc anchor; tier-visibility; override-path. | Engineering | release-orchestration | M | PROD-413 |
| Cross-phase error_code program | error_code | 10 | 16 | Appendix I row authoring per code; HTTP status + retry semantics + user-facing copy. | Engineering | M02.3 | M | PROD-414 |
| Cross-phase instrumentation_gap program | instrumentation_gap | 4 | 14 | Appendix G PostHog + Datadog metric + AuditEvent triad per surface. | Engineering | M21.3 | M | PROD-415 |
| Cross-phase ci_gate program | ci_gate | 5 | 8 | Promote gates from `spec_binding_pending_pack_<id>` to `runtime_active` under M02.3 / release. | Engineering | release-orchestration | M | PROD-416 |
| Cross-phase entitlement program | entitlement | 5 | 8 | §34.8.5 entitlement-matrix row authoring per plan × capability × enforcement-mode; bind to §21.4 registry. | Engineering | M11.3 | M | PROD-417 |
| Cross-phase residency program | residency | 6 | 8 | §1.6 + §40 + §42 residency clause per data class (US / EU / custom). | Engineering + Ops + Legal | M11.3 | M | PROD-418 |
| Cross-phase posthog_event program | posthog_event | 5 | 7 | Appendix G PostHog event registration per surface; property schema + console scope. | Engineering | M21.3 | M | PROD-419 |
| Cross-phase growth_mechanic_gap program | growth_mechanic_gap | 3 | 5 | §48 growth-mechanic loop row per surface; conversion gate + amplifier; bind to AE-V11-01. | Analytics + Product | M11.3 | M | PROD-420 |
| Cross-phase observability program | observability | 3 | 5 | §42 observability row per surface; PagerDuty + AuditEvent + Datadog. | Engineering + Ops | M21.3 | M | PROD-421 |
| Cross-phase performance_budget program | performance_budget | 3 | 3 | §44 performance budget row per surface; p95 / p99 SLO + degradation behavior. | Engineering | release-orchestration | S | PROD-422 |

**Counterfactual coverage.** Three realistic P1 failure modes the programs cover:
1. **Per-class single-source erosion at scale** (numerical_singleton + consistency_drift programs). Without the one-pass scrub, ad-hoc per-phase edits perpetuate inline-literal drift.
2. **Webhook / API contract under-specification leading to engineer-by-engineer divergence** (webhook + api + state_machine programs). The §31 / §32 convention authoring is the only mechanism that prevents this.
3. **Plan-gating + entitlement matrix binding misses creating revenue-leakage paths** (plan_gating + entitlement + rbac programs). Each row triplet (§5.11 + §34.1 + §39) closes a buildable-but-wrong path.

---

## §4 P2 — Required for v7.x Continuous Improvement

605 truly-open P2 defects across 355 clusters in 68 phase blocks. Full cluster inventory at `_audit/_scratch_p2_p3_clusters.md`. Top-25 P2 clusters listed; remaining 330 clusters rolled into the cross-phase programs below.

### §4.1 Top-25 P2 Clusters

| Rank | Cluster | Phase | Class | Count | Pack | Effort | Linear |
|---:|---|---|---|---:|---|---|---|
| 1 | BL-P2-PH144-DRIFT | Phase 14.4 | consistency_drift | 12 | — | L | DOC-200 |
| 2 | BL-P2-PH46-AC | Phase 4.6 | acceptance_criteria | 8 | — | M | PROD-500 |
| 3 | BL-P2-PH51-AC | Phase 5.1 | acceptance_criteria | 8 | — | M | PROD-501 |
| 4 | BL-P2-PH8-HOOK | Phase 8 | webhook | 8 | M02.3 | M | PROD-502 |
| 5 | BL-P2-PH31-RBAC | Phase 3.1 | rbac | 7 | M11.3 | M | PROD-503 |
| 6 | BL-P2-PH35-DSAR | Phase 3.5 | dsar | 7 | M11.3 | M | PROD-504 |
| 7 | BL-P2-PHPT-DOC | Phase PT | documentation_gap | 7 | — | M | DOC-201 |
| 8 | BL-P2-PH22-DATA | Phase 2.2 | data_model | 6 | M02.3 | M | PROD-505 |
| 9 | BL-P2-PH34PXC-DOC | Phase 34.PXC | documentation_gap | 6 | — | M | DOC-202 |
| 10 | BL-P2-PH2-AC | Phase 2 | acceptance_criteria | 6 | — | M | PROD-506 |
| 11 | BL-P2-PH44-AC | Phase 4.4 | acceptance_criteria | 6 | — | M | PROD-507 |
| 12 | BL-P2-PH45-AC | Phase 4.5 | acceptance_criteria | 6 | — | M | PROD-508 |
| 13 | BL-P2-PH141-DRIFT | Phase 14.1 | consistency_drift | 6 | — | M | DOC-203 |
| 14 | BL-P2-PH12-DATA | Phase 1.2 | data_model | 5 | M02.3 | M | PROD-509 |
| 15 | BL-P2-PH33-DOC | Phase 3.3 | documentation_gap | 5 | — | M | DOC-204 |
| 16 | BL-P2-PH45-DOC | Phase 45 | documentation_gap | 5 | — | M | DOC-205 |
| 17 | BL-P2-PH3-DRIFT | Phase 3 (Audit, Second Pass) | consistency_drift | 5 | — | M | DOC-206 |
| 18 | BL-P2-PH2-EDGE | Phase 2 | edge_case_silence | 5 | — | M | PROD-510 |
| 19 | BL-P2-PHMD-DOC | Phase MD | documentation_gap | 5 | — | M | DOC-207 |
| 20 | BL-P2-PH8-OBS | Phase 8 | observability | 5 | M21.3 | M | PROD-511 |
| 21 | BL-P2-PH91-INST | Phase 9.1 | instrumentation_gap | 5 | M21.3 | M | PROD-512 |
| 22 | BL-P2-PH37-A11Y | Phase 37 | accessibility | 5 | — | M | PROD-513 |
| 23 | BL-P2-PH142-DRIFT | Phase 14.2 | consistency_drift | 5 | — | M | DOC-208 |
| 24 | BL-P2-PHS17-NUM | Phase S17 | numerical_singleton | 4 | — | M | PROD-514 |
| 25 | BL-P2-PHS17-DOC | Phase S17 | documentation_gap | 4 | — | M | DOC-209 |

### §4.2 P2 Cross-Phase Programs

Class roll-up of the 605 P2 defects; 28 of 30 P2 classes carry ≥3 phases. Pursue these in the v7.1.x continuous-improvement bandwidth between v7.1.1 and v7.2.0 stamps.

| Program | Class | Phase count | Defect count | Approach | Owner | Pack |
|---|---|---:|---:|---|---|---|
| Cross-phase P2 acceptance_criteria | acceptance_criteria | 31 | 83 | One-pass per-feature AC tightening; non-blocking. | Engineering | — |
| Cross-phase P2 documentation_gap | documentation_gap | 29 | 74 | One-pass narrative completion. | Engineering | — |
| Cross-phase P2 consistency_drift | consistency_drift | 30 | 68 | Per-class normalization. | Engineering | — |
| Cross-phase P2 data_model | data_model | 17 | 36 | §4 hygiene tightening; not blocking buildability. | Engineering | M02.3 |
| Cross-phase P2 numerical_singleton | numerical_singleton | 23 | 33 | Inline-literal scrub. | Engineering | release-orchestration |
| Cross-phase P2 observability | observability | 22 | 33 | §42 row tightening. | Engineering | M21.3 |
| Cross-phase P2 mobile_divergence | mobile_divergence | 21 | 23 | §38 Feature Parity Matrix row authoring per surface. | Design + Engineering | — |
| Cross-phase P2 enum | enum | 14 | 18 | Appendix J hygiene. | Engineering | M02.3 |
| Cross-phase P2 state_machine | state_machine | 14 | 18 | State-machine tightening. | Engineering | M02.3 |
| Cross-phase P2 retention | retention | 16 | 18 | §40.2 hygiene. | Engineering | M11.3 |
| Cross-phase P2 api | api | 11 | 16 | §32 tightening (non-blocking). | Engineering | M02.3 |
| Cross-phase P2 surface_engine_mapping | surface_engine_mapping | 13 | 16 | Appendix M.1 hygiene. | Engineering | release-orchestration |
| Cross-phase P2 firewall_leakage | firewall_leakage | 14 | 15 | Apply AE-PH6R-001 pattern; not blocking. | Engineering + Security | M11.3 |
| Cross-phase P2 plan_gating | plan_gating | 9 | 15 | §5.11 / §34.1 / §39 hygiene. | Engineering | release-orchestration |
| Cross-phase P2 authored_extension | authored_extension | 10 | 14 | AE ledger hygiene per Phase AE walk. | Audit | release-orchestration |
| Cross-phase P2 dsar | dsar | 7 | 14 | §6.8.4 hygiene. | Engineering + Legal | M11.3 |
| Cross-phase P2 rbac | rbac | 6 | 13 | §5.11 hygiene. | Engineering | M11.3 |
| Cross-phase P2 webhook | webhook | 6 | 13 | §31 / Appendix C / Appendix G hygiene. | Engineering | M02.3 |
| Cross-phase P2 accessibility | accessibility | 5 | 10 | WCAG 2.1 AA tightening. | Design | — |
| Cross-phase P2 instrumentation_gap | instrumentation_gap | 5 | 9 | Appendix G triad hygiene. | Engineering | M21.3 |
| Cross-phase P2 residency | residency | 7 | 8 | §1.6 / §40 / §42 hygiene. | Engineering + Ops | M11.3 |
| Cross-phase P2 glossary | glossary | 7 | 7 | Appendix K hygiene. | Engineering | — |
| Cross-phase P2 ci_gate | ci_gate | 4 | 6 | §M.5 catalog hygiene. | Engineering | release-orchestration |
| Cross-phase P2 notification | notification | 4 | 5 | Appendix C hygiene. | Engineering | M02.3 |
| Cross-phase P2 i18n | i18n | 3 | 5 | §37 i18n tightening. | Design | — |
| Cross-phase P2 posthog_event | posthog_event | 5 | 5 | Appendix G hygiene. | Engineering | M21.3 |
| Cross-phase P2 error_code | error_code | 3 | 4 | Appendix I hygiene. | Engineering | M02.3 |
| Cross-phase P2 edge_case | edge_case | 3 | 3 | Edge-case authoring. | Engineering | — |
| Cross-phase P2 performance_budget | performance_budget | 3 | 3 | §44 tightening. | Engineering | release-orchestration |
| Cross-phase P2 error_state | error_state | 3 | 3 | Error-state authoring. | Engineering | M02.3 |

---

## §5 P3 — Cosmetic / Hygiene (Single Sweep Epic)

189 truly-open P3 defects across 24 class roll-ups, 59 phases. Treat the entire P3 inventory as one v7.1.x mechanical-hygiene epic; do not file per-phase tickets.

**Epic.** Sourcera v7.1.x Mechanical-Hygiene Sweep (`DOC-EPIC-P3`).

**Approach.** Single dedicated reconciliation pass authored by one engineer in 2-3 focused sessions, modeled on the Phase 6 catalog-completeness sweep mechanics:

1. Sort all 189 P3 defects by Master Spec line number ascending.
2. Walk the spec top-to-bottom; apply each P3 mechanical edit in place.
3. Commit in section batches (§1–§5 / §6–§13 / §14–§22 / §23–§34 / §35–§51 / Appendices).
4. Append AE rows per mechanical sweep block.

| Class | Count | Phases | Approach | Linear |
|---|---:|---|---|---|
| documentation_gap | 62 | 23 phases | Append missing prose; cite authoritative source-of-truth; mirror D-1.2-001-class shape (Defense View re-homing). | DOC-001 |
| consistency_drift | 47 | 22 phases | Normalize cross-section / cross-doc terminology; cite single authoritative home. | DOC-002 |
| enum | 16 | 11 phases | Backfill Appendix J `Since.*` markers per Phase 12.5 amendment pattern. | DOC-003 |
| numerical_singleton | 14 | 11 phases | Replace inline literals with canonical-table citations. | DOC-004 |
| glossary | 9 | 9 phases | Author missing Appendix K entries — Policy Ingestion, PolicyDocument, PolicyControl, Framework Inference, Amendment Protocol, Batch Amendment, etc. | DOC-005 |
| webhook | 4 | 2 phases | Document explicit reuse of existing webhook events or author dedicated event per cascade. | DOC-006 |
| plan_gating | 4 | 3 phases | Replace inline tier references with `org_id.plan_tier ∈ §34.1.2 cell {tier_set}` form. | DOC-007 |
| documentation_drift | 4 | 2 phases | Cite-drift corrections (e.g., "Phase 14.6" → "Phase 14.9"). | DOC-008 |
| heading_syntax | 4 | 4 phases | Replace single-line pipe rows with proper four-column tables; preserve `## N.N Title {#n.n-title}` syntax. | DOC-009 |
| authored_extension | 3 | 3 phases | Reconcile AE status in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`; ratify or remove pending flag. | DOC-010 |
| state_machine | 3 | 3 phases | Author §3.10.x State Machine table per pattern. | DOC-011 |
| glossary_canonicality | 3 | 3 phases | Update §49.1.9 verbatim claim; remove duplicate registrations. | DOC-012 |
| acceptance_criteria | 2 | 2 phases | Reword AC #1 entries to align with single-source SLO citations. | DOC-013 |
| dsar | 2 | 1 phase | Re-author §6.8.1 line 9563 with full cascade enumeration. | DOC-014 |
| surface_engine_mapping | 2 | 2 phases | Sweep §45 surfaces against Appendix M.1; add unmapped surfaces (DPA artefact, privacy-policy page, subprocessor list). | DOC-015 |
| rbac | 2 | 2 phases | Replace "Ops Director" with canonical Ops role per §50.3 enum. | DOC-016 |
| numerical_singleton / consistency_drift | 1 | 1 phase | §1.5 retention column inline → §40.2 citation. | DOC-017 |
| api | 1 | 1 phase | §4.2 path syntax `:workspaceId` → `{workspace_id}` per §32. | DOC-018 |
| data_model | 1 | 1 phase | Add Reply-To column to §41.2 email catalog. | DOC-019 |
| performance_budget | 1 | 1 phase | §4.10 search index specification — author canonical index. | DOC-020 |
| observability | 1 | 1 phase | Add "Customer-visibility" paragraph to §9.1 Appendix G blocks. | DOC-021 |
| residency | 1 | 1 phase | §1.6 `custom` row footnote for Enterprise plan binding. | DOC-022 |
| ux_copy | 1 | 1 phase | §38.4 copy alignment to §38.8.3 canonical. | DOC-023 |
| firewall_leakage | 1 | 1 phase | §48.3 scope-isolation note (Ops-rollup only; never customer-surfaced). | DOC-024 |

**Effort.** ~3 days total (one engineer, focused).
**Stamp gate.** Not blocking v7.1.1; recommended cleanup before v7.2.0.
**AE Ledger.** Single AE row `AE-P3-SWEEP` flags the sweep; per-block sub-rows track per-class commits.

---

## §6 Cross-Cutting v7.1.x Programs (Preserved from Prior Backlog Seeds)

The following programs were authored during Phase 6 + Phase V11 + Phase V12 remediation passes and remain open. They are preserved verbatim from the 2026-05-06 seed plus the Phase V11 carry-over plus the Phase V12 §M.5 wiring set.

### §6.1 v7.1.1 Stamp-Gate Catalog-Completeness Sweep (Phase 6 P1; Bulk-Mechanical)

17 mechanical Appendix C / G / I / J / L / M registrations whose remediation is identical in shape. Deferred to a single dedicated reconciliation pass per the §25.3 Formalization 2026-04-24 model rather than ad-hoc per-defect edits.

| # | Defect | Class | Subject | Owner | Target | Acceptance criteria |
|---|---|---|---|---|---|---|
| 1 | D-6.1-002 | enum | `console_bridge_event_kind` registration in Appendix J (18 values) | Engineering | v7.1.1 | AC1: Appendix J row exists with all 18 source values. AC2: every source reference cites Appendix J. AC3: `appendix_j_enum_completeness` passes for the enum. |
| 2 | D-6.1-003 | enum | 4 Console Bridge Event enums in Appendix J (`event_direction`, `sync_status`, `failure_reason`, `conflict_resolution`) | Engineering | v7.1.1 | AC1: Appendix J rows exist for all 4 enums and values. AC2: §4.7.1 / §25 Bridge references cite those rows. AC3: no inline-only enum values remain in the Bridge event contract. |
| 3 | D-6.1-004 | enum | 5 Vendor Disqualification enums in Appendix J (`severity`, `trigger`, `notification_style`, `appeal_status`, `reversal_reason`) | Engineering | v7.1.1 | AC1: Appendix J rows exist for all 5 enums and values. AC2: §27 vendor-disqualification references cite Appendix J. AC3: `appendix_j_enum_completeness` passes for the 5-row set. |
| 4 | D-6.1-005 | webhook | `vendor.disqualified.org_level` registration in Appendix C + Appendix G | Engineering + Analytics | v7.1.1 | AC1: Appendix C row exists with event kind, payload, HMAC, retry, DLQ, and idempotency fields. AC2: Appendix G mirror exists with analytics payload. AC3: `appendix_c_to_appendix_g_coverage` passes. |
| 5 | D-6.1-006 | webhook | `console_bridge.dlq_entered` registration in Appendix C | Engineering | v7.1.1 | AC1: Appendix C row exists with retry class and DLQ semantics. AC2: §25 Bridge publisher cites the event. AC3: `appendix_c_webhook_catalog_completeness` passes for the row. |
| 6 | D-6.1-007 | webhook | `console_bridge.reconciliation_summary` registration in Appendix C | Engineering | v7.1.1 | AC1: Appendix C row exists with payload cap, retry, HMAC, and idempotency. AC2: §25 reconciliation publisher cites it. AC3: `webhook_default_retry_class` resolves the default retry curve. |
| 7 | D-6.1-008 | webhook | `seller.bid_response.amendment_needs_reverification` registration in Appendix C; 7 Bid-Response-Materialization PostHog events in Appendix G | Engineering + Analytics | v7.1.1 | AC1: Appendix C row exists for `seller.bid_response.amendment_needs_reverification`. AC2: Appendix G contains the 7 materialization events with payloads and consumers. AC3: Appendix C/G coverage scans pass. |
| 8 | D-6.1-009 | error_code | 8 vendor disqualification reversal codes in Appendix I | Engineering + QA | v7.1.1 | AC1: Appendix I contains all 8 error codes with HTTP status, retry semantics, user copy, and owner section. AC2: §27 reversal flows cite the codes. AC3: Appendix I error-code scan passes. |
| 9 | D-6.1-010 | error_code | `vendor_disqualification_global_ban_requires_dual_signoff` in Appendix I | Engineering + QA | v7.1.1 | AC1: Appendix I row exists for the code with HTTP status and retry semantics. AC2: §27 global-ban flow cites the row. AC3: QA fixture asserts the dual-signoff failure path emits the code. |
| 10 | D-6.1-011 | error_code | 9 Console Bridge / Materialization error codes in Appendix I | Engineering + QA | v7.1.1 | AC1: Appendix I contains all 9 Bridge / Materialization codes. AC2: §25 / §32 error tables cite the codes. AC3: retryability and user-facing copy are present for every code. |
| 11 | D-6.1-012 | webhook | Resolve `console_bridge_standard` retry-curve binding (rename to `bridge_apply_standard` non-webhook curve in §25.2.2; route Bridge-domain webhooks to F.1 standard) | Engineering | v7.1.1 | AC1: §25.2.2 defines `bridge_apply_standard` as a non-webhook curve. AC2: Bridge-domain webhooks cite Appendix F.1 standard retry. AC3: no Appendix C webhook row cites `console_bridge_standard`. |
| 12 | D-6.1-019 | enum | `disqualification_notification_failure_reason` in Appendix J | Engineering | v7.1.1 | AC1: Appendix J row exists with the complete value set. AC2: §27 notification-failure references cite Appendix J. AC3: enum completeness scan passes. |
| 13 | D-6.2-003 | notification | ~36 §27 webhook events in Appendix C | Engineering + Marketplace | v7.1.1 | AC1: Appendix C rows exist for all §27 webhook events in the source list. AC2: each row declares audience, retry, HMAC, DLQ, idempotency, and payload cap. AC3: `appendix_c_webhook_catalog_completeness` passes for the batch. |
| 14 | D-6.2-004 | posthog_event | Same ~36 webhook mirrors + ~14 observability-only events in Appendix G | Engineering + Analytics + Marketplace | v7.1.1 | AC1: Appendix G rows exist for all mirrored and observability-only §27 events. AC2: each row lists payload fields and consumer. AC3: Appendix C/G coverage passes for mirrored webhook events. |
| 15 | D-6.2-005 | enum | 13 §27 enums in Appendix J + 51 §27 error codes in Appendix I | Engineering + Marketplace + QA | v7.1.1 | AC1: Appendix J contains the 13 §27 enum rows. AC2: Appendix I contains the 51 §27 error-code rows. AC3: §27 references cite Appendix J / I instead of inline-only literals. |
| 16 | D-6.2-007 | state_machine | 10 §27 state machines in Appendix L (or explicit cross-references per APX-L preamble) | Engineering + Marketplace | v7.1.1 | AC1: Appendix L rows or explicit APX-L cross-references exist for all 10 state machines. AC2: each state machine uses From / To / Trigger / Conditions / Notes columns. AC3: owning §27 references resolve. |
| 17 | D-6.2-009 | surface_engine_mapping | 5 §27 surfaces in Appendix M (Hide Sponsored, Public Transparency Report, Pre-flight Scope Report, Featured Lane visual separation, Bid Window modal) | Engineering + Design + Marketplace | v7.1.1 | AC1: Appendix M rows exist for all 5 surfaces. AC2: each row carries spec home, surface metaphor, tier visibility, engine concept, and notes. AC3: `appendix_m_coverage_on_diff` passes for the surface batch. |

**Coordination owner.** Engineering (catalog plumbing) + Phase 14.5 AE-ratification queue. Per-row owners are listed in the table above.
**Effort.** 2-3 days focused pass; 1-2 days AE ledger ratification.
**Linear.** `PROD-CATALOG-COMPL`.
**Stamp gate.** v7.1.1 stamp blocked on every entry transitioning to `remediated`. CI gates `appendix_c_webhook_catalog_completeness`, `appendix_j_enum_completeness`, `appendix_c_to_appendix_g_coverage`, `webhook_default_retry_class`, `appendix_m_coverage_on_diff` cannot pass until this sweep closes.

### §6.2 Seller Signals Cluster (Phase 6.2 P1 Carry-Over)

| # | Defect | Class | Subject | Owner | Acceptance criteria |
|---|---|---|---|---|---|
| 18 | D-6.2-006 | data_model | Author 3 forward-referenced entities in §4.5.x: `MarketplaceMatchFeatureRegistry`, `MarketplaceMatchScoreModelVersion`, `MarketplaceMatchScoreSnapshot` at full §4.4-style fidelity. Mark as Authored Extensions and append rows to `AUTHORED_EXTENSIONS_LEDGER.md`. | Engineering | AC1: all 3 entities have §4-style field tables with id, org scope, audit fields, indexes, retention, DSAR, and soft-delete semantics. AC2: §27 references resolve to the new entity anchors. AC3: AE ledger rows are filed and owner-notified. |
| 19 | D-6.2-015 | data_model | Author `MarketplaceProactiveOffer` entity in §4.5.x at full field-table fidelity (currently referenced inline in §27.9.8 but never authored). | Engineering | AC1: `MarketplaceProactiveOffer` has a full §4-style field table, indexes, retention, DSAR, and state lifecycle. AC2: §27.9.8 cites the entity anchor. AC3: Appendix J / I rows are added for any new enum or error-code values introduced by the entity. |

**Effort.** 1 day per entity × 4 entities = 4 days.
**Linear.** `PROD-SS-CARRYOVER`.
**Stamp gate.** v7.1.1 — engineers cannot implement §27.4.11 / §27.9.8 without the schema.

### §6.3 Phase 11.5 — Engine-Concept M.1 Backfill Pack (AE-V11-04 deferred authoring)

Authored as a backlog item during Phase V11 remediation pass (2026-05-11). Body authoring deferred to a dedicated Phase 11.5 session because the volume (~135 rows) warrants its own authoring cadence with full per-anchor surface-metaphor / tier-visibility / notes-cell fidelity.

**Source enumeration.** `_audit/SURFACE_ENGINE_TRACE.md` §5.2 lists every missing engine-concept M.1 row by anchor family.

| Anchor family | Row count | Notes |
| :---- | :---- | :---- |
| §3 Interaction Patterns | 22 | Most are sub-pattern engine concepts; surface-metaphor cells will cite parent §3 row's surface |
| §50 Sourcera Ops Console | 15 engine-concept + 19 surface rows (D-11.1-001 cluster) | Customer-facing OpsSession projection + 13 Ops-internal entities + 6 admin-surface entities; tier-visibility mostly `Internal-only, never surfaced` |
| §51 Product Usage Analytics | 6 surface rows (D-11.1-002 cluster) + 4 engine concepts | Org-Level + User-Level Usage Dashboards (customer-visible) plus 4 seller dashboard panels |
| §25.2.3 Cross-Console Bridge / Sync Health | 3 surface rows (D-11.1-003 cluster) | Buyer-side Bridge Health, seller-side Sync Health, Ops Cross-Workspace Bridge Dashboard |
| §8.3 Triage Queue | 2 surface rows (D-11.1-004 cluster) | Buyer-side + seller-side triage queues |
| §11 Buyer Console nav shell | 4 surface rows (D-11.1-005 cluster) | Buyer Console Navigation Shell, Buyer Sidebar Navigation, Buyer Content Layout Regions, Buyer Persistent UI Elements |
| §13.11 Defense View + §13.12 EvalStarter | 3 engine concepts + 3 surface rows | Defense-View internal projection rows; EvalStarter capability-registry rows |
| §34 Plan-Tier engine concepts | 8 engine concepts | Plan-tier engine constructs not yet enumerated at row level |
| §26 Public Seller Pages | 7 engine concepts | SellerOrgPage + SellerSoftware + SoftwarePage public surface rows |
| §2 Sourcera Method | 6 engine concepts | Method-internal engine constructs |
| Appendix L / Appendix M self-references | 6 rows | Appendix-internal block-row aggregations |
| §1 / §6 / §7 / §8 / §14 / §15 / §20 / §22 / §29 / §38 / §40 / §47 misc | ~36 rows | Scattered engine concepts |
| Companion-doc engine concepts (AE-V11-04b sub-row) | ~50 rows | UX_Design_of_Sourcera.md + retired KB Eng + Buyer/Seller Pricing per `Companion: <doc>.md §<anchor>` syntax |

**Authoring approach.** One block per area-group banner. For each engine concept: explicit `Internal-only, never surfaced` Tier-visibility cell or surface-metaphor cell + plan-tier list.
**Acceptance criteria.** AC1: every missing concept enumerated in `_audit/SURFACE_ENGINE_TRACE.md` §5.2 either gets an Appendix M.1 row or an explicit appendix-internal block row. AC2: every authored row uses the positive-semantic `Tier visibility` convention, including `Internal-only, never surfaced` for engine-only concepts. AC3: every companion-doc concept uses `Companion: <doc>.md §<anchor>` syntax. AC4: `appendix_m_engine_to_surface_completeness` passes against the authored rows before the v7.1.2 stamp. AC5: AE-V11-04 transitions from `re-targeted to v7.1.2` to `approved`, and D-11.4-001 closes.
**Block path.** Phase 11.5 — dedicated Cowork session. Pre-edit backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-phase11_5-backfill-YYYY-MM-DD.md`. Companion AE row AE-V11-04 transitions `pending → approved` on closure.
**Release-gate dependency.** Superseded at v7.2.0-REM Phase 9 (2026-06-14): AE-V11-04 was re-targeted from v7.1.1 to v7.1.2, so v7.1.1 is no longer blocked on this pack. The v7.1.2 stamp gate remains blocked on AE-V11-04 closure; `appendix_m_engine_to_surface_completeness` remains blocked from `spec_binding_pending_pack_m02_3` to `runtime_active` until the backfill closes.
**Linear.** `PROD-PH115-M1-BACKFILL`.

| # | Defect | Class | Subject |
|---|---|---|---|
| 1 | D-11.4-001 | surface_engine_mapping | Engine-Concept M.1 Backfill Pack — ~135 missing rows authored in one Cowork session per anchor family above; AE-V11-04 sub-row records each cluster's authoring cadence |
| 2 | D-11.1-001 | surface_engine_mapping | §50 Sourcera Ops Console cluster — 19 surface rows + 15 engine-concept rows |
| 3 | D-11.1-002 | surface_engine_mapping | §51 Product Usage Analytics cluster — 6 surface rows + 4 engine concepts |
| 4 | D-11.1-003 | surface_engine_mapping | §25.2.3 Bridge / Sync Health cluster — 3 surface rows |
| 5 | D-11.1-004 | surface_engine_mapping | §8.3 Triage Queue cluster — 2 surface rows |
| 6 | D-11.1-005 | surface_engine_mapping | §11 Buyer Console nav shell — 4 surface rows |
| 7 | D-11.1-006 | surface_engine_mapping | §3 / §20 / §22 cross-surface cluster — ~22 rows |
| 8 | D-11.1-007 | surface_engine_mapping | UX Design component-level cluster — ~25 rows via `Companion:` syntax |
| 9 | D-11.4-003 | surface_engine_mapping | Companion-doc anchor pack (AE-V11-04b) — ~50 companion-doc engine concepts |

### §6.4 Phase 6.1 / 6.2 Build-Reasonable Ambiguity (P2 Documentation Tightening)

| # | Defect | Class | Subject | Owner | Acceptance criteria |
|---|---|---|---|---|---|
| 20 | D-6.1-015 | firewall_leakage | Replace `source_entity_version` on seller projection with opaque `bridge_source_handle_token = HMAC(source_entity_id ‖ source_entity_version ‖ bid_workspace_id, webhook_secret)` — same pattern as AE-PH6R-001. | Security + Engineering | AC1: seller projection no longer exposes raw `source_entity_version`. AC2: opaque HMAC token derivation is documented. AC3: cross-console leakage test rejects raw source identifiers. |
| 21 | D-6.1-016 | api | Audit and resolve HTTP 403 vs HTTP 422 status semantic on `vendor_disqualification_global_ban_requires_dual_signoff`. | Engineering | AC1: owning API section states the selected HTTP status. AC2: Appendix I row matches that status and retry behavior. AC3: negative API fixture asserts the selected response. |
| 22 | D-6.1-017 | observability | Author §4.7.1.2 "AuditEvent Emission per Bridge Transition"; new CI gate `bridge_event_audit_emission_completeness`. | Engineering | AC1: §4.7.1.2 exists with per-transition AuditEvent emission rules. AC2: the CI gate is registered in §M.5. AC3: Appendix G / AuditEvent references resolve for emitted events. |
| 23 | D-6.1-020 | mobile_divergence | Author mobile-parity rows in §25.2.3 (Bridge / Sync Health panels) and §25.3.8 (reversal banner) per §38 Feature Parity Matrix. | Design + Engineering | AC1: §25.2.3 and §25.3.8 state mobile rendering behavior. AC2: §38 Feature Parity Matrix references the same surfaces. AC3: mobile-empty, error, and degraded states are covered. |
| 24 | D-6.2-012 | consistency_drift | Update §27.9.5 / §27.9.5.1 / §27.9.6 / §27.9.12 / §27.9.13 to use canonical `tuple_distinctiveness_threshold_exceeded`; eliminate `distinctiveness_veto` aliasing. | Engineering | AC1: all named §27 anchors use `tuple_distinctiveness_threshold_exceeded`. AC2: `distinctiveness_veto` remains only in historical notes or is absent. AC3: Appendix J / error references use the canonical token. |
| 25 | D-6.2-013 | enum | Add `recompute_deadline_exceeded` to Appendix J `seller_signal_suppressed_reason` (rolls under §6.1 sweep #15). | Engineering | AC1: Appendix J value exists under `seller_signal_suppressed_reason`. AC2: §27 seller-signal suppression references cite Appendix J. AC3: enum completeness scan passes. |
| 26 | D-6.2-014 | enum | Author Appendix J `seller_signal_k_anon_state` (11 values); update §27.9.5 / §27.9.5.1 to use the enum. | Engineering | AC1: Appendix J row exists with all 11 values. AC2: §27.9.5 and §27.9.5.1 cite the enum. AC3: no inline-only `seller_signal_k_anon_state` values remain. |
| 27 | D-6.2-016 | numerical_singleton | §27.9.6.2 inline restatement of digest cadence — replace with citation to §34.1.2 cell **Seller Signals**; add deploy-time validator `seller_signal_cadence_single_source`. | Engineering | AC1: §27.9.6.2 cites §34.1.2 Seller Signals instead of restating cadence. AC2: `seller_signal_cadence_single_source` is registered and assigned a runtime path. AC3: validator rejects a stale inline cadence. |
| 28 | D-6.2-017 | enum | Confirm `webhook_delivery_audience_scope` enum value-set parity between §27.8.9 and §27.10.7 consumers. | Engineering | AC1: §27.8.9 and §27.10.7 cite the same Appendix J enum. AC2: value-set parity is stated or mechanically asserted. AC3: drift scan passes. |
| 29 | D-6.2-018 | mobile_divergence | Author §27.4.6 mobile-rendering subsection or §27.4.10 AC #6 mandating mobile parity. | Design | AC1: mobile behavior is authored in §27.4.6 or §27.4.10 AC #6. AC2: empty, loading, error, and degraded mobile states are covered. AC3: §38 parity matrix references the decision. |
| 30 | D-6.2-019 | notification | Add `marketplace_discovery.frequency_cap_bypass_suspected` to §27.11.7 webhook catalog (rolls under §6.1 sweep #13). | Engineering | AC1: §27.11.7 includes the webhook event. AC2: Appendix C row exists via §6.1 #13. AC3: audience and retry semantics match §31. |
| 31 | D-6.2-020 | data_model | Read §4.4.21 in full and verify `secondary_reviewer_user_id` field exists; if absent, add it as Authored Extension; add `verification_two_reviewer_required` to Appendix I. | Engineering | AC1: §4.4.21 either contains `secondary_reviewer_user_id` or an AE row adds it. AC2: Appendix I contains `verification_two_reviewer_required`. AC3: verification workflow cites the field and error code. |
| 32 | D-6.2-021 | acceptance_criteria | Add §27.5 numbered acceptance-criteria block — one-click EOI acceptance audit-trail invariants. | Engineering | AC1: §27.5 contains numbered ACs for one-click EOI. AC2: ACs cover audit trail, idempotency, auth failure, and retry behavior. AC3: referenced audit event / webhook rows resolve. |

**Effort.** ~5 days total across the cluster.
**Linear.** `PROD-PH6-AMBIGUITY`.

### §6.5 P3 Phase-6 Cosmetic / Hygiene

| # | Defect | Class | Subject | Owner | Acceptance criteria |
|---|---|---|---|---|---|
| 33 | D-6.1-021 | glossary | 5 Appendix K entries: "Bridge Health Panel", "Sync Health Panel", "Materialization Protocol", "Kill-Switch", "Fanout Group" | Engineering | AC1: Appendix K contains all 5 entries. AC2: owning §25 / §27 references cite the glossary terms. AC3: glossary canonicality scan passes. |
| 34 | D-6.1-022 | documentation_gap | Land §5.11 update for "Disqualification — All Tiers" core-workflow row | Engineering | AC1: §5.11 contains the core-workflow row. AC2: row cites the canonical disqualification surface. AC3: plan / role gating cells are non-empty. |
| 35 | D-6.1-023 | documentation_gap | Author §25.3.6 forbidden-phrase blocklist entity / Legal-review SLA / per-locale governance / audit trail | Legal + Engineering | AC1: §25.3.6 contains entity, SLA, locale governance, and audit-trail prose. AC2: new enum / error / audit terms are registered if introduced. AC3: Legal owner sign-off is recorded. |
| 36 | D-6.2-008 | glossary | 13 Appendix K entries for §27 multi-section terms | Engineering | AC1: Appendix K contains all 13 terms. AC2: §27 references cite the terms. AC3: glossary canonicality scan passes. |
| 37 | D-6.2-022 | consistency_drift | Replace §34.1 line 28666 citation `§27.10 (Verification Tiers)` with `§27.11.3 / §26.2 / §4.4.21 (Verification Tiers)` | Engineering | AC1: §34.1 citation points to the canonical verification-tier anchors. AC2: no normative citation points only to §27.10 for Verification Tiers. AC3: link scan resolves all cited anchors. |
| 38 | D-6.2-023 | consistency_drift | Choose canonical name "Score-Drift & Fairness Dashboard" and propagate to APX-M | Engineering | AC1: canonical name is chosen and recorded. AC2: Appendix M uses the canonical name. AC3: stale variants are absent or marked historical. |
| 39 | D-6.2-024 | consistency_drift | Normalize §27.11.7 endpoint paths to `/api/v1/...` per §32 canonical | Engineering | AC1: §27.11.7 endpoint paths use `/api/v1/...`. AC2: §32 matching endpoints resolve. AC3: no stale endpoint-path variants remain in the normative row. |
| 40 | D-6.2-025 | glossary_canonicality | Appendix K disambiguation note for `seller_marketing_editor` vs `ops_marketing_editor` | Engineering | AC1: Appendix K contains the disambiguation note. AC2: §5 / §50 role references cite the correct term. AC3: glossary canonicality scan passes. |

Rolled into the §5 P3 Single Sweep Epic.

### §6.6 Webhook-Audience-Redaction Sweep (v7.1.1)

The composite of D-6.1-001 + D-6.2-002 + D-6.2-010 + D-6.2-011 + D-V6-001 + D-V6-004 (six findings, all remediated in Phase 6 remediation pass) reveals a systemic webhook-payload over-exposure pattern. A cross-cutting sweep across §4.7.1, §25.7.10, §27.6.7, §27.8.9, §27.8.13, §27.9.9, §27.10.7, §31 confirms no analogous defects exist in non-audited surfaces.

**Pattern.** Every customer-audience webhook payload field must answer: (a) is this field a buyer-internal collection cardinality; (b) is this field a Sourcera Ops user UUID; (c) is this field a buyer/seller-internal identity that should be opaqued via per-recipient HMAC pseudonym.
**Effort.** 2 days.
**Owner.** Security + Engineering.
**Linear.** `PROD-WEBHOOK-REDACT-SWEEP`.

### §6.7 §M.5 Runtime Wiring for Phase 6 Remediation Gates (v7.1.1)

6 new CI gates authored in the Phase 6 remediation pass need runtime-wiring in M02.3 / M11.3 / M21.3 / M24.3 implementation packs per `Build_Execution_Strategy.md` §11:

| # | Gate | Pack | Owner | Target | Acceptance criteria |
|---|---|---|---|---|---|
| 1 | `console_bridge_seller_projection_no_cardinality_leak` | M02.3 (Console Bridge runtime) | Engineering — Console Bridge / Spec Lint | v7.1.1 | AC1: M02.3 artifact cites the gate ID and runs against Console Bridge seller projections. AC2: positive fixture with an opaque bridge handle and no raw cardinality / source-version fields passes. AC3: negative fixture exposing raw collection cardinality, `source_entity_version`, or source identifiers rejects with a gate-named failure. AC4: promotion to `runtime_active` follows §M.5.1.1. |
| 2 | `taxonomy_webhook_no_ops_user_identity_leak` | M21.3 (Marketplace) | Engineering — Marketplace | v7.1.1 | AC1: M21.3 webhook validator cites the gate ID and runs against taxonomy webhook payloads. AC2: positive fixture with no Ops user UUID / login / email passes. AC3: negative fixture carrying an Ops identity rejects or alerts before delivery. AC4: audit / observability evidence is captured before runtime-status promotion. |
| 3 | `abuse_report_webhook_no_ops_user_identity_leak` | M21.3 | Engineering — Marketplace | v7.1.1 | AC1: M21.3 webhook validator cites the gate ID and runs against abuse-report webhook payloads. AC2: positive fixture with reporter-safe pseudonymous fields passes. AC3: negative fixture leaking Ops reviewer identity rejects or alerts before delivery. AC4: promotion to `runtime_active` is blocked until positive, negative, and observability evidence exist. |
| 4 | `legal_process_non_disclosure_reporter_audience_suppression` | M21.3 | Engineering — Marketplace + Legal | v7.1.1 | AC1: M21.3 legal-process validator cites the gate ID and evaluates reporter audience selection. AC2: positive fixture for a non-disclosure legal-process case suppresses reporter-visible notification. AC3: negative fixture that routes a non-disclosure payload to reporter audience fails closed. AC4: Legal sign-off is attached to the runtime evidence before promotion. |
| 5 | `legal_process_non_disclosure_reporter_deferred_notification_temporal_decoupling` | M21.3 | Engineering — Marketplace + Legal | v7.1.1 | AC1: M21.3 runtime or scheduled-test artifact cites the gate ID and covers deferred reporter notifications. AC2: positive fixture holds notification until the legal dwell / disclosure-release condition is satisfied. AC3: negative fixture delivering before the dwell or release condition rejects and records the attempted early delivery. AC4: §42 observability evidence records both hold and release outcomes before promotion. |
| 6 | `marketplace_abuse_sla_single_source` | M21.3 (deploy-time validator) | Engineering — Marketplace | v7.1.1 | AC1: M21.3 deploy validator cites the gate ID and resolves the canonical marketplace-abuse SLA source. AC2: positive fixture with all SLA references citing the canonical source passes. AC3: negative fixture introducing an inline or divergent SLA value rejects with the stale reference named. AC4: runtime-status promotion follows §M.5.1.1 and the release stamp gate rechecks the evidence. |

**Effort.** 1-2 days per gate × 6 gates = 6-12 days across the packs.
**Linear.** `PROD-PH6-M5-WIRING`.

### §6.7.1 v7.2.0-REM Phase 2 Cross-Validator Follow-Ups (v7.1.1)

Four in-flight defects surfaced by the v7.2.0-REM Phase 2 verification pass (D-11.2-004 closure) at `_audit/PHASE_V72REM_PHASE_2_VERIFY.md` §4. None blocks v7.2.0-REM Phase 2 sign-off; all four land in v7.1.1 stamp gate under M02.3 + release-orchestration implementation packs.

| # | Defect | Severity | Class | Subject | Owner | Mitigation until landing |
|---|---|---|---|---|---|---|
| 1 | D-V72REM-PH2-001 | P3 | documentation_gap | Author Master Spec §M.4.4.2 Authoring Note: any post-§51 section addition or §32.8 endpoint amendment requires a paired update to `PREDICATE_1_CUSTOMER_SURFACE_ANCHORS` and `PUBLIC_PRICING_API_PATH_TOKENS` constants in `tools/spec-lint/cross_validation.ts`. | Engineering | n/a (documentation only) |
| 2 | D-V72REM-PH2-002 | P1 | ci_gate | Scope §M.4.4.2.E sub-check #3 attestation-paragraph regex to the section range that introduces the concept. Refactor `cross_validation.ts:667` to use `SpecParseTree.sections.get(specAnchor)?.range` instead of the full `spec.rawText` scan. | Engineering | §M.4.6 nightly digest reviewer SLA (2 BD spec-ops triage of every `override_applied` run); §M.4.4.2.G rejection comment surfaces the attestation paragraph's spec anchor for human review. |
| 3 | D-V72REM-PH2-003 | P1 | ci_gate | Author and wire `tools/spec-lint/sibling_override_cli.ts` (§M.4.4.5 sibling-override workflow-step entrypoint) and `tools/spec-lint/comment_templates.ts` canonicality verifier; bind to the §M.5 `spec_lint_comment_template_canonicality` and `appendix_m5_override_path_canonicalization` gate runtime statuses. | Engineering | §M.4 governance + `appendix_m5_self_consistency` meta-gate cluster catch §M.5 row amendments at the spec-tree boundary; race window is structurally zero for spec-side mutations. |
| 4 | D-V72REM-PH2-004 | P1 | ci_gate | Replace the `buildSpecParseTree` stub at `cross_validation.ts:209` with the production `remark-parse` AST walker; populate `SpecParseTree.sections` with the post-edit Master Spec heading anchors and their character/line offsets. | Engineering | Full-spec scan path (byte-correct, slower); §M.4.6.3 Datadog monitor catches gate-run timeouts > 15 minutes per `.github/workflows/spec-lint.yml:50`. |

**Effort.** ~1 day documentation (D-V72REM-PH2-001) + ~3 days code (D-V72REM-PH2-002, -003, -004) = ~4 days total.
**Linear.** `PROD-V72REM-PH2-FOLLOWUPS`.
**Stamp gate.** v7.1.1 — all four land before v7.1.1 stamps. v7.2.0-REM Phase 2 sign-off is unaffected (P0 closure complete).

**2026-06-21 closure update.** D-V72REM-PH2-002, D-V72REM-PH2-003, and D-V72REM-PH2-004 are remediated by the v7.2.0-REM Phase 2 CI Runtime P1 Pass. Evidence: `tools/spec-lint/cross_validation.ts` now builds section ranges and scopes internal-only attestation matching to the introducing section; `tools/spec-lint/sibling_override_cli.ts` and `tools/spec-lint/comment_templates.ts` are authored; `.github/workflows/spec-lint.yml` wires the comment-template verifier; §M.5 registers `appendix_m5_override_path_canonicalization` and `spec_lint_comment_template_canonicality` as `runtime_active`; `npm --prefix tools/spec-lint run typecheck` and `npm --prefix tools/spec-lint run all -- --no-emit` pass all blocking gates. Verification record: `_audit/PHASE_V72REM_PH2_CI_RUNTIME_P1_VERIFY.md`. D-V72REM-PH2-001 remains open as a separate P3 authoring-note follow-up.

### §6.8 §25.7 Internal Comments Full Sub-Section Audit (Phase 6.3)

Per `PHASE6_VERIFY.md` §1.4 caveat — §25.7 Internal Comments was sampled-only in Phase 6.1. Full §25.7.1–§25.7.14 sub-section walk should run as Phase 6.3 before Phase 7 advancement, OR §25.7 must be explicitly accepted as out-of-scope for Phase 6.
**Effort.** 1-2 days.
**Linear.** `DOC-PH6-3-S25-7-AUDIT`.

### §6.9 Phase V11 Mechanical Hygiene Pass

Composite mechanical-edit pass collecting V11 P2 / P3 items whose remediation is mechanical and identical-in-shape.

| # | Defect | Class | Subject |
|---|---|---|---|
| 1 | D-11.1-008 | surface_engine_mapping | UX Design component-level row prefix per the inventory's UX-Design audit-phase convention |
| 2 | D-11.4-002 | authored_extension | F-AE-016 → F-BC-001 inventory hygiene re-prefix (Breaking Change, not Authored Extension) |
| 3 | §M.5 schema backfill | ci_gate | Apply §M.5.3 schema mechanically to the 86 pre-V11 rows that did not receive in-place V11 amendments |
| 4 | M.1 tier-visibility cell normalization | surface_engine_mapping | Mechanically rewrite all M.1 rows that use the pre-V11 negative `Hidden from tier(s)` semantic to the positive `Tier visibility` semantic per §M.1.1 |

**Effort.** ~1 day.
**Linear.** `PROD-V11-HYGIENE`.

### §6.10 V4 Forward-Tracked P1 Cluster AC Summary (v7.1.1)

Closes the D-V711-014 backlog-authoring gap. The V4 spec-side remediation block in `_audit/DEFECT_LEDGER.md` forwards the Phase-4 sub-prompt P1 defects into v7.1.1, but the original prose forces an executor to dereference every canonical row. This table promotes one closure predicate per cluster.

**Count note.** The V4 source block states 152 sub-prompt P1 + 15 D-4.3 P1 = 167, while the later V4 counter reconciliation states 165 post-V4. A 2026-06-21 raw prefix extraction over canonical P1 rows returns 169 rows across the prefixes below. These counts are advisory; `_audit/DEFECT_LEDGER.md` canonical row status remains authoritative.

| Cluster prefix | Source findings file | Raw P1 rows | Owner | Cluster acceptance criteria |
|---|---|---:|---|---|
| `D-2-*` | `_audit/PHASE2_FINDINGS.md` (accepted Prompt-4.1 / §2 alias) | 14 | Engineering + Design | AC1: every open `D-2-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §2 Sourcera Method and §2.8 Single-Operator Mode carry numbered ACs, Solo/team edge cases, plan-gating citations, and Appendix M surface bindings required by the source rows. AC3: Appendix J / K / M and §M.5 references introduced by the fixes resolve. |
| `D-4.2-*` | `_audit/PHASE4.2_FINDINGS.md` (§10 Pipeline / Phase Advancement) | 23 | Engineering | AC1: every open `D-4.2-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §10, §32, Appendix I, Appendix J, Appendix L, and §M.5 agree on phase enum, phase-advancement API, state-machine, idempotency, error-code, and gate contracts. AC3: targeted scans prove no stale phase taxonomy or retired endpoint string remains in active normative text. |
| `D-4.3-*` / `D-12-*` alias | `_audit/PHASE4.3_FINDINGS.md` plus `_audit/PHASE12_FINDINGS.md` (§12 Policy Ingestion alias) | 15 | Engineering + Security | AC1: every open Prompt-4.3 / §12 P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §12 policy-ingestion entities, upload/security behavior, framework-detection enums, amendment state machines, APIs, webhooks, PostHog events, error codes, plan limits, DSAR/residency, and console-firewall behavior land at Master Spec fidelity. AC3: the D-12 alias wrapper resolves to the same closure evidence. |
| `D-4.4-*` | `_audit/PHASE4.4_FINDINGS.md` (§13 Scoring & Grading) | 14 | Engineering + Pricing | AC1: every open `D-4.4-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §13 scoring formulas, grading entities, numerical singletons, override semantics, audit events, plan-gating, and acceptance criteria cite their canonical homes. AC3: Appendix J / I / G / M rows and any §M.5 validators introduced for scoring pass targeted resolution checks. |
| `D-4.5-*` | `_audit/PHASE4.5_FINDINGS.md` (§14 Scenario Modeling) | 9 | Engineering + Pricing + Design | AC1: every open `D-4.5-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: Evaluation Scenario schema, parameter/results JSON schemas, lifecycle state machine, Phase-12 lock behavior, AIOperation mapping, plan gating, Appendix M rows, mobile/a11y behavior, and singleton values are authored in canonical sections. AC3: scenario API/error/state-machine checks resolve. |
| `D-4.6-*` | `_audit/PHASE4.6_FINDINGS.md` (§15 TCO Modeling) | 14 | Engineering + Pricing | AC1: every open `D-4.6-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §15 TCO entities, pricing-requirement fields, AIOperation contract, API endpoints, export behavior, mobile parity, retention, performance budgets, and numerical singletons cite §4 / §32 / §34 / §39 / §40 / §44 as appropriate. AC3: TCO appendices and §M.5 validators resolve. |
| `D-4.7-*` | `_audit/PHASE4.7_FINDINGS.md` (§16 Organizational Intelligence) | 12 | Engineering + Security + Analytics | AC1: every open `D-4.7-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §16 Intelligence Cache / Briefing behavior, Perplexity degradation, console firewall, APIs, plan gating, retention/DSAR, mobile parity, analytics, glossary, Appendix M rows, and cost/entitlement bindings are authored with observable ACs. AC3: cross-console non-carry and outage-handling checks pass. |
| `D-S17-*` | `_audit/PHASE17_FINDINGS.md` (accepted Prompt-4.8 / §17 alias) | 13 | Engineering + Analytics | AC1: every open `D-S17-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §17 Workspace Analytics entities, metrics, event taxonomy, API/export contracts, mobile parity, retention, plan gating, and Appendix M rows land under the PHASE17 alias. AC3: alias resolution from Prompt 4.8 to PHASE17 remains documented in the ledger or audit README. |
| `D-4.9-*` | `_audit/PHASE4.9_FINDINGS.md` (§18 Q&A Threads) | 14 | Engineering + Security | AC1: every open `D-4.9-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §18 thread/post/reply entities, visibility and masking rules, state machine, API endpoints, webhooks, error codes, notifications, retention/DSAR, cross-console firewall, and Appendix M rows are authored at full fidelity. AC3: private/public Q&A fixtures prove no cross-console leakage. |
| `D-4.10-*` | `_audit/PHASE4.10_FINDINGS.md` (§19 Template Library) | 12 | Engineering + Design | AC1: every open `D-4.10-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §19 template entities, versioning/fork semantics, sharing permissions, amendment protocol, plan gating, APIs, audit events, retention/DSAR, mobile parity, and Appendix M rows are canonical. AC3: template-version and fork-conflict tests resolve against Appendix I and §M.5 rows where applicable. |
| `D-4.11-*` | `_audit/PHASE4.11_FINDINGS.md` (§20 Inbox & Pulse) | 16 | Engineering + Design + Pricing | AC1: every open `D-4.11-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §20 Inbox / Pulse entities, Solo suppression, mobile parity, APIs, enums, plan gating, firewall behavior, notification channels, email-template singletons, AIOperation contract, UI states, and retention are authored in canonical homes. AC3: Appendix C / G / I / J / M and §M.5 checks resolve for all §20 additions. |
| `D-4.12-*` | `_audit/PHASE4.12_FINDINGS.md` (§21 Sourcera Agent) | 13 | Engineering + Pricing | AC1: every open `D-4.12-*` P1 row transitions `open → remediated` or is explicitly re-targeted / superseded. AC2: §21 Capability Registry, outcome signals/contracts, free/Solo invocation rules, registry-seed completeness, Authored Extension capability rows, state-machine dependencies, agent-instructions schema, and numerical singletons are reconciled to §4 / §21 / §34 / §39 / §44. AC3: capability-registry completeness and outcome-contract parity validators pass. |

**Effort.** Cluster execution is separate from this authoring pass; use the owning source findings file plus the canonical defect rows for row-level work.
**Linear.** `PROD-V4-FORWARD-P1-AC`.

---

## §7 Closed-in-Place Transitions

### §7.1 Phase 6 Remediation Pass (2026-05-06) — 15 Defects Closed

| defect_id | severity | spec sections edited |
|---|---|---|
| D-6.1-001 | P0 | §4.7.1 line 7793 + §4.7.1 line 7811 + Defense-in-Depth block |
| D-V6-001 | P0 | §4.7.1 line 7840 + §25.1.2 line 19698 |
| D-V6-004 | P2 | §4.7.1 line 7840 + §25.1.2 line 19698 (composite with D-V6-001) |
| D-V6-002 | P1 | §34.16.1 #3 / #4 + §34.16.8 AC #2 |
| D-V6-003 | P2 | §34.16.1 #3 + §34.16.8 AC #2 |
| D-V6-006 | P3 | §34.16.1 #1 + §27.11.2 weekly bid modal |
| D-V6-007 | P2 | §34.16.1 #2 + §34.16.7 error code table |
| D-V6-005 | P2 | §27.10.3 row #18 |
| D-6.1-013 | P1 | §7.2 + Appendix K |
| D-6.1-014 | P2 | §4.7.1 AC #2 |
| D-6.1-018 | P2 | §25.4 AC #4 |
| D-6.2-001 | P1 | §42.3.1 + §27.8.4 + §27.8.5 |
| D-6.2-002 | P1 | §27.6.7 + §27.8.9 + §27.8.11 AC #8 |
| D-6.2-010 | P1 | §27.8.13 Non-disclosure enforcement |
| D-6.2-011 | P1 | §27.8.13 Expiration of non-disclosure |

15 defects (2 P0, 6 P1, 6 P2, 1 P3) remediated in-place. Composite Authored-Extension ratification queue: AE-PH6R-001 through AE-PH6R-017.

### §7.2 Phase V11 Remediation Pass (2026-05-11) — Closed

3 P0 + 7 of 12 P1 ci_gate defects closed in-place. D-11.4-001 P1 deferred to Phase 11.5 as AE-V11-04 (see §6.3). Spec edits: §M.4 full rewrite; §M.5 full rewrite (19 new rows + 17 in-place amendments + 5 new schema columns + 9 anchored sub-headings + corrected post-V11 122-row arithmetic); §M.1 preamble + Admin Dashboard row anchor fix. Pre-edit Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V11-remediation-2026-05-11.md`. Full audit trail in `_audit/PHASE11V_FINDINGS.md` + `_audit/DEFECT_LEDGER.md` Phase V11 Spec-Side Remediation block.

### §7.3 Phase V12 Remediation Closure (2026-05-11) — 123 Defects Closed

8 P0 · 78 P1 · 29 P2 · 8 P3 = 123 defects across §42 / §43 / §46 / §50. §43 retired in-place with §50 successor surfaces; §42 substantially rewritten with revenue-affecting metrics + per-service SLOs + canonical severity ladder + customer-reported incident ingest + Runbook Inventory + log/trace/PII contracts + entity catalog; §46 rewritten with per-service test pyramid + AIOperation evaluation + console firewall scenarios + DSAR/GDPR scenarios + chaos coverage; §50 extended with 11 new Ops surfaces §50.20–§50.30. Pre-V12 Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V12-remediation-2026-05-11.md`. 11 V12 Authored Extensions AE-V12-01 through AE-V12-11 registered for v7.1.1 ratification.

### §7.4 Phase V14 Remediation Closure (2026-05-13) — 7 Defects Closed

5 P2 · 2 P3 = 7 defects closed. Spec edits: Appendix K Glossary entry `value_dollars` field-naming convention; §4.8.3 AIWallet Authoring Intent block; §27 PATCH /wallet/config request body (2 row constraints). Documentation edits: `_audit/PHASE14.4_FINDINGS.md` retroactive scratch log; `_audit/CONSISTENCY_DELTA.md` sign-off cite-drift; `_integration/AUTHORED_EXTENSIONS_LEDGER.md` `depends_on:` annotations; `CLAUDE.md` §16 ratification queue paragraph; `_audit/V711_READINESS.md` D-RES-004 cross-flag. 1 new AE row AE-V14-001 (Appendix K Glossary convention; pending Engineering Lead sign-off). 1 new CI gate `value_dollars_storage_convention_audit` (runtime_status `spec_binding_pending_pack_m02_3`).

### §7.5 V12-Cluster v7.1.1 Stamp-Gate Inheritance

Per CLAUDE.md §16 Phase V12 closure: v7.1.1 stamp pending AE ratification + new V12 CI gate runtime wiring (32 gates across M02.3 / M11.3 / M21.3 / M24.3 / release-orchestration). The wiring is a P1 program (rolled into §6.7 mechanics) but the AE ratification is a separate gate.

### §7.6 v7.1.0 AE Ratification Queue State (per `_audit/AE_RATIFICATION_RECOMMENDATIONS.md`)

Per CLAUDE.md §16 ratification queue: **5 READY** (AE-14.9-01 Solo enum authoritative; AE-14.10-07 Solo `low_priority_background` capability set; AE-14.14-21 §2.8.7 AC #5 deadline-countdown TZ rule; AE-14.0.1-01 GTM rewrites descope; AE-14.0.1-02 Marketplace-as-RFP-Exchange descope). **2 BLOCKED on Phase V11 cluster** (AE-14.18.1-01 depends_on AE-V11-03 + AE-V11-07; AE-14.18.1-02 depends_on AE-V11-06). All 5 READY rows + V11 cluster + 2 BLOCKED rows close before v7.1.1 stamps.

---

## §8 Ledger-Hygiene Work (D-CONS-001 through D-CONS-007)

Filed as canonical defect rows in the ledger 2026-05-13; tracked here for backlog visibility.

| ID | Severity | Class | Subject | Approach | Owner | Effort | Linear |
|---|---|---|---|---|---|---|---|
| D-CONS-001 | P1 | documentation_gap | Propagate ≥390 supplementary `→ remediated` / `→ superseded` transitions into canonical-row `status` cells | Programmatic script that walks each supplementary status-transition row, locates the originating canonical row by `defect_id`, updates `status` + `links`. Reviewer audit per propagation. Commit as v7.1.1 stamp gate. | Audit + Engineering | M | DOC-300 |
| D-CONS-002 | P2 | documentation_gap | Per-row severity re-validation against rule-based Severity Definitions | Pass criterion: every P0 row's evidence cites one of the five P0-trigger rules verbatim; every P1 row's evidence cites a buildability gap; downgrade misclassifications. | Audit + Engineering | L | DOC-301 |
| D-CONS-003 | P2 | documentation_gap | Per-row class re-validation | Pass criterion: every row's `class` is the most-specific applicable class. Normalize compound classes (≥80% primary → drop compound; secondary axis via `links`). | Audit + Engineering | L | DOC-302 |
| D-CONS-004 | P3 | documentation_gap | Per-row evidence reproducibility audit | Pass criterion: every `evidence` cell contains a section anchor or line number; line numbers older than 2026-04-26 re-verified against current Master Spec lines. | Audit | M | DOC-303 |
| D-CONS-005 | P3 | documentation_gap | Per-row recommendation sharpness audit | Pass criterion: each `recommendation` ≤ 250 words; multi-sentence recommendations exceeding the cap split into follow-up `RECOMMENDATION_<id>.md` artifact. | Audit | M | DOC-304 |
| D-CONS-006 | P1 | documentation_gap | Per-cluster deduplication walk for 78 duplicate-candidate clusters | Pass criterion: each cluster reviewed; true duplicates merged with a forwarding row; partial overlaps cross-linked via `links`; one canonical row per actual defect. | Audit + Engineering | L | DOC-305 |
| D-CONS-007 | P3 | documentation_gap | `links` column completeness sweep | Pass criterion: zero canonical rows carry empty or `—` `links`; every row carries at least one cross-reference. | Audit | M | DOC-306 |

**Counterfactual.** Three realistic failure modes the CONS pass must handle:
1. **A supplementary transition row references a defect_id that does not exist in the canonical table.** Closed by orphan-row sweep before propagation; route to D-CONS-006.
2. **Two supplementary transitions point to the same defect with conflicting outcomes (`→ remediated` and `→ superseded`).** Reviewer audit per propagation must resolve; document the contradiction in the canonical row's `links`.
3. **A canonical row's content has drifted from the supplementary transition's authoring (e.g., severity downgraded mid-stream).** D-CONS-002 + D-CONS-003 close this; severity / class re-validation runs after propagation.

---

## §9 Cycle Plan Heuristic

Recommended ordering for v7.1.1 stamp gate clearance (parallel-safe groups in bold):

1. **Group A (security + firewall gates; 1 cycle, 2 engineers + security):** PROD-CRIT-001 (D-2.2-042), PROD-CRIT-005 (D-11.2-004). Closes both firewall-bypass attack surfaces.
2. **Group B (Glossary / Appendix K canonicality; 1 cycle, 1 engineer):** PROD-CRIT-002 / -003 / -004 (D-AK-001/002/003) + AE-12.3-12 ratification. Unblocks every Appendix-B-vs-K validator.
3. **Group C (§M.5 runtime wiring; 2 cycles, 2 engineers):** PROD-CRIT-006 + PROD-CRIT-007 (D-11.3-001 + D-11.3-002) + AE-V11-03 / AE-V11-07 ratification. Closes catalog-completeness assertion; unblocks AE-14.18.1-01.
4. **Group D (Entitlement registry seed expansion; 2 cycles, 2 engineers + product):** PROD-CRIT-008 / -009 / -010 / -011 (D-EM-001/002/003/004) + AE-14.10-07 ratification. Closes capability-registry-binding-completeness; enables Solo throttling.
5. **Group E (Legal-entity reconciliation; 1 cycle, 1 engineer + finance):** PROD-CRIT-012 (D-RES-004). Closes Stripe Customer reconciliation; absorbs in Phase 14.13a billing rollup.
6. **Group F (P1 catalog-completeness sweep; 1 cycle, 1 engineer):** §6.1 — 17 mechanical catalog registrations.
7. **Group G (P1 Engine-Concept M.1 backfill; 1-2 cycles, 1 engineer + design):** §6.3 — Phase 11.5 backfill.
8. **Group H (P1 top-50 cluster execution; 4-6 cycles, 4-6 engineers in parallel):** §3.1 top-50 clusters, executed in implementation-pack groupings (M02.3 / M11.3 / M21.3 / M24.3).
9. **Group I (P1 cross-phase programs; 3-4 cycles, sequential):** §3.2 cross-phase programs.
10. **Group J (P2 + P3 + Ledger Hygiene; v7.1.x continuous bandwidth):** §4 + §5 + §8.

Estimated v7.1.1 stamp delivery (Groups A–G + Phase 14.13a billing rollup): ~6 cycles with 4 engineers + 1 security + 1 design + 1 product + 1 finance + 1 legal.
Estimated v7.2.0 stamp delivery (Groups A–I): ~14 cycles with the same staffing.

---

## §10 Backlog Maintenance

- **Source updates.** When a defect transitions in `DEFECT_LEDGER.md`, update the corresponding row here. When a new audit phase files defects, append to the appropriate section + re-derive cluster counts.
- **AE ledger synchronization.** Every backlog row carrying an AE ledger reference must list the ratification status from `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. When a `pending` row transitions to `approved` / `acknowledged` / `superseded`, update the cross-reference.
- **Linear ID stability.** Once a Linear ID is published, it is immutable; reroll via a forwarding row if a renumber is genuinely required. Mirrors the `defect_id` rule in `DEFECT_LEDGER.md` Row Format.
- **Reconciliation gap.** Re-run D-CONS-001 propagation before each stamp gate; the open-count reconciliation in §1 changes after each propagation pass.
- **Effort estimates.** Calibrate to actual cycle delivery as Groups A–E close; re-baseline P1 cluster estimates after the first three Linear cycles.
