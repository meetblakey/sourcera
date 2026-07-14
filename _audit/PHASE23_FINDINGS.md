# Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §23. Confirm bid workspace lifecycle, response item schema, Console Bridge sync semantics (cross-reference §4.7 + §25), draft state, submission state, post-submission edits, withdrawal, disqualification, plan-gating.
**Status:** Findings promoted to `DEFECT_LEDGER.md → Phase 23` section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §23.1 Bid Workspace Overview (lines 19362–19377), §23.2 Response Lock & Concurrency Control (19379–19397), §23.3 Response Submission (19399–19418), §23.4 Vendor Voluntary Withdrawal (19420–19433), §23.5 Acceptance Criteria (19435–19444).
- §4.4.1 Bid Workspace entity (4569–4602) — full field table, residency tie-break, indexes, role assignment paragraph (D-1V-007 remediation, V3+ AE-3V-002 cross-reference).
- §4.4.2 Bid Response entity (4603–4634) — full field table, indexes, retention, residency, state-machine interaction with §25.5.
- §4.7.1 Console Bridge Event (7723–7937) — full schema, scope isolation, row-level seller projection (D-1.6-001 remediation), per-event-kind redaction matrix, state machine, retry curve, DSAR cascade (D-1V-012).
- §4.7.2 Vendor Disqualification Record pointer + reference paragraphs (7939–onward).
- §25.1.1 Directional Surface Inventory (19553–19577), §25.1.2 Entity-Level Redaction Rules (19579–19623), §25.1.3 Allow-List Evolution.
- §25.2.1 Bounded-Lag SLO (19625–19653), §25.2.2 Retry Curve, §25.2.3 Dual-Surface Failure Visibility, §25.2.4 Daily Reconciliation Job, §25.2.5 User Notification on Persistent Failure, §25.2.6 Kill-Switch Notification Suppression (19694–19705).
- §25.3 Disqualification mainline (19707–20491) — used as the gold-standard fidelity precedent for §23.4 Withdrawal authoring gap analysis.
- §25.5 Materialization Protocol (20510–20651) — §25.5.2 target state per event kind, §25.5.4 `needs_reverification` field, §25.5.5 conflict handling, §25.5.6 failure modes, §25.5.7 observability, §25.5.8 enum/error code additions.
- Appendix D Response Status State Machine (41869–41897).
- Appendix E Workspace & Bid Workspace Status State Machine (41901–41970), including the §25.3.15 extension rows.
- §31.9.8.5 CRM Sync `bid_workspace_submitted` (26079–26101) — CRM-trigger, not a §31 platform webhook.
- Targeted reads of §1.3.2 Dual-Console Firewall, §5.5 Seller-side roles + §4.4.1 paragraph at 4594–4601 (per-bid-workspace role assignment).

## Cross-Reference Walk — Per-Check Results

### Check 1: Bid Workspace lifecycle — §23.1 vs §4.4.1 vs Appendix E

**Result:** Three-way enum drift on `bid_workspace.status`; entity field table at §23.1 is non-canonical; single-owner contradiction with multi-team model.

§23.1 lists the status enum as `invited, nda_pending, nda_signed, active, submitted, disqualified, withdrawn, canceled`. §4.4.1 (canonical entity) lists `draft, active, submitted, won, lost`. Appendix E (canonical state machine, post-§25.3.15 extension) lists `draft, active, submitted, closed, disqualified` — no `won`, `lost`, `invited`, `nda_pending`, `nda_signed`, `withdrawn`, or `canceled`. Reader cannot reconcile; junior engineer would build one of three at random. → **D-23-001** filed.

§23.4's "Bid Workspace status → `withdrawn`" transition has no Appendix-E row; Appendix E `submitted → withdrawn` is unbuildable. (Target Account state machine has `withdrawn`, but Target Account is a different entity.) → **D-23-002** filed.

§23.1 field table has 6 columns under `Field | Type | Notes` (no Constraints) and omits id, org_id, console enum, name, description, data_residency_region, owner_id (replaced with `bid_owner_id`), team_ids, created_at, updated_at, created_by, updated_by, deleted_at, scope isolation, indexes, retention. §4.4.1 has all of these per Master Spec §4 conventions. → **D-23-007** filed.

