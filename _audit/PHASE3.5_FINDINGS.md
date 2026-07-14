# Phase 3.5 — §6.8 Data Privacy & GDPR Compliance Walk Findings (Scratch Log)

**Phase prompt:** Audit_Prompts.md → Prompt 3.5 (DSAR, GDPR, Right-to-Erasure).
**Scope:** Master Spec §6.8 (lines 9552–9760), comprising §6.8.1 Right of Access, §6.8.2 Right to Erasure on Deprovisioning, §6.8.3 Right to Erasure on Account Closure, §6.8.4 DSAR Cascade Across Linked Entities, §6.8.4.1 Cascade Pseudonymization Pattern, §6.8.5 Audit-Integrity Exemption & Retention Override, §6.8.6 DSAR Operational SLA. Cross-walks into §4.2.3 User, §4.6.1 Audit Event, §4.6.3 OpsSession, §4.7.1.1 Console Bridge Event Retention/Cascade, §4.7.2 Vendor Disqualification Record, §4.8.1 AIOperation, §4.8.5 ContestRecord, §4.8.8 CommittedSpendContract, §4.8.12 MarketplaceDiscoveryRevenueRecord, §4.4.18 SellerSignal, §4.4.7 / §4.4.12 / §4.4.16 marketplace aggregates, §22.3.1 KB Entry retention, §29.5 NotificationFailureAudit, §31 webhooks, §32 APIs, §33.4 DSAR surface, §40.2 Data Retention, §45.1 Data Privacy, §51.7.3 usage-event redaction, Appendix C Notification Event Catalog, Appendix G PostHog Taxonomy, Appendix I Error Codes, Appendix J `audit_event_action_type` and related enums, Appendix K Glossary.
**Defect-ID convention:** `D-3.5-NNN`.
**Severity rule application:** P0 reserved for hard GDPR-regulatory blockers (a defect that would prevent the v7.1.0 build from satisfying Articles 15/16/17/18/20/21 in operation), residency-rule violations on the DSAR cascade path, and audit-integrity contradictions on financial-record entities. P1 for any feature unbuildable as written (missing entity, missing API contract, missing event registration, contradictory entity-level prescription). P2 for ambiguous or under-specified clauses where two engineers would resolve differently. P3 reserved for citation hygiene and heading-anchor cosmetic.
**Self-challenge revisions:** Three (logged inline at §6 below).

---

## 1. Sources Read End-to-End

- Master Spec §6.8 in full (lines 9552–9760), including §6.8.4.1 (D-1V3-001 / D-1V3-003 remediation block lines 9654–9703).
- Master Spec §4.2.3 User entity (line 3594) — DSAR subject anchor.
- Master Spec §4.6.1 / §4.6.1.1 Audit Event entity + retention/DSAR cascade clause (lines 7131–7202).
- Master Spec §4.6.1.2 Bearer-Secret Exclusion (lines 7203–7247) — interaction with DSAR redaction sentinel.
- Master Spec §4.6.3 OpsSession entity (line 7348).
- Master Spec §4.7.1 / §4.7.1.1 Console Bridge Event including Pattern B DSAR cascade (lines 7503–7714).
- Master Spec §4.7.2 Vendor Disqualification Record retention/DSAR (line 7715, 7815).
- Master Spec §4.8.1 AIOperation entity in full (lines 7857–7986), with focus on the DSAR redaction prescription at AC #12 (line 7982) and the `actor_id` / `submitter_user_id` field-name comparison against §6.8.4.1.
- Master Spec §4.8.5 / §4.8.8 / §4.8.12 (financial-record DSAR-exempt entities referenced from §6.8.5 row 3 / 4).
- Master Spec §4.4.7 Marketplace Category, §4.4.12 CategoryPage (k-anon DSAR rebalancing line 5109), §4.4.16 HeatMapCell (line 5373), §4.4.18 SellerSignal (line 5530+), §4.4.15 MarketIntelligenceReport (line 5273+) — k-anonymity post-erasure rebalancing path.
- Master Spec §22.3.1 KB Entry retention (line 15211) — embedding/BM25 purge in same Convex transaction.
- Master Spec §22.4.5 Embedding Version Bumps (line 15368) — confirms vector-store cascade is co-transactional at the entry level.
- Master Spec §29.5 NotificationFailureAudit (line 24196) — retention defers to §6.8.5 row class #14.
- Master Spec §33.4 DSAR (lines 27534–27549) — the "duplicate" DSAR surface.
- Master Spec §33.5 Compliance Frameworks (lines 27551–27558).
- Master Spec §33.9 Acceptance Criteria (line 27582).
- Master Spec §40.2 Data Retention & Deletion table (lines 30536–30574) end-to-end.
- Master Spec §45.1 Data Privacy (lines 31195–31202).
- Master Spec §51.7.3 (cited from §40.2 UsageDashboardSnapshot rows; not re-read end-to-end this prompt).
- Audit_Prompts.md → Prompt 3.5 (lines 1121–1152) and Defect Ledger Format (lines 49–68).
- _audit/FEATURE_INVENTORY.md rows F-172, F-173, F-174, F-175, F-176, F-177, F-182, F-503, F-593 (lines 187–192, 197, 521, 612).
- _audit/DEFECT_LEDGER.md row format and existing D-1V3-001 / D-1V3-003 / D-1V-008 / D-1V-012 entries (referenced inline below).

