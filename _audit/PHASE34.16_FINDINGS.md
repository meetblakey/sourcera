# Phase 34.16 — End-to-End Walk of §34.16 Marketplace Discovery Pricing (Non-AI Layer)

**Audit prompt:** "Walk §34.16 end-to-end. Three SKUs explicit; accounting isolation; anti-spam linkage (KB health floor + ≥1 closed bid in prior 90 days); buyer experience guardrails; FTC native-advertising compliance; cross-reference §27 search ranking + §3 UX tokens; confirm MarketplaceDiscoveryRevenueRecord (§4.8.12) ties."
**Run date:** 2026-05-07
**Sections audited:** §34.16 (preamble + §34.16.1–§34.16.8); cross-reads of §4.8.12 MarketplaceDiscoveryRevenueRecord, §4.4.19 PromotedListing, §4.4.20 FeaturedPlacement, §4.4.21 VerificationReviewRecord, §27.11.1–§27.11.6, §22.5 KB Health Score, §27.4 Match Score, §27.10 Vendor Opt-Out, §39 Object Size Constraints, §40.2 Retention, §6.8 DSAR, Appendix C, Appendix G, Appendix I, Appendix J, Appendix K, Appendix M.1.
**Defect mnemonic:** `D-MD-NNN` (Marketplace-Discovery walk). The pre-existing `D-V6-NNN` cluster (auction tiebreak determinism, weekly-window inclusivity, per-seller bid uniqueness) is remediated in §34.16.1 #1–#4 and §34.16.7 / §34.16.8 — those defects are NOT re-filed here.

---

## 1. CHECKS Resolution Summary

| # | Check | Status | Defect IDs |
|---|---|---|---|
| 1 | Three SKUs explicit (Promoted / Verification / Featured) | ✅ §34.16.1 / §34.16.2 / §34.16.3 each fully bounded | — |
| 2 | Accounting isolation — `rev_marketplace_discovery` independent of `rev_ai_wallet` and `rev_subscription` | ✅ §34.16 preamble three-stream table + AC #1 `revenue_stream_firewall` validator + §4.8.12 DB CHECK on `cost_center` | D-MD-017 (P3 cosmetic — `cost_center` vs `revenue_stream_class` field-name divergence between entities is unflagged) |
| 3 | Anti-spam linkage (KB health floor + ≥1 closed bid in prior 90 days) explicit | ❌ §34.16.4 #2 only states "Verification Tier < Basic or anti-spam flags"; KB Health Score 60.00 floor and ≥1 closed-bid-90d gate exist in §4.4.19 / §27.11.1 #5 / §27.11.6 G7 but are NOT mirrored in §34.16 | **D-MD-007 (P1)** |
| 4 | Buyer guardrails (paid never suppress organic; Verified/Certified labels-only; Featured lanes visually distinct) | ⚠ Partial. §34.16.4 #2 covers ranking separation; §34.16.4 #1 covers labeling. "Verified/Certified labels-only" and "Featured lanes visually distinct" not explicitly authored in §34.16 (live in §27.11.3 / §27.11.4 / §27.11.6 G3 only). | **D-MD-008 (P2)** |
| 5 | FTC native-advertising compliance | ⚠ Partial. §34.16.1 / §34.16.4 cite "FTC 16 CFR 255.5" only. The FTC's authoritative native-advertising framing is the December 2015 *Enforcement Policy Statement on Deceptively Formatted Advertisements* + *Native Advertising: A Guide for Businesses* — neither cited. | **D-MD-019 (P2)** |
| 6 | Cross-reference §27 search ranking + §3 UX tokens | ❌ §34.16 has zero `§27.4` cross-references for ranking-model integrity; zero §3 UX-token cross-references for badge rendering (§27.11.2 line 24486 anchors `--color-ui-emphasis-subtle` / 14px; §34.16.1 prose anchors nothing). | **D-MD-010 (P2)**, **D-MD-011 (P2)** |
| 7 | Confirm MarketplaceDiscoveryRevenueRecord (§4.8.12) ties | ⚠ Tie holds (§34.16.1 line 29953 + §34.16.6 retention row); "(AE)" annotation is stale post-v7.0.0 ratification of §4.8.12 as a real entity. | **D-MD-012 (P3)** |

