# Phase Retention — §40.2 Walk-Through and Reverse-Pass Findings

**Audit prompt.** "Walk §40.2 end-to-end. Verify every §4 entity has a TTL row; verify audit-event retention is longer than typical transactional data; verify billing data retention is US/EU-compliant; verify KB derived-artifact retention cascades from KB entry deletion; verify Cross-Console Bridge retention is shorter than parent workspace retention. Reverse pass: for every §4 entity, confirm §40.2 names it. File P1 retention for missing."

**Defect-id mnemonic.** `D-RET-NNN` (Retention coverage walk). Sequential within this prompt.

**Run date.** 2026-05-08.

**Master Spec baseline.** v7.1.0 (2026-04-28). §40.2 lines 31907–31945 (~38 retention rows).

**Companion sources walked.**
- `Sourcera_Master_Spec.md` §4.2 → §4.8 (every entity field-table + inline `Retention` block).
- §6.8 / §6.8.5 (DSAR retained-row class catalog).
- §34.1.1 / §34.1.2 (per-plan-tier UI retention curve — Audit Log Retention cell).
- `_audit/COVERAGE_MATRIX.md` (existing `retention` column states).

---

## §40.2 Composition — As-Is

§40.2 contains **38 retention rows** across the conditions enumerated in lines 31909–31945. Inventoried below.

| § Row | Retention rule |
| :---- | :---- |
| Deleted workspace (soft delete) | 30 days, then permanent purge |
| User data (responses, comments, audit) | Life of workspace |
| Canceled subscription | 90 days, then purge |
| GDPR deletion request | 30 days to process |
| Deprovisioned user (SCIM) | 24h reassign; record retained |
| Internal Comment Thread / Post / Mention | Life of parent + 30-day cascade purge |
| Presence Record | Ephemeral 60s |
| Unread Marker | 30 days post-thread-hard-delete OR membership loss |
| Buyer Referral identity | DSAR pseudonymize within 30 days |
| Buyer Referral financial | Org-life + 7 years |
| Pro Trial Seat Grant identity | DSAR pseudonymize within 30 days |
| Pro Trial Seat Grant financial | Org-life + 7 years |
| Usage Event raw rows | 24-month rolling |
| Usage Event monthly aggregates | Org-life |
| Usage Event DSAR | 30 days redact |
| Time-Saved Credit raw rows | 36-month rolling |
| Time-Saved Credit monthly aggregates | Org-life |
| Time-Saved Credit DSAR | 30 days redact |
| UsageDashboardSnapshot daily (§51.3.1) | 90 days |
| UsageDashboardSnapshot monthly (§51.3.1) | 24 months |
| `usage_event_outbox` | 7 days post-ack |
| `usage_event_envelope_dlq` | 30 days |
| Marketplace Category | Platform-life |
| Vendor Opt-Out Record | Org-life + 7 years |
| SellerSoftware | Org-life; 90-day post-delete purge |
| SellerOrgPage / SoftwarePage | Org-life; 90-day archive |
| CategoryPage / GuidePage / ComparisonPage | Platform-life |
| MarketIntelligenceReport | Platform-life; 8-quarter auto-archive |
| HeatMapCell | 24 months raw |
| GhostBidImport (`raw_text`, `parsed_qa_pairs_json`) | 90 days post-publish |
| SellerSignal | 180 days raw |
| PromotedListing (financial-class) | Seller Org-life + 7 years |
| FeaturedPlacement (editorial) | Platform-life |
| FeaturedPlacement (paid-commitment) | Seller Org-life + 7 years |
| VerificationReviewRecord | Seller Org-life + 7 years |
| SellerOnboardingSession | Seller Org-life + 36 months |