GDPR articles cross-referenced from external knowledge: Art. 12 (transparency, modalities), Art. 15 (right of access), Art. 16 (right to rectification), Art. 17 (right to erasure), Art. 18 (right to restriction of processing), Art. 20 (right to data portability), Art. 21 (right to object), Art. 22 (automated individual decision-making). CCPA cross-references: §1798.105 (right to delete), §1798.106 (right to correct), §1798.110 (right to know), §1798.115 (right to know about sales), §1798.120 (right to opt out of sale), §1798.130 (notice and disclosure), §1798.135 (DNS link).

## 2. Convention Walk Across §6.8

| Convention | Status | Notes |
| :---- | :---- | :---- |
| 1. Entity definition (DSARRequest) | ❌ | DSARRequest is a first-class persisted entity inferred from the ten field references in §6.8.6 (`verified_at`, `extension_reason`, `fulfilled_at`, `dsar_subject_acknowledged_at`, `dsar_partial_failure_notified_at`) plus the §40.2 retention precedent. No §4 field table exists. See D-3.5-002. |
| 2. Acceptance criteria | ⚠ | §6.8.4 (4 ACs), §6.8.4.1 (5 ACs), §6.8.5 (4 ACs), §6.8.6 (4 ACs) are numbered. §6.8.1 / §6.8.2 / §6.8.3 are prose-only — no observable / measurable AC blocks. See D-3.5-007. |
| 3. Enum registration (Appendix J) | ❌ | `dsar_cascade_worker_v1` not registered as an `audit_event_actor_type`; `pattern_a_fk_column_rewrite` and `pattern_b_fk_preservation_with_user_row_pseudonymization` not registered as a `redaction_path` enum; `dsar_request_status` / `dsar_request_kind` / `dsar_extension_reason_code` enums absent. See D-3.5-015. |
| 4. Glossary (Appendix K) | ⚠ | "DSAR", "Right to Erasure", "Right to Rectification", "Right to Portability", "Right to Restriction", "Audit-Integrity Exemption", "Pseudonymization", "Privacy Officer" — Appendix K canonical glossary cross-check not in this prompt's scope; "Privacy Officer" vs "DPO" terminology drift surfaced. See D-3.5-030. |
| 5. State machine | ❌ | DSARRequest lifecycle (received → verified → in-progress → fulfilled → escalated → extended → failed → notified) is referenced piecewise across §6.8.1 / §6.8.4 / §6.8.6 but no `From / To / Trigger / Conditions / Notes` table. See D-3.5-002. |
| 6. APIs (§32) | ❌ | No §32-style endpoint contract for DSAR submission, verification, status lookup, or fulfillment-confirmation. The "Settings → Privacy → Request Data Export" surface in §6.8.1 is a UI bullet, not an API contract. See D-3.5-020. |
| 7. Webhooks (§31) / events | ❌ | `dsar.cascade.row_redacted`, `dsar.cascade.long_tail_started`, `dsar.cascade.partial_failure`, `dsar.audit_integrity_exemption_invoked`, `dsar.audit_integrity_exemption_violation` AuditEvents and `dsar_sla_window_breached` PostHog event are referenced in §6.8 but never registered in Appendix C / Appendix G / Appendix J `audit_event_action_type`. See D-3.5-017. |
| 8. Plan gating | ⚠ | DSAR rights are universal; plan-gating not applicable to the right itself. But the `Anonymization Option` clause in §33.4 inline-attaches DSAR-anonymization to "Enterprise customers" which conflates an Org-tier feature with a subject right. See D-3.5-010. |
| 9. Retention & privacy | ⚠ | §6.8.5 row classes do not include DSARRequest itself; §40.2 has no DSARRequest retention row. See D-3.5-002, D-3.5-014. |
| 10. Numerical singletons | ❌ | §33.4 ("30-day response window"), §33.9 AC ("DSAR responses generated within 30 days"), §40.2 ("GDPR deletion request 30 days"), §6.8.4 line 9645 ("30 days from DSAR receipt"), §6.8.6 row ("< 30 calendar days") — the canonical home is §6.8.6, but §33.4 / §33.9 / §40.2 / §6.8.4 inline-restate. See D-3.5-009. |
| 11. Heading syntax | ⚠ | §6.8 / §6.8.4 / §6.8.4.1 / §6.8.5 / §6.8.6 carry anchor slugs. §6.8.1 / §6.8.2 / §6.8.3 lack `{#6.8.N-...}` anchors. See D-3.5-033. |
| 12. Surface/engine mapping (Appendix M) | ⚠ | DSAR engine concepts mapped at Appendix M.1 line 47052 ("Data Privacy (audit-integrity exemption) | §45.1, §6.8.5"). DSAR Cascade Walker, DSAR SLA Clock, DSAR Verification path, and DSAR API surface are not enumerated as Appendix M rows; defer to Phase V3 cross-check. |
| 13. Console firewall | ❌ | §6.8 silent on residency partitioning of the cascade walker, on cross-Org cascade scoping, and on buyer/seller console isolation during DSAR fulfillment. See D-3.5-006, D-3.5-021. |
| 14. Edge cases | ❌ | Verification failure, identity theft on DSAR, manifestly-unfounded request handling (Art. 12(5)), legal-hold collision with erasure (Art. 17(3)), automated-decision rights (Art. 22), third-party DSAR (subject named in Comment body but not Sourcera-account-holder), salt-rotation interaction with embedded JSON pseudonyms, KB-body PII embedding cascade — all silent or partial. See D-3.5-005, D-3.5-012, D-3.5-025, D-3.5-027, D-3.5-028, D-3.5-029, D-3.5-032. |

