# PHASE 9 FINDINGS — Scratch Log

**Prompt:** 9.1 — Retention Per Data Class (§40.2)
**Run date:** 2026-05-08
**Auditor:** Opus, Sourcera SWE mode, fresh session
**Mode:** Non-destructive audit. No edits to `Sourcera_Master_Spec.md`.

**ID-rename note (post-write reconciliation).** A prior session on the same date (2026-05-08) ran a different Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk — and consumed `D-9.1-001` … `D-9.1-021` in `DEFECT_LEDGER.md`. To honor the immutable-defect-id convention (`Audit_Prompts.md → Defect Ledger Format`, line 55), the §40.2 retention defects from this prompt are promoted into the ledger under the mnemonic form `D-9.1R-NNN` (R = Retention). The local IDs `D-9.1-001`..`D-9.1-025` used in this scratch log map 1:1 to `D-9.1R-001`..`D-9.1R-025` in `DEFECT_LEDGER.md`. The Audit_Prompts.md numbering itself is correct — Prompt 9.1 is "Retention Per Data Class (§40.2)"; the prior session mislabeled an §8.4 / Appendix G walk as 9.1. That mislabeling is itself a documentation defect that the next V phase should resolve (file as a P3 `documentation_gap` against the prior session's section header).

---

## Sources Read End-to-End

| Source | Lines | Purpose |
|---|---|---|
| `Sourcera_Master_Spec.md` §40.2 | 31907–31946 | The complete §40.2 retention table — all 27 enumerated rows. |
| `Sourcera_Master_Spec.md` §4.2 | 3603–3748 | Organization, OrgMembership, User, Group, Team. |
| `Sourcera_Master_Spec.md` §4.3 entity headings | 3752–4622 | All 22 buyer console entities. |
| `Sourcera_Master_Spec.md` §4.4 entity headings | 4625–6759 | All 29 seller console entities. |
| `Sourcera_Master_Spec.md` §4.5 entity headings | 6761–7315 | All 9 marketplace entities. |
| `Sourcera_Master_Spec.md` §4.6 | 7317–7777 | Audit Event, Attachment, OpsSession, OpsSessionApiRequestLink, DSARRequest. |
| `Sourcera_Master_Spec.md` §4.7 | 7783–8129 | Console Bridge Event (incl. §4.7.1.1 retention block) and Vendor Disqualification Record. |
| `Sourcera_Master_Spec.md` §4.8.1–§4.8.5 | 8142–8617 | AIOperation (incl. inline 7-year retention), CapabilityRegistryEntry, AIWallet (incl. inline retention), OutcomeContract, ContestRecord. |
| `Sourcera_Master_Spec.md` §4.8.6–§4.8.13 | 8617–9100 | Remaining billing entities (verified from index, then sampled). |
| `Sourcera_Master_Spec.md` §22.4 | 16278–16386 | KB Entry lifecycle, vector / BM25 index cascade behavior, embedding version bumps. |
| `Audit_Prompts.md` | 14–135, 2105–2135 | Defect-ledger format, severity rubric, Phase 9.1 task. |
| `CLAUDE.md` | full | Authoring conventions, source-of-truth hierarchy. |

Cross-document corpus: `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` not consulted in this prompt — Pricing is companion-strategy authority and §34 is the numerical source-of-truth for pricing; the retention contract sits in §40.2 / §6.8.5 / §4 entity tables in the Master Spec.

---

## §40.2 — Enumerated Rows (n = 27)

The full content of §40.2 lines 31909–31946 was inventoried. The 27 enumerated rows cover:

1. Deleted workspace (soft-delete sweeper, 30d)
2. User data (responses, comments, audit) — generic "Life of workspace"
3. Canceled subscription (90d)
4. GDPR deletion request (30d to process — *processing-time*, not entity-retention)
5. Deprovisioned user (SCIM)
6. Internal Comment Thread / Post / Mention
7. Presence Record
8. Unread Marker
9. Buyer Referral — identity vs. financial split
10. Pro Trial Seat Grant — identity vs. financial split
11. Usage Event — raw rows / monthly aggregates / DSAR (3 rows)
12. Time-Saved Credit — raw rows / monthly aggregates / DSAR (3 rows)
13. UsageDashboardSnapshot — daily / monthly (2 rows)
14. `usage_event_outbox`
15. `usage_event_envelope_dlq`
16. Marketplace Category
17. Vendor Opt-Out Record
18. SellerSoftware
19. SellerOrgPage / SoftwarePage
20. CategoryPage / GuidePage / ComparisonPage
21. MarketIntelligenceReport
22. HeatMapCell
23. GhostBidImport
24. SellerSignal
25. PromotedListing (incl. PromotedListingAuctionRun AE)
26. FeaturedPlacement
27. VerificationReviewRecord
28. SellerOnboardingSession

(Operational tables and aggregates are counted within the same row block.)

---

## Reverse-Pass Coverage Table — every §4 entity → presence in §40.2

Legend: ✅ explicit row · ⚠ partial / generic-coverage only · ❌ missing · 🔁 inline retention prose in entity definition that should be migrated to §40.2 (numerical-singleton violation)

### §4.2 — Organization & Auth

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.2.1 Organization | ⚠ | Only "Canceled subscription | 90 days then purge" partially covers; soft-delete vs cancellation distinct; financial-record exemption silent. |
| 4.2.2 OrgUser / Membership | ⚠ | "Deprovisioned user (SCIM)" only; non-SCIM offboarding silent. |
| 4.2.3 User (Global) | ❌ | Global User row retention not stated. |
| 4.2.4 Team | ❌ | Absent. |
| 4.2.5 Group | 🔁 ❌ | Inline "7-year audit-integrity exemption" at §4.2.5 line 3715 not migrated to §40.2. |

### §4.3 — Buyer Console

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.3.1 Workspace | ⚠ | Only "Deleted workspace (soft delete) | 30 days, then permanent purge" — no cascade enumeration. |
| 4.3.2 Workspace Membership | ❌ | Absent. |
| 4.3.3 Use Case | ⚠ | Generic "User data" only. |
| 4.3.4 Requirement | ⚠ | Generic "User data" only. |
| 4.3.5 Response | ⚠ | Generic "User data" only. |
| 4.3.6 Score | ❌ | Absent. |
| 4.3.7 Intelligence Cache Entry | ❌ | Absent. |
| 4.3.8 Evaluation Scenario | ❌ | Absent. |
| 4.3.10 Evaluation Pulse Event | ❌ | Absent. |
| 4.3.11 Internal Comment Thread | ✅ | Explicit row 6 covers Thread / Post / Mention. |
| 4.3.12 Internal Comment Post | ✅ | Same as above. |
| 4.3.13 Internal Comment Mention | ✅ | Same as above. |
| 4.3.14 Presence Record | ✅ | Explicit. |
| 4.3.15 Unread Marker | ✅ | Explicit. |
| 4.3.16 Buyer Referral | ✅ | Identity / financial split. |
| 4.3.17 Pro Trial Seat Grant | ✅ | Identity / financial split. |
| 4.3.18 Usage Event | ✅ | Raw / monthly / DSAR. |
| 4.3.19 Time-Saved Credit | ✅ | Raw / monthly / DSAR. |
| 4.3.20 Target Account | ❌ | Absent. |
| 4.3.21 Selection Report Draft | ⚠ | Carried only as "parent" inside Internal Comment Thread row; own retention not declared. |
| 4.3.22 Inbox Item Group | ❌ | Absent. |

### §4.4 — Seller Console

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.4.1 Bid Workspace | ❌ | Absent. |
| 4.4.2 Bid Response | ❌ | Absent. |
| 4.4.3 Seller Profile | ❌ | Absent. |
| 4.4.4 Capability Declaration | ❌ | Absent. |
| 4.4.5 Bid Task | ❌ | Absent. |
| 4.4.6 Bid Schedule | ❌ | Absent. |
| 4.4.7 Marketplace Category | ✅ | Explicit. |
| 4.4.8 Vendor Opt-Out Record | ✅ | Explicit. |
| 4.4.9 SellerSoftware | ✅ | Explicit. |
| 4.4.10 SellerOrgPage | ✅ | Explicit. |
| 4.4.11 SoftwarePage | ✅ | Explicit. |
| 4.4.12 CategoryPage | ✅ | Explicit. |
| 4.4.13 GuidePage | ✅ | Explicit. |
| 4.4.14 ComparisonPage | ✅ | Explicit. |
| 4.4.15 MarketIntelligenceReport | ✅ | Explicit. |
| 4.4.16 HeatMapCell | ✅ | Explicit. |
| 4.4.17 GhostBidImport | ✅ | Explicit. |
| 4.4.18 SellerSignal | ✅ | Explicit. |
| 4.4.19 PromotedListing | ✅ | Explicit. |
| 4.4.20 FeaturedPlacement | ✅ | Explicit. |
| 4.4.21 VerificationReviewRecord | ✅ | Explicit. |
| 4.4.22 SellerOnboardingSession | ✅ | Explicit. |
| 4.4.23 OnboardingAntiPatternExceptionGrant | ❌ | Absent. |
| 4.4.24 EOIDraftQueue | ❌ | Absent. |
| 4.4.25 SellerInventoryDemotionExemption | ❌ | Absent. |
| 4.4.26 EOIRateLimitOverride | ❌ | Absent. |
| 4.4.27 OpsActionRecord | ❌ | Absent. (Cited in §4.8.1.A as the audit anchor for Ops emergency reversals — silence is high-impact.) |
| 4.4.28 TemplateLibraryEntry | ❌ | Absent. |
| 4.4.29 BidSuccessShare | ❌ | Absent. |

### §4.5 — Marketplace

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.5.1 Marketplace Listing | ❌ | Absent. |
| 4.5.2 EOI Record | ❌ | Absent. |
| 4.5.3 NDA Record | ❌ | Absent — and NDA is a binding contract artifact (financial-class equivalent). |
| 4.5.4 Taxonomy Node | ❌ | Absent. |
| 4.5.5 Controlled-Vocabulary Tag | ❌ | Absent. |
| 4.5.6 Vendor Opt-Out Record (cross-ref) | ✅ | Covered by §4.4.8 row. |
| 4.5.7 Marketplace Abuse Report | ❌ | Absent. |
| 4.5.8 EOI Acceptance Record | ❌ | Absent. |
| 4.5.9 EvalStarter | ❌ | Absent. |

### §4.6 — Audit & Logging

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.6.1 Audit Event | 🔁 ⚠ | §4.6.1.1 lines 7365–7368 declare per-plan UI retention `30d / 30d / 1y / 1y / 3y / 7y` plus 7-year financial/compliance exemption — **not in §40.2**. The §40.2 row "User data (responses, comments, audit) | Life of workspace" *contradicts* the 7-year financial exemption. |
| 4.6.2 Attachment | 🔁 ❌ | Author explicitly flagged at §4.6.2 line 7513: `(§40.2 new row required)`. Inline contract: orphan 24h, infected metadata 7y, Org-delete binary 30d / metadata 7y, DSAR binary 72h. |
| 4.6.3 OpsSession | ❌ | Absent. |
| 4.6.4 OpsSessionApiRequestLink | ❌ | Absent. |
| 4.6.5 DSARRequest | 🔁 ❌ | §4.6.5 line 7690 explicitly notes: *"§40.2 cited a 'GDPR deletion request' row with no entity backing."* The §40.2 row "GDPR deletion request | 30 days to process" describes *processing-time SLA*, **not** entity-retention. Entity retention (7y per §6.8.5 audit-integrity exemption) is missing from §40.2. |

### §4.7 — Cross-Console Bridge

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.7.1 Console Bridge Event | 🔁 ❌ | §4.7.1.1 lines 7967–7970 author retention classes (`bridge_event_financial_class` = workspace_lifetime + 7y; `bridge_event_operational_class` = workspace_lifetime + 90d) — **not in §40.2**. **Both classes EXCEED parent-workspace retention** (§40.2 row 1 = 30 days post-soft-delete), violating Check 5 directly. |
| 4.7.2 Vendor Disqualification Record | ❌ | Absent. |

### §4.8 — Billing & AI Accounting

| Entity | §40.2 status | Notes |
|---|---|---|
| 4.8.1 AIOperation | 🔁 ❌ | §4.8.1 line 8257: *"AIOperation rows retained for **7 years** from `created_at` per SOC-2 audit requirements."* Inline; **not in §40.2**. The single most-billed entity in the platform has no §40.2 row — this is the canonical Check-3 failure. |
| 4.8.2 CapabilityRegistryEntry | ❌ | Absent. |
| 4.8.3 AIWallet | 🔁 ❌ | §4.8.3 line 8485: *"Org-life + 7 years (SOC-2 financial audit)."* Inline; **not in §40.2**. |
| 4.8.4 OutcomeContract | ❌ | Absent. (Versioned contract; binds settled AIOperations — must be retained at least as long as longest-lived linked AIOperation.) |
| 4.8.5 ContestRecord | ❌ | Absent. (Financial-dispute record; SOX 7y likely.) |
| 4.8.6 CostBaseRecalculationLog | ❌ | Absent. |
| 4.8.7 FreeAllowanceCounter | ❌ | Absent. |
| 4.8.8 CommittedSpendContract | ❌ | Absent. (Financial — Enterprise commit pool contract.) |
| 4.8.9 PricingTableVersion | ❌ | Absent. (Backs Public Pricing API; rate-card history is consumer-protection evidence.) |
| 4.8.10 DowngradeExcessDataBucket | ❌ | Absent — even though entity name encodes "90-Day Read-Only Preservation". |
| 4.8.11 BillingSeatSnapshot | ❌ | Absent. |
| 4.8.12 MarketplaceDiscoveryRevenueRecord | ❌ | Absent. (Non-AI revenue line; financial.) |
| 4.8.13 SellerOutcomeSignalConfig | ❌ | Absent. |

### KB derived artifacts (Check 4)

| Concept | §40.2 status | Notes |
|---|---|---|
| KBEntry | ❌ | Absent. Lifecycle in §22.4.1 references "Vector + BM25 entries purged in same Convex transaction" on hard-delete (deleted_at + 30d). Cascade is described in §22.4.1 but §40.2 is silent. |
| KBDocument | ❌ | Absent. |
| KB Namespace | ❌ | Absent. (Migration described §22.4.4; no retention.) |
| Voyage embeddings (`embedding`, `embedding_v2`) | ❌ | Absent — even though §22.4.5 step 4 specifies "30-day retention window in case of rollback" for the v1 column drop. |
| BM25 index entries | ❌ | Absent. |
| KBNamespaceMigrationProgress | ❌ | Absent (acknowledged as "operational table; not detailed here" in §22.4.4). |

The reference to `KB_Engineering_Spec.md §5.4` in §22.4.1 / §4.4.9 is a stale dependency — that spec was retired in v7.0.0 per `CLAUDE.md` §5; KB content lives in §22 now, and §40.2 must own the retention contract for derived artifacts.

---

## Cross-Check Findings Against Prompt's Five Check Points

| Check | Status | Evidence |
|---|---|---|
| 1. Every §4 entity is a §40.2 data-class with a TTL. | ❌ FAIL | 50 of 75 §4 entities (~67%) have **no** explicit §40.2 row; 7 more have only generic / partial coverage; 6 carry inline retention that should live in §40.2. Tabulated above. |
| 2. Audit Events have own retention longer than typical transactional data. | ❌ FAIL | The §40.2 row "User data (responses, comments, audit) | Life of workspace" *conflates* audit retention with transactional retention and *contradicts* the §4.6.1.1 7-year financial/compliance exemption. There is no §40.2 row for Audit Event itself. |
| 3. Billing data (AIOperation, AIWallet snapshots) compliant with US/EU tax requirements. | ❌ FAIL | Both AIOperation and AIWallet declare 7-year retention **inline**, not in §40.2. ContestRecord, CommittedSpendContract, MarketplaceDiscoveryRevenueRecord, BillingSeatSnapshot, PricingTableVersion, OutcomeContract — all financial — are absent from §40.2. The Compliance Officer reading §40.2 alone would not know these are 7y retained. |
| 4. KB derived artifacts (embeddings) cascade from KB entry deletion. | ❌ FAIL | §22.4.1 declares the cascade behavior but §40.2 has no row for KBEntry, KBDocument, embeddings (`embedding`, `embedding_v2`), BM25 index entries, KB Namespace, or KBNamespaceMigrationProgress. The 30-day v1-embedding-rollback window in §22.4.5 has no §40.2 home. |
| 5. Cross-Console Bridge events retention is shorter than parent workspace. | ❌ FAIL — both axes | (a) §40.2 has **no** Console Bridge Event row. (b) §4.7.1.1 retention classes (`workspace_lifetime + 7y` for financial, `workspace_lifetime + 90d` for operational) **both exceed** §40.2 row 1's "30 days then purge" workspace soft-delete rule. The check's invariant is structurally violated. |

---

## Self-Challenge Pass (hostile-reviewer revision log)

1. **"Are you over-classifying P0?"** Reviewed P0 rules in `Audit_Prompts.md` §Severity Definitions:
   - Audit-log integrity is explicitly named (rule c).
   - Billing-surface ambiguity is explicitly named (rule d) — AIOperation, AIWallet, OutcomeContract listed by name.
   - Hard regulatory requirements named (GDPR right-to-erasure, US/EU residency lock, audit-log integrity).
   D-9.1-001 (Audit Event), D-9.1-002 (AIOperation silent in §40.2), D-9.1-003 (AIWallet silent in §40.2), D-9.1-007 (Bridge events outlive parent workspace — also a GDPR Art 17 fulfillment risk because subject-data outlives the deletion of the parent), D-9.1-014 (Attachment — DSAR fulfillment depends on §40.2 sweeper awareness), D-9.1-016 (DSARRequest entity itself missing — purges the GDPR audit trail), D-9.1-022 (numerical-singleton violation across 8 sites, reachable to revenue and audit) → P0 is correct.

2. **"Is the bridge-event-exceeds-workspace claim defensible?"** Yes. Re-reading §40.2 row 1 ("Deleted workspace (soft delete) | 30 days, then permanent purge"), the phrase "permanent purge" is unambiguous; §4.7.1.1 retention classes use `workspace_lifetime` as the BASE and ADD 7 years / 90 days, which by construction exceeds the workspace's 30-day post-soft-delete sweeper. The classes effectively attach to *another retention anchor* (the broader Org or financial-record clock), but §40.2 does not document that. Implementation result: the §40.2 retention sweeper would either purge bridge events with the workspace (violating §4.7.1.1) or fail to enforce any TTL on bridge events at all. Either branch is buildable-incorrect.

3. **"Is D-9.1-014 (Attachment) really P0?"** §4.6.2 line 7531 declares: *"DSAR right-to-erasure on uploader results in binary payload hard-deleted from storage within 72h."* If the §40.2 sweeper is unaware of Attachment, the DSAR enforcement layer either depends on §22 / §6.8 / §4.6.2 prose alone — meaning a junior engineer reading §40.2 alone would not implement the 72-hour binary-detach SLA. GDPR Art 17 fulfillment failure is a P0 hard-regulatory hit. The author's own inline note `(§40.2 new row required)` confirms the gap is known and unresolved. Confirm P0.

4. **"Are you producing correct evidence quotes?"** Spot-checked: §4.6.2 line 7513 (`(§40.2 new row required)`) — verified during read; §4.6.5 line 7690 (`§40.2 cited a 'GDPR deletion request' row with no entity backing`) — verified; §4.7.1.1 lines 7967–7970 retention class table — verified; §4.8.1 line 8257 — verified; §4.8.3 line 8485 — verified; §22.4.1 line 16303 ("Vector + BM25 entries purged in same Convex transaction") — verified.

5. **"Is the rolled-up form (one defect for §4.4 absences) defective?"** The defect-ledger format prescribes "one row per defect", and the prompt's reverse-pass instruction reads "*For every entity in §4, confirm §40.2 names it. File P1 retention for missing.*" — implying granular filing. To honor the prompt while keeping the ledger scannable, I file one defect per §4 sub-section group (D-9.1-009, D-9.1-010, D-9.1-011, D-9.1-013, D-9.1-019) and **enumerate the missing entities by name in the `evidence` cell** so the recommendation rolls into one §40.2 PR per group. Grouping is justified by identical convention violation (Master Spec §40.2 owns retention; entity table fails to provide a §40.2 row), identical recommendation (author one §40.2 row per entity with TTL / DSAR / residency / cascade), and identical owner. Where an entity has *additional* signal (inline retention prose, financial class, P0 escalation, author-flagged gap) it gets its own row. This is the minimum-defensible split.

6. **"Did you miss anything?"** Re-walked the §40.2 enumerated rows for additional silent failures:
   - Row 2 ("User data (responses, comments, audit)") — single sentence collapsing 3+ entities; **filed as D-9.1-024 P1 (ambiguity)**.
   - Row 3 ("Canceled subscription | 90 days, then purge") — silent on which classes are exempt from purge; conflict with §4.8.1 7-year retention and §6.8.5 audit-integrity exemption; **filed as D-9.1-021 P1**.
   - Row 4 ("GDPR deletion request | 30 days to process") — *processing-time*, not retention; misuse of the table; **filed as D-9.1-016 P0 (rolled with DSARRequest entity gap)**.
   - Row 1 ("Deleted workspace (soft delete) | 30 days, then permanent purge") — silent on cascade behavior; **filed as D-9.1-020 P1**.
   - Most §40.2 rows omit explicit `data_residency_region` partitioning (only the recently-added rows for UsageDashboardSnapshot, outbox, and DLQ explicitly state residency); **filed as D-9.1-023 P2**.

---

## Counterfactual Pass — three failure modes per check

### Check 1 (every §4 entity has a TTL)
- **FM-1A:** Engineer adds a new §4 entity (e.g., a future `BidWorkspaceAttachmentBundle`) and forgets to file a §40.2 row. **Spec gap:** No CI gate links §4 entity-table additions to §40.2 row presence. The §M.4 `appendix_m_coverage_on_diff` gate covers Appendix M, not §40.2. **Filed as D-9.1-025 P1.**
- **FM-1B:** Retention sweeper is implemented per §40.2 alone. Entities not enumerated are never swept; database grows unbounded. **Reachable from D-9.1-009 / D-9.1-011 / D-9.1-013 / D-9.1-019.**
- **FM-1C:** DSAR walker is implemented per §40.2 alone. Subject data persists in unenumerated entities (Bid Workspace, Score, Target Account, Selection Report Draft) past the §6.8.6 30-day SLA. **GDPR Art 17 fulfillment failure. Reachable from D-9.1-011 / D-9.1-019.**

### Check 2 (Audit Event retention > transactional)
- **FM-2A:** "Canceled subscription | 90 days then purge" purges Audit Events ahead of 7-year SOC-2 / SOX requirement. **Filed as D-9.1-001 / D-9.1-021.**
- **FM-2B:** Audit Event UI per-plan retention (`30d / 30d / 1y / 1y / 3y / 7y`) is invisible to the §40.2 reader. Engineer building plan-tier-aware UI reads §40.2 alone and offers Free / Solo orgs unbounded audit history. **Filed as D-9.1-001.**
- **FM-2C:** Bearer-secret-redacted Audit Events (per §4.6.1.2 D-1.5-001 remediation) inherit Audit Event retention; if §40.2 has no Audit Event row, the bearer-secret-redacted rows have no documented sweep, leaving redaction sentinels in storage past their useful life. **Reachable from D-9.1-001.**

### Check 3 (US/EU tax compliance for billing)
- **FM-3A:** AIOperation row purged with workspace at 30 days post-soft-delete — IRS / SOX 7-year violation. **Filed as D-9.1-002.**
- **FM-3B:** AIWallet row purged on Org cancellation at 90 days — billing reconciliation impossible during 7-year audit window. **Filed as D-9.1-003.**
- **FM-3C:** ContestRecord row purged before 7-year audit window — customer-dispute audit trail lost; non-defensible in tax audit. **Filed as D-9.1-019.**

### Check 4 (KB cascade)
- **FM-4A:** KB Entry hard-deleted but vector index entry persists (sweeper omits embedding cleanup) — orphan vectors served by `kb_retrieve` causing zombie matches. The §22.4.1 atomic-transaction guarantee covers application-path deletes only; sweeper-path deletes via §40.2 are not contracted. **Filed as D-9.1-006.**
- **FM-4B:** SellerSoftware soft-deleted → namespace migrated per §22.4.4 → migrated KB entries inherit `confidence_modifier × 0.7` rank penalty, but their parent SellerSoftware's 90-day post-soft-delete purge does NOT cascade to migrated KB entries (because they're now in a different namespace). §40.2 silence on KB Entry leaves this corner unhandled. **Filed as D-9.1-006.**
- **FM-4C:** Embedding-version-bump rollback window (§22.4.5 step 4: "30-day retention window in case of rollback") has no §40.2 home; if the rollback window is unenforced, v1 embeddings either persist forever or are dropped early causing silent retrieval-quality regression with no rollback option. **Filed as D-9.1-006.**

