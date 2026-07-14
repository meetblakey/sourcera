# Sourcera GTM Playbook — Execution Prompts (v2)

**Purpose:** Eight prompts executed sequentially in separate Cowork sessions. Each produces a concrete GTM deliverable. Together they form a complete solo-operator go-to-market system for Sourcera.

**What changed in v2:** Pricing model is now outcome-based AI consumption with 5 buyer tiers + 5 seller tiers. Seller-side is a fully monetized track. 17 growth mechanics (M1-M17), 10 core growth loops, and seller Hero Moment are all specified in the source docs. The GTM strategy must address BOTH sides of the marketplace.

**Prerequisites:**
- Update your Sourcera project instructions with GTM_PROJECT_INSTRUCTIONS.md (v2)
- Sourcera workspace folder selected in each session
- For Prompt 7 (Pitch Deck): pptx skill available

**Primary source documents (every prompt reads from these):**
- `Sourcera_Master_Summary.md` — the compressed full product reference (~1,700 lines)
- `Sourcera_Buyer_Pricing_Strategy.md` — full buyer pricing model
- `Sourcera_Seller_Pricing_Strategy.md` — full seller pricing model

**Total estimated execution time:** 14–20 hours across 8 sessions

---

## How to Use This Document

1. Copy GTM_PROJECT_INSTRUCTIONS.md (v2) into your Cowork project settings
2. Open a NEW Cowork session for each prompt
3. Select the Sourcera folder as your workspace
4. Copy-paste ONE prompt per session
5. Each prompt produces a file deliverable — wait for it before starting the next
6. Prompts 1–3 are sequential. Prompts 4–6 can run in parallel after Prompt 3. Prompt 7 requires 1+3. Prompt 8 requires all.

```
Dependency Graph:

[1: Positioning] → [2: PLG Architecture] → [3: Sales Playbook]
                                                    ↓
                                         ┌──────────┼──────────┐
                                         ↓          ↓          ↓
                                   [4: Content] [5: Network] [6: Growth]
                                         ↓          ↓          ↓
                                         └──────────┼──────────┘
                                                    ↓
                              [1+3] → [7: Pitch Deck]
                                                    ↓
                                         [8: 90-Day Sprint]
```

---

## PROMPT 1: Strategic Foundation — Positioning, ICP, & Messaging Architecture

**Produces:** `GTM_POSITIONING.md`
**Estimated time:** 2–3 hours
**Must complete before:** Everything else

