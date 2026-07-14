# Sourcera GTM Playbook — Execution Prompts

**Purpose:** Eight prompts executed sequentially in separate Cowork sessions. Each produces a concrete GTM deliverable. Together they form a complete solo-operator go-to-market system for Sourcera.

**Prerequisites:**
- Update your Sourcera project instructions with GTM_PROJECT_INSTRUCTIONS.md
- Sourcera workspace folder selected in each session
- For Prompt 7 (Pitch Deck): pptx skill available

**Total estimated execution time:** 12–18 hours across 8 sessions

---

## How to Use This Document

1. Copy GTM_PROJECT_INSTRUCTIONS.md into your Cowork project settings
2. Open a NEW Cowork session for each prompt
3. Select the Sourcera folder as your workspace
4. Copy-paste ONE prompt per session
5. Each prompt produces a file deliverable — wait for it before starting the next
6. Prompts 1–3 are sequential (each builds on the last). Prompts 4–6 can run in parallel after Prompt 3. Prompt 7 requires Prompts 1+3. Prompt 8 requires all others.

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

**Produces:** `GTM_POSITIONING.md` — The strategic foundation every other prompt references
**Estimated time:** 2–3 hours
**Must complete before:** Everything else

```
<role>
You are a B2B SaaS positioning strategist working with a solo founder who has built Sourcera — a production enterprise software procurement platform. Your job is to create the strategic messaging foundation that every downstream GTM activity will reference. You are not writing marketing copy yet. You are defining WHO we sell to, WHY they buy, HOW we're different, and WHAT we say.
</role>

<context_loading>
Read these files completely before producing any output:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Read §1, §2, §13, §21, §22, §27, §34, §48, §49, and Appendix J/K as needed. This is the current product authority for product definition, personas, pipeline, scoring, plan tiers, and design decisions.
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Buyer_Pricing_Strategy.md and /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Seller_Pricing_Strategy.md — Read pricing narrative and plan positioning. Master Spec §34 remains the numerical authority for exact pricing, limits, and entitlements.
</context_loading>

<deliverable>
Produce a single comprehensive document saved to /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md with the following sections. Do NOT use generic B2B frameworks. Every element must be specific to enterprise software procurement and derived from what Sourcera actually does.

SECTION 1: IDEAL CUSTOMER PROFILE (ICP)
Define Sourcera's ICP with surgical precision. Consider both sides of the marketplace:

For each ICP segment, specify:
- Company size, industry, and procurement maturity
- Annual software spend range that makes Sourcera's pricing rational
- Internal team structure (who's involved in software purchases today)
- Current tooling (what they're replacing — spreadsheets, Coupa, Responsive, etc.)
- Trigger events that create buying urgency (audit findings, compliance mandates, failed evaluations, new CTO, digital transformation initiative)
- Disqualification criteria (who is NOT your customer and why)

You must define BOTH:
a) Primary ICP: Buyer-side organizations (the revenue engine)
b) Secondary ICP: Seller-side organizations (the supply side that makes the marketplace work)
c) Wedge ICP: The specific sub-segment to target in the first 6 months for fastest time-to-revenue

SECTION 2: BUYER PERSONAS (NOT user personas — BUYING personas)
For each person involved in the purchase decision:
- Title, reporting line, and organizational context
- What they care about (their KPIs and career risks)
- Their current pain with software procurement
- What Sourcera specifically solves for THEM (map to features)
- Their objections and how to handle each one
- Where they spend time online (for targeting)
- The message that would make them stop scrolling

Include at minimum: VP/Director of Procurement, VP/Director of IT, CISO/InfoSec Lead, CFO/Finance, and the internal champion (the person who finds Sourcera and brings it in).

SECTION 3: COMPETITIVE POSITIONING MATRIX
Build a detailed competitive positioning framework:
- Direct competitors (procurement suites: Coupa, Ivalua, Jaggaer)
- Adjacent competitors (RFP tools: Responsive/RFPIO, Loopio)
- Indirect competitors (review platforms: G2, TrustRadius, Gartner)
- The real competitor: spreadsheets + email + SharePoint
- For each: what they do well, where they fall short vs. Sourcera, and the one-line repositioning statement

SECTION 4: VALUE PROPOSITION ARCHITECTURE
Create a layered messaging hierarchy:
- One-liner (≤15 words) — for cold emails, LinkedIn, and elevator pitches
- Elevator pitch (30 seconds / ~75 words) — for calls and intros
- Value narrative (2 minutes / ~300 words) — for demo intros and landing pages
- Feature-to-benefit mapping: for every major Sourcera capability, translate the feature into a business outcome with a quantifiable claim where possible

The value prop must address THREE distinct audiences with different messages:
a) Buyer organizations: "evaluate faster, decide better, prove compliance"
b) Seller organizations: "respond faster, win more, build institutional knowledge"
c) The marketplace bridge: "discover qualified vendors / get discovered by serious buyers"

SECTION 5: CATEGORY DEFINITION
Sourcera doesn't fit neatly into an existing category. Define the category:
- Category name and one-paragraph definition
- Why existing categories (procurement suite, RFP tool, vendor management) don't fit
- How to position category creation as a strength, not a liability
- The narrative arc: problem → failed solutions → new category → Sourcera

SECTION 6: MESSAGING PLAYBOOK
For each of these contexts, write the ACTUAL copy (not guidelines):
- LinkedIn headline and bio for the founder
- Twitter/X bio
- Cold email subject lines (5 variations for buyer-side, 5 for seller-side)
- Homepage H1 + H2 + CTA
- One-paragraph product description for directories (G2, Product Hunt, etc.)
- 30-second voicemail script
- Conference/event intro (when someone asks "what do you do?")

SECTION 7: PRICING NARRATIVE
Translate the plan tiers into a sales narrative:
- Why Free exists (PLG entry, seller supply, social proof)
- Why Business at $499/mo is the sweet spot (anchor against what they spend today on the manual process — estimate the cost of a 12-week evaluation done manually)
- Why Enterprise is custom (SSO, SCIM, compliance, SLA — these are procurement requirements for procurement software, which is meta but real)
- The upsell path: Free → Business trigger points, Business → Enterprise trigger points
- Pricing objection handlers (3 most common objections and rebuttals)
</deliverable>

<quality_gates>
Before saving the file:
- Every ICP element must reference a real Sourcera feature or capability
- Every persona objection must have a specific, non-generic rebuttal
- Every piece of copy must be usable as-is (not a placeholder or template)
- The competitive matrix must accurately represent what competitors do (use your knowledge, but don't fabricate capabilities)
- The pricing narrative must use the EXACT pricing from the spec ($499/mo annual, $599/mo monthly, 14-day free trial, vendor participation always free)
</quality_gates>

<anti_drift>
- Do not produce a generic "SaaS positioning framework." Every word must be about enterprise software procurement.
- Do not conflate buyer-side and seller-side messaging — they are different audiences.
- Do not invent features not in `Sourcera_Master_Spec.md`.
- Do not recommend brand positioning that requires brand awareness. Sourcera starts from zero.
- If compacted: re-read `Sourcera_Master_Spec.md` §1, §2, §13, §21, §22, §27, §34, §48, and §49, then resume from the next incomplete section.
</anti_drift>
```

