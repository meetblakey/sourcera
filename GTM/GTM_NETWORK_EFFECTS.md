# Sourcera — Network Effects Operational Strategy

**Status:** Active execution plan
**Owner:** Founder / solo operator
**Companion docs:** `Sourcera_Master_Spec.md` §19, §21.4, §22, §26, §27, §30, §31, §34, §40, §48.0.1, §48, §49, §51; `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` narrative companions; `GTM_POSITIONING.md` §1.2-1.3, §4, §5.2-5.4
**Last updated:** 2026-04-20

This document is a narrative companion, not a re-derivation of the ten growth loops, seventeen growth mechanics, or seven seller-side network effects. Those live canonically in `Sourcera_Master_Spec.md` §48. The controlling commercial wedge is §48.0.1: buyer evaluation creates seller urgency; a drafted bid creates fast seller value; seller KB/profile supply compounds into Marketplace and SEO value. This document is the operational execution plan for building both sides of the two-sided market as a solo operator during the first twelve months: which mechanisms must be live before which, which surfaces the founder manually operates before automation takes over, what conversion moments the product must catch, and what metrics prove the flywheel is turning.

Everything here respects the constitutional constraints of the platform: vendor participation is always free, the Marketplace is opt-in and summary-only, published profiles are free from day one, Promoted Listings are Scale/Enterprise only, and the anti-spam framework in Master Spec §48.4 is the acceptable-use floor regardless of plan.

---

## Section 1 — Network Effects Inventory: Operational Status

The sections below treat each Growth Loop, each Growth Mechanic (M1-M17), and each Seller-Side Network Effect from Master Spec §48 as an operational system. For each: the product surface that must exist for the loop to fire, the loop time and branching factor (best estimate given the product model, not yet empirically measured), the solo-operator intervention that accelerates it, the priority at launch vs. post-launch, and the kill condition — the single product defect or policy decision that would stop the loop from functioning.

### 1.1 The Ten Core Growth Loops (Master Spec §48.2)

#### Loop 1 — Vendor-Invite-Creates-Account (M1)

| Dimension | Operational state |
|---|---|
| Product dependency | Magic-link SSO orchestrator that starts KB Bootstrap inside SSO-redirect latency (Master Spec §48.0.1 / §48.8); First-Pass RFP Generator (§24 / §48.8); Inline-citation UI; Landing counter; KB-gap detector (§48.8 pre-arrival through in-workspace value proof) |
| Loop time | ~0 days (fires at invite send). Time-to-next-loop-iteration = time-to-next-buyer-invite from the same or different vendor. First-invite -> first-bid-submit targets p50 < 20 min, p90 < 60 min (§48.1.6 / §48.8.8). |
| Branching factor | 3–10 Seller Orgs seeded per buyer evaluation (Master Spec §48.2.2). Compounds because invited sellers themselves become invitable again by any other buyer. |
| Solo-operator role | (1) Ensure every early buyer onboarded maximizes vendors-per-evaluation (coach on shortlist breadth). (2) Post-invite follow-up outside the product for the first 100 forced-signups — a personal founder email the day after bid submission, asking "what would you change about that onboarding?" (3) Monitor the hero-moment acceptance rate (≥40 approved entries on bootstrap) daily and triage any bootstrap failures within same-day. |
| Priority | **Must-have at launch.** This is the single load-bearing loop of the whole GTM. Without it, there is no Marketplace inventory, no SEO compounding, no cross-side flywheel. |
| Kill condition | Hero Moment doesn't execute inside the SSO-redirect window — if bootstrap runs async and the vendor lands on an empty workspace, conversion collapses to a cold-start tutorial experience and the loop branching factor drops toward zero. Second kill condition: invite email deliverability breaks (DMARC/SPF misconfig per Master Spec §48.4). |

#### Loop 2 — Template-Clone-Attribution

| Dimension | Operational state |
|---|---|
| Product dependency | Template Library with clone tracking (Master Spec §19 / §48.2.3); Clone-attribution badge rendered on cloned template; deep-link to originating Seller's Software Page (§26.8.5). |
| Loop time | Days–weeks. A template is cloned, used inside a buyer's evaluation, viewed by vendors and stakeholders, and attribution clicks route back to the Seller Page. |
| Branching factor | Low per-clone (1–3 attribution clicks per clone on average), but high cumulative given template reuse. Highest compounding when a template becomes the de-facto "SOC 2 evaluation block" inside a category. |
| Solo-operator role | Seed the Library with 20–30 founder-authored Templates in each of the six seed categories (§1.3.1) during Phase 1. Personally curate which seller-published templates (M9) get Marketing-featured treatment inside Category Pages — editorial discretion, not purchasable. |
| Priority | **Month 2–3 activation.** The Template Library ships at launch; the clone-attribution surface is live from day one; the loop begins compounding only once there's a non-trivial clone volume, which requires both Template Library depth (seeded) and active buyer evaluations (Phase 2 demand). |
| Kill condition | Clone attribution breaks visually (badge removed, attribution click fails to deep-link to a Seller Page). Second kill: Templates get treated as commodity content with no attribution incentive, eliminating Seller investment in Template publishing. |

#### Loop 3 — Retired (replaced by M2 Selection Report Public Link)

#### Loop 4 — Seller-Profile SEO

| Dimension | Operational state |
|---|---|
| Product dependency | Published Seller Profile default-on at Basic verification (Master Spec §26.1 / §26.7); Software Pages (§26.8.5); Schema.org Organization + SoftwareApplication structured data emission; Seller Page Enrichment surface (paid, Starter+); sitemap submission; canonical URL structure for `sourcera.com/sellers/:slug` and `sourcera.com/software/:slug`. |
| Loop time | 3–9 months to organic search indexing weight. Google needs time to crawl, index, trust, and rank category-relevant pages. |
| Branching factor | Exponential once indexed for long-tail category queries. One indexed Software Page ranking on page 1 for "[category] vendor evaluation" drives compounding buyer-intent traffic for years. |
| Solo-operator role | (1) Manual sitemap ping on every new published profile for the first 60 days. (2) Founder-authored long-form content on M10 "How to Evaluate [X]" pages for each seed category — the Agent drafts; the founder edits for accuracy, adds proprietary methodology, and signs. (3) Build high-quality backlinks: podcast appearances, procurement-community content (ISM, CIPS, SIG, Procurement Leaders), guest posts on Spend Matters and CPO Rising. |
| Priority | **Must-have at launch** from a Schema.org emission standpoint (every vendor published from day one contributes). Organic traffic compounding is a 6–12 month unlock, not a day-one lever. |
| Kill condition | Profiles published unindexed (no sitemap, no backlinks). Second kill: Schema.org markup breaks and search engines fail to detect structured data. Third kill: published profiles are un-crawlably thin (no content), triggering E-E-A-T demotion. |

#### Loop 5 — Free-AI-Teaser-to-Paid

| Dimension | Operational state |
|---|---|
| Product dependency | AI Wallet service (Master Spec §34.10); Budget counter visible in every workspace; Outcome Resolver with per-capability signals (§34.11 / §34.15); 10-free-per-capability allowance (§34.8.4 / §34.14.4); Contextual upgrade CTA at exhaustion with ROI inline ("$X of value delivered; upgrade to continue"). |
| Loop time | ~minutes to hours (one session). Free AI budget is designed to be consumed in a single bid on the seller side ($5 = 1 first-pass-drafted bid) or 1–2 Pre-Scoring runs on the buyer side. |
| Branching factor | Not a branching loop — a conversion mechanism. Its compounding is indirect: paid users fund the AI COGS that subsidizes Free bootstrap for forced-signups (Loop 1). |
| Solo-operator role | (1) Monitor the Rejected-op rate weekly — target <30% on First-Pass Responder, <20% on Q&A Suggestion. Reject rate above threshold means the capability is degrading margin by generating bad output. (2) Personally review every first-100-customer bill for budget-exhaustion pattern and adjust Free allowance sizing if the $5 bucket is undersized. |
| Priority | **Must-have at launch.** The Free→Paid conversion hinges on this loop catching exhaustion moments cleanly. |
| Kill condition | Budget counter not visible; upgrade CTA not contextual (generic "upgrade now" banners); Free allowance sized wrong so the exhaustion fires before value delivery or never fires. |

#### Loop 6 — Retired (replaced by M7 Suggested Team Discovery)

#### Loop 7 — Cmd+K Suggestion Loop

| Dimension | Operational state |
|---|---|
| Product dependency | Command Palette (`Cmd+K`) with context-scoped results (Master Spec §30); Marketplace content index; phase-aware result ranking; deep-link routing into Seller Pages, Software Pages, Category Pages. |
| Loop time | Seconds per session; cumulative over weeks of buyer usage. |
| Branching factor | Internal redistribution, not new-user acquisition — amplifies the value of existing Marketplace inventory to existing buyers. Amplifies Loop 4 (SEO) by routing buyers to Seller Pages they wouldn't have searched for. |
| Solo-operator role | No direct operator role. Instrument the suggestion click-through rate on Marketplace results inside Cmd+K; if CTR is low, re-weight the ranker. |
| Priority | **Month 2–3 activation.** Ships with Command Palette, but loop only compounds once Marketplace inventory has breadth. |
| Kill condition | Suggestions feel irrelevant (low CTR), buyers learn to ignore them. Second kill: console-leak bug (a Buyer Console Cmd+K surfaces Seller Console content) destroys trust and forces suppression of cross-domain results. |

#### Loop 8 — Bid-Close-Offers-KB-Sync

| Dimension | Operational state |
|---|---|
| Product dependency | Bid close workflow (§24); Phase 13 Vendor Response KB Sync offer (§22 closed-bid ingestion channel); Win/Loss debrief surface (§48.1.7 / §48.8.5); one-click "save to KB" CTA. |
| Loop time | Days (bid closes → seller sees CTA → seller syncs). |
| Branching factor | Linear. Each bid close produces 1 KB-augmentation event. Compounds into Loops 2, 4 and Network Effects 1–3 because each ingested response becomes a richer KB entry, a higher-confidence Capability Declaration, and a sharper Match Score input. |
| Solo-operator role | During the first 50 closed bids, personally email each seller the day after close with a one-sentence prompt: "Want help pushing those responses into your KB?" — drives the one-click sync manually before the Win/Loss debrief is instrumented. |
| Priority | **Month 2–3 activation.** Requires at least one full bid cycle to complete (Phase 6 → Phase 13 is minimum 7 days of bidding plus buyer-side evaluation time; realistically 4–8 weeks end-to-end). |
| Kill condition | Win/Loss debrief surface not shipped; seller closes bid, sees no CTA, KB never grows. Equivalent to breaking the compounding mechanic inside Seller-Side Network Effect 3 (see §1.3 below). |

#### Loop 9 — Template Publish Incentive