### Check 5 (Bridge events shorter than parent workspace)
- **FM-5A:** Workspace soft-deleted → 30-day sweep purges Workspace at day 30 → bridge events (per §4.7.1.1: `workspace_lifetime + 7y` financial; `workspace_lifetime + 90d` operational) point at a non-existent workspace. **Filed as D-9.1-007.**
- **FM-5B:** Buyer-side User issues GDPR right-to-erasure → DSAR cascade per §4.7.1.1 pseudonymizes bridge-event `created_by` and `payload_json` PII bearers — but bridge event itself outlives the workspace by years; a seller's DSAR walker cannot identify the bridge events as subject-data without traversing back to the (now-purged) workspace. **GDPR fulfillment risk. Filed as D-9.1-007.**
- **FM-5C:** Bridge event `bridge_event_operational_class` retained 90d post-workspace-purge contains seller-projected Q&A post bodies — leaking buyer-Q&A contents to the seller side past workspace deletion if seller cache flush per §4.7.1 client-cache DSAR attestation does not fire. **Filed as D-9.1-007.**

---

## Promoted Defects (Phase 9.1 → DEFECT_LEDGER.md)

| Local ID | Severity | Class | Summary headline |
|---|---|---|---|
| D-9.1-001 | P0 | retention | §40.2 has no Audit Event row; conflates audit retention with transactional. |
| D-9.1-002 | P0 | retention | §40.2 silent on AIOperation; 7y SOC-2 retention is inline-only. |
| D-9.1-003 | P0 | retention | §40.2 silent on AIWallet; Org-life+7y inline-only. |
| D-9.1-004 | P0 | retention | §40.2 silent on ContestRecord, CommittedSpendContract, MarketplaceDiscoveryRevenueRecord — all financial-class entities. |
| D-9.1-005 | P0 | retention | §40.2 silent on OutcomeContract (binds settled AIOperations) and PricingTableVersion (backs Public Pricing API). |
| D-9.1-006 | P1 | retention | §40.2 silent on KBEntry, KBDocument, embeddings, BM25 entries, KB Namespace, KBNamespaceMigrationProgress; cascade and rollback windows orphaned. |
| D-9.1-007 | P0 | retention | §40.2 silent on Console Bridge Event; §4.7.1.1 retention exceeds parent workspace (Check 5 violated). |
| D-9.1-008 | P1 | retention | §40.2 silent on Vendor Disqualification Record. |
| D-9.1-009 | P1 | retention | §40.2 silent on §4.2 entities (Organization, OrgUser/Membership, User, Team). |
| D-9.1-010 | P1 | retention | §4.2.5 Group inline 7-year retention not migrated to §40.2. |
| D-9.1-011 | P1 | retention | §40.2 silent on 11 §4.3 buyer-console entities (enumerated in evidence). |
| D-9.1-012 | P1 | retention | §40.2 silent on 13 §4.4 seller-console entities (enumerated in evidence). |
| D-9.1-013 | P1 | retention | §40.2 silent on 7 §4.5 marketplace entities (enumerated in evidence). |
| D-9.1-014 | P0 | retention / dsar | §40.2 silent on Attachment despite author-flagged gap (`§40.2 new row required` at line 7513); GDPR Art 17 fulfillment depends on §40.2 sweeper. |
| D-9.1-015 | P1 | retention | §40.2 silent on OpsSession and OpsSessionApiRequestLink (Ops impersonation audit trail). |
| D-9.1-016 | P0 | retention | §40.2 row 4 ("GDPR deletion request | 30 days to process") describes processing-time SLA, not entity retention; DSARRequest entity itself missing from §40.2 (author flagged at line 7690). |
| D-9.1-017 | P1 | retention | §40.2 silent on CapabilityRegistryEntry, FreeAllowanceCounter, CostBaseRecalculationLog, BillingSeatSnapshot, DowngradeExcessDataBucket, SellerOutcomeSignalConfig. |
| D-9.1-018 | (consolidated into D-9.1-014) | — | Merged — see D-9.1-014. |
| D-9.1-019 | (consolidated into D-9.1-004) | — | Merged — see D-9.1-004. |
| D-9.1-020 | P1 | retention | §40.2 row 1 (workspace soft-delete) does not enumerate cascade behavior across child entities. |
| D-9.1-021 | P1 | retention | §40.2 row 3 ("Canceled subscription | 90 days, then purge") overbroad; conflicts with §4.8.1 / §4.8.3 / §6.8.5 financial-record exemptions. |
| D-9.1-022 | P0 | numerical_singleton | §40.2 violates the "one authoritative home per number" convention; retention values duplicated across 8+ entity sections. |
| D-9.1-023 | P2 | residency | §40.2 omits explicit `data_residency_region` partitioning for most rows; only post-2026 rows declare residency. |
| D-9.1-024 | P1 | retention | §40.2 row 2 ("User data (responses, comments, audit) | Life of workspace") is overbroad; conflates 3+ entities with divergent retention. |
| D-9.1-025 | P1 | ci_gate | No CI gate enforces "every §4 entity table addition triggers a §40.2 row addition"; §M.4 covers Appendix M only. |

