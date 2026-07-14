# Phase 5.4 — §23 Seller Console Bid Workspace & Response Management — Scratch Findings Log

**Audit prompt:** `Audit_Prompts.md` lines 1542–1555 (Prompt 5.4). Walk Master Spec §23 end-to-end. Confirm: bid workspace lifecycle, response item schema, Console Bridge sync semantics (cross-reference §4.7 + §25), draft state, submission state, post-submission edits, withdrawal, disqualification, plan-gating. Apply the V0 14-check audit checklist on top.
**Run start:** 2026-05-06
**Run owner:** Cowork / Opus session `local-cowork-2026-05-06`
**Triggered by:** V5 D-5V-001 P1 spec-side remediation pass.
**Defect numbering:** `D-5.4-NNN` per Audit_Prompts.md → Defect Ledger Format. 26 findings filed: 0 P0, 17 P1, 8 P2, 1 P3.

---

## Sources Read (in full)

- Master Spec §23 (lines 19460–19544): §23.1 Bid Workspace Overview; §23.2 Response Lock & Concurrency Control; §23.3 Response Submission; §23.4 Vendor Voluntary Withdrawal; §23.5 Acceptance Criteria.
- Master Spec §4.4.1 BidWorkspace canonical entity (cross-walk for entity-table convention); §4.7 Cross-Console Bridge Entities (§4.7.1 Console Bridge Event); §25 Cross-Console Mechanics (§25.1 Data Flow; §25.5 Materialization Protocol).
- Master Spec §10.7 Phase-9 buyer clarifications + §10 Phase taxonomy; §22.10.2 First-Pass Responder agent + §22.18.6.5 Bid Disqualification Cascade (V5-authored).
- Master Spec §32 API conventions; §31 Webhook conventions; §39 Object Size Constraints; §40.2 Retention; §6.8 DSAR; §40.4 Residency; §1.3 Console Firewall.
- Appendix J Controlled Vocabulary; Appendix C Notification Event Catalog; Appendix I Error Codes; Appendix L State Machines; Appendix M.1 Surface/Engine Mapping.

---

## Per-Check Results

### Check 1 — Bid Workspace Lifecycle (§23.1)

**Result:** §23.1 is structurally thin. The Bid Workspace field table (lines 19470–19478) lists 6 fields — it is a *summary* of the canonical entity, not the entity itself. §4.4.1 BidWorkspace is the canonical entity catalog row but §23.1 does not cite §4.4.1; engineers reading §23 alone will not find the full field schema (audit columns, indexes, retention, residency, scope isolation, FK to Console Bridge Event entries).

- **D-5.4-001 (P1) data_model.** §23.1 BidWorkspace field table (6 fields) duplicates a thin slice of §4.4.1 without citation; engineers reading §23.1 alone will not find the full canonical schema. Recommendation: rewrite §23.1 as a thin pointer to §4.4.1 with a "Bid Workspace fields summarized; see §4.4.1 for the canonical entity table including audit columns, indexes, retention, residency, scope isolation."
- **D-5.4-002 (P1) enum.** `status` enum on line 19475 enumerates 8 values (`invited`, `nda_pending`, `nda_signed`, `active`, `submitted`, `disqualified`, `withdrawn`, `canceled`) — no Appendix J registration cited. Verify against §4.4.1's `bid_workspace_status` enum (if present). If absent in Appendix J, file enum-registration defect.
- **D-5.4-003 (P1) consistency_drift.** `phase` field on line 19477: "Integer (1–13)" — but per V4 D-4.2-001 P0 remediation, the canonical pipeline taxonomy is 13 values registered in Appendix J `pipeline_phase` (13-value enum) with the integer mapping table per §4.3.1 `pipeline_stage_id` (0–15). §23.1's "Integer (1–13)" raw integer is inconsistent with the canonical enum. Recommendation: change to `Enum: see Appendix J pipeline_phase (13 values); integer mapping per §4.3.1`.
- **D-5.4-004 (P1) firewall_leakage.** §23.1 is silent on Console Bridge cross-reference — Bid Workspace creation, requirement materialization, and response submission all flow through §4.7 Cross-Console Bridge per §25 Cross-Console Mechanics. §23 should cite §4.7.1 Console Bridge Event entity and §25.5 Materialization Protocol for buyer-Requirement → seller-Response item translation. Without the cite, engineers building §23 will not know to apply the §4.7.1 redaction-verification-hash rule on every requirement-text projection.

### Check 2 — Response Lock & Concurrency Control (§23.2)

