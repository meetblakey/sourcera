# Phase 4.7 — §16 Organizational Intelligence Walk Findings (Scratch Log)

**Phase prompt:** `Audit_Prompts.md → Prompt 4.7 — Organizational Intelligence (§16)` (line 1342).
**Run completed:** 2026-05-04.
**Scope:** Master Spec §16 end-to-end (lines 14114–14381), §16.1 Overview through §16.10 Acceptance Criteria. Cross-walks into §1.3 Console Firewall (line 19437 "Intelligence Brief NEVER CARRIED"), §1.5 Stack table (Perplexity), §2.6.1 Stakeholder Cohorts (line 1540 forward reference "to power Org Intelligence cohort analytics (§16)"), §2.8 Single-Operator Mode, §4.3.1 Workspace `data_residency_region` overridable, §4.3.7 Intelligence Cache Entry (lines 3811–3825), §5.11 Feature Access Matrix (line 9490 M8 row), §6.7 Audit Log Scope, §6.8.1 Right of Access, §6.8.4 DSAR Cascade Fan-Out Classes (lines 10110–10116), §6.8.4.2 Cascade Residency Partitioning (lines 10178–10197), §6.8.5 Audit-Integrity Exemption, §16.2.3 Perplexity Degradation Contract, §21.4.1 Capability Registry row 16 `org_intelligence_briefing` (line 15522), §29 Notifications (Appendix C `intelligence_brief_available` line 24859), §32.5 Intelligence endpoint enumeration (lines 26354–26360), §34.1.1 cell **Organizational Intelligence** (line 28380; "Solo mirrors Free per BPS §5.3"), §34.8.5 Entitlement Matrix (lines 28922–28926; tri-split entitlement keys), §38 Mobile Feature Parity Matrix (lines 30881–30883), §39 Object Size Constraints (no §16 rows), §40.1 Export Formats (line 31290 Intelligence Briefing JSON/PDF), §40.2 Retention table (lines 31293–31332; no §16 rows), §44.6 Solo-Tier Surface Treatment (lines 31795–31948; §16 not enumerated in hide list), §48.5.8 M8 Org Intelligence Value Curve (lines 34774–34880; new entity OrgIntelligenceValueCurveCheckpoint at line 34798), Appendix C `intelligence_brief_available` (line 24859), Appendix G PostHog events `intelligence_viewed`/`intelligence_briefing_generated`/`intelligence_briefing_downloaded` (lines 41964–41966) + `org_intelligence_briefing_degraded` (Phase 13 fix F-7.1, line 14183), Appendix I `invalid_briefing_id` (line 43023), Appendix J (no `cache_type` enum registration found via grep), Appendix K Glossary (lines 46704–47323; no Intelligence Cache / Briefing Document / Discrepancy Analysis / Predictive Suggestion / Stakeholder Cohort / Org Intelligence entries), Appendix M.1 §16 surface rows (line 47729 Intelligence Cache Entry; lines 47840–47844 the five §16 surface rows under "Intelligence & Analytics (§16, §17)").