§40.2 does NOT contain rows for: AIOperation, AIWallet, OutcomeContract, ContestRecord, CapabilityRegistryEntry, CostBaseRecalculationLog, FreeAllowanceCounter, CommittedSpendContract, PricingTableVersion, DowngradeExcessDataBucket, BillingSeatSnapshot, MarketplaceDiscoveryRevenueRecord, SellerOutcomeSignalConfig, Audit Event (per-plan-tier UI retention table), Attachment, OpsSession, OpsSessionApiRequestLink, DSARRequest, Console Bridge Event (class table), Vendor Disqualification Record, Bid Workspace, Bid Response, Seller Profile, Capability Declaration, Bid Task, Bid Schedule, OnboardingAntiPatternExceptionGrant, EOIDraftQueue, SellerInventoryDemotionExemption, EOIRateLimitOverride, OpsActionRecord, TemplateLibraryEntry, BidSuccessShare, Marketplace Listing, EOI Record, NDA Record, Taxonomy Node, Controlled-Vocabulary Tag, Marketplace Abuse Report, EOI Acceptance Record, EvalStarter, Group, Team, Organization, Organization User / Membership, User, Workspace Membership, Use Case, Requirement, Response, Score, Intelligence Cache Entry, Evaluation Scenario, Evaluation Pulse Event, Target Account, Selection Report Draft, Inbox Item Group, KB Entry, KB-derived embeddings (vector + BM25), MCP session token records, KB export jobs, AI session log archive (`ai_operation_session_log_archive`), `extended_financial` retention-tier definition.

---

## Reverse Pass — §4 Entity × §40.2 Coverage

Sentinel: `✅` = §40.2 has a discrete row OR an inline §4 entity-local retention block that single-sources retention; `❌` = no §40.2 row AND inline retention either silent OR cites a §40.2 row that does not exist.

### §4.2 Organization & Auth Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.2.1 Organization | partial — "Canceled subscription" only | none | ❌ Org hard-delete cascade silent on most child rows. |
| 4.2.2 Organization User / Membership | "Deprovisioned user (SCIM)" only | none | ❌ no row for non-SCIM membership lifecycle. |
| 4.2.3 User | "Deprovisioned user (SCIM)" only | none | ❌ Global User entity has no DSAR-deferred retention floor in §40.2. |
| 4.2.4 Team | none | none | ❌ |
| 4.2.5 Group | none | "7-year audit-integrity exemption" inline (line 3715) | ⚠ inline only; not single-sourced in §40.2. |

### §4.3 Buyer Console Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.3.1 Workspace | "Deleted workspace" + "User data" | "Inherits Workspace retention from §40.2 — no separate rule" (line 3777, on `evaluation_owner_mode`) | ⚠ Workspace's *non-deleted* retention is implicit; no row says "active Workspace retained for life of Org." |
| 4.3.2 Workspace Membership | none | none | ❌ |
| 4.3.3 Use Case | partial via "User data" | none | ❌ explicit row absent. |
| 4.3.4 Requirement | partial via "User data" | none | ❌ explicit row absent. |
| 4.3.5 Response | partial via "User data" | none | ❌ explicit row absent. |
| 4.3.6 Score | none | none | ❌ |
| 4.3.7 Intelligence Cache Entry | partial via "Internal Workspace Engine Entity" cited at line 3914 | "Cascade soft-delete + 30-day purge per §40.2 row 'Internal Workspace Engine Entity (Scenario / Selection Report Draft / Pulse Event / Intelligence Cache Entry)'" (line 3914) | ❌ The cited §40.2 row "Internal Workspace Engine Entity" **does not exist in §40.2**. |
| 4.3.8 Evaluation Scenario | partial via cited row at line 3914 (does not exist) | as above | ❌ as above. |
| 4.3.10 Evaluation Pulse Event | partial via cited row at line 3914 (does not exist) | as above | ❌ as above. |
| 4.3.11–4.3.13 Internal Comment Thread / Post / Mention | ✅ | "Inherits parent Internal Comment Post retention" (line 4123) | ✅ |
| 4.3.14 Presence Record | ✅ ("Presence Record" row) | ✅ inline "No retention row needed in §40.2" (line 4160) — internally inconsistent with the row that DOES exist | ⚠ contradiction: §40.2 has a Presence Record row but §4.3.14 says one is not needed. |
| 4.3.15 Unread Marker | ✅ | ✅ | ✅ |
| 4.3.16 Buyer Referral | ✅ | ✅ | ✅ |
| 4.3.17 Pro Trial Seat Grant | ✅ | ✅ | ✅ |
| 4.3.18 Usage Event | ✅ | ✅ | ✅ |
| 4.3.19 Time-Saved Credit | ✅ | ✅ | ✅ |
| 4.3.20 Target Account | none | "On Evaluation Workspace hard-delete, Target Account rows hard-deleted within 30 days per §40.2" (line 4492) — citation broken | ❌ §40.2 has no Target Account row. |
| 4.3.21 Selection Report Draft | none | "Finalized-draft rows retained 7 years per Evaluation Workspace **§4.8 retention rules**" (line 4549) — §4.8 is Billing & AI Accounting Entities, NOT retention | ❌ broken citation; no §40.2 row. |
| 4.3.22 Inbox Item Group | none | inline retention only (line 4601) | ❌ no §40.2 row. |

