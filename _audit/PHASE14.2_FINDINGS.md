# Phase 14.2 — Master Spec ↔ Seller Pricing Strategy v3 Cross-Doc Walk Findings

**Date.** 2026-05-12.
**Auditor posture.** Senior technical product strategist + staff engineer; Opus-grade depth; non-destructive audit.
**Source documents read end-to-end.** `Sourcera_Seller_Pricing_Strategy.md` v3 (72 KB; 918 lines); `Sourcera_Master_Spec.md` v7.1.0 §34 (Pricing, ~3,900 lines from §34.1 to §34.20.16), §22.18–§22.20 (Seller KB Value Capture + Compressed Surface + Maya Surface Abstraction), §27.10 (Vendor Opt-Out Registry — NOT Verification Tiers), §27.11 (Marketplace Discovery Surfaces including §27.11.3 Verification Tiers), §34.13 (Buyer-Funded Pro Trial Seat M17), §34.16 (Marketplace Discovery Pricing), §34.19 (Seller Plan Upgrade Carry-Over Guarantee), §48.1.5–§48.1.8 (Hero Moment + Activation Metric + Conversion Moments + Extended AC), §48.2.2 (Loop L1 Vendor-Invite-Creates-Account), §48.3.5 (Seller-Side Compounding Network Effects), §48.7 (M14–M17 Cross-Console & Seller Conversion Mechanics), §48.8 (Seller Hero Moment & Onboarding Anti-Patterns), §49.1 (Seven-Stage Seller Onboarding Pipeline).
**Authoritative outputs.** Defect ledger entries D-14.2-001 through D-14.2-011 (11 rows; 5 P1 + 5 P2 + 1 P3); CONSISTENCY_DELTA.md "Seller Pricing v3" section.

---

## 1. Walk Methodology

The walk traversed SPS v3 in document order — §1 through §22 — and for each substantive commitment located the corresponding authoritative home in the Master Spec. For each pair, three checks: (a) the numerical / structural / behavioral content reconciles; (b) the spec is the single authoritative home (no inline restatement in SPS); (c) the spec is at least as complete as the SPS v3 narrative (no narrative-vs-spec coverage gap).

Defects were filed only when a gap met all of: (i) the SPS v3 commitment is materially load-bearing for the v3 seller launch; (ii) the spec is silent on the dimension OR contradicts SPS narrative; (iii) the gap is not already filed in DEFECT_LEDGER.md (cross-checked against D-AS-NNN, D-PT-NNN, D-PXC-NNN, D-CONS-NNN, D-V6-NNN, D-HM-NNN, D-13V-NNN, D-14.1-NNN clusters).

## 2. Pre-Existing Defect Cross-Check (Scope De-duplication)

Phase 14.2 inherits the following open SPS v3 ↔ Master Spec drift defects and does NOT re-file:

| Pre-filed defect | Severity | Scope it covers |
|---|---|---|
| D-PT-002 | P1 | SPS v3 §3 KB Bootstrap Year-1 entitlement drift vs §34.1.2 + §34.14.1 row 4 |
| D-PT-003 | P2 | SPS v3 §5.4 Seller Solo per-bid KB-persistence clock-reset behavior omission |
| D-PT-005 | P2 | SPS v3 §5.4 Solo per-bid FX-rate-locking timestamp undefined |
| D-PT-006 | P2 | SPS v3 §4 Seller integrations (Core vs All) tier-stepping undefined |
| D-PT-008 | P2 | SPS v3 §9 Seller Enterprise Audit Export API / DPA rows missing from §34.1.2 |
| D-AS-002 | P1 | Enterprise volume-discount band inline restatement in SPS v3 §9 |
| D-AS-005 | P1 | §34.18.3 Year-1 seller plan-mix omits Solo (SPS v3 §14 commits 25/25/25/15/8/2 mix) |
| D-AS-006 | P3 | §34 preamble cites BPS v2 / SPS v2 citation key |
| D-AS-011 | P2 | §34.14.1 5% infra overhead vs SPS v3 §13 "Convex compute ≈ 3% of AI cost" |
| D-AS-013 | P3 | §48.8.6 SPS §3 annual-ratio cite (pricing-team cite confirmation) |
| D-PXC-001 | P1 | Retired "MS §2.X" citations in §34 (including SPS v3 §10 / §11 sibling cite drift) |
| D-PXC-002 | P2 | §34.1.2 Direct Invite from Cohort cites `SPS §3 / §7`; not in SPS v3 §7 or §8 |
| D-PXC-003 | P1 | §34.14.1 row 4 `kb_bootstrap` Plan Gating triple-conflict vs §34.1.2 + SPS v3 |
| D-PXC-004 | P1 | §34.14.1 row 8 `seller_page_enrichment` 36×–80× drift vs §34.1.2 + SPS v3 |
| D-PXC-005 | P1 | §34.14.1 row 10 `match_score_numeric` Free/Starter granted vs §34.1.2 Growth+ gate |
| D-PXC-006 | P2 | §34.14.1 row 6 grants Free "50 lifetime" page-processing vs §34.1.2 / SPS v3 0 sources |
| D-PXC-007 | P2 | §34.14.1 row 1 cites "Free = 25 lifetime (§34.1.2)" but §34.1.2 is wallet-funded |
| D-PXC-008 | P3 | §34.15.1 cites SPS §10 (v2 numbering); SPS v3 row is §11 |
| D-PXC-009 | P1 | §34.16.1 Promoted Listing auction missing plan-tier eligibility gate |
| D-PXC-010 | P1 | §34.16.2 vs SPS v3 §13.2 Verification Tier qualification criteria diverge |
| D-PXC-011 | P1 | §34.16.2 narrative "all plans" vs SPS v3 §13.2 + §34.1.2 Solo+/Growth+ gating |
| D-PXC-012 | P3 | §34.16.3 reserves paid_commitment Featured Placement vs SPS v3 §13.3 "Strictly editorial" |
| D-PXC-013 | P1 | §34.17.1 row 13 cites retired "Summary §6.28.2"; SPS v3 §15.1 + §17.2 are canonical |
| D-PXC-016 | P2 | §34.18.6 Scenario A/B/C ARR-target naming collides with SPS v3 §14 per-cohort naming |
| D-PXC-019 | P3 | SPS v2 → v3 section-number citation drift |
| D-PXC-020 | P3 | §34.18.1 source-col cites "SPS §11; BPS §11" v2 numbering |
| D-V6-001 | P0 | `broadcast_to_vendor_count` Target Account leakage (Marketplace Discovery surface) |
| D-V6-002 / -003 | P1 / P2 | Promoted Listing auction tiebreak determinism |
| D-V6-005 | P2 | §27.10.3 enforcement allowlist missing §27.4.12 Match Score API surfaces |
| D-V6-006 / -007 | P3 / P2 | Bid-window close instant inclusivity; multiple-bid-per-seller-per-window |

Phase 14.2's net-new defects (D-14.2-001 through D-14.2-011) are the SPS v3 narrative-vs-spec coverage drift items that the above clusters do not address. DEFECT_LEDGER.md `links` column on each new D-14.2-NNN row cites the relevant pre-filed defect.

## 3. Section-by-Section Walk (Findings → Defect Mapping)

### SPS v3 §0 What This Document Decides → No new defects

Statement of monetization framework; ✅ reconciles against §34 preamble.

### SPS v3 §1 The Core Principle (Free invited participation; paid leverage) → No new defects

Monetization stance table reconciles against §34.2.3 #3 (Vendor response to invited bid is unconditionally free on Seller Free) + §34.1.2 cells.

### SPS v3 §2 Strategic Decisions (8 + 2 v3) → No new defects

| Decision | Spec home | Status |
|---|---|---|
| §2.1 Separate seller plan track | §34.1.2 / §34.2.2 | ✅ |
| §2.2 Outcome-based accounting, value = cost × 10, ≥88% margin | §34.3.1 / §34.3.3 / §34.18.1 | ✅ (D-AS-011 P2 5%/3% infra overhead pre-filed) |
| §2.3 Monetize automation; never participation | §34.2.3 #3 | ✅ |
| §2.4 EOI cap at Starter (10/mo); Growth+ unlimited | §34.1.2 EOI row | ✅ |
| §2.5 Numeric Match Scores at Growth+ | §34.1.2 | ✅ (D-PXC-005 P1 pre-filed for rate-card drift) |
| §2.6 KB as highest-leverage monetization (3 capabilities: Bootstrap / Firecrawl / First-Pass) | §34.1.2 + §34.14.1 + §22 | ✅ (D-PT-002 + D-PXC-003 cover Bootstrap allowance drift) |
| §2.7 Published profile on Free | §34.2.3 #4 | ✅ |
| §2.8 Seller Solo tier ($49/mo annual / $59/mo monthly OR $199/bid) | §34.1.2 + §34.2.2 + §34.2.5 | ✅ |
| §2.9 Seller Solo invisible AI consumption | §44.6 + §34.10.3 + §44.6.1 + Appendix M | ✅ |

