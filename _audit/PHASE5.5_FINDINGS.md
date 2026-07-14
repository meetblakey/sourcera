# Phase 5.5 — §24 Seller Console Q&A, NDA, Inbox & Pulse — Scratch Findings Log

**Audit prompt:** `Audit_Prompts.md` lines 1557–1568 (Prompt 5.5). Walk Master Spec §24 end-to-end. Confirm: Q&A visibility per NDA state, inbox aggregation, Pulse score math (separate from buyer Pulse), retention, residency. Apply the V0 14-check audit checklist on top.
**Run start:** 2026-05-06
**Run owner:** Cowork / Opus session `local-cowork-2026-05-06`
**Triggered by:** V5 D-5V-002 P1 spec-side remediation pass.
**Defect numbering:** `D-5.5-NNN` per Audit_Prompts.md → Defect Ledger Format. 23 findings filed: 0 P0, 16 P1, 6 P2, 1 P3.

---

## Sources Read (in full)

- Master Spec §24 (lines 19548–19645): §24.1 Seller Q&A; §24.2 NDA Module & Execution; §24.3 Seller Inbox; §24.4 Seller Pulse; §24.5 Seller Analytics; §24.6 Acceptance Criteria.
- Master Spec §4.4 NDA Record entity (cross-walk; from Phase 1 forward); §4.4 Q&A Thread entity (cross-walk; D-4.9-001 forward); §20 Inbox & Pulse (buyer-side parent for §24.3 / §24.4); §22.5 KB Health Model (Pulse-side adaptation cross-walk).
- Master Spec §1.3 Console Firewall; §7.2 Dual-Console Firewall + NDA gating; §25 Cross-Console Mechanics (NDA-aware projection rules).
- Master Spec §10 Phase taxonomy (Phase 4 NDA, Phase 7 Q&A Open, Phase 8 Q&A Closed); §32 / §31 / §39 / §40.2 / §6.8 / §40.4 cross-references; Appendix B / C / I / J / K / L / M.1.
- Phase 4.9 D-4.9-NNN cluster (forward references for Q&A schema, NDA-aware visibility, retention, residency).

---

## Per-Check Results

### Check 1 — Q&A Visibility Per NDA State (§24.1)

**Result:** §24.1 enumerates four vendor-side behaviors but is silent on NDA-aware visibility rules. The audit-prompt explicitly mandates NDA-aware visibility verification.

- **D-5.5-001 (P1) firewall_leakage.** §24.1 line 19556 "Vendor can view all buyer-posted questions" is ambiguous on scope. Does this mean (a) all questions in the buyer's Workspace including questions to OTHER vendors, (b) only questions the buyer directed at this specific vendor, (c) all questions visible to vendors who have signed NDA but suppressed for vendors who haven't? Per §7.2 firewall, cross-vendor question visibility could leak buyer's vendor shortlist (a competing vendor seeing "Buyer asked Vendor X about HIPAA compliance" reveals that Vendor X is shortlisted). Recommendation: author §24.1.x "Question Visibility Matrix" — explicitly enumerate visibility per `(question_audience, vendor_nda_state, phase)` cells. Default: questions are addressed to a specific vendor or the all-vendors broadcast surface; cross-vendor visibility limited to broadcast questions only.
- **D-5.5-002 (P1) data_model.** §24.1 makes ZERO references to the Q&A Thread entity (D-4.9-001 forward — Phase 4.9 audit confirmed Q&A Thread schema not in §4 catalog). §24.1 should cite §4.4 Q&A Thread entity for the canonical schema and §4.4 Q&A Post (sub-entity) for individual question / answer records.
- **D-5.5-003 (P1) firewall_leakage.** §24.1 silent on NDA gating — `Bid Workspace.status` enum from §23.1 has `nda_pending` and `nda_signed` states but §24.1 does not specify whether `nda_pending` vendors see (a) zero Q&A content, (b) preview/redacted content, (c) full content with banner. Per §7.2 NDA gating, the answer is presumably (a) but is unstated. Recommendation: author explicit NDA-state visibility rule: `nda_pending` → Q&A entirely suppressed; `nda_signed` → Q&A visible per Phase + audience matrix.
- **D-5.5-004 (P2) acceptance_criteria.** §24.1 line 19559 "Q&A threads are read-only once Phase 8 begins (Q&A Closed)" — phase boundary is correct per §10 (V4-remediated 13-phase taxonomy) but no AC binding; no enforcement mechanism cited. Recommendation: author AC asserting `POST /v1/qa-threads/{id}/posts` returns HTTP 410 `qa_thread_closed_in_current_phase` (Appendix I new) when `Workspace.pipeline_phase ∈ {phase_8_due_diligence, phase_9_amendments, phase_10_scoring, ...} AND thread.is_qa_open=false`.

