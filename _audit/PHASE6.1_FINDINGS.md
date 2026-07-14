# Phase 6 / Prompt 6.1 — Cross-Console Mechanics (§25) — Scratch Log

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Prompt 6.1 walks §25 end-to-end with cross-reference to §4.7 Cross-Console Bridge Entities.

**Audit posture.** Non-destructive. Findings are filed against `DEFECT_LEDGER.md` per `Audit_Prompts.md → Defect Ledger Format`. Defect-id mnemonic for this prompt: `D-6.1-NNN`.

**Convention abbreviations.** ME = Master Spec; APX-C = Appendix C (Notification Event Catalog); APX-F = Appendix F (Webhook Retry & Recovery); APX-G = Appendix G (PostHog Event Taxonomy); APX-I = Appendix I (Error Code Catalog); APX-J = Appendix J (Controlled Vocabulary Registry); APX-K = Appendix K (Glossary); APX-L = Appendix L (Entity State Machines); APX-M = Appendix M (Surface/Engine Mapping). All sources are inside `Sourcera_Master_Spec.md`.

---

## 1. Section Inventory

§25 sub-sections audited end-to-end:

- §25.1 Data Flow via Console Bridge (incl. §25.1.1 Directional Surface Inventory; §25.1.2 Entity-Level Redaction Rules; §25.1.3 Allow-List Evolution)
- §25.2 Sync Behavior, Bounded-Lag SLO & Retry (§25.2.1–§25.2.6 incl. Kill-Switch Notification Suppression)
- §25.3 Disqualification (Gap 25.2) — §25.3.1–§25.3.16 (16 sub-sections)
- §25.4 Acceptance Criteria (top-level §25 ACs)
- §25.5 Materialization Protocol (Buyer Requirement → Seller Bid Response) — §25.5.1–§25.5.10 (10 sub-sections)
- §25.6 Console Bridge Observability — §25.6.1–§25.6.6
- §25.7 Internal Comments — §25.7.1–§25.7.14 (out-of-scope for this prompt; covered separately by Phase 6 follow-on prompt — only the firewall-NEVER-CARRIED invariant is sampled here as a cross-reference to §25.1.2)

Cross-referenced entities (§4.7):
- §4.7.1 Console Bridge Event (incl. §4.7.1.1 Retention & DSAR Cascade)
- §4.7.2 Vendor Disqualification Record

External cross-references walked: §1.3 Dual-Console Data Isolation; §1.4 Query Scoping; §6.8 DSAR; §7.2 (the §7.2 anchor target as actually authored — see DRIFT below); §31 Webhook contract; §32.8 idempotency; §40.2 Retention; §42 Observability; §50 Ops Console (kill-switch + bridge dashboards); §51 PostHog/Usage envelope; APX-C, APX-F, APX-G, APX-I, APX-J.

---

## 2. Convention Walk Per Audit Prompt

The 14-point audit checklist applied to §25 + §4.7 produced the findings enumerated in §3 below. Highlights:

| Convention | §25 / §4.7 Result | Notes |
|---|---|---|
| 1 — Entity definition | Mostly compliant. §4.7.1 and §4.7.2 carry full field tables, indexes, scope isolation, retention, residency. | Two enums `firewall_isolation_token` (§4.7.1) and `redaction_verification_hash` are field types but no AC describes their use beyond the seller serializer integrity test. |
| 2 — Acceptance criteria | Mostly compliant; conflicts in SLO phrasing (per-event vs percentile) — see D-6.1-005. | |
| 3 — Enum registration in APX-J | **Failing.** 5 console-bridge enums and 5 vendor-disqualification enums referenced as `See Appendix J <name>` but never registered as discrete H3 sections in APX-J. See D-6.1-002 and D-6.1-003. | |
| 4 — Glossary in APX-K | Spot-checked. "Console Bridge", "Daily Bridge Reconciliation" present (line 47189). "Bridge Health panel", "Sync Health panel", "Materialization Protocol", "Kill-Switch", "fanout group" not registered in APX-K. P3. | |
| 5 — State machines | Compliant for §4.7.1 (full From/To/Trigger/Conditions/Notes table) and §4.7.2 (cascade stages); §25.3.3 also tabular. | |
| 6 — APIs | §25.3.9 + §25.3.10a are at §32 fidelity (method, path, scopes, rate-limit, idempotency, examples, error tables). | |
| 7 — Webhooks | **Failing.** `vendor.disqualified.org_level`, `console_bridge.dlq_entered`, `console_bridge.reconciliation_summary`, `seller.bid_response.amendment_needs_reverification` are referenced as catalogued webhooks but absent from APX-C / APX-G. See D-6.1-006, D-6.1-007, D-6.1-008. | |
| 8 — Plan gating | §25.3.16 acknowledges that the §5.11 update is deferred to a "follow-on pass" — Known Gap. P3. | |
| 9 — Retention & privacy | §4.7.1.1 establishes the retention + DSAR cascade contract for bridge events; §4.7.2 inherits Workspace + 7y. Pattern B per-entity table is solid. | |
| 10 — Numerical singletons | Compliant. 30 s SLO, 256 KB payload cap, 24 h `Idempotency-Key` window all cited. | |
| 11 — Heading syntax | Compliant. All H2 / H3 / H4 / H5 carry anchor slugs. | |
| 12 — Surface/engine mapping APX-M | Spot-checked. "Console Bridge" appears in APX-M; "Bridge Health panel", "Sync Health panel", "Materialization Protocol" coverage to be confirmed in Phase 11 (UX/surface) but worth flagging. | |
| 13 — **Console firewall** | **CRITICAL.** `fanout_group_id` carries cross-vendor cardinality information to seller despite §25.1.2 invariant. See D-6.1-001 (P0). | |
| 14 — Edge cases | §25.2.6 Kill-Switch Notification Suppression and §25.5.6 (8 failure modes) cover most edge cases. Mobile parity for the §25.2.3 Bridge Health / Sync Health panels and the §25.3.8 vendor-side reversal banner is unstated. P2. | |

---

## 3. Defect Findings (promoted to DEFECT_LEDGER.md)

### P0 — Console Firewall Integrity

