# Sourcera — GTM Growth Tactics

**Version:** 1.0
**Date:** 2026-04-20
**Purpose:** Twenty-four additional growth experiments that amplify the existing M1–M17 mechanics and the ten core loops defined in `Sourcera_Master_Summary.md §3`. Every experiment is scoped for one person, ≤2 weeks of execution, and ≤$500 of spend unless the economics clearly justify more. Paid acquisition is deferred until an organic channel is instrumented and yielding.
**Source authority:** `Sourcera_Master_Summary.md` v1.1 §3 (M1–M17, Loops 1–10, Hero Moment) · `GTM_POSITIONING.md` v1.0 §1 (ICP), §2–§3 (Personas), §6 (Category) · `GTM_PLG_ARCHITECTURE.md` v1.0 §1–§3 (Entry paths, activation), §5 (Mechanic execution plan).
**Status:** Authoritative growth-experiment inventory for the first 120 days post-launch. Supersedes ad-hoc tactical notes only; does not replace the mechanic specs themselves.

---

## How To Read This Document

Each experiment is a self-contained card with a fixed ten-field schema (Name, Amplifies, Hypothesis, Tactic, Time-to-execute, Cost, Primary metric, Success threshold, Kill threshold, Leverage). The Amplifies field cites the specific M-mechanic (M1–M17) or growth loop (Loop 1–10) being multiplied; **new** indicates a net-new mechanic proposed here as an Authored Extension that needs to be integrated into `Sourcera_Master_Spec.md §13.3` before build.

Six categories mirror the asks in the brief: Product-Led Virality Amplifiers, Content & SEO Hacks, Community & Social, Seller Supply Acceleration, Launch & PR, and Referral & Incentive. Two final sections — the Prioritized Execution Queue and the First-Five Recommendation — rank every experiment by `(impact × probability) / time investment` and name which to run first.

Leverage is the qualitative assessment of how much ongoing, compounding value each experiment yields after it ships. High leverage means the asset keeps working with zero marginal labor (SEO pages, embeds, badges, auto-generated receipts). Low leverage means the experiment is one-shot or requires continued hand-curation.

**Pricing anchor (for reference in kill thresholds):** Buyer Starter $299/mo annual, Growth $799, Scale $1,999. Seller Starter $149/mo annual, Growth $499, Scale $1,499. Blended first-year ACV on conversion is in the $1.8K–$6K range per paid Org depending on tier.

---

## CATEGORY 1 — Product-Led Virality Amplifiers

Tactics that amplify mechanics already shipped inside the product surface — shared artifacts (M2, M3), forced-signup paths (M1, M5, M15, M17), and post-close momentum (M4, M14).

### 1.1 Selection Report Replay Reel

| Field | Detail |
|---|---|
| Name | Selection Report Replay Reel |
| Amplifies | M2 (Selection Report Public Link) · Loop 4 (Seller-Profile SEO) via embedded Sourcera watermark |
| Hypothesis | If we auto-generate a 15-second animated replay of an evaluation's phase-by-phase progression as the OG image on every public Selection Report link, then click-through and inbound signups per share will rise ≥40%, because animated previews outperform static PDFs by ~30–50% on LinkedIn and ship natively in every platform unfurl. |
| Tactic | (1) Add a post-close job to the Phase 13 close pipeline that renders a 1080×1080 MP4/GIF showing the 13-phase gauge filling sequentially with the final Time-Saved counter landing on frame 13. (2) Serve the reel as the OG:image on every `/selection-report/:share_id` page. (3) Add a visible *"Share this report"* button inside the in-product Selection Report viewer that pre-fills LinkedIn and X with the reel attached. (4) Instrument click-through via a unique `?ref=replay_reel` UTM to segment SEO/shared traffic. |
| Time to execute | 5–8 days (rendering infra + one frontend ship + PostHog event wire-up) |
| Cost | $0 (ffmpeg + existing assets) |
| Primary metric | Signups per 1,000 Selection Report share views |
| Success threshold | ≥40% lift vs. static-PDF baseline; ≥2 inbound Buyer Free signups per 100 shares |
| Kill threshold | <15% lift after 4 weeks *or* reel-render cost exceeds $0.02 per render |
| Leverage | **High** — every closed evaluation produces one, compounding forever |

### 1.2 Evaluation Certificate Embed Kit

| Field | Detail |
|---|---|
| Name | Evaluation Certificate Embed Kit |
| Amplifies | M3 (Evaluation Certificate Badge) · Loop 4 (Seller-Profile SEO — Schema.org) |
| Hypothesis | If we ship a one-click *"Get embed code"* for the M3 badge (HTML + Schema.org JSON-LD + OG meta + three sizes), then winning-vendor websites will embed it at ≥25% adoption, producing high-authority backlinks to `sourcera.com/certified/:bid_id` and compounding domain authority per the SEO moat thesis in §3.4 Master Summary. |
| Tactic | (1) Post-win, on the Seller Bid Workspace close screen, surface *"Your win is verifiable. Embed the badge."* (2) Generate three embed variants: small footer chip, trust-page card, LinkedIn image. (3) Include `itemtype="https://schema.org/Certification"` JSON-LD pointing at the public certificate page. (4) Track embed adoption by pinging the certificate endpoint and emitting a PostHog `certificate_embed_detected` event when the referrer chain includes the winning-vendor domain. (5) Email winners at T+7 and T+30 with reminder + one-click copy. |
| Time to execute | 4–6 days |
| Cost | $0 |
| Primary metric | % of winning sellers with detected embed within 30 days of bid close |
| Success threshold | ≥20% embed adoption; ≥1 Buyer Free signup per 10 embeds via backlink referral within 90 days |
| Kill threshold | <8% embed adoption after 60 days |
| Leverage | **High** — backlinks are the single most defensible SEO asset for M9/M11 rankings |

### 1.3 Stakeholder Scorecard Digest Email

| Field | Detail |
|---|---|
| Name | Stakeholder Scorecard Digest Email |
| Amplifies | M1 (Stakeholder Read-Only Invite) · M7 (Suggested Team Discovery) |
| Hypothesis | If every stakeholder invited under M1 receives a weekly digest summarizing their scoring participation, their team's phase velocity, and a one-click *"Invite a peer"* CTA, then M7 cross-team discovery events will rise ≥2× and M1 activation (first login within 7 days) will rise ≥15%, because the digest creates a recurring re-entry surface that the one-time magic-link email does not. |
| Tactic | (1) Add a weekly scheduled job that queries all active Stakeholder memberships and renders a personalized HTML digest via Loops.so: "Your team is 60% through Phase 10 — 3 scoring items are assigned to you." (2) Bottom-of-email CTA: *"Know a [peer role] who'd be on this eval? Invite them — they join as a Guest."* (3) Respect notification preferences (§6.11). (4) Instrument open + click + post-click invite flow. |
| Time to execute | 3–5 days (Loops.so template + cron job + one PostHog event) |
| Cost | $0 (Loops.so already in stack) |
| Primary metric | Stakeholder-to-active-contributor conversion within 14 days + M7 invites triggered from digest |
| Success threshold | ≥30% open rate, ≥8% click rate, ≥1 M7 invite per 50 digests |
| Kill threshold | <3% click rate after 6 weeks *or* unsubscribe rate >2% |
| Leverage | **High** — runs weekly with zero marginal cost once shipped |

### 1.4 Bid-Win Confetti Share with Champion Tag

