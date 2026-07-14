# Sourcera Seller Pricing Strategy (v2)

**Status:** Active recommendation
**Companion doc:** `Sourcera_Buyer_Pricing_Strategy.md`
**Last updated:** 2026-04-14

---

## 0. What This Document Decides

The buyer-side pricing doc intentionally left the seller side as "Vendor console free forever." That statement is correct as a **participation promise** but wrong as a **monetization strategy**. Sellers are the highest-leverage AI consumers on the platform — KB automation, First-Pass RFP Response, Page Enrichment, and outbound Marketplace discovery are all expensive, high-value AI surfaces that the buyer-side plan does not cover.

This document defines the seller-side pricing model: what stays free, what gets monetized, how it maps to the same outcome-based accounting framework as the buyer side, and how it exploits the strongest PLG moment in the product — the forced vendor signup triggered by an incoming buyer invite — to drive paid conversion without sacrificing the M1 supply-side growth loop.

---

## 1. The Core Principle — Invited Participation Is Free; Leverage Is Paid

The promise "vendors are free forever" is narrowed — precisely — to the single mechanism that drives the supply-side growth engine:

> **A vendor invited to a specific evaluation can always respond in full, for free, to that invitation.**

Everything else is fair game for monetization:

| Surface | Monetization stance |
|---|---|
| Responding to an invited bid (end-to-end) | **Free forever** |
| Basic Seller Profile + **Published Seller Profile** | **Free forever** (maximizes Marketplace inventory day one) |
| Basic verification | **Free forever** |
| Browsing the Marketplace | **Free forever** |
| Proactive outbound (EOIs, Capability Declarations beyond 3, Promoted listings) | **Paid** |
| KB automation (Firecrawl crawling, Bootstrap beyond the first, Staleness) | **Paid** |
| First-Pass RFP Response Generator | **Free-budget-included, then paid** |
| Seller Page Enrichment (public surfaces) | **Paid** |
| Match Scoring numeric access | **Paid (Growth+)** |
| Seller Signals digests | **Paid** |
| CRM Sync | **Paid (Growth+)** |
| Multi-bid parallelism | **Paid (tier-gated)** |

The free tier must let a vendor answer a single buyer's RFP, manually **or with AI assistance**, start to finish — no artificial blocks, no forced upgrade at response time. That is the supply engine. Once the vendor has tasted Sourcera once, every additional bid is an upgrade conversation.

---

## 2. Strategic Decisions

### 2.1 Separate plan track from buyer side
**Decision: Separate Seller plans, priced independently.**

- Sellers have different volume, different cost base, different anchor competitors.
- Buyer plans are ~$299–$1,999/mo; Seller plans anchor lower ($149–$1,499/mo) because Sourcera competes with Responsive (~$7–15K/yr) and Loopio (~$15–35K/yr) for the seller wallet, not with Coupa.
- An org that is both buyer and seller buys both plans. AI budgets pool at the Org level; plan surfaces activate independently.

### 2.2 Outcome-based accounting, same framework
**Decision: Reuse the buyer-side mechanic.** Value price = `cost_base × 10`; cost price = `cost_base × 1.05`. Outcome resolver fires on capability-specific seller signals. Margin ≥ 88% on worst realistic accept/reject mix.

### 2.3 Monetize automation and discovery, never participation
**Decision: Never charge to respond to an invited bid.** Even the First-Pass Responder, when used inside an invited bid, spends from the seller's AI budget — it does not block response altogether. A free-tier seller can always respond manually to an invited bid and use the free AI allowance for drafts, Q&A, and suggestions.

### 2.4 Cap outbound at Starter; unlimited at Growth+
**Decision: EOI volume is the single hardest gate.** Free sellers cannot submit EOIs proactively. Starter caps outbound (10/mo). Growth+ unlocks unlimited. Uncapped outbound on Starter would flood buyer inboxes — and noisy EOIs destroy Marketplace trust faster than any other failure mode.

### 2.5 Reserve numeric Match Scores as a paid signal (Growth+)
**Decision: Free and Starter sellers see qualitative labels only** ("Strong Match"). Numeric Match Scoring is gated behind Growth+. Mirrors the buyer-side Match Scoring gate and creates a natural upgrade lane for sellers scaling outbound.

### 2.6 KB as the highest-leverage monetization surface
**Decision: The KB is the seller's moat, and therefore the seller's largest AI spend.** Three KB-related capabilities drive most of the value (and most of the cost):

1. **KB Bootstrap** (Opus, ~$20 cost → ~$200 value when accepted) — first crawl is free forever (growth loop M1); subsequent bootstraps are metered
2. **Firecrawl ingestion + dedupe** (Sonnet/Haiku hybrid) — metered per source × per crawl
3. **First-Pass RFP Response Generator** (Sonnet, ~$1.50 cost/100 reqs → ~$15 value) — per-bid spend, gated by AI budget

These three must be protected by tiered budget and fall under the same outcome accounting (accepted = seller approves/retains; rejected = edited out or unused).

### 2.7 Published profile on Free; feature set drives upgrade
**Decision: Published Seller Profile is free and on by default on Seller Free.**