Total: 22 unique defects (D-9.1-018 / D-9.1-019 consolidated post-self-challenge).

---

## V9 Promotion Block (2026-05-09)

**Prompt.** `Audit_Prompts.md → Prompt V9 — Phase 9 Verification` (lines 2246–2264).
**Auditor.** Opus, Sourcera SWE mode, fresh session. Non-destructive.
**Master Spec baseline.** v7.1.0 (2026-04-28).

**V9 work product.** Full verification log at `_audit/PHASE9_VERIFY.md`. V9 inherits the upstream Phase 9.1 / 9.2 / 9.3 / 9.4 / 9.5 / 9.6 sub-prompt findings (D-9.1R-NNN, D-9.2-NNN, D-RES-NNN, D-45-NNN, D-33-NNN, D-41-NNN) and tests the adversarial reachability of three V9-prompt-named scenarios:

1. **Scenario A — DSAR cascade across both consoles + Bridge Event.** Walks Pattern B on User row + §4.7.1.1 redaction matrix + §6.8.4 fan-out classes + §6.8.4.5 (proposed) bridge-event body-text PII sweep + §40.2 Attachment row + partial-failure pause + idempotency. Reachable failure modes route to D-9.2-007 (P0 dsar), D-9.2-009 (P0 firewall_leakage), D-9.2-011 (P0 dsar), D-9.1R-014 (P0 retention/dsar), D-9.2-001/002/003/005/006 (P1 dsar/residency/numerical_singleton).
2. **Scenario B — EU-resident user accessing US-resident Org.** Walks §1.6 region-table completeness + global User row residency + DR cross-region failover + backup residency + region-migration procedure + legal-entity drift + audit-log residency. Reachable failure modes route to D-RES-001 (P0 residency), D-RES-002 (P0 residency), D-RES-004 (P0 numerical_singleton — billing class; outside V9 sign-off bucket but v7.1.1 blocker), D-RES-003/005/007/008/009/010/013/015 (P1/P2 residency / numerical_singleton / consistency_drift / documentation_gap).
3. **Scenario C — Marketplace abuse-spam.** Walks §27.8.12 SIM coordinated-abuse signature catalog + §4.5.7 abuse-report rate-limits + §48.4.12 EOI caps + §22 KB content-moderation absence. SIM signature `burst_reporter_anomaly` + `counterfeit_org_signature` + `fraud_ring_signature` mitigate vectors V1–V3 reactively; vector V4 (KB content moderation evasion) routes to D-45-010 (P1 documentation_gap) — held at P1 because severity rubric does not include reputation/libel risk; promotion to P0 abuse_path declined.

