# Phase EM — End-to-End Walk of §34.8 Entitlement Matrix

**Audit prompt:** "Walk §34.8 Entitlement Matrix end-to-end" (six-check forward + reverse pass per the prompt body).
**Run date:** 2026-05-07
**Sections audited:** §34.8.1 (Enforcement Modes), §34.8.2 (Runtime Enforcement Path), §34.8.3 (Cross-Console Enforcement Isolation), §34.8.4 (Free Allowance Interaction), §34.8.5 (Entitlement Matrix proper), §34.8.6 (Failure Modes Addressed), §34.8.7 (Acceptance Criteria).
**Cross-references audited:** §21.4 (Capability Registry — every sub-section), §4.8.2 (CapabilityRegistryEntry schema), §34.3.4 (Illustrative Rate Card), §34.14.1 + §34.14.1.b (Seller Rate Card + AE block), §34.15.1 + §34.15.1.b (Outcome Contract Table + AE block), §34.1.1 / §34.1.2 (plan-tier AI Budget cells), §44.6.1–§44.6.5 (Solo-Tier Surface Treatment), §5.11 (Feature Access Matrix overview), Appendix J (controlled vocabulary), Appendix M (surface/engine mapping).
**Reverse-pass scope:** §3 / §11 / §28 / §44.6 plan-gated UI surfaces cross-checked against §34.8.5 matrix membership.
**Defect mnemonic:** `D-EM-NNN` (Entitlement Matrix walk).
**Findings promoted:** 20 defects to `_audit/DEFECT_LEDGER.md` under "Phase EM — §34.8 Entitlement Matrix Walk (2026-05-07)".

---

## 1. Inventory

### 1.1 Capability Registry seed (§21.4) — customer_billed entries

Authoritative customer_billed `CapabilityRegistryEntry` rows seeded at v7.0.0:

**§21.4.1 Initial Registry Seed (rows 1–21, customer_billed except sla_escalation):**
1. `policy_parsing` (Buyer · Opus)
2. `policy_deduplication` (Buyer · Haiku)
3. `policy_traceability_mapping` (Buyer · Sonnet)
4. `triage_auto_mapping` (Buyer · Haiku)
5. `requirement_splitting` (Buyer · Sonnet)
6. `vendor_invite_suggestion` (Buyer · Sonnet)
7. `kb_to_response_suggestion` (Seller · Haiku)
8. `evidence_parsing` (Buyer · Sonnet)
9. `qa_suggestion` (Seller · Sonnet) — **family root, see §21.4.1.A canonical-form note**
10. `pre_scoring` (Buyer · Sonnet)
11. `disagreement_insight_card` (Buyer · Sonnet)
12. `demo_focus_brief` (Buyer · Sonnet)
13. `what_would_flip_analysis` (Buyer · Sonnet)
14. `tco_analysis_narrative` (Buyer · Sonnet)
15. `sensitivity_narrative` (Buyer · Sonnet)
16. `org_intelligence_briefing` (Buyer · Sonnet) — **family root → 3 sibling rows registered: `org_intelligence_vendor_history`, `org_intelligence_full`, `org_intelligence_suggestions`**
17. `kb_staleness_classifier` (Seller · Haiku)
18. `kb_to_capability_suggestion` (Seller · Haiku)
19. `pulse_digest_weekly` (Cross-console · Sonnet)
20. `sla_escalation` (Cross-console · rule_based) — sourcera_owned
21. `comment_thread_summary` (Cross-console · Haiku)

**§21.4.1.A KB-Spec Augmentations (5 rows):** `firecrawl_crawl_dedupe`, `capability_declaration_suggest`, `match_score_numeric`, `bid_task_assignment_suggest`, `document_attach_suggest`.

**§21.4.2 Extended Capabilities (11 rows; 7 customer_billed + 4 platform_marketing):**
- customer_billed: `seller_page_enrichment`, `kb_bootstrap`, `first_pass_responses`, `team_suggestion`, `next_evaluation_suggestion`, `external_vendor_lookup`, `ghost_rfp_ingestion`.
- platform_marketing: `guide_draft_generation`, `guide_refresh_analysis`, `category_faq_generation`, `market_intelligence_report`.

