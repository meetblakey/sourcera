# Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation (2026-05-12)

**Scope.** Walk `_integration/Decisions.md` end-to-end; for every open decision row, confirm whether the spec has implemented the recommended resolution. Status-transition recommendations and P1 defect filings produced as outputs. Audit non-destructive: no edits to `Sourcera_Master_Spec.md` or `_integration/Decisions.md` performed in this pass; spec-side remediation deferred to Phase DEC-Remediation under the v7.1.1 stamp-gate inheritance set.

**Defect-ID mnemonic.** `D-DEC-NNN`.

**Sources walked in full.**
- `_integration/Decisions.md` lines 1–684 (E-1..E-10, C-1..C-5, F-1, F-2, T-1, D-S1, D-O1, D-P1, D-PROMPT1, D-7.1-001..D-7.1-007).
- `Sourcera_Master_Spec.md` v7.1.0 — sections §4.2.1, §4.3.11, §4.3.16, §4.3.17, §4.3.18, §4.3.19, §4.3.20–§4.3.22, §4.7.1, §4.8.1, §4.8.3, §4.8.6, §22.9.6, §22.13.1, §22.14.4, §22.16.7, §34.10.3, §34.13, §34.14.1, §34.15.1, §34.17.1, §44.4.5 — read end-to-end where the decision recommendation requires a position assertion.
- `Sourcera_Buyer_Pricing_Strategy.md` v3 §3, §11, §13.
- `Sourcera_Seller_Pricing_Strategy.md` v3 §3, §11.
- `_audit/DEFECT_LEDGER.md` (existing rows reviewed for non-duplication).

---

## 1. Decisions verified IMPLEMENTED → recommend status transition to `closed`

