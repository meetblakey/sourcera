# Sourcera — GTM Positioning

**Version:** 1.0
**Date:** 2026-04-20
**Purpose:** The strategic messaging foundation for Sourcera. Defines who we sell to on both sides of the platform, why they buy, how we are different, and what we say. Every downstream GTM artifact — landing pages, cold outbound, sales enablement, paid acquisition, category content — derives from this document.
**Source authority:** `Sourcera_Master_Spec.md` §1, §2, §27, §34, §48, §49 · `Sourcera_Buyer_Pricing_Strategy.md` v3 · `Sourcera_Seller_Pricing_Strategy.md` v3.
**Status:** GTM narrative companion. Master Spec wins for product, pricing, Marketplace, Seller KB, and commercial-wedge behavior.

---

## Reading Order and How to Use This Document

Sourcera is a two-sided platform with a third cross-cutting domain (the Marketplace). Buyer-side and seller-side messaging are structurally non-interchangeable — different economic buyers, different pain, different price bands, different competitors, different conversion mechanics. This document is organized so that buyer-side and seller-side material sits side-by-side at every level (ICP, personas, positioning, copy). Treat the two tracks as independent GTM systems that happen to share pricing infrastructure and a marketplace bridge.

Every piece of copy in §7 is drafted as production-grade. If a line reads awkwardly for a given channel, rewrite for voice, but do not rewrite the claim — the claims are load-bearing against the pricing, the Hero Moment, the Dual-Console firewall, and the fixed 13-phase pipeline.

---

## SECTION 1 — Ideal Customer Profile

### 1.1 Buyer ICP

#### 1.1.1 Segmentation

| Dimension | Primary Buyer ICP | Expansion Buyer ICP | Wedge Buyer ICP |
|---|---|---|---|
| Employee count | 500–5,000 | 200–500 and 5,000–20,000 | 200–800 |
| Annual software spend | $2M–$20M | $500K–$2M and $20M–$75M | $500K–$3M |
| Evaluations per year | 4–12 | 2–4 and 12–40 | 1–3, but active *now* |
| Industry concentration | Financial services, healthcare, higher ed, state/local government, insurance, life sciences, regulated manufacturing, SaaS companies $50M+ ARR | US federal (via StateRAMP/FedRAMP adjacencies), utilities, telecom | Any regulated mid-market running a single evaluation in the next 60 days |
| Procurement maturity | Formal procurement function; separate Legal, InfoSec, and IT review tracks; some form of vendor-risk policy exists | Procurement may be centralized in Finance or IT; risk review is ad hoc | No central procurement; evaluation is run by a line-of-business leader |
| Current state | 6–12 week evaluation cycles; audit findings in last 24 months; board-mandated SOC 2 / ISO 27001 compliance; at least one failed evaluation in memory | Fast-growing; procurement is a bottleneck; no tooling yet | Running a specific painful evaluation *now* |

The Primary Buyer ICP is the target for the first 100 paying customers. The Wedge ICP is the target for organic-search, content, and outbound in Q3–Q4 2026 — these accounts convert fastest because they arrive pre-qualified by active pain.

#### 1.1.2 Trigger Events (ranked by conversion speed)

1. **An auditor finding that cited inconsistent vendor evaluation or missing decision documentation.** Fastest-converting trigger. The buyer has 30–90 days to produce a remediation plan. Sourcera's SHA-256 hashed Selection Record (§6.37) and complete audit log (§6.24) are the exact artifacts the auditor is asking for.
2. **Failed or contested vendor evaluation where the selected vendor was sued, protested, or produced a post-facto justification problem.** The buyer has institutional memory of why this went wrong. Sourcera's Append-Only Grade History (§6.3.6), Disagreement Insight Cards (§6.3.4), and immutable Phase 9 snapshots (§6.2) map directly.
3. **New CISO, new CTO, or new Chief Procurement Officer in seat <6 months.** Change-of-leadership triggers a tooling review. The new leader has political cover to replace spreadsheets and wants a "modern stack" announcement inside their first year.
4. **Compliance mandate — SOC 2 Type II, ISO 27001, HIPAA, NYDFS 500, DORA, PCI-DSS 4.0, FedRAMP readiness — that forces documented vendor-risk procedures.** Policy-Powered Requirement Generation (§6.6) is the unlock. Upload NIST 800-53, ISO 27001, or SOC 2 control set; the Agent extracts structured requirements with traceability back to source control.
5. **An upcoming top-5 software purchase of $1M+ TCO.** The buyer is building a spreadsheet *now* and knows this one will be scrutinized. Sourcera's TCO Modeling (§6.5) with structured pricing inputs (flat, tiered, one-time, percentage-of-license, estimate-range, discount) and Scenario Modeling (§6.4) are the conversion hook.
6. **Digital transformation program where procurement is named as a lagging function.** Slower conversion but larger deal size. Usually routes to Enterprise.
7. **Merger, acquisition, or carve-out creating duplicate SaaS contracts.** Organizational Intelligence (§6.7) surfaces cross-evaluation discrepancy detection — the exact capability needed to rationalize overlap.
8. **First-ever formal board risk committee review of technology spend.** New institutional pressure; procurement has six weeks to produce a process artifact. Conversion-ready.

#### 1.1.3 Current Tooling Being Replaced

The single largest Sourcera competitor is not a product. It is a workflow:

```
Excel/Google Sheets (one tab per vendor)
  + SharePoint/OneDrive/Google Drive folder for RFP responses
  + Outlook/Gmail threads for vendor Q&A
  + a PowerPoint deck authored in the last week of the evaluation
  + a Word document titled "Selection Memo" that nobody can find two years later
```

Secondary replacements: Coupa Contingent Workforce modules misused as vendor-evaluation repositories; Ivalua Sourcing for organizations that bought the suite but never configured the evaluation workflow; Jaggaer sourcing modules used in state and local government; SharePoint lists with custom columns; Smartsheet-based RFP templates; Airtable bases labeled "Vendor Evaluation v3 FINAL FINAL."

Sourcera's displacement argument is not "we are better than Coupa." It is "Coupa is a P2P suite; the evaluation is still happening in spreadsheets beside it." The Dual-Console architecture (§6.1), the fixed 13-phase pipeline (§6.2), and the Agent's 21-capability catalog (§6.12.1) are the category-defining assets — none of the replaced tools have them.

#### 1.1.4 Internal Team Structure for Software Purchases

The typical Sourcera buying team contains 5–9 distinct roles, spanning 3–6 functions. This is why Sourcera rejects per-seat pricing: a seat tax suppresses exactly the cross-functional participation the product requires. The roles map into Sourcera's RBAC model (§6.22):

- **Executive Sponsor** (CFO, CTO, CIO, COO, sometimes CEO in mid-market) — approves the final Selection Record, receives Pulse Health Score digests.
- **Workspace Owner** (Senior Procurement Manager, Director of Procurement, Head of Vendor Management) — owns the evaluation end-to-end, approves vendors, signs the Selection Record.
- **Evaluation Lead** (Procurement Specialist, Business Analyst, Category Manager) — day-to-day driver of the evaluation; schedules SLAs, coordinates scorers, manages Phase transitions.
- **IT / Technical Evaluator** (IT Architect, Solutions Engineer, Platform Lead) — scores technical and integration requirements.
- **InfoSec / Security Evaluator** (CISO office, Security Engineer, GRC Analyst) — owns InfoSec Team queue (§6.1.3); reviews SOC 2, pentest, and DPA inputs; uploads compliance frameworks for Policy-Powered Requirement Generation (§6.6).
- **Legal Evaluator** (Commercial Counsel, Legal Operations) — owns Legal Team queue; reviews DPA, BAA, MSA terms; owns Custom Agent Instructions for contract-language flags (§6.12.4).
- **Finance Evaluator** (FP&A Analyst, Finance Business Partner) — owns TCO Use Cases (§6.5); validates pricing structures and multi-year projections.
- **End-User / Line-of-Business Representatives** (3–8 functional leads) — score capability requirements in their domain.
- **Billing Admin** (separate role from Org Owner; added in RBAC for wallet, AI spend caps, billing events — §6.22.1).

If a prospect describes a buying team with fewer than four distinct roles, the account is in the Wedge ICP or undersized for the Primary ICP. If the prospect describes a buying team with more than twelve named roles, route to Enterprise.

#### 1.1.5 Disqualification Criteria (Who Is Not a Buyer Customer)

- Pure P2P automation need (requisition, PO generation, three-way match). Those buyers want Coupa/Ivalua/SAP Ariba.
- Professional services or contingent workforce procurement. Different workflow, different vendor types.
- Single-vendor renewals with no competitive evaluation. Sourcera is a comparison platform; one-vendor workflows waste the price.
- Organizations that score vendors on a single dimension (price-only reverse auction). Sourcera enforces a weight × grade rubric across capability + TCO; single-dimension buyers experience it as overhead.
- Compliance-exempt environments with no audit pressure, no cross-functional team, and no TCO requirement. Free tier fits them permanently; no upgrade path. Acceptable acquisition cost if CAC is near zero; not a target ICP.
- Highly classified or air-gapped environments where Convex cloud hosting is disqualifying. Enterprise custom residency (§6.25) only partially solves this; route only to Enterprise with custom deployment scope.

#### 1.1.6 Plan Tier Entry Point by Sub-Segment

| Sub-segment | Entry tier | Why |
|---|---|---|
| Single-evaluation Wedge ICP (one urgent eval, 1–3 stakeholders) | **Free** | Free tier supports 1 active evaluation, 25 vendors, 50 KB items, $5 AI budget — enough to get a single Pre-Scoring run across 3+ vendors. Aha moment is designed to land here. |
| Mid-market buyer, 1–3 evals/quarter, single-team procurement | **Business Starter ($299/mo annual)** | 5 active evaluations, 250 vendors, $50 AI budget fit a procurement team running sequential evaluations. |
| Mid-market buyer, emerging procurement function, multiple parallel evals | **Business Growth ($799/mo annual)** | 20 active evaluations, 2,500 vendors, $300 AI budget. This is the highest-conviction acquisition tier — the buyer has stopped asking "should we systematize" and started asking "how." |
| Org-wide procurement function, cross-department volume | **Business Scale ($1,999/mo annual)** | Unlimited evaluations, 2 TB storage, unlimited KB, $800 AI budget, shared CSM, 5 Buyer-Funded Pro Trial Seats (M17) for invited vendors. |
| SSO required, custom DPA, ≥$12K/yr AI commit, or custom integration (Coupa, Ariba, ServiceNow, NetSuite) | **Enterprise (custom, $3K/mo floor)** | The gate is not size — it is any one of {SSO, DPA, $12K AI commit, custom integration}. Below this, the CSM load kills margin. Do not sell Enterprise on org size alone. |

### 1.2 Seller ICP

#### 1.2.1 Segmentation

| Dimension | Primary Seller ICP | Expansion Seller ICP | Wedge Seller ICP |
|---|---|---|---|
| Employee count | 50–500 | 10–50 and 500–2,000 | Any size, high RFP velocity |
| RFP volume per year | 30–150 | 10–30 and 150–500 | Any |
| Existing tooling | None, or shared Google Drive, or early-stage Responsive/Loopio deployment | Mature Responsive/Loopio deployment with renewal coming up | None — paste-and-pray from last year's responses |
| Team structure | Revenue team of 2–5; named RFP owner; no dedicated proposal manager | RFP center of excellence with 3–10 people | Solo founder or one-person revenue team |
| Deal band | Annual contract value $25K–$500K | $500K–$5M and <$25K | <$150K ACV |
| Response latency | Need 2–5 day turnaround; currently take 7–14 days | Need same-day to 2-day; currently 3–7 | Responding when invited, losing some because of latency |
| Category | B2B SaaS, managed services, security tooling, analytics, data platforms, API/infra, vertical SaaS for regulated industries | Consulting, implementation services, staff aug, physical goods vendors serving regulated buyers | Any vendor that ever lost a deal because they could not respond in time |

The Primary Seller ICP is the target for seller self-service acquisition (direct signup, SEO, content). The Forced-Signup ICP (see §1.2.3) is the highest-converting path regardless of segmentation — any vendor invited via M1/M5/M15 is, by definition, in the active-pain zone.

