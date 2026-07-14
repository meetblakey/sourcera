# Sourcera — 90-Day Launch Sprint Plan

**Version:** 1.0
**Date:** 2026-04-20
**Owner:** Founder (solo operator)
**Horizon:** T-4 weeks → T+90 days. Launch-Day Target: Monday, 2026-05-18.
**Source authority:** `Sourcera_Master_Summary.md` v1.1 · `GTM_POSITIONING.md` v1.0 · `GTM_PLG_ARCHITECTURE.md` v1.0 · `GTM_SALES_PLAYBOOK.md` v1.0 · `GTM_CONTENT_ENGINE.md` v1.0.
**Purpose:** The executable week-by-week launch sprint for one founder operating a two-sided marketplace under a ≤50-hour weekly ceiling. Every task listed below has an owner (the founder), a deliverable, an hours estimate, a tie-back to an M-number or §, and a gating criterion. This is the plan; the GTM documents are the reference manuals.

**How to read this document.** Hours are the wall-clock time the founder spends — deep work, demos, writing, CRM hygiene, all inclusive. The ceiling is 50 hrs/wk; most weeks land between 44 and 50. Every week explicitly covers both sides of the marketplace (Buyer Console and Seller Console) because the Dual-Console architecture (§6.1 Master Summary) is the product's structural core and the flywheel (GTM_SALES_PLAYBOOK §1.3) only compounds when both sides ship simultaneously. Where hours for a week sum below 50, the residual is the explicit Float block reserved for opportunistic writes, partner calls, and contingency — not padding.

**Drift anchors.** Every reference below is load-bearing against the authoritative category name — *Software Evaluation Platform* — the 13-phase pipeline, the Dual-Console firewall, outcome-accounted AI pricing, unlimited seats, and the Hero Moment. No section uses adjacent-category softening ("procurement suite," "RFP tool," "AI for procurement"). Growth Mechanics are named by M-number; the launch set at GA is **M1, M2, M4, M5, M8, M14, M15, M17** (GTM_PLG_ARCHITECTURE §5.9). M3, M6, M7, M9, M10, M16 ship in Month 2. M11, M13 ship Month 3–4. M12, M18+ ship Month 6–9. This plan does not pretend to launch M9/M10/M11 at GA — doing so silently is the single most common pre-launch drift pattern.

---

## SECTION 1 — LAUNCH READINESS CHECKLIST

Everything in this section must be green before launch-day (2026-05-18) morning push. Items are grouped by domain. Each item names its owner (founder), the acceptance criterion, and the source §. If an item cannot be green by T-2 days, it is descoped to Month 1 post-launch — not fudged.

### 1.1 Product Surface — Buyer Console

| # | Item | Acceptance | Source |
|---|---|---|---|
| 1.1.1 | Buyer Free workspace creation, Cmd+K, Linear-benchmark shell | Workspace creatable in < 60 s from magic-link; Cmd+K navigates; 8 UX principles pass (§5 Master Summary) | §6.1, §5 |
| 1.1.2 | Buyer signup — WorkOS SSO + email magic-link | 7-step signup < 2 min p50; WorkOS OSS/OIDC path works on 2 test IdPs | §6.1.1, PLG §2 |
| 1.1.3 | Template Library seeded — 19 curated templates | All 19 templates imported, clone-into-workspace works, categorized: CRM/ERP/Security/ITSM/HRMS/DevOps/Data/AI-Infra/Finance | §6.10, PLG §2.3 |
| 1.1.4 | 13-phase pipeline — Phases 1–12 operational; Phase 13 (post-award) stubbed with copy | Buyer can walk a test evaluation end-to-end; Phase 13 shows a "coming soon" pane citing §6.2 | §6.2 |
| 1.1.5 | Pre-Scoring capability working across 3 sample vendors | Aha Moment fires; Pre-Scoring Report renders; PostHog event `buyer_prescoring_completed` emits | PLG §2.4, §6.3 |
| 1.1.6 | FM/PM/EJ Scoring Engine with Disagreement Insight Cards | Scoring runs across ≥10 requirements, 2 reviewers, surfaces disagreement ≥0.3 | §6.3, §6.3.4 |
| 1.1.7 | Selection Report generator (Phase 12) | DOCX + PDF export; SHA-256 hash emitted; matches the template shipped as Asset 8 | §6.37 |
| 1.1.8 | Buyer AI Budget Meter — real-time consumption, $5/$50/$300/$800 | Meter renders on all Console screens; 80% warning email via Loops at threshold | §2.3 Master Summary, §2.4 Buyer Pricing |
| 1.1.9 | Policy-Powered Requirement Generation — NIST 800-53 Rev 5 test upload | Upload parses, dedupes at ≥90% confidence, produces ≥80 scorable requirements | §6.6 |
| 1.1.10 | TCO Modeling (6 pricing schemas) | Flat/tiered/one-time/%-of-license/estimate-range/discount all working; 1/3/5-year projections render | §6.5 |
| 1.1.11 | Audit Log visible to buyer admins | Append-only, SHA-256 chained, ≥24 event types emitting | §6.24 |

### 1.2 Product Surface — Seller Console

