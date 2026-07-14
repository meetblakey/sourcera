# PHASE 51 FINDINGS — §51 Product Usage Analytics & PLG Instrumentation Walk

**Audit prompt.** Walk §51 (`Sourcera_Master_Spec.md` v7.1.0 lines 42428–43163) end-to-end against the seven prompt-specified checks plus the 14-point Audit Checklist. File defects per `Audit_Prompts.md → Defect Ledger Format`; promote into `_audit/DEFECT_LEDGER.md` at end of prompt.

**Source pass.** Read §51.1–§51.8 end-to-end (lines 42428–43163); cross-checked Appendix G §51 Product Usage Analytics Event Additions (lines 44810–44846), Appendix G KB Value Capture & Stake-Building Events (lines 44063–44089), Appendix G PLG / Growth-Loop / Anti-Spam Events (lines 44090+), Appendix G Seller-Onboarding Events (the `seller_onboarding_*`, `seller_hero_moment_displayed`, `seller_onboarding_conversion_moment_fired`, `stake_reveal_rendered` registrations at lines 44586–44687), Appendix I error-code rows for `usage_*` (lines 45688–45696), Appendix J §51 enum block (lines 48315–48361), §40.2 retention rows for `UsageDashboardSnapshot` / `usage_event_outbox` / `usage_event_envelope_dlq` (lines 32193–32196), §44.1 Performance Targets (lines 33271–33293), §44.6 Solo-Tier Surface Treatment (line 33339+), §34.1.1 / §34.1.2 plan-tier registries, §35.2.10 Activation Metric, §48.1.6 Seller Activation Metric & Leading Indicators (lines 34053–34132), §48.1.7 Conversion Moments, §48.5–§48.7 growth mechanics M1–M17, §22.18 KB Value Capture, §49.1 seven-stage onboarding + Hero Moment surfaces, §27 Marketplace + EOI.

---

## Per-Check Walk

Legend: ✅ explicit; ⚠ partial / drifted / cited-but-not-canonical; ❌ silent.

| # | Check | Result | Anchor | Notes |
|---|---|---|---|---|
| 1 | Activation metric defined per console | ❌ buyer / ⚠ seller | §51 absent; §35.2.10 + §48.1.6 (seller only) | No Buyer Activation Metric exists anywhere in §51 or in the spec at parity with the Seller Activation Metric. §51 does not cross-reference §48.1.6 / §35.2.10 / C.135 for the Seller side — the Activation Metric is invisible from §51's instrumentation surface. |
| 2 | User-retention cohorts defined | ❌ | §51 absent; §50.14.3 (Ops-side only) | §51 is silent on user-retention cohort definitions (D1/D7/D30 curves). §50.14.3 Growth PM Dashboard line 41158 names a "Retention D1/D7/D30" Ops widget with a `D7 retention < 30%` breach alert but never defines what "retention" means at the user / org / workspace level — and §51 (the customer-facing analytics surface) does not surface a retention cohort at all. §51.7 "Retention & DSAR" is **data retention** (TTLs), not **user retention** (cohort curves). |
| 3 | Conversion funnel defined per growth path | ❌ | §51 absent; §48.1.1–§48.1.6 (PLG funnel partial; not per growth path) | §51.1.5 names a `funnel_stage_*` event-prefix wildcard in the cross-reference table but no §51 subsection defines (a) a buyer conversion funnel, (b) a seller conversion funnel, (c) a Forced-Vendor-Signup funnel, (d) a Buyer-Funded Pro Trial Seat funnel, (e) a Hero Moment funnel, (f) a Conversion-Moment funnel. The dashboards (§51.3 / §51.4 / §51.5) all render spend, capability, phase, and acceptance-rate panels but no funnel panel. The per-growth-path funnel definitions live, if anywhere, in §48 (Seller Activation Dashboard, Forced-Signup Funnel Dashboard, Conversion-Moment funnel tile) and §50.14.3 (Signup → Activation funnel, Free → Paid conversion funnel) — but these are Ops-internal dashboards, NOT the customer-visible §51 surface. §51 is silent on every growth-path conversion funnel. |
| 4 | PLG-loop instrumentation matches mechanics in §48 | ⚠ | §51.1.5 (lines 42504–42505) | The §51.1.5 row "M9–M17 Growth Mechanics" inherits the same stale prefix mapping called out in D-48-006 (M9 = "template" not CategoryPage; M11 = "seller_profile" not ComparisonPage; M14 = "ghost_bid" not BidSuccessShare; M10 / M12 / M13 missing). §51's instrumentation cross-reference is therefore behind §48's actual mechanic naming. |
| 5 | Hero Moment events tied to §22 + §49 | ⚠ | §51.1.5 (line 42506) | The §51.1.5 row "Seller-Onboarding Events" lists `seller_hero_moment_*` (with `seller_` prefix). This wildcard matches `seller_hero_moment_displayed` (§49.1 line 39045) but does NOT match the 6 canonical Hero Moment events without the `seller_` prefix: `hero_moment_completed`, `hero_moment_latency_breached`, `hero_moment_first_edit`, `hero_moment_phase_skipped`, `hero_moment_wallet_cap_breached`, `hero_moment_wallet_cap_reached` (registered at lines 38700–38705, 38984–38985, 44586, 44605). Net: 6 of 7 Hero Moment events fall outside §51's cross-reference. |
| 6 | Forced-Vendor-Signup playbook events tied to §27 | ❌ | §51 absent | §51 does not mention "Forced-Vendor-Signup" anywhere. The §51.1.5 cross-reference table has no row dedicated to the playbook; the `marketplace_core` row mentions "Cross-console EOI, listing, vendor-discovery, marketplace-signals events" but with a `marketplace_*` placeholder wildcard. §27 EOI events (`eoi_acknowledged`, `eoi_received`, `eoi_accepted`, `eoi_declined`) — which are the upstream entry points of the playbook — are not enumerated. The §48.1.6 Forced-Signup Funnel Dashboard (Ops-internal) is not cross-referenced from §51. |
| 7 | Every event referenced in §51 exists in Appendix G | ⚠ | §51.5.3 / §51.5.6 AC-9 | 13 of 13 §51-NEW events (`usage_dashboard_viewed`, `usage_dashboard_panel_interacted`, `time_saved_panel_viewed`, `time_saved_footnote_clicked`, `user_usage_dashboard_viewed`, `seller_usage_dashboard_viewed`, `usage_analytics_envelope_violation`, `usage_analytics_outbox_lag_budget_exceeded`, `usage_analytics_dsar_redaction_applied`, `usage_analytics_k_anon_floor_hit`, `usage_analytics_conversion_factor_binding_mismatch`, `usage_analytics_event_family_registered`, `usage_analytics_alias_retirement_overdue`) are registered in Appendix G §51 Additions (lines 44818–44832). EXCEPT `kb_citation_in_closed_bid_attributed` — referenced in §51.5.3 + §51.5.6 AC-9 with a parenthetical claim "(registered under `kb_core` event family at §22.18 KB Value Capture; catalogued in Appendix G → KB Value Capture Events subsection)" — does NOT appear in Appendix G (verified via grep: only 2 hits across the entire Master Spec, both in §51). The event is named but unregistered. P1. |