### §4.4 Seller Console Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.4.1 Bid Workspace | none | none in field block | ❌ Bid Response cites "Workspace life + 7 years per §40.2 (aligned with Bid Workspace retention)" (line 4686) — but the Bid Workspace row in §40.2 does not exist. |
| 4.4.2 Bid Response | none | "Workspace life + 7 years per §40.2 (aligned with Bid Workspace retention)" (line 4686) — citation broken | ❌ |
| 4.4.3 Seller Profile | none | none | ❌ |
| 4.4.4 Capability Declaration | none | "Life of seller Org; soft-deleted retained 180 days … unless linked to an unsettled OutcomeContract (in which case retention extends per §40.2 `ai_operation_session_log_archive` alignment)" (line 4786) — `ai_operation_session_log_archive` is not present in §40.2 | ❌ broken citation. |
| 4.4.5 Bid Task | none | none | ❌ |
| 4.4.6 Bid Schedule | none | none | ❌ |
| 4.4.7 Marketplace Category | ✅ | ✅ | ✅ |
| 4.4.8 Vendor Opt-Out Record | ✅ | ✅ | ✅ |
| 4.4.9 SellerSoftware | ✅ | ✅ | ✅ |
| 4.4.10 SellerOrgPage | ✅ | ✅ | ✅ |
| 4.4.11 SoftwarePage | ✅ | ✅ | ✅ |
| 4.4.12–14 CategoryPage / GuidePage / ComparisonPage | ✅ | ✅ | ✅ |
| 4.4.15 MarketIntelligenceReport | ✅ | ✅ | ✅ |
| 4.4.16 HeatMapCell | ✅ | ✅ | ✅ |
| 4.4.17 GhostBidImport | ✅ | ✅ | ✅ |
| 4.4.18 SellerSignal | ✅ | ✅ | ✅ |
| 4.4.19 PromotedListing | ✅ | ✅ | ✅ |
| 4.4.20 FeaturedPlacement | ✅ | ✅ | ✅ |
| 4.4.21 VerificationReviewRecord | ✅ | ✅ | ✅ |
| 4.4.22 SellerOnboardingSession | ✅ | ✅ | ✅ |
| 4.4.23 OnboardingAntiPatternExceptionGrant | none | "7 years (Ops audit + §6.8 DSAR scope + §34.11 financial-audit traceability)" (line 6398) | ❌ inline only; no §40.2 row. |
| 4.4.24 EOIDraftQueue | none | "3 years post-`materialized_at` OR post-`expires_at` (whichever is terminal)" (line 6458) | ❌ inline only. |
| 4.4.25 SellerInventoryDemotionExemption | none | "7 years" (line 6520) | ❌ inline only. |
| 4.4.26 EOIRateLimitOverride | none | "3 years" (line 6564) | ❌ inline only. |
| 4.4.27 OpsActionRecord | none | "7 years (Ops audit + regulatory-defense horizon)" (line 6604) | ❌ inline only; line 40916 cross-cites "every §50.16 OpsActionRecord MUST be retained 7 years per §40.2; retention sweep verifies nightly" — but §40.2 has no OpsActionRecord row. |
| 4.4.28 TemplateLibraryEntry | none | "Perpetual for `published`/`featured`; 1 year post-deprecate; 90 days for `rejected`" (line 6660) | ❌ inline only. |
| 4.4.29 BidSuccessShare | none | "3 years post-terminal-status" (line 6737) AND "Published shares: retained Org-life + 2 years … Draft/expired/revoked: purged 90 days" (line 36616) — two inline retention statements that disagree | ❌ inline only AND internally inconsistent. |

