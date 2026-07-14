# PHASE 9 FINDINGS — Scratch Log

**Prompt:** 9.2 — DSAR / Right-to-Erasure Compatibility (re-cross §6.8) — Cross-Cascade Integrity walk
**Run date:** 2026-05-08
**Auditor:** Opus, Sourcera SWE mode
**Mode:** Non-destructive audit. No edits to `Sourcera_Master_Spec.md`.

**ID convention.** Defects in this prompt are appended to `DEFECT_LEDGER.md` as `D-9.2-001` … `D-9.2-011`. (Prompt 9.1 was double-claimed by an earlier session; the §40.2 retention sub-prompt was renumbered to `D-9.1R-NNN` per the immutable-id rule. Prompt 9.2 takes the next sequential namespace.)

---

## Sources Read End-to-End

| Source | Lines | Purpose |
|---|---|---|
| Master Spec §6.8 | 10167–10598 | All sub-sections: §6.8 preamble, §6.8.1–§6.8.11 + §6.8.4.1 + §6.8.4.2 + §6.8.6.1 + §6.8.6.2. |
| Master Spec §4.7.1 + §4.7.1.1 | 7783–7998 | Console Bridge Event scope isolation, redaction matrix, retention class table, DSAR cascade contract. |
| Master Spec §4.8.1 | 8142–8290 | AIOperation entity, retention prose (line 8257), AC #12 DSAR redaction prescription (line 8287), settlement-freeze carveouts. |
| Master Spec §4.4.12 / §4.4.15 / §4.4.16 / §4.4.18 | 5210–5740 | k-anonymity floors and post-publication recompute paths for CategoryPage / MarketIntelligenceReport / HeatMapCell / SellerSignal. |
| Master Spec §4.6.1 / §4.6.5 | 7099–7780 | AuditEvent and DSARRequest entities. |
| Master Spec §47 | 32763–32830 | Confirmed: §47 is "Specification Versioning, Change Management, Known Limitations." Contains no User-entity replication contract. (Used to check the §6.8.4.2 "global User entity is replicated cross-region per §47" citation.) |
| Master Spec §40.2 / §6.7 | (per Phase_RETENTION_FINDINGS prior pass) | Retention table + audit-event hash chain — context only; not re-walked. |
| `_audit/PHASE3.5_FINDINGS.md` | full | V3 Privacy / DSAR remediation findings to avoid duplicate filings. |
| `_audit/PHASE_RETENTION_FINDINGS.md` | full | Retention findings to avoid duplicate filings. |
| `_audit/DEFECT_LEDGER.md` | grep §6.8 / DSAR / cascade | Open defect inventory. |
| `Audit_Prompts.md → Prompt 9.2` | 2135–2155 | Prompt scope. |

## Method

Walked §6.8 end-to-end against the four prompt CHECKS, then ran the audit checklist convention sweep on the cascade contract (entity completeness, AC testability, state-machine fidelity, idempotency, residency, SLA chaining). Adversarial pass: assumed a hostile reviewer constructs partial-failure, residency-mismatch, salt-rotation-after-redaction, and body-text-PII scenarios. Self-challenge and counterfactual passes documented at the foot.

---

## Findings by Check

### CHECK 1 — For every entity, the DSAR cascade is testable

**Verdict:** ⚠ partial.

The §6.8.4 cascade fan-out class taxonomy enumerates only 5 classes and names ~25 specific entity types (AuditEvent, OpsActionRecord, BillingLedgerEntry, AIOperation, ContestRecord, CommittedSpendContract, MarketplaceDiscoveryRevenueRecord, KBExportLifecycleAudit · Comment, InternalCommentPost, InternalCommentMention, KBEntry, RequirementVersion, ScoringSubmission, Q&A posts · User, Membership, GuestInvite, AuthorityAttestation, VendorOptOutAuthorityAttestation · preferences, avatar URL, MFA factors, recovery codes, draft autosave content · SellerSignalDeAnonymizationLink, EOIAcceptanceRecord, Direct-Invite offers).

§4 contains far more entities carrying User-attribution FKs than the 25-entity catalog above (Disqualification Record, KBExportJob, ContestRecord, CommittedSpendContract, OpsSession, OpsSessionApiRequestLink, OnboardingAntiPatternExceptionGrant, ConsentLedger, BuyerReferral, Time-Saved Credit, NotificationFailureAudit, Bid Workspace, Pulse Event, Selection Report Draft, Intelligence Cache Entry, etc.). §6.8.4.1 closes part of the gap with a per-entity Pattern A/B assignment table, but that table is itself partial (~12 entities) and ends with a default catch-all "All other §4 entities with User-id FKs in audit-integrity row classes per §6.8.5 | Pattern B | Default" — which is not a testable contract.