---

## Cross-Cutting Findings (promoted to ledger)

### F-1 — Buyer Activation Metric absent (P1, all of §51)

The audit prompt's check #1 ("Activation metric defined per console") fails on the buyer side. §51 is the unified buyer + seller analytics surface (per §51 preamble line 42430 "the unified buyer + seller product-analytics surface that powers PLG conversion, expansion scoring, customer-facing ROI narratives"). §51 does not define a Buyer Activation Metric, does not surface one as a panel, does not bind one to an event, and does not cross-reference §35.4 (which carries the prose "Buyer onboarding complete in < 10 minutes" — a duration target, not a metric definition). The Seller Activation Metric is defined at §35.2.10 + §48.1.6 + §4.4.22 (C.135) but §51 does not cross-reference any of those. A buyer-side activation-rate dashboard is unbuildable as written.

Filed as D-51-001.

### F-2 — User-retention cohort definitions absent (P1, §51-wide)

The audit prompt's check #2 ("Retention cohorts defined") fails. §51 has no user-retention cohort definition (D1/D7/D30 retention curves, the canonical PostHog-retention-model output). §51.7 "Retention & DSAR" is data-class retention (24-month rolling UsageEvent, 36-month rolling TimeSavedCredit, 90-day daily snapshot, 24-month rollup snapshot, etc.), not user-retention. The §50.14.3 Growth PM Dashboard names a D1/D7/D30 Ops widget but never defines what "retention" means (logged-in event? AIOperation-issuing event? phase-advancing event?). §51's customer-facing dashboards have no retention-cohort panel at all. A customer asking "what's my Org's 30-day retention rate" cannot get an answer from §51.

Filed as D-51-002.

### F-3 — Conversion-funnel definitions absent per growth path (P1, §51-wide)

The audit prompt's check #3 ("Conversion funnel defined per growth path") fails. §51.1.5 references a `funnel_stage_*` event-prefix wildcard but no §51 subsection defines:

- A **buyer conversion funnel** (anonymous → SSO → workspace_created → phase_advanced through 13 phases → procurement_completed).
- A **seller conversion funnel** (anonymous → magic-link → SSO → bootstrap → first-bid → win).
- A **Forced-Vendor-Signup funnel** (buyer-invite → magic-link-click → SSO → first-edit → first-bid-submitted).
- A **Hero Moment funnel** (Bid-Workspace load → KB-Draft render → First-Pass render → Progress strip → first edit).
- A **Conversion-Moment funnel** (CM1 / CM2 / CM3 trigger → prompt-rendered → click → upgrade complete).
- A **Buyer-Funded Pro Trial Seat funnel** (issuance → activation → conversion to paid).

§48 names these dashboards (Seller Activation, Forced-Signup Funnel, Conversion-Moment) at §48.1.6 line 34090 / §48.1.7 — but they are Ops-internal and §51 (the customer-facing analytics surface) does not surface any of them, nor cite their existence, nor define their stage taxonomy. §50.14.3 Growth PM Dashboard names "Signup → Activation funnel" and "PLG-loop attribution" widgets but again Ops-side. §51 is silent on every customer-facing growth-path funnel.

Filed as D-51-003.

### F-4 — §51.3.6 internal plan-tier-row contradiction (P1, plan_gating)

§51.3.6 Plan Gating table lists "Starter (buyer)" twice with conflicting content:

- Row 2: "Starter (buyer) | Panels 1–4; last 90 days; CSV export"
- Row 3: "Buyer Starter / Growth / Scale | All panels; last 24 months; CSV + XLSX + JSON export"

A junior engineer reading the table cannot know which row applies to a Starter Org. The contradiction violates the §34 single-source rule and creates an immediate plan-gating defect (any test asserting Starter-tier behavior matches one row will fail the other).