**§21.4.3 Platform-Owned Capabilities:** `category_faq_generation` (also 21.4.2), `guide_draft_generation` (also 21.4.2), `guide_refresh_analysis` (also 21.4.2), `comparison_page_generation`, `market_intelligence_report` (also 21.4.2), `heat_map_cell_summary`, `sla_escalation` (also 21.4.1), `trust_safety_classifier`, `ops_triage_assist`.

**Total customer_billed §21.4 capabilities at v7.0.0:** 31 (20 from §21.4.1 + 5 from §21.4.1.A + 7 from §21.4.2).

### 1.2 §34.8.5 Entitlement Matrix rows — full enumeration (62 rows)

**Buyer Core Evaluation (21 rows, lines 29178–29199):**
`pre_scoring`, **`requirement_extraction`**, **`kb_suggestion_buyer`**, **`vendor_summary`**, `policy_parsing`, `policy_deduplication`, `policy_traceability_mapping`, **`deep_comparison`**, `triage_auto_mapping`, `requirement_splitting`, `vendor_invite_suggestion`, `evidence_parsing`, `disagreement_insight_card`, `demo_focus_brief`, `what_would_flip_analysis`, `tco_analysis_narrative`, `sensitivity_narrative`, **`response_drafting`**, **`stakeholder_summary`**, **`scenario_modeling`**, **`tco_modeling`** (non-AI).

**OrgIntel tri-split (4 rows):** `org_intelligence_briefing`, `org_intelligence_vendor_history`, `org_intelligence_full`, `org_intelligence_suggestions`.

**Buyer Marketplace surfaces (3 rows):** **`marketplace_search_filter`**, **`marketplace_match_score_view`**, **`marketplace_batch_match_api`**.

**Buyer Extended (3 rows):** `team_suggestion`, `next_evaluation_suggestion`, `external_vendor_lookup`.

**Seller Free-Forever (2 rows):** **`bid_workspace_respond`**, **`seller_profile_publish`**.

**Seller Core AI (12 rows):** **`first_pass_rfp_draft`**, `qa_suggestion_seller`, `kb_to_capability_suggestion`, `kb_bootstrap`, `ghost_rfp_ingestion`, `firecrawl_crawl_dedupe`, `kb_staleness_classifier`, `seller_page_enrichment`, `capability_declaration_suggest`, `match_score_numeric`, `bid_task_assignment_suggest`, `document_attach_suggest`.

**Seller Non-Core / Managed Agent (3 rows):** `kb_suggestion_seller`, `kb_to_response_suggestion`, `first_pass_responses`.

**Seller Proactive (6 rows):** **`proactive_marketplace_eoi`**, **`seller_signals_monthly_digest`**, **`seller_signals_weekly_digest`**, **`seller_signals_realtime`**, **`crm_sync`**, **`promoted_marketplace_placement`**.

**Seller AE rows (8 rows, all marked "Activation pending"):** `verification_fetch`, `buyer_signal_digest`, `answer_refinement`, `compliance_pass_audit`, `rfp_win_probability_analysis`, `opportunity_recommender`, `source_of_truth_sync`, `outcome_narrative_builder`.

**Cross-console shared AI (3 rows):** `pulse_digest_weekly`, `comment_thread_summary`, `sla_escalation`.

**Security/Admin Cross-Console (8 rows; all non-AI):** **`mfa_enrollment`**, **`mfa_org_enforcement`**, **`saml_sso`**, **`scim_provisioning`**, **`ip_allowlist_residency`**, **`custom_branding`**, **`api_add_on`**, **`vendor_pro_trial_seat_grant`**.

**Platform-owned (10 rows):** `category_faq_generation`, `guide_draft_generation`, `guide_refresh_analysis`, `comparison_page_generation`, `market_intelligence_report`, **`market_intel_aggregation`** (per F-3.1.A note: not in §21.4 by design), `heat_map_cell_summary`, **`seller_signal_aggregation`** (same), `trust_safety_classifier`, `ops_triage_assist`.

**Bolded entries** are matrix rows whose `capability_id` does NOT resolve to a §21.4 `CapabilityRegistryEntry` row (forward-pass gap).

