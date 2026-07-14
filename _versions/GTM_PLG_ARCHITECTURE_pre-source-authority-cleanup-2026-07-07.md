# GTM PLG Architecture — Operational Execution Plan

**Version:** 1.0
**Status:** Active recommendation — solo-operator-runnable
**Date:** 2026-04-20
**Source-of-Truth:** `Sourcera_Master_Summary.md` v1.1 §2–§3, §6.10, §6.13.7, §6.15.1, §6.16.6, §6.28 · `Sourcera_Seller_Pricing_Strategy.md` v2 §1–§20 · `Sourcera_Buyer_Pricing_Strategy.md` v2 §4–§10, §12 · `GTM_POSITIONING.md` §1–§3
**Purpose:** Design the operational execution of Sourcera's already-specified PLG surface — four entry paths, two activation architectures, every conversion trigger, the 17 growth mechanics (M1–M17), the 10 core loops, a PQL scoring model, and the self-serve monetization plumbing.
**Anti-drift:** No new growth mechanics invented. Every pricing number matches source docs. Every capability referenced is cataloged in `Sourcera_Master_Spec.md §21.4` or `§6.12.2`. Where a surface is silent on an operational question, the gap is flagged as *Authored Extension* and tagged for human sign-off.

---

## Table of Contents

1. PLG Viability Assessment by Entry Path
2. Buyer-Side Activation Architecture
3. Seller-Side Activation Architecture — The Hero Moment
4. Conversion Trigger Architecture
5. The 17 Growth Mechanics — Operational Execution Plan
6. The 10 Core Growth Loops — Measurement Framework
7. PQL Scoring Model
8. Self-Serve Monetization Mechanics

---

## SECTION 1 — PLG Viability Assessment by Entry Path

Sourcera has four distinct entry paths. Each has a different activation complexity, a different time-to-value, a different natural expansion trigger, and a materially different expected conversion rate. The pricing model, onboarding surface, and growth-mechanic catalog all sit downstream of this framing — so the first act of the GTM plan is to name the four paths explicitly and commit to investing against them in the right order.

### 1.1 Path Summary Table

| # | Entry path | Console(s) entered | Arrival state | Time-to-value (TTV) | Activation complexity | Natural expansion trigger | Expected Free→Paid conversion range |
|---|---|---|---|---|---|---|---|
| A | **Buyer signs up for Free** (self-serve evaluation) | Buyer | Investigative, 60-second intent | 3–10 days to first Pre-Score across 3+ vendors | Medium — template pick, vendors imported, requirements authored | $5 AI budget exhausted · 2nd evaluation needed · Opus-gated capability attempted | **8–14%** at 90 days |
| B | **Seller arrives via buyer invite** (Forced Signup — M1 / M5 / M15 / M17) | Seller | Peak pain, involuntary, deadline-carrying | p50 < 20 min from magic-link to first submitted response (§14.2 Seller Pricing) | Low — bootstrap runs inside SSO redirect latency; landing screen pre-populated | 2nd concurrent bid · 1st EOI · KB 50-entry ceiling (three conversion moments, §14.3 Seller Pricing) | **18–28%** at 90 days — the single highest-yield channel in the product |
| C | **Seller signs up organically** (direct signup, SEO, content, referral, Ghost-Bid Import) | Seller | Investigative, self-directed | 1–3 sessions to first published Capability Declaration or first Ghost-Bid Import | Medium-high — profile complete, KB seeded manually or via first lifetime bootstrap, Capability Declarations authored, first EOI attempted | EOI monthly volume · KB-ceiling · Match Score gate (Growth+) · CRM Sync request (Growth+) | **5–9%** at 90 days; often jumps straight to Starter or Growth with pre-existing RFP volume |
| D | **SEO discovery** (M9 Category Pages, M10 How-to-Evaluate Guides, M11 Comparison Pages, M12 Market Intelligence, M13 Heat Map) | Depends on landing intent — buyer or seller | Cold, high-intent, category-research mode | Session-length to first signup action (bounce or convert within 90 seconds) | Low — a single CTA routes the visitor into Path A, B-equivalent, or C | Once routed into A/B/C, inherits that path's expansion triggers | **1–3%** of SEO sessions convert to signup; 60–75% of those convert to Path A or C paid journeys |

### 1.2 Path A — Buyer Signs Up for Free (Self-Serve Evaluation)

**Arrival state.** A procurement specialist, an internal champion ("Jordan" in `GTM_POSITIONING.md §2.5`), or a line-of-business leader running a single evaluation in the next 60 days (Wedge Buyer ICP, `§1.1.1`). Trigger events concentrated around auditor findings, failed prior evaluations, new compliance mandates, or an upcoming $1M+ TCO purchase (ranked in `§1.1.2`).

**Time-to-value.** TTV is measured from signup to first Pre-Scoring run across ≥3 vendors. Target: **p50 < 72 hours, p90 < 10 days.** The constraint on TTV is not AI availability — the Pre-Scoring capability is Sonnet-tier and returns in seconds — it is the cold-start cost of composing the evaluation matrix. The design lever is Template Library (§6.10) and Buyer Template Discovery (§6.10.2).

**Activation complexity — medium.** Five sub-tasks sit between signup and Pre-Score:

1. Pick a template or create blank Workspace.
2. Import vendors (manual, CSV, Marketplace).
3. Confirm/amend the Requirements inherited from template.
4. Invite or solicit vendor responses (or upload stub responses to Pre-Score against).
5. Trigger the first Pre-Scoring capability.

Each sub-task is self-serve; none requires Sourcera intervention. The friction is the honest one — the buyer must have a real evaluation in their head before Sourcera can help. Buyers without a live evaluation in-flight will bounce; the aha moment is designed to land only when a real evaluation exists.

**Natural expansion triggers.** In order of frequency:

1. Second evaluation attempted (Free ceiling = 1 active) → Starter
2. Vendor-tracked count approaches 25 cap → Starter
3. AI budget exhausted before evaluation closes (particularly on Policy Parsing or Deep Comparison, which are Opus-tier and consume the $5 Free budget in one run) → Starter
4. Opus-tier capability attempted on Free → Starter gate
5. KB items approach 50 cap as Phase 13 KB-sync runs populate the KB

**Expected Free→Paid conversion.** 8–14% at 90 days — consistent with mid-funnel PLG benchmarks for mid-market B2B SaaS where the Free tier is meaningfully capable but structurally ceilinged. The upper bound of the range assumes buyer-side onboarding meets its 72-hour TTV target; the lower bound assumes the target slips to 10–14 days.

**Investment priority.** This is the marquee self-serve path and the primary path for the Wedge Buyer ICP. It must be perfect at launch: templates seeded, Template Discovery visible in Workspace creation, the 7-step Buyer Onboarding flow (C.121) working in ≤90 seconds.

### 1.3 Path B — Seller Arrives via Buyer Invite (Forced Signup)

**Arrival state.** A vendor at peak pain: incoming RFP, deadline, no chosen tool, blank response to write, zero existing workflow to defend. Delivery surfaces: M1 (Vendor-Invite-Creates-Account), M5 (Buyer-Pull Vendor Invite), M15 (Ghost-Bid Importer), M17 (Buyer-Funded Pro Trial Seat). `GTM_POSITIONING.md §1.2.3` explicitly separates this as a distinct ICP from organic seller signup — different message, different onboarding, different expected tier.

**Time-to-value.** Measured in the seller activation metric defined in `§14.2` of Seller Pricing Strategy: *minutes from magic-link click to first submitted requirement response.* Target: **p50 < 20 min, p90 < 60 min.** This is the single most-important PLG metric in the product; the Hero Moment (§3.6 Master Summary, §14.1 Seller Pricing) exists to collapse the 2-day status-quo to 30 seconds of latency hidden behind a progress bar.

**Activation complexity — low, structurally.** The onboarding surface is architected so the seller cannot complete signup without experiencing the Hero Moment (`§6.28.2` Master Summary). Specifically:

- No form, no company profile prompt, no credit card, no role selection.
- Domain + invite identity is enough.
- Domain Bootstrap fires inside SSO redirect latency.
- Landing screen pre-populates with KB proposals, first-pass draft, and progress strip before the seller touches anything.

The seller's first action is *review*, not configure. This is the single largest activation-friction reduction in the product.

**Natural expansion triggers — the three conversion moments.** Each is tuned to a different buying reason (§14.3 Seller Pricing):

1. **Second concurrent bid** — urgency, "my deal is at risk"
2. **First EOI attempt** — ambition, "I want to find more deals"
3. **KB ceiling at 50 entries** — investment, "I don't want to lose what I've built"

**Expected Free→Paid conversion.** 18–28% at 90 days. The range reflects two variables: the M1-effectiveness rate (% of Free sellers who receive a second buyer invitation within 30 days — a leading indicator in `§14.5` Seller Pricing) and the hero-moment acceptance rate (% of Free sellers whose KB Bootstrap generates ≥40 approved entries — a second leading indicator in `§14.5`). A mature Sourcera instance with Marketplace liquidity should clear the upper bound of the range; a cold-start Marketplace in the first six months will land nearer the lower bound because second invitations will be scarce.

**Investment priority.** Highest. This is the supply-side flywheel. Every hour spent improving Hero Moment latency, KB-proposal acceptance rate, or the three-conversion-moments upgrade copy returns more than the equivalent hour on any other surface.

### 1.4 Path C — Seller Signs Up Organically

**Arrival state.** Investigative — the seller found Sourcera via SEO (M9/M10/M11), a published Seller Profile (§6.15.1), a Selection Report social share (M2), a Sourcera badge (M3), a bid-success share (M14), a referral (M16), or organic content. They are evaluating RFP tooling; they may also be evaluating Responsive or Loopio.

**Time-to-value.** 1–3 sessions to one of three first-value artifacts: (a) a published Seller Profile and first Capability Declaration, (b) a successful Ghost-Bid Import seeding the KB from a prior RFP, or (c) a first EOI submission (Starter+ only). Target: **first value artifact in session 1 for 55% of Organic Path arrivals; by session 3 for 85%.**