```
<role>
You are a B2B SaaS positioning strategist working with a solo founder who has built Sourcera — a two-sided enterprise software procurement platform with a Vendor Discovery Marketplace, outcome-based AI pricing, and a fully monetized seller track. Your job is to create the strategic messaging foundation that every downstream GTM activity will reference. You are not writing marketing copy yet. You are defining WHO we sell to (both sides), WHY they buy, HOW we're different, and WHAT we say.
</role>

<context_loading>
Read these files completely before producing any output:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Read ALL sections. You need: §1 (positioning, ICP, category), §2 (full pricing architecture for both sides), §3 (PLG motion, growth loops, network effects, hero moment, conversion moments, seller activation), and §6 (all features). This is ~1,700 lines — read it all.
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Buyer_Pricing_Strategy.md — Read for: exact tier pricing, AI budget amounts, conversion triggers, competitive anchors, financial scenarios, pricing philosophy.
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Seller_Pricing_Strategy.md — Read for: seller tier pricing, forced-signup mechanics, hero moment details, three conversion moments, KB value capture, seller competitive anchors, seller financial scenarios.
</context_loading>

<deliverable>
Produce a single comprehensive document saved to /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md with the following sections. Every element must be derived from what Sourcera actually does as specified in the source docs. Do NOT use generic B2B frameworks.

SECTION 1: IDEAL CUSTOMER PROFILE (ICP)
The Master Summary §1 already defines Primary ICP (buyers), Secondary ICP (sellers), and Wedge ICP. Your job is to go DEEPER on each:

For BUYER ICP:
- Segment by company size, industry, procurement maturity, annual software spend
- The trigger events that create buying urgency (audit findings, compliance mandates, failed evaluations, new CTO, digital transformation, upcoming major purchase)
- Current tooling being replaced (spreadsheets, Coupa, Ivalua, Jaggaer, SharePoint)
- Internal team structure for software purchases
- Disqualification criteria (who is NOT your customer)
- Which buyer tier they enter at (Free vs. Starter vs. Growth) and why

For SELLER ICP:
- Segment by RFP volume, team size, existing tooling (Responsive, Loopio, manual)
- The trigger events (losing an RFP, scaling bid team, entering new market, receiving a Sourcera buyer invite)
- The "forced signup" path vs. the "organic signup" path — different ICPs
- Which seller tier they enter at and why
- Disqualification criteria

For MARKETPLACE ICP:
- Which software categories to seed first for maximum cross-pollination
- Geographic and industry considerations

SECTION 2: BUYER PERSONAS (BUYING personas, not user personas)
For each person in the BUYER purchase decision:
- Title, reporting line, KPIs, career risks
- Their current pain with software procurement
- What Sourcera specifically solves for THEM (map to actual features from §6)
- Their objections and specific, non-generic rebuttals
- Where they spend time online
- The message that would make them stop scrolling

Include: VP/Director of Procurement, VP/Director of IT, CISO/InfoSec Lead, CFO/Finance, and the internal champion.

SECTION 3: SELLER PERSONAS
For each person in the SELLER adoption decision:
- Title, context, pain points
- Current workflow being replaced
- What Sourcera specifically solves (KB automation, first-pass drafting, Marketplace discovery, CRM Sync)
- Their objections (especially: "we already use Responsive/Loopio", "we don't need another tool", "AI will hallucinate in our RFP responses")
- The message for forced-signup sellers (arrived via buyer invite) vs. organic sellers

Include: VP Sales/Partnerships, Sales Engineer/Pre-Sales, RFP Manager, Head of Product Marketing.

SECTION 4: COMPETITIVE POSITIONING MATRIX
Build a detailed framework for BOTH sides:

Buyer-side competitors:
- Direct: Coupa, Ivalua, Jaggaer (procurement suites)
- Adjacent: no direct competitor in "Software Evaluation Platform" category
- The real competitor: spreadsheets + email + SharePoint
- For each: strengths, weaknesses vs. Sourcera, repositioning statement

Seller-side competitors:
- Direct: Responsive/RFPIO (~$7-15K/yr), Loopio (~$15-35K/yr)
- Adjacent: G2 (review platform), Gartner (analyst), Apollo/ZoomInfo (lead gen)
- The real competitor: copy-pasting from last year's RFP
- Sourcera's unique claim: RFP response + Marketplace discovery + CRM-ready intent in one workflow at 3-4× cheaper

SECTION 5: VALUE PROPOSITION ARCHITECTURE
Create a layered messaging hierarchy for THREE audiences:

a) BUYER organizations:
- One-liner (≤15 words)
- Elevator pitch (30 sec)
- Value narrative (2 min)
- Feature-to-benefit mapping with quantifiable claims

b) SELLER organizations (forced-signup path — arrived via buyer invite):
- One-liner
- The hero moment pitch ("your bid is already drafted")
- Feature-to-benefit mapping focused on KB, first-pass drafting, response reuse

c) SELLER organizations (organic path — discovering Sourcera independently):
- One-liner
- Elevator pitch focused on Marketplace discovery + CRM Sync + competitive intelligence
- Feature-to-benefit mapping focused on Seller Signals, Match Scoring, EOI pipeline

d) MARKETPLACE bridge:
- How to message the two-sided value to someone who doesn't understand marketplace dynamics

SECTION 6: CATEGORY DEFINITION
- Category name: "Software Evaluation Platform" (per Master Summary §1)
- One-paragraph definition
- Why existing categories (procurement suite, RFP tool, vendor management, review platform) don't fit
- The narrative arc: problem → failed solutions → new category → Sourcera
- How to position category creation as a strength when selling to procurement teams who live in defined categories

SECTION 7: MESSAGING PLAYBOOK
For each context, write the ACTUAL copy (not guidelines):
- LinkedIn headline and bio for the founder
- Twitter/X bio
- Cold email subject lines (5 for buyer-side, 5 for seller-side)
- Homepage H1 + H2 + CTA (for a homepage that addresses BOTH sides)
- One-paragraph product description for directories (G2, Product Hunt, etc.)
- 30-second voicemail script (buyer version and seller version)
- Conference/event intro (when someone asks "what do you do?")

SECTION 8: PRICING NARRATIVE
Translate the consumption-based model into sales conversations:

- Why unlimited seats matters ("procurement is cross-functional — a seat tax kills collaboration")
- Why outcome-based AI pricing is better than token pricing or feature toggles
- The Free tier narrative: "not a demo — a real product with a real evaluation pipeline"
- The $5 AI budget as "aha moment" accelerator (designed to be spent on first Pre-Scoring run)
- Why Starter at $299/mo (buyer) or $149/mo (seller) is the sweet spot — anchor against manual process cost
- The Enterprise gate: only sold when SSO/DPA/$12K AI commit/custom integration is present
- The seller pricing narrative: "4× cheaper than Responsive, and it includes Marketplace discovery"
- Pricing objection handlers (5 most common, with specific rebuttals)
- How to explain outcome-based pricing to a non-technical buyer ("you pay for AI that works; bad outputs cost you almost nothing")
</deliverable>

<quality_gates>
Before saving:
- Every ICP element must reference a real Sourcera feature or capability
- Every persona objection must have a specific, non-generic rebuttal using actual Sourcera features
- Every piece of copy must be usable as-is (not a placeholder)
- Pricing must exactly match: Buyer Free/$299/$799/$1,999/custom; Seller Free/$149/$499/$1,499/custom
- Unlimited seats on all tiers must be emphasized
- The competitive matrix must accurately represent what competitors do
</quality_gates>

<anti_drift>
- Do not conflate buyer-side and seller-side messaging — they have different audiences, different pain points, and different pricing tracks.
- Do not reference old pricing ($499/mo flat). The model is outcome-based consumption.
- Do not invent features not in Sourcera_Master_Summary.md.
- If compacted: re-read Sourcera_Master_Summary.md §1-§3 and resume from the next incomplete section.
</anti_drift>
```

---

## PROMPT 2: PLG Motion & Conversion Architecture

**Produces:** `GTM_PLG_ARCHITECTURE.md`
**Estimated time:** 2–3 hours
**Requires:** Prompt 1 (GTM_POSITIONING.md)