| Dimension | Operational state |
|---|---|
| Product dependency | Template authoring inside Seller Console; Visibility Credits mechanic (featured placements in Category Pages earned by clone volume); Template Spam ML Classifier (Master Spec §48.4.5) to prevent abuse; clone-volume dashboard visible to publishing Seller. |
| Loop time | Weeks to months (a published template needs clone volume to earn credits, which manifest as featured placements, which drive buyer traffic to the seller's Software Page). |
| Branching factor | Modest per-template; cumulative is meaningful — a well-used template compounds a seller's SEO + Marketplace visibility for the lifetime of the template. |
| Solo-operator role | Manually approve the first 20 featured-template placements; establish editorial standard. Define the clone-volume threshold for credit award empirically — start at 10 unique-Org clones per 30-day window. |
| Priority | **Month 3 activation.** Needs buyer evaluations running at scale to generate clone volume. |
| Kill condition | No visibility credit — sellers publish once and stop. Second kill: Template Spam ML Classifier misconfigured and spam floods the Library, killing buyer trust in Template quality. |

#### Loop 10 — Marketplace Match-Score Teaser

| Dimension | Operational state |
|---|---|
| Product dependency | Qualitative Match Score labels visible to Free/Starter sellers ("Strong match"); numeric scores paywalled behind Growth+ (Master Spec §27.4); EOI workflow (§27.5) as the downstream conversion surface. |
| Loop time | Variable — a vendor sees a qualitative label, wants the numeric score, upgrades. From view to conversion: hours to days. |
| Branching factor | Not a branching loop — a conversion mechanic. Drives the "ambition" conversion moment (§48.1.7 conversion moments). |
| Solo-operator role | During the first 90 days, track which categories produce the highest "Strong match" density but lowest EOI submission rate — that's unmet demand. Use it to inform which categories get editorial Featured placements. |
| Priority | **Month 2–3 activation.** Requires a non-trivial buyer-side Marketplace listing volume before sellers have anything to look at. |
| Kill condition | Marketplace listings stay empty — no buyer publishes summaries, so no sellers see Match Scores, so no upgrade lever fires. Activation depends on Loop 1 supply and Phase 2 demand both being live. |

### 1.2 The Growth Mechanics M1-M17 (Master Spec §48.5-§48.7)

M1, M5, M15, M17 are all Loop 1 accelerators (Vendor-Invite-Creates-Account). The other mechanics segment as follows:

| Mechanic | What it does | Product surface | Priority | Solo-operator role | Kill condition |
|---|---|---|---|---|---|
| **M1 Vendor-Invite-Creates-Account** | Magic-link forced signup with Hero Moment | §48.0.1 / §48.8 full stack | **Launch** | Monitor forced-signup funnel daily; triage bootstrap failures same-day | Hero Moment async-fails |
| **M2 Selection Report Public Link** | Watermarked shareable selection artifact with per-section redaction | Selection Report (Master Spec §4.3.23 / §10.12); public-link generator with redaction controls | **Month 3** | Personally draft the watermark + redaction default policy; seed-share the first 5 customer-approved reports on LinkedIn | Buyers never publish (default redaction too restrictive or too loose) |
| **M3 Evaluation Certificate Badge** | "Selected via Sourcera" verifiable badge for buyer + winning vendor | Certificate issuance tied to Phase 13 close; verify-endpoint for badge authenticity | **Month 4–6** | Manually email winning-vendor contact to prompt badge embed on their website | Badges don't link back to a verifiable Sourcera page; buyers and vendors see no mutual value |
| **M4 Kick Off Next Evaluation on Close** | One-click Phase 13 → Phase 1 prompt at peak success momentum | Post-close CTA in Buyer Console | **Launch** | Coach first 20 buyer orgs explicitly on "what evaluation is next" during founder-led kickoff | Prompt buried behind navigation; buyers close the workspace and don't return |
| **M5 Buyer-Pull Vendor Invite** | Anonymous templated outreach to vendors not yet on Sourcera | Invite email template system; Vendor Opt-Out Registry (Master Spec §27.10 / §4.4.8); DMARC/SPF reputation | **Launch** | Review every templated outbound email before send for the first 500 invites; build the reply-handling playbook | Low deliverability; opt-outs spike; reputation suspension |
| **M6 Domain-Based Auto-Join** | Employees at verified domains auto-join as pending-approval | Domain verification + pending-approval queue | **Month 2** | Manually approve first 100 pending-approval members to learn patterns | Approval queue stalls; co-workers lose interest before joining |
| **M7 Suggested Team Discovery** | "Your colleagues are also on Sourcera" cross-team expansion | Domain-scoped user discovery with explicit invite consent | **Month 3–4** | None direct — ships when M6 has inventory | M6 hasn't produced inventory; suggestions are empty |
| **M8 Org Intelligence Value Curve** | Compound analytical value per additional evaluation, visible in-app | Org Intelligence dashboard (Master Spec §16 / §48.5.8) with evaluation-count milestones | **Month 6–9** | None direct — data accumulates | Org runs < 3 evaluations (never hits the curve); value is invisible |
| **M9 Per-Category Marketplace Landing Pages** | SEO-optimized category pages with AI-generated FAQs | Category Page template; AI FAQ generator (sourcera-owned AI); editorial review | **Launch (6 pages, one per seed category §1.3.1)** | Personally edit every Category Page's top 20 FAQ answers before publish for the first six categories; own the page until it hits 500 organic sessions/month | AI-generated content is low-quality, gets demoted by search engines, never ranks |
| **M10 How-to-Evaluate [X] Guides** | Long-form SEO guides, AI-drafted, refreshed on cadence | Long-form guide template; refresh cadence mechanism (quarterly) | **Launch (6 guides, one per seed category)** | Founder-authored methodology sections in every launch guide — the Agent drafts; founder signs and edits | Guides read as generic SEO slop; no founder voice; no differentiation |
| **M11 Software Comparison Pages** | AI-generated, continuously refreshed side-by-side comparisons | Comparison Page generator with source-cited claims; editorial review | **Month 2–4** | None direct — ships once Category inventory has 3+ sellers per category | Comparison content is inaccurate, sellers dispute, legal/factual risk |
| **M12 Aggregate Market Intelligence Reports** | k-anonymized cross-Org analytics (k=20) published quarterly | Report generator with k-anonymity floor enforcement; publication pipeline | **Month 9–12** | None direct — requires k=20 minimum across the Marketplace | k-anonymity floor can't be met (insufficient buyer Org volume) |
| **M13 Public Marketplace Heat Map** | Anonymized category-level demand visualization (k=10) | Heat map generator; k-anonymity enforcement | **Month 6–9** | None direct — visualization compounds once category demand has breadth | k=10 floor unmet in most categories |
| **M14 Seller Bid Success Share** | One-click social post after winning a bid | Win-share composer with privacy controls | **Month 3** | Personally celebrate the first 10 seller wins on LinkedIn + @ the seller | Buyers disapprove of the share (reputation risk); social post framing insensitive |
| **M15 Ghost-Bid Importer** | Sellers paste historical RFPs to bootstrap KB; first import free per Seller Org | Ghost-RFP Ingestion (Opus, $25 value/RFP); Seller Starter ceiling-hit-in-one-session mechanic | **Launch** | Personally walk the first 20 organic-signup sellers through a Ghost-Bid Import during onboarding call | Import quality is poor (Opus extraction fails on niche RFP formats); sellers lose faith |
| **M16 Buyer Referral Credit** | Structured referral program with credit reconciliation + fraud controls | Referral-tracking system; credit ledger; fraud detection | **Month 6** | Personally recruit the first 10 referrers; design the credit (discount vs. AI budget top-up) | Referral credit is negligible value; buyers don't bother |
| **M17 Buyer-Funded Pro Trial Seat** | Scale (5/mo) and Enterprise (15/mo) buyers gift 30-day Seller Starter trials to invited vendors | Trial-seat pool; 30-day auto-downgrade with data preservation; AI usage still Org-metered | **Month 4–6 (Scale accounts live)** | Personally sell the M17 feature to the first 5 Scale/Enterprise buyers; measure vendor conversion uplift | Trials don't convert (vendor didn't understand they were on trial); data preservation on day 31 breaks and destroys goodwill |

### 1.3 The Seven Seller-Side Network Effects (Master Spec §48.3.5)

These are the compounding loops that operate on the seller side specifically. Every one operates regardless of plan tier — free sellers contribute to all of them.

#### Network Effect 1 — Invited-Vendor → Published-Profile → Marketplace-Ready Inventory

- **Surface dependency.** Domain-Bootstrap; Default-on profile publication at Basic verification (Master Spec §26.1 / §26.7.3 Published-from-Day-One Default); SellerSoftware entity creation on signup; Marketplace Tagger (auto-categorization from domain + buyer evaluation context).
- **Loop time.** Seconds. Fires at the moment of magic-link signup.
- **Branching factor.** 1:1 with invited vendors. Every forced-signup grows inventory by exactly one profile + one SellerSoftware + up to 3 Capability Declarations.
- **Solo-operator role.** Monitor the profile-publication-success rate; any bootstrap failure that leaves a profile unpublished is a defect. Target 100% success rate for the first 1,000 signups.
- **Priority.** Must-have at launch. This is the one-way ratchet that builds supply-side liquidity asymmetrically to demand.
- **Kill condition.** Domain verification fails silently (DNS TXT record not detected, or default-published flag not honored); profile sits invisible; Marketplace inventory stalls at zero despite forced-signup volume.

#### Network Effect 2 — KB → Capability Declaration → Match Score → EOI → Revenue

- **Surface dependency.** KB-to-Capability Auto-Suggestion (Master Spec §26.4 / §22.10.5); Controlled Marketplace Taxonomy (§27.6); Numeric Match Scoring (Growth+, §27.4); EOI Workflow (§27.5); Category Pages (M9); Comparison Pages (M11); Market Intelligence Reports (M12).
- **Loop time.** Weeks to months. A vendor accepts bootstrapped KB entries → auto-declarations generate → Match Scores calibrate → Category/Comparison pages surface them → EOI activity → paid upgrade.
- **Branching factor.** Modest per-seller; compounding across the Marketplace is high — every accepted declaration from any vendor improves Match Score calibration for all vendors.
- **Solo-operator role.** During Phase 1, personally validate the Controlled Taxonomy has adequate coverage in each seed category (§1.3.1) — a missing tag kills declarations before they compound. Review the first 500 auto-declaration suggestions for quality signal.
- **Priority.** Must-have at launch (all surfaces ship in the MVP); compounding ignition at month 3–6.
- **Kill condition.** Auto-declarations are low-quality and get rejected at high rate — the capability underperforms economically (per Master Spec §34.11 / §34.15, rejected ops bill at cost, so a persistently-rejected capability is a margin leak).

#### Network Effect 3 — Bid-Close → Win/Loss Signal → Platform Learning

- **Surface dependency.** Phase 13 closure signal; buyer-side confirmation of winner; Win/Loss debrief generation (§48.1.7 / §48.8.5); citation-graph tracking per KB entry; Outcome Resolver capturing accepted signals.
- **Loop time.** Bid-cycle time (4–8 weeks end-to-end for a full buyer evaluation).
- **Branching factor.** One close per bid; the signal feeds four downstream surfaces: per-entry confidence weighting (private to vendor), Match Score calibration (cross-vendor), M12 SEO content (platform-wide), Seller Signals (paid feature quality lift).
- **Solo-operator role.** For the first 50 closed bids, personally follow up with both buyer and seller 3 days post-close to verify the outcome signal fired correctly. Any untracked close is a lost data point.
- **Priority.** Must-have at launch; the operational learning ignites only once the first 100 bids close (month 4–6).
- **Kill condition.** Phase 13 close doesn't emit outcome signal; citations fail to attach to KB entries; the whole platform-learning loop silently stops compounding.

