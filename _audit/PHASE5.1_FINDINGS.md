# Phase 5.1 — §9 Seller Teams & Triage Audit Findings

**Prompt:** `Audit_Prompts.md` → Prompt 5.1 — Seller Teams & Triage (§9).
**Run:** local-cowork-2026-05-06. Non-destructive (no Master Spec edits).
**Scope walked:** §9.1 Seller Team Architecture, §9.2 Seller Triage Queue & Auto-Mapping, §9.3 Vendor Response Drafting & Capability Declarations, §9.4 Response Quality & AI Assistance, plus paired §4.2.4 Team, §4.4.2 Bid Response, §4.4.4 Capability Declaration, §8.3.3 Triage Queue ACs, §22.10 / §22.11 / §22.16 KB Engineering, §25.5 Materialization Protocol, §32.5 API endpoints, §34.14 Seller Rate Card, §39 Object Size Constraints, §44.2 Agent Performance Budgets, Appendices C / D / G / I / J / K / L / M.

**Master Spec baseline:** v7.1.0 (2026-04-28). No drift detected at audit start.

**Defect numbering:** D-5.1-NNN per Audit_Prompts.md → Defect Ledger Format. 45 findings filed: 24 P1, 16 P2, 5 P3.

---

## 1. Findings (pre-promotion)

### 1.1 §9.1 Seller Team Architecture — dual-defined entity