**Cross-Console Bridge Event (§4.7.1) is the most striking omission**: it is named in the §6.8.4.1 Pattern B per-entity assignment table AND in §4.7.1.1 (its own DSAR cascade clause) but is NOT named in any of the five §6.8.4 cascade fan-out classes. The cascade walker therefore has a Pattern assignment but no class assignment — meaning it has a redaction mechanism (Pattern B) but no class-level retention/exemption rule (the §6.8.4 classes are what the walker keys on to decide hard-delete vs. pseudonymize-and-retain). The §4.7.1.1 retention-class table fills this in implicitly via `bridge_event_financial_class` / `bridge_event_operational_class`, but those classes are §4.7.1.1-local; they are not registered as a §6.8.4 fan-out class.

§6.8.4 AC #1 mandates an "exhaustive cascade plan (`dsar_cascade_plan`) before any mutation, listing every row class to be touched, the chosen redaction path per class, and an estimated completion time." There is no CI gate that asserts the plan's completeness against §4 — the plan generator could omit any §4 entity not enumerated in the §6.8.4 / §6.8.4.1 tables and the spec would not catch it. Filed as **D-9.2-001 P1**.

§6.8.4 AC #3 mandates idempotency: "Cascade is idempotent — re-running the same DSAR plan against an already-redacted set MUST be a no-op." But the cascade contains no per-row redaction marker (no `last_dsar_redaction_at`, no `dsar_redacted_under_request_id` column on any of the cascade-target entities). Forward-recovery on partial failure (AC #4) requires the cascade to detect "already redacted." The only marker available is the User-row's `state = tombstoned_dsar` (per §6.8.4.1) — but the walker has to walk every FK-referencing entity to reach that conclusion, which is unbounded work on every retry. §4.7.1.1 recomputes `redaction_verification_hash` post-cascade but the hash change is observable only after a successful redaction, not before. Filed as **D-9.2-002 P1**.

### CHECK 2 — For every immutable entity (AIOperation, AuditEvent), the anonymization path is spec'd

**Verdict:** ✅ AIOperation; ✅ AuditEvent at the FK level. ⚠ on residency-cross-region for both.

**AIOperation (§4.8.1).** Pattern B applies to `actor_id` when `actor_type ∈ {user, ops}`; no-op when `actor_type ∈ {managed_agent, system}`. Non-FK content-encoding columns (`input_content_hash`, `output_content_hash`, `prompt_template_version`) are scrubbed per §6.8.5 row class #3 / §4.8.1 AC #12. Financial fields preserved verbatim. Pseudonymization scheme is the canonical `anonymized_<console>_user_<base32(hash)[:16]>`. CI gate `dsar_cascade_pseudonym_pattern_consistency` asserts Pattern B membership. **Field partition is exhaustive and testable.**

Minor: scrubbing `prompt_template_version` (a versioned template id like `"v3.7"`) adds zero privacy benefit (the template is a deterministic capability-level identifier, not subject content) and removes forensic continuity (post-DSAR, an AIOperation cannot be replayed against the original prompt template for forensic purposes). The list is consistent across §4.8.1 AC #12 and §6.8.5 row #3, so it is internally coherent — but the choice is questionable on first principles. Not filed as a defect (judgment call, P3 ambiguity).

**AuditEvent (§4.6.1).** Pattern B on `user_id` per §6.8.4.1 row; payload body retained verbatim per §6.8.5 row class #1. **OK.** Cross-cutting retention conflict between §6.8.5 row #1 ("7 years from row create") and §4.6.1 plan-tier retention (30d Free / 30d Solo / 1y Starter / 1y Growth / 3y Scale / 7y Enterprise) is an existing P1 retention defect already filed by Phase_RETENTION (D-RET-002 / D-RET-015) — not duplicated here.

