# Phase 7 / Prompt V7 — Pricing, Billing & AIOperation Adversarial Verification

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Prompt V7 is the adversarial verification of Phase 7 per `Audit_Prompts.md` lines 1893–1912.

**Audit posture.** Non-destructive. Phases 34.1 (PT), CONS, EM, MD, 34.19, and 34.PXC walked the §34 surface; V7 confirms structural completeness, runs the three adversarial scenarios specified by the prompt, files net-new defects, and renders a sign-off determination against the prompt's halt rule: zero P0 in pricing/billing.

**Defect-id mnemonic for this prompt.** `D-V7-NNN`. Sequential within this verification sweep.

---

## 1. Structural Completeness — §34 + §44 Audited

### 1.1 §34 sub-section coverage map

`PHASE34.1_FINDINGS.md` (D-PT-NNN), `PHASE_CONS_FINDINGS.md` (D-CONS-NNN), `PHASE34.8_FINDINGS.md` (D-EM-NNN), `PHASE34.16_FINDINGS.md` (D-MD-NNN), `PHASE34.19_FINDINGS.md` (D-34.19-NNN), and `PHASE34.PXC_FINDINGS.md` (D-PXC-NNN) collectively walked the §34 surface end-to-end. Subsection-level coverage:

| §34 subsection | Sub-prompt | Coverage |
|---|---|---|
| §34.1 Plan Tier Definitions | PHASE34.1 | Full walk; cell-by-cell reconciliation against BPS v3 / SPS v3. |
| §34.2.1 / §34.2.2 / §34.2.5 Pricing & Solo Per-Charge | PHASE34.1, PHASE34.PXC | Full walk; FX-lock-time gap surfaced (D-PT-005). |
| §34.2.3 Universal Commercial Rules | PHASE34.PXC | Walked; D-PXC-017 14-day Business Starter trial narrative drift filed. |
| §34.2.4 Volume Discount Bands | PHASE34.PXC, PHASE34.1 | Walked; bands reconciled cleanly with BPS / SPS. |
| §34.3 Outcome-Based AI Operation Pricing | PHASE_CONS | Full walk; **two P0s filed (D-CONS-001 publish-gating ambiguity; D-CONS-002 settlement-freeze contradiction)**. |
| §34.4 No Per-Unit Metering on Structural Resources | n/a (referenced) | Sampled-only (referenced from §34.10 / §34.6 walks; no dedicated sub-prompt). **See §1.3 Caveats.** |
| §34.5 Plan Upgrade / Downgrade | PHASE34.19 | Full walk. |
| §34.6 Downgrade Excess Data Handling | PHASE34.19 | Full walk; phantom-field defect filed (D-34.19-018). |
| §34.7 Billing Seat Count | n/a (referenced) | Sampled-only via §34.12.4 cross-walk. **See §1.3 Caveats.** |
| §34.8 Entitlement Enforcement | PHASE34.8 / PHASE_EM | Full walk including §34.8.5 Entitlement Matrix. |
| §34.9 Onboarding and Trial Carry-Over | n/a (referenced) | Sampled-only via §34.13 / §34.5 cross-walks. **See §1.3 Caveats.** |
| §34.10 AI Wallet Service | PHASE_CONS | Full walk including §34.10.3 Solo-co-resident rule, §34.10.4 state machine, §34.10.5 Stripe Metering. |
| §34.11 Outcome Resolver | PHASE_CONS | Full walk including §34.11.2 Contest Window. |
| §34.12 Cross-Side Billing Rules | PHASE_CONS, PHASE34.1 | Walked at §34.12.5 / §34.12.6 / §34.12.7 level via §34.10.3 cross-walks. **Partial coverage.** |
| §34.13 Buyer-Funded Pro Trial Seat (M17) | n/a (referenced) | Sampled-only. **See §1.3 Caveats.** |
| §34.14 Seller Rate Card | PHASE34.PXC | Full walk; 5 plan-gating drifts filed (D-PXC-003 .. D-PXC-007). |
| §34.15 Seller Outcome Signals | PHASE34.PXC | Full walk; bibliographic-only drift (D-PXC-008). |
| §34.16 Marketplace Discovery Pricing | PHASE34.16 / PHASE_MD | Full walk; 20 D-MD-NNN defects filed (0 P0). |
| §34.17 Pricing Engineering Requirements | PHASE34.PXC | Full walk; retired-MS-citation defects (D-PXC-013, D-PXC-014, D-PXC-018). |
| §34.18 Financial Targets | PHASE34.PXC | Full walk; Solo-omission scorecard defect (D-PXC-015). |
| §34.19 Seller Plan Upgrade Carry-Over Guarantee | PHASE34.19 | Full walk; 18 D-34.19-NNN defects filed including the protected-asset firewall phantom field (D-34.19-018) and Solo-transition omission (D-34.19-010). |
| §34.20 Acceptance Criteria | PHASE34.19, PHASE_CONS | Walked transitively. |

**Aggregate Phase 7 defect count (pre-V7):**

| Sub-prompt | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| PHASE34.1 (D-PT) | 0 | 6 | 4 | 2 | 12 |
| PHASE_CONS (D-CONS) | 2 | 11 | 6 | 0 | 19 |
| PHASE_EM / PHASE34.8 (D-EM) | 0 | ~12 | ~6 | ~3 | ~21 |
| PHASE_MD / PHASE34.16 (D-MD) | 0 | ~10 | ~7 | ~3 | ~20 |
| PHASE34.19 (D-34.19) | 0 | ~13 | ~4 | ~1 | ~18 |
| PHASE34.PXC (D-PXC) | 0 | 10 | 6 | 4 | 20 |
| **Subtotal** | **2** | **62** | **33** | **13** | **110** |

(The `~` figures reflect defect counts inferred from sub-prompt sign-offs in DEFECT_LEDGER.md; precise counts are in the corresponding `PHASE34.X_FINDINGS.md` files.)

V7 will append net-new defects discovered during adversarial verification.

### 1.2 §44 sub-section coverage map

`Audit_Prompts.md` Prompt V7 CHECK 1 binds the verification to "every §34 subsection AND §44 audited." The §44 sub-section walk is formally scoped to Phase 10 (`Audit_Prompts.md` §10 Performance & Solo-Tier Treatment); Phase 7 sub-prompts walked §44.6 only as a cross-reference target from §34.10.3 / §34.6 / §34.19. For V7 sign-off purposes, §44.1–§44.5 (platform performance budgets) and the bulk of §44.6 (Solo-Tier Surface Treatment) are **sampled-only**.

| §44 sub-section | V7 disposition |
|---|---|
| §44.1 Performance Targets | Sampled-only via §22.20.5 (Maya p95 budgets) and §13.11.5 (Defense View p95) cross-references. |
| §44.2 Agent Performance Budgets | Sampled-only via §44.2 statement that "Per-tier AI included-budget ceilings are authoritative in §34.1 / §34.10" — confirmed in PHASE34.1 / PHASE_CONS. |
| §44.3 Optimization Strategies | Not walked; out of pricing/billing scope. |
| §44.4 Load Testing | Not walked; out of pricing/billing scope. |
| §44.5 Acceptance Criteria | Not walked; out of pricing/billing scope. |
| §44.6 Solo-Tier Surface Treatment | Walked at §44.6.1 (Surface Hide List) / §44.6.3 (Margin Envelope Defaults) / §44.6.4 (Throttling) / §44.6.5 (Telemetry) / §44.6.7 (Edge Cases) levels via PHASE_CONS D-CONS-010 (Solo envelope counter entity) and D-CONS-018 (Solo per-charge contest mechanics). §44.6.2 Single-Card Billing Surface and §44.6.6 Public Pricing API on Solo are sampled-only. §44.6.8 Acceptance Criteria not walked end-to-end. |

V7 surfaces this as a structural-coverage caveat (§5 Sign-Off — Caveats); it mirrors the V6 precedent on §25.7 Internal Comments. **The caveat does not affect the V7 halt-rule evaluation** (which is bound to the P0 pricing/billing inventory, not to §44 walk-completeness).

### 1.3 Structural-coverage verdict

Phase 7 sub-prompts walked every §34 subsection that materially carries pricing/billing/AIOperation contracts (§34.1, §34.2.5, §34.3, §34.5, §34.6, §34.8, §34.10, §34.11, §34.14, §34.15, §34.16, §34.17, §34.18, §34.19). Five §34 subsections are sampled-only: §34.4 (No Per-Unit Metering rule), §34.7 (Billing Seat Count), §34.9 (Onboarding/Trial Carry-Over), §34.12 (Cross-Side Billing Rules — partial), §34.13 (Buyer-Funded Pro Trial Seat M17). §44 is sampled-only. Structural coverage is sufficient for V7 sign-off on the pricing/billing halt rule but leaves a known v7.1.1 stamp-gate inheritor: a dedicated Phase 7.7 walk of §34.4 / §34.7 / §34.9 / §34.12 / §34.13 + the Phase 10 §44 walk should close before v7.1.1 stamps.

---

## 2. Adversarial Check 1 — Worst-Case AIOperation Scenario

**Prompt construction.** "Nightly recalc spikes cost_base 12%; auto-topup hits monthly cap; user contests 30 ops simultaneously. Confirm spec resolves deterministically."

### 2.1 Scenario timeline

`T0 = 2026-05-04T00:00:00Z`. Buyer-Console Org `ACME` is on Business Growth ($300 included AI budget, wallet overage enabled with $5,000 cap, auto-topup enabled with $500 increment / $5,000 monthly cap). Active workflow: 200 active AIOperations / week across `pre_scoring`, `policy_parsing`, and `deep_comparison`.

| Time | Event | Spec contract triggered |
|---|---|---|
| `T0 + 02:30:00Z` | CostBaseRecalculationLog cron (§34.3.3 cadence) | §34.3.3 row + §4.8.6 AC #1 |
| `T0 + 02:30:30Z` | Recalc detects 12% cost_base spike on `policy_parsing` (Anthropic price increase + low-volume sample) | §34.3.3 drift bands |
| `T0 + 02:30:31Z` | Recalc must decide: auto-publish or block-pending-Ops-approval | **D-CONS-001 (P0; open) — publish-gating threshold contradiction** |
| `T0 + 09:00:00Z` | Operator burns through $300 included budget on heavy `policy_parsing` runs; wallet enters `soft_warned_80` then `soft_warned_100` | §34.10.4 |
| `T0 + 09:00:01Z` | Auto-topup fires: $500 increment hits the $5,000 monthly cap (4 prior top-ups in May totaling $4,500) | §34.10.2 monthly cap row + §4.8.3.A top-up state machine |
| `T0 + 09:00:02Z` | Operator invokes 31st `policy_parsing` op of the day; included exhausted, overage exhausted, auto-topup blocked at monthly cap | §34.10.4 wallet-state semantics |
| `T0 + 09:30:00Z` | Operator (acting as `billing_admin`) files contests on 30 settled `accepted` AIOperations from the prior week (alleging quality regression linked to the Anthropic price spike) | §34.11.2 contest filing |