### SPS v3 §3 Plan Architecture at a Glance → No new defects

Every cell in the SPS v3 §3 6-column × 30-row plan-architecture table reconciles with §34.1.2 cross-cells (verified end-to-end). The "Vendor response to invited bids: Free forever" framing is authoritative at §34.2.3 #3. Direct Invite from Cohort row's `SPS §3 / §7` cite is pre-filed as D-PXC-002. Volume-band restatement is pre-filed as D-AS-002.

### SPS v3 §4 Seller Free — No new defects

$0, 1 concurrent invited bid, $5/mo AI budget hard cap, 50 KB entries, 1 lifetime KB Bootstrap, Published Seller Profile day one, Basic verification only, 1 SellerSoftware entity, 3 Capability Declarations — all reconcile to §34.1.2 / §34.10.4 / §27.11.3 / §34.16.2.

### SPS v3 §5 Seller Solo Plan → 2 new defects (D-14.2-003, D-14.2-008); 4 pre-filed cross-references

- §5.1 Pricing options ✅ §34.2.2 / §34.2.5
- §5.2 Included ✅ §34.1.2 / §34.2.5 / §27.11.3 / §22.x
- **§5.3 Solo→Starter triggers ⚠** — the "**≥ 3 throttle events / 30 day window (subscription)** OR **hits envelope on a single bid (per-bid)**" trigger has no engine-implementable home in spec → **D-14.2-003 (P1)**. Other triggers (2nd concurrent bid, first EOI attempt, 4th Capability Declaration, KB ceiling at 250, 2nd Firecrawl source, Seller Page Enrichment, Numeric Match Scoring, CRM Sync, Promoted placements, Enterprise controls) reconcile to §34.1.2.
- §5.4 Per-bid billing mechanics ✅ §34.2.5 (D-PT-003 P2 KB-persistence clock-reset and D-PT-005 P2 FX-rate-locking timestamp pre-filed)
- **§5.5 Surface discipline (9 items) ⚠** — Solo seller surface compression covers 6 of 9 items cleanly via §22.20 + §44.6.1 + Appendix M; 3 items unauthored: (a) **plan-tier matrix surface rule** (Solo seller sees only their tier name; tier matrix appears only at upgrade-CTA moments), (b) **Capability Declaration surface copy** ("Your profile is now discoverable for: CRM, Sales Engagement, Lead Scoring" — auto-publish behavior in §22.20.2 but specific compressed-render copy unauthored), (c) **KB governance weekly notification copy** ("We refreshed your knowledge base from your website — N new entries proposed" — silent classifier/dedupe behavior in §22.20.3 but specific notification template unauthored) → **D-14.2-008 (P2)**
- §5.6 / §5.7 Fit / Anti-fit — narrative; not spec scope.

### SPS v3 §6 Seller Starter — No new defects

3 concurrent invited bids, 10 proactive EOIs/month, KB up to 1,000 entries, 2 Firecrawl sources weekly, 1 re-Bootstrap per year, $30/mo AI budget visible, Verified eligibility, 5 SellerSoftware entities, 25 Capability Declarations, 1 Seller Page Enrichment per year, Monthly category Seller Signals digest, Email support — all match §34.1.2.

### SPS v3 §7 Seller Growth — No new defects

15 concurrent bids, unlimited EOIs, 10,000 KB entries, 10 Firecrawl sources daily, 3 re-Bootstraps per year, $200/mo AI budget, Certified eligibility, 25 SellerSoftware entities, 250 Capability Declarations, 3 Seller Page Enrichments per year, Weekly Seller Signals digest, CRM Sync included, Numeric Match Scoring, Email + chat support — all match §34.1.2.

### SPS v3 §8 Seller Scale — No new defects

Unlimited concurrent bids, unlimited EOIs, unlimited KB, unlimited Firecrawl sources real-time (fair-use ≤ 50 domains), unlimited Bootstraps, $600/mo AI budget, Certified, unlimited SellerSoftware entities, unlimited Capability Declarations, 12 Seller Page Enrichments per year, Weekly + real-time Seller Signals, CRM Sync + field-map customization, Numeric Match Scoring + batch API, 1 Promoted Marketplace placement per month, Read-only API access, Shared CSM, Priority support — all match §34.1.2.

### SPS v3 §9 Seller Enterprise — No new defects (D-AS-002 pre-filed for volume bands)

$3,000/mo floor, $12K/yr committed AI minimum, dedicated CSM + QBR, 99.9% uptime + 4-hour critical SLA — all match §34.2.3 #6, §34.1.2 SLA row, §34.2.4 (volume bands).

### SPS v3 §10 Seller-Side Capability Rate Card → No new defects

12 rows by capability_id, model tier, value_price, cost_price, unit reconcile against §34.14.1 (MS §2.8 Baseline). Solo "engineering-transparent, never seller-facing on Solo" framing reconciles to §34.14.4 + §44.6.6.

### SPS v3 §11 Seller-Side Outcome Signals → No new defects (D-PXC-008 pre-filed for cite drift)

12 rows reconcile against §34.15.1 by accepted-signal, evaluation window, default-on-timeout.

### SPS v3 §12 Cross-Side Billing Rules → No new defects

§12 #1 per-console plan activation ✅ §34.12.1; §12 #2 AI budgets Org-scoped + pooled at Business+/Starter+ (Solo absorbed envelopes do NOT pool) ✅ §34.10.3; §12 #3 wallet overage Org-scoped (Solo has no wallet) ✅ §34.10.2 + §44.6.1; §12 #4 Dual-Console Firewall unchanged ✅ §7.2; §12 #5 Enterprise counts once ✅ §34.12.5; §12 #6 Solo cross-console independent ($98/mo for Buyer Solo + Seller Solo, no bundle discount) ✅ §34.12.6.

### SPS v3 §13 Marketplace Discovery Pricing → No new defects (D-PXC-009 / -010 / -011 / -012 pre-filed)

- §13.1 Promoted Listings (1/mo Scale, 3/mo Enterprise, $500/category/week, 4 additional cap, k=5) → §34.16.1 ✅
- §13.2 Verification Tiers (Basic / Verified Solo+ / Certified Growth+) → §27.11.3 + §34.16.2 — Verification-tier criteria divergence pre-filed as D-PXC-010; plan-tier gating drift pre-filed as D-PXC-011
- §13.3 Featured Placements (Editorial only, no paid commitment) → §34.16.3 — paid_commitment reserved-mode divergence pre-filed as D-PXC-012

### SPS v3 §14 Financial Scenarios → 1 new defect (D-14.2-001); D-AS-005 pre-filed; D-PXC-016 pre-filed

- Scenario A (200 Seller Starter; $357,600 ARR; ~95.1% margin) → §34.18.6 — naming collision pre-filed as D-PXC-016
- Scenario B (50 Seller Growth; $299,400 ARR; ~93.7% margin) → §34.18.6 — same as above
- Scenario C (15 Scale + 5 Enterprise; ~44.4% blended margin) → §34.18.6 — same as above
- **Scenario D (Seller Solo cohort: 300 sub × $49 × 12 + 1,200 per-bid × $199 = $415,200 total; ~90.4% margin) ❌ absent from §34.18.6 → D-14.2-001 (P1)** [NOTE: this is the SELLER-side Solo scenario; D-14.1-001 covers the BUYER-side Solo scenario (200 sub × $49 + 800 per-eval × $199 = $276,800) — distinct cohorts, distinct margin profiles, both missing.]
- Year-1 seller plan mix (25% Solo sub / 25% Solo per-bid / 25% Starter / 15% Growth / 8% Scale / 2% Enterprise) → D-AS-005 pre-filed
- Combined buyer + seller margin target ≥90% → §34.18.1 ✅

### SPS v3 §15 PLG Motion → 3 new defects (D-14.2-005, D-14.2-006, D-14.2-007)

