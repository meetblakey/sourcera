# Sourcera Audit — Remediation Backlog

**Last updated:** 2026-05-06 — seeded by the Phase 6 audit-remediation pass with the catalog-completeness mechanical work deferred from in-pass remediation. Phase 15 (Production-Readiness Verdict) will further curate this file from the closed defect ledger.

This file is the curated, prioritized work list that owners execute against. Each entry references the source defect_id(s); ledger rows in `DEFECT_LEDGER.md` carry the canonical status field. When a backlog work item is closed (defect → `remediated`), update both this file and the ledger.

---

## P1 — v7.1.1 Stamp-Gate Catalog-Completeness Sweep (Bulk-Mechanical)

The following 17 defects are mechanical Appendix C / G / I / J / L / M registrations whose remediation is identical in shape: append rows to the appropriate appendix table with §32 / §31 / §M.5 metadata. They are deferred to a single dedicated reconciliation pass (modeled on `_integration/RECONCILIATION.md → §25.3 Formalization 2026-04-24`) rather than ad-hoc per-defect edits, because (a) per-defect edits would touch the same Appendix tables 17 times in 17 different sessions, (b) the Authored-Extension ledger needs a single AE row per appendix-table edit not per inbound defect, and (c) the v7.1.1 stamp gate is blocked on the union of all 17 anyway.

| # | Defect | Class | Subject |
|---|---|---|---|
| 1 | D-6.1-002 | enum | `console_bridge_event_kind` registration in Appendix J (18 values) |
| 2 | D-6.1-003 | enum | 4 Console Bridge Event enums in Appendix J (`event_direction`, `sync_status`, `failure_reason`, `conflict_resolution`) |
| 3 | D-6.1-004 | enum | 5 Vendor Disqualification enums in Appendix J (`severity`, `trigger`, `notification_style`, `appeal_status`, `reversal_reason`) |
| 4 | D-6.1-005 | webhook | `vendor.disqualified.org_level` registration in Appendix C + Appendix G |
| 5 | D-6.1-006 | webhook | `console_bridge.dlq_entered` registration in Appendix C |
| 6 | D-6.1-007 | webhook | `console_bridge.reconciliation_summary` registration in Appendix C |
| 7 | D-6.1-008 | webhook | `seller.bid_response.amendment_needs_reverification` registration in Appendix C; 7 Bid-Response-Materialization PostHog events in Appendix G |
| 8 | D-6.1-009 | error_code | 8 vendor disqualification reversal codes in Appendix I |
| 9 | D-6.1-010 | error_code | `vendor_disqualification_global_ban_requires_dual_signoff` in Appendix I |
| 10 | D-6.1-011 | error_code | 9 Console Bridge / Materialization error codes in Appendix I |
| 11 | D-6.1-012 | webhook | Resolve `console_bridge_standard` retry-curve binding (path (b) recommended: rename to `bridge_apply_standard` non-webhook curve in §25.2.2; route Bridge-domain webhooks to F.1 standard) |
| 12 | D-6.1-019 | enum | `disqualification_notification_failure_reason` in Appendix J |
| 13 | D-6.2-003 | notification | ~36 §27 webhook events in Appendix C (Match Score lifecycle, Evidence Bundles, Legal Process, Transparency Report, Buyer/Seller Signals, Vendor Opt-Out lifecycle, Promoted/Featured/Verification) |
| 14 | D-6.2-004 | posthog_event | Same ~36 webhook mirrors + ~14 observability-only events in Appendix G |
| 15 | D-6.2-005 | enum | 13 §27 enums in Appendix J + 51 §27 error codes in Appendix I (composite scope) |
| 16 | D-6.2-007 | state_machine | 10 §27 state machines in Appendix L (or explicit cross-references per APX-L preamble) |
| 17 | D-6.2-009 | surface_engine_mapping | 5 §27 surfaces in Appendix M (Hide Sponsored, Public Transparency Report, Pre-flight Scope Report, Featured Lane visual separation, Bid Window modal) |

**Owner.** Engineering (catalog plumbing) + Phase 14.5 AE-ratification queue.
**Effort estimate.** 2-3 days for a focused reconciliation pass authored by one engineer; 1-2 days for AE ledger ratification.
**Stamp gate.** v7.1.1 stamp is blocked on every entry's defect_id transitioning to `remediated`. CI gates `appendix_c_webhook_catalog_completeness`, `appendix_j_enum_completeness`, `appendix_c_to_appendix_g_coverage`, `webhook_default_retry_class`, `appendix_m_coverage_on_diff` cannot pass until this sweep closes.