#### D-6.1-001 — `fanout_group_id` cardinality side-channel
- **Class.** `firewall_leakage`.
- **Location.** §4.7.1 row-level seller projection table, line 7793 (the `fanout_group_id` row).
- **Evidence.** ME 7793: `| fanout_group_id | full | **null when fan-out group spans multiple seller Orgs** (the fan-out cardinality is buyer-internal); full when the group is single-seller (the seller learns no cross-vendor information) | full |`. The "null when multi-seller / full when single-seller" rule produces a binary inference: seller observes `fanout_group_id IS NOT NULL` ⇒ seller infers cardinality = 1 (i.e., "I am the sole vendor on this evaluation"); seller observes `fanout_group_id IS NULL` on a fan-out kind (`amendment_broadcast`, `eoi_acceptance_propagated`) ⇒ cardinality > 1.
- **Why P0.** §25.1.2 ME 19702 Target Account row: "A seller CANNOT learn which other sellers are in the buyer's Target Account list, **their order, their status, or their count**." The single-seller exception in §4.7.1 directly violates this invariant (count = 1 is leaked). The leak is also temporally exploitable — a seller observing the field transition from non-null (broadcast-of-1, themselves) to null (broadcast-of-N, after buyer adds competitors) deduces "competitors were added between time T1 and T2." The audit prompt's CHECK #6 says "file P0 for any identifier or field that could uniquely re-identify a buyer from the seller side or vice versa." Leaking the cardinality of a buyer's fan-out group qualifies as uniquely identifying buyer-internal authoring composition.
- **Convention violated.** §25.1.2 "Vendor-List Membership NEVER CARRIED as a set" invariant; §1.3 Dual-Console Isolation Model.
- **Recommendation.** Always-null `fanout_group_id` on the seller projection regardless of cardinality, OR replace with a per-recipient opaque pseudonym derived from `HMAC(fanout_group_id, seller_org_id)` so that the seller cannot infer cardinality but can still correlate two events they themselves received within the same group. Update the §4.7.1 row-level projection table; add a property test `console_bridge_seller_projection_no_fanout_cardinality_leak` enumerating both single-seller and multi-seller fan-out shapes and asserting no observable difference in row-level fields. Update §25.1.2 invariant assertions if needed.

---

### P1 — Build-Blocking

#### D-6.1-002 — `console_bridge_event_kind` enum not registered in APX-J
- **Class.** `enum`.
- **Location.** ME §4.7.1 line 7741 (`event_kind` field cites `See Appendix J console_bridge_event_kind`); APX-J body (lines 43968–46983).
- **Evidence.** §4.7.1 line 7741 enumerates 18 values inline (`requirement_created` … `workspace_reopened_ops`) and binds them to APX-J `console_bridge_event_kind`. APX-J grep for `console_bridge_event_kind` returns zero discrete H3 / H4 entries. CI gate `console_bridge_event_kind_completeness` is asserted (line 7741) but cannot bind to APX-J without an explicit registration. The Phase 14.13a v7.1.1 backlog (CLAUDE.md §16) lists "audit-event / enum / error code rollup" — likely encompasses this enum but does not name it.
- **Convention violated.** Authoring Convention #3: every enum value used in §4–§51 is registered in APX-J.
- **Recommendation.** Author APX-J entry: ``### `console_bridge_event_kind` (§4.7.1)\n\n`requirement_created`, `requirement_amended`, `requirement_reverted`, `requirement_locked`, `use_case_structure_changed`, `qa_thread_post_appended`, `phase_advanced`, `nda_executed`, `response_submitted`, `response_locked`, `disqualification_issued`, `workspace_canceled`, `amendment_broadcast`, `buyer_comment_visible_to_vendor`, `eoi_acceptance_propagated`, `eoi_acceptance_reversed`, `revert_propagated`, `workspace_reopened_ops`\n\n**Notes.** Authored-Extension permitted per §4.7.1 line 7741. New `event_kind` values gated by §M.4 `appendix_m_coverage_on_diff` CI gate plus Authored-Extension ledger row. Forbidden-kind contract enforced by §M.5 `console_bridge_no_defense_view_event_kinds` (Defense View) and `console_bridge_no_dsar_event_kinds` (DSAR Lifecycle).``

#### D-6.1-003 — Four other Console Bridge Event enums not registered in APX-J
- **Class.** `enum`.
- **Location.** ME §4.7.1 lines 7742, 7750, 7755, 7757; APX-J body.
- **Evidence.** The following enums are referenced as `See Appendix J <name>` but absent from APX-J:
  - `console_bridge_event_direction` (line 7742): `buyer_to_seller`, `seller_to_buyer`
  - `console_bridge_event_sync_status` (line 7750): `pending`, `synced`, `retrying`, `failed`, `dlq`, `superseded`
  - `console_bridge_event_failure_reason` (line 7755): `target_bid_workspace_missing`, `target_bid_workspace_disqualified`, `vendor_withdrawn`, `bid_workspace_readonly`, `schema_mismatch`, `payload_too_large`, `downstream_timeout`, `persistent_firewall_violation_suspected`, `other_transient`, `other_permanent`
  - `console_bridge_event_conflict_resolution` (line 7757): `last_write_wins`, `buyer_origin_wins`, `operation_non_idempotent_dlq`, `merge_op`
- **Convention violated.** Authoring Convention #3.
- **Recommendation.** Register each enum as an APX-J H3 entry citing §4.7.1. Tie enum bindings to the existing CI gate `appendix_j_enum_completeness` and add explicit consumer-coverage assertions per §M.5.

#### D-6.1-004 — Five Vendor Disqualification enums not registered in APX-J
- **Class.** `enum`.
- **Location.** ME §4.7.2 lines 7948, 7954, 7959, 7962; §25.3.10a line 20303.
- **Evidence.** APX-J registers `vendor_disqualification_audit_action` (line 44076), `vendor_disqualification_cascade_status` (44082), `response_lock_reason` (44088), and the extended `bid_workspace_status` (44070). It does NOT register:
  - `vendor_disqualification_severity` (§4.7.2 line 7948): `soft`, `account_level`, `global_ban`
  - `vendor_disqualification_trigger` (line 7954): `workspace_owner_manual`, `automated_policy_violation`, `ops_compliance_action`, `vendor_non_responsive`, `vendor_withdrew_then_blocked`, `duplicate_bid_submission`
  - `vendor_disqualification_notification_style` (line 7959): `neutral_no_rationale`, `rationale_shared_with_vendor`, `silent_no_vendor_notification`
  - `vendor_disqualification_appeal_status` (line 7962): `not_offered`, `eligible`, `submitted`, `under_review`, `upheld`, `overturned`, `expired`
  - `vendor_disqualification_reversal_reason` (§25.3.10a line 20303): `buyer_workspace_owner_reversal_within_72h`, `ops_manual_reversal`, `appeal_overturned`, `system_error_rollback`