#### Network Effect 4 — Seller-Profile SEO Loop

Same dependency and operational profile as Loop 4 above. The seller-side framing emphasizes that free sellers contribute to SEO compounding at zero cost to Sourcera, and the structural defense is against Gartner/G2 (who own category reviews) — Sourcera owns category inventory.

#### Network Effect 5 — Ghost-Bid Import Loop (M15)

- **Surface dependency.** Ghost-RFP Ingestion capability (Opus, rate card in Master Spec §21.4.2 / §34.14); first import free per Seller Org.
- **Loop time.** Single session (one paste = one KB bootstrap from historical work).
- **Branching factor.** Non-branching per-seller; accelerator of conversion-moment #3 (KB ceiling hit) — a seller with 3 historical RFPs imports them and hits the 50-entry cap in one session.
- **Solo-operator role.** During organic-signup onboarding (Phase 2+), personally walk each seller through a Ghost-Bid Import on the first call. This is the highest-ROI 20 minutes the founder can spend with an organic seller.
- **Priority.** Must-have at launch for the seller self-service funnel; operationally leverage starts when organic acquisition ramps (month 2+).
- **Kill condition.** Opus extraction quality is poor on non-standard RFP formats; sellers experience the import as "garbage in, garbage out" and stop trusting the KB.

#### Network Effect 6 — Buyer-Funded Pro Trial Loop (M17)

- **Surface dependency.** Pro Trial Seat pool allocation (5/mo Scale, 15/mo Enterprise); 30-day auto-downgrade with data preservation; per-console billing that pools AI against Org budget.
- **Loop time.** 30 days per trial.
- **Branching factor.** Non-branching per-trial, but structurally higher conversion than cold-start Free-to-Starter — a trial-converted seller skipped the Free ceiling entirely.
- **Solo-operator role.** Sell M17 explicitly as a feature of Scale and Enterprise during the first 10 such deals. Track trial→Starter conversion rate and compare to organic Free→Starter rate; if the uplift is material (>2×), M17 becomes a headline value proposition of Buyer Scale/Enterprise.
- **Priority.** Month 4–6 — activates once Scale accounts exist.
- **Kill condition.** Trial auto-downgrade destroys KB data at day 31 (catastrophic if buggy); trial seats go unused because Scale buyers don't invite vendors frequently enough.

#### Network Effect 7 — Template Publish Incentive (M9)

Same dependency and operational profile as Loop 9 above. The seller-side framing emphasizes that published templates reduce time-to-KB for future bootstrapped vendors (a published "SOC 2 response block" template cuts down the manual authoring burden for every new vendor who clones it), which reinforces Network Effect 1.

### 1.4 Summary — What Is Live at Launch

**Must ship at launch (Day 0):**
- Loop 1 (Vendor-Invite-Creates-Account) with full Hero Moment stack
- Loop 5 (Free-AI-Teaser-to-Paid) with Budget Counter + Contextual CTAs
- Loop 4 / Network Effect 4 Schema.org emission (SEO accumulates silently from day one)
- Network Effect 1 (Published-Profile from day one) with default-on at Basic verification
- Network Effect 2 (KB → Capability Declaration) — product exists; compounding ignites month 3+
- Network Effect 3 plumbing (outcome signals captured; learning ignites month 4+)
- M1, M4, M5, M9 (6 Category Pages), M10 (6 Guides), M15 (Ghost-Bid Importer)

**Activates month 2–3:**
- Loop 2 (Template-Clone-Attribution), Loop 7 (Cmd+K Suggestion), Loop 10 (Match-Score Teaser)
- M2 (Selection Report Public Link), M6 (Domain-Based Auto-Join), M14 (Bid Success Share)

**Activates month 3–6:**
- Loop 8 (Bid-Close-KB-Sync), Loop 9 / Network Effect 7 (Template Publish Incentive), M7, M11, M17

**Activates month 6–12:**
- M3, M8, M12 (M12 dependent on k=20 floor), M13, M16

---

## Section 2 — Cold Start Strategy: The First 90 Days

The classic two-sided chicken-and-egg has an unusual twist here: the buyer Free tier delivers full value against a single evaluation without requiring any Marketplace liquidity (the buyer invites vendors by name; the Marketplace is optional per Master Spec §27 and the buyer-side Marketplace Bridge framing in §48.2.2). Symmetrically, the Seller Free tier delivers full value against one invited bid without requiring any buyer-side presence beyond the single invite that triggered the signup. Neither side needs the other side to exist to get to their aha moment.

This changes the cold-start problem from "reach critical mass before either side defects" to **"seed supply before demand ramps, because demand generates supply involuntarily through M1 forced signups."** Every buyer evaluation seeds seller inventory through the M1 forced-signup loop (§48.0.1 / §48.2.2). The founder's job is not to balance supply and demand in the first 90 days — it's to light the M1 fuse, then make sure the supply-side forced signups experience the Hero Moment flawlessly so they stick.

### 2.1 Phase 1 — Days 1–30: Seed Supply

**Goal.** Reach a supply floor where Marketplace Category Pages (M9) and Comparison Pages (M11) have enough vendor density to rank meaningfully on long-tail SEO. Asymmetric supply-over-demand is the strategy — because demand generates more supply organically, over-indexing supply early compounds faster than over-indexing demand.

**Targets by Day 30.**

| Metric | Target | Why |
|---|---|---|
| Seller Profiles published (Basic verification) | 50 | Floor for M9 Category Pages to have 8–10 profiles per seed category |
| Profiles with completed Capability Declarations (≥3 per profile) | 20 | Match Scoring + Category filtering require declarations to work |
| Profiles with one Ghost-Bid Import completed (optional, high-value) | 5 | Demonstrates M15 in practice; creates case-study material |
| Verified-tier profiles (auto-unlocked when SOC 2/ISO uploaded) | 5 | Verified badges on Category Pages signal trust density |
| SellerSoftware entities across 6 seed categories | 75 | ~12 per seed category; minimum for Comparison Pages |

#### 2.1.1 Seed List — Which Categories, Which Vendors

The six seed categories from `GTM_POSITIONING.md` §1.3.1 are the only categories Sourcera targets in year one. Within each, the founder compiles a target list of 10–15 vendors matching the Primary Seller ICP (§1.2.1: 50–500 employees, 30–150 RFPs/yr, structured-response category).

**Seed category priority for outreach (Days 1–30):**

1. **Security & GRC** (highest-friction evaluations, heaviest documentation burden) — target: 15 vendors. Examples of segmented targets: SIEM mid-market (e.g., Devo, Exabeam tier), SOAR (Tines, Torq, Swimlane), GRC platforms (Drata, Vanta, Secureframe, Strike Graph, SafeBase), DLP (Nightfall, Cyberhaven), IAM mid-market (Fusionauth, WorkOS, Stytch), CSPM (Wiz mid-market competitors, Orca, Sysdig adjacencies).
2. **Data & Analytics** — target: 10 vendors. BI (Preset, Lightdash, Omni, Sigma tier), CDPs (RudderStack, Hightouch, Census), data observability (Monte Carlo, Metaplane, Synq), data catalogs (Atlan, Secoda, Castor), data governance (Immuta, Privacera).
3. **DevOps & Platform Engineering** — target: 10 vendors. CI/CD (CircleCI mid-market, Harness, Mergify), IaC (Spacelift, env0, Scalr), secrets (Doppler, Infisical), IDPs (Port, Cortex, OpsLevel), observability (Honeycomb, Chronosphere adjacencies, Helicone).
4. **Revenue Operations** — target: 5 vendors. Sales engagement (Outreach adjacencies, Salesloft mid, Apollo), CPQ (Salesforce CPQ alternatives like DealHub, PandaDoc CPQ), revenue intelligence (Gong adjacencies, Chorus adjacencies).
5. **HRIS / HR-Tech** — target: 5 vendors. HRIS (Rippling mid-market adjacencies, Deel adjacencies, Justworks), ATS (Greenhouse, Ashby, Gem), LMS (Lessonly, Docebo adjacencies).
6. **AI Infrastructure & Tooling** — target: 5 vendors. LLM orchestration (LangSmith, Braintrust, Helicone), vector DBs (Pinecone, Weaviate, Qdrant), AI observability (Arize, Galileo, Fiddler), evals (Braintrust, Humanloop, Langfuse).

Total Day-30 outreach target: 50 vendors across 6 categories. Goal is 50 published profiles (100% conversion on the direct-outreach offer since the value proposition is entirely free).

#### 2.1.2 The "Your Profile Is Already Live" Pitch

The direct-outreach pitch is structured around the Master Spec §26 Published-from-Day-One default, inverted from a cold pitch into an opt-out offer:

> Subject: Your Sourcera profile is ready
>
> Hi [Name],
>
> I'm the founder of Sourcera — a new Software Evaluation Platform where enterprise buyers run structured vendor evaluations. We're seeding the Marketplace with high-quality vendors in [Category] this month, and I've drafted a published Seller Profile for [Company] based on your public website. It's ready to go live at `sourcera.com/sellers/[your-slug]` as soon as you verify your domain with a DNS TXT record — which takes about two minutes.
>
> The profile is free forever. It emits Schema.org structured data so it contributes to your organic search footprint. Verified and Certified badges are also free when earned — they're not a billing surface; they're trust signals.
>
> If you respond "yes," I'll send you the DNS record and a one-page primer on Capability Declarations (which drive vendor filtering in the Marketplace). If this isn't interesting, reply "pass" and I'll remove the draft.
>
> [Founder name]

This pitch:
- Inverts the cold-outreach frame (it's not "sign up" — it's "we already built it, do you want it live?")
- Respects time (2 minutes to DNS verify)
- Uses the honest lever (SEO benefit + trust signals + fully free)
- Has a single clear CTA (yes / pass)
- Does not attempt to sell anything paid

Expected conversion on this pitch: 60–75% "yes" response, 40–50% completing DNS verification within 7 days. At 50 outreach targets, that floor is 20–25 published profiles in the first two weeks. The remaining 25–30 come from the organic inbound that Category Pages (M9) begin generating once the first tranche is live (the Schema.org flywheel starts compounding at month 2).

#### 2.1.3 Triggering KB Bootstrap for Organic Signups

A Seller who completes DNS verification and clicks "publish my profile" is eligible for their lifetime-free KB Bootstrap (Master Spec §22.10.3 / §48.8) inside the same session. The founder's post-signup playbook:

1. Within 1 hour of DNS verification, email the new Seller the Ghost-Bid Import invite: *"Want me to run a Bootstrap against your [trust center / help docs / public docs] right now? It takes 30–90 seconds."*
2. On consent, trigger the KB Bootstrap manually (if self-serve onboarding is in progress). Confirm ≥40 approved entries post-review.
3. Schedule a 15-minute onboarding call with the seller to walk through the first Capability Declaration authoring. This produces 3 declarations + 1 SellerSoftware entity, fully unlocking Marketplace filtering.
4. Identify one historical RFP the seller has responded to and offer to run a Ghost-Bid Import (M15) — the seller's one-time free import. Target: 20 of the 50 Phase-1 sellers complete a Ghost-Bid Import.