Filed as D-51-004.

### F-5 — Solo tier (buyer + seller) absent from §51 plan-gating tables (P1, plan_gating)

CLAUDE.md §16 declares: "Solo plan tier and Defense View are authoritative in Master Spec. Solo (`buyer_solo` / `seller_solo`) is in §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6, Appendix J Plan Tiers, and Appendix M." §44.6 Solo-Tier Surface Treatment is the authoritative surface-treatment home.

§51.3.6 Plan Gating table omits both `buyer_solo` AND `seller_solo` rows. §51.4.5 plan-window mapping ("Free 30 days; Starter 90 days; Growth / Scale 12 months; Enterprise 24 months") omits Solo. §51.5.6 AC-10 ("Seller Free plan MUST see Panels 1, 2, Per-Bid Spend (basic), KB Utilization (basic) last 30 days") names Free but not Solo. A Solo customer has no defined Usage Dashboard access, no defined export ceiling, no defined retention window, no defined panel set. Per §44.6 Solo-Tier Surface Treatment, every customer-facing surface must explicitly carry a Solo treatment.

Filed as D-51-005.

### F-6 — §51.3.6 vs §51.4.5 numerical drift on plan-tier window depth (P1, plan_gating)

§51.3.6 "Buyer Starter / Growth / Scale" row says 24 months. §51.4.5 prose says "Growth / Scale 12 months." Same plan tier, same product family (Org-Level vs User-Level Usage Dashboard), conflicting numerical singleton. The same row also conflicts on Starter (§51.3.6 row 2 says 90 days, row 3 says 24 months; §51.4.5 says 90 days). Per Convention #10, every numerical value has one home (§34); inline duplication produced two contradictory values within the same section.

Filed as D-51-006.

### F-7 — "Seller Pro" tier-naming drift in §51.3.6 (P1, plan_gating)

§51.3.6 Plan Gating table includes a "Seller Pro" row ("Panels 1–4; last 90 days; CSV export"). Per CLAUDE.md §2 ("Seller plans (Free / Solo / $149 / $499 / $1,499 / custom)") and §34.1.2, the canonical seller plan tiers are Free / Solo / Starter / Growth / Scale / Enterprise. There is no "Seller Pro" tier. The label is either a stale draft term, a typo for Starter, or a pre-Solo naming that survived integration. Engineering would build the wrong entitlement set against this row.

Filed as D-51-007.

### F-8 — §51 API endpoint paths drift vs Appendix J §32.5 rate-limit-class extension (P1, api)

§51 body and Appendix J §32.5 extension (lines 48363–48368) declare different endpoint paths for the same operations:

| Endpoint Purpose | §51 body path | Appendix J §32.5 path |
|---|---|---|
| Org-Level snapshot read | `/v1/orgs/{org_id}/analytics/usage/snapshot` (§51.3.5) | `/v1/orgs/{org_id}/usage/dashboard` (Appendix J line 48367) |
| Org-Level export | `/v1/orgs/{org_id}/analytics/usage/export` (§51.3.5) | `/v1/orgs/{org_id}/usage/dashboard/export` (Appendix J line 48368) |
| User-Level summary | `/v1/users/{user_id}/analytics/usage/summary` (§51.4.4) | `/v1/orgs/{org_id}/users/{user_id}/usage/dashboard` (Appendix J line 48367) |
| Seller parity snapshot | `/v1/seller-orgs/{seller_org_id}/analytics/usage/snapshot` (§51.5.5) | `/v1/orgs/{org_id}/seller/usage/dashboard` (Appendix J line 48367) |

A junior backend engineer cannot determine which path to wire. Both the rate-limit class registry and the §32-conformant endpoint contract require one canonical path per operation.

Filed as D-51-008.

### F-9 — `usage_envelope_violation_kind` enum drift between §51.2.5 and Appendix J (P1, enum)

§51.2.5 Property Validator Contract (line 42618 table) enumerates 7 rejection causes paired 1:1 with HTTP 422 / 500 error codes: required-property-missing → `usage_event_envelope_violation`; unknown-property → `usage_event_envelope_unknown_property`; type-mismatch → `usage_event_envelope_type_mismatch`; enum-violation → `usage_event_envelope_enum_violation`; capability-unresolved → `usage_event_capability_unresolved`; residency-mismatch → `usage_event_residency_mismatch`; DSAR-failure → `usage_event_dsar_redaction_failure`.

Appendix J `usage_envelope_violation_kind` enum (line 48317) carries 11 values: `missing_required`, `enum_violation`, `type_mismatch`, `tenancy_mismatch`, `residency_mismatch`, `cardinality_exceeded`, `cross_console_leak`, `schema_version_unsupported`, `residency_partition_denial`, `capability_unresolved`, `dsar_redaction_failure`.

Four enum values are NOT covered by the §51.2.5 prose validator-contract table: `tenancy_mismatch`, `cardinality_exceeded`, `cross_console_leak`, `schema_version_unsupported`. The §51.2.5 table is a closed list of validator behaviors; the enum is a closed set of allowable values. The two contradict. Worse: `cross_console_leak` (registered) implies the validator has a buyer/seller firewall enforcement path that §51.2.5 prose never authorizes — yet the firewall is central to §51's contract per §51.5.6 AC-4. CI gate `usage_envelope_violation_kind_appendix_i_pairing` (line 48319) asserts the 1:1 pairing, but the §51.2.5 prose is missing 4 of the 11 paired causes.

Filed as D-51-009.