---

## P1 — Seller Signals Cluster (Phase 6.2 P1 Carry-Over)

| # | Defect | Class | Subject | Owner |
|---|---|---|---|---|
| 18 | D-6.2-006 | data_model | Author 3 forward-referenced entities in §4.5.x: `MarketplaceMatchFeatureRegistry`, `MarketplaceMatchScoreModelVersion`, `MarketplaceMatchScoreSnapshot` at full §4.4-style fidelity (Field / Type / Constraints / Notes; scope isolation; indexes; retention; residency; DSAR cascade). Mark as Authored Extensions and append rows to `AUTHORED_EXTENSIONS_LEDGER.md`. | Engineering |
| 19 | D-6.2-015 | data_model | Author `MarketplaceProactiveOffer` entity in §4.5.x at full field-table fidelity (currently referenced inline in §27.9.8 but never authored). | Engineering |

**Owner.** Engineering.
**Effort estimate.** 1 day per entity (4 entities × 1 day = 4 days).
**Stamp gate.** v7.1.1 stamp gate inherits these as build-blockers; engineers cannot implement §27.4.11 / §27.9.8 without the schema.

---

## P2 — Phase 6.1 / 6.2 Build-Reasonable Ambiguity (Documentation Tightening)

| # | Defect | Class | Subject | Owner |
|---|---|---|---|---|
| 20 | D-6.1-015 | firewall_leakage | Replace `source_entity_version` on seller projection with opaque `bridge_source_handle_token = HMAC(source_entity_id ‖ source_entity_version ‖ bid_workspace_id, webhook_secret)` — same pattern as the AE-PH6R-001 pseudonym; absolute version monotonicity preserved via per-pair token comparison. | Security + Engineering |
| 21 | D-6.1-016 | api | Audit and resolve HTTP 403 vs HTTP 422 status semantic on `vendor_disqualification_global_ban_requires_dual_signoff`. | Engineering |
| 22 | D-6.1-017 | observability | Author §4.7.1.2 "AuditEvent Emission per Bridge Transition" — every bridge state transition emits `audit_event_action_type` value (`bridge_event_emitted`, `_synced`, `_retrying`, `_dlq_entered`, `_failed`, `_superseded`, `_redriven`); buyer + seller scopes; new CI gate `bridge_event_audit_emission_completeness`. | Engineering |
| 23 | D-6.1-020 | mobile_divergence | Author mobile-parity rows in §25.2.3 (Bridge Health / Sync Health panels) and §25.3.8 (reversal banner) per §38 Feature Parity Matrix. | Design + Engineering |
| 24 | D-6.2-012 | consistency_drift | Update §27.9.5 / §27.9.5.1 / §27.9.6 / §27.9.12 / §27.9.13 to use canonical `tuple_distinctiveness_threshold_exceeded` per the D-1.3-001 remediation; eliminate `distinctiveness_veto` aliasing. | Engineering |
| 25 | D-6.2-013 | enum | Add `recompute_deadline_exceeded` to Appendix J `seller_signal_suppressed_reason` (rolls under sweep #15 above). | Engineering |
| 26 | D-6.2-014 | enum | Author Appendix J `seller_signal_k_anon_state` (11 values); update §27.9.5 / §27.9.5.1 to use the enum instead of "computed boolean"; update §4.4.18 SellerSignal entity to add the enum-typed column. | Engineering |
| 27 | D-6.2-016 | numerical_singleton | §27.9.6.2 inline restatement of digest cadence — replace with a citation to `§34.1.2` cell **Seller Signals**; add deploy-time validator `seller_signal_cadence_single_source`. | Engineering |
| 28 | D-6.2-017 | enum | Confirm `webhook_delivery_audience_scope` enum value-set parity between §27.8.9 and §27.10.7 consumers; extend Appendix J as needed; add CI gate `webhook_delivery_audience_scope_consumer_coverage`. | Engineering |
| 29 | D-6.2-018 | mobile_divergence | Author §27.4.6 mobile-rendering subsection or §27.4.10 AC #6 mandating mobile parity for the qualitative label and a sheet-style provenance panel on Growth+ mobile. | Design |
| 30 | D-6.2-019 | notification | Add `marketplace_discovery.frequency_cap_bypass_suspected` to §27.11.7 webhook catalog (rolls under sweep #13 above). | Engineering |
| 31 | D-6.2-020 | data_model | Read §4.4.21 in full and verify `secondary_reviewer_user_id` field exists; if absent, add it as Authored Extension; add the corresponding error code `verification_two_reviewer_required` to Appendix I. | Engineering |
| 32 | D-6.2-021 | acceptance_criteria | Add §27.5 numbered acceptance-criteria block — one-click EOI acceptance audit-trail invariants. | Engineering |

**Owner.** Engineering (most), Design (mobile divergence), Security (firewall pseudonym).
**Effort estimate.** ~5 days total across the cluster.
**Stamp gate.** v7.1.1 — these are documentation tightenings whose absence makes implementations diverge between engineers, but each is individually decidable from context. Not formally blocking but strongly recommended before stamp.

---

## P3 — Cosmetic / Hygiene

| # | Defect | Class | Subject | Owner |
|---|---|---|---|---|
| 33 | D-6.1-021 | glossary | 5 Appendix K entries: "Bridge Health Panel", "Sync Health Panel", "Materialization Protocol", "Kill-Switch", "Fanout Group" | Engineering |
| 34 | D-6.1-022 | documentation_gap | Land §5.11 update for "Disqualification — All Tiers" core-workflow row (rolls under CLAUDE.md Phase 14.9.2 v7.1.1 backlog) | Engineering |
| 35 | D-6.1-023 | documentation_gap | Author §25.3.6 forbidden-phrase blocklist entity / Legal-review SLA / per-locale governance / audit trail | Legal + Engineering |
| 36 | D-6.2-008 | glossary | 13 Appendix K entries for §27 multi-section terms (Hide Sponsored, Verification Badge, VendorOptOutAuthorityAttestation, MarketplaceAbuseEvidenceBundle, Legal-Process Ingest, Transparency Report, Hot-Registry Index, FTC disclosure, Featured Lane, distinctiveness veto, Marketplace Match Score, Coordinated abuse, Cost-Center Firewall) | Engineering |
| 37 | D-6.2-022 | consistency_drift | Replace §34.1 line 28666 citation `§27.10 (Verification Tiers)` with `§27.11.3 / §26.2 / §4.4.21 (Verification Tiers)` | Engineering |
| 38 | D-6.2-023 | consistency_drift | Choose canonical name (recommend "Score-Drift & Fairness Dashboard") and propagate to APX-M | Engineering |
| 39 | D-6.2-024 | consistency_drift | Normalize §27.11.7 endpoint paths to `/api/v1/...` per §32 canonical | Engineering |
| 40 | D-6.2-025 | glossary_canonicality | Appendix K disambiguation note for `seller_marketing_editor` (Seller Console) vs `ops_marketing_editor` (Ops Console) | Engineering |

**Owner.** Engineering.
**Effort estimate.** ~1 day total — purely documentation.
**Stamp gate.** Not gating; clean up at convenience.

---

## Cross-Cutting v7.1.x Programs (Recommended)

### Webhook-Audience-Redaction Sweep (v7.1.1)

The composite of D-6.1-001 + D-6.2-002 + D-6.2-010 + D-6.2-011 + D-V6-001 + D-V6-004 (six findings) reveals a systemic webhook-payload over-exposure pattern. The Phase 6 remediation pass closed all six in-place but a cross-cutting sweep across §4.7.1, §25.7.10, §27.6.7, §27.8.9, §27.8.13, §27.9.9, §27.10.7, §31 is recommended to confirm no analogous defects exist in non-audited surfaces. Pattern to apply: every customer-audience webhook payload field must answer (a) is this field a buyer-internal collection cardinality; (b) is this field a Sourcera Ops user UUID; (c) is this field a buyer/seller-internal identity that should be opaqued via per-recipient HMAC pseudonym. Effort: 2 days. Owner: Security + Engineering.

### §M.5 Runtime Wiring for Phase 6 Remediation Gates (v7.1.1)

The Phase 6 remediation pass authored 6 new CI gates that need runtime-wiring in M02.3 / M11.3 / M21.3 / M24.3 implementation packs per `Build_Execution_Strategy.md` §11:

1. `console_bridge_seller_projection_no_cardinality_leak` — M02.3 (Console Bridge runtime).
2. `taxonomy_webhook_no_ops_user_identity_leak` — M21.3 (Marketplace).
3. `abuse_report_webhook_no_ops_user_identity_leak` — M21.3.
4. `legal_process_non_disclosure_reporter_audience_suppression` — M21.3.
5. `legal_process_non_disclosure_reporter_deferred_notification_temporal_decoupling` — M21.3.
6. `marketplace_abuse_sla_single_source` — M21.3 (deploy-time validator; cross-greps spec for inline numeric SLA values outside §42.3.1).

Effort: 1-2 days per gate × 6 gates = 6-12 days across the M02.3 / M11.3 / M21.3 / M24.3 packs. Owner: Engineering.

### §25.7 Internal Comments Full Sub-Section Audit (Phase 6.3)

Per `PHASE6_VERIFY.md` §1.4 caveat — §25.7 Internal Comments was sampled-only in Phase 6.1. Full §25.7.1–§25.7.14 sub-section walk should run as Phase 6.3 before Phase 7 advancement, OR the §25.7 surface must be explicitly accepted as out-of-scope for Phase 6 and inherited by a later phase. Effort: 1-2 days. Owner: Audit.

---

## Closed in Phase 6 Remediation Pass (2026-05-06)

The following 14 defects were remediated in-place during the 2026-05-06 pass and are recorded here for backlog completeness; ledger rows transition to `status=remediated` per the `DEFECT_LEDGER.md` Phase 6 Remediation Pass status-transitions block.

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

15 defects (2 P0, 6 P1, 6 P2, 1 P3) remediated in-place. Composite Authored-Extension ratification queue: AE-PH6R-001 through AE-PH6R-017 in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

**Halt-rule status (post-remediation):** zero P0 firewall_leakage; zero P0 vendor_opt_out leak. Phase 6 sign-off PASS-WITH-CAVEATS per `DEFECT_LEDGER.md` Phase 6 Remediation Pass block.

---

## P1 — Phase 11.5: Engine-Concept M.1 Backfill Pack (AE-V11-04 deferred authoring)

Authored as a backlog item during Phase V11 remediation pass (2026-05-11). Body authoring is deferred to a dedicated Phase 11.5 session because the volume of M.1 row authoring (~135 rows: ~55 master-spec engine-concept + ~50 companion-doc + ~30 Appendix-internal block-rows) would dilute the V11 catalog-completeness focus and warrants its own authoring cadence with full per-anchor surface-metaphor / tier-visibility / notes-cell fidelity.

**Source enumeration.** `_audit/SURFACE_ENGINE_TRACE.md` § 5.2 lists every missing engine-concept M.1 row by anchor family.

| Anchor family | Row count | Notes |
| :---- | :---- | :---- |
| §3 Interaction Patterns | 22 | Most are sub-pattern engine concepts (Sidebar nav, Side Peek, Bulk Action Toolbar, Workspace Header Avatar Stack, etc.) — surface-metaphor cells will mostly cite the parent §3 row's surface |
| §50 Sourcera Ops Console | 15 engine-concept + 19 surface rows (D-11.1-001 cluster) | Customer-facing OpsSession projection + 13 Ops-internal entities + 6 admin-surface entities; Tier-visibility cells mostly `Internal-only, never surfaced` for Ops staff |
| §51 Product Usage Analytics | 6 surface rows (D-11.1-002 cluster) + 4 engine concepts | Org-Level + User-Level Usage Dashboards (customer-visible) plus 4 seller dashboard panels; Tier-visibility cells per the §51 dashboard plan-gating |
| §25.2.3 Cross-Console Bridge / Sync Health | 3 surface rows (D-11.1-003 cluster) | Buyer-side Bridge Health, seller-side Sync Health, Ops Cross-Workspace Bridge Dashboard |
| §8.3 Triage Queue | 2 surface rows (D-11.1-004 cluster) | Buyer-side + seller-side triage queues |
| §11 Buyer Console nav shell | 4 surface rows (D-11.1-005 cluster — partial M.1 overlap exists) | Buyer Console Navigation Shell, Buyer Sidebar Navigation, Buyer Content Layout Regions, Buyer Persistent UI Elements |
| §13.11 Defense View + §13.12 EvalStarter | 3 engine concepts + 3 surface rows | Defense-View internal projection rows; EvalStarter capability-registry rows |
| §34 Plan-Tier engine concepts | 8 engine concepts | Plan-tier engine constructs not yet enumerated at row level |
| §26 Public Seller Pages | 7 engine concepts | SellerOrgPage + SellerSoftware + SoftwarePage public surface rows |
| §2 Sourcera Method | 6 engine concepts | Method-internal engine constructs |
| Appendix L / Appendix M self-references | 6 rows | Appendix-internal block-row aggregations |
| §1 / §6 / §7 / §8 / §14 / §15 / §20 / §22 / §29 / §38 / §40 / §47 misc | ~36 rows | Scattered engine concepts per `SURFACE_ENGINE_TRACE.md` § 5.2 |
| **Companion-doc engine concepts (AE-V11-04b sub-row)** | ~50 rows | UX_Design_of_Sourcera.md (~25) + retired KB_Engineering_Spec content (~15 — now in §22 but with companion-doc anchor heritage) + Buyer/Seller Pricing companion-doc (~10) per the `Companion: <doc>.md §<anchor>` syntax authored in §M.1.2 |

**Authoring approach.** One block per area-group banner. For each engine concept: explicit `Internal-only, never surfaced` Tier-visibility cell or surface-metaphor cell + plan-tier list. For companion-doc concepts: `Companion: <doc>.md §<anchor>` syntax per §M.1.2.

**Block path.** Phase 11.5 — dedicated Cowork session. Pre-edit backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-phase11_5-backfill-YYYY-MM-DD.md`. Companion AE row AE-V11-04 transitions `pending → approved` on closure.

**Release-gate dependency.** v7.1.1 stamp gate (`v7_1_1_stamp_gate_runtime_status_audit` per §M.5 Phase V11 cluster) is blocked on AE-V11-04 closure. The `appendix_m_engine_to_surface_completeness` gate (§M.5 Phase 14.2 cluster) is also blocked from `spec_binding_pending_pack_m02_3 → runtime_active` transition until backfill closes (otherwise the gate would flag 135 violations on the first run).

| # | Defect | Class | Subject |
|---|---|---|---|
| 1 | D-11.4-001 | surface_engine_mapping | Engine-Concept M.1 Backfill Pack — ~135 missing rows authored in one Cowork session per anchor family above; AE-V11-04 sub-row records each cluster's authoring cadence |
| 2 | D-11.1-001 | surface_engine_mapping | §50 Sourcera Ops Console cluster — 19 surface rows + 15 engine-concept rows (bundled into the §50 area-group banner block of AE-V11-04) |
| 3 | D-11.1-002 | surface_engine_mapping | §51 Product Usage Analytics cluster — 6 surface rows + 4 engine concepts |
| 4 | D-11.1-003 | surface_engine_mapping | §25.2.3 Bridge / Sync Health cluster — 3 surface rows |
| 5 | D-11.1-004 | surface_engine_mapping | §8.3 Triage Queue cluster — 2 surface rows |
| 6 | D-11.1-005 | surface_engine_mapping | §11 Buyer Console nav shell — 4 surface rows |
| 7 | D-11.1-006 | surface_engine_mapping | §3 / §20 / §22 cross-surface cluster — ~22 rows |
| 8 | D-11.1-007 | surface_engine_mapping | UX Design component-level cluster — ~25 rows via `Companion:` syntax per §M.1.2 |
| 9 | D-11.4-003 | surface_engine_mapping | Companion-doc anchor pack (AE-V11-04b) — ~50 companion-doc engine concepts via `Companion: <doc>.md §<anchor>` syntax |

---

## P2 — v7.1.1 Mechanical Hygiene Pass — Phase V11 Backlog (mechanical)

Composite mechanical-edit pass collecting V11 P2 / P3 items whose remediation is mechanical and identical-in-shape. Bundled to avoid 11+ separate Cowork sessions for cosmetic-pass work.

| # | Defect | Class | Subject |
|---|---|---|---|
| 1 | D-11.1-008 | surface_engine_mapping | UX Design component-level row prefix per the inventory's UX-Design audit-phase convention |
| 2 | D-11.4-002 | authored_extension | F-AE-016 → F-BC-001 inventory hygiene re-prefix (Breaking Change, not Authored Extension) |
| 3 | §M.5 schema backfill | ci_gate | Apply §M.5.3 schema mechanically to the 86 pre-V11 rows that did not receive in-place V11 amendments (V11 amended 17 rows + authored 19 net-new + left 86 at original 6-column schema with column-default-inference) |
| 4 | M.1 tier-visibility cell normalization | surface_engine_mapping | Mechanically rewrite all M.1 rows that use the pre-V11 negative `Hidden from tier(s)` semantic to the positive `Tier visibility` semantic per §M.1.1 |

**Owner.** Engineering.
**Effort estimate.** ~1 day for the mechanical sweep.
**Stamp gate.** Routes to v7.1.1 mechanical hygiene pass alongside Phase 1.1 / V1.3 / Phase 8.1 / Phase 11.2 / Phase 11.3 / Phase 11.4 residuals.