```
<role>
You are a PLG architect designing the self-serve growth engine for a two-sided enterprise procurement platform with outcome-based AI pricing. Sourcera already has 17 growth mechanics (M1-M17) and 10 core growth loops specified in its source docs. Your job is NOT to invent PLG mechanics — it's to design the operational execution of the mechanics that already exist, plus identify any gaps, and create the measurement framework.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Focus on: §2 (full pricing), §3 (PLG motion, 10 growth loops, M1-M17, hero moment, conversion moments, seller activation metric, leading indicators, anti-spam controls, hero moment mechanics), §6.13.7 (KB Value Capture)
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Seller_Pricing_Strategy.md — Focus on: forced-signup mechanics, hero moment, three conversion moments, win/loss debrief, activation metric, leading indicators, financial scenarios
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Buyer_Pricing_Strategy.md — Focus on: buyer PLG flow, aha moment, ceiling hits, PQL signals, financial scenarios
4. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP and personas from Prompt 1
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md covering:

SECTION 1: PLG VIABILITY ASSESSMENT BY ENTRY PATH
Sourcera has FOUR distinct entry paths. Assess each for PLG potential:
a) Buyer signs up for Free — self-serve evaluation
b) Seller arrives via buyer invite (forced signup — M1/M5/M15) — the HIGHEST-VALUE path
c) Seller signs up organically for KB/Marketplace presence
d) Someone discovers Sourcera through SEO content (M9/M10/M11)

For each: time-to-value, activation complexity, natural expansion triggers, expected conversion rate range.

SECTION 2: BUYER-SIDE ACTIVATION ARCHITECTURE
Design the first-run experience for buyer signup:
- The signup flow (Google/MS SSO, no credit card, 60 seconds to first evaluation)
- The "aha moment": first Pre-Scoring run across 3+ vendors that consumes the $5 AI budget
- The first 3 actions that guide toward aha moment
- Activation metric and target
- How Template Library and Template Discovery (§6.10) accelerate setup

SECTION 3: SELLER-SIDE ACTIVATION ARCHITECTURE — THE HERO MOMENT
The Master Summary §3.6 specifies the Hero Moment in detail. Your job is to design the OPERATIONAL execution:
- Pre-arrival preparation (domain enrichment, bootstrap queue pre-warming)
- The 0-3 minute onboarding flow (magic-link → SSO → bootstrap → first-pass draft → landing screen)
- The progress storytelling UI ("Scanning yourcompany.com..." → "Your bid is ready")
- In-workspace value proof (inline citations, accept/edit/reject, KB-gap detector, live budget counter)
- Post-submission stake reveal ("You built a reusable KB of 47 entries in 35 minutes")
- The onboarding anti-patterns (§3.6 bans: no credit card ask, no company form, no "try Pro free" modal, no pricing page before first bid)
- How to operationally ensure p50 < 20 min from magic-link to first submitted response

SECTION 4: CONVERSION TRIGGER ARCHITECTURE
Design the operational execution of each conversion path:

Buyer Free → Starter triggers:
- Evaluation limit (1 active), vendor limit (25), AI budget ($5 exhausted), Opus-gated capability
- Contextual upgrade CTA design (not generic banners — triggered at the exact ceiling-hit moment)
- Expected conversion timeline

Seller Free → Starter triggers (the three conversion moments):
- Moment 1: Second concurrent bid (urgency)
- Moment 2: First EOI attempt (ambition)
- Moment 3: KB ceiling at 50 entries (investment)
- The win/loss debrief as upgrade trigger
- Design 5 specific in-product upgrade nudges with exact copy and placement for each moment

Starter → Growth → Scale triggers:
- 80% AI budget utilization for 2 consecutive months
- Active evaluation/bid ceiling approaching
- CRM Sync request, numeric Match Score request

Scale/Growth → Enterprise triggers:
- SSO/DPA/$12K AI commit/custom integration — routes to founder-led sale
- How usage data triggers founder outreach

SECTION 5: THE 17 GROWTH MECHANICS — OPERATIONAL EXECUTION PLAN
For each of M1-M17 (listed in Master Summary §3.3), produce:
- Current implementation status assumption (what must be true in the product)
- The GTM action the solo operator takes to activate/amplify it
- The metric to track its effectiveness
- Priority ranking (must-have at launch vs. can add in month 2-3)

SECTION 6: THE 10 GROWTH LOOPS — MEASUREMENT FRAMEWORK
For each of the 10 loops in Master Summary §3.2, define:
- Loop time (days from trigger to new user)
- Branching factor (new users per existing user per cycle)
- Leading indicator to track
- What accelerates the loop
- What kills it

SECTION 7: PQL SCORING MODEL
Define behavioral signals for Product-Qualified Leads on BOTH sides:

Buyer PQLs:
- Activation signals, usage signals, intent signals
- Scoring model implementable with PostHog events

Seller PQLs:
- Forced-signup engagement signals
- KB investment signals
- Bid completion signals
- Marketplace activity signals

SECTION 8: SELF-SERVE MONETIZATION MECHANICS
Design the Stripe integration touchpoints:
- Buyer upgrade flow (contextual, in-app, instant for Business tiers)
- Seller upgrade flow (at the three conversion moments)
- AI Wallet overage opt-in flow (admin enables, sets cap)
- Annual vs. monthly nudge mechanics
- Downgrade handling (90-day read-only preservation)
- Pro Trial Seat mechanics (M17 — Scale buyers gifting Seller Starter trials)
</deliverable>

<anti_drift>
- Do NOT invent new growth mechanics beyond M1-M17. Design the execution of what exists.
- Do NOT design PLG for features not in the spec.
- Reference growth mechanics by their M-number (M1, M5, M15, etc.).
- All pricing must match the source docs exactly.
- If compacted: re-read Sourcera_Master_Summary.md §2-§3 and resume.
</anti_drift>
```

---

## PROMPT 3: Solo Operator Sales Playbook

**Produces:** `GTM_SALES_PLAYBOOK.md`
**Estimated time:** 2–3 hours
**Requires:** Prompts 1 + 2

