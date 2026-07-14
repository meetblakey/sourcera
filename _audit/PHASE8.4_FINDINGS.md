# Phase 8 — Prompt 8.4 — Appendix I End-to-End Walk (Scratch Log)

**Started:** 2026-05-08
**Scope:** Appendix I (API Error Code Catalog), Master Spec lines 43490–44204.
**Walk depth:** Every error-code row read end-to-end. ~149 code rows across 22 sub-tables. Reverse pass against §32 endpoints (lines 26474–28570), §31 webhooks (lines 25440–26471), and plan-gating reject paths (§5.11 / §34.1 / §34.8).

---

## 1. Walk Inventory — Appendix I Sub-Sections

| # | Section Header | Lines | Rows |
|---|---|---|---|
| 1 | Standard HTTP Errors | 43492–43502 | 7 |
| 2 | Entity-Specific Errors | 43504–43522 | 14 (incl. 2 §21.4 inserts) |
| 3 | Limit & Entitlement Errors | 43524–43536 | 10 |
| 4 | Phase & Workflow Errors | 43538–43550 | 9 |
| 5 | Agent Errors | 43552–43564 | 9 (incl. §4.8.2 / §21.4 cluster) |
| 6 | Webhook Errors | 43566–43572 | 3 |
| 7 | Validation Errors | 43574–43584 | 7 |
| 8 | Disqualification Errors (§25.3) | 43586–43605 | 13 |
| 9 | Billing Endpoint Errors (§32.8) | 43607–43638 | ~28 (preamble enumerates 31 unregistered "elsewhere" codes) |
| 10 | Marketplace Discovery & Seller Outcome Signal Errors | 43640–43664 | ~22 |
| 11 | KB / MCP Server Errors (§22) | 43666–43691 | ~21 |
| 12 | KB Export Endpoint Errors (§32.9 / §22.18) | 43693–43711 | ~12 |
| 13 | Seller Pages & SEO Error Codes (§26.7–§26.10) | 43713–43727 | 11 |
| 14 | Error Response Schema (sample JSON) | 43729–43755 | 1 (sample) |
| 15 | PLG / Growth-Loop Error Codes (§48) | 43757–43767 | 7 |
| 16 | M1–M8 Growth-Mechanics Error Codes (§48.5) | 43769–43815 | ~38 |
| 17 | Taxonomy & Controlled-Vocabulary (§27.6) | 43816–43824 | 5 |
| 18 | Marketplace Abuse (§27.8) | 43826–43833 | 4 |
| 19 | Seller Signals & Buyer Opt-In (§27.9) | 43835–43854 | ~14 |
| 20 | CRM Sync (§31.9) | 43856–43882 | ~25 |
| 21 | §4.3 Buyer Console Entity Errors | 43884–43927 | ~24 |
| 22 | §4.4.19–§4.4.22 Marketplace Monetization & Seller Onboarding Errors | 43929–43973 | ~26 |
| 23 | §48 PLG / Hero Moment / Anti-Pattern Errors | 43974–44018 | ~22 |
| 24 | §50 Sourcera Ops Console Errors | 44019–44070 | ~26 |
| 25 | §51 Product Usage Analytics Errors | 44073–44100 | ~13 |
| 26 | v7.1.0 Surface-Abstraction Program Errors (§13.11 / §4.5.9 / §13.12 / §34.2.5 / §44.6) | 44102–44148 | ~14 |
| 27 | Phase 3V Audit-Remediation Errors | 44150–44204 | ~13 |

**Total registered rows in Appendix I:** ~149.

**Total unregistered codes referenced from §4–§51 inline as "(new; Appendix I)":** see D-V8.4-001 / D-V8.4-002.

---

## 2. Per-Code Audit Walk (Checks 1–5)

The walk applied the prompt's 5-check protocol to each row:

1. Code is stable, unique, and snake_case.
2. HTTP status mapping is consistent.
3. Description is unambiguous; client-facing message is localizable.
4. Retryability is annotated (transient / permanent).
5. Cross-references the endpoint(s) that can return it.

### Findings by check axis