---

## PROMPT 2: PLG Motion & Conversion Architecture

**Produces:** `GTM_PLG_ARCHITECTURE.md` — The product-led growth machine design
**Estimated time:** 1.5–2 hours
**Requires:** Prompt 1 (GTM_POSITIONING.md)

```
<role>
You are a PLG (Product-Led Growth) architect designing the self-serve growth engine for Sourcera. You understand that enterprise procurement software doesn't have a natural PLG motion — buyers don't "try before they buy" a procurement platform the way they try Figma or Notion. Your job is to design the PLG mechanics that DO work for this product, given its dual-console architecture, marketplace, and Free tier.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Full current product authority; read §1, §2, §13, §27, §34, §48, and §49 for product, plan tiers, and personas
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP, personas, value props (produced by Prompt 1)
3. From /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md, read the Plan Tiers section for exact feature limits per tier
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md covering:

SECTION 1: PLG VIABILITY ASSESSMENT
Honestly assess which parts of Sourcera have PLG potential and which don't. Enterprise procurement is inherently high-touch. But pieces of the platform have self-serve potential:
- Free tier evaluation pipeline (3 workspaces, 10 members, 500 requirements)
- Seller-side KB and response management (free to respond to evaluations)
- Template Library as a top-of-funnel magnet
- Marketplace browsing
- The "vendor participation is free" mechanic as supply-side acquisition

For each, assess: time-to-value, activation complexity, and natural expansion triggers.

SECTION 2: ACTIVATION ARCHITECTURE
Design the first-run experience for each entry path:
a) Buyer signs up for Free tier — what's the fastest path to "aha moment"?
b) Seller invited by a buyer to respond to an evaluation — what's the onboarding?
c) Seller signs up independently to build their KB and Marketplace presence
d) Someone discovers Sourcera through a template or content piece

For each path, specify:
- The signup flow (what data you collect, what you skip)
- The first 3 actions the user should take (and how the UI guides them there)
- The "aha moment" — the specific action after which retention dramatically increases
- Time-to-value target (minutes/hours/days)
- The activation metric you'd track

SECTION 3: FREE → BUSINESS CONVERSION TRIGGERS
Design the specific product moments that create upgrade pressure:
- Which Free tier limits are they most likely to hit first?
- What feature gates create the most "I need this" moments?
- How do you surface upgrade prompts without being annoying?
- What's the expected conversion timeline (days/weeks from signup to upgrade)?
- Design 5 specific in-product upgrade nudges with exact copy and placement

SECTION 4: BUSINESS → ENTERPRISE EXPANSION
- What signals indicate a Business customer is ready for Enterprise?
- How does usage data trigger founder-led outreach?
- What Enterprise features create the strongest pull? (SSO/SCIM, IP restrictions, compliance, unlimited workspaces)
- Design the "Enterprise inquiry" flow

SECTION 5: VIRAL LOOPS & NATURAL EXPANSION
Map every mechanism by which one user's usage brings in new users:
- Buyer invites evaluators → evaluators see Sourcera → evaluators bring it to their next company
- Buyer invites vendors → vendors use Seller Console for free → vendors adopt for all their bids
- Vendor builds Marketplace presence → discovered by new buyers → buyers sign up
- Templates shared externally → recipients sign up to use them
- Selection Reports shared with leadership → leadership sees the platform's output quality

For each loop, estimate: loop time (days), branching factor (new users per existing user), and what accelerates it.

SECTION 6: PRODUCT-QUALIFIED LEAD (PQL) SCORING
Define the behavioral signals that indicate a Free user is ready for sales outreach:
- Activation signals (completed first evaluation, invited X members, etc.)
- Usage signals (approaching tier limits, high-frequency usage patterns)
- Intent signals (viewed pricing page, clicked Enterprise features, exported reports)
- Design a simple PQL scoring model the founder can implement with PostHog events

SECTION 7: SELF-SERVE MONETIZATION MECHANICS
Design the specific Stripe integration touchpoints:
- Trial-to-paid flow (14-day Business trial → what happens on day 12, 13, 14, 15?)
- Upgrade flow (in-app, instant, no sales call needed for Business tier)
- Overage handling (agent tokens, extra members — how do you bill without creating friction?)
- Annual vs. monthly nudge mechanics
</deliverable>

<anti_drift>
- Do not design a PLG motion that requires a product team to implement. Design it for the product AS BUILT per the spec.
- Do not assume PLG replaces sales for Enterprise. PLG feeds the top of funnel; founder-led sales closes Enterprise.
- If compacted: re-read `Sourcera_Master_Spec.md` §1, §2, §13, §27, §34, §48, and §49 plus `GTM_POSITIONING.md`, then resume.
</anti_drift>
```