```
<role>
You are a B2B enterprise sales strategist specializing in founder-led sales for two-sided platforms with consumption-based pricing. You're designing the complete sales motion for a solo operator selling to BOTH buyer organizations and seller organizations — two different sales motions, two different value props, two different pricing tracks. No SDRs, no AEs, no sales engineers. One person doing everything.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Full product, pricing, PLG
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Buyer_Pricing_Strategy.md — Buyer pricing, financial scenarios
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Seller_Pricing_Strategy.md — Seller pricing, competitive anchors
4. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP, personas, messaging
5. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md — PLG mechanics, PQL scoring
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md covering:

SECTION 1: FOUNDER-LED SALES OPERATING MODEL
- Weekly operating rhythm (hours/week across buyer sales, seller sales, marketing, product)
- How buyer sales and seller sales interact (a buyer deal creates seller leads via vendor invites)
- Pipeline targets for each side to sustain target MRR growth
- Tools (CRM, email sequences, scheduling) — specific free/cheap recommendations
- The "one deal seeds ten" principle: every buyer evaluation with 5 vendors creates 5 seller signup opportunities

SECTION 2: BUYER-SIDE PROSPECTING SYSTEM

OUTBOUND (30%):
- LinkedIn prospecting: search criteria per buyer persona, connection request templates (3 variations), 5-touch follow-up cadence with exact copy
- Cold email sequences: 4-email sequence PER BUYER PERSONA from GTM_POSITIONING.md with exact subject lines, body copy, CTAs, and timing
- The "warm intro" playbook via procurement communities and integration partners
- Conference/event strategy: which procurement/IT/compliance conferences, what to do there

INBOUND (50% — from PLG + content):
- How to identify and prioritize PQLs from Free signups (use scoring from GTM_PLG_ARCHITECTURE.md)
- First-touch email/call for buyer PQL (exact script)
- How to find the economic buyer when the PQL is an individual contributor

PARTNER/CHANNEL (20%):
- Integration partners (Jira, Linear, Salesforce, Slack) as referral sources
- Procurement consulting firms and advisors as channel
- The pitch to each partner type

SECTION 3: SELLER-SIDE SALES STRATEGY
This is different from buyer sales. Most seller leads come via PLG (forced signup from buyer invites).

- How to monitor for high-value seller PQLs (bid volume, KB size, EOI activity)
- The "second invite" outreach: contacting sellers who just received their second buyer invite (conversion moment #1)
- Direct outreach to Responsive/Loopio customers with the "4× cheaper + Marketplace" pitch
- Seller-side cold email sequences (4-email, exact copy) targeting VP Sales/Pre-Sales/RFP Manager
- The seller demo (different from buyer demo — KB automation, first-pass drafting, Marketplace discovery)

SECTION 4: QUALIFICATION FRAMEWORK
Separate for each side:

Buyer qualification:
- BANT adapted for procurement software
- The 5 qualifying questions
- Disqualifiers (too small, too infrequent, already locked into Coupa)

Seller qualification:
- RFP volume threshold (≥10/year to justify Starter)
- Current tooling assessment
- Upgrade readiness signals

SECTION 5: DEMO PLAYBOOK — BUYER VERSION
- Pre-demo research checklist
- 30-minute demo structure
- The 3 "wow moments": (1) Template clone → instant evaluation setup, (2) AI Pre-Scoring in action, (3) Selection Report output quality
- Persona-specific demo paths (Procurement Lead, CISO, CFO)
- The trial close: "Try Free — one evaluation, full pipeline, $5 AI credit"
- Post-demo follow-up email (within 2 hours)

SECTION 6: DEMO PLAYBOOK — SELLER VERSION
- Pre-demo research (check if they're already on Sourcera via forced signup)
- 20-minute demo structure (shorter than buyer — sellers are tactical)
- The 3 "wow moments": (1) KB Bootstrap in real-time, (2) First-Pass RFP drafts with inline KB citations, (3) CRM Sync showing Marketplace intent flowing into Salesforce
- The close: "You're already getting buyer invites for free. Starter at $149/mo unlocks 3 concurrent bids, 10 outbound EOIs, and weekly Firecrawl."
- Post-demo follow-up

SECTION 7: OBJECTION HANDLING ENCYCLOPEDIA
Cover BOTH sides. For each objection: exact words, underlying concern, response framework, specific Sourcera proof point.

Buyer objections:
- "We already use spreadsheets and they work fine"
- "Coupa/Ivalua already does this"
- "We don't have budget for another tool"
- "Our procurement process is too unique"
- "I can't get IT/Security to approve another SaaS vendor"
- "We only buy software every few years"
- "What if you go out of business?"
- "We need case studies / references"
- "Why should we care about the Marketplace?"
- "We need on-premise"

Seller objections:
- "We already use Responsive/Loopio"
- "AI will hallucinate in our RFP responses"
- "I don't want to give my KB to a platform"
- "We don't respond to enough RFPs to justify a tool"
- "The Marketplace isn't big enough yet"
- "Why would I pay when responding to buyer invites is free?"
- "I don't trust AI-generated responses for compliance content"

SECTION 8: PRICING & NEGOTIATION
- When and how to present pricing (outcome-based model requires education)
- The anchoring technique: cost of manual process vs. Sourcera
- ROI calculation formula with actual numbers for BOTH sides
- Discount policy (annual vs. monthly is the primary lever)
- How to handle "can we get Enterprise features on Business?"
- The unlimited-seats argument: "invite your whole team — it costs the same"
- Explaining AI budget to a non-technical buyer

SECTION 9: POST-SALE ONBOARDING (SOLO OPERATOR)
- Buyer onboarding: 30-day cadence with touchpoints and milestones
- Seller onboarding: lighter touch since Hero Moment does most of the work
- How to turn new customers into references and case studies
- The "second evaluation/bid" expansion play
- Churn prevention: what to watch for in PostHog
</deliverable>

<anti_drift>
- Every email, script, and template must be ready to use as-is. Not frameworks — finished copy.
- Do not recommend hiring.
- All pricing: Buyer Free/$299/$799/$1,999/custom; Seller Free/$149/$499/$1,499/custom.
- Unlimited seats on all tiers.
- If compacted: re-read Sourcera_Master_Summary.md, GTM_POSITIONING.md, GTM_PLG_ARCHITECTURE.md, then resume.
</anti_drift>
```

---

## PROMPT 4: Content & Inbound Growth Engine

**Produces:** `GTM_CONTENT_ENGINE.md`
**Estimated time:** 1.5–2 hours
**Requires:** Prompt 1 — can run in parallel with 5 and 6 after Prompt 3

