# Sourcera Decisions Status Report — v7.1.0 Reconciliation

**Date:** 2026-05-12
**Author:** Audit pass — Phase DEC (Senior Technical Product Strategist)
**Scope source:** `_integration/Decisions.md` lines 1–684
**Spec basis:** `Sourcera_Master_Spec.md` v7.1.0 (stamped 2026-04-28)
**Purpose:** Per-decision verdict on whether the Decisions.md recommendation has been implemented in the Master Spec, with recommended status transitions for Decisions Lead sign-off.

This report is **advisory**. Decisions.md is not edited by this pass; transitions are recommended for the Decisions Lead to apply once Sales-Ops / Engineering / Finance / Trust & Safety / Founder owners ratify.

---

## 1. Summary Table

| ID | Subject | Blocker Level | Recommendation | Spec Position | Verdict | Recommended Transition |
|---|---|---|---|---|---|---|
| E-1 | Currency unit convention | HARD | Integer cents; migrate Phase 1 | Phase 1 still in `Decimal(10,2)` USD; §44.4.5 references `*_usd_cents` (dual-convention drift) | **Not implemented** | Keep `open`; defect D-DEC-001 filed (P1) |
| E-2 | Plan tier field split | HARD | Option A — split into `buyer_plan_tier` + `seller_plan_tier` | §4.2.1 lines 3623–3626 implement Option A | **Implemented** | `open → closed` |
| E-3 | Dangling FK references | HARD | Author placeholder entity stubs | §4.3.20 Target Account, §4.3.21 Selection Report Draft, §4.3.22 Inbox Item Group authored as full entities; §4.6 Attachment present | **Implemented** | `open → closed` |
| E-4 | Event taxonomy whitelist gaps | HARD | Register 8 event names in Appendix G | All 8 event names referenced in Appendix C / Appendix G binding sites | **Implemented** | `open → closed` |
| E-5 | Missing Phase 1 indexes | HARD | 5 indexes + UsageEventDailyAggregate | 0 of 5 indexes present; no aggregate table | **Not implemented** | Keep `open`; defect D-DEC-002 filed (P1) |
| E-6 | `chain_correlation_id` on AIOperation | SOFT | Add nullable UUID field + sparse index | Referenced in §22.14.4 prose only; not on §4.8.1 entity table | **Not implemented** | Keep `open`; defect D-DEC-003 filed (P1) |
| E-7 | Seller-visible bid value | SOFT | Coarsened `deal_size_band` server-side | `bid_value_estimate_usd` raw value referenced at §22.9.6 line 17719; no band coarsening | **Not implemented** | Keep `open`; defect D-DEC-004 filed (P1) |
| E-8 | Anthropic MCP rate limit confirmation | SOFT | Launch 30/60; target 60/120 post-confirmation | Spec at 60/120 (line 18282); no confirmation status documented | **Partially implemented** | Keep `open`; defect D-DEC-009 filed (P2) |
| E-9 | KBSubstrateVersion formality | NON | Keep engineering-internal | No formal §22.3 entity authored — aligned with recommendation | **Aligned** | `open → closed` |
| E-10 | Phase 1.5 rework go/no-go | HARD | Option A — fix 6 hard blockers | Phase 1.5 executed per `_audit/PHASE1.5_FINDINGS.md`; K-V8 closure contested (linked to D-DEC-001) | **Implemented** | `open → closed`; K-V8 residual carried via D-DEC-001 |
| C-1 | Free+Free wallet pool collapse | HARD | Single $10 pool (sum) | Spec collapses to **$5** (single Free pool); AE flagged "Sales-Ops sign-off pending" | **Not implemented (divergent)** | Keep `open`; defect D-DEC-005 filed (P1; paired with C-2) |
| C-2 | Free+Paid wallet pool collapse | HARD | Single combined pool (sum) | Spec implements paid-side-only; AE flagged "Sales-Ops sign-off pending" | **Not implemented (divergent)** | Keep `open`; defect D-DEC-005 covers both C-1 and C-2 |
| C-3 | Pro Trial No-Refund rule | NON | Do NOT restore seat on `expired_unaccepted` (anti-probing) | §4.3.17 Failure Modes line 4352 — restores seat on `expired_unaccepted` | **Not implemented (divergent)** | Keep `open`; defect D-DEC-007 filed (P1) |
| C-4 | Ops Override on Pro Trial allocation | NON | Yes, with role gate + 90-day time-box + audit + 3× cap | Role gate + endpoint authored; 90-day clamp and 3× cap not explicit | **Partially implemented** | Move to `partially_closed` with defect D-DEC-006 (P2) tracking residual |
| C-5 | High-stakes Opus toggle | NON | Ship without toggle initially | §22.9.6 references toggle as `Open Item §22.16.6 — pending sign-off`; Sonnet default | **Implemented (aligned)** | `open → closed` |
| F-1 | Operational drift floor thresholds | NON | 7% auto-apply / 10% Finance / 25% block | Spec at 5/10/25; recommendation's 7% anti-noise floor not adopted | **Not implemented** | Keep `open`; defect D-DEC-010 filed (P2) |
| F-2 | Auto-topup ceiling configurability | NON | $500K default; Ops override to $2M | Hard $500K cap at DB constraint layer; no Ops-override path | **Not implemented** | Keep `open`; defect D-DEC-008 filed (P1) |
| T-1 | Injection scanner pattern library | NON | Starter patterns; 1% FPR; flag-not-reject | §22.16.7 flag-not-reject implemented; 1% FPR target not authored | **Partially implemented** | Move to `partially_closed` with defect D-DEC-011 (P2) tracking residual |
| D-S1 | Source-of-truth restoration (Option A) | (Phase 2.5) | Restore baseline + layer AE sub-tables | §34.14.1 / §34.14.1.b; §34.15.1 / §34.15.1.b; §34.17.1 / §34.17.1.b authored | **Implemented** | `open → closed` |
| D-O1 | Outcome Signals (MS §2.9) restoration | (Phase 2.5) | §34.15.1 baseline (12 rows) + §34.15.1.b AE (8 rows) | Authored verbatim; `outcome_contract_baseline_1to1` validator referenced | **Implemented** | `open → closed` |
| D-P1 | Pricing Engineering Requirements (MS §2.11) | (Phase 2.5) | §34.17.1 baseline (14 reqs) + §34.17.1.b AE (11 rows) | Authored verbatim; `pricing_engineering_coverage` validator referenced | **Implemented** | `open → closed` |
| D-PROMPT1 | AE sign-off discipline | (Phase 2.5) | AuthoredExtensionSignoff + signoff_gate + capability_not_signed_off HTTP 422 | All three artifacts authored | **Implemented** | `open → closed` |
| D-7.1-001 | Solo pricing model ($49 / $199 symmetric) | (v7.1.0) | Closed in Decisions.md preamble | §34.1.1 / §34.1.2 / §34.1.3 / §34.2.2 / §34.2.5 implement | **Implemented** | Already `closed`; verified |
| D-7.1-002 | Defense View scope (simple) | (v7.1.0) | Closed in Decisions.md preamble | §13.11 + Appendix L.7 + 5 error codes | **Implemented** | Already `closed`; verified |
| D-7.1-003 | Seller-side ship sequencing (full v1) | (v7.1.0) | Closed in Decisions.md preamble | §22.20 + §22.20.6 + §22.14.4 + Seller plan-tier matrix | **Implemented** | Already `closed`; verified |
| D-7.1-004 | Marketplace ship (full v1) | (v7.1.0) | Closed in Decisions.md preamble | §27 + §4.5.6 + §34.16 | **Implemented** | Already `closed`; verified |
| D-7.1-005 | Single ship, no v1/v2 phasing | (v7.1.0) | Closed in Decisions.md preamble | v7.1.0 single-commit stamp | **Implemented** | Already `closed`; verified |
| D-7.1-006 | Category framing — SEP retained | (v7.1.0) | Closed in Decisions.md preamble | Framing preserved in Master Spec §1 / CLAUDE.md | **Implemented** | Already `closed`; verified |
| D-7.1-007 | v7.0.0 vs v7.1.0 sequencing | (v7.1.0) | Closed in Decisions.md preamble | v7.0.0 stamped 2026-04-26; v7.1.0 phases executed thereafter | **Implemented** | Already `closed`; verified |

