# Sourcera Seller Pricing Strategy (v3)

**Status:** Active recommendation
**Companion doc:** `Sourcera_Buyer_Pricing_Strategy.md`
**Supersedes:** v2 (introduced separate seller plans, KB value capture, forced-vendor-signup playbook, Marketplace Discovery non-AI layer)
**Last updated:** 2026-04-26
**v3 changeset:** Added the **Seller Solo tier** ($49/mo annual / $59/mo monthly OR $199/bid one-time) as the personal-card on-ramp between Seller Free and Seller Starter — the surface for **Seller Maya**, the first-time bid responder (Account Executive, Solutions Engineer, or Bid Manager at a 50–500-person B2B SaaS vendor) introduced as the v7.1.0 seller-side surface persona. AI consumption is invisible to Solo-tier sellers (cost absorbed within the Master Spec §34 / §44 Solo value envelope; engine throttles silently if approached — no Free hard-cap bill-shock). Solo unlocks 250-entry KB ceiling, Verified-tier eligibility, 1 weekly Firecrawl source, and email support over Free, while preserving 1 concurrent bid and 0 outbound EOIs to keep the Starter conversion lane clear. Updated plan-architecture table, §1 core principle, §2 strategic decisions (added §2.8 and §2.9), PLG paid path (now Free → Solo → Starter → Growth → Scale → Enterprise), Financial Scenarios (added Solo scenario D), and Migration delta. **Phase 14.9 — Master Spec scaffolding edit landed (2026-04-27):** all numerical limits, charge orchestration, plan tier enum values, surface/engine mappings, and Stripe meter events are now authoritative in `Sourcera_Master_Spec.md` §34.1.2 (Seller Plan Tiers), §34.2.2 (Seller Pricing), §34.2.5 (Solo Per-Bid Charge Orchestration), §34.10.3 (Solo-co-resident pool rule), §34.12.6 (Solo per-console subscription billing), §39 (Object Size Constraints — Solo cells cite §34.1.2 and never restate), Appendix J (Plan Tiers — `seller_solo` registered; `billing_event_charge_kind` extended with `solo_per_bid`), and Appendix M (Surface/Engine Mapping — Solo billing surface, Solo Verified-tier eligibility, Solo Capability Declaration auto-publish, Solo silent throttling, Solo upgrade CTA rows). Section numbering shifted: prior §5–§21 are now §6–§22 to accommodate the new §5 Seller Solo Plan. This document remains the narrative-and-strategy companion; numerical authority is in the Master Spec.

---

## 0. What This Document Decides

The buyer-side pricing doc intentionally left the seller side as "Vendor console free forever." That statement is correct as a **participation promise** but wrong as a **monetization strategy**. Sellers are the highest-leverage AI consumers on the platform — KB automation, First-Pass RFP Response, Page Enrichment, and outbound Marketplace discovery are all expensive, high-value AI surfaces that the buyer-side plan does not cover.

This document defines the seller-side pricing model: what stays free, what gets monetized, how it maps to the same outcome-based accounting framework as the buyer side, how it exploits the strongest PLG moment in the product (forced vendor signup triggered by an incoming buyer invite), and — new in v3 — how the **Seller Solo tier** opens a personal-card on-ramp for the first-time bid responder before the Starter conversion gate.

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
| **Engine-absorbed AI on a single active bid (no Free hard cap, silent throttling)** *(new in v3 — Solo)* | **Paid (Solo on-ramp at $49/mo or $199/bid)** |
| Verified-tier eligibility | **Paid (Solo+, free when earned)** |
| Larger persistent KB (250 entries) | **Paid (Solo+)** |
| Proactive outbound (EOIs, Capability Declarations beyond 3, Promoted listings) | **Paid (Starter+)** |
| KB automation (Firecrawl crawling beyond the 1 weekly source on Solo, Bootstrap beyond the first lifetime-free, Staleness) | **Paid (Solo for 1 weekly source; Starter+ for more)** |
| First-Pass RFP Response Generator | **Free-budget-included on Free; engine-absorbed on Solo+; Included (visible budget) on Starter+** |
| Seller Page Enrichment (public surfaces) | **Paid (Starter+)** |
| Match Scoring numeric access | **Paid (Growth+)** |
| Seller Signals digests | **Paid (Starter+)** |
| CRM Sync | **Paid (Growth+)** |
| Multi-bid parallelism | **Paid (Starter+ for 3 concurrent; tier-gated above)** |

The free tier must let a vendor answer a single buyer's RFP, manually **or with AI assistance**, start to finish — no artificial blocks at response time, no forced upgrade to submit. That is the supply engine. Once the vendor has tasted Sourcera once, every additional bid is an upgrade conversation. **Solo sits between Free and Starter as the personal-card on-ramp** for the AE / SE / Bid Manager who has decided Sourcera is worth a small recurring or per-bid spend but is not yet ready to advocate for an org procurement-tool purchase.

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
**Decision: Never charge to respond to an invited bid.** Even the First-Pass Responder, when used inside an invited bid, spends from the seller's AI budget — it does not block response altogether. A Free-tier seller can always respond manually to an invited bid and use the free AI allowance for drafts, Q&A, and suggestions. **Solo lifts the Free hard cap to a silently-absorbed envelope** so the personal-card seller never sees a mid-bid "out of budget" wall.

### 2.4 Cap outbound at Starter; unlimited at Growth+
**Decision: EOI volume is the single hardest gate.** Free and Solo sellers cannot submit EOIs proactively. Starter caps outbound (10/mo). Growth+ unlocks unlimited. Uncapped outbound on Starter would flood buyer inboxes — and noisy EOIs destroy Marketplace trust faster than any other failure mode. **Solo deliberately keeps EOI access at zero** to preserve the Starter conversion lane (the first EOI attempt is a planned conversion moment — see §15.3).

### 2.5 Reserve numeric Match Scores as a paid signal (Growth+)
**Decision: Free, Solo, and Starter sellers see qualitative labels only** ("Strong Match"). Numeric Match Scoring is gated behind Growth+. Mirrors the buyer-side Match Scoring gate and creates a natural upgrade lane for sellers scaling outbound.

### 2.6 KB as the highest-leverage monetization surface
**Decision: The KB is the seller's moat, and therefore the seller's largest AI spend.** Three KB-related capabilities drive most of the value (and most of the cost):

1. **KB Bootstrap** (Opus, ~$20 cost → ~$200 value when accepted) — first crawl is free forever on every tier (growth loop M1); subsequent bootstraps are tier-gated (Solo: 1/yr re-bootstrap; Starter: 1/yr; Growth: 3/yr; Scale+: unlimited)
2. **Firecrawl ingestion + dedupe** (Sonnet/Haiku hybrid) — metered per source × per crawl; **Solo unlocks 1 weekly source**; Starter has 2 weekly; Growth 10 daily; Scale+ unlimited
3. **First-Pass RFP Response Generator** (Sonnet, ~$1.50 cost/100 reqs → ~$15 value) — per-bid spend; **Solo absorbs silently**, Starter+ is included in visible budget

These three must be protected by tiered budget and fall under the same outcome accounting (accepted = seller approves/retains; rejected = edited out or unused).

### 2.7 Published profile on Free; feature set drives upgrade
**Decision: Published Seller Profile is free and on by default on Seller Free, Solo, and every paid tier.**

Rejected alternative: unpublished-until-upgrade. Reasoning: Marketplace inventory is a one-way ratchet — every additional listed seller strengthens the discovery moat for the entire platform, including buyers. Holding profile publication behind a paywall would suppress inventory during the most vulnerable phase of Marketplace liquidity. Upgrade pressure comes from the feature set — KB ceiling, concurrent bids, outbound EOIs, CRM Sync, numeric Match Scoring, Seller Signals, **and on Solo specifically the silent-throttling AI envelope, larger KB, Verified-tier eligibility, and email support** — not from profile visibility.

### 2.8 Seller Solo tier — the personal-card on-ramp *(new in v3)*
**Decision: Introduce a Seller Solo tier between Seller Free and Seller Starter, priced at $49/mo annual / $59/mo monthly OR $199 per submitted bid.**

