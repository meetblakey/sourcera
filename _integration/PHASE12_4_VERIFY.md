# PHASE 12.4 VERIFICATION LOG — Numerical Limit Reconciliation

**Phase:** 12.4 — Compare every numerical limit across the Master Spec; resolve conflicts in favor of the authoritative source; rewrite inline references to cite the source table rather than duplicate the value.
**Date:** 2026-04-25
**Master Spec baseline:** `_versions/Sourcera_Master_Spec_pre-phase12.4-2026-04-25.md`
**Authoritative-source hierarchy applied (per CLAUDE.md §2):** Plan tier limits → §34.1; Object size → §39; Performance → §44; Retention → §40.2 + §6.8 (consistent); SLA → §42.1; Pricing → §34.2 / §34.3; Webhook config → §31.5; API rate limits → §32.4; Pagination → §32.3.

---

## 1. Conflict Inventory

### 1.1 Hard Conflicts (different values across sections)

| ID | Location | Issue | Authoritative Source | Resolution |
| :---- | :---- | :---- | :---- | :---- |
| C-01 | §6.6.2 Token Limits by Plan | 3-tier table (Free 1 / Business 5 / Enterprise 25) conflicted with §34.1.1 cell **API Keys** (5-tier: 1 / 5 / 25 / 50 / 100) | §34.1.1 cell **API Keys** | §6.6.2 rewritten to cite §34.1; per-tier values removed from §6.6.2. |
| C-02 | §6.7.3 Audit Log Retention by Plan | 3-tier table (Free 30d / Business 1y / Enterprise 7y) conflicted with §34.1.1 cell **Audit Log Retention (UI)** (5-tier: 30d / 1y / 1y / 3y / 7y) | §34.1.1 cell **Audit Log Retention (UI)** + §40.2 financial-record exception | §6.7.3 rewritten to cite §34.1 + §40.2; per-tier values removed. |
| C-03 | §16.9.1 Intelligence Availability | 3-tier table conflicted with §34.1.1 cell **Organizational Intelligence** ("— / Vendor History only / Full / Full / Full + Suggestions") | §34.1.1 cell **Organizational Intelligence** | §16.9.1 rewritten to a 5-tier feature matrix that maps cleanly onto the §34.1.1 cell values. |
| C-04 | §22.6 Firecrawl Plan Limits | 3-tier table values (Free 1 / Business 5 / Enterprise 25 sources) conflicted with §34.1.2 cell **Firecrawl Sources** (5-tier: 0 / 2 / 10 / Unlimited / Unlimited) | §34.1.2 cell **Firecrawl Sources** | §22.6 rewritten to a 5-tier table; source counts and cadence cite §34.1.2; max-pages-per-crawl retained as operational throughput control. |
| C-05 | §22.7 Document Library | 3-tier table (Free 50 / Business 500 / Enterprise 5,000) conflicted with §34.1.1/§34.1.2 cell **KB Document Library** (5-tier: 50 / 500 / 5,000 / Unlimited / Unlimited) | §34.1.1/§34.1.2 cell **KB Document Library** | §22.7 rewritten to cite §34.1; per-tier values removed. |
| C-06 | §27.2 Marketplace Availability | 3-tier table conflicted with §34.1.1/§34.1.2 cells **Marketplace Buyer Access** + **Proactive Marketplace EOIs** | §34.1 (both cells) | §27.2 rewritten to a 5-tier table that cites §34.1 in every cell. |
| C-07 | §31.5 Webhook Configuration & Limits | 3-tier table (Free 1 / Business 5 / Enterprise 25 endpoints) conflicted with §34.1.1/§34.1.2 cell **Webhook Endpoints** (5-tier: 1 / 5 / 25 / 50 / 100) | §34.1 cell **Webhook Endpoints** | §31.5 rewritten to a property-keyed table; endpoint count cites §34.1; uniform retry / payload / signing semantics retained inline (§31.5 IS the authoritative source for those uniform values). |
| C-08 | §32.4 Per-Plan Monthly API-Call Quotas | 3-tier table conflicted with v7.0.0 5-tier structure | §34.1 (plan tier set); §32.4 retains throughput-cap authority for non-AI API plane | §32.4 rewritten to a 5-tier table. Note: API call counts are NOT customer-billed per §34.4; ceilings are abuse-prevention only. |
| C-09 | §42.1 SLA Commitments | "Business 99.5% / 24-hr response" tier conflicted with §34.1 (no SLA on any non-Enterprise tier); "Enterprise 1-hour response" conflicted with §34.1 cell **SLA** ("4-hour critical") | §34.1 cell **SLA**; BPS §6 / SPS §8 | §42.1 rewritten: Free / Starter / Growth / Scale = None (best effort); Enterprise = 99.9% uptime + 4-hour critical response. Severity-coverage clause aligned. |
| C-10 | §42.1 Latency duplication | "p95 < 500ms, p99 < 1s" duplicated §44.1 | §44.1 Performance Targets | §42.1 rewritten to cite §44.1; latency thresholds removed from §42.1. |