---

## 2. Recommended Status Transitions

The Decisions Lead should apply the following transitions to `_integration/Decisions.md`. All transitions are recommended; none are applied by this audit.

### 2a. Transitions `open → closed`

The following decisions have been implemented in the Master Spec and the recommendation is aligned with the implementation. Recommended for immediate closure.

- **E-2** — Plan tier field split. Implementation: §4.2.1. Phase 1V D-1V-001 + D-1V-002 confirmed.
- **E-3** — Dangling FK references. Implementation: §4.3.20 / §4.3.21 / §4.3.22 / §4.6 — all four references resolved to formal entities (exceeds recommended placeholder-stub level).
- **E-4** — Event taxonomy whitelist gaps. Implementation: all 8 event names registered.
- **E-9** — KBSubstrateVersion formality. Aligned by absence — recommendation was "keep engineering-internal"; spec carries no formal entity.
- **E-10** — Phase 1.5 rework go/no-go. Implementation: Phase 1.5 executed; 6 hard blockers closed (E-1 carved out as D-DEC-001 residual).
- **C-5** — High-stakes Opus toggle. Aligned — toggle authored as open item; Sonnet default.
- **D-S1** — Source-of-truth restoration (Option A). Baseline + AE sub-tables authored at §34.14.1.b / §34.15.1.b / §34.17.1.b.
- **D-O1** — Outcome Signals restoration. §34.15.1 12-row baseline + §34.15.1.b AE; validators present.
- **D-P1** — Pricing Engineering Requirements restoration. §34.17.1 14-row baseline + §34.17.1.b AE; coverage validator present.
- **D-PROMPT1** — AE sign-off discipline. AuthoredExtensionSignoff + capability_not_signed_off HTTP 422 + rate_card_ae_signoff_gate authored.