**Activation complexity — medium-high.** The seller must consciously build the KB in the absence of a specific buyer invite forcing the issue. The single most effective unlock here is Ghost-Bid Importer (M15) — pasting a historical RFP and letting the Ghost-RFP Ingestion capability (Opus, $25 value/RFP) seed the KB in one session (`§1.2.2` trigger event #5 in `GTM_POSITIONING.md`).

**Natural expansion triggers.** EOI monthly volume, KB-ceiling, Match Score gate (Growth+), CRM Sync request (Growth+). Because organic sellers often arrive with pre-existing RFP volume, many jump directly from Free to Starter or Growth rather than traversing the ladder — the conversion moment is compressed because the business case is already built on arrival.

**Expected Free→Paid conversion.** 5–9% at 90 days. Lower than Path B because the forcing function is absent, higher than typical B2B SaaS because the Wedge ICP for Organic Seller is a vendor with a specific current pain (response latency, proposal manager attrition, Loopio renewal in next 90 days — ranked in `GTM_POSITIONING.md §1.2.2`).

**Investment priority.** Medium. Important for diversification (not all seller acquisition should come through buyer invites — a healthy funnel needs both), but each Organic-Path activated seller is a fraction of the value of a Forced-Signup seller in the first 90 days. Organic sellers pay for themselves through the seller flywheel (§18 Seller Pricing) over 6–12 months, and provide Marketplace inventory that compounds regardless of conversion.

### 1.5 Path D — SEO Discovery

**Arrival state.** Cold, high-intent, category-research mode. Landing surfaces are all content assets the Agent produces and the Platform Marketing cost center owns — never billed to a customer:

- **M9 Category Pages** — "Best HRMS for Mid-Market," "Best SIEM for Regulated Industries," etc. k-anonymity floor k=5 (`C.67`).
- **M10 "How to Evaluate [X]" Guides** — long-form buying guides, draft-generated via `guide_draft_generation` capability, refreshed via `guide_refresh_analysis` (`C.68`).
- **M11 Software Comparison Pages** — AI-generated head-to-head comparisons with Vendor Opt-Out honored (`C.69`, `C.123`).
- **M12 Aggregate Market Intelligence Reports** — quarterly k-anonymized reports (k=20 floor) (`C.70`).
- **M13 Public Marketplace Heat Map** — anonymized category-level demand visualization (`C.71`).

**Time-to-value.** Immediate for the reader; session-length to the first signup action. Bounce-or-convert happens in the first 90 seconds of the landing page. Every page surfaces two clear CTAs: *"Start a free evaluation"* (routes to Path A) or *"Claim this listing"* / *"Get listed in [category]"* (routes to Path C).

**Activation complexity — low.** A single CTA routes the visitor into Path A, B-equivalent, or C; from there, each path's activation applies. SEO is a funnel feeder, not an activation surface.

**Natural expansion triggers.** Inherited from the path the visitor routes into.

**Expected Free→Paid conversion.** 1–3% of SEO sessions convert to signup; 60–75% of those activated signups convert to Path A or C paid journeys inside the normal timeframes. Directionally: a Category Page that drives 10,000 monthly sessions yields 100–300 signups and 6–23 paid customers over 90 days.

**Investment priority.** Medium at launch, high by month 3. SEO compounds. First-mover advantage per category is disproportionate because Google rewards depth and consistency. M9+M10+M11+M12+M13 collectively build the organic-search moat per category that `§3.4 Master Summary` names as the single largest structural defense against Gartner/G2. The category-seeding strategy in `GTM_POSITIONING.md §1.3` sequences the content build — Security/GRC first, then Data & Analytics, then DevOps, etc.

### 1.6 Path Prioritization for Year 1

Given a solo operator and fixed engineering capacity:

1. **Launch critical (weeks 0–4):** Path B (Seller Forced Signup) — Hero Moment must be surgically perfect. Path A (Buyer Free) — 7-step onboarding with template seeding. Without these, the product has no PLG engine.
2. **Launch + 30 (month 2):** Path D seed — M9 Category Pages for top 3 seed categories (Security/GRC, Data & Analytics, DevOps) plus M10 How-to-Evaluate Guides for the top 6 sub-categories inside Security/GRC. These have the longest compounding time — publish early, iterate monthly.
3. **Launch + 60 (month 3):** Path C (Seller Organic) — Ghost-Bid Importer polished, first-pass signup flow for direct seller signups, referral mechanic (M16) activated, Seller Bid Success Share (M14) ready.
4. **Launch + 90 (month 4):** Full M11 Comparison Pages and M13 Heat Map live; Path D compounding returns begin to show in Search Console.

*Authored Extension — requires human sign-off:* The expected-conversion ranges in this section are judgment calls calibrated against mid-market B2B SaaS PLG benchmarks (Linear, Loom, Notion) and the structural advantages of the Forced-Signup channel. They are not sourced from Sourcera's own data (none yet exists). Treat them as targets, not forecasts, and recompute from cohort data after the first 500 Free signups on each path.

---

## SECTION 2 — Buyer-Side Activation Architecture

Buyer-side activation is designed to deliver the aha moment — the first Pre-Scoring run across ≥3 vendors — in under 72 hours. The $5 AI budget is sized precisely to cover this (`§4 Buyer Pricing`, `§8.4 GTM_POSITIONING`). The surface that delivers it is `§6.28.1 Buyer Onboarding` (Master Summary) and `C.121 Buyer Onboarding 7-Step Flow`.

### 2.1 The Signup Flow — 60 Seconds to First Evaluation

**Step 1 — Landing / Signup (0–10s).** Google SSO or Microsoft SSO via WorkOS (`§6.23.1`). No password, no email verification delay (SSO-provided), no credit card, no company-size field, no role-picker modal. Email domain is captured from the SSO identity.

**Step 2 — Org Provisioning (10–15s).** Domain auto-suggest creates the Organization. If the domain matches an existing claimed-domain Org (`C.104 Domain Claiming & Verification`), the new user is routed into that Org as a pending-approval member via M6 (Domain-Based Auto-Join). Otherwise, a new Org is created with the user as Org Owner. Data residency defaults to US; EU inferred from SSO locale hints (manual override available on Enterprise later).

**Step 3 — Welcome Screen (15–25s).** A single full-screen surface: *"Run your first evaluation."* Three primary CTAs:

1. **"Pick a template"** — opens Template Discovery (§6.10.2) filtered by the Seed Category list in `GTM_POSITIONING.md §1.3.1`.
2. **"Paste a starting RFP"** — opens a Markdown paste surface; the Agent's `requirement_extraction` capability drafts a Workspace from the pasted content.
3. **"Start blank"** — creates an empty Workspace and opens the first Use Case creation flow.

No pricing page is shown at this step. No modal tour blocks the surface.

**Step 4 — First Workspace Created (25–45s).** The chosen CTA creates the first Workspace. Phase auto-sets to Phase 1 (Stakeholder Alignment & Discovery). The Workspace is named from the template (if picked) or left as *"Untitled evaluation"* for inline rename.

**Step 5 — First-Run Tour (45–60s).** A lightweight, dismissible 3-step overlay teaches:

1. `Cmd+K` — the universal accelerator (§5 Master Summary).
2. Inline edit on any requirement row.
3. The phase sidebar — where to advance the evaluation.

The tour is skippable; it does not block navigation. Dismissal is persisted at the user level.

**Step 6 — The Workspace (60s+).** The user is dropped into their Workspace, Phase 1. Empty-state copy on the Requirements list: *"Requirements come from your template — edit or add yours. Ready to invite stakeholders? Try Cmd+K → 'Invite.'"*

**Banned in the signup flow** (inherited from `§3.6 Master Summary` seller-side anti-patterns, adapted for buyer-side):

- No credit card ask anywhere before upgrade-intent click
- No "activate Pro trial" modal on first login — the Free plan is a real product (§8.3 GTM_POSITIONING)
- No pricing page before the first Pre-Scoring run
- No role-picker modal — the user's RBAC role is inferred from Org Owner on creation and refined at first stakeholder invite
- No team-invite gate before first Workspace creation — single-user setup is valid at Phase 1

### 2.2 The Aha Moment — First Pre-Scoring Run Across 3+ Vendors

The buyer aha moment is the moment Sourcera delivers a defensible scoring artifact a spreadsheet cannot produce. It is architected around three pre-conditions, a trigger action, and a post-action surface.

**Pre-conditions (the first 3 actions that guide to aha).**

1. **Action 1 — Template picked or requirements authored.** The Workspace has ≥20 Requirements. The Template Library (§6.10) accelerates this — the Sourcera-curated templates seeded at Org creation (C.37) include full requirement sets for each Seed Category. Without a template, the user must write 20 Requirements manually, which is the single largest friction point on the buyer path.
2. **Action 2 — 3+ vendors imported into the Workspace.** Three import surfaces: manual add, CSV import, or Marketplace add (EOI-accepted vendor). The `vendor_invite_suggestion` capability (Sonnet, §6.12.1 capability #6) suggests vendors based on the requirement set and the Workspace's category tags, consuming a small fraction of the $5 AI budget.
3. **Action 3 — Responses in-hand for scoring.** Sourcera supports three response-acquisition modes: (a) invite vendors through the Marketplace / manual invite with a response deadline, (b) paste vendor-submitted Word/PDF responses and let the `evidence_parsing` capability extract structured answers, (c) mock responses for solo dry-run (used by auditors and champions doing internal dry runs). All three are free of AI cost for the carrying workflow; Evidence Parsing consumes budget but is the highest-accepted-rate capability on the buyer side.

**Trigger action — first Pre-Scoring run.** The Pre-Scoring capability (`§6.12.1` capability #10, Sonnet, Phase 10) is the single largest buyer-side AI value proof. It reads the requirement + vendor response + supporting evidence and drafts a suggested grade (FM/PM/DNM/EX on the §4 Master Summary rubric) with a confidence score and a cited sentence from the vendor response.

When the user clicks *"Pre-Score all"* on their first Phase 10 entry, the Agent batches the entire Use Case and returns suggested grades in <20 seconds for a typical 40-requirement Use Case across 3 vendors (120 cells). Cost: approximately $0.50 × 120 = $60 in value-pricing terms, but only a fraction bills since not every cell accepts (70/30 accept/reject mix typical). Free tier's $5 budget covers approximately 10 Pre-Scoring runs against typical matrices — enough for a first aha and most of a full Phase 10 cycle on a small evaluation.

**Post-action surface — the aha.** After the Pre-Scoring run:

- The scoring matrix populates with grades, confidence, and *"cited by: [response quote]"* inline.
- A **Disagreement Insight Card** (§6.12.1 capability #11) surfaces: *"3 scorers on your team have historically graded 'Data Encryption at Rest' at a wider spread (0.5 variance). Sourcera flagged this Requirement for calibration discussion."*
- A **Time-Saved Baseline** counter (§6.36 Master Spec) displays: *"This Pre-Scoring run saved approximately 4.3 hours vs. manual scoring. Cumulative time saved this evaluation: 4.3h."*
- A single, non-modal upgrade CTA appears only if the Pre-Scoring run consumed >50% of the remaining $5 budget: *"You've used $3.20 of your $5.00 Free plan AI budget. Running Pre-Scoring across one more Use Case will likely exhaust it. Starter extends your AI budget to $50/mo and unlocks 5 concurrent evaluations — Free keeps working, just with smaller budgets."*

### 2.3 Activation Metric and Target

**Primary activation metric:** *Days from buyer signup to first Pre-Scoring run across ≥3 vendors.*

**Target:** p50 < 3 days, p90 < 10 days. This is the direct buyer-side analog of the seller activation metric (§14.2 Seller Pricing). It is the metric that governs the Buyer Onboarding surface, the Template Library investment, and the Evidence Parsing UX.

**Secondary activation metrics:**

- % of buyer signups that reach Phase 10 within 14 days (primary)
- % of Free signups that consume ≥60% of the $5 AI budget within 30 days (quality signal — the budget is sized to be spent)
- % of signups that hit any Free ceiling within 90 days (predicts conversion)
- Days to first vendor invited (measures Marketplace-feeder behavior; see M1 effectiveness in §5)
- Days to first Stakeholder Read-Only Invite sent (measures M1 buyer-side effectiveness)

### 2.4 Template Library and Template Discovery as Activation Accelerators

The Template Library (§6.10) and Buyer Template Discovery (§6.10.2) exist for one reason: to eliminate the 20-Requirement blank-page cost. `GTM_POSITIONING.md §1.3.1` defines the Seed Categories; each needs a Sourcera-curated template on day one. The operational requirements:

**Pre-launch template seeding (C.37):**

- **Security/GRC** (rank 1 category, 200+ seller-density target per §1.3.1): 4 curated templates — SIEM, SOAR/XDR, IAM/PAM, CSPM. Each with 60–120 requirements, each tagged to the appropriate Capability Declaration taxonomy.
- **Data & Analytics** (rank 2): 4 templates — BI platforms, CDPs, reverse ETL, data observability.
- **DevOps & Platform Engineering** (rank 3): 3 templates — CI/CD, IaC, observability.
- **Revenue Operations** (rank 4): 3 templates — CRM-adjacent, sales engagement, revenue intelligence.
- **HRIS / HR-Tech** (rank 5): 3 templates — HRIS, ATS, LMS.
- **AI Infrastructure & Tooling** (rank 6): 2 templates — LLM orchestration, AI observability / evals.

Total: **19 curated templates by launch,** building to 40+ templates by month 6 as Seller Templates (6.10.1) are published into the Marketplace and seller-authored templates enter Buyer Template Discovery.

**Template Discovery placement (C.37, C.38, C.39):**

- Prominent placement in the signup flow Welcome Screen (Step 3 above).
- Always accessible via Workspace Creation modal.
- Accessible from `Cmd+K` with fuzzy search.
- Sidebar surface in Phase 1 (Stakeholder Alignment) with *"Missing requirements? Pick from a template."*

Each template card shows:

- Template name, category, ~requirement count
- Clone count (vanity signal — grows organically over time)
- Authoring seller + verification tier (for M9 Template Publish Incentive — seller-authored templates carry clone-through attribution)
- One-click *"Clone into new Workspace"* action
- Drill-down preview showing first 10 requirements

**Template as activation accelerator — impact.** Internally, a template-started Workspace should reduce time-to-first-Pre-Score from a targeted p50 of 3 days (blank-start) to p50 of <24 hours. A buyer who clones the SIEM template, imports 3 vendors from a Marketplace category filter, and pastes three vendor responses should hit aha within a single multi-hour session. Templates are the single largest activation accelerator on the buyer side and must ship at launch.

---

## SECTION 3 — Seller-Side Activation Architecture — The Hero Moment

The Hero Moment is spec'd end-to-end in `§3.6 Master Summary`, `§14.1 Seller Pricing`, and `§6.28.2 Master Summary` (Seller Onboarding Experience — seven stages). This section translates spec into operational execution — what engineering ships, what Ops configures, what Marketing writes, and how we ensure p50 < 20 min from magic-link to first submitted response.

### 3.1 Pre-Arrival Preparation (Hidden from Vendor)

Everything below happens *before* the seller clicks the magic-link in their email. The buyer-side invite trigger fires a background job chain on the Sourcera platform.

**Trigger.** Buyer invites a vendor via M1 (Vendor-Invite-Creates-Account from Phase 3/4 of their Workspace), M5 (Buyer-Pull Vendor Invite — anonymous templated outreach, `C.63`), or M17 (Buyer-Funded Pro Trial Seat grant, `§15.5 Seller Pricing`). Invite payload carries: `bid_id`, invite target email, buyer Workspace summary, invite signature, and the `seller_domain_hint` derived from the recipient email domain.

**Background steps (t = –N minutes to 0):**

1. **Domain enrichment.** `external_vendor_lookup` (Haiku, §6.12.2) resolves the email domain to public records: company name, industry, HQ region, approximate headcount. Caches to `seller_org_prefill_cache` keyed by domain. Idempotent — reruns do not charge.
2. **Marketplace Tagger** (internal capability, not customer-billed — `sourcera_owned` cost center): assigns probable category tags from domain + buyer evaluation context (the buyer's Use Case category tags). Populates a suggested set of 1–3 Capability Declarations the seller is likely to claim on publish.
3. **Bootstrap queue pre-warming.** The platform resolves the seller's likely public URLs — homepage, help center, docs, trust center, security page — against Firecrawl rate-limit budgets. URLs are queued but not yet crawled. Firecrawl concurrency budget is reserved against the Opus-tier `kb_bootstrap` capability.
4. **Invite email delivery** via Loops.so (`§6.29`). Email subject line: *"You've been invited to respond to [Buyer Company]'s [Category] evaluation."* Email body emphasizes what will happen on click — *"Your response will be drafted from your public documentation in about 2 minutes."* — signaling the Hero Moment before the seller clicks.

**Pre-arrival target.** 100% of invites have enrichment + tagger + URL-resolution completed before the magic-link is clicked. P99 latency on enrichment: <15 seconds after buyer-side invite fires. Below this floor, the Hero Moment degrades to cold-start bootstrap (~90s perceived latency instead of ~60s).

### 3.2 The 0–3 Minute Onboarding Flow

The seven-stage flow in `§6.28.2 Master Summary` structures the first session. Operational detail per stage:

**Stage 1 — Magic-Link Arrival (t ≈ 0s).** The seller clicks the magic-link. The landing page renders an unauthenticated preview of the buyer's published RFP summary plus a single primary action: *"Accept this bid and draft your response in 3 minutes."* Behind the scenes, the page also exposes a preview of the bid's category tags and the buyer's company name (from the buyer's public-facing Marketplace Listing summary). No signup form is visible until the CTA is clicked.

Fallback: expired or revoked link → generic Marketplace-style browse with *"This invite is no longer active. You can still list your company on Sourcera."* routing into Path C (Organic Seller Signup).

**Stage 2 — Signup + Domain Bootstrap (t ≈ 10–45s).** Primary CTA triggers Google/Microsoft SSO via WorkOS magic-link. Concurrently, the pre-warmed `kb_bootstrap` capability (Opus, `C.57` Skill) fires against the resolved URLs. Crawl runs in background. Authentication-side latency is typically 3–8 seconds; crawl-side latency is 30–90 seconds depending on URL count and target site responsiveness. The seller reaches Stage 3 in under 45 seconds regardless of crawl status — partial crawl completion is acceptable for landing, because the first-pass draft can still surface what has completed and label the rest *"still crawling..."*

**Stage 3 — Landing on the Bid Workspace (t ≈ 45s–3min).** The seller lands on the Bid Workspace for the invited bid. Three surfaces are pre-populated before first interaction:

- **Draft KB panel.** 40–200 entries proposed by the Domain Bootstrap in `Draft` state (not yet `Active`). Each entry carries a confidence score (0.0–1.0), a provenance URL (`from: yourcompany.com/trust/soc2`), and a one-line preview.
- **First-pass response panel.** The `first_pass_responses` capability (Sonnet / Managed Agent, §6.12.2) has drafted responses to every requirement the KB crawl could ground. Typical coverage: 40–70% of requirements have high-confidence drafts; 30–60% flagged as *"needs your input."* Each drafted response cites 1–3 KB entries by inline citation (*"from: yourcompany.com/security/penetration-testing"*).
- **Progress strip at top.** *"KB proposed: 31 entries · Response drafted: 18 of 24 requirements · Missing: 6 requirements (needs your input) · AI budget used: $1.47 of $5.00"*

Stage 3 is the critical measurement moment. Instrumentation emits a PostHog `stage_3_populated` event with stage transition timestamps.

### 3.3 The Progress Storytelling UI

Progress storytelling is the interstitial surface during Stages 2–3 while the Bootstrap and First-Pass capabilities complete. It must narrate actual work — every status line is true (`§3.6 Master Summary`, "no fabricated steps").

**Status line sequence (copy):**

| Elapsed | Copy | Trigger |
|---|---|---|
| 0–5s | *"Signing you in..."* | SSO round-trip in flight |
| 5–15s | *"Scanning yourcompany.com..."* | Firecrawl pulls homepage + obvious trust-center URLs |
| 15–30s | *"Found your security documentation..."* | First ≥10 KB entries staged |
| 30–60s | *"Drafting responses for [Buyer Company]'s 82 requirements..."* | First-pass draft capability fired |
| 60–90s | *"Almost ready — citing your own evidence on [N] of [M] requirements..."* | First-pass coverage computed |
| 90s+ | *"Your bid is ready to review."* | Landing screen renders |

Each line is emitted by the capability service as an event; the UI subscribes via Convex and renders sequentially. If a line's trigger fails (Firecrawl timeout, response capability error), the UI falls back to a generic *"Still working..."* with a retry option — it never fabricates a completed step.

**Landing counter (Stage 3 entry copy):**

> *"Your bid for [Buyer Company] is ready. **47** AI drafts prepared. **31** cite evidence from your website. Review time: **~35 min**."*

The headline numbers are the activation conversion drivers. The *"Review time: ~35 min"* number is a direct pitch to the seller's remaining time investment — it says "you can finish this today."

### 3.4 In-Workspace Value Proof (Minutes 3–45)

The Bid Workspace is the surface where the seller builds stake. Six operational surfaces reinforce the Hero Moment:

**1. Inline citations on every draft.** Every drafted response row shows its KB citation inline — *"from: yourcompany.com/trust/soc2"* with hover expansion showing the exact quoted sentence. This operationalizes the `§6.14.2` Master Summary "cite-before-state" rule. Engineering-level requirement: every drafted response stores a `citation[]` array with `source_url`, `source_quote`, `kb_entry_id`, and `confidence`. UI binds these to the inline citation chip.

**2. Three-button Accept / Edit / Reject per requirement.** Each click is an outcome signal for the resolver. Mapping:

- **Accept (no edit)** — strongest positive signal; records `outcome: accepted`, `edit_ratio: 0.0`; enters KB as verified response if `add_to_kb = true` toggle is on.
- **Edit and accept** — positive signal with measured edit ratio; `outcome: accepted` if edit ratio ≤30% (capability-specific threshold, per `§10 Seller Pricing`).
- **Reject** — negative signal; surfaces the KB-gap detector (below).

**3. Live budget counter.** Persistent at top-right of the Bid Workspace. Shows both value-dollars consumed and acceptance rate: *"AI budget used: $1.47 of $5.00 · 23 drafts accepted, 3 rejected."* Cost is visible but not alarming — the Free $5 budget is sized to cover exactly one bid end-to-end (`§14.1` Seller Pricing).

**4. KB-gap detector on reject.** When a draft is rejected, the empty state presents a 1-click KB-entry creation:

> *"No KB content answered this. Write your answer below and we'll save it as a KB entry."*
>
> [Inline text field]

The seller's inline answer is stored both as a response to the specific requirement *and* as a new KB entry. This mechanic converts every rejection into KB investment — rejections compound the KB the same way accepts do, just through a different action path.

**5. Subtle confirmation chip on accept.** Accepting with no edits surfaces *"added to your KB as verified response"* in a dismissable chip. Reinforces the KB-building mental model. The chip is subtle — no modal, no celebratory animation — to preserve the Linear-style design posture (§5 Master Summary).

**6. Missing-requirement fast-path.** Requirements where the KB crawl found no grounded answer are highlighted. A single-tap *"Answer with Agent"* button runs the `q_and_a_suggestion` capability against any available KB + the requirement text, drafts an answer for the seller's review, and applies the same accept/edit/reject flow. This collapses the manual-authoring burden on gaps to a second-pass AI drafting step.

### 3.5 Post-Submission Stake Reveal

On bid submit, the seller sees a full-screen reveal (`§15.4` Seller Pricing):

> *"You just built a reusable KB of **47** verified entries in **35 minutes**."*
> *"Your next bid will reuse them automatically."*
> *"Sourcera tracked **$1.47** of value pricing for the AI work on this bid (covered by your Free plan)."*

**Stake-reveal mechanics (6 surfaces, per §6.28.2 Stage 5):**

1. **Now-published seller profile URL** — the domain-verified profile at `sourcera.com/sellers/:slug` (§6.15.1 — Published-from-Day-One Default). Copy-link button present.
2. **Live KB count and health score** — 47 entries, 94% health per the Self-Governing Health Model (§6.13.4).
3. **KB Value Meter computed for the first time** — *"Your KB: 47 entries · 6 cited in this bid · Estimated value as reusable response library: $1,275/yr saved response time"* (§6.13.7, §17.3 Seller Pricing).
4. **Cross-bid citation graph preview** — which entries were used in this bid and will compound in future bids.
5. **One-click Seller Signals opt-in** — default: off. *"Opt in to receive buyer intent signals in your category. You can leave at any time."*
6. **Explicit, plain-language Upgrade Carry-Over Guarantee** — previewed for future reference: *"Your 47 KB entries, 2 in-flight bids, and 3 Capability Declarations carry over automatically when you upgrade. Your work is never lost."*

This is **not** an upgrade CTA. The three conversion moments (§14.3 Seller Pricing) come later when the natural ceilings hit. The stake-reveal is pure reinforcement — it says, *"look what you built, and look what you can take with you."*

**Success criterion per §6.28.2 Stage 5:** ≥70% of activated sellers dwell on this screen for >20 seconds. PostHog event: `stake_reveal_dwell_time` with seller_org_id, bid_id, dwell_ms.

### 3.6 The Onboarding Anti-Patterns (Banned, Reinforced)

The seller onboarding surface **must not** do any of the following — any deviation requires formal product review (mirrors `§3.6 Master Summary` and `§6.28.2`):

1. Ask for a credit card at any point before the first upgrade-intent click.
2. Require the seller to describe their company or industry before Domain Bootstrap runs.
3. Gate any feature behind a *"try Pro free for 14 days"* modal on first login — the Hero Moment is the pitch.
4. Show a pricing page until the seller has submitted their first bid.
5. Require manual Capability-Declaration authoring in the onboarding path — the Marketplace Tagger pre-populates 1–3 suggestions (§3.1 above); the seller can accept or edit later.
6. Gate the first-pass draft behind an Agent-budget configuration screen.
7. Show a modal tour that blocks the Bid Workspace surfaces.
8. Require profile-publish confirmation — publication is the default on domain verification (§6.15.1).
9. Require workspace naming — the first Workspace is the Bid Workspace for the invited bid.
10. Require team-invite flow before first bid submission.
11. Use dark patterns on upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency).
12. Present the upgrade offer during active bid work — only at natural completion points or ceiling events.

These bans exist because supply-side trust is the flywheel. Any friction that reads as sales-ey kills it. `§3.6 Master Summary`: *"the supply-side flywheel depends on vendors trusting Sourcera enough to let an AI touch their buyer's evaluation."*

### 3.7 Operational Levers to Ensure p50 < 20 min

The seller activation metric is *minutes from magic-link click to first submitted requirement response* (§14.2 Seller Pricing, §3.1b Master Summary, `C.135`). Target: **p50 < 20 min, p90 < 60 min.** Each of the following operational levers has a direct, measurable effect on this metric.

**Lever 1 — Pre-arrival crawl URL quality.** The bootstrap quality is capped by the URL list the pre-arrival job resolves. Operational: maintain a curated URL-pattern registry per category tag (trust-center URL patterns for SIEM vendors differ from those for HRMS vendors). Ops Console review of sampled new-seller crawls weekly, with manual URL-pattern additions where bootstrap coverage <40%. Target: ≥60% of new sellers have ≥40 Draft KB entries proposed after pre-arrival crawl.

**Lever 2 — First-pass draft coverage.** First-pass coverage is the leading indicator of p50 seller activation time. If coverage is <40% of requirements, the seller must draft from scratch on >60% of items and p50 slips to >60 min. Operational: weekly calibration of the `first_pass_responses` managed agent against a reference corpus of 10 seller-bid pairs with known outcomes. Adjust grounding thresholds if coverage drifts below 50%. Alert on-call when 7-day rolling coverage drops >10 percentage points.

**Lever 3 — Inline citation UI latency.** Every draft row renders the citation chip inline. If citation hover-expansion is slow (>500ms), seller edit rate climbs because sellers rewrite responses they would otherwise accept. Operational: P95 citation hover expansion ≤200ms; alert if exceeded.

**Lever 4 — KB-gap detector presence.** Sellers who reject a draft without the KB-gap detector take a median 4× longer per requirement to author a fallback response. Operational: the KB-gap inline field is a P0 UI component; if it fails to render on 1% of rejects, that is a P0 incident. Monitor via frontend instrumentation.

**Lever 5 — Magic-link SSO orchestrator health.** If the SSO redirect latency exceeds 8 seconds, sellers begin abandoning in Stage 2. Operational: P99 end-to-end SSO redirect ≤5s. Alert on-call if P99 >8s for 5 minutes.

**Lever 6 — Bid Workspace cold-start FCP.** First contentful paint on the Bid Workspace after Stage 2 completion must be ≤1.5s. If it exceeds 2s, seller perceived latency crosses a psychological threshold and p50 slips. Operational: Lighthouse-calibrated budget, enforced in CI/CD.

**Lever 7 — Progress storytelling line accuracy.** If a storytelling line shows *"Scanning yourcompany.com..."* but the crawler never actually started on that URL (rate-limited, wrong domain, or infra error), the seller's trust erodes on first interaction. Operational: each status line's emitting capability must emit a `status_claim_verified` event within 5s of display; if not, the line is replaced with a generic fallback. This is mandatory for the "no fabricated steps" guarantee.

**Lever 8 — Anti-spam & rate-limit guardrails that don't punish the hero moment.** The Signal Integrity Monitor (`C.100`) and Firecrawl rate-limiter must not throttle *bootstrap* crawls — they apply to *ongoing* crawls only. Operational: bootstrap crawls are flagged `source = hero_moment` and routed to a dedicated rate-limit pool; ongoing crawls use the shared pool. Without this separation, high-volume seller onboarding periods (e.g., post-launch buyer invitation surge) would degrade each new seller's Hero Moment.

### 3.8 Instrumentation Plan for Seller Onboarding

Every stage transition emits a PostHog event (`§6.28.2` Master Summary, Instrumentation). Event naming follows Appendix G (PostHog Event Taxonomy, Master Spec):

| Stage | Event name | Required properties |
|---|---|---|
| 1 | `seller_magic_link_landed` | invite_id, bid_id, buyer_org_id, seller_domain_hint, source (M1/M5/M15/M17) |
| 2 | `seller_sso_completed` | seller_org_id, elapsed_ms_since_arrival, auth_provider |
| 2→3 | `seller_bootstrap_started` | seller_org_id, urls_count |
| 2→3 | `seller_bootstrap_completed` | seller_org_id, entries_proposed, elapsed_ms |
| 3 | `seller_workspace_populated` | seller_org_id, bid_id, entries_proposed, drafts_coverage_pct, elapsed_ms_since_arrival |
| 4 | `seller_first_edit` | seller_org_id, bid_id, elapsed_ms_since_arrival |
| 4 | `seller_kb_entry_accepted` | seller_org_id, kb_entry_id, edit_ratio |
| 4 | `seller_kb_gap_detector_used` | seller_org_id, requirement_id |
| 4 | `seller_bid_submitted` | seller_org_id, bid_id, elapsed_min_since_arrival, entries_accepted, entries_rejected |
| 5 | `seller_stake_reveal_viewed` | seller_org_id, dwell_ms |
| 6 | `seller_outcome_debrief_viewed` | seller_org_id, bid_id, outcome (won/lost) |
| 7 | `seller_upgrade_cta_shown` | seller_org_id, trigger (second_bid / first_eoi / kb_ceiling) |
| 7 | `seller_upgrade_clicked` | seller_org_id, trigger, destination_plan |

The Seller Activation dashboard reports daily: funnel by stage, p50/p90/p99 elapsed time per stage, Stage 3 population success rate (P0 availability metric, alerts on-call if 90th-percentile Stage-3 population latency exceeds 10s per §6.28.2).

---

## SECTION 4 — Conversion Trigger Architecture

Conversion triggers are the moments Sourcera asks a Free user to pay. Every trigger in this section is spec'd in `§2.6 Master Summary` or `§14.3` of Seller Pricing. This section designs the *operational execution* — when to fire, what copy to show, where to place the CTA, and how to avoid the dark patterns the anti-pattern ban prohibits.

### 4.1 Buyer Free → Starter Triggers

Four structural triggers fire the Free → Starter upgrade conversation on the buyer side (`§2.6 Master Summary`). Each has a contextual, non-generic CTA placement and copy.

**Trigger 1 — Evaluation limit (1 active).** Fires when the user attempts to create a second Workspace while the first is still Active (pre-Phase 13).

- **Placement:** Inline, non-modal, at the moment of the second-Workspace creation click. Does not block the click entirely — instead, offers a path forward.
- **Copy:** *"Free plan supports 1 active evaluation at a time. You're at 1. Two paths forward: (A) Upgrade to Starter — $299/mo annual, 5 concurrent evaluations, $50 AI budget, unlimited seats. Your current evaluation and all its data carry over. (B) Close or archive your current evaluation first."*
- **Secondary CTA:** *"Archive current evaluation (preserves data; blocks new edits)"* — keeps the user in free-tier compliance without forcing an upgrade.
- **Expected conversion timeline:** 40–55% of users who hit this trigger attempt the second evaluation within 48 hours; of those, 20–30% convert to Starter inside 7 days.

**Trigger 2 — Vendor limit (25 tracked).** Fires when the user attempts to import or add a 26th vendor to the Free org's aggregate vendor list.

- **Placement:** Inline on the vendor-add confirmation dialog.
- **Copy:** *"You're tracking 25 of 25 vendors on Free. Add more by upgrading to Starter (250 vendors). Your 25 existing vendors and their responses carry over automatically."*
- **Secondary CTA:** *"Archive a vendor first"* — provides the compliance path.
- **Expected conversion timeline:** 15–25% inside 14 days — this trigger fires less often than evaluation-limit because 25 vendors is generous for a single-evaluation Wedge ICP buyer.

**Trigger 3 — AI budget exhaustion ($5).** Fires when the 50%, 80%, and 100% thresholds on the Free $5 budget are crossed (`§9 Buyer Pricing`, required platform feature #5).

- **50% threshold ($2.50 consumed):** In-app toast: *"You've used half your Free AI budget. Starter extends it to $50/mo."* No modal, no block. Dismissable. Frequency-capped at once per org.
- **80% threshold ($4.00 consumed):** Email + in-app toast: *"You're close to exhausting your Free AI budget. Your remaining budget covers approximately [X more Pre-Scoring runs / Y more KB suggestions]."* Frequency-capped at once per org.
- **100% threshold ($5.00 consumed):** Hard block on AI operations, per spec-required hard-cap enforcement. In-app modal: *"You've used your $5 Free AI budget for this month. Your evaluation keeps working — scoring, collaboration, phase advancement, the Marketplace, and every non-AI capability remains free. To run more AI operations this month, upgrade to Starter ($50/mo AI budget) or wait 23 days for Free budget renewal."* Timer to renewal displayed.
- **Expected conversion timeline:** 30–45% of Free orgs exhaust the $5 budget within their first evaluation; of those, 25–40% convert to Starter inside 14 days. This is the single highest-converting Free→Starter trigger.

**Trigger 4 — Opus-tier capability attempted.** Fires when the user attempts Policy Parsing (`§6.12.1` #1, Opus), Deep Comparison (`§6.12.2`, Opus), or any other Opus-gated capability. These consume the $5 budget in one call if allowed and are pre-emptively gated on Free.

- **Placement:** Inline, at the moment of the Opus-capability click (the button is visibly distinct but enabled).
- **Copy:** *"Policy Parsing uses the Opus model — value-priced at $25 per run. Your $5 Free budget doesn't cover it. Upgrade to Starter ($50/mo AI budget, ~2 Policy Parsing runs per month) or add wallet overage."*
- **Secondary CTA:** *"Skip this — use the manual requirement-authoring flow"* — preserves the evaluation path without AI assist.
- **Expected conversion timeline:** 50–65% of users who attempt Opus-tier capability on Free convert within 7 days — this is a high-intent action; users who click Policy Parsing have understood the value proposition and are making a considered call.

**CTA design principles (applies to all four triggers):**

- **Contextual, not generic.** The trigger fires at the exact ceiling-hit moment. No persistent "Upgrade" banner that fatigues users.
- **Plain-language carry-over guarantee.** Every CTA restates: *"Your [evaluation / vendors / KB / work] carries over automatically."* Data loss anxiety kills conversion.
- **Visible path-through.** Every CTA offers the secondary "how to stay on Free" path. Users who feel cornered don't convert — they churn.
- **One-click upgrade.** The primary CTA routes to a Stripe-hosted checkout with the Starter plan pre-selected and the Free→Starter state-carry-forward flagged. From click to *"you're on Starter"* in ≤30 seconds (§8 below).
- **Downgrade path visible post-upgrade.** The upgrade confirmation shows the downgrade mechanic: *"You can return to Free at any time in Settings → Billing. Your data is preserved read-only for 90 days if you downgrade."*

### 4.2 Seller Free → Starter Triggers — the Three Conversion Moments

The three conversion moments are the central mechanic of the seller funnel (`§3.1b` Master Summary, `§14.3` Seller Pricing, `C.133`). Each is tuned to a different buying reason. The product must catch all three — the pricing model does not optimize any single one.

**Moment 1 — Second concurrent bid (urgency — "my deal is at risk").**

- **Trigger:** Seller receives a second buyer invitation while the first is still in Active state (`bid_status = active`, not yet submitted or withdrawn).
- **Primary copy:** *"A second buyer invited you to respond. Free plan supports 1 concurrent bid. Upgrade to Starter for 3 concurrent bids, a shared KB across all of them, and your first pass drafted on the new bid in about 2 minutes — Starter is $149/mo annual."*
- **Placement:** Inline banner on the second-bid landing screen (the seller has arrived from the new magic-link). The seller can accept the bid first and draft Free-tier style, but cannot run a first-pass draft until either they upgrade or the first bid closes.
- **Upgrade carry-over language:** *"Your current bid, your 47 KB entries, and your 3 Capability Declarations all carry over automatically. Starter adds two more concurrent bid slots."*
- **Expected conversion timeline:** 25–35% inside 72 hours — this is urgency-coded; the seller has a deadline.

**Moment 2 — First EOI attempt (ambition — "I want to find more deals").**

- **Trigger:** Seller clicks *"Submit EOI"* on any Marketplace listing (`§6.16.2`).
- **Primary copy:** *"Outbound EOIs start at Seller Starter — $149/mo annual with 10 EOIs/month included. Upgrade to submit this EOI, and your Capability Declarations and Seller Profile travel with you."*
- **Placement:** Inline modal on EOI-submit click. Shows the target Marketplace listing summary so the seller is not pulled out of context.
- **Secondary CTA:** *"Save this listing for later"* — captures intent, adds to a seller saved list, does not route out of the page.
- **Expected conversion timeline:** 30–40% inside 14 days. The seller has actively sought outbound demand; they are ambition-coded buyers.

**Moment 3 — KB ceiling at 50 entries (investment — "I don't want to lose what I've built").**

- **Trigger:** Seller's Active KB entries reach 40 (early warning), 48 (ceiling-adjacent), and 50 (hit).
- **40 threshold — early warning:** In-app banner only; dismissable. Copy: *"Your KB has 40 entries — 10 away from the Free plan ceiling. Starter raises this to 1,000."*
- **48 threshold — ceiling-adjacent:** Email + in-app. Copy: *"Your KB is at 48 of 50 entries. At the ceiling, you'll still keep responding to bids and the KB will remain read-only — but new entries require Starter. Upgrade now for $149/mo annual and keep building without interruption. Your 48 existing entries carry over with their confidence scores, provenance, and citation history."*
- **50 threshold — hit:** In-app modal on any action that would create a new KB entry (accept-with-add-to-KB, inline KB-gap-detector reject-with-answer, Firecrawl-result-accept on a KB-configured source). Copy: *"Your Free KB is full at 50 entries. Your existing KB stays active; you can keep using every entry and every bid. To add new entries, upgrade to Starter (1,000-entry KB, $149/mo annual). Your confidence scores, win-rate weights, and citation graph come with you — nothing is re-indexed or lost."*
- **Placement:** Each threshold has a distinct surface. The 50 hit is a modal-on-create-attempt — it fires only when the seller attempts to grow the KB, so non-growing sellers never see the modal.
- **Expected conversion timeline:** 40–55% inside 21 days. This is investment-coded and the single highest-converting of the three moments, because the KB Value Meter (§6.13.7, §17.3 Seller Pricing) has been accruing value the whole time.

### 4.3 The Win/Loss Debrief as Upgrade Trigger (the fourth moment, non-threshold)

The win/loss debrief (`§15.6` Seller Pricing, `C.137`) fires on bid close (won or lost, as reported by the buyer or defaulted to `status_unknown` at Phase 13 entry). It is the only non-threshold conversion surface in the seller funnel — it fires regardless of whether the seller has hit a ceiling.

**Win path copy:**

> *"You won. **KB entries cited on winning responses**: 24. Those entries are now higher-weighted in your KB — Sourcera learned what answers close deals for you. **Keep your KB alive** — upgrade to Starter to unlock weekly crawls of your site and auto-staleness checks, so your KB stays current between bids."*

**Loss path copy (with buyer's published reasoning where available):**

> *"You lost this one. **Gap analysis** identified 4 requirements where your KB had no strong answer: [list 4 requirement titles]. Those gaps are now flagged in your KB. Upgrade to Starter to **let Sourcera crawl your product docs weekly** and fill gaps automatically."*

**Placement:** Email (Loops.so, `§6.29`) within 60 minutes of bid close; in-app Pulse event; full-screen debrief surface on next login. The in-app debrief surface is the highest-converting; the email is the reminder.

**Expected conversion timeline:** 15–25% of win/loss debriefs convert the seller to Starter inside 14 days. Loss path converts at ~1.3× the rate of win path — loss creates a concrete, specific, named gap that the upgrade plan directly addresses.

### 4.4 Five Specific In-Product Upgrade Nudges (Copy + Placement)

These five nudges implement the three-moments framework plus the win/loss trigger across the seller surface. Each has exact copy and exact placement.

**Nudge 1 — Second-bid concurrent-limit banner (Moment 1)**

- **Placement:** Top banner on the second-bid landing screen, within the Bid Workspace header strip.
- **Copy:** *"Second bid in flight — Starter unlocks 3 concurrent bids and keeps your KB shared across all of them. Your first pass on this bid is waiting. Upgrade in 30 seconds →"*
- **CTA button:** *"Upgrade to Starter — $149/mo"*
- **Dismissal:** Dismissable per-bid (but re-surfaces if the seller returns to the second-bid workspace within 24h).

**Nudge 2 — EOI-submit modal (Moment 2)**

- **Placement:** Modal on EOI-submit click from a Marketplace listing.
- **Copy:** *"Outbound EOIs start at Starter. Your first 10/month are included. Submit this EOI and 9 more this month for $149/mo annual — or save this listing and upgrade later."*
- **CTA button:** *"Submit EOI + Upgrade to Starter"*
- **Secondary action:** *"Save for later"* (adds to saved listings).

**Nudge 3 — KB 48-entry email (Moment 3, early warning)**

- **Placement:** Loops.so-delivered email to Bid Owner + Seller Team Leads.
- **Subject line:** *"Your Sourcera KB is almost full — here's what that means."*
- **Copy:** *"Your KB has 48 of 50 entries on the Free plan. When you hit the ceiling, your existing KB stays active — every entry, every bid — but new entries need Starter. Upgrade now for $149/mo annual and keep building. Your 48 entries carry over with their confidence scores, provenance URLs, and cross-bid citation history. [Button: Upgrade to Starter]"*
- **Frequency cap:** Once per seller org at 48 threshold, once at 50.

**Nudge 4 — KB-create-attempt modal (Moment 3, ceiling hit)**

- **Placement:** Modal firing on any action that would create the 51st KB entry: accept-with-add-to-KB click, KB-gap-detector save, Firecrawl-result-accept on a configured crawl, Ghost-Bid Import that would exceed 50.
- **Copy:** *"Your Free KB is full at 50 entries. Your existing KB stays active — you can keep using every entry and every bid. To add this [entry / crawl result / imported entry], upgrade to Starter (1,000-entry KB, $149/mo annual). Your confidence scores, win-rate weights, and citation graph come with you."*
- **CTA button:** *"Upgrade and save this entry"*
- **Secondary action:** *"Don't save this one — continue without adding to KB"*.

**Nudge 5 — Win/Loss Debrief full-screen on next login**

- **Placement:** Full-screen interstitial on next Bid Owner login after bid close; dismissable with *"Remind me later."*
- **Copy:** Win path or Loss path per §4.3 above.
- **CTA button:** *"Upgrade to Starter — keep my KB alive"* (win) / *"Upgrade to Starter — fill these gaps"* (loss).
- **Secondary action:** *"Dismiss"* (removes the interstitial; the debrief remains available in the Bid Workspace header).

### 4.5 Starter → Growth → Scale Triggers

Expansion within the paid tier ladder (`§2.6 Master Summary`). Each trigger is usage-based — the product surfaces the upgrade when the usage data makes the business case obvious.

**Buyer Starter → Growth:**

- **Primary trigger:** 80% AI budget utilization ($40/$50) for 2 consecutive months. This is the canonical expansion signal (`§10 Buyer Pricing`).
- **Secondary trigger:** Active evaluation ceiling approached (4 of 5 evaluations in active state for 14+ days).
- **Tertiary trigger:** Vendors-tracked ceiling approached (220 of 250).
- **CTA placement:** Monthly Pulse Digest email to Org Owner + Billing Admin; in-app banner on the Usage Dashboard (`§2.11` Master Summary required feature #6).
- **Copy (for 80%-utilization trigger):** *"You've used $40+ of your $50 AI budget in each of the last 2 months. Growth ($799/mo annual) gives you a $300 AI budget, 20 concurrent evaluations, and 2,500 vendors. Your evaluations, vendors, and KB all carry over."*
- **Expected timeline:** 20–30% of Starter orgs upgrade to Growth within their first 6 months.

**Seller Starter → Growth:**

- **Primary trigger:** 80% AI budget utilization ($24/$30) for 2 consecutive months.
- **Secondary trigger:** Concurrent-bid ceiling approached (3 of 3 bids in active state for 7+ days).
- **Tertiary trigger:** EOI submissions approaching 10/month.
- **Quaternary trigger:** Numeric Match Score requested (Growth-gated capability).
- **Quinary trigger:** CRM Sync setup attempted (Growth-gated).
- **CTA placement:** Weekly Seller Pulse email + in-app. The CRM Sync and Match Score gates fire inline at click.
- **Copy (CRM Sync trigger):** *"CRM Sync starts at Seller Growth. Your Marketplace activity, EOIs, and bid events will sync automatically to [Salesforce / HubSpot / Dynamics / Pipedrive]. Growth is $499/mo annual — includes unlimited EOIs, numeric Match Scoring, 10,000-entry KB."*
- **Expected timeline:** 18–28% of Starter sellers upgrade to Growth within their first 6 months. Seller expansion is slightly slower than buyer because seller ROI compounds with KB age.

**Growth → Scale (both consoles):**

- **Primary trigger:** 80% AI budget utilization on Growth ($240/$300 buyer, $160/$200 seller) for 2 consecutive months.
- **Secondary trigger:** Unlimited-active-bid ceiling approached (seller-side; Growth caps at 15 concurrent bids, Scale is unlimited).
- **Tertiary trigger:** Vendor-tracked / evaluation-count ceilings (buyer-side).
- **Quaternary trigger (seller-side):** Promoted placement interest — if the seller accesses the Promoted Listings surface without being on Scale, inline upsell.
- **CTA placement:** Monthly Pulse + Usage Dashboard + contextual at ceiling hit.

### 4.6 Scale/Growth → Enterprise Triggers (Founder-Led Sale Routing)

Enterprise is gated (§2.6 Master Summary, §6 Buyer Pricing). The trigger is **not** size — it is any one of {SSO required, DPA required, ≥$12K/yr AI commit, custom integration}. The operational challenge is identifying these triggers before the user churns from Scale.

**Trigger detection mechanics:**

1. **SSO request.** Fires when the Org Admin attempts to configure SSO in Settings → Identity. SSO is Enterprise-only; the settings surface exposes the configuration UI but gates save. Copy: *"SSO with Okta, Entra ID, OneLogin, Google Workspace, or Auth0 is an Enterprise feature. Your SSO setup is automatically routed to our Enterprise team for a 48-hour turnaround."*
2. **DPA request.** Fires when the Billing Admin or Org Owner requests a custom DPA via the support inbox or via a dedicated "Request DPA" CTA in Settings → Legal. Standard DPA is available on all Business tiers; custom DPA is Enterprise.
3. **≥$12K/yr AI commit.** Fires automatically when a Scale customer's trailing-12-month AI spend (included + wallet overage) hits $12K or is projected (via linear extrapolation) to hit $12K within the next 4 quarters.
4. **Custom integration request.** Fires when the Org Admin requests an integration not on the standard list (Coupa, Ariba, ServiceNow, NetSuite, Gainsight, Outreach, Salesloft, 6sense, etc.) via the "Request Integration" CTA.

**Founder outreach mechanics (solo-operator playbook):**

- Each trigger automatically creates a Hubspot/Attio task for the founder with full context: Org name, trigger, usage history, account manager (CSM if Scale-shared), current plan, projected Enterprise-tier spend.
- Founder responds within 24 business hours (SLA) with a 30-minute discovery call offer.
- Discovery call output is routed to a shared Notion board of Enterprise-pipeline accounts with deal-stage taxonomy.
- DocuSign contract drafted from the Enterprise MSA template (`§20 Master Spec`, custom DPA appended if required).
- Closed contracts hand off to the dedicated CSM for onboarding (or founder-run CSM in the first 10 Enterprise accounts).

**Usage data → founder outreach trigger (the automation).** A weekly script runs against the Usage Dashboard data (`§2.11` required feature #6) and identifies any Scale customer meeting at least one of the four triggers. Output is a Slack alert to the founder's DMs with a direct link to the account and the trigger. This is the single most important automation in the Enterprise-routing playbook — without it, trigger detection relies on ad-hoc salesperson intuition, which does not scale below a team of 5.

---

## SECTION 5 — The 17 Growth Mechanics — Operational Execution Plan

Each mechanic M1–M17 is spec'd in `§3.3 Master Summary`. This section adds the operational wrapper: current-implementation assumption (what must be true in the product), the GTM action the solo operator takes to amplify it, the metric that measures its effectiveness, and the launch priority.

### M1 — Stakeholder Read-Only Invite

- **Implementation assumption:** Magic-link invite surface in Phase 8+ artifacts; read-only auth path via WorkOS; artifact types include Selection Report (§6.37), Scoring Matrix (§6.3), TCO Summary (§6.5), Stakeholder Summary (§6.12.1 #15). Recipients land in a restricted read-only Workspace view with no edit capability.
- **GTM action:** Pre-populate the invite template with CFO / General Counsel / CISO / Executive Sponsor placeholder copy. Emphasize in first-run tour: *"Invite your CFO at Phase 12 to sign off — they land on the Selection Report directly."* Solo-operator: send monthly "invite your exec" email to all active buyer orgs with ≥1 Workspace in Phase 8+.
- **Metric:** Number of Stakeholder Read-Only Invites sent per buyer org per month; conversion of invited stakeholders to active accounts within 30 days (target: 25%).
- **Priority:** **Must-have at launch.** This is the buyer-side viral loop. Without it, each buyer Workspace is siloed to the Evaluation Lead.

### M2 — Selection Report Public Link (Watermarked)

- **Implementation assumption:** Public-link generation with per-section redaction controls (buyer selects which sections to redact before publishing); watermarked PDF with Sourcera brand and "Generated via Sourcera" footer; SHA-256 hash verifiable at `sourcera.com/verify/:hash`.
- **GTM action:** Encourage buyers to share completed Selection Reports as Phase-13-close artifacts on LinkedIn. Template post copy provided at Phase 13 close: *"We just closed our [Category] evaluation in [X weeks] using Sourcera. Here's our selection report: [link]."* Featured-report curation by Marketing monthly.
- **Metric:** Public links created per bid-close event; inbound signups attributed to Public Link traffic (UTM: `utm_source=selection_report&utm_medium=public_link`).
- **Priority:** **Must-have at launch.** Replaces the retired loop 3.

### M3 — Evaluation Certificate Badge

- **Implementation assumption:** Verifiable "Selected via Sourcera" badge artifact shareable by both buyer and winning vendor; embedded via `<iframe>` or image with a link back to the Selection Record verification surface. Public resolution at `sourcera.com/certificates/:badge_id`.
- **GTM action:** Include badge-embed instructions in the Phase-13-close email to buyer AND in the winning-vendor debrief email. *"Embed your 'Selected via Sourcera' badge on your website to signal third-party validation."*
- **Metric:** Badge embeds tracked via `Referer` header referrals and UTMs on click-through to Sourcera.
- **Priority:** Can add in month 2. Dependency on Selection Record hash verification surface; not a day-zero blocker.

### M4 — "Kick Off Next Evaluation" on Close

- **Implementation assumption:** At Phase 13 close, the Workspace surfaces a frictionless "Start next evaluation" CTA. Pre-populates with the buyer's org context (team assignments, policies, Firecrawl config) so setup cost is near zero.
- **GTM action:** Solo-operator sends a monthly "your next evaluation" email to buyers who closed ≥1 evaluation in the prior 60 days, reinforcing the success momentum.
- **Metric:** % of buyers who close an evaluation and start a new one within 60 days (target: 45%).
- **Priority:** **Must-have at launch.** Stops the top-of-funnel leak where successful buyers disappear after one evaluation.

### M5 — Buyer-Pull Vendor Invite

- **Implementation assumption:** Anonymous templated outreach surface — the buyer enters a vendor's email or domain, Sourcera sends a templated magic-link invite on the buyer's behalf. Does not expose buyer identity until the vendor accepts. Spam controls: per-buyer rate limit (10/week on Free, higher on paid), vendor opt-out registry check (C.123), domain validation against shared-use domain list.
- **GTM action:** Prominently surface the M5 CTA inside Phase 4 (Vendor Discovery & Outreach) of every Workspace. First-run tour at Phase 4 shows: *"Don't see the vendors you want on the Marketplace? Invite them directly — they get a magic-link to respond."*
- **Metric:** M5 invites sent per buyer org per month; vendor acceptance rate on M5 invites (target: 35%); paid-conversion rate on M5-originated seller orgs (Path B funnel).
- **Priority:** **Must-have at launch.** Primary seller-side acquisition channel beyond M1.

### M6 — Domain-Based Auto-Join

- **Implementation assumption:** When a new user signs up from a claimed-domain (verified via DNS TXT, `C.104`), they are routed to the existing Org as a pending-approval Member. Org Owner receives an approval request.
- **GTM action:** During the Enterprise onboarding motion, the founder/CSM verifies the claimed domain early to activate M6 across the whole company. Email template: *"Claim your domain now — every future signup from your team auto-joins your Sourcera Org."*
- **Metric:** Claimed-domain Org count; pending-approval auto-join events per week; % of approvals accepted (target: 85%).
- **Priority:** Can add in month 2. Dependency on DNS verification flow (which ships at launch but adoption lags).

### M7 — Suggested Team Discovery

- **Implementation assumption:** The `team_suggestion` capability (Haiku, `§6.12.2`) surfaces "your colleagues are also on Sourcera" prompts in the onboarding flow and in the Workspace create modal when it identifies other Org members from the same company domain or shared Slack workspace.
- **GTM action:** In-app email cadence post-first-evaluation: *"3 of your colleagues from [Company] are also on Sourcera. Invite them to your next evaluation in one click."*
- **Metric:** Team discovery events surfaced per user per month; invite-accept rate on team-suggestion prompts (target: 40%).
- **Priority:** Can add in month 2-3. Replaces retired loop 6.

### M8 — Org Intelligence Value Curve

- **Implementation assumption:** Organizational Intelligence (§6.7) surfaces compounding analytical value per additional evaluation — cross-evaluation discrepancy detection, requirement frequency analysis, vendor scoring deltas. Visible in-app via a dedicated Org Intelligence dashboard.
- **GTM action:** After the buyer's 2nd evaluation closes, a "Value Curve" email fires: *"You've now closed 2 evaluations. Here's what Sourcera learned about your org's patterns that a spreadsheet would never surface."* Templated LinkedIn post copy offered to buyers who share Value Curve milestones.
- **Metric:** Retention of buyers with ≥2 evaluations closed (target: 90% at 12 months vs. 70% for 1-evaluation orgs); upgrade rate from Starter → Growth in orgs with Value Curve surfaced.
- **Priority:** Must-have at launch (product exists on day zero); GTM amplification can be added month 2.

### M9 — Per-Category Marketplace Landing Pages (SEO)

- **Implementation assumption:** AI-generated, editorially-reviewed Category Pages via `category_faq_generation` capability (Sonnet, `§6.12.2`). Each page surfaces: FAQ (Agent-drafted, editor-reviewed), vendor list (published Seller Profiles in that category), "How to Evaluate [X]" link to M10 guide, 3 Comparison Page links (M11), Heat Map snippet (M13). Schema.org `Product`, `FAQPage`, and `ItemList` structured data emitted.
- **GTM action:** Ship top 6 Category Pages at launch for the `GTM_POSITIONING.md §1.3.1` Seed Categories. Search Console monitored weekly; editorial refresh per category every 90 days. Solo-operator: draft Category Page blog-post supplements monthly that rank the page for long-tail queries.
- **Metric:** Organic sessions per Category Page per month; click-through rate to CTA; signup attribution via UTMs; rank tracking on primary keyword.
- **Priority:** **Must-have by month 2.** SEO compounding starts earlier, compounds longer.

### M10 — "How to Evaluate [X]" Guides (SEO)

- **Implementation assumption:** Long-form category-specific buying guides; Agent-drafted via `guide_draft_generation` (Sonnet); refreshed via `guide_refresh_analysis` (Haiku) on quarterly cadence. Each guide is 2,500–5,000 words, includes requirement-frequency-analysis drawn from k-anonymized Org Intelligence data (k=10 floor), and ends with a "Use this guide as a Sourcera template" CTA.
- **GTM action:** Ship top 6 guides at launch (one per Seed Category). Pair each with a downloadable template that populates a Sourcera Workspace. Outreach to ICPs who cited the guide on LinkedIn or forwarded it internally.
- **Metric:** Organic sessions per guide; downloads; template-clones originating from guide CTA; signup attribution.
- **Priority:** **Must-have by month 2.** M9 + M10 compound together.

### M11 — Software Comparison Pages (SEO)

- **Implementation assumption:** AI-generated, continuously refreshed side-by-side software comparisons. Vendor opt-out honored globally (`C.123`). Comparison spans objective criteria (Capability Declarations, verification tier, KB health, customer-scoring aggregates from Sourcera data when k-anonymity allows). Each page emits `ItemList` structured data.
- **GTM action:** Ship 20 comparison pages in month 3 targeting high-volume queries like "Splunk vs. Datadog," "Salesforce vs. HubSpot." Every comparison page includes a "Start your own evaluation" CTA that seeds a Workspace with both vendors pre-imported.
- **Metric:** Organic sessions per comparison page; click-through to "Start evaluation" CTA; conversion to Workspace-with-both-vendors.
- **Priority:** Add by month 3. Relies on sufficient Seller Profile density per category (>10 sellers per category minimum).

### M12 — Aggregate Market Intelligence Reports

- **Implementation assumption:** k-anonymized cross-Org analytics (k=20 aggregate floor — `§3.5 Master Summary`) published quarterly. Reports cover: evaluation velocity trends, category win-rate distributions, emerging capability requirements, price-range distributions by deal band. Each report is a downloadable PDF + a public blog post with gated full access.
- **GTM action:** First report at month 9 (requires ≥ 20 orgs per category for k-anonymity). Gated download for lead generation (email capture). Press outreach on release with exclusive pre-briefings to targeted trade press.
- **Metric:** Report downloads; leads captured; organic sessions during release week; press coverage attributed.
- **Priority:** Add by month 6 (data compounding required first).

### M13 — Public Marketplace Heat Map

- **Implementation assumption:** Anonymized category-level demand visualization — a geospatial or heat-grid view of active evaluations by category and region. k=5 anonymity floor per cell. Refreshes daily.
- **GTM action:** Embed widget surface (`<iframe>`) shareable to seller partner networks. Tweet/LinkedIn-share "category heat" updates weekly from the Sourcera handle.
- **Metric:** Heat Map page organic sessions; embed-widget impressions per month; seller-signup attribution via UTMs.
- **Priority:** Add by month 4. Depends on Marketplace liquidity to be visually interesting.

### M14 — Seller Bid Success Share

- **Implementation assumption:** One-click social post generation for sellers after winning a bid. Pre-populated copy: *"Just won a [Category] evaluation on Sourcera. Our KB + first-pass response took us from 'will we be able to reply in time?' to 'done in [X] hours.'"* Links back to the seller's public profile.
- **GTM action:** Debrief email on win includes the share CTA prominently. Repost Marketing amplification: Sourcera official Twitter/LinkedIn reposts every seller success share for the first 10 opt-ins.
- **Metric:** Share CTA click-through on win-debrief; social engagement on posted shares; seller-signup attribution from share traffic.
- **Priority:** **Must-have at launch.** Low-cost viral mechanic.

### M15 — Ghost-Bid Importer

- **Implementation assumption:** Sellers paste historical RFPs (Word, PDF, CSV); Ghost-RFP Ingestion capability (Opus, $25 value/RFP, `§6.12.2`) extracts requirements and drafted responses; outputs feed the seller's KB. First import free per Seller Org (M15 growth mechanic + §18.5 Seller Pricing).
- **GTM action:** During Path C (Organic Seller Signup) onboarding, Ghost-Bid Import is the primary first-action CTA: *"Paste your last RFP — we'll seed your KB in one session."* Email follow-up 24h post-signup if no import occurred: *"Have an old RFP lying around? Paste it — Sourcera will turn it into a KB you can reuse on every future bid."*
- **Metric:** Ghost-Bid imports per Organic signup; % of signups that use their first free import in first 7 days (target: 45%); KB-entry-count uplift per import; conversion rate of Ghost-imported sellers vs. cold-start sellers (expect 2–3×).
- **Priority:** **Must-have at launch.** Critical to Path C viability.

### M16 — Buyer Referral Credit

- **Implementation assumption:** Structured referral program with credit reconciliation (both referrer and referee get $299 credit applied as 1 month of Business Starter) and fraud controls — shared-use domain detection, referrer-referee relationship validation, max-credits-per-org caps.
- **GTM action:** Launch refer-a-buyer program in month 2. Direct outreach to first 20 closed-revenue buyers: *"Refer a peer procurement leader — you both get a month on us."*
- **Metric:** Referral invites sent per buyer org; referral-accept rate; paid-conversion rate on referred accounts (should materially exceed cold organic).
- **Priority:** Can add in month 2. Requires credit-accounting plumbing and fraud controls.

### M17 — Buyer-Funded Pro Trial Seat

- **Implementation assumption:** Buyers on Scale and Enterprise get a monthly pool of Pro Trial Seats (5/mo Scale, 15/mo Enterprise — §2.3, §15.5 Seller Pricing). When inviting a vendor, the buyer can optionally grant a 30-day Seller Starter trial. Cost absorbed into buyer's plan; vendor's AI spend still metered to the vendor's Org AI budget. Auto-downgrade to Seller Free on day 31 with 90-day read-only data preservation.
- **GTM action:** Buyer-side messaging at invite time: *"Grant this vendor a Pro Trial Seat? They'll respond with better KB tooling, better drafts, better citations — you'll get a better response."* Seller-side on-arrival messaging: *"[Buyer Company] sponsored a 30-day Pro trial for you. Your first bid is drafted — submit it, no signup friction, no upgrade ask."*
- **Metric:** Pro Trial Seats granted per Scale/Enterprise buyer per month; trial-to-paid conversion at day 31 (expect 3–5× cold-start Free→Starter rate); NPS delta on Scale/Enterprise buyers using M17 vs. not.
- **Priority:** **Must-have at launch** for Scale/Enterprise buyers. Low incremental engineering — piggybacks on Pro Trial Seat pool plumbing already required for pricing.

### M1–M17 Launch Priority Summary

| Priority | Mechanics |
|---|---|
| **Must-have at launch (weeks 0–4)** | M1, M2, M4, M5, M8, M14, M15, M17 |
| **Add by month 2 (SEO compound, referral program)** | M3, M6, M7, M9, M10, M16 |
| **Add by month 3–4** | M11, M13 |
| **Add by month 6–9** | M12 (k-anonymity requires data scale) |

---

## SECTION 6 — The 10 Core Growth Loops — Measurement Framework

The 10 loops are defined in `§3.2 Master Summary`. Two slots (3 and 6) are retired and replaced by M2 and M7 respectively. This section provides the measurement framework: loop time, branching factor, leading indicator, accelerants, killers.

### Loop 1 — Vendor-Invite-Creates-Account

- **Mechanic:** Every buyer-invited vendor receives a magic-link signup; first bid seeds KB via auto-bootstrap (§6.13.6).
- **Loop time:** 3–14 days from buyer invite to new seller org active and published-profile live. Seller activation can be same-day (20 min target); the "new user entering the loop" counter advances on seller-side profile publication.
- **Branching factor:** 3–10 new seller orgs per completed buyer evaluation. Buyer evaluations with 5 vendors on Marketplace-published listings can add 5 seller orgs; those with 10 direct invites can add up to 10.
- **Leading indicator:** M1 invitations sent per buyer evaluation (target: 5+ per evaluation). Tracked in the Buyer Workspace Phase 4 vendor-outreach surface.
- **Accelerators:** Template-driven evaluations that pre-suggest vendors via `vendor_invite_suggestion`; Marketplace category density (more candidates in the Marketplace → more invite-worthy targets); Pro Trial Seat allocation on Scale/Enterprise plans (reduces the friction on the vendor side).
- **Killers:** Low Marketplace density at launch (the buyer can't find vendors to invite); vendor opt-out registry saturation in a category (genuinely saturated categories will have high opt-out rates); high spam-suspicion rate from Firecrawl or DNS (vendors mark Sourcera invites as spam — DMARC/SPF health).

### Loop 2 — Template-Clone-Attribution

- **Mechanic:** Every cloned template carries a badge linking back to the originating Seller; clicks deep-link to Software Pages.
- **Loop time:** 7–30 days from seller template publish to first buyer clone and badge click-through.
- **Branching factor:** 0.1–0.4 new seller signups per buyer clone (badge click-through → Path C signup). High variance; categories with active seller communities (DevOps, Security) show higher branching than low-activity categories (HRMS early days).
- **Leading indicator:** Total Seller Templates published per week; clone-count per template at Day 14.
- **Accelerators:** Featured placement for templates on Category Pages (M9); Marketing-curated "Top 10 templates this month" emails; Template Publish Incentive credits (M9-related) for sellers.
- **Killers:** Low buyer-side template-discovery visibility (Template Discovery must be prominent in Workspace creation — if buried, Loop 2 dies); template spam (ML classifier per `§3.5 Master Summary` — if false positives spike, good templates get suppressed).

### Loop 3 — Retired

Replaced by M2 (Selection Report Public Link, watermarked). M2 is the new buyer-side viral artifact.

### Loop 4 — Seller-Profile SEO

- **Mechanic:** Public Seller Org Pages and Software Pages emit Schema.org structured data; organic traffic compounds into Marketplace sessions.
- **Loop time:** 30–180 days for Google to crawl, index, and rank new profiles on category queries.
- **Branching factor:** 0.02–0.1 new signups per 100 organic sessions to a Seller profile. Converts lower than Category Pages (visitors arrive looking for the seller, not Sourcera) but compounds with seller density.
- **Leading indicator:** Indexed Seller Profile count (via Search Console); organic sessions to Seller Profile pages; CTR to Marketplace from Seller Profile CTAs.
- **Accelerators:** KB health score on the seller side (better KB → better auto-enriched page content → higher ranking); Capability Declaration density; Verified/Certified tier upgrades (improve page trust signals); Seller Page Enrichment capability (Opus, `§6.15.4`).
- **Killers:** Thin content on default profiles (seller never fills in company description, certifications, case studies); Google algorithm changes devaluing AI-generated content (mitigated by editorial review and Schema.org compliance); Sourcera's own domain authority plateau (general SEO health issue).

### Loop 5 — Free-AI-Teaser-to-Paid

- **Mechanic:** The $5 Free AI budget (both sides) is sized to demonstrate value; conversion fires on exhaustion.
- **Loop time:** 3–14 days from signup to budget exhaustion. Faster for sellers on the Hero Moment path (one bid consumes most of the budget); slower for buyers (depends on evaluation pace).
- **Branching factor:** N/A (this is not a viral loop — it is a monetization loop). Measured in Free→Paid conversion rate per cohort.
- **Leading indicator:** % of Free orgs consuming ≥60% of $5 AI budget within 30 days (target: 55% buyer-side, 70% seller-side forced-signup); acceptance-rate per capability.
- **Accelerators:** Template seeding (buyer Pre-Scoring budget consumed faster with pre-populated evaluations); Hero Moment (seller bootstrap consumes a large chunk of the first-bid budget intentionally); outcome-accounting transparency (the live budget counter reinforces value perception).
- **Killers:** Rejected-op rate >30% (quality signal — sellers/buyers reject too many AI outputs → budget exhausts without value perception → churn); low ceiling-hit visibility (if the budget threshold notifications don't fire, users never convert).

### Loop 6 — Retired

Replaced by M7 (Suggested Team Discovery). M7 is the new in-org expansion mechanic.

### Loop 7 — Cmd+K Suggestion Loop

- **Mechanic:** Command Palette (§6.21) surfaces relevant Marketplace content based on current context — a Requirement viewed surfaces matching Seller Pages; a Use Case surfaces category templates; a Workspace surfaces category vendors.
- **Loop time:** <1 session — fires inline during active work.
- **Branching factor:** 0.05–0.2 EOI-equivalent engagements per Cmd+K session. Not viral in the new-user sense, but drives cross-console engagement inside the buyer Org.
- **Leading indicator:** Cmd+K sessions per active buyer org per week; click-through rate to Marketplace content surfaces; EOI-accept attribution to Cmd+K-surfaced sellers.
- **Accelerators:** Rich Capability Declaration density (more structured data → better context matching); indexed KB-to-Capability mapping (§6.13 C.46); Marketplace category density.
- **Killers:** Noisy Cmd+K suggestions (irrelevant Marketplace content surfaced in the middle of requirement authoring — dismissal rate > 70% signals this); slow Command Palette FCP (if Cmd+K is >300ms to render, power users stop using it).

### Loop 8 — Bid-Close-Offers-KB-Sync

- **Mechanic:** On bid close, the seller sees a one-click *"save this response to KB"* CTA. Batched acceptance flow for efficient post-bid KB building.
- **Loop time:** <1 session — fires at bid close.
- **Branching factor:** N/A (not a new-user loop — an intra-seller KB-growth loop that feeds Loop 4 and Loop 10 via richer Capability Declarations).
- **Leading indicator:** % of bid-close events that result in ≥1 KB entry added (target: 85% for won bids, 60% for lost bids).
- **Accelerators:** Automatic entry suggestion (the Agent pre-proposes which response items to save based on cross-bid citation potential); single-click batch accept.
- **Killers:** KB ceiling hit on Free (the seller cannot save more) — but this is a conversion trigger, not a killer, since it's intended to fire Moment 3; poor entry-suggestion quality (rejected pre-proposals → seller stops using the batch-accept flow).

### Loop 9 — Template Publish Incentive

- **Mechanic:** Sellers earn visibility credits (featured placements in Category Pages) for publishing templates that are widely cloned.
- **Loop time:** 14–90 days from template publish to first featured placement (gated on clone-count threshold).
- **Branching factor:** Each featured placement drives an estimated 2–10 inbound EOIs per placement per month depending on category volume.
- **Leading indicator:** Seller Template publish velocity per week; clone-count distribution per template (long tail expected; top 10% drive most featured placements).
- **Accelerators:** Template Discovery placement prominence (feeds Loop 2); M9 Featured Placements editorial choice (Marketing decides).
- **Killers:** Low buyer-side clone-rate (if templates aren't cloned, the feedback loop never produces a featured signal); overly restrictive Ops-review on publish (anti-spam threshold tuning — if false positive rate exceeds 20%, sellers stop submitting).

### Loop 10 — Marketplace Match-Score Teaser

- **Mechanic:** Free Marketplace viewers see qualitative match-score labels ("Strong match"); numeric scores (0–100) gate behind the paid Match Scoring capability (Growth+ on both sides).
- **Loop time:** 7–30 days from first Marketplace browse to Match Score gate hit.
- **Branching factor:** N/A (intra-funnel conversion loop — teaser → paid gate → upgrade).
- **Leading indicator:** Marketplace session count per paying seller; qualitative-label-to-numeric-score click-through rate (the teaser); Free→Paid conversion attribution from Match Score gate.
- **Accelerators:** EOI volume (each EOI triggers a qualitative match visualization); Capability Declaration quality (feeds the match computation); buyer-side Listing density.
- **Killers:** Qualitative labels that never change (if every listing shows "Strong match," the teaser loses signal → click-through rate collapses); match-score algorithm bias (if the teaser ranking doesn't correlate with real vendor fit, the conversion argument fails).

### Loop Measurement Dashboard

All 10 loops (8 active, 2 retired) should be reportable on a single Growth dashboard with monthly review cadence. The dashboard reports, per loop:

- **Status** (Active / Retired).
- **Loop time** — p50/p90 days from trigger to new user entering.
- **Branching factor** — new users per existing user per cycle (where applicable).
- **Leading indicator** — weekly value, 4-week trend, alert threshold.
- **Health signal** — green/yellow/red based on leading indicator vs. target.
- **Top accelerator opportunity** — one-line named action for this quarter.
- **Top killer risk** — one-line named risk this quarter.

---

## SECTION 7 — PQL Scoring Model

PQLs (Product-Qualified Leads) are behavioral signals that identify Free users ready to convert. Both sides have distinct signal sets. The model below is implementable with PostHog events — no custom data pipeline required beyond standard event tracking.

### 7.1 Buyer PQL Scoring

**Signal categories:**

| Category | Signal | Weight | Event |
|---|---|---|---|
| Activation | First Pre-Scoring run across ≥3 vendors | 25 | `buyer_first_pre_score_completed` |
| Activation | First Stakeholder Read-Only Invite sent (M1) | 15 | `buyer_m1_invite_sent` |
| Activation | First Phase 9 (Final Clarifications) entered | 10 | `buyer_workspace_phase_advanced` (phase=9) |
| Usage | 3+ active Pre-Scoring / Evidence Parsing / Requirement Extraction capability calls in last 7d | 10 | capability-emitted events |
| Usage | AI budget consumption ≥60% in current month | 20 | `buyer_ai_budget_threshold_crossed` (threshold=60) |
| Usage | AI budget consumption ≥80% in current month | 15 | `buyer_ai_budget_threshold_crossed` (threshold=80) |
| Usage | Workspace count = 1 (approaching Free 1-evaluation ceiling with real usage) | 5 | daily roll-up |
| Intent | Attempted an Opus-gated capability (Policy Parsing, Deep Comparison) on Free | 30 | `buyer_opus_capability_gated` |
| Intent | Visited pricing page | 10 | `page_view` (pricing) |
| Intent | Requested SSO setup OR custom DPA | 40 (Enterprise-route) | `buyer_sso_requested` / `buyer_dpa_requested` |
| Intent | Vendors-tracked count ≥20 of 25 | 10 | daily roll-up |
| Quality | Accepted-op rate ≥70% on Pre-Scoring | 5 | outcome resolver |
| Quality | M1 invite acceptance rate ≥40% (sent invites converting to accounts) | 5 | rolling calc |

**PQL thresholds:**

- **Score ≥ 50:** Qualified Lead — automated nurture sequence activates: weekly "here's what Starter unlocks" email; featured upgrade-CTA on next login; Slack alert to founder.
- **Score ≥ 100:** Hot Lead — founder personal outreach within 48 business hours with a 30-minute consult offer. Hot leads trending toward Enterprise-route triggers (+40 weights) are routed directly to the Enterprise pipeline.
- **Score ≥ 150:** Enterprise Lead — founder personal outreach within 24 hours; Enterprise-track messaging.

### 7.2 Seller PQL Scoring

**Signal categories:**

| Category | Signal | Weight | Event |
|---|---|---|---|
| Forced-Signup engagement | Hero Moment completed (Stage 3 populated, bid submitted) | 25 | `seller_bid_submitted` |
| Forced-Signup engagement | Post-submit stake reveal dwell >20s | 10 | `seller_stake_reveal_viewed` + dwell filter |
| Forced-Signup engagement | Outcome debrief viewed | 10 | `seller_outcome_debrief_viewed` |
| KB investment | KB entries ≥40 (early-warning threshold for ceiling Moment 3) | 15 | daily roll-up |
| KB investment | KB entries ≥48 (ceiling-adjacent) | 20 | daily roll-up |
| KB investment | KB-entry-add attempt rejected (ceiling-hit modal fired) | 30 | `seller_kb_ceiling_modal_shown` |
| KB investment | Ghost-Bid Importer used | 10 | `seller_ghost_import_completed` |
| Bid completion | ≥1 closed bid | 20 | `seller_bid_closed` |
| Bid completion | ≥2 closed bids | 15 | daily roll-up |
| Bid completion | Second concurrent-bid invite arrived (Moment 1 trigger) | 30 | `seller_concurrent_bid_limit_hit` |
| Marketplace activity | ≥3 Marketplace browse sessions in last 7d | 5 | `page_view` (marketplace) |
| Marketplace activity | Attempted EOI submission (Moment 2 trigger) | 30 | `seller_eoi_gate_hit` |
| Marketplace activity | Saved ≥1 Marketplace listing for later | 5 | `seller_listing_saved` |
| Growth-gated intent | Attempted to view numeric Match Score | 20 | `seller_match_score_gate_hit` |
| Growth-gated intent | Attempted CRM Sync setup | 25 | `seller_crm_sync_setup_attempted` |
| Enterprise-route intent | Requested SSO setup OR custom DPA | 40 (Enterprise-route) | `seller_sso_requested` / `seller_dpa_requested` |
| Enterprise-route intent | AI budget consumption projects ≥$12K/yr | 35 (Enterprise-route) | rolling calc |
| Quality | Accepted-op rate ≥70% on First-Pass Responder | 5 | outcome resolver |
| Quality | M5 / M15 / M17 origin (Forced-Signup path — inherently hotter than Organic Path) | 10 | signup source attribution |

**PQL thresholds:**

- **Score ≥ 50:** Qualified Lead — weekly "what Starter unlocks" email; featured upgrade CTA on next Bid Workspace load; Slack alert if signup is M17-originated.
- **Score ≥ 100:** Hot Lead — founder personal outreach within 48 hours. Pro Trial Seat (if sponsored via M17) extended if day 28+ of the trial.
- **Score ≥ 150:** Enterprise Lead — founder outreach within 24 hours; Enterprise messaging.

### 7.3 PostHog Implementation Notes

Every event listed in §7.1 and §7.2 must be part of Appendix G (PostHog Event Taxonomy) in the Master Spec. Minimum required event properties for PQL scoring:

- `distinct_id` — user-level identifier
- `$groups.org` — Org-level identifier for roll-ups
- `console` — `buyer` or `seller`
- `plan_tier` — current plan assignment for the console
- `elapsed_days_since_signup` — for cohort analysis
- `forced_signup_source` — (for seller only) M1 / M5 / M15 / M17 / organic

Score recomputation cadence: hourly rolling window on the PQL scoring service. Threshold-cross alerts fire immediately (debounced to one alert per org per 24 hours to prevent notification spam).

*Authored Extension — requires human sign-off:* The numeric weights above are first-pass calibration. They should be recomputed from actual cohort data after 500 signups per path, using a logistic regression against the "converted to paid within 90 days" outcome. Until then, treat the weights as targets and review monthly.

---

## SECTION 8 — Self-Serve Monetization Mechanics

All self-serve monetization flows route through Stripe. The AI Wallet service (`§2.11` Master Summary required feature #1) holds the included-budget counter, overage counter, and auto-topup config Org-scoped and pooled across consoles (§2.5 Master Summary, §11 Seller Pricing).

### 8.1 Buyer Upgrade Flow (Contextual, In-App, Instant)

**Trigger sources:**

- Contextual CTA fires (§4.1 Triggers 1–4)
- Pricing page visit with direct upgrade click
- Settings → Billing → Upgrade

**Flow:**

1. **Click →** In-app Stripe Checkout modal opens (Stripe.js, embedded, no redirect if possible; full-page Stripe-hosted checkout as fallback for card-auth flows).
2. **Plan pre-selection.** The plan is pre-selected based on trigger context (most triggers route to Starter; the Opus-gated-capability trigger routes to Starter with an inline upsell to Growth if the org's Workspace count suggests Growth fit).
3. **Billing frequency toggle.** Annual (default, with savings surfaced: *"Save $600/yr with annual billing"*) or Monthly.
4. **Team details.** Billing email (defaults to Org Owner), company name (auto-populated from SSO), VAT/Tax ID (optional).
5. **Payment.** Credit card (Stripe), ACH (available on Growth+), wire (Enterprise only — contract-based).
6. **Confirmation.** Immediate plan activation (<30 seconds). The Org is upgraded in real-time; all carry-over data (KB, evaluations, vendors, in-flight bids for cross-console orgs) is preserved; acceptance record in the Audit Log (`§6.24`).
7. **Post-upgrade CTA.** *"You're on Starter. Here's what changed: [list]. Here's what's unchanged: [all prior work]. View your Usage Dashboard →"*
8. **Confirmation email.** Billing confirmation + 30-day money-back guarantee disclosure for monthly plans + annual-plan refund policy disclosure.

**Performance targets:**

- P95 click-to-confirmation ≤ 30s
- 100% zero-downtime plan change (no capability should fail between upgrade click and confirmation)
- Stripe webhook handling idempotent per Stripe `event_id`

### 8.2 Seller Upgrade Flow (at the Three Conversion Moments)

**Same Stripe infrastructure as §8.1, with moment-specific copy.**

**Moment 1 (Second concurrent bid) flow:**

1. Upgrade CTA click from the Bid Workspace banner.
2. Stripe Checkout modal with Seller Starter pre-selected, annual billing default.
3. Confirmation screen additionally reads: *"Starter is live. Your second bid's first-pass draft is being generated now."* → kicks the `first_pass_responses` capability automatically on the just-activated bid.
4. In-app redirect lands the seller back in the second-bid Bid Workspace with drafts populating.

**Moment 2 (EOI attempt) flow:**

1. Upgrade CTA click from the EOI-gate modal.
2. Stripe Checkout modal with Seller Starter pre-selected.
3. Confirmation additionally reads: *"Starter is live. Submitting your EOI now."* → EOI submits automatically on confirmation.
4. In-app redirect lands on the Marketplace listing with EOI-submitted state.

**Moment 3 (KB ceiling hit) flow:**

1. Upgrade CTA click from the KB-create-attempt modal.
2. Stripe Checkout modal with Seller Starter pre-selected.
3. Confirmation additionally reads: *"Starter is live. Saving your new KB entry now."* → the entry that triggered the modal is saved automatically.
4. In-app redirect lands the seller in the KB list with the new entry visible.

**Each moment's post-upgrade experience is designed to make the upgrade feel seamless — the blocked action completes automatically as part of the upgrade flow, not as a second click the user has to take.**

### 8.3 AI Wallet Overage Opt-In Flow (Admin-Only, Capped)

The AI Wallet is **off by default on every plan** (§2.7 Master Summary, §7 Buyer Pricing). Admin enables explicitly.

**Flow:**

1. **Admin navigates to Settings → Billing → AI Wallet.** Opt-in toggle visible.
2. **Enable Wallet.** Opens a configuration panel:
   - **Monthly cap** — required, no default (admin must enter). Range: $10–$10,000/mo.
   - **Soft-cap notification threshold** — default 80%.
   - **Auto-topup** — optional, off by default. If enabled, admin sets top-up amount and frequency.
   - **Overage rate card preview** — shows the rates per capability. Links to the full rate card at `api.sourcera.com/v1/pricing`.
   - **Approval** — admin clicks *"Enable with $[cap]/mo cap."*
3. **Billing authorization.** Stripe card-on-file re-verification for new caps >$500/mo. Any cap ≥$1,000/mo requires Org Owner + Billing Admin dual approval.
4. **Wallet activates.** All AI ops beyond included budget draw from wallet; hard-cap enforcement stops ops at cap; soft-cap emails fire at 80%; 100% email fires with path-through to increase cap.
5. **Audit.** Every wallet state change (enable, disable, cap change, topup) logged in Audit Log with actor + timestamp + prior state + new state.

**Copy at enable time:**

> *"Wallet overage charges per AI operation at the rates published at api.sourcera.com/v1/pricing. Your monthly cap hard-stops ops when reached — no bill shock. Auto-topup is off by default and must be explicitly enabled."*

### 8.4 Annual vs. Monthly Nudge Mechanics

Annual billing is a 15% discount vs. monthly ($299/mo annual = $3,588/yr vs. $349/mo monthly = $4,188/yr — $600/yr savings per Starter). The nudge must be transparent but not coercive.

**Nudge surfaces:**

1. **At first upgrade** (§8.1/§8.2). Default selection is Annual with monthly toggle visible. Savings callout: *"Save $600/yr with annual billing."*
2. **At month 9 on monthly** (for orgs who picked monthly). Email + in-app banner: *"You've been on Starter monthly for 9 months. Switch to annual and save $600/yr — your $299/mo annual plan applies immediately with prorated credit for the remainder of this billing period."*
3. **At annual renewal** (for annual orgs). Renewal notice 30 days in advance; surfaces any rate-card changes (though the rate card is cost-adaptive and customer-facing dollars are stable — §2.2).

**Banned:** Hiding the monthly option; making the monthly toggle hard to find; fake-urgency countdown timers on the annual savings.

### 8.5 Downgrade Handling — 90-Day Read-Only Preservation

Downgrade from paid → Free or paid → lower paid tier (§2.6 Master Summary, §9 Buyer Pricing required feature #8, §17.4 Seller Pricing).

**Flow:**

1. **Admin navigates to Settings → Billing → Change Plan.** Downgrade option visible.
2. **Downgrade confirmation.** A full-screen confirmation shows:
   - What will remain active under the new plan
   - What will transition to read-only state (data over the new plan's ceilings)
   - The 90-day preservation guarantee: *"Data in read-only state is preserved for 90 days. During this period, you can upgrade at any time and all read-only data becomes active again automatically. After 90 days, read-only data is archived per our Data Retention policy (§6.27)."*
3. **Secondary confirmation.** For cross-console downgrades (e.g., Seller Scale → Seller Free with 50+ Capability Declarations), requires typing the Org name to confirm.
4. **Downgrade executes.** Effective at next billing cycle (default) or immediately with prorated credit (optional).
5. **Post-downgrade surface.** Org Dashboard shows a persistent banner: *"Your [N] [entries / evaluations / bids] are in read-only preservation. Upgrade to reactivate. 87 days remaining."*
6. **Notifications.** Soft-reminder email at day 60, day 80, and day 89 before archival. Day-90 archival email with one-click "Re-upgrade and recover all data" CTA.

**Banned:**

- Destructive deletion within the 90-day window.
- Any downgrade path that does not preserve audit log entries (§6.24 — audit logs retain full history regardless of plan).
- Hiding the downgrade option behind customer-support-only contact flows.

### 8.6 Pro Trial Seat Mechanics (M17)

Per `§2.3` (Buyer Plan Architecture — 5/mo Scale, 15/mo Enterprise) and `§15.5` Seller Pricing.

**Pool allocation:**

- Scale buyer orgs receive 5 Pro Trial Seats at the start of each billing month (granted fresh; unused seats do not roll over — prevents hoarding).
- Enterprise buyer orgs receive 15 Pro Trial Seats fresh each month.
- Seats are allocated at the Org level, consumable by any Workspace Owner in that Org.

**Grant mechanics (at vendor invite time):**

1. Buyer invites a vendor through the standard vendor-invite flow in Phase 3/4 of any Workspace.
2. The invite form presents: *"Grant this vendor a Pro Trial Seat? (4 remaining this month) — They'll respond with Seller Starter tooling for 30 days. Free to you, free to them."*
3. Checkbox default: **on** (toggled by Org-level setting; admin can switch default to off if Org wants to ration).
4. On invite send, Pro Trial Seat state is created for the invited vendor with:
   - `sponsoring_buyer_org_id`
   - `sponsored_by_user_id`
   - `start_at` (null until vendor accepts)
   - `end_at` (null — set to start_at + 30d on acceptance)
   - `seat_status` (pending → active → expired | converted)
   - `auto_downgrade_at` (start_at + 30d)

**Vendor arrival (sponsored path):**

- Magic-link lands the vendor in Stage 1 of Seller Onboarding (§6.28.2).
- Difference from standard Path B: Bid Workspace renders with Seller Starter capabilities active — second bid allowed concurrently, 1,000-entry KB ceiling, 10 EOIs/month available, Firecrawl sources configurable.
- Onboarding copy: *"[Buyer Company] sponsored a 30-day Seller Starter trial for you. No payment required. Your first bid is drafted — submit it, and you have 29 more days of Starter tooling to keep going."*
- AI usage still metered to the vendor's Org AI budget ($30/mo Starter included); cost absorbed into sponsoring buyer's plan is the *subscription-fee-equivalent* ($149/mo annualized ÷ 12), not AI usage.

**Trial conversion mechanics (Day 28–31):**

- **Day 28 email:** *"Your Pro Trial expires in 3 days. Convert to Seller Starter ($149/mo annual) to keep your KB, your in-flight bids, your Capability Declarations, and all 10 EOIs/month. One-click upgrade →"*
- **Day 30 email:** *"Your Pro Trial expires tomorrow. Click to convert and keep everything you've built."*
- **Day 31 at 00:00 UTC:** Trial auto-downgrades to Seller Free. Read-only 90-day preservation kicks in for over-Free-ceiling data (KB >50 entries, in-flight bids >1, Capability Declarations >3). Vendor can still respond to invited bids at Free-tier constraints.
- Converted vendors: conversion reported in the sponsoring buyer's Pro Trial Seat usage summary (without exposing the vendor's financial details — buyer sees "1 of 5 Pro Trial Seats converted to paid this month" aggregate).

**Auto-downgrade state preservation:**

- All trial-active data preserved read-only for 90 days post-trial.
- No destructive deletion.
- Upgrade at any point within 90 days recovers full state.

### 8.7 Stripe Integration Touchpoint Summary

For operational reference — every touchpoint between Sourcera product and Stripe:

| Touchpoint | Surface | Stripe object |
|---|---|---|
| Free → Starter / Growth / Scale upgrade | §8.1, §8.2 Checkout modal | Checkout Session, Subscription |
| Tier change (e.g., Starter → Growth) | Settings → Billing → Change Plan | Subscription update with prorated invoice |
| AI Wallet topup | Settings → Billing → AI Wallet | Invoice + Charge |
| Auto-topup (if enabled) | Background job on wallet depletion | Charge (card-on-file) |
| Annual renewal | Automatic at end of billing period | Invoice + auto-charge |
| Monthly renewal | Automatic | Invoice + auto-charge |
| Downgrade | §8.5 confirmation flow | Subscription update |
| Cancellation | Settings → Billing → Cancel | Subscription cancel |
| Pro Trial Seat grant (M17) | §8.6 vendor invite form | No Stripe event — internal allocation only |
| Pro Trial Seat → paid conversion | Day 28–31 email + checkout flow | Checkout Session, Subscription |
| Refund (monthly money-back-guarantee window) | Support-initiated | Refund against Charge |
| Credit (referral M16 payout) | Referral redemption | Customer balance credit |
| Enterprise contract | Outside Stripe — DocuSign + MSA | Manual invoice outside Stripe initially; Stripe Invoicing at contract execution |

**Stripe webhook handling:** All Stripe events handled idempotently via `event_id` keyed in a `stripe_webhook_log` table. Retry with exponential backoff; DLQ after 5 failures per §6.19 Master Summary webhook pattern (the same pattern applied internally to Stripe inbound).

**Per-console plan assignment:** Plans activate per console, not per Org (§2.5 Master Summary, §11 Seller Pricing). A single Stripe Customer holds multiple Subscriptions — one Subscription per active console (Buyer, Seller) — sharing one payment source. AI Wallet balance is Org-scoped and pooled across both consoles' budgets (§2.5 Master Summary).

---

## Closing Note — Operational Readiness Checklist for Launch

Before the PLG engine can be considered operational, every item below must be green:

**Product surface — buyer-side:**
- [ ] 7-step Buyer Onboarding live (C.121)
- [ ] 19+ templates seeded in Template Library (§2.4)
- [ ] Template Discovery visible in Workspace Creation + Welcome Screen + Cmd+K (§2.4)
- [ ] 4 contextual upgrade triggers firing (§4.1) with carry-over language
- [ ] Usage Dashboard visible per-capability with 50/80/100% budget notifications

**Product surface — seller-side:**
- [ ] 7-stage Seller Onboarding live (§6.28.2)
- [ ] Hero Moment: pre-arrival enrichment + bootstrap queue + progress storytelling UI + landing counter all working
- [ ] Inline citations + KB-gap detector + live budget counter on every Bid Workspace
- [ ] 5 upgrade nudges firing at the three conversion moments + win/loss debrief (§4.4)
- [ ] Upgrade Carry-Over Guarantee copy visible at every ceiling hit
- [ ] Published-from-Day-One Seller Profile default (§6.15.1)

**Growth mechanics — launch set (M1, M2, M4, M5, M8, M14, M15, M17):**
- [ ] M1 magic-link invite surface with anti-spam controls
- [ ] M2 Public Selection Report link with watermarking + per-section redaction
- [ ] M4 "Kick off next evaluation" CTA at Phase 13
- [ ] M5 anonymous templated vendor-invite outreach
- [ ] M8 Organizational Intelligence surfaces (in-app dashboard)
- [ ] M14 one-click bid-success share CTA on win-debrief
- [ ] M15 Ghost-Bid Importer (Opus capability + review UI)
- [ ] M17 Pro Trial Seat pool + 30-day auto-downgrade + data preservation

**Infrastructure:**
- [ ] AI Wallet service, outcome resolver, nightly cost-base job
- [ ] Stripe Checkout + webhook + Subscription model per-console
- [ ] Magic-link SSO orchestrator with parallel bootstrap (§6.28.2 required capability)
- [ ] PostHog event taxonomy covering every event in §3.8 and §7

**Measurement:**
- [ ] PQL scoring service running hourly (§7)
- [ ] Growth loop dashboard with weekly trend data
- [ ] Seller Activation dashboard with p50/p90/p99 per stage (§3.8)
- [ ] Enterprise-route trigger Slack alert (§4.6)
- [ ] Usage Dashboard per-capability spend, acceptance rate, top consumers

**Anti-spam and integrity:**
- [ ] DMARC / SPF reputation, shared-use domain detection, spam ML classifier (§3.5)
- [ ] Vendor Opt-Out Global Registry (C.123)
- [ ] Signal Integrity Monitor (C.100)
- [ ] k-anonymity floors enforced (k=5 signal, k=10 aggregate, k=20 market intelligence)

**Legal / policy:**
- [ ] 90-day read-only preservation on all downgrades (§8.5)
- [ ] DSAR and right-to-erasure compatibility preserved (§6.27)
- [ ] Honest KB Portability guarantee (§6.13.7)

*Authored Extension — requires human sign-off.* This checklist is the operational gate for launching PLG. It is not a substitute for the engineering build-checklist in `Build_Execution_Strategy.md` or the Linear sequencing in `Linear_Execution_Blueprint.md`; those documents govern engineering execution. This checklist governs whether the PLG surface is ready to support the revenue model.

---

**Document version.** 1.0 (2026-04-20). Supersedes any prior PLG draft. Changes require reconciliation against `Sourcera_Master_Summary.md`, `Sourcera_Seller_Pricing_Strategy.md`, `Sourcera_Buyer_Pricing_Strategy.md`, and `GTM_POSITIONING.md` per the Source-of-Truth Hierarchy in `GTM_Project_Instructions.md`.