## 3. Six Required Article Checks (per Audit_Prompts.md Prompt 3.5)

### Check 1 — Article 15 (Right of Access / Export Path) per Data Class

**Verdict:** ⚠ partial.

§6.8.1 enumerates 12 export classes for the requesting user: profile, Bid Workspaces (where Owner or invited), Requirements/Use Cases/Scenarios/Responses authored or edited, Comments and Discussion, Scores submitted, Team memberships, Org membership record, Audit log entries (where actor), NDA records signed, Marketplace Listings created, Vendor Profile managed.

**Missing data classes** (per §4 entity walk and §40.2 cross-check):

- AIOperation rows authored or initiated by the subject (§4.8.1) — relevant because `actor_id`/`actor_type` carry subject attribution and the row is retained 7 years.
- SellerOnboardingSession (§4.4.22) — funnel-instrumented data class with `user_id`, `recipient_email_hash`, `seller_domain_hint`.
- GhostBidImport (§4.4.17) — seller-side `created_by` attribution.
- KBEntry (§22.3) — author attribution and content the subject created.
- VerificationReviewRecord (§4.4.21) — the subject's PII inside `documentation_refs`.
- ConsoleBridgeEvent (§4.7.1) — every cross-console event the subject authored or that carries their role-snapshot.
- OpsActionRecord (§4.4.27) — when the subject is a Sourcera Ops user.
- BuyerReferral (§4.3.16) — subject as `referrer_user_id` or `referee_email`.
- SellerSignal (§4.4.18) — subject's signal contributions (cohort-aware redaction required).
- EOI Acceptance Records (§4.5.8) — subject's acceptance attribution.
- Time-Saved Credit (§4.3.19) and Usage Event (§4.3.18) — subject's events.
- ContestRecord (§4.8.5) — `filed_by_user_id`.
- CommittedSpendContract (§4.8.8) — `signed_by_user_id`.
- MfaRecoveryCode (§4.2.7) and MFA factors (§6.2) — even if non-exportable, the export must explicitly state non-export.
- Tag Proposals, Disqualification rationales, Marketplace Abuse Reports — all carry `created_by`.

