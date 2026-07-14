# Phase Residency — §1.6 + §6.8 + §40 + §42 Walk-Through Findings

**Audit prompt.** "Walk §1.6 (Deployment Regions) + §6.8 + §40 + §42 with focus on residency. Checks: (1) US/EU/custom regions named; (2) per-org residency lock + no cross-region copy without explicit consent; (3) cross-region failover during regional outage; (4) backups respect residency; (5) audit logs respect residency; (6) AIOperation residency-locked entity (Sourcera US LLC vs. Sourcera EU GmbH) consistent with billing."

**Defect-id mnemonic.** `D-RES-NNN`. Sequential within this prompt.

**Run date.** 2026-05-08.

**Master Spec baseline.** v7.1.0 (2026-04-28). Primary surfaces walked:
- §1.6 Deployment Regions (lines 1408–1417).
- §6.7 Audit Logging (lines 10033–10130) and §6.8 Data Privacy & GDPR (lines 10167–10516+).
- §40 Data Export & Import (lines 31889–31988).
- §42 Observability, Reliability & Disaster Recovery (lines 32053–32254).
- §47.4 Data Residency & Compliance Expansion (lines 32809–32822).
- §4.1.1 Organization residency fields (lines 3612–3613).
- §4.8.1 / §4.8.3 / §4.8.12 legal-entity binding (lines 8186–8255, 8384, 8972).
- Appendix J `Data Residency Region` (line 45049) / `Legal Entity` (line 45257) / `residency_region_kind` (line 46818) / `legal_entity_kind` (line 46826).

**Companion sources walked.**
- `Sourcera_Master_Spec.md` cross-references to "§40.4" as residency authority (50+ inline citations grep-confirmed).
- Existing residency-class defects D-1.5-012 (§4.6.1.1 audit-event residency silence — partial coverage), D-3.5-006 (DSAR cascade residency partition — closed), D-5.4-024 (§23 zero §40.4 residency references), D-5.5-024 (§24 zero §40.4 residency references).

---

## Walk-Through

### Check 1 — US / EU / custom regions named

**§1.6 (lines 1408–1417).** Two-row region table: `us` (AWS us-east-1) and `eu` (EU West Ireland). No mention of `apac`, no mention of `custom`, no mention of `custom_sovereign_residency_label`. The canonical text is one paragraph plus a two-row table.

**Production data model and Appendix J.** §4.1.1 Organization line 3612 declares `data_residency_region` enum as `us | eu | apac | custom`. Appendix J "Data Residency Region" registers the same four values at line 45049. `residency_region_kind` (envelope-facing) at line 46818 confirms `us, eu, apac, custom`.

**Drift.** §1.6 omits two of four canonical residency values. Downstream sections (§4.4.10, §4.4.15, §4.4.16, §27.10, §51.7, etc.) all reference §1.6 / §40.4 expecting full enumeration. **Filed as D-RES-003.**

**§47.4 (lines 32809–32822).** "Data Residency & Compliance Expansion" — three "Current" bullets and four "Phase 2" bullets. APAC ("Data sovereignty for APAC (Singapore data center)") is in the Phase 2 column, but `apac` is in the production data model and registered in Appendix J. **Filed as D-RES-006.**

**§1.6 cross-reference.** §4.1.1 line 3612 cites "Authoritative enum at Appendix J line 44745" — line 44745 in Appendix J is `eval_starter_state`, not residency. The actual residency enum is at line 45049 ("Data Residency Region") and line 46818 (`residency_region_kind`). Broken authoritative-source citation in the canonical Org entity field. **Filed as D-RES-008.**

### Check 2 — Per-org residency lock; no cross-region copy without explicit consent

**§1.6 paragraph (line 1417).** Verbatim: "Default: `us`. Org Owners can change region during initial setup or via Enterprise support request. Region change after workspace creation requires data migration and is not available during production evaluations."

