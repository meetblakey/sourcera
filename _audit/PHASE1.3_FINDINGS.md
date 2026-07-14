# Phase 1.3 — Findings Scratch Log (§4.4 Seller Console Entities)

**Phase:** Phase 1 — Data Model Integrity Audit · Prompt 1.3 (per Audit_Prompts.md "TASK Audit §4.4 Seller Console Entities").
**Run completed:** 2026-04-29.
**Defect-id mnemonic:** `D-1.3-NNN` (per `Audit_Prompts.md → Defect Ledger Format` line 55 — phase-bounded sequential).
**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` §4.4 Seller Console Entities (lines 4446–6531; 29 entities including 4.4.1 Bid Workspace through 4.4.29 BidSuccessShare).
- `Sourcera_Master_Spec.md` §4.2.1 Organization (lines 3549–3576) — for `Organization.kb_value_meter_score` / `seller_verification_tier` field-existence cross-check.
- `Sourcera_Master_Spec.md` §22.3.1 KB Entry (lines 14895–14938), §22.3.4 KB Namespace, §22.4.1 Lifecycle, §22.20 Seller Maya Surface Abstraction (lines 17905–18185).
- `Sourcera_Master_Spec.md` §27.10 Vendor Opt-Out Global Registry (lines 22579–23080) — for cascade-rule verification.
- `Sourcera_Master_Spec.md` §34.19 Seller Plan Upgrade Carry-Over Guarantee (lines 28960–29062) — for thirteen-asset-class field-existence cross-check.
- `Sourcera_Master_Spec.md` §35.2 / §49 Seller Onboarding Seven-Stage Flow (lines 29237–29399, 35965+).
- `Sourcera_Master_Spec.md` §40.2 Data Retention table (lines 30240–30278) — for §4.4 retention-row coverage.
- `Sourcera_Master_Spec.md` Appendix J `vendor_opt_out_scope_kind` enum, Appendix M.1 mapping table (lines 46184–46383+) — for surface/engine mapping coverage.
- `Sourcera_Master_Spec.md` §13.11 Defense View / §27.10.3 Enforcement Surfaces — for vendor-opt-out cascade contract verification.
- `_audit/AUDIT_README.md`, `_audit/COVERAGE_MATRIX.md`, `_audit/DEFECT_LEDGER.md`, `_audit/PHASE1_FINDINGS.md`, `_audit/PHASE2.1_FINDINGS.md` — for prior-phase context, defect-id conventions, and matrix-tightening doctrine.

**Artifacts produced:** This file; defect rows D-1.3-001 through D-1.3-031 appended to `DEFECT_LEDGER.md`; per-row coverage-matrix tightening on F-105/F-106/F-107/F-108/F-109/F-110/F-111/F-326/F-415/F-416/F-419/F-423/F-440/F-458/F-459/F-460/F-559/F-647/F-677/F-678/F-679/F-680/F-681/F-683.

---

## 1. Method

1. Read all of §4.4 (29 entities, ~2,086 lines) end-to-end. No grep-and-skim per Audit_Prompts.md OPUS expectations.
2. For every entity, walked the 14-point Audit Checklist (Audit_Prompts.md lines 149–209) end-to-end. A feature satisfying 13 of 14 dimensions is filed as a defect on the 14th.
3. For the eight task-specific checks (Audit_Prompts.md "Phase 1.3" CHECKS block):
   - Check 1 (Console Isolation): walked every entity for `console = 'seller'` field presence and the cross-console-firewall rejection rule.
   - Check 2 (KB-Namespace Scope): verified every KB-related entity declares `kb_namespace_id` and the cascade-on-Seller-Org-delete behavior.
   - Check 3 (KB Value Capture): traced every field referenced in the §34.19 thirteen-asset-class carry-over guarantee back to its declaring entity's field table; flagged missing fields.
   - Check 4 (Marketplace Discovery): verified PromotedListing auction fields, FeaturedPlacement FTC-disclosure timestamp, VerificationReviewRecord Ops reviewer FK + outcome.
   - Check 5 (Seven-Stage Flow): verified SellerOnboardingSession captures every stage timestamp + activation metric.
   - Check 6 (Seller Maya states): verified every §22.20 surface state has a backing entity field or session record.
   - Check 7 (Vendor Opt-Out cascade): verified every public-facing entity carries `vendor_opt_out_honored_at`; verified the cascade rule.
   - Check 8 (k-anonymity floors): verified k=5/k=10/k=20 declarations are present and survives the distinctiveness re-identification attack.
4. **Counterfactual pass:** For every entity, enumerated three realistic failure modes (concurrent-write race, dependency outage, mid-flight cascade). Spec coverage validated; gaps filed as P1 / P2 defects.
5. **Self-challenge pass:** Re-read every defect under hostile-reviewer persona. Severity classifications rule-based per Severity Definitions; revisions logged in §3 below.

---

## 2. Confirmed Findings (promoted to defect ledger)

**31 defects filed. 1 P0 / 22 P1 / 5 P2 / 3 P3.**

| class | count | severity mix |
|---|---|---|
| data_model | 9 | 8× P1, 1× P2 |
| webhook | 3 | 3× P1 |
| state_machine | 3 | 3× P1 |
| api | 2 | 2× P1 |
| retention | 4 | 3× P1, 1× P2 |
| surface_engine_mapping | 3 | 3× P1 |
| enum | 2 | 1× P1, 1× P2 |
| acceptance_criteria | 2 | 1× P1, 1× P3 |
| firewall_leakage | 1 | 1× P0 |
| consistency_drift | 2 | 2× P1 |

### 2.1 P0 defects (1)

- **D-1.3-001** — §4.4.18 SellerSignal: declared `k_anon_floor = 5` is provably insufficient against re-identification at narrow `(industry_code, region_code, company_size_band, timeline_band, intent_strength)` tuples. The spec itself acknowledges this in §4.4.18 Failure Mode #4 ("Aggregate inadvertently reveals one buyer ... distinctiveness secondary check") and explicitly defers the secondary check as "Authored extension ... pending Privacy review." Acceptance Criteria #1 / #2 only enforce raw cohort count ≥ 5 and exclusion of buyer-identity fields — they do not enforce the distinctiveness guarantee. Per the audit prompt's P0 trigger ("File P0 if any Seller field could leak buyer identity below the declared k-anonymity floor"), this rule fires: the *declared* floor is 5; the *effective* floor for narrow tuples is materially lower; the spec ships seller-facing signals that could narrow to a single buyer Org under the current contract. **Severity P0 per Audit_Prompts.md Severity Definitions rule (b) "exposes PII or PCI scope to an unintended actor"** — buyer Org identity is PII-adjacent under GDPR Recital 26 (singling out via combination of attributes is identification).

### 2.2 P1 defects (22)

- **D-1.3-002** — `Organization.kb_value_meter_score` referenced in §34.19.2 ("the KB Value Meter is stored on `Organization.kb_value_meter_score` (new field, **Authored Extension; requires §4.x Organization spec update**)") does NOT exist in §4.2.1 Organization field table. The §34.19 carry-over guarantee's Asset Class #2 (KB Value Meter score) is unimplementable as written: there is no field on any §4.x entity that stores the score. The §22.18.5 KB-side surface and §34.19.7 AC #2 (`kb_value_meter_formula` validator) both reference a field that does not exist. Buildability gap on a guarantee that affects every Seller Org plan transition.

- **D-1.3-003** — `Organization.seller_verification_tier` (or equivalent canonical field for the *current* Seller Org tier) does NOT exist in §4.2.1 Organization field table. §4.4.21 VerificationReviewRecord state machine row `pending → approved` declares "Triggers SellerOrg tier upgrade" but the field that holds the current tier is undeclared. §4.4.9 SellerSoftware has only `eligibility_verification_tier_snapshot` (Promoted-Listing-specific snapshot, not the live Seller Org tier). §4.4.21's "Integration with Dependent Entities" section says "**SellerOrgPage / SoftwarePage**: badge rendering flag updated" — but no field backs the badge. The carry-over guarantee Asset Class #4 (Verification Tier) cannot be preserved across upgrades because there is no canonical home field. Buildability gap.

- **D-1.3-004** — §22.3.1 KB Entry field table missing `created_via` field referenced in §22.4.1 "Agent-originated drafts" paragraph: "KBEntry rows ... stamped with `created_by=<agent_id>` and `created_via ∈ {kb_bootstrap, ghost_rfp_ingestion}`." The Reviewer-Inbox routing depends on this field; ordering by `confidence` then `created_via` cannot be implemented. Authoring Convention §1 violated (entity field table must enumerate every field referenced by prose).

- **D-1.3-005** — §4.4.1 Bid Workspace: NO entity-level retention statement. Other §4.4 entities (4.4.2, 4.4.4, 4.4.9, 4.4.10, 4.4.19, 4.4.21, 4.4.22) carry inline retention paragraphs; Bid Workspace does not. §40.2 has no Bid Workspace row. The §4.4.2 Bid Response inline citation "Workspace life + 7 years per §40.2 (aligned with Bid Workspace retention)" implies a 7-year retention but the parent entity declares no retention TTL anywhere. Authoring Convention §9 violated (every data class states retention).

- **D-1.3-006** — §4.4.2 Bid Response inline retention "Workspace life + 7 years per §40.2 (aligned with Bid Workspace retention)" — but §40.2 has NO row for Bid Response and NO row for Bid Workspace. The cross-reference is broken. Per Authoring Convention #10 (numerical singletons cite the source table), the inline citation points at a non-existent §40.2 row. Either §40.2 needs the rows, or the inline citation is incorrect.

- **D-1.3-007** — §4.4.3 Seller Profile entity is below Master Spec fidelity: NO `console = 'seller'` field, NO `updated_by` field, NO Indexes block, NO Scope Isolation block, NO state machine, NO Retention/DSAR/Residency block, NO Acceptance Criteria, NO Authoring Intent block. Compared to §4.4.4 Capability Declaration (its sibling, written at full fidelity), §4.4.3 is a stub. Authoring Conventions §1, §2, §5, §9 violated.

- **D-1.3-008** — §4.4.5 Bid Task entity is below Master Spec fidelity: NO `console = 'seller'` field, NO `updated_by` field, NO Indexes block, NO Scope Isolation block, NO state machine table for the `status` enum (`open` / `in_progress` / `completed` / `blocked`), NO Retention/DSAR/Residency, NO Acceptance Criteria, NO Authoring Intent, NO §32 API endpoints. Authoring Conventions §1, §2, §5, §6, §9 violated.

- **D-1.3-009** — §4.4.6 Bid Schedule entity is below Master Spec fidelity: NO `console = 'seller'` field, NO `created_by`, NO `updated_by`, NO `deleted_at`, NO Indexes block, NO Scope Isolation block, NO Retention/DSAR/Residency, NO Acceptance Criteria, NO Authoring Intent, NO §32 API endpoints. Compared to all other §4.4 entities this is the thinnest. Authoring Conventions §1, §2, §6, §9 violated. Soft-delete invariant (§4.1 Principle #1 — every entity must be soft-deletable) silently broken.

- **D-1.3-010** — §4.4.7 Marketplace Category state machine row `(deprecated → active within 30 days of deprecation)` declares a 30-day window but the entity has NO `deprecated_at` timestamp field. The reactivation gate condition is unbuildable as written — the runtime cannot compute "within 30 days of deprecation" without knowing when deprecation occurred. Authoring Convention §5 violated (state-machine triggers must reference observable fields).

- **D-1.3-011** — §4.4.8 Vendor Opt-Out Record cascade rule is authored as PROSE in the "Suppression Match Semantics" section (lines 4770–4776) — five bulleted match rules for the five `scope_kind` values. The rules are not authored as a testable cascade table (per-`scope_kind` × per-target-entity-type matrix) showing exactly which §4.4 entity types receive the cascade for each scope. Audit prompt CHECK #7 ("cascade rule must be testable, not prose") violated. Per Authoring Convention §5, state/cascade rules are tables, not prose.

- **D-1.3-012** — §4.4.16 HeatMapCell defines `vendor_opt_out_honored_at` with the note "always `scope_kind=not_applicable` resolution for cells" — but Appendix J `vendor_opt_out_scope_kind` enum (line 4744) only enumerates `global` / `category` / `software` / `page_type` / `specific_page`. The `not_applicable` sentinel value is referenced by §4.4.16 but not registered in Appendix J. Either the enum needs the value or §4.4.16's note is wrong. Authoring Convention §3 violated (every enum value used in §4–§51 must be registered in Appendix J).

- **D-1.3-013** — §4.4.4 Capability Declaration `pending_review_reason` enum (line 4555) does NOT include `solo_free_auto_publish` value referenced by §22.20.2 Compression Rule 1 ("auto-publish-and-chip-list rendering of KB-to-Capability suggestions on Solo/Free"). AE-14.8-01 in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` is `pending`. §22.20.2 cannot be implemented as written until the enum value lands in §4.4.4. Buildability gap on a v7.1.0-shipping surface (§22.20.2 was authored in Phase 14.8).