#### 1.2.2 Trigger Events (ranked by conversion speed)

1. **Vendor received a buyer invitation from Sourcera via M1 / M5 / M15 / M17** — this is the Forced-Signup path (§48.0.1 / §48.1.2). The vendor is at peak pain: an incoming RFP, a deadline, no chosen tool, a blank response to write, zero existing workflow to defend. This is the highest-yield acquisition channel in the product.
2. **Lost an RFP because of response latency.** "We would have won if we had answered in time." Sourcera's First-Pass RFP Response Generator (§6.14.2) with grounded KB citations collapses first-draft time from days to minutes.
3. **Proposal manager leaving or burned out.** The solo-RFP-manager is the single most common Sourcera seller persona, and attrition in that seat forces a replacement-or-tooling decision in 60–90 days.
4. **Moving upmarket — first bid to an enterprise buyer with a SOC 2 Type II + ISO 27001 requirement list.** KB Bootstrap (§6.13.6) plus KB-to-Capability Auto-Suggestion (C.46) supply the exact structured answer fabric needed.
5. **Entering a new category or vertical where the seller has no template library.** Ghost-Bid Importer (M15, §3.3) lets the seller paste historical RFPs and bootstrap a KB in one session — the only tool in this category that does this.
6. **Loopio / Responsive renewal in the next 90 days with declining user satisfaction.** 3–4× price advantage at parity-or-better features for KB automation + Marketplace discovery bundled.
7. **New head of sales / new head of revenue operations in seat.** Similar to the buyer-side leadership trigger — new leader wants a modern stack. CRM Sync (§6.18) with Salesforce, HubSpot, Dynamics, Pipedrive is the hook.
8. **Seller wants quantified demand signals.** Seller Signals (§6.17) — k-anonymized buyer intent routed to CRM — is the only tool in this category that sources signals from inside active evaluations rather than inferred intent data.

#### 1.2.3 Forced-Signup Path vs. Organic-Signup Path — Different ICPs

The two seller acquisition paths produce structurally different accounts and require separate messaging.

| Dimension | Forced-Signup Path | Organic-Signup Path |
|---|---|---|
| Trigger | Buyer invite via M1 / M5 / M15 / M17 — vendor arrives involuntarily | Self-directed — vendor found Sourcera via SEO, content, referral, or event |
| State on arrival | Peak pain: incoming RFP with a deadline | Investigative: evaluating tools |
| First session | Hero Moment (§48.0.1 / §48.8) — bootstrap + first-pass draft runs inside SSO redirect latency | Onboarding walkthrough, optional Ghost-Bid Import |
| Dominant message | *"Your bid is already drafted."* | *"Win more RFPs. Grind less. Get discovered."* |
| Aha moment | Landing on a Bid Workspace with 47 of 82 requirements pre-drafted, citing their own website | First Pre-Score against a real RFP paste |
| Conversion moments | Second concurrent bid, first EOI attempt, KB 50-entry ceiling | Bid count after 30 days, EOI attempt, KB ceiling |
| Expected tier on upgrade | Seller Starter ($149/mo annual) — the natural first step from Free | Seller Starter or Seller Growth depending on volume — organic signups often bring existing RFP volume and jump tiers |
| Competitive frame | vs. *"respond manually from scratch in 2 days"* | vs. Responsive / Loopio / status quo |

A Forced-Signup vendor who has never heard of Sourcera and has no interest in RFP tooling converts at a materially higher rate than an Organic signup — because they have no alternative in the next 48 hours. The pricing model, onboarding surface, and messaging must not blur this distinction. Forced-Signup vendors see the Hero Moment first and the pricing page only after first bid submission (§48.0.1 / §48.8; pricing authority in §34).

#### 1.2.4 Plan Tier Entry Point by Sub-Segment

| Sub-segment | Entry tier | Why |
|---|---|---|
| Forced-Signup vendor, first-ever bid | **Seller Free** | 1 concurrent bid, 50 KB entries, 1 lifetime KB Bootstrap, $5 AI budget — designed to cover exactly one first-pass-drafted bid end-to-end. |
| Solo founder or 1–2 person revenue team, 10–30 RFPs/yr | **Seller Starter ($149/mo annual)** | 3 concurrent bids, 10 EOIs/mo, 1,000 KB entries, 2 Firecrawl sources, $30 AI budget. Anchors at ~$1,800/yr vs. Responsive ~$7K/yr. |
| Early revenue team (2–5 people) with named RFP owner, 30–100 RFPs/yr | **Seller Growth ($499/mo annual)** | 15 concurrent bids, unlimited EOIs, 10,000 KB entries, daily Firecrawl, CRM Sync, numeric Match Scoring, $200 AI budget. Anchors at ~$6K/yr vs. Loopio ~$15–20K/yr. |
| RFP Center of Excellence, 100+ RFPs/yr, cross-product vendor | **Seller Scale ($1,499/mo annual)** | Unlimited concurrent bids, unlimited EOIs, unlimited KB, real-time Firecrawl, 12 Page Enrichments/yr, weekly + real-time Seller Signals, 1 Promoted placement/mo, read-only API, shared CSM. Anchors at ~$18K/yr vs. Responsive/Loopio enterprise $25–35K/yr. |
| SSO, custom DPA, ≥$12K/yr AI commit, or custom RevOps (Gainsight, Outreach, Salesloft, 6sense) | **Seller Enterprise (custom, $3K/mo floor)** | Same gating logic as buyer Enterprise. Do not sell Enterprise on seller volume alone. |

#### 1.2.5 Disqualification Criteria (Who Is Not a Seller Customer)

- Vendors with zero RFP volume (transactional SMB SaaS with PLG-only motion). No pain. Free tier fits permanently.
- Vendors selling into buyers who never run structured evaluations (consumer SaaS, ad-tech for SMB). No counterparty on the platform.
- Services-only vendors where responses are fully custom each time (boutique consulting). KB compounding hypothesis breaks; Sourcera provides limited value.
- Vendors with hostile procurement relationships where the vendor controls the process (big-four consulting mandates). The vendor does not want structured evaluation.
- Vendors prohibited from using US- or EU-cloud AI (air-gapped government contractors). Only possible on Enterprise custom residency; typically disqualified.
- Vendors whose RFP response workflow requires human-only responses per client contract (a narrow band of federal contractors). Only the manual Bid Workspace is usable; AI-generated first-pass drafts cannot be used; value proposition is substantially weakened.

### 1.3 Marketplace ICP — Category Seeding Strategy

Marketplace liquidity depends on asymmetric supply and demand per category. Sourcera seeds the Marketplace by picking categories where buyers are actively evaluating, sellers have structured response content, and the existing tooling (G2, Gartner) does not own the evaluation moment.

#### 1.3.1 Seed Categories (ranked priority)

| Rank | Category | Rationale | Initial seller density target (year 1) |
|---|---|---|---|
| 1 | **Security & GRC** (SIEM, SOAR, XDR, GRC platforms, DLP, IAM, PAM, CSPM) | Highest-friction evaluations, heaviest compliance documentation burden, most acute Policy-Powered Requirement Generation (§6.6) fit | 200+ sellers across 8 sub-categories |
| 2 | **Data & Analytics** (BI platforms, CDPs, reverse ETL, data observability, data catalogs, data governance) | Fast-growing category with weak category pages on G2; structured TCO (§6.5) is a strong wedge | 150+ sellers |
| 3 | **DevOps & Platform Engineering** (CI/CD, IaC, secrets management, internal developer platforms, observability) | Engineering buyers prefer structured evaluation; sellers have excellent public docs for KB Bootstrap (§6.13.6) | 150+ sellers |
| 4 | **Revenue Operations** (Sales engagement, CRM adjacent, revenue intelligence, CPQ, partner management) | Dense existing competitive landscape; CRM Sync (§6.18) plus Seller Signals (§6.17) make Sourcera more valuable to the seller than Responsive | 100+ sellers |
| 5 | **HRIS / HR-Tech** (HRIS, ATS, LMS, performance management, compensation) | Cross-functional buying team is the largest in SaaS; unlimited-seats pricing is the dominant argument | 100+ sellers |
| 6 | **AI Infrastructure & Tooling** (LLM orchestration, vector DBs, AI observability, evals, prompt management) | Net-new category with no incumbent evaluation methodology; Sourcera can define "how to evaluate [X]" via M10 guides | 80+ sellers |

Not seeded in year one: consumer-facing SaaS, ad-tech/mar-tech for SMB, pure services, physical-goods procurement, contingent workforce, travel & expense.

#### 1.3.2 Geographic Concentration

**Year 1:** US-headquartered sellers selling to US buyers. Single-region data residency (AWS us-east-1 / us-west-2). Coverage of EU-GDPR-compliant sellers by year-end via existing `data_residency_region = EU` support (§6.25) but without a dedicated EU GTM motion.

**Year 2:** EU (London, Amsterdam, Paris, Berlin, Stockholm) — triggered by hitting 50+ sellers and 20+ buyers with EU data-residency requirements.

**Year 3:** APAC (Sydney, Singapore, Tokyo) with custom-residency Enterprise-only entry.

LATAM, MENA, India deferred until Year 4 absent a specific channel partnership.

#### 1.3.3 Industry Vertical Sequencing

Inside the category seeding above, Sourcera targets **regulated industries first** because the audit-trail, policy-parsing, and Selection Record features (§6.37) are disproportionately valuable there. Order of vertical priority on the buyer side:

1. Financial services (banks, credit unions, PE/VC backoffices, insurance)
2. Healthcare (hospital systems, health plans, medical device)
3. Higher education and state/local government
4. Life sciences (pharma IT, biotech)
5. Regulated manufacturing (aerospace, automotive, utilities)
6. Mid-market SaaS itself (both buying and selling)

On the seller side, category concentration trumps vertical alignment — a cross-vertical seller of AI observability tooling is more valuable to the Marketplace than a single-vertical security vendor because cross-vertical sellers increase match density across multiple buyer categories.

---

## SECTION 2 — Buyer Personas

Each persona below is an economic buyer, influencer, or champion on the buyer side. Personas map to Sourcera's RBAC roles (§6.22) where applicable and to specific Sourcera features that solve their day-to-day pain. Every objection is paired with a feature-grounded rebuttal — no generic "ROI-based" answers.

### 2.1 VP or Director of Procurement — "Priya" (primary economic buyer)

- **Reports to:** CFO or COO. Often has a dotted line to a Chief Procurement Officer in orgs >2,000 employees.
- **KPIs:** Cycle time to selection (weeks), auditability of the selection record, procurement function NPS from internal stakeholders, savings-against-budget on software renewals, vendor-risk exceptions requiring sign-off.
- **Career risks:** Selecting a vendor that fails a compliance audit; choosing a vendor that gets sued or acquired in bad-for-buyer terms; taking eight weeks to run an evaluation that legal compliance said must be done in four; failing a SOC 2 Type II vendor-management control test.
- **Current pain with software procurement.** Runs 4–12 evaluations per year, all of them coordinating 5–9 internal stakeholders across 3–6 functions. Stakeholders miss meetings, forget to score, surface conflicting priorities in Phase 10. Evaluations end with a 10-hour PowerPoint authored the weekend before executive review. Two of the last five evaluations had an auditor finding. Priya cannot, today, produce a defensible answer to "why did we pick Vendor A over Vendor B on Requirement 47?"
- **What Sourcera solves for Priya.**
  - **Fixed 13-phase pipeline (§6.2)** — forces stakeholder discipline with phase gates; no skipping Phase 1 stakeholder alignment or Phase 9 immutable snapshots.
  - **Pulse Health Score (§6.8.1)** — a single 0–100 number tracking SLA Compliance, Scoring Progress, Response Rate, and Phase Velocity. Weekly Pulse Digest email to Priya and her exec sponsor (§6.8.2).
  - **Selection Report + SHA-256 hashed Selection Record (§6.37)** — the exact artifact the auditor asks for; replaces the 10-hour PowerPoint.
  - **Append-only grade history (§6.3.6)** — every scoring decision, override, and rationale retained with timestamp, user, justification. Audit-ready by construction.
  - **Organizational Intelligence (§6.7)** — surfaces when the same vendor was scored differently on the same requirement in two evaluations, flagging scoring inconsistency before an auditor does.
  - **Unlimited seats on every paid tier (Master Spec §34, §2.1 Buyer Pricing)** — Priya can invite Legal, InfoSec, Finance, and IT without a procurement battle over license count.
