# Sourcera — Master Summary

**Version:** 1.1
**Date:** 2026-04-17
**Source Documents:** `Sourcera_Master_Spec.md` v6.0.0  · `KB_Engineering_Spec.md` · `UX_Design_of_Sourcera.md` · `Sourcera_Buyer_Pricing_Strategy.md` v2 · `Sourcera_Seller_Pricing_Strategy.md` v2
**Purpose:** Single-document reference that compresses the full Sourcera surface — positioning, method, design language, pricing (buyer + seller), PLG (buyer + seller), and every feature and sub-feature — into a buildable, sellable, and reviewable overview.

**v1.1 changeset:** Full integration of `Sourcera_Seller_Pricing_Strategy.md` v2. Expanded §2 (Core Principle, enriched Seller Plan Architecture, Seller Rate Card summary, Seller Outcome Signals, Marketplace Discovery Pricing — Non-AI Layer, seller financial scenarios). Expanded §3 (seller-side paid path, Hero Moment, three conversion moments, seller-side network effects, activation metric). Added §6.13.7 (KB Value Capture & Stake-Building), §6.16.6 (Marketplace Discovery Pricing), §6.28.2 (Seller Onboarding Experience). Appendix B glossary extensions; Appendix C entries C.128–C.141.

---

## 1. One-Pager — What Sourcera Is

**Tagline:** *Choose Correct. Move Faster.*

**One-liner:** The operating system for enterprise software procurement — evaluate faster, decide defensibly.

**What it is.** Sourcera is a purpose-built platform that replaces the spreadsheets, email threads, SharePoint folders, and PowerPoint decks that most organizations use to evaluate and purchase software. Buying teams and vendor teams work inside the same platform, separated by a strict Dual-Console firewall enforced at the database layer. Every evaluation follows a fixed 13-phase pipeline. An AI Agent — an always-on infrastructure layer, not a feature — handles the administrative overhead. Every decision produces an immutable audit trail.

Sourcera also includes a platform-native **Vendor Discovery Marketplace**, a third data domain where buyers publish evaluation opportunities and sellers are discovered via structured Capability Declarations and verified Seller Profiles. This transforms Sourcera from a tool used *after* vendor shortlisting into the place where the buyer-seller relationship *begins*.

### The Problem

Enterprise software procurement is high-stakes ($500K–$10M decisions), cross-functional (IT, InfoSec, Legal, Finance, Procurement, Executive), and frequent (3–10 evaluations/year for mid-market firms) — yet it is almost universally run on ad hoc spreadsheets, inconsistent scoring, scattered email Q&A, and recall-based decision justification. Two structural failures recur:

- **Evaluations are slow** because coordination across departments is manual.
- **Evaluations are subjective** because criteria and weights live in people's heads, not a shared scoring model.

On the vendor side, the same SOC 2 statements, DPA clauses, and product descriptions are copy-pasted into every RFP, and qualified vendors never learn about opportunities that didn't reach them through personal networks.

The downstream consequences: 6–12 week cycles, unexplainable "why did we pick Vendor A" outcomes, audit findings, failed migrations, and institutional knowledge that evaporates with staff turnover.

### What Sourcera Changes

- **Structure replaces chaos** — a fixed 13-phase pipeline, a strict requirement schema, and a shared scoring rubric.
- **Automation replaces busywork** — the Agent handles deduplication, policy parsing, evidence extraction, pre-scoring, TCO narratives, KB governance, Q&A drafting, and status reporting.
- **Audit replaces memory** — every mutation logged, every version tracked, every grade attributed. SHA-256 hashed Selection Record.
- **Velocity replaces drift** — SLA timers, Pulse Health Score, real-time collaborative scoring, tiered escalations.
- **Policy compliance replaces manual translation** — upload NIST / ISO / SOC 2, extract structured requirements, trace back to source controls.
- **Cost clarity replaces guesswork** — TCO Modeling with structured pricing inputs; Scenario Modeling for sensitivity.
- **Discovery replaces cold outreach** — the Marketplace connects buyers with qualified vendors via machine-searchable Capability Declarations.
- **Institutional knowledge replaces one-off effort** — self-governing Knowledge Base, automated crawling, Template Library, Organizational Intelligence.

### Who It's For

- **Primary ICP (Buyers):** Mid-market and enterprise organizations (200–5,000 employees, $500K–$20M annual software spend), especially in financial services, healthcare, government, and regulated industries. Buying teams of 3–8 spanning Procurement, IT, InfoSec, Legal, Finance, and an Executive Sponsor.
- **Secondary ICP (Sellers):** B2B SaaS vendors responding to 10–100 RFPs per year with no dedicated RFP team or an overwhelmed 1–2 person team.
- **Wedge ICP:** Mid-market companies currently building a spreadsheet evaluation — in pain *right now*.

### Category

Sourcera defines and owns the category of **Software Evaluation Platform** — distinct from procurement suites (Coupa, Ivalua), RFP response tools (Responsive, Loopio), and review platforms (G2, TrustRadius). The real competitor is the status quo: spreadsheets + email + SharePoint.

**Related (Appendix C) for §1 (Personas, Messaging, Category Narrative):** C.124 Buyer Personas · C.125 Messaging Playbook · C.127 Category Definition Narrative Arc.

---

## 2. Pricing Strategy Overview

Sourcera sells into a new category with multi-stakeholder buying teams, a distinct vendor-side audience, and no existing budget line on either side. The pricing model is designed to (a) get inside the org with zero friction on both sides, (b) be understood in 30 seconds, (c) never lose money on AI cost spikes, and (d) hit ≥90% blended gross margin at steady state.

Pricing is split across two parallel tracks — Buyer and Seller — sharing one accounting framework and one AI budget mechanic at the Organization level. The full specifications live in `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md`.

### 2.1 Core Principle — Invited Participation Is Free; Leverage Is Paid

The platform promise is narrowed — precisely — to the single mechanism that drives the two-sided flywheel:

> **A vendor invited to a specific evaluation can always respond in full, for free, to that invitation. The buyer running that evaluation can always run the structured workflow in full, for free, to the ceiling of the Free tier.**

Everything downstream of invited participation — proactive discovery, automation, analytics, intelligence, and revenue-ops integration — is fair game for monetization.

| Surface | Stance |
|---|---|
| Responding to an invited bid (end-to-end, seller side) | **Free forever** |
| Running a single active evaluation (buyer side) | **Free forever** (with Free-tier structural caps) |
| Basic + Published Seller Profile, SellerSoftware entities, basic verification | **Free forever** (maximizes Marketplace inventory from day one) |
| Marketplace browsing (both sides) | **Free forever** |
| KB Bootstrap (first crawl) | **Free — lifetime, per Seller Org** |
| Proactive outbound EOIs, Capability Declarations beyond 3, Promoted listings | **Paid** |
| KB automation (Firecrawl crawling, re-bootstraps, Staleness classifier) | **Paid** |
| First-Pass RFP Response Generator (beyond the free Free-tier budget) | **Paid (AI-budget metered)** |
| Seller Page Enrichment (rich public surfaces) | **Paid** |
| Numeric Match Scoring | **Paid (Growth+ on both sides)** |
| Seller Signals digests, CRM Sync | **Paid (Growth+ seller)** |
| Multi-bid parallelism, multi-evaluation parallelism | **Paid (tier-gated)** |
| Enterprise controls (SSO/SCIM, residency, custom DPA) | **Enterprise-only** |

### 2.2 Strategic Principles (Both Sides)

- **Per-organization, never per-seat.** Unlimited seats on every paid tier. Procurement and vendor response are both cross-functional — a seat tax suppresses the exact collaboration the product needs.
- **Free core platform; AI is the monetization surface.** Every non-AI workflow (Workspaces, Use Cases, Requirements, scoring UI, Q&A, Templates, Marketplace browsing, Audit Log, Reports, SSO, API for non-AI endpoints) is free on every plan. Monetization happens exclusively through metered AI Operations plus a small set of Marketplace-integrity media surfaces (Promoted Placements).
- **Outcome-based AI accounting.** Every AI Operation settles as `accepted` or `rejected`. Accepted ops bill at value price (cost_base × 10); rejected ops bill at cost price (cost_base × 1.05). Rejected outputs are never profitable — this aligns incentives on quality and structurally protects the 90% margin floor.
- **Hidden complexity.** Customers see one number ("AI budget used this month" in value-dollars). Per-op pricing surfaces only when the customer opts into wallet overage.
- **No per-unit metering on structural resources.** Storage, requirements, workspaces, KB entries, vendors, and users are soft-capped by tier — never metered per unit.
- **Cost-adaptive rate card.** `value_price = cost_base × 10`; `cost_price = cost_base × 1.05`. `cost_base` is re-derived nightly from Anthropic billing and Convex compute. If model pricing moves, the multiplier holds; customers see stable value-dollars.
- **Invited participation is free.** See §2.1.
- **Published Seller Profile on Free, always.** The Free Seller Profile is public by default from day one. Marketplace inventory is a one-way ratchet — every additional listed seller strengthens discovery for the entire platform, including buyers. Holding profile publication behind a paywall would suppress inventory during the most vulnerable phase of Marketplace liquidity. Upgrade pressure comes from feature set (KB ceiling, concurrent bids, outbound EOIs, CRM Sync, numeric Match Scoring, Seller Signals), not from visibility.

### 2.3 Buyer Plan Architecture

| | **Free** | **Business Starter** | **Business Growth** | **Business Scale** | **Enterprise** |
|---|---|---|---|---|---|
| Monthly (annual) | $0 | $299 | $799 | $1,999 | Custom, $3K/mo floor |
| Monthly (monthly) | $0 | $349 | $949 | $2,399 | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| AI budget (value $) | $5/mo | $50/mo | $300/mo | $800/mo | Committed |
| Active evaluations | 1 | 5 | 20 | Unlimited | Unlimited |
| Vendors tracked | 25 | 250 | 2,500 | Unlimited | Unlimited |
| KB items | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| Document storage | 1 GB | 25 GB | 250 GB | 2 TB | Custom |
| SSO/SCIM/residency | — | — | — | — | ✓ |
| CSM | — | — | — | Shared | Dedicated |
| API add-on | — | $99/mo | $99/mo | $99/mo | Included |
| Pro Trial Seats for invited vendors | — | — | — | 5/mo | 15/mo |

### 2.4 Seller Plan Architecture

| | **Free** | **Seller Starter** | **Seller Growth** | **Seller Scale** | **Seller Enterprise** |
|---|---|---|---|---|---|
| Monthly (annual) | $0 | $149 | $499 | $1,499 | Custom, $3K/mo floor |
| Monthly (monthly) | $0 | $179 | $599 | $1,799 | — |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| AI budget (value $) | $5/mo | $30/mo | $200/mo | $600/mo | Committed |
| Invited bids (respond to) | Unlimited over time, 1 concurrent | Unlimited, 3 concurrent | Unlimited, 15 concurrent | Unlimited | Unlimited |
| Proactive EOIs | 0 | 10/mo | Unlimited | Unlimited | Unlimited |
| KB entries | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| Firecrawl sources | 0 | 2 (weekly) | 10 (daily) | Unlimited (real-time, 50-domain fair-use) | Unlimited |
| KB Bootstrap | 1 lifetime | 1/yr | 3/yr | Unlimited | Unlimited |
| First-Pass RFP Generator | Budget only ($5) | Included (budget) | Included (budget) | Included (budget) | Committed |
| SellerSoftware entities | 1 | 5 | 25 | Unlimited | Unlimited |
| Capability Declarations | 3 | 25 | 250 | Unlimited | Unlimited |
| Verification tier cap | Basic | Verified | Certified | Certified | Certified |
| Published Seller Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| Seller Page Enrichment (Opus) | — | 1/yr | 3/yr | 12/yr | Unlimited |
| Match Scoring (numeric) | Labels only | Labels only | Included | Included | Included |
| Seller Signals | — | Monthly category digest | Weekly digest | Weekly + real-time | Real-time + API |
| CRM Sync (Salesforce / HubSpot / Dynamics / Pipedrive) | — | — | Included | Included, field-map customization | Included + custom integrations |
| Promoted placements | — | — | — | 1/mo (category-capped) | 3/mo (category-capped) |
| SSO / SCIM / residency | — | — | — | — | ✓ |
| API access | — | — | — | Read-only | Full (read + write) |
| CSM | — | — | — | Shared | Dedicated |
| Support | Community | Email | Email + chat | Priority | Priority + SLA |

Vendor response to an invited evaluation is **always free**. Published Seller Profile is free from day one. Anchor competitors: Responsive (≈$7–15K/yr) and Loopio (≈$15–35K/yr) — Sourcera Starter at ≈$1,800/yr bundles KB automation + Marketplace discovery + First-Pass drafting at ~4× cheaper on the RFP-tooling dimension alone, and Growth at ≈$6K/yr is a ~3× price break vs Loopio mid.

### 2.5 Cross-Side Billing and AI Budget Pooling

An Organization may run a Buyer plan, a Seller plan, or both. The pricing model handles this explicitly:

1. **Plans activate per console, not per Org.** An Org can hold (Buyer Growth + Seller Starter), (Buyer Free + Seller Scale), etc.
2. **AI budgets are Org-scoped and pooled across consoles.** If an Org holds Buyer Growth ($300 budget) and Seller Starter ($30 budget), it has $330 of unified AI budget spendable by any capability in either console.
3. **Wallet overage settings are Org-scoped.** One wallet, one cap, one auto-topup config.
4. **Dual-Console Firewall is unchanged.** Billing is shared; data is not.
5. **Enterprise counts once.** An Org with Buyer Enterprise and Seller Enterprise pays one combined contract with a single committed spend minimum at the higher floor ($3K/mo).

This structure ensures pricing never penalizes Orgs that use both sides of the platform — exactly the behavior the Marketplace wants.

### 2.6 Gating and Upgrade Path

- **Free → Starter (Buyer):** evaluation limit, vendor limit, AI budget exhaustion, or attempting a gated Opus-tier capability (Policy Parsing, Deep Comparison).
- **Free → Starter (Seller):** second concurrent invited bid, first proactive EOI attempt, KB 50-entry ceiling, or Firecrawl request. (See §3.6 for the three-conversion-moments framework.)
- **Starter → Growth → Scale:** active evaluation/bid ceiling, AI budget utilization ≥ 80% for two consecutive months, CRM Sync request, numeric Match Score request.
- **Business/Scale → Enterprise:** triggered only when one of {SSO required, DPA required, ≥$12K/yr AI commit, custom integration} is present. Otherwise the customer belongs on Scale. This gate exists because below the $12K AI commit, the dedicated CSM load kills margin.
- **Every upgrade path carries over KB, in-flight bids, Capability Declarations, Firecrawl source configs, and in-flight evaluations without re-setup.** Downgrade preserves data in read-only state for 90 days before archival.

### 2.7 Overage Wallet

Wallet overage is **off by default**. An admin must explicitly enable it and set a monthly cap. Hard caps block ops; soft caps (80%) email the Billing Admin and Org Owner. Auto-topup is available but never enabled by default. Wallet overage is the only surface where per-op pricing appears to the customer.

### 2.8 Rate Card Summary (Seller-Side Capabilities)

Same accounting mechanic as the buyer side: `value = cost_base × 10`; `cost = cost_base × 1.05`. Derived nightly from Anthropic + Convex cost; multiplier held constant; published at `api.sourcera.com/v1/pricing`. Representative seller capabilities:

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

Full buyer-side rate card in `Sourcera_Buyer_Pricing_Strategy.md` §7 and Appendix A. Full seller-side rate card in `Sourcera_Seller_Pricing_Strategy.md` §9.

### 2.9 Outcome Signals (Seller-Side)

Every AI Operation resolves to `accepted` or `rejected` on a capability-specific signal. Default on timeout is **rejected** — biases cost protection when signal is ambiguous.

| Capability | Accepted signal | Window |
|---|---|---|
| First-Pass RFP Draft | ≥50% of draft retained in submitted bid | 14d (or on bid submission) |
| Q&A Suggestion | Answer sent with ≤30% edit | 7d |
| KB-to-Capability Suggestion | Declaration published | 14d |
| KB Bootstrap | ≥60% of proposed entries approved | 30d |
| Ghost-RFP Ingestion | Resulting KB entries cited in a future bid | 90d |
| Firecrawl Crawl + Dedupe | New entry approved OR correct dedupe | 7d |
| KB Staleness Classifier | Flagged entry re-verified or archived | 14d |
| Seller Page Enrichment | Seller publishes generated content | 14d |
| Capability Declaration Suggest | Declaration published | 7d |
| Match Score (numeric) | EOI submitted after viewing score | 14d |
| Bid Task Assignment Suggest | Task assigned as suggested | 24h |
| Document Attach Suggest | Document attached to response | 24h |

Buyer-side outcome signals in `Sourcera_Buyer_Pricing_Strategy.md` Appendix B.

### 2.10 Marketplace Discovery Pricing — The Non-AI Layer

Some seller-side monetization is not AI-accounted. It is traditional media/visibility pricing, controlled by Sourcera Ops to preserve Marketplace trust.

- **Promoted Listings.** 1 included/month at Seller Scale, 3 at Seller Enterprise; not available below Scale. Each placement is category-capped (max 3 promoted per category at a time) to prevent noise. Additional placements purchasable at **$500/category/week** on Scale/Enterprise only; hard-capped at 4 additional per month per seller.
- **Verification Tiers.** Basic (free, all tiers, domain verification). Verified (free when earned, Starter+, requires profile completeness + SOC 2 or ISO doc uploaded and validated by Ops). Certified (free when earned, Growth+, requires Verified + ≥3 closed bids on Sourcera with buyer-side confirmation). Tiers are buyer-trust signals — no seller ever pays Sourcera for a tier; Ops-review cost is absorbed in the plan.
- **Featured Placements on Category/Comparison Pages.** Strictly editorial. Not purchasable. Featured sellers chosen by Marketing based on {verification tier, category relevance, KB health score, buyer engagement signals}. Preserves the organic integrity of Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12).

### 2.11 Pricing Engineering Requirements

The platform must ship the following to run the model:

1. AI Wallet service (Org-scoped, pooled across consoles)
2. Outcome Resolver with per-capability signal contracts
3. Nightly `cost_base` recalculation job
4. Spend cap enforcement (hard block)
5. Budget notifications at 50 / 80 / 100%
6. Usage Dashboard (per-capability spend, acceptance rate, top consumers, trend)
7. Payment gating on Opus-tier ops
8. Downgrade-safe 90-day read-only data preservation
9. Audit log of billing events
10. Cross-console plan-assignment model
11. Pro Trial Seat allocation pool and 30-day auto-downgrade (M17)
12. Public rate card at `api.sourcera.com/v1/pricing`
13. Magic-link SSO orchestrator that starts KB Bootstrap inside the SSO redirect latency (seller onboarding; see §6.28.2)
14. Inline-citation UI, KB-gap detector, stake-reveal screen, outcome debrief surface, and contextual upgrade CTAs with lossless carry-over

### 2.12 Financial Target

Blended gross margin ≥ 90%. Year-1 exit mixes:

- **Buyer side:** 60% Starter / 25% Growth / 10% Scale / 5% Enterprise (≥90% blended)
- **Seller side:** 55% Starter / 25% Growth / 15% Scale / 5% Enterprise (≥90% blended)
- **Combined (buyer + seller):** clears ~91% with Enterprise <10% of accounts on both sides.

Enterprise is deliberately kept < 10% of accounts on both sides until the CSM motion is templatized. On the seller side, Scenario C from `Sourcera_Seller_Pricing_Strategy.md` §13 shows why Seller Enterprise below the $12K AI commit blends at ~44% gross margin — the $3K/mo floor plus committed AI are the defense mechanism.

**Related (Appendix C) for §2 (Pricing & Billing):** C.75 AIOperation Primitive Schema · C.76 Capability Registry · C.77 Cost-Base Recalculation Job · C.78 Outcome Contest Window · C.79 Auto Top-Up Mechanics · C.80 Free Allowance Per-Capability · C.81 Committed Spend · C.82 Billing Ledger & Transparency · C.83 Public Pricing API · C.84 Multi-Currency & Residency-Locked Invoicing · C.85 Downgrade Excess Data Handling · C.86 Billing Seat Count Logic · C.87 Entitlement Enforcement · C.126 Pricing Objection Handlers · C.128 Seller Core Principle · C.129 Seller Rate Card Extended · C.130 Seller Outcome Signals · C.131 Marketplace Discovery Pricing (Non-AI Layer) · C.139 Seller Plan Upgrade Carry-Over Guarantee.

---

## 3. PLG Motion, Growth, and Network Effects

### 3.1 The Buyer Paid Path

