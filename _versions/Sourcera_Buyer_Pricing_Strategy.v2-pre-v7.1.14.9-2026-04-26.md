# Sourcera Pricing Strategy (v2)

**Status:** Active recommendation
**Supersedes:** v1 (per-feature outcome pricing)
**Last updated:** 2026-04-13

---

## 1. Executive Summary

Sourcera sells into a new category — software evaluation marketplace — with multi-stakeholder buying teams and no existing budget line. The pricing model must (a) get inside the org with zero friction, (b) be understood in 30 seconds, (c) never lose money on AI cost spikes, and (d) hit ≥90% blended gross margin at steady state.

The v2 model is a **three-plan, per-organization, AI-budget-included** structure:

- **Free** — full platform, unlimited seats, tiny AI budget. Real product, not a demo.
- **Business** — three sub-tiers (Starter / Growth / Scale), unlimited seats, bundled monthly AI budget in dollars-of-value, all features included except enterprise controls.
- **Enterprise** — custom contract, committed AI spend, SSO/SCIM/residency/CSM, volume discount on overage.

AI consumption is metered internally using outcome-based accounting (accept = value price, reject = cost price) so margin is structurally protected whether usage is included-budget or wallet overage. Customers never see per-op pricing unless they opt into wallet overage. Storage, requirements, workspaces, and other structural resources are **never** metered per unit — only soft-capped by plan.

Per-seat pricing is explicitly rejected. Procurement is cross-functional (Finance, Legal, Security, IT, end users) and seat taxes kill participation — exactly the behavior Sourcera needs to avoid.

---

## 2. Strategic Decisions

### 2.1 Per-seat vs per-organization
**Decision: Per-organization flat pricing. Unlimited seats on every paid tier.**

Rationale:
- Sourcera's value depends on getting Legal, Security, Finance, IT, and requesters into the same evaluation. A per-seat tax suppresses exactly the collaboration the product needs.
- Procurement budgets are centralized; a single org-level line item closes faster than a seat negotiation.
- Differentiator vs Gartner/G2/Vendr-style competitors who either charge per user or per contract reviewed.
- Margin is protected at the AI layer, not the seat layer, so seat count is irrelevant to cost base.

### 2.2 Per-feature toggles vs bundled plans
**Decision: Bundled. No per-feature admin toggles as a pricing surface.**

Admins still have feature flags for governance, but they are not a billing lever. Customers buy a plan, get everything in it.

### 2.3 Per-unit metering on structural resources
**Decision: Rejected.** Storage, requirements, workspaces, documents, vendors, and users are **never** priced per unit. They have tier ceilings for packaging purposes only. Metering structural resources punishes the usage Sourcera needs to encourage.

### 2.4 Outcome-based pricing
**Decision: Preserved as the internal accounting model, hidden from the buyer by default.**

Every AI operation is metered at one of two prices: an **accepted-value price** (10× cost) or a **rejected-cost price** (1.05× cost). Customers see a single number: "AI budget used this month." Outcome accounting runs underneath to guarantee ≥88% margin even on bad-output months, and it becomes visible only when a customer opts into wallet overage or Enterprise volume commits.

### 2.5 API plan
**Decision: Not a standalone plan. Offered as a $99/mo add-on on any Business tier; included in Enterprise.**

A standalone API plan competes with Anthropic/OpenAI directly and commoditizes Sourcera. As an add-on it monetizes power users without repositioning the product.

### 2.6 Margin protection mechanism
**Decision: Cost-multiplier formula, re-evaluated quarterly.**

Value price for any AI operation = `cost_base × 10`. Rejected-op price = `cost_base × 1.05`. When Anthropic pricing moves, the multiplier holds and the underlying cost_base updates. Included-budget plans are sized so that the worst realistic accept/reject mix still clears 88% margin before CSM and Convex compute.

---

## 3. Plan Architecture at a Glance

| | **Free** | **Business Starter** | **Business Growth** | **Business Scale** | **Enterprise** |
|---|---|---|---|---|---|
| Monthly price (annual) | $0 | $299 | $799 | $1,999 | Custom, $3K/mo floor |
| Monthly price (monthly) | $0 | $349 | $949 | $2,399 | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| Included AI budget (value $) | $5/mo | $50/mo | $300/mo | $800/mo | Committed |
| Active evaluations | 1 | 5 | 20 | Unlimited | Unlimited |
| Vendors tracked | 25 | 250 | 2,500 | Unlimited | Unlimited |
| Document storage | 1 GB | 25 GB | 250 GB | 2 TB | Custom |
| Knowledge base items | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| Integrations | Core only | All | All | All | All + custom |
| SSO / SCIM | — | — | — | — | ✅ |
| IP allowlist / data residency | — | — | — | — | ✅ |
| Audit export / DPA | — | Standard | Standard | Standard | Custom |
| Wallet overage | — | Optional | Optional | Optional | Volume-discounted |
| API add-on | — | $99/mo | $99/mo | $99/mo | Included |
| CSM | — | — | — | Shared | Dedicated |
| Support | Community | Email | Email + chat | Priority | Priority + SLA |
| Vendor response to invited bids | Free forever | Free forever | Free forever | Free forever | Free forever |
| Vendor Pro Trial Seats (grant to invited vendors) | — | — | — | 5/mo | 15/mo |