| Decision ID | Subject | Spec evidence | Verdict |
|---|---|---|---|
| E-2 | Plan tier field split (Option A) | Master Spec §4.2.1 lines 3623–3626 — `buyer_plan_tier` + `seller_plan_tier` enums per §34.1.3 split contract. Phase 1V D-1V-001 + D-1V-002 remediation 2026-04-29. Old `plan_tier` retired. §4.3.17 line 4297 carries `buyer_plan_tier_at_grant`; §5.11, §34.8 entitlement enforcement, §34.10 wallet rules all read the per-console fields. | Closed. Recommendation fully implemented. |
| E-3 | Dangling FK references — author placeholder entity stubs | §4.3.20 Target Account (lines 4456–4519), §4.3.21 Selection Report Draft (lines 4524–4571), §4.3.22 Inbox Item Group (lines 4580–4614) — all full entities (not stubs). §4.6 Attachment entity referenced by Internal Comment Post `attachment_ids`. The four dangling FKs are bound to real §4 entities. | Closed. Spec exceeds the recommendation (full entities vs stubs). |
| E-4 | Event taxonomy whitelist gaps | 8 event names recommended by E-4 each appear in spec/Appendix G binding sites: `internal_comment.thread.created` / `resolved`, `buyer_referral.credit_issued` / `_redeemed`, `pro_trial_seat.granted` / `_converted` / `_auto_downgraded`, `usage_event.dlq_threshold_crossed`. Examples: line 38433 `pro_trial_seat.granted` notification routing; line 38426 `m17.pro_trial_seat.expired_unaccepted`; line 44892 PostHog `m16_referral_created`. | Closed. Recommendation implemented. |
| E-9 | KBSubstrateVersion — keep engineering-internal | Recommendation explicitly was "Keep it engineering-internal. Document it in the engineering runbook." Master Spec §22 makes no §22.3 entity definition for the substrate-version record; references at §22.9.1 line 18838 and §22.4.5 line 17662 treat substrate-version as an engineering implementation detail. | Closed by alignment. The absence of a formal entity is the recommended state. |
| E-10 | Phase 1.5 rework go/no-go (Option A — fix 6 hard blockers) | Per `_audit/PHASE1.5_FINDINGS.md` and `RECONCILIATION.md → Phase 1.5 block`, the Phase 1.5 targeted rework executed. K-V1, K-V2, K-V3, K-V5, K-V8, K-V13 closure status tracked in the post-Phase-1.5 verification log. | Closed in spirit. Note: K-V8 (E-1 currency) closure status is contested — see D-DEC-001. |
| C-4 | Ops override on Pro Trial seat allocation | `ops_pricing_admin` role registered §6.4 / §50 / Appendix J `ops_role` (line 39831). Endpoint `POST /v1/ops/pro-trial-seats/{id}/override-quota` authored line 38468 with auth scope = `ops_pricing_admin`, request body `{additional_seats, expires_at, reason}`, fires `org.pro_trial_seat_quota_overridden` audit event. Time-box, audit, 3× cap guardrails partially present (90-day window not yet explicit; see D-DEC-006). | Substantially closed; one P2 ambiguity flagged (D-DEC-006). |
| C-5 | High-stakes Opus toggle — ship without | §22.9.6 line 17719 + line 17786 + §22.16.6 Open Item #8 (line 18790) — toggle authored as `Open Item §22.16.6 — pending sign-off`; default routing is `claude-sonnet-4-6`; Opus path is gated behind seller opt-in (currently not shippable). Aligns with the C-5 recommendation to ship Sonnet-only and add toggle after 90 days of production data. | Closed by alignment. |
| D-S1 | Source-of-truth restoration (Option A — restore + layer) | §34.14.1 baseline + §34.14.1.b AE sub-table; §34.15.1 baseline + §34.15.1.b AE sub-table; §34.17.1 baseline + §34.17.1.b AE sub-table. CI validators `outcome_contract_baseline_1to1` and `outcome_contract_ae_1to1` referenced at §34.15.6 AC. | Closed. Recommendation fully implemented. |
| D-O1 | Outcome Signals (MS §2.9 baseline) restoration | §34.15.1 "Outcome Contract Table (MS §2.9 Baseline — 12 Rows)" at line 30371; §34.15.1.b "Authored Extensions Beyond MS §2.9 Baseline" at line 30396 (≥ 8 AE rows authored). §34.15.6 AC #1/#2 enforce 1:1 mapping. | Closed. |
| D-P1 | Pricing Engineering Requirements (MS §2.11 baseline) restoration | §34.17.1 "MS §2.11 Baseline — 14 Requirements" at line 30641; §34.17.1.b "Authored Extensions Beyond MS §2.11 Baseline" at line 30662. §34.17.3 AC #2 enforces coverage; §34.17.3 AC #5 requires AE sign-off via `rate_card_ae_signoff_gate`. | Closed. |
| D-PROMPT1 | Authored Extension sign-off discipline | `AuthoredExtensionSignoff` entity ref at §4.8 / §34.14.1.b; `rate_card_ae_signoff_gate` validator referenced at §34.14.1.b / §34.15.6 / §34.17.3. New error code `capability_not_signed_off` at Appendix I line 45470 (HTTP 422). `rate_card_ae_signoff_bypass_dev_only` feature flag referenced. | Closed. |
| D-7.1-001 | Solo pricing model ($49/mo OR $199/eval-or-bid, symmetric) | §34.1.1 / §34.1.2 / §34.1.3 buyer_solo / seller_solo enum, §34.2.2 plan-row pricing, §34.2.5 per-eval/per-bid orchestration, §34.10.3 wallet pooling override. Phase 14.9 closure in `RECONCILIATION.md`. | Closed in Decisions.md preamble; verified in spec. |
| D-7.1-002 | Defense View scope (simple — talking points + evidence + CFO one-pager) | §13.11 Defense View; Appendix L.7 state machine; 5 error codes in Appendix I v7.1.0 sub-section. | Closed in Decisions.md; verified in spec. |
| D-7.1-003 | Seller-side ship sequencing (full v1, no deferral) | §22.20 Seller Maya, §22.20.6 Magic-Link Hero Moment Polish, §22.14.4 GhostBidImport, §34.1.2 Seller plan-tier matrix. All landed in v7.1.0. | Closed; verified. |
| D-7.1-004 | Marketplace ship (full v1, destination page included) | §27 Marketplace; §4.5.6 Read/Render Contract; SoftwarePage / SellerOrgPage rendered; §34.16 Marketplace Discovery Pricing. | Closed; verified. |
| D-7.1-005 | Single ship, no v1/v2 phasing | Master Spec v7.1.0 stamp single-commit; UX 2.1.0; Linear blueprint 2.1.0; Build strategy 1.1.0. | Closed; verified. |
| D-7.1-006 | Category framing — SEP retained, "Programmatic RFP Exchange" is marquee | Master Spec §1 / §27 framing preserved per CLAUDE.md preamble. | Closed; verified. |
| D-7.1-007 | v7.0.0 vs v7.1.0 sequencing | v7.0.0 stamp landed 2026-04-26; v7.1.0 Phase 14.x executed thereafter per `_integration/Integration_Prompts_v7.1.md`. | Closed; verified. |