**Check 1 (snake_case + uniqueness):**
- All ~149 code names are snake_case ✓.
- `ai_wallet_exhausted` appears in two rows (lines 43533 + 43558) → D-V8.4-009.
- `growth_loop_retired` appears in two rows (lines 43763 + 44006), with the catalog itself acknowledging duplicate at line 44006 → D-V8.4-010.

**Check 2 (HTTP status consistency):**
- `wallet_hard_capped` (HTTP 402, §4.8.3) vs `ai_wallet_exhausted` (HTTP 403, Appendix I) for what is canonically the same wallet-exhaustion condition → D-V8.4-003.
- `console_isolation_violation` (HTTP 403, line 43544) contradicts §7.2 dual-console firewall non-leak invariant which mandates HTTP 404 for cross-console reads → D-V8.4-007.
- `kb_export_console_forbidden` HTTP 403 (Appendix I line 43702) vs §22.18 prose at line 19120 mandating HTTP 404 (cross-Org non-leak) for the same condition → D-V8.4-018.
- HTTP 402 overloaded across "plan upgrade required" (`capability_requires_plan_upgrade`, `m8_plan_gate_insufficient`, `seller_signal_not_available_on_plan`, etc.) and "Stripe charge failed" (`solo_per_eval_charge_failed`, `solo_per_bid_charge_failed`, `hero_moment_wallet_cap_breached`) → D-V8.4-012.
- Cooldown semantics inconsistently mapped to 409 (`m6_claim_reclaim_cooldown_active`, `direct_invite_prior_decline_cooldown`) vs 429 (`m8_recompute_rate_limit_exceeded`, `seller_signal_direct_invite_rate_limit_exceeded`, `ops_session_customer_revocation_cooldown`) → D-V8.4-020.
- `audit_chain_break_detected` HTTP "—" and `kb_export_download_remints_exhausted` HTTP "200 (payload flag)" are mis-shelved as HTTP error rows → D-V8.4-011.

**Check 3 (description unambiguous + localizable):**
- No `localization_key` column in any of the 22+ sub-tables. Per audit-checklist #3, client-facing messages must be localizable. The §32.6 error envelope shows `code`, `message`, `details`, `request_id`; no convention for translating `message` → D-V8.4-013.
- `stale_token` (line 43674) conflates JWT revocation (security incident) and JWT expiry (lifecycle); two materially different conditions share one code → D-V8.4-014.
- Error Response Schema example (lines 43735–43750) uses backslash-escaped underscores (`gate\_validation\_failed`, `failing\_rules`, etc.) — markdown-escape leak; example is not valid JSON → D-V8.4-017.

**Check 4 (retryability annotation):**
- No `retryable` / `retry_class` column anywhere in the catalog. Across ~149 rows, only ~7 prose descriptions ("Retry recommended" on `agent_error`, `agent_timeout`; "Standard `Retry-After` header populated" on rate-limit codes; "Retry-After populated" scattered in §29 / §29.4 retries) annotate retryability. Audit-checklist #4 requires explicit annotation → D-V8.4-005.

**Check 5 (endpoint cross-references):**
- 7 legacy sub-tables (Standard HTTP, Entity-Specific, Limit & Entitlement, Phase & Workflow, Agent, Webhook, Validation) lack a "Used By" column. Newer tables include it (Marketplace Monetization §4.4.19+, Marketplace Abuse §27.8, CRM Sync §31.9, PLG/Growth §48, Ops Console §50, Defense View §13.11, EvalStarter §13.12) → D-V8.4-006.

---

## 3. Reverse Pass — §32 Endpoints → Appendix I Coverage

The §32.8 preamble at line 43607–43609 explicitly disclaims canonical-catalog status for 31 enumerated billing codes ("are catalogued in their respective entity sections; the table below catalogues codes introduced for the §32.8 endpoint surface itself"). This is a direct convention violation: every endpoint must declare error codes registered in Appendix I.

