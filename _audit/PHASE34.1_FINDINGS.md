# Phase 34.1 — End-to-End Walk of §34.1 Plan Tier Definitions

**Audit prompt:** "Walk §34.1 end-to-end (buyer + seller plan tiers, including Solo)."
**Run date:** 2026-05-07
**Sections audited:** §34.1.1, §34.1.2, §34.1.3, §34.2.1, §34.2.2, §34.2.5, §34.10.3, §34.12.6
**Reconciliation sources:** Buyer Pricing Strategy v3 (BPS v3), Seller Pricing Strategy v3 (SPS v3), Appendix J Plan Tiers
**Defect mnemonic:** `D-PT-NNN` (Plan-Tier walk)

---

## 1. Cell-by-Cell Reconciliation Summary

### 1.1 Buyer Plan Tiers — §34.1.1 vs BPS v3 §3

| Dimension | §34.1.1 cell pattern | BPS v3 §3 cell pattern | Status |
|---|---|---|---|
| Annual price (Free / Solo / Starter / Growth / Scale / Enterprise) | $0 / $49 / $299 / $799 / $1,999 / Custom $3K floor | $0 / $49 / $299 / $799 / $1,999 / Custom $3K floor | ✅ |
| Monthly price | $0 / $59 / $349 / $949 / $2,399 / — | $0 / $59 / $349 / $949 / $2,399 / — | ✅ (matches §34.2.1) |
| Per-evaluation alternative | — / $199 / — / — / — / — | — / $199 / — / — / — / — | ✅ (numerical home: §34.2.5) |
| Seats | Unlimited × 6 | Unlimited × 6 | ✅ |
| AI Budget | $5 / Engine-absorbed (~$5) / $50 / $300 / $800 / Committed (≥ $12K/yr) | $5/mo / Hidden ($5/mo absorbed) / $50/mo / $300/mo / $800/mo / Committed | ✅ |
| Active Evaluations (concurrent) | 1 / 1 / 5 / 20 / Unlimited / Unlimited | 1 / 1 / 5 / 20 / Unlimited / Unlimited | ✅ |
| Vendors tracked | 25 / Unlimited within 1 eval / 250 / 2,500 / Unlimited / Unlimited | 25 / Unlimited (within 1 eval) / 250 / 2,500 / Unlimited / Unlimited | ✅ |
| Storage | 1 GB / 5 GB / 25 GB / 250 GB / 2 TB / Custom | 1 GB / 5 GB / 25 GB / 250 GB / 2 TB / Custom | ✅ |
| KB Entries | 50 / 50 / 1,000 / 10,000 / Unlimited / Unlimited | 50 / 50 / 1,000 / 10,000 / Unlimited / Unlimited | ✅ |
| Selection Report | Watermarked / Unwatermarked / Unwatermarked × 4 | Watermarked / Unwatermarked × 5 | ✅ |
| Defense View | Watermarked preview / Full × 5 | Preview only / Full × 5 | ✅ |
| API Add-On | — / — / $99/mo / $99/mo / $99/mo / Included | — / — / $99/mo / $99/mo / $99/mo / Included | ✅ |
| Vendor Pro Trial Seats (M17) | — / — / — / — / 5/mo / 15/mo | — / — / — / — / 5/mo / 15/mo | ✅ |
| Default `evaluation_owner_mode` (BPS: "Default surface mode") | `solo` / `solo` / `team` × 4 | Solo Mode / Solo Mode / Team Mode × 4 | ✅ |
| Wallet Overage | — (hard cap $5) / — (engine-absorbed) / Optional × 3 / Volume-discounted | — / — / Optional × 3 / Volume-discounted | ✅ |
| Default User Role | Member (fixed) / Member (fixed) / Configurable × 4 | (no row in BPS §3) | n/a (MS adds detail) |
| Audit Log Retention (UI) | 30d / 30d / 1y / 1y / 3y / 7y | (no row in BPS §3) | n/a (MS adds detail) |
| MFA / SAML SSO / SCIM / IP Allowlist | per row | folded into "SSO/SCIM" + "IP allowlist/data residency" rows in BPS §3 | ✅ (structural decomp; MS more granular) |
| **CSM** (BPS §3 standalone row) | folded into Support row | standalone row: — × 4 / Shared / Dedicated | P3 cosmetic structure mismatch (D-PT-010) |
| **Audit export / DPA** (BPS §3 standalone row) | NO ROW in §34.1.1 | — / — / Standard / Standard / Standard / Custom | **P2 documentation_gap** (D-PT-007) |
| **Integrations** (BPS §3 standalone row) | NO canonical "Core only" / "All" boundary defined | Core only / Core only / All / All / All / All + custom | **P2 documentation_gap** (D-PT-006) |