**Total: 10 transitions to `closed`.**

### 2b. Transitions `open → partially_closed`

The following decisions are partially implemented; residual gaps tracked via P2 defect.

- **C-4** — Ops Override on Pro Trial seats. Endpoint authored; 90-day clamp and 3× cap not yet enforced. Residual: D-DEC-006.
- **T-1** — Injection scanner. Flag-don't-reject implemented; 1% FPR target not authored. Residual: D-DEC-011.

**Total: 2 transitions to `partially_closed`.**

### 2c. Decisions to remain `open`

The following decisions remain open. Each has a P1 (or P2) defect filed in `_audit/DEFECT_LEDGER.md → Phase DEC` to track the spec-side remediation owed before the Decisions row can transition.

- **E-1** — Currency unit convention. P1 D-DEC-001.
- **E-5** — Missing Phase 1 indexes. P1 D-DEC-002.
- **E-6** — `chain_correlation_id`. P1 D-DEC-003.
- **E-7** — Seller-visible bid value coarsening. P1 D-DEC-004.
- **E-8** — Anthropic MCP rate limit confirmation. P2 D-DEC-009.
- **C-1** — Free+Free wallet pool collapse. P1 D-DEC-005 (paired with C-2).
- **C-2** — Free+Paid wallet pool collapse. P1 D-DEC-005 (paired with C-1).
- **C-3** — Pro Trial No-Refund rule. P1 D-DEC-007.
- **F-1** — Operational drift floor thresholds. P2 D-DEC-010.
- **F-2** — Auto-topup ceiling Ops override. P1 D-DEC-008.

**Total: 10 decisions remain `open`.**

### 2d. Already `closed` — verified by this audit (no action)

- **D-7.1-001 through D-7.1-007** — all seven v7.1.0 program decisions marked closed in the Decisions.md preamble; this audit verifies the spec implementation. No action.

---

## 3. Open-Decision Owner Routing

Per the Decisions.md ownership column, the residual open decisions route as follows:

| Owner | Open Decisions |
|---|---|
| **Engineering Lead** | E-1, E-5, E-6, E-7, E-8 |
| **Sales-Ops + Founder** | C-1, C-2, C-3 |
| **Sales-Ops** | (none remain; C-4 closed) |
| **Finance** | F-1, F-2 |
| **Trust & Safety** | T-1 (P2 residual) |
| **Engineering + Console Bridge owner** | E-7 (paired) |

**Recommendation.** The Decisions Lead should batch the 10 still-open decisions into the v7.1.1 stamp-gate Decisions-reconciliation pack and pair each open row with its corresponding `D-DEC-*` defect ID in the Decisions.md row body.

---

## 4. Cross-References

