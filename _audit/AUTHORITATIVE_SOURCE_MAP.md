# Sourcera Audit — Authoritative Source Map

**Phase:** Phase 1 / Numerical-Singleton Map (Audit Prompt — Authoritative Source Map task); extended Phase 2.3 (Numerical Singletons Tighter-Pass) on 2026-05-03.
**Baseline:** `Sourcera_Master_Spec.md` v7.1.0 (2026-04-28); `Sourcera_Buyer_Pricing_Strategy.md` v3 (2026-04-26); `Sourcera_Seller_Pricing_Strategy.md` v3 (2026-04-26).
**Run completed:** 2026-04-29 (Phase 1 initial pass).
**Extended:** 2026-05-03 (Phase 2.3 tighter-pass per Audit_Prompts.md Prompt 2.3). Added rate-limit Section RL.1–RL.6 (2026-04-29 D-0V-001 remediation). Phase 2.3 added: WALLET-MANUAL-TOPUP-MIN/MAX rows in Section E; PERF-REACTIVE-GENERAL row in Section O; canonical-home update on RET-K-ANON-SIGNAL (Section Q) from "§3.5 / §34.16" to canonical §48.4.7. Five new defects appended to DEFECT_LEDGER.md (D-2.3-001 … D-2.3-005). See PHASE2.3_FINDINGS.md for full scratch log.
**Scope.** Every numerical singleton — dollar figure, plan-gated limit, retention TTL, rate-limit, k-anonymity floor, AI-budget value-dollar, performance budget, SLA — that the Master Spec, Buyer Pricing v3, and Seller Pricing v3 are expected to keep single-sourced. One row per singleton: id · description · authoritative_section · authoritative_value · referencing_locations · notes (FX, k-anon, guest-exclusion, AE flag, etc.).
**Defect filing.** Every drift between the authoritative section's value and a referencing location is logged as a P1 `numerical_singleton` (or P2 `consistency_drift` for stale-but-banner-flagged tables) row in `DEFECT_LEDGER.md`. Mismatches between Buyer/Seller Pricing v3 and Master Spec §34 are explicitly P1 (CLAUDE.md §2 source-of-truth rule: §34 wins).

**Reading legend.**
- `auth_section` is the *only* place the value should live in canonical form. Authoring Conventions #10 (`CLAUDE.md` §11) requires every other location to cite this section, not restate the literal.
- `ref_locations` lists every place the value (or its plan-gating cell) is restated or cited. A row marked `cite-only` indicates the location only references the auth_section by anchor; a row marked `inline` indicates the literal value is restated.
- `drift?` column flags YES with a defect_id when a referencing location's literal does not match `authoritative_value`.

---

## A. Plan Tier Subscription Prices

| singleton_id | description | auth_section | auth_value | ref_locations | notes / drift |
|---|---|---|---|---|---|
| BUY-PRICE-FREE | Buyer Free monthly subscription price | §34.2.1 | $0 / $0 (annual / monthly) | §34.1.1; BPS v3 §3, §4; Appendix H stale row `sourcera-free` $0 | OK. Appendix H banner declares §34 authoritative; numeric matches. |
| BUY-PRICE-SOLO-ANN | Buyer Solo annual subscription price | §34.2.1 | $49 / month (billed annually) | §34.1.1 (cell footer); §34.10.3 row 1 ("Plan: Solo · $49/mo"); §44.6.2 row 1; BPS v3 §3 table, §5.1 | OK; `solo_tier_numeric_single_source` deploy-time validator (§34.1.3) asserts no other inline restatement. |
| BUY-PRICE-SOLO-MO | Buyer Solo monthly subscription price | §34.2.1 | $59 / month (billed monthly) | §44.6.2 row 2; BPS v3 §3 table, §5.1 | OK. |
| BUY-PRICE-SOLO-PEREVAL | Buyer Solo per-evaluation alternative | §34.2.1 + §34.2.5 | $199 USD / completed evaluation | §34.1.1 cell **Per-evaluation pricing alternative**; §34.2.5 (Buyer table); §34.10.5 (`sourcera_solo_buyer_per_eval_charge` value_amount_cents=19900); §44.6.2 row 3; BPS v3 §3, §5.1, §5.4 | OK; CI gate `solo_tier_numeric_single_source` enforces. |
| BUY-PRICE-STARTER-ANN | Buyer (Business) Starter annual price | §34.2.1 | $299 / month | §34.1.1 cell footer; Appendix H banner cites §34.2.1; BPS v3 §3 table, §6.1 | OK. |
| BUY-PRICE-STARTER-MO | Buyer Starter monthly price | §34.2.1 | $349 / month | BPS v3 §3 table, §6.1 | OK. |
| BUY-PRICE-GROWTH-ANN | Buyer Growth annual price | §34.2.1 | $799 / month | BPS v3 §3 table, §6.2; Appendix H banner | OK. |
| BUY-PRICE-GROWTH-MO | Buyer Growth monthly price | §34.2.1 | $949 / month | BPS v3 §3 table, §6.2 | OK. |
| BUY-PRICE-SCALE-ANN | Buyer Scale annual price | §34.2.1 | $1,999 / month | BPS v3 §3 table, §6.3; Appendix H banner | OK. |
| BUY-PRICE-SCALE-MO | Buyer Scale monthly price | §34.2.1 | $2,399 / month | BPS v3 §3 table, §6.3 | OK. |
| BUY-ENT-FLOOR | Buyer Enterprise subscription floor | §34.2.1, §34.12.5 | $3,000 / month | §34.1.1 cell footer; §34.20.7 AC #34; §34.12.5; BPS v3 §3 table, §7 | OK. |
| SEL-PRICE-FREE | Seller Free subscription price | §34.2.2 | $0 / $0 | §34.1.2; SPS v3 §3 table, §4 | OK. |
| SEL-PRICE-SOLO-ANN | Seller Solo annual subscription price | §34.2.2 | $49 / month (billed annually) | §34.1.2 cell footer; §34.10.3 row 4; §44.6.2 row 1 (Seller); SPS v3 §3 table, §5.1 | OK. |
| SEL-PRICE-SOLO-MO | Seller Solo monthly subscription price | §34.2.2 | $59 / month | §44.6.2 row 2 (Seller); SPS v3 §3 table, §5.1 | OK. |
| SEL-PRICE-SOLO-PERBID | Seller Solo per-bid alternative | §34.2.2 + §34.2.5 | $199 USD / submitted bid | §34.1.2 cell **Per-bid pricing alternative**; §34.2.5 (Seller table); §34.10.5 (`sourcera_solo_seller_per_bid_charge` value_amount_cents=19900); §44.6.2 row 4; SPS v3 §3, §5.1, §5.4 | OK. |
| SEL-PRICE-STARTER-ANN | Seller Starter annual price | §34.2.2 | **$149 / month** | §34.1.2 cell footer; Appendix H banner cites §34.2.2; SPS v3 §3 table, §6 | **DRIFT — D-AS-001 (P1).** §48.8.6 Conversion Moment #1 modal body inline restates as "$49 / month" (line 35680). |
| SEL-PRICE-STARTER-MO | Seller Starter monthly price | §34.2.2 | $179 / month | SPS v3 §3 table, §6 | OK. |
| SEL-PRICE-GROWTH-ANN | Seller Growth annual price | §34.2.2 | $499 / month | SPS v3 §3 table, §7; Appendix H banner | OK. |
| SEL-PRICE-GROWTH-MO | Seller Growth monthly price | §34.2.2 | $599 / month | SPS v3 §3 table, §7 | OK. |
| SEL-PRICE-SCALE-ANN | Seller Scale annual price | §34.2.2 | $1,499 / month | SPS v3 §3 table, §8; Appendix H banner | OK. |
| SEL-PRICE-SCALE-MO | Seller Scale monthly price | §34.2.2 | $1,799 / month | SPS v3 §3 table, §8 | OK. |
| SEL-ENT-FLOOR | Seller Enterprise subscription floor | §34.2.2, §34.12.5 | $3,000 / month | §34.1.2 cell footer; §34.20.7 AC #34; SPS v3 §3 table, §9 | OK. |
| BUY-PRICE-LEGACY-V6 | v6.0.0 grandfathered Business price (legacy) | §34.2.3 #9 | $499 / month (12-month grandfather) | Appendix H stale row `sourcera-business` ($499 annual / $599 monthly); §34.2.3 #9 grandfather rule | **DRIFT — D-AS-007 (P2).** Appendix H still emits the legacy SKU row in the Subscription Products table without explicit "DEPRECATED" annotation per row; banner above is the only mitigation. |

---

## B. Enterprise Volume Discount Bands (§34.2.4 — Authoritative)

| singleton_id | description | auth_section | auth_value | ref_locations | notes / drift |
|---|---|---|---|---|---|
| ENT-COMMIT-MIN | Enterprise minimum committed AI value spend | §34.2.3 #6, §34.12.5 | ≥ $12,000 / year | §34.1.1 cell **AI Budget**; §34.18 Scenario C; BPS v3 §7; SPS v3 §9; §4.8.8 schema | OK. |
| ENT-VOL-BAND-1 | 10% overage discount at ≥ $25K/yr commit | §34.2.4 (single source) | 10% at ≥ $25,000 | §34.2.3 #6 prose; §34.18 scorecard; BPS v3 §7; SPS v3 §9 | **DRIFT — D-AS-002 (P1).** BPS v3 §7 and SPS v3 §9 inline restate the four bands ("10% at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+") rather than citing §34.2.4. Validator `volume_discount_band_single_source` (§34.2.4 AC #1) targets the Master Spec only — companion-doc inline restatements are not currently CI-checked but violate Authoring Convention #10 and the §34.2.4 single-source rule. |
| ENT-VOL-BAND-2 | 15% overage discount at ≥ $50K/yr commit | §34.2.4 | 15% at ≥ $50,000 | §34.2.3 #6 prose; BPS v3 §7; SPS v3 §9 | Same drift as ENT-VOL-BAND-1 (D-AS-002). |
| ENT-VOL-BAND-3 | 20% overage discount at ≥ $100K/yr commit | §34.2.4 | 20% at ≥ $100,000 | §34.2.3 #6 prose; BPS v3 §7; SPS v3 §9 | Same drift (D-AS-002). |
| ENT-VOL-BAND-4 | 25% overage discount at ≥ $250K/yr commit | §34.2.4 | 25% at ≥ $250,000 | §34.2.3 #6 prose; BPS v3 §7; SPS v3 §9 | Same drift (D-AS-002). |

---

## C. AI Budget — Per-Plan Included Value-Dollars

