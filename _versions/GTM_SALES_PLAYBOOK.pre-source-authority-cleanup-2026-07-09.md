# Sourcera — GTM Sales Playbook (Founder-Led)

**Version:** 1.0
**Date:** 2026-04-20
**Purpose:** The operating manual for Sourcera's founder-led sales motion — two-sided, consumption-based, zero-headcount. Covers weekly rhythm, prospecting, qualification, demos, objections, pricing, and post-sale onboarding for buyer and seller tracks as parallel systems.
**Source authority:** `Sourcera_Master_Spec.md` §1, §2, §27, §34, §48, §49 · `Sourcera_Buyer_Pricing_Strategy.md` v3 · `Sourcera_Seller_Pricing_Strategy.md` v3 · `GTM_POSITIONING.md` v1.0 · `GTM_PLG_ARCHITECTURE.md` v1.0.
**Status:** GTM narrative companion for the solo-operator sales motion. Master Spec wins for product and pricing behavior.

**How to use this document.** Every email, script, cadence, and talk-track below is production copy. Replace bracketed tokens (`[first_name]`, `[buyer_company]`, `[trigger_event]`) at send time; do not rewrite the claims. Claims are load-bearing against the authoritative pricing, the Hero Moment, the Dual-Console firewall, and the 13-phase pipeline. When a source document updates, this playbook is non-authoritative until reconciled.

---

## SECTION 1 — FOUNDER-LED SALES OPERATING MODEL

### 1.1 The Solo Operator Thesis

The entire sales motion is designed so that one person can run it durably at 45–55 hours per week without degrading pipeline quality. Three structural decisions make this tractable:

1. **PLG is the funnel, not sales.** Free tier on both sides is a real product (§4 Buyer Pricing, §4 Seller Pricing). The Buyer Aha Moment (first Pre-Scoring across ≥3 vendors) and the Seller Hero Moment (bootstrapped bid inside SSO redirect latency) do the first five hours of convincing before a sales conversation starts. Sales time compounds on PQL scoring output (§7 PLG Architecture), not cold volume.
2. **One loop seeds the other.** Every buyer evaluation with a vendor shortlist of 3–7 creates 3–7 Forced-Signup sellers (M1, Master Spec §48). Every Marketplace listing from a seller (free on Seller Free) creates buyer-side search-surface inventory. The founder does not need parallel cold pipelines on both sides — buyer-side deal flow manufactures seller-side lead flow.
3. **Outcome-accounted AI pricing is self-protecting.** Customers onboard, consume, and churn against a pricing model that cannot produce bill shock (§2.4 Buyer Pricing, §2.2 Seller Pricing). That collapses the CS load that normally forces a founder to stop selling.

### 1.2 Weekly Operating Rhythm — 50 Hours Default

The week is split into four domains. The split is not aspirational; it is the default calendar. Block-book the founder's calendar on Sunday night for the full week ahead.

| Domain | Hours/wk | What happens |
|---|---|---|
| **Buyer sales** | 16 | PQL triage, outbound prospecting, demos, negotiation, close |
| **Seller sales** | 10 | PQL triage (heavier PLG leverage), second-invite outreach, Responsive/Loopio direct outbound, seller demos, close |
| **Marketing + content** | 12 | LinkedIn posts, Substack/blog, category content (M9/M11/M12 seeding), podcast appearances, webinars, video teardowns |
| **Product + CS** | 8 | Onboarding new customers, PostHog dashboard review, PQL threshold tuning, win/loss debriefs, bug triage with engineering |
| **Thinking + ops** | 4 | Week-review, pipeline hygiene (CRM), KPI dashboard review, Stripe reconciliation, ICP drift review |

**Daily rhythm (default weekday):**

- **07:30–08:30** — PQL dashboard sweep (both sides). Triage score ≥ 50 and score ≥ 100 lists. Route Hot Leads into the day's outreach queue. Review overnight PostHog alerts.
- **08:30–10:00** — Inbound-warm outreach window. First-touch on every buyer PQL ≥ 50 that crossed overnight; second-invite outreach on seller PQLs with `seller_concurrent_bid_limit_hit` fired in last 72h.
- **10:00–12:00** — Demos (buyer or seller). Max 2 demos / day to preserve prep quality.
- **12:00–13:00** — Lunch / inbox triage.
- **13:00–15:00** — Deep work block (one of: content, product, negotiation drafting). Not interruptible by demo requests; push to tomorrow.
- **15:00–17:00** — Outbound prospecting. LinkedIn send + sequence-based cold email. Mondays/Wednesdays buyer-heavy, Tuesdays/Thursdays seller-heavy, Friday split.
- **17:00–18:00** — CRM hygiene, tomorrow prep, notes on every touched deal.

**Weekly rhythm anchors:**

- **Monday AM** — Pipeline review (45 min). Every deal reviewed for next step + age. Any deal with no next step scheduled within 7 days is moved to Dormant.
- **Tuesday AM** — Content block (2h). Ship one LinkedIn post, one Substack, or one category teardown.
- **Wednesday AM** — Metrics review (1h). Review the 14 leading indicators defined in §1.4.
- **Thursday AM** — Win/loss debrief for any deal that closed or stalled in the last 7 days. One page, filed in `/ops/wl/`.
- **Friday afternoon** — ICP drift review. Any new-ICP signal from the week gets logged. Prune dead prospects from CRM.

### 1.3 Buyer-Seller Interaction: How One Side Feeds the Other

The two motions are not independent — they compound. The founder must think about them as one flywheel with two fuel sources.

**Buyer → Seller lead flow (the dominant direction):**

1. Buyer signs up on Free (organic or outbound) and creates an evaluation.
2. Buyer invites 3–7 vendors via M1 (Vendor-Invite-Creates-Account). Each invite email is domain-verified, carries a magic-link, and pre-binds a `bid_id`.
3. Each invited vendor lands on the Hero Moment. Regardless of whether they convert to paid, Sourcera has a domain-verified Seller Org, a published profile, a bootstrapped KB, and 3 Capability Declarations added to Marketplace inventory.
4. Of 3–7 invited vendors, 1–3 enter the seller PQL pipeline within 30 days based on cohort data targets (§7.2 PLG Architecture).
5. Those sellers are the warmest cohort on the platform — the founder touches them at conversion moments 1–3 (second concurrent bid, first EOI attempt, KB 50-entry ceiling) with no cold prospecting overhead.

**Seller → Buyer lead flow (the secondary direction):**

1. Seller publishes profile + SellerSoftware entity on signup. Schema.org structured data (§6.15.4) emits to public Marketplace + category pages.
2. Category pages rank organically (M9 loop). Buyer-side signups land from SEO on category content.
3. Sellers push Sourcera links into their own CRM (M6 loop after Growth tier), exposing buyer-side stakeholders at seller accounts to Sourcera through their vendors.

**The "one deal seeds ten" principle — numeric version:**

- A buyer who runs one evaluation with 5 vendors produces **5 Forced-Signup seller accounts**.
- At the target Forced-Signup conversion rate to Seller Starter (conservative 12% within 90 days), that is **0.6 paying sellers per buyer evaluation**.
- A buyer on Business Scale runs ~12 evaluations/yr × avg 5 vendors = **60 seller invites per Scale customer per year** = **~7 paying sellers per Scale buyer per year**.
- The math: **one Scale buyer ($1,999/mo × 12 = $23,988 ARR)** seeds approximately **$12,500 ARR in paying sellers per year** (7 × $149 × 12), plus unpriced supply-side Marketplace inventory.

**Implication for founder time allocation:** Close buyer deals. Seller pipeline is a derivative.

### 1.4 Pipeline Targets (Year 1, Months 1–12)

Target mix at Year-1 exit (combined blended margin ≥ 90%): Buyer 60/25/10/5 across Starter/Growth/Scale/Enterprise; Seller 55/25/15/5 across Starter/Growth/Scale/Enterprise (§12, §13 Buyer/Seller Pricing).

**Working assumption — Year-1 exit ARR target:** $1.5M combined. Breakdown derived below.

| Metric | Month 1–3 | Month 4–6 | Month 7–9 | Month 10–12 |
|---|---|---|---|---|
| Buyer signups (Free) / mo | 40 | 100 | 200 | 350 |
| Buyer PQL ≥ 50 / mo | 4 | 12 | 25 | 45 |
| Buyer PQL ≥ 100 / mo | 1 | 3 | 7 | 14 |
| Buyer demos booked / mo | 3 | 8 | 18 | 32 |
| Buyer close rate (demo→paid) | 20% | 25% | 30% | 32% |
| Buyer paid adds / mo | 1 | 2 | 5 | 10 |
| Buyer ARR adds / mo ($) | $3,600 | $9,600 | $33,000 | $78,000 |
| Cumulative Buyer ARR ($) | ~$10K | ~$40K | ~$135K | ~$350K |
| Seller signups (Forced+organic) / mo | 60 | 200 | 500 | 900 |
| Seller PQL ≥ 50 / mo | 6 | 22 | 60 | 120 |
| Seller demos booked / mo | 2 | 5 | 12 | 22 |
| Seller close rate | 25% | 30% | 35% | 40% |
| Seller paid adds / mo | 1 | 3 | 8 | 18 |
| Seller ARR adds / mo ($) | $1,800 | $6,600 | $24,000 | $60,000 |
| Cumulative Seller ARR ($) | ~$5K | ~$25K | ~$95K | ~$250K |
| **Combined ARR at month end** | **~$15K** | **~$65K** | **~$230K** | **~$600K** |

Year-1 exit run-rate implied: **~$600K MRR-annualized**, with a second-year ramp against the deeper marketplace flywheel pushing past $1.5M by month 18.

**Leading indicators watched weekly (14):**

1. Buyer Free signups / week
2. Days to first Pre-Scoring on Free (p50, p90)
3. % of Free buyers hitting AI budget ceiling / month
4. Buyer Free → Starter conversion % (rolling 30d)
5. Starter → Growth expansion % at month 3
6. Seller signups / week (Forced vs Organic split)
7. Minutes from magic-link to first submitted requirement response (p50, p90) — Master Spec §48.1.6
8. % of Free sellers whose KB Bootstrap generates ≥40 approved entries
9. Second-invitation arrival rate on Free seller cohort
10. Seller Free → Starter conversion % (rolling 30d)
11. Demo-booked rate on PQL ≥ 50
12. Demo → paid conversion % (both sides, separately)
13. Blended gross margin per plan (margin-guard)
14. Rejected-op rate per capability (quality signal; target <30% First-Pass Responder)

### 1.5 Tool Stack — Free / Cheap / Founder-Durable

Every tool in the stack is either free or sub-$100/mo. No LinkedIn Sales Navigator seat for the first 90 days (use free LinkedIn + CRM enrichment); upgrade only when warm outbound hits volume ceiling.

| Purpose | Tool | Cost | Notes |
|---|---|---|---|
| CRM | **Attio** (free tier) or **HubSpot Free CRM** | $0 | Attio preferred — better API, stronger data model for 2-sided pipelines. Separate pipelines: `Buyer Outbound`, `Buyer PQL`, `Seller Outbound`, `Seller PQL`, `Partners`. |
| Email sequences (outbound) | **Instantly.ai** Growth | $37/mo | 5K email verifications/mo, unlimited warmup, multi-inbox rotation. Do not use Apollo sequences — deliverability is weak at solo volume. |
| Email send infra | **Google Workspace** primary + **Zoho Mail** secondary (warmup) | $12–30/mo | Two sending domains: `sourcera.com` (primary transactional) and `sourcera.io` (outbound prospecting). Never send cold outbound from `sourcera.com` — protects primary domain reputation. |
| Calendar / scheduling | **Cal.com** (free tier) or **Zcal** | $0 | 30-min buyer demo link, 20-min seller demo link, 15-min founder-intro link. Round-robin unnecessary — solo operator. |
| LinkedIn outreach | **LinkedIn Premium** + **Surfe** (CRM sync) | $29 + $39/mo | Upgrade to Sales Navigator ($99/mo) at month 4 when outbound daily volume ≥ 25 connection requests / day. |
| Email finding | **Findymail** or **Clay** | $49/mo or pay-as-you-go | Clay is more powerful but needs setup. Findymail for fast solo ops. |
| Enrichment | **Clay** or built into Attio | $79/mo (Clay) | Pulls company size, funding, technographics onto CRM records. |
| Video / demos | **Zoom** (free) + **Loom** (free) | $0 | Loom for 2-min "async demo" video attachments in sequences. Zoom for live. |
| Document signing | **Docusign** (Personal $15/mo) or **Dropbox Sign** | $15/mo | MSAs and order forms. |
| Payments / billing | **Stripe** (customer-facing) + **Metronome** (consumption accounting, if needed) | 2.9% + 30c | Stripe handles subscription + in-app upgrade flows (§8.1 PLG Architecture). |
| Analytics | **PostHog** (generous free tier, eventually paid) | $0–$450/mo | Source-of-truth for PQL scoring, funnel, activation metrics. |
| Support / shared inbox | **Plain** or **Missive** | $0–$29/mo | Route `support@sourcera.com` + `sales@sourcera.com` + `founder@sourcera.com` into one view. |
| Knowledge / CRM overlay | **Notion** (free plan) | $0 | Weekly pipeline reviews, deal notes, battle-card library, content ops. |
| Slack for communities | Slack Free | $0 | Join Pavilion, ProcurementFoundation, Buyers Meeting Point, RevGenius, CISO Series. |

**Total monthly tool spend at month 0:** ~$200/mo. **At month 6:** ~$450/mo.

### 1.6 Founder Discipline Rules (Non-Negotiable)

- **No deal with no next step.** Every CRM record carries a scheduled next step in the next 7 days or is flagged Dormant.
- **No demo without a research pre-brief.** The pre-demo research checklist (§5.1, §6.1) is run before every booked demo without exception. Saves 25% of demo time.
- **No price before pain.** Pricing is presented after pain is quantified (§8.1). Not before.
- **No Enterprise pitch without the gate.** Do not route to Enterprise until one of {SSO, DPA, ≥$12K AI commit, custom integration} is confirmed as a requirement (Master Spec §34, §6 Buyer Pricing, §8 Seller Pricing).
- **No silent discount.** Discounts are annual-vs-monthly only. Any other discount is a founder-override documented in CRM with explicit rationale.
- **No KB portability handwave with sellers.** When a seller asks about export, show them the export endpoint. Trust is the seller flywheel's load-bearing assumption.
- **No founder-written follow-up slower than 2 hours after a demo.** The demo recap email is sent within 2 hours or the demo is scored as a low-effort loss.

---

## SECTION 2 — BUYER-SIDE PROSPECTING SYSTEM

The buyer side splits 30% outbound / 50% inbound / 20% partner by founder time allocation. The split reflects two realities: PLG does the top-of-funnel work, and partner leverage — once wired — returns more deals per hour than cold outbound.

### 2.1 OUTBOUND (30% of Buyer Sales Time — ~5 hours/week)

Outbound buyer prospecting targets the five personas from `GTM_POSITIONING.md` §2: Priya (VP Procurement, economic buyer), Marcus (VP IT), Elena (CISO), Dan (CFO), Jordan (Procurement Specialist, champion). Prospecting is concentrated on accounts inside the Primary Buyer ICP (§1.1.1 Positioning): 500–5,000 employees, $2M–$20M annual software spend, regulated industries.

#### 2.1.1 LinkedIn Prospecting

**Search criteria per persona (LinkedIn Sales Navigator filters):**

| Persona | Titles (contains any) | Company size | Industries | Seniority | Geography |
|---|---|---|---|---|---|
| **Priya** | "VP Procurement", "Director Procurement", "Head of Procurement", "Procurement Lead", "Director Vendor Management", "Chief Procurement Officer" | 500–5,000 | Financial services, healthcare, higher ed, insurance, life sciences, manufacturing | Director+ | US (Y1), EU (Y2) |
| **Marcus** | "VP IT", "Director IT", "VP Platform Engineering", "Head of IT Architecture", "Director Cloud Operations" | 500–5,000 | Same as Priya + SaaS companies $50M+ ARR | Director+ | US |
| **Elena** | "CISO", "VP Security", "Head of GRC", "Director InfoSec", "Chief Information Security Officer", "VP Risk" | 500–5,000 | Financial services, healthcare, life sciences, regulated manufacturing | VP+ | US |
| **Dan** | "CFO", "VP Finance", "Director Finance", "Head of FP&A" | 500–5,000 | All Primary ICP verticals | VP+ | US |
| **Jordan** | "Procurement Specialist", "Procurement Analyst", "Category Manager", "Vendor Manager", "Business Analyst Procurement" | 500–5,000 | Same as Priya | Individual contributor to Manager | US |

**Daily quota:** 15 connection requests / day, rotated across personas. Founder-heavy on Priya (6/day) and Jordan (4/day) because they are the highest-velocity routes; Elena (2/day), Marcus (2/day), Dan (1/day) — Dan is typically reached through Priya, not direct.

**Connection request templates (3 variations, one per trigger frame):**

**Variation A — Audit-trigger framing (default, highest reply rate for Priya and Elena):**

> [first_name] — saw [company] runs procurement in [industry]. Quick reason I'm reaching out: we're building the operating system for enterprise software procurement — the category after spreadsheets. Open to a short note on what broke in your last audit? No sales, just 120 seconds of your insight.

**Variation B — Evaluation-trigger framing (highest reply rate for Marcus and Jordan):**

> Hi [first_name] — I'm building Sourcera, a structured evaluation platform replacing the Excel-and-SharePoint workflow most procurement teams still run on. Curious what tooling [company] uses when you're running 4+ parallel evals. Happy to share what we've learned from 100 mid-market procurement teams.

**Variation C — Peer-cohort framing (highest reply rate for Dan):**

> [first_name] — I run Sourcera (operating system for enterprise software procurement). We've been hearing from CFOs at [peer company 1] and [peer company 2] that the TCO model ending at year 1 is the number-one frustration with how their teams evaluate software. Open to comparing notes for 120 seconds?

**5-touch follow-up cadence after connection accept (LinkedIn DMs):**

**Day 0 — Connection accepted:**

> Thanks for connecting, [first_name]. Short version of why I'm reaching out: Sourcera is the first software evaluation platform — we replace the spreadsheet-SharePoint-email-PowerPoint stack most procurement teams run with a structured 13-phase pipeline, an AI co-pilot, and an auditable Selection Record. Unlimited seats on every paid tier. From $299/mo. Mind if I send a 90-second video showing how it works?

**Day 3 — No reply:**

> Quick follow-up — no pressure. Just sharing one concrete thing: one of our buyers uploaded NIST 800-53 once and it parsed into 40-odd structured requirements with source-control traceability. They stopped rewriting compliance requirements across evaluations. Two-minute Loom if useful: [loom_url].