- §15.1 Hero Moment ("Your first bid is already drafted") → §48.8 + §49.1 ✅ (D-13V-022 P1 PHASE_HM Firecrawl-outage cluster pre-filed)
- §15.2 Tracked activation metric ("Minutes from magic-link click to first submitted requirement response" — p50 < 20 min, p90 < 60 min) → §48.1.6 ✅ (thresholds match Primary Seller Activation Metric authoritative band)
- **§15.3 The conversion moments — FOUR moments ⚠** — §48.1.7 publishes THREE Conversion Moments with hardcoded `seller_free → seller_starter` Plan-To for all three rows. SPS v3 §15.3 publishes **FOUR** Moments, with the v3-introduced Moment 1 (Mid-bid AI budget wall → Solo) being the DOMINANT Free→Solo trigger per §2.8 / §2.9 narrative authority. Moment 4 (KB ceiling) routes to either Solo (from Free) or Starter (from Solo) per SPS v3 §15.3 narrative. §48.1.7 cannot fire the Solo trigger AT ALL because the row doesn't exist and the Plan-To enum is hardcoded → **D-14.2-005 (P1)**
- §15.4 Paid-path progression (7 steps) — partial: most map cleanly; Step 6 "Growth upsell at 80% budget utilization for 2 consecutive months" not authored in §34.5 (this is a shared cross-console issue; deferred to Phase 14.x bulk-pricing-trigger walk; not Solo-side-specific so not filed here)
- §15.5 Leading indicators (14 indicators trackable solo) — §48.1.6 has 8 + 2 Quality-Signal indicators; 6 of 14 SPS v3 §15.5 Solo-cohort indicators are absent → **D-14.2-006 (P2)** covers: Free→Solo conversion %; Solo subscription → Starter at 90 days; Solo per-bid ($199) repeat-purchase rate within 12 months; % of Free sellers hitting $5 AI budget wall mid-bid; Solo-tier silent-throttle event rate (<5% of Solo accounts in any 30-day window); per-cohort blended margin (Solo subscription / Solo per-bid as separate cohorts; §48.1.6 Q2 says "per plan" but does not break Solo sub vs Solo per-bid)
- **§15.6 Buyer-Funded Pro Trial Seat (M17) interaction with Solo ⚠** — SPS v3 §15.6 commits "On day 31, the vendor auto-downgrades to Seller Free with 90-day read-only data preservation AND **is offered the Solo or Starter upgrade with the contextual carry-over CTA**." §34.13.4 documents auto-downgrade to `seller_free` and §34.13.4 Auto-downgrade row references `pro_trial_seat.auto_downgraded` audit/email but the contextual Solo-vs-Starter upgrade-CTA branching logic, copy, and surface are unauthored → **D-14.2-007 (P2)**

### SPS v3 §16 Forced-Vendor-Signup Playbook → 1 new defect (D-14.2-010)

- §16.1 Pre-arrival preparation ✅ §48.8.2
- §16.2 Onboarding surface minutes 0–3 (zero friction; progress storytelling; landing counter) ✅ §48.8.3 + §49.1.2 / §49.1.3 / §49.1.4
- §16.3 In-workspace value proof (inline citations; Accept / Edit / Reject; live budget counter Free-only hidden on Solo; KB-gap detector; "AI got this right" chip) ✅ §48.8.4 + §22.7 + §49.1.5 + §44.6.1
- §16.4 Post-submission reveal Free vs Solo variant copy ✅ §48.8.5
- §16.5 Solo billing surface ($49/mo Renews [date] / $199 charged [date] 7-day refund 90-day retention) ✅ §44.6.2 + §34.2.5
- §16.6 Buyer-Funded Pro Trial Seat (M17) ✅ §34.13 + §48.7.4
- **§16.7 Win/Loss debrief as upgrade trigger ⚠** — SPS v3 §16.7 publishes specific upgrade-CTA copy keyed on win-vs-loss outcome with Solo-bordering routing: on win *"Keep your KB alive — upgrade to Solo for engine-absorbed AI on every bid, or to Starter for weekly Firecrawl crawls and 3 concurrent bids"*; on loss *"Upgrade to Solo to never see a mid-bid budget wall on your next response, or to Starter to let Sourcera crawl your product docs weekly and fill gaps automatically"*. §49.1.7 Post-Submission Debrief and §48.7 (M14 Bid Success Share / M14–M17 cluster) reference the debrief surface but do NOT author the win/loss-conditional upgrade-CTA copy with Solo-vs-Starter routing → **D-14.2-010 (P2)** [NOTE: PHASE_HM filed D-HM-NNN cluster against §48.8.5 stake-reveal surface; this defect is distinct because it covers the BID-CLOSE-OUTCOME-CONDITIONAL debrief copy, not the post-submission stake reveal.]

### SPS v3 §17 Seller Onboarding Experience → 1 new defect (D-14.2-004)

- §17.1 Seven-stage flow ✅ §49.1 (Stage 1 → Stage 7 map at §49.1 preamble + 7 sub-sections §49.1.1 – §49.1.7)
- **§17.2 Required platform capabilities — Items 1–10 + Item 11 (Solo billing surface, v3 addition) ⚠** — Items 1–10 reconcile cleanly with §34.17.1 #14 (UX surfaces) + §49.1 stage capabilities. **Item 11 ("Solo billing surface — single-card billing view per §16.5; Stripe subscription and per-bid charge orchestration; 7-day refund window logic; Solo silent-throttle notification surface; Verified-tier eligibility flagging on Solo accounts; KB-cap behavior on per-bid 90-day retention windows")** is implemented across §44.6 / §34.2.5 / §27.11.3 / §44.6.4 but the SELLER-SPECIFIC sub-features (Verified-tier eligibility flagging on Solo accounts; per-bid 90-day KB-cap retention rendering) are not registered in §34.17.1.b Authored Extensions enumeration → **D-14.2-004 (P1)** [NOTE: D-14.1-010 covers AE-12 through AE-16 for the buyer-side Solo additions; D-14.2-004 covers AE-17 (Seller Solo Verified-tier eligibility surface) and AE-18 (Seller Solo per-bid 90-day KB-cap retention rendering). The cross-console items (Solo single-card billing, per-charge orchestration, silent-throttle) are covered by the AE-12 / AE-13 / AE-16 rows recommended in D-14.1-010 — D-14.2-004 adds only the seller-only items.]
- §17.3 Onboarding anti-patterns (7 explicitly banned) ✅ §48.8.7 + §49.1.9 (AP1–AP7 detector list)

### SPS v3 §18 KB Value Capture & Stake-Building → No new defects

- §18.1 Honest portability (full Markdown + JSON + provenance export at every tier including Free + Solo) ✅ §22.18.2 + §40.4
- §18.2 On-platform compounding (confidence scores, staleness state, win-rate weighting, cross-bid citation graph, KB-to-Capability auto-declarations) ✅ §22.18.3
- §18.3 KB value meter (entries × avg response time saved × loaded hourly rate; visible on Free and Solo) ✅ §22.18.4 + §34.19.2
- §18.4 Upgrade carry-over guarantee (KB, in-flight bids, Capability Declarations, Firecrawl source configs; 90-day read-only downgrade preservation; per-bid 90-day retention from bid submission date) ✅ §34.19 + §22.18.5 + §34.2.5 + §34.6 (D-PT-003 P2 per-bid KB-persistence clock-reset pre-filed)

### SPS v3 §19 Seller-Side Network Effects → No new defects

- §19.1 Invited-Vendor → Published-Profile → Marketplace-Ready Inventory ✅ §48.3.5 + §48.2.2 L1
- §19.2 KB → Capability Declaration → Match Score → EOI → Revenue ✅ §48.3.5 + §22.18 + §27.4
- §19.3 Bid-Close → Win/Loss Signal → Platform Learning ✅ §48.3.5
- §19.4 Seller-Profile SEO Loop ✅ §48.2.5 L4
- §19.5 Ghost-Bid Import Loop (M15) ✅ §48.7.2
- §19.6 Buyer-Funded Pro Trial Loop (M17) ✅ §48.7.4
- §19.7 Template Publish Incentive (M9 / L9) ✅ §48.2.10 + §48.6.5
- §19.8 Reinforcing loop summary — narrative only

### SPS v3 §20 Anti-Spam & Marketplace Integrity Controls → No new defects

EOI rate-limit per seller/category/buyer ✅ §48.4 + §27.11.6; Capability Declarations validated against taxonomy ✅ §27.6; Signal Integrity Monitor flags ✅ §48.4.10 + §27.9.5; Ops Console downgrade/throttle/suspend ✅ §50.x; Template Spam ML Classifier ✅ §48.4.5; k-anonymity floor ✅ §48.4.7; 180-day Marketplace-ranking demotion for non-respondent profiles ✅ §27.11.6 G7 quality-floor + §48.4.12 acceptable-use floor.

### SPS v3 §21 Migration from v2 → 2 new defects (D-14.2-002, D-14.2-009); D-14.2-011 cite drift