| Field | Detail |
|---|---|
| Name | Bid-Win Confetti Share with Champion Tag |
| Amplifies | M14 (Seller Bid Success Share) · M2 (Public Selection Report link) |
| Hypothesis | If the M14 one-click social post pulls in the buyer-side champion's name as a pre-populated LinkedIn tag (only when the buyer has explicitly opted the workspace into public attribution per §6.37.x), then click-through and comment-thread engagement on the seller's share will rise ≥3× vs. untagged, producing materially more buyer-side inbound per share — because dual-tagged posts average 4–7× the impressions of single-party posts on LinkedIn. |
| Tactic | (1) Add a *"Publish with champion tag"* opt-in to the buyer-side Phase 13 close flow; the champion is the Workspace Owner (§6.22). (2) When enabled, the M14 share copy pre-fills: *"Thanks to @[Champion] at [Buyer Company] for running a rigorous evaluation on Sourcera. Proud to be the winning vendor."* (3) Gate behind mutual consent — both sides must toggle on; default off. (4) Track which seller-side shares carry champion tags and monitor impressions via LinkedIn analytics if accessible, otherwise via click-through UTMs. |
| Time to execute | 4–6 days (opt-in UI both sides + copy template + consent audit log) |
| Cost | $0 |
| Primary metric | Impressions + signup clicks per tagged M14 share vs. untagged baseline |
| Success threshold | ≥2.5× impression lift; ≥1 Buyer Free signup per 15 tagged shares |
| Kill threshold | Any compliance incident involving un-consented tagging; <1.3× lift after 40 tagged shares |
| Leverage | **Medium** — requires buyer opt-in per bid; compounds only when enabled |

### 1.5 Time-Saved Receipt Sharecard

| Field | Detail |
|---|---|
| Name | Time-Saved Receipt Sharecard |
| Amplifies | M8 (Org Intelligence Value Curve) · Loop 5 (Free-AI-Teaser-to-Paid) · **new** (Viral receipt artifact) |
| Hypothesis | If after every Pre-Scoring run the buyer is offered a one-click *"Share this receipt"* button that renders the Time-Saved Baseline (§6.36) as a branded social card — *"My team just graded 120 cells in 18 seconds. ~4.3 hours saved."* — then 5–10% of runs will produce a share and each share will drive ≥0.5 Buyer Free signups, because loss/gain counters outperform product screenshots by ~2× on developer-adjacent LinkedIn. |
| Tactic | (1) Post-Pre-Score, show an inline non-modal chip: *"You just saved 4.3 hours. Share it?"* (2) Clicking opens a 1200×628 render with the Sourcera mark, the run's savings number, and the Workspace's category (e.g., "SIEM evaluation — 4.3h saved"). (3) Public share URL is `/share/receipt/:run_id` — a single public page the cardimage links to, which itself contains a signup CTA. (4) Anonymize the buyer Org name by default; opt-in to reveal. |
| Time to execute | 3–5 days |
| Cost | $0 |
| Primary metric | Share-click rate per Pre-Scoring run · signups per 100 receipt-page views |
| Success threshold | ≥5% of Pre-Scoring runs produce a share; ≥0.5 signups per 100 receipt views |
| Kill threshold | <1.5% share rate after 4 weeks |
| Leverage | **High** — runs on every Pre-Score forever |

### 1.6 Template Fork Attribution Chain

| Field | Detail |
|---|---|
| Name | Template Fork Attribution Chain |
| Amplifies | Loop 2 (Template-Clone-Attribution) · Loop 9 (Template Publish Incentive) · M9 (Per-Category Pages) |
| Hypothesis | If every cloned template carries a multi-hop attribution chain — *"Originally published by VendorA → forked by Buyer1 → forked by Buyer2"* — then clone rates on seller-authored templates will rise ≥50% and the implicit social proof will compound the SEO ranking of the originating Seller's Software Page, because multi-hop lineage is a psychologically stronger trust signal than single-author attribution. |
| Tactic | (1) Extend the `template_clone_history` entity (C.38) to retain an ordered list of prior forks. (2) On the public Template Discovery landing card, display *"Cloned by 147 teams, originally authored by [Seller]"* with the full lineage visible on hover. (3) Every fork emits a backlink ping to the originating Seller's Software Page. (4) The M9 Category Page lists the top-5 templates by clone count per category. |
| Time to execute | 5–7 days (data-model extension + UI surface + SEO wiring) |
| Cost | $0 |
| Primary metric | Clones per published seller-authored template per month |
| Success threshold | ≥1.5× baseline clone rate within 60 days; ≥2 inbound Seller Organic signups per top-10 template per month |
| Kill threshold | No measurable lift after 90 days |
| Leverage | **High** — attribution is durable and compounds per fork |

---

## CATEGORY 2 — Content & SEO Hacks

Tactics that amplify the automated SEO surfaces (M9, M10, M11, M12, M13) and build the per-category organic-search moat that §3.4 Master Summary names as Sourcera's structural defense against Gartner and G2.

### 2.1 Sourcera-vs-Competitor Page Factory

| Field | Detail |
|---|---|
| Name | Sourcera-vs-Competitor Page Factory |
| Amplifies | M11 (Software Comparison Pages) |
| Hypothesis | If we publish 40–60 "Sourcera vs [competitor]" pages covering every named competitor in the `GTM_POSITIONING.md §4.1–§4.2` matrix plus every Responsive/Loopio/Coupa alternative commonly typed into Google, then branded-competitor-search traffic will materially feed Buyer Starter conversion because branded-alternative searchers are already past the "do I need this" question. |
| Tactic | (1) Extend the existing `comparison_page_generation` capability to accept a fixed competitor set from `GTM_POSITIONING.md §4`. (2) Publish 40 pages across two batches: 20 buyer-side (Sourcera vs Coupa / Ivalua / Jaggaer / Responsive / G2 / Tropic / Vendr / Airtable-for-RFP / Smartsheet / SharePoint / Excel-RFP / Workato-RFP / etc.) and 20 seller-side (Sourcera vs Responsive / Loopio / Qvidian / RFP360 / Upland Qvidian / etc.). (3) Each page is 1,500–2,500 words with a rebuttal matrix, price anchor, and one-click *"Start a free evaluation"* CTA. (4) Schema.org `SoftwareApplication` markup on every page. (5) Submit to Google Search Console within 48h of publish. |
| Time to execute | 8–12 days (capability extension + editorial review pass + Search Console submission) |
| Cost | $40 (capability Opus spend to draft 40 pages at ~$1/page) |
| Primary metric | Impressions in Search Console for "sourcera vs X" and "X alternative" queries within 90 days |
| Success threshold | ≥10K monthly impressions by month 3; ≥15 Buyer Free signups per month attributed via UTM |
| Kill threshold | <3K monthly impressions by month 3 *and* <4 signups per month |
| Leverage | **Very High** — SEO compounds indefinitely; this is the single largest leverage play in the queue |

### 2.2 Category Template SEO Landing Pages

| Field | Detail |
|---|---|
| Name | Category Template SEO Landing Pages |
| Amplifies | M9 (Per-Category Pages) · Loop 2 (Template-Clone-Attribution) |
| Hypothesis | If each of the 19 curated seed-category templates (see `GTM_PLG_ARCHITECTURE.md §2.4`) gets a dedicated public landing page at `/templates/[category]/[template-slug]` with a visible preview of the first 10 requirements and a free-to-clone CTA, then long-tail traffic for "SIEM RFP template," "SOC 2 RFP template," etc. will convert Wedge-ICP buyers mid-evaluation at a materially higher rate than organic signup because they arrive with active pain. |
| Tactic | (1) Ship a public `/templates` gallery + per-template pages rendered from existing Template Library data (§6.10, C.37). (2) Each page: template title, category tags, sample 10 requirements (with the other 90+ behind a free-signup gate), structured FAQ, and "Clone to a free Workspace" primary CTA. (3) Schema.org `CreativeWork` + `HowTo` JSON-LD. (4) Interlink from M9 Category Pages. (5) Target keywords from the Ahrefs long-tail expansion of the 19 categories. |
| Time to execute | 6–9 days |
| Cost | $0 (templates already curated) |
| Primary metric | Organic sessions to `/templates/*` and signups from template-start flow |
| Success threshold | ≥5K monthly organic sessions by month 4; ≥8% of sessions start a workspace from the template |
| Kill threshold | <1K sessions by month 4 *or* <1% workspace-start rate |
| Leverage | **Very High** |