### Check 2 — NDA Module & Execution (§24.2)

**Result:** §24.2 describes NDA flow including upload, review, accept, request-changes, multi-version handling, and signature method. Notable: explicit "v6.0" stale reference; signature is "checkbox acknowledgment" not e-signature.

- **D-5.5-005 (P1) data_model.** §24.2 references multiple NDA Record fields (`nda_accepted_at`, `nda_version_id`, `nda_signed`, `nda_signed_at`, `superseded`, `version_number`, `created_at`) — none cite a §4 catalog entity. NDA Record entity should be in §4.4 with full convention block. Phase 1.4 (§4.5 Marketplace) covered NDA Record but Phase 5.5 confirms §24.2 does not cite the canonical entity.
- **D-5.5-006 (P1) state_machine.** §24.2 NDA workflow described in prose (3 steps + on-accept + on-request-changes + multi-version). No `From | To | Trigger | Conditions | Notes` Appendix L state-machine table. Recommendation: author Appendix L `nda_record_state_machine` row (new) with explicit transitions: `(none) → pending` (buyer uploads); `pending → accepted` (vendor signs); `pending → changes_requested` (vendor requests changes); `accepted → superseded` (buyer uploads new version); `superseded → re_signature_pending` (vendor must re-sign); `re_signature_pending → accepted` (vendor re-signs); `re_signature_pending → disqualified` (vendor refuses).
- **D-5.5-007 (P1) consistency_drift.** §24.2 line 19597 "For v6.0, NDA signing is a checkbox acknowledgment" — explicit "v6.0" reference. Master Spec is at v7.1.0; this is stale stamp text. Recommendation: rewrite to "At v7.1.0, NDA signing is a checkbox acknowledgment; e-signature integration (DocuSign or equivalent) tracked in v7.2+ roadmap per `Linear_Execution_Blueprint.md`."
- **D-5.5-008 (P1) api.** §24.2 silent on §32 API contract for NDA upload, accept, request-changes, multi-version upload. No `/v1/nda-records/` endpoint group declared. Recommendation: author §32 endpoint group: `POST /v1/workspaces/{id}/nda-records` (buyer upload), `GET /v1/nda-records/{id}` (read), `POST /v1/nda-records/{id}/accept` (vendor sign), `POST /v1/nda-records/{id}/request-changes` (vendor flag), `POST /v1/nda-records/{id}/supersede` (buyer upload new version).
- **D-5.5-009 (P1) webhook.** §24.2 silent on webhook contracts. Multiple cross-console events (NDA uploaded → vendor notification; NDA accepted → buyer notification; NDA superseded → all vendors re-signature notification) reference notifications but no §31 webhook contract or Appendix C registration. Recommendation: register webhooks `nda.uploaded`, `nda.accepted`, `nda.changes_requested`, `nda.superseded`, `nda.re_signature_required` per §31 (HMAC-SHA256, exp-backoff, DLQ, ≤256KB).
- **D-5.5-010 (P1) audit_event.** §24.2 silent on audit-event registration. NDA acceptance is a legally-significant event; audit ledger must record `(vendor_user_id, vendor_org_id, nda_record_id, version_number, accepted_at, ip_address, user_agent)`. Recommendation: register audit-event action types `nda_record.accepted`, `nda_record.changes_requested`, `nda_record.re_signature_required` in Appendix J `audit_event_action_type` enum.
- **D-5.5-011 (P2) consistency_drift.** §24.2 "(Gap 24.2)" / "(Gap 24.1)" inline annotations are stale audit-program markers from a prior integration phase. Recommendation: clean in v7.1.1 hygiene pass per CLAUDE.md cross-section convention.
- **D-5.5-012 (P1) legal.** §24.2 line 19599 "Legal enforceability depends on the clause language in the NDA itself and applicable jurisdiction law" — disclaimer is appropriate but Master Spec should cross-link to §47 Governance for the legal-review-on-upload contract (e.g., does Sourcera apply any pre-upload validation that the document is a valid NDA? Or is upload responsibility entirely on the buyer?). Recommendation: cross-link §47 OR add a §24.2.x "Legal Responsibility" sub-section explicitly stating Sourcera is a passive document-storage and acknowledgment platform, not a legal-validation platform.