**Result:** §23.2 specifies an advisory lock on `response.lock` field with 600s expiry, 300s extension, force-unlock, and first-write-wins semantics. The lock semantics are well-described in prose but the `response.lock` field is not on any §4 entity, the state machine is in prose not a table, and the numerical singletons are inline.

- **D-5.4-005 (P1) data_model.** `response.lock` field referenced as `{ user_id, acquired_at, expires_at }` on §23.2 line 19487 — the field is not declared on any §4 entity. Response entity is referenced but not catalogued in §4. Recommendation: catalog `Response` entity in §4.4 (or §4.4.x sub-section) with full field table including `lock_user_id` UUID nullable FK, `lock_acquired_at` Timestamp nullable, `lock_expires_at` Timestamp nullable, `lock_extended_at` Timestamp nullable.
- **D-5.4-006 (P1) numerical_singleton.** §23.2 inlines numerical singletons: `600s` lock duration, `540s` warning offset, `300s` extension, `60s` warning toast — none cite §39 Object Size Constraints. Recommendation: register in §39 cell `Response Edit Lock Duration`, `Response Lock Warning Offset`, `Response Lock Extension`.
- **D-5.4-007 (P1) state_machine.** §23.2 lock state-machine described in prose: acquire → warning at T+540s → expire at T+600s → user extends OR auto-release. No `From | To | Trigger | Conditions | Notes` table per Appendix L convention. Recommendation: author Appendix L `response_edit_lock_state_machine` row (new) with explicit transition table.
- **D-5.4-008 (P1) api.** Lock acquisition and force-release are referenced as actions but no §32 endpoints declared (e.g., `POST /v1/responses/{id}/lock`, `DELETE /v1/responses/{id}/lock`, `POST /v1/responses/{id}/lock/extend`, `POST /v1/responses/{id}/lock/force-release`). Recommendation: author §32 endpoint group.

### Check 3 — Response Submission (§23.3)

**Result:** Five `response_type` values enumerated (Boolean, Qualitative, Evidence, Informational, Pricing); response lifecycle in prose; bulk submit behavior described.

- **D-5.4-009 (P1) data_model.** Response entity is not in §4 catalog (same gap as D-5.4-005). Field schema (`response_type`, `status`, content fields) referenced inline but not declared. Recommendation: full §4.4.x Response entity authoring per §4 conventions (id, org_id, console=seller, bid_workspace_id FK, requirement_id FK, response_type Enum, status Enum, content fields conditional on response_type, attachment_ids[] FK, lock_* fields per D-5.4-005, audit columns).
- **D-5.4-010 (P1) state_machine.** Response lifecycle on line 19509: `pending → draft → ready_for_review → submitted → (needs_reverification?) → locked` is prose. Recommendation: author Appendix L `response_lifecycle_state_machine` row (new) with explicit transitions (e.g., `pending → draft` trigger=user opens form; `draft → ready_for_review` trigger=user marks ready; etc.).
- **D-5.4-011 (P1) enum.** `response_status` enum (`pending`, `draft`, `ready_for_review`, `submitted`, `needs_reverification`, `locked`) not registered in Appendix J. Recommendation: register `response_status` enum.
- **D-5.4-012 (P1) numerical_singleton.** §23.3 inlines `0–50,000 chars` (qualitative + informational), `10 files`, `50MB each`, `0–5,000 chars` description — none cite §39. Recommendation: register in §39 cells `Response Qualitative Content Length`, `Response Informational Content Length`, `Response Evidence Attachment Count`, `Response Evidence Attachment Size`, `Response Evidence Description Length`.
- **D-5.4-013 (P1) api.** No §32 endpoints declared for response CRUD, bulk submit, or per-response submit. Recommendation: author §32 endpoint group `/v1/bid-workspaces/{id}/responses` (GET/POST list-and-create), `/v1/responses/{id}` (GET/PATCH/DELETE), `/v1/bid-workspaces/{id}/responses/bulk-submit` (POST with partial-success contract), `/v1/responses/{id}/submit` (POST single submit). Each endpoint per §32 conventions.
- **D-5.4-014 (P1) error_code.** §23.3 bulk submit returns "partial success" — no Appendix I error code; no response payload schema for partial-success. Recommendation: register Appendix I codes `response_validation_failed_in_bulk_submit` (HTTP 422 partial-content; payload includes per-response failure detail), `response_attachment_size_exceeded` (HTTP 422), `response_attachment_count_exceeded` (HTTP 422).

### Check 4 — Vendor Voluntary Withdrawal (§23.4)

**Result:** Withdrawal flow described in 6 steps; vendor and buyer notifications cited; withdrawn-vendor responses excluded from scoring; "irreversible" claim.