- v2 → v3 deltas table ✅ Phase 14.9 scaffolding edits landed (verified end-to-end)
- Phase 14.9 spec scaffolding inventory ✅ (verified per CLAUDE.md §16 v7.1.0 stamp state)
- Phase 14.9.1 / 14.10 follow-up checklist (Solo absorbed-envelope routing at §21.4 capability registry; §27.10 verification-eligibility plan-tier check; §5.11 inline plan-tier list audit; KB engineering content integration into §22) — partially landed; remainder is v7.1.1 backlog
- **"Existing Free sellers receive an in-app announcement of the Solo tier with a 90-day Solo subscription trial offer (no credit card; auto-downgrades to Free at trial end)" ❌** → §34.9 documents only the 14-day Business Starter trial (§34.9.1) and the no-trial Seller Free on-ramp (§34.9.2); no 90-day Seller Solo trial mechanism for v2-cohort Free seller migration is authored → **D-14.2-002 (P1)** [NOTE: D-14.1-002 covers the BUYER-side 90-day Solo trial gap; D-14.2-002 is the SELLER-side mirror. Both are missing and require independent authoring because the wallet (Solo absorbed envelope per §44.6.3), trial-end behaviors (Seller Free 50-entry KB cap vs Buyer Free 25-vendor / 1-eval cap), and Free-tier surface compression are console-specific. The mechanisms are symmetric but not interchangeable.]
- **"KB entries above the Free 50-cap on existing accounts are grandfathered in their current tier (no truncation on migration). Verified-tier eligibility is now Solo+ (was Starter+ in v2); existing Free sellers who would have qualified for Verified at Starter remain ineligible until they upgrade to Solo or Starter" ❌** → §34.6 Downgrade Excess Data Handling specifies the runtime soft-delete + 90-day-read-only behavior for plan downgrades but is silent on the v2 → v3 CUTOVER MIGRATION rule for v2-cohort Free sellers whose existing KB exceeds the Free 50-entry cap. The "grandfathered in their current tier" commitment is unauthored at §34.6 / §22 / §34.5 migration policy → **D-14.2-009 (P2)** [NOTE: D-14.1-007 covers BUYER-side Selection Report v2-watermarking grandfathering. D-14.2-009 is the SELLER-side KB-cap grandfathering equivalent. Both are migration-specific carve-outs to the standard plan-tier-cap enforcement.]
- **§21 line 887 "Master Spec §27.10 (Verification Tiers)" ❌** — §27.10 is Vendor Opt-Out Registry; Verification Tiers are at §27.11.3 in v7.1.0. Citation drift, cosmetic → **D-14.2-011 (P3)**

### SPS v3 §22 Positioning and Messaging → No new defects

Narrative only; not authoritative for engineering behavior. The "$49/mo or $199/bid. Engine-absorbed AI. Verified badge eligibility. Email support." Solo positioning aligns with §34.1.2 + §34.2.2 + §44.6 + §27.11.3.

---

## 4. Counterfactual Pass — Failure Modes Per Defect

Per Audit_Prompts.md MODEL EXPECTATIONS, every defect's surrounding feature is walked for at least 3 realistic failure modes; if a failure mode is unhandled, an additional defect is filed.

### D-14.2-001 — §34.18.6 Seller Solo Scenario D

1. **Stripe per-charge fee assumption drifts.** SPS v3 §14 Scenario D uses 2.9% + $0.30 per Stripe charge; the per-bid path has fee ≈ $7,285 across 1,200 charges (≈ $6.07/bid). Stripe pricing changes annually. Spec row authoring MUST cite a `stripe_fee_snapshot_date` annotation and link to a `_integration/snapshots/` frozen pointer. Tracked as scorecard-row authoring detail.
2. **Refund reserve assumption (5% of per-bid volume).** §34.18.5 Finance scorecard should add a "Solo per-bid refund rate" tracker so Scenario D's 5% assumption is observable. Cross-references D-14.2-006 (Solo cohort indicators).
3. **Verified-tier Ops review cost ($12 loaded × 60% sub + 30% per-bid earning Verified = $6,480 total).** If Solo per-bid Verified-earning rate exceeds 30% (likely on dense-RFP cohorts where seller invests effort), Ops review labor scales linearly — at 60% earning, cost doubles to ~$13K and Scenario D margin compresses from 90.4% → ~89.0%. Mitigation: scorecard row tracks Verified-tier Ops review labor per Solo cohort. Cross-references D-14.2-006.

All 3 failure modes are addressed by the existing recommendation set OR by other Phase 14.2 defects. No additional defects filed.

### D-14.2-002 — §34.9 90-day Seller Solo trial

1. **Trial-account gaming.** A user creates multiple Seller Free orgs to chain Solo trials. Mitigation: recommendation explicitly authors "one trial per `(org_id, legal_entity)` per lifetime; deploy-time validator `seller_solo_trial_one_per_org_lifetime`". Adequate (parallels D-14.1-002 sub-defect for Buyer Solo trial).
2. **Trial seller's first invited bid arrives mid-trial; per-bid mode interaction.** Per §34.2.5, the per-bid charge fires on bid submission. During the 90-day Solo trial, per-bid charges MUST be suppressed (subscription-mode-active blocks per-bid per §34.12.8 #6 `solo_subscription_active_per_bid_charge_blocked`). Recommendation should cite §34.12.8 #6 applicability to trial accounts. Sub-defect not filed; recommendation refinement in §5.
3. **Trial expiry + payment-method-on-file race.** A seller adds a payment method on day 90 at 23:59 UTC; the day-91 auto-downgrade cron fires at 00:01 UTC; race results in unintended downgrade with KB above 50-entry cap. §34.9.1 14-day Starter trial does not specify timestamp-comparison granularity (UTC midnight? Org `current_period_ends_at`? Anniversary clock?). The 90-day Solo trial recommendation should mirror whatever §34.9.1's contract is and tighten timestamp granularity. Cross-link to D-14.2-009 (KB-cap grandfathering during cutover) for any v2-cohort trial seller whose KB already exceeds 50 at trial start.

### D-14.2-003 — Solo→Starter upgrade-CTA throttling threshold (seller-side)

1. **Threshold-event aggregation under Solo Org with concurrent contralateral console.** Per §34.10.3 Solo-co-resident rule, two engine-side envelope counters run independently per console. The 3-events-in-30d aggregation is per-console; recommendation should clarify per-`(org_id, console)` aggregation (mirrors D-14.1-003 recommendation pattern).
2. **Throttling event ≠ throttling effective.** §44.6.4 #6 specifies auto-clear at envelope rollover. A throttling event firing at 80% utilization that immediately auto-clears at billing-cycle rollover should still count toward the 3-events trigger. Recommendation should clarify "throttling-engaged event count" not "throttling-currently-active duration".
3. **Per-bid mode "envelope hit" distinct from subscription "throttle event".** Per-bid mode hits the envelope at 100% per single bid; subscription mode aggregates over 30 days. Recommendation should cite both modes distinctly. Adequate; mirrors D-14.1-003 pattern.

### D-14.2-004 — §34.17.1.b missing seller-specific Solo additions

1. **Verified-tier eligibility flagging on Solo accounts — race with Ops review queue.** When a Solo seller uploads SOC 2 documentation and Ops Console review fires, the resulting Verified-tier elevation MUST flow through to the Marketplace render surface within the §27.10.4 ≤60-second budget. The §34.17.1.b AE-17 row recommendation should specify the SLA pairing to §27.10.4 enforcement-pipeline pattern.
2. **Per-bid 90-day KB-cap retention rendering — interaction with Pro Trial Seat.** A seller who consumed Solo per-bid and then receives a buyer-funded Pro Trial Seat 89 days later: the per-bid retention clock is at day 89/90; on Pro Trial activation, the Seller Starter wallet activates with 1,000-entry KB cap. The day-90 transition to read-only would conflict with the Pro Trial's active 1,000-entry cap. Recommendation should specify that Pro Trial activation pauses the per-bid retention clock (cross-link to D-PT-003 P2 pre-filed retention clock-reset).
3. **Solo silent-throttle notification surface — cross-console interaction.** A Buyer Solo + Seller Solo Org's contralateral consoles each maintain independent envelopes per §34.10.3. Throttle notifications must be scoped to the affected console only; cross-console notification leakage would violate §1.3 firewall. Recommendation should specify `console`-scoped notification routing (parallels D-14.1-010 AE-16 buyer-side handling).

### D-14.2-005 — §48.1.7 Three Conversion Moments vs SPS v3 §15.3 Four