**Day 7 — No reply:**

> [first_name] — last quick note. In case the timing is off, here's what we hear most often from [persona_role]s in regulated industries: "the Selection Report finally gave our auditor the artifact they were asking for." Happy to send the sample PDF. Otherwise, I'll stop until something's relevant on your side.

**Day 14 — No reply:**

> Moving you to passive follow-up. If you're ever (a) running a painful evaluation, (b) sizing 2026 procurement tooling, or (c) just want to trade notes on procurement tech, my calendar is open: [cal_url]. Otherwise I'll check back next quarter.

**Day 45 — Final long-cycle touch:**

> Hi [first_name] — quarterly check-in. Two things that changed this quarter at Sourcera: [specific_product_update_1] and [specific_customer_outcome_2]. Would love 15 minutes if either is relevant. If not, no worries.

#### 2.1.2 Cold Email Sequences — Four Emails per Persona

All cold emails send from `[founder]@sourcera.io` (the prospecting domain), not `sourcera.com`. Single inbox = 40 sends/day max at warm state. Three inboxes rotating = 120/day, which is the volume ceiling for a solo operator before deliverability degrades.

**Send cadence (all sequences):** Day 0, Day 3, Day 7, Day 14.

---

**SEQUENCE A — PRIYA (VP/Director Procurement, economic buyer)**

**A1. Day 0**

> **Subject:** Your next audit finding on vendor evaluation
>
> [first_name],
>
> Procurement teams at [industry] companies your size (500–5,000 FTE) run 4–12 software evaluations a year, almost all in spreadsheets, SharePoint folders, and a PowerPoint authored the weekend before exec review.
>
> Two-thirds of those evaluations produce an auditor finding within 24 months — missing decision documentation, inconsistent scoring, or no traceable rationale for why Vendor A was picked over Vendor B on a specific requirement.
>
> Sourcera is the operating system for enterprise software procurement. A fixed 13-phase pipeline enforces discipline. An AI co-pilot handles the administrative overhead. Every decision produces a SHA-256 hashed Selection Record — the exact artifact an auditor asks for.
>
> Unlimited seats on every paid tier. Vendors respond to your invites free, forever. From $299/mo annual.
>
> Worth 15 minutes to see it?
>
> [founder_name]
> Founder, Sourcera
> [cal_url_30min]

**A2. Day 3**

> **Subject:** The 10-hour PowerPoint
>
> [first_name],
>
> Quick follow-up. The number I keep hearing from Procurement VPs in [industry] is "the 10-hour PowerPoint" — the Sunday-before-exec-review deck that reconstructs the evaluation from scratch because nothing else is exportable.
>
> Sourcera's Selection Report generates from your scoring data, TCO model, disagreement cards, and policy traceability the day you close the evaluation. Two-page executive summary, full vendor scorecards, complete audit trail. PDF in one click.
>
> Short video (2 min): [loom_url]
>
> Want me to send the sample PDF?
>
> [founder_name]

**A3. Day 7**

> **Subject:** 120 hours × $100/hr per evaluation
>
> [first_name],
>
> Back with a math check. A typical mid-market evaluation touches 5–9 stakeholders and consumes 120–180 cross-functional labor hours. At a $100/hr blended loaded rate (Procurement at $80, Legal at $180, InfoSec at $140, line-of-business at $70), that's $12K–$18K per evaluation in direct labor alone.
>
> Business Starter is $299/mo annual — $3,588/yr. Pays for itself in the first evaluation.
>
> Business Growth at $799/mo annual pays for itself in the first quarter.
>
> Not urgent if you're not actively evaluating — but if there's something on your plate in Q2/Q3, the free tier lets you start without a procurement battle. One active evaluation, unlimited seats, $5 AI budget sized for one full Pre-Scoring run across 3+ vendors.
>
> [cal_url_30min]

**A4. Day 14**

> **Subject:** One question
>
> [first_name],
>
> Last note from me on this thread. One question: is there an evaluation on your team's plate right now where the scoring is being done in a spreadsheet?
>
> If yes, Sourcera's free tier runs that evaluation end-to-end. If not, I'll stop until something's relevant.
>
> Either way, thanks for your time.
>
> [founder_name]

---

**SEQUENCE B — MARCUS (VP/Director IT, technical champion)**

**B1. Day 0**

> **Subject:** Your evaluation stack is 6 tools
>
> [first_name],
>
> Your procurement team's evaluation workflow is probably: Excel for scoring, SharePoint for RFP responses, Outlook for vendor Q&A, PowerPoint for exec review, Word for the Selection Memo, and a Jira ticket at the end that loses context because it was written after the decision.
>
> Six uncontrolled surfaces. Zero integration between them. Every evaluation reconstructs the same workflow.
>
> Sourcera is one tool. Fixed 13-phase pipeline, AI Agent embedded as infrastructure (not a feature), Jira/Linear/Azure DevOps/Salesforce post-Phase-13 export, WorkOS SSO, domain governance that blocks shadow-IT Orgs.
>
> Unlimited seats. From $299/mo annual. API add-on $99/mo.
>
> 15 minutes?
>
> [founder_name]
> [cal_url_30min]

**B2. Day 3**

> **Subject:** Your engineers don't want another tool — this replaces five
>
> [first_name],
>
> The IT objection I hear most: "I don't want another tool to onboard my team into."
>
> Fair. But: Sourcera isn't adding a stack — it replaces the SharePoint + Outlook + Excel + PowerPoint + Word workflow your procurement team runs today. The net-new attack surface is smaller, not larger.
>
> Technical details: Cmd+K command palette, J/K keyboard nav (Linear-benchmark), optimistic mutations, WorkOS SSO/SCIM at Enterprise, bi-directional webhooks with HMAC-SHA256 + DLQ, REST API at Business, SOC 2 Type II on 12-month roadmap.
>
> Full SPA package on request. Worth a look?
>
> [loom_url]

**B3. Day 7**

> **Subject:** IT Team horizontal track
>
> [first_name],
>
> One feature specifically for IT: the IT Team is a horizontal track across every active Workspace. Write one Custom Agent Instruction — *"flag any vendor response that mentions single-tenant hosting"* — and it applies across every evaluation the org runs. One rule, one place, enforced on save in under 60 seconds.
>
> Same for InfoSec (theirs). Same for Legal (theirs).
>
> No more re-reviewing the same SOC 2 across six evaluations.
>
> Quick demo?
>
> [cal_url_30min]

**B4. Day 14**

> **Subject:** The Jira export at Phase 13
>
> [first_name],
>
> Final note. One concrete integration: when an evaluation closes at Phase 13, Sourcera exports the selection outputs to Jira / Linear / Asana / Azure DevOps as structured implementation tickets. Your engineering team receives a real handoff instead of a Slack message saying "we picked X."
>
> If this is relevant on your side, [cal_url_30min]. Otherwise, best of luck this quarter.
>
> [founder_name]

---

**SEQUENCE C — ELENA (CISO, compliance gatekeeper)**

**C1. Day 0**

> **Subject:** Upload NIST 800-53 once
>
> [first_name],
>
> Your team reads the same SOC 2 report across 6 evaluations per year. Your Custom Agent Instructions live in a Google Doc. Your review queue is the critical path on every vendor selection.
>
> Sourcera's Policy-Powered Requirement Generation lets you upload NIST 800-53, ISO 27001, or SOC 2 once. The Agent extracts structured requirements with policy-source traceability. When a policy updates, affected requirements flag automatically across every active evaluation.
>
> Forty hours saved per evaluation on compliance translation, by my math. Your InfoSec team stops being the bottleneck.
>
> [cal_url_30min]
>
> [founder_name]

**C2. Day 3**

> **Subject:** InfoSec Team as a horizontal track
>
> [first_name],
>
> Quick concrete one: your InfoSec Team operates as a horizontal track across every evaluation. Triage queue, SLA enforcement, Custom Agent Instructions. You write *"flag any vendor response mentioning shared-tenant hosting or non-approved subprocessors"* once — it enforces across every evaluation in the org in under 60 seconds of save.
>
> Every AI output is confidence-scored, labeled [AI-Generated], and requires explicit user confirmation. Rejected outputs bill at cost — not value — so Sourcera's economic incentive is aligned with your quality bar.
>
> Data residency: US / EU / custom. SOC 2 Type II 12-month roadmap. Full SPA package on request.
>
> Worth 20 minutes to walk through?

**C3. Day 7**

> **Subject:** Traceability matrix for your auditor
>
> [first_name],
>
> One artifact: the Selection Report includes a Traceability Matrix — every compliance requirement → source policy control → vendor response → score → rationale. SHA-256 hashed. Append-only grade history preserved.
>
> Your auditor has been asking for this. We ship it by default.
>
> Sample PDF on request, or [cal_url_30min] to see it live.
>
> [founder_name]

**C4. Day 14**

> **Subject:** One question for your vendor-risk review
>
> [first_name],
>
> Last note. If your team ever needs a tool that makes it *easier* to demonstrate vendor-evaluation rigor to an auditor, we're that tool. If not, no action needed.
>
> Either way — [founder_name]@sourcera.com if anything comes up.

---

**SEQUENCE D — DAN (CFO/VP Finance, economic approver)**

**D1. Day 0**

> **Subject:** Your next $1M software purchase
>
> [first_name],
>
> The TCO analysis on your next $1M software purchase is probably being built in a spreadsheet by a procurement analyst who will change three assumptions before exec review. It will end at year 1 because year-3 modeling is a pain in Excel.
>
> Sourcera's TCO Modeling is a first-class Use Case type — six structured pricing schemas (flat, tiered, one-time, percentage-of-license, estimate-range, discount), multi-year projections with configurable horizons, seat trajectories, implementation + support + training + overage decomposed per vendor.
>
> You see apples-to-apples cost comparisons before the vendor is selected, not after.
>
> Business Starter $299/mo annual. Business Growth $799/mo. Enterprise custom at $3K floor. No per-seat pricing — unlimited Finance, Procurement, Legal, InfoSec, IT seats at zero marginal cost.
>
> 20 minutes?
>
> [founder_name]
> [cal_url_30min]

**D2. Day 3**

> **Subject:** Wallet overage is off by default
>
> [first_name],
>
> The AI-spend-forecasting question I get from Finance teams: "what stops this from being another variable line item."
>
> Answer: wallet overage is off by default on every plan. AI budget is capped at the plan ($5 Free / $50 Starter / $300 Growth / $800 Scale). Exceeding it doesn't trigger overage unless the Billing Admin explicitly enables the wallet and sets a monthly cap. Soft cap at 80% emails the Billing Admin + Org Owner. Hard cap blocks ops cleanly.
>
> AI priced in value-dollars, not tokens. If Anthropic raises prices, Sourcera absorbs the variance.
>
> Full Usage Dashboard: per-capability spend, acceptance rate, top consumers.
>
> Worth a look?

**D3. Day 7**

> **Subject:** Scenario Modeling
>
> [first_name],
>
> One CFO feature: Scenario Modeling. Overlay "what if seat growth runs at 20% instead of 10%" — watch rankings shift without rebuilding the spreadsheet. 10 scenarios on Business, 50 on Enterprise. Budget variance stays defensible because the model is preserved in the Selection Record.
>
> Short walkthrough?
>
> [cal_url_30min]

**D4. Day 14**

> **Subject:** One line on ROI
>
> [first_name],
>
> Final note. A mid-market evaluation consumes 120–180 cross-functional labor hours at a $100/hr blended rate = $12K–$18K per evaluation. Starter at $3,588/yr pays for itself in the first one.
>
> If that math is useful, [cal_url_30min]. Otherwise, best of luck.
>
> [founder_name]

---

**SEQUENCE E — JORDAN (Procurement Specialist, champion)**

Jordan is the highest-velocity route because they run the evaluation day-to-day and will champion Sourcera internally to Priya. The sequence is shorter, more concrete, and less exec-pitched.

**E1. Day 0**

> **Subject:** Stop chasing Legal by email
>
> [first_name],
>
> You're the one running evaluations day-to-day. Your calendar is 40% meetings asking "where are we" and 60% actual work. The Selection Report always gets written the weekend before exec review.
>
> Sourcera's SLA timers escalate automatically: 80% warning to owner, 100% to Team Lead, 125% to Workspace Owner, 150% auto-reassignment. You stop having to chase.
>
> Free tier runs one evaluation end-to-end. Unlimited seats. Starter is $299/mo annual when your team is ready.
>
> [cal_url_30min]
>
> [founder_name]

**E2. Day 3**

> **Subject:** Real-time collaborative scoring
>
> [first_name],
>
> Related: real-time collaborative scoring. Your team members grade simultaneously with live presence — Linear-style. No more "chase people for scores" cycle. Scoring disagreements ≥0.3 variance auto-flag for the Use Case Lead. The Agent pre-scores every qualitative requirement; reviewers accept or override.
>
> Cmd+K command palette navigates every entity. This is your productivity multiplier.
>
> Want to see it on your next evaluation?

**E3. Day 7**

> **Subject:** Make it your idea
>
> [first_name],
>
> Totally candid: Sourcera replaces a workflow your VP of Procurement probably doesn't know is costing your team 120+ hours per evaluation. The pitch to your leadership is an easier one if *you* bring it in with numbers.
>
> I'll help you. Free tier lets you pilot the next evaluation. I'll hand you an internal one-pager that makes the ROI math for your VP in 90 seconds.
>
> Want the one-pager?

**E4. Day 14**

> **Subject:** The one-pager
>
> [first_name],
>
> If you want the internal business-case one-pager, reply "send it" and I will. No form, no demo required.
>
> [founder_name]

#### 2.1.3 The Warm Intro Playbook — Procurement Communities and Integration Partners

Cold outbound is never the highest-leverage buyer prospecting channel. Warm intros via procurement communities and product integration partners are.

**Procurement community nodes — active membership required (founder presence, not passive):**

| Community | Channel | What the founder does |
|---|---|---|
| **Pavilion** | Slack + events | Post weekly in `#procurement-leaders` and `#finance-leaders`. Answer procurement-tool questions without pitching. Comment on member posts. Run a 30-min "office hours" once a month offering procurement-tech perspective. |
| **ProcurementFoundation** | Slack | Daily active. Answer specific tooling questions with non-product framing. Host a monthly AMA on "the operating system for enterprise software procurement." |
| **Buyers Meeting Point** | Slack + LinkedIn | Weekly LinkedIn commentary on members' posts. |
| **Spend Matters community** | Comments + LinkedIn | Comment on every article. Write guest pieces 1–2/quarter. |
| **ISM (Institute for Supply Management)** | LinkedIn groups + events | Attend every regional event. Sponsor a table at ISM World once scale allows. |
| **CIPS** | LinkedIn + events | Dominant in UK/EU — secondary for Year-1. |

**Warm intro request template (when a community member posts a relevant pain):**

> [first_name] — saw your post about [specific_pain]. We built Sourcera for exactly this. Happy to share a quick walkthrough — no pitch, just a 15-minute peer conversation. If not useful for you personally, I'd love to know who on your team runs evaluations day-to-day — I'd rather reach the right person than blast LinkedIn.

**Integration partner warm intros (second vector):**

Every customer who integrates with Jira, Linear, Asana, Azure DevOps, Salesforce, Slack, or Teams is running post-Phase-13 exports into a tool owned by a partner. The partner can route warm buyer intros back.

| Partner | Approach |
|---|---|
| **Linear** | Submit to Linear's integration directory. Reach Linear's partnership lead via LinkedIn — pitch: "your customers run 4+ software evaluations/yr and would be delighted by Sourcera's post-Phase-13 Linear export." Ask for 1–2 customer warm intros. |
| **Jira / Atlassian Marketplace** | Ship a Jira app for the Phase-13 export. Listed in marketplace = inbound SEO + partner intro flow. |
| **Salesforce AppExchange** | Ship a Salesforce managed package for CRM Sync (seller-side) and Phase-13 export (buyer-side). AppExchange listing drives warm intros from Salesforce AEs to their procurement contacts. |
| **Slack** | Official Slack App Directory listing. High passive traffic. |
| **WorkOS** | SSO partner. WorkOS has a customer list that maps perfectly to Sourcera's Enterprise ICP. Request joint-customer warm-intro program after first 3 WorkOS-authenticated Enterprise customers. |

**Pitch to integration partners (email to partnership lead):**

> Hi [partner_lead_name],
>
> I'm [founder_name], founder of Sourcera — the operating system for enterprise software procurement. We replace the Excel + SharePoint + Outlook + PowerPoint workflow that 90% of mid-market procurement teams still run.
>
> Sourcera's post-Phase-13 export routes selection outcomes into [partner_product] as structured implementation tickets. Your customers (mid-market, regulated, 500–5,000 FTE) are directly in our buyer ICP.
>
> Three asks, in order:
>
> 1. We'd love to ship a native [partner_product] integration and list it in your marketplace. Happy to follow your technical cert process.
> 2. Would you be open to a partner-sourced warm-intro program once we've shipped the integration? Our side: any Sourcera customer on [partner_product] becomes a mutual reference. Your side: 1–2 warm intros per quarter to procurement leaders at your mid-market accounts.
> 3. Co-marketed webinar in the next quarter on "modernizing software evaluation" with both brands on the invite.
>
> Happy to jump on a 30-minute call to scope any or all. My calendar: [cal_url].
>
> [founder_name]

#### 2.1.4 Conference / Event Strategy

**Year-1 conferences — attend, do not sponsor:**

| Event | Frequency | What the founder does |
|---|---|---|
| **ProcureCon Indirect** | 1x/yr (usually June) | Attend full event. Pre-event: email 50 attendees from the public list with *"would love 15 min at ProcureCon — no sales, just peer conversation."* Target: 20 on-site meetings. Post-event: connect with everyone met, structured follow-up sequence. |
| **ISM World** | 1x/yr (spring) | Same pattern. Larger event; focus on the Technology Hub track. |
| **Ardent Partners CPO Rising Summit** | 1x/yr | Concentrated mid-market procurement audience. High value. |
| **Gartner Security & Risk Management Summit** | 1x/yr | CISO-heavy. Warm-intro factory for Enterprise-track deals. |
| **RSA Conference** | 1x/yr | Security-heavy. Worth 2 days — walk the floor, meet CISOs at evening events. |
| **SaaStr Annual** | 1x/yr | Mixed-use: seller-side prospecting (VP Sales) + buyer-side SaaS company procurement teams. |
| **Pavilion CMO Summit / CRO Summit** | 2x/yr | Good for seller-side VP Sales and pre-sales personas. |

**Year-2 — consider sponsoring one:**