**31 unregistered codes** (per the §32.8 preamble): `ai_operation_immutable_after_settlement`, `ai_operation_invalid_transition`, `ai_operation_wallet_insufficient`, `ai_operation_cross_console_access`, `ai_operation_cross_org_access`, `ai_operation_direct_write_forbidden`, `ai_operation_legal_entity_residency_mismatch`, `ai_operation_managed_agent_depth_exceeded`, `ai_operation_locked_for_contest`, `ai_operation_contest_window_expired`, `wallet_role_forbidden`, `wallet_cross_org_access`, `wallet_hard_capped`, `wallet_topup_increment_out_of_range`, `capability_registry_concurrent_modification`, `capability_registry_missing_cost_base_seed`, `capability_no_active_outcome_contract`, `capability_requires_committed_spend`, `outcome_contract_rule_invalid`, `outcome_contract_concurrent_publish`, `outcome_contract_auto_accept_too_short`, `contest_already_filed`, `contest_provenance_hash_mismatch`, `contest_locked_for_dsar`, `contest_cross_org_access`, `committed_spend_discount_band_mismatch`, `pricing_table_breaking_change_requires_30d_notice`, `billing_seat_snapshot_immutable`, `billing_admin_role_insufficient`, `billing_admin_cross_org_access`, `billing_admin_grant_target_ineligible_role`.

→ D-V8.4-001 (rollup); D-V8.4-002 (named instance — `ai_operation_contest_window_expired`, prompt-required critical-code confirmation).

**Phantom endpoint reference:** Phase 3V Appendix I row `audit_chain_break_export_blocked | 503` (line 44158) targets `GET /v1/orgs/{org_id}/audit-events/export`. Line 28335 mentions a `POST` form. §32.8.X subsections stop at .22; no contract block exists. HTTP method ambiguous → D-V8.4-008.

---

## 4. Reverse Pass — §31 Webhooks → Appendix I Coverage

Appendix I `Webhook Errors` registers only 3 codes: `webhook_signature_invalid`, `webhook_payload_too_large`, `webhook_delivery_failed`. The §31 / §31.5 / §31.6 / Appendix F surface enforces signing, idempotency, retry, DLQ, and circuit-breaker semantics. Missing canonical codes:

- `webhook_endpoint_quarantined` (consumer in DLQ-saturated state per §31.5)
- `webhook_circuit_breaker_open` (per §31.5 circuit-breaker)
- `webhook_subscription_unauthorized` (caller lacks scope to subscribe)
- `webhook_event_kind_unknown` (subscription references unregistered event kind)
- `webhook_replay_attempt_rejected` (replay-of-fired-event protection)
- `webhook_idempotency_key_replayed` (deduplicated retry)

→ D-V8.4-015.

---

## 5. Reverse Pass — Plan-Gating Reject Paths → Appendix I Coverage

Plan-gating axis is well-covered: `feature_not_available_on_plan` (43527), `capability_requires_plan_upgrade` (43562), `m4_active_evaluations_cap_exceeded` (43798 — note 422 not 402; deliberate choice), `m8_plan_gate_insufficient` (43813), `seller_signal_not_available_on_plan` (43840), `seller_plan_tier_insufficient_crm_sync` (43875), `verification_review_plan_tier_insufficient` (43952), `promoted_listing_plan_tier_below_scale` (43934), `solo_subscription_active_per_*_charge_blocked` (44132–44133), `defense_view_capability_disabled` (44112), `trial_seat_buyer_below_scale` (43911).

Plan-gating reverse pass clean except for the HTTP 402 overload (D-V8.4-012).

---

## 6. Critical-Code Confirmation — Prompt-Required Set