1. **Signup (Free).** Google/Microsoft SSO, no credit card. 60 seconds to first evaluation.
2. **Aha moment (Free).** First Pre-Scoring run across 3+ vendors. The $5 AI budget is designed to be spent here.
3. **Ceiling hit (Free → Starter).** Evaluation cap, vendor cap, AI budget exhaustion, or an Opus-gated capability. Upgrade CTA is contextual, not generic.
4. **Expansion (Starter → Growth → Scale).** Active evaluations and AI budget utilization drive tier moves. Growth upsell at 80% budget utilization for 2 consecutive months.
5. **Enterprise trigger.** SSO / DPA / ≥$12K AI commit / custom integration routes to founder-led sale.

### 3.1b The Seller Paid Path — The Forced-Signup Opportunity

The most valuable signup Sourcera will ever get is the one the vendor did not ask for. A buyer invite through M1 (Vendor-Invite-Creates-Account), M5 (Buyer-Pull Vendor Invite), or M15 (Ghost-Bid Importer) puts the vendor at peak pain: an incoming RFP, a deadline, no chosen tool, a blank response to write, and zero existing workflow to defend. Seller pricing is designed to exploit this moment as aggressively as the anti-spam controls allow.

1. **Signup (Free).** Triggered by buyer invite (M1/M5), ghost-bid importer (M15), or direct signup. Magic-link; Google/MS SSO; no credit card. **Published profile and first KB Bootstrap run inside signup** — inside the SSO redirect latency window — so the vendor never sees an empty workspace.
2. **Aha moment — "Your first bid is already drafted" (Free).** On magic-link signup from a buyer invite, Sourcera synchronously executes four steps before the landing screen:
   1. **Domain Bootstrap** — Opus-tier crawl of homepage, help center, docs, and trust center (drawn from the lifetime-free bootstrap allowance; 30–90s).
   2. **KB Propose** — 40–200 draft KB entries staged with confidence score and provenance URL.
   3. **First-Pass Draft** — Sonnet/Managed-Agent drafts for every requirement in the buyer's evaluation, citing the newly bootstrapped KB.
   4. **Landing screen** — *"Your bid for [Buyer Company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website."*

   The new-vendor cold-start wall collapses from ~2 days (status quo: manual triage, KB hunt, draft from scratch) to ~30 seconds of latency hidden behind an honest onboarding progress bar. The vendor arrives with the work already started, their own content already in the tool, and the buyer's real requirements already answered — before any pricing conversation.
3. **First invited bid submitted (Free).** Seller reviews, edits, accepts, or rejects drafts per requirement. Every inline rejection becomes a new KB entry via the KB-gap detector. Live budget counter visible at top of workspace. Stake-reveal screen on submission: *"You built a reusable KB of 47 verified entries in 35 minutes. Your next bid will reuse them automatically."*
4. **Ceiling hit (Free → Seller Starter) — three planned conversion moments.**

   | Moment | Trigger | Buying reason | Message |
   |---|---|---|---|
   | **1. Second concurrent bid** | Vendor receives a second buyer invite while first is still in flight | Urgency — "my deal is at risk" | *"Starter unlocks 3 concurrent bids and keeps your KB shared across all of them."* |
   | **2. First EOI attempt** | Vendor clicks "Submit EOI" on a Marketplace listing | Ambition — "I want to find more deals" | *"Outbound EOIs start at Starter. Your first 10/month are included."* |
   | **3. KB ceiling** | Vendor approaches 50-entry KB cap after 2–4 bids | Investment — "I don't want to lose what I've built" | *"Your KB is about to hit the Free ceiling. Starter raises it to 1,000 entries and keeps your existing work."* |

   The product should catch all three — the pricing model does not optimize any single one.
5. **Expansion (Starter → Growth → Scale).** Bid volume, EOI volume, KB size, AI budget utilization, CRM Sync request. Growth upsell at 80% budget utilization for 2 consecutive months.
6. **Enterprise trigger.** SSO / DPA / ≥$12K AI commit / custom RevOps integration (Gainsight, Outreach, Salesloft, 6sense) routes to founder-led sale.
7. **Win/Loss debrief as upgrade trigger.** On bid close, Agent generates a debrief. On win: *"24 KB entries cited on winning responses; those entries are now higher-weighted. Keep your KB alive — upgrade to Starter for weekly crawls and auto-staleness checks."* On loss: *"Gap analysis identified 4 requirements where your KB had no strong answer. Upgrade to Starter to let Sourcera crawl your product docs weekly and fill gaps automatically."* Win reinforces value; loss creates a concrete upgrade reason tied to a specific identified gap.

**The single most-important seller-side activation metric:** *minutes from magic-link click to first submitted requirement response* — target p50 < 20 min, p90 < 60 min. Every product decision on the seller onboarding surface should be evaluated against whether it moves this metric.

**Leading seller-side indicators (trackable solo):**

- Free seller → Starter conversion %
- % of Free sellers who receive a buyer invitation within 30 days (M1 effectiveness)
- % of Free sellers whose KB Bootstrap generates ≥40 approved entries (hero-moment acceptance rate)
- Minutes from magic-link to first submitted requirement response (p50, p90)
- Days to first submitted bid on Free
- Second-invitation arrival rate on Free cohort (directly predicts conversion moment #1)
- Starter → Growth expansion % at month 3
- EOI submission rate per tier (engagement signal)
- Rejected-op rate for First-Pass Responder (quality signal — target <30%)
- Blended seller-side margin per plan

### 3.2 The 10 Core Growth Loops

1. **Vendor-Invite-Creates-Account.** Every vendor invited to a buyer's evaluation receives a magic-link signup. First bid seeds their KB via auto-bootstrap. Each buyer evaluation seeds 3–10 new Seller Orgs.
2. **Template-Clone-Attribution.** Every cloned template carries a badge linking back to the originating Seller — clicks deep-link into Software Pages.
3. *(Retired — replaced by M2 Selection Report Public Link.)*
4. **Seller-Profile SEO.** Public Seller Org Pages and Software Pages emit Schema.org structured data; organic traffic compounds into Marketplace sessions.
5. **Free-AI-Teaser-to-Paid.** The 10-free-per-capability allowance is the primary PLG lever. ROI is surfaced inline; conversion fires on exhaustion.
6. *(Retired — replaced by M7 Suggested Team Discovery.)*
7. **Cmd+K Suggestion Loop.** The Command Palette surfaces relevant Marketplace content based on current context (e.g., viewing a data-privacy requirement surfaces matching Seller Pages).
8. **Bid-Close-Offers-KB-Sync.** On bid close, the seller sees a one-click "save this response to KB" CTA.
9. **Template Publish Incentive.** Sellers earn visibility credits (featured placements) for publishing templates that are widely cloned.
10. **Marketplace Match-Score Teaser.** Free viewers see match score labels ("Strong match") without numeric detail; numeric scores live behind a paid AI capability.

### 3.3 Expanded Growth Mechanics (M1–M17)

| | Mechanic | Purpose |
|---|---|---|
| M1 | Stakeholder Read-Only Invite | Convert CFO/GC/CISO/Exec Sponsor into users via magic-link access to Phase 8+ artifacts |
| M2 | Selection Report Public Link (watermarked) | Shareable social artifact with per-section redaction controls; seeds inbound signups |
| M3 | Evaluation Certificate Badge | "Selected via Sourcera" verifiable artifact for buyer + winning vendor to embed externally |
| M4 | "Kick Off Next Evaluation" on Close | Frictionless next-evaluation prompt at peak success momentum post-Phase 13 |
| M5 | Buyer-Pull Vendor Invite | Anonymous, templated outreach to vendors not yet on Sourcera |
| M6 | Domain-Based Auto-Join | Employees at verified domains auto-join as pending-approval members |
| M7 | Suggested Team Discovery | Surface "your colleagues are also on Sourcera" for cross-team expansion |
| M8 | Org Intelligence Value Curve | Compound analytical value per additional evaluation; visible in-app |
| M9 | Per-Category Marketplace Landing Pages | SEO-optimized category pages with AI-generated FAQs |
| M10 | "How to Evaluate [X]" Guides | Long-form SEO guides with AI-drafted content, refreshed on cadence |
| M11 | Software Comparison Pages | AI-generated, continuously refreshed side-by-side software comparisons |
| M12 | Aggregate Market Intelligence Reports | k-anonymized cross-Org analytics published quarterly |
| M13 | Public Marketplace Heat Map | Anonymized category-level demand visualization |
| M14 | Seller Bid Success Share | One-click social post for sellers after winning a bid |
| M15 | Ghost-Bid Importer | Sellers paste historical RFPs to bootstrap KB; first import free per Seller Org |
| M16 | Buyer Referral Credit | Structured referrals with credit reconciliation and fraud controls |
| M17 | Buyer-Funded Pro Trial Seat | Scale (5/mo) and Enterprise (15/mo) buyers gift 30-day Seller Starter trials to invited vendors; bypasses Free-tier ceilings at the highest-converting moment of the seller funnel. Cost absorbed into buyer plan; AI spend still metered to the Org budget. See `Sourcera_Seller_Pricing_Strategy.md §15.5`. |

### 3.4 Network Effects

- **Sellers compound sellers.** More sellers → more templates → faster buyer setup → more bids → more KB content → sellers stay.
- **Buyers compound buyers.** More buyers → more signals → stronger CRM value for sellers → more seller investment → more Marketplace content for buyers.
- **Data compounds both sides.** More evaluations → richer Org Intelligence (M8), stronger Market Intelligence Reports (M12), a more accurate Heat Map (M13), better Category pages (M9).
- **SEO compounds everything.** M9 + M10 + M11 + M12 + M13 build a defensible organic-search moat per category. First-mover advantage in each category is disproportionate.
- **Certificates and shares compound trust.** M3 + M14 + M2 operate as distributed, zero-marginal-cost marketing artifacts.
- **Referrals compound quality.** M16 skews acquisition toward high-intent channels; peer-vouched signups activate faster.

#### Seller-Side Network Effects (Compounding Loops)

Every loop below operates regardless of plan tier — free sellers contribute to all of them. Pricing gates sit downstream of each loop's contribution, so free sellers keep the flywheel spinning while paid sellers fund it.

1. **Invited-Vendor → Published-Profile → Marketplace-Ready Inventory.** Every invited vendor lands with a bootstrapped KB, a published Seller Profile, a SellerSoftware entity, and up to 3 Capability Declarations — all free. Marketplace inventory grows by one searchable, category-tagged, verified-domain listing every time a buyer invites a vendor.
2. **KB → Capability Declaration → Match Score → EOI → Revenue.** As vendors accept bootstrapped KB entries, the KB-to-Capability Auto-Suggestion capability (C.46) generates declarations that feed Match Scoring, SEO-ranked Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12). Free vendor work compounds into organic search real estate for Sourcera.
3. **Bid-Close → Win/Loss Signal → Platform Learning.** Per-entry confidence weighting (compounds for the vendor), aggregate Match Score calibration (improves for all vendors), Market Intelligence content (M12 SEO moat), and Seller Signal quality (paid feature value rises). One bid close per vendor per month across 200 active vendors = 2,400 Match Score calibration events per year.
4. **Seller-Profile SEO Loop.** Published Seller Profiles and Software Pages emit Schema.org structured data. Organic traffic drives inbound buyer signups, seller ROI on Sourcera, per-category SEO moat, and a structural defense against Gartner/G2 — they own category reviews; Sourcera owns category inventory.
5. **Ghost-Bid Import Loop (M15).** Sellers paste historical RFPs; Ghost-RFP Ingestion (Opus, $25 value/RFP) seeds their KB from prior work. First import free per Seller Org. Catapults vendors with RFP history over the KB-accumulation barrier and accelerates paid conversion — upgrade ceiling hit in one session instead of over 2–3 bids.
6. **Buyer-Funded Pro Trial Loop (M17).** Buyers on Scale/Enterprise gift Pro Trial Seats to invited vendors. Trial-converted sellers skip the Free-tier experience entirely and enter Starter with zero friction — materially higher conversion than cold-start Free-to-Starter. Adds a dollar-meaningful seller-side lift to the buyer's Scale/Enterprise value proposition.
7. **Template Publish Incentive (M9).** Sellers who publish non-confidential response templates (SOC 2 response block, GDPR DPA block) earn Marketplace visibility credits — featured placements in Category Pages. Incentivizes shared content creation and accelerates future bootstrapped-vendor onboarding.

Reinforcing-loop summary:

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

### 3.5 Anti-Spam and Abuse Controls

Global controls gate every mechanic that generates email, public pages, or inbound invitations: email throttling, DMARC/SPF reputation, shared-use domain detection, content validators, template spam ML classifier, referral fraud controls, k-anonymity floors (k=5 signal, k=10 aggregate, k=20 market intelligence), Ops-maintained suppression list, global vendor opt-out, and a Signal Integrity Monitor in the Ops Console.

Seller-side pricing levers add specific constraints that pricing ceilings do **not** override:

- EOI submission is rate-limited per seller, per category, per buyer — independent of plan ceiling.
- Capability Declarations are validated against the controlled taxonomy; fabricated declarations are suppressed.
- Signal Integrity Monitor flags sellers with anomalous EOI submission velocity, low Match Score → EOI conversion, or high buyer-reported noise.
- Sellers can be downgraded, throttled, or suspended by Ops Console for outbound-tool abuse regardless of plan.
- Template Spam ML Classifier operates across all tiers.
- k-anonymity floors apply to all Seller Signals regardless of plan.
- Free sellers who publish Profiles but never respond to invites or submit bids within 180 days are demoted in Marketplace ranking to prevent zombie-inventory pollution.

Pricing gives sellers access to outbound tools; Marketplace integrity defines the acceptable use floor. A paid tier is not an unlimited license to pollute.

### 3.6 Seller-Side Hero Moment — Mechanics

The Hero Moment in §3.1b is not marketing copy — it is a coordinated product surface. Its mechanics are authoritative here so engineering, design, and PLG teams work from the same definition.

**Pre-arrival preparation (hidden from vendor).** Before the magic-link is clicked, Sourcera enriches the invite-target email domain against public records to pre-populate company name, industry, HQ region; the Marketplace Tagger assigns probable category tags from domain + buyer-side evaluation context; the bootstrap queue pre-warms — crawl URLs are resolved and rate-limited against Firecrawl. Bootstrap starts inside the SSO redirect latency when the magic-link is clicked.

**Onboarding surface (minutes 0–3).** Zero friction: no form, no company profile prompt, no credit card, no role selection — domain + invite identity is enough. Progress storytelling narrates what is actually happening:

- *"Scanning yourcompany.com..."* (0–15s)
- *"Found your security documentation..."* (15–30s)
- *"Drafting responses for [Buyer Company]'s 82 requirements..."* (30–90s)
- *"Your bid is ready to review."* (done)

Every status line is true and reflects actual work completed. Landing counter: *"Your bid is ready. **47** AI drafts prepared. **31** cite evidence from your website. Review time: **~35 min**."*

**In-workspace value proof (minutes 3–45).** Inline citation on every draft (*"from: yourcompany.com/trust/soc2"*, hover expansion showing the exact quoted sentence). Accept / Edit / Reject per requirement — three buttons, every click a signal to the outcome resolver. Live budget counter at top of workspace. KB-gap detector on rejected drafts: empty state becomes a 1-click KB-entry creation (*"No KB content answered this. Write your answer below and we'll save it as a KB entry."*). Accepting a draft with no edits records the strongest acceptance signal and surfaces a subtle confirmation chip (*"added to your KB as verified response"*).

**Post-submission reveal (hour 1+).** Stake-reveal screen on Submit: *"You just built a reusable KB of 47 verified entries in 35 minutes. Your next bid will reuse them automatically. Sourcera tracked $1.47 of value pricing for the AI work on this bid (covered by your Free plan)."* Not an upgrade CTA — a deliberate reminder of what the vendor built, what it's worth, and how it compounds. Upgrade conversations come at the natural ceilings (§3.1b).

**Onboarding anti-patterns (banned).** The onboarding surface must not:

- Ask for a credit card at any point before the first upgrade-intent click
- Require the vendor to describe their company or industry before bootstrap runs
- Gate any feature behind a "try Pro free for 14 days" modal on first login — the hero moment is the pitch
- Show a pricing page until the vendor has submitted their first bid
- Use dark patterns on upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency)
- Present the upgrade offer during active bid work — only at natural completion points or ceiling events

These bans exist because the supply-side flywheel depends on vendors trusting Sourcera enough to let an AI touch their buyer's evaluation. Any onboarding friction that reads as sales-ey kills that trust.

**Related (Appendix C) for §3 (PLG, Growth, Network Effects):** C.63 M5 Buyer-Pull Vendor Invite · C.64 M6 Domain-Based Auto-Join · C.65 M7 Suggested Team Discovery · C.66 M8 Org Intelligence Value Curve · C.67 M9 Per-Category Pages · C.68 M10 How-to-Evaluate Guides · C.69 M11 Comparison Pages · C.70 M12 Market Intelligence Reports · C.71 M13 Heat Map · C.72 M14 Bid Success Share · C.73 M15 Ghost-Bid Importer · C.74 M16 Buyer Referral Credit · C.80 Free Allowance Per-Capability · C.100 Signal Integrity Monitor · C.123 Vendor Opt-Out Registry · C.132 Seller Hero Moment · C.133 Three Conversion Moments · C.134 Seller Paid-Path Progression · C.135 Seller Activation Metric · C.136 Forced-Vendor-Signup Playbook · C.137 Win/Loss Debrief as Upgrade Trigger · C.138 Seller-Side Network Effects Inventory · C.141 Onboarding Anti-Patterns.

---

## 4. The Sourcera Method — Summary

The Sourcera Method is the opinionated, repeatable evaluation methodology embedded directly into the platform's phases, roles, and user guidance. It compresses 6–12 week evaluations into 4–6 weeks by providing structure, parallelization, and decision accountability. The Method is optional — teams can operate the Buyer Console without it — but the platform's phase gates, terminology, and agent behavior assume it as baseline.

### Decomposition

Every evaluation decomposes into **3–8 Use Cases**, each containing a subset of the total **50–200 Requirements**. Every Requirement produces exactly one scorable outcome — compound requirements ("supports SSO AND encrypts data at rest") must be split.

### Three Scoring Models

Requirements are authored under one of three scoring models:

- **FM (Feature Match)** — binary capability presence (Yes / No / Partial). Objective, fast, and recommended for ≥30% of requirements.
- **PM (Performance Measure)** — quantifiable outcome on a numeric scale (throughput, cost, latency, capacity).
- **EJ (Expert Judgment)** — subjective quality/fit/risk assessment on a 1–10 scale. Requires a written rubric and scorer rationale. Used sparingly.

### Two-Phase Vendor Shortlisting

- **Screening (Weeks 0–1).** Lightweight RFI of 20–40 mostly-FM requirements.
- **Deep Evaluation (Weeks 2–6).** Full RFP with FM + PM + EJ.

### Cross-Departmental Alignment

The Method defines five stakeholder cohorts (Exec Sponsor, Evaluation Lead, Functional Leads, Technical Evaluators, SME/Evaluators) with explicit cadences: kick-off, shortlist review, RFP response review, scoring calibration, and final selection.

### Grade Rubric

Scoring uses a four-grade rubric — **Fully Meets (FM, 1.0)**, **Partially Meets (PM, 0.1–0.9, configurable, default 0.6)**, **Does Not Meet (DNM, 0.0)**, **Excluded (EX)** — applied against a weight in 0–20 (0 = Informational, 1–5 = Low, 6–10 = Medium, 11–15 = High, 16–20 = Critical). Vendor Use Case Score = SUM(grade × weight) / SUM(weight). Grades are append-only; every modification is retained for audit.

### Template Design

The Method ships framework-level guidance for RFI and RFP template structures (section ordering, question limits, expected response types) that map directly into Sourcera's Template Library.

### Opinionated Constraints

- **Flat requirements — no dependency trees.** Lateral "Related" links only; strict duplicate merging for redundancy elimination.
- **Fixed 13-phase pipeline.** No custom phases. Gate validation depends on fixed phase semantics.
- **Single lead accountability.** Every Requirement has one owner; every Use Case has one Lead; every Workspace has one Owner.
- **SLAs and manual Due Dates are mutually exclusive.** SLA takes precedence.
- **Priority is ephemeral; Weight is permanent.** Priority governs *when* work gets done (SLA timer); Weight governs *how much* a vendor's answer matters (scoring math).
- **Scenarios are overlays, not mutations.** Modeling never forks data.

---

## 5. Sourcera Design Language — Summary

### Design Posture

Sourcera is an enterprise operating system for procurement. The design language is minimal, restrained, efficient, high-signal, and operationally serious. The benchmark is Linear: keyboard-first, dense where density improves expert efficiency, zero decorative complexity, calm confidence throughout. Every surface must pass one test: does this help the user understand, decide, act, collaborate, review, or recover? If not, it does not belong.

### Eight Core UX Principles