Rationale:
- The v7.1 seller-side surface persona is **Seller Maya** — Account Executive, Solutions Engineer, or Bid Manager at a 50–500-person B2B SaaS vendor. Forwarded a buyer invite from Sourcera with a 4-day deadline. No prior Sourcera experience, no dedicated RFP team, no org RFP-tool budget on day one.
- Free is enough to respond to one bid but exposes the seller to the $5 hard-cap mid-bid (a real failure mode on dense RFPs with 80+ requirements and heavy Q&A) and gates Verification tier behind Starter.
- Seller Starter at $149/mo is an org-budget purchase ("we're going to formally invest in RFPs as a channel"). Seller Maya is not there yet on day one — she's in single-bid mode, on a personal card or expense report.
- The per-bid $199 alternative matches Seller Maya's mental model ("there's a deal at the end of this bid; this is a one-time expense against that deal") and is expense-friendly because it is a known fixed cost booked to a specific opportunity, not a recurring SaaS line item.
- Solo's expansion path to Starter is contextual: second concurrent bid (the dominant Starter trigger from §15.3), first EOI attempt, fourth Capability Declaration, or sustained AI-envelope throttling.

### 2.9 Seller Solo — invisible AI consumption *(new in v3)*
**Decision: Hide AIOperation metering, value-dollars, wallet, overage, and rate card from the Solo-tier seller surface entirely.**

The engine continues to meter every AIOp at value or cost rate for accounting and margin protection. The Solo seller sees one number: "Plan: Solo · $49/mo" or "Bid billed: $199 paid 2026-04-26." Throttling fires silently if the absorbed envelope is approached, surfacing only "Some background suggestions paused — your active bid response is unaffected." Per Principle 9 (Master Spec §3.X), surfacing complexity is a defect; on Solo, the entire AI consumption surface is engine-only and lives behind Appendix M (Surface/Engine Mapping).

This decision is materially important on the seller side because the Free-tier hard cap can fire mid-bid on dense RFPs (a single First-Pass draft for an 80-requirement RFP at 70% accept can exceed the Free budget). Solo's silent throttling is the first paid surface where Seller Maya's bid response cannot be derailed by an AI-budget wall mid-flight.

---

## 3. Seller Plan Architecture at a Glance

| | **Free** | **Solo** | **Seller Starter** | **Seller Growth** | **Seller Scale** | **Seller Enterprise** |
|---|---|---|---|---|---|---|
| Monthly (annual) | $0 | $49 | $149 | $499 | $1,499 | Custom, $3,000/mo floor |
| Monthly (monthly) | $0 | $59 | $179 | $599 | $1,799 | — |
| Per-bid alternative | — | **$199** | — | — | — | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| AI budget (value $) | $5/mo (hard cap) | **Hidden (§34.1.2 / §34.2.5; silent throttling)** | $30/mo | $200/mo | $600/mo | Committed |
| Invited bids (respond to) | Unlimited over time, 1 concurrent | Unlimited over time, 1 concurrent | Unlimited, 3 concurrent | Unlimited, 15 concurrent | Unlimited | Unlimited |
| Proactive Marketplace EOIs | 0 | 0 | 10/mo | Unlimited | Unlimited | Unlimited |
| KB entries | 50 | **250** | 1,000 | 10,000 | Unlimited | Unlimited |
| Firecrawl sources | 0 | **1 (weekly)** | 2 (weekly) | 10 (daily) | Unlimited (real-time) | Unlimited |
| KB Bootstrap | 1 lifetime | 1 lifetime + **1/yr re-bootstrap** | 1 lifetime + 1/yr | 1 lifetime + 3/yr | Unlimited | Unlimited |
| First-Pass RFP Generator | Budget only (Free hard cap) | **Engine-absorbed (silent)** | Included (visible budget) | Included (visible budget) | Included (visible budget) | Committed |
| SellerSoftware entities | 1 | 1 | 5 | 25 | Unlimited | Unlimited |
| Capability Declarations | 3 | 3 | 25 | 250 | Unlimited | Unlimited |
| Verification tier cap | Basic | **Verified** (eligible) | Verified | Certified | Certified | Certified |
| Seller Profile publication | **Published** | **Published** | **Published** | **Published** | **Published** | **Published** |
| Seller Page Enrichment (Opus) | — | — | 1/yr | 3/yr | 12/yr | Unlimited |
| Match Scoring (numeric) | Labels only | Labels only | Labels only | Included | Included | Included |
| Seller Signals | — | — | Monthly category digest | Weekly digest | Weekly + real-time | Real-time + API |
| CRM Sync | — | — | — | Included | Included | Included |
| Promoted placements | — | — | — | — | 1/mo | 3/mo |
| SSO / SCIM / residency | — | — | — | — | — | ✓ |
| API access | — | — | — | — | Read-only | Full |
| CSM | — | — | — | — | Shared | Dedicated |
| Support | Community | **Email** | Email | Email + chat | Priority | Priority + SLA |

---

## 4. Seller Free — `$0`

The Seller Free plan is the Marketplace's supply-side growth engine. It exists to let a vendor, invited by a single buyer, do the work of answering that buyer's RFP without hitting a paywall — and to increment Marketplace inventory by one published, searchable, verified-domain listing on day one.

**Included:**
- Full Bid Workspace for 1 concurrent invited bid
- Respond to unlimited invitations over time (one active at a time)
- Manual KB with up to 50 entries
- **1 lifetime KB Bootstrap** (the M1 growth loop promise — free first-crawl on signup)
- **$5/mo AI budget with a hard cap** (enough for 1 first-pass draft + Q&A assist on a small bid; will exhaust mid-bid on RFPs with >60 dense requirements)
- **Published Seller Profile from day one** — Basic verification tier (domain-verified), visible in the public Marketplace once the seller signs up, no gate
- 1 SellerSoftware entity (also published)
- 3 Capability Declarations (fuel matching and category filtering)
- Marketplace browsing (read-only)
- Community support

**Not included:**
- Engine-absorbed AI envelope (Solo+) — Free's AI hard cap can stop a bid mid-response
- Verified verification tier (Solo+ for eligibility)
- Larger persistent KB (Solo+ for 250 entries)
- Proactive EOIs (the outbound mechanic — gated at Starter)
- Firecrawl, automated crawling, or re-bootstraps (Solo unlocks 1 weekly source)
- Seller Page Enrichment (Starter+)
- Numeric Match Scoring (Growth+)
- Seller Signals (Starter+)
- CRM Sync (Growth+)

**Purpose:** Get invited. Respond. Get listed publicly. See the value. Hit the ceiling on the AI budget mid-bid (the dominant Free→Solo trigger), concurrent bids, KB growth, or outbound. Upgrade.

---

## 5. Seller Solo — `$49/mo annual` / `$59/mo monthly` OR `$199/bid`

The Solo plan is the personal-card on-ramp for **Seller Maya** — the Account Executive, Solutions Engineer, or Bid Manager at a 50–500-person B2B SaaS vendor who has been forwarded a buyer invite from Sourcera with a 4-day deadline and has decided Sourcera is worth a small recurring or per-bid spend without yet asking for an org RFP-tool budget. Solo is the first surface where the AI consumption envelope is engine-absorbed — the Free hard cap is gone, and the engine throttles low-priority background work silently rather than blocking the bid response.

### 5.1 Pricing options

Two billing structures, seller's choice:

- **Subscription:** $49/mo billed annually (~$588/yr) or $59/mo billed monthly. Auto-renews; cancellable at any time.
- **Per bid:** $199 charged on bid submission. No subscription, no auto-renew. Seller pays once per submitted bid. Charged on submission, not on signup or workspace creation.

The per-bid option matches Seller Maya's CFO/VP-of-Sales-friendly fixed-expense mental model ("there's a deal at the end of this bid; the $199 is a known cost against that opportunity"). The subscription option is for sellers who anticipate ≥3 bids within 12 months. The two paths share one entitlement set; a seller can convert from per-bid to subscription mid-bid with the $199 already paid credited against the first month.