### 1.2 Seller Plan Tiers — §34.1.2 vs SPS v3 §3

| Dimension | §34.1.2 cell pattern | SPS v3 §3 cell pattern | Status |
|---|---|---|---|
| Annual price | $0 / $49 / $149 / $499 / $1,499 / Custom $3K floor | $0 / $49 / $149 / $499 / $1,499 / Custom $3K floor | ✅ (matches §34.2.2) |
| Monthly price | $0 / $59 / $179 / $599 / $1,799 / — | $0 / $59 / $179 / $599 / $1,799 / — | ✅ |
| Per-bid alternative | — / $199 / — / — / — / — | — / $199 / — / — / — / — | ✅ (numerical home: §34.2.5) |
| AI Budget | $5 (hard cap) / Engine-absorbed (~$5) / $30 / $200 / $600 / Committed (≥ $12K/yr) | $5/mo (hard cap) / Hidden ($5 absorbed) / $30/mo / $200/mo / $600/mo / Committed | ✅ |
| Invited Bids — concurrent | 1 / 1 / 3 / 15 / Unlimited / Unlimited | 1 conc / 1 conc / 3 conc / 15 conc / Unlimited / Unlimited | ✅ |
| Proactive Marketplace EOIs | 0 / 0 / 10/mo / Unlimited / Unlimited / Unlimited | 0 / 0 / 10/mo / Unlimited / Unlimited / Unlimited | ✅ |
| KB Entries | 50 / 250 / 1,000 / 10,000 / Unlimited / Unlimited | 50 / 250 / 1,000 / 10,000 / Unlimited / Unlimited | ✅ |
| Firecrawl Sources | 0 / 1 (weekly) / 2 (weekly) / 10 (daily) / Unlimited (real-time, fair-use ≤ 50 domains) / Unlimited | 0 / 1 (weekly) / 2 (weekly) / 10 (daily) / Unlimited (real-time) / Unlimited | ✅ (MS adds fair-use ≤ 50 domains) |
| **KB Bootstrap (Opus)** | 1 lifetime (M1 promise) / 1 lifetime + 1/yr re-bootstrap / **1/year** / **3/year** / Unlimited / Unlimited | 1 lifetime / 1 lifetime + 1/yr re-bootstrap / **1 lifetime + 1/yr** / **1 lifetime + 3/yr** / Unlimited / Unlimited | **P1 numerical_singleton drift** (D-PT-002) |
| First-Pass RFP Generator | Wallet (Free $5 hard cap) / Engine-absorbed envelope / Wallet × 3 / Committed | Budget only ($5 hard cap) / Engine-absorbed (silent) / Included (visible budget) × 3 / Committed | ✅ (semantically equivalent) |
| SellerSoftware Entities | 1 / 1 / 5 / 25 / Unlimited / Unlimited | 1 / 1 / 5 / 25 / Unlimited / Unlimited | ✅ |
| Capability Declarations | 3 / 3 / 25 / 250 / Unlimited / Unlimited | 3 / 3 / 25 / 250 / Unlimited / Unlimited | ✅ |
| Verification Tier Cap | Basic / Verified eligibility / Verified eligibility / Certified eligibility / Certified / Certified | Basic / Verified (eligible) / Verified / Certified / Certified / Certified | ✅ (MS standardizes "eligibility"; SPS §3 abbreviates) |
| Published Seller Profile | Included × 6 | Published × 6 | ✅ |
| Seller Page Enrichment (Opus) | — / — / 1/year / 3/year / 12/year / Unlimited | — / — / 1/yr / 3/yr / 12/yr / Unlimited | ✅ |
| Match Scoring (numeric) | Labels only × 3 / Included / Included + batch API / Included + batch API | Labels only × 3 / Included / Included / Included | ✅ (MS adds "batch API"; SPS §8 confirms for Scale) |
| Seller Signals | — / — / Monthly category digest / Weekly digest / Weekly + real-time / Real-time + API | — / — / Monthly category digest / Weekly digest / Weekly + real-time / Real-time + API | ✅ |
| **Direct Invite from Cohort (§27.9.8)** | — / — / — / — / Included / Included + API | (no row in SPS §3) | n/a (MS adds detail) |
| CRM Sync | — / — / — / Included / Included + field-map customization / Included + custom RevOps integrations | — / — / — / Included / Included / Included | ✅ (MS adds detail; SPS §7 / §8 confirm narratively) |
| Promoted Marketplace Placements | — × 4 / 1/month (category-capped) / 3/month | — × 4 / 1/mo / 3/mo | ✅ |
| SAML SSO / SCIM | — × 5 / Included | folded into "SSO / SCIM / residency" row (— × 5 / ✓) | ✅ (structural decomp) |
| API Access | — × 4 / Read-only / Read + Write | — × 4 / Read-only / Full | ✅ (semantically equivalent) |
| Audit Log Retention (UI) | 30d / 30d / 1y / 1y / 3y / 7y | (no row in SPS §3) | n/a (MS adds detail) |
| Wallet Overage | — (hard cap $5) / — (engine-absorbed) / Optional × 3 / Volume-discounted | (no row in SPS §3) | n/a (MS adds detail) |
| **CSM** (SPS §3 standalone row) | folded into Support row | standalone row: — × 4 / Shared / Dedicated | P3 cosmetic structure mismatch (D-PT-010) |
| **Custom DPA** | NO ROW in §34.1.2 | implicit in SPS §9 Enterprise list ("custom DPA"); SPS §3 has no Seller-side DPA row | **P2 documentation_gap** (D-PT-008) |