---

## PROMPT 3: Solo Operator Sales Playbook

**Produces:** `GTM_SALES_PLAYBOOK.md` — Complete founder-led sales system
**Estimated time:** 2–3 hours
**Requires:** Prompts 1 + 2 (GTM_POSITIONING.md, GTM_PLG_ARCHITECTURE.md)

```
<role>
You are a B2B enterprise sales strategist who specializes in founder-led sales for technical products. You're designing the complete sales motion for a solo operator selling enterprise procurement software. No SDRs, no AEs, no sales engineers. One person doing everything — prospecting, qualifying, demoing, closing, onboarding. Your job is to make this not just possible but systematically repeatable.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Current product authority; read §1, §2, §13, §21, §22, §27, §34, §48, and §49
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md covering:

SECTION 1: FOUNDER-LED SALES OPERATING MODEL
Design the weekly operating rhythm:
- How many hours/week allocated to sales activities
- How those hours break down (prospecting, qualifying, demos, follow-up, closing)
- The daily and weekly cadences
- What gets automated vs. what requires personal touch
- The tools a solo operator needs (CRM, email sequences, scheduling, etc.) — recommend specific free/cheap tools
- Pipeline targets: how many prospects at each stage to sustain target MRR growth

SECTION 2: PROSPECTING SYSTEM
Design a systematic prospecting engine that one person can run:

OUTBOUND (30% of pipeline):
- LinkedIn prospecting workflow: search criteria, connection request templates (3 variations), follow-up message sequences (5-touch cadence with exact copy)
- Cold email sequences: for each buyer persona from GTM_POSITIONING.md, write a 4-email sequence with exact subject lines, body copy, and CTAs. Include timing between emails.
- The "warm intro" playbook: how to systematically generate warm intros through your network
- Conference/event strategy: which events to attend (procurement, IT, compliance conferences), what to do there, how to follow up

INBOUND (50% of pipeline — from PLG + content):
- How to identify and prioritize inbound leads from Free signups (use PQL signals from GTM_PLG_ARCHITECTURE.md)
- The first-touch email/call for an inbound PQL (exact script)
- How to identify the economic buyer when the PQL is an individual contributor

PARTNER/CHANNEL (20% of pipeline):
- Integration partners (Jira, Linear, Salesforce, Slack) as referral sources
- Consulting firms and procurement advisors as channel partners
- The pitch to each partner type (what's in it for them)

SECTION 3: QUALIFICATION FRAMEWORK
Design a qualification model for a solo operator who can't afford to waste time on bad-fit prospects:
- BANT adapted for Sourcera: what constitutes Budget, Authority, Need, and Timeline in procurement software
- Disqualification criteria: the specific answers that mean "walk away"
- The 5 qualifying questions to ask in the first call
- How to qualify without a dedicated discovery call (embed qualification in the demo)

SECTION 4: DEMO PLAYBOOK
Design the demo from open to close:
- Pre-demo prep checklist (what to research about the prospect)
- Demo structure and timing (aim for 30 minutes, not 60)
- The opening question that sets the frame
- Which features to show for each persona (the Procurement Lead demo is different from the CISO demo)
- The 3 "wow moments" to hit in every demo
- How to handle "can you show me X?" requests during the demo
- The trial offer and next-steps close
- Post-demo follow-up email template (within 2 hours)

SECTION 5: OBJECTION HANDLING ENCYCLOPEDIA
For every objection you can anticipate, provide:
- The objection (exact words the prospect says)
- What it really means (the underlying concern)
- The response framework
- The specific Sourcera proof point or feature that addresses it

Cover at minimum:
- "We already use spreadsheets and they work fine"
- "Coupa/Ivalua already does this"
- "We don't have budget for another tool"
- "Our procurement process is too unique for a standard tool"
- "I can't get IT/Security to approve another SaaS vendor"
- "We only buy software every few years, why would I pay monthly?"
- "What if you go out of business? You're a startup."
- "We need on-premise / our data can't be in the cloud"
- "Can we get a pilot/POC first?"
- "We need to see case studies / references"
- "The vendor side seems great but we're buyers, why do we care about the marketplace?"

SECTION 6: PRICING & NEGOTIATION
- When and how to present pricing
- The anchoring technique: cost of the current manual process vs. Sourcera
- How to calculate ROI for a prospect (the formula, with actual numbers)
- Discount policy: when to discount, when to hold, maximum discount
- Annual vs. monthly positioning
- How to handle "can we get Enterprise features on the Business plan?"
- The free trial close: how to use the 14-day Business trial as a closing tool

SECTION 7: CLOSING MECHANICS
- The proposal/quote format
- How to create urgency without being sleazy
- Multi-stakeholder close: how to navigate procurement committees (ironic, selling procurement software to procurement teams)
- The "pilot to paid" conversion playbook
- Security questionnaire and compliance document readiness (have these pre-built)
- Contract templates and terms

SECTION 8: POST-SALE ONBOARDING
- Solo operator onboarding playbook: how to onboard customers yourself
- The 30-day onboarding cadence (what touchpoints, what milestones)
- How to turn new customers into references and case studies
- The "second workspace" expansion play (getting a customer to run a second evaluation)
- NPS/health check process for ongoing retention
</deliverable>

<anti_drift>
- Every email, script, and template must be ready to use as-is. Not frameworks — finished copy.
- Do not recommend hiring. Design for one person.
- All pricing references must match the spec exactly.
- If compacted: re-read `Sourcera_Master_Spec.md` §1, §2, §13, §21, §22, §27, §34, §48, and §49 plus `GTM_POSITIONING.md` and `GTM_PLG_ARCHITECTURE.md`, then resume.
</anti_drift>
```