| Critical Code (per audit prompt) | Status | Resolution |
|---|---|---|
| Defense View 5 codes (v7.1.0 sub-section) | **Confirmed present** | Lines 44110–44114 — `selection_record_not_finalized` (409), `regeneration_throttle` (429), `defense_view_capability_disabled` (402), `defense_view_archived_with_workspace` (404), `defense_view_cross_console_access` (404). Each carries §13.11.x cross-reference + CI-gate pairing line 44143. No defect filed. |
| AIOperation contest window expired | **Missing from Appendix I** | Referenced by emit-paths at lines 8165, 8546, 9238 but no Appendix I row. → D-V8.4-002. |
| AIWallet cap exceeded; auto-topup denied | **Partial / drift** | `wallet_hard_capped` (402, §4.8.3) referenced but not Appendix I-registered (D-V8.4-001 rollup); `ai_wallet_exhausted` (403, registered) is a same-condition-different-code drift (D-V8.4-003); no auto-topup runtime denial code (D-V8.4-019). |
| Capability not in plan | **Confirmed present** | `capability_requires_plan_upgrade` (line 43562, HTTP 402, §4.8.2 / §34.8.5 / §21.4.4 cross-reference). No defect. |
| Vendor opt-out blocks operation | **Missing** | Catalog has cross-console-access and reason-validation codes only (`vendor_opt_out_cross_console_access`, `vendor_opt_out_reason_note_required`); no AIOperation/capability-layer code for "opt-out blocks invocation." → D-V8.4-004. |
| KB MCP session expired | **Conflated** | `stale_token` (43674) covers both JWT revocation and JWT expiry. → D-V8.4-014. |
| Console firewall denial | **Mixed — legacy 403 leaks; newer 404 honors §7.2** | Newer rows (`*_cross_console_access` 404 non-leak): correct. `console_isolation_violation` (line 43544, 403): contradicts §7.2 → D-V8.4-007. `kb_export_console_forbidden` (line 43702, 403): contradicts §22.18 line 19120 (404) → D-V8.4-018. |

---

## 7. Counterfactual / Failure-Mode Pass

For Appendix I as the canonical error-code surface:

1. **Adversarial input:** A client posting a request with malformed `Idempotency-Key` header. `idempotency_key_request_mismatch` (43623) covers payload mismatch but not malformed format. Gap noted; not promoted (Phase 8.1 D-V8.1-020 already filed for `idempotency_key_body_mismatch`).
2. **Partial failure:** Console Bridge multi-stage commit. `disqualification_cascade_partial_failure` (43602, HTTP 207) handles disqualification; no parallel code for Marketplace-Discovery cascade (`marketplace_discovery_invalid_state_transition` exists for state, not partial failure across SKU+invoice+revrec). Not promoted in this sweep — already in Phase 8.1 D-V8.1-021 webhook-completeness queue.
3. **Dependency outage:** `service_unavailable` (503) catch-all + per-domain 503 codes (`retrieval_unavailable`, `kb_export_queue_saturated`, `crm_sync_review_queue_saturated`). Each handled.
4. **Auto-topup runtime decline (Stripe):** Configuration validators present (`wallet_autotopup_*`); runtime decline (card declined, fraud-blocked, processor unavailable) has NO synchronous error code. → D-V8.4-019.
5. **Vendor opt-out at AI-operation invocation:** No code. → D-V8.4-004.

---

## 8. Self-Challenge Pass (Hostile Reviewer)

Re-read each finding with the question: "Is the evidence reproducible? Is severity rule-based? Could the recommendation be sharper?"