**Vendor response to an invited bid is always free, on every plan.** Published Seller Profile is free from day one (see `Sourcera_Seller_Pricing_Strategy.md`). Proactive seller discovery, KB automation beyond the lifetime-free bootstrap, outbound EOIs, and revenue-ops integrations are monetized through Seller plans.

**Buyer-Funded Pro Trial Seat (M17).** Scale and Enterprise buyers receive a monthly pool of Vendor Pro Trial Seats. When the buyer invites a vendor, the invite can optionally grant that vendor a 30-day Seller Starter trial — free to the vendor, cost absorbed into the buyer's plan. AI usage during the trial is metered to the vendor's Org AI budget (not the buyer's). Trial auto-downgrades to Seller Free on day 31 with 90-day read-only data preservation. Designed to maximize response quality on the buyer's highest-stakes evaluations while lifting seller-side conversion rate at the highest-leverage PLG moment.

---

## 4. Free Plan — `$0`

The Free plan is the top of the PLG funnel and is a real, usable product — not a demo.

**Included:**
- Full buyer console, 13-phase pipeline, dual-console architecture
- Unlimited seats
- 1 active evaluation at a time
- Up to 25 vendors tracked, 1 GB storage, 50 KB items
- Core integrations (Google/Microsoft SSO login, Slack notifications, CSV import/export)
- **$5/mo AI budget** — enough for ~10 Pre-Scoring runs or ~1,200 KB suggestions or ~120 requirement extractions
- Community support, public docs

**Not included:**
- Enterprise controls (SSO/SCIM/residency)
- Wallet overage (hard cap at $5 — no bill-shock path on Free)
- API access
- Advanced capabilities that require Opus-tier spend (Policy Parsing, Deep Comparison) — gated, with a clear upgrade CTA when attempted

**Purpose:** Get one evaluation through the pipeline, feel the value, hit the ceiling, upgrade.

---

## 5. Business Plan — Three Sub-tiers

All Business tiers share: unlimited seats, all features, all integrations, outcome-accounted AI budget, optional wallet overage, optional $99/mo API add-on.

### 5.1 Business Starter — `$299/mo annual` / `$349/mo monthly`

- 5 active evaluations
- 250 vendors, 25 GB storage, 1,000 KB items
- **$50/mo AI budget** (value-dollars)
- Email support
- Optional wallet overage (off by default)

**Fit:** Single-team buyer, 1–3 evaluations per quarter, first paid tier after Free conversion.

### 5.2 Business Growth — `$799/mo annual` / `$949/mo monthly`

- 20 active evaluations
- 2,500 vendors, 250 GB storage, 10,000 KB items
- **$300/mo AI budget**
- Email + chat support
- Optional wallet overage

**Fit:** Mid-market buyer, procurement function emerging, running multiple parallel evaluations.

### 5.3 Business Scale — `$1,999/mo annual` / `$2,399/mo monthly`

- Unlimited active evaluations
- Unlimited vendors, 2 TB storage, unlimited KB
- **$800/mo AI budget**
- Shared CSM, priority support
- Optional wallet overage with preferred rate (5% off overage)

**Fit:** Org-wide procurement function, the upper bound of self-serve before an Enterprise contract makes sense.

---

## 6. Enterprise Plan — Custom, `$3,000/mo` floor

- All Scale features
- SSO, SCIM, IP allowlist, data residency, custom DPA, audit export API
- Dedicated CSM, onboarding, quarterly business review
- Committed annual AI spend (minimum $12K/yr value-dollar commit)
- Volume discount on overage: 10% at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+
- API access included
- SLA: 99.9% uptime, 4-hour critical response
- Custom integrations (Coupa, Ariba, ServiceNow, NetSuite) scoped per contract

**Gate:** Enterprise is only sold when one of {SSO required, DPA required, >$12K AI commit, custom integration} is present. Otherwise the customer belongs on Business Scale.

---

## 7. Overage Pricing (Wallet)

Wallet overage is **off by default on every plan**. An admin must explicitly enable it and set a monthly spend cap. This is the only point where per-op pricing surfaces to the customer.

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
| ...(full 21-capability rate card in appendix) | | | |

**Spend caps:**
- Hard cap stops ops; soft cap (80%) emails admin + owner.
- Auto-topup available but never enabled by default.
- Daily, weekly, and monthly caps supported independently.

**Outcome accounting (the invisible margin protector):**
- Every op resolves to `accepted` or `rejected` based on capability-specific signals (user acceptance click, retention in output, downstream use within N days).
- Accepted ops bill at value price; rejected at cost price. Both feed the same budget counter.
- Customer sees one number. Sourcera sees the margin protection.

---

## 8. API Access Add-On — `$99/mo`

- Available on any Business tier, included in Enterprise.
- Exposes evaluation, scoring, vendor, and KB APIs. **Does not** expose raw LLM passthrough — API calls still consume the plan's AI budget at the same outcome-accounted rates.
- Rate-limited by tier: Starter 60 req/min, Growth 300 req/min, Scale 1,200 req/min.
- Webhook egress included.
- Positioned as the integration plane, not an AI reseller plane.

---

## 9. Required Platform Features (Engineering Requirements)

To run this model, the platform must ship the following before the pricing model goes live:

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

---

## 10. PLG Motion

The paid path is:

1. **Signup (Free)** — Google/MS SSO, no credit card. 60 seconds to first evaluation.
2. **Aha moment (Free)** — first Pre-Scoring run across 3+ vendors. This is where the $5 budget is designed to be spent.
3. **Ceiling hit (Free → Starter)** — one of: evaluation limit, budget limit, vendor limit, or Opus-gated capability. Upgrade CTA is contextual, not generic.
4. **Expansion (Starter → Growth → Scale)** — driven by active evaluations and AI budget utilization; Growth upsell at 80% budget utilization for 2 consecutive months.
5. **Enterprise trigger** — any of {SSO request, DPA request, $12K+ projected AI spend, custom integration} routes to founder-led sale.

**Leading indicators (trackable solo):**
- Free → Starter conversion %
- Days to first Pre-Scoring on Free
- % of Free accounts hitting AI budget ceiling
- Starter → Growth expansion % at month 3
- Wallet opt-in % on Business tiers
- Rejected-op rate per capability (product quality signal)
- Blended margin per plan

---

## 11. Cost Adaptability

**Mechanism:** Published rate card is a function, not a constant.

- `value_price[op] = max(base_price[op], cost_base[op] × 10)`
- `cost_price[op] = max(min_cost_price[op], cost_base[op] × 1.05)`
- `cost_base[op]` is re-derived nightly from actual Anthropic billing + Convex compute allocation.
- Included budgets in plans are denominated in **value dollars**, not tokens. If Anthropic raises prices 30%, the value-dollar budget still buys the same amount of value but fewer tokens underneath — Sourcera absorbs zero.
- Customers see stable pricing month to month because they see value dollars, not tokens.
- Quarterly rate-card review; changes announced 30 days in advance with grandfathering on annual contracts.

---

## 12. Financial Scenarios

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

### Blended target mix (Year 1 exit state)

- 60% Starter / 25% Growth / 10% Scale / 5% Enterprise
- Blended gross margin target: **≥90%**
- Achieved by keeping Enterprise <10% of accounts until CSM motion is templatized.

---

## 13. Migration from Current Spec

Current spec (Master Spec §34.1–34.8) defines Free / Business $499/mo / Enterprise with token-denominated budgets and $0.01/1K token overage. Deltas:

| Area | Current | v2 |
|---|---|---|
| Seat model | Per-org | Per-org (unchanged) |
| Plan count | 3 | 5 (Free + 3 Business + Enterprise) |
| Business price | $499/mo | $299 / $799 / $1,999 |
| Budget unit | Tokens | Value dollars |
| Free budget | 50K tokens | $5 |
| Business budget | 500K tokens | $50 / $300 / $800 |
| Enterprise budget | 5M tokens | Committed |
| Overage | $0.01/1K tokens | Per-op value/cost prices |
| Wallet | Not specified | Required, off by default |
| Outcome accounting | Not present | Required |
| API | Not separated | $99 add-on |
| Structural metering | Tiered | Tiered (unchanged — no per-unit) |

**Spec sections to update:** §10.8 (plan tiers), §10.7 (AI capability catalog — add accepted/rejected price columns), §21.4–21.5 (capability catalog), §34 (billing), new §34.9 (AI Wallet), new §34.10 (Outcome Resolver).

**Customer migration:** existing Business customers grandfather into Growth at current $499 price for 12 months; prompted to re-plan at renewal.

---

## 14. Positioning and Messaging

**Headline:** *Evaluate software the way your best buyer would — without the seat tax.*

**One-liner:** Sourcera is a software evaluation marketplace with an AI co-pilot. Bring your whole buying team for free. Pay only for the AI work you use.

**Three pillars:**
1. **Unlimited seats, always.** Procurement is a team sport. We don't tax it.
2. **AI priced in dollars of value, not tokens.** Stable month to month. No bill shock.
3. **Vendors are free, forever.** Every vendor you want to evaluate can participate at no cost.

**Anti-positioning:**
- Not a contract repository (vs Vendr, Tropic)
- Not a review site (vs G2, Gartner)
- Not a sourcing agency (vs Sastrify)
- **A marketplace where buyers and sellers meet inside a structured 13-phase evaluation pipeline, with AI doing the tedious parts.**

---

## Appendix A — Full 21-Capability Rate Card

(To be generated from Master Spec §21.4 with cost_base computed per capability at current Anthropic pricing and multiplier applied. Value prices set to `cost_base × 10`, cost prices to `cost_base × 1.05`. Published at `api.sourcera.com/v1/pricing`.)

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
| (...remaining 13 capabilities per spec) | | |

Default on timeout: **rejected**. This biases Sourcera toward cost protection when signal is ambiguous.