```
<role>
You are a B2B content strategist specializing in category-creating SaaS products. You're building the content engine that will be a solo operator's primary inbound growth channel. Sourcera already has AI-generated content surfaces specified (Category Pages M9, How-to-Evaluate Guides M10, Comparison Pages M11, Market Intelligence Reports M12, Heat Map M13). Your job is to design the HUMAN content strategy that complements and amplifies these automated surfaces.
</role>

<context_loading>
Read completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Focus on §1 (category, positioning), §3 (M9-M13 content mechanics, SEO loops), §6.16.5 (Category & Comparison Content)
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP, personas, messaging, category definition
3. If available: /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md — objections and pain points
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_CONTENT_ENGINE.md covering:

SECTION 1: CONTENT STRATEGY ARCHITECTURE
- The content thesis: Sourcera owns the category "Software Evaluation Platform." Content must DEFINE and OWN this category.
- Content pillars (3-5) mapped to buyer AND seller pain points
- Content types ranked by ROI for a solo operator
- Minimum viable cadence with ≤10 hours/week
- How human content strategy connects to Sourcera's automated content surfaces (M9/M10/M11/M12/M13)

SECTION 2: SEO & KEYWORD STRATEGY
- Target keyword clusters for BOTH audiences:
  - Buyer keywords: software evaluation, vendor assessment, RFP management, procurement automation
  - Seller keywords: RFP response, proposal management, knowledge base, vendor discovery
- Prioritized first 20 blog posts (with working titles, target keywords, search intent)
- The "Sourcera Method" as an SEO asset (13-phase framework = evergreen methodology content)
- Programmatic SEO opportunity: template pages, category pages, comparison pages (M9/M10/M11)
- How Seller Org Pages and Software Pages (§6.15.4/6.15.5) compound SEO via Schema.org structured data

SECTION 3: LINKEDIN STRATEGY
- Posting cadence and format mix
- 20 specific post ideas with hooks — split between buyer-facing and seller-facing content
- The "founder's journey building a procurement OS" narrative
- Engagement strategy: which procurement communities, pre-sales communities, InfoSec groups
- LinkedIn newsletter concept

SECTION 4: EMAIL NEWSLETTER
- Newsletter concept (name, tagline, audience — consider separate buyer/seller editions vs. combined)
- Content format and structure per issue
- Subscriber acquisition tactics
- Integration with Loops.so
- Growth targets: month 1, 3, 6, 12

SECTION 5: TEMPLATE & TOOL-BASED LEAD GENERATION
Design downloadable assets:
- Evaluation templates per software category (CRM, ERP, Security, ITSM, etc.) — these connect to Sourcera's Template Library
- The Sourcera Method as a standalone framework/guide
- Scoring rubric templates (FM/PM/EJ model)
- TCO calculator
- "RFP Response Reuse Rate" calculator for sellers
- Procurement readiness self-assessment
For each: what it is, gating strategy, nurture sequence, and connection to Sourcera signup

SECTION 6: THOUGHT LEADERSHIP & DISTRIBUTION
- The "Sourcera Method" as publishable IP
- Guest posting targets (procurement publications, SaaS blogs, compliance outlets, pre-sales communities)
- Podcast guesting strategy
- Community participation: specific Slack groups, Discord servers, Reddit subreddits, LinkedIn groups, forums

SECTION 7: CONTENT PRODUCTION SYSTEM
- Claude-assisted content workflow
- Content repurposing chain (1 piece → multiple formats)
- 90-day content calendar (week by week)
- Tools needed (free/cheap recommendations)
</deliverable>

<anti_drift>
- Connect every content idea to Sourcera's positioning, not generic "SaaS content marketing."
- Distinguish buyer-facing and seller-facing content explicitly.
- Reference M9/M10/M11/M12/M13 by number when discussing automated content surfaces.
- If compacted: re-read Sourcera_Master_Summary.md §3 and GTM_POSITIONING.md, then resume.
</anti_drift>
```

---

## PROMPT 5: Network Effects & Marketplace Growth Strategy

**Produces:** `GTM_NETWORK_EFFECTS.md`
**Estimated time:** 2–3 hours
**Requires:** Prompt 1 — can run in parallel with 4 and 6

```
<role>
You are a marketplace growth strategist. Sourcera's source docs already define 10 growth loops, 7 seller-side network effects, and 17 growth mechanics. Your job is NOT to re-define these — it's to design the OPERATIONAL EXECUTION STRATEGY for building both sides of the marketplace as a solo operator, with specific tactics, sequencing, and metrics.
</role>

<context_loading>
Read completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Focus on §3 (all of it: 10 growth loops, M1-M17, seller-side network effects, anti-spam controls, hero moment), §6.16 (Marketplace), §6.15 (Seller Profiles, Verification, Capability Declarations), §6.13.7 (KB Value Capture), §2.1 (invited participation is free), §2.10 (Marketplace Discovery Pricing)
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Seller_Pricing_Strategy.md — Focus on: seller network effects, forced-signup mechanics, competitive positioning, revenue projections
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP and competitive positioning
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_NETWORK_EFFECTS.md covering:

SECTION 1: NETWORK EFFECTS INVENTORY — OPERATIONAL STATUS
For each of the 10 growth loops (Master Summary §3.2) and 7 seller-side network effects (§3.4):
- What product feature must be live for this loop to operate?
- What's the loop time and branching factor?
- What's the solo operator's role in accelerating it?
- Priority: must-have at launch vs. can activate in month 2-3?
- Kill condition: what would prevent this loop from functioning?

SECTION 2: COLD START STRATEGY — THE FIRST 90 DAYS
The classic chicken-and-egg, with a twist: Sourcera's Free tier gives BOTH sides standalone value before the marketplace has liquidity.

Phase 1 (Days 1-30): Seed supply
- Tactic: Direct outreach to 50 SaaS vendors to create Seller Profiles (free, takes 5 minutes)
- Which software categories to seed first (highest cross-pollination potential)
- The "your profile is already live" pitch (published from day one per §6.15.1)
- How to trigger KB Bootstrap for organic seller signups
- Target: 50 Seller Profiles, 20 with completed Capability Declarations

Phase 2 (Days 15-45): Seed demand
- Tactic: Get 5-10 buyer organizations running evaluations on Free tier
- Each evaluation invites 5-10 vendors → forced signups (M1/M5)
- Target: 10 buyer Orgs, 50-100 vendor signups via forced path
- The "one buyer evaluation seeds 10 seller accounts" math

Phase 3 (Days 30-90): Flywheel ignition
- When do forced-signup sellers start receiving SECOND invites? (conversion moment #1)
- When do sellers hit KB ceiling? (conversion moment #3)
- When do sellers attempt first EOI? (conversion moment #2)
- Metrics that tell you the flywheel is turning

SECTION 3: SUPPLY-SIDE ACQUISITION — DETAILED TACTICS
For each tactic, specify: channel, exact outreach, expected conversion rate, time investment

a) Forced-signup path (highest conversion — arrives with buyer invite):
- How to maximize vendor invites per buyer evaluation
- How to ensure the Hero Moment executes flawlessly
- How to follow up with forced-signup sellers who haven't submitted their first bid

b) Organic seller outreach:
- Direct outreach to RFP-heavy teams (the "you pay $7K/yr for Responsive, we're $1,800/yr and include Marketplace" pitch)
- Industry vertical strategy: which categories first
- LinkedIn outreach sequences for Pre-Sales/RFP teams

c) Seller activation campaign:
- Getting sellers to complete Capability Declarations
- Getting sellers to run their free KB Bootstrap
- Incentivizing template publishing (M9)

SECTION 4: DEMAND-SIDE ACQUISITION — DETAILED TACTICS
a) The evaluation-as-acquisition strategy: each buyer evaluation seeds 5-20 vendors
b) Industry-specific "evaluation events" — curated evaluations in hot categories
c) Procurement community partnerships (ISM, CIPS, SIG, Procurement Leaders)
d) The Template Library as buyer acquisition tool
e) Content-to-signup: how M9/M10/M11 SEO content drives buyer signups

SECTION 5: MARKETPLACE LIQUIDITY TACTICS
- How to make the marketplace feel full before it is (profile quality > quantity)
- Verification tier strategy: incentivize sellers to reach Verified/Certified
- Category-by-category launch strategy
- The "Sourcera 50" — a curated launch list of verified sellers
- Pro Trial Seats (M17) as liquidity accelerator

SECTION 6: CATEGORY EXPANSION PLAYBOOK
- Which software categories to launch first (criteria: evaluation frequency, RFP volume, vendor density)
- The playbook for entering a new category (how many sellers needed, what content to create, what templates to seed)
- How Category Pages (M9) and Comparison Pages (M11) auto-compound once seeded
- Timeline: categories at launch, month 3, month 6, month 12

SECTION 7: DEFENSIBILITY & MOAT ASSESSMENT
- When do network effects become self-sustaining? (what milestones/metrics)
- Switching costs: buyers (evaluation history, templates, Org Intelligence) vs. sellers (KB, confidence scores, citation graphs, win-rate weighting)
- Data moat: outcome-based AI accounting → better models → higher-quality suggestions → more usage → more data
- SEO moat: M9 + M10 + M11 per category = first-mover advantage
- The aggregation theory play: owning the buyer-seller relationship in software procurement
</deliverable>

<anti_drift>
- Reference growth loops and mechanics by their numbers (M1-M17, Loop 1-10).
- The Marketplace is opt-in and summary-only — do not design tactics that expose buyer evaluation data.
- Vendor participation is always free. Published profiles are free from day one. Do not recommend charging sellers for visibility.
- Promoted Listings are Scale+ only ($500/category/week). Do not recommend them for early-stage sellers.
- If compacted: re-read Sourcera_Master_Summary.md §3 and resume.
</anti_drift>
```