### F-10 — §40.2 missing retention rows for `weekly_rollup` and `quarterly_rollup` snapshot kinds (P1, retention)

§51.3.2 UsageDashboardSnapshot data model registers `snapshot_kind` enum with 4 values: `daily`, `weekly_rollup`, `monthly_rollup`, `quarterly_rollup` (line 42672). §51.7.1 retention table declares "UsageDashboardSnapshot (weekly/monthly/quarterly rollups) | 24 months rolling". §40.2 (lines 32193–32194) carries retention rows only for daily and monthly rollups — `weekly_rollup` and `quarterly_rollup` rows are absent. §51.7.5 Authored Extension claims to add the rows but the §40.2 inline integration is missing 2 of the 4 declared snapshot kinds. A `weekly_rollup` row written tomorrow has no §40.2 retention contract, no DSAR semantics, no residency partition policy.

Filed as D-51-010.

### F-11 — §51.1.5 Hero Moment wildcard misses 6 of 7 canonical events (P1, instrumentation_gap)

§51.1.5 cross-reference table row "Seller-Onboarding Events" (line 42506) lists `seller_hero_moment_*` as the Hero Moment wildcard. The `seller_hero_moment_*` prefix matches ONLY `seller_hero_moment_displayed` (registered at §49.1 line 39045 + Appendix G). The 6 canonical Hero Moment events without the `seller_` prefix — `hero_moment_completed`, `hero_moment_latency_breached`, `hero_moment_first_edit`, `hero_moment_phase_skipped`, `hero_moment_wallet_cap_breached`, `hero_moment_wallet_cap_reached` — are registered at §48.8.3 / §49.1 / Appendix G lines 38700–38705, 44586 (post-rename), 44605 etc. but are NOT covered by the §51.1.5 wildcard. They fall into no §51.1.5 row.

The audit prompt's check #5 ("Hero Moment events tied to §22 + §49") thus partially fails: 1 of 7 events covered. The §51 instrumentation surface cannot consume `hero_moment_latency_breached` to render a latency-breach panel because §51.1.5 doesn't claim ownership of the event.

Filed as D-51-011.

### F-12 — Forced-Vendor-Signup playbook cross-reference absent from §51 (P1, instrumentation_gap)

The audit prompt's check #6 ("Forced-Vendor-Signup playbook events tied to §27") fails entirely. §51 does not mention "Forced-Vendor-Signup" anywhere. The §51.1.5 cross-reference table has no row dedicated to the playbook. The `marketplace_core` family row (line 42448) names "Cross-console EOI, listing, vendor-discovery, marketplace-signals events" but with a `marketplace_*` placeholder wildcard — §27 EOI events (`eoi_acknowledged`, `eoi_received`, `eoi_accepted`, `eoi_declined` per §27.5 / §31.9.8.2) are not enumerated. The §48.1.6 line 34090 Forced-Signup Funnel Dashboard is Ops-internal and not surfaced as a customer-facing §51 panel. Engineering and Analytics cannot derive Forced-Vendor-Signup conversion analytics from §51 alone.

Filed as D-51-012.

### F-13 — `kb_citation_in_closed_bid_attributed` referenced in §51.5 but not registered in Appendix G (P1, posthog_event)

§51.5.3 KB Utilization Panel (line 42899) names `kb_citation_in_closed_bid_attributed` with the parenthetical "(registered under `kb_core` event family at §22.18 KB Value Capture; catalogued in Appendix G → KB Value Capture Events subsection, NOT in Appendix G → §51 Product Usage Analytics Event Additions — cross-family consumption per §51.1.5 cross-reference table)." §51.5.6 AC-9 demands a join test: "KB ROI panel joins `kb_citation_in_closed_bid_attributed` to bid outcome; integration test with 10 synthesized bids."

Verified: the event appears in §51 twice (lines 42899, 42929) AND nowhere else in `Sourcera_Master_Spec.md`. Appendix G's KB Value Capture & Stake-Building Events subsection (lines 44063–44089) registers `kb_value_meter_viewed`, `kb_value_meter_click_through`, `kb_export_initiated`, `kb_export_completed`, `kb_export_failed`, `kb_export_download_url_minted`, `kb_export_archive_downloaded`, `stake_reveal_rendered_kb_value_capture` — but NOT `kb_citation_in_closed_bid_attributed`. The cross-reference is false. AC-9 is unbuildable as written (the integration test joins a non-existent event).

Filed as D-51-013.

### F-14 — `viewer_role` enum (Appendix G §51 additions) vs §51.3.1 access table drift (P2, enum)

Appendix G §51 additions line 44820 registers `viewer_role ∈ {org_owner, billing_admin, workspace_owner, reviewer, seller_admin, public_api_consumer}` (registered as `usage_dashboard_viewer_role_kind`). §51.3.1 Surface & Access (lines 42650–42657) declares that `workspace_owner`, `use_case_lead`, `reviewer`, `member` get HTTP 403 `usage_analytics_dashboard_access_denied` and that "Seller-console roles | No access". Yet the Appendix G enum registers `workspace_owner`, `reviewer`, and `seller_admin` as valid `viewer_role` values that the `usage_dashboard_viewed` event would emit. Either the enum is over-broad (and includes denied roles) or §51.3.1 over-denies (and the enum is correct). The two cannot both be authoritative.

Filed as D-51-014.

### F-15 — Performance budgets duplicated inline in §51 instead of §44.1 (P2, performance_budget)