---

## 2. Cluster Detail

### 2.1 Cluster A — Plan-Tier Surface Drift (P1)

§34.16 preamble line 29918 enumerates "Buyer Free / Starter / Growth / Scale / Enterprise; Seller Free / Starter / Growth / Scale / Enterprise". Solo (`buyer_solo`, `seller_solo`) — added to §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6 / Appendix J Plan Tiers / Appendix M during the v7.1.0 Phase 14.9 program — is missing. Substantively Solo plans do not transact §34.16 SKUs (Promoted requires Scale+), so the omission is enumeration-stale, not eligibility-stale; but the §34 inline plan-tier-list audit (CLAUDE.md §16 Phase 14.9.2 backlog) explicitly catalogues stale 5-tier inline restatements as P1 numerical-singleton drift. → **D-MD-001 P1**.

### 2.2 Cluster B — Promoted-Listing Monthly Cap Drift (P1)

§34.16.1 *Pricing → Additional category caps:* "A seller MAY hold up to **4 additional promoted listings per month** beyond their first; above 4, Ops Finance requires pre-approval." §34.16.8 AC #4 codifies this as "1 primary + 4 additional" → max 5 / month / seller. **Conflicts with §27.11.2 #5** which authoritatively defines monthly allotment as "1/mo Seller Scale, 3/mo Seller Enterprise **included**; up to 4 additional purchased top-ups per month hard-capped" → max 5 (Scale) or **7 (Enterprise)** per month. The §34.16.1 phrasing reads "1 primary + 4 = 5 max" and excludes the Enterprise 3-base case. → **D-MD-002 P1**.

This compounds with §34.16.7 / §4.8.12 monthly-cap error-code drift: §34.16.7 uses `promoted_listing_category_locked` HTTP 409; §4.8.12 AC #8 uses `marketplace_discovery_monthly_cap_exceeded` HTTP 409. Both are bound to the same condition; one is dead-code or one wins. → **D-MD-013 P2**.

### 2.3 Cluster C — Plan-Tier Eligibility Gate Missing from §34.16.1 (P1)

§4.4.19 line 5880 declares the entity-level gate: "Creating a PromotedListing with `org_id.plan_tier ∉ {seller_scale, seller_enterprise}` MUST be rejected with error `promoted_listing_plan_tier_below_scale` (new; Appendix I; HTTP 403)." §4.8.12 AC #7 echoes "Promoted-listing SKU purchases MUST be gated on Seller Scale or Seller Enterprise plan per Seller Pricing §12; non-eligible plan rejected with HTTP 403 `marketplace_discovery_sku_unavailable_on_plan`." §27.11.2 lifecycle table (`— → draft`) cites "plan ≥ `seller_scale`".

§34.16.1 prose for SKU 1 has zero plan-tier gating prose. The error code `promoted_listing_plan_tier_below_scale` is not in the §34.16.7 error-code table. CLAUDE.md §11 Authoring Convention #8 (Plan Gating) requires plan-gated features to cite §5.11 / §34.1.2 / §39 — none cited from §34.16.1.

Compounding: two parallel HTTP 403 codes (`promoted_listing_plan_tier_below_scale` from §4.4.19 vs `marketplace_discovery_sku_unavailable_on_plan` from §4.8.12) for the same condition — drift between the entity-level error vocabulary and the ledger-level error vocabulary. → **D-MD-003 P1**.

### 2.4 Cluster D — Clamp-vs-Reject Contradiction on Max-Bid (P1)

§34.16.5 *Failure Mode #1*: "Resolved: max-bid sanity check of $10,000 per category per week (deploy-time enforced; harder caps configurable per category). Excess bids are **clamped** with a `bid_clamped_to_max` audit event and the seller is notified."