---

## PROMPT 4: Content & Inbound Growth Engine

**Produces:** `GTM_CONTENT_ENGINE.md` — Complete content marketing system
**Estimated time:** 1.5–2 hours
**Requires:** Prompt 1 (GTM_POSITIONING.md) — can run in parallel with Prompts 5 and 6 after Prompt 3

```
<role>
You are a B2B content strategist specializing in category-creating SaaS products. You're building the content engine that will be a solo operator's primary inbound growth channel. Content must do triple duty: drive organic traffic, establish category authority, and generate leads — all produced by one person.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Current product authority; read §1, §2, §13, §27, §34, §48, and §49
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
3. If available: /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md (for persona pain points and objections)
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_CONTENT_ENGINE.md covering:

SECTION 1: CONTENT STRATEGY ARCHITECTURE
- The content thesis: what's the overarching editorial angle that positions Sourcera as the authority?
- Content pillars (3–5 thematic areas that map to buyer pain points)
- Content types ranked by ROI for a solo operator (blog, LinkedIn, email newsletter, webinars, templates, tools, podcasts, video)
- The minimum viable content cadence: what to publish, where, and how often with ≤10 hours/week

SECTION 2: SEO & KEYWORD STRATEGY
- Target keyword clusters mapped to the buyer journey (awareness → consideration → decision)
- For each cluster: primary keyword, long-tail variations, search intent, content format, estimated difficulty
- Prioritized list of the first 20 blog posts to write (with working titles and target keywords)
- The "programmatic content" opportunity: can you generate SEO pages at scale from Sourcera's template library or evaluation methodology?
- Technical SEO checklist for sourcera.io

SECTION 3: LINKEDIN STRATEGY (PRIMARY SOCIAL CHANNEL)
- Posting cadence and format mix (text posts, carousels, articles, polls)
- 20 specific post ideas with hooks (first 2 lines) tied to Sourcera's positioning
- The engagement strategy: which communities, hashtags, and influencers to engage with
- Comment strategy: how to use comments on other people's posts for visibility
- LinkedIn newsletter: topic, cadence, growth tactics
- The "founder's journey" narrative: how to build personal brand while building company brand

SECTION 4: EMAIL NEWSLETTER
- Newsletter concept and positioning (name, tagline, value prop for subscribers)
- Content format and structure per issue
- Subscriber acquisition tactics (where to capture emails, what lead magnets to offer)
- Integration with Loops.so for delivery
- Growth targets: month 1, 3, 6, 12

SECTION 5: TEMPLATE & TOOL-BASED LEAD GENERATION
Design downloadable assets that generate leads:
- Evaluation templates (RFI/RFP templates for specific categories — CRM, ERP, Security, etc.)
- Scoring rubric templates (the FM/PM/EJ model as a standalone framework)
- Procurement readiness assessment (interactive self-assessment)
- TCO calculator (spreadsheet or web tool)
- Vendor comparison frameworks
For each: what it is, how it connects to Sourcera, the gating strategy (email-gated vs. free), and the nurture sequence that follows

SECTION 6: THOUGHT LEADERSHIP & DISTRIBUTION
- The "Sourcera Method" as publishable intellectual property — how to package the 13-phase methodology as educational content
- Guest posting targets (procurement publications, SaaS blogs, compliance outlets)
- Podcast guesting strategy: which podcasts, what pitch, what talking points
- Community participation: which Slack groups, Discord servers, Reddit subreddits, and forums to be active in (specific names)

SECTION 7: CONTENT PRODUCTION SYSTEM
- How to produce all of the above as a solo operator
- Claude-assisted content workflow: which pieces Claude can draft, which need human voice
- Content repurposing chain: one piece → multiple formats
- Content calendar template (first 90 days, week by week)
- Tools needed (CMS, email, social scheduling, SEO tracking) — specific free/cheap recommendations
</deliverable>

<anti_drift>
- Every content idea must connect to Sourcera's positioning, not generic "SaaS content marketing."
- Do not recommend video production or podcast hosting unless the time investment is justified.
- All templates and assets must be derivable from Sourcera's actual methodology.
- If compacted: re-read GTM_POSITIONING.md and resume.
</anti_drift>
```