**Total to be transitioned `open → closed`:** 17 decisions (E-2, E-3, E-4, E-9, E-10, C-4, C-5, D-S1, D-O1, D-P1, D-PROMPT1, D-7.1-001..007).

> Note: the seven D-7.1-NNN rows are explicitly labeled `closed 2026-04-26` in Decisions.md preamble already; this audit confirms the spec implementation. No state transition needed; included for completeness.

---

## 2. Decisions verified NOT IMPLEMENTED → file P1 defects

| Decision ID | Subject | Recommendation | Spec position | Defect ID |
|---|---|---|---|---|
| E-1 | Currency unit convention | Standardize on integer cents; migrate Phase 1 fields to `*_cents` BigInt | §4.3.16 `credit_value_usd Decimal(10,2)` (line 4238); §4.3.17 `ai_value_consumed_usd Decimal(10,2)` (line 4313); §4.3.19 `loaded_hourly_rate_usd Decimal(8,2)` (line 4424); §4.3.19 `value_saved_usd Decimal(10,2)` (line 4426). Downstream §44.4.5 line 43276 uses `time_saved_usd_cents` + `loaded_hourly_rate_usd_cents` — the cross-document divergence E-1 warned about. | D-DEC-001 |
| E-5 | Missing Phase 1 indexes (5 items + UsageEventDailyAggregate) | (a) GIN on §4.3.11 `subscribed_user_ids[]`; (b) `(LOWER(referee_email), status)` on §4.3.16; (c) `(buyer_org_id, vendor_org_id, created_at DESC)` on §4.3.17; (d) `UsageEventDailyAggregate(org_id, capability_id, date, event_count, total_value_cents)` aggregate table; (e) partial index `(org_id, recognized_at) WHERE reversed_by_credit_id IS NULL` on §4.3.19 | (a) §4.3.11 lines 4036–4041 — no GIN index; (b) §4.3.16 lines 4264–4269 — `referee_email_domain` indexed but not `referee_email`; (c) §4.3.17 lines 4328–4334 — `(vendor_org_id, created_at DESC)` only, no buyer-vendor composite; (d) `UsageEventDailyAggregate` grep returns zero hits; (e) §4.3.19 lines 4436–4442 — plain `(org_id, recognized_at DESC)` index, no partial WHERE clause despite §4.3.19 aggregation rule at line 4452 explicitly filtering on `reversed_by_credit_id IS NULL` | D-DEC-002 |
| E-6 | `chain_correlation_id` on AIOperation | Add `chain_correlation_id UUID NULL` to §4.8.1 field table + sparse index | Grep returns 1 hit at §22.14.4 line 18412 prose ("preserved across sessions via `chain_correlation_id`"). §4.8.1 field table (lines 8157–8204) does NOT carry the field. The §22.14.4 narrative references a field that the §4.8.1 entity does not declare. | D-DEC-003 |
| E-7 | Seller-visible projection of bid value (coarsened `deal_size_band`) | Compute `deal_size_band ∈ {standard, midmarket, enterprise, strategic}` server-side; carry across §4.7.1 Console Bridge; never expose raw `estimated_total_value_usd` to seller | Grep `deal_size_band` returns zero hits across Master Spec. §22.9.6 line 17719 routes `first_pass_high_stakes` on `bid_value_estimate_usd ≥ $250,000` — i.e., the raw USD figure is referenced on the seller-side classifier. §4.7.1 Field-Level Redaction Rules (lines 7898–7913) `requirement_created` / `requirement_amended` CARRIED list does NOT carry value; but `response_submitted` and prep events read from buyer-side workspace fields. The firewall posture E-7 was designed to enforce is not implemented. | D-DEC-004 |
| C-1 | Free+Free wallet pool collapse — single $10 pool (sum) | The Decisions.md recommendation is explicit: "Collapse to a single $10 pool" | §34.10.3 / §16.126 / §29.918 / §30.180 — spec collapses to **$5** (single Free pool), not $10. Phase 1V flagged AE; SPS §11 narrative inconclusive. Sales-Ops sign-off pending per §30.982. | D-DEC-005 |
| C-2 | Free+Paid wallet pool collapse — sum (e.g., $305) | "Collapse to a single $305 pool" | §34.10.3 line 29856: "the Free side's $5 budget is **collapsed** (not added) to avoid the Free-side budget effectively topping up the paid side. The pooled budget equals the paid side's budget only." Spec position is paid-side-only ($300), opposite of recommendation ($305). AE flag with Sales-Ops sign-off pending. | D-DEC-005 (paired) |
| C-3 | Pro Trial No-Refund rule — do NOT restore seat on `expired_unaccepted` | Per the C-3 recommendation table, `expired_unaccepted` should NOT restore the pool seat (anti-probing rule) | §4.3.17 Failure Modes line 4352: "Vendor never signs up (30-day invite TTL). `status = expired_unaccepted`, `outcome = never_provisioned`; pool seat **is** restored to the buyer's cycle balance (the grant never activated). Authored extension." Spec position is opposite of recommendation. Anti-probing concern unresolved. | D-DEC-007 |
| F-2 | Auto-topup ceiling configurability ($500K default; configurable per-Org to $2M) | "Allow `ops_finance_admin` to override per-Org with an audit event. The override should have a maximum of $2M/month (200,000,000 cents) — beyond that, the customer needs a manual billing arrangement." | §4.8.3 `auto_topup_max_monthly_value_dollars` field (line 8402) constraint: `≥ 5000; ≤ 50000000 (max $500K/mo absolute ceiling)`. The hard cap at $500K is encoded as a database-layer constraint with no Ops-override path to $2M; no audit event for the override exists. | D-DEC-008 |