§23.1 declares `bid_owner_id` (single owner) but §4.4.1 has `owner_id` plus `team_ids: Array[UUID]` plus per-bid-workspace role assignment (`seller_bid_captain`, `seller_bid_contributor`, `seller_kb_viewer`, `seller_guest`). §23.2's lock model assumes two users — contradicts §23.1's "single owner" wording. → **D-23-008** filed.

### Check 2: Response item schema — §23.3 vs §4.4.2 vs Appendix D vs Appendix J `bid_response_status`

**Result:** Three-way state-model collision; response-type label drift.

§23.3 declares lifecycle as `pending → draft → ready_for_review → submitted → (optionally needs_reverification if buyer amends) → locked`. §4.4.2 status enum is `draft, submitted, acknowledged, archived_by_buyer_remove`. Appendix D lifecycle is `pending, draft, submitted, needs_reverification, locked`. The values `pending`, `ready_for_review`, `acknowledged`, `archived_by_buyer_remove` are not consistently registered, and `ready_for_review` appears only in §23.3 prose with no Appendix J / §4.4.2 / Appendix D backing. → **D-23-014** filed.

§23.3 enumerates response types as `Boolean, Qualitative, Evidence, Informational, Pricing` (capitalized labels). §25.5.2 enumerates `requirement_response_type` values as `yes_no, short_text, long_text, numeric, currency, date, file_upload, video_link, demo_link, multi_select, single_select` — no overlap in label form. "Informational" and "Pricing" have no §25.5.2 cognate at all. → **D-23-015** filed.

§23.3 inlines numerical limits (50,000-char qualitative, 5,000-char evidence, 10 files × 50 MB cap, 50,000-char informational) without §39 citation. → folded into **D-23-012**.

§23.3 references `Section 14.4` for pricing-config form without anchor link or one-line summary. → **D-23-030** filed.

### Check 3: Console Bridge sync semantics — §23 vs §4.7.1 vs §25.1–§25.6 vs §25.5

**Result:** §23 references §25 implicitly but the §25.5 Materialization Protocol is not surfaced; §23.4 vendor-withdrawal event has no §4.7.1 `event_kind` registration.

§4.7.1 `console_bridge_event_kind` enum (line 7741) lists: `requirement_created`, `requirement_amended`, `requirement_reverted`, `requirement_locked`, `use_case_structure_changed`, `qa_thread_post_appended`, `phase_advanced`, `nda_executed`, `response_submitted`, `response_locked`, `disqualification_issued`, `workspace_canceled`, `amendment_broadcast`, `buyer_comment_visible_to_vendor`, `eoi_acceptance_propagated`, `eoi_acceptance_reversed`, `revert_propagated`, `workspace_reopened_ops`. **No `bid_workspace_voluntary_withdrawn`.** The `console_bridge_event_failure_reason` enum *does* include `vendor_withdrawn` (line 7755) — implying the cascade is contemplated downstream but the bridge has no event to emit upstream. → **D-23-004** filed.

§25.1.1 lists "Voluntary withdrawal notifications (§23.4)" as a Seller→Buyer surface (line 19577) but §25.1.2 redaction matrix has no row for it. The §4.7.1 governance block requires "every new `event_kind` value MUST be registered with (a) field-level redaction matrix row AND (b) seller-visible projection rule AND (c) retention class." → folded into **D-23-004**.

§23.5's "Bid Workspace syncs buyer requirements within 5 seconds of Phase 6 entry" and "Response submission updates buyer-side view within 5 seconds" contradict §25.2.1's normative SLO of 30,000 ms p99. → **D-23-016** filed.

§23 does not reference §25.5 Materialization Protocol — readers don't know that Bid Response rows materialize via `requirement_created` apply, that `requirement_amended` may set `needs_reverification`, or that `requirement_locked` cascades to `response_lock=true` independent of the §23.2 advisory editor lock. → folded into D-23-005, D-23-009 (the conflation of §25.5's `response_lock` boolean with §23.2's editor lock).

### Check 4: Draft state — §23.3 vs §4.4.2 vs §25.5

**Result:** Auto-save / server-side draft persistence semantics unspecified; "draft" state shared between §23.3 lifecycle and §4.4.2 enum but with different transition semantics.

§23.3 specifies "Draft" as a lifecycle state but does not specify auto-save cadence, server-side persistence model, crash recovery, or local-storage fallback. The §4.4.2 entity has `status='draft'` and `created_at` / `updated_at` but the prose contract for what triggers each transition is silent.