---

## PROMPT 5: Network Effects & Marketplace Growth Strategy

**Produces:** `GTM_NETWORK_EFFECTS.md` — Strategy for the buyer-seller marketplace dynamics
**Estimated time:** 1.5–2 hours
**Requires:** Prompt 1 (GTM_POSITIONING.md) — can run in parallel with Prompts 4 and 6

```
<role>
You are a marketplace growth strategist who understands the cold start problem, network effects, and platform dynamics. Sourcera has a unique challenge: it's not a pure marketplace (it's a SaaS tool with a marketplace layer), but the marketplace creates the moat. Your job is to design the strategy that builds both sides of the network as a solo operator.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Focus on §22, §26, §27, §34, §48, and §49: Marketplace, Seller Console, Capability Declarations, Match Scoring, EOI workflow, and the fact that vendor participation is free
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_NETWORK_EFFECTS.md covering:

SECTION 1: NETWORK EFFECTS MAP
Identify and diagram every network effect in Sourcera:
- Direct network effects (more buyers → more valuable for sellers, and vice versa)
- Indirect network effects (more evaluations → better templates → easier onboarding → more evaluations)
- Data network effects (more scoring data → better AI pre-scoring → higher accuracy → more trust → more usage)
- Cross-side network effects (buyer evaluations → seller KB entries → faster future responses → more seller engagement)
For each, assess: strength (strong/moderate/weak), time to activate, and what the solo operator can do to accelerate it.

SECTION 2: COLD START STRATEGY
The classic marketplace chicken-and-egg problem, adapted for Sourcera:
- Which side to seed first and why (buyers or sellers?)
- The minimum viable liquidity threshold: how many buyers/sellers before the marketplace feels "alive"?
- Single-player mode value: why Sourcera is useful BEFORE the marketplace has liquidity (evaluation pipeline works standalone)
- The "come for the tool, stay for the network" strategy
- Specific tactics to seed the first 50 seller profiles
- Specific tactics to get the first 10 buyer organizations running evaluations

SECTION 3: SUPPLY-SIDE ACQUISITION (SELLERS)
Sellers are free. This is the growth lever. Design the strategy:
- Why sellers should build a Sourcera presence even before buyers are there (KB management, response library, Marketplace visibility)
- Outreach sequences for seller acquisition (the pitch: "your competitors are already being evaluated here")
- Industry vertical strategy: which software categories to seed first for maximum cross-pollination
- The "seller onboarding campaign": how to get sellers to complete their profiles and Capability Declarations
- Seller success metrics: what makes a seller "active" on the platform?
- The seller referral mechanic: how active sellers bring in other sellers

SECTION 4: DEMAND-SIDE ACQUISITION (BUYERS)
- Why having a rich seller marketplace makes buyer acquisition easier
- The evaluation-as-acquisition strategy: each buyer evaluation brings in 5–20 vendors who become platform users
- Industry-specific "evaluation events": curated evaluations in hot categories (AI tools, security vendors, CRM alternatives)
- Procurement community partnerships (ISM, CIPS, SIG, Procurement Leaders)
- The "free evaluation" offer: run your next evaluation on Sourcera for free (Free tier)

SECTION 5: MARKETPLACE LIQUIDITY TACTICS
- How to make the marketplace feel full before it is (profile quality > quantity)
- Verification tier strategy: incentivize sellers to reach Verified/Certified status
- Featured listing mechanics: what earns visibility in the marketplace
- Category-by-category launch strategy: don't launch the marketplace for all categories at once
- The "Sourcera 50" — a curated launch list of verified sellers to seed credibility

SECTION 6: DEFENSIBILITY & MOAT BUILDING
- When do network effects become self-sustaining? (milestones/metrics)
- Switching costs: what makes it hard for buyers AND sellers to leave?
- Data moat: how Sourcera's evaluation data becomes an unfair advantage over time
- The aggregation theory play: owning the relationship between enterprise buyers and software sellers
</deliverable>

<anti_drift>
- Sourcera's marketplace is opt-in and summary-only. Do not design tactics that expose buyer evaluation data.
- Vendor participation is always free. Do not recommend charging sellers.
- The marketplace is Enterprise-only for Match Scoring, but browsing is available on all plans. Design accordingly.
- If compacted: re-read `Sourcera_Master_Spec.md` §22, §26, §27, §34, §48, and §49, then resume.
</anti_drift>
```

---