1. **Keyboard-First, Mouse-Optional.** Every primary workflow is completable via keyboard. `Cmd+K` is the universal accelerator. Shortcuts are discoverable, consistent, and phase-aware.
2. **Progressive Disclosure by Phase.** UI surfaces, actions, and navigation items appear only when their phase is active or relevant. Phase-locked content is visible but clearly non-interactive.
3. **Console Isolation is Absolute.** Buyer and Seller Consoles are completely separate data domains. No UI element, search result, or API response ever leaks across. Switching consoles forces a full context reload.
4. **Optimistic Mutations with Transparent Rollback.** All CRUD applies immediately in the UI; server rejection reverts the change with an explanatory toast. No spinners on routine actions.
5. **Information Density Over Whitespace.** Tables, matrices, and data-dense views are the default. Whitespace is reserved for onboarding and empty states.
6. **Real-Time as Default.** Convex subscriptions power every collaborative surface. Stale data is a UX defect.
7. **AI as Co-Pilot, Not Autopilot.** The Agent suggests, drafts, and pre-scores. It never commits without explicit user confirmation. Outputs are attributed `[AI-Generated]`, confidence-scored, and editable.
8. **Fail Loudly, Recover Gracefully.** Errors are never silent. Destructive actions require confirmation. Soft deletes have recovery windows.

### Eight Core Interaction Patterns

Inline Edit · Side Peek · Command Palette · Bulk Actions · Optimistic Mutation · Keyboard Nav (`J`/`K`, number keys for scoring) · Toast Feedback · Skeleton Loading.

### Typography

**Inter** as primary typeface (system-font fallback). Type scale: Display 24/600, H1 20/600, H2 16/600, Body 14/400, Body Small 13/400, Caption 12/500, Mono (JetBrains Mono) 13/400.

### Color System