### §4.5 Marketplace Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.5.1 Marketplace Listing | none | none | ❌ |
| 4.5.2 EOI Record | none | none | ❌ |
| 4.5.3 NDA Record | none | none | ❌ |
| 4.5.4 Taxonomy Node | none | "Life of platform" (line 4908) | ❌ inline only. |
| 4.5.5 Controlled-Vocabulary Tag | none | "approved/deprecated rows retained for life of platform" (line 6974) | ❌ inline only. |
| 4.5.7 Marketplace Abuse Report | none | "10 years (legal-defensibility horizon)" (line 35795) | ❌ inline only. |
| 4.5.8 EOI Acceptance Record | none | "Life of Workspace + 7 years (aligned with §40.2 Workspace retention)" (line 7215) — `Workspace + 7 years` is not actually present in §40.2 (the Workspace row enumerates only the "Deleted workspace 30 days" rule) | ❌ broken citation. |
| 4.5.9 EvalStarter | none | none | ❌ |

### §4.6 Audit & Logging Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.6.1 Audit Event | partial — covered only as "User data … Life of workspace" generic | "Per plan tier per §40.2 (`30d / 30d / 1y / 1y / 3y / 7y` for Free / Solo / Starter / Growth / Scale / Enterprise)" (line 7366) — but the per-tier UI table is in §34.1.1 / §34.1.2, NOT §40.2. Plus the 7-year financial-action retention exemption per §6.8.5 row class. | ❌ §40.2 row missing per-tier curve AND missing the 7-year financial-action exemption row. |
| 4.6.2 Attachment | none | "Infected attachments … metadata row retained 7 years in `infected_quarantined` state for forensic audit (§40.2 new row required)" (line 7513) — spec acknowledges the gap inline | ❌ self-acknowledged gap. |
| 4.6.3 OpsSession | none | "7 years minimum" inline (line 7590) | ❌ inline only. |
| 4.6.4 OpsSessionApiRequestLink | none | "7 years aligned with §4.6.3 OpsSession retention" (line 7656) | ❌ inline only. |
| 4.6.5 DSARRequest | none | "7 years per §6.8.5 audit-integrity exemption" (line 7741) | ❌ inline only. |

### §4.7 Cross-Console Bridge Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.7.1 Console Bridge Event | none | "Bridge events retained for Workspace life + 7 years per §40.2 (aligned with Workspace retention)" (line 7933) AND a separate class table at §4.7.1.1 with `bridge_event_financial_class` (workspace_lifetime + 7y) and `bridge_event_operational_class` (workspace_lifetime + 90d) — the §40.2 row referenced does not exist | ❌ broken citation. |
| 4.7.2 Vendor Disqualification Record | none | "Workspace life + 7 years" (line 8100) | ❌ inline only. |

### §4.8 Billing & AI Accounting Entities

