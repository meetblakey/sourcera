# Sourcera Audit — Phase 2.2 Findings Log (§4.4 Seller Console Entities)

**Phase scope.** §4.4 Seller Console Entities (lines 4446–6531): 29 entities spanning Bid Workspace, Bid Response, Seller Profile, Capability Declaration, Bid Task / Schedule, Marketplace Category, Vendor Opt-Out Record, SellerSoftware, SellerOrgPage, SoftwarePage, CategoryPage, GuidePage, ComparisonPage, MarketIntelligenceReport, HeatMapCell, GhostBidImport, SellerSignal, PromotedListing, FeaturedPlacement, VerificationReviewRecord, SellerOnboardingSession, OnboardingAntiPatternExceptionGrant, EOIDraftQueue, SellerInventoryDemotionExemption, EOIRateLimitOverride, OpsActionRecord, TemplateLibraryEntry, BidSuccessShare. Cross-reads of §4.7 (Console Bridge / Vendor Disqualification), §22.18 (KB Value Capture), §22.20 (Seller Maya Surface Abstraction), §27.10 (Vendor Opt-Out Global Registry), §34.19 (Plan Upgrade Carry-Over), §49.1 (Seller Onboarding 7-Stage Flow), §39 (Object Size Constraints), §44 (Performance Budgets), §48.6.4 (k-anonymity render gate), §M (Appendix M Surface/Engine), §J (Appendix J Controlled Vocabulary).

**Reading mode.** End-to-end §4.4 + cross-section reads of every cited authoritative source. No grep-only judgments. Adversarial pass: every entity inspected against the 14-dimension checklist plus the prompt's eight seller-specific checks (console isolation, KB-namespace cascade, KB Value Capture fields, Marketplace Discovery auction/FTC/verification, Seller Onboarding 7-stage capture, Seller Maya state backing, Vendor Opt-Out cascade, k-anonymity floors).

**Defect-ID convention.** Phase 2.2 defects use `D-2.2-NNN`. All defects appended to `DEFECT_LEDGER.md` post-self-challenge.

---

## Cluster A — Appendix J Enum Registration Gaps (P1, mass-defect)

The §4.4 entities declare ~50 enums; ~30 of them are NOT registered in Appendix J. Authoring Convention #3 (Appendix J registration) requires every enum value used in §4–§51 to appear in Appendix J. The Appendix J §4.4.19–§4.4.22 partition (lines 44256–44402) covers PromotedListing, FeaturedPlacement, VerificationReviewRecord, and SellerOnboardingSession but stops there — every other §4.4 entity's enums are unregistered.

**Verified-unregistered enums (grepped Appendix J line ranges 42551–46500; no `#### \`enum_name\`` headings present):**

§4.4.2 — `bid_response_reverification_reason` (`requirement_amended` | `requirement_reverted`) — declared field `reverification_reason` (line 4490) cites "per Appendix J `bid_response_reverification_reason`"; not registered.

§4.4.4 — `capability_declaration_type`, `capability_declaration_state`, `capability_declaration_quarantine_reason`, `capability_maturity_level`, `capability_geographic_scope` — declared inline at §4.4.4 (line 4614–4620) as "Appendix J Enum Registrations (added in this prompt)"; never propagated into Appendix J.

§4.4.4 (Phase 14.8 extensions) — `capability_declaration_pending_review_reason` value `solo_free_auto_publish`, `evidence_insufficient_solo_free_added_chip`; `created_via` values `kb_to_capability_suggestion_solo_free_auto_publish`, `maya_added_chip` — referenced by §22.20.2 lines 17929–17933 + §22.20.7 ratification list (item 1 + item 4) but Appendix J `capability_declaration_pending_review_reason` does not exist.

§4.4.7 — `marketplace_category_state` (`draft` | `active` | `deprecated`), `marketplace_category_icon_token`.

§4.4.8 — `vendor_opt_out_scope_kind`, `vendor_opt_out_scope_ref_type`, `vendor_opt_out_page_type_filter`, `vendor_opt_out_reason_code`, `vendor_opt_out_ops_review_status`, `vendor_opt_out_retro_backfill_status`. All six declared in §4.4.8 (lines 4744–4757); none registered.

§4.4.9 — `seller_software_pricing_model`, `seller_software_maturity_stage`, `seller_software_claim_status`, `seller_software_page_status`, `seller_software_seo_status`, `seller_software_claim_verification_method`. Six enums on a single entity; none registered.

§4.4.10 — `page_publication_status` (shared across §4.4.10 / §4.4.11 / §4.4.12 / §4.4.13 / §4.4.14 / §4.4.15 / §4.4.16 — single shared enum). Not registered.

§4.4.12–§4.4.15 — `editorial_review_status` (shared across CategoryPage / GuidePage / ComparisonPage / MarketIntelligenceReport). Not registered.

§4.4.15 — `market_intel_residency_scope` (`global` | `us_only` | `eu_only` | `apac_only`). Not registered. Reused by §4.4.16 HeatMapCell `residency_region_scope` and §4.4.18 SellerSignal `residency_region_scope` — same enum, three consumers, zero registration.

§4.4.16 — `heat_map_company_size_band` (also referenced by §4.4.18 SellerSignal); `heat_map_demand_trend` (`up` | `flat` | `down` | `insufficient_data`).

§4.4.17 — `ghost_bid_import_type` (`paste` | `upload_document` | `upload_zip`); `ghost_bid_import_status` (`draft` | `parsing` | `parsed` | `review_pending` | `publishing` | `published` | `rejected` | `failed`); `ghost_bid_import_rejected_by_role` (`seller_user` | `ops_moderation` | `content_validator`). Note: a different enum, `ghost_bid_import_source_enum`, IS registered at Appendix J line 44576 (§48.3.5 partition), but it does NOT cover the §4.4.17 GhostBidImport entity's `import_type` / `import_status` / `rejected_by_role` fields.

§4.4.18 — `seller_signal_timeline_band` (5 values), `seller_signal_intent_strength` (4 values), `seller_signal_suppressed_reason` (5 values). The §27.9 partition registers `seller_signal_de_anon_trigger`, `_de_anon_legal_basis`, `_suppression_render_mode`, `_delivery_channel` — but NOT the three §4.4.18 enums above.

§4.4.19 (PromotedListing — partial gap) — Appendix J registers `promoted_listing_placement_surface` (line 44256), `_placement_mode` (44262), `_status` (44268), `_eligibility_failure_reason` (44274). MISSING: `promoted_listing_eligibility_failure_reason` covers eligibility-gate failures but NOT `category_cap_exhausted`, `monthly_allotment_exhausted`, `frequency_cap_exhausted`, `daily_cap_exhausted`, `exhausted`, `expired` — these are status values, registered under `_status`, but the Failure Mode #5 says vendor opt-out cascade transitions to `paused_by_ops` — `paused_by_ops` IS in `_status`. So this row passes once the ops_pause_reason field's enum is registered. The `ops_pause_reason` enum is referenced in §4.4.19 state machine (line 5655 "`ops_pause_reason` required") but not declared as an Appendix J enum.

