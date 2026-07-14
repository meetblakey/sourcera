# Sourcera Buyer Pricing Strategy (v3)

**Status:** Active recommendation
**Supersedes:** v2 (introduced outcome-based AI accounting + three-Business-tier structure)
**Last updated:** 2026-04-26
**v3 changeset:** Added the **Buyer Solo tier** ($49/mo annual / $59/mo monthly OR $199/eval one-time) as the personal-card on-ramp between Free and Business Starter — the surface for **Buyer Maya**, the first-time evaluation owner introduced as the v7.1.0 buyer-side surface persona. AI consumption is invisible to Solo-tier users (cost absorbed within a $5/mo or $5/eval value envelope; engine throttles silently if approached). Solo unlocks the unwatermarked Selection Report and the new **Defense View** (Master Spec §13.X). Free now ships with a watermarked Selection Report and a preview-only Defense View. Updated plan-architecture table, §1 executive summary, PLG paid path (now Free → Solo → Starter → Growth → Scale → Enterprise), Financial Scenarios (added Solo scenario D), and Migration delta. All numerical limits remain authoritative in this document until Master Spec §34.1, §5.11, §39, and Appendix J absorb them under the v7.1 integration program (Phase 14.9 — Master Spec scaffolding edit pending).

---

## 1. Executive Summary

Sourcera sells into a new category — Software Evaluation Platform — with multi-stakeholder buying teams and no existing budget line. The pricing model must (a) get inside the org with zero friction, (b) be understood in 30 seconds, (c) never lose money on AI cost spikes, and (d) hit ≥90% blended gross margin at steady state.

The v3 model is a **six-plan, per-organization, AI-budget-included** structure with a per-evaluation alternative on the on-ramp:

- **Free** — full platform, unlimited seats, $5/mo AI budget, **watermarked Selection Report**, **Defense View preview** only. Real product, not a demo.
- **Solo** *(new in v3)* — personal-card on-ramp for **Buyer Maya**, the first-time evaluation owner. Single active eval, full Solo Mode surface (Master Spec §2.X), **unwatermarked Selection Report and Defense View**. AI consumption invisible (cost absorbed). $49/mo annual or $59/mo monthly subscription, **or** $199 per completed evaluation.
- **Business** — three sub-tiers (Starter / Growth / Scale), unlimited seats, bundled monthly AI budget in value-dollars, all features except enterprise controls.
- **Enterprise** — custom contract, committed AI spend, SSO/SCIM/residency/CSM, volume discount on overage.

AI consumption is metered internally using outcome-based accounting (accept = value price, reject = cost price) so margin is structurally protected whether usage is included-budget or wallet overage. Customers on Business+ never see per-op pricing unless they opt into wallet overage. **On Solo, AI consumption is hidden from the user surface entirely; the engine throttles low-priority background capabilities silently rather than exposing wallet or overage UI to a personal-card buyer** (Master Spec §44.X Solo-Tier Surface Treatment, in line with Principle 9 — Surface Simplicity, Engine Complexity, Master Spec §3.X). Storage, requirements, workspaces, and other structural resources are **never** metered per unit — only soft-capped by plan.

Per-seat pricing is explicitly rejected. Procurement is cross-functional (Finance, Legal, Security, IT, end users) and seat taxes kill participation — exactly the behavior Sourcera needs to avoid.

---

## 2. Strategic Decisions

### 2.1 Per-seat vs per-organization
**Decision: Per-organization flat pricing. Unlimited seats on every paid tier (Solo through Enterprise).**

Rationale:
- Sourcera's value depends on getting Legal, Security, Finance, IT, and requesters into the same evaluation. A per-seat tax suppresses exactly the collaboration the product needs.
- Procurement budgets are centralized; a single org-level line item closes faster than a seat negotiation.
- Differentiator vs Gartner/G2/Vendr-style competitors who either charge per user or per contract reviewed.
- Margin is protected at the AI layer, not the seat layer, so seat count is irrelevant to cost base.
- **Solo retains unlimited seats** even though it is single-operator-by-default. The operator can invite stakeholders contextually inside an evaluation, which transitions the surface for that eval to Team Mode. Charging per-seat at Solo would defeat the on-ramp and contradict Principle 9 — the surface gets simpler, not more billable, when stakeholders enter.

### 2.2 Per-feature toggles vs bundled plans
**Decision: Bundled. No per-feature admin toggles as a pricing surface.**

Admins still have feature flags for governance, but they are not a billing lever. Customers buy a plan, get everything in it.

### 2.3 Per-unit metering on structural resources
**Decision: Rejected.** Storage, requirements, workspaces, documents, vendors, and users are **never** priced per unit. They have tier ceilings for packaging purposes only. Metering structural resources punishes the usage Sourcera needs to encourage.

### 2.4 Outcome-based pricing
**Decision: Preserved as the internal accounting model, hidden from the buyer by default.**