This is the entire residency-change contract in §1.6. It is silent on:
- Who has authority to consent (Org Owner only? Enterprise admin? DPO sign-off required for EU→US migration?).
- What "data migration" entails procedurally (cutover plan, dual-write window, rollback path).
- What constitutes a "production evaluation" — no anchor to `Bid Workspace.status`, `Workspace.phase ∈ {7..13}`, or any enforceable predicate. CI gate cannot enforce the constraint.
- Whether consent for cross-region migration is captured as an audit event.
- Whether existing audit-log rows, AIOperation rows, AIWallet rows, and billing-record rows migrate with the Org or stay in the source region.
- Whether `legal_entity` re-issuance is automatic, prospective-only, or customer-elective.

§4.8.1 line 8255 self-acknowledges the gap: "Cross-region migration is an Ops procedure with explicit re-invoicing governance (out of scope for this entity; see RECONCILIATION.md → Known Gaps)." This is a deferred Authored Extension presented as a Known Gap rather than as an authored contract. **Filed as D-RES-007.**

**§1.6 mid-evaluation freeze.** "Region change after workspace creation requires data migration and is not available during production evaluations." No state-machine row, no error code (`org_residency_change_blocked_during_active_evaluation` or similar), no §32 endpoint contract. **Filed as D-RES-013.**

**Cross-region copy.** No "no-cross-region-copy without consent" invariant is stated in §1.6, §6.8, §40, or §42. The DSAR cascade walker explicitly forbids cross-region reads (§6.8.4.2 — closed under D-3.5-006), but the broader platform contract (replication, backups, observability fan-out, export delivery) is silent. **Subsumed in D-RES-001 / D-RES-002 / D-RES-009 / D-RES-010.**

### Check 3 — Cross-region failover behavior during regional outage

**§42.4 Disaster Recovery Targets (lines 32149–32162).** Verbatim:

> **RTO (Recovery Time Objective):** 1 hour
> **RPO (Recovery Point Objective):** 1 hour
>
> **Backups:**
> - **Database:** Convex-managed snapshots hourly (aligned with 1-hour RPO) and daily (30-day retention).
> - **Object Storage (Files):** Geo-redundant (S3 replication, multi-region).
> - **Test Restore:** Quarterly restore tests. Restore to staging environment. Verify data integrity.
>
> **Failover:** Convex provides transparent multi-region failover. Sourcera application code is stateless. No manual intervention needed. Automatic DNS failover (sub-60 second TTL).

**Defect.** The phrase "transparent multi-region failover" with no residency qualifier reads as: an EU-Ireland regional outage automatically fails traffic over to the next available Convex region — which, per the Convex platform deploy topology, may be US-East-1. That is a GDPR Chapter V third-country transfer of EU subject PII without authority. The §1.6 EU residency promise is silently violated by the §42.4 DR plan as written.

The same defect attaches to "Geo-redundant (S3 replication, multi-region)" — multi-region S3 replication crosses borders by default unless residency-bound replica policies are explicitly configured. The spec does not state that replication is residency-bound. **Filed as D-RES-001.**

**Per-region RTO/RPO.** "RTO 1 hour / RPO 1 hour" — no per-region commitment. If EU-Ireland goes down and EU-Frankfurt failover takes 90 minutes, has the EU customer's RTO been breached, or is RTO/RPO measured globally with cross-region failover satisfying the SLA? Unclear. **Filed as D-RES-011.**

**Test Restore.** "Restore to staging environment" — staging environment residency unstated. If staging is single-region (US), an EU restore test exfiltrates EU PII into US infrastructure during the test. **Subsumed in D-RES-001.**

### Check 4 — Backups respect residency

**§42.4 (line 32158–32160).** "Database: Convex-managed snapshots hourly … and daily (30-day retention). Object Storage (Files): Geo-redundant (S3 replication, multi-region)."

No residency qualifier on either backup class. No statement that snapshots are stored in the same residency region as the source data. No statement that S3 replication targets a same-region replica (e.g., EU-Ireland → EU-Frankfurt) and never crosses borders. Multi-region S3 replication crossing US-East-1 ↔ EU-West-1 by default would violate residency. **Filed as D-RES-002.**

**§40.2 retention table.** 38 retention rows. Numerous rows declare residency partitioning at the entity level (e.g., SellerSoftware, FeaturedPlacement, VerificationReviewRecord, Usage Event outbox). But the table never declares that backups inherit the row's residency partition — i.e., that a snapshot of a residency-partitioned entity is stored in the same residency partition. **Subsumed in D-RES-002.**