---

## PROMPT 6: Growth Hacking & Viral Mechanics

**Produces:** `GTM_GROWTH_TACTICS.md`
**Estimated time:** 1.5–2 hours
**Requires:** Prompts 1–3 — can run in parallel with 4 and 5

```
<role>
You are a growth hacker specializing in two-sided B2B platforms with consumption-based pricing. You think in experiments, loops, and leverage. Sourcera already defines 17 growth mechanics (M1-M17) — your job is to design 20+ ADDITIONAL experiments that AMPLIFY those existing mechanics, plus tactical hacks the solo operator can execute in 1–2 weeks each.
</role>

<context_loading>
Read:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — §3 (all growth loops and mechanics)
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_GROWTH_TACTICS.md

For EACH experiment:
| Field | Detail |
|-------|--------|
| Name | Short memorable name |
| Amplifies | Which M-mechanic or growth loop this amplifies (M1-M17, Loop 1-10, or "new") |
| Hypothesis | "If we [action], then [outcome] because [reason]" |
| Tactic | Step-by-step execution |
| Time to execute | Hours/days |
| Cost | $ or free |
| Primary metric | What you measure |
| Success threshold | Scale this |
| Kill threshold | Stop this |
| Leverage | Low/Medium/High |

Categories:

CATEGORY 1: PRODUCT-LED VIRALITY AMPLIFIERS (5+ experiments)
Tactics that amplify M1-M17 mechanics that are already in the product — shared reports (M2), evaluation certificates (M3), bid success shares (M14), template attribution (Loop 2), etc.

CATEGORY 2: CONTENT & SEO HACKS (5+ experiments)
Amplify M9/M10/M11 automated content surfaces. Programmatic SEO, comparison pages, tool-based content, data-driven content.

CATEGORY 3: COMMUNITY & SOCIAL (5+ experiments)
Audience and authority building — LinkedIn plays, community, event-driven campaigns.

CATEGORY 4: SELLER SUPPLY ACCELERATION (3+ experiments)
Tactics to get seller profiles and KB content into the marketplace faster — Ghost-Bid Import (M15), KB Bootstrap campaigns, template publishing (M9/Loop 9).

CATEGORY 5: LAUNCH & PR (3+ experiments)
Product Hunt, Hacker News, press, awards.

CATEGORY 6: REFERRAL & INCENTIVE (3+ experiments)
Amplify M16 (Buyer Referral Credit), M17 (Pro Trial Seats), template publish incentive (Loop 9).

Produce a PRIORITIZED EXECUTION QUEUE — rank all experiments by (expected impact × probability) / (time investment). Recommend the first 5 to run.
</deliverable>

<anti_drift>
- Every experiment must be executable by one person in ≤2 weeks.
- Cost ≤$500 per experiment unless clearly justified.
- Be specific to Sourcera. Reference actual features and M-mechanics.
- Do not recommend paid ad experiments until organic channels are proven.
- If compacted: re-read Sourcera_Master_Summary.md §3 and resume.
</anti_drift>
```

---

## PROMPT 7: Pitch Deck Creation

**Produces:** `Sourcera_Pitch_Deck.pptx`
**Estimated time:** 2–3 hours
**Requires:** Prompts 1 + 3
**Skill required:** pptx