| Entity | §40.2 row | Inline retention | Status |
| :---- | :---- | :---- | :---- |
| 4.8.1 AIOperation | none | "7 years from `created_at` per SOC-2 audit requirements" (line 8257) | ❌ inline only. |
| 4.8.2 CapabilityRegistryEntry | none | "Life of platform" (line 8369) | ❌ inline only. |
| 4.8.3 AIWallet | none | "Org-life + 7 years (SOC-2 financial audit)" (line 8485) | ❌ inline only. |
| 4.8.4 OutcomeContract | none | "Rule definitions retained indefinitely … superseded retained ≥ 7 years after the last AIOperation resolved under them settles" (line 9111) | ❌ inline only. |
| 4.8.5 ContestRecord | none | "7 years (Ops audit + financial-reconciliation relevance for §21.4.3 cost-center routing + §34.11 Outcome Resolver settlement traceability)" (line 35711) | ❌ inline only. |
| 4.8.6 CostBaseRecalculationLog | none | "Life of platform (audit)" (line 8686) | ❌ inline only. |
| 4.8.7 FreeAllowanceCounter | none | "Org-life; hard-purge on Org hard-delete" (line 8732) | ❌ inline only. |
| 4.8.8 CommittedSpendContract | none | "Org-life + 7 years (financial-audit)" (line 8798) | ❌ inline only. |
| 4.8.9 PricingTableVersion | none | "Life of platform" (line 8845) | ❌ inline only. |
| 4.8.10 DowngradeExcessDataBucket | none | the entity defines its own 90-day retention inline | ❌ inline only. |
| 4.8.11 BillingSeatSnapshot | none | "Daily 90 days; weekly 1 year; monthly 7 years" (line 8937) | ❌ inline only. |
| 4.8.12 MarketplaceDiscoveryRevenueRecord | none | "7 years minimum per §40.2 (SOC-2 financial record retention)" (line 9006) — broken citation | ❌ broken citation. |
| 4.8.13 SellerOutcomeSignalConfig | none | "Rule definitions retained indefinitely … superseded retained ≥ 7 years" (line 9111) | ❌ inline only. |

---

## §40.2 Check Set

### Check 1 — Every §4 entity has a TTL row in §40.2

**Result.** ❌ FAIL. ~50 of the ~78 §4 entities do not have a §40.2 row. The full miss list is captured in the reverse-pass tables above. Filed as **D-RET-001** (umbrella) plus per-entity rows D-RET-002 through D-RET-014 for the highest-blast-radius missing rows.

### Check 2 — Audit-event retention is longer than typical transactional data

**Result.** ⚠ PARTIAL (rationale-correct but §40.2 self-broken). §6.8.5 row class #1 / §4.6.1.1 line 7367 establish a 7-year retention floor for financial- and compliance-action audit events on every plan tier — longer than the 24-month Usage Event raw-row retention and longer than the 90-day usage_event_outbox retention. The substantive contract is correct. **However**, the §40.2 row itself is missing — §40.2 has no Audit Event row, no per-plan-tier UI retention curve, and no `extended_financial` retention-tier definition. Citations from §4.6.1.1, §6.8.5, §9284, and §44721 all route to §40.2 rows that do not exist. Filed as **D-RET-015**.

### Check 3 — Billing data retention is US/EU tax-and-records compliant

**Result.** ⚠ PARTIAL on US, ❌ on EU.

- **US.** SOC-2 financial-record retention floor (7 years) inline on AIOperation (line 8257), AIWallet (line 8485), OutcomeContract (line 9111), ContestRecord (line 35711), CommittedSpendContract (line 8798), MarketplaceDiscoveryRevenueRecord (line 9006). Sarbanes-Oxley §802 alignment satisfied. IRS three-to-seven-year retention satisfied.
- **EU.** Inline 7-year retention does NOT satisfy the longer EU member-state floors:
  - Germany HGB §257 — 10 years for accounting and tax records.
  - France Code de commerce L.123-22 — 10 years.
  - Italy Codice Civile art. 2220 — 10 years.
  - Belgium W.Venn. art. III.86 — 7 years for some classes; 10 years for VAT-relevant invoices.