### Check 5 — Audit logs respect residency

**§6.7 Audit Logging (lines 10033–10130).** §6.7.1 Scope, §6.7.2 Structure, §6.7.3 Retention Policy by Plan, §6.7.4 Audit Log Access, §6.7.5 Hash-Chain Integrity, §6.7.6 Authentication Audit Events. **Zero mentions of residency.** §6.7.2 lists `organization_id` as a column but never states audit rows are stored in the Org's residency region. §6.7.4 export endpoint is silent on residency-partitioned export delivery. §6.7.5 hash-chain integrity scan is silent on per-region partitioning (though §42.6.1 line 32241 belatedly states "Each job runs once per residency region against residency-scoped data only" — the audit-logging contract section §6.7 does not own this rule).

**§4.6.1 / §4.6.1.1.** Line 7368: "Each row stored in the `org_id`'s `data_residency_region` partition; cross-region reads from customer surfaces blocked." This is the single residency clause for AuditEvent. D-1.5-012 (P2) already covers this gap at the §4.6.1.1 level (DR replication, failover, Ops-tier read rule, evacuation migration). The complementary defect — that §6.7, the *authoritative* audit-logging contract section, is silent — is not yet filed. **Filed as D-RES-009.**

**§40.2 retention table.** AuditEvent retention is governed by §34.1 cell `Audit Log Retention (UI)` and §40.2 financial-record exemption. The §40.2 row for AuditEvent does not declare a residency cell (most §40.2 rows do — a clear inconsistency). **Subsumed in D-RES-009.**

### Check 6 — AIOperation residency-locked legal entity consistent with billing

**§4.8.1 AIOperation (line 8186).** `legal_entity` enum cited as `sourcera_us_llc, sourcera_eu_gmbh, sourcera_uk_ltd, sourcera_apac_pte`. Mapping at line 8248–8253:
- `us → sourcera_us_llc`
- `eu → sourcera_eu_gmbh`
- `apac → sourcera_apac_pte`
- `uk` (custom; subset of `eu`) → `sourcera_uk_ltd`

**§4.8.3 AIWallet (line 8384).** Mirrors AIOperation rule.
**§4.8.12 MarketplaceDiscoveryRevenueRecord (line 8972).** Mirrors AIOperation rule.

**Appendix J — TWO conflicting enum registrations.**

| Enum | Location | Values |
| :---- | :---- | :---- |
| "Legal Entity (§4.8.1, §4.8.3)" | line 45257–45266 | `sourcera_us_llc, sourcera_eu_gmbh, sourcera_uk_ltd, sourcera_apac_pte` (UK-included, no custom) |
| `legal_entity_kind` (Appendix G envelope) | line 46824–46828 | `sourcera_us_llc, sourcera_eu_gmbh, sourcera_apac_pte, sourcera_custom` (UK-retired, custom-added) |

Phase 2V D-AJ-004 remediation note at line 46828 explicitly retires `sourcera_uk_ltd` and adds `sourcera_custom`. Same Phase 2V D-AJ-005 remediation at line 46822 retires `uk` from `residency_region_kind`. Both retirements were applied to the envelope-facing Appendix-G enums. Neither retirement was propagated to:
- The "Legal Entity" enum at line 45257.
- §4.8.1 / §4.8.3 / §4.8.12 inline citations.
- The §4.8.1 mapping table at line 8248–8253.
- The Glossary "Residency-Locked Invoicing" entry at line 47788 (verbatim cites `uk → sourcera_uk_ltd`).

**Defect.** Live billing surfaces (Stripe `customer_id` keying, invoice issuance, MarketplaceDiscoveryRevenueRecord cost-center isolation, AIOperation `legal_entity` lock) use the legacy enum with `uk / sourcera_uk_ltd` and no `custom / sourcera_custom`. The envelope-facing analytics enum uses the canonical post-D-AJ-004 / D-AJ-005 set. Finance reconciliation joins (Stripe invoice → §51 dashboard panel) cannot resolve `sourcera_uk_ltd` invoices to `legal_entity_kind` rows, and cannot resolve `sourcera_custom` envelope rows to a `legal_entity` billing row. **Filed as D-RES-004 (enum split) and D-RES-015 (uk-residency retirement propagation gap).**