- **Convention violated.** Authoring Convention #3.
- **Recommendation.** Register each as an APX-J H3 entry; tie to CI gate `appendix_j_enum_completeness`.

#### D-6.1-005 — `vendor.disqualified.org_level` webhook not registered in APX-C / APX-G
- **Class.** `webhook`.
- **Location.** ME §25.3.10b line 20398 ("Registered in Appendix C Disqualification-Domain subsection... AND Appendix G..."); ME APX-C Disqualification-Domain Events table (lines 41700–41706); ME APX-G.
- **Evidence.** APX-C Disqualification-Domain table (line 41702 et seq.) lists 4 events: `vendor.disqualified`, `vendor.disqualification.reversed`, `disqualification.cascade_partial_failure`, `disqualification.notification_failed`. `vendor.disqualified.org_level` is absent. §25.3.13 AC #21 (line 20418) explicitly requires its registration. APX-G grep returns no `vendor.disqualified.org_level` entry.
- **Convention violated.** APX-C Coverage Invariant ("every webhook event named anywhere in the spec body MUST appear in this appendix exactly once"; line 41602). Authoring Convention #7. CI gate `appendix_c_webhook_catalog_completeness`.
- **Recommendation.** Add APX-C row with the buyer / seller / Ops projection rules from §25.3.10b verbatim and the `webhook_standard` retry curve. Add APX-G row with full property schema.

#### D-6.1-006 — `console_bridge.dlq_entered` webhook not registered in APX-C
- **Class.** `webhook`.
- **Location.** ME §4.7.1 AC #7 line 7895; §25.4 AC #7; §25.6.4 (kill-switch pass-through clause) line 19801; APX-C lines 41596–42072.
- **Evidence.** §4.7.1 AC #7 mandates `console_bridge.dlq_entered` webhook fires within 10 seconds of DLQ transition. §25.4 AC #6 / AC #8 also reference it. APX-C carries a `console_bridge.dlq_storm` aggregate event (line 41934) but NOT `console_bridge.dlq_entered`. Per APX-C Coverage Invariant: every webhook named in the spec body must appear in APX-C exactly once.
- **Convention violated.** APX-C Coverage Invariant; CI gate `appendix_c_webhook_catalog_completeness`.
- **Recommendation.** Add APX-C row to the Console-Bridge-Anomaly-Domain subsection: `console_bridge.dlq_entered` with retry class `webhook_standard`, payload schema (`{event_id, console_bridge_event_id, event_kind, buyer_workspace_id_handle, bid_workspace_id, failure_reason, retry_count, last_attempt_at, dlq_entered_at}`), recipients (Buyer Org + Seller Org webhook endpoints with seller-projection redaction), and "No / No" in-app + email cells (webhook-only).

#### D-6.1-007 — `console_bridge.reconciliation_summary` webhook not registered in APX-C
- **Class.** `webhook`.
- **Location.** ME §4.7.1 line 7870 ("Per §25.2, a 2am UTC job ... emits `console_bridge.reconciliation_summary` webhook (authored in Phase 4)"); §25.2.4 line 19781; §25.4 AC #6 line 20600; §4.7.1 AC #8 line 7896.
- **Evidence.** Multiple ACs require this webhook to fire on every daily reconciliation run. APX-C grep returns no entry. Same APX-C Coverage Invariant violation as D-6.1-006.
- **Convention violated.** APX-C Coverage Invariant; Authoring Convention #7.
- **Recommendation.** Add APX-C row in the Console-Bridge-Anomaly-Domain subsection with payload shape (`{event_id, run_started_at, run_completed_at, stale_count_total, stale_count_per_workspace[], escalated_to_dlq_count, redriven_count, residency_region}`); retry class `webhook_standard`. Also register `console_bridge.slo_summary` referenced at §4.7.1 AC #2 if intended as a webhook (else demote to a metric-only reference).

#### D-6.1-008 — Materialization Protocol webhook `seller.bid_response.amendment_needs_reverification` not registered in APX-C / APX-G
- **Class.** `webhook`.
- **Location.** ME §25.5.7 line 20695 (PostHog enumerated events); §25.5.9 line 20709 ("Appendix C gains `seller.bid_response.amendment_needs_reverification` webhook event"); §25.5.10.5 line 20745.
- **Evidence.** §25.5.10.5 AC requires the APX-C catalog entry to be present "with HMAC signing, idempotency via `event_id`, exponential backoff, and DLQ-after-5-failures semantics per §31." APX-C grep for `seller.bid_response` returns zero hits. APX-G grep for the seven materialization events (`seller.bid_response.materialized`, `seller.bid_response.amendment_applied`, `seller.bid_response.amendment_needs_reverification`, `seller.bid_response.reverted`, `seller.bid_response.locked`, `seller.bid_response.use_case_structure_changed`, `seller.bid_response.archived_by_buyer_remove`) also returns zero hits. §25.6.5 #4 (line 20824) and §25.5.10.6 (line 20751) bind the materialization-event-emission CI gate to APX-G coverage; the gate is currently unsatisfiable because the events are not registered.
- **Convention violated.** APX-C Coverage Invariant; APX-G Coverage Invariant (`event_family_appendix_g_coverage`); §25.5.10.5 AC.
- **Recommendation.** Register all seven `seller.bid_response.*` events in APX-G under the `bid_core` family with property schemas matching §25.5.7. Register `seller.bid_response.amendment_needs_reverification` in APX-C as a webhook (Bid-Response-Materialization-Domain subsection). The other six are PostHog-only per §25.5.7 — explicitly note "(PostHog only — webhook-side fanout via `seller.bid_response.amendment_needs_reverification`)" so APX-C readers don't mistake the absence for a defect.