Every AI operation is metered at one of two prices: an **accepted-value price** (10× cost) or a **rejected-cost price** (1.05× cost). On Business+ tiers, customers see a single number: "AI budget used this month." On **Solo**, even that number is hidden — the operator sees only their plan line item ($49/mo or $199/eval). Outcome accounting still runs underneath on Solo to guarantee ≥88% margin, with silent throttling of low-priority capabilities if the absorbed envelope (default $5 value/mo or $5 per eval) is approached. Wallet overage UI never surfaces on Solo; if the operator routinely approaches the envelope, the upgrade trigger to Starter fires (per §11).

### 2.5 API plan
**Decision: Not a standalone plan. Offered as a $99/mo add-on on any Business tier; included in Enterprise. Not available on Solo.**

A standalone API plan competes with Anthropic/OpenAI directly and commoditizes Sourcera. As an add-on it monetizes power users without repositioning the product. Solo is a personal-card single-eval surface — API access is not a fit.

### 2.6 Margin protection mechanism
**Decision: Cost-multiplier formula, re-evaluated quarterly.**

Value price for any AI operation = `cost_base × 10`. Rejected-op price = `cost_base × 1.05`. When Anthropic pricing moves, the multiplier holds and the underlying cost_base updates. Included-budget plans are sized so that the worst realistic accept/reject mix still clears 88% margin before CSM and Convex compute. **Solo's absorbed envelope is sized identically to Free's $5 AI budget** — the engine guarantee carries; the surface just hides it. The throttling logic protects margin without exposing the operator to bill-shock or rate-card complexity.

### 2.7 Solo tier — the personal-card on-ramp *(new in v3)*
**Decision: Introduce a Solo tier between Free and Business Starter, priced at $49/mo annual / $59/mo monthly OR $199 per completed evaluation.**

Rationale:
- The v7.1 buyer-side surface persona is **Buyer Maya** — the first-time evaluation owner inheriting a $200K–$2M software decision with a 4-week deadline. She does not have org procurement-tool budget on day one. She has a personal credit card and a CFO who will approve a small per-evaluation expense for "the tool that produced the recommendation."
- Free is too constrained to defend the recommendation to leadership (watermarked Selection Report, Defense View preview only, $5 AI budget exhausts mid-evaluation for many requirement sets).
- Business Starter at $299/mo is an org procurement-tool purchase, not a personal-card purchase. Solo bridges the gap.
- The per-evaluation $199 alternative matches Buyer Maya's mental model ("I have one project, I need one outcome") and is CFO-friendly because it is a known fixed expense booked to a specific deal, not a recurring SaaS line item.
- Solo's expansion path to Business Starter is contextual: second concurrent eval, multi-stakeholder invitation (Team Mode triggered beyond 2 stakeholders), or sustained AI-envelope pressure.

### 2.8 Solo tier — invisible AI consumption *(new in v3)*
**Decision: Hide AIOperation metering, value-dollars, wallet, overage, and rate card from the Solo-tier surface entirely.**

The engine continues to meter every AIOp at value or cost rate for accounting and margin protection. The Solo operator sees one number: "Plan: Solo · $49/mo" or "Eval billed: $199 paid 2026-04-26." Throttling fires silently if the absorbed envelope is approached, surfacing only "Some background suggestions paused — your active workflow is unaffected." Per Principle 9 (Master Spec §3.X), surfacing complexity is a defect; on Solo, the entire AI consumption surface is engine-only and lives behind Appendix M (Surface/Engine Mapping).

---

## 3. Plan Architecture at a Glance

| | **Free** | **Solo** | **Business Starter** | **Business Growth** | **Business Scale** | **Enterprise** |
|---|---|---|---|---|---|---|
| Monthly price (annual) | $0 | $49 | $299 | $799 | $1,999 | Custom, $3K/mo floor |
| Monthly price (monthly) | $0 | $59 | $349 | $949 | $2,399 | — |
| Per-evaluation alternative | — | **$199** | — | — | — | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| Included AI budget (value $) | $5/mo | **Hidden ($5/mo absorbed)** | $50/mo | $300/mo | $800/mo | Committed |
| Active evaluations | 1 | 1 | 5 | 20 | Unlimited | Unlimited |
| Default surface mode | Solo Mode | Solo Mode | Team Mode | Team Mode | Team Mode | Team Mode |
| Vendors tracked | 25 | Unlimited (within 1 eval) | 250 | 2,500 | Unlimited | Unlimited |
| Document storage | 1 GB | 5 GB | 25 GB | 250 GB | 2 TB | Custom |
| Knowledge base items | 50 | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| Selection Report | **Watermarked** | **Unwatermarked** | Unwatermarked | Unwatermarked | Unwatermarked | Unwatermarked |
| Defense View | **Preview only** | **Full** | Full | Full | Full | Full |
| Integrations | Core only | Core only | All | All | All | All + custom |
| SSO / SCIM | — | — | — | — | — | ✅ |
| IP allowlist / data residency | — | — | — | — | — | ✅ |
| Audit export / DPA | — | — | Standard | Standard | Standard | Custom |
| Wallet overage | — | — | Optional | Optional | Optional | Volume-discounted |
| API add-on | — | — | $99/mo | $99/mo | $99/mo | Included |
| CSM | — | — | — | — | Shared | Dedicated |
| Support | Community | Community | Email | Email + chat | Priority | Priority + SLA |
| Vendor response to invited bids | Free forever | Free forever | Free forever | Free forever | Free forever | Free forever |
| Vendor Pro Trial Seats (grant to invited vendors) | — | — | — | — | 5/mo | 15/mo |