**Total P1 defects from non-implementation:** 8 (D-DEC-001 through D-DEC-008; D-DEC-005 covers C-1 + C-2 as a paired billing-pool defect).

---

## 3. Decisions partially implemented → file P2 defects

| Decision ID | Subject | Spec position | Gap |
|---|---|---|---|
| E-8 | MCP rate limits — 30/60 launch, 60/120 target with Anthropic confirmation | §22.13.1 line 18282 — already at "60 rps per Org, burst 120" without documented Anthropic confirmation; per-tool rates at §22.8.4 are 60 rps (`kb_retrieve`), 30 rps (`kb_get_entry`, `kb_dedupe_check`), 10 rps (write tools). | The conservative-launch-then-confirm posture recommended by E-8 is not documented in §22.13.1. No "Initial deployment targets ... subject to Anthropic per-MCP-server quota confirmation" prose; no `mcp_rate_limit_confirmation_pending` SIM signal or runbook. → D-DEC-009 (P2 documentation_gap). |
| F-1 | Drift floor thresholds — 7% auto-apply / 10% / 25% (anti-noise) | §4.8.6 line 8645 — `drift_severity` enum `normal` (≤5%), `warning_5_10` (5–10%), `alert_10_25` (10–25%), `critical_gt_25` (>25%). | Spec retains the 5/10/25 cut points; recommendation's 7% anti-noise floor not adopted. Alert fatigue risk that F-1 warned about is unaddressed. → D-DEC-010 (P2 numerical_singleton). |
| T-1 | Injection scanner — 1% FPR target; flag-don't-reject | §22.16.7 line 18776 — "scanned for injection patterns ... and flagged for Seller Team Lead review before going live". Flag-don't-reject is implemented. | The 1% false-positive-rate target is not authored in §22.16.7 / §22.16.8 / §22.16.9. Monthly review cadence not authored. No `kb_injection_scanner_fpr_dashboard` observability surface. → D-DEC-011 (P2 documentation_gap). |
| C-4 | Ops override on Pro Trial seats — 90-day time-box | §50 / §38468 — endpoint authored with `additional_seats`, `expires_at`, `reason`. | The 90-day maximum window is not explicitly enforced at the endpoint; spec accepts `expires_at` as a free-form timestamp without a 90-day clamp. 3× cap (vs plan default) not enforced. → D-DEC-006 (P2 acceptance_criteria gap). |