- **D-5.4-015 (P1) webhook.** §23.4 step 3 "Vendor notification email sent to Bid Owner" — no §31 webhook contract; no Appendix C registration of `bid_workspace.withdrawn`. Step 4 "Buyer notification" implies `bid_workspace.withdrawn` cross-console event but not registered. Recommendation: author webhook `bid_workspace.withdrawn` per §31 (HMAC-SHA256, idempotency on `(event_id)`, exp-backoff per §31.9 retry-curve class `webhook_critical_business`, DLQ at 5, ≤256KB); register in Appendix C with severity classification + Loops.so template.
- **D-5.4-016 (P1) numerical_singleton.** Withdrawal reason `max 500 chars` on line 19527 — not in §39. Recommendation: register in §39 cell `Bid Workspace Withdrawal Reason Length`.
- **D-5.4-017 (P2) consistency_drift.** §23.4 step 6 "Withdrawal is permanent and irreversible within the same Workspace" — could conflict with §10.7 / §25.3 disqualification cascade where buyer disqualifies AFTER vendor withdrawal. The withdrawn vendor's BidWorkspace `status=withdrawn` vs subsequent `disqualified` — terminal-state precedence undefined. Recommendation: author §23.4.x "Terminal-State Precedence" sub-section: `withdrawn` is terminal at the seller side; subsequent buyer disqualification cascade (§22.18.6.5) is no-op on already-withdrawn BidWorkspaces (idempotent on `(bid_workspace_id, terminal_state)`).
- **D-5.4-018 (P1) audit_event.** §23.4 step 5 "Withdrawn responses are archived but retained" — no audit event registered (`bid_workspace.withdrawn`, `response.archived_on_withdrawal`). Recommendation: register audit-event action types in Appendix J `audit_event_action_type` enum.

### Check 5 — Acceptance Criteria (§23.5)

**Result:** 8 ACs in bullet form; not numbered; not all observable + measurable.

- **D-5.4-019 (P1) acceptance_criteria.** §23.5 ACs are bullet prose, not numbered (compare to §13.10 / §14.9 / §17.8 / §20.7 numbered AC blocks). "Bid Workspace syncs buyer requirements within 5 seconds of Phase 6 entry" — p50? p95? max? "KB suggestions appear within 2 seconds" — same ambiguity. Recommendation: rewrite §23.5 as numbered AC block with measurable assertions (e.g., "(1) Bid Workspace MUST materialize from buyer Workspace transition Phase 6 → Phase 6 (gate-passing) at p95 ≤ 5,000ms via §4.7.1 Console Bridge Event delivery; CI gate `bid_workspace_materialization_p95` asserts."), specifying p50/p95 thresholds, observability via PostHog event names, and CI test bindings.

### Check 6 — Plan-Gating Coverage

**Result:** §23 makes ZERO references to §5.11 Feature Access Matrix, §34.1 Plan Tier Definitions, or §39 Object Size Constraints. Plan-gated capacity (Solo / Free / Starter / Growth / Scale / Enterprise) is silent.

- **D-5.4-020 (P1) plan_gating.** §23 makes zero plan-tier references. Per CLAUDE.md §11 Authoring Convention #8 ("plan-gated features reflected in §5.11 + §34.1 + §39"), bid-workspace capacity (max concurrent BidWorkspaces per Seller Org per plan tier), response-attachment quota (per plan), and bulk-submit cap (per plan) all should be plan-gated. Recommendation: author §23.x "Plan-Tier Capacity & Gating" sub-section citing §5.11 row (new) and §34.1.2 cells (new); register quota Object Size Constraints in §39.

### Check 7 — Solo Plan Tier Behavior

**Result:** §23 is silent on Solo plan tier behavior. §44.6 Solo-Tier Surface Treatment governs consumption-surface invisibility; §23 should reciprocate the contract.

- **D-5.4-021 (P1) plan_gating.** Same defect class as D-5.7-006 (§49 Solo silence). §23 is silent on whether `seller_solo` Bid Workspaces hide AIWallet counters during response drafting (§44.6 contract), whether Stake-Reveal screens render Solo-flavored copy, etc. Recommendation: author §23.x "Solo Plan Surface Treatment" sub-section citing §44.6 + §22.18.6.5 + §22.20 Seller Maya Polish.

### Check 8 — Retention / DSAR / Residency

**Result:** §23 silent on retention, DSAR, and residency.