1. **Race: seller simultaneously hits Moment 1 (mid-bid AI budget wall on a Free→Solo trigger) and Moment 2 (second concurrent bid from Free→Starter).** Mutual-exclusivity invariant per §48.1.7 says first-fire wins. With Moment 1 NEW in v3, the spec's hardcoded `seller_free → seller_starter` Plan-To enum cannot represent Moment 1 routing. Recommendation should extend `stage_7_conversion_moment_kind` enum with `mid_bid_ai_budget_wall` value AND the `stage_7_upgrade_target_plan` enum to permit `seller_solo`. Tracked as core recommendation.
2. **Moment 4 (KB ceiling) from Solo cohort.** SPS v3 §15.3 Moment 4 routes KB ceiling from either Free (→ Solo CTA) or Solo (→ Starter CTA). §48.1.7 Moment 3 (KB ceiling approach) is hardcoded `seller_free` source AND `seller_starter` target — it cannot fire for Solo→Starter routing. Recommendation should extend the trigger to fire on `plan_tier ∈ {seller_free, seller_solo}` with a routing-by-source-plan rule. Tracked in core recommendation.
3. **Frequency cap interaction.** §48.1.7 frequency cap says each Conversion Moment fires AT MOST ONCE per Seller Org over the row's lifetime. With FOUR moments and Solo as an intermediate plan, a seller could hit Moment 1 (→ Solo upgrade), then later hit Moment 2 (→ Starter upgrade). The frequency-cap enum must support per-(moment_kind, plan_tier) firing granularity, not per-moment-kind-only. Recommendation should specify the per-plan-tier frequency cap. Tracked in core recommendation.

### D-14.2-006 — Seller-cohort leading indicators (6 of 14 missing)

1. **Cohort denominator ambiguity.** "5% of Solo seller accounts in any 30-day window" — denominator could be: (a) Solo accounts active at any point in the 30-day window; (b) Solo accounts that consumed at least 1 AIOp; (c) Solo accounts at start of window. Recommendation should specify (b) to avoid trivial 0-throttle scores from inactive accounts. Sub-defect not filed; tracked as scorecard-row authoring detail.
2. **Per-bid mode vs subscription mode separate cohorts.** Solo per-bid behaves materially differently from Solo subscription (per-bid has lumpy single-bid consumption; subscription has predictable monthly cycles). Solo throttle event-rate AND Solo→Starter conversion rate MUST be tracked per-billing-mode. Recommendation cites both cohorts. Adequate; mirrors D-14.1-006 pattern.
3. **Cross-console Solo cohort (Buyer Solo + Seller Solo) double-counting.** Per §34.10.3 #2, the two consoles' envelope counters are independent. Org-level conversion-rate denominators must guard against double-counting an Org as a Solo subscriber on BOTH consoles. Recommendation cites §44.6.5 per-console event source AND per-`(org_id, console)` denominator scoping. Adequate.

### D-14.2-007 — §34.13.4 Pro Trial Seat day-31 Solo-CTA branching