**V9 promotes 2 new P3 documentation_gap defects.**

| Local ID | Severity | Class | Summary headline |
|---|---|---|---|
| D-V9-001 | P3 | documentation_gap | Subject-side residency model is silent across the corpus; controller-side Org residency is the only model authored — non-feature acknowledgment missing for spec hygiene + auditor / customer-DPA reviewer transparency. |
| D-V9-002 | P3 | documentation_gap | Phase 9 has no dedicated §42 sub-prompt; §42 coverage is provided by cross-cut from 9.3 / 9.5 / 9.6; v7.1.x audit-program backlog candidate. |

**V9 SIGN-OFF: FAIL.** 6 open P0 in V9 sign-off classes (target: 0):

- `dsar`: D-9.2-007, D-9.2-011, D-9.1R-014.
- `residency`: D-RES-001, D-RES-002.
- `firewall_leakage`: D-9.2-009.
- `abuse_path`: 0.

**Phase 9 program halts. v7.1.1 stamp blocked. Remediation path documented in `_audit/PHASE9_VERIFY.md` §7 (six-bundle ordering: §6.8.4 cascade pack → §40.2 retention pack → §42.4 residency-bound DR pack → §47.4 elevation → legal-entity reconciliation → AE ratification).**

Self-challenge + counterfactual passes documented in `_audit/PHASE9_VERIFY.md` §8 / §9. No severity revisions on V9 work.