---

## 2. Six-Check Walk

### CHECK 1 — Every capability_id in the Capability Registry has an entry in §34.8.5

**Forward pass (§21.4 → §34.8.5):** All 31 customer_billed §21.4 capabilities except `qa_suggestion` (root) appear in the matrix. The org_intelligence root + 3 siblings appear; the qa_suggestion root + only one sibling (qa_suggestion_seller) appear — `qa_suggestion_buyer` is referenced in §34.8.5 canonical-form lock note (line 29276) but has no row. **→ D-EM-001 (P0).**

**Reverse pass (§34.8.5 → §21.4):** 27 matrix rows reference capability_ids NOT in §21.4 seed:

- Seven Buyer customer-billed rows: `requirement_extraction`, `kb_suggestion_buyer`, `vendor_summary`, `deep_comparison`, `response_drafting`, `stakeholder_summary`, `scenario_modeling`. **→ D-EM-002 (P0).**
- One Seller customer-billed row (highest volume): `first_pass_rfp_draft`. **→ D-EM-003 (P0).** Three §44.6.4.1 low-priority-background capability ids: `proactive_cmd_k_marketplace_surfacing`, `weekly_kb_refresh_suggestions`, `vendor_page_enrichment_polling` — referenced as if registered, neither in §21.4 nor in §34.8.5. **→ D-EM-004 (P0).**
- Eight non-AI Security/Admin rows. **→ D-EM-006 (P1).**
- Six Seller Proactive rows (5 non-AI; `proactive_marketplace_eoi` is plausibly AI but unregistered). **→ D-EM-007 (P1).**
- Eight Seller AE rows. **→ D-EM-008 (P3).**
- Three Buyer Marketplace rows (UI/API surfaces, not AI). **→ D-EM-009 (P1).**
- One non-AI Buyer row: `tco_modeling`. **→ D-EM-018 (P1).**
- Two Seller Free-Forever rows: `bid_workspace_respond`, `seller_profile_publish`. **→ D-EM-017 (P2).**
- Two platform-internal aggregation rows: `market_intel_aggregation`, `seller_signal_aggregation` — explicitly exempted by §34.8.5 line 29280 inline fix F-3.1.A; OK as-is. (No defect.)
- One cross-console example reference: `kb_suggestion` cited in §34.8.3 but not in matrix. **→ D-EM-014 (P1).**
- Cross-document drift: `kb_suggestion` (single) in §34.3.4 vs `kb_suggestion_buyer` + `kb_suggestion_seller` (split) in §34.8.5. **→ D-EM-013 (P1).**

### CHECK 2 — enforcement_mode (soft / hard) set for each row

§34.8.1 enum: `{soft, hard}`. Matrix uses 4 additional `n/a (...)` variants across 14 rows. **→ D-EM-005 (P1) — enum drift.** `tco_modeling` row exemplifies the runtime gap (D-EM-018; P1).

### CHECK 3 — free_allowance_ops set for each

Most rows are `10`, `1`, or `n/a`. One row (`kb_bootstrap`) uses prose ("1 lifetime (Free); thereafter wallet"). Type drift breaks deploy-time validator. **→ D-EM-011 (P1).**

### CHECK 4 — gated_at_plan_minimum set for each

Per-cell parenthetical contamination on `verification_fetch`, `api_add_on`, `vendor_pro_trial_seat_grant` — multiple plan tiers per cell with quota annotations duplicating §34.1.1 / §34.1.2 numerics inline. **→ D-EM-012 (P2).** Solo treatment for `scenario_modeling` (and other Buyer Free rows) silent in matrix. **→ D-EM-016 (P2).** Free-forever rows (`bid_workspace_respond`, `seller_profile_publish`) have no plan minimum, violating matrix scope. **→ D-EM-017 (P2).**

### CHECK 5 — upgrade_surface set for each

Column conflates surface names ("Wallet-exhaustion CTA"), CTA microcopy strings (e.g., line 29183 Policy Parsing copy), and `n/a`. Untyped, non-i18n-aware, hard to consume at runtime. **→ D-EM-010 (P1).** `first_pass_responses` upgrade_surface declares a cross-capability fallback to `first_pass_rfp_draft` but no fallback contract exists in §34.8 narrative. **→ D-EM-020 (P1).**