- **D-V8.4-001:** Severity P1 confirmed — buildable test fails because the canonical catalog disclaims coverage. Recommendation tightened to enumerate the 31 codes as a single rollup migration with §M.5 CI-gate `appendix_i_billing_code_completeness`. Cross-link to D-1.7-014 (parent — already filed). Hostile reviewer accepts: "Phase 1.7 D-1.7-014 already covers the §4.8 hoist; Phase 8.4 confirms scope at the §32.8 endpoint surface and adds the 31-code enumeration as a deterministic deliverable for v7.1.1 stamp-gate."
- **D-V8.4-002:** Severity P1 confirmed — prompt-required critical-code confirmation. Sub-instance of D-V8.4-001 / D-1.7-014; filed separately for tracker visibility.
- **D-V8.4-003:** Severity P1 confirmed — billing-domain HTTP-status drift. P0 considered but rejected: both codes terminate in customer block (no double-charge or revenue leakage), so per Severity rule P0(d) not triggered. Recommendation sharpened to retire `ai_wallet_exhausted` and adopt `wallet_hard_capped` HTTP 402 (matching §4.8.3 state-machine emission).
- **D-V8.4-004:** Severity P1 confirmed — counterfactual gap. Recommendation sharpened: `vendor_opt_out_blocks_capability | 403`. Pair with §4.4.8 / §4.8.1 / §21.4.
- **D-V8.4-005:** Severity P1 confirmed — catalog-wide retryability column missing. Recommendation: introduce `retryable ∈ {transient, permanent, conditional, idempotent_retry_only}` column; backfill ~149 rows; CI gate `appendix_i_retryability_completeness`.
- **D-V8.4-006:** Severity P1 confirmed — endpoint cross-reference missing for 7 legacy tables. Recommendation: add `used_by` column; backfill via §32 reverse-pass.
- **D-V8.4-007:** Severity P1 (P0 considered but held) — `console_isolation_violation` 403 directly contradicts §7.2 firewall non-leak. Hostile reviewer pressed: "Why not P0?" The current row description scopes it to "Attempted cross-console data access (e.g., Buyer Console accessing Seller data)" — exactly what §7.2 requires 404 for. The 403 IS a firewall-existence-leak path. Promoted to **P0**.
- **D-V8.4-008:** Severity P1 confirmed — phantom endpoint. Method (GET/POST) ambiguity reinforces ambiguity P1. Recommendation: author §32.8.24.
- **D-V8.4-009 / -010:** Severity P3 hygiene. No tightening.
- **D-V8.4-011:** Severity P3. Recommendation accepted: move both rows to dedicated sub-sections (Internal Integrity Events; Polling Payload Flags).
- **D-V8.4-012:** Severity P2. Recommendation: add `Sourcera-Error-Subkind` header convention.
- **D-V8.4-013:** Severity P2. Recommendation: add `localization_key` column; new §M.5 CI gate.
- **D-V8.4-014:** Severity P2. Recommendation: split into `mcp_token_revoked` / `mcp_token_expired`.
- **D-V8.4-015:** Severity P2 — Phase 8.2 webhook walk did not name this gap by code; net-new finding.
- **D-V8.4-016 / -017:** Severity P3 hygiene.
- **D-V8.4-018:** Severity P1 — three-way HTTP-status drift on a single firewall denial (Appendix I 403 vs §22.18 prose 404 vs §22.18 AC #73 422). Cross-link to D-V8.4-007 (parallel issue on `console_isolation_violation`).
- **D-V8.4-019:** Severity P1 confirmed — billing-runtime gap. Critical-code confirmation list partial coverage.
- **D-V8.4-020:** Severity P3 — convention drift across cooldown axis.

Final cluster: 0 P0 elevation candidates → after self-challenge, **1 P0** (D-V8.4-007); 9 P1; 5 P2; 5 P3.

---

## 9. Counterfactual Pass — Per-Surface Failure Modes

| Surface | Failure mode the catalog must handle | Status | Reference |
|---|---|---|---|
| AIOperation contest | Filed past 14d window | **Missing in Appendix I** | D-V8.4-002 |
| AIOperation contest | Concurrent contest filings | Covered | `contest_already_filed` (referenced; not catalog-registered) |
| AIWallet | Hard-cap reached during settlement | **HTTP-status drift** | D-V8.4-003 |
| AIWallet | Auto-topup card declined at runtime | **Missing** | D-V8.4-019 |
| AIWallet | Auto-topup misconfigured | Covered | `wallet_autotopup_*` cluster |
| Capability | Plan-tier insufficient | Covered | `capability_requires_plan_upgrade` |
| Capability | Vendor opt-out blocks invocation | **Missing** | D-V8.4-004 |
| Capability | Console mismatch | Covered | `capability_console_mismatch` |
| Defense View | All 5 v7.1.0 codes | Covered | Lines 44110–44114 |
| KB MCP | Session token expired | Conflated with revoked | D-V8.4-014 |
| KB Export | Cross-console denial status | **Three-way drift** | D-V8.4-018 |
| Webhook | Endpoint quarantined / circuit-broken | **Missing** | D-V8.4-015 |
| §32 audit-events export | Endpoint contract | **Phantom** | D-V8.4-008 |
| Cross-console firewall | Legacy 403 vs new 404 | **Drift / leak** | D-V8.4-007 (P0) |

---

## 10. Promotion to DEFECT_LEDGER.md

Promoting 20 findings as `D-V8.4-001` through `D-V8.4-020`. See ledger.

Severity roll-up:
- **P0:** 1 (D-V8.4-007 — `console_isolation_violation` 403 contradicts §7.2 firewall non-leak invariant; promoted from P1 in self-challenge pass).
- **P1:** 9 (D-V8.4-001, -002, -003, -004, -005, -006, -008, -018, -019).
- **P2:** 5 (D-V8.4-012, -013, -014, -015, -020).
- **P3:** 5 (D-V8.4-009, -010, -011, -016, -017).
- **Total:** 20.

## 11. Halt-Rule Evaluation

Halt rule "zero unresolved P0 in Appendix I surface" — **FAIL** (1 P0: D-V8.4-007). Per `Audit_Prompts.md → Global Verification Protocol`: "If any V prompt finds an unresolved P0 or P1 defect, STOP. Do not advance." Phase-8.4 V verification SHOULD halt advancement to Phase 8.5 / Phase 9.2 until D-V8.4-007 resolved or downgraded with documented rationale.

**Note:** This is a Prompt 8.4 walk (audit, not V verification). Halt-rule applies at the V prompt; Prompt 8.4 promotion to ledger is non-blocking. Phase 8 V verification owner must evaluate D-V8.4-007 before advancing.

## 12. Cross-References

- `DEFECT_LEDGER.md` — Phase 8.4 cluster D-V8.4-001 through D-V8.4-020.
- `COVERAGE_MATRIX.md` — Phase 8.4 prescription appended; Appendix I-as-feature row tightened on `error_codes` axis.
- Parent / forwarded defects:
  - D-1.7-014 — §4.8 Appendix I per-name-only catalogue (parent of D-V8.4-001 / -002).
  - D-1.6-002 — 6 Console Bridge error codes referenced inline as "(new; Appendix I)" but unregistered (parallel cluster).
  - D-3.3-022 — `token_revoked`, `token_expired`, `plan_limit_exceeded`, `session_expired`, `plan_upgrade_required`, `domain_already_claimed` not in Appendix I (parallel cluster on §6 emit paths).
  - D-V8.1-001 — §32.5 endpoints listed without per-endpoint contract (parent of D-V8.4-008 phantom-endpoint instance).
  - D-V8.1-010 — `kb_export_archive_integrity_failed` HTTP 502 vs 410 drift (parallel cluster on KB Export firewall axis).
  - D-V8.1-020 — `idempotency_key_body_mismatch` not registered in Appendix I (parallel `idempotency_key_request_mismatch` axis).
  - D-V8.1-026 — `BriefingDocument` entity referenced from §32.5 + Appendix I but not defined in §4 (parallel entity-vacuum cluster).
- AE rows queued:
  - AE-V8.4-01 — Authored remediation contract for D-V8.4-007 (`console_isolation_violation` deprecation + migration to domain-scoped 404 codes). Pre-existing surface change requires owner sign-off.
  - AE-V8.4-02 — Authored remediation contract for D-V8.4-005 (catalog-wide `retryable` column introduction).
  - AE-V8.4-03 — Authored remediation contract for D-V8.4-013 (catalog-wide `localization_key` column introduction).

## 13. Sign-Off

- Walk depth: ~149 code rows + reverse pass on §31 / §32 / §5.11 / §34.1 / §34.8 / §22.18 / §13.11 / §13.12.
- Self-challenge revisions: D-V8.4-007 promoted P1 → P0; D-V8.4-003 P0 considered, held at P1 (no revenue-leakage path).
- Counterfactual pass: 14 surface failure modes evaluated; 7 surface defects promoted.
- Halt-rule: Phase-8.4 walk delivers; Phase-8 V verification owner inherits D-V8.4-007 P0 evaluation.
- Phase-8.4 status: **complete** (2026-05-08).