- The §40.2 row (when it eventually exists) MUST distinguish residency-region floors: US `≥ 7y`, EU `≥ 10y`. The current spec is silent. Filed as **D-RET-016** (P1; EU-residency Org cannot ship without 10y retention floor).

Independently, the `extended_financial` retention tier is referenced (line 5035 enum `data_retention_tier`, line 9284, line 10082, line 44721, line 45055, line 45672, line 45684) but never defined in §40.2 as a row with a TTL formula — only the implication "longer 7-year horizon" appears. Filed as **D-RET-017**.

### Check 4 — KB derived-artifact retention cascades from KB entry deletion

**Result.** ❌ FAIL. KB Entry retention statement at line 16211: "Soft-deleted entries are hard-deleted 30 days after `deleted_at` per §40.2 `kb_entry_soft_deleted` row." The §40.2 `kb_entry_soft_deleted` row does NOT exist. Embedding (`embedding`, `embedding_v2`) and BM25 index purge is asserted to occur "in the same Convex transaction" as the hard-delete — but the cascade is not documented in §40.2. KB-derived artifacts (export jobs at line 18693 — `kb_export_job` self-flagged as "Authored Extension; flagged in RECONCILIATION.md"; MCP session token records at line 16588 — `mcp_session_token_record` self-flagged "new row"; AI session log archive at line 18178 — `ai_operation_session_log_archive`) all cite §40.2 rows that do not exist. Filed as **D-RET-018** (KB Entry cascade) and **D-RET-019** (KB-derived artifact umbrella: kb_export_job, mcp_session_token_record, ai_operation_session_log_archive).

### Check 5 — Cross-Console Bridge events retention is shorter than parent workspace retention

**Result.** ❌ FAIL on `bridge_event_financial_class`. §4.7.1.1 establishes:
- `bridge_event_financial_class` TTL = `workspace_lifetime + 7 years`.
- `bridge_event_operational_class` TTL = `workspace_lifetime + 90 days`.

§40.2 row "Deleted workspace (soft delete) | 30 days, then permanent purge" implies the **parent workspace** itself is purged 30 days post-soft-delete. The financial-class bridge events outlive the parent workspace by 7 years (and the operational class by 90 days). The §6.8.5 audit-integrity exemption rationale supports the financial class extension, but the §40.2 row does not articulate the cascade contract — and no §40.2 row references the bridge-event class table at all. Filed as **D-RET-020** (P2; the rationale is correct but the spec contract is silent on cascade — a hostile reviewer would read §40.2 row "Deleted workspace … permanent purge" and conclude bridge events purge with the workspace).

### Self-acknowledged §40.2 gaps in the corpus

The following Master Spec lines self-acknowledge that a §40.2 row is missing or pending:

| Line | Self-acknowledgement |
| :---- | :---- |
| 7513 | "metadata row retained 7 years in `infected_quarantined` state for forensic audit (§40.2 new row required)" |
| 16588 | "hard-deleted at 7 years per §40.2 (new row: `mcp_session_token_record`)" |
| 18693 | "Registered as `kb_export_job` in §40.2 Retention Schedule — Authored Extension; flagged in RECONCILIATION.md" |

These are not silent gaps; they are open backlog items. Each is filed as a separate defect for ledger trackability.

### Internal inconsistencies surfaced