### 2.2 Determinism analysis — Cost-base 12% drift

Per §34.3.3 row "Per-capability drift threshold (auto-publish block) ≥ 25% OR margin-floor breach", a 12% drift falls into the `medium` band (≥ 10%, alerts Finance) — so the recalc auto-publishes and a Finance alert fires.

Per §4.8.6 AC #2 (referenced by D-CONS-001): "high or critical require approval" — engineer building the gate cannot determine whether `medium` (10% ≤ drift < 25%) requires approval or not. **The 12% drift sits squarely in the contradicted band.** A cost-spike audit in production at exactly 12% drift produces non-deterministic behavior:

- **Reading A (§34.3.3 row authority):** Recalc auto-publishes; new `cost_base_cents` lands; new `value_price_cents = MAX(min, cost_base × 10)` is published in the next `PricingTableVersion`. The 30-day breaking-change notice gate (§4.8.9 AC #3) fires; published value_price's `effective_at` is `T0 + 30 days`. During the 30-day window, ops bill at the OLD value_price against the NEW cost_base.
- **Reading B (§4.8.6 AC #2 authority):** Recalc blocks pending Ops Finance approval; Finance reviews; on approval, the same 30-day publish path applies, but the start time is delayed by approval latency.

**The two readings diverge on cost-base availability for the next 24h of operations.** Under Reading A, the new cost_base is live in `CapabilityRegistryEntry.cost_base_cents` at `T0 + 02:30:31Z`. Under Reading B, the OLD cost_base persists until Ops approval (potentially days later). The §34.20.2 AC #7 ("88% blended-margin floor MUST be enforced at price-update time") cannot be enforced consistently when the "price-update time" is itself ambiguous.

**This is exactly D-CONS-001 (P0; open).** V7 confirms the defect is reproducible in the worst-case scenario and is not a paper bug. **Halt-rule fails on this scenario.**

### 2.3 Determinism analysis — Stranded margin-floor breach window

Independent of the D-CONS-001 ambiguity: the 30-day breaking-change notice gate (§34.3.3 row + §4.8.9 AC #3) introduces a window during which the **new cost_base is operationally live but the old value_price still applies**. For a 12% cost spike:

- Old `value_price_cents = old_cost_base × 10 = $0.50` (per §34.3.4 illustrative `pre_scoring`).
- New `cost_base_cents = old_cost_base × 1.12`. Under Reading A, the new cost is live in `effective_charge_cents = cost_price = MAX(min, cost_base × 1.05)` for `rejected` ops, AND in the customer-billed value-price for `accepted` ops via the multiplier — but the multiplier is locked on AIOperation creation per §4.8.4 AC #2 (Resolver uses the OutcomeContract version active at AIOperation `created_at`).
- For 30 days, ops created during the notice window settle at the OLD value_price against the NEW cost_base. **Blended margin compresses.**
- Per §34.20.2 AC #7 + §34.3.1 line 28864, "a cost-base recalc that would drop blended margin below the 88% margin floor … triggers `cost_base_recalc.margin_floor_breach` and does not auto-publish."

**The spec's margin-floor enforcement is at recalc-publish time, NOT at notice-window-close time.** A 12% cost spike that does NOT immediately breach the 88% floor (because margin started at e.g. 91%) but WOULD breach the floor over the 30-day notice window (compounding) is silent in the spec. The recalc publishes; the notice fires; the customer bills at the OLD value_price for 30 days; margin breaches the 88% floor; spec offers no remedy short of pulling the published price (which the 30-day notice contract effectively forbids for annual contracts grandfathered per §34.5.1).

**Net.** This is a stranded-margin-breach window — a real billing-margin defect that a 12% drift specifically exposes. **D-V7-001 (P1) — see §6 below.**

### 2.4 Determinism analysis — Auto-topup monthly cap exhaustion

§34.10.2 declares `auto_topup_max_monthly` with range $50–$500,000 (customer-set). §4.8.3.A top-up state machine handles individual top-up state but does NOT enumerate the aggregate-monthly-cap-exhausted state.

When the 5th May top-up at `T0 + 09:00:01Z` would push month-to-date top-ups from $4,500 to $5,000 — exactly hitting the cap — the top-up state machine succeeds (`exactly` = `cap reached, charge succeeds`). The 6th attempt later same day MUST fail. But:

- **State path 1:** `auto_topup_skipped_cap_exhausted` — engine emits an internal event, wallet remains in `soft_warned_100`, customer-billed AIOperations get HTTP 402 `wallet_hard_capped` per §34.10.4. No state transition.
- **State path 2:** Wallet transitions to `hard_capped_100` because the auto-topup safety net exhausted. This is consistent with §34.10.4 "if no auto-topup or auto-topup capped out: hard-cap" — which acknowledges the capped-out case but does NOT name the state.

§4.8.3 wallet state enum (`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed`) is silent on the auto-topup-monthly-cap-exhausted state. D-CONS-006 (P1) already filed the broader wallet-state-enum drift (`soft_capped_*` vs `soft_warned_*`); the auto-topup-monthly-cap edge case is **not** the same defect — it's a missing state, not a name drift. **D-V7-002 (P1) — see §6.**

D-CONS-013 (P1; existing) covers the daily/weekly cap fields not on the entity. V7 confirms the monthly-cap path is partially specified but not state-deterministic.

### 2.5 Determinism analysis — 30 simultaneous contests

Per §34.11.2: 14-day window from `settlement_at`; `billing_admin` files via Billing Ledger UI or API `POST /v1/billing/operations/:id/contest` (endpoint pending — D-CONS-011 P1; existing); routes to Ops Finance via `contest_review` queue; Ops decision SLA 5 business days; locked-state guard blocks DSAR redaction during open contest.

30 contests filed simultaneously by one `billing_admin` user produces:

1. **30 ContestRecord rows** (§4.8.5).
2. **30 contest_review queue items.**
3. **30 DSAR redaction blocks** (HTTP 423 `ai_operation_locked_for_contest` for any concurrent DSAR touching those ops).
4. **30 customer notifications** (`contest.filed`, `contest.in_review`, ...) — D-CONS-012 P1; existing covers the webhook authoring gap.
5. **30 × 5 = potentially up to 150 person-business-days of Ops Finance review queue depth** if SLAs don't compose.

The §34.11.2 spec is silent on:

- **Rate-limit on contest filing per (org_id, billing_admin_user_id, time_window).** A billing_admin with a script could file 1,000 contests in seconds. Spec offers no rate-limit. The §32.4 generic API rate-limit class is not bound to contest filing in §34.11.2.
- **Queue-depth back-pressure.** Does Ops Finance SLA scale with queue depth? §34.11.4 AC #4 says "Ops Finance MUST decide every contest within 5 business days" — no scaling rule. A 1,000-contest flood would produce 1,000 SLA breaches at d+6, each firing `contest.sla_breach` webhook + Ops alert (a notification flood).
- **Auto-filed contest cap.** §34.11.2 auto-files contests on late `rejected` signals after auto-accept. A capability with high `signal_evaluation_grace_seconds` and high op volume could auto-file dozens of contests overnight. Spec is silent on auto-file aggregate caps per Org / per capability / per period.
- **DSAR-vs-contest deadlock.** A DSAR submitted at `T0` that touches AIOperations in 30 simultaneous contests is blocked by 30 separate locked-state guards. §6.8 DSAR 30-day SLA conflicts with §34.11.2 contest 5-business-day SLA. If the contest closes on day 5 → DSAR resumes; cumulative latency 35 days, breaching §6.8.

**D-V7-003 (P1) — contest abuse / rate-limit / queue back-pressure / DSAR deadlock unspecified. See §6.**

### 2.6 Adversarial Check 1 — Verdict

The §34.3 + §34.10 + §34.11 system contains **two confirmed P0s (D-CONS-001, D-CONS-002; existing) plus three net-new P1s (D-V7-001 stranded margin-floor breach window; D-V7-002 auto-topup monthly cap exhaustion state; D-V7-003 contest abuse / rate-limit / DSAR deadlock).** The worst-case scenario does NOT resolve deterministically in the v7.1.0 spec. **Halt-rule fails.**

---

## 3. Adversarial Check 2 — Solo → Free Downgrade with KB > Free Ceiling

**Prompt construction.** "Solo → Free with KB > free ceiling. Confirm preservation rules + UX messaging."

### 3.1 Scenario construction

Seller-Console Org `VEND` is on Seller Solo (per §34.1.2; KB cap 250 entries; subscription mode at $49/mo). Over 4 months on Solo, VEND has built a 240-entry KB through `kb_bootstrap` + organic adds. On `T0 = 2026-05-04T00:00:00Z`, VEND issues a downgrade request via `billing_admin` to `seller_free` (KB cap 50 entries).

Per §34.5.2: downgrade effective at next billing cycle (`T0 + ~26 days`); 14-day pre-effective warning fires at `T0 + 12 days`; per §34.5.3 confirmation UI shows overage diff (190 KB entries over the new cap).

**Excess to handle:** 240 − 50 = 190 KB entries.

### 3.2 Contradiction analysis — §34.6.3 vs §34.19.6 #2

§34.6.1 + §34.6.3: at `preservation_until = downgrade_at + 90 days`, hard-archive cron picks up the bucket within 1 hour; entities hard-archived to cold storage; entities hard-deleted from hot storage; metadata preserved.

§34.19.6 #2: "Downgrade creates DowngradeExcessDataBucket that violates Protected Asset guarantees. Resolved: §34.19.1 takes precedence over §34.6 for the 13 asset classes listed; deploy-time validator `protected_asset_downgrade_firewall` asserts no asset in the 13-class list enters `preservation_status=hard_archived` in a DowngradeExcessDataBucket."

§34.19.1 row 1: "KB entries (all tiers) — 100% retained, read-write."

**Direct contradiction.** §34.6.3 mandates hard-archive at d+90; §34.19.6 #2 forbids hard-archive of Class-1 KB entries. The validator name in §34.19.6 #2 references a field/value (`preservation_status=hard_archived`) absent from §4.8.10 (D-34.19-018; existing P1). But the policy contradiction is independent of the schema phantom-field defect:

- **Reading A (§34.6.3 authority):** At `T0 + 116 days`, 190 KB entries hard-archive to cold storage. Customer must Ops-restore within 90 days post-archive (180 days total) or lose access. **Direct violation of §34.19.1 row 1's "100% retained, read-write" guarantee.** Even if "100% retained" is interpreted as preservation-only (not read-write at all times), cold-storage archive = no read-write capability for 90+ days.
- **Reading B (§34.19.6 #2 authority):** KB entries NEVER hard-archive. The bucket sits at `archived` indefinitely, consuming hot-storage. The 90-day cold-storage migration cron skips Class-1 rows. But §34.6.3 / §40.2 retention contracts assume hard-archive happens; revenue-storage cost projections assume hot-storage rolls off. **Operational and financial contracts both diverge.**

**Severity.** Per the V7 prompt halt rule "zero P0 in pricing/billing", a contradiction that affects data-preservation behavior on plan-downgrade is in pricing/billing scope. The defect is not a billing-leakage P0 per the §0 severity rule (a/b/c/d/e); it is a P1 acceptance_criteria / consistency_drift defect — junior engineer building the downgrade-bucket cron WILL hit this contradiction and cannot deterministically build it. **D-V7-009 (P1) — see §6.** Cross-link to D-34.19-006 (firewall vs acknowledgement path) and D-34.19-018 (phantom-field schema gap).

### 3.3 Solo-transition omission from §34.19.3 transition table

§34.19.3 transition table enumerates Free → Starter, Starter → Growth, Growth → Scale, Scale → Enterprise, Enterprise → Scale (downgrade), Scale → Growth (downgrade), Growth → Starter (downgrade), Starter → Free (downgrade). **No Solo-related rows.**

§34.10.3 Solo-co-resident rule items 5 + 6 cover Solo upgrade-to-Starter+ and Solo downgrade-to-Free at the wallet/envelope level. §44.6.7 #3 covers Solo downgrade-to-Free at the surface level. But §34.19.3 — the carry-over transition table — is silent on:

- Free → Solo (upgrade)
- Solo → Starter (upgrade)
- Solo → Growth, Solo → Scale, Solo → Enterprise (multi-step upgrade)
- Solo → Free (downgrade) **← scenario subject**
- Starter → Solo, Growth → Solo (sideways/downgrade-to-Solo)

D-34.19-010 (P1; existing) already filed the Solo-transition omission. V7 confirms the defect is reproducible on the scenario and cross-links to D-V7-004 (which extends D-34.19-010 with the per-eval mid-flight handling intersection — see §3.4 below).

### 3.4 Per-eval mid-flight evaluation handling

Solo on Buyer Console can operate in subscription mode ($49/mo) OR per-evaluation mode ($199 per Selection Report PDF export). For the Seller-side scenario above (`VEND` on Seller Solo subscription), per-bid mode is the analog ($199 per submitted bid).

Edge case: VEND has an in-flight Bid Workspace at `T0 + 26 days` (downgrade-effective). The bid is `pending_submission`; per §34.2.5 Seller-Solo per-bid charge captures on bid submission. If VEND is on per-bid mode, the bid-submission attempt at `T0 + 27 days` (post-downgrade-effective) triggers either:

- **Reading A:** Stripe charge attempts as the per-bid $199; succeeds; bid submits; vendor billed; Solo per-bid mode is conceptually ended at downgrade boundary so this charge is illegitimate. Spec silent.
- **Reading B:** Stripe charge attempts and is rejected (HTTP 422 `solo_subscription_active_per_bid_charge_blocked` per §34.12.8 #6 — but that error is for the OPPOSITE case, blocking per-bid charge while Solo subscription is active). Bid blocks; vendor sees error; spec silent on the post-downgrade-to-Free per-bid path.
- **Reading C:** The downgrade-effective transition closes per-bid mode; bid submission falls through to Free-tier behavior (Free's $5 wallet absorbs whatever cost; per-bid charge does NOT capture). Free vendor pays no per-bid; spec silent.

§44.6.7 #8 covers the Seller Solo abandons-mid-bid-before-charge path within Solo (`solo_per_bid_charge_pending` state), but does NOT cover the Solo→Free downgrade interaction with `solo_per_bid_charge_pending` state.

**D-V7-004 (P1) — Solo→Free downgrade transition row missing from §34.19.3 + per-eval/per-bid mid-flight handling silent. See §6.**

### 3.5 Honest-portability microcopy

§34.19.4: downgrade microcopy MUST be honest; required elements are (1) explicit list of preserved/restricted, (2) prior-work-preserved statement, (3) plan-cap reference, (4) plan-comparison link.

For a Solo→Free downgrade, the microcopy must additionally acknowledge a **surface change**: Solo's contract per §44.6 hides the AIWallet widget, the per-capability rate card, the per-AIOperation Billing Ledger row breakdown, etc. Free's surface contract per §34.10 / Appendix M shows the AIWallet widget, the rate card link, etc. **The downgrade adds new surfaces.** §34.19.4 microcopy elements don't address surface-onset transitions. A vendor downgrading from Solo to Free will see the AIWallet widget appear post-downgrade — a new, previously-hidden surface.

§44.6.7 #3 documents the wallet-widget-activation behavior but doesn't bind the §34.19.4 microcopy contract to it. **D-V7-005 (P2) — Solo-specific downgrade microcopy element list missing from §34.19.4. See §6.**

### 3.6 Preservation rules — audited summary

| Asset class | Solo → Free Behavior | Spec Authority | Defect |
|---|---|---|---|
| KB entries (190 over Free 50 cap) | §34.6 90-day read-only preservation per §34.10.3 #6 + §44.6.7 #3 | §34.6 |  D-V7-009 — direct contradiction with §34.19.6 #2 no-hard-archive-of-Class-1 |
| KB Value Meter score | 100% retained per §34.19.1 row 2 | §34.19.2 | (none) — formula portable across plans |
| Capability Declarations | 100% retained read-write per §34.19.1 row 3; subject to plan ceiling overage if Solo's was beyond Free's | §34.19.1 | Implicit; §34.6 enforces excess preservation but §34.19.6 #2 carve-out conflicts |
| Verification Tier | 100% retained per §34.19.1 row 4 | §34.16.2 | (none) — tier grants earned, plan-independent |
| Bid Workspace history | 100% retained per §34.19.1 row 5 | §34.6 | (none) |
| Outcome-signal history | 100% retained per §34.19.1 row 6 | §34.15 | (none) |
| Saved searches and alerts | 100% retained, may be throttled per §34.19.1 row 7 | §34.19.1 | (none) |
| Wallet balance | 100% retained per §34.19.1 row 11 | §4.8.3 | But: pooling collapses (§34.10.3 Free + Free rule); wallet is preserved but pool size collapses — Solo's engine envelope ends. Customer-visible wallet activates; semantic contradiction with §34.19.1 "100% retained" (the *envelope* is closed, not retained). D-34.19-010 covers. |
| API keys + integrations | 100% retained read-only per §34.19.1 row 13 | §34.6 | But: Solo's API add-on is excluded per §34.1.1 / §34.1.2 cell **API Add-On**; transitioning to Free preserves the keys but reads/writes return 403. Spec silent on the API-key access state during the read-only preservation. **Edge case but covered by §34.19.1 row 13's "Plan limits on integration count; excess preserved read-only per §34.6."** |
| Bid-workspace 90-day per-bid retention windows | Closes on downgrade per §34.10.3 #6 | §34.10.3 | (none) — explicit |

### 3.7 Adversarial Check 2 — Verdict

The Solo→Free downgrade is partially specified across §34.6 (excess preservation), §34.10.3 #6 (Solo-co-resident rule), §44.6.7 #3 (Solo edge cases), but contains:

- **One P1 contradiction** (D-V7-009; new): §34.6.3 vs §34.19.6 #2 on hard-archive of Class-1 KB entries.
- **One P1 transition-table omission** (D-34.19-010; existing — V7 confirms reproducible).
- **One P1 per-eval/per-bid mid-flight handling gap** (D-V7-004; new).
- **One P2 microcopy element gap** (D-V7-005; new).

**Halt-rule scope.** Zero new P0s in pricing/billing scope from this scenario. **Halt-rule unaffected by Adversarial Check 2.**

---

## 4. Adversarial Check 3 — Enterprise Pooled Wallet Across Both Consoles

**Prompt construction.** "Enterprise pooled-wallet scenario across both consoles. Confirm."

### 4.1 Scenario construction

Org `MEGA` is on Buyer Enterprise + Seller Enterprise per §34.12.5 (one combined contract; CommittedSpendContract `commit_value_dollars = $250,000/yr`; 14% volume discount band per §34.2.4). MEGA holds:

- One Stripe Customer per `(org_id, legal_entity)` (§34.10.5).
- One AIWallet (Org-scoped, console-pooled per §34.10.3, §4.8.3 AC #1).
- One CommittedSpendContract (§34.12.5).
- Two consoles' worth of capabilities and AIOperations.

Active workflow: Buyer-side Procurement runs `policy_parsing` × 8 enterprise policies × $25 = $200 burns from the unified pool; Seller-side RFP team runs `kb_bootstrap` × 1 × $200 = $200 burns. Cross-console capability `kb_suggestion` (Haiku, $0.03 per use) fires from both sides.

### 4.2 Pooling integrity check

**Test:** Does the pooled wallet correctly account for both consoles' burn?

§34.10.3 line 29371: "AIWallet balances are Organization-scoped and pooled across Buyer and Seller consoles … An Org holding (Buyer Growth = $300 budget) + (Seller Starter = $30 budget) sees a unified $330 of monthly value-dollars spendable by any capability in either console."

§34.12.2: "any customer-billed capability in either console can draw from the pool … Outcome Resolver writes operations against the appropriate counter per the §34.10.1 burn priority."

**Verdict:** Pooling rule is unambiguous. Both consoles draw against the same `commit_burn_remaining_value_dollars`. ✓

### 4.3 Cross-Console Firewall integrity check

§34.12.4: "Console-scoped business entities (Workspaces, Bid Workspaces, KB entries, etc.) MUST NOT cross the firewall regardless of billing state … AIOperation rows are Org-scoped but console-tagged … The Billing Ledger view returns rows scoped to the requesting session's console UNLESS the requesting role is `billing_admin`, in which case both consoles' AIOperations are returned with explicit `console` tags."

**But:** The AIWallet wallet-state read (`commit_burn_remaining_value_dollars`, `consumed_value_dollars`, `included_budget_remaining`, etc.) is NOT enumerated as a per-console-scoped read. The wallet is a single row per Org per §4.8.3 AC #1 ("pooling enforced by the absence of a `console` column"), and the read returns aggregate counters.

**Inference vector.** A non-billing-admin user on Buyer Console with wallet-read access can observe `commit_burn_remaining` decreasing without corresponding Buyer-side AIOperation rows visible (since billing-ledger reads are console-scoped per §34.12.4). The delta between `consumed_value_dollars` (org-wide) and the sum of visible Buyer-side AIOperation `effective_charge_cents` reveals Seller-console activity magnitude. This is a **mild firewall inference vector**.

**Mitigation analysis.** Per §34.10.4 wallet-threshold notifications, the recipients are "Org Owner + Billing Admin (one-shot)" — both roles legitimately span the firewall per §34.12.7. **The wallet widget is not formally enumerated as user-role-gated for read access in §34.10 / §34.12.** §5.11 Feature Access Matrix governs feature access by plan tier (read in PHASE3.2 walk); it's not the role-gate authority. §5.2 / §5.3 RBAC role catalogs gate workspace-level entities; org-level wallet access is not enumerated.

**Severity.** P2 documentation_gap / rbac. The leak is constrained to whoever has wallet-read access, which the spec does not clearly bound. A Workspace Owner on Buyer Console who happens to also see the wallet widget could infer Seller-console activity. Spec silence is the defect, not a built leak. **D-V7-008 (P2) — see §6.**

### 4.4 Enterprise-collapse contract integrity

§34.12.5: "When both consoles are on Enterprise, the Org signs one combined contract … Single floor at the higher of the two ($3,000/month per BPS §6 / SPS §8 — both floors are $3K/mo, so the combined floor is $3K/mo)."

**Note.** The single-floor-not-summed rule is documented intent but represents a $3K/mo revenue concession ($36K/yr). The §34.12.5 row identifies it as design choice. Not a defect — it's a documented commercial trade.

**Edge case 1 — One-side Enterprise downgrade.** What happens when MEGA's Buyer side downgrades to Buyer Scale at `T0 + 60 days`, leaving Seller side at Enterprise?

- §34.12.5 explicitly applies only to Enterprise+Enterprise. §34.12.1 explicitly says plan tier on each side is independent.
- §34.10.6 Wallet Downgrade row: "Enterprise → non-Enterprise downgrade with active CommittedSpendContract → `shortfall_policy` (§4.8.8) determines treatment."
- But: the CommittedSpendContract is ONE contract per §34.12.5, covering BOTH consoles. Buyer-side Enterprise downgrade dissolves the Enterprise+Enterprise collapse condition. What happens to the contract?
  - **Reading A:** Contract bifurcates retroactively into two contracts (one per remaining-Enterprise console). Spec doesn't define bifurcation mechanics.
  - **Reading B:** Contract collapses to a single seller-side Enterprise contract; buyer-side commit shortfall handled per §4.8.8 `shortfall_policy`. Customer is paying for a buyer-side commit pool that no longer applies.
  - **Reading C:** Contract continues as single combined; buyer-side capabilities continue to draw from the unified pool but at non-Enterprise plan-gate rules per §34.8.5; spec silent on whether `commit_burn_remaining` continues to fund buyer-Scale ops.

**§34.10.6 + §34.12.5 + §34.12.8 collectively are silent on the one-side Enterprise downgrade transition.** §34.12.8 #5 covers "Solo subscription on one console + Enterprise on the other" but NOT Enterprise→non-Enterprise (one side) when both started Enterprise.

**D-V7-006 (P1) — Enterprise+Enterprise one-side downgrade leaves combined contract orphaned. See §6.**

### 4.5 Per-console commit pool allocation

§34.12.5 states "One contract covering both consoles (`linked_wallet_id` references the unified Wallet)" — single commit pool. §4.8.8 CommittedSpendContract entity is platform-scoped, single pool.

**But:** Enterprise customers commonly want per-team / per-business-unit budget allocations. An Org with separate Procurement (buyer) and RFP-Sales (seller) cost centers could reasonably want a $200K Buyer-side commit and $50K Seller-side commit, both rolling under one contract. §34.12.5 forecloses this — single pool only.

§4.8.8 doesn't expose a per-console budget split field. §34.12.5 doesn't address the customer demand. **Spec is internally consistent but commercially limiting.**

**Severity.** P2 data_model gap. Not a billing leakage; a missing-feature defect. The spec should either authoritatively close the door on per-console allocation or expose a per-console split. **D-V7-007 (P2) — see §6.**

### 4.6 Auto-renewal opt-out per console

§34.12.5: "One contract covering both consoles." §34.12.7 lists `billing_admin` actions: "Approve a CommittedSpendContract auto-renewal opt-out."

**Edge case.** MEGA's CFO wants to opt out of seller-side auto-renewal (to renegotiate vendor-side terms) but keep buyer-side auto-renewal. The contract is unified per §34.12.5; the opt-out is binary (per §4.8.8 `auto_renew_at_term_end` Boolean). Spec doesn't address per-console opt-out.

**D-V7-010 (P2) — Enterprise+Enterprise one-contract auto-renewal opt-out per-console undefined. See §6.**

### 4.7 Adversarial Check 3 — Verdict

Enterprise+Enterprise pooled wallet operates correctly under §34.10.3 + §34.12.2 + §34.12.5. Three new defects surfaced:

- **D-V7-006 (P1)** — One-side Enterprise downgrade orphans combined contract.
- **D-V7-007 (P2)** — Per-console commit allocation silent.
- **D-V7-008 (P2)** — AIWallet read-permission scope undefined → mild cross-console activity inference vector.
- **D-V7-010 (P2)** — Per-console auto-renewal opt-out undefined.

**Halt-rule scope.** Zero new P0s in pricing/billing scope from this scenario. **Halt-rule unaffected by Adversarial Check 3.**

---

## 5. Sign-Off Determination

### 5.1 Halt-rule evaluation

The V7 prompt halt rule is "zero P0 in pricing/billing." The Phase 7 pricing/billing P0 inventory:

| Defect | Phase | Class | Status | Halt-rule effect |
|---|---|---|---|---|
| D-CONS-001 | Phase 7 (Phase CONS) | numerical_singleton / acceptance_criteria | open | **FAIL** — cost-base publish-gating threshold contradiction (10% vs 25%) makes a 12% drift non-deterministic |
| D-CONS-002 | Phase 7 (Phase CONS) | acceptance_criteria | open | **FAIL** — settlement-immutability contradiction (§4.8.1 AC #3 vs Settlement Freeze block vs state-machine row at line 8166) |

**Phase 7 sign-off: FAILS.**

The audit MUST NOT advance to Phase 8 until D-CONS-001 and D-CONS-002 are remediated or formally downgraded with Ops Finance + Counsel sign-off. Both findings violate billing/settlement contracts and would produce divergent production behavior at v7.1.0 launch.

V7 surfaced four net-new P1s (D-V7-001 stranded margin window; D-V7-002 auto-topup state; D-V7-003 contest abuse; D-V7-004 Solo per-eval mid-flight; D-V7-006 Enterprise one-side downgrade; D-V7-009 hard-archive contradiction) and four net-new P2s (D-V7-005 Solo microcopy; D-V7-007 per-console commit; D-V7-008 wallet-read scope; D-V7-010 per-console auto-renewal opt-out). None rise to P0 by the §0 severity rule.

### 5.2 Required remediation before Phase 8 advancement

**D-CONS-001 composite remediation.**

1. Author a single canonical drift-band table in §34.3.3 with explicit thresholds for: (a) auto-publish, (b) Finance alert, (c) approval-required, (d) margin-floor-breach block. Reconcile §4.8.6 AC #2 to cite the §34.3.3 table verbatim. Specifically: declare whether 10% ≤ drift < 25% requires approval or auto-publishes.
2. Add a margin-floor enforcement window contract (§34.3.3 + §34.20.2 AC #7) addressing the 30-day-notice / cost-base-live gap: either (i) block the recalc publish until notice closes, (ii) absorb the margin breach explicitly into Sourcera Cost Center per §34.3.5, or (iii) pull the published price within the notice window if blended margin breaches the floor (with annual-contract-grandfathered exception). Author the operator decision tree.
3. Update the §34.20.2 AC #7 deploy-time validator to assert against the resolved threshold table.
4. Cross-link D-V7-001 (stranded margin window) and D-V7-002 (auto-topup state) under the same v7.1.1 stamp gate.

**D-CONS-002 composite remediation.**

1. Reconcile the §4.8.1 AC #3 ("immutable on settlement") vs Settlement Freeze block ("DSAR-only exception") vs state-machine row at line 8166 ("Ops emergency reversal allowed"). Pick one settlement-immutability model and propagate.
2. Author the Ops emergency-reversal path explicitly (event, audit, customer-notification, billing-event treatment) OR strike the state-machine row.
3. Update D-CONS-018 Solo per-charge contest mechanics to align with the resolved settlement-immutability model.

### 5.3 Caveats

- **§34 sub-section coverage gaps.** §34.4, §34.7, §34.9, §34.12 (partial), §34.13 are sampled-only across Phase 7 sub-prompts. A dedicated Phase 7.7 walk should close before v7.1.1 stamps. V7 cannot certify §34 walk-completeness without these sub-prompts running.
- **§44 coverage gap.** §44.1–§44.5 (platform performance budgets) are out of Phase 7 scope; bound to Phase 10 (`Audit_Prompts.md` §10). §44.6 sub-sections 44.6.2 (Single-Card Billing Surface) and 44.6.6 (Public Pricing API on Solo) are sampled-only in Phase 7 sub-prompts. V7 surfaces this as a known structural-coverage gap mirroring the V6 §25.7 caveat. It does NOT affect the V7 halt-rule evaluation but is a v7.1.1 stamp-gate inheritor.
- **Adversarial Check 3 cross-console firewall integrity.** D-V7-008 is P2 because the leak is constrained to whoever has wallet-read access, and §34.10 / §34.12 do not formally bound that access. A defensive remediation pass would either explicitly gate AIWallet read access to billing_admin / org_owner only (per §34.12.7 mutation pattern) OR document that the residual cross-console activity-magnitude inference is acceptable. The V6 §25.1.2 + §4.7.1 cardinality-leakage cluster (D-6.1-001 + D-V6-001) shares the systemic pattern — customer-audience wallet/billing payloads carrying contralateral-console magnitude information.
- **Cross-cutting: contest-flood / DSAR-deadlock pattern.** D-V7-003 surfaces a real abuse vector: a billing_admin with a script can flood the contest_review queue and induce SLA breaches across all 30 contests + a 35-day DSAR latency. Recommend a v7.1.1 cross-cutting contest-rate-limit + DSAR-vs-contest deadlock-resolution sweep across §34.11.2, §6.8, §32.4. This is in spirit a sibling of the V6 §1.3 webhook-audience-redaction sweep recommendation.

---

## 6. Defect Promotions to DEFECT_LEDGER.md

Ten net-new defects promoted under the `D-V7-NNN` mnemonic. None rise to P0 under the §0 severity rule.

### D-V7-001 — Stranded margin-floor breach window during 30-day breaking-change notice (P1)

- **Class.** `numerical_singleton` (also `acceptance_criteria`).
- **Location.** §34.3.3 row "Customer notification window for breaking-change publishes ≥ 30 days before `effective_at`"; §4.8.9 AC #3; §34.20.2 AC #7; §34.3.1 line 28864.
- **Evidence.** §34.3.3 + §4.8.9 AC #3 require 30-day advance notice for customer-visible price increases. §34.20.2 AC #7 + §34.3.1 line 28864 enforce 88% blended-margin floor "at price-update time." A 12% cost_base spike that does NOT immediately breach the 88% floor (because margin started above floor) but WOULD breach the floor over the 30-day notice window (compounding) is silent — the recalc publishes; the notice fires; ops bill at OLD value_price for 30 days; margin breaches the 88% floor; spec offers no remedy short of pulling the published price (which the 30-day notice contract effectively forbids for annual-contract-grandfathered customers per §34.5.1). The §34.20.2 AC #7 deploy-time validator does not check post-publish notice-window margin trajectory.
- **Why P1.** A junior engineer building the recalc-publish gate cannot determine the operator decision when the margin breach is in the future, not at publish time. Production behavior diverges based on which margin enforcement reading the engineer picks (block-publish vs absorb-into-Sourcera-cost-center vs pull-published-price).
- **Convention violated.** Authoring Convention #2 (acceptance criteria observable + threshold). Authoring Convention #10 (numerical singletons must have one authoritative behavior).
- **Recommendation.** Author §34.3.3 explicit decision tree for the notice-window margin-breach scenario: (i) block the recalc publish if projected blended margin over the notice window would breach 88% (preferred — preserves settlement immutability and customer 30-day notice contract), OR (ii) absorb the margin-breach into Sourcera Cost Center: Operations per §34.3.5 with explicit ledger entry, OR (iii) pull the published price within the notice window with explicit customer-comm. Strengthen §34.20.2 AC #7 deploy-time validator to assert post-publish projected-margin trajectory. Cross-link to D-CONS-001 in remediation.
- **Remediation owner hint.** `pricing` (Ops Finance + Founder dual-signoff per §34.3.1 line 28864 multiplier-change pattern).
- **Links.** D-CONS-001 (parent — publish-gating threshold ambiguity); §34.3.3, §34.20.2, §4.8.9.

### D-V7-002 — Wallet state-machine semantics undefined when auto-topup monthly cap exhausted concurrent with included-budget exhaustion (P1)

- **Class.** `state_machine` (also `error_code`).
- **Location.** §4.8.3 AIWallet state enum (line ~6815); §34.10.2 row "Auto-topup max monthly"; §34.10.4 wallet state-machine policy summary; §4.8.3.A top-up state machine.
- **Evidence.** §4.8.3 wallet state enum: `active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed`. §34.10.4: "if no auto-topup or auto-topup capped out: hard-cap; HTTP 402 `wallet_hard_capped` for new customer-billed AIOperations." The "auto-topup capped out" case is named in policy but does NOT have a dedicated state in the enum or a dedicated error/event in §31.8. §4.8.3.A handles individual top-up state; the aggregate-monthly-cap-exhausted condition has no state representation. When included exhausted + overage exhausted + auto-topup monthly cap exhausted, the wallet should transition to `hard_capped_100`, but the spec doesn't enumerate the trigger. The `wallet_state.transitioned` webhook (§31.8) cannot fire because no canonical transition is defined.
- **Why P1.** Engineer building the wallet state-machine cannot deterministically wire the auto-topup-cap-exhausted → hard_capped_100 transition. The PostHog analytics for "auto-topup cap exhausted" cannot bind to a canonical state name. Customer-facing error returns may fire as `wallet_hard_capped` even when the wallet's `consumed_value_dollars < (budget + overage)` because the auto-topup cap was the binding constraint — confusing for operators trying to diagnose why their wallet appears hard-capped while showing remaining numerical capacity.
- **Convention violated.** Authoring Convention #5 (state machines are tables; from/to/trigger/conditions/notes). Authoring Convention #6 (APIs declare error codes registered in Appendix I).
- **Recommendation.** Add `auto_topup_monthly_cap_exhausted` boolean flag to AIWallet entity (§4.8.3) OR add `hard_capped_auto_topup_monthly_cap` as a distinct state in the wallet-state enum. Author state transition `(soft_warned_*) → hard_capped_*` triggered by `auto_topup_monthly_cap_exhausted=true AND included+overage budget projected to exhaust before next billing rollover`. Register `auto_topup_monthly_cap_exhausted` event in Appendix C (Notification Event Catalog) and Appendix G (PostHog Taxonomy). Add error code `wallet_auto_topup_monthly_cap_exhausted` to Appendix I distinct from `wallet_hard_capped`.
- **Remediation owner hint.** `engineering`.
- **Links.** D-CONS-013 (P1; auto-topup daily/weekly cap fields missing — sibling defect on the entity layer); D-CONS-006 (P1; wallet state enum drift `soft_capped_*` vs `soft_warned_*`).

### D-V7-003 — Contest filing rate-limit / queue back-pressure / DSAR-vs-contest deadlock unspecified (P1)

- **Class.** `acceptance_criteria` (also `api`, `dsar`).
- **Location.** §34.11.2 Contest Window; §34.11.4 AC #4; §32.4 generic API rate-limit; §6.8 DSAR.
- **Evidence.** §34.11.2 spec is silent on: (i) rate-limit on contest filing per (org_id, billing_admin_user_id, time_window) — a billing_admin script could file 1,000 contests in seconds; (ii) queue-depth back-pressure — §34.11.4 AC #4 SLA does not scale with queue depth; (iii) auto-filed contest aggregate caps per Org / capability / period; (iv) DSAR-vs-contest deadlock — §34.11.2 locked-state guard blocks DSAR redaction on open contests (HTTP 423 `ai_operation_locked_for_contest`); a 30-contest flood blocks a concurrent DSAR for at least the contest SLA (5 business days), breaching the §6.8 30-day DSAR SLA when combined with normal DSAR processing latency.
- **Why P1.** A billing_admin acting in bad faith (or via compromised credentials) can flood the contest_review queue, induce SLA breaches across all contests (each firing `contest.sla_breach`), and weaponize the locked-state guard to block DSARs. No rate-limit bound exists. Engineering cannot build defensively against this without spec authority.
- **Convention violated.** Authoring Convention #14 (edge cases — concurrency, abuse, DSAR compatibility). Authoring Convention #6 (APIs declare rate-limit class).
- **Recommendation.** Author §34.11.2 explicit rate-limit: e.g., "Max 10 contests per `(org_id, billing_admin_user_id)` per rolling 24-hour window; max 100 contests per Org per rolling 30-day window. Excess returns HTTP 429 `contest_rate_limit_exceeded` (Appendix I)." Author §34.11.2 queue-depth back-pressure rule: "When `contest_review` queue depth exceeds 100 per Org, the SLA extends to 10 business days; depth exceeds 500, escalates to Ops + Sales Ops alert." Author §6.8 + §34.11.2 DSAR-vs-contest deadlock-resolution rule: "DSAR redaction may proceed during open contest after 14 days post-DSAR-receipt OR after explicit Ops Finance approval, with audit log; the AIOperation row is preserved in financial-tier retention even if redacted from DSAR-subject identifiers." Add auto-filed contest aggregate cap per (Org, capability_id, period). Update §6.8 DSAR SLA matrix to acknowledge contest-block exception.
- **Remediation owner hint.** `engineering` + `legal` (DSAR rule requires Counsel sign-off).
- **Links.** D-CONS-008 (P1; contest 14-day window: API only, no DB enforcement); D-CONS-012 (P1; six contest webhooks pending).

### D-V7-004 — Solo↔Free transition rows absent from §34.19.3 + per-eval / per-bid mid-flight handling silent on plan-transition boundary (P1)

- **Class.** `acceptance_criteria` (also `state_machine`).
- **Location.** §34.19.3 transition table; §34.10.3 Solo-co-resident rule items 5–6; §44.6.7 #3 / #7 / #8; §34.2.5 Solo per-eval / per-bid charge orchestration.
- **Evidence.** §34.19.3 enumerates Free → Starter, Starter → Growth, Growth → Scale, Scale → Enterprise, and the inverse downgrades — but NOT Solo-related rows. §34.10.3 #5/#6 and §44.6.7 #2/#3 cover Solo upgrade-to-Starter+ and Solo downgrade-to-Free at the wallet/envelope/surface level but do NOT cover the per-eval/per-bid mid-flight evaluation case at the transition boundary. Edge case: Buyer Solo on per-eval mode initiates a Workspace 6 hours before downgrade-effective time; Selection Report PDF export at hour 12 (post-downgrade-effective) attempts $199 charge. Three readings (illegitimate charge captures; charge rejected with `solo_subscription_active_per_eval_charge_blocked`-class error; falls through to Free-tier) are all consistent with the spec — no determinism. §34.12.8 #6 covers the OPPOSITE case (per-eval charge blocked when Solo subscription active); the Solo→Free transition is silent. §44.6.7 #7/#8 cover within-Solo abandons but not cross-tier transitions.
- **Why P1.** The §34.19.7 AC #1 deploy-time test `plan_upgrade_13_asset_preservation` "runs a full matrix of upgrade transitions" but the matrix does not bind Solo rows. A junior engineer wiring the Solo→Free transition cron will pick a per-eval mid-flight reading; QA cannot assert determinism without the §34.19.3 row.
- **Convention violated.** Authoring Convention #2 (acceptance criteria; observable + threshold). Authoring Convention #5 (state machines).
- **Recommendation.** Add eight rows to §34.19.3 covering: Free → Solo, Solo → Starter, Solo → Growth, Solo → Scale, Solo → Enterprise (multi-step upgrade), Solo → Free (downgrade), Starter → Solo, Growth → Solo. Each row should cite §34.10.3 #5/#6 and §44.6.7 for cross-references. Author §34.2.5 + §34.10.3 + §44.6.7 explicit handling for in-flight per-eval / per-bid evaluations at the plan-transition boundary: e.g., "An in-flight Solo per-evaluation Workspace at the downgrade-effective boundary completes under the Solo per-eval contract IF the Selection Report PDF export trigger fires within `+grace_window_hours = 24` of the boundary; otherwise the workspace transitions to Free-tier behavior (no per-eval charge). The Stripe charge attempt is gated by the captured plan-tier at workspace-creation time, not at PDF-export time." Update §34.19.7 AC #1 to bind Solo rows in the matrix. Cross-link to D-34.19-010 as the parent omission.
- **Remediation owner hint.** `engineering` + `pricing`.
- **Links.** D-34.19-010 (P1; Solo plan transitions absent from §34.19.3 — V7 confirms reproducible and extends with per-eval mid-flight); D-PT-005 (Solo per-charge fx_rate_locked timing); D-CONS-018 (Solo per-charge contest mechanics).

### D-V7-005 — §34.19.4 honest-portability microcopy element list does not enumerate Solo-specific surface-onset transitions (P2)

- **Class.** `documentation_gap` (also `accessibility` adjacent — UX-copy completeness).
- **Location.** §34.19.4 honest-portability microcopy elements; §44.6.1 surface hide list; §44.6.7 #3.
- **Evidence.** §34.19.4 enumerates four required elements: explicit list of newly unlocked, prior-work-preserved statement, plan-cap reference, plan-comparison link. For a Solo→Free downgrade, the surface contract changes: §44.6.1 hides AIWallet widget / rate-card link / per-AIOperation breakdown / FreeAllowanceCounter inline counter on Solo; Free's surface contract per §34.10 + Appendix M shows them. The downgrade introduces NEW visible surfaces — the customer experiences a step-change in surface complexity. §34.19.4's microcopy element list does not require acknowledging surface-onset changes ("Your AI Wallet will appear post-downgrade — Free includes a $5 monthly budget with a hard cap; you'll see per-capability rate-card details that were previously hidden on Solo"). The §44.6.7 #3 narrative confirms the wallet-widget activation but does NOT bind the §34.19.4 microcopy contract to it. The §34.19.7 AC #4 content-QA test `plan_transition_microcopy_present` is qualitative on the Solo dimension (D-34.19-011 P2 covers the broader microcopy threshold weakness).
- **Why P2.** A staff engineer can resolve from context (write microcopy that mentions wallet activation), but the resolution is not the same across two readers — one writes "Welcome to Free" copy that ignores Solo's surface-difference; another writes "AI Wallet will now appear" copy. The defect is documentation hygiene, not a build-blocker.
- **Convention violated.** Authoring Convention #2 (acceptance criteria observable + threshold). Authoring Convention #11 (heading syntax — extends to required-elements lists).
- **Recommendation.** Add §34.19.4.A (or extend §34.19.4 element list) with Solo-specific microcopy elements: (5) explicit acknowledgement of surface-onset transitions when transitioning into or out of Solo (e.g., "Your AI Wallet will [appear/disappear] post-[downgrade/upgrade]"); (6) explicit mention of envelope-vs-wallet semantic difference; (7) explicit per-eval / per-bid charge-mode change acknowledgement when applicable. Tighten §34.19.7 AC #4 content-QA test to assert all elements (1–7) are present on Solo-bordering transitions.
- **Remediation owner hint.** `design` + `pricing`.
- **Links.** D-34.19-011 (P2; microcopy threshold qualitative weakness); D-V7-004 (Solo transition rows omission — same scenario class).

### D-V7-006 — Enterprise+Enterprise one-side downgrade leaves combined contract orphaned (P1)

- **Class.** `acceptance_criteria` (also `state_machine`, `data_model`).
- **Location.** §34.12.5 Enterprise Collapse to One Contract; §34.10.6 Wallet Downgrade Behavior; §34.12.1 Per-Console Plan Activation; §34.12.8 Cross-Side Billing Failure Modes; §4.8.8 CommittedSpendContract.
- **Evidence.** §34.12.5 explicitly applies only when both consoles are on Enterprise. §34.12.1 says "Plan tier on each side is independent and may be upgraded or downgraded without affecting the other side, with the Enterprise-collapse exception in §34.12.5." But the converse — what happens when ONE console downgrades from Enterprise (e.g., Buyer Enterprise → Buyer Scale, Seller Enterprise stays) — is not authored. §34.12.5 names the dual-Enterprise collapse condition but not the dissolution-on-downgrade case. §34.10.6 covers "Enterprise → non-Enterprise downgrade with active CommittedSpendContract" with `shortfall_policy` but does NOT distinguish (a) dual-Enterprise → single-Enterprise (one console downgrade) from (b) Enterprise → non-Enterprise (single-console Org). Three readings of the dual-Enterprise → single-Enterprise transition all sit consistent with the spec: bifurcate retroactively, collapse to single seller-side contract with buyer-side commit shortfall, or continue as single combined contract with post-Enterprise plan-gate rules on the downgraded side.
- **Why P1.** The CommittedSpendContract is a financial contract; ambiguity on what happens at one-side Enterprise downgrade leaves engineering unable to deterministically wire the §34.5.2 downgrade pre-effective validation. The Stripe `subscription.updated` webhook handler must decide whether to (i) issue a refund for the dissolved-Enterprise floor, (ii) keep the unified contract billing the lower-floor non-Enterprise plan, or (iii) bifurcate the contract — three mutually exclusive paths.
- **Convention violated.** Authoring Convention #2 (acceptance criteria observable + threshold). Authoring Convention #5 (state machines for plan transitions).
- **Recommendation.** Author §34.12.5.B (or extend §34.12.5 with a dissolution sub-section) explicit transition rules for Enterprise+Enterprise → single-side-Enterprise downgrade: e.g., "On one-side Enterprise downgrade, the §34.12.5 combined-contract collapse dissolves at the downgrade-effective billing rollover. The remaining Enterprise console continues under a single-console Enterprise contract at the standard $3K/mo floor; the downgraded console transitions to non-Enterprise plan-gate rules. Unspent committed-spend balance allocated to the dissolved console follows §4.8.8 `shortfall_policy` (default `forfeit`; alternates require explicit signature). The CommittedSpendContract row is updated with `commit_value_dollars = remaining_console_commit`; a `committed_spend_contract.dissolved_partial` audit event fires." Add per-console commit allocation field to §4.8.8 (also addresses D-V7-007). Update §34.12.5 Acceptance Criteria with dissolution test fixtures.
- **Remediation owner hint.** `pricing` + `engineering`.
- **Links.** D-V7-007 (P2; per-console commit allocation silent — sibling); D-CONS-002 (P0; settlement-immutability — adjacent on the financial-record-mutation question); §34.12.8 #5 (Solo+Enterprise — distinct case).

### D-V7-007 — CommittedSpendContract per-console commit allocation silent under §34.12.5 single-contract collapse (P2)

- **Class.** `data_model` (also `documentation_gap`).
- **Location.** §34.12.5; §4.8.8 CommittedSpendContract entity.
- **Evidence.** §34.12.5 declares "One contract covering both consoles (`linked_wallet_id` references the unified Wallet); `commit_value_dollars ≥ $12,000/yr`." §4.8.8 has no per-console budget allocation field. Enterprise customers commonly want per-team / per-business-unit budget split (e.g., $200K Buyer-side commit, $50K Seller-side commit, both rolling under one contract). Spec is internally consistent (single pool only) but commercially limiting.
- **Why P2.** Not a billing-leakage; a missing-feature defect. A staff engineer following §34.12.5 will build single-pool-only commit; sales-side may push back when Enterprise prospects ask for per-console allocation. Spec should either authoritatively close the door or expose a split.
- **Convention violated.** Authoring Convention #1 (data model — entity definition) re: missing field. Authoring Convention #2 (acceptance criteria — explicitness on single-pool-only).
- **Recommendation.** Either (a) add §4.8.8 fields `commit_value_dollars_buyer` / `commit_value_dollars_seller` (nullable; sum-to-`commit_value_dollars` invariant) with explicit allocation-on-contract-signing semantics, OR (b) author §34.12.5 explicit "single-pool-only — no per-console allocation" rule with a §34.12.5 AC asserting at deploy-time that no per-console split fields exist. Update §34.12.7 `billing_admin` mutation surface to expose the per-console allocation if (a) is chosen.
- **Remediation owner hint.** `pricing` + `engineering`.
- **Links.** D-V7-006 (P1; one-side Enterprise downgrade — adjacent); §4.8.8.

### D-V7-008 — AIWallet aggregate-counter read-permission scope undefined; cross-console activity-magnitude inferable on pooled wallet (P2)

- **Class.** `rbac` (also `firewall_leakage`).
- **Location.** §4.8.3 AIWallet entity; §34.10 (silent on read scope); §34.12.4 Dual-Console Firewall is Unchanged; §34.12.7 Billing Admin Role.
- **Evidence.** §34.12.4 explicitly scopes Billing Ledger reads ("returns rows scoped to the requesting session's console UNLESS the requesting role is `billing_admin`"). §34.12.7 enumerates `billing_admin` MUTATIONS but does not bound wallet-state READ access. §4.8.3 AC #1 says wallet is one row per Org with no `console` column. The wallet aggregate counters (`commit_burn_remaining_value_dollars`, `consumed_value_dollars`, `included_budget_remaining`, `overage_balance`) are NOT enumerated as per-console-scoped reads. A non-billing-admin user on Buyer Console with wallet-read access (the scope of which §34.10 / §5.11 / §5.2 / §5.3 do NOT formally bound) can observe `commit_burn_remaining` decreasing without corresponding Buyer-side AIOperation rows visible in Billing Ledger (since Billing Ledger reads are console-scoped) → infers Seller-console activity magnitude. The inference vector is mild (no user-identity leak, no buyer-internal scope-of-evaluation leak, no specific-capability leak — only aggregate cross-console burn magnitude) but is not formally precluded by the §34.12.4 firewall rule.
- **Why P2.** A staff engineer building the wallet-read API endpoint will pick a default scope (e.g., expose to org-level membership on either console). The defect is silence, not a built leak. Mitigation analysis: §34.10.4 wallet-threshold notifications target Org Owner + Billing Admin (both legitimately span the firewall); the residual leakage is constrained to whoever else has wallet-read access, which the spec does not bound. Compared to V6 D-6.1-001 / D-V6-001 (P0 firewall leakage), the V7 finding is far less severe — magnitude inference is incremental, not unique re-identification — but it exhibits the same systemic pattern of customer-audience aggregate fields exposing contralateral-console activity.
- **Convention violated.** Authoring Convention #13 (Console Firewall — no field, query path, or webhook event leaks data across the firewall). Authoring Convention #1 (data-model scope-isolation declarations).
- **Recommendation.** Author §34.12.4.A (extending the Dual-Console Firewall block) explicit AIWallet read-permission scope: "AIWallet aggregate-counter reads (`GET /v1/orgs/{org_id}/wallet`, the in-app wallet widget render, the §34.10.4 threshold-notification recipient list) are restricted to `org_owner`, `billing_admin`, and `org_admin` roles. All other roles return HTTP 403 `wallet_read_scope_violation` (Appendix I new). The console of the requesting session does NOT scope the wallet read — wallet is unified per the §34.10.3 pooling rule — but role-gating preserves the §34.12.4 firewall against incidental cross-console activity-magnitude inference by non-admin roles." Update §5.11 Feature Access Matrix with wallet-read row. Add `wallet_read_scope_violation` error code to Appendix I. Add §34.12.4 AC asserting the role-gate.
- **Remediation owner hint.** `security` + `engineering`.
- **Links.** D-6.1-001 / D-V6-001 (P0 firewall leakage in §4.7.1 Console Bridge — systemic pattern of customer-audience aggregate cardinality exposure); §34.10.3, §34.12.4, §34.12.7.

### D-V7-009 — §34.6.3 hard-archive at d+90 vs §34.19.6 #2 forbids hard-archive of Class-1 KB entries — direct policy contradiction (P1)

- **Class.** `acceptance_criteria` (also `consistency_drift`, `state_machine`).
- **Location.** §34.6.3 Post-Preservation-Window Behavior; §34.19.1 row 1 (KB entries); §34.19.6 #2 protected-asset downgrade firewall; §34.20.16 AC #80; §4.8.10 DowngradeExcessDataBucket entity.
- **Evidence.** §34.6.3 mandates: at `preservation_until = downgrade_at + 90 days`, hard-archive cron picks up the bucket within 1 hour; entities hard-archived to cold storage; entities hard-deleted from hot storage. §34.19.1 row 1: "KB entries (all tiers) — 100% retained, read-write." §34.19.6 #2: "§34.19.1 takes precedence over §34.6 for the 13 asset classes listed; deploy-time validator `protected_asset_downgrade_firewall` asserts no asset in the 13-class list enters `preservation_status=hard_archived` in a DowngradeExcessDataBucket." §34.20.16 AC #80 binds the validator. Two readings: (A) §34.6.3 authority — KB entries hard-archive at d+90, violating "100% retained, read-write"; (B) §34.19.6 #2 authority — Class-1 KB entries NEVER hard-archive, sitting indefinitely in `archived` state, violating §34.6.3 cold-storage migration cron and §40.2 retention/cost projections. The Solo→Free downgrade scenario (200 KB excess) directly hits this contradiction.
- **Why P1.** Junior engineer building the hard-archive cron WILL hit this contradiction. Direct contradiction in policy text; not resolved by sub-spec citation; not resolved by entity-layer schema (D-34.19-018 covers the phantom-field issue separately — `preservation_status=hard_archived` field/value absent from §4.8.10). The two readings have materially different production behavior and storage-cost economics.
- **Convention violated.** Authoring Convention #10 (numerical singletons + behavioral singletons must have one authoritative home). Authoring Convention #5 (state machines).
- **Recommendation.** Resolve §34.19.6 #2 vs §34.6.3 contradiction explicitly. Two options: (a) Hard-archive permitted but with extended cold-storage retention for Class-1 assets (e.g., 7-year financial-tier retention vs the standard cold-storage retention) — preserves operational cron + extends preservation; update §34.6.3 to carve out Class-1 with extended cold-storage retention reference. (b) Class-1 assets remain in hot-storage indefinitely (no hard-archive), with explicit cost-allocation per §34.18 financial-targets — preserves §34.19.1 "100% retained, read-write" but materially increases hot-storage cost; update §34.6.3 + §40.2 to reference the carve-out. Either way, update D-34.19-018 phantom-field schema gap (`preservation_status=hard_archived` field) and §34.20.16 AC #80 deploy-time validator. Cross-link to D-34.19-006 (firewall vs acknowledgement path — adjacent) and D-34.19-018 (phantom field — same parent).
- **Remediation owner hint.** `pricing` + `engineering` (Ops Finance dual-signoff per §34.4 invariant).
- **Links.** D-34.19-006 (P1; firewall vs acknowledgement path); D-34.19-018 (P1; phantom field schema); D-34.19-010 (P1; Solo transitions); §34.6.3, §34.19.1, §34.19.6, §34.20.16 AC #80.

### D-V7-010 — Enterprise+Enterprise combined-contract auto-renewal opt-out per-console undefined (P2)

- **Class.** `acceptance_criteria` (also `data_model`).
- **Location.** §34.12.5 Enterprise Collapse; §34.12.7 `billing_admin` actions ("Approve a CommittedSpendContract auto-renewal opt-out"); §4.8.8 CommittedSpendContract `auto_renew_at_term_end` field.
- **Evidence.** §34.12.5 declares "One contract covering both consoles." §34.12.7 lists auto-renewal opt-out as a `billing_admin` action. §4.8.8 carries `auto_renew_at_term_end` as a Boolean — single-pool only. Enterprise CFO wanting to opt out of seller-side auto-renewal (to renegotiate) but keep buyer-side auto-renewal cannot do so under the single-Boolean field. Spec is internally consistent (single pool, single opt-out) but doesn't address per-console opt-out customer demand.
- **Why P2.** Sibling defect to D-V7-007 (per-console commit allocation). A staff engineer following spec will build single-Boolean opt-out; sales-side may push back. Spec should either close the door explicitly or expose per-console opt-out.
- **Convention violated.** Authoring Convention #1 (data model — fields). Authoring Convention #2 (acceptance criteria — explicitness on single-opt-out-only).
- **Recommendation.** Either (a) add §4.8.8 fields `auto_renew_at_term_end_buyer` / `auto_renew_at_term_end_seller` (nullable; default-true; per-console opt-out semantics), OR (b) author §34.12.5 + §4.8.8 explicit "single-opt-out only" rule with a §34.12.5 AC. Update §34.12.7 `billing_admin` action description.
- **Remediation owner hint.** `pricing`.
- **Links.** D-V7-007 (P2; per-console commit allocation — sibling); D-V7-006 (P1; one-side Enterprise downgrade — adjacent); §4.8.8.

---

## 7. Self-Challenge Pass

Each V7 defect re-read under hostile staff-engineer posture per `Audit_Prompts.md` SELF-CHALLENGE PASS protocol.

- **D-V7-001 (P1).** Hostile reviewer: "The 88% margin floor is a *blended* floor across all customer-billed capabilities; a single capability's 12% drift won't move the blend below 88% unless that capability is a dominant share of value-dollars consumed." True for low-share capabilities; false for high-share (`policy_parsing` Opus is large per-op value). The defect is the spec silence on the blended-margin trajectory check during the notice window — the size of the breach depends on capability share, but the *enforcement gap* is independent of share. P1 holds.
- **D-V7-002 (P1).** Hostile reviewer: "The §34.10.4 narrative 'auto-topup capped out' covers the case implicitly; engineering can wire the transition without a new state name." Maybe — but the wallet state enum is canonical (consumed by webhooks, PostHog events, in-app surfaces), and "implicit" wiring produces non-deterministic state transitions in different parts of the system. The PostHog `wallet_state.transitioned` event cannot bind to an unnamed state. P1 holds.
- **D-V7-003 (P1).** Hostile reviewer: "Contest filing rate-limit is implicit in §32.4 generic API rate-limit — a billing_admin filing 1,000 contests via API would hit the generic rate limit." Generic API rate limit is per-token throughput, not per-resource-action; a 5,000-rps token can file 5,000 contests/sec without hitting per-token rate limit. Resource-level rate limits MUST be authored explicitly. P1 holds. The DSAR-vs-contest deadlock is independently P1.
- **D-V7-004 (P1).** Hostile reviewer: "§34.10.3 #6 + §44.6.7 #3 cover Solo→Free at the wallet/surface level; §34.19.3 transition table doesn't NEED Solo rows because the carry-over guarantee for Solo is the same as the standard tiers." The §34.19.7 AC #1 explicitly invokes a "full matrix of upgrade transitions" — meaning the matrix must be enumerable. Solo is a registered plan tier per Appendix J Plan Tiers; "full matrix" must include Solo rows. Plus the per-eval/per-bid mid-flight handling is genuinely undefined. P1 holds.
- **D-V7-005 (P2).** Hostile reviewer: "Microcopy element list is illustrative; designers add what's needed." §34.19.4 explicitly says "Required elements" (numbered 1–4). Required ≠ illustrative. Surface-onset transitions are a real Solo-specific microcopy obligation. P2 holds (not P1 because resolvable from context; not P3 because non-trivial to omit).
- **D-V7-006 (P1).** Hostile reviewer: "The default reading is §34.10.6 — 'Enterprise → non-Enterprise downgrade with active CommittedSpendContract' — which doesn't distinguish dual-Enterprise from single-Enterprise origin. Engineer reads this and applies `shortfall_policy` to the dissolved console's commit allocation; the unified contract becomes a single-console Enterprise contract." This is one of the three readings — but the contract record itself doesn't bifurcate or rename; the `commit_value_dollars` field stays at the original combined value unless explicitly mutated. The spec doesn't author the mutation. P1 holds.
- **D-V7-007 (P2).** Hostile reviewer: "Per-console commit allocation is a feature request, not a defect." It IS a feature request when read as 'add capability'; it's a SPEC defect when read as 'spec doesn't tell engineering whether to build it or close the door.' The defect is the silence. P2 holds (not P1 because no single reading is correct or wrong; both single-pool and per-console are commercially viable).
- **D-V7-008 (P2).** Hostile reviewer: "Wallet read access is implicitly bounded by org-membership; non-org-members can't see the wallet." True — but org-membership ≠ billing_admin / org_owner / org_admin. A regular Workspace Owner is org-member and can plausibly see the wallet widget on their Buyer Console; the leak vector activates. P2 holds. Self-challenge revision: original drafted as P1 (firewall leak); downgraded to P2 because the leak is magnitude-only, not user-identity / scope / capability — and spec silence allows defensive remediation that closes the door before the leak materializes. (Logged as severity revision.)
- **D-V7-009 (P1).** Hostile reviewer: "§34.19.6 #2 'takes precedence' clearly resolves the conflict — Class-1 KB entries don't hard-archive." But §34.6.3 is the operational cron contract; hard-archive cron either runs or doesn't. If §34.19.6 #2 is taken literally, the cron must skip Class-1 rows, and the bucket sits in `archived` state indefinitely consuming hot-storage. §40.2 retention and §34.18 cost projections are silent on this. The spec contradiction is resolvable in two ways with materially different storage-cost economics. P1 holds.
- **D-V7-010 (P2).** Hostile reviewer: "Auto-renewal opt-out is single-Boolean per the entity; CFO wants what the system doesn't offer — that's a feature request." Sibling reasoning to D-V7-007. The defect is spec silence on whether to close the door or expose. P2 holds.

**Severity revisions:** D-V7-008 P1 → P2 (leak is magnitude-only; spec silence is the defect not a built leak). All other defects sustain original severity.

**Findings withdrawn during self-challenge:** None.

---

## 8. Counterfactual Pass

Per `Audit_Prompts.md` COUNTERFACTUAL PASS protocol, three failure modes per adversarial scenario enumerated.

### Scenario 1 — Worst-case AIOperation

- **FM-1.A:** Cost spike at exactly 12% drift (mid-band ambiguity). ❌ — D-CONS-001 P0 confirmed reproducible; D-V7-001 stranded margin window NEW.
- **FM-1.B:** Auto-topup monthly cap exhausted concurrent with included exhausted. ❌ — D-V7-002 NEW (state-machine semantics); D-CONS-013 sibling (entity field).
- **FM-1.C:** 30 simultaneous contests + auto-filed contests during the same window + DSAR pending. ❌ — D-V7-003 NEW.

### Scenario 2 — Solo → Free downgrade

- **FM-2.A:** §34.6.3 hard-archive at d+90 vs §34.19.6 #2 no-Class-1-hard-archive. ❌ — D-V7-009 NEW.
- **FM-2.B:** Solo → Free transition row absent from §34.19.3 + per-eval/per-bid mid-flight handling. ❌ — D-V7-004 NEW (extends D-34.19-010).
- **FM-2.C:** Solo-specific microcopy element list omission. ❌ — D-V7-005 NEW.

### Scenario 3 — Enterprise pooled wallet

- **FM-3.A:** One-side Enterprise downgrade leaves combined contract orphaned. ❌ — D-V7-006 NEW.
- **FM-3.B:** Per-console commit allocation silent on §34.12.5. ❌ — D-V7-007 NEW.
- **FM-3.C:** AIWallet read scope undefined. ❌ — D-V7-008 NEW (downgraded P1→P2 in self-challenge).
- **FM-3.D:** Per-console auto-renewal opt-out undefined. ❌ — D-V7-010 NEW.

---

## 9. Coverage Matrix Updates

V7 amends the Phase 7 sub-prompt cell updates with the following cells:

- **F-§34.3 Outcome-Based AI Operation Pricing** — `numerical_singleton` ❌ missing (was ❌ from D-CONS-001 confirmed; D-V7-001 stranded margin window adds notice-window-margin trajectory enforcement gap).
- **F-§34.10 AI Wallet Service** — `state_machine` ⚠ partial (was ⚠ from D-CONS-006; D-V7-002 adds auto-topup-monthly-cap-exhausted state).
- **F-§34.11 Outcome Resolver** — `acceptance_criteria` ❌ missing (was ⚠; D-V7-003 contest abuse / DSAR deadlock); `dsar` ⚠ partial (was ✅; D-V7-003 DSAR-vs-contest locked-state deadlock).
- **F-§34.19 Seller Plan Upgrade Carry-Over Guarantee** — `acceptance_criteria` ❌ missing (was ❌ from D-34.19-010; D-V7-004 confirms and extends with per-eval mid-flight); `consistency_drift` ❌ missing (was ⚠; D-V7-009 adds direct §34.6.3 vs §34.19.6 #2 contradiction).
- **F-§34.12 Cross-Side Billing Rules** — `acceptance_criteria` ❌ missing (was ⚠; D-V7-006 one-side Enterprise downgrade; D-V7-010 per-console auto-renewal opt-out); `data_model` ⚠ partial (was ✅; D-V7-007 per-console commit allocation).
- **F-§34.10.3 Pooled Budget Across Consoles** — `firewall_leakage` ⚠ partial (was ✅; D-V7-008 wallet read scope undefined); `rbac` ⚠ partial (was ✅; D-V7-008 read scope).
- **F-§34.19.4 Honest-Portability Microcopy** — `documentation_gap` ⚠ partial (was ⚠ from D-34.19-011; D-V7-005 adds Solo-specific element list omission).

---

## 10. Pre-edit Backup

No spec edits performed in this prompt (audit non-destructive by default per `Audit_Prompts.md` `OUTPUT PROTOCOL` rule "Do NOT edit `Sourcera_Master_Spec.md` directly unless the prompt explicitly instructs you to author a remediation"). Master Spec at v7.1.0 unchanged.

---

## 11. Cross-References

- Phase 7 sub-prompt findings: `_audit/PHASE34.1_FINDINGS.md`, `_audit/PHASE_CONS_FINDINGS.md`, `_audit/PHASE34.8_FINDINGS.md`, `_audit/PHASE34.16_FINDINGS.md`, `_audit/PHASE34.19_FINDINGS.md`, `_audit/PHASE34.PXC_FINDINGS.md`.
- Defect ledger: `_audit/DEFECT_LEDGER.md` — D-V7-001..010 promoted under this prompt's mnemonic; cross-linked to D-CONS-001 / D-CONS-002 / D-CONS-006 / D-CONS-008 / D-CONS-012 / D-CONS-013 / D-CONS-018 / D-PT-005 / D-34.19-006 / D-34.19-010 / D-34.19-011 / D-34.19-018 / D-V6-001 / D-6.1-001.
- Coverage matrix: `_audit/COVERAGE_MATRIX.md` — cells updated per §9 above.
- Forward-references:
  - **Phase 8 (APIs, Webhooks, Notifications, Events, Error Codes)** — BLOCKED by D-CONS-001 + D-CONS-002 (P0; pricing/billing). Phase 8 advancement requires composite remediation per §5.2 above. Phase 8 will inherit D-V7-002 (wallet state enum + error code), D-V7-003 (contest rate-limit error code + DSAR deadlock resolution), D-V7-008 (wallet read scope error code).
  - **Phase 7.7 (deferred §34.4 / §34.7 / §34.9 / §34.12 / §34.13 walk)** — recommended before v7.1.1 stamps. V7 cannot certify §34 walk-completeness without this sub-prompt running.
  - **Phase 10 (UX, Accessibility, i18n, Mobile, Performance — §3, §37, §38, §44)** — inherits §44 walk-completeness obligation; D-V7-005 (Solo-specific microcopy) cross-cuts to design layer.
  - **v7.1.1 stamp gate** — inherits the entire D-V7-* cluster for ratification/closure: D-V7-001 (compounding with D-CONS-001), D-V7-002 (wallet state enum), D-V7-003 (contest rate-limit + DSAR deadlock), D-V7-004 (Solo transition rows + per-eval mid-flight), D-V7-005 (microcopy), D-V7-006 (Enterprise dissolution), D-V7-007 (per-console commit), D-V7-008 (wallet read scope), D-V7-009 (hard-archive contradiction), D-V7-010 (per-console auto-renewal).
- **Cross-cutting v7.1.1 sweep recommendation.** A contest-rate-limit + DSAR-vs-contest deadlock-resolution sweep is recommended across §34.11.2, §6.8, §32.4 (analogous to the V6 §1.3 webhook-audience-redaction sweep). Authored Extension ratification + Counsel sign-off required.

---

## 12. Sign-Off Summary

| Criterion | Pre-remediation status | Post-remediation status (2026-05-07) |
|---|---|---|
| Phase 7 sub-prompt structural coverage of §34 | PASS (with §34.4 / §34.7 / §34.9 / §34.12-partial / §34.13 caveat) | PASS (caveat unchanged; recommend Phase 7.7 walk before v7.1.1 stamp) |
| Phase 7 sub-prompt structural coverage of §44 | CAVEAT — §44.1–§44.5 + §44.6.2 / §44.6.6 sampled-only (Phase 10 inheritor) | CAVEAT (unchanged; bound to Phase 10) |
| Adversarial Check 1 (worst-case AIOperation) | FAIL — D-CONS-001 P0 confirmed reproducible; D-V7-001/002/003 NEW P1s | **PASS (post-remediation)** — D-CONS-001 + D-V7-001 + D-V7-002 + D-V7-003 all transitioned `open → remediated` (see Phase 7 V7 Spec-Side Remediation Pass in DEFECT_LEDGER.md) |
| Adversarial Check 2 (Solo → Free downgrade) | FAIL on determinism — D-V7-009 NEW P1; D-V7-004 NEW P1; D-V7-005 NEW P2 | **PASS (post-remediation)** — D-V7-004 / D-V7-005 / D-V7-009 transitioned `open → remediated` |
| Adversarial Check 3 (Enterprise pooled wallet) | FAIL on determinism — D-V7-006 NEW P1; D-V7-007/008/010 NEW P2s | **PASS (post-remediation)** — D-V7-006 / D-V7-007 / D-V7-008 / D-V7-010 transitioned `open → remediated` |
| Halt-rule: zero P0 in pricing/billing | **FAIL** — D-CONS-001 (open) + D-CONS-002 (open) | **PASS** — D-CONS-001 + D-CONS-002 transitioned `open → remediated` |
| **Phase 7 production-readiness sign-off** | **FAIL** | **PASS (post-remediation)** |

**Pre-remediation determination (2026-05-07 14:00 UTC).** Phase 7 did NOT sign off. Two open P0 pricing/billing findings (D-CONS-001 cost-base publish-gating threshold contradiction; D-CONS-002 settlement-immutability contradiction) violated billing/settlement contracts. V7 surfaced ten net-new defects (5 P1, 5 P2 after self-challenge severity revision). All twelve defects (2 P0 + 10 D-V7-*) were halt-rule blockers or v7.1.1 stamp-gate inheritors.

**Post-remediation determination (2026-05-07 16:00 UTC — same-day spec-side remediation pass).** All twelve defects transitioned `open → remediated` in the Phase 7 V7 Spec-Side Remediation Pass (`DEFECT_LEDGER.md`); spec edits landed against `Sourcera_Master_Spec.md` v7.1.0 (pre-edit backup at `/_versions/Sourcera_Master_Spec.v7.1.0-pre-V7-remediation-2026-05-07.md`). Halt rule "zero P0 in pricing/billing" now PASSES. Phase 7 sign-off: **PASS**. Audit advances to Phase 8.

**Authored Extensions queued for v7.1.1 stamp-gate ratification.** AE-V7-01 through AE-V7-10, registered in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase 7 V7 section. Ratification dependencies:

- **Counsel sign-off** required for AE-V7-02 (Ops Emergency Reversal Protocol — customer-notification carve-outs) and AE-V7-05 (DSAR-vs-contest deadlock-resolution rule).
- **Sales Ops + Counsel sign-off** required for AE-V7-08 (Enterprise partial-dissolution path).
- **Finance + Ops Finance sign-off** required for AE-V7-10 (10-year cold-storage retention; storage-cost projections).
- **Design sign-off** recommended for AE-V7-07 (Solo-bordering microcopy elements).
- **Founder + Ops Finance sign-off** for the remaining (AE-V7-01, AE-V7-03, AE-V7-04, AE-V7-06, AE-V7-09).

**Pending v7.1.1 stamp-gate work (NOT halt-rule blockers).**

- Appendix C / G / I / J / M.5 catalog updates per the Phase 7 V7 Spec-Side Remediation Pass cross-spec impact list in DEFECT_LEDGER.md.
- §M.5 runtime wiring for the 9 new CI gates introduced in this pass — bundled into the Phase 14.18.1 implementation wave (M02.3 / M11.3 / M21.3 / M24.3 packs per `Build_Execution_Strategy.md` §11).
- Phase 7.7 walk of §34.4 / §34.7 / §34.9 / §34.12-partial / §34.13 (sampled-only sub-sections) — recommended before v7.1.1 stamps but does not block Phase 8 advancement.
- Phase 10 §44.1–§44.5 + §44.6.2 / §44.6.6 walk completeness (already scoped to Phase 10).