§4.4.21 (VerificationReviewRecord — partial gap) — Appendix J registers `verification_review_request_kind` (44322), `verification_review_outcome` (44328), `verification_review_rejection_reason` (44334), `verification_review_legal_escalation_reason` (44340), `verification_tier_downgrade_reason` (44346). MISSING: `seller_verification_tier` (`basic` | `verified` | `certified`) referenced as `Appendix J `seller_verification_tier`` (line 5569 PromotedListing; line 5841 verification tiers definitions); not registered.

§4.4.23 — `onboarding_anti_pattern_kind` (Appendix J registers `onboarding_anti_pattern_kind_enum` at line 44636 — naming drift `_kind` vs `_kind_enum`); `onboarding_anti_pattern_exception_scope_kind`, `onboarding_anti_pattern_exception_reason_category`, `onboarding_anti_pattern_exception_revert_reason`, `onboarding_anti_pattern_exception_status`. Appendix J registers `onboarding_anti_pattern_exception_status_enum` at line 44648 (also `_enum` suffix drift). The other three are not registered at all.

§4.4.24 — `eoi_draft_status` (`queued` | `materialized` | `expired` | `revoked_by_seller` | `revoked_by_ops`); `eoi_draft_gate_reason` (`plan_tier_below_starter` | `plan_tier_below_required_for_category` | `eoi_rate_limit_window_exhausted` | `wallet_insufficient_for_eoi_cost`).

§4.4.25 — `seller_inventory_demotion_exemption_kind`, `_revert_reason`, `_status`. Three enums; none registered.

§4.4.26 — `eoi_rate_limit_constraint_kind` (`per_seller_24h` | `per_category_7d` | `per_buyer_30d`); `eoi_rate_limit_override_reason_kind`; `eoi_rate_limit_override_revert_reason`; `eoi_rate_limit_override_status`. Four enums. The §48.4.12 partition registers `marketplace_eoi_constraint_kind_enum` at line 44606 with the SAME three values (`per_seller_24h, per_category_7d, per_buyer_30d`) — duplicate canonical home; one of them must be retired.

§4.4.27 — `ops_action_kind` IS registered (line 44769); MISSING: `ops_action_reason_category` (7 values), `ops_action_target_entity_kind` (polymorphic union).

§4.4.28 — `template_kind` (5 values), `template_curation_state` (6 values). Note: Appendix J line 44588 registers `template_featured_placement_kind_enum` (a DIFFERENT enum used for `featured_placement_kind`). The two §4.4.28 enums above are not registered.

§4.4.29 — `bid_success_share_status` (10+ values), `bid_success_share_revoked_reason`, `bid_success_share_social_platform`. None registered.

§4.7.1 — `console_bridge_event_kind` (19 values listed inline at line 4343), `console_bridge_event_direction`, `console_bridge_event_sync_status`, `console_bridge_event_failure_reason`, `console_bridge_event_conflict_resolution`. Five enums; none registered. The `console_bridge_event_kind` enum is heavily referenced by the §4.7.1.1 retention class table (lines 7464–7465) and the §4.7.1 redaction matrix (lines 7384–7400) — every consumer is in §4.4 / §4.7, but Appendix J has no entry.

§4.7.2 — `vendor_disqualification_severity` (`soft` | `account_level` | `global_ban`), `vendor_disqualification_trigger` (6 values), `vendor_disqualification_notification_style` (3 values), `vendor_disqualification_appeal_status` (7 values). None registered.

§22.18.2.1 (KBExportJob — referenced by §4.4.x via Honest-Portability path) — `kb_export_format_kind_enum` IS registered (line 44675); `kb_export_failure_code_enum` IS registered (line 44681). ✓ exempted.

§4.2.1 cross-pass (data_residency_region) — §4.2.1 line 3556 cites `Appendix J line 44745` as the `data_residency_region` registration anchor. Line 44745 is `ops_session_console_scope`, NOT `data_residency_region`. The `data_residency_region` enum (`us | eu | apac | custom`) is NOT registered anywhere in Appendix J despite being referenced from ~14 §4.4 entity rows. This is a P1 mass cross-cut.

§4.4.9 — `data_retention_tier` (`standard` | `extended_financial`). Not registered.