The prior draft proposed unpublished-until-upgrade. Rejected. Reasoning: Marketplace inventory is a one-way ratchet — every additional listed seller strengthens the discovery moat for the entire platform, including the buyers. Holding profile publication behind a paywall would suppress inventory during the most vulnerable phase of Marketplace liquidity. Upgrade pressure comes from the feature set — KB ceiling, concurrent bids, outbound EOIs, CRM Sync, numeric Match Scoring, Seller Signals — not from profile visibility.

---

## 3. Seller Plan Architecture at a Glance

| | **Free** | **Seller Starter** | **Seller Growth** | **Seller Scale** | **Seller Enterprise** |
|---|---|---|---|---|---|
| Monthly (annual) | $0 | $149 | $499 | $1,499 | Custom, $3,000/mo floor |
| Monthly (monthly) | $0 | $179 | $599 | $1,799 | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| AI budget (value $) | $5/mo | $30/mo | $200/mo | $600/mo | Committed |
| Invited bids (respond to) | Unlimited over time, 1 concurrent | Unlimited, 3 concurrent | Unlimited, 15 concurrent | Unlimited | Unlimited |
| Proactive Marketplace EOIs | 0 | 10/mo | Unlimited | Unlimited | Unlimited |
| KB entries | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| Firecrawl sources | 0 | 2 (weekly) | 10 (daily) | Unlimited (real-time) | Unlimited |
| KB Bootstrap | 1 lifetime | 1/yr | 3/yr | Unlimited | Unlimited |
| First-Pass RFP Generator | Budget only ($5) | Included (budget) | Included (budget) | Included (budget) | Committed |
| SellerSoftware entities | 1 | 5 | 25 | Unlimited | Unlimited |
| Capability Declarations | 3 | 25 | 250 | Unlimited | Unlimited |
| Verification tier cap | Basic | Verified | Certified | Certified | Certified |
| Seller Profile publication | **Published** | **Published** | **Published** | **Published** | **Published** |
| Seller Page Enrichment (Opus) | — | 1/yr | 3/yr | 12/yr | Unlimited |
| Match Scoring (numeric) | Labels only | Labels only | Included | Included | Included |
| Seller Signals | — | Monthly category digest | Weekly digest | Weekly + real-time | Real-time + API |
| CRM Sync | — | — | Included | Included | Included |
| Promoted placements | — | — | — | 1/mo | 3/mo |
| SSO / SCIM / residency | — | — | — | — | ✓ |
| API access | — | — | — | Read-only | Full |
| CSM | — | — | — | Shared | Dedicated |
| Support | Community | Email | Email + chat | Priority | Priority + SLA |

---

## 4. Seller Free — `$0`

The Seller Free plan is the Marketplace's supply-side growth engine. It exists to let a vendor, invited by a single buyer, do the work of answering that buyer's RFP without hitting a paywall — and to increment Marketplace inventory by one published, searchable, verified-domain listing on day one.

**Included:**
- Full Bid Workspace for 1 concurrent invited bid
- Respond to unlimited invitations over time (one active at a time)
- Manual KB with up to 50 entries
- **1 lifetime KB Bootstrap** (the M1 growth loop promise — free first-crawl on signup)
- $5/mo AI budget (enough for 1 first-pass draft + Q&A assist on 1 bid)
- **Published Seller Profile from day one** — Basic verification tier (domain-verified), visible in the public Marketplace on the seller signs up, no gate
- 1 SellerSoftware entity (also published)
- 3 Capability Declarations (fuel matching and category filtering)
- Marketplace browsing (read-only)
- Community support

**Not included:**
- Proactive EOIs (the outbound mechanic — gated at Starter)
- Firecrawl, automated crawling, or re-bootstraps
- Seller Page Enrichment (rich page content; Starter+)
- Numeric Match Scoring (Growth+)
- Seller Signals
- CRM Sync (Growth+)

**Purpose:** Get invited. Respond. Get listed publicly. See the value. Hit the ceiling on concurrent bids, KB growth, or outbound. Upgrade.

---

## 5. Seller Starter — `$149/mo annual` / `$179/mo monthly`

Positioning: *"You respond to RFPs occasionally and want Sourcera doing the grunt work."*

- 3 concurrent invited bids
- 10 proactive EOIs/month
- KB up to 1,000 entries
- 2 Firecrawl sources, weekly crawl
- 1 re-Bootstrap per year
- $30/mo AI budget
- Verified tier eligibility (auto-unlocked when criteria met)
- Published Seller Profile (same as Free, but now eligible for Verified badge)
- 5 SellerSoftware entities
- 25 Capability Declarations
- 1 Seller Page Enrichment per year
- Monthly category Seller Signals digest
- Email support

**Fit:** Solo founder or 1–2 person revenue team responding to 10–30 RFPs/yr.

**Anchor:** Responsive (formerly RFPIO) starter at ~$7K/yr; Sourcera Starter at ~$1,800/yr with KB + Marketplace bundled is 4× cheaper on the RFP tooling dimension alone.

---

## 6. Seller Growth — `$499/mo annual` / `$599/mo monthly`

Positioning: *"RFPs are a reliable channel for you and you want leverage."*

- 15 concurrent invited bids
- Unlimited proactive EOIs
- KB up to 10,000 entries
- 10 Firecrawl sources, daily crawl
- 3 re-Bootstraps per year
- $200/mo AI budget
- Certified tier eligibility
- 25 SellerSoftware entities
- 250 Capability Declarations
- 3 Seller Page Enrichments per year
- Weekly Seller Signals digest
- CRM Sync (Salesforce, HubSpot, Dynamics, Pipedrive) included
- Numeric Match Scoring
- Email + chat support