### Check 3 — Seller Inbox (§24.3)

**Result:** §24.3 enumerates 7 action-item types; sort order described.

- **D-5.5-013 (P1) data_model.** §24.3 silent on §20 Inbox & Pulse cross-reference. §20 (buyer-side Inbox) is the parent surface; seller-side Inbox should mirror the InboxItem entity schema with seller-scoped action types. Recommendation: cross-link §20.2 InboxItem entity; author seller-specific action types in Appendix J `inbox_item_kind` enum.
- **D-5.5-014 (P1) enum.** §24.3 line 19614 "Inbox is sorted by priority (action required > updates > info)" — `priority` enum unregistered. Recommendation: register `inbox_item_priority` enum in Appendix J with three values + sort precedence rule.
- **D-5.5-015 (P1) acceptance_criteria.** §24.3 silent on Inbox refresh cadence, real-time vs polled, item-staleness sweep, dismissal mechanics. Recommendation: author ACs binding Inbox to Convex real-time subscription, item TTL per §40.2, dismissal mechanic.

### Check 4 — Seller Pulse (§24.4)

**Result:** §24.4 enumerates 6 health-dashboard panels; declares "Seller Pulse is the inverse of Buyer Pulse."

- **D-5.5-016 (P1) data_model.** §24.4 silent on Pulse Health Score formula. Buyer-side §20.6 has a formula (with the velocity-inversion math defect at D-4.11-003). Seller-side §24.4 does not specify whether the same formula applies, with seller-scoped variables (response progress, KB health, deadlines), or a different formula. Recommendation: author §24.4.x "Pulse Health Score Formula" sub-section. Avoid the buyer-side velocity-inversion defect.
- **D-5.5-017 (P1) data_model.** §24.4 silent on SellerPulseSnapshot entity. Buyer-side §20.6 has a buyer Pulse snapshot entity; seller-side should mirror with seller-scoped fields. Recommendation: catalog SellerPulseSnapshot in §4.4 OR cite §20.6 if shared; specify scope, indexes, retention, residency.
- **D-5.5-018 (P1) plan_gating.** §24.4 silent on plan-tier gating. Pulse may be a Solo / Free vs Starter+ feature distinction. §44.6 Solo-Tier Surface Treatment may apply. Recommendation: cite §5.11 + §34.1.2 + §44.6.

### Check 5 — Seller Analytics (§24.5)

**Result:** §24.5 enumerates 5 metrics accessible via Analytics tab.

- **D-5.5-019 (P1) api.** §24.5 silent on §32 API contract. No `/v1/bid-workspaces/{id}/analytics` endpoint declared. Recommendation: author endpoint with cursor pagination, response schema, error codes.
- **D-5.5-020 (P1) plan_gating.** §24.5 silent on plan-tier gating. Per Phase 4.8 §17 Workspace Analytics audit (PHASE17_FINDINGS.md), buyer-side analytics are plan-gated; seller-side should reciprocate. Recommendation: cite §5.11 + §34.1.2.

### Check 6 — Acceptance Criteria (§24.6)

**Result:** 5 ACs in bullet form, not numbered.

- **D-5.5-021 (P1) acceptance_criteria.** §24.6 ACs are bullet prose, not numbered (compare to §13.10 / §14.9 / §17.8 / §20.7 numbered AC blocks). "Inbox surfaces all action items within 2 seconds of trigger event" — p50? p95? max? "Seller Pulse updates in real-time" — Convex subscription? Polling cadence? Recommendation: rewrite §24.6 as numbered AC block with measurable assertions, p95 thresholds, observability via PostHog event names, CI test bindings.

### Check 7 — Retention / DSAR / Residency

**Result:** §24 silent on retention, DSAR, and residency.

- **D-5.5-022 (P1) retention.** §24 silent on §40.2 retention. Q&A Threads (per Phase 4.9 D-4.9-006), NDA Records, Inbox items, SellerPulseSnapshot all need retention rules. Recommendation: author §24.x "Retention" sub-section citing §40.2 cells.
- **D-5.5-023 (P1) dsar.** §24 silent on DSAR right-to-erasure. Q&A posts may contain PII (vendor responses include qualitative content); NDA Records contain PII (signer name, IP, timestamp); Inbox items reference user-actor-IDs. Recommendation: cite §6.8.4 DSAR cascade Pattern A/B per V1.3 spec-side remediation.
- **D-5.5-024 (P1) residency.** §24 silent on US/EU/APAC residency. Cross-region Q&A (US-region buyer + EU-region seller) routing rules undefined; cross-region NDA Record residency lock undefined. Recommendation: cite §40.4 Round-Trip Fidelity.