### 2.3 Requirement Question Bank Long-Tail Pages

| Field | Detail |
|---|---|
| Name | Requirement Question Bank Long-Tail Pages |
| Amplifies | M10 (How to Evaluate [X] Guides) · M9 |
| Hypothesis | If we publish the 50–150 canonical requirement questions from each seed-category template as individual long-tail SEO pages ("Does [vendor] support SAML SSO?", "What is [vendor]'s SOC 2 status?"), each with AI-drafted buyer guidance, then the long-tail cumulative traffic (thousands of low-volume queries) will deliver 3–5× more Wedge-ICP signups than a handful of high-volume category pages, because mid-evaluation buyers search these question-shaped queries more than category names. |
| Tactic | (1) Programmatic page generation from the Requirements layer of each seeded template. (2) Each page: the question phrased as a title, a 300-word AI-drafted explainer on what to look for, a *"How to score this in Sourcera"* block linking to the FM/PM/EJ rubric (§4 Master Summary), a CTA *"Get the full template."* (3) Target 1,500–3,000 pages total across 19 templates. (4) Aggressive internal interlinking via per-category indexes. (5) Robots.txt crawl-rate check — Google must index >30% in 60 days or the pages get rewritten with richer content. |
| Time to execute | 9–13 days (programmatic generation + editorial QA pass on a sample + Search Console submission) |
| Cost | $60 (capability spend) |
| Primary metric | Indexed page count + cumulative monthly organic sessions |
| Success threshold | ≥40% indexation at day 60; ≥25K cumulative monthly sessions by month 6 |
| Kill threshold | <15% indexation at day 60 (indicates Google treating as thin content) |
| Leverage | **Very High** — classic programmatic SEO play with massive compounding |

### 2.4 Compliance Framework Cheat Sheets (Gated PDF)

| Field | Detail |
|---|---|
| Name | Compliance Framework Cheat Sheets |
| Amplifies | M10 (How-to-Evaluate Guides) · M6 (Domain-Based Auto-Join) via capturing corporate email domains at gate |
| Hypothesis | If we publish six one-page gated PDFs mapping SOC 2 / ISO 27001 / HIPAA / NYDFS 500 / DORA / PCI-DSS 4.0 controls to concrete RFP questions, then we capture the CISO-adjacent buyer persona (Elena, `GTM_POSITIONING.md §2.3`) at the moment of highest intent — mid-audit remediation — at ≥12% email-to-signup rates, because this is the exact artifact her team would otherwise build from scratch. |
| Tactic | (1) Author six cheat sheets using the existing `policy_parse` capability to extract control-to-question mappings. (2) Gate behind a two-field form (work email + company name). (3) Email capture routes through Loops.so to a three-email nurture sequence that offers a free Workspace preloaded with the compliance-mapped template. (4) Promote via LinkedIn thought-leader posts and one Reddit `r/cybersecurity` cross-post per cheat sheet. |
| Time to execute | 7–10 days |
| Cost | $80 (Opus draft cost + minor design labor) |
| Primary metric | Email captures → Free signups within 14 days |
| Success threshold | ≥500 email captures in first 60 days; ≥10% email-to-signup rate |
| Kill threshold | <150 email captures in 60 days |
| Leverage | **Medium-High** — each cheat sheet compounds via search but needs refresh every 12 months |

### 2.5 Public Heat Map Weekly Digest

| Field | Detail |
|---|---|
| Name | Public Heat Map Weekly Digest |
| Amplifies | M13 (Public Marketplace Heat Map) · M12 (Market Intelligence Reports) |
| Hypothesis | If we publish a weekly email summarizing what categories are heating up on the Sourcera Heat Map (k≥10 floor), with commentary from the founder, then we build a 3,000+ procurement-and-RFP-professional audience inside 180 days that dual-funnels into buyer-side thought-leadership credibility and seller-side demand-signal awareness. |
| Tactic | (1) Scheduled Friday AM digest built off M13's aggregated signal (C.71). (2) Distribution: pre-launch list-building via LinkedIn signup form + inline subscribe prompt on every M9/M11 page. (3) Founder adds 200 words of commentary per edition — what the spike means, what it predicts, what vendors should do. (4) Cross-post to a public `/heatmap/weekly/:date` page for SEO replay. |
| Time to execute | 6–8 days to build the pipeline; ongoing weekly ~2h |
| Cost | $0 (Loops.so + existing M13) |
| Primary metric | Subscribers + weekly open rate |
| Success threshold | ≥500 subscribers by month 2, ≥3K by month 6; ≥35% sustained open rate |
| Kill threshold | <300 subscribers by month 3 *or* <20% open rate |
| Leverage | **High** — builds an owned audience channel Sourcera can re-use for launches, surveys, and announcements |

### 2.6 Directory Submission Sprint

| Field | Detail |
|---|---|
| Name | Directory Submission Sprint |
| Amplifies | M9/M11 indirectly (domain authority lift) · **new** (SEO backlinks) |
| Hypothesis | If we submit Sourcera to 30 relevant procurement / RFP / SaaS / AI directories and category listings in one focused week, then the inbound backlinks will lift domain authority enough to accelerate M9/M11/M2.3 page rankings by 2–4 weeks vs. organic-only compounding. |
| Tactic | (1) Build a spreadsheet of 30 target directories: G2 (claim only, not pay-to-play), Capterra, GetApp, Software Advice, Product Hunt, BetaList, AlternativeTo, StackShare, Procurement Leaders vendor directory, Spend Matters vendor list, SaaS genius, FounderPass, SaaSHub, etc. (2) Standardize a 50-word blurb, 100-word blurb, 250-word blurb, and three screenshot sizes. (3) One week of concentrated submissions; solo operator can handle 5–6 per day. (4) Track approvals in the same sheet; target ≥20 accepted within 30 days. |
| Time to execute | 5 days active + 30 days passive wait |
| Cost | $0 (no paid placements) |
| Primary metric | Live backlinks + referral sessions |
| Success threshold | ≥20 live backlinks within 30 days; ≥200 referral sessions/mo within 60 days |
| Kill threshold | <8 accepted submissions within 30 days (indicates spam filter or positioning issue) |
| Leverage | **Medium** — one-time sprint, backlinks compound for months |

---

## CATEGORY 3 — Community & Social

Audience and authority tactics. Every experiment below builds an owned channel, founder reputation, or peer-network credibility — all of which feed the Primary Buyer ICP (Priya, Dan, Elena, Marcus, Jordan) and the Seller Organic ICP (Sam, Aisha, Leo, Rachel).

### 3.1 Founder Build-in-Public Daily LinkedIn