- **Objections and rebuttals.**
  - **"We already have Coupa/Ivalua/Jaggaer."** — Coupa is a P2P suite; Ivalua is a sourcing suite. Neither shipped a fixed 13-phase evaluation pipeline, Agent Pre-Scoring (§6.12), Policy-Powered Requirement Generation (§6.6), or a Vendor Discovery Marketplace. Your evaluation is still happening in spreadsheets beside Coupa — we replace the spreadsheet, not the P2P backbone. Coupa/Ivalua integration is available on Enterprise (§6.20) so the Selection Report routes downstream.
  - **"We don't have budget for a new tool."** — Business Starter is $299/mo annual with unlimited seats. That is less than one Coupa seat for one year. You are not adding a stack; you are replacing the spreadsheet + SharePoint + Outlook + PowerPoint workflow that is consuming 120+ hours per evaluation. The Time-Saved Baseline (§6.36) will reconcile the economics in your first evaluation.
  - **"How is this different from a spreadsheet with more features?"** — Spreadsheets cannot enforce a phase gate. They cannot produce a SHA-256 hashed audit artifact. They cannot run Pre-Scoring. They cannot detect a scoring disagreement (≥0.3 variance) and flag it for the Use Case Lead. They cannot export to Jira / Linear / Salesforce at Phase 13 close. Every sentence in that list is a real, shipped Sourcera feature (§6.3.2, §6.3.4, §6.19).
  - **"We need SSO/SCIM and a custom DPA."** — Those are Enterprise features. Pricing is custom, $3K/mo floor. We can have a draft DPA and a WorkOS SSO setup live within 5 business days. We will not route you to Enterprise until at least one of {SSO, DPA, $12K AI commit, custom integration} is an actual requirement — we do not sell Enterprise on company size (Master Spec §34).
  - **"What about AI hallucination in our audit?"** — Every Agent output is labeled `[AI-Generated]` with a confidence score (§6.12.3). Outputs never commit without explicit user confirmation. Pre-Scoring shows the Agent's suggested grade; the reviewer accepts, overrides, or dismisses. Override rates are tracked per Use Case for model calibration (§6.12). Rejected outputs bill at cost price, not value price, so Sourcera's economic incentive is aligned on quality (Master Spec §34, §2.4 Buyer Pricing).
- **Where Priya spends time.** ISM (Institute for Supply Management), Ardent Partners procurement events, ProcureCon, Source One Procurement Excellence forums, CIPS publications, CPO Rising, LinkedIn's procurement-community posts, Supply Chain Dive, Spend Matters.
- **Stop-scroll hook.** *"The PowerPoint your auditor asks for. Generated the day you close the evaluation, not the weekend before exec review."*

### 2.2 VP or Director of IT — "Marcus" (technical champion)

- **Reports to:** CIO or CTO.
- **KPIs:** Evaluation cycle time for engineering/platform tooling, failed implementation rate post-selection, time-to-integration on SaaS purchases, security-posture attestations per quarter.
- **Career risks:** Selecting a tool that fails integration testing 90 days after contract; being blindsided by a compliance finding in a vendor they recommended; a post-mortem that reveals IT was not consulted on a SaaS purchase that ended up creating a shadow-IT problem.
- **Current pain.** Marcus is consulted on half the SaaS evaluations in the org — the other half surface as line-item expenses in Finance's monthly report. When he is in the room, his review is sandwiched between Legal and InfoSec at the end. He has to re-read the same SOC 2 report three times across three evaluations because nobody captured it the first time.
- **What Sourcera solves for Marcus.**
  - **Domain Governance (§6.23.3)** — verified corporate domains block unsanctioned Org creation; forces employees onto a single Org and surfaces shadow-IT signups into IT's approval queue.
  - **IT Team horizontal track (§6.1.3)** — an IT Team owns triage queues, SLA enforcement, and Custom Agent Instructions across all active Workspaces. Marcus writes a rule once — *"flag any vendor response that mentions single-tenant hosting"* — and it applies everywhere (§6.12.4).
  - **Policy-Powered Requirement Generation (§6.6)** — upload NIST 800-53 once; Marcus never re-authors the same 40 control questions across 6 evaluations.
  - **Post-Phase-13 export to Jira / Linear / Asana / Azure DevOps (§6.19)** — the selection outputs actually reach the engineering team instead of dying in the Selection Report.
  - **Template Library (§6.10)** — seeded templates for CRM, HRMS, ERP, Security Tools, Dev Tools eliminate the blank-page cost of every evaluation.
- **Objections and rebuttals.**
  - **"I don't want another tool I have to onboard my team into."** — Unlimited seats means your team joins at zero marginal cost. The Linear-benchmark design language (Master Spec §3) is Cmd+K-first, J/K keyboard-nav, optimistic mutations — your platform engineers will recognize it. Onboarding is 60 seconds to first evaluation (§6.28.1).
  - **"Our security team hasn't reviewed this."** — WorkOS SSO (§6.23.1), SOC 2 Type II on the 12-month roadmap, ISO 27001 planned, annual penetration testing, Convex-backed data isolation at the query layer. Dual-Console firewall (§6.1.1) enforces buyer-seller isolation at the database layer, not just UI. SBOM available to Enterprise on request. Full security posture documented in the SPA package sent with the first paid proposal.
  - **"Can this integrate with our existing stack?"** — REST API v1 (§6.20), bi-directional CRM sync on the seller side (§6.18), Jira/Linear/Asana/Azure DevOps/Salesforce native integrations (§6.19), Slack + Teams channel-scoped notifications, webhooks with HMAC-SHA256 signatures and DLQ after 5 failures. The API add-on is $99/mo on any Business tier (Master Spec §34).
- **Where Marcus spends time.** Hacker News, LinkedIn CIO/CTO threads, IT Brew, InfoQ, Substacks run by ex-CTO operators, Gartner IT Leaders webinars, KubeCon, Re:Invent.
- **Stop-scroll hook.** *"Your procurement team's spreadsheets are costing you integration-failure post-mortems. Replace them before the next one."*

### 2.3 CISO or Head of Security — "Elena" (compliance gatekeeper)

- **Reports to:** CIO, CTO, or increasingly direct to CEO/Board.
- **KPIs:** SOC 2 Type II / ISO 27001 / HIPAA / NYDFS 500 / DORA / PCI-DSS audit findings trending down, mean-time-to-security-review on vendor assessments, vendor-risk exceptions per quarter.
- **Career risks:** A breach traced to a third-party vendor that was not properly evaluated; a board-level audit finding on vendor-risk management; an M&A-triggered security review that reveals 40 unmanaged SaaS vendors.
- **Current pain.** Elena reads the same SOC 2 report across 6 evaluations per year and cannot remember which evaluation she flagged which concern in. Her team is on the critical path for every evaluation and is the bottleneck. Her Custom Agent Instructions live in a Google Doc that nobody reads.
- **What Sourcera solves for Elena.**
  - **Policy-Powered Requirement Generation (§6.6)** — Elena uploads SOC 2 / ISO 27001 / NIST 800-53; the Agent extracts structured Requirements with `policy_source` pointers. Once a framework is mapped, updates to the policy flag downstream Requirements automatically. This is the single highest-value capability for CISOs — it takes 40 hours of manual translation off the critical path per evaluation.
  - **InfoSec Team horizontal track with Custom Agent Instructions (§6.12.4)** — Elena writes *"flag any vendor response mentioning shared-tenant hosting or third-party data processors not in our approved list"* once; the Agent enforces it across every active evaluation in under 60 seconds of save.
  - **Agent Pre-Scoring (§6.3.2)** — the InfoSec review team sees suggested grades on every qualitative security requirement before they open the scoring UI. Cuts review time by roughly half on standard controls.
  - **Traceability Matrix in the Selection Report (§6.37)** — every compliance requirement traces back to the source policy control. Audit-ready by default.
  - **Data Residency per Org (§6.25)** — US, EU, or Custom. EU-backed Orgs stay in AWS eu-west-1 / eu-central-1.
  - **Dual-Console Firewall (§6.1.1)** — seller-side AI cannot access buyer-side data and vice versa. Enforced at the database query level, not UI.
- **Objections and rebuttals.**
  - **"I can't upload SOC 2 reports to a new SaaS tool."** — Data residency is per-Org; EU-region-locked customers stay in EU. All uploads are virus-scanned and strict-Markdown sanitized (no raw HTML, no external images, no scripts — §6.30, §6.26). Audit logging is SHA-256 chained. Enterprise customers can require HIPAA BAA and custom DPA. If these controls do not satisfy your review, we will not push the evaluation forward.
  - **"How is AI not introducing a new compliance risk?"** — Every Agent output is labeled, confidence-scored, and editable. Outputs are filtered against factually incorrect pre-scores, unseen vendor names, and direct scoring recommendations (§6.12). The Agent never commits without explicit user confirmation. The model runs in Anthropic's security-certified infrastructure; SOC 2 Type II targeted within 12 months.
  - **"This is just another tool I have to approve."** — It is one tool to approve that replaces six uncontrolled surfaces (Google Drive, Outlook, SharePoint, PowerPoint, Excel, Word). The net-new attack surface is smaller, not larger. Full OWASP Top 10 mitigations documented (§6.26).
- **Where Elena spends time.** ISC2 Secure, SANS newsletters, Black Hat/DEF CON, RSA Conference, Gartner Security & Risk, Dark Reading, Krebs on Security, IAPP for privacy intersections, CISO Series podcast.
- **Stop-scroll hook.** *"Upload NIST 800-53 once. Never re-author a SOC 2 requirement again."*

### 2.4 CFO or VP Finance — "Dan" (economic approver)

- **Reports to:** CEO.
- **KPIs:** Software spend as a percentage of revenue, contract renewal savings, budget variance on procurement spend, days-to-close on financial close (indirectly — because delayed vendor selections push through as contingent accruals).
- **Career risks:** A $2M software commitment that ends up sunk in year 2 because the capability didn't match; being blindsided by a TCO number in year 3 that wasn't modeled at selection; an audit finding on expense control.
- **Current pain.** Dan signs off on every contract >$100K but sees the evaluation work secondhand via a PowerPoint. He often discovers the "preferred vendor" has already been chosen by the time the eval reaches his desk. TCO analysis when it exists is a spreadsheet with inconsistent assumptions per evaluation.
- **What Sourcera solves for Dan.**
  - **TCO Modeling as a first-class Use Case type (§6.5)** — six structured pricing schemas (flat, tiered, one-time, percentage-of-license, estimate-range, discount). Multi-year projections with configurable time horizons (1/3/5 year) and seat trajectories. Dan sees apples-to-apples cost comparisons before the vendor is selected.
  - **Scenario Modeling (§6.4)** — Dan can overlay "what if seat growth runs at 20% instead of 10%" and watch rankings shift. 10 scenarios on Business, 50 on Enterprise.
  - **TCO Breakdown Report inside the Selection Report (§6.37, C.23)** — per-vendor decomposition across license, implementation, support, training, and overage with first-year and steady-state callouts.
  - **Organizational Intelligence (§6.7)** — historical spend patterns and vendor performance surface when the same vendor is evaluated twice.
  - **Billing Admin role (§6.22.1)** — Dan's office owns the AI Wallet, spend caps, and overage. Wallet is off by default; auto-topup never enabled by default (Master Spec §34).