§51 inline performance budgets: §51.3.7 AC-1 (1.5s dashboard first-load p95; 3.0s live-augmentation p95); §51.4.6 AC-1 (1.5s self-view first-paint p95); §51.5.6 AC-11 (300ms regression-compute headroom; first-load parity at 1.5s / 3.0s). §44.1 Performance Targets table (lines 33271–33293) is the canonical home for performance budgets per Convention #10. §44.1 carries no row for usage_dashboard p95, time_saved_panel p95, win_rate_correlation regression compute. The §51 budgets are duplicated inline without a §44.1 row to cite. Drift risk: if §44.1 is updated, §51 silently stales.

Filed as D-51-015.

### F-16 — Export size ceilings duplicated inline in §51 instead of §39 (P2, numerical_singleton)

§51.3.7 AC-6 (50 MB / org export ceiling), §51.4.6 AC-8 (20 MB / user export ceiling), §51.5.6 AC-8 (50 MB / seller export ceiling) — three numerical singletons registered inline. §39 Object Size Constraints is the canonical home for file-size limits. §39 does not carry rows for these ceilings; §51 names them directly. Convention #10 violation.

Filed as D-51-016.

### F-17 — Outbox lag p95 / DLQ depth thresholds inline without canonical home cited (P2, numerical_singleton)

§51.1.6 AC-5 ("Dual-write lag p95 MUST be ≤ 60 seconds under normal conditions; lag > 60 s for > 5 minutes pages the §51.1 on-call rotation"). §51.1.6 AC-6 ("Outbox DLQ depth MUST be ≤ 200 rows in any 15-minute window"). These are operational thresholds (durations + counts) with no canonical home cited. §42.1 (incident severity / runbook inventory) or §44.1 (performance targets) is the natural home. §51 names them directly without citation.

Filed as D-51-017.

### F-18 — `usage_event_residency_mismatch` raised but not registered as PostHog event (P2, posthog_event)

§51.2.5 line 42624: "`data_residency_region` mismatch vs. org's canonical region | HTTP 422 `usage_event_residency_mismatch`; Ops observability alarm". §51.2.6 AC-7: "residency mismatch raises `usage_event_residency_mismatch` and pages Ops observability". The naming suggests both an HTTP error code AND a paging alarm. Appendix I registers it as an HTTP error code (line 45693). Appendix G does NOT register a corresponding PostHog meta-event. If the alarm is supposed to fire (per AC-7 "pages Ops observability"), the paging path needs a PostHog event or an alternate alerting surface. As written, the AC is unbuildable — the validator rejects with HTTP 422 but the alerting infrastructure has no event to subscribe to.

Filed as D-51-018.

### F-19 — `usage_analytics_per_user_disclosure_viewed` AuditEvent action pending AE not yet registered (P2, audit_event)

§51.3.7 AC-8, §51.4.2, §51.4.6 AC-2, §51.8.1 AC-16 all reference `usage_analytics_per_user_disclosure_viewed` as an AuditEvent action emitted to §4.6.1. §51.8.4 Authored Extension #10 declares: "New per-user `usage_analytics_per_user_disclosure_viewed` AuditEvent action (§51.3.3 + §51.4.2). Extends §4.6.1 Audit Event action registry. Security + Legal sign-off." The AC is therefore conditioned on a pending AE ratification per the v7.1.0 / v7.1.1 release-gate policy. No row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` registers this AE. Multiple §51 ACs are conditioned on an unratified extension.

Filed as D-51-019.

### F-20 — §51.1.5 inherits D-48-006 stale M9–M17 prefix mapping (P2, consistency_drift)

§51.1.5 line 42505 row "M9–M17 Growth Mechanics" inherits the same stale prefix mapping called out in `D-48-006` (M9 = "template" not CategoryPage; M11 = "seller_profile" not ComparisonPage; M14 = "ghost_bid" not BidSuccessShare; M10 / M12 / M13 missing). Per Phase 48 walk F-6 already filed against §51.1.5. Linking the §51-side manifestation explicitly so the §51 audit completion is accurate.

Filed as D-51-020 (forwarded to D-48-006).

### F-21 — §51 silent on Datadog metric / SLO registration for `analytics_meta` family (P2, observability)

§51 names 7 Sourcera-internal meta-events (`usage_analytics_envelope_violation`, `usage_analytics_outbox_lag_budget_exceeded`, `usage_analytics_dsar_redaction_applied`, `usage_analytics_k_anon_floor_hit`, `usage_analytics_conversion_factor_binding_mismatch`, `usage_analytics_event_family_registered`, `usage_analytics_alias_retirement_overdue`) as observability signals — but §51 does not register a corresponding Datadog metric or SLO. §42 (observability framework) is not cross-referenced from §51. §50.14 Ops dashboards consume some of these signals (per the Appendix G §51 additions "Dashboard partitioning" paragraph at line 44846) but the §42 paging surface — service name, monitor key, escalation policy — is not declared. A junior SRE cannot wire the pager from §51 alone.

Filed as D-51-021.

### F-22 — §51 silent on third-party-outage failure modes (P2, edge_case)

Per audit-prompt §14 edge-case discipline (third-party outages: WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk), §51 must address realistic failure modes. §51.6.5 Failure-Mode Mitigations covers conversion-factor drift, per-user time-saved leak, rollback corruption, hourly-rate whiplash, binding mismatch, snapshot SLO breach, DSAR-in-flight leak, hourly-rate retroactive whiplash. It does NOT cover:

- **PostHog ingest outage.** Outbox backlog grows; dashboard tiles silently stale; AC-5 lag breach fires but customer-visible degradation behavior unspecified (do panels show "Stale" banner? gray out? show last-known value?).
- **Convex insert outage.** UsageEvent inserts fail at the source; AC silent on customer-visible behavior (do AIOperations themselves fail? are dashboards labeled stale? is the upgrade-CTA suppressed?).
- **Snowflake reverse-ETL outage** (the §50.14 nightly snapshot pipeline). Snapshots fail to compute → §51.3.7 AC-7 `usage_analytics_snapshot_not_ready` fires but the cascading impact on the customer's Time-Saved value (which depends on Snowflake-computed aggregates) is unspecified.

Filed as D-51-022.

### F-23 — Mobile-divergence coverage absent for §51.4 / §51.5 / §51.6 (P2, mobile_divergence)

§51.3.1 has a single sentence on mobile ("Mobile surface is read-only with a condensed layout per §38 Responsive Design; mobile exports are blocked"). §51.4 User-Level Usage Dashboard, §51.5 Seller Usage Parity, §51.6 Time-Saved Baseline Panel are entirely silent on mobile rendering, mobile gesture parity, mobile k-anonymity render fallback, mobile export gating. The audit-prompt edge-case "mobile vs desktop divergence" is unaddressed for 3 of the 4 §51 customer-facing surfaces.

Filed as D-51-023.

### F-24 — Multi-section §51 terms not in Appendix K (P3, glossary)

The following §51 terms appear across multiple subsections (and §51 + §50.13 + §22.18 + §40.2 + §44.6 elsewhere) but have no Appendix K Glossary entry: **Time-Saved Baseline Model** (§51.6, §50.13.2), **UsageDashboardSnapshot** (§51.3, §51.7, §40.2), **Conversion Factor Version Set Hash** (§51.3, §51.6, §44.6), **Capability Domain** (§51.2.3, §50.12, §51.6.1), **Methodology Footnote** (§51.6.2, §51.6.4, §51.8.4), **k-anon Floor Hit** (§51.3.3, §51.4.3, §51.5.4, §51.8.1), **Cardinality Budget** (§51.2.4, Appendix G), **Envelope Violation** (§51.1.2, §51.2.5, §51.7.5, Appendix G). Per CLAUDE.md §11 ("Every new multi-section term → Appendix K"), each requires a Glossary row.

Filed as D-51-024.

---

## Self-Challenge Pass

Re-read findings as hostile reviewer.

- **F-1 (Buyer Activation Metric):** A hostile reviewer would say "the buyer side has a 13-phase pipeline; the canonical buyer 'activation' is `phase_advanced` from Phase 1 to Phase 2 (Requirements Drafted). Engineering can construct this from existing events." Counter: the audit prompt's check #1 is "Activation metric defined per console" — defined, not derivable. Two engineers would derive two different scalars (phase-2 entry? phase-6 entry? first AIOperation? workspace_created?). §51 must name the metric. P1 stands. Severity confirmed against rule (P1 = feature unbuildable as written; missing acceptance criteria for buyer activation).
- **F-2 (retention cohorts):** Hostile reviewer: "PostHog has a built-in retention model; the Org admin can configure cohorts via the PostHog Insights surface — §51 doesn't need to author them." Counter: §51 is the canonical analytics surface for customers. Customers do not access PostHog Insights — they access the §51.3 / §51.4 / §51.5 dashboards. A "30-day retention rate" panel is unbuildable absent a §51 definition of which event-pair anchors the cohort. P1 stands.
- **F-3 (conversion funnels):** Hostile reviewer: "§48 owns growth-loop funnels; §51 inherits the funnel from §48." Counter: §51 does not cross-reference any §48 funnel definitions and does not surface them on a customer-facing panel. The audit prompt's check #3 requires "Conversion funnel defined per growth path." The §51 Org Dashboard, User Dashboard, Seller Parity Dashboard, Time-Saved Panel none of them include a funnel. P1 stands. The defect is the absence of explicit funnel surface in §51, not the absence of funnel data behind it.
- **F-4 / F-5 / F-6 / F-7 (plan-gating contradictions and Solo / Seller-Pro drifts):** Hostile reviewer: "These are mechanical fixes — a v7.1.1 hygiene pass." Counter: P1 plan_gating is the explicit severity-definition rule for "missing plan-gating row in §5.11/§34.1/§39" and for conflicting numerical singletons. Per the severity definitions, "default to P1 if a junior engineer would build the wrong thing" — a junior building Solo entitlements would silently omit Usage Dashboard access. P1 stands across F-4 / F-5 / F-6 / F-7.
- **F-8 (API endpoint drift):** Hostile reviewer: "Appendix J §32.5 is the source of truth for rate-limit classes; the §51 body paths are illustrative." Counter: §51.3.5 + §51.4.4 + §51.5.5 carry full method/path/auth-scope/rate-limit-class API contract tables — these are not illustrative, they are §32-conformant tables that engineering builds against. Convention #6 requires every endpoint to declare method, path, auth scope, rate-limit class — Appendix J §32.5 declares different paths. Both cannot be right. P1 stands.
- **F-9 (envelope_violation_kind enum drift):** Hostile reviewer: "The 4 missing values are forward-compatibility placeholders." Counter: the §51.2.5 prose validator table is a complete list of behaviors. `cross_console_leak` is registered in Appendix J and named in the firewall ACs but absent from §51.2.5 prose. A validator cannot accept emissions tagged with `cross_console_leak` without §51.2.5 prose authorizing the behavior. P1 stands.
- **F-10 (§40.2 missing rollup rows):** Hostile reviewer: "§51.7.1 declares 24-month rolling for weekly/monthly/quarterly as a single row — that's sufficient." Counter: §40.2 is the canonical retention home per Convention #9. §40.2 rows ARE the authoritative contract; §51.7.1 cross-reference is not. A purge job reading §40.2 alone will miss `weekly_rollup` and `quarterly_rollup` rows. P1 stands.
- **F-11 (Hero Moment wildcard miss):** Hostile reviewer: "the §51.1.5 cross-reference is not authoritative; Appendix G is." Counter: the audit prompt's check #5 is explicitly that Hero Moment events are tied to §22 + §49 from §51's perspective. The §51.1.5 table is the §51-side cross-reference. Missing the events on the §51 side breaks the connection. P1 stands.
- **F-12 (Forced-Vendor-Signup absent):** Hostile reviewer: "§51 is customer-facing analytics; Forced-Vendor-Signup is an Ops-internal mechanic." Counter: per §51.5 (Seller Usage Parity), seller users see their own onboarding funnel attribution. A seller's "I activated via M5 buyer-invite" funnel is customer-relevant. Plus §48.1.6 explicitly names the Forced-Signup Funnel Dashboard. §51 inheriting silence on this playbook means the seller cannot see their own forced-signup path. P1 stands.
- **F-13 (`kb_citation_in_closed_bid_attributed` unregistered):** Hostile reviewer: "the parenthetical explicitly says 'registered under §22.18 KB Value Capture'." Counter: verified the §22.18 Appendix G block (lines 44063–44089) — the event is not registered. The parenthetical is false. AC-9 demands a join test against a non-existent event. P1 stands.
- **F-14 / F-15 / F-16 / F-17 (enum drift / numerical singletons):** All P2 per the severity-definition rule (sparse error-code coverage / observability under-specified / consistency drift between two readers). Severity confirmed.
- **F-18 (residency_mismatch event):** P2 per "instrumentation under-specified" (severity-definition rule for P2).
- **F-19 (AE not yet registered):** P2 per "consistency_drift / authored_extension". This is a documentation_gap that is process-tracked but not yet acted on; v7.1.1 ratification gate would trip on this. P2 confirmed.
- **F-20 (§51.1.5 stale prefix):** P2 per the existing D-48-006 severity classification. Forwarding row only.
- **F-21 (Datadog / SLO silence):** P2 per "observability under-specified" rule.
- **F-22 (third-party-outage):** P2 per "soft-state behavior" rule. The defect is silence; remediation is straightforward (add 3 failure-mode entries to §51.6.5 or a new §51.8.5).
- **F-23 (mobile divergence):** P2 per "mobile parity not specified" rule.
- **F-24 (glossary):** P3 per "terminological drift that does not affect implementation but reduces spec hygiene" rule.