1. §4.3.14 Presence Record line 4160 says "No retention row needed in §40.2" — but §40.2 line 31917 includes a Presence Record row. The contract is internally inconsistent. Filed as **D-RET-021** (P3).
2. §4.4.29 BidSuccessShare has two non-overlapping inline retention statements (line 6737 says "3 years post-terminal-status"; line 36616 says "Org-life + 2 years … 90-day post-terminal-state purge"). Filed as **D-RET-022** (P1, retention; ambiguity affects the retention sweeper's actual behavior).
3. §4.3.21 Selection Report Draft cites "**§4.8** retention rules" (line 4549) — §4.8 is Billing & AI Accounting Entities, not retention. The likely intended cite is §40.2 (which is also silent). Filed as **D-RET-023** (P2).

---

## Defect Promotion Plan

The following defects will be promoted to `DEFECT_LEDGER.md`:

| ID | Severity | Class | Anchor |
| :---- | :---- | :---- | :---- |
| D-RET-001 | P1 | retention | §40.2 (umbrella) — 50 entities missing TTL rows |
| D-RET-002 | P1 | retention | §40.2 — Audit Event row missing (per-plan-tier curve cited but absent) |
| D-RET-003 | P1 | retention | §40.2 — Console Bridge Event class table cited but absent |
| D-RET-004 | P1 | retention | §40.2 — AIOperation row missing |
| D-RET-005 | P1 | retention | §40.2 — AIWallet / OutcomeContract / ContestRecord / CommittedSpendContract / MarketplaceDiscoveryRevenueRecord rows missing (financial cluster) |
| D-RET-006 | P1 | retention | §40.2 — Attachment row missing (self-acknowledged at line 7513) |
| D-RET-007 | P1 | retention | §40.2 — KB Entry / `kb_entry_soft_deleted` row cited but absent |
| D-RET-008 | P1 | retention | §40.2 — `ai_operation_session_log_archive` row cited but absent |
| D-RET-009 | P1 | retention | §40.2 — `mcp_session_token_record` row cited but absent (self-acknowledged) |
| D-RET-010 | P1 | retention | §40.2 — `kb_export_job` row cited but absent (self-acknowledged) |
| D-RET-011 | P1 | retention | §40.2 — Bid Workspace / Bid Response / Seller Profile / Capability Declaration / Bid Task / Bid Schedule rows missing (Seller Console cluster) |
| D-RET-012 | P1 | retention | §40.2 — OpsSession / OpsSessionApiRequestLink / DSARRequest / OpsActionRecord rows missing (audit/Ops cluster) |
| D-RET-013 | P1 | retention | §40.2 — Marketplace Listing / EOI Record / NDA Record / Taxonomy Node / Controlled-Vocabulary Tag / Marketplace Abuse Report / EOI Acceptance Record / EvalStarter rows missing (Marketplace cluster) |
| D-RET-014 | P1 | retention | §40.2 — Target Account / Selection Report Draft / Inbox Item Group / Score / Intelligence Cache Entry / Evaluation Scenario / Evaluation Pulse Event rows missing (Buyer Workspace internal cluster) |
| D-RET-015 | P1 | retention | §40.2 — per-plan-tier Audit Log UI retention curve missing (table is in §34.1; §40.2 is silent) |
| D-RET-016 | P1 | retention | §40.2 — EU residency 10-year billing retention floor missing (HGB §257 / France L.123-22 / Italy art. 2220) |
| D-RET-017 | P1 | retention | §40.2 — `extended_financial` retention tier referenced but never defined |
| D-RET-018 | P1 | retention | §22 KB Entry retention cascade not documented in §40.2 (vector + BM25 index purge contract orphaned) |
| D-RET-019 | P1 | retention | §40.2 — KB-derived artifact umbrella row missing (covers kb_export_job + mcp_session_token_record + ai_operation_session_log_archive) |
| D-RET-020 | P2 | retention | §40.2 — Cross-Console Bridge Event cascade contract silent (financial class outlives parent workspace by 7y; rationale correct but cascade not documented in §40.2) |
| D-RET-021 | P3 | retention | §4.3.14 / §40.2 — Presence Record contradiction (line 4160 vs line 31917) |
| D-RET-022 | P1 | retention | §4.4.29 BidSuccessShare — two inline retention statements disagree (3y vs Org-life + 2y) |
| D-RET-023 | P2 | retention | §4.3.21 Selection Report Draft — citation to "§4.8 retention rules" routes to Billing entities, not retention |
| D-RET-024 | P1 | retention | §4.4.23–§4.4.28 cluster (OnboardingAntiPatternExceptionGrant, EOIDraftQueue, SellerInventoryDemotionExemption, EOIRateLimitOverride, OpsActionRecord, TemplateLibraryEntry) — inline-only retention; §40.2 silent |
| D-RET-025 | P2 | retention | §4.2.x (Organization, Org Membership, User, Team, Group) — §40.2 lacks Org / User / Team / Membership hard-delete cascade rows; only "Canceled subscription" + "Deprovisioned user (SCIM)" partial coverage. Group retention exists inline but is not single-sourced. |

---

## Self-Challenge Pass

Re-read as hostile reviewer:

1. **Is "every §4 entity needs a §40.2 row" too aggressive a standard?** The audit prompt explicitly requires it ("Every entity in §4 is represented as a data class with a TTL"). The intent of §40.2 is to be the canonical retention catalog. If §40.2 is allowed to inline-defer to §4 entity blocks, then §40.2 stops being the single-source authority that §6.8 / §6.8.5 / §40.2 retention sweeper / §M.5 CI gates assume. The standard holds.
2. **Is D-RET-020 (Bridge cascade) actually a defect?** The financial-class retention extension is rationale-supported in §6.8.5. But §40.2 does NOT carry the cascade contract — and a retention sweeper implementer reading only §40.2 row "Deleted workspace … permanent purge" would conclude bridge events purge with the workspace. The defect stands; severity P2 because the implementation guidance is recoverable from §4.7.1.1 + §6.8.5.
3. **Should D-RET-022 (BidSuccessShare) be P0?** The two inline statements are both retention-class divergences — 3y vs Org-life+2y. A retention sweeper following one rule will hard-delete data that the other rule preserves, OR vice versa. This is unbuildable as written. P1 holds (P0 reserved for billing-revenue / firewall / regulatory blockers; this is not a regulatory blocker because both retention values exceed the GDPR 30-day DSAR window).
4. **Could D-RET-016 (EU 10-year retention) be argued as P2?** It is a regulatory blocker for EU-residency Orgs. A Sourcera Org with `data_residency_region=eu` cannot legally ship under HGB §257 with a 7-year retention. P1 holds; arguable P0 if any current customer is EU-residency. Pending legal review; flagged for `legal` owner-hint.
5. **Are the umbrella defects (D-RET-001) too coarse?** The umbrella aggregates 50 missing rows. Splitting into per-cluster sub-defects (D-RET-011 through D-RET-014) preserves resolution granularity. The umbrella is retained as the single P1 anchor for remediation planning; per-cluster defects carry the actual work.

No revisions on re-read; the defect set is stable.

---

## Counterfactual Pass

For §40.2 specifically, the three realistic failure modes:

1. **Retention sweeper hard-deletes a row that a §40.2-orphan entity needed retained.** Mitigated only by per-entity inline retention statements, which the sweeper cannot reliably consume. The §40.2 single-source missing rows are exactly the failure mode. Filed via D-RET-001 + D-RET-011..014.
2. **DSAR fulfillment cascade misses a §40.2-orphan entity.** §6.8.5 enumerates retained-row classes by `action` enum, not by entity; entities with no §40.2 row have no `action`-binding established. KB Entry, Attachment, Console Bridge Event are at risk. Filed via D-RET-007 / D-RET-006 / D-RET-003.
3. **Plan-downgrade compresses retention horizon below regulatory floor.** §40.2 has no row tying plan-tier UI retention to the §6.8.5 financial-action exemption — the 30-day Free / 30-day Solo retention would otherwise hard-delete financial audit events at month one. The exemption is asserted in §4.6.1.1 but not §40.2. Filed via D-RET-002 / D-RET-015.

All three failure modes converge on the same root cause: §40.2 is treated as authoritative by every consumer (CI gates, retention sweeper, DSAR cascade walker, §6.8.5 retained-row class catalog, §M.5 contracts) but is itself incomplete relative to §4. The fix is structural: §40.2 must enumerate every §4 entity OR cite the inline §4 retention block by anchor and be the single contract layer for the sweeper.