- **Scratch log:** `_audit/PHASE_DEC_FINDINGS.md` — full evidence-by-evidence walk + self-challenge + counterfactual passes.
- **Defect ledger:** `_audit/DEFECT_LEDGER.md → Phase DEC — Decisions Ledger Reconciliation (2026-05-12)` — 12 defect rows.
- **Coverage matrix:** `_audit/COVERAGE_MATRIX.md` — no new feature rows introduced; existing rows for §4.3.16 / §4.3.17 / §4.3.18 / §4.3.19 / §4.7.1 / §4.8.1 / §4.8.3 / §22.9.6 / §22.13.1 / §22.16.7 / §34.10.3 are covered by their respective Phase-N audits; D-DEC defects update the residual-gap column for those rows.
- **AE ledger:** `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — the C-1 / C-2 / C-3 AE rows for wallet pool collapse and Pro Trial expiry rule remain `pending`; ratification before v7.1.1 stamp per the release-gate policy. The D-DEC-005 and D-DEC-007 defect rows surface the recommendation/spec divergence that the Sales-Ops sign-off must resolve.
- **v7.1.1 stamp-gate inheritance.** The 10 still-open decisions + 12 D-DEC defects add to the v7.1.1 stamp-gate residual queue. CLAUDE.md §16 should be updated to enumerate the D-DEC defect cluster alongside the AE-V11 / AE-V12 inheritance sets.

---

## 5. Spec-Side Remediation Estimated Size (advisory)

If all 10 open decisions are remediated in a single Phase DEC-Remediation pass before v7.1.1 stamp:

- **D-DEC-001 currency migration** — ~40 lines field-rename in §4.3.16 / §4.3.17 / §4.3.19 + ~20 lines AC update + Appendix K Glossary tightening on "Loaded Hourly Rate". Migration script for existing data: ×100 on existing rows; field rename `*_usd → *_cents`; column type `Decimal → BigInt`.
- **D-DEC-002 indexes** — ~25 lines authored across §4.3.11 (1 GIN), §4.3.16 (1 case-insensitive), §4.3.17 (1 composite), §4.3.19 (1 partial) + ~50 lines for new `UsageEventDailyAggregate` entity definition (field table + indexes + retention + DSAR pattern).
- **D-DEC-003 `chain_correlation_id`** — ~5 lines field-table addition + ~5 lines sparse-index addition + 1 line AC.
- **D-DEC-004 `deal_size_band`** — ~20 lines: define enum in Appendix J; author server-side derivation rule in §22.9.6; add field to §4.7.1 Console Bridge `requirement_*` event payload CARRIED list with seller-visible projection; QA test `bridge_seller_visible_deal_size_band_no_raw_value_leak`.
- **D-DEC-005 wallet pool collapse** — Sales-Ops decision-only; if recommendation adopted: ~15 lines amending §34.10.3 collapse rule prose + AE ledger transition + downgrade-path AC.
- **D-DEC-006 Ops override 90-day clamp + 3× cap** — ~15 lines: AC #N on §50 / §38468 endpoint enforcing `expires_at - now ≤ 90 days` and `additional_seats ≤ 3 × plan_default`.
- **D-DEC-007 Pro Trial expiry no-refund** — Sales-Ops decision-only; if recommendation adopted: ~10 lines amending §4.3.17 Failure Modes line 4352 + Appendix L.6 state-machine table update.
- **D-DEC-008 auto-topup $2M override** — ~30 lines: new endpoint `PATCH /v1/ops/orgs/{org_id}/wallet/auto-topup-cap-override`; audit event `org.wallet_autotopup_cap_overridden`; Appendix I error code for >$2M attempts; §50 Ops Console UI.
- **D-DEC-009 MCP rate limit confirmation prose** — ~5 lines documentation_gap; SIM signal authoring; no spec mechanics change.
- **D-DEC-010 drift 7% floor** — ~5 lines: amend Appendix J `cost_base_recalc_drift_severity` enum + §29299–29302 rate-table rows.
- **D-DEC-011 injection scanner FPR target** — ~10 lines authored at §22.16.7 / §22.16.8: 1% FPR target, monthly review cadence, `kb_injection_scanner_fpr_dashboard` observability surface.

**Estimated total spec-side authoring:** ~200 lines across 11 sections + 1 new entity (`UsageEventDailyAggregate`). One working session at Master Spec authoring fidelity.

---

## 6. Audit Verdict

- **HALT not triggered** (zero P0 in Phase DEC). 8 P1 + 4 P2 = 12 defects route into the v7.1.1 stamp-gate Decisions-reconciliation pack.
- **No spec edits performed.** Decisions.md not edited.
- **Decisions Lead next steps.**
  1. Apply the 10 `open → closed` transitions in §2a above.
  2. Apply the 2 `open → partially_closed` transitions in §2b above with cross-link to D-DEC-006 / D-DEC-011.
  3. Route the 10 still-open decisions (§2c) to their respective owners with the paired D-DEC-* defect IDs.
  4. Pair the AE ledger ratification owners (Sales-Ops on C-1 / C-2 / C-3; Founder on C-1 / C-2; Engineering on E-1 / E-5 / E-6 / E-7 / E-8; Finance on F-1 / F-2; Trust & Safety on T-1) with the v7.1.1 stamp-gate inheritance set.
  5. Update CLAUDE.md §16 to enumerate the D-DEC defect cluster alongside the AE-V11 / AE-V12 inheritance sets.
