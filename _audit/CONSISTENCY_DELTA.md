# Sourcera Audit — Consistency Delta

_Cross-document drift inventory between the Master Spec and the companion docs (Buyer Pricing v3, Seller Pricing v3, UX Design, Build Execution Strategy, Linear Execution Blueprint). Populated incrementally by each cross-doc audit prompt; the Phase-14 cross-document reconciliation walk produces the final synthesis._

---

## Phase 34.PXC — Pricing Cross-Document Consistency Walk (2026-05-07)

**Scope.** §34.1 (buyer + seller plan tiers), §34.2 (pricing rows), §34.14 (seller rate card), §34.15 (seller outcome signals), §34.16 (Marketplace Discovery), §34.17 (pricing engineering requirements), §34.18 (financial targets) — vs Buyer Pricing v3 (43 KB; 2026-04-26) and Seller Pricing v3 (72 KB; 2026-04-26).

**Walk produced.** 20 net-new defects (D-PXC-001 through D-PXC-020). Severity distribution: 10 P1 / 6 P2 / 4 P3. Zero P0. Full ledger entries appended to `DEFECT_LEDGER.md`. Scratch findings + counterfactual + self-challenge log at `PHASE34.PXC_FINDINGS.md`.

**Cross-references to defects already in ledger.** D-AS-002 (volume bands inline-restated in BPS/SPS), D-AS-004 (§34.18.3 buyer mix omits Solo), D-AS-005 (§34.18.3 seller mix omits Solo), D-AS-006 (§34 preamble cites BPS v2 / SPS v2), D-AS-011 (cost_base 5% vs Convex 3%), D-AS-012 (§48.8.6 modal claims Starter Match Score numeric).

### Authoritative-Source Inventory by Drift Class

#### Drift Class A — Numerical Plan-Tier Cells

§34.1.1 (Buyer) and §34.1.2 (Seller) plan-tier cells reconcile **cleanly on numerical values** with BPS v3 §3 / SPS v3 §3 (cross-checked via PHASE34.1_FINDINGS.md, which already filed D-PT-001 through D-PT-010 for the per-cell drift). This walk surfaced:

| Cell | MS authoritative | BPS/SPS v3 narrative | Status |
|---|---|---|---|
| Annual / Monthly subscription prices (Free / Solo / Starter / Growth / Scale / Enterprise) | $0/$49/$299/$799/$1,999/Custom | Match | ✅ |
| Per-evaluation Buyer Solo / Per-bid Seller Solo | $199 | Match | ✅ |
| AI Budget per tier | $5/$5/$50/$300/$800/Committed (Buyer); $5/$5/$30/$200/$600/Committed (Seller) | Match | ✅ |
| Volume Discount Bands ($25K/$50K/$100K/$250K thresholds, 10/15/20/25%) | §34.2.4 | Match (D-AS-002 separate companion-doc inline-restatement defect) | ✅ |
| KB Bootstrap allowance (rate-card row 4 vs §34.1.2 vs SPS narrative) | Triple-conflict | DRIFT (D-PXC-003) | ❌ |
| Seller Page Enrichment allowance (rate-card row 8 vs §34.1.2 vs SPS narrative) | 36×–80× drift | DRIFT (D-PXC-004) | ❌ |
| Match Scoring numeric (rate-card row 10 vs §34.1.2 vs SPS §2.5) | Free/Starter granted; entitlement gate at Growth+ | DRIFT (D-PXC-005) | ❌ |
| Firecrawl page-processing (rate-card row 6 vs §34.1.2 source-count) | Free 50 lifetime vs Free 0 sources | DRIFT (D-PXC-006) | ❌ |
| First-Pass RFP Draft Free allowance (rate-card row 1 cite to §34.1.2) | "Free = 25 lifetime" not in §34.1.2 | DRIFT (D-PXC-007) | ❌ |
| Verification Tier criteria (Verified / Certified) | MS §34.16.2 vs SPS v3 §13.2 disagree | DRIFT (D-PXC-010) | ❌ |
| Verification Tier plan-gating | §34.16.2 narrative says "all plans"; §34.1.2 + SPS gate Solo+/Growth+ | DRIFT (D-PXC-011) | ❌ |
| Free-to-paid scorecard definition (Solo omitted) | §34.18.5 buyer + seller | DRIFT (D-PXC-015) | ❌ |
| Year-1 Plan Mix (Solo omitted from §34.18.3) | Already filed D-AS-004 / D-AS-005 | DRIFT | ❌ (existing) |

#### Drift Class B — Citation / Section-Number Drift (BPS / SPS v2 → v3 renumbering)

| Master Spec section | Cited BPS/SPS section | Actual location in v3 | Defect |
|---|---|---|---|
| §34 preamble (citation key) | "BPS v2 / SPS v2" | "BPS v3 / SPS v3" | D-AS-006 (filed) |
| §34.1.1 cells | `BPS §6/§7/§8/§10` (v2 numbering) | BPS v3 §7/§8/§9/§10 (renumbered) | D-PXC-019 |
| §34.15.1 source col (12 rows) | `SPS §10 row N` (v2 numbering) | SPS v3 §11 row N | D-PXC-008 |
| §34.18.1 source col (`rev_subscription`) | `SPS §11; BPS §11` (v2 Financial Scenarios) | BPS v3 §13 / SPS v3 §14 | D-PXC-020 |
| §34.1.2 Direct Invite from Cohort | `SPS §3 / §7` | Not documented in SPS v3 §7 or §8 | D-PXC-002 |

#### Drift Class C — Retired-Document References (Master Summary)