## PROMPT 6: Growth Hacking & Viral Mechanics

**Produces:** `GTM_GROWTH_TACTICS.md` — Specific, executable growth experiments
**Estimated time:** 1–1.5 hours
**Requires:** Prompts 1–3 — can run in parallel with Prompts 4 and 5

```
<role>
You are a growth hacker who specializes in B2B SaaS with marketplace dynamics. You think in experiments, loops, and leverage. Your job is to design 20+ specific, executable growth experiments that a solo operator can run in 1–2 weeks each, measure, and either kill or scale. No theory — just tactics with expected outcomes.
</role>

<context_loading>
Read these files:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Current product authority; read §1, §2, §13, §27, §34, §48, and §49
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_PLG_ARCHITECTURE.md
</context_loading>

<deliverable>
Produce /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_GROWTH_TACTICS.md covering:

For EACH experiment, use this format:
| Field | Detail |
|-------|--------|
| Name | Short memorable name |
| Hypothesis | "If we [action], then [outcome] because [reason]" |
| Tactic | Step-by-step execution (specific enough that you could hand this to someone and they'd know exactly what to do) |
| Time to execute | Hours/days |
| Cost | $ amount or free |
| Primary metric | What you measure |
| Success threshold | The number that means "scale this" |
| Kill threshold | The number that means "stop" |
| Leverage | Low / Medium / High (does success compound?) |

Organize experiments into categories:

CATEGORY 1: PRODUCT-LED VIRALITY (5+ experiments)
Things inside the product that cause organic spread — shared reports, vendor invitations, template sharing, etc.

CATEGORY 2: CONTENT & SEO HACKS (5+ experiments)
Non-obvious content plays — programmatic SEO, comparison pages, tool-based content, data-driven content, etc.

CATEGORY 3: COMMUNITY & SOCIAL (5+ experiments)
Tactics that build audience and authority — LinkedIn plays, community building, event-driven campaigns, etc.

CATEGORY 4: PARTNERSHIP & INTEGRATION (3+ experiments)
Leveraging other platforms' audiences — app store listings, integration directories, co-marketing, etc.

CATEGORY 5: LAUNCH & PR (3+ experiments)
One-time or periodic campaigns — Product Hunt, Hacker News, press, awards, etc.

CATEGORY 6: REFERRAL & INCENTIVE (3+ experiments)
Structured referral programs, incentive mechanics, loyalty plays.

After listing all experiments, produce a PRIORITIZED EXECUTION QUEUE — rank all experiments by (expected impact × probability of success) / (time investment) and recommend the first 5 to run.
</deliverable>

<anti_drift>
- Every experiment must be executable by one person in ≤2 weeks.
- Cost per experiment must be ≤$500 unless the expected return is clearly justified.
- Do not recommend paid advertising experiments until organic channels are proven.
- Be specific to Sourcera. "Post on LinkedIn" is not an experiment. "Post a breakdown of the hidden cost of manual vendor evaluation using Sourcera's 13-phase framework, targeting VP Procurement" is.
- If compacted: re-read GTM_POSITIONING.md and resume.
</anti_drift>
```

---

## PROMPT 7: Pitch Deck Creation

**Produces:** `Sourcera_Pitch_Deck.pptx` — Investor/partner pitch deck
**Estimated time:** 2–3 hours
**Requires:** Prompt 1 (GTM_POSITIONING.md) + Prompt 3 (GTM_SALES_PLAYBOOK.md)
**Skill required:** pptx