**Cross-region for both.** §6.8.4.2 forks the cascade walker per residency region and blocks cross-region row joins. §6.8.4.2 cites "the global User entity is replicated cross-region per §47" — but **§47 (Specification Versioning, Change Management, Known Limitations) contains no User-entity replication contract**. §47.4 is two sentences on data residency current+phase-2; it does not describe how the global User entity replicates or how Pattern B's User-row pseudonymization propagates across replicas. The walker is told to "honor the partition" without being told how the global User row is partitioned (it is not). For an AIOperation in `eu` region with an `actor_id` resolving to a global User row, Pattern B requires writing to the User row — is that write a cross-region operation? Is it permitted under the §6.8.4.2 isolation rule? Spec is silent. Filed as **D-9.2-003 P1**.

§6.8.5 AC #3 says "rotation MUST trigger re-pseudonymization of all retained rows touching the rotated user_id within 7 days." But for retained rows that include AIOperation `input_content_hash` / `output_content_hash`, the post-rotation re-pseudonymization is a HASH ROTATION, not a re-derivation of the original content (which is scrubbed). This works for the User-FK side (Pattern B re-pseudonymizes the User row) but the per-row hash-scrub side is a one-shot — re-pseudonymization on salt rotation has no source data left to recompute against. The spec is mute on whether the post-scrub hash is itself re-rotated. Filed as **D-9.2-004 P2**.

§6.8.4 AC #3 idempotency conflicts with §6.8.5 AC #3 salt rotation. After a salt rotation between cascade run 1 and cascade run 2, the User-row pseudonym changes (per §6.8.5 AC #3 within 7 days). Re-running the same DSAR plan at run 2 is **not** a no-op at the User-row level — the pseudonym now reads to a different `<base32(hash)[:16]>` value. Filed as **D-9.2-005 P1** (paired with D-9.2-002 forward-recovery markers).

### CHECK 3 — k-anonymity floor protects against re-identification post-erasure

**Verdict:** ❌ failing.

**Marketplace aggregates broken-citation chain.** §6.8.4 fan-out Class 5 says "Marketplace and signal projections (SellerSignal de-anonymization links, EOI Acceptance Records, Direct-Invite offers). Cascade deletion of identity FKs; aggregated signal rows retained per §6.8.5." But §6.8.5 row classes 1–15 enumerate row #10 SellerSignalDeAnonymizationLink and row #13 EOIAcceptanceRecord ONLY. §6.8.5 has **no row** for the aggregated SellerSignal entity, CategoryPage, HeatMapCell, or MarketIntelligenceReport. The §6.8.4 instruction to "retain per §6.8.5" routes to a target that does not exist. Filed as **D-9.2-006 P1**.