Severity confirmed across all 24 defects. No revisions required.

---

## Counterfactual Pass

For each §51 subsection, enumerate at least three realistic failure modes; confirm each is addressed.

**§51.1 Event Taxonomy:**

1. **Convex insert succeeds but PostHog dispatch silently drops the row** — addressed by §51.1.4 dual-write contract + AC-5 outbox lag budget + AC-6 DLQ depth.
2. **DSAR-in-flight row dispatched with raw `user_id`** — addressed by §51.1.4 DSAR-in-flight guard + AC-7.
3. **Alias retirement deadline passes without canonical event being adopted** — addressed by §51.1.6 AC-8 `usage_analytics_alias_retirement_overdue`.
4. **A new service emits a bespoke event family that shadows an existing one** — partially addressed by AC-1 `event_family_appendix_g_coverage` CI gate but registry-mutation governance not authored (would the bespoke family register itself silently?). **Filed as part of D-51-021 (observability gap).**

**§51.2 Standardized Event Properties:**

1. **Cardinality explosion at `user_id` person property** — addressed by §51.2.4 + AC-5 CI gate.
2. **Capability ID resolves to a deprecated CapabilityRegistryEntry** — addressed by §51.2.5 + AC-4 `usage_event_capability_unresolved`.
3. **Validator version skew between client SDK and server** — partially addressed by `schema_version` property + `validator_version` on envelope-violation events but version-mismatch behavior is unspecified (accept-warn vs reject?). **No defect filed — §51.1.2 layer 3 implicitly authorizes per-event property extension; a junior engineer could resolve.**

**§51.3 Org-Level Usage Dashboard:**

1. **50K-user Org first-load triggers massive PostHog query** — addressed by §51.8.3 FM6 (precomputed snapshot).
2. **Per-user disclosure leak to org_admin** — addressed by §51.3.3 disclosure gate + AC-3.
3. **Cross-region aggregation attempt** — addressed by AC-9 + §51.7.3.
4. **Snapshot not yet computed for current window** — addressed by AC-7 (HTTP 404 `usage_analytics_snapshot_not_ready`).
5. **Buyer-console user attempts seller-endpoint** — addressed by §51.5.6 AC-4 + new error code.
6. **PostHog ingest down → dashboard panels stale** — NOT addressed. **Filed as F-22 / D-51-022.**

**§51.4 User-Level Usage Dashboard:**

1. **Admin cross-user access without audit** — addressed by AC-2.
2. **DSAR-erased user dashboard hit** — addressed by AC-4.
3. **Export size ceiling breach** — addressed by AC-8.
4. **Mobile rendering of self-view** — NOT addressed. **Filed as F-23 / D-51-023.**