§6.8.1 also fails to declare the export schema, the JSON shape per entity, residency partitioning of the export bundle, and the encryption-at-rest contract for the staged export. Article 20 (portability) requires "structured, commonly used and machine-readable" — JSON satisfies, but the lack of a documented schema and CSV alternative for non-developer subjects is a regulatory gap.

**Defect filings:** D-3.5-007, D-3.5-024.

### Check 2 — Article 16 (Right to Rectification)

**Verdict:** ❌ silent.

§6.8 contains zero references to rectification. A subject has the right to correct inaccurate personal data (Art. 16). The spec describes Settings → Profile self-edit for the subject's own account but does not surface Article 16 as a discrete right, does not address rectification of derived data (Audit Event change records, Console Bridge Event payloads carrying frozen role-snapshots), does not address the rectification cascade across pseudonymized rows, does not declare rectification SLA, and does not expose a rectification API.

**Defect filing:** D-3.5-001.

### Check 3 — Article 17 (Right to Erasure / Delete vs. Anonymize per Data Class)

**Verdict:** ⚠ partial — anonymization-vs-delete partition is explicit for §6.8.4 cascade fan-out classes 1–5 and §6.8.5 row classes 1–15, but contradicts §4.8.1 AIOperation AC #12.

§6.8.4 fan-out classes (1 audit, 2 user-content, 3 identity-bearing, 4 pure-PII, 5 marketplace/signal) are exhaustive at the row-class level. §6.8.4.1 introduces Pattern A (FK rewrite, only on String(64)+ columns where User row is hard-deleted) vs. Pattern B (FK preservation with in-place User-row pseudonymization for UUID FK columns where User row is tombstoned), with a per-§4-entity assignment table.

**Internal contradiction (P0):** §6.8.4.1 line 9685–9688 prescribes Pattern B for §4.8.1 AIOperation `submitter_user_id` (UUID FK preservation). But §4.8.1 AC #12 (line 7982) prescribes scrub-`actor_id`. The §6.8.4.1 table cites a field name that does not exist on the §4.8.1 AIOperation entity (the actual field is `actor_id`, not `submitter_user_id`). Two consequences: (a) §6.8.4.1's per-entity assignment table is uncomputable, (b) two engineers reading §6.8.4.1 vs §4.8.1 will implement opposite cascades on a financial-record audit row.

**Defect filings:** D-3.5-003 (P0 contradiction), D-3.5-016 (P1 field-name mismatch).

### Check 4 — Article 18 (Right to Restriction of Processing)

**Verdict:** ❌ silent.