**Fit:** Early revenue team (2–5 people) with a named RFP owner, 30–100 RFPs/yr.

**Anchor:** Loopio mid at ~$15–20K/yr; Sourcera Growth at ~$6K/yr with automated KB + Marketplace + CRM is a 3× price break.

---

## 7. Seller Scale — `$1,499/mo annual` / `$1,799/mo monthly`

Positioning: *"RFPs are a deal-forming channel and you want Sourcera running inside your revenue ops."*

- Unlimited concurrent bids
- Unlimited EOIs
- Unlimited KB
- Unlimited Firecrawl sources, real-time crawl (fair-use: max 50 domains)
- Unlimited Bootstraps
- $600/mo AI budget
- Certified tier
- Unlimited SellerSoftware entities
- Unlimited Capability Declarations
- 12 Seller Page Enrichments per year
- Weekly + real-time Seller Signals
- CRM Sync included, with field-map customization
- Numeric Match Scoring + batch API
- 1 Promoted Marketplace placement per month (category-capped)
- Read-only API access
- Shared CSM
- Priority support

**Fit:** RFP Center of Excellence, 100+ RFPs/yr, cross-product vendor.

**Anchor:** Responsive/Loopio enterprise at $25–35K/yr; Sourcera Scale at ~$18K/yr includes Marketplace discovery Responsive/Loopio don't ship.

---

## 8. Seller Enterprise — Custom, `$3,000/mo` floor

- All Scale features
- SSO, SCIM, IP allowlist, data residency, custom DPA
- Dedicated CSM, onboarding, QBR
- Committed annual AI spend (minimum $12K/yr value-dollar commit)
- Volume discount on overage: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+
- Full API access (read + write)
- 3 Promoted placements per month
- Custom CRM/RevOps integrations (Gainsight, Outreach, Salesloft, 6sense) scoped per contract
- SLA: 99.9% uptime, 4-hour critical response

**Gate:** Seller Enterprise is only sold when one of {SSO required, DPA required, ≥$12K AI commit, custom RevOps integration} is present. Otherwise the seller belongs on Scale. The $3K/mo floor exists because dedicated CSM drags margin below the 90% target unless offset by both subscription and committed AI spend.

---

## 9. Seller-Side Capability Rate Card (for wallet overage)

Same mechanic as the buyer side: wallet overage is off by default; the admin explicitly enables it and sets a monthly cap. Rates are cost-adaptive (`value = cost_base × 10`; `cost = cost_base × 1.05`).

Derived from `KB_Engineering_Spec.md §13.2` cost estimates:

| Capability | Model | Accepted (value) | Rejected (cost) | Unit |
|---|---|---|---|---|
| First-Pass RFP Draft (per requirement) | Sonnet | $0.15 | $0.02 | 1 requirement |
| Q&A Suggestion | Sonnet | $0.50 | $0.07 | 1 suggestion |
| KB-to-Capability Suggestion (batch 100) | Haiku | $0.80 | $0.10 | 100-entry batch |
| KB Bootstrap (500 pages) | Opus | $200.00 | $26.00 | 1 bootstrap |
| Ghost-RFP Ingestion | Opus | $25.00 | $3.30 | 1 historical RFP |
| Firecrawl Crawl + Dedupe | Sonnet | $0.04 | $0.005 | 1 page processed |
| KB Staleness Classifier | Haiku | $0.02 | $0.003 | 1 entry reviewed |
| Seller Page Enrichment | Opus | $8.00 | $1.10 | 1 page |
| Capability Declaration Suggest | Sonnet | $0.30 | $0.04 | 1 declaration |
| Match Score (numeric, per-listing) | Sonnet | $0.40 | $0.05 | 1 opportunity |
| Bid Task Assignment Suggest | Haiku | $0.01 | $0.002 | 1 task |
| Document Attach Suggest | Haiku | $0.02 | $0.003 | 1 suggestion |

All rates derived nightly from actual Anthropic + Convex cost; multiplier held constant; published at `api.sourcera.com/v1/pricing`.

---

## 10. Seller-Side Outcome Signals

| Capability | Accepted signal | Window | Timeout default |
|---|---|---|---|
| First-Pass RFP Draft | ≥50% of draft retained in submitted bid | 14d (or on bid submission) | Rejected |
| Q&A Suggestion | Answer sent with ≤30% edit | 7d | Rejected |
| KB-to-Capability Suggestion | Declaration published | 14d | Rejected |
| KB Bootstrap | ≥60% of proposed entries approved | 30d | Rejected |
| Ghost-RFP Ingestion | Resulting KB entries cited in a future bid | 90d | Rejected |
| Firecrawl Crawl + Dedupe | New entry approved OR correct dedupe | 7d | Rejected |
| KB Staleness Classifier | Flagged entry re-verified or archived | 14d | Rejected |
| Seller Page Enrichment | Seller publishes generated content | 14d | Rejected |
| Capability Declaration Suggest | Declaration published | 7d | Rejected |
| Match Score (numeric) | EOI submitted after viewing score | 14d | Rejected |
| Bid Task Assignment Suggest | Task assigned as suggested | 24h | Rejected |
| Document Attach Suggest | Document attached to response | 24h | Rejected |