```
<role>
You are creating a pitch deck for Sourcera — an enterprise software procurement SaaS platform built by a solo operator. This deck serves THREE purposes: (1) investor conversations if/when fundraising becomes relevant, (2) strategic partnership pitches, and (3) enterprise sales presentations where a formal deck is expected. Design it to work for all three with minor tweaks.
</role>

<context_loading>
Read these files completely:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Current product authority; read §1, §2, §13, §21, §22, §27, §34, §48, and §49 for the product definition
2. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_POSITIONING.md — ICP, personas, competitive positioning, value props, category definition
3. /sessions/upbeat-practical-maxwell/mnt/Sourcera/GTM_SALES_PLAYBOOK.md — Read the pricing narrative and objection handling sections
</context_loading>

<deck_structure>
Create a pitch deck with the following slides. Each slide should have minimal text (≤30 words on the slide itself) with detailed speaker notes:

SLIDE 1: TITLE
- Company name, tagline ("Choose Correct. Move Faster."), and visual identity

SLIDE 2: THE PROBLEM
- Enterprise software procurement is broken. Quantify the pain: time wasted, money lost, bad decisions made.

SLIDE 3: WHY NOW
- Why this problem is solvable NOW (AI maturation, remote work driving digital procurement, compliance pressure increasing, procurement teams understaffed)

SLIDE 4: THE SOLUTION
- Sourcera in one sentence + the three pillars: Structured Evaluation, AI Intelligence, Vendor Marketplace

SLIDE 5: HOW IT WORKS
- The 13-phase pipeline visualized simply. Show the journey from chaos to defensible decision.

SLIDE 6: THE DUAL-CONSOLE ARCHITECTURE
- Show how buyers and sellers operate in the same platform with data isolation. This is the key architectural insight.

SLIDE 7: AI CAPABILITIES
- The 21-capability Agent. Highlight the 3–4 most impressive (Policy Ingestion, Pre-Scoring, KB Staleness, Org Intelligence).

SLIDE 8: THE MARKETPLACE
- The Vendor Discovery Marketplace. How it transforms Sourcera from a tool into a platform.

SLIDE 9: PRODUCT DEMO SCREENSHOTS
- 3–4 key screens (use descriptive wireframe-style layouts since actual screenshots may not be available). Note: if screenshots don't exist, describe what should be shown and create visual placeholder layouts.

SLIDE 10: BUSINESS MODEL
- Plan tiers: Free → Business ($499/mo) → Enterprise (custom). Vendor-side always free. The PLG flywheel.

SLIDE 11: MARKET SIZE
- TAM/SAM/SOM for enterprise software procurement tools. Use defensible numbers.

SLIDE 12: COMPETITIVE LANDSCAPE
- 2x2 matrix or positioning chart showing Sourcera vs. procurement suites, RFP tools, and spreadsheets.

SLIDE 13: GO-TO-MARKET
- PLG bottom-up + founder-led sales top-down. The vendor invitation viral loop. Content-led category creation.

SLIDE 14: TRACTION / MILESTONES
- Frame as "what we've built" (product scope, technical capabilities) since this is pre-revenue. Include: lines of code, number of AI capabilities, number of entities in the data model, evaluation phases, etc.

SLIDE 15: THE TEAM
- Solo founder. Frame the solo operator angle as a STRENGTH (capital efficiency, technical depth, speed). Leave space for "advisors" if applicable.

SLIDE 16: THE ASK
- For investors: what you're raising and what you'll do with it
- For partners: what the partnership looks like
- For customers: the trial CTA
- Include all three as speaker note variations

SLIDE 17: APPENDIX — FINANCIAL PROJECTIONS (optional, for investors)
- Conservative model: monthly revenue projection months 1–24 with assumptions

Use the pptx skill to create this as a professional slide deck. Clean, modern design. Dark or light theme. No clip art. Data-forward.
</deck_structure>

<anti_drift>
- All product claims must be from `Sourcera_Master_Spec.md`.
- Pricing must match spec exactly.
- Do not fabricate traction metrics, customer logos, or testimonials.
- Do not overstate market size — use defensible bottoms-up calculation.
- If compacted: re-read `Sourcera_Master_Spec.md` §1, §2, §13, §21, §22, §27, §34, §48, and §49 plus `GTM_POSITIONING.md`, then resume.
</anti_drift>
```

---

## PROMPT 8: Launch Sequence & 90-Day Sprint Plan

**Produces:** `GTM_90DAY_SPRINT.md` — Week-by-week execution plan
**Estimated time:** 1.5–2 hours
**Requires:** ALL previous prompts (1–7)

```
<role>
You are a startup execution coach building the 90-day launch sprint plan for a solo operator taking Sourcera to market. You have access to all the strategy documents produced by the previous prompts. Your job is to compress everything into a week-by-week execution plan that one person can actually follow — with specific tasks, time allocations, milestones, and decision points.
</role>

<context_loading>
Read ALL of these files:
1. /sessions/upbeat-practical-maxwell/mnt/Sourcera/Sourcera_Master_Spec.md — Current product authority; read §1, §2, §13, §21, §22, §27, §34, §48, and §49
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
- Product readiness (what needs to work vs. what can ship later)
- Website/landing page requirements
- Legal (ToS, privacy policy, DPA, BAA)
- Billing setup (Stripe configuration)
- Analytics setup (PostHog events, conversion tracking)
- Content assets ready (first 5 blog posts, LinkedIn profile, email sequences)
- Sales assets ready (demo script, proposal template, security questionnaire)
- Marketplace seed content (minimum seller profiles)

SECTION 2: PRE-LAUNCH (Weeks -4 to 0)
The four weeks before public launch:
- Week -4: Soft launch prep — what to build, who to tell
- Week -3: Beta user recruitment — who to invite, how to onboard, what feedback to gather
- Week -2: Content pipeline loaded — publish first posts, start LinkedIn cadence
- Week -1: Launch prep — PR, Product Hunt listing draft, community seeding
- Daily tasks with estimated hours

SECTION 3: LAUNCH WEEK (Week 1)
Day-by-day plan:
- Which channels to activate on which days
- Product Hunt launch playbook (timing, community support, how to handle HN)
- Announcement posts and emails
- Response plan for inbound interest
- What to monitor and when to react

SECTION 4: POST-LAUNCH WEEKS 2–4 (Month 1)
Weekly breakdown:
- What to double down on based on launch week signals
- Outbound sales activation
- Content cadence establishment
- First growth experiments to run
- Weekly metrics review ritual
- Milestone: [specific metric targets for end of Month 1]

SECTION 5: MONTH 2 (Weeks 5–8)
Weekly breakdown:
- Scaling what worked in Month 1
- Second wave of growth experiments
- Seller-side acquisition push
- First customer case study development
- Pipeline building for Enterprise
- Milestone: [specific metric targets for end of Month 2]

SECTION 6: MONTH 3 (Weeks 9–13)
Weekly breakdown:
- Optimization phase: double down on top 2 channels
- First Enterprise deal pursuit
- Community building acceleration
- Content compounding effects
- Marketplace liquidity assessment
- Milestone: [specific metric targets for end of Month 3]

SECTION 7: SOLO OPERATOR TIME BUDGET
A realistic weekly time allocation across all GTM activities:
- Map every hour of a 50-hour work week
- Include: product work (bug fixes, feature polish), sales, marketing, content, admin
- Show how the allocation shifts from Month 1 (heavy on setup) to Month 3 (heavy on sales + content)
- Include "protected time" blocks for deep work

SECTION 8: METRICS DASHBOARD
The exact metrics to track, organized by cadence:
- Daily: [list with source/tool]
- Weekly: [list with source/tool]
- Monthly: [list with source/tool]
- The 3 North Star metrics that matter most at this stage
- Leading indicators that predict lagging outcomes
- Red/yellow/green thresholds for each metric

SECTION 9: DECISION GATES
Built-in decision points where the operator evaluates and pivots:
- End of Week 2: Is the ICP responding? If not, what to change.
- End of Month 1: Which channel is working? Where to reallocate time.
- End of Month 2: Is there a path to $10K MRR in 6 months? If not, what changes.
- End of Month 3: Full strategy review — what to keep, kill, and double down on.

SECTION 10: FAILURE MODES & CONTINGENCIES
For each of these scenarios, define the response:
- "No one signs up for Free" — what to do
- "Free users don't convert to paid" — what to do
- "Enterprise interest but no close" — what to do
- "Sellers won't build profiles" — what to do
- "Content isn't driving traffic" — what to do
- "Outbound isn't getting replies" — what to do
</deliverable>

<anti_drift>
- This must be a SPECIFIC plan, not a framework. Name the exact tasks, the exact hours, the exact metrics.
- All time estimates must add up to ≤50 hours/week. If they don't, cut something.
- Reference specific tactics from GTM_GROWTH_TACTICS.md by name in the weekly plans.
- Reference specific content pieces from GTM_CONTENT_ENGINE.md in the content schedule.
- If compacted: re-read all GTM files and resume from the next incomplete section.
</anti_drift>
```