#### D-6.1-009 — Eight reversal error codes from §25.3.10a not registered in APX-I
- **Class.** `error_code`.
- **Location.** ME §25.3.10a line 20346–20357 (errors table); APX-I Disqualification Errors subsection lines 43347–43366.
- **Evidence.** §25.3.10a registers 8 error codes for the reversal endpoint:
  - `vendor_disqualification_reversal_role_forbidden` (403)
  - `vendor_disqualification_reversal_window_expired` (422)
  - `vendor_disqualification_already_reversed` (409)
  - `vendor_disqualification_reversal_note_required` (422)
  - `vendor_disqualification_reversal_appeal_not_applicable` (422)
  - `vendor_disqualification_reversal_appeal_not_found` (422)
  - `disqualification_reversal_cascade_partial_failure` (207)
  - (`workspace_archived` 403 reuses an existing code — OK)
  
  None appear in APX-I Disqualification Errors subsection. The §25.3.10a table itself binds the codes to APX-I via §25.3.15, but §25.3.15 line 20583 only lists the 13 creation-side codes; the reversal codes are missing.
- **Convention violated.** Authoring Convention #6 (every endpoint declares error codes registered in APX-I).
- **Recommendation.** Append the 8 reversal codes to APX-I Disqualification Errors subsection with HTTP status, meaning, and a citation to §25.3.10a.

#### D-6.1-010 — `vendor_disqualification_global_ban_requires_dual_signoff` not registered in APX-I
- **Class.** `error_code`.
- **Location.** ME §4.7.2 AC #2 line 8055; APX-I.
- **Evidence.** §4.7.2 AC #2: "Creating `severity=global_ban` without Ops leadership dual-signoff MUST be rejected with `vendor_disqualification_global_ban_requires_dual_signoff` (new; Appendix I; HTTP 403)." APX-I Disqualification Errors subsection (lines 43347–43366) does not list this code.
- **Convention violated.** Authoring Convention #6.
- **Recommendation.** Add to APX-I. Note: the HTTP code 403 is debatable — for a missing dual-signoff input field, HTTP 422 is conventional under §32 input-validation errors; HTTP 403 implies the caller has some credential they're being denied. See D-6.1-016 (P2) for the status-code review.

#### D-6.1-011 — Nine `console_bridge_event_*` / `console_bridge_materialization_*` error codes not registered in APX-I
- **Class.** `error_code`.
- **Location.** ME §4.7.1 (multiple), §25.5.8, §25.6.6.5; APX-I.
- **Evidence.** The following codes are referenced inline as `(new; Appendix I; HTTP NNN)` but absent from APX-I:
  - `console_bridge_event_seller_write_forbidden` (403; ME 7777, 7731)
  - `console_bridge_event_direct_write_forbidden` (403; ME 7778)
  - `console_bridge_event_payload_too_large` (413; ME 7880)
  - `console_bridge_event_cross_org_access` (404; ME 7776)
  - `console_bridge_event_cannot_redrive_disqualified` (409; ME 7885)
  - `console_bridge_event_invalid_transition` (409; ME §25.5.5 line 20673; §25.5.8 line 20701)
  - `console_bridge_materialization_schema_mismatch` (422; ME §25.5.8 line 20701)
  - `console_bridge_materialization_residency_mismatch` (422; ME §25.5.8 line 20701)
  - `ops_kill_switch_release_note_missing` (422; ME §25.6.6.5 line 20860)
  - `console_bridge_event_firewall_violation` (422; ME 7845, 7892, 20769) — partial: the catalog at APX-I line 43433 references the validator name as a side-effect of `firewall_violation` (the MCP-firewall code), but `console_bridge_event_firewall_violation` is not registered as its own entry.
- **Convention violated.** Authoring Convention #6.
- **Recommendation.** Add a new "Console Bridge Errors (§4.7.1, §25.5)" subsection to APX-I (parallel to "Disqualification Errors (§25.3)") with all 10 codes. Disambiguate `console_bridge_event_firewall_violation` from the MCP `firewall_violation` so that consumers can route the two to different alerting paths.

#### D-6.1-012 — `console_bridge_standard` retry curve referenced but not defined in APX-F
- **Class.** `webhook` (also `consistency_drift`).
- **Location.** ME §4.7.1 line 7753 ("§31 retry-curve class `console_bridge_standard`"); APX-C line 41934 (`console_bridge.dlq_storm` row says "Appendix F `console_bridge_standard`"); APX-F lines 42074–42139.
- **Evidence.** APX-F defines exactly two curves: F.1 Standard Retry Curve (5 attempts over 24h: 1 min / 15 min / 1 h / 6 h delays) and F.2 Tightened Financial-Impact Curve. APX-F's Phase 13 default-coverage rule (line 42076) explicitly says: "Authoring a new webhook event without an explicit retry-class assignment defaults to standard.... New event-type proposals attempting to introduce a third retry class MUST author it as a new §F.x subsection with rationale, AND MUST register the class membership in Appendix J `webhook_retry_class` enum." The `console_bridge_standard` class (1 s / 2 s / 4 s / 8 s / 16 s — 5 attempts over ~31 s) is structurally distinct from F.1 (over 24 h) but is NOT authored as F.3, NOT registered in APX-J `webhook_retry_class`, and NOT covered by APX-F's default rule.
- **Convention violated.** APX-F default-coverage rule (§F preamble line 42076); CI gate `webhook_default_retry_class`.
- **Recommendation.** Disambiguate. Two viable paths: (a) author APX-F §F.3 "Console Bridge Apply / Storm Curve" with the 1 s / 2 s / 4 s / 8 s / 16 s schedule, register in APX-J `webhook_retry_class = console_bridge_standard`, and clarify scope ("internal apply retry plus the `console_bridge.dlq_storm` aggregate webhook"); OR (b) split — keep the 1–16 s curve as a non-webhook bridge-apply schedule (rename to `bridge_apply_standard`, document in §25.2.2 only, never call it a webhook curve) and route every Bridge-domain webhook (`dlq_storm`, `dlq_entered`, `reconciliation_summary`, `slo_summary`) onto F.1 standard. Path (b) is preferred — it preserves the F.1/F.2 binary taxonomy and removes the third-class precedent. Update §4.7.1 line 7753 and APX-C line 41934 accordingly.