```
<role>
You are creating a pitch deck for Sourcera — a two-sided enterprise software procurement platform with outcome-based AI pricing, a Vendor Discovery Marketplace, and fully monetized buyer + seller tracks. This deck serves THREE purposes: (1) investor conversations, (2) strategic partnership pitches, (3) enterprise sales presentations. Design for all three.
</role>

<context_loading>
Read completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — Full product, pricing, growth
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP, personas, competitive positioning, value props
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md — Pricing narrative, objection handling
</context_loading>

<deck_structure>
Create a pitch deck. Each slide: minimal text (≤30 words visible), detailed speaker notes.

SLIDE 1: TITLE — "Choose Correct. Move Faster." + Sourcera logo placeholder
SLIDE 2: THE PROBLEM — Enterprise software procurement is broken on BOTH sides. Quantify: time, money, bad decisions (buyers); wasted effort, missed opportunities (sellers).
SLIDE 3: WHY NOW — AI maturation, compliance pressure, remote/distributed procurement, RFP fatigue, procurement teams understaffed
SLIDE 4: THE SOLUTION — Three pillars: Structured Evaluation + AI Intelligence + Vendor Discovery Marketplace
SLIDE 5: THE DUAL-CONSOLE ARCHITECTURE — Buyers and sellers on one platform, data-isolated at database level
SLIDE 6: HOW IT WORKS — The 13-phase pipeline visualized simply
SLIDE 7: AI CAPABILITIES — 21+ capabilities, outcome-based pricing, the Agent as infrastructure layer
SLIDE 8: THE MARKETPLACE — Vendor Discovery + Seller Profiles + Capability Declarations + Match Scoring
SLIDE 9: THE HERO MOMENT — The seller forced-signup experience: "your bid is already drafted" (this is a key differentiator)
SLIDE 10: BUSINESS MODEL — Two-sided pricing: Buyer tiers + Seller tiers. Outcome-based AI consumption. Unlimited seats. ≥90% target blended margin.
SLIDE 11: REVENUE MODEL — Show both sides: Buyer ARR scenarios + Seller ARR scenarios. Show unit economics (96% gross margin at Starter, ≥90% blended target).
SLIDE 12: MARKET SIZE — TAM/SAM/SOM for both sides (procurement tools + RFP response tools + vendor discovery). Defensible bottoms-up.
SLIDE 13: COMPETITIVE LANDSCAPE — 2×2 matrix. Buyer side: Sourcera vs. spreadsheets vs. procurement suites. Seller side: Sourcera vs. Responsive/Loopio. The unique claim: only platform spanning both sides.
SLIDE 14: GROWTH ENGINE — The flywheel: buyer invite → vendor signup → hero moment → KB compounds → marketplace grows → SEO compounds → inbound buyer demand → more invites. Reference M1-M17.
SLIDE 15: NETWORK EFFECTS — 10 growth loops, 7 seller-side effects. Show how each buyer evaluation seeds 5-10 seller accounts.
SLIDE 16: TRACTION / MILESTONES — Frame as "what we've built": product scope, technical capabilities, AI capabilities, entity count, phase count. Pre-revenue framing.
SLIDE 17: THE TEAM — Solo founder as strength (capital efficiency, technical depth, speed)
SLIDE 18: THE ASK — Investor/partner/customer variations in speaker notes
SLIDE 19: APPENDIX — Financial projections (conservative Month 1-24 model)

Use the pptx skill. Clean, modern, data-forward.
</deck_structure>

<anti_drift>
- All product claims from Sourcera_Master_Summary.md.
- Pricing: Buyer Free/$299/$799/$1,999/custom; Seller Free/$149/$499/$1,499/custom.
- Do not fabricate traction, logos, or testimonials.
- Market size must be defensible bottoms-up.
- If compacted: re-read Sourcera_Master_Summary.md and GTM_POSITIONING.md, then resume.
</anti_drift>
```

---

## PROMPT 8: Launch Sequence & 90-Day Sprint Plan

**Produces:** `GTM_90DAY_SPRINT.md`
**Estimated time:** 2–3 hours
**Requires:** ALL previous prompts (1–7)