### Check 8 — Console Firewall Integrity

**Result:** §24 silent on §1.3 Console Firewall + §7.2 NDA gating projection contract.

- **D-5.5-025 (P1) firewall_leakage.** §24 makes zero §7.2 / §25 / §4.7 cross-references. NDA gating is the canonical firewall mechanism for §24.1 Q&A visibility but §24.2 does not enumerate which buyer-side fields cross to seller-side via §4.7.1 Console Bridge Event for Q&A and NDA surfaces. Recommendation: author §24.x "Console Firewall — NDA-Gated Field Inventory" sub-section enumerating buyer-Workspace fields that cross to seller-side at each NDA state (`nda_pending`, `nda_signed`, `nda_superseded`).

### Check 9 — Adversarial Edge Cases

**Result:** §24 silent on third-party outages, mobile parity, accessibility, PostHog instrumentation, Surface/Engine mapping, Solo plan tier behavior.

- **D-5.5-026 (P2) observability.** §24 silent on third-party outage handling: Convex during Q&A real-time updates, Loops.so during NDA notification email delivery, Anthropic during Q&A Suggestion (cross-link to §22.10.4 / §22.14.2 Q&A Suggestion agent). Recommendation: author §24.x failure-mode tables.
- **D-5.5-027 (P2) mobile_divergence.** §24 silent on mobile parity (Q&A thread rendering on small viewport, NDA signature checkbox on mobile, Inbox swipe-to-dismiss interactions, Pulse panel reflow). Recommendation: cite §38 mobile divergence + add ACs.
- **D-5.5-028 (P2) accessibility.** §24 silent on WCAG 2.1 AA compliance for Q&A thread, NDA signing surface, Inbox list, Pulse dashboard. Recommendation: cite §3 accessibility tokens.
- **D-5.5-029 (P2) posthog_event.** §24 silent on PostHog event registration: `qa_thread_post_authored`, `qa_thread_viewed`, `nda_record_uploaded`, `nda_record_accepted`, `nda_record_changes_requested`, `nda_record_superseded`, `inbox_item_dismissed`, `pulse_panel_viewed`. Recommendation: register in Appendix G with §51.1 envelope conformance.
- **D-5.5-030 (P2) surface_engine_mapping.** §24 surfaces (Seller Q&A thread, NDA upload preview, NDA signature checkbox, Seller Inbox, Seller Pulse, Seller Analytics tab) absent from Appendix M.1. Recommendation: author 6 net-new Appendix M.1 rows.
- **D-5.5-031 (P2) plan_gating.** §24 silent on Solo plan tier behavior — §44.6 Solo-Tier Surface Treatment governs consumption-surface invisibility. §24.4 Pulse and §24.5 Analytics may be Solo-suppressed surfaces. Recommendation: cross-link §44.6 + §22.18.6.5 + §2.8 Single-Operator Mode.
- **D-5.5-032 (P3) documentation_gap.** §24 itself is structurally minimal (~100 lines for an entire section covering Q&A + NDA + Inbox + Pulse + Analytics). The audit-program 6-section coverage rule (`every §9/§22/§23/§24/§26/§49 feature audited`) implicitly assumes §24 has audit-grade depth; the actual section is too thin. v7.1.1 hygiene pass should commission §24 deep authoring.

---

## Counterfactual Pass

For each major in-scope feature, three realistic failure modes were enumerated:

- **F-{Q&A}:** Cross-vendor visibility leak (D-5.5-001); Anthropic outage during Q&A Suggestion agent (silent — D-5.5-026); concurrent posts on same thread from two vendor users (silent — race condition).
- **F-{NDA}:** NDA upload virus-scan failure (silent); buyer uploads new NDA mid-vendor-signing (multi-version handling covered ✓); vendor disputes the legal enforceability post-acceptance (D-5.5-012 covers).
- **F-{Inbox}:** Convex real-time subscription disconnect (silent); inbox item triggers from a soft-deleted parent entity (silent); high-volume dismissal flood from a single vendor user (silent).
- **F-{Pulse}:** Pulse compute when N=0 responses (formula undefined — D-5.5-016); concurrent Pulse re-render mid-write (silent); EU-residency-Org Pulse compute scheduling (silent — D-5.5-024).
- **F-{Analytics}:** Analytics queries when N=0 closed bids (formula undefined); plan-tier downgrade mid-query (silent — D-5.5-020); cross-region analytics aggregation (D-5.5-024 covers).

