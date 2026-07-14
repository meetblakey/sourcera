# PHASE 48.3 FINDINGS — §48 Network Effects Walk

**Audit prompt.** Walk §48 network-effects subsections. Verify (1) buyer-side network effects enumerated; (2) seller-side network effects enumerated (forced signup, KB value capture, ghost RFP ingestion, etc.); (3) cross-side network effects enumerated; (4) each network effect has a measurable proxy metric. File defects per `Audit_Prompts.md → Defect Ledger Format`.

**Source pass.** Read §48.3 end-to-end (lines 34664–34755) including §48.3.1 Qualitative Framing (six platform effects), §48.3.2 Measurable Signals (twelve-row table), §48.3.3 Dashboards (three Ops Growth Console surfaces), §48.3.4 Acceptance Criteria (six numbered ACs), §48.3.5 Seller-Side Compounding Network Effects (seven loops S1–S7 + reinforcement-cycle closure paragraph + free-tier audit + AC 7–12). Cross-walked into §48.1.5–§48.1.7 (Hero-Moment / Activation Metric / Conversion Moments) and §48.5–§48.7 (M1–M17 mechanics) to validate the §48.3 → mechanic linkage. Verified TemplateLibraryEntry at §4.4.28 (line 6636), BidSuccessShare at §4.4.29 (line 6712), PublicSelectionReport at line 35292, and Appendix J references at lines 48008–48104. Confirmed `ops_finance_admin` is a registered Ops role (106 occurrences in spec).

---

## Per-Check Walk

Legend: ✅ explicit · ⚠ partial / implicit · ❌ silent.

| # | Check | §48.3 Coverage | Verdict |
|---|---|---|---|
| 1 | Buyer-side network effects enumerated | §48.3.1 #2 ("buyers compound buyers") is a single qualitative line. No `§48.3.6 Buyer-Side Compounding Network Effects (Inventory & Instrumentation)` section parallels the §48.3.5 seller-side seven-loop inventory. Buyer-side mechanics that compound (M1 stakeholder invite → seat expansion; M2 PublicSelectionReport → buyer-to-buyer SEO/referral; M3 EvaluationCertificate → buyer-side trust signaling; M6 Domain Auto-Join → intra-Org viral; M8 Org Intelligence → per-Org returns curve; M16 Buyer Referral → cohort growth; M12/M13 Market-Intel → buyer-to-buyer informational compounding) exist individually in §48.5 but are never aggregated into a buyer-side network-effects inventory mirroring §48.3.5. | ❌ |
| 2 | Seller-side enumerated (forced signup, KB capture, ghost RFP, etc.) | §48.3.5 S1–S7 is exhaustive: S1 Invited-Vendor → Published-Profile (forced signup); S2 KB → Capability → Match → EOI → Revenue (KB value capture); S3 Bid-Close → Win/Loss → Calibration; S4 Seller-Profile SEO; S5 Ghost-Bid Import (M15); S6 Buyer-Funded Pro Trial (M17); S7 Template Publish Incentive (M9 / L9). Mechanism, primary §4 entity refs, primary telemetry events, measurable signal, dashboard tile, k-anonymity floor, free-tier-contribution column all present per row. | ✅ |
| 3 | Cross-side network effects enumerated | §48.3.1 #3 ("data compounds both sides") is a single qualitative line. No subsection enumerates cross-side compounding loops as primary objects. Specifically missing: (a) Seller→Buyer marketplace-inventory discovery loop (more sellers → richer category browse → faster buyer time-to-eval); (b) Buyer→Seller win/loss-disclosure feedback loop (more closed buyer evaluations → more match-score calibration events → all sellers' match scores improve); (c) Two-sided market-intelligence loop (buyer signals + seller capabilities jointly produce M12 / M13 → both sides benefit); (d) Cross-Console Bridge information-flow loops (§4.7 bridge entities carrying contextual signals across the firewall). The §48.3.5 closure paragraph implies a closed reinforcement cycle but only on the seller side; the buyer-side compounding leg is asserted ("Inbound buyer demand grows → More buyer invites") without instrumentation. | ❌ |
| 4 | Each network effect has a measurable proxy metric | §48.3.2 supplies 12 platform-level signals (2 per §48.3.1 effect). §48.3.5 supplies 7 primary + ~12 secondary/tertiary signals. Five concrete defects degrade this otherwise-good coverage: (i) Effect-#5 signals (`m2_public_link_share_rate_per_workspace`, `m14_bid_success_share_rate_per_winning_bid`) cite "M2 entity (registered placeholder)" / "M14 entity (registered placeholder)" — both entities are now first-class at §4.5 PublicSelectionReport / §4.4.29 BidSuccessShare. (ii) S3 secondary `s3_kb_entry_confidence_distribution_curve_per_seller_org` is a curve, not a scalar — undefined "peakiness" cannot be alerted-on or dashboard-tiled. (iii) S6 target ("≥ 2× cold-start rate") is purely relative; if cold-start drops to 5%, the S6 target erodes to 10% with no absolute floor. (iv) Multiple signals carry inconsistent attribution windows (30d / 60d / 90d / lifetime) without a master attribution-window taxonomy. (v) §48.3.4 AC #1 hardcodes "twelve §48.3.2 signals" — the §48.3.5 expansion (7 primaries + secondaries) is not covered by AC #1; only §48.3.5 AC 7 picks up "primary signal" but not secondary/tertiary. | ⚠ |