§23.2 advisory editor lock claims a "lock object" `response.lock = { user_id, acquired_at, expires_at }` as a per-response advisory lock — but §4.4.2 has no `editor_lock_*` fields, only the §25.5 materialization-driven `response_lock` boolean. The two are conflated. → **D-23-009** filed.

The lock model implies four operations (acquire, extend, release, force-release) — none authored in §32. → **D-23-010** filed.

Four user-visible error conditions (lock-held, first-write-wins, force-unlock confirmation, second-saver clash) — none registered in Appendix I. → **D-23-011** filed.

RBAC unspecified — `seller_kb_viewer` must be forbidden from acquiring an editor lock; `seller_guest` similarly; force-release authority concentration on `seller_bid_captain` is implied but unstated. → **D-23-013** filed.

Lock-duration constants (600 s, 540 s, 60 s, 300 s) inlined without §39 citation. → folded into **D-23-012**.

### Check 5: Submission state — §23.3 vs §4.7.1 vs Appendix C / G

**Result:** No buyer-side webhook on response submission; bulk-submit surface is half-spec'd.

§4.7.1 has `event_kind=response_submitted` but Appendix C / G have no buyer-side webhook for "vendor submitted N responses" or "vendor's Bid Workspace transitioned to `submitted`." §31.9.8.5 references `bid_workspace_submitted` only as a CRM-Sync internal trigger, not a registered §31 platform webhook. PostHog has no `seller.bid_workspace_submitted` event catalogued. → **D-23-020** filed.

§23.3 bulk submit describes partial-success ("4 responses submitted. 2 responses failed: ...") but does not register an HTTP 207 endpoint. Prose self-contradicts ("in a transaction" then describes partial success). §32.6.1 Multi-Status pattern not invoked. No `Idempotency-Key` contract. → **D-23-018** filed.

§23.3 "Agent suggests from KB" and "Agent cross-references against requirement and surfaces summary with page citations" invoke billable §22 Managed Agent calls but no Capability is named, no AIOperation kind registered, no §5.11 plan gating, no free-allowance or wallet-empty UX. → **D-23-019** filed.

### Check 6: Post-submission edits — §23.3 + §25.5 `needs_reverification`

**Result:** Spec's post-submission flow is in §25.5 (`needs_reverification` flag); §23 references the lifecycle state but does not reference §25.5 surfacing contract.

§23.3 says "Response lifecycle: ... → submitted → (optionally needs_reverification if buyer amends) → locked." §25.5.4 authors `needs_reverification` as a Bid Response field with `reverification_reason` and `reverification_source_version`. §25.5.10.3 declares the AC. §23 does not surface §25.5's "Buyer changed this requirement — review and resubmit" CTA copy or the seller-side trigger.

The Phase-9 lock cascade (§4.4.2 line 4634 — "until the lock is released by a subsequent `requirement_unlocked` event (out of scope for v7.0.0; documented as a Known Gap)") is not surfaced in §23.3 either. Net: §23.3 is internally complete but does not link to the §25.5 contract — readers building from §23 alone will miss the reverification surface.