Semantic tokens (not raw hex) across `bg-primary`, `bg-secondary`, `bg-elevated`, `border-default/strong`, `text-primary/secondary/tertiary`, `accent` (#2563EB blue), `success` (#059669 green — FM, healthy pulse), `warning` (#D97706 orange — PM, SLA approaching), `danger` (#DC2626 red — DNM, SLA breach), `exception` (#7C3AED purple — EX grade), `agent` (#7C3AED — AI attribution), and presence hues. Full dark-mode parity with luminance inversion and preserved semantic meaning.

### Spacing, Radius, Elevation, Motion

- **Spacing:** 4px base unit; scale `1/2/3/4/5/6/8/10/12` (4px–48px).
- **Radius:** `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `full` 9999px.
- **Elevation:** 5 levels (Flat → Topmost) for layering from inline content to modal-over-modal confirmations.
- **Motion:** 100–200ms transitions, `ease-out`/`ease-in-out`, skeleton shimmer 1500ms. All transitions respect `prefers-reduced-motion`.

### Iconography

Lucide Icons (consistent with ShadCN/UI). 20px default, 16px inline/table, 24px empty-state illustrations. Grade icons: checkmark-circle (FM), half-circle (PM), x-circle (DNM), minus-circle (EX). Phase icons: numbered 1–13 badges. Every meaningful icon carries a text label or `aria-label`. Decorative icons use `aria-hidden`.

### Z-Index Stack

Base (0) → Sticky (10) → Sidebar (20) → Side Peek (30) → Dropdown (40) → Toast (50) → Modal Backdrop (60) → Modal (70) → Command Palette (80) → Tooltip (90) → Topmost (100).

### Mobile Translation

The Linear Constraint translates to gesture-first equivalents on mobile while preserving the "5-tap ceiling" for every major workflow.

### Accessibility

WCAG 2.1 AA target baseline. Minimum 48×48px touch target on interactive icons. Focus rings on `accent` color. Full keyboard navigation. Screen-reader attribution on all Agent-generated content.

**Related (Appendix C) for §5 (Design Language):** C.109 Form & Input Tokens · C.110 Loading / Empty / Error State Catalog · C.111 Side Peek Dimensions & Behavior · C.112 Cursor Presence Visualization · C.113 Bulk Action Toolbar & Selection Scope · C.114 Mobile Responsive Breakpoints & Gesture Equivalents · C.115 Dark Mode Parity Rules · C.122 Accessibility & Internationalization.

---

## 6. Features and Sub-Features — Comprehensive Breakdown

Each feature below lists:

- **Short Summary** — what it is.
- **Purpose** — why it exists.
- **Problem Solved** — the user pain it addresses.
- **How It Works (Customer View)** — the user-facing experience.

Features are grouped by functional area. Sub-features are listed under their parent.

---

### 6.1 Dual-Console Architecture

#### 6.1.1 Dual-Console Firewall

- **Summary.** A single Sourcera Organization is split into a **Buyer Console** and a **Seller Console** with strict data isolation enforced at the database query level — not just UI.
- **Purpose.** Allow a company to use Sourcera both to evaluate software *and* to respond to buyer evaluations, without ever leaking internal triage data, KB content, or vendor discussions between the two sides.
- **Problem Solved.** Companies that buy and sell software cannot safely combine internal purchasing decisions with customer-facing bid responses in a single workspace. Manual separation via disconnected tools loses the institutional connection between "what we buy" and "what we sell."
- **How It Works.** Users toggle between consoles via a universal switch in the global UI. Each console has its own navigation, search scope, notifications, and permission model. Console-scoped queries require both `org_id` and `console` parameters — direct API calls cannot cross the boundary. External vendors never enter your Buyer Console; they operate in their own Organization's Seller Console and interact with a linked Bid Workspace that mirrors your evaluation structure.

**Related (Appendix C):** C.116 Console Bridge (Data Flow) · C.117 Cross-Console Sync Behavior & Retry · C.118 Vendor Disqualification Workflow.

#### 6.1.2 Vertical Track (Organization › Workspace › Use Case › Requirement)

- **Summary.** The "work" axis of the data model — how evaluation scope is organized.
- **Purpose.** Provide a strict, consistent decomposition that enforces scorable granularity and phase-aware access control.
- **Problem Solved.** Spreadsheet evaluations conflate categories, criteria, and questions — making it impossible to score consistently or compare across evaluations.
- **How It Works.** An Organization holds many Workspaces (each is one evaluation, e.g., "CRM Purchase 2026"). A Workspace contains Use Cases (thematic folders: "Data Privacy & GDPR"). Use Cases contain Requirements — the atomic unit, each with a global persistent ID (e.g., `SRC-1001`), weight (0–20), response type, and priority. Use Cases can be **Standard** (capability evaluation) or **TCO** (cost modeling).

#### 6.1.3 Horizontal Track (Organization › Teams)

- **Summary.** The "governance" axis — Teams (Legal, InfoSec, Procurement) that sit at the Org level and cut across all active Workspaces.
- **Purpose.** Allow functional leaders to own compliance standards for their domain once, and enforce them everywhere.
- **Problem Solved.** In spreadsheet-based evaluations, security requirements are re-authored per evaluation with no consistency; InfoSec reviews the same SOC 2 report across six Workspaces with no institutional memory.
- **How It Works.** A Team owns triage queues, SLA enforcement, collaborative scoring responsibilities, and custom Agent Instructions for its functional domain. A Requirement lives in the vertical track but is owned, scored, and approved by a Team from the horizontal track.

**Related (Appendix C):** C.9 Buyer-Side Triage Queue · C.10 Seller-Side Triage Queue & Auto-Mapping · C.11 SLA Timer Configuration, Breach & Escalation · C.12 Agent Instruction Properties, Scope & Versioning.

#### 6.1.4 Marketplace Domain

- **Summary.** A third data domain, separate from both Consoles, governed by its own access rules.
- **Purpose.** Enable vendor discovery without exposing the full evaluation matrix.
- **Problem Solved.** Public RFPs expose confidential scoring criteria; cold outreach fails to surface the right vendors.
- **How It Works.** Buyers publish summary Marketplace Listings. Sellers browse, filter by Capability Declarations, and submit Expressions of Interest (EOIs). The Marketplace never exposes full requirements, internal scores, or vendor lists — only buyer-authored summaries designed to attract qualified candidates.

---

### 6.2 The 13-Phase Evaluation Pipeline

- **Summary.** A fixed, sequential, gate-validated pipeline that every Workspace progresses through.
- **Purpose.** Enforce evaluation discipline, enable phase-aware UI and Agent behavior, and produce a defensible audit trail.
- **Problem Solved.** Ad hoc evaluation processes skip critical steps (e.g., stakeholder alignment, scoring calibration), produce inconsistent outputs, and make post-hoc audit impossible.
- **How It Works.** Phases cannot be skipped, reordered, or renamed. Each transition is gated by validation rules. Phase advancement is idempotent. The 13 phases are:

| Phase | Name | What Happens |
|---|---|---|
| 1 | Stakeholder Alignment & Discovery | Business case drafted (problem, procurement type, timeline). Stakeholders invited. Discovery Document attached. |
| 2 | Requirement Definition | Teams build the evaluation matrix. Requirements created, triaged, approved. Full Revert Rule applies through Phase 5. |
| 3 | Use Case Definition & Validation | Requirements grouped into Use Cases. Use Case Leads assigned. Scoring scenarios optionally defined. |
| 4–5 | Vendor Discovery & Outreach | Vendors identified via Marketplace, manual import, or AI suggestion. ITBs issued. Shortlist confirmed. |
| 6 | Vendor Bidding Opens | Formal bidding period (minimum 7 days). Requirement Amendment Protocol active. Q&A threads open. |
| 7 | Vendor Response Refinement | Vendors edit and resubmit. Buyer Q&A continues. Response versions tracked. |
| 8 | Buyer Due Diligence & Demos | Demos, reference checks, security reviews. Findings logged as comments. |
| 9 | Final Vendor Clarifications | Last amendment window. Requirements and Responses permanently locked at phase exit. Immutable snapshots created. |
| 10 | Team Evaluation & Scoring | Collaborative scoring unlocks. Agent Pre-Scoring populates suggested grades. Disagreement Insight Cards surface divergence. |
| 11 | Score Review & Consensus | Team Leads resolve outliers. Scenarios and TCO finalized. Summary Scoring Report generated. |
| 12 | Selection & Recommendation | Executive review. Vendor ranking. Selection Report generated, signed, routed. Scores permanently immutable at entry. |
| 13 | Contract & Closure | Contract uploaded. Workspace becomes immutable audit record. Selection Record created. Vendor responses offered to seller KBs. |

Post-lock changes use formal protocols: **Revert** (Phases 2–5, pre-vendor-release) regresses a single requirement to Draft. **Amend** (Phases 6–9, post-vendor-release) triggers version control and notifies all vendors. After Phase 9, requirements are permanently locked.

**Related (Appendix C):** C.1 Per-Phase Gate Rules · C.2 Phase 1 Stakeholder Mechanics · C.3 Phase 9 Immutable Snapshots · C.4 Cancellation Protocol · C.5 Vendor Voluntary Withdrawal · C.6 Response Lock & Concurrency · C.7 Requirement Amendment Protocol · C.8 Revert vs. Amend State Machine.

---

### 6.3 Scoring & Grading

#### 6.3.1 Weight × Grade Scoring Engine

- **Summary.** Every requirement carries a weight (0–20); every grade carries a value (0.0–1.0). Vendor Use Case Score = SUM(grade × weight) / SUM(weight).
- **Purpose.** Remove subjectivity from scoring by binding every decision to a structured, auditable calculation.
- **Problem Solved.** Spreadsheet scoring uses inconsistent scales and weights that change mid-evaluation with no audit.
- **How It Works.** Grade rubric: FM (1.0), PM (0.1–0.9, default 0.6), DNM (0.0), EX (per-vendor-per-requirement exclusion). Boolean requirements auto-grade (Yes = FM, No = DNM). Pricing requirements bypass the rubric — they flow into TCO calculations. Informational requirements (weight 0) are excluded from scoring entirely. Grades become permanently immutable at Phase 12 entry.

#### 6.3.2 Agent Pre-Scoring

- **Summary.** Before human reviewers open the scoring UI, the Agent populates suggested grades for every qualitative and evidence-based response.
- **Purpose.** Cut scoring time by giving reviewers a grounded starting point.
- **Problem Solved.** Reviewers spend hours reading responses from scratch; without a baseline they anchor on the first response they read.
- **How It Works.** Reviewers see the Agent's suggested grade with confidence score. They accept, override, or dismiss. Override rates are tracked per-use-case and workspace-wide for model calibration.

#### 6.3.3 Real-Time Collaborative Scoring (Business+)

- **Summary.** Team members grade simultaneously with live presence indicators.
- **Purpose.** Eliminate the "chase people for scores" cycle.
- **Problem Solved.** Sequential scoring adds weeks to evaluations; scorers wait for each other and lose context.
- **How It Works.** Each reviewer writes to their own append-only entry — no write conflicts. A "Score Independently" toggle hides other grades until submission. Convex subscriptions power live grade sync.

#### 6.3.4 Disagreement Insight Cards

- **Summary.** When two reviewers diverge by ≥0.3, the Agent generates a card explaining the divergence and suggesting reconciliation.
- **Purpose.** Surface hidden misalignment before it becomes a decision risk.
- **Problem Solved.** Scoring variance is often buried under averages; ≥0.6 divergence typically signals a genuine interpretation conflict.
- **How It Works.** Cards appear inline during Phase 10. Divergence ≥0.6 auto-escalates to the Use Case Lead, who can accept the average, override, or request re-evaluation with a 48-hour deadline.

#### 6.3.5 Exclusion Handling (EX)

- **Summary.** A per-vendor-per-requirement exclusion that removes a requirement from that vendor's scoring denominator.
- **Purpose.** Handle cases where a requirement is genuinely inapplicable to a specific vendor.
- **Problem Solved.** Vendors penalized for requirements that don't apply to them (e.g., on-prem requirement against a cloud-only vendor) distort rankings.
- **How It Works.** EX proposals require a reason (≤200 chars) and approval from the Workspace Owner or Use Case Lead before taking effect. Excluding Vendor A on a requirement does not affect Vendor B.

#### 6.3.6 Append-Only Grade History

- **Summary.** The `individual_grades[]` array is never mutated — new grades are appended with a `supersedes` reference.
- **Purpose.** Preserve complete scoring audit history.
- **Problem Solved.** Overwriting grades destroys the record of how consensus evolved.
- **How It Works.** Every override, correction, and consensus resolution is preserved with timestamp, user, and justification. Superseded entries render with strikethrough in the UI.

**Related (Appendix C):** C.13 Blended Score with Scenario Overrides · C.14 TCO Percentile Calculation · C.15 Rubric Configuration · C.16 Override Tracking Analytics · C.17 Auto-Scoring Rules.

---

### 6.4 Scenario Modeling

- **Summary.** Workspace Owners create "what-if" overlays that adjust Use Case weights, exclude vendors, or modify TCO assumptions — without mutating the underlying scores.
- **Purpose.** Stress-test rankings before committing to a decision.
- **Problem Solved.** "What if we weighted security higher?" requires rebuilding the spreadsheet, which discourages sensitivity analysis.
- **How It Works.** Scenarios are ephemeral overlays on live scores. Users adjust parameters in a dedicated UI and instantly see how rankings shift. Scenarios can be saved for comparison and optionally embedded in the Selection Report's Sensitivity Analysis section. No data duplication; scenarios always reflect the latest underlying scores. Business tier: 10 scenarios, no report integration. Enterprise: 50 scenarios, full report integration.

**Related (Appendix C):** C.18 Scenario Comparison View · C.19 Sensitivity Analysis · C.20 Simulation Mode · C.21 Scenario Lifecycle & Immutability.

---

### 6.5 TCO Modeling

- **Summary.** Cost modeling treated as a first-class Use Case type, with structured vendor pricing inputs and multi-year projections.
- **Purpose.** Produce apples-to-apples cost comparisons across vendors and inform long-term procurement decisions.
- **Problem Solved.** Free-text pricing fields produce incomparable vendor responses; TCO spreadsheets use inconsistent assumptions.
- **How It Works.** Pricing requirements accept structured vendor responses: flat, tiered, one-time, percentage-of-license, estimate-range, and discount. TCO is computed across configurable time horizons (1/3/5 year) and seat trajectories (flat, growth %, steps). TCO data flows through the same pipeline as capability scores, appears in the Selection Report, and composes with Scenario Modeling. Business tier: 20 pricing requirements; Enterprise: unlimited.

**Related (Appendix C):** C.22 Seat Growth Compounding Model · C.23 TCO Breakdown Report · C.24 TCO Pricing Structures.

---

### 6.6 Policy-Powered Requirement Generation

- **Summary.** Upload a compliance framework (NIST, ISO 27001, SOC 2, HIPAA, GDPR) and the Agent parses it into structured Requirements with traceability back to source controls.
- **Purpose.** Eliminate manual translation of 200-page compliance PDFs into evaluation criteria.
- **Problem Solved.** Security and Legal teams rewrite the same compliance requirements evaluation after evaluation, with drift between versions and no traceability.
- **How It Works.** PDF ingestion via Opus-tier document parsing. The Agent extracts control statements, deduplicates against existing matrix entries (Haiku, 90% confidence threshold), and proposes Requirements with a `policy_source` pointer to the exact control. Team Leads approve/reject in a review queue. The mapping is maintained going forward so updates to the source policy flag the downstream requirements. Business: 3 ingestions/month, 100-page cap. Enterprise: unlimited, 500-page cap.

---

### 6.7 Organizational Intelligence

- **Summary.** Cross-evaluation analytics that aggregate data across all historical Workspaces within an Organization.
- **Purpose.** Surface institutional knowledge that would otherwise be trapped in archived Workspaces.
- **Problem Solved.** Every evaluation starts from scratch; prior vendor performance is forgotten; scoring inconsistencies across evaluations go undetected.
- **How It Works.** The feature exposes vendor performance trends, scoring efficiency metrics (time-per-requirement, override rate, disagreement frequency), and cross-evaluation discrepancy detection (the same vendor scored differently on the same requirement in two Workspaces — explained or flagged). Business: Vendor History + Efficiency. Enterprise: Full analytics + AI-driven Suggestions.

**Related (Appendix C):** C.25 Intelligence Cache Types & TTL · C.26 Vendor Performance Briefing · C.27 Efficiency Metrics Briefing · C.28 Discrepancy Analysis Briefing & Investigation Modal · C.29 Predictive Suggestions.

---

### 6.8 Workspace Analytics & Pulse Health Score

#### 6.8.1 Pulse Health Score

- **Summary.** A 0–100 composite score weighted across four signals: SLA Compliance (0.3), Scoring Progress (0.3), Response Rate (0.2), Phase Velocity (0.2).
- **Purpose.** Give Workspace Owners and Executive Sponsors a single number to track evaluation health.
- **Problem Solved.** Status updates are verbal, subjective, and often out-of-date.
- **How It Works.** Scores are phase-aware — before Phase 6, SLA Compliance and Phase Velocity weight equally; Scoring Progress is included only from Phase 10. Color thresholds: Green (80–100), Yellow (50–79), Red (0–49). Calculated daily at 09:00 UTC with 7-day trend sparkline.

#### 6.8.2 Pulse Digest Email

- **Summary.** Weekly email (Monday 09:00, configurable) to Workspace Owners and opt-in team members.
- **Purpose.** Push health insights to stakeholders who don't live in the app.
- **Problem Solved.** Executives and functional leads fall behind on evaluation status.
- **How It Works.** Includes Health Score breakdown, a ~300-token Sonnet-generated summary with specific recommendations, ranked action items, and a key-metrics table.

#### 6.8.3 In-App Pulse Widget

- **Summary.** Dashboard card with Health Score, trend sparkline, and signal breakdown.
- **Purpose.** In-app visibility for workspace members.
- **Problem Solved.** No at-a-glance health visibility.
- **How It Works.** Links to `/workspace/:id/pulse` with the full digest archive (past 12 weeks, exportable as CSV).

**Related (Appendix C):** C.30 Core Analytics Metrics Suite · C.31 Filter Bar & Aggregation · C.32 Analytics Export & Drill-Down.

---

### 6.9 Q&A Threads

- **Summary.** Asynchronous vendor-buyer communication on specific requirements, phase-gated and visibility-controlled.
- **Purpose.** Replace ad hoc email Q&A with structured, auditable threads tied to the requirement they concern.
- **Problem Solved.** Vendor clarification questions in email fragment context across inboxes and never make it into the evaluation record.
- **How It Works.** Threads are phase-gated: unavailable in Phases 1–5, editable by both sides in Phases 6–7, read-only for vendors in Phase 8, fully read-only in Phases 9–12. Visibility is configurable per thread — **Public** (all vendors + buyer team see it) or **Private** (only the asking vendor and buyer leadership). Buyers can mask vendor identity in public threads. Threads support Markdown, @mentions, and file attachments (PDF/DOCX/XLSX/PNG/JPG, <10MB, virus-scanned). Vendors are capped at 50 questions per workspace; Enterprise Workspace Owners can grant up to 10 additional slots via a formal request workflow. The Agent can suggest Q&A questions for buyers based on requirement text and existing threads. Business and Enterprise only.

**Related (Appendix C):** C.33 Thread Schema & Attachment Handling · C.34 Author Masking · C.35 Full-Text Thread Search & Listing · C.36 Additional Q&A Slots Request Workflow.

---

### 6.10 Template Library

- **Summary.** Pre-built workspace templates (Use Cases + Requirements) that accelerate evaluation setup.
- **Purpose.** Eliminate the cold-start cost of every evaluation.
- **Problem Solved.** Blank-page setup consumes the first 1–2 weeks of each evaluation and encourages shortcuts.
- **How It Works.** Two sources: Sourcera-curated templates seeded at Org creation, and custom templates created from completed evaluations. Templates pre-populate Use Cases and Requirements, then customize in-place. Custom templates are Org-scoped and shareable within the Organization. Available on all plans.

**Related (Appendix C):** C.37 Template Seeding at Organization Creation · C.38 Template Versioning & Update Flow · C.39 Template Preview & Drill-Down.

#### 6.10.1 Seller Templates (Publishable to Buyers)

- **Summary.** Sellers can publish evaluation templates to the Marketplace — pre-scoped Use Cases and Requirements for their software category that buyers can clone.
- **Purpose.** Distribute seller expertise into the buyer's early setup phase; create a content-driven distribution moat.
- **Problem Solved.** Buyers don't know how to evaluate categories they haven't bought before; sellers have no mechanism to shape the evaluation frame.
- **How It Works.** Sellers author templates in the Seller Console, submit for Ops review (anti-spam rubric), and publish. Published templates surface in Buyer Template Discovery (§9 Marketplace extension). Every clone creates a badge in the buyer's Workspace that deep-links back to the originating Seller Software Page. Ops-level version control and a clone-lineage audit.

#### 6.10.2 Buyer Template Discovery

- **Summary.** A dedicated Marketplace surface where buyers browse templates by category, featured status, and clone count.
- **Purpose.** Convert the Marketplace from a vendor-only surface into a template-first discovery experience.
- **Problem Solved.** Buyers don't know templates exist; sellers have no distribution path.
- **How It Works.** Placed prominently in onboarding and in the Workspace creation flow. Featured templates curated by Ops. Each template card shows clone count, seller verification tier, and a one-click "Clone into new Workspace" action.

---

### 6.11 Inbox & Pulse (Notifications)

- **Summary.** A unified notification center across email, in-app, Slack, and Teams, with per-channel preferences per event type.
- **Purpose.** Keep collaborators informed without overwhelming them.
- **Problem Solved.** Evaluation communication is fragmented; critical events get lost.
- **How It Works.** Users configure per-event-type channel routing (digest vs. real-time, email vs. in-app). System events (SLA breaches, phase advancements, Q&A posts, score finalizations) route automatically. The Inbox is the canonical in-app surface.

**Related (Appendix C):** C.40 Inbox Feed Schema & Item Expiry · C.41 Per-Event Notification Settings Matrix · C.42 Full Notification Event Catalog · C.43 Slack Integration · C.44 Webhook Notifications · C.119 Internal Comments · C.120 Presence & Unread Tracking.

---

### 6.12 The Sourcera Agent

- **Summary.** An infrastructure layer — not a feature — woven into every stage of the product. Powered by Claude (Anthropic) with tiered model selection: Opus for deep reasoning, Sonnet for general-purpose capabilities, Haiku for high-volume tasks.
- **Purpose.** Augment and accelerate human judgment across every phase of the evaluation pipeline without ever replacing it.
- **Problem Solved.** Evaluation work is dominated by administrative overhead (document parsing, deduplication, evidence extraction, pre-scoring, summary generation, status reporting) that consumes functional leads' attention away from actual vendor evaluation.
- **How It Works.** Operates autonomously based on pipeline phase and user-configured rules, within strict data boundaries (Seller Console Agent cannot access Buyer Console data, and vice versa). All outputs are labeled `[AI-Generated]` with inline confidence scores. Every output includes a "Was this helpful?" feedback loop. Outputs are filtered against factually incorrect pre-scores, unseen vendor names, and direct scoring recommendations. Failed or risky outputs gracefully degrade — the feature works without Agent suggestion.

#### 6.12.1 21 Cataloged Capabilities (Master Spec)

| # | Capability | Model | Phase |
|---|---|---|---|
| 1 | Policy Document Parsing | Opus | 1–5 |
| 2 | Policy Deduplication | Haiku | 1–5 |
| 3 | Policy Traceability Mapping | Sonnet | 1–5 |
| 4 | Triage Auto-Mapping | Haiku | 1+ |
| 5 | Requirement Splitting | Sonnet | 1 |
| 6 | Vendor Invite Suggestion | Sonnet | 3 |
| 7 | KB-to-Response Suggestion | Haiku | 6+ |
| 8 | Evidence Parsing | Sonnet | 6+ |
| 9 | Q&A Answer Suggestion | Sonnet | 7 |
| 10 | Pre-Scoring | Sonnet | 10 |
| 11 | Disagreement Insight Card | Sonnet | 10 |
| 12 | Demo Focus Brief | Sonnet | 11 |
| 13 | "What Would Flip" Analysis | Sonnet | 10–12 |
| 14 | TCO Analysis Narrative | Sonnet | 12 |
| 15 | Sensitivity Narrative | Sonnet | 12 |
| 16 | Org Intelligence Briefing | Sonnet | Any |
| 17 | KB Staleness Detection | Haiku | N/A |
| 18 | KB-to-Capability Suggestion | Haiku | N/A |
| 19 | Pulse Digest (Weekly) | Sonnet | Any |
| 20 | SLA Escalation | Rule-based | Any |
| 21 | Comment Thread Summary | Haiku | Any |

#### 6.12.2 Expansion Capabilities (Product_Ideas)

The Capability Registry is extended beyond the Master Spec 21: `page_enrichment` (Opus, Seller Pages), `kb_bootstrap` (Opus, first-crawl KB seeding), `first_pass_responses` (Sonnet/Managed Agent, full RFP first-pass drafts), `team_suggestion` (Haiku), `next_evaluation_suggestion` (Sonnet), `external_vendor_lookup` (Haiku, Buyer-Pull Invites), `guide_draft_generation` (Sonnet, "How to Evaluate [X]"), `guide_refresh_analysis` (Haiku), `category_faq_generation` (Sonnet, Category Pages), `market_intelligence_report` (Opus), `ghost_rfp_ingestion` (Opus, Ghost-Bid Importer).

#### 6.12.3 Confidence Thresholds

- **Summary.** Every Agent output carries a confidence score (0.0–1.0). Results below the configured threshold are suppressed.
- **Purpose.** Prevent low-quality suggestions from cluttering the UI.
- **Defaults.** KB suggestions 70%, Policy deduplication 90%, Evidence parsing 60%, Pre-Scoring 65%, Disagreement Cards 50%. Adjustable per Org in Settings → Agent.

#### 6.12.4 Custom Agent Instructions

- **Summary.** Team Owners can write scoped natural-language rules that apply globally across all active Workspaces (e.g., "Automatically flag any vendor response mentioning single-tenant hosting as High Risk").
- **Purpose.** Let functional leaders encode domain expertise once and enforce it across every evaluation without manual per-workspace review.
- **Problem Solved.** InfoSec and Legal leads can't scale their judgment across concurrent evaluations.
- **How It Works.** Instructions are sandboxed against prompt injection, version-tracked in the audit log, and applied within 60 seconds of save.

#### 6.12.5 Token Budgets and Guardrails

On the Master Spec model: Free 50K/month (hard cap), Business 500K/month ($0.01/1K overage), Enterprise 5M/month. Under the v2 consumption model (Pricing Strategy), budgets are denominated in value-dollars with outcome accounting; see §2 above. Usage visible in Settings → Agent Usage with per-capability breakdown.

**Related (Appendix C):** C.55 Managed Agent Definitions · C.57 Skills · C.59 Beta Header & Version Pinning · C.76 Capability Registry.

---

### 6.13 Seller Console — Knowledge Base

#### 6.13.1 KB Core

- **Summary.** An AI-indexed library of reusable response content that grows with every evaluation.
- **Purpose.** Serve as the seller's strategic asset — a private response library plus a source of capability evidence.
- **Problem Solved.** Vendors rewrite the same SOC 2, DPA, and product descriptions for every RFP.
- **How It Works.** Three ingestion channels: (1) closed bid responses (bulk save or auto-save on withdrawal), (2) manual authoring, (3) automated web crawling via Firecrawl. All entries pass through a review-and-approval workflow before becoming active.

#### 6.13.2 Document Library

- **Summary.** A centralized repository for compliance and corporate documents (SOC 2 reports, ISO certificates, DPAs, penetration test summaries) that apply across many bids.
- **Purpose.** Treat corporate documents as first-class artifacts with lifecycle management.
- **Problem Solved.** Outdated SOC 2 reports and expired DPAs make it into bid responses.
- **How It Works.** Documents carry expiration dates, categories, and version chains. When a new version is uploaded, all active bids referencing the old version are flagged. The Agent can auto-attach eligible documents to matching responses.

#### 6.13.3 Automated Documentation Crawling (Firecrawl)

- **Summary.** Configurable crawlers that pull help centers, API docs, and trust centers into the KB.
- **Purpose.** Keep the KB current without manual intervention.
- **Problem Solved.** Vendor content drifts rapidly; the KB becomes stale.
- **How It Works.** Sellers configure Firecrawl sources with crawl depth, frequency, and content scope. Crawled pages are chunked, deduplicated against existing entries, and queued for human review. Re-crawls detect changes in previously crawled pages and flag affected KB entries for re-verification.

#### 6.13.4 Self-Governing Health Model

- **Summary.** Every KB entry carries a `confidence_modifier` that decays based on age and review status.
- **Purpose.** Ensure stale content is deprioritized automatically.
- **Problem Solved.** Humans forget when documents expire; the Agent must learn to distrust older entries.
- **How It Works.** Entries transition `review_due` → `review_overdue` → `flagged_stale`. Stale entries are deprioritized in Agent suggestions and surfaced in the KB Health Dashboard. The Agent also learns from usage patterns: entries with low win rates or repeated cross-bid dismissals are automatically deprioritized.

#### 6.13.5 Advanced KB Retrieval (MCP-Backed)

- **Summary.** The KB is exposed to Managed Agents via a dedicated MCP server, not via raw RAG calls.
- **Purpose.** Give Agents structured, metadata-filtered access to the KB with enforced permission policy.
- **Problem Solved.** Direct RAG access leaks structure, cannot enforce per-seller namespacing, and cannot guarantee citation fidelity.
- **How It Works.** The Sourcera KB MCP Server exposes tools for retrieval, metadata filtering, citation emission, and staleness-aware ranking. Convex RAG powers vector search; hybrid dense + lexical retrieval with server-side query expansion and a re-rank model. Namespaces are pre-filtered by `seller_org_id`. Chunking is semantically aware; embeddings are versioned for safe upgrades.

#### 6.13.6 KB Bootstrapping (First-Crawl Draft Generation)

- **Summary.** On Seller signup, the Agent crawls the seller's public homepage, help docs, and trust center and generates a proposed KB from scratch.
- **Purpose.** Eliminate the cold-start wall that kills seller activation.
- **Problem Solved.** Empty KBs at signup mean the seller's first bid response is no faster than status quo, and they churn.
- **How It Works.** Opus-tier `kb_bootstrap` capability. Seller reviews a batched draft queue — accept, edit, reject per entry. First bootstrap is free for every new Seller Org.

#### 6.13.7 KB Value Capture & Stake-Building

- **Summary.** The seller's KB is the primary compounding asset of the Sourcera Seller Console. Value is captured not by locking the data in, but by making the KB objectively more valuable inside Sourcera than it is anywhere else — while making export trivial, honest, and complete. Stake is built from compounding utility, not hostage-taking.
- **Purpose.** Convert every successful bid into durable KB stake so that switching cost rises naturally with usage, paid conversion rates climb with tenure, and Free-tier sellers keep investing in their KB instead of treating Sourcera as a one-off tool.
- **Problem Solved.** Traditional B2B SaaS builds stake through data lock-in — a pattern that corrodes trust, triggers procurement objections, and invites regulatory scrutiny. Sellers need a reason to keep their KB on Sourcera that is not coercive, and Sourcera needs a growth flywheel that does not depend on lock-in.
- **How It Works.** Four mechanics combine:
  - **Honest Portability (available on every tier, including Free).** The full KB is exportable at any time as Markdown bodies, a JSON schema file, an entry metadata manifest, a provenance log (source URLs, crawl timestamps, agent version, edit history), and a zipped attachments archive. Exports are one-click, rate-limited only for abuse, never paywalled, and the exported format is documented publicly. DSAR and Right-to-Erasure compatibility is preserved (see §6.27 and Master Spec §6.8). No "export penalty" state is introduced; the seller can export daily if desired.
  - **On-Platform Compounding (features that only work inside Sourcera).** Every KB entry carries a confidence score learned from acceptance rates across drafts; a staleness state driven by the Self-Governing Health Model (§6.13.4); a win-rate weighting learned from closed-bid outcomes (cited entries × win/loss signal — see §13.1/13.3 of Seller Pricing); a cross-bid citation graph exposing which entries are load-bearing across the response corpus; and KB-to-Capability auto-declarations (§6.13 related C.46) that let the KB generate structured capability claims without human drafting. These features render the exported KB valuable outside Sourcera as text, but materially less valuable than the in-platform version — the compounding is what stays behind.
  - **KB Value Meter (surfaced product moment).** A persistent panel on the KB landing screen, visible on the Free tier, expresses the KB's accrued value in plain English: *"Your KB: 47 entries · 6 cited in closed bids · 2 with win-rate lift · Estimated value: $1,275/yr saved response time · Health: 94%."* The numbers are recomputed nightly, backed by explainable math (response-time saved × blended hourly rate; win-rate lift from citation graph × deal value where known), and every number can be clicked through to its source entries. The meter is the seller's running receipt of stake accrual.
  - **Upgrade Carry-Over Guarantee.** When a seller upgrades from Free → Pro, Growth, or Scale, every KB entry, confidence score, staleness state, citation, win-rate weight, and provenance record carries forward unchanged. No re-indexing penalty, no "re-bootstrap" forced, no entitlement-gated loss of fidelity. The guarantee is displayed at the upgrade moment as a plain-language confirmation: *"Your 47 entries, 2 years of citation history, and current confidence scores move with you."* Downgrade paths preserve the KB in read-only state for 12 months, after which archived entries are retained per the §6.27 Data Retention schedule.
- **Stake-Reveal Moments.** The compounding is surfaced at three deliberate moments: (1) on the Free tier KB landing (the Value Meter above), (2) immediately after a closed-bid outcome debrief (win/loss overlay with cited entries highlighted — see §6.16.4 and §13.2 of Seller Pricing), and (3) at the three AI-Wallet conversion thresholds (second concurrent bid, first EOI attempt, KB ceiling — see §3.1b) where the upgrade screen previews which KB features remain on each tier.
- **Design Principle.** If a seller exports their KB, we have not failed; we have built a product that gave them value they can take with them. If a seller returns six months later because their exported file was less useful than the live KB, we have succeeded.

**Related (Appendix C) for Seller KB (6.13 overall):** C.46 KB-to-Capability Auto-Suggestion · C.52 KB MCP Server · C.53 KB Retrieval Pipeline · C.54 KB Indexing Pipeline · C.55 Managed Agent Definitions · C.56 Custom Tool Contracts · C.57 Skills · C.58 Environments · C.59 Beta Header & Version Pinning · C.137 Win/Loss Debrief as Upgrade Trigger · C.139 Seller Plan Upgrade Carry-Over Guarantee.

---

### 6.14 Seller Console — Bid Workspace & Response Management

#### 6.14.1 Bid Workspace

- **Summary.** The Seller-side mirror of a buyer's Workspace — the environment in which a seller responds to one specific evaluation.
- **Purpose.** Contain all response work, team assignments, and Q&A for a single opportunity.
- **Problem Solved.** Seller teams have no shared canonical workspace for in-flight RFPs.
- **How It Works.** Bid Workspaces are structurally mirrored to the buyer's Workspace (Use Cases → Response Sections; Requirements → Response Items). Bid Owner, Bid Contributors, and Bid Viewers collaborate on responses.

#### 6.14.2 First-Pass RFP Response Generator

- **Summary.** On bid acceptance, a Managed Agent drafts a first-pass response to every requirement using the seller's KB.
- **Purpose.** Compress the first 40% of response effort into a reviewable baseline.
- **Problem Solved.** Sellers start every bid from a blank workspace even when 60–80% of answers already exist in their KB.
- **How It Works.** Flat-billed for the parent operation; outcome-settled per child response. Grounding requires every drafted response to cite KB entries — ungrounded statements are dropped. A "cite-before-state" rule and per-requirement liability trace document where every sentence came from.

#### 6.14.3 Bid Scheduling & Tasks

- **Summary.** Task-level decomposition of a bid, with due dates, assignees, and SLA timers.
- **Purpose.** Run a bid like a project with accountability.
- **Problem Solved.** Bids slip because nobody owns individual response items.
- **How It Works.** Each requirement becomes a Bid Task. Tasks can be assigned to Contributors; status flows through Draft → Review → Complete. A Bid Schedule rolls up tasks into a timeline.

#### 6.14.4 Q&A, NDA, Inbox & Pulse (Seller-Side)

- **Summary.** Seller-side mirror of buyer Q&A with NDA management, a Seller Inbox, and a seller-side Pulse.
- **Purpose.** Give sellers the same operational discipline buyers have.
- **How It Works.** Q&A inherits phase-gating from the buyer side. NDA records track signature status, expiration, and scope. Inbox aggregates seller-side events; Pulse applies the same four-signal health score to bid health.

**Related (Appendix C) for Bid Workspace (6.14 overall):** C.6 Response Lock & Concurrency · C.10 Seller Triage & Auto-Mapping · C.47 Vendor Response Drafting & AI-Suggestion Approval · C.48 Seller Analytics Surface · C.49 Seller Pulse · C.50 Bid Task & Bid Schedule Entities · C.51 NDA Module Lifecycle.

---

### 6.15 Seller Profiles, Verification & Capability Declarations

#### 6.15.1 Seller Profile

- **Summary.** A public profile with company description, certifications, industry focus, product categories, and logos.
- **Purpose.** Give buyers a verified, structured view of the seller that supports Marketplace match logic.
- **Problem Solved.** Vendor websites vary wildly; procurement teams can't quickly compare.
- **How It Works.** Authored by Marketplace Publishers. Public-facing at `sourcera.com/sellers/:slug`. Emits Schema.org Organization structured data for SEO.
- **Published-from-Day-One Default.** Every Seller Org is default-published the moment domain ownership is verified (DNS TXT record, per §6.15.2). The profile goes live at Basic verification with fields auto-populated from Domain Bootstrap (§3.6) — no gated onboarding wizard, no "request review" queue, no invisible-draft state. This is a deliberate PLG mechanic: a published profile is the seller's first stake in the marketplace, supports inbound discovery (SEO Schema.org emission is enabled from minute zero), and makes the upgrade conversation concrete (*"you're already live — upgrade to add Verified-tier badge and capability declarations"*). Sellers may explicitly unpublish via a single opt-out action; unpublished profiles remain in the DSAR data map (see §6.27). Opt-out state is captured in the Vendor Opt-Out Global Registry (C.123) to prevent re-enrichment loops.

#### 6.15.2 Verification Tiers

- **Summary.** Tiered trust badges: **Basic**, **Verified**, **Certified**.
- **Purpose.** Give buyers signal on vendor legitimacy before engaging.
- **Problem Solved.** Anyone can claim to be a vendor; buyers need a fast trust gate.
- **How It Works.** Verification is based on objective criteria — domain verification (DNS TXT record), profile completeness, and uploaded compliance documentation (SOC 2, ISO). Upgrades are unlocked automatically when criteria are met.

#### 6.15.3 Capability Declarations

- **Summary.** Machine-readable statements of what the vendor can do, linked to KB evidence.
- **Purpose.** Make vendor strengths searchable and comparable at Marketplace scale.
- **Problem Solved.** Free-text vendor descriptions are not machine-searchable and produce noisy match results.
- **How It Works.** Sellers author declarations against a shared taxonomy (maintained in the Ops Console CMS). Each declaration references KB entries as evidence. Buyers filter the Marketplace by declarations (e.g., "SOC 2 Type II + EU data residency + API > REST").

#### 6.15.4 Seller Organization Pages

- **Summary.** Rich, public-facing pages per Seller Org with company detail, products, certifications, and case studies.
- **Purpose.** SEO and discovery moat.
- **Problem Solved.** Vendors have no Sourcera-native storefront.
- **How It Works.** Auto-enriched via an Opus-tier `page_enrichment` capability that crawls the seller's public surfaces and drafts content for seller review. Structured data for search engines. Verified domain ownership gates publication.

#### 6.15.5 SellerSoftware Entity & Software Pages

- **Summary.** Individual software products (distinct from the Seller Org) with their own pages — one Seller Org can own many.
- **Purpose.** Enable multi-product vendors to be discovered per product; support comparison pages.
- **Problem Solved.** A vendor with five products can't be represented by a single profile.
- **How It Works.** Each SellerSoftware entity has a category, slug, description, capability declarations, and KB namespace. Claim verification ensures only the true owner can author the page. Powers Category Pages, Comparison Pages, and Market Intelligence reports.

**Related (Appendix C) for Seller Profiles & Software (6.15 overall):** C.46 KB-to-Capability Auto-Suggestion · C.60 Marketplace Tags & Controlled Vocabulary · C.123 Vendor Opt-Out Global Registry.

---

### 6.16 Vendor Discovery & RFP Marketplace

#### 6.16.1 Marketplace Listings

- **Summary.** Summary listings of buyer evaluations that buyers choose to publish to attract vendors.
- **Purpose.** Close the discovery gap on both sides.
- **Problem Solved.** Buyers miss qualified vendors; vendors miss opportunities.
- **How It Works.** Listings expose only buyer-authored summaries — never the requirement matrix, scores, or vendor list. Buyers choose what to expose (timeline, category, region, anonymized company size band).

#### 6.16.2 Expression of Interest (EOI) Workflow

- **Summary.** Structured vendor response to a Marketplace listing.
- **Purpose.** Convert Marketplace interest into evaluable candidates.
- **Problem Solved.** Cold inbound contact is noisy and unstructured.
- **How It Works.** Vendors submit an EOI with a short pitch, referenced Capability Declarations, and linked Seller Profile. Buyers review and can accept qualified sellers directly into their evaluation.

#### 6.16.3 NDA Records

- **Summary.** Platform-managed NDA lifecycle for pre-evaluation information exchange.
- **Purpose.** Handle the legal artifact required before sensitive details are exchanged.
- **Problem Solved.** NDA negotiation via email stalls evaluations.
- **How It Works.** NDA Records track template, signer identities, status, and expiration. Can be bound to a specific Workspace or operate at the Org level.

#### 6.16.4 Match Scoring (Enterprise)

- **Summary.** AI-ranked vendor-opportunity fit.
- **Purpose.** Cut the noise in EOI review.
- **Problem Solved.** High-volume Marketplace listings overwhelm buyer review queues.
- **How It Works.** Scores are computed from Capability Declarations, verification tier, KB content freshness, historical response quality, and category fit. Free viewers see qualitative labels ("Strong match"); numeric scores gate behind the paid capability.

#### 6.16.5 Category & Comparison Content

- **Summary.** AI-generated, continuously refreshed Category Pages (M9), "How to Evaluate [X]" Guides (M10), Software Comparison Pages (M11), Aggregate Market Intelligence Reports (M12), and a Public Marketplace Heat Map (M13).
- **Purpose.** Build an organic-search moat per category; seed buyer-side signups.
- **Problem Solved.** Category education lives on G2/Gartner; Sourcera needs its own content layer.
- **How It Works.** Each content type has a dedicated Agent capability (`category_faq_generation`, `guide_draft_generation`, `guide_refresh_analysis`, `market_intelligence_report`). Editorial review by Marketing. k-anonymity enforced (k=5 signal, k=10 aggregate, k=20 market intelligence). All are `sourcera_owned` AI operations — billed to the internal Platform Marketing cost center, not the customer.

#### 6.16.6 Marketplace Discovery Pricing (Non-AI Monetization Layer)

- **Summary.** A discrete, non-AI revenue layer that monetizes discovery placement, verification trust, and sponsored surfaces in the Marketplace — parallel to but accounting-isolated from the AI-Wallet outcome-based economy.
- **Purpose.** Give the Marketplace a second revenue engine that is predictable, high-margin, and does not consume AI credit. Let sellers who have saturated their AI usage still invest in demand-capture. Give buyers differentiated trust signals without gating the core discovery experience.
- **Problem Solved.** An AI-only seller model would leave Sourcera with no revenue from sellers whose demand is structurally lumpy (slow months still need presence), and would conflate two very different cost bases — AI inference vs. surface-area allocation — in a single ledger. Marketplace placement is a fixed-supply good; pricing it as a subscription line item prevents AI-credit cannibalization.
- **How It Works.** Three SKUs, all billed as line items distinct from AI consumption and all surfaced in the Admin Console Billing tab with their own allocation controls:
  - **Promoted Listings.** Keyword-targeted, category-scoped placements at the top of Marketplace category pages and in EOI-eligible Buyer Workspaces. Priced per impression and per qualified EOI acceptance (dual-metric). Inventory is auctioned with a second-price clearing rule to prevent overbidding; seller sets a daily cap and a per-EOI cap. Impressions are k-anonymized at k=5 before being attributed to seller analytics (no buyer-level identification). Frequency-capped per buyer per category per rolling 7-day window to prevent saturation.
  - **Verification Tiers (Paid Upgrade Path).** The Basic tier remains free and automatic on domain verification. **Verified** ($X/mo — see Seller Pricing §9 rate card) adds a visual badge, elevates match-score weight by a published multiplier, and requires SOC 2 or ISO 27001 documentation review (flat-billed `verification_review` AI operation). **Certified** ($Y/mo) adds deep compliance review (SOC 2 Type II, ISO 27001, HIPAA/PCI as applicable), a quarterly re-review cadence, and "Certified" listing placement priority. Verification fees are invoiced monthly alongside plan subscription and do not draw from AI Wallet.
  - **Featured Placements.** Paid-placement surfaces in three locations: Category Pages (M9), Comparison Pages (M11), and the Public Marketplace Heat Map (M13). Limited inventory, sold on monthly or quarterly commitments. Labeled with a persistent "Featured" visual treatment; disclosure complies with FTC native-advertising guidance. Featured status does not alter organic match scores; ranking is surfaced in a distinct visual lane.
- **Accounting Isolation.** Marketplace Discovery revenue lives in its own cost center (`rev_marketplace_discovery`). It does not share a ledger with AI Wallet top-ups (`rev_ai_wallet`) or subscription seats (`rev_subscription`). Finance dashboards report gross margin for each line independently. This is called out because the three streams have structurally different unit economics: AI Wallet ≈ 4.5% platform margin (cost_base × 1.05 capture vs. cost_base × 10 in buyer-seen value), subscription ≈ 85–90%, Marketplace Discovery ≈ 95%+. Blending them would hide pricing errors.
- **Buyer Experience Guardrails.** Paid placements never suppress organic match signal; Verified/Certified badges are label-only and do not override capability-declaration filters; Featured lanes are visually distinct (separate surface, separate visual treatment, "Featured" label with tooltip explaining the paid relationship). Match Scoring (§6.16.4) is computed on organic signal only — a Certified seller with weak capability declarations ranks below a Basic seller with strong declarations in the scored results, preserving buyer trust.
- **Anti-Spam Linkage.** Promoted Listings eligibility requires maintained KB health (§6.13.4) above a floor threshold and ≥1 closed bid in the prior 90 days. This prevents low-signal sellers from buying their way around the anti-spam controls in §3.5.

**Related (Appendix C) for Marketplace (6.16 overall):** C.60 Marketplace Tags & Controlled Vocabulary · C.61 Match Score Internals · C.62 EOI Workflow Fields & Acceptance Flow · C.67 M9 Per-Category Pages · C.68 M10 How-to-Evaluate Guides · C.69 M11 Comparison Pages · C.70 M12 Market Intelligence Reports · C.71 M13 Heat Map · C.123 Vendor Opt-Out Registry · C.131 Marketplace Discovery Pricing (Non-AI).

---

### 6.17 Seller Signals (Anonymized Buyer Intent)

- **Summary.** Anonymized, k-anonymized buyer intent signals delivered to sellers (category interest, region, industry band, timeline).
- **Purpose.** Let sellers invest in the right categories at the right time; create GTM value for sellers.
- **Problem Solved.** Sellers guess at market demand; buyers don't want to be on "lists."
- **How It Works.** Buyers opt in (off by default) to signal sharing. Signals are stripped of all PII and aggregated with a k-anonymity floor. Delivery surfaces include in-app Seller Dashboard, weekly digest, and CRM Sync. De-anonymization happens only when the buyer explicitly sends an EOI or direct invite.

---

### 6.18 CRM Sync (Salesforce, HubSpot, Dynamics, Pipedrive)

- **Summary.** Bidirectional sync between Sourcera Seller Console and the seller's CRM.
- **Purpose.** Put Marketplace activity into the system sellers already live in.
- **Problem Solved.** Sellers context-switch between tools and lose opportunities.
- **How It Works.** Account matching algorithm (domain + name + fuzzy), routing rules, activity payloads for each event type (EOI submitted, Q&A posted, bid closed). Failure handling with retry queues. Setup UX provides OAuth connection and field mapping.

---

### 6.19 Integrations & Webhooks

- **Summary.** Post-Phase 13 export to project management tools and bidirectional sync with CRM/collaboration tools.
- **Purpose.** Close the loop from evaluation to implementation.
- **Problem Solved.** Selection Report outputs die inside Sourcera; action items never make it to engineering.
- **How It Works.**
  - **Jira Cloud:** Use Cases → Epics, Requirements → Issues.
  - **Linear:** Use Cases → Projects, Requirements → Issues.
  - **Asana:** Task-level export.
  - **Azure DevOps:** Work item mapping.
  - **Salesforce:** Bidirectional vendor account sync. Marketplace EOIs auto-create Salesforce Accounts.
  - **Slack / Microsoft Teams:** Channel-scoped notifications per workspace.
  - **Zapier / Make:** Via Webhook API for custom automation.
- Webhooks are HMAC-SHA256 signed, idempotent (unique `event_id` per delivery), retry on exponential backoff with dead-letter queue after 5 failures. Payload ≤ 256 KB.

**Related (Appendix C):** C.43 Slack Integration (Channel Subscriptions, Slash Commands) · C.44 Webhook Notifications & Event Mapping · C.45 Integration Phase Export Mapping.

---

### 6.20 The Sourcera API

- **Summary.** REST API (v1, `https://api.sourcera.io/v1`) exposing full CRUD on Workspaces, Requirements, Use Cases, Responses, Scores, Teams, Members, KB Entries, and Marketplace Listings.
- **Purpose.** Programmatic access for power users and integrations.
- **How It Works.** Bearer token (`srck_{org_prefix}_{token_string}`) with fine-grained scopes. Tokens are dynamic — permissions mirror real-time RBAC. Cursor-based pagination (default 50, max 250). Rate limits per-Org (soft 5K/hr, hard 10K/hr, burst 100/min). Monthly quotas per plan. API add-on $99/mo on any Business tier; included in Enterprise. API does **not** expose raw LLM passthrough — AI calls via the API consume the plan's AI budget at the same outcome-accounted rates.

**Related (Appendix C):** C.105 API Token Lifecycle · C.106 Full API Endpoint Catalog · C.107 API Error Handling Schema · C.108 Rate Limit Headers & 429 Enforcement.

---

### 6.21 Command Palette & Search

- **Summary.** `Cmd+K` universal accelerator with context-aware fuzzy search across navigation, actions, entities, and Marketplace content.
- **Purpose.** Keyboard-first operation for power users.
- **Problem Solved.** Nested menus slow expert workflows.
- **How It Works.** Context-scoped results: inside a Requirement, search prioritizes related entities; on a Use Case, suggests matching Marketplace content (Loop 7). Supports actions (phase advance, assign, export), navigation, and entity lookup.

---

### 6.22 RBAC — Role-Based Access Control

Two-level RBAC enforced at the API level and reflected in the UI.

#### 6.22.1 Org-Level Roles

- **Org Owner** — full access: workspaces, members, billing, SSO, audit logs, integrations.
- **Org Admin** — all Org-scoped resources except billing.
- **Member** — limited Org-scoped visibility (team membership, shared team resources).
- **Billing Admin** (added in Product_Ideas v1) — owns AI spend caps, wallet, and billing events.

#### 6.22.2 Buyer Console Roles (Workspace-Scoped)

- **Workspace Owner** — owns the workspace, approves vendors, signs final selection, controls phase transitions.
- **Evaluation Lead** — oversees timeline, coordinates scorers, escalates issues. Cannot delete the workspace.
- **Evaluator** — authors requirements, reviews responses, scores in Phases 10–11, comments.
- **Scorer** — scores and rationales only. Cannot edit requirements.
- **Guest** — four configurable permission profiles (`read_only`, `contributor`, `scorer`, `full_participant`) scoped to specific Use Cases via `assigned_use_case_ids`.

#### 6.22.3 Seller Console Roles (Bid-Workspace-Scoped)

- **Bid Owner** — owns the bid, assigns team, interfaces with buyer.
- **Bid Contributor** — completes assigned responses.
- **Bid Viewer** — read-only.
- **Seller Team Leads** (InfoSec, Product) — verify AI-suggested responses, manage KB health, govern the Document Library.

#### 6.22.4 Marketplace Roles

- **Marketplace Publisher** (Org-scoped) — creates/edits Marketplace Listings and Seller Profiles.
- **Marketplace Viewer** (global) — browses listings, submits EOIs.

#### 6.22.5 Executive Sponsor

An informal persona (not an RBAC role) — typically Org Owner or Org Admin, receives Evaluation Pulse escalations.

**Related (Appendix C):** C.101 Guest Scope Isolation Enforcement.

---

### 6.23 Identity & Security

#### 6.23.1 Authentication (WorkOS)

- **Summary.** WorkOS-backed auth supporting email + password, Google, Microsoft, and SAML SSO.
- **Purpose.** Enterprise-grade auth without building it in-house.
- **How It Works.** SSO/SAML with Okta, Entra ID, OneLogin, Google Workspace, Auth0. SCIM provisioning for user lifecycle management with graceful Bid Owner succession on deprovisioning. Guests bypass SSO/SCIM to avoid polluting the corporate directory.

#### 6.23.2 MFA

- **Summary.** TOTP and WebAuthn (no SMS).
- **Availability.** Not on Free; optional on Business; optional with Org-wide enforcement on Enterprise.

#### 6.23.3 Domain Governance

- **Summary.** Verified corporate domains block unsanctioned Organization creation by employees.
- **Purpose.** Prevent shadow IT.
- **How It Works.** DNS TXT verification. Claimed domains force new signups to join the existing Org.

#### 6.23.4 Dynamic API Keys

- **Summary.** Tokens mirror real-time RBAC — no permission snapshots at creation.
- **Purpose.** Keep API permissions aligned with user role changes.
- **How It Works.** Enterprise enforces 90-day rotation. Fine-grained scopes (`read:requirements`, `write:responses`, etc.).

#### 6.23.5 IP Restrictions (Enterprise)

Network-level access control. Configured per Org by the Org Owner.

#### 6.23.6 Compliance

- SOC 2 Type II targeted within 12 months of launch.
- ISO 27001 planned.
- HIPAA BAA available on Enterprise.
- GDPR DPA available on all plans.
- Annual penetration testing.
- SBOM available to Enterprise on request.

**Related (Appendix C):** C.102 WorkOS Configuration · C.103 Session Management · C.104 Domain Claiming & Verification · C.105 API Token Lifecycle.

---

### 6.24 Audit Logging

- **Summary.** Every mutation is logged with timestamp, user, action, and diff.
- **Purpose.** Satisfy procurement audit, SOC 2, ISO 27001 requirements.
- **Problem Solved.** Spreadsheet evaluations have no audit trail.
- **How It Works.** SHA-256 hashed event chain. Retention: Free 30 days, Business 1 year, Enterprise 7 years. Exportable by Org Admin. Every access (successful and failed) is logged.

---

### 6.25 Data Residency

- **Summary.** Region-scoped data residency via the `data_residency_region` field on Organization.
- **Supported regions.** **US** (AWS us-east-1, us-west-2), **EU** (AWS eu-west-1, eu-central-1, GDPR-certified), **Custom** (Enterprise — customer VPC, on-premises, or regional fallback).
- **How It Works.** Region is set at initial setup; region change after workspace creation requires data migration and is not available during production evaluations.

---

### 6.26 Data Privacy & Abuse Prevention

- **Summary.** DSAR response within 30 days (JSON export with human-readable folder structure). Anonymization option for Enterprise. Data anonymization for right-to-erasure preserves audit-trail integrity while removing PII.
- **Abuse Prevention.** OWASP Top 10 mitigations: strict Markdown sanitization (no raw HTML, no external images, no scripts), CSP headers, tenant-scoped database queries, rate-limited auth endpoints, virus scanning on uploads.

---

### 6.27 Settings

- **Summary.** Org-level, workspace-level, and user-level settings surfaces.
- **Scope.** Org: SSO, SCIM, MFA enforcement, IP restrictions, data residency, audit log retention, Agent thresholds, plan management, billing. Workspace: name, owner, phase configuration, team assignments, scenario settings. User: notifications, channel routing, profile.

---

### 6.28 Onboarding

Onboarding splits into two console-scoped flows with different activation goals and different hero moments. Both are self-service, both use WorkOS SSO (Google/Microsoft magic-link fallback), and both require zero credit card. The shared principle across both flows is to collapse the distance between arrival and first experience of AI value to under three minutes.

#### 6.28.1 Buyer Onboarding

- **Summary.** Self-service Org creation with Google/Microsoft SSO login, zero credit card.
- **Goal.** 60 seconds to first evaluation.
- **How It Works.** Signup → email verification → Org creation (domain auto-suggest) → template pick → first Workspace created. First-run tour surfaces Cmd+K, inline edit, and the phase sidebar.

**Related (Appendix C):** C.121 Buyer Onboarding 7-Step Flow.

#### 6.28.2 Seller Onboarding Experience

- **Summary.** A seven-stage flow purpose-built to convert Forced-Vendor-Signup (§3.1b, §3.6) arrivals into activated Seller Orgs with a published profile, a bootstrapped KB, and a submitted first-pass bid response — all within the first 45 minutes on platform. Every stage is paired with a commitment-reducing default and a concrete stake-building moment.
- **Purpose.** Maximize activation from the cold-arrival magic-link state and make the Hero Moment (§3.6) structurally unavoidable — the seller cannot complete onboarding without experiencing it.
- **Problem Solved.** Traditional B2B onboarding front-loads commitment (credit card, team seats, workspace naming, billing address) and back-loads value (actual work happens after configuration). A Forced-Signup seller has no patience for this inversion — they arrived mid-task. The onboarding has to deliver value before asking for anything.
- **How It Works — Seven Stages.** Each stage has a success criterion, a fallback, and a target elapsed time.

  1. **Magic-Link Arrival (t ≈ 0s).** The seller clicks a buyer-originated invite link from email. The URL carries a pre-bound `bid_id`, an `invite_signature`, and a `seller_domain_hint` derived from the recipient email domain. The landing page renders an unauthenticated preview of the buyer's published RFP summary plus a single primary action: *"Accept this bid and draft your response in 3 minutes."* No signup form is visible yet. Fallback: if the link is expired or revoked, the seller sees a generic Marketplace-style browse page and can still self-serve signup. **Success criterion:** ≥90% of arrivals reach the primary CTA.
  2. **Signup + Domain Bootstrap (t ≈ 10–45s).** Primary CTA triggers Google/Microsoft SSO or magic-link; no password, no email verification step, no credit card. Concurrently (parallel, not sequential), the `kb_bootstrap` Managed Agent starts crawling the seller's public homepage, help docs, trust center, and pricing page using the `seller_domain_hint`. The crawl runs in background. **Success criterion:** seller arrives at Stage 3 in under 45 seconds regardless of crawl status.
  3. **Landing on the Bid Workspace with Value Already Present (t ≈ 45s–3min).** The seller lands on the Bid Workspace for the bid they were invited to. Three surfaces are pre-populated before the seller touches anything: (a) a draft KB with entries proposed from the Domain Bootstrap crawl (Draft state, not yet Active); (b) a first-pass RFP response with cited draft answers for every requirement the KB crawl could ground; (c) a progress strip at the top — *"KB proposed: 31 entries · Response drafted: 18 of 24 requirements · Missing: 6 requirements (needs your input)."* The seller's first action is to review, not to configure. **Success criterion:** ≥80% of sellers edit at least one KB entry or response item within the first 3 minutes.
  4. **Review + Submit (t ≈ 3–30min).** The seller accepts/edits/rejects KB entries in a batch queue; the KB transitions from Draft → Active per entry on acceptance. The first-pass response is editable inline with citation-backed drafts. Missing-requirement items are highlighted with a single-tap *"Answer with Agent"* action that runs the `q_and_a_suggestion` capability. Commitment is minimized: no "Create Team" step, no "Invite Collaborators" gate, no billing prompt, no capability-declaration wizard. **Success criterion:** seller submits the bid response.
  5. **Post-Submit Stake-Reveal Screen (t ≈ +5s after submit).** Immediately on submit, the seller sees a full-screen reveal: *"You're live on Sourcera."* The screen displays: the now-published seller profile URL (domain-verified from Stage 2), the live KB count and health score, the Value Meter (§6.13.7) computed for the first time, the cross-bid citation graph showing which KB entries were used in this bid and will compound across future bids, and a one-click toggle to opt in to Seller Signals (§6.17). Default state: profile published, KB active, Seller Signals opt-in off (consented separately). **Success criterion:** ≥70% of activated sellers dwell on this screen for >20 seconds.
  6. **Outcome Debrief (t = bid close, async).** When the parent bid closes, a debrief email and in-app notification fire: *"Your bid closed. Here's what you learned."* The debrief shows win/loss status (where disclosed by buyer), which KB entries were cited in the response, a confidence score lift/decay on each entry driven by the outcome, and the bid-level KB Value Meter delta. This is the second stake-reveal moment — the seller sees their KB getting smarter from the outcome.
  7. **Upgrade Touch at the Three Conversion Moments (async).** The seller remains on Free until they hit one of three AI-Wallet thresholds: (a) second concurrent bid, (b) first EOI attempt, (c) KB ceiling at 500 entries. Each threshold surfaces a contextual upgrade prompt that shows only what the upgrade unlocks against the seller's actual usage pattern (e.g., *"You have 2 bids in flight and 480 KB entries — Pro gives you unlimited concurrent bids, 10× KB ceiling, and keeps everything you've already built."*). Upgrade Carry-Over Guarantee (§6.13.7) is the dominant message. **Success criterion:** ≥18% trailing-90-day conversion from activated Free sellers to Pro.

- **Banned Onboarding Anti-Patterns.** The Seller Onboarding Experience explicitly does not do any of the following; deviations require formal review: require a credit card before first bid submission; require team-invite flow before first bid submission; require manual capability-declaration authoring in the onboarding path; gate the first-pass draft behind an Agent-budget configuration screen; show a modal tour that blocks the Bid Workspace surfaces; require profile-publish confirmation (publication is default on domain verification); require workspace naming (first Workspace is the Bid Workspace for the invited bid).
- **Instrumentation.** Every stage transition emits a PostHog event with `seller_org_id`, `bid_id`, stage identifier, elapsed-time-since-arrival, and stage outcome (completed | abandoned | errored). The funnel is reported daily in the Seller Activation dashboard. Stage 3 population success (pre-populated surfaces visible before seller edit) is treated as a P0 availability metric and alerts the on-call rotation when the 90th-percentile Stage-3-population latency exceeds 10 seconds.

**Related (Appendix C):** C.121 Buyer Onboarding 7-Step Flow · C.132 Seller Hero Moment · C.133 Three Conversion Moments · C.135 Seller Activation Metric · C.136 Forced-Vendor-Signup Playbook · C.137 Win/Loss Debrief · C.140 Seller Onboarding Required Capabilities · C.141 Seller Onboarding Anti-Patterns.

---

### 6.29 Notifications & Delivery Channels

- **Summary.** Loops.so for transactional and lifecycle email; in-app notifications via Convex subscriptions; Slack and Teams channel integrations.
- **Purpose.** Reach users where they work.
- **How It Works.** Per-event-type channel routing. Digest vs. real-time. Unsubscribe links on all marketing email; in-app preferences for operational events.

**Related (Appendix C):** C.41 Per-Event Notification Settings Matrix · C.42 Full Notification Event Catalog · C.43 Slack Integration · C.44 Webhook Notifications & Event Mapping.

---

### 6.30 Markdown Editor

- **Summary.** Unified rich-text editor used across Requirement descriptions, comments, Q&A threads, Use Case briefs, and internal notes.
- **Purpose.** One consistent editing surface — no format drift between surfaces.
- **How It Works.** Supports Markdown syntax, @mentions, file attachments, and inline images. Strictly sanitized — no raw HTML, no external images, no script execution.

---

### 6.31 Responsive Design & Platform Support

- **Summary.** Desktop-first with a mobile-optimized responsive layout.
- **Purpose.** Support in-meeting scoring and status checks on mobile without sacrificing the Linear Constraint.
- **How It Works.** Browser support: latest Chrome, Firefox, Safari, Edge (last two versions each). Mobile: iOS Safari and Android Chrome. Mobile translates keyboard-first patterns to gesture-first equivalents with a 5-tap ceiling for major workflows.

**Related (Appendix C):** C.114 Mobile Responsive Breakpoints & Gesture Equivalents · C.122 Accessibility & Internationalization.

---

### 6.32 Object Size Constraints

Explicit caps on entity volume per plan: requirements per workspace, use cases per workspace, vendors per workspace, KB entries per Org, document library size, crawl sources, audit log retention, export formats. Full per-plan matrix in Master Spec §39 / Pricing Strategy §3.

---

### 6.33 Data Export & Import

- **Summary.** CSV and Excel import/export on requirements, responses, scores, and vendor lists; full workspace export to PDF at any phase; JSON export for audit.
- **Purpose.** Eliminate lock-in concerns and support post-Sourcera workflows.
- **How It Works.** CSV import for requirements with schema validation. Selection Report exports to PDF. Full Workspace JSON export for audit/DSAR. Export formats vary by plan (CSV/PDF on Free; + Excel on Business; + custom on Enterprise).

---

### 6.34 Observability, Reliability & Disaster Recovery

- **SLA.** Free: best effort. Business: 99.5% uptime, 24-hour response. Enterprise: 99.9% uptime, 1-hour response.
- **Monitoring.** Synthetic endpoint checks every 60s from 3+ geographies. Datadog (metrics, APM), Sentry (errors), OpenTelemetry (tracing), PagerDuty (alerts, on-call), Statuspage.io (public incidents).
- **Incident Response.** SEV-1 <15 min response, updates every 30 min. SEV-2 <1 hr response. RCA within 48 hours.
- **Disaster Recovery.** RTO 1 hour, RPO 1 hour. Hourly Convex snapshots (30-day retention). Geo-redundant object storage. Quarterly restore tests. Sub-60s DNS failover.

---

### 6.35 Sourcera Ops Console (Internal Admin)

- **Summary.** A separate internal application for Sourcera employees — pricing table, taxonomy CMS, impersonation (audited), template review, dispute handling, fraud controls, signal integrity monitor, and PLG dashboards.
- **Purpose.** Run the business without giving Ops engineers direct database access.
- **How It Works.** Separation architecture: Ops Console is an entirely separate app with its own auth and audit boundary; mutations flow through the same APIs customers use, tagged with an Ops actor. Role matrix: Ops Admin, Pricing Admin, Template Reviewer, Support Agent, Fraud Analyst, Finance. Impersonation requires justification, is time-bound, and is fully audited; customer Org Owners are notified on every impersonation session.

**Related (Appendix C):** C.93 Separation Architecture · C.94 Ops Role Matrix · C.95 Taxonomy CMS · C.96 Seller Template Review Rubric · C.97 Baseline Assumption Manager · C.98 Impersonation Audit Requirements · C.99 Internal Analytics Dashboards by Role · C.100 Signal Integrity Monitor.

---

### 6.36 Product Usage Analytics & PLG Instrumentation

- **Summary.** A structured event taxonomy across buyer and seller surfaces, per-Org and per-user usage dashboards, and a Time-Saved Baseline model that turns usage into ROI numbers surfaced inline.
- **Purpose.** Power PLG conversion, expansion scoring, and customer-facing ROI stories.
- **How It Works.** PostHog for product analytics. Event properties are standardized. Usage dashboards show per-capability AI spend, acceptance rate, top consumers, and trend vs. prior 3 months. Time-Saved Baseline converts events into labor-hours-saved estimates and displays them in the Org dashboard. Privacy: 24-month rolling retention; full DSAR coverage.

**Related (Appendix C):** C.88 Event Taxonomy · C.89 Event Properties Standardized Schema · C.90 User Usage Dashboard · C.91 Time-Saved Baseline Model · C.92 Seller Usage Parity.

---

### 6.37 Selection Report and Selection Record

- **Summary.** Two distinct artifacts — the Selection Report (Phase 12 artifact, may be mutable until Phase 12 close) and the Selection Record (Phase 13 artifact, immutable, SHA-256 hashed).
- **Purpose.** Produce a defensible, audit-ready output that replaces the 10-hour PowerPoint.
- **Problem Solved.** Procurement decisions without documentation fail audits and are hard to justify on appeal.
- **How It Works.** Auto-generated from scores, TCO, Scenario Modeling results, and policy traceability. Sections: Executive Summary, Recommended Vendor, Ranked Shortlist, TCO Analysis, Sensitivity Analysis, Traceability Matrix, Open Risks. Exportable as PDF. Routed for signature via the Selection Report approval workflow.

---

### 6.38 Test Strategy & QA Framework

- **Summary.** Unit, integration, end-to-end, accessibility, and performance test suites with a defined coverage baseline.
- **Purpose.** Prevent regressions in a product where scoring math and phase gates are mission-critical.
- **How It Works.** CI on every PR runs unit + integration + a11y gates. E2E suites on staging. Synthetic production probes. Agent outputs are A/B evaluated against golden sets. Performance SLOs: API p95 < 500ms, dashboard initial load < 2s.

---

## Appendix A — Core Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, ShadCN/UI + BaseUI, Tailwind CSS.
- **Backend & Database:** Convex — real-time reactive database powering live subscriptions, file storage, scheduled functions, server-side business logic.
- **Collaboration:** Convex OT (collaborative editing), Convex Presence (cursors), Convex Subscriptions (live grade sync), Convex Comments + Unread Tracking.
- **AI:** Claude (Anthropic) via tiered selection (Opus/Sonnet/Haiku). Convex RAG for KB vector search. Managed Agents for multi-step operations.
- **Auth & Identity:** WorkOS (SSO, SCIM).
- **Payments:** Stripe (subscriptions, metered billing, agent token metering).
- **Email:** Loops.so.
- **Analytics:** PostHog (product, feature flags).
- **Search & Crawling:** Firecrawl (documentation crawling), Perplexity Search API (vendor research, Enterprise only).
- **PDF Parsing:** Firecrawl (PDF parsing).
- **Observability:** Pino → Datadog, Sentry, OpenTelemetry, PagerDuty, Statuspage.io.
- **Support:** Zendesk.
- **Infra:** Vercel (hosting, edge).

---

## Appendix B — Glossary (Highlights)

- **AIOperation** — single billing unit for every Agent invocation; immutable once issued; settlement append-only.
- **AI Wallet** — Org-scoped credit pool shared across Buyer and Seller Consoles; denominated in value-price credits at cost_base × 10; replenished via plan grant or on-demand top-up.
- **Buyer-Funded Pro Trial Seat (M17)** — promotional mechanic in which a buyer sponsors a forced-signup seller's first month on Pro-tier capability so the buyer gets a fuller first-pass response; seller is not auto-charged at expiry.
- **Capability Registry** — authoritative list of billable AI capabilities, maintained in the Ops Console.
- **Cost Base** — the blended Anthropic inference cost plus amortized platform overhead (retrieval, storage, orchestration) for a given capability-scale tuple; the single number from which both the `accepted` value price (× 10) and the `rejected` cost price (× 1.05) are derived.
- **Domain Bootstrap** — automatic crawl of a seller's public surfaces (homepage, help, trust, pricing) at Seller Onboarding Stage 2 to pre-populate a KB Draft and a first-pass response before the seller takes any configuration action.
- **Dual-Console** — strict firewall between Buyer Console and Seller Console within a single Organization.
- **Dual-Track Matrix** — vertical (Org › Workspace › Use Case › Requirement) crossed by horizontal (Teams) governance.
- **EOI (Expression of Interest)** — structured vendor response to a Marketplace Listing.
- **EX (Excluded)** — per-vendor-per-requirement grade removing the requirement from that vendor's denominator.
- **Featured Placements** — paid, disclosure-labeled Marketplace surface (Category Pages, Comparison Pages, Heat Map); inventory-limited monthly/quarterly commitments; does not alter organic match scores.
- **FM / PM / DNM** — Fully Meets / Partially Meets / Does Not Meet grade rubric.
- **Forced-Vendor-Signup** — PLG mechanic in which a buyer-originated magic-link invite to a specific bid (M1/M5/M15/M17 surfaces) creates a zero-friction signup + Domain-Bootstrap + first-pass draft path for the vendor; the single highest-yield seller acquisition channel.
- **Hero Moment (Seller)** — the structurally unavoidable experience of landing on a Bid Workspace with KB proposed, response drafted, and progress strip populated before the seller touches anything; occurs in Stage 3 of Seller Onboarding.
- **KB Value Meter** — persistent product surface on the Seller KB landing screen that expresses accrued KB value in plain English (entry count, citations in closed bids, win-rate lift, estimated $/yr saved, health %); visible on Free tier; recomputed nightly with click-through explanations.
- **Marketplace Discovery Pricing (Non-AI)** — discrete revenue layer monetizing Promoted Listings, Verification Tiers (Basic/Verified/Certified), and Featured Placements; accounting-isolated from AI Wallet and subscription.
- **Outcome Accounting** — internal margin-protection model: `accepted` ops bill at value price (cost_base × 10); `rejected` ops bill at cost price (cost_base × 1.05).
- **Promoted Listings** — keyword-targeted, category-scoped Marketplace placements priced on a dual metric (impression + qualified EOI acceptance); second-price auction; frequency-capped per buyer.
- **Published-from-Day-One** — Seller Profile default state on domain verification: live at Basic tier, SEO-emitting, stake-building, single-action opt-out.
- **Pulse Health Score** — 0–100 composite of SLA Compliance (0.3), Scoring Progress (0.3), Response Rate (0.2), Phase Velocity (0.2).
- **Selection Record** — immutable Phase 13 artifact, SHA-256 hashed.
- **Seller Conversion Moments (Three)** — the three usage thresholds that gate Free → Pro conversion: second concurrent bid, first EOI attempt, KB 500-entry ceiling.
- **Sourcera Method** — the opinionated, repeatable evaluation methodology embedded in the platform.
- **Stake-Reveal Screen** — full-screen post-submit surface shown immediately after a Forced-Signup seller's first bid submission; presents published profile URL, live KB, Value Meter, citation graph, and Seller Signals opt-in.
- **The Linear Constraint** — keyboard-first, minimal-click interaction model; every major workflow completable within 5 taps on mobile.
- **Upgrade Carry-Over Guarantee** — plain-language commitment that all KB entries, confidence scores, citation history, and provenance transfer unchanged across tier upgrades; the core anti-lock-in counter-narrative that makes stake accrual credible.
- **Verification Tiers** — Basic (free, automatic on domain verification), Verified (paid, SOC 2 / ISO 27001), Certified (paid, SOC 2 Type II + quarterly re-review); match-score weight differentiation with label-only, non-scored placement effect.
- **Win/Loss Debrief** — post-close seller surface showing outcome (where disclosed), cited KB entries, confidence score deltas, and KB Value Meter movement driven by the closed bid.

---

## Appendix C — Detailed Sub-Features Not Expanded in §6

This appendix captures sub-features, protocols, schemas, and workflow state machines that exist in the source specifications but were compressed in §6. Each entry names the parent feature in §6 so the two can be read together. Source references use `MS §` (Master Spec), `PI §` (Product_Ideas), `KB §` (KB_Engineering_Spec), `UX §` (UX_Design_of_Sourcera), and `GTM §` (GTM_POSITIONING).

### C.1 — Pipeline & Workflow Depth

**C.1 — Per-Phase Gate Rules & Exit Validation.** Every phase transition is blocked until a phase-specific validation set passes (e.g., Phase 6 cannot open without a confirmed shortlist and a 7-day minimum bidding window). The rule set is fixed and non-customizable. Extends §6.2. (MS §10.1, §10.2–10.13.)

**C.2 — Phase 1 Stakeholder Alignment Mechanics.** A structured business case (problem statement, procurement type, timeline, budget band), a Discovery Document with market research attachments, and an invited stakeholder roster are required before Phase 1 exit. Extends §6.2. (MS §10.2.)

**C.3 — Phase 9 Immutable Snapshots.** On Phase 9 exit, Sourcera serializes the full Requirement + Response set to an immutable snapshot keyed by SHA-256 hash — any Phase 12+ attempt to mutate scores fails against this hash check. Extends §6.2. (MS §10.9.)

**C.4 — Bid Workspace Cancellation Protocol.** A 44-day cancellation lifecycle: days 0–14 Grace (Workspace Recovery possible), days 14–44 Processing (vendors notified, data retention configured, exports offered), day 44 terminal. Vendor notifications use a standardized template; cancellation reasons are logged to the audit trail. Extends §6.2. (MS §10.14.)

**C.5 — Vendor Voluntary Withdrawal.** Vendors can withdraw from a bid at any point during Phases 6–9; withdrawal auto-saves their in-flight responses to their KB (opt-in), notifies the buyer team, and frees the Bid Workspace. Extends §6.2, §6.14. (MS §23.4.)

**C.6 — Response Lock & Concurrency Control.** Vendor-side edits use optimistic locking with a `version` field and a server-side merge strategy; concurrent edits from multiple Contributors produce a merge-conflict UI with field-level diff. Extends §6.14. (MS §23.2.)

**C.7 — Requirement Amendment Protocol.** Between Phases 6 and 9, any requirement change triggers a formal Amendment: new version stamped, all vendors notified, prior responses flagged for re-verification, and a batch-amendment UI for bulk changes. Extends §6.2. (MS §12.7.)

**C.8 — Revert vs. Amend State Machine.** Requirements move through Draft → Approved → Released → Amended → Locked. Revert (Phases 2–5) is a regression to Draft; Amend (Phases 6–9) is a forward version bump. The state machine blocks illegal transitions and records every transition. Extends §6.2. (MS §10.1.2, §12.7.)

### C.2 — Triage, SLA & Team Governance

**C.9 — Buyer-Side Triage Queue.** Each Team (Legal, InfoSec, IT) has a queue of incoming requirements auto-mapped by domain; Team Leads approve, reassign, or decompose. Queue supports bulk actions, priority sort, and SLA-countdown indicators. Extends §6.1.3. (MS §8.3.1.)

**C.10 — Seller-Side Triage Queue & Auto-Mapping Logic.** On bid acceptance, incoming buyer requirements auto-map to the seller's internal functional teams (Product, InfoSec, Legal) via Haiku-tier semantic classification. Manual remapping is one-click and the override is retained for future auto-mapping calibration. Extends §6.14. (MS §9.2.1–9.2.3.)

**C.11 — SLA Timer Configuration, Breach, and Escalation.** Per-Team × per-Priority SLA matrix configured by Team Lead (e.g., Legal + Urgent = 24h). Breach triggers a tiered escalation: 80% warning to owner, 100% escalation to Team Lead, 125% escalation to Workspace Owner, 150% auto-reassignment. Extends §6.1.3. (MS §8.4.1–8.4.3.)

**C.12 — Agent Instruction Properties, Scope & Versioning.** Custom Agent Instructions carry `team_id`, `scope` (Team / Workspace / Org), `trigger_event`, and a markdown body. Instructions are versioned; every edit creates a new version with rollback support and audit attribution. Changes apply within 60 seconds of save. Extends §6.12.4. (MS §8.5.1–8.5.4.)

### C.3 — Scoring Depth

**C.13 — Blended Score with Scenario Overrides.** Vendor Blended Score = weighted average of Use Case Scores + TCO percentile contribution, with Scenario overlays applied post-hoc. Formula is recalculated in real time when scenario parameters change. Extends §6.3. (MS §13.7.3, §14.4.1.)

**C.14 — TCO Percentile Calculation.** Each vendor's TCO is ranked against all shortlisted vendors within the same scenario and converted to a percentile that contributes to the Blended Score at a configurable weight. Extends §6.3, §6.5. (MS §15.4.2.)

**C.15 — Rubric Configuration (Per-Org PM Tuning).** Organizations can set the PM grade value (default 0.6, allowed range 0.1–0.9) as an org-wide setting; changes apply prospectively — existing grades are not recalculated. Extends §6.3.1. (MS §13.2.2.)

**C.16 — Override Tracking Analytics.** Every accept / override / dismiss of an Agent Pre-Score is logged per-Use-Case and workspace-wide with reviewer attribution; aggregated into a per-capability calibration dashboard used by Finance (for margin) and Product (for model tuning). Extends §6.3.2. (MS §13.5.2.)

**C.17 — Auto-Scoring Rules.** Boolean requirements auto-grade (Yes = FM, No = DNM) and bypass Agent Pre-Score. Pricing requirements route to TCO calculations and never enter the grade rubric. Informational requirements (weight 0) are excluded from scoring denominators entirely. Extends §6.3. (MS §13.8.)

### C.4 — Scenario Modeling Depth

**C.18 — Scenario Comparison View.** Side-by-side comparison of up to 4 saved Scenarios (Business) or 8 (Enterprise) across vendor rankings, Use Case contribution deltas, and TCO swings. Extends §6.4. (MS §14.5.)

**C.19 — Scenario Sensitivity Analysis.** For each saved Scenario, a sensitivity view reports which weight or exclusion change would flip the top-ranked vendor ("What Would Flip" — Agent capability 13). Extends §6.4. (MS §14.5.3, §21.4.)

**C.20 — Simulation Mode.** Interactive slider-based adjustment of Use Case weights with live re-ranking visualization. Does not persist; a "Save as Scenario" action promotes the simulation to a full Scenario. Extends §6.4. (MS §14.7.)

**C.21 — Scenario Lifecycle & Immutability.** Scenarios are mutable through Phase 11 and permanently locked at Phase 12 entry along with scores. Ownership follows `created_by`; editing requires Workspace Owner or Scenario Owner. Extends §6.4. (MS §14.6.)

### C.5 — TCO Depth

**C.22 — Seat Growth Compounding Model.** TCO projections support flat, linear, step-function, and compounded-growth seat trajectories; compounding uses annualized multipliers applied to base seat count per year of the projection horizon. Extends §6.5. (MS §15.3.2.)

**C.23 — TCO Breakdown Report.** Per-vendor TCO decomposition across license, implementation, support, training, and overage lines with first-year and steady-state callouts. Embeds into the Selection Report. Extends §6.5, §6.37. (MS §15.3.4.)

**C.24 — TCO Pricing Structures.** Vendors respond to Pricing Requirements using one of six structured schemas: flat, tiered, one-time, percentage-of-license, estimate-range, discount. Each has its own form inputs and validation rules; free-text pricing is rejected. Extends §6.5. (MS §15.2.3.)

### C.6 — Organizational Intelligence Depth

**C.25 — Intelligence Cache Types & TTL.** Three cache types — Vendor Performance (7-day TTL), Efficiency Metrics (24-hour TTL), Discrepancy Analysis (real-time). Caches regenerate on dependency change and can be force-refreshed by the Workspace Owner. Extends §6.7. (MS §16.2.1.)

**C.26 — Vendor Performance Briefing.** Per-vendor cross-evaluation report: historical score distribution, Use Case specialization, scoring behavior (consistency, latency), and win/loss pattern. Extends §6.7. (MS §16.3.)

**C.27 — Efficiency Metrics Briefing.** Organization-wide and per-Team metrics: time-per-requirement, override rate, disagreement frequency, decision velocity. Extends §6.7. (MS §16.4.)

**C.28 — Discrepancy Analysis Briefing & Investigation Modal.** Detects when the same vendor scored differently on the same (or semantically equivalent) requirement across Workspaces; surfaces an Insight Card and a modal that walks through root cause (different reviewer, different PM config, evidence drift). Extends §6.7. (MS §16.5.)

**C.29 — Predictive Suggestions.** Agent-generated vendor candidate rankings, mismatch flags (vendor declared a capability but never scored it in practice), and exclusion suggestions for shortlists. Enterprise-only. Extends §6.7. (MS §16.6.)

### C.7 — Workspace Analytics (Beyond Pulse)

**C.30 — Core Analytics Metrics Suite.** Seven phase-aware metrics exposed as individual cards: Scoring Progress, Response Rate, Phase Duration, Score Distribution, Weight Coverage, SLA Compliance, Team Velocity. Each has defined phase-availability and empty-state copy. Extends §6.8. (MS §17.3.)

**C.31 — Filter Bar & Aggregation.** Workspace Analytics support filter by Team, Use Case, Vendor, and Priority, with aggregation by day / week / phase. Filter state is sharable via URL. Extends §6.8. (MS §17.4.)

**C.32 — Analytics Export & Drill-Down.** CSV / Excel export per metric; click-through drill-down from any metric card to the underlying rows (requirements, responses, or scores). Extends §6.8. (MS §17.5–17.6.)

### C.8 — Q&A Depth

**C.33 — Q&A Thread Schema & Attachment Handling.** Thread schema includes `requirement_id`, visibility, identity mask, Markdown body, attachment list, and append-only post history. Attachments: PDF / DOCX / XLSX / PNG / JPG, <10MB, virus-scanned. Extends §6.9. (MS §18.3.1, §18.5.2.)

**C.34 — Q&A Author Masking.** Buyers can optionally mask vendor identity in public threads — responses render as "Vendor A" / "Vendor B" with mask applied server-side. Mask state is set at thread creation and can only be loosened, never tightened. Extends §6.9. (MS §18.3.3.)

**C.35 — Full-Text Q&A Thread Search & Listing.** Convex full-text index across threads with filter by vendor, requirement, phase, status, and author. Results respect visibility rules. Extends §6.9. (MS §18.6.)

**C.36 — Additional Q&A Slots Request Workflow.** Enterprise Workspace Owners can grant vendors up to 10 additional questions per bid via a formal request workflow: vendor submits justification, Workspace Owner approves/rejects, audit-logged. Extends §6.9. (MS §18.7.2.)

### C.9 — Template Library Depth

**C.37 — Template Seeding at Organization Creation.** On new Org creation, Sourcera-curated templates for common categories (CRM, HRMS, ERP, Security Tools, Dev Tools) are seeded automatically. Seeded templates carry a version and update on Sourcera releases. Extends §6.10. (MS §19.2.1.)

**C.38 — Template Versioning & Update Flow.** Seeded templates can be updated by Sourcera; the Template Update Flow diffs the new version against in-use clones, surfaces the diff to Workspace Owners, and offers opt-in adoption without forcing overwrite. Extends §6.10. (MS §19.2.2, §19.4.3.)

**C.39 — Template Preview & Drill-Down.** Before cloning, users can preview the full Use Case / Requirement tree of a template and drill into individual Requirement text, weights, and response types. Extends §6.10. (MS §19.4.4.)

### C.10 — Inbox & Notifications Depth

**C.40 — Inbox Feed Schema & Item Expiry.** Feed items carry `event_type`, `entity_ref`, `priority`, `expires_at`, and a read/unread marker. Low-priority items auto-expire after 14 days; high-priority SLA items persist until resolved. Extends §6.11. (MS §20.2.)

**C.41 — Per-Event Notification Settings Matrix.** Users configure per-event-type routing (email, in-app, Slack, Teams) and cadence (real-time, digest, off) independently for each of the 40+ event types. Extends §6.29. (MS §20.6, §29.3.)

**C.42 — Full Notification Event Catalog.** 40+ catalogued events across Workspace, Requirement, Response, Score, Q&A, SLA, Phase, Marketplace, Billing, and Admin domains, each with default channel and format. Extends §6.29. (MS §29.1.)

**C.43 — Slack Integration (Channel Subscriptions, Slash Commands).** Per-workspace Slack channel binding with event filtering; `/sourcera` slash commands for quick status, assigning scores, and jumping to a Workspace. Extends §6.19, §6.29. (MS §29.4.)

**C.44 — Webhook Notifications & Event Mapping.** Full webhook event taxonomy aligned to the Notification Event Catalog; HMAC-SHA256 signed payloads, idempotency via `event_id`, retry on exponential backoff with DLQ after 5 failures. Extends §6.19. (MS §29.5, §31.1–31.3.)

**C.45 — Integration Phase Export Mapping.** At Phase 13 close, Use Cases and Requirements export to project-management tools with defined entity mappings — Jira Epics/Issues, Linear Projects/Issues, Asana Tasks, Azure DevOps Work Items. Field-level mapping is configurable in the integration setup. Extends §6.19. (MS §31.3.)

### C.11 — Seller Console Depth

**C.46 — KB-to-Capability Auto-Suggestion Surface.** The Agent monitors new KB entries and proposes Capability Declaration additions with evidence links. Seller Team Leads approve or reject in a dedicated queue. Extends §6.15.3. (MS §26.4.)

**C.47 — Vendor Response Drafting Structure & AI-Suggestion Approval.** Response structure mirrors the buyer's requirement type (Boolean, Qualitative, Evidence, Pricing, Informational). AI-suggested responses enter a dedicated Review queue with verify-before-submit gating by Team Lead. Extends §6.14. (MS §9.3.1, §9.4.)

**C.48 — Seller Analytics Surface.** Per-bid and cross-bid analytics: response completion rate, win rate, average response time, KB utilization, and capability-declaration coverage. Extends §6.14. (MS §24.5.)

**C.49 — Seller Pulse.** Seller-side mirror of buyer Pulse: four-signal health score (response completion, SLA compliance, KB coverage, Q&A responsiveness) per active bid. Extends §6.14. (MS §24.4.)

**C.50 — Bid Task & Bid Schedule Entities.** Each requirement becomes a Bid Task with owner, due date, and status (Draft → Review → Complete). Bid Schedule rolls tasks into a Gantt-style view with SLA markers. Extends §6.14. (MS §23.1, §4.4.5–4.4.6.)

**C.51 — NDA Module Lifecycle & Execution.** NDA template management, e-signature routing, expiration tracking, and scope binding (Workspace vs. Org level). NDAs must be executed before Phase 6 Q&A threads unlock for sensitive categories. Extends §6.16.3. (MS §24.2.)

### C.12 — KB Retrieval Engineering

**C.52 — KB MCP Server.** A dedicated MCP server exposes the KB to Managed Agents. Covers registration on the Agent, Vault-managed auth issued at session creation, an explicit permission policy, and the implementation requirements that every KB-reading capability must satisfy. Extends §6.13.5. (KB §3.1–3.6.)

**C.53 — KB Retrieval Pipeline.** Hybrid dense + lexical retrieval with server-side query expansion and a re-rank model. Metadata pre-filter by `seller_org_id` is enforced before vector search — not after. Stale entries are deprioritized based on the Health Model decay curve. Extends §6.13.5. (KB §4.1–4.8.)

**C.54 — KB Indexing Pipeline.** Entry lifecycle (Draft → Indexed → Active → Stale → Archived), failed-vectorization retry logic, re-indexing on entry edit, namespace migration for Seller Org splits/merges, and embedding version bumps with zero-downtime reindex. Extends §6.13.5. (KB §5.1–5.5.)

**C.55 — Managed Agent Definitions.** Five named agents: `agent_sourcera_first_pass_responder`, `agent_sourcera_kb_bootstrap`, `agent_sourcera_q_and_a_suggestion`, `agent_sourcera_kb_to_capability`, `agent_sourcera_ghost_bid_ingestion`. Each has a versioned definition, model selection, tool allowlist, and update workflow. Extends §6.12, §6.13.5–6.13.6. (KB §6.2–6.7.)

**C.56 — Custom Tool Contracts.** Two client-side tools — `emit_structured_draft` (typed response emission with citation enforcement) and `request_seller_clarification` (user-in-the-loop clarification channel). Tool design discipline requires deterministic behavior and explicit refusal semantics. Extends §6.13.5. (KB §7.1–7.3.)

**C.57 — Skills.** Four skills packaged for the RFP-response Managed Agent: `skill_sourcera_rfp_drafting` (cite-before-state rule, low-confidence handling, conflict resolution, tone, compliance framework handling, attachments), `skill_sourcera_confidence_thresholds`, `skill_sourcera_compliance_citations`, `skill_sourcera_kb_extraction` (bootstrap-only). Extends §6.12, §6.13.5. (KB §8.2–8.6.)

**C.58 — Environments.** Two runtime environments: `env_sourcera_kb_runner` (production retrieval + drafting) and `env_sourcera_bootstrap` (bulk first-crawl KB seeding). Environments isolate tool access, rate limits, and logging scope. Extends §6.13.5. (KB §9.1–9.2.)

**C.59 — Beta Header & Version Pinning.** Managed Agent calls pin a specific agent + skill version via a beta header, preventing silent behavior drift across deployments. Extends §6.13.5. (KB §2.4.)

### C.13 — Marketplace Depth

**C.60 — Marketplace Tags & Controlled Vocabulary.** The category / capability taxonomy is maintained in the Ops Console CMS. Sellers cannot author freeform tags; Capability Declarations and Marketplace filters reference this controlled vocabulary. Extends §6.16. (MS §27.6.)

**C.61 — Match Score Internals.** Input features include Capability Declaration overlap, verification tier, KB freshness, historical response quality, and category fit. Ranking model is retrained on a rolling window. Numeric scores gate behind the paid Match Scoring capability; free viewers see qualitative labels. Extends §6.16.4. (MS §27.4.)

**C.62 — EOI Workflow Fields & Acceptance Flow.** EOIs carry a short pitch, referenced Capability Declarations, linked Seller Profile, and optional files. Buyers review in a dedicated EOI queue and can accept a seller directly into the Phase 4–5 vendor shortlist with one click. Extends §6.16.2. (MS §27.5.)

### C.14 — Expanded Growth Mechanics (M5–M16)

**C.63 — M5 Buyer-Pull Vendor Invite.** Anti-abuse throttling (20/user/month, 5/target-domain/30d), shared-use-domain exclusion list, DMARC/SPF reputation check, anonymized outbound email, attribution-on-seller-signup flow. Extends §3.3. (PI §13.3 M5.)

**C.64 — M6 Domain-Based Auto-Join.** Employees at verified corporate domains auto-join as pending-approval members; Ops maintains a `shared_use_domain_list` that disables auto-join for consulting firms and hosts. Reversible via Org Owner within 30 days. Extends §3.3. (PI §13.3 M6.)

**C.65 — M7 Suggested Team Discovery.** Users see "your colleagues are on Sourcera" cards with k-anonymity floor and per-user opt-out. Cross-team invite flow preserves firewall and audit. Extends §3.3. (PI §13.3 M7.)

**C.66 — M8 Org Intelligence Value Curve.** Visible in-app curve showing the compounding analytical value of each additional evaluation within an Org, with concrete time-saved estimates. Extends §3.3. (PI §13.3 M8.)

**C.67 — M9 Per-Category Marketplace Landing Pages.** AI-generated, editorially-reviewed category pages (e.g., "Best HRMS for Mid-Market") with FAQ sections, vendor lists, and structured data for SEO. k-anonymity floor (k=5). Extends §3.3, §6.16.5. (PI §13.3 M9.)

**C.68 — M10 "How to Evaluate [X]" Guides.** Long-form category-specific buying guides, draft-generated and refreshed on a defined cadence via the `guide_draft_generation` and `guide_refresh_analysis` capabilities. Sourcera-owned AI ops, not billed to customer. Extends §3.3, §6.16.5. (PI §13.3 M10.)

**C.69 — M11 Software Comparison Pages.** AI-generated side-by-side software comparison pages, continuously refreshed. Vendor opt-out honored globally. Extends §3.3, §6.16.5. (PI §13.3 M11.)

**C.70 — M12 Aggregate Market Intelligence Reports.** Quarterly k-anonymized reports on category demand, pricing bands, and vendor performance trends. k=20 floor. Editorial review by Marketing + Finance. Extends §3.3, §6.16.5. (PI §13.3 M12.)

**C.71 — M13 Public Marketplace Heat Map.** Category-level demand visualization aggregated from anonymized buyer signals with k=10 floor. Extends §3.3. (PI §13.3 M13.)

**C.72 — M14 Seller Bid Success Share.** One-click social post generated on bid win; buyer name anonymized via validator; seller retains authorship. Extends §3.3. (PI §13.3 M14.)

**C.73 — M15 Ghost-Bid Importer.** Sellers paste or upload historical RFPs to seed their KB via the `ghost_rfp_ingestion` capability. First import free per Seller Org. Extends §3.3, §6.13.6. (PI §13.3 M15.)

**C.74 — M16 Buyer Referral Credit.** Structured referral flow with credit reconciliation, same-domain self-referral blocks, payment-method overlap detection, and minimum-activity gating before credit issuance. Extends §3.3. (PI §13.3 M16.)

### C.15 — Pricing & Billing Depth

**C.75 — AIOperation Primitive Schema.** Every AI invocation produces an immutable `AIOperation` record with provenance hash, parent_operation_id (for Managed Agent subcalls), settlement state machine, and FX rate locking. Single billing unit across the platform. Extends §2. (PI §1.2.)

**C.76 — Capability Registry.** Authoritative, Ops-Console-managed list of billable capabilities, keyed by `capability_id`. Supersedes the hardcoded "21 capabilities" reference. New capabilities are appended; deprecations are soft. Extends §6.12. (PI §1.3a.)

**C.77 — Cost-Base Recalculation Job.** Nightly job re-derives per-capability `cost_base` from actual Anthropic billing + Convex compute allocation. Drift >10% triggers a Finance alert; margin floor enforced at price-update time with explicit override audit. Extends §2. (PI §1.3.)

**C.78 — Outcome Contest Window.** Billing Admin can contest any accepted or auto-accepted operation within 14 days of settlement. Contests route to Ops Finance; approved contests credit the Org's cap balance. Extends §2. (PI §1.4.)

**C.79 — Auto Top-Up Mechanics.** Optional cap auto-raise at 90% utilization by a configured increment, up to a monthly maximum. Min increment $50, max single top-up $10K. Failed payment triggers a 48-hour grace before cap enforcement resumes, with hourly alerts to Billing Admins. Extends §2. (PI §1.5.)

**C.80 — Free Allowance Per-Capability.** Every customer-billed capability grants 10 free operations on signup as a PLG lever. Exhaustion surfaces an inline upgrade CTA with the ROI of the operations already run. Extends §2, §3. (PI §1.6.)

**C.81 — Committed Spend.** Enterprise customers commit annual AI value-dollar spend with volume discount bands: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+. Replaces the static Enterprise tier's token budget. Extends §2. (PI §1.7.)

**C.82 — Billing Ledger & Transparency Surface.** Per-Org ledger showing every `AIOperation` with capability, user, timestamp, settlement state, and billed amount. Exportable as CSV. SOC-2-grade audit trail for billing events. Extends §2. (PI §1.8.)

**C.83 — Public Pricing API.** Machine-readable rate card published at `api.sourcera.com/v1/pricing`, updated on every price-table change. Customers can forecast spend programmatically. Extends §2, §6.20. (PI §1.9.)

**C.84 — Multi-Currency & Residency-Locked Invoicing.** Invoices issue in the Org's billing currency; FX rate locked at settlement time. Data-residency region constrains which legal entity invoices (Sourcera US vs. EU). Extends §2. (PI §1.10.)

**C.85 — Downgrade Excess Data Handling.** Plan downgrades preserve excess data in read-only mode for 90 days before archival; customers can upgrade back and restore active access without data loss. Extends §2. (MS §34.6.)

**C.86 — Billing Seat Count Logic.** Even though Sourcera does not charge per-seat, the billing layer counts active seats for reporting and plan-gate enforcement (Free 10 members, Business 100, Enterprise unlimited). Guests and API-only identities are excluded. Extends §2. (MS §34.7.)

**C.87 — Entitlement Enforcement.** Two modes: soft (feature visible, upgrade CTA on use) and hard (feature hidden or API call rejected). Per-capability enforcement mode is configured in the entitlement matrix. Extends §2. (MS §34.8.)

### C.16 — Usage Analytics & PLG Instrumentation

**C.88 — Usage Analytics Event Taxonomy.** Unified buyer + seller event schema across Workspace, Requirement, Score, Q&A, Marketplace, KB, and Billing domains. PostHog-backed. Extends §6.36. (PI §2.2.)

**C.89 — Event Properties Standardized Schema.** Every event carries a standard property set (org_id, console, workspace_id, user_id, phase, entity_ref, capability_id where applicable) to guarantee joinability across dashboards. Extends §6.36. (PI §2.3.)

**C.90 — User Usage Dashboard.** Per-user surface showing individual AI spend, accept/reject rate, capability mix, and personal productivity. Distinct from the Org-level dashboard. Extends §6.36. (PI §2.5.)

**C.91 — Time-Saved Baseline Model.** Converts events into labor-hours-saved estimates using capability-specific conversion factors (e.g., Pre-Scoring accept = 8 minutes saved). Surfaced inline to PLG and in the Org Dashboard. Extends §6.36. (PI §2.6.)

**C.92 — Seller Usage Parity.** Seller-side usage dashboards mirror buyer structure: per-bid spend, capability mix, KB utilization, win rate correlation. Extends §6.36. (PI §2.8.)

### C.17 — Ops Console Depth

**C.93 — Ops Console Separation Architecture.** Ops Console is a separate app with its own auth and audit boundary; all mutations flow through the same APIs customers use, tagged with an Ops actor. No direct database access. Extends §6.35. (PI §12.2.)

**C.94 — Ops Role Matrix.** Six Ops roles: Ops Admin, Pricing Admin, Template Reviewer, Support Agent, Fraud Analyst, Finance. Each with scoped permissions; role changes are audit-logged and require Ops Admin approval. Extends §6.35. (PI §12.4.)

**C.95 — Taxonomy CMS.** Ops-authored category and Capability-Declaration taxonomy used across Marketplace, Seller Profiles, and Marketplace Listings. Versioned; deprecations cascade with migration tooling. Extends §6.35. (PI §12.5.)

**C.96 — Seller Template Review Rubric.** Structured rubric (schema validity, anti-spam, category fit, quality signals) applied by Template Reviewers before a seller template is published to the Marketplace. Extends §6.35. (PI §12.6.)

**C.97 — Baseline Assumption Manager.** Ops surface for editing the conversion factors used by the Time-Saved Baseline Model and similar heuristics. Changes are version-tracked. Extends §6.35, §6.36. (PI §12.7.)

**C.98 — Impersonation Audit Requirements.** Ops impersonation requires written justification, is time-boxed (default 30 minutes), is fully audited, and triggers a customer-Org notification to Org Owners on session start and end. Extends §6.35. (PI §12.8.)

**C.99 — Internal Analytics Dashboards by Role.** Role-specific dashboards — Growth PM (funnel, activation), GTM Lead (conversion), Finance (margin, contest rate), Fraud Analyst (signal anomalies), Support (ticket context). Extends §6.35. (PI §12.9.)

**C.100 — Signal Integrity Monitor.** Dedicated Ops surface for detecting anomalous query patterns, referral velocity spikes, suspicious uploads, and email sender-reputation drift. Emits alerts + one-click kill-switch on any growth mechanic. Extends §6.35. (PI §13.5, §13.6.)

### C.18 — Identity & Security Depth

**C.101 — Guest Scope Isolation Enforcement.** Guest Permission Profiles (`read_only`, `contributor`, `scorer`, `full_participant`) are enforced at the API layer via `assigned_use_case_ids` scoping; UI hides out-of-scope entities. Extends §6.22.2. (MS §5.4.5.)

**C.102 — WorkOS Configuration.** WorkOS handles email/password, Google OIDC, Microsoft OIDC, and SAML SSO. Idp-initiated SSO supported; JIT user provisioning configurable per-Org. Extends §6.23.1. (MS §6.1.1.)

**C.103 — Session Management.** Session duration 24 hours default, configurable by Enterprise to 1–72 hours. Idle timeout 30 minutes default. Concurrent session cap 5 per user; exceeding evicts oldest. Extends §6.23. (MS §6.3.1.)

**C.104 — Domain Claiming & Verification.** Org Owner claims a corporate domain via DNS TXT record verification. Verified domains block unsanctioned Org creation and enable Domain-Based Auto-Join (M6). Extends §6.23.3. (MS §6.4.1.)

**C.105 — API Token Lifecycle.** Token format `srck_{org_prefix}_{token_string}`, dynamic permissions (mirror real-time RBAC), fine-grained scopes. Enterprise enforces 90-day rotation via scheduled reminder + automated regeneration flow. Extends §6.20. (MS §6.6.4.)

### C.19 — API Depth

**C.106 — Full API Endpoint Catalog.** CRUD endpoints across Workspaces, Requirements, Use Cases, Responses, Scores, Vendors, Scenarios, Selection Reports, Traceability Matrices, Intelligence, Capability Declarations, Internal Comments, Audit Events, Users, and Organization. Extends §6.20. (MS §32.5.)

**C.107 — API Error Handling Schema.** Standardized error object with `code`, `message`, `field` (where applicable), `request_id`, and `docs_url`. Canonical error-code catalog covers auth, validation, rate-limit, entitlement, and conflict failures. Extends §6.20. (MS §32.6.)

**C.108 — Rate Limit Headers & 429 Enforcement.** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers on every response. 429 returns a `Retry-After` header with recommended backoff. Extends §6.20. (MS §32.4.)

### C.20 — UX & Design System Depth

**C.109 — Form & Input Tokens.** Unified token system for input heights, padding, border states, focus rings, error/success tints, and label spacing. Extends §5. (UX §2.9.)

**C.110 — Loading / Empty / Error State Catalog.** Per-page-type catalog of the three states with copy guidelines, illustration usage, and recovery CTAs. Loading uses content-shaped skeletons; empty states include the next-best-action; errors name the failure, reason, and recovery. Extends §5. (UX §9.)

**C.111 — Side Peek Dimensions & Behavior.** 480px default width, resizable 360–640px, opens on `Enter` or row click, closes on `Escape`. Cmd+[ / Cmd+] navigates prev/next entity without closing. Extends §5. (UX §1.3, §3.)

**C.112 — Cursor Presence Visualization.** Up to 8 teammate cursors rendered with distinct hues assigned per session. Cursors idle-fade at 10 seconds. Viewport indicator shows off-screen teammate activity. Extends §5. (UX §2.2, §6.)

**C.113 — Bulk Action Toolbar & Selection Scope.** `Shift+Click` range select, `Cmd+A` select all within current filter. Action toolbar appears at the top of the table with bulk assign, delete, status change, and export. Selection persists across pagination. Extends §5. (UX §1.3, §3.)

**C.114 — Mobile Responsive Breakpoints & Gesture Equivalents.** Breakpoints at 640 / 768 / 1024 / 1280 px. Keyboard patterns translate to gesture equivalents: `J`/`K` → swipe-up/swipe-down, `Cmd+K` → bottom-sheet palette, Side Peek → full-screen modal. 5-tap ceiling preserved. Extends §5. (UX §1.2, §3.)

**C.115 — Dark Mode Parity Rules.** Luminance inversion with preserved semantic color meaning. Agent, success, warning, danger, exception tokens re-tuned for contrast ratio ≥4.5:1 in both modes. User-override toggle in Settings. Extends §5. (UX §2.2.)

### C.21 — Cross-Console Mechanics

**C.116 — Console Bridge (Data Flow).** Structured data flow between a Buyer Workspace and the linked Seller Bid Workspaces. Buyer-side Requirement changes push through a bridge adapter that materializes them in each Bid Workspace without breaching the firewall. Extends §6.1.1. (MS §25.1.)

**C.117 — Cross-Console Sync Behavior & Retry.** Bridge syncs are eventually consistent with bounded lag (<30s SLO). Retry on failure uses exponential backoff; persistent failures surface in both Buyer and Seller operational dashboards. Extends §6.1.1. (MS §25.2.)

**C.118 — Vendor Disqualification Workflow.** Buyer Workspace Owner can disqualify a vendor mid-evaluation; triggers vendor notification, freezes their Bid Workspace (read-only), and records disqualification reason in the audit trail. Extends §6.1.1. (MS §25.3.)

### C.22 — Internal & Miscellaneous

**C.119 — Internal Comments.** Private comment threads on Workspaces, Use Cases, and Requirements visible only to buyer-side members (never vendors). Business: 500/workspace cap. Enterprise: unlimited. Extends §6.11. (MS §4.3, §29.)

**C.120 — Presence & Unread Tracking.** Convex Presence drives live cursor indicators; Convex Unread Tracking drives per-thread unread counts across Comments, Q&A, and Inbox. Extends §6.11, §5. (MS §1.5.)

**C.121 — Buyer Onboarding 7-Step Flow.** Sign Up → Organization Setup (domain suggestion) → Team Setup → First Use Case → First Requirement → Optional TCO Setup → Dashboard Tour. Target 60 seconds to first evaluation. Extends §6.28. (MS §35.1.)

**C.122 — Accessibility & Internationalization.** WCAG 2.1 AA baseline, RTL language support, timezone-aware timestamps, locale-aware currency and number formatting, full keyboard navigation, screen-reader attribution on Agent-generated content. Localization is roadmap-staged; English is GA. Extends §5, §6.31. (MS §37.)

**C.123 — Vendor Opt-Out Global Registry.** Seller-configured global opt-out flags suppress their name in Public Selection Reports (M2), Comparison Pages (M11), and all public-facing mechanics. Retroactive and honored across all Orgs. Extends §3.3, §6.16.5. (PI §13.5.)

### C.23 — GTM Positioning Content

**C.124 — Buyer Personas.** Five detailed personas: (1) Evaluation Lead (primary champion), (2) VP/Director of Procurement, (3) CISO / VP InfoSec, (4) CFO / VP Finance, (5) Internal Champion (the Finder). Each with titles, KPIs, pains, Sourcera-solves, objections/rebuttals, online behavior, and a stop-scrolling message. Extends §1. (GTM §2.)

**C.125 — Messaging Playbook.** Homepage H1/H2/CTA, five buyer-side and five seller-side cold-email subject lines, 30-second voicemail script, conference/event intro script, Founder LinkedIn headline + bio, Twitter/X bio, one-paragraph product description for directories. Extends §1. (GTM §6.)

**C.126 — Pricing Objection Handlers.** Verbatim rebuttals for the three highest-frequency objections: "$499/month is expensive," "we already have Coupa/Ivalua," "can we just use the Free tier?" Extends §2. (GTM §7.)

**C.127 — Category Definition Narrative Arc.** Problem → Failed Solutions → New Category (Software Evaluation Platform) → Sourcera. Used for investor decks, analyst briefings, and foundational press. Extends §1. (GTM §5.)

### C.12 Seller-Side Pricing, PLG & Onboarding (from Seller Pricing Strategy)

**C.128 — Seller Core Principle (AI-as-Outcome, Platform-as-Stake).** The seller pricing thesis: the platform is unlimited-seat and nearly free, the AI is metered and outcome-settled, and the stake is the KB. Revenue comes from AI consumption on successful outcomes (cost_base × 10 value price when the seller accepts the draft; cost_base × 1.05 cost price when the seller rejects) plus a Marketplace Discovery layer and a thin subscription baseline. Lock-in is explicitly rejected as the stake-building mechanism; compounding utility is. Extends §2.1, §2.2, §3.1b. (Seller Pricing §1, §2, §9.)

**C.129 — Seller Rate Card Extended.** Full published rate card mapping each seller-facing capability (`kb_bootstrap`, `first_pass_response`, `q_and_a_suggestion`, `ghost_rfp_ingestion`, `page_enrichment`, `kb_to_capability_suggestion`, `verification_review`, `match_score_numeric`, `firecrawl_crawl_dedupe`, `kb_staleness_classifier`, `capability_declaration_suggest`, `bid_task_assignment_suggest`, `document_attach_suggest`) to cost_base values at three scale tiers (Haiku / Sonnet / Opus). Value price = cost_base × 10; cost price = cost_base × 1.05. Rate card is versioned; changes require Capability Registry change-management with a 30-day customer notice for price increases. Published at `api.sourcera.com/v1/pricing`. Extends §2.3, §2.8. (Seller Pricing §9.)

**C.130 — Seller Outcome Signals.** Every seller-side AI Operation resolves to `accepted` or `rejected` on a capability-specific signal with published capture windows: First-Pass RFP Draft (≥50% retained in submitted bid, 14d or on-submit); Q&A Suggestion (≤30% edit on send, 7d); KB-to-Capability Suggestion (declaration published, 14d); KB Bootstrap (≥60% of proposed entries approved, 30d); Ghost-RFP Ingestion (resulting entries cited in a future bid, 90d); Firecrawl Crawl + Dedupe (new entry approved or correct dedupe, 7d); KB Staleness Classifier (flagged entry re-verified or archived, 14d); Seller Page Enrichment (generated content published, 14d); Capability Declaration Suggest (declaration published, 7d); Match Score numeric (EOI submitted after viewing, 14d); Bid Task Assignment Suggest (task assigned as suggested, 24h); Document Attach Suggest (document attached, 24h). Default on timeout: `rejected`. Extends §2.5, §2.9. (Seller Pricing §10.)

**C.131 — Marketplace Discovery Pricing (Non-AI Layer).** Three SKUs — Promoted Listings (included allotment on Seller Scale/Enterprise; $500/category/week top-up on Scale+ only; 4-add-on/month hard cap; category-capped at 3 promoted per category; second-price-auction clearing; frequency-capped per buyer per category per 7-day window; k=5 anonymization on attribution), Verification Tiers (Basic free on domain verification; Verified earned-free at Starter+ with SOC 2 or ISO 27001 review; Certified earned-free at Growth+ with Verified + ≥3 closed bids with buyer confirmation — Ops-review cost absorbed in plan, sellers never pay Sourcera for a tier badge), and Featured Placements (strictly editorial; not purchasable; chosen by Marketing on verification tier + category relevance + KB health + buyer engagement). Accounting-isolated cost center `rev_marketplace_discovery`. Buyer-experience guardrails enforce organic-only Match Scoring and visual separation of paid lanes. Extends §2.10, §6.16.6. (Seller Pricing §12.)

**C.132 — Seller Hero Moment (Mechanics).** The Hero Moment is the coordinated product surface that puts a KB Draft + first-pass response + progress strip in front of the seller before the seller touches anything. Pre-arrival preparation: domain hint extraction from the invite email, Marketplace Tagger category inference, Firecrawl rate-limit pre-warm, `kb_bootstrap` queue pre-resolution. In-SSO-redirect execution: Domain Bootstrap crawl (30–90s, lifetime-free allowance), KB Propose (40–200 draft entries with confidence + provenance), First-Pass Draft (every requirement in the buyer's evaluation with cite-before-state grounding), Landing Screen (*"Your bid for [Buyer Company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website."*). Stage-3 population latency target: <10s p90 from SSO completion. Narrated onboarding progress lines must be literally true. Extends §3.1b, §3.6, §6.28.2. (Seller Pricing §14, §15.)

**C.133 — Three Conversion Moments.** The three usage thresholds that trigger Free → Seller Starter upgrade prompts: (a) **second concurrent bid** — vendor receives a second buyer invite while first still in flight (urgency — *"my deal is at risk"*); (b) **first EOI attempt** — vendor clicks "Submit EOI" on a Marketplace listing (ambition — *"I want to find more deals"*); (c) **KB ceiling** — vendor approaches the 50-entry Free cap after 2–4 bids (investment — *"I don't want to lose what I've built"*). Each moment surfaces a contextual upgrade screen showing only what the upgrade unlocks against observed usage, with the Upgrade Carry-Over Guarantee as dominant message. Trailing-90-day conversion target ≥18%. Product must catch all three; pricing does not optimize any single one. Extends §3.1b, §6.28.2. (Seller Pricing §14.)

**C.134 — Seller Paid-Path Progression (Free → Starter → Growth → Scale → Enterprise).** The seller's upgrade journey and the usage signals driving each transition: Starter from the three conversion moments (C.133); Growth from bid/EOI volume, KB >1,000 entries, CRM Sync request, numeric Match Score request, budget utilization ≥80% for 2 consecutive months; Scale from unlimited concurrent bids, Certified verification eligibility, Firecrawl real-time, Promoted Listings inventory, multi-SellerSoftware portfolio needs; Enterprise from SSO / DPA / ≥$12K AI commit / custom RevOps integration. Each transition preserves the KB, in-flight bids, Capability Declarations, and Firecrawl configs per the Upgrade Carry-Over Guarantee (C.139). Downgrade preserves data in read-only state for 90 days before archival. Extends §2.4, §2.6, §3.1b. (Seller Pricing §3, §14.)

**C.135 — Seller Activation Metric.** The singular seller-side activation metric: *minutes from magic-link click to first submitted requirement response*. Targets: p50 < 20 min, p90 < 60 min. Every product decision on the seller onboarding surface is evaluated against this metric. Secondary metrics (all dashboarded daily in Seller Activation): Stage-3 population latency (target <10s p90), KB-Bootstrap acceptance rate (target ≥40 approved entries on hero path), dwell time on Stake-Reveal Screen (target >20s for 70% of activated sellers), days to first submitted bid on Free, 90-day return rate, second-invitation arrival rate on the Free cohort (directly predicts Conversion Moment #1), Rejected-op rate for First-Pass Responder (quality signal — target <30%). Extends §3.1b, §6.28.2. (Seller Pricing §14, §16.)

**C.136 — Forced-Vendor-Signup Playbook.** The end-to-end mechanic that makes Forced-Signup the highest-yield seller acquisition channel. Origination surfaces: M1 Vendor-Invite-Creates-Account, M5 Buyer-Pull Vendor Invite, M15 Ghost-Bid Importer, M17 Buyer-Funded Pro Trial Seat. Magic-link structure: pre-bound `bid_id` + `invite_signature` + `seller_domain_hint`. Unauthenticated landing page rendering an RFP summary preview plus a single primary CTA (*"Accept this bid and draft your response in 3 minutes"*). Zero form fields; no credit card; SSO or magic-link only. Parallel Domain Bootstrap runs during the SSO redirect. Hero Moment fires at Stage 3 (C.132). Expected funnel: ≥90% of arrivals reach CTA → 60–70% complete signup → 80% edit during review → 55%+ submit first bid. Extends §3.1b, §3.6, §6.28.2. (Seller Pricing §14, §15.)

**C.137 — Win/Loss Debrief as Upgrade Trigger.** Post-close seller surface (email + in-app) rendered on every bid close: win/loss status where disclosed by buyer, cited KB entries with per-entry confidence deltas driven by the outcome, KB Value Meter movement (Δ since this bid opened), a compact retrospective (*"what the citation graph learned"*), and an opt-in to share anonymized outcome back to Seller Signals (§6.17). On win: *"24 KB entries cited on winning responses; those entries are now higher-weighted. Upgrade to Starter for weekly crawls and auto-staleness checks to keep them alive."* On loss: *"Gap analysis identified 4 requirements where your KB had no strong answer. Upgrade to Starter so Sourcera crawls your docs weekly and fills gaps automatically."* Win reinforces value; loss creates a concrete upgrade reason tied to a specific identified gap. Second deliberate stake-reveal moment after the post-submit Stake-Reveal Screen. Extends §3.1b, §6.16.4, §6.28.2. (Seller Pricing §13, §17.)

**C.138 — Seller-Side Network Effects Inventory.** The seven compounding loops driving seller-side flywheel growth — all operate regardless of plan tier, so free sellers contribute to every loop: (1) Invited-Vendor → Published-Profile → Marketplace-Ready Inventory (every invited vendor lands with bootstrapped KB + published profile + SellerSoftware + up to 3 Capability Declarations, all free); (2) KB → Capability Declaration → Match Score → EOI → Revenue (free vendor work compounds into SEO real estate); (3) Bid-Close → Win/Loss Signal → Platform Learning (per-entry confidence weighting + Match Score calibration + M12 content + Seller Signal quality — ≈2,400 calibration events/yr across 200 active vendors); (4) Seller-Profile SEO Loop (Schema.org structured data → inbound buyer signups → per-category SEO moat vs. Gartner/G2); (5) Ghost-Bid Import Loop M15 (first import free per Seller Org; catapults vendors with RFP history over the KB-accumulation barrier); (6) Buyer-Funded Pro Trial Loop M17 (Scale/Enterprise buyer gifts 30-day Seller Starter trial; trial-converted sellers skip Free entirely with materially higher Starter conversion); (7) Template Publish Incentive (sellers who publish non-confidential response templates earn featured Marketplace placements). Each loop has named instrumentation and measurable cadence. Extends §3.4. (Seller Pricing §18.)

**C.139 — Seller Plan Upgrade Carry-Over Guarantee.** Plain-language commitment surfaced at every upgrade screen and in the public pricing page: all KB entries, confidence scores, citation history, staleness state, win-rate weights, provenance records, in-flight bids, Firecrawl source configurations, and Capability Declarations transfer unchanged across Free → Starter → Growth → Scale → Enterprise. No re-indexing penalty, no re-bootstrap, no entitlement-gated fidelity loss. Downgrade preserves the KB in read-only state for 90 days before archival (aligned with §2.6). The Guarantee is the anti-lock-in counter-narrative that makes in-platform stake accrual credible — paired with Honest Portability (§6.13.7) it converts "lock-in resistance" into "compounding preference." Extends §2.6, §6.13.7. (Seller Pricing §17.)

**C.140 — Seller Onboarding Required Capabilities.** The capabilities that must fire successfully during Seller Onboarding to achieve the Hero Moment: `kb_bootstrap` (Opus; first bootstrap lifetime-free per Seller Org), `first_pass_response` (Sonnet/Opus; cite-before-state grounding enforced), `q_and_a_suggestion` (Sonnet; on-demand for missing requirements at Stage 4), `page_enrichment` (Opus; profile enrichment at publication). Graceful degradation: if `first_pass_response` fails, onboarding falls back to KB-Draft-only presentation with an explicit "response drafting unavailable — retry" CTA — never a silent empty state. Capability availability is a P0 dependency for Seller Activation SLA. Extends §6.13.6, §6.28.2. (Seller Pricing §16.)

**C.141 — Seller Onboarding Anti-Patterns (Banned).** Explicit list of deprecated behaviors, enforced by design review: require credit card at any point before first upgrade-intent click; require team-invite before first bid submission; require manual Capability-Declaration authoring on the onboarding path; require company/industry description before bootstrap runs; gate any feature behind a "try Pro free for 14 days" modal on first login (the Hero Moment is the pitch); show a pricing page before the vendor submits their first bid; block Bid Workspace surfaces with a tour modal; require manual profile-publish confirmation (publication is default on domain verification); require workspace naming; use dark patterns on upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency); present the upgrade offer during active bid work. Deviations require formal Ops Council review and written exception. Extends §3.6, §6.28.2. (Seller Pricing §16.)

---

*End of Master Summary.*