| Field | Detail |
|---|---|
| Name | Founder Build-in-Public Daily LinkedIn |
| Amplifies | All organic signup paths · M2/M14 share virality (shares from a larger audience travel further) |
| Hypothesis | If the founder posts 5–7 times per week on LinkedIn for 90 days, mixing category-creation arguments, PLG mechanics, live ICP research, and hero-moment proof clips, then follower count grows to 8–12K inside 90 days and inbound customer conversations reach ≥4 per week by day 60, because B2B founders posting with this cadence consistently hit these numbers in adjacent categories (Linear, PostHog, Supabase — all referenced in `GTM_PLG_ARCHITECTURE.md`). |
| Tactic | (1) Publish a content calendar mapping 14 content pillars to 90 days: (a) category-creation arguments, (b) PLG math, (c) pricing philosophy, (d) dual-console architecture, (e) hero-moment breakdowns, (f) customer call-outs (anonymized), (g) competitive reframes, (h) mistakes + corrections, (i) hiring posts, (j) product demos (15-sec clips), (k) procurement horror stories, (l) data from Heat Map, (m) opinion on industry news, (n) philosophical takes. (2) Batch-write in two-week sprints; schedule via Taplio or Buffer. (3) Every post ends with a concrete next step (*"Free tier handles one live evaluation — take 60s to sign up at sourcera.com"*) or a direct ask (*"Who's running an audit-driven eval right now? DM me."*). (4) Engage every comment within 4 hours. |
| Time to execute | 2 days setup; ongoing ~1h/day |
| Cost | $0 (or $40/mo Taplio if scheduling pain justifies it) |
| Primary metric | Followers + inbound DMs/wk + UTM-tracked signups |
| Success threshold | ≥8K followers by day 90; ≥4 inbound customer DMs/week by day 60; ≥15 UTM-tagged signups/mo by day 90 |
| Kill threshold | <4K followers by day 90 *or* <1 inbound DM/week by day 90 |
| Leverage | **Very High** — audience compounds and becomes owned distribution for every future launch |

### 3.2 Procurement Heads Invite-Only Slack

| Field | Detail |
|---|---|
| Name | Procurement Heads Invite-Only Slack |
| Amplifies | M16 (Buyer Referral Credit) via peer-to-peer trust · M1/M7 via cross-Org introductions |
| Hypothesis | If we curate a 100-person invite-only Slack for VPs/Directors of Procurement (Priya ICP) and run it as a no-Sourcera-pitch value surface for the first 90 days, then it produces ≥3 paid Buyer Org conversions per month by month 4 from direct peer-to-peer referrals, because Priya trusts Priyas and the structured evaluation category has zero existing community surface. |
| Tactic | (1) Curate an initial 25 hand-invited heads from LinkedIn outbound (NOT Sourcera customers — peers). (2) Founder-moderated with explicit no-pitch rule. (3) Three named channels: `#cycle-time-benchmarks`, `#audit-findings-to-swap`, `#tool-review` (no vendor marketing allowed; Sourcera content banned). (4) Run a monthly AMA with a guest: a CPO, an auditor, a private-equity operator. (5) Share the quarterly Heat Map 24h before public release — member benefit. (6) Growth via member invites only, capped at 2 per member per quarter. |
| Time to execute | 10–14 days (25-person launch + channel scaffolding + 3 weeks of warm-up) |
| Cost | $0 (free Slack), ~$300 in coffee for hand-invite outbound if meeting in person |
| Primary metric | Active members (replies/week) + referrals-to-Sourcera-eval attributed from community |
| Success threshold | 100 active members by month 3; ≥3 paid conversions/mo attributable by month 4 |
| Kill threshold | <40 active members by month 3 *or* no conversions by month 5 |
| Leverage | **High** — once the community is self-sustaining, it's a durable referral engine |

### 3.3 Procurement Horror Stories Podcast

| Field | Detail |
|---|---|
| Name | Procurement Horror Stories Podcast |
| Amplifies | M2/M14 via episode clips · M16 via guest-vendor referral loops · **new** (authority surface) |
| Hypothesis | If we ship a twice-monthly 30-minute podcast where procurement leaders share real (anonymized) failed evaluations and what they'd do differently, then each episode generates 4–6 LinkedIn clips of 60 seconds each, each guest brings their own audience, and the archive compounds into a top-of-funnel asset that delivers ≥8 inbound demos/month by month 5. |
| Tactic | (1) Book guests directly from the Slack community (§3.2) and LinkedIn outbound to named procurement leaders. (2) Record remote via Riverside.fm. (3) Release schedule: Tuesdays of weeks 1 and 3, monthly. (4) Each episode gets 5 vertical-video clips edited by Descript auto-highlights, cross-posted to LinkedIn / X / YouTube Shorts / Reddit r/procurement. (5) Each episode page lives on `sourcera.com/podcast/:slug` with full transcript for SEO. (6) Guest promotes on their own LinkedIn (captured as episode condition). |
| Time to execute | 7–10 days setup; ongoing 4h per episode |
| Cost | $40/mo (Riverside) + $100 one-time (intro music, cover art via Fiverr) |
| Primary metric | Episode listens + LinkedIn clip impressions + podcast-attributed signups |
| Success threshold | ≥8 episodes published by month 5; ≥25K LinkedIn impressions/episode via clips; ≥8 demo inquiries/month by month 5 |
| Kill threshold | <15K impressions per episode after 6 episodes |
| Leverage | **High** — evergreen audio archive + clip library |

### 3.4 Weekly Office Hours Live Demo

| Field | Detail |
|---|---|
| Name | Weekly Office Hours Live Demo |
| Amplifies | Path A activation (Buyer Free) · Path C (Seller Organic) · M1 (stakeholders can join with no commitment) |
| Hypothesis | If the founder runs a public 30-minute Zoom every Thursday at 12pm ET, open registration, where live attendees see a real demo of a live evaluation workflow and can ask anything, then ≥15 qualified attendees register per session by week 6, and ≥25% of attendees convert to Free within 14 days (vs. ~10% for cold signup), because live demos with an operator answering objections convert ~2–3× cold landing. |
| Tactic | (1) Set up a public registration page via Luma. (2) Weekly Thursday 12pm ET, 30 min, no slides — live dashboard walkthrough of a sample Workspace the founder runs himself. (3) Record and post to YouTube; clip for LinkedIn. (4) Promote via the Heat Map Weekly Digest (§2.5), daily LinkedIn posts (§3.1), and Loops.so blast to Free-tier users who haven't yet hit aha. (5) Follow-up email to attendees at T+24h with a personalized *"Need help setting up your [category] evaluation? 15-min sync."* |
| Time to execute | 3 days setup; ongoing 1h/week |
| Cost | $20/mo (Luma Pro) |
| Primary metric | Registrations, attend rate, 14-day Free-to-Workspace-create conversion |
| Success threshold | ≥15 registrations, ≥8 live attendees, ≥3 Free conversions per session by week 6 |
| Kill threshold | <6 registrations per session after 4 sessions |
| Leverage | **Medium** — weekly labor cost doesn't compound, but each session produces recorded asset |

### 3.5 Anatomy-of-a-Failure LinkedIn Serial

| Field | Detail |
|---|---|
| Name | Anatomy-of-a-Failure LinkedIn Serial |
| Amplifies | §3.1 Founder posting · M10 (How-to-Evaluate Guides) via inbound-content cross-linking |
| Hypothesis | If we publish a weekly LinkedIn long-form post dissecting a real failed software evaluation — anonymized — in the format *"Here's what went wrong in this org, here's why the spreadsheet was the cause, here's how Sourcera's [specific feature] would have prevented it"* — then each post drives ≥2K impressions and ≥1 inbound DM per post, because concrete failures outperform abstract advice on LinkedIn 3–5×. |
| Tactic | (1) Source failures from: Slack community (§3.2), podcast episodes (§3.3), founder network, Reddit r/procurement. Anonymize aggressively. (2) Format: 1,200-word LinkedIn article, 6–8 screenshots/diagrams, bottom CTA to a dedicated sourcera.com/case-studies/:slug page. (3) Republish each to X as a thread and to the `sourcera.com/library` blog within 24h. (4) Weekly cadence, 12 posts minimum. |
| Time to execute | 2 days for first; ongoing 3h per post |
| Cost | $0 |
| Primary metric | Impressions per post, DMs per post, case-study-page organic sessions |
| Success threshold | ≥2K impressions avg, ≥1 inbound DM per post, ≥800 cumulative monthly sessions to case-studies page by month 4 |
| Kill threshold | <800 impressions avg after 4 posts |
| Leverage | **High** — each post doubles as a LinkedIn impression driver and an SEO asset |