**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` v7.1.0 §16 (lines 14114–14381) verbatim.
- `Sourcera_Master_Spec.md` v7.1.0 §1.3 Console Firewall row line 19437 (Intelligence Brief NEVER CARRIED).
- `Sourcera_Master_Spec.md` v7.1.0 §2.6.1 Stakeholder Cohorts (lines 1526–1543) including the §16 forward reference at line 1540.
- `Sourcera_Master_Spec.md` v7.1.0 §2.8 Single-Operator Mode definition (lines 1601–1620 sample).
- `Sourcera_Master_Spec.md` v7.1.0 §4.3.7 Intelligence Cache Entry (lines 3811–3825) verbatim.
- `Sourcera_Master_Spec.md` v7.1.0 §6.7.x audit log catalog (lines 9891–10024) — no `intelligence_*` action types registered.
- `Sourcera_Master_Spec.md` v7.1.0 §6.8.4 DSAR cascade fan-out (lines 10106–10126) and §6.8.4.2 cascade residency partitioning (lines 10178–10197) verbatim.
- `Sourcera_Master_Spec.md` v7.1.0 §6.8.5 audit-integrity exemption (lines 10199–10234) — no §16 row class.
- `Sourcera_Master_Spec.md` v7.1.0 §16.2.3 Perplexity Degradation Contract (lines 14160–14186).
- `Sourcera_Master_Spec.md` v7.1.0 §21.4.1 row 16 `org_intelligence_briefing` (line 15522).
- `Sourcera_Master_Spec.md` v7.1.0 §32.5 Intelligence endpoints (lines 26354–26360) — three bare paths only.
- `Sourcera_Master_Spec.md` v7.1.0 §34.1.1 cell **Organizational Intelligence** (line 28380).
- `Sourcera_Master_Spec.md` v7.1.0 §34.8.5 entitlement matrix tri-split (lines 28922–28926).
- `Sourcera_Master_Spec.md` v7.1.0 §38 Mobile Feature Parity Matrix §16 rows (lines 30881–30883).
- `Sourcera_Master_Spec.md` v7.1.0 §39 Object Size Constraints (lines 31083–31272) — grep returns no `IntelligenceCacheEntry` / `BriefingDocument` / `DiscrepancyThreshold` row.
- `Sourcera_Master_Spec.md` v7.1.0 §40.1 line 31290 (Intelligence Briefing JSON/PDF export).
- `Sourcera_Master_Spec.md` v7.1.0 §40.2 retention table (lines 31293–31332) — grep returns zero `Intelligence` / `Briefing` rows.
- `Sourcera_Master_Spec.md` v7.1.0 §44.6 Solo-Tier Surface Treatment (lines 31795–31948) — §16 not enumerated in §44.6.1 hide list.
- `Sourcera_Master_Spec.md` v7.1.0 §48.5.8 M8 Org Intelligence Value Curve (lines 34774–34880).
- `Sourcera_Master_Spec.md` v7.1.0 Appendix C row line 24859 (`intelligence_brief_available`).
- `Sourcera_Master_Spec.md` v7.1.0 Appendix G lines 41964–41966 (3 PostHog events) + line 14183 (`org_intelligence_briefing_degraded`).
- `Sourcera_Master_Spec.md` v7.1.0 Appendix I line 43023 (`invalid_briefing_id`) — single error code.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix J grep for `cache_type` returns zero registered enum row.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix K Glossary (lines 46704–47323) — grep for the §16 multi-section terms returns zero entries.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix M.1 §16 cluster (lines 47729 + 47839–47844).
- `_audit/FEATURE_INVENTORY.md` rows F-279 through F-287 + F-089 + F-AE-010 + F-AE-017.
- `_audit/COVERAGE_MATRIX.md` rows F-279 through F-287 (lines 898–906) — all cells `⚠` pre-audit.
- `Audit_Prompts.md` → Prompt 4.7 (lines 1342–1354).
- `_audit/DEFECT_LEDGER.md` Phase 4.6 row format precedent (lines 1023–1052).

**Defect-ID convention:** `D-4.7-NNN`.

**Severity-rule application.** P0 reserved for billing-surface ambiguity allowing revenue leakage (rule d), firewall breach (rule a), or PII exposure (rule b). §16 carries `org_intelligence_briefing` AIOperation per §21.4.1 row 16 (`customer_billed`); ambiguity in the rate-card / metering surface would meet rule (d), but §16 cites §34.1.1 / §34.10 for billing and §44.6 for Solo surface treatment — billing-surface ambiguity is contained at the §34 / §44.6 boundary, not at §16. PII-exposure ambiguity exists in the DSAR cascade gap (D-4.7-010, D-4.7-011) — the cascade walker's failure to redact identity from briefing prose / cache `value` JSON could constitute a GDPR Art. 17 violation if a redacted scorer's name persists in a briefing rendered to an Org Admin after DSAR completion. This *would* meet P0 rule (c) — "violates a hard regulatory requirement (GDPR right-to-erasure)" — but only if the redaction failure persists to a customer-facing surface after §6.8 cascade declares completion. Per the §6.8.4 AC #1 cascade-plan requirement, an exhaustive plan listing every row class is mandated; if IntelligenceCacheEntry is absent from the plan, the plan is incomplete by §6.8.4 AC #1, but the runtime cascade walker would fail closed (no row touched) rather than redact-and-leak. The hostile reviewer interpretation: a junior engineer building the cascade walker against the v7.1.0 spec writes a §6.8.4 cascade that does not enumerate IntelligenceCacheEntry, the cache continues to surface pre-pseudonym scorer names, an Org Admin renders a Discrepancy Insight Card 7 days post-DSAR completion, the redacted user's name surfaces verbatim. This is a real GDPR Art. 17 exposure path. Severity escalated to P1 with a P0 escalation note pending Phase-9 (Observability & DSAR) re-audit; the runtime exposure surface depends on whether the briefing materializer reads pseudonymized User-row joins (Pattern B) or denormalized author strings cached at briefing-generation time (Pattern A failure). §16 silent on which path. P1 baseline; flagged for P0 escalation review.

P1 for any §16 feature unbuildable as written (missing entity, missing API contract, missing error code, missing webhook, missing acceptance criteria, missing plan-gating row in §5.11/§34.1/§39, conflicting numerical singletons, undefined cross-residency aggregation semantics on a multi-workspace-residency-eligible Org).

P2 for ambiguity that two engineers would resolve differently.

P3 for citation hygiene.

**Self-challenge revisions:** Logged inline at §6 below.

---

## 1. Sources Read End-to-End

See "Inputs read end-to-end" block above. Walk pattern: §16 verbatim → cross-document hop on every cross-section reference, every §32 endpoint, every Appendix C/G/I/J/K/M registration, every plan-tier reference, every §6.8 cascade class, every residency reference, every Solo-Mode reference. Counterfactual pass on (a) Org Owner regenerates briefing during Perplexity outage, (b) cache rows aggregate scoring data from a deprovisioned scorer, (c) briefing PDF exported pre-DSAR survives DSAR cascade, (d) two Org Admins click "Generate" simultaneously, (e) Org spans US and EU workspaces — cross-residency aggregation, (f) Org downgrades from Enterprise to Growth — Predictive Suggestions cache fate, (g) Workspace Owner who is also Org Admin — role precedence, (h) Solo-mode Workspace inside a Growth-tier Org — cohort analytics suppression, (i) `tco_value_weight` defaults render in cohort breakdown when cohort never authored, (j) Predictive Suggestion "Vendor C already contracted" — data source firewall.

---

## 2. Findings (pre-promotion to ledger)

### 2.1 IntelligenceCacheEntry §4.3.7 missing org_id + console + audit cols → D-4.7-001 (P1 data_model)

§4.3.7 (lines 3811–3825) Intelligence Cache Entry field table includes only `id`, `workspace_id`, `cache_type`, `entity_type`, `entity_id`, `key`, `value`, `expires_at`, `created_at`, `updated_at`. Missing per §4 entity convention: `org_id` (FK), `console` enum (the heading says "Console-Scoped, Buyer" but the body has no field), `created_by` (UUID FK → User), `updated_by` (UUID FK → User), `deleted_at` (Timestamp, nullable for soft delete). The §4 convention is uniform across §4.3.x entities (cf. §4.3.4 Requirement, §4.3.5 Response, §4.3.10 Evaluation Pulse Event); IntelligenceCacheEntry is the lone exception. Org-context capture is implicit through `workspace_id → workspace.org_id` join — and §16.7.2 requires "No cross-org data: Org A's intelligence never includes data from Org B" — but query-layer enforcement depends on every read-path joining through Workspace. Two production reads diverge: implementer A adds explicit `org_id` (mirrors §4.3.10 EvaluationPulseEvent and §4.3.18 UsageEvent which both carry `org_id`) for query-pattern parity and SOC-2 audit-trail directness; implementer B relies on workspace-join. The required composite indexes for §16.7.2 / §16.9.1 plan-gated reads are unspecified. **Severity: P1 data_model** — entity definition convention violated; reads-as-built diverge.

### 2.2 IntelligenceCacheEntry §4.3.7 missing scope/indexes/retention/DSAR/residency declarations → D-4.7-002 (P1 data_model)

§4.3.7 has no Scope Isolation declaration in the body, no Indexes declaration, no Retention declaration, no DSAR cascade pattern (Pattern A vs Pattern B per §6.8.4.1), no residency declaration. Compare to §4.3.10 Evaluation Pulse Event (which declares scope, indexes, retention, residency in body sub-blocks). The Authoring Intent block is absent. The §39 Object Size Constraints table has no row mirroring the inline `value: JSON | Max 100000 chars` cap — Authoring Convention #10 violated. **Severity: P1 data_model** — multiple sub-defects; entity is unbuildable to §4 convention without all six declarations.

### 2.3 BriefingDocument is an unregistered entity → D-4.7-003 (P1 data_model)

§16.2.2 Briefing Document is described as a "Synthesized summary of all 4 cache types, rendered as prose + charts" with a "30-day TTL" — clearly an entity. §1.3 console firewall row line 19437 references "Intelligence Brief (§16) | NEVER CARRIED" — implies an entity. §32.5 line 26360 declares `GET /v1/intelligence/briefings/{briefing_id}` — implies a persisted row with an addressable `briefing_id`. Appendix I line 43023 registers `invalid_briefing_id` (404) — implies an ID lookup path that can fail. But §4 has NO BriefingDocument / IntelligenceBriefing entity row. No field table, no scope isolation, no indexes, no retention, no DSAR cascade, no residency, no state-machine table for the `generated → archived` transition. §40.2 retention table omits the entity entirely (the §16.2.2 "30-day TTL → archived" lifecycle is single-sourced inline rather than in §40.2). §16.10 acceptance criteria do not number observable invariants for the entity. **Severity: P1 data_model** — entity referenced from at least four other sections (§1.3, §32.5, §40.1, Appendix I) but never registered; feature unbuildable as written.

### 2.4 §16 silent on stakeholder cohort analytics despite §2.6.1 forward reference → D-4.7-004 (P1 acceptance_criteria / consistency_drift)

§2.6.1 line 1540 declares: "Cohorts are engine-level constructs ... to power Org Intelligence cohort analytics (§16)." This is an explicit forward reference. §16 itself NEVER mentions stakeholder cohorts. The five canonical cohort enum strings (`exec_sponsor`, `evaluation_lead`, `functional_lead`, `technical_evaluator`, `sme_evaluator` per §2.6.1 line 1542) appear nowhere in §16.3 (Vendor Performance Briefing), §16.4 (Efficiency Metrics Briefing), §16.5 (Discrepancy Analysis Briefing), §16.6 (Predictive Suggestions), or §16.10 (Acceptance Criteria). §16.4.2 Team Velocity uses "Reviewer" (per-user) granularity, not cohort granularity. §16.3.3 Scoring Behavior surfaces "Evaluator consensus" as a per-user variance, not a per-cohort one. §16.6.2 Mismatch Flags reference "Reviewer A historically scores this vendor lower than org average" — per-user, not per-cohort. The forward reference is unmet; §16's cohort analytics surface is undefined. **Severity: P1 acceptance_criteria / consistency_drift** — a foundational cross-section contract is silently broken; junior engineers will not author cohort analytics because §16 doesn't ask for it; §2.6.1's promise to other consumers (Pulse, SLA, phase-gating) is broken by silence in §16.

### 2.5 §16 silent on Single-Operator Mode (`evaluation_owner_mode=solo`) suppression → D-4.7-005 (P1 plan_gating / consistency_drift)

§2.6.1 line 1542 declares: "In Single-Operator Mode (`evaluation_owner_mode=solo`, authored in §2.8), cohorts remain engine-level constructs ... but they do not surface as roles to the operator." If §16 surfaces cohort analytics (D-4.7-004 remediation), the suppression rule must apply: per-cohort breakdowns, "Reviewer A vs Reviewer B" displays, Discrepancy Analysis "Workspaces and scoring teams" rendering, and Predictive Suggestions "team preference patterns" must be suppressed for Workspaces with `evaluation_owner_mode=solo`. §16 has no such suppression. The §44.6 Solo-Tier Surface Treatment hide list (lines 31807–31822) does not enumerate any §16 surface — but §44.6 governs the Solo *plan tier* (`buyer_solo`), not the Solo *Workspace mode* (`evaluation_owner_mode=solo`). The two are independent: a Buyer Growth Org may have a Workspace in Solo Mode (per §4.3.1 line 3707-style overridable), and §16 must declare what the Briefing renders for that Workspace's contribution. §16 silent. Compare to §2.8.5 which authors Solo-Mode Pulse / SLA / Inbox suppression but does not extend to §16. **Severity: P1 plan_gating / consistency_drift** — Solo-Mode surface contract incomplete; cohort surfacing leaks into briefings for Workspaces whose operator never authored cohort assignments.

### 2.6 §16.9.1 plan-tier table omits Buyer Solo → D-4.7-006 (P1 plan_gating)

§16.9.1 table at line 14325 lists "Free / Starter / Growth / Scale / Enterprise" — Solo absent. §34.1.1 cell **Organizational Intelligence** (line 28380) has the seven-column structure (Free / Solo / Starter / Growth / Scale / Enterprise + Authored Extension annotation) and explicitly sets Solo to "—" with the annotation "Solo mirrors Free per BPS §5.3". §16.9.1 must enumerate Solo to satisfy the Phase 14.9 plan-tier registration discipline (every plan-gating reference enumerates all six tiers). Same defect class as D-4.6-004 (TCO §15.7.5) and the Phase 14.9.2 inline-tier-list backlog per `CLAUDE.md` §16. **Severity: P1 plan_gating** — Solo enumeration discipline violated; junior engineer reading §16.9.1 might infer Solo defaults to the next-best lower tier (Free) without explicit authority.

### 2.7 §16.6 Predictive Suggestions reference "team preference patterns" undefined under Solo Mode → D-4.7-007 (P2 acceptance_criteria)

§16.6.1 line 14266 declares: "Output: Predicted top candidates based on: ... Team preference patterns (org-wide)". For a Workspace with `evaluation_owner_mode=solo` and zero team members, "team preference patterns" is an empty set; for a single-user Org (Solo plan), the pattern is single-user noise, not team signal. §16.6.2 line 14275 says "Reviewer A historically scores this vendor lower than org average" — meaningless when N=1 reviewer. §16 silent on edge case. Predictive Suggestions is Enterprise-only per §16.9.1, so a Solo plan never reaches §16.6 — but Solo Mode within an Enterprise Org does, and the spec gives no guidance. **Severity: P2 acceptance_criteria** — undefined edge case; Solo-Mode rendering of Predictive Suggestions diverges across implementers.

### 2.8 §16 silent on cross-residency aggregation within an Org → D-4.7-008 (P1 residency)

§4.3.1 line 3707 declares Workspace `data_residency_region` "Inherits from Org; overridable" — Enterprise Orgs can place individual Workspaces in different regions. §16.7.2 prevents cross-org leakage but is silent on cross-residency boundaries within the same Org. When an Org Owner regenerates a Vendor Performance Briefing, the cache walk pulls scoring data from EU and US workspaces simultaneously — the resulting briefing prose contains aggregated data from both regions. Where does the briefing physically live? Where does the cache live (per workspace? per Org?)? Does the regenerate path partition per residency (one briefing per region per Org Admin)? §6.8.4.2 (lines 10178–10197) declares the DSAR cascade walker MUST NOT issue cross-region reads — but the §16 regenerate path is not the cascade walker. §16 has no residency partitioning contract. The `intelligence_briefing_downloaded` PostHog event registers no residency property. The `GET /v1/intelligence/briefings/{briefing_id}` endpoint has no residency-aware routing. Three implementer reads: (a) single global briefing aggregating cross-region data (GDPR Chapter V third-country-transfer risk); (b) per-residency briefing partitioning, two PDFs for an EU-and-US-spanning Org; (c) cross-residency aggregation blocked at compute-time (briefing fails to generate). No spec authority. **Severity: P1 residency** — feature unbuildable across the multi-residency dimension; potential GDPR Chapter V exposure path.

### 2.9 §16.2.3 Perplexity contract silent on residency-of-call → D-4.7-009 (P2 residency)

§1.5 Stack table (cited from §16.2.3 line 14162) declares Perplexity Search API as the named external research provider for Vendor Intelligence Briefing (Enterprise-only per §34.1.1 cell **AI Vendor Research**). Perplexity is a US-headquartered third-party. EU-residency Org calling Perplexity for Vendor Intelligence Briefing generates a third-country transfer (GDPR Chapter V). §16.2.3 (lines 14160–14186) authors the outage-degradation contract but is silent on residency-of-call: does an EU Org's Perplexity call route through an EU Perplexity edge (Perplexity does not currently publish a GDPR-compliant EU-resident edge), is Perplexity suppressed entirely on EU and the Briefing generated Anthropic-only with no external research, or is the EU call routed through US with explicit Standard Contractual Clauses + transfer impact assessment? Compare to §35.2.1 seller-domain enrichment which carries the same Perplexity dependency and is also silent. **Severity: P2 residency** — implementer reads diverge on lawful-basis-of-transfer; Legal sign-off required.

### 2.10 IntelligenceCacheEntry not in §6.8.4 cascade fan-out classes → D-4.7-010 (P1 dsar)

§6.8.4 cascade fan-out classes (lines 10110–10116) enumerate: Class 1 (Org-attributed audit rows: AuditEvent / OpsActionRecord / BillingLedgerEntry / AIOperation / ContestRecord / CommittedSpendContract / MarketplaceDiscoveryRevenueRecord / KBExportLifecycleAudit); Class 2 (User-content rows: Comment / InternalCommentPost / InternalCommentMention / KBEntry / RequirementVersion / ScoringSubmission / Q&A); Class 3 (Identity-bearing tombstones); Class 4 (Pure-PII rows); Class 5 (Marketplace and signal projections). IntelligenceCacheEntry is in NONE of these classes. The cache aggregates ScoringSubmission rows (Class 2) and renders them as prose narrative ("Reviewer A: 15.2/day"; "Reviewer B trending slower"; "Reviewer A historically scores this vendor lower than org average") — but the cascade walker has no instruction to re-rebuild the cache after Class 2 redaction completes. Result: a scorer's DSAR redacts the underlying ScoringSubmission row identity (Pattern B per §6.8.4.1) but the §16 cache continues to carry a `value` JSON column whose internal payload embeds the pre-pseudonymization narrative string. The §6.8.4.1 Pattern B claim ("Pattern B's correctness depends on the User row being pseudonymized exactly once per DSAR request") fails for any cache entry whose `value` denormalizes the User name into a JSON-string field rather than reading the User row at render time. The §6.8.4 AC #1 cascade plan would not enumerate IntelligenceCacheEntry, so the cascade is incomplete. **Severity: P1 dsar** — DSAR cascade gap; potential GDPR Art. 17 right-to-erasure failure path. Hostile-reviewer interpretation: P0 escalation candidate per the Severity-rule application discussion above (rule c — "violates a hard regulatory requirement"); P1 baseline pending Phase 9 re-audit on the cache materialization-time pseudonym contract.

### 2.11 BriefingDocument and exported PDF/JSON carry verbatim reviewer names; no DSAR sweep → D-4.7-011 (P1 dsar)

§16.2.2 Briefing Document is rendered as "prose + charts" with embedded reviewer names verbatim per §16.4.2 ("Reviewer B trending slower") and §16.5.3 ("Reviewers: Who scored in each workspace"). §16.8.3 declares export as PDF/JSON. The export persists outside Sourcera once downloaded. No DSAR sweep declared for in-flight briefings (active 30-day TTL window) or already-exported briefings. A scorer DSARs after Org Owner exports the briefing — the export retains pre-pseudonymization identity. §16 silent on whether (a) active in-flight briefings are forcibly archived on DSAR with a regeneration prompt to the Org Admin; (b) the cascade walker invalidates the briefing's `value` JSON to force recompute; (c) the cascade walker re-renders the briefing prose with pseudonymized identities; (d) the cascade walker emits a notification to Org Admins with active briefings citing the redacted scorer's prior identity. None of these paths are authored. The exported-PDF surface is inherently unrecallable — the spec must declare whether Org Admin is notified of the DSAR-induced staleness so that the exported artifact can be manually destroyed per the Org's data-handling policy. **Severity: P1 dsar** — DSAR cascade compatibility gap; legal-defense exposure on right-to-erasure GDPR Art. 17 §2 ("controller shall take reasonable steps ... to inform controllers which are processing the personal data").

### 2.12 §40.2 retention table missing Intelligence cache + Briefing Document rows → D-4.7-012 (P1 retention)

§40.2 retention table (lines 31293–31332) has no row for IntelligenceCacheEntry or BriefingDocument. Per the Authoring Convention #9 (Retention & Privacy) and §40.2's role as the single authoritative retention home, both entities must be rowed. §16.2.1 Cache Types declares cache "persists indefinitely" and §16.2.2 Briefing Document declares "30 days, then archived (read-only)" — both are single-sourced inline rather than in §40.2. Org-deletion cascade behavior unspecified (does Org delete cascade-purge IntelligenceCacheEntry and BriefingDocument rows? §40.2 governs Workspace soft-delete cascade but §16.2.1 cache "persists indefinitely" — if Org deletes, do all Workspace caches purge with the Workspace, or do they persist as orphan rows to be purged on the 90-day post-cancellation rule?). Workspace-archive behavior unspecified (does archiving a Workspace freeze its cache contributions, or do future briefings continue to pull historical scoring data?). **Severity: P1 retention** — feature unbuildable to §40.2 authoritative-source rule; cascade behavior on Workspace / Org delete unspecified.

### 2.13 §32.5 Intelligence endpoints lack §32-style detail → D-4.7-013 (P1 api)

§32.5 lines 26354–26360 enumerate three Intelligence endpoints with method + path only:
- `GET /v1/intelligence/cache`
- `GET /v1/intelligence/briefings`
- `GET /v1/intelligence/briefings/{briefing_id}`

No auth scope declared (recommended `read:intelligence` per §5.11; not registered in Appendix J `oauth_scope`). No rate-limit class. No cursor pagination defaults (per §32 conventions: default 50, max 250). No request schema. No response schema. No idempotency semantics. No concrete request/response examples. Error codes incomplete — Appendix I line 43023 registers only `invalid_briefing_id` (404); not registered: `intelligence_access_forbidden` (403; per §16.7.1 Workspace Owner exclusion), `intelligence_not_available_on_plan` (402; per §16.9.1 plan-gating), `intelligence_cache_not_yet_populated` (404; pre-Phase-10 Workspace), `intelligence_cross_residency_blocked` (422; per D-4.7-008 remediation if cross-region blocked). The regenerate path implied by §16.2.2 ("User can regenerate briefing at any time") has no `POST /v1/intelligence/briefings` endpoint declared. The export path implied by §16.8.3 ("PDF / JSON export") has no `GET /v1/intelligence/briefings/{briefing_id}/export` endpoint declared. **Severity: P1 api** — feature unbuildable to §32 conventions; six convention dimensions absent; regenerate and export paths un-endpointed.

### 2.14 `cache_type` enum not registered in Appendix J → D-4.7-014 (P1 enum)

§4.3.7 line 3817 declares `cache_type` as Enum with values `vendor_performance | efficiency_metrics | discrepancy_analysis | predictive_suggestions`. Inline comment "(see Gap 3.4)" is a v6.0.0 vestige — Gap 3.4 does not exist in v7.1.0 Appendix B (Keyboard Shortcut Reference) or any other v7.1.0 appendix. Appendix J grep returns zero `cache_type` enum row. Per Authoring Convention #3 (Enum Registration — every enum value registered in Appendix J), the four values must be registered. Same defect class as D-4.6-012 / D-4.6-013 (TCO enum gaps). **Severity: P1 enum** — convention violated; downstream consumers (validators, type generators, OpenAPI emitters) cannot bind to a registry-absent enum.

### 2.15 §16.10 ACs are unchecked-checkbox style, not §13.10/§14.9/§17.8/§20.7-style numbered observable → D-4.7-015 (P2 acceptance_criteria)

§16.10 acceptance criteria (lines 14333–14381) are bullet checkboxes (`- [ ] Detects score variance ≥0.3 on ≥3 overlapping requirements ...`) rather than numbered, observable, measurable, scope-bound criteria per the §13.10 / §14.9 / §17.8 / §20.7 baseline style. No observable inputs (the scorer event triggering the briefing recomputation is not named), no measurable thresholds beyond the inline ≥0.3 / ≥3, no scope qualifiers (Org / Workspace / Cohort / per-residency partition), no test ID prefix, no failure-mode coverage (Perplexity outage handling per §16.2.3 is not asserted in §16.10), no Solo-Mode suppression assertion (per D-4.7-005), no DSAR cascade assertion (per D-4.7-010). Same defect class as D-4.6-022 (TCO §15.7). **Severity: P2 acceptance_criteria** — convention #2 violated; QA cannot author deterministic test fixtures.

### 2.16 §16.10.7 Plan Limits names "Business" tier (does not exist) → D-4.7-016 (P3 plan_gating)

§16.10.7 (lines 14377–14381) AC bullets:
```
- [ ] Free: Intelligence not available
- [ ] Business: Vendor History + Efficiency Metrics only
- [ ] Enterprise: Full suite (all 4 cache types)
```

Three defects in three lines: (a) "Business" is not a current plan tier; the canonical Buyer enum per §34.1.3 is `buyer_free` / `buyer_solo` / `business_starter` / `business_growth` / `business_scale` / `buyer_enterprise`; (b) "Business: Vendor History + Efficiency Metrics" contradicts §16.9.1's tri-split mapping (Starter = Vendor History only; Growth/Scale = Vendor History + Efficiency Metrics + Discrepancy Analysis; Enterprise = all 4) — "Business" appears to compress Starter+Growth+Scale into one row; (c) "Enterprise: Full suite (all 4 cache types)" does not enumerate Solo and re-states the §16.9.1 mapping inline rather than citing. Same defect class as D-4.6-004 (TCO §15.7.5) — symptomatic of the v6.0.0 → v7.1.0 plan-tier roll incompletely propagated. **Severity: P3 plan_gating** — citation hygiene + nomenclature lock; not buildability-blocking but spec-hygiene-degrading.

### 2.17 §6.7 audit log catalog missing §16 action types → D-4.7-017 (P2 audit_event_action_type)

§6.7 audit log scope (lines 9891–10024) does not enumerate any §16 audit-event action type. §16.2.2 declares "User can regenerate briefing at any time" — implies an audit event. §16.5.3 declares "Mark Resolved" and "Escalate to Org Admin" actions on Discrepancy Insight Cards — both imply audit events with state transitions on the Card entity (which itself is not a registered §4 entity — sub-defect of D-4.7-003). §16.8.1 / §16.8.3 imply briefing-generated and briefing-exported events. Appendix J `audit_event_action_type` enum grep returns zero `intelligence_*` / `briefing_*` / `discrepancy_*` rows. Compare to §6.7.6 which authored the seven authentication-domain audit events as a remediation — §16 needs the same treatment. Expected enum values: `intelligence_briefing_generated`, `intelligence_briefing_regenerated`, `intelligence_briefing_archived`, `intelligence_briefing_exported`, `discrepancy_card_resolved`, `discrepancy_card_escalated_to_org_admin`, `predictive_suggestion_dismissed`, `predictive_suggestion_accepted`, `intelligence_cache_invalidated`. **Severity: P2 audit_event_action_type** — convention #3 violated; SOC-2 audit-trail completeness gap.

### 2.18 §16.6.3 Predictive Suggestion "Vendor C is already contracted" — data source unspecified → D-4.7-018 (P2 firewall_leakage)

§16.6.3 line 14280 declares: "Vendor C is already contracted. Suggest excluding from this evaluation to avoid bias." The data source for "already contracted" is undefined. If sourced cross-Org (e.g., via §27 Marketplace or any platform-shared signal), that is a §1.3 console firewall breach. If sourced from §27 marketplace contract metadata (which is buyer-side procurement-internal, no leak), §16 must say so. If sourced from a §4.3.x BuyerContract entity that does not exist, the feature is unbuildable. Adversarial reading: a junior engineer building Predictive Suggestions queries the SellerOrg.bid_history projection (which is seller-side; firewall breach) to detect "already contracted" status. The spec must declare the authoritative source. Compare to §16.6.2 "Market signal: Vendor recently expanded in your region" — same defect class (data source unspecified; potential cross-Org PII inference). **Severity: P2 firewall_leakage** — implementer reads diverge across the firewall boundary.

### 2.19 §16.8.2 Briefing state machine prose only; no Appendix J enum → D-4.7-019 (P2 state_machine)

§16.8.2 declares Briefing Document `generated → archived` transition as prose ("After 30 days: Briefing marked archived (read-only, gray background)"; "User action: 'Generate New Briefing' button appears"). Per Authoring Convention #5, every state-transition is documented as a `From | To | Trigger | Conditions | Notes` table — never as prose. State enum strings (`generated`, `archived`, plus `pending` and `expired` per Appendix M.1 line 47844) are not registered in Appendix J `briefing_lifecycle_state` (or any other enum). Appendix L state-machine catalog has no `briefing_lifecycle` table. **Severity: P2 state_machine** — convention #5 violated; multi-state lifecycle un-tabulated.

### 2.20 Appendix M row 47729 says Free has Vendor History — contradicts §34.1.1 cell → D-4.7-020 (P2 consistency_drift)

Appendix M.1 row line 47729: `| Intelligence Cache Entry | §4.3.7 | "Vendor briefing" — pre-warmed insight tile | F, St (Vendor History only on St; Full on Gr+) | Cache mechanics never surfaced. |` — the `Hidden from tier(s)` cell lists "F, St" implying Free has the surface (else why mention F at all in a "visible to" expression). But §34.1.1 cell **Organizational Intelligence** at line 28380 explicitly sets Free to "—" with the row note "AE (preserved from v6.0.0; Solo mirrors Free per BPS §5.3 — Org-Intelligence is multi-eval mid-market scope, not the personal-card surface)" — Free has NO access. Same gap on Solo (Solo absent from the Appendix M row entirely; §34.1.1 sets Solo to "—" matching Free). The Appendix M cell semantics are inconsistent with §34.1.1's tri-split (Starter "Vendor History only" / Growth-Scale "Full" / Enterprise "Full + Suggestions"). Compare to Appendix M row 47840 "Vendor Performance Briefing" which correctly says "F (none), St (Vendor History only), Gr+ (Full) per §34.1.1" — the §4.3.7 row uses inconsistent shorthand. **Severity: P2 consistency_drift** — Appendix M row label diverges from §34.1.1; junior engineer reading the row will mis-gate Free.

### 2.21 Concurrency on briefing regeneration unspecified → D-4.7-021 (P2 edge_case)

Two Org Admins click "Generate New Briefing" simultaneously (within the §16.8.1 "<5 seconds" latency window). §16 silent on idempotency. Dual writes to BriefingDocument with same `(workspace_id, briefing_type)` key — race condition. Compare to §13.6 collaborative scoring optimistic-lock pattern, §15.5.2 TCO recalculation (also missing concurrency rule, per D-4.6-021), §22.X Bid Workspace concurrency rules. §16 declares no `version` field on the entity (D-4.7-003 sub-defect), no idempotency-key on the implied POST endpoint (D-4.7-013 sub-defect), no 409 error code in Appendix I, no UI conflict-resolution affordance. **Severity: P2 edge_case** — undefined concurrency behavior; production duplicate-briefing risk under any multi-admin Org.

### 2.22 Downgrade Enterprise → Growth: Predictive Suggestions cache fate unspecified → D-4.7-022 (P2 plan_gating)

Org downgrades from Enterprise (Predictive Suggestions included) → Growth (no Predictive Suggestions). Per §16.2.1 Predictive Suggestions cache "Updated weekly via batch job" with no other retention rule; cache "persists indefinitely" per §16.2.1 preamble. After downgrade, the Growth-tier Org no longer has access — what happens to the cache? Three reads: (a) cache purged on plan-change boundary; (b) cache retained but `predictive_suggestions` rows hidden from query results (still computable by re-upgrade); (c) cache retained and surfaced on re-upgrade with no re-computation. §16 silent. Compare to §34.6 / §34.19 downgrade-data-preservation contracts — neither cites §16. Briefing Document downgrade behavior also unspecified — does an in-flight Predictive-Suggestions-bearing Briefing become read-only-but-blurred, or fully invisible? **Severity: P2 plan_gating** — downgrade-path edge case; data-retention vs entitlement-revocation contract undefined.

### 2.23 §16.5.1 ≥0.3 / ≥3 thresholds inline; no §39 row → D-4.7-023 (P3 numerical_singleton)

§16.5.1 Discrepancy Detection threshold "Score difference ≥0.3 (30 percentage points) on ≥3 overlapping requirements" is a numerical singleton with no §39 row. §16.10.4 AC re-states the thresholds inline. Per Authoring Convention #10, thresholds should live in §39 with §16 citing the table. **Severity: P3 numerical_singleton** — citation hygiene; not feature-blocking but single-source rule violated.

---

## 3. Counterfactual Pass

For every §16 capability audited, three realistic failure modes were enumerated against §16's declared handling:

1. **Cache aggregates a deprovisioned scorer's identity.** Spec handling: silent (D-4.7-010). Failure mode: GDPR Art. 17 violation on right-to-erasure if cache surfaces the pre-pseudonym name post-DSAR.
2. **Briefing exported pre-DSAR; subject DSARs.** Spec handling: silent (D-4.7-011). Failure mode: exported PDF retains identity; spec does not require Org Admin notification to manually destroy.
3. **Two Org Admins concurrently regenerate briefing.** Spec handling: silent (D-4.7-021). Failure mode: duplicate row with race-condition `value` divergence.
4. **Org spans US and EU workspaces; Org Owner regenerates briefing.** Spec handling: silent (D-4.7-008). Failure mode: cross-residency aggregation in a single PDF, GDPR Chapter V third-country transfer risk.
5. **Perplexity degraded mid-briefing-generation.** Spec handling: §16.2.3 covers (added Phase 13 fix F-7.1). Failure mode addressed.
6. **Org downgrades Enterprise → Growth mid-cache-cycle.** Spec handling: silent (D-4.7-022). Failure mode: Predictive Suggestions cache rendered to no-longer-entitled Org.
7. **Solo Mode workspace inside Growth-tier Org.** Spec handling: silent (D-4.7-005, D-4.7-007). Failure mode: cohort surfacing leaks into briefings for an operator who never authored cohort assignments.
8. **Workspace Owner is also Org Admin.** Spec handling: §16.7.1 "Org Admin: full access" / "Workspace Owner: no access" — precedence implicit; not explicit. Failure mode: spec does not enumerate role precedence rule. (Filed under D-4.7-015 as a §16.10 AC gap rather than as a separate defect — single-AC-fix resolution.)
9. **Predictive Suggestion "already contracted" sourced cross-Org.** Spec handling: silent (D-4.7-018). Failure mode: §1.3 firewall breach.
10. **Briefing references a vendor that's been hard-deleted from the marketplace.** Spec handling: silent. Failure mode: dangling FK in the briefing prose. (Sub-defect of D-4.7-003 entity-registration gap.)

All ten were either filed as defects or absorbed into existing defects per the AC remediation pattern. No silent absorption.

---

## 4. Cross-Section Linkage Confirmation

| §16 surface | Linked §s checked | Confirmed | Defect filed |
|---|---|---|---|
| §16.2.1 Cache types | §4.3.7 (entity), §40.2 (retention), §39 (object size) | partial | D-4.7-001 / 002 / 012 |
| §16.2.2 Briefing Document | §4 (entity), §40.2 (retention), §1.3 (firewall), §32.5 (API), Appendix I (errors), Appendix L (state-machine), Appendix J (state enum) | none — entity unregistered | D-4.7-003 / 012 / 019 |
| §16.2.3 Perplexity fallback | §1.5 (Stack), §35.2.1 (seller enrichment), §44 (perf budget) | confirmed; residency-of-call gap | D-4.7-009 |
| §16.3 / §16.4 / §16.5 / §16.6 surfaces | §2.6.1 (cohorts), §44.6 (Solo), §38 (mobile), §32.5 (API), Appendix M.1 | partial | D-4.7-004 / 005 / 007 / 013 / 020 |
| §16.7 Access Control | §5.11 Feature Access Matrix, §6.5 Guest Users | confirmed; precedence rule implicit | absorbed into D-4.7-015 |
| §16.8 Briefing Lifecycle | Appendix L (state-machine), Appendix J (state enum) | not authored as table | D-4.7-019 |
| §16.9 Plan Limits | §34.1.1 cell, §34.8.5 entitlement, §39 | partial; Solo absent | D-4.7-006 / 016 |
| §16.10 Acceptance Criteria | §13.10 / §14.9 / §17.8 / §20.7 baseline | not numbered observable | D-4.7-015 |
| §1.3 console firewall | §16 cache reads, §16.6 Predictive Suggestion data sources | partial (firewall declared NEVER CARRIED at §1.3 line 19437; §16.6 data sources unspecified) | D-4.7-018 |
| §6.8.4 DSAR cascade | §16 entities (cache + briefing) | none enumerated | D-4.7-010 / 011 |
| §6.8.4.2 cascade residency partitioning | §16 regenerate / export paths | not extended to §16 | D-4.7-008 |

---

## 5. Self-Challenge Pass — Hostile-Reviewer Re-Read

Re-read each of the 23 findings as a hostile staff engineer. Findings revised in place:

- **D-4.7-001 / 002.** Original draft folded indexes / retention / DSAR / residency into D-4.7-001. Hostile-review: defect granularity is too coarse — indexes is a §4 query-pattern issue, retention is a §40.2 cross-section issue, DSAR is a §6.8 cross-section issue. Split into D-4.7-001 (entity field set) and D-4.7-002 (entity declarations: scope / indexes / retention / DSAR / residency). Justified per Phase 4.6 precedent (D-4.6-002 / D-4.6-003 split).

- **D-4.7-005 vs D-4.7-006.** Hostile-review: are these the same defect? No: D-4.7-005 is the absence of any Solo-Mode (Workspace mode `evaluation_owner_mode=solo`) suppression contract; D-4.7-006 is the absence of Buyer Solo (plan tier `buyer_solo`) enumeration in the §16.9.1 plan-tier table. Two independent defects; both retained.

- **D-4.7-008 P0/P1 escalation.** Hostile-review: cross-residency aggregation in a customer-visible PDF is a GDPR Chapter V third-country transfer — meets P0 rule (c). But spec silence ≠ runtime exposure: an EU-only single-Workspace Org never reaches the cross-residency path. P1 defensible; P0 escalation gated on the multi-residency-Org population being non-trivial (Enterprise customers per §47 documented use case → non-trivial population). Held at P1 with P0 escalation note pending Phase-9 re-audit.

- **D-4.7-010 P0 escalation.** Hostile-review: same logic — P0 if the cache materialization path denormalizes scorer identity at write-time (Pattern A failure); P1 if the cache reads pseudonymized User-row joins at render time (Pattern B compliance). §16 silent on which path, so the worst-reasonable interpretation governs. P1 baseline with P0 escalation flag. Phase-9 (Observability & DSAR) re-audit required to resolve.

- **D-4.7-011.** Hostile-review: exported PDF is unrecallable — is the spec required to address this? Yes — GDPR Art. 17 §2 requires the controller to "take reasonable steps ... to inform controllers which are processing the personal data". §16 must declare the Org-Admin-notification path even if the destruction itself is the customer's responsibility. Defect retained as P1.

- **D-4.7-014 enum gap.** Hostile-review: is this just a documentation gap (P3) or a buildability defect (P1)? §4.3.7 inline declares the four enum values, so a sole engineer building only against §4.3.7 has the values — the gap is at Appendix J registration which is what type-generators / OpenAPI emitters / validators read. Same materiality as D-4.6-012 / D-4.6-013 (filed as P1 in Phase 4.6). Retained as P1 for class consistency.

- **D-4.7-018.** Hostile-review: is this firewall_leakage (P2) or just an undefined-edge-case (P2 acceptance_criteria)? The classification depends on what an implementer actually builds. The hostile reading is firewall_leakage because the absence of an explicit data-source declaration creates the firewall risk. Retained as P2 firewall_leakage.

- **D-4.7-019 state machine.** Hostile-review: is this a state-machine defect or a glossary defect (state enum strings missing from Appendix J)? Both — the state-machine table absence is the convention violation; the enum registration absence is a sub-defect. Filed under state_machine per the primary convention violated.

- **D-4.7-021 / D-4.7-022.** Hostile-review: are these P1 (feature unbuildable) or P2 (ambiguous edge case)? Concurrency and downgrade are both edge cases that a thoughtful engineer can resolve — but the resolutions diverge across implementers. P2 baseline per the severity tiebreaker rule.

- **Findings considered and dropped:**
  - "§16 has no `OrgIntelligenceValueCurveCheckpoint` cross-reference" — the entity is registered at §48.5.8 line 34798 with explicit §16 cross-reference at line 34786 ("Org Intelligence dashboard (§16)"); §16 silence is acceptable because §48.5.8 binds the surface. Not a defect.
  - "§16 silent on `time_saved_credit` integration" — §4.3.19 Time-Saved Credit is org-scoped and surfaced via §20 Pulse / §28 dashboard, not §16. Cross-document grep confirms no §16 dependency. Not a defect.
  - "§16 missing `briefing_archived` PostHog event" — covered as part of D-4.7-017 audit-action enumeration (briefing_archived audit action implies the corresponding PostHog mirror); collapsed.

- **Findings escalated:**
  - D-4.7-005 originally drafted as P2 (Solo-Mode silence is "edge case"). Hostile-review: §2.6.1 line 1542 makes Solo-Mode suppression an explicit cross-section contract; §16's failure to declare it is a buildability defect, not an ambiguity. Escalated to P1.
  - D-4.7-008 originally drafted as P2 (residency silence is "ambiguity"). Hostile-review: cross-residency aggregation is a GDPR boundary — three implementer reads diverge across the lawful-basis-of-transfer threshold. P1 minimum. Escalated.

---

## 6. Promotion Manifest

The 23 findings above promote into `DEFECT_LEDGER.md` as `D-4.7-001` through `D-4.7-023` per the promotion manifest. Severity distribution: 0 P0 / 14 P1 / 7 P2 / 2 P3. (Two P0 escalation candidates flagged — D-4.7-008 / D-4.7-010 — deferred to Phase-9 Observability & DSAR re-audit.)

---

## 7. Coverage Matrix Manifest

`COVERAGE_MATRIX.md` rows F-279 through F-287 + F-089 (Intelligence Cache Entry) tighten as follows from the Phase 4.7 walk:

- F-089 Intelligence Cache Entry (§4.3.7): `data_model` already ❌ (Phase 1 D-1.2 cluster); confirm `dsar` ⚠ → ❌ (D-4.7-010); `retention` already ❌; `residency` ⚠ → ❌ (D-4.7-008); `console_firewall` already ❌; `surface_engine_mapping` ⚠ → ❌ (D-4.7-020).
- F-279 Organizational Intelligence (§16.1): `acceptance_criteria` ⚠ → ❌ (D-4.7-015); `dsar` ⚠ → ❌ (D-4.7-010 / 011); `residency` ⚠ → ❌ (D-4.7-008); `console_firewall` ⚠ → ❌ (D-4.7-018); `glossary` ⚠ → ❌ (Appendix K silent on Org Intelligence terms).
- F-280 Organizational Intelligence Data Sources (§16.2): `data_model` ⚠ → ❌ (D-4.7-003 BriefingDocument unregistered); `enums` ⚠ → ❌ (D-4.7-014 cache_type unregistered); `retention` ⚠ → ❌ (D-4.7-012); `state_machine` ⚠ → ❌ (D-4.7-019); `acceptance_criteria` ⚠ → ❌.
- F-281 Vendor Performance Briefing (§16.3): `acceptance_criteria` ⚠ → ❌ (D-4.7-015); `api` ⚠ → ❌ (D-4.7-013); `notifications` ⚠ → ⚠ (Appendix C row exists but webhook contract missing — leave warn); `error_codes` ⚠ → ❌ (D-4.7-013 enumerates 5 missing); `dsar` ⚠ → ❌; `residency` ⚠ → ❌.
- F-282 Efficiency Metrics Briefing (§16.4): same cluster as F-281 minus the Discrepancy / Predictive Suggestion-specific cells; cohort gap (D-4.7-004) hits `acceptance_criteria` ⚠ → ❌.
- F-283 Discrepancy Analysis Briefing (§16.5): `state_machine` ⚠ → ❌ (D-4.7-019 covers Briefing Document; Discrepancy Card resolution path also un-tabulated); `acceptance_criteria` ⚠ → ❌; `dsar` ⚠ → ❌ (Card author identity carries scorer name).
- F-284 Predictive Suggestions Briefing (§16.6): `console_firewall` ⚠ → ❌ (D-4.7-018); `acceptance_criteria` ⚠ → ❌ (D-4.7-007 Solo edge case + D-4.7-015 AC style); `plan_gating` ⚠ → ❌ (D-4.7-022 downgrade fate).
- F-285 Organizational Intelligence Access Control (§16.7): `acceptance_criteria` ⚠ → ❌ (role-precedence rule implicit; absorbed into D-4.7-015); `rbac` ⚠ → ⚠ (§16.7.1 declared but precedence absent).
- F-286 Briefing Lifecycle (§16.8): `state_machine` ⚠ → ❌ (D-4.7-019); `enums` ⚠ → ❌ (state strings unregistered).
- F-287 Organizational Intelligence Plan Limits (§16.9): `plan_gating` ✅ → ⚠ (D-4.7-006 Solo absent + D-4.7-016 "Business" tier; the §16.9.1 mapping table itself is plan-correct relative to §34.1.1 Starter/Growth/Scale/Enterprise but drops Solo); `acceptance_criteria` ⚠ → ❌ (D-4.7-016).

The coverage matrix is updated in a single grouped edit appended after the existing Phase 4.6 column-set update.

---

## 8. AE Ledger Touch Points

- **AE-12.4-03 (F-AE-010)** — `pending` per `_audit/FEATURE_INVENTORY.md` line 928. Defines "Full intelligence as three of four briefing surfaces; Predictive Suggestions Enterprise-only." Authored Extension is the basis for §16.9.1's tri-split. D-4.7-006 (Solo enumeration) and D-4.7-016 (Business tier removal) both depend on the AE remaining ratified through v7.1.1 stamp; flag for joint resolution at the AE-12.4-03 ratification gate.
- **AE-13-01 (F-AE-017)** — `pending` per `_audit/FEATURE_INVENTORY.md` line 935. Perplexity Degradation Contract per §16.2.3. D-4.7-009 (residency-of-call) extends the AE scope; recommend folding the residency-of-call clause into the AE before v7.1.1 ratification.

---

## 9. Forward-Reference Pointers

- **Phase 8 (§32 / §31 / Appendix C / Appendix I extensions for §16 surface)** — D-4.7-013 (5 missing endpoint contracts + 5 missing error codes + 1 missing webhook contract); D-4.7-017 (9 missing audit-event action types).
- **Phase 9 (Observability & DSAR re-audit)** — D-4.7-008 / 010 / 011 P0-escalation candidates; resolution requires confirming whether cache materialization is Pattern A (denormalized) or Pattern B (FK-resolved) at write time.
- **Phase 12 (Numerical Singleton mirror rows)** — D-4.7-023 (≥0.3 / ≥3 thresholds → §39 row).
- **Phase 14.13 (Appendix K Glossary cluster)** — Briefing Document, Intelligence Cache, Discrepancy Analysis, Predictive Suggestion, Stakeholder Cohort, Org Intelligence — bundle with Phase 4.6 D-4.6-024 glossary cluster.
- **Phase 14.9.2 inline-tier-list audit (CLAUDE.md §16 backlog)** — D-4.7-006 / D-4.7-016 fold into the 27-location inline-tier-list backlog; treat as one AC-row across the §15 / §16 / §17+ inline-tier-list sweep.
- **v7.1.1 stamp gate** — D-4.7-001 through D-4.7-023 collectively are §16's contribution to the v7.1.1 release-gate decision; the §16 surface is ❌ on at least 6 convention dimensions across the F-279…F-287 / F-089 row cluster. Phase 4 V-prompt advance gate (compounded with §13 / §14 / §15 P1 backlogs from Phase 4.4 / 4.5 / 4.6).