### 5.2 Included

- Full Bid Workspace
- Unlimited seats
- 1 concurrent invited bid (same as Free; trigger to Starter is second concurrent)
- Unlimited invitations over time
- **250 KB entries persistent** (vs Free's 50)
- 1 lifetime KB Bootstrap **plus 1 re-bootstrap per year** (vs Free's lifetime-only)
- **1 Firecrawl source, weekly crawl** (vs Free's 0 — introduces automation at the lowest paid tier)
- **Engine-absorbed AI envelope** per Master Spec §34.1.2 / §34.2.5. No hard cap; engine throttles low-priority capabilities silently if envelope is approached. Seller never sees value-dollars, wallet UI, rate card, or per-op pricing.
- **First-Pass RFP Generator engine-absorbed** — same engine as Starter+, surface-abstracted (no "you're out of budget" mid-bid wall)
- **Verified tier eligibility** — Solo seller can earn Verified verification badge once profile completeness + SOC 2 or ISO doc is uploaded and validated by Ops (vs Free's Basic-only ceiling)
- 1 SellerSoftware entity (same as Free)
- 3 Capability Declarations (same as Free; trigger to Starter is the 4th)
- Published Seller Profile (same as all tiers)
- 90-day post-bid read-only retention
- **Email support** (vs Free's community)

### 5.3 Not included (Solo → Starter upgrade triggers)

The following ceilings exist to surface the right upgrade moment for Seller Maya. All four are deliberately preserved at Free-tier levels (or close) to keep the Starter conversion lane clear:

- **Second concurrent bid.** Solo allows 1 active bid at a time. A second buyer invite while the first is in flight triggers the Starter upgrade CTA: *"Starter unlocks 3 concurrent bids and keeps your KB shared across all of them."* This is the single dominant Starter trigger per §15.3.
- **First EOI attempt.** Solo (like Free) blocks proactive EOIs entirely. Clicking "Submit EOI" on a Marketplace listing triggers: *"Outbound EOIs start at Starter. Your first 10/month are included."*
- **4th Capability Declaration.** Solo allows 3 (same as Free). The 4th declaration triggers: *"Starter unlocks 25 Capability Declarations and lets you target more buyer evaluations."*
- **KB ceiling at 250 entries.** Solo's 250 entry cap is generous for ~3–5 bids, but a high-volume seller will hit it. Triggers: *"Starter unlocks 1,000 KB entries and keeps your existing work."*
- **Sustained AI-envelope throttling.** If the engine throttles low-priority capabilities ≥3 times in a 30-day window (subscription) or hits envelope on a single bid (per-bid), the upgrade CTA fires: *"Starter unlocks $30/mo of visible AI budget and lifts background-suggestion limits."*
- **First Firecrawl source beyond the 1 weekly included.** Adding a 2nd source triggers: *"Starter unlocks 2 weekly Firecrawl sources and lets you keep more of your site fresh."*
- **Seller Page Enrichment.** Not available on Solo. Starter unlocks 1/yr.
- **Numeric Match Scoring.** Solo (like Free and Starter) shows labels only. Numeric scores require Growth+.
- **CRM Sync.** Growth+.
- **Promoted placements.** Scale+.
- **Enterprise controls** (SSO/SCIM/residency, custom DPA, custom RevOps integrations). Solo is personal-card; enterprise controls require an org contract.

### 5.4 Per-bid billing mechanics

The $199 per-bid charge fires on bid submission. Specifics:

- **Trigger.** Seller clicks "Submit Bid" on a finalized response. Stripe charge is captured; submission is delivered to the buyer.
- **No subscription.** No recurring charge. The seller's account remains Free-tier between charges, with the bid response read-only (90-day retention).
- **Subsequent bids.** Each new bid re-triggers the $199 charge on its submission. Sellers who anticipate ≥3 bids/yr typically convert to the $49/mo subscription.
- **Refund window.** 7-day refund window from charge, no questions asked, provided the buyer has not yet opened the submission. If buyer has opened, refund is judgment-call (operator support).
- **KB persistence per-bid.** The KB created during a $199 bid persists at 250-entry ceiling for 90 days post-bid. After 90 days, entries above the Free 50-entry cap become read-only (preserved, not deleted, per the no-destructive-deletion discipline). New $199 bid resets the 90-day clock.
- **Mid-bid conversion.** If the seller converts to subscription mid-bid after charging, the $199 is credited against the first month of subscription, not refunded.

### 5.5 Surface discipline (per Principle 9)

The Solo surface intentionally hides every engine concept that does not require seller judgment. Specifically not surfaced on Solo:

- AIOperation accepted/rejected accounting
- Value-dollars / cost-dollars rate card
- Wallet, overage, auto-topup
- Per-capability spend breakdown
- Plan tier matrix (Solo seller sees only their plan; tier names appear only at upgrade-CTA moments)
- Capability Declarations as authored objects (auto-generated from KB on the Solo surface; seller sees only the resulting category list — *"Your profile is now discoverable for: CRM, Sales Engagement, Lead Scoring."*)
- Match Scoring numeric math (labels only)
- KB governance, staleness classifier, dedupe (silent; weekly notification "*We refreshed your knowledge base from your website — N new entries proposed.*")
- Console firewall (always-true, never named)

Cross-reference: Master Spec Appendix M (Surface/Engine Mapping) is the canonical contract.

### 5.6 Fit

- A first-time bid responder (Seller Maya) at a 50–500-person B2B SaaS vendor — AE, SE, or Bid Manager — forwarded a buyer invite from Sourcera with a 4-day deadline.
- A solo founder or 1–2 person revenue team at a smaller startup with occasional inbound RFPs and no dedicated RFP function.
- A consultant or fractional sales engineer responding to a single bid for a client and billing the $199 as a pass-through expense.

### 5.7 Anti-fit

- Sellers responding to >3 bids/quarter → Seller Starter or Growth.
- Sellers wanting outbound discovery (EOIs) → Starter+.
- Sellers needing Match Scoring numeric data → Growth+.
- Sellers requiring CRM Sync or Seller Signals → Growth+.
- Regulated-vertical vendors requiring SSO, custom DPA, or data residency → Enterprise.

---

## 6. Seller Starter — `$149/mo annual` / `$179/mo monthly`

*(Was §5 in v2; renumbered for v3.)*

Positioning: *"You respond to RFPs occasionally and want Sourcera doing the grunt work."*

- 3 concurrent invited bids
- 10 proactive EOIs/month
- KB up to 1,000 entries
- 2 Firecrawl sources, weekly crawl
- 1 re-Bootstrap per year
- $30/mo AI budget (visible)
- Verified tier eligibility (auto-unlocked when criteria met)
- Published Seller Profile (same as Free and Solo, but now eligible for Verified badge auto-unlock pipeline)
- 5 SellerSoftware entities
- 25 Capability Declarations
- 1 Seller Page Enrichment per year
- Monthly category Seller Signals digest
- Email support

**Fit:** Small revenue team (1–3 people) responding to 10–30 RFPs/yr. The natural step up from Solo when the second concurrent bid arrives or the EOI lever is wanted.

**Anchor:** Responsive (formerly RFPIO) starter at ~$7K/yr; Sourcera Starter at ~$1,800/yr with KB + Marketplace bundled is 4× cheaper on the RFP tooling dimension alone.

---

## 7. Seller Growth — `$499/mo annual` / `$599/mo monthly`

*(Was §6 in v2; renumbered for v3.)*

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

## 8. Seller Scale — `$1,499/mo annual` / `$1,799/mo monthly`

*(Was §7 in v2; renumbered for v3.)*

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

## 9. Seller Enterprise — Custom, `$3,000/mo` floor

*(Was §8 in v2; renumbered for v3.)*

- All Scale features
- SSO, SCIM, IP allowlist, data residency, custom DPA
- Dedicated CSM, onboarding, QBR
- Committed annual AI spend (minimum $12K/yr value-dollar commit)
- Volume discount on overage: per Master Spec §34.2.4 (Enterprise Committed Spend volume-discount bands; no inline restatement in this companion doc)
- Full API access (read + write)
- 3 Promoted placements per month
- Custom CRM/RevOps integrations (Gainsight, Outreach, Salesloft, 6sense) scoped per contract
- SLA: 99.9% uptime, 4-hour critical response

**Gate:** Seller Enterprise is only sold when one of {SSO required, DPA required, ≥$12K AI commit, custom RevOps integration} is present. Otherwise the seller belongs on Scale. The $3K/mo floor exists because dedicated CSM drags margin below the 90% target unless offset by both subscription and committed AI spend.

---

## 10. Seller-Side Capability Rate Card (for wallet overage)

*(Was §9 in v2; renumbered for v3. Wallet overage is a Starter+ surface; never surfaces on Solo or Free.)*

Same mechanic as the buyer side: wallet overage is off by default; the admin explicitly enables it and sets a monthly cap. Rates are cost-adaptive (`value = cost_base × 10`; `cost = cost_base × 1.05`).

Derived from the current Master Spec §21.4 / §22 / §34 cost-base and rate-card contracts. Historical seed estimates came from retired KB engineering inputs and no longer override §34:

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

All rates derived nightly from actual Anthropic + Convex cost; multiplier held constant; published at `api.sourcera.com/v1/pricing`. **Solo accounts continue to consume capabilities from their absorbed envelope; the rate card is engineering-transparent, never seller-facing on Solo.**

---

## 11. Seller-Side Outcome Signals

*(Was §10 in v2; renumbered for v3. Mechanics unchanged.)*

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

## 12. Cross-Side Billing Rules

*(Was §11 in v2; renumbered for v3 with Solo-tier pooling note added.)*

An Organization may be a buyer, a seller, or both. The pricing model handles this explicitly:

1. **Plans activate per console, not per Org.** An Org can hold (Buyer Growth + Seller Starter), (Buyer Solo + Seller Solo), (Buyer Free + Seller Scale), etc.
2. **AI budgets are Org-scoped and pooled across consoles — at Business+/Starter+ tiers.** If an Org has Buyer Growth ($300 budget) and Seller Starter ($30 budget), it has $330 of unified AI budget. Any capability in either console draws from it. **Solo-tier absorbed envelopes do not pool** — each Solo console maintains its own absorbed envelope, sourced from Master Spec §34, surfaced as a single line item per console, and engine-managed independently.
3. **Wallet overage settings are Org-scoped.** One wallet, one cap, one auto-topup config — across Business+/Starter+ tiers. Solo accounts have no wallet (see §2.9).
4. **Dual-Console Firewall is unchanged.** Billing is shared (where applicable); data is not.
5. **Enterprise counts once.** An Org with Buyer Enterprise and Seller Enterprise pays one combined contract with a single committed spend minimum (set at the higher of the two floors, so $3K/mo).
6. **Solo cross-console combinations are charged independently.** An Org holding Buyer Solo subscription + Seller Solo subscription pays $98/mo (two separate $49 subscriptions). No bundled discount on Solo — the per-console pricing is already the personal-card on-ramp.

This structure ensures the pricing never penalizes Orgs that use both sides of the platform (which is exactly the behavior the marketplace wants).

---

## 13. Marketplace Discovery Pricing — The Non-AI Layer

*(Was §12 in v2; renumbered for v3. Mechanics unchanged.)*

Some seller-side monetization is not AI-accounted. It is traditional media/visibility pricing, controlled by Sourcera Ops to preserve Marketplace trust.

### 13.1 Promoted Listings
- 1 included per month at Scale, 3 at Enterprise; not available below Scale (including Solo and Starter).
- Each placement is category-capped (max 3 promoted per category at a time) to prevent noise.
- Additional placements can be purchased at **$500/category/week** on Scale and Enterprise only. Hard-capped at 4 additional per month to prevent any single seller from saturating a category.

### 13.2 Verification Tiers
- **Basic** (free, Free tier only) — domain verification only
- **Verified** (free when earned; **Solo+**) — requires profile completeness + SOC 2 or ISO document uploaded and validated by Ops
- **Certified** (free when earned; Growth+) — requires Verified + ≥ 3 closed bids on Sourcera with buyer-side confirmation

Tiers are gating signals for buyer trust, not billing surfaces. No seller ever pays Sourcera for a verification tier; the cost of Ops review is absorbed in the plan. **Solo's elevation of Verified eligibility from Starter is a deliberate v3 change** — it gives Seller Maya the same trust signal as a paid Starter customer for $49/mo, accelerating buyer-trust building at the personal-card on-ramp.

### 13.3 Featured Placements on Category/Comparison Pages
- Strictly editorial. Controlled by Marketing, not purchasable. Featured sellers are chosen based on {verification tier, category relevance, KB health score, buyer engagement signals}. Preserves the integrity of Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12) as a true organic-search moat.

---

## 14. Financial Scenarios

*(Was §13 in v2; renumbered and extended for v3 with a Solo scenario D.)*

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

### Scenario D — Seller Solo tier mixed cohort *(new in v3)*

A representative Year-1 Seller Solo cohort with both subscription and per-bid transactions:

- 300 Solo subscribers × $49 × 12 = **$176,400**
- 1,200 Solo per-bid transactions × $199 = **$238,800**
- Total Solo revenue: **$415,200**
- AI COGS:
  - Subscription: 300 × $0.54/mo absorbed (full §34 Solo envelope at 70/30 mix) × 12 = $1,944
  - Per-bid: 1,200 × $0.54 absorbed = $648
  - Total: $2,592
- Stripe processing (subscription 300 × 12 × ($49 × 2.9% + $0.30) ≈ $6,196; per-bid 1,200 × ($199 × 2.9% + $0.30) ≈ $7,285): ~$13,500
- Verified-tier Ops review (one-time per Solo seller earning Verified, ~$12 loaded cost per review, ~60% of subscribers + 30% of per-bid earn Verified): $180 × $12 + 360 × $12 = $6,480
- Infra: ~$5,200
- Refund reserve (5% of per-bid volume): ~$11,940
- Total direct cost: ~$39,712
- **Gross margin: ~90.4%** (no CSM on Solo, low-touch email support, modest Verified-tier Ops review cost)

Solo seller revenue is materially higher than Solo buyer revenue per cohort because the per-bid frequency is naturally higher (each bid is a transactional moment) and the Free→Solo conversion is supported by the dominant pain point (mid-bid AI budget wall) that Solo's silent throttling solves directly. Solo seller is a strong on-ramp into Starter and a high-margin standalone tier.

### Target mix (Year-1 exit, seller side, v3)
- 25% Solo subscription / 25% Solo per-bid / 25% Starter / 15% Growth / 8% Scale / 2% Enterprise
- Blended seller-side gross margin target: **≥90%**
- The v2 mix (55% Starter / 25% Growth / 15% Scale / 5% Enterprise) shifts in v3 toward Solo because Seller Maya is the v7.1 surface persona — most Free converts will land on Solo first via the mid-bid budget-wall trigger, with a subset graduating to Starter on the second-concurrent-bid trigger.

### Combined (buyer + seller) Year-1 exit blended target
If buyer-side mix hits the v3 target (35/25/20/12/6/2) and seller-side hits (25/25/25/15/8/2), combined blended margin clears ~91% with Enterprise <5% of accounts on both sides. The Solo-heavy mix on both consoles strengthens blended margin vs the v2 baseline because Solo's ~90–92% margin offsets Enterprise CSM drag more efficiently than Starter does.

---

## 15. PLG Motion (Seller-Side) — The Forced-Signup Opportunity

*(Was §14 in v2; renumbered and extended for v3 with the Solo on-ramp.)*

The most valuable signup Sourcera will ever get is the one the vendor did not ask for.

When a buyer invites a vendor through M1 (Vendor-Invite-Creates-Account), M5 (Buyer-Pull Vendor Invite), or M15 (Ghost-Bid Importer), the vendor arrives at Sourcera under an unusually favorable set of conditions: they have an incoming RFP, a deadline, no chosen tool, a blank response to write, and zero existing workflow to defend. They are at peak pain. And they have an immediate business reason to engage.

This is the only PLG moment in the product that converts involuntary signup into measurable value inside the first session. The seller pricing strategy is designed to exploit this moment as aggressively as the anti-spam controls allow.

### 15.1 The Hero Moment — "Your first bid is already drafted"

On magic-link signup from a buyer invite, the following happens synchronously before the vendor ever sees an empty workspace:

1. **Domain Bootstrap.** The KB Bootstrap capability crawls the vendor's public homepage, help center, docs, and trust center. Opus-tier, drawn from the lifetime-free bootstrap allowance on Free. ~30–90 seconds.
2. **KB Propose.** 40–200 draft KB entries are staged for review, each with a confidence score and a provenance URL ("from: yourcompany.com/security").
3. **First-Pass Draft.** The First-Pass RFP Response Generator drafts responses for every requirement in the buyer's evaluation, citing the newly bootstrapped KB entries. Typically covers 40–70% of requirements with high-confidence draft.
4. **Landing screen.** The vendor lands not on an empty workspace but on:
   > *"Your bid for [Buyer Company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website. Review and approve to submit."*

This collapses the new-vendor cold-start wall from roughly 2 days (status quo: manual triage, KB hunt, draft from scratch) to ~30 seconds of latency hidden behind a progress bar that reads as onboarding.

**Why this converts without paywall.** The vendor did not ask for a demo. They arrived to do work. They see their own content in the tool before they interact with it. They see the buyer's real requirements (not a sandbox) being answered with their real capabilities. They hit the upgrade ceiling only AFTER they've seen the value — not before.

### 15.2 Tracked activation metric

**"Minutes from magic-link click to first submitted requirement response"** — target p50 < 20 minutes, p90 < 60 minutes. This is the highest-leverage PLG metric in the product and should be a top-level founder dashboard number. Every product decision on the seller onboarding surface should be evaluated against whether it moves this metric.

### 15.3 The conversion moments

The seller funnel is deliberately designed around four distinct upgrade triggers, each with a different buying reason and a different target tier. The pricing model should not optimize any single one — the product should catch all four.

| Moment | Trigger | Buying reason | Target tier | Message |
|---|---|---|---|---|
| **1. Mid-bid AI budget wall** *(new in v3 — primary Solo trigger)* | Vendor's Free AI hard cap exhausts mid-response on a dense RFP | Necessity — *"my response is blocked"* | **Solo** | *"Your bid response is paused — Sourcera Free's AI budget is exhausted. Solo unlocks the engine-absorbed envelope (no hard cap, no mid-bid walls) for $49/mo or $199/bid."* |
| **2. Second concurrent bid** | Vendor receives a second buyer invite while first is still in flight | Urgency — *"my deal is at risk"* | **Starter** | *"Starter unlocks 3 concurrent bids and keeps your KB shared across all of them."* |
| **3. First EOI attempt** | Vendor clicks "Submit EOI" on a Marketplace listing | Ambition — *"I want to find more deals"* | **Starter** | *"Outbound EOIs start at Starter. Your first 10/month are included."* |
| **4. KB ceiling** | Vendor approaches 50-entry KB cap (Free) or 250-entry cap (Solo) after multiple bids | Investment — *"I don't want to lose what I've built"* | **Solo** (from Free) or **Starter** (from Solo) | *"Your KB is about to hit the [Free / Solo] ceiling. [Solo / Starter] raises it to [250 / 1,000] entries and keeps your existing work."* |

### 15.4 Paid-path progression

1. **Signup (Free).** Triggered by buyer invite (M1/M5), ghost-bid importer (M15), or direct signup. Magic-link; Google/MS SSO; no credit card. Published profile and first bootstrap happen inside signup.
2. **Aha moment.** Hero moment above. The KB is non-zero on day one, responses are drafted, seller reviews and submits.
3. **First invited bid submitted (Free or Solo per-bid).** Seller closes a real bid on Sourcera. Win/loss feedback from buyer informs KB value scoring.
4. **First ceiling (Free → Solo or Free → Starter).** Most common path is the mid-bid AI budget wall (Moment 1) routing to Solo. Higher-volume sellers route directly to Starter via Moments 2 or 3. KB ceiling can route either direction depending on context.
5. **Solo expansion (Solo → Starter).** Triggered by second concurrent bid (Moment 2 — dominant), first EOI attempt (Moment 3), 4th Capability Declaration, KB ceiling at 250, or sustained AI-envelope throttling.
6. **Business expansion (Starter → Growth → Scale).** Bid volume, EOI volume, KB size, AI budget utilization, CRM Sync request. Growth upsell at 80% budget utilization for 2 consecutive months.
7. **Enterprise trigger.** SSO / DPA / ≥$12K AI commit / custom RevOps integration routes to founder-led sale.

### 15.5 Leading indicators (trackable solo)

- **Free → Solo conversion %** *(new primary v3 metric)*
- Free → Starter conversion % (direct, skipping Solo)
- Solo subscription → Starter conversion % at 90 days
- Solo per-bid ($199) repeat-purchase rate within 12 months
- % of Free sellers who receive a buyer invitation within 30 days (M1 effectiveness)
- **% of Free sellers whose KB Bootstrap generates ≥40 approved entries** (acceptance rate on the hero moment)
- **Minutes from magic-link to first submitted requirement response** (p50, p90)
- Days to first submitted bid on Free
- **% of Free sellers who hit the AI budget wall mid-bid** *(new v3 — drives Solo conversion)*
- Second-invitation arrival rate on Free or Solo cohort (directly predicts conversion moment 2)
- Starter → Growth expansion % at month 3
- EOI submission rate per tier (engagement signal)
- Rejected-op rate for First-Pass Responder (quality signal — target <30%)
- Solo-tier silent-throttle event rate (margin protection signal; should remain <5% of Solo accounts in any 30-day window)
- Blended seller-side margin per plan, including Solo subscription and Solo per-bid as separate cohorts

### 15.6 Buyer-Funded Pro Trial Seat (M17) — interaction with Solo

Buyer-Funded Pro Trial Seats grant the invited vendor a 30-day Seller **Starter** trial (not Solo). This is intentional — Pro Trial Seats are the buyer's gift to maximize bid response quality, and Starter's $30 visible AI budget + 3 concurrent bids + 10 EOIs/mo is the right surface for that purpose. Solo is the personal-card on-ramp; Pro Trial is the buyer-funded fast-track to Starter. A vendor receiving a Pro Trial Seat skips Solo entirely. On day 31, the vendor auto-downgrades to Seller Free with 90-day read-only data preservation and is offered the Solo or Starter upgrade with the contextual carry-over CTA.

---

## 16. The Forced-Vendor-Signup Playbook

*(Was §15 in v2; renumbered for v3. Mechanics unchanged; Solo billing surface added at §16.5.)*

This section formalizes the mechanics that turn an incoming buyer invite into a paying Sourcera seller. Everything below assumes the invite has landed and the vendor has clicked the magic-link.

### 16.1 Pre-arrival preparation (hidden from vendor)

Before the vendor even clicks:
- Sourcera enriches the invite-target email domain against public records to pre-populate company name, industry, HQ region
- The Marketplace Tagger assigns probable category tags to the vendor based on domain + buyer-side evaluation context
- The bootstrap queue is pre-warmed — crawl URLs are resolved and rate-limited against Firecrawl

When the vendor clicks magic-link, the bootstrap starts within the SSO redirect latency window.

### 16.2 The onboarding surface (minutes 0–3)

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

### 16.3 In-workspace value proof (minutes 3–45)

**Inline citations on every draft.** Every First-Pass draft shows its KB citation in the response row itself: *"from: yourcompany.com/trust/soc2"* with a hover expansion showing the exact quoted sentence. This makes the AI output legible and trustworthy.

**Accept / Edit / Reject per requirement.** Three buttons, no keyboard shortcuts needed for first pass. Every click is a signal to the outcome resolver.

**Live budget counter (Free only).** Top of workspace shows *"AI budget used: $1.47 of the Free monthly budget · 23 drafts accepted, 3 rejected."* Cost is visible but not alarming — the budget is sized to cover exactly one small bid end-to-end. **On Solo, this counter is hidden** (per §2.9); the seller sees only "Plan: Solo" with no budget anxiety surface.

**KB-gap detector.** When a draft is rejected, the empty state is not a dead end:
> *"No KB content answered this. Write your answer below and we'll save it as a KB entry."*
>
> [Inline text field]

The vendor's inline rejection becomes a new KB entry in one step. Every rejection grows the KB.

**"AI got this right" — one-click confirmation.** Accepting a draft with no edits records the strongest possible acceptance signal and surfaces a subtle confirmation chip *("added to your KB as verified response")* that reinforces value delivery.

### 16.4 Post-submission reveal (hour 1+)

When the vendor clicks Submit, the closing screen reads (Free):

> *You just built a reusable KB of **47** verified entries in **35 minutes**.*
> *Your next bid will reuse them automatically.*
> *Sourcera tracked **$1.47** of value pricing for the AI work on this bid (covered by your Free plan).*

On Solo, the same screen reads:

> *You just built a reusable KB of **47** verified entries in **35 minutes**.*
> *Your next bid will reuse them automatically.*
> *Solo's engine handled the AI work — no budget walls, no mid-bid interruptions.*

This is not an upgrade CTA. It is a **stake-reveal screen** — a deliberate reminder of what the vendor has built, what it's worth, and how it compounds. The upgrade conversations come later when the natural ceilings hit.

### 16.5 Solo billing surface *(new in v3)*

For Solo subscribers and per-bid transactions, the billing UI is a single card:

- **Subscription:** *"Plan: Solo · $49/mo · Renews 2026-05-26 · Cancel anytime"*
- **Per bid:** *"Bid for [Buyer Company] · $199 charged 2026-04-26 · 7-day refund window · 90-day retention"*

No wallet UI. No rate card. No per-op breakdown. No "AI budget remaining" widget. Per Principle 9 and Appendix M.

### 16.6 The Buyer-Funded Pro Trial Seat (expansion mechanic — see §15.6)

**Mechanic:** When a buyer is on Scale or Enterprise, they receive a pool of **Vendor Pro Trial Seats** (5/mo on Scale, 15/mo on Enterprise). When that buyer invites a vendor, the invite can optionally grant the vendor a 30-day Seller Starter trial — free to the vendor, free to the buyer beyond the seat allocation, cost absorbed into the buyer's plan.

**Why it works:**
- The buyer's invite is already the highest-converting moment in the seller funnel; a 30-day Starter trial eliminates the upgrade ceiling exactly when the vendor is most engaged.
- The buyer wins on response quality (the vendor gets access to better KB tooling, better drafts, better citations), so buyer NPS improves.
- Vendors who convert on day 30 have already built a KB under a Starter tier — they never see Free or Solo ceilings. Conversion rate should be materially higher than a Free→Solo→Starter cold start.
- Cost to Sourcera is bounded (AI usage still metered against the Org budget; the subscription itself is low-marginal-cost).

Registered as growth mechanic M17 in Master Spec §48 and operationalized in §34.13.

### 16.7 Win/Loss debrief as upgrade trigger

When a bid closes (won or lost), Agent generates a debrief:

**On win:**
> *You won. **KB entries cited on winning responses**: 24. Those entries are now higher-weighted in your KB — Sourcera learned what answers close deals for you. **Keep your KB alive** — upgrade to Solo for engine-absorbed AI on every bid, or to Starter for weekly Firecrawl crawls and 3 concurrent bids.*

**On loss (with buyer's published reasoning where available):**
> *You lost this one. **Gap analysis** identified 4 requirements where your KB had no strong answer. Those gaps are now flagged in your KB. Upgrade to Solo to **never see a mid-bid budget wall on your next response**, or to Starter to **let Sourcera crawl your product docs weekly** and fill gaps automatically.*

Win reinforces value. Loss creates a concrete upgrade reason tied to a specific identified gap. Both route to either Solo or Starter depending on which lever is most relevant — Solo for the never-walled-mid-bid value, Starter for the multi-bid, multi-source story.

---

## 17. Seller Onboarding Experience — Detailed Flow

*(Was §16 in v2; renumbered for v3. Solo billing surface added at §17.2 capability 11.)*

This is the product surface that delivers §15 and §16. It should be specced and engineered as a single vertical slice before seller pricing goes live.

### 17.1 Seven-stage flow

| Stage | Duration | State | Key product surface |
|---|---|---|---|
| 1. Magic-link arrival | 0–30s | Invited, not-yet-authed | Buyer invite email, magic-link |
| 2. Signup + bootstrap | 30s–3m | Auth'd, bootstrapping | Progress storytelling screen |
| 3. Landing | 3–5m | Bid ready, drafts staged | Ready-workspace landing |
| 4. Review and submit | 5–60m | Actively responding | Bid Workspace with inline drafts + KB builder |
| 5. Post-submit reveal | Day 0 | Bid submitted | Stake-reveal screen (Free vs Solo variants per §16.4) |
| 6. Outcome debrief | Day 3–30 | Bid closed by buyer | Win/loss debrief surface |
| 7. Upgrade touch | Day 1–90 | Conversion moment triggered | Contextual upgrade CTA per §15.3 (Free→Solo or Free→Starter or Solo→Starter) |

### 17.2 Required platform capabilities

Shipped as a dependency for the pricing model to go live:

1. **Magic-link SSO orchestrator** that starts the bootstrap inside the SSO redirect latency
2. **Progress storytelling UI** that renders bootstrap and first-pass status honestly (never fabricates steps)
3. **Inline-citation UI** on every First-Pass draft response row
4. **Budget counter** persistent at top of Bid Workspace **on Free only** (hidden on Solo per §2.9)
5. **KB-gap detector** in rejected-response empty states with 1-click KB-entry creation
6. **Stake-reveal screen** on first bid submission with Free vs Solo variants
7. **Outcome debrief surface** triggered by buyer-side bid close
8. **Contextual upgrade CTAs** that carry-over KB, bids, and in-flight state (no data loss in any upgrade path)
9. **Buyer-Funded Pro Trial Seat** plumbing (pool allocation, 30-day Starter trial state, auto-downgrade on day 31 with data preservation)
10. **Free-ceiling-approaching notifications** at 40/48 KB entries (Free), 200/240 KB entries (Solo), 80% budget utilization (Free), first EOI attempt
11. **Solo billing surface** *(new in v3)* — single-card billing view per §16.5; Stripe subscription and per-bid charge orchestration; 7-day refund window logic; Solo silent-throttle notification surface; Verified-tier eligibility flagging on Solo accounts; KB-cap behavior on per-bid 90-day retention windows

### 17.3 Onboarding anti-patterns (explicitly banned)

The onboarding surface must not:
- Ask for a credit card at any point before the first upgrade intent click (Solo upgrade CTA is the first credit-card touchpoint)
- Require the vendor to describe their company or industry before bootstrap runs
- Gate any feature behind a "try Pro free for 14 days" modal on first login — the hero moment is the pitch
- Show a pricing page until the vendor has submitted their first bid
- Use dark patterns on the upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency)
- Present the upgrade offer during active bid work — only at natural completion points or ceiling events
- **Surface AI consumption metering, value-dollars, wallet, or rate card on Solo accounts** *(new in v3 — per Principle 9)*

These bans exist because the supply-side flywheel depends on vendors trusting Sourcera enough to let an AI touch their buyer's evaluation. Any onboarding friction that reads as sales-ey kills that trust.

---

## 18. KB Value Capture & Stake-Building

*(Was §17 in v2; renumbered for v3. Mechanics unchanged.)*

The KB is the most important asset in the seller relationship with Sourcera. Every pricing and product decision must reinforce the truth that **the KB belongs to the seller, grows with use, and is more valuable on Sourcera than anywhere else**.

### 18.1 Honest portability

The KB must be exportable in full (Markdown + JSON schema + metadata + provenance) at every tier, including Free and Solo, at any time. This is a trust commitment, not a feature. Hostile lock-in creates a reputational leak that costs more than the retention it buys.

### 18.2 On-platform compounding

What exports *can't* capture:
- **Confidence scores** earned from acceptance/rejection signals (these are Sourcera's learning, not the raw content)
- **Staleness state** derived from Firecrawl re-crawls and cross-bid dismissal patterns
- **Win-rate weighting** from closed-bid outcomes
- **Cross-bid citation graph** showing which entries close deals
- **KB-to-Capability auto-declarations** generated from entry clustering

These compounding assets make the KB materially more valuable inside Sourcera over time than as an export. Every paid tier unlocks more of the compounding surface — which is the honest upgrade argument.

### 18.3 KB value meter (product surface)

A persistent meter in the Seller Console shows:
> *Your KB: **47 entries** · **6** cited in closed bids · **2** with win-rate lift · Estimated value as reusable response library: **$1,275/yr** saved response time.*

The last number is a conservative calculation (entries × avg response time saved × loaded hourly rate) and is **visible on Free and Solo** — because the meter works better as an honest stake-builder than as a dangled Pro feature.

### 18.4 Upgrade carry-over guarantee

Every upgrade path must carry KB, in-flight bids, Capability Declarations, and Firecrawl source configs forward without re-setup. The upgrade CTA text should explicitly state this: *"Your 47 KB entries, 1 in-flight bid, and 3 Capability Declarations carry over automatically."*

Every downgrade path must preserve data in read-only state for 90 days per the buyer-side downgrade-safe preservation rule. No destructive deletion. **On Solo per-bid, the 90-day retention runs from the bid submission date** — KB entries above the Free 50-cap remain readable for 90 days, then become read-only (preserved, not deleted).

---

## 19. Seller-Side Network Effects

*(Was §18 in v2; renumbered for v3. Mechanics unchanged; Solo contribution added.)*

The seller side has its own compounding loops that reinforce the GTM flywheel. The pricing model is designed so that every one of these loops operates regardless of plan tier — free and Solo sellers contribute to all of them.

### 19.1 Invited-Vendor → Published-Profile → Marketplace-Ready Inventory

Every invited vendor lands with a bootstrapped KB, a published Seller Profile, a SellerSoftware entity, and up to 3 Capability Declarations — all free. Marketplace inventory grows by one searchable, category-tagged, verified-domain listing every time a buyer invites a vendor. Free vendors grow inventory; Solo and paid vendors drive revenue and unlock Verified/Certified trust tiers. None cannibalize the others.

### 19.2 KB → Capability Declaration → Match Score → EOI → Revenue

As vendors accept bootstrapped KB entries, the KB-to-Capability Auto-Suggestion capability (C.46) generates Capability Declarations. Those declarations feed Match Scoring, which feeds SEO-ranked Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12). A free or Solo vendor's bid work compounds into organic search real estate for Sourcera — and matching quality improves for every seller.

### 19.3 Bid-Close → Win/Loss Signal → Platform Learning

When bids close, Sourcera learns what KB content correlates with wins. This feeds:
- Per-entry confidence weighting inside the vendor's KB (compounding value for that vendor)
- Aggregate Marketplace Match Score calibration (improves for all vendors)
- Market Intelligence Report content (M12, SEO moat for Sourcera)
- Seller Signal quality (Growth+ paid feature value rises with every closed bid)

One bid close per vendor per month, across 200 active vendors, is 2,400 Match Score calibration events per year. Signal quality compounds. Solo per-bid sellers contribute equally to this loop because each $199 charge fires on submission — every Solo per-bid is a closed-loop signal event.

### 19.4 Seller-Profile SEO Loop

Published Seller Profiles and Software Pages emit Schema.org structured data. Organic traffic to these pages drives:
- Inbound buyer signups (dual-side acquisition)
- Seller ROI on Sourcera (their Sourcera profile becomes a ranking asset)
- Per-category SEO moat for the Marketplace
- A structural defense against Gartner/G2 — they own category reviews; Sourcera owns category inventory

Free and Solo sellers contribute to all three without proportional cost to Sourcera.

### 19.5 Ghost-Bid Import Loop (M15)

Sellers who were already invited to RFPs outside Sourcera can paste historical RFPs and have Ghost-RFP Ingestion (Opus, $25 value per RFP) seed their KB from prior work. First import free per Seller Org. This catapults vendors with RFP history over the KB-accumulation barrier and accelerates paid conversion — the vendor arrives at the upgrade ceiling in one session instead of over 2–3 bids.

### 19.6 Buyer-Funded Pro Trial Loop (M17)

Per §16.6. Buyers on Scale/Enterprise gift Pro Trial Seats to invited vendors. Trial-converted sellers skip the Free and Solo-tier experience entirely and enter Starter with zero friction. Expect materially higher conversion rate than cold-start Free→Solo→Starter. Adds a dollar-meaningful seller-side lift to the buyer's Scale/Enterprise plan value proposition.

### 19.7 Template Publish Incentive (M9)

Sellers who publish non-confidential response templates to the Template Library (e.g., SOC 2 response block, GDPR DPA block) earn Marketplace visibility credits — featured placements inside Category Pages. This incentivizes shared content creation and increases the velocity of new-vendor onboarding (every published template reduces the time-to-KB for future bootstrapped vendors).

### 19.8 The reinforcing loop summary

```
Buyer invite
  → Forced vendor signup
  → Hero moment (bootstrap + first-pass + published profile)
  → Bid submitted (Free, Solo per-bid, or Solo subscription)
  → KB compounds with every bid
  → Marketplace inventory grows
  → SEO compounds
  → Inbound buyer demand grows
  → More buyer invites
  → ...
```

Every pricing gate is placed downstream of a loop contribution, so free and Solo sellers keep the flywheel spinning while paid sellers fund it.

---

## 20. Anti-Spam and Marketplace Integrity Controls

*(Was §19 in v2; renumbered for v3. Mechanics unchanged.)*

Seller-side pricing levers are all constrained by the anti-spam and marketplace-integrity framework in Master Spec §48.4. Notable gates:

- EOI submission is rate-limited per seller, per category, per buyer — independent of plan ceiling
- Capability Declarations are validated against the controlled taxonomy; fabricated declarations are suppressed
- Signal Integrity Monitor flags sellers with anomalous EOI submission velocity, low Match Score → EOI conversion, or high buyer-reported noise
- Sellers can be downgraded, throttled, or suspended by Ops Console if they abuse outbound tools regardless of plan
- Template Spam ML Classifier operates across all tiers
- k-anonymity floor (k=5 signal, k=10 aggregate, k=20 market intelligence) applies to all Seller Signals regardless of plan
- Free and Solo sellers who publish Profiles but never respond to invites or submit bids within 180 days are demoted in Marketplace ranking to prevent zombie-inventory pollution

Pricing gives sellers access to outbound tools; Marketplace integrity defines the acceptable use floor. A paid tier is not an unlimited license to pollute.

---

## 21. Migration from v2

*(Was §20 in v2; renumbered and rewritten for v3 to capture the Solo / surface-abstraction deltas.)*

**v2 → v3 deltas:**

| Area | v2 | v3 |
|---|---|---|
| Plan count | 5 (Free + Starter + Growth + Scale + Enterprise) | 6 (Free + **Solo** + Starter + Growth + Scale + Enterprise) |
| Solo tier | — | $49/mo annual / $59/mo monthly OR $199/bid |
| Free AI budget behavior | $5/mo with hard cap | $5/mo with hard cap (unchanged) |
| Solo AI budget behavior | — | **Hidden (§34.1.2 / §34.2.5; engine throttles silently — no hard cap)** |
| Verification tier ceiling on Solo | — | **Verified eligible** (was Starter+ in v2) |
| KB ceiling on Solo | — | 250 entries (between Free's 50 and Starter's 1,000) |
| Firecrawl on Solo | — | 1 weekly source (between Free's 0 and Starter's 2) |
| KB Bootstrap on Solo | — | 1 lifetime + 1/yr re-bootstrap (between Free's lifetime-only and Starter's lifetime + 1/yr cadence) |
| First-Pass Generator on Solo | — | **Engine-absorbed (silent)** |
| Solo billing surface | — | Single-card line item; no wallet, no rate card, no per-op breakdown |
| Default surface mode | Implicit single-operator on Free; multi-operator on paid | Solo Mode on Free + Solo; Team Mode on Starter+ |
| PLG paid path | Free → Starter → Growth → Scale → Enterprise | Free → **Solo** → Starter → Growth → Scale → Enterprise |
| Conversion moments | 3 (second concurrent bid, first EOI, KB ceiling) | 4 (mid-bid AI budget wall added as the dominant Free→Solo trigger) |
| Outcome accounting | Visible on Starter+ wallet overage | Visible on Starter+; **engine-only on Solo** |
| Section count | 21 | 22 (Solo Plan inserted as new §5; §5–§21 renumbered to §6–§22) |

**Spec sections updated (Phase 14.9 — Master Spec scaffolding edit, landed 2026-04-27):**
- Master Spec §34.1.2 (Seller Plan Tiers) — Seller Solo column registered with all gating numerics; pricing docs cite §34.1.2, never restate.
- Master Spec §34.2.2 (Seller Pricing) — Solo row added with subscription ($49 annual / $59 monthly) and per-bid ($199) pricing.
- Master Spec §34.2.5 (Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration) — newly authored authoritative section covering Stripe-trigger-on-bid-submit, 7-day refund window with buyer-open check, 90-day per-bid KB retention, and mid-bid subscription conversion crediting.
- Master Spec §34.10.3 (Pooled Budget Across Consoles) — Solo-co-resident pool rule added; Solo's engine-absorbed envelope is never customer-visible and never pools with the contralateral console's wallet.
- Master Spec §34.10.5 (Stripe Metering) — `sourcera_solo_buyer_per_eval_charge`, `sourcera_solo_seller_per_bid_charge`, `sourcera_solo_charge_refunded`, `sourcera_solo_subscription_started/renewed/canceled` meter events registered.
- Master Spec §34.12.1 (Per-Console Plan Activation) — Solo combinations added (Buyer Solo + Seller Free, Buyer Free + Seller Solo, Buyer Solo + Seller Solo, Buyer Solo + Seller Starter, Buyer Starter + Seller Solo).
- Master Spec §34.12.6 (Solo-Tier Per-Console Subscription Billing) — newly authored authoritative section confirming independent Stripe Subscriptions per console, no Solo-bundle discount, no §34.12.5 dual-Enterprise contract collapse for Solo.
- Master Spec §34.12.8 (Cross-Side Billing Failure Modes) — Solo failure modes added (Failure Modes #5–#7 covering Solo + Enterprise on opposite console, subscription-active per-charge attempt, refund processing delay).
- Master Spec §39 (Object Size Constraints) — Solo plan-tier object-size constraints cite §34.1.2 cells; Solo header note added.
- Master Spec §5.11 (Feature Access Matrix) — Solo plan-tier registration note added; existing Solo Mode default surface note preserved (§4.3.1 default applies to Buyer Solo only — Seller console is unconditionally compressed per §22.19).
- Master Spec Appendix J — Plan Tiers enum split into per-console `buyer_plan_tier` / `seller_plan_tier` with `buyer_solo` / `seller_solo` registered authoritatively; `billing_event_charge_kind` enum added with `solo_per_bid` registered.
- Master Spec Appendix M — Buyer / Seller Plan Tier enum rows updated; Solo billing surface, Solo engine-absorbed envelope, Solo per-eval / per-bid orchestration, Solo Selection Report watermarking (Buyer-only), Solo Defense View access (Buyer-only), Solo Verified-tier eligibility (Seller-only), Solo Capability Declaration auto-publish (Seller-only), Solo Mode pipeline compression, and Solo upgrade CTA rows added; Pro Trial Seat row's Hidden-from-tier list extended; tier-abbreviation legend updated to register `Bs` and `sSo`.

**Spec sections still pending (Phase 14.9.1 / 14.10 follow-up):**
- Master Spec §44 (Solo-Tier Surface Treatment — engine-only AI consumption + silent throttling; shared with buyer-side) — Phase 14.10 deliverable.
- Master Spec §22 (Seller KB integrated portions) — Solo Verified eligibility, 250 KB cap, 1 weekly Firecrawl, 1/yr re-bootstrap notes — Phase 14.9.1 follow-up to align §22's plan-tier inline references with the §34.1.2 Solo column.
- Master Spec §21.4 / §21.4.5 (capability catalog) — confirm Solo absorbed-envelope routing for `first_pass_rfp_draft`, `qa_suggestion`, `kb_to_capability_suggestion`, etc., via `surface_throttling_class` — Phase 14.10 deliverable.
- Master Spec §27.10 (Verification Tiers) — update verification-eligibility plan-tier check to allow `seller_solo` (currently the §5815 inline check rejects `seller_free` only; needs to confirm `seller_solo` is an accept) — Phase 14.9.1 follow-up.
- Master Spec §5.11 inline plan-tier list audit — Phase 14.9.1 follow-up to verify each inline tier-list string against §34.1.1 / §34.1.2 cell values.
- Master Spec §21.4 / §22 / §34 — confirm the capability registry, Seller KB contracts, and rate-card rows include all seller-side capabilities listed in §10 above.

**Customer migration:** Existing Free sellers receive an in-app announcement of the Solo tier with a 90-day Solo subscription trial offer (no credit card; auto-downgrades to Free at trial end). Existing Starter+ sellers are unaffected — no tier changes, no price changes. KB entries above the Free 50-cap on existing accounts are grandfathered in their current tier (no truncation on migration). Verified-tier eligibility is now Solo+ (was Starter+ in v2); existing Free sellers who would have qualified for Verified at Starter remain ineligible until they upgrade to Solo or Starter.

---

## 22. Positioning and Messaging (Seller-Side)

*(Was §21 in v2; renumbered for v3 with Solo-tier messaging added.)*

**Headline:** *Win more RFPs. Grind less. Get discovered.*

**One-liner:** Sourcera is the Software Evaluation Platform's Programmatic RFP Exchange where buyers find you — and the AI co-pilot that drafts your responses, keeps your KB fresh, and routes signals into your CRM.

**Three pillars:**
1. **Responding to invites is always free — and your first bid is already drafted when you log in.** No seat tax, no paywall to answer, no empty workspace.
2. **Your KB is your moat — we build it with you.** Automatic bootstrap, automatic crawling, automatic staleness detection. Your KB is honestly portable and compounds with every bid you close.
3. **Be discovered without cold outreach.** Published Seller Profile, Verified badge, Capability Declarations, and Match Scoring route qualified buyers to you.

**Solo-tier positioning (Seller Maya):**
- *"Your first bid, drafted and ready to submit — without the mid-bid budget wall."*
- *"$49/mo or $199/bid. Engine-absorbed AI. Verified badge eligibility. Email support."*
- Aimed at AE / SE / Bid Manager at 50–500-person B2B SaaS vendors responding to a forwarded buyer invite under deadline pressure, with no org RFP-tool budget on day one.

**Anti-positioning (seller-specific):**
- Not a proposal management suite (vs Responsive, Loopio) — those don't do discovery
- Not a review/intent platform (vs G2, Bombora) — those don't help you respond
- Not a lead-gen list (vs Apollo, ZoomInfo) — those don't route intent inside a structured evaluation
- **The first platform where RFP response tooling, demand discovery, and CRM-ready intent live in the same workflow with the same KB — with a personal-card on-ramp at $49/mo or $199/bid for first-time bid responders.**