- **Objections and rebuttals.**
  - **"What does it cost me?"** — Business Starter $299/mo annual covers 5 evaluations with $50/mo AI budget, unlimited seats across Legal, InfoSec, IT, Finance, and end users. Scale $1,999/mo annual covers unlimited evaluations and 5 Buyer-Funded Pro Trial Seats per month for invited vendors. Enterprise starts at $3K/mo floor. Nothing is per-seat.
  - **"What's the ROI?"** — Time-Saved Baseline (§6.36) shows in-product. A single mid-market evaluation today consumes 120–180 cross-functional labor hours. At a $100/hr blended loaded rate, that is $12K–$18K per evaluation. Starter pays for itself in the first evaluation. Growth pays for itself in the first quarter. Dan's office gets a Usage Dashboard showing per-capability AI spend, acceptance rate, and top consumers (Master Spec §34).
  - **"How do I know AI spend won't balloon?"** — Wallet overage is off by default on every plan. A hard cap blocks ops when exceeded; soft caps (80%) email Dan's office and the Org Owner. The accepted/rejected accounting model means rejected AI outputs bill at cost price (1.05× cost_base), not value price (10× cost_base) — Sourcera's incentive is aligned on quality (Master Spec §34). AI budget is denominated in value-dollars, not tokens; if Anthropic pricing moves, the multiplier holds and Sourcera absorbs the delta (§2.2, §11 Buyer Pricing).
- **Where Dan spends time.** CFO Leadership Council, NetSuite SuiteWorld, Finance Leaders Summit, Ardent Partners, CFO.com, Wall Street Journal CFO Journal, LinkedIn CFO groups, Bessemer's State of the Cloud, public-company 10-K reading.
- **Stop-scroll hook.** *"Your next $1M software purchase is being evaluated in a spreadsheet. The TCO model ends at year 1."*

### 2.5 The Internal Champion — "Jordan" (Procurement Specialist / Business Analyst)

- **Reports to:** Priya (the VP of Procurement).
- **KPIs:** Evaluation on-time completion rate, stakeholder NPS on the evaluation process, accuracy of the final Selection Report, number of evaluations run in parallel per quarter.
- **Career risks:** Stalled evaluation blocking a revenue-critical purchase, stakeholder escalation to Priya, an SLA breach on Legal or InfoSec review that makes Jordan look unable to coordinate the team.
- **Current pain.** Jordan is the functional operator of every evaluation. They chase Legal for a DPA response, chase InfoSec for a SOC 2 review, chase Finance for TCO sign-off, and chase the CFO for final approval. Their calendar is 40% meetings asking "where are we" and 60% actual work. The Selection Report always gets written the weekend before exec review.
- **What Sourcera solves for Jordan.**
  - **SLA timers with tiered escalation (§6.1.3, C.11)** — 80% warning to owner, 100% to Team Lead, 125% to Workspace Owner, 150% auto-reassignment. Jordan stops having to chase by email.
  - **Inbox & Pulse (§6.11)** — unified notification center with per-channel preferences. Slack, Teams, email, in-app.
  - **Agent Pre-Scoring, Q&A Answer Suggestion, Requirement Splitting (§6.12.1 capabilities 4, 5, 9, 10)** — the Agent does the administrative overhead so Jordan does the coordination.
  - **Auto-generated Selection Report (§6.37)** — built from scores, TCO, Scenario Modeling, policy traceability. Exports to PDF. Replaces the 10-hour PowerPoint.
  - **Command Palette (§6.21)** — `Cmd+K` navigation across every entity. Jordan's productivity multiplier.
  - **Real-time collaborative scoring (§6.3.3)** — team members grade simultaneously with live presence. No more "chase people for scores."
- **Jordan's champion role.** Jordan is the person who will run the Sourcera demo internally, assemble the business case for Priya, and be the first user on the account. The sales motion must make Jordan look good — not the CFO. Jordan is who runs the Free-tier evaluation, invites the internal team, hits the ceiling, and routes the upgrade conversation to Priya.
- **Objections and rebuttals.**
  - **"I don't want to learn a new tool mid-evaluation."** — Start on Free with your next evaluation, not the one you are already running. Templates are seeded at Org creation (§6.10, C.37) — CRM, HRMS, ERP, Security Tools, Dev Tools. You configure the first evaluation in under an hour.
  - **"Will my stakeholders actually use it?"** — Stakeholders do not need to learn a tool. Guest role (§6.22.2) has four permission profiles (`read_only`, `contributor`, `scorer`, `full_participant`) scoped to specific Use Cases. An exec sponsor receives a magic-link invite (M1), approves or signs via a simple UI, never sees the phase sidebar or the KB. Unlimited seats means you pay zero marginal cost per additional stakeholder.
- **Where Jordan spends time.** LinkedIn (procurement groups), ProcureCon, ISM, Reddit r/procurement, Slack communities (Pavilion, ProcurementFoundation, Buyers Meeting Point), YouTube walkthroughs of procurement tooling, Substack newsletters from Spend Matters, Procurious.
- **Stop-scroll hook.** *"Stop chasing Legal by email. Let the SLA do it."*

---

## SECTION 3 — Seller Personas

Seller personas split between two acquisition paths — Forced-Signup (arrived via buyer invite, peak pain, highest conversion) and Organic (self-directed, evaluating tools). Messaging for each persona is explicitly tagged for which path the line is written for.

### 3.1 VP of Sales / Head of Partnerships — "Sam" (economic buyer, Organic path)

- **Reports to:** CRO or CEO.
- **KPIs:** RFP win rate, RFP cycle time, pipeline generated from inbound/partnerships, top-of-funnel volume, CRM data quality.
- **Career risks:** Missing quarter because an RFP response shipped late; losing a must-win to a competitor that responded in 24 hours; a partner channel drying up because qualified-lead flow collapsed.
- **Current pain.** Sam has no dedicated RFP team. His two SEs are spending 15 hours a week on RFP responses instead of demos. He has lost two deals in the last six months specifically on response latency. He has no pipeline attribution for inbound vendor discovery — his team is still cold-emailing from Apollo/ZoomInfo lists.
- **What Sourcera solves for Sam.**
  - **First-Pass RFP Response Generator (§6.14.2)** — drafts responses to every buyer requirement using the seller's KB. Cite-before-state rule. Typically covers 40–70% of requirements with high-confidence draft on a bootstrapped KB.
  - **KB Bootstrap (§6.13.6)** — on Seller signup, Opus-tier crawl of the seller's homepage, help docs, and trust center generates a proposed KB from scratch. First bootstrap is free for every new Seller Org.
  - **CRM Sync (§6.18)** — Salesforce, HubSpot, Dynamics, Pipedrive. Account matching algorithm, routing rules, bi-directional activity sync. Seller Signals (§6.17) — k-anonymized buyer intent — flow directly to the right CRM Account.
  - **Marketplace Listings + EOI workflow (§6.16)** — Sam's team submits EOIs to buyer-published opportunities. Verified or Certified badge lifts match score weight.
  - **Published Seller Profile from day one (§6.15.1)** — live on domain verification, Schema.org structured data for SEO, no paywall to publication.
- **Objections (Organic path) and rebuttals.**
  - **"We already pay for Responsive / Loopio."** — Seller Starter is $149/mo annual; Growth is $499/mo annual. Responsive starter is ~$7K/yr; Loopio mid is $15–20K/yr. Sourcera Starter at ~$1,800/yr bundles KB automation, Marketplace discovery, and First-Pass drafting at 4× cheaper on the RFP tooling dimension alone. Growth at ~$6K/yr is a 3× price break vs. Loopio — and it ships CRM Sync and Marketplace discovery Responsive and Loopio don't ship.
  - **"AI is going to hallucinate in our RFP response and we'll look bad."** — Every draft is grounded in KB entries with inline citation on every response row: *"from: yourcompany.com/trust/soc2"* with hover expansion showing the exact quoted sentence. Ungrounded statements are dropped by the cite-before-state rule (§6.14.2). The Agent never commits; your team accepts/edits/rejects each response. Confidence scores are visible (§6.12.3). On rejected drafts, a KB-gap detector lets you write the real answer inline and save it as a KB entry in one step.
  - **"Our KB is our IP. I don't want it locked into your platform."** — KB is exportable in full — Markdown bodies, JSON schema, entry metadata manifest, provenance log, zipped attachments — at every tier, including Free. One click. Never paywalled. Documented publicly (§6.13.7). What exports can't capture — confidence scores earned from accept/reject signals, staleness state, win-rate weighting, cross-bid citation graph, KB-to-Capability auto-declarations — is on-platform compounding. We win by making the live KB more valuable than the export, not by holding the export hostage.
  - **"Marketplace discovery sounds like G2."** — G2 is a review site. We are an evaluation workflow. Buyers arrive in structured 13-phase evaluations and publish a Marketplace Listing; sellers submit an EOI and, if accepted, enter the buyer's evaluation directly. We move you from "the buyer browses your review" to "the buyer is actively evaluating you." Different funnel stage entirely.
- **Stop-scroll hook.** *"3× cheaper than Loopio. Your first bid is drafted before your AE opens the workspace."*

### 3.2 Sales Engineer / Head of Pre-Sales — "Aisha" (technical champion, Organic path)

- **Reports to:** VP Sales or VP Solutions.
- **KPIs:** Technical demo-to-opportunity conversion, RFP response accuracy, SE hours spent on RFP support.
- **Career risks:** Inaccurate technical answer in an RFP that becomes a post-sale implementation problem; SE team being pulled off demos to handle RFPs.
- **Current pain.** Aisha writes the security questionnaire answers. Her SEs write the technical RFP answers. Neither team has bandwidth. Answers drift between deals — the same SOC 2 clause has three versions across four active RFPs. Aisha is the de facto KB owner but doesn't have tooling.
- **What Sourcera solves for Aisha.**
  - **KB Core with Document Library (§6.13.1–6.13.2)** — centralized repository for SOC 2, ISO certs, DPAs, pentest summaries. Expiration dates, version chains, auto-flagging of bids referencing superseded versions.
  - **Automated Documentation Crawling via Firecrawl (§6.13.3)** — weekly crawl (Starter), daily crawl (Growth), real-time (Scale). Changes in previously crawled pages flag affected KB entries for re-verification.
  - **Self-Governing Health Model (§6.13.4)** — every entry carries a `confidence_modifier` that decays with age. Stale entries deprioritized automatically. Entries with low win rates auto-deprioritized.
  - **Cross-bid citation graph (§6.13.7)** — exposes which entries are load-bearing. Aisha sees which KB entries are cited across which bids and which win.
  - **KB MCP Server with namespaced retrieval (§6.13.5, C.52)** — hybrid dense + lexical, server-side query expansion, re-rank model, pre-filter by `seller_org_id` before vector search, not after. Cite-before-state rule enforced.
- **Objections (Organic path) and rebuttals.**
  - **"Our KB lives in a Confluence / Notion / Google Drive."** — Firecrawl crawls any public source you configure and an import tool handles DOCX/PDF bulk upload. Once bootstrapped, the KB earns confidence scores from every bid you run — that signal doesn't exist in Confluence or Notion. The compounding value is the reason to migrate.
  - **"We've been burned by AI making up security claims."** — Sourcera's cite-before-state rule drops any response sentence without KB grounding. Every draft row shows its citation. Confidence thresholds per capability (KB suggestions 70%, Evidence parsing 60% — §6.12.3) suppress low-confidence output. Managed Agents are versioned and skill-pinned (§6.13.5, C.57–C.59); behavior does not drift silently across deployments.
  - **"We need to pin versions of the AI — we can't have behavior change mid-RFP."** — Beta Header & Version Pinning (C.59) pins specific agent + skill versions on every call. Your ongoing RFPs see the same model behavior until you intentionally upgrade.
- **Stop-scroll hook.** *"Your SE team gets their demos back. Sourcera writes the first pass."*

### 3.3 RFP Manager / Proposal Manager — "Leo" (primary user, Organic or Forced-Signup path)