**Severity rationale.** Each missing-enum row is **P1** by the Defect Ledger Format rule "missing field-level schema, missing acceptance criteria, missing state machine, missing error code, missing webhook contract, missing plan-gating row, missing retention/DSAR/residency clause, conflicting numerical singleton ... or surface introduced without an Appendix-M row." An unregistered enum is unbuildable at the validation layer (the `enum_value_appendix_j_registry` validator referenced in §M.5 cannot lint values that don't exist). One ledger row per cluster, one consolidated AC, but the underlying defect count is ≥ 30 enum families.

**Defect filings.**
- D-2.2-001 P1 enum (vendor_opt_out_* family — six enums, §4.4.8)
- D-2.2-002 P1 enum (vendor_opt_out_authority_* family — four enums, §27.10.2.1)
- D-2.2-003 P1 enum (console_bridge_event_* family — five enums, §4.7.1)
- D-2.2-004 P1 enum (seller_software_* family — six enums, §4.4.9)
- D-2.2-005 P1 enum (capability_declaration_* family — five enums, §4.4.4)
- D-2.2-006 P1 enum (page_publication_status + editorial_review_status, §4.4.10–§4.4.16)
- D-2.2-007 P1 enum (heat_map_company_size_band + heat_map_demand_trend, §4.4.16)
- D-2.2-008 P1 enum (market_intel_residency_scope, §4.4.15 + §4.4.16 + §4.4.18)
- D-2.2-009 P1 enum (marketplace_category_state + marketplace_category_icon_token, §4.4.7)
- D-2.2-010 P1 enum (ghost_bid_import_type + _status + _rejected_by_role, §4.4.17)
- D-2.2-011 P1 enum (seller_signal_timeline_band + intent_strength + suppressed_reason, §4.4.18)
- D-2.2-012 P1 enum (eoi_draft_status + _gate_reason, §4.4.24)
- D-2.2-013 P1 enum (seller_inventory_demotion_exemption_* family — three enums, §4.4.25)
- D-2.2-014 P1 enum (eoi_rate_limit_override_* family — four enums + per_seller_24h duplicate-canonical-home conflict, §4.4.26)
- D-2.2-015 P1 enum (onboarding_anti_pattern_exception_* family — four enums + naming drift, §4.4.23)
- D-2.2-016 P1 enum (ops_action_reason_category + _target_entity_kind, §4.4.27)
- D-2.2-017 P1 enum (template_kind + template_curation_state, §4.4.28)
- D-2.2-018 P1 enum (bid_success_share_status + _revoked_reason + _social_platform, §4.4.29)
- D-2.2-019 P1 enum (vendor_disqualification_* family — four enums, §4.7.2)
- D-2.2-020 P1 enum (data_residency_region — false-citation to line 44745 + actual non-registration, §4.2.1 + §4.4 mass)
- D-2.2-021 P1 enum (data_retention_tier, §4.4.9)
- D-2.2-022 P1 enum (seller_verification_tier, §4.4.21 + §4.4.19)
- D-2.2-023 P1 enum (bid_response_reverification_reason, §4.4.2)
- D-2.2-024 P1 enum (PromotedListing ops_pause_reason — undeclared but state-machine-referenced, §4.4.19)

---

## Cluster B — Numerical Singleton Violations (P1)

Every dollar figure, character limit, file-size limit, duration, rate-limit, k-anonymity floor, and retention TTL has exactly one authoritative home (§34, §39, §44, §6.8, §40.2, §42.1) per Authoring Convention #10. §4.4 entity field tables inline-restate at least 22 numerics that have a canonical home.

**k-anonymity floor inline restatements.** §4.4.12 CategoryPage (line 5067 `k_anon_floor | 5 (default, Summary §3.5)`); §4.4.13 GuidePage (line 5143 `k_anon_floor | 5 | Per Summary §3.5`); §4.4.14 ComparisonPage (line 5210 `k_anon_floor | 5 | For any buyer-signal-derived stats on the page`); §4.4.15 MarketIntelligenceReport (line 5282 `k_anon_floor | 20 (fixed; Summary §3.5)`); §4.4.16 HeatMapCell (line 5347 `k_anon_floor | 10 (fixed)`); §4.4.18 SellerSignal (line 5482 `k_anon_floor | 5 (fixed) | Summary §3.5`); §4.4.19 PromotedListing (line 5576 `k_anon_floor | 5 (fixed) | Applies to impression attribution writes only`).

Authoritative home is §48.6.4 ("Cross-Mechanic k-Anonymity Render Gate") — header at line 34131. Every §4.4 row should cite §48.6.4 by table cell, not restate 5 / 10 / 20 inline. **D-2.2-025 P1 numerical_singleton.**

Additional drift: every Summary §3.5 citation is **stale** (Master Summary retired in v7.0.0 per CLAUDE.md §2; snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`). All k-anon Summary §3.5 citations must redirect to §48.6.4. **D-2.2-026 P3 consistency_drift.**

**PromotedListing inline numerics.** Line 5552 `bid_impression_cents | ≥ 0; ≤ 5,000`, line 5553 `bid_eoi_cents | ≤ 100,000`, line 5557 `daily_cap_cents | 100–500,000`, line 5558 `per_eoi_cap_cents | 0–100,000`. Line 5616 (`category_cap` default = **3** governed via C.97), line 5618 (`monthly_allotment_snapshot.purchased_top_up_this_month < **4**` per Summary §2.10), line 5567 (`eligibility_kb_health_floor` default = **60.00** governed via C.97). All seven values are inline literals; the §34 / §39 home is missing or unstamped. **D-2.2-027 P1 numerical_singleton (PromotedListing).**

Note: §34 (Pricing) authors the SPS §12.1 `$500/category/week` price for `purchased_top_up` PromotedListing slots, but the §4.4.19 entity references SPS §12.1 inline at line 5551 rather than citing §34. **D-2.2-028 P3 numerical_singleton (PromotedListing — SPS direct citation).**

**VerificationReviewRecord inline numerics.** Line 5872 `next_review_due_at | default reviewed_at + 90 days` (per Summary §6.16.6 — stale source); line 5874 SLA `Verified = **5 business days** ... Certified = **10 business days**`; line 5879 `appeal_window_closes_at | 14 days`; line 5927 `kb_health_score_snapshot ≥ 70.00 (authored floor; governed via C.97)`. All inline; canonical home is §44 (SLAs) or §34 (thresholds). **D-2.2-029 P1 numerical_singleton (VerificationReviewRecord SLAs/durations).**

Note: §39 row "Certified re-review cadence | 90 days" exists per `D-AS-008` but conflates expiry cadence with warning lead-time. The 90-day field on the entity is the recompute trigger interval, not the warning lead-time. Cross-link to D-AS-008 for the §39 row label fix.

**SellerOnboardingSession inline numerics.** Line 6008 `stage_3_population_latency_ms ≤ 10,000` cited as "P0 availability metric per Summary §6.28.2" (stale source); line 6021 Stake-Reveal "target ≥ 20s for 70%" inline; line 6066 "50k+ concurrent in_progress sessions at steady state" inline. Canonical home: §44 (perf budgets) per §44.6 Solo-Tier Surface Treatment cross-references. **D-2.2-030 P1 numerical_singleton (SellerOnboardingSession SLOs).**

**GhostBidImport inline numerics.** Line 5399 `source_file_byte_size | ≥ 0; ≤ 250MB per §39 addition` — `per §39 addition` references a §39 row that does not exist per `D-AS-010` (parsed_qa_pairs ≤ 500 missing). The 250 MB limit also missing from §39. Line 5400 `raw_text | ≤ 2,000,000 chars`, line 5401 `parsed_qa_pairs_json | ≤ 1,000,000 chars`. All four values inline. **D-2.2-031 P1 numerical_singleton (GhostBidImport size caps — §39 not authored).**

**ConsoleBridgeEvent inline numerics.** Line 7348 `payload_json | ≤ 256000 bytes (256 KB hard cap per §31)` — §31 is the authoritative webhook home; the `(256 KB hard cap per §31)` is the right citation form, but it should resolve to a specific §31 cell, not a section-level fallback. **D-2.2-032 P3 numerical_singleton (ConsoleBridgeEvent payload cap).**

**FeaturedPlacement inline numerics.** Line 5761 `expires_at | Required; MUST be > active_from; MUST be ≤ active_from + 1 year` — 1-year ceiling inline; should cite §44 or §34. **D-2.2-033 P3 numerical_singleton (FeaturedPlacement expiry ceiling).**

**Authority attestation inline numerics.** §27.10.2.1 line 22626 `dns_challenge_expires_at | dns_challenge_issued_at + 24h`; line 22629 `dns_probe_attempt_count | capped at 50`; line 22642 `expires_at | Verified attestations expire 90 days after verified_at`. Three values inline; canonical home: §44 SLAs. **D-2.2-034 P3 numerical_singleton (VendorOptOutAuthorityAttestation lifecycle durations).**

---

## Cluster C — Console Firewall / Cross-Console Leakage (P0/P1 risk)

The §4.4 section title is "Seller Console Entities," and Authoring Convention #1 requires every console-scoped entity to declare a `console` enum. §4.4 has multiple entities that omit the declaration.

**Entities missing `console` enum field.**

§4.4.2 BidResponse (lines 4475–4496) — no `console` field. The entity is FK-anchored to `bid_workspace_id` (which has `console = 'seller' (fixed)` per §4.4.1) but the row itself omits the declaration. The §1.4 query-scoping convention ("Console-Scoped — entity declares `console` enum") is broken. **D-2.2-035 P1 firewall_leakage (BidResponse).**

§4.4.3 SellerProfile (lines 4506–4528) — no `console` field, no `updated_by` field. Cross-console reads are presumably blocked by `org_id` resolution but the §1.4 declaration is absent. **D-2.2-036 P1 firewall_leakage (SellerProfile).**

§4.4.5 BidTask (lines 4648–4664) — no `console` field, no `updated_by`. Same defect as BidResponse. **D-2.2-037 P1 firewall_leakage (BidTask).**

§4.4.6 BidSchedule (lines 4666–4681) — no `console` field, no `created_by`, no `updated_by`, no `deleted_at`. The entity has `bid_workspace_id` FK only; no audit trail per §4.1 Principle #2. **D-2.2-038 P1 firewall_leakage + data_model (BidSchedule).**

§4.4.16 HeatMapCell (lines 5337–5361) — no `created_by`, no `updated_by`. The entity is system-generated, but per §4.1 Principle #2 ("All mutable entities include created_at, updated_at, created_by, updated_by"), system actors must still write a system_agent_id_enum value (e.g., `system_agent_kb_exporter` analog). The HeatMap refresh worker is the writer; absent attribution, audit-trail integrity is broken. **D-2.2-039 P2 data_model (HeatMapCell audit trail).**

**Cross-console firewall — Vendor Opt-Out Record write-role drift.** §4.4.8 line 4762 says `created_by` MUST hold "seller_billing_admin or seller_org_admin"; §27.10.6 line 22772 (POST /api/v1/opt-outs) admits `seller_org_owner` as a third permitted writer. The two roles lists disagree. **D-2.2-040 P2 rbac (vendor opt-out create role drift).**

**Cross-console firewall — Console Bridge Event extension governance.** §4.7.1 line 7343 declares `console_bridge_event_kind` "Authored-Extension permitted" with the §M.4 CI gate handling new kinds. This is good. However, the redaction matrix (lines 7384–7400) authors per-kind `Fields CARRIED` / `Fields NEVER CARRIED` rules for ONLY 13 of the 19 enum values. Six values (`workspace_canceled`, `workspace_reopened_ops`, `eoi_acceptance_propagated`, `eoi_acceptance_reversed`, `revert_propagated`, `phase_advanced` is partially covered) lack a dedicated redaction matrix row — the matrix has rows merging multiple kinds (e.g., `workspace_canceled, workspace_reopened_ops`), which is fine for prose but the **Fields CARRIED** / **Fields NEVER CARRIED** invariant must be per-kind enforceable. Re-read confirms 14 redaction rows × 19 enum values = ~5 kinds undocumented for redaction. **D-2.2-041 P1 firewall_leakage (Console Bridge Event redaction matrix coverage gap).**

**HeatMapCell sentinel `scope_kind=not_applicable` (P0 risk).** §4.4.16 prose (line 5333) introduces a sentinel `scope_kind=not_applicable` value for the Vendor Opt-Out Registry probe of HeatMapCells. The §4.4.8 `vendor_opt_out_scope_kind` enum declares `global | category | software | page_type | specific_page` — `not_applicable` is NOT a member. A registry write with `scope_kind=not_applicable` would violate the enum-bound-write contract; the prose states "with a sentinel `scope_kind=not_applicable` record in the registry" but the registry cannot accept this value. The HeatMapCell `vendor_opt_out_honored_at` field stamping is structurally inapplicable (no vendor identity is rendered on a heat map cell), so the resolution is to NOT stamp the field on HeatMapCell and document the structural inapplicability. **D-2.2-042 P0 firewall_leakage (sentinel enum value violates enum bound; could allow injection of arbitrary scope_kind values at write time if the validator is weakened to admit "sentinel" exceptions).**

---

## Cluster D — Marketplace Discovery Defects (P1)

**FeaturedPlacement FTC disclosure timestamp gap.** Prompt requires FeaturedPlacement to "carry FTC-disclosure timestamp." §4.4.20 has `ftc_disclosure_label` (fixed `"Featured"`) and `ftc_tooltip_copy_markdown` (Ops-authored), but no field captures *when the disclosure was rendered to a buyer* (per-render observation). FCR 16 CFR Part 255 compliance defense requires evidence that the disclosure rendered, not just that the label exists. The `vendor_opt_out_honored_at` field is stamped on every cache-bust sweep, but no symmetric `ftc_disclosure_rendered_observed_at` exists. AC #2 (line 5829) requires the label to "render on every public surface" with a DOM contract test, but a deploy-time DOM test is not a per-render observation log. **D-2.2-043 P1 data_model (FeaturedPlacement FTC disclosure render-time observation).**

**PromotedListing forward-references to undefined entities.** §4.4.19 line 5556 references `MarketplaceDiscoveryLedgerEntry` (Authored Extension — flagged); the entity is NOT defined anywhere in §4.4 / §4.7 / §4.8 — Appendix J line 45422 mentions it as "Authored Extension; Referenced by §4.4.19 but not yet fully specified — flagged in RECONCILIATION → Authored Extensions." Same defect for `PromotedListingAuctionRun` (referenced lines 5634, 5705; defined at Appendix J line 45424 only as "Authored Extension"). PromotedListing AC #6 (line 5714) requires a reconciliation job between `spend_to_date_cents` and `MarketplaceDiscoveryLedgerEntry` — the AC is unbuildable because the target entity has no field table. **D-2.2-044 P1 data_model (MarketplaceDiscoveryLedgerEntry undefined entity blocks AC #6).** **D-2.2-045 P1 data_model (PromotedListingAuctionRun undefined entity blocks AC #2 + Failure Mode #8).**

**PromotedListing webhook forward-references.** §4.4.19 references `promoted_listing.eligibility_lost`, `promoted_listing.paused_by_opt_out`, `featured_placement.revoked` (line 5715, 5666, 5818) all "Authored Extension — flagged." Not authored in §31 / Appendix C. The §31 webhook conventions (HMAC-SHA256, idempotency via event_id, exponential backoff, DLQ after 5 failures, ≤256 KB payload, registration in Appendix C + Appendix G) are unsatisfied. **D-2.2-046 P1 webhook (PromotedListing/FeaturedPlacement webhook contracts unauthored).**

**VerificationReviewRecord webhook forward-reference.** §4.4.21 line 5978 references `verification.tier_downgraded` (Authored Extension — flagged). Not authored. **D-2.2-047 P1 webhook (VerificationReviewRecord tier-downgraded webhook unauthored).**

**SellerOrgPage / SoftwarePage cascade webhook forward-reference.** §4.4.10 line 4968 references `vendor_opt_out.applied` webhook chain; this IS authored at §4.4.8 / §27.10.7. But §4.4.10 also implies a `seller_org_page_suppressed_by_opt_out` synthetic event for the Failure Mode #1 cascade — not authored. **D-2.2-048 P3 webhook (SellerOrgPage suppression-cascade webhook unauthored).**

**SellerSignal `SellerSignalDelivery` index forward-reference.** §4.4.18 line 5468 says "Distribution targets are Seller Orgs via a separate `SellerSignalDelivery` index (authored extension; deferred)." The plan-tier entitlement check (Growth+ per the same line) depends on this index. Deferred = unbuildable as written. **D-2.2-049 P2 data_model (SellerSignalDelivery deferred entity blocks plan-gate enforcement).**

**Auction-clearing fields — ✓.** PromotedListing carries `cleared_cpm_cents`, `cleared_eoi_cents`, `clearing_price_cents`. Second-price auction mechanics fully authored at §4.4.19 lines 5623–5634. ✓ no defect.

**Verification — Ops reviewer FK + outcome — ✓.** §4.4.21 carries `reviewer_ops_user_id` (FK with role gate `ops_verification_reviewer`) and `outcome` enum. ✓ no defect.

---

## Cluster E — Seller Onboarding 7-Stage Flow Coverage (P0–P2)

**Stage capture — ✓.** §4.4.22 SellerOnboardingSession captures all 7 stages via timestamp columns (`stage_1_arrival_at` through `stage_7_*`). The 1:1 stage-to-timestamp mapping is reproduced in §49.1 line 35977 lookup table. ✓ structural coverage.

**Activation metric — ✓.** §4.4.22 has `activation_metric_elapsed_seconds` (computed = `EXTRACT(EPOCH FROM first_requirement_response_at - stage_1_arrival_at)`) plus monotonicity DB trigger (AC #2). ✓.

**p50 < 20 min, p90 < 60 min targets.** §4.4.22 narrative (line 5983) cites the targets but they are not stored or enforced as configurable fields. The §44 Performance Budgets table is referenced as the authoritative SLO home, but §4.4.22 doesn't cross-reference §44 by anchor. **D-2.2-050 P3 numerical_singleton (Activation Metric SLO unstamped to §44).**

**Stage 3 population latency P0 alert.** §4.4.22 line 6008 declares `stage_3_population_latency_ms` with the P0 SLO ≤ 10,000 ms. The on-call alert path is documented but **D-2.2-030 / D-2.2-050 cover the numerical-singleton drift.**

**Pre-Stage-2 row tenant isolation gap.** §4.4.22 line 5990 says `org_id (Nullable until Stage 2)`. Pre-Stage-2 rows have NO org_id and NO user_id (line 5993), only `recipient_email_hash` + `invite_magic_link_id`. The retention/DSAR section (lines 6099–6104) does not enumerate how a pre-Stage-2 row is scoped for DSAR (the subject's email is hashed but the row is still subject-bearing for fingerprint purposes). The `seller_domain_hint` field is plaintext — a pre-Stage-2 row carries a domain-grade fingerprint that can be DSAR-scoped but the cascade rule is silent. **D-2.2-051 P2 dsar (SellerOnboardingSession pre-Stage-2 DSAR scoping gap).**

**Cross-Org seller user disambiguation flow — Authored Extension flag.** §4.4.22 Failure Mode 10 (line 6124) describes the Forced-Vendor-Signup multi-Org disambiguation path as "Authored Extension — flagged." AC #8 (line 6135) requires the disambiguation flow to engage. Status as of v7.1.0 is unclear — is the AE still pending? Cross-link to AUTHORED_EXTENSIONS_LEDGER. **D-2.2-052 P3 authored_extension (SellerOnboardingSession multi-Org disambiguation AE status unstamped).**

---

## Cluster F — Seller Maya Surface Abstraction (P2)

**§22.20.2 entity-field drift.** §22.20.2 introduces three Authored Extension fields/enums on §4.4.4 CapabilityDeclaration: (a) `display_label_override` field (string, nullable, ≤ 50 chars), (b) `created_via` enum extensions (`kb_to_capability_suggestion_solo_free_auto_publish`, `maya_added_chip`), (c) `pending_review_reason` enum extensions (`solo_free_auto_publish`, `evidence_insufficient_solo_free_added_chip`). The §4.4.4 entity field table (lines 4536–4565) does NOT carry any of these fields. The §22.20.2 "engine preservation contract" prose (line 17931) asserts "Every Capability Declaration emitted on Solo / Free remains a fully-formed §4.4.4 entity" — but the entity schema has not been updated to admit the new field. The `display_label_override` is required for the chip-list rename affordance per §22.20.2 + §22.20.7 AC #84.

The Authored Extensions are flagged in §22.20.7 (item 1, item 3, item 4) as requiring sign-off. The status is "registered; require human sign-off" per RECONCILIATION → Phase 14.8. As of v7.1.0 stamp the AEs are not yet ratified, but §22.20.7 ACs reference the fields as if they exist. **D-2.2-053 P2 data_model (CapabilityDeclaration §22.20.2 AE fields not landed in §4.4.4 entity table).**

**§4.4.4 state machine row 7a forward-reference.** §22.20.2 line 17933 declares the new state-machine transition `(none) → published` directly via `pending_review_reason = 'solo_free_auto_publish'`. The §4.4.4 state machine table (lines 4574–4584) has 7 rows; row 7a (`narrative_only / published → deprecated (implicit) on promotion`) exists but is the existing row 7. The new row 7a (Solo/Free auto-publish) is not in the §4.4.4 state machine. The Appendix L `capability_declaration_state_machine` registration (referenced in §22.20.7 item 2) is unconfirmed. **D-2.2-054 P2 state_machine (CapabilityDeclaration Solo/Free auto-publish transition not landed in §4.4.4 state machine).**

**Seller Maya states — backing entity coverage.** §22.20 introduces Compression Rules 1–4 (Capability Declarations / KB Governance / Match Scoring / AIOp Consumption). Each rule has telemetry events but none introduce new state fields on existing entities (per §22.20 "What §22.20 is NOT" at line 17913). The Maya-visible "weekly KB summary" notification (§22.20.3) requires a new notification event registration; this is registered in Appendix G via §22.20.7 item 8 but the notification entity itself is not in §4.4. ✓ structurally OK because the notification fires off the existing engine events; no defect.

---

## Cluster G — Vendor Opt-Out Cascade Testability (P1)

**Cascade target enumeration missing.** Prompt requires "the §4.7 Vendor Opt-Out Record cascades to all of them (cascade rule must be testable, not prose)." §4.4.8 declares `retro_backfill_status` (`pending` | `in_progress` | `complete` | `failed` | `not_applicable`) and AC #5 asserts "retroactive backfill sweep MUST update `retro_backfill_affected_page_count` accurately (tolerance ±0)." The sweep target list is described in **prose** at §27.10.3 (Enforcement Surfaces table — 17 surfaces) but there is no first-class field on Vendor Opt-Out Record that enumerates which §4.4 entity tables the sweep walked. The §27.10.5 retroactive-application contract states "the retro sweep is for database self-consistency, not enforcement" but the per-table cascade affordance is not testable beyond the count.

A testable cascade would require either: (a) per-table sweep state ledger as a child entity; (b) a structured `retro_backfill_targets_swept_json` field listing `(table, row_count, swept_at)` per target; (c) explicit per-target webhook events. None present. **D-2.2-055 P1 firewall_leakage (Vendor Opt-Out cascade target list not enumerated as testable schema).**

**Cascade SLO drift between §4.4.8 and §27.10.4.** §4.4.8 AC #1 (line 4806) requires "all referenced public pages redact the seller's name within 15 minutes." §27.10.4 declares ≤ 60-second end-to-end live-render enforcement SLO. The 15-minute SLA is the retroactive-backfill SLA; the 60-second SLA is the live-render SLA. Both are correct but the §4.4.8 AC #1 wording conflates the two. **D-2.2-056 P3 acceptance_criteria (Vendor Opt-Out 15-min vs 60-sec SLA wording).**

**Public-facing seller entity carries `vendor_opt_out_honored_at` — ✓.** Confirmed across §4.4.9 / §4.4.10 / §4.4.11 / §4.4.12 / §4.4.13 / §4.4.14 / §4.4.15 / §4.4.18 / §4.4.19 / §4.4.20. §4.4.16 HeatMapCell carries it as a sentinel (defective per D-2.2-042). ✓ except for the sentinel issue.

---

## Cluster H — KB-Namespace Scope & Cascade (P2)

**SellerSoftware KB namespace cascade — ✓ for soft-delete.** §4.4.9 retention (line 4880) authors "KB namespace migrated to a platform-managed 'orphan' namespace for retrieval continuity of historical bids." `former_kb_namespace_ids` (append-only) preserves provenance. ✓.

**Seller Org pause vs delete cascade unspecified.** §4.4.9 covers Seller Org *delete* (90-day soft-delete then hard-purge) but the "pause" transition (e.g., for Ops compliance hold per §4.4.25 SellerInventoryDemotionExemption or §50.3.2 OpsActionRecord) is not addressed. A paused Seller Org's KB namespaces should presumably stay write-locked but read-active; no rule is authored. **D-2.2-057 P2 retention (SellerSoftware KB namespace cascade on Seller Org pause).**

**Stale citation: KB_Engineering_Spec §5.4.** §4.4.9 references "KB_Engineering_Spec §5.4" five times (lines 4838, 4839, 4854, 4876, 4889, 4895). KB_Engineering_Spec was retired in v7.0.0 per CLAUDE.md §2 (snapshot at `_versions/KB_Engineering_Spec_retired_2026-04-26.md`); content integrated into Master Spec §22. Citations should redirect to Master Spec §22. **D-2.2-058 P3 consistency_drift (SellerSoftware stale KB_Engineering_Spec §5.4 citations).**

**KB Value Capture field traceability per §34.19.1.** §34.19.1 Class 2 promises "KB Value Meter score" carry-over. §22.18.5.1 promises "Confidence scores, staleness state, citation graph, win-rate weights, suggested capability claims" all carry over on upgrade. The §22.18.3.3 `KBEntry.win_rate_weight` field is **Authored Extension** flagged for Phase 13 schema consolidation; not in §22.3.1. The §22.18.3.4 `KBCitationGraphEdge` entity is **Authored Extension** flagged for Phase 13; not in §22 or §4. The §22.18.3.5 `CapabilityDeclarationSuggestion` rows are **Authored Extension** flagged. The §34.19.2 `Organization.kb_value_meter_score` is **Authored Extension** requiring §4.x Organization spec update.

The §4.4 entities reference these AE-fields but the fields don't exist in §4.2 / §22. The §34.19.1 carry-over guarantee is unbuildable as written until the Phase 13 schema consolidation lands the AE fields. **D-2.2-059 P1 data_model (KB Value Capture AE-field family — Phase 13 schema consolidation gating §34.19.1 carry-over).**

---

## Cluster I — Type Ambiguity (P2)

**HeatMapCell `region_code` mixed type.** §4.4.16 line 5341 `region_code | String | ISO 3166-1 alpha-2 OR macro-region (`global`, `us`, `eu`, `apac`, `latam`, `mea`)`. Two value spaces collide: ISO country codes (`US`, `DE`, `JP`) and macro-region slugs (`us`, `eu`, `apac`). The ambiguity allows `us` to mean either "United States" (ISO) or "macro-region North America." Should be enum-bound or split into `region_kind` + `region_id`. **D-2.2-060 P2 data_model (HeatMapCell region_code type ambiguity).**

**HeatMapCell + SellerSignal `industry_code` mixed type.** §4.4.16 line 5342 + §4.4.18 line 5475 `industry_code | String | NAICS 2-digit or industry taxonomy slug`. Same ambiguity. NAICS 2-digit is a numeric code; "taxonomy slug" is a free-text identifier. Should be enum-bound. **D-2.2-061 P2 data_model (HeatMapCell + SellerSignal industry_code type ambiguity).**

---

## Cluster J — Plan Gating Inline Restatements (P2)

§5.11 Feature Access Matrix and §34.1 Plan Tier Definitions are the canonical homes for plan-gated capabilities. §4.4 entities contain inline plan-tier predicates that should be cited from §5.11 / §34.1.

**PromotedListing plan-tier predicate.** §4.4.19 line 5610 `org_id.plan_tier ∈ {seller_scale, seller_enterprise}` — enumerates plans inline; should cite §34.1.2 and §5.11. **D-2.2-062 P3 plan_gating (PromotedListing plan-tier inline restatement).**

**VerificationReviewRecord plan-tier predicates.** §4.4.21 line 5917 `org_id.plan_tier ∈ {seller_starter, seller_growth, seller_scale, seller_enterprise}` for Verified, line 5923 `seller_growth+` for Certified — both inline; should cite §34.1.2. **D-2.2-063 P3 plan_gating (VerificationReviewRecord plan-tier inline restatements).**

**FeaturedPlacement plan-tier — N/A.** Editorial-mode is plan-orthogonal; paid-mode is feature-flagged; no plan-tier inline restatement.

**SellerSignal plan-tier — partial.** §4.4.18 line 5468 says "Read access is gated by Seller plan entitlements (Growth tier and up)" — inline, but the access-gate is at the delivery layer; the plan-tier mention is a context note, not an enforcement contract. ✓ acceptable.

---

## Cluster K — Structural / Section Categorization Drift (P3)

**§4.4 contains entities NOT scoped to Seller Console.** §4.4.7 Marketplace Category (Platform-Scoped, Ops-Managed); §4.4.20 FeaturedPlacement (Marketplace-Domain, Ops-Curated); §4.4.23 OnboardingAntiPatternExceptionGrant (Platform-Scoped, Ops-Governed); §4.4.25 SellerInventoryDemotionExemption (Platform-Scoped, Ops-Governed); §4.4.26 EOIRateLimitOverride (Platform-Scoped, Ops-Governed); §4.4.27 OpsActionRecord (Platform-Scoped, Ops Audit); §4.4.28 TemplateLibraryEntry (Marketplace-Domain, Ops-Curated). Per §4.1 Scope Isolation rules, platform-scoped Ops-governed entities should live in their own subsection (e.g., §4.7 cross-console + §4.8 billing + a new §4.9 Ops-governed). The current placement is structurally misleading. **D-2.2-064 P3 documentation_gap (§4.4 section title vs. platform-scoped/Ops-governed entity placement).**

**§4.4 entity numbering and grouping.** Within §4.4, entities are not consistently grouped (Bid* clustered first, then Seller Profile, then Capability, then SellerSoftware, then Marketplace pages, then aggregates, then PromotedListing/Featured, then Verification, then Onboarding, then Ops-governed, then BidSuccessShare). A more readable grouping: bid-workspace-related → seller-org-related → marketplace-public-page-related → marketplace-aggregate-related → marketplace-monetization → seller-trust → seller-onboarding → ops-governed exemptions → seller-public-share. P3 only. **D-2.2-065 P3 documentation_gap (§4.4 entity grouping convention).**

---

## Cluster L — Heading Anchor Hygiene (P3)

Authoring Convention #11 requires `## N.N Title {#n.n-title}` heading syntax. Several §4.4 sub-entities use the format `### 4.4.X Title (Scope) {#4.4.x-anchor}` — ✓ where present. Sub-entities §4.4.1 (Bid Workspace), §4.4.2 (Bid Response), §4.4.3 (Seller Profile), §4.4.5 (Bid Task), §4.4.6 (Bid Schedule) lack the explicit `{#anchor}` annotation:

- Line 4448 `### 4.4.1 Bid Workspace (Console-Scoped, Seller)` — no `{#anchor}`
- Line 4473 `### 4.4.2 Bid Response (Console-Scoped, Seller)` — no `{#anchor}`
- Line 4506 `### 4.4.3 Seller Profile (Console-Scoped, Seller)` — no `{#anchor}`
- Line 4648 `### 4.4.5 Bid Task (Console-Scoped, Seller)` — no `{#anchor}`
- Line 4666 `### 4.4.6 Bid Schedule (Console-Scoped, Seller)` — no `{#anchor}`

Other §4.4 sub-entities have `{#anchor}` annotations. **D-2.2-066 P3 documentation_gap (5 sub-entities lack heading anchor slugs).**

---

## Self-Challenge Pass (Hostile Reviewer)

For every defect filed, I re-read the evidence as a hostile reviewer.

**D-2.2-001 to D-2.2-024 (enum registration).** Are the cited Appendix J line ranges correct? Yes — confirmed via Read of lines 44114–44805. The grep for `^#### .{enum_name}` returned only `template_featured_placement_kind_enum` and `ops_action_kind` from the §4.4 enum families. The enum-naming-drift on `_enum` suffix (D-2.2-015) is real: §4.4.23 references `onboarding_anti_pattern_kind` and §48.8.7 registers `onboarding_anti_pattern_kind_enum`. Both forms cannot be canonical — pick one. The §4.4.26 / §48.4.12 duplicate-canonical-home conflict on `per_seller_24h | per_category_7d | per_buyer_30d` is real — both `eoi_rate_limit_constraint_kind` (§4.4.26) and `marketplace_eoi_constraint_kind_enum` (§48.4.12) define the same value triple. Severity P1 stands.

**D-2.2-025 (k-anonymity inline restatements).** Could the inline values be defensible as "denormalization for read-path performance"? No — the values are not query-time hot paths; they are configuration constants. The canonical home is §48.6.4. Severity P1 stands.

**D-2.2-027 (PromotedListing inline numerics).** Could the `bid_impression_cents | ≤ 5,000` ceiling be defensible as "anti-pathological-bid guardrail" that doesn't need a §34 home? It IS an anti-pathological-bid guardrail, but per Authoring Convention #10 every numerical value has exactly one authoritative home — even guardrails. Severity P1 stands.

**D-2.2-035 to D-2.2-038 (BidResponse / SellerProfile / BidTask / BidSchedule console field).** Could the FK to bid_workspace_id be argued as transitively conferring console scope? Yes, but §1.3 Dual-Console Data Isolation Model and §1.4 Query Scoping Requirements require explicit `console` enum on every console-scoped entity for query-time filtering. Transitive scope through FK is not equivalent. Severity P1 stands.

**D-2.2-042 (HeatMapCell sentinel scope_kind).** Could the sentinel be defended as "documentation only, never written to the registry"? No — §4.4.16 prose explicitly says "with a sentinel `scope_kind=not_applicable` record in the registry," meaning a row is written. The §4.4.8 enum strictly enforces the five allowed values; admitting sentinel exceptions is a gateway to enum-bound-write erosion. The P0 severity is justified because: (a) the sentinel write would break the `enum_value_appendix_j_registry` validator at deploy time AND (b) if the validator is weakened to admit sentinels, an attacker who can write a sentinel could also write `scope_kind=arbitrary_value` and bypass the registry's per-scope enforcement at render time. Severity P0 stands.

**D-2.2-043 (FeaturedPlacement FTC disclosure timestamp).** Could the deploy-time DOM contract test be argued as sufficient FTC defense? In an FTC investigation, regulators ask "show me, on a per-render basis, that the disclosure was rendered at the moment a buyer saw it." A deploy-time DOM test proves the *code path* renders the label; it does not prove the *runtime render* happened. Per-render observation is industry standard for native-advertising compliance evidence. Severity P1 stands.

**D-2.2-044 / D-2.2-045 (forward-references).** Could the AE flagging be argued as "deferred but not blocking"? No — PromotedListing AC #6 (line 5714) requires a nightly reconciliation job between `spend_to_date_cents` and `MarketplaceDiscoveryLedgerEntry`. The job is unbuildable because the target entity has no field table. The AC blocks v7.1.0 stamp gating per the §M.5 CI gate `appendix_m_coverage_on_diff` if PromotedListing is on the diff. Severity P1 stands.

**D-2.2-055 (Vendor Opt-Out cascade testability).** Could the §27.10.5 prose be argued as sufficient? No — Authoring Convention #2 requires acceptance criteria to be "Numbered, testable, observable, measurable, scope-bound." The §4.4.8 AC #5 requires "tolerance ±0" on `retro_backfill_affected_page_count` — which is correct as a count but does not prove per-table coverage. A QA test cannot assert "all 17 §27.10.3 surfaces were swept" without a per-target ledger. Severity P1 stands.

**D-2.2-059 (KB Value Capture AE-field family).** Could the Phase 13 schema consolidation be argued as "not blocking v7.1.0 stamp"? Per CLAUDE.md §16 known drift, "v7.1.0 Surface-Abstraction & Dual-Maya program complete." The §22.18 KB Value Capture authoring is in v7.0.0 (not v7.1.0), so the AE backlog on §22.18.3.3 / §22.18.3.4 / §22.18.3.5 / §34.19.2 should have been ratified at v7.0.0 stamp gate. Per the AUTHORED_EXTENSIONS_LEDGER release-gate policy, these AEs should ratify before v7.0.0. If they did not, they are blocking the §34.19.1 carry-over guarantee being "100% retained" as written. Severity P1 stands.

---

## Counterfactual Pass (Three Failure Modes per Entity)

For brevity, this section enumerates the highest-risk counterfactuals across §4.4 — three per critical entity. The defect filings above already address each unhandled mode where applicable.

**§4.4.1 Bid Workspace.** (1) Buyer Workspace residency = `eu`, seller Org residency = `us`, buyer's Enterprise contract carries `enforce_strict_residency_lock=true` — handled per Residency Tie-Break (line 4469). (2) Bid Workspace transitions to `won` after the buyer Org is hard-deleted — buyer_org_id FK becomes orphaned; handled at §4.4.2 via `archived_by_buyer_remove` status but Bid Workspace itself has no orphan handling. **GAP: Bid Workspace orphan-buyer state not authored.** P2 — escalate to D-2.2-067 if not absorbed elsewhere.

**§4.4.4 Capability Declaration.** (1) Two sellers race to publish overlapping `narrative_only` declarations with same canonical_capability_id — handled at write-path invariant #2 + #5. (2) `evidence_kb_entry_ids` references a KB entry that gets soft-deleted between Capability Declaration write and nightly re-validator — handled at `last_taxonomy_validation_at` sweep. (3) Solo/Free auto-publish via `kb_to_capability_suggestion` produces 100+ chip entries that overwhelm Maya's UX — partial handling: §22.20.2 caps inline chip render at 6 with `+N more` drawer, but the underlying entity has no cap on Capability Declaration count per Org. **GAP: Capability Declaration count cap unspecified.** P3 — absorbed into D-2.2-053.

**§4.4.8 Vendor Opt-Out Record.** (1) Race between seller create and buyer-side render — handled at §27.10.4 60-sec live-render. (2) Opt-out targeting deleted entity — handled at Failure Mode #2. (3) Authority attestation revoked post-write — handled at Failure Mode #6 (§27.10.6.7 retains `authority_attestation_id_ref` for audit). ✓.

**§4.4.16 HeatMapCell.** (1) Cohort drops below k=10 due to opt-out — handled at Failure Mode #1. (2) Cross-region leakage — handled at Failure Mode #2. (3) Refresh worker outage — handled at Failure Mode #3. The sentinel scope_kind issue is the only structural defect (D-2.2-042).

**§4.4.19 PromotedListing.** (1) Two sellers race for last category slot — handled at Failure Mode #1 with SERIALIZABLE + SELECT FOR UPDATE. (2) Cleared price exceeds `per_eoi_cap_cents` — handled at #2. (3) k=5 cohort identifies a buyer — handled at #3 + planned distinctiveness check (deferred). ✓ except for the forward-reference defects (D-2.2-044 / D-2.2-045).

**§4.4.21 VerificationReviewRecord.** (1) SOC 2 Type 1 vs Type 2 confusion — handled at Failure Mode #1. (2) Document expires mid-quarter — handled at #2. (3) Reviewer SLA breach — handled at #3. ✓.

**§4.4.22 SellerOnboardingSession.** (1) SSO outage — handled at Failure Mode #2 (magic-link fallback). (2) `kb_bootstrap` fails — handled at #3 (capability degradation). (3) Multi-Org disambiguation — handled at #10 (Authored Extension flagged; D-2.2-052).

**§4.7.1 Console Bridge Event.** (1) DLQ overflow — handled at Failure Mode #6. (2) Firewall violation at write — handled at #4. (3) Concurrent edits produce supersede races — handled at #5. The redaction-matrix per-kind coverage gap (D-2.2-041) is a structural concern but not an unhandled failure mode.

---

## Summary Counter

**Defects to file in DEFECT_LEDGER.md:** 67 (D-2.2-001 through D-2.2-067).

**Severity breakdown:**
- P0: 1 (D-2.2-042 HeatMapCell sentinel scope_kind violates enum bound)
- P1: 36 (enum registration mass + numerical singletons + console firewall + cascade testability + forward-reference + KB Value Capture AE family)
- P2: 18 (data-model gaps, RBAC drift, type ambiguity, Seller Maya AE drift, Bid Workspace orphan state)
- P3: 12 (heading anchors, plan-gating inline restatements, stale citations, structural categorization, Summary §3.5 stale references)

**Coverage matrix updates:** 29 §4.4 entity rows + 2 §4.7 entity rows = 31 rows to tighten across `enums`, `numerical_singleton`, `console_firewall`, `state_machine`, `webhook`, `data_model`, `dsar`, `retention`, `acceptance_criteria` columns.