**Total P2 defects:** 4 (D-DEC-006, D-DEC-009, D-DEC-010, D-DEC-011).

---

## 4. Defect Roll-Up

| Severity | Count | IDs |
|---|---|---|
| P0 | 0 | — |
| P1 | 8 | D-DEC-001 (currency), D-DEC-002 (indexes), D-DEC-003 (`chain_correlation_id`), D-DEC-004 (`deal_size_band`), D-DEC-005 (wallet pool collapse C-1 + C-2), D-DEC-007 (Pro Trial expiry no-refund), D-DEC-008 (auto-topup $2M override). |
| P2 | 4 | D-DEC-006 (Ops override guardrails), D-DEC-009 (MCP rate-limit launch posture), D-DEC-010 (drift 7% floor), D-DEC-011 (injection scanner FPR target). |
| P3 | 0 | — |
| **Total** | **12** | — |

---

## 5. Halt-Rule Evaluation

- Zero P0 firewall-leakage / DSAR / billing-revenue-leakage defects in this pass — but D-DEC-004 (`deal_size_band`) borders P0 (raw `bid_value_estimate_usd` on seller-side classifier is plausibly readable across the firewall if §22.9.6 routing context is non-firewall-bounded; held at P1 because the §22.9.6 classifier runs on the seller-side AIOperation handler whose inputs are nominally bridge-projected; if the bridge-projected payload is later determined to carry the raw value, this re-classifies to P0).
- D-DEC-005 (wallet pool collapse) borders P0 under Severity Definition (d) "leaves a billing surface ... ambiguous in a way that allows revenue leakage" — held at P1 because both spec position ($5 / paid-only) and recommendation position ($10 / sum) are billing-coherent; the genuine ambiguity is the recommendation/spec divergence with pending Sales-Ops sign-off, which is a process defect, not a math defect.

**Verdict.** HALT not triggered. 8 P1 + 4 P2 = 12 defects route into the v7.1.1 stamp-gate Decisions-reconciliation pack.

---

## 6. Self-Challenge Pass

Re-read 12 findings as a hostile reviewer:

- **D-DEC-001 currency.** Could a reviewer argue Phase 1 entities and §4.8 billing entities operate as independent stacks with conversion only at the §44.4.5 cross-section? Answer: no — the §4.8.3 AIWallet draws on Buyer Referral credit redemption (§4.3.16) and Time-Saved Credit aggregates (§4.3.19) for downstream billing UI; the cross-stack conversion happens in business-logic code, not at a clearly authored boundary. The convention `loaded_hourly_rate_usd_cents` in §44.4.5 contradicts §4.3.19 `loaded_hourly_rate_usd Decimal(8,2)`, with no inline rewrite at §44.4.5 saying "Phase 1 stores dollars; multiply by 100 before passing to this aggregation". The defect holds.
- **D-DEC-002 indexes.** Could a reviewer argue indexes are implementation detail not authored in spec? Answer: spec convention §4 explicitly requires indexes in entity definitions (e.g., §4.8.1 AIOperation indexes listed at line 8205). The same convention requires E-5's indexes. The defect holds.
- **D-DEC-003 `chain_correlation_id`.** Could a reviewer argue §22.14.4 prose is sufficient and the field is implicit? Answer: §22.14.4 names the field but does not author it in the entity; an engineer reading §4.8.1 in isolation cannot find the field; this is the exact convention-violation pattern Master Spec §4 governs. The defect holds.
- **D-DEC-004 `deal_size_band`.** Could a reviewer argue `bid_value_estimate_usd` is on the seller-side workspace (the seller's own bid estimate), not buyer-side? Answer: §22.9.6 line 17719 says "parent bid workspace's `bid_value_estimate_usd`" — the field's authoring origin needs clarification (buyer-input vs seller-input vs system-estimated). Where the value originates is the firewall-relevance question. The spec is ambiguous on this point — which itself is a defect class. Held at P1; flagged for Phase 14.6 (Marketplace) audit cross-check.
- **D-DEC-005 wallet pool collapse C-1 + C-2.** Could a reviewer argue the spec position supersedes the Decisions.md recommendation by adoption-in-practice? Answer: the spec position is authored explicitly but flagged "Sales-Ops sign-off pending" (line 30982); the AE has not ratified. Until ratified, the spec position is an Authored Extension, not a closed decision. The defect holds.
- **D-DEC-006 Ops override guardrails.** Could the 90-day max be enforced by Ops-side process rather than endpoint validation? Answer: yes — but the C-4 recommendation specifically says "Auto-reverts to plan default at expiry" which implies server-side enforcement. The defect holds at P2.
- **D-DEC-007 Pro Trial `expired_unaccepted`.** Could a reviewer argue the original §4.3.17 (restore) position is correct and Decisions.md is the stale recommendation? Answer: arguable. The C-3 recommendation explicitly diverged from §4.3.17 with an anti-probing rationale; the divergence is recorded; until Sales-Ops resolves, the recommendation/spec mismatch is an open decision. The defect holds.
- **D-DEC-008 auto-topup $2M override.** Could a reviewer argue the $500K hard cap is the right default and the $2M override is a future enterprise feature? Answer: Decisions.md says default $500K is correct; override path is the gap. The spec encodes the cap as a database-layer constraint with no Ops-override mechanism. The defect holds.

No defects withdrawn post self-challenge.

---

## 7. Counterfactual Pass

For each P1 defect, three realistic failure modes the spec must handle:

**D-DEC-001 currency.**
1. Time-Saved Credit aggregation pipeline reads `value_saved_usd` (dollars) into a §34.10 wallet draw mechanism that expects cents → 100× under-draw (revenue leakage). Unhandled in spec.
2. Buyer Referral credit (`credit_value_usd`) feeds a Stripe Credit Note creation that expects integer cents → either 100× under-credit (customer harm) or compile error if type-checking is strict. Unhandled.
3. Time-Saved Credit `loaded_hourly_rate_usd` is mutated by an admin in dollars; the immutability test at §51.6 (`m8_curve_monotonicity_violation`) breaks because the historic `loaded_hourly_rate_usd_cents` snapshots at §44.4.5 are integer values. Unhandled cross-unit comparison.

**D-DEC-002 indexes.**
1. A buyer Org with 500 Internal Comment Threads, all subscribed by a busy reviewer: "show me my threads" page does sequential scan; loads in 8+ seconds at p95. Unhandled.
2. Referee Exclusivity Rule race: two `activated → credit_issued` mutations for `referee_email = "alice@example.com"` arrive within 50ms; without a unique index, both pass the application-layer check, double-credit issued. Unhandled.
3. Pro Trial Seat 365-day rate limit query: a buyer Org granting trial seats to 200 vendors triggers 200 separate `(vendor_org_id, created_at)` index scans; the buyer+vendor composite would collapse to a single index seek. Performance degrades linearly with vendor count. Unhandled.

**D-DEC-003 `chain_correlation_id`.**
1. Support engineer asks "why did this GhostBidImport cost $X?"; without the field, Support correlates by `(org_id, capability_id, created_at)` window, mis-attributing a parallel import. Unhandled.
2. Finance Ops attempts cost-center attribution across the three sessions; without the chain field, the parent operation is the customer-facing total but the children are billed separately, no roll-up exists. Unhandled.
3. Customer files a contest (§4.8.5) on the import: which AIOperations are eligible? Without the chain field, the ContestRecord can only reference one operation at a time; the customer must file 3 contests. Unhandled.

**D-DEC-004 `deal_size_band`.**
1. A buyer-side `bid_value_estimate_usd = $5,000,000` is rendered to the seller-side high-stakes classifier as `≥ $250,000`. The seller observes the threshold-trip via the AIOperation cost (5× Opus vs Sonnet); negotiation leverage inferred. Unhandled at firewall layer.
2. The `compliance_critical` tag at §22.9.6 (b) is also exposed; a determined seller correlates compliance tag + Opus routing + buyer org metadata to back-out the deal value distribution. Unhandled.
3. A whistleblower seller publishes "we observed [Buyer Org]'s deals were $X based on AI tier routing" — the firewall breach is forensic. The §7.2 console firewall design intent is violated post-hoc. Unhandled.

**D-DEC-005 wallet pool collapse.**
1. A Solo-buyer + Free-seller Org tests both surfaces; gets $0 customer-visible wallet on each (per spec's $5-collapsed-into-Solo-engine envelope rule); user confusion → support ticket. Unhandled UX message.
2. Sales-Ops Q4-priority customer activates Free Buyer + Free Seller demo; gets $5 unified pool; tests Pro Trial Seat flow (Scale-only). Customer expects $10 per Decisions.md recommendation. Marketing collateral may mismatch. Unhandled.
3. Recommendation/spec ratification post v7.1.1 stamp: if Sales-Ops chooses recommendation ($10), spec needs migration; if Sales-Ops chooses spec ($5), Decisions.md needs amendment + AE ledger close. Either way, the v7.1.1 stamp-gate ratification queue carries this. Tracked via D-DEC-005 status.

**D-DEC-007 Pro Trial expiry.**
1. A spray-and-pray buyer (Scale plan, 5 seats / month) grants seats to 15 vendors, 10 ignore. With spec rule (restore), buyer's pool returns to (5 - 5 active grants) = 0 → 5 after 30 days. Sales-Ops sees pool refill pattern characteristic of abuse. Unhandled detector.
2. Vendor receives invite, ignores, signs up 35 days later via a different inviter; the original grant is `expired_unaccepted` with seat restored; the second grant succeeds normally. Vendor lifetime grant count is now 2 even though the first never activated. Tracking ambiguity.
3. Recommendation post-ratification: changing the rule from "restore" to "consume" requires a §4.3.17 amendment, a state-machine update at Appendix L.6, and a Stripe Meter event audit. Unhandled migration path.

**D-DEC-008 auto-topup $2M override.**
1. Enterprise customer ($1M annual commit) running massive multi-vendor eval: needs $200K in single month; hits $500K cap silently → `hard_capped_auto_topup_monthly_cap` state (Phase 7 V7 D-V7-002 remediation already authored). Customer needs Ops to raise cap, but no endpoint exists. Unhandled.
2. Ops admin needs to raise cap mid-month: must edit the database directly per current spec; no audit event. Compliance defect (SOC-2 audit trail required for billing surface mutations).
3. Recommendation post-ratification: adding the $2M Ops override path requires (a) endpoint authoring `PATCH /v1/ops/orgs/{org_id}/wallet/auto-topup-cap-override`, (b) audit event `org.wallet_autotopup_cap_overridden`, (c) Appendix I error code for over-$2M attempts, (d) §50 Ops Console UI. Significant authoring scope; should be sized in v7.1.1 stamp-gate planning.

All counterfactual failure modes for the 8 P1 defects are surfaced and routed. No additional defects required.

---

## 8. Outputs

- **`_audit/DECISIONS_STATUS_REPORT.md`** — per-decision verdict + recommended status transitions.
- **`_audit/DEFECT_LEDGER.md → Phase DEC block`** — 12 defect rows appended (this same session).
- **No edits to `_integration/Decisions.md` performed** (audit non-destructive). Status transitions recommended; Decisions Lead applies post-audit.
- **No edits to `Sourcera_Master_Spec.md` performed.** Spec-side remediation routes to Phase DEC-Remediation under v7.1.1 stamp-gate inheritance.