- **Reports to:** VP Sales or Director of Revenue Operations.
- **KPIs:** RFP response on-time rate, win rate, KB hit rate (% of responses reusing prior content), RFP-to-close cycle time.
- **Career risks:** Late RFP submission; a high-stakes response written from scratch because the KB didn't surface prior content; being the one-person bottleneck on a revenue function.
- **Current pain.** Leo is responsible for 40+ RFPs per year. He maintains a response library in a Google Drive folder that only he can navigate. He searches by memory. When he leaves, the knowledge leaves with him.
- **What Sourcera solves for Leo.**
  - **Hero Moment on buyer-invite (Forced-Signup path, Master Spec §48)** — Leo arrives at Sourcera via a buyer invite. Inside the SSO redirect latency, the Agent crawls his company's public surfaces, proposes 40–200 draft KB entries, and drafts responses for every buyer requirement. He lands on: *"Your bid for [Buyer Company] is ready. 47 of 82 requirements have AI drafts. 31 cite evidence from your own website."*
  - **Bid Task & Bid Schedule (§6.14.3, C.50)** — each requirement becomes a Bid Task with owner, due date, status. Bid Schedule rolls into a Gantt-style view with SLA markers.
  - **Seller Pulse (§6.14.4, C.49)** — four-signal health score per active bid (response completion, SLA compliance, KB coverage, Q&A responsiveness).
  - **Ghost-Bid Importer (M15, Master Spec §48)** — Leo pastes or uploads historical RFPs; the Agent runs Ghost-RFP Ingestion (Opus) and seeds his KB from prior work. First import free per Seller Org. Catapults Leo over the KB-accumulation barrier in one session.
  - **Win/Loss Debrief (§15.6 Seller Pricing)** — on bid close, Leo sees which KB entries were cited in winning/losing responses. Win reinforces value. Loss identifies specific gaps for upgrade.
  - **KB Value Meter (§6.13.7, §17.3 Seller Pricing)** — persistent meter: *"Your KB: 47 entries · 6 cited in closed bids · 2 with win-rate lift · Estimated value: $1,275/yr saved response time."*
- **Objections (Forced-Signup path) and rebuttals.**
  - **"I just got an invite from a buyer I've never heard of. Is this real?"** — Every Sourcera invite is domain-verified and signed. The URL carries a pre-bound `bid_id`, an `invite_signature`, and the buyer's published RFP summary is rendered on the landing page before signup. If the link is expired or revoked, you'll see a generic Marketplace page, not a mystery signup.
  - **"I don't want to set up another tool to answer one RFP."** — You don't. No form, no company profile prompt, no credit card, no role selection. Magic-link signup, SSO, and the bootstrap starts inside the redirect. The first screen you see shows your drafted bid, not a setup wizard. The first thing you do is review, not configure.
  - **"My company hasn't approved this tool."** — You're responding to an invited bid at no cost. The Free tier covers one concurrent bid with a $5 AI budget sized to cover exactly one first-pass-drafted bid end-to-end. Nothing touches your CRM or your company systems. The seller profile publishes on domain verification — which proves the email is yours — and is always opt-out with one click.
- **Objections (Organic path) and rebuttals.**
  - **"We already have a response library in Google Drive."** — Ghost-Bid Importer takes one historical RFP and seeds your KB with structured entries, provenance, and confidence scores. In one session you get the compounding infrastructure Google Drive never will.
  - **"What happens if I leave the company?"** — KB is exportable in full at any time, every tier. Every teammate you invite has Bid Contributor access. The compounding value is institutional, not personal.
- **Stop-scroll hook (Forced-Signup).** *"Your bid for [Buyer Company] is already drafted. 47 of 82 requirements have AI answers citing your website. Review time: ~35 minutes."*
- **Stop-scroll hook (Organic).** *"The RFP library your successor will thank you for."*

### 3.4 Head of Product Marketing / Content — "Rachel" (influencer on KB content)

- **Reports to:** CMO or VP Marketing.
- **KPIs:** Message consistency across sales channels, time-to-market for new product positioning, content reuse rate across sales collateral.
- **Career risks:** Inconsistent product messaging in RFP responses vs. website vs. sales decks; a competitor's positioning entering an RFP response unchallenged.
- **Current pain.** Rachel's positioning work lives on the website. The RFP team's answers diverge from it. The Sales team has a different deck. Every launch requires re-synchronizing four stacks of content.
- **What Sourcera solves for Rachel.**
  - **Firecrawl crawling the website as the canonical source (§6.13.3)** — when Rachel updates the website, the KB re-verifies affected entries. Her website is the source of truth; the KB propagates.
  - **Seller Page Enrichment (§6.15.4, capability `page_enrichment`)** — Opus-tier; crawls seller's public surfaces and drafts Seller Organization Page content for review. 1/yr on Starter, 3/yr on Growth, 12/yr on Scale, unlimited on Enterprise.
  - **Capability Declarations linked to KB entries (§6.15.3)** — Rachel authors positioning once as structured declarations; buyers filter the Marketplace by them. Messaging becomes machine-readable.
  - **Template Publish Incentive (M9)** — publishing non-confidential response templates earns Marketplace visibility credits. Rachel's content becomes a distribution asset.
- **Objections and rebuttals.**
  - **"AI-generated Seller Pages sound like spam."** — Every Seller Page Enrichment output is editorial-reviewed by the seller. The output is a draft for review, not an auto-publish. Verified domain ownership gates publication (§6.15.4). Unapproved drafts never surface in the Marketplace.
  - **"This is another content surface I have to maintain."** — Firecrawl keeps it in sync with your website on your configured cadence. Page Enrichment generates drafts. The net marginal time is approving/editing a draft per cadence, not authoring content from scratch.
- **Where Rachel spends time.** Product Marketing Alliance, Exit Five, Peep Laja's CXL, Pavilion, HubSpot blog, ChiefMartec, SaaStr, LinkedIn Product Marketing groups.
- **Stop-scroll hook.** *"Your RFP answers diverge from your website. We make your website the source of both."*

---

## SECTION 4 — Competitive Positioning Matrix

### 4.1 Buyer-Side Competitive Matrix

| Competitor | Category | Strengths | Weaknesses vs. Sourcera | Repositioning statement |
|---|---|---|---|---|
| **Coupa** | Source-to-Pay suite | Mature P2P, invoice automation, deep ERP integrations, established brand in mid-enterprise procurement | No software evaluation workflow; no 13-phase pipeline; no Agent Pre-Scoring; no Dual-Console architecture; no Vendor Discovery Marketplace; per-seat pricing caps cross-functional participation | *"Coupa owns your purchase orders. Sourcera owns the evaluation that precedes them. Integration at Enterprise."* |
| **Ivalua** | Source-to-Pay suite | Flexible sourcing module, strong in regulated industries, heavy customization | Sourcing module is a configurable shell; you build the evaluation workflow yourself. No Agent, no Marketplace, no structured 13-phase gating, no Policy-Powered Requirement Generation | *"Ivalua gave you a toolbox. Sourcera ships the evaluation."* |
| **Jaggaer** | Source-to-Pay suite (gov-heavy) | Strong in state/local government, public-sector compliance | Legacy UX; evaluation is RFx-driven with no AI workflow; no seller-side workflow; no KB-grounded first-pass drafting | *"Jaggaer handles the RFx transaction. Sourcera handles the decision process around it."* |
| **Sievo / Vendr / Tropic / Spendflo** | SaaS spend management / contract-repository tools | Excellent for renewal negotiation and spend visibility | Not evaluation tools; they start after vendor selection. No structured requirement authoring, no scoring, no Selection Record | *"Tropic/Vendr negotiate your renewal. Sourcera decides who you renewed with."* |
| **G2 / Gartner Peer Insights / TrustRadius** | Review platforms | Brand recognition, buyer self-research, peer validation | Reviews are sentiment data; they are not structured evaluation. No 13-phase pipeline, no Agent Pre-Scoring, no Selection Record, no scoring math | *"G2 tells you which vendors exist. Sourcera runs the evaluation that picks one."* |
| **Gartner Magic Quadrant / Forrester Wave** | Analyst research | Executive signal, vendor-independent research | Quadrant placement is a lagging indicator and irrelevant to your specific requirements. Analysts don't write your SOC 2 requirements. | *"Use Gartner to build your longlist. Use Sourcera to run the evaluation."* |
| **Airtable / Smartsheet / Excel + SharePoint** | General-purpose tools | Familiar, flexible, low-friction to start | No phase gates, no scoring engine, no audit trail worth the name, no AI. Zero compounding value. The thing you're running now. | *"Your spreadsheet is the reason your audit found a gap. Replace it."* |
| **No direct competitor in "Software Evaluation Platform"** | Category-creation gap | — | — | *"The category doesn't exist yet. We're defining it."* |

The real buyer-side competitor is **Excel + SharePoint + Outlook + PowerPoint**. Every pitch must rebut this first. Coupa/Ivalua/Jaggaer are second-order competitors only in organizations that already own those suites and are asking "can we extend them" — the answer is no, those suites were not built for this workflow, and the evaluation is still happening in spreadsheets beside the suite.

### 4.2 Seller-Side Competitive Matrix

| Competitor | Category | Strengths | Weaknesses vs. Sourcera | Repositioning statement |
|---|---|---|---|---|
| **Responsive (formerly RFPIO)** | RFP response management | Mature KB, large customer base, Q&A automation, integrations with Salesforce/Slack | ~$7–15K/yr starting price — 4× Sourcera Starter. No Marketplace discovery; no inbound EOI workflow; no cross-side Pulse. AI is layered onto a non-outcome-accounted model; wallet overage surprise is real. No Hero Moment — empty workspace on day one. | *"Responsive is a KB with a text editor. Sourcera is a KB with a KB that gets smarter from every bid and brings you the next bid."* |
| **Loopio** | RFP response management | Strong brand in enterprise sales; content library with approval workflow; reporting | ~$15–35K/yr — 3× Sourcera Growth. Same category as Responsive with heavier enterprise positioning. No Marketplace, no inbound EOI, no CRM Sync as first-class, no Ghost-Bid Importer, no outcome-accounted AI | *"Loopio manages your proposal. Sourcera drafts it, routes the next bid to your CRM, and costs a third."* |
| **Qvidian / Upland / PandaDoc (proposal)** | Proposal/document automation | Document assembly, e-signature, pipeline integration | Document-centric, not evaluation-centric. Not built for structured requirement response. No KB compounding. No Marketplace. | *"Qvidian makes the PDF pretty. Sourcera makes the answers right."* |
| **G2 / Gartner / TrustRadius** | Review platforms (for sellers) | Buyer self-research signal, review-based demand gen | G2 shows who's browsing your category; Sourcera shows who's actively evaluating your category inside a structured 13-phase evaluation. Intent vs. evaluation. | *"G2 tells you the market is looking. Sourcera tells you which buyer is evaluating, and hands you the RFP."* |
| **Apollo / ZoomInfo / LinkedIn Sales Navigator** | Contact/intent data | Large contact databases, intent-keyword triggering | Intent data is inferred from browsing signals; 90% noise. Sourcera's Seller Signals (§6.17) come from inside active structured evaluations — de-anonymized only when the buyer explicitly sends an EOI or direct invite. Converted intent, not inferred intent. | *"Apollo gives you guesses. Sourcera gives you RFPs."* |
| **Bombora / 6sense / Demandbase** | Account-based intent | Aggregated third-party intent, ABM tooling | Still inferred intent. No inbound workflow. No RFP response. Sourcera is upstream of the deal. | *"6sense tells you the account is warm. Sourcera tells you their RFP closes in 14 days."* |
| **Gainsight / Outreach / Salesloft / Seismic** | Revenue-ops / sales engagement | Sequencing, CS motion, content enablement | None of these are in the RFP response lane. Sourcera integrates as a CRM/RevOps input, not a replacement. Custom integrations available at Enterprise. | *"Outreach runs your sequences. Sourcera fills your pipeline with qualified RFPs and syncs them into Outreach."* |
| **Status quo: copy-paste from last year's RFP** | — | Zero marginal cost, full flexibility | Every failure mode: drift, missed updates, inconsistent product claims, SOC 2 dates that are 18 months stale, no win-rate learning, no compounding | *"Copy-paste is why you lost the last deal on a stale SOC 2 date."* |

The real seller-side competitor is **copy-pasting from last year's RFP**. The Responsive/Loopio argument only comes into play when the seller has already decided structured RFP tooling is needed. Sourcera's unique claim is that RFP response, Marketplace discovery, and CRM-ready intent live in the same workflow with the same KB, at 3–4× cheaper than Responsive/Loopio for just the RFP dimension.

### 4.3 The Category-Creation Claim