#### D-6.1-013 — `§7.2 Dual-Console Firewall` anchor drift
- **Class.** `documentation_gap` (also `consistency_drift`).
- **Location.** ME §1.3 (the actual data-isolation model), ME §7.2 (the actual section: "Organization Deletion Cascade"); ~50+ body citations of "Dual-Console Firewall (§7.2)".
- **Evidence.** ME §7.2 (line 10646) is titled "Organization Deletion Cascade" and authors the cascade behaviors when an Organization enters `deletion_in_progress`. The Dual-Console Firewall enforcement contract is actually authored in §1.3 (lines 1290–1312) Dual-Console Data Isolation Model and §1.4 Query Scoping Requirements. The body of the spec carries citations such as:
  - §4.7.1 line 7729: "Per Summary C.116 the bridge is the only mechanism that carries buyer data into a seller's Bid Workspace without breaching the Dual-Console Firewall (§7.2)."
  - §25.1 line 19655: "without breaching the Dual-Console Firewall (§7.2)"
  - §25.7.1 line 21000 and §31.8.1 line 25515: "The Dual-Console Firewall (§7.2) is preserved end-to-end..."
  - APX-K line 47169: "Dual-Console Firewall (§7.2) — Bridge Enforcement..."
  
  A junior reader following any of these citations to §7.2 lands on Organization Deletion Cascade, which is a different concern. The actual contract for cross-console reads, write rejection (HTTP 404 non-leak), Ops impersonation, and scope-isolation is at §1.3.2 + §1.4 + various entity-level Scope Isolation blocks.
- **Convention violated.** Authoring Convention #11 (heading anchor stability); Master Spec internal cross-reference hygiene.
- **Recommendation.** Two paths: (a) rename §7.2 to a different number, author a new §1.3.x "Dual-Console Firewall Enforcement Contract" consolidating the enforcement rules currently scattered, and update every "(§7.2)" cite in the spec; OR (b) add a redirect H3 inside §7.2 ("Note: this section authors the deletion cascade. The Dual-Console Firewall enforcement contract is at §1.3 + §1.4. Body citations of "(§7.2)" are anchor-shorthand for the firewall and resolve to §1.3.") and update APX-K to clarify. Path (b) is lower-touch; path (a) is correct.

---

### P2 — Ambiguous

#### D-6.1-014 — §4.7.1 AC #2 hard SLO conflicts with §25.2.1 percentile SLO
- **Class.** `acceptance_criteria`.
- **Location.** ME §4.7.1 AC #2 line 7890; §25.2.1 lines 19727–19733.
- **Evidence.** §4.7.1 AC #2: "Bounded-lag SLO (`synced_at - created_at ≤ 30000ms`) MUST be observable via the `slo_breach_flag` field..." — phrased as a per-event hard MUST. §25.2.1 line 19729 reframes: "≤ 30,000 ms (30 seconds) for ≥ 99% of events measured over a rolling 15-minute window... The p99 threshold is the authoritative SLO; the p100 (maximum) is a non-goal." The §25.2.1 explanatory paragraph itself acknowledges the divergence: "A junior reader approaching the prior MUST-≤-30,000-ms phrasing literally should read that as the per-event *target*; the rolling-window percentile is the enforcement contract." The §4.7.1 AC was not updated to match. A QA engineer reading §4.7.1 will write tests that fail intermittently on tail-case events; a SRE reading §25.2.1 will scope alerts on percentile breach. Two readers reach different test designs.
- **Convention violated.** Authoring Convention #2 (acceptance criteria observable + measurable + threshold).
- **Recommendation.** Rewrite §4.7.1 AC #2 to: "Bounded-lag SLO MUST hold per §25.2.1 — `slo_breach_flag` MUST be set for every event whose `slo_bounded_lag_ms > 30000`; the rolling 15-minute breach rate MUST be ≤ 1% per event kind per residency region per §25.2.1." Add a line in §25.4 AC #1 (already 99%-phrased; OK) and confirm `slo_breach_flag` field semantics in §4.7.1 line 7760 align with the percentile contract.

#### D-6.1-015 — `source_entity_version` exposed full to seller leaks buyer-internal authoring history
- **Class.** `firewall_leakage`.
- **Location.** ME §4.7.1 row-level seller projection table line 7798.
- **Evidence.** Line 7798: `| source_entity_version | full | full | full | Required for ordered-application invariants |`. The seller observes this field on every bridge event for every Requirement / Use Case / etc. Over the lifetime of an evaluation, a seller learns the full version history of every cross-bridged buyer entity (e.g., `requirement_id=X` at version 47 ⇒ buyer has amended this requirement 47 times). Authoring frequency is buyer-internal information about evaluation discipline, indecision, scope churn — none of which is meant to cross the firewall. Materialization (§25.5.5) requires version monotonicity for ordered application, but it does NOT require exposing the absolute version number to the seller — only `version-comparable-with-stored-version` semantics are required.
- **Convention violated.** §1.3 firewall-isolation principle; §25.1.2 NEVER-CARRIED invariants (the spec says "Workspace Analytics NEVER CARRIED" — version count IS workspace analytics).
- **Recommendation.** Replace `source_entity_version` on the seller projection with an opaque `bridge_source_handle_token` derived from `HMAC(source_entity_id, source_entity_version, bid_workspace_id)`. Materialization compares incoming token against the seller-stored `last_applied_source_handle_token` for monotonic ordering; absolute version numbers stay buyer-internal. Update §25.5.5 conflict-handling logic to use the token form. Add property test `console_bridge_seller_projection_no_version_leak` that asserts version is never observable to seller.
- **Severity rationale.** P2, not P0 — version count is incremental information leakage, not unique re-identification of a buyer entity. P0 is reserved for fields that uniquely re-identify a buyer or their cross-vendor list. A staff engineer could reasonably read this as acceptable; the audit prompt's standard for P0 is "uniquely re-identify"; a hostile reviewer could escalate to P1 if they argue authoring frequency reveals buyer-Org behavior patterns. Default to P2 with explicit upgrade path.