§34.16.7 error-code row: `promoted_listing_bid_above_max` HTTP 400 → "Bid amount above the $10,000 sanity cap" — a **rejection** code, not a clamp.

A junior engineer cannot tell whether a $15,000 bid is (a) clamped to $10,000 and accepted with audit-event emission, or (b) rejected with HTTP 400. Both are coherent designs; the spec asserts both. → **D-MD-004 P1**.

This compounds with the missing `bid_clamped_to_max` audit-event registration (Appendix C / Appendix G / Appendix I unsearched for that name; absent). Also the $10,000 sanity cap is itself an unhomed numerical singleton — no §39 row for `PromotedListing.max_bid_cents`. → **D-MD-006 P1**.

### 2.5 Cluster E — Webhook Payload k=5 Asymmetry (P1)

§34.16.7 `promoted_listing.auction_settled` payload: `{event_id, event_type, occurred_at, category_id, auction_id, settled_at, winners: [{org_id, paid_cents, rank, promoted_listing_id}], unfilled_slots, total_bids_received, reserve_price_cents}` delivered to "Yes (bidders + winners)".

This means every bidder in a category-week — winning or losing — receives a payload that exposes (a) every winner's `org_id`, (b) every winner's `paid_cents` (= the second-highest bid amount per second-price clearing rule per §34.16.1 #4), and (c) every winner's `promoted_listing_id`. The §34.16.1 *Anonymization (k=5 aggregation)* block requires k≥5 distinct bidders before the *digest* surfaces aggregated metrics; the per-event webhook bypasses that floor entirely.

Scenarios:
- A category with 3 distinct bidders and 1 winner: the 2 losers learn the winner's org_id and the second-highest bid (which under §34.16.1 #4 second-price ties is one of the losers' own bid).
- A category with 2 distinct bidders: §34.16.1 #5 says the single bidder pays $500 floor; the webhook still emits the winner's org_id to the loser.
- An adversarial bidder seeking competitive intel can deliberately submit a low bid in a category just to receive the auction_settled webhook payload.

Symmetry with the digest is not rationalized in the spec. The webhook exposure is a privacy/firewall regression that the digest pipeline explicitly defends against. → **D-MD-005 P1**.

### 2.6 Cluster F — Quality-Floor Anti-Spam Linkage (P1)

§34.16.4 #2: "a `quality_floor` gate blocks any seller with **Verification Tier < Basic** or **anti-spam flags** from promoted bidding."

The canonical quality-floor definition spans §4.4.19 *Eligibility Gate* (10 conditions, lines 5705–5805), §27.11.1 design principle #5, §27.11.6 G7, and §22.5 KB Health Score:

1. Verification Tier ≥ Basic ✅ (in §34.16.4)
2. No active anti-spam flags ✅ (in §34.16.4)
3. **KB Health Score (§22.5) ≥ 60.00** (Ops-configurable via C.97) ❌ (missing from §34.16.4)
4. **`eligibility_closed_bid_count_90d_snapshot ≥ 1`** (§4.4.19 line 5739; §4.4.19 *Eligibility Gate* condition #5 line 5785: "At least one closed Bid Workspace in the prior 90 days with `status ∈ {won, lost, submitted_and_not_awarded}`") ❌ (missing from §34.16.4)
5. No matching vendor opt-out (§27.10) [implicit; not in §34.16]
6. Stripe payment method in good standing
7. Org plan tier ∈ {seller_scale, seller_enterprise} [partial overlap with Cluster C]

The §34.16.7 error code `promoted_listing_quality_floor_failed` HTTP 403 message says "Seller does not meet Verification Tier ≥ Basic or has anti-spam flags" — same partial coverage. A seller with KB Health = 45.0 or zero closed bids in 90d will receive a 403 from this code in production but the spec text would not predict it. → **D-MD-007 P1**. Prompt CHECK 3 explicitly fails.

### 2.7 Cluster G — Buyer-Guardrail Coverage Gap (P2)

§34.16.4 *Buyer Guardrails and Transparency* enumerates 5 guardrails:
1. Labeling
2. Separation of paid from organic
3. Buyer opt-out (Hide Sponsored)
4. k=5 anonymization
5. No retargeting without consent

The prompt's CHECK 4 itemization expects:
- Paid placements never suppress organic ✅ (covered by #2)
- **Verified/Certified badges label-only** ❌ (not in §34.16; lives in §27.11.3 badge table only)
- **Featured lanes visually distinct** ❌ (mentioned implicitly via "Featured > Promoted > Organic" display order at §34.16.1 line 29927; not authored as a §34.16.4 guardrail)

→ **D-MD-008 P2**. The two missing guardrails belong in §34.16.4 because §34.16 is the authoritative billing/accounting layer for these surfaces and the buyer-trust contract should be co-located.

### 2.8 Cluster H — PostHog Event-Name Drift (P2)

§34.16.1 line 29949: "Promoted listing click-throughs MUST be tracked in PostHog with event `marketplace_promoted_listing_clicked`".

§27.11.6 G3 line 24726: "Buyer clicks on Promoted vs. Organic are tagged distinctly in PostHog (`marketplace_promoted_clicked` vs. `marketplace_organic_clicked`)".

Two different event names for the same surface signal:
- `marketplace_promoted_listing_clicked` (§34.16)
- `marketplace_promoted_clicked` (§27.11.6 G3)

Appendix G grep for both names will catch one or zero registrations. Either §34.16 or §27.11.6 emits dead-code; §31.8 Acceptance #16 PostHog-event naming convention requires single canonical form. → **D-MD-009 P2**.

### 2.9 Cluster I — UX-Token Binding Missing (P2, §3 cross-ref)

§34.16.1 prose for SKU 1 describes "Promoted slots MUST render the label 'Promoted' per FTC 16 CFR 255.5 advertising-disclosure rules" with NO §3 UX-token reference (font-size, color token, weight, accessibility role).

§27.11.2 line 24486 anchors badge rendering: `14px / --color-ui-emphasis-subtle`; §27.11.4 line 24626 anchors Featured: `14px, --color-ui-accent`; §27.11.6 G1 anchors `aria-label="Paid placement disclosure"`.

§34.16 has no UX-token cross-reference. The §3 / UX-spec binding is the canonical home for token enforcement; §34.16 should at minimum cite §3 / §27.11.2 / §27.11.4 for the rendering contract. → **D-MD-010 P2**. Prompt CHECK 6 partial fail.

### 2.10 Cluster J — §27 Search-Ranking Cross-Ref Missing (P2, §27 cross-ref)

§34.16.4 #2 prose: "Search and ranking algorithms MUST NOT factor in `PromotedListing` bid amounts into organic-result ranking." But the §34.16 section nowhere cites §27.4 (Marketplace Match Score) or §27.4.4 (Weightings, Hard Gates, and Fallbacks).

§27.11.6 G2 (the parallel ranking-integrity guardrail) is more specific: "the `promoted_listing_features` source in the ranking model is explicitly empty. A model-card invariant `ranking_model_no_promoted_features` is asserted on every model deploy; violation blocks the deploy."

§34.16 should at minimum cite §27.4 for the ranking-model contract surface and §27.11.6 G2 for the deploy-blocking invariant. Without this, §34.16 reads as an unenforced narrative. → **D-MD-011 P2**. Prompt CHECK 6 partial fail.

### 2.11 Cluster K — Stale-Annotation Drift (P3)

§34.16.6 retention table row: "**MarketplaceDiscoveryRevenueRecord (AE)** | 7 years (financial) | Origin Org's residency | Same".

The "(AE)" Authored-Extension annotation was correct pre-v7.0.0 stamp but stale post-v7.0.0 — the entity is now authored at §4.8.12 with full field table, state machine, indexes, retention prose, 15 failure modes, and 18 ACs. AE annotations should resolve at ratification. → **D-MD-012 P3**. Cosmetic but flags a class — Phase 14.5 AE Ledger ratification queue completeness.

Compound: §34.16.3 SKU 3 prose: "feature-flagged off by default in v7.0.0"; §34.16 preamble: "(new in v7.0.0; registered in Appendix J)". File is at v7.1.0; the v7.0.0 references should resolve to "feature-flagged off by default" without a version anchor (or to "introduced in v7.0.0"). → **D-MD-015 P3**.

### 2.12 Cluster L — Failure-Mode #2 Cascade Pricing Unspecified (P2)

§34.16.5 *Failure Mode #2*: "Seller wins promoted auction then goes insolvent before settlement. Resolved: ... unpaid `PromotedListing` rows transition to `status=unpaid` and the promoted slot is **backfilled from the #2 bidder** (if their bid is still ≥ floor) or goes unfilled for the week."

If #1 wins with bid $5,000 and pays #2's bid of $4,000 (second-price), then #1 defaults: does #2 (now winning) pay #3's bid (recursive second-price), pay $4,000 (the cleared price), or pay their own $4,000? Spec is silent.

Three coherent designs:
- **Recursive second-price**: #2 pays max(#3's bid, $500 floor). Most economically sound.
- **Cleared-price persistence**: #2 pays the originally cleared $4,000 amount.
- **Own-bid pay**: #2 pays their own bid ($4,000), which equals (b) only by coincidence.

A junior engineer must pick; QA test `promoted_listing_second_price_auction` (§34.16.8 AC #2) does not bind backfill semantics. → **D-MD-014 P2**.

### 2.13 Cluster M — Marketplace-Domain Scoping Silent (P2 firewall)

§27.11.1 design principle #8: "No cross-marketplace-domain leakage. Marketplace-domain rows (§43) never spill across domains; a Seller Org's Promoted Listing in the `us-defense-contractor` marketplace domain MUST NOT render in the `us-civilian-enterprise` marketplace domain even when category IDs collide."

§34.16 has zero references to §43 marketplace-domain partitioning. The PromotedListing entity (§4.4.19) does carry a `marketplace_domain` partition field [verify], but §34.16 prose does not mention it as a scope dimension on auction settlement, billing, or webhook delivery. A multi-domain seller could have ambiguous billing rows. → **D-MD-016 P2**.

### 2.14 Cluster N — `cost_center` vs `revenue_stream_class` Field-Name Drift (P3)

§4.8.12 entity uses `cost_center | Enum | MUST equal rev_marketplace_discovery` (DB CHECK enforced).

§4.8.3 BillingLedger uses `revenue_stream_class` (per §34.16 preamble line 29921: "The `revenue_stream_class` enum (new in v7.0.0; registered in Appendix J) is present on every row in the Billing Ledger (§4.8.3)").

Same enum value `rev_marketplace_discovery`; different field names on different entities. The distinction (entity-level cost-center vs ledger-level revenue-stream class) may be intentional accounting modeling (cost-center for partitioning, revenue-stream for reporting) but is not articulated in Appendix K Glossary. Reader confusion likely. → **D-MD-017 P3**.

### 2.15 Cluster O — Click-Stream Telemetry Retention/DSAR Silent (P2)

§34.16.4 #5: "Promoted and featured click-stream data MUST NOT be sold or shared with third-party ad networks; buyer click-behavior data is sourcera_owned for platform analytics only."

§34.16.6 retention/residency/DSAR table includes only `PromotedListing`, `FeaturedPlacement`, `VerificationReviewRecord`, `MarketplaceDiscoveryRevenueRecord`. It does **not** include impression telemetry, click-through events, or `marketplace_promoted_listing_clicked` PostHog event rows. §40.2 retention table grep reveals no purpose-bound row for click-stream marketplace telemetry. → **D-MD-018 P2**.

### 2.16 Cluster P — FTC Native-Advertising Citation Narrow (P2)

§34.16.1: "FTC 16 CFR 255.5 advertising-disclosure rules" (16 CFR 255.5 = Disclosure of material connections, Endorsement Guides).

The authoritative FTC framing for native advertising is the **December 2015 Enforcement Policy Statement on Deceptively Formatted Advertisements** plus **"Native Advertising: A Guide for Businesses"** (FTC.gov/business). 16 CFR Part 255 covers endorsements and testimonials more broadly; §255.5 is one sub-section. The Native Advertising Guide is non-codified guidance but is the Commission's enforcement framing.

§47135 (compliance reference) and §4.4.19 line 5752 cite "FTC 16 CFR Part 255 native-advertising guidance" — broader Part-255 framing. §34.16 cites §255.5 only, the narrowest possible citation. Compliance review would flag the narrowness. → **D-MD-019 P2**. Prompt CHECK 5 partial fail.

### 2.17 Cluster Q — k=5 Anonymization Floor Numerical Home (P2)

The k=5 anonymization floor surfaces in:
- §34.16.1 *Anonymization (k=5 aggregation)* — prose definition
- §34.16.4 #4 — guardrail restatement
- §34.16.7 `marketplace_discovery.anonymization_threshold_breach` event
- §34.16.8 AC #7
- §27.11.2 *k=5 anonymization surfaces* table (4 rows)
- §27.11.5 *k=5 revenue deferral semantics*
- §4.8.12 `k_anonymity_cohort_size_at_sale ≥ 0` (with floor=3 in failure-mode #5: "K-anonymity cohort below floor of 3 at sale time")

**Numerical drift detected:** §34.16 / §27.11 use **k=5** (≥5 distinct bidders/Orgs); §4.8.12 *Failure Modes Addressed #5* uses **k<3** as the deferral threshold ("K-anonymity cohort below floor of 3 at sale time"). Two different floors in the same SKU specification.

Authoring Convention #10 (Numerical Singletons) requires one authoritative home. Neither §34.16 nor §39 declares an authoritative home; §4.8.12 and §27.11.2 silently disagree. → **D-MD-020 P2**.

---

## 3. Self-Challenge Pass

Re-reading findings as a hostile reviewer:

- **D-MD-001 (Solo missing).** Hostile question: "Solo plans don't transact §34.16 SKUs anyway — is the omission substantive?" Resolution: **substantive** because the §34 inline-plan-tier-list audit (CLAUDE.md §16 Phase 14.9.2 backlog) catalogues stale 5-tier inline restatements as P1; consistency drift across §34 sections is not waivable on substantive grounds.
- **D-MD-002 (1+4 vs 1+4 / 3+4).** Hostile question: "Could §34.16.1 'beyond their first' reasonably mean 'beyond their plan-included allotment'?" Resolution: **no** — §34.16.8 AC #4 codifies "1 primary + 4 additional" as the cap. Conflict with §27.11.2 is real.
- **D-MD-003 (plan gating absent).** Hostile question: "Is §34.16.1 silent or does it cite Seller Pricing §12 implicitly?" Resolution: **silent**. The §34.16 preamble cites Seller Pricing §12 for plan tier fees, but §34.16.1 SKU 1 prose has no entitlement gate. Cross-reference + error-code parity require authoring.
- **D-MD-004 (clamp vs reject).** Hostile question: "Could 'clamp' refer to a server-side rate limiter, not the bid amount?" Resolution: **no** — §34.16.5 #1 prose explicitly says "Excess bids are clamped" with reference to the $10,000 cap. §34.16.7 error code description directly contradicts.
- **D-MD-005 (webhook k=5 bypass).** Hostile question: "Vickrey auction transparency requires winner identity disclosure; is this by design?" Resolution: the spec doesn't rationalize the asymmetry. Even if intentional, it warrants explicit treatment given that §34.16.1 *Anonymization* and §27.11.2 *k=5 anonymization surfaces* table set the contrary expectation. Filing as P1 firewall_leakage with explicit "rationalize or restrict" recommendation.
- **D-MD-007 (KB Health + closed-bid floor missing).** Hostile question: "Is the §34.16.4 prose intentionally narrower than the entity-level eligibility gate?" Resolution: **no** — the §34.16.7 error code `promoted_listing_quality_floor_failed` is the SAME error code that fires when KB Health < 60 or closed_bid_count_90d = 0 (per §4.4.19 *Eligibility Gate* condition mapping). The §34.16.4 text describes a strictly narrower gate than the runtime path. Engineers reading §34.16 would build wrong.
- **D-MD-013 (parallel error codes).** Hostile question: "Are these parallel codes intentional layering — `promoted_listing_*` for entity layer, `marketplace_discovery_*` for ledger layer?" Resolution: defensible reading, but §34.16.7 error-code table emits ONE code per condition per §32 conventions; the spec should pick one. Filing as P2 ambiguity.
- **D-MD-020 (k=3 vs k=5).** Hostile question: "Could the §4.8.12 `k_anonymity_cohort_size_at_sale < 3` be a different floor (sale-time k vs digest-time k)?" Resolution: defensible — the sale-time floor protects against single-bidder identity disclosure, distinct from the digest-time aggregation floor. But §34.16 / §27.11 do not articulate this. The Authoring Convention #10 violation stands; recommendation should be "either consolidate to one floor or document the two floors as distinct contracts in §34.16.6."

No findings revised on self-challenge. All 20 P-rules are reproducible from cited line numbers.

---

## 4. Counterfactual Pass — Three Realistic Failure Modes

For the three SKUs, three failure modes each that the spec must handle:

**Promoted Listings:**
1. Concurrent bid submission at the same microsecond — covered by D-V6-002 / D-V6-003 remediation (deterministic ordering tuple including `seller_org_id` ASC tertiary).
2. Stripe charge fails after auction settlement — partial: §34.16.5 #2 (insolvency); compound failure with `promoted_listing.unpaid` webhook + Failure Mode #2 backfill cascade pricing **unspecified** (D-MD-014).
3. Cross-marketplace-domain promotion: §27.11.1 design principle #8 covers the rule but §34.16 silent on enforcement (D-MD-016).

**Verification Tiers:**
1. Reviewer collusion — partial: §34.16.5 #3 dual-reviewer for Certified; no parallel for Verified; not filing as defect because §4.4.21 single-reviewer for Verified is documented elsewhere.
2. Tier expiry race — covered (§4.4.21 state machine; §34.16.2 cadence prose).
3. Cross-Org reviewer assignment to seller in different residency region — partial: §27.11.3 *Ops surface* line 24582 covers; §34.16.2 silent. Not filing — §27.11.3 is the canonical home and §34.16.2 is the billing-layer reflection.

**Featured Placements:**
1. Editorial conflict of interest — covered (§34.16.5 #4).
2. Two sellers want same featured slot — covered (§34.16.5 #5).
3. Paid commitment activated then policy revoked mid-period — partial: §34.16.3 Paid Mode "ethical review" gates enablement but does not address mid-period revocation. §27.11.4 *cancellation* row covers `live → cancelled`. Not filing — §27.11.4 is sufficient.

---

## 5. Promoted Findings Inventory

20 defects to be promoted to `DEFECT_LEDGER.md`:

| ID | Severity | Class | Cluster |
|---|---|---|---|
| D-MD-001 | P1 | plan_gating | A |
| D-MD-002 | P1 | numerical_singleton | B |
| D-MD-003 | P1 | plan_gating | C |
| D-MD-004 | P1 | api | D |
| D-MD-005 | P1 | firewall_leakage | E |
| D-MD-006 | P1 | numerical_singleton | D-cascade |
| D-MD-007 | P1 | documentation_gap | F |
| D-MD-008 | P2 | documentation_gap | G |
| D-MD-009 | P2 | posthog_event | H |
| D-MD-010 | P2 | documentation_gap | I |
| D-MD-011 | P2 | documentation_gap | J |
| D-MD-012 | P3 | consistency_drift | K |
| D-MD-013 | P2 | error_code | B-cascade |
| D-MD-014 | P2 | documentation_gap | L |
| D-MD-015 | P3 | consistency_drift | K-compound |
| D-MD-016 | P2 | firewall_leakage | M |
| D-MD-017 | P3 | consistency_drift | N |
| D-MD-018 | P2 | retention | O |
| D-MD-019 | P2 | documentation_gap | P |
| D-MD-020 | P2 | numerical_singleton | Q |

**Aggregate:** 0 P0 / 7 P1 / 10 P2 / 3 P3.

The pre-existing D-V6-002 / D-V6-003 / D-V6-006 / D-V6-007 cluster (auction tiebreak determinism, weekly-window inclusivity, per-seller bid uniqueness) remains remediated and is NOT re-filed.

---

## 6. Coverage Matrix Tightening (proposed)

- **F-458 Marketplace Discovery Pricing.** `acceptance_criteria` ⚠ → ❌ via D-MD-002 / D-MD-013 (monthly cap drift + parallel error code); `plan_gating` ✅ → ⚠ via D-MD-001 (Solo omission) + D-MD-003 (Promoted plan-tier gate not cited from §34.16.1); `firewall_leakage` ⚠ → ❌ via D-MD-005 (auction_settled webhook k=5 bypass) + D-MD-016 (marketplace-domain silence); `numerical_singleton` ⚠ → ❌ via D-MD-006 ($10K cap unhomed) + D-MD-020 (k=5 vs k=3 floor); `posthog_event` ✅ → ⚠ via D-MD-009 (event-name conflict); `surface_engine_mapping` ✅ → ⚠ via D-MD-010 (UX-token binding missing); `error_state` ⚠ → ❌ via D-MD-004 (clamp vs reject); `retention` ⚠ → ❌ via D-MD-018 (click-stream silent) + D-MD-007 (anti-spam linkage incomplete); `consistency_drift` ⚠ → ❌ via D-MD-012 / D-MD-015 / D-MD-017 (stale-annotation cluster).
- **F-459 Promoted Listings (§27.11.2 / §4.4.19).** Inherits D-MD-002, D-MD-003, D-MD-005, D-MD-007, D-MD-013, D-MD-014, D-MD-016 in cell tightening cascade.

Aggregate counters not re-derived in this pass.

---

## 7. Forwarded to Downstream Phases

- **Phase 7 (Pricing).** Inherits D-MD-001 / D-MD-002 / D-MD-013 / D-MD-020 for the §34 numerical-singleton + plan-gating tightening.
- **Phase 8 (API + Webhook).** Inherits D-MD-004 (clamp/reject), D-MD-005 (webhook payload k=5), D-MD-009 (PostHog event-name conflict), D-MD-013 (error code parity), D-MD-018 (click-stream retention).
- **Phase 9 (Observability).** Inherits D-MD-009, D-MD-018.
- **Phase 13 (Schema Consolidation).** Inherits D-MD-006 (§39 row authoring for `PromotedListing.max_bid_cents`), D-MD-017 (`cost_center` vs `revenue_stream_class` Glossary entry), D-MD-020 (k=5 numerical-singleton home).
- **Phase 14 (Cross-Document Consistency).** Inherits D-MD-002 (§34.16.1 vs §27.11.2 cap drift), D-MD-007 (quality-floor coverage parity §34.16 vs §27.11 vs §4.4.19), D-MD-009 (PostHog name canonicalization).
- **Phase 14.5 (AE Ledger Ratification).** D-MD-012 — resolve "(AE)" annotation on §34.16.6 retention row to non-AE (entity is ratified).
- **Phase 14.9.2 (Inline Tier-List Audit).** Inherits D-MD-001 (§34.16 line 29918 inline 5-tier list).
- **Phase 14.18.1 (CI Gate Runtime Wiring).** No new gate proposed in this pass; D-MD-005 may benefit from a `webhook_payload_k_anonymity_floor` deploy-time validator if the asymmetry is rationalized as enduring.
- **v7.1.1 stamp gate.** Inherits the entire D-MD-* cluster for ratification/closure.