No existing product category includes all five of: (1) a structured multi-stakeholder evaluation pipeline, (2) an AI Agent embedded as infrastructure, (3) a Dual-Console buyer-seller firewall inside one organization, (4) a Vendor Discovery Marketplace with Capability Declarations and verified profiles, and (5) outcome-accounted AI pricing. Sourcera is the first to bundle all five. The defensible category name is **Software Evaluation Platform** (see §6 below).

---

## SECTION 5 — Value Proposition Architecture

### 5.1 Buyer Organization — Layered Messaging

#### One-liner (≤15 words)

*The operating system for enterprise software procurement — evaluate faster, decide defensibly.*

#### Elevator pitch (30 seconds)

> Sourcera replaces the spreadsheets, SharePoint folders, and PowerPoint decks your procurement team uses to evaluate software. A fixed 13-phase pipeline enforces discipline, an AI co-pilot handles the administrative overhead, and every decision produces an immutable, audit-ready Selection Record. Unlimited seats on every paid tier so Legal, InfoSec, Finance, and IT can all collaborate without a license tax. Pricing starts at $299 per month.

#### Value narrative (2 minutes)

> Enterprise software procurement is high-stakes, cross-functional, and frequent — yet most organizations run it on ad hoc spreadsheets and email threads. The consequences are predictable: six-to-twelve-week cycles, unexplainable selection decisions, audit findings, and institutional knowledge that evaporates with staff turnover.
>
> Sourcera changes this in four ways. First, a fixed thirteen-phase evaluation pipeline replaces chaos with structure — no phase can be skipped, no requirement can be scored without a weight, and every vendor response is locked immutably at Phase 9. Second, an AI Agent handles the administrative overhead that steals your team's attention: deduplication, policy parsing, evidence extraction, pre-scoring, TCO narratives, Q&A drafting, status reporting. The Agent is grounded, confidence-scored, and never commits without human confirmation.
>
> Third, every decision produces a SHA-256-hashed Selection Record — the exact artifact an auditor asks for, generated the day you close the evaluation rather than the weekend before executive review. Upload NIST 800-53 or SOC 2 once; the Agent parses it into structured requirements with traceability back to the source controls. When the policy updates, the affected requirements flag automatically.
>
> Fourth, Sourcera includes a Vendor Discovery Marketplace. Buyers publish summary listings to attract qualified vendors; vendors submit Expressions of Interest with structured Capability Declarations. The Marketplace transforms Sourcera from a tool used after vendor shortlisting into the place where the buyer-seller relationship begins.
>
> Pricing is per organization, never per seat. Unlimited Procurement, Legal, InfoSec, Finance, and IT users on every paid tier. The AI is priced in dollars of value, not tokens — stable month to month, no bill shock. Your vendors respond free forever. Business Starter is $299 per month annual with a $50 AI budget, five active evaluations, and unlimited seats. Business Growth is $799 per month for twenty active evaluations and a $300 AI budget. Enterprise includes SSO, SCIM, data residency, custom DPA, and a committed AI spend.

#### Feature-to-Benefit Mapping (Buyer)

| Feature (from current Master Spec) | Quantifiable benefit | Source |
|---|---|---|
| Fixed 13-phase pipeline with gate validation | Cut 6–12 week evaluations to 4–6 weeks by structure alone | Master Spec §1, §4 Sourcera Method |
| Agent Pre-Scoring (Sonnet, Phase 10) | Reviewers accept/override rather than scoring from scratch; ~50% scoring-phase time reduction on standard controls | §6.12.1 capability 10 |
| Policy-Powered Requirement Generation | 40 hours saved per evaluation on compliance translation; one upload covers every downstream evaluation | §6.6 |
| Append-Only Grade History + SHA-256 Selection Record | Audit-ready by construction; replaces the 10-hour PowerPoint | §6.3.6, §6.37 |
| Unlimited seats on every paid tier | Cross-functional collaboration without license negotiation; Legal + InfoSec + Finance + IT on every evaluation at zero marginal cost | §2.1 Buyer Pricing |
| Outcome-accounted AI pricing (accepted 10× cost, rejected 1.05× cost) | No bill shock; rejected AI outputs cost roughly $0; budget denominated in stable value-dollars | Master Spec §34, §11 Buyer Pricing |
| TCO Modeling as first-class Use Case | Apples-to-apples multi-year cost comparison with 6 structured pricing schemas | §6.5 |
| Scenario Modeling | Stress-test rankings without rebuilding the spreadsheet; 10 scenarios Business, 50 Enterprise | §6.4 |
| Vendor Discovery Marketplace + EOIs | Qualified vendor inbound without cold outreach | §6.16 |
| Real-time collaborative scoring with Disagreement Insight Cards | Eliminate "chase for scores" cycle; ≥0.3 variance auto-flags for Use Case Lead | §6.3.3, §6.3.4 |
| Pulse Health Score (0–100, weekly digest) | Single number for exec-sponsor status; replaces verbal updates | §6.8 |
| Post-Phase-13 export to Jira/Linear/Asana/Azure DevOps/Salesforce | Selection outcomes reach implementation team instead of dying in PDF | §6.19 |

### 5.2 Seller Organization — Forced-Signup Path (arrived via buyer invite)

#### One-liner

*Your bid is already drafted. Review, edit, submit. Welcome to Sourcera.*

#### Hero Moment Pitch

> You clicked a magic-link invite from a buyer. Inside the thirty seconds it took you to sign in, Sourcera crawled your public homepage, help center, and trust center, proposed a draft Knowledge Base of forty to two hundred entries from your own content, and drafted responses for every requirement in the buyer's evaluation — citing your own website as the source.
>
> You are not looking at an empty workspace. You are looking at your own bid, mostly answered, with every answer traceable to a sentence on your website.
>
> You accept, edit, or reject each draft. Every rejection becomes a new KB entry in one click. When you submit, Sourcera tells you what you just built: *"A reusable KB of forty-seven verified entries in thirty-five minutes. Your next bid will reuse them automatically."*
>
> You pay nothing. The Free tier covers this bid end-to-end. No credit card, no team seat discussion, no configuration wizard. When a second buyer invites you, you will hit the first natural ceiling. That is when we'll talk about upgrading.

#### Feature-to-Benefit Mapping (Seller, Forced-Signup path — KB, drafting, reuse focused)

| Feature | Quantifiable benefit | Source |
|---|---|---|
| KB Bootstrap (Opus-tier, Domain Bootstrap inside SSO redirect latency) | First bid responded in ~35 min instead of ~2 days; 40–200 proposed entries before first click | §48.8, §22 |
| First-Pass RFP Response Generator with cite-before-state rule | 40–70% of requirements drafted from your own content with inline citations; ungrounded statements dropped | §6.14.2 |
| KB-gap detector on rejected drafts | Every rejection becomes a KB entry in one click; next bid reuses it | §15.3 Seller Pricing |
| Stake-Reveal Screen on submit | Quantified receipt of what you built: entries, citations, estimated $/yr saved | §48.8.5, §22 |
| KB Value Meter (persistent on Free) | Running visibility of compounding value: citations in closed bids, win-rate lift, estimated saved time | §6.13.7 |
| Upgrade Carry-Over Guarantee | Every KB entry, confidence score, citation, and provenance record carries forward unchanged on upgrade | §6.13.7, §17.4 Seller Pricing |
| Honest Portability (KB exportable in full, every tier including Free) | No lock-in; Markdown + JSON + metadata + provenance + attachments, one click | §6.13.7, §17.1 Seller Pricing |
| Published Seller Profile on domain verification (free, every tier) | SEO-emitting Schema.org structured data from day one | §6.15.1, Master Spec §34 |
| Free $5 AI budget sized for one end-to-end first-pass-drafted bid | No paywall on the invited bid that brought you | §4 Seller Pricing |

### 5.3 Seller Organization — Organic Path (discovering Sourcera independently)

#### One-liner

*Win more RFPs. Grind less. Get discovered.*

#### Elevator pitch

> Sourcera is the software evaluation marketplace where buyers find you — and the AI co-pilot that drafts your responses, keeps your KB fresh, and routes signals into your CRM. Free-forever profile publication, Knowledge Base bootstrap from your public website, and inbound EOI workflow from buyers actively running structured evaluations. Priced from $149 a month — three to four times cheaper than Responsive or Loopio, with Marketplace discovery and CRM Sync they don't ship.

#### Feature-to-Benefit Mapping (Seller, Organic path — Marketplace, CRM, intelligence focused)

| Feature | Quantifiable benefit | Source |
|---|---|---|
| Marketplace Listings + EOI Workflow | Inbound demand from buyers inside active 13-phase evaluations — not inferred intent | §6.16 |
| Match Scoring (Growth+, numeric) | Ranked vendor-opportunity fit; cut noise in EOI review | §6.16.4 |
| Seller Signals (k-anonymized buyer intent) | Pre-EOI category demand visibility routed to CRM; de-anonymizes on explicit buyer action | §6.17 |
| CRM Sync (Salesforce, HubSpot, Dynamics, Pipedrive — Growth+) | Bidirectional sync; Marketplace activity appears in the CRM your AEs already live in | §6.18 |
| Capability Declarations (machine-readable, linked to KB evidence) | Searchable, filter-matching; structured positioning | §6.15.3 |
| Verified / Certified badges (free when earned) | Trust signals lifting match-score weight; no pay-to-play | §6.15.2, §12.2 Seller Pricing |
| Automated Firecrawl ingestion (weekly on Starter, daily on Growth, real-time on Scale) | KB stays current with website changes automatically | §6.13.3 |
| KB-to-Capability Auto-Suggestion (C.46) | KB entries generate declarations that feed Match Scoring and Category Pages | §6.15.3 |
| Ghost-Bid Importer (M15) | Paste one historical RFP; bootstrap your KB with prior work; first import free per Seller Org | Master Spec §48, §18.5 Seller Pricing |
| Published Seller Org + SellerSoftware pages with Schema.org | Organic search compounding; per-category SEO moat | §6.15.4, §6.15.5 |
| Seller Page Enrichment (Opus) | Draft rich public surfaces from your public content | §6.15.4 |
| Promoted Listings (Scale+, 1/mo Scale, 3/mo Enterprise) | Category-targeted demand capture with second-price auction and frequency caps | §2.10, §6.16.6 |

### 5.4 The Marketplace Bridge — Messaging the Two-Sided Value

Most prospects do not understand marketplace dynamics. The message must meet them where they are, on their side of the market.

#### For a buyer who doesn't see the marketplace

> Every vendor you invite to evaluate becomes a participant in Sourcera at no cost to them. As more vendors adopt the platform, your shortlists get faster — you invite a vendor by name, they accept by magic-link, and their bid response is drafted before your team has finished scheduling the kickoff. The Marketplace is optional. If you want to publish a summary of your evaluation to attract qualified vendors you haven't discovered yet, you can — but everything you need works without it.

#### For a seller who doesn't see the marketplace

> Most sellers arrive at Sourcera because a buyer invited them. If that's you, your workflow is just answer-the-bid — the Marketplace is optional. Once you've done a few bids, the Marketplace becomes a source of qualified inbound demand: buyers publish evaluation summaries, you submit an Expression of Interest, and if they accept you enter their evaluation directly. Qualified intent from inside an active evaluation is a category no tool has shipped before.

#### For an investor, advisor, or category-creation conversation

> Sourcera's two-sided flywheel is asymmetric. Buyer-side acquisition drives seller inventory growth through forced invites — every evaluation seeds three to ten new Seller Orgs. Published Seller Profiles and Software Pages emit Schema.org structured data, building a per-category organic-search moat. SEO traffic feeds buyer signups, which feed more evaluations, which feed more seller invites. The Marketplace is the compounding surface; the consoles are the moat.

---

## SECTION 6 — Category Definition

### 6.1 Category Name

**Software Evaluation Platform** (per `Sourcera_Master_Spec.md` §48.0.1).

### 6.2 One-Paragraph Category Definition