#### D-6.1-016 — `vendor_disqualification_global_ban_requires_dual_signoff` HTTP 403 vs §32 input-validation convention
- **Class.** `api`.
- **Location.** ME §4.7.2 AC #2 line 8055.
- **Evidence.** AC #2 mandates HTTP 403 for missing dual-signoff at `severity=global_ban` write time. Per §32 conventions and the §6.4 Severity P3+: HTTP 403 implies the caller has authentication but lacks permission for the action; HTTP 422 implies a body-validation failure. The dual-signoff requirement is a request-body precondition (a second signoff token / co-signer field is missing or invalid); the caller may have `ops_compliance_admin` permission and still be missing the signoff token. The current spec conflates the two semantics. The §25.3.9 errors table (line 20180) DOES use HTTP 403 for `vendor_disqualification_silent_forbidden_for_buyer` — that one is correctly 403 (the buyer has full permission, but the action class is Ops-only). In contrast, dual-signoff is a multi-party-input check, more like an idempotency-key validation than an RBAC denial.
- **Convention violated.** §32 status code semantics; §6.4 RBAC error-code conventions.
- **Recommendation.** Audit and either (a) keep HTTP 403 with rationale ("the caller cannot single-handedly authorize this action; co-signer required") and document; or (b) split into two errors — `vendor_disqualification_global_ban_role_forbidden` (403, caller is not in `ops_leadership` group) and `vendor_disqualification_global_ban_requires_dual_signoff` (422, caller is in group but request lacks `co_signer_signoff_token`).

#### D-6.1-017 — Bridge events do not emit AuditEvents — CHECK #7 unmet
- **Class.** `audit_event_gap` (subclass of `observability` per the ledger header taxonomy).
- **Location.** ME §4.7.1 (no AuditEvent emit); §25.6.4 line 20813 (kill-switch only); §4.6 AuditEvent (general).
- **Evidence.** The audit prompt CHECK #7: "Bridge events emit AuditEvents both consoles can read (with their own redactions)." §4.7.1 AuditEvent emission is implicit only — there is no field, AC, or paragraph that says routine bridge state transitions (`pending → synced`, `pending → retrying`, `retrying → dlq`, `*→superseded`, `dlq → pending` re-drive) emit AuditEvents. Only the §25.6.4 kill-switch emits `ops.bridge.kill_switch_engaged` / `_released` audit actions, and §25.7.7 explicitly says "Every read, write, moderation, visibility-change, and cross-console-read attempt on Internal Comment Thread / Post / Mention writes an §4.6 AuditEvent row" — but Internal Comments are not bridge events. Bridge state transitions and Ops re-drives are operationally significant (DLQ entry / re-drive, firewall-violation rejection, supersede semantics) and SHOULD be in the audit log; the §25.4 ACs and §4.7.1 ACs do not require this.
- **Convention violated.** §4.6 Audit Event coverage rule (every cross-Org or cross-console state-change writes an audit row); audit prompt CHECK #7.
- **Recommendation.** Author §4.7.1.2 "AuditEvent Emission per Bridge Transition" enumerating: (a) every state transition emits an `audit_event_action_type` value (`bridge_event_emitted`, `bridge_event_synced`, `bridge_event_retrying`, `bridge_event_dlq_entered`, `bridge_event_failed`, `bridge_event_superseded`, `bridge_event_redriven`), (b) write to the buyer Org's audit scope, (c) write to the seller Org's audit scope with the seller redaction projection (mirrors §4.7.1 row-level table), (d) Ops sees full fidelity. Update §25.4 ACs and §4.7.1 ACs. Update APX-J `audit_event_action_type` to register the new values. CI gate `bridge_event_audit_emission_completeness`.

#### D-6.1-018 — §4.7.2 AC #4 / §25.3.13 AC #4 / §25.4 AC #4 cascade-SLO conflict
- **Class.** `acceptance_criteria`.
- **Location.** ME §4.7.2 AC #4 line 8057; §25.3.13 AC #4 line 20471; §25.4 AC #4 line 20598.
- **Evidence.** §4.7.2 AC #4: "the full cascade ... MUST complete within 10 seconds for soft severity and 60 seconds for account_level (because fan-out may touch N workspaces)." §25.3.13 AC #4 (line 20471): "Target Account status transitions MUST be atomic with Bid Workspace status transitions and Audit Event write — single Convex mutation or transactionally-equivalent path." §25.4 AC #4 (line 20598): "Disqualification cascade ... MUST complete within 10 seconds of the disqualification mutation commit." §25.4 AC #4 omits the 60-second account-level / global-ban allowance. A QA engineer testing §25.4 AC #4 will fail any cascade > 10 s, including legitimate account-level cascades that legitimately take 60 s under the §4.7.2 rule.
- **Convention violated.** Authoring Convention #2; numerical singletons (each cascade SLO has one authoritative home).
- **Recommendation.** Update §25.4 AC #4 to: "Disqualification cascade — soft severity ≤ 10 seconds; account_level / global_ban ≤ 60 seconds (per §4.7.2 AC #4). Completion observable via `cascade_status=complete`." Add a single APX-L state-machine row or §39 row that publishes the per-severity SLO once.

#### D-6.1-019 — `disqualification.notification_failed` `failure_reason` enum not registered in APX-J
- **Class.** `enum`.
- **Location.** ME §25.3.10 line 20266 (`failure_reason ∈ {loops_5xx_exhausted, template_variable_missing, recipient_suppressed, seller_org_deleted}`); APX-C line 41705 (mirror); APX-J.
- **Evidence.** The four-value enum is referenced in two places but not registered in APX-J. APX-J grep returns no `disqualification_notification_failure_reason` or similar. Authoring Convention #3 requires registration.
- **Convention violated.** Authoring Convention #3.
- **Recommendation.** Register APX-J `disqualification_notification_failure_reason`: `loops_5xx_exhausted`, `template_variable_missing`, `recipient_suppressed`, `seller_org_deleted`. Note the consumer is the webhook payload + the audit row (`disqualification_notification_failed`).