Sponsor one event in Year 2 — the one with the highest ICP density and warmest inbound: likely **ProcureCon Indirect** or **Ardent Partners CPO Rising**. Booth ROI is negative at founder-led scale; sponsor only for the speaker slot and attendee list.

**On-site playbook at every event:**

1. **Pre-event (T-4 weeks):** Scrape or request public attendee list. Filter to ICP. Send personal email to 50 top targets offering a 15-min on-site meeting.
2. **Pre-event (T-1 week):** LinkedIn message to every targeted attendee who has not responded.
3. **Day 0 AM:** Arrive, pick a coffee spot, set up 45-min on-site meeting blocks.
4. **On-floor:** Do not tour the expo floor passively. Attend only the 3 sessions most relevant to ICP. Everything else is corridor conversations.
5. **Evening events:** Attend the sponsor happy hours — density is high, conversation is qualified.
6. **Post-event (T+2 days):** Write one LinkedIn post recapping the event with a specific ICP-relevant insight. Tag 5 people met.
7. **Post-event (T+5 days):** Personalized follow-up email to every person met. Calendar link for a 30-min demo. Attach the 2-min Loom async demo.

### 2.2 INBOUND (50% of Buyer Sales Time — ~8 hours/week)

Inbound feeds from two sources: PLG (Free tier signups → PQL scoring) and content (SEO, podcast, newsletter, category content — M9/M11/M12 loops).

#### 2.2.1 PQL Identification and Prioritization

Buyer PQL scoring (§7.1 PLG Architecture) runs hourly. The founder triages PQLs every morning at 08:00. PQL score thresholds:

- **Score ≥ 50 (Qualified Lead):** Automated nurture activates. Founder reviews weekly, no immediate personal outreach.
- **Score ≥ 100 (Hot Lead):** Founder personal outreach within 48 business hours. This is the core inbound workflow.
- **Score ≥ 150 (Enterprise Lead):** Founder outreach within 24 hours. Routes to Enterprise pipeline with different messaging.

**Score-100 trigger pattern examples (most common signal clusters):**

| Trigger pattern | Interpretation | Routing |
|---|---|---|
| First Pre-Scoring run completed (25) + AI budget ≥60% consumed (20) + visited pricing page (10) + vendors-tracked ≥20 of 25 (10) = 65 | Buyer actively using Free, hitting ceilings, shopping upgrade | Starter demo track |
| M1 invite sent (15) + Phase 9 entered (10) + ≥3 capability calls (10) + AI budget ≥80% (15) + first Pre-Scoring (25) = 75 | Real evaluation in motion, nearing budget wall | Starter demo with Growth upsell ready |
| Opus capability gated (30) + pricing visit (10) + first Pre-Scoring (25) + M1 invite (15) + M1 acceptance rate ≥40% (5) + 3+ capability calls (10) = 95 | Power user who needs Policy Parsing / Deep Comparison | Growth demo track |
| SSO requested OR DPA requested (40) + anything ≥ 60 = 100+ | Enterprise-route trigger | Enterprise pipeline, 24h SLA |

#### 2.2.2 First-Touch Email for Buyer PQL ≥ 100

Send from `[founder]@sourcera.com` (not the outbound `.io` domain — this is a customer, warm).

**Subject lines (rotate by trigger):**

- If first Pre-Scoring completed: `Saw you ran your first Pre-Scoring on [company]`
- If M1 invite sent: `Saw your evaluation is live — wanted to check in`
- If AI budget ≥80%: `You're near your Free-tier AI budget — quick thought`
- If Opus capability gated: `Noticed you tried Policy Parsing — here's what unlocks it`

**Body (template — customize the opener per trigger):**

> [first_name],
>
> [founder_name] here, founder of Sourcera. Not an automated note — I saw your activity on your [company] account and wanted to reach out personally.
>
> [Trigger-specific line, one of:]
> — *You ran your first Pre-Scoring across [N] vendors this morning. How did the suggested grades land vs. what your team would have given manually?*
> — *Your evaluation on [workspace_name] is in Phase [N]. I'd love to hear what's working and what's not.*
> — *You're at [X]% of your Free-tier AI budget for this cycle. Quick question: is the constraint AI spend or evaluation count?*
> — *You tried [capability_name] — that's one of our Opus-tier capabilities gated behind paid plans. Want me to unlock it for a single evaluation so you can see the output before you decide?*
>
> Two reasons I reach out personally at this point:
>
> 1. I'd like to make sure the Free tier is actually delivering value on your evaluation. If something's blocking you, I want to know before you decide to churn or upgrade.
> 2. If upgrading to Starter ($299/mo annual) or Growth ($799/mo annual) would obviously unblock you, I can answer any question in 15 minutes — cheaper for both of us than you reading docs.
>
> Here's my calendar: [cal_url_30min]. If not, a reply-email back works too.
>
> [founder_name]

#### 2.2.3 First-Touch Call Script (if PQL also has phone number from enrichment)

Call attempt is optional; email-first is the default. If calling:

> *"Hi, is this [first_name]? This is [founder_name] from Sourcera — the procurement evaluation tool you signed up for on [date]. Is this a bad time for 90 seconds? ... [if OK] ...
>
> "Quick reason for the call: I noticed you [trigger_event] this week. I'm the founder, and at this stage I personally check in with every active Free-tier account to make sure the tool is working for you. One question: what's the evaluation you're running this against, and what's the single biggest headache so far?
>
> "...[listen]...
>
> "Makes sense. Here's what I'd suggest: [specific_feature_or_upgrade_path]. Happy to walk you through it live — my calendar's [cal_url]. Or if you want, I can shoot over a 2-minute Loom showing exactly how that works for your case."*

Track every call in CRM with a transcript summary and next step. Do not leave voicemails more than once per PQL — it degrades trust.

#### 2.2.4 Finding the Economic Buyer When the PQL Is an Individual Contributor

The PQL is usually Jordan (procurement analyst) or an equivalent IC. The economic buyer is Priya (VP Procurement) or — in larger deals — the CFO. The IC cannot authorize paid plans.

**The economic-buyer hunt — three-step sequence:**

**Step 1:** After the first-touch call or demo with the IC PQL, *explicitly ask* in the follow-up email:

> [first_name],
>
> Thanks for the time today. Based on what we covered — Starter at $299/mo annual or Growth at $799/mo annual — the next step is bringing in whoever signs off on procurement tooling budget on your side.
>
> Two options:
>
> 1. I send you a one-pager your VP of Procurement can read in 90 seconds. You forward it. If they want a call, great; if not, we keep you on Free for now.
> 2. You intro me directly to your VP. I run a 15-minute exec walkthrough focused on the audit-trail and Selection Record side (which is what a VP cares about). You're in the call but not driving it.
>
> Preference?

**Step 2:** If the IC chooses option 1 (more common), send the one-pager within 30 minutes. See §2.2.5 below.

**Step 3:** If the IC chooses option 2, run the exec walkthrough. Different demo path — 15 minutes, persona-focused on Priya's pains: audit findings, SLA chasing, Selection Record defensibility, cross-functional participation. See §5.4 for the Priya demo path.

**Fallback — if the IC does not respond for 5 business days:**

> [first_name] — no pressure, but I wanted to make sure the one-pager didn't get lost. Want me to reach out directly to [VP_name] with a brief note that references your conversation?

This gives the IC a graceful exit and gives the founder permission to do direct outreach with the champion's name attached.

#### 2.2.5 The One-Pager for the Economic Buyer

Generate a PDF one-pager dynamically per account. Stored as a template. Contains:

```
SOURCERA — BUSINESS CASE FOR [COMPANY NAME]
Prepared for: [VP Procurement name]
Prepared by: [Jordan, your team member] via Sourcera
Date: [auto]

THE CURRENT STATE
- [Company] runs ~[X] software evaluations per year [inferred from company size]
- Estimated time per evaluation at current process: 120–180 cross-functional labor hours
- Blended loaded rate: ~$100/hr = $12K–$18K per evaluation in direct labor
- Projected annual labor cost on evaluation: $48K–$180K

THE SOURCERA PROPOSAL
- Tier: Business [Starter / Growth / Scale — inferred from volume]
- Annual cost: $[3,588 / 9,588 / 23,988]
- Unlimited seats across Procurement, Legal, InfoSec, IT, Finance, end users

EXPECTED OUTCOMES (YEAR 1)
- Evaluation cycle time: 6–12 weeks → 4–6 weeks
- Time saved per evaluation: 30–50% (documented via in-product Time-Saved Baseline)
- Audit-ready Selection Record: generated day of close, not weekend before exec review
- Policy translation effort: 40 hours saved per evaluation (SOC 2 / NIST / ISO uploaded once)

RISK MITIGATION
- Free tier covers one active evaluation with full feature set. Pilot risk: $0.
- Wallet overage: off by default. No bill shock.
- Data residency: US / EU / custom at Enterprise. SOC 2 Type II on 12-month roadmap.
- Full KB and data export at every tier, including Free.

NEXT STEP
15-minute executive walkthrough with [founder_name], Sourcera founder.
Calendar: [cal_url]
```

### 2.3 PARTNER / CHANNEL (20% of Buyer Sales Time — ~3 hours/week)

#### 2.3.1 Integration Partners as Referral Sources

**Jira / Atlassian.** Ship the Atlassian Marketplace app for Phase-13 export. Every app install = a warm buyer-side account. Partner pitch:

> Your mid-market procurement customers currently dump RFP outcomes into Jira tickets manually. Sourcera's Phase-13 export turns a Selection Record into structured Jira epics with requirements traced back to source policy. 30-minute co-marketed webinar would demo this end-to-end for 100+ joint-customer procurement teams. Available for scheduling in the next 90 days.

**Linear.** Smaller install base, more-engineering-forward customers. Sourcera's fixed-phase-gate language echoes Linear's workflow philosophy. Pitch to Linear's partnerships lead directly.

**Salesforce AppExchange.** Managed package ships both Phase-13 export AND seller-side CRM Sync. AppExchange listing = passive inbound from Salesforce AEs to their own procurement and sales-ops contacts.

**Slack / Microsoft Teams.** Directory listings. Passive traffic. Zero ongoing effort after shipping.

**WorkOS.** Core SSO provider. Once Enterprise customer #3 is live on WorkOS, request joint-customer warm-intro program. WorkOS's customer roster maps cleanly to Sourcera's Enterprise ICP (SSO-mandatory orgs).

#### 2.3.2 Procurement Consulting Firms and Advisors

Procurement advisory firms see every tool their clients consider. Getting in front of 5 advisors is 500 warm-intro-eligible prospects.

**Target list (Year-1):**

- **The Hackett Group** — large; hard to break in; start with individual procurement practice leaders on LinkedIn.
- **Ardent Partners** — mid-market procurement-heavy; run the CPO Rising conference. Highest-leverage first target.
- **Proxima** — UK/EU focused; hold for Year-2 unless an EU deal emerges.
- **Source One / Corcentric** — procurement-services firm with extensive mid-market relationships.
- **Independent advisors on LinkedIn** — search "procurement advisor" + "consultant" + "strategy" with 5K+ followers. Target 20 named individuals.

**Advisor pitch (cold email, customized per advisor):**

> [first_name],
>
> Your [publication_or_post] on [specific_topic] is the clearest framing of the evaluation-workflow problem I've read. I'm [founder_name], founder of Sourcera — the operating system for enterprise software procurement.
>
> Two asks:
>
> 1. 30-minute conversation about what you're seeing in your mid-market advisory work. I'm building against your customers' pain and your field view is more important than my survey data.
>
> 2. If and when Sourcera is relevant to a specific engagement, we offer advisor programs: free access for advisors (Scale-tier features), 15% referral revenue share on any client subscription, and advisor-only dashboard access to their clients' evaluation analytics.
>
> Calendar: [cal_url]. Zero obligation on either request.
>
> [founder_name]

**The advisor program — structured:**