---

## Cross-Cutting Findings (promoted to ledger)

### F-NET-1 — Buyer-side network-effects inventory absent (P1, network_effect_gap)

§48.3.5 inventories seven seller-side compounding loops at full instrumentation fidelity (mechanism / §4 entities / telemetry events / signal / dashboard tile / k-anonymity floor / free-tier-contribution). The buyer side receives only a one-line qualitative claim at §48.3.1 #2. Buyer-side compounding loops are real and individually documented in §48.5 (M1, M2, M3, M6, M8, M16) and §48.6 (M9, M12, M13) but never aggregated into a buyer-side inventory. Engineering, Ops, and Growth cannot dashboard-build, alert-build, or roadmap-prioritize buyer-side network effects without an analogous inventory. Asymmetry — Sellers get the deep cut, Buyers get a sentence — is itself a defect.

Filed as D-48.3-001.

### F-NET-2 — Cross-side network-effects inventory absent (P1, network_effect_gap)

§48.3.1 #3 ("data compounds both sides") and #4 ("SEO compounds everything") are cross-side qualitative claims. No subsection enumerates the bidirectional value flows as discrete objects. Specifically missing: (a) Seller→Buyer marketplace-inventory discovery loop; (b) Buyer→Seller win/loss-disclosure feedback loop (the §48.3.5 S3 row captures the seller-side benefit but elides the all-sellers' match-score-improvement leg that benefits future buyers); (c) Two-sided market-intelligence joint-production loop feeding M12 / M13; (d) Cross-Console Bridge information-flow compounding per §4.7. Without a cross-side inventory, the §48.3.5 closure paragraph's "Inbound buyer demand grows → More buyer invites" leg is unmeasured. Filed as D-48.3-002.

### F-NET-3 — §48.3.2 effect #5 signal sources cite stale "registered placeholder" entity refs (P2, consistency_drift)

§48.3.2 effect #5 (Certificates and shares compound trust) row 1 sources `m2_public_link_share_rate_per_workspace` from "M2 entity (registered placeholder)" (line 34691). Row 2 sources `m14_bid_success_share_rate_per_winning_bid` from "M14 entity (registered placeholder)" (line 34692). Both entities have since been promoted to first-class status: PublicSelectionReport at §4.5 (entity creation paragraph at line 35292, lifecycle state machine at line 35331); BidSuccessShare at §4.4.29 (line 6712, "NB-11 of the Phase 4 remediation promotes the entity from §48.7.1-inline to a §4.4 first-class field table at Master Spec fidelity"). The §48.3.2 placeholder annotations are stale by the §4.4.29 promotion. Filed as D-48.3-003.

### F-NET-4 — §48.3.4 AC #1 hardcodes "twelve" signals; §48.3.5 expansion uncovered (P2, acceptance_criteria)