No new defect filed (covered by D-23-014's recommendation to reconcile state-model authority across §4.4.2 / Appendix D / §23.3).

### Check 7: Withdrawal — §23.4

**Result:** Major unbuildable cluster. §23.4 has no API endpoint, no webhook, no audit trail, no cascade contract, no Loops.so template, no plan-gating, no idempotency, no edge-case coverage. The §23.4 cluster is the largest defect concentration of the §23 walk.

- No API endpoint authored. → **D-23-003** filed.
- No `bid_withdrawn` event_kind in §4.7.1; no §25.1.2 redaction row; no Appendix C / G webhook entry; no Loops.so template id. → **D-23-004** filed.
- No cascade contract for Q&A compose state, Managed Agent termination, Bid Tasks, Bid Schedule, SLA timers, or Response status transitions (compare to §25.3.4 four-layer freeze). → **D-23-005** filed.
- No Audit Event row schema, no `vendor_withdrawal_audit_action` enum, no hash-chain integrity (compare to §25.3.5). → **D-23-006** filed.
- No retention class, no DSAR cascade, no residency rule, no GDPR right-to-erasure path. → **D-23-022** filed.
- No idempotency contract. → **D-23-028** filed.
- §23.4 declares irreversibility but §25.3 grants 72h reversal window for disqualification — asymmetry without rationale. → **D-23-029** filed.

### Check 8: Disqualification cross-reference — §23 vs §25.3

**Result:** §23 contains no §25.3 conflict findings — the disqualification mainline is fully owned by §25.3, and §23 correctly defers. The Appendix-E `disqualified` state extension lands per §25.3.15.

§23 is silent on disqualification (correct — §25.3 is authoritative). One minor cross-reference defect: the §25.3.7 buyer-side Disqualified Lane is not surfaced in §23 prose (e.g., Bid Tracker tab), but §25.3 owns that surface, so no §23 defect filed.

### Check 9: Plan-gating — §23 vs §5.11 / §34.1 / §39

**Result:** §23 makes no plan-gating reference. Solo / Free / $149 / $499 / $1,499 / Enterprise behavior on Bid Workspace creation, response submission, KB suggestions, evidence cross-reference, bulk submit, withdrawal, and force-release authority is undefined.

Search of §5.11 (line 9425) does not surface a "Bid Workspace" or "Response Submission" row that maps cleanly to §23 surfaces. Line 28710 mentions "Plan-tier behavior at Workspace / Bid Workspace creation under Solo per-eval / per-bid" — implying Solo gating exists somewhere, but no §23 cross-reference. → **D-23-021** filed.

### Check 10: Cross-cutting — observability, accessibility, mobile, edge cases, firewall

**Result:** §23 silent on every cross-cutting dimension.

- No OTel spans, no PostHog events, no metrics for lock contention, bulk-submit partial-failure rate, or withdrawal cascade duration. → **D-23-026** filed.
- No mobile parity paragraph (compare §25.3.7 / §25.3.8 mobile sections). → **D-23-024** filed.
- No accessibility paragraph (compare §25.3.8 a11y block). → **D-23-025** filed.
- No empty / loading / error / retry states for any §23 surface. → **D-23-027** filed.
- No firewall AC asserting Agent KB suggestion reads only `seller_org_id` scope; §23.4 buyer-side notification not bound to a §25.1.2 carried-projection. → **D-23-023** filed.
- §23.5 acceptance criteria lack test types, observable I/O decomposition, and CI gate references (compare §25.3.13 fidelity). → **D-23-017** filed.
- §23.5 anchor `{#23.5-acceptance-criteria}` collides with 70+ similar anchors corpus-wide (low priority). → **D-23-031** filed.

## Counterfactual Pass

For each §23 surface, three realistic failure modes were enumerated and the spec was checked against each. Promoted to defects:

**Bid Workspace lifecycle.** (1) Vendor accepts NDA but Bid Workspace materialization race fails — §4.7.1 retry curve covers the bridge layer but §23 silent on visibility/surface (folded into D-23-005). (2) Bid Owner deactivated mid-bid — §23 silent on role re-assignment (D-23-008). (3) Phase 13 closes parent Workspace while Bid Workspace is `submitted` — Appendix E declares `submitted → closed`; cross-references intact (no defect required).

**Response submission.** (1) Loops.so outage during buyer notification of submission — no notification retry curve in §23 (D-23-020). (2) Wallet-empty during evidence cross-reference Agent run — §23 silent on degradation (D-23-019). (3) Bulk submit interrupted mid-cascade by network failure — §23 silent on idempotency (D-23-018, D-23-028).

**Withdrawal.** (1) Withdrawal during in-flight Managed Agent session — §23 silent on agent termination (D-23-005). (2) Withdrawal racing buyer disqualification — §23 silent on conflict resolution (D-23-005, D-23-029). (3) Withdrawal during Phase 9 (responses already locked) — §23 says responses "remain in the system" but does not specify lock_reason or scoring exclusion (D-23-005).

**Editor lock.** (1) User A goes offline before lock expiry — heartbeat / browser-close behavior unspecified (D-23-009 / D-23-010 cover the gap). (2) Force-release race between two contributors — RBAC unspecified (D-23-013). (3) Network partition at first-write-wins moment — error code unregistered (D-23-011).

## Self-Challenge Pass

Re-read 31 findings as a hostile reviewer.

**Severity classification audit.**
- D-23-001 / D-23-002 / D-23-014 — held at **P1**: junior engineer would build one of three contradicting state models at random; canonical resolution is required pre-implementation. Considered for P0 (firewall implication) and rejected — the enums are workflow states, not firewall fields.
- D-23-003 / D-23-004 / D-23-005 / D-23-009 / D-23-010 / D-23-013 / D-23-019 / D-23-020 / D-23-021 — held at **P1** (feature unbuildable as written: missing endpoint, missing webhook, missing schema, missing RBAC, missing entitlement, missing plan gating).
- D-23-006 — held at **P1**: missing audit-trail contract on a high-impact mutation. Considered P0 per the P0 rule (c) audit-log integrity; rejected because the existing system audit log fires *some* row on the underlying Bid Workspace status mutation — the defect is the absence of a §23.4-specific schema.
- D-23-007 — held at **P1**: §23.1 actively contradicts §4.4.1's field set (not merely silent on it).
- D-23-008 — held at **P1**: `bid_owner_id` "single owner" wording would forbid Bid Contributors and contradicts §23.2's two-user lock model.
- D-23-011 — held at **P1**: no error path is buildable.
- D-23-016 — held at **P1**: 5 s vs 30 s contradiction is not "ambiguity a thoughtful engineer can resolve" — it is a hard conflict with §25.2.1's normative SLO.
- D-23-018 — held at **P2**: the prose ambiguity ("in a transaction" vs "partial success") is reader-resolvable to "best-effort with per-row settlement" by reading §32.6.1; P2 not P1.
- D-23-012 — held at **P2**: numerical singletons rule is well-established but inline literals are mechanically resolvable (move to §39).
- D-23-022 / D-23-024 / D-23-025 / D-23-026 / D-23-027 — held at **P2** (silence on applicable dimensions where the conventional resolution exists in §40.2 / §38 / §37 / §42 / §44).
- D-23-023 — held at **P2**: firewall *leakage* is a high-stakes class but the specific defect is that the *test* of firewall integrity is not asserted in §23 ACs (the underlying §1.3 / §25.1.2 rules are intact).
- D-23-028 — held at **P2**: idempotency gap is reader-resolvable from §32.8.0 but with material implementation impact.
- D-23-029 — held at **P2**: reversal asymmetry is a product question with both authoring paths viable.
- D-23-030 / D-23-031 — held at **P3** (cosmetic; do not block implementation).

No defect downgraded to evade the Severity rule. No defect upgraded above the rule warrants.

**Reproducibility check.** Every defect cites a Master Spec line number AND quotes the offending text. Reviewers can re-walk the file and confirm.

**Recommendation sharpness.** Each row names the file/section/anchor for remediation, names the convention violated, and cites the precedent where the convention is met (e.g., §25.3.x for disqualification fidelity).

**Counterfactual coverage check.** All eight scope items in the prompt — bid workspace lifecycle, response item schema, Console Bridge sync semantics, draft state, submission state, post-submission edits, withdrawal, disqualification, plan-gating — have at least one defect surfaced. Disqualification surfaced zero §23-internal defects (correct — §25.3 is canonical).

**Defect candidates considered and rejected.**
- §23.2 "advisory lock" terminology vs Convex compare-and-swap mechanism — internally consistent if `response.lock` is treated as an application-level field (not a Postgres advisory lock). The implementation gap is filed under D-23-009 (schema absence); no separate semantic defect needed.
- §23.5 "Withdrawal confirmation modal prevents accidental withdrawal" — toothless AC (does not specify what "prevents" means). Already covered under D-23-017 (AC fidelity).

## Summary

- **Defects filed:** 31 (D-23-001 .. D-23-031).
- **Severity distribution:** 0 P0 / 14 P1 / 15 P2 / 2 P3.
- **HALT:** Not triggered (zero P0).
- **Largest defect cluster:** §23.4 Vendor Voluntary Withdrawal — 6 P1 defects (D-23-003 / -004 / -005 / -006) + 2 P2 (D-23-022 / -029) + 1 P2 (D-23-028 idempotency). The cluster is large enough to warrant a dedicated remediation prompt mirroring `_integration/RECONCILIATION.md → §25.3 Formalization 2026-04-24`.
- **Cross-section dependency callouts:** §4.4.1, §4.4.2, Appendix C, Appendix D, Appendix E, Appendix I, Appendix J, §5.11, §25.1.2, §25.5.8, §32, §32.6.1, §37, §38, §44 — all named as authoring homes for §23 remediation.
- **Forward references:** Phase 13 (schema consolidation), Phase 14 (cross-doc consistency), Phase 7 (plan-gating), Phase 11 (Appendix M / L), Phase J-Audit (enum sweep), Phase 14.5 (AE Ledger ratification), Phase 23R (proposed Withdrawal authoring pass).