1. **Trial-to-Free auto-downgrade vs Trial-to-Solo manual-upgrade race.** A trial-end seller clicks the Solo upgrade CTA at day 31 23:58 UTC; the auto-downgrade cron fires at day 32 00:01 UTC. Race results in either double-charge or unintended downgrade. Recommendation should specify atomic state-machine transitions with `pro_trial_seat.day_31_pending_upgrade` interim state. Sub-defect not filed; tracked as state-machine refinement in recommendation.
2. **Solo subscription activation vs per-bid mode choice at day 31.** SPS v3 §15.6 says "the contextual carry-over CTA" — but which mode (subscription vs per-bid) is the default? Recommendation should specify Subscription as the default Solo activation path on Pro-Trial-conversion (mirrors the Starter trial's subscription default at §34.13.4 Convert row).
3. **Seller had been on Solo per-bid pre-Pro-Trial.** If the seller had a prior per-bid Solo charge in the 90 days before the Pro Trial Seat grant, AND the Pro Trial Seat lifts them to Seller Starter for 30 days, AND they auto-downgrade at day 31: the per-bid retention clock (90 days from prior bid submission per §34.2.5) may still be active. The auto-downgrade-to-Free path must preserve any in-window per-bid KB-cap retention. Cross-link to D-PT-003 (per-bid KB persistence) and D-14.2-009 (v2-cohort KB grandfathering).

### D-14.2-008 — §44.6.1 / §22.20 surface compression items missing for seller

1. **Solo plan-tier matrix surfacing on upgrade CTA.** Solo seller sees only their plan name in normal operation but full matrix at upgrade-CTA moments (§48.1.7 Conversion Moment renders). The §34.5 plan-change surface is currently un-Solo-mode-restricted; engineering must gate matrix render on upgrade-CTA context per §22.19 Seller Compressed Surface mapping. Recommendation cites §34.5 surface; engineering must validate with §34.5 authoring scope. Parallels D-14.1-009 sub-defect.
2. **Capability Declaration auto-publish surface copy.** §22.20.2 authors the compression rule (Solo seller does not edit Capability Declarations as authored objects). The compressed-render copy "Your profile is now discoverable for: CRM, Sales Engagement, Lead Scoring" requires UX-fixture-snapshot testing because the category list is dynamically rendered from KB→Capability auto-suggestions. Recommendation should cite UX token + Loops.so notification template (mirrors D-14.1-009 surface authoring approach).
3. **KB governance weekly notification copy.** "We refreshed your knowledge base from your website — N new entries proposed" — N is a dynamic count from §22.4.3 re-indexing pipeline. The notification cadence (weekly) interacts with the §44.6.4 silent-throttling behavior: if Firecrawl crawls were throttled in a given week, N may be 0 — the notification copy must handle the N=0 case ("No new content this week from your website" OR suppression of the notification entirely). Recommendation should specify the N=0 surface treatment (mirrors §22.20.3 KB Governance compression rule extension).

### D-14.2-009 — §34.6 / §22 silent on v2→v3 cutover KB-cap grandfathering

1. **A v2-cohort Free seller's KB at v3 cutover has 78 entries (> 50 Free cap).** Per SPS v3 §21, these 78 entries grandfather "in their current tier" — meaning the seller can READ all 78 entries but cannot ADD new entries beyond 50 unless they upgrade. Recommendation should specify whether ADD operations on entries 51–78 are blocked (read-only soft-cap) OR allowed (grandfathered hard-cap). Sub-defect not filed; tracked as authoring detail.
2. **A v2-cohort Free seller upgrades to Solo post-cutover.** The 78 entries fit within the Solo 250-entry cap; no action needed. Adequate.
3. **A v2-cohort Free seller upgrades to Solo per-bid post-cutover (per-bid mode).** Per-bid 90-day KB retention runs from bid submission. If the seller's v2 grandfathered KB has 78 entries and they submit a per-bid response, the 90-day retention applies to the entire KB including the grandfathered v2 entries. After day 91 with no new per-bid, entries 51–78 transition to read-only. This preserves the v2 grandfathering at the policy level. Adequate.

### D-14.2-010 — Win/Loss debrief upgrade-CTA Solo-bordering copy

1. **Buyer publishes win/loss outcome via the closing-bid surface; debrief generates async.** Per §48.7 (M14 Bid Success Share), the buyer's outcome publication triggers the seller-side debrief. The debrief surface must handle the case where the seller is no longer on the same plan as at bid-submit time (e.g., they downgraded from Solo to Free between submission and debrief). Recommendation should specify the upgrade-CTA renders against the seller's CURRENT plan, not the bid-submit-time plan.
2. **Outcome is `lost` and buyer published "Gap analysis" with specific KB-gap rationale.** SPS v3 §16.7 commits "Gap analysis identified 4 requirements where your KB had no strong answer. Those gaps are now flagged in your KB." The §22.18.4 KB Value Meter surface must integrate the gap-flag rendering. Recommendation should cite §22.20.3 KB Governance compression rule.
3. **Outcome is `won` and the seller never upgraded.** The win debrief on a Free-tier seller offers Solo or Starter upgrade CTAs. The CTA copy should differentiate based on the seller's mid-bid behavior (did they hit the $5 hard cap? → Solo CTA emphasized. Did they get a second invite during the bid? → Starter CTA emphasized.). Recommendation should specify behavior-based CTA routing.

### D-14.2-011 — SPS v3 §21 cite drift

1. Cosmetic citation drift; no engineering impact. The SPS v3 document is the source-of-drift; the spec is correctly authored at §27.11.3. Recommendation is a one-line SPS v3 edit (no spec change). P3 is correct severity.
2. n/a — citation drift only.
3. n/a — citation drift only.

---

## 5. Self-Challenge Pass (Hostile-Reviewer Persona)

Re-reading findings as a hostile staff engineer prepping engineering, design, QA, analytics, and leadership for sign-off.

### 5.1 Severity Classifications — Are They Rule-Based?

Per Audit_Prompts.md Severity Definitions:

- **D-14.2-001 (P1).** Rule: "conflicting numerical singleton between Master Spec and a companion strategy doc". Scenario D is a missing scenario in the spec's authoritative scenario-analysis section while SPS v3 publishes it as authoritative ($415,200 / ~90.4%). ✅ P1.
- **D-14.2-002 (P1).** Rule: "missing acceptance criteria, ... missing webhook contract, missing plan-gating row, missing retention/DSAR/residency clause". 90-day Seller Solo trial is an entire missing entity (trial start / end / abuse-control / payment-method-grace / per-bid mode default / KB-cap grandfathering interaction). ✅ P1.
- **D-14.2-003 (P1).** Rule: same as D-14.1-003 (buyer-side). Upgrade-CTA throttling trigger is an entire missing trigger contract (rolling-window aggregation, event emission, CTA render rule, per-(org_id, console) scoping). ✅ P1.
- **D-14.2-004 (P1).** Rule: "missing plan-gating row in §5.11/§34.1/§39 ... or surface introduced without an Appendix-M row". §34.17 is the authoritative pricing-engineering-requirements catalog with deploy-gate enforcement (§34.17 AC #2). 2 missing rows for seller-specific Solo additions in an enforcement-gated catalog = unbuildable as written if the gate is runtime-active. ✅ P1.
- **D-14.2-005 (P1).** Rule: "missing acceptance criteria, missing state machine, missing error code". §48.1.7 publishes 3 Conversion Moments with hardcoded plan-to enum; SPS v3 §15.3 commits 4 moments with Solo destinations. The spec literally cannot fire the Mid-bid AI budget wall Solo trigger because the row doesn't exist and the enum is wrong. ✅ P1. Hostile-reviewer probe: *"Engineering could just extend the §48.1.7 table — why P1?"* Counter: §48.1.7 is the authoritative binding for Conversion Moments per §48.1.7 Authoring Intent ("This subsection is the implementation contract; product and engineering build against it; QA tests against it; PLG dashboards report against it"). A junior engineer reading §48.1.7 alone today cannot fire the Solo trigger. P1 stands.
- **D-14.2-006 (P2).** Rule: "ambiguous in a way that a thoughtful staff engineer could resolve, but the resolution is not the *same* across two readers". 6 leading indicators are observability scope; engineering can derive consistently from §44.6.5 + §34.10.5 + §48.1.6 patterns. ✅ P2. Strict-interpretation conversion → P1 noted (mirrors D-14.1-006 pragmatic interpretation).
- **D-14.2-007 (P2).** Rule: ambiguous-but-resolvable. §34.13.4 documents auto-downgrade behavior; the Solo-CTA branching is an additive contextual layer (post-trial upgrade routing). Recommendation cites §34.13.4 row extension. ✅ P2.
- **D-14.2-008 (P2).** Rule: surface contract gap. Three Solo-side surface compression items missing; consistent resolution possible if surfaces are authored. ✅ P2.
- **D-14.2-009 (P2).** Rule: ambiguous-but-resolvable. KB-cap migration grandfathering is a render-rule + soft-cap-enforcement edit; junior engineer can derive consistently once the rule is authored. The defect is the *missing rule*, not an unbuildable scope. ✅ P2 (defensible at P1 if spec silence would cause incorrect default — flagged in halt-rule analysis below).
- **D-14.2-010 (P2).** Rule: copy authoring gap with Solo-bordering routing logic. Engineering needs the copy strings + routing rule but the surface (§49.1.7 + §48.7) exists. ✅ P2.
- **D-14.2-011 (P3).** Rule: "Cosmetic, terminological, or documentation drift that does not affect implementation". Citation drift in SPS v3 narrative; no spec impact. ✅ P3.

All 11 severity classifications hold under hostile review.

### 5.2 Evidence Reproducibility

Each defect's `evidence` column quotes SPS v3 line numbers and spec section anchors that I personally read. A reviewer can re-open SPS v3 at the cited line and the spec at the cited §-anchor and reproduce the gap. ✅ Evidence is reproducible.

### 5.3 Recommendation Sharpness

Each defect's `recommendation` column names a specific spec section to extend, the field / row to add, and the deploy-time validator to wire. A junior engineer with read access to the cited sections can implement the recommendation without further clarification. ✅ Recommendations are sharp.

### 5.4 Cross-Defect Consistency

- D-14.2-003 (Solo→Starter throttling trigger) and D-14.2-006 (Solo throttle event rate scorecard) touch the same engine-side data source (`solo.envelope.throttling_engaged` events from §44.6.5). Recommendations are independent but engineering may bundle into a single Phase 14.11.A authoring pass.
- D-14.2-002 (90-day Solo trial) and D-14.2-009 (v2-cohort KB grandfathering) and D-14.2-001 (Scenario D) are all v2→v3 migration concerns. A unified "v3 Seller Cutover Migration" sub-section in §34.5 / §34.9 / §34.18 could close all three.
- D-14.2-005 (Four Conversion Moments) and D-14.2-003 (Solo→Starter throttling trigger) interact: the throttling trigger IS one of the Moment-1 routing paths in SPS v3 §5.3 + §15.3. Recommendations are independent but the §48.1.7 table extension SHOULD reference the §44.6.5 throttling-engaged event as the Moment 1 trigger event.
- D-14.2-001 (Seller Solo Scenario D) and D-14.1-001 (Buyer Solo Scenario D) are paired financial scenarios; combined remediation should produce two new §34.18.6 scenarios with cross-cohort assumption consistency (Stripe fee snapshot, refund reserve methodology, FX rate methodology).
- D-14.2-004 (seller-side AE rows) and D-14.1-010 (buyer-side AE rows) are paired §34.17.1.b catalog extensions; combined post-v7.1.1 stamp adds 7 AE rows (AE-12 through AE-18) and tightens the `pricing_engineering_coverage` deploy gate.

### 5.5 Counterfactual Pass Sub-Defects Tracked Inline

The counterfactual pass surfaced ~14 sub-defects (refinements to recommendations, edge-case considerations) that are tracked inline in the §4 counterfactual block. None met the "applicable + spec-silent + not-already-filed" threshold to escalate to a separate defect row. Phase 14.5 (AE Ratification) and Phase 14.7 (v7.1.1 Backlog Status) walks should consume the counterfactual sub-bullets when authoring AE-17 through AE-18 ratification copy and the §34.18.6 Seller Scenario D row.

### 5.6 Halt-Rule Application Discipline

Per Audit_Prompts.md Prompt 14.2 strict reading: "ANY DRIFT IS P1 consistency_drift". Pragmatic interpretation applied per PHASE34.PXC + PHASE14.1 precedent (CONSISTENCY_DELTA.md "Roll-Up by Severity" paragraph). Strict-interpretation alternative (10 P1 / 1 P3; no P2) recorded for v7.1.1 backlog completeness. **Self-challenge:** does the pragmatic interpretation under-flag genuine engineering risk? Walking each P2 defect: D-14.2-006 is observability-only (no shipping behavior change required); D-14.2-007 is state-machine row extension (junior-engineer-buildable once authored); D-14.2-008 is surface copy authoring (junior-engineer-buildable once authored); D-14.2-009 is migration-rule authoring (Critical Question — does grandfathering apply ADD-rights too? — needs Pricing Strategy decision before authoring); D-14.2-010 is copy-and-routing-logic authoring (junior-engineer-buildable once authored). None blocks v7.1.1 stamp. ✅ Pragmatic interpretation defensible.

---

## 6. Decision Trace — What Was NOT Filed (And Why)

| Considered concern | Why not filed |
|---|---|
| SPS v3 §6 Responsive / Loopio anchor pricing claims ($7K, $15K, etc.) | Competitor pricing claims are narrative latitude; spec authors generic "Custom Integrations: Scoped per contract" at §34.1.2. Not a buildability gap. |
| SPS v3 §10 inline `defense_view_generate` rate-card omission | SPS v3 §10 is seller-side rate card; `defense_view_generate` is BUYER-side capability (§13.11.5). Correctly absent from SPS v3 §10. |
| SPS v3 §15.4 Step 6 "Growth upsell at 80% budget utilization for 2 consecutive months" | Shared cross-console (BPS v3 §11 has same trigger; both consoles affected). Deferred to Phase 14.x bulk-pricing-trigger walk; not Solo-side-specific so not filed in Phase 14.2 scope. (Mirrors D-14.1 decision trace.) |
| SPS v3 §16.4 Free/Solo post-submission reveal copy variants | §48.8.5 Stake-Reveal Screen authors both variants; specific copy strings render via UX-fixture-snapshot test. Adequate. |
| SPS v3 §16.6 Pro Trial Seat mechanics | §34.13 + §48.7.4 author full mechanics including 5/15-per-month allocation, 30-day duration, day-31 auto-downgrade, anti-spam framework. Day-31 Solo-CTA branching is the only genuine gap → D-14.2-007. |
| SPS v3 §17.3 7 onboarding anti-patterns | §48.8.7 AP1–AP7 + §49.1.9 detector list cover all 7 bans. The new v3 ban (#7 "Surface AI consumption metering, value-dollars, wallet, or rate card on Solo accounts") is registered at AP6 / AP7 + §44.6 surface contract. Adequate. |
| SPS v3 §19 Seven seller-side network effects | All 7 reconcile to §48.3.5 + §48.2.2 / §48.2.5 / §48.2.10 + §48.6.5 + §48.7.2 / §48.7.4. Adequate. |
| SPS v3 §20 7 anti-spam controls | All 7 reconcile to §48.4 subsections + §27.11.6 G7 quality floor + §27.6 taxonomy + §48.4.5 template spam ML classifier + §48.4.7 k-anonymity floors + §48.4.10 SIM + §48.4.12 acceptable-use floor + §27.11.6 G7 180-day-non-respondent demotion. Adequate. |
| Cross-console combined billing in SPS v3 §12 #6 | Solo cross-console combinations charged independently — fully covered by §34.12.6 + §34.12.8 #5/#6/#7. Adequate. |

---

## 7. Sign-Off

- **Phase 14.2 walk completed.** 11 net-new defects filed (D-14.2-001 through D-14.2-011). 30+ pre-existing defect cross-references confirmed across D-PT / D-AS / D-PXC / D-V6 / D-13V / D-14.1 clusters. Audit posture preserved (non-destructive; Master Spec wins per CLAUDE.md §2).
- **Counterfactual pass completed.** 33 failure-mode considerations across 11 defects; 14 sub-defects tracked inline as recommendation refinements (none met escalation threshold).
- **Self-challenge pass completed.** All 11 severity classifications hold under hostile review; evidence is reproducible; recommendations are sharp; cross-defect consistency holds; halt-rule pragmatic interpretation defensible.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "Seller Pricing v3"` heading appended (~14 KB). `_audit/DEFECT_LEDGER.md → Phase 14.2` block appended (11 defect rows + roll-up + sign-off verdict).
- **v7.1.1 stamp gate inheritance.** D-14.2-001 through D-14.2-011 closure + AE-17 through AE-18 ratifications (paired with AE-12 through AE-16 from D-14.1-010) + 4 new CI gate runtime wirings (`seller_solo_trial_one_per_org_lifetime`, `seller_solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_bid`, `seller_kb_v2_cutover_grandfathering_single_source`, `pricing_engineering_coverage` extension to assert §34.17.1.b ≥ 18 rows).
- **Phase 14.3 (Master Spec ↔ UX Design of Sourcera) is unblocked** — no Phase-14.2 P0 halt; pragmatic-interpretation P1 count (5) inherits to v7.1.1 backlog per audit-program ordering policy.

---

## 8. Phase 14.2 Re-Verification (2026-05-12, second pass)

**Trigger.** Phase 14.2 audit prompt re-issued same day after the original walk closed at 17:38. Independent end-to-end re-read of SPS v3 (918 lines) and Master Spec v7.1.0 §34 (full body) / §44.6 / §22.18 / §22.19 / §22.20 / §27.11.3 / §34.13 / §34.16 / §34.19 / §48.1.7 / §48.2.2 / §48.3.5 / §48.7 / §48.8 / §49.1 with a clean Opus context. Method mirrors the Phase 14.1 re-verification pattern.

**Re-walk methodology.** For each of D-14.2-001 through D-14.2-011, the cited Master Spec section anchor and the SPS v3 line numbers were re-opened and the evidence quote was verified character-for-character against current file state. The recommendation column was re-read for sharpness. The §34.2.5 cross-cutting orchestration rule #5 surface was probed end-to-end (both sub-bullets) against §44.6.3 / §44.6.7 + SPS v3 §5.2 / §5.4 / §15.3 — the buyer-side first-bullet contradiction had already been filed in Phase 14.1 re-verification as D-14.1-011 and prompted the analogous seller-side second-bullet probe.

### 8.1 Re-Verification Outcome — Pre-Filed 11 Defects

| Defect | Re-verification outcome | Notes |
|---|---|---|
| D-14.2-001 | Reproducible at §34.18.6 line 30797 + SPS v3 §14 lines 475–490. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-001 Buyer Solo Scenario D; both should land in the same §34.18.6 extension pass. |
| D-14.2-002 | Reproducible at §34.9.1 line 29766 + SPS v3 §21 line 891. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-002 Buyer 90-day Solo trial; both should land in a unified §34.9 v3-cutover migration sub-section. |
| D-14.2-003 | Reproducible at §44.6.5 line 33510 + SPS v3 §5.3 line 204 + §15.3 line 538. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-003 buyer-side; the immediate-fire mode for per-bid envelope-hit is preserved. |
| D-14.2-004 | Reproducible at §34.17.1.b + §44.6 / §34.2.5 / §27.11.3 + SPS v3 §17.2 line 709. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-010 AE-12 through AE-16; consolidates §34.17 AC #2 to ≥ 18 rows post-v7.1.1. |
| D-14.2-005 | Reproducible at §48.1.7 line 34179 + SPS v3 §15.3 line 536. Severity P1 holds. Recommendation sharp. | Mid-bid AI budget wall (Moment 1) v3-NEW + KB ceiling routing-by-source-plan (Moment 4) extensions. Closely linked to D-14.2-012's §34.2.5 rewrite. |
| D-14.2-006 | Reproducible at §48.1.6 + §34.18.5 + §51 + SPS v3 §15.5 lines 553–569. Severity P2 holds. Recommendation sharp. | Cross-references D-14.2-003 / D-14.2-004 / D-14.1-006 (buyer-side). |
| D-14.2-007 | Reproducible at §34.13.4 line 30222 + SPS v3 §15.6 line 573. Severity P2 holds. Recommendation sharp. | Seller-only (no buyer-side pair). |
| D-14.2-008 | Reproducible at §44.6.1 line 33420 + §22.20.2 / §22.20.3 + SPS v3 §5.5 lines 225–237. Severity P2 holds. Recommendation sharp. | Paired with D-14.1-009 buyer-side surface compression items. |
| D-14.2-009 | Reproducible at §34.6 + §22 + §34.5 + SPS v3 §21 line 891. Severity P2 holds (strict → P1 still recorded). Recommendation sharp. | Paired with D-14.1-007 Buyer SR v2-watermarking grandfathering. |
| D-14.2-010 | Reproducible at §49.1.7 + §48.7 + SPS v3 §16.7 lines 663–673. Severity P2 holds. Recommendation sharp. | Seller-only (no buyer-side debrief copy pair). |
| D-14.2-011 | Reproducible at SPS v3 §21 line 887 + Master Spec §27.10 / §27.11.3 anchors. Severity P3 holds. Recommendation sharp. | Cosmetic citation drift; SPS v3 narrative edit only. |

All 11 pre-filed defects confirmed `open` with reproducible evidence, defensible severity, and sharp recommendations. No defects retired, superseded, or re-classified.

### 8.2 Net-New Finding — D-14.2-012

A re-read of §34.2.5 (Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration) cross-cutting orchestration rule #5 *second* bullet (Bid Workspace branch) at line 29250 surfaced an internal contradiction that the Phase 14.2 original walk did not catch. The bullet says the Bid Workspace operates under Free entitlements during drafting and Solo benefits apply only to the post-submit 90-day retention window. This contradicts (a) §44.6.3 Solo per-bid `$5 absorbed value-dollars / submitted bid` envelope, (b) §44.6.7 #8 per-bid charge-pending state envelope-engaged semantics, (c) SPS v3 §5.2 "no hard cap" engine-absorbed envelope commitment, and (d) SPS v3 §15.3 Moment 1's verbatim CTA promising "no mid-bid walls" at $49/mo OR $199/bid — the v3-NEW dominant Free→Solo conversion mechanic. Severity P2; filed as D-14.2-012 in the ledger.

**Counterfactual pass (D-14.2-012).** Three failure modes considered:

1. **Engineering builds the §34.2.5 reading literally.** Solo per-bid ships as "Free + delayed $199 + 90-day retention" with no mid-bid relief; the v3 launch's Free→Solo conversion mechanism fails because Solo per-bid mode delivers nothing during the mid-bid wall moment SPS v3 §15.3 Moment 1 promises to fix. Mitigation: the recommendation rewrites §34.2.5 line 29250 to authoritatively bind Solo per-bid envelope activation to election (CTA click) and decouples it from charge capture.
2. **QA writes acceptance tests against the §34.2.5 literal reading.** Engineering builds the §44.6 reading (envelope active on election) but QA tests for "Free entitlements pre-submit" per §34.2.5 and either fails the implementation tests or silently skips them. Mitigation: the recommendation adds `seller_solo_per_bid_envelope_activates_on_election` as a QA test assertion + deploy-time validator, leaving no ambiguity in the test contract.
3. **Customer-success docs promise relief that the product does not deliver.** Marketing collateral and customer-success documentation cite SPS v3 §15.3 Moment 1's "no mid-bid walls at $199/bid" verbatim; the product ships the §34.2.5 reading and sellers who paid $199 hit walls anyway. This generates refund disputes referencing the SPS v3 promise. Mitigation: the recommendation's intra-spec rewrite removes the conflict at its source; the §22.18.4 KB Value Meter and §44.6.5 telemetry observability further surface refund-rate drift before it compounds.

All 3 failure modes are addressed by the recommendation's combination of (i) §34.2.5 paragraph rewrite, (ii) `BidWorkspace.solo_per_bid_elected_at` field addition, (iii) deploy-time validator, (iv) §44.6.7 #8 + §34.2.5 failure-mode row clarifications. No additional defects filed.

### 8.3 Self-Challenge Pass for D-14.2-012 (Hostile-Reviewer Persona)

**Test 1: Is the contradiction load-bearing or stylistic?** The §34.2.5 line 29250 reading materially changes engineering behavior — under the literal reading, the engine-absorbed envelope is inactive pre-submit and the seller hits the Free $5 hard cap during drafting. Under the §44.6 reading, the envelope activates on Solo per-bid election and the seller never sees the wall. These produce different products. **Load-bearing.**

**Test 2: Is a thoughtful staff engineer's resolution the same as another thoughtful staff engineer's?** Two engineers reading §34.2.5 alone would build the literal reading. Two engineers reading §44.6 alone would build the envelope-on-election reading. Two engineers reading both would resolve toward §44.6 (per CLAUDE.md §2 source-of-truth and §44.6's authoritative-landing claim per Phase 14.10 closeout), but only if they explicitly cross-reference. The cross-reference is not guaranteed; §34.2.5 references §44.6 only via the cross-references block at §44.6 preamble (one-way), not via in-line citation at §34.2.5 line 29250. **Resolution is NOT the same across two readers without an explicit rewrite.**

**Test 3: Is the severity classification defensible under hostile review?** Under the rule-based test (P1 = "missing acceptance criteria … or surface introduced without an Appendix-M row"; P2 = "ambiguous in a way that a thoughtful staff engineer could resolve, but the resolution is not the *same* across two readers"), the seller-side contradiction fits P2 better than P1 because §44.6 IS the authoritative landing (§34.1.2 preamble says "All Solo numerics live here authoritatively"; §44.6 cross-references claim authoritative status). A thoughtful engineer who reads §44.6 end-to-end would build the correct envelope-on-election reading; a less careful engineer working from §34.2.5 alone would build the wrong one. **P2 holds.** Strict-interpretation P1 noted per audit halt-rule discipline.

**Test 4: Is the recommendation sharp?** The recommendation names the exact paragraph to rewrite (§34.2.5 line 29250), provides verbatim replacement text, specifies the field addition (`BidWorkspace.solo_per_bid_elected_at`), names the validator (`seller_solo_per_bid_envelope_activates_on_election`), and identifies the paired Phase 14.1 re-verification rewrite (D-14.1-011) for unified reconciliation. **Sharp.**

**Test 5: Could a hostile reviewer argue the §34.2.5 reading is intentional?** Argument: §34.2.5 was authored as a billing-orchestration section; the "pre-submit Free entitlements" reading is a billing-state contract, not a tier-contract. The seller is on Solo per-bid BILLING MODE pre-submit but Solo per-bid ENTITLEMENTS only post-submit. Counter: this distinction is not honored anywhere else in the spec — the §44.6.3 envelope row references `seller_solo` tier (not a billing-mode-only state); the §44.6.4 throttling contract triggers on `console`-scoped `plan_tier ∈ {buyer_solo, seller_solo}` (not on charge-captured state). Solo per-bid as "billing mode without entitlements pre-submit" is not a state the rest of the spec recognizes. **Hostile-reviewer argument rejected.**

### 8.4 What Was Not Filed in the Re-Verification (And Why)

| Considered concern | Why not filed |
|---|---|
| SPS v3 §5.4 Mid-bid subscription conversion crediting (the $199 credits against first month) vs §34.2.5 Mid-bid subscription conversion row | Reconciles via the §34.2.5 row's explicit credit-against-first-month rule. Tracked as a refinement edge in the D-14.2-012 recommendation's path: a seller who elects Solo per-bid mid-bid, then converts to subscription before submission, should land in `subscription` mode with the $199 credit per the mid-bid conversion row — and the engine-absorbed envelope continues unchanged across the conversion. No defect. |
| SPS v3 §5.4 7-day refund window + buyer-not-opened check vs §34.2.5 Seller Solo refund-eligibility row | Reconciles. No defect. (D-PT-001 P1 pre-filed for the BUYER-side `≤ 3 opens` canonicality drift.) |
| §44.6.3 `seller_solo / Subscription / $5 absorbed value-dollars / month` row vs SPS v3 §5.2 subscription mode | Reconciles. No defect. |
| §44.6.7 #7 Buyer per-eval abandonment ambiguous phrasing "on retry success, the per-evaluation $5 envelope ceiling activates" | Buyer-side ambiguity captured upstream by D-14.1-011's recommendation refinement; the D-14.2-012 recommendation tightens the seller-side equivalent via §44.6.7 #8 clarification. No additional defect filed. |
| §22.20 (Seller Maya Surface Abstraction) compression rules vs SPS v3 §5.5 (Solo Surface discipline) 9-item hide list | Reconciles per the existing D-14.2-008 framing (6 of 9 items present; 3 items missing). No new defects beyond D-14.2-008. |
| §48.7 (M14–M17 Cross-Console & Seller Conversion Mechanics) vs SPS v3 §19 (Seller-Side Network Effects) 7 loops | All 7 reconcile per the existing Phase 14.2 walk. No new defects. |
| §27.11.3 Verification Tier criteria vs SPS v3 §13.2 criteria | Criteria divergence already pre-filed as D-PXC-010 P1. No re-filing. |
| §49.1 Seven-Stage Seller Onboarding Pipeline vs SPS v3 §17.1 seven-stage flow | All 7 stages reconcile. No new defects. |
| SPS v3 §10 capability rate-card unit/window collisions with §34.14.1 (`firecrawl_crawl_dedupe` 7d vs §11 unit 1-page; etc.) | Verified via row-by-row sanity check; reconciles per Phase 34.PXC + Phase 34.1 pre-existing walks. No new defects. |
| SPS v3 §15.3 Moment 4 (KB ceiling) Solo→Starter routing vs §48.1.7 / §48.8.6 CM3 50-entry secondary banner pattern | The Solo-specific 250-entry analog of §48.8.6 CM3's 50-entry secondary banner is implicit in D-14.2-005's table-extension recommendation (extending Moment 4 to fire from `seller_solo → seller_starter` requires a Solo-specific soft-block-banner UX surface, analogous to the existing §48.8.6 CM3 50-entry banner). Not a separate defect. |

### 8.5 Sign-Off (Re-Verification)

- Phase 14.2 re-verification walk completed. 1 net-new defect filed (D-14.2-012 P2 consistency_drift; intra-spec contradiction at §34.2.5 cross-cutting orchestration rule #5 second bullet against §44.6.3 + §44.6.7 + SPS v3 §5.2 + §15.3 Moment 1).
- All 11 pre-filed Phase 14.2 defects re-walked and confirmed `open` with reproducible evidence.
- Outputs: `_audit/CONSISTENCY_DELTA.md → "Seller Pricing v3" → "Phase 14.2 Re-Verification (2026-05-12, second pass)"` block appended (~7 KB); `_audit/DEFECT_LEDGER.md → "Phase 14.2 Re-Verification (2026-05-12, second pass)"` block appended (1 defect row + roll-up + sign-off verdict).
- v7.1.1 stamp gate updated: D-14.2-001 through D-14.2-012 closure (was D-14.2-001 through D-14.2-011); 8 new CI gate runtime wirings (was 7; D-14.2-012's `seller_solo_per_bid_envelope_activates_on_election` joins); 1 §34.2.5 paragraph rewrite (line 29250); 1 §34.2.5 failure-mode row clarification (line 29239); 1 §44.6.7 #8 row clarification; 2 §34.2.5 AC additions (AC #2 clause append + AC #8 new); 1 new BidWorkspace field (`solo_per_bid_elected_at`) registration; AE-14.2-RV-01 ratification queue add (paired with D-14.1-011 AE-14.1-RV-01).
- Cross-coupled remediation passes: §34.2.5 cross-cutting rule #5 first bullet (D-14.1-011 buyer-side) + second bullet (D-14.2-012 seller-side) should land in a single reconciliation pass; the buyer-side and seller-side recommendations share the §34.2.5 paragraph and §44.6 envelope-activation-on-election semantics. M11.3 implementation pack should bundle both validators.
- Phase 14.3 (Master Spec ↔ UX Design of Sourcera) is unaffected by this re-verification; Phase 14.3 was completed in parallel after the original Phase 14.2 walk.