Default on timeout is **rejected** — biases Sourcera toward cost protection when signal is ambiguous.

---

## 11. Cross-Side Billing Rules

An Organization may be a buyer, a seller, or both. The pricing model handles this explicitly:

1. **Plans activate per console, not per Org.** An Org can hold (Buyer Growth + Seller Starter), (Buyer Free + Seller Scale), etc.
2. **AI budgets are Org-scoped and pooled across consoles.** If an Org has Buyer Growth ($300 budget) and Seller Starter ($30 budget), it has $330 of unified AI budget. Any capability in either console draws from it.
3. **Wallet overage settings are Org-scoped.** One wallet, one cap, one auto-topup config.
4. **Dual-Console Firewall is unchanged.** Billing is shared; data is not.
5. **Enterprise counts once.** An Org with Buyer Enterprise and Seller Enterprise pays one combined contract with a single committed spend minimum (set at the higher of the two floors, so $3K/mo).

This structure ensures the pricing never penalizes Orgs that use both sides of the platform (which is exactly the behavior the marketplace wants).

---

## 12. Marketplace Discovery Pricing — The Non-AI Layer

Some seller-side monetization is not AI-accounted. It is traditional media/visibility pricing, controlled by Sourcera Ops to preserve Marketplace trust.

### 12.1 Promoted Listings
- 1 included per month at Scale, 3 at Enterprise; not available below Scale.
- Each placement is category-capped (max 3 promoted per category at a time) to prevent noise.
- Additional placements can be purchased at **$500/category/week** on Scale and Enterprise only. Hard-capped at 4 additional per month to prevent any single seller from saturating a category.

### 12.2 Verification Tiers
- **Basic** (free, all tiers) — domain verification only
- **Verified** (free when earned; Starter+) — requires profile completeness + SOC 2 or ISO document uploaded and validated by Ops
- **Certified** (free when earned; Growth+) — requires Verified + ≥ 3 closed bids on Sourcera with buyer-side confirmation

Tiers are gating signals for buyer trust, not billing surfaces. No seller ever pays Sourcera for a verification tier; the cost of Ops review is absorbed in the plan.

### 12.3 Featured Placements on Category/Comparison Pages
- Strictly editorial. Controlled by Marketing, not purchasable. Featured sellers are chosen based on {verification tier, category relevance, KB health score, buyer engagement signals}. Preserves the integrity of Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12) as a true organic-search moat.

---

## 13. Financial Scenarios

Same assumptions as buyer-side: Anthropic mid-2025 pricing, Convex ≈ 3% of AI cost, CSM loaded only on Scale/Enterprise.

### Scenario A — 200 Seller Starter customers
- ARR: 200 × $149 × 12 = **$357,600**
- AI COGS at full $30 budget, 70/30 mix: ~$3.24/customer/mo × 200 × 12 = $7,776
- Infra: ~$9,600
- **Gross margin: ~95.1%** (no CSM on Starter)

### Scenario B — 50 Seller Growth customers
- ARR: 50 × $499 × 12 = **$299,400**
- AI COGS at $200 budget, 70/30 mix: ~$21.60/customer/mo × 50 × 12 = $12,960
- CRM Sync infra: ~$6,000 (fixed)
- **Gross margin: ~93.7%**

### Scenario C — 15 Seller Scale + 5 Seller Enterprise (with $3K floor)
- Scale ARR: 15 × $1,499 × 12 = $269,820
- Enterprise ARR (avg $4.5K/mo subscription + $16K committed AI): 5 × ($54K + $16K) = $350,000
- Scale AI COGS: $64.80 × 15 × 12 = $11,664
- Scale CSM (shared, 0.08 FTE/customer @ $120K loaded): $144,000
- Enterprise AI COGS at commit: $16K × 5 × 0.11 = $8,800
- Enterprise CSM (dedicated, 0.2 FTE @ $180K loaded): $180,000
- Total revenue: $619,820; total direct cost: ~$344,464
- **Blended gross margin: ~44.4%** — mirrors buyer-side Enterprise dynamics. Below $12K AI commit, CSM load destroys margin. The $3K/mo floor plus committed AI defend this.

### Target mix (Year-1 exit, seller side)
- 55% Starter / 25% Growth / 15% Scale / 5% Enterprise
- Blended seller-side gross margin target: **≥90%**

### Combined (buyer + seller) Year-1 exit blended target
If buyer-side ARR mix hits 60/25/10/5 and seller-side hits 55/25/15/5, combined blended margin clears ~91% with Enterprise <10% of accounts on both sides.

---

## 14. PLG Motion (Seller-Side) — The Forced-Signup Opportunity

The most valuable signup Sourcera will ever get is the one the vendor did not ask for.

When a buyer invites a vendor through M1 (Vendor-Invite-Creates-Account), M5 (Buyer-Pull Vendor Invite), or M15 (Ghost-Bid Importer), the vendor arrives at Sourcera under an unusually favorable set of conditions: they have an incoming RFP, a deadline, no chosen tool, a blank response to write, and zero existing workflow to defend. They are at peak pain. And they have an immediate business reason to engage.

This is the only PLG moment in the product that converts involuntary signup into measurable value inside the first session. The seller pricing strategy is designed to exploit this moment as aggressively as the anti-spam controls allow.

### 14.1 The Hero Moment — "Your first bid is already drafted"

On magic-link signup from a buyer invite, the following happens synchronously before the vendor ever sees an empty workspace:

1. **Domain Bootstrap.** The KB Bootstrap capability crawls the vendor's public homepage, help center, docs, and trust center. Opus-tier, drawn from the lifetime-free bootstrap allowance on Free. ~30–90 seconds.
2. **KB Propose.** 40–200 draft KB entries are staged for review, each with a confidence score and a provenance URL ("from: yourcompany.com/security").
3. **First-Pass Draft.** The First-Pass RFP Response Generator drafts responses for every requirement in the buyer's evaluation, citing the newly bootstrapped KB entries. Typically covers 40–70% of requirements with high-confidence draft.
4. **Landing screen.** The vendor lands not on an empty workspace but on:
   > *"Your bid for [Buyer Company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website. Review and approve to submit."*

This collapses the new-vendor cold-start wall from roughly 2 days (status quo: manual triage, KB hunt, draft from scratch) to ~30 seconds of latency hidden behind a progress bar that reads as onboarding.

**Why this converts without paywall.** The vendor did not ask for a demo. They arrived to do work. They see their own content in the tool before they interact with it. They see the buyer's real requirements (not a sandbox) being answered with their real capabilities. They hit the upgrade ceiling only AFTER they've seen the value — not before.

### 14.2 Tracked activation metric

**"Minutes from magic-link click to first submitted requirement response"** — target p50 < 20 minutes, p90 < 60 minutes. This is the highest-leverage PLG metric in the product and should be a top-level founder dashboard number. Every product decision on the seller onboarding surface should be evaluated against whether it moves this metric.

### 14.3 The three planned conversion moments

The seller funnel is deliberately designed around three distinct upgrade triggers, each with a different buying reason. The pricing model should not optimize any single one — the product should catch all three.

| Moment | Trigger | Buying reason | Message |
|---|---|---|---|
| **1. Second concurrent bid** | Vendor receives a second buyer invite while first is still in flight | Urgency — "my deal is at risk" | *"Starter unlocks 3 concurrent bids and keeps your KB shared across all of them."* |
| **2. First EOI attempt** | Vendor clicks "Submit EOI" on a Marketplace listing | Ambition — "I want to find more deals" | *"Outbound EOIs start at Starter. Your first 10/month are included."* |
| **3. KB ceiling** | Vendor approaches 50-entry KB cap after 2–4 bids | Investment — "I don't want to lose what I've built" | *"Your KB is about to hit the Free ceiling. Starter raises it to 1,000 entries and keeps your existing work."* |

### 14.4 Paid-path progression

1. **Signup (Free).** Triggered by buyer invite (M1/M5), ghost-bid importer (M15), or direct signup. Magic-link; Google/MS SSO; no credit card. Published profile and first bootstrap happen inside signup.
2. **Aha moment.** Hero moment above. The KB is non-zero on day one, responses are drafted, seller reviews and submits.
3. **First invited bid submitted (Free).** Seller closes a real bid on Sourcera. Win/loss feedback from buyer informs KB value scoring.
4. **Ceiling hit (Free → Starter).** One of the three moments above. Contextual upgrade CTA with exact carry-over ("Your 47 KB entries and 2 in-flight bids move with you.").
5. **Expansion (Starter → Growth → Scale).** Bid volume, EOI volume, KB size, AI budget utilization, CRM Sync request. Growth upsell at 80% budget utilization for 2 consecutive months.
6. **Enterprise trigger.** SSO / DPA / ≥$12K AI commit / custom RevOps integration routes to founder-led sale.

### 14.5 Leading indicators (trackable solo)