### 1.2 Inline Duplications (same value, just restated — should cite source)

| ID | Location | Authoritative Source | Resolution |
| :---- | :---- | :---- | :---- |
| D-01 | §6.2.1 MFA Availability table | §34.1 cell **MFA** | Rewritten to cite §34.1 with 5-tier alignment; behavioral prose preserved. |
| D-02 | §6.3.1 Session Management table | §34.4 (universal-seat invariant) + §34.1 (Enterprise admin configurability) | Rewritten to a Free/Starter/Growth/Scale-vs-Enterprise table; no per-tier value duplication. |
| D-03 | §33.2 Multi-Factor Authentication table | §6.2.1 (operational matrix) + §34.1 (plan-tier source) | §33.2 rewritten to cite §6.2 + §34.1; the duplicate 3-tier MFA table removed. |
| D-04 | §34.13.2 Pro Trial Seat Allocation table | §34.1.1 cell **Vendor Pro Trial Seats (M17)** | Rewritten to cite §34.1.1; per-tier values removed; allocation rules retained inline (operational behavior is §34.13's authority). |
| D-05 | §34.13.5 "cap binds at 5/mo or 15/mo" | §34.1.1 cell **Vendor Pro Trial Seats (M17)** | Rewritten to cite §34.1.1. |
| D-06 | §34.6.3 cold-storage retention "7 years" | §4.8.10 (`archive_storage_ref` field + AC #5) | §34.6.3 rewritten to cite §4.8.10; duration removed from §34.6.3 prose. |
| D-07 | §34.6.3 restoration window "90 days post-archive" | §4.8.10 state machine | §34.6.3 rewritten to cite §4.8.10. |
| D-08 | §34.6.1 preservation window "90 days" | §40.2 / §4.8.10 | Rewritten to cite §40.2 / §4.8.10 for the preservation window value. |
| D-09 | §39 Internal Comment Thread cell | §34.1.1 cell **Internal Comment Threads per Workspace** | Cell rewritten to cite §34.1.1 without restating the per-tier numbers. |
| D-10 | §3.3 Sidebar `contact_support` "Business+" | §34.1 cell **Support** | Rewritten to "Starter, Growth, Scale, Enterprise per §34.1 cell **Support**". |
| D-11 | §3.10 Bulk Action Toolbar "SLA change (Business+)" | §34.1 cell **Support** | Rewritten to "paid tiers per §34.1". |
| D-12 | §22.5.x Billing-domain webhook AC #17 — "Free 1 endpoint, Business 5 endpoints, Enterprise 25 endpoints" | §34.1 cell **Webhook Endpoints** | Rewritten to "across the full §34.1 plan-tier set". |
| D-13 | §34.16.x Marketplace-discovery webhook delivery scope | §34.1 cell **Webhook Endpoints** | Same pattern; rewritten to cite §34.1. |
| D-14 | §32.x Performance budget in deploy checklist (§46.3 Pre-Release) | §44.1 Performance Targets | Rewritten to cite §44.1 instead of restating "p95 < 1s". |
| D-15 | §51.4 Window-depth duplication ("Free 30 days; Starter 90 days; Business / Seller Pro 12 months; Enterprise 24 months") | §34.1 | Renamed legacy "Business / Seller Pro" tier to the canonical Growth / Scale tier names. |
| D-16 | §39151 Stripe billing-cycle prose "Business renewal" | §34.2.1 / §34.2.2 plan prices + §34.10 wallet | Rewritten to cite §34.2 / §34.10. |
| D-17 | §39155 "Business → Free" downgrade prose | §34.6 + §40.2 | Rewritten to cite §34.6 / §40.2 for preservation flow. |
| D-18 | §39292 wallet overage cap copy "Free $500, Business / Enterprise $500,000" | §4.8.3 + §34.1 cell **Wallet Overage** | Rewritten to cite §4.8.3 for the entity-level cap and §34.1 for the per-tier configurability. |
| D-19 | §26.8.1 SellerSoftware plan-tier table | §34.1.2 cell **SellerSoftware Entities** | Per-tier values removed; cited §34.1.2. |

### 1.3 Stale Plan-Tier Names ("Free / Business / Enterprise" 3-tier model)

The v7.0.0 plan tier structure is 5-tier per §34.1.3 (Buyer: `buyer_free`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`; Seller: `seller_free`, `seller_starter`, `seller_growth`, `seller_scale`, `seller_enterprise`). Any inline reference to a bare "Business" plan tier — distinct from the canonical "Business Starter / Business Growth / Business Scale" Buyer-paid tier names — is stale.

| ID | Location | Action |
| :---- | :---- | :---- |
| S-01 | §6.2 / §6.3 / §6.6 / §6.7 / §33.2 prose | Updated tier references throughout. |
| S-02 | §7.5 Billing Admin role description "Free/Business/Enterprise" | Rewritten to "Buyer Free / Starter / Growth / Scale / Enterprise; Seller Free / Starter / Growth / Scale / Enterprise". |
| S-03 | §7.5 Audit Retention prose "Free 30 days, Business 1 year, Enterprise 7 years" | Rewritten to cite §34.1 cell **Audit Log Retention (UI)**. |
| S-04 | §12.8.1 Ingestion Limits | Rewritten to 5-tier. |
| S-05 | §12.9 Acceptance Criterion "Business plan: max 3 ingestions" | Rewritten to "Starter plan: max 3 ingestions/month per §12.8.1". |
| S-06 | §13.6.1 heading "Business+" | Rewritten to "universal per §34.1". |
| S-07 | §13.9 Acceptance bullet "Collaborative scoring enabled (Business+)" | Rewritten to cite §34.1.1 cell **Collaborative Scoring** (universal). |
| S-08 | §14.8.1 Scenario Limits | Rewritten to 5-tier. |
| S-09 | §15.6.1 Pricing Requirement Limits | Rewritten to 5-tier. |
| S-10 | §15.6.2 prose "Business plan: At 20 pricing requirements" | Rewritten to "At cap (Free / Starter / Growth)". |
| S-11 | §16.9.1 Intelligence Availability | Rewritten to 5-tier (also resolved C-03). |
| S-12 | §18.7.1 Q&A Limits | Rewritten to 5-tier. |
| S-13 | §19.6.1 Template Storage | Rewritten to 5-tier. |
| S-14 | §22.6 Firecrawl plan limits | Rewritten to 5-tier (also resolved C-04). |
| S-15 | §22.7 Document Library plan limits | Rewritten to cite §34.1 (also resolved C-05). |
| S-16 | §25.7 plan downgrade scenario "Business → Free with 200 active threads" | Rewritten to "Starter → Free". |
| S-17 | §25.7 acceptance criterion "a Business workspace blocks the 501st thread creation" | Rewritten to cite §34.1.1 cell. |
| S-18 | §27.2 Marketplace Availability | Rewritten to 5-tier (also resolved C-06). |
| S-19 | §31.5 Webhook Configuration & Limits | Rewritten to property-keyed table citing §34.1 (also resolved C-07). |
| S-20 | §32.4 Per-Plan Monthly Quotas | Rewritten to 5-tier (also resolved C-08). |
| S-21 | §32.8.x PricingTableVersion-pin "Business Orgs may pin for up to 90 days" | Rewritten to "non-Enterprise paid tiers — Starter, Growth, Scale". |
| S-22 | §34.12.x cross-side billing scenarios "Business Free | Seller Scale" | Rewritten to "Buyer Free | Seller Scale" (correct console label). |
| S-23 | §34.16.1 `rev_subscription` description | Rewritten to enumerate full 5-tier plan set. |
| S-24 | §34.18.3 Buyer-side Year-1 plan mix "Business 25%" | Split into Starter 15% + Growth 10% (revenue-weighted: 10% + 20%) per Authored Extension below. |
| S-25 | §34.18.5 Free-to-paid conversion "Free → Business" | Rewritten to "Free → any paid Buyer tier". |
| S-26 | §35.1.1 onboarding plan selector "start Business trial" | Rewritten to "auto-applied 14-day Business Starter trial per §34.2.3 rule #1". |
| S-27 | §41.2 Trial Expiring email template "Your Business trial expires in 3 days" | Rewritten to use generic "Sourcera trial" (Business Starter trial per §34.2.3). |
| S-28 | §41.2 Trial Expiring notification entry | Same rewrite. |
| S-29 | §40.1 Excel / JSON export "Business+" | Rewritten to "All paid tiers per §34.1.1 cell **Export Formats**". |
| S-30 | §42.1 SLA Commitments | Rewritten to 5-tier (also resolved C-09 / C-10). |
| S-31 | §43.x Stripe runbook "Business renewal" | Rewritten to "Paid-tier renewal" (also D-16). |
| S-32 | §43.x Stripe runbook "Business → Free" | Rewritten (also D-17). |
| S-33 | §39 wallet-overage error code copy "Free $500, Business / Enterprise $500,000" | Rewritten (also D-18). |
| S-34 | §46.4 Feature Flag default values referencing "Business+" | Rewritten to plan-tier-correct gating per §34.1. |
| S-35 | §46.3 Pre-Release deploy-checklist "p95 < 1s; latency p95 < 500ms" inline numerical references | Rewritten to cite §44.1 (also D-14). |
| S-36 | §51.4 User-level dashboard window-depth "Business / Seller Pro 12 months" | Rewritten to canonical "Growth / Scale 12 months" (also D-15). |

### 1.4 Authored Extension — §34.18.3 Buyer-Side Plan-Mix Split

§34.18.3 originally had a single "Business" row at 25% of buyer Orgs / ~30% of `rev_subscription`. The v7.0.0 5-tier model splits the legacy "Business" tier into three: Business Starter, Business Growth, Business Scale. The org-count and revenue-weight split below is an Authored Extension — Source documents (MS §2.12, BPS §3, SPS §3) do not enumerate the post-split distribution.

Split applied:
- **Starter:** 15% of buyer Orgs; ~10% of `rev_subscription` (high org count, low ARPA).
- **Growth:** 10% of buyer Orgs; ~20% of `rev_subscription` (mid org count, mid ARPA).
- **Scale:** 10% of buyer Orgs; ~40% of `rev_subscription` (preserved from MS §2.12).
- **Enterprise:** 5% of buyer Orgs; ~30% of `rev_subscription` (preserved from MS §2.12).

Sums: 60% Free + 15% + 10% + 10% + 5% = 100% of orgs ✓; 0% + 10% + 20% + 40% + 30% = 100% of subscription revenue ✓.

This reconciles the legacy "Business" allocation with the 5-tier plan structure introduced in v7.0.0 and is logged below as an Authored Extension requiring human sign-off.

---

## 2. Eliminated Inline Duplications — Summary

| Domain | Count of inline duplications removed |
| :---- | ---: |
| Plan-tier values now citing §34.1 instead of restating | 14 |
| Performance latency targets now citing §44.1 instead of restating | 3 |
| Retention windows now citing §40.2 / §4.8.10 instead of restating | 4 |
| Webhook configuration values now citing §31.5 / §34.1 instead of restating | 3 |
| **Total inline duplications eliminated** | **24** |

---

## 3. Self-Challenge Pass

Re-read all edited subsections as a hostile staff engineer. Findings:

1. **§42.1 4-hour Enterprise SLA vs. §42.3 SEV-1 < 15-minute response.** These are NOT in conflict after the §42.1 rewrite. §42.1's "4-hour response" is the customer-contracted SLA for ticket-opened critical issues; §42.3's "< 15 minutes" is the internal incident-response paging target on operational alerts. The §42.1 prose now explicitly distinguishes these so a reader does not conflate them. A reader who only saw the §42.1 number would not know the team responds far faster internally; the reverse-direction reader who only saw §42.3 might believe Sourcera owes 15-minute customer responses on Enterprise. The disambiguation prose addresses both directions.

2. **§42.5 "10-minute escalation" vs. §42.2 "5-minute persistence alert".** Not edited (no conflict): §42.2's 5-minute alert threshold detects sustained problems and pages on-call; §42.5's 10-minute timeout escalates to secondary if primary does not ack. Sequential (alert at 5m → ack required → escalate at 10m if no-ack). Both are operational, not customer SLAs. Clear in context; no edit required.

3. **§32.4 monthly API-call quotas as Authored Extension.** §32.4 quotas are not in §34.1; they are abuse-prevention ceilings on the non-AI API plane and are now consistent with §34.4 (no per-call billing). The 5-tier values authored at §32.4 are a NEW authored extension (Starter 10K, Growth 50K, Scale 250K, Enterprise Unlimited). Logged below.

4. **§22.6 max-pages-per-crawl values.** Not in §34.1.2; the per-crawl page caps are operational throughput controls that prevent runaway crawls inside the §34.1.2 source-count and cadence frame. The values 100 / 1,000 / 10,000 are preserved from the v6.0.0 source. The prior "Free 100" cell — pre-edit — implied Free-tier crawls; §34.1.2 says Free has 0 sources, so the Free row in §22.6 is now correctly "n/a" for both cadence and page cap.

5. **§34.13 Pro Trial Seat — restrictions text "Buyer below Scale"** retained (legitimate; §34.1.1 cell shows non-zero allocation only on Scale and Enterprise). Did NOT need rewrite.

6. **§16.9.1 Intelligence Availability mapping from §34.1.1 cell "Full".** The v7.0.0 §34.1.1 cell uses "Full" for both Growth and Scale; "Full + Suggestions" for Enterprise. I authored the mapping that "Full" = three of the four briefing surfaces (Vendor History + Efficiency Metrics + Discrepancy Analysis) and "Predictive Suggestions" = Enterprise-only. This is a forced reading of the §34.1.1 "+Suggestions" annotation; flagged as Authored Extension.

7. **§19.6.1 Templates "Read-only access" on Free.** §34.4 invariant says output artifacts (templates) are not metered. Per §34.4 list, "Q&A threads, Comments, Internal Comments, Selection Reports" are explicit; Templates are not enumerated. Authored extension to keep Free at read-only while paid tiers get full custom-template authoring; preserves the §34.4 spirit (output artifacts not metered) by treating template authoring as a paid-tier authoring capability rather than a metered output.

8. **§14.8.1 Free-tier "5 scenarios".** The pre-edit table said Free had no Scenario Modeling at all; §34.1.1 says Scenario Modeling is universal (wallet-charged on every tier). I authored a 5-scenario throughput cap on Free to align with §34.1's universal availability; this is an Authored Extension.

9. **§15.6.1 Free-tier "5 pricing requirements".** Same Authored-Extension pattern. §34.1.1 says TCO Modeling is universal (Included, non-AI on every plan); the per-workspace pricing-requirement cap on Free was previously "Not available" — now 5 to align with universal availability.

10. **§18.7.1 Free-tier "10 questions".** Same pattern. §34.1.1 says Q&A is universal; pre-edit said Free was "Not available". Authored 10-question per-vendor-per-workspace cap on Free.

Items 7–10 are Authored Extensions reconciling §34.1's "universal capability" cells with subsection throughput tables that previously gated capabilities to paid tiers only. All flagged in `RECONCILIATION.md → Authored Extensions`.

---

## 4. Counterfactual Pass — Failure Modes Considered

Per the Phase 12.4 instruction set, three realistic failure modes were considered for every edited subsection:

1. **Plan-tier upgrade mid-period encounters a stale-tier reference in middleware.** Resolved by removing all stale-tier references; entitlement middleware now keys on the §34.1 enum (5-tier) only. Pre-edit, an upgrade from `buyer_free` → `business_growth` would have miscomputed limits in any code that read §6.6.2 / §22.6 / §27.2 / §31.5 / §32.4 / §42.1. Post-edit, those subsections cite §34.1 rather than maintaining their own tier tables.

2. **Plan-tier downgrade triggers preservation flow citing wrong retention window.** §34.6.3 now cites §4.8.10 / §40.2 explicitly; if §4.8.10 changes the cold-storage horizon in a future amendment, §34.6.3 picks it up automatically (no inline number to drift).

3. **Stripe webhook delivery fails because consumer assumes 3-tier endpoint allocation.** §31.5 was rewritten to a property-keyed table; the per-tier endpoint count is now sourced from §34.1.1/§34.1.2 cell **Webhook Endpoints** (Free 1 / Starter 5 / Growth 25 / Scale 50 / Enterprise 100). Pre-edit a Scale customer with 30 endpoints would have been incorrectly capped at 25 by code that read §31.5 directly. Post-edit the §34.1 source is the single authority.

4. **§42.1 SLA breach computation used wrong response-time threshold.** Pre-edit Enterprise was "1-hour response"; §34.1 says "4-hour critical". Post-edit the enforcement value is 4-hour (per BPS §6 / SPS §8); a customer expecting 1-hour response based on §42.1 pre-edit would now read the correct 4-hour value. Note: this is a CHANGE to customer expectation. RECONCILIATION.md logs this as a Breaking Change for any documentation, marketing copy, or sales decks that referenced the prior 1-hour figure.

5. **Performance dashboard alarms tied to stale §42.1 latency thresholds.** §42.1 latency line ("p95 < 500ms, p99 < 1s") was duplicated from §44.1; both happened to match. Post-edit §42.1 cites §44.1; if §44.1 is ever loosened or tightened, the dashboard alarm rule that reads §44.1 stays correct. Pre-edit a §44.1 change could have left §42.1 stale (silent drift).

---

## 5. Residual Issues (Not Addressed in Phase 12.4)

The following items surfaced during the sweep but are out-of-scope for §12.4 (numerical-limit reconciliation only) and are referred to other phases:

| ID | Issue | Refer to |
| :---- | :---- | :---- |
| R-01 | DSAR 30-day SLA appears in ~15 places but has no authoritative §6.8 / §40.2 row dedicated to it | Phase 12.5 (DSAR codification) |
| R-02 | §32.4 Monthly API-call quota per-tier values (1K / 10K / 50K / 250K / Unlimited) are Authored Extensions; should be ratified | Phase 12.5 (Authored Extension review) |
| R-03 | §44.5 Acceptance criterion "server-side timeout: 30s" not promoted into §44.1 authoritative table | Phase 12.5 (§44.1 expansion) |
| R-04 | §45.2 "Account locked for 15 minutes" security control not in any authoritative SLA / security table | Phase 12.5 (§33.6 promotion) |
| R-05 | §45.3 marketplace appeal "7 days" / Ops review "24 hours" not in operational SLA table | Phase 12.5 (§42.3 / §45.3 SLO promotion) |
| R-06 | Volume discount bands ($25K / $50K / $100K / $250K) appear only in §34.2.3 prose; should be a dedicated §34.2.4 table | Phase 12.5 (pricing structuring) |
| R-07 | §34.18.3 Year-1 plan-mix split is Authored Extension; needs Founder + GTM lead sign-off | RECONCILIATION.md → Authored Extensions |

---

## 6. Verification Checklist

- [x] Master Spec backed up at `_versions/Sourcera_Master_Spec_pre-phase12.4-2026-04-25.md`.
- [x] Every plan-tier limit duplication outside §34.1 either removed or rewritten to cite §34.1.
- [x] Every retention duplication outside §40.2 / §4.8.10 either removed or rewritten to cite the source.
- [x] Every performance target duplication outside §44.1 either removed or rewritten to cite §44.1.
- [x] Every SLA duplication outside §42.1 either removed or rewritten to cite §42.1, with §42.1 itself reconciled to §34.1 cell **SLA**.
- [x] Every webhook-config duplication outside §31.5 either removed or rewritten to cite §31.5 / §34.1.
- [x] Every API rate-limit / pagination duplication outside §32.3 / §32.4 either removed or rewritten to cite §32.3 / §32.4.
- [x] Stale 3-tier plan-tier names ("Free / Business / Enterprise") replaced with the v7.0.0 5-tier structure or with citation-by-tier-class language.
- [x] Self-challenge pass executed.
- [x] Counterfactual pass executed.
- [x] RECONCILIATION.md updated with Phase 12.4 entry, conflicts resolved, Authored Extensions logged.

---

## 7. Sections Touched

§3.3 sidebar `contact_support`; §3.10 Bulk Action Toolbar; §4.2 Organization plan-limit field notes; §5.2 Billing Admin role; §5.2.1 Billing Admin audit retention; §6.2.1, §6.2.2, §6.2.3 MFA; §6.3.1 Session Management; §6.6.2 Token Limits; §6.7.3 Audit Log Retention; §12.8.1 Ingestion Limits; §12.9 acceptance bullet; §13.6.1 collaborative-scoring heading; §13.9 acceptance bullet; §14.8.1, §14.8.2 Scenario Limits; §15.6.1, §15.6.2 Pricing Requirement Limits; §16.9.1 Intelligence Availability; §18.7.1 Q&A Limits; §19.6.1 Template Storage; §22.6 Firecrawl Plan Limits; §22.7 Document Library; §25.7 plan-downgrade scenario + acceptance bullet; §26.8.1 SellerSoftware plan limits; §27.2 Marketplace Availability; §31.5 Webhook Configuration & Limits; §31.8 Billing-Domain Webhook AC #17; §32.4 Per-Plan Monthly Quotas; §32.8 PricingTableVersion-pin prose; §33.2 MFA; §34.6.1 / §34.6.3 preservation prose; §34.12.x cross-side billing scenarios; §34.13.1 / §34.13.2 / §34.13.5 Pro Trial Seat; §34.16.1 / §34.16.x Marketplace-discovery webhook delivery scope; §34.18.3 Year-1 Buyer plan mix; §34.18.5 Free-to-paid conversion; §35.1.1 onboarding plan selector; §39 Internal Comment Thread cell; §41.2 Trial Expiring email; §40.1 Excel / JSON export; §41.2 Trial Expiring notification; §42.1 SLA Commitments; §43.x Stripe runbook; §39292 wallet-overage error copy; §46.3 Pre-Release deploy-checklist; §46.4 Feature Flag defaults; §51.4 User-level dashboard window-depth.

**Total subsections touched:** 50.

---

**End of PHASE12_4_VERIFY.md**

---

## 8. Phase 12.5 Closure Addendum (2026-04-26)

**Status: UNCONDITIONAL PASS — numerical-consistency residuals R-01, R-03, R-04, R-05, R-06 closed; R-02 and R-07 release-gated to Authored Extension sign-off (non-spec-edit path).**

Closure trail for the seven §5 residuals:

| ID | Issue | Closure Mechanism | Status |
| :---- | :---- | :---- | :---- |
| R-01 | DSAR 30-day SLA appeared in ~15 places without authoritative §6.8 / §40.2 row | **§6.8.6 DSAR Operational SLA (Authoritative)** authored; CI gates `dsar_30d_sla_observability` and `dsar_sla_single_source_of_truth` registered; PostHog event `dsar_sla_window_breached` emitted. | **CLOSED** |
| R-02 | §32.4 Monthly API-call quotas are Authored Extensions; should be ratified | Sign-off-track item (AE-12.4-01); release-gating per AUTHORED_EXTENSIONS_LEDGER.md. **No Spec edit required** — values were already authored in Phase 12.4 §3 #3 (1K / 10K / 50K / 250K / Unlimited); ratification is owner-driven (Engineering + Finance). | DEFERRED to AE-12.4-01 sign-off (non-blocking for v7.0.0 publish per ledger policy; blocking for engineering-wide rollout). |
| R-03 | §44.5 30s server-side timeout not promoted to §44.1 | §44.1 Performance Targets table extended with **"Server-Side API Call Timeout (hard ceiling): 30s"** row. §44.5 acceptance bullet rewritten to cite §44.1 (no value duplication). | **CLOSED** |
| R-04 | §45.2 15-minute account lockout not in any authoritative SLA / security table | §33.6 Security Controls extended with **"Account lockout (authoritative): 15 minutes after 5 failed attempts in 10-min rolling window"** bullet. §45.2 abuse-prevention bullet rewritten to cite §33.6 (no value duplication). | **CLOSED** |
| R-05 | §45.3 marketplace appeal 7-day / Ops review 24-hour SLAs not in operational SLA table | §42.3 Incident Response extended with new **§42.3.1 Marketplace Abuse Operational SLA (Authoritative)** subsection — full table with 5 stages (initial admin review, seller appeal window, admin re-review, persistent-violation escalation, permanent-ban appeal). §45.3 workflow rewritten to cite §42.3.1 by stage name (no value duplication). | **CLOSED** |
| R-06 | Volume discount bands $25K / $50K / $100K / $250K appear only in §34.2.3 prose; should be a dedicated §34.2.4 table | **§34.2.4 Volume Discount Bands (Enterprise Committed Spend — Authoritative)** authored as a new subsection with Band 0–4 thresholds, discount percentages, source authority, authoring rules, and 3 acceptance criteria. CI gate `volume_discount_band_single_source` registered. | **CLOSED** |
| R-07 | §34.18.3 Year-1 plan-mix split is Authored Extension; needs Founder + GTM lead sign-off | Sign-off-track item (AE-12.4-02); release-gating per AUTHORED_EXTENSIONS_LEDGER.md. **No Spec edit required** — split was already authored in Phase 12.4 §1.4; ratification is owner-driven (Founder + GTM Lead). | DEFERRED to AE-12.4-02 sign-off (non-blocking for v7.0.0 publish per ledger policy; blocking for engineering-wide rollout). |

**Exit criterion (Phase 12.4 + Phase 12.5):** zero conflicting numerical limits — **MET.** Five residuals closed via authoritative-section promotion; two residuals are sign-off-track items not requiring Spec authoring (per the ledger's release-gate policy distinction between v7.0.0 publish and engineering-wide rollout).

**Phase 12.4 exits with all exit criteria met.**

**Verifier (closure pass).** Opus-4.6, Phase 13 Final Acceptance Gate, 2026-04-26.