A Software Evaluation Platform is the system of record for cross-functional enterprise software procurement decisions. It combines a structured multi-stakeholder evaluation pipeline, an AI Agent that handles administrative overhead across phases, a machine-enforced separation between buyer-side and seller-side workflows inside the same organization, a Vendor Discovery Marketplace for pre-evaluation match-making, and an immutable audit-trail artifact that replaces post-hoc PowerPoint decks. Unlike procurement suites (which automate purchase orders after the decision), RFP response tools (which only serve sellers), or review platforms (which provide sentiment, not structured evaluation), a Software Evaluation Platform owns the *decision process itself* — the authoring of requirements, the scoring of vendor responses, the calculation of total cost of ownership, the handling of compliance policy, and the production of a defensible selection record.

### 6.3 Why Existing Categories Don't Fit

- **Procurement suite (Coupa, Ivalua, Jaggaer)** — owns the transaction layer (requisition, PO, invoice, supplier master). Does not own the evaluation. Evaluations using a procurement suite still happen in spreadsheets beside the suite. The suite's "sourcing module" is a configurable RFx shell, not an opinionated evaluation methodology.
- **RFP response tool (Responsive, Loopio, Qvidian)** — serves only the seller side. Has no buyer-side workflow, no evaluation pipeline, no Selection Record, no Marketplace. A seller tool is structurally incapable of owning the buyer's evaluation.
- **Vendor management / third-party risk (OneTrust, Venminder, ProcessUnity)** — owns ongoing vendor-risk monitoring post-contract. Has no evaluation pipeline. Provides the continuous-monitoring layer *after* Sourcera's Phase 13 close.
- **Review platform (G2, Gartner Peer Insights, TrustRadius)** — provides sentiment data for buyer self-research. Has no structured evaluation methodology, no scoring math, no audit trail. G2 is upstream of the evaluation (longlist formation); Sourcera owns the evaluation itself.
- **Contract lifecycle management (Ironclad, DocuSign CLM, Icertis)** — owns contract authoring, negotiation, and storage post-selection. Has no evaluation workflow. Can integrate with Sourcera at Phase 13.
- **SaaS management / spend visibility (Vendr, Tropic, Spendflo, Zylo, Zip)** — owns renewal negotiation and software-spend visibility. Has no evaluation workflow for net-new purchases. Can integrate as a downstream consumer of the Selection Record.

Each of these categories has a defensible narrow scope. None of them owns the Software Evaluation Platform surface.

### 6.4 Narrative Arc — Problem → Failed Solutions → New Category → Sourcera

**Problem.** Enterprise software procurement decisions are high-stakes, cross-functional, and frequent. The organization needs a structured evaluation process. Existing tooling fails.

**Failed solutions.** Spreadsheets fail because they have no phase gates and no audit trail. Procurement suites fail because they start at the purchase order, not the evaluation. Review platforms fail because they provide sentiment, not scoring. RFP response tools fail because they only serve sellers. SharePoint folders fail because they preserve no decision context. PowerPoint decks fail because they are authored after the decision and cannot be audited.

**The category.** A Software Evaluation Platform owns the evaluation itself — requirement authoring, vendor response, multi-stakeholder scoring, TCO modeling, scenario analysis, policy compliance, and the production of a defensible selection artifact. It contains both sides of the transaction (buyer and seller) inside a machine-enforced firewall. It is a system of record for the decision, not the transaction.

**Sourcera is the Software Evaluation Platform.** Fixed 13-phase pipeline. AI Agent as infrastructure, not feature. Dual-Console buyer-seller firewall. Vendor Discovery Marketplace. SHA-256-hashed Selection Record. Outcome-accounted AI pricing. Unlimited seats. Free forever for invited vendors.

### 6.5 Category Creation as a Strength (Selling into Defined-Category Buyers)

Procurement teams live in defined categories — Gartner Magic Quadrants, Forrester Waves, IDC MarketScapes. A new-category pitch is a real objection. The rebuttal strategy has three moves:

1. **Acknowledge the gap honestly.** *"There is no Magic Quadrant for Software Evaluation Platforms yet. Gartner hasn't carved out this category because, until last year, no one was shipping the full surface. That's changing."*
2. **Reframe as first-mover advantage for the buyer.** *"Your peer procurement teams are running evaluations in spreadsheets. When this category formally lands in 2027, the first movers will be the organizations that already templatized the methodology. You are either setting the template or adopting someone else's."*
3. **Anchor on adjacent proof.** *"Think of where spend-management tools were in 2018 — Vendr and Tropic weren't in any Gartner quadrant; three years later they defined the category. The evaluation layer is at that same pre-quadrant moment. Procurement functions that adopted spend management early compounded the advantage."*

Do not claim Sourcera is in a Gartner Magic Quadrant (it is not). Do not claim category leadership that hasn't been earned. Claim category definition — that is accurate and defensible.

---

## SECTION 7 — Messaging Playbook

Every line below is production copy, intended for immediate use. Copy reflects the authoritative pricing ($299/$799/$1,999 buyer; $149/$499/$1,499 seller), the Dual-Console architecture, the Hero Moment, the unlimited-seats model, and the outcome-accounted AI pricing. Do not soften or genericize without a counter-argument grounded in a source document.

### 7.1 Founder LinkedIn — Headline and Bio

**Headline (≤220 chars):**

> Founder, Sourcera — the operating system for enterprise software procurement. Ex-[prior role]. Unlimited-seats pricing. Vendors free forever. Category: Software Evaluation Platform.

**Bio:**

> Every enterprise software decision is high-stakes, cross-functional, and frequent — and most teams still run it in spreadsheets, email threads, and weekend-before PowerPoint. Sourcera replaces that workflow.
>
> Fixed 13-phase evaluation pipeline. AI Agent handles the administrative overhead. Dual-Console buyer-seller firewall. Vendor Discovery Marketplace. SHA-256-hashed Selection Record that the auditor actually asks for.
>
> Unlimited seats on every paid tier because procurement is a team sport and a seat tax kills the exact collaboration the product needs. AI priced in dollars of value, not tokens — stable month to month, no bill shock. Vendors respond to your invites free, forever.
>
> From $299/mo annual. Building the Software Evaluation Platform category. Happy to talk if you are (a) running a painful evaluation right now, (b) a procurement leader sizing 2026 tooling, or (c) a vendor tired of rewriting SOC 2 responses.

### 7.2 Founder Twitter / X Bio (≤160 chars)

> Founder @sourcera — the operating system for enterprise software procurement. Evaluate faster, decide defensibly. Unlimited seats. Vendors free forever.

### 7.3 Cold Email Subject Lines

#### Buyer-side (five)

1. `Your next audit finding on vendor evaluation`
2. `The PowerPoint your auditor actually asks for`
3. `$299/mo. Unlimited seats. Legal, InfoSec, Finance, IT.`
4. `Your SOC 2 requirements. Uploaded once, reused everywhere.`
5. `Re: the CRM evaluation you're running in a spreadsheet`

#### Seller-side (five)

1. `Your RFP response drafted before your AE opens the doc`
2. `4× cheaper than Responsive. Marketplace discovery included.`
3. `RFPs from inside the buyer's evaluation — not inferred intent`
4. `Your KB, written from your own website in 30 seconds`
5. `Re: the RFP you lost last quarter on response time`

### 7.4 Homepage — H1 / H2 / CTA

**Context.** The homepage addresses both buyers and sellers. The H1 is audience-neutral; an immediate audience-switcher below the fold routes to side-specific messaging. Do not try to squeeze both value propositions into a single H1 — the copy drifts.

**H1:**

> **The operating system for enterprise software procurement.**

**H2:**

> Run structured evaluations. Respond to RFPs with AI drafts from your own content. Get discovered by buyers inside active evaluations. Unlimited seats. Vendors free forever.

**Primary CTAs:**