```
<role>
You are a startup execution coach building the 90-day launch sprint plan for a solo operator taking a two-sided platform to market. You have access to all strategy documents. Your job: compress everything into a week-by-week plan that one person can follow — with specific tasks, time allocations, milestones, and decision points. Account for the fact that this is a TWO-SIDED marketplace: buyer and seller acquisition must happen in parallel.
</role>

<context_loading>
Read ALL:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Summary.md — §1-§3
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md
4. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md
5. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_CONTENT_ENGINE.md
6. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_NETWORK_EFFECTS.md
7. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_GROWTH_TACTICS.md
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_90DAY_SPRINT.md covering:

SECTION 1: LAUNCH READINESS CHECKLIST
Everything that must be true before Day 1:
- Product: which M-mechanics must be live? (M1 vendor invite, hero moment, KB bootstrap, free tier, seller profile, basic marketplace)
- Website/landing page (dual-audience: buyer + seller)
- Legal (ToS, DPA, privacy policy)
- Billing (Stripe: 5 buyer tiers, 5 seller tiers, AI wallet, overage)
- Analytics (PostHog: PQL events, activation metrics, conversion funnels)
- Content (first 5 posts, LinkedIn profile, email sequences)
- Sales (demo script buyer + seller, proposal templates, security questionnaire)
- Marketplace seed (minimum seller profiles by category)

SECTION 2: PRE-LAUNCH (Weeks -4 to 0)
- Week -4: Seed 20-30 seller profiles via direct outreach (free, published from day one)
- Week -3: Beta buyer recruitment (5-10 orgs running evaluations → generates vendor invites)
- Week -2: Content pipeline loaded, LinkedIn cadence started
- Week -1: Launch prep — Product Hunt, HN, community seeding
- Daily tasks with estimated hours

SECTION 3: LAUNCH WEEK (Week 1)
Day-by-day:
- Channel activation sequencing
- Product Hunt launch playbook
- Announcement posts and emails
- Monitoring plan
- Response plan for inbound

SECTION 4: POST-LAUNCH MONTH 1 (Weeks 2-4)
Weekly breakdown:
- Buyer acquisition: outbound + PLG inbound
- Seller acquisition: forced-signup monitoring + organic outreach
- Content cadence
- First growth experiments (from GTM_GROWTH_TACTICS.md — by name)
- Metrics review ritual
- Milestone targets (end of Month 1):
  - X buyer orgs on Free, Y on Starter
  - X seller profiles, Y forced-signup sellers, Z on Seller Starter
  - First conversion events (buyer and seller)

SECTION 5: MONTH 2 (Weeks 5-8)
- Scale what worked in Month 1
- Second wave of growth experiments
- Seller supply push: category expansion
- First buyer case study development
- First Enterprise pipeline building
- Milestone targets

SECTION 6: MONTH 3 (Weeks 9-13)
- Optimization: double down on top 2 channels per side
- First Enterprise deal pursuit
- Marketplace liquidity assessment
- Content compounding effects
- Community building
- Milestone targets

SECTION 7: TIME BUDGET
Realistic 50-hour work week allocation:
- Map every hour across: product (bugs, polish), buyer sales, seller sales, marketing/content, community, admin
- Show how allocation shifts Month 1 → Month 3
- "Protected time" blocks for deep work

SECTION 8: METRICS DASHBOARD
Exact metrics, organized by cadence:

Daily: [list with source/tool]
Weekly: [list with source/tool]
Monthly: [list with source/tool]

The 5 North Star metrics:
1. Active evaluations (buyer health)
2. Forced-signup seller conversion rate (marketplace health)
3. AI budget consumption rate (monetization health)
4. Seller KB entries created (supply-side depth)
5. MRR (revenue)

Leading indicators that predict lagging outcomes.
Red/yellow/green thresholds.

SECTION 9: DECISION GATES
- End of Week 2: Is the buyer ICP responding? If not, what to change.
- End of Month 1: Which side of the marketplace is converting? Where to shift time.
- End of Month 2: Is there a path to $10K MRR in 6 months? What changes.
- End of Month 3: Full strategy review — keep, kill, double down.

SECTION 10: FAILURE MODES & CONTINGENCIES
For each scenario, define the response:
- "No one signs up for Free (buyer)" — what to do
- "Free buyers don't convert to Starter" — what to do
- "Forced-signup sellers don't submit bids" — Hero Moment failing, what to do
- "Sellers won't build profiles/KB organically" — supply side cold, what to do
- "Content isn't driving traffic" — what to do
- "Outbound isn't getting replies (buyer or seller)" — what to do
- "Enterprise interest but no close" — what to do
- "One side converts but the other doesn't" — what to do
</deliverable>

<anti_drift>
- This must be a SPECIFIC plan, not a framework. Name exact tasks, hours, metrics.
- All time estimates must sum to ≤50 hours/week. If they don't, cut something.
- Reference specific tactics from GTM_GROWTH_TACTICS.md by name.
- Reference specific content from GTM_CONTENT_ENGINE.md in the content schedule.
- Account for BOTH sides of the marketplace in every week.
- If compacted: re-read all GTM files and resume from next incomplete section.
</anti_drift>
```

---

## Execution Checklist

| # | Prompt | Produces | Duration | Dependencies | Parallel? | Status |
|---|--------|----------|----------|-------------|-----------|--------|
| 0 | Update Project Instructions (v2) | — | 5 min | None | — | ☐ |
| 1 | Strategic Foundation & Positioning | GTM_POSITIONING.md | 2–3 hrs | Prompt 0 | No | ☐ |
| 2 | PLG Motion & Conversion Architecture | GTM_PLG_ARCHITECTURE.md | 2–3 hrs | Prompt 1 | No | ☐ |
| 3 | Solo Operator Sales Playbook | GTM_SALES_PLAYBOOK.md | 2–3 hrs | Prompts 1+2 | No | ☐ |
| 4 | Content & Inbound Growth Engine | GTM_CONTENT_ENGINE.md | 1.5–2 hrs | Prompt 1 | Yes (w/ 5,6) | ☐ |
| 5 | Network Effects & Marketplace Growth | GTM_NETWORK_EFFECTS.md | 2–3 hrs | Prompt 1 | Yes (w/ 4,6) | ☐ |
| 6 | Growth Hacking & Viral Mechanics | GTM_GROWTH_TACTICS.md | 1.5–2 hrs | Prompts 1–3 | Yes (w/ 4,5) | ☐ |
| 7 | Pitch Deck Creation | Sourcera_Pitch_Deck.pptx | 2–3 hrs | Prompts 1+3 | No | ☐ |
| 8 | Launch Sequence & 90-Day Sprint | GTM_90DAY_SPRINT.md | 2–3 hrs | All previous | No | ☐ |

**Fastest path:** Run 1 → 2 → 3 (~8 hrs), then 4+5+6 in parallel (~3 hrs), then 7 → 8 (~5 hrs). Total elapsed: ~16 hours.

---

## What Each Prompt Produces

| File | What It Is | How You Use It |
|------|-----------|----------------|
| GTM_POSITIONING.md | ICP (buyer+seller), personas, messaging, competitive positioning, category definition, pricing narrative | Foundation for all copy, sales conversations, investor pitches |
| GTM_PLG_ARCHITECTURE.md | Activation flows (buyer+seller), Hero Moment execution, M1-M17 operational plans, PQL scoring, conversion triggers | Product decisions, onboarding optimization, Stripe configuration |
| GTM_SALES_PLAYBOOK.md | Dual-side founder-led sales system — buyer + seller scripts, demos, objection handlers | Daily sales execution |
| GTM_CONTENT_ENGINE.md | SEO strategy, content calendar, LinkedIn playbook, lead magnets, connection to M9-M13 | Weekly content production |
| GTM_NETWORK_EFFECTS.md | Marketplace cold-start tactics, supply/demand acquisition, category expansion, moat assessment | Strategic marketplace decisions |
| GTM_GROWTH_TACTICS.md | 20+ ranked growth experiments amplifying M1-M17 | Experiment queue — run weekly |
| Sourcera_Pitch_Deck.pptx | Professional deck showing two-sided model, outcome pricing, network effects, unit economics | Fundraising, partnerships, enterprise sales |
| GTM_90DAY_SPRINT.md | Week-by-week plan with dual-side acquisition, time budgets, decision gates | Operating system for the first 90 days |