#### D-6.1-020 — Mobile parity unstated for §25.2.3 Bridge Health / Sync Health panels and §25.3.8 vendor reversal banner
- **Class.** `mobile_divergence`.
- **Location.** ME §25.2.3 lines 19756–19773; §25.3.8 line 20038 (reversal banner); §38 Mobile Feature Parity Matrix.
- **Evidence.** §25.3.7 line 20023 explicitly addresses Disqualified-lane mobile parity (collapsed, six-tap reverse). §25.3.8 specifies the disqualification banner on mobile (line 20050 push notification). Neither §25.3.8 nor §25.2.3 specifies whether the reversal banner copy ("This Bid Workspace is open again...") renders parity-equivalent on mobile, nor whether the Bridge Health / Sync Health panels surface on mobile. §38 Feature Parity Matrix is not cited from §25.2.3 / §25.3.8 reversal. A junior frontend engineer would default to "desktop only" for these panels — but Bridge Health is operationally important for Workspace Owner who may be on mobile during a sync incident.
- **Convention violated.** Authoring Convention #14 (edge cases — mobile vs desktop divergence).
- **Recommendation.** Add a mobile-parity row to §25.2.3 (Bridge Health / Sync Health panels: "parity-collapsed on mobile per §38; full-fidelity DLQ table available via deep link") and to §25.3.8 (reversal banner: "renders parity-equivalent on mobile, push notification fires per §25.3.8"). Add §38 Feature Parity Matrix rows.

---

### P3 — Cosmetic / Drift

#### D-6.1-021 — APX-K Glossary missing entries: "Bridge Health Panel", "Sync Health Panel", "Materialization Protocol", "Kill-Switch", "Fanout Group"
- **Class.** `glossary`.
- **Location.** APX-K (lines 46983–47639); §25.2.3, §25.5, §25.6.4 surfaces.
- **Evidence.** APX-K registers "Console Bridge" (line 47169) and "Daily Bridge Reconciliation" (line 47189) but not the surface terms used across §25.2.3 ("Bridge Health Panel", "Sync Health Panel"), §25.5 ("Materialization Protocol", "needs-reverification"), §25.6.4 ("Kill-Switch"), §4.7.1 ("Fanout Group"). All five terms cross multiple sections.
- **Convention violated.** Authoring Convention #4 (every term used across more than one section appears in APX-K).
- **Recommendation.** Author 5 APX-K entries.

#### D-6.1-022 — §25.3.16 plan-gating defers §5.11 update to "follow-on pass"
- **Class.** `documentation_gap`.
- **Location.** ME §25.3.16 line 20591.
- **Evidence.** "§5.11 update authored in RECONCILIATION.md as part of this pass (the inline §5.11 table is updated in a follow-on pass per Known Gap)." Disqualification is currently inline-stated as plan-tier-agnostic ("§25.3.7 line 20013: 'Disqualification itself is a core workflow available on every plan tier'") and again in §25.3.16 — but §5.11 itself does not yet reflect the canonical "Core Workflows — All Tiers" row. CLAUDE.md §16 already lists Phase 14.9.2 (inline plan-tier-list audit, 27 locations) as a v7.1.1 backlog item.
- **Convention violated.** Authoring Convention #8 (plan gating reflected in §5.11 / §34.1 / §39; never duplicate inline).
- **Recommendation.** Land the §5.11 update in v7.1.1 hygiene pass. Roll under existing Phase 14.9.2 backlog.

#### D-6.1-023 — §25.3.6 forbidden-phrase locale list under-specified
- **Class.** `documentation_gap` (also `i18n`).
- **Location.** ME §25.3.6 line 19991.
- **Evidence.** "a per-locale blocklist of legally sensitive phrases (e.g., 'you are banned', 'compliance violation', 'security concern' in `neutral_no_rationale` mode) — reviewed by Legal quarterly per §40.2." The blocklist storage location, the §29 / §41 review surface, the audit trail for additions, and the per-locale rollout governance are not authored. The forbidden-phrase rejection at §25.3.9 line 20120 (`disqualification_notification_body_forbidden_phrase` HTTP 422) cites this list but the list itself is unanchored.
- **Convention violated.** §40.2 retention rule for the blocklist; Authoring Convention #14 (i18n / locale).
- **Recommendation.** Author a sub-bullet in §25.3.6 (or a §41 sub-section) specifying: (a) the blocklist entity (`DisqualificationForbiddenPhraseList` or attribute on `LoopsTemplate`), (b) per-locale storage, (c) Legal-review SLA (quarterly per §40.2), (d) audit trail. Cite from §25.3.9 errors table.

---

## 4. Self-Challenge Pass (Opus-mandatory)

Re-read findings as a hostile reviewer. Self-challenge log:

- **D-6.1-001 (P0 fanout cardinality leak).** Hostile reviewer: "Is this really uniquely re-identifying a buyer? The seller already knows they got the event." Yes — the leak is *cardinality of buyer's fan-out group*, which §25.1.2 explicitly forbids as part of the "Vendor-List Membership NEVER CARRIED" invariant. Even if no individual identifier is leaked, the BINARY signal "fanout_group_id is non-null vs null" is a durable cross-vendor inference. Severity P0 holds.
- **D-6.1-002 / D-6.1-003 / D-6.1-004 (P1 enum gaps).** Hostile reviewer: "These are de facto registered inline — does it matter if APX-J doesn't have an H3 entry?" Yes — the CI gate `appendix_j_enum_completeness` cannot bind to an inline enumeration; downstream consumers (CRM Sync mappings, audit-event validators, posthog property schemas) cannot mass-validate against an absent registry; and the v7.1.0 stamp-gate convention requires APX-J as the canonical home. P1 holds.
- **D-6.1-005–D-6.1-008 (P1 webhook/catalog gaps).** Hostile reviewer: "These are minor; the events still get delivered." But the APX-C Coverage Invariant is a stamp-gate ("CI gates `appendix_c_webhook_catalog_completeness`, `appendix_c_to_appendix_g_coverage`"); the absent registrations literally fail the stamp gate. P1 holds.
- **D-6.1-009 / D-6.1-010 / D-6.1-011 (P1 error-code gaps).** Hostile reviewer: "Engineering can read the spec section — the codes exist." But the APX-I single-source convention is required for SDK code generation, customer-visible documentation, and the error-code freshness audit. Inline-only codes will drift from the catalog. P1 holds.
- **D-6.1-012 (P1 `console_bridge_standard` retry curve).** Hostile reviewer: "This may just be terminology drift." The APX-F default-coverage rule (line 42076) is explicit: "New event-type proposals attempting to introduce a third retry class MUST author it as a new §F.x subsection... AND MUST register the class membership in Appendix J `webhook_retry_class` enum." Both unmet. P1 holds.
- **D-6.1-013 (P1 §7.2 anchor drift).** Hostile reviewer: "The body text says §7.2; that's the anchor — if §7.2 is the deletion cascade, then the spec means deletion cascade." But every body cite reads "Dual-Console Firewall (§7.2)" — the `(§7.2)` is anchor disambiguation, and it points at the WRONG anchor. A junior engineer will follow this anchor, find the deletion cascade, and conclude the firewall enforcement contract IS the deletion cascade. P1 (build-blocking confusion) holds.
- **D-6.1-014–D-6.1-020 (P2 ambiguities).** Reviewed; severity holds.
- **D-6.1-021–D-6.1-023 (P3).** Reviewed; severity holds.