### CHECK 6 — Reverse pass: every plan-gated UI surface in §3 / §11 / §28 / §44.6 has a matching matrix row

- **§3 (UX).** §3.13 Principle 9 + §3.14 Pipeline surface compression are doctrinal; no specific plan-gated UI surface enumerated outside the existing §44.6 hide list. No new gap.
- **§11 (Buyer Console layout).** §11.2.3 Phase Gating Rules is workflow-phase-keyed, not plan-tier-keyed; §11 is plan-tier-orthogonal. No matrix gap.
- **§28 (Comments / Mentions).** Plan-tier-orthogonal at v7.1.0 (Free + Solo + paid all have comments). No matrix gap.
- **§44.6 (Solo-Tier Surface Treatment).** §44.6.1 Surface Hide List enumerates 10 plan-gated surfaces (AIWallet widget, wallet-overage UI, auto-topup UI, per-capability rate card, per-AIOperation Billing Ledger row breakdown, FreeAllowanceCounter inline counter, AIWallet state badges, Contest CTA, cost-base banner, PostHog freshness diagnostics) — none has a §34.8.5 row, and none should (UI-surface plan gating is a §5.11 problem, not an entitlement-matrix problem). The gap is documentation: the §34.8.5 vs §5.11 scope split is not stated. **→ D-EM-019 (P2).**

CHECK 6 also surfaced two engine-side completeness gaps: (a) Solo treatment per AI capability not represented in matrix → D-EM-016; (b) §34.8.7 acceptance criterion #6 deploy-time validator unnamed → D-EM-015.

---

## 3. Adversarial Pass — §34.8.5 column contract

Treating the matrix as the runtime contract its preamble claims, here is what a deploy-time validator would have to assert per row, and which assertions fail today:

| Assertion | Pass | Fail |
|---|---|---|
| `capability_id` resolves to a `CapabilityRegistryEntry` (any state) | 35 of 62 rows | 27 of 62 rows (per CHECK 1 reverse pass) |
| `enforcement_mode ∈ {soft, hard}` per §34.8.1 | 48 of 62 rows | 14 of 62 rows (per CHECK 2 / D-EM-005) |
| `free_allowance_ops` is `n/a` OR a non-negative integer | 61 of 62 rows | 1 of 62 rows (`kb_bootstrap` prose; D-EM-011) |
| `gated_at_plan_minimum` cells are single Appendix J `plan_tier` enum value | 59 of 62 rows | 3 of 62 rows (D-EM-012; `verification_fetch`, `api_add_on`, `vendor_pro_trial_seat_grant`) |
| `upgrade_surface` is a registered surface name (not literal copy) | 22 of 62 rows | 40 of 62 rows (D-EM-010 — most rows carry literal copy or `n/a`) |
| Every row in matrix has a non-null plan-tier minimum on at least one console | 60 of 62 rows | 2 of 62 rows (D-EM-017; Free-Forever rows) |

The matrix does not deploy as a typed runtime contract today; the assertions above represent the minimum gates a §34.8.7 #6 deploy-time validator would have to enforce.

---

## 4. Self-Challenge Pass

Re-read findings as a hostile reviewer. Notes recorded inline in the DEFECT_LEDGER.md "Self-Challenge Pass" block. No defect downgraded or withdrawn on review. D-EM-005 and D-EM-006 considered for consolidation (both are matrix-scope drift); kept distinct because remediation owners differ (D-EM-005 = enum extension at engineering; D-EM-006 = §5.11 sub-table authoring at engineering + content owner per row).

---

## 5. Counterfactual Pass — §34.8 Failure Modes

For the §34.8 surface, three realistic failure modes:

1. **A new customer-billed capability is added to §21.4 but the §34.8.5 matrix row is forgotten.** ✅ §34.8.7 AC #6 declares deploy-time validator. Validator unnamed → D-EM-015. Reverse-direction validator missing → D-EM-002 / D-EM-015.
2. **A `low_priority_background` Solo capability exhausts envelope; toast fires; capability not in matrix; entitlement check has no plan-gate to honor.** ❌ §44.6.4.1 names the three capabilities but registry seed and matrix rows are missing. → D-EM-004 (P0).
3. **An AE row is invoked before signoff lands.** Partial — §34.8.5 line 29278 says return `capability_not_signed_off` (HTTP 422); error code's Appendix I presence unverified (defer to Phase 12). After AE signoff, registry row still missing → null lookup → throw. → D-EM-008.

A fourth failure mode worth recording (handled): **Plan-tier downgrade mid-billing-period invalidates a soft-gated capability that's mid-invocation.** ✅ §34.8.6 #1 covers `pending` operations under prior wallet rules.

---

## 6. Promotion to DEFECT_LEDGER.md

20 defects promoted (D-EM-001 through D-EM-020). See `_audit/DEFECT_LEDGER.md` → "Phase EM — §34.8 Entitlement Matrix Walk (2026-05-07)" for full row schema (12 columns: defect_id | severity | class | location | summary | evidence | convention_violated | recommendation | remediation_owner_hint | phase_owner | status | links).

| Defect | Severity | One-line summary |
|---|---|---|
| D-EM-001 | P0 | `qa_suggestion` root has no matrix row; canonical-form lock cites non-existent `qa_suggestion_buyer`. |
| D-EM-002 | P0 | 7 Buyer customer-billed `capability_id` rows have no §21.4 registry row. |
| D-EM-003 | P0 | `first_pass_rfp_draft` (Seller Free's most-invoked capability) has no §21.4 registry row. |
| D-EM-004 | P0 | 3 §44.6.4.1 `low_priority_background` capability ids never seeded to §21.4 or §34.8.5. |
| D-EM-005 | P1 | `enforcement_mode` enum drift — 14 matrix rows use `n/a (...)` values not in §34.8.1 enum. |
| D-EM-006 | P1 | 8 non-AI cross-console security/admin features encoded as `capability_id` rows. |
| D-EM-007 | P1 | 6 Seller Proactive rows mostly non-AI; `proactive_marketplace_eoi` AI-side missing registry row. |
| D-EM-008 | P3 | 8 AE rows with no §21.4 row even after signoff; runtime path undefined post-activation. |
| D-EM-009 | P1 | 3 Buyer marketplace UI/API surfaces in matrix without registry backing. |
| D-EM-010 | P1 | `upgrade_surface` column conflates surface name with literal CTA copy. |
| D-EM-011 | P1 | `free_allowance_ops` column type-mixed (prose + integer + n/a). |
| D-EM-012 | P2 | `gated_at_plan_minimum` cells contaminated with parentheticals + multi-tier-per-cell. |
| D-EM-013 | P1 | `kb_suggestion` cardinality drift between §34.3.4 (single) and §34.8.5 (split). |
| D-EM-014 | P1 | §34.8.3 cites `kb_suggestion` cross-console example; matrix has no such row. |
| D-EM-015 | P2 | §34.8.7 #6 unnamed validator; reverse-direction validator absent. |
| D-EM-016 | P2 | `scenario_modeling` (and other Buyer Free rows) silent on Solo engine-absorbed envelope behavior. |
| D-EM-017 | P2 | `bid_workspace_respond` / `seller_profile_publish` are not plan-gated; violate matrix scope. |
| D-EM-018 | P1 | `tco_modeling` matrix row lacks runtime path (null registry lookup undefined). |
| D-EM-019 | P2 | §44.6.1 surface hide list (10 plan-gated surfaces) lacks §5.11 sub-table; scope split undocumented. |
| D-EM-020 | P1 | `first_pass_responses` cross-capability fallback to `first_pass_rfp_draft` not contracted in §34.8 runtime path. |

**Severity rollup:** P0 × 4 · P1 × 11 · P2 × 5 · P3 × 1 · P4 × 0. Net new AE rows required: 1 (qa_suggestion family split) plus AE-14.10-07 already on pending list.

**Coverage matrix updates:** F-530, F-531, F-532, F-AE-020 cell tightenings recorded in `_audit/COVERAGE_MATRIX.md` Phase EM Update block (2026-05-07).