This manual founder-operated onboarding does not scale, which is fine — it's specifically the Phase-1 play. By Phase 3 (month 2+), organic signup flows through the self-service Hero Moment path automatically.

#### 2.1.4 Phase 1 Success Criteria

- 50 Seller Profiles published (Basic verification)
- 20 profiles with ≥3 Capability Declarations
- 10 profiles with Ghost-Bid Import completed
- 5 profiles at Verified tier
- 6 Category Pages (M9) live with ≥8 profiles listed per category
- 6 How-to-Evaluate Guides (M10) live, founder-authored methodology
- All SEO infrastructure live: sitemap, Schema.org markup verified, canonical URLs
- First 3 backlinks earned (1 podcast, 1 guest post, 1 community mention)

### 2.2 Phase 2 — Days 15–45: Seed Demand

**Goal.** Get 5–10 buyer organizations running real evaluations on the Buyer Free tier. Each evaluation invites 5–10 vendors → forced signups → Marketplace inventory compounds.

This phase overlaps Phase 1 by design. The founder is executing both simultaneously: cold supply outreach in the mornings, warm demand outreach in the afternoons. Splitting them serially loses 2 weeks.

**Targets by Day 45 (incremental over Day 30).**

| Metric | Target | Why |
|---|---|---|
| Buyer Organizations on Free tier | 10 | Supply the first M1 fuse events |
| Active evaluations (Phase ≥ 2) | 8 | A signed-up Org that doesn't run an evaluation doesn't trigger M1 |
| Vendors invited via M1 | 50–100 | 5–10 per evaluation; this is the forced-signup yield |
| Forced-signup sellers experiencing Hero Moment | 40+ | Target p90 Hero Moment success rate (§48.1.6 / §48.8.8 leading indicators) |
| First closed bid on the platform | 1 | Validates the Phase 1 → Phase 13 pipeline end-to-end |

#### 2.2.1 Where Phase 2 Buyers Come From

The buyer Wedge ICP (§1.1.1: regulated mid-market running a single evaluation in the next 60 days, 200–800 employees, no central procurement) is the highest-conversion Phase 2 target because:

- They have a specific active evaluation (buying reason)
- They arrive with peak pain (trigger event per §1.1.2)
- The Free tier covers 1 active evaluation, 25 vendors — exactly their scope
- They invite vendors by name (not via Marketplace discovery), fueling M1 directly

**Phase 2 buyer sources:**