### 1.3 §34.1.3 Cross-References

- Plan tier enum registration in Appendix J `Plan Tiers`. ✅
- Buyer values: `buyer_free`, `buyer_solo`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`. ✅
- Seller values: `seller_free`, `seller_solo`, `seller_starter`, `seller_growth`, `seller_scale`, `seller_enterprise`. ✅
- Buyer side enum naming asymmetry (Free/Solo/Enterprise prefixed `buyer_*`; Starter/Growth/Scale prefixed `business_*`) is documented and intentional per Appendix J Plan Tiers backward-compatibility note. **Not a defect.**
- Solo abbreviations `Bs` (Buyer Solo) and `sSo` (Seller Solo) registered for §39 / Appendix M / §5.11 inline tier lists. ✅
- `solo_tier_numeric_single_source` validator declared. (Already covered upstream.)

### 1.4 §34.2.1 Buyer Pricing Table

All cells reconcile to BPS v3 §3 row 1–3 ✅. Numerical singleton: $199 per-evaluation alternative is co-stated in §34.1.1 footer, §34.2.1, §34.2.5 — by design (single home is §34.1/§34.2). External restatements covered by `solo_tier_numeric_single_source` validator.

### 1.5 §34.2.2 Seller Pricing Table

All cells reconcile to SPS v3 §3 row 1–3 ✅.

### 1.6 §34.2.5 Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration

Buyer-side reconciliation against BPS v3 §5.4:

- Charge amount $199 ✅
- Trigger (PDF export, finalized Selection Record) ✅
- Charge timing (before PDF generation) ✅
- 7-day refund window ✅
- **Refund eligibility threshold: P1 numerical_singleton drift (three-way inconsistency)** — D-PT-001
- Mid-eval subscription conversion credit ✅ (but ambiguous on annual cadence — D-PT-004)
- Failure mode: Stripe charge failure → `*_charge_pending` 24h → `*_charge_abandoned` ✅
- BillingEvent.charge_kind = `solo_per_eval` ✅

Seller-side reconciliation against SPS v3 §5.4:

- Charge amount $199 ✅
- Trigger (Submit Bid, finalized response) ✅
- Charge timing (before submission delivery) ✅
- 7-day refund window ✅
- Refund eligibility (`first_buyer_open_at IS NULL`) ✅
- KB persistence post-charge: 90 days, then read-only ✅
- **"New $199 bid resets the 90-day clock" provision in SPS v3 §5.4 missing from MS §34.2.5** — D-PT-003
- Mid-bid subscription conversion credit ✅ (same annual-cadence ambiguity — D-PT-004)
- BillingEvent.charge_kind = `solo_per_bid` ✅

Cross-cutting orchestration rules audit:
- Subscription → per-eval/per-bid downgrade NOT supported mid-cycle ✅
- Per-eval/per-bid → subscription supported mid-eval/mid-bid with credit ✅
- Stripe idempotency keys keyed on `(workspace_id|bid_workspace_id, charge_kind, charge_attempt_seq)` ✅
- Workspace creation gating: Buyer charges on PDF export, NOT on Workspace creation ✅
- Bid Workspace creation NOT gated; charge fires on Submit ✅
- Solo per-eval/per-bid does NOT pool with Org-level AIWallet ✅
- Subscription Solo charges via standard Stripe subscription mechanism ✅

**FX-rate-locking timestamp not specified for the Solo per-eval/per-bid charge** — Stripe meter event `sourcera_solo_buyer_per_eval_charge` carries `fx_rate_locked` field but the lock-time is implicit, not contracted — D-PT-005

**Payment-method-failed scenarios silent** — §34.2.5 enumerates Stripe charge failure path but does not address the case where the Org's primary payment method is in `payment_failed_grace` (§34.10.4 wallet state). Solo per-eval/per-bid is a separate Stripe charge from wallet, but the cross-state interaction isn't enumerated — D-PT-009

### 1.7 §34.10.3 Pooled Budget Across Consoles

Reconciliation:
- Buyer Free + Seller Free = $5 (collapse rule) ✅ (matches BPS §4 "single ceiling-hit event" / SPS §4 "Hit the ceiling, upgrade" narrative)
- Buyer Solo + Seller Free / Buyer Free + Seller Solo / Buyer Solo + Seller Solo = $0 customer-visible ✅ (Solo-co-resident rule)
- Solo + paid: paid-side budget only (Solo envelope stays engine-side) ✅
- Solo + Enterprise: Enterprise committed pool only ✅
- Solo upgrades / downgrades ✅ (rules #5 / #6)

Solo combination table is illustrative; the prose Solo-co-resident rule covers every paid-paid Solo combination. **Not a defect.** The omission of e.g. "Buyer Solo + Seller Growth" is operationally addressed by rule #3.

Reconciliation against SPS v3 §12 #2 ✅ ("Solo-tier absorbed envelopes do not pool — each Solo console maintains its own absorbed envelope"). Reconciliation against BPS v3 §5.5 (Solo surface discipline) ✅.

### 1.8 §34.12.6 Solo-Tier Per-Console Subscription Billing

Reconciliation against SPS v3 §12 #6:
- Independent Stripe Subscription per `(org_id, console)` ✅ (Phase 14.9 AE)
- No bundled Solo discount: $98/mo for dual-Solo Org ✅
- Cross-console plan changes do not cascade ✅
- Solo does NOT participate in §34.12.5 dual-Enterprise contract collapse ✅
- Single Stripe Customer per `(org_id, legal_entity)` with two Subscriptions ✅
- Per-eval/per-bid charges = independent BillingEvent rows, not Subscription invoices ✅

Acceptance criteria ✅ — three QA tests cited (`solo_dual_console_independent_invoicing`, `solo_plan_change_console_isolation`, `aiwallet_response_excludes_solo_envelope`).

---

## 2. Defects Filed

| Defect ID | Severity | Class | Summary |
|---|---|---|---|
| D-PT-001 | P1 | numerical_singleton | §34.2.5 Buyer Solo refund-open threshold: three-way inconsistency between §34.2.5 prose ("≤ 3 times"), §34.2.5 parenthetical ("< 3 recipients OR < 3 distinct viewer sessions"), §34.1.1 footer ("≤ 3-open check"), and BPS v3 §5.4 ("has not been opened ≥3 times" → eligible at < 3). Off-by-one across documents. |
| D-PT-002 | P1 | numerical_singleton | §34.1.2 KB Bootstrap row drift: MS Starter "1/year" and Growth "3/year" vs SPS v3 §3 Starter "1 lifetime + 1/yr" and Growth "1 lifetime + 3/yr". Year-1 entitlement difference of 1 bootstrap on each tier. |
| D-PT-003 | P2 | documentation_gap | §34.2.5 Seller per-bid orchestration silent on the "New $199 bid resets the 90-day KB-persistence clock" provision present in SPS v3 §5.4. |
| D-PT-004 | P2 | documentation_gap | §34.2.5 mid-eval/mid-bid conversion credit "first month of subscription" undefined on annual billing ($588 invoiced upfront). Engineering cannot tell whether $199 reduces year-1 invoice by $199 or only by $49 (one month's worth of annual). |
| D-PT-005 | P2 | documentation_gap | §34.2.5 FX-rate-locking timestamp for Solo per-eval/per-bid charges not specified. Stripe meter event includes `fx_rate_locked` field per §34.10.5 but the lock-time (charge-capture vs. settlement vs. retry) is implicit. |
| D-PT-006 | P2 | documentation_gap | BPS v3 §3 row "Integrations" (Free/Solo "Core only" vs Starter+ "All" vs Enterprise "All + custom") is not operationalized in §34.1.1. The boundary between "Core only" and "All" has no canonical definition. |
| D-PT-007 | P2 | documentation_gap | BPS v3 §3 row "Audit export/DPA" (— / — / Standard / Standard / Standard / Custom) has no mirror row in §34.1.1. MS §34.1.1 "Audit Log Retention (UI)" is a different concept (UI retention, not DPA / audit-export entitlement). |
| D-PT-008 | P2 | documentation_gap | §34.1.2 has no row for "Custom DPA" or "Audit Export API" entitlement. SPS v3 §9 Enterprise list includes "custom DPA" but Seller-side DPA tier-stepping is undefined; mirrors D-PT-007 on the Seller side. |
| D-PT-009 | P2 | documentation_gap | §34.2.5 cross-cutting orchestration silent on payment-method-failure interactions. If Org's primary payment method is in `payment_failed_grace` (§34.10.4) and a Solo per-eval/per-bid charge fires, the interaction is undefined. |
| D-PT-010 | P3 | consistency_drift | §34.1.1 / §34.1.2 fold "CSM" entitlement into the "Support" row, while BPS v3 §3 / SPS v3 §3 split them. Cosmetic structural mismatch. |

---

## 3. Self-Challenge Pass

**Re-reviewing each defect as a hostile reviewer:**

- **D-PT-001 (P1).** Evidence: lines 28803, 28804 of Master Spec, §34.1.1 footer line 28684, BPS v3 §5.4 lines 186–187. Reproducible by grepping `≤ 3` and `< 3` in the same row. Severity P1 because the off-by-one affects the boundary at exactly 3 opens — a junior engineer building the refund-eligibility check would ship one of two implementations and could be wrong by 1 case. Recommendation: pick one canonical reading (recommend `< 3` to align with BPS v3 §5.4 and §34.2.5 parenthetical, since "Beyond 3 opens" judgment-call wording supports < 3 = automated, ≥ 3 = judgment, no limbo case). **Confirmed P1.**

- **D-PT-002 (P1).** Evidence: §34.1.2 line 28699 cell `1/year` for `seller_starter`, `3/year` for `seller_growth`. SPS v3 §3 line 116 cell `1 lifetime + 1/yr` for Starter, `1 lifetime + 3/yr` for Growth. SPS v3 §6 (Starter) explicitly says "1 re-Bootstrap per year" — implies 1 lifetime PLUS 1/yr (the §6 list also separately mentions "1 lifetime KB Bootstrap" via the universal M1 promise in SPS §4). MS reads "1/year" without the lifetime prefix. **Year-1 entitlement difference of 1 bootstrap.** Confirmed P1 — billing-impacting (KB Bootstrap is a $200-cost Opus capability per §34.3.4; double-charging or under-delivering by 1 invocation is material). Recommendation: standardize MS §34.1.2 cells to "1 lifetime + 1/year (Starter)" / "1 lifetime + 3/year (Growth)" and verify that the M1 lifetime promise applies to all paid tiers (not just Free / Solo). If the lifetime promise was intentionally restricted to Free / Solo (i.e., paid tiers only get the per-year allowance and not the lifetime), then SPS v3 needs to be corrected to remove the "1 lifetime +" prefix on Starter / Growth.

- **D-PT-003 (P2).** Evidence: SPS v3 §5.4 line 220 "New $199 bid resets the 90-day clock." MS §34.2.5 KB persistence row says "for 90 days from bid submission" without the reset-on-new-bid provision. **Confirmed P2 documentation_gap.** A seller who submits a second per-bid $199 charge during an existing 90-day window would expect their previous KB above the Free 50-cap to be preserved indefinitely (rolling), but MS reads as if the 90-day window is fixed per submission. Engineering would build the wrong behavior. Recommendation: add a row to the §34.2.5 Seller table: "KB persistence reset on new charge | A new $199 per-bid charge resets the 90-day KB-persistence clock; entries above the Free 50-cap that were within the prior window remain accessible at the 250-cap Solo ceiling for 90 days from the new charge | SPS §5.4".

- **D-PT-004 (P2).** Evidence: §34.2.5 cells "Mid-eval subscription conversion | If operator converts to subscription mid-evaluation after charge, $199 credits against first month of subscription (no refund)" — for both Buyer and Seller sides. Solo annual subscription is $588 (12 × $49) invoiced once. If "first month of subscription" applies on annual cadence, does it mean "the entire annual period invoiced" or "$49 of the $588"? Practically, the customer would expect the full $199 to credit against the annual invoice. **Confirmed P2.** Recommendation: clarify by adding a footnote: "On annual billing, the $199 credit applies against the annual invoice in full; on monthly billing, the credit applies against the first month's invoice with the residual rolling forward to subsequent months." Authored Extension flag if the rolling-forward design is novel.

- **D-PT-005 (P2).** Evidence: §34.10.5 Stripe meter event row for `sourcera_solo_buyer_per_eval_charge` includes `fx_rate_locked` field but no specification of when the lock fires. Operational ambiguity for EU-residency customers with Solo subscriptions. **Confirmed P2.** Recommendation: extend §34.2.5 cross-cutting rule #3 (Stripe idempotency) with: "FX rate is locked at charge-capture time (PDF generation success for Buyer, submission delivery success for Seller); the locked rate persists across retries within the 24h `*_charge_pending` window."

- **D-PT-006 (P2).** Evidence: BPS v3 §3 row "Integrations" cells: "Core only" / "Core only" / "All" / "All" / "All" / "All + custom". MS §34.1.1 has rows for API Add-On, API Keys, Webhook Endpoints, Custom Integrations — but no canonical "Core" boundary. BPS v3 §4 ("Core integrations: Google/Microsoft SSO login, Slack notifications, CSV import/export") provides a partial list but it's a Free-plan list, not a "what's in Core only vs. All on Starter+" boundary. **Confirmed P2.** Recommendation: either (a) add a row to §34.1.1 enumerating the integration set per tier, or (b) author an §34.1 narrative footnote pointing to the canonical integration catalog (likely Master Spec §31.9 CRM Sync + §32 API + §31 webhooks).

- **D-PT-007 (P2).** Evidence: BPS v3 §3 row "Audit export/DPA" cells: — / — / Standard / Standard / Standard / Custom. MS §34.1.1 has "Audit Log Retention (UI)" with values 30d / 30d / 1y / 1y / 3y / 7y — different concept. "Audit export" suggests programmatic export (likely a §32 API endpoint). "DPA" (Data Processing Agreement) is a contractual artifact, not a per-tier feature in MS. **Confirmed P2.** The Enterprise-level "audit export API" in BPS v3 §7 implies an Enterprise-only programmatic-export feature with no §34.1.1 row. Recommendation: add §34.1.1 row "Audit Export API" with values — / — / — / — / — / Included; add §34.1.1 row "Custom DPA" with values — / — / — / — / — / Included (or reframe BPS v3 §3 "Standard" to clarify what Standard DPA terms cover for Business+ tiers).

- **D-PT-008 (P2).** Same finding on Seller side. SPS v3 §9 Enterprise lists "custom DPA"; SPS §3 has no DPA row at all. MS §34.1.2 has no DPA row. **Confirmed P2.** Same recommendation as D-PT-007 mirrored to §34.1.2.

- **D-PT-009 (P2).** Evidence: §34.2.5 cross-cutting rule #6 "Solo per-eval/per-bid charge fires while Solo subscription is also active" addressed. But §34.2.5 is silent on: Solo per-eval/per-bid charge attempts while wallet is in `payment_failed_grace` (§34.10.4). Solo doesn't use a wallet, but the underlying Stripe Customer payment method may be in failed-grace from another billing surface (Business+ wallet, Solo subscription, etc.). **Confirmed P2.** Recommendation: extend §34.12.8 Cross-Side Billing Failure Modes with a row: "Solo per-eval/per-bid charge attempted while Org's primary payment method is in `payment_failed_grace`. Resolved: Stripe charge attempt fails with HTTP 402 `payment_method_failed_grace_blocking_charge`; Workspace/Bid Workspace remains in `*_charge_pending` state for ≤ 24h (consistent with Stripe-charge-fails resolution); customer must update payment method via standard wallet recovery flow before retry."

- **D-PT-010 (P3).** Evidence: BPS v3 §3 / SPS v3 §3 split CSM and Support. MS §34.1.1 / §34.1.2 fold them. Cosmetic. **Confirmed P3** — does not affect implementation since the Support cell value enumerates the CSM tier ("Priority + Shared CSM" / "Priority + Dedicated CSM + QBR + SLA"). Recommendation: optional split, low priority.

**Self-challenge revisions:** All 10 defects survive hostile review at filed severity. No demotions or promotions.

---

## 4. Counterfactual Pass — Failure Modes for §34.1 / §34.2 / §34.10.3 / §34.12.6

For each Solo billing surface, three realistic failure modes:

### 4.1 Buyer Solo per-eval

1. **Operator exports PDF, Stripe charge succeeds, PDF fails to render.** §34.2.5 cell "Charge timing | Stripe charge captured **before** PDF generation; PDF returned only on successful capture" — but doesn't explicitly say what happens if charge succeeds and PDF generation then fails. ✅ Implicit: PDF retry within session. **Acceptable; not filing.**
2. **Operator pays $199, then immediately downgrades to Free.** §34.10.3 #6 covers Solo→Free; the per-eval charge is settled, so downgrade does not refund. ✅ Addressed.
3. **Operator on per-eval pricing converts to annual subscription mid-eval; $199 credit ambiguous on annual cadence.** ❌ D-PT-004.

### 4.2 Seller Solo per-bid

1. **Seller submits two bids in same 90-day window.** ❌ D-PT-003 (90-day clock reset behavior unclear).
2. **Seller submits bid, Stripe charge succeeds, submission delivery fails (network error).** §34.2.5 cell "Stripe charge captured **before** submission delivery to buyer; submission delivered only on successful capture" — implies submission retry. ✅ Implicit; not filing.
3. **Seller's $199 refund is requested on day 7, processed on day 9, buyer opens on day 8.** §34.12.8 #7 covers this ("refund eligibility computed at refund-request time"). ✅ Addressed.

### 4.3 Cross-console Solo

1. **Buyer Solo + Seller Solo Org changes residency mid-cycle.** §34.12.8 #2 covers Enterprise residency; Solo case implicit (single Stripe Customer per `(org_id, legal_entity)` per §34.12.6 #6 means residency change creates new Customer). **Edge case partially addressed; not filing.**
2. **Solo on one console + Enterprise on the other; Enterprise contract minimum is $3K/mo subscription.** §34.10.3 #4 + §34.12.8 #5 cover this. ✅ Addressed.
3. **Solo per-eval/per-bid charge while Org's primary payment method is in `payment_failed_grace`.** ❌ D-PT-009.

### 4.4 Plan tier enum migration

1. **v6.0.0 Org with `plan_tier = business` migrates to v7.x.** Appendix J Plan Tiers backward-compat block addresses ✅.
2. **Org currently on `business_starter` aliased to `buyer_solo` during Phase 14.4–14.6 forward-reference period.** Phase 14.9 retired the alias (Appendix J + §34.1.3). ✅ Addressed.
3. **Org on Solo tries to invoke a capability gated to `business_starter+` (e.g., Policy Parsing Opus capability).** §34.1.1 cell "Policy Ingestion (Opus capability) | Free Allowance + Wallet | Free Allowance + Engine-absorbed envelope" — Solo gets the same Free Allowance + envelope path as Free. The §34.8 entitlement matrix governs the rejection if the engine envelope is exhausted. ✅ Addressed.

**Counterfactual pass yields no new defects beyond those filed.** The Solo billing surface has well-considered orchestration; the gaps are at the seams (D-PT-003, D-PT-004, D-PT-005, D-PT-009).

---

## 5. Promotion to DEFECT_LEDGER.md

10 defects promoted (D-PT-001 through D-PT-010). Coverage matrix cell updates are minimal — §34.1 walk does not introduce new feature_id rows; it audits existing ones.