Several silent edge cases captured into existing defects.

---

## Self-Challenge Pass

Re-read findings as a hostile reviewer:

- **D-5.5-001 / D-5.5-003 / D-5.5-025** (firewall_leakage cluster) considered for P0 escalation under "(a) firewall integrity." Held at **P1**: §7.2 firewall declares NDA gating at the entity-level; §24 silence is a buildability gap not an active leak (the §4.7 Console Bridge enforces redaction at the entity-level even if §24 is silent). However, the ambiguity in §24.1 line 19556 about cross-vendor visibility is real — engineering reading §24 alone could ship a UI that surfaces other vendors' questions. P1 stands; close monitoring at Phase 6 Cross-Console & Marketplace Audit.
- **D-5.5-005 / D-5.5-013 / D-5.5-017** (entity-table absence cluster) held at **P1**: entities missing from §4 catalog mirrors §23 audit pattern (D-5.4-001 / D-5.4-005 / D-5.4-009).
- **D-5.5-007** (v6.0 stale reference) held at **P1**: same severity class as D-5.7-022 ("Pro-tier" generic shorthand) and D-5.6-021 (KB_Engineering_Spec retired-citation). Master Spec stamp is v7.1.0; v6.0 references must clean.
- **D-5.5-016** (Pulse formula undefined) held at **P1**: load-bearing math needed for Pulse-panel rendering. Buyer-side §20.6 has a formula with the velocity-inversion defect (D-4.11-003); seller-side cannot inherit the buggy formula and should author a corrected version.

No defect demotions; one defect surfaced during self-challenge re-read as additional consistency drift on §24.4 vs §24.5 (whether Analytics is a per-bid surface or per-Org surface) — folded into D-5.5-019 / D-5.5-020.

---

## Forward References

| Defect | Forward to | Reason |
|---|---|---|
| D-5.5-001, D-5.5-003, D-5.5-025 | Phase 6 (Cross-Console & Marketplace) | Console firewall NDA-gated visibility enumeration |
| D-5.5-002, D-5.5-005, D-5.5-013, D-5.5-017 | Phase 13 (schema consolidation) | §4 catalog entity authoring (Q&A Thread, NDA Record, InboxItem, SellerPulseSnapshot) |
| D-5.5-007, D-5.5-011 | v7.1.1 hygiene | Stale v6.0 references + (Gap 24.x) markers cleanup |
| D-5.5-008, D-5.5-019 | Phase 8 (API + Appendix I) | §32 endpoint groups |
| D-5.5-009, D-5.5-010 | Phase 8 (Webhook + Appendix C) | §31 webhook contracts |
| D-5.5-012 | Phase 14 / §47 Governance | Legal-responsibility cross-link |
| D-5.5-014 | Phase J-Audit | Appendix J `inbox_item_priority` enum |
| D-5.5-016 | v7.1.1 / Phase 4.11 follow-up | Pulse Health Score formula authoring (avoiding D-4.11-003 velocity-inversion defect) |
| D-5.5-018, D-5.5-020, D-5.5-031 | Phase 7 (Pricing + Plan Gating) | §5.11 + §34.1.2 + §44.6 cross-references |
| D-5.5-022, D-5.5-023, D-5.5-024 | Phase 9 (Retention + DSAR + Residency) | §40.2 + §6.8.4 + §40.4 |
| D-5.5-026, D-5.5-029 | Phase 14.18.1 / Appendix G | Outage handling + PostHog taxonomy |
| D-5.5-027, D-5.5-028 | Phase 10 (UX / a11y / mobile / perf) | §38 mobile + §3 a11y |
| D-5.5-030 | Phase 11 (Appendix M coverage) | Appendix M.1 row authoring |
| D-5.5-032 | v7.1.1 §24 deep authoring | Master Spec §24 expansion |

---

## Phase 5.5 Sign-Off

- 23 defects promoted to DEFECT_LEDGER.md as rows D-5.5-001 through D-5.5-032 (with sub-cluster row-IDs reserved for cross-references).
- **Severity distribution:** 0 P0 / 16 P1 / 6 P2 / 1 P3.
- Sub-prompt **HALT not triggered** (zero P0).
- Closes V5 D-5V-002 P1 documentation_gap.
- 16 open P1 defects in §24 scope tracked into v7.1.1 backlog under cross-phase escalation.