---

## CATEGORY 4 — Seller Supply Acceleration

Tactics that fill the Marketplace with seller supply faster than the organic Path C (Seller Organic Signup) delivers. Every additional Seller Org compounds the M9/M11 SEO inventory and raises Match Score density for buyers — both of which are load-bearing for the supply-side flywheel defined in §3.4 Master Summary.

### 4.1 Paste-Last-Year's-RFP Unauthenticated Preview

| Field | Detail |
|---|---|
| Name | Paste-Last-Year's-RFP Unauthenticated Preview |
| Amplifies | M15 (Ghost-Bid Importer) |
| Hypothesis | If we ship a single-page public surface where any seller can paste a historical RFP, see the proposed KB entries and first-pass draft generated in ≤60 seconds *without signing up*, and convert by SSO-ing to save the result, then Seller Organic signups will rise ≥3× because the current M15 conversion requires signup-then-import — removing the signup gate in front of the Hero Moment collapses the activation cost to zero. |
| Tactic | (1) Build `sourcera.com/ghost-bid` — a paste field, a category dropdown, a big orange button. (2) The Ghost-RFP Ingestion capability (Opus, first-import-free lifetime allowance) runs against the pasted content in an unauthenticated session, writing results into a temporary `anonymous_ghost_bid_session` object (TTL 24h, zero PII). (3) The landing screen renders the proposed KB + draft; a prominent *"Save these to your free Sourcera account"* CTA triggers SSO and atomically copies the session into the new Seller Org's KB and Bid Workspace. (4) Anti-abuse: rate-limit 3 per IP per day, CAPTCHA on 2nd+ request, input size cap 500KB. |
| Time to execute | 10–14 days (unauthenticated session model, capability abuse controls, SSO copy-forward flow) |
| Cost | $50 (Opus spend for abandoned previews; converts at ~20%) |
| Primary metric | Preview completions → Seller signups within session |
| Success threshold | ≥500 previews/mo by month 3; ≥25% preview-to-signup conversion |
| Kill threshold | <150 previews/mo by month 3 *or* >5% abuse-flagged sessions |
| Leverage | **Very High** — removes the single largest Path C friction point |

### 4.2 Ghost-Bid Import Hackathon