§48.3.4 AC #1: *"All twelve §48.3.2 signals MUST be computed nightly AND surfaced in the §48.3.3 Network Effects Dashboard within 25 hours of source-data write."* §48.3.5 introduces 7 primary signals (`s1_invited_vendor_inventory_added_30d_per_active_buyer_org`, `s2_kb_to_eoi_revenue_contribution_30d`, `s3_match_score_calibration_events_30d`, `s4_organic_session_growth_30d_per_seller_profile`, `s5_ghost_bid_import_kb_to_first_citation_p50_days`, `s6_pro_trial_grant_to_paid_conversion_rate`, `s7_template_clone_velocity_per_published_template_30d`) + ~12 secondary/tertiary signals + 1 reinforcement-cycle metric (`seller_side_reinforcement_cycle_p50_days`). §48.3.5 AC 7 covers only the primary signals at a 24-hour SLO; secondary/tertiary signals + the reinforcement-cycle metric have no nightly-compute SLO. The hardcoded literal "twelve" also breaks if S1–S7 add or remove a signal. CI gates that assert against AC text strings (per V12 audit pattern) will silently lock the count. Filed as D-48.3-004.

### F-NET-5 — Multiple Appendix J `§48.3.5 S<n>` cross-references are misnumbered (P2, consistency_drift)

Appendix J registers six enums with §48.3.5 S-loop cross-references that don't match the §48.3.5 row taxonomy:

- `match_score_calibration_outcome_enum` (line 48020) — labeled "§48.3.5 S1"; calibration belongs to **S3** (Bid-Close → Win/Loss Signal → Platform Learning).
- `ghost_bid_import_source_enum` (line 48026) — labeled "§48.3.5 S4"; Ghost-Bid Import is **S5**.
- `ghost_bid_redaction_reason_enum` (line 48032) — labeled "§48.3.5 S4"; same defect as above, should be **S5**.
- `template_featured_placement_kind_enum` (line 48038) — labeled "§48.3.5 S6"; Template Publish Incentive is **S7** (S6 is Buyer-Funded Pro Trial).
- `seller_org_inventory_discovery_path_enum` (line 48044) — labeled "§48.3.5 S7"; "Inventory" belongs to **S1** (Invited-Vendor → Published-Profile → Marketplace-Ready Inventory). S7 is Template Publish.
- `kb_citation_kind_enum` (line 48008) — co-labeled "§48.3.5 S1"; KB-citation belongs to **S2** (KB → Capability → Match → EOI → Revenue), not the inventory loop.

Six of the six §48.3.5 enum cross-references are wrong by name-to-loop-number matching. Suggests an earlier S-numbering was used in Appendix J and never updated when §48.3.5 ratified the canonical S1–S7 names. A junior engineer following the Appendix J refs will read the wrong §48.3.5 row and build the wrong instrumentation. Filed as D-48.3-005.

### F-NET-6 — §48.3.5 S3 secondary signal is a curve, not a scalar (P2, network_effect_gap)

§48.3.5 S3 row signal column: *"secondary: `s3_kb_entry_confidence_distribution_curve_per_seller_org` (signal: how peaky is the confidence distribution after N bid closes)"*. Without an operational definition of "peakiness" (kurtosis? IQR? variance? percentile spread? % within [0.8, 1.0] band?), the signal cannot be alerted-on or dashboard-tiled. §48.3.5 AC 7 requires every loop's primary signal to surface as a dashboard tile within 24 hours — the secondary signal is unbuildable as written. Filed as D-48.3-006.

### F-NET-7 — §48.3.5 S6 target band is purely relative; absolute floor missing (P2, network_effect_gap)