- **Advisor Access:** Free Sourcera Scale-tier for the advisor's personal org. $0 cost. Activated on signed mutual NDA.
- **Referral Revenue Share:** 15% of first-year ARR on any client the advisor refers. Paid quarterly. Requires the advisor to make the intro email on record (CC'd).
- **Client Analytics Dashboard:** Read-only dashboard where the advisor sees their clients' evaluation activity (with client consent). Turns Sourcera into an advisor's reporting tool.
- **Co-marketed Content:** One joint webinar or whitepaper per quarter per advisor.

**Expected output from 10 engaged advisors:** 3–5 warm intros per quarter = 12–20 qualified buyer leads/yr with near-zero outreach overhead.

---

## SECTION 3 — SELLER-SIDE SALES STRATEGY

The seller motion is structurally different from the buyer motion. Most seller leads arrive via PLG forced-signup (M1/M5/M15/M17). Direct cold outbound exists only in two narrow bands: (a) Responsive/Loopio customers with imminent renewals, and (b) high-RFP-volume vendors in seed categories (§1.3.1 Positioning) that have not yet been invited by any Sourcera buyer.

### 3.1 Monitoring High-Value Seller PQLs

Seller PQL scoring (§7.2 PLG Architecture) runs hourly. The founder reviews seller PQLs at 08:15 every weekday morning (right after buyer PQLs).

**Score-100+ signal cluster examples (highest-priority seller PQLs):**

| Cluster | Score composition | Interpretation | Action |
|---|---|---|---|
| Forced-Signup hot | Bid submitted (25) + Stake reveal dwell (10) + Outcome debrief viewed (10) + KB ≥48 (20) + second concurrent bid invite (30) + M5/M15/M17 origin (10) = 105 | Forced-Signup seller on second invited bid with significant KB investment | Hot lead — founder outreach within 48h. "Second invite" play. |
| EOI intent | KB ≥40 (15) + EOI attempted (30) + numeric Match Score gate hit (20) + Marketplace browse sessions (5) + bid closed (20) = 90 | Ambitious seller — wants outbound Marketplace tooling | Starter demo with Growth upgrade-adjacent messaging |
| KB ceiling | KB ≥48 (20) + KB ceiling modal shown (30) + Ghost-Bid import (10) + bid submitted (25) + M1 origin (10) = 95 | KB-invested seller at ceiling | Starter-forward close message |
| Enterprise-route | SSO requested (40) + AI budget projecting ≥$12K/yr (35) + any activation ≥ 30 = 100+ | RFP Center of Excellence | Enterprise track, 24h SLA |
| CRM sync intent | CRM Sync setup attempted (25) + bid closed (20) + KB ≥40 (15) + closed bid count (20) + Marketplace activity (5) + accepted-op rate ≥70% (5) = 90 | Power user — ready for Growth | Growth demo track |

**Daily triage cadence:**

1. Sort seller PQLs by score descending.
2. Score ≥ 100 → personal founder outreach today, <48h.
3. Score ≥ 50 & <100 → automated nurture activates. Tagged in CRM for weekly review.
4. Any PQL with `seller_concurrent_bid_limit_hit` in last 72h → immediate outreach regardless of total score (§3.2 below).
5. Any PQL with `seller_sso_requested` or `seller_dpa_requested` → Enterprise-track routing, 24h SLA.

### 3.2 The "Second Invite" Outreach Play — Conversion Moment #1

This is the single highest-converting seller outreach play. A Forced-Signup seller receives a second buyer invite while their first bid is still in flight. They have concrete urgency ("my deal is at risk") and existing Sourcera engagement. Founder outreach within 2 hours of the `seller_concurrent_bid_limit_hit` event is the target.

**PostHog alert wires to founder Slack. Founder responds:**

**First-touch email (send within 2h of event):**

> **Subject:** A second buyer just invited you on Sourcera
>
> [first_name],
>
> [founder_name] here, Sourcera founder. Quick note — you just hit a ceiling: a second buyer invited you while your [first_buyer_name] bid is still in flight. On Free, you can run one concurrent bid at a time. Switching between them is painful and risks both.
>
> Three options, in order of what I'd suggest:
>
> 1. **Upgrade to Starter** ($149/mo annual). 3 concurrent bids, 1,000 KB entries, 2 Firecrawl sources, $30 AI budget. Your existing KB and in-flight bid carry over — nothing to rebuild. You respond to both buyers in parallel.
>
> 2. **Keep your first bid active, decline the second.** No lost cost, but you're declining a real inbound demand signal.
>
> 3. **Submit your first bid quickly and start the second.** Only viable if the first is close to complete.
>
> Happy to jump on a 15-minute call and walk through your specific case. My calendar: [cal_url_20min_seller]. Or reply-email.
>
> [founder_name]

**If no reply in 48h — second touch:**

> [first_name],
>
> Following up on the Sourcera note. The second buyer invite is still open — you can see it in your Bid Workspace under "Pending." If your response deadline on the first bid is close, I'd hate for you to miss the second.
>
> Reminder on Starter: 3 concurrent bids, 1,000 KB entries, 2 Firecrawl sources (your site crawled weekly so KB stays current), $30 AI budget per month, Verified tier eligibility, 10 outbound EOIs per month, 5 SellerSoftware entities, 25 Capability Declarations, 1 Seller Page Enrichment per year, monthly category Seller Signals digest. $149/mo annual.
>
> If any of those specifically unlock a deal you're working — let me know. If not, your first bid keeps running and nothing breaks.
>
> [founder_name]

**Outcome expectations:** ~40% conversion rate to paid on seller PQLs at Conversion Moment #1 with this outreach pattern (per §48.1.7 / §48.8.6; pricing authority in §34). Do not skip this play — it is the most valuable 4 hours of the founder's week.

### 3.3 Direct Outreach to Responsive / Loopio Customers

**Target:** Vendors currently on Responsive (formerly RFPIO) or Loopio with renewals in the next 90 days. The positioning is 4× cheaper with Marketplace discovery bundled (§4.2 Positioning). This is the only buyer-side-style cold outreach that runs on the seller motion.

**Finding target list:** Trigger signals — LinkedIn posts mentioning Responsive/Loopio, job postings for "RFP Manager" mentioning Responsive/Loopio, BuiltWith/G2/Crossbeam tech-stack data, attendees of Responsive's RFPtech conference, Loopio's Pipeline Performance webinars. Build a list of 300–500 named accounts over 90 days.

**The "renewal window" pitch is the unlock.** Responsive/Loopio contracts are typically annual; vendors re-evaluate 60–90 days before renewal.

#### 3.3.1 Cold Email Sequence — Responsive/Loopio Customer, 4 Emails

**R1. Day 0**

> **Subject:** 4× cheaper than Loopio. Marketplace included.
>
> [first_name],
>
> I'm [founder_name], founder of Sourcera. Reason for the note: you're on Loopio (or Responsive) and paying $15K–$35K/yr for a response-management tool.
>
> Sourcera Growth at $499/mo annual — $5,988/yr — ships:
>
> — KB automation with daily Firecrawl crawling (Loopio: yes)
> — First-Pass RFP response drafting with inline citations (Loopio: add-on)
> — CRM Sync to Salesforce / HubSpot / Dynamics / Pipedrive (Loopio: limited)
> — **A Vendor Discovery Marketplace with buyer EOI workflow (Loopio doesn't ship this)**
> — Numeric Match Scoring on Marketplace listings
> — Weekly Seller Signals digest (k-anonymized buyer intent)
> — Outcome-accounted AI pricing — rejected AI outputs cost you nearly nothing
>
> 3× cheaper on cost, with Marketplace demand capture and CRM Sync that Loopio doesn't ship.
>
> Is your Loopio renewal in the next 90 days?
>
> [cal_url_20min_seller]
>
> [founder_name]

**R2. Day 3**

> **Subject:** Your KB doesn't need to stay in Loopio
>
> [first_name],
>
> Quick follow-up. The concern I hear from Loopio customers considering a move: *"our KB is in there."*
>
> Sourcera's migration path:
>
> 1. Export your Loopio KB to JSON/CSV (Loopio supports this).
> 2. Upload to Sourcera — bulk import handles the schema translation.
> 3. Firecrawl crawls your public surfaces (docs, trust center, website) daily to keep everything current.
> 4. Your first bid inside Sourcera uses the migrated KB. You review and approve entries — our confidence scoring learns from your accept/reject signals.
>
> First KB Bootstrap is free (lifetime). Ghost-Bid Importer lets you paste historical RFPs and seed the KB with structured entries. First Ghost-RFP Ingestion is free per Seller Org.
>
> Transition is typically 4–8 hours of setup, not weeks. Happy to walk through.
>
> [cal_url_20min_seller]

**R3. Day 7**

> **Subject:** The Marketplace argument
>
> [first_name],
>
> Here's the argument that usually tips the scale vs. Loopio: the Marketplace is a new demand channel.
>
> On Sourcera Growth (unlimited EOIs), your sales team sees buyer-published evaluations in active 13-phase pipelines and submits EOIs directly. If accepted, you enter the buyer's evaluation as a fully-scoped vendor — not as an inferred-intent "warm account" from 6sense or Bombora.
>
> That's qualified evaluation intent, not behavioral intent. Different funnel stage.
>
> On top of RFP response tooling — at one-third the price of your current Loopio spend.
>
> Quick 20-min walkthrough?
>
> [cal_url_20min_seller]

**R4. Day 14**

> **Subject:** One more
>
> [first_name],
>
> Last note. Two things to bookmark for your renewal window:
>
> 1. Sourcera Growth is $5,988/yr all-in with Marketplace demand, daily KB crawl, and CRM Sync to your CRM.
> 2. Free-forever Seller Profile is published the day you sign up — even before you decide to buy.
>
> If your renewal is 30+ days out, I'll stop here. Otherwise, 20 minutes and I'll show you the migration path end-to-end.
>
> [cal_url_20min_seller]
>
> [founder_name]

### 3.4 Seller-Side Cold Email Sequences — Three Personas × Four Emails

Four-email sequences for the three seller personas identified in `GTM_POSITIONING.md` §3: Sam (VP Sales / Head of Partnerships — economic buyer, Organic path), Aisha (Sales Engineer / Head of Pre-Sales — technical champion), Leo (RFP Manager / Proposal Manager — primary user, Forced or Organic).

---

**SEQUENCE F — SAM (VP Sales / Head of Partnerships, Organic path)**

**F1. Day 0**

> **Subject:** Your SE team spends 15 hrs/wk on RFPs
>
> [first_name],
>
> Two questions for a 30-second gut check:
>
> 1. Is your SE team spending more than 10 hours a week on RFP responses?
> 2. Have you lost a deal in the last 6 months specifically on response latency?
>
> If yes to either, Sourcera's worth 20 minutes. We draft first-pass RFP responses from your own website content — KB auto-bootstrapped on signup, Firecrawl crawling your docs daily, inline citations on every draft row.
>
> Plus: Marketplace demand capture (buyers publish evaluations; your team submits EOIs), CRM Sync to Salesforce / HubSpot / Dynamics / Pipedrive, Seller Signals digests, Match Scoring.
>
> $149/mo annual Starter. $499/mo Growth. 3–4× cheaper than Loopio; structurally more valuable.
>
> [cal_url_20min_seller]
>
> [founder_name]

**F2. Day 3**

> **Subject:** The Hero Moment
>
> [first_name],
>
> One concrete thing. When a buyer invites your team to respond to an RFP on Sourcera:
>
> — Inside the 30 seconds of SSO redirect latency, Sourcera crawls your public website, help center, and trust center.
> — 40–200 draft KB entries are proposed from your own content.
> — Responses are drafted for every buyer requirement, citing specific sentences from your own site.
> — Your AE lands on a bid that's 40–70% already answered.
>
> *"Your bid for [buyer_company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website. Review time: ~35 minutes."*
>
> Zero empty-workspace cold-start cost.
>
> 2-min video: [loom_url]

**F3. Day 7**

> **Subject:** CRM Sync
>
> [first_name],
>
> One more: CRM Sync (Growth+). Marketplace activity and bid events flow directly to your CRM Account records — bi-directional. Your AEs see "Sourcera — bid invitation accepted" as an activity line in Salesforce, same as any other touchpoint.
>
> No new pane of glass. No context-switching. Marketplace demand converts to pipeline where your AEs already live.
>
> Included on Growth ($499/mo annual).
>
> [cal_url_20min_seller]

**F4. Day 14**

> **Subject:** Your renewal math
>
> [first_name],
>
> Last note. If you're paying Loopio or Responsive today, your renewal math looks like:
>
> — Current spend: $15K–$35K/yr
> — Sourcera Growth replacement: $5,988/yr (1/3 to 1/5 the cost)
> — Net savings reinvestable in AE headcount: $9K–$29K/yr
>
> Plus: Marketplace demand your current tool doesn't ship.
>
> If you're not on Loopio/Responsive today, Sourcera Starter ($1,788/yr) replaces the copy-paste-from-last-year workflow entirely.
>
> [cal_url_20min_seller]
>
> [founder_name]

---

**SEQUENCE G — AISHA (Sales Engineer / Head of Pre-Sales)**

**G1. Day 0**

> **Subject:** Your SE team gets their demos back
>
> [first_name],
>
> Reason for the note: your SEs are writing technical RFP answers instead of running demos. And the same SOC 2 clause has three versions across four active RFPs because you don't have central KB infrastructure.
>
> Sourcera's KB Core: centralized repository for SOC 2, ISO certs, DPAs, pentest summaries with expiration dates, version chains, and auto-flagging of bids referencing superseded versions. Firecrawl crawls your website on your configured cadence (weekly on Starter, daily on Growth, real-time on Scale).
>
> Confidence decay on every entry. Cross-bid citation graph shows which KB entries close deals. Self-governing health model.
>
> $149/mo annual Starter. $499/mo Growth.
>
> [cal_url_20min_seller]
>
> [founder_name]

**G2. Day 3**

> **Subject:** Cite-before-state
>
> [first_name],
>
> SE concern I hear most: *"AI is going to hallucinate in our RFP response and we'll look bad."*
>
> Sourcera's cite-before-state rule drops any response sentence without KB grounding. Every draft row shows its citation inline: *"from: yourcompany.com/trust/soc2"* with hover expansion showing the exact quoted sentence. Confidence thresholds per capability suppress low-confidence output (KB suggestions <70%, Evidence parsing <60%).
>
> Beta Header and Version Pinning (C.59) pins specific agent + skill versions on every call. Your ongoing RFPs see the same model behavior until you intentionally upgrade.
>
> This is closer to a retrieval-constrained system than a generative one. Your team reviews every draft.
>
> 2-min video on the retrieval path: [loom_url]

**G3. Day 7**

> **Subject:** KB portability
>
> [first_name],
>
> Related SE concern: *"I don't want our KB locked into another platform."*
>
> Our KB export endpoint ships full Markdown + JSON schema + entry metadata + provenance log + attachments, zipped, one click. Every tier including Free. Never paywalled. Documented publicly.
>
> What exports can't capture: confidence scores from accept/reject signals, staleness state, win-rate weighting, cross-bid citation graph, KB-to-Capability auto-declarations. That's on-platform compounding — the reason to stay, not the reason to be locked in.
>
> [cal_url_20min_seller]

**G4. Day 14**

> **Subject:** One concrete spec
>
> [first_name],
>
> Last note — one concrete spec: KB MCP Server. Namespaced retrieval with hybrid dense + lexical search, server-side query expansion, cross-encoder re-rank, and `seller_org_id` pre-filter on the vector search path (not post-filter).
>
> Citations return exact sentences with provenance URLs. No prompt injection paths — retrieval happens before generation.
>
> If this is the level of detail your platform team cares about, 20 minutes and I'll walk through it.
>
> [cal_url_20min_seller]
>
> [founder_name]

---

**SEQUENCE H — LEO (RFP Manager / Proposal Manager)**

Leo is typically Forced-Signup originated (already on Sourcera via buyer invite). For Leo who is Organic (self-discovered Sourcera):

**H1. Day 0**

> **Subject:** Your RFP library, rebuilt from your website in 30 seconds
>
> [first_name],
>
> Your RFP response library lives in a Google Drive folder that only you can navigate. You search by memory. When you leave, the knowledge leaves with you.
>
> Sourcera's KB Bootstrap: Opus-tier crawl of your public homepage, help center, and trust center. Generates 40–200 draft KB entries from your own content in ~30 seconds, with provenance URLs. First Bootstrap is lifetime-free.
>
> Ghost-Bid Importer: paste or upload historical RFPs; the Agent runs Ghost-RFP Ingestion and seeds your KB with structured entries from prior work. First import free per Seller Org.
>
> In one session, you have a structured, searchable, exportable, confidence-scored KB. Your successor will thank you.
>
> $149/mo annual Starter. Free forever for responding to buyer invites.
>
> [cal_url_20min_seller]

**H2. Day 3**

> **Subject:** Inline citations on every draft
>
> [first_name],
>
> One reason the KB compounds on Sourcera in ways Google Drive won't:
>
> — Every first-pass draft cites a specific KB entry with the exact quoted sentence.
> — Accept the draft = strongest possible acceptance signal fed to outcome resolver.
> — Edit the draft = we learn what you rewrite.
> — Reject the draft = the rejection itself becomes a new KB entry in one click.
>
> Every rejection grows the KB. Every accept reinforces confidence. Entries earn win-rate lift from closed bids.
>
> Your library isn't static — it ranks itself.
>
> [cal_url_20min_seller]

**H3. Day 7**

> **Subject:** Seller Pulse
>
> [first_name],
>
> Operational thing: Seller Pulse is a four-signal health score per active bid — response completion, SLA compliance, KB coverage, Q&A responsiveness. One number. You track every bid in a single dashboard instead of chasing across email threads and Google Docs.
>
> Bid Tasks, Bid Schedule, Gantt-style view with SLA markers. Your team collaborates on each requirement with owner + due date + status.
>
> This is what replaces the spreadsheet you maintain today.
>
> 2-min video: [loom_url]

**H4. Day 14**

> **Subject:** Free — then you decide
>
> [first_name],
>
> Final note. Respond to a buyer invite on Sourcera Free forever — one concurrent bid, manual KB up to 50 entries, 1 lifetime Bootstrap, $5 AI budget. Zero friction.
>
> When a second buyer invites you, or you hit 50 KB entries, Starter ($149/mo annual) unlocks 3 concurrent bids, 1,000 KB entries, weekly Firecrawl, 10 outbound EOIs per month. Your existing KB and in-flight bids carry over unchanged.
>
> If you're not already responding to enough RFPs to justify tooling — Free fits.
>
> [cal_url_20min_seller]
>
> [founder_name]

### 3.5 The Seller Demo — Different Shape from Buyer Demo

Sellers are tactical. Buyers are strategic. The seller demo is 20 minutes and is almost entirely product; the buyer demo is 30 minutes and is pitch-and-product. See §6 for the full seller demo playbook.

---

## SECTION 4 — QUALIFICATION FRAMEWORK

Separate qualification applies per side. Running both through one framework dilutes signal. The founder should never be 10 minutes into a demo before discovering the prospect is outside ICP.

### 4.1 BUYER QUALIFICATION

#### 4.1.1 BANT — Adapted for Procurement Software

Classical BANT (Budget, Authority, Need, Timeline) fails on Sourcera's buyer track because Sourcera is category-creating — there is no existing budget line item. The adapted framework:

- **B — Budget / Line Item Ownership.** Not "do you have $300/mo allocated?" but "who owns the line for procurement tooling, GRC tooling, or vendor management in your budget?" Disqualifier: no one owns that line AND prospect cannot point to a reallocation source.
- **A — Authority.** Economic buyer access. PQL is usually IC. Champion path to VP/Director Procurement must be clear by demo #2 or the deal stalls.
- **N — Need (trigger event verified).** One of the 8 buyer trigger events (§1.1.2 Positioning) is actively present. Without an active trigger, the account is in "investigative" mode and closes on a 6–18 month cycle.
- **T — Timeline.** Specific evaluation on the plate in the next 90 days OR an audit remediation deadline in the next 180 days OR a renewal window on current tooling in the next 90 days.

#### 4.1.2 The 5 Qualifying Questions (Asked in Discovery)

Ask in order. Any "no" on the first three is a disqualifier. The last two calibrate tier.

1. **"How many software evaluations do you run per year, and how are they documented today?"** — Looking for: 2+ evaluations/yr, current tooling = spreadsheets / SharePoint / email / PowerPoint. Fewer than 2 evals/yr is Wedge ICP (Free) or disqualified. If they say "we use Coupa" — clarify: *"Coupa for the evaluation workflow or for purchase orders?"* Almost always the latter.
2. **"When did you last get an auditor finding or a compliance exception on a vendor selection?"** — Looking for: audit finding in last 24 months OR expected in next 12. This is the strongest converting signal.
3. **"Who on your team participates in a typical evaluation, and which of them gets excluded today due to license or access constraints?"** — Looking for: 5+ distinct roles across 3+ functions. If only 1–2 roles participate, they're in Wedge ICP.
4. **"What's the next evaluation on your plate, and when does it need to close?"** — Looking for: specific named evaluation in next 90 days. Binary signal on Timeline.
5. **"Who owns the budget line for procurement or GRC tooling, and what's the approval path for a $300–$2,000/mo SaaS commit?"** — Identifies economic buyer + approval friction. If the path is >3 people deep, factor 6–10 weeks into sales cycle.

**Tier calibration from question responses:**

| Response pattern | Tier |
|---|---|
| 2–4 evals/yr, single team, some audit pressure | Starter |
| 4–8 evals/yr, cross-functional team of 5+, active audit findings | Growth |
| 8+ evals/yr OR cross-department procurement function | Scale |
| Any SSO requirement OR DPA requirement OR ≥$12K AI commit | Enterprise |

#### 4.1.3 Buyer Disqualifiers (Hard and Soft)

**Hard disqualifiers (exit the deal immediately, offer Free, do not run a demo):**

- Company size < 200 employees AND < $500K annual software spend.
- Zero cross-functional participation in evaluations (single-person buyer).
- Air-gapped or classified environment with no cloud-hosting allowance.
- Explicitly buying Coupa/Ivalua/Jaggaer in next 6 months with no coexistence appetite.
- Services procurement (consulting, staffing) rather than software.
- Single-dimension scoring (reverse-auction / price-only).

**Soft disqualifiers (continue, but route to Free with low-touch follow-up — not prioritized):**

- Company size 200–500 with <2 evals/yr — fits Wedge ICP but low conversion odds.
- No active trigger event.
- Coupa/Ivalua in-house but champion wants parallel adoption — winnable over 6–12 months.
- No clear economic buyer surfaced after 2 touchpoints — park in "investigative" pipeline.

**The "already on Coupa" test:**

Ask: *"Are your evaluations running inside Coupa's Sourcing module today, or are they running in spreadsheets beside it?"* Almost every answer is "beside it." That unlocks the pitch — Sourcera replaces the spreadsheet, not Coupa.

If the prospect insists their evaluations run *inside* Coupa Sourcing: ask for one concrete example. If they produce it and describe a functional workflow, disqualify (they do not need Sourcera yet). If they describe "it's configured but no one uses it," the prospect is the perfect Sourcera target — the suite failed them.

### 4.2 SELLER QUALIFICATION

#### 4.2.1 RFP Volume Threshold to Justify Paid Plans

| RFP volume / year | Recommended tier | Economic argument |
|---|---|---|
| 0–10 | Free | Respond to invited bids only; no paid use case |
| 10–30 | Starter ($1,788/yr) | One saved hour per RFP at $150/hr SE loaded rate = $4,500/yr value. Starter pays for itself in year 1. |
| 30–100 | Growth ($5,988/yr) | Daily Firecrawl + unlimited EOIs + CRM Sync + numeric Match Scoring justify the step-up |
| 100+ | Scale ($17,988/yr) | RFP Center of Excellence; real-time Firecrawl + unlimited concurrent bids + 12 Page Enrichments/yr |
| 200+ OR SSO/DPA required | Enterprise | Custom contract; $3K/mo floor with committed AI spend |

**Disqualifier:** Vendor with 0 RFPs/yr who responds "we don't do RFPs, all PLG." Free fits permanently. Acceptable acquisition cost if CAC is near zero; not a sales target.

#### 4.2.2 Current Tooling Assessment (The 3-Question Seller Discovery)

1. **"What tool, if any, do you use today to respond to RFPs?"** — Answer mapping:
   - "Nothing / Google Drive / SharePoint" → Starter or Growth entry
   - "Responsive / Loopio / Qvidian / PandaDoc" → Responsive-switcher pitch; often Growth entry with migration
   - "Airtable / Notion / Trello with custom columns" → Starter entry; KB bootstrap is the pitch
2. **"What's your current KB setup and how fresh is it?"** — If KB is stale, Firecrawl is the hook. If no KB exists, Bootstrap + Ghost-Bid Importer are the hook. If KB is in Loopio/Responsive, KB export + re-import flow is the hook.
3. **"When did you last lose a deal on RFP response latency or quality?"** — If recent, Hero Moment is the hook. If never, challenge: *"How do you know?"* — usually surfaces uncertainty → First-Pass drafting pitch.

#### 4.2.3 Upgrade Readiness Signals (Free → Paid)

Signals that predict willingness to pay, observed in-product:

- Bid completion rate on Free ≥ 1 submitted bid
- KB entries ≥ 40 (within ceiling-adjacent zone)
- Second buyer invitation received (Conversion Moment #1)
- EOI submission attempted (Conversion Moment #2)
- Ghost-Bid Importer used (high-engagement signal)
- Stake-reveal screen viewed + dwell > 20s
- Outcome debrief viewed for a closed bid

A seller hitting 3+ of these within 30 days of signup converts at a materially higher rate than a seller hitting 0–2.

#### 4.2.4 Seller Disqualifiers

**Hard disqualifiers:**

- 0 RFPs/yr, PLG-only vendor with no RFP workflow.
- Services-only vendor with fully custom responses each time (KB compounding hypothesis fails).
- Selling into buyers who never run structured evaluations (pure SMB / consumer).
- Prohibited from using US or EU cloud-hosted AI (custom-residency Enterprise only).
- Federal contractor requiring human-only RFP responses per client contract.

**Soft disqualifiers:**

- Hostile vendor-procurement relationship where the vendor runs the process (big-four consulting mandates).
- 5–10 RFPs/yr — economic argument is weak; keep on Free until Conversion Moment hits.

---

## SECTION 5 — DEMO PLAYBOOK — BUYER VERSION

30 minutes. Pitch-and-product, not pure product. Persona-adaptive path. Three pre-planned "wow moments" with a consistent trial close.

### 5.1 Pre-Demo Research Checklist (15 minutes, completed within 2 hours of demo booking)

Every item runs before the demo. Failing this checklist means the demo is operating blind — it will not close.

1. **Company basics.** LinkedIn company page: employee count, industry, HQ, recent funding. Confirms ICP fit.
2. **Persona context.** LinkedIn profile of the booked attendee: title, tenure, previous roles, shared connections. Confirms persona assignment (Priya / Marcus / Elena / Dan / Jordan).
3. **Trigger event surfacing.** Search for the company name + "audit" / "compliance" / "CISO" / "procurement" on LinkedIn + Google News in last 12 months. Evidence of an audit finding, leadership change, compliance mandate, or M&A event.
4. **Tech stack recon.** BuiltWith / Wappalyzer / LinkedIn job postings: do they use Coupa, Ivalua, Jaggaer, WorkOS, Okta? Informs competitive positioning.
5. **Evaluation-in-flight hint.** LinkedIn posts from champions in the last 30 days mentioning vendor evaluations, RFPs, or SaaS selection. Confirms Timeline.
6. **Exec sponsor identification.** Who reports up the chain from the champion? Who will need to be in demo #2?
7. **Customer reference match.** If any Sourcera customer in the prospect's industry or size-band, pre-load their name and use case for the demo.
8. **Pre-created Sourcera workspace.** Spin up a demo workspace pre-populated with requirements relevant to the prospect's industry (Security Tools template for a CISO, CRM template for a SaaS buyer, HRIS template for an HR-tech buyer). This is the "wow moment #1" setup.

### 5.2 30-Minute Demo Structure

| Minute | Activity | Goal |
|---|---|---|
| 0–3 | Rapport + agenda + persona-adaptive opener | Orient the room |
| 3–7 | Discovery (the 5 questions if not already answered) | Confirm trigger + pain |
| 7–12 | **Wow Moment #1 — Template clone → instant evaluation setup** | Show speed |
| 12–18 | **Wow Moment #2 — AI Pre-Scoring in action** | Show AI value |
| 18–23 | **Wow Moment #3 — Selection Report output quality** | Show the artifact that replaces the 10-hour PowerPoint |
| 23–27 | Persona-specific deep-dive (Elena = Policy Parsing; Dan = TCO/Scenario; Priya = audit trail) | Hit the persona's specific pain |
| 27–30 | **Trial close** + next steps | Convert interest to action |

### 5.3 The Three Wow Moments — Exact Script

#### 5.3.1 Wow Moment #1 — Template Clone → Instant Evaluation Setup (Minute 7–12)

**Setup:** Pre-created workspace with Security Tools / CRM / HRIS template (matched to prospect's industry).

**Script:**

> *"Before the demo, I configured a workspace with the [Security Tools / CRM / HRIS] template that ships with Sourcera. Took me about 20 seconds. Here's what's in it:*
>
> *— 80-odd structured requirements pre-populated, tagged by category: Core Capability, Integration, Security, TCO, Vendor Posture*
> *— Weights suggested per category based on industry norms, editable by you*
> *— 5 sample vendors pre-loaded from the Marketplace with basic profiles and public-docs citations*
> *— TCO Use Case pre-scaffolded with the six standard pricing schemas*
> *— Phase structure locked to the 13-phase pipeline*
>
> *This is not a starter document — it's an evaluation you could run tomorrow against three real vendors. A procurement team at your peer [specific_reference_company_or_pattern] took this template, added six custom requirements in Phase 2, and opened the evaluation to vendors the same afternoon.*
>
> *What would be different about your evaluation?"*

**Listen.** Let the prospect name the specific delta. Write it into the workspace live. This demonstrates configurability.

**Wow moment:** The prospect expected a configuration workshop. They see the evaluation is live in 5 minutes.

#### 5.3.2 Wow Moment #2 — AI Pre-Scoring in Action (Minute 12–18)

**Setup:** In the same workspace, advance a pre-loaded vendor's response to Phase 10. The response fixtures include realistic vendor content pulled from public RFP answers for similar tooling.

**Script:**

> *"The evaluation is in Phase 10 — Cross-Functional Review. This is where your team grades vendor responses against requirements. In a spreadsheet, this is where evaluations stall for weeks. Let me run Pre-Scoring.*
>
> *[Click the Pre-Scoring button.]*
>
> *"Watch the matrix fill in. Each row is a requirement. The Agent reads the requirement, the vendor's response, and any supporting evidence documents they uploaded. It drafts a grade — we use FM, PM, DNM, EX rubric — with a confidence score and a cited sentence from the vendor's response. [Hover over a row.] See the citation? 'Cited by: [response quote].' That's the exact text the Agent grounded the grade on.*
>
> *"Your reviewer opens the scoring UI and sees suggested grades. They accept, edit, or override. Every override is recorded in append-only grade history with the reviewer, timestamp, and justification.*
>
> *"The Agent runs on Sonnet — typical Pre-Scoring run across 80 requirements × 3 vendors completes in under 90 seconds for about [N] value-dollars against your AI budget.*
>
> *"Here's what matters for you: the Agent suggests, your team decides. Every output is labeled [AI-Generated] with confidence shown. Accepted outputs bill at value price. Rejected outputs bill at cost price — about 10% of value price. Our margin is structurally aligned with your quality bar.*
>
> *"What would your current scoring phase look like if the grade sheet arrived already drafted?"*

**Listen.** Response is almost always a quantification of time saved. Note it and use it in the close.

#### 5.3.3 Wow Moment #3 — Selection Report Output Quality (Minute 18–23)

**Setup:** Pre-generated Selection Report PDF on a completed evaluation.

**Script:**

> *"Last one. Your evaluation closes at Phase 13. This is the moment that kills procurement teams today — the Selection Memo, the PowerPoint for exec review, the audit artifact. In your current workflow, this is a 10-hour weekend project.*
>
> *[Open Selection Report PDF.]*
>
> *"This is generated by Sourcera at close. It's a 12–18 page PDF. Structure: Executive Summary with top-line score delta, Vendor Scorecards with every requirement scored and justified, TCO Breakdown across all six pricing schemas, Scenario Modeling results if the evaluation used them, Traceability Matrix mapping every requirement back to source policy, Append-Only Grade History showing every score change with reviewer, timestamp, and rationale, and the Selection Record — SHA-256-hashed, immutable.*
>
> *"This is the artifact your auditor asks for. And it's generated the day you close the evaluation, not the weekend before exec review.*
>
> *"If you've been through an audit finding on vendor evaluation, you know this is the answer to the question you couldn't answer last time: 'why did we pick Vendor A over Vendor B on Requirement 47?'"*

**Open the relevant page.** Show a specific requirement-to-score-to-rationale trace. This is the single highest-impact visual in the demo.

### 5.4 Persona-Specific Deep-Dive Paths (Minute 23–27)

Pick one of these based on the persona present. All three cannot fit in 5 minutes; pick the dominant persona.

#### 5.4.1 Priya Path (Procurement Lead)

Show: SLA timer escalation ladder, Pulse Health Score (0–100) with weekly digest email, Disagreement Insight Cards (≥0.3 variance auto-flagging), Selection Report traceability matrix.

**Talking point:**

> *"Your team stops chasing Legal and InfoSec by email. The SLA does it. You stop reconstructing the evaluation for the exec review — it's already assembled. You stop scrambling when the auditor arrives — the artifact is there."*

#### 5.4.2 Elena Path (CISO)

Show: Policy-Powered Requirement Generation (upload NIST 800-53 or SOC 2, watch it parse into structured requirements), InfoSec Team horizontal track with Custom Agent Instructions, Data Residency per Org, Traceability Matrix.

**Talking point:**

> *"Upload NIST 800-53 once. Never re-author a control question again across 6 evaluations. Your team stops being the critical path. Custom Agent Instructions enforce your review rules across every active evaluation in the org in under 60 seconds of save — you write the rule once, it applies everywhere."*

#### 5.4.3 Dan Path (CFO)

Show: TCO Modeling with six structured pricing schemas, Scenario Modeling comparing "20% seat growth" vs "10% seat growth" across vendor rankings, AI Wallet with hard cap / soft cap / Usage Dashboard.

**Talking point:**

> *"Apples-to-apples TCO before the vendor is selected, not after. Scenario Modeling stress-tests the ranking without rebuilding the spreadsheet. AI budget is capped at the plan — wallet overage off by default. One line item on your AP: the plan subscription."*

### 5.5 The Trial Close (Minute 27–30)

> *"Here's what I'd suggest as the next step, and tell me if it's off:*
>
> *"Start on Free with one real evaluation — one you'd otherwise run in a spreadsheet in the next 30 days. Free includes one active evaluation, unlimited seats across your team, 25 vendors tracked, 50 KB items, and $5 in AI budget — sized to cover one full Pre-Scoring run across 3+ vendors plus some KB work. That's the experience we just walked through.*
>
> *"If it works for that evaluation, upgrading to Starter is $299/mo annual for 5 evaluations and $50 AI budget, or Growth at $799/mo for 20 evaluations and $300 budget. Your existing evaluation carries over — nothing to rebuild.*
>
> *"If it doesn't work, Free keeps running at no cost. Zero risk.*
>
> *"Two ways forward — preference?*
>
> *"1. I send you the signup link today. You spin up the workspace with a template I pre-fill based on this call. I'm available to answer any question during the evaluation — Slack Connect, email, whatever works.*
>
> *"2. You bring [economic buyer name or VP title] into a 15-minute follow-up where I walk them through the Selection Report and the economic case. Then we start on Free.*
>
> *"Which fits your team better?"*

### 5.6 Post-Demo Follow-Up Email (Sent Within 2 Hours)

> **Subject:** Sourcera — demo follow-up + the Selection Report I promised
>
> [first_name],
>
> Thanks for the time today. Three things as promised:
>
> 1. **Sample Selection Report** — attached. This is the artifact your auditor asks for, generated at Phase 13 close. 12 pages, full traceability matrix, SHA-256 hashed.
>
> 2. **Your demo workspace** — I've shared access: [workspace_url]. The [template_name] template is loaded with [N] requirements, [N] sample vendors, and the TCO Use Case pre-scaffolded. You can open it, add your team (unlimited seats), and start running a real evaluation against it today.
>
> 3. **Pricing + plan fit** — based on our conversation:
>    — **Free** — one active evaluation, unlimited seats, $5 AI budget. Zero cost. Run your next evaluation here.
>    — **Starter** — $299/mo annual, 5 active evaluations, $50 AI budget. Fit for [specific_evaluation_volume_mentioned].
>    — **Growth** — $799/mo annual, 20 active evaluations, $300 AI budget. Fit for [if_parallel_evaluations_mentioned].
>
> Three paths from here:
>
> 1. You start on Free against your next evaluation. I'm available for any question — Slack Connect or email.
> 2. You bring [economic_buyer_name] into a 20-minute follow-up focused on [their_specific_pain_from_research]. Calendar: [cal_url].
> 3. You decide Sourcera isn't a fit right now. No hard feelings — I'll keep you on a quarterly check-in cadence.
>
> Preference?
>
> [founder_name]
>
> **P.S.** — [specific_pain_raised_in_demo]. I pulled the section of the Selection Report that addresses this specifically: [attachment_highlight]. Worth a look.

**Attached:** Sample Selection Report PDF (generic but realistic), a 1-page feature-comparison table (Sourcera vs. status quo spreadsheet workflow), and a 90-second Loom of the demo highlights the prospect can forward internally.

---

## SECTION 6 — DEMO PLAYBOOK — SELLER VERSION

20 minutes. Tactical. Product-first. Shorter because sellers are operators and know their pain more concretely than buyers.

### 6.1 Pre-Demo Research Checklist (10 minutes)

1. **Is the prospect already on Sourcera via forced signup?** Check Postgres / Attio for existing Seller Org records matching the prospect's company domain. If yes, review:
   - Signup source (M1 / M5 / M15 / M17)
   - Bid activity (submitted bids, in-flight bids)
   - KB size and Firecrawl sources
   - Current plan tier
   - Most recent PQL score and which signals are firing
2. **Company basics.** Seller ICP fit: 50–500 employees, B2B SaaS / managed services / security / analytics / data / API-infra / vertical SaaS. Confirm via LinkedIn.
3. **RFP volume inference.** LinkedIn job postings mentioning "RFP Manager" / "Proposal Manager" / "Response Specialist" indicates 30+ RFPs/yr. Glassdoor reviews often reveal "RFP volume is brutal."
4. **Current tooling recon.** BuiltWith / job postings / LinkedIn profiles for "Responsive / Loopio / Qvidian / PandaDoc" mentions. Informs the Responsive-switcher pitch.
5. **CRM recon.** Job postings mention Salesforce / HubSpot / Dynamics / Pipedrive = CRM Sync is the hook. If no CRM, de-emphasize.
6. **Public KB surfaces.** Does the prospect have a trust center / docs site / security page that Firecrawl would love? Note specific pages — this becomes "Wow Moment #1" fuel.
7. **Win/loss narrative search.** LinkedIn posts from AEs or SEs at the company in the last 6 months mentioning lost deals, RFP pain, response latency. Primary signal for the emotional hook.

### 6.2 20-Minute Demo Structure

| Minute | Activity | Goal |
|---|---|---|
| 0–2 | Rapport + agenda — tight | Set expectations |
| 2–5 | Discovery — 3-question seller discovery (§4.2.2) | Confirm pain |
| 5–10 | **Wow Moment #1 — KB Bootstrap in real-time from the prospect's own website** | Show speed |
| 10–14 | **Wow Moment #2 — First-Pass RFP drafts with inline KB citations** | Show AI value |
| 14–17 | **Wow Moment #3 — CRM Sync showing Marketplace intent flowing into Salesforce** | Show revenue value |
| 17–20 | **Trial close** + next steps | Convert |

### 6.3 The Three Wow Moments — Exact Script

#### 6.3.1 Wow Moment #1 — KB Bootstrap in Real-Time (Minute 5–10)

**Setup:** A sandbox Seller Org ready to accept domain input. Prospect's public domain pre-selected to avoid delay.

**Script:**

> *"We're going to bootstrap your KB from your own website, right now, in this demo. I have a sandbox Sourcera Seller Org with your domain — [prospect_domain] — already entered. When I hit Start, Sourcera sends a crawl request to Firecrawl, which pulls your public homepage, help center, trust center, and docs. An Opus-tier model reads the pages and proposes KB entries grouped by topic.*
>
> *Typical run is 30–90 seconds. Watch.*
>
> *[Click Start. Show progress storytelling UI narrate honestly: 'Scanning [domain]...', 'Found your security documentation...', 'Drafting KB entries...'.]*
>
> *[Bootstrap completes.]*
>
> *Here's what Sourcera proposed. [N] draft KB entries from your content alone. Each entry shows:*
>
> *— Title, body, category*
> *— Source URL — the exact page on your website it was extracted from*
> *— Confidence score*
> *— A hover-expanded preview of the source sentence*
>
> *Every entry is a draft — you accept, edit, or reject. Acceptance flows into outcome accounting: accepted = value-priced, rejected = cost-priced, so our margin aligns with your quality bar.*
>
> *This is a Free-tier Seller Bootstrap. Lifetime-free per Seller Org. If you were inside a real bid invitation right now, this would be running inside the SSO redirect latency — you'd never see a loading screen. You'd land on a bid workspace with drafts for every requirement the buyer sent you."*

**Wow moment:** The prospect's own content just became structured, searchable, confidence-scored KB in 60 seconds. Nothing else in the category does this.

#### 6.3.2 Wow Moment #2 — First-Pass Drafts with Inline KB Citations (Minute 10–14)

**Setup:** A realistic buyer RFP fixture (80 requirements, Security Tools category), pre-loaded. The KB bootstrapped in Wow Moment #1 is already connected.

**Script:**

> *"Now the payoff. I'm in a bid workspace for a fictional buyer — requirements like 'describe your SOC 2 Type II controls,' 'detail your data residency options,' 'explain your incident response process.' 80-odd requirements.*
>
> *I hit Draft First-Pass Responses. The First-Pass Responder runs on Sonnet. It reads each requirement, retrieves the top-3 KB entries relevant to that requirement via hybrid retrieval — pre-filtered to your Seller Org's KB, never leaking across orgs — and drafts a response citing specific KB entries.*
>
> *[Click. Show responses populate.]*
>
> *Each draft row shows the response text AND the citation — 'from: [your_domain]/trust/soc2' with the exact quoted sentence in hover. Click the citation, see the source paragraph on your website.*
>
> *47 of 82 requirements drafted. 31 cite specific pages on your website. For the 35 the AI couldn't confidently answer, you get the KB-gap detector — an inline text field where you write the answer, and it's saved as a new KB entry in one click. Every rejection grows your library.*
>
> *Your SE or RFP manager now reviews 47 pre-drafted responses and writes 35 from scratch — with citations and KB-growth side effects — instead of writing 82 from scratch.*
>
> *Time savings on a typical bid: 40–60%.*
>
> *Cite-before-state rule: if the Agent couldn't ground a response in KB, it doesn't draft one. No hallucinations, no made-up SOC 2 dates, no invented integrations."*

#### 6.3.3 Wow Moment #3 — CRM Sync with Marketplace Intent (Minute 14–17)

**Setup:** A Salesforce sandbox with a joined Sourcera Growth-tier Seller Org. Pre-loaded Marketplace activity.

**Script:**

> *"Last wow moment — this one isn't about response tooling. It's about demand capture.*
>
> *[Open Sourcera Marketplace view.] These are buyer-published evaluation summaries. Real evaluations currently in Phase 4 or 5 of the Sourcera pipeline, looking for qualified vendors. You see category, buyer industry, rough employee count, requirement themes, timeline.*
>
> *[Click a listing.] Your Match Score: [N]. Numeric score, visible on Growth+. You click 'Submit EOI.' Structured EOI form: your capability declarations auto-populate, you drop in your pitch, click send.*
>
> *[Open Salesforce sandbox.] This is your CRM. You see a new Account activity: 'Sourcera — EOI submitted to [Buyer Name].' An Opportunity is created in your pipeline stage, pre-populated with the RFP metadata. Your AE receives a notification exactly where they already live.*
>
> *If the buyer accepts your EOI and invites you into their evaluation, that flows in too — as a new activity with the bid URL.*
>
> *This is Marketplace demand routed to your CRM without your AEs changing tools. No new pane of glass.*
>
> *Included on Growth — $499/mo annual."*

### 6.4 The Close (Minute 17–20)

> *"Here's the close. Two paths:*
>
> *"Path 1 — You're already on Sourcera.* [If prospect is a forced-signup seller.] *You've responded to [N] invited bids on Free. Your KB has [N] entries. Next time a buyer invites you, or you hit 50 KB entries, Starter ($149/mo annual) unlocks 3 concurrent bids, 1,000 KB entries, weekly Firecrawl on your website, $30 AI budget, 10 outbound EOIs per month, and Verified tier eligibility. Your existing KB and in-flight bids carry over — nothing to rebuild. You can upgrade from Settings → Billing in under 30 seconds.*
>
> *"Path 2 — You're not on Sourcera yet.* [If prospect is organic.] *Start on Free today. Your KB Bootstrap is lifetime-free and generates [N] entries from your website in 60 seconds. Your first invited bid responds at Free. Your published Seller Profile goes live on domain verification — you're in the Marketplace from day one. Zero paywall to respond, zero paywall to get listed.*
>
> *"Both paths are $0 to start. If Starter unlocks obvious value for you ($149/mo annual), we can do that today — I'll walk you through it on this call. If Growth makes more sense because you want CRM Sync, unlimited EOIs, and numeric Match Scoring ($499/mo annual), we can do that today too.*
>
> *"Which path fits?"*

### 6.5 Post-Demo Follow-Up Email (Within 2 Hours)

> **Subject:** Sourcera — your KB from the demo + upgrade path
>
> [first_name],
>
> Three things from today:
>
> 1. **The sandbox KB we bootstrapped** from [your_domain] is preserved at [sandbox_url]. [N] entries. You can log in, review them, and decide if that's a realistic starting library. (This was a demo sandbox — for your real Seller Org, Bootstrap runs inside the SSO redirect on your first bid invitation.)
>
> 2. **Pricing recap:**
>    — **Free** — 1 concurrent bid, 50 KB entries, 1 lifetime Bootstrap, published Seller Profile, 3 Capability Declarations, $5 AI budget.
>    — **Starter** — $149/mo annual. 3 concurrent bids, 1,000 KB entries, 2 Firecrawl sources weekly, $30 AI budget, 10 outbound EOIs/mo, Verified tier.
>    — **Growth** — $499/mo annual. 15 concurrent bids, 10,000 KB entries, 10 Firecrawl sources daily, $200 AI budget, unlimited EOIs, CRM Sync, numeric Match Scoring.
>    — **Scale** — $1,499/mo annual. Unlimited concurrent bids, unlimited KB, real-time Firecrawl, $600 AI budget, shared CSM, 1 Promoted placement/mo.
>
> 3. **What I'd suggest for you:** [specific_tier_recommendation_with_rationale]. You can start on Free and upgrade when the ceiling hits — or start on Starter/Growth today if the economic argument is clear. Your calendar: [cal_url].
>
> Also: **your published Seller Profile.** If you signed up during the demo, your profile is live at [public_url]. Domain verification is already done via the magic-link flow. You're searchable in the Marketplace from now.
>
> [founder_name]
>
> **P.S.** — If you're on Loopio or Responsive today and your renewal is in the next 90 days, reply "renewal" and I'll send the migration path + cost comparison. Most Loopio customers save $9K–$29K/yr moving to Sourcera Growth.

---

## SECTION 7 — OBJECTION HANDLING ENCYCLOPEDIA

Every objection below: the exact words a prospect uses, the underlying concern, the response framework, and the specific Sourcera proof point. Responses are written to be delivered live, not read. Use phrasing that matches the prospect's register — if they are tactical, strip the frame and go direct; if they are exec-pitched, keep the frame.

### 7.1 BUYER OBJECTIONS

#### 7.1.1 "We already use spreadsheets and they work fine."

**Underlying concern:** Switching cost; no active pain; evaluation-as-usual inertia.

**Response:**

> *"Fair starting point — every buyer I talk to has that spreadsheet. Three questions back:*
>
> *1. When was the last time your team could, in under 5 minutes, produce the exact rationale for why you picked Vendor A over Vendor B on a specific requirement from an evaluation 12 months ago?*
> *2. When your auditor asks for the decision record, what artifact do you hand them?*
> *3. In your last evaluation, how many hours did your Legal, InfoSec, and Finance reviewers spend total, and was that visible to exec leadership?*
>
> *If all three answers are 'we figured it out,' Sourcera is probably premature. If any answer is 'we reconstructed it / a PowerPoint / we don't know' — that's the gap Sourcera closes. The spreadsheet doesn't fail on input. It fails on audit, defensibility, and institutional memory."*

**Proof point:** Append-Only Grade History (§6.3.6), SHA-256 hashed Selection Record (§6.37), Organizational Intelligence (§6.7) for cross-evaluation discrepancy detection.

#### 7.1.2 "Coupa/Ivalua already does this."

**Underlying concern:** Spend-suite lock-in; internal political capital already spent on Coupa.

**Response:**

> *"Coupa and Ivalua own different surfaces. Coupa is a source-to-pay suite — it owns requisitions, POs, invoices, and vendor master. Ivalua is broader with a sourcing module. Neither ships a structured 13-phase evaluation pipeline. Neither ships an AI Agent that pre-scores qualitative requirements. Neither ships a Dual-Console architecture where the same org can both buy and sell software. Neither ships a Vendor Discovery Marketplace.*
>
> *Here's the concrete test: ask your team to show you where, inside Coupa today, they score requirements with weights, track stakeholder disagreement above a 0.3 variance threshold, and generate a traceability matrix mapping each requirement back to source policy controls. If they can show you, we're in the 5% of cases where Coupa genuinely replaces us. If they can't — and they won't be able to — the evaluation is still happening in spreadsheets beside Coupa. We replace the spreadsheet, not Coupa. At Enterprise we integrate with Coupa so the Selection Record routes downstream into your P2P workflow."*

**Proof point:** 13-phase pipeline (§6.2), Agent Pre-Scoring (§6.12), Policy-Powered Requirement Generation (§6.6), Coupa integration at Enterprise (§6.20).

#### 7.1.3 "We don't have budget for another tool."

**Underlying concern:** CFO-signoff friction; category-creation pain (no existing line item).

**Response:**

> *"Two angles on this.*
>
> *First — the economic case. A typical mid-market evaluation consumes 120–180 cross-functional labor hours at a $100/hr blended loaded rate. That's $12,000 to $18,000 per evaluation in direct labor cost. Business Starter is $3,588/yr — pays for itself in the first evaluation. Your current workflow isn't free; you just don't have a line item for it.*
>
> *Second — the budget-line question. Most of our first 100 buyers line-item Sourcera under either Procurement Technology, GRC Tooling if InfoSec led the initiative, or Vendor Management if Legal led it. Happy to help you frame the internal business case — I can send a one-page ROI worksheet that your CFO can read in 90 seconds.*
>
> *Third — the risk-free path. Run your next evaluation on Free. Full feature set, one active evaluation, unlimited seats, $5 AI budget. If it saves the hours we claim, the upgrade conversation becomes a data question, not a theory question."*

**Proof point:** Time-Saved Baseline (§6.36), Free-tier feature parity for 1 evaluation (§4 Buyer Pricing).

#### 7.1.4 "Our procurement process is too unique."

**Underlying concern:** Fear the tool won't flex; prior bad experience with rigid SaaS.

**Response:**

> *"In my experience, 'unique' usually means one of three things. Let me name them and you tell me which applies:*
>
> *1. You have requirements categories we don't have — Capability, Integration, Security, TCO, Vendor Posture — that's the default taxonomy. You can add custom categories and custom weights in Phase 2.*
> *2. You have a unique phase order — our 13-phase pipeline is fixed by design. Phases can't be skipped, but the time spent in each phase varies wildly by evaluation. Most 'unique' workflows collapse into the 13 phases when decomposed.*
> *3. You have specific approval and sign-off steps — our RBAC model supports Org Owner, Workspace Owner, Use Case Lead, Evaluator, Guest with 4 permission profiles. Custom approval chains map into this.*
>
> *Which of the three is the thing you're worried about? I'd rather map your actual workflow to our model in this call than tell you 'we're flexible enough' and have you discover a gap two weeks in."*

**Proof point:** Fixed 13-phase pipeline (§6.2), RBAC model (§6.22), Template Library customization (§6.10).

#### 7.1.5 "I can't get IT/Security to approve another SaaS vendor."

**Underlying concern:** IT approval gauntlet is long; champion is not in IT; risk of stalling.

**Response:**

> *"Two things that make this easier.*
>
> *First — Sourcera is one tool replacing five uncontrolled surfaces: Google Drive, SharePoint, Outlook, PowerPoint, Excel. The net-new attack surface is smaller, not larger.*
>
> *Second — our Security Posture package. WorkOS SSO at Enterprise, SOC 2 Type II on 12-month roadmap, ISO 27001 planned, penetration testing annual, Convex-backed data isolation at the query layer, Dual-Console firewall enforced at the database level, full OWASP Top 10 mitigations documented, SBOM on request. Happy to send the full package directly to your CISO's team.*
>
> *Third — the Free tier path. Free doesn't require procurement or legal approval at most orgs because it's zero-spend. Your champion runs a real evaluation on Free. When it's time to upgrade, you have an actual outcome to point at — not a sales pitch. IT approves an outcome faster than a hypothesis."*

**Proof point:** Dual-Console firewall (§6.1.1), WorkOS SSO (§6.23.1), OWASP Top 10 (§6.26), Free tier zero-spend path (§4 Buyer Pricing).

#### 7.1.6 "We only buy software every few years."

**Underlying concern:** Volume doesn't justify the purchase; not in ICP.

**Response:**

> *"That's the honest disqualifier for Business tier. If you run 0–1 evaluations per year, Starter's 5-evaluation cap is overbuilt. Two paths:*
>
> *1. Run your one upcoming evaluation on Free. One active evaluation, unlimited seats, $5 AI budget, full Selection Report at close. Zero cost. You get the audit-ready artifact for one evaluation. If a second evaluation comes up within 12 months, we talk about Starter then.*
> *2. If Free's ceiling is a real issue for the one evaluation — you have more than 25 vendors to consider, or you need Opus-tier Policy Parsing — Starter is $299/mo annual and the upgrade is reversible at any time.*
>
> *The volume question isn't a blocker for Free. It's only a blocker for Starter. Let's figure out if Free covers your case."*

**Proof point:** Free tier = 1 active evaluation, full feature set except Opus-gated capabilities (§4 Buyer Pricing).

#### 7.1.7 "What if you go out of business?"

**Underlying concern:** Platform-risk, data-lock-in.

**Response:**

> *"Legitimate question. Three answers.*
>
> *First — data portability is a commitment, not a feature. Every artifact in Sourcera is exportable at every tier. Evaluations, scoring data, TCO models, Selection Reports, audit logs, KB entries — full export in JSON + Markdown + PDF formats, one click. Documented in our public docs.*
>
> *Second — downgrade-safe preservation. If you stop paying or we cease operations, your data is preserved in read-only state for 90 days. No destructive deletion.*
>
> *Third — at Enterprise, we offer a source-code escrow arrangement via [escrow partner] where our production codebase is held by a neutral third party and released to customers under specific business-continuity triggers. Not standard on Business tiers, but available if it's the deal-blocker.*
>
> *Fourth — our pricing structure. We're not venture-subsidized-below-cost. Our outcome-accounted AI pricing clears 90%+ gross margin at steady state; we're built to be cash-flow positive without external capital dependency. That's not an investment guarantee, but it's a structural answer to 'what if.'"*

**Proof point:** Data Export (§6.29), Downgrade-safe state (§2.11 Buyer Pricing required feature #8), Pricing margin targets (§12 Buyer Pricing).

#### 7.1.8 "We need case studies / references."

**Underlying concern:** Cautious buyer; wants social proof.

**Response:**

> *"Fair ask. Three things I can offer:*
>
> *1. Reference calls with current customers in your industry — I can set up a 30-minute conversation with [specific_reference_customer_if_available]. They ran a [specific_evaluation_scenario] last quarter. They can answer anything you'd ask them that you wouldn't ask me.*
> *2. Sample artifacts — I can send you a real Selection Report from an anonymized evaluation in [your_industry], with any identifying content redacted. This is the artifact, not the pitch.*
> *3. Honest caveat — we're in the first year of commercial deployment. If your procurement function requires a Forrester Wave or Gartner Magic Quadrant before adoption, that's a timing question rather than a Sourcera question, and I'd suggest you start on Free in the meantime. The category is defining itself; early adopters are shaping the methodology."*

**Proof point:** Reference customer roster (real and anonymized), sample Selection Report, category-creation positioning (§6 Positioning).

#### 7.1.9 "Why should we care about the Marketplace?"

**Underlying concern:** Buyer doesn't see the two-sided value; thinks Marketplace is irrelevant to their evaluation.

**Response:**

> *"Straightforward answer: the Marketplace is optional for you. You can invite any vendor by name, domain-verified magic link, and they respond for free whether or not the Marketplace exists.*
>
> *What the Marketplace actually does for your buyer-side workflow:*
>
> *1. Every vendor you invite becomes a published Seller Profile in the Marketplace — contributing to shortlist quality for your future evaluations. Your own category shortlists get faster over time as more vendors are on the platform.*
> *2. Optional: you can publish your evaluation summary to the Marketplace to attract qualified vendors you haven't discovered yet. Vendors submit Expressions of Interest with structured Capability Declarations; you decide which to accept into your evaluation.*
> *3. If you choose not to publish, you get every other Sourcera feature unchanged.*
>
> *The Marketplace is an amplifier for buyer-side workflow, not a replacement for it. If it doesn't fit your procurement style, ignore it."*

**Proof point:** Marketplace (§6.16), Marketplace Listings optional for buyers (§6.16.1).

#### 7.1.10 "We need on-premise."

**Underlying concern:** Regulatory or security requirement that disqualifies cloud.

**Response:**

> *"This is a hard constraint. Let me clarify what we offer:*
>
> *— Standard deployment: Convex-hosted on AWS, with data residency options US, EU, or Custom at Enterprise.*
> *— Custom residency: at Enterprise, we can deploy in customer-selected AWS regions, including GovCloud on a scoped-custom-contract basis.*
> *— True on-premise / air-gapped: we do not offer this.*
>
> *If your requirement is data residency in a specific region, that's solvable — $3K/mo Enterprise floor plus custom-region scoping. If your requirement is truly air-gapped (no internet-connected services allowed), Sourcera isn't your solution today. Honest answer: you're better served by a specialist government-cloud procurement tool. I don't want to waste your evaluation cycle on a mismatch."*

**Proof point:** Data Residency (§6.25), Enterprise custom deployment gate (§6 Buyer Pricing).

### 7.2 SELLER OBJECTIONS

#### 7.2.1 "We already use Responsive/Loopio."

**Underlying concern:** Switching cost; sunk spend; KB migration pain.

**Response:**

> *"Three numbers, then three features.*
>
> *Numbers: Responsive's starter is about $7K/yr. Loopio's mid is $15–20K/yr. Sourcera Starter is $1,788/yr. Sourcera Growth is $5,988/yr. That's 3–4× cheaper.*
>
> *Features: Sourcera Growth ships Marketplace demand capture that Responsive and Loopio don't ship. CRM Sync to Salesforce, HubSpot, Dynamics, Pipedrive as a first-class capability — on Loopio that's limited; on Responsive it's a separate product. Seller Signals — k-anonymized buyer intent from inside active evaluations — is unique to Sourcera.*
>
> *Migration path: export your KB from Loopio/Responsive (both support JSON/CSV export). Bulk import into Sourcera. Firecrawl crawls your public surfaces to auto-update. First KB Bootstrap is lifetime-free. Ghost-Bid Importer lets you paste historical RFPs to seed the library — first import free per Seller Org. Typical transition is 4–8 hours of setup.*
>
> *Most honest reason to stay on Loopio: you're in month 2 of a 12-month contract and don't want to eat the cost. Fair. But for your renewal window — 3× cheaper with new demand channels attached is the argument."*

**Proof point:** Pricing anchor (§8.7 Positioning, §5–7 Seller Pricing), Ghost-Bid Importer (M15), CRM Sync (§6.18), Marketplace (§6.16).

#### 7.2.2 "AI will hallucinate in our RFP responses."

**Underlying concern:** Reputational risk from an inaccurate RFP claim.

**Response:**

> *"Right concern. Sourcera's architecture is retrieval-constrained, not purely generative. Specifically:*
>
> *1. Cite-before-state rule: every First-Pass draft must cite a specific KB entry or it's dropped. No ungrounded statements make it into a response. You see the citation inline on every response row — 'from: yourcompany.com/trust/soc2' with hover expansion showing the exact source sentence.*
> *2. Confidence thresholds per capability: KB suggestions below 70% confidence are suppressed; Evidence parsing below 60% is flagged as low-confidence. You never see speculative content rendered as an answer.*
> *3. Managed Agents are versioned and skill-pinned. Your behavior doesn't drift mid-RFP — Beta Header and Version Pinning locks model + skill version per call until you explicitly upgrade.*
> *4. Every draft is Accept/Edit/Reject. The Agent never commits. Your team reviews every row.*
> *5. Rejected drafts bill at cost, not value. Our economic incentive is aligned with your quality bar — if the Agent hallucinates, we lose money.*
>
> *This is closer to a document-grounded retrieval system than a chat model. Your team controls every output."*

**Proof point:** Cite-before-state rule (§6.14.2), Confidence thresholds (§6.12.3), Version pinning (C.59), Outcome accounting (§2.4 Seller Pricing).

#### 7.2.3 "I don't want to give my KB to a platform."

**Underlying concern:** Vendor lock-in, IP risk.

**Response:**

> *"Agreed. Here's our position: the KB is yours, not ours. Three commitments:*
>
> *1. Full export at every tier — including Free. Markdown bodies + JSON schema + entry metadata + provenance log + zipped attachments. One click. Never paywalled. Documented publicly.*
> *2. KB namespacing at the data layer: your KB is pre-filtered by your Seller Org ID on every vector search. No retrieval path crosses Seller Orgs. Enforced at the query layer, not the UI.*
> *3. Data residency per Org: US / EU / custom at Enterprise. SOC 2 Type II on 12-month roadmap.*
>
> *What the export can't capture: confidence scores earned from accept/reject signals, staleness state, win-rate weighting, cross-bid citation graph, KB-to-Capability auto-declarations. That's the compounding value — it exists on-platform. We win because your KB becomes more useful here over time, not because we hold the export hostage. Portable content, compounding insight. That's the deal."*

**Proof point:** KB export (§6.13.7, §17.1 Seller Pricing), KB namespacing (§6.13.5, C.52), Data residency (§6.25).

#### 7.2.4 "We don't respond to enough RFPs to justify a tool."

**Underlying concern:** ROI on tooling spend when volume is low.

**Response:**

> *"Agreed — if you respond to fewer than 10 RFPs per year, Starter's $1,788/yr is a hard ROI sell. Two paths:*
>
> *1. Free tier. Unlimited invited bids over time (1 concurrent), 50 KB entries, 1 lifetime KB Bootstrap. Respond for free to any buyer invite. If your RFP volume grows or a second concurrent buyer invites you, upgrade then.*
> *2. Ghost-Bid Importer. If you have 10+ historical RFPs you've responded to, paste them into Ghost-RFP Ingestion — first import free. Seeds your KB with structured entries from prior work. Even without new RFPs, you've built a searchable library for the next invitation.*
>
> *Third thing: your Seller Profile publishes on domain verification the day you sign up. Free. Marketplace inbound from buyers you haven't heard of is a demand source you don't have today. Even at zero marginal cost on Free, that changes your RFP flow."*

**Proof point:** Free tier (§4 Seller Pricing), Ghost-Bid Importer (M15), Published Seller Profile on Free (§4 Seller Pricing).

#### 7.2.5 "The Marketplace isn't big enough yet."

**Underlying concern:** Marketplace liquidity; chicken-and-egg skepticism.

**Response:**

> *"Honest answer. The Marketplace is in Year 1 of commercial deployment. Current inventory is concentrated in [list_current_categories_seeded]. We're seeding 6 categories in Year 1 targeting 700+ sellers (§1.3.1 of our category seeding strategy).*
>
> *What that means for you:*
>
> *1. If you're in a seeded category, your profile benefits from category-page SEO the day you publish. We drive organic traffic to these pages via Category Pages (M9), Comparison Pages (M11), and Market Intelligence Reports (M12).*
> *2. If you're invited by a buyer via M1, you get the full Hero Moment regardless of Marketplace size — Marketplace liquidity doesn't gate invited-bid workflow.*
> *3. Early sellers earn compounding advantage: Verified badge (free when earned), Certified badge (free after 3 closed bids), cross-bid win-rate weighting on KB entries, and Marketplace category inventory ranking.*
>
> *Real bar for me: we have [N] sellers across [N] categories today. Active buyer evaluations: [N] this quarter. Forced-signup conversion rate: [metric]. I'll share the actual numbers if useful. The Marketplace is a three-year build; Year 1 is when early sellers define the category."*

**Proof point:** Category seeding strategy (§1.3.1 Positioning), Verified/Certified tiers (§12.2 Seller Pricing), M9/M11/M12 organic-traffic loops.

#### 7.2.6 "Why would I pay when responding to buyer invites is free?"

**Underlying concern:** Seller sees Free as "good enough."

**Response:**

> *"Correct — responding to buyer invites is free forever. Every tier. Including Free.*
>
> *You pay for three things the Free tier doesn't cover:*
>
> *1. Parallelism. Free = 1 concurrent bid. If a second buyer invites you while your first is in flight, you have to finish one before starting the next. Starter = 3 concurrent. Growth = 15.*
> *2. KB automation. Free = 1 lifetime Bootstrap, 50 entries, manual KB. Starter = weekly Firecrawl crawl, 1,000 entries. Growth = daily Firecrawl, 10,000 entries. Your KB stays current automatically.*
> *3. Outbound + CRM. Free = 0 outbound EOIs, no CRM Sync. Starter = 10 EOIs/mo. Growth = unlimited EOIs + CRM Sync to Salesforce/HubSpot/Dynamics/Pipedrive + numeric Match Scoring + Seller Signals digest.*
>
> *Free is the starting point. Upgrade triggers when you need any of these — usually at the second concurrent buyer invite, or when your KB hits 48 entries, or when your AE team wants outbound Marketplace demand in their CRM."*

**Proof point:** Tier breakdown (§34), conversion moments (§48.1.7 / §48.8.6).

#### 7.2.7 "I don't trust AI-generated responses for compliance content."

**Underlying concern:** Regulatory risk on SOC 2, ISO, HIPAA, DORA statements.

**Response:**

> *"Right skepticism. Compliance content is the highest-stakes category in an RFP. Sourcera's architecture for this specifically:*
>
> *1. Cite-before-state rule with no exceptions. A compliance claim — 'SOC 2 Type II certified since 2023' — is only drafted if a KB entry grounds it with a source URL showing that claim. If the KB is silent, the response is silent, not hallucinated.*
> *2. KB Staleness Classifier. Every KB entry carries an expiration-aware confidence modifier. A SOC 2 certification dated 18 months ago carries a lowered confidence score automatically. Stale entries are flagged for re-verification before being cited.*
> *3. Firecrawl re-crawls. On Starter (weekly) or Growth (daily), your public trust center, security page, and docs are re-crawled. Changes flag affected KB entries.*
> *4. KB version chain. Every KB entry has a version chain. When you upload a new SOC 2 report, the old one is archived with expiration dates retained. Bids citing the superseded entry auto-flag for re-review.*
> *5. Confidence thresholds suppress low-confidence output. Evidence parsing below 60% doesn't render as an answer.*
>
> *This is a stricter compliance posture than a human writing from a Google Drive folder — a human doesn't cite source URLs or flag staleness automatically.*
>
> *For the highest-stakes compliance content — a specific BAA clause, a pentest scope — your team always reviews. Accept/Edit/Reject. The Agent never commits."*

**Proof point:** KB Staleness Classifier (§6.13.4), KB version chain (§6.13.2), Confidence thresholds (§6.12.3), Firecrawl re-crawl (§6.13.3).

---

## SECTION 8 — PRICING & NEGOTIATION

### 8.1 When and How to Present Pricing

**Rule:** Never present pricing before pain is quantified. The outcome-based consumption model requires 60–90 seconds of framing before a price surface is shown. Presenting a price tag cold triggers "is this worth $X" without context; presenting after pain triggers "is this worth the cost of the pain."

**The presentation sequence (buyer, typical 30-minute demo):**

1. **Minute 3–7 (discovery):** Surface specific pain — hours per evaluation, audit findings, cross-functional participation friction.
2. **Minute 7–23 (demo):** Show what Sourcera does against that pain.
3. **Minute 23–27 (persona deep-dive):** Reinforce specific persona value.
4. **Minute 27–28 (anchor):** State the cost of the current pain. *"A typical evaluation at your size consumes 120–180 hours of cross-functional labor at a $100/hr blended rate — that's $12K–$18K per evaluation. You're running roughly [N] evaluations per year, so we're talking [$X] annually in direct labor cost on a workflow that's still producing audit findings."*
5. **Minute 28–29 (price):** State the tier and annual cost. *"Starter is $299/mo annual — $3,588/yr — pays for itself in the first evaluation. Growth is $799/mo annual — $9,588/yr — pays for itself in the first quarter."*
6. **Minute 29–30 (trial close):** Move to Free as the zero-friction entry point.

**The presentation sequence (seller, typical 20-minute demo):**

1. **Minute 2–5 (discovery):** RFP volume + current tooling + CRM.
2. **Minute 5–17 (demo):** Three wow moments.
3. **Minute 17–18 (competitive anchor):** *"You're paying Loopio $15–20K/yr or Responsive $7–15K/yr. Sourcera Growth at $5,988/yr replaces that AND adds Marketplace demand your current tool doesn't ship."* Or if no current tooling: *"Your SE team spends ~15 hrs/wk on RFPs at a $150/hr loaded rate = ~$117K/yr. Starter is $1,788/yr."*
4. **Minute 18–19 (price):** Present Starter or Growth based on qualification.
5. **Minute 19–20 (close):** Free as entry, upgrade on Conversion Moment.

### 8.2 The Anchoring Technique — Cost of Current Workflow

The single strongest anchor is **current labor cost**, not competitor price.

**Buyer anchor math (memorize and rehearse):**

- Mid-market evaluation: 120–180 cross-functional labor hours.
- Blended loaded rate: $100/hr (Procurement $80, Legal $180, InfoSec $140, end users $70).
- Per-evaluation direct labor cost: **$12,000 – $18,000**.
- Annual volume: 4–12 evaluations.
- Annual direct labor cost on evaluation work: **$48K–$216K**.
- Sourcera Starter at $3,588/yr is **1.5% to 7.5% of current labor cost** for the same outcome.

**Seller anchor math:**

- Mid-volume seller: 30–100 RFPs/yr.
- Per-RFP labor at a $150/hr loaded SE rate × 6 hours avg = **$900/RFP**.
- Annual direct labor cost: **$27K–$90K**.
- Sourcera Starter at $1,788/yr is **2% to 6.6% of current labor cost** for 40–60% time savings.

Use these ratios. *"You're spending $60K on this workflow today. We charge $3,600. That's not a pricing conversation — it's an arithmetic conversation."*

### 8.3 ROI Calculation Formulas

**Buyer ROI formula:**

```
Annual_Evaluations × Hours_Per_Evaluation × Blended_Hourly_Rate × Time_Savings_Pct
                                  -
                                Sourcera_Annual_Cost
                                  =
                                Net_Annual_Value
```

**Defaults for mid-market buyer:**

- Annual_Evaluations = 6
- Hours_Per_Evaluation = 150
- Blended_Hourly_Rate = $100
- Time_Savings_Pct = 35% (conservative; Sourcera claims 30–50%)
- Sourcera_Annual_Cost (Starter) = $3,588

**Calculation:** (6 × 150 × $100 × 0.35) - $3,588 = **$27,912 net annual value** on Starter. **Payback period: 6.1 weeks.**

**Seller ROI formula:**

```
Annual_RFPs × Hours_Per_RFP × Blended_SE_Rate × Time_Savings_Pct
          +
   Incremental_Deals_From_Marketplace_and_Faster_Response × Avg_Deal_ACV × Gross_Margin_Pct
          -
        Sourcera_Annual_Cost
          =
         Net_Annual_Value
```

**Defaults for mid-volume seller (Growth tier):**

- Annual_RFPs = 50
- Hours_Per_RFP = 6
- Blended_SE_Rate = $150
- Time_Savings_Pct = 45%
- Incremental_Deals = 2 (conservative — latency and Marketplace discovery combined)
- Avg_Deal_ACV = $100,000
- Gross_Margin_Pct = 70%
- Sourcera_Annual_Cost (Growth) = $5,988

**Calculation:** (50 × 6 × $150 × 0.45) + (2 × $100,000 × 0.70) - $5,988 = **$154,262 net annual value** on Growth. **Payback period: 2.0 weeks.**

### 8.4 Discount Policy — Annual vs. Monthly Is the Primary Lever

**Standard discount posture:**

- **Annual billing discount vs. monthly:** Built into the pricing table. Annual saves 14–20% per tier (e.g., Buyer Starter $299/mo annual vs $349/mo monthly = 14% savings). This is the only discount offered on self-serve Business tiers.
- **No founder-override discounts on Starter or Growth.** The price is the price. If the prospect can't pay Starter, they belong on Free.
- **Scale has one founder-override lever:** If a prospect signs a 2-year prepaid contract, offer a 10% additional discount off annual. Document in CRM.
- **Enterprise is always custom.** Volume discounts on committed AI spend: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+ (§6 Buyer Pricing, §8 Seller Pricing).

**Rules for holding the line:**

- If pressed for a discount on Starter: *"I hold Starter pricing for everyone. The way we make it cheap is the pricing model — unlimited seats, outcome-accounted AI, value-dollars not tokens. Discounting cycles would force that model to become fragile."*
- If a prospect says "competitor X offered me a cheaper starting price": respond with feature-parity math. Most often Responsive/Loopio "starting prices" exclude their KB automation or Q&A product. Our feature-complete anchor holds.
- If a prospect demands a trial beyond Free: *"Free is the trial. It's a full feature set for one evaluation (buyer) or one bid (seller). A time-limited trial of Starter would be artificial — if Free works, upgrade makes sense; if Free doesn't work, Starter won't either."*

### 8.5 Handling "Can We Get Enterprise Features on Business?"

**Typical ask:** *"We want SSO on Business Growth."* Or: *"We need a custom DPA but we're only Business-size."*

**Response:**

> *"Short answer: no. SSO, SCIM, custom DPA, data residency, and dedicated CSM are Enterprise-only, and the reason is structural — the dedicated CSM load on Enterprise customers is what makes those features sustainable at 90%+ gross margin. If we offered them on Business, the unit economics collapse and the entire pricing model fragiles.*
>
> *"Three options:*
>
> *1. Do you genuinely need SSO / DPA — or is it a 'nice to have' flagged by your InfoSec team? If nice-to-have, Business Scale ($1,999/mo annual) is your fit and we skip Enterprise.*
> *2. If SSO is mandatory, you're an Enterprise customer by definition. Enterprise floor is $3K/mo with committed AI spend minimum of $12K/yr. Annual contract = $48K+. We can walk through whether that fits.*
> *3. If the ask is 'we want Enterprise features but can't commit to the floor,' the honest answer is Enterprise isn't the right package for you today. Business Scale with a manual workaround (e.g., monthly audit log exports instead of SCIM) might cover it until you scale into the Enterprise commit."*

The founder's job is not to maximize deal size — it is to route the prospect to the right tier for their actual need. Enterprise is gated by {SSO, DPA, $12K AI commit, custom integration} for margin reasons, not sales reasons.

### 8.6 The Unlimited-Seats Argument — "Invite Your Whole Team, It Costs the Same"

**Context:** Prospects from per-seat backgrounds (Salesforce, Coupa, Microsoft) reflexively count seats. The unlimited-seats positioning often doesn't land without a concrete example.

**The talk track:**

> *"Procurement is cross-functional. A typical evaluation at your size touches 5 to 9 distinct roles across 3 to 6 functions — Procurement, Legal, InfoSec, IT, Finance, end users, and an Executive Sponsor. If you priced seats, you'd either limit participation (which is exactly what creates audit findings) or fight your CFO about seat count every quarter.*
>
> *"Sourcera doesn't charge for seats. Your whole team is in every evaluation. Legal is in Phase 1 — stakeholder alignment. InfoSec is in Phase 4 — policy upload. Finance is in Phase 5 — TCO modeling. IT is in Phase 8 — integration review. Every stakeholder's full participation is included in the plan.*
>
> *"The price lever is AI consumption — where the real cost is. You pay for the Agent work that saves your team hours. That's the thing we should charge for. Your team's participation isn't a pricing surface; it's the entire point of the product."*

**Concrete example to use in demo:**

> *"Picture this: you invite your CISO, your Legal Counsel, your Director of IT, your CFO, your FP&A Analyst, your 3 line-of-business leads, and 2 procurement analysts — 10 people — into Sourcera on your Starter plan at $299/mo. Total seat cost: $0. Total Starter cost: $299. Compare to Coupa at ~$1,500–$2,500/seat/year × 10 seats = $15K–$25K/yr. Same workflow, 5× price."*

### 8.7 Explaining the AI Budget to a Non-Technical Buyer

Non-technical buyers (often CFOs, sometimes Procurement leaders) struggle with the concept of a consumption-based AI budget. The frame:

> *"Think of it like a contractor who only charges you for work you keep.*
>
> *"Every time Sourcera's Agent does something — pre-scores a vendor's response, drafts a Q&A answer, parses a SOC 2 report — it does a specific piece of work that we meter.*
>
> *"If the Agent's output is good and your team accepts it, or edits less than 30%, we bill the full 'value price.' The Agent saved real work.*
>
> *"If the Agent's output is wrong and your team rejects it, we bill only the 'cost price' — about 10% of the value price. Essentially nothing.*
>
> *"Your included AI budget is sized in value-dollars, not tokens. If Anthropic raises their prices, we absorb the difference — your budget still buys the same amount of value.*
>
> *"So your budget number — $50/mo on Starter, $300/mo on Growth — represents what the Agent can actually do for you, not what it costs us to run. And since rejected outputs cost you almost nothing, you have every incentive to let the Agent try work where you're not sure it'll help. If it fails, it's free. If it succeeds, you saved the time."*

Then show the Usage Dashboard — a real screenshot with per-capability spend, acceptance rate, and top consumers. This makes the abstract concrete.

### 8.8 Negotiation Patterns That Work

**Pattern 1 — The "Free first" de-escalation.** When a prospect is haggling price, return to Free. *"You don't have to decide pricing today. Run your first evaluation on Free. If the value is there, the Starter conversation becomes easy; if it isn't, you haven't spent a dollar."*

**Pattern 2 — The annual-commit close.** When a prospect is bouncing between monthly and annual, quantify: *"Annual saves you $600/yr on Starter. That's two more AI budget cycles, or a Scenario Modeling run you didn't have to pay for. Unless you think you're churning in 4 months, annual is always the better economic choice."*

**Pattern 3 — The Enterprise-gate-as-savings frame.** When Enterprise prospects resist the $3K/mo floor: *"The $3K/mo floor isn't a sales invention — it's a margin threshold. Below it, we can't sustain the dedicated CSM and the feature set. Two alternatives: Scale at $1,999/mo if your requirement set fits, or a 2-year prepaid Enterprise commit at 10% off annual. Which fits your procurement cycle better?"*

**Pattern 4 — The competitor-price dismissal.** When Responsive or Loopio offers a better price: *"I'd ask to see their written quote. Their 'starting price' usually excludes the feature you actually need — KB automation on Responsive Starter, CRM integration on Loopio Starter. If the full-feature comparison still undercuts us, we'll talk. Until then we're comparing different products."*

**Pattern 5 — The bundled-expansion play.** For a buyer org that is also a seller: *"You're on Buyer Growth at $799/mo. Your sales team runs 40 RFPs a year. Let's add Seller Starter — that's $149/mo, shared AI budget pool ($330 combined), unlimited seats across both consoles. One Org, two consoles, one contract."*

---

## SECTION 9 — POST-SALE ONBOARDING (SOLO OPERATOR)

The founder-led motion runs onboarding itself. The goal is to turn every new customer into (a) a successful first evaluation or first bid, (b) a reference / case study within 90 days, and (c) an expansion candidate within 180 days. All three are built into the cadence.

### 9.1 BUYER ONBOARDING — 30-Day Cadence

**Day 0 (signup / paid plan activation):**

- Automated welcome email from `[founder]@sourcera.com` — signed personally, includes calendar link for a 20-minute "kickoff call" offer.
- PostHog event: `buyer_paid_activation` — triggers internal CRM task for founder review.
- If signup was Enterprise: calendar auto-books kickoff within 48 hours.

**Welcome email template:**

> **Subject:** Welcome to Sourcera, [first_name] — here's how we get your first evaluation live
>
> [first_name],
>
> You just activated [plan_tier]. I'm [founder_name], Sourcera's founder — and I personally kick off every new paid account this year.
>
> **The 30-day onboarding plan:**
>
> — **Day 0 — today:** 20-minute kickoff call if you want it. Optional but recommended. Calendar: [cal_url_20min]
> — **Day 3:** Your first evaluation configured with your team invited.
> — **Day 7:** First Pre-Scoring run completed. Aha moment.
> — **Day 14:** Phase 4 or later — Legal, InfoSec, Finance invited and actively scoring.
> — **Day 30:** First Selection Report generated. I ask you for a reference call.
>
> **Resources:**
>
> — Docs: [docs_url]
> — Sample Selection Report: [sample_url]
> — Video walkthroughs (12-part series): [video_url]
> — Slack Connect (direct line to me): [slack_connect_invite]
>
> **Unlimited seats.** Invite your team today — it costs nothing extra.
>
> Welcome.
>
> [founder_name]
> Founder, Sourcera

**Day 3 checkpoint:**

Automated check: has the customer created their first evaluation? If yes, pass. If no, founder sends personal note:

> [first_name] — saw you haven't spun up an evaluation yet. Two questions: (1) is there something blocking the setup, or (2) is the next evaluation not until later this quarter? Either way, happy to help — or wait until you're ready.

**Day 7 checkpoint:**

PostHog check: has `buyer_first_pre_score_completed` fired? If yes, pass. If no, founder sends:

> [first_name] — your evaluation's been live [N] days. The Pre-Scoring run is the moment the value lands — takes 60 seconds on a loaded vendor response. Want to walk through it? 15-minute screen share: [cal_url_15min]

**Day 14 checkpoint:**

Review customer's workspace (with their permission — granted at signup). Check: Has the evaluation progressed past Phase 3? Have multi-role invites been accepted? Is the Pulse Health Score in healthy range (>60)?

If any red flag, founder sends a tailored note:

> [first_name] — a 30-second check-in on your [workspace_name] evaluation: [specific_observation]. Want to troubleshoot on a quick call? [cal_url_15min]

**Day 21 checkpoint:**

If evaluation is in Phase 7+ (Response Compilation or later), founder surfaces the Selection Report preview:

> [first_name] — you're in Phase [N]. The Selection Report is starting to populate — TCO summary, Scoring Matrix, Disagreement Cards. Want me to walk through what's auto-generating vs. what needs your team's input before close? [cal_url_15min]

**Day 30 — First Selection Report / Case Study Ask:**

Whether or not the evaluation has closed, send the reference ask:

> **Subject:** Day 30 check-in + a favor
>
> [first_name],
>
> Thirty days in. Two things:
>
> 1. **Your Pulse Health Score is [N] and you're in Phase [N].** How's the experience been? Anything broken or missing that I should fix?
>
> 2. **A favor.** If Sourcera's been useful, three ways to help:
>    — **Reference call:** I'd love to connect you with a prospect in your industry who's evaluating Sourcera. One 30-min call, whenever works.
>    — **Case study:** Anonymized or named write-up of your first evaluation outcome. I draft it; you review.
>    — **LinkedIn post:** One short note about what changed for you. Optional; no pressure.
>
> None are required, all are appreciated, pick whichever (if any) fits. Happy to reciprocate — intros to customers, advisors, or investors in my network.
>
> [founder_name]

### 9.2 SELLER ONBOARDING — Lighter Touch (Hero Moment Does the Work)

Seller onboarding is structurally lighter because the Hero Moment delivers activation in the first 35 minutes, not over 30 days. The founder's job is to surface upgrade triggers and catch churn signals.

**Day 0 — Signup (Forced or Organic):**

- If Forced-Signup: the Hero Moment runs inside SSO redirect. No founder touch required.
- If Organic: automated welcome email from `[founder]@sourcera.com` with calendar link for 15-minute "walkthrough call."

**Organic welcome email:**

> **Subject:** Welcome to Sourcera, [first_name]
>
> [first_name],
>
> Your Seller Org is live and your Seller Profile is published at [public_url].
>
> **Three things to try in your first 30 minutes:**
>
> 1. **KB Bootstrap.** Free-tier lifetime. Go to Settings → KB → Bootstrap. 60 seconds to build a structured library from your website.
> 2. **Ghost-Bid Import.** If you have historical RFPs, paste one. First import free. Seeds your KB with prior work.
> 3. **Browse the Marketplace.** See buyer evaluations in your category.
>
> If you want a 15-minute walkthrough: [cal_url_15min]. Otherwise, explore — I'll check in at day 7.
>
> [founder_name]

**Day 7 automated check:**

PostHog: did the seller submit a bid, accept a KB entry, or browse the Marketplace? If none, founder sends:

> [first_name] — week in. What's working? If setup is harder than it should be, I can walk through it in 15 minutes. If you're waiting for a buyer invite, your published profile is live — here's the URL: [public_url].

**Day 14 — First Bid Submitted Trigger (Forced-Signup):**

When `seller_bid_submitted` fires for the first time, founder sends:

> [first_name] — congrats on your first bid on Sourcera. Quick question: how was the Hero Moment experience? Did the first-pass drafts save you time, or did you end up rewriting most of them?
>
> Either way, would love to jump on a 15-minute call — I'm using this feedback to tune the Bootstrap and First-Pass models weekly.

**Day 30 — Upgrade Trigger Review:**

If any of the Three Conversion Moments have fired:

- **Second concurrent bid invite** → Second-invite play (§3.2)
- **First EOI attempt** → Outbound-intent play
- **KB 50-entry ceiling** → KB-investment play

For each, send the moment-specific email (§48.1.7 / §48.8.6; lifecycle email authority in §41).

If none have fired by day 30, the seller is Free-stable. Founder sends a quarterly check-in pattern:

> [first_name] — 30-day check-in. Your Seller Profile is live; you've responded to [N] bids; your KB has [N] entries. If things are quiet on the buyer-invite side, let me know — might be a category-seeding issue on our side. Otherwise, I'll check in next quarter.

### 9.3 Turning New Customers Into References and Case Studies

**Systematic approach — "the reference factory":**

Every paying customer is approached for a reference ask at **Day 30** (buyer) or **first successful bid** (seller). The founder offers three options: reference call, case study, LinkedIn post.

**Expected conversion:**

- 25% of customers do nothing (no harm, don't re-ask for 90 days).
- 50% agree to a reference call.
- 20% agree to a case study (draft by founder, reviewed by customer).
- 15% agree to a LinkedIn post (often short).
- 10% do all three (champion customers).

**Case study template (one-page):**

```
CASE STUDY — [COMPANY NAME]

THE CHALLENGE
[3 sentences — specific pre-Sourcera pain, including a concrete metric]

THE SOLUTION
[3 sentences — which Sourcera capabilities addressed which pain]

THE OUTCOME
[3 sentences — specific metrics: time saved, evaluations closed, audit findings prevented]

IN THEIR WORDS
"[Pull quote from champion — 1-2 sentences]"
— [name], [title]

COMPANY DETAILS
Industry: [industry]
Size: [employees] employees
Plan: [tier]
Time on Sourcera: [duration]
```

**LinkedIn post template for the customer:**

> Sometimes a tool actually changes the workflow. Our [team_name] team replaced [current_workflow] with [@Sourcera] and the Phase 13 Selection Report cut our exec-review prep from a weekend to a day. If you're running software evaluations on spreadsheets and email, it's worth 20 minutes.

**Reference call logistics:**

- Reference customer is matched to prospect by industry and company size.
- 30-minute call, prospect and customer only (founder not present unless both request).
- Founder sends debrief to both sides after.
- Customer gets 10% annual credit for every reference call that closes a deal. Small enough to be non-mercenary, meaningful enough to prioritize.

### 9.4 The "Second Evaluation / Second Bid" Expansion Play

The highest-expansion signal on the buyer side is **a second evaluation started within 30 days of close of the first**. On the seller side, it's **a second concurrent bid invitation**.

**Buyer expansion trigger:**

When PostHog fires `buyer_workspace_created` for the second time on a Starter account:

- If the first evaluation closed successfully → trigger expansion play.
- If the first evaluation stalled → troubleshoot first.

**Buyer expansion email:**

> **Subject:** Your second evaluation — quick note on plan fit
>
> [first_name],
>
> You just started [evaluation_2_name]. Your first was [evaluation_1_name] which closed [N] days ago at Phase 13 with Selection Report [brief_summary].
>
> Quick fit note: Starter supports 5 active evaluations and $50/mo AI budget. If this second evaluation is going to overlap meaningfully with the first (still in Phase 13 cleanup or reference calls), you'll start consuming AI budget from both.
>
> Two paths:
>
> 1. Stay on Starter, watch the AI budget. Most Starter teams at 2 concurrent evals use 40–70% of budget.
> 2. Upgrade to Growth ($799/mo annual). 20 active evaluations, $300 AI budget, all features unchanged. Carry-over immediate, no data migration.
>
> Not pushing — just making sure you know where the ceiling is. Calendar if helpful: [cal_url_15min].
>
> [founder_name]

**Seller expansion trigger:**

When `seller_concurrent_bid_limit_hit` fires on a Starter account (3-concurrent ceiling): send Second-Invite play (§3.2) upgrade message. Offer Growth ($499/mo annual) with 15 concurrent bids if the seller is running a tight pipeline.

**Expansion targets by tier (internal):**

- Starter → Growth expansion target: 30% within 6 months.
- Growth → Scale: 15% within 12 months.
- Scale → Enterprise: 10% within 18 months (gated by Enterprise triggers).

### 9.5 Churn Prevention — What to Watch in PostHog

Churn on consumption-based plans is asymmetric: paid customers who stop using AI capabilities for 60 days are pre-churn. Watch these specific signals:

**Buyer early-churn signals (weekly review):**

| Signal | Threshold | Intervention |
|---|---|---|
| AI budget utilization <10% for 2 consecutive months | 2-month rolling | Send "usage check" email — is there a blocker or did needs change? |
| No new evaluation created in 90 days | 90d | Send outreach — "anything we can help unstick?" |
| Stakeholder invite count declining month-over-month | MoM 3 consecutive | Team engagement declining — offer onboarding refresh |
| Pulse Health Score <40 on any active evaluation | real-time | Intervene immediately |
| Support ticket volume >3 in 30 days | 30d rolling | Personal founder outreach |
| Zero login in 30 days | 30d | Reactivation email with specific feature update |

**Seller early-churn signals:**

| Signal | Threshold | Intervention |
|---|---|---|
| No bid activity (submitted or drafted) in 60 days | 60d | Outreach — is Marketplace inventory stale in category? |
| Firecrawl failures on source URL for 3 consecutive weeks | 3wk | Engineering triage + customer notify |
| KB entries growth <5 in 60 days | 60d | Ghost-Bid Import offer |
| EOI submission count = 0 in 90 days on Growth+ | 90d | Matchmaking — are we routing listings correctly? |
| Zero login in 30 days | 30d | Reactivation email |

**Churn intervention email template (example):**

> **Subject:** Quick check-in on Sourcera
>
> [first_name],
>
> Noticed your Sourcera usage has been light the last couple months — no judgment, just wanted to check in. Three options:
>
> 1. **You're still using it, just less actively.** Great — no action needed.
> 2. **Something changed on your side** (priorities shifted, team change, project stalled). Want me to pause your plan for 30 days while you figure out next steps? Free pause, no data deletion, resume whenever.
> 3. **Something's not working.** Tell me what. I'll fix it if I can, or help you transition off if Sourcera isn't the right fit.
>
> Reply with 1, 2, or 3 — or jump on a 15-minute call: [cal_url_15min].
>
> [founder_name]

**Pause offer is key.** A 30-day pause converts significantly more than a cancel-offer — many churners were going to return; the pause keeps them without the cancel friction.

**Cancel-save offer — last resort:**

If a customer explicitly requests cancellation:

- Immediate acknowledgment: "totally understood, won't try to save you if you're set."
- One specific ask: *"Before we process, can I ask what the primary reason is? I'll use the answer to improve Sourcera for the next customer. Three options: (1) didn't see enough value, (2) price, (3) team change / priorities."*
- For (1) and (2), offer one retention lever: annual downgrade to a cheaper tier, or 3-month pause.
- For (3), do not resist. Process cancellation with data export instructions and a warm handoff.
- Record cancel reason in CRM with a quarterly win-back queue for (3).

**Win-back campaign (quarterly):**

Every 90 days, founder emails the cancel-for-reason-3 cohort with a short update:

> [first_name] — quarterly check-in. Three things that changed at Sourcera this quarter: [feature_1], [feature_2], [customer_outcome_3]. If your situation has shifted and Sourcera's worth another look, reply "restart" — I'll reactivate your Org with your data intact. Otherwise, no action needed.

---

## Appendix A — Weekly Founder Dashboard (at a glance)

The founder reviews this every Wednesday at 08:00 for 60 minutes. Sourced from PostHog + Stripe + Attio.

| Metric | Target | Red flag |
|---|---|---|
| New buyer Free signups / wk | 50+ at M6, 100+ at M12 | <25 for 3 consecutive weeks |
| New seller Free signups / wk (split Forced vs Organic) | 70+ at M6, 200+ at M12; ≥60% Forced | Organic >70% = category seeding broken |
| Buyer Free → Starter conversion % | 8–12% at steady state | <5% |
| Seller Free → Starter conversion % | 12–18% (Forced-Signup cohort) | <8% Forced cohort |
| Demo-booked rate on PQL ≥ 50 | 30%+ | <15% |
| Demo → paid conversion % (buyer) | 25%+ at M6, 30%+ at M12 | <15% |
| Demo → paid conversion % (seller) | 30%+ at M6, 35%+ at M12 | <20% |
| Days to first Pre-Scoring (Buyer Free) | p50 <3 days, p90 <10 days | p50 >5 days |
| Minutes to first submitted requirement response (Seller Forced) | p50 <20 min, p90 <60 min | p50 >30 min |
| Starter → Growth expansion % at 6 mo | 30%+ | <15% |
| Blended gross margin | ≥90% | <85% |
| Rejected-op rate on First-Pass Responder | <30% | >40% |
| Weekly churn $ | <1% MRR | >3% |
| NPS (quarterly survey) | >50 | <30 |

---

## Appendix B — The Solo-Operator Weekly Calendar Template

Use this as the literal default calendar. Block on Sunday night for the week ahead. Adjust for time zones and holidays.

```
MONDAY
  07:30–08:30  PQL triage (both sides)
  08:30–09:15  Pipeline review (every deal, next step)
  09:15–10:00  Inbound PQL outreach
  10:00–12:00  Buyer demos (max 2)
  12:00–13:00  Lunch / inbox triage
  13:00–15:00  Deep work — content
  15:00–17:00  Outbound prospecting (buyer-heavy)
  17:00–18:00  CRM hygiene + next-day prep

TUESDAY
  07:30–08:30  PQL triage
  08:30–10:30  Deep work — content (ship 1 LinkedIn post + 1 Substack)
  10:30–12:00  Seller demos (max 2)
  12:00–13:00  Lunch
  13:00–15:00  Seller outreach (Responsive/Loopio switchers + second-invite plays)
  15:00–17:00  Customer onboarding check-ins (Day-3, Day-7, Day-14 checkpoints)
  17:00–18:00  CRM hygiene

WEDNESDAY
  07:30–08:30  PQL triage
  08:30–09:30  Metrics review (14 leading indicators)
  09:30–12:00  Demos (buyer or seller)
  12:00–13:00  Lunch
  13:00–15:00  Product + engineering sync
  15:00–17:00  Outbound prospecting (buyer-heavy)
  17:00–18:00  CRM hygiene

THURSDAY
  07:30–08:30  PQL triage
  08:30–09:15  Win/loss debrief (all deals closed/stalled in last 7 days)
  09:15–12:00  Demos
  12:00–13:00  Lunch
  13:00–15:00  Seller outreach
  15:00–17:00  Partner/channel outreach (integration + advisor)
  17:00–18:00  CRM hygiene

FRIDAY
  07:30–08:30  PQL triage
  08:30–10:00  ICP drift review + CRM pruning
  10:00–12:00  Reference call coordination + case study drafting
  12:00–13:00  Lunch
  13:00–15:00  Content deep work (video, podcast, category content)
  15:00–17:00  Weekly Loom updates for warm pipeline (short video send)
  17:00–18:00  Week review + Sunday prep
```

---

## Closing Note on Drift Prevention

Every script, sequence, demo path, and objection response in this playbook anchors to the pricing and positioning in the authoritative source documents as of 2026-04-20. When those documents update:

- Buyer pricing ($299 / $799 / $1,999 / Enterprise $3K floor) — any change requires updating Sections 5, 6, 7, 8.
- Seller pricing ($149 / $499 / $1,499 / Enterprise $3K floor) — any change requires updating Sections 3, 6, 7, 8.
- AI budget numbers ($5 / $50 / $300 / $800 buyer; $5 / $30 / $200 / $600 seller) — embedded in every sequence; update in place.
- Persona framework (Priya, Marcus, Elena, Dan, Jordan, Sam, Aisha, Leo, Rachel) — if renamed or restructured in positioning, update Section 2 sequences.
- Hero Moment semantics — embedded in Section 6 demo and Section 3 second-invite play; any change requires rewrites.
- The Dual-Console firewall, Fixed 13-phase pipeline, and Marketplace claims — load-bearing for every competitive rebuttal in Section 7.

Messaging should never out-run the spec. If a campaign requires a claim this playbook does not support, update the source document first.

The playbook assumes one operator, 45–55 hours/week, indefinitely. It is not a scaling document. When the motion outgrows the solo-operator frame — typically at ~$1.5M ARR or ~60 paid accounts, whichever comes first — this playbook is the input to a next-stage sales-ops design, not the design itself.