§9.1.1 declares a "Seller Team" entity with a 7-field property table (`id`, `organization_id`, `console`, `name`, `description`, `kb_category`, `status`). The canonical Team entity is §4.2.4 (line 3676), which is a buyer/seller-shared 11-field schema with full audit-trail conformance (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` per §4.1 Principle #2 — D-1V-006 remediation, 2026-04-29). §9.1.1 either supplements or contradicts §4.2.4; both being present is a dual-defined entity.

The §9.1.1 schema is missing every audit-trail timestamp, has no scope-isolation declaration, no required indexes, no retention rules, no DSAR clause, no FK soft-delete cascade behavior, no residency clause. The `status: active | soft_deleted` enum collides with §4.2.4's `deleted_at` soft-delete sentinel pattern — two soft-delete patterns for the same entity. The `kb_category` field is unique to §9.1.1 and never registered in §4.2.4 or Appendix J.

Convention #1 (entity definition), #4 (glossary), #9 (retention), #10 (numerical singletons), #13 (firewall integrity).

### 1.2 §9.2 Triage Queue & Auto-Mapping — broken determinism citations

§9.1.3.3 line 11197 routes auto-mapping ties through "§8.3.3.6"; §9.2.4.1 line 11247 routes auto-mapping ties through `Appendix J seller_auto_mapping_tiebreaker_enum` — a four-rung order (`kb_category` exact match, historical_acceptance_rate within trailing 90 days, team_size descending, lexicographic team_id). §8.3.3.6 (line 10999) describes the same first three rungs but does NOT include the lexicographic team_id final tiebreaker. Two sources, two readings, divergent determinism guarantees.

The cited Appendix J enum `seller_auto_mapping_tiebreaker_enum` is absent — grep across the entire spec returns only the §9.2.4.1 reference itself. The cited Appendix J enum `kb_category_enum` (§9.1.3.1 line 11183) is also absent. Both are referenced in cross-Org rejection logic but unimplementable because the enums have no values.

§9.2.3 documents triage queue state transitions in prose only: `new → in_review → assigned → response_submitted → resolved`, plus `* → declined`. Convention #5 mandates a From/To/Trigger/Conditions/Notes table; the canonical seller-side state machine lives in §8.3.3.2 ACs (also prose). Neither §9 nor §8.3.3 cleaves a state-machine table into Appendix L.

§9.2.4.2 inlines a 500-char cap on the manual remap `reason` field. §9.2.4.1 inlines a 90-day window on historical-acceptance-rate. §9.2.4.3 inlines the literal "[DECLINED]" suffix. None has a §39 / §44 / §40.2 single-source row. Convention #10.

The §9.2 audit-row events `requirement_auto_mapped`, `requirement_remapped`, `vendor_response.declined` are not registered in Appendix C (notification catalog) or Appendix G (PostHog taxonomy). Per Conventions #6 / #7, audit/webhook events must be catalog-registered with HMAC signing, idempotency, retry, DLQ, and payload-size contracts.

§9.2.4.1 "If no eligible Team exists, the Requirement enters Org-level 'Default Inbox' with `team_id = null` and an Org-level alert fires per §29." The "Default Inbox" entity is not defined elsewhere; §29 (Email & Notifications) does not register an Org-level "no eligible team" alert.

### 1.3 §9.3 Vendor Response Drafting — entity-name and enum drift

§9.3.1 declares a "Vendor Response" entity with 9 fields. The canonical entity is §4.4.2 "Bid Response" with 22 fields, including `bid_workspace_id`, `requirement_id`, `question_text`, `answer_text`, `answer_type`, `attachment_ids`, `status`, `submitted_at`, `display_order`, `response_lock`, `lock_reason_public`, `needs_reverification`, `reverification_reason`, `reverification_source_version`, `last_applied_source_version`, indexes, retention, residency, full audit-trail timestamps. **Same entity, two definitions, different names, different fields, mutually exclusive enums.**

Status enum contradiction:
- §9.3.1 (line 11281): `draft | in_review | submitted | withdrawn`.
- §4.4.2 (line 4614): `draft | submitted | acknowledged | archived_by_buyer_remove`.

Field-name drift:
- §9.3.1 `vendor_organization_id` vs §4.4.2 `bid_workspace_id` (org via FK).
- §9.3.1 `content` (RichText) vs §4.4.2 `answer_text` (String 0–50000 chars).
- §9.3.1 has `assigned_to_user_id` and `capability_declarations` (Array of UUIDs) — both absent from §4.4.2.
- §4.4.2 has `response_lock`, `lock_reason_public`, `needs_reverification`, `reverification_reason`, `reverification_source_version`, `last_applied_source_version` — all absent from §9.3.1.

Neither §9.3.1's enum nor §4.4.2's enum is **actually** registered in Appendix J. The §25.5 narrative claims (lines 20599, 20643) state Appendix J registers `bid_response_status` but only `bid_response_reverification_reason` appears in Appendix J body (line 46729). The CI gate `appendix_j_enum_completeness` does not catch this miss.

§9.3.3.1 transitions are documented in prose (Convention #5 violation). Appendix L has no Bid Response state machine; Appendix D's "Response Status State Machine" is for the **buyer-side** §4.3.5 Response (states `pending | draft | submitted | locked | needs_reverification`) — not the seller-side Bid Response.

§9.3.2 Capability Declaration:
- Field table is malformed — single-line pipe row at line 11290.
- 9 fields vs §4.4.4's 25+ fields with state machine, invariants, write-path rules, ACs, error codes, PostHog events, and explicit Appendix J enum registrations.
- Drift: §9.3.2 `vendor_organization_id` vs §4.4.4 `org_id`; §9.3.2 `team_id` (does not exist on §4.4.4); §9.3.2 `title` vs §4.4.4 `name`; §9.3.2 `evidence` (RichText) vs §4.4.4 `evidence_kb_entry_ids` Array[UUID]; §9.3.2 `reuse_count` (does not exist on §4.4.4).
- §9.3.2 prose at line 11298: "Declarations may be marked private (team-only) or shared across vendor Organization." No `visibility` field on §9.3.2 nor §4.4.4 — schema affordance absent.
- §9.3.3.2 declares `capability_declaration_version_at_submit` snapshot — not a field on §9.3.1 nor §4.4.2 BidResponse.
- §9.3.3.2 declares "soft-delete is permitted with a 30-day recovery window (mirrors §8.2 semantics)"; §4.4.4 line 4730 declares "soft-deleted rows retained 180 days for Ops audit." 30 vs 180 day retention conflict for the same entity.

§9.3.3.3 cites `§39 (vendor_response_body_max_chars)` for the `content` length cap. §39 has no row called `vendor_response_body_max_chars`. The closest row is `Response | answer_text / answer_informational | 50,000 chars` (line 31250) — that row is the buyer-side §4.3.5 Response, not the seller-side Bid Response. The §9 citation is to an invented §39 row name.

§9.3.3.4 declares "PostHog `vendor_response_drafted`, `vendor_response_submitted`, `vendor_response_withdrawn`, `capability_declaration_reused` events registered in Appendix G with standardized properties." None of these events appear in Appendix G — grep across the spec returns zero hits. The AC line claims registration that does not exist.

§9.3.3.4 audit row schema specifies `phase_at_submit` field — not registered on §4.4.2 BidResponse. The audit projection is non-implementable as written.

Error codes declared in §9.3 ACs and unregistered in Appendix I: `vendor_response_invalid_transition` (HTTP 409), `vendor_response_submitted_at_immutable` (HTTP 422). Convention #6 violation.

§9.3.3.1 AC: `* → withdrawn (Phase ≤ 7 only)`. What about Phase 8+? Spec is silent on whether withdrawal is rejected and which error code fires. §23.4 "Vendor Voluntary Withdrawal" (cited indirectly via §9.3.3.1) does not constrain to Phase ≤ 7.

### 1.4 §9.4 AI Response Generation — entitlement and observability gaps

§9.4.3.1 gates AI Response Generation on `seller_org.ai_response_generation_enabled = true`. This Boolean is not a field on §4.4 SellerOrg or §4.2.1 Organization — schema affordance absent.

§9.4.3.1 cites "the Org's seller plan including the AI feature per §34.14." §34.14 is the **Seller Rate Card** (per-capability outcome pricing); plan-tier feature inclusion lives in §34.1.2 (Seller Plan Tier Definitions) and §5.11 (Feature Access Matrix). §34.1.2 has no "AI Response Generation" feature row; §5.11 has no row either. Plan-gating is unwireable as written. Convention #8.

§9.4.3.1 cites `§44.2 Agent Performance Budgets` for "p95 ≤ 8 s for drafts ≤ 2,000 chars." §44.2 enumerates pre-score per-requirement latency (Haiku 5–10s, Sonnet 10–30s, Opus 30–60s) and full-Workspace pre-score budgets — no AI Response Generation latency row. The 8s SLO has no §44 home.

§9.4.3.1 cites HTTP 402 `ai_wallet_exhausted`. Appendix I (lines 43194, 43219) registers `ai_wallet_exhausted` as **HTTP 403**, not 402. HTTP-status-code conflict. Note that Appendix I has duplicate `ai_wallet_exhausted` rows (43194 and 43219) — separate hygiene defect carried over from Phase 8.

Error codes declared in §9.4 ACs and unregistered in Appendix I: `feature_requires_paid_plan` (HTTP 402), `ai_response_generation_unavailable` (HTTP 503).

§9.4.3.2 cites "the public Vendor Response API (§32.5)" for the `ai_suggested = true` flag query. §32.5 (lines 26418+) registers no Vendor Response endpoint family. Buyer-side responses live at `/v1/workspaces/{workspace_id}/responses`; seller-side bid response endpoints are not in §32.5. The cross-reference is unresolvable.

§9.4.3.2 inlines "rejected suggestions MUST be retained for 90 days for QA / model-eval purposes (§22.16)." §22.16 is the KB Observability & Evaluation section; no 90-day rejected-suggestion retention row appears there. Convention #10 (retention numerics belong in §40.2 with single source).

§9.4.3.3 says "Hallucination guardrail per §21.3 MUST flag responses." §21.3 is the **buyer-side** Sourcera Agent Guardrails section. The seller-side KB-grounding guardrail (§22.16.1 six-layer model with `cite_verify` and `kb_injection_scanner`) is the actual canonical home. Mis-cited.

§9.4.3.3 mandates CI gate `ai_response_generation_billing_consistency` (and §9.3.3.2 mandates `capability_declaration_reuse_count_consistency`). Neither is registered in Appendix M.5 (37-gate catalog) nor §M.4 CI gate spec. Per Phase 14.18 enforcement (CLAUDE.md §16), CI gates must be enrolled in Appendix M.5.

DSAR cascade: §9.4.3.2 declares `ai_suggested_payload_hash`, `approved_by_user_id` written to the Vendor Response audit row. PII-bearing approver and AI generation payload have no DSAR cascade declaration. Convention #9.

### 1.5 Surface/Engine Mapping (Appendix M)

Appendix M.1 has zero rows for §9 surfaces. Specifically missing:
- Seller Team Architecture (§9.1) — engine concept with `kb_category` field, role permissions.
- Seller Triage Queue (§9.2) — `new/in_review/assigned/response_submitted/resolved/declined` lifecycle.
- Auto-Mapping (§9.2.1) — engine concept that produces `mapping_rationale`.
- Manual Remap (§9.2.2) — surface (Change Team CTA) + engine (audit row).
- Decline-to-Bid (§9.2.3) — surface (Decline to Bid CTA) + engine (`vendor_response.declined` audit).
- Vendor Response Drafting (§9.3.1) — surface (drafting composer) + engine (Bid Response).
- Capability Declaration drag/drop UI (§9.3.2) — surface (composer panel).
- AI Response Generation (§9.4.1) — surface ("Generate Response with AI" CTA) + engine (Managed Agent invocation).
- AI Suggestion Approval (§9.4.2) — surface (approval modal) + engine (Vendor Response audit row).
- [AI-SUGGESTED] badge (§9.4.1) — surface UX token.

Per Appendix M's "no row, no merge" rule (line 47863), §9 violates the `appendix_m_coverage_on_diff` CI gate. This is a P1 in the rule schema, not P3 hygiene.

### 1.6 Console Firewall Citations (§7.2 vs §1.3)

§9.1.3.1 line 11185 and §9.2.4.4 line 11265 cite "(non-leak per §7.2 firewall)." §7.2 is the "Organization Deletion Cascade" section; the canonical firewall section is §1.3 ("Dual-Console Data Isolation Model"). The §7.2 mis-citation echoes a known meta-defect across the spec (other sections also cite §7.2 for firewall behavior — e.g., §4.3.14 PresenceRecord, §4.3.17 Pro Trial Seat Grant, Appendix L.1, Appendix L.3) but is observable in §9 specifically and should be normalized.

### 1.7 Glossary (Appendix K)

§9 uses these multi-section terms without Appendix K registration: "Triage Queue," "Vendor Response," "Auto-Mapping," "Decline-to-Bid," "Capability Declaration" (the §9 narrative term distinct from §4.4.4's strict entity definition), "AI Response Generation," "[AI-SUGGESTED] badge," "Default Inbox," "Manual Remap." Convention #4. (Appendix K does have entries for "Capability Category" (§22.7) and various §4.4 marketplace terms; the §9 narrative names of these surfaces are not registered.)

### 1.8 RBAC drift (§9.1.2 vs §5)

§9.1.2 redocuments role permissions for Seller Team Owner / Lead / Member. RBAC is canonically in §5 (seller-side roles in §5.5). The §9.1.2 prose drifts from §5 in detail — e.g., "Approve AI-suggested responses" appears only at §9, never in §5 role tables — and this drift is the source-of-truth ambiguity for any future SCIM directory-group → role mapping or WorkOS FGA Custom Role authoring. P3 consistency_drift; should cite §5 not redefine.

### 1.9 Capability Declaration entity-name normalization

§9 calls the entity "Capability Declaration" matching §4.4.4 ("Capability Declaration"). However, §22.14.3 calls the same entity "CapabilityDeclaration" (one word, code-style); §27.4 / §22.18.3.5 reference `CapabilityDeclarationSuggestion` (same one-word convention). The §9 narrative entity name is inconsistent with the §4.4.4 → §22 → §27 chain on whitespace. Tracked as P3 glossary terminology for v7.1.1 spec hygiene.

### 1.10 PostHog Event Naming Inconsistency

§9.3.3.4 declares PostHog events as `vendor_response_drafted`, `vendor_response_submitted`, `vendor_response_withdrawn`, `capability_declaration_reused` — using the entity-name prefix in lowercase_underscore form. §4.4.4 (line 4736) registers `capability_declaration_created`, `capability_declaration_published`, `capability_declaration_type_promotion`, etc. — same convention. But cross-section conventions elsewhere (§25.5) use dot-notation, e.g., `seller.bid_response.locked`, `seller.bid_response.reverted`. Two PostHog event naming styles coexist; §9 is internally consistent with §4.4.4 but neither section cites the convention. Tracked as part of D-5.1-015 / D-5.1-045.

---

## 2. Counterfactual Pass

### 2.1 §9.1 Seller Team Architecture
1. **Two Team Owners simultaneously change `kb_category`.** §9 silent on optimistic-concurrency or last-writer-wins. Convex-default last-writer-wins MAY produce a state where the `(org_id, kb_category)` namespace mapping is inconsistent with the §22.3 KB ingestion namespace. Failure mode unhandled.
2. **`kb_category` enum value retired (deprecated by Ops).** §9 silent on cascade. Teams pointing to the retired category — auto-remapped, locked, or `kb_ingestion_namespace_unresolvable`? §22.7 deprecation flow does not name `kb_category` as a consumer. Failure mode unhandled.
3. **Team Owner soft-deleted (User leaves Org).** §9 silent on Team-Owner-vacancy. Does Lead auto-promote? Does the Org Admin become an implicit fallback? §5 has the Replacement Pattern for `billing_admin` (org_owner fallback) but not for Team Owner. Failure mode unhandled.

### 2.2 §9.2 Triage Queue & Auto-Mapping
1. **Auto-mapping failure (Convex outage during the requirement publish handler).** §9 silent. Does the Requirement enter Default Inbox immediately? Retry? DLQ? §44.1 declares the 500 ms reactive SLO; Convex outage handling is silent for §9.2. Failure mode unhandled.
2. **Cross-residency Requirement (buyer EU, seller US) reaches the auto-mapper.** §9 silent on residency-tie-break. §4.4.1 BidWorkspace has elaborate residency partition logic with `bid_workspace_residency_lock_violation` error code; §9.2 doesn't carry that assertion to the auto-mapping path. Failure mode unhandled.
3. **Manual remap during a buyer-side `requirement_amended` event in flight.** Race condition on `last_applied_source_version` (§4.4.2 / §25.5.5). §9.2.4.2 Manual Remap silent on concurrency with the Console Bridge handler. Failure mode unhandled.
4. **All eligible Teams at capacity (concurrent invited bids per §34.1.2 reached).** §9 silent. Does mapping skip the Team? Default Inbox? Reject the publish with HTTP 422? Failure mode unhandled.

### 2.3 §9.3 Vendor Response Drafting
1. **Bid Workspace residency = `us`, Seller Org residency = `eu`.** §4.4.1 handles this with the Residency Tie-Break (D-1V-007 remediation). §9.3 prose silent — doesn't carry the residency assertion to the response level or to the Capability Declaration evidence cross-residency case.
2. **Capability Declaration deleted while referenced by an in-progress draft Vendor Response.** §9.3.3.2 says soft-delete with 30-day window for "≥ 1 submitted Vendor Response," but in-progress drafts are not addressed. Stale-reference render behavior undefined.
3. **Two Team Members open the same Vendor Response simultaneously.** §9.3.3.3 says "§23.2 response-lock" is the gate; second author gets a read-only view with the lock holder name. §23.2 lock semantics are response-level, not draft-level — lock for `status=draft` is undefined. Failure mode unhandled.

### 2.4 §9.3.2 / §4.4.4 Capability Declarations
1. **Buyer-side scoring against a `narrative_only` Capability Declaration.** §4.4.4 line 4768 says Match-Score MUST exclude `narrative_only`. §9.3 prose doesn't echo. Surface promise vs engine reality drift.
2. **Capability Declaration `evidence` (RichText per §9.3.2) attached to a submitted Vendor Response, then the underlying KB entry is redacted via §22.16.7 `kb_injection_scanner`.** §9 silent on cascade. Snapshot preserve? Mark redacted? Re-publish? Failure mode unhandled.
3. **Capability Declaration referenced by a submitted Vendor Response is rejected by Ops in §4.4.4 review.** §9.3.3.2 says "preserves a `capability_declaration_version_at_submit` snapshot for audit" but the field is unregistered. The rejection cascade leaves a dangling reference. Failure mode unhandled.

### 2.5 §9.4 AI Response Generation
1. **AIOperation settles `cost_price` higher than authored floor.** §34.14.1 declares `cost_base_below_price_drift` alert behavior; §9.4 doesn't bind. Failure mode unhandled.
2. **Anthropic API outage mid-generation (after streaming starts).** §9.4.3.3 returns HTTP 503 for fresh requests but in-flight streaming partial-output handling is undefined.
3. **AI suggestion approved by Team Lead, then the underlying Capability Declaration is deprecated before submission.** §9 silent. Does the suggestion auto-invalidate? Re-approve? Cascade to `[AI-SUGGESTED]` badge state? Failure mode unhandled.
4. **`ai_response_generation_enabled = false → true` transition mid-Workspace.** §9 silent on mid-state transition. Existing draft responses re-eligible? New requirements only? Failure mode unhandled.

---

## 3. Self-Challenge Pass (Opus-Mandatory)

The self-challenge pass re-read every defect as a hostile reviewer asking: (a) is the evidence reproducible? (b) is severity rule-based? (c) is the recommendation sharper than "fix it"?

Revisions made in place during this pass:

- **D-5.1-001** initially classified P2; revised to P1 because the `status: active | soft_deleted` enum directly **conflicts** with the canonical §4.2.4 `deleted_at` soft-delete sentinel — two different soft-delete patterns for the same entity is unbuildable (Convention #1, "missing field-level schema" test).
- **D-5.1-002 / D-5.1-003** tested for P0 escalation under the Severity rule "(b) exposes PII or PCI scope to an unintended actor." Held at P1 — the entity-definition drift is unbuildable but does not cross the firewall on its own. Caveat: a junior engineer building from §9.3.1 alone with the `vendor_organization_id` field name (rather than the canonical `bid_workspace_id` FK) would mis-scope the row at the Convex query layer; this is a near-P0. P1 stands.
- **D-5.1-009** (HTTP 402 vs 403 on `ai_wallet_exhausted`) tested for P0 under "(d) leaves a billing surface ambiguous in a way that allows revenue leakage." Held at P1 — the divergence is between §9 declaration and Appendix I registration; clients would receive HTTP 403 (the registered code) and §9's documentation would be wrong, but no double-charge or revenue leakage results. P1 stands.
- **D-5.1-014** (audit-row events not in Appendix C) tested for P0 under "(c) audit-log integrity." Held at P1 — Appendix C is the **notification** event catalog; audit rows live in §4.6 AuditEvent. The defect is that the events are referenced as `requirement_auto_mapped` / `requirement_remapped` / `vendor_response.declined` without being catalog-registered in either §4.6 audit event taxonomy OR Appendix C OR Appendix G — a triple miss. P1 stands.
- **D-5.1-021** (Appendix M.1 zero rows for §9 surfaces) tested for P0 under "(e) leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable." Held at P1 — the `appendix_m_coverage_on_diff` CI gate is a §M.4 spec-binding contract (one of the four runtime-active gates per CLAUDE.md §16); a §9 PR would fail the gate and the spec change would be blocked. The runtime gate is wireable; the failure mode is the spec author's, not the CI gate's. P1 stands. **However:** because §M.4 is runtime-active, this is the most operationally consequential defect filed in this prompt.
- **D-5.1-027 / D-5.1-029 / D-5.1-030** initially merged as a single "schema affordance absent" defect; split into three separate rows because each names a distinct missing schema affordance and remediation owner.
- **D-5.1-038 / D-5.1-039** initially merged as a single "CI gates not registered in Appendix M.5" defect; split because the two gates have different semantics, different remediation surfaces, and different Phase 14.18 wiring paths.
- **D-5.1-019** (90-day historical-acceptance window) tested for downgrade to P2 because the absence of a single-source row is a citation-hygiene concern. Held at P1 — the 90-day window directly governs auto-mapping determinism (an AC); a future change to the window in §44/§39 would silently leave §9 inconsistent. Convention #10 P1 rule applies.
- **D-5.1-024** (plan-gating cited to §34.14 instead of §34.1.2 / §5.11) tested for P0 under "(d) billing-surface ambiguity." Held at P1. The §34.14 mis-citation does not allow over- or under-billing per se because §34.14.1 IS the rate card and the per-capability rate WOULD be charged correctly via the AIOperation engine; the defect is that no plan-tier feature-inclusion gate exists. A buyer Free / Solo seller could invoke AI Response Generation if the seller_org boolean is true, with no plan-tier entitlement check. That is a **P0** if a Free seller could obtain AI Response Generation while the Free plan is not authoritatively a paying tier — but §34.1.2 cell `first_pass_rfp_draft = "All seller plans; Free = 25 lifetime"` means the engine DOES allow Free plan invocation up to the Free Allowance. So plan-gating is consistent at the engine level; the §9.4.3.1 prose is just citing the wrong table. Held at P1.
- **D-5.1-006 / D-5.1-007** (unregistered enums) tested for P0 under enum-completeness firewall risk. Held at P1 — the enums are referenced by API contract logic and unimplementable as written, but no firewall leakage results.

No defects were demoted. Three defects were promoted from P2 → P1 during the self-challenge pass (D-5.1-001, D-5.1-006, D-5.1-007) on the "junior engineer would build the wrong thing" tiebreaker rule.

---

## 4. Promotion to Defect Ledger

All 45 findings promoted to `/Sourcera/_audit/DEFECT_LEDGER.md` as rows D-5.1-001 through D-5.1-045. Coverage matrix cells updated for F-197, F-198, F-199, F-200, F-201, F-202, F-203, F-204, F-205, F-206, F-207, F-208 (and F-192 cross-reference) per the matrix-cell table at end of this log.

### 4.1 Coverage matrix cell deltas (this prompt)

| Feature | Cell | Before | After | Driving defects |
|---|---|---|---|---|
| F-197 Seller Team Architecture | data_model | ⚠ | ❌ | D-5.1-001 |
| F-197 Seller Team Architecture | enums | ⚠ | ❌ | D-5.1-005, D-5.1-006 |
| F-197 Seller Team Architecture | acceptance_criteria | ⚠ | ⚠ partial | D-5.1-001 (audit-trail and indexes ACs missing) |
| F-197 Seller Team Architecture | retention | ⚠ | ❌ | D-5.1-022 |
| F-197 Seller Team Architecture | dsar | ⚠ | ❌ | D-5.1-023 |
| F-197 Seller Team Architecture | residency | ⚠ | ❌ | D-5.1-022 |
| F-197 Seller Team Architecture | console_firewall | ⚠ | ⚠ partial | D-5.1-041 (mis-cited §7.2) |
| F-197 Seller Team Architecture | glossary | ⚠ | ❌ | D-5.1-042 |
| F-197 Seller Team Architecture | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-198/199/200 Role Definitions | rbac | ⚠ | ❌ | D-5.1-044 |
| F-201 Seller Triage Auto-Mapping | enums | ⚠ | ❌ | D-5.1-007 |
| F-201 Seller Triage Auto-Mapping | acceptance_criteria | ⚠ | ❌ | D-5.1-025, D-5.1-034 |
| F-201 Seller Triage Auto-Mapping | numerical_singleton | ⚠ | ❌ | D-5.1-019 |
| F-201 Seller Triage Auto-Mapping | webhook | ⚠ | ❌ | D-5.1-014 |
| F-201 Seller Triage Auto-Mapping | posthog_events | ⚠ | ❌ | D-5.1-014 |
| F-201 Seller Triage Auto-Mapping | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-202 Manual Team Remap | error_codes | ⚠ | ❌ | D-5.1-008 |
| F-202 Manual Team Remap | numerical_singleton | ⚠ | ❌ | D-5.1-018 |
| F-202 Manual Team Remap | api | ⚠ | ❌ | D-5.1-013 |
| F-202 Manual Team Remap | webhook | ⚠ | ❌ | D-5.1-014 |
| F-202 Manual Team Remap | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-203 Decline-to-Bid | webhook | ⚠ | ❌ | D-5.1-014 |
| F-203 Decline-to-Bid | api | ⚠ | ❌ | D-5.1-013 |
| F-203 Decline-to-Bid | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-204 Vendor Response Drafting | data_model | ⚠ | ❌ | D-5.1-002 |
| F-204 Vendor Response Drafting | enums | ⚠ | ❌ | D-5.1-004 |
| F-204 Vendor Response Drafting | state_machine | ⚠ | ❌ | D-5.1-010 |
| F-204 Vendor Response Drafting | error_codes | ⚠ | ❌ | D-5.1-008 |
| F-204 Vendor Response Drafting | api | ⚠ | ❌ | D-5.1-012, D-5.1-013 |
| F-204 Vendor Response Drafting | numerical_singleton | ⚠ | ❌ | D-5.1-017 |
| F-204 Vendor Response Drafting | retention | ⚠ | ❌ | D-5.1-022 |
| F-204 Vendor Response Drafting | dsar | ⚠ | ❌ | D-5.1-023 |
| F-204 Vendor Response Drafting | residency | ⚠ | ❌ | D-5.1-022 |
| F-204 Vendor Response Drafting | acceptance_criteria | ⚠ | ❌ | D-5.1-026, D-5.1-040 |
| F-204 Vendor Response Drafting | mobile_parity | ⚠ | ❌ | D-5.1-036 |
| F-204 Vendor Response Drafting | accessibility | ⚠ | ❌ | D-5.1-035 |
| F-204 Vendor Response Drafting | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-204 Vendor Response Drafting | glossary | ⚠ | ❌ | D-5.1-042 |
| F-205 Capability Declarations Mgmt | data_model | ⚠ | ❌ | D-5.1-003, D-5.1-027, D-5.1-029 |
| F-205 Capability Declarations Mgmt | acceptance_criteria | ⚠ | ❌ | D-5.1-028 |
| F-205 Capability Declarations Mgmt | retention | ⚠ | ❌ | D-5.1-022, D-5.1-029 |
| F-205 Capability Declarations Mgmt | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-206 Cap Decl Reuse Tracking | acceptance_criteria | ⚠ | ❌ | D-5.1-028 |
| F-206 Cap Decl Reuse Tracking | observability | ⚠ | ❌ | D-5.1-039 |
| F-206 Cap Decl Reuse Tracking | ci_gate_coverage | ⚠ | ❌ | D-5.1-039 |
| F-207 AI Response Generation | data_model | ⚠ | ❌ | D-5.1-030 |
| F-207 AI Response Generation | plan_gating | ⚠ | ❌ | D-5.1-024 |
| F-207 AI Response Generation | api | ⚠ | ❌ | D-5.1-013 |
| F-207 AI Response Generation | error_codes | ⚠ | ❌ | D-5.1-008, D-5.1-009 |
| F-207 AI Response Generation | acceptance_criteria | ⚠ | ❌ | D-5.1-031, D-5.1-032 |
| F-207 AI Response Generation | retention | ⚠ | ❌ | D-5.1-020 |
| F-207 AI Response Generation | observability | ⚠ | ❌ | D-5.1-038 |
| F-207 AI Response Generation | ci_gate_coverage | ⚠ | ❌ | D-5.1-038 |
| F-207 AI Response Generation | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
| F-207 AI Response Generation | accessibility | ⚠ | ❌ | D-5.1-035 |
| F-207 AI Response Generation | mobile_parity | ⚠ | ❌ | D-5.1-036 |
| F-208 AI Suggestion Approval Wf | api | ⚠ | ❌ | D-5.1-012, D-5.1-013 |
| F-208 AI Suggestion Approval Wf | dsar | ⚠ | ❌ | D-5.1-023 |
| F-208 AI Suggestion Approval Wf | retention | ⚠ | ❌ | D-5.1-020 |
| F-208 AI Suggestion Approval Wf | surface_engine_mapping | ⚠ | ❌ | D-5.1-021 |