| # | Item | Acceptance | Source |
|---|---|---|---|
| 1.2.1 | Seller Hero Moment — 0-3 min onboarding from magic-link | p50 < 20 min magic-link → first submitted response across 5 dogfood bids | §3.6 Master Summary, §14.2 Seller Pricing |
| 1.2.2 | Seller Free — published profile on signup with domain verification | Profile publishes within 60 s of email-verified login; Schema.org Organization/SoftwareApplication emitted | §6.15.1, §6.15.4 |
| 1.2.3 | KB core — 50-entry Free cap; entry lifecycle; cite-before-state default | Free cap enforces; cap-hit event fires; Haiku draft mode works without Opus fallback at Free tier | §6.13, §6.14.2 |
| 1.2.4 | Bid Workspace — First-Pass Responder on invited bid | Bid draft generated from KB + Requirements within 3 min; confidence scores render | §6.14 |
| 1.2.5 | Ghost-Bid Importer (M15) | 12-month-old RFP import produces ≥40 approved KB entries; provenance captured | M15, §6.13 |
| 1.2.6 | Seller AI Budget Meter — $5/$30/$200/$600 | Meter renders; budget-ceiling behavior aligns with Seller Pricing §2.2 | §2.2 Seller Pricing |
| 1.2.7 | Capability Declarations — author + attach to SellerSoftware entity | Can declare ≥3 capabilities; appears in category-matched Marketplace inventory | §6.15.3, §6.15.5 |
| 1.2.8 | EOI workflow stub — locked until buyer-side shortlist | Screen shows EOI gated; copy explains Starter unlock (conversion moment #2) | PLG §4.2 |
| 1.2.9 | Bid Success Share (M14) | Win/loss outcome capture emits anti-metric to seller dashboard | M14 |
| 1.2.10 | Pro Trial Seat provisioning (M17) for Scale buyers inviting sellers | 5 trial seats/mo on Scale; fulfillment runs on M1 invite path | M17, §6 Buyer Pricing |

### 1.3 Growth Mechanics — GA Set (Must Be Green)

| Mechanic | Status required | Verification |
|---|---|---|
| **M1 Vendor-Invite-Creates-Account** | Magic-link + `bid_id` prebind + domain-verify Hero Moment path live | Invite test emails delivered in < 30 s; Hero Moment fires at vendor first login |
| **M2 Selection Report Public Link** | Public (buyer-opt-in) read-only link with `no-index, no-archive` metatag + watermark | Link visible to unauthed viewer; watermark present |
| **M4 Kick Off Next Evaluation** | One-click duplicate of closed evaluation as scaffold | Target: 40%+ of buyers running ≥2 evals by month 3 |
| **M5 Buyer-Pull Vendor Invite** | Buyer autocomplete returns verified SellerOrgs; invite routes through M1 | 0 fabricated-vendor invites possible |
| **M8 Org Intelligence Value Curve** | 8th-eval "diminishing-returns disable" guardrail + k-floor in effect | Private cross-org signal requires k=5; aggregate k=10; public k=20 |
| **M14 Bid Success Share** | Anonymized category win-rate visible to seller | No attributable buyer-side data leaked |
| **M15 Ghost-Bid Importer** | Live as primary Hero Moment asset for Organic sellers | KB seed path + paste-RFP mode both working |
| **M17 Pro Trial Seat** | 5/mo Scale, 15/mo Enterprise (on launch, Enterprise gate deferred) | Seat provisioning + claim flow + conversion measurement attached |

### 1.4 Infrastructure

| # | Item | Acceptance |
|---|---|---|
| 1.4.1 | WorkOS SSO tenant live with 2 test IdPs | Google Workspace + Okta sandbox both authenticate |
| 1.4.2 | Convex backend: 50 RPS burst, sub-300 ms p95 on Console endpoints | Load test at 50 RPS; p95 < 300 ms on 3 critical endpoints |
| 1.4.3 | Stripe billing live — 10 plan SKUs (5 buyer × 2 billing freq) + 10 seller | Test charges on all 20 SKUs; webhooks to Convex reconcile subscription state |
| 1.4.4 | Loops.so lifecycle events wired — 8 event triggers minimum (§4.4 Content Engine) | `buyer_free_signup`, `seller_forced_signup_day0`, `seller_free_day7`, `seller_free_day30`, `seller_concurrent_bid_limit_hit`, `buyer_ai_budget_80pct`, `kb_bootstrap_complete`, `selection_report_generated` all firing |
| 1.4.5 | PostHog taxonomy v1 — PQL scoring job runs hourly | Score ≥50 / ≥100 / ≥150 cohorts emit to CRM (Attio) via webhook |
| 1.4.6 | Firecrawl — Seller Page Enrichment from domain verification | Crawl completes for 5 dogfood sellers; enrichment data populates profile |
| 1.4.7 | Status page live at `status.sourcera.com` | Reports auth, API, Convex, Stripe, Loops independently |
| 1.4.8 | Error monitoring (Sentry) + alerting (PagerDuty solo schedule) | P1 alerts go to founder phone within 60 s |

### 1.5 Content & Marketing Surface

| # | Item | Acceptance | Source |
|---|---|---|---|
| 1.5.1 | Marketing site — Framer, 7 core pages | Home, /method, /pricing (buyer), /pricing-sellers, /for-buyers, /for-sellers, /about | GTM_POSITIONING §7 |
| 1.5.2 | The Sourcera Method cornerstone published at `/method` | 10K-word guide; `HowTo` + `Article` schema; 13-chapter IA | Content Engine §2.4 |
| 1.5.3 | Asset 1 — Method + Templates Bundle (PDF + 8 templates) | Email-gated; DOCX + PDF + GDoc versions of all 8 templates | Content Engine §5.1 |
| 1.5.4 | Substack *The Evaluation* + LinkedIn newsletter mirrored | Issue 1 drafted and scheduled for T+0 | Content Engine §4 |
| 1.5.5 | Loops nurture sequences — 6 drips live | Buyer Day 0/3/7/14; Seller Day 0/7/30; newsletter welcome | Content Engine §4.4 |
| 1.5.6 | Founder LinkedIn profile + About block + featured section | About block names the category; featured = Method post + Asset 1 download | Content Engine §3 |
| 1.5.7 | Attio CRM — 4 pipelines live | Buyer Outbound, Buyer PQL, Seller Outbound, Seller PQL | Sales Playbook §1.5 |
| 1.5.8 | Instantly.ai — 3 inboxes on `sourcera.io` domain, warmed | 14-day warmup complete by T-0; avg deliverability ≥95% | Sales Playbook §1.5 |
| 1.5.9 | 20 blog posts outlined — Posts 1–3 fully drafted | Post 1 = Method cornerstone; Posts 2–3 queued for W2–W3 | Content Engine §2.3 |
| 1.5.10 | Demo deck + product-walkthrough Loom (buyer) + (seller) | Two 2-min Looms, two 8-min structured demos, all from dogfood workspace | Sales Playbook §6 |

### 1.6 Legal, Compliance, Anti-Spam

| # | Item | Acceptance |
|---|---|---|
| 1.6.1 | MSA + Order Form + DPA templates in Dropbox Sign | All three templates reviewed by outside counsel, execution-ready |
| 1.6.2 | Privacy policy + Terms + Subprocessor list at `/legal/*` | All three pages live, include WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops, Perplexity |
| 1.6.3 | GDPR DSAR + Right-to-Erasure workflow documented in `/ops/dsar.md` | Founder-runnable playbook with 30-day SLA |
| 1.6.4 | Vendor Opt-Out Registry live (pre-M1 spam defense) | Sellers can opt out of invites via public form; registered to suppress M1 sends |
| 1.6.5 | Signal Integrity Monitor — k-anonymity enforcement in M8/M12/M13 | k=5 private cross-org; k=10 aggregate; k=20 public |
| 1.6.6 | US data residency confirmed on Convex + Stripe | Documented in Subprocessor list; EU residency flagged as 2027 |

### 1.7 Metrics & Dashboards

| # | Item | Acceptance |
|---|---|---|
| 1.7.1 | Founder Dashboard (Notion + PostHog embeds) — 14 leading indicators | All 14 metrics (Sales Playbook §1.4) rendering daily |
| 1.7.2 | Five North Star counters pinned | Active evaluations · Forced-Signup conversion · AI budget consumption · Seller KB entries created · MRR |
| 1.7.3 | PQL scoring thresholds documented and tunable | ≥50 Qualified, ≥100 Hot, ≥150 Enterprise |
| 1.7.4 | Financial ledger — Stripe → Google Sheet reconciliation weekly | Revenue + AI COGS visible per customer |

### 1.8 Launch Readiness Gate

Go/no-go review on **T-2 (Thu 2026-05-14)** at 17:00 ET. Red/yellow on **any** item in 1.1/1.2/1.3/1.4 = no-go. Red on 1.5/1.6/1.7 = patch and proceed. A no-go pushes launch to **2026-05-25** (one week). No other push dates are approved in advance.

---

## SECTION 2 — PRE-LAUNCH SPRINT (WEEKS -4 TO 0)

Weeks are Monday-to-Friday. Today = Monday 2026-04-20 = **Week -4**. Launch Day = Monday 2026-05-18 = **Week 1, Day 1**.

### Week -4 (Apr 20–24) — Product Lockdown and Content Foundation

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Freeze Buyer Console feature surface. Exit-criteria test on Phases 1–12 end-to-end using dogfood eval (5 vendors, SIEM category) | 8 | Buyer | 1.1.4 |
| Product | Seller Hero Moment dogfood — invite 5 test vendors, measure p50 time-to-response, iterate copy | 6 | Seller | 1.2.1 |
| Product | Ghost-Bid Importer (M15) dogfood — import 3 historical RFPs, target ≥40 entries/import | 4 | Seller | M15 |
| Content | Draft Post 1 — *The Sourcera Method* cornerstone, Sections 1–6 (first half of 10K words) | 5 | Cross | §2.4 Content Engine |
| Content | LinkedIn profile rework — headline, About, Featured, banner. Post first founder-journal *"I'm building the operating system for enterprise software procurement"* | 1 | Cross | §3 Content Engine |
| Marketing | Framer marketing site — Home + /pricing buyer + /pricing seller built; /method stub; /for-buyers + /for-sellers stubs | 6 | Cross | 1.5.1 |
| Infra | WorkOS tenant setup; Convex deployment; Stripe SKU provisioning (all 20 SKUs) | 6 | Cross | 1.4.1–1.4.3 |
| Sales ops | Attio CRM setup — 4 pipelines, custom fields for PQL scoring, domain imports for 500 buyer ICP and 500 seller ICP accounts | 5 | Cross | 1.5.7 |
| Sales ops | Instantly.ai — register `sourcera.io`, set up 3 inboxes, begin 14-day warmup | 2 | Cross | 1.5.8 |
| Ops | Legal review: MSA, Order Form, DPA; outside counsel 60-min retainer call | 2 | Cross | 1.6.1 |
| Float | Contingency | 5 | — | — |
| **Total** | | **50** | | |

Checkpoint: by Friday EOD, the Buyer Console walkthrough runs end-to-end, Seller Hero Moment completes in <25 min, Ghost-Bid Importer produces a KB seed on a real historical RFP, the marketing site has 5 pages standing up, Instantly inboxes are warming, and the Method cornerstone is 50% drafted.

### Week -3 (Apr 27–May 1) — Content, Loops Lifecycle, Dogfood Cohort

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Content | Post 1 — complete Sections 7–13 + on-page SEO (title, meta, URL=`/method`, internal links, `HowTo`+`Article` schema). Publish preview to Framer | 6 | Cross | §2.4 Content Engine |
| Content | Asset 1 — package Method as 70-page PDF + DOCX/GDoc of the 8 templates; Canva cover art | 8 | Cross | §5.1 Content Engine |
| Content | Draft Post 2 (*The 13 Phases of a Defensible Software Evaluation*) fully; Post 3 (*FM/PM/EJ Scoring*) outlined | 4 | Buyer | Posts 2, 3 |
| Content | LinkedIn posts #1, #2 from Section 3.2 catalog — "Every vendor evaluation produces one honest artifact" (Post 1) and "I uploaded NIST 800-53 to Sourcera…" (Post 2 teardown) | 1.5 | Buyer | Content Engine §3.2 |
| Product | Convex perf — 50 RPS load test against Console, fix top-3 p95 regressions | 6 | Cross | 1.4.2 |
| Product | Loops.so — wire 8 lifecycle event hooks to PostHog; test all 8 drips to dummy account | 5 | Cross | 1.4.4, §4.4 Content Engine |
| Product | Buyer AI Budget Meter polish + 80% warning email (Loops event `buyer_ai_budget_80pct`) | 3 | Buyer | 1.1.8 |
| Dogfood | Recruit 8 design-partner buyers from network; onboard 3 into Free + guided Pre-Scoring on real evals | 5 | Buyer | Design-partner cohort |
| Dogfood | Recruit 10 friendly sellers (LinkedIn warm network, PreSales Collective); 5 go through Forced-Signup simulation via M1, 5 via Organic path | 4 | Seller | M1, Organic |
| Sales ops | Write cold-email Sequence A (Priya) — 4 emails — tuned for 2026-05 send; schedule through Instantly starting T+0 | 1.5 | Buyer | Sales Playbook §2.1.2 |
| Sales ops | Write cold-email Sequence C (Seller Organic) — RFP-response-efficiency angle — 4 emails | 1.5 | Seller | Sales Playbook §3 |
| Sales ops | Attio — enrich 500 buyer ICP accounts via Clay; de-dup against LinkedIn pre-existing connections | 2 | Buyer | 1.5.7 |
| Float | Contingency | 2.5 | — | — |
| **Total** | | **50** | | |

Checkpoint: Method cornerstone published as preview-only (behind gate); Asset 1 in QA; Loops lifecycle verified end-to-end; 3 dogfood buyers actively in Free; 10 sellers with bootstrapped KBs; Instantly warmup 50% complete; cold sequences written and scheduled.

### Week -2 (May 4–8) — Dogfood Feedback Loop, Readiness Gate Prep

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Triage dogfood feedback — ship top-5 blocker fixes (buyer) and top-5 (seller) | 10 | Cross | 1.1/1.2 |
| Product | Selection Report PDF + DOCX export polish; SHA-256 chain audit; run on 3 dogfood evals | 3 | Buyer | §6.37, 1.1.7 |
| Product | KB 50-entry cap enforcement; conversion-moment event `seller_kb_50_cap_hit` wired to Loops | 2 | Seller | PLG §4.2 |
| Product | Pro Trial Seat (M17) provisioning for Scale — test flow: Scale buyer invites seller, seller claims Pro Trial | 3 | Cross | M17 |
| Content | Draft Post 3 (*Why Your Vendor Scoring Matrix Is Lying to You*) complete | 3 | Buyer | Post 3 |
| Content | Draft Newsletter Issue 1 ("Announcing *The Evaluation*" + Method preview, 1,100 words) | 2 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts #7 ("G2 vs. Gartner vs. your actual procurement process" carousel, 6 slides) + #11 ("Your RFP response takes 2 days") | 1.5 | Cross | §3.2 Content Engine |
| Content | Asset 2 prep — draft category evaluation templates for **Security/GRC** and **Data/Analytics** (2 of 6 seed categories) | 4 | Buyer | §5.1 Asset 2 |
| Marketing | /for-buyers and /for-sellers pages complete with persona-specific copy from GTM_POSITIONING §5 | 3 | Cross | 1.5.1 |
| Marketing | Status page + legal pages live; DSAR workflow filed in `/ops/dsar.md` | 2 | Cross | 1.4.7, 1.6.1–1.6.3 |
| Sales ops | Persona cadences: Sequence B (Marcus VP IT), Sequence D (Elena CISO) drafted and loaded into Instantly | 2 | Buyer | Sales Playbook §2.1.2 |
| Sales ops | Write seller magic-link invite email copy + second-invite follow-up (for sellers who land, don't engage) | 1.5 | Seller | §3.6 Master Summary |
| Sales ops | Partner outreach — 3 warm intros: Pavilion procurement channel, PreSales Collective RFP community, ProcurementFoundation Slack admin (no launch pitch, relationship-only) | 2 | Cross | §4 Sales Playbook |
| Demo | Record 4 Loom walkthroughs — 2 buyer (2-min teaser + 8-min full), 2 seller (2-min Hero Moment + 8-min Bid Workspace) | 3 | Cross | 1.5.10 |
| Metrics | Founder Dashboard Notion page + PostHog embeds for all 14 leading indicators + 5 North Stars | 4 | Cross | 1.7.1, 1.7.2 |
| Float | Contingency | 4 | — | — |
| **Total** | | **50** | | |

Checkpoint: readiness checklist items 1.1.*, 1.2.*, 1.3.*, 1.4.* at ≥90% green; all Week -2 copy and creative locked; dogfood cohort NPS ≥7 or the blockers are identified and sized for Week -1.

### Week -1 (May 11–15) — Rehearsal, Press-Time, Soft-Opening

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Final bug-bash — personal 4-hr run-through of buyer + seller paths + all 8 Loops drips; fix P1s only | 8 | Cross | — |
| Product | Staging → production cutover rehearsal (dry run); DNS cutover plan documented | 3 | Cross | 1.4 |
| Product | Ghost-Bid Importer — add one additional paste-mode improvement surfaced from dogfood | 2 | Seller | M15 |
| Product | M8 Org Intelligence guardrail — verify 8th-eval disable warning renders for cross-org signals | 1 | Buyer | M8 |
| Content | Post 1 — flip to `/method` live URL (soft, no broadcast); internal link pass across posts 1, 2, 3 | 2 | Cross | §2.4 Content Engine |
| Content | Post 2 and Post 3 scheduled for W2 and W3 publication respectively | 1 | Cross | Posts 2, 3 |
| Content | Newsletter Issue 1 scheduled for Monday 2026-05-18 07:00 ET | 1 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts #9 (founder journal — *"I'm building Sourcera. Here's where we lost a deal last week"*) — anonymized dogfood loss | 1 | Cross | §3.2 Content Engine |
| Content | Asset 1 download page + gate (ConvertKit/Loops form); landing-page copy in Framer | 2 | Cross | §5.1 Content Engine |
| Marketing | Launch assets for Product Hunt, Hacker News "Show HN", LinkedIn pinned post, Twitter/X thread; Substack launch issue teased for Sunday 2026-05-17 | 3 | Cross | — |
| Sales ops | Pre-launch "friends & family" outreach — 30 warm intros via LinkedIn DM, linking to the Method preview and asking for 15 min intro feedback (no pitch) | 3 | Buyer | — |
| Sales ops | Seller warm-intro list — 20 PreSales Collective connections; DM the Asset 1 Method link and Seller angle ("the RFP Response OS") | 2 | Seller | Post 10 |
| Sales ops | Cold-email Sequence A (Priya) pre-warm — 40 sends from Instantly Tuesday/Wednesday before launch | 1 | Buyer | Sales Playbook §2.1.2 |
| Demo | Two live rehearsal demos — one buyer, one seller — with friendly advisor as critic | 2 | Cross | Sales Playbook §5, §6 |
| Metrics | Weekly review: which of 14 leading indicators can be read from dogfood data? Establish baselines | 2 | Cross | 1.7.1 |
| Readiness | **T-2 go/no-go review Thursday 17:00 ET** — 90 min | 1.5 | Cross | 1.8 |
| Readiness | Contingency re-plan if no-go (rebudget following week; no pivot outside this list) | — | — | — |
| Press/PR | 5 targeted journalist/analyst intros (Spend Matters editor, Pavilion, ProcurementFoundation, SaaStr, Lenny) with Method PDF attached — pre-embargo | 3 | Cross | §6.2 Content Engine |
| Community | Pavilion #procurement intro post (not promotional; contribution to an active thread) | 1 | Buyer | §3.4 Content Engine |
| Community | PreSales Collective intro post — KB governance take | 1 | Seller | §3.4 Content Engine |
| Float | Contingency | 10.5 | — | — |
| **Total** | | **50** | | |

Checkpoint: production cutover rehearsal clean, go/no-go = green, Newsletter Issue 1 locked for 07:00 Monday, Post 1 live at `/method`, Asset 1 download gated, Instantly pre-warm confirms deliverability ≥95%, 50 warm intros worked in the prior fortnight.

---

## SECTION 3 — LAUNCH WEEK (Week 1: May 18–22)

Launch day is Monday 2026-05-18. The launch is not a single moment — it is a structured 5-day pulse. Everything is pre-written. The founder does not compose live copy during launch week.

### Launch Week Schedule

| Day | Time (ET) | Action | Channel | Hours |
|---|---|---|---|---|
| **Mon 05-18** | 07:00 | Newsletter Issue 1 — *"Announcing The Evaluation"* + Method cornerstone preview | Substack + LinkedIn Newsletter | Pre-scheduled |
| Mon | 08:00 | LinkedIn pinned post — *"Today I launched Sourcera. This is the operating system for enterprise software procurement."* | LinkedIn founder profile | 0.5 |
| Mon | 08:30 | Announcement in Pavilion, PreSales Collective, ProcurementFoundation, CISO Series (one thoughtful post per community, non-identical copy) | Slack × 4 | 1 |
| Mon | 09:00 | Product Hunt launch — pinned + Slack DM 50 warm supporters to upvote | Product Hunt | 1.5 |
| Mon | 09:30 | Show HN post — *"Sourcera: The operating system for enterprise software procurement"* | Hacker News | 0.5 |
| Mon | 10:00 | First founder demo slot (Priya lookalike from warm list) | Zoom | 1 |
| Mon | 11:30 | Second demo (seller — Leo persona, organic seller signup from W-1 community post) | Zoom | 1 |
| Mon | 13:00 | Twitter/X thread — *"We're building the category after the spreadsheet"* | X | 0.5 |
| Mon | 14:00 | Instantly — buyer Sequence A Email 1 first batch (100 Priyas from warm ICP) | Instantly | 0.5 |
| Mon | 15:00 | Inbound triage — respond to every PH comment, every LinkedIn reply, every demo-request email | Multiple | 2 |
| Mon | 17:00 | Post-Day-1 review — metrics pull, Attio hygiene, top-3 learnings logged | Notion | 1 |
| **Tue 05-19** | 08:00 | LinkedIn post #2 — *"I uploaded NIST 800-53 Rev 5 to Sourcera. 157 controls became 84 de-duplicated, scorable requirements."* (teardown, 600 words + screenshot) | LinkedIn | 0.75 |
| Tue | 09:00 | Cold email send — Buyer Sequence A Email 1 next 100 Priyas; Seller Sequence C Email 1 to 100 RFP-manager targets | Instantly | 0.5 |
| Tue AM | 10:00–12:00 | **Tuesday content block** — draft Newsletter Issue 2 + begin Post 2 publish prep | Focused writing | 2 |
| Tue | 13:00 | Demo slot — buyer (Marcus lookalike) | Zoom | 1 |
| Tue | 14:30 | Demo slot — seller (Rachel RevOps persona) | Zoom | 1 |
| Tue | 16:00 | Guest-essay pitch — Spend Matters editor-in-chief (Method excerpt angle) | Email | 0.5 |
| Tue | 17:00 | CRM sweep — close-out all Day-1 PQL ≥ 50 signups with personalized intro | Attio + Gmail | 1.5 |
| **Wed 05-20** | 08:00 | LinkedIn post #11 — *"Your RFP response takes 2 days. The buyer's deadline is 72 hours."* | LinkedIn | 0.75 |
| Wed | 09:00 | Engagement block — comment on 15 targeted posts (Priya/Marcus/Elena/Sam) | LinkedIn | 1 |
| Wed | 10:00 | Cold email Sequence A Email 2 (100 Priyas from Mon batch) + Seller Sequence C Email 2 | Instantly | 0.5 |
| Wed | 11:00 | Metrics review (scheduled weekly block) — 14 leading indicators + 5 North Stars for Days 1–3; identify top-3 surprises | Notion | 1 |
| Wed | 13:00 | Demo × 2 (buyer + seller) | Zoom | 2 |
| Wed | 16:00 | Podcast pitch round 1 — *Art of Procurement*, *Sourcing Hero*, *PreSales Collective Podcast* (3 pitches) | Email | 1 |
| Wed | 17:00 | P1 bug triage + Sentry review — ship 1–2 hot patches only | Engineering | 1.5 |
| **Thu 05-21** | 08:00 | LinkedIn post #12 — *"The RFP response OS — 8 pieces of a KB that compounds"* (carousel, 8 slides) | LinkedIn | 1 |
| Thu | 09:00 | Win/loss debrief (§1.2 Sales Playbook) — any deal closed or stalled in Days 1–3 gets a 1-page writeup | Notion `/ops/wl/` | 1 |
| Thu | 10:00 | Demo × 2 | Zoom | 2 |
| Thu AM | 12:00 | Post 2 publishes — *"The 13 Phases of a Defensible Software Evaluation"* | Framer blog | 0.5 (pre-written) |
| Thu | 13:00 | LinkedIn amplification of Post 2 — excerpted quote post + PDF carousel | LinkedIn | 0.75 |
| Thu | 15:00 | Second-invite seller outreach — any seller who arrived via M1 on Mon/Tue but did not bootstrap KB → personal founder email | Gmail | 1.5 |
| Thu | 17:00 | CRM hygiene + tomorrow prep | Attio | 1 |
| **Fri 05-22** | 08:00 | LinkedIn post #9 — *"I launched Sourcera five days ago. Here's what I got right and what I got wrong."* (founder journal, build-in-public) | LinkedIn | 1 |
| Fri | 09:00 | Community presence — one substantive reply in each of Pavilion, PreSales Collective, CISO Series, RevGenius | Slack × 4 | 1 |
| Fri | 10:00 | ICP drift review — Fri-afternoon per Sales Playbook §1.2; which signups fit ICP, which don't, log drift | Notion | 1 |
| Fri | 11:00 | Demo slot | Zoom | 1 |
| Fri | 13:00 | Week-1 retrospective — what the metrics show vs. Sprint plan targets; which of the 3 top learnings change next week's plan | Notion | 1.5 |
| Fri | 15:00 | Stripe reconciliation + P&L sanity check — any paying customer? | Google Sheet | 0.5 |
| Fri | 17:00 | Hand-write 5 thank-you notes to the 5 most helpful supporters of launch week (LinkedIn DMs or emails) | Manual | 0.5 |
| | Float across week | Inbound overflow, demo overflow, P1 patches | — | 8 |
| **Week total** | | | | **50** |

### Launch Week Success Criteria (Tracked Daily)

| Metric | Day 1 target | Day 5 target |
|---|---|---|
| Buyer Free signups | 20 | 80 |
| Forced-Signup sellers (M1-triggered from any dogfood eval carryover + launch-day trial evals) | 3 | 15 |
| Organic seller signups | 2 | 12 |
| Hero Moment p50 (magic-link → first submitted response) | <22 min | <20 min |
| Active evaluations | 5 | 20 |
| Selection Report generated | 0 | 1 |
| Demo bookings (combined) | 3 | 12 |
| Newsletter subscribers | 120 | 220 |
| Asset 1 (Method + Templates) downloads | 25 | 150 |
| LinkedIn followers | +50 | +300 |

Day-5 shortfalls > 30% on any target trigger a Week-2 plan revision (Section 4, Week 2 contingency path).

### Crisis Contingencies (Launch Week Only)

| Trigger | Response | Within |
|---|---|---|
| WorkOS or Convex outage during business hours | Status page red; Loom apology video sent to all signups in-flight | 30 min |
| Stripe billing misfire (duplicate charge, failed plan change) | Manual refund + founder-apology email; Stripe incident logged | 2 hrs |
| Selection Report generation producing invalid SHA | Disable Phase-12 export; banner in Console; hot patch | 4 hrs |
| Negative security disclosure on HN or social | Coordinate response from `/ops/security-incident.md`; no improvisation | 4 hrs |
| Seller-side spam complaint (vendor alleges unsolicited invite) | Add to Vendor Opt-Out Registry immediately; founder-written apology; review M1 invite chain for compliance | 24 hrs |

---

## SECTION 4 — POST-LAUNCH MONTH 1 (Weeks 2–5: May 25–June 19)

The Month-1 thesis is **stabilize, instrument, and expand the content surface**. The product is new and fragile; the audience is small; the PQL model is unvalidated. Month 1 does not try to scale; it tries to learn. Every week alternates deeper-learning on one side with surface-expansion on the other.

### Week 2 (May 25–29) — Instrumentation Week

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | PQL model calibration — re-weight the seven signal components from real Week-1 data (signup velocity, Aha-Moment fire rate, AI budget consumption, vendor invite count, Policy Upload, Selection Report generation, Pro Trial claim) | 6 | Buyer | PLG §7 |
| Product | Seller PQL model calibration — weight components (Hero Moment completion, Ghost-Bid Importer usage, second-invite arrival, EOI attempt, KB entry velocity) | 4 | Seller | PLG §7 |
| Product | Bug fixes — top-10 P2 items from Launch Week triage; ship daily | 8 | Cross | — |
| Content | Post 3 publishes — *"Why Your Vendor Scoring Matrix Is Lying to You (FM/PM/EJ)"* | 0.5 | Buyer | Post 3 |
| Content | Newsletter Issue 2 — Method Chapter 1 (the 13 phases), 1,100 words | 2 | Buyer | §4.2 Content Engine |
| Content | LinkedIn posts — #3 (scoring carousel, 7 slides), #7 (G2/Gartner/process carousel), #10 (SOC 2 audit findings) | 2 | Cross | §3.2 Content Engine |
| Content | Asset 2 — ship **Security/GRC** and **Data/Analytics** evaluation templates (2 of 6 seed categories) via same gated-download pattern | 4 | Buyer | §5.1 Asset 2 |
| Sales (buyer) | Daily PQL triage — first-touch every buyer PQL ≥50 within 24h; deeper touch on ≥100 same day | 6 | Buyer | Sales Playbook §1.2 |
| Sales (buyer) | Demo week — target 5 buyer demos | 5 | Buyer | Sales Playbook §5 |
| Sales (seller) | Second-invite outreach — every seller PQL ≥50 that arrived W1; founder-written 3-line email referencing their specific bid | 3 | Seller | §3.6 Master Summary |
| Sales (seller) | Target 3 seller demos (Growth tier candidates — ≥3 concurrent bids already) | 3 | Seller | Sales Playbook §6 |
| Ops | Stripe reconciliation; CRM hygiene; Win/Loss debrief for stalled Week-1 deals | 2 | Cross | Sales Playbook §1.2 |
| Metrics | Weekly review — 14 indicators; publish internal Weekly Memo to advisor list | 1.5 | Cross | 1.7.1 |
| Float | Contingency | 3 | — | — |
| **Total** | | **50** | | |

### Week 3 (June 1–5) — Seller Depth Week

Week 3 focuses heavier founder time on the seller side because (a) the Seller Hero Moment is the most fragile launch asset, (b) Forced-Signup seller conversion is the dominant North Star, and (c) seller-side PQL data is richer 2 weeks after launch than buyer-side.

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Ghost-Bid Importer (M15) iteration — incorporate Week-1/2 seller feedback; target 95th-percentile entry quality | 5 | Seller | M15 |
| Product | KB Health Score (§6.13.4) surfacing on Seller dashboard — Loops drip when Score declines | 3 | Seller | §6.13.4 |
| Product | Seller Bid Workspace — cite-before-state enforcement; any AI-generated claim without citation is flagged | 4 | Seller | §6.14.2 |
| Content | Draft Post 10 — *"The RFP Response OS: How a Compounding KB Beats a Content Library"* (seller cornerstone, P3 pillar, 3,500 words) | 5 | Seller | Post 10 |
| Content | Newsletter Issue 3 — Scoring as the core IP (Method Chapter 4) | 2 | Buyer | §4.2 Content Engine |
| Content | LinkedIn posts — #12 (KB 8-piece carousel), #14 (proposal-manager single-point-of-failure), #13 (Ghost-Bid teardown) | 2 | Seller | §3.2 Content Engine |
| Content | Asset 5 draft — RFP Response Reuse Rate Calculator (seller-side flagship, logic + React page) | 6 | Seller | §5.1 Asset 5 |
| Sales (buyer) | Daily PQL triage + 4 demos + cold outbound Sequence A Email 3 (rolling cohort) | 12 | Buyer | Sales Playbook §2 |
| Sales (seller) | 5 seller demos; second-invite outreach; PreSales Collective monthly teaching post — "Why KB governance beats content libraries" | 5 | Seller | §3.4 Content Engine |
| Ops | Weekly review; Win/loss; ICP drift | 2 | Cross | Sales Playbook §1.2 |
| Partner | Intro call with Pavilion procurement channel lead — offer *Evaluation* newsletter swap + monthly AMA | 1 | Cross | §4.3 Content Engine |
| Float | Contingency | 3 | — | — |
| **Total** | | **50** | | |

### Week 4 (June 8–12) — First Upgrade Wave, Buyer Cohort Depth

The 3-week post-launch window is when buyer Free-to-Starter conversion first materializes. Focus founder attention on the in-product upgrade nudge (PLG §4.1 nudges 1–5) and the conversion-trigger emails.

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Free-to-Starter upgrade surface — 5 in-product nudges (PLG §4.1) polished: AI budget 80%, concurrent-eval attempt, vendor invite beyond Free cap, Policy Upload beyond Free limit, Enterprise-feature preview | 5 | Buyer | PLG §4.1 |
| Product | Selection Report Public Link (M2) — publish-opt-in flow; watermark + `no-index` metatag; counter metric | 3 | Buyer | M2 |
| Product | Seller Kick-Off-Next-Evaluation-analog — seller-side "Save Bid as Template" feature (M4 analog) | 2 | Seller | M4 adaptation |
| Content | Post 4 publishes — *"The Selection Memo Your Auditor Actually Asks For"* | 0.5 | Buyer | Post 4 |
| Content | Newsletter Issue 4 — Audit-defensibility essay (P2 pillar) | 2 | Buyer | §4.2 Content Engine |
| Content | LinkedIn posts — #5 (annotated Selection Memo teardown), #4 (seat-tax argument), #17 (proposal-manager SPOF) | 2 | Cross | §3.2 Content Engine |
| Content | Post 10 publishes Thursday — *"The RFP Response OS"* (seller cornerstone) | 0.5 | Seller | Post 10 |
| Content | Asset 5 ship — RFP Response Reuse Rate Calculator live + gated report + nurture drip | 4 | Seller | §5.1 Asset 5 |
| Content | Guest essay pitch round 2 — Dark Reading (compliance-to-requirement angle), SaaStr (unlimited-seats decision angle) | 2 | Cross | §6.2 Content Engine |
| Sales (buyer) | 6 buyer demos; Starter upgrade conversations for each PQL ≥100 in the cohort | 10 | Buyer | Sales Playbook §5 |
| Sales (buyer) | Cold outbound — Sequence B (Marcus) launch; Sequence D (Elena) launch; 3 inboxes rotating | 2 | Buyer | Sales Playbook §2 |
| Sales (seller) | 4 seller demos; post-second-concurrent-bid outreach (conversion moment #1) | 4 | Seller | PLG §4.2 |
| Sales (seller) | Responsive/Loopio direct outbound — 20 targeted reach-outs per Sales Playbook §3 outbound list | 2 | Seller | Sales Playbook §3 |
| Ops | Weekly review; Win/loss; Stripe reconciliation; first revenue recognition run | 2 | Cross | — |
| Podcast | First recorded appearance — *PreSales Collective Podcast* (booked from W-1 pitch) | 2 | Seller | §6.3 Content Engine |
| Float | Contingency | 3 | — | — |
| **Total** | | **50** | | |

### Week 5 (June 15–19) — LinkedIn Newsletter Launch, Partner Activation

By Week 5 the founder's LinkedIn followers should cross 500 (targets: W1 +300, W2–W5 +200/wk = 1,100 total). At 500+ relevant followers, LinkedIn Newsletter is high-leverage.

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Content | LinkedIn Newsletter *The Evaluation* launches — Issue 1 mirror + founder-journal framing | 1 | Cross | §3.5 Content Engine |
| Content | Post 5 publishes — *"Uploading NIST 800-53 Once: How Policy-to-Requirement Generation Saves 40 Hours"* (CISO conversion post) | 0.5 | Buyer | Post 5 |
| Content | Newsletter Issue 5 — Policy-to-Requirement essay | 2 | Buyer | §4.2 Content Engine |
| Content | LinkedIn posts — #2 (NIST teardown deeper cut), #18 (Apollo vs. Sourcera seller angle), #6 (scoring variance 0.3 pt) | 2 | Cross | §3.2 Content Engine |
| Content | Asset 2 expansion — ship 2 more seed-category templates (DevOps and RevOps); 4 of 6 done | 4 | Buyer | §5.1 Asset 2 |
| Partner | Newsletter swap execution — feature ProcurementFoundation in Issue 5; they feature *The Evaluation* in their weekly | 1 | Cross | §4.3 Content Engine |
| Partner | Pavilion monthly AMA scheduled for Week 6; prep FAQ | 1 | Cross | §6.4 Content Engine |
| Sales (buyer) | 6 demos; 2 Growth upgrade conversations (month-3 upgrade target) | 10 | Buyer | Sales Playbook §5 |
| Sales (buyer) | Cold outbound volume now at steady-state 120 sends/day across 3 inboxes | 3 | Buyer | Sales Playbook §2 |
| Sales (seller) | 5 demos; EOI-attempt outreach (conversion moment #2) on any seller whose EOI click was blocked | 5 | Seller | PLG §4.2 |
| Sales (seller) | Seller Starter upgrade debrief — why the first 3–5 seller Starters converted; what the 10 non-converters had in common | 2 | Seller | Sales Playbook §6 |
| Product | Bug fixes + Sentry triage weekly | 5 | Cross | — |
| Product | M6 groundwork — domain-based auto-join scaffolding (ships Month 2) | 3 | Cross | M6 |
| Ops | Month-1 retrospective — publish internal memo | 2 | Cross | — |
| Metrics | Monthly review — 14 indicators, 5 North Stars, Gate 1 decision prep | 2 | Cross | 1.7.1, Section 9 |
| Float | Contingency | 1.5 | — | — |
| **Total** | | **50** | | |

### Month 1 Targets (Cumulative)

| Metric | Target | Source |
|---|---|---|
| Buyer Free signups | 60 | Sales Playbook §1.4 Months 1–3: 40/mo |
| Seller signups (combined Forced + Organic) | 120 | Same §1.4: 60/mo |
| Hero Moment p50 | ≤20 min | §14.2 Seller Pricing |
| Active evaluations | 30 | 5 North Stars |
| Selection Reports generated | 6 | — |
| Buyer paid conversions | 1–3 | Sales Playbook §1.4: 1/mo baseline |
| Seller paid conversions | 1–3 | Sales Playbook §1.4: 1/mo baseline |
| Newsletter subscribers | 700 | §4.5 Content Engine Month-1 target 200 × updated trajectory |
| LinkedIn followers | 1,100 | — |
| Blog posts live | 5 (Posts 1, 2, 3, 4, 5) | §7.3 Content Engine |
| Gated assets live | 3 (Asset 1, 2 partial, 5) | §5.1 Content Engine |
| MRR | $1,200–$3,600 | Sales Playbook §1.4 |

---

## SECTION 5 — POST-LAUNCH MONTH 2 (Weeks 6–9: June 22–July 17)

The Month-2 thesis is **expand the M-number set and activate programmatic SEO**. Month 2 ships M3, M6, M7, M9, M10, and M16 (GTM_PLG_ARCHITECTURE §5.9 "Month 2" set). Content production scales from 1 to 2 long-form posts per month at steady cadence. The first M9 category pages (Security/GRC, Data/Analytics) go live.

### Week 6 (June 22–26) — M3 Certificate Badge + First M9 Category Pages

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | M3 Evaluation Certificate Badge — shippable badge on Selection Record + embed code | 4 | Buyer | M3 |
| Product | M9 Category Page scaffolding — Framer template + Schema.org `CollectionPage` + Convex data feed from published Seller Profiles | 6 | Cross | M9 |
| Product | First 2 M9 category pages live — Security/GRC, Data/Analytics (matches Asset 2 ship order) | 3 | Cross | M9, §1.3.1 Positioning |
| Content | Post 6 publishes — *"TCO Modeling for SaaS: Why Most Break in Year 2"* | 0.5 | Buyer | Post 6 |
| Content | Post 11 drafted — *"Your SOC 2 Response Should Not Take a Week: The Cite-Before-State Rule"* (seller, P3) | 3 | Seller | Post 11 |
| Content | Newsletter Issue 6 — *The RFP Response OS* reprise | 2 | Seller | §4.2 Content Engine |
| Content | LinkedIn posts — #11 (KB carousel), #16 (Hero Moment journal), #19 (KB 47→183 teardown) | 2 | Seller | §3.2 Content Engine |
| Partner | Pavilion monthly AMA — live, 60 min | 1 | Buyer | §6.4 Content Engine |
| Sales (buyer) | 7 demos; 2 Growth upgrade conversations; 1 Scale conversation if any PQL ≥150 | 12 | Buyer | Sales Playbook §5 |
| Sales (seller) | 5 demos; second-invite outreach on Week-4/5 cohort | 5 | Seller | Sales Playbook §6 |
| Sales | Cold outbound steady-state; new seller Sequence (Growth/Scale tier — 20 target accounts/wk with ≥100 employees in Presales-heavy industries) | 3 | Seller | Sales Playbook §3 |
| Ops | Weekly review; Win/loss | 1.5 | Cross | — |
| Podcast | Second podcast recording — *Art of Procurement* (pitched W-1, booked W4) | 2 | Cross | §6.3 Content Engine |
| Float | Contingency | 5 | — | — |
| **Total** | | **50** | | |

### Week 7 (June 29–July 3) — M10 Guides + M16 Referral Credit

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | M10 How-to-Evaluate Guide scaffolding — Framer template + Convex data path | 4 | Cross | M10 |
| Product | First 2 M10 guides live — *"How to Evaluate SIEM"* + *"How to Evaluate CDP"* (match Post 8/9 publish trajectory) | 3 | Cross | M10, Posts 8, 9 |
| Product | M16 Referral Credit mechanic — $200 referrer + $200 referee credit on Starter+; surfaced in-product + Loops nurture trigger | 4 | Cross | M16 |
| Product | M6 Domain-Based Auto-Join ship — when user with email `@acme.com` signs up and Acme Workspace exists, present join-request flow | 4 | Cross | M6 |
| Content | Post 11 publishes — *"Your SOC 2 Response Should Not Take a Week"* | 0.5 | Seller | Post 11 |
| Content | Newsletter Issue 7 — *"The $5 AI budget as a product decision"* (pricing narrative) | 2 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts — #4 (seat-tax argument), #20 (Sourcera Method as published IP), #15 (FM/PM/EJ carousel) | 2 | Cross | §3.2 Content Engine |
| Content | Asset 2 — ship remaining 2 seed-category templates (HRIS, AI Infrastructure); all 6 of 6 done | 4 | Buyer | §5.1 Asset 2 |
| Sales (buyer) | 7 demos; Scale negotiation (first Scale candidate by end of Month 2) | 12 | Buyer | Sales Playbook §5 |
| Sales (seller) | 5 demos; Starter → Growth upgrade conversations on sellers completing their 3rd concurrent bid | 5 | Seller | Sales Playbook §6 |
| Ops | Weekly review; Stripe; ICP drift | 2 | Cross | — |
| Float | Contingency | 2.5 | — | — |
| **Total** | | **50** | | |

### Week 8 (July 6–10) — M7 Suggested Team Discovery + First Enterprise Conversation

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | M7 Suggested Team Discovery — in-product "Invite colleague" suggestions from domain graph | 4 | Cross | M7 |
| Product | Enterprise gate polish (§2.6 Master Summary) — SSO requirement, DPA, custom integration trigger → founder-routed workflow | 3 | Cross | §2.6 Master Summary |
| Product | 4 more M9 category pages live — DevOps, RevOps, HRIS, AI Infra (6 of 6 seed categories on M9) | 4 | Cross | M9 |
| Content | Post 8 publishes — *"How to Evaluate SIEM in 2026"* | 0.5 | Buyer | Post 8 |
| Content | Newsletter Issue 8 — *"The Hero Moment"* (seller-deep issue) | 2 | Seller | §4.2 Content Engine |
| Content | LinkedIn posts — #16 (Hero Moment narrative), #12 (RFP OS carousel encore), #8 (40-hour healthcare-buyer journal) | 2 | Cross | §3.2 Content Engine |
| Content | Guest essay #1 ships — Spend Matters — *"A New Category: Software Evaluation Platform"* | 2 | Cross | §6.2 Content Engine |
| Sales (buyer) | 8 demos — larger cohort from M9/M10 SEO-sourced traffic hitting homepage | 12 | Buyer | Sales Playbook §5 |
| Sales (buyer) | First Enterprise pitch — SOC 2 + DPA + ≥$12K committed AI gate all met; 90-min structured demo + proposal | 3 | Buyer | Sales Playbook §8 |
| Sales (seller) | 5 demos; EOI-attempt outreach on Starter sellers whose EOI click was blocked in prior 14 days | 5 | Seller | PLG §4.2 |
| Sales | Cold outbound SEQUENCE expansion — add Sequence E (Dan CFO) for Scale candidates | 2 | Buyer | Sales Playbook §2 |
| Ops | Weekly review; Win/loss; refresh PQL thresholds | 2 | Cross | — |
| Partner | PreSales Collective monthly AMA — 60 min | 1 | Seller | §6.4 Content Engine |
| Float | Contingency | 1.5 | — | — |
| **Total** | | **50** | | |

### Week 9 (July 13–17) — Month 2 Closeout, First Enterprise Close or Walk

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Asset 4 TCO Calculator (Section §5.1 Asset 4) live as standalone `/tools/tco` | 5 | Buyer | §5.1 Asset 4 |
| Product | Pre-Scoring Report shareable via M2 pattern — public link supported | 2 | Buyer | M2 extension |
| Product | KB Bootstrap Health Monitor — seller-facing score + weekly email digest | 3 | Seller | §6.13.4 |
| Content | Post 9 publishes — *"How to Evaluate CDP in 2026"* | 0.5 | Buyer | Post 9 |
| Content | Newsletter Issue 9 — *"Founder Journal — First 100 Customers"* | 2 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts — #1 (honest-artifact reprise), #20 (flywheel math post), #17 (SPOF RFP manager) | 2 | Cross | §3.2 Content Engine |
| Content | Asset 6 planning — Procurement Readiness Self-Assessment content outlined | 3 | Buyer | §5.1 Asset 6 |
| Sales (buyer) | Close or walk Enterprise conversation from W8; if close — onboarding sprint immediately | 8 | Buyer | Sales Playbook §8 |
| Sales (buyer) | 6 demos; Growth upgrades | 8 | Buyer | — |
| Sales (seller) | 5 demos; Growth-tier seller upgrade push on any seller with ≥5 active bids | 5 | Seller | — |
| Ops | Month-2 retrospective + Gate 2 decision prep | 3 | Cross | Section 9 |
| Metrics | Monthly review | 2 | Cross | — |
| Podcast | Third appearance — *Sourcing Hero* | 2 | Cross | §6.3 Content Engine |
| Float | Contingency | 4.5 | — | — |
| **Total** | | **50** | | |

### Month 2 Targets (Cumulative Since Launch)

| Metric | Target | Source |
|---|---|---|
| Buyer Free signups | 160 | Sales Playbook §1.4 Months 1–3: 40/mo cumulative |
| Seller signups | 300 | Same §1.4: 60/mo cumulative |
| Active evaluations | 90 | — |
| Selection Reports | 20 | — |
| Buyer paid conversions | 4–8 | Sales Playbook §1.4 |
| Seller paid conversions | 4–8 | Sales Playbook §1.4 |
| Newsletter subscribers | 1,400 | §4.5 Content Engine |
| LinkedIn followers | 2,500 | §3.5 Content Engine Month-3 target |
| M9 category pages live | 6 | M9 |
| M10 guides live | 2 (SIEM, CDP) | M10 |
| Blog posts live | 9 | §7.3 Content Engine |
| Gated assets live | 5 (Assets 1, 2 full, 3, 4, 5) | §5.1 Content Engine |
| MRR | $3,000–$8,000 | Sales Playbook §1.4 |
| First Enterprise deal closed or formally in proposal | Yes | Gate 2 criterion |

---

## SECTION 6 — POST-LAUNCH MONTH 3 (Weeks 10–13: July 20–Aug 14)

The Month-3 thesis is **prove product-market-fit signals on one side and compound SEO on the other**. Month 3 adds M11 (Comparison Pages) and M13 (Heat Map). Content engine hits stride at 2 long-form posts per month + 12 LinkedIn/month. First M12 quarterly report prep begins (publishes Month 4–5).

### Week 10 (July 20–24) — M11 Comparison Pages + First Win/Loss Analysis at Scale

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | M11 Comparison Pages scaffolding — `/compare/:slug1-vs-:slug2` Framer template + Convex data feed from SellerSoftware entities + Opus comparison-axis generation | 6 | Cross | M11 |
| Product | First 20 M11 comparison pages live — top 5 sellers per category × pair combinations in Security/GRC and DevOps (where SellerSoftware density is highest) | 3 | Cross | M11 |
| Product | Starter → Growth auto-upgrade nudge — "3 bids completed; Growth tier unlocks unlimited" (PLG §4.1 nudge #2) | 2 | Seller | PLG §4.1 |
| Content | Post 7 publishes — *"Per-Seat Pricing Is Why Legal Doesn't Participate in Your Evaluations"* (seat-tax cornerstone) | 0.5 | Buyer | Post 7 |
| Content | Newsletter Issue 10 — *"Vendor Discovery Beyond G2"* (P4 pillar essay) | 2 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts — #14 (G2 vs. Sourcera), #18 (Apollo vs. Sourcera), #2 (NIST teardown v3) | 2 | Cross | §3.2 Content Engine |
| Content | Asset 6 — Procurement Readiness Self-Assessment shipped (25-question, score-banded report) | 6 | Buyer | §5.1 Asset 6 |
| Sales (buyer) | 7 demos; 2 Scale expansions from Month-2 Starter cohort hitting expansion triggers | 12 | Buyer | Sales Playbook §5 |
| Sales (seller) | 5 demos; Growth-tier conversion push | 5 | Seller | Sales Playbook §6 |
| Sales | 1 Enterprise pipeline touch — ensure 2 active Enterprise conversations by month-end | 2 | Cross | Sales Playbook §8 |
| Ops | Weekly review; Win/Loss at cohort level — what the first 15 closed deals have in common | 2.5 | Cross | — |
| Float | Contingency | 2 | — | — |
| **Total** | | **50** | | |

### Week 11 (July 27–31) — M13 Heat Map, Category-Page Amplification

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | M13 Public Marketplace Heat Map — `/heatmap` live with k=20 public floor; anonymized category demand visualization | 6 | Cross | M13 |
| Product | M13 Heat-Map-driven Loops drip — "what procurement is evaluating this month" monthly newsletter + LinkedIn post pipeline | 2 | Cross | §2.5 Content Engine |
| Content | Newsletter Issue 11 — *"M9 Category Page Walkthrough"* with live heat-map read as lead | 2 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts — #7 (G2/Gartner carousel v2), #6 (0.3-pt scoring variance), #10 (SOC 2 audit thread revival) | 2 | Cross | §3.2 Content Engine |
| Content | Guest essay #2 ships — SaaStr — *"Unlimited Seats: The Pricing Decision That Made Our Product a Team Sport"* | 2 | Cross | §6.2 Content Engine |
| Sales (buyer) | 7 demos; 2nd Enterprise conversation structured (SSO + DPA requirement both confirmed in discovery) | 13 | Buyer | Sales Playbook §8 |
| Sales (seller) | 5 demos; Scale-tier seller conversation (first Scale seller candidate — 10+ active bids, ≥200 KB entries) | 5 | Seller | Sales Playbook §6 |
| Sales | Cold outbound — 3 inboxes steady; add Sequence F (targeted at Legal/GRC persona at Primary ICP accounts) | 2 | Buyer | Sales Playbook §2 |
| Partner | First Tier-1 guest essay published — Spend Matters edit ran Week 8; drive amplification | 1 | Cross | §6.2 Content Engine |
| Community | CISO Series monthly panel appearance — 45 min | 1 | Buyer | §6.4 Content Engine |
| Podcast | Fourth appearance — *CISO Series Defense in Depth* | 2 | Buyer | §6.3 Content Engine |
| Ops | Weekly review; Stripe; retention check (any Month-1 churn?) | 2 | Cross | — |
| Float | Contingency | 5 | — | — |
| **Total** | | **50** | | |

### Week 12 (Aug 3–7) — TCO Calculator + Comparison Page Amplification

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | TCO Calculator (Asset 4) — cross-linked from all 6 M9 category pages + Post 6 inline | 2 | Buyer | §5.1 Asset 4, M9 |
| Product | 40 more M11 comparison pages — expand to Data/Analytics and RevOps categories | 4 | Cross | M11 |
| Product | Seller Signal Feed (§6.17) enhancement — surface categorized anonymized buyer activity to Growth-tier sellers | 4 | Seller | §6.17 |
| Content | Post 12 publishes — *"The Ghost-Bid Importer: 12-Month-Old RFP → 47 KB Entries"* | 0.5 | Seller | Post 12 |
| Content | Newsletter Issue 12 — *"TCO Modeling for SaaS"* | 2 | Buyer | §4.2 Content Engine |
| Content | LinkedIn posts — #13 (Ghost-Bid teardown v2), #5 (Selection Memo annotated), #19 (47→183 KB chart) | 2 | Cross | §3.2 Content Engine |
| Content | M12 quarterly report prep — begin aggregation query design for *"State of Enterprise Software Evaluation — Q2 2026"* (k=20 floor) | 4 | Cross | M12, §2.5 Content Engine |
| Sales (buyer) | 7 demos + Enterprise negotiation (assume 1 Enterprise deal in active proposal stage) | 13 | Buyer | Sales Playbook §5, §8 |
| Sales (seller) | 5 demos; seller Scale-tier push | 5 | Seller | Sales Playbook §6 |
| Ops | Weekly review; Win/loss; P1 bug triage | 3 | Cross | — |
| Partner | Webinar #1 planning — *"The 13-Phase Pipeline Applied to Security Tool Evaluation"* (co-hosted with Pavilion) — schedule for Month-4 Week 14 | 2 | Buyer | §4.3 Content Engine |
| Float | Contingency | 3.5 | — | — |
| **Total** | | **50** | | |

### Week 13 (Aug 10–14) — 90-Day Retrospective, Gate 3 Decision

Week 13 is structured to leave capacity for synthesis. Fewer demos. More analysis.

| Block | Task | Hours | Side | Tie-back |
|---|---|---|---|---|
| Product | Ship backlog of P2 bug fixes that have accumulated over 90 days (target: inbox zero) | 6 | Cross | — |
| Product | Enterprise proposal template — Order Form + DPA packaging for self-serve proposal delivery | 3 | Buyer | 1.6.1 |
| Content | Post 13 publishes — *"The Hero Moment: What Happens When a Vendor Clicks a Sourcera Magic-Link"* | 0.5 | Seller | Post 13 |
| Content | Newsletter Issue 13 — *"Founder Journal — 90 Days In"* (the narrative capstone) | 3 | Cross | §4.2 Content Engine |
| Content | LinkedIn posts — #9 (journal), #20 (flywheel math reprise), #3 (scoring carousel v2) | 2 | Cross | §3.2 Content Engine |
| Sales (buyer) | 5 demos — reduced intentionally | 10 | Buyer | — |
| Sales (seller) | 4 demos | 4 | Seller | — |
| Sales | Close or walk active Enterprise deals | 3 | Cross | Sales Playbook §8 |
| Ops | **90-Day Retrospective** — 6-hour structured block Thursday-Friday, produce Founder Memo *"90 Days In"* published internally + externally (as Newsletter 13 mirror) | 6 | Cross | Section 9 Gate 3 |
| Metrics | Full metrics review — 14 indicators vs. targets, 5 North Stars, all 17 M-numbers' status, every PQL threshold audit | 3 | Cross | 1.7.1 |
| Partner | Book podcast slate for Month 4 — 5 confirmed appearances | 1 | Cross | §6.3 Content Engine |
| Content | Begin Post 18 drafting — *"Responsive vs. Loopio vs. Sourcera: The Real Cost per RFP"* (Month 4 publish) | 3 | Seller | Post 18 |
| Float | Contingency | 5.5 | — | — |
| **Total** | | **50** | | |

### Month 3 Targets (Cumulative Since Launch)

| Metric | Target | Source |
|---|---|---|
| Buyer Free signups | 280 | Sales Playbook §1.4 |
| Seller signups | 540 | Sales Playbook §1.4 |
| Active evaluations | 180 | — |
| Selection Reports | 45 | — |
| Buyer paid conversions | 10–14 | Sales Playbook §1.4 |
| Seller paid conversions | 11–18 | Sales Playbook §1.4 |
| Newsletter subscribers | 2,400 | §4.5 Content Engine |
| LinkedIn followers | 4,000 | — |
| M9 category pages | 6 + 12 long-tail = 18 | — |
| M10 guides | 6 seed + 6 long-tail = 12 | — |
| M11 comparison pages | 60+ | — |
| M13 Heat Map | Live + first 2 monthly reads published | — |
| Blog posts live | 13 of 20 (Posts 1–13) | §7.3 Content Engine |
| Gated assets live | 6 (Assets 1, 2, 3, 4, 5, 6) | §5.1 Content Engine |
| MRR | $12,000–$18,000 | Sales Playbook §1.4 |
| Named Enterprise logo closed OR formal proposal out | Yes | Gate 3 criterion |

---

## SECTION 7 — TIME BUDGET (50-Hour Week)

The founder's week is hard-capped at 50 hours. Overspend degrades demo quality, content voice, and decision-making; it does not increase throughput. The split below is the **steady-state after Launch Week**. Pre-launch weeks (-4 to -1) have more product hours and fewer sales hours; Month 1 Week 2 leans into instrumentation. The steady-state is what the founder returns to by Week 6.

### Steady-State Weekly Allocation (Mirrors Sales Playbook §1.2 + Content Engine §1.4)

| Domain | Hours | % | Contents |
|---|---|---|---|
| **Buyer sales** | 16 | 32% | PQL triage (daily 30 min), outbound prospecting (5 hrs/wk), demos (6 hrs/wk — 6 × 1 hr), negotiation + close (3 hrs/wk), post-demo follow-up (1.5 hrs/wk) |
| **Seller sales** | 10 | 20% | PQL triage (daily 20 min), second-invite outreach (2 hrs/wk), Responsive/Loopio direct outbound (1 hr/wk), seller demos (5 hrs/wk — 5 × 1 hr), negotiation + close (1.5 hrs/wk) |
| **Marketing + content** | 10 | 20% | Tuesday content block (2 hrs — long-form or newsletter), LinkedIn × 3 posts (0.75 × 3 = 2.25 hrs), engagement (1 hr Wed), long-form continuation (2 hrs Thu), repurposing (1.5 hrs Fri), community (1 hr) — aligned with Content Engine §1.4 |
| **Product + CS** | 8 | 16% | Onboarding new paying customers (2–3 hrs/wk), PostHog review (1 hr/wk Wed), PQL threshold tuning (0.5 hr/wk), win/loss debriefs (1 hr/wk Thu), bug triage + P1 hot patches (3 hrs/wk) |
| **Thinking + ops** | 4 | 8% | Monday pipeline review (45 min), Wednesday metrics review (1 hr), Friday ICP drift review (1 hr), Stripe reconciliation (30 min), weekly internal memo (45 min) |
| **Float** | 2 | 4% | Contingency — inbound overflow, opportunistic podcast/webinar prep, P0 fires |
| **Total** | **50** | **100%** | |

### Weekly Fixed Calendar (Default)

| Day | Morning (08:00–12:00) | Afternoon (13:00–17:00) | Late (17:00–18:00) |
|---|---|---|---|
| Mon | Pipeline review (45m) · PQL sweep (45m) · Inbound triage (30m) · LinkedIn post #1 (45m) · 2 buyer demos | Outbound prospecting (2 hrs) · CRM hygiene + tomorrow prep | Weekly objective reconfirmation |
| Tue | PQL sweep (30m) · Outbound-warm (1.5 hrs) · 1 buyer demo | **Content block (2 hrs)** · 1 seller demo · inbox triage | CRM hygiene |
| Wed | Metrics review (1 hr) · LinkedIn post #2 (30m) · 1 buyer demo | LinkedIn engagement (1 hr) · 1 seller demo · PostHog review (45m) | CRM hygiene |
| Thu | Win/loss debrief (1 hr) · 1 buyer demo · outbound (1 hr) | 1 seller demo · long-form continuation (2 hrs) | Tomorrow prep |
| Fri | LinkedIn post #3 (journal) · ICP drift review (1 hr) · 1 buyer demo | Repurposing (1.5 hrs) · Stripe reconciliation · 90-min week-retrospective | Thank-yous + weekend handoff |

Weekend is off-by-default. Exceptions: podcast appearances (once/2 weeks, ~2 hrs including prep), late-stage Enterprise negotiation moments (~1–2 hrs if a signature is imminent), and launch-week crisis response. If weekend hours exceed 6 in any month, it is a calendar failure — re-plan.

### Time-Budget Invariants

These are the rules the founder cannot break without the week collapsing.

1. **Max 2 demos/day** (Sales Playbook §1.2). Three demos/day = no deep work that day; five consecutive days at three demos = one week of content loss.
2. **Tuesday AM content block is sacred.** It is never rescheduled for a demo. Demo requests for Tuesday AM route to Wednesday AM.
3. **Friday PM is for retrospective, not new work.** New work started Friday PM does not ship; it becomes Monday's false-start.
4. **No cold outbound sending after 15:00 ET local time** — deliverability degrades when sends hit inboxes after business hours.
5. **Weekly memo published every Friday 17:00.** Internal to advisor list. Any week without a memo = missed instrumentation cycle.
6. **Zero customer-facing commitments on Sunday.** Sunday planning block (30 min) is Sunday night; Saturday is off.

---

## SECTION 8 — METRICS DASHBOARD

The dashboard has three layers: **5 North Star counters** (on the founder's daily home screen), **14 leading indicators** (weekly Wednesday review), and **the full PostHog taxonomy** (monthly deep-dive). This structure matches Sales Playbook §1.4 and is rendered in Notion + PostHog.

### 8.1 Five North Star Metrics (Pinned Daily)

| # | Metric | Definition | Target W13 | Red flag threshold |
|---|---|---|---|---|
| 1 | **Active evaluations** | Count of evaluations in Buyer Console not yet at Phase 12-closed (i.e., live, in-progress) | 180 | < 90 at W13 |
| 2 | **Forced-Signup seller → paid conversion rate** (rolling 90d) | % of M1-arrived sellers who convert to Seller Starter within 90 days | 12%+ | < 8% at W13 |
| 3 | **AI budget consumption rate** | % of paid customers hitting ≥60% of AI budget in their billing period | 55%+ | < 30% (signals budget is too loose, revenue at risk) OR > 85% (signals pricing too tight, churn risk) |
| 4 | **Seller KB entries created (cumulative)** | All-time approved KB entries across all seller workspaces | 6,000+ | < 3,000 at W13 |
| 5 | **MRR** | Combined subscription MRR + outcome-accounted AI MRR | $12K–$18K | < $6K at W13 |

### 8.2 Fourteen Leading Indicators (Weekly, Wednesday Review)

| # | Indicator | Cadence | Target (steady-state, end of Month 3) |
|---|---|---|---|
| 1 | Buyer Free signups / week | Weekly | 50 |
| 2 | Days to first Pre-Scoring on Free — p50, p90 | Weekly | p50 < 3 days, p90 < 10 days |
| 3 | % of Free buyers hitting AI budget ceiling / month | Monthly | 20–30% (conversion driver band) |
| 4 | Buyer Free → Starter conversion % (rolling 30d) | Weekly | 6%+ at W13 |
| 5 | Starter → Growth expansion % at Month 3 | Monthly | 15%+ |
| 6 | Seller signups / week (Forced vs. Organic split) | Weekly | 100/wk (70% Forced / 30% Organic) |
| 7 | Minutes from magic-link → first submitted response (p50, p90) | Weekly | p50 < 20 min, p90 < 45 min |
| 8 | % of Free sellers whose KB Bootstrap generates ≥40 approved entries | Weekly | 50%+ |
| 9 | Second-invitation arrival rate on Free-seller cohort | Weekly | 35%+ within 60d |
| 10 | Seller Free → Starter conversion % (rolling 30d) | Weekly | 8%+ at W13 |
| 11 | Demo-booked rate on PQL ≥ 50 | Weekly | 45%+ |
| 12 | Demo → paid conversion % (buyer separate from seller) | Weekly | Buyer 25%+, Seller 30%+ |
| 13 | Blended gross margin per plan | Monthly | ≥90% across portfolio |
| 14 | Rejected-op rate per AI capability (quality signal) | Weekly | < 30% First-Pass Responder; < 15% Policy Parser |

### 8.3 PostHog Taxonomy — Events Fired at Launch (Sampled)

The full taxonomy is in Appendix G of the Master Spec (§36 — PostHog Event Taxonomy). The events below are load-bearing for PQL scoring and conversion-moment routing:

| Event | Side | Purpose |
|---|---|---|
| `buyer_signup_completed` | Buyer | Top-of-funnel |
| `buyer_workspace_created` | Buyer | Activation step 1 |
| `buyer_template_cloned` | Buyer | Template-Library engagement |
| `buyer_prescoring_completed` | Buyer | Aha Moment |
| `buyer_policy_uploaded` | Buyer | Conversion signal (CISO pathway) |
| `buyer_vendor_invite_sent` | Buyer | M1 source event |
| `buyer_selection_report_generated` | Buyer | Phase-12 completion |
| `buyer_ai_budget_80pct` | Buyer | Upgrade nudge trigger (Loops) |
| `seller_forced_signup_claimed` | Seller | Hero Moment entry |
| `seller_kb_bootstrap_completed` | Seller | Hero Moment completion |
| `seller_first_response_submitted` | Seller | Activation metric |
| `seller_concurrent_bid_limit_hit` | Seller | Conversion moment #1 (Loops trigger) |
| `seller_eoi_attempt_blocked` | Seller | Conversion moment #2 |
| `seller_kb_50_cap_hit` | Seller | Conversion moment #3 (Loops trigger) |
| `evaluation_closed` | Buyer | M4 source |
| `pro_trial_seat_claimed` | Seller | M17 source |
| `ghost_bid_import_completed` | Seller | M15 source |
| `public_selection_link_viewed` | Buyer | M2 amplification metric |

### 8.4 Dashboard Ownership

- **Daily:** Founder glances at 5 North Stars on morning coffee. No meetings.
- **Weekly Wednesday 10:00–11:00:** 14 leading indicators reviewed; internal 1-page memo written.
- **Monthly Last-Friday 14:00–17:00:** Full retrospective — PostHog funnel + PQL model re-weight + plan adjustment.
- **Quarterly:** M12 source data compiled; the *State of Enterprise Software Evaluation* editorial drafted.

---

## SECTION 9 — DECISION GATES

Each gate has a fixed trigger date, a read-out structure, and a decision tree. Gates prevent a founder from pushing through bad data because the sprint's calendar said to.

### Gate 1 — End of Month 1 (Friday 2026-06-19, Week 5)

**Inputs:** Cumulative Month-1 metrics (Section 4). Founder Dashboard (5 North Stars + 14 indicators). First cohort of paying customers' reasons-to-buy (qualitative).

**Decision tree:**

| Scenario | Trigger | Action |
|---|---|---|
| **Green** | ≥50 buyer signups AND ≥100 seller signups AND ≥1 buyer paid conversion AND Hero Moment p50 ≤25 min AND newsletter ≥500 subscribers | Stay the course on Section 5 (Month 2) plan. |
| **Yellow** | Meets 3 of 4 thresholds above | Identify the underperforming lever. If buyer-side: double outbound (add Sequence B Marcus at 2× volume, extend warm-outreach to 500 accounts). If seller-side: double Ghost-Bid Importer (M15) surface in content; prioritize M6 ship 1 week earlier. |
| **Red** | Meets 2 or fewer | **Activate Contingency Path A** (Section 10): 2-week buyer-side sprint, freeze seller-side marketing, concentrate 100% of Section 5 content calendar on P2 Audit-Defensibility angle (converts highest-intent Priya persona). |
| **Critical Red** | Hero Moment p50 > 35 min OR no buyer signups at all | Halt M2/M3/M6/M7 shipping. Month-2 reverts to repair-only: Hero Moment deep-iteration week, PQL model re-weight from scratch, personal field-research sprint (5 calls with Priya lookalikes). |

### Gate 2 — End of Month 2 (Friday 2026-07-17, Week 9)

**Inputs:** Cumulative Month-2 metrics. First Enterprise deal status. M9/M10 traffic from Search Console. Churn signal (any Month-1 paid customer at risk of non-renewal).

**Decision tree:**

| Scenario | Trigger | Action |
|---|---|---|
| **Green** | ≥150 buyer signups cumulative AND ≥4 buyer paid AND ≥4 seller paid AND MRR ≥$3,000 AND 1 Enterprise deal in proposal stage OR closed | Stay the course on Section 6 (Month 3) plan. Accelerate M11/M13 by 1 week if capacity allows. |
| **Yellow** | Meets 4 of 5 thresholds above | Identify drag. If MRR weak but signups strong: PQL model is probably undercalibrated — re-weight. Pricing objection pattern from demos: re-test one narrative ("why per-org pricing" vs. "why outcome-accounted AI" as primary demo message). |
| **Red** | Meets 3 or fewer | **Activate Contingency Path B** (Section 10): delay M11/M13; concentrate on one seed category (Security/GRC) and achieve depth — 3 public Selection Reports from real customers, 3 Heat Map reads, 20 comparison pages all in that one category. Narrow the surface; win the wedge before expanding. |
| **Critical Red** | Zero Enterprise deals in proposal OR net churn > 0 in Month 2 | Halt M11/M13 entirely. Month 3 becomes a retention + Enterprise-discovery-sprint month. |

### Gate 3 — End of Month 3 (Friday 2026-08-14, Week 13)

**Inputs:** Full 90-day data. Category-SEO early signals (Search Console). Founder energy/morale honest self-assessment. Investor/advisor feedback if applicable.

**Decision tree:**

| Scenario | Trigger | Action |
|---|---|---|
| **Strong Green** | MRR ≥$15K AND 1 Enterprise closed AND ≥10 buyer paid AND ≥15 seller paid AND Hero Moment p50 ≤18 min AND M9 pages driving ≥5% of buyer signups | Transition to **Month 4–6 Phase** (separate plan): focus on repeatability. Build first 3 case studies. Begin analyst briefings (§6.1 Content Engine ladder step 7). Decide on first hire profile (growth engineer vs. GTM associate). |
| **Green** | Meets all Gate-2 thresholds + MRR ≥$12K | Stay on steady-state cadence; Month 4 plan mirrors Month 3 with M12 quarterly report shipping as the top milestone. |
| **Yellow** | MRR in $6–$12K band | **Pricing audit**: re-run pricing narrative through 10 customer conversations; possibly unlock Month-2 drift on price-before-pain discipline (Sales Playbook §1.2). |
| **Red** | MRR < $6K OR net churn > 15% OR no Enterprise deals open | **Category-fit review**: is the buyer-side ICP correct? Is the Sourcera Method cornerstone being read but not converting? The founder either re-segments (pull back from regulated mid-market to a narrower wedge — e.g., Healthcare payer / Insurance only) or re-prices (abandon the $299 Starter entry; pull the plan tier upward). |
| **Critical Red** | MRR < $3K | **Strategic pivot consideration.** Three paths: (a) pivot to seller-side-first go-to-market (invert the flywheel); (b) narrow to compliance-only wedge; (c) fundraise a bridge to buy 6 more months at this cadence. |

### Gate Cadence After Month 3

Gates 4 and beyond happen at end-of-Month-6, end-of-Month-9, end-of-Month-12. After Month 3 the sprint document is retired and Section 9 migrates into a living Operating Plan document.

---

## SECTION 10 — FAILURE MODES & CONTINGENCIES

This section anticipates the 12 most probable failure modes. Each has a detection signal, a response, and a specific rewriting of the subsequent plan.

### 10.1 Failure Mode: Seller Hero Moment p50 > 30 min

**Signal:** Week-2 data. More than 30% of Forced-Signup sellers abandon before first submitted response.

**Response (within the week signal fires):**
1. Founder sits through 3 live Hero Moment walkthroughs on Zoom (one Sam, one Leo, one Rachel persona) — not assisting, just watching.
2. Identify the drop-off phase (usually KB Bootstrap, Ghost-Bid Importer, or First-Pass Responder).
3. Ship a single fix within 72 hours. If the fix is structural (e.g., reducing KB Bootstrap from 8 questions to 3), defer the next week's M-number ship (typically M3 or M6) by 1 week.

**Plan rewrite:** Week 3 becomes "Hero Moment Repair Week" — 15 of the 16 Seller hours redirect to product iteration, 5 of the Marketing hours shift to seller-facing content (Ghost-Bid Importer teardown post, SOC 2 cite-before-state post). Buyer side unchanged.

### 10.2 Failure Mode: Buyer Signups < 50% of Target in Month 1

**Signal:** End of Week 3. Cumulative Buyer Free signups < 30.

**Response:**
1. Is the funnel narrow (low visitor volume) or un-converting (high visitor volume, low signup)?
   - *Narrow:* Invest Month 1 Week 4 content budget 100% in P2 Audit-Defensibility (highest-conversion pillar). Pull-forward Asset 7 (Compliance Framework Matrix — originally Month 5) to Month 2.
   - *Un-converting:* Rewrite `/for-buyers` page using the two highest-converting objections from demo transcripts. A/B test the hero hook.
2. Add 30 LinkedIn DMs/day on Priya persona — warm direct outreach using the Method PDF as the bait.
3. Book 3 podcast appearances on procurement shows in Month 2 (shift Month 3 podcast bookings forward).

**Plan rewrite:** Week 4 diverts 6 hours from "new feature" to "conversion rewrite." Month 2 Week 8 becomes an "Inbound Recovery Week."

### 10.3 Failure Mode: Forced-Signup Seller → Paid Conversion < 6% in 60 Days

**Signal:** End of Week 8 (60 days post-launch). Forced-Signup seller to Starter paid conversion < 6%.

**Response:**
1. Re-interview 5 Forced-Signup sellers who did not upgrade. The ask: "What made you use the product 5 times without paying?"
2. Common expected answers: (a) Free tier too generous (5 concurrent bids is too high — consider dropping to 3), (b) Hero Moment delivered value but day-30 Loops nurture is too soft, (c) Growth-tier features aren't distinctly valuable vs. Starter.
3. One of three fixes depending on answer. If (a): re-price Free to 3 concurrent bids ceiling by Month 3. If (b): rewrite day-7/day-30 seller Loops sequence (Content Engine §4.4). If (c): rethink Growth-tier value proposition and/or drop the tier.

**Plan rewrite:** Gate 2 auto-triggers Contingency Path B. Week 10 Product block redirects 8 hours to Free-tier re-pricing work.

### 10.4 Failure Mode: AI Cost Overrun (Blended Margin < 80%)

**Signal:** End of Month 2. Blended gross margin per customer < 80% (target ≥90%).

**Response:**
1. Audit by capability: which AI capability is producing disproportionate cost? (First-Pass Responder is the most probable culprit.)
2. Verify that every capability is routing Haiku-first, Opus-fallback-only-on-complexity — any capability defaulting to Opus is immediately re-routed.
3. Verify the rejected-op rate — if > 30% on any capability, users are paying for outputs they reject, which silently erodes margin.
4. Consider: raising the Free-tier AI budget ceiling gating. If Free sellers are burning $5 budgets quickly, reduce to $3 (Seller Pricing §2.2 permits this strategically).

**Plan rewrite:** Immediate; within the week the signal fires. Routes a 4-hour product block to capability re-tuning. Does not affect the quarterly plan.

### 10.5 Failure Mode: Anti-Spam Breach — Vendor Complaint About Unsolicited M1 Invite

**Signal:** A seller or their legal team files a complaint about receiving an M1 invite they did not consent to.

**Response (immediate, within 24h):**
1. Add the complaining domain to Vendor Opt-Out Registry.
2. Pause all outbound M1 invites org-wide for 48 hours while reviewing the specific invite chain.
3. Review: was the buyer a legitimate customer? Was the bid_id legitimate? Did the invite copy contain the required opt-out language?
4. If copy was deficient, ship a revised M1 invite template within 48 hours.
5. Founder-written apology email to complainant.

**Plan rewrite:** Depending on root cause, Gate 1 may require accelerated Signal Integrity Monitor rollout from Month 3 to Month 2.

### 10.6 Failure Mode: Convex / Infrastructure Outage > 60 Minutes During Business Hours

**Signal:** Status page red > 60 min on a weekday 09:00–18:00 ET.

**Response:**
1. Status page updated within 5 min; incident start logged.
2. Founder-written customer communication email (queued in Loops, sent at T+30min if outage persists).
3. Loom apology video at T+90min if outage persists.
4. Post-incident: 72-hour SLA to publish a blameless postmortem on the status page.

**Plan rewrite:** If outage is > 4 hours, next 2 weeks shift 4 hours from content to infrastructure hardening. Consider retaining a part-time SRE contractor.

### 10.7 Failure Mode: M9/M10 Pages Fail to Rank

**Signal:** End of Month 3. Search Console data: < 5 M9 pages in top 50 for their target keywords.

**Response:**
1. Likely causes: (a) insufficient backlinks from founder content, (b) thin unique content on M9 pages (Opus FAQ generation is too formulaic), (c) indexing blocked by `no-index` or robots.txt error.
2. Audit technical SEO first (15 min). Then audit content (a 2-hour content audit against the Appendix A drift checklist).
3. Instead of more M9 pages, invest in the human editorial layer — Posts 8 (SIEM) and 9 (CDP) + 4 more seed-category editorial posts that link *into* M9 pages.

**Plan rewrite:** Month 4 Week 14 shifts the 4 M11 pages planned → 4 new human-authored category-evaluation posts linking to the existing M9s.

### 10.8 Failure Mode: Newsletter Open Rate Drops Below 30% for 3 Consecutive Issues

**Signal:** End of Month 2 or Month 3. Three issues at < 30% open rate.

**Response:**
1. Subject-line audit: if all 3 issues have "The" or "How" subjects, vary. If all 3 have same preview text, rewrite.
2. Content thesis audit: is the Lead too similar across issues? The 4-issue pillar rotation (P1→P2/P3→P4→P5, Content Engine §4.2) is the enforcement mechanism.
3. List hygiene: un-engaged subscribers > 90 days get a "did this newsletter stop being useful?" re-engagement email. Those who don't reopen in 30 days are sunset.

**Plan rewrite:** Week 9 or 13 (whichever gate hits) adds a 2-hour "newsletter recalibration" block to the content budget.

### 10.9 Failure Mode: Enterprise Gate Too Aggressive (Losing Scale-Tier Deals to Enterprise Requirements)

**Signal:** Month 2–3. Demo transcripts show deals stalling on "SSO required at Growth tier" or "DPA required at Scale tier."

**Response:**
1. Re-read the Enterprise gate definitions (§2.6 Master Summary, §6 Buyer Pricing): SSO, DPA, ≥$12K AI commit, custom integration. Are any being demanded inappropriately at Scale?
2. Likely fix: SSO is a Growth-tier expectation, not Enterprise. If the gate is blocking a Growth-eligible customer, move SSO down.
3. Alternatively: the Growth tier price ($799) and the Enterprise gate mean there is a $1,200 dead zone. Consider: is there a Scale gate at $1,999 + optional SSO add-on?

**Plan rewrite:** Pricing adjustment is load-bearing — not a spontaneous decision. Book a 2-hour pricing-strategy revision block; consult Buyer Pricing Strategy document before any change.

### 10.10 Failure Mode: Content Burnout — Founder Ships < 3 LinkedIn Posts / Week

**Signal:** Any 2 consecutive weeks. Fewer than 3 LinkedIn posts published.

**Response:**
1. The content cadence is the distribution engine. Missing 2 weeks compounds into 500+ fewer newsletter subscribers per quarter.
2. Fix: pre-batch 2 weeks of LinkedIn posts during a Sunday 90-min session. Use Buffer or Taplio for scheduling.
3. If the batch system fails twice, the founder is at structural capacity and the 50-hour ceiling is degraded. Time to cut one demo/day from the calendar and redirect the hour to content. (Demos scale linearly; content compounds.)

**Plan rewrite:** 1 hour/wk from Buyer sales → Marketing. Revise Sales Playbook §1.2 allocation accordingly.

### 10.11 Failure Mode: PQL Scoring Surfaces Wrong Leads

**Signal:** Month 2–3. Demos from PQL ≥100 converting at < 15% (target 30%+).

**Response:**
1. The PQL model is overweighting a non-converting signal. Most likely culprit: single Pre-Scoring runs that show "Aha Moment" but not "commit intent."
2. Re-weight: lower the single-Pre-Scoring weight; raise the vendor-invite count weight; raise the Policy Upload weight.
3. Any demo from PQL ≥100 that converts gets the founder writing a 3-bullet reason-it-converted note into Attio → feeds the next re-weighting.

**Plan rewrite:** Week 8 adds a 4-hour PQL-model re-weighting block. Becomes a standing monthly activity.

### 10.12 Failure Mode: Founder Cognitive Overload (Quality Degradation)

**Signal:** Honest self-assessment. Demos feel rote. Content voice is generic. Bugs repeating. Decisions pushed back "until I have more data."

**Response:**
1. Take 48 hours completely off. No inbox, no Slack, no CRM.
2. On return: Sunday 4-hour block doing three things: (a) re-read GTM_POSITIONING §5 to reset narrative, (b) re-read Sales Playbook §1.6 (founder discipline rules), (c) ship one hour of the Method cornerstone rewrite — the single highest-leverage founder activity.
3. Cut 5 hours from the next week's demo calendar. Redirect to thinking/ops.

**Plan rewrite:** Week following the reset becomes 45-hour cap. 5 hours redirected — 3 to deep work on one product decision, 2 to content refactoring.

### 10.13 Failure Mode (Residual) — Other High-Impact Risks

**Catalog:** WorkOS tenant misconfiguration · Stripe webhook reconciliation lag · Anthropic API rate limiting during demo · GDPR complaint from EU buyer invite · Competitor Responsive/Loopio public spoiler of the Hero Moment · First churned customer public complaint · Key partnership (Pavilion, PreSales Collective) relationship breakdown.

Each of these has a corresponding playbook in `/ops/incidents/` — they are not re-enumerated here because the sprint plan does not need them inline; the founder does. The sprint plan's job is to leave Float hours (2 hrs/wk) to absorb them.

### 10.14 Escalation Structure

| Severity | Definition | Response window | Decision authority |
|---|---|---|---|
| **P0** | Site down, data loss risk, billing broken, public security disclosure | Immediate; all other work stops | Founder (no escalation; there is no else) |
| **P1** | Feature broken for > 10% of users; customer escalation; infra degraded | 2 hours | Founder |
| **P2** | Bugs; non-revenue-blocking UX issues | 72 hours | Founder |
| **P3** | Paper cuts; polish | Weekly triage | Founder |

---

## Closing Note

This plan is designed to be executed, not admired. Every hour is accounted for; every deliverable has a date; every M-number has a ship target; both sides of the marketplace are covered every week from Week -4 through Week 13.

If, at Week 13, the Gate-3 decision is Strong Green, the next plan is a Months-4-through-6 document that adds hiring, analyst relations, the M12 quarterly report launch, and the first category-conference keynote. If it is Red, this plan already names the pivot paths.

The Method compounds. The automated surfaces (M9/M10/M11/M12/M13) compound. The founder's audience compounds. The marketplace flywheel compounds. None of them compound if the founder skips weeks. Ship every week. Measure weekly. Retrospect monthly. Revisit the plan at gates — not between them.

**Authored under Opus-grade discipline; read twice before adjusting.**