| Field | Detail |
|---|---|
| Name | Ghost-Bid Import Hackathon |
| Amplifies | M15 (Ghost-Bid Importer) · M9 (Template Publish Incentive) |
| Hypothesis | If we run a time-boxed 72-hour hackathon where the top 10 sellers who import the most historical RFPs win featured Marketplace placement + a $500 cash prize each, then we ingest 200–500 ghost-bid artifacts in 72 hours — material Marketplace seeding that would otherwise take 3–6 months organically. |
| Tactic | (1) Announce via LinkedIn, the Slack community (§3.2), podcast (§3.3), and the Heat Map digest (§2.5). (2) Create a public leaderboard page at `sourcera.com/hackathon-leaderboard`. (3) Rules: each imported RFP must be a genuine past bid response (verified via the `ghost_rfp_ingestion` capability's quality-score filter at ≥0.7). (4) Prizes: top 10 each get $500 + 3 months Seller Growth for free + featured Marketplace card for 60 days. (5) Post-hackathon retrospective blog post; winners quoted as testimonials. |
| Time to execute | 5 days setup, 3 days execution, 2 days wrap |
| Cost | $5,000 ($500 × 10 winners) + $300 (Growth comped × 10 × 3mo ≈ $14,970 in Monopoly money that costs Sourcera ~$150 in AI infrastructure) — **exceeds the $500 anti-drift guideline, justified by: 200–500 KB artifacts ingested = 5–12 months of organic supply seeding compressed into 3 days** |
| Primary metric | RFPs ingested + new Seller Orgs created + post-event 90-day retention |
| Success threshold | ≥200 RFPs ingested; ≥100 new Seller Orgs; ≥40% of participants still active at 90 days |
| Kill threshold | <80 participants registered in the first 48h of announcement |
| Leverage | **Very High** — marketplace density is the gating factor for Path B conversion economics |

### 4.3 Concierge Loopio/Responsive Migration

| Field | Detail |
|---|---|
| Name | Concierge Loopio/Responsive Migration |
| Amplifies | M15 (via KB bulk import) · Path C activation |
| Hypothesis | If the founder personally offers white-glove migration from Loopio or Responsive for the first 30 sellers — zero-cost, 48h turnaround — then ≥20 of them convert to Seller Growth ($499/mo) within 30 days of migration, because the cost-benefit is unambiguous when the migration cost is zero and the incumbent cost is $15–35K/yr. |
| Tactic | (1) Author a one-page offer at `sourcera.com/migrate-from-loopio`. (2) The page: *"We'll migrate your Loopio KB to Sourcera in 48 hours. Free for the first 30 sellers. You keep your Loopio account running in parallel until you're convinced."* (3) Targeted LinkedIn outbound to RFP Managers (Leo ICP) with a Loopio mention in their bio. (4) Sales motion: a 30-min onboarding call, KB export from Loopio (the seller does this — Loopio allows full export per their own docs), Sourcera team (founder initially) maps export into Sourcera KB schema and runs `ghost_rfp_ingestion` over the seller's top 3 historical winning bids to bootstrap confidence. (5) Target: founder + 1 ops hire can support 10 migrations/wk. |
| Time to execute | 5 days setup; ongoing ~6h per migration |
| Cost | ~$15 Opus cost per migration × 30 = $450 |
| Primary metric | Migrations completed + Seller Growth conversions within 30 days post-migration |
| Success threshold | ≥25 migrations completed; ≥18 Growth conversions |
| Kill threshold | <10 migrations completed in first 90 days |
| Leverage | **Medium** — does not scale beyond ~10/wk without headcount; valuable for the first 100 paying Sellers as a competitive-displacement proof |

### 4.4 Active-RFP Detection Outbound

| Field | Detail |
|---|---|
| Name | Active-RFP Detection Outbound |
| Amplifies | M5 (Buyer-Pull Vendor Invite — inverted: Sourcera pulls sellers) · Forced-Signup path |
| Hypothesis | If we scrape public procurement job postings, state/local gov bid portals (SAM.gov, BidNet, etc.), and sales engineer job postings with "RFP response" in the description, then we surface 500–1,500 vendors per month currently hiring for RFP pain — the precise Leo-ICP trigger event — and outbound to them with a personalized *"We noticed you're hiring for RFP work, here's an 8-minute video of how Sourcera collapses that workflow"* message at ≥5% reply rate. |
| Tactic | (1) Weekly scrape of public job postings via an existing aggregator (e.g., the `firecrawl_seller_crawl` infra extended to LinkedIn/Indeed public job posts; respect robots.txt and rate-limit). (2) Tag posts where the job description contains keywords: "RFP," "proposal," "response library," "Loopio," "Responsive." (3) Personalized outbound via the existing `vendor_invite_suggestion` + founder-authored template; send from founder's email, one batch per week, 50/batch max. (4) Land on `/rfp-manager` landing page optimized for Leo ICP. |
| Time to execute | 7–10 days (scraper + template + landing page) |
| Cost | $0 infrastructure; $0 sending; time-capped labor |
| Primary metric | Reply rate + demo booking rate |
| Success threshold | ≥5% reply rate; ≥25 demos booked in first 60 days |
| Kill threshold | <2% reply rate after 200 sends |
| Leverage | **Medium** — sustained but labor-metered; not compounding |

---

## CATEGORY 5 — Launch & PR

High-leverage one-time amplification moments. Each is a single calendar slot; coordination and preparation drive the outcome quality.

### 5.1 Product Hunt Launch

| Field | Detail |
|---|---|
| Name | Product Hunt Launch |
| Amplifies | All entry paths · **new** (one-time visibility event) |
| Hypothesis | If we orchestrate a Product Hunt launch with a paid hunter, a pre-built 200-person voter list from LinkedIn + the Slack community + email subscribers, and a staged 48h amplification plan, then Sourcera achieves top-3 of the day and generates 1,500–4,000 product page visits + 150–400 signups in the 72h window. |
| Tactic | (1) Book a hunter (Chris Messina or similar tier) 14 days ahead. (2) Pre-launch asset kit: 30-sec demo video, 3 animated GIFs, 5-line tagline, 3-line subtitle, 10 gallery screenshots. (3) Launch calendar: target a Tuesday or Wednesday for best PH traffic. (4) 48h amplification: founder LinkedIn launch post, Slack community notification, newsletter blast, Reddit `r/SaaS` + `r/procurement` + `r/startups` posts, X thread, a paid sponsored placement on PH ($300). (5) Voter outreach script: each personal network contact gets a DM with the PH link 30 min after launch go-live. |
| Time to execute | 14 days prep; 48h execution |
| Cost | $300 (PH sponsored placement), $0 hunter fee if earned; if paying a tier-1 hunter then $200–500 |
| Primary metric | PH ranking + signups attributed via UTM |
| Success threshold | Top 5 product of the day; ≥200 signups attributed |
| Kill threshold | Finish outside top 15 — signal to skip PH for future features and over-index on category-specific channels |
| Leverage | **Medium** — one-time but produces a durable "PH #2 Product of the Day" social proof |

### 5.2 Hacker News Show HN — Dual-Console Architecture Post

| Field | Detail |
|---|---|
| Name | Hacker News "Show HN" — Dual-Console Architecture |
| Amplifies | Seller Organic Path · Marcus (VP IT) persona acquisition |
| Hypothesis | If we publish a technical "Show HN: The Dual-Console Architecture Behind Sourcera" post — not a product pitch, a genuine technical deep-dive on how buyer-seller data isolation is enforced at the query layer via Convex, why per-seat pricing breaks cross-functional procurement, and the outcome-accounted AI pricing model — then we hit the HN front page and generate 300–800 Marcus-persona signups in a 48h window. |
| Tactic | (1) Draft the post as a 2,000-word technical explainer at `sourcera.com/engineering/dual-console`. (2) Include: architecture diagram, code snippet of the query-level firewall enforcement, cost math of the outcome-accounted model (accepted 10× cost vs. rejected 1.05× cost). (3) Avoid marketing language entirely — HN readers smell it instantly. (4) Submit Tuesday/Wednesday 9am ET from an active HN account (accumulated karma via ≥30 prior comments). (5) Founder actively responds to every top-level comment for the first 6 hours; defend claims with source citations. |
| Time to execute | 4 days draft + review + hardened response doc for likely comments |
| Cost | $0 |
| Primary metric | HN ranking + signup spike within 48h |
| Success threshold | Reach front page top 20; ≥300 signups in 48h; ≥20 inbound technical DMs |
| Kill threshold | Post dies below rank 30 within 2 hours; no Sourcera HN attempt for 60 days afterward |
| Leverage | **Medium** — unrepeatable until a major new architecture milestone; but one front-page HN produces durable backlinks and dev-community credibility |

### 5.3 Industry Awards Submissions

| Field | Detail |
|---|---|
| Name | Industry Awards Submissions |
| Amplifies | Priya persona credibility; enterprise sales signal |
| Hypothesis | If we submit Sourcera to ISM's Supply Chain Innovation Award, ProcureCon Innovation Award, Spend Matters 50 Providers to Know, and the CPO Rising Awards, then even a shortlist placement produces a durable credibility badge that materially accelerates Enterprise sales cycles (shortens objection-handling on "is this a real company"). |
| Tactic | (1) Identify the four relevant awards with open submission windows in the next 120 days. (2) Draft a reusable 800-word submission narrative covering category-creation, PLG metrics (once the first cohort has data), and customer quotes from early adopters. (3) Submit against every applicable category. (4) Each submission produces a press-kit artifact usable in sales decks regardless of outcome. |
| Time to execute | 7 days (research + narrative + 4 submissions) |
| Cost | $0–$500 (some awards have submission fees; skip the ones that charge >$500) |
| Primary metric | Shortlist or win placements |
| Success threshold | ≥1 shortlist placement in first year |
| Kill threshold | No shortlists in first 18 months = drop awards as a GTM channel |
| Leverage | **Medium** — one-time per award cycle; badges last for years |

### 5.4 Lenny's / Modern Proposal Podcast Circuit

| Field | Detail |
|---|---|
| Name | Podcast Circuit — Top 20 |
| Amplifies | Founder LinkedIn (§3.1) · Priya/Leo/Sam persona acquisition |
| Hypothesis | If the founder appears on 20 podcasts in 90 days — operator podcasts (Lenny's, Modern Proposal, Procurement Unleashed, Operators, Lenny and Friends, SaaStr, Procurement Zen, etc.) — then the sustained audio footprint generates ≥60 inbound demo inquiries over 180 days, because podcast audiences convert to inbound requests at 2–4× the rate of written content for founder-led SaaS. |
| Tactic | (1) Target list of 30 podcasts; founder cold-pitches via LinkedIn DM + email with a compelling 3-line pitch. (2) Prepare 5 signature stories (the category-creation bet, the Dual-Console discovery, the pricing re-architecture moment, the first Hero Moment demo, the compliance-trigger conversion case). (3) Every episode ends with a clear CTA and a vanity URL (`sourcera.com/lenny`, `sourcera.com/modern-proposal`). (4) Clip every episode into 3 LinkedIn clips post-publish. |
| Time to execute | 3 days pitch + ongoing 1 episode/wk |
| Cost | $0 |
| Primary metric | Episodes booked + UTM-attributed signups |
| Success threshold | ≥15 episodes in 90 days; ≥60 attributed signups in 180 days |
| Kill threshold | <8 episodes booked in 60 days of outbound |
| Leverage | **High** — each episode is evergreen |

---

## CATEGORY 6 — Referral & Incentive

Every experiment in this category compounds an existing referral mechanic (M16 Buyer Referral, M17 Pro Trial Seat, Loop 9 Template Publish) with a gamified or asymmetric structure.

### 6.1 Give-a-Seat-Get-a-Seat (M17 Compounding)

| Field | Detail |
|---|---|
| Name | Give-a-Seat-Get-a-Seat |
| Amplifies | M17 (Buyer-Funded Pro Trial Seat) |
| Hypothesis | If any Scale/Enterprise buyer who grants a Pro Trial Seat (M17) that converts to a paid Seller within 30 days earns one additional Pro Trial Seat the following month (compounding generosity), then Pro Trial Seat utilization rises from the default 5/mo Scale baseline toward 8–10/mo in month 3+, materially increasing seller-side Forced-Signup volume and the Scale plan's buyer-facing value. |
| Tactic | (1) Extend the `buyer_funded_pro_trial_seat_grant` entity (§4.3.17) with a `grant_reward_source` field for reward-granted seats. (2) Monthly batch job checks all Pro Trial Seat grants that converted and awards a bonus seat to the granting buyer Org, with an in-app banner: *"Your Pro Trial Seat for [Vendor] converted — here's a bonus seat for next month."* (3) Cap bonus seats at +3 per buyer Org per month to avoid unbounded growth. (4) Track conversion-per-seat and award cost vs. incremental seller-side ARR. |
| Time to execute | 5–7 days (data model ext + job + banner copy + audit log) |
| Cost | $0 (cost is absorbed into the M17 buyer-plan economics) |
| Primary metric | Pro Trial Seats granted per Scale buyer per month (baseline vs. post-launch) |
| Success threshold | Average seats granted/mo rises from 2.8 (historical Scale default) to ≥4.5 by month 3 |
| Kill threshold | No measurable lift after 60 days *or* abuse rate >5% of bonus seats |
| Leverage | **High** — compounds monthly with zero marginal cost |

### 6.2 Double-Credit First-100 Buyer Referral

| Field | Detail |
|---|---|
| Name | Double-Credit First-100 Buyer Referral |
| Amplifies | M16 (Buyer Referral Credit) |
| Hypothesis | If we double the M16 credit ($500 to referrer + $500 to referee, vs. the default structured reward) for the first 100 successful referrals in a 90-day window, then referral volume rises 3–5× during the promotion and produces a short-term cohort whose word-of-mouth feeds organic M16 momentum post-promotion. |
| Tactic | (1) Announce the 2× credit via in-app banner, LinkedIn, the Heat Map digest, and a direct email to every paid buyer Org. (2) Countdown clock on the M16 referral page. (3) Apply existing M16 fraud controls (§C.74: same-domain self-referral block, payment-method overlap detection, minimum-activity gating). (4) Track both gross referral volume and conversion-to-paid rate to detect abuse. (5) At 100 referrals or 90 days, whichever first, promotion ends. |
| Time to execute | 4 days (copy + in-app surface + fraud-guard audit + monitoring dashboard) |
| Cost | Up to $100K at full utilization (100 × $1,000 total credit) — **only viable once unit economics prove out; gate behind CAC payback ≤12mo pre-approval** |
| Primary metric | Referrals initiated + converted + CAC payback |
| Success threshold | 100 referrals within 60 days; CAC payback ≤14 months; gross margin ≥60% on referred cohort |
| Kill threshold | CAC payback >18 months *or* conversion rate on referred <40% of organic benchmark |
| Leverage | **Medium-High** — compounds during window, fades after |

### 6.3 Template Clone Leaderboard with Cash Bounty

| Field | Detail |
|---|---|
| Name | Template Clone Leaderboard |
| Amplifies | Loop 9 (Template Publish Incentive) · M9 (Per-Category Pages) |
| Hypothesis | If we run a monthly public leaderboard of the top 10 most-cloned seller-authored templates and pay $1,000 cash bounty + 60-day Featured Marketplace placement to the #1 each month, then seller template publishing volume rises ≥5× over the baseline Template Publish Incentive, because the bounty converts the abstract "visibility credit" into a concrete economic prize. |
| Tactic | (1) Public leaderboard at `sourcera.com/templates/leaderboard` updated hourly. (2) Monthly winner announcement via the Heat Map digest + LinkedIn post + a personal video message from the founder. (3) Bounty funded from marketing budget; in-product banner on every Seller Console notifies sellers of the active bounty. (4) Fraud controls: clones from the same buyer Org within a 30-day window count once (prevents self-cloning rings). (5) Winners cannot win two months consecutively (forces top-of-funnel rotation). |
| Time to execute | 6 days (leaderboard page + hourly job + fraud-controls + first-month pre-promotion) |
| Cost | $12K/yr ($1K × 12 months) — **justified by projected 5–15 new seller-authored templates per month, each a durable Marketplace + SEO asset** |
| Primary metric | Templates published/mo + template clones/mo + Seller signups attributable to template landing pages |
| Success threshold | ≥8 new seller-authored templates published/mo by month 3; ≥1.5× clone volume vs. pre-launch baseline |
| Kill threshold | <3 new templates/mo by month 3 |
| Leverage | **Very High** — each bounty-winning template is a permanent Marketplace + M9 Category Page SEO asset |

### 6.4 Laid-Off Procurement Leader Free-Growth Program

| Field | Detail |
|---|---|
| Name | Laid-Off Procurement Leader Free-Growth Program |
| Amplifies | M16 (Buyer Referral) via community goodwill · §3.1 Founder LinkedIn virality |
| Hypothesis | If Sourcera offers 6 months of free Business Growth ($799/mo) to any laid-off procurement professional who posts their #OpenToWork status on LinkedIn, then the program generates substantial LinkedIn virality (the exact network where Priya, Jordan, and economic buyers live), creates 40–80 ambassador-recipients who bring Sourcera into their next role on paid plans, and produces durable community goodwill for the brand. |
| Tactic | (1) Announce via a founder LinkedIn post: *"If you're a procurement leader between roles, we'll give you 6 months of Sourcera Growth free. DM me."* (2) Process: LinkedIn-verified #OpenToWork, 15-min intake call with founder, a vanity comp code. (3) The recipient brings Sourcera into any future role as a known-tool; if they land at a pre-Sourcera org, the organic upgrade is near-guaranteed at month 7. (4) Cap program at 100 recipients. (5) Monthly post updating on recipient-employment progress — humans love the narrative. |
| Time to execute | 4 days setup; ongoing ~2h per recipient intake |
| Cost | $0 cash (comp codes); opportunity cost of forgone revenue if recipient would have otherwise paid — negligible in practice because the cohort is precisely the segment with no budget |
| Primary metric | Recipients enrolled + re-employed recipients who bring Sourcera to new employer within 12 months |
| Success threshold | ≥40 recipients in 90 days; ≥15 recipients re-land at orgs that convert to paid Sourcera within 12 months |
| Kill threshold | <15 recipients enrolled in 90 days (demand signal too weak) |
| Leverage | **Medium-High** — a deferred revenue play that pays back at month 12+ |

---

## Prioritized Execution Queue

Every experiment above has been scored on three dimensions: **Impact** (projected magnitude of signups, paid conversions, or durable asset value on a 1–5 scale), **Probability** (confidence the experiment hits its success threshold, 1–5), and **Time Investment** (total days of solo-operator labor). The ranking score is `(Impact × Probability) / Time`, normalized across the set. Ties are broken in favor of compounding leverage.

| Rank | Experiment | Category | Impact (1-5) | Probability (1-5) | Time (days) | Score | Leverage |
|---|---|---|---|---|---|---|---|
| 1 | Sourcera-vs-Competitor Page Factory | 2 SEO | 5 | 4 | 10 | 2.00 | Very High |
| 2 | Paste-Last-Year's-RFP Unauthenticated Preview | 4 Seller Supply | 5 | 4 | 12 | 1.67 | Very High |
| 3 | Category Template SEO Landing Pages | 2 SEO | 5 | 4 | 7.5 | 2.67 | Very High |
| 4 | Founder Build-in-Public Daily LinkedIn | 3 Community | 5 | 4 | 2 setup | 10.00* | Very High |
| 5 | Stakeholder Scorecard Digest Email | 1 Virality | 4 | 4 | 4 | 4.00 | High |
| 6 | Time-Saved Receipt Sharecard | 1 Virality | 4 | 4 | 4 | 4.00 | High |
| 7 | Requirement Question Bank Long-Tail Pages | 2 SEO | 5 | 3 | 11 | 1.36 | Very High |
| 8 | Evaluation Certificate Embed Kit | 1 Virality | 4 | 4 | 5 | 3.20 | High |
| 9 | Template Clone Leaderboard | 6 Referral | 5 | 3 | 6 | 2.50 | Very High |
| 10 | Selection Report Replay Reel | 1 Virality | 4 | 4 | 6.5 | 2.46 | High |
| 11 | Anatomy-of-a-Failure LinkedIn Serial | 3 Community | 4 | 4 | 2 setup | 8.00* | High |
| 12 | Give-a-Seat-Get-a-Seat (M17 Compounding) | 6 Referral | 4 | 4 | 6 | 2.67 | High |
| 13 | Procurement Horror Stories Podcast | 3 Community | 5 | 3 | 8.5 | 1.76 | High |
| 14 | Procurement Heads Invite-Only Slack | 3 Community | 5 | 3 | 12 | 1.25 | High |
| 15 | Template Fork Attribution Chain | 1 Virality | 4 | 4 | 6 | 2.67 | High |
| 16 | Compliance Framework Cheat Sheets | 2 SEO | 4 | 4 | 8.5 | 1.88 | Medium-High |
| 17 | Bid-Win Confetti Share with Champion Tag | 1 Virality | 4 | 3 | 5 | 2.40 | Medium |
| 18 | Public Heat Map Weekly Digest | 2 SEO | 4 | 4 | 7 | 2.29 | High |
| 19 | Directory Submission Sprint | 2 SEO | 3 | 5 | 5 | 3.00 | Medium |
| 20 | Active-RFP Detection Outbound | 4 Seller Supply | 4 | 3 | 8.5 | 1.41 | Medium |
| 21 | Weekly Office Hours Live Demo | 3 Community | 4 | 4 | 3 setup | 5.33* | Medium |
| 22 | Podcast Circuit — Top 20 | 5 Launch & PR | 4 | 3 | 3 setup | 4.00* | High |
| 23 | Ghost-Bid Import Hackathon | 4 Seller Supply | 5 | 3 | 10 | 1.50 | Very High |
| 24 | Concierge Loopio/Responsive Migration | 4 Seller Supply | 4 | 4 | 5 | 3.20 | Medium |
| 25 | Product Hunt Launch | 5 Launch & PR | 4 | 3 | 14 | 0.86 | Medium |
| 26 | Hacker News Show HN | 5 Launch & PR | 3 | 3 | 4 | 2.25 | Medium |
| 27 | Industry Awards Submissions | 5 Launch & PR | 3 | 3 | 7 | 1.29 | Medium |
| 28 | Laid-Off Procurement Leader Free-Growth Program | 6 Referral | 3 | 4 | 4 | 3.00 | Medium-High |
| 29 | Double-Credit First-100 Buyer Referral | 6 Referral | 4 | 3 | 4 | 3.00 | Medium-High |

*Starred scores reflect setup-only time — these experiments require ongoing weekly labor that, for queue-ranking purposes, is separately budgeted. The raw score shown is the return on the setup investment; in practice, the ongoing labor should be evaluated against opportunity cost once the other queue items are sequenced.

### First Five to Run (0–60 Days)

1. **Founder Build-in-Public Daily LinkedIn (§3.1).** Start day 1. Two days of setup, then 1 hour per day forever. The single highest-leverage activity a solo founder can do. Every other experiment's success probability rises as the founder's personal audience grows, because distribution compounds. This is not a "growth experiment" — it is the **ambient condition** every other experiment runs inside. Start before anything else.

2. **Category Template SEO Landing Pages (§2.2).** Ship days 2–10. The 19 seed-category templates already exist (§2.4 GTM_PLG_ARCHITECTURE). Surfacing them publicly at `/templates/*` requires only the public gallery page and minimal SEO tooling. The Wedge-ICP buyer searching "SIEM RFP template" today has no good answer — Sourcera should be it. Compounds indefinitely; no ongoing labor after initial ship.

3. **Paste-Last-Year's-RFP Unauthenticated Preview (§4.1).** Ship days 4–18 (in parallel with #2). This is the single largest Path C (Seller Organic) activation-friction removal in the product. Every day it ships earlier produces ≥10 additional seller signups that compound into Marketplace supply. The Ghost-Bid Importer (M15) is already built — the unauthenticated surface is a thin wrapper around it.

4. **Stakeholder Scorecard Digest Email (§1.3).** Ship days 10–15. Every active buyer evaluation has 4–9 invited stakeholders. Each weekly digest is a re-entry surface that currently does not exist. Loops.so is already in the stack; the only engineering required is the query, the template, and the cron job. Compounds from day one of paid users.

5. **Time-Saved Receipt Sharecard (§1.5).** Ship days 14–18. The Time-Saved Baseline (§6.36) is already computed on every Pre-Scoring run. Wrapping it in a shareable 1200×628 render with a public receipt page converts an invisible internal metric into a viral artifact. Every Buyer Free user running their first Pre-Score produces one eligible share; the share rate doesn't need to be high for the math to work, because the production volume is automatic.

### Sequencing Logic

The first five are chosen to maximize compounding effects in the 0–60 day window while minimizing ongoing labor load on a solo operator:

- **#1 (LinkedIn)** establishes distribution. Every other experiment performs better when shipped into an audience that already exists.
- **#2 and #3** are the two highest-leverage activation unlocks — one on the buyer side (template SEO landing pages feeding Path A and D), one on the seller side (unauthenticated Ghost-Bid preview feeding Path C). They ship in parallel because they touch different code surfaces and different channels.
- **#4 and #5** are both zero-ongoing-labor product surfaces that convert already-occurring in-product events into viral artifacts. They produce compounding returns for every paid user from the day they ship.

Experiments #6 through #10 on the ranked queue (Embed Kit, Replay Reel, Question Bank Long-Tail, Anatomy-of-a-Failure serial, Give-a-Seat-Get-a-Seat) should start in the 45–90 day window. The Slack community (§3.2), podcast (§3.3), and live events surfaces in Category 3 require either an existing founder audience (earned via #1) or early paid customers (produced by #2–#5) before they can launch effectively — which is why they are explicitly sequenced later despite high raw scores.

**Paid-channel experiments are deliberately absent from the first five, the first ten, and the first quarter.** Per the anti-drift guardrail, paid acquisition does not enter the queue until the organic channels above have demonstrated unit economics and attribution plumbing. The single paid-adjacent experiment included (Product Hunt sponsored placement at $300) is a brand moment, not a performance channel, and sits outside the paid-ads restriction.

---

## Authored Extensions Requiring Human Sign-Off

Three tactics propose net-new mechanics that must be integrated into `Sourcera_Master_Spec.md §13.3` before build:

1. **Time-Saved Receipt Sharecard (§1.5)** — adds a new public page type (`/share/receipt/:run_id`) and a new PostHog event (`receipt_share_clicked`). Needs a new Appendix C entry for the receipt artifact lifecycle, k-anonymity treatment for single-user receipts, and retention policy.

2. **Paste-Last-Year's-RFP Unauthenticated Preview (§4.1)** — adds an `anonymous_ghost_bid_session` entity with a 24h TTL, zero PII, and an atomic session-to-Seller-Org copy-forward flow. Needs a new Appendix A state-machine, abuse-control throttles, and GDPR treatment.

3. **Template Clone Leaderboard (§6.3)** — adds a public leaderboard surface, a monthly-winner selection job, fraud controls against same-buyer-Org clone rings, and a bounty-payout state machine. Needs Appendix D or equivalent reconciliation log for cash disbursements.

Until these extensions are integrated, treat the relevant experiments as **scoped to the existing mechanics only** — the unauthenticated preview falls back to the logged-in M15 surface, the receipt falls back to in-product non-shared display, the leaderboard runs without cash bounty.

---

## Measurement and Kill-Discipline

Every experiment above carries an explicit kill threshold. Enforce them. The single largest risk to a solo-operator growth program is sunk-cost-fallacy extension of underperforming experiments — each one consumes calendar time that would otherwise compound elsewhere. At day 60, re-run the prioritized queue with actual data; re-rank; reallocate. Experiments that have hit their kill threshold go to an `/sourcera/_growth_archive/` folder with a 200-word post-mortem on why they underperformed and what the signal means for the category hypothesis.

*Sources:* `Sourcera_Master_Summary.md §3.1–§3.6` · `GTM_POSITIONING.md §1.1–§1.3, §2.1–§3.4, §4.1–§4.2` · `GTM_PLG_ARCHITECTURE.md §1.1–§1.6, §2.1–§2.4, §3.1–§3.3`.
