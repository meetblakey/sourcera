# Phase 1.4 — §4.5 Marketplace Entities — Findings Scratch Log

**Phase:** Phase 1.4 — §4.5 Marketplace Entities deep audit.
**Prompt:** `Audit_Prompts.md → Prompt 1.4 — §4.5 Marketplace Entities`.
**Run completed:** 2026-05-01.
**Triggered by:** V1.3 §13.7.4 deliverable; closes the Phase-1.4-component residual scope of `D-1V2-002`.
**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` §4.5.1–§4.5.9 (lines 6573–7062 inclusive); §4.4.7 Marketplace Category cross-reference; §4.4.8 Vendor Opt-Out Record cross-reference; §4.7.1 Console Bridge Event for `eoi_acceptance_propagated` event_kind; §4.7.2 Vendor Disqualification Record cross-reference (Prompt 1.4 check #5); §4.8.12 MarketplaceDiscoveryRevenueRecord cross-reference (Prompt 1.4 check #6); §27.5 EOI flow; §27.6 tag proposal workflow; §27.10 Marketplace Discovery Pricing.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` end-to-end.
- v7.1.0 corpus state per `AUDIT_README.md`.
**Artifacts produced:** 14 defect rows appended to `DEFECT_LEDGER.md` (`D-1.4-001` … `D-1.4-014`); COVERAGE_MATRIX cells for §4.5 entity rows tightened.

---

## 1. Method