**k-anon recompute trigger is unwired.** §4.4.18 SellerSignal documents a 24-hour nightly recompute that suppresses cells dropping below `k_anon_floor` due to DSAR. §4.4.12 / §4.4.15 / §4.4.16 carry parallel recompute paths. **None of these recompute paths is named in §6.8.4** as part of the cascade. The cascade "deletes identity FKs" and emits `dsar.cascade.row_redacted`, but does not call out the marketplace-aggregate recompute. A staff engineer reading §6.8.4 alone would not know to wire a recompute trigger; reading §4.4.18 alone, they would assume the nightly sweep covers it (which leaves a 24-hour cohort-leak window during which the seller's surface still exposes the now-post-DSAR-shrunk cohort). Phase 3.5 D-3.5-031 already filed P2 on this. **The current finding sharpens the framing: the broken citation in §6.8.4 Class 5 ("retained per §6.8.5") is the structural root cause, and the 24-hour leak window is the GDPR Art. 17 right-to-erasure compliance gap.** Forward-linked to D-3.5-031; filed independently as **D-9.2-007 P0** because the right-to-erasure gap is a regulatory blocker.

**k-anonymity floor is inline-distributed.** k=5 (CategoryPage line 5253; SellerSignal line 5668), k=10 (HeatMapCell line 5533; SellerSignal effective default line 5670), k=20 (MarketIntelligenceReport line 5468; SellerSignal de-anonymization-related line 5670). There is no §39 (Object Size Constraints) row authoritatively home for these floors. Authoring Convention #10 violation — every numerical singleton has exactly one authoritative home. The five inline restatements all cite "Summary §3.5" (a retired source). Filed as **D-9.2-008 P1**.

**Bridge-event body text re-identification.** §4.7.1.1 DSAR cascade walks the kind-specific `Fields CARRIED` list "for every field carrying a User reference … filter for occurrences where the value equals the subject's identifier (id, email, role-snapshot composite) and pseudonymize in-place." Free-text content fields — `payload_json.title`, `payload_json.description`, `payload_json.body` (Q&A), `payload_json.amendment_diff_summary`, `payload_json.reason_snippet` — are NOT body-scanned for embedded subject names/emails. A buyer User who authored a Q&A post body of the form "I am Jane Doe, the Procurement Lead at Acme Corp" leaves that text intact in the seller-side bridge-event cache post-DSAR. Compare to §22.3.1 third-party body-redaction sweep (D-3.5-012 V3 remediation) which authors a body-scan on the seller's KB content but NOT on buyer-emitted bridge events. Filed as **D-9.2-009 P0** — GDPR Art. 17 right-to-erasure not satisfied for body-embedded PII; PII is preserved on the cross-firewall surface (the seller console) post-DSAR.

### CHECK 4 — SLA compliance: DSAR completes within statutory window

**Verdict:** ⚠ partial.

**Cumulative receipt-to-fulfillment clock.** GDPR Art. 12(3) says "without undue delay and in any event within one month of receipt of the request." Sourcera's clock starts at `verified_at`, with §6.8.6.1 giving up to 7 calendar days for verification and §6.8.6 giving 30 calendar days from `verified_at` for fulfillment. The cumulative ceiling from receipt is 7 + 30 = 37 days; with the +60 extension, 7 + 30 + 60 = 97 days. The statutory ceiling from receipt is 90 days (30 + 60). Art. 12(6) authorizes verification-pause, but most DPA guidance reads this as the controller's burden of proof on what "without undue delay" means — not as a free 7-day extension stacked on top of the 90-day statutory ceiling. The choice to start the SLA clock at `verified_at` rather than `received_at` is a regulatory interpretation that requires legal sign-off; Phase 3.5 D-3.5-005 authored the verification protocol but did not surface this clock-start choice as legally non-trivial. Filed as **D-9.2-010 P1**.

**Partial-failure pause has no Ops SLA.** §6.8.4 AC #4 reads: "partial-redaction failures emit `dsar.cascade.partial_failure` and pause the worker for Ops review; the partially-completed redactions are NOT rolled back (forward-recovery only — backwards rollback would re-expose PII)." §6.8.6 SLA row says "Cascade fan-out completion (per §6.8.4) | < 30 calendar days OR within the §6.8.4 partial-failure procedure timeline if `dsar.cascade.partial_failure` triggered." **The "§6.8.4 partial-failure procedure timeline" is not authored anywhere** — §6.8.4 names the pause but provides no time bound on Ops review nor a procedure for cascade resume. A paused cascade can exceed the 30-day statutory window indefinitely. Filed as **D-9.2-011 P0** — direct GDPR Art. 12(3) breach vector.

**Mid-cascade residency change DPO approval has no SLA.** §6.8.4.2 AC #2: "A `data_residency_region` change mid-cascade MUST pause the cascade and require DPO approval before resume." DPO approval has no SLA; the approval can stretch the cascade beyond the 30-day window. (Folded into the same D-9.2-011 root cause — both are "open-ended pause defeats the SLA.")

**Manifestly-unfounded rejection appeal SLA.** §6.8.6.2 says "Subject MUST be notified of adjudication outcome with appeal path; appeal must be filed within 30 calendar days." The controller's adjudication SLA on the appeal itself is undefined. A subject who appeals could be left in `manifestly_unfounded_rejected` indefinitely while the appeal sits unreviewed. Filed as **D-9.2-012 P2**.

---

## Self-Challenge Pass (Opus-mandatory)

Re-read every defect as a hostile reviewer.

- **D-9.2-001 cascade-plan completeness.** Hostile review: "the §6.8.4.1 catch-all `Pattern B | Default` covers everything, so the plan generator can apply Pattern B to all User-FK columns it discovers via reflection." Counter: Pattern B is a *redaction mechanism*; it does not assign a *retention class*. The class is what determines whether the row is retained per §6.8.5 or deleted per §6.8.4 Class 4. An entity assigned Pattern B by the catch-all but with NO §6.8.5 row OR Class assignment has undefined retention behavior — the cascade walker has no contract. P1 stands.
- **D-9.2-002 / D-9.2-005 idempotency.** Hostile review: "the cascade can detect already-redacted rows by checking `users.state = tombstoned_dsar` — that's a single per-User-row read, not a per-cascade-target read." Counter: that detects only the source-User pseudonymization, not the per-row work the cascade performed (e.g., `payload_json` body pseudonymization on the matched-row set, `redaction_verification_hash` recompute on bridge events, `dsar.cascade.row_redacted` audit emission). The walker still has to walk every row to know what was already done. P1 stands. D-9.2-005 stronger: salt rotation breaks the User-row state guard too (the pseudonym changes), so the no-op contract breaks at the most-cited check. P1 stands.
- **D-9.2-003 cross-region citation.** Hostile review: "§47 mentioning data residency is sufficient; the implementer can infer." Counter: §47 has nothing on User-entity replication. §6.8.4.2's cited evidence is missing. The walker is given a contract ("global User entity is replicated per §47") that §47 does not back. A junior engineer would be unable to implement. P1 stands.
- **D-9.2-006 Class 5 broken citation.** Hostile review: "the SellerSignalDeAnonymizationLink row #10 covers it." Counter: row #10 covers the de-anonymization-LINK table, not the aggregated SellerSignal cell. The two are different entities with different retention classes. The cascade Class 5 says "aggregated signal rows" (plural; aggregates) — that's CategoryPage / HeatMapCell / MarketIntelligenceReport / aggregated SellerSignal — none of which has a §6.8.5 row. P1 stands.
- **D-9.2-007 k-anon recompute.** Hostile review: "the 24-hour nightly sweep is a reasonable trade-off; the SLA is 30 days, so 24 hours is well inside." Counter: the GDPR Art. 17 right "without undue delay" is independent of the 30-day fulfillment ceiling; an enforced 24-hour PII persistence on the cross-firewall surface (seller console) after the cascade has emitted `dsar.cascade.row_redacted` is a cross-console PII leak — exactly the firewall integrity contract that defines P0. **Roll up from P1 to P0** on adversarial review. P0.
- **D-9.2-009 body-text PII.** Hostile review: "buyers don't include their personal name in Requirement titles — the realistic threat surface is bounded." Counter: Q&A post bodies are buyer-User-authored free text; users routinely identify themselves by name in Q&A ("Hi, I'm Jane from procurement, can you clarify…"). §22.3.1 explicitly authors a body-redaction sweep on the seller side; the lack of a buyer-side mirror is structural. P0 stands.
- **D-9.2-010 cumulative clock.** Hostile review: "Art. 12(6) is broad; verification-pause is widely accepted by DPAs." Counter: the pause is accepted only when verification is genuinely required (Art. 12(6) requires "reasonable doubts concerning the identity of the natural person making the request"). The §6.8.6.1 protocol applies the 7-day SLA to *every* DSAR including `signed_in_session` (where verification is < 60 seconds). Stacking 7 days on top of every DSAR is not what Art. 12(6) authorizes. Roll P1 → consider P0; held at P1 because the regulatory interpretation is genuinely contested and requires Privacy Officer + legal sign-off, not a self-evident statutory breach. P1 stands.
- **D-9.2-011 partial-failure timeline.** Hostile review: "30-day SLA still applies in absence of named timeline; Ops will resolve within the SLA." Counter: §6.8.6 SLA row explicitly carves out the partial-failure path (`OR within the §6.8.4 partial-failure procedure timeline`) — meaning the 30-day SLA does NOT apply once the partial-failure flag is set. Without an authored timeline, the cascade is GDPR-uncovered. P0 stands.
- **D-9.2-012 appeal SLA.** Hostile review: "Privacy Officer review is implicit best-effort; reasonable practice is < 30 days." Counter: the spec is silent and the appeal is a regulatory right (lodging-with-supervisory-authority right per §6.8.6.2 carries from un-resolved appeal). Without an authored SLA, a hostile internal actor could throttle appeals indefinitely. P2 stands (ambiguity, not regulatory blocker, because the supervisory-authority complaint right gives the subject a parallel external path).

Severity revisions: D-9.2-007 promoted P1 → **P0**.

## Counterfactual Pass (3+ realistic failure modes per defect)

Spot-check on the highest-stakes defects.

**D-9.2-007 (k-anon recompute unwired).**
1. *Partial failure.* DSAR cascade emits `dsar.cascade.row_redacted` on the User-FK side; nightly k-anon sweeper fails (Convex outage). The seller surface continues to render the now-below-floor cohort indefinitely. Spec does not address.
2. *Adversarial input.* A coordinated buyer-Org cohort issues simultaneous DSARs to drive a competitor's SellerSignal cohort below floor. The 24-hour window between cascade-completion and recompute-effective lets the seller observe the cohort shrink in near-real-time — a side-channel revealing buyer-Org churn. Spec does not address.
3. *Dependency outage.* Anthropic outage delays SellerSignal recompute (recompute uses the `category_inference` capability per §4.4.18). Cohort-leak window extends from 24 hours to multi-day. Spec does not address.

→ Counterfactual confirms D-9.2-007 P0.

**D-9.2-009 (body-text PII).**
1. *Partial failure.* Cascade pseudonymizes `created_by` per Pattern B but leaves `payload_json.body` containing "I'm Jane Doe at Acme" unchanged. The seller's Bid Workspace renders the original body. Subject's name visible post-DSAR.
2. *Adversarial input.* A buyer User issues DSAR after deliberately seeding a Q&A body with identifying text to test the cascade. Body persists in seller console; buyer files supervisory-authority complaint with screenshot evidence. P0 regulatory exposure.
3. *Dependency outage.* PII detector (§48.4.4 content validators) is offline at DSAR cascade time. Cascade completes without body scan; no Ops alert because body-scan was never wired into the cascade.

→ Counterfactual confirms D-9.2-009 P0.

**D-9.2-011 (partial-failure timeline undefined).**
1. *Partial failure.* Cascade fails on row 4,832 of 50,000 due to a transient Convex error. Worker pauses; partial-failure event emitted. Ops on-call is paged but no SLA exists for resume; in practice Ops triages within a week, but the spec contract is open-ended. SLA breach unrecoverable: cascade cannot complete in 30 days because pause-duration counts.
2. *Adversarial input.* Adversary (insider or compromised credential) deliberately injects a per-row failure (e.g., malformed row in the cascade target set) to trigger the pause. Cascade is permanently paused pending Ops review. Subject's data sits half-redacted past statutory ceiling.
3. *Dependency outage.* Anthropic / Convex / Firecrawl outage during the cascade triggers `partial_failure`; pause holds; outage extends multi-day; no fallback procedure. Statutory ceiling breaches; subject can lodge supervisory-authority complaint.

→ Counterfactual confirms D-9.2-011 P0.

**D-9.2-001 (cascade-plan completeness).**
1. *Partial failure.* Plan generator omits §4.4.27 OnboardingAntiPatternExceptionGrant (carries `granted_by_user_id`, `revert_by_user_id`, `quorum_signoff_user_ids` per §4.4.23 line 6398). DSAR cascade misses the entity. Subject's identity persists in the entity post-DSAR. No CI gate catches.
2. *Adversarial input.* New §4 entity added in v7.1.1 carrying a User FK. Author forgets to register in §6.8.4 / §6.8.4.1. Plan generator silently misses it. Inventory-coverage CI gate does not exist.
3. *Dependency outage.* Plan generator reads §4 entity inventory from a stale cache; cascade misses recently-added entities. No staleness check.

→ Counterfactual confirms D-9.2-001 P1.

---

## Promotion to DEFECT_LEDGER.md

Twelve defects promoted as `D-9.2-001` … `D-9.2-012`. See ledger rows.

## Closing notes

- **Phase 3.5 V3 already remediated the structural skeleton (DSARRequest entity, verification protocol, manifestly-unfounded path, cascade pseudonymization Pattern A/B, cascade residency partition, AE-3.5-001 through AE-3.5-006).** The remaining cross-cascade integrity defects are all *contract-completeness* class — gaps in the wiring between named primitives, not missing primitives. Resolution path is mostly sub-section authoring rather than new structural work.
- **Forward references.** D-9.2-001, D-9.2-006 link to Phase 14.13 / v7.1.1 backlog (§6.8.4 Class taxonomy completion + §6.8.5 row class extension to cover marketplace aggregates). D-9.2-007 / D-9.2-009 link to Phase 9.3 (right-to-erasure compatibility forward-walk) when authored. D-9.2-008 links to §39 Object Size Constraints amendment (k-anon floor consolidation). D-9.2-010 / D-9.2-011 link to Privacy Officer + legal sign-off queue.
- **AE Ledger touch points.** D-9.2-006 / D-9.2-007 / D-9.2-009 remediations would each be Authored Extensions (new §6.8.4 sub-sections / new §6.8.5 rows / new buyer-side body-redaction sweep). All require Privacy Officer + Engineering sign-off before v7.1.1 stamp.
- **No edits to `Sourcera_Master_Spec.md`** in this prompt (per Audit Mode non-destructive policy).