1. **Founder's personal network** — target 5 warm intros into companies running an evaluation in Q2–Q3 2026. This is the fastest path to the first 3 buyer orgs.
2. **Auditor-finding trigger** (§1.1.2 trigger #1) — direct outreach to procurement leaders at companies that publicly disclosed a vendor-related audit finding in the last 24 months. Use SEC 10-K language ("material weakness," "vendor management control deficiency") + SOC 2 public letter reviews as sourcing filters. 2–3 conversions.
3. **Procurement community content** — founder posts in ISM and CIPS communities, Procurement Leaders Slack, SIG online forum with a specific offer: "If you're running a software evaluation in the next 60 days, I'll personally help you configure it on Sourcera for free." 2–3 conversions.
4. **Loopio/Responsive buyer-side frustration** — the seller-facing competitors occasionally surface buyer-side complaints ("why do we make them use that tool?"). Monitor G2 reviews of Responsive/Loopio for buyer-side grievance; reach out personally. 0–2 conversions.

#### 2.2.2 The "One Evaluation Seeds Ten Sellers" Math

Every Phase 2 buyer who starts a real evaluation generates Phase 1–style supply asymmetrically. The math, with realistic assumptions:

- Primary Buyer ICP evaluation has 5–9 vendors invited (§1.1.1).
- 40–60% of those vendors are not yet on Sourcera → forced-signup via M1/M5.
- 80–90% of forced signups reach the Hero Moment (per §48.1.6 / §48.8.8 leading indicators — bootstrap success rate target).
- 70% of forced signups submit the first bid on Free (activation proxy).

**Per buyer evaluation, expected forced-signup yield:** 2–5 new Seller Orgs published, ~1–3 submit a first bid.

At 8 active Phase 2 evaluations × 4 median forced signups = 32 new Seller Orgs generated involuntarily by Day 45. This exceeds the direct-outreach yield per unit of founder time by an order of magnitude — **once buyer demand is lit, the cheapest marginal supply is free-forced vendor signup.**

#### 2.2.3 Phase 2 Success Criteria

- 10 Buyer Orgs signed up (Free tier)
- 8 active evaluations at Phase ≥ 2
- 50–100 vendors forced-signed-up via M1/M5
- 40+ experienced the full Hero Moment (bootstrap success, landing counter visible, ≥40 approved entries)
- At least 1 bid closed end-to-end (Phase 13)
- Ghost-Bid Import usage ≥ 10 beyond Phase 1 (indicates organic seller activity beyond founder-led onboarding)

### 2.3 Phase 3 — Days 30–90: Flywheel Ignition

**Goal.** Transition from founder-operated supply acquisition to self-sustaining organic signup flow. The mark of flywheel ignition is that **new Seller Orgs are arriving faster than the founder can personally onboard them**, and that a material fraction of those arrivals are the second invite to a previously-invited vendor.

**Targets by Day 90 (cumulative).**

| Metric | Target | Why it signals ignition |
|---|---|---|
| Total Seller Profiles published | 200+ | Inventory density across 6 seed categories; Category Pages ranking on long-tail searches |
| Sellers receiving a second invite (M1 second-wave) | 20+ | Conversion Moment #1 fires for the first cohort |
| First EOI attempts (Conversion Moment #2) | 10+ | Sellers discovering the Marketplace and wanting to use outbound |
| KB-ceiling approaches (Conversion Moment #3 trigger) | 15+ | Sellers whose KB is approaching the 50-entry Free cap |
| Free-to-Starter conversions | 15–30 | 10–20% of active Free sellers converting (across all three conversion moments) |
| Buyer Orgs | 30–50 | Self-sustaining buyer acquisition from SEO + M10 guides + M2 shared Selection Reports |
| Active evaluations | 25+ | Minimum density for M12 k=20 floor planning; Marketplace activity density |
| Closed bids end-to-end | 20+ | Network Effect 3 (platform learning) begins compounding |
| Organic-signup sellers (not M1 forced) | 30+ | Proof that SEO and content channels are producing demand |
| Starter→Growth expansion on early cohort | 1–3 | Starter cohort hitting second natural ceiling |

#### 2.3.1 Conversion Moment Timing — When Each Fires

The conversion moments (§48.1.7 / §48.8.6; pricing authority in §34) fire at structurally different times across the funnel:

| Moment | Expected first-fire window for Phase-1 cohort | Gating factor |
|---|---|---|
| **Moment 1: Second concurrent bid** | Week 6–10 | Vendor receives a second invite while the first is in flight. Highest conversion rate (urgency + in-flight KB value). |
| **Moment 2: First EOI attempt** | Week 4–8 | Vendor discovers Marketplace, clicks "Submit EOI" on a listing, hits the Free-tier zero-EOI cap. Ambition-driven. |
| **Moment 3: KB ceiling** | Week 8–16 | Vendor approaches 50-entry cap over 2–4 bids. Investment-driven. |

**Operational implication.** The founder must watch for Moment 2 firing earliest — it indicates organic seller engagement beyond the forced-signup funnel. If Moment 2 isn't firing by Week 8 across any sellers, the Marketplace listings aren't discoverable enough; triage by reviewing listing quality, Cmd+K routing, and M9/M10 SEO indexing status.

#### 2.3.2 Flywheel Ignition Signals

The founder's weekly dashboard tracks these eight signals, any one of which going the wrong direction warrants same-week triage:

1. **Minutes from magic-link to first submitted requirement response** (p50, p90). Target p50 < 20min, p90 < 60min (§48.1.6). Degradation = Hero Moment regression, triage immediately.
2. **Bootstrap acceptance rate** (% of Free sellers whose KB Bootstrap generates ≥40 approved entries). Target ≥70%. Below threshold = bootstrap quality degraded, capability generating margin-negative ops.
3. **Rejected-op rate for First-Pass Responder.** Target <30%. Above threshold = model quality issue or capability misconfiguration.
4. **Second-invitation arrival rate on Free cohort.** Target ≥20% by Day 60 for Phase-1 cohort. Below threshold = Marketplace inventory not dense enough in the right categories.
5. **Free-to-Starter conversion %.** Target 10–20% by Day 90 on Phase-1 forced-signup cohort.
6. **Buyer evaluations reaching Phase 13.** Target 20 closed bids by Day 90. Below threshold = buyer-side evaluation stall, triage phase-gate friction.
7. **Organic seller signups (not M1 forced).** Target 30+ by Day 90. Below threshold = content/SEO flywheel hasn't ignited; invest more founder time in M10 guides and backlinks.
8. **Template clones per published Template.** Target ≥5 by Day 90. Below threshold = Template Library not compounding; seed more founder-authored templates.

#### 2.3.3 What Is Not a Success Metric in the First 90 Days

- **ARR.** Revenue is a lagging signal. Chasing ARR before the flywheel lights degrades the flywheel (founder time spent on sales calls that produce Business Growth upgrades today leaves the supply-side forced-signup surface unmonitored).
- **NPS.** Too thin a dataset; subject to ceremony bias.
- **Total users (buyer + seller combined).** A noisy aggregate; the right sub-aggregates are "active evaluations" on the buyer side and "published profiles + first-bid submissions" on the seller side.

---

## Section 3 — Supply-Side Acquisition: Detailed Tactics

### 3.1 The Forced-Signup Path — Highest Conversion Channel

Forced signups are structurally the best supply-acquisition channel in the entire GTM. The vendor arrives at peak pain, with a deadline, an incoming RFP, and no workflow to defend (§48.0.1 / §48.1.7). Every product and operational decision should maximize yield here.

#### 3.1.1 Maximizing Vendors Per Buyer Evaluation

**Coaching.** During founder-led onboarding of the first 30 Buyer Orgs, the founder actively coaches the buyer on shortlist breadth: *"Invite 7–9 vendors, not 3–4. The 13-phase pipeline is designed to scale up to 10. You can always disqualify in Phase 4–5 via Vendor Voluntary Withdrawal (Master Spec §23.4). Inviting more vendors costs you nothing and the evaluation quality rises with comparative depth."*

**Invite suggestions.** The Agent's Vendor Suggestion capability (reference: Master Spec §21.4 vendor-suggestion capability, also referenced as M5 Buyer-Pull Vendor Invite at anonymous level) should surface Marketplace-matched vendors during Phase 4–5 Vendor Discovery, tuned to the buyer's Capability Declarations filter. A buyer who types three vendor names should see 4–6 more Sourcera-matched suggestions to round out the shortlist.

**Marketplace-discovery nudge.** A passive in-product reminder during Phase 4–5: *"3 vendors added. Consider 5–9 for stronger comparison depth. See Marketplace matches →."*

**Target.** Median 7 vendors per buyer evaluation by Day 60, with ≥50% of invited vendors not previously on Sourcera (i.e., ≥3–4 forced signups per evaluation).

#### 3.1.2 Ensuring the Hero Moment Executes Flawlessly

The Hero Moment is the single load-bearing product surface for supply-side conversion. Any regression here kills the forced-signup channel.

**Operational monitoring (daily for the first 90 days).**
- Bootstrap success rate (target ≥95%)
- Bootstrap acceptance rate ≥40 entries (target ≥70%)
- p50 and p90 minutes-to-first-submitted-response
- First-Pass Responder rejected-op rate (target <30%)
- Landing counter render success rate (target 100%)
- KB-gap detector 1-click save success rate (target 100%)

**Failure playbook.** Any Hero Moment failure on a forced-signup session triggers a same-day founder-intervention email to the affected vendor offering to personally walk them through the bid. The goal is to not lose a forced-signup to a product bug.

**Progress storytelling integrity.** Every line of onboarding copy must be true and reflect actual work (§48.8 onboarding surface). Fabricating progress states (common B2B onboarding dark pattern) kills trust in the single moment that matters most.

**Banned anti-patterns** (§48.8.7; pricing authority in §34).
- No credit card prompt before first upgrade-intent click
- No company-description form before bootstrap runs
- No "try Pro free for 14 days" modal on first login
- No pricing page before first bid submission
- No dark patterns on upgrade CTAs
- No upgrade offer during active bid work

#### 3.1.3 Following Up with Forced-Signups Who Haven't Submitted

Not every forced-signup submits the first bid. The founder's follow-up playbook:

| Day since invite | Action |
|---|---|
| Day 3 (no bootstrap started) | Automated email: "Your bid draft is waiting. 30 seconds to start." |
| Day 5 (bootstrap started, no bid submitted) | Automated email: "You're 60% done. Want help finishing?" |
| Day 7 (still no submission) | **Personal founder email**: "I saw you started the [Buyer]-invited bid. Anything I can help with? I can jump on a 10-min call." |
| Day 10 (deadline passed, no submission) | Personal email with postmortem offer: "I want to understand what got in the way. 5 minutes? Anything you tell me makes the product better." |

This founder-operated recovery applies to the first 100 forced-signups. After that, instrument the follow-up sequence with Loops.so and preserve founder attention only for the Day-10 postmortem outreach.

### 3.2 Organic Seller Outreach

Organic supply acquisition (direct-to-seller marketing before a buyer invite arrives) is the secondary channel — lower volume, lower conversion per hour of founder time, but necessary for Marketplace density in under-seeded categories and for building the seller-side self-service funnel.

#### 3.2.1 The 4×-Cheaper-Than-Responsive Pitch

Target: RFP Managers, Pre-Sales leads, Heads of Proposal at vendors in the Primary Seller ICP (§1.2.1).

**Outbound email sequence (LinkedIn + email, 4-touch over 2 weeks):**

**Touch 1 (Day 0, LinkedIn connection request):**
> [Name], I'm the founder of Sourcera — new platform for vendor RFP response + marketplace discovery. I built a pricing comparison worksheet against Responsive and Loopio that your team might find useful — can I send it?

**Touch 2 (Day 3, LinkedIn message if connected; email if not):**
> [Name], thanks for connecting. I looked at [Company]'s public content and drafted a Knowledge Base preview (what Sourcera would auto-bootstrap on signup — 40–60 entries from your help docs and trust center). Can I share it? It's the thing that takes your first RFP response from 2 days to 35 minutes. Zero obligation. The platform is free to respond to invited RFPs forever.

**Touch 3 (Day 7, email):**
> Subject: RFP tooling comparison — Sourcera vs. Responsive (~$1,800/yr vs. ~$7K/yr)
>
> [Name],
>
> Short version: if [Company] pays for Responsive or Loopio, Sourcera is 3–4× cheaper for the RFP tooling dimension alone, and bundles Marketplace discovery + CRM Sync that neither ships. Starter is $149/mo annual for 3 concurrent bids, 1,000 KB entries, 2 Firecrawl sources, $30 AI budget.
>
> You can use the platform for free, forever, as long as you're only responding to RFPs vendors invite you to. 50 KB entries, 1 concurrent bid, lifetime-free KB Bootstrap on signup.
>
> Worth a 15-minute walkthrough? I can personally run a Ghost-Bid Import on one of your historical RFPs during the call — it'll populate your KB with 50–200 entries from prior work in about 5 minutes.

**Touch 4 (Day 14, LinkedIn with specific Case Study):**
> [Name], wanted to share — [Similar Company in same category] ran a Ghost-Bid Import last week, went from zero KB to 124 entries, and submitted their first Sourcera-drafted bid 3 days later. 35 minutes of seller review time. Thought you'd find it relevant. Happy to walk through how.

**Expected conversion.** 8–12% reply rate, 4–6% conversion to published Seller Profile, 1–3% conversion to Starter within 60 days. At 500 outreach targets over month 2–3, expected yield: 20–30 published profiles, 5–15 Starter conversions.

#### 3.2.2 Industry Vertical Strategy — Order of Operations

Within the six seed categories, prioritize outreach in the order they appear in §1.3.1 (Security & GRC → Data & Analytics → DevOps → RevOps → HRIS → AI Infrastructure). Rationale per category:

- **Security & GRC first.** Highest RFP volume per vendor (most regulated-industry buyers send SOC 2 requests), most structured KB opportunity (trust centers are public and dense), strongest Policy-Powered Requirement Generation fit.
- **Data & Analytics second.** Highest category growth rate in 2026, weakest existing category pages on G2 (content-quality gap), TCO modeling is a strong wedge (data platforms have notoriously opaque pricing).
- **DevOps third.** Engineering buyers prefer structured evaluation; sellers have excellent public docs for KB Bootstrap; high willingness to use self-service tools.
- **RevOps fourth.** Dense competitive landscape; CRM Sync (Master Spec §31.9) + Seller Signals are the differentiator vs. Responsive; mature buyer market.
- **HRIS fifth.** Large cross-functional buying teams (ideal unlimited-seats positioning); longer sales cycles on buyer side delay M1 yield.
- **AI Infrastructure last.** Net-new category with no evaluation methodology incumbent; M10 guide ("How to Evaluate LLM Orchestration") is the wedge; vendors are young and often lack structured RFP response workflow.

#### 3.2.3 LinkedIn Outreach Sequences for Pre-Sales/RFP Teams

Target personas from `GTM_POSITIONING.md` §3: Sam (VP Sales/Partnerships), Aisha (Sales Engineer/Head of Pre-Sales), Leo (RFP Manager), Rachel (Head of Product Marketing).

**Leo (RFP Manager)** is the primary target because:
- They are the actual user (not the economic buyer)
- They feel the pain most acutely (responding to RFPs is their job)
- They are often under-resourced (solo RFP Manager is the #1 persona)
- They have authority to champion purchase decisions under $5K/yr

**Sam (VP Sales)** is the economic buyer and is targeted second, with a different pitch (Marketplace discovery + CRM Sync + Seller Signals as demand-gen surface).

**Aisha (Sales Engineer)** is the technical champion and is targeted third, with the technical pitch (KB MCP, citation integrity, outcome-based pricing).

**Rachel (Head of Product Marketing)** is the influencer on KB content quality and is targeted fourth, with a content-quality pitch (Seller Page Enrichment + Category Pages = owned-content surface).

### 3.3 Seller Activation Campaigns

#### 3.3.1 Completing Capability Declarations

Sellers who publish a profile but don't author Capability Declarations don't contribute to Network Effect 2 (KB → Capability → Match Score → EOI → Revenue). The founder's activation playbook:

- **Day 0 of publish:** Automated prompt inside the Seller Console: *"Unlock Marketplace matching. Add 3 Capability Declarations in 4 minutes."*
- **Day 3:** Founder-signed email: "I noticed [Company] hasn't added Capability Declarations yet. These are what buyers filter the Marketplace by. I'll send you a draft of 3 I'd suggest based on your KB — reply 'yes' and I'll have them drafted within the hour."
- **Day 7:** Automated reminder with KB-to-Capability auto-suggest link (Master Spec §26.4 / §22.18.3.5 — uses the Haiku-tier AI capability, cheap and high-volume).

Target: 60% of published sellers have ≥3 Capability Declarations within 14 days of publish.

#### 3.3.2 Running the Free KB Bootstrap

The lifetime-free KB Bootstrap (Master Spec §22.10.3 / §48.8) is the highest-leverage activation moment a seller experiences. For organic-signup sellers (not forced-signups who get automatic bootstrap), this is a manual trigger inside the Seller Console.

- **Day 0:** In-product CTA on the empty KB screen: *"Run your free Bootstrap. Crawls your website. Produces 40–200 KB entries. Takes 90 seconds. Lifetime-free per org."*
- **Day 3:** Founder email if not run: "Let me run your Bootstrap for you. 2 minutes of your time. Reply 'yes' with the URLs to crawl (homepage, docs, trust center)."
- **Day 7:** In-product reminder with social proof: *"247 sellers bootstrapped their KBs this week. Yours is waiting."*

Target: 80% of organic-signup sellers complete a KB Bootstrap within 14 days.

#### 3.3.3 Incentivizing Template Publishing (M9 / Loop 9)

Template publishing is a lower-frequency, higher-leverage action than Capability Declaration authoring. The incentive is editorial-featured placement in Category Pages (Master Spec §27.11.4 / §34.16.3; strictly editorial, not purchasable — this is the carrot).

- **Day 30 (post-first-bid-close):** Automated email: *"Your response to Requirement 47 was strong. Want to publish it as a reusable Template? Templates that get 10+ clones earn editorial-featured placement on Category Pages."*
- **Founder-operated curation** (first 100 published Templates): personally review and feature the top 20 by quality signal (KB-citation density, confidence scores, plain-language clarity). Featured templates get badge recognition in the Template Library.
- **Ongoing.** Once Templates hit scale, the Template Spam ML Classifier (Master Spec §48.4.5) gates quality; the founder only manually approves cross-category or high-visibility Template placements.

Target: 20% of sellers with ≥3 closed bids publish ≥1 Template within 90 days of eligibility.

---

## Section 4 — Demand-Side Acquisition: Detailed Tactics

Demand-side (buyer) acquisition compounds slower than supply-side because every buyer is a conversion decision (not a forced-signup), but every buyer seeds 3–10 sellers involuntarily. The ROI of founder time spent on buyer acquisition is therefore higher than raw conversion rate suggests — each buyer acquired compounds into forced-signup supply.

### 4.1 The Evaluation-as-Acquisition Strategy

**Thesis.** Every buyer evaluation is a supply-acquisition event. Spending founder time on buyer acquisition is structurally spending founder time on supply acquisition — because Loop 1 (Master Spec §48.2.2) fires inside every evaluation.

**Operational implication.** The founder should not split time 50/50 between supply and demand acquisition. The split is closer to 70/30 in favor of demand acquisition, because each acquired buyer yields 3–10 forced-signup sellers vs. the 1:1 yield of direct seller outreach.

The 30% supply-side time is reserved for direct outreach in **under-indexed categories** (categories where a buyer evaluation arrived but no matching vendors were on Sourcera — a supply gap that demand acquisition won't close on its own).

### 4.2 Industry-Specific "Evaluation Events"

**Mechanic.** The founder hosts curated virtual evaluation events in specific categories — a structured 6-week cohort where 5–10 buyers run a same-category evaluation in parallel, with founder-facilitated weekly calls, shared templates, and peer scoring calibration.

**Category priority:**
1. Security & GRC (month 2) — "SOC 2 Vendor Evaluation Sprint"
2. Data & Analytics (month 4) — "BI Platform Evaluation Cohort"
3. DevOps (month 6) — "CI/CD Evaluation Sprint"

**Value proposition for buyers:**
- Shared methodology (the Sourcera Method, Master Spec §2)
- Peer calibration (how are other procurement teams scoring this?)
- Founder-authored templates pre-loaded
- Accelerated timeline (4 weeks vs. 8–12 weeks)
- Free during the cohort (Free tier sufficient for 1 evaluation)

**Supply-side yield.** A Security & GRC cohort with 8 buyers × 7 vendors × 50% not-yet-on-Sourcera = ~28 forced-signup sellers. This compounds to 14+ paid Starter conversions within 90 days (at 20% Free→Starter) and seeds Category Page density for the same category (Loop 4 SEO compounding).

**Cost to Sourcera.** Free buyer Org signups × weekly 1-hour facilitated calls × founder time — ~40 hours per cohort. ROI: 28 new Seller Orgs + 5–8 buyer Orgs that convert to Starter within 60 days of cohort end.

### 4.3 Procurement Community Partnerships

**Target communities.** ISM (Institute for Supply Management), CIPS (Chartered Institute of Procurement & Supply), SIG (Sourcing Industry Group), Procurement Leaders, Spend Matters.

**Partnership strategy:**

1. **Sponsored webinar series** (one per community, Q3 2026). *"The Audit-Ready Software Evaluation"* — 45-minute content block, 15-minute demo, 30-minute Q&A. Founder presents; Sourcera is the sponsor. Generates 100–300 registered attendees per webinar; 20–40% opt in for a trial. Zero-paid-marketing conversion at ~$0 CAC.

2. **Thought-leadership content** on community-owned channels. Founder-authored pieces on *CPO Rising*, *Spend Matters*, *Procurement Foundry* on topics like: "Why SOC 2 audits are failing vendor-risk controls," "The 13-phase evaluation pipeline as a compliance artifact," "When to replace spreadsheets with structured evaluation." Content compounds into M10 How-to-Evaluate guides with backlinks that feed Loop 4 SEO.

3. **Community member program.** Early-access program for ISM/CIPS members: 3 months free Business Starter equivalent, no credit card, in exchange for one detailed case study contribution. Target 25 enrollments in Q3 2026.

### 4.4 Template Library as Buyer Acquisition Tool

**Thesis.** The Template Library is a buyer-acquisition magnet, not just a retention feature. Long-tail searches like "SOC 2 vendor evaluation template," "data platform RFP template," "CI/CD tooling evaluation framework" are high-intent, low-competition keywords where Template Library landing pages rank.

**Operational tactic.**
- 30 founder-authored Templates seeded by Day 30 across the 6 seed categories.
- Each Template has a dedicated landing page at `sourcera.com/templates/[slug]` with: (1) Template description, (2) Use Case structure preview, (3) Weight × Grade rubric preview, (4) CTA: "Clone this template into your workspace (Free)."
- Template landing pages emit Schema.org FAQPage and HowTo structured data.
- Template clone requires a Sourcera signup — conversion from "view template" to "signup" is the primary funnel metric.

**Target.** 30 Templates by Day 30, 100 Templates (founder-authored + seller-published) by Day 90. 500 organic sessions/month by Day 60, 2,000 sessions/month by Day 120, 10% conversion to buyer signup.

### 4.5 Content-to-Signup — How M9/M10/M11 Drive Buyer Signups

The category content stack (M9 Category Pages, M10 How-to-Evaluate Guides, M11 Comparison Pages) is the SEO flywheel that acquires buyers at near-zero marginal CAC once compounding.

**Content funnel mechanics.**

| Page type | Search intent | Conversion path | Expected 12-month organic volume per page (mature) |
|---|---|---|---|
| **M9 Category Page** (`/marketplace/category/[slug]`) | "[category] vendors" / "best [category] software" | View → click "Run your evaluation" → Buyer Free signup | 2,000–10,000 sessions/mo |
| **M10 How-to-Evaluate Guide** (`/guides/how-to-evaluate-[slug]`) | "how to evaluate [category]" / "[category] RFP template" | Read → Clone Template CTA → Buyer Free signup | 500–3,000 sessions/mo |
| **M11 Comparison Page** (`/compare/[vendor-a]-vs-[vendor-b]`) | "[vendor a] vs [vendor b]" | View → click "Run a structured comparison" → Buyer Free signup | 300–2,000 sessions/mo per comparison |

**Content production cadence.**

| Asset | Phase 1 (Days 1–30) | Phase 2 (Days 30–90) | Phase 3 (Days 90–180) |
|---|---|---|---|
| M9 Category Pages | 6 | 12 | 30 |
| M10 How-to-Evaluate Guides | 6 | 18 | 50 |
| M11 Comparison Pages | 0 | 20 | 100 |
| Total organic landing surfaces | 12 | 50 | 180 |

**Content quality floor.** Every page must pass: (1) E-E-A-T signals (founder-authored methodology block, author bio, publication date, update cadence), (2) original content density (≥1,500 words on Category Pages, ≥3,000 on Guides, ≥1,000 on Comparison Pages), (3) original imagery or structured data visualization, (4) outbound links to authoritative sources (NIST, ISO, industry associations).

---

## Section 5 — Marketplace Liquidity Tactics

### 5.1 Make the Marketplace Feel Full Before It Is

**Principle.** Marketplace liquidity is perceived through **category density** (how many vendors per category) and **profile quality** (verified, well-enriched, KB-backed), not raw profile count. A Marketplace with 500 sparse profiles feels emptier than one with 200 dense profiles clustered in 6 categories.

**Tactical implementation.**

1. **Category-concentrated seeding.** Phase 1 targets 50 profiles across 6 categories = ~8 per category. Density > breadth.
2. **Verification-tier stratification visible.** Category Pages (M9) display Verified and Certified badges prominently. At Phase-1 close, 5 of the 50 profiles are Verified — that's 1 Verified per category, enough to signal trust floor. By Phase-3 close, 30+ Verified and 3+ Certified per category target.
3. **Enrichment depth.** Seller Page Enrichment (Opus, Starter+) is the paid surface that turns a Basic Profile into a rich public page. Founder subsidizes the first 20 enrichments across Phase-1 Verified sellers (Sourcera-owned AI cost center, per Master Spec §26.7.2 / §48.6.2 editorial review) — so Category Pages launch with visually rich vendor entries, not barebones profiles.
4. **Capability Declaration density per profile.** Target median of 5 Capability Declarations per profile by Day 60 (vs. the minimum 3). Founder personally drafts and suggests Declarations for Phase-1 profiles during onboarding calls.
5. **Match Score signal integrity.** Qualitative labels ("Strong match" / "Good match" / "Possible match") must be tuned conservatively — false positives on "Strong match" corrode buyer trust faster than absent labels. Calibrate the threshold so that ≥70% of labeled-Strong matches result in EOI or direct invite within 14 days of buyer view.

### 5.2 Verification Tier Strategy

**Mechanic.** Verification tiers (Basic / Verified / Certified, per Master Spec §26.2 / §34.16.2) are never a billing surface. They are earned trust signals. The strategy is to **make earning them feel achievable and time-bound**, driving sellers to invest in profile completeness and documentation upload.

| Tier | Earning criteria | Target Day-90 volume | Founder role |
|---|---|---|---|
| **Basic** | Domain verification (DNS TXT) | All 200+ profiles | None direct — automatic |
| **Verified** | Profile completeness + SOC 2/ISO uploaded and Ops-validated | 30–50 profiles | Personally review the first 20 Verified applications; set Ops precedent for automation |
| **Certified** | Verified + ≥3 closed bids on Sourcera with buyer-side confirmation | 3–5 profiles | Personally celebrate the first 5 Certified sellers; Featured placement on Category Pages |

**Tier-up momentum.** Sellers who earn Verified see a materially higher Match Score weight (published multiplier per Master Spec §27.4). Sellers who earn Certified see the highest weight plus Featured placement eligibility. The tier-up incentive is **revenue visibility**, not vanity — Certified sellers appear at the top of Category Pages and in Comparison Pages as the default comparator.

### 5.3 Category-by-Category Launch Strategy

Each category launches in a defined 30-day window where the founder concentrates effort:

| Window | Category | Supply target | Content assets | Demand event |
|---|---|---|---|---|
| Days 1–30 | Security & GRC + Data & Analytics | 25 profiles in SecGRC, 15 in Data | 2 Category Pages, 2 Guides | SOC 2 Evaluation Sprint cohort (month 2) |
| Days 31–60 | DevOps + RevOps | 15 + 10 | 2 Category Pages, 2 Guides | CI/CD Evaluation Sprint (month 3) |
| Days 61–90 | HRIS + AI Infrastructure | 10 + 5 | 2 Category Pages, 2 Guides | HRIS Evaluation Cohort (month 4) |

**Category-launch checklist (per category):**
1. 10+ seed profiles committed (ideally 5+ Verified)
2. M9 Category Page live with SEO-indexed structured data
3. M10 How-to-Evaluate Guide published (3,000+ words, founder-authored methodology)
4. 3+ M11 Comparison Pages live (top 3 competitor pairs in the category)
5. 5+ founder-authored Templates in the category
6. At least one Evaluation Sprint cohort scheduled to run inside 60 days
7. Backlinks: 2 industry-specific publications, 1 community-channel mention

### 5.4 The "Sourcera 50" — Curated Launch List

**Mechanic.** A curated, founder-authored "Sourcera 50" launch list: 50 Verified-or-Certified-tier sellers across the six seed categories, treated as flagship inventory for the Marketplace launch. Each of these 50 receives:

- Priority editorial Featured placement on their Category Page for the first 30 days post-launch.
- A founder-written one-paragraph vendor description on their Software Page (complementing the auto-generated enrichment).
- Inclusion in the Marketplace launch announcement and associated press outreach.

**Selection criteria.**
1. Domain-verified + 4+ Capability Declarations + 1+ completed bid OR 3+ Templates published.
2. Category fit (≥1 match with the 6 seed categories).
3. Verified or Certified tier (SOC 2 / ISO documentation uploaded, Ops-validated).
4. Active response behavior (seller has used the platform in the prior 30 days).

**Operational benefit.** The Sourcera 50 list functions as the supply-side equivalent of a "launch partner" announcement. Early sellers invest in reaching the list (Verified tier + bid activity) because of the editorial upside. Sourcera benefits from a flagship inventory that looks professional and dense when Category Pages start ranking.

### 5.5 Pro Trial Seats (M17) as Liquidity Accelerator

Pro Trial Seats are the highest-leverage liquidity accelerator for two reasons:

1. **They bypass the Free ceilings at the highest-converting moment of the seller funnel.** A vendor on a Pro Trial Seat arrives via buyer invite, goes through the Hero Moment, and immediately has access to Starter-tier capacity (3 concurrent bids, 10 EOIs/mo, 1,000 KB entries, $30 AI budget). They skip Free-tier ceiling hits entirely.
2. **They are buyer-funded.** Scale/Enterprise buyers pay for them via their plan subscription; the incremental cost to Sourcera is only the seller's AI usage against the Org's pooled budget.

**Operational tactic.**
- During the first 10 Scale/Enterprise sales, the founder explicitly sells M17 as a headline value proposition of those tiers: *"Your vendors show up to Sourcera with 30 days of Starter-tier capacity, on you. Higher-quality responses to your bid, at zero extra cost to your organization."*
- Measure trial→Starter conversion lift vs. cold Free→Starter conversion. Target: ≥2× conversion rate on trial-converted sellers.
- Track trial-seat utilization rate. If Scale buyers use <60% of their monthly allocation, M17 is under-recognized as a feature; re-surface it in the buyer Onboarding and at every monthly Pulse Digest email.

---

## Section 6 — Category Expansion Playbook

### 6.1 Which Categories to Launch First — Criteria

The six seed categories (§1.3.1) were chosen on three criteria:

1. **Evaluation frequency** — how often buyers in the ICP run an evaluation in this category per year. Higher frequency = faster M1 loop ignition.
2. **RFP volume** — how many structured RFPs vendors in the category respond to per year. Higher volume = higher value to sellers of KB automation and Marketplace discovery.
3. **Vendor density** — how many vendors in the category match the Primary Seller ICP. Higher density = easier supply seeding.

The same criteria govern category expansion in months 6–12. Below is the scoring matrix for the 14 categories Sourcera will consider in year 2, sorted by weighted score:

| Category | Evaluation frequency (buyer) | RFP volume (seller) | Vendor density | Launch priority (Year 1 / Year 2) |
|---|---|---|---|---|
| Security & GRC | High | High | High | **Year 1 — launched Days 1–30** |
| Data & Analytics | High | High | High | **Year 1 — launched Days 1–30** |
| DevOps & Platform Engineering | Med-High | Med | High | **Year 1 — launched Days 31–60** |
| Revenue Operations | Med | Med | High | **Year 1 — launched Days 31–60** |
| HRIS / HR-Tech | Med | Med | High | **Year 1 — launched Days 61–90** |
| AI Infrastructure | Med | Low-Med | Med | **Year 1 — launched Days 61–90** |
| Compliance & Audit (GRC-adjacent, deeper) | Med | High | Med | Year 2 Q1 |
| Finance & Accounting SaaS | Med | Med | High | Year 2 Q1 |
| Marketing Automation | Med | Med | High | Year 2 Q2 |
| Customer Support SaaS | Med | Med | High | Year 2 Q2 |
| Supply Chain & Logistics SaaS | Med | Med | Med | Year 2 Q3 |
| Legal Tech | Low-Med | High | Med | Year 2 Q3 |
| FinTech Infrastructure (payment rails, KYC) | Med | Med | Med | Year 2 Q4 |
| Vertical SaaS (healthcare-specific, etc.) | Varies | Varies | Varies | Year 2–3, case-by-case |

### 6.2 Playbook for Entering a New Category

**Pre-launch (Days -30 to 0).**

1. **Supply seed list.** 30 target vendors, half Verified-eligible (have SOC 2 or ISO), half Basic-eligible.
2. **Content assets drafted.** M9 Category Page (1,500+ words), M10 Guide (3,000+ words), 3 M11 Comparison Pages (1,000+ words each), 5 Templates.
3. **Controlled Taxonomy review.** Capability Declaration taxonomy (Master Spec §26.3 / §4.5.5) reviewed for the new category — any gaps closed with new tags.
4. **Backlink plan.** 2 industry publications, 1 podcast appearance, 1 community-channel post.
5. **Evaluation event scheduled.** A 6-week cohort in the category, starting at Day 45 post-launch.

**Launch window (Days 0–30).**

1. Cold outreach to the 30 supply target vendors using the "Your profile is already live" pitch (§2.1.2).
2. Publish all content assets simultaneously. Submit sitemaps.
3. Founder-operated onboarding for the first 10 published sellers.
4. Market the evaluation event cohort — target 8 buyer Orgs enrolled.

**Mid-launch (Days 30–60).**

1. First buyers from the evaluation cohort invite vendors → Loop 1 ignites.
2. Published sellers hit the first conversion moments (second invite, first EOI, KB ceiling).
3. Category Page organic traffic begins (if SEO infrastructure is healthy).
4. Founder personally closes the first 3 paid Starter conversions in the category — these are the anchor case studies.

**Mid-compounding (Days 60–90).**

1. Category Page begins ranking on long-tail searches.
2. Comparison Pages auto-compound as more vendor pairs get documented.
3. Published Seller Profiles with KB depth drive SEO — individual Software Pages begin ranking for "[Vendor X] alternatives" searches.
4. Template clones begin; Template-Clone-Attribution (Loop 2) ignites.

**Self-sustaining (Day 90+).**

1. Founder time in the category drops to ≤20% of Phase 1 intensity; category runs on self-service supply acquisition + organic demand.
2. Category metrics feed into Ops dashboards; founder intervenes only on anomaly (bootstrap failures, Signal Integrity Monitor alerts, verification-queue backlog).

### 6.3 How Category Pages (M9) and Comparison Pages (M11) Auto-Compound Once Seeded

Per Master Spec §48.6.2 / §48.6.5-§48.6.7, M9 and M11 are refreshed on cadence by Sourcera-owned AI capabilities (`category_faq_generation`, `guide_refresh_analysis`, etc.). Auto-compounding means:

- Every new published Seller Profile in a category automatically appears in the Category Page's vendor list (subject to verification-tier threshold).
- Every new Capability Declaration updates the Category Page's filter options.
- Every new Comparison Page pair is auto-generated when two vendors in the same category exceed the threshold for comparability (mutual Capability Declaration density + closed-bid data).
- Quarterly refreshes regenerate FAQs and summary content based on accumulated evaluation data (subject to k=5 anonymity floor for Category Pages, k=10 for Comparison Pages, k=20 for Market Intelligence Reports).

**Operational requirement.** The editorial review gate (Master Spec §48.6.2 / §48.6.5-§48.6.7) must run every quarterly refresh through a Marketing check — Ops Console flags pages where content quality has degraded. Founder personally reviews the first 4 refresh cycles (12 months of cycles across all categories) before handing off to editorial automation.

### 6.4 Timeline — Categories at Launch, Month 3, Month 6, Month 12

| Time | Categories launched | Total Seller Profiles | Total Buyer Orgs | Closed bids cumulative |
|---|---|---|---|---|
| Launch (Day 0) | 0 (foundational infrastructure live, no categories populated) | 0 | 0 | 0 |
| Month 3 (Day 90) | 6 seed categories | 200+ | 30–50 | 20+ |
| Month 6 (Day 180) | 6 seed + 2 new (Compliance & Audit, Finance SaaS) | 500+ | 75–100 | 100+ |
| Month 12 (Day 365) | 10 categories launched | 1,200–1,800 | 200+ | 500+ |

**M12 Market Intelligence Report eligibility** (k=20 floor): expected to be met in Security & GRC and Data & Analytics by month 9, all 6 seed categories by month 12.

---

## Section 7 — Defensibility and Moat Assessment

### 7.1 When Do Network Effects Become Self-Sustaining?

A network effect is self-sustaining when the loop's branching factor exceeds 1 without ongoing founder intervention — i.e., organic operation of the loop reliably produces more input than it consumes.

**Loop-by-loop milestones for self-sustainment:**

| Loop / Effect | Self-sustaining milestone | Expected month |
|---|---|---|
| Loop 1 (Vendor-Invite-Creates-Account) | 20+ active buyer Orgs running evaluations; M1 fires 40+ times/month without founder coaching | Month 4–6 |
| Loop 4 / Network Effect 4 (Seller-Profile SEO) | 6 Category Pages at 500+ organic sessions/month each; inbound buyer signups from SEO ≥20% of monthly buyer acquisition | Month 9–12 |
| Loop 5 (Free-AI-Teaser-to-Paid) | Free→Paid conversion rate stable at 10–15% across a 3-month rolling window without founder-led recovery | Month 6 |
| Loop 8 (Bid-Close-KB-Sync) | ≥70% of closed bids auto-sync at least 1 response to seller KB | Month 4 |
| Loop 9 / Network Effect 7 (Template Publish Incentive) | Published-seller-authored Templates ≥ founder-authored Templates | Month 9 |
| Network Effect 2 (KB → Capability → Match → EOI → Revenue) | EOI submission volume ≥ direct-invite volume inside buyer evaluations | Month 12 |
| Network Effect 3 (Bid-Close → Win/Loss → Learning) | Match Score calibration improves measurably across rolling 90-day windows (AUC or equivalent) | Month 9–12 |

**Aggregate milestone — "the flywheel is self-sustaining."**

- 200+ buyer Orgs
- 1,000+ seller Profiles across 10 categories
- 100+ closed bids per month
- 50%+ of new seller signups from SEO or forced-signup (not direct outreach)
- 25%+ of new buyer signups from SEO (not founder network or outreach)

Expected reach: **month 12–15.** Funding/capitalization should assume founder operational time remains high through month 18.

### 7.2 Switching Costs

**Buyer switching cost drivers:**
1. **Evaluation history.** Past evaluations, scoring decisions, Selection Records are retained on-platform. Moving off Sourcera means re-authoring every historical evaluation from exports (Master Spec §40.1) — technically possible, operationally expensive.
2. **Templates.** Authored Templates (custom Use Case + Requirement structures, custom weighting, custom rubrics) live in the Template Library. Moving off loses the compounding template investment.
3. **Organizational Intelligence (Master Spec §16).** Cross-evaluation analytics (vendor history, scoring inconsistencies, efficiency metrics) are derivative of on-platform data. Moving off loses the compounding intelligence surface entirely.
4. **Integrations.** Jira/Linear/Asana/Azure DevOps/Salesforce connections configured per workspace. Moving off requires re-configuring every integration.
5. **Selection Record audit artifacts.** SHA-256 hashed Selection Records are the artifact auditors ask for. Moving off loses the immutable audit trail's on-platform authenticity.

**Seller switching cost drivers:**
1. **KB confidence scores, citation graph, win-rate weights** (Master Spec §22.18.4 / §34.19.2 On-Platform Compounding). These compound learnings are not portable — they are Sourcera's learning from seller behavior, not raw KB content. Export preserves the text; the intelligence stays behind.
2. **Verification tier status.** A Certified seller on Sourcera is a months-earned trust signal on Category Pages. Moving off loses the Marketplace ranking weight.
3. **Capability Declaration taxonomy alignment.** A seller's declarations are tuned to the Sourcera controlled taxonomy. Moving to a competing platform means re-authoring against a different taxonomy (or no structured taxonomy).
4. **CRM Sync configurations.** Field mappings, routing rules, automation connections to Salesforce/HubSpot/Dynamics/Pipedrive — all workflow configuration that has to be rebuilt elsewhere.
5. **Ongoing buyer invites.** A vendor who has received 5 buyer invites on Sourcera has a pipeline that only operates on Sourcera. Leaving = losing the pipeline.

**The honest-portability commitment (Master Spec §34.19.5 / §40.1 / §22.18).** KB is exportable at every tier, including Free. This is strategic. It builds trust (reducing the "lock-in" objection that kills B2B deals in procurement-heavy orgs), which in turn makes paid conversion easier. Stake is built from compounding utility, not hostage-taking. The seller can always leave with their text KB; what they can't take is the compounding on-platform intelligence. That's the moat.

### 7.3 The Data Moat — Outcome-Based AI Accounting

**Mechanism.** Every AI Operation settles as `accepted` or `rejected` per a capability-specific signal (Master Spec §34.11 / §34.15). This signal is a proprietary data asset with three compounding properties:

1. **Per-capability quality calibration.** Every accepted/rejected outcome is a training signal for which prompts, models, retrieval strategies, and context windows produce high-acceptance outputs. This data is Sourcera's alone.
2. **Per-vendor KB learning.** Acceptance rates per KB entry drive confidence scores, which drive retrieval ranking, which drive draft quality, which drives more acceptances — a per-vendor compounding loop.
3. **Cross-vendor Match Score calibration.** Match Score accuracy improves with every EOI-view-to-EOI-submit outcome (Master Spec §34.11 / §34.15 Match Score accepted signal). Cross-vendor learning compounds as Marketplace inventory grows.

**Defensibility.** A competitor entering this space would need to replicate:
- Outcome-accounted AI infrastructure (technically buildable, but 12+ months of engineering)
- Training data volume (Sourcera's first-mover advantage accumulates faster than competitor can close the gap, assuming Sourcera maintains >10× their data volume)
- Controlled Capability Taxonomy (Master Spec §4.5.4 / §4.5.5) — an editorial asset that requires category-by-category curation

Importantly, the data moat is **dual-sided**: buyer-side evaluations produce scoring signal (which trains Pre-Scoring quality), and seller-side bids produce KB signal (which trains KB retrieval and First-Pass Responder quality). Both sides compound the same platform.

### 7.4 The SEO Moat — First-Mover Category Domination

**Mechanism.** M9 Category Pages + M10 Guides + M11 Comparison Pages + M12 Market Intelligence Reports = a 180–500-page organic-search surface per category at scale. First-mover advantage per category is disproportionate because:

1. **Schema.org structured data emission from day one.** Every published profile emits Organization + SoftwareApplication schema. Sourcera is indexed by search engines as the authoritative source for each vendor's structured metadata.
2. **Long-tail keyword coverage.** M11 Comparison Pages cover n × (n-1) / 2 vendor pairs per category. At 50 vendors in Security & GRC, that's 1,225 comparison pages — far more than G2 or Capterra generate.
3. **Freshness signal.** Quarterly M9 refreshes + continuous M11 auto-generation mean search engines see the pages as actively maintained. This outperforms static G2 category pages on freshness ranking factor.
4. **Buyer-signal-fed content.** M12 Market Intelligence Reports contain cross-Org analytics no competitor can produce — because no competitor has access to buyer-side evaluation data at Sourcera's volume.

**Defensive posture against Gartner/G2:**
- Gartner owns Magic Quadrants (analyst opinion content).
- G2 owns Peer Reviews (sentiment content).
- Sourcera owns Category Inventory (structured vendor metadata) + Evaluation Content (structured comparison content). These are adjacent, not overlapping, moats.
- Long-term, G2 and Gartner are partnership targets, not competitors — the evaluation layer is upstream of both.

### 7.5 The Aggregation Theory Play

**Thesis.** Sourcera is betting that the buyer-seller relationship in enterprise software procurement is currently intermediated by:
- G2 / Gartner / TrustRadius (review layer) — buyers discover vendors
- Responsive / Loopio / Qvidian (seller tooling) — vendors respond to RFPs
- Coupa / Ivalua / Jaggaer (procurement suites) — buyers transact with vendors post-selection

None of these owns the **evaluation layer**. The evaluation is where the buyer-seller relationship is *decided*. By owning the evaluation layer, Sourcera aggregates the decision moment itself — upstream of transaction, downstream of discovery.

**Aggregation theory applied.** In Ben Thompson's aggregation framework, Sourcera becomes the default interface between buyers and sellers *if and only if* buyers trust the evaluation methodology and sellers trust the Hero Moment experience. Both sides of that trust compound:

- Each successful evaluation on Sourcera is an implicit endorsement of the methodology (the Sourcera Method, Master Spec §2) that reduces buyer acquisition friction for the next buyer.
- Each successful forced-signup that converts to Starter is an implicit endorsement of the Hero Moment that reduces seller acquisition friction for the next vendor.

**Moat structure at maturity.**
- **Supply-side:** Sellers cannot replicate the forced-signup + Hero Moment volume because they don't own the buyer side.
- **Demand-side:** Buyers cannot replicate the integrated vendor discovery because they don't own the seller inventory.
- **Platform:** Both sides' tooling compounds against the platform's proprietary outcome-accounted AI intelligence.
- **Categories:** Per-category SEO compounds as first-mover advantage calcifies into brand recognition ("Sourcera Security & GRC vendor list" becomes a canonical reference).

**The long-term monetization thesis.** Subscription plans + outcome-accounted AI Wallet + Marketplace Discovery (Promoted Listings, Featured Placements) are the year-one monetization surface. Year three and beyond, the platform also monetizes:
- Transaction layer integration fees (once Sourcera integrates into Coupa/Ivalua/Ariba at Enterprise, the post-Phase-13 handoff becomes a billable surface)
- Market Intelligence Reports as a paid research product for analysts, investors, and category GMs
- API access tiering for data consumers (CRM vendors, RevOps platforms, category analysts)

---

## Appendix A — Weekly Founder Operating Cadence (First 90 Days)

| Day | Time block | Activity |
|---|---|---|
| Monday AM | 2h | Review weekend signup cohort; triage any Hero Moment failures from the weekend |
| Monday PM | 3h | Buyer Org outreach + content authoring (1 M9 or M10 piece) |
| Tuesday AM | 2h | Seller direct outreach (30–50 LinkedIn messages / emails) |
| Tuesday PM | 3h | Onboarding calls with new Sellers (up to 4 × 45min calls) |
| Wednesday AM | 2h | Review dashboards: activation funnel, rejected-op rate, p50/p90 time-to-first-response, second-invite rate, Free→Starter conversion |
| Wednesday PM | 3h | Content authoring (1 M10 Guide or 2 Templates); founder-signed case study drafting |
| Thursday AM | 2h | Buyer onboarding calls (up to 3 × 45min) + Evaluation Sprint cohort facilitation |
| Thursday PM | 3h | Follow-up with Day-7 forced-signup non-submitters; Day-10 postmortem calls |
| Friday AM | 2h | Marketplace Ops: verification tier reviews, Featured Placement editorial, Signal Integrity Monitor alert triage |
| Friday PM | 2h | Analytics synthesis; weekly dashboard publication to founder notes; plan next week |
| Saturday | 2h | Community engagement (ISM, CIPS, Procurement Leaders posts + comments) |
| Sunday | 0h | Rest (avoid founder burnout during 12-month solo-operator phase) |

Total: ~28 hours of customer-facing work per week + ~12 hours of content/ops/analytics. Aggressive but sustainable for a 12-month horizon; not sustainable beyond month 15 without hiring.

---

## Appendix B — Top 12 Metrics to Track Weekly

1. **p50 and p90 minutes from magic-link click to first submitted requirement response** — leading indicator of Hero Moment health (target p50 < 20min, p90 < 60min)
2. **% of Free sellers whose KB Bootstrap generates ≥40 approved entries** — bootstrap acceptance rate (target ≥70%)
3. **Rejected-op rate for First-Pass Responder** — margin protection signal (target <30%)
4. **Second-invitation arrival rate on Free cohort** — Loop 1 compounding signal (target ≥20% by Day 60)
5. **Free seller → Starter conversion %** — primary supply monetization signal (target 10–20%)
6. **Days to first submitted bid on Free** — activation speed (target median ≤ 7 days)
7. **Buyer evaluations reaching Phase 13 per month** — demand liquidity signal (target 10+ by month 3)
8. **Total published Seller Profiles across 6 seed categories** — supply density signal (target 200+ by Day 90)
9. **Organic signups (not forced) per week** — content/SEO flywheel health (target 5+/wk by month 2, 20+/wk by month 3)
10. **EOI submission rate per tier** — Marketplace engagement signal; Moment-2 conversion predictor
11. **Template clones per published Template** — Loop 2 / Loop 9 compounding signal (target ≥5 by Day 90 per Template)
12. **Blended gross margin per plan tier** — financial health check (target ≥90% Starter, ≥93% Growth, ≥85% Scale, ≥50% Enterprise until commit scales)

Signals outside these 12 are noise in the first 90 days. Triage discipline is critical for a solo operator; deep-dive investigation of any one of these 12 takes priority over any other analytics question.

---

## Appendix C — Kill Condition Triage Playbook

A kill condition is a single product or policy defect that stops a loop from functioning. The founder must run a weekly kill-condition review across all major loops.

| Loop / Effect | Kill condition signal | First-week triage action |
|---|---|---|
| Loop 1 / Network Effect 1 | Bootstrap success rate <90% for 3 consecutive days | Engineering triage on KB Bootstrap pipeline; halt forced-signup marketing until resolved |
| Loop 4 / Network Effect 4 | Schema.org markup validation fails on any new publish | Immediate engineering triage; retroactively fix all affected profiles |
| Loop 5 | Rejected-op rate on any capability >40% for 7 days | Capability configuration review; consider pausing capability or switching model tier |
| Loop 8 / Network Effect 3 | Outcome signals not firing on closed bids (>5% lost-signal rate) | Engineering audit of Phase 13 signal emission + Outcome Resolver |
| Network Effect 2 | Capability Declaration auto-suggest acceptance rate <20% | Taxonomy review (Master Spec §4.5.4 / §4.5.5); may be missing category coverage |
| Loop 9 / Network Effect 7 | Template Spam ML Classifier false-positive rate >5% (legitimate Templates blocked) | Classifier re-calibration; manual review queue temporarily expanded |
| M1 forced-signup | Invite email deliverability <85% | DMARC/SPF reputation check; Suppression List audit (Master Spec §48.4); pause outbound if reputation damaged |
| M12 M13 | k-anonymity floor breach in any published report | Immediate unpublish; post-mortem on anonymization pipeline; re-audit all historical reports |

These triage rules are operational default-rejects — the founder assumes a kill-condition is present until the signal is explained. Bias toward over-reaction early; the cost of a broken network effect compounds faster than the cost of a false alarm.

---

## Closing Note — What Sourcera's Flywheel Is Not

Sourcera's flywheel is not G2's SEO flywheel (which is vendor-reviewing buyers). It is not Responsive's retention flywheel (which is KB content per seller). It is not Coupa's platform flywheel (which is P2P transaction volume). It is the **evaluation flywheel** — every evaluation seeds sellers, every seller invite teaches the platform, every closed bid sharpens the model, every Category Page ranks the Marketplace, and every Marketplace listing is another fuse for the next evaluation.

The solo-operator phase (months 1–12) is intrinsically founder-intensive — the Hero Moment has to execute flawlessly for each early forced-signup, the Category Pages have to be edited personally before publication, and the Sourcera 50 list has to be curated by hand. Past month 12, the flywheel runs on its own branching factor, and the founder's role shifts from operator to steward.

The single most important invariant across the entire 12 months: **vendor response to an invited bid is always free, always unpaywalled, always Hero-Moment-accelerated.** Every other growth mechanic is downstream of that commitment.