**§51.5 Seller Usage Parity:**

1. **Buyer-console user attempts seller endpoint** — addressed by AC-4.
2. **Win-rate cohort below k=10** — addressed by AC-3.
3. **Buyer opted out of cross-seller disclosure** — addressed by AC-5.
4. **`kb_citation_in_closed_bid_attributed` event not registered** — surfaced by AC-9 integration test but the event does NOT exist. **Filed as F-13 / D-51-013.**

**§51.6 Time-Saved Baseline Model:**

1. **Conversion factor rollback corrupts historical ROI** — addressed by FM3 immutability.
2. **Loaded hourly rate retroactive whiplash** — addressed by FM4 on-row storage.
3. **Per-user time-saved leak** — addressed by FM2 / AC-5.
4. **Methodology cache stale after publish** — addressed by FM1 / AC-4.
5. **Time-Saved Credit binding race** — addressed by FM5 / AC-9.
6. **Snowflake outage prevents snapshot compute** — NOT addressed. **Filed as F-22 / D-51-022.**

**§51.7 Retention & DSAR:**

1. **Retention purge at 24-month boundary** — addressed by AC-1.
2. **DSAR-in-flight guard** — addressed by AC-4.
3. **Cross-residency leak** — addressed by AC-5, AC-6.
4. **GDPR right-to-erasure** — addressed by AC-7.
5. **`weekly_rollup` / `quarterly_rollup` purge** — NOT addressed; §40.2 missing rows. **Filed as F-10 / D-51-010.**

**§51.8 Aggregate Acceptance Criteria:**

1. **Cross-cutting `analytics_meta` family scope drift** — addressed by §51.8.1 AC-17 invariant monitoring.
2. **Aggregate-acceptance test orchestration** — addressed by AC-1 through AC-20.
3. **Conversion-factor binding zero-tolerance** — addressed by AC-10.

**Net counterfactual gaps**: 5 (1 in §51.1, 1 in §51.3, 1 in §51.4, 1 in §51.5, 1 in §51.6, 1 in §51.7). All folded into D-51-010 / D-51-013 / D-51-022 / D-51-023.

---

## Defect Roll-Up

| Subsection / cluster | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| §51.1 Event Taxonomy + §51.2 Properties | 0 | 2 (D-51-009 / -011) | 1 (D-51-018) | 0 | 3 |
| §51.3 Org-Level Dashboard | 0 | 3 (D-51-004 / -006 / -008) | 1 (D-51-014) | 0 | 4 |
| §51.4 User-Level Dashboard | 0 | 1 (D-51-006 shared) | 1 (D-51-023 partial) | 0 | 1 (unique) |
| §51.5 Seller Usage Parity | 0 | 2 (D-51-007 / -013) | 1 (D-51-023 partial) | 0 | 2 (unique) |
| §51.6 Time-Saved Baseline | 0 | 0 | 1 (D-51-022 partial) | 0 | 0 (unique) |
| §51.7 Retention & DSAR | 0 | 1 (D-51-010) | 0 | 0 | 1 |
| §51.8 Aggregate / cross-cutting | 0 | 4 (D-51-001 / -002 / -003 / -012) | 6 (D-51-015 / -016 / -017 / -019 / -020 / -021 / -022 / -023) | 1 (D-51-024) | 11 |
| §51.3.6 plan-gating Solo gap | 0 | 1 (D-51-005) | 0 | 0 | 1 |
| **Total Phase 51** | **0** | **13** | **10** | **1** | **24** |

**Verification Protocol re-evaluation.** Phase 51 produces 0 P0 defects; the Global Verification Protocol HALT-rule does not engage. The 13 P1 defects cluster into four remediation themes for v7.1.1: (i) instrumentation surface completeness (D-51-001 / -002 / -003 / -011 / -012 / -013); (ii) plan-gating canonicalization to Solo + 6-tier Seller schema (D-51-004 / -005 / -006 / -007); (iii) API endpoint-path canonicalization (D-51-008); (iv) enum + retention canonicalization (D-51-009 / -010). The 10 P2 defects cluster into measurement hygiene (D-51-014 / -015 / -016 / -017 / -018 / -019 / -020) and edge-case coverage (D-51-021 / -022 / -023). Phase 51 finds no §51 P0 contradiction with v7.1.0 stamp.

**Pre-edit Master Spec backup.** Not applicable — Phase 51 is non-destructive audit; no Master Spec edits.

**Cross-References.**

- `D-48-006`: §51.1.5 M9–M17 row staleness — forwarded to D-51-020.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: D-51-019 surfaces `usage_analytics_per_user_disclosure_viewed` AE-pending ratification.
- §44.6 Solo-Tier Surface Treatment: D-51-005 — Solo treatment absent from §51 Usage Dashboard family.
- §34.1.2 Seller Plan Tier Definitions: D-51-007 — "Seller Pro" tier name does not exist.
- §40.2 Data Retention: D-51-010 — missing `weekly_rollup` + `quarterly_rollup` retention rows.
- §44.1 Performance Targets: D-51-015 — missing rows for usage_dashboard p95, time_saved_panel p95, win_rate_correlation regression compute.
- §39 Object Size Constraints: D-51-016 — missing rows for org / user / seller export ceilings.
- §42 Observability: D-51-021 — missing Datadog SLO registration for `analytics_meta` family.
- §38 Responsive Design: D-51-023 — §51.4 / §51.5 / §51.6 mobile divergence undefined.
- Appendix K Glossary: D-51-024 — 8 multi-section terms missing.