§48.3.5 S6 signal column: *"`s6_pro_trial_grant_to_paid_conversion_rate` … benchmarked against the cold-start Free → Starter conversion rate (Indicator #1 in §48.1.6); target: ≥ 2× cold-start rate per Summary §3.4 S6"*. Cold-start (§48.1.6 Indicator #1) target ≥ 18%. If macro conditions degrade cold-start to 5%, S6's "≥ 2× cold-start" target erodes silently to 10% — and a 10% S6 conversion would no longer trigger an alert. The relative-only target produces a target-erosion paradox: the worse cold-start performs, the easier S6 looks. An absolute-floor pair (e.g., "AND ≥ 35% absolute, regardless of cold-start cohort") would prevent the paradox. Filed as D-48.3-007.

### F-NET-8 — §48.3.3 Network Effects Dashboard read-access excludes `ops_finance_admin` (P2, rbac)

§48.3.3 #2 Network Effects Dashboard: *"Read access: `ops_growth_admin`, founder leadership."* Network-effect signal trends are revenue-leading indicators (S2 KB → EOI → Revenue is explicitly a revenue loop; S6 Pro-Trial → Paid is explicitly a conversion loop). `ops_finance_admin` per §50.x owns revenue attribution and Marketing/Finance roll-ups; omitting them creates a permission bottleneck where Finance must request the data via Ops Growth. The asymmetry against §48.3.3 #1 Growth Loop Operations Dashboard ("Read access: `ops_growth_admin`, `ops_finance_admin`, `ops_security_admin`") is unjustified — both surfaces hold the same revenue-relevant data class. Filed as D-48.3-008.

### F-NET-9 — §48.3 silent on third-party-outage failure-mode handling (P2, observability)

§48.3.2 declares per-signal `signal_freshness_seconds_max`, `data_completeness_pct`, `k_anonymity_floor_satisfied`. §48.3.4 AC #2 covers the k-anonymity-floor render-refusal path; no AC covers the freshness-breach render path. Audit-required edge cases must include third-party outages: (a) Snowflake reverse-ETL outage → nightly signals stale; (b) PostHog Live Insights outage → 60-second real-time tiles dark; (c) Datadog metrics outage → tile rendering uninstrumented. The dashboard's behavior under stale state (last-known value with banner? gray-out? error placeholder?) is unspecified, and no `growth_signal_freshness_breach` event is registered. Filed as D-48.3-009.

### F-NET-10 — §48.3 silent on data-residency partitioning of network-effect signals (P2, residency)

Network-effect signals aggregate cross-Org (k-anonymity floors enforce ≥ 5 / 10 / 20). The spec does not state whether the aggregation respects §41 data-residency boundaries. A US-residency Org's signals being aggregated into a global rollup that an EU-residency-Ops-admin then renders could violate residency lock per §41 (or vice versa). PostHog routing per residency, Snowflake reverse-ETL partition behavior, and dashboard regional-scope filters are all unspecified at §48.3. Filed as D-48.3-010.

### F-NET-11 — `seller_side_reinforcement_cycle_p50_days` flagged inline as Authored Extension; no AE ledger row (P2, authored_extension)

§48.3.5 reinforcement-cycle paragraph (line 34743): *"`seller_side_reinforcement_cycle_p50_days` = median elapsed time from a Buyer Org sending its first vendor invite to that buyer Org receiving an inbound EOI from a different invited vendor (Authored Extension — operational measurement design)."* CLAUDE.md §13 rule 4 requires every Authored-Extension flag to have a corresponding row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. Inline AE flags without ledger rows create silent drift — there is no ratification gate enforcement. Same pattern at S4 "Gartner / G2 Baseline Refresh Cadence (Authored Extension — Ops Growth Workflow)" paragraph and §48.1.6 indicator targets #2 / #3 / #5 / #6 / #7 / Q2. Filed as D-48.3-011 (covers the §48.3 inline AE flags).

### F-NET-12 — §48.3.5 AC 9 free/paid-tier example pre-dates Solo plan addition (P3, consistency_drift)

§48.3.5 AC 9: *"Free-tier contribution metrics for loops S1, S2, S3, S4, S5, S7 MUST be computable separately from paid-tier contribution metrics; per-tier contribution percentages are surfaced on each loop's dashboard tile (e.g., 'S2 KB → Match → EOI: Free 47% / Starter 32% / Growth 15% / Scale 6%')."* Example enumerates 4 tiers (Free, Starter, Growth, Scale). Per CLAUDE.md §16 / §34.1.2, Seller plan tiers are 6 (Free, **Solo**, Starter, Growth, Scale, Enterprise — Solo added in v7.1.0). The example pre-dates Solo and pre-dates Enterprise. Filed as D-48.3-012.

### F-NET-13 — Negative network effects / disnetwork effects unaddressed (P2, network_effect_gap)

§48.3.1 / §48.3.2 / §48.3.5 frame all signals as positive-direction (more → better). The audit-required counterfactual pass identifies four realistic failure modes the spec must handle: (a) seller concentration in a category triggering buyer choice paralysis (HHI > 0.25 → M11 ComparisonPage signal degradation); (b) algorithmic-content SEO penalty on M9–M13 pages (Google EEAT downgrade if content too templated); (c) KB-staleness drag on Match Score quality (S3 calibration loop is positive but doesn't account for KB decay); (d) Marketplace listing flooding (>200 sellers per category) degrading buyer browse-quality. None has a kill-switch / alert / remediation path defined in §48.3 (or §48.4 SIM). Filed as D-48.3-013.

### F-NET-14 — Attribution-window taxonomy missing for cross-loop signals (P2, network_effect_gap)

§48.3.2 / §48.3.5 signals depend on multi-month cohort observation with inconsistent attribution windows: 30d (most), 60d, 90d (S5 secondary), lifetime (S6 grant→activation). §48.4 anti-spam framework references attribution-window expiry alerts but no master attribution-window taxonomy table exists for §48.3 signals. Without a taxonomy, the same loop measured from two dashboards could yield different numbers, and Reverse-ETL pipelines have no canonical join window. Filed as D-48.3-014.

### F-NET-15 — §48.3.5 reinforcement-cycle closure cross-Buyer-Org join lacks scope-isolation note (P3, firewall_leakage)

§48.3.5 closure paragraph: *"median elapsed time from a Buyer Org sending its first vendor invite to that buyer Org receiving an inbound EOI from a different invited vendor."* Cross-Buyer-Org joins (the "different invited vendor" side, where the EOI sender is a separate seller-Org connected to a separate buyer-Org via the marketplace) plus the rollup back to "the same buyer Org" require an Ops-rollup-only computation that never renders on a Buyer Console. §48.3.2 effects #2 / #4 carry implicit scope notes via k-anonymity floors; the reinforcement-cycle paragraph is silent on the firewall constraint. Filed as D-48.3-015.

---

## Counterfactual Pass

For each network-effect cluster, three realistic failure modes the spec must address:

**§48.3.5 S1 (Invited-Vendor Inventory).** (i) Vendor accepts invite + publishes profile but the buyer's evaluation closes pre-bid (Phase 12 declined-vendor track per §10.13) — does S1 still credit the inventory? §48.3.5 silent. (ii) Two buyers invite the same vendor within the same hour — §48.3.5 telemetry event `seller_org.invited_vendor_inventory_added` fires once or twice? Idempotency unspecified. (iii) Vendor publishes profile, profile is later taken down for §48.4 abuse — does the S1 30d inventory metric include or exclude the deletion? Silent.

**§48.3.5 S3 (Bid-Close Calibration).** (i) Bid closes with `win_loss_disclosed = 'undisclosed'` — does S3 calibration event fire? `match_score.calibration_event_recorded` requires `actual_outcome` which is undefined for undisclosed bids. (ii) Bid is force-closed by Ops (§50.x) rather than buyer — does S3 still record? Silent. (iii) Calibration event written, then KB entries cited in the bid are subsequently archived — does the calibration row update or persist its snapshot? Silent.

**§48.3.5 S5 (Ghost-Bid Import).** (i) Free seller imports a Ghost Bid that fails the §22 validators — `ghost_bid_import.kb_entries_proposed` should fire with proposed_count=0 or not fire at all? Silent. (ii) First-import-free is consumed; seller upgrades to Starter; does the next import still consume the value-priced wallet entry per §34? Silent. (iii) Ghost-imported KB entries are later mass-rejected by the seller — does S5 secondary "to-paid-upgrade conversion rate" attribute the upgrade to S5 or treat the import as a non-event? Silent.

**§48.3.3 Dashboards.** (i) PostHog rate-limit during a §48.4.6 SIM anomaly storm — Anti-Spam Dashboard goes dark while the underlying SIM anomalies escalate. (ii) Snowflake reverse-ETL fails for 48 hours — dashboard tiles render last-known values without staleness banner (no `growth_signal_freshness_breach` event registered, see D-48.3-009). (iii) `ops_growth_admin` user is offboarded; no successor reads the Network Effects Dashboard for two weeks; degradation goes unobserved. Dashboard has no "no-reader-for-N-days" escalation surface.

These counterfactuals seed defects D-48.3-009 (outage handling) and D-48.3-013 (negative-direction signals) and surface a latent gap in S1 / S3 / S5 idempotency-and-edge-case coverage that warrants follow-up at the §48.3.5 row level.

---

## Self-Challenge Pass

Re-read findings as hostile reviewer.

- **D-48.3-001 (Buyer-side inventory):** Hostile reviewer: *"Sourcera is asymmetric by design — sellers are the supply side and the network effect engine; buyers consume but don't compound. The §48.3.1 #2 single-line treatment is intentional, not a gap."* Counter: Sourcera explicitly markets buyer-side compounding (M16 Buyer Referral, M2 PublicSelectionReport, M3 EvaluationCertificate, M8 Org Intelligence value curve all create buyer-to-buyer value). The §48.5 mechanic count for buyer-side compounding mechanics ≥ 5 (M1, M2, M3, M6, M8, M16); the absence of a §48.3.6 inventory leaves dashboard-build, alert-build, and roadmap-prioritization unbuildable. **P1 stands.**
- **D-48.3-002 (Cross-side inventory):** Hostile reviewer: *"§48.3.5 S2 already references the cross-side leg ('buyers benefit via inbound EOIs from buyers who searched the category'); §48.3.5 closure paragraph names the full reinforcement cycle. A separate cross-side subsection is over-specification."* Counter: a parenthetical mention inside a seller-side row is not an inventory. The cross-side legs need their own measurable signals (currently absent), their own dashboard tiles, their own k-anonymity floors, and their own free-tier-contribution analysis. The closure paragraph's "Inbound buyer demand grows" leg has zero instrumentation. **P1 stands.**
- **D-48.3-003 (placeholder entity refs):** Hostile reviewer: *"This is a stale annotation, not a defect — the entity exists, the signal can be computed."* Counter: a junior engineer building against §48.3.2 will follow the "(registered placeholder)" annotation and search for an entity that no longer matches that label. The cross-reference is misleading. P2 documentation/consistency drift stands.
- **D-48.3-004 (hardcoded "twelve"):** Hostile reviewer: *"The number 'twelve' is descriptive, not contractual; engineering reads the table, not the AC count."* Counter: V12 audit pattern is that CI gates assert against AC text strings; "twelve" risks an `appendix_m_coverage_on_diff`-style literal mismatch. Even if no CI gate is currently wired against this string, the AC needs to enumerate §48.3.5's signals to satisfy §48.3.5 AC 7's transitive nightly-compute requirement. **P2 stands.**
- **D-48.3-005 (Appendix J S-numbering drift):** Hostile reviewer: *"Six wrong refs is a documentation hygiene issue, not unbuildable."* Counter: appendix-anchor-resolution is a §M.4 style hard constraint; six wrong refs in a single subsection is a pattern, not a typo. A junior engineer reading `§48.3.5 S4` for `ghost_bid_import_source_enum` will read the wrong row and emit instrumentation against the wrong loop. P2 stands but is borderline P1 because it is six instances, not one.
- **D-48.3-006 (curve, not scalar):** Hostile reviewer: *"Histograms are dashboard-renderable; 'peakiness' is a known statistical concept."* Counter: "peakiness" is colloquial; statisticians use kurtosis, but the signal name does not specify which. A second engineer would build a different scalar. P2 stands.
- **D-48.3-007 (relative-only S6 target):** Hostile reviewer: *"The Summary §3.4 source language is 'materially higher conversion'; '≥ 2×' is the spec's tightening."* Counter: "materially higher" + "≥ 2×" without a floor produces a paradox where degraded cold-start performance silently lowers the S6 alert bar. An absolute floor is the standard practice for ratio metrics. P2 stands.
- **D-48.3-008 (`ops_finance_admin` exclusion):** Hostile reviewer: *"Read access can be added later; not a v7.1.0 blocker."* Counter: §50.x role definitions are part of the audit's plan-gating dimension; missing role-on-surface is a P1 in §50 audits. Here it is bounded to a single dashboard read-list, so P2. Stands.
- **D-48.3-009 (outage handling):** Hostile reviewer: *"§42 incident framework covers third-party outages globally."* Counter: §42 covers the alert routing, not the dashboard render-during-stale-state behavior. Same critique applies to every dashboard surface; here it is bounded to the §48.3.3 cluster. P2 stands.
- **D-48.3-010 (residency):** Hostile reviewer: *"§41 residency contract applies to PII storage, not to aggregate metrics."* Counter: Org-level signal aggregation crosses residency boundaries; §41 explicitly references "no cross-region data movement" — aggregate signals are derived data and may or may not qualify. The spec is silent at §48.3, which is the defect. P2 stands.
- **D-48.3-011 (AE inline flags):** Hostile reviewer: *"AE inline flags are a documentation convention, not a contract."* Counter: CLAUDE.md §13 rule 4 states "If a source is underspecified and you author the missing detail, mark the addition as 'Authored Extension — requires human sign-off' and append a row to `_integration/AUTHORED_EXTENSIONS_LEDGER.md`." Two-step rule; only step 1 is satisfied. P2 stands.
- **D-48.3-012 (Solo example):** Cosmetic; P3 confirmed.
- **D-48.3-013 (negative network effects):** Hostile reviewer: *"§48.4 SIM covers the abuse side."* Counter: §48.4 is anti-spam (per-event abuse). HHI concentration / EEAT downgrade / KB staleness drag / listing flooding are aggregate compounding-decay modes that a per-event SIM does not catch. P2 stands.
- **D-48.3-014 (attribution windows):** Hostile reviewer: *"Each signal carries its own window; no taxonomy needed."* Counter: 30d / 60d / 90d / lifetime co-existing without a taxonomy is the same defect that §51.1 normalizes for event names. The Reverse-ETL pipeline build will produce diverging joins. P2 stands.
- **D-48.3-015 (firewall scope note):** Cosmetic; P3 confirmed.

No revisions to defect text required.

---

## Defects Promoted (15 rows)

See `DEFECT_LEDGER.md` append.

| defect_id | severity | class | scope |
|---|---|---|---|
| D-48.3-001 | P1 | network_effect_gap | Buyer-side network-effects inventory absent — no §48.3.6 mirroring §48.3.5 |
| D-48.3-002 | P1 | network_effect_gap | Cross-side network-effects inventory absent — no §48.3.7 enumerating bidirectional loops |
| D-48.3-003 | P2 | consistency_drift | §48.3.2 effect #5 cites "M2 entity (registered placeholder)" / "M14 entity (registered placeholder)" — both promoted to first-class entities |
| D-48.3-004 | P2 | acceptance_criteria | §48.3.4 AC #1 hardcodes "twelve §48.3.2 signals"; §48.3.5 expansion (7 primaries + secondaries + reinforcement-cycle metric) uncovered |
| D-48.3-005 | P2 | consistency_drift | Six Appendix J `§48.3.5 S<n>` cross-references misnumbered (calibration→S3 not S1; ghost-bid→S5 not S4; template→S7 not S6; inventory→S1 not S7; kb_citation→S2 not S1) |
| D-48.3-006 | P2 | network_effect_gap | §48.3.5 S3 secondary signal `s3_kb_entry_confidence_distribution_curve_per_seller_org` is a curve; "peakiness" undefined — unbuildable as written |
| D-48.3-007 | P2 | network_effect_gap | §48.3.5 S6 target ("≥ 2× cold-start rate") is purely relative; absolute floor missing — produces target-erosion paradox |
| D-48.3-008 | P2 | rbac | §48.3.3 Network Effects Dashboard read-access excludes `ops_finance_admin` despite revenue-leading-indicator content; asymmetric vs Growth Loop Operations Dashboard |
| D-48.3-009 | P2 | observability | §48.3 silent on Snowflake / PostHog / Datadog outage rendering; no `growth_signal_freshness_breach` event registered; only k-anonymity floor breach has render-refusal AC |
| D-48.3-010 | P2 | residency | §48.3 silent on §41 data-residency partitioning of network-effect signal aggregation; cross-region rollup behavior unspecified |
| D-48.3-011 | P2 | authored_extension | §48.3.5 inline "Authored Extension" flags (`seller_side_reinforcement_cycle_p50_days`; S4 Gartner/G2 baseline refresh cadence) lack `_integration/AUTHORED_EXTENSIONS_LEDGER.md` rows |
| D-48.3-012 | P3 | consistency_drift | §48.3.5 AC 9 free/paid-tier example enumerates 4 seller tiers (Free / Starter / Growth / Scale); missing Solo + Enterprise per §34.1.2 v7.1.0 canonical 6-tier list |
| D-48.3-013 | P2 | network_effect_gap | Negative network effects / disnetwork-effect monitoring absent (HHI category concentration; EEAT SEO penalty; KB-staleness drag; marketplace listing flooding) |
| D-48.3-014 | P2 | network_effect_gap | Attribution-window taxonomy missing — 30d / 60d / 90d / lifetime co-exist across §48.3.2 + §48.3.5 with no master table; Reverse-ETL join behavior diverges across dashboards |
| D-48.3-015 | P3 | firewall_leakage | §48.3.5 reinforcement-cycle closure paragraph (cross-Buyer-Org join) lacks Ops-rollup-only / no-Buyer-Console firewall scope note |