Severity-classification revisions: none required.

---

## 5. Counterfactual Pass

Per audit prompt, enumerate three realistic failure modes per audited feature and confirm spec coverage. Sampled:

### Console Bridge Event (§4.7.1)

- **FM-A: A buyer authoring a Requirement amendment crashes mid-write.** §4.7.1 covers via the redaction validator + Convex mutation atomicity (event emission is a transaction side-effect on source mutation; line 7889 AC #1). ✅ Covered.
- **FM-B: Convex outage causes the bridge apply handler to be unreachable.** §4.7.1 retry curve (1s/2s/4s/8s/16s → DLQ) handles transient unavailability. ✅ Covered. *But* the curve is named `console_bridge_standard` and not registered (D-6.1-012).
- **FM-C: Buyer-internal scoring data accidentally embedded in `payload_json` via a developer mistake in the mutation handler.** §4.7.1 redaction-verification-hash + write-time validator + defense-in-depth seller serializer projection covers (line 7845 + line 7892 AC #4). ✅ Covered.
- **FM-D (NEW — discovered).** Seller observes single-seller `fanout_group_id` and infers cardinality. Spec acknowledges this in §25.1.2 invariant but the §4.7.1 row-level table contradicts. ❌ Not covered → D-6.1-001.

### Vendor Disqualification Record (§4.7.2)

- **FM-E: Buyer disqualifies a vendor whose Org is mid-deletion.** §4.7.2 FM #4 (line 8048) covers — appeal disabled with `vendor_org_deleted` note. ✅ Covered.
- **FM-F: Two Workspace Admins race on disqualification.** §25.3.12 FM1 covers via the unique partial index. ✅ Covered.
- **FM-G: Workspace Owner reverses while seller is composing a Q&A reply.** §25.3.4 reversal cascade restores compose surface; in-flight drafts preserved 24h per Summary §6.11. ✅ Covered.
- **FM-H (NEW — discovered).** `vendor_disqualification_global_ban_requires_dual_signoff` HTTP code semantics: spec says 403, but a missing-input precondition is more conventionally HTTP 422. → D-6.1-016.

### Materialization Protocol (§25.5)

- **FM-I: Buyer reverts to V1 after seller submitted against V3.** §25.5 reverification flag handles. ✅ Covered.
- **FM-J: Bid Workspace becomes `disqualified` mid-materialization.** §25.5.6 FM #1 covers via `target_bid_workspace_disqualified` failure reason. ✅ Covered.
- **FM-K: PostHog outbox dispatches a materialization event before Convex write commits.** §51.1.4 dual-write contract says Convex is source of truth; PostHog mirror lags. ✅ Covered.
- **FM-L (NEW — discovered).** Materialization PostHog events not registered in APX-G. The CI gate `console_bridge_observability_completeness #4` cannot bind. → D-6.1-008.

### Console Bridge Observability (§25.6)

- **FM-M: Kill-switch engaged for >1h causes the §25.2.5 24h email storm on release.** §25.2.6 covers (suppression + restoration notice). ✅ Covered.
- **FM-N: Reconciliation job fails to run.** §25.2.4 covers (heartbeat at 06:00 UTC + Ops page). ✅ Covered.
- **FM-O: Bridge events emit but no AuditEvent is written for the transition.** Spec is silent. → D-6.1-017.

---

## 6. Promotion to DEFECT_LEDGER

23 defects (1 P0, 12 P1, 7 P2, 3 P3) promoted to `DEFECT_LEDGER.md` under the `D-6.1-NNN` mnemonic.

Coverage matrix updates made for §25 features (see §7 below).

---

## 7. Coverage Matrix Updates

Surfaces audited:
- §4.7.1 Console Bridge Event — `firewall_leakage` ⚠ partial (P0); `enums` ❌ missing; `error_codes` ❌ missing; `acceptance_criteria` ⚠ partial; `audit_event` ❌ missing.
- §4.7.2 Vendor Disqualification Record — `enums` ❌ missing; `error_codes` ⚠ partial.
- §4.7.1.1 Retention & DSAR Cascade — `retention` ✅; `dsar` ✅.
- §25.1 Data Flow — `firewall_leakage` ⚠ partial (P0).
- §25.2 Bounded-Lag SLO & Retry — `acceptance_criteria` ⚠ partial; `webhook` ❌ missing.
- §25.2.6 Kill-Switch Notification Suppression — ✅.
- §25.3 Disqualification — `error_codes` ⚠ partial; `enums` ❌ missing; `webhook` ⚠ partial; `audit_event` ✅.
- §25.4 §25 ACs — ⚠ partial.
- §25.5 Materialization Protocol — `webhook` ❌ missing; `enums` ⚠ partial; `acceptance_criteria` ✅; `firewall_leakage` ✅.
- §25.6 Observability — `instrumentation_gap` ⚠ partial; `audit_event` ❌ missing for routine bridge transitions; `webhook` ❌ missing (`dlq_entered`, `reconciliation_summary`).

Coverage matrix cells updated in `COVERAGE_MATRIX.md` per the §6 promotion.