**Vendor response to an invited bid is always free, on every plan.** Published Seller Profile is free from day one (see `Sourcera_Seller_Pricing_Strategy.md`). Proactive seller discovery, KB automation beyond the lifetime-free bootstrap, outbound EOIs, and revenue-ops integrations are monetized through Seller plans.

**Buyer-Funded Pro Trial Seat (M17).** Scale and Enterprise buyers receive a monthly pool of Vendor Pro Trial Seats. When the buyer invites a vendor, the invite can optionally grant that vendor a 30-day Seller Starter trial — free to the vendor, cost absorbed into the buyer's plan. AI usage during the trial is metered to the vendor's Org AI budget (not the buyer's). Trial auto-downgrades to Seller Free on day 31 with 90-day read-only data preservation. Designed to maximize response quality on the buyer's highest-stakes evaluations while lifting seller-side conversion rate at the highest-leverage PLG moment.

---

## 4. Free Plan — `$0`

The Free plan is the top of the PLG funnel and is a real, usable product — not a demo.

**Included:**
- Full buyer console, 13-phase pipeline (rendered as the 4-step Setup → Define → Score → Decide compressed surface in Solo Mode per Master Spec §3.X), dual-console architecture
- Unlimited seats
- 1 active evaluation at a time
- Up to 25 vendors tracked, 1 GB storage, 50 KB items
- Core integrations (Google/Microsoft SSO login, Slack notifications, CSV import/export)
- **$5/mo AI budget** — enough for ~10 Pre-Scoring runs or ~1,200 KB suggestions or ~120 requirement extractions
- **Watermarked Selection Report** — PDF carries a "Generated on Sourcera Free" footer and a reduced sharing-permissions banner suitable for internal review but visibly marked for any external audience
- **Defense View preview** — recommendation and the single highest-weighted reason are visible; risks, evidence, and CFO summary are gated with a Solo-upgrade CTA inline
- Community support, public docs

**Not included:**
- Unwatermarked Selection Report and full Defense View (Solo+)
- Enterprise controls (SSO/SCIM/residency)
- Wallet overage (hard cap at $5 — no bill-shock path on Free)
- API access
- Advanced capabilities that require Opus-tier spend (Policy Parsing, Deep Comparison) — gated, with a clear upgrade CTA when attempted

**Purpose:** Get one evaluation through the pipeline, feel the value, hit the ceiling (eval count, vendor count, AI budget, watermark, Defense View preview wall, or Opus capability), upgrade to Solo or Starter.

---

## 5. Buyer Solo Plan — `$49/mo annual` / `$59/mo monthly` OR `$199/eval`

The Solo plan is the personal-card on-ramp for **Buyer Maya** — the first-time evaluation owner who needs to defend a software recommendation to leadership without org procurement-tool budget. Solo Mode is the default surface (Master Spec §2.X); the operator is single-operator-by-default and can invite stakeholders contextually inside an evaluation, which transitions the surface to Team Mode for the duration of that eval.

### 5.1 Pricing options

Two billing structures, operator's choice:

- **Subscription:** $49/mo billed annually (~$588/yr) or $59/mo billed monthly. Auto-renews; cancellable at any time.
- **Per evaluation:** $199 charged on Selection Report PDF export. No subscription, no auto-renew. Operator pays once per completed eval. Charged after the Selection Record is finalized — no charge if the eval is abandoned before recommendation.

The per-evaluation option matches Buyer Maya's CFO-friendly fixed-expense mental model. The subscription option is for operators who anticipate ≥3 evaluations within 12 months. The two paths share one entitlement set; an operator can convert from per-eval to subscription mid-evaluation with the $199 already paid credited against the first month.

### 5.2 Included

- Full buyer console; full Solo Mode surface (4-step compressed pipeline)
- Unlimited seats (single-operator default; stakeholder invites optional and contextual)
- 1 active evaluation at a time (subscription) or 1 evaluation per $199 charge (per-eval)
- **Unlimited vendors within the active evaluation** (vs Free's 25)
- 5 GB storage
- 50 KB items (Free ceiling preserved — Solo's value is the eval surface, not the KB)
- Core integrations (same as Free)
- **AI consumption invisible.** Cost absorbed against a $5 value/mo envelope (subscription) or $5 per eval (one-time). Engine throttles low-priority background capabilities silently if envelope is approached. Operator never sees value-dollars, wallet UI, rate card, or per-op pricing.
- **Unwatermarked Selection Report** — full PDF export with no Sourcera branding constraints, suitable for any audience including external stakeholders, board members, and auditors.
- **Full Defense View** — recommendation, top reasons, material risks, evidence, one-page CFO summary, Print/Export PDF action. Cached for the operator and regenerated only on Selection Record mutation.
- 90-day post-eval read-only retention
- Community support

### 5.3 Not included (Solo → Starter upgrade triggers)

The following ceilings exist to surface the right upgrade moment for Buyer Maya:

- **Second concurrent evaluation.** Solo allows 1 active eval at a time. A second eval triggers the upgrade CTA: *"Starter unlocks 5 concurrent evaluations and shares your stakeholder list across them."*
- **Multi-stakeholder invitation beyond 2 stakeholders.** Inviting 1–2 stakeholders is allowed on Solo and transitions that eval to Team Mode for the duration. Inviting more than 2 stakeholders to a single eval, or inviting stakeholders to multiple parallel evals, triggers the upgrade CTA: *"Starter unlocks unlimited stakeholder invitations and the full Team Mode surface across every eval."*
- **Sustained AI-envelope pressure.** If the engine throttles low-priority capabilities ≥3 times in a 30-day window (subscription) or hits envelope on a single eval (per-eval), the upgrade CTA fires: *"Starter unlocks $50/mo of visible AI budget and lifts background-suggestion limits."*
- **Opus-tier capabilities.** Policy Parsing and Deep Comparison remain gated to Business+ — Solo is not a power-user surface.
- **Enterprise controls** (SSO/SCIM/residency, custom DPA, audit export API). Solo is personal-card; enterprise controls require an org contract.
- **API access.** Not available on Solo. Add-on starts at Business Starter ($99/mo).
- **Wallet overage.** Solo has no overage UI; the engine guarantees the absorbed envelope and triggers upgrade if exceeded.
- **Vendor Pro Trial Seats.** Solo cannot grant Pro Trial seats to invited vendors; that lever begins at Business Scale.

### 5.4 Per-evaluation billing mechanics

The $199 per-evaluation charge fires on Selection Report PDF export. Specifics:

- **Trigger.** Operator clicks "Export Selection Report PDF" with a finalized Selection Record. Stripe charge is captured; PDF is generated and delivered.
- **No subscription.** No recurring charge. The operator's account remains Free-tier between charges, with the eval read-only (90-day retention).
- **Subsequent evals.** Each new eval re-triggers the $199 charge on its Selection Report export. Operators who anticipate ≥3 evals/yr typically convert to the $49/mo subscription.
- **Refund window.** 7-day refund window from charge, no questions asked, provided the Selection Report PDF has not been opened ≥3 times. After 3 opens, refund is judgment-call (operator support).
- **Defense View included.** The $199 charge unlocks both the unwatermarked Selection Report and the full Defense View for that evaluation. Defense View remains accessible for the full 90-day retention.
- **Mid-eval conversion.** If the operator converts to subscription mid-evaluation after charging, the $199 is credited against the first month of subscription, not refunded.

### 5.5 Surface discipline (per Principle 9)

The Solo surface intentionally hides every engine concept that does not require operator judgment. Specifically not surfaced on Solo:

- AIOperation accepted/rejected accounting
- Value-dollars / cost-dollars rate card
- Wallet, overage, auto-topup
- Per-capability spend breakdown
- Plan tier matrix (Solo operator sees only their plan; tier names appear only at upgrade-CTA moments)
- 13-phase pipeline (rendered as the 4-step Setup → Define → Score → Decide compressed surface)
- SLA timers and Pulse Health Score (replaced with single deadline countdown + "what to do this week" panel)
- Stakeholder cohort taxonomy (auto-assigned from email-domain heuristics on invite)

Cross-reference: Master Spec Appendix M (Surface/Engine Mapping) is the canonical contract.

### 5.6 Fit

- A first-time evaluation owner (Buyer Maya) inheriting a $200K–$2M software decision, with a 4-week deadline, no prior eval methodology, and personal career exposure to a wrong recommendation.
- An IT Director, InfoSec Lead, or Operations Lead at a 200–2,000-person company who needs a defensible Selection Report and Defense View to take into a leadership meeting.
- A consultant or fractional procurement operator running a single eval for a client and billing the $199 as a pass-through expense.

### 5.7 Anti-fit

- Multi-eval mid-market procurement teams → Business Starter or Growth.
- Org-budget-funded SaaS purchases with multi-stakeholder approval requirements above 2 invitees → Business Starter or higher.
- Power users needing Policy Parsing, Deep Comparison, or API access → Business+.
- Regulated-vertical buyers requiring SSO, custom DPA, or data residency → Enterprise.

---

## 6. Business Plan — Three Sub-tiers

*(Was §5 in v2; renumbered for v3.)*

All Business tiers share: unlimited seats, all features, all integrations, outcome-accounted AI budget, optional wallet overage, optional $99/mo API add-on. Default surface mode is Team Mode (visible 13-phase breadcrumb, full multi-stakeholder cohort UI, full SLA + Pulse Health Score surface).

### 6.1 Business Starter — `$299/mo annual` / `$349/mo monthly`

- 5 active evaluations
- 250 vendors, 25 GB storage, 1,000 KB items
- **$50/mo AI budget** (value-dollars, visible)
- Email support
- Optional wallet overage (off by default)

**Fit:** Single-team buyer, 1–3 evaluations per quarter, first paid org-budget tier after Solo or Free conversion.

### 6.2 Business Growth — `$799/mo annual` / `$949/mo monthly`

- 20 active evaluations
- 2,500 vendors, 250 GB storage, 10,000 KB items
- **$300/mo AI budget**
- Email + chat support
- Optional wallet overage

**Fit:** Mid-market buyer, procurement function emerging, running multiple parallel evaluations.

### 6.3 Business Scale — `$1,999/mo annual` / `$2,399/mo monthly`

- Unlimited active evaluations
- Unlimited vendors, 2 TB storage, unlimited KB
- **$800/mo AI budget**
- Shared CSM, priority support
- Optional wallet overage with preferred rate (5% off overage)
- 5/mo Vendor Pro Trial Seats (M17)

**Fit:** Org-wide procurement function, the upper bound of self-serve before an Enterprise contract makes sense.

---

## 7. Enterprise Plan — Custom, `$3,000/mo` floor

*(Was §6 in v2; renumbered for v3.)*

- All Scale features
- SSO, SCIM, IP allowlist, data residency, custom DPA, audit export API
- Dedicated CSM, onboarding, quarterly business review
- Committed annual AI spend (minimum $12K/yr value-dollar commit)
- Volume discount on overage: 10% at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+
- API access included
- SLA: 99.9% uptime, 4-hour critical response
- Custom integrations (Coupa, Ariba, ServiceNow, NetSuite) scoped per contract
- 15/mo Vendor Pro Trial Seats (M17)

**Gate:** Enterprise is only sold when one of {SSO required, DPA required, >$12K AI commit, custom integration} is present. Otherwise the customer belongs on Business Scale.

---

## 8. Overage Pricing (Wallet)

*(Was §7 in v2; renumbered for v3. Wallet is a Business+ feature; never surfaces on Solo.)*

Wallet overage is **off by default on every Business+ plan**. An admin must explicitly enable it and set a monthly spend cap. This is the only point where per-op pricing surfaces to the Business+ customer. **Solo never sees a wallet** — see §2.8.

**How it works:**
- Customer sets a wallet balance and a monthly cap (e.g., $500/mo cap).
- When monthly included budget is exhausted, further AI ops consume from wallet at the same outcome-accounted rates used internally.
- Rate card (per-op value prices, published transparently):

| Capability | Model | Accepted (value) | Rejected (cost) |
|---|---|---|---|
| Pre-Scoring | Sonnet | $0.50 | $0.06 |
| Requirement Extraction | Sonnet | $0.40 | $0.05 |
| KB Suggestion | Haiku | $0.03 | $0.004 |
| Vendor Summary | Haiku | $0.08 | $0.010 |
| Policy Parsing | Opus | $25.00 | $3.50 |
| Deep Comparison | Opus | $12.00 | $1.60 |
| Response Drafting | Sonnet | $0.80 | $0.10 |
| Stakeholder Summary | Sonnet | $1.20 | $0.15 |
| **Defense View Generate** *(new in v3)* | Sonnet | $0.80 | $0.10 |
| ...(full 22-capability rate card in appendix) | | | |

**Spend caps:**
- Hard cap stops ops; soft cap (80%) emails admin + owner.
- Auto-topup available but never enabled by default.
- Daily, weekly, and monthly caps supported independently.

**Outcome accounting (the invisible margin protector):**
- Every op resolves to `accepted` or `rejected` based on capability-specific signals (user acceptance click, retention in output, downstream use within N days).
- Accepted ops bill at value price; rejected at cost price. Both feed the same budget counter.
- Customer sees one number. Sourcera sees the margin protection.

---

## 9. API Access Add-On — `$99/mo`

*(Was §8 in v2; renumbered for v3.)*

- Available on any Business tier, included in Enterprise. **Not available on Solo.**
- Exposes evaluation, scoring, vendor, and KB APIs. **Does not** expose raw LLM passthrough — API calls still consume the plan's AI budget at the same outcome-accounted rates.
- Rate-limited by tier: Starter 60 req/min, Growth 300 req/min, Scale 1,200 req/min.
- Webhook egress included.
- Positioned as the integration plane, not an AI reseller plane.

---

## 10. Required Platform Features (Engineering Requirements)

*(Was §9 in v2; renumbered and extended for v3.)*

To run this model, the platform must ship the following before the v3 pricing model goes live:

1. **AI Wallet service** — org-level wallet with included-budget counter, overage counter, daily/weekly/monthly caps, auto-topup, balance API.
2. **Outcome resolver** — every AI op resolves to accepted/rejected within a defined window; signals defined per capability; fallback to rejected on timeout.
3. **Cost-base recalculation job** — nightly job that re-derives per-op cost_base from actual token spend; alerts on drift >10%.
4. **Spend cap enforcement** — hard block, not soft block; surfaced in UI with clear upgrade/topup CTAs.
5. **Budget notifications** — 50%, 80%, 100% email + in-app; owner + billing admin on distribution.
6. **Usage dashboard** — per-capability spend, acceptance rate, top consumers, trend vs prior 3 months. PLG instrument — also used internally for expansion scoring.
7. **Payment gating** — evaluation creation, KB enable, policy parsing, and Opus-tier ops all check wallet balance + cap before executing.
8. **Downgrade-safe state** — when a customer downgrades or Free-trial expires, data is preserved read-only; no destructive deletion for 90 days.
9. **Audit log of billing events** — enable/disable overage, cap changes, topups, plan changes, all SOC-2-grade.
10. **Rate card publisher** — public JSON rate card at `api.sourcera.com/v1/pricing` so customers can forecast.
11. **Solo-tier billing surface** *(new in v3)* — single-card "Plan: Solo · $49/mo" or "Eval billed: $199 paid 2026-04-26" view; no wallet, no rate card, no per-op breakdown. Throttling notification surface for the rare absorbed-envelope-exceeded case ("Some background suggestions paused — your active workflow is unaffected.").
12. **Per-evaluation Stripe charge orchestration** *(new in v3)* — fire $199 charge on Selection Report PDF export; 7-day refund window logic with open-count check; 90-day read-only retention post-charge; mid-eval conversion crediting.
13. **Selection Report watermarking** *(new in v3)* — Free tier watermarks PDF and reduces sharing permissions; Solo+ produces unwatermarked output. Watermark applied at server-render time; cannot be stripped client-side.
14. **Defense View preview gating** *(new in v3)* — Free tier renders recommendation + 1 top reason; Solo+ unlocks the full four-section view.
15. **Solo-tier silent throttling** *(new in v3)* — engine throttles capabilities tagged `low_priority_background` (proactive Cmd+K Marketplace surfacing, weekly KB refresh suggestions, vendor-page enrichment polling) when the Solo absorbed envelope reaches ≥80%; surfaces single notification, no per-capability detail. The throttling state clears at the start of each billing cycle (subscription) or on a new $199 charge (per-eval).

---

## 11. PLG Motion

*(Was §10 in v2; renumbered and extended for v3 with the Solo on-ramp.)*

The paid path is:

1. **Signup (Free)** — Google/MS SSO, no credit card. 60 seconds to first evaluation. Buyer Maya enters here via SEO ("how to evaluate a CRM"), community engagement (r/sysadmin, r/cybersecurity, Pavilion), or LinkedIn DM (per `GTM_SALES_PLAYBOOK.md`).
2. **Aha moment (Free)** — first Pre-Scoring run across 3+ vendors. This is where the $5 budget is designed to be spent.
3. **First ceiling (Free → Solo or Starter)** — three triggers, three different upgrade paths:
   - Watermarked Selection Report or Defense View preview hits the operator's leadership-meeting moment → **Solo** (*"Unlock the full Defense View and an unwatermarked Selection Report for $49/mo or $199/eval"*). This is the dominant Buyer Maya conversion path.
   - Eval limit, vendor limit, $5 AI budget exhaustion, or Opus-gated capability for an operator who already anticipates multiple evals → **Business Starter** (*"Starter unlocks 5 concurrent evaluations, $50/mo of visible AI budget, and Policy Parsing"*).
   - Multi-stakeholder invitation beyond 2 invitees → **Business Starter** or above (Team Mode beyond 2 stakeholders is a Starter+ surface).
4. **Solo expansion (Solo → Starter)** — three triggers per §5.3:
   - Second concurrent eval.
   - Sustained AI-envelope throttling ≥3 times in 30 days (subscription) or per-eval envelope hit (per-eval).
   - More than 2 stakeholders invited per eval, or stakeholders invited across multiple evals.
5. **Business expansion (Starter → Growth → Scale)** — driven by active evaluations and AI budget utilization; Growth upsell at 80% budget utilization for 2 consecutive months.
6. **Enterprise trigger** — any of {SSO request, DPA request, $12K+ projected AI spend, custom integration} routes to founder-led sale.

**Leading indicators (trackable solo by founder):**

- Free → Solo conversion %
- Free → Starter conversion % (direct, skipping Solo)
- Solo subscription → Starter conversion % at 90 days
- Solo per-eval ($199) repeat-purchase rate within 12 months
- Days to first Pre-Scoring on Free
- % of Free accounts hitting AI budget ceiling
- % of Free accounts hitting Defense View preview wall (drives Solo conversion)
- % of Free accounts that export a watermarked Selection Report (signals leadership-meeting moment)
- Starter → Growth expansion % at month 3
- Wallet opt-in % on Business tiers
- Rejected-op rate per capability (product quality signal)
- Solo-tier silent-throttle event rate (margin protection signal; should remain <5% of Solo accounts in any 30-day window)
- Blended margin per plan, including Solo subscription and Solo per-eval as separate cohorts

---

## 12. Cost Adaptability

*(Was §11 in v2; renumbered for v3. Mechanics unchanged; Solo-specific note added.)*

**Mechanism:** Published rate card is a function, not a constant.

- `value_price[op] = max(base_price[op], cost_base[op] × 10)`
- `cost_price[op] = max(min_cost_price[op], cost_base[op] × 1.05)`
- `cost_base[op]` is re-derived nightly from actual Anthropic billing + Convex compute allocation.
- Included budgets in Business+ plans are denominated in **value dollars**, not tokens. If Anthropic raises prices 30%, the value-dollar budget still buys the same amount of value but fewer tokens underneath — Sourcera absorbs zero.
- **Solo's absorbed envelope is denominated in value-dollars and adapts identically.** If Anthropic prices move, Sourcera silently adjusts the throttling threshold; the operator's $49/mo or $199/eval price holds. The throttle event rate becomes the leading indicator that envelope sizing needs adjustment.
- Customers see stable pricing month to month because they see value dollars (Business+) or a fixed line item (Solo), not tokens.
- Quarterly rate-card review; changes announced 30 days in advance with grandfathering on annual contracts.

---

## 13. Financial Scenarios

*(Was §12 in v2; renumbered and extended for v3 with a Solo scenario D.)*

Assumptions: Anthropic mid-2025 pricing; Convex compute ≈ 3% of AI cost; CSM loaded only on Scale (shared) and Enterprise (dedicated).

### Scenario A — 100 Starter customers
- ARR: 100 × $299 × 12 = **$358,800**
- AI cost at full $50 value-budget utilization, 70% accept / 30% reject mix: ~$5.40/customer/mo
- AI COGS: 100 × $5.40 × 12 = $6,480
- Convex + infra: ~$7,200
- **Gross margin: ~96.2%** (no CSM on Starter)

### Scenario B — 30 Growth customers
- ARR: 30 × $799 × 12 = **$287,640**
- AI COGS at $300 budget, 70/30 mix: ~$32.40/customer/mo × 30 × 12 = $11,664
- Infra: $4,320
- **Gross margin: ~94.4%**

### Scenario C — 10 Scale + 5 Enterprise
- Scale ARR: 10 × $1,999 × 12 = $239,880
- Enterprise ARR (avg $5K/mo + $20K committed AI): 5 × $80K = $400,000
- Scale AI COGS: $86.40 × 10 × 12 = $10,368
- Scale CSM (shared, 0.1 FTE/customer @ $120K loaded): $120,000
- Enterprise AI COGS at commit: $20K × 5 × 0.11 = $11,000 (89% margin on committed value)
- Enterprise CSM (dedicated, 0.25 FTE @ $180K loaded): $225,000
- Total revenue: $639,880; total direct cost: ~$366,368
- **Blended gross margin: ~42.8%** — this is why Enterprise is gated; below $12K AI commit the CSM load kills margin. The $3K/mo floor and committed AI exist to defend this.

### Scenario D — Solo tier mixed cohort *(new in v3)*

A representative Year-1 Solo cohort with both subscription and per-eval transactions:

- 200 Solo subscribers × $49 × 12 = **$117,600**
- 800 Solo per-eval transactions × $199 = **$159,200**
- Total Solo revenue: **$276,800**
- AI COGS:
  - Subscription: 200 × $0.54/mo absorbed (full $5 envelope at 70/30 mix) × 12 = $1,296
  - Per-eval: 800 × $0.54 absorbed = $432
  - Total: $1,728
- Stripe processing (subscription 200 × 12 × ($49 × 2.9% + $0.30) ≈ $4,130; per-eval 800 × ($199 × 2.9% + $0.30) ≈ $4,857): ~$9,000
- Infra: ~$3,500
- Refund reserve (5% of per-eval volume): ~$7,960
- Total direct cost: ~$22,188
- **Gross margin: ~92.0%** (no CSM on Solo, low-touch support)

Solo is not the highest-revenue tier on a per-account basis, but it is a high-margin on-ramp that converts Free into paid at a price point that fits a personal card. The strategic value is conversion volume into Starter and downstream tiers, not standalone Solo ARR.

### Blended target mix (Year 1 exit state, v3)

- 35% Solo subscription / 25% Solo per-eval / 20% Business Starter / 12% Business Growth / 6% Business Scale / 2% Enterprise
- Blended gross margin target: **≥90%**
- The v2 mix (60% Starter / 25% Growth / 10% Scale / 5% Enterprise) shifts in v3 toward the Solo on-ramp because Buyer Maya is the v7.1 surface persona — most Free converts will land on Solo first, with a subset graduating to Starter as their org standardizes on Sourcera.
- Enterprise is deliberately kept <5% of accounts until CSM motion is templatized; Solo's 92% margin offsets Enterprise CSM drag.

---

## 14. Migration from v2

*(Was §13 in v2; rewritten for v3 to capture the Solo / surface-abstraction deltas.)*

**v2 → v3 deltas:**

| Area | v2 | v3 |
|---|---|---|
| Plan count | 5 (Free + 3 Business + Enterprise) | 6 (Free + Solo + 3 Business + Enterprise) |
| Solo tier | — | $49/mo annual / $59/mo monthly OR $199/eval |
| Free Selection Report | Unwatermarked | **Watermarked** |
| Free Defense View | (Defense View did not exist in v2) | Preview only (recommendation + 1 reason) |
| Solo Selection Report | — | **Unwatermarked** |
| Solo Defense View | — | Full |
| Solo AI consumption surface | — | **Hidden** (cost absorbed; engine throttles silently) |
| Default surface mode | Implicit Team Mode for all paid tiers | **Explicit Solo Mode for Free + Solo; Team Mode for Business+** |
| PLG paid path | Free → Starter → Growth → Scale → Enterprise | Free → **Solo** → Starter → Growth → Scale → Enterprise |
| Outcome accounting | Visible on Business+ wallet overage | Visible on Business+; **engine-only on Solo** |
| Rate card length | 21 capabilities | **22 capabilities** (Defense View Generate added) |

**Spec sections to update (Phase 14.9 — Master Spec scaffolding edit, pending):**
- Master Spec §10.8 (plan tiers) — register Solo
- Master Spec §10.7 / §21.4–21.5 (capability catalog) — add Defense View Generate
- Master Spec §34 (billing) — extend
- Master Spec §34.9 (AI Wallet) — note Solo absorbed-envelope behavior
- Master Spec §34.10 (Outcome Resolver) — confirm Solo signals route to engine-only metering
- Master Spec **§34.X (new) — Solo-tier billing surface**
- Master Spec **§34.Y (new) — Per-evaluation charge orchestration**
- Master Spec §39 (object size constraints) — add Solo row
- Master Spec **§44.X (new) — Solo-Tier Surface Treatment** (engine-only AI consumption + silent throttling)
- Master Spec §5.11 (Feature Access Matrix) — Solo row across all features
- Master Spec Appendix J — register `solo` plan tier value
- Master Spec Appendix M — add rows for Solo billing surface, watermarking, Defense View preview

**Customer migration:** Existing Free customers receive an in-app announcement of the Solo tier with a 90-day Solo trial offer (no credit card; auto-downgrades to Free at trial end). Existing Business customers are unaffected — no tier changes, no price changes. Selection Reports generated under v2 retain their unwatermarked status (grandfathered); v3 watermarking applies to new Free-tier exports only.

---

## 15. Positioning and Messaging

*(Was §14 in v2; renumbered and extended for v3 with Solo-tier messaging.)*

**Headline:** *Evaluate software the way your best buyer would — without the seat tax.*

**One-liner:** Sourcera is a Software Evaluation Platform with an AI co-pilot. Bring your whole buying team for free. Pay only for the AI work you use — or pay $199 once for a single defensible recommendation.

**Three pillars:**
1. **Unlimited seats, always.** Procurement is a team sport. We don't tax it.
2. **AI priced in dollars of value, not tokens.** Stable month to month. No bill shock. Personal-card on-ramp at $49/mo or $199/eval.
3. **Vendors are free, forever.** Every vendor you want to evaluate can participate at no cost.

**Solo-tier positioning (Buyer Maya):**
- *"Your first software evaluation, defended."*
- *"$199 once. Unwatermarked Selection Report. Defense View ready for the leadership meeting."*
- Aimed at first-time evaluation owners, IT/InfoSec/Ops leads, fractional procurement, consultants running a single eval for a client.

**Anti-positioning:**
- Not a contract repository (vs Vendr, Tropic)
- Not a review site (vs G2, Gartner)
- Not a sourcing agency (vs Sastrify)
- **A Software Evaluation Platform where buyers and sellers meet inside a structured 13-phase evaluation pipeline (rendered as a 4-step Setup → Define → Score → Decide compressed surface for first-time owners), with AI doing the tedious parts.**

---

## Appendix A — Full 22-Capability Rate Card

*(Updated from v2's 21-capability list — Defense View Generate added in v3.)*

To be generated from Master Spec §21.4 with cost_base computed per capability at current Anthropic pricing and multiplier applied. Value prices set to `cost_base × 10`, cost prices to `cost_base × 1.05`. Published at `api.sourcera.com/v1/pricing`. **Solo accounts continue to consume capabilities from their absorbed envelope; the rate card is engineering-transparent, never operator-facing.**

## Appendix B — Outcome Signals per Capability

| Capability | Accepted signal | Window |
|---|---|---|
| Pre-Scoring | User confirms or edits ≤20% of score | 7 days |
| Requirement Extraction | Requirement retained in final spec | 14 days |
| KB Suggestion | User clicks "use" or content appears in artifact | 7 days |
| Vendor Summary | Summary retained unchanged ≥80% | 7 days |
| Policy Parsing | Parsed policy retained and used in ≥1 evaluation | 30 days |
| Deep Comparison | Exported, shared, or linked from artifact | 14 days |
| Response Drafting | Sent or retained ≥70% unchanged | 7 days |
| Stakeholder Summary | Shared externally or retained in final report | 14 days |
| **Defense View Generate** *(new in v3)* | Operator opens the view at least once before recommendation is presented to leadership | 90 days |
| (...remaining 13 capabilities per spec) | | |

Default on timeout: **rejected**. This biases Sourcera toward cost protection when signal is ambiguous.