A subject has the right to request that the controller restrict processing of their data while a dispute is pending (Art. 18). §6.8 is silent. There is no `restricted_processing` state on User or DSARRequest, no restriction-mode entitlement gate at AIOperation creation (a restricted subject's data should not be processed by AI or Managed Agents), no UI surface, no API.

**Defect filing:** D-3.5-001.

### Check 5 — Article 20 (Right to Data Portability)

**Verdict:** ⚠ partial (folded into Article 15 export but underspecified).

§6.8.1 export delivers JSON with nested structure. Article 20 requires (a) structured, commonly used, machine-readable format and (b) the right to transmit the data to another controller. The JSON shape satisfies (a) at a low bar; (b) is unaddressed. No CSV alternative is offered for non-developer subjects. The schema is undocumented.

**Defect filings:** D-3.5-001, D-3.5-007.

### Check 6 — DSAR SLA Consistency Across §6.8 / §40 / §29 / §33.4

**Verdict:** ⚠ — §6.8.6 is the canonical home, but §33.4, §33.9, §40.2 row "GDPR deletion request", and §6.8.4 line 9645 inline-restate without citing.

§6.8.6 AC #2 declares: "Every §6.8 / §33.4 mention of the 30-day window MUST cite this table by §6.8.6 reference; new inline duplications fail CI gate `dsar_sla_single_source_of_truth`." But the existing §33.4 / §33.9 / §40.2 / §6.8.4 inline mentions are not retroactively cited. CI gate enforcement on existing rows would presumably fail.

Specific instances:
- §33.4 line 27536: "GDPR Compliance: 30-day response window."
- §33.9 line 27588: "DSAR responses generated within 30 days."
- §40.2 row line 30543: "GDPR deletion request | 30 days to process (Section 33.4)" — cites §33.4, not §6.8.6.
- §6.8.4 line 9645: "Cascade execution MUST complete within 30 days from DSAR receipt per GDPR Art. 12 §3" — within §6.8 but not citing §6.8.6.

**Defect filing:** D-3.5-009.

## 4. Reverse Pass — DSAR Erasure Simulated Against Every §4 Retention-Bearing Entity

For every §4 entity with retention rules in §40.2 and a User-attribution FK, I simulated DSAR erasure of the User and walked the referential / audit-integrity outcome.

| §4 entity | DSAR pattern declared | Simulated cascade outcome | Defect? |
| :---- | :---- | :---- | :---- |
| §4.2.3 User | Hard-delete tombstone | OK — Pattern B's source row | — |
| §4.3.4 Requirement | Pattern B (per §6.8.4.1 table) | OK — `created_by` UUID resolves to pseudonymized User | — |
| §4.3.5 Response | Pattern B | OK | — |
| §4.3.11 Internal Comment Thread | Pattern B | OK | — |
| §4.4.27 OpsActionRecord | Pattern B | OK | — |
| §4.6.1 Audit Event | Pattern B | OK post D-1V3-001 remediation | — |
| §4.6.3 OpsSession | Pattern B | OK | — |
| §4.6.4 OpsSessionApiRequestLink | Mixed (B for ops_session_id, A for request_entity_id) | Mixed; Pattern A applicability constraint requires User row hard-deleted, but §6.8.4.1 says Pattern B uses tombstone. The two patterns coexist on one row only when the FK target's tombstone-vs-hard-delete state differs across columns — verifiable but not asserted. | Forwarded — Phase V3 cross-check. |
| §4.7.1 Console Bridge Event | Pattern B (per §4.7.1.1) | OK; `payload_json` Pattern A inside JSON value applies. | — |
| §4.8.1 AIOperation | Per §6.8.4.1 → Pattern B on `submitter_user_id`. Per §4.8.1 AC #12 → scrub `actor_id`. | **CONTRADICTION** — §6.8.4.1 prescribes preserve-FK; §4.8.1 prescribes scrub. Field name mismatch (`submitter_user_id` vs `actor_id`). | **D-3.5-003 P0 + D-3.5-016 P1.** |
| §4.8.5 ContestRecord | Pattern B on `filed_by_user_id` | OK | — |
| §4.8.8 CommittedSpendContract | Pattern B on `signed_by_user_id` | OK | — |
| §4.8.12 MarketplaceDiscoveryRevenueRecord | Implicit Pattern B per §6.8.5 row #4 ("`accepter_user_id`"). The §6.8.4.1 table lists this entity under "All other §4 entities … Pattern B." | OK at Pattern level. Field-name verification: §4.8.12 actual field is `created_by` per §4.8.12 retention block (line 5733). `accepter_user_id` does not appear on §4.8.12. **Field-name mismatch in §6.8.5 row #4 too.** | **D-3.5-016 extension — same class as AIOp mismatch.** |
| §4.4.18 SellerSignal | §40.2 row says "DSAR on a contributing buyer triggers recompute within 24 hours; if recompute drops cohort <k, signal suppressed." | OK — the k-anon recompute path is in place. But §6.8.4 Class 5 ("Marketplace and signal projections... Cascade deletion of identity FKs; aggregated signal rows retained per §6.8.5") does NOT route the cascade walker through §4.4.18's recompute path. The two paths are not stitched. | **D-3.5-031 P2.** |
| §4.4.12 CategoryPage / §4.4.16 HeatMapCell / §4.4.15 MarketIntelligenceReport | k-anon-satisfied flag flips on cohort shrink. | OK at the entity level. §6.8.4 cascade walker is silent on triggering downstream k-anon recompute. | Folded into D-3.5-031. |
| §4.4.21 VerificationReviewRecord | §40.2 row addresses third-party DSAR via doc redaction. | Partial — §40.2 row is the only place this is authored; §6.8 has no general third-party-DSAR policy. | **D-3.5-027 P2.** |
| §4.4.22 SellerOnboardingSession | §40.2 row addresses DSAR. | OK at entity level. Not enumerated in §6.8.1 export. | Folded into D-3.5-024. |
| §4.3.16 BuyerReferral | §40.2 row exempts financial fields (§45.1). §6.8.5 row #11 covers ReferralRecord. | §45.1 body does NOT actually carve out a financial-record exemption clause; the exemption is documented in §6.8.5 row class 11 and the §40.2 retention rows. §45.1 inline reference is broken. | **D-3.5-014 forwarded; primary defect D-3.5-038 P1 reference broken.** |
| §22.3 KBEntry | KB-Entry-LEVEL hard-delete cascades to vector + BM25 in same transaction. | OK for KB-entry erasure. **User-DSAR cascade for KB-author** = Pattern B (preserve `created_by`, pseudonymize User). **Third-party DSAR cascade for KB-body PII** = silent. | **D-3.5-012 P1.** |
| §29.5 NotificationFailureAudit | §6.8.5 row #14 retention 7y. | Operational SLA-breach audit at 7y is overbroad without legitimate-interest justification. | **D-3.5-011 P1.** |
| §4.5.8 EOIAcceptanceRecord | §6.8.5 row #13 "Workspace-life + 180d". | Contract-defense retention typically requires statute-of-limitations alignment (UK ≥ 6y simple contract; CA discovery rules; some EU ≥ 30y for real-estate-style commitments). 180d is a marketing decision, not a defensibility decision. | **D-3.5-022 P1.** |

## 5. Special Cases (Prompt 3.5 Mandatory Coverage)

### 5.1 AIOperation Immutability vs. DSAR Erasure

**Status:** ❌ contradiction filed.

§4.8.1 line 7861 says: "GDPR right-to-erasure is satisfied via field-level redaction (PII fields scrubbed; monetary, capability, and provenance fields retained for SOC-2 audit)." AC #12 (line 7982): "DSAR redaction MUST scrub `actor_id`, `input_content_hash`, `output_content_hash`, `prompt_template_version`."

§6.8.4.1 per-entity table line 9688: "§4.8.1 AIOperation (`submitter_user_id`) | Pattern B | UUID FK; preserve target; aligned with §6.8.5 row class #3 financial-record exemption."

Three defects:
- (a) Field-name mismatch (`submitter_user_id` does not exist; field is `actor_id`).
- (b) Pattern contradiction (Pattern B preserves FK; AC #12 scrubs `actor_id`).
- (c) §6.8.5 row #3 redaction column says "Pseudonymization of `submitter_user_id`, `signed_by_user_id`, `accepter_user_id`; financial fields retained verbatim" — same field-name issue, plus "pseudonymization" is ambiguous between Pattern A (column rewrite) and Pattern B (preserve FK; pseudonymize User row).

**Filings:** D-3.5-003 P0, D-3.5-016 P1.

### 5.2 AuditEvent Immutability vs. Erasure

**Status:** ✅ closed by D-1V3-001 / D-1V3-003 remediation; Pattern B applied; field partition asserted by CI gate `audit_event_dsar_cascade_field_partition`.

Note for record: §4.6.1.1 line 7183 declares the non-FK column scrub set: `ip_address` zeroed, `user_agent` `[REDACTED_DSAR]`, `notes` filtered, `changes.<field>` PII filtered. This is consistent with §6.8.5 row #1.

**No new defect.** The pre-existing remediated D-1V3 family covers it.

### 5.3 KB-Derived Embeddings — Erasure Cascade to Vector Store

**Status:** ⚠ partial.

§22.3.1 line 15211: "DSAR right-to-erasure (§6.8) is satisfied by hard delete plus vector and BM25 index purge in the same Convex transaction." This addresses **KB-Entry-level erasure** (the KB row is being deleted; embeddings purged co-transactionally).

**Author-DSAR (subject is a KB entry author):** §6.8.4.1 prescribes Pattern B on KB Entry (per "All other §4 entities with User-id FKs in audit-integrity row classes per §6.8.5 | Pattern B | Default."). Pattern B preserves the `created_by` FK and pseudonymizes the User row. The KB entry body is unchanged. The embedding (over `[{kind}] {title}\n\n{body}`) does not encode author identity. **No cascade required.** OK.

**Third-party-DSAR (subject is a named individual mentioned in a KB entry body):** The body text encodes the subject's name in the dense vector. Pattern B / Pattern A do not apply (the subject is not a User entity). The §40.2 KB Entry retention row is silent on body-level redaction sweep on third-party DSAR. The §40.2 VerificationReviewRecord row addresses third-party DSAR for `documentation_refs`; KB Entry has no parallel.

**Filing:** D-3.5-012 P1.

### 5.4 Cross-Console Bridge Events — Erasure Cascades Both Sides

**Status:** ✅ closed by D-1V-012 remediation per §4.7.1.1.

§4.7.1.1 line 7689 declares Pattern B on `created_by` / `updated_by` UUID FKs and Pattern A inside `payload_json` for embedded user references. CI gate `bridge_event_dsar_cascade_field_partition` asserts the partition.

**Salt-rotation interaction:** §6.8.5 AC #3 says rotation MUST trigger re-pseudonymization of all retained rows touching the rotated user_id within 7 days. But the pseudonym embedded inline in `payload_json` (Pattern A inside JSON) is already a string-form `anonymized_<console>_user_<old_hash>`. On rotation, the User row's `email`/`full_name` are rewritten to the new hash, but the `payload_json`-embedded pseudonym remains the old hash. This produces inconsistent pseudonyms across the cascade.

**Filing:** D-3.5-032 P2.

### 5.5 Marketplace Discovery Aggregates — k-Anonymity Floor Post-Erasure

**Status:** ⚠ partial — entity-level recompute is wired (§4.4.12 line 5109; §4.4.18 line 30570; §4.4.16 line 5373); the §6.8 cascade walker contract does not invoke them.

§4.4.12 / §4.4.16 / §4.4.18 each declare a nightly recompute path: when a DSAR or opt-out drops a cohort below k, the dependent surface transitions to `pending_review`. This is correct at the entity level. But §6.8.4 Class 5 ("Marketplace and signal projections") only declares "Cascade deletion of identity FKs; aggregated signal rows retained per §6.8.5." It does not declare that the cascade worker triggers a synchronous-or-bounded-async k-anon recompute.

A staff engineer reading §6.8.4 alone would not know to wire the recompute trigger. A staff engineer reading §4.4.18 alone would assume the nightly sweep covers it (which leaves a 24-hour cohort-leak window during which the SellerSignal still exposes the (now-post-DSAR-shrunk) cohort).

**Filing:** D-3.5-031 P2.

## 6. Self-Challenge Pass

**Revision #1.** First pass classified D-3.5-001 (Articles 16/18/20/21 silence) as P1 on the theory that "missing feature" defaults to P1 unless production-blocking. Re-read of severity rule: "(c) violates a hard regulatory requirement (GDPR right-to-erasure, US/EU data-residency lock, audit-log integrity)" — Article 17 erasure is a hard regulatory requirement explicitly named in the P0 rule. Articles 16 and 18 are equally binding under GDPR; portability under Article 20 is the same statutory tier. Reclassified to P0. The CI gate `dsar_sla_single_source_of_truth` already exists; analogous Article-coverage gates do not. The Master Spec opens §6.8 line 9554 with: "Sourcera implements GDPR Article 15 (Right of Access), Article 17 (Right to Erasure), and related provisions" — explicitly enumerating only two of the seven applicable subject rights. A regulator audit would treat this as a non-compliance finding. P0 is correct.

**Revision #2.** First pass classified D-3.5-006 (residency-silent cascade) as P1. Re-read of severity rule: "(c) violates ... US/EU data-residency lock" — the DSAR cascade walker operating cross-region without explicit gating is a residency-lock violation. Reclassified to P0. The §4.6.1.1 line 7179 ("cross-region reads from customer surfaces blocked") implies application-layer gating on customer-facing reads, but the cascade worker is a system actor. Whether the cascade worker honors residency is unspecified. A US-region cascade worker reading EU rows during pseudonymization would emit an EU subject's PII (or its decoded predecessor) into US logs. P0.

**Revision #3.** First pass filed D-3.5-013 (CCPA / LGPD / UK-GDPR) as P0. Re-read: §33.5 declares "GDPR | DPA available | All plans. Sourcera is Data Processor." CCPA / LGPD are not mentioned. But the CCPA §1798.130(a)(2) citation in §6.8.6 line 9748 implies CCPA awareness — the spec is partially CCPA-aware but never enumerates CCPA-specific subject rights (right to know about sales of personal information, right to opt out of sale, right to non-discrimination, right to limit use of sensitive personal information). For US enterprise sellers in California, CCPA non-coverage would block deployment. But CCPA is a US-state law, not the Article 8 hard-blocker class. Reclassified to P1. Note: the CCPA §1798.130(a)(2) citation in §6.8.6 is the only CCPA mention in the entire spec — a one-citation acknowledgment is not a CCPA implementation.

## 7. Counterfactual Pass — Three+ Failure Modes per Feature

Per Audit_Prompts.md mandate ("For every feature audited, enumerate at least three realistic failure modes the spec must handle"):

**F-172 Right of Access:**
1. Subject submits export, link expires before download (§6.8.1 says 7 days, no re-issue path). **Spec partial.**
2. Subject's export bundle exceeds storage quota at staging. **Silent.** Filing folded into D-3.5-007.
3. Subject's account suspended mid-export — does export complete? **Silent.** Filing folded into D-3.5-024.

**F-173 Right to Erasure on Deprovisioning:**
1. Deprovisioning + active legal hold collide (Art. 17(3)(e) carve-out). **Partial — §6.8.5 covers via audit-integrity but no legal-hold explicit state.**
2. Deprovisioning during in-flight AIOperation. **Spec partial — §4.8.1 Failure Mode #8 covers.**
3. Deprovisioning with subject as Workspace Owner — ownership transfer race. **Spec covers — §6.9 reassigns to Workspace Admin or default.** ⚠ But §6.9 doesn't exist (D-3.5-004).

**F-174 Right to Erasure on Account Closure:**
1. 30-day reflection period — subject re-requests within window. **Silent.**
2. Subject closes account; Org Admin re-creates account with same email. **Silent.**
3. Cross-Org cascade (subject in 4 Orgs) — does account closure cascade to all? **Silent.** D-3.5-021.

**F-175 DSAR Cascade:**
1. Cascade fan-out > 50K rows — long-tail alert is wired (§6.8.4 line 9645). **OK.**
2. Cascade encounters in-flight ContestRecord (§4.8.5) — frozen state. **§4.8.1 Failure Mode #8 covers (HTTP 423 during contest).** OK.
3. Cascade walker concurrent re-run — idempotency (§6.8.4 AC #3). **OK at row level.**
4. Cascade salt-rotation mid-run. **Silent.** D-3.5-032.

**F-176 Audit-Integrity Exemption:**
1. Subject claims exemption is overbroad (e.g., 7y on NotificationFailureAudit). **Silent on subject-objection path.** D-3.5-011.
2. Subject DSAR re-runs against re-pseudonymized rows. **Partial — Pattern B no-op idempotency.** OK.
3. OutcomeContract retained "Life-of-platform" (§6.8.5 row 9). **No sunset path.** D-3.5-014.

**F-177 DSAR Operational SLA:**
1. Verification fails (subject can't prove identity). **Silent.** D-3.5-005.
2. Manifestly-unfounded request flood. **Silent.** D-3.5-028.
3. Long-tail cascade exceeds 30d. **§6.8.6 row "extension trigger up to +60d" covers; AC #1 enforces ceiling at 90d.** OK.

## 8. Defect Promotion to Ledger

The 38 promotions below are appended to `/Sourcera/_audit/DEFECT_LEDGER.md`. IDs `D-3.5-001` through `D-3.5-038`.

(Severity counts: 6 P0 / 19 P1 / 10 P2 / 3 P3.)

## 9. Coverage Matrix Tightenings (forwarded to matrix update)

Cells tightened on rows F-172 (Right of Access), F-173 (Erasure on Deprovisioning), F-174 (Erasure on Account Closure), F-175 (DSAR Cascade), F-176 (Audit-Integrity Exemption), F-177 (DSAR Operational SLA), F-503 (DSAR §33.4 surface).

Per `Audit_Prompts.md → Coverage Matrix Format` and the existing per-row tightening template established in Phase 1.1.