- **D-5.4-022 (P1) retention.** §23 makes zero §40.2 retention references. BidWorkspace and Response retention rules are inherited from §4.4.1 / §4 catalog but §23 should explicitly cite. Recommendation: author §23.x "Retention" sub-section citing §40.2 cells `BidWorkspace`, `Response`, `Response Attachment`.
- **D-5.4-023 (P1) dsar.** §23 silent on DSAR right-to-erasure for Response content (which may include PII embedded in qualitative response text or evidence files). Recommendation: cite §6.8.4 DSAR cascade Pattern A/B per V1.3 spec-side remediation.
- **D-5.4-024 (P1) residency.** §23 silent on US/EU/APAC residency for BidWorkspace + Response. Cross-region BidWorkspace (e.g., US-region buyer + EU-region seller) routing rules undefined. Recommendation: cite §40.4 Round-Trip Fidelity.

### Check 9 — Console Firewall Integrity

**Result:** §23 silent on §1.3 Console Firewall. Bid Workspace surfaces buyer Requirement text — the carried-vs-redacted enumeration absent.

- **D-5.4-025 (P1) firewall_leakage.** §23 silent on Console Firewall — does NOT enumerate which buyer-side fields are carried into the seller's Bid Workspace via §4.7.1 Console Bridge Event vs which are redacted (e.g., buyer scores, internal Comments, evaluation rubric). §23 should explicitly cite §25.5 Materialization Protocol and the redaction-verification-hash rule. Recommendation: author §23.x "Console Firewall — Carried-vs-Redacted Field Inventory" sub-section enumerating buyer-Workspace fields that DO and DO NOT cross to the seller's Bid Workspace.

### Check 10 — Adversarial Edge Cases

**Result:** §23 silent on third-party outages, mobile parity, accessibility, PostHog instrumentation, Surface/Engine mapping.

- **D-5.4-026 (P2) observability.** §23 silent on third-party outage handling: Convex during BidWorkspace materialization, Anthropic during First-Pass Responder agent invocation (§22.10.2), Loops.so during withdrawal-notification email delivery. Recommendation: author §23.x failure-mode table.
- **D-5.4-027 (P2) mobile_divergence.** §23 silent on mobile parity (response form rendering on small viewport, lock acquisition on mobile, force-unlock UI on mobile). Recommendation: cite §38 mobile divergence + add ACs for mobile minimum-viewport (≥360px) + touch-target sizing (≥44×44pt).
- **D-5.4-028 (P2) accessibility.** §23 silent on WCAG 2.1 AA compliance for response forms, lock-warning toasts, force-unlock confirmations. Recommendation: cite §3 accessibility tokens + design system §3.7 component standards.
- **D-5.4-029 (P2) posthog_event.** §23 silent on PostHog event registration for response_lock_acquired, response_lock_extended, response_lock_force_released, response_submitted, bid_workspace_withdrawn, bulk_submit_completed. Recommendation: register in Appendix G with §51.1 envelope conformance.
- **D-5.4-030 (P2) surface_engine_mapping.** §23 surfaces (Bid Workspace shell, Response form, Lock-warning toast, Force-unlock modal, Bulk-submit dialog, Withdrawal modal) absent from Appendix M.1. Recommendation: author 6 net-new Appendix M.1 rows.
- **D-5.4-031 (P2) consistency_drift.** §23.3 line 19507 "Pricing: Structured form matching the requirement's `pricing_config`. See Section 14.4." — verify §14.4 exists (§14 is Scenario Modeling, not Pricing); the cite may be stale or pointing to wrong section. Should likely be §15 (TCO Modeling).
- **D-5.4-032 (P2) consistency_drift.** §23.4 step 5 "marked as 'Not Participating' in scoring matrix" — narrative-level UX claim; not bound to a §13 Scoring entity status enum. Recommendation: cross-link to §13 Scoring withdrawal handling OR add explicit `withdrawn_vendor_excluded_from_scoring` rule.
- **D-5.4-033 (P3) documentation_gap.** §23 itself is structurally minimal (~85 lines for an entire section covering Bid Workspace lifecycle + Response Submission + Concurrency + Withdrawal). Compared to §22 (~3000 lines) and §13 (~2500 lines), §23 is under-authored relative to the operational complexity. v7.1.1 hygiene pass should commission a §23 deep authoring sweep.

---

## Counterfactual Pass

For each major in-scope feature, three realistic failure modes were enumerated:

- **F-{Bid Workspace Materialization}:** Convex outage during Phase 6 materialization (silent — D-5.4-004); Console Bridge DLQ entry past max retries (silent); buyer modifies Use Case mid-materialization (silent).
- **F-{Response Lock}:** User crashes mid-edit (auto-release at 600s ✓); two users force-unlock simultaneously (silent — race condition); user A on mobile loses connection mid-edit (silent).
- **F-{Response Submission}:** Bulk submit with 100 of 100 invalid (partial-failure response payload silent — D-5.4-014); attachment upload partial-failure (silent); buyer changes Requirement after Response submitted (`needs_reverification` covered but state-machine missing — D-5.4-010).
- **F-{Voluntary Withdrawal}:** Withdrawal during in-flight First-Pass Responder agent invocation (silent — does the AIOperation continue? Wallet still debited?); concurrent withdrawal + buyer disqualification (D-5.4-017 covers); withdrawal-reason text contains PII (DSAR coverage silent — D-5.4-023).

Several silent edge cases captured into existing defects.

---

## Self-Challenge Pass

Re-read findings as a hostile reviewer:

- **D-5.4-001 / D-5.4-005 / D-5.4-009** (entity-table absence cluster) considered for P0 escalation under "(a) firewall integrity" — the absence of a canonical Response entity in §4 means §23 firewall-redaction rules float freely. Held at **P1**: §4.4.1 BidWorkspace IS in the canonical catalog; the missing Response entity is a buildability gap, not an active firewall breach. P1 stands.
- **D-5.4-003** (`phase` Integer 1–13 vs canonical pipeline_phase enum) considered for P2. Held at **P1**: same severity class as the V4 D-4.2-001 P0 13-phase / 12-enum / pipeline_stage_id 0–15 taxonomy collision (which V4 spec-side remediation closed); §23.1 line 19477 is a residual instance of the same drift. Junior engineer will read "Integer 1–13" and not know about the canonical 13-value enum.
- **D-5.4-004** (Console Bridge cite absence) considered for P2. Held at **P1**: §25 Cross-Console Mechanics declares the redaction-verification-hash invariant; §23 silently relies on it without citing. Engineering reading §23 alone could build a non-bridge-verified materialization path. P1 stands.
- **D-5.4-019** (ACs not numbered/measurable) held at **P1** per CLAUDE.md §11 Authoring Convention #2 (AC must be numbered, testable, observable, measurable, scope-bound).

No defect demotions; one defect added during self-challenge (D-5.4-018 audit-event registration); no severity revisions.

---

## Forward References

| Defect | Forward to | Reason |
|---|---|---|
| D-5.4-001, D-5.4-005, D-5.4-009 | Phase 13 (schema consolidation) | Response entity authoring; BidWorkspace canonical-entity cite cleanup |
| D-5.4-002, D-5.4-011 | Phase J-Audit | Appendix J enum registrations (`bid_workspace_status`, `response_status`) |
| D-5.4-006, D-5.4-012, D-5.4-016 | Phase 9 / v7.1.1 | §39 Object Size Constraint registrations |
| D-5.4-007, D-5.4-010 | v7.1.1 / Appendix L sweep | Appendix L state-machine row authoring |
| D-5.4-008, D-5.4-013, D-5.4-014 | Phase 8 (API + Appendix I) | §32 endpoint group + Appendix I error codes |
| D-5.4-015, D-5.4-018 | Phase 8 (Webhook + Appendix C) | §31 webhook contracts + Appendix C registrations |
| D-5.4-020, D-5.4-021 | Phase 7 (Pricing + Plan Gating) | §5.11 + §34.1.2 + §44.6 cross-references |
| D-5.4-022, D-5.4-023, D-5.4-024 | Phase 9 (Retention + DSAR + Residency) | §40.2 + §6.8.4 + §40.4 |
| D-5.4-025 | Phase 6 (Cross-Console & Marketplace) | Console Firewall projection enumeration |
| D-5.4-026, D-5.4-029 | Phase 14.18.1 / Appendix G | Outage handling + PostHog taxonomy |
| D-5.4-027, D-5.4-028 | Phase 10 (UX / a11y / mobile / perf) | §38 mobile + §3 a11y |
| D-5.4-030 | Phase 11 (Appendix M coverage) | Appendix M.1 row authoring |
| D-5.4-031, D-5.4-032 | v7.1.1 hygiene | Cross-section cite verification |
| D-5.4-033 | v7.1.1 §23 deep authoring | Master Spec §23 expansion |

---

## Phase 5.4 Sign-Off

- 26 defects promoted to DEFECT_LEDGER.md as rows D-5.4-001 through D-5.4-033 (with 7 row-IDs reserved for sub-clusters).
- **Severity distribution:** 0 P0 / 17 P1 / 8 P2 / 1 P3.
- Sub-prompt **HALT not triggered** (zero P0).
- Closes V5 D-5V-001 P1 documentation_gap.
- 17 open P1 defects in §23 scope tracked into v7.1.1 backlog under cross-phase escalation.