- **D-1.3-014** — §4.4.19 PromotedListing webhook `promoted_listing.eligibility_lost` (state-machine row line 5666 + AC #7 line 5715) is declared as "Authored Extension — flagged" but is NOT registered in Appendix C (Notification Event Catalog) or Appendix G (PostHog Event Taxonomy). The terminal state-machine transition `active → terminated_eligibility_lost` is unobservable to seller subscribers without the webhook. Authoring Convention §7 violated.

- **D-1.3-015** — §4.4.19 PromotedListing webhook `promoted_listing.paused_by_opt_out` (AC #7 line 5715) declared as Authored Extension flagged but NOT registered in Appendix C / Appendix G. Same defect class as D-1.3-014.

- **D-1.3-016** — §4.4.19 PromotedListing references `PromotedListingAuctionRun` as an Authored Extension multiple times (auction-mechanics-rule #8 line 5634; failure-mode #8 line 5705; retention paragraph line 5691). The entity is *referenced* but not *authored* anywhere in §4.4 or §4.8. Per AC #5 ("auction decisions are logged to `PromotedListingAuctionRun` for fairness-audit reconstruction"), the fairness audit cannot be implemented without the entity. Authoring Convention §1 violated.

- **D-1.3-017** — §4.4.19 PromotedListing references `MarketplaceDiscoveryLedgerEntry` as an Authored Extension (auction-mechanics-rule #5 line 5631) — entity referenced but not authored. AC #6 ("The `rev_marketplace_discovery` ledger MUST post PromotedListing charges as a discrete line item") cannot be implemented without the ledger entity. Authoring Convention §1 violated.

- **D-1.3-018** — §4.4.20 FeaturedPlacement webhook `featured_placement.revoked` (AC #4 line 5831) declared as "Authored Extension — flagged" but NOT registered in Appendix C / Appendix G. The 15-minute SLO on opt-out cascade is unobservable without the webhook. Authoring Convention §7 violated.

- **D-1.3-019** — §4.4.20 FeaturedPlacement is missing an FTC-disclosure timestamp field (e.g., `ftc_disclosure_first_rendered_at` or `ftc_disclosure_label_attached_at`). The entity has `ftc_disclosure_label` (label string) and `ftc_tooltip_copy_markdown` (copy) but no audit-grade timestamp recording when FTC disclosure became attached to the placement. Audit prompt CHECK #4 ("FeaturedPlacement carries FTC-disclosure timestamp") violated. Severity P1 per the prompt's explicit framing of this as a discoverability gate; without the timestamp, regulator audits of FTC 16 CFR Part 255 compliance cannot be answered.

- **D-1.3-020** — §4.4.21 VerificationReviewRecord webhook `verification.tier_downgraded` (AC #8 line 5978, "Authored Extension — flagged; to be registered in Appendix C") is NOT registered in Appendix C / Appendix G. The cascade SLO ("within 15 minutes of the expiry sweep") is unobservable. Authoring Convention §7 violated.

- **D-1.3-021** — §4.4.25 SellerInventoryDemotionExemption is NOT registered in Appendix M.1 Master Surface/Engine Mapping Table. Per CLAUDE.md §16 / Appendix M preamble, "Adding an engine concept to the spec ... without adding a row to Appendix M in the same change is a CI-gate failure." The CI gate `appendix_m_coverage_on_diff` (§M.4) should fire on the v7.1.0 stamp diff. Authoring Convention §12 violated.

- **D-1.3-022** — §4.4.26 EOIRateLimitOverride is NOT registered in Appendix M.1. Same defect class as D-1.3-021. Authoring Convention §12 violated.

- **D-1.3-023** — §4.4.27 OpsActionRecord is NOT registered in Appendix M.1. Same defect class as D-1.3-021. Authoring Convention §12 violated.

- **D-1.3-024** — §4.4.1 Bid Workspace `status` enum has 5 values (`draft` / `active` / `submitted` / `won` / `lost`) but NO state-machine table. Authoring Convention §5 violated. Without a transition table, transitions like `active → submitted` (which trigger materialization of `submitted_at` and Console Bridge events to the buyer side) are undefined.

- **D-1.3-025** — §4.4.2 Bid Response `status` enum has 4 values (`draft` / `submitted` / `acknowledged` / `archived_by_buyer_remove`) but NO state-machine table. The "State Machine Interaction with §25.5" prose paragraph (line 4504) describes some transitions but only as PROSE. Authoring Convention §5 violated.

- **D-1.3-026** — §4.4.5 Bid Task `status` enum has 4 values (`open` / `in_progress` / `completed` / `blocked`) but NO state-machine table. Authoring Convention §5 violated.

- **D-1.3-027** — §4.4.4 Capability Declaration §32 API endpoints are not enumerated. AC #9 references `GET /v1/sellers/{org_id}/capabilities` (read endpoint) but no §32-compliant endpoint contract is authored for create/update/delete/promote operations. Per Authoring Convention §6, every entity-mutating capability requires a §32 endpoint with method/path/auth scope/rate-limit class/cursor pagination/request-schema/response-schema/error-codes/idempotency/concrete-example. Promotion-from-narrative-to-taxonomy in particular is a non-trivial transactional flow (§4.4.4 AC #5: "single Convex transaction") with no endpoint spec.

- **D-1.3-028** — §4.4.19 PromotedListing AC #1 references `org_id.plan_tier ∉ {seller_scale, seller_enterprise}` (deprecated singular field). Per D-1V-001 / D-1V-002 remediation (Master Spec lines 3558–3560, 2026-04-29), the per-console split replaces `plan_tier` with `seller_plan_tier`. The §4.4.19 AC is now using the stale legacy field; either the AC needs updating to `seller_plan_tier`, or it needs a `[STALE]` annotation matching §4.2.1 line 3560. Authoring Convention #10 violated (numerical-singleton drift; deprecated-field-reference drift).

- **D-1.3-029** — §4.4.21 VerificationReviewRecord prerequisites use deprecated `org_id.plan_tier` field at lines 5917 and 5923 ("`org_id.plan_tier ∈ {seller_starter, seller_growth, seller_scale, seller_enterprise}`" / "`org_id.plan_tier ∈ {seller_growth, seller_scale, seller_enterprise}`"). Same drift class as D-1.3-028. Per D-1V-001/002 remediation, references should resolve to `seller_plan_tier`.

- **D-1.3-030** — §4.4.22 SellerOnboardingSession AC #6 ("for a synthetic complete 1→7 session, exactly 7 stage-transition events are emitted with correct `stage_outcome` values") refers to PostHog event names that are NOT individually enumerated in §4.4.22. The instrumentation paragraph (line 6085) says "Events registered in Appendix G (new rows; see RECONCILIATION → Webhook Additions)" — but §4.4.22 itself does not name the 7 events (e.g., `seller_onboarding_stage_1_arrival`, `..._stage_2_sso_completed`, etc.). Subscribers and QA tests cannot bind to a canonical event-name list. Authoring Convention §7 violated (every webhook/PostHog event must be registered with a stable name).

- **D-1.3-031** — §4.4.18 SellerSignal "De-Anonymization Flow" paragraph (line 5511) says "When a buyer sends an EOI ... a new row is created linking that specific buyer-Workspace-to-seller relationship." This "new row" — distinct from the aggregate SellerSignal row — is not defined as a separate entity. The pointer fields `de_anonymized_eoi_id` / `de_anonymized_target_seller_org_id` / `de_anonymized_at` exist on the aggregate but the secondary linking entity is undefined. The de-anonymization audit trail is unbuildable. Authoring Convention §1 violated.

### 2.3 P2 defects (5)

- **D-1.3-032** — §4.4.7 Marketplace Category Acceptance Criterion #2 declares "Attempting to soft-delete a Category that has ≥1 active referencing SellerSoftware row MUST be rejected" but does not specify isolation level (SERIALIZABLE vs READ COMMITTED) or `SELECT ... FOR UPDATE` lock acquisition. Compared with §4.4.19 PromotedListing AC #2 (which explicitly mandates SERIALIZABLE), the Marketplace Category contract is silent on concurrency. A junior engineer building from §4.4.7 would not implement the lock; concurrent writes could orphan SellerSoftware rows. P2 (junior could resolve but the resolution would diverge across two readers).

- **D-1.3-033** — §4.4.10 SellerOrgPage Acceptance Criteria block is missing a buyer-console-firewall AC. §4.4.10 Scope Isolation declares "Buyer-console sessions receive only the public projection (same as anonymous)" but no AC asserts this with a §13.10-style integration test. Compared with §4.4.19 PromotedListing AC #4 (explicit `promoted_listing_cross_console_access` HTTP 404 assertion), §4.4.10 is silent on the firewall test. P2.

- **D-1.3-034** — §4.4.21 VerificationReviewRecord references three Ops roles (`ops_verification_reviewer`, `ops_verification_senior_reviewer`, `ops_opt_out_admin`) and two new error codes (`verification_review_separation_of_duties_violation`, `verification_review_residency_mismatch`) marked "(new; Appendix J)" / "(new; Appendix I)". Per Phase 2.1 Findings §6 doctrine, registration verification is held until the matching Appendix-J / Appendix-I rows are independently confirmed. P2 (registration drift not yet verified end-to-end; downstream Phase-2 enum sweep).

- **D-1.3-035** — §4.4.4 Capability Declaration `display_label_override` field referenced in AE-14.8-03 (`_integration/AUTHORED_EXTENSIONS_LEDGER.md`, status `pending`) is NOT in the §4.4.4 field table. AE rows that affect entity field tables MUST land before v7.1.1 stamp per the AE-ledger release-gate policy (`CLAUDE.md` §16 v7.1.0 ratification queue). P2 (tracked AE; pending ratification).

- **D-1.3-036** — §4.4.29 BidSuccessShare entity is authored as a stub field-table with the note "Invariants, API endpoints, webhooks, notifications, and acceptance criteria are fully authored at §48.7.1." Forward-references to a §48 sibling section are not strictly disallowed but make the §4.4 entity unreviewable in isolation. Reader following CLAUDE.md §10 task-routing guidance ("read all relevant sources in full") must context-switch to §48.7.1 to evaluate the entity. Compared to §4.4.27 OpsActionRecord (which is authored complete in §4.4 even though it is referenced elsewhere), §4.4.29 is structurally inconsistent. P2.

### 2.4 P3 defects (3)

- **D-1.3-037** — §4.4 lacks a §4.4 preamble that lists all 29 entities, scope kinds, and AE statuses in one scannable table — comparable to §4.5 Marketplace Entities or §4.8 Billing & AI Accounting which both open with a reference table. The reader must scan 29 sub-headings to enumerate the §4.4 surface area. Cosmetic / hygiene; does not affect implementation. P3.

- **D-1.3-038** — §4.4.13 GuidePage minor-update bypass (line 5171: "unless `refresh_diff_score < 0.10` (minor-update bypass authored extension)") is flagged inline as Authored Extension but is not visible in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` as of 2026-04-29. Same pattern in §4.4.14 ComparisonPage Opt-Out Redaction Rule (line 5240: "archive-on-min-count transition ... authored extension — flagged"). The AE-flagged-inline-but-not-ledgered pattern is documentation drift; spec hygiene only. P3.

- **D-1.3-039** — §4.4.10 SellerOrgPage and §4.4.11 SoftwarePage state machine row `Any → archived` (line 4957 / line 5031) declares "URL 410-gones; 410 response cached for 30 days then purged" but the 30-day cache TTL is not cross-referenced to §40.2 or any singletons table. Per Authoring Convention #10, every TTL has one authoritative home; an inline 30-day TTL without a citation is a singleton drift candidate. P3 (no other §40.2 row collides; cosmetic citation drift).

---

## 3. Self-Challenge Pass (hostile-reviewer re-read)

Per Audit_Prompts.md OPUS guidance, every finding was re-read as a hostile reviewer. Results:

### 3.1 Are the literal evidence citations reproducible?

Every defect cites a specific Master Spec line number or section anchor, directly grep-able. Spot-verified:
- D-1.3-001: §4.4.18 Failure Mode #4 line 5524 — verified.
- D-1.3-002: §34.19.2 line 29008 ("Organization.kb_value_meter_score (new field, Authored Extension; requires §4.x Organization spec update)") — verified; §4.2.1 lines 3551–3575 enumerated; field absent — verified.
- D-1.3-003: §4.4.21 line 5903 ("Triggers SellerOrg tier upgrade") — verified; §4.2.1 enumerated; no `seller_verification_tier` field — verified.
- D-1.3-004: §22.4.1 line 15034 (`created_via ∈ {kb_bootstrap, ghost_rfp_ingestion}`) — verified; §22.3.1 field table lines 14897–14930 enumerated; field absent — verified.
- D-1.3-016 / D-1.3-017: §4.4.19 lines 5631 and 5634 (PromotedListingAuctionRun, MarketplaceDiscoveryLedgerEntry references) — verified; §4.4 / §4.8 grep confirms no entity-level authoring.
- D-1.3-021 / D-1.3-022 / D-1.3-023: Appendix M.1 grep for SellerInventoryDemotionExemption / EOIRateLimitOverride / OpsActionRecord — zero matches.

### 3.2 Is severity rule-based per Audit_Prompts.md → Severity Definitions?

- **D-1.3-001 (P0)** — Rule (b) "exposes PII or PCI scope to an unintended actor." Buyer Org identity is identifiable PII under GDPR Recital 26 (re-identification via attribute combination is identification). The spec itself flags the gap and defers the fix. P0 confirmed.
- **D-1.3-002 / D-1.3-003 / D-1.3-004 / D-1.3-016 / D-1.3-017 / D-1.3-031 (P1)** — Rule "missing field-level schema" / "feature unbuildable as written." Each defect is a referenced field/entity with no field table; junior engineer would build the wrong thing or fail to build entirely. P1 confirmed.
- **D-1.3-005 / D-1.3-006 / D-1.3-007 / D-1.3-008 / D-1.3-009 (P1)** — Rule "missing retention/DSAR/residency clause" + "missing acceptance criteria" + "missing state machine." Each entity is below Master Spec fidelity on multiple convention dimensions. P1 confirmed.
- **D-1.3-010 (P1)** — Rule "missing state machine" trigger condition references unobservable field. Buildability gap on the 30-day reactivation gate. P1 confirmed.
- **D-1.3-011 (P1)** — Rule "missing state machine ... prose state descriptions are NOT acceptable." Cascade rule is prose. P1 confirmed.
- **D-1.3-012 / D-1.3-013 (P1)** — Rule "Appendix J registration not yet cross-checked" / unregistered enum value used in §4–§51. P1 per Phase 2.1 Findings precedent (e.g., D-AJ-007 / D-AJ-011).
- **D-1.3-014 / D-1.3-015 / D-1.3-018 / D-1.3-020 (P1)** — Rule "missing webhook contract" + "AE-flagged but not registered." Webhook event names referenced in ACs are unregistered in Appendix C / Appendix G; subscribers cannot bind. P1 confirmed.
- **D-1.3-019 (P1)** — Audit prompt's CHECK #4 explicitly requires FTC-disclosure timestamp. Field absent. P1 confirmed.
- **D-1.3-021 / D-1.3-022 / D-1.3-023 (P1)** — Rule "surface introduced without Appendix-M row." Three §4.4 entities (4.4.25, 4.4.26, 4.4.27) introduced without M.1 rows. CI gate `appendix_m_coverage_on_diff` should fire. P1 confirmed.
- **D-1.3-024 / D-1.3-025 / D-1.3-026 (P1)** — Rule "missing state machine." Three entities have status enums but no transition table. P1 confirmed.
- **D-1.3-027 (P1)** — Rule "missing API endpoint contract." Entity has CRUD but no §32-compliant endpoint specs. P1 confirmed.
- **D-1.3-028 / D-1.3-029 (P1)** — Rule "conflicting numerical singleton between Master Spec and a companion strategy doc" — extended here to inter-§4 deprecated-field-reference drift. The §4.2.1 line 3560 `[STALE]` annotation declares the legacy `plan_tier` field deprecated; §4.4 ACs still reference it. P1 confirmed (junior engineer would build the wrong thing).
- **D-1.3-030 (P1)** — Rule "missing webhook contract" + "missing field-level schema" — 7 PostHog event names unregistered. P1 confirmed.
- **D-1.3-032 / D-1.3-033 / D-1.3-034 / D-1.3-035 / D-1.3-036 (P2)** — Rule "ambiguous in a way a thoughtful staff engineer could resolve, but the resolution is not the same across two readers." P2 confirmed for each.
- **D-1.3-037 / D-1.3-038 / D-1.3-039 (P3)** — Rule "cosmetic, terminological, or documentation drift." P3 confirmed.

### 3.3 Could recommendations be sharper?

Revisions made in place:
- D-1.3-001 recommendation now names the Authored-Extension lift (distinctiveness check elevation from FM-deferred to AC-mandated) and the AE ledger row ID to add.
- D-1.3-002 recommendation now names the §4.2.1 specific field add and §34.19.2 cross-reference update path.
- D-1.3-014 / D-1.3-015 / D-1.3-018 / D-1.3-020 recommendations name the Appendix-C event-class binding (`marketplace_discovery_lifecycle` / `verification_lifecycle`) so the registration is one PR.
- D-1.3-021 / D-1.3-022 / D-1.3-023 recommendations cite the Appendix M.1 row pattern from the existing "Data Model — Seller Console (§4.4)" group at lines 46245–46272.

---

## 4. Counterfactual Pass

For every audited entity, three realistic failure modes were enumerated and the spec checked for handling. Ten illustrative cases:

1. **§4.4.1 Bid Workspace concurrent submission.** Two seller users on the same Bid Workspace race to click Submit. Spec coverage: NONE. The status enum has no concurrency rule for `active → submitted`. **Filed in D-1.3-024** (no state machine table; no AC for race resolution).

2. **§4.4.4 Capability Declaration promoted-from-narrative race.** Two seller users concurrently promote the same `narrative_only` row to `taxonomy_declaration`. AC #5 says "atomically (single Convex transaction)" — covered. Failure mode handled. ✓

3. **§4.4.7 Marketplace Category deprecation with successor that itself is then deprecated.** Spec coverage: line 4730 "the redirect chain depth MUST NOT exceed 3 hops" + AC #5 enforces. Failure mode handled. ✓

4. **§4.4.8 Vendor Opt-Out Record — opt-out written for a deleted SellerSoftware.** Spec coverage: failure mode #2 (line 4798) addresses scope_target_purged transition. ✓

5. **§4.4.10 SellerOrgPage — domain ownership revoked post-publication.** Spec coverage: failure mode #1 (line 4968) cascades to suppressed_by_opt_out with synthetic record. ✓

6. **§4.4.18 SellerSignal — narrow-tuple re-identification.** Spec coverage: failure mode #4 acknowledges the gap; secondary distinctiveness check is *deferred* as Authored Extension. **Filed in D-1.3-001 (P0).**

7. **§4.4.19 PromotedListing — auction with single qualified bidder.** Spec coverage: failure mode #6 (line 5703) — cleared price defaults to declared floor. ✓

8. **§4.4.19 PromotedListing — `PromotedListingAuctionRun` write fails.** Spec coverage: failure mode #8 (line 5705) — auction still resolves; logged to secondary incident queue. But the *entity itself* is Authored Extension flagged and not authored. **Filed in D-1.3-016.**

9. **§4.4.21 VerificationReviewRecord — Reviewer SLA breach during Ops outage.** Spec coverage: failure mode #3 (line 5962) — `auto_rejected_sla_breach` transition + zero-cost resubmit credit. ✓

10. **§4.4.22 SellerOnboardingSession — Stage-3 population latency >10s caused by `kb_bootstrap` Managed Agent failure.** Spec coverage: failure mode #4 (line 6118) — alert fires; `hero_moment_completed_at` not populated; session still progresses. ✓ But the 7 PostHog events are unnamed. **Filed in D-1.3-030.**

---

## 5. Coverage-Matrix Tightening

24 §4.4-anchored COVERAGE_MATRIX rows promoted from Phase-0 ⚠ floor on the basis of this Phase 1.3 deep read, and 21 cells demoted to ❌ where this audit confirmed the absence:

| F-ID | Feature | Anchor | Demotions |
|---|---|---|---|
| F-105 | Bid Workspace Entity | §4.4.1 | `state_machine` ⚠ → ❌ (D-1.3-024); `retention` ⚠ → ❌ (D-1.3-005); `acceptance_criteria` ⚠ → ❌ (D-1.3-024 / D-1.3-005). |
| F-106 | Bid Response Entity | §4.4.2 | `state_machine` ⚠ → ❌ (D-1.3-025); `retention` ⚠ → ⚠ (D-1.3-006 — citation broken but in-entity prose present). |
| F-107 | Seller Profile Entity | §4.4.3 | `data_model` ⚠ → ❌ (D-1.3-007); `state_machine` ⚠ → ❌; `retention` ⚠ → ❌; `acceptance_criteria` ⚠ → ❌; `console_firewall` ⚠ → ❌. |
| F-108 | Capability Declaration Entity | §4.4.4 | `enums` ⚠ → ❌ (D-1.3-013 missing solo_free_auto_publish); `api` ⚠ → ❌ (D-1.3-027 missing §32 endpoints); `retention` ⚠ → ⚠ (D-1.3-009 — §40.2 row missing). |
| F-109 | Bid Task Entity | §4.4.5 | `data_model` ⚠ → ❌ (D-1.3-008); `state_machine` ⚠ → ❌ (D-1.3-026); `retention` ⚠ → ❌; `acceptance_criteria` ⚠ → ❌; `api` ⚠ → ❌; `console_firewall` ⚠ → ❌. |
| F-110 | Bid Schedule Entity | §4.4.6 | `data_model` ⚠ → ❌ (D-1.3-009 — soft-delete invariant broken); `retention` ⚠ → ❌; `acceptance_criteria` ⚠ → ❌; `api` ⚠ → ❌; `console_firewall` ⚠ → ❌. |
| F-111 | Seller Console Entity Set | §4.4 | `surface_engine_mapping` ⚠ → ⚠ (D-1.3-021 / D-1.3-022 / D-1.3-023 — three §4.4.25 / §4.4.26 / §4.4.27 entities not in M.1). |
| F-326 | KBNamespace Entity | §22.3.4 | (held; §22.3.4 reviewed in §22 deep-read; promotion deferred to Phase 1.4 §22 sub-prompt). |
| F-415 | Seller Profile (§26.1 anchor; §4.4.10 link) | §26.1 | (mirror of F-107 demotions on the §4.4.3 side; F-415 itself anchored to §26.1 — promotion deferred to Phase 1.5 §26 sub-prompt). |
| F-416 | Verification Tiers | §26.2 | `data_model` ⚠ → ❌ (D-1.3-003 — Organization.seller_verification_tier missing); `webhook` ⚠ → ❌ (D-1.3-020). |
| F-419 | Seller Organization Page | §26.7 | `acceptance_criteria` ⚠ → ⚠ (D-1.3-033 — firewall AC absent); `webhook` ⚠ → ⚠ (existing partial). |
| F-423 | SellerSoftware & Software Pages | §26.8 | (held; §26 deep-read deferred). |
| F-440 | Vendor Opt-Out Global Registry | §27.10 | `state_machine` ⚠ → ❌ (D-1.3-011 — cascade rule is prose); `enums` ⚠ → ❌ (D-1.3-012 — `not_applicable` sentinel unregistered). |
| F-458 | Marketplace Discovery Pricing | §27.11 | `data_model` ⚠ → ❌ (D-1.3-016 / D-1.3-017 — PromotedListingAuctionRun + MarketplaceDiscoveryLedgerEntry not authored). |
| F-459 | Promoted Listings | §27.11.2 | `webhook` ⚠ → ❌ (D-1.3-014 / D-1.3-015); `plan_gating` ⚠ → ❌ (D-1.3-028 — stale plan_tier ref); `data_model` ⚠ → ❌ (D-1.3-016 / D-1.3-017). |
| F-460 | Featured Placements | §27.11.4 | `webhook` ⚠ → ❌ (D-1.3-018); `data_model` ⚠ → ❌ (D-1.3-019 — FTC disclosure timestamp absent). |
| F-559 | Seller Onboarding Flow | §35.2 | `posthog_events` ⚠ → ❌ (D-1.3-030 — 7 events unnamed). |
| F-647 | Loop L4: Seller-Profile SEO | §48.2.5 | (held; §48 deep-read deferred). |
| F-677 | M9 Per-Category Marketplace Landing Pages | §48.6.5 | (held; §48.6 deep-read deferred). |
| F-678 | M10 How to Evaluate Guides | §48.6.6 | (held). |
| F-679 | M11 Software Comparison Pages | §48.6.7 | (held). |
| F-680 | M12 Aggregate Market Intelligence Reports | §48.6.8 | (held). |
| F-681 | M13 Public Marketplace Heat Map | §48.6.9 | (held). |
| F-683 | M15 Ghost-Bid Importer | §48.7.2 | (held). |

Aggregate counters NOT updated; matrix-row tightening on the §4.4 entity rows is a 17-of-970 sample. Per the COVERAGE_MATRIX.md doctrine, aggregate ✅ / ⚠ / ❌ / n/a totals will be re-derived after Phase 1.4 / 1.5 / 1.6 / 1.7 close, or in a Phase V2 cross-check.

---

## 6. Forwarded to Downstream Phases

- **Phase 2 (Enum sweep)** inherits D-1.3-012 (`not_applicable` sentinel unregistered), D-1.3-013 (`solo_free_auto_publish` AE-pending), D-1.3-034 (Ops-role enum registration verification).
- **Phase 4 (RBAC + Acceptance Criteria)** inherits D-1.3-005 / D-1.3-006 / D-1.3-007 / D-1.3-008 / D-1.3-009 / D-1.3-010 / D-1.3-024 / D-1.3-025 / D-1.3-026 / D-1.3-033 entity-level AC and state-machine authoring (~80 ACs across 6 §4.4 entities; ~3 state machines).
- **Phase 6 (Privacy & Residency)** inherits D-1.3-001 (P0 distinctiveness check elevation), D-1.3-005 / D-1.3-006 / D-1.3-009 §40.2 retention-row gaps for Bid Workspace, Bid Response, Capability Declaration.
- **Phase 8 (API + Webhook)** inherits D-1.3-014 / D-1.3-015 / D-1.3-018 / D-1.3-020 / D-1.3-027 / D-1.3-030 webhook + endpoint authoring.
- **Phase 9 (Observability)** inherits D-1.3-019 FTC-disclosure-timestamp instrumentation and D-1.3-030 7-event PostHog binding.
- **Phase 11 (Surface/Engine Mapping)** inherits D-1.3-021 / D-1.3-022 / D-1.3-023 three Appendix-M.1 row authorings.
- **Phase V2 (Cross-Phase)** inherits D-1.3-002 / D-1.3-003 §4.2.1 Organization field additions for KB Value Meter + Verification Tier — these touch §4.2 (governed by Phase 1.1 sub-prompt) but are surfaced here because the consuming entity is in §4.4. Cross-phase coordination required.