- [Start evaluating — free](#buyer-signup) *(buyer-side signup)*
- [Respond to an RFP — free](#seller-signup) *(seller-side signup, forced-signup invite accepts route here)*

**Audience switcher directly below the fold:**

- **I'm buying software** → Buyer value section (13-phase pipeline, Agent Pre-Scoring, Selection Record, TCO Modeling, $299 starting).
- **I'm responding to RFPs** → Seller value section (Hero Moment, KB Bootstrap, Marketplace Listings, CRM Sync, $149 starting).

### 7.5 Directory Description (G2, Product Hunt, BuiltWith, similar) — One Paragraph

> Sourcera is the operating system for enterprise software procurement — the Software Evaluation Platform category. Buying teams run structured 13-phase evaluations with an AI Agent that drafts requirements, parses compliance policies, pre-scores vendor responses, and produces an SHA-256-hashed Selection Record. Vendors respond to invited bids for free with AI-drafted first-pass responses cited to their own public content, and publish verified Seller Profiles to the Vendor Discovery Marketplace from day one. Pricing is per organization with unlimited seats on every paid tier. Buyer plans from $299/mo; Seller plans from $149/mo. AI is priced in outcome-accounted value-dollars — rejected outputs bill near cost, not value. Dual-Console firewall, WorkOS SSO, data residency (US/EU/custom), and full API access available.

### 7.6 30-Second Voicemail Scripts

#### Buyer version

> Hey [first name], this is [your name] from Sourcera. Quick reason for the call — you're likely running two or three software evaluations in spreadsheets right now, and when the auditor asks why you picked Vendor A over Vendor B, you'll be reconstructing it from email. Sourcera is a structured 13-phase evaluation pipeline with an AI co-pilot and an audit-ready Selection Record. Starts at $299 a month, unlimited seats across Legal, InfoSec, and Finance. I'll send a two-minute video. Thirty seconds of your time when you have a minute — [email] or reply to my note.

#### Seller version

> Hey [first name], [your name] at Sourcera. Quick reason for the call — you're probably responding to thirty-plus RFPs a year and either paying Responsive or Loopio or rewriting from scratch each time. Sourcera drafts your first-pass response from your own public content, routes Marketplace demand to your CRM, and costs three to four times less than Loopio. Free forever to respond to a buyer invite. Thirty seconds when you can — I'll send a two-minute video to [email].

### 7.7 Conference / Event Intro (when someone asks "what do you do?")

**Short form (15 seconds):**

> I'm building Sourcera. It's the operating system for enterprise software procurement — a structured evaluation pipeline with an AI co-pilot and a Vendor Discovery Marketplace. Unlimited seats, vendors free forever, pricing from $299.

**Medium form (45 seconds):**

> I'm building Sourcera. Enterprise software procurement today still runs on spreadsheets, email, and PowerPoint — and every auditor finding on vendor management is traceable to one of those three. Sourcera is a structured 13-phase evaluation pipeline with an embedded AI Agent for the administrative overhead, a Dual-Console buyer-seller firewall that lets the same org both buy and sell software without leaking data, and a Vendor Discovery Marketplace that replaces cold outreach. Unlimited seats on every paid tier — procurement is cross-functional and seat taxes kill collaboration. AI priced in dollars of value, not tokens. Vendors respond free forever. We're defining the Software Evaluation Platform category. Are you currently evaluating something?

---

## SECTION 8 — Pricing Narrative

Pricing is an implementation detail. Pricing *narrative* is a strategic moat. Every rebuttal below is aligned to the outcome-accounted consumption model and the exact plan tiers in `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md`. Do not drift.

### 8.1 Why Unlimited Seats Matters

Procurement is cross-functional by nature. A typical mid-market evaluation touches 5–9 distinct roles across 3–6 functions: Procurement, Legal, InfoSec, IT, Finance, end users, and an Executive Sponsor. A per-seat pricing tax suppresses exactly the participation Sourcera depends on. If Legal costs $50/seat/month extra, Legal is excluded from early evaluations — which is where they are most valuable. If InfoSec has to defend a seat count to Finance each quarter, InfoSec stays out of half the evaluations that needed them. Unlimited seats on every paid tier (Free, Starter, Growth, Scale, Enterprise) is the single structural decision that makes Sourcera the *organization's* platform rather than the *procurement team's* platform. The monetization surface is AI consumption, not seats.

**Sales line:** *"Procurement is a team sport. We don't tax the team."*

### 8.2 Why Outcome-Based AI Pricing Is Better Than Tokens or Feature Toggles

Three failure modes kill AI pricing in practice:

1. **Token pricing** produces bill shock when Anthropic pricing moves, when a model change increases token count, or when a long-context operation runs. Customers don't know how many tokens a policy-parse job consumes. The budget is unmanageable.
2. **Feature toggles** conflate unrelated capabilities — a customer who wants Pre-Scoring also pays for Deep Comparison even if they never use it. This creates hidden overbuy and shelfware.
3. **Flat-rate "unlimited AI"** creates adverse selection — the 1% of customers running the heaviest AI workloads subsidize the cost, and pricing is either wildly over-charged for light users or margin-negative for heavy users.

Sourcera's outcome-accounted model avoids all three:

- Every AI Operation settles as `accepted` or `rejected` on capability-specific signals (Master Spec §34).
- Accepted operations bill at value price = `cost_base × 10`. Rejected operations bill at cost price = `cost_base × 1.05`. Both draw from the same budget counter.
- Budgets are denominated in **value-dollars**, not tokens. If Anthropic raises prices 30%, the value-dollar budget still buys the same amount of value to the customer — Sourcera absorbs zero of the variance at the customer surface and holds the multiplier constant.
- Rejected outputs are never profitable for Sourcera. That aligns Sourcera's incentive on output quality: the more the Agent hallucinates or produces unusable drafts, the more margin Sourcera loses. This is the single structural guarantee of AI quality at a pricing level.
- Customers see one number: "AI budget used this month." Per-op pricing only surfaces if the customer opts into wallet overage (off by default on every plan).

**Sales line:** *"You pay for AI that works. Bad outputs cost you almost nothing."*

### 8.3 The Free Tier Narrative — "Not a Demo; a Real Product"

Free tier on both sides is a real, usable product — not a time-limited trial. Buyer Free includes the full Buyer Console, 13-phase pipeline, Dual-Console architecture, 1 active evaluation, up to 25 vendors tracked, 1 GB storage, 50 KB items, and a $5 AI budget sized to cover roughly 10 Pre-Scoring runs or 1,200 KB suggestions. Seller Free includes a full Bid Workspace for 1 concurrent invited bid, manual KB with 50 entries, 1 lifetime KB Bootstrap, published Seller Profile from day one, 3 Capability Declarations, and a $5 AI budget sized to cover one first-pass-drafted bid end-to-end.

Free tier is not a demo; it is the product. The point of Free is to let a customer complete one end-to-end unit of work — one evaluation, or one invited bid — and feel the value before any upgrade conversation. The upgrade conversation is triggered by natural ceilings, not by a trial countdown.

**Sales line (buyer):** *"Run your next evaluation free. Hit the ceiling, then talk to us."*

**Sales line (seller):** *"Respond to your first invited bid free. When the second buyer invites you, that's when we talk."*

### 8.4 The $5 AI Budget as an Aha-Moment Accelerator

On both sides, the Free-tier $5 AI budget is not token-rationed miserliness — it is a product decision. The $5 is sized deliberately.

**Buyer side.** $5 covers approximately one full Pre-Scoring run across 3+ vendors, plus KB suggestions and a Requirement Splitting pass. The first Pre-Scoring run is the Aha Moment (Master Spec §48) — the first time the buyer sees Sourcera suggest grades with evidence and confidence scores before they open the scoring UI. Budget is designed to be spent here.

**Seller side.** $5 covers exactly one first-pass-drafted bid end-to-end — one KB Bootstrap worth of AI (already included in the lifetime-free allowance), plus the First-Pass RFP Draft capability across a typical 50–100 requirement evaluation, plus Q&A Suggestion on a handful of clarifications, plus KB-to-Capability Suggestions. The budget is sized so the Forced-Signup vendor can submit their first bid without hitting a paywall.

The budget is low enough that a second evaluation or a second concurrent bid triggers an upgrade conversation. High enough that the first unit of work completes successfully.

**Sales line:** *"Our Free tier isn't rationed AI. It's one full evaluation worth of AI — enough to ship your first evaluation or respond to your first invited bid."*

### 8.5 Why Starter Is the Sweet Spot

**Buyer Starter at $299/mo annual** is anchored against the labor cost of a manual evaluation. A typical mid-market evaluation consumes 120–180 cross-functional labor hours. At a $100/hr blended loaded rate (mixing Procurement at $80/hr, Legal at $180/hr, InfoSec at $140/hr, line-of-business at $70/hr), that is $12,000–$18,000 per evaluation in direct labor. Starter at ~$3,600/yr pays for itself in the first evaluation. Compare to Coupa at ~$1,500–$2,500/seat/year for 5 seats = $7,500–$12,500/year — Starter is both cheaper and structurally different (evaluation workflow vs. P2P workflow).

**Seller Starter at $149/mo annual** is anchored against Responsive (formerly RFPIO) at ~$7–15K/yr and Loopio at ~$15–35K/yr. Sourcera Starter at ~$1,800/yr is 4× cheaper on the RFP tooling dimension alone — and it bundles Marketplace discovery and Capability Declarations that Responsive/Loopio do not ship.

**Sales line:** *"Starter pays for itself in your first evaluation. Growth pays for itself in your first quarter."*

### 8.6 The Enterprise Gate — Only Sold When Structurally Required

Enterprise is gated by four explicit conditions (buyer and seller both): **SSO required, DPA required, ≥$12K/yr AI commit, or custom integration** (Master Spec §34, §6 Buyer Pricing, §8 Seller Pricing). Below this bar, the dedicated CSM load destroys margin — Scenario C in both pricing docs shows Enterprise below the $12K AI commit blends at ~42–44% gross margin, which is a margin floor violation.

Do not sell Enterprise on company size. A 10,000-employee enterprise running a single evaluation at Free-tier volume belongs on Business Scale. A 500-employee organization with a mandatory custom DPA and SSO belongs on Enterprise. The gate is requirement-driven, not logo-driven.

**Sales line:** *"Enterprise exists because some buyers have non-negotiable compliance requirements. If you don't, you belong on Scale — and Scale is a better product for you."*

### 8.7 Seller Pricing Narrative — "4× Cheaper, With Marketplace Discovery Included"

The seller-side anchor is Responsive and Loopio. Sourcera's dominant argument is not "we're cheaper" (Responsive and Loopio compete on price when pressed). The dominant argument is **"cheaper and structurally more valuable."**

| Dimension | Responsive | Loopio | Sourcera Starter ($1,800/yr) | Sourcera Growth ($6,000/yr) |
|---|---|---|---|---|
| Annual price band | $7K–$15K | $15K–$35K | $1,800 | $6,000 |
| KB automation | Yes | Yes | Yes (Firecrawl weekly) | Yes (daily) |
| First-Pass drafting | Add-on | Yes (varies) | Yes (budget-included) | Yes (budget-included) |
| Marketplace discovery | No | No | Yes (Free profile, EOIs at Starter) | Yes (unlimited EOIs) |
| CRM Sync | Yes (separate product) | Limited | — | Yes (SF/HS/Dynamics/Pipedrive) |
| Match Scoring | — | — | Labels only | Numeric, included |
| Seller Signals | — | — | Monthly digest | Weekly digest |
| Outcome-accounted AI | No | No | Yes | Yes |
| KB portability commitment | Partial | Partial | Full, free, every tier | Full, free, every tier |

**Sales line:** *"Three to four times cheaper than Loopio, with Marketplace demand and CRM Sync that Loopio doesn't ship."*

### 8.8 Pricing Objection Handlers — Five Most Common

#### Objection 1: *"Consumption-based pricing makes my AP team nervous."*

> AI budget is capped by plan ($5 Free / $50 Starter / $300 Growth / $800 Scale on the buyer side). Exceeding it doesn't trigger overage unless you explicitly enable wallet overage — off by default on every plan. When enabled, hard caps block ops, not silent overage. Soft caps at 80% email the Billing Admin and Org Owner. Auto-topup exists but is never enabled by default. You get full Usage Dashboard visibility per capability. AP sees one line item: the plan subscription.

#### Objection 2: *"I need to forecast my AI spend. Value-dollars sound like a variable."*

> Value-dollars are stable month-to-month. The multiplier — `value = cost_base × 10` — holds constant. If Anthropic's pricing moves, your value-dollar budget still buys the same amount of value; Sourcera absorbs the variance. Rate card published at `api.sourcera.com/v1/pricing` as a JSON file. Quarterly rate-card review with 30 days advance notice and annual-contract grandfathering. If you want fixed annual commit, Enterprise gives you committed spend with 10–25% volume discount at $25K / $50K / $100K / $250K+ bands.

#### Objection 3: *"We want per-seat pricing because that's how we budget."*

> Per-seat pricing suppresses exactly the cross-functional participation Sourcera depends on. A seat tax keeps Legal, InfoSec, and Finance out of evaluations — which is why your current process produces audit findings. Unlimited seats is a design decision, not a pricing compromise. The net result is the same for you: you pay a flat plan price, you add seats without a procurement battle, and you get a higher-quality evaluation because the right people are in the room.

#### Objection 4: *"We don't have a line item for this."*

> Neither does any of your peer organizations today — the category is new. Most of the first hundred Sourcera customers line-item this under either "Procurement Technology," "GRC Tooling" (when led by InfoSec), or "Vendor Management" (when led by Legal). We can help you frame the internal business case — the Time-Saved Baseline (§6.36) quantifies hours saved per evaluation, and at $100/hr blended loaded rate, Business Starter pays for itself in the first evaluation. The ROI argument is the budget-line argument.

#### Objection 5: *"Can we just pay as we go on AI? No subscription?"*

> No. A pure usage model is worse for both of us. Without a subscription, the light-usage months look free and the heavy-usage months are unpredictable, which is exactly the bill-shock experience we designed out. With a subscription, the included AI budget covers 80–90% of normal usage; overage is capped at your explicit consent. The bundle is not a profit maximizer — it is stability at both ends. If you expect to exceed ~$12K/yr in AI value, Enterprise committed spend gives you the best economics with a volume discount.

### 8.9 Explaining Outcome-Based Pricing to a Non-Technical Buyer

Use this frame:

> Think of it like a contractor who only charges you for the work you keep. If the Agent drafts a response and you accept it (or edit less than 30% of it), Sourcera charges the full value price — because the Agent saved you real work. If the Agent drafts something wrong and you reject it, Sourcera charges only the compute cost — essentially nothing.
>
> This is the opposite of how most AI products bill. Most AI products charge you for every token regardless of whether the output was useful. Sourcera's model structurally aligns our margin on your perception of quality. The more often the Agent is wrong, the more money we lose. That's the guarantee built into the pricing.

**Sales line:** *"You pay for AI that works. The AI that doesn't work costs you almost nothing."*

---

## Closing Note on Drift Prevention

This document reflects the pricing, feature surface, and positioning of Sourcera as of 2026-04-20, reconciled to `Sourcera_Master_Spec.md` §1, §2, §27, §34, §48, §49 and the buyer / seller pricing v3 companions. When the Master Spec changes, this document is non-authoritative until reconciled. The specific drift risks to watch:

- **Pricing drift.** Buyer: $0 / $299 / $799 / $1,999 / Enterprise custom ($3K floor). Seller: $0 / $149 / $499 / $1,499 / Enterprise custom ($3K floor). Annual rates only — monthly rates are higher and should not appear in hero copy. Any reference to "$499 flat Business" is v1 legacy and must not appear anywhere.
- **AI budget drift.** Buyer: $5 / $50 / $300 / $800 / Committed. Seller: $5 / $30 / $200 / $600 / Committed. All denominated in value-dollars, not tokens.
- **Category naming drift.** "Software Evaluation Platform" is the authoritative category name. Do not substitute "vendor management," "procurement suite," "RFP platform," or any other adjacent-category label.
- **Seat model drift.** Unlimited seats on every paid tier, including Free. Any per-seat messaging violates the core positioning.
- **Hero Moment drift.** The Seller Hero Moment is specifically the Forced-Signup path (buyer invite → magic-link → bootstrap inside SSO redirect → landing on a drafted bid). It is not generic onboarding. It is not the Organic signup experience.
- **Invited-participation-is-free drift.** Vendor response to an invited bid is free on every tier, including paid tiers, forever. This is a participation promise, not a pricing compromise. Do not blur it.

If a future campaign or asset needs to deviate from any claim above, update the source document first and this document second. Messaging should never out-run the spec.