**Custom-residency invoicing.** §4.1.1 line 3613 declares `custom_sovereign_residency_label` (e.g., `de_t_systems_2026`, `uk_crown_secure`). Per "Residency-Locked Invoicing" (§4.8.1 lines 8248–8255), `custom` does not have a `legal_entity` mapping — the four mapped residency values are `us / eu / apac / uk`. A `data_residency_region = custom` Org has no deterministic `legal_entity` derivation. AIOperation AC #14 at line 8289 ("`legal_entity` MUST equal the deterministic mapping from the Org's `data_residency_region` at write time") fails closed for every `custom` Org. **Subsumed in D-RES-004.**

### Check (additional) — Data Export delivery residency

**§6.8.1 Right of Access (lines 10171–10200).** Export "is generated asynchronously"; "User receives email with secure download link valid for 7 days"; "Export format: JSON with nested structure." Silent on:
- Where the export archive is stored (S3 region? Convex blob? per-Org residency partition?).
- Whether the presigned URL is region-bound (a US-region presigned URL serving an EU subject's PII over a US edge → cross-region transfer at fetch time).
- Whether the email containing the link is sent from a Loops.so EU dispatch instance for EU subjects.
- Whether the 7-day retention window for the link respects residency-partitioned cold-storage.

**§40.1 Export Formats (lines 31891–31905).** Silent on residency for any export format. **Filed as D-RES-010.**

### Check (additional) — Observability stack residency

**§42.6 Observability Stack (lines 32172–32184).** Datadog (logging + metrics + tracing + alerting), Sentry (error tracking), PagerDuty (incident routing), Statuspage.io (public status), Pino (application logs). Silent on residency.

Datadog has US and EU instances; Sentry has US and EU; PostHog has US and EU (covered in §51.7.3 routing). The spec explicitly routes PostHog by `data_residency_region` (line 41707) but does not state Datadog / Sentry / Pino routing rules. EU-Org logs containing `user_id`, `ip_address`, request-payload hashes flowing to Datadog US would be a cross-region transfer of EU subject PII. **Filed as D-RES-012.**

### Check (additional) — §40.4 broken cross-reference

50+ inline citations in the corpus reference "§40.4" as the residency authority (e.g., line 21101, 31283, 42539, 44099, 44291, 46818, plus §4.1.1, §4.4.10, §4.4.15, §27.10 instances). §40.4 is "Import Round-Trip Fidelity" (lines 31960–31980) and contains zero residency content.

The closest authored residency-expansion section is §47.4 "Data Residency & Compliance Expansion" (lines 32809–32822) — a 13-line stub with three "Current" bullets and four "Phase 2" bullets, no entity contract.

The actual entity-level residency contracts live distributed across §4.1.1, §6.8.4.2, §40.2 row-level cells, and §42.6.1 audit-integrity job's residency note. There is no canonical authoritative section that consumers can cite. The "§40.4 residency" citation pattern points to the wrong target across the corpus. Existing defects D-5.4-024, D-5.5-024 capture the gap at the §23 / §24 feature-row level; the structural / cross-reference root cause is unfiled. **Filed as D-RES-005.**

---

## Counterfactual Pass — Three Realistic Failure Modes per Concern

### Failover (D-RES-001)

1. **EU-Ireland Convex region degraded; automatic DNS failover redirects EU-Org traffic to US-East-1.** Subject's bid-workspace data, presence records, and Convex Storage objects are now served from US infrastructure. Cross-region transfer; no Article 49 derogation; no consent. Spec silent.
2. **S3 multi-region replication policy includes a US-East-1 replica for an EU-Ireland bucket.** Encryption-at-rest is in place but the bucket key replicates and the data is decryptable in US. Spec says "geo-redundant" — does not exclude this configuration.
3. **Quarterly DR test restores an EU snapshot into a single-region US staging environment.** Test restore copies EU subject PII into US for the duration of the test. Spec silent on staging-region residency.

### Backup residency (D-RES-002)

1. **Convex managed snapshot of an EU shard stored in a US-region backup vault.** Default Convex backup configuration does not pin the snapshot to the source region unless explicitly configured. Spec silent.
2. **Daily backup retention 30 days — backup blob is residency-bound but the metadata catalog (snapshot index) is in a different region.** Subject inquiry / DSAR "where is my data" cannot answer if the catalog is cross-region.
3. **Hourly snapshot taken mid-DSAR-cascade — pre-pseudonym row is captured in the snapshot.** §6.8.4 cascade walker pseudonymizes the source row but the snapshot retains the original PII. Spec silent on backup re-pseudonymization on DSAR.

### Per-Org residency change (D-RES-007)

1. **Org Owner toggles `eu → us` mid-evaluation while a Bid Workspace is in Phase 9 with active AIOperations.** New AIOperations route to US AIWallet; existing AIOperations remain in EU; billing legal_entity changes prospective-only; existing invoices retain `sourcera_eu_gmbh`. State machine? Cutover semantics? Audit eventing? Spec silent (§4.8.1 line 8255 acknowledges gap).
2. **Org Owner toggles to `data_residency_region = custom` without populating `custom_sovereign_residency_label`.** §4.1.1 line 3613 says "required iff `data_residency_region = 'custom'`" — what error code surfaces? §32 endpoint contract for `PATCH /v1/organizations/{org_id}` not authored for residency-change. Spec silent.
3. **Sourcera Ops mistakenly approves an EU→US migration without DPO sign-off.** No spec-side audit-event requirement, no dual-signoff requirement on residency change. Pre-existing OpsActionRecord pattern (§4.4.27) would log the action but the consent gate is unauthored.

### AIOperation legal-entity drift (D-RES-004)

1. **EU-residency Org with a `data_residency_region = custom`-promoted sovereign-cloud agreement (e.g., `de_t_systems_2026`).** AIOperation AC #14 demands `legal_entity` derive deterministically from `data_residency_region`; `custom` has no mapping in §4.8.1 line 8248–8253; write rejects with `ai_operation_legal_entity_residency_mismatch`. Every AIOperation against the Org fails closed. Spec inconsistency.
2. **Stripe Customer for a UK Org keyed by `(org_id, sourcera_uk_ltd)` per §4.8.3.** Finance reconciliation joins Stripe invoices to `legal_entity_kind` envelope-rows; `sourcera_uk_ltd` does not exist in `legal_entity_kind` (retired in Phase 2V D-AJ-004). The reconciliation join silently drops the Org's invoices.
3. **Org migrates `eu → us` mid-fiscal-year.** §4.8.1 line 8255 says "subsequent operations write the new `legal_entity`"; but Stripe Customer is bound 1:1 to `(org_id, legal_entity)` per §34.10.5 line 29901. Migration creates a new Stripe Customer; existing Subscription remains on the old Customer; the Org now has two active Stripe Customers under one tenancy, accumulating two invoice streams the customer must reconcile. Spec silent on this Stripe-side fan-out.

---

## Self-Challenge Pass

For each defect filed, I asked: is the evidence reproducible (line-cited)? Is severity rule-based per `Audit_Prompts.md → Severity Definitions`? Could the recommendation be sharper?

- **D-RES-001 / D-RES-002 (P0).** Severity rule (c) — "violates a hard regulatory requirement (GDPR right-to-erasure, US/EU data-residency lock, audit-log integrity)." The §1.6 EU residency promise is contractual; §42.4 DR plan as written can violate it without remediation. P0 stands.
- **D-RES-003 (P1).** §1.6 omits two of four canonical residency values. A junior engineer reading §1.6 to scope a US/EU-only release would build the wrong thing. P1 stands.
- **D-RES-004 (P0).** Severity rule (d) — "leaves a billing surface … ambiguous in a way that allows revenue leakage or double-charge." Two Stripe Customer streams against one tenancy on residency change, plus `custom`-residency Orgs with no `legal_entity` mapping. P0 stands. Alternative consideration: would a senior engineer resolve uniformly? I revised this from initial P1 to P0 because the `sourcera_uk_ltd` retirement in Appendix J `legal_entity_kind` plus the surviving inline use creates a finance reconciliation gap that surfaces as silent invoice-loss in monthly close.
- **D-RES-005 (P1).** Broken cross-reference repeated 50+ times in the corpus. Severity rule "missing retention/DSAR/residency clause" and Convention #10 (single authoritative home) — the structural absence forces every entity to hand-roll its own residency clause, which is the root cause of the residency-class defects already filed. P1 stands.
- **D-RES-006 (P1).** §47.4 Phase-2-target list contains `apac` ("Singapore data center") even though `apac` is in production data model. This is direct text-vs-model contradiction. P1 stands.
- **D-RES-007 (P1).** §1.6 region-change contract is one sentence; the residency-migration procedure is "out of scope" per §4.8.1 line 8255. Convention #14 (downgrade paths and data preservation) and Convention #5 (state machines) require explicit authoring. P1 holds; would be P0 if a customer-visible billing-surface ambiguity were proven, but the §4.8.1 line 8255 prospective-only rule technically forecloses revenue leakage. P1 stands.
- **D-RES-008 (P1).** Broken citation to Appendix J line 44745 for the `data_residency_region` enum. The actual enum is at line 45049. P1 because it's an authoritative-source map breakage that would block a junior engineer's lookup.
- **D-RES-009 (P1).** §6.7 Audit Logging silent on residency. Audit logs carry PII; the §40.2 retention table has residency cells on most rows but not the AuditEvent row; §6.7 itself is the canonical audit-logging contract. Severity rule "missing retention/DSAR/residency clause" applies. P1 stands. Distinct from D-1.5-012 (which covers §4.6.1.1 entity-level residency silence on DR / failover / Ops-tier / migration).
- **D-RES-010 (P1).** §6.8.1 export delivery silent on residency for the export archive itself. Export contains the full subject's PII. P1 stands.
- **D-RES-011 (P2).** Per-region RTO / RPO underspecified. P2 (ambiguous-but-resolvable; thoughtful staff engineer could resolve, but two readers might resolve differently).
- **D-RES-012 (P2).** Datadog / Sentry / Pino routing residency silent. P2 because the resolution direction is clear (route by `data_residency_region`) but the spec is silent on the rule.
- **D-RES-013 (P2).** "Production evaluation" not defined as enforceable predicate. P2.
- **D-RES-014 (P3).** §1.6 doesn't enumerate `custom_sovereign_residency_label` requirement (covered in §4.1.1). P3 — cosmetic but spec hygiene.
- **D-RES-015 (P1).** `uk`-residency Phase 2V retirement not propagated to §4.8.1 inline mapping or the legacy "Legal Entity" Appendix J row. P1.

I revised D-RES-004 from P1 to P0 in this pass. No other changes.

---

## Promotion to DEFECT_LEDGER.md

15 defects promoted to `_audit/DEFECT_LEDGER.md` rows D-RES-001 through D-RES-015. Coverage matrix `residency` cells touched on:

- §1.6 Deployment Regions (engine_concept) — `residency` ⚠ → ❌ (D-RES-003 + D-RES-007 + D-RES-013 + D-RES-014).
- F-001 / F-002 / F-003 (Org-level residency cluster) — `numerical_singleton` ⚠ → ❌ (D-RES-008 broken Appendix-J line citation; deepens prior D-2.2-020).
- §6.7 Audit Logging cluster — `residency` ⚠ → ❌ (D-RES-009).
- §6.8.1 Right-of-Access export delivery — `residency` ⚠ → ❌ (D-RES-010).
- §40.4 Data-residency cross-reference target — `documentation_gap` n/a → ❌ (D-RES-005).
- §42.4 Disaster Recovery — `residency` ⚠ → ❌ (D-RES-001 + D-RES-002 + D-RES-011).
- §42.6 Observability stack — `residency` ⚠ → ❌ (D-RES-012).
- §4.8.1 / §4.8.3 / §4.8.12 legal-entity binding — `numerical_singleton` ⚠ → ❌ (D-RES-004 + D-RES-015).
- §47.4 Data Residency & Compliance Expansion — `consistency_drift` n/a → ❌ (D-RES-006).