| singleton_id | description | auth_section | auth_value | ref_locations | notes / drift |
|---|---|---|---|---|---|
| AI-BUDGET-BUYER-FREE | Buyer Free monthly AI included budget | §34.1.1 row **AI Budget** | $5 / mo (hard cap; no overage path) | §34.10.3 (Free+Free pool collapse); §34.9.1; BPS v3 §3, §4 | OK. |
| AI-BUDGET-BUYER-SOLO | Buyer Solo engine-absorbed envelope | §34.1.1 row **AI Budget** + §44.6.3 | ≈ $5 value-dollars / month (engine-absorbed; surface-hidden) | §34.10.3 Solo-co-resident rule; §44.6.3 (cited); BPS v3 §5, §5.4 | OK. CI gate `solo_envelope_value_single_source` (§44.6.8 AC #13) asserts. |
| AI-BUDGET-BUYER-STARTER | Buyer Business Starter monthly AI budget | §34.1.1 | $50 / mo | §34.10.3 row Buyer Starter + Seller Free pool $50; §34.9.1 trial; BPS v3 §6.1 | OK. |
| AI-BUDGET-BUYER-GROWTH | Buyer Growth monthly AI budget | §34.1.1 | $300 / mo | §34.10.3 (Buyer Growth + Seller Starter pool = $330); BPS v3 §6.2 | OK. |
| AI-BUDGET-BUYER-SCALE | Buyer Scale monthly AI budget | §34.1.1 | $800 / mo | §34.10.3 (Buyer Scale + Seller Growth pool = $1,000); BPS v3 §6.3 | OK. |
| AI-BUDGET-BUYER-ENT | Buyer Enterprise committed AI value spend | §34.1.1 + §34.12.5 | Committed (≥ $12K/yr) | §34.2.3 #6; BPS v3 §7 | OK. |
| AI-BUDGET-SELLER-FREE | Seller Free monthly AI budget | §34.1.2 | $5 / mo (hard cap) | §34.10.3; §34.9.2; SPS v3 §3, §4 | OK. |
| AI-BUDGET-SELLER-SOLO | Seller Solo engine-absorbed envelope | §34.1.2 + §44.6.3 | ≈ $5 value-dollars / month | §34.10.3 Solo-co-resident rule; §44.6.3; SPS v3 §5 | OK. |
| AI-BUDGET-SELLER-STARTER | Seller Starter monthly AI budget | §34.1.2 | $30 / mo | §34.10.3 (Buyer Growth + Seller Starter pool = $330; Buyer Solo + Seller Starter pool = $30); §34.13.3 step 5 (Pro Trial Seat); SPS v3 §6 | OK. |
| AI-BUDGET-SELLER-GROWTH | Seller Growth monthly AI budget | §34.1.2 | $200 / mo | §34.10.3 (Buyer Scale + Seller Growth pool = $1,000); SPS v3 §7 | OK. |
| AI-BUDGET-SELLER-SCALE | Seller Scale monthly AI budget | §34.1.2 | $600 / mo | SPS v3 §8 | OK. |

---

## D. Outcome-Pricing Formula Constants (§34.3.1, §34.3.3)

| singleton_id | description | auth_section | auth_value | ref_locations | notes / drift |
|---|---|---|---|---|---|
| VALUE-MULT | Accepted-value pricing multiplier | §34.3.1 | × 10 (cost_base × 10) | §34.14.1 derivation note; §34.14.2 invariant #1; §34.20.2 AC #6; BPS v3 §2.6, §12; SPS v3 §2.2, §10 (preamble) | OK. |
| COST-MULT | Rejected-cost pricing multiplier | §34.3.1 | × 1.05 (cost_base × 1.05) | §34.14.1; §34.14.2; §34.20.2 AC #6; BPS v3 §2.6, §12; SPS v3 §2.2, §10 | OK. |
| MARGIN-FLOOR-HARD | Hard blended-margin floor on `rev_ai_wallet` | §34.3.3, §34.18.1 | ≥ 88% (publish-path enforcement) | §34.14.2 #2 (88% at floor values); §34.18.2; §34.18.5 scorecard; §34.18.6 Scenario C floor-asymmetry; §34.18.7 AC #2/#3; §34.20.15 AC #71; §4.8.6 (`margin_at_value_price_pct ≥ 88%`); BPS v3 §2.6 / §1; SPS v3 §2.2 / §1 | **CITATION DRIFT — D-AS-003 (P3).** §34.3.3 (line 27449) attributes 88% to "BPS §2.4 / SPS §2.2"; the §34.3.3 table row (line 27471) attributes to "BPS §2.6; SPS §2.2". BPS v3 §2.4 is "Outcome-based pricing" (mentions 88% in Solo guarantee); BPS v3 §2.6 is "Margin protection mechanism" (canonical home of the 88% claim). The two §34.3.3 self-citations disagree. |
| MARGIN-FLOOR-ASPIRE | Aspirational `rev_ai_wallet` blended margin | §34.18.1 | ≥ 90% (soft target) | §34.18.2; §34.18.5 scorecard; §34.18.6 Scenario A/B; BPS v3 §1 | OK. |
| MARGIN-SUB-TARGET | Aspirational subscription margin | §34.18.1 | ≥ 75% (soft) | §34.18.5 scorecard | OK; cited from BPS §11 / SPS §11. |
| MARGIN-MARKET-TARGET | Aspirational marketplace-discovery margin | §34.18.1 | ≥ 85% (soft) | §34.18.5 scorecard | OK. |
| COST-BASE-RECALC-CADENCE | Nightly cost-base recalc | §34.3.3 | 02:30 UTC, idempotent | §34.11.3; §34.14.1 preamble; §34.20.2 AC #8; BPS v3 §10 #3 (cited as "nightly"); SPS v3 §10 (preamble) | OK. |
| COST-BASE-DRIFT-LOW | Per-capability drift alert (low) | §34.3.3 | ≥ 5% | §34.11.3 | OK; AE per row note. |
| COST-BASE-DRIFT-MED | Per-capability drift Finance alert | §34.3.3 | ≥ 10% | §34.11.3; BPS v3 §10 #3 | OK. |
| COST-BASE-DRIFT-HIGH | Drift block-auto-publish threshold | §34.3.3 | ≥ 25% OR margin-floor breach | §34.11.3 | OK; AE. |
| PRICING-NOTICE | Customer notification before breaking-change publish | §34.3.3 + §4.8.9 | ≥ 30 days before `effective_at` | §34.2.3 #7; §34.14.5 (`scheduled` row); §34.17.4 AC #8; BPS v3 §12; SPS v3 §12 (preamble) | OK. |

---

## E. AI Wallet — Configuration Singletons (§34.10)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| WALLET-TOPUP-MIN | Auto-topup minimum increment | §34.10.2 + §4.8.3 AC #5 | $50 (5,000 cents) | §4.8.3 schema row `auto_topup_increment_value_dollars`; §25661 (`cap_value_dollars_cents`); §25740 (`increment_value_dollars_cents`); §25777 error `wallet_topup_increment_out_of_range` | OK. |
| WALLET-TOPUP-MAX | Auto-topup maximum single increment | §34.10.2 | $10,000 (1,000,000 cents) | §4.8.3 schema; §25740, §25777 | OK. |
| WALLET-MAX-MONTHLY-CEIL | Auto-topup max monthly absolute ceiling | §34.10.2 | $500,000 (50,000,000 cents) | §4.8.3 schema; §25741, §25778 error `wallet_autotopup_max_monthly_out_of_range` | OK; AE flagged. |
| WALLET-OVERAGE-DEFAULT | Wallet overage state at signup | §34.10.2, §4.8.3 AC #4 | OFF (admin opt-in required) | §34.20.3 AC #11 | OK. |
| WALLET-NOTIFY-50 | First soft-warn threshold | §34.10.4 | 50% of (budget + overage_cap) | §4.8.3 AC #6; §34.10.2 row "Notification thresholds"; §34.20.3 AC #13 | OK; one-shot per period. |
| WALLET-NOTIFY-80 | Second soft-warn threshold | §34.10.4 | 80% of pool | §4.8.3 AC #6 | OK. |
| WALLET-NOTIFY-100 | Hard-cap threshold | §34.10.4 | 100% of pool | §4.8.3 AC #6 | OK. |
| WALLET-PAY-FAIL-GRACE | Payment-failed grace window | §34.10.4 | 48 hours | §4.8.3 wallet state machine | OK. |
| WALLET-CONTEST-WINDOW | ContestRecord filing window | §34.11.2 | 14 days from `settlement_at` (per-capability override ≤ 90) | §4.8.5 schema; §34.20.4 AC #19 | OK. |
| WALLET-CONTEST-OPS-SLA | Ops Finance contest decision SLA | §34.11.2, §34.11.4 | 5 business days | §34.20.4 AC #20 | OK. |
| WALLET-CONTEST-CREDIT-SLA | Approved-contest wallet credit | §34.11.4 | ≤ 1 business day | §34.20.4 AC #21 | OK. |
| WALLET-CONTEST-AUTOFILE | Late-rejected-signal autofile notify | §34.11.4 | Within 5 minutes | — | OK. |
| WALLET-FREE-ALLOWANCE | Default Free Allowance per customer-billed capability | §34.1.1, §34.1.2, §34.8.4 | 10 ops (lifetime per Org per capability; configurable per CapabilityRegistryEntry) | §4.8.7 schema; §14442; §34.20.3 AC #14; MS C.80 | OK. |
| KB-BOOTSTRAP-FREE-ALLOW | KB Bootstrap Free Allowance override | §34.14.4 | 1 lifetime per Seller Org | §4.8.7 (`scope_hint=lifetime_per_org`, `reset_at=9999-12-31`); §34.1.2 cell **KB Bootstrap (Opus)**; §34.20.11 AC #50 | OK; AE. |
| GHOST-RFP-FREE-ALLOW | Ghost-RFP Ingestion Free Allowance override | §34.14.4 | 1 lifetime per Seller Org | §4.8.7; §34.1.2; §34.20.11 AC #50 | OK; AE. |
| ENT-CONTRACT-OVERAGE-RULE | Enterprise overage rule | §34.10.6 | `shortfall_policy ∈ {forfeit (default), partial_credit_next_year, rollover_capped (≤ 25%)}` | §4.8.8 schema; BPS v3 §7; SPS v3 §9 | OK. |
| WALLET-MANUAL-TOPUP-MIN | Manual top-up amount lower bound (`POST /v1/orgs/:org_id/wallet/topup`) | §32.8 (line 26692) | $10 | Master Spec line 26692 (`topup_amount_out_of_range` 400) | OK; distinct from auto-topup `WALLET-TOPUP-MIN` ($50). Manual top-up admits smaller increments than auto-topup. Enrolled 2026-05-03 per Phase 2.3 sweep (D-2.3-004). |
| WALLET-MANUAL-TOPUP-MAX | Manual top-up amount upper bound | §32.8 (line 26692) | $10,000 | Master Spec line 26692 | OK; matches auto-topup `WALLET-TOPUP-MAX`. Enrolled 2026-05-03 per Phase 2.3 sweep (D-2.3-004). |

---

## F. Solo-Tier Surface Treatment (§44.6)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| SOLO-ENVELOPE-VALUE | Solo-tier engine-absorbed envelope | §34.1.1 / §34.1.2 / §44.6.3 | $5 absorbed value-dollars / month or per evaluation/bid | §44.6.3 cited; §22.20.5 / §17.8 references | OK; CI gate `solo_envelope_value_single_source`. |
| SOLO-THROTTLE-DEFAULT | Throttling threshold default | §44.6.4 | 80% of envelope (configurable 50–95) | §44.6.8 AC #4 | OK; per-capability override via `surface_throttling_class`. |
| SOLO-PEREVAL-RETENTION | Solo per-eval / per-bid post-charge retention | §34.2.5 | 90 days from charge | §34.1.1 / §34.1.2 cell footer; §44.6.2 row 3/4; BPS v3 §5.4; SPS v3 §5.4 | OK. |
| SOLO-REFUND-WINDOW | Refund window from charge time | §34.2.5 | 7 calendar days | §34.1.1 cell **Per-evaluation**; §44.6.2; §34.12.8 Failure Mode #7; BPS v3 §5.4; SPS v3 §5.4 | OK. |
| SOLO-REFUND-OPENS-LIMIT | Buyer-side eligibility check | §34.2.5 | ≤ 3 distinct viewer/recipient opens | §34.20.x; BPS v3 §5.4 | OK. |
| SOLO-CHARGE-PENDING-WINDOW | Charge-failure retry window | §34.2.5 | ≤ 24 hours then auto-abandon | — | OK. |
| SOLO-DUAL-PRICE | Buyer Solo + Seller Solo combined customer total | §34.12.6 + §34.10.3 | $98/mo subscription (2× $49) OR two independent $199 charges | SPS v3 §12 #6 | OK; no Solo-bundle discount. |
| SOLO-LP-BACKGROUND-MEMBERSHIP | `low_priority_background` v7.1 membership | §44.6.4.1 | 3 capabilities: `proactive_cmd_k_marketplace_surfacing`, `weekly_kb_refresh_suggestions`, `vendor_page_enrichment_polling` | — | OK; Ops Finance + Founder dual-signoff to add/remove. |

---

## G. Pro Trial Seat (§34.13)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| PRO-TRIAL-DURATION | Trial length | §34.13 | 30 days from grant redemption | §34.13.4; §34.20.8 AC #36; BPS v3 §3 footer; SPS v3 §15.6 | OK. |
| PRO-TRIAL-SCALE-ALLOC | Buyer Scale monthly allowance | §34.1.1 cell **Vendor Pro Trial Seats (M17)** | 5 / month | §34.13.5 (`trial_seat_pool_exhausted` row); §34.20.8 AC #35; BPS v3 §3 table | OK. |
| PRO-TRIAL-ENT-ALLOC | Buyer Enterprise monthly allowance | §34.1.1 | 15 / month | §34.13.5; §34.20.8 AC #35; BPS v3 §3 table | OK. |
| PRO-TRIAL-SAME-PAIR-RATE | Same buyer-vendor pair rate-limit | §34.13.5 | 1 grant per 365 days | §34.13.8 AC #7; §34.20.8 AC #38 | OK. |
| PRO-TRIAL-DAY-27 | Pre-expiry vendor reminder | §34.13.3 step 7 | Day 27 (3 days before expiry) | — | OK. |
| PRO-TRIAL-DAY-31 | Auto-downgrade boundary | §34.13.4 | Day 31 23:59 UTC | §34.20.8 AC #36 | OK. |
| PRO-TRIAL-PERSIST | Auto-downgrade preservation window | §34.13.4 + §34.6.1 | 90 days read-only | — | OK; cites §34.6.1. |

---

## H. Onboarding & Trial (§34.9)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| BUYER-TRIAL-DURATION | Auto-applied Business Starter trial on buyer signup | §34.9.1 | 14 days, no credit card | §34.2.3 #1; §41.2 (`Trial Expiring` email row) | OK. |
| BUYER-TRIAL-DAY-11 | Trial-expiring email | §34.9.1 | Day 11 | §41.2 | OK. |
| BUYER-TRIAL-DAY-14 | Last-day reminder | §34.9.1 | Day 14 | — | OK. |
| TRIAL-WALLET-PRORATED | Trial wallet sizing | §34.9.1 | Business Starter $50 prorated to 14 days | — | OK; AE per row. |

---

## I. Plan Upgrade / Downgrade & Excess-Data Preservation (§34.5–§34.6)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| DOWNGRADE-WARNING-WINDOW | Pre-effective downgrade warning | §34.5.2, §34.5.3 | 14 days before effective downgrade | §34.20.5 AC #23 | OK. |
| DOWNGRADE-PRESERVATION-WINDOW | Read-only preservation | §34.6.1 + §40.2 | 90 days from `downgrade_at` | §4.8.10 schema + AC #4; §34.20.5 AC #25; §40.2 retention table; BPS v3 §10 #8; SPS v3 §17.4 | OK. |
| BUCKET-CREATE-SLA | DowngradeExcessDataBucket creation SLA | §4.8.10 AC #1 | ≤ 5 minutes from effective downgrade | §34.6.1; §34.20.5 AC #24 | OK. |
| HARD-ARCHIVE-SLA | Hard-archive cron pickup SLA | §34.6.3 | ≤ 1 hour from `preservation_until` | §4.8.10 AC #3; §34.20.5 AC #26 | OK. |
| COLD-RESTORE-WINDOW | Customer-initiated cold-storage restoration | §4.8.10 state machine | 90 days post-archive (Ops-assisted; 24-hour SLA); 180 days hard ceiling | §34.6.3 cited; §34.20.5 AC #26 | OK. |
| COLD-STORAGE-RETENTION | Cold-storage row retention | §4.8.10 AC #5 + §40.2 | 7 years (financial-record-aligned `extended_financial`) | §34.6.3 cited; §40.2 retention | OK. |
| FINANCIAL-RETENTION | Financial-record retention | §40.2 + §6.8.5 #3 | 7 years (AIOperation, AIWallet, ContestRecord, CommittedSpendContract, MarketplaceDiscoveryRevenueRecord, PromotedListing, FeaturedPlacement, VerificationReviewRecord, BuyerReferral financial fields, Pro Trial Seat financial fields) | §40.2; §6.8.5 retained-row class table; §34.6.5; §34.6.6 | OK. |

---

## J. Seat Counting & RBAC (§34.7)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| SEAT-PER-ORG-PRICING | Per-seat pricing | §34.7, §34.4 | NEVER per-seat under any plan | §34.20.6 AC #27; BPS v3 §2.1; SPS v3 §3 | OK; QA test `pricing_api_no_per_seat_pricing`. |
| SEAT-SNAPSHOT-CRON | Monthly snapshot cron | §34.7.2 + §4.8.11 AC #1 | 02:00 UTC, 1st of each month | §34.20.6 AC #30 | OK. |
| SEAT-SNAPSHOT-PLAN-CHG | Plan-change snapshot | §34.7.2 + §4.8.11 AC #2 | ≤ 60 seconds | §34.8.6 Failure Mode #4 (cited) | OK. |
| SEAT-DELETED-WINDOW | Deleted-count rolling window | §34.7.1 + §4.8.11 | 30 days (`deleted_count_30d`) | — | OK. |
| SEAT-REASSIGN-OWNERSHIP | Owned-entity reassignment SLA | §34.7.4 + §40.2 | 24 hours of deprovisioning | §40.2 retention table row | OK. |
| GUEST-EXCLUSION | Guest seat exclusion rule | §34.7.1 + §4.8.11 AC #3 | Guests + API-only identities NEVER counted | §34.20.6 AC #29 | **Guest exclusion rule** — applies platform-wide. |

---

## K. Marketplace Discovery — Promoted Listings (§34.16)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| PROMOTED-BASE-RATE | Promoted Listing base rate | §34.16.1 | $500 / category / week | §39 (`promoted_listing_bid_*` ceilings); §34.20.13 AC #58; SPS v3 §13.1; Appendix J `promoted_listing_*`; line 5535, 28525, 28649, 43344, 44160, 45280, 45486 | OK; reserve / floor doubles as base rate in single-bidder case. |
| PROMOTED-MAX-BID | Per-category-week sanity cap | §34.16.5 | $10,000 / category / week | §34.16.7 error `promoted_listing_bid_above_max` (line 28650); §34.20.13 AC #58 | OK. |
| PROMOTED-K-ANON-FLOOR | Auction-digest k-anonymity floor | §34.16.1 + §34.16.4 #4 | k = 5 distinct Seller Orgs / category / week | §39 row `k_anon_floor`; §34.16.7 (`marketplace_discovery.anonymization_threshold_breach`); §34.20.13 AC #59, AC #66; Appendix M k=5 row | OK. |
| PROMOTED-CATEGORY-CAP | Hard cap on winners per category-week | §34.16.1 #6 | ≤ 3 winners | §34.20.13 AC #60 | OK. |
| PROMOTED-SELLER-MO-CAP | Per-seller monthly hard cap | §34.16.1 | 1 primary + 4 additional per month (Ops Finance pre-approval above 4) | SPS v3 §13.1 ("Hard-capped at 4 additional"); Appendix J `promoted_listing` row; Summary §2.10 cited at line 44160; §34.20.13 AC #60 | OK. |
| PROMOTED-INCLUDED-SCALE | Included monthly slots — Seller Scale | §34.1.2 cell **Promoted Marketplace Placements** | 1 / month (category-capped) | §34.16.1; line 5535, 44160, 45280, 45486; SPS v3 §13.1 | OK. |
| PROMOTED-INCLUDED-ENT | Included monthly slots — Seller Enterprise | §34.1.2 | 3 / month | §34.16.1; line 5535, 44160, 45280, 45486; SPS v3 §13.1 | OK. |
| PROMOTED-AUCTION-OPEN | Bid window open | §34.16.1 | Sunday 12:00 UTC | §34.16.7 (`promoted_listing.auction_opened` cron) | OK. |
| PROMOTED-AUCTION-CLOSE | Bid window close | §34.16.1 | Monday 00:00 UTC | §34.16.7 | OK. |
| PROMOTED-AUCTION-SETTLE | Settlement timing | §34.16.1 | Tuesday 03:00 UTC | §34.16.7 (`promoted_listing.auction_settled` cron) | OK. |
| PROMOTED-CPM-CEILING | Per-impression bid hard ceiling (§39) | §39 row `bid_impression_cents` | ≤ 5,000 cents = $50.00 CPM | — | OK; distinct from category-week base. |
| PROMOTED-EOI-CEILING | Per-EOI bid hard ceiling (§39) | §39 row `bid_eoi_cents` | ≤ 100,000 cents = $1,000.00 | — | OK. |
| PROMOTED-DAILY-CAP | Per-listing daily spend cap (§39) | §39 row `daily_cap_cents` | $1.00–$5,000.00 (100–500,000 cents) | — | OK. |

---

## L. Marketplace Discovery — Verification Tiers & Featured (§34.16.2, §34.16.3)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| VERIFICATION-PRICE | Seller-paid price for any verification tier | §34.16.2 | $0 (always) | §34.20.13 AC #61; SPS v3 §13.2 | **Platform-integrity invariant** — paid verification destroys the trust signal. |
| VERIFICATION-VERIFIED-SLA | Verified review SLA | §44.1 `Verification review terminal-decision SLA - Verified` | 5 business days | §4.4.21; §39 row cites §44.1 | OK. |
| VERIFICATION-CERTIFIED-SLA | Certified review SLA | §44.1 `Verification review terminal-decision SLA - Certified` | 10 business days | §4.4.21; §39 row cites §44.1 | OK. |
| VERIFICATION-RECERT | Certified re-review cadence | §44.1 `Verification certified re-review cadence` | 90 days | §4.4.21; §34.16.2; §39 row cites §44.1 | OK — D-AS-008 remediated 2026-06-22 by the Phase 2.2 VerificationReviewRecord singleton pass. §34.16.2 no longer states an annual Certified recertification cadence. |
| VERIFICATION-APPEAL-WINDOW | Appeal after rejection | §44.1 `Verification appeal window` | 14 days (Authored Extension) | §4.4.21; Appendix I; §39 row cites §44.1 | OK; AE flagged. |
| VERIFICATION-COOLDOWN | Post-rejection cooling-off | §44.1 `Verification appeal cooling-off window` | 30 days | §4.4.21; Appendix I; §39 row cites §44.1 | OK; AE flagged. |
| FEATURED-PAID-MODE-DEFAULT | Featured Placement paid-commitment mode | §34.16.3 | DEFAULT OFF (`featured_placement_paid_mode_enabled=false`); editorial-only at v7.0.0 | §34.20.13 AC #62; SPS v3 §13.3 | OK; AE deferred. |
| FEATURED-FTC-OBS-LATENCY | FeaturedPlacement FTC disclosure runtime observation latency | §44.1 / §44.7 | p99 ≤ 1 second from server-side FTC label + tooltip render composition to §4.3.18 Usage Event outbox enqueue | §4.4.20 AC #9; Appendix G `featured_placement_ftc_disclosure_rendered` | OK; D-2.2-043 remediated 2026-06-22. |

---

## M. Object Size Constraints — Plan-Gated Numericals (§39 → cite §34.1)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| KB-ENTRIES-FREE | Free KB ceiling | §34.1.1 / §34.1.2 | 50 entries | §39 row `Internal Comment Thread → active threads per Workspace` cite-only; SPS v3 §3 / §4; BPS v3 §3 / §4 | OK. |
| KB-ENTRIES-BUYER-SOLO | Buyer Solo KB ceiling | §34.1.1 | 50 entries (mirrors Free) | BPS v3 §3 / §5.2 | OK. |
| KB-ENTRIES-SELLER-SOLO | Seller Solo KB ceiling | §34.1.2 | 250 entries | §34.2.5 (90-day persistence above Free 50-entry); SPS v3 §3 / §5.2 | OK. |
| KB-ENTRIES-STARTER | Buyer / Seller Starter KB ceiling | §34.1.1 / §34.1.2 | 1,000 entries | BPS v3 §6.1; SPS v3 §6 | OK. |
| KB-ENTRIES-GROWTH | Growth KB ceiling | §34.1.1 / §34.1.2 | 10,000 entries | BPS v3 §6.2; SPS v3 §7 | OK. |
| VENDORS-FREE | Buyer Free vendors-tracked cap | §34.1.1 | 25 vendors | BPS v3 §3 / §4 | OK. |
| ACTIVE-EVALS-FREE | Concurrent active evaluations — Free | §34.1.1 | 1 | BPS v3 §3 / §4 | OK. |
| ACTIVE-EVALS-SOLO | Concurrent active evaluations — Buyer Solo | §34.1.1 | 1 | BPS v3 §3 / §5.2 | OK. |
| ACTIVE-EVALS-STARTER | Concurrent active evaluations — Buyer Starter | §34.1.1 | 5 | BPS v3 §6.1 | OK. |
| ACTIVE-EVALS-GROWTH | Concurrent active evaluations — Buyer Growth | §34.1.1 | 20 | BPS v3 §6.2 | OK. |
| BIDS-CONCURRENT-FREE-SOLO | Seller concurrent invited bids — Free / Solo | §34.1.2 | 1 | SPS v3 §3 / §4 / §5.2 | OK. |
| BIDS-CONCURRENT-STARTER | Seller concurrent invited bids — Starter | §34.1.2 | 3 | SPS v3 §6 | OK. |
| BIDS-CONCURRENT-GROWTH | Seller concurrent invited bids — Growth | §34.1.2 | 15 | SPS v3 §7 | OK. |
| EOIS-STARTER | Seller proactive EOI quota — Starter | §34.1.2 | 10 / month | SPS v3 §6; §34.13.3 (Pro Trial Seat unlock) | OK. |
| FIRECRAWL-SOURCES-SOLO | Firecrawl sources — Seller Solo | §34.1.2 | 1 (weekly cadence) | SPS v3 §3 / §5.2 | OK. |
| FIRECRAWL-SOURCES-STARTER | Firecrawl sources — Seller Starter | §34.1.2 | 2 (weekly cadence) | SPS v3 §6 | OK. |
| FIRECRAWL-SOURCES-GROWTH | Firecrawl sources — Seller Growth | §34.1.2 | 10 (daily cadence) | SPS v3 §7 | OK. |
| FIRECRAWL-SOURCES-SCALE | Firecrawl sources — Seller Scale | §34.1.2 | Unlimited (real-time, fair-use ≤ 50 domains) | SPS v3 §8 | OK; fair-use 50-domain cap is cited only in SPS v3 §8 — recommend annotating in §34.1.2 cell footer for parity. |
| KB-BOOTSTRAP-SOLO | Seller Solo KB Bootstrap allowance | §34.1.2 | 1 lifetime + 1 / year re-bootstrap | SPS v3 §3 / §5.2 | OK; AE per §34.14.4. |
| KB-BOOTSTRAP-STARTER | Seller Starter KB Bootstrap allowance | §34.1.2 | 1 lifetime + 1 / year | SPS v3 §6 | OK. |
| KB-BOOTSTRAP-GROWTH | Seller Growth KB Bootstrap allowance | §34.1.2 | 1 lifetime + 3 / year | SPS v3 §7 | OK. |
| STORAGE-FREE | Buyer Free storage cap | §34.1.1 | 1 GB | BPS v3 §3 / §4 | OK. |
| STORAGE-SOLO | Buyer Solo storage cap | §34.1.1 | 5 GB | BPS v3 §3 / §5.2 | OK. |
| STORAGE-STARTER | Buyer Starter storage cap | §34.1.1 | 25 GB | BPS v3 §6.1 | OK. |
| STORAGE-GROWTH | Buyer Growth storage cap | §34.1.1 | 250 GB | BPS v3 §6.2 | OK. |
| STORAGE-SCALE | Buyer Scale storage cap | §34.1.1 | 2 TB | BPS v3 §6.3 | OK. |
| API-ADD-ON | API add-on fee | §34.1.1 cell **API Add-On** | $99 / month (Buyer Starter+; included in Enterprise; not available on Solo) | §34.8.5 row `api_add_on`; BPS v3 §3, §9 | OK. |
| API-KEYS-FREE | Buyer Free API keys cap | §34.1.1 | 1 | — | OK; AE preserved from v6.0.0. |
| API-KEYS-STARTER | Starter API keys cap | §34.1.1 | 5 | — | OK. |
| API-KEYS-GROWTH | Growth API keys cap | §34.1.1 | 25 | — | OK. |
| API-KEYS-SCALE | Scale API keys cap | §34.1.1 | 50 | — | OK. |
| API-KEYS-ENT | Enterprise API keys cap | §34.1.1 | 100 | — | OK. |
| WEBHOOK-ENDPOINTS | Webhook endpoint cap (mirrors API key column) | §34.1.1, §34.1.2 | 1 / 1 / 5 / 25 / 50 / 100 (Free/Solo/Starter/Growth/Scale/Enterprise) | §44.6.7 #13 (Solo at 1 mirrors Free); §31.5 | OK. |
| AUDIT-RETENTION-UI | Audit-log retention (UI surface) | §34.1.1 / §34.1.2 | 30d / 30d / 1y / 1y / 3y / 7y (Free/Solo/Starter/Growth/Scale/Enterprise) | §40.2 (financial / billing audit always 7y); BPS v3 §3; SPS v3 §3 | OK; financial audit logs always retained 7y regardless of UI cap (per §40.2 + §6.8.5 #1). |
| VENDOR-FILE-RETENTION | Vendor file retention by plan | §34.1.1 cell **Vendor File Retention** + §40.2 | 12mo / 12mo / 12mo / 12mo / 24mo / 36mo (Free/Solo/Starter/Growth/Scale/Enterprise) | — | OK. |
| API-RATE-STARTER | API add-on rate-limit Starter | §32.4 (cited); BPS v3 §9 | 60 req/min | — | OK; cited from §32.4 — verify §32.4 numerical authority on next pass. |
| API-RATE-GROWTH | API add-on rate-limit Growth | §32.4; BPS v3 §9 | 300 req/min | — | OK. |
| API-RATE-SCALE | API add-on rate-limit Scale | §32.4; BPS v3 §9 | 1,200 req/min | — | OK. |

---

## N. Object Size Constraints — Field-Level Limits (§39, no plan-gating)

A representative selection — full table is §39. Each row is the single authoritative home; no other section restates.

| singleton_id | description | auth_section | auth_value | notes |
|---|---|---|---|---|
| REQ-TITLE-MAX | Requirement title char limit | §39 | 500 chars Markdown | OK. |
| REQ-DESC-MAX | Requirement description char limit | §39 | 10,000 chars | OK. |
| RESP-ANSWER-MAX | Response answer char limit | §39 | 50,000 chars | OK. |
| RESP-FILE-MAX | Per-file evidence cap | §39 | 50 MB | OK. |
| RESP-FILES-MAX | Files per response | §39 | 10 files | OK. |
| KB-BODY-MAX | KB entry body char limit | §39 | 50,000 chars Markdown | Inline cite at §22.x line 14782 ("≤ 50,000 chars"); OK. |
| KB-TITLE-MAX | KB entry title char limit | §39 (implied) | 200 chars (cited at line 14782) | **DRIFT — D-AS-009 (P3).** §39 main table does not enumerate `KB Entry → title`; the 200-char limit appears inline at line 14782 only. Recommend adding row to §39. |
| INTERNAL-COMMENT-BODY | Internal Comment / Post body char limit | §39 | 5,000 chars | OK. |
| INTERNAL-COMMENT-MENTIONS | Mentions per post | §39 | 50 mentions; AE flagged | §25.7.4 cited; §19554 inline note. |
| GHOST-RFP-FILE-MAX | GhostBidImport per-import file cap | §39 | 250 MB | OK. |
| GHOST-RFP-RAW-TEXT | GhostBidImport raw_text cap | §39 | 2,000,000 chars | OK. |
| GHOST-RFP-QA-PARSED | GhostBidImport parsed_qa_pairs_json | §39 | 1,000,000 chars (≤ 500 pairs per import per line 35389) | **DRIFT — D-AS-010 (P3).** §39 row says raw is 2M chars and parsed JSON is 1M chars. Line 35389 also says "parsed Q&A pairs ≤ 500 per import" — that 500-pair cap is in §35389 inline note but absent from §39. Recommend adding row. |
| EVAL-STARTER-USE-CASES | EvalStarter seed Use Cases bounds | §39 + §4.5.9 | 3–8 entries | OK. |
| EVAL-STARTER-REQS | EvalStarter seed Requirements bounds | §39 | 30–80 entries | OK. |
| DEFENSE-VIEW-REC-LEN | Defense View `recommendation_text` | §39 | 500 chars | OK. |
| DEFENSE-VIEW-REASON-LEN | Per-reason text | §39 | 280 chars | OK. |
| DEFENSE-VIEW-RISK-LEN | Per-risk text + mitigation | §39 | 280 chars each | OK. |
| DEFENSE-VIEW-CFO-LEN | CFO summary | §39 | 4,000 chars | OK. |
| BUYER-REFERRAL-CREDIT-MAX | Per-referral credit cap | §39 | $2,000 | OK; per Buyer Referral entity. |
| WEBHOOK-PAYLOAD-MAX | Webhook payload | §31 + §34.16.7 transport-semantics block | ≤ 256 KB | OK; §34.20.9 AC #41. |
| API-PAGINATION-DEFAULT | Cursor pagination default | §32 | 50 | OK. |
| API-PAGINATION-MAX | Cursor pagination max | §32 | 250 | OK. |

---

## O. Performance Budgets (§44.1)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| PERF-FCP | First Contentful Paint | §44.1 | < 1s | — | OK. |
| PERF-TTI | Time to Interactive | §44.1 | < 2s | — | OK. |
| PERF-API-P95 | API response p95 (excluding Agent) | §44.1 | < 500ms | §44.5 AC; §42.1 cites §44.1; §42.2 alerting threshold | OK. |
| PERF-API-P99 | API response p99 | §44.1 | < 1s | §44.5 AC | OK. |
| PERF-RT-SUB | Real-time subscription latency (collaborative scoring; tighter target) | §44.1 (line 30953) | < 200ms | §44.5 AC | OK; tighter target than the general reactive SLO; scope is active-edit collaborative scoring deltas only. |
| PERF-REACTIVE-GENERAL | Convex reactive query commit-to-render SLO (general; broader scope than collaborative scoring) | **§7.5.3 (Master Spec line 9914) — §44.1 row pending per D-2.3-002** | p95 ≤ 500 ms / p99 ≤ 1 s of the commit timestamp | §3.12 (line 3289 unread badge); §7.5.2 line 9908 (mutation-layer rule); §10.5 line 10075 (Recovered Teams reactive push); §10.5 line 10181 (Queue list reactive push); §3.9 / §3.12 line 30318 (presence updates); §25.7 line 46207 (InternalCommentThread); §13.11 line 46482 (DefenseView); Appendix M line 46508 ("Convex Subscription / Reactivity Layer p95 ≤ 500 ms reactive SLO" surface-vs-engine row) | **DRIFT — D-2.3-002 (P1).** §7.5.3 explicitly attributes authority to §44.1 (line 9912: "the authoritative latency target lives in §44.1"); §44.1 row table currently authors only the < 200ms collaborative-scoring target (above) and does NOT carry the general reactive SLO row. Body sections cite "§44.1 reactivity SLO p95 ≤ 500 ms" against an absent §44.1 row. Remediation: add row to §44.1 distinct from the collaborative-scoring 200ms row. |
| PERF-SEARCH | Command Palette search latency | §44.1 | < 200ms | — | OK. |
| PERF-PDF | PDF Export 100 reqs | §44.1 | < 5s | — | OK. |
| PERF-WORKSPACE-LOAD | 1,000-req matrix load | §44.1 | < 2s | — | OK. |
| PERF-AGENT-PRESCORE-HAIKU | Pre-Score per req — Haiku | §44.1 / §44.2 | 5–10s | — | OK. |
| PERF-AGENT-PRESCORE-SONNET | Pre-Score per req — Sonnet | §44.1 / §44.2 | 10–30s | — | OK. |
| PERF-AGENT-PRESCORE-OPUS | Pre-Score per req — Opus | §44.2 | 30–60s | — | OK. |
| PERF-WORKSPACE-PRESCORE-BUDGET | Full-Workspace pre-score budget | §44.1 / §44.2 | count × 15s (avg) | — | OK; parallelization → ~2.5min/100reqs effective. |
| PERF-SELECTION-REPORT | Selection Report generation (Opus) | §44.1 | < 5 minutes | — | OK. |
| PERF-API-TIMEOUT | Server-side hard ceiling | §44.1 (Phase 12.5 R-03) | 30s | §44.5 AC ("see §44.1 authoritative table"); §42.1 (cite-only) | OK. |
| PERF-CONSOLE-BRIDGE | Cross-console eventual consistency | §44.1 (cite-only — auth is §25.2.1) | bounded p95 < 30s | §25.2.1 | OK. |
| PERF-EVALSTARTER-FREE | EvalStarter materializer Free p95 | §44.1 | < 2.5s | §13.12.4 step 3 | OK. |
| PERF-EVALSTARTER-PAID | EvalStarter materializer Solo/Starter+ p95 | §44.1 | < 4.5s | §13.12.4 | OK. |
| PERF-DEFENSE-VIEW-GEN | Defense View server-side cache miss p95 | §44.1 | < 8s | §13.11.5 | OK. |
| PERF-DEFENSE-VIEW-PDF | Defense View PDF export cached p95 | §44.1 | < 3s | §13.11.6 | OK. |
| PERF-SELLER-ACTIVATION-P50 | Seller Activation Metric p50 target | §44.1 | < 20 minutes from `stage_1_arrival_at` to `first_requirement_response_at` | §4.4.22; §35.2; §39; §48.1.6; §48.8.10; §49.1.10; Appendix K | OK; added 2026-06-22 by D-2.2-030 closure. C.135 remains source material; §44.1 is the numerical authority. |
| PERF-SELLER-ACTIVATION-P90 | Seller Activation Metric p90 target | §44.1 | < 60 minutes from `stage_1_arrival_at` to `first_requirement_response_at` | §4.4.22; §35.2; §39; §48.1.6; §48.8.10; §49.1.10; Appendix K | OK; added 2026-06-22 by D-2.2-030 closure. C.135 remains source material; §44.1 is the numerical authority. |
| PERF-SELLER-ONBOARDING-ARRIVAL-WRITE | SellerOnboardingSession magic-link arrival row-write latency | §44.1 | 200 ms | §4.4.22 AC #1 | OK; added 2026-06-22 by D-2.2-030 closure. |
| PERF-SELLER-STAGE3-LATENCY | Seller onboarding Stage-3 population-latency threshold | §44.1 | `stage_3_population_latency_ms` ≤ 10,000 ms per-session predicate and p90 ≤ 10,000 ms rolling 15-minute budget | §4.4.22; §35.2; §39; §48.1.5; §48.8.3; §48.8.10; §49.1.2; §49.1.3; Appendix G; Appendix K | OK; added 2026-06-22 by D-2.2-030 closure. Firecrawl-outage pause adjustment follows §48.8.3. |
| PERF-SELLER-STAGE3-PAGE-SLA | Seller onboarding Stage-3 latency breach page SLA | §44.1 | 60 seconds from breach detection | §4.4.22; §48.8.3; §49.1.2; Appendix K | OK; added 2026-06-22 by D-2.2-030 closure. |
| PERF-SELLER-STAKE-REVEAL-DWELL | Seller onboarding Stake-Reveal dwell target | §44.1 | `stage_5_dwell_seconds` ≥ 20 seconds for ≥ 70% of activated sellers; degradation below 65% raises §42 P3 | §4.4.22; §48.8.5; §49.1.6 | OK; added 2026-06-22 by D-2.2-030 closure. |
| PERF-SELLER-ONBOARDING-ACTIVE-SESSION-LOAD | Seller onboarding active-session operating-load assumption | §44.1 | 50,000+ concurrent `in_progress` SellerOnboardingSession rows | §4.4.22 index note | OK; added 2026-06-22 by D-2.2-030 closure. |
| PERF-LOAD-MONTHLY | Monthly load test target | §44.4 | 500 concurrent users; p95 < 1s | — | OK. |
| PERF-LOAD-SPIKE | Quarterly spike test | §44.4 | 2,500 users; p95 < 3s | — | OK. |

---

## P. Observability, SLA & DR (§42)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| SLA-UPTIME-ENTERPRISE | Enterprise uptime SLA | §42.1 | 99.9% (≤ 43 sec/month) | §34.1.1 / §34.1.2 cell **SLA**; §34.12.5; BPS v3 §7; SPS v3 §9 | OK; §42.1 cites §34.1 cell. |
| SLA-RESPONSE-CRITICAL | Enterprise critical-response SLA | §42.1 | 4 hours | §34.1 cell **SLA**; §34.12.5; BPS v3 §7; SPS v3 §9 | OK. |
| INC-SEV1 | SEV-1 incident response | §42.3 | < 15 minutes; updates every 30 min | §42.7 AC | OK. |
| INC-SEV2 | SEV-2 incident response | §42.3 | < 1 hour; updates every 60 min | — | OK. |
| INC-SEV3 | SEV-3 incident response | §42.3 | < 4 hours; daily updates | — | OK. |
| DR-RTO | Recovery Time Objective | §42.4 | 1 hour | — | OK. |
| DR-RPO | Recovery Point Objective | §42.4 | 1 hour | — | OK; aligned with hourly Convex snapshot cadence. |
| BACKUP-DAILY-RETENTION | Daily backup retention | §42.4 | 30 days | — | OK. |
| FAILOVER-DNS-TTL | DNS failover TTL | §42.4 | < 60 seconds | — | OK. |
| ABUSE-INITIAL-SLA | Marketplace abuse initial admin review | §42.3.1 | < 24 hours | §45.2 cited; §45.3 step 3 | OK; Phase 12.5 R-05 promotion. |
| ABUSE-APPEAL-WINDOW | Seller appeal window | §42.3.1 | 7 days | §45.3 step 4–5 | OK. |
| ABUSE-RE-REVIEW | Admin re-review on appeal | §42.3.1 | < 24 hours | §45.3 step 5 | OK. |
| ABUSE-PERSISTENT-ESCALATION | Persistent-violation escalation review | §42.3.1 | < 5 business days | §45.3 step 8 | OK. |
| LOGIN-LOCKOUT | Login throttling lockout | §33.6 (auth) | 15 minutes after 5 failed attempts | §45.2 cited from §33.6 (Phase 12.5 R-04) | OK. |
| ON-CALL-PAGE-TIMEOUT | Page-timeout escalation | §42.5 | 10 minutes → secondary | — | OK. |

---

## Q. DSAR / Privacy / Retention (§6.8, §40.2)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| DSAR-ACK | Subject-request acknowledgment SLA | §6.8.6 (Phase 12.5 R-01) | < 72 hours | GDPR Art. 12(3); CCPA §1798.130(a)(2) | OK. |
| DSAR-FULFILLMENT | Fulfillment SLA | §6.8.6 | < 30 calendar days | §6.8.1, §6.8.2, §6.8.3, §33.4, §40.2 row "GDPR deletion request" — all cite §6.8.6 (post-R-01); GDPR Art. 12(3) | OK; CI gate `dsar_sla_single_source_of_truth` blocks new inline duplications. |
| DSAR-EXTENSION | One-time extension | §6.8.6 | +60 calendar days max | §6.8.6 AC #1 | OK; must be `extension_reason` non-NULL. |
| DSAR-PARTIAL-FAILURE | Subject notification on partial failure | §6.8.6 + §6.8.4 | < 24 hours from `dsar.cascade.partial_failure` | — | OK. |
| DSAR-CASCADE-LONGTAIL | Long-tail cascade alert | §6.8.4 | ≥ 50,000 affected rows | — | OK; weekly progress reporting. |
| AUDIT-INTEGRITY-EXEMPT-RETENTION | Audit-integrity retained classes (1–4, 7–9, 14–15) | §6.8.5 | 7 years from row create | §40.2; §34.6.5; §34.6.6 | OK. |
| AUDIT-INTEGRITY-KB-EXPORT | KBExportLifecycleAudit retention | §6.8.5 row #5 | Plan-tier retention per §40.2 (NOT 7y exemption) | §40.2 | OK. |
| RET-WORKSPACE-SOFT | Soft-deleted workspace | §40.2 | 30 days, then permanent purge | — | OK. |
| RET-CANCELED-SUB | Canceled subscription | §40.2 | 90 days, then purge | §34.5.2 | OK. |
| RET-USAGE-EVENT-RAW | Usage Event raw rows | §40.2 | 24-month rolling | §51 references | OK. |
| RET-TIME-SAVED-RAW | Time-Saved Credit raw rows | §40.2 | 36 months | — | OK. |
| RET-OPS-JOB-RUNS | `ops_job_runs` rows | §40.2 + §42.6.1 | 365 days | — | OK. |
| RET-USAGE-OUTBOX | `usage_event_outbox` | §40.2 | 7 days past successful ack | — | OK. |
| RET-USAGE-DLQ | `usage_event_envelope_dlq` | §40.2 | 30 days | — | OK. |
| RET-DAILY-ROLLUPS | UsageDashboardSnapshot daily | §40.2 + §51.3.1 | 90 days | — | OK. |
| RET-MONTHLY-ROLLUPS | UsageDashboardSnapshot monthly | §40.2 + §51.3.1 | 24 months | — | OK. |
| RET-DEPROVISION-REASSIGN | Owned-entity reassignment SLA | §40.2 + §34.7.4 | 24 hours | §6.9 | OK. |
| RET-INVITE-PII | Buyer Referral / Pro Trial Seat identity fields DSAR redaction | §40.2 + §6.8.5 | Pseudonymize within 30 days | §6.8.5 retained-row table rows #11, #12 | OK. |
| RET-K-ANON-SIGNAL | k-anonymity three-tier floor (signal / aggregate / market intelligence) | **§48.4.7** (canonical three-tier table at Master Spec line 32318) | k=5 signal, k=10 aggregate, k=20 market intelligence | §27.9.5 (SellerSignal aggregation); §27.11.2 (PromotedListing k=5 surface); §22.8 (KB MCP); §51.x (instrumentation); §17.x (Time-Saved fairness); §48.3 / §48.4.7 (growth signals); §4.4.10 / §4.4.12 / §4.4.15 / §4.4.16 / §4.4.18 / §4.4.19 entity rules; SPS v3 §20 | **AUTH UPDATED 2026-05-03 per Phase 2.3 (D-2.3-003).** Prior auth_section "§3.5 / §34.16 / §3.5" referenced retired Master Summary §3.5 (Summary retired in v7.0.0 per CLAUDE.md §2). Canonical home in v7.1.0 is §48.4.7 ("k-Anonymity Floors") which authors the canonical three-tier table. §27.9.5 and §27.11.2 are downstream surface enforcement, not canonical declaration. Note: this row is structurally a privacy / signal-integrity invariant rather than a retention rule; future reorg may re-section. |

---

## R. KB Value Meter (§34.19)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| KB-VM-WIN-RATE-WEIGHT | KB Value Meter win-rate weight | §34.19.2 | 0.40 | §34.20.16 AC #77 | OK; AE on normalizations (line 28900). |
| KB-VM-RECENCY-WEIGHT | Recency weight | §34.19.2 | 0.25 | §34.20.16 AC #77 | OK. |
| KB-VM-CITATION-WEIGHT | Citation depth weight | §34.19.2 | 0.20 | §34.20.16 AC #77 | OK. |
| KB-VM-OUTCOME-WEIGHT | Outcome cite coverage weight | §34.19.2 | 0.15 | §34.20.16 AC #77 | OK. |
| KB-VM-WIN-WINDOW | Win-rate window | §34.19.2 | 90 days | — | OK. |
| KB-VM-RECENCY-DECAY | Recency decay denominator | §34.19.2 | 365 days | — | OK; AE. |
| KB-VM-CITATION-CAP | Citation depth normalization cap | §34.19.2 | divide by 10 (capped at 1.0) | — | OK; AE. |
| KB-VM-COMPUTE-CADENCE | Recompute cadence | §34.19.2 | nightly 03:30 UTC | §34.20.16 AC #78 | OK. |
| KB-VM-LATENCY-SLA | Post-plan-change recompute latency | §34.19.2 | ≤ 15 minutes | §34.20.16 AC #78 | OK. |

---

## S. Year-1 Plan Mix Targets (§34.18.3)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| YR1-BUYER-FREE | Buyer Free org-share target | §34.18.3 | 60% | §34.20.15 AC #74 | OK; AE per row note (revenue-weight is AE-derived). |
| YR1-BUYER-STARTER | Buyer Starter org-share | §34.18.3 | 15% | §34.20.15 AC #74 | OK. |
| YR1-BUYER-GROWTH | Buyer Growth org-share | §34.18.3 | 10% | — | OK. |
| YR1-BUYER-SCALE | Buyer Scale org-share | §34.18.3 | 10% | — | OK. |
| YR1-BUYER-ENT | Buyer Enterprise org-share | §34.18.3 | 5% (mix < 10% on either side triggers GTM diversification review) | §34.20.15 AC #74 | OK. |
| YR1-SELLER-FREE | Seller Free org-share | §34.18.3 | 55% | §34.20.15 AC #74 | OK. |
| YR1-SELLER-STARTER | Seller Starter org-share | §34.18.3 | 25% | — | OK. |
| YR1-SELLER-GROWTH | Seller Growth org-share | §34.18.3 | 15% | — | OK. |
| YR1-SELLER-SCALE | Seller Scale org-share | §34.18.3 | 5% | — | OK. |
| YR1-SELLER-ENT | Seller Enterprise org-share | §34.18.3 | < 1% | — | OK. |
| YR1-MIX-BUYER-V3-COMPANION | Buyer Pricing v3 companion year-1 mix narrative | §34.18.3 (Master Spec authoritative) | — | BPS v3 §13 row "Blended target mix" — restates **35% Solo subscription / 25% Solo per-eval / 20% Business Starter / 12% Business Growth / 6% Business Scale / 2% Enterprise** | **DRIFT — D-AS-004 (P1).** BPS v3 §13 publishes a **different** Year-1 mix (35/25/20/12/6/2 across Solo-sub / Solo-pereval / Starter / Growth / Scale / Enterprise) than Master Spec §34.18.3 (Buyer 60/15/10/10/5 across Free / Starter / Growth / Scale / Enterprise). These are non-comparable axes (Solo split out vs. Free-only top), and §34.18.3 omits Solo entirely. The two docs are formally inconsistent. |
| YR1-MIX-SELLER-V3-COMPANION | Seller Pricing v3 companion year-1 mix narrative | §34.18.3 (Master Spec authoritative) | — | SPS v3 §14 row "Target mix" — restates **25% Solo subscription / 25% Solo per-bid / 25% Starter / 15% Growth / 8% Scale / 2% Enterprise** | **DRIFT — D-AS-005 (P1).** SPS v3 §14 mix is 25/25/25/15/8/2 across Solo-sub / Solo-perbid / Starter / Growth / Scale / Enterprise; Master Spec §34.18.3 mix is Seller 55/25/15/5/<1 across Free / Starter / Growth / Scale / Enterprise. Same structural mismatch as D-AS-004 — Solo is not represented in §34.18.3. |
| YR1-REVENUE-MIX-AI | Revenue stream `rev_ai_wallet` share | §34.18.4 | 50–60% of total ARR | — | OK; AE. |
| YR1-REVENUE-MIX-SUB | `rev_subscription` share | §34.18.4 | 30–40% | — | OK; AE. |
| YR1-REVENUE-MIX-MARKET | `rev_marketplace_discovery` share | §34.18.4 | 5–15% | — | OK; AE. |

---

## T. Citation Hygiene & Doc Versioning

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| BPS-DOC-VERSION | Master Spec citation of BPS document version | §34 preamble (line 27214) | "(v2, 2026-04-13)" | BPS v3 actual = "v3, 2026-04-26" | **DRIFT — D-AS-006 (P3).** §34 preamble cites BPS as v2 dated 2026-04-13; current BPS is v3 dated 2026-04-26. The §34 inline citations to BPS sections (e.g., `BPS §5`, `BPS §6.1`) actually use v3 numbering and resolve correctly, but the doc-version label in the preamble is stale. |
| SPS-DOC-VERSION | Master Spec citation of SPS document version | §34 preamble (line 27214) | "(v2, 2026-04-14)" | SPS v3 actual = "v3, 2026-04-26" | **DRIFT — D-AS-006 (P3).** Same as BPS-DOC-VERSION; the preamble version label is stale. |
| CONVEX-INFRA-PCT | Convex infra cost as % of AI cost | BPS v3 §13 / SPS v3 §14 | "≈ 3% of AI cost" | Master Spec §34.3.1 references "5% infra overhead" in the cost-base derivation note (§34.14.1 preamble, line 28308) | **DRIFT — D-AS-011 (P2).** §34.14.1 says cost_base "= Anthropic inference cost at 2026-04-10 pricing plus 5% infra overhead (Convex, Firecrawl, vector-index amortization, egress)". BPS v3 §13 / SPS v3 §14 financial scenarios assume "Convex compute ≈ 3% of AI cost." The 5% infra-overhead figure (Master Spec §34.14.1) is the load applied to the cost_base; the 3% Convex figure (companion docs) is a sub-component used in margin scenario modeling. The two are not strictly contradictory but neither is single-sourced and neither is registered in §34.18 financial-targets section. Recommend explicit single-source row in §34.14.1 with a Convex-only cost-component breakdown for parity with companion-doc scenario assumptions. |

---

## U. Stripe Metering Constants (§34.10.5)

| singleton_id | description | auth_section | auth_value | ref_locations | notes |
|---|---|---|---|---|---|
| STRIPE-METER-SOLO-CENTS | Solo per-eval / per-bid value_amount_cents | §34.10.5 (Phase 14.9) | 19900 cents = $199 | §34.2.5; Appendix J `billing_event_charge_kind` (`solo_per_eval`, `solo_per_bid`) | OK. |
| STRIPE-METER-EVENTS | Solo Stripe meter events registered | §34.10.5 | 6 new in Phase 14.9: `sourcera_solo_buyer_per_eval_charge`, `sourcera_solo_seller_per_bid_charge`, `sourcera_solo_charge_refunded`, `sourcera_solo_subscription_started/renewed/canceled` | BPS v3 §14 migration table; SPS v3 §21 migration table | OK. |

---

## V. Plan-Tier Inline Restatements — Phase 14.9.1 Audit Backlog

The CLAUDE.md "Known Drift / Open Issues" §16 documents an open Phase 14.9.1 audit (~30 inline plan-tier-list locations) auditing each inline tier-list string against §34.1.1 / §34.1.2 cell values. This source-map records two confirmed drifts surfaced by adversarial review during this Phase-1 prompt; the remainder are deferred to that audit pass.

| singleton_id | description | auth_section | drift |
|---|---|---|---|
| INLINE-DRIFT-CONV-MOMENT-1-PRICE | §48.8.6 Conversion Moment #1 modal body inline-restates Seller Starter price | §34.2.2 | **D-AS-001 (P1)** — Inline says "$49 / month"; §34.2.2 says $149/mo (annual) / $179/mo (monthly). |
| INLINE-DRIFT-CONV-MOMENT-1-FEATURE | §48.8.6 Conversion Moment #1 modal body inline-claims Match Score numeric on Starter | §34.1.2 | **D-AS-012 (P1, plan_gating)** — Inline benefit list says "Starter Match Score numeric display"; §34.1.2 cell **Match Scoring (numeric)** says "Labels only" on Starter; numeric is Growth+. |
| INLINE-DRIFT-CONV-MOMENT-1-ANNUAL-RATIO | §48.8.6 Conversion Moment #1 annual-ratio claim cited from "Seller Pricing §3" | SPS v3 §3 | **D-AS-013 (P3)** — Inline claims "annual = 10 months' cost per Seller Pricing §3"; SPS v3 §3 publishes prices but does not explicitly state "annual = 10 months". The ratio is implicit in the numbers ($149/mo annual × 12 ≈ $179/mo monthly × 10) but the cited authoritative claim is absent from §3. |

---

## RL. Rate-Limit Classes (§32.4 + Distributed Per-Endpoint Classes; Appendix I 429-class Error Codes)

**Scope.** Every rate-limit class authored in `Sourcera_Master_Spec.md` v7.1.0, with the authoritative section, the literal threshold, the §32 universal vs. per-endpoint distinction, the Appendix I 429-class error code (where one is registered), and the referencing locations. Added 2026-04-29 to remediate Phase-0 defect `D-0V-001` (V0 prompt structural-check #3: "AUTHORITATIVE_SOURCE_MAP.md covers — at minimum — every rate limit class in §32 and Appendix I").

**Universal vs. specialized.** §32.4 declares the platform-wide authenticated burst, monthly, and concurrency ceilings, plus the unauthenticated public-pricing class. All other classes are per-endpoint specializations registered in §32.2 / §32 endpoint blocks, §22.8.4 Agent SDK tools, §27 Marketplace, §29 retry curves, §31.9 CRM Sync, §35.2 / §35.4 onboarding, §48.4.12 EOI constraints, §50 Ops Console, and §51 Analytics. Where the per-endpoint class overrides or composes with §32.4, the row notes the composition.

### RL.1 §32.4 Universal Classes

| singleton_id | description | auth_section | auth_value | ref_locations | error_code (Appendix I) | notes |
|---|---|---|---|---|---|---|
| RL-AUTH-BURST-SOFT | Authenticated per-Org soft burst limit | §32.4 (line 25097) | 5,000 requests / hour (warning header; request succeeds) | §32.2 (`X-RateLimit-Limit: 5000`, line 25048); §32.4 enforcement scope statement (line 25115 — per-organization, not per-API-key) | `rate_limit_exceeded` 429 (Appendix I line 41793; soft does NOT 429 — header warning only) | OK; soft-limit warning observable via response headers; quota shared across all API keys under same Org. |
| RL-AUTH-BURST-HARD | Authenticated per-Org hard burst limit | §32.4 (line 25098) | 10,000 requests / hour (HTTP 429) | §32.2; §3055 bulk-action handling | `rate_limit_exceeded` 429 (line 41793) | OK; standard `X-RateLimit-RetryAfter` header populated. |
| RL-AUTH-BURST-MINUTE | Authenticated per-Org per-minute burst ceiling | §32.4 (line 25099) | 100 requests / minute (cannot exceed) | §32.2 | `rate_limit_exceeded` 429 | OK; immediate 429 on overage. |
| RL-AUTH-CONCURRENT | Per-User concurrent in-flight cap | §32.4 (line 25113) | 10 concurrent / user; 11th queued; queue timeout 60 seconds | §3055 (bulk action wait) | (queue, not 429; 503 on queue timeout) | OK; per-user not per-Org. |
| RL-AUTH-MONTHLY-FREE | Plan-tier monthly API ceiling — Free | §32.4 row (line 25105) | 1,000 requests / month | §34.4 invariant cited (API not customer-billed; rate-limit only) | `api_calls_exceeded` 429 (line 41827) | OK; per-Org. Composes with RL-AUTH-BURST-* (whichever exhausts first 429s). |
| RL-AUTH-MONTHLY-STARTER | Plan-tier monthly API ceiling — Starter | §32.4 (line 25106) | 10,000 requests / month | API-RATE-STARTER row above (Section M, "60 req/min" is the API add-on minute-rate; this row is the monthly cap) | `api_calls_exceeded` 429 | OK. |
| RL-AUTH-MONTHLY-GROWTH | Plan-tier monthly API ceiling — Growth | §32.4 (line 25107) | 50,000 requests / month | API-RATE-GROWTH (Section M) | `api_calls_exceeded` 429 | OK. |
| RL-AUTH-MONTHLY-SCALE | Plan-tier monthly API ceiling — Scale | §32.4 (line 25108) | 250,000 requests / month | API-RATE-SCALE (Section M) | `api_calls_exceeded` 429 | OK. |
| RL-AUTH-MONTHLY-ENT | Plan-tier monthly API ceiling — Enterprise | §32.4 (line 25109) | Unlimited (subject to committed contract) | §34.1.1 cell footer | n/a | OK. |
| RL-AUTH-MONTHLY-POLICY-STARTER | Policy ingestion API monthly ceiling — Starter | §32.4 (line 25106) | 3,000 ingestions / month | §34.3.4 `policy_parsing` (wallet-charged on Free; absorbed into ceiling on Starter+) | `api_calls_exceeded` 429 (composes) | OK. |
| RL-AUTH-MONTHLY-POLICY-GROWTH | Policy ingestion API monthly ceiling — Growth | §32.4 (line 25107) | 10,000 ingestions / month | §34.3.4 | `api_calls_exceeded` 429 | OK. |
| RL-AUTH-MONTHLY-POLICY-SCALE | Policy ingestion API monthly ceiling — Scale | §32.4 (line 25108) | Unlimited (subject to wallet) | §34.3.4 | n/a | OK. |
| RL-PUBLIC-PRICING-IP-SOFT | `public_pricing_unauth` per-IP soft limit | §32.4 (line 25119) + §32.8.1 (line 25404) | 600 requests / hour / IP (warning header; request succeeds) | §32.2; §32.8.1 endpoint contract; §4.8.9 acceptance #4 (ETag/304 cache hit does NOT count) | n/a (soft warning only) | OK; class shares no counters with authenticated class. X-Forwarded-For honored via global edge cache. |
| RL-PUBLIC-PRICING-IP-HARD | `public_pricing_unauth` per-IP hard limit | §32.4 (line 25120) + §32.8.1 (line 25404) | 1,200 requests / hour / IP (HTTP 429) | §32.2 (`X-RateLimit-RetryAfter` populated) | `rate_limit_exceeded` 429 (composes; per-IP scope) | OK. |
| RL-PUBLIC-PRICING-IP-MINUTE | `public_pricing_unauth` per-IP per-minute burst | §32.4 (line 25121) + §32.8.1 | 60 requests / minute / IP | §32.2 | `rate_limit_exceeded` 429 | OK. |
| RL-PUBLIC-PRICING-EDGE-CACHE | `public_pricing_unauth` edge-cache TTL | §32.4 (line 25122) + §32.8.1 (line 25404) | 60-second public TTL keyed on `(version_label OR "current", If-None-Match)` | §4.8.9 acceptance #4 — `ETag = PricingTableVersion.published_payload_hash`; HTTP 304 cache-hit does NOT count toward per-IP limit | n/a | OK; cache-miss only counts against IP. |

### RL.2 Per-Endpoint Specialized Classes (§22, §25, §27, §29, §31.9, §32.8, §35, §50)

| singleton_id | description | auth_section | auth_value | ref_locations | error_code (Appendix I) | notes |
|---|---|---|---|---|---|---|
| RL-INTERNAL-COMMENT-READ | `internal_comment_api` reads | §25.7 (line 19628) | 120 requests / minute / session | — | `rate_limit_exceeded` 429 | OK; registered in §32 rate-limit-class registry per §25.7. |
| RL-INTERNAL-COMMENT-WRITE | `internal_comment_api` writes | §25.7 (line 19628) | 30 requests / minute / session | — | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-READ | `marketplace_read` | §27 (line 23330) | 300 requests / minute / Org | §27 line 23581 (acceptance criterion #31); QA test `marketplace_rate_limit_classes` | `rate_limit_exceeded` 429 (Retry-After populated) | OK. |
| RL-MARKETPLACE-WRITE | `marketplace_write` | §27 (line 23330) | 60 requests / minute / Org | §27 line 23581 | `rate_limit_exceeded` 429 | OK. |
| RL-OPS-MARKETPLACE-ADMIN | `ops_marketplace_admin` | §27 (line 23330) | 120 requests / minute / Ops-user | §27 line 23581 | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-MATCH-READ | `marketplace_match_score_read` | §27 (line 20865) | 600 requests / minute / Org | §27 line 20944 (acceptance #10) | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-MATCH-BATCH | `marketplace_match_score_batch` | §27 (line 20901) | 60 requests / minute / Org (batch up to 500 snapshots/call) | §27 line 20944 | `rate_limit_exceeded` 429 | OK; Scale+ plans only. |
| RL-MARKETPLACE-MATCH-AUDIT | `marketplace_match_score_audit_receipt` | §27 (line 20865) | 30 requests / hour / Org (verification path) | — | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-MATCH-FEEDBACK | `match_score_feedback` | §27 (line 20784) | 20 feedback rows / Org / 24h per (buyer, seller) console | §27 line 20840 (acceptance #2); brigading-resolution failure-mode | `match_score_feedback_rate_limit_exceeded` 429 (Appendix I — new) | OK; Retry-After populated. |
| RL-MARKETPLACE-TAXONOMY-PUBLIC | `marketplace_taxonomy_read` (public) | §27 (line 21353) | 1,200 requests / minute / IP | §27 line 21401 (acceptance #8) | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-TAXONOMY-AUTH | `marketplace_taxonomy_read` (authenticated) | §27 (line 21353) | 3,000 requests / minute / Org | §27 line 21401 | `rate_limit_exceeded` 429 | OK. |
| RL-MARKETPLACE-TAXONOMY-MIGRATION | Concurrent migration / bulk import wait | §27 (line 21325) | 30-second queue wait then HTTP 503 | — | `taxonomy_migration_in_progress` 503 (Appendix I — new) | OK; advisory lock keyed on `(consumer_kind, org_id)`. |
| RL-SELLER-SIGNALS-STANDARD | `seller_signals_standard` | §27.9 (line 22356) | 5,000 requests / hour burst; 60,000 / day | §27.9 endpoint table (line 22358) | `rate_limit_exceeded` 429 | OK. |
| RL-SELLER-SIGNAL-RT-CHANNEL | Real-time channel sustain rate | §27.9 (line 22279) | ≤ 200 / minute (above buffers into 5-min windowed digest) | §27.9 (line 22310 rate-limit block) | (no dedicated 429; buffered) | OK; Scale+ only; `real_time_channel_rate_limit_per_min`. |
| RL-SELLER-SIGNAL-DIRECT-INVITE | `seller_signal_direct_invite` | §27.9 (line 22410) | 10 active offers / 24h per Seller Org; 100 target Workspaces / 30d per Seller Org | §27.9.8 cohort/target rate limits | `seller_signal_direct_invite_rate_limit_exceeded` 429 (Appendix I, line 42137; Retry-After to earliest expiring token) | OK; QA test `direct_invite_rate_limits_enforced`. |
| RL-VENDOR-OPT-OUT-STANDARD | `vendor_opt_out_standard` | §27 vendor opt-out (line 22660) | 200 requests / hour burst; 5,000 / day | §27 endpoint table (line 22664); error table (line 22741) | `rate_limited` (`vendor_opt_out_standard` exceeded) 429 | OK. |
| RL-VENDOR-OPT-OUT-PROBE | Authority-attestation DNS-TXT re-probe | §27 (line 22976) | 6 / hour / Org (7th returns 429) | §27 acceptance #24; failure-mode #5 (line 22989) | `vendor_opt_out_authority_probe_rate_limited` 429 (Appendix I; new) | OK; QA test `vendor_opt_out_authority_probe_rate_limit`. |
| RL-CRM-SYNC-STANDARD | `crm_sync_standard` (CRUD) | §31.9 (line 24913) | 1,000 requests / hour burst | §31.9 endpoint table (line 24915) | `rate_limit_exceeded` 429 | OK. |
| RL-CRM-SYNC-READ-HEAVY | `crm_sync_read_heavy` (activity-log reads) | §31.9 (line 24913) | 5,000 requests / hour burst | §31.9 | `rate_limit_exceeded` 429 | OK. |
| RL-CRM-SYNC-PROVIDER | Provider-side rate-limit (CRM 429 propagation) | §31.9 (line 24618) | ≥ 5 consecutive `crm_provider_rate_limited` errors in 15 minutes triggers `paused_api_rate_limit` | line 24622 (resume rule); line 25008 (80% ceiling warning) | `crm_provider_rate_limited` 429 (Appendix I, line 42157; honors provider Retry-After) | OK; auto-resume via backoff timer or seller manual override. |
| RL-CRM-SYNC-CEILING-WARN | Per-Org ceiling 80% warning | §31.9 (line 25008) | 80% of provider per-Org rate ceiling in any rolling hour | (internal metric `crm_sync.api_rate_ceiling_warning_80`; not customer webhook by default — Enterprise opt-in) | n/a | OK; AE — internal observability metric. |
| RL-CRM-SANDBOX-LOWER | Sandbox connection lower-rate cap | §31.9 (line 24909) | Provider's sandbox-cap-protective lower rate | line 24909 ("activity volume to the sandbox is lower-rate-limited") | n/a | OK; sandbox-tagged in activity log. |
| RL-BULK-WRITE | `bulk_write` | §32.2 (line 20158) | 10 requests / minute, 100 / hour | — | `rate_limit_exceeded` 429 | OK. |
| RL-CONTEST-FILING | Contest filing per-Org per-minute ceiling | §32.8.7 (line 26009) | 5 contest filings / minute / Org (anti-abuse) | §32.8.7 endpoint contract | `contest_filing_rate_limit_exceeded` 429 (Appendix I, line 41924; new) | OK. |
| RL-KB-EXPORT | KB export-initiation rolling cap | §22.18.2 + Appendix I (line 42000) | 10 export initiations / 60-minute rolling window / Org | §17204 (Invariant P1 — abuse-scope rate limit permitted; revenue gate forbidden) | `kb_export_rate_limit_exceeded` 429 (Appendix I; Retry-After populated) | OK; no plan-gating — applies uniformly. |
| RL-SELLER-ORG-PAGE-ENRICH | SellerOrgPage re-enrichment cooldown | §35.4 (line 19952) + §26.7.2 | 1 re-enrichment / 7 calendar days / SellerOrgPage | §35.4 (acceptance #4, line 20472) | `seller_org_page_enrichment_rate_limited` 429 (Appendix I, line 42011; Retry-After until next allowed attempt) | OK; Ops may override via Ops Console. |
| RL-FIRECRAWL-PER-DOMAIN | Firecrawl per-target-domain crawl rate | §22.6 (line 19937) + §35.4 | 5 requests / second / target domain (Firecrawl provider-side) | §35.4 step 4; Firecrawl `robots.txt` respect | `firecrawl_rate_limited` (failure_category enum, line 41432) | OK; graceful degradation on robots.txt disallow. |
| RL-MARKETPLACE-SCRAPE-PAGES | Anti-scraping `/sellers/:slug`, `/software/:slug` | §27 (line 20012) + §42.7 WAF tier | 60 req/min sustain, burst 30, hard 120/min per IP | §27 acceptance #28 (line 20505); FCrDNS-confirmed search-engine bot exemption (acceptance #29, line 20506) | HTTP 429 with `Retry-After: 60` | OK; verified Googlebot/Bingbot/DuckDuckBot/Yandex/Baidu exempt; spoofed bots subject to standard limits. |
| RL-MARKETPLACE-SCRAPE-LIST | Anti-scraping `/sellers/`, `/software/` listing pages | §27 (line 20017) | 10 req/min sustain, burst 5, hard 30/min per IP | — | HTTP 429 | OK. |
| RL-MARKETPLACE-SCRAPE-SITEMAP | Anti-scraping sitemap | §27 (line 20018) | 30 req/hour per IP | — | HTTP 429 | OK. |
| RL-MARKETPLACE-SCRAPE-OG | Anti-scraping OG image | §27 (line 20019) | 120 req/min sustain, hard 240/min per IP | — | HTTP 429 | OK. |
| RL-CONVEX-PER-PAGE-ENTITY | Convex query layer per-page-entity QPS | §27 (line 20033) | 1,000 QPS / page entity (database overload protection) | — | n/a (origin-protective) | OK; CDN-purge stampede mitigation. |

### RL.3 Per-Tool Agent SDK Classes (§22.8.4)

| singleton_id | description | auth_section | auth_value | error_code | notes |
|---|---|---|---|---|---|
| RL-TOOL-KB-RETRIEVE | `kb_retrieve` per-tool rate | §22.8.4 (line 15388 + line 15936) | 60 rps / session | `rate_limit_exceeded` (structured w/ `retry_after_ms`) | OK. |
| RL-TOOL-KB-GET-ENTRY | `kb_get_entry` per-tool rate | §22.8.4 (line 15456) | 30 rps / session | `rate_limit_exceeded` | OK. |
| RL-TOOL-KB-DEDUPE | `kb_dedupe_check` per-tool rate | §22.8.4 (line 15500) | 30 rps / session | `rate_limit_exceeded` | OK. |
| RL-TOOL-CITE-VERIFY | `cite_verify` per-tool rate | §22.8.4 (line 15538 + line 15658) | 60 rps / session | `rate_limit_exceeded` | OK; matched to `kb_retrieve` because every retrieval implies one verify per cited excerpt. |
| RL-TOOL-DOC-LIBRARY | `document_library_find` per-tool rate | §22.8.4 (line 15579) | 10 rps / session | `rate_limit_exceeded` | OK. |
| RL-TOOL-DOC-ATTACH | `doc_attach` per-tool rate | §22.8.4 (line 15616) | 10 rps / session | `rate_limit_exceeded` | OK. |
| RL-TOOL-CAPABILITY-FIND | `capability_find` per-tool rate | §22.8.4 (line 15798) | 10 rps / session | `rate_limit_exceeded` | OK. |
| RL-TOOL-CAPABILITY-DECLARE | `capability_declare_draft` per-tool rate | §22.8.4 (line 15798) | 10 rps / session | `rate_limit_exceeded` | OK; matched to capability writes (human-review gated). |
| RL-TOOL-KB-ENTRY-DRAFT | `kb_entry_draft_create` per-tool rate | §22.8.4 (line 15907) | 10 rps / session | `rate_limit_exceeded` | OK. |
| RL-AGENT-RERANK-VOYAGE | Voyage re-rank API rate-limit fallback | §22.9.1 (line 16107) | Stage 7 — fallback to RRF-fused order on Voyage 429 | (Voyage-side; surfaces `retrieval_metadata.rerank_skipped=true`); PagerDuty alert if fallback rate > 1% over 15 min | OK. |
| RL-ANTHROPIC-MANAGED-AGENTS | Anthropic Managed Agents per-Sourcera-Org | §22.15.4 (line 16826) | Per Sourcera's Anthropic Organization (NOT per Sourcera customer Org) | (Anthropic-side; back-pressure in orchestrator queue per §22.15.4) | OK; queue back-pressure managed in §22.15.4. |
| RL-ANTHROPIC-CREATE-RPM | Anthropic create endpoint per-min cap | §22.15.4 (line 17038) | 60 / min create | — | OK; HTTP 429 → orchestrator back-pressure. |

### RL.4 Growth-Mechanic & Onboarding Classes (§35, §48)

| singleton_id | description | auth_section | auth_value | error_code | notes |
|---|---|---|---|---|---|
| RL-EOI-PER-SELLER-24H | EOI dispatch per-seller rolling-24h cap | §48.4.12 constraint #1 | rolling-24h limit (numerical value defined per category in §48.4.12) | `marketplace_eoi_per_seller_24h_rate_limit_exceeded` 429 (Appendix I, line 42273) | OK; emits `marketplace_eoi_rate_limit_fired` with `constraint_kind=per_seller_24h`; appeal_path = `ops_growth_admin_review`. |
| RL-EOI-PER-CATEGORY-7D | EOI dispatch per-category rolling-7d cap | §48.4.12 constraint #2 | rolling-7d limit | `marketplace_eoi_per_category_7d_rate_limit_exceeded` 429 (Appendix I, line 42274) | OK; error body names `category_id`, `next_eligible_dispatch_at`. |
| RL-EOI-PER-BUYER-30D | EOI dispatch per-buyer rolling-30d cap (anti-carpet-bomb) | §48.4.12 constraint #3 | rolling-30d limit | `marketplace_eoi_per_buyer_30d_rate_limit_exceeded` 429 (Appendix I, line 42275) | OK; prevents single-seller carpet-bombing of single-buyer. |
| RL-EOI-SIM-VELOCITY | SIM `seller_anomalous_velocity` outbound block | §48.4.12 constraint #5 | velocity_cool_down_hours window | `sim_seller_anomalous_velocity_triggered` 429 (Appendix I, line 42280) | OK; blocks EOI, capability declaration mutation, promoted listing activation. |
| RL-EOI-OVERRIDE | EOIRateLimitOverride row | §48.4.12 (line 6294) | Ops-issued narrow temporary override | (Ops-only path; logged) | OK. |
| RL-PRO-TRIAL-SAME-PAIR | Same buyer-vendor pair Pro Trial cap | §34.13.5 | 1 grant / 365 days / (buyer, vendor) pair | (composes with PRO-TRIAL-* enrolled in Section G) | OK; cross-reference Section G PRO-TRIAL-SAME-PAIR-RATE row (this is the same singleton; RL row mirrors for rate-limit-class registry). |
| RL-M1-INVITER | M1 invite create per-inviter | §48.5.1 | 10 invites / inviter / 24 hours | `m1_inviter_rate_limit_exceeded` 429 (Appendix I, line 42068) | OK; Retry-After populated. |
| RL-M1-PER-WORKSPACE | M1 invite per-Workspace ceiling | §48.5.1 (line 45586) | 25 / Workspace | (composes with RL-M1-INVITER) | OK; StakeholderInvite entity. |
| RL-M2-PASSWORD-BRUTE | M2 public render brute-force throttle | Appendix I (line 42086) | 5 failed attempts / IP / 10 min → 10-min block | `m2_password_brute_force_throttled` 429 | OK. |
| RL-M3-CERT-ENUM | M3 public verification anomaly throttle | Appendix I (line 42090) | > 10 requests / hour / IP post-anomaly | `m3_certificate_enumeration_throttled` 429 | OK. |
| RL-M5-VENDOR-INVITE-USER | M5 buyer-pull vendor-invite per-user cap | §48.5.5 (line 45600) | 20 / user / 30 days | (composes with RL-M5-VENDOR-INVITE-DOMAIN) | OK; BuyerPullVendorInvite entity. |
| RL-M5-VENDOR-INVITE-DOMAIN | M5 per-target-domain cap | §48.5.5 | 5 / target-domain / 30 days | — | OK; Summary C.63 cited. |
| RL-M8-RECOMPUTE | M8 Ops POST recompute | Appendix I (line 42107) | 10 / hour / Org | `m8_recompute_rate_limit_exceeded` 429 | OK. |
| RL-GROWTH-LOOP-L1 | Growth-loop L1 Target Account create | Appendix I (line 42054) | per-user / per-target-domain throttle | `growth_loop_l1_throttle_exhausted` 429 (Retry-After + `{throttle_kind, next_allowed_at}`) | OK. |
| RL-ABUSE-REPORT-USER | Abuse report — buyer/seller user | §27.6 / §4.5.7 (line 6862) | 20 reports / Org / rolling 24h | `abuse_report_rate_limited` 429 (Appendix I; new) | OK. |
| RL-ABUSE-REPORT-ANON | Abuse report — anonymous public | §27.6 / §4.5.7 (line 6862) | 5 reports / `reporter_ip_hash` / 24h | `abuse_report_rate_limited` 429 | OK. |
| RL-ABUSE-REPORT-AUTOMATED | Abuse report — automated signal | §27.6 / §4.5.7 (line 6862) | No limit (service-account auth required) | n/a | OK. |

### RL.5 Defense View, UI, and Ops Classes (§13.11, §3.12, §50)

| singleton_id | description | auth_section | auth_value | error_code | notes |
|---|---|---|---|---|---|
| RL-DEFENSE-VIEW-REGEN | Defense View regeneration throttle | §13.11.5 + §13.11.13 AC #17 | 1 regeneration / 5 minutes / Workspace | `regeneration_throttle` 429 (Appendix I, line 42404; carries `last_regenerated_at`, `retry_after_seconds`) | OK; CI gate `defense_view_regeneration_throttle_5min` (§M.5 line 46544) asserts. Failure-recovery retries exempt per §13.11.12 failure mode 1. |
| RL-UI-PRESENCE-WRITE | Client-side presence mutation throttle | §3.9 / §3.12 (line 41698) | 4 writes / second (client-throttled) | (client-side; not 429) | OK; PostHog event `ui_presence_session_throttled` records before/after rate. |
| RL-OPS-SESSION-CONCURRENCY | OpsSession per-Ops-user concurrent ceiling | §50.4.6 | 3 concurrent OpsSessions across all Orgs (default) | `ops_session_per_user_concurrency_exceeded` 429 (Appendix I, line 42334) | OK. |
| RL-OPS-SESSION-COOLDOWN | Customer revocation cooldown | §50.4.7 | ≥ 2 OpsSession revocations / 24 hours | `ops_session_customer_revocation_cooldown` 429 (Appendix I, line 42351) | OK; Ops-Admin approval required to override. |
| RL-OPS-RATE-OVERRIDE-DUR-PRICING | Ops rate-limit override max duration — pricing_admin | §50.3.2 | 24 hours | `ops_rate_limit_override_duration_exceeded` 422 (Appendix I, line 42345; not a 429) | OK; emits `ops_rate_limit_override_applied` audit event (line 41542). |
| RL-OPS-RATE-OVERRIDE-DUR-OPSADMIN | Ops rate-limit override max duration — ops_admin | §50.3.2 | 72 hours | `ops_rate_limit_override_duration_exceeded` 422 | OK. |
| RL-OPS-RATE-OVERRIDE-AUTHZ | Ops rate-limit override capability check | §50.3.2 | Restricted to `ops_admin` and `pricing_admin` (rate_limit_override_authority capability) | `ops_rate_limit_override_unauthorized` 403 (Appendix I, line 42344; not a 429 — privilege control) | OK. |
| RL-ANALYTICS-ENFORCEMENT | Meta-CI-gate: every §51 endpoint declares a class | §51 (line 44814) | Deploy-time CI gate `analytics_rate_limit_class_enforcement` asserts every §51 endpoint declares a rate-limit class enforced in API gateway | — | OK; CI gate name registered in §M.5. |

### RL.6 Cross-Reference to Existing Map Sections

The following rate-limit-adjacent rows were already enrolled in earlier sections; this row-map preserves them rather than duplicating:

| existing row | section | scope |
|---|---|---|
| `PRO-TRIAL-SAME-PAIR-RATE` | Section G | Same buyer-vendor pair 1/365d (mirrored at RL-PRO-TRIAL-SAME-PAIR for class registry parity). |
| `API-RATE-STARTER` / `API-RATE-GROWTH` / `API-RATE-SCALE` | Section M | Per-Org per-minute API add-on rates; compose with `RL-AUTH-MONTHLY-*` and `RL-AUTH-BURST-*`. |
| `PROMOTED-K-ANON-FLOOR` / `RET-K-ANON-SIGNAL` | Section K + Section R | k-anonymity floors; not rate-limit-class but throttling-adjacent. |

**Coverage statement.** This RL section enumerates 67 rate-limit-class rows (RL.1: 16; RL.2: 32; RL.3: 12; RL.4: 16; RL.5: 7; RL.6: 4 cross-references). Combined with the four pre-existing rate-limit rows in Sections G and M (PRO-TRIAL-SAME-PAIR-RATE, API-RATE-STARTER, API-RATE-GROWTH, API-RATE-SCALE), the total rate-limit coverage is 71 rows. Every Appendix I 429-class error code identified by `Grep` of `Sourcera_Master_Spec.md` resolves to at least one row above. No drifts surfaced during enumeration — every value in this RL section matches its authoritative section literal-for-literal. **D-0V-001 is hereby remediated.**

---

## W. Coverage Statement & Gaps Acknowledged

This map is comprehensive across the prompt-scoped sections (§34 end-to-end · §39 · §44 incl. §44.6 · §6.8 · §40.2 · §42.1 · §32.4 · Appendix I 429-class error codes · BPS v3 · SPS v3) and captures every identified numerical singleton, rate-limit class, and 13 confirmed drifts. Out-of-scope but surfaced for the next audit pass:
- ~~**§32.4 API rate-limits** — narrative cites BPS v3 §9 (Starter 60/min, Growth 300/min, Scale 1,200/min); §32.4 numerical authority not yet cross-checked in this pass.~~ **CLOSED 2026-04-29 (D-0V-001 remediation).** §32.4 universals and per-endpoint specialized classes enrolled in Section RL.
- **§32 cursor pagination defaults** — `default 50, max 250` cited at §34.20.9 AC #42; §32 authoritative confirmation pending.
- **Appendix C / Appendix G / Appendix I / Appendix J registration completeness** — coverage is asserted by deploy-time validators per §34.20.9 / §34.20.10; out of this prompt's scope.
- **§34.18.5 Free-to-paid conversion thresholds** (≥3% Buyer / ≥4% Seller within 90 days) — singleton with one home; no companion-doc restatement found.
- **§29.3 / Appendix F retry curves** — webhook retry curve is "1min → 5min → 30min → 2h → 12h" per §34.16.7 transport block; full Appendix F audit deferred.
- **Phase 14.9.1 30-location plan-tier-list audit** — backlog item per CLAUDE.md §16.

---

## X. Defects Filed (cross-reference DEFECT_LEDGER.md)

| defect_id | severity | one-line summary |
|---|---|---|
| D-AS-001 | P1 | §48.8.6 Conversion Moment #1 modal restates Seller Starter price as $49/mo; §34.2.2 = $149/mo annual / $179/mo monthly. |
| D-AS-002 | P1 | BPS v3 §7 and SPS v3 §9 inline restate Volume Discount bands instead of citing §34.2.4 (Authoring Convention #10 violation). |
| D-AS-003 | P3 | §34.3.3 cites BPS as "§2.4" in prose (line 27449) and "§2.6" in the table row (line 27471) for the 88% margin floor — two self-citations conflict. |
| D-AS-004 | P1 | BPS v3 §13 publishes a Year-1 plan mix (35/25/20/12/6/2 across Solo-sub/Solo-pereval/Starter/Growth/Scale/Ent) inconsistent with Master Spec §34.18.3 (60/15/10/10/5 across Free/Starter/Growth/Scale/Ent). |
| D-AS-005 | P1 | SPS v3 §14 publishes a Year-1 plan mix (25/25/25/15/8/2) inconsistent with Master Spec §34.18.3 Seller mix (55/25/15/5/<1). |
| D-AS-006 | P3 | §34 preamble cites BPS v2 (2026-04-13) and SPS v2 (2026-04-14); current docs are v3 (2026-04-26). |
| D-AS-007 | P2 | Appendix H stale Subscription Products table emits `sourcera-business` $499/mo + legacy metered SKUs `sourcera_api_calls` ($0.01/100), `sourcera_policy_ingestions` ($25/ingestion), `sourcera_storage_overage` ($0.10/GB) that contradict §34. STALE banner mitigates but per-row deprecation annotations absent. |
| D-AS-008 | P3 | Remediated 2026-06-22 by Phase 2.2 VerificationReviewRecord singleton pass: §44.1 now owns `Verification certified re-review cadence`; §34.16.2 no longer states an annual Certified recertification cadence; §39 cites the §44.1 source row. |
| D-AS-009 | P3 | §39 omits a `KB Entry → title` row even though a 200-char limit is cited inline at §22 line 14782. |
| D-AS-010 | P3 | §39 omits `GhostBidImport → parsed_qa_pairs ≤ 500 per import` row even though the 500-pair cap is cited inline at line 35389. |
| D-AS-011 | P2 | Master Spec §34.14.1 cost_base derivation says "5% infra overhead"; BPS v3 §13 / SPS v3 §14 financial scenarios use "Convex ≈ 3% of AI cost". Two docs use two different infra-overhead conventions; neither is single-sourced. |
| D-AS-012 | P1 | §48.8.6 Conversion Moment #1 modal body claims "Starter Match Score numeric display"; §34.1.2 cell **Match Scoring (numeric)** says "Labels only" on Starter (numeric is Growth+). plan_gating drift surfaced during numerical-singleton audit. |
| D-AS-013 | P3 | §48.8.6 cites "annual = 10 months' cost per Seller Pricing §3"; SPS v3 §3 does not explicitly state the 10-month rule. |
| D-2.3-001 | P1 | Master-Spec internal volume-discount band inline restatements at lines 8425 (§4.8.8 CommittedSpendContract Authoring Intent), 27723 (§34.2.3 #6 prose), 45834 (Appendix K Glossary). Authoring Convention #10 violation; companion to D-AS-002. Validator `volume_discount_band_single_source` unimplementable as written. |
| D-2.3-002 | P1 | §44.1 missing canonical row for general Convex reactive query commit-to-render SLO (p95 ≤ 500 ms / p99 ≤ 1 s). §7.5.3 attributes authority to §44.1; §44.1 carries only the < 200ms collaborative-scoring row. ≥10 body sections cite "§44.1 reactivity SLO p95 ≤ 500 ms" against the absent row. |
| D-2.3-003 | P3 | AUTHORITATIVE_SOURCE_MAP.md `RET-K-ANON-SIGNAL` auth_section was "§3.5 / §34.16 / §3.5" (referenced retired Master Summary §3.5). Updated 2026-05-03 to canonical §48.4.7 ("k-Anonymity Floors") which authors the canonical three-tier table. |
| D-2.3-004 | P3 | AUTHORITATIVE_SOURCE_MAP.md missing §32.8 manual top-up endpoint singletons: $10 lower bound, $10,000 upper bound, >3 top-ups/hour rate-limit. Distinct from auto-topup `WALLET-TOPUP-MIN` ($50). New rows enrolled 2026-05-03. |
| D-2.3-005 | P3 | Master Spec §4 entity Retention paragraphs at lines 4022 (Unread Marker), 4153 (Pro Trial Seat Grant), 4216 (Usage Event), 4260 (Time-Saved Credit) carry stale "New §40.2 row required" TODO markers — §40.2 already contains the corresponding rows (lines 30523, 30526–30527, 30528–30530, 30531–30533). Citation hygiene. |