| Master Spec location | Citation | Status |
|---|---|---|
| §34.1 preamble citation key | `MS = Sourcera_Master_Summary.md §2` | D-PXC-001 |
| §34.14.1 source col (12 rows) | `MS §2.8 row N` | D-PXC-001 |
| §34.15.1 source col (12 rows) | `MS §2.9 row N` | D-PXC-001 (mitigated by §34.15.6 AC #10 frozen-snapshot pointer) |
| §34.17.1 source col (14 rows) | `MS §2.11 item N` | D-PXC-001 + D-PXC-014 |
| §34.17.1 row 13 | `Summary §6.28.2` (orchestrator) | D-PXC-013 |
| §34.17.4 AC #1 | `MS §2.11` (deploy-gate) | D-PXC-014 |
| §34.18.1 (multiple rows) | `MS §2.12` (margin floor / aspirational target) | D-PXC-001 |
| §34.18.6 (preamble) | `Three scenarios referenced in MS §2.12 are authoritative` | D-PXC-001 |

Master Summary is retired in v7.0.0 per CLAUDE.md §2 ("Do not consult"); snapshot at `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. Frozen-snapshot pattern at `_integration/snapshots/MS_2.9_baseline.md` (per §34.15.6 AC #10) is the correct precedent and should be replicated for §2.8 / §2.11 / §2.12.

#### Drift Class D — Plan-Gating Surface Inconsistencies

| Master Spec surface | §34.1 / §34.8.5 entitlement | Drift |
|---|---|---|
| §34.14.1 row 4 (kb_bootstrap Plan Gating) | §34.1.2 KB Bootstrap row | Triple-conflict (D-PXC-003) |
| §34.14.1 row 8 (seller_page_enrichment Plan Gating) | §34.1.2 Seller Page Enrichment row | 36×–80× drift (D-PXC-004) |
| §34.14.1 row 10 (match_score_numeric Plan Gating) | §34.1.2 Match Scoring (numeric) row + §34.8.5 `seller_growth` gate | Free/Starter granted in rate card; gate at Growth+ (D-PXC-005) |
| §34.16.1 (Promoted Listings auction) | §34.1.2 Promoted Marketplace Placements row + SPS v3 §13.1 | No plan-tier gate in auction flow (D-PXC-009) |
| §34.16.2 (Verification narrative) | §34.1.2 Verification Tier Cap row | "Available on all plans" vs Solo+/Growth+ gating (D-PXC-011) |
| §34.18.5 (Free-to-paid scorecard) | §34.1.1 / §34.1.2 Solo registration | Solo omitted from paid-tier list (D-PXC-015) |

#### Drift Class E — Engineering Cross-Link Resolution

| §34.17.1 row | Implemented By citation | Status |
|---|---|---|
| 6 (Usage Dashboard) | UX paths only ("Buyer Console → Billing → Usage") | No §-anchor (D-PXC-018) |
| 13 (Magic-link SSO) | "Summary §6.28.2" (retired) | Cite SPS v3 §15 / §17.2 + new §22.x (D-PXC-013) |

---

## Roll-Up by Severity

| Severity | New defects this walk | Cross-references to existing |
|---|---|---|
| P0 | 0 | — |
| P1 | 10 (D-PXC-001, 003, 004, 005, 009, 010, 011, 013, 014, 015) | D-AS-004, D-AS-005, D-AS-012 |
| P2 | 6 (D-PXC-002, 006, 007, 016, 017, 018) | D-AS-011 |
| P3 | 4 (D-PXC-008, 012, 019, 020) | D-AS-002, D-AS-006 |

## Halt-Rule Application

Audit prompt halt rule: **"ANY DRIFT IS P1."** Pragmatic interpretation applied: numerical / pricing / entitlement drift escalates to P1; bibliographic citation drift remains P3. Strict-interpretation conversion: 14 → 16 P1 (escalating D-PXC-002, D-PXC-016 from P2 to P1; escalating D-PXC-008, D-PXC-019, D-PXC-020 from P3 to P1).

## Recommended Bulk Remediations

1. **Convert §34.14.1 + §34.15.1 source-column citations from "MS / SPS / BPS §N" inline restatements to frozen-snapshot pointers** (mirror §34.15.6 AC #10 pattern). Single sweep closes D-PXC-001 + D-PXC-008 + D-PXC-019 + D-PXC-020 + much of D-AS-006.
2. **Convert §34.14.1 Plan Gating column from inline restatement to `See §34.1.2 [row name]` citations** for every customer-billed row. Closes D-PXC-003 + D-PXC-004 + D-PXC-005 + D-PXC-006 + D-PXC-007 in a single edit pass. Add deploy-time validator `seller_rate_card_plan_gating_single_source`.
3. **Author §34.16.1 plan-tier eligibility check** (Scale + Enterprise gate before promoted-listing auction acceptance). Closes D-PXC-009. Add error code `promoted_listing_plan_tier_ineligible` to Appendix I.
4. **Resolve §34.16.2 Verification criteria conflict** with product/legal sign-off; track in `_integration/Decisions.md` as a Critical Question. Closes D-PXC-010 + D-PXC-011.
5. **Re-cite §34.17.1 row 13 + §34.17.4 AC #1** to SPS v3 narrative + frozen MS §2.11 snapshot. Closes D-PXC-013 + D-PXC-014.
6. **Update §34.18.5 Free-to-paid scorecard rows** to include Solo. Closes D-PXC-015.
7. **Author §34.18.3 Solo plan-mix rows** (D-AS-004 + D-AS-005 — already in remediation backlog).
8. **Sweep BPS v2 → v3 section-number citations across §34.1.1 source column.** Closes D-PXC-019.

---

## Phase 14 Canonicalization Pass (deferred)

This walk feeds the Phase 14 cross-document reconciliation. The Phase 14 walk MUST consume:

- This Phase 34.PXC delta inventory (above);
- All `D-PXC-NNN` rows in DEFECT_LEDGER.md;
- PHASE34.PXC_FINDINGS.md scratch log (counterfactual + self-challenge);
- Cross-references to D-AS-NNN, D-PT-NNN (PHASE34.1), D-CONS-NNN (PHASE_CONS), D-V6-NNN (PHASE34.16) defects already filed.

The recommended bulk remediations above are the seed of the v7.1.1 backlog reconciliation entries.

---

## Buyer Pricing v3

_Phase 14.1 — `Sourcera_Buyer_Pricing_Strategy.md` v3 (2026-04-26) ↔ `Sourcera_Master_Spec.md` v7.1.0. Section-by-section consistency walk against §34 (full body), §44.6 (Solo Surface Treatment), §13.11 (Defense View), §34.9 (Onboarding & Trial), §34.17 (Pricing Engineering Requirements), §34.18 (Financial Targets), §51 (PLG Instrumentation). Walk produced 10 net-new defects (D-14.1-001 through D-14.1-010). Severity distribution: 4 P1 / 6 P2 / 0 P3 / 0 P0. Zero numerical-cell drift on plan-tier dollar figures (already cleared by Phase 34.PXC + PHASE34.1). All net-new drift is structural narrative-vs-spec coverage drift — BPS v3 commits to behaviors and metrics the spec does not yet author. Scratch log + counterfactual + self-challenge at `PHASE14.1_FINDINGS.md`. Per CLAUDE.md §2 source-of-truth: every defect recommends updating the spec OR amending BPS v3 narrative; the spec wins on substantive contracts._

### CHECKS — Walk Result Summary

| Check (per Audit_Prompts.md Prompt 14.1) | Result | Drift inventory |
|---|---|---|
| (1) Plan-tier dollar figures match §34.1 buyer rows | ✅ PASS | All 6 plan-tier columns × 30+ rows reconcile (BPS v3 §3 vs §34.1.1 / §34.2.1). Annual / monthly / per-eval prices, AI budgets, vendor / storage / KB caps, watermarking, Defense View, Vendor Pro Trial Seats, integrations, SSO, support tier, wallet-overage availability, API add-on — all match. The remaining D-AS-002 (P1) inline-restatement of Enterprise volume-discount bands and D-PT-001 (P1) Solo refund-window canonicality are pre-filed; not duplicated here. |
| (2) AI Operation pricing model description matches §34.3 / §34.10 / §34.11 | ⚠ PARTIAL | Formula and outcome semantics reconcile — `value = cost_base × 10`, `cost = cost_base × 1.05`, 88% margin floor, 22-capability rate-card publish, OutcomeContract `accepted` / `auto_accepted` / `rejected` / `reversed` settlement, accept/reject windows, default-on-timeout `rejected`. Drift: BPS v3 §11 "Solo silent-throttle event rate <5% in 30-day window" target absent from §34.18.5 (D-14.1-004); BPS v3 §12 dynamic-throttling-threshold mechanism implied but §44.6.4 specifies only fixed 80% with manual override (D-14.1-008); D-AS-003 (P3) §34.3.3 cost-base double-citation and D-AS-011 (P2) Convex 3% vs §34.14.1 5% infra overhead drift are pre-filed. |
| (3) Outcome-based consumption framing matches §34 | ✅ PASS | BPS v3 §2.4 outcome accounting, BPS v3 §8 wallet rate card (22 capabilities including new `defense_view_generate`), BPS v3 §10 #1–#10 platform features (AI Wallet, Outcome Resolver, Cost-Base Recalc, Spend Cap, Notifications, Usage Dashboard, Payment Gating, Downgrade-Safe State, Audit Log of Billing Events, Rate Card Publisher) all map cleanly to §34.10 / §34.11 / §34.3 / §34.6 / §40.4 / §4.8.9 / §34.17. Defense View Generate (`defense_view_generate`) is registered in §13.11.5 with full OutcomeContract; rate-card row absence from §34.3.4 illustrative subset is by design (catalog is dynamic per §34.3.4 closing paragraph). |
| (4) Free / Solo / paid tier scenarios match | ⚠ PARTIAL | Scenarios A / B / C reconcile (BPS v3 §13 vs §34.18.6). Scenario D (Solo cohort: 200 sub × $49 × 12 + 800 per-eval × $199 = $276,800; ~92% margin) is absent from §34.18.6 (D-14.1-001). Year-1 plan mix (Solo subscription / Solo per-eval split) absence from §34.18.3 is pre-filed as D-AS-004. |
| (5) Every concept in Buyer Pricing exists in spec; flag missing | ❌ FAIL | 5 concepts gaps: 90-day Solo trial for v2-cohort migration (D-14.1-002); Solo→Starter upgrade-CTA throttling-threshold trigger (D-14.1-003); Solo cohort margin / leading-indicator instrumentation (D-14.1-005, D-14.1-006); Selection Report v2 watermarking grandfathering rule (D-14.1-007); BPS v3 §10 #11–#15 Solo-platform engineering features missing from §34.17 enumeration (D-14.1-010); BPS v3 §5.5 surface-discipline items partially in §44.6.1 (D-14.1-009). |

### Section-by-Section Walk

#### BPS v3 §1 — Executive Summary

**Status:** ✅ Reconciled.

Six-plan structure, per-organization pricing, AI-budget-included, per-evaluation alternative on the on-ramp — all map to §34.1.1 / §34.2.1. The "≥90% blended gross margin at steady state" statement reconciles to §34.18.1 aspirational target with the 88% hard floor at §34.3.3 (the 88%/90% reconciliation is canonically authored at §34.18.2 — Authored Extension already ratified).

#### BPS v3 §2 — Strategic Decisions

| Decision | Spec home | Status |
|---|---|---|
| §2.1 Per-organization flat pricing, unlimited seats | §34.2.3 #2; §34.4 (Seats row) | ✅ |
| §2.2 Bundled plans, no per-feature billing toggles | §34.4 invariant; §5.11 governance separation | ✅ |
| §2.3 No per-unit metering on structural resources | §34.4 (12-row resource list) | ✅ |
| §2.4 Outcome-based pricing as internal accounting | §34.3.1 / §34.3.2 / §34.11 | ✅ |
| §2.5 API as $99/mo add-on; not on Solo | §34.1.1 (API Add-On row) | ✅ |
| §2.6 Cost-multiplier formula, quarterly review | §34.3.1 / §34.3.3 | ✅ (D-AS-003 P3 dual-citation drift pre-filed) |
| §2.7 Solo as $49/mo or $199/eval personal-card on-ramp | §34.1.1 / §34.2.1 / §34.2.5; §44.6 | ✅ |
| §2.8 Solo invisible AI consumption (engine-only metering, surface-hidden) | §34.10.3 Solo-co-resident rule; §44.6.1 surface hide list | ✅ |

#### BPS v3 §3 — Plan Architecture at a Glance

**Status:** ✅ Reconciled (numerical pass).

Every cell in the BPS v3 §3 6-column × 30-row plan-architecture table reconciles with §34.1.1 / §34.2.1 / §34.1.2 cross-cells (Vendor Pro Trial Seats row reads to §34.1.1 Buyer side). The "Vendor response to invited bids: Free forever" footer is authoritative at §34.2.3 #3. The "Buyer-Funded Pro Trial Seat (M17)" footer is canonical at §34.13. The Enterprise volume-discount overage band restatement is filed as D-AS-002 (P1).

#### BPS v3 §4 — Free Plan

**Status:** ✅ Reconciled.

$5 AI budget, 25 vendors, 1 GB storage, 50 KB items, 1 active eval, watermarked Selection Report, Defense View preview-only, no wallet overage (hard cap), no API access, Opus capabilities gated — all reconcile to §34.1.1, §34.10.4, §13.11.4, §34.10.6.

#### BPS v3 §5 — Buyer Solo Plan

| BPS v3 §5.x | Spec home | Status |
|---|---|---|
| §5.1 Pricing options ($49 ann / $59 mo / $199/eval) | §34.2.1; §34.2.5 | ✅ |
| §5.2 Included (Unlimited vendors-within-1-eval, 5 GB, 50 KB, full Defense View, unwatermarked Selection Report, 90-day post-eval retention) | §34.1.1; §13.11.4; §34.2.5 | ✅ |
| §5.3 Solo→Starter upgrade triggers (2nd concurrent eval, > 2 stakeholders, ≥3 throttle/30d, Opus capabilities, Enterprise controls, API, wallet overage, Pro Trial Seats) | §34.5 (plan-change); §34.1.1 ceilings; §34.5.1 carry-over; §44.6.5 events | ⚠ PARTIAL — the **≥3 throttle events / 30 day window** trigger is the only one not registered in spec (D-14.1-003) |
| §5.4 Per-evaluation billing mechanics (charge trigger on PDF export, 7d refund w/ ≤3-open check, 90-day retention, mid-eval conversion crediting) | §34.2.5 | ✅ (Solo refund-threshold canonicality already P1 D-PT-001) |
| §5.5 Surface discipline (8-item Solo hide list) | §44.6.1 (10-item authoritative hide list) | ⚠ PARTIAL — 5 of 8 items present (AIOp metering, value-dollars, wallet, per-capability spend, plan-tier matrix-related); 3 items missing or partial: "13-phase pipeline rendered as 4-step compressed surface" (in §3.14 / §22.20 — ✅ via cross-ref); "SLA timers and Pulse Health Score replaced with single deadline countdown + 'what to do this week' panel" (NOT in §44.6.1, NOT in §16; D-14.1-009); "Stakeholder cohort taxonomy auto-assigned from email-domain heuristics on invite" (NOT in §44.6.1, NOT in §13.5; D-14.1-009) |
| §5.6 Fit | n/a (positioning) | n/a |
| §5.7 Anti-fit | n/a (positioning) | n/a |

#### BPS v3 §6 — Business Plan (Three Sub-tiers)

**Status:** ✅ Reconciled.

Starter / Growth / Scale rows match §34.1.1 / §34.2.1; Scale's "Optional wallet overage with preferred rate (5% off overage)" matches §34.1.1 (Wallet Overage row). 5/mo Vendor Pro Trial Seats on Scale, 15/mo on Enterprise — match.

#### BPS v3 §7 — Enterprise Plan

**Status:** ✅ Reconciled (numerical), ⚠ on integration-target enumeration.

$3,000/month floor, $12K/yr committed AI minimum, dedicated CSM + QBR, 99.9% uptime + 4-hour critical SLA — all match §34.2.3 #6, §34.1.1 / §34.1.2 SLA row, §34.2.4 (volume bands). BPS v3 §7 enumerates Coupa / Ariba / ServiceNow / NetSuite as named custom-integration targets; spec is silent on named ERP / Procurement integrations (handled generically as "Custom Integrations: Scoped per contract" at §34.1.1). Not filing — companion-doc enumeration of partner systems is acceptable narrative latitude where the spec authors generic capability.

#### BPS v3 §8 — Overage Pricing (Wallet)

**Status:** ✅ Reconciled.

Wallet defaults off, admin must enable, daily/weekly/monthly caps, soft 80% notification + hard cap, auto-topup off by default, value-vs-cost rate card with 22 illustrative rows including new `defense_view_generate` Sonnet $0.80/$0.10 — all reconcile to §34.10.2 / §34.10.4 / §34.3.4. The §34.3.4 illustrative subset omits `defense_view_generate` row but the closing paragraph correctly states the full catalog is the union of CapabilityRegistryEntry rows + PricingTableVersion snapshot — `defense_view_generate` is registered in §13.11.5 and joins the live published rate card on first cost_base recalc per §13.11.5 closing paragraph.

#### BPS v3 §9 — API Access Add-On

**Status:** ✅ Reconciled.

$99/mo on any Business tier, included in Enterprise, NOT on Solo, rate-limited per tier (Starter 60 / Growth 300 / Scale 1,200 req/min), webhooks included, "integration plane not AI reseller plane" framing — match §34.1.1 + §32.4 rate-limit-class table.

#### BPS v3 §10 — Required Platform Features (Engineering Requirements)

| BPS v3 §10 # | Feature | §34.17.1 / §34.17.1.b row | Status |
|---|---|---|---|
| #1 AI Wallet service | §34.17.1 #1 | ✅ |
| #2 Outcome resolver | §34.17.1 #2 | ✅ |
| #3 Cost-base recalculation job | §34.17.1 #3 | ✅ |
| #4 Spend cap enforcement (hard block) | §34.17.1 #4 | ✅ |
| #5 Budget notifications (50/80/100) | §34.17.1 #5 | ✅ |
| #6 Usage dashboard | §34.17.1 #6 | ✅ |
| #7 Payment gating | §34.17.1 #7 | ✅ |
| #8 Downgrade-safe state | §34.17.1 #8 | ✅ |
| #9 Audit log of billing events | §34.17.1 #9 | ✅ |
| #10 Rate card publisher | §34.17.1 #12 | ✅ |
| **#11 Solo-tier billing surface** *(new in v3)* | **NOT in §34.17 enumeration** (implementation lives at §44.6.2) | ❌ D-14.1-010 |
| **#12 Per-evaluation Stripe charge orchestration** *(new in v3)* | **NOT in §34.17** (implementation lives at §34.2.5) | ❌ D-14.1-010 |
| **#13 Selection Report watermarking** *(new in v3)* | **NOT in §34.17** (implementation lives at §13.11.4 + §34.1.1) | ❌ D-14.1-010 |
| **#14 Defense View preview gating** *(new in v3)* | **NOT in §34.17** (implementation lives at §13.11.4) | ❌ D-14.1-010 |
| **#15 Solo-tier silent throttling** *(new in v3)* | **NOT in §34.17** (implementation lives at §44.6.4) | ❌ D-14.1-010 |

§34.17 is the authoritative single-source pricing-engineering enumeration (per §34.17 AC #2). The 5 v3 Solo-additions are implemented across §44.6 / §34.2.5 / §13.11 but never registered in §34.17.1 (MS §2.11 baseline is fixed at 14) or §34.17.1.b (Authored Extensions Beyond MS §2.11 — currently AE-1 through AE-11). Single P1 (D-14.1-010) recommends 5 new AE rows (AE-12 through AE-16) under §34.17.1.b with Phase 2 Delivery Track citing §44.6.8 / §13.11.13 / §34.2.5 acceptance criteria.

#### BPS v3 §11 — PLG Motion

| BPS v3 §11 element | Spec home | Status |
|---|---|---|
| Free → Solo / Starter / Growth / Scale / Enterprise paid path with 4-step ceiling-trigger orchestration | §34.5 / §48 (Growth Loops) | ✅ (narrative) |
| Watermarked Selection Report leadership-meeting moment fires Solo CTA | §13.11.4 (preview displays Solo upgrade CTA) | ✅ |
| Defense View preview wall fires Solo CTA | §13.11.4 | ✅ |
| Solo expansion: 2nd concurrent eval | §34.5; §34.1.1 (Active Evaluations) | ✅ |
| Solo expansion: ≥3 throttle events / 30d (subscription) or per-eval envelope hit (per-eval) | NOT in spec | ❌ D-14.1-003 |
| Solo expansion: > 2 stakeholders / multi-eval stakeholders | §34.5; §34.1.1 (default `evaluation_owner_mode=solo`); §4.3.1 stakeholder transition logic | ✅ |
| Business expansion: Growth upsell at 80% budget utilization for 2 consecutive months | NOT explicitly in §34.5 nor §34.18.5 | ⚠ partial — captured behaviorally via §34.10.2 80% threshold notification, but the **upgrade** (vs. soft notification) trigger threshold is unstated |
| Enterprise trigger | §34.2.3 #6; §34.1.1 SLA / SSO / DPA gating | ✅ |
| **Leading indicator: Free → Solo conversion %** | NOT in §34.18.5 / §51 | ❌ D-14.1-006 |
| **Leading indicator: Free → Starter direct conversion %** | §34.18.5 has generic "Free → any paid Buyer tier ≥ 3% within 90d" (no Solo-skip breakout) | ❌ D-14.1-006 |
| **Leading indicator: Solo subscription → Starter conversion % at 90 days** | NOT in §34.18.5 | ❌ D-14.1-006 |
| **Leading indicator: Solo per-eval ($199) repeat-purchase rate within 12 months** | NOT in §34.18.5 | ❌ D-14.1-006 |
| Days to first Pre-Scoring on Free | NOT in §34.18.5 / §51 (activation funnel review mentioned but metric not enumerated) | ❌ D-14.1-006 |
| % of Free hitting AI budget ceiling | NOT in §34.18.5 (engine fires `wallet_threshold_crossed` per §34.10 but cohort metric not in scorecard) | ❌ D-14.1-006 |
| **% of Free hitting Defense View preview wall (drives Solo conversion)** | NOT in §34.18.5 / §51 | ❌ D-14.1-006 |
| **% of Free that export a watermarked Selection Report (signals leadership-meeting moment)** | NOT in §34.18.5 / §51 | ❌ D-14.1-006 |
| Starter → Growth expansion % at month 3 | NOT in §34.18.5 (generic "MoM growth ≥ 5%" ≠ Starter→Growth funnel) | ❌ D-14.1-006 |
| Wallet opt-in % on Business tiers | §34.18.5 ("Wallet overage opt-in rate < 20%") | ✅ |
| Rejected-op rate per capability | §34.18.5 ("Contest approval rate (rolling 30d) < 15%") + §34.15.4 outcome signal recalibration | ✅ (proxy) |
| **Solo-tier silent-throttle event rate target (<5% of Solo accounts in any 30-day window)** | NOT in §34.18.5 | ❌ D-14.1-004 |
| **Blended margin per plan, including Solo subscription and Solo per-eval as separate cohorts** | §34.18.5 has `rev_ai_wallet` blended margin; per-plan / Solo-broken-out absent | ❌ D-14.1-005 |

11 of 13 distinct BPS v3 §11 leading indicators are absent from the spec scorecard (§34.18.5) or the §51 PLG instrumentation registry. The two metric clusters "Solo throttle event-rate" and "per-cohort margin breakouts" are filed as discrete defects (D-14.1-004 + D-14.1-005) because they each require distinct engineering scope (event aggregator + per-plan margin attribution); the remaining 9 narrative-funnel metrics are filed as a single P2 (D-14.1-006) because they share a single PostHog-event + Finance-scorecard remediation.

#### BPS v3 §12 — Cost Adaptability

**Status:** ⚠ PARTIAL.

Value/cost formula adaptation, value-dollar denomination, quarterly rate-card review, 30-day-advance customer notification + annual-contract grandfathering — all reconcile to §34.3.1 / §34.3.3 / §34.2.3 #7 / §34.5.1.

Drift: BPS v3 §12 paragraph 5 ("Solo's absorbed envelope is denominated in value-dollars and adapts identically. If Anthropic prices move, Sourcera silently adjusts the throttling threshold; the operator's $49/mo or $199/eval price holds. The throttle event rate becomes the leading indicator that envelope sizing needs adjustment.") implies an automatic / dynamic Solo-throttling-threshold adjustment mechanism. Spec §44.6.4 specifies fixed default `throttling_threshold = 80%`, range 50–95, configurable per-capability via §4.8.2 Ops Finance manual edit only; no automatic adjustment loop is wired. **D-14.1-008** (P2) — recommends either authoring the dynamic-adjustment mechanism in §44.6.4 (likely a CostBaseRecalculationLog `drift_severity ≥ alert_10_25`-driven threshold-update orchestration with Ops-Finance approval gate) OR amending BPS v3 §12 to "Sourcera Ops adjusts the threshold via §4.8.2 manual override on Finance review of the throttle-event rate" to remove the implied automation.

#### BPS v3 §13 — Financial Scenarios

| Scenario | Spec home | Status |
|---|---|---|
| Scenario A — 100 Starter customers (~96.2% margin) | §34.18.6 Scenario A | ✅ (illustrative parity; detailed numbers not duplicated, BPS-side authoritative for scenario decomposition) |
| Scenario B — 30 Growth customers (~94.4% margin) | §34.18.6 Scenario B | ✅ |
| Scenario C — 10 Scale + 5 Enterprise (~42.8% blended; Enterprise gating defended by $3K/mo floor + $12K AI commit) | §34.18.6 Scenario C | ✅ |
| **Scenario D — Solo cohort (200 sub × $49/mo + 800 per-eval × $199; $276,800 revenue; ~92% margin)** *(new in v3)* | **NOT in §34.18.6** | ❌ D-14.1-001 |
| Blended target mix (Year 1 exit, v3): 35% Solo sub / 25% Solo per-eval / 20% Starter / 12% Growth / 6% Scale / 2% Enterprise | §34.18.3 Buyer Year-1 mix omits Solo (Free 60% / Starter 15% / Growth 10% / Scale 10% / Enterprise 5%) | ❌ D-AS-004 (pre-filed P1) |
| Blended gross margin target ≥ 90% | §34.18.1 aspirational | ✅ |

#### BPS v3 §14 — Migration from v2

| Migration concept | Spec home | Status |
|---|---|---|
| v2→v3 deltas table (plan count 5→6, Solo tier added, watermarked Free SR, Defense View, Solo invisible AI consumption, default surface mode, PLG paid path, outcome-accounting visibility, rate card 21→22 capabilities) | §34.1.1 / §34.2.5 / §44.6 / §13.11 / §34.3.4 / §13.11.5 | ✅ (delta authoritatively landed in Phase 14.4–14.10) |
| Phase 14.9 Master Spec scaffolding edits (§34.1.1 / §34.1.2 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.10.5 / §34.12.1 / §34.12.6 / §34.12.8 / §39 / §5.11 / Appendix J / Appendix M) | All listed sections | ✅ (verified end-to-end) |
| Pending §44 + §21.4 / §21.4.5 + §5.11 inline plan-tier list audit | §44.6 (Phase 14.10 — landed); §21.4 / §21.4.5 (`defense_view_generate` registered at §13.11.5 — landed); §5.11 inline plan-tier list audit pending v7.1.1 mechanical pass | ✅ partial (already in CLAUDE.md §16 v7.1.1 backlog) |
| **"Existing Free customers receive an in-app announcement of the Solo tier with a 90-day Solo trial offer (no credit card; auto-downgrades to Free at trial end)"** | **NOT in §34.9** (only 14-day Business Starter trial documented; no 90-day Solo trial mechanism) | ❌ D-14.1-002 |
| Existing Business customers unaffected (no tier / price changes) | n/a (default behavior, no spec authoring needed) | ✅ |
| **"Selection Reports generated under v2 retain their unwatermarked status (grandfathered); v3 watermarking applies to new Free-tier exports only"** | **NOT in §13.11 / §34.5 / §34.6 migration policy** | ❌ D-14.1-007 |

#### BPS v3 §15 — Positioning and Messaging

**Status:** n/a (narrative only; not authoritative for engineering behavior). The "13-phase pipeline (rendered as 4-step Setup → Define → Score → Decide compressed surface for first-time owners)" framing aligns with §3.14 Pipeline surface compression + §2.8 Single-Operator Mode + §22.20 Seller Maya Polish + §44.6 Solo-Tier Surface Treatment.

#### BPS v3 Appendix A — Full 22-Capability Rate Card

**Status:** ✅ Reconciled (process-authoritative).

"Generated from Master Spec §21.4 with cost_base computed per capability at current Anthropic pricing and multiplier applied" — matches §34.3.1 formula and §4.8.9 PricingTableVersion publishing pattern. "Solo accounts continue to consume capabilities from their absorbed envelope; the rate card is engineering-transparent, never operator-facing" — matches §44.6.6 Public Pricing API behavior on Solo.

#### BPS v3 Appendix B — Outcome Signals per Capability

**Status:** ✅ Reconciled.

8 illustrative rows + new `defense_view_generate` ("Operator opens the view at least once before recommendation is presented to leadership; window 90d") match §34.11.1 + §13.11.5 OutcomeContract specification (`accepted` signal `DefenseView.opened_at IS NOT NULL within 90 days of generated_at`; window 90d; `default_on_timeout=rejected`). The "Default on timeout: rejected" footer matches §4.8.4 AC #5 and §34.11.1 closing paragraph.

### Roll-Up by Severity

| Severity | New defects this walk | Cross-references to existing |
|---|---|---|
| P0 | 0 | — |
| P1 | 4 (D-14.1-001, D-14.1-002, D-14.1-003, D-14.1-010) | D-AS-004 (Year-1 plan-mix Solo omission); D-AS-002 (Enterprise volume bands inline restated); D-PT-001 (Solo refund-window canonicality) |
| P2 | 6 (D-14.1-004, D-14.1-005, D-14.1-006, D-14.1-007, D-14.1-008, D-14.1-009) | D-AS-011 (Convex 3% vs §34.14.1 5% drift); D-PXC-015 (Free-to-paid scorecard Solo omission) |
| P3 | 0 | D-AS-003 (§34.3.3 dual-citation); D-AS-006 (§34 preamble v2 citation) |

### Halt-Rule Application

Audit prompt halt rule per Audit_Prompts.md Prompt 14.1: **"ANY DRIFT IS P1 consistency_drift; spec wins per CLAUDE.md §2; file the defect against the strategy doc with a recommendation to update."**

**Pragmatic interpretation applied** (consistent with PHASE34.PXC walk precedent): structural narrative-vs-spec coverage drift is escalated to P1 when the spec gap renders a BPS v3 commitment unbuildable as written (D-14.1-001 Scenario D, D-14.1-002 90-day trial, D-14.1-003 throttling-threshold trigger, D-14.1-010 §34.17 Solo-additions enumeration); narrative-only or instrumentation-only coverage drift remains P2 (D-14.1-004 through D-14.1-009).

**Strict-interpretation conversion:** 4 → 10 P1 (escalating D-14.1-004 through D-14.1-009 from P2 to P1). The strict-interpretation list is recorded for v7.1.1 backlog completeness; recommendation stands at the pragmatic-interpretation severity assignment.

**Authoritative resolution:** All 10 defects resolve **per CLAUDE.md §2 source-of-truth: Master Spec wins.** Recommendation is to extend the spec to cover the BPS v3 commitments (or amend BPS v3 narrative when the implied automation is genuinely absent — D-14.1-008 case). No defect recommends BPS v3 narrative being authoritative over the spec.

### Recommended Bulk Remediations

1. **Author §34.18.6 Scenario D (Solo cohort).** Single new sub-section under §34.18.6 with the BPS v3 §13 financial decomposition adopted verbatim (200 subscribers × $49/mo × 12 + 800 per-eval × $199; AI COGS $1,728; Stripe processing ~$9,000; refund reserve 5% of per-eval volume; ~92% margin). Cite BPS v3 §13. Closes D-14.1-001.
2. **Author §34.9.4 90-Day Solo Trial (v2-cohort migration).** Mirror §34.9.1 14-day Business Starter trial pattern — trigger (existing Free customers on v2→v3 cutover); effective plan `buyer_solo`; wallet (Solo absorbed envelope); end-of-trial behaviors at day 91 (with vs without payment method); trial-expiry notification cadence (day 80 / day 89 / day 91); audit events `org.solo_trial_started` / `org.solo_trial_ended` (new Appendix C entries); abuse controls (one trial per Org per legal_entity per lifetime to prevent multi-account gaming). Closes D-14.1-002.
3. **Author Solo→Starter throttling-threshold upgrade trigger.** New row in §34.5 (Plan Upgrade) or extension to §44.6.5 telemetry: trigger `solo.envelope.throttling_engaged ≥ 3 events in rolling 30-day window per (org_id, console)` fires `org.solo_throttling_upgrade_cta_triggered` event (new Appendix C entry; PostHog event in Appendix G); upgrade-CTA renders in the §44.6.4 throttling toast or in the §44.6.2 single-card billing surface (UX decision). Per-eval mode equivalent: any per-eval envelope hit fires the same trigger immediately (no rolling-window aggregation). Add §44.6.8 acceptance criterion `solo_upgrade_cta_threshold_3_events_30d`. Closes D-14.1-003.
4. **Author §34.18.5 + Appendix G Solo cohort metrics.** Add scorecard rows for: Solo silent-throttle event rate < 5% per 30-day cohort (action on breach: capability-registry envelope-override review); per-cohort blended margin (Solo subscription / Solo per-eval as separate `rev_ai_wallet` cohorts); BPS v3 §11 leading indicators (Free→Solo / Free→Starter-direct / Solo-sub→Starter-90d / Solo-per-eval-repeat-purchase / Defense-View-preview-wall-hit / watermarked-SR-export-rate / Days-to-first-Pre-Scoring / %-Free-hitting-budget-ceiling / Starter→Growth-expansion-month-3). Each metric registers a PostHog event in Appendix G. Closes D-14.1-004 + D-14.1-005 + D-14.1-006.
5. **Author Selection Report v2-watermarking grandfathering.** New row in §34.5.1 carry-over rules and §13.11.4 Plan Gating table: SelectionReport rows with `created_at < v3_watermarking_effective_at` retain their unwatermarked PDF render rule across all subsequent regenerations (the v2 immutable-render snapshot is preserved). v3 watermarking applies only to SelectionReport rows with `created_at ≥ v3_watermarking_effective_at` AND `org.plan_tier = buyer_free`. Add §13.11.13 acceptance criterion `selection_report_v2_watermark_grandfathering`. Closes D-14.1-007.
6. **Resolve Solo dynamic-throttling-threshold ambiguity.** Either: (a) author the dynamic-adjustment mechanism in §44.6.4 (CostBaseRecalculationLog `drift_severity ≥ alert_10_25` triggers `solo.envelope.threshold_recalibration_pending` Ops-Finance review queue; on approval, the per-capability `throttling_threshold` updates with audit + PostHog event), OR (b) amend BPS v3 §12 to remove the implied automation. Decision logged in `_integration/Decisions.md` as a Critical Question (Pricing Strategy + Engineering joint signoff). Closes D-14.1-008.
7. **Extend §44.6.1 Solo surface hide list with 3 BPS v3 §5.5 items.** Add: (#11) Plan-tier matrix surfacing — Solo operator sees only their plan; tier names appear only at upgrade-CTA moments (cite §34.5 surface); (#12) SLA-timer + Pulse Health Score replacement on Solo — replace with single deadline countdown (already at §13.11.3 header) + new "what to do this week" panel (NEW; author at §16.x as Solo-mode replacement for Pulse Health Score); (#13) Stakeholder cohort taxonomy auto-assignment from email-domain heuristics on invite (NEW; author at §13.5 or §13.12 as Solo-mode auto-assignment behavior, with explicit fallback to manual cohort selection on > 2 stakeholders trigger). Closes D-14.1-009.
8. **Register BPS v3 §10 #11–#15 as §34.17.1.b Authored Extensions AE-12 through AE-16.** Add 5 rows to §34.17.1.b table: AE-12 (Solo-tier billing surface — implemented by §44.6.2; AC §44.6.8 #2; Phase 2); AE-13 (Per-evaluation Stripe charge orchestration — §34.2.5; AC §34.2.5; Phase 2); AE-14 (Selection Report watermarking — §34.1.1 + §13.11.4; AC §13.11.13; Phase 1); AE-15 (Defense View preview gating — §13.11.4; AC §13.11.13; Phase 1); AE-16 (Solo-tier silent throttling — §44.6.4; AC §44.6.8 #4–#7; Phase 1). Each AE rationale cites BPS v3 §10 #11–#15 as the source. Update §34.17 AC #2 deploy gate `pricing_engineering_coverage` to assert the §34.17.1.b row count is ≥ 16 post-v7.1.1. Closes D-14.1-010.

### Phase 14 Canonicalization Pass (this row)

This walk feeds the same Phase 14 cross-document reconciliation that Phase 34.PXC seeded. The Phase 14 walk MUST consume:

- This Buyer Pricing v3 delta inventory (above);
- All `D-14.1-NNN` rows in DEFECT_LEDGER.md;
- PHASE14.1_FINDINGS.md scratch log (counterfactual + self-challenge);
- Cross-references to D-AS-NNN, D-PT-NNN (PHASE34.1), D-PXC-NNN (PHASE34.PXC), D-CONS-NNN (PHASE_CONS) defects already filed.

The 8 recommended bulk remediations above are the seed of the Buyer-Pricing-v3 v7.1.1 backlog reconciliation entries.

### Phase 14.1 Re-Verification (2026-05-12, second pass)

_Re-run of the Phase 14.1 audit prompt issued same day after the original walk closed at 15:04. Independent end-to-end re-read of `Sourcera_Buyer_Pricing_Strategy.md` v3 (549 lines) and `Sourcera_Master_Spec.md` v7.1.0 §34 (full body) / §44.6 / §13.11 / §34.9 / §34.17 / §34.18 / §51 with a clean Opus context. Posture: append-only — pre-existing D-14.1-001 through D-14.1-010 carried forward without re-filing._

**Re-verification of the 10 pre-filed defects.** Each defect's evidence was re-walked against the current Master Spec text at the cited section anchor and the BPS v3 line numbers. All 10 defects remain reproducible, severity classifications still hold under the rule-based test, and recommendations remain sharp. No defects retired; no defects superseded; no defects re-classified.

**Net-new finding (1).** Re-read of §34.2.5 (Solo-Tier Per-Eval / Per-Bid Charge Orchestration) cross-cutting orchestration rule #5 surfaced an **internal contradiction** not captured by Phase 14.1. The first bullet states "Workspace creation is GATED until charge captures" but immediately negates that claim in the parenthetical: "Buyer Solo per-eval flow charges on Selection Report export, NOT on Workspace creation — so a Workspace can be authored, edited, and finalized BEFORE the $199 charge fires; Free-tier ceilings apply during the work." The parenthetical, the BPS v3 §5.4 source, and the §34.2.5 row's authoritative `Charge trigger = Operator clicks "Export Selection Report PDF"` together establish the intended contract: **PDF export is gated, Workspace creation is NOT gated**. The opening sentence is therefore a copy-paste residue from a different gating model (likely an earlier draft where charge fired at Workspace creation). The next bullet in the same rule correctly says "Bid Workspace creation is NOT gated", reinforcing that creation-gating was never intended on the Buyer side either. A junior engineer reading the first bullet in isolation could legitimately build a Workspace-creation gate that blocks Buyer Solo per-eval operators from authoring evaluations before paying — a wrong build directly contradicted by the Charge-trigger row above. Filed as **D-14.1-011 (P2 consistency_drift)**.

**Severity rationale (D-14.1-011).** Per Severity Definitions: "P2 — ambiguous in a way that a thoughtful staff engineer could resolve, but the resolution is not the *same* across two readers." This rule applies: one reader follows the opening sentence ("creation gated"), another follows the parenthetical + Charge-trigger row + bullet-#5-Bid-Workspace symmetry ("export gated; creation not gated"). The strict-interpretation halt rule ("ANY DRIFT IS P1 consistency_drift") nominally escalates to P1, but the drift is an intra-section authoring artifact (not BPS-v3-vs-spec coverage drift); the spec is internally inconsistent rather than narrative-vs-spec inconsistent. Recorded as P2 with strict-interpretation P1 note for v7.1.1 backlog completeness.

**Counterfactual pass (D-14.1-011).** Three failure modes:
1. **Engineering builds a creation gate.** PR lands a `solo_per_eval_charge_pending` precondition on `POST /v1/workspaces`; first-time Buyer Maya cannot create an evaluation without entering a payment method, defeating the BPS v3 §2.7 personal-card on-ramp rationale ("She has a personal credit card and a CFO who will approve a small per-evaluation expense for 'the tool that produced the recommendation.'"). The §34.2.5 Charge-trigger row would have to be re-litigated. Mitigation: D-14.1-011 recommendation deletes the incorrect opening sentence and rewords bullet #5 to lead with "Workspace creation is NOT gated by the Solo per-evaluation charge." Adequate.
2. **QA writes a creation-blocked acceptance test.** A QA harness asserting `workspace_creation_blocked_until_solo_per_eval_charge_captured` would fail against the (correct) implementation. The §34.2.5 acceptance criteria block (ACs #1–#7) does not include a creation-gate test, so QA would have to invent one from the contradictory bullet. Mitigation: recommendation specifies that the corrected bullet wording propagate to any test fixture authored from §34.2.5.
3. **Customer-success documentation copy drift.** If product marketing reads bullet #5's opening clause, customer onboarding emails could promise that Workspace creation requires payment — contradicting the actual flow Buyer Maya experiences. Mitigation: Loops.so template authoring per the v7.1.1 Solo-cutover backlog should source from the corrected §34.2.5 wording.

**Self-challenge pass (D-14.1-011).** Hostile-reviewer test: could this contradiction be interpreted as "Workspace creation is gated against EXPORT until charge captures" — a stretched reading where "Workspace creation" is a metonym for "Workspace creation of an exportable Selection Report"? The §34.2.5 row labels are unambiguous: `Charge trigger = "Operator clicks 'Export Selection Report PDF' with a finalized Selection Record"` and `Charge timing = "Stripe charge captured **before** PDF generation"`. The Workspace itself is a §10 first-class entity created by `POST /v1/workspaces` (§32) with its own lifecycle distinct from Selection Report export. The metonymic reading is therefore unsupported by the surrounding contract. The defect stands. Reviewers should also note that the wording "Workspace creation is GATED until charge captures" is grammatically valid English; it is not a typo correctable in-place but a semantic error that requires sentence-level rewrite per the recommendation.

**Roll-up update (post re-verification).**

| Severity | Phase 14.1 original | Phase 14.1 re-verification net-new | Phase 14.1 total |
|---|---|---|---|
| P0 | 0 | 0 | 0 |
| P1 | 4 | 0 | 4 |
| P2 | 6 | 1 (D-14.1-011) | 7 |
| P3 | 0 | 0 | 0 |

**Strict-interpretation conversion (post re-verification).** 4 → 11 P1 (escalating D-14.1-004 through D-14.1-009 + D-14.1-011 from P2 to P1). Pragmatic-interpretation severity assignment stands; the strict list is recorded for v7.1.1 backlog completeness.

**Recommended bulk remediation (post re-verification).** Adds a 9th item to the recommended-remediations list:

9. **Rewrite §34.2.5 cross-cutting orchestration rule #5 first bullet** to remove the internal contradiction. Replace the opening sentence "Workspace creation is GATED until charge captures (Buyer Solo per-eval flow charges on Selection Report export, NOT on Workspace creation — so a Workspace can be authored, edited, and finalized BEFORE the $199 charge fires; Free-tier ceilings apply during the work)" with "**Workspace creation is NOT gated by the Solo per-evaluation charge.** Buyer Solo per-eval flow charges on Selection Report export — not on Workspace creation — so a Workspace can be authored, edited, and finalized under Free-tier ceilings BEFORE the $199 charge fires; the charge effectively converts the Free-tier Workspace's outputs (Selection Report + Defense View) to Solo-tier outputs at export time." Author symmetric clarifying language in §34.2.5 acceptance criterion #1 — append the phrase "Workspace creation MUST NOT be gated by the Solo per-evaluation charge state" to the existing AC #1 so the test harness is unambiguous. Add deploy-time validator `solo_per_eval_workspace_creation_ungated` asserting that `POST /v1/workspaces` does not check Solo charge state. Closes D-14.1-011.

**Verdict (re-verification).** Phase 14.1 NARROW: PASS (zero P0 numerical drift confirmed). Phase 14.1 BROAD: still **FAIL pre-remediation** with 4 P1 + 7 P2 open. No new P0 surfaced; no new P1 surfaced; one new P2 (D-14.1-011) surfaced. Phase 14.1 re-verification adds 1 net-new defect and refines the recommended-remediations list from 8 → 9 items.

---

## Seller Pricing v3

_Phase 14.2 — `Sourcera_Seller_Pricing_Strategy.md` v3 (2026-04-26) ↔ `Sourcera_Master_Spec.md` v7.1.0. Section-by-section consistency walk against §34 (full body), §22.18–§22.20 (Seller KB Value Capture + Seller Compressed Surface + Seller Maya Surface Abstraction), §27.11.3 (Verification Tiers), §34.13 (Pro Trial Seat M17), §34.16 (Marketplace Discovery Pricing), §34.19 (Seller Plan Upgrade Carry-Over Guarantee), §44.6 (Solo-Tier Surface Treatment), §48.1.5–§48.1.8 (Hero Moment + Activation Metric + Three Conversion Moments + Extended AC), §48.2.2 (Loop L1), §48.3.5 (Seller-Side Compounding Network Effects), §48.4 (Anti-Spam), §48.7 (M14–M17), §48.8 (Seller Hero Moment & Onboarding Anti-Patterns), §49.1 (Seven-Stage Seller Onboarding Pipeline). Walk produced 11 net-new defects (D-14.2-001 through D-14.2-011). Severity distribution: 5 P1 / 5 P2 / 1 P3 / 0 P0. Zero numerical-cell drift on plan-tier dollar figures (already cleared by Phase 34.PXC + PHASE34.1). All net-new drift is structural narrative-vs-spec coverage drift — SPS v3 commits to behaviors and metrics the spec does not yet author. Scratch log + counterfactual + self-challenge at `PHASE14.2_FINDINGS.md`. Per CLAUDE.md §2 source-of-truth: every defect recommends updating the spec OR amending SPS v3 narrative (D-14.2-011 only); the spec wins on substantive contracts._

### CHECKS — Walk Result Summary

| Check (per Audit_Prompts.md Prompt 14.2) | Result | Drift inventory |
|---|---|---|
| (1) Seller plan tier figures match §34.1 seller rows | ✅ PASS | All 6 plan-tier columns × 30+ rows reconcile (SPS v3 §3 vs §34.1.2 / §34.2.2). Annual / monthly / per-bid prices, AI budgets, concurrent-bid / EOI / KB / Firecrawl / Bootstrap caps, SellerSoftware / Capability Declaration counts, Verification tier eligibility, Seller Page Enrichment, Match Scoring, Seller Signals, Direct Invite from Cohort, CRM Sync, Promoted placements, SSO/SCIM, API access, Audit Log retention, SLA, Support tier, Wallet Overage availability — all match. The pre-filed D-AS-002 (P1) Enterprise volume-discount band inline restatement in SPS v3 §9, D-PT-002 (P1) KB Bootstrap Year-1 entitlement drift, D-PT-003 (P2) Solo per-bid KB-persistence clock-reset, D-PT-005 (P2) Solo per-bid FX-rate-locking timestamp, D-PT-006 (P2) Seller integrations Core vs All tier-stepping, D-PT-008 (P2) Seller Audit Export API / DPA rows, D-PXC-002 (P2) Direct Invite from Cohort SPS cite, D-PXC-003 (P1) kb_bootstrap rate-card triple-conflict, D-PXC-004 (P1) seller_page_enrichment 36×–80× drift, D-PXC-005 (P1) match_score_numeric Free/Starter granted vs Growth+ gate, D-PXC-006 (P2) Firecrawl Free 50-lifetime drift, D-PXC-007 (P2) first_pass_rfp_draft Free=25 lifetime cite are pre-filed; not duplicated here. |
| (2) Forced-signup mechanics match §27 + §49 + §48 | ⚠ PARTIAL | SPS v3 §16 Forced-Vendor-Signup Playbook reconciles end-to-end against §49.1 + §48.8 + §34.13: pre-arrival preparation (§48.8.2), onboarding surface minutes 0–3 (§48.8.3 + §49.1.2/.3/.4), in-workspace value proof (§48.8.4 + §49.1.5 + §22.7), post-submission reveal Free vs Solo variants (§48.8.5), Solo billing surface (§44.6.2 + §34.2.5), Pro Trial Seat (§34.13 + §48.7.4), Win/Loss debrief (§49.1.7 + §48.7). Drift: SPS v3 §16.7 specific win/loss-conditional upgrade-CTA copy with Solo-vs-Starter routing absent from §49.1.7 (D-14.2-010). Pro Trial Seat day-31 contextual Solo-vs-Starter CTA branching absent from §34.13.4 (D-14.2-007). §48.1.7 publishes THREE Conversion Moments with hardcoded `seller_free → seller_starter` enum; SPS v3 §15.3 publishes FOUR Moments incl. v3-new Moment 1 Mid-bid AI budget wall → Solo (D-14.2-005). |
| (3) Hero Moment match §22 + §49 | ✅ PASS | SPS v3 §15.1 Hero Moment ("Your first bid is already drafted") reconciles to §48.8 Hero Moment surface specification + §49.1 seven-stage onboarding pipeline. Domain Bootstrap → §48.8.2 + §22.4. KB Propose → §49.1.2. First-Pass Draft → §49.1.3. Landing screen counter ("47 of 82 requirements have AI drafts") → §48.8.3 Workflow step 8. Progress storytelling lines → §48.8.3 step 5 + §49.1.8. Activation metric p50 < 20 min, p90 < 60 min → §48.1.6 Primary Seller Activation Metric ✅. AC #17 forty-second-Anthropic-cost-cap on Hero Moment AI work → §48.1.8 #17. PHASE_HM (Phase 13.4) and PHASE13V audits already cleared §48.8 / §22 / §49 cross-walks; D-13V-022 P1 Firecrawl-outage Hero Moment failure is pre-filed; not duplicated here. |
| (4) KB value capture match §22 + §34.19 | ✅ PASS | SPS v3 §18 KB Value Capture & Stake-Building reconciles end-to-end against §22.18 + §34.19. §18.1 Honest portability → §22.18.2 (full export at every tier including Free + Solo) + §40.4. §18.2 On-platform compounding (confidence scores, staleness state, win-rate weighting, cross-bid citation graph, KB-to-Capability auto-declarations) → §22.18.3. §18.3 KB Value Meter formula (entries × avg response time saved × loaded hourly rate; visible on Free and Solo) → §22.18.4 + §34.19.2. §18.4 Upgrade carry-over guarantee (KB, in-flight bids, Capability Declarations, Firecrawl source configs; 90-day read-only downgrade preservation; per-bid 90-day retention from bid submission date) → §34.19 + §22.18.5 + §34.2.5 + §34.6 (D-PT-003 P2 per-bid KB-persistence clock-reset pre-filed). |
| (5) Marketplace Discovery Pricing match §34.16 | ⚠ PARTIAL | SPS v3 §13 reconciles by SKU against §34.16: §13.1 Promoted Listings ($500/category/week, k=5 anonymization, max 3 promoted per category, max 4 additional per month) → §34.16.1; §13.2 Verification Tiers (Basic / Verified Solo+ / Certified Growth+) → §27.11.3 + §34.16.2; §13.3 Featured Placements (Editorial only, no paid commitment in v7.0.0) → §34.16.3. Drift: D-PXC-009 P1 Promoted Listing plan-tier eligibility gate missing from §34.16.1; D-PXC-010 P1 Verification Tier criteria divergence between §34.16.2 and SPS v3 §13.2 (SOC 2 / ISO / "≥3 closed bids" criteria diverge); D-PXC-011 P1 Verification narrative "available on all plans" vs §34.1.2 + SPS v3 Solo+/Growth+ gating; D-PXC-012 P3 FeaturedPlacement paid_commitment reserved-mode divergence. All pre-filed in Phase 34.PXC; not duplicated. Phase 14.2 net-new: zero. |
| (6) Seller network effects match §48 | ✅ PASS | SPS v3 §19 reconciles end-to-end against §48.3.5 + §48.2.2 / §48.2.5 / §48.2.10 + §48.6.5 + §48.7.2 / §48.7.4. §19.1 Invited-Vendor → Published-Profile → Marketplace-Ready Inventory → §48.3.5 S1–S7 inventory. §19.2 KB → Capability Declaration → Match Score → EOI → Revenue → §48.3.5 + §22.18 + §27.4. §19.3 Bid-Close → Win/Loss Signal → Platform Learning → §48.3.5. §19.4 Seller-Profile SEO Loop → §48.2.5 Loop L4. §19.5 Ghost-Bid Import Loop (M15) → §48.7.2. §19.6 Buyer-Funded Pro Trial Loop (M17) → §48.7.4. §19.7 Template Publish Incentive (M9 / L9) → §48.2.10 + §48.6.5. All 7 seller-side network effects compound regardless of plan tier per spec authoring intent. |

### Section-by-Section Walk

#### SPS v3 §1 — The Core Principle

**Status:** ✅ Reconciled.

"Invited participation is free; leverage is paid" framing reconciles to §34.2.3 #3 (Vendor response to invited bid is unconditionally free on Seller Free) + §34.1.2 cells.

#### SPS v3 §2 — Strategic Decisions (8 + 2 v3)

| Decision | Spec home | Status |
|---|---|---|
| §2.1 Separate seller plan track | §34.1.2 / §34.2.2 | ✅ |
| §2.2 Outcome-based accounting; value = cost × 10; ≥88% margin | §34.3.1 / §34.3.3 / §34.18.1 | ✅ (D-AS-011 P2 infra-overhead drift pre-filed) |
| §2.3 Monetize automation; never participation | §34.2.3 #3 | ✅ |
| §2.4 EOI cap at Starter (10/mo); Growth+ unlimited | §34.1.2 EOI row | ✅ |
| §2.5 Numeric Match Scores at Growth+ | §34.1.2 | ✅ (D-PXC-005 P1 rate-card drift pre-filed) |
| §2.6 KB as monetization (3 capabilities: Bootstrap / Firecrawl / First-Pass) | §34.1.2 + §34.14.1 + §22 | ✅ (D-PT-002 + D-PXC-003 cover Bootstrap allowance drift) |
| §2.7 Published profile on Free | §34.2.3 #4 | ✅ |
| §2.8 Seller Solo tier ($49/$59 sub OR $199/bid) | §34.1.2 + §34.2.2 + §34.2.5 | ✅ |
| §2.9 Seller Solo invisible AI consumption | §44.6 + §34.10.3 + §44.6.1 + Appendix M | ✅ |

#### SPS v3 §3 — Plan Architecture at a Glance

**Status:** ✅ Reconciled (numerical pass).

Every cell in the SPS v3 §3 6-column × 30-row plan-architecture table reconciles with §34.1.2. The "Direct Invite from Cohort" row's SPS cite drift is pre-filed as D-PXC-002 (P2). Enterprise volume-discount overage band restatement is pre-filed as D-AS-002 (P1).

#### SPS v3 §4 — Seller Free Plan

**Status:** ✅ Reconciled.

$0, 1 concurrent invited bid, $5/mo hard-cap AI budget, 50 KB entries, 1 lifetime KB Bootstrap (M1 promise), Published Seller Profile day one, Basic verification, 1 SellerSoftware entity, 3 Capability Declarations, Marketplace browsing, Community support — all reconcile to §34.1.2 + §34.10.4 + §27.11.3 + §34.16.2.

#### SPS v3 §5 — Seller Solo Plan

| SPS v3 §5.x | Spec home | Status |
|---|---|---|
| §5.1 Pricing options ($49 ann / $59 mo / $199/bid) | §34.2.2 / §34.2.5 | ✅ |
| §5.2 Included (1 concurrent bid, 250 KB, 1 weekly Firecrawl, 1 lifetime + 1/yr re-Bootstrap, engine-absorbed envelope, Verified eligibility, 90-day post-bid retention, email support) | §34.1.2 / §34.2.5 / §27.11.3 / §22 | ✅ |
| §5.3 Solo→Starter upgrade triggers (2nd concurrent bid, first EOI, 4th Cap Declaration, KB ceiling at 250, sustained AI-envelope throttling, 2nd Firecrawl source, Seller Page Enrichment, Numeric Match Scoring, CRM Sync, Promoted, Enterprise controls) | §34.5 plan-change; §34.1.2 ceilings; §34.5.1 carry-over; §44.6.5 events | ⚠ PARTIAL — the **≥3 throttle events / 30 day window** trigger is the only one not registered in spec (D-14.2-003) |
| §5.4 Per-bid billing mechanics (charge trigger on submission, 7d refund w/ buyer-not-opened check, 90-day retention, mid-bid subscription conversion crediting) | §34.2.5 | ✅ (D-PT-003 P2 per-bid KB-persistence clock-reset + D-PT-005 P2 FX-rate-locking timestamp pre-filed) |
| §5.5 Surface discipline (9-item Solo hide list) | §44.6.1 (10-item hide list) + §22.20 (Seller Maya Surface Abstraction; 4 compression rules) | ⚠ PARTIAL — 6 of 9 items present (AIOp metering, value-dollars, wallet, per-capability spend; KB governance / Match Scoring / Capability Declarations partially via §22.20 cross-refs); 3 items missing or partial: "Plan tier matrix" (not in §44.6.1; needs `solo_plan_matrix_surfacing_upgrade_context_only` validator), "Capability Declaration auto-publish surface copy" ("Your profile is now discoverable for: ..." not authored as locked surface copy in §22.20.2), "KB governance weekly notification copy" ("We refreshed your knowledge base from your website — N new entries proposed" template + N=0 fallback not authored in §22.20.3) — D-14.2-008 |
| §5.6 Fit | n/a (positioning) | n/a |
| §5.7 Anti-fit | n/a (positioning) | n/a |

#### SPS v3 §6 — Seller Starter Plan

**Status:** ✅ Reconciled.

3 concurrent bids, 10 EOIs/mo, 1,000 KB entries, 2 Firecrawl sources weekly, 1 re-Bootstrap/yr, $30/mo AI budget, Verified eligibility auto-unlock, 5 SellerSoftware entities, 25 Capability Declarations, 1 Seller Page Enrichment/yr, Monthly Seller Signals digest, Email support — match §34.1.2. Responsive anchor ($7K/yr) is narrative latitude.

#### SPS v3 §7 — Seller Growth Plan

**Status:** ✅ Reconciled.

15 concurrent bids, unlimited EOIs, 10,000 KB entries, 10 Firecrawl sources daily, 3 re-Bootstraps/yr, $200/mo AI budget, Certified eligibility, 25 SellerSoftware entities, 250 Capability Declarations, 3 Seller Page Enrichments/yr, Weekly Seller Signals digest, CRM Sync included, Numeric Match Scoring, Email + chat support — match §34.1.2.

#### SPS v3 §8 — Seller Scale Plan

**Status:** ✅ Reconciled.

Unlimited concurrent bids, unlimited EOIs, unlimited KB, unlimited Firecrawl real-time (fair-use ≤50 domains), unlimited Bootstraps, $600/mo AI budget, Certified, unlimited SellerSoftware + Capability Declarations, 12 Page Enrichments/yr, Weekly + real-time Seller Signals, CRM Sync + field-map customization, Numeric Match Scoring + batch API, 1 Promoted placement/mo, Read-only API access, Shared CSM, Priority support — match §34.1.2.

#### SPS v3 §9 — Seller Enterprise Plan

**Status:** ✅ Reconciled (numerical), ⚠ on integration-target enumeration; D-AS-002 P1 pre-filed for volume bands.

$3,000/mo floor, $12K/yr committed AI minimum, dedicated CSM + onboarding + QBR, 99.9% uptime + 4-hour critical SLA — all match §34.2.3 #6 + §34.1.2 SLA row + §34.2.4. Gainsight / Outreach / Salesloft / 6sense named custom integration targets are companion-doc narrative latitude (spec authors generic "Custom Integrations: Scoped per contract").

#### SPS v3 §10 — Seller-Side Capability Rate Card (12 rows)

**Status:** ✅ Reconciled (process-authoritative).

12 rows by `capability_id`, model tier, value/cost price, unit reconcile against §34.14.1 MS §2.8 Baseline. "Solo accounts continue to consume capabilities from their absorbed envelope; the rate card is engineering-transparent, never seller-facing on Solo" → §34.14.4 + §44.6.6.

#### SPS v3 §11 — Seller-Side Outcome Signals (12 rows)

**Status:** ✅ Reconciled (D-PXC-008 P3 cite drift pre-filed).

12 rows by accepted signal / window / default-on-timeout reconcile against §34.15.1.

#### SPS v3 §12 — Cross-Side Billing Rules

**Status:** ✅ Reconciled.

§12 #1 per-console plan activation ✅ §34.12.1; §12 #2 AI budgets Org-scoped + pooled at Business+/Starter+; Solo absorbed envelopes do NOT pool ✅ §34.10.3; §12 #3 Wallet overage Org-scoped (Solo has no wallet) ✅ §34.10.2 + §44.6.1; §12 #4 Dual-Console Firewall unchanged ✅ §7.2; §12 #5 Enterprise counts once ✅ §34.12.5; §12 #6 Solo cross-console independent ($98/mo, no bundle discount) ✅ §34.12.6.

#### SPS v3 §13 — Marketplace Discovery Pricing

**Status:** ⚠ PARTIAL (all drift pre-filed in Phase 34.PXC).

§13.1 Promoted Listings → §34.16.1 (D-PXC-009 plan-tier gate missing); §13.2 Verification Tiers → §27.11.3 + §34.16.2 (D-PXC-010 criteria divergence + D-PXC-011 gating drift); §13.3 Featured Placements → §34.16.3 (D-PXC-012 paid_commitment reserved-mode divergence).

#### SPS v3 §14 — Financial Scenarios

| Scenario | Spec home | Status |
|---|---|---|
| Scenario A — 200 Seller Starter (~$358K ARR; ~95.1% margin) | §34.18.6 Scenario A | ✅ (D-PXC-016 P2 ARR-target vs per-cohort naming collision pre-filed) |
| Scenario B — 50 Seller Growth (~$299K ARR; ~93.7% margin) | §34.18.6 Scenario B | ✅ |
| Scenario C — 15 Scale + 5 Enterprise (~44.4% blended margin) | §34.18.6 Scenario C | ✅ |
| **Scenario D — Seller Solo cohort (300 sub × $49 × 12 + 1,200 per-bid × $199 = $415,200; ~90.4% margin)** *(new in v3)* | **NOT in §34.18.6** | ❌ D-14.2-001 |
| Year-1 seller plan mix (25% Solo sub / 25% Solo per-bid / 25% Starter / 15% Growth / 8% Scale / 2% Enterprise) | §34.18.3 Seller Year-1 mix omits Solo | ❌ D-AS-005 (pre-filed P1) |
| Combined buyer + seller blended ≥90% | §34.18.1 aspirational | ✅ |

#### SPS v3 §15 — PLG Motion (Seller-Side)

| SPS v3 §15.x element | Spec home | Status |
|---|---|---|
| §15.1 Hero Moment ("Your first bid is already drafted") | §48.8 + §49.1 | ✅ (D-13V-022 P1 Firecrawl-outage Hero Moment failure pre-filed) |
| §15.2 Activation metric (Minutes from magic-link to first submitted requirement response; p50 < 20 min, p90 < 60 min) | §48.1.6 Primary Seller Activation Metric | ✅ (thresholds match authoritative band) |
| **§15.3 Four conversion moments (Mid-bid AI budget wall → Solo; 2nd concurrent bid → Starter; 1st EOI → Starter; KB ceiling → Solo or Starter)** | §48.1.7 publishes **THREE** Moments with hardcoded `seller_free → seller_starter` enum | ❌ D-14.2-005 |
| §15.4 Paid-path progression (7 steps incl. Solo expansion) | §34.5 / §48 | ✅ (narrative; D-14.2-003 covers throttling trigger gap) |
| §15.5 Leading indicators (14 indicators) | §48.1.6 (8 + 2 Quality-Signal); 6 Solo-cohort indicators absent | ❌ D-14.2-006 |
| **§15.6 Pro Trial Seat day-31 contextual Solo-vs-Starter CTA offer** | §34.13.4 documents auto-downgrade; contextual CTA branching unauthored | ❌ D-14.2-007 |

#### SPS v3 §16 — Forced-Vendor-Signup Playbook

| SPS v3 §16.x element | Spec home | Status |
|---|---|---|
| §16.1 Pre-arrival preparation | §48.8.2 | ✅ |
| §16.2 Onboarding surface minutes 0–3 (zero friction; progress storytelling; landing counter) | §48.8.3 + §49.1.2/.3/.4 | ✅ |
| §16.3 In-workspace value proof (inline citations; Accept/Edit/Reject; live budget counter Free-only; KB-gap detector; "AI got this right" chip) | §48.8.4 + §22.7 + §49.1.5 + §44.6.1 | ✅ |
| §16.4 Post-submission reveal Free vs Solo variant copy | §48.8.5 | ✅ |
| §16.5 Solo billing surface | §44.6.2 + §34.2.5 | ✅ |
| §16.6 Buyer-Funded Pro Trial Seat | §34.13 + §48.7.4 | ✅ |
| **§16.7 Win/Loss debrief upgrade-CTA copy (Solo-vs-Starter routing on win and loss)** | §49.1.7 + §48.7 reference debrief surface; specific copy + routing unauthored | ❌ D-14.2-010 |

#### SPS v3 §17 — Seller Onboarding Experience

| SPS v3 §17.x element | Spec home | Status |
|---|---|---|
| §17.1 Seven-stage flow | §49.1 (Stage 1 → 7 map + 7 sub-sections) | ✅ |
| §17.2 Required platform capabilities (Items 1–10 preserved from v2 + Item 11 Solo billing surface new in v3) | §34.17.1 #14 covers Items 1–10; Item 11 seller-Solo-specific sub-features (Verified-tier eligibility flagging; per-bid 90-day KB-cap retention rendering) absent from §34.17.1.b | ❌ D-14.2-004 |
| §17.3 Onboarding anti-patterns (7 banned, incl. v3 #7 "Surface AI consumption on Solo") | §48.8.7 AP1–AP7 + §49.1.9 detector list | ✅ |

#### SPS v3 §18 — KB Value Capture & Stake-Building

**Status:** ✅ Reconciled (D-PT-003 P2 per-bid KB-persistence pre-filed).

§18.1 Honest portability → §22.18.2 + §40.4; §18.2 On-platform compounding → §22.18.3; §18.3 KB Value Meter (visible on Free + Solo) → §22.18.4 + §34.19.2; §18.4 Upgrade carry-over → §34.19 + §22.18.5 + §34.2.5 + §34.6.

#### SPS v3 §19 — Seller-Side Network Effects

**Status:** ✅ Reconciled.

All 7 reconcile to §48.3.5 + §48.2.2 / §48.2.5 / §48.2.10 + §48.6.5 + §48.7.2 / §48.7.4 (D-13V-001 P1 Audit-program-coverage §48.2 gap pre-filed in Phase 13V; not a SPS v3 drift defect — it's an audit-program-completeness defect).

#### SPS v3 §20 — Anti-Spam and Marketplace Integrity Controls

**Status:** ✅ Reconciled.

All 7 reconcile to §48.4 subsections + §27.11.6 G7 quality floor + §27.6 taxonomy + §48.4.5 template spam classifier + §48.4.7 k-anonymity floors + §48.4.10 SIM + §48.4.12 acceptable-use floor + §27.11.6 G7 180-day-non-respondent demotion.

#### SPS v3 §21 — Migration from v2

| Migration concept | Spec home | Status |
|---|---|---|
| v2 → v3 deltas table (plan count 5→6, Solo tier, Verified Solo+, Firecrawl 1 weekly, 1/yr re-Bootstrap, engine-absorbed envelope, Solo billing surface, surface mode default, PLG paid path, 4 conversion moments incl. mid-bid AI budget wall, outcome-accounting visibility) | §34.1.2 / §34.2.5 / §44.6 / §22.20 / §34.16.2 / §27.11.3 | ✅ (delta authoritatively landed in Phase 14.9) |
| Phase 14.9 Master Spec scaffolding edits (§34.1.2 / §34.2.2 / §34.2.5 / §34.10.3 / §34.10.5 / §34.12.1 / §34.12.6 / §34.12.8 / §39 / §5.11 / Appendix J / Appendix M) | All listed sections | ✅ (verified end-to-end) |
| Pending Phase 14.9.1 / 14.10 follow-up (§44 Solo Surface Treatment landed; §22 KB integrated portions; §21.4 / §21.4.5 capability catalog; §27.10 verification-eligibility plan-tier check; §5.11 inline plan-tier list audit) | §44.6 landed; remaining in CLAUDE.md §16 v7.1.1 backlog | ✅ partial |
| **"Existing Free sellers receive an in-app announcement of the Solo tier with a 90-day Solo subscription trial offer (no credit card; auto-downgrades to Free at trial end)"** | **NOT in §34.9** | ❌ D-14.2-002 |
| **"KB entries above the Free 50-cap on existing accounts are grandfathered in their current tier (no truncation on migration)"** | **NOT in §34.6 / §22 / §34.5 migration policy** | ❌ D-14.2-009 |
| **§21 line 887 cites "Master Spec §27.10 (Verification Tiers)" — actual section is §27.11.3** | §27.10 is Vendor Opt-Out Registry; §27.11.3 is Verification Tiers | ❌ D-14.2-011 (P3 cite drift) |

#### SPS v3 §22 — Positioning and Messaging

**Status:** n/a (narrative only; not authoritative for engineering behavior).

### Roll-Up by Severity

| Severity | New defects this walk | Cross-references to existing |
|---|---|---|
| P0 | 0 | — (D-V6-001 P0 Marketplace Discovery firewall pre-filed in Phase 34.16 V6; not Phase 14.2 scope) |
| P1 | 5 (D-14.2-001, D-14.2-002, D-14.2-003, D-14.2-004, D-14.2-005) | D-AS-002 (Enterprise volume bands inline restated); D-AS-005 (Year-1 seller plan-mix Solo omission); D-PT-002 (KB Bootstrap entitlement); D-PT-003 (Solo per-bid KB-persistence); D-PT-005 (Solo per-bid FX-rate-locking); D-PXC-003 / -004 / -005 / -009 / -010 / -011 / -013 (rate-card / Marketplace / pricing-engineering drift); D-14.1-001 / -002 / -003 / -007 / -009 / -010 (buyer-side paired defects) |
| P2 | 5 (D-14.2-006, D-14.2-007, D-14.2-008, D-14.2-009, D-14.2-010) | D-AS-011 (Convex 3% vs §34.14.1 5% drift); D-PT-006 / -008 (integrations / API+DPA); D-PXC-002 / -006 / -007 / -016 / -017 / -018 (citation / rate-card / scorecard drift); D-V6-002 / -003 / -005 / -006 / -007 (Marketplace auction tiebreak / window inclusivity / dup-bid); D-14.1-004 / -005 / -006 / -008 (buyer-side paired defects) |
| P3 | 1 (D-14.2-011) | D-AS-003 (§34.3.3 dual-citation); D-AS-006 (§34 preamble v2 citation); D-AS-013 (§48.8.6 SPS §3 cite); D-PXC-008 / -012 / -019 / -020 (citation drift) |

### Halt-Rule Application

Audit prompt halt rule per Audit_Prompts.md Prompt 14.2: **"Same as 14.1, against Seller Pricing v3"** — inherits Prompt 14.1's strict reading "ANY DRIFT IS P1 consistency_drift; spec wins per CLAUDE.md §2; file the defect against the strategy doc with a recommendation to update."

**Pragmatic interpretation applied** (consistent with PHASE34.PXC + PHASE14.1 walk precedent): structural narrative-vs-spec coverage drift escalates to P1 when the spec gap renders a SPS v3 commitment unbuildable as written (D-14.2-001 Seller Scenario D; D-14.2-002 90-day Solo trial; D-14.2-003 throttling-threshold trigger; D-14.2-004 §34.17.1.b AE rows; D-14.2-005 Four Conversion Moments); narrative-only or instrumentation-only coverage drift remains P2 (D-14.2-006 through D-14.2-010); citation drift remains P3 (D-14.2-011).

**Strict-interpretation conversion:** 5 → 10 P1 (escalating D-14.2-006 through D-14.2-010 from P2 to P1). The strict-interpretation list is recorded for v7.1.1 backlog completeness; recommendation stands at the pragmatic-interpretation severity assignment.

**Authoritative resolution:** All 11 defects resolve **per CLAUDE.md §2 source-of-truth: Master Spec wins.** 10 defects recommend extending the spec to cover the SPS v3 commitments. D-14.2-011 is a SPS v3 narrative edit (citation drift; no spec change).

### Recommended Bulk Remediations

1. **Author §34.18.6 Scenario D-Seller (Seller Solo cohort)** with SPS v3 §14 financial decomposition verbatim (300 sub × $49/mo × 12 + 1,200 per-bid × $199; AI COGS ~$2,592; Stripe processing ~$13,500; Verified-tier Ops review ~$6,480; refund reserve ~$11,940; ~90.4% margin). Pair with D-14.1-001 Buyer Solo Scenario D in a unified §34.18.6 extension. Closes D-14.2-001.
2. **Author §34.9.5 90-Day Seller Solo Trial (v2-cohort migration).** Mirror §34.9.1 pattern; trigger (existing Seller Free at v3 cutover); effective plan `seller_solo` (subscription mode default; per-bid mode blocked per §34.12.8 #6 during trial); wallet (Solo absorbed envelope); end-of-trial day 91 behaviors with vs without payment method; trial-expiry notifications (day 80 / 89 / 91); audit events; abuse controls (one trial per `(org_id, legal_entity)` per lifetime); deploy-time validator `seller_solo_trial_one_per_org_lifetime`; KB-cap grandfathering integration (D-14.2-009 cross-link). Pair with D-14.1-002 Buyer Solo trial. Closes D-14.2-002.
3. **Author Seller Solo→Starter throttling-threshold upgrade trigger.** New row in §34.5 or extension to §44.6.5: rolling-window aggregation `solo.envelope.throttling_engaged ≥ 3 events in rolling 30-day window per (org_id, console=seller)` fires `org.seller_solo_throttling_upgrade_cta_triggered`; per-bid mode equivalent fires immediately on per-bid envelope hit. Add §44.6.8 AC `seller_solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_bid`. Pair with D-14.1-003 buyer-side authoring in a single §44.6.5 Solo-engine-telemetry rolling-aggregation pass. Closes D-14.2-003.
4. **Register §34.17.1.b AE-17 + AE-18 (seller-side Solo additions).** AE-17 (Seller Solo Verified-tier eligibility flagging — paired §27.11.3 + §34.16.2); AE-18 (Seller Solo per-bid 90-day KB-cap retention rendering — paired §34.2.5 + §34.6 + §34.19). Pair with D-14.1-010's AE-12 through AE-16; update §34.17 AC #2 deploy gate `pricing_engineering_coverage` to assert §34.17.1.b ≥ 18 rows post-v7.1.1. Closes D-14.2-004.
5. **Extend §48.1.7 Conversion Moments table from 3 → 4 rows.** Add Moment 1 "Mid-bid AI budget wall" with `seller_free → seller_solo` Plan-To, trigger event `wallet.threshold_crossed {threshold=100, plan_tier='seller_free'}` joined to active Bid Workspace state. Extend `stage_7_upgrade_target_plan` enum to include `seller_solo`. Extend Moment 4 (KB ceiling) routing to `seller_free → seller_solo` (250-entry surface) and `seller_solo → seller_starter` (1,000-entry surface). Tighten frequency cap to per-(moment_kind, plan_tier) granularity. Update §48.1.8 AC #12 / #14. Closes D-14.2-005.
6. **Author §48.1.6 + §34.18.5 + §51 + Appendix G 6 seller-side Solo-cohort leading indicators.** Free→Solo conversion %; Solo subscription → Starter at 90 days; Solo per-bid ($199) repeat-purchase rate within 12 months; % Free hitting $5 AI budget wall mid-bid; Solo silent-throttle event rate (<5% of Solo accounts in any 30-day window); per-cohort margin (Solo sub vs Solo per-bid). Each metric registers a PostHog event in Appendix G. Pair with D-14.1-006 buyer-side authoring. Closes D-14.2-006.
7. **Author §34.13.4 Pro Trial Seat day-31 contextual Solo-vs-Starter CTA branching.** Solo-prominent CTA when `pro_trial_aiwallet_draw_total < $5.00` AND `pro_trial_bids_submitted ≤ 1`; Starter-prominent CTA otherwise. Author both CTA copies verbatim. Add §34.13.8 AC `pro_trial_day_31_contextual_cta_branching`. Closes D-14.2-007.
8. **Extend §44.6.1 surface hide list with 3 seller-side SPS v3 §5.5 items.** (#11-Seller) Plan-tier matrix surfacing (validator `solo_plan_matrix_surfacing_upgrade_context_only`); (#12-Seller) Capability Declaration auto-publish render copy with UX-fixture-snapshot test in §22.20.2; (#13-Seller) KB governance weekly notification Loops.so template `tpl_solo_kb_governance_weekly_notification` with N=0 fallback and throttled-week fallback; add §22.20.3 AC `solo_kb_governance_weekly_notification_template_parity`. Pair with D-14.1-009 buyer-side surface authoring. Closes D-14.2-008.
9. **Author §34.6 (or §34.6.7) v3-cutover KB-cap grandfathering rule for v2-cohort Free sellers.** KBEntry rows where `created_at < Organization.v3_cutover_grandfathered_at` retain full read-write permissions regardless of current plan-tier KB cap. New entries post-cutover subject to standard Free 50-entry cap. Add KBEntry field `is_v2_grandfathered`; add Appendix J `kb_entry_grandfathering_state` enum; add §34.6.8 AC `seller_kb_v2_cutover_grandfathering_single_source`. Pair with D-14.1-007 buyer-side authoring in a unified v3-cutover-migration sub-section. Closes D-14.2-009.
10. **Author §49.1.7 + §48.7 Win/Loss-Conditional Upgrade CTA copy + Solo-Starter routing.** Author Loops.so templates `tpl_seller_bid_close_debrief_win_solo_starter` and `tpl_seller_bid_close_debrief_loss_solo_starter` with verbatim copy from SPS v3 §16.7. Add §22.18.4 KB Value Meter win-rate-boost integration; add §22.20.3 KB Governance gap-flag integration on loss. Add §49.1.10 AC `seller_bid_close_debrief_win_loss_solo_starter_copy_parity`. Closes D-14.2-010.
11. **SPS v3 narrative edit (no spec change).** Replace SPS v3 §21 line 887 "Master Spec §27.10 (Verification Tiers)" with "Master Spec §27.11.3 (Verification Tiers)"; optionally remove stale §5815 line reference. Closes D-14.2-011.

### Phase 14 Canonicalization Pass (this row)

This walk feeds the same Phase 14 cross-document reconciliation that Phase 34.PXC + Phase 14.1 seeded. The Phase 14 walk MUST consume:

- This Seller Pricing v3 delta inventory (above);
- All `D-14.2-NNN` rows in DEFECT_LEDGER.md;
- PHASE14.2_FINDINGS.md scratch log (counterfactual + self-challenge);
- Cross-references to D-AS-NNN, D-PT-NNN, D-PXC-NNN, D-V6-NNN, D-13V-NNN, D-14.1-NNN defects already filed.

The 11 recommended bulk remediations above are the seed of the Seller-Pricing-v3 v7.1.1 backlog reconciliation entries.

### Phase 14.2 Re-Verification (2026-05-12, second pass)

**Trigger.** Phase 14.2 audit prompt re-issued same day after the original walk closed at 17:38. Independent end-to-end re-read of SPS v3 (918 lines) and Master Spec v7.1.0 §34 (full body) / §44.6 / §22.18 / §22.19 / §22.20 / §27.11.3 / §34.13 / §34.16 / §34.19 / §48.1.7 / §48.2.2 / §48.3.5 / §48.7 / §48.8 / §49.1 with a clean Opus context.

**Re-walk methodology.** For each of D-14.2-001 through D-14.2-011, the cited Master Spec section anchor and the SPS v3 line numbers were re-opened and the evidence quote was verified character-for-character against current file state. The recommendation column was re-read for sharpness. The §34.2.5 cross-cutting orchestration rule #5 surface was probed end-to-end (both sub-bullets) against §44.6 + SPS v3 §5 / §15.3 — the buyer-side first-bullet contradiction had already been filed in Phase 14.1 re-verification as D-14.1-011 and prompted the analogous seller-side second-bullet probe.

#### Re-Verification Outcome — Pre-Filed 11 Defects

| Defect | Re-verification outcome | Notes |
|---|---|---|
| D-14.2-001 | Reproducible at §34.18.6 line 30797 + SPS v3 §14 lines 475–490. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-001 Buyer Solo Scenario D; both should land in the same §34.18.6 extension pass. |
| D-14.2-002 | Reproducible at §34.9.1 line 29766 + SPS v3 §21 line 891. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-002 Buyer 90-day Solo trial; both should land in a unified §34.9 v3-cutover migration sub-section. |
| D-14.2-003 | Reproducible at §44.6.5 line 33510 + SPS v3 §5.3 line 204 + §15.3 line 538. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-003 buyer-side; both rolling-window aggregations should land in a unified §44.6.5 telemetry-rolling-aggregation pass. Solo per-bid envelope-hit immediate-fire mode preserved. |
| D-14.2-004 | Reproducible at §34.17.1.b + §44.6 / §34.2.5 / §27.11.3 + SPS v3 §17.2 line 709. Severity P1 holds. Recommendation sharp. | Paired with D-14.1-010 AE-12 through AE-16; the §34.17 AC #2 deploy-gate row-count assertion should consolidate to ≥ 18 post-v7.1.1. |
| D-14.2-005 | Reproducible at §48.1.7 line 34179 + SPS v3 §15.3 line 536. Severity P1 holds. Recommendation sharp. | Mid-bid AI budget wall (Moment 1) v3-NEW + KB ceiling routing-by-source-plan (Moment 4 from Solo vs Free) extensions are the §48.1.7 table + `stage_7_upgrade_target_plan` enum changes. Closely linked to D-14.2-012's §34.2.5 rewrite — both touch the seller's mid-bid Solo-per-bid election path. |
| D-14.2-006 | Reproducible at §48.1.6 + §34.18.5 + §51 PLG instrumentation registry + SPS v3 §15.5 lines 553–569. Severity P2 holds. Recommendation sharp. | Cross-references D-14.2-003 / D-14.2-004 / D-14.1-006 (buyer-side). |
| D-14.2-007 | Reproducible at §34.13.4 line 30222 + SPS v3 §15.6 line 573. Severity P2 holds. Recommendation sharp. | Seller-only (no buyer-side pair; Buyer-Funded Pro Trial Seat M17 is buyer-issuing-to-vendor; no buyer-side Pro Trial path). |
| D-14.2-008 | Reproducible at §44.6.1 line 33420 + §22.20.2 / §22.20.3 + SPS v3 §5.5 lines 225–237. Severity P2 holds. Recommendation sharp. | Paired with D-14.1-009 (buyer-side surface compression items); both should land in a unified §44.6.1 / §22.20 extension pass. |
| D-14.2-009 | Reproducible at §34.6 + §22 + §34.5 + SPS v3 §21 line 891. Severity P2 holds (strict → P1 still recorded). Recommendation sharp. | Paired with D-14.1-007 Buyer SR v2-watermarking grandfathering; both should land in a unified v3-cutover-migration sub-section. |
| D-14.2-010 | Reproducible at §49.1.7 + §48.7 + SPS v3 §16.7 lines 663–673. Severity P2 holds. Recommendation sharp. | Seller-only (no buyer-side debrief copy pair; D-HM-NNN cluster covered post-submission stake-reveal, not bid-close debrief). |
| D-14.2-011 | Reproducible at SPS v3 §21 line 887 + Master Spec §27.10 / §27.11.3 anchors. Severity P3 holds. Recommendation sharp (SPS v3 narrative-side edit only). | Citation drift; no spec change. |

All 11 pre-filed defects are confirmed `open` with reproducible evidence, defensible severity, and sharp recommendations. No defects retired or re-classified.

#### Net-New Finding — D-14.2-012

A re-read of §34.2.5 (Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration) cross-cutting orchestration rule #5 *second* bullet (Bid Workspace branch) surfaced an internal contradiction that the Phase 14.2 original walk did not catch. The bullet at line 29250 specifies that under Seller Solo per-bid mode the Bid Workspace operates under Free entitlements during drafting and Solo benefits apply only to the post-submit 90-day retention window. This contradicts (a) §44.6.3 Solo per-bid `$5 absorbed value-dollars / submitted bid` envelope, (b) §44.6.7 #8 per-bid charge-pending state envelope-engaged semantics, (c) SPS v3 §5.2 "no hard cap" engine-absorbed envelope commitment, and (d) SPS v3 §15.3 Moment 1's verbatim CTA "Solo unlocks the engine-absorbed envelope (no hard cap, no mid-bid walls) for $49/mo or $199/bid" — the v3-NEW dominant Free→Solo conversion mechanic. Under the §34.2.5 reading, the $199 per-bid path delivers NO mid-bid relief because the seller remains on Free's $5 hard cap during drafting, defeating the v3 launch's headline seller value proposition. The buyer-side D-14.1-011 captured the analogous first-bullet contradiction (Workspace creation gating) at the same §34.2.5 cross-cutting rule #5 surface; D-14.2-012 is the seller-side mirror, distinct because the buyer-side contradiction was resolvable by reading the second sub-bullet's "Bid Workspace creation is NOT gated" disambiguating statement whereas the seller-side contradiction is internal to the second sub-bullet itself with no disambiguating clause. Severity P2; filed as D-14.2-012 in the ledger.

**Buildability Impact.** A junior engineer reading §34.2.5 in isolation could legitimately build a Bid Workspace runtime in which `solo_envelope_no_block=true` and `surface_throttling_class` rules (§44.6.3 / §44.6.4.1) are inactive on per-bid Solo accounts until charge captures at submission — at which point the workflow is over and the engine-absorbed envelope has no useful function. The §44.6 author's evident intent (Solo per-bid has $5 absorbed envelope during drafting; engine throttles silently if envelope is approached; charge defers to submission) is buried 4,000+ lines downstream and would not be discovered by an engineer working from §34.2.5 alone.

**Counterfactual pass (D-14.2-012).** Three failure modes considered: (1) engineering builds the §34.2.5 reading literally and ships Solo per-bid as "Free + delayed $199 + 90-day retention" with no mid-bid relief; the v3 launch's Free→Solo conversion mechanism fails because Solo per-bid mode delivers nothing during the mid-bid wall moment SPS v3 §15.3 Moment 1 promises to fix; (2) engineering builds the §44.6 reading and Solo per-bid election grants engine-absorbed envelope immediately, but QA writes acceptance tests against the §34.2.5 literal reading and the tests fail or are silently skipped; (3) customer-success documentation copy promises mid-bid relief at $199/bid (per SPS v3) but the product delivers Free-tier entitlements during drafting, generating refund-eligibility disputes when sellers hit the wall they were promised relief from. All three failure modes are addressed by the recommendation: rewrite §34.2.5 line 29250 to authoritatively bind Solo per-bid envelope activation to election (not charge capture); add `BidWorkspace.solo_per_bid_elected_at` field; add `seller_solo_per_bid_envelope_activates_on_election` deploy-time validator; clarify §44.6.7 #8 + §34.2.5 failure-mode row to align with the rewrite.

**Self-challenge pass (D-14.2-012).** Hostile-reviewer test: is there a defensible reading of §34.2.5 line 29250 under which the contradiction dissolves? Considered: (a) the bullet describes ONLY the case where a Seller Free seller submits via implicit Solo per-bid mode without prior election (e.g., the per-bid mode is implicit and the seller is opting in by submitting under per-bid billing) — rejected because §34.2.3 #3 unambiguously says vendor response to invited bid is unconditionally free on Seller Free, so no implicit $199 charge can fire; the seller MUST elect Solo per-bid for the charge to be lawful. (b) the §44.6.3 "$5 absorbed/submitted bid" envelope is only meant for the 90-day retention window (post-submit) — rejected because no AIOp activity fires during the read-only retention window per §34.2.5 KB persistence row + §34.6 read-only preservation rule; a $5 envelope is operationally meaningless post-submit. (c) the §34.2.5 line 29250 was written assuming Solo per-bid election is implicit at Workspace creation (whence "pre-submit operates under Free entitlements") rather than at "Upgrade to Solo per-bid" CTA click — partially defensible but still contradicts the §44.6.3 + §44.6.7 reading and the SPS v3 §15.3 Moment 1 message which clearly describes a MID-BID upgrade-CTA election. The contradiction is materially load-bearing and is not dissolved by any reading. Severity P2 holds under hostile review (strict P1 noted for backlog).

#### What Was Not Filed in the Re-Verification (And Why)

| Considered concern | Why not filed |
|---|---|
| SPS v3 §5.4 "Mid-bid conversion. If the seller converts to subscription mid-bid after charging, the $199 is credited against the first month of subscription, not refunded." vs §34.2.5 "Mid-bid subscription conversion" row | Reconciles; the §34.2.5 row explicitly authors the credit-against-first-month rule. No defect. Tracked in §4 counterfactual pass D-14.2-012 #1 only because the mid-bid election path is the natural lane for the §34.2.5 line 29250 rewrite. |
| SPS v3 §5.4 "Refund window. 7-day refund window from charge, no questions asked, provided the buyer has not yet opened the submission." vs §34.2.5 Seller Solo refund-eligibility-check row | Reconciles; §34.2.5 line 29235 unambiguously authors the buyer-not-opened check. No defect. (D-PT-001 P1 pre-filed for the BUYER-side `≤ 3 opens` canonicality drift; seller-side has no analogous drift because seller refund check is binary on `first_buyer_open_at IS NULL`.) |
| §44.6.3 row `seller_solo / Subscription / $5 absorbed value-dollars / month` vs SPS v3 §5.2 "Engine-absorbed AI envelope ($5 value/mo subscription" | Reconciles. No defect. |
| §44.6.7 #7 Buyer per-eval abandonment ("the engine envelope counter for that pending evaluation is engaged; throttling on `low_priority_background` capabilities applies; on retry success, the per-evaluation $5 envelope ceiling activates") | The "on retry success, the $5 envelope ceiling activates" phrasing is partially consistent with both the §34.2.5 reading (envelope activates only on charge capture) and the §44.6.3 reading (envelope active throughout pending state). The buyer-side ambiguity is captured upstream by D-14.1-011's recommendation refinement; D-14.2-012's recommendation tightens the seller-side equivalent via the §44.6.7 #8 clarification. No additional defect filed. |
| §22.20 (Seller Maya Surface Abstraction) compression rules vs SPS v3 §5.5 (Solo Surface discipline) 9-item hide list | Reconciles per the existing D-14.2-008 framing (6 of 9 items present; 3 items missing). No new defects beyond D-14.2-008. |
| §48.7 (M14–M17 Cross-Console & Seller Conversion Mechanics) vs SPS v3 §19 (Seller-Side Network Effects) 7 loops | All 7 reconcile per the existing Phase 14.2 walk. No new defects. |
| §27.11.3 Verification Tier criteria (Verified = Domain TXT + business registration + ≥90d uptime; Certified = Signed audit report) vs SPS v3 §13.2 (Verified = profile completeness + SOC 2/ISO; Certified = Verified + ≥3 closed bids) | Criteria divergence already pre-filed as D-PXC-010 P1 (Verification Tier criteria divergence). No re-filing. |
| §49.1 Seven-Stage Seller Onboarding Pipeline vs SPS v3 §17.1 seven-stage flow | All 7 stages reconcile. No new defects. |

#### Re-Verification Roll-Up

| Severity | Re-verification only | Phase 14.2 cumulative (post-re-verification) |
|---|---|---|
| P0 | 0 | 0 |
| P1 | 0 | 5 (D-14.2-001, D-14.2-002, D-14.2-003, D-14.2-004, D-14.2-005) |
| P2 | 1 (D-14.2-012) | 6 (D-14.2-006, D-14.2-007, D-14.2-008, D-14.2-009, D-14.2-010, D-14.2-012) |
| P3 | 0 | 1 (D-14.2-011) |

**Strict-interpretation alternative:** D-14.2-012 escalates to P1 under the "ANY DRIFT IS P1 consistency_drift" strict reading; total would be 6 P1 / 5 P2 / 1 P3. Recommendation stands at the pragmatic-interpretation P2 (intra-spec contradiction with a thoughtful-staff-engineer resolvable reading — but the resolvable reading requires cross-section reading of §44.6 against §34.2.5 which a junior engineer working from §34.2.5 alone would not reliably do). Tied to D-14.1-011's identical severity calibration.

#### Sign-Off (Re-Verification)

- **Phase 14.2 re-verification walk completed.** 1 net-new defect filed (D-14.2-012 P2 consistency_drift; intra-spec contradiction at §34.2.5 cross-cutting orchestration rule #5 second bullet against §44.6.3 + §44.6.7 + SPS v3 §5.2 + §15.3 Moment 1). All 11 pre-filed Phase 14.2 defects re-walked and confirmed `open` with reproducible evidence.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "Seller Pricing v3" → "Phase 14.2 Re-Verification (2026-05-12, second pass)"` block appended (~7 KB); `_audit/DEFECT_LEDGER.md → "Phase 14.2 Re-Verification (2026-05-12, second pass)"` block appended (1 defect row + roll-up + sign-off verdict).
- **v7.1.1 stamp gate updated:** D-14.2-001 through D-14.2-012 closure (was D-14.2-001 through D-14.2-011); 8 new CI gate runtime wirings (was 7; D-14.2-012's `seller_solo_per_bid_envelope_activates_on_election` joins); 1 §34.2.5 paragraph rewrite (line 29250); 1 §34.2.5 failure-mode row clarification (line 29239); 1 §44.6.7 #8 row clarification; 2 §34.2.5 AC additions (AC #2 clause append + AC #8 new); 1 new BidWorkspace field (`solo_per_bid_elected_at`) registration; AE-14.2-RV-01 ratification queue add (paired with D-14.1-011 AE-14.1-RV-01).
- **Cross-coupled remediation passes:** §34.2.5 cross-cutting rule #5 first bullet (D-14.1-011) + second bullet (D-14.2-012) should land in a single reconciliation pass; the buyer-side and seller-side recommendations share the §34.2.5 paragraph and §44.6 envelope-activation-on-election semantics. M11.3 implementation pack should bundle both validators.
- **Phase 14.3 (Master Spec ↔ UX Design of Sourcera) status:** Unaffected by this re-verification; Phase 14.3 was completed in parallel after the original Phase 14.2 walk.

---

## UX Design v2

_Phase 14.4 — `UX_Design_of_Sourcera.md` v2.0.0 (2026-04-28) ↔ `Sourcera_Master_Spec.md` v7.1.0 §2.x / §3.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 + §38 Component Library cross-references + UX v2 §11.6 Accessibility AC. Walk against tokens (color, spacing, typography, motion, elevation), component variants, interaction states, and accessibility tokens. Walk produced 12 net-new defects (D-14.4-001 through D-14.4-012). Severity distribution: 0 P0 / 0 P1 / 12 P2 / 0 P3. All net-new drift is cross-document and intra-document token / variant / state / a11y-token coverage drift. Per CLAUDE.md §2 source-of-truth: every defect resolves with Master Spec winning on substantive contracts and UX v2 narrative editing OR (where Master Spec is silent) Master Spec authoring extension. Scratch findings + counterfactual + self-challenge log at `DEFECT_LEDGER.md → Phase 14.4 — UX_Design_of_Sourcera.md v2.0.0 ↔ Master Spec §3 ...` block. Cross-references to pre-filed D-3UX-NNN (PHASE3_SECTION3_FINDINGS) are surfaced but not duplicated._

### CHECKS — Walk Result Summary

| Check (per audit prompt) | Result | Drift inventory |
|---|---|---|
| (1) Tokens consistent (color, spacing, typography, motion, elevation) | ❌ FAIL | Color: D-14.4-002 (bare `--color-border` undefined in UX §2.2; resolves to `--color-border-default` per Master Spec §3.6.1); D-14.4-009 (Dark Mode token values absent — UX §2.2 declares dark-mode coverage exists but 22 tokens have zero hex values). Spacing: D-14.4-006 (helper-gap 8px in UX §5.2.13 vs `--input-helper-gap` 4px in Master Spec §3.6.1); D-14.4-007 (literal pixel values throughout UX §5.2 component specs instead of `--space-N` token references). Typography: D-14.4-001 (Heading 3 / Heading 4 roles referenced in §5.2.11 + §5.2.16 but undefined in UX §2.1 + Master Spec §38.1); D-14.4-005 (FormField label letter-spacing 0.5px in §5.2.13 vs Caption tracking 0.02em in §2.1). Motion: D-14.4-004 (SLATimer 0.6s pulse not in §2.6 motion table); D-14.4-010 (`motion.duration.medium` / `motion.ease.standard` referenced in §5.2.19 PipelineSurface but never defined in §2.6); D-14.4-011 (Modal scale-from 0.9 in §5.2.11 vs 95% in §2.6). Elevation: Reconciled clean — UX §2.4 + Master Spec §3 elevation tokens align; no defects. |
| (2) Component variants consistent | ❌ FAIL | D-14.4-003 (40px input height for Dropdown menu items + FormField textarea/select not in `--input-height-{sm,md,lg}` token scale 28/36/44); D-14.4-008 (AmendmentBanner z-index 50 in §5.2.17 collides with Toast layer per UX §2.8). D-3UX-019 (§3.10 Bulk Action Toolbar lacks state-machine table — pre-filed). |
| (3) Interaction states consistent | ❌ FAIL | D-14.4-004 (SLATimer breached-state 0.6s pulse + 32px height not in design-system foundation); D-14.4-010 (PipelineSurface 240ms step-transition motion-token never registered); D-14.4-011 (Modal scale-from drift between §5.2.11 and §2.6); D-3UX-020 (§3.7.6 per-surface state catalog has no dark-mode column — pre-filed). |
| (4) Accessibility tokens consistent | ❌ FAIL | D-14.4-012 (UX §11.6 AC A-09 uses `A/B/C/D` grade-badge vocabulary instead of canonical FM/PM/DNM/EX per Appendix J + UX §2.7 + Master Spec §4/§11/§13); D-14.4-009 (Dark Mode palette absence makes WCAG 1.4.3 ≥ 4.5:1 contrast verification impossible — A-01 cannot pass). UX §11.6 A-01 through A-12 otherwise reconcile to Master Spec §3.6.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 accessibility contracts. |

### Section-by-Section Walk

#### UX §2.1 Typography

**Status:** ⚠ PARTIAL.

The 7-row typography role table (Display / Heading 1 / Heading 2 / Body / Body Small / Caption / Mono) reconciles with Master Spec §38.1 token registry. Drift: D-14.4-001 (Heading 3 / Heading 4 referenced in §5.2.11 Modal + §5.2.16 PhaseAdvancer but undefined in §2.1); D-14.4-005 (FormField label inline restated tracking `0.5px` contradicts §2.1 Caption tracking `0.02em` ≈ 0.24px at 12px).

#### UX §2.2 Color System

**Status:** ⚠ PARTIAL.

Light Mode 22-row token table reconciles cleanly with Master Spec §3 color-token references. Grade-color tokens (FM=`--color-success` / PM=`--color-warning` / DNM=`--color-danger` / EX=`--color-exception`) align with canonical Sourcera grade vocabulary. Drift: D-14.4-002 (bare `--color-border` referenced in §5.2.13 + §5.2.19 but not in the 22-row light-mode table); D-14.4-009 (Dark Mode placeholder paragraph at line 168 declares "All color tokens have dark-mode equivalents" without providing the actual 22-row dark-mode hex value table).

#### UX §2.3 Spacing Scale

**Status:** ✅ Reconciled (scale itself); ⚠ on consumption.

The `--space-{1..12}` scale (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48) reconciles cleanly with Master Spec §3.6.1 (`--space-1`, `--space-3`, `--space-4`, `--space-6` consumed by token reference). Drift: D-14.4-007 (UX §5.2 component specs systematically use literal pixel values instead of `--space-N` token references — Modal Body 24px / DiffViewer panel headers 24px / multiple inline `8px` / `12px` / `16px` values). Cross-check: Master Spec §3.6.1 line 2378 uses canonical token form `--input-group-gap | --space-4 (16px)`; UX §5.2 specs do not.

#### UX §2.4 Elevation & Shadows

**Status:** ✅ Reconciled.

5-level shadow scale (Flat / Raised / Floating / Overlay / Topmost) reconciles with Master Spec §3 / §38 component shadow usage. No defects.

#### UX §2.5 Border Radius

**Status:** ✅ Reconciled.

5-token radius scale (`--radius-sm` 4px / `--radius-md` 6px / `--radius-lg` 8px / `--radius-xl` 12px / `--radius-full` 9999px) reconciles with Master Spec §3.6.1 (`--input-radius = --radius-md`) and §3 component implementations. No defects.

#### UX §2.6 Motion & Transitions

**Status:** ⚠ PARTIAL.

9-property motion table (Color/opacity 150ms / Side Peek 200ms / Modal open 200ms / Modal close 150ms / Toast enter 200ms / Toast exit 150ms / Skeleton 1500ms / Command Palette 150ms / Dropdown 100ms) reconciles cleanly at the per-property level. `prefers-reduced-motion: reduce` contract preserved at the paragraph closing the section. Drift: D-14.4-004 (SLATimer 0.6s pulse not in the 9-property table); D-14.4-010 (PipelineSurface `motion.duration.medium` 240ms + `motion.ease.standard` named-token form not registered in §2.6 — the section uses per-property naming, not named tokens); D-14.4-011 (Modal scale-from 95% per §2.6 vs 0.9 per §5.2.11 — cross-section drift). Recommended remediation pattern: migrate §2.6 from per-property to named-token form (`motion.duration.{xs,sm,md,lg,xl}` + `motion.ease.{standard,enter,exit}`).

#### UX §2.7 Iconography

**Status:** ✅ Reconciled.

Lucide Icons baseline; 20px / 16px / 24px size scale; 48×48 touch target per WCAG / §37.1; grade icons (checkmark-circle FM / half-circle PM / x-circle DNM / minus-circle EX) reconcile with §2.2 color tokens. Phase icons numbered circle badges 1–13 align with §3.3 (legacy chip ribbon) and §5.2.19 PipelineSurface. No defects.

#### UX §2.8 Z-Index Scale

**Status:** ⚠ PARTIAL.

10-layer scale (Base 0 / Sticky 10 / Sidebar 20 / Side Peek 30 / Dropdown 40 / Toast 50 / Modal Backdrop 60 / Modal 70 / Command Palette 80 / Tooltip 90 / Topmost 100) reconciles cleanly with Master Spec §3 component implementations. Drift: D-14.4-008 (AmendmentBanner §5.2.17 assigned z-index 50 — collides with Toast layer; banner is a sticky in-page element and should occupy Sticky 10 or a new Sticky Banner layer between Sidebar 20 and Side Peek 30).

#### UX §2.9 Form & Input Tokens

**Status:** ⚠ PARTIAL (cross-doc duplication policy-managed).

10-row token sub-table mirrors Master Spec §3.6.1 (which carries the canonical 25-token table). D-3UX-017 (P3 pre-filed) covers the cross-doc duplication; the `ux_token_drift_check` CI gate (§50.17.4) is the policy enforcement mechanism. Drift: D-14.4-003 (40px input height for Dropdown menu items + FormField textarea/select not in the 28/36/44 scale); D-14.4-006 (helper-gap 8px in §5.2.13 vs `--input-helper-gap` 4px in Master Spec §3.6.1).

#### UX §3.1–§3.7 Global Application Structure + Navigation

**Status:** ⚠ PARTIAL.

Application Shell, Sidebar Anatomy, Console Switcher, Responsive Layouts, Page Header Pattern, Navigation Model, Keyboard Shortcut Reference reconcile with Master Spec §3.8 + §3.10 + §50 + Appendix B Keyboard Shortcut Reference. Drift: D-3UX-003 (P2 pre-filed) — Side Peek default width drift between UX §3.1 (420px) and Master Spec §3.8.1 (480px); resolution path is UX v2 narrative edit per Master Spec authoritative dimension. Recommended remediation: update UX §3.1 block diagram (lines 287–293) and prose (line 299) from `420px` to `480px` in v7.1.1 mechanical pass.

#### UX §5.2 Component System Specification

**Status:** ⚠ PARTIAL.

10 existing components (DataTable / SidePeek / CommandPalette / ScoringCard / MarkdownEditor / ToastNotification / GradeBadge / PresenceIndicator / EmptyState / AgentAttribution) preserved without modification. 9 additional components authored (Modal §5.2.11 / Dropdown §5.2.12 / FormField §5.2.13 / TriageQueue §5.2.14 / SLATimer §5.2.15 / PhaseAdvancer §5.2.16 / AmendmentBanner §5.2.17 / DiffViewer §5.2.18 / PipelineSurface §5.2.19). Drift: D-14.4-001 (typography roles), D-14.4-002 (color tokens), D-14.4-003 (input heights), D-14.4-004 (motion + badge tokens), D-14.4-005 (typography role inline override), D-14.4-006 (helper-gap), D-14.4-007 (spacing tokens), D-14.4-008 (z-index), D-14.4-010 (PipelineSurface motion tokens), D-14.4-011 (Modal scale-from) — all 10 defects route to §5.2 component spec rewrites in v7.1.1 hygiene pass.

#### UX §11.6 Accessibility Acceptance Criteria

**Status:** ⚠ PARTIAL.

A-01 (WCAG 1.4.3 contrast ratio ≥ 4.5:1) / A-04 (keyboard navigation) / A-05 (focus indicators) / A-06 (form labels) / A-07 (semantic HTML) / A-08 (screen reader) / A-10 (skip-to-main) / A-11 (ARIA landmarks) / A-12 (form input labels) reconcile to Master Spec §3.6.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 accessibility contracts. Drift: D-14.4-012 (AC A-09 uses `A/B/C/D` grade-badge vocabulary instead of canonical FM/PM/DNM/EX); D-14.4-009 dependency (A-01 contrast verification impossible without dark-mode hex values).

### Roll-Up by Severity

| Severity | New defects this walk | Cross-references to existing |
|---|---|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 12 (D-14.4-001 through D-14.4-012) | D-3UX-003 (Side Peek width 480px vs 420px); D-3UX-017 (§3.6 token duplication, policy-managed); D-3UX-019 (§3.10 lacks state-machine table); D-3UX-020 (§3.7.6 per-surface catalog no dark-mode column — related to D-14.4-009) |
| P3 | 0 | — |

### Halt-Rule Application

Audit prompt classification rule: **"P2 typically; P1 if a UX contract is unimplementable as written."** All 12 net-new defects assessed at P2 per the pragmatic-interpretation precedent established by Phase 34.PXC / Phase 14.1 / Phase 14.2 / Phase 14.3.

**Strict-interpretation conversion:** 0 → 2 P1 (escalating D-14.4-001 typography-roles-undefined and D-14.4-010 motion-tokens-undefined to P1 under the "missing field-level schema" rule, since the tokens are cited in component specs but bound to no concrete values). The strict-interpretation list is recorded for v7.1.1 backlog completeness; recommendation stands at the pragmatic-interpretation P2 because every defect has a buildable resolution path within v7.1.1 hygiene scope (option-a token registration AE or option-b rewrite to existing token).

**Authoritative resolution:** Per CLAUDE.md §2 source-of-truth — Master Spec wins on every contract where Master Spec authors the canonical value:
- D-14.4-002 → `--color-border-default` (Master Spec §3.6.1 authoritative).
- D-14.4-006 → `--input-helper-gap` 4px (Master Spec §3.6.1 authoritative).
- D-14.4-011 → Modal scale-from 95% (UX §2.6 authoritative for motion contracts; §5.2.11 restates incorrectly).
- D-14.4-012 → FM / PM / DNM / EX grade vocabulary (Appendix J `requirement_score_grade` authoritative).

Where Master Spec is silent on a UX-v2-introduced contract, recommend Master Spec authoring extension:
- D-14.4-001 option (a) → register Heading 3 / Heading 4 in §2.1 + Master Spec §38.1.
- D-14.4-003 option (a) → register `--input-height-menu-item` 40px in §2.9 + Master Spec §3.6.1.
- D-14.4-004 → register `--badge-height-md` 32px + `--motion-duration-pulse` 600ms.
- D-14.4-009 → author 22-row Dark Mode hex palette in UX §2.2 (paired-mirror to Master Spec §3.11).
- D-14.4-010 → migrate §2.6 from per-property to named-token form (`motion.duration.{xs,sm,md,lg,xl}` + `motion.ease.{standard,enter,exit}`).

### Recommended Bulk Remediations

1. **v7.1.1 mechanical hygiene pass.** UX §5.2 component-spec rewrite replacing literal pixel values + bare token names + inline restated values with canonical token references per Master Spec §3.6.1 / §2.6 / §2.9. Closes D-14.4-002, D-14.4-005, D-14.4-006, D-14.4-007, D-14.4-008 (single edit per defect), D-14.4-011, D-14.4-012 in a single pass.
2. **Dark Mode palette authoring AE.** Author 22-row dark-mode hex table in UX §2.2 mirroring the light-mode table; verify per-token WCAG 1.4.3 contrast ratios ≥ 4.5:1 via Axe-core; add `ux_dark_mode_palette_completeness` validator to `ux_token_drift_check`. Closes D-14.4-009. Pair with §3.11 Dark Mode Parity Rules ratification.
3. **Named motion-token registry AE.** Migrate UX §2.6 motion table to named-token form (`motion.duration.{xs,sm,md,lg,xl}` + `motion.ease.{standard,enter,exit}`) with `motion.duration.md`=240ms added (D-14.4-010); update UX §5.2.19 PipelineSurface token references to cite the registered tokens; mirror in Master Spec §38.1. Closes D-14.4-010 + D-14.4-004 (motion side; badge side closed via separate token registration).
4. **Typography role expansion AE (optional).** If design genuinely wants Heading 3 / Heading 4 distinct from Heading 2 / Display, author the new roles in UX §2.1 + Master Spec §38.1 with concrete pixel / weight / line-height / tracking. Otherwise (recommended), rewrite UX §5.2.11 Modal title to Heading 2 and §5.2.16 PhaseAdvancer Phase Display to Heading 1 / Display. Closes D-14.4-001.
5. **Input-height-menu-item AE (optional).** If design genuinely wants 40px distinct from 36px standard, register `--input-height-menu-item` 40px in UX §2.9 + Master Spec §3.6.1. Otherwise (recommended), rewrite Dropdown menu items + FormField textarea/select to `--input-height-md` 36px. Closes D-14.4-003.
6. **Badge-height + motion-duration-pulse tokens AE.** Register `--badge-height-md` 32px in UX §2.9 or new §3.x Badge & Status Tokens table + register `--motion-duration-pulse` 600ms in §2.6 named-token migration (or as a discrete token if §2.6 is not migrated); update §5.2.15 SLATimer references; extend `prefers-reduced-motion: reduce` contract to disable the pulse. Closes D-14.4-004.
7. **CI gate validator extensions to `ux_token_drift_check` (§50.17.4).** Add 10 new regex-detector validators: `ux_helper_gap_4px_single_source`, `ux_spacing_token_single_source`, `ux_z_index_token_single_source`, `ux_motion_contract_single_source`, `ux_grade_vocabulary_single_source`, `ux_typography_role_single_source`, `ux_color_token_resolved`, `ux_input_height_token_resolved`, `ux_motion_duration_token_resolved`, `ux_dark_mode_palette_completeness`. Wire into M02.3 / M11.3 implementation pack runtime per `Build_Execution_Strategy.md` §11.

### Phase 14 Canonicalization Pass (this row)

This walk feeds the same Phase 14 cross-document reconciliation that Phase 34.PXC + Phase 14.1 + Phase 14.2 + Phase 14.3 seeded. The Phase 14 walk MUST consume:

- This UX Design v2 delta inventory (above);
- All `D-14.4-NNN` rows in `DEFECT_LEDGER.md`;
- Phase 14.4 counterfactual + self-challenge log embedded in `DEFECT_LEDGER.md → Phase 14.4` block;
- Cross-references to D-3UX-NNN (Phase 3 §3 audit), D-AS-NNN, D-PT-NNN, D-PXC-NNN, D-V6-NNN, D-13V-NNN, D-14.1-NNN, D-14.2-NNN, D-14.3-NNN defects already filed.

The 7 recommended bulk remediations above are the seed of the UX-v2-Cross-Walk v7.1.1 backlog reconciliation entries.

### Sign-Off (Phase 14.4)

- **Phase 14.4 walk completed.** 12 net-new defects filed (D-14.4-001 through D-14.4-012; all P2; 4 token / 2 component-variant / 3 interaction-state / 3 accessibility-token sub-clusters). All defects have reproducible evidence at cited line numbers, sharp recommendations, and defensible severity classifications.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "UX Design v2"` block appended (~12 KB; this block); `_audit/DEFECT_LEDGER.md → "Phase 14.4 — UX_Design_of_Sourcera.md v2.0.0 ↔ Master Spec §3 ..."` block appended (~30 KB; 12 defect rows + roll-up + counterfactual + self-challenge + sign-off).
- **v7.1.1 stamp gate inheritance:** D-14.4-001 through D-14.4-012 closure + 5 AE row ratifications (Phase 14.4 UX-v2-Cross-Walk Token Authoring block) + 10 new CI gate validators wired into `ux_token_drift_check` (§50.17.4) + UX v2 mechanical edits across §2.1 / §2.2 / §2.6 / §2.8 / §2.9 / §5.2.11 / §5.2.12 / §5.2.13 / §5.2.15 / §5.2.16 / §5.2.17 / §5.2.18 / §5.2.19 / §11.6.
- **Cross-coupled remediation passes:** The UX-v2-side rewrites (D-14.4-002 / -005 / -006 / -007 / -008 / -011 / -012) bundle naturally into a single v7.1.1 hygiene mechanical-edit Cowork session; the Master-Spec-side authoring extensions (D-14.4-001 option a, D-14.4-003 option a, D-14.4-004, D-14.4-009, D-14.4-010) bundle into a second Cowork session focused on `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase 14.4 block + ratification + Master Spec §38.1 token registry update.
- **Phase 14.5 / 14.6 / 14.7 (AE Ratification / Decisions Resolution / v7.1.1 Backlog Status per `Audit_Prompts.md → Prompts 14.5–14.7`):** unaffected by this Phase 14.4 walk; queue separately. Cross-document walks against `Build_Execution_Strategy.md` and `Linear_Execution_Blueprint.md` are NOT part of Phase 14 scope per `Audit_Prompts.md → Phase 14 — Cross-Document Consistency Audit` enumeration (which covers BPS / SPS / KB Engineering / UX Design / AE Ledger / Decisions / v7.1.1 Backlog); queue as v7.1.x audit-program extension if needed. (Cite-drift corrected 2026-05-13 per V14 remediation pass D-V14-002.)

---

## KB Engineering Spec

_Phase KB18 — exhaustive cross-walk of `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md §0–§18` (the full retired KB Engineering Spec) ↔ `Sourcera_Master_Spec.md` v7.1.0 §22 (16277–18866). Run 2026-05-12. Non-destructive. Defect mnemonic `D-KB18-NNN`. Scratch log at `_audit/PHASE_KB18_FINDINGS.md`. Posture: a Phase 5.2 + Phase 5.3 re-walk with a clean Opus context, executed as a single sweep across all seven prompt checks (counterpart coverage, beta header, MCP I/O verbatim, retrieval pipeline math, indexing substrate, skill registry, memory store). Walk produced 6 net-new defects (D-KB18-001, -003, -004, -006, -009, -013). Severity distribution: 0 P0 / 3 P1 / 2 P2 / 1 P3. 11 re-confirmations of existing Phase 5.2 / 5.3 / 5V defects (not re-filed; ledger is append-only). Per CLAUDE.md §2 source-of-truth: Master Spec wins on every drift; the KB Engineering Spec snapshot is historical reference only._

### CHECKS — Walk Result Summary

| Check (per audit prompt) | Result | Drift inventory |
|---|---|---|
| (1) Every KB Spec subsection has a §22 counterpart or explicit exclusion | ⚠ PARTIAL | KB §1.2 Non-Goals (3 items) and §1.3 Decision Principles (5 items) not mirrored in §22 — D-KB18-006 (P3). All §2–§18 sections map cleanly to §22.x with cross-references back to retired-snapshot section IDs. |
| (2) Beta header `managed-agents-2026-04-01` consistent | ✅ | Header pinned in KB Spec §2.4 + §19 References AND in Master Spec §22.2.3 + §22.16.9 References. Canary-rollout procedure enhanced in Master Spec. No drift. |
| (3) MCP tool I/O schemas verbatim consistent | ❌ FAIL | `cite_verify` carries two parallel reason-enum vocabularies inside Master Spec v7.1.0: §22.8.4.7 schema uses `entry_modified_after_offset_capture / offsets_out_of_range / excerpt_does_not_match / entry_not_found / entry_archived / entry_flagged_stale`; §22.16.1 semantics table uses `ok / entry_not_found / offsets_out_of_bounds / excerpt_mismatch / stale / unauthorized_namespace`. §22.4.3 line 16595 prose cites `entry_modified_after_offset_capture`; §22.9.8 line 17733 prose cites `stale`. Both prose references appeal to reason values that the §22.8.4.7 schema cannot both produce. D-KB18-001 (P1 enum / consistency_drift). Distinct from D-5.2-008 (HTTP error-code completeness). |
| (4) Retrieval pipeline math + parameters consistent | ❌ FAIL | Two intra-§22 numerical singletons drift between the `kb_retrieve` tool schema (§22.8.4.1) and the retrieval pipeline Stage 1 invariants (§22.9.1): (a) `query` length: schema `maxLength: 2000` vs. invariant `1–4,000 chars (§39 row mcp_kb_retrieve_query)` — D-KB18-003 (P1); (b) `namespace_preference[]` bounds: schema `minItems: 1, maxItems: 10` vs. invariant `0–8` — D-KB18-004 (P1). Both are numerical_singleton class. The §39 row `mcp_kb_retrieve_query` is named as authority but is not the value the schema actually enforces. KB Spec §3.4.1 said "Max 2000 chars" prose-only; KB Spec §3.4.1 was silent on `namespace_preference[]` bounds. RRF k=60, namespace boost 1.0/0.85, freshness modifier, re-rank top_k=5 all preserved verbatim. |
| (5) Indexing substrate consistent | ⚠ INHERITED | OpenSearch / Voyage-3-large / pgvector HNSW / Voyage rerank-2 / Claude Haiku secondary substrate preserved verbatim. §22.3.1 KBEntry `embedding Vector(1536)` contradicts Voyage-3-large 1024-dim substrate (KB Spec §4.2 + §22.9.2 + Voyage AI doc) — already filed as **D-5.2-014 (P2 data_model)**; not re-filed. Chunking strategy (KB §4.3 / §22.9.3), why-not-dense (KB §4.4 / §22.9.4), query expansion (KB §4.5 / §22.9.5), and metadata pre-filter (KB §4.7 / §22.9.7) all consistent. |
| (6) Skill registry consistent | ⚠ AE-FLAG-GAPS | Master Spec §22.12 lists 7 skills vs. KB Spec §8's 4 defined + 2 referenced-but-undefined. PCI added to compliance_citations (§22.12.4) — already D-5.3-009; docling_pdf + q_and_a_tone closed (§22.12.6/.7) — already D-5.3-010; kb_extraction scope-extended to ghost-bid (§22.12.5) — already D-5.3-011; skill_sourcera_capability_authoring added (§22.12.8) — AE-flagged inline. No new defects from this walk. |
| (7) Memory store consistent (session transcript persistence + audit-log ledger + tool audit ledger) | ⚠ PARTIAL | Session transcript persistence (KB §10.6 / §22.14.6) reconciles + adds §40.2 retention cross-ref. Tool audit ledger (KB §3.6 / §22.8.6 row "Audit") reconciles + adds 13-month retention rule. §6.7 audit-log ledger (KB §15.4 / §22.16.4) lists only 4 actions (`kb_retrieve`, `emit_structured_draft`, session start, session end) and omits 3 side-effectful state-persisting MCP tools (`doc_attach`, `capability_declare_draft`, `kb_entry_draft_create`); §22.17 AC #45 has the same omission. D-KB18-009 (P2 observability / audit-event-coverage). Distinct from D-5.3-016 (emit-side ambiguity, not coverage gap). |

### Authoritative-Source Inventory by Drift Class

#### Drift Class A — Tool Schema vs Pipeline Invariant Numerical Conflict (NEW)

| Surface | §22.8.4.1 schema | §22.9.1 Stage 1 invariant | Status |
|---|---|---|---|
| `kb_retrieve.query.maxLength` | 2000 chars | "1–4,000 chars (§39 row mcp_kb_retrieve_query)" | DRIFT (D-KB18-003) |
| `kb_retrieve.namespace_preference[]` bounds | `minItems:1, maxItems:10` | "length 0–8 (§39)" | DRIFT (D-KB18-004) |
| `kb_retrieve.top_k` | 1–10, default 5 | (not re-stated in §22.9.1) | ✅ |
| `kb_retrieve.max_excerpt_chars` | 200–1000, default 400 | (not re-stated; §22.9.1 Stage 8 says 400 default with 800 expansion for high-stakes) | ✅ |

#### Drift Class B — Reason-Enum Vocabulary Drift (NEW)

| `cite_verify` reason value | §22.8.4.7 schema | §22.16.1 table | §22.4.3 prose | §22.9.8 prose |
|---|---|---|---|---|
| Success | (null) | `ok` | n/a | n/a |
| Entry deleted | `entry_not_found` | `entry_not_found` | n/a | n/a |
| Offsets out of range | `offsets_out_of_range` | `offsets_out_of_bounds` | n/a | n/a |
| Excerpt mismatch | `excerpt_does_not_match` | `excerpt_mismatch` | n/a | n/a |
| Entry edited after retrieval | (covered by `entry_modified_after_offset_capture`) | (covered by `excerpt_mismatch`) | `entry_modified_after_offset_capture` | n/a |
| Stale (`review_overdue` / `flagged_stale`) | `entry_flagged_stale` | `stale` | n/a | `stale` |
| Entry archived | `entry_archived` | (absent) | n/a | n/a |
| Firewall violation | (HTTP 403 `firewall_violation`) | `unauthorized_namespace` | n/a | n/a |

The two prose references at §22.4.3 line 16595 (`entry_modified_after_offset_capture`) and §22.9.8 line 17733 (`stale`) each appeal to vocabulary that ONE of the two canonical surfaces uses but the OTHER does not. Reconciliation requires one canonical Appendix-J enum `cite_verify_reason` and a mechanical edit pass against all four call sites. D-KB18-001 (P1).

#### Drift Class C — Audit-Event Mapping Coverage Gap (NEW)

| MCP tool | Side effect | §22.16.4 audit mapping | AC #45 enumeration |
|---|---|---|---|
| `kb_retrieve` | None | `ai_kb_retrieved` | (not in AC #45 list) |
| `kb_get_entry` | None | (not mapped) | (not in AC #45 list) |
| `document_library_find` | None | (not mapped) | (not in AC #45 list) |
| `doc_attach` | Persists attachment row; buyer-visible | (not mapped) | (not in AC #45 list) |
| `capability_find` | None | (not mapped) | (not in AC #45 list) |
| `capability_declare_draft` | Persists `CapabilityDeclaration` row in `pending_review` | (not mapped) | (not in AC #45 list) |
| `kb_entry_draft_create` | Persists `KBEntry` row in `draft` | (not mapped) | (not in AC #45 list) |
| `kb_dedupe_check` | None | (not mapped) | (not in AC #45 list) |
| `cite_verify` | None | "not audited (internal verification)" | (not in AC #45 list) |
| `emit_structured_draft` (custom) | Persists Draft row | `ai_draft_emitted` | listed |
| `request_seller_clarification` (custom) | Updates requirement state | (not mapped) | listed |
| Session create | Session row | `ai_session_started` | listed |
| Session terminate | Session row | `ai_session_ended` | listed |

Three state-persisting MCP tool calls (`doc_attach`, `capability_declare_draft`, `kb_entry_draft_create`) have no §6.7 audit-event mapping in either §22.16.4 or §22.17 AC #45. The Sourcera Tool Audit Ledger (§22.8.6, operational store) captures them but is engineering-only, not the legal-evidence-trail §6.7 ledger. D-KB18-009 (P2).

#### Drift Class D — Surface Scope Silent-Extension (NEW)

| §22 surface | KB Spec source | Master Spec change | Status |
|---|---|---|---|
| §22.10.6 `agent_sourcera_ghost_bid_ingestion` tool allowlist | KB §6.6 — "full toolset … **No MCP needed at ingestion stage**" | Adds MCP tools `kb_dedupe_check` (§22.8.4.9) + `kb_entry_draft_create` (§22.8.4.8) with `scoped_allow_with_quota` 200/AIOperation cap | DRIFT (D-KB18-013) |

The Master Spec change is sound (Reviewer-Inbox routing per §22.4.1 requires the agent to write KBEntry drafts; KB §6.6's "no MCP" was inconsistent with the agent's actual job per `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md §10.4` Ghost-Bid Importer Flow). But the deliberate divergence is silent — same Authored-Extension-unflagged pattern as D-5.2-006 / D-5.3-010 / D-5.3-011. D-KB18-013 (P2 authored_extension).

#### Drift Class E — Engineering Decision Frame Lost (NEW; P3)

| KB Spec §1 substance | §22 counterpart | Status |
|---|---|---|
| §1.2 Non-Goal "build a custom agent loop" | Implied via §22.2.2 ("Why Managed Agents, Not Agent SDK") but not enumerated as a non-goal | ⚠ partial |
| §1.2 Non-Goal "expose KB retrieval directly to buyer agents" | Implied via §22.1 firewall scope and §22.16.7 firewall layers but not enumerated | ⚠ partial |
| §1.2 Non-Goal "maintain vector infrastructure inside application code paths" | Implied via §22.8.1 ("Why MCP") swappable-implementation rationale but not enumerated | ⚠ partial |
| §1.3 Decision Principle "Opinionated about interfaces, unopinionated about implementations" | (absent; partly inferable from §22.8.1) | ❌ missing |
| §1.3 Decision Principle "Agentic search first, semantic search as a tool Claude calls" | Cited in §22.9.4 narrative but not registered as a principle | ⚠ partial |
| §1.3 Decision Principle "Tool responses are high-signal" | Cited in §22.8.4.1 Response-shaping discipline + §22.16.2 token budget but not registered | ⚠ partial |
| §1.3 Decision Principle "Cite-before-state" | Heavily reflected throughout §22.10.2 / §22.12.2 / §22.16.1 but not registered as a principle | ⚠ partial |
| §1.3 Decision Principle "Guardrails in the harness, not the model" | Reflected in §22.16.1 six-layer guardrail table but not registered | ⚠ partial |

Documentation hygiene class only — engineering can still build without explicit principle registration. D-KB18-006 (P3).

#### Cross-References to Existing Phase 5.2 / 5.3 / 5V Defects (Re-Confirmed)

| Pre-existing defect | Re-confirmation note |
|---|---|
| D-5.2-006 | §22.8 preamble 9-vs-7 tool extension still unflagged at line 16740 |
| D-5.2-007 | Concrete request/response examples missing for §22.8.4.3 / .5 / .6 / .7 |
| D-5.2-010 | `cite_verify` rate-limit 60 rps (§22.8.6) vs. KB §3.6 "others 10 rps" — Master Spec correction unflagged |
| D-5.2-013 | `exclude_review_states` enum (§22.8.4.1) vs. §22.8.4.8 prose inconsistency |
| D-5.2-014 | `embedding Vector(1536)` vs. Voyage-3-large 1024-dim |
| D-5.2-022 | `KB_Engineering_Spec.md` bare-filename citations in §22.1–§22.8 |
| D-5.3-009 / -010 / -011 | Skill-side AE flags unattached (PCI, docling_pdf, q_and_a_tone, kb_extraction ghost-bid scope) |
| D-5.3-016 | §22.16.4 vs. §22.15.1 audit-event emit-side ambiguity for `emit_structured_draft` |
| D-5.3-023 | `KB_Engineering_Spec.md` bare-filename citations in §22.9–§22.16 |
| D-5V-004 | §22.10.3 per-Org concurrency lock — NOW AUTHORED in-place (§22.10.3.A added 2026-05-06; re-confirmed remediated) |

### Roll-Up by Severity

| Severity | New defects this walk | Cross-references to existing |
|---|---|---|
| P0 | 0 | — |
| P1 | 3 (D-KB18-001, D-KB18-003, D-KB18-004) | — |
| P2 | 2 (D-KB18-009, D-KB18-013) | D-5.2-006, D-5.2-007, D-5.2-010, D-5.2-013, D-5.2-014, D-5.3-009, D-5.3-010, D-5.3-011, D-5.3-016 |
| P3 | 1 (D-KB18-006) | D-5.2-022, D-5.3-023 |

### Halt-Rule Application

Audit-prompt halt rule: **"ANY DRIFT IS P1."** Pragmatic interpretation applied per the Phase 5.2 / 5.3 / 34.PXC precedent: schema-vs-pipeline numerical singletons and enum-vocabulary contradictions escalate to P1 because they are intra-§22 internal drift that a junior engineer cannot resolve without a single-source-of-truth decision; AE-flag-gap defects and audit-event-coverage gaps hold at P2; engineering-decision-frame loss holds at P3.

**Strict-interpretation conversion:** 3 → 5 P1 (escalating D-KB18-009 and D-KB18-013 from P2 to P1 under the "any drift is P1" reading). The strict list is recorded for v7.1.1 backlog completeness; recommendations stand at the pragmatic-interpretation severity assignment.

**Authoritative resolution.** All 6 defects resolve per CLAUDE.md §2 source-of-truth: Master Spec wins; recommendations rewrite the Master Spec in place (no KB Engineering Spec edit because the document is retired). Recommended sequencing: D-KB18-001 / -003 / -004 bundle into a single Phase 7 or Phase 8 mechanical-edit pass against §22.8.4.1 / §22.8.4.7 / §22.9.1 / §22.16.1; D-KB18-009 bundles with Phase 14.13a audit-event rollup; D-KB18-013 bundles with the v7.1.1 AE Ledger ratification pass.

### Recommended Bulk Remediations

1. **`cite_verify` reason-enum canonicalization.** Author Appendix J enum `cite_verify_reason` with the six-value canonical vocabulary (recommend the §22.16.1 set extended with `entry_archived`: `ok`, `entry_not_found`, `offsets_out_of_bounds`, `excerpt_mismatch`, `stale`, `entry_archived`, `unauthorized_namespace`). Rewrite §22.8.4.7 schema to reference the canonical enum. Edit §22.4.3 line 16595 to use `excerpt_mismatch` (or whatever canonical token replaces `entry_modified_after_offset_capture`). Verify §22.9.8 / §22.11.1 / §22.16.1 references all bind to the canonical enum. Add CI gate `cite_verify_reason_enum_canonical_consistency` asserting every prose reference uses an Appendix-J-registered value. Closes D-KB18-001.

2. **`kb_retrieve` numerical singletons bind to §39.** Add §39 rows `mcp_kb_retrieve_query` (canonical max 2000 chars — match the schema, since the §22.8.4.1 schema is the operational contract Claude sees) and `mcp_kb_retrieve_namespace_preference_length` (canonical bounds 1–10 — match the schema). Edit §22.9.1 Stage 1 invariant to cite §39 rows (NEVER inline literal). Add CI gate `mcp_kb_retrieve_schema_pipeline_singleton_consistency` asserting both bounds match across surfaces. Closes D-KB18-003 + D-KB18-004.

3. **§22.16.4 audit-event coverage expansion (Phase 14.13a rollup).** Add three audit-event mappings to §22.16.4 audit-log table:
   - `doc_attach → ai_document_attached`
   - `capability_declare_draft → ai_capability_declaration_drafted`
   - `kb_entry_draft_create → ai_kb_entry_drafted`
   
   Update §22.17 AC #45 enumeration to include the three new actions. Register the three new audit-event identifiers in Appendix J `audit_event_action_type` enum. Add CI gate `audit_event_coverage_kb_actions_state_persisting` asserting every state-persisting MCP tool call writes a §6.7 audit row. Closes D-KB18-009.

4. **§22.10.6 Authored Extension flagging.** Amend §22.10.6 tool allowlist row to include "Authored Extension — KB Spec §6.6 was silent on MCP at ingestion stage; Master Spec adds `kb_dedupe_check` + `kb_entry_draft_create` to support Reviewer-Inbox routing per §22.4.1." Add an AE row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (paired with the §22.10.3 KB Bootstrap MCP scope which also extended KB Spec §6.3). Closes D-KB18-013.

5. **§22 Goals / Non-Goals / Decision Principles surfacing (low-priority).** Optionally extend §22.1 with a "Non-Goals" subsection enumerating the three KB Spec §1.2 items, and a "Decision Principles" subsection enumerating the five KB Spec §1.3 principles. Engineering rationale that informs future §22 amendments (e.g., a future PR adding a new MCP tool kind would benefit from "Tool responses are high-signal" being explicit). P3 only — no blocking effect. Closes D-KB18-006.

### Phase KB18 Canonicalization Pass (this row)

This walk feeds the same Phase 14 cross-document reconciliation that Phase 34.PXC + Phase 14.1 + Phase 14.2 + Phase 14.3 + Phase 14.4 seeded. The Phase 14 walk MUST consume:

- This KB Engineering Spec delta inventory (above);
- All `D-KB18-NNN` rows in DEFECT_LEDGER.md;
- PHASE_KB18_FINDINGS.md scratch log (counterfactual + self-challenge);
- Cross-references to D-5.2-NNN, D-5.3-NNN, D-5V-NNN already filed.

The 5 recommended bulk remediations above are the seed of the KB-Engineering-Spec-Cross-Walk v7.1.1 backlog reconciliation entries.

### Sign-Off (Phase KB18)

- **Phase KB18 walk completed.** 6 net-new defects filed (D-KB18-001, D-KB18-003, D-KB18-004, D-KB18-006, D-KB18-009, D-KB18-013). Severity distribution: 0 P0 / 3 P1 / 2 P2 / 1 P3. All defects have reproducible evidence at cited Master Spec line numbers, sharp recommendations, and defensible severity classifications. Counterfactual pass + self-challenge pass logged at `_audit/PHASE_KB18_FINDINGS.md`.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "KB Engineering Spec"` block appended (this block); `_audit/DEFECT_LEDGER.md → "Phase KB18 — KB Engineering Spec §0–§18 vs Master Spec §22 Exhaustive Cross-Check"` block appended (6 defect rows + roll-up + sign-off); `_audit/PHASE_KB18_FINDINGS.md` scratch log written.
- **v7.1.1 stamp gate inheritance:** D-KB18-001 / -003 / -004 / -009 / -013 closure + 1 P3 documentation-only item (D-KB18-006 optional); 4 new CI gate validators (`cite_verify_reason_enum_canonical_consistency`, `mcp_kb_retrieve_schema_pipeline_singleton_consistency`, `audit_event_coverage_kb_actions_state_persisting`, plus the §22.10.6 AE-flag mechanical-edit); 1 new Appendix J enum (`cite_verify_reason`) registration; 2 §39 row authoring (`mcp_kb_retrieve_query`, `mcp_kb_retrieve_namespace_preference_length`); 3 new Appendix J `audit_event_action_type` enum extensions; 1 AE Ledger row (paired with §22.10.3 KB Bootstrap MCP scope).
- **Cross-coupled remediation passes:** D-KB18-001 / -003 / -004 / -009 are mechanical-edit hygiene that bundles naturally into a single v7.1.1 Cowork session against §22.8.4.1 / §22.8.4.7 / §22.9.1 / §22.16.1 / §22.17 AC #45 / Appendix J / §39. D-KB18-013 + §22.10.3 paired AE flagging is a separate one-paragraph edit + AE Ledger row.
- **Master Spec edit count avoided this run:** 0 (audit non-destructive by default per Audit_Prompts.md Global Conventions Preamble).