- Free seller → Starter conversion %
- % of Free sellers who receive a buyer invitation within 30 days (M1 effectiveness)
- **% of Free sellers whose KB Bootstrap generates ≥40 approved entries** (acceptance rate on the hero moment)
- **Minutes from magic-link to first submitted requirement response** (p50, p90)
- Days to first submitted bid on Free
- Second-invitation arrival rate on Free cohort (directly predicts conversion moment #1)
- Starter → Growth expansion % at month 3
- EOI submission rate per tier (engagement signal)
- Rejected-op rate for First-Pass Responder (quality signal — target <30%)
- Blended seller-side margin per plan

---

## 15. The Forced-Vendor-Signup Playbook

This section formalizes the mechanics that turn an incoming buyer invite into a paying Sourcera seller. Everything below assumes the invite has landed and the vendor has clicked the magic-link.

### 15.1 Pre-arrival preparation (hidden from vendor)

Before the vendor even clicks:
- Sourcera enriches the invite-target email domain against public records to pre-populate company name, industry, HQ region
- The Marketplace Tagger assigns probable category tags to the vendor based on domain + buyer-side evaluation context
- The bootstrap queue is pre-warmed — crawl URLs are resolved and rate-limited against Firecrawl

When the vendor clicks magic-link, the bootstrap starts within the SSO redirect latency window.

### 15.2 The onboarding surface (minutes 0–3)

**Zero friction surface.** No form, no company profile prompt, no credit card, no role selection. Domain + invite identity is enough.

**Progress storytelling.** The onboarding progress bar narrates what is happening:
- *"Scanning yourcompany.com..."* (0–15s)
- *"Found your security documentation..."* (15–30s)
- *"Drafting responses for [Buyer Company]'s 82 requirements..."* (30–90s)
- *"Your bid is ready to review."* (done)

This is a product surface, not a marketing surface. Every status line is true and reflects actual work completed.

**Landing counter.** First screen shows:
> *Your bid is ready. **47** AI drafts prepared. **31** cite evidence from your website. Review time: **~35 min**.*

The headline numbers drive the activation.

### 15.3 In-workspace value proof (minutes 3–45)

**Inline citations on every draft.** Every First-Pass draft shows its KB citation in the response row itself: *"from: yourcompany.com/trust/soc2"* with a hover expansion showing the exact quoted sentence. This makes the AI output legible and trustworthy.

**Accept / Edit / Reject per requirement.** Three buttons, no keyboard shortcuts needed for first pass. Every click is a signal to the outcome resolver.

**Live budget counter.** Top of workspace shows *"AI budget used: $1.47 of $5.00 · 23 drafts accepted, 3 rejected."* Cost is visible but not alarming — the budget is sized to cover exactly one bid end-to-end.

**KB-gap detector.** When a draft is rejected, the empty state is not a dead end:
> *"No KB content answered this. Write your answer below and we'll save it as a KB entry."*
>
> [Inline text field]

The vendor's inline rejection becomes a new KB entry in one step. Every rejection grows the KB.

**"AI got this right" — one-click confirmation.** Accepting a draft with no edits records the strongest possible acceptance signal and surfaces a subtle confirmation chip *("added to your KB as verified response")* that reinforces value delivery.

### 15.4 Post-submission reveal (hour 1+)

When the vendor clicks Submit, the closing screen reads:

> *You just built a reusable KB of **47** verified entries in **35 minutes**.*
> *Your next bid will reuse them automatically.*
> *Sourcera tracked **$1.47** of value pricing for the AI work on this bid (covered by your Free plan).*

This is not an upgrade CTA. It is a **stake-reveal screen** — a deliberate reminder of what the vendor has built, what it's worth, and how it compounds. The upgrade conversations come later when the natural ceilings hit.

### 15.5 The Buyer-Funded Pro Trial Seat (expansion mechanic — add to growth loop catalog)

**Mechanic:** When a buyer is on Scale or Enterprise, they receive a pool of **Vendor Pro Trial Seats** (5/mo on Scale, 15/mo on Enterprise). When that buyer invites a vendor, the invite can optionally grant the vendor a 30-day Seller Starter trial — free to the vendor, free to the buyer, cost absorbed into the buyer's plan.

**Why it works:**
- The buyer's invite is already the highest-converting moment in the seller funnel; a 30-day trial eliminates the upgrade ceiling exactly when the vendor is most engaged.
- The buyer wins on response quality (the vendor gets access to better KB tooling, better drafts, better citations), so buyer NPS improves.
- Vendors who convert on day 30 have already built a KB under a Starter tier — they never see Free ceilings. Conversion rate should be materially higher than a Free-tier cold start.
- Cost to Sourcera is bounded (AI usage still metered against the Org budget; the subscription itself is low-marginal-cost).

**Propose as new growth mechanic M17 in the Master Summary §3.3 catalog.**

### 15.6 Win/Loss debrief as upgrade trigger

When a bid closes (won or lost), Agent generates a debrief:

**On win:**
> *You won. **KB entries cited on winning responses**: 24. Those entries are now higher-weighted in your KB — Sourcera learned what answers close deals for you. **Keep your KB alive** — upgrade to Starter to unlock weekly crawls of your site and auto-staleness checks.*

**On loss (with buyer's published reasoning where available):**
> *You lost this one. **Gap analysis** identified 4 requirements where your KB had no strong answer. Those gaps are now flagged in your KB. Upgrade to Starter to **let Sourcera crawl your product docs weekly** and fill gaps automatically.*

Win reinforces value. Loss creates a concrete upgrade reason tied to a specific identified gap. Both route to the same plan.

---

## 16. Seller Onboarding Experience — Detailed Flow

This is the product surface that delivers §14 and §15. It should be specced and engineered as a single vertical slice before seller pricing goes live.

### 16.1 Seven-stage flow

| Stage | Duration | State | Key product surface |
|---|---|---|---|
| 1. Magic-link arrival | 0–30s | Invited, not-yet-authed | Buyer invite email, magic-link |
| 2. Signup + bootstrap | 30s–3m | Auth'd, bootstrapping | Progress storytelling screen |
| 3. Landing | 3–5m | Bid ready, drafts staged | Ready-workspace landing |
| 4. Review and submit | 5–60m | Actively responding | Bid Workspace with inline drafts + KB builder |
| 5. Post-submit reveal | Day 0 | Bid submitted | Stake-reveal screen |
| 6. Outcome debrief | Day 3–30 | Bid closed by buyer | Win/loss debrief surface |
| 7. Upgrade touch | Day 1–90 | Conversion moment triggered | Contextual upgrade CTA per §14.3 |

### 16.2 Required platform capabilities

Shipped as a dependency for the pricing model to go live:

1. **Magic-link SSO orchestrator** that starts the bootstrap inside the SSO redirect latency
2. **Progress storytelling UI** that renders bootstrap and first-pass status honestly (never fabricates steps)
3. **Inline-citation UI** on every First-Pass draft response row
4. **Budget counter** persistent at top of Bid Workspace on Free and Starter
5. **KB-gap detector** in rejected-response empty states with 1-click KB-entry creation
6. **Stake-reveal screen** on first bid submission
7. **Outcome debrief surface** triggered by buyer-side bid close
8. **Contextual upgrade CTAs** that carry-over KB, bids, and in-flight state (no data loss in any upgrade path)
9. **Buyer-Funded Pro Trial Seat** plumbing (pool allocation, 30-day trial state, auto-downgrade on day 31 with data preservation)
10. **Free-ceiling-approaching notifications** at 40/48 KB entries, 80% budget utilization, first EOI attempt

### 16.3 Onboarding anti-patterns (explicitly banned)

The onboarding surface must not:
- Ask for a credit card at any point before the first upgrade intent click
- Require the vendor to describe their company or industry before bootstrap runs
- Gate any feature behind a "try Pro free for 14 days" modal on first login — the hero moment is the pitch
- Show a pricing page until the vendor has submitted their first bid
- Use dark patterns on the upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency)
- Present the upgrade offer during active bid work — only at natural completion points or ceiling events

These bans exist because the supply-side flywheel depends on vendors trusting Sourcera enough to let an AI touch their buyer's evaluation. Any onboarding friction that reads as sales-ey kills that trust.

---

## 17. KB Value Capture & Stake-Building

The KB is the most important asset in the seller relationship with Sourcera. Every pricing and product decision must reinforce the truth that **the KB belongs to the seller, grows with use, and is more valuable on Sourcera than anywhere else**.

### 17.1 Honest portability

The KB must be exportable in full (Markdown + JSON schema + metadata + provenance) at every tier, including Free, at any time. This is a trust commitment, not a feature. Hostile lock-in creates a reputational leak that costs more than the retention it buys.

### 17.2 On-platform compounding

What exports *can't* capture:
- **Confidence scores** earned from acceptance/rejection signals (these are Sourcera's learning, not the raw content)
- **Staleness state** derived from Firecrawl re-crawls and cross-bid dismissal patterns
- **Win-rate weighting** from closed-bid outcomes
- **Cross-bid citation graph** showing which entries close deals
- **KB-to-Capability auto-declarations** generated from entry clustering

These compounding assets make the KB materially more valuable inside Sourcera over time than as an export. Every paid tier unlocks more of the compounding surface — which is the honest upgrade argument.

### 17.3 KB value meter (product surface)

A persistent meter in the Seller Console shows:
> *Your KB: **47 entries** · **6** cited in closed bids · **2** with win-rate lift · Estimated value as reusable response library: **$1,275/yr** saved response time.*

The last number is a conservative calculation (entries × avg response time saved × loaded hourly rate) and is **visible on Free** — because the meter works better as an honest stake-builder than as a dangled Pro feature.

### 17.4 Upgrade carry-over guarantee

Every upgrade path must carry KB, in-flight bids, Capability Declarations, and Firecrawl source configs forward without re-setup. The upgrade CTA text should explicitly state this: *"Your 47 KB entries, 2 in-flight bids, and 3 Capability Declarations carry over automatically."*

Every downgrade path must preserve data in read-only state for 90 days per the buyer-side downgrade-safe preservation rule. No destructive deletion.

---

## 18. Seller-Side Network Effects

The seller side has its own compounding loops that reinforce the GTM flywheel. The pricing model is designed so that every one of these loops operates regardless of plan tier — free sellers contribute to all of them.

### 18.1 Invited-Vendor → Published-Profile → Marketplace-Ready Inventory

Every invited vendor lands with a bootstrapped KB, a published Seller Profile, a SellerSoftware entity, and up to 3 Capability Declarations — all free. Marketplace inventory grows by one searchable, category-tagged, verified-domain listing every time a buyer invites a vendor. Free vendors grow inventory; paid vendors drive revenue. Neither cannibalizes the other.

### 18.2 KB → Capability Declaration → Match Score → EOI → Revenue

As vendors accept bootstrapped KB entries, the KB-to-Capability Auto-Suggestion capability (C.46) generates Capability Declarations. Those declarations feed Match Scoring, which feeds SEO-ranked Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12). A free vendor's bid work compounds into organic search real estate for Sourcera — and matching quality improves for every seller.

### 18.3 Bid-Close → Win/Loss Signal → Platform Learning

When bids close, Sourcera learns what KB content correlates with wins. This feeds:
- Per-entry confidence weighting inside the vendor's KB (compounding value for that vendor)
- Aggregate Marketplace Match Score calibration (improves for all vendors)
- Market Intelligence Report content (M12, SEO moat for Sourcera)
- Seller Signal quality (Growth+ paid feature value rises with every closed bid)

One bid close per vendor per month, across 200 active vendors, is 2,400 Match Score calibration events per year. Signal quality compounds.

### 18.4 Seller-Profile SEO Loop

Published Seller Profiles and Software Pages emit Schema.org structured data. Organic traffic to these pages drives:
- Inbound buyer signups (dual-side acquisition)
- Seller ROI on Sourcera (their Sourcera profile becomes a ranking asset)
- Per-category SEO moat for the Marketplace
- A structural defense against Gartner/G2 — they own category reviews; Sourcera owns category inventory

Free sellers contribute to all three without cost to Sourcera.

### 18.5 Ghost-Bid Import Loop (M15)

Sellers who were already invited to RFPs outside Sourcera can paste historical RFPs and have Ghost-RFP Ingestion (Opus, $25 value per RFP) seed their KB from prior work. First import free per Seller Org. This catapults vendors with RFP history over the KB-accumulation barrier and accelerates paid conversion — the vendor arrives at the upgrade ceiling in one session instead of over 2–3 bids.

### 18.6 Buyer-Funded Pro Trial Loop (M17, proposed)

Per §15.5. Buyers on Scale/Enterprise gift Pro Trial Seats to invited vendors. Trial-converted sellers skip the Free-tier experience entirely and enter Starter with zero friction. Expect materially higher conversion rate than cold-start Free-to-Starter. Adds a dollar-meaningful seller-side lift to the buyer's Scale/Enterprise plan value proposition.

### 18.7 Template Publish Incentive (M9)

Sellers who publish non-confidential response templates to the Template Library (e.g., SOC 2 response block, GDPR DPA block) earn Marketplace visibility credits — featured placements inside Category Pages. This incentivizes shared content creation and increases the velocity of new-vendor onboarding (every published template reduces the time-to-KB for future bootstrapped vendors).

### 18.8 The reinforcing loop summary

```
Buyer invite
  → Forced vendor signup
  → Hero moment (bootstrap + first-pass + published profile)
  → Bid submitted
  → KB compounds with every bid
  → Marketplace inventory grows
  → SEO compounds
  → Inbound buyer demand grows
  → More buyer invites
  → ...
```

Every pricing gate is placed downstream of a loop contribution, so free sellers keep the flywheel spinning while paid sellers fund it.

---

## 19. Anti-Spam and Marketplace Integrity Controls

Seller-side pricing levers are all constrained by the anti-spam framework (§3.5 in Master Summary). Notable gates:

- EOI submission is rate-limited per seller, per category, per buyer — independent of plan ceiling
- Capability Declarations are validated against the controlled taxonomy; fabricated declarations are suppressed
- Signal Integrity Monitor flags sellers with anomalous EOI submission velocity, low Match Score → EOI conversion, or high buyer-reported noise
- Sellers can be downgraded, throttled, or suspended by Ops Console if they abuse outbound tools regardless of plan
- Template Spam ML Classifier operates across all tiers
- k-anonymity floor (k=5 signal, k=10 aggregate, k=20 market intelligence) applies to all Seller Signals regardless of plan
- Free sellers who publish Profiles but never respond to invites or submit bids within 180 days are demoted in Marketplace ranking to prevent zombie-inventory pollution

Pricing gives sellers access to outbound tools; Marketplace integrity defines the acceptable use floor. A paid tier is not an unlimited license to pollute.

---

## 20. Migration from Master Spec and Current Stated Position

**Prior stated position (Master Summary §2):** *"Vendor participation is always free."*

**Revised stated position:**
> *Vendor response to an invited evaluation is always free — and their Seller Profile is published into the Marketplace on day one. Proactive discovery, KB automation, outbound Marketplace activity, and revenue-ops integrations are monetized through Seller plans.*

**Spec sections to update:**
- `Sourcera_Master_Spec.md §10.8` — add Seller plan tiers as a parallel track
- `Sourcera_Master_Spec.md §34` — extend billing entity model to hold per-console plan assignments per Org
- `Sourcera_Master_Spec.md §34.11` (new) — cross-side billing rules and AI-budget pooling
- `Sourcera_Master_Spec.md §34.12` (new) — Buyer-Funded Pro Trial Seat mechanics
- `Sourcera_Master_Summary.md §2` — update principle to "invited participation is always free" framing
- `Sourcera_Master_Summary.md §3.3` — add M17 Buyer-Funded Pro Trial Seat to growth-mechanics catalog
- `Sourcera_Buyer_Pricing_Strategy.md §3` — update the "Vendor console free forever" footer line; add Pro Trial Seat as a Scale/Enterprise inclusion
- `KB_Engineering_Spec.md §13.2` — confirm `ai_operation_pricing` table includes all seller-side capabilities listed in §9 above

**Customer migration:** No grandfathering needed on the seller side — this is net-new monetization. Existing Free sellers keep everything they have, get the M1 lifetime bootstrap if they have not already consumed it, and their previously-unpublished profiles are opt-in-published (one-click during a 30-day soft-launch window).

---

## 21. Positioning and Messaging (Seller-Side)

**Headline:** *Win more RFPs. Grind less. Get discovered.*

**One-liner:** Sourcera is the software evaluation marketplace where buyers find you — and the AI co-pilot that drafts your responses, keeps your KB fresh, and routes signals into your CRM.

**Three pillars:**
1. **Responding to invites is always free — and your first bid is already drafted when you log in.** No seat tax, no paywall to answer, no empty workspace.
2. **Your KB is your moat — we build it with you.** Automatic bootstrap, automatic crawling, automatic staleness detection. Your KB is honestly portable and compounds with every bid you close.
3. **Be discovered without cold outreach.** Published Seller Profile, Verified badge, Capability Declarations, and Match Scoring route qualified buyers to you.

**Anti-positioning (seller-specific):**
- Not a proposal management suite (vs Responsive, Loopio) — those don't do discovery
- Not a review/intent platform (vs G2, Bombora) — those don't help you respond
- Not a lead-gen list (vs Apollo, ZoomInfo) — those don't route intent inside a structured evaluation
- **The first platform where RFP response tooling, demand discovery, and CRM-ready intent live in the same workflow with the same KB.**