---

## Execution Checklist

| # | Prompt | Produces | Duration | Dependencies | Parallel? | Status |
|---|--------|----------|----------|-------------|-----------|--------|
| 0 | Update Project Instructions | — | 5 min | None | — | ☐ |
| 1 | Strategic Foundation & Positioning | GTM_POSITIONING.md | 2–3 hrs | Prompt 0 | No | ☐ |
| 2 | PLG Motion & Conversion Architecture | GTM_PLG_ARCHITECTURE.md | 1.5–2 hrs | Prompt 1 | No | ☐ |
| 3 | Solo Operator Sales Playbook | GTM_SALES_PLAYBOOK.md | 2–3 hrs | Prompts 1+2 | No | ☐ |
| 4 | Content & Inbound Growth Engine | GTM_CONTENT_ENGINE.md | 1.5–2 hrs | Prompt 1 | Yes (with 5,6) | ☐ |
| 5 | Network Effects & Marketplace Growth | GTM_NETWORK_EFFECTS.md | 1.5–2 hrs | Prompt 1 | Yes (with 4,6) | ☐ |
| 6 | Growth Hacking & Viral Mechanics | GTM_GROWTH_TACTICS.md | 1–1.5 hrs | Prompts 1–3 | Yes (with 4,5) | ☐ |
| 7 | Pitch Deck Creation | Sourcera_Pitch_Deck.pptx | 2–3 hrs | Prompts 1+3 | No | ☐ |
| 8 | Launch Sequence & 90-Day Sprint | GTM_90DAY_SPRINT.md | 1.5–2 hrs | All previous | No | ☐ |

**Fastest path:** Run 1 → 2 → 3, then run 4+5+6 in parallel, then 7 → 8. Total elapsed time: ~12 hours.

---

## What Each Prompt Produces

When all 8 prompts are complete, you'll have:

| File | What It Is | How You Use It |
|------|-----------|----------------|
| GTM_POSITIONING.md | ICP, personas, messaging, competitive positioning, category definition | Foundation for all marketing copy, sales conversations, and investor pitches |
| GTM_PLG_ARCHITECTURE.md | Free-to-paid conversion design, activation flows, PQL scoring | Product decisions, onboarding optimization, Stripe configuration |
| GTM_SALES_PLAYBOOK.md | Complete founder-led sales system with scripts, emails, demo playbook | Daily sales execution — prospecting, demoing, closing |
| GTM_CONTENT_ENGINE.md | SEO strategy, content calendar, LinkedIn playbook, lead magnets | Weekly content production and distribution |
| GTM_NETWORK_EFFECTS.md | Marketplace strategy, cold start tactics, seller acquisition | Strategic decisions about marketplace investment and sequencing |
| GTM_GROWTH_TACTICS.md | 20+ ranked growth experiments with success/kill criteria | Experiment queue — run one per week, measure, decide |
| Sourcera_Pitch_Deck.pptx | Professional slide deck for investors, partners, and enterprise sales | Fundraising, partnerships, formal sales presentations |
| GTM_90DAY_SPRINT.md | Week-by-week execution plan with time budgets and decision gates | Your operating system for the first 90 days |