1. Catalogued all 9 §4.5 sub-sections (4.5.1 Marketplace Listing, 4.5.2 EOI Record, 4.5.3 NDA Record, 4.5.4 Taxonomy Node, 4.5.5 Controlled-Vocabulary Tag, 4.5.6 Vendor Opt-Out Record marketplace-domain read/render contract, 4.5.7 Marketplace Abuse Report, 4.5.8 EOI Acceptance Record, 4.5.9 EvalStarter), enumerating each entity's field set, console enum, scope-isolation declaration, indexes, retention rule, state-machine reference, acceptance criteria, and Authored-Extension flags.
2. Cross-referenced §4.5 entities against the §4.5.4 Taxonomy Node and §4.4.7 Marketplace Category projection contract (Prompt 1.4 check #1).
3. Cross-referenced §4.5.5 Controlled-Vocabulary Tag against the §27.6 sellers-cannot-create-freeform-tags rule and the consumer-side write enforcement (Prompt 1.4 check #2).
4. Cross-referenced §4.5.6 Vendor Opt-Out Record against §4.4.8 authoring contract and the marketplace-domain read/render contract (Prompt 1.4 check #3).
5. Cross-referenced §4.5.8 EOI Acceptance Record against §27.5 one-click flow + §4.7.1 `eoi_acceptance_propagated` event_kind (Prompt 1.4 check #4).
6. Confirmed §4.7.2 Vendor Disqualification Record covers Prompt 1.4 check #5 (rationale, who-marked-whom, appeal window, webhook). Out-of-section finding: §4.7.2 retention/DSAR block is still missing per `D-1.6-004` (P1) — Phase 1.6 finding remains open; not re-filed by Phase 1.4.
7. Confirmed §4.8.12 MarketplaceDiscoveryRevenueRecord (not §4.5) covers Prompt 1.4 check #6 (rev_marketplace_discovery cost center isolation). No new finding.
8. Walked §4 audit checklist (data model, ACs, enums, glossary, state machines, APIs, webhooks, plan gating, retention, numerical singletons, residency, firewall, indexes) end-to-end on each entity.
9. Severity classified per `Audit_Prompts.md → Severity Definitions` first-matching-rule discipline.

---

## 2. Confirmed Findings (promoted to defect ledger)

14 defects filed.

| class | count | severity mix |
|---|---|---|
| data_model | 5 | 1× P0, 4× P1 |
| firewall_leakage / residency | 2 | 1× P0, 1× P1 |
| state_machine | 2 | 2× P1 |
| retention / dsar | 2 | 2× P1 |
| acceptance_criteria | 1 | 1× P1 |
| enum / consistency_drift | 1 | 1× P1 |
| numerical_singleton | 1 | 1× P1 |

**Total:** 14 defects (2 P0 / 12 P1 / 0 P2 / 0 P3).

**P0 defects (2).**
- `D-1.4-001` — Marketplace Listing missing `data_residency_region` field; same regulatory pattern as `D-1V-007` (Bid Workspace residency) with the same P0 rule (c) "violates US/EU data-residency lock."
- `D-1.4-002` — EOI Record missing `data_residency_region` field AND no cross-Org residency tie-break rule when buyer + seller residency partitions diverge; cross-residency EOI flows have no schema basis for partitioning, regulatory exposure under GDPR Article 44 cross-border transfer.

**P1 defects (12).** D-1.4-003 (Marketplace Listing convention bar — missing console / indexes / retention / DSAR / ACs / state-machine table); D-1.4-004 (Marketplace Listing inline `category` enum conflicts with §4.5.4 Taxonomy Node + §4.4.7 Marketplace Category — sellers cannot use the full taxonomy via this surface); D-1.4-005 (EOI Record convention bar gap — missing console / indexes / retention / DSAR / ACs / state-machine table); D-1.4-006 (EOI Record `eoi_status` inline enum not registered in Appendix J); D-1.4-007 (NDA Record convention bar gap); D-1.4-008 (NDA Record `nda_status` no state-machine table); D-1.4-009 (NDA Record `nda_buyer_signatory_email` / `nda_seller_signatory_email` PII fields — DSAR cascade silent; per §6.8.4.1 needs Pattern A/B declaration); D-1.4-010 (NDA Record retention not stated despite contract-bearing document with 7-year regulatory horizon); D-1.4-011 (Marketplace Listing `min_price_usd_monthly` / `max_price_usd_monthly` Decimal type violates §4.8.13 "every monetary field uses integer cents" convention rule — should be `_cents` BigInt); D-1.4-012 (EOI Record `estimated_contract_value_usd: Decimal` same monetary-singleton violation); D-1.4-013 (Marketplace Listing missing `updated_by` per §4.1 audit-trail Principle #2); D-1.4-014 (EOI Record missing `updated_by` per §4.1 audit-trail Principle #2).

---

## 3. Self-Challenge Pass (hostile-reviewer re-read)

Per `Audit_Prompts.md` OPUS guidance, every finding was re-read as a hostile reviewer.

### 3.1 Are the literal findings reproducible?

Every defect cites either (a) a specific Master Spec line number (e.g., Marketplace Listing field table 6577–6605; EOI Record field table 6609–6625; NDA Record field table 6629–6649), (b) a specific entity-table cell, or (c) a specific cross-section reference (§4.4.1 Bid Workspace residency precedent for D-1V-007; §4.5.4 Taxonomy Node precedent for §4.5.1 enum drift). Verified — every defect's evidence was reproducible in this session.

### 3.2 Is severity rule-based?

- **D-1.4-001** P0 — Marketplace Listing residency. The Severity rule (c) "violates a hard regulatory requirement (US/EU data-residency lock)" was the test that escalated `D-1V-007` to P0. The pattern is identical: a public-facing seller-authored entity with no residency partition cannot enforce GDPR Article 44 / cross-border-transfer-lock for an EU seller's data. P0 confirmed.
- **D-1.4-002** P0 — EOI Record residency. EOI Record carries `buyer_org_id` and `marketplace_listing_id` (transitively, `seller_org_id`); the entity's residency partition is unspecified when buyer + seller residencies diverge. The Severity rule (c) applies because GDPR Article 44 cross-border transfer requires explicit residency declaration; P0 stands. **Self-challenge:** could a junior engineer infer the partition from §40.3? §40.3 cites Workspace residency, not EOI Record; Workspace ≠ EOI Record. The schema is silent. P0 stands.
- **D-1.4-003** P1 — Marketplace Listing convention bar. Missing `console`, indexes, retention, DSAR, ACs, state-machine table. Each individual gap is P1 by the "missing field-level schema" rule; bundled here for sub-prompt brevity.
- **D-1.4-004** P1 — Marketplace Listing `category` inline 7-value enum vs §4.5.4 Taxonomy Node + §4.4.7 Marketplace Category. Sellers using the inline enum cannot represent the full Marketplace taxonomy; the inline enum will drift from the canonical taxonomy on every Ops update to §4.4.7. The defect is "feature unbuildable as written" — sellers cannot reach all categories via this surface. P1 confirmed.
- **D-1.4-005 / D-1.4-007** P1 — EOI Record / NDA Record convention bar. Same pattern as D-1.4-003.
- **D-1.4-006** P1 — EOI Record `eoi_status` not in Appendix J. Same pattern as the Phase 1.5 unregistered-enum class. CI gate `appendix_j_eoi_record_status_completeness` (new) asserts.
- **D-1.4-008** P1 — NDA Record `nda_status` no state-machine table. State-transition prose insufficient per Authoring Convention #5 (§4.1).
- **D-1.4-009** P1 — NDA signatory email DSAR. **Self-challenge:** is this P0? P0 (b) "exposes PII or PCI scope to an unintended actor" — but the NDA signatory's email is shared between buyer and seller by design (the NDA signers know each other's identities). DSAR cascade applies on user-DSAR — the email field needs pseudonymization on right-to-erasure. Workable via the §6.8.4.1 Pattern A (NDA signatory email is a String, not a UUID FK; the User row hard-deletes per Class 4 if the User has no other audit-integrity row class link). P0 not warranted; P1 "feature unbuildable as written" stands because §6.8.4.1 doesn't enumerate NDA Record in its per-entity assignment table.
- **D-1.4-010** P1 — NDA retention silence. Contracts typically need 7-year retention horizon per §40.2 financial-record exception. Silence violates Authoring Convention #9.
- **D-1.4-011 / D-1.4-012** P1 — Decimal monetary fields. §4.8.13 AC #16 (D-1.7-001 remediation, this same pass) cited "every monetary field uses integer cents" as a §4 convention. §4.5.1 / §4.5.2 violate. Buildability: a Decimal `min_price_usd_monthly` cannot interoperate with the integer-cents currency normalization in §34.10 / §4.8.1 AIOperation `cost_base_cents`. **Self-challenge:** is this P0? No — the marketplace-listing prices are informational, not billing surface. P1 stands.
- **D-1.4-013 / D-1.4-014** P1 — Missing `updated_by`. §4.1 Principle #2 audit-trail requirement. Same pattern as D-1.1-006 (Team), D-1.2-010 (multi-entity), so consistent severity.

### 3.3 Could recommendations be sharper?

Revisions made in place during ledger composition:

- D-1.4-001 recommendation now cites the exact §40.3 / §47.4 residency tie-break rule that should propagate to Marketplace Listing, plus the Authored-Extension #38 precedent established by D-1V-007's remediation.
- D-1.4-002 recommendation explicitly names the buyer-residency-vs-seller-residency partition rule (the §4.7.1.1 Console Bridge canonicalization layer is the architectural precedent); recommends adding `data_residency_region` to EOI Record AND the cross-residency tie-break clause in §4.5.2 prose.
- D-1.4-004 recommendation: replace the inline 7-value `category` enum with `category_taxonomy_node_id: UUID (FK) → §4.5.4 Taxonomy Node where kind=marketplace_category`.
- D-1.4-009 recommendation: register §4.5.3 NDA Record in §6.8.4.1 per-entity assignment table with Pattern A for `nda_buyer_signatory_email` / `nda_seller_signatory_email` (string columns; User row hard-deletes per Class 4 unless the signatory User has other audit-integrity references — in which case Pattern B applies via NDA Record extension fields `nda_buyer_signatory_user_id` / `nda_seller_signatory_user_id` — author the FK fields).
- D-1.4-011 / D-1.4-012 recommendation: rename `min_price_usd_monthly` → `min_price_cents_monthly` (BigInt); add `currency_code: String(3) ISO 4217` field; rename `max_price_usd_monthly` → `max_price_cents_monthly` (BigInt); rename `estimated_contract_value_usd` → `estimated_contract_value_cents` (BigInt) + currency_code.

### 3.4 Counterfactual Pass — Three failure modes per material defect

For each P0 and a sample of P1 defects, three realistic failure modes were enumerated and confirmed against the spec:

- **D-1.4-001 Marketplace Listing residency.** (a) An EU seller publishes a listing; the listing data lands in US storage because the platform has no residency partition on §4.5.1 — GDPR Article 44 violation. (b) A buyer DSAR on a buyer who EOI'd a US listing requires retrieval from US storage; cross-region read paths must be explicit; the spec has none. (c) Migration to add the field requires retroactive partition; the spec has no migration plan.
- **D-1.4-002 EOI Record residency.** (a) Cross-residency EOI: EU buyer expresses interest in US seller's listing; the EOI carries the buyer's residency-bound message but has no schema basis for partitioning. (b) DSAR on the buyer User authoring N EOIs across N residency-different sellers — cascade walker has no residency-partition key to scope by. (c) The §4.7.1 Console Bridge `eoi_acceptance_propagated` event_kind is the bridge mechanism; without EOI Record residency, the bridge has no source-side residency to canonicalize.
- **D-1.4-004 Marketplace Listing inline category enum.** (a) Ops adds a new category to §4.4.7 — the inline enum on §4.5.1 doesn't update; sellers cannot publish to the new category via this surface. (b) Schema migration to add a value to the inline enum requires deploy and engineering time, breaking Ops-managed taxonomy autonomy. (c) Cross-reference inconsistency between §4.5.1 inline enum and §4.4.7 / §4.5.4 leads to silent runtime divergence — listings published with the inline enum value `crm` cannot link to the `kind=marketplace_category` Taxonomy Node `crm` slug if the slugs drift.
- **D-1.4-009 NDA signatory email DSAR.** (a) Buyer User issues right-to-erasure; the NDA Record's `nda_buyer_signatory_email` retains the email. The cascade walker has no rule for NDA Record. (b) Pre-2026-05-01 NDA Records carry pre-pseudonymization emails; the legacy migration is unspecified. (c) The §6.8.4.1 per-entity assignment table omits §4.5.3, so engineers default to Class 4 hard-delete which would destroy the NDA's contract-integrity row — wrong choice.

---

## 4. Coverage Matrix Updates

For F-{TBD} marketplace-feature §4.5 entity rows, the following cells transition (V1.3-pass propagation matches the Phase 1.2 §9.4 pattern; the matrix file is updated mechanically in the v7.1.1 hygiene pass per `D-1V3-004` partially_remediated tracking):

| feature_id | feature_name | data_model | enums | acceptance_criteria | retention | dsar | residency | console_firewall | state_machine | ci_gate_coverage |
|---|---|---|---|---|---|---|---|---|---|---|
| F-{Marketplace Listing} | §4.5.1 Marketplace Listing | ⚠ → ❌ (D-1.4-001/-003/-004/-011/-013) | ⚠ → ❌ (D-1.4-004) | ❌ | ⚠ → ❌ (D-1.4-003) | ⚠ → ❌ (D-1.4-003) | ⚠ → ❌ (D-1.4-001 P0) | ⚠ → ❌ (D-1.4-003) | ⚠ → ❌ (D-1.4-003) | ⚠ |
| F-{EOI Record} | §4.5.2 EOI Record | ⚠ → ❌ (D-1.4-002/-005/-006/-012/-014) | ⚠ → ❌ (D-1.4-006) | ❌ | ⚠ → ❌ (D-1.4-005) | ⚠ → ❌ (D-1.4-005) | ⚠ → ❌ (D-1.4-002 P0) | ⚠ → ❌ (D-1.4-005) | ⚠ → ❌ (D-1.4-005) | ⚠ |
| F-{NDA Record} | §4.5.3 NDA Record | ⚠ → ❌ (D-1.4-007/-008/-009/-010) | ⚠ | ❌ | ⚠ → ❌ (D-1.4-010) | ⚠ → ❌ (D-1.4-009) | ⚠ | ⚠ → ❌ (D-1.4-007) | ⚠ → ❌ (D-1.4-008) | ⚠ |
| F-{Taxonomy Node} | §4.5.4 | ✅ holds | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ✅ | ✅ |
| F-{Controlled-Vocabulary Tag} | §4.5.5 | ✅ holds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| F-{Vendor Opt-Out marketplace-domain read/render} | §4.5.6 | ✅ (cross-ref to §4.4.8) | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | n/a | ✅ |
| F-{Marketplace Abuse Report} | §4.5.7 | ✅ holds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| F-{EOI Acceptance Record} | §4.5.8 | ✅ holds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| F-{EvalStarter} | §4.5.9 | ✅ holds | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ✅ | ✅ |

**Net delta:** §4.5.1 / §4.5.2 / §4.5.3 are the three problem entities — they predate the v7.0.0 / v7.1.0 convention bar uplift and were not deep-revisited in those passes. §4.5.4 / §4.5.5 / §4.5.6 / §4.5.7 / §4.5.8 / §4.5.9 are model entities that meet or exceed the §4 convention bar; no defects.

**Aggregate counters NOT updated** in this Phase 1.4 pass. Aggregate ✅ / ⚠ / ❌ / n/a totals re-derive in the Phase-1-V4 cross-check.

---

## 5. Cross-Phase Linkage

| linkage | resolution |
|---|---|
| §4.5.1 Marketplace Listing → §32 endpoint pairing | §32 has buyer-side marketplace-search endpoints; per-listing CRUD endpoints are seller-side and live in §32 sections covering Seller Profile / SellerSoftware. Phase 8 audit confirms the seller-side write endpoints exist. No new gap. |
| §4.5.2 EOI Record → §32 endpoint pairing | §27.5 documents the EOI flow but does not enumerate `POST /v1/eoi-records`. Phase 8 owes the endpoint contract. **Forwarded to Phase 8.** |
| §4.5.3 NDA Record → §32 endpoint pairing | NDA execution flow at §4.5.3 prose; `POST /v1/nda-records` not enumerated in §32. **Forwarded to Phase 8.** |
| §4.5.7 Marketplace Abuse Report → §31 webhook | §4.5.7 references `abuse_report.sla_breach` "authored in Phase 4" — confirmed registered in Appendix C now. ✅ |
| §4.5.4 Taxonomy Node → §31 webhook | `taxonomy.node.updated` "authored in Phase 4" — confirmed registered. ✅ |
| §4.5.5 Controlled-Vocabulary Tag → §31 webhook | `vocab_tag.approved`, `vocab_tag.review_slo_breach`, `vocab_tag.deprecation_slo_breach` — confirmed registered. ✅ |
| §4.5.8 EOI Acceptance Record → §31 webhook | `eoi_acceptance.reversed` — confirmed registered. ✅ |

---

## 6. Phase 1.4 Sign-Off

| sign-off criterion | observed | result |
|---|---|---|
| Zero unresolved P0 in Phase 1.4 | **2 P0 open** (`D-1.4-001`, `D-1.4-002`) | ❌ |
| Every P1 defect has a `remediation_owner_hint` and one-line recommendation | 12/12 populated in DEFECT_LEDGER.md | ✅ |
| COVERAGE_MATRIX §4.5 cells tightened on a deep read | 9 entities deep-read; transition prescribed for F-{Marketplace Listing} / F-{EOI Record} / F-{NDA Record} (cells go ⚠ → ❌); §4.5.4 / §4.5.5 / §4.5.6 / §4.5.7 / §4.5.8 / §4.5.9 confirm ✅ holds | ⚠ partial (matrix file mechanical updates landed in V1.3 pass for §4.5.1/§4.5.2/§4.5.3 below; remainder propagates in v7.1.1 mechanical pass per `D-1V3-004` partially_remediated) |
| Promotion of confirmed findings to DEFECT_LEDGER.md | 14/14 promoted | ✅ |

**Phase 1.4 verdict: HALT — 2 P0 defects block sign-off.** 14 new defects filed (`D-1.4-001` … `D-1.4-014`); 2 P0; 12 P1. The two P0 residency findings (`D-1.4-001` Marketplace Listing, `D-1.4-002` EOI Record) match the regulatory pattern of `D-1V-007` (Bid Workspace) and require Master Spec authoring to close. Aggregate Phase-1 P0 count: **8 (unchanged) + 2 (new from Phase 1.4) = 10 open P0** as of Phase 1.4 close.

---

## 7. Phase-1 Aggregate Roll-Up Post-1.4

| sweep | defects | severity mix | open P0 |
|---|---|---|---|
| D-AS-NNN (Phase 0.4 Auth-Source Map) | 13 | 5 P1 / 2 P2 / 6 P3 | 0 |
| D-1V-NNN (Phase 1V V1 standalone read) | 14 | 0 P0 / 5 P1 (remediated) / 4 P2 / 3 P3 | 0 (all remediated 2026-04-29) |
| D-1.1-NNN (Phase 1.1 §4.2 sub-prompt) | 22 | 0 P0 / 15 P1 / 6 P2 / 1 P3 | 0 |
| D-1.2-NNN (Phase 1.2 §4.3 sub-prompt) | 20 | 0 P0 / 10 P1 / 8 P2 / 2 P3 | 0 |
| D-1.3-NNN (Phase 1.3 §4.4 sub-prompt) | 31 | 1 P0 / 8 P1 / 18 P2 / 4 P3 | 1 (`D-1.3-001` — addressed by V1.3 spec-side remediation pass 2026-05-01) |
| **D-1.4-NNN (Phase 1.4 §4.5 sub-prompt; this scratch log)** | **14** | **2 P0 / 12 P1** | **2** |
| D-1.5-NNN (Phase 1.5 §4.6 sub-prompt) | 14 | 5 P0 / 4 P1 / 3 P2 / 2 P3 | 5 (addressed by V1.3 spec-side remediation pass 2026-05-01) |
| D-1.6-NNN (Phase 1.6 §4.7 sub-prompt) | 12 | 1 P0 / 3 P1 / 7 P2 / 1 P3 | 1 (addressed by V1.3 spec-side remediation pass 2026-05-01) |
| D-1.7-NNN (Phase 1.7 §4.8 sub-prompt) | 18 | 1 P0 / 4 P1 / 4 P2 / 9 P3 | 1 (addressed by V1.3 spec-side remediation pass 2026-05-01) |
| D-1V2-NNN (V1.2 originated) | 3 | 0 P0 / 2 P1 / 1 P2 | 0 |
| D-1V3-NNN (V1.3 originated) | 4 | 0 P0 / 2 P1 / 1 P2 / 1 P3 | 0 (addressed by V1.3 spec-side remediation pass 2026-05-01) |
| **Aggregate Phase 1 (post-1.4 + V1.3 remediation pass)** | **165** | **10 closed P0 / 70 open P1 / 54 P2 / 31 P3** | **2 (D-1.4-001, D-1.4-002 — Phase 1.4 originated; not yet remediated)** |

Open Phase-1 P1 defects post-1.4 + V1.3 remediation: 5 (D-AS) + 0 (D-1V — remediated) + 15 (D-1.1) + 10 (D-1.2) + 7 (D-1.3 minus `D-1.3-001` P0 closed) + 12 (D-1.4) + 3 (D-1.5 minus 4 P0 closed) + 3 (D-1.6 minus 1 P0 closed) + 4 (D-1.7 minus 1 P0 closed) + 2 (D-1V2) + 2 (D-1V3) = approximately **63 unresolved P1 defects** plus the 2 Phase-1.4 P0s. None blocks Phase 2 RBAC / API work. The 2 Phase-1.4 P0s are spec-side remediations owed; recommended path: extend the V1.3 spec-side remediation pass with the §4.5.1 / §4.5.2 residency authoring before Phase 1 V4 verification.

---

## 8. Out-of-Scope / Forwarded to Downstream Phases

- **Phase 8:** §32 endpoint contracts for `POST /v1/eoi-records`, `POST /v1/nda-records`. EvalStarter `GET /v1/eval_starters` is flagged in §4.5.9 prose as Authored Extension — confirm landing.
- **Phase 9 (Observability):** EOI Record / NDA Record / Marketplace Listing observability instrumentation per §51.
- **v7.1.1 mechanical pass:** matrix file cell propagation for the remaining §4.3 + §4.5 rows per `D-1V3-004` partially_remediated.
